<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdmissionFieldsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [
            // Personal
            ['field_key' => 'full_name', 'label' => 'Full Legal Name', 'category' => 'personal', 'type' => 'text', 'is_required' => true, 'order_index' => 1],
            ['field_key' => 'dob', 'label' => 'Date of Birth', 'category' => 'personal', 'type' => 'date', 'is_required' => true, 'order_index' => 2],
            ['field_key' => 'sex', 'label' => 'Sex', 'category' => 'personal', 'type' => 'select', 'options' => ['Male', 'Female', 'Other'], 'is_required' => true, 'order_index' => 3],
            ['field_key' => 'religion', 'label' => 'Religion', 'category' => 'personal', 'type' => 'text', 'is_required' => false, 'order_index' => 4],
            
            // Contact
            ['field_key' => 'email', 'label' => 'Official Email', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 5],
            ['field_key' => 'phone', 'label' => 'Phone Number', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 6],
            ['field_key' => 'address', 'label' => 'Home Address', 'category' => 'contact', 'type' => 'textarea', 'is_required' => true, 'order_index' => 7],
            ['field_key' => 'city', 'label' => 'City', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 8],
            ['field_key' => 'country', 'label' => 'Country', 'category' => 'contact', 'type' => 'text', 'is_required' => true, 'order_index' => 9],
            
            // Academic
            ['field_key' => 'academic_status', 'label' => 'Current Academic Status', 'category' => 'academic', 'type' => 'select', 'options' => ['Undergraduate', 'Postgraduate', 'Continuing', 'Transfer'], 'is_required' => true, 'order_index' => 10],
            ['field_key' => 'enrollment_type', 'label' => 'Enrollment Type', 'category' => 'academic', 'type' => 'select', 'options' => ['Full-Time', 'Part-Time', 'Distance'], 'is_required' => true, 'order_index' => 11],
            ['field_key' => 'grad_year', 'label' => 'Year of Graduation', 'category' => 'academic', 'type' => 'number', 'is_required' => true, 'order_index' => 12],
            ['field_key' => 'lang_study', 'label' => 'Preferred Language of Study', 'category' => 'academic', 'type' => 'select', 'options' => ['English', 'French', 'Other'], 'is_required' => true, 'order_index' => 13],
            ['field_key' => 'course_list', 'label' => 'Anticipated Course List (Interest)', 'category' => 'academic', 'type' => 'textarea', 'is_required' => false, 'order_index' => 14],
            
            // Sponsors
            ['field_key' => 'sponsors', 'label' => 'Official Sponsor/Financial Support Details', 'category' => 'financial', 'type' => 'textarea', 'is_required' => true, 'order_index' => 15],
        ];

        foreach ($fields as $field) {
            \App\Modules\Admissions\Models\AdmissionFormField::updateOrCreate(
                ['field_key' => $field['field_key']],
                $field
            );
        }
    }
}
