<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use App\Models\SystemSetting;
use App\Mail\DynamicTemplateMail;

class CommunicationService
{
    /**
     * Send an email based on a database template.
     */
    public static function send(string $recipientEmail, string $templateSlug, array $data = [], string $category = 'general')
    {
        \Illuminate\Support\Facades\Log::info("📨 Initializing email transmission protocol: [{$templateSlug}] to [{$recipientEmail}]");

        $template = EmailTemplate::where('slug', $templateSlug)->first();

        if (!$template) {
            // Auto-heal missing critical templates with ultra-safe anti-spam language
            if ($templateSlug === 'otp_verification') {
                $template = EmailTemplate::create([
                    'slug' => 'otp_verification',
                    'subject' => 'Verification Code: {{otp_code}}',
                    'category' => 'system',
                    'placeholders' => '["student_name", "otp_code", "campus_name"]',
                    'content_html' => '
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <p>Hello {{student_name}},</p>
                            <p>Your verification code for <strong>{{campus_name}}</strong> is:</p>
                            <div style="font-size: 32px; font-weight: bold; margin: 20px 0; color: #4c1d95; letter-spacing: 5px;">
                                {{otp_code}}
                            </div>
                            <p style="font-size: 12px; color: #777;">This code expires in 15 minutes.</p>
                        </div>'
                ]);
            } else {
                \Illuminate\Support\Facades\Log::error("Email template not found: {$templateSlug}");
                return false;
            }
        }

        // Determine Category
        $actualCategory = $category !== 'general' ? $category : ($template->category ?? 'general');

        // Configure Mailer Category
        self::configureMailer($actualCategory);

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

        // Pre-flight: Capture explicit From identity to pass into Mailable
        $currentFromEmail = config('mail.from.address');
        $currentFromName  = config('mail.from.name');

        \Illuminate\Support\Facades\Log::info("🚀 [PRE-FLIGHT] Host: " . config('mail.mailers.smtp.host') . " | From: {$currentFromEmail}");

        try {
            // Pro-active detection: If the new Mailable class didn't pull correctly to live, 
            // we use a temporary fallback to prevent a fatal application crash.
            if (class_exists(\App\Mail\DynamicTemplateMail::class)) {
                Mail::to($recipientEmail)->send(new DynamicTemplateMail($subject, $content, $currentFromEmail, $currentFromName));
            } else {
                \Illuminate\Support\Facades\Log::warning("⚠️ DynamicTemplateMail class missing. Falling back to legacy transmission mode.");
                Mail::html($content, function ($message) use ($recipientEmail, $subject) {
                    $message->to($recipientEmail)->subject($subject);
                });
            }
            return true;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to send email [{$templateSlug}] via primary SMTP ({$actualCategory}): " . $e->getMessage() . ". Reverting to default platform SMTP.");
            
            // Revert to system default and try again
            self::configureMailer('system_fallback_override');
            $fallbackFromEmail = config('mail.from.address');
            $fallbackFromName  = config('mail.from.name');
            
            try {
                if (class_exists(\App\Mail\DynamicTemplateMail::class)) {
                    Mail::to($recipientEmail)->send(new DynamicTemplateMail($subject, $content, $fallbackFromEmail, $fallbackFromName));
                } else {
                    Mail::html($content, function ($message) use ($recipientEmail, $subject) {
                        $message->to($recipientEmail)->subject($subject);
                    });
                }
                return true;
            } catch (\Exception $fallbackException) {
                \Illuminate\Support\Facades\Log::error("Failed to send email [{$templateSlug}] via fallback SMTP: " . $fallbackException->getMessage());
                return false;
            }
        }
    }

    /**
     * Dynamically reconfigure the mailer based on category.
     */
    private static function configureMailer(string $category)
    {
        // Force Laravel to resolve the mailer fresh (prevents cached SMTP credential collision)
        \Illuminate\Support\Facades\Mail::forgetMailers();

        $account = $category !== 'system_fallback_override' 
            ? \App\Models\MailAccount::where('category', $category)->where('is_active', true)->first() 
            : null;

        if ($account && !empty($account->host)) {
            \Illuminate\Support\Facades\Log::info("Configuring institutional SMTP for category [{$category}]: {$account->host}");
            
            $fromAddress = !empty($account->from_address) ? $account->from_address : $account->username;

            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $account->host,
                'mail.mailers.smtp.port' => $account->port,
                'mail.mailers.smtp.encryption' => $account->encryption,
                'mail.mailers.smtp.username' => $account->username,
                'mail.mailers.smtp.password' => $account->password,
                'mail.from.address' => $fromAddress,
                'mail.from.name' => $account->from_name ?? config('mail.from.name'),
            ]);
            \Illuminate\Support\Facades\Log::info("SMTP [{$category}] ready. From: {$fromAddress}");
        } else {
            $fallbackHost = \App\Models\SystemSetting::getVal('mail_host', env('MAIL_HOST', '127.0.0.1'));
            $fallbackUser = \App\Models\SystemSetting::getVal('mail_username', env('MAIL_USERNAME'));
            $fromAddress  = \App\Models\SystemSetting::getVal('mail_from_address', env('MAIL_FROM_ADDRESS'));

            // Anti-Spam: Force From to match Username if from is generic or missing (Avoids 550 Spam Error)
            if (empty($fromAddress) || $fromAddress === 'hello@example.com') {
                $fromAddress = $fallbackUser;
            }

            \Illuminate\Support\Facades\Log::info("Using system fallback SMTP: {$fallbackHost}. From identity: {$fromAddress}");
            
            // Fallback to institutional settings or system default
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $fallbackHost,
                'mail.mailers.smtp.port' => \App\Models\SystemSetting::getVal('mail_port', env('MAIL_PORT', 2525)),
                'mail.mailers.smtp.encryption' => \App\Models\SystemSetting::getVal('mail_encryption', env('MAIL_ENCRYPTION', 'tls')),
                'mail.mailers.smtp.username' => $fallbackUser,
                'mail.mailers.smtp.password' => \App\Models\SystemSetting::getVal('mail_password', env('MAIL_PASSWORD')),
                'mail.mailers.smtp.scheme' => null,
                'mail.mailers.smtp.url' => null,
                'mail.from.address' => $fromAddress,
                'mail.from.name' => \App\Models\SystemSetting::getVal('mail_from_name', env('MAIL_FROM_NAME', 'MyLMS')),
            ]);
        }
    }
}
