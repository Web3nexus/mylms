<?php

namespace App\Modules\Admissions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Modules\Academic\Models\Program;
use App\Modules\Admissions\Models\AdmissionOffer;

class AdmissionApplication extends Model
{
    use HasFactory;

    const STATUS_INCOMPLETE = 'incomplete';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_PENDING    = 'pending';
    const STATUS_APPROVED   = 'approved';
    const STATUS_REJECTED   = 'rejected';

    const FEE_PENDING = 'pending';
    const FEE_PAID    = 'paid';
    const FEE_WAIVED  = 'waived';

    const SCHOLARSHIP_NOT_APPLIED = 'not_applied';
    const SCHOLARSHIP_PENDING     = 'pending';
    const SCHOLARSHIP_APPROVED    = 'approved';
    const SCHOLARSHIP_REJECTED    = 'rejected';
    const SCHOLARSHIP_RENEWED     = 'renewed';
    const SCHOLARSHIP_REVOKED     = 'revoked';

    const STEP_PERSONAL = 'identity_verification';
    const STEP_PROGRAM  = 'program_selection';

    protected $fillable = [
        'user_id', 
        'program_id',
        'faculty_id',
        'instructor_id',
        'status', 
        'current_step',
        'step_data',
        'scholarship_reason',
        'scholarship_status',
        'application_fee_status',
        'waiver_requested_at',
        'waiver_emails_sent',
    ];

    protected $casts = [
        'step_data' => 'json',
        'waiver_requested_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Program::class);
    }

    public function faculty()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Faculty::class);
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function offer()
    {
        return $this->hasOne(AdmissionOffer::class, 'application_id');
    }
}
