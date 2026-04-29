<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorAuthController extends Controller
{
    /**
     * Generate a new 2FA secret and return the QR code SVG
     */
    public function generate()
    {
        $user = Auth::user();
        $google2fa = new Google2FA();
        
        $secret = $google2fa->generateSecretKey();
        
        $user->two_factor_secret = encrypt($secret);
        $user->save();

        $appName = config('app.name', 'MyLMS');
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            $appName,
            $user->email,
            $secret
        );

        // Generate SVG using BaconQrCode
        $renderer = new ImageRenderer(
            new RendererStyle(250),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $svg = $writer->writeString($qrCodeUrl);

        return response()->json([
            'secret' => $secret,
            'qr_svg' => base64_encode($svg)
        ]);
    }

    /**
     * Verify the 2FA code to enable it
     */
    public function enable(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $user = Auth::user();
        $google2fa = new Google2FA();

        if (!$user->two_factor_secret) {
            return response()->json(['message' => '2FA secret not generated'], 400);
        }

        $secret = decrypt($user->two_factor_secret);
        
        $valid = $google2fa->verifyKey($secret, $request->code);

        if ($valid) {
            $user->two_factor_enabled = true;
            $user->save();
            return response()->json(['message' => 'Two-Factor Authentication enabled successfully.']);
        }

        return response()->json(['message' => 'Invalid verification code.'], 400);
    }

    /**
     * Disable 2FA
     */
    public function disable()
    {
        $user = Auth::user();
        $user->two_factor_enabled = false;
        $user->two_factor_secret = null;
        $user->save();

        return response()->json(['message' => 'Two-Factor Authentication disabled.']);
    }

    /**
     * Verify 2FA code during Login
     */
    public function verifyLogin(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'code' => 'required|string'
        ]);

        $user = \App\Models\User::findOrFail($request->user_id);

        if (!$user->two_factor_enabled || !$user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled for this user.'], 400);
        }

        $google2fa = new Google2FA();
        $secret = decrypt($user->two_factor_secret);

        if ($google2fa->verifyKey($secret, $request->code)) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        return response()->json(['message' => 'Invalid authentication code.'], 401);
    }
}
