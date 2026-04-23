<?php

namespace App\Http\Controllers;

use App\Modules\Academic\Models\AcademicEvent;
use Illuminate\Http\Request;

class StudentCalendarController extends Controller
{
    /**
     * Return upcoming academic events for the campus calendar.
     */
    public function index(Request $request)
    {
        $events = AcademicEvent::where('start_date', '>=', now()->subDays(7))
            ->orderBy('start_date')
            ->get()
            ->map(function ($event) {
                return [
                    'id'          => $event->id,
                    'title'       => $event->title,
                    'date'        => optional($event->start_date)->toDateString(),
                    'end_date'    => optional($event->end_date)->toDateString(),
                    'type'        => strtoupper($event->type ?? 'ACADEMIC'),
                    'description' => $event->description ?? '',
                ];
            });

        return response()->json($events);
    }
}
