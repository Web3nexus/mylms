<?php

namespace App\Mail;

use App\Modules\Admissions\Models\AdmissionApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdmissionSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public $application;

    public function __construct(AdmissionApplication $application)
    {
        $this->application = $application;
    }

    public function build()
    {
        return $this->subject('SCHOLASTIC PROTOCOL: Application Vaulted')
                    ->view('emails.admission.submitted');
    }
}
