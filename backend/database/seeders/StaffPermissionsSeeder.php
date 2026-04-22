<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffPermissionsSeeder extends Seeder
{
    /**
     * Run the staff specific seeds.
     */
    public function run(): void
    {
        // Add sample Registrar Staff
        User::updateOrCreate(['email' => 'registrar@smartuni.edu'], [
            'name' => 'Alice Johnson (Registrar)',
            'password' => Hash::make('password'),
            'role' => User::ROLE_STAFF,
            'permissions' => ['admissions_portal', 'student_registry']
        ]);

        // Add sample Finance Staff
        User::updateOrCreate(['email' => 'finance@smartuni.edu'], [
            'name' => 'Bob Smith (Bursar)',
            'password' => Hash::make('password'),
            'role' => User::ROLE_STAFF,
            'permissions' => ['finance_bursary']
        ]);

        // Add sample Content Manager
        User::updateOrCreate(['email' => 'content@smartuni.edu'], [
            'name' => 'Charlie Day (CMS)',
            'password' => Hash::make('password'),
            'role' => User::ROLE_STAFF,
            'permissions' => ['cms_marketing', 'branding_identity']
        ]);

        echo "Staff feature seeds completed successfully.\n";
    }
}
