<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Academic\Models\Faculty;
use App\Modules\Academic\Models\Department;
use App\Modules\Academic\Models\Program;
use Illuminate\Support\Str;

class AcademicProgramsSeeder extends Seeder
{
    public function run()
    {
        // Define standard faculties and departments to house these
        $faculty = Faculty::firstOrCreate(['name' => 'Faculty of Interdisciplinary Studies'], [
            'description' => 'A diverse faculty offering a breadth of general and specialized disciplines.'
        ]);

        $dept = Department::firstOrCreate(['name' => 'Department of Global Studies'], [
            'faculty_id' => $faculty->id,
            'code' => 'DGS',
            'slug' => 'global-studies'
        ]);

        $programs = [
            'Associate' => [
                'Associate Degree in Business Studies',
                'Associate Degree in African Spiritual Leadership',
                'Associate Degree in Social Media Management',
                'Associate in ICT & Technology Innovations',
                'Associate Degree in Media Studies',
                'Associate in Human Resource Management',
                'Associate Degree in African History'
            ],
            'Bachelor' => [
                'BA in Ancient African Spirituality',
                'BA in Business Management & Innovation',
                'BSc in Human Resource Management',
                'BA in Art & Media',
                'BA in African Art & Spirituality',
                'BA in Ancient African Languages',
                'BEd in Early Child Education',
                'BA in Leadership & Politics',
                'B.Sc in Entrepreneurial Studies'
            ],
            'Master' => [
                'M.Ed Child Psychology (HONS)',
                'Masters in IT Management',
                'Masters Degree in Human Resource Management',
                'Masters of Art in Religion & Comparative Religious Studies',
                'Masters Degree in Business Management',
                'Masters Degree in Creative Art',
                'Masters Degree in Art & Comparative Religion',
                'Masters Degree in African History & Studies',
                'Masters of Art in African Art & Spirituality',
                'Masters African Deities & Spirituality'
            ],
            'PhD' => [
                'PhD Business Mgt & People (Research)',
                'PhD Ancient Technology & Research (Research)',
                'PhD in Business Management (Research)',
                'PhD in African History & Studies',
                'PhD in Leadership & People',
                'Customised PhD'
            ]
        ];

        foreach ($programs as $level => $programList) {
            $duration = match($level) {
                'Associate' => 2,
                'Bachelor' => 4,
                'Master' => 2,
                'PhD' => 3,
                default => 4
            };

            foreach ($programList as $name) {
                Program::firstOrCreate(['name' => $name], [
                    'department_id' => $dept->id,
                    'slug' => Str::slug($name),
                    'degree_level' => $level,
                    'duration_years' => $duration,
                    'tuition_fee' => 0.00,
                    'application_fee' => 30.00,
                    'is_scholarship_eligible' => true
                ]);
            }
        }
    }
}
