<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Modules\Courses\Models\CourseRegistration;

class CheckStudentActivityJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $cutoff = now()->subDays(7);

        // Find students with incomplete courses who haven't logged in for 7+ days
        $inactiveStudents = User::where('role', 'student')
            ->where(function ($q) use ($cutoff) {
                $q->whereNull('last_login_at')
                  ->orWhere('last_login_at', '<', $cutoff);
            })
            ->whereHas('courseRegistrations', function ($q) {
                $q->where('status', 'registered');
            })
            ->with('courseRegistrations.course')
            ->get();

        foreach ($inactiveStudents as $student) {
            \App\Services\CommunicationService::send(
                $student->email,
                'inactivity_reminder',
                ['student_name' => $student->name],
                'courses' // Use the "courses" SMTP account
            );
        }
    }
}
