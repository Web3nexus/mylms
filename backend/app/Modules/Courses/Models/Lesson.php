<?php

namespace App\Modules\Courses\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'slug',
        'description',
        'content_type',
        'content_data',
        'order',
        'is_free'
    ];

    protected $casts = [
        'is_free' => 'boolean',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($lesson) {
            if (empty($lesson->slug)) {
                $lesson->slug = Str::slug($lesson->title);
            }
        });
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
