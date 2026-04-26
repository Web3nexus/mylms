<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AdminAudit;
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
        $user = auth()->user();

        // Admins and Super Admins can see staff
        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Access Denied: Only Administrators can view the personnel registry.'
            ], 403);
        }

        $query = User::with([
            'faculty:id,name', 
            'level:id,name,code',
            'instructorAssignments.department:id,name',
            'instructorAssignments.level:id,name,code'
        ]);

        if (request()->has('type')) {
            if (request()->type === 'instructor') {
                $query->where('role', User::ROLE_INSTRUCTOR);
            } elseif (request()->type === 'staff') {
                $query->whereIn('role', [User::ROLE_ADMIN, User::ROLE_STAFF]);
            }
        } else {
            $query->whereIn('role', [User::ROLE_INSTRUCTOR, User::ROLE_ADMIN, User::ROLE_STAFF]);
        }

        $staff = $query->latest()->get(['id', 'name', 'email', 'role', 'is_super_admin', 'permissions', 'faculty_id', 'level_id', 'created_at']);

        return response()->json($staff);
    }

    /**
     * Store a new staff member.
     * Only Super Admin can create new staff.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Access Denied: Only Administrators can onboard new personnel.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', 'in:instructor,admin,staff'],
            'faculty_id' => ['nullable', 'exists:faculties,id'],
            'level_id' => ['nullable', 'exists:levels,id'],
            'permissions' => ['nullable', 'array'],
        ]);

        // Prevent creating another super admin via this endpoint
        $isSuperAdmin = $user->isSuperAdmin() && ($request->input('is_super_admin') === true);

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_super_admin' => false, // Must be set directly in database for security
            'faculty_id' => $validated['faculty_id'] ?? null,
            'level_id' => $validated['level_id'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
        ]);

        // Audit log
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => 'CREATE_STAFF',
            'model_type' => 'user',
            'model_id' => $newUser->id,
            'new_values' => ['name' => $newUser->name, 'email' => $newUser->email, 'role' => $newUser->role],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Staff member onboarded successfully.',
            'user' => $newUser
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $authUser = auth()->user();

        if (!$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Access Denied: Only Administrators can modify personnel records.'
            ], 403);
        }

        // Only super admin can edit another super admin
        if ($user->isSuperAdmin() && !$authUser->isSuperAdmin()) {
            return response()->json([
                'message' => 'Access Denied: You cannot modify a Super Administrator account.'
            ], 403);
        }

        // Prevent modifying super admin flag via API
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class.',email,'.$user->id],
            'role' => ['required', 'string', 'in:instructor,admin,staff'],
            'faculty_id' => ['nullable', 'exists:faculties,id'],
            'level_id' => ['nullable', 'exists:levels,id'],
            'password' => ['nullable', Password::defaults()],
            'permissions' => ['nullable', 'array'],
        ]);

        // Store old values for audit
        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'faculty_id' => $user->faculty_id,
        ];

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->faculty_id = $validated['faculty_id'] ?? $user->faculty_id;
        $user->level_id = $validated['level_id'] ?? $user->level_id;
        $user->permissions = $validated['permissions'] ?? $user->permissions;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Audit log
        AdminAudit::create([
            'user_id' => $authUser->id,
            'action' => 'UPDATE_STAFF',
            'model_type' => 'user',
            'model_id' => $user->id,
            'old_values' => $oldValues,
            'new_values' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'faculty_id' => $user->faculty_id,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Staff record updated successfully.',
            'user' => $user
        ]);
    }

    /**
     * Remove a staff member from the registry.
     * Only Super Admin can delete staff records.
     */
    public function destroy(User $user)
    {
        $authUser = auth()->user();

        if (!$authUser->isAdmin()) {
            return response()->json([
                'message' => 'Access Denied: Only Administrators can purge personnel records.'
            ], 403);
        }

        // Prevent deleting super admins
        if ($user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Critical Security: Super Administrator accounts cannot be deleted via this interface.'
            ], 403);
        }

        // Prevent deleting last admin
        if ($user->role === User::ROLE_ADMIN && User::where('role', User::ROLE_ADMIN)->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the last administrator.'], 422);
        }

        $deletedUser = ['id' => $user->id, 'name' => $user->name, 'email' => $user->email];

        $user->delete();

        // Audit log
        AdminAudit::create([
            'user_id' => $authUser->id,
            'action' => 'DELETE_STAFF',
            'model_type' => 'user',
            'model_id' => $deletedUser['id'],
            'old_values' => $deletedUser,
            'ip_address' => request()->ip(),
        ]);

        return response()->json(['message' => 'Staff record purged from registry.']);
    }
}
