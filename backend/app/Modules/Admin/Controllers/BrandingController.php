<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\CMSPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandingController extends Controller
{
    /**
     * Get all branding settings.
     */
    public function index()
    {
        $this->syncCorePages();
        
        $settings = [
            'logo_url' => SystemSetting::getVal('branding_logo_url', 'https://images.unsplash.com/photo-1523050853063-bd805a952113?q=80&w=200'),
            'logo_light_url' => SystemSetting::getVal('branding_logo_light_url', 'https://images.unsplash.com/photo-1523050853063-bd805a952113?q=80&w=200'),
            'favicon_url' => SystemSetting::getVal('branding_favicon_url', '/favicon.ico'),
            'primary_color' => SystemSetting::getVal('branding_primary_color', '#4b345d'),
            'accent_color' => SystemSetting::getVal('branding_accent_color', '#E90171'),
            'institutional_name' => SystemSetting::getVal('branding_name', config('app.name', 'MyLMS')),
            'institutional_motto' => SystemSetting::getVal('branding_motto', 'University Network Authority'),
            'hero_image' => SystemSetting::getVal('branding_hero_image', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070'),
            'footer_text' => SystemSetting::getVal('branding_footer', 'An accredited, American, tuition-free, online university dedicated to global access.'),
            'admissions_enabled' => SystemSetting::getVal('admissions_enabled', true),
            'admissions_opens_at' => SystemSetting::getVal('admissions_opens_at', '2026-09-01'),
            'about_hero_title' => SystemSetting::getVal('about_hero_title', 'Innovation in Education.'),
            'accreditor_logos' => SystemSetting::getVal('branding_accreditor_logos', []),
            'partner_logos' => SystemSetting::getVal('branding_partner_logos', []),
            'registrar_name' => SystemSetting::getVal('registrar_name', 'University Registrar'),
            'branding_seal_url' => SystemSetting::getVal('branding_seal_url', null),
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
            'about_hero_title' => 'nullable|string',
            'accreditor_logos' => 'nullable|array',
            'partner_logos' => 'nullable|array',
            'registrar_name' => 'nullable|string|max:100',
            'branding_seal_url' => 'nullable|string',
        ]);

        $allowed = [
            'logo_url', 'logo_light_url', 'favicon_url', 'primary_color', 'accent_color', 
            'institutional_name', 'institutional_motto', 
            'hero_image', 'footer_text', 'admissions_enabled', 'admissions_opens_at',
            'footer_columns', 'about_hero_title',
            'accreditor_logos', 'partner_logos',
            'registrar_name', 'branding_seal_url',
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

        return response()->json(['message' => 'Branding updated successfully', 'settings' => $this->index()->original]);
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

    /**
     * Sync branding-held page content to the CMS Registry.
     */
    private function syncCorePages()
    {
        $corePages = [
            'index' => [
                'title' => 'Landing Page Registry',
                'puck_json' => [
                    'content' => [
                        ['type' => 'Hero', 'props' => [
                            'title' => SystemSetting::getVal('admissions_hero_title', 'Shape Your Future.'),
                            'description' => SystemSetting::getVal('admissions_hero_desc', 'Join thousands of scholars worldwide.'),
                        ]]
                    ]
                ]
            ],
            'about' => [
                'title' => 'Institutional About Registry',
                'puck_json' => [
                    'content' => [
                        ['type' => 'Hero', 'props' => [
                            'title' => SystemSetting::getVal('about_hero_title', 'About Our Institution'),
                            'description' => SystemSetting::getVal('about_hero_desc', 'Founded on universal access.'),
                        ]],
                        ['type' => 'RichText', 'props' => [
                            'content' => SystemSetting::getVal('about_mission', 'Mission details...') . "\n\n" . SystemSetting::getVal('about_history', 'History details...')
                        ]]
                    ]
                ]
            ],
            'experience' => [
                'title' => 'Student Experience Registry',
                'puck_json' => [
                    'content' => [
                        ['type' => 'Hero', 'props' => [
                            'title' => SystemSetting::getVal('experience_hero_title', 'Your Global Campus'),
                            'description' => SystemSetting::getVal('experience_hero_desc', 'Experience world-class digital education.'),
                        ]]
                    ]
                ]
            ],
            'scholarships' => [
                'title' => 'Financial Aid & Scholarships Registry',
                'puck_json' => [
                    'content' => [
                        ['type' => 'Hero', 'props' => [
                            'title' => SystemSetting::getVal('scholarships_hero_title', 'Funding Your Journey'),
                            'description' => SystemSetting::getVal('scholarships_hero_desc', 'Explore grants and bursaries.'),
                        ]]
                    ]
                ]
            ],
            'courses' => [
                'title' => 'Academic Catalog Registry',
                'puck_json' => [
                    'content' => [
                        ['type' => 'Hero', 'props' => [
                            'title' => SystemSetting::getVal('courses_hero_title', 'Educational Pathways'),
                            'description' => SystemSetting::getVal('courses_hero_desc', 'Our comprehensive course catalog.'),
                        ]]
                    ]
                ]
            ],
        ];

        foreach ($corePages as $slug => $data) {
            CMSPage::firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $data['title'],
                    'puck_json' => $data['puck_json'],
                    'is_published' => true,
                    'is_core' => true
                ]
            );
        }
    }
}
