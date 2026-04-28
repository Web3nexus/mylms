<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'scholarship_partner_id',
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

    public function partner()
    {
        return $this->belongsTo(ScholarshipPartner::class, 'scholarship_partner_id');
    }

    public function awards()
    {
        return $this->hasMany(AvailedScholarship::class);
    }

    protected $casts = [
        'amount' => 'decimal:2',
        'deadline' => 'date',
        'tags' => 'array',
    ];
}
