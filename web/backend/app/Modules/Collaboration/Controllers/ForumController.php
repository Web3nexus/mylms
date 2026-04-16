<?php

namespace App\Modules\Collaboration\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Collaboration\Models\Forum;
use App\Modules\Collaboration\Models\ForumTopic;
use App\Modules\Courses\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ForumController extends Controller
{
    /**
     * Get all forums for a specific course.
     */
    public function index(Course $course)
    {
        $forums = $course->forums()->get();
        return response()->json($forums);
    }

    /**
     * Create a new forum for a course (Instructors only via Policy/Middleware).
     */
    public function store(Request $request, Course $course)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:announcement,general,q&a',
        ]);

        $forum = $course->forums()->create($request->all());

        return response()->json($forum, 201);
    }

    /**
     * Get all topics for a specific forum.
     */
    public function showForum(Forum $forum)
    {
        $topics = $forum->topics()
            ->with(['user:id,name', 'lastPost.user:id,name'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return response()->json($topics);
    }

    /**
     * Create a new topic in a forum.
     */
    public function storeTopic(Request $request, Forum $forum)
    {
        // 1. ACL: Students cannot post in 'announcement' type forums
        $user = Auth::user();
        if ($forum->type === 'announcement' && !$user->isInstructor() && !$user->isAdmin()) {
            return response()->json(['message' => 'Institutional Registry: Only authorized faculty may post announcements.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $topic = $forum->topics()->create([
            'user_id' => Auth::id(),
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'is_pinned' => $request->boolean('is_pinned', false),
        ]);

        return response()->json($topic, 201);
    }

    /**
     * Update/Lock/Pin a topic.
     */
    public function updateTopic(Request $request, ForumTopic $topic)
    {
        // ACL: Only instructor can pin/lock
        $user = Auth::user();
        if (!$user->isInstructor() && !$user->isAdmin()) {
            if ($request->hasAny(['is_pinned', 'is_locked'])) {
                return response()->json(['message' => 'Access Denied: Specialized administrative topic controls are restricted.'], 403);
            }
            // Owning student could update their own content, but let's keep it simple for now
        }

        $topic->update($request->only(['title', 'content', 'is_pinned', 'is_locked']));

        return response()->json($topic);
    }

    /**
     * Show a single topic with its nested posts.
     */
    public function showTopic(ForumTopic $topic)
    {
        $topic->load(['user:id,name', 'forum.course']);
        
        // Fetch only top-level posts (replies to the topic) and recursively load replies
        $posts = $topic->posts()
            ->whereNull('parent_id')
            ->with(['user:id,name', 'replies.user:id,name'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'topic' => $topic,
            'posts' => $posts
        ]);
    }
}
