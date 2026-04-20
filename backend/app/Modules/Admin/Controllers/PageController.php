<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CMSPage;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Publicly retrieve a page by its slug
     */
    public function show($slug)
    {
        \Illuminate\Support\Facades\Log::info("CMS Show Request for slug: " . $slug);
        $page = CMSPage::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json($page);
    }

    /**
     * Admin: Retrieve a page by slug regardless of visibility
     */
    public function showAdmin($slug)
    {
        $page = CMSPage::where('slug', $slug)->firstOrFail();
        return response()->json($page);
    }

    /**
     * Admin: List all manageable pages
     */
    public function index()
    {
        return response()->json(CMSPage::orderBy('updated_at', 'desc')->get());
    }

    /**
     * Admin: Create or Update a page skeleton
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'slug' => 'required|string|unique:cms_pages,slug',
        ]);

        $page = CMSPage::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['slug']),
            'is_published' => true,
            'puck_json' => [
                'content' => [],
                'root' => ['props' => ['title' => $validated['title']]]
            ],
        ]);

        return response()->json($page, 201);
    }

    /**
     * Admin: Save visual Puck state
     */
    public function update(Request $request, $id)
    {
        $page = CMSPage::findOrFail($id);
        
        $validated = $request->validate([
            'puck_json' => 'required|array',
            'title' => 'sometimes|string',
            'is_published' => 'sometimes|boolean'
        ]);

        $page->update($validated);

        return response()->json($page);
    }

    /**
     * Admin: Delete a page
     */
    public function destroy($id)
    {
        $page = CMSPage::findOrFail($id);
        $page->delete();

        return response()->json(['message' => 'Page deleted successfully']);
    }
}
