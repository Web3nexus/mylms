#!/usr/bin/env bash
# =============================================================================
# MyLMS — Production Deployment Script
# =============================================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Run this from the project root on your production server after pushing code.
# =============================================================================

set -e  # Exit immediately on any error

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
info() { echo -e "${BLUE}▸ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✘ $1${NC}"; exit 1; }

# ── Config — Edit these ───────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
DIST_DIR="$FRONTEND_DIR/dist"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MyLMS Production Deploy Script       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Pull latest code ──────────────────────────────────────────────────
info "Pulling latest code from git…"
git pull origin main || warn "Git pull skipped (may not be a git repo or already up-to-date)"
ok "Code is up to date"

# ── Step 2: Backend — Composer install ───────────────────────────────────────
info "Installing backend PHP dependencies (no-dev, optimized)…"
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-interaction --quiet
ok "Composer install complete"

# ── Step 3: Backend — Verify .env exists ─────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  fail ".env file not found in backend/. Copy .env.production.example to .env and fill it in first."
fi
ok ".env file found"

# ── Step 4: Backend — Run migrations ─────────────────────────────────────────
info "Running database migrations…"
php artisan migrate --force
ok "Migrations complete"

# ── Step 5: Backend — Cache everything ───────────────────────────────────────
info "Caching config, routes, and views…"
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
ok "Application caches built"

# ── Step 6: Backend — Storage symlink ────────────────────────────────────────
info "Creating storage symlink…"
php artisan storage:link --force 2>/dev/null || warn "storage:link skipped (may already exist)"
ok "Storage link ready"

# ── Step 7: Backend — Restart queue workers ───────────────────────────────────
info "Restarting queue workers…"
php artisan queue:restart
ok "Queue workers signalled to restart"

# ── Step 8: Frontend — Install dependencies ───────────────────────────────────
info "Installing frontend dependencies…"
cd "$FRONTEND_DIR"
npm ci --silent
ok "npm dependencies installed"

# ── Step 9: Frontend — Build for production ───────────────────────────────────
info "Building React frontend for production…"
npm run build
ok "Frontend build complete → frontend/dist/"

# ── Step 10: Verify dist was created ─────────────────────────────────────────
if [ ! -f "$DIST_DIR/index.html" ]; then
  fail "Build failed: frontend/dist/index.html not found."
fi
ok "Build verified (index.html present)"

# ── Step 11: Set permissions ──────────────────────────────────────────────────
cd "$REPO_ROOT"
info "Setting file permissions…"
chmod -R 755 "$BACKEND_DIR/storage" 2>/dev/null || true
chmod -R 755 "$BACKEND_DIR/bootstrap/cache" 2>/dev/null || true
ok "Permissions set"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🚀  Deploy Complete! All systems go.   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Backend:  ${BLUE}$BACKEND_DIR${NC}"
echo -e "  Frontend: ${BLUE}$DIST_DIR${NC}"
echo ""
echo -e "  ${YELLOW}If queue workers are managed by Supervisor, restart the service:${NC}"
echo -e "  ${YELLOW}  sudo supervisorctl restart mylms-worker:*${NC}"
echo ""
