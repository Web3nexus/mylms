<?php

namespace App\Modules\Courses\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RubricCriterion extends Model
{
    use HasFactory;

    protected $table = 'rubric_criteria';

    protected $fillable = [
        'rubric_id',
        'name',
        'description',
        'max_score'
    ];

    public function rubric()
    {
        return $this->belongsTo(Rubric::class);
    }
}
