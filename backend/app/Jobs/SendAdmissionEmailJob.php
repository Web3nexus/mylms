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
        $app = AdmissionApplication::with(['user', 'program', 'program.department.faculty'])->find($this->applicationId);
        
        if (!$app) return;

        // If approved by admin or auto-evaluator
        if ($app->status === 'approved') {
            \Illuminate\Support\Facades\Mail::to($app->user->email)
                ->send(new \App\Mail\AdmissionApproved($app));
        } 
        
        if ($app->status === 'rejected') {
            \Illuminate\Support\Facades\Mail::to($app->user->email)
                ->send(new \App\Mail\AdmissionRejected($app));
        }
    }
}
