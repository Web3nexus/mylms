<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'provider',
        'amount',
        'currency',
        'description',
        'external_url',
        'deadline',
        'tags',
        'hash',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'deadline' => 'date',
        'tags' => 'array',
    ];
}
