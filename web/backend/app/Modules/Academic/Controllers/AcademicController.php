<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Faculty;
use App\Modules\Academic\Models\Department;
use App\Modules\Academic\Models\Program;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * List all faculties with departments and programs.
     */
    public function index()
    {
        return response()->json(Faculty::with('departments.programs')->get());
    }

    /**
     * Create a Faculty.
     */
    public function storeFaculty(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $faculty = Faculty::create($validated);
        return response()->json($faculty, 211);
    }

    /**
     * Create a Department.
     */
    public function storeDepartment(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:departments,code',
        ]);

        $department = $faculty->departments()->create($validated);
        return response()->json($department, 201);
    }

    /**
     * Create a Program.
     */
    public function storeProgram(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'degree_level' => 'required|string',
            'duration_years' => 'required|integer|min:1',
        ]);

        $program = $department->programs()->create($validated);
        return response()->json($program, 201);
    }

    /**
     * Link Courses to a Program.
     */
    public function linkCourses(Request $request, Program $program)
    {
        $validated = $request->validate([
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $program->courses()->syncWithoutDetaching($validated['course_ids']);

        return response()->json(['message' => 'Courses linked to program successfully']);
    }
}
