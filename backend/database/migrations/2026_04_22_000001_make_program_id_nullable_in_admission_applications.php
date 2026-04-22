<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Make program_id nullable so a blank application shell can be created
     * before the student selects a program in step 2 of the wizard.
     */
    public function up(): void
    {
        // Drop the foreign key constraint first, then alter, then re-add
        Schema::table('admission_applications', function (Blueprint $table) {
            // Drop the existing FK before changing column nullability
            $table->dropForeign(['program_id']);
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->foreignId('program_id')->nullable()->change();
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->foreign('program_id')
                  ->references('id')
                  ->on('programs')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->foreignId('program_id')->nullable(false)->change();
        });

        Schema::table('admission_applications', function (Blueprint $table) {
            $table->foreign('program_id')
                  ->references('id')
                  ->on('programs')
                  ->onDelete('cascade');
        });
    }
};
