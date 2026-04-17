<?php

use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Courses\Controllers\CategoryController;
use App\Modules\Courses\Controllers\CourseController;
use App\Modules\Courses\Controllers\LessonController;
use App\Modules\Courses\Controllers\AssessmentController;
use App\Modules\Courses\Controllers\AITutorController;
use App\Modules\Courses\Controllers\RegistrationController;
use App\Modules\Academic\Controllers\AcademicController;
use App\Modules\Academic\Controllers\AcademicSessionController;
use App\Modules\Admissions\Controllers\AdmissionController;
use App\Modules\Admissions\Controllers\AdmissionFieldController;
use App\Modules\Admin\Controllers\StudentDirectoryController;
use App\Modules\Results\Controllers\InstructorGradeController;
use App\Modules\Results\Controllers\StudentTranscriptController;
use App\Modules\Results\Controllers\CredentialController;
use App\Modules\Finance\Controllers\FinanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ScholarshipController;
use App\Modules\Collaboration\Controllers\ForumController;
use App\Modules\Collaboration\Controllers\ForumPostController;
use App\Modules\Admin\Controllers\PageController;
use App\Modules\Admin\Controllers\BrandingController;
use App\Http\Controllers\CommandCenterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Identity & Branding (Sprint 21)
Route::get('/branding', [BrandingController::class, 'index']);

// Public CMS Routes
Route::get('/pages/{slug}', [PageController::class, 'show']);

// Auth Routes
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Course & Academic Routes (Public)
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{course:slug}', [CourseController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/public/faculties', [AcademicController::class, 'index']);

// Public Scholarship Directory (Sprint 14)
Route::get('/scholarships', [ScholarshipController::class, 'index']);

// Public Certificate Verification (Sprint 12)
Route::get('/verify/{code}', [CredentialController::class, 'verify']);

