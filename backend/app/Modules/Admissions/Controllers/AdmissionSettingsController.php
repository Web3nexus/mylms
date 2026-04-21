<?php

namespace App\Modules\Admissions\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;

class AdmissionSettingsController extends Controller
{
    /**
     * Get all admission institutional settings.
     */
    public function index()
    {
        return response()->json([
            'admission_fee_waiver_delay_minutes' => SystemSetting::getVal('admission_fee_waiver_delay_minutes', 5),
            'scholarship_auto_approval' => SystemSetting::getVal('scholarship_auto_approval', true),
            'admission_email_delay_hours' => SystemSetting::getVal('admission_email_delay_hours', 24),
            'scholarship_renewal_min_gpa' => SystemSetting::getVal('scholarship_renewal_min_gpa', 2.0),
            
            // Enrollment Protocol Keys
            'is_enrollment_open' => SystemSetting::getVal('is_enrollment_open', true),
            'enrollment_start_date' => SystemSetting::getVal('enrollment_start_date', now()->toDateTimeString()),
            'enrollment_end_date' => SystemSetting::getVal('enrollment_end_date', now()->addMonths(3)->toDateTimeString()),
            'enrollment_quota' => SystemSetting::getVal('enrollment_quota', 1000),
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'admission_fee_waiver_delay_minutes' => 'nullable|integer|min:0',
            'scholarship_auto_approval' => 'nullable|boolean',
            'admission_email_delay_hours' => 'nullable|integer|min:0',
            'scholarship_renewal_min_gpa' => 'nullable|numeric|min:0',
            'is_enrollment_open' => 'nullable|boolean',
            'enrollment_start_date' => 'nullable|string',
            'enrollment_end_date' => 'nullable|string',
            'enrollment_quota' => 'nullable|integer|min:1',
        ]);

        foreach ($validated as $key => $value) {
            $type = is_bool($value) ? 'boolean' : (is_numeric($value) ? (is_int($value) ? 'integer' : 'float') : 'string');
            SystemSetting::setVal($key, $value, $type, 'admissions');
        }

        return $this->index();
    }
}
