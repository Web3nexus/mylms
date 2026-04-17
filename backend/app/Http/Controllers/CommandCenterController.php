<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * CommandCenterController
 * 
 * Provides a secure, whitelist-based web interface for running
 * Artisan commands remotely. Protected by Sanctum auth + admin role.
 * All executions are logged with user ID, IP, timestamp.
 */
class CommandCenterController extends Controller
{
    /**
     * The strict whitelist of allowed commands.
     * Nothing outside this list can ever be executed.
     */
    private const WHITELIST = [
        // Cache & Config
        'cache:clear'        => ['description' => 'Flush the application cache',              'group' => 'Cache & Config', 'safe' => true],
        'config:clear'       => ['description' => 'Remove the cached config file',            'group' => 'Cache & Config', 'safe' => true],
        'config:cache'       => ['description' => 'Create a cache file for faster config',    'group' => 'Cache & Config', 'safe' => true],
        'route:clear'        => ['description' => 'Remove the cached routes file',            'group' => 'Cache & Config', 'safe' => true],
        'route:cache'        => ['description' => 'Create a route cache file for speed',      'group' => 'Cache & Config', 'safe' => true],
        'view:clear'         => ['description' => 'Clear all compiled view files',            'group' => 'Cache & Config', 'safe' => true],
        'optimize:clear'     => ['description' => 'Clear all cached bootstrap files',         'group' => 'Cache & Config', 'safe' => true],
        'optimize'           => ['description' => 'Cache config, events, routes, and views',  'group' => 'Cache & Config', 'safe' => true],

        // Database
        'migrate:status'            => ['description' => 'Show migration run status',                   'group' => 'Database', 'safe' => true],
        'migrate --force'           => ['description' => 'Run pending database migrations',             'group' => 'Database', 'safe' => false],
        'db:seed --force'           => ['description' => 'Run all database seeders',                    'group' => 'Database', 'safe' => false],

        // Storage
        'storage:link'       => ['description' => 'Create the storage symlink in public/',    'group' => 'Storage',      'safe' => true],

        // Queue
        'queue:restart'      => ['description' => 'Restart all queue workers after code deploy', 'group' => 'Queue',     'safe' => true],
        'queue:work --once'  => ['description' => 'Process a single queued job',              'group' => 'Queue',        'safe' => true],
        'queue:failed'       => ['description' => 'List all failed queue jobs',               'group' => 'Queue',        'safe' => true],
        'queue:flush'        => ['description' => 'Flush all failed queue jobs',              'group' => 'Queue',        'safe' => false],

        // Academic Automation
        'academic:enforce-deadlines' => ['description' => 'Lock registrations past their deadline',      'group' => 'Academic', 'safe' => true],
        'academic:calculate-gpa'     => ['description' => 'Run GPA & grade calculations for all students','group' => 'Academic', 'safe' => false],
        'academic:promote-students'  => ['description' => 'Run institutional student promotion protocol', 'group' => 'Academic', 'safe' => false],
        'academic:rotate-semester'   => ['description' => 'Rotate academic semester to the next period',  'group' => 'Academic', 'safe' => false],

        // Finance
        'finance:payment-reminders'  => ['description' => 'Send payment reminder notifications',          'group' => 'Finance',  'safe' => true],

        // Scholarships
        'fetch:scholarships'         => ['description' => 'Sync scholarships from external sources',      'group' => 'Academic', 'safe' => true],

        // Maintenance
        'schedule:list'      => ['description' => 'List all scheduled commands',              'group' => 'System',       'safe' => true],
        'about'              => ['description' => 'Display basic info about the application', 'group' => 'System',       'safe' => true],
        'inspire'            => ['description' => 'Display an inspiring quote',               'group' => 'System',       'safe' => true],
    ];

    /**
     * GET /api/v1/admin/commands
     * Returns the grouped command whitelist for the UI.
     */
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        $grouped = [];
        foreach (self::WHITELIST as $command => $meta) {
            $grouped[$meta['group']][] = [
                'command'     => $command,
                'description' => $meta['description'],
                'safe'        => $meta['safe'],
            ];
        }

        return response()->json(['groups' => $grouped]);
    }

    /**
     * POST /api/v1/admin/commands/run
     * Runs a whitelisted artisan command and returns its output.
     */
    public function run(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'command' => 'required|string|max:120',
        ]);

        $command = trim($request->input('command'));

        // STRICT WHITELIST CHECK — the most important security gate
        if (!array_key_exists($command, self::WHITELIST)) {
            Log::channel('stack')->warning('[CommandCenter] REJECTED unlisted command', [
                'command'  => $command,
                'user_id'  => $request->user()->id,
                'ip'       => $request->ip(),
            ]);
            return response()->json([
                'success' => false,
                'output'  => "❌ Command not permitted: [{$command}]\nOnly whitelisted commands can be executed.",
            ], 403);
        }

        // Log the execution attempt before running
        Log::channel('stack')->info('[CommandCenter] Executing command', [
            'command'  => $command,
            'user_id'  => $request->user()->id,
            'user'     => $request->user()->email,
            'ip'       => $request->ip(),
            'at'       => now()->toIso8601String(),
        ]);

        try {
            // Parse command + arguments
            $parts    = explode(' ', $command, 2);
            $artisan  = $parts[0];
            $args     = $parts[1] ?? '';

            // Build argument array for Artisan::call
            $callArgs = [];
            if ($args) {
                // Parse simple flags like --force, --once etc.
                foreach (explode(' ', $args) as $arg) {
                    $arg = trim($arg);
                    if (str_starts_with($arg, '--')) {
                        $flag = ltrim($arg, '-');
                        if (str_contains($flag, '=')) {
                            [$key, $val] = explode('=', $flag, 2);
                            $callArgs["--{$key}"] = $val;
                        } else {
                            $callArgs["--{$flag}"] = true;
                        }
                    }
                }
            }

            Artisan::call($artisan, $callArgs);
            $output = Artisan::output();

            Log::channel('stack')->info('[CommandCenter] Command completed', [
                'command' => $command,
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success'  => true,
                'output'   => $output ?: "✅ Command completed with no output.",
                'ran_at'   => now()->toIso8601String(),
            ]);

        } catch (\Throwable $e) {
            Log::channel('stack')->error('[CommandCenter] Command failed', [
                'command'  => $command,
                'user_id'  => $request->user()->id,
                'error'    => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'output'  => "❌ Error: " . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Inline admin gate — does not rely on policy/gate registration.
     */
    private function authorizeAdmin(Request $request): void
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }
}
