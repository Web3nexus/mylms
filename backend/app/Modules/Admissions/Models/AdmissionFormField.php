<?php

namespace App\Modules\Admissions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'field_key',
        'label',
        'category',
        'type',
        'options',
        'is_required',
        'is_active',
        'order_index'
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'is_active' => 'boolean'
    ];
}
