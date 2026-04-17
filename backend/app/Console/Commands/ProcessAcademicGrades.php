<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Modules\Academic\Models\Semester;
use App\Modules\Courses\Models\CourseRegistration;
use App\Services\GradeCalculationService;

class ProcessAcademicGrades extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'academic:calculate-gpa {--semester= : The Semester ID to process. Defaults to current semester.}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process and harden student grades, calculate SGPAs/CGPAs, and record them to the global transcripts registry.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing Institutional Academic Grade Processor...');

        $semesterId = $this->option('semester');
        if ($semesterId) {
            $semester = Semester::find($semesterId);
        } else {
            $semester = Semester::where('is_current', true)->first();
        }

        if (!$semester) {
            $this->error('CRITICAL: Target semester not found or no current semester active.');
            return;
        }

        $this->info("Processing grades for Semester: {$semester->name} [ID: {$semester->id}]");

        // Process only students
        $students = User::where('role', 'student')->get();
        $this->info("Found {$students->count()} registered students.");

        DB::beginTransaction();

        try {
            $processedCount = 0;

            foreach ($students as $student) {
                // Fetch this semester's registrations
                $semesterRegistrations = CourseRegistration::with('course')
                    ->where('user_id', $student->id)
                    ->where('semester_id', $semester->id)
                    ->get();
                
                if ($semesterRegistrations->isEmpty()) {
                    continue; // Student had no courses this semester.
                }

                $sgpa = GradeCalculationService::calculateSGPA($semesterRegistrations);

                // Fetch all historical registrations to calculate CGPA and Total Credits
                $allRegistrations = CourseRegistration::with('course')
                    ->where('user_id', $student->id)
                    // only calculate up to this semester (in a real app, order by semester date)
                    ->get();
                
                $cgpa = GradeCalculationService::calculateSGPA($allRegistrations);

                foreach ($semesterRegistrations as $reg) {
                    if ($reg->grade !== null && $reg->status !== 'dropped') {
                        $scale = GradeCalculationService::getGradeScale($reg->grade);
                        
                        // Sync letter grade back to registration if missing or changed
                        if ($reg->grade_letter !== $scale['letter']) {
                            $reg->grade_letter = $scale['letter'];
                            $reg->save();
                        }

                        if ($scale['points'] > 0) { // F is 0 points, doesn't earn credit
                            $creditsEarned += ($reg->course->credit_hours ?? 3);
                        }
                    }
                }

                // Determine Academic Standing based on CGPA
                $standing = 'Good Standing';
                if ($cgpa < 2.0) {
                    $standing = 'Probation';
                }
                if ($cgpa < 1.0) {
                    $standing = 'Suspended';
                }

                // Upsert to transcript hard-storage table
                DB::table('transcripts')->updateOrInsert(
                    [
                        'user_id' => $student->id,
                        'semester_id' => $semester->id
                    ],
                    [
                        'sgpa' => $sgpa,
                        'cgpa' => $cgpa,
                        'credits_earned' => $creditsEarned,
                        'academic_standing' => $standing,
                        'updated_at' => now(),
                        'created_at' => now(), // updateOrInsert handles this safely enough natively but DB builder needs it
                    ]
                );

                $processedCount++;
            }

            DB::commit();
            $this->info("SUCCESS: Authorized Institutional Grading Protocol completed. Hardened {$processedCount} transcripts to the registry.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("CRITICAL FAILURE: Institutional Grading halted. Rollback triggered. Error: " . $e->getMessage());
        }
    }
}
