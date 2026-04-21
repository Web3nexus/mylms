<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value', 'type', 'group'];

    public static function getVal(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        // If the setting doesn't exist, or if it exists but the value is empty/null, return default
        if (!$setting || $setting->value === null || $setting->value === '') {
            return $default;
        }

        return match($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    public static function setVal(string $key, $value, string $type = 'string', string $group = 'general')
    {
        $stringValue = is_array($value) ? json_encode($value) : (string) $value;
        
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $stringValue, 'type' => $type, 'group' => $group]
        );
    }
}
