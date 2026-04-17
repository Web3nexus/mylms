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
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->json('form_data')->after('program_id')->nullable();
            $table->foreignId('faculty_id')->after('form_data')->nullable()->constrained('faculties')->onDelete('set null');
            $table->foreignId('instructor_id')->after('faculty_id')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            //
        });
    }
};
