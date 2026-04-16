<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\DB;

#[Signature('academic:promote-students')]
#[Description('Automatically evaluate student transcripts and promote their academic_level based on cumulative credits earned.')]
class PromoteStudents extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing Institutional Academic Promotion Protocol...');

        // Process only students
        $students = User::where('role', 'student')->get();
        $this->info("Evaluating {$students->count()} registered students.");

        DB::beginTransaction();

        try {
            $promotedCount = 0;

            foreach ($students as $student) {
                // Sum all earned credits from their transcripts
                $totalCredits = DB::table('transcripts')
                    ->where('user_id', $student->id)
                    ->sum('credits_earned');

                // Standard University Credit/Level Mapping
                // Level 100: 0 - 29
                // Level 200: 30 - 59
                // Level 300: 60 - 89
                // Level 400: 90+
                $newLevel = 100;
                if ($totalCredits >= 30) $newLevel = 200;
                if ($totalCredits >= 60) $newLevel = 300;
                if ($totalCredits >= 90) $newLevel = 400;

                if ($student->academic_level !== $newLevel) {
                    $oldLevel = $student->academic_level;
                    $student->academic_level = $newLevel;
                    $student->save();
                    
                    $this->info("Promoted Student [ID: {$student->id}] from Level {$oldLevel} to Level {$newLevel} (Credits: {$totalCredits})");
                    $promotedCount++;
                }

            }

            DB::commit();
            $this->info("SUCCESS: Authorized Promotion Protocol completed. Promoted {$promotedCount} students.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("CRITICAL FAILURE: Promotion Protocol halted. Rollback triggered. Error: " . $e->getMessage());
        }
    }
}
