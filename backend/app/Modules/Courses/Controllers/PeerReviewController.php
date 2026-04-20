<?php

namespace App\Modules\Courses\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Assessment;
use App\Modules\Courses\Models\PeerReview;
use App\Modules\Courses\Services\PeerAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PeerReviewController extends Controller
{
    /**
     * List reviews assigned to the current student.
     */
    public function assigned()
    {
        $reviews = PeerReview::with(['submission.assessment'])
            ->where('reviewer_id', Auth::id())
            ->get();
            
        return response()->json($reviews);
    }

    /**
     * Show a specific peer review assignment.
     */
    public function show(PeerReview $review)
    {
        if ($review->reviewer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($review->load(['submission.assessment.rubric.criteria']));
    }

    /**
     * Submit a peer review.
     */
    public function submit(Request $request, PeerReview $review)
    {
        if ($review->reviewer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'feedback' => 'required|string|min:10',
        ]);

        $review->update(array_merge($validated, [
            'status' => 'completed'
        ]));

        return response()->json(['message' => 'Peer review submitted successfully']);
    }

    /**
     * Trigger peer allocation for an assessment (Instructor Only).
     */
    public function allocate(Request $request, Assessment $assessment, PeerAllocationService $service)
    {
        if ($assessment->course->instructor_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reviews_per_student' => 'integer|min:1|max:10'
        ]);

        $service->allocate($assessment, $validated['reviews_per_student'] ?? 3);

        return response()->json(['message' => 'Peer reviews allocated successfully']);
    }
}
