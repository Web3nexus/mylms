<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Computer Science', 'slug' => 'computer-science'],
            ['name' => 'Business & Finance', 'slug' => 'business-finance'],
            ['name' => 'Health & Medicine', 'slug' => 'health-medicine'],
            ['name' => 'Arts & Design', 'slug' => 'arts-design'],
            ['name' => 'Language Learning', 'slug' => 'language-learning'],
        ];

        foreach ($categories as $category) {
            \App\Modules\Courses\Models\Category::create($category);
        }
    }
}
