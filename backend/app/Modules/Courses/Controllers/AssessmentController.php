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
    public function index(Request $request, Course $course)
    {
        $query = $course->assessments();

        if ($request->boolean('include_submissions')) {
            $query->with(['submissions.user']);
        }

        return response()->json($query->get());
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
            'type' => 'required|in:quiz,assignment,peer_assignment',
            'is_timed' => 'boolean',
            'duration_minutes' => 'nullable|integer|min:0',
            'rubric_id' => 'nullable|exists:rubrics,id',
        ]);

        $assessment = $course->assessments()->create($validated);

        return response()->json($assessment, 201);
    }
    /**
     * Add questions and options to an assessment (Quizzes only).
     */
    public function addQuestions(Request $request, Assessment $assessment)
    {
        // Enforce ownership
        if ($assessment->course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($assessment->type !== 'quiz') {
            return response()->json(['message' => 'Only quizzes support question banks'], 400);
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
     * Get assessment details with questions or rubrics.
     */
    public function show(Assessment $assessment)
    {
        $user = Auth::user();
        $course = $assessment->course;

        // Check enrollment
        if ($course->instructor_id !== $user->id && !$course->enrollments()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Enrollment required'], 403);
        }

        $relations = ['rubric.criteria'];
        
        if ($assessment->type === 'quiz') {
            $relations[] = 'questions.options';
        }

        $assessmentData = $assessment->load($relations);

        // Security: Hide correct answers for students and Scramble Options
        if ($assessment->type === 'quiz' && $course->instructor_id !== $user->id) {
            $assessmentData->questions->each(function($question) use ($user) {
                // Scramble options using user ID as seed to ensure consistency per attempt but unique per user
                $options = $question->options->toArray();
                srand($user->id + $question->id);
                shuffle($options);
                srand(); // Reset seed
                $question->setRelation('options', collect($options));

                $question->options->each(function($option) {
                    unset($option->is_correct);
                });
            });
        }

        return response()->json($assessmentData);
    }
    
    public function submit(Request $request, Assessment $assessment)
    {
        $user = Auth::user();
        
        // Handle Based on Type
        if ($assessment->type === 'quiz') {
            $validated = $request->validate([
                'answers' => 'required|array', // [question_id => option_id or theory_text]
            ]);

            $score = 0;
            $totalPoints = 0;
            $hasTheory = false;

            foreach ($assessment->questions as $question) {
                $totalPoints += $question->points;
                $submittedAnswer = $validated['answers'][$question->id] ?? null;

                if ($question->type === 'theory') {
                    $hasTheory = true;
                    // Theory questions aren't auto-graded
                } elseif ($submittedAnswer) {
                    $correctOption = $question->options()->where('is_correct', true)->first();
                    if ($correctOption && $correctOption->id == $submittedAnswer) {
                        $score += $question->points;
                    }
                }
            }

            $percentage = ($totalPoints > 0) ? round(($score / $totalPoints) * 100) : 0;

            $submission = Submission::create([
                'user_id' => $user->id,
                'assessment_id' => $assessment->id,
                'answers' => $validated['answers'],
                'score' => $percentage,
                'status' => $hasTheory ? 'pending' : 'graded',
                'submitted_at' => now(),
            ]);

            return response()->json([
                'message' => $hasTheory ? 'Quiz submitted. Theory portion requires instructor review.' : 'Quiz submitted and graded.',
                'score' => $percentage,
                'submission_id' => $submission->id,
                'status' => $submission->status
            ]);
        } 
        
        if ($assessment->type === 'assignment' || $assessment->type === 'peer_assignment') {
            $validated = $request->validate([
                'file_submission' => 'required|file|mimes:doc,docx|max:10240', // 10MB limit, Word only
            ]);

            $courseId = $assessment->course_id;
            $userId = $user->id;
            $path = $request->file('file_submission')->store("courses/{$courseId}/students/{$userId}/submissions", 'public');

            $submission = Submission::create([
                'user_id' => $user->id,
                'assessment_id' => $assessment->id,
                'file_path' => $path,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            return response()->json([
                'message' => 'Assignment submitted successfully',
                'submission_id' => $submission->id
            ]);
        }

        return response()->json(['message' => 'Invalid assessment type'], 400);
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
