<?php

namespace App\Console\Commands;

use App\Modules\Academic\Models\Department;
use Illuminate\Console\Command;

class AssignDepartmentCode extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lms:dept-code 
                            {dept_id? : The ID of the department} 
                            {code? : The 2-4 letter code (e.g. CS, ENG)} 
                            {--list : List all departments and their current codes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assigns a matriculation prefix code to a specific academic department.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('list')) {
            $this->listDepartments();
            return self::SUCCESS;
        }

        $id = $this->argument('dept_id');
        $code = $this->argument('code');

        if (!$id || !$code) {
            $this->error('You must provide both a department ID and a code, or use --list.');
            return self::FAILURE;
        }

        $department = Department::find($id);

        if (!$department) {
            $this->error("Department with ID {$id} not found.");
            return self::FAILURE;
        }

        $code = strtoupper($code);
        
        // Ensure another department doesn't already have this exact code if it matters
        // Although the unique constraint on DB might enforce it if we added one
        $existing = Department::where('code', $code)->where('id', '!=', $id)->first();
        if ($existing) {
            $this->error("The code '{$code}' is already assigned to '{$existing->name}' (ID: {$existing->id}).");
            return self::FAILURE;
        }

        $department->code = $code;
        $department->save();

        $this->info("Successfully assigned code '{$code}' to department: {$department->name}");
        return self::SUCCESS;
    }

    protected function listDepartments()
    {
        $depts = Department::all(['id', 'name', 'code']);

        if ($depts->isEmpty()) {
            $this->warn('No departments found in the system. Create one first.');
            return;
        }

        $this->table(
            ['ID', 'Department Name', 'Matric Code'],
            $depts->map(function ($d) {
                return [
                    $d->id,
                    $d->name,
                    $d->code ?? '<fg=red>UNASSIGNED</>'
                ];
            })->toArray()
        );
    }
}
