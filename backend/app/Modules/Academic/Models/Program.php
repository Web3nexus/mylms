<?php

namespace App\Modules\Academic\Models;

use App\Modules\Courses\Models\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasFactory;

    protected $fillable = ['department_id', 'name', 'slug', 'degree_level', 'duration_years'];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn($program) => $program->slug = $program->slug ?? Str::slug($program->name));
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'program_course');
    }
}
