<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InvoiceGenerated extends Notification
{
    use Queueable;

    protected $invoice;

    /**
     * Create a new notification instance.
     */
    public function __construct($invoice)
    {
        $this->invoice = $invoice;
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
        return [
            'title' => 'New Invoice Generated',
            'message' => 'An invoice for $' . number_format($this->invoice->total_amount, 2) . ' has been generated for your ' . ($this->invoice->semester->name ?? 'current') . ' semester.',
            'action_url' => '/billing',
            'icon' => '💳',
            'color' => 'amber'
        ];
    }
}
