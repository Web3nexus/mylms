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
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('provider');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('currency')->default('USD');
            $table->text('description')->nullable();
            $table->string('external_url');
            $table->date('deadline')->nullable();
            $table->json('tags')->nullable(); // e.g., ["STEM", "International"]
            $table->string('hash')->unique(); // to prevent duplicate insertion
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};
