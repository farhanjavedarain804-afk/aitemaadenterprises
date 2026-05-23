# Aitemaad Enterprises — Node.js Web App

React + Vite single-page application served by a simple Node.js server. No TanStack / SSR frameworks.

## Project structure

```
├── public/                 # Static files (favicon)
├── server.js               # Production Node server (SPA + static assets)
├── index.html              # HTML shell
├── src/
│   ├── app/                # App shell & routing
│   │   ├── App.tsx         # React Router routes
│   │   └── AppLayout.tsx   # Layout, maintenance mode, toaster
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       └── AdminDashboardPage.tsx
│   ├── components/         # UI & site sections
│   ├── hooks/
│   ├── lib/                  # Utilities (analytics, settings, admin log)
│   ├── integrations/supabase/
│   ├── assets/
│   └── styles/globals.css
└── supabase/migrations/    # Database SQL (run in Supabase dashboard)
```

## Local development

```bash
npm install
cp .env.example .env   # add your Supabase keys
npm run dev
```

Open http://localhost:5173

## Production

```bash
npm run build
npm start
```

Open http://localhost:3000

## Hostinger

| Setting        | Value                          |
|----------------|--------------------------------|
| Build command  | `npm run build`                |
| Start command  | `npm start`                    |
| Entry file     | `server.js`                    |
| Node version   | 20 or 22                       |
| Env vars       | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |

Run `supabase/migrations/*.sql` in Supabase SQL Editor before using analytics/admin logs.

## Routes

| Path               | Page              |
|--------------------|-------------------|
| `/`                | Public website    |
| `/admin/login`     | Admin sign-in     |
| `/admin/dashboard` | Admin panel       |
