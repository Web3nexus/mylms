<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['faculty_id', 'name', 'slug', 'code'];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn($dept) => $dept->slug = $dept->slug ?? Str::slug($dept->name));
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }
}
