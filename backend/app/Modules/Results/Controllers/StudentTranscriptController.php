<?php

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Courses\Models\CourseRegistration;
use App\Services\GradeCalculationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentTranscriptController extends Controller
{
    /**
     * Get the student's full official transcript and CGPA.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        $data = $this->getTranscriptData($userId);

        return response()->json($data);
    }

    /**
     * Export the transcript as an Official PDF.
     */
    public function download(Request $request)
    {
        $user = Auth::user();
        $data = $this->getTranscriptData($user->id);

        // Resolve dynamic branding for the PDF
        $institutionName = \App\Models\SystemSetting::getVal('branding_name', config('app.name', 'Institution'));
        $motto           = \App\Models\SystemSetting::getVal('institutional_motto', '');
        $primaryColor    = \App\Models\SystemSetting::getVal('branding_primary_color', '#4b345d');
        $accentColor     = \App\Models\SystemSetting::getVal('branding_accent_color', '#c0162d');
        $registrarName   = \App\Models\SystemSetting::getVal('registrar_name', 'University Registrar');

        // Logo & Seal — convert storage URLs to absolute paths for DomPDF
        $logoPath = null;
        $logoSetting = \App\Models\SystemSetting::getVal('branding_logo');
        if ($logoSetting && file_exists(public_path('storage/' . ltrim($logoSetting, '/')))) {
            $logoPath = public_path('storage/' . ltrim($logoSetting, '/'));
        }

        $sealPath = null;
        $sealSetting = \App\Models\SystemSetting::getVal('branding_seal');
        if ($sealSetting && file_exists(public_path('storage/' . ltrim($sealSetting, '/')))) {
            $sealPath = public_path('storage/' . ltrim($sealSetting, '/'));
        }

        // Total credits
        $totalCredits = collect($data['transcript'])->sum('total_credits');

        $pdf = Pdf::loadView('transcripts.official', [
            'user'            => $user,
            'transcript'      => $data['transcript'],
            'cgpa'            => $data['cgpa'],
            'totalCredits'    => $totalCredits,
            'institutionName' => $institutionName,
            'motto'           => $motto,
            'primaryColor'    => $primaryColor,
            'accentColor'     => $accentColor,
            'registrarName'   => $registrarName,
            'logoUrl'         => $logoPath,
            'sealUrl'         => $sealPath,
        ]);

        return $pdf->download("Official_Transcript_{$user->name}.pdf");
    }

    /**
     * Internal helper to fetch and calculate transcript data.
     */
    private function getTranscriptData(int $userId)
    {
        // Get all non-dropped registrations
        $registrations = CourseRegistration::where('user_id', $userId)
            ->where('status', '!=', 'dropped')
            ->with(['course', 'semester.academicSession'])
            ->orderBy('semester_id')
            ->get();

        // Group historically by semester
        $transcript = $registrations->groupBy('semester_id')->map(function ($semesterGroup) {
            $semester = $semesterGroup->first()->semester;
            
            return [
                'semester_id' => $semester->id,
                'semester_name' => $semester->name,
                'academic_session' => $semester->academicSession->name,
                'courses' => $semesterGroup->map(function ($reg) {
                    return [
                        'course_id' => $reg->course->id,
                        'title' => $reg->course->title,
                        'credits' => $reg->course->credit_hours ?? 3,
                        'grade' => $reg->grade,
                        'letter' => $reg->grade_letter,
                        'points' => $reg->grade !== null ? GradeCalculationService::getGradeScale($reg->grade)['points'] : null,
                    ];
                }),
                'sgpa' => GradeCalculationService::calculateSGPA($semesterGroup),
                'total_credits' => $semesterGroup->sum(fn ($reg) => $reg->course->credit_hours ?? 3),
            ];
        })->values();

        // Calculate CGPA
        $cgpa = GradeCalculationService::calculateSGPA($registrations);

        $user = Auth::user();
        $totalDegreeCredits = 120; // Default fallback
        if ($user->program) {
            $totalDegreeCredits = $user->program->duration_years * 30; // Standard assumption
        }

        return [
            'transcript'           => $transcript,
            'cgpa'                 => $cgpa,
            'total_credits_earned' => $registrations->whereNotNull('grade')->sum(fn ($reg) => $reg->course->credit_hours ?? 3),
            'total_degree_credits' => $totalDegreeCredits,
            'program_name'         => $user->program->name ?? 'Undergraduate Degree',
        ];
    }
}
