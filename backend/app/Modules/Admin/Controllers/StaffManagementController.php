<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class StaffManagementController extends Controller
{
    /**
     * List all university personnel (Instructors, Admins).
     */
    public function index()
    {
        $staff = User::whereIn('role', [User::ROLE_INSTRUCTOR, User::ROLE_ADMIN])
            ->latest()
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return response()->json($staff);
    }

    /**
     * Store a new staff member.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', 'in:instructor,admin'],
            'faculty_id' => ['nullable', 'exists:faculties,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'faculty_id' => $validated['faculty_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Staff member onboarded successfully.',
            'user' => $user
        ], 201);
    }

    /**
     * Remove a staff member from the registry.
     */
    public function destroy(User $user)
    {
        if ($user->role === User::ROLE_ADMIN && User::where('role', User::ROLE_ADMIN)->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the last administrator.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Staff record purged from registry.']);
    }
}
