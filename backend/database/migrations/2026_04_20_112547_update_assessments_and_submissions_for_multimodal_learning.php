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
        Schema::table('assessments', function (Blueprint $table) {
            $table->string('type')->default('quiz')->after('title'); // quiz, assignment, peer_assignment
            $table->boolean('is_timed')->default(false)->after('type');
            $table->integer('duration_minutes')->nullable()->after('is_timed');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('assessment_id');
            $table->text('feedback')->nullable()->after('score');
            $table->string('status')->default('pending')->after('feedback'); // pending, graded, reviewed
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['graded_by']);
            $table->dropColumn(['file_path', 'feedback', 'status', 'graded_by']);
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_timed', 'duration_minutes']);
        });
    }
};
