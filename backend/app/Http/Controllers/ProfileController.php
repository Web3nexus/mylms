<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Certificate;

class ProfileController extends Controller
{
    /**
     * Legacy me() method for /auth/me compatibility
     */
    public function me(Request $request)
    {
        return $this->show($request);
    }

    /**
     * Get the authenticated user's full profile including achievements
     */
    public function show(Request $request)
    {
        $user = Auth::user();
        
        try {
            $user->load(['badges', 'department', 'faculty', 'program.department', 'level']);
        } catch (\Exception $e) {
            // Log the error but continue - likely missing tables due to pending migrations
            \Log::warning("Profile load relationships failed: " . $e->getMessage());
        }
        
        // Fetch certificates if they are a student
        $certificates = [];
        if ($user->role === 'student') {
            // Mocking or fetching real certificates depending on if the model is fully built
            if (class_exists(Certificate::class)) {
                $certificates = Certificate::where('student_id', $user->id)
                    ->with('course')
                    ->get();
            }
        }

        return response()->json([
            'user' => $user,
            'certificates' => $certificates
        ]);
    }

    /**
     * Update profile (including avatar upload)
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'avatar' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->has('name')) {
            $user->name = $validated['name'];
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->avatar_url) {
                $oldPath = str_replace(url('storage') . '/', '', $user->avatar_url);
                Storage::disk('public')->delete($oldPath);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = Storage::disk('public')->url($path);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
