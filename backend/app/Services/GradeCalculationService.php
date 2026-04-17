<?php

namespace App\Services;

class GradeCalculationService
{
    /**
     * Map a numerical grade (0-100) to a letter grade and GPA points.
     * Uses a standard 4.0 scale.
     */
    /**
     * Map a numerical grade (0-100) to a letter grade and GPA points.
     * Uses a standard US 4.0 scale with +/- support.
     */
    public static function getGradeScale(float $grade): array
    {
        if ($grade >= 93) return ['letter' => 'A',  'points' => 4.0];
        if ($grade >= 90) return ['letter' => 'A-', 'points' => 3.7];
        if ($grade >= 87) return ['letter' => 'B+', 'points' => 3.3];
        if ($grade >= 83) return ['letter' => 'B',  'points' => 3.0];
        if ($grade >= 80) return ['letter' => 'B-', 'points' => 2.7];
        if ($grade >= 77) return ['letter' => 'C+', 'points' => 2.3];
        if ($grade >= 73) return ['letter' => 'C',  'points' => 2.0];
        if ($grade >= 70) return ['letter' => 'C-', 'points' => 1.7];
        if ($grade >= 67) return ['letter' => 'D+', 'points' => 1.3];
        if ($grade >= 63) return ['letter' => 'D',  'points' => 1.0];
        if ($grade >= 60) return ['letter' => 'D-', 'points' => 0.7];
        
        return ['letter' => 'F', 'points' => 0.0];
    }

    /**
     * Calculate Semester GPA (SGPA) from a collection of course registrations.
     */
    public static function calculateSGPA($registrations): float
    {
        $totalCredits = 0;
        $totalPoints = 0;

        foreach ($registrations as $reg) {
            // Only count completed courses with a grade and that are not 'dropped'
            if ($reg->status !== 'dropped' && $reg->grade !== null) {
                $scale = self::getGradeScale($reg->grade);
                $creditHours = $reg->course->credit_hours ?? 3;

                $totalPoints += ($scale['points'] * $creditHours);
                $totalCredits += $creditHours;
            }
        }

        if ($totalCredits === 0) return 0.0;

        return round($totalPoints / $totalCredits, 2);
    }
}
