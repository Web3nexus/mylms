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
    const ROLE_SUPER_ADMIN = 'super_admin';
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
        'status',
        'is_super_admin',
        'program_id',
        'faculty_id',
        'level_id',
        'student_id',
        'otp_code',
        'otp_expires_at',
        'email_verified_at',
        'permissions',
        'academic_advisor_id',
        'scholarship_id',
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

    public function scholarship()
    {
        return $this->belongsTo(Scholarship::class);
    }



    /**
     * Role Helpers
     */
    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true || $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return $this->is_super_admin === true || $this->role === self::ROLE_ADMIN;
    }

    public function isInstructor(): bool
    {
        return $this->role === self::ROLE_INSTRUCTOR;
    }

    public function isStaff(): bool
    {
        return $this->is_super_admin === true || $this->role === self::ROLE_STAFF;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    public function isAdvisor(): bool
    {
        return $this->role === self::ROLE_ADVISOR;
    }

    /**
     * Check if user has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $permissions = $this->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Check if user can manage academic structure (department/level)
     */
    public function canManageAcademic(): bool
    {
        return $this->isAdmin() || $this->hasPermission('academic_enrollment');
    }

    /**
     * Check if user can manage a specific course
     */
    public function canManageCourse(\App\Models\Course $course): bool
    {
        if ($this->isSuperAdmin() || $this->isAdmin()) {
            return true;
        }

        if (!$this->isInstructor()) {
            return false;
        }

        // Check if instructor is assigned to the course's department and level
        if ($course->department_id) {
            $query = $this->instructorAssignments()->where('department_id', $course->department_id);
            
            if ($course->level_id) {
                $query->where('level_id', $course->level_id);
            }

            if ($query->exists()) {
                return true;
            }
        }

        // Check if instructor is the course creator/owner
        if ($course->instructor_id === $this->id) {
            return true;
        }

        return false;
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function faculty()
    {
        return $this->belongsTo(\App\Modules\Academic\Models\Faculty::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function instructorAssignments()
    {
        return $this->hasMany(InstructorAssignment::class);
    }

    public function courseOfferings()
    {
        return $this->hasMany(CourseOffering::class, 'instructor_id');
    }

    public function audits()
    {
        return $this->hasMany(AdminAudit::class);
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
