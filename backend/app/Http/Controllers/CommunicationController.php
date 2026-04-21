<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SystemTestMail;

class CommunicationController extends Controller
{
    /**
     * Get all SMTP and identity settings.
     */
    public function getSettings()
    {
        return response()->json([
            'mail_host'         => SystemSetting::getVal('mail_host', config('mail.mailers.smtp.host')),
            'mail_port'         => SystemSetting::getVal('mail_port', config('mail.mailers.smtp.port')),
            'mail_encryption'   => SystemSetting::getVal('mail_encryption', config('mail.mailers.smtp.encryption')),
            'mail_username'     => SystemSetting::getVal('mail_username', config('mail.mailers.smtp.username')),
            'mail_password'     => SystemSetting::getVal('mail_password', '********'), // Masked
            'mail_from_address' => SystemSetting::getVal('mail_from_address', config('mail.from.address')),
            'mail_from_name'    => SystemSetting::getVal('mail_from_name', config('mail.from.name')),
        ]);
    }

    /**
     * Update SMTP and identity settings.
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'mail_host'         => 'required|string',
            'mail_port'         => 'required|integer',
            'mail_encryption'   => 'required|in:tls,ssl,null',
            'mail_username'     => 'nullable|string',
            'mail_password'     => 'nullable|string',
            'mail_from_address' => 'required|email',
            'mail_from_name'    => 'required|string',
        ]);

        foreach ($validated as $key => $value) {
            // Only update password if it's not the masked placeholder
            if ($key === 'mail_password' && ($value === '********' || empty($value))) {
                continue;
            }
            SystemSetting::setVal($key, $value, 'string', 'communication');
        }

        return response()->json(['message' => 'Institutional communication settings updated.']);
    }

    public function sendTestEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // ─────────────────────────────────────────────────────────────
        //  DYNAMIC TEST CONFIGURATION (BYPASSES CACHE/SCHEME ERRORS)
        // ─────────────────────────────────────────────────────────────
        try {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => SystemSetting::getVal('mail_host'),
                'mail.mailers.smtp.port' => SystemSetting::getVal('mail_port'),
                'mail.mailers.smtp.encryption' => SystemSetting::getVal('mail_encryption'),
                'mail.mailers.smtp.username' => SystemSetting::getVal('mail_username'),
                'mail.mailers.smtp.password' => SystemSetting::getVal('mail_password'),
                'mail.mailers.smtp.scheme' => null,
                'mail.mailers.smtp.url' => null,
            ]);

            Mail::to($request->email)->send(new SystemTestMail());
            return response()->json(['message' => 'Test protocol initiated. Check your inbox.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to transmit test protocol. Verify your SMTP credentials.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
