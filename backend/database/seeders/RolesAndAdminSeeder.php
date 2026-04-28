<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        // Ensure a developer account exists for system maintenance
        User::updateOrCreate(
            ['email' => 'dev@mylms.edu'],
            [
                'name' => 'System Developer',
                'password' => Hash::make('Developer@2024'), // Default dev password
                'role' => 'developer',
                'is_super_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // Ensure at least one admin account exists
        User::updateOrCreate(
            ['email' => 'admin@mylms.edu'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('Admin@2024'),
                'role' => 'admin',
                'is_super_admin' => false,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Roles and Admin accounts seeded successfully.');
    }

    public function run(): void
    {
        $this->up();
    }
}
