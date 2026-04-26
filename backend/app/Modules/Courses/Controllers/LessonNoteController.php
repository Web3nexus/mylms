<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\LessonNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonNoteController extends Controller
{
    /**
     * Display the note for a specific lesson for the authenticated user.
     */
    public function show($lessonId)
    {
        $note = LessonNote::where('user_id', Auth::id())
            ->where('lesson_id', $lessonId)
            ->first();

        if (!$note) {
            return response()->json(['content' => '']);
        }

        return response()->json($note);
    }

    /**
     * Store or update a note for a specific lesson.
     */
    public function store(Request $request, $lessonId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $note = LessonNote::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'lesson_id' => $lessonId,
            ],
            [
                'content' => $request->content,
            ]
        );

        return response()->json($note);
    }
}
