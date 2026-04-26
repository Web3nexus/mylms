<?php

namespace App\Http\Controllers;

use App\Rules\ValidFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    /**
     * Handle file upload with validation.
     * Stores files in organized structure: course/{course_id}/student/{user_id}/
     */
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', new ValidFile(['pdf', 'doc', 'docx'], 10240)], // 10MB max
            'course_id' => 'required|exists:courses,id',
            'type' => 'required|in:assignment,scholarship,registration,other',
        ]);

        $file = $validated['file'];
        $courseId = $validated['course_id'];
        $type = $validated['type'];
        $userId = auth()->id();

        // Generate secure filename
        $extension = $file->getClientOriginalExtension();
        $filename = strtolower(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = preg_replace('/[^a-z0-9\-_]/', '-', $filename);
        $safeFilename = $filename . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;

        // Organized storage path
        $storagePath = "course/{$courseId}/student/{$userId}/{$type}";

        // Store file
        $path = $file->storeAs($storagePath, $safeFilename, [
            'disk' => config('filesystems.default', 'local')
        ]);

        // Get file info
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        return response()->json([
            'message' => 'File uploaded successfully.',
            'file' => [
                'path' => $path,
                'original_filename' => $file->getClientOriginalName(),
                'file_type' => $mimeType,
                'file_size' => $fileSize,
                'url' => Storage::url($path),
            ]
        ], 201);
    }

    /**
     * Download a file with authorization check.
     */
    public function download($path)
    {
        $user = auth()->user();
        $decodedPath = urldecode($path);

        // Check if file exists
        if (!Storage::exists($decodedPath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        // Authorization: Only allow if user owns the file or is instructor/admin
        $pathParts = explode('/', $decodedPath);
        if (count($pathParts) >= 4 && $pathParts[0] === 'course') {
            $courseId = $pathParts[1];
            $fileOwnerId = $pathParts[3];

            // Check if user is owner, instructor of course, or admin
            $isOwner = $user->id == $fileOwnerId;
            $isInstructor = $user->isInstructor() && \App\Models\Course::where('id', $courseId)
                ->where('instructor_id', $user->id)->exists();
            $isAdmin = $user->isAdmin();

            if (!$isOwner && !$isInstructor && !$isAdmin) {
                return response()->json(['message' => 'Access denied.'], 403);
            }
        }

        return Storage::download($decodedPath);
    }
}
