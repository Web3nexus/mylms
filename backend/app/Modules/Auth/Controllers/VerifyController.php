<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyController extends Controller
{
    /**
     * Verify OTP code.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 422);
        }

        if ($user->otp_code !== $validated['otp']) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        if (now()->gt($user->otp_expires_at)) {
            return response()->json(['message' => 'Verification code has expired.'], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Resend OTP code.
     */
    public function resendOtp(Request $request)
    {
        $user = auth()->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 422);
        }

        $otp = (string) rand(100000, 999999);

        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        \App\Services\CommunicationService::send($user->email, 'otp_verification', [
            'student_name' => $user->name,
            'otp_code' => $otp
        ]);

        return response()->json(['message' => 'A new verification code has been sent to your email.']);
    }
}
