<?php

namespace App\Http\Middleware;

use App\Models\AdminAudit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     * Log admin actions for audit trail.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log admin/management actions
        $user = $request->user();
        if (!$user || !($user->isAdmin() || $user->isStaff())) {
            return $response;
        }

        // Only log state-changing requests
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $response;
        }

        // Log the action
        AdminAudit::create([
            'user_id' => $user->id,
            'action' => $this->getActionName($request),
            'model_type' => $this->getModelType($request),
            'model_id' => $request->route('id') ?? $request->route('user') ?? null,
            'old_values' => $request->all(),
            'ip_address' => $request->ip(),
        ]);

        return $response;
    }

    private function getActionName(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        return "{$method} {$path}";
    }

    private function getModelType(Request $request): string
    {
        $path = $request->path();
        $segments = explode('/', $path);

        // Extract model type from route (e.g., admin/staff -> staff)
        if (count($segments) >= 2) {
            return $segments[1];
        }

        return 'unknown';
    }
}
