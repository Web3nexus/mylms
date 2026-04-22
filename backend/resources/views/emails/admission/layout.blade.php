<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Academic Registry' }}</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; line-height: 1.6; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background-color: #1e1b4b; padding: 40px; text-align: center; background-image: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-style: italic; }
        .header .badge { display: inline-block; background-color: #ba1646; color: #ffffff; font-size: 9px; font-weight: 900; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
        .content { padding: 48px; }
        .content h2 { color: #1e1b4b; font-size: 28px; font-weight: 900; margin-top: 0; margin-bottom: 24px; letter-spacing: -0.02em; }
        .content p { color: #475569; font-size: 15px; margin-bottom: 24px; }
        .data-card { background-color: #f1f5f9; border-radius: 16px; padding: 24px; border-left: 4px solid #ba1646; margin-bottom: 32px; }
        .data-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
        .data-row .label { font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        .data-row .value { font-weight: 700; color: #1e1b4b; }
        .btn { display: inline-block; background-color: #1e1b4b; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 12px rgba(30, 27, 75, 0.2); }
        .btn:hover { background-color: #312e81; }
        .footer { padding: 40px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .footer p { margin: 4px 0; }
        @media only screen and (max-width: 600px) {
            .container { margin-top: 0; border-radius: 0; }
            .content { padding: 32px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="badge">Registry Protocol</div>
                <h1>{{ $institutionName ?? 'MyLMS University' }}</h1>
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} {{ $institutionName ?? 'MyLMS University' }} Academic Registry</p>
                <p>Digital Signature Verified • Institutional Transmission</p>
            </div>
        </div>
    </div>
</body>
</html>
