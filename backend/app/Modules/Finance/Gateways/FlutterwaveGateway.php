<?php

namespace App\Modules\Finance\Gateways;

use App\Modules\Finance\Interfaces\PaymentGatewayInterface;
use App\Modules\Finance\Models\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlutterwaveGateway implements PaymentGatewayInterface
{
    protected $baseUrl = 'https://api.flutterwave.com/v3';

    public function initializePayment(Invoice $invoice): array
    {
        $response = Http::withToken(config('services.flutterwave.secret'))
            ->post("{$this->baseUrl}/payments", [
                'tx_ref' => 'FLW-' . uniqid(),
                'amount' => $invoice->total_amount,
                'currency' => 'NGN', // Can be dynamic based on user
                'redirect_url' => config('app.frontend_url') . '/payment/verify',
                'customer' => [
                    'email' => $invoice->user->email,
                    'name' => $invoice->user->name,
                ],
                'meta' => [
                    'invoice_id' => $invoice->id,
                    'user_id' => $invoice->user_id,
                ],
                'customizations' => [
                    'title' => 'MyLMS Academic Portal',
                    'description' => 'Tuition and Assessment Fees Payment',
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception("Flutterwave Initialization Error: " . $response->body());
        }

        $data = $response->json('data');

        return [
            'checkout_url' => $data['link'],
            'reference' => $data['id'] ?? $response->json('tx_ref'), 
        ];
    }

    public function verifyPayment(string $id): bool
    {
        $response = Http::withToken(config('services.flutterwave.secret'))
            ->get("{$this->baseUrl}/transactions/{$id}/verify");

        if ($response->failed()) {
            Log::error("Flutterwave Verification Error: " . $response->body());
            return false;
        }

        $data = $response->json('data');
        return $data['status'] === 'successful';
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        // Flutterwave webhooks usually send "event"
        $event = $payload['event'] ?? $payload['event.type'] ?? null;

        if ($event === 'charge.completed' || $payload['status'] === 'successful') {
            $data = $payload['data'] ?? $payload;
            return [
                'status' => 'success',
                'invoice_id' => $data['meta']['invoice_id'] ?? null,
                'amount' => $data['amount'],
                'reference' => $data['tx_ref'],
            ];
        }

        return ['status' => 'ignored'];
    }
}
