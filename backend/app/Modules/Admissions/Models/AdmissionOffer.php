<?php

namespace App\Modules\Admissions\Models;

use App\Modules\Admissions\Models\AdmissionApplication;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'offer_type',
        'expiry_date',
        'accepted'
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
        'accepted' => 'boolean'
    ];

    public function application()
    {
        return $this->belongsTo(AdmissionApplication::class, 'application_id');
    }
}
