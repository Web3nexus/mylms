<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    private string $model = 'gemini-1.5-pro-latest';

    public function __construct()
    {
        // Give precedence to SystemSetting (Admin configurable)
        $this->apiKey = SystemSetting::getVal('gemini_api_key', config('services.gemini.key', env('GEMINI_API_KEY', '')));
        
        // Ensure standard model configuration
        $this->model = SystemSetting::getVal('gemini_model', env('GEMINI_MODEL', 'gemini-1.5-pro-latest'));
    }

    /**
     * Call the Gemini API directly via HTTP
     */
    public function generate(string $prompt, bool $jsonMode = false): ?string
    {
        if (empty($this->apiKey)) {
            Log::error('AI Generation Failed: No Gemini API Key provided in SystemSettings or ENV.');
            throw new \Exception('AI System is not configured. Please contact the administrator.');
        }

        $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => clone 0.7,
            ]
        ];

        if ($jsonMode) {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
        }

        try {
            $response = Http::post($url, $payload);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }

            Log::error('Gemini API Error', ['body' => $response->body(), 'status' => $response->status()]);
            throw new \Exception('AI generation request failed: ' . $response->body());
            
        } catch (\Exception $e) {
            Log::error('Gemini Request Exception', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Specialized wrapper to generate assessment questions as JSON
     */
    public function generateAssessmentQuestions(string $topic, string $context, int $numQuestions = 5): array
    {
        $prompt = <<<PROMPT
You are an expert academic assessment creator. Generate exactly {$numQuestions} multiple-choice questions about the topic "{$topic}".
Use the following context to make the questions highly relevant:
---
{$context}
---
Ensure each question has exactly 4 options, and exactly 1 option is marked as correct.
Return ONLY a valid JSON array matching this exact schema:
[
  {
    "text": "Question text here?",
    "points": 1,
    "options": [
      {"text": "Option A", "is_correct": true},
      {"text": "Option B", "is_correct": false},
      {"text": "Option C", "is_correct": false},
      {"text": "Option D", "is_correct": false}
    ]
  }
]
PROMPT;

        $response = $this->generate($prompt, true);
        
        if (!$response) return [];

        $decoded = json_decode($response, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * AI Tutor wrapper
     */
    public function askTutor(string $studentQuestion, string $courseContext): string
    {
         $prompt = <<<PROMPT
You are a helpful and intelligent AI teaching assistant for a university platform.
You are assisting a student. Answer strictly based on the provided course context, and if the answer is not in the course context, gently explain that you are an AI assistant limited to the course material. Keep your answer helpful, encouraging, and academically enriching.

--- COURSE CONTEXT ---
{$courseContext}
--- END COURSE CONTEXT ---

Student Question: {$studentQuestion}
PROMPT;

        return $this->generate($prompt) ?? "I'm sorry, I couldn't generate a response at this time.";
    }
}
