<?php

namespace App\Modules\Courses\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assessment_id',
        'file_path',
        'score',
        'feedback',
        'status',
        'graded_by',
        'submitted_at'
    ];

    protected $casts = [
        'submitted_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function peerReviews()
    {
        return $this->hasMany(PeerReview::class);
    }

    /**
     * Calculate final grade from completed peer reviews.
     */
    public function calculatePeerGrade()
    {
        $completedReviews = $this->peerReviews()->where('status', 'completed')->get();
        
        if ($completedReviews->isEmpty()) {
            return null;
        }

        $average = $completedReviews->avg('score');
        
        $this->update([
            'score' => round($average),
            'status' => 'graded'
        ]);

        return $average;
    }
}
