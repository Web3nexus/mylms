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
                'subject' => '🔐 Institutional Identity Verification',
                'category' => 'system',
                'placeholders' => '["student_name", "otp_code", "campus_name"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h1 style="color: #4c1d95; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin: 0;">Institutional Gate</h1>
                            <p style="color: #707070; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">Security Protocol Active</p>
                        </div>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Greetings, <strong>{{student_name}}</strong>.</p>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">To finalize your candidacy registry at <strong>{{campus_name}}</strong>, please verify your identity using the institutional protocol below.</p>
                        <div style="background: #f8fafc; padding: 40px; border-radius: 24px; text-align: center; margin: 40px 0; border: 1px solid #e2e8f0;">
                            <p style="color: #707070; font-size: 10px; font-weight: 900; text-transform: uppercase; tracking: 0.3em; margin-bottom: 16px;">One-Time Security Code</p>
                            <h2 style="font-family: monospace; font-size: 48px; color: #4c1d95; margin: 0; letter-spacing: 8px;">{{otp_code}}</h2>
                        </div>
                        <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">This code expires in 15 minutes. If you did not initiate this registry, please ignore this transmission.</p>
                    </div>'
            ],
            [
                'slug' => 'waiver_congratulations',
                'subject' => '🎖️ Institutional Honor: Admission Fee Waived',
                'category' => 'institutional',
                'placeholders' => '["student_name", "campus_name"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff; border-top: 8px solid #fb7185;">
                        <h2 style="color: #fb7185; font-size: 32px; font-weight: 900; text-transform: uppercase; tracking: -0.05em; margin-bottom: 24px;">Excellence Recognized.</h2>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>{{student_name}}</strong>,</p>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">We are pleased to inform you that your application for an institutional fee waiver has been **APPROVED** by the High Commission of Admissions at <strong>{{campus_name}}</strong>.</p>
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Your candidacy has been elevated to active status. You may now proceed to finalize your academic enrollment without any further admission charges.</p>
                        <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid #f0f0f0; color: #94a3b8; font-size: 10px; text-transform: uppercase; tracking: 0.2em;">
                            Officially Transmitted by the Office of the Registrar
                        </div>
                    </div>'
            ],
            [
                'slug' => 'rector_welcome',
                'subject' => '🖋️ A Personal Welcome from the Rector',
                'category' => 'institutional',
                'placeholders' => '["student_name", "rector_name", "campus_name"]',
                'content_html' => '
                    <div style="font-family: serif; max-width: 600px; margin: auto; padding: 60px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff;">
                        <h1 style="color: #4c1d95; font-size: 28px; font-weight: 900; margin-bottom: 40px; font-style: italic;">Welcome to the Heritage of Knowledge.</h1>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">Dear {{student_name}},</p>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">It is my distinct honor to welcome you to <strong>{{campus_name}}</strong>. You are joining a community dedicated to the pursuit of truth and the mastery of specialized research.</p>
                        <p style="color: #333; font-size: 18px; line-height: 1.8;">At our institution, we believe that education is the ultimate mission. We look forward to seeing you thrive within our academic framework.</p>
                        <div style="margin-top: 60px;">
                            <p style="color: #333; font-size: 16px; font-weight: 900; margin-bottom: 4px;">{{rector_name}}</p>
                            <p style="color: #707070; font-size: 12px; text-transform: uppercase; tracking: 0.2em;">The Rector, {{campus_name}}</p>
                        </div>
                    </div>'
            ],
            [
                'slug' => 'tuition_statement',
                'subject' => '💎 Institutional Support: Tuition Waiver Details',
                'category' => 'institutional',
                'placeholders' => '["student_name", "tuition_worth", "academic_year"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #4c1d95; color: #fff;">
                        <h2 style="font-size: 32px; font-weight: 900; text-transform: uppercase; margin-bottom: 24px;">Financial Gateway: CLEARED.</h2>
                        <p style="font-size: 16px; line-height: 1.6; opacity: 0.8;">Student Candidate: {{student_name}}</p>
                        <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 24px; margin: 40px 0;">
                            <p style="font-size: 10px; text-transform: uppercase; tracking: 0.3em; margin-bottom: 16px; opacity: 0.6;">Institutional Funding Value (1 Year)</p>
                            <h2 style="font-size: 48px; font-weight: 900; margin: 0;">${{tuition_worth}}</h2>
                        </div>
                        <p style="font-size: 14px; line-height: 1.6;">Your tuition for the **{{academic_year}}** academic year has been fully subsidized. This scholarship reflects your potential and our commitment to accessible excellence.</p>
                    </div>'
            ],
            [
                'slug' => 'mission_follow_up',
                'subject' => '🌍 Joint the Mission: Official Channels',
                'category' => 'institutional',
                'placeholders' => '["student_name", "facebook_url", "instagram_url", "linkedin_url"]',
                'content_html' => '
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 40px; background: #fff; text-align: center;">
                        <h2 style="color: #333; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 16px;">The Mission is Global.</h2>
                        <p style="color: #707070; font-size: 14px; line-height: 1.6; margin-bottom: 40px;">Stay connected with the latest academic protocols, campus updates, and global research initiatives.</p>
                        
                        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 40px;">
                            <a href="{{facebook_url}}" style="background: #4c1d95; color: #fff; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 11px;">Facebook</a>
                            <a href="{{instagram_url}}" style="background: #fb7185; color: #fff; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 11px;">Instagram</a>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; tracking: 0.2em; margin-top: 40px;">Learnforth University Unified Communication Panel</p>
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
