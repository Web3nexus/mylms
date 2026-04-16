<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Academic Transcript - {{ $user->name }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 0; }
        .container { padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a365d; padding-bottom: 20px; position: relative; }
        .seal { position: absolute; left: 0; top: 0; width: 80px; height: 80px; }
        .university-name { font-size: 24px; font-weight: bold; color: #1a365d; text-transform: uppercase; margin: 0; }
        .document-title { font-size: 18px; font-weight: bold; color: #718096; margin-top: 5px; }
        
        .student-info { margin-bottom: 30px; width: 100%; }
        .student-info td { padding: 5px 0; vertical-align: top; }
        .label { font-weight: bold; color: #4a5568; width: 150px; }
        
        .semester-block { margin-bottom: 30px; page-break-inside: avoid; }
        .semester-header { background-color: #f7fafc; padding: 8px 12px; border-left: 4px solid #2b6cb0; font-weight: bold; margin-bottom: 10px; }
        
        table.grades { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.grades th { text-align: left; background-color: #edf2f7; padding: 10px; border-bottom: 1px solid #cbd5e0; font-size: 12px; text-transform: uppercase; }
        table.grades td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        
        .summary-row { background-color: #f8fafc; font-weight: bold; }
        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #718096; text-align: center; }
        .signature-space { margin-top: 40px; text-align: right; }
        .signature-line { border-top: 1px solid #333; width: 200px; display: inline-block; margin-top: 40px; }
        
        .gpa-badge { display: inline-block; padding: 4px 10px; background-color: #1a365d; color: white; border-radius: 4px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if(file_exists(public_path('storage/branding/seal.png')))
                <img src="{{ public_path('storage/branding/seal.png') }}" class="seal">
            @endif
            <h1 class="university-name">Smart Online University</h1>
            <div class="document-title">Official Academic Transcript</div>
        </div>

        <table class="student-info">
            <tr>
                <td class="label">Student Name:</td>
                <td>{{ $user->name }}</td>
                <td class="label">Student ID:</td>
                <td>{{ $user->student_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td class="label">Program:</td>
                <td>{{ $user->program->name ?? 'Undergraduate Degree' }}</td>
                <td class="label">Academic Level:</td>
                <td>Level {{ $user->academic_level ?? '100' }}</td>
            </tr>
            <tr>
                <td class="label">Date of Issue:</td>
                <td>{{ now()->format('F j, Y') }}</td>
                <td class="label">Cumulative GPA:</td>
                <td><span class="gpa-badge">{{ number_format($cgpa, 2) }}</span></td>
            </tr>
        </table>

        @foreach($transcript as $term)
            <div class="semester-block">
                <div class="semester-header">
                    {{ $term['semester_name'] }} - {{ $term['academic_session'] }}
                </div>
                <table class="grades">
                    <thead>
                        <tr>
                            <th width="15%">Course Code</th>
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
                                <td>{{ $course['letter'] }} ({{ $course['grade'] }})</td>
                                <td>{{ number_format($course['points'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                    <tfoot>
                        <tr class="summary-row">
                            <td colspan="2" style="text-align: right;">Term Summary:</td>
                            <td>{{ $term['total_credits'] }}</td>
                            <td colspan="2">SGPA: {{ number_format($term['sgpa'], 2) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        @endforeach

        <div class="signature-space">
            <div class="signature-line"></div>
            <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">University Registrar</p>
        </div>

        <div class="footer">
            <p>This document is an official academic record of Smart Online University. EST. 2026.</p>
            <p>Verification Code: {{ strtoupper(substr(md5($user->id . now()), 0, 12)) }}</p>
        </div>
    </div>
</body>
</html>
