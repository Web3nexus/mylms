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
        Schema::table('programs', function (Blueprint $table) {
            $table->string('pricing_type')->default('hybrid')->after('duration_years'); // free, paid, hybrid
            $table->decimal('tuition_fee', 10, 2)->default(0)->after('pricing_type');
            $table->decimal('certificate_fee', 10, 2)->default(0)->after('tuition_fee');
            $table->boolean('is_external')->default(false)->after('certificate_fee');
            $table->string('external_provider')->nullable()->after('is_external');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['pricing_type', 'tuition_fee', 'certificate_fee', 'is_external', 'external_provider']);
        });
    }
};
