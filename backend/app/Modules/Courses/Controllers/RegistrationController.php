<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\CourseRegistration;
use App\Modules\Academic\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegistrationController extends Controller
{
    const MAX_CREDITS_PER_SEMESTER = 18;

    /**
     * Get the course catalog for the current semester.
     */
    public function catalog(Request $request)
    {
        $semesterId = $request->query('semester_id');

        // Default to current semester if none specified
        if (!$semesterId) {
            $currentSemester = Semester::where('is_current', true)->first();
            $semesterId = $currentSemester?->id;
        }

        $courses = Course::with(['instructor', 'category'])
            ->where('status', 'published')
            ->when($semesterId, fn($q) => $q->where('semester_id', $semesterId))
            ->get()
            ->map(function ($course) {
                $course->is_registered = $course->registrations()
                    ->where('user_id', Auth::id())
                    ->exists();
                return $course;
            });

        $semester = $semesterId ? Semester::with('academicSession')->find($semesterId) : null;

        return response()->json([
            'semester' => $semester,
            'courses' => $courses,
        ]);
    }

    /**
     * Register a student for a course in a semester.
     */
    public function register(Request $request, Course $course)
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $semester = Semester::findOrFail($validated['semester_id']);
        $user = Auth::user();

        // Check for duplicate registration
        $alreadyRegistered = CourseRegistration::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('semester_id', $semester->id)
            ->exists();

        if ($alreadyRegistered) {
            return response()->json(['message' => 'Already registered for this course this semester.'], 409);
        }

        // Enforce credit limit
        $currentCredits = CourseRegistration::where('user_id', $user->id)
            ->where('semester_id', $semester->id)
            ->where('status', 'registered')
            ->join('courses', 'course_registrations.course_id', '=', 'courses.id')
            ->sum('courses.credit_hours');

        if (($currentCredits + $course->credit_hours) > self::MAX_CREDITS_PER_SEMESTER) {
            return response()->json([
                'message' => "Credit limit exceeded. You have {$currentCredits} of " . self::MAX_CREDITS_PER_SEMESTER . " credits this semester.",
                'current_credits' => $currentCredits,
                'max_credits' => self::MAX_CREDITS_PER_SEMESTER,
            ], 422);
        }

        $registration = CourseRegistration::create([
            'user_id'     => $user->id,
            'course_id'   => $course->id,
            'semester_id' => $semester->id,
            'status'      => 'registered',
        ]);

        return response()->json($registration->load('course', 'semester'), 201);
    }

    /**
     * Drop a course registration.
     */
    public function drop(Request $request, Course $course)
    {
        $validated = $request->validate([
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $registration = CourseRegistration::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->where('semester_id', $validated['semester_id'])
            ->firstOrFail();

        $registration->update(['status' => 'dropped']);

        return response()->json(['message' => 'Course dropped successfully.']);
    }

    /**
     * Get the authenticated student's registrations for a semester.
     */
    public function myRegistrations(Request $request)
    {
        $semesterId = $request->query('semester_id');

        if (!$semesterId) {
            $currentSemester = Semester::where('is_current', true)->first();
            $semesterId = $currentSemester?->id;
        }

        $registrations = CourseRegistration::where('user_id', Auth::id())
            ->where('semester_id', $semesterId)
            ->where('status', 'registered')
            ->with(['course.instructor', 'course.category', 'semester.academicSession'])
            ->get();

        $totalCredits = $registrations->sum(fn($r) => $r->course->credit_hours ?? 3);

        return response()->json([
            'registrations' => $registrations,
            'total_credits' => $totalCredits,
            'max_credits' => self::MAX_CREDITS_PER_SEMESTER,
        ]);
    }

    /**
     * Get all available semesters for filtering.
     */
    public function semesters()
    {
        return response()->json(
            Semester::with('academicSession')
                ->orderByDesc('start_date')
                ->get()
        );
    }
}
