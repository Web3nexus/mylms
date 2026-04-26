<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\Rubric;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RubricController extends Controller
{
    /**
     * List rubrics for a course.
     */
    public function index(Course $course)
    {
        return response()->json($course->rubrics()->with('criteria')->get());
    }

    /**
     * Store a new rubric with criteria.
     */
    public function store(Request $request, Course $course)
    {
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'criteria' => 'required|array|min:1',
            'criteria.*.name' => 'required|string',
            'criteria.*.description' => 'nullable|string',
            'criteria.*.max_score' => 'required|integer|min:1',
        ]);

        $rubric = $course->rubrics()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
        ]);

        foreach ($validated['criteria'] as $criterion) {
            $rubric->criteria()->create($criterion);
        }

        return response()->json($rubric->load('criteria'), 201);
    }

    /**
     * Delete a rubric.
     */
    public function destroy(Rubric $rubric)
    {
        if ($rubric->course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rubric->delete();
        return response()->json(['message' => 'Rubric deleted']);
    }
}
