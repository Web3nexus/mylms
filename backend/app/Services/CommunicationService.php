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
    public static function send(string $recipientEmail, string $templateSlug, array $data = [])
    {
        $template = EmailTemplate::where('slug', $templateSlug)->first();

        if (!$template) {
            \Illuminate\Support\Facades\Log::error("Email template not found: {$templateSlug}");
            return false;
        }

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
}
