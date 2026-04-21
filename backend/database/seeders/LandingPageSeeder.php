<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CMSPage;
use Illuminate\Support\Str;

class LandingPageSeeder extends Seeder
{
    public function run()
    {
        $cmsJson = [
            "content" => [
                [
                    "type" => "Hero",
                    "props" => [
                        "id" => "Hero-1",
                        "title" => "Unlock Your Worldwide Potential",
                        "titleColor" => "#edaa16",
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
                        "rightTitle" => "In Partnership With"
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
                                "_arrayId" => (string) Str::uuid(),
                                "name" => "Master's Degrees",
                                "programs" => [
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Business Administration (MBA)", "link" => "/programs/mba"],
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Computer Science (MSCS)", "link" => "/programs/mscs"]
                                ]
                            ],
                            [
                                "_arrayId" => (string) Str::uuid(),
                                "name" => "Bachelor's Degrees",
                                "programs" => [
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Computer Science", "link" => "/programs/bsc-cs"],
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Health Science", "link" => "/programs/bsc-health"]
                                ]
                            ],
                            [
                                "_arrayId" => (string) Str::uuid(),
                                "name" => "Associate's Degrees",
                                "programs" => [
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Business Administration", "link" => "/programs/as-ba"]
                                ]
                            ],
                            [
                                "_arrayId" => (string) Str::uuid(),
                                "name" => "Certificates",
                                "programs" => [
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Data Science", "link" => "/programs/cert-data"],
                                    ["_arrayId" => (string) Str::uuid(), "name" => "Finance", "link" => "/programs/cert-fin"]
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
                            ["_arrayId" => (string) Str::uuid(), "src" => "https://randomuser.me/api/portraits/women/44.jpg"],
                            ["_arrayId" => (string) Str::uuid(), "src" => "https://randomuser.me/api/portraits/men/46.jpg"],
                            ["_arrayId" => (string) Str::uuid(), "src" => "https://randomuser.me/api/portraits/women/48.jpg"]
                        ]
                    ]
                ],
                [
                    "type" => "FeaturedHighlights",
                    "props" => [
                        "id" => "FeaturedHighlights-1",
                        "title" => "Featured Tracks",
                        "items" => [
                            ["_arrayId" => (string) Str::uuid(), "category" => "Technology", "title" => "Software Engineering Fellowship", "image" => "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000", "link" => "/courses/software-engineering"],
                            ["_arrayId" => (string) Str::uuid(), "category" => "Business", "title" => "Global Supply Chain Management", "image" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000", "link" => "/courses/supply-chain"]
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
                            ["_arrayId" => (string) Str::uuid(), "question" => "Is it genuinely tuition-free?", "answer" => "Yes. You do not pay for instruction, reading materials, or campus fees. There are only nominal assessment fees per course."],
                            ["_arrayId" => (string) Str::uuid(), "question" => "Are the degrees recognized worldwide?", "answer" => "Absolutely. We are nationally accredited in the United States, meaning degrees belong to an elite tier of universally accepted institutional standards."]
                        ]
                    ]
                ],
                [
                    "type" => "FeatureGrid",
                    "props" => [
                        "id" => "FeatureGrid-1",
                        "items" => [
                            ["_arrayId" => (string) Str::uuid(), "title" => "Tuition-Free Model", "description" => "We believe higher education is a basic human right. You only pay nominal fees for course assessments.", "icon" => "shield"],
                            ["_arrayId" => (string) Str::uuid(), "title" => "American Accredited", "description" => "Earn a globally recognized, US-certified degree built by elite academic leadership.", "icon" => "graduation"],
                            ["_arrayId" => (string) Str::uuid(), "title" => "Flexible Learning", "description" => "Study 100% online, on a timeframe that perfectly suits your work and life commitments.", "icon" => "clock"]
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
        ];

        // Seed or update the root home page
        CMSPage::updateOrCreate(
            ['slug' => 'home'],
            [
                'title' => 'Global Landing Page',
                'is_published' => true,
                'is_core' => true,
                'puck_json' => $cmsJson
            ]
        );
    }
}
