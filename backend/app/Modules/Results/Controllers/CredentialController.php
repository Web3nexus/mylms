<?php

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\Course;
use App\Modules\Results\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CredentialController extends Controller
{
    /**
     * Issue a native digital certificate for completing a course.
     */
    public function claimCertificate(Request $request, Course $course)
    {
        $userId = Auth::id();

        // Normally, you would verify that all lessons are 100% completed here, 
        // using the Module/Lesson progress tracking built in Phase 2.
        
        // Ensure student isn't claiming it twice
        if (Certificate::where('user_id', $userId)->where('course_id', $course->id)->exists()) {
            return response()->json(['message' => 'Certificate already issued.'], 409);
        }

        $certificate = Certificate::create([
            'user_id' => $userId,
            'course_id' => $course->id,
            'certificate_code' => 'CERT-' . strtoupper(Str::random(12)),
            'issued_at' => now(),
        ]);

        return response()->json([
            'message' => 'Certificate officially issued.',
            'certificate' => $certificate->load(['course', 'user'])
        ], 201);
    }

    /**
     * Get a user's certificate for a specific course (used for the PDF view)
     */
    public function show(Course $course)
    {
        $certificate = Certificate::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->with(['course', 'user'])
            ->firstOrFail();

        return response()->json($certificate);
    }

    /**
     * Publicly verifiable endpoint. Does not require authentication.
     * External organizations hit this endpoints with the CERT-CODE.
     */
    public function verify($code)
    {
        $certificate = Certificate::where('certificate_code', $code)
            ->with(['course.instructor', 'user'])
            ->first();

        if (!$certificate) {
            return response()->json([
                'valid' => false,
                'message' => 'We have no record of this certificate code.'
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'certified_student' => $certificate->user->name,
            'course' => $certificate->course->title,
            'instructor' => $certificate->course->instructor->name,
            'issue_date' => $certificate->issued_at->format('M j, Y'),
            'certificate_code' => $certificate->certificate_code
        ]);
    }
}
