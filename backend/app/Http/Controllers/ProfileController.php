<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile with extended information.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Load common relationships
        $user->load(['program.department.faculty', 'level']);
        
        if ($user->isStudent()) {
            $user->load(['advisor']);
            
            // Add dynamic WhatsApp links based on department and level
            $deptName = $user->program?->department?->name ?? 'General';
            $levelName = $user->level?->name ?? 'All';
            
            $user->whatsapp_groups = [
                [
                    'name' => 'General Student Community',
                    'link' => 'https://chat.whatsapp.com/LMSGeneral',
                    'type' => 'general'
                ],
                [
                    'name' => $deptName . ' Department Group',
                    'link' => 'https://chat.whatsapp.com/' . str_replace(' ', '', $deptName) . 'Dept',
                    'type' => 'department'
                ],
                [
                    'name' => $levelName . ' Year Group (' . $deptName . ')',
                    'link' => 'https://chat.whatsapp.com/' . str_replace(' ', '', $deptName) . $levelName,
                    'type' => 'level'
                ]
            ];
        }

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }
}
