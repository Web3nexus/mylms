<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SystemTestMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name', 'MyLMS') . ': Institutional Communication Test Protocol',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.dynamic',
            with: [
                'contentHtml' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="background: #5b21b6; color: white; padding: 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Protocol Verification</h1>
                        </div>
                        <div style="padding: 40px; line-height: 1.6; color: #1e1b4b;">
                            <p>This is an automated test transmission from the <strong>' . config('app.name', 'MyLMS') . ' Communication Gateway</strong>.</p>
                            <p>If you are reading this, your SMTP configuration has been successfully validated and is ready for institutional use.</p>
                            <div style="margin: 40px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #5b21b6;">
                                <p style="margin: 0; font-size: 14px;"><strong>Timestamp:</strong> ' . now()->toDayDateTimeString() . '</p>
                                <p style="margin: 5px 0; font-size: 14px;"><strong>System:</strong> ' . config('app.name', 'MyLMS') . ' Core Infrastructure</p>
                            </div>
                            <p>You can now proceed with automated admissions and invoice notifications.</p>
                        </div>
                        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                            &copy; ' . now()->year . ' ' . config('app.name', 'MyLMS') . ' Platform. All institutional systems operational.
                        </div>
                    </div>
                ',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
