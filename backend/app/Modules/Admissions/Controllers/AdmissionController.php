<?php

namespace App\Modules\Admissions\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFeeWaiverJob;
use App\Jobs\SendAdmissionEmailJob;
use App\Models\SystemSetting;
use App\Models\User;
use App\Modules\Admissions\Models\AdmissionApplication;
use App\Modules\Admissions\Models\AdmissionOffer;
use App\Services\ScholarshipEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Notifications\AdmissionStatusUpdated;

class AdmissionController extends Controller
{
    /**
     * List applications for Admin.
     */
    public function index()
    {
        return response()->json(
            AdmissionApplication::with(['user', 'program', 'faculty', 'instructor'])
                ->latest()
                ->get()
        );
    }

    /**
     * Get user's current application (or create a blank one).
     * program_id is intentionally omitted on creation — the user selects
     * it in step 2 of the wizard. We handle the DB constraint gracefully
     * in case the nullable migration has not yet been run on this server.
     */
    public function myApplication()
    {
        $user = Auth::user();

        $application = AdmissionApplication::with(['program', 'offer', 'user', 'faculty', 'instructor'])
            ->where('user_id', $user->id)
            ->first();

        // Auto-create a blank application shell on first visit
        if (!$application) {
            try {
                // First try: attempt the insert without program_id.
                // This succeeds once the nullable migration has been applied.
                $application = new AdmissionApplication();
                $application->user_id                = $user->id;
                $application->status                 = AdmissionApplication::STATUS_INCOMPLETE;
                $application->application_fee_status = AdmissionApplication::FEE_PENDING;
                $application->scholarship_status     = AdmissionApplication::SCHOLARSHIP_NOT_APPLIED;
                $application->current_step           = AdmissionApplication::STEP_PERSONAL;
                $application->step_data              = [];
                $application->save();

            } catch (\Illuminate\Database\QueryException $e) {
                // Fallback: if program_id column is still NOT NULL (migration not yet run),
                // alter the column inline then retry.
                if ($e->getCode() === '23502') {
                    try {
                        \Illuminate\Support\Facades\DB::statement(
                            'ALTER TABLE admission_applications ALTER COLUMN program_id DROP NOT NULL'
                        );
                        $application = new AdmissionApplication();
                        $application->user_id                = $user->id;
                        $application->status                 = AdmissionApplication::STATUS_INCOMPLETE;
                        $application->application_fee_status = AdmissionApplication::FEE_PENDING;
                        $application->scholarship_status     = AdmissionApplication::SCHOLARSHIP_NOT_APPLIED;
                        $application->current_step           = AdmissionApplication::STEP_PERSONAL;
                        $application->step_data              = [];
                        $application->save();
                    } catch (\Exception $inner) {
                        \Illuminate\Support\Facades\Log::error('Failed to auto-fix program_id constraint', [
                            'error' => $inner->getMessage()
                        ]);
                        return response()->json([
                            'message' => 'Application setup failed. Please contact support.'
                        ], 500);
                    }
                } else {
                    throw $e;
                }
            }
        }

        $application = $application->load(['program', 'offer', 'user', 'faculty', 'instructor']);
        $delayMinutes = (int) SystemSetting::getVal('admission_fee_waiver_delay_minutes', 5);

        // SELF-HEALING: If waiver delay has passed, auto-waive now (bypasses local queue issues)
        if ($application->application_fee_status === AdmissionApplication::FEE_PENDING && 
            $application->waiver_requested_at && 
            $application->waiver_requested_at->addMinutes($delayMinutes)->isPast()) {
            
            $application->update([
                'application_fee_status' => AdmissionApplication::FEE_WAIVED,
                'application_fee_waived_at' => now()
            ]);
            
            // Execute the success sequence (emails/notifications) immediately
            try {
                \App\Jobs\ProcessFeeWaiverJob::dispatch($application->id);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failsafe Waiver Job Error: ' . $e->getMessage());
            }

            $application = $application->fresh(['program', 'offer', 'user', 'faculty', 'instructor']);
        }

        $res = $application->toArray();
        $res['admission_fee_waiver_delay_minutes'] = $delayMinutes;
        $res['server_time'] = now()->toIso8601String();
        
        return response()->json($res);
    }

