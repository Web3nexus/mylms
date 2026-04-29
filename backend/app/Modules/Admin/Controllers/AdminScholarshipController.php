<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminScholarshipController extends Controller
{
    public function getPartners()
    {
        $partners = DB::table('scholarship_partners')
            ->leftJoin('scholarships', 'scholarships.scholarship_partner_id', '=', 'scholarship_partners.id')
            ->select('scholarship_partners.*', DB::raw('COUNT(scholarships.id) as scholarships_count'))
            ->groupBy('scholarship_partners.id')
            ->get();
            
        return response()->json($partners);
    }

    public function storePartner(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ]);

        $id = DB::table('scholarship_partners')->insertGetId([
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'website' => $validated['website'] ?? null,
            'description' => $validated['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Partner created successfully'], 201);
    }

    public function getScholarships()
    {
        $scholarships = DB::table('scholarships')
            ->leftJoin('scholarship_partners', 'scholarships.scholarship_partner_id', '=', 'scholarship_partners.id')
            ->select('scholarships.*', 'scholarship_partners.name as partner_name')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'amount' => $s->amount,
                    'currency' => $s->currency ?? 'USD',
                    'partner' => $s->scholarship_partner_id ? ['id' => $s->scholarship_partner_id, 'name' => $s->partner_name] : null
                ];
            });

        return response()->json($scholarships);
    }

    public function storeScholarship(Request $request)
    {
        $validated = $request->validate([
            'scholarship_partner_id' => 'required|exists:scholarship_partners,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'currency' => 'required|string|max:10',
            'description' => 'nullable|string',
        ]);

        $id = DB::table('scholarships')->insertGetId([
            'scholarship_partner_id' => $validated['scholarship_partner_id'],
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'description' => $validated['description'] ?? null,
            'deadline' => now()->addYear(), // default deadline
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Scholarship created successfully'], 201);
    }

    public function getAwards()
    {
        $awards = DB::table('availed_scholarships')
            ->join('users', 'availed_scholarships.user_id', '=', 'users.id')
            ->join('scholarships', 'availed_scholarships.scholarship_id', '=', 'scholarships.id')
            ->leftJoin('scholarship_partners', 'scholarships.scholarship_partner_id', '=', 'scholarship_partners.id')
            ->select(
                'availed_scholarships.*',
                'users.name as user_name', 'users.email as user_email', 'users.student_id',
                'scholarships.title as scholarship_title',
                'scholarship_partners.name as partner_name', 'scholarship_partners.id as partner_id'
            )
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'user' => ['id' => $a->user_id, 'name' => $a->user_name, 'email' => $a->user_email, 'student_id' => $a->student_id],
                    'scholarship' => [
                        'id' => $a->scholarship_id, 
                        'title' => $a->scholarship_title,
                        'partner' => $a->partner_id ? ['id' => $a->partner_id, 'name' => $a->partner_name] : null
                    ],
                    'status' => $a->status,
                    'awarded_at' => $a->awarded_at,
                    'academic_year' => $a->academic_year
                ];
            });

        return response()->json($awards);
    }

    public function updateAwardStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,expired,revoked,pending'
        ]);

        DB::table('availed_scholarships')->where('id', $id)->update([
            'status' => $validated['status'],
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Award status updated successfully']);
    }
}
