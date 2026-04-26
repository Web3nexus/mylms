@extends('emails.admission.layout')

@section('content')
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background-color: #fef2f2; border-radius: 100%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 32px;">⚖️</span>
        </div>
        <h2>Institutional Decision</h2>
    </div>

    <p>Dear {{ $application->user->name }},</p>
    
    <p>We appreciate your interest in the <strong>{{ $application->program->name }}</strong> program. After a rigorous review of your scholastic portfolio by the Departmental Committee, we must inform you that we are unable to offer you admission at this time.</p>

    <div class="data-card">
        <div class="data-row">
            <span class="label">Decision Type</span>
            <span class="value">Institutional Review</span>
        </div>
        <div class="data-row">
            <span class="label">Status</span>
            <span class="value" style="color: #ef4444;">Closed</span>
        </div>
    </div>

    @if($application->review_notes)
    <p><strong>Reviewer Context:</strong><br>
    <span style="font-style: italic; color: #64748b;">{{ $application->review_notes }}</span></p>
    @endif

    <p>We encourage you to maintain your pursuit of academic excellence and consider future registry phases if your scholastic profile evolves.</p>

    <div style="text-align: center; margin-top: 40px;">
        <a href="{{ config('app.url') }}/apply/dashboard" class="btn" style="background-color: #64748b;">Return to Portal</a>
    </div>
@endsection
