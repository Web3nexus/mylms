<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AdvisorMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AcademicAdvisorController extends Controller
{
    /**
     * List all students assigned to the current advisor.
     */
    public function myStudents()
    {
        $user = Auth::user();
        if (!$user->isAdvisor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($user->assignedStudents()->with('program')->get());
    }

    /**
     * Get chat history between advisor and student.
     */
    public function getChat(User $student)
    {
        $user = Auth::user();
        
        // Security check: Only assigned advisor or admin can see chat
        if (!$user->isAdmin()) {
            if ($user->isAdvisor() && $student->academic_advisor_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized access to student record.'], 403);
            }
            if ($user->isStudent() && $user->id !== $student->id) {
                 return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $messages = AdvisorMessage::where(function($q) use ($user, $student) {
                $q->where('sender_id', $user->id)->where('receiver_id', $student->id);
            })->orWhere(function($q) use ($user, $student) {
                $q->where('sender_id', $student->id)->where('receiver_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120'
        ]);

        $attachmentUrl = null;
        if ($request->hasFile('attachment')) {
            $attachmentUrl = $request->file('attachment')->store('advisor_attachments', 'public');
        }

        $msg = AdvisorMessage::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['receiver_id'],
            'message' => $validated['message'],
            'attachment_url' => $attachmentUrl
        ]);

        return response()->json($msg);
    }

    /**
     * Admin: Assign advisor to student.
     */
    public function assignAdvisor(Request $request)
    {
        if (!Auth::user()->isAdmin()) return response()->json(['message' => 'Unauthorized.'], 403);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'advisor_id' => 'required|exists:users,id'
        ]);

        $student = User::find($validated['student_id']);
        $advisor = User::find($validated['advisor_id']);

        if (!$advisor->isAdvisor()) {
            return response()->json(['message' => 'Selected user is not designated as an Academic Advisor.'], 422);
        }

        $student->update(['academic_advisor_id' => $advisor->id]);

        return response()->json(['message' => 'Academic Advisor assigned successfully.']);
    }

    /**
     * Admin: List all designated advisors.
     */
    public function listAdvisors()
    {
        return response()->json(User::where('role', User::ROLE_ADVISOR)->get());
    }
}
