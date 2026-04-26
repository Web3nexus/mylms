<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip()); // Relaxed for development
        });

        // ─────────────────────────────────────────────────────────────
        //  DYNAMIC COMMUNICATION SETTINGS
        // ─────────────────────────────────────────────────────────────
        try {
            if (app()->runningInConsole() === false || app()->runningUnitTests() === false) {
                $settings = [
                    'mail.mailers.smtp.host'       => SystemSetting::getVal('mail_host'),
                    'mail.mailers.smtp.port'       => SystemSetting::getVal('mail_port'),
                    'mail.mailers.smtp.encryption' => SystemSetting::getVal('mail_encryption'),
                    'mail.mailers.smtp.username'   => SystemSetting::getVal('mail_username'),
                    'mail.mailers.smtp.password'   => SystemSetting::getVal('mail_password'),
                    'mail.from.address'            => SystemSetting::getVal('mail_from_address'),
                    'mail.from.name'               => SystemSetting::getVal('mail_from_name'),
                    'mail.mailers.smtp.scheme'     => null,
                    'mail.mailers.smtp.url'        => null,
                ];

                $hasConfig = false;
                foreach ($settings as $key => $value) {
                    if ($value !== null) {
                        $processedValue = ($value === 'null' || $value === 'none') ? null : $value;
                        Config::set($key, $processedValue);
                        if ($key === 'mail.mailers.smtp.host' && $processedValue) $hasConfig = true;
                    }
                }

                if ($hasConfig) {
                    Config::set('mail.default', 'smtp');
                    Config::set('mail.mailers.smtp.transport', 'smtp');
                }
            }
        } catch (\Exception $e) {
            // Silently fail if DB isn't ready
        }
    }
}
