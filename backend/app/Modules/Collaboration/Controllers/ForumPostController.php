<?php

namespace App\Modules\Collaboration\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Collaboration\Models\ForumPost;
use App\Modules\Collaboration\Models\ForumTopic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForumPostController extends Controller
{
    /**
     * Store a new post in a topic (as a reply).
     */
    public function store(Request $request, ForumTopic $topic)
    {
        // ACL: Topic must not be locked
        $user = Auth::user();
        if ($topic->is_locked && !$user->isInstructor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Institutional Registry: Topic is locked. New contributions are prohibited.'], 403);
        }

        $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:forum_posts,id',
        ]);

        $post = $topic->posts()->create([
            'user_id' => Auth::id(),
            'parent_id' => $request->input('parent_id'),
            'content' => $request->input('content'),
        ]);

        return response()->json($post->load('user:id,name'), 201);
    }

    /**
     * Delete a post (Owner/Instructor/Admin).
     */
    public function destroy(ForumPost $post)
    {
        // Simple ACL check
        $user = Auth::user();
        if ($post->user_id !== $user->id && !$user->isInstructor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Access Denied: Specialized content management is restricted.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Content successfully removed from the institutional record.'], 200);
    }
}
