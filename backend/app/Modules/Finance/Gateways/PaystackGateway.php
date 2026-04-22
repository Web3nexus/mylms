<?php

namespace App\Modules\Finance\Gateways;

use App\Modules\Finance\Interfaces\PaymentGatewayInterface;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\SystemSetting;

class PaystackGateway implements PaymentGatewayInterface
{
    protected $baseUrl = 'https://api.paystack.co';

    private function getSecret()
    {
        return SystemSetting::getEncryptedVal('paystack_secret_key', config('services.paystack.secret'));
    }

    public function initializePayment(Invoice $invoice): array
    {
        $response = Http::withToken($this->getSecret())
            ->post("{$this->baseUrl}/transaction/initialize", [
                'amount' => (int)($invoice->total_amount * 100), // Paystack uses Kobo (cents)
                'email' => $invoice->user->email,
                'reference' => 'PAY-' . uniqid(),
                'callback_url' => config('app.frontend_url') . '/payment/verify',
                'metadata' => [
                    'invoice_id' => $invoice->id,
                    'user_id' => $invoice->user_id,
                    'cancel_action' => config('app.frontend_url') . '/payment/failed'
                ]
            ]);

        if ($response->failed()) {
            throw new \Exception("Paystack Initialization Error: " . $response->body());
        }

        $data = $response->json('data');

        return [
            'checkout_url' => $data['authorization_url'],
            'reference' => $data['reference'],
        ];
    }

    public function verifyPayment(string $reference): bool
    {
        $response = Http::withToken($this->getSecret())
            ->get("{$this->baseUrl}/transaction/verify/{$reference}");

        if ($response->failed()) {
            Log::error("Paystack Verification Error: " . $response->body());
            return false;
        }

        return $response->json('data.status') === 'success';
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        $event = $payload['event'];

        if ($event === 'charge.success') {
            $data = $payload['data'];
            return [
                'status' => 'success',
                'invoice_id' => $data['metadata']['invoice_id'] ?? null,
                'amount' => $data['amount'] / 100,
                'reference' => $data['reference'],
            ];
        }

        return ['status' => 'ignored'];
    }
}
