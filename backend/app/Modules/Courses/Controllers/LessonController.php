<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource for a specific course.
     */
    public function index(Course $course)
    {
        return response()->json(
            $course->lessons()->orderBy('order')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Course $course)
    {
        // Enforce ownership or admin
        if ($course->instructor_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_type' => 'required|in:text,video',
            'content_data' => 'nullable|string',
            'order' => 'integer',
            'is_free' => 'boolean',
        ]);

        $lesson = $course->lessons()->create([
            ...$validated,
            'slug' => Str::slug($validated['title']),
        ]);

        return response()->json($lesson, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course, Lesson $lesson)
    {
        // Check if user is enrolled or is the instructor or admin
        $user = Auth::user();
        $isInstructor = $user && $course->instructor_id === $user->id;
        $isAdmin = $user && $user->role === 'admin';
        $isEnrolled = $user && $course->registrations()->where('user_id', $user->id)->exists();

        // Legacy Enrollment compatibility
        if (!$isEnrolled && $user) {
            $isEnrolled = $course->enrollments()->where('user_id', $user->id)->exists();
        }

        if (!$lesson->is_free && !$isInstructor && !$isAdmin && !$isEnrolled) {
            return response()->json(['message' => 'Enrollment required to view this lesson.'], 403);
        }

        // Pacing Enforcement Logic
        if ($isEnrolled && !$isAdmin && !$isInstructor && $user->program) {
            $program = $user->program;
            if ($program->pacing_type === 'scheduled') {
                $registration = $course->registrations()->where('user_id', $user->id)->first();
                if ($registration) {
                    $daysSinceEnrollment = now()->diffInDays($registration->created_at);
                    $weeksSinceEnrollment = max(1, ceil($daysSinceEnrollment / 7));
                    $allowedLessons = $weeksSinceEnrollment * $program->schedule_days_per_week;

                    if ($lesson->order > $allowedLessons) {
                        return response()->json([
                            'message' => 'Lesson locked based on the scheduled academic pacing. Allowed lessons for your current week: ' . $allowedLessons
                        ], 403);
                    }
                }
            }
        }

        return response()->json($lesson);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course, Lesson $lesson)
    {
        // Enforce ownership or admin
        if ($course->instructor_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'content_type' => 'sometimes|in:text,video',
            'content_data' => 'nullable|string',
            'order' => 'integer',
            'is_free' => 'boolean',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $lesson->update($validated);

        return response()->json($lesson);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course, Lesson $lesson)
    {
        // Enforce ownership or admin
        if ($course->instructor_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $lesson->delete();

        return response()->json(['message' => 'Lesson deleted successfully']);
    }
}
