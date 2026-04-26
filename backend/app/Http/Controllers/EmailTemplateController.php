<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    /**
     * List all templates for admin.
     */
    public function index()
    {
        return response()->json(EmailTemplate::orderBy('category')->get());
    }

    /**
     * Show a specific template.
     */
    public function show($id)
    {
        return response()->json(EmailTemplate::findOrFail($id));
    }

    /**
     * Update a template (subject or content).
     */
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject'      => 'required|string|max:255',
            'content_html' => 'required|string',
        ]);

        $template->update($validated);

        return response()->json([
            'message'  => 'Email template updated successfully.',
            'template' => $template
        ]);
    }
}
