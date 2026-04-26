<?php

namespace Database\Seeders;

use App\Modules\Collaboration\Models\Forum;
use App\Modules\Courses\Models\Course;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();

        foreach ($courses as $course) {
            Forum::create([
                'course_id' => $course->id,
                'name' => 'Official Unit Announcements',
                'description' => 'Instructor-led updates and scholarly notifications for ' . $course->title,
                'type' => 'announcement',
            ]);

            Forum::create([
                'course_id' => $course->id,
                'name' => 'Student Peer Forum',
                'description' => 'Connect with matriculated peers in official study groups.',
                'type' => 'general',
            ]);

            Forum::create([
                'course_id' => $course->id,
                'name' => 'Academic Inquiry (Q&A)',
                'description' => 'Dedicated space for specific unit content inquiries.',
                'type' => 'q&a',
            ]);
        }
    }
}
