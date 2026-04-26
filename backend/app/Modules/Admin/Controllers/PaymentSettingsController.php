<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PaymentSettingsController extends Controller
{
    /**
     * Get all payment and security (Turnstile) settings.
     */
    public function index()
    {
        $settings = [
            'paystack_enabled' => (bool) SystemSetting::getVal('paystack_enabled', false),
            'paystack_public_key' => SystemSetting::getVal('paystack_public_key', ''),
            'paystack_secret_key' => $this->maskSecret(SystemSetting::getEncryptedVal('paystack_secret_key', '')),
            
            'flutterwave_enabled' => (bool) SystemSetting::getVal('flutterwave_enabled', false),
            'flutterwave_public_key' => SystemSetting::getVal('flutterwave_public_key', ''),
            'flutterwave_secret_key' => $this->maskSecret(SystemSetting::getEncryptedVal('flutterwave_secret_key', '')),
            
            'turnstile_enabled' => (bool) SystemSetting::getVal('turnstile_enabled', false),
            'turnstile_site_key' => SystemSetting::getVal('turnstile_site_key', ''),
            'turnstile_secret_key' => $this->maskSecret(SystemSetting::getEncryptedVal('turnstile_secret_key', '')),
        ];

        return response()->json($settings);
    }

    /**
     * Update payment gateway and security settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'paystack_enabled' => 'nullable|boolean',
            'paystack_public_key' => 'nullable|string',
            'paystack_secret_key' => 'nullable|string',
            
            'flutterwave_enabled' => 'nullable|boolean',
            'flutterwave_public_key' => 'nullable|string',
            'flutterwave_secret_key' => 'nullable|string',
            
            'turnstile_enabled' => 'nullable|boolean',
            'turnstile_site_key' => 'nullable|string',
            'turnstile_secret_key' => 'nullable|string',
        ]);

        $settings = $request->all();

        // Handle Booleans and Regular strings
        $items = [
            'paystack_enabled' => 'boolean',
            'paystack_public_key' => 'string',
            'flutterwave_enabled' => 'boolean',
            'flutterwave_public_key' => 'string',
            'turnstile_enabled' => 'boolean',
            'turnstile_site_key' => 'string',
        ];

        foreach ($items as $key => $type) {
            if (isset($settings[$key])) {
                SystemSetting::setVal($key, $settings[$key], $type, 'payment');
            }
        }

        // Handle Encrypted Secrets (only if provided and not masked)
        $secrets = [
            'paystack_secret_key',
            'flutterwave_secret_key',
            'turnstile_secret_key'
        ];

        foreach ($secrets as $key) {
            if (isset($settings[$key]) && !empty($settings[$key]) && !str_contains($settings[$key], '****')) {
                SystemSetting::setEncryptedVal($key, $settings[$key], 'payment');
            }
        }

        return response()->json([
            'message' => 'Institutional payment protocols synchronized successfully.',
            'settings' => $this->index()->original
        ]);
    }

    /**
     * Utility to mask sensitive keys for visual safety.
     */
    private function maskSecret($secret)
    {
        if (empty($secret)) return '';
        $len = strlen($secret);
        if ($len <= 8) return '********';
        return substr($secret, 0, 4) . str_repeat('*', $len - 8) . substr($secret, -4);
    }
}
