<?php

namespace Database\Seeders;

use App\Models\Level;
use App\Models\Faculty;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create default faculty
        $faculty = Faculty::first();

        if (!$faculty) {
            $this->command->error('No faculty found. Run FacultySeeder first.');
            return;
        }

        $levels = [
            ['name' => 'Level 100', 'code' => '100', 'sort_order' => 1],
            ['name' => 'Level 200', 'code' => '200', 'sort_order' => 2],
            ['name' => 'Level 300', 'code' => '300', 'sort_order' => 3],
            ['name' => 'Level 400', 'code' => '400', 'sort_order' => 4],
            ['name' => 'Level 500', 'code' => '500', 'sort_order' => 5],
        ];

        foreach ($levels as $levelData) {
            Level::firstOrCreate(
                ['faculty_id' => $faculty->id, 'code' => $levelData['code']],
                $levelData
            );
        }

        $this->command->info('Levels created successfully!');
    }
}
