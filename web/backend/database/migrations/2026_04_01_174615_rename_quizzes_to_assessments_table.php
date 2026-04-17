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
        // 1. Drop foreign keys referencing quizzes
        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['quiz_id']);
        });

        // 2. Rename the table
        Schema::rename('quizzes', 'assessments');

        // 3. Rename columns and re-add foreign keys
        Schema::table('questions', function (Blueprint $table) {
            $table->renameColumn('quiz_id', 'assessment_id');
        });
        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->renameColumn('quiz_id', 'assessment_id');
        });
        Schema::table('submissions', function (Blueprint $table) {
            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['assessment_id']);
            $table->renameColumn('assessment_id', 'quiz_id');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['assessment_id']);
            $table->renameColumn('assessment_id', 'quiz_id');
        });

        Schema::rename('assessments', 'quizzes');

        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
        });
        Schema::table('submissions', function (Blueprint $table) {
            $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
        });
    }
};
