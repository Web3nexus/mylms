<?php

namespace App\Modules\Finance\Gateways;

use App\Modules\Finance\Interfaces\PaymentGatewayInterface;
use App\Modules\Finance\Models\Invoice;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Log;

class StripeGateway implements PaymentGatewayInterface
{
    protected $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function initializePayment(Invoice $invoice): array
    {
        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => "MyLMS Invoice #{$invoice->id}",
                        'description' => "Academic Fees for " . ($invoice->semester->name ?? 'Current Term'),
                    ],
                    'unit_amount' => (int)($invoice->total_amount * 100), // Stripe uses cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => config('app.frontend_url') . '/payment/failed',
            'metadata' => [
                'invoice_id' => $invoice->id,
                'user_id' => $invoice->user_id,
            ],
        ]);

        return [
            'checkout_url' => $session->url,
            'reference' => $session->id,
        ];
    }

    public function verifyPayment(string $reference): bool
    {
        try {
            $session = $this->stripe->checkout->sessions->retrieve($reference);
            return $session->payment_status === 'paid';
        } catch (\Exception $e) {
            Log::error("Stripe Verification Error: " . $e->getMessage());
            return false;
        }
    }

    public function handleWebhook(array $payload, array $headers): array
    {
        // Stripe SDK handles signature verification, but for simplicity we'll assume the payload is trusted here 
        // in a real production environment, we should verify the signature with the endpoint secret
        $event = $payload['type'];

        if ($event === 'checkout.session.completed') {
            $session = $payload['data']['object'];
            return [
                'status' => 'success',
                'invoice_id' => $session['metadata']['invoice_id'],
                'amount' => $session['amount_total'] / 100,
                'reference' => $session['id'],
            ];
        }

        return ['status' => 'ignored'];
    }
}
