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
        $template = EmailTemplate::where('slug', $templateSlug)->first();

        if (!$template) {
            // Auto-heal missing critical templates with better anti-spam language
            if ($templateSlug === 'otp_verification') {
                $template = EmailTemplate::create([
                    'slug' => 'otp_verification',
                    'subject' => '🪪 Identity Verification Code',
                    'category' => 'system',
                    'placeholders' => '["student_name", "otp_code", "campus_name"]',
                    'content_html' => '
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                            <div style="text-align: center; margin-bottom: 40px;">
                                <h1 style="color: #4c1d95; font-size: 24px; font-weight: 950; text-transform: uppercase;">Identity Verification</h1>
                                <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">Institutional Authentication</p>
                            </div>
                            <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>{{student_name}}</strong>,</p>
                            <p style="color: #334155; font-size: 16px; line-height: 1.6;">To verify your account at <strong>{{campus_name}}</strong>, please use the following authentication code:</p>
                            <div style="background: #f8fafc; padding: 40px; border-radius: 32px; text-align: center; margin: 32px 0; border: 1px solid #e2e8f0;">
                                <h2 style="font-family: monospace; font-size: 52px; color: #4c1d95; margin: 0; letter-spacing: 12px; font-weight: 800;">{{otp_code}}</h2>
                            </div>
                            <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 32px;">This code is valid for 15 minutes. If you did not request this verification, please contact support.</p>
                        </div>'
                ]);
            } else {
                \Illuminate\Support\Facades\Log::error("Email template not found: {$templateSlug}");
                return false;
            }
        }

        // Determine Category (favor provided category, fallback to template's category)
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

        try {
            Mail::to($recipientEmail)->send(new DynamicTemplateMail($subject, $content));
            return true;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Failed to send email [{$templateSlug}] via primary SMTP ({$actualCategory}): " . $e->getMessage() . ". Reverting to default platform SMTP.");
            
            // Revert to system default and try again
            self::configureMailer('system_fallback_override');
            
            try {
                Mail::to($recipientEmail)->send(new DynamicTemplateMail($subject, $content));
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
