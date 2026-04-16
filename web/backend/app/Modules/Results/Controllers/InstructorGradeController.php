<?php

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\CourseRegistration;
use App\Services\GradeCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InstructorGradeController extends Controller
{
    /**
     * Get all students officially registered in a specific course for the given semester.
     */
    public function index(Request $request, Course $course)
    {
        // Enforce ownership
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized access to gradebook.'], 403);
        }

        $semesterId = $request->query('semester_id');

        $query = CourseRegistration::where('course_id', $course->id)
            ->where('status', '!=', 'dropped')
            ->with(['user', 'semester:id,name']);

        if ($semesterId) {
            $query->where('semester_id', $semesterId);
        }

        return response()->json($query->get());
    }

    /**
     * Assign a numerical grade to a student's registration.
     * The system inherently generates the letter grade.
     */
    public function update(Request $request, Course $course, $registrationId)
    {
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
        ]);

        $registration = CourseRegistration::where('id', $registrationId)
            ->where('course_id', $course->id)
            ->firstOrFail();

        // Calculate letter grade via standard scale
        $scale = GradeCalculationService::getGradeScale((float) $validated['grade']);

        $registration->update([
            'grade' => $validated['grade'],
            'grade_letter' => $scale['letter'],
            'status' => 'completed', // Mark as completed once a grade is finalized
        ]);

        return response()->json([
            'message' => 'Grade assigned successfully.',
            'registration' => $registration->fresh(['user']),
        ]);
    }
}
