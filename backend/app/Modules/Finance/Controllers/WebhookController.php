<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use App\Modules\Finance\PaymentManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $paymentManager;

    public function __construct(PaymentManager $paymentManager)
    {
        $this->paymentManager = $paymentManager;
    }

    public function handle(Request $request, string $gateway)
    {
        try {
            $driver = $this->paymentManager->driver($gateway);
            
            // Normalize payload using the gateway implementation
            $result = $driver->handleWebhook($request->all(), $request->headers->all());

            if ($result['status'] === 'success') {
                return $this->processSuccessfulPayment($result);
            }

            return response()->json(['status' => 'ignored']);
        } catch (\Exception $e) {
            Log::error("Webhook Error ({$gateway}): " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    protected function processSuccessfulPayment(array $data)
    {
        $invoiceId = $data['invoice_id'];
        $invoice = Invoice::findOrFail($invoiceId);

        if ($invoice->status === 'paid') {
            return response()->json(['status' => 'already_paid']);
        }

        return DB::transaction(function () use ($invoice, $data) {
            // Create Payment record
            Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $data['amount'],
                'payment_method' => $data['reference'], // Stores the transaction ID
                'transaction_id' => $data['reference'],
            ]);

            // Update Invoice
            $newPaid = $invoice->amount_paid + $data['amount'];
            $status = $newPaid >= $invoice->total_amount ? 'paid' : 'partial';

            $invoice->update([
                'amount_paid' => $newPaid,
                'status' => $status,
            ]);

            Log::info("Invoice #{$invoice->id} updated via Webhook. Status: {$status}");

            return response()->json(['status' => 'success']);
        });
    }
}
