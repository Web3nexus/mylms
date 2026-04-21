<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'slug',
        'subject',
        'content_html',
        'placeholders',
        'category'
    ];

    protected $casts = [
        'placeholders' => 'json'
    ];
}
