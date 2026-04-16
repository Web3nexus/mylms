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
            ->with(['program.department'])
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
}
