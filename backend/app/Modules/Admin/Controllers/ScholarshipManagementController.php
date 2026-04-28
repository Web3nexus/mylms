<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use App\Models\ScholarshipPartner;
use App\Models\AvailedScholarship;
use App\Models\User;
use App\Models\AdminAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScholarshipManagementController extends Controller
{
    /**
     * Get all scholarships with partners.
     */
    public function index()
    {
        $scholarships = Scholarship::with('partner')->get();
        return response()->json($scholarships);
    }

    /**
     * Get all partners.
     */
    public function partners()
    {
        $partners = ScholarshipPartner::withCount('scholarships')->get();
        return response()->json($partners);
    }

    /**
     * Store a new partner.
     */
    public function storePartner(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
        ]);

        $partner = ScholarshipPartner::create($validated);

        return response()->json([
            'message' => 'Scholarship partner created successfully.',
            'partner' => $partner
        ], 201);
    }

    /**
     * Store a new scholarship.
     */
    public function storeScholarship(Request $request)
    {
        $validated = $request->validate([
            'scholarship_partner_id' => 'required|exists:scholarship_partners,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'currency' => 'required|string|max:3',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'tags' => 'nullable|array',
        ]);

        $scholarship = Scholarship::create($validated);

        return response()->json([
            'message' => 'Scholarship created successfully.',
            'scholarship' => $scholarship->load('partner')
        ], 201);
    }

    /**
     * Award a scholarship to a student.
     */
    public function awardScholarship(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'scholarship_id' => 'required|exists:scholarships,id',
            'amount_awarded' => 'nullable|numeric',
            'academic_year' => 'nullable|string',
            'notes' => 'nullable|string',
            'expires_at' => 'nullable|date',
        ]);

        $award = AvailedScholarship::create([
            'user_id' => $validated['user_id'],
            'scholarship_id' => $validated['scholarship_id'],
            'amount_awarded' => $validated['amount_awarded'],
            'academic_year' => $validated['academic_year'],
            'notes' => $validated['notes'],
            'expires_at' => $validated['expires_at'],
            'awarded_at' => now(),
            'status' => 'active',
        ]);

        // Update user record if needed
        $user = User::find($validated['user_id']);
        $user->update(['scholarship_id' => $validated['scholarship_id']]);

        return response()->json([
            'message' => 'Scholarship awarded successfully.',
            'award' => $award->load(['user:id,name,email', 'scholarship:id,title'])
        ], 201);
    }

    /**
     * List all awarded scholarships.
     */
    public function awards()
    {
        $awards = AvailedScholarship::with(['user:id,name,email,student_id', 'scholarship:id,title,scholarship_partner_id', 'scholarship.partner'])
            ->latest()
            ->get();
        return response()->json($awards);
    }

    /**
     * Update an award status.
     */
    public function updateAwardStatus(Request $request, AvailedScholarship $award)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,expired,revoked,pending',
        ]);

        $award->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Scholarship award status updated.',
            'award' => $award
        ]);
    }
}
