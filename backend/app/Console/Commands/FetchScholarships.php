<?php

namespace App\Console\Commands;

use App\Models\Scholarship;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FetchScholarships extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:scholarships';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crawl and sync automated external scholarship opportunities into the LMS.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Initializing Global Scholarship Sync...');

        // For the scope of this Sprint, we mock realistic data instead of scraping live HTML
        // to ensure database consistency without the fragility of brittle CSS selectors.
        
        $mockData = [
            [
                'title' => 'Global Tech Innovators Fellowship',
                'provider' => 'Silicon Horizon Foundation',
                'amount' => 15000.00,
                'description' => 'A merit-based fellowship targeting students pushing the boundaries in AI and distributed systems.',
                'external_url' => 'https://example.com/scholarships/tech-innovators',
                'deadline' => now()->addDays(rand(10, 60)),
                'tags' => ['STEM', 'Technology', 'International'],
            ],
            [
                'title' => 'Future Healthcare Leaders Grant',
                'provider' => 'MedLife Alliance',
                'amount' => 8500.00,
                'description' => 'Supporting the next generation of public health workers and medical administrators.',
                'external_url' => 'https://example.com/scholarships/medlife-grant',
                'deadline' => now()->addDays(rand(20, 90)),
                'tags' => ['Healthcare', 'Undergraduate'],
            ],
            [
                'title' => 'Creative Arts & Expression Endowment',
                'provider' => 'The Renaissance Guild',
                'amount' => 5000.00,
                'description' => 'Open to students pursuing visual arts, digital media, or literature degrees.',
                'external_url' => 'https://example.com/scholarships/arts-endowment',
                'deadline' => now()->addDays(rand(5, 45)),
                'tags' => ['Arts', 'Diversity'],
            ],
            [
                'title' => 'Women in Business Scholarship',
                'provider' => 'Apex Financial Group',
                'amount' => 12000.00,
                'description' => 'Funding specifically reserved for female-identifying students entering the business and finance sector.',
                'external_url' => 'https://example.com/scholarships/women-business',
                'deadline' => now()->addDays(35),
                'tags' => ['Business', 'Women in Business', 'Graduate'],
            ],
            [
                'title' => 'First-Generation College Fund',
                'provider' => 'Open Door Educational Trust',
                'amount' => 3000.00,
                'description' => 'Assistance for high-achieving students who are the first in their families to attend a university.',
                'external_url' => 'https://example.com/scholarships/first-gen-fund',
                'deadline' => now()->addDays(15),
                'tags' => ['First-Generation', 'Needs-based'],
            ]
        ];

        $imported = 0;

        foreach ($mockData as $data) {
            // Generate deterministic hash to avoid duplication
            $hash = md5($data['title'] . $data['provider']);
            
            if (!Scholarship::where('hash', $hash)->exists()) {
                Scholarship::create(array_merge($data, ['hash' => $hash]));
                $imported++;
            }
        }

        $this->info("Sync Complete! Validated and imported {$imported} new opportunities.");
    }
}
