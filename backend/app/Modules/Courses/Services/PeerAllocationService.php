<?php

namespace App\Modules\Courses\Services;

use App\Modules\Courses\Models\Assessment;
use App\Modules\Courses\Models\Submission;
use App\Modules\Courses\Models\PeerReview;
use Illuminate\Support\Facades\DB;

class PeerAllocationService
{
    /**
     * Allocate peer reviews for a given assessment.
     * Each student who submitted gets N reviews to perform.
     */
    public function allocate(Assessment $assessment, int $reviewsPerStudent = 3)
    {
        return DB::transaction(function () use ($assessment, $reviewsPerStudent) {
            $submissions = $assessment->submissions()->get();
            $studentIds = $submissions->pluck('user_id')->toArray();

            if (count($studentIds) <= $reviewsPerStudent) {
                // Not enough students for the requested count, scale down
                $reviewsPerStudent = max(1, count($studentIds) - 1);
            }

            foreach ($submissions as $submission) {
                // Potential reviewers: everyone except the author
                $potentialReviewers = array_filter($studentIds, fn($id) => $id !== $submission->user_id);
                
                // Shuffle and pick
                shuffle($potentialReviewers);
                $selectedReviewers = array_slice($potentialReviewers, 0, $reviewsPerStudent);

                foreach ($selectedReviewers as $reviewerId) {
                    PeerReview::updateOrCreate(
                        [
                            'submission_id' => $submission->id,
                            'reviewer_id' => $reviewerId,
                        ],
                        [
                            'status' => 'pending'
                        ]
                    );
                }
            }

            return true;
        });
    }
}
