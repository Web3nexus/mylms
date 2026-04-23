<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CMSPage;
use App\Modules\Academic\Models\AcademicEvent;
use App\Modules\Academic\Models\Semester;
use Illuminate\Support\Str;

class DynamicDashboardSeeder extends Seeder
{
    public function run()
    {
        // 1. Announcements
        $announcements = [
            [
                'title' => 'Final Exams Notice (Undergrad)',
                'slug' => 'announcement-exams-2026',
            ],
            [
                'title' => 'Course Evaluations (Week 8) - Now Active',
                'slug' => 'announcement-evaluations-w8',
            ],
            [
                'title' => 'Library Extended Hours for Final Week',
                'slug' => 'announcement-library-hours',
            ]
        ];

        foreach ($announcements as $a) {
            CMSPage::updateOrCreate(
                ['slug' => $a['slug']],
                [
                    'title' => $a['title'],
                    'is_published' => true,
                    'puck_json' => ['content' => []]
                ]
            );
        }

        // 2. Academic Events
        $currentSemester = Semester::where('is_current', true)->first();
        if ($currentSemester) {
            $events = [
                [
                    'title' => 'Mid-Semester Break',
                    'event_type' => 'holiday',
                    'start_date' => now()->addDays(10),
                    'end_date' => now()->addDays(14),
                ],
                [
                    'title' => 'Final Registry Cleanup',
                    'event_type' => 'registration',
                    'start_date' => now()->addDays(2),
                    'end_date' => now()->addDays(5),
                ],
                [
                    'title' => 'Graduation Orientation',
                    'event_type' => 'orientation',
                    'start_date' => now()->addDays(30),
                    'end_date' => now()->addDays(30),
                ]
            ];

            foreach ($events as $e) {
                AcademicEvent::create(array_merge($e, ['semester_id' => $currentSemester->id]));
            }
        }
    }
}
