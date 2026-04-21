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
        $app = AdmissionApplication::find($this->applicationId);
        if ($app && $app->fee_status === 'waiver_pending') {
            // Auto approve the waiver after the delay
            $app->update(['fee_status' => 'waiver_approved']);
        }
    }
}
