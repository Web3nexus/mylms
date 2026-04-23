<?php

namespace App\Http\Controllers;

use App\Modules\Academic\Models\Semester;
use App\Modules\Academic\Models\AcademicEvent;
use App\Modules\Results\Controllers\StudentTranscriptController;
use App\Models\CMSPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentDashboardController extends Controller
{
    /**
     * Unified student dashboard data for Portal & Campus.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // 1. Academic Stats (via Transcript Logic)
        $transcriptCtrl = new StudentTranscriptController();
        // We use a internal hack to call the private method or just replicate logic
        // For efficiency, I'll replicate the core logic or call it if I make it public
        // Actually, I'll just replicate the summary logic
        $registrations = \App\Modules\Courses\Models\CourseRegistration::where('user_id', $user->id)
            ->where('status', '!=', 'dropped')
            ->get();
        
        $cgpa = \App\Services\GradeCalculationService::calculateSGPA($registrations);
        $creditsEarned = $registrations->whereNotNull('grade')->sum(fn($r) => $r->course->credit_hours ?? 3);
        
        $totalCreditsRequired = 120;
        if ($user->program) {
            $totalCreditsRequired = $user->program->duration_years * 30;
        }

        // 2. Countdown to Next Term
        $nextSemester = Semester::where('start_date', '>', now())
            ->orderBy('start_date')
            ->first();
        
        $countdown = null;
        if ($nextSemester) {
            $diff = now()->diff($nextSemester->start_date);
            $countdown = [
                'days' => $diff->d,
                'hours' => $diff->h,
                'mins' => $diff->i,
                'target_date' => $nextSemester->start_date->toIso8601String(),
                'semester_name' => $nextSemester->name
            ];
        }

        // 3. Announcements (CMS Pages with 'announcement' in slug or meta)
        $announcements = CMSPage::where('is_published', true)
            ->where('slug', 'like', 'announcement%')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Academic Events
        $events = AcademicEvent::where('start_date', '>=', now()->subDays(7))
            ->orderBy('start_date')
            ->take(5)
            ->get();

        // 5. Full Transcript for courses list
        $transcriptData = $transcriptCtrl->index($request)->getData(true);

        return response()->json([
            'user' => $user,
            'stats' => [
                'cgpa' => $cgpa,
                'credits_earned' => $creditsEarned,
                'credits_required' => $totalCreditsRequired,
                'program_name' => $user->program->name ?? 'Undergraduate Degree',
                'active_courses_count' => $registrations->where('status', 'registered')->count()
            ],
            'countdown' => $countdown,
            'announcements' => $announcements,
            'events' => $events,
            'transcript' => $transcriptData['transcript'] ?? [],
            'server_time' => now()->toIso8601String()
        ]);
    }
}