// Instructor/Student Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    
    // Manage Courses (Instructors)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/my-courses', [CourseController::class, 'myCourses']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        // Manage Lessons (Instructors)
        Route::apiResource('courses.lessons', LessonController::class)->shallow();

        // Manage Assessments (Instructors)
        Route::apiResource('courses.assessments', AssessmentController::class)->shallow();
        Route::post('/courses/{course}/assessments/generate', [AssessmentController::class, 'generate']);
        Route::post('/assessments/{assessment}/questions', [AssessmentController::class, 'addQuestions']);

        // Manage Grades & Results (Instructors)
        Route::get('/courses/{course}/gradebook', [InstructorGradeController::class, 'index']);
        Route::post('/courses/{course}/gradebook/{registration}', [InstructorGradeController::class, 'update']);

        // Manage Academic Structure (Admins/Management)
        Route::get('/academic', [AcademicController::class, 'index']);
        Route::post('/academic/faculties', [AcademicController::class, 'storeFaculty']);
        Route::post('/academic/faculties/{faculty}/departments', [AcademicController::class, 'storeDepartment']);
        Route::post('/academic/departments/{department}/programs', [AcademicController::class, 'storeProgram']);
        Route::post('/academic/programs/{program}/courses', [AcademicController::class, 'linkCourses']);

        // Manage Academic Sessions & Semesters (Admins)
        Route::get('/academic/sessions', [AcademicSessionController::class, 'index']);
        Route::post('/academic/sessions', [AcademicSessionController::class, 'storeSession']);
        Route::post('/academic/sessions/{session}/activate', [AcademicSessionController::class, 'activateSession']);
        Route::post('/academic/sessions/{session}/semesters', [AcademicSessionController::class, 'storeSemester']);
        Route::post('/academic/semesters/{semester}/current', [AcademicSessionController::class, 'setCurrentSemester']);
        Route::post('/academic/events', [AcademicSessionController::class, 'storeEvent']);

        // Manage Admissions (Admins)
        Route::get('/admissions/applications', [AdmissionController::class, 'index']);
        Route::post('/admissions/applications/{application}/review', [AdmissionController::class, 'review']);
        
        // Manage Admission Form Fields (Admins)
        Route::get('/admissions/fields-admin', [AdmissionFieldController::class, 'adminIndex']);
        Route::post('/admissions/fields', [AdmissionFieldController::class, 'store']);
        Route::post('/admissions/fields/{field}/toggle', [AdmissionFieldController::class, 'toggle']);
        Route::delete('/admissions/fields/{field}', [AdmissionFieldController::class, 'destroy']);

        // Manage Finances (Admins)
        Route::get('/finance/dashboard', [FinanceController::class, 'dashboardMetrics']);
        Route::post('/finance/invoices/generate', [FinanceController::class, 'generateSemesterInvoice']);

        // Student Directory (Admins)
        Route::get('/admin/students', [StudentDirectoryController::class, 'index']);

        // Staff & Personnel Management (Admins)
        Route::get('/admin/staff', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'index']);
        Route::post('/admin/staff', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'store']);
        Route::delete('/admin/staff/{user}', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'destroy']);

        // Trigger Global Scholarship Sync (Admins)
        Route::post('/scholarships/sync', [ScholarshipController::class, 'triggerFetch']);

        // Manage Branding & Global Settings (Admins)
        Route::patch('/branding', [BrandingController::class, 'update']);

        // Command Center — Secure Artisan Runner (Admin only, whitelist-enforced)
        Route::get('/admin/commands', [CommandCenterController::class, 'index']);
        Route::post('/admin/commands/run', [CommandCenterController::class, 'run']);
    });

    // Student Enrollments (legacy)
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::get('/my-enrollments', [CourseController::class, 'myEnrollments']);

    // AI Course Tutor
    Route::post('/courses/{course}/tutor', [AITutorController::class, 'ask']);

    // Academic Course Registration (Sprint 9)
    Route::get('/registration/catalog', [RegistrationController::class, 'catalog']);
    Route::get('/registration/semesters', [RegistrationController::class, 'semesters']);
    Route::get('/registration/my-courses', [RegistrationController::class, 'myRegistrations']);
    Route::post('/registration/courses/{course}/register', [RegistrationController::class, 'register']);
    Route::post('/registration/courses/{course}/drop', [RegistrationController::class, 'drop']);

    // Student Admissions
    Route::get('/my-application', [AdmissionController::class, 'myApplication']);
    Route::get('/admissions/fields', [AdmissionFieldController::class, 'index']);
    Route::get('/faculties/{faculty}/instructors', [AdmissionController::class, 'facultyInstructors']);
    Route::post('/apply', [AdmissionController::class, 'apply']);
    Route::post('/admission-offers/{offer}/accept', [AdmissionController::class, 'acceptOffer']);

    // Assessment Submissions
    Route::get('/assessments/{assessment}', [AssessmentController::class, 'show']);
    Route::post('/assessments/{assessment}/submit', [AssessmentController::class, 'submit']);

    // Student Official Transcript (Sprint 10/20)
    Route::get('/transcript', [StudentTranscriptController::class, 'index']);
    Route::get('/transcript/download', [StudentTranscriptController::class, 'download']);

    // Collaboration & Discussion Forums (Sprint 21)
    Route::get('/courses/{course}/forums', [ForumController::class, 'index']);
    Route::post('/courses/{course}/forums', [ForumController::class, 'store']);
    Route::get('/forums/{forum}', [ForumController::class, 'showForum']); // List topics
    Route::post('/forums/{forum}/topics', [ForumController::class, 'storeTopic']);
    Route::get('/topics/{topic}', [ForumController::class, 'showTopic']); // Show topic + posts
    Route::patch('/topics/{topic}', [ForumController::class, 'updateTopic']);
    Route::post('/topics/{topic}/posts', [ForumPostController::class, 'store']);
    Route::delete('/posts/{post}', [ForumPostController::class, 'destroy']);

    // Student Finances & Billing (Sprint 11)
    Route::get('/finance/my-invoices', [FinanceController::class, 'myInvoices']);
    Route::post('/finance/invoices/{invoice:id}/pay', [FinanceController::class, 'processPayment']);
    Route::get('/finance/verify-payment', [FinanceController::class, 'verifyPayment']);

    // Certificates & Credentials (Sprint 12)
    Route::post('/courses/{course:slug}/certificate', [CredentialController::class, 'claimCertificate']);
    Route::get('/courses/{course:slug}/certificate', [CredentialController::class, 'show']);

    // Notifications (Sprint 13)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Public Payment Webhooks
Route::post('/webhooks/payments/{gateway}', [App\Modules\Finance\Controllers\WebhookController::class, 'handle']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
