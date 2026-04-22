<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Academic\Models\Faculty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles
        User::updateOrCreate(['email' => 'admin@smartuni.edu'], [
            'name' => 'Systems Admin',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
        ]);

        User::updateOrCreate(['email' => 'instructor@smartuni.edu'], [
            'name' => 'Prof. Kwame Babangida',
            'password' => Hash::make('password'),
            'role' => User::ROLE_INSTRUCTOR,
        ]);

        User::updateOrCreate(['email' => 'student@smartuni.edu'], [
            'name' => 'Amara Mensah',
            'password' => Hash::make('password'),
            'role' => User::ROLE_STUDENT,
        ]);

        User::updateOrCreate(['email' => 'staff@smartuni.edu'], [
            'name' => 'Grace Adama (Registrar)',
            'password' => Hash::make('password'),
            'role' => User::ROLE_STAFF,
            'permissions' => ['admissions_portal', 'student_registry']
        ]);

        // 2. Create Initial Academic Structure
        $faculty = Faculty::firstOrCreate(['name' => 'Faculty of Engineering & Technology'], [
            'description' => 'The leading faculty for digital innovation and software engineering.'
        ]);

        $dept = $faculty->departments()->firstOrCreate(
            ['name' => 'Department of Computer Science'],
            ['code' => 'CS']
        );
        // Ensure the code is set on existing records too
        if (!$dept->code) { $dept->update(['code' => 'CS']); }

        $dept->programs()->firstOrCreate(['name' => 'BSc in Software Engineering'], [
            'degree_level' => 'BSc',
            'duration_years' => 4,
        ]);

        $dept->programs()->firstOrCreate(['name' => 'MSc in Data Science'], [
            'degree_level' => 'MSc',
            'duration_years' => 2,
        ]);

        $this->call(CMSPageSeeder::class);
        $this->call(LandingPageSeeder::class);
        $this->call(AcademicProgramsSeeder::class);
        $this->call(AdmissionFieldsSeeder::class);

        echo "Seeding completed successfully.\n";
    }
}
