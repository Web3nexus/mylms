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
            'title' => 'Global Landing Page',
            'is_published' => true,
            'is_core' => true,
            'puck_json' => [
                "content" => [
                    [
                        "type" => "Hero",
                        "props" => [
                            "id" => "Hero-1",
                            "title" => "Unlock Your Worldwide Potential",
                            "description" => "A tuition-free, accredited American online university dedicated to ensuring global access to higher education.",
                            "buttonText" => "Start Your Application",
                            "buttonLink" => "/apply",
                            "bgImage" => "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
                            "variant" => "split-gradient"
                        ]
                    ],
                    [
                        "type" => "DualLogosStrip",
                        "props" => [
                            "id" => "DualLogosStrip-1",
                            "leftTitle" => "Accredited By",
                            "leftLogos" => [
                                [
                                    "src" => "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
                                    "alt" => "DEAC Accreditation"
                                ],
                                [
                                    "src" => "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
                                    "alt" => "WASC Accreditation"
                                ]
                            ],
                            "rightTitle" => "In Partnership With",
                            "rightLogos" => [
                                [
                                    "src" => "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/800px-IBM_logo.svg.png",
                                    "alt" => "IBM"
                                ],
                                [
                                    "src" => "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
                                    "alt" => "Amazon AWS"
                                ]
                            ]
                        ]
                    ],
                    [
                        "type" => "ProgramGrid",
                        "props" => [
                             "id" => "ProgramGrid-1",
                             "title" => "World-Class Academic Programs",
                             "description" => "Explore our fully accredited degrees designed by elite academic leadership from top global universities.",
                             "categories" => [
                                 [
                                     "name" => "Master's Degrees",
                                     "programs" => [
                                         [ "name" => "Business Administration (MBA)", "link" => "/programs/mba" ],
                                         [ "name" => "Computer Science (MSCS)", "link" => "/programs/mscs" ]
                                     ]
                                 ],
                                 [
                                     "name" => "Bachelor's Degrees",
                                     "programs" => [
                                         [ "name" => "Computer Science", "link" => "/programs/bsc-cs" ],
                                         [ "name" => "Health Science", "link" => "/programs/bsc-health" ]
                                     ]
                                 ],
                                 [
                                     "name" => "Associate's Degrees",
                                     "programs" => [
                                         [ "name" => "Business Administration", "link" => "/programs/as-ba" ],
                                     ]
                                 ],
                                 [
                                     "name" => "Certificates",
                                     "programs" => [
                                         [ "name" => "Data Science", "link" => "/programs/cert-data" ],
                                         [ "name" => "Finance", "link" => "/programs/cert-fin" ]
                                     ]
                                 ]
                             ]
                        ]
                    ],
                    [
                        "type" => "TestimonialMosaic",
                        "props" => [
                            "id" => "TestimonialMosaic-1",
                            "title" => "Student Success",
                            "quote" => "MyLMS provided me the academic flexibility to earn my Computer Science degree while working full-time in my home country.",
                            "author" => "Sarah J.",
                            "role" => "B.Sc Computer Science Graduate",
                            "avatars" => [
                                [ "src" => "https://randomuser.me/api/portraits/women/44.jpg" ],
                                [ "src" => "https://randomuser.me/api/portraits/men/46.jpg" ],
                                [ "src" => "https://randomuser.me/api/portraits/women/48.jpg" ]
                            ]
                        ]
                    ],
                    [
                        "type" => "FeaturedHighlights",
                        "props" => [
                            "id" => "FeaturedHighlights-1",
                            "title" => "Featured Tracks",
                            "items" => [
                                 [
                                     "category" => "Technology",
                                     "title" => "Software Engineering Fellowship",
                                     "image" => "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
                                     "link" => "/courses/software-engineering"
                                 ],
                                 [
                                     "category" => "Business",
                                     "title" => "Global Supply Chain Management",
                                     "image" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000",
                                     "link" => "/courses/supply-chain"
                                 ]
                            ]
                        ]
                    ],
                    [
                        "type" => "DirectorLetter",
                        "props" => [
                            "id" => "DirectorLetter-1",
                            "title" => "From the Desk of the Academic Director",
                            "message" => "Welcome to an institution built entirely for you. \n\nWe recognize that talent is equally distributed globally, but opportunity is not. We believe that a high-quality education should be a fundamental human right. \n\nI invite you to explore our rigorous, peer-supported programs, and realize the limitless future waiting for you.",
                            "directorName" => "Shai Reshef",
                            "directorRole" => "Academic Director & Founder",
                            "directorImage" => "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000",
                            "signatureImage" => "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/John_Doe_signature.svg/512px-John_Doe_signature.svg.png"
                        ]
                    ],
                    [
                        "type" => "AccordionFAQ",
                        "props" => [
                             "id" => "AccordionFAQ-1",
                             "title" => "Frequently Asked Questions",
                             "items" => [
                                 [
                                     "question" => "Is it genuinely tuition-free?",
                                     "answer" => "Yes. You do not pay for instruction, reading materials, or campus fees. There are only nominal assessment fees per course."
                                 ],
                                 [
                                     "question" => "Are the degrees recognized worldwide?",
                                     "answer" => "Absolutely. We are nationally accredited in the United States, meaning degrees belong to an elite tier of universally accepted institutional standards."
                                 ]
                             ]
                        ]
                    ],
                    [
                        "type" => "FeatureGrid",
                        "props" => [
                            "id" => "FeatureGrid-1",
                            "items" => [
                                [
                                    "title" => "Tuition-Free Model",
                                    "description" => "We believe higher education is a basic human right. You only pay nominal fees for course assessments.",
                                    "icon" => "shield"
                                ],
                                [
                                    "title" => "American Accredited",
                                    "description" => "Earn a globally recognized, US-certified degree built by elite academic leadership.",
                                    "icon" => "graduation"
                                ],
                                [
                                    "title" => "Flexible Learning",
                                    "description" => "Study 100% online, on a timeframe that perfectly suits your work and life commitments.",
                                    "icon" => "clock"
                                ]
                            ]
                        ]
                    ],
                    [
                        "type" => "BottomApplyCTA",
                        "props" => [
                            "id" => "BottomApplyCTA-1",
                            "title" => "Join Our Global Classroom",
                            "studentCount" => "137,492",
                            "buttonText" => "Start Your Application"
                        ]
                    ]
                ],
                "root" => [
                    "props" => [
                        "title" => "Home"
                    ]
                ]
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
                        ['type' => $p['widget'], 'props' => []]
                    ],
                    'root' => ['props' => ['title' => $p['title']]]
                ]
            ]);
        }
    }
}
