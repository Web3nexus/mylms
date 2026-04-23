<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\Admissions\Models\AdmissionApplication;

class ProcessFeeWaiverJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $applicationId;

    public function __construct($applicationId)
    {
        $this->applicationId = $applicationId;
    }

    public function handle()
    {
        $app = AdmissionApplication::with(['user', 'program'])->find($this->applicationId);
        
        if ($app && in_array($app->application_fee_status, ['pending', 'waived']) && !$app->waiver_emails_sent) {
            $app->update([
                'application_fee_status' => 'waived',
                'application_fee_waived_at' => $app->application_fee_waived_at ?? now(),
                'waiver_emails_sent' => true
            ]);
            
            $user = $app->user;
            if (!$user) return;

            // 1. Admission Waiver Congratulations
            \App\Services\CommunicationService::send($user->email, 'waiver_congratulations', [
                'student_name' => $user->name,
            ]);

            // 2. Rector's Welcome Letter
            \App\Services\CommunicationService::send($user->email, 'rector_welcome', [
                'student_name' => $user->name,
            ]);

            // 3. Tuition Fee Statement (Scholarship Worth)
            $tuitionValue = (float) ($app->program?->tuition_fee ?? 0);
            \App\Services\CommunicationService::send($user->email, 'tuition_statement', [
                'student_name'  => $user->name,
                'tuition_worth' => number_format($tuitionValue, 2),
                'academic_year' => '2026/2027', 
            ]);

            // 4. Delayed Job: Follow the Mission (2 days)
            \App\Jobs\DelayedMissionEmailJob::dispatch($user->id)->delay(now()->addDays(2));
        }
    }
}
