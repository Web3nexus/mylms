<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_STUDENT,
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
                return response()->json([
                    'message' => 'Please use your Student ID (Matric Number) to access the MyLMS Campus.',
                ], 422);
            }
        }

        // 2. Identify the field to check
        $field = $isEmail ? 'email' : 'student_id';

        // 3. Attempt Authentication
        if (!Auth::attempt([$field => $identifier, 'password' => $validated['password']])) {
            return response()->json([
                'message' => 'Invalid credentials for the selected login protocol.',
            ], 401);
        }

        $user = Auth::user();
        
        // 4. Final Verification
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
}
