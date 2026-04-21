<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DelayedMissionEmailJob implements ShouldQueue
{
    use Queueable;

    protected $userId;

    /**
     * Create a new job instance.
     */
    public function __construct($userId)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = \App\Models\User::find($this->userId);
        if (!$user) return;

        \App\Services\CommunicationService::send($user->email, 'mission_follow_up', [
            'student_name' => $user->name,
        ]);
    }
}
