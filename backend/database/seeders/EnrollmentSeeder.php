<?php

namespace Database\Seeders;

use App\Modules\Academic\Models\Faculty;
use App\Modules\Academic\Models\Department;
use App\Modules\Academic\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Faculties
        $faculties = [
            ['name' => 'Faculty of Arts & Ancient Wisdom', 'code' => 'AAW'],
            ['name' => 'Faculty of Business & Innovation', 'code' => 'FBI'],
            ['name' => 'Faculty of Science & Digital Technology', 'code' => 'SDT'],
            ['name' => 'Faculty of Education & Social Sciences', 'code' => 'ESS'],
        ];

        foreach ($faculties as $f) {
            Faculty::updateOrCreate(['name' => $f['name']], [
                'slug' => Str::slug($f['name']),
                'code' => $f['code']
            ]);
        }

        // 2. Create Departments mapping
        $depts = [
            'Ancient African Studies' => 'AAW',
            'Business Management' => 'FBI',
            'Technology & IT' => 'SDT',
            'Psychology & Education' => 'ESS',
            'Media & Arts' => 'AAW',
            'Human Resources' => 'FBI',
        ];

        foreach ($depts as $deptName => $facultyCode) {
            $faculty = Faculty::where('code', $facultyCode)->first();
            Department::updateOrCreate(['name' => $deptName], [
                'faculty_id' => $faculty->id,
                'slug' => Str::slug($deptName),
                'code' => strtoupper(substr($deptName, 0, 2))
            ]);
        }

        // 3. Define Programs
        $programsData = [
            'Associate' => [
                'Associate Degree in Business Studies' => 'Business Management',
                'Associate Degree in African Spiritual Leadership' => 'Ancient African Studies',
                'Associate Degree in Social Media Management' => 'Media & Arts',
                'Associate in ICT & Technology Innovations' => 'Technology & IT',
                'Associate Degree in Media Studies' => 'Media & Arts',
                'Associate in Human Resource Management' => 'Human Resources',
                'Associate Degree in African History' => 'Ancient African Studies',
            ],
            'Bachelor' => [
                'BA in Ancient African Spirituality' => 'Ancient African Studies',
                'BA in Business Management & Innovation' => 'Business Management',
                'BSc in Human Resource Management' => 'Human Resources',
                'BA in Art & Media' => 'Media & Arts',
                'BA in African Art & Spirituality' => 'Media & Arts',
                'BA in Ancient African Languages' => 'Ancient African Studies',
                'BEd in Early Child Education' => 'Psychology & Education',
                'BA in Leadership & Politics' => 'Business Management',
                'B.Sc in Entrepreneurial Studies' => 'Business Management',
            ],
            'Master' => [
                'M.Ed Child Psychology (HONS)' => 'Psychology & Education',
                'Masters in IT Management' => 'Technology & IT',
                'Masters Degree in Human Resource Management' => 'Human Resources',
                'Masters of Art in Religion & Comparative Religious Studies' => 'Ancient African Studies',
                'Masters Degree in Business Management' => 'Business Management',
                'Masters Degree in Creative Art' => 'Media & Arts',
                'Masters Degree in Art & Comparative Religion' => 'Ancient African Studies',
                'Masters Degree in African History & Studies' => 'Ancient African Studies',
                'Masters of Art in African Art & Spirituality' => 'Media & Arts',
                'Masters African Deities & Spirituality' => 'Ancient African Studies',
            ],
            'PhD' => [
                'PhD Business Mgt & People (Research)' => 'Business Management',
                'PhD Ancient Technology & Research (Research)' => 'Technology & IT',
                'PhD in Business Management (Research)' => 'Business Management',
                'PhD in African History & Studies' => 'Ancient African Studies',
                'PhD in Leadership & People' => 'Business Management',
                'Customised PhD' => 'Ancient African Studies',
            ]
        ];

        foreach ($programsData as $level => $programs) {
            foreach ($programs as $progName => $deptName) {
                $dept = Department::where('name', $deptName)->first();
                Program::updateOrCreate(['name' => $progName], [
                    'department_id' => $dept->id,
                    'slug' => Str::slug($progName),
                    'degree_level' => $level,
                    'duration_years' => $this->getDuration($level),
                    'is_active' => true
                ]);
            }
        }
    }

    private function getDuration($level) {
        return match($level) {
            'Associate' => 2,
            'Bachelor' => 4,
            'Master' => 2,
            'PhD' => 3,
            default => 4
        };
    }
}
