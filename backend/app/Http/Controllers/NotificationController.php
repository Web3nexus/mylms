<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get the latest 15 notifications for the user, differentiating unread.
     */
    public function index()
    {
        $user = Auth::user();
        
        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $user->notifications()->take(15)->get()
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->find($id);
        
        if ($notification && is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        
        return response()->json(['message' => 'All marked as read']);
    }
}
