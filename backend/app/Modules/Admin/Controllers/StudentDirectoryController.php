<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class StudentDirectoryController extends Controller
{
    /**
     * Return a paginated, filterable list of all students.
     * Admin-only endpoint.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'student')
            ->with(['program.department', 'level'])
            ->withCount('admissionApplications');

        // Filter by student_id presence
        if ($request->has('has_matric')) {
            if ($request->boolean('has_matric')) {
                $query->whereNotNull('student_id');
            } else {
                $query->whereNull('student_id');
            }
        }

        // Filter by program
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        // Search by name, email, or student_id
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('student_id', 'like', "%{$term}%");
            });
        }

        $students = $query->latest()->paginate(20);

        // Summary stats
        $total       = User::where('role', 'student')->count();
        $matriculated = User::where('role', 'student')->whereNotNull('student_id')->count();
        $pending     = $total - $matriculated;

        return response()->json([
            'students'    => $students,
            'stats' => [
                'total'        => $total,
                'matriculated' => $matriculated,
                'pending'      => $pending,
            ],
        ]);
    }

    /**
     * Get detailed info for a single student.
     */
    public function show($id)
    {
        $student = User::where('role', 'student')
            ->with(['program.department', 'level', 'admissionApplications.program', 'admissionApplications.faculty'])
            ->findOrFail($id);

        return response()->json($student);
    }

    /**
     * Bulk delete students.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id'
        ]);

        User::whereIn('id', $request->student_ids)
            ->where('role', 'student') // Protect admins/instructors
            ->delete();

        return response()->json(['message' => 'Selected students have been removed.']);
    }

    /**
     * Suspend a student account.
     */
    public function suspend(User $student, Request $request)
    {
        if ($student->role !== User::ROLE_STUDENT) {
            return response()->json(['message' => 'Only student accounts can be suspended via this protocol.'], 422);
        }

        $student->update(['status' => 'suspended']);

        \App\Models\AdminAudit::create([
            'user_id' => auth()->id(),
            'action' => 'SUSPEND_STUDENT',
            'model_type' => 'user',
            'model_id' => $student->id,
            'new_values' => ['status' => 'suspended', 'reason' => $request->reason],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Student account suspended.']);
    }

    /**
     * Unsuspend a student account.
     */
    public function unsuspend(User $student, Request $request)
    {
        $student->update(['status' => 'active']);

        \App\Models\AdminAudit::create([
            'user_id' => auth()->id(),
            'action' => 'UNSUSPEND_STUDENT',
            'model_type' => 'user',
            'model_id' => $student->id,
            'new_values' => ['status' => 'active'],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Student account reactivated.']);
    }

    /**
     * Get student activity logs.
     */
    public function activityLog($id)
    {
        $logs = \App\Models\AdminAudit::where('model_type', 'user')
            ->where('model_id', $id)
            ->latest()
            ->get();
        return response()->json($logs);
    }
}
