<?php

namespace App\Modules\Admissions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Modules\Academic\Models\Program;

class AdmissionApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'program_id', 
        'status', 
        'personal_info', 
        'address_info', 
        'academic_background', 
        'documents',
        'scholarship_reason',
        'scholarship_status',
        'fee_status',
        'waiver_requested'
    ];

    protected $casts = [
        'personal_info' => 'json',
        'address_info' => 'json',
        'academic_background' => 'json',
        'documents' => 'json',
        'waiver_requested' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
