<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create Badges Table
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('icon_url')->nullable();
            $table->string('criteria')->nullable(); // e.g. "registration", "course_completion"
            $table->timestamps();
        });

        // 2. Create User Badges Pivot Table
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('badge_id')->constrained()->cascadeOnDelete();
            $table->timestamp('awarded_at')->useCurrent();
            $table->unique(['user_id', 'badge_id']);
        });

        // 3. Add 2FA and Avatar to Users Table
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->boolean('two_factor_enabled')->default(false)->after('password');
            $table->text('two_factor_secret')->nullable()->after('two_factor_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_url', 'two_factor_enabled', 'two_factor_secret']);
        });
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
    }
};
