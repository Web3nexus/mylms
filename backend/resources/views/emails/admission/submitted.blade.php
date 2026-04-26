@extends('emails.admission.layout')

@section('content')
    <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background-color: #f0fdf4; border-radius: 100%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 32px;">📩</span>
        </div>
        <h2>Application Vaulted</h2>
    </div>

    <p>Dear {{ $application->user->name }},</p>
    
    <p>Your scholastic profile has been successfully transmitted to the Academic Registry for the <strong>{{ $application->program->name }}</strong> program. Your credentials and document bunker have been securely vaulted and await departmental quorum review.</p>

    <div class="data-card">
        <div class="data-row">
            <span class="label">Reference ID</span>
            <span class="value">#ADM-{{ strtoupper(substr($application->id, 0, 8)) }}</span>
        </div>
        <div class="data-row">
            <span class="label">Registry Phase</span>
            <span class="value">Transmission Complete</span>
        </div>
    </div>

    <p>Official evaluation typically requires institutional review. You will receive an automated notification as soon as a final decision is registered in the portal.</p>

    <div style="text-align: center; margin-top: 40px;">
        <a href="{{ config('app.url') }}/apply/dashboard" class="btn">Track Progress</a>
    </div>
@endsection
