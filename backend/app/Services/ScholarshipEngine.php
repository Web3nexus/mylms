<?php

namespace App\Services;

class ScholarshipEngine
{
    /**
     * Evaluates the scholarship reason and returns a score.
     * Core logic for Phase 2:
     * - Word count evaluation
     * - Keyword matching for financial hardship, academic ambition
     * Returns: >= 5 (Auto-Approve), 3-4 (Review), < 3 (Reject)
     */
    public function evaluate($reason)
    {
        if (empty($reason)) return 'rejected';
        
        $score = 0;
        $wordCount = str_word_count($reason);
        
        if ($wordCount > 50) $score += 1;
        if ($wordCount > 150) $score += 1;

        $hardshipKeywords = ['hardship', 'financial', 'struggle', 'unemployed', 'poverty', 'cannot afford', 'fund', 'orphan'];
        $ambitionKeywords = ['future', 'career', 'community', 'impact', 'university', 'degree', 'skill', 'lead'];

        $lowerReason = strtolower($reason);

        $hardshipMatches = 0;
        foreach ($hardshipKeywords as $kw) {
            if (str_contains($lowerReason, $kw)) $hardshipMatches++;
        }
        if ($hardshipMatches > 0) $score += 1;
        if ($hardshipMatches > 2) $score += 1;

        $ambitionMatches = 0;
        foreach ($ambitionKeywords as $kw) {
            if (str_contains($lowerReason, $kw)) $ambitionMatches++;
        }
        if ($ambitionMatches > 0) $score += 1;
        if ($ambitionMatches > 2) $score += 1;

        if ($score >= 5) return 'approved';
        if ($score >= 3) return 'pending';
        return 'rejected';
    }

    public function evaluateRenewal($gpa, $minGpa)
    {
        return $gpa >= $minGpa;
    }
}
