<?php

namespace App\Modules\Admissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admissions\Models\AdmissionFormField;
use Illuminate\Http\Request;

class AdmissionFieldController extends Controller
{
    /**
     * List all dynamic admission fields (for public/student use).
     */
    public function index()
    {
        return response()->json(
            AdmissionFormField::where('is_active', true)
                ->orderBy('order_index')
                ->get()
        );
    }

    /**
     * List all fields (for Admin management).
     */
    public function adminIndex()
    {
        return response()->json(
            AdmissionFormField::orderBy('category')->orderBy('order_index')->get()
        );
    }

    /**
     * Create or update a field (Admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'field_key' => 'required|string|unique:admission_form_fields,field_key',
            'label' => 'required|string',
            'category' => 'required|in:personal,contact,academic,financial,membership,credentials,documents',
            'type' => 'required|in:text,select,date,number,textarea,file',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ]);

        $field = AdmissionFormField::create($validated);
        return response()->json($field, 201);
    }

    /**
     * Toggle field status (Admin).
     */
    public function toggle(AdmissionFormField $field)
    {
        $field->update(['is_active' => !$field->is_active]);
        return response()->json(['message' => 'Field availability toggled.', 'is_active' => $field->is_active]);
    }

    /**
     * Delete a field (Admin).
     */
    public function destroy(AdmissionFormField $field)
    {
        $field->delete();
        return response()->json(['message' => 'Field removed from registry successfully.']);
    }
}
