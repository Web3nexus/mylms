<?php

namespace App\Modules\Courses\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rubric extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function criteria()
    {
        return $this->hasMany(RubricCriterion::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }
}
