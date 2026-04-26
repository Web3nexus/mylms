<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Admission Applications
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->string('current_step')->default('personal_info')->after('program_id');
            $table->json('step_data')->nullable()->after('current_step');
            
            // Adjust status if necessary (depends on DB driver, for sqlite/pg we can use change() or drop/add)
            // For safety across drivers, we'll ensure the database knows about the new statuses
        });

        // Add code to faculties for better ID generation
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('code')->nullable()->after('name');
        });

        // Add active status to programs
        Schema::table('programs', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('duration_years');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn('code');
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropColumn(['current_step', 'step_data']);
        });
    }
};
