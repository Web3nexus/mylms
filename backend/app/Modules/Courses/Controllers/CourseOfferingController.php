<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CourseOffering;
use App\Models\Course;
use App\Models\User;
use App\Models\Semester;
use App\Models\AcademicSession;
use App\Models\AdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseOfferingController extends Controller
{
    /**
     * List all course offerings.
     */
    public function index(Request $request)
    {
        $query = CourseOffering::with([
            'course:id,title,slug',
            'instructor:id,name,email',
            'semester:id,name',
            'academicSession:id,name'
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        if ($request->has('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        $offerings = $query->latest()->get();

        return response()->json($offerings);
    }

    /**
     * Get offerings for current instructor.
     */
    public function myOfferings()
    {
        $instructor = Auth::user();

        $offerings = CourseOffering::where('instructor_id', $instructor->id)
            ->with(['course:id,title,slug', 'semester:id,name'])
            ->latest()
            ->get();

        return response()->json($offerings);
    }

    /**
     * Create a new course offering.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Only instructors/admins can create offerings
        if (!$user->isInstructor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Access Denied.'], 403);
        }

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'instructor_id' => 'required|exists:users,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'status' => 'nullable|in:draft,active,completed',
        ]);

        // Verify instructor has assignment for this course's department
        $course = Course::find($validated['course_id']);
        if ($user->isInstructor() && !$user->canManageCourse($course)) {
            return response()->json([
                'message' => 'You are not assigned to teach this course.'
            ], 403);
        }

        $validated['status'] = $validated['status'] ?? 'draft';

        $offering = CourseOffering::create($validated);

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'CREATE_COURSE_OFFERING',
            'model_type' => 'course_offering',
            'model_id' => $offering->id,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Course offering created successfully.',
            'offering' => $offering->load(['course:id,title,slug', 'instructor:id,name'])
        ], 201);
    }

    /**
     * Update course offering status.
     */
    public function update(Request $request, CourseOffering $offering)
    {
        $user = Auth::user();

        if (!$user->isAdmin() && $offering->instructor_id !== $user->id) {
            return response()->json(['message' => 'Access Denied.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:draft,active,completed',
        ]);

        $oldValues = ['status' => $offering->status];
        $offering->update($validated);

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'UPDATE_COURSE_OFFERING',
            'model_type' => 'course_offering',
            'model_id' => $offering->id,
            'old_values' => $oldValues,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Course offering updated successfully.',
            'offering' => $offering->load(['course:id,title,slug', 'instructor:id,name'])
        ]);
    }

    /**
     * Delete course offering.
     */
    public function destroy(CourseOffering $offering)
    {
        $user = Auth::user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Only admins can delete offerings.'], 403);
        }

        $deletedId = $offering->id;
        $offering->delete();

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'DELETE_COURSE_OFFERING',
            'model_type' => 'course_offering',
            'model_id' => $deletedId,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Course offering deleted.']);
    }
}
