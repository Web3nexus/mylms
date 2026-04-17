<?php

namespace App\Modules\Finance\Interfaces;

use App\Modules\Finance\Models\Invoice;

interface PaymentGatewayInterface
{
    /**
     * @param Invoice $invoice
     * @return array containing 'checkout_url' and 'reference'
     */
    public function initializePayment(Invoice $invoice): array;

    /**
     * Verify a transaction with the provider
     * @param string $reference
     * @return bool
     */
    public function verifyPayment(string $reference): bool;

    /**
     * Handle incoming webhooks from the provider
     */
    public function handleWebhook(array $payload, array $headers): array;
}
