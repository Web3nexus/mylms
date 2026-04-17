<?php

namespace App\Modules\Admissions\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Admissions\Models\AdmissionApplication;
use App\Modules\Admissions\Models\AdmissionOffer;
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
     * Get user's current application.
     */
    public function myApplication()
    {
        $application = AdmissionApplication::with(['program', 'offer', 'user', 'faculty', 'instructor'])
            ->where('user_id', Auth::id())
            ->first();

        return response()->json($application);
    }

    /**
     * Submit an application.
     */
    public function apply(Request $request)
    {
        $user = Auth::user();

        // Check if already applied
        if (AdmissionApplication::where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You have already submitted an application.'], 422);
        }

        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'faculty_id' => 'nullable|exists:faculties,id',
            'instructor_id' => 'nullable|exists:users,id',
            'personal_statement' => 'required|string|min:100',
            'form_data' => 'nullable|array',
            'documents' => 'required|array',
            'documents.transcript' => 'required|file|mimes:pdf,jpg,png|max:5120',
            'documents.id_proof' => 'required|file|mimes:pdf,jpg,png|max:5120',
        ]);

        $paths = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                $paths[$key] = $file->store('admissions/' . $user->id, 'public');
            }
        }

        $application = AdmissionApplication::create([
            'user_id' => $user->id,
            'program_id' => $validated['program_id'],
            'faculty_id' => $validated['faculty_id'] ?? null,
            'instructor_id' => $validated['instructor_id'] ?? null,
            'personal_statement' => $validated['personal_statement'],
            'form_data' => $validated['form_data'] ?? [],
            'documents' => $paths,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json($application, 201);
    }

    /**
     * Review an application (Admin).
     */
    public function review(Request $request, AdmissionApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:review,approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $application->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'],
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        $application->user->notify(new AdmissionStatusUpdated($application));

        // If approved, create offer and generate student ID
        if ($validated['status'] === 'approved') {
            $application->offer()->create([
                'offer_type' => 'unconditional',
                'expiry_date' => now()->addDays(30),
            ]);

            $this->generateStudentId($application->user);
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
            $year = now()->year;
            $count = User::whereNotNull('student_id')->count() + 1;
            $user->update(['student_id' => "ST-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT)]);
            return;
        }

        $deptCode = $application->program->department->code ?? 'ML';
        $yearShort = now()->format('y');
        
        $deptUserCount = User::whereHas('program', function($q) use ($application) {
            $q->where('department_id', $application->program->department_id);
        })->whereNotNull('student_id')->count() + 1;

        $id = "{$deptCode}{$yearShort}" . str_pad($deptUserCount, 3, '0', STR_PAD_LEFT);

        $user->update([
            'student_id' => $id,
            'program_id' => $application->program_id
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
}
