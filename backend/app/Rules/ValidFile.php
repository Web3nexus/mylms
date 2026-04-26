<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidFile implements DataAwareRule, ValidationRule
{
    protected array $data = [];
    protected array $allowedMimes;
    protected int $maxSize;

    /**
     * @param array $allowedMimes ['pdf', 'doc', 'docx', 'jpg', 'png']
     * @param int $maxSizeKb Maximum file size in KB (default 10MB = 10240)
     */
    public function __construct(
        array $allowedMimes = ['pdf', 'doc', 'docx'],
        int $maxSizeKb = 10240
    ) {
        $this->allowedMimes = $allowedMimes;
        $this->maxSize = $maxSizeKb;
    }

    public function setData(array $data): static
    {
        $this->data = $data;
        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof \Illuminate\Http\UploadedFile) {
            $fail('The :attribute must be a valid uploaded file.');
            return;
        }

        // Check file size
        $sizeInKb = $value->getSize() / 1024;
        if ($sizeInKb > $this->maxSize) {
            $fail("The :attribute must not be larger than {$this->maxSize} KB (current: " . round($sizeInKb, 2) . " KB).");
            return;
        }

        // Check MIME type (not just extension)
        $mimeType = $value->getMimeType();
        $validMimeTypes = $this->getValidMimeTypes();

        if (!in_array($mimeType, $validMimeTypes)) {
            $fail('The :attribute has an invalid file type. Allowed: ' . implode(', ', $this->allowedMimes));
            return;
        }

        // Additional extension check for Word documents
        if (in_array('doc', $this->allowedMimes) || in_array('docx', $this->allowedMimes)) {
            $extension = $value->getClientOriginalExtension();
            $originalName = $value->getClientOriginalName();

            // Check for double extension attacks (e.g., file.php.docx)
            if (substr_count($originalName, '.') > 1) {
                $fail('The :attribute filename cannot contain multiple extensions.');
                return;
            }

            if (!in_array(strtolower($extension), ['doc', 'docx'])) {
                $fail('The :attribute must be a valid Word document (.doc or .docx).');
                return;
            }
        }
    }

    private function getValidMimeTypes(): array
    {
        $mimeMap = [
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'webp' => ['image/webp'],
            'zip' => ['application/zip', 'application/x-zip-compressed'],
        ];

        $validMimes = [];
        foreach ($this->allowedMimes as $mime) {
            if (isset($mimeMap[$mime])) {
                $validMimes = array_merge($validMimes, $mimeMap[$mime]);
            }
        }

        return array_unique($validMimes);
    }
}
