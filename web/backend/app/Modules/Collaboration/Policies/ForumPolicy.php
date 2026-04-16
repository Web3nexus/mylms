<?php

namespace App\Modules\Collaboration\Policies;

use App\Models\User;
use App\Modules\Collaboration\Models\Forum;
use Illuminate\Auth\Access\HandlesAuthorization;

class ForumPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can create a topic in the forum.
     */
    public function createTopic(User $user, Forum $forum)
    {
        // Only instructors/admins can post in Announcement forums
        if ($forum->type === 'announcement') {
            return $user->isInstructor() || $user->isAdmin();
        }

        // Everyone (enrolled) can post in other forum types
        return true;
    }

    /**
     * Determine if the user can manage the forum itself.
     */
    public function manage(User $user, Forum $forum)
    {
        return $user->isInstructor() || $user->isAdmin();
    }
}
