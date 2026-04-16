<?php

namespace App\Modules\Academic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Academic\Models\AcademicSession;
use App\Modules\Academic\Models\Semester;
use App\Modules\Academic\Models\AcademicEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicSessionController extends Controller
{
    /**
     * List all academic sessions with their semesters and events.
     */
    public function index()
    {
        return response()->json(AcademicSession::with(['semesters.events'])->get());
    }

    /**
     * Create an Academic Session.
     */
    public function storeSession(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:academic_sessions,name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        return DB::transaction(function () use ($validated) {
            if ($validated['is_active'] ?? false) {
                AcademicSession::where('is_active', true)->update(['is_active' => false]);
            }

            return response()->json(AcademicSession::create($validated), 201);
        });
    }

    /**
     * Create a Semester within a Session.
     */
    public function storeSemester(Request $request, AcademicSession $session)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date|after_or_equal:' . $session->start_date->toDateString(),
            'end_date' => 'required|date|after:start_date|before_or_equal:' . $session->end_date->toDateString(),
            'is_current' => 'boolean',
        ]);

        return DB::transaction(function () use ($validated, $session) {
            if ($validated['is_current'] ?? false) {
                Semester::where('is_current', true)->update(['is_current' => false]);
            }

            return response()->json($session->semesters()->create($validated), 201);
        });
    }

    /**
     * Create an Academic Event.
     */
    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'semester_id' => 'nullable|exists:semesters,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'event_type' => 'required|in:registration,exam,holiday,orientation',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        return response()->json(AcademicEvent::create($validated), 201);
    }

    /**
     * Set a Session as Active.
     */
    public function activateSession(AcademicSession $session)
    {
        DB::transaction(function () use ($session) {
            AcademicSession::where('is_active', true)->update(['is_active' => false]);
            $session->update(['is_active' => true]);
        });

        return response()->json(['message' => 'Academic session activated.']);
    }

    /**
     * Set a Semester as Current.
     */
    public function setCurrentSemester(Semester $semester)
    {
        DB::transaction(function () use ($semester) {
            Semester::where('is_current', true)->update(['is_current' => false]);
            $semester->update(['is_current' => true]);
        });

        return response()->json(['message' => 'Semester set as current.']);
    }
}
