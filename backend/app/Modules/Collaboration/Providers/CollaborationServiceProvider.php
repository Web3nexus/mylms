<?php

namespace App\Modules\Collaboration\Providers;

use App\Modules\Collaboration\Models\Forum;
use App\Modules\Collaboration\Models\ForumTopic;
use App\Modules\Collaboration\Policies\ForumPolicy;
use App\Modules\Collaboration\Policies\TopicPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CollaborationServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the module.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Forum::class => ForumPolicy::class,
        ForumTopic::class => TopicPolicy::class,
    ];

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
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
