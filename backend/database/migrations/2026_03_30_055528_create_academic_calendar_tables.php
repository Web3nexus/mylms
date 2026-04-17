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
        // 1. Academic Sessions (e.g., 2026/2027 Academic Year)
        Schema::create('academic_sessions', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('name')->unique(); // e.g. 2026/2027
            $blueprint->date('start_date');
            $blueprint->date('end_date');
            $blueprint->boolean('is_active')->default(false);
            $blueprint->timestamps();
        });

        // 2. Semesters (e.g., Fall 2026, Spring 2027)
        Schema::create('semesters', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            $blueprint->string('name'); // e.g. Fall, Spring, Summer
            $blueprint->date('start_date');
            $blueprint->date('end_date');
            $blueprint->boolean('is_current')->default(false);
            $blueprint->timestamps();
        });

        // 3. Academic Events (Calendar items)
        Schema::create('academic_events', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('semester_id')->nullable()->constrained()->cascadeOnDelete();
            $blueprint->string('title');
            $blueprint->text('description')->nullable();
            $blueprint->string('event_type'); // registration, exam, holiday, orientation
            $blueprint->dateTime('start_date');
            $blueprint->dateTime('end_date');
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_events');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('academic_sessions');
    }
};
