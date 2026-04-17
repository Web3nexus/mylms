<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCourseController extends Controller
{
    /**
     * Get all courses with their instructor, category, and enrollment count.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        
        $query = Course::with(['instructor', 'category'])
            ->withCount('enrollments')
            ->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Store a new course (assigned to any instructor).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'instructor_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'credits' => 'nullable|integer|min:0',
            'status' => 'required|in:draft,published',
            'thumbnail' => 'nullable|string',
        ]);

        $course = Course::create([
            ...$validated,
            'slug' => Str::slug($validated['title']),
        ]);

        return response()->json($course->load(['instructor', 'category']), 201);
    }

    /**
     * Update an existing course.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'instructor_id' => 'sometimes|exists:users,id',
            'category_id' => 'sometimes|exists:categories,id',
            'description' => 'sometimes|string',
            'price' => 'nullable|numeric|min:0',
            'credits' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:draft,published',
            'thumbnail' => 'nullable|string',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $course->title) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $course->update($validated);

        return response()->json($course->load(['instructor', 'category']));
    }

    /**
     * Delete a course.
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }

    /**
     * Get users who can be instructors.
     */
    public function instructors()
    {
        // Get users with role 'instructor' or 'admin'
        $instructors = User::whereIn('role', ['instructor', 'admin'])->get(['id', 'name', 'email']);
        return response()->json($instructors);
    }
}
