<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicEvent extends Model
{
    protected $fillable = [
        'semester_id',
        'title',
        'description',
        'event_type',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Get the semester that owns this academic event.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }
}
