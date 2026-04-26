<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Super Admin has all permissions
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Admins have access to most features by default
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Check specific permission
        $permissions = $user->permissions ?? [];
        $requiredPermissions = explode(',', $permission);

        foreach ($requiredPermissions as $required) {
            if (!in_array(trim($required), $permissions)) {
                return response()->json([
                    'message' => 'Forbidden. Missing required permission: ' . trim($required)
                ], 403);
            }
        }

        return $next($request);
    }
}
