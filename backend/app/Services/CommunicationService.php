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
                    'subject' => 'Verify your identity: Security code for {{campus_name}}',
                    'category' => 'system',
                    'placeholders' => '["student_name", "otp_code", "campus_name"]',
                    'content_html' => '
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                            <div style="text-align: center; margin-bottom: 40px;">
                                <h1 style="color: #4b345d; font-size: 24px; font-weight: 800; margin: 0;">Identity Verification</h1>
                                <p style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 8px;">Institutional Security Protocol</p>
                            </div>
                            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Hi {{student_name}},</p>
                            <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">To finalize your secure access to the <strong>{{campus_name}}</strong> portal, please use the following institutional verification code.</p>
                            <div style="background: #f8fafc; padding: 32px; border-radius: 20px; text-align: center; margin: 32px 0; border: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your Security Code</p>
                                <h2 style="font-family: sans-serif; font-size: 42px; color: #4b345d; margin: 0; font-weight: 800;">{{otp_code}}</h2>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">This code will expire in 15 minutes. If you did not request this verification, please notify the IT Service Desk immediately.</p>
                            <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;">
                            <p style="color: #cbd5e1; font-size: 10px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
                                {{campus_name}} Institutional Registry &bull; Secure Systems Division
                            </p>
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

        // Parse Placeholders
        $appName = config('app.name', 'MyLMS');
        $subject = "{$appName}: " . $template->subject;
        $content = $template->content_html;

        // Add Global Defaults
        $data['campus_name'] = SystemSetting::getVal('institutional_name', config('app.name', 'Institutional Campus'));
        $data['rector_name'] = SystemSetting::getVal('rector_name', 'The Institutional Rector');
        $data['facebook_url'] = SystemSetting::getVal('facebook_url', '#');
        $data['instagram_url'] = SystemSetting::getVal('instagram_url', '#');

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

            // 🛡️ SMTP Identity Hardening:
            // Ensure From address matches authenticated user to bypass strict SPF/Anti-Spam filters.
            if ($fromAddress !== $account->username) {
                \Illuminate\Support\Facades\Log::warning("⚠️ Primary SMTP Identity Mismatch. Overriding [{$fromAddress}] with [{$account->username}] for stability.");
                $fromAddress = $account->username;
            }

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

            // 🛡️ CRITICAL SECURITY REASON: 
            // Most SMTP servers (like yours) will reject emails (550 Spam) 
            // if the 'From' address (academic@...) does NOT match the 
            // authenticated 'User' (noreply@...). 
            // We are now FORCING them to match to ensure delivery success.
            if ($fromAddress !== $fallbackUser) {
                \Illuminate\Support\Facades\Log::warning("⚠️ SMTP Identity Mismatch detected. Forcing From [{$fromAddress}] to match Auth User [{$fallbackUser}] to bypass 550 Spam block.");
                $fromAddress = $fallbackUser;
            }

            \Illuminate\Support\Facades\Log::info("Using system fallback SMTP: {$fallbackHost}. Final Resolved Identity: {$fromAddress}");
            
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
