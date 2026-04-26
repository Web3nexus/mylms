<?php

namespace App\Http\Controllers;

use App\Models\StudentFormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentFormRequestController extends Controller
{
    /**
     * List all form requests submitted by the authenticated student.
     */
    public function index()
    {
        $requests = StudentFormRequest::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    /**
     * Submit a new form request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'  => 'required|in:transcript,deferral,withdraw,id-renewal,readmission',
            'notes' => 'nullable|string|max:1000',
        ]);

        $reference = 'FRM-' . strtoupper(substr(uniqid(), -6));

        $formRequest = StudentFormRequest::create([
            'user_id'   => Auth::id(),
            'type'      => $validated['type'],
            'notes'     => $validated['notes'] ?? null,
            'status'    => 'pending',
            'reference' => $reference,
        ]);

        return response()->json([
            'message' => 'Form request submitted successfully.',
            'request' => $formRequest,
        ], 201);
    }
}
