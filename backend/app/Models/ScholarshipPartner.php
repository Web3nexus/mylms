<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScholarshipPartner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'website',
        'description',
        'logo_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scholarships()
    {
        return $this->hasMany(Scholarship::class);
    }
}
