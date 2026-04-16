<?php

namespace App\Modules\Collaboration\Models;

use App\Modules\Courses\Models\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Forum extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'description',
        'type',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function topics()
    {
        return $this->hasMany(ForumTopic::class);
    }
}
