<?php

namespace Database\Seeders;

use App\Models\CMSPage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CMSPageSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Home Page (Advanced Layout) — overridden by LandingPageSeeder
        CMSPage::updateOrCreate(['slug' => 'home'], [
            'title' => 'Education for All',
            'is_published' => true,
            'is_core' => true,
            'puck_json' => [
                'content' => [
                    [
                        'type' => 'Hero',
                        'props' => [
                            'id' => 'Hero-1',
                            'variant' => 'default',
                            'title' => 'The Education Revolution',
                            'description' => 'Tuition-free, accredited American online degrees for everyone, everywhere. Joining 137,000+ students globally.',
                            'buttonText' => 'Apply Now',
                            'buttonLink' => '/apply',
                            'bgImage' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070'
                        ]
                    ],
                    [
                        'type' => 'DualLogosStrip',
                        'props' => [
                            'id' => 'DualLogosStrip-1',
                            'leftTitle' => 'Accredited By',
                            'leftLogos' => [
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/The_New_York_Times_logo.svg/1280px-The_New_York_Times_logo.svg.png', 'alt' => 'NYT'],
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Harvard_University_logo.svg/1200px-Harvard_University_logo.svg.png', 'alt' => 'Harvard'],
                            ],
                            'rightTitle' => 'In Partnership With',
                            'rightLogos' => [
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/PBS_logo_vertical.svg/1200px-PBS_logo_vertical.svg.png', 'alt' => 'PBS'],
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/University_of_Edinburgh_logo.svg/1200px-University_of_Edinburgh_logo.svg.png', 'alt' => 'Edinburgh'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'ProgramGrid',
                        'props' => [
                            'id' => 'ProgramGrid-1',
                            'title' => 'Academic Degrees',
                            'description' => 'Select from our wide range of accredited degree programs designed for the global digital economy.',
                            'categories' => [
                                [
                                    '_arrayId' => (string) Str::uuid(),
                                    'name' => 'Master\'s Degrees',
                                    'programs' => [
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Education (M.Ed.)', 'link' => '/programs/med'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Business (MBA)', 'link' => '/programs/mba'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Information Technology', 'link' => '/programs/mit'],
                                    ]
                                ],
                                [
                                    '_arrayId' => (string) Str::uuid(),
                                    'name' => 'Bachelor\'s Degrees',
                                    'programs' => [
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Computer Science', 'link' => '/programs/cs'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Health Science', 'link' => '/programs/hs'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Business Admin', 'link' => '/programs/ba'],
                                    ]
                                ],
                                [
                                    '_arrayId' => (string) Str::uuid(),
                                    'name' => 'Associate\'s Degrees',
                                    'programs' => [
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Computer Science', 'link' => '/programs/acs'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Health Science', 'link' => '/programs/ahs'],
                                        ['_arrayId' => (string) Str::uuid(), 'name' => 'Business Admin', 'link' => '/programs/aba'],
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'TestimonialMosaic',
                        'props' => [
                            'id' => 'TestimonialMosaic-1',
                            'title' => 'Why Our Students Love Us',
                            'quote' => 'MyLMS removed financial barriers and empowered me as a learner. The transition from my local university to this global platform was the best decision of my career.',
                            'author' => 'Sarah Johnson',
                            'role' => 'Computer Science Graduate',
                            'avatars' => [
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'],
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'],
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150'],
                                ['_arrayId' => (string) Str::uuid(), 'src' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'AccordionFAQ',
                        'props' => [
                            'id' => 'AccordionFAQ-1',
                            'title' => 'Common Questions',
                            'items' => [
                                ['_arrayId' => (string) Str::uuid(), 'question' => 'Is MyLMS really tuition-free?', 'answer' => 'Yes! We do not charge for instruction or courses. We only charge minimal administrative fees to keep the platform running.'],
                                ['_arrayId' => (string) Str::uuid(), 'question' => 'Is the degree accredited?', 'answer' => 'Absolutely. We hold regional and international accreditations recognized by global employers.'],
                                ['_arrayId' => (string) Str::uuid(), 'question' => 'Can I study from any country?', 'answer' => 'Our platform is designed for global access. As long as you have an internet connection, you can earn your degree.'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'ResourcesGrid',
                        'props' => [
                            'id' => 'ResourcesGrid-1',
                            'title' => 'Featured Resources',
                            'resources' => [
                                ['_arrayId' => (string) Str::uuid(), 'title' => 'Transfer Guide', 'description' => 'Transfer your existing credits to MyLMS and earn your degree faster.', 'image' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=500'],
                                ['_arrayId' => (string) Str::uuid(), 'title' => 'AI in Education', 'description' => 'How MyLMS uses generative AI to provide 24/7 tutoring to every student.', 'image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=500'],
                                ['_arrayId' => (string) Str::uuid(), 'title' => 'Financial Transparency', 'description' => 'Download our white paper on how we maintain a tuition-free model.', 'image' => 'https://images.unsplash.com/photo-1454165833767-0274b0596d17?q=80&w=500'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'BottomApplyCTA',
                        'props' => [
                            'id' => 'BottomApplyCTA-1',
                            'title' => 'Looking for a brighter future?',
                            'studentCount' => '170,126',
                            'buttonText' => 'Apply Now'
                        ]
                    ]
                ],
                'root' => ['props' => ['title' => 'Home Page']]
            ]
        ]);

        // 2. Tuition Page
        CMSPage::updateOrCreate(['slug' => 'tuition'], [
            'title' => 'Tuition-Free Education',
            'is_published' => true,
            'is_core' => true,
            'puck_json' => [
                'content' => [
                    [
                        'type' => 'Hero',
                        'props' => [
                            'id' => 'Hero-tuition',
                            'title' => 'Scholarship & Fees',
                            'description' => 'Affordable, predictable, and transparent. We believe education is a human right, not a privilege.',
                            'buttonText' => 'View Programs',
                            'buttonLink' => '/programs',
                            'variant' => 'default',
                        ]
                    ],
                    [
                        'type' => 'AccordionFAQ',
                        'props' => [
                            'id' => 'AccordionFAQ-tuition',
                            'title' => 'Tuition Questions',
                            'items' => [
                                ['_arrayId' => (string) Str::uuid(), 'question' => 'How can it be tuition-free?', 'answer' => 'We utilize open-source resources, volunteer instructors from top universities, and a purely online model to eliminate the overhead costs of traditional campuses.'],
                                ['_arrayId' => (string) Str::uuid(), 'question' => 'What are the payment methods?', 'answer' => 'We support major international gateways including Stripe (Credit/Debit), Paystack (Africa), and Flutterwave. You can pay in your local currency.'],
                            ]
                        ]
                    ]
                ],
                'root' => ['props' => ['title' => 'Tuition & Fees']]
            ]
        ]);

        // 3. System Functional Pages
        $systemPages = [
            ['slug' => 'courses', 'title' => 'Academic Catalog', 'widget' => 'CourseCatalog'],
            ['slug' => 'scholarships', 'title' => 'Fund Registry', 'widget' => 'ScholarshipFinder'],
            ['slug' => 'admissions', 'title' => 'Academic Admissions', 'widget' => 'AdmissionsContent'],
            ['slug' => 'apply', 'title' => 'Candidate Enrollment', 'widget' => 'AdmissionForm'],
            ['slug' => 'experience', 'title' => 'Digital Experience', 'widget' => 'ExperienceContent'],
            ['slug' => 'about', 'title' => 'Institutional Heritage', 'widget' => 'AboutContent'],
        ];

        foreach ($systemPages as $p) {
            CMSPage::updateOrCreate(['slug' => $p['slug']], [
                'title' => $p['title'],
                'is_published' => true,
                'is_core' => true,
                'puck_json' => [
                    'content' => [
                        ['type' => $p['widget'], 'props' => ['id' => $p['widget'] . '-1']]
                    ],
                    'root' => ['props' => ['title' => $p['title']]]
                ]
            ]);
        }
    }
}
