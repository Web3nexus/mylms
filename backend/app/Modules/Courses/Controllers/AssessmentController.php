<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Courses\Models\Assessment;
use App\Modules\Courses\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    /**
     * List assessments for a course.
     */
    public function index(Course $course)
    {
        return response()->json($course->assessments);
    }

    /**
     * Create a new assessment.
     */
    public function store(Request $request, Course $course)
    {
        // Enforce ownership
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit_minutes' => 'integer|min:0',
        ]);

        $assessment = $course->assessments()->create($validated);

        return response()->json($assessment, 201);
    }

    /**
     * Add questions and options to an assessment.
     */
    public function addQuestions(Request $request, Assessment $assessment)
    {
        // Enforce ownership
        if ($assessment->course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.text' => 'required|string',
            'questions.*.type' => 'required|in:mcq,true_false',
            'questions.*.points' => 'integer',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.options.*.text' => 'required|string',
            'questions.*.options.*.is_correct' => 'required|boolean',
        ]);

        foreach ($validated['questions'] as $qData) {
            $question = $assessment->questions()->create([
                'text' => $qData['text'],
                'type' => $qData['type'],
                'points' => $qData['points'] ?? 1,
            ]);

            foreach ($qData['options'] as $oData) {
                $question->options()->create($oData);
            }
        }

        return response()->json(['message' => 'Questions added successfully']);
    }

    /**
     * Get assessment details with questions (no correct answers for students).
     */
    public function show(Assessment $assessment)
    {
        $user = Auth::user();
        $course = $assessment->course;

        // Check enrollment
        if ($course->instructor_id !== $user->id && !$course->enrollments()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Enrollment required'], 403);
        }

        $assessmentData = $assessment->load(['questions.options' => function($query) use ($user, $course) {
            // Only hide correct answers if the user is NOT the instructor
            if ($course->instructor_id !== $user->id) {
                $query->select('id', 'question_id', 'text');
            }
        }]);

        return response()->json($assessmentData);
    }

    /**
     * Submit assessment answers and calculate score.
     */
    public function submit(Request $request, Assessment $assessment)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'answers' => 'required|array', // [question_id => option_id]
        ]);

        $score = 0;
        $totalPoints = 0;

        foreach ($assessment->questions as $question) {
            $totalPoints += $question->points;
            $submittedOptionId = $validated['answers'][$question->id] ?? null;

            if ($submittedOptionId) {
                $correctOption = $question->options()->where('is_correct', true)->first();
                if ($correctOption && $correctOption->id == $submittedOptionId) {
                    $score += $question->points;
                }
            }
        }

        // Calculate percentage score or just raw score? Let's store percentage
        $percentage = ($totalPoints > 0) ? round(($score / $totalPoints) * 100) : 0;

        $submission = Submission::create([
            'user_id' => $user->id,
            'assessment_id' => $assessment->id,
            'score' => $percentage,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Assessment submitted successfully',
            'score' => $percentage,
            'submission_id' => $submission->id
        ]);
    }

    /**
     * Auto-generate questions using AI.
     */
    public function generate(Request $request, Course $course, \App\Services\AIService $aiService)
    {
        // Enforce ownership
        if ($course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'topic' => 'required|string|max:255',
            'context' => 'required|string|max:5000',
            'num_questions' => 'required|integer|min:1|max:20',
        ]);

        try {
            $questionsData = $aiService->generateAssessmentQuestions(
                $validated['topic'], 
                $validated['context'], 
                $validated['num_questions']
            );

            if (empty($questionsData)) {
                return response()->json(['error' => 'Failed to generate questions. The AI returned empty data.'], 500);
            }

            return response()->json([
                'success' => true,
                'questions' => $questionsData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
