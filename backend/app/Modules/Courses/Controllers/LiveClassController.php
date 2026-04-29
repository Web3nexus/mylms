<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LiveClass;
use App\Modules\Courses\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class LiveClassController extends Controller
{
    /**
     * List instructor's live classes
     */
    public function index(Request $request)
    {
        $classes = LiveClass::where('instructor_id', Auth::id())
            ->with('course:id,title,slug')
            ->latest()
            ->get();

        return response()->json($classes);
    }

    /**
     * Store a new live class
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'course_id' => 'required|exists:courses,id',
            'scheduled_at' => 'required|date|after:now',
            'description' => 'nullable|string'
        ]);

        // Ensure the instructor actually owns the course
        $course = Course::findOrFail($validated['course_id']);
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized course access'], 403);
        }

        $liveClass = LiveClass::create([
            ...$validated,
            'instructor_id' => Auth::id(),
            'room_name' => Str::uuid()->toString(),
            'status' => 'scheduled'
        ]);

        return response()->json($liveClass->load('course:id,title'), 201);
    }

    /**
     * Start a live class
     */
    public function start(Request $request, $id)
    {
        $liveClass = LiveClass::where('id', $id)
            ->where('instructor_id', Auth::id())
            ->firstOrFail();

        $liveClass->update([
            'status' => 'live',
            'started_at' => now(),
        ]);

        return response()->json(['message' => 'Class is now live', 'liveClass' => $liveClass]);
    }

    /**
     * End a live class
     */
    public function end(Request $request, $id)
    {
        $liveClass = LiveClass::where('id', $id)
            ->where('instructor_id', Auth::id())
            ->firstOrFail();

        $liveClass->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json(['message' => 'Class ended', 'liveClass' => $liveClass]);
    }

    /**
     * Get live classes for a student based on their enrollments
     */
    public function studentIndex(Request $request)
    {
        $enrollmentCourseIds = \App\Modules\Courses\Models\Enrollment::where('user_id', Auth::id())
            ->pluck('course_id');

        $classes = LiveClass::whereIn('course_id', $enrollmentCourseIds)
            ->whereIn('status', ['scheduled', 'live'])
            ->with('course:id,title,slug')
            ->orderBy('scheduled_at', 'asc')
            ->get();

        return response()->json($classes);
    }
}
