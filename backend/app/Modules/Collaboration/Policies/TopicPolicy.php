<?php

namespace App\Modules\Collaboration\Policies;

use App\Models\User;
use App\Modules\Collaboration\Models\ForumTopic;
use Illuminate\Auth\Access\HandlesAuthorization;

class TopicPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can update the topic.
     */
    public function update(User $user, ForumTopic $topic)
    {
        return $user->id === $topic->user_id || $user->isInstructor() || $user->isAdmin();
    }

    /**
     * Determine if the user can lock or pin the topic.
     */
    public function moderate(User $user)
    {
        return $user->isInstructor() || $user->isAdmin();
    }

    /**
     * Determine if the user can post a reply.
     */
    public function reply(User $user, ForumTopic $topic)
    {
        if ($topic->is_locked) {
            return $user->isInstructor() || $user->isAdmin();
        }

        return true;
    }
}
