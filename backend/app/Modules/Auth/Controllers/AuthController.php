<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $otp = (string) rand(100000, 999999);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_STUDENT,
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        // Send OTP via CommunicationService
        \App\Services\CommunicationService::send($user->email, 'otp_verification', [
            'student_name' => $user->name,
            'otp_code' => $otp
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user and return token.
     * Supports dual-identity: Email for Portal, Student ID for Campus.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            'context' => ['sometimes', 'string', 'in:portal,campus'],
        ]);

        $identifier = $validated['identifier'];
        $context = $validated['context'] ?? 'portal';
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);

        // 1. Cross-Exclusion Logic
        if ($context === 'portal' && !$isEmail) {
            return response()->json([
                'message' => 'The Admission Portal requires a verified email address.',
            ], 422);
        }

        if ($context === 'campus' && $isEmail) {
            // Check if this email belongs to a student
            $tempUser = User::where('email', $identifier)->first();
            if ($tempUser && $tempUser->isStudent() && $tempUser->student_id) {
                $appName = config('app.name', 'MyLMS');
                return response()->json([
                    'message' => "Please use your Student ID (Matric Number) to access the {$appName} Campus.",
                ], 422);
            }
        }

        // 2. Identify the field to check
        $field = $isEmail ? 'email' : 'student_id';

        \Illuminate\Support\Facades\Log::info("Login Attempt: Protocol [$context], Identifier [$identifier], Field [$field]");

        // 3. Attempt Authentication
        if (!Auth::attempt([$field => $identifier, 'password' => $validated['password']])) {
            \Illuminate\Support\Facades\Log::warning("Authentication Failed: Identifier [$identifier] - Invalid Credentials.");
            return response()->json([
                'message' => 'Invalid credentials for the selected login protocol.',
            ], 401);
        }

        \Illuminate\Support\Facades\Log::info("Authentication Successful: UserID [" . Auth::id() . "]");

        $user = Auth::user();
        
        // 4. Check Suspension Status
        if ($user->status === 'suspended') {
            Auth::logout();
            return response()->json([
                'message' => 'Your account has been suspended by the administration. Please contact support.',
            ], 403);
        }

        // 5. Record Last Login for inactivity tracking
        $user->update(['last_login_at' => now()]);

        // 6. Final Verification
        if ($context === 'campus' && $user->isStudent() && !$user->student_id) {
            return response()->json([
                'message' => 'Your Student ID has not been generated yet. Please finalize your admission protocol.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Send password reset link to user's email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = PasswordBroker::sendResetLink($request->only('email'));

        if ($status === PasswordBroker::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link has been sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link. Please check your email address.'], 422);
    }

    /**
     * Reset password using the token from the reset email.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $status = PasswordBroker::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'Password has been reset successfully. You can now log in.']);
        }

        return response()->json(['message' => 'Invalid or expired reset token. Please request a new reset link.'], 422);
    }
}
