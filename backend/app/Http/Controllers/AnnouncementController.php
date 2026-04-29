<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Department;
use App\Models\Level;
use App\Models\InstructorAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Get announcements for the current user.
     * Instructors see their own. Students see global, or matching their dept/level.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'instructor') {
            $announcements = Announcement::where('instructor_id', $user->id)
                ->with(['department', 'level'])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($announcements);
        }

        if ($user->role === 'student') {
            $query = Announcement::with('instructor')
                ->where(function($q) use ($user) {
                    // Global announcements (no dept/level specified)
                    $q->whereNull('department_id')->whereNull('level_id');
                    
                    // Or matches student's department/level
                    $q->orWhere(function($subQ) use ($user) {
                        if ($user->department_id) {
                            $subQ->where('department_id', $user->department_id);
                        }
                        if ($user->level_id) {
                            $subQ->where('level_id', $user->level_id);
                        }
                    });
                });
                
            return response()->json($query->orderBy('created_at', 'desc')->get());
        }

        // Admins see all
        return response()->json(Announcement::with(['instructor', 'department', 'level'])->orderBy('created_at', 'desc')->get());
    }

    /**
     * Get targetable options for an instructor based on their assignments.
     */
    public function getTargetOptions()
    {
        $user = Auth::user();
        if ($user->role !== 'instructor') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $assignments = InstructorAssignment::where('user_id', $user->id)->get();
        
        $departmentIds = $assignments->pluck('department_id')->filter()->unique();
        $levelIds = $assignments->pluck('level_id')->filter()->unique();

        $departments = Department::whereIn('id', $departmentIds)->get(['id', 'name']);
        $levels = Level::whereIn('id', $levelIds)->get(['id', 'name']);

        return response()->json([
            'departments' => $departments,
            'levels' => $levels
        ]);
    }

    /**
     * Store a new targeted announcement.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'department_id' => 'nullable|exists:departments,id',
            'level_id' => 'nullable|exists:levels,id',
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'instructor_id' => $user->id,
            'department_id' => $validated['department_id'],
            'level_id' => $validated['level_id'],
        ]);

        return response()->json($announcement, 201);
    }
}
