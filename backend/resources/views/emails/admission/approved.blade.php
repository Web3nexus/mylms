@extends('emails.admission.layout')

@section('content')
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 100%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 32px;">🎉</span>
        </div>
        <h2 style="color: #ba1646;">Admission Offer Approved</h2>
    </div>

    <p>Dear {{ $application->user->name }},</p>
    
    <p>Congratulations. The Institutional Quorum of the <strong>{{ $application->program->department->faculty->name }}</strong> has formally approved your candidacy for the <strong>{{ $application->program->name }}</strong> program.</p>

    <div class="data-card">
        <div class="data-row">
            <span class="label">Official Student ID</span>
            <span class="value" style="font-family: monospace; font-size: 16px; letter-spacing: 0.1em;">{{ $application->user->student_id }}</span>
        </div>
        <div class="data-row">
            <span class="label">Degree Level</span>
            <span class="value">{{ $application->program->degree_level }}</span>
        </div>
        <div class="data-row">
            <span class="label">Status</span>
            <span class="value" style="color: #10b981;">Provisionally Admitted</span>
        </div>
        @if($application->scholarship)
        <div class="data-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <span class="label" style="color: #6366f1;">Scholarship Awarded</span>
            <span class="value" style="color: #4f46e5; font-weight: bold;">
                {{ $application->scholarship->title }}
                @if($application->scholarship->amount)
                    ({{ $application->scholarship->currency === 'USD' ? '$' : $application->scholarship->currency }}{{ number_format($application->scholarship->amount) }})
                @else
                    (Full Ride)
                @endif
            </span>
        </div>
        @endif
    </div>

    <p>Your official matriculation number is now active. Please proceed to the portal to finalize your enrollment, satisfy any pending institutional fees, and synchronize your academic calendar.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Final Step: Accessing Your Campus</h3>
        <p style="font-size: 13px; color: #475569; margin-bottom: 16px;">You can now log in to the <strong>Unified Campus</strong> using the following credentials:</p>
        <ul style="font-size: 13px; color: #475569; padding-left: 20px;">
            <li style="margin-bottom: 8px;"><strong>Username/ID:</strong> {{ $application->user->student_id }}</li>
            <li style="margin-bottom: 8px;"><strong>Password:</strong> Use the secure password you created during registration.</li>
        </ul>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px; font-style: italic;">Note: For your security, keep these credentials confidential at all times.</p>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <a href="{{ config('app.url') }}/campus" class="btn">Access Unified Campus</a>
    </div>
@endsection
