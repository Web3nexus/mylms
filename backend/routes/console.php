<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ====== MyLMS Institutional Automation Protocol ======

// 1. Institutional Deadline Enforcement Protocol (Registration Locking)
Schedule::command('academic:enforce-deadlines')->dailyAt('00:01')->withoutOverlapping();

// 2. Financial Arrear Institutional Notifications
Schedule::command('finance:payment-reminders')->dailyAt('00:05')->withoutOverlapping();

// 3. Automated Term/Semester Global Grading Matrix Generation
Schedule::command('academic:calculate-gpa')->monthly()->withoutOverlapping();

// 4. Institutional Academic Promotion Protocol
Schedule::command('academic:promote-students')->monthly()->withoutOverlapping();

// 5. Institutional Academic Term Rotation Protocol
Schedule::command('academic:rotate-semester')->monthly()->withoutOverlapping();
