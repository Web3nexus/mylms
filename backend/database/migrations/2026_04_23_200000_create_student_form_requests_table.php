<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_form_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // transcript, deferral, withdraw, id-renewal, readmission
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, processing, processed, rejected
            $table->string('reference')->unique()->nullable(); // e.g. FRM-8271
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_form_requests');
    }
};
