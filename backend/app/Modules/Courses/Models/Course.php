<?php

namespace App\Modules\Courses\Models;

use App\Modules\Academic\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'instructor_id',
        'category_id',
        'description',
        'thumbnail',
        'price',
        'status',
        'credits',
        'credit_hours',
        'semester_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'credits' => 'integer',
        'credit_hours' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($course) {
            if (empty($course->slug)) {
                $course->slug = Str::slug($course->title);
            }
        });
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'program_course');
    }

    public function registrations()
    {
        return $this->hasMany(CourseRegistration::class);
    }

    public function semester()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Semester::class);
    }

    public function forums()
    {
        return $this->hasMany(\App\Modules\Collaboration\Models\Forum::class);
    }
}
