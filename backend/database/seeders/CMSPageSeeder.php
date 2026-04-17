<?php

namespace Database\Seeders;

use App\Models\CMSPage;
use Illuminate\Database\Seeder;

class CMSPageSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Home Page (Advanced Layout)
        CMSPage::updateOrCreate(['slug' => 'home'], [
            'title' => 'Education for All',
            'is_published' => true,
            'is_core' => true,
            'puck_json' => [
                'content' => [
                    [
                        'type' => 'Hero',
                        'props' => [
                            'variant' => 'uop',
                            'title' => 'The Education Revolution',
                            'description' => 'Tuition-free, accredited American online degrees for everyone, everywhere. Joining 137,000+ students globally.',
                            'buttonText' => 'Apply Now',
                            'buttonLink' => '/apply',
                            'bgImage' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070'
                        ]
                    ],
                    [
                        'type' => 'LogosStrip',
                        'props' => [
                            'title' => 'ACCREDITED & COLLABORATING WITH THE WORLD\'S BEST',
                            'logos' => [
                                ['src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/The_New_York_Times_logo.svg/1280px-The_New_York_Times_logo.svg.png', 'alt' => 'NYT'],
                                ['src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/PBS_logo_vertical.svg/1200px-PBS_logo_vertical.svg.png', 'alt' => 'PBS'],
                                ['src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Harvard_University_logo.svg/1200px-Harvard_University_logo.svg.png', 'alt' => 'Harvard'],
                                ['src' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/University_of_Edinburgh_logo.svg/1200px-University_of_Edinburgh_logo.svg.png', 'alt' => 'Edinburgh'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'ProgramGrid',
                        'props' => [
                            'title' => 'Academic Degrees',
                            'description' => 'Select from our wide range of accredited degree programs designed for the global digital economy.',
                            'categories' => [
                                [
                                    'name' => 'Master\'s Degrees',
                                    'programs' => [
                                        ['name' => 'Education (M.Ed.)', 'link' => '/programs/med'],
                                        ['name' => 'Business (MBA)', 'link' => '/programs/mba'],
                                        ['name' => 'Information Technology', 'link' => '/programs/mit'],
                                    ]
                                ],
                                [
                                    'name' => 'Bachelor\'s Degrees',
                                    'programs' => [
                                        ['name' => 'Computer Science', 'link' => '/programs/cs'],
                                        ['name' => 'Health Science', 'link' => '/programs/hs'],
                                        ['name' => 'Business Admin', 'link' => '/programs/ba'],
                                    ]
                                ],
                                [
                                    'name' => 'Associate\'s Degrees',
                                    'programs' => [
                                        ['name' => 'Computer Science', 'link' => '/programs/acs'],
                                        ['name' => 'Health Science', 'link' => '/programs/ahs'],
                                        ['name' => 'Business Admin', 'link' => '/programs/aba'],
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'TestimonialMosaic',
                        'props' => [
                            'title' => 'Why Our Students Love Us',
                            'quote' => 'MyLMS removed financial barriers and empowered me as a learner. The transition from my local university to this global platform was the best decision of my career.',
                            'author' => 'Sarah Johnson',
                            'role' => 'Computer Science Graduate',
                            'avatars' => [
                                ['src' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150'],
                                ['src' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'],
                                ['src' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150'],
                                ['src' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'AccordionFAQ',
                        'props' => [
                            'title' => 'Common Questions',
                            'items' => [
                                ['question' => 'Is MyLMS really tuition-free?', 'answer' => 'Yes! We do not charge for instruction or courses. We only charge minimal administrative fees to keep the platform running.'],
                                ['question' => 'Is the degree accredited?', 'answer' => 'Absolutely. We hold regional and international accreditations recognized by global employers.'],
                                ['question' => 'Can I study from any country?', 'answer' => 'Our platform is designed for global access. As long as you have an internet connection, you can earn your degree.'],
                            ]
                        ]
                    ],
                    [
                        'type' => 'ResourcesGrid',
                        'props' => [
                            'title' => 'Featured Resources',
                            'resources' => [
                                [
                                    'title' => 'Transfer Guide',
                                    'description' => 'Transfer your existing credits to MyLMS and earn your degree faster.',
                                    'image' => 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=500'
                                ],
                                [
                                    'title' => 'AI in Education',
                                    'description' => 'How MyLMS uses generative AI to provide 24/7 tutoring to every student.',
                                    'image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=500'
                                ],
                                [
                                    'title' => 'Financial Transparency',
                                    'description' => 'Download our white paper on how we maintain a tuition-free model.',
                                    'image' => 'https://images.unsplash.com/photo-1454165833767-0274b0596d17?q=80&w=500'
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'BottomApplyCTA',
                        'props' => [
                            'title' => 'Looking for a brighter future?',
                            'studentCount' => '170,126',
                            'buttonText' => 'Apply Now'
                        ]
                    ]
                ],
                'root' => ['props' => ['title' => 'Home Page']]
            ]
        ]);

        // 2. Tuition Page (Advanced Layout)
        CMSPage::updateOrCreate(['slug' => 'tuition'], [
            'title' => 'Tuition-Free Education',
            'is_published' => true,
            'is_core' => true,
            'puck_json' => [
                'content' => [
                    [
                        'type' => 'Hero',
                        'props' => [
                            'title' => 'Scholarship & Fees',
                            'description' => 'Affordable, predictable, and transparent. We believe education is a human right, not a privilege.',
                            'buttonText' => 'View Programs',
                            'buttonLink' => '/programs',
                        ]
                    ],
                    [
                        'type' => 'FlexColumns',
                        'props' => [
                            'layout' => '50-50'
                        ],
                        'zones' => [
                            'left' => [
                                [
                                    'type' => 'PricingCard',
                                    'props' => [
                                        'title' => 'Application Fee',
                                        'amount' => '60',
                                        'symbol' => '$',
                                        'frequency' => 'one-time',
                                        'features' => [['text' => 'Secure Admission Protocol'], ['text' => 'Document Verification'], ['text' => 'Registry Enrollment']],
                                        'buttonText' => 'Start Application',
                                        'buttonLink' => '/apply',
                                        'isFeatured' => false
                                    ]
                                ]
                            ],
                            'right' => [
                                [
                                    'type' => 'PricingCard',
                                    'props' => [
                                        'title' => 'Course Assessment',
                                        'amount' => '120',
                                        'symbol' => '$',
                                        'frequency' => 'per exam',
                                        'features' => [['text' => 'Proctored Assessment'], ['text' => 'Course Materials Included'], ['text' => 'Instructor Support']],
                                        'buttonText' => 'Register Now',
                                        'buttonLink' => '/apply',
                                        'isFeatured' => true
                                    ]
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'FAQAccordion',
                        'props' => [
                            'items' => [
                                [
                                    'question' => 'How can it be tuition-free?',
                                    'answer' => 'We utilize open-source resources, volunteer instructors from top universities, and a purely online model to eliminate the overhead costs of traditional campuses.'
                                ],
                                [
                                    'question' => 'What are the payment methods?',
                                    'answer' => 'We support major international gateways including Stripe (Credit/Debit), Paystack (Africa), and Flutterwave. You can pay in your local currency.'
                                ]
                            ]
                        ]
                    ]
                ],
                'root' => ['props' => ['title' => 'Tuition & Fees']]
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
                        ['type' => $p['widget'], 'props' => []]
                    ],
                    'root' => ['props' => ['title' => $p['title']]]
                ]
            ]);
        }
    }
}
