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
            if (!Schema::hasColumn('programs', 'application_fee')) {
                $table->decimal('application_fee', 10, 2)->default(0)->after('tuition_fee');
            }
            if (!Schema::hasColumn('programs', 'is_scholarship_eligible')) {
                $table->boolean('is_scholarship_eligible')->default(true)->after('application_fee');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['application_fee', 'is_scholarship_eligible']);
        });
    }
};
