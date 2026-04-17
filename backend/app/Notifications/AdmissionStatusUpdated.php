<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdmissionStatusUpdated extends Notification
{
    use Queueable;

    protected $application;
    
    /**
     * Create a new notification instance.
     */
    public function __construct($application)
    {
        $this->application = $application;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = ucfirst($this->application->status);
        $emoji = $status === 'Accepted' ? '🎉' : '📩';
        $color = $status === 'Accepted' ? 'emerald' : 'purple';

        return [
            'title' => "Admission {$status}",
            'message' => "Your application status for the {$this->application->program} program is now: {$status}.",
            'action_url' => '/dashboard',
            'icon' => $emoji,
            'color' => $color
        ];
    }
}
