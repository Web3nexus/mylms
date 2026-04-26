<?php

namespace App\Modules\Academic\Models;

use App\Modules\Courses\Models\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id', 
        'name', 
        'slug', 
        'degree_level', 
        'duration_years',
        // Additions for Admissions & Pricing (Phase 1)
        'pricing_type',
        'tuition_fee',
        'application_fee',
        'certificate_fee',
        'is_scholarship_eligible',
        'is_external',
        'external_provider'
    ];

    protected $casts = [
        'is_scholarship_eligible' => 'boolean',
        'is_external' => 'boolean',
        'tuition_fee' => 'decimal:2',
        'application_fee' => 'decimal:2',
        'certificate_fee' => 'decimal:2'
    ];

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
