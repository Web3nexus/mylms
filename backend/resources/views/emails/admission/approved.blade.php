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
    </div>

    <p>Your official matriculation number is now active. Please proceed to the portal to finalize your enrollment, satisfy any pending institutional fees, and synchronize your academic calendar.</p>

    <div style="text-align: center; margin-top: 40px;">
        <a href="{{ config('app.url') }}/apply/dashboard" class="btn">Complete Enrollment</a>
    </div>
@endsection
