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
use App\Modules\Admin\Controllers\EnrollmentController;
use App\Modules\Admissions\Controllers\AdmissionWizardController;
use App\Modules\Courses\Controllers\PeerReviewController;
use App\Modules\Courses\Controllers\RubricController;
use App\Modules\Courses\Controllers\LessonNoteController;
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
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

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

// Enrollment Lookup
Route::get('/programs-by-level/{level}', [EnrollmentController::class, 'getProgramsByLevel']);

// Public Certificate Verification (Sprint 12)
Route::get('/verify/{code}', [CredentialController::class, 'verify']);

// Instructor/Student Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    
    // Manage Courses (Instructors)
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{course}', [CourseController::class, 'update']);
    Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

    // Manage Lessons (Instructors)
    Route::apiResource('courses.lessons', LessonController::class)->shallow();

    // Manage Assessments (Instructors)
    Route::apiResource('courses.assessments', AssessmentController::class)->shallow();

    // Manage Rubrics
    Route::apiResource('courses.rubrics', RubricController::class)->shallow();
    Route::post('/courses/{course}/assessments/generate', [AssessmentController::class, 'generate']);
    Route::post('/assessments/{assessment}/questions', [AssessmentController::class, 'addQuestions']);

    // Manage Grades & Results (Instructors)
    Route::get('/courses/{course}/gradebook', [InstructorGradeController::class, 'index']);
    Route::post('/courses/{course}/gradebook/{registration}', [InstructorGradeController::class, 'update']);

    // Unified Academic & Enrollment Management (Admins/Management)
    Route::prefix('admin/academic')->group(function () {
        Route::get('/structure', [EnrollmentController::class, 'index']); // faculties/depts/progs list
        
        Route::post('/faculties', [EnrollmentController::class, 'storeFaculty']);
        Route::put('/faculties/{faculty}', [EnrollmentController::class, 'updateFaculty']);
        Route::delete('/faculties/{faculty}', [EnrollmentController::class, 'deleteFaculty']);
        
        Route::post('/departments', [EnrollmentController::class, 'storeDepartment']);
        Route::put('/departments/{department}', [EnrollmentController::class, 'updateDepartment']);
        Route::delete('/departments/{department}', [EnrollmentController::class, 'deleteDepartment']);

        Route::post('/programs', [EnrollmentController::class, 'storeProgram']);
        Route::put('/programs/{program}', [EnrollmentController::class, 'updateProgram']);
        Route::delete('/programs/{program}', [EnrollmentController::class, 'deleteProgram']);
    });

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

    // ---- ADMIN-ONLY ROUTES (role guard enforced) ----
    Route::middleware('role:admin')->group(function () {
        // Student Directory
        Route::get('/admin/students', [StudentDirectoryController::class, 'index']);
        Route::get('/admin/students/{id}', [StudentDirectoryController::class, 'show']);

        // Staff & Personnel Management
        Route::get('/admin/staff', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'index']);
        Route::post('/admin/staff', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'store']);
        Route::delete('/admin/staff/{user}', [\App\Modules\Admin\Controllers\StaffManagementController::class, 'destroy']);

        // Scholarship Sync
        Route::post('/scholarships/sync', [ScholarshipController::class, 'triggerFetch']);

        // Branding & Global Settings
        Route::patch('/branding', [BrandingController::class, 'update']);
        Route::post('/branding/upload', [BrandingController::class, 'uploadAsset']);

        // CMS Pages
        Route::get('/admin/pages', [PageController::class, 'index']);
        Route::get('/admin/pages/{slug}', [PageController::class, 'showAdmin']);
        Route::post('/admin/pages', [PageController::class, 'store']);
        Route::patch('/admin/pages/{id}', [PageController::class, 'update']);
        Route::delete('/admin/pages/{id}', [PageController::class, 'destroy']);

        // Admission Institutional Settings
        Route::get('/admin/admissions/settings', [\App\Modules\Admissions\Controllers\AdmissionSettingsController::class, 'index']);
        Route::patch('/admin/admissions/settings', [\App\Modules\Admissions\Controllers\AdmissionSettingsController::class, 'update']);

        // Command Center
        Route::get('/admin/commands', [CommandCenterController::class, 'index']);
        Route::post('/admin/commands/run', [CommandCenterController::class, 'run']);
    });

    // Student Enrollments (legacy)
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::get('/my-enrollments', [CourseController::class, 'myEnrollments']);

    // AI Course Tutor
    Route::post('/courses/{course}/tutor', [AITutorController::class, 'ask']);

    // Lesson Notes (Student specific)
    Route::get('/lessons/{lesson}/notes', [LessonNoteController::class, 'show']);
    Route::post('/lessons/{lesson}/notes', [LessonNoteController::class, 'store']);

    // Academic Course Registration (Sprint 9)
    Route::get('/registration/catalog', [RegistrationController::class, 'catalog']);
    Route::get('/registration/semesters', [RegistrationController::class, 'semesters']);
    Route::get('/registration/my-courses', [RegistrationController::class, 'myRegistrations']);
    Route::post('/registration/courses/{course}/register', [RegistrationController::class, 'register']);
    Route::post('/registration/courses/{course}/drop', [RegistrationController::class, 'drop']);

    Route::get('/admissions/fields', [AdmissionFieldController::class, 'index']);
    Route::get('/faculties/{faculty}/instructors', [AdmissionController::class, 'facultyInstructors']);
    Route::post('/admission-offers/{offer}/accept', [AdmissionController::class, 'acceptOffer']);

    // Application Fee, Waiver & Full Admission Flow
    Route::get('/my-application', [AdmissionController::class, 'myApplication']);
    Route::post('/admission/pay-fee', [AdmissionController::class, 'payFee']);
    Route::post('/admission/request-waiver', [AdmissionController::class, 'requestWaiver']);
    Route::post('/admission/save-step', [AdmissionController::class, 'saveStep']);
    Route::post('/admission/save-progress', [AdmissionController::class, 'saveStep']); // legacy alias
    Route::post('/admission/submit', [AdmissionController::class, 'submitApplication']);
    Route::post('/admission/upload-document', [AdmissionController::class, 'uploadDocument']);

    // Admin: Scholarship renewal review
    Route::post('/admissions/applications/{application}/scholarship-renewal', [AdmissionController::class, 'reviewScholarshipRenewal']);



    // Assessment Submissions
    // Peer Assessment
    Route::get('/peer-reviews/assigned', [PeerReviewController::class, 'assigned']);
    Route::get('/peer-reviews/{review}', [PeerReviewController::class, 'show']);
    Route::post('/peer-reviews/{review}/submit', [PeerReviewController::class, 'submit']);
    Route::post('/assessments/{assessment}/allocate-peers', [PeerReviewController::class, 'allocate']);

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

Route::get('/user', [AuthController::class, 'me'])->middleware('auth:sanctum');
