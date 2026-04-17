<?php

namespace App\Modules\Courses\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'text',
        'type',
        'points'
    ];

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function options()
    {
        return $this->hasMany(Option::class);
    }
}
