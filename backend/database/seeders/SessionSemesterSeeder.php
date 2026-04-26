<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SessionSemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Academic Session (Current Year)
        $sessionYear = Carbon::now()->year;
        $sessionName = $sessionYear . "/" . ($sessionYear + 1);
        
        $sessionId = DB::table('academic_sessions')->insertGetId([
            'name' => $sessionName,
            'start_date' => Carbon::create($sessionYear, 9, 1),
            'end_date' => Carbon::create($sessionYear + 1, 8, 31),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Create Semesters (Terms)
        $semesters = [
            [
                'name' => 'Fall',
                'start_date' => Carbon::create($sessionYear, 9, 1),
                'end_date' => Carbon::create($sessionYear, 12, 20),
                'is_current' => true,
            ],
            [
                'name' => 'Spring',
                'start_date' => Carbon::create($sessionYear + 1, 1, 10),
                'end_date' => Carbon::create($sessionYear + 1, 5, 15),
                'is_current' => false,
            ],
            [
                'name' => 'Summer',
                'start_date' => Carbon::create($sessionYear + 1, 6, 1),
                'end_date' => Carbon::create($sessionYear + 1, 8, 15),
                'is_current' => false,
            ],
        ];

        foreach ($semesters as $sem) {
            DB::table('semesters')->insert([
                'academic_session_id' => $sessionId,
                'name' => $sem['name'],
                'start_date' => $sem['start_date'],
                'end_date' => $sem['end_date'],
                'is_current' => $sem['is_current'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Academic sessions and terms seeded successfully.\n";
    }
}
