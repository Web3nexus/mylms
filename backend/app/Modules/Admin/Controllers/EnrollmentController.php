<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\Faculty;
use App\Modules\Academic\Models\Department;
use App\Modules\Academic\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EnrollmentController extends Controller
{
    /**
     * List all Faculties, Departments, and Programs.
     */
    public function index()
    {
        return response()->json([
            'faculties' => Faculty::with('departments.programs')->get(),
            'departments' => Department::with('faculty', 'programs')->get(),
            'programs' => Program::with('department.faculty')->get(),
        ]);
    }

    /**
     * Faculty CRUD
     */
    public function storeFaculty(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:faculties,name',
            'code' => 'required|string|unique:faculties,code',
            'description' => 'nullable|string',
        ]);

        $faculty = Faculty::create($validated);
        return response()->json($faculty, 201);
    }

    public function updateFaculty(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:faculties,name,' . $faculty->id,
            'code' => 'required|string|unique:faculties,code,' . $faculty->id,
            'description' => 'nullable|string',
        ]);

        $faculty->update($validated);
        return response()->json($faculty);
    }

    public function deleteFaculty(Faculty $faculty)
    {
        $faculty->delete();
        return response()->json(null, 204);
    }

    /**
     * Department CRUD
     */
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name' => 'required|string|unique:departments,name',
            'code' => 'required|string|unique:departments,code',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
            'name' => 'required|string|unique:departments,name,' . $department->id,
            'code' => 'required|string|unique:departments,code,' . $department->id,
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    public function deleteDepartment(Department $department)
    {
        $department->delete();
        return response()->json(null, 204);
    }

    /**
     * Program CRUD
     */
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|unique:programs,name',
            'degree_level' => 'required|string', // Associate, Bachelor, Master, PhD
            'duration_years' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'pricing_type' => 'nullable|string',
            'tuition_fee' => 'nullable|numeric',
            'application_fee' => 'nullable|numeric',
            'certificate_fee' => 'nullable|numeric',
            'is_scholarship_eligible' => 'boolean',
            'is_external' => 'boolean',
            'external_provider' => 'nullable|string',
        ]);

        $program = Program::create($validated);
        return response()->json($program, 201);
    }

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|unique:programs,name,' . $program->id,
            'degree_level' => 'required|string',
            'duration_years' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'pricing_type' => 'nullable|string',
            'tuition_fee' => 'nullable|numeric',
            'application_fee' => 'nullable|numeric',
            'certificate_fee' => 'nullable|numeric',
            'is_scholarship_eligible' => 'boolean',
            'is_external' => 'boolean',
            'external_provider' => 'nullable|string',
        ]);

        $program->update($validated);
        return response()->json($program);
    }

    public function deleteProgram(Program $program)
    {
        $program->delete();
        return response()->json(null, 204);
    }

    /**
     * Public Helper: Get Programs by Level
     */
    public function getProgramsByLevel($level)
    {
        $programs = Program::where('degree_level', $level)
            ->where('is_active', true)
            ->with(['department.faculty'])
            ->get();

        return response()->json($programs);
    }
}
