<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'otp_verification',
                'subject' => '👋 Welcome to {{campus_name}}! Here is your login code',
                'category' => 'system',
                'placeholders' => '["student_name", "otp_code", "campus_name"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h1 style="color: #4c1d95; font-size: 24px; font-weight: 900; margin: 0;">We\'re so glad you\'re here!</h1>
                            <p style="color: #707070; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Just one quick step to get you started</p>
                        </div>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi <strong>{{student_name}}</strong>,</p>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Welcome to the <strong>{{campus_name}}</strong> family! To keep your account safe and finalize your registration, please use the 6-digit code below.</p>
                        <div style="background: #f8fafc; padding: 40px; border-radius: 24px; text-align: center; margin: 40px 0; border: 1px solid #e2e8f0;">
                            <p style="color: #707070; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Your verification code</p>
                            <h2 style="font-family: monospace; font-size: 48px; color: #4c1d95; margin: 0; letter-spacing: 8px;">{{otp_code}}</h2>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code will expire in 15 minutes. If you didn\'t request this, no worries—you can just ignore this email.</p>
                    </div>'
            ],
            [
                'slug' => 'waiver_congratulations',
                'subject' => '🎉 Great news! Your {{campus_name}} admission fee has been waived',
                'category' => 'institutional',
                'placeholders' => '["student_name", "campus_name"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff; border-top: 8px solid #fb7185;">
                        <h2 style="color: #fb7185; font-size: 28px; font-weight: 900; margin-bottom: 24px;">Congratulations, {{student_name}}!</h2>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">We have some wonderful news to share. We\'ve reviewed your application and, as a token of our support for your journey, we have decided to **waive your admission fee** at <strong>{{campus_name}}</strong>.</p>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">This means you can now jump straight into your studies without any initial charges. We\'re so excited to see what you\'ll achieve with us!</p>
                        <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #f0f0f0; color: #94a3b8; font-size: 11px; font-weight: 600;">
                            Warm regards from the Admissions Team
                        </div>
                    </div>'
            ],
            [
                'slug' => 'rector_welcome',
                'subject' => '✉️ A warm welcome from our Rector',
                'category' => 'institutional',
                'placeholders' => '["student_name", "rector_name", "campus_name"]',
                'content_html' => '
                    <div style="font-family: serif; max-width: 600px; margin: auto; padding: 60px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                        <h1 style="color: #4c1d95; font-size: 26px; font-weight: 900; margin-bottom: 40px; font-style: italic;">Welcome to our community.</h1>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">Dear {{student_name}},</p>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">I am personally delighted to welcome you to <strong>{{campus_name}}</strong>. You aren\'t just joining a school; you\'re becoming part of a community that values curiosity, passion, and the drive to grow.</p>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">We believe that education is a shared journey, and we are honored that you\'ve chosen to take your next steps with us. I look forward to hearing about your successes as you explore everything our institution has to offer.</p>
                        <div style="margin-top: 60px;">
                            <p style="color: #333; font-size: 16px; font-weight: 900; margin-bottom: 4px;">{{rector_name}}</p>
                            <p style="color: #707070; font-size: 12px;">Rector, {{campus_name}}</p>
                        </div>
                    </div>'
            ],
            [
                'slug' => 'tuition_statement',
                'subject' => '🎁 Exciting Update: Your scholarship award is ready!',
                'category' => 'institutional',
                'placeholders' => '["student_name", "tuition_worth", "academic_year"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #4c1d95; color: #fff;">
                        <h2 style="font-size: 28px; font-weight: 900; margin-bottom: 24px;">Your education is our priority.</h2>
                        <p style="font-size: 16px; line-height: 1.6; opacity: 0.9;">Hi {{student_name}},</p>
                        <div style="background: rgba(255,255,255,0.15); padding: 40px; border-radius: 24px; margin: 40px 0;">
                            <p style="font-size: 11px; text-transform: uppercase; tracking: 0.1em; margin-bottom: 16px; opacity: 0.7;">Your scholarship value for this year</p>
                            <h2 style="font-size: 48px; font-weight: 900; margin: 0;">${{tuition_worth}}</h2>
                        </div>
                        <p style="font-size: 14px; line-height: 1.6;">We want to make your learning journey as smooth as possible. Your tuition for the <strong>{{academic_year}}</strong> academic year has been fully covered by our scholarship fund. We believe in your potential and are proud to support you!</p>
                    </div>'
            ],
            [
                'slug' => 'mission_follow_up',
                'subject' => '🤝 Let\'s stay connected!',
                'category' => 'institutional',
                'placeholders' => '["student_name", "facebook_url", "instagram_url", "linkedin_url"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff; text-align: center;">
                        <h2 style="color: #333; font-size: 24px; font-weight: 900; margin-bottom: 16px;">Join the conversation!</h2>
                        <p style="color: #707070; font-size: 14px; line-height: 1.6; margin-bottom: 40px;">We\'d love to stay in touch and show you more of what life is like at our campus. Follow our official channels for the latest stories and updates.</p>
                        
                        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 40px;">
                            <a href="{{facebook_url}}" style="background: #4c1d95; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 12px;">Facebook</a>
                            <a href="{{instagram_url}}" style="background: #fb7185; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 12px;">Instagram</a>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 11px; margin-top: 40px;">From all of us at <strong>Learnforth University</strong></p>
                    </div>'
            ]
        ];

        foreach ($templates as $template) {
            \App\Models\EmailTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
