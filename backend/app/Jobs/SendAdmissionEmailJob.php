<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Modules\Admissions\Models\AdmissionApplication;
use Illuminate\Support\Facades\Mail;

class SendAdmissionEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $applicationId;

    public function __construct($applicationId)
    {
        $this->applicationId = $applicationId;
    }

    public function handle()
    {
        $app = AdmissionApplication::with('user')->find($this->applicationId);
        
        if ($app && $app->status === 'under_review') {
            // Update status if auto-approved by scholarship engine
            if ($app->scholarship_status === 'auto_approved') {
                $app->update(['status' => 'approved']);
                
                // TODO: Actual mail logic here
                // Mail::to($app->user->email)->send(new \App\Mail\AdmissionApproved($app));
            } else if ($app->scholarship_status === 'rejected') {
                $app->update(['status' => 'rejected']);
                // Mail::to($app->user->email)->send(new \App\Mail\AdmissionRejected($app));
            }
            // If it's pending review, it stays 'under_review'
        }
    }
}
