<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:payment-reminders {--days=3 : Send to users whose invoices are due in this many days}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automate dispatch of institutional payment arrears reminders to students via MyLMS notification channels.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $targetDate = Carbon::now()->addDays($days)->format('Y-m-d');
        
        $this->info("Commencing Institutional Financial Enforcement Protocol for invoices pending within {$days} days [Target: {$targetDate}]...");

        $invoices = DB::table('invoices')
            ->where('status', 'unpaid')
            ->whereDate('due_date', '<=', $targetDate)
            ->whereDate('due_date', '>=', Carbon::now()->format('Y-m-d')) // avoid spamming ones way past due in this particular run
            ->get();

        if ($invoices->isEmpty()) {
            $this->info('No pending arrear invoices matched criteria. Financial standing normal.');
            return;
        }

        $count = 0;
        foreach ($invoices as $invoice) {
            $user = User::find($invoice->user_id);
            if (!$user) continue;

            $outstanding = $invoice->total_amount - $invoice->amount_paid;
            
            // Build Laravel standard polymorphic notification JSON structure
            $messageData = json_encode([
                'title' => 'URGENT: Outstanding Institutional Fee',
                'message' => "Scholar {$user->name}, your institutional learning fees of \$" . number_format($outstanding, 2) . " are due on " . Carbon::parse($invoice->due_date)->format('F jS, Y') . ". Immediate clearance is required to proceed with registration and grading.",
                'action_url' => '/billing'
            ]);

            DB::table('notifications')->insert([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'type' => 'App\Notifications\InstitutionalFinancialReminder',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => $messageData,
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $count++;
        }

        $this->info("SUCCESS: Distributed {$count} encrypted financial arrear notifications sequentially.");
    }
}
