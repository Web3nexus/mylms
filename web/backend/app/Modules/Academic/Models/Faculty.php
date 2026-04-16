<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description'];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn($faculty) => $faculty->slug = $faculty->slug ?? Str::slug($faculty->name));
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
