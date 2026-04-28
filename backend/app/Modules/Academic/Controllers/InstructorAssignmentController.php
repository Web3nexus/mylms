<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Models\InstructorAssignment;
use App\Models\User;
use App\Models\Department;
use App\Models\Level;
use App\Models\AdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InstructorAssignmentController extends Controller
{
    /**
     * List all instructor assignments.
     */
    public function index()
    {
        try {
            $assignments = InstructorAssignment::with([
                'instructor:id,name,email',
                'department:id,name,faculty_id',
                'level:id,name,code'
            ])->latest()->get();

            return response()->json($assignments);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Instructor Assignment Fetch Error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal server error while fetching assignments.'], 500);
        }
    }

    /**
     * Get assignments for a specific instructor.
     */
    public function byInstructor(User $instructor)
    {
        if (!$instructor->isInstructor()) {
            return response()->json(['message' => 'User is not an instructor.'], 422);
        }

        $assignments = $instructor->instructorAssignments()->with([
            'department:id,name,faculty_id',
            'level:id,name,code'
        ])->get();

        return response()->json($assignments);
    }

    /**
     * Assign instructor to department/level.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->canManageAcademic()) {
            return response()->json([
                'message' => 'Access Denied: Academic management permission required.'
            ], 403);
        }

        $validated = $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'department_id' => 'required|exists:departments,id',
            'level_id' => 'nullable|exists:levels,id',
            'academic_year' => 'nullable|string|max:255',
        ]);

        // Verify instructor is actually an instructor
        $instructor = User::find($validated['instructor_id']);
        if (!$instructor->isInstructor()) {
            return response()->json(['message' => 'Selected user is not an instructor.'], 422);
        }

        $assignment = InstructorAssignment::create([
            'user_id'       => $validated['instructor_id'],
            'department_id' => $validated['department_id'],
            'level_id'      => $validated['level_id'] ?? null,
            'academic_year' => $validated['academic_year'] ?? null,
        ]);

        // Audit log
        AdminAudit::create([
            'user_id'    => $user->id,
            'action'     => 'ASSIGN_INSTRUCTOR',
            'model_type' => 'instructor_assignment',
            'model_id'   => $assignment->id,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message'    => 'Instructor assigned successfully.',
            'assignment' => $assignment->load(['instructor:id,name', 'department:id,name', 'level:id,name'])
        ], 201);
    }

    /**
     * Update instructor assignment.
     */
    public function update(Request $request, InstructorAssignment $assignment)
    {
        $user = Auth::user();

        if (!$user->canManageAcademic()) {
            return response()->json([
                'message' => 'Access Denied: Academic management permission required.'
            ], 403);
        }

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'level_id' => 'nullable|exists:levels,id',
            'academic_year' => 'nullable|string|max:255',
        ]);

        $oldValues = [
            'department_id' => $assignment->department_id,
            'level_id' => $assignment->level_id,
        ];

        $assignment->update($validated);

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'UPDATE_INSTRUCTOR_ASSIGNMENT',
            'model_type' => 'instructor_assignment',
            'model_id' => $assignment->id,
            'old_values' => $oldValues,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Assignment updated successfully.',
            'assignment' => $assignment->load(['instructor:id,name', 'department:id,name', 'level:id,name'])
        ]);
    }

    /**
     * Remove instructor assignment.
     */
    public function destroy(InstructorAssignment $assignment)
    {
        $user = Auth::user();

        if (!$user->canManageAcademic()) {
            return response()->json([
                'message' => 'Access Denied: Academic management permission required.'
            ], 403);
        }

        $deletedId = $assignment->id;
        $assignment->delete();

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'REMOVE_INSTRUCTOR_ASSIGNMENT',
            'model_type' => 'instructor_assignment',
            'model_id' => $deletedId,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Instructor assignment removed.']);
    }

    /**
     * Get instructors by department/level.
     */
    public function getByDepartment(Department $department, Request $request)
    {
        $levelId = $request->query('level_id');

        $query = InstructorAssignment::where('department_id', $department->id)
            ->with(['instructor:id,name,email', 'level:id,name,code']);

        if ($levelId) {
            $query->where('level_id', $levelId);
        }

        $assignments = $query->get();

        return response()->json($assignments);
    }
}
