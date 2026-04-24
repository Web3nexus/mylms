<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // PostgreSQL/MySQL enum updates can be tricky, so we'll just allow string or modify
            $table->string('content_type')->default('text')->change();
            $table->string('file_path')->nullable()->after('content_data');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
};
