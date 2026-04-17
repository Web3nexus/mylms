<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class ScholarshipController extends Controller
{
    /**
     * Get all active scholarships ordered by most imminent deadline.
     */
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $scholarships = \Illuminate\Support\Facades\Cache::remember('public_scholarships_data_' . $page, 14400, function () {
            return Scholarship::whereDate('deadline', '>', now())
                ->orderBy('deadline', 'asc')
                ->paginate(15)
                ->toArray();
        });

        return response()->json($scholarships);
    }

    /**
     * Admin manually forces the opportunity sync command to execute.
     */
    public function triggerFetch()
    {
        Artisan::call('fetch:scholarships');
        
        \Illuminate\Support\Facades\Cache::flush();
        
        $output = Artisan::output();
        
        return response()->json([
            'message' => 'Scheduler triggered manually',
            'console_output' => $output
        ]);
    }
}
