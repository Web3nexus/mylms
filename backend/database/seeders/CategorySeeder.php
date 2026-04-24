<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Courses\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Faculty of Computer Science', 'description' => 'Software engineering, AI, and computing systems.'],
            ['name' => 'Department of Business Administration', 'description' => 'Management, finance, and global trade.'],
            ['name' => 'Faculty of Law & Jurisprudence', 'description' => 'Legal studies and international law.'],
            ['name' => 'School of Health Sciences', 'description' => 'Medical research and nursing.'],
            ['name' => 'Architecture & Design', 'description' => 'Urban planning and structural design.'],
            ['name' => 'Department of Applied Physics', 'description' => 'Theoretical and experimental physics.'],
        ];

        foreach ($departments as $dept) {
            Category::updateOrCreate(['name' => $dept['name']], $dept);
        }
    }
}
