<?php

namespace App\Modules\Finance\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Academic\Models\Semester;
use App\Modules\Courses\Models\CourseRegistration;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Notifications\InvoiceGenerated;

use App\Modules\Finance\PaymentManager;

class FinanceController extends Controller
{
    /**
     * Constants for static university fees
     */
    const TUITION_PER_CREDIT = 250.00;
    const TECH_FEE = 150.00;
    const LIBRARY_FEE = 50.00;

    protected $paymentManager;

    public function __construct(PaymentManager $paymentManager)
    {
        $this->paymentManager = $paymentManager;
    }

    /**
     * Student: Get all my invoices
     */
    public function myInvoices()
    {
        return response()->json(
            Invoice::where('user_id', Auth::id())
                ->with(['items', 'payments', 'semester.academicSession'])
                ->latest()
                ->get()
        );
    }

    /**
     * Admin: Get high level aggregate dashboard metrics
     */
    public function dashboardMetrics()
    {
        $totalExpected = Invoice::sum('total_amount');
        $totalCollected = Invoice::sum('amount_paid');
        $totalOutstanding = $totalExpected - $totalCollected;

        $gatewayPerformance = Payment::select('payment_method', DB::raw('SUM(amount) as total_collected'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get();

        $invoices = Invoice::with(['user', 'semester.academicSession', 'payments'])
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'metrics' => [
                'expected_revenue' => $totalExpected,
                'collected_revenue' => $totalCollected,
                'outstanding_balance' => $totalOutstanding,
            ],
            'gateway_performance' => $gatewayPerformance,
            'recent_invoices' => $invoices,
        ]);
    }

    /**
     * Admin: Trigger an invoice generation
     */
    public function generateSemesterInvoice(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $semester = Semester::findOrFail($validated['semester_id']);

        if (Invoice::where('user_id', $user->id)->where('semester_id', $semester->id)->exists()) {
            return response()->json(['message' => 'Invoice already exists for this semester.'], 409);
        }

        $registrations = CourseRegistration::where('user_id', $user->id)
            ->where('semester_id', $semester->id)
            ->where('status', '!=', 'dropped')
            ->with('course')
            ->get();

        if ($registrations->isEmpty()) {
            return response()->json(['message' => 'User has no active registrations.'], 422);
        }

        $totalCredits = $registrations->sum(fn ($reg) => $reg->course->credit_hours ?? 3);
        $tuitionFee = $totalCredits * self::TUITION_PER_CREDIT;
        $totalAmount = $tuitionFee + self::TECH_FEE + self::LIBRARY_FEE;

        return DB::transaction(function () use ($user, $semester, $tuitionFee, $totalAmount) {
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'semester_id' => $semester->id,
                'total_amount' => $totalAmount,
                'amount_paid' => 0,
                'status' => 'unpaid',
                'due_date' => now()->addDays(30),
            ]);

            $invoice->items()->create(['description' => "Tuition Fee", 'amount' => $tuitionFee]);
            $invoice->items()->create(['description' => 'Technology Fee', 'amount' => self::TECH_FEE]);
            $invoice->items()->create(['description' => 'Library Fee', 'amount' => self::LIBRARY_FEE]);

            $user->notify(new InvoiceGenerated($invoice->load('semester')));

            return response()->json($invoice->load('items'), 201);
        });
    }

    /**
     * Student: Initialize a real payment via chosen gateway
     */
    public function processPayment(Request $request, Invoice $invoice)
    {
        if ($invoice->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'gateway' => 'required|string|in:stripe,paystack,flutterwave',
        ]);

        try {
            $gateway = $this->paymentManager->driver($validated['gateway']);
            $paymentData = $gateway->initializePayment($invoice->load('user', 'semester'));

            return response()->json($paymentData);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Student: Verify a payment after redirect back
     */
    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'gateway' => 'required|string|in:stripe,paystack,flutterwave',
            'reference' => 'required|string',
        ]);

        try {
            $gateway = $this->paymentManager->driver($validated['gateway']);
            $isPaid = $gateway->verifyPayment($validated['reference']);

            if ($isPaid) {
                // We typically handle the actual DB update in the Webhook 
                // but we can return success here for the UI
                return response()->json(['status' => 'success', 'message' => 'Payment verified successfully.']);
            }

            return response()->json(['status' => 'failed', 'message' => 'Payment verification failed.'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