    // ─────────────────────────────────────────────────────────────
    //  FEE & WAIVER
    // ─────────────────────────────────────────────────────────────

    /**
     * Simulate paying the application fee (mock – no gateway).
     */
    public function payFee(Request $request)
    {
        $application = AdmissionApplication::where('user_id', Auth::id())->first();

        if (!$application) {
            return response()->json(['message' => 'Academic Protocol Error: Your admission record could not be localized. Please initiate the registry from the dashboard.'], 404);
        }

        if ($application->application_fee_status === AdmissionApplication::FEE_PAID) {
            return response()->json(['message' => 'Fee already paid.']);
        }

        $application->update([
            'application_fee_status' => AdmissionApplication::FEE_PAID,
        ]);

        return response()->json(['message' => 'Application fee paid successfully.', 'application' => $application]);
    }

    /**
     * Request a fee waiver – dispatches delayed auto-approval job.
     */
    public function requestWaiver(Request $request)
    {
        $application = AdmissionApplication::where('user_id', Auth::id())->first();

        if (!$application) {
            return response()->json(['message' => 'Academic Protocol Error: Your admission record could not be localized. Please initiate the registry from the dashboard.'], 404);
        }

        if (in_array($application->application_fee_status, [AdmissionApplication::FEE_PAID, AdmissionApplication::FEE_WAIVED])) {
            return response()->json(['message' => 'Fee is already cleared.']);
        }

        // Register institutional delay and request timestamp
        $delayMinutes = (int) SystemSetting::getVal('admission_fee_waiver_delay_minutes', 5);
        // Prevent institutional protocol reset if already initiated
        if (!$application->waiver_requested_at) {
            $application->update(['waiver_requested_at' => now()]);

            // Use dispatchSync to bypass queue worker dependency and send immediately
            ProcessFeeWaiverJob::dispatchSync($application->id);
        }

        // Registry Feedback Mail
        try {
            \App\Services\CommunicationService::send(Auth::user()->email, 'waiver_request_success', [
                'student_name' => Auth::user()->name,
                'delay'        => $delayMinutes
            ]);
        } catch (\Exception $e) {}

        return response()->json([
            'message'        => 'Waiver request received. Your fee will be automatically waived in approximately ' . $delayMinutes . ' minutes.',
            'delay_minutes'  => $delayMinutes,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  WIZARD STEP SAVE
    // ─────────────────────────────────────────────────────────────

    /**
     * Save a single wizard step's data.
     */
    public function saveStep(Request $request)
    {
        $application = AdmissionApplication::where('user_id', Auth::id())->first();

        if (!$application) {
            return response()->json(['message' => 'Academic Protocol Error: Your admission record could not be localized. Please initiate the registry from the dashboard.'], 404);
        }

        if (!$request->has('step')) {
            return response()->json(['message' => 'Step identifier missing.'], 422);
        }

        $step = $request->input('step');
        $stepData = $request->input('step_data', []);

        $existingStepData = $application->step_data ?? [];
        $existingStepData[$step] = $stepData;

        $application->update([
            'step_data'    => $existingStepData,
            'current_step' => $step,
            'status'       => AdmissionApplication::STATUS_IN_PROGRESS,
        ]);

        // Handle personal statement persistence
        if (!empty($stepData['personal_statement'])) {
            $application->update(['personal_statement' => $stepData['personal_statement']]);
        }

        // Handle program selection and auto-resolve faculty
        if (($step === AdmissionApplication::STEP_PROGRAM || $step === 'academic_registry') && !empty($stepData['program_id'])) {
            $program = \App\Modules\Academic\Models\Program::with('department.faculty')->find($stepData['program_id']);
            
            $application->update([
                'program_id' => $stepData['program_id'],
                'faculty_id' => $program?->department?->faculty_id ?? $application->faculty_id
            ]);
        }

        return response()->json(['message' => 'Step saved.', 'application' => $application->fresh()]);
    }

    // ─────────────────────────────────────────────────────────────
    //  FINAL SUBMISSION (with scholarship engine)
    // ─────────────────────────────────────────────────────────────

    /**
     * Submit final application with mandatory scholarship reason.
     */
    public function submitApplication(Request $request)
    {
        $application = AdmissionApplication::where('user_id', Auth::id())->first();

        if (!$application) {
            return response()->json(['message' => 'Academic Protocol Error: Your admission record could not be localized. Please initiate the registry from the dashboard.'], 404);
        }

        // Gate: fee must be cleared
        if (!in_array($application->application_fee_status, [AdmissionApplication::FEE_PAID, AdmissionApplication::FEE_WAIVED])) {
            return response()->json(['message' => 'Application fee must be paid or waived before submitting.'], 422);
        }

        // Gate: cannot re-submit
        if (in_array($application->status, [AdmissionApplication::STATUS_PENDING, AdmissionApplication::STATUS_APPROVED])) {
            return response()->json(['message' => 'Application already submitted.'], 422);
        }

        $validated = $request->validate([
            'personal_statement' => 'required|string|min:50',
            'scholarship_reason' => 'required|string|min:50',
        ]);

        // Evaluate scholarship reason
        $scholarshipStatus   = AdmissionApplication::SCHOLARSHIP_NOT_APPLIED;
        $scholarshipProvider = null;

        $reason = trim($validated['scholarship_reason'] ?? '');
        if (!empty($reason)) {
            $engine            = new ScholarshipEngine();
            $scholarshipStatus = $engine->evaluate($reason);

            // Assign partner sponsors on approval
            if ($scholarshipStatus === AdmissionApplication::SCHOLARSHIP_APPROVED) {
                $sponsors            = ['Hudorian Trust', 'The Maart'];
                $scholarshipProvider = $sponsors[array_rand($sponsors)];
            }
        }

        $application->update([
            'status'              => AdmissionApplication::STATUS_PENDING,
            'submitted_at'        => now(),
            'personal_statement'  => trim($validated['personal_statement']),
            'scholarship_reason'  => $reason ?: null,
            'scholarship_status'  => $scholarshipStatus,
            'scholarship_provider'=> $scholarshipProvider,
        ]);

        // Dispatch Confirmation Mail
        try {
            \Illuminate\Support\Facades\Mail::to($application->user->email)
                ->send(new \App\Mail\AdmissionSubmitted($application->load(['user', 'program'])));

            if ($scholarshipStatus === AdmissionApplication::SCHOLARSHIP_APPROVED) {
               \App\Services\CommunicationService::send($application->user->email, 'scholarship_approved', [
                   'student_name' => $application->user->name,
                   'provider'     => $scholarshipProvider
               ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Admission Mail Failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message'              => 'Application submitted successfully.',
            'scholarship_status'   => $scholarshipStatus,
            'scholarship_provider' => $scholarshipProvider,
            'application'          => $application->fresh(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    //  DOCUMENT UPLOAD
    // ─────────────────────────────────────────────────────────────

    /**
     * Upload a document to the application.
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,png|max:5120',
        ]);

        $user        = Auth::user();
        $application = AdmissionApplication::where('user_id', $user->id)->first();

        if (!$application) {
            return response()->json(['message' => 'Academic Protocol Error: Your admission record could not be localized. Please initiate the registry from the dashboard.'], 404);
        }

        $path = $request->file('file')->store('admissions/' . $user->id, 'public');

        $documents                    = $application->documents ?? [];
        $documents[$request->type]    = $path;

        $application->update(['documents' => $documents]);

        return response()->json(['message' => 'Document uploaded.', 'path' => $path, 'application' => $application->fresh()]);
    }

    // ─────────────────────────────────────────────────────────────
    //  ADMIN REVIEW
    // ─────────────────────────────────────────────────────────────

    /**
     * Review an application (Admin).
     */
    public function review(Request $request, AdmissionApplication $application)
    {
        $validated = $request->validate([
            'status'         => 'required|in:review,approved,rejected',
            'review_notes'   => 'nullable|string',
            'scholarship_id' => 'nullable|exists:scholarships,id',
        ]);

        $updateData = [
            'status'       => $validated['status'],
            'review_notes' => $validated['review_notes'],
            'reviewed_at'  => now(),
            'reviewed_by'  => Auth::id(),
        ];

        if (array_key_exists('scholarship_id', $validated)) {
            $updateData['scholarship_id'] = $validated['scholarship_id'];
        }

        $application->update($updateData);

        // If approved, send email inline (no queue dependency) and create offer
        if ($validated['status'] === 'approved') {
            // Send admission approval email synchronously
            try {
                $application->load(['user', 'program']);
                \Illuminate\Support\Facades\Mail::to($application->user->email)
                    ->send(new \App\Mail\AdmissionApproved($application));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Admission Approval Mail Failed', ['error' => $e->getMessage()]);
            }

            $application->offer()->create([
                'offer_type'  => 'unconditional',
                'expiry_date' => now()->addDays(30),
            ]);

            $this->generateStudentId($application->user);
            
            if ($application->scholarship_id) {
                $application->user->update(['scholarship_id' => $application->scholarship_id]);
            }
        } else {
            // Notify immediately for rejections / info reviews
            $application->user->notify(new AdmissionStatusUpdated($application));
        }

        return response()->json(['message' => 'Application updated successfully', 'application' => $application]);
    }

    /**
     * Get authorized instructors for a faculty.
     */
    public function facultyInstructors(\App\Modules\Academic\Models\Faculty $faculty)
    {
        $instructors = User::where('role', User::ROLE_INSTRUCTOR)
            ->where('faculty_id', $faculty->id)
            ->get(['id', 'name', 'email']);

        return response()->json($instructors);
    }

    /**
     * Generate official student ID (Matric Number).
     */
    protected function generateStudentId(User $user)
    {
        if ($user->student_id) return;

        $application = AdmissionApplication::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with('program.department')
            ->first();

        if (!$application || !$application->program || !$application->program->department) {
            $year  = now()->year;
            $count = User::whereNotNull('student_id')->count() + 1;
            $user->update(['student_id' => "ST-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT)]);
            return;
        }

        $deptCode  = $application->program->department->code ?? 'ML';
        $yearShort = now()->format('y');

        $deptUserCount = User::whereHas('program', function ($q) use ($application) {
            $q->where('department_id', $application->program->department_id);
        })->whereNotNull('student_id')->count() + 1;

        $id = "{$deptCode}{$yearShort}" . str_pad($deptUserCount, 3, '0', STR_PAD_LEFT);

        $user->update([
            'student_id' => $id,
            'program_id' => $application->program_id,
        ]);
    }

    /**
     * Accept admission offer.
     */
    public function acceptOffer(AdmissionOffer $offer)
    {
        if ($offer->application->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $offer->update(['accepted' => true]);

        return response()->json(['message' => 'Admission offer accepted. Welcome to the university!']);
    }

    /**
     * Admin: Renew or revoke scholarship (GPA-based annual review).
     */
    public function reviewScholarshipRenewal(Request $request, AdmissionApplication $application)
    {
        $validated = $request->validate([
            'gpa' => 'required|numeric|min:0|max:4',
        ]);

        $minGpa  = (float) SystemSetting::getVal('scholarship_renewal_min_gpa', 2.0);
        $enabled = (bool)  SystemSetting::getVal('scholarship_renewal_enabled', true);

        if (!$enabled) {
            return response()->json(['message' => 'Scholarship renewal is currently disabled by admin.'], 422);
        }

        $engine  = new ScholarshipEngine();
        $renewed = $engine->evaluateRenewal($validated['gpa'], $minGpa);

        $application->update([
            'scholarship_status' => $renewed
                ? AdmissionApplication::SCHOLARSHIP_RENEWED
                : AdmissionApplication::SCHOLARSHIP_REVOKED,
        ]);

        return response()->json([
            'message'   => $renewed ? 'Scholarship renewed for this academic year.' : 'Scholarship has been revoked due to insufficient GPA.',
            'renewed'   => $renewed,
            'min_gpa'   => $minGpa,
            'gpa_given' => $validated['gpa'],
        ]);
    }
}
