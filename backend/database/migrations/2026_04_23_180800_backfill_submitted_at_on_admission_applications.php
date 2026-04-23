<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Modules\Admissions\Models\AdmissionApplication;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill submitted_at for already submitted/processed applications
        AdmissionApplication::whereIn('status', [
            AdmissionApplication::STATUS_PENDING,
            AdmissionApplication::STATUS_APPROVED,
            AdmissionApplication::STATUS_REJECTED
        ])
        ->whereNull('submitted_at')
        ->each(function ($app) {
            $app->update(['submitted_at' => $app->created_at]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
