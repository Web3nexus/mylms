# MyLMS — Production Deployment Guide

> **Stack:** Laravel 11 (PHP 8.2+) · React 19 / Vite · PostgreSQL · Apache

---

## Table of Contents

1. [Pre-flight Checklist](#1-pre-flight-checklist)
2. [Server Requirements](#2-server-requirements)
3. [First-Time Setup](#3-first-time-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup (PostgreSQL)](#5-database-setup-postgresql)
6. [Build & Deploy](#6-build--deploy)
7. [Apache / .htaccess Routing](#7-apache--htaccess-routing)
8. [Laravel Scheduler (Cron)](#8-laravel-scheduler-cron)
9. [Queue Worker (Background Jobs)](#9-queue-worker-background-jobs)
10. [Payment Gateways](#10-payment-gateways)
11. [Mail Configuration](#11-mail-configuration)
12. [Post-Deploy Verification](#12-post-deploy-verification)
13. [Subsequent Deploys](#13-subsequent-deploys)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Pre-flight Checklist

Before deploying, confirm the following locally:

- [ ] All migrations run cleanly: `php artisan migrate:status`
- [ ] Frontend builds without errors: `cd frontend && npm run build`
- [ ] No `APP_DEBUG=true` in production `.env`
- [ ] `APP_KEY` is set and non-empty
- [ ] Database password changed from the default dev password
- [ ] Payment gateway keys obtained from Paystack / Stripe dashboard
- [ ] Mail SMTP credentials confirmed

---

## 2. Server Requirements

| Requirement | Minimum |
|---|---|
| PHP | **8.2+** with extensions: `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl` |
| PostgreSQL | **14+** |
| Node.js | **20+** (build only — not needed at runtime) |
| Apache | **2.4+** with `mod_rewrite`, `mod_headers`, `mod_deflate` enabled |
| Composer | **2.x** |
| Disk | 500 MB+ free |
| RAM | 512 MB+ (1 GB recommended for queue workers) |

---

## 3. First-Time Setup

### 3a — Upload Project Files

Upload the entire project root to your server's public directory (e.g., `public_html/` on cPanel, or `/var/www/mylms/` on a VPS).

```bash
# VPS example — clone or scp the project
git clone https://github.com/YOUR_ORG/mylms.git /var/www/mylms
cd /var/www/mylms
```

### 3b — Apache Document Root

Point your Apache virtual host `DocumentRoot` to the **project root** (not `backend/public/`). The root `.htaccess` handles routing.

```apache
# /etc/apache2/sites-available/mylms.conf  (VPS example)
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/mylms
    
    <Directory /var/www/mylms>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/mylms_error.log
    CustomLog ${APACHE_LOG_DIR}/mylms_access.log combined
</VirtualHost>
```

Enable the site and required modules:
```bash
sudo a2ensite mylms
sudo a2enmod rewrite headers deflate expires
sudo systemctl reload apache2
```

> **cPanel:** Simply set the document root of your domain to the project root folder in cPanel → Domains → Manage.

### 3c — HTTPS / SSL

```bash
# VPS — Install Let's Encrypt (free SSL)
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

> **cPanel:** Use the built-in **AutoSSL** feature — it provisions certificates automatically.

---

## 4. Environment Configuration

```bash
cd backend
cp .env.production.example .env
nano .env  # or use your preferred editor
```

**Required fields to fill in:**

```dotenv
APP_KEY=           # Run: php artisan key:generate --show
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com

DB_DATABASE=mylms_production
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

SESSION_DOMAIN=.yourdomain.com

MAIL_HOST=smtp.mailgun.org     # or your provider
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_smtp_pass
MAIL_FROM_ADDRESS=noreply@yourdomain.com

PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

Generate the application key:
```bash
php artisan key:generate
```

---

## 5. Database Setup (PostgreSQL)

### 5a — Create Database and User

```sql
-- Connect as postgres superuser
psql -U postgres

CREATE USER mylms_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE mylms_production OWNER mylms_user;
GRANT ALL PRIVILEGES ON DATABASE mylms_production TO mylms_user;
\q
```

### 5b — Run Migrations

```bash
cd backend
php artisan migrate --force
```

### 5c — Seed Initial Data (first deploy only)

```bash
php artisan db:seed --force
```

> **Important:** Only run seeders on the first deploy, or for specific seeders that are safe to re-run.

### 5d — PostgreSQL Extensions (if needed)

```sql
-- UUID support (if used)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 6. Build & Deploy

### Automated (recommended)

```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Steps

```bash
# 1. Backend dependencies
cd backend
composer install --no-dev --optimize-autoloader

# 2. Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 3. Storage symlink (once)
php artisan storage:link

# 4. Frontend build
cd ../frontend
npm ci
npm run build
# Output goes to frontend/dist/ — Apache serves it from there
```

### File & Directory Permissions

```bash
# Backend storage must be writable by the web server
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache
chown -R www-data:www-data backend/storage  # Change www-data to your web user
```

---

## 7. Apache / .htaccess Routing

The root `.htaccess` handles all routing automatically:

| Request | Routed to |
|---|---|
| `/api/*` | `backend/public/index.php` (Laravel) |
| `/sanctum/*` | `backend/public/index.php` (CSRF) |
| Static files (`.js`, `.css`, images) | `frontend/dist/` |
| All other routes | `frontend/dist/index.html` (React SPA) |

**No manual Nginx/Apache config changes are needed** beyond ensuring `mod_rewrite` is enabled.

---

## 8. Laravel Scheduler (Cron)

The scheduler runs these automated tasks:

| Task | Schedule |
|---|---|
| Enforce registration deadlines | Daily at 00:01 |
| Send payment reminders | Daily at 00:05 |
| Calculate GPA | Monthly |
| Promote students | Monthly |
| Rotate semester | Monthly |

### Add to Cron (VPS)

```bash
crontab -e
```

Add this single line:
```cron
* * * * * cd /var/www/mylms/backend && php artisan schedule:run >> /dev/null 2>&1
```

### cPanel Cron Jobs

1. cPanel → **Cron Jobs**
2. Set to **Every Minute** (`* * * * *`)
3. Command:
   ```
   cd /home/YOUR_CPANEL_USER/public_html/backend && php artisan schedule:run >> /dev/null 2>&1
   ```

---

## 9. Queue Worker (Background Jobs)

The queue processes payment notifications, email dispatch, and other async jobs.

### Option A — Supervisor (VPS, recommended)

```bash
sudo apt install supervisor
sudo nano /etc/supervisor/conf.d/mylms-worker.conf
```

```ini
[program:mylms-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mylms/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/mylms-worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mylms-worker:*
```

### Option B — cPanel (shared hosting)

Add a second cron job that processes one job at a time:
```
* * * * * cd /home/YOUR_CPANEL_USER/public_html/backend && php artisan queue:work --once >> /dev/null 2>&1
```

---

## 10. Payment Gateways

### Paystack
1. Dashboard → Settings → API Keys & Webhooks
2. Copy **Secret Key** (live) → `PAYSTACK_SECRET_KEY`
3. Copy **Public Key** (live) → `PAYSTACK_PUBLIC_KEY`
4. Set Webhook URL: `https://yourdomain.com/api/webhooks/payments/paystack`
5. Copy **Webhook Secret** → `PAYSTACK_WEBHOOK_SECRET`

### Stripe
1. Dashboard → Developers → API Keys
2. Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Dashboard → Developers → Webhooks → Add endpoint
4. URL: `https://yourdomain.com/api/webhooks/payments/stripe`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 11. Mail Configuration

### Mailgun (recommended)
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@mg.yourdomain.com
MAIL_PASSWORD=your-mailgun-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### Resend
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=465
MAIL_USERNAME=resend
MAIL_PASSWORD=re_your_api_key
MAIL_ENCRYPTION=ssl
```

### Gmail SMTP (dev/small scale only)
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password  # Use App Password, not your real password
MAIL_ENCRYPTION=tls
```

---

## 12. Post-Deploy Verification

Run these checks after every deploy:

```bash
# 1. Confirm no debug info leaks
curl -s https://yourdomain.com/api/v1/nonexistent | python3 -m json.tool
# Should return: {"message":"Not Found"} — NOT a stack trace

# 2. Confirm API is up
curl -s https://yourdomain.com/api/v1/branding | python3 -m json.tool
# Should return branding JSON

# 3. Confirm SPA loads
curl -sI https://yourdomain.com | grep "200 OK"

# 4. Confirm migrations
cd backend && php artisan migrate:status

# 5. Confirm scheduler
php artisan schedule:list

# 6. Check storage permissions
ls -la backend/storage/logs/
```

### Browser Checklist
- [ ] `https://yourdomain.com` → React SPA loads correctly
- [ ] `https://yourdomain.com/login` → Login page works
- [ ] Login as admin → `/admin/portal` loads
- [ ] Admin sidebar → **Command Center** appears
- [ ] Run `cache:clear` from Command Center → green output
- [ ] `https://yourdomain.com/api/v1/branding` → returns JSON (not HTML/error page)

---

## 13. Subsequent Deploys

After the first setup, all future deploys are one command:

```bash
./deploy.sh
```

The script will:
1. Pull latest code
2. Reinstall composer deps
3. Run new migrations
4. Rebuild caches
5. Rebuild the frontend
6. Restart queue workers

---

## 14. Troubleshooting

### 500 Internal Server Error
```bash
# Check Laravel logs
tail -n 50 backend/storage/logs/laravel.log

# Check Apache logs
tail -n 50 /var/log/apache2/mylms_error.log    # VPS
# cPanel: Error Logs in cPanel dashboard
```

### API returns HTML instead of JSON
- Ensure `mod_rewrite` is enabled: `sudo a2enmod rewrite`
- Confirm `AllowOverride All` is set in the Apache vhost
- Check root `.htaccess` is readable

### React SPA shows blank page
```bash
# Check for JS build errors
cd frontend && npm run build
# Check if dist/index.html exists
ls -la frontend/dist/
```

### PostgreSQL connection refused
```bash
# Test connection
psql -h 127.0.0.1 -U mylms_user -d mylms_production
# Confirm pg service is running
sudo systemctl status postgresql
```

### Queue jobs not processing
```bash
# Check failed jobs
cd backend && php artisan queue:failed
# Retry failed jobs
php artisan queue:retry all
# Check supervisor status (VPS)
sudo supervisorctl status mylms-worker:*
```

### Storage files not accessible (404)
```bash
# Re-create the storage symlink
cd backend && php artisan storage:link --force
```

### "TokenMismatchException" / CSRF errors
- Confirm `SESSION_DOMAIN=.yourdomain.com` (note the leading dot)
- Confirm `SANCTUM_STATEFUL_DOMAINS=yourdomain.com`
- Clear session cache: `php artisan cache:clear`

---

> 📋 **Crontab quick reference** (copy-paste ready):
> ```
> * * * * * cd /PATH/TO/backend && php artisan schedule:run >> /dev/null 2>&1
> ```

---

*Last updated: April 2026 · MyLMS Production Team*
