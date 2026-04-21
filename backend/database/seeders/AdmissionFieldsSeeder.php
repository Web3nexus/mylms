<?php

namespace Database\Seeders;

use App\Modules\Admissions\Models\AdmissionFormField;
use Illuminate\Database\Seeder;

class AdmissionFieldsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [
            // PERSONAL
            ['field_key' => 'full_name', 'label' => 'Full Name(s)', 'category' => 'personal', 'type' => 'text', 'is_required' => true, 'order_index' => 1],
            ['field_key' => 'dob', 'label' => 'Date of Birth', 'category' => 'personal', 'type' => 'date', 'is_required' => true, 'order_index' => 2],
            ['field_key' => 'sex', 'label' => 'Sex', 'category' => 'personal', 'type' => 'select', 'options' => ['Male', 'Female', 'Other'], 'is_required' => true, 'order_index' => 3],
            ['field_key' => 'religion', 'label' => 'Religion', 'category' => 'personal', 'type' => 'text', 'is_required' => true, 'order_index' => 4],

            // CONTACT
            ['field_key' => 'email', 'label' => 'Email Address', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 5],
            ['field_key' => 'phone', 'label' => 'Phone', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 6],
            ['field_key' => 'home_address', 'label' => 'Home address', 'category' => 'contact', 'type' => 'textarea', 'is_required' => true, 'order_index' => 7],
            ['field_key' => 'residence_city', 'label' => 'Current city of residence', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 8],
            ['field_key' => 'fb_ig_id', 'label' => 'Facebook/Instagram Name/ID', 'category' => 'contact', 'type' => 'text', 'is_required' => false, 'order_index' => 9],

            // ACADEMIC
            ['field_key' => 'academic_status', 'label' => 'Current academic status', 'category' => 'academic', 'type' => 'select', 'options' => ['High School Graduate', 'Undergraduate', 'Postgraduate', 'Other'], 'is_required' => true, 'order_index' => 10],
            ['field_key' => 'school_graduated', 'label' => "School you've graduated from", 'category' => 'academic', 'type' => 'text', 'is_required' => false, 'order_index' => 11],
            ['field_key' => 'grad_year', 'label' => 'Year of graduation', 'category' => 'academic', 'type' => 'number', 'is_required' => false, 'order_index' => 12],
            ['field_key' => 'lang_study', 'label' => 'Preferred language of studies', 'category' => 'academic', 'type' => 'select', 'options' => ['English', 'French', 'Other'], 'is_required' => true, 'order_index' => 13],
            ['field_key' => 'academic_year', 'label' => 'Academic year', 'category' => 'academic', 'type' => 'select', 'options' => ['2026/2027', '2027/2028'], 'is_required' => true, 'order_index' => 14],
            ['field_key' => 'course_interest', 'label' => 'Course of interest', 'category' => 'academic', 'type' => 'text', 'is_required' => true, 'order_index' => 15],

            // FINANCIAL
            ['field_key' => 'sponsors', 'label' => 'Sponsors', 'category' => 'financial', 'type' => 'textarea', 'is_required' => true, 'order_index' => 16],

            // MEMBERSHIP
            ['field_key' => 'social_membership', 'label' => 'Learnforth Social Membership', 'category' => 'membership', 'type' => 'select', 'options' => ['Yes', 'No', 'Interested'], 'is_required' => true, 'order_index' => 17],
            ['field_key' => 'referred_by', 'label' => 'Kindly select who referred you', 'category' => 'membership', 'type' => 'text', 'is_required' => false, 'order_index' => 18],

            // CREDENTIALS
            ['field_key' => 'username', 'label' => 'Username', 'category' => 'credentials', 'type' => 'text', 'is_required' => true, 'order_index' => 19],
            ['field_key' => 'password', 'label' => 'Password', 'category' => 'credentials', 'type' => 'text', 'is_required' => true, 'order_index' => 20],
            ['field_key' => 'captcha', 'label' => 'Captcha', 'category' => 'credentials', 'type' => 'text', 'is_required' => true, 'order_index' => 21],

            // DOCUMENTS
            ['field_key' => 'upload_id', 'label' => 'Upload your ID', 'category' => 'documents', 'type' => 'file', 'is_required' => true, 'order_index' => 22],
            ['field_key' => 'upload_certificate', 'label' => 'Upload your previous school certificate', 'category' => 'documents', 'type' => 'file', 'is_required' => true, 'order_index' => 23],
            ['field_key' => 'upload_dob_proof', 'label' => 'Upload proof of date of birth', 'category' => 'documents', 'type' => 'file', 'is_required' => true, 'order_index' => 24],
        ];

        foreach ($fields as $field) {
            AdmissionFormField::updateOrCreate(
                ['field_key' => $field['field_key']],
                $field
            );
        }

        // Cleanup: Optionally remove fields that are NOT in this list if you want to enforce the exact standard
        // AdmissionFormField::whereNotIn('field_key', array_column($fields, 'field_key'))->delete();
    }
}
