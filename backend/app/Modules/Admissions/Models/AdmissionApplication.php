<?php

namespace App\Modules\Admissions\Models;

use App\Models\User;
use App\Modules\Academic\Models\Program;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'faculty_id',
        'instructor_id',
        'status',
        'personal_statement',
        'form_data',
        'documents',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'review_notes'
    ];

    protected $casts = [
        'documents' => 'array',
        'form_data' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function faculty()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Faculty::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function offer()
    {
        return $this->hasOne(AdmissionOffer::class, 'application_id');
    }
}
