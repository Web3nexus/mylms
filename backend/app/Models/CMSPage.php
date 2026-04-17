<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CMSPage extends Model
{
    protected $table = 'cms_pages';

    protected $fillable = ['slug', 'title', 'puck_json', 'is_published', 'is_core'];

    protected $casts = [
        'puck_json' => 'array',
        'is_published' => 'boolean'
    ];
}
