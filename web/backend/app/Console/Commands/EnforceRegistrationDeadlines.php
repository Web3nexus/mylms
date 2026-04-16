<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\Academic\Models\Semester;
use Carbon\Carbon;

class EnforceRegistrationDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'academic:enforce-deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically scrutinizes current operational semesters and hard-locks their institutional registration status past the programmed registration deadlines.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing Institutional Deadline Enforcement Protocol limit checks...');

        $currentSemesters = Semester::where('is_current', true)
            ->where('registration_status', '=', 'open')
            ->whereNotNull('registration_deadline')
            ->get();

        if ($currentSemesters->isEmpty()) {
            $this->info('No operational academic periods breach deadlines at this moment.');
            return;
        }

        $now = Carbon::now()->startOfDay();
        $lockCount = 0;

        foreach ($currentSemesters as $semester) {
            $deadline = Carbon::parse($semester->registration_deadline)->startOfDay();

            if ($now->gt($deadline)) {
                $this->warn("Deadline violation detected for Semester [{$semester->name}]. Locking Institutional Registration Registry.");
                
                $semester->registration_status = 'closed';
                $semester->save();
                
                $lockCount++;
            }
        }

        if ($lockCount > 0) {
            $this->info("SUCCESS: Securely locked {$lockCount} academic operational periods. Admissions & active enrollments disabled globally.");
        } else {
            $this->info('Active semester deadlines are intact. Operational status nominal.');
        }
    }
}
