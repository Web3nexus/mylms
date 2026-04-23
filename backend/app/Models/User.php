<?php

namespace App\Models;

use App\Modules\Academic\Models\Program;
use App\Modules\Courses\Models\Submission;
use App\Modules\Admissions\Models\AdmissionApplication;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Role Constants
     */
    const ROLE_ADMIN = 'admin';
    const ROLE_INSTRUCTOR = 'instructor';
    const ROLE_STAFF = 'staff';
    const ROLE_STUDENT = 'student';
    const ROLE_ADVISOR = 'advisor';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'program_id',
        'faculty_id',
        'student_id',
        'otp_code',
        'otp_expires_at',
        'email_verified_at',
        'permissions',
        'academic_advisor_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'permissions' => 'array',
        ];
    }

    /**
     * Role Helpers
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isInstructor(): bool
    {
        return $this->role === self::ROLE_INSTRUCTOR;
    }

    public function isStaff(): bool
    {
        return $this->role === self::ROLE_STAFF;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    public function isAdvisor(): bool
    {
        return $this->role === self::ROLE_ADVISOR;
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function faculty()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Faculty::class);
    }

    public function admissionApplications()
    {
        return $this->hasMany(AdmissionApplication::class);
    }

    public function courseRegistrations()
    {
        return $this->hasMany(\App\Modules\Courses\Models\CourseRegistration::class);
    }

    public function advisor()
    {
        return $this->belongsTo(User::class, 'academic_advisor_id');
    }

    public function assignedStudents()
    {
        return $this->hasMany(User::class, 'academic_advisor_id');
    }
}
