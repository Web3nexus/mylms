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
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->string('application_fee_status')->default('pending')->after('status'); // pending, waived, paid
            $table->timestamp('application_fee_waived_at')->nullable()->after('application_fee_status');
            $table->text('scholarship_reason')->nullable()->after('form_data');
            $table->string('scholarship_status')->default('not_applied')->after('scholarship_reason'); // pending, approved, rejected, renewed, revoked
            $table->string('scholarship_provider')->nullable()->after('scholarship_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admission_applications', function (Blueprint $table) {
            $table->dropColumn(['application_fee_status', 'application_fee_waived_at', 'scholarship_reason', 'scholarship_status', 'scholarship_provider']);
        });
    }
};
