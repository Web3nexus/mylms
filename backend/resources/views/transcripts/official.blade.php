<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Academic Transcript – {{ $user->name }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', 'Arial', sans-serif; color: #1e1b2e; background: #fff; }

        .page { padding: 48px 56px; max-width: 900px; margin: auto; }

        /* ── Header ───────────────────────────────────────────────── */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid {{ $primaryColor ?? '#4b345d' }};
            padding-bottom: 24px;
            margin-bottom: 32px;
        }
        .header-left { display: flex; align-items: center; gap: 18px; }
        .logo { width: 64px; height: 64px; object-fit: contain; }
        .logo-placeholder {
            width: 64px; height: 64px; border-radius: 12px;
            background: {{ $primaryColor ?? '#4b345d' }};
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 900; font-size: 22px;
        }
        .institution-name {
            font-size: 20px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.06em; color: {{ $primaryColor ?? '#4b345d' }};
            line-height: 1.2;
        }
        .institution-motto { font-size: 10px; color: #9e8fa8; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3px; }
        .doc-badge {
            text-align: right;
        }
        .doc-badge .doc-title {
            font-size: 13px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.12em; color: {{ $accentColor ?? '#c0162d' }};
        }
        .doc-badge .doc-sub {
            font-size: 9px; color: #b0a4bc; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;
        }
        .verification {
            font-size: 9px; color: #c9bdd4; letter-spacing: 0.08em; margin-top: 6px;
            font-family: 'Courier New', monospace;
        }

        /* ── Student Info ─────────────────────────────────────────── */
        .student-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 12px; margin-bottom: 32px;
            background: #f9f6fb; border-radius: 10px; padding: 20px 24px;
            border-left: 4px solid {{ $primaryColor ?? '#4b345d' }};
        }
        .info-item .label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9e8fa8; }
        .info-item .value { font-size: 13px; font-weight: 700; color: #1e1b2e; margin-top: 2px; }

        /* ── Semester Block ──────────────────────────────────────── */
        .semester-block { margin-bottom: 28px; page-break-inside: avoid; }
        .semester-header {
            background: {{ $primaryColor ?? '#4b345d' }};
            color: #fff; padding: 8px 14px;
            font-size: 11px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.1em; border-radius: 6px 6px 0 0;
        }
        table.grades { width: 100%; border-collapse: collapse; }
        table.grades th {
            background: #f2eef6; padding: 9px 12px;
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.1em; color: #6b5a7a;
            border-bottom: 1px solid #e2d9eb;
            text-align: left;
        }
        table.grades td { padding: 9px 12px; border-bottom: 1px solid #f0eaf7; font-size: 12px; color: #1e1b2e; }
        table.grades tbody tr:last-child td { border-bottom: none; }
        .summary-row td { background: #f9f6fb; font-weight: 700; font-size: 11px; color: {{ $primaryColor ?? '#4b345d' }}; }
        .grade-pass { color: #155724; font-weight: 700; }
        .grade-fail { color: #721c24; font-weight: 700; }

        /* ── CGPA Summary ────────────────────────────────────────── */
        .cgpa-section {
            display: flex; gap: 16px; margin-bottom: 36px; margin-top: 8px;
        }
        .cgpa-box {
            flex: 1; padding: 18px; border-radius: 10px;
            text-align: center; border: 1.5px solid #e2d9eb;
        }
        .cgpa-box.primary { background: {{ $primaryColor ?? '#4b345d' }}; border-color: transparent; }
        .cgpa-box .val { font-size: 28px; font-weight: 900; color: #1e1b2e; }
        .cgpa-box.primary .val { color: #fff; }
        .cgpa-box .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #9e8fa8; margin-top: 4px; font-weight: 700; }
        .cgpa-box.primary .lbl { color: rgba(255,255,255,0.6); }

        /* ── Signature & Footer ─────────────────────────────────── */
        .signature-section {
            display: flex; justify-content: space-between; align-items: flex-end;
            margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2d9eb;
        }
        .seal-area { text-align: center; }
        .seal-img { width: 80px; height: 80px; opacity: 0.7; }
        .sig-line { border-top: 1px solid #1e1b2e; width: 200px; padding-top: 6px; font-size: 11px; font-weight: 700; color: #4a4a4a; }
        .footer {
            margin-top: 28px; padding-top: 16px; border-top: 1px solid #f0eaf7;
            text-align: center; font-size: 9px; color: #b0a4bc; letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .watermark {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 80px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.2em; color: rgba(75, 52, 93, 0.04);
            pointer-events: none; white-space: nowrap; z-index: 0;
        }
    </style>
</head>
<body>

<div class="watermark">OFFICIAL</div>

<div class="page">

    {{-- ── Header ── --}}
    <div class="header">
        <div class="header-left">
            @if($logoUrl)
                <img src="{{ $logoUrl }}" class="logo" alt="Logo">
            @else
                <div class="logo-placeholder">{{ strtoupper(substr($institutionName, 0, 1)) }}</div>
            @endif
            <div>
                <div class="institution-name">{{ $institutionName }}</div>
                @if($motto)
                    <div class="institution-motto">{{ $motto }}</div>
                @endif
            </div>
        </div>
        <div class="doc-badge">
            <div class="doc-title">Official Academic Transcript</div>
            <div class="doc-sub">Certified Registry Document</div>
            <div class="verification">VRF: {{ strtoupper(substr(md5($user->id . now()), 0, 16)) }}</div>
        </div>
    </div>

    {{-- ── Student Info ── --}}
    <div class="student-grid">
        <div class="info-item">
            <div class="label">Student Name</div>
            <div class="value">{{ $user->name }}</div>
        </div>
        <div class="info-item">
            <div class="label">Student ID</div>
            <div class="value">{{ $user->student_id ?? 'Pending Assignment' }}</div>
        </div>
        <div class="info-item">
            <div class="label">Programme of Study</div>
            <div class="value">{{ $user->program->name ?? 'Undergraduate Degree' }}</div>
        </div>
        <div class="info-item">
            <div class="label">Academic Level</div>
            <div class="value">Level {{ $user->academic_level ?? '100' }}</div>
        </div>
        <div class="info-item">
            <div class="label">Date of Issue</div>
            <div class="value">{{ now()->format('F j, Y') }}</div>
        </div>
        <div class="info-item">
            <div class="label">Status</div>
            <div class="value">{{ ucfirst($user->status ?? 'Active') }}</div>
        </div>
    </div>

    {{-- ── CGPA Summary ── --}}
    <div class="cgpa-section">
        <div class="cgpa-box primary">
            <div class="val">{{ number_format($cgpa, 2) }}</div>
            <div class="lbl">Cumulative GPA</div>
        </div>
        <div class="cgpa-box">
            <div class="val">{{ $totalCredits }}</div>
            <div class="lbl">Credits Earned</div>
        </div>
        <div class="cgpa-box">
            <div class="val">{{ count($transcript) }}</div>
            <div class="lbl">Terms Completed</div>
        </div>
    </div>

    {{-- ── Grade Records ── --}}
    @foreach($transcript as $term)
        <div class="semester-block">
            <div class="semester-header">
                {{ $term['semester_name'] }} &mdash; {{ $term['academic_session'] }}
                &nbsp;&nbsp;|&nbsp;&nbsp; SGPA: {{ number_format($term['sgpa'], 2) }}
                &nbsp;&nbsp;|&nbsp;&nbsp; Credits: {{ $term['total_credits'] }}
            </div>
            <table class="grades">
                <thead>
                    <tr>
                        <th width="15%">Course ID</th>
                        <th width="50%">Course Title</th>
                        <th width="10%">Credits</th>
                        <th width="10%">Grade</th>
                        <th width="15%">Points</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($term['courses'] as $course)
                        <tr>
                            <td>{{ $course['course_id'] }}</td>
                            <td>{{ $course['title'] }}</td>
                            <td>{{ $course['credits'] }}</td>
                            <td class="{{ ($course['letter'] === 'F') ? 'grade-fail' : 'grade-pass' }}">
                                {{ $course['letter'] ?? 'N/A' }}
                                @if($course['grade'] !== null)
                                    ({{ $course['grade'] }})
                                @endif
                            </td>
                            <td>{{ $course['points'] !== null ? number_format($course['points'], 2) : '—' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endforeach

    {{-- ── Signature ── --}}
    <div class="signature-section">
        <div class="seal-area">
            @if($sealUrl)
                <img src="{{ $sealUrl }}" class="seal-img" alt="Institutional Seal">
            @endif
        </div>
        <div>
            <div class="sig-line">
                {{ $registrarName ?? 'University Registrar' }}
            </div>
        </div>
    </div>

    {{-- ── Footer ── --}}
    <div class="footer">
        <p>This document is an official academic record of {{ $institutionName }}.&nbsp;&nbsp;|&nbsp;&nbsp;Issued {{ now()->format('Y') }}</p>
        <p style="margin-top: 4px;">Tampering with this document is a criminal offence. Verify authenticity via the institutional registry portal.</p>
    </div>

</div>
</body>
</html>
