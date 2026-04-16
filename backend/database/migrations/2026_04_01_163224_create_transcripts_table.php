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
        Schema::create('transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->decimal('sgpa', 4, 2)->default(0.00); // Semester GPA
            $table->decimal('cgpa', 4, 2)->default(0.00); // Cumulative GPA at the end of this semester
            $table->integer('credits_earned')->default(0);
            $table->string('academic_standing')->default('Good Standing'); // 'Good Standing', 'Probation', 'Suspended'
            $table->timestamps();
            
            // A student should only have one transcript entry per semester natively hardcoded.
            $table->unique(['user_id', 'semester_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transcripts');
    }
};
