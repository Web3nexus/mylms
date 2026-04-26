<?php

namespace App\Modules\Admissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admissions\Models\AdmissionApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AdmissionWizardController extends Controller
{
    /**
     * Get user's current application progress.
     */
    public function index()
    {
        $application = AdmissionApplication::where('user_id', Auth::id())
            ->with(['program.department.faculty'])
            ->first();

        if (!$application) {
            // Initialize an empty application in 'incomplete' state
            $application = AdmissionApplication::create([
                'user_id' => Auth::id(),
                'status' => AdmissionApplication::STATUS_INCOMPLETE,
                'current_step' => AdmissionApplication::STEP_PERSONAL,
                'step_data' => []
            ]);
        }

        return response()->json($application);
    }

    /**
     * Save progress for a wizard step.
     */
    public function saveProgress(Request $request)
    {
        $user = Auth::user();
        $application = AdmissionApplication::firstOrCreate(
            ['user_id' => $user->id],
            ['status' => AdmissionApplication::STATUS_IN_PROGRESS]
        );

        if ($application->status === AdmissionApplication::STATUS_PENDING || $application->status === AdmissionApplication::STATUS_APPROVED) {
            return response()->json(['message' => 'Application is locked for editing.'], 422);
        }

        $validated = $request->validate([
            'step' => 'required|string',
            'data' => 'required|array',
            'program_id' => 'nullable|exists:programs,id'
        ]);

        $stepData = $application->step_data ?? [];
        $stepData[$validated['step']] = $validated['data'];

        $updateData = [
            'step_data' => $stepData,
            'current_step' => $validated['step'],
            'status' => AdmissionApplication::STATUS_IN_PROGRESS
        ];

        if (!empty($validated['program_id'])) {
            $updateData['program_id'] = $validated['program_id'];
        }

        // Handle document uploads if present in the 'data'
        if ($validated['step'] === AdmissionApplication::STEP_DOCUMENTS && $request->hasFile('files')) {
            $existingDocs = $application->documents ?? [];
            foreach ($request->file('files') as $key => $file) {
                $path = $file->store('admissions/' . $user->id, 'public');
                $existingDocs[$key] = $path;
            }
            $updateData['documents'] = $existingDocs;
        }

        $application->update($updateData);

        return response()->json($application);
    }

    /**
     * Final Submission.
     */
    public function submit(Request $request)
    {
        $application = AdmissionApplication::where('user_id', Auth::id())->firstOrFail();

        if ($application->status !== AdmissionApplication::STATUS_IN_PROGRESS) {
             return response()->json(['message' => 'Application cannot be submitted in its current state.'], 422);
        }

        // Check if auto-assign scholarship is enabled
        $autoAssign = \App\Models\SystemSetting::getVal('scholarship_auto_approval', true);
        $scholarshipId = null;

        if ($autoAssign) {
            $randomScholarship = \App\Models\Scholarship::inRandomOrder()->first();
            if ($randomScholarship) {
                $scholarshipId = $randomScholarship->id;
            }
        }
        
        $application->update([
            'status' => AdmissionApplication::STATUS_PENDING,
            'submitted_at' => now(),
            'scholarship_id' => $scholarshipId,
            'scholarship_status' => $scholarshipId ? AdmissionApplication::SCHOLARSHIP_PENDING : AdmissionApplication::SCHOLARSHIP_NOT_APPLIED
        ]);

        return response()->json(['message' => 'Your application has been submitted successfully!', 'application' => $application]);
    }
}
