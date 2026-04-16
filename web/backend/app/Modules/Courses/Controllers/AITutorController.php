<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AITutorController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function ask(Request $request, Course $course)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        try {
            // Build Context from Course Description and its lessons
            $context = "Course Title: {$course->title}\n";
            $context .= "Description: {$course->description}\n\n";
            
            // Limit lesson context to avoid token bloat
            $lessons = $course->lessons()->select('title', 'content')->take(5)->get();
            foreach ($lessons as $lesson) {
                $context .= "Lesson: {$lesson->title}\n";
                // Only take first 500 chars of content for context
                $context .= substr(strip_tags($lesson->content), 0, 500) . "...\n\n";
            }

            $response = $this->aiService->askTutor($request->message, $context);

            return response()->json([
                'success' => true,
                'message' => $response
            ]);

        } catch (\Exception $e) {
            Log::error('AITutorController Error', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'error' => 'The AI Tutor is currently unavailable. Please try again later.'
            ], 500);
        }
    }
}
