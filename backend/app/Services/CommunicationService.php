<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use App\Models\SystemSetting;

class CommunicationService
{
    /**
     * Send an email based on a database template.
     */
    public static function send(string $recipientEmail, string $templateSlug, array $data = [], string $category = 'general')
    {
        $template = EmailTemplate::where('slug', $templateSlug)->first();

        if (!$template) {
            \Illuminate\Support\Facades\Log::error("Email template not found: {$templateSlug}");
            return false;
        }

        // Configure Mailer Category
        self::configureMailer($category);

        $subject = $template->subject;
        $content = $template->content_html;

        // Add Global Defaults
        $data['campus_name'] = SystemSetting::getVal('institutional_name', 'Learnforth University');
        $data['rector_name'] = SystemSetting::getVal('rector_name', 'HRM En Omogehne Uzih');
        $data['facebook_url'] = SystemSetting::getVal('facebook_url', '#');
        $data['instagram_url'] = SystemSetting::getVal('instagram_url', '#');

        // Parse Placeholders
        foreach ($data as $key => $value) {
            $subject = str_replace("{{{$key}}}", $value, $subject);
            $content = str_replace("{{{$key}}}", $value, $content);
        }

        try {
            Mail::html($content, function ($message) use ($recipientEmail, $subject) {
                $message->to($recipientEmail)->subject($subject);
            });
            return true;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send email [{$templateSlug}] to {$recipientEmail}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Dynamically reconfigure the mailer based on category.
     */
    private static function configureMailer(string $category)
    {
        $account = \App\Models\MailAccount::where('category', $category)->where('is_active', true)->first();

        if ($account) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $account->host,
                'mail.mailers.smtp.port' => $account->port,
                'mail.mailers.smtp.encryption' => $account->encryption,
                'mail.mailers.smtp.username' => $account->username,
                'mail.mailers.smtp.password' => $account->password,
                'mail.from.address' => $account->from_address,
                'mail.from.name' => $account->from_name,
            ]);
        } else {
            // Fallback to institutional settings or system default
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => \App\Models\SystemSetting::getVal('mail_host', env('MAIL_HOST', '127.0.0.1')),
                'mail.mailers.smtp.port' => \App\Models\SystemSetting::getVal('mail_port', env('MAIL_PORT', 2525)),
                'mail.mailers.smtp.encryption' => \App\Models\SystemSetting::getVal('mail_encryption', env('MAIL_ENCRYPTION', 'tls')),
                'mail.mailers.smtp.username' => \App\Models\SystemSetting::getVal('mail_username', env('MAIL_USERNAME')),
                'mail.mailers.smtp.password' => \App\Models\SystemSetting::getVal('mail_password', env('MAIL_PASSWORD')),
                'mail.from.address' => \App\Models\SystemSetting::getVal('mail_from_address', env('MAIL_FROM_ADDRESS', 'hello@example.com')),
                'mail.from.name' => \App\Models\SystemSetting::getVal('mail_from_name', env('MAIL_FROM_NAME', 'MyLMS')),
            ]);
        }
    }
}
