<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\Academic\Models\Semester;
use App\Modules\Academic\Models\AcademicSession;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RotateSemester extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'academic:rotate-semester {--force : Force rotation even if dates do not match}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Institutional Academic Term Rotation: Automatically concludes the current semester and initializes the next scheduled term.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing Institutional Academic Term Rotation Protocol...');

        $currentSemester = Semester::where('is_current', true)->first();

        if (!$currentSemester) {
            $this->warn('No currently active semester found. Searching for the earliest scheduled semester to initialize...');
            $nextSemester = Semester::orderBy('start_date', 'asc')->first();
        } else {
            $this->info("Current Active Semester: {$currentSemester->name} (Ends: {$currentSemester->end_date->format('Y-m-d')})");
            
            // Search for the next semester in chronological order
            $nextSemester = Semester::where('start_date', '>', $currentSemester->start_date)
                ->orderBy('start_date', 'asc')
                ->first();
        }

        if (!$nextSemester) {
            $this->error('CRITICAL: No future academic terms found in the institutional registry. Rotation aborted.');
            return;
        }

        if (!$this->option('force')) {
            $now = Carbon::now();
            if ($currentSemester && $now->lt($currentSemester->end_date)) {
                $this->error("The current semester [{$currentSemester->name}] has not reached its scheduled end date ({$currentSemester->end_date->format('Y-m-d')}). Use --force to override.");
                return;
            }
        }

        DB::beginTransaction();

        try {
            if ($currentSemester) {
                $currentSemester->is_current = false;
                $currentSemester->registration_status = 'closed';
                $currentSemester->save();
                $this->info("CONCLUDED: Semester [{$currentSemester->name}] has been archived.");
            }

            $nextSemester->is_current = true;
            $nextSemester->registration_status = 'open';
            $nextSemester->save();

            // Ensure the parent academic session is also active
            $session = $nextSemester->academicSession;
            if ($session && !$session->is_active) {
                AcademicSession::where('is_active', true)->update(['is_active' => false]);
                $session->is_active = true;
                $session->save();
                $this->info("ACTIVATED: Academic Session [{$session->name}] is now the master operational period.");
            }

            DB::commit();
            $this->info("SUCCESS: Global Institutional Rotation Complete. Active Term: [{$nextSemester->name}].");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("CRITICAL FAILURE: Institutional Rotation halted. Rollback triggered. Error: " . $e->getMessage());
        }
    }
}
