<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandingController extends Controller
{
    /**
     * Get all branding settings.
     */
    public function index()
    {
        $settings = [
            'logo_url' => SystemSetting::getVal('branding_logo_url', 'https://images.unsplash.com/photo-1523050853063-bd805a952113?q=80&w=200'),
            'logo_light_url' => SystemSetting::getVal('branding_logo_light_url', 'https://images.unsplash.com/photo-1523050853063-bd805a952113?q=80&w=200'),
            'favicon_url' => SystemSetting::getVal('branding_favicon_url', '/favicon.ico'),
            'primary_color' => SystemSetting::getVal('branding_primary_color', '#4b345d'),
            'accent_color' => SystemSetting::getVal('branding_accent_color', '#E90171'),
            'institutional_name' => SystemSetting::getVal('branding_name', 'MyLMS'),
            'institutional_motto' => SystemSetting::getVal('branding_motto', 'University Network Authority'),
            'hero_image' => SystemSetting::getVal('branding_hero_image', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070'),
            'footer_text' => SystemSetting::getVal('branding_footer', 'An accredited, American, tuition-free, online university dedicated to global access.'),
            'admissions_enabled' => SystemSetting::getVal('admissions_enabled', true),
            'admissions_opens_at' => SystemSetting::getVal('admissions_opens_at', '2026-09-01'),
            
            // Core Page Content (Manageable Marketing)
            'admissions_hero_title' => SystemSetting::getVal('admissions_hero_title', 'Shape Your Future.'),
            'admissions_hero_desc' => SystemSetting::getVal('admissions_hero_desc', 'Join thousands of scholars worldwide. Apply for fully online, internationally accredited degree programs — tuition-free.'),
            'admissions_stats' => SystemSetting::getVal('admissions_stats', [
                ['label' => 'Degree Programs', 'value' => '40+', 'suffix' => ''],
                ['label' => 'Tuition-Free', 'value' => '100', 'suffix' => '%'],
                ['label' => 'Global Students', 'value' => '12', 'suffix' => 'k+'],
                ['label' => 'Accredited', 'value' => 'Gold', 'suffix' => ''],
            ]),
            'scholarships_hero_title' => SystemSetting::getVal('scholarships_hero_title', 'Funding Registry.'),
            'scholarships_hero_desc' => SystemSetting::getVal('scholarships_hero_desc', 'Authorized MyLMS directory of academic grants, fellowships, and research bursaries curated for Institutional Scholars.'),
            'courses_hero_title' => SystemSetting::getVal('courses_hero_title', 'Academic Catalog.'),
            'courses_hero_desc' => SystemSetting::getVal('courses_hero_desc', 'Explore our comprehensive list of degree-granting courses and specialized certificates.'),
            'auth_panel_title' => SystemSetting::getVal('auth_panel_title', 'Access the Nexus.'),
            'auth_panel_desc' => SystemSetting::getVal('auth_panel_desc', 'Enter your institutional credentials to sync with the global academic registry and manage your learning journey.'),
            'benefit_cards' => SystemSetting::getVal('benefit_cards', [
                ['title' => '100% Online', 'desc' => 'Study from anywhere in the world, on your schedule. No campus visits required.'],
                ['title' => 'Internationally Accredited', 'desc' => 'Our degrees are recognized by employers and institutions worldwide.'],
                ['title' => 'Flexible Pacing', 'desc' => 'Self-paced modules designed for working professionals and busy learners.'],
            ]),

            // Student Experience Page
            'experience_hero_title' => SystemSetting::getVal('experience_hero_title', 'Your Global Campus.'),
            'experience_hero_desc' => SystemSetting::getVal('experience_hero_desc', 'Experience a world-class digital education environment designed for the modern scholar.'),
            'experience_features' => SystemSetting::getVal('experience_features', [
                ['title' => 'Digital Ecosystem', 'desc' => 'Access the full suite of Microsoft 365, high-speed virtual libraries, and peer-to-peer collaboration tools.', 'icon' => 'terminal'],
                ['title' => 'Global Community', 'desc' => 'Connect with students from over 120 countries and build a professional network that transcends borders.', 'icon' => 'globe'],
                ['title' => 'Research Registry', 'desc' => 'Participate in international research projects and access our exclusive academic repository.', 'icon' => 'database'],
            ]),

            // About Us Page
            'about_hero_title' => SystemSetting::getVal('about_hero_title', 'Innovation in Education.'),
            'about_hero_desc' => SystemSetting::getVal('about_hero_desc', 'Founded on the principle of universal access, we are redefining what it means to be a global university.'),
            'about_mission' => SystemSetting::getVal('about_mission', 'Our mission is to provide high-quality, internationally accredited higher education to every qualified student in the world, regardless of financial, geographic, or societal constraints.'),
            'about_leadership_title' => SystemSetting::getVal('about_leadership_title', 'Academic Leadership'),
            'about_history' => SystemSetting::getVal('about_history', 'Established in the digital era, MyLMS has grown from a visionary project into a global academic authority, serving thousands of students across every continent.'),
        ];

        $footerColumns = SystemSetting::getVal('branding_footer_columns');
        $settings['footer_columns'] = $footerColumns ?: [
            [
                'title' => 'Academic Programs',
                'links' => [
                    ['label' => "Master's Degree", 'url' => "/masters-degree"],
                    ['label' => "Bachelor's Degree", 'url' => "/bachelors-degree"],
                    ['label' => "Associate's Degree", 'url' => "/associates-degree"],
                    ['label' => "Certificate Programs", 'url' => "/certificates"],
                ]
            ],
            [
                'title' => 'Admissions',
                'links' => [
                    ['label' => "Tuition-Free Model", 'url' => "/tuition-free"],
                    ['label' => "Scholarships", 'url' => "/scholarships"],
                    ['label' => "How to Apply", 'url' => "/apply"],
                    ['label' => "Calendars", 'url' => "/calendar"],
                ]
            ],
            [
                'title' => 'About',
                'links' => [
                    ['label' => "Our Mission", 'url' => "/mission"],
                    ['label' => "Academic Leadership", 'url' => "/leadership"],
                    ['label' => "Accreditation", 'url' => "/accreditation"],
                    ['label' => "Catalog", 'url' => "/catalog"],
                ]
            ]
        ];

        return response()->json($settings);
    }

    /**
     * Update branding settings (Admin only).
     */
    public function update(Request $request)
    {
        $request->validate([
            'logo_url' => 'nullable|string',
            'logo_light_url' => 'nullable|string',
            'favicon_url' => 'nullable|string',
            'primary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'accent_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'institutional_name' => 'nullable|string|max:50',
            'institutional_motto' => 'nullable|string|max:100',
            'hero_image' => 'nullable|string',
            'footer_text' => 'nullable|string|max:500',
            'admissions_enabled' => 'nullable|boolean',
            'admissions_opens_at' => 'nullable|string|date',
            'footer_columns' => 'nullable|array',
            'admissions_hero_title' => 'nullable|string',
            'admissions_hero_desc' => 'nullable|string',
            'admissions_stats' => 'nullable|array',
            'scholarships_hero_title' => 'nullable|string',
            'scholarships_hero_desc' => 'nullable|string',
            'courses_hero_title' => 'nullable|string',
            'courses_hero_desc' => 'nullable|string',
            'auth_panel_title' => 'nullable|string',
            'auth_panel_desc' => 'nullable|string',
            'benefit_cards' => 'nullable|array',
            'experience_hero_title' => 'nullable|string',
            'experience_hero_desc' => 'nullable|string',
            'experience_features' => 'nullable|array',
            'about_hero_title' => 'nullable|string',
            'about_hero_desc' => 'nullable|string',
            'about_mission' => 'nullable|string',
            'about_leadership_title' => 'nullable|string',
            'about_history' => 'nullable|string',
        ]);

        $allowed = [
            'logo_url', 'logo_light_url', 'favicon_url', 'primary_color', 'accent_color', 
            'institutional_name', 'institutional_motto', 
            'hero_image', 'footer_text', 'admissions_enabled', 'admissions_opens_at',
            'footer_columns',
            'admissions_hero_title', 'admissions_hero_desc', 'admissions_stats',
            'scholarships_hero_title', 'scholarships_hero_desc',
            'courses_hero_title', 'courses_hero_desc',
            'auth_panel_title', 'auth_panel_desc',
            'benefit_cards',
            'experience_hero_title', 'experience_hero_desc', 'experience_features',
            'about_hero_title', 'about_hero_desc', 'about_mission', 'about_leadership_title', 'about_history'
        ];

        foreach ($request->only($allowed) as $key => $value) {
            if ($value !== null) {
                $type = is_bool($value) ? 'boolean' : (is_array($value) ? 'json' : 'string');
                $group = str_contains($key, 'admissions') ? 'system' : 'branding';
                
                $settingKey = $key;
                if (!str_contains($key, 'admissions') && !str_starts_with($key, 'branding_')) {
                    $settingKey = 'branding_' . str_replace('institutional_', '', $key);
                }

                SystemSetting::setVal($settingKey, $value, $type, $group);
            }
        }

    /**
     * Upload branding asset (logo/favicon).
     */
    public function uploadAsset(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:png,jpg,jpeg,webp,svg,ico|max:2048',
            'type' => 'required|string|in:logo,logo_light,favicon'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $filename = 'branding_' . $request->type . '_' . time() . '.' . $extension;
            
            // Destination path: web/assets
            $destinationPath = base_path('../assets');
            
            if (!is_dir($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);

            $url = '/assets/' . $filename;

            return response()->json([
                'success' => true,
                'url' => $url,
                'message' => 'Asset uploaded successfully'
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file provided'], 400);
    }
}
