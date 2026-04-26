# MyLMS Web Application

## Project Structure

```
web/
├── backend/   # Laravel 13 API server
├── frontend/  # React + TypeScript SPA
├── assets/    # Shared static assets
├── deploy.sh  # Deployment script
└── index.php  # Entry point
```

---

## Backend (`backend/`)

### Laravel Application Structure

```
backend/
├── app/
│   ├── Console/        # Artisan commands
│   ├── Http/          # Controllers, Middleware, Requests
│   ├── Jobs/          # Queue jobs
│   ├── Mail/          # Mail classes
│   ├── Models/        # Eloquent models
│   ├── Modules/       # Feature modules
│   ├── Notifications/ # Notification classes
│   ├── Providers/     # Service providers
│   └── Services/      # Business logic services
├── config/            # Configuration files
├── database/          # Migrations, factories, seeders
├── resources/         # Views, assets, lang files
├── routes/            # Route definitions
├── storage/           # Logs, uploads, cache
└── tests/             # PHPUnit tests
```

### Key Dependencies
- Laravel Framework 13.x
- Laravel Sanctum (API auth)
- Stripe PHP SDK (payments)
- DomPDF (PDF generation)
- Redis (caching via Predis)

### Development Commands
```bash
cd backend
composer run dev       # Start server, queue, logs, vite concurrently
composer run test      # Run tests
php artisan serve      # Start dev server only
php artisan pail       # View logs in real-time
php artisan queue:work # Process jobs
```

### Environment Setup
```bash
cp .env.example .env
php artisan key:generate
php artisan migrate
```

See `backend/README.md` for full Laravel documentation.

---

## Frontend (`frontend/`)

### React Application Structure

```
frontend/
├── src/
│   ├── api/           # API client/requests
│   ├── assets/        # Static assets
│   ├── cms/           # Puck CMS components
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Route pages
│   ├── store/         # Zustand state stores
│   ├── App.tsx        # Root component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Public assets
├── index.html         # HTML template
└── vite.config.ts     # Vite configuration
```

### Key Dependencies
- React 19.x
- TypeScript 5.9
- Vite 6.x
- Tailwind CSS 4.x
- Zustand (state)
- React Router DOM 7.x
- Puck Editor (CMS)
- React Quill (rich text)
- React Player (video)

### Development Commands
```bash
cd frontend
npm run dev     # Start Vite dev server
npm run build   # Production build
npm run lint    # Run ESLint
```

### TypeScript Configuration
- Config files: `tsconfig.app.json`, `tsconfig.node.json`
- ESLint: Configured with typescript-eslint and React hooks plugins

---

## Deployment

Run from `web/` directory:
```bash
./deploy.sh
```

---

## Architecture Notes

- Backend serves as API-only (Sanctum authentication)
- Frontend is a standalone SPA served by Vite in dev, static files in prod
- CMS content managed via Puck Editor integration
- State management uses Zustand stores
- Video content handled via react-player
- Rich text editing via react-quill-new
