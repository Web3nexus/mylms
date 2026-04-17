<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CMSPage;

class PlaceholderPagesSeeder extends Seeder
{
    public function run()
    {
        $pages = [
            // Academic Programs
            ['slug' => 'masters-degree', 'title' => "Master's Degree Programs"],
            ['slug' => 'bachelors-degree', 'title' => "Bachelor's Degree Programs"],
            ['slug' => 'associates-degree', 'title' => "Associate's Degree Programs"],
            ['slug' => 'certificates', 'title' => "Certificate Programs"],
            
            // Admissions
            ['slug' => 'tuition-free', 'title' => "Tuition-Free Model"],
            ['slug' => 'scholarships', 'title' => "Scholarship Opportunities"],
            ['slug' => 'apply', 'title' => "How to Apply"],
            ['slug' => 'calendar', 'title' => "Academic Calendars"],
            
            // About
            ['slug' => 'mission', 'title' => "Our Mission & Vision"],
            ['slug' => 'leadership', 'title' => "Academic Leadership"],
            ['slug' => 'accreditation', 'title' => "Accreditation & Quality"],
            ['slug' => 'catalog', 'title' => "University Catalog"],
            
            // Programs (Footer Strip)
            ['slug' => 'computer-science', 'title' => "BS in Computer Science"],
            ['slug' => 'business-admin', 'title' => "MBA Business Administration"],
            ['slug' => 'health-science', 'title' => "Associate in Health Science"],
            ['slug' => 'education', 'title' => "Master of Education"],
            ['slug' => 'psychology', 'title' => "Bachelor of Psychology"],
            ['slug' => 'data-science', 'title' => "Certificate in Data Science"],
        ];

        foreach ($pages as $pageData) {
            $this->createPage($pageData['slug'], $pageData['title']);
        }
    }

    private function createPage($slug, $title)
    {
        // Update existing or create new
        CMSPage::updateOrCreate(
            ['slug' => $slug],
            [
                'title' => $title,
                'puck_json' => json_encode([
                    'content' => [
                        [
                            'type' => 'Hero',
                            'props' => [
                                'title' => $title,
                                'description' => "This is the official institutional resource for $title at MyLMS University. Explore current protocols, academic standards, and leadership initiatives.",
                                'buttonText' => "Institutional Overview",
                                'buttonLink' => "#",
                                'variant' => 'default'
                            ]
                        ],
                        [
                            'type' => 'RichText',
                            'props' => [
                                'content' => "## Institutional Record & Public Information\n\nThis page serves as a centralized node for information regarding $title. As part of our commitment to transparency and academic excellence, MyLMS maintains rigorous documentation for all programs and administrative offices.\n\n### Current Initiatives\n- Standardized Accreditation Review\n- Global Access Integration\n- Research & Excellence Framework\n\nFor further inquiries or official documentation requests, please contact the Office of the Registrar or the respective department lead.",
                                'align' => 'left'
                            ]
                        ],
                        [
                            'type' => 'CTAStrip',
                            'props' => [
                                'text' => "Looking for more academic resources?",
                                'buttonText' => "Return to Portal",
                                'buttonLink' => "/portal",
                                'variant' => "primary"
                            ]
                        ]
                    ],
                    'root' => ['props' => ['title' => "MyLMS - $title"]]
                ]),
            ]
        );
    }
}
