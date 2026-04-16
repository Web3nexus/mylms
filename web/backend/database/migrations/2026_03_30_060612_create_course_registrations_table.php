<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add academic metadata to courses
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedInteger('credit_hours')->default(3)->after('price');
            $table->unsignedBigInteger('semester_id')->nullable()->after('credit_hours');
            $table->foreign('semester_id')->references('id')->on('semesters')->nullOnDelete();
        });

        // 2. Semester-based course registrations
        Schema::create('course_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('registered'); // registered, dropped, completed
            $table->decimal('grade', 4, 2)->nullable();
            $table->string('grade_letter')->nullable(); // A, B+, B, C+, etc.
            $table->timestamps();

            // Prevent duplicate registrations per semester
            $table->unique(['user_id', 'course_id', 'semester_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_registrations');

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['credit_hours', 'semester_id']);
        });
    }
};
