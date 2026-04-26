<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates the initial Super Admin account if none exists.
     */
    public function run(): void
    {
        // Check if any super admin exists
        if (User::where('is_super_admin', true)->exists() ||
            User::where('role', User::ROLE_SUPER_ADMIN)->exists()) {
            $this->command->info('Super Admin already exists. Skipping...');
            return;
        }

        // Create default super admin
        User::create([
            'name' => 'System Administrator',
            'email' => 'superadmin@mylms.edu',
            'password' => Hash::make('SuperAdmin@2026!'),
            'role' => User::ROLE_ADMIN,
            'is_super_admin' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Email: superadmin@mylms.edu');
        $this->command->info('Password: SuperAdmin@2026!');
        $this->command->warn('Please change the default password immediately after first login!');
    }
}
