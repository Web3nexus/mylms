<?php

namespace App\Modules\Courses\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Modules\Academic\Models\Semester;

class CourseRegistration extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'semester_id',
        'status',
        'grade',
        'grade_letter',
    ];

    protected $casts = [
        'grade' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }
}
