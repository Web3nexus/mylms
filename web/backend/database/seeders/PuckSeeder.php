<?php

namespace Database\Seeders;

use App\Models\CMSPage;
use Illuminate\Database\Seeder;

class PuckSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. HOME PAGE
        CMSPage::updateOrCreate(
            ['slug' => '/'],
            [
                'title' => 'MyLMS Home',
                'puck_json' => [
                    'content' => [
                        [
                            'type' => 'Hero',
                            'props' => [
                                'title' => 'Quality Online Education. Tuition-Free.',
                                'description' => 'The first non-profit, American-accredited, tuition-free online university. Join our global community of 150,000+ students.',
                                'buttonText' => 'Apply Now',
                                'buttonLink' => '/register',
                                'bgImage' => 'https://images.unsplash.com/photo-1523050853063-bd80e295cc7f?auto=format&fit=crop&q=80&w=2000',
                                'id' => 'hero-1'
                            ]
                        ],
                        [
                            'type' => 'FeatureGrid',
                            'props' => [
                                'items' => [
                                    ['title' => 'Tuition-Free', 'description' => 'We believe higher education is a basic right. You only pay minimal processing fees.', 'icon' => 'shield'],
                                    ['title' => 'Flexibility', 'description' => '100% online courses tailored to your life and schedule.', 'icon' => 'clock'],
                                    ['title' => 'Global', 'description' => 'Students and faculty from over 200 countries and territories.', 'icon' => 'graduation'],
                                ],
                                'id' => 'features-1'
                            ]
                        ],
                        [
                            'type' => 'CTAStrip',
                            'props' => [
                                'text' => 'Take the first step towards your future today.',
                                'buttonText' => 'Explore Programs',
                                'buttonLink' => '/programs',
                                'variant' => 'secondary',
                                'id' => 'cta-1'
                            ]
                        ]
                    ],
                    'root' => ['props' => ['title' => 'MyLMS Home']]
                ]
            ]
        );

        // 2. PROGRAMS PAGE
        CMSPage::updateOrCreate(
            ['slug' => 'programs'],
            [
                'title' => 'Academic Programs',
                'puck_json' => [
                    'content' => [
                        [
                            'type' => 'Hero',
                            'props' => [
                                'title' => 'World-Class Degrees',
                                'description' => 'Explore our wide range of Undergraduate and Graduate programs designed for the global job market.',
                                'buttonText' => 'See Admission Requirements',
                                'buttonLink' => '/apply',
                                'bgImage' => 'https://images.unsplash.com/photo-1541339907198-e08756eaa589?auto=format&fit=crop&q=80&w=2000',
                                'id' => 'hero-2'
                            ]
                        ],
                        [
                            'type' => 'CTAStrip',
                            'props' => [
                                'text' => 'Not sure where to start?',
                                'buttonText' => 'Request Information',
                                'buttonLink' => '/apply',
                                'variant' => 'primary',
                                'id' => 'cta-2'
                            ]
                        ]
                    ],
                    'root' => ['props' => ['title' => 'Academic Programs']]
                ]
            ]
        );
    }
}
