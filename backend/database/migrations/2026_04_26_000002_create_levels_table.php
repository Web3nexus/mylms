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
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code', 10); // 100, 200, 300, 400, etc.
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['faculty_id', 'code']);
        });

        // Add level_id to courses table
        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('level_id')->nullable()->constrained()->after('category_id')->onDelete('set null');
        });

        // Add level_id to users (for students)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('level_id')->nullable()->constrained()->after('program_id')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');
        });

        Schema::dropIfExists('levels');
    }
};
