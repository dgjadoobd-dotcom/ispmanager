# ISP Manager

A full-featured ISP (Internet Service Provider) management system built with React, TypeScript, and Tailwind CSS.

**Architecture:**
- **Frontend**: React + Vite (deployable to Cloudflare Pages)
- **Backend**: Node.js/Express for MikroTik & OLT APIs (deployable to Railway/Render/VPS)
- **Database**: Supabase (PostgreSQL) or localStorage fallback

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `admin` | `admin123` |
| Staff | `staff` | `staff123` |

To change credentials, edit `src/lib/localAuth.ts`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

## Docker (Production)

### Build & run with Docker Compose

```bash
docker-compose up -d --build
```

Open [http://localhost](http://localhost)

### Or build & run manually

```bash
# Build image
docker build -t ispmanager .

# Run container
docker run -d -p 80:80 --name ispmanager ispmanager
```

### Stop

```bash
docker-compose down
```

### Rebuild after code changes

```bash
docker-compose up -d --build --force-recreate
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** + **shadcn/ui** — UI components
- **TanStack Query** — data fetching & caching
- **React Router v6** — routing
- **localStorage** — all data persistence (no backend needed)

## Architecture

### Authentication
All auth is handled locally via `src/lib/localAuth.ts`. Sessions are stored in `localStorage`. No Supabase auth or external service is used.

### Database
All data is persisted in `localStorage` through `src/lib/db.ts` — a lightweight CRUD layer. Tables include:

| Table | Description |
|-------|-------------|
| `customers` | ISP subscribers |
| `packages` | Service packages / plans |
| `bills` | Generated invoices |
| `payments` | Payment records |
| `network_integrations` | MikroTik / RADIUS configs |
| `olt_devices` | OLT device management |
| `resellers` | Reseller accounts |
| `notification_logs` | Notification history |
| `api_keys` | API access keys |

### Key Directories

```
src/
├── lib/
│   ├── db.ts           # localStorage database engine
│   └── localAuth.ts    # local authentication
├── contexts/
│   ├── AuthContext.tsx     # auth state (local)
│   └── TenantContext.tsx   # tenant/ISP state (local)
├── hooks/              # all data hooks (localStorage-backed)
├── pages/              # route pages
└── components/         # UI components
```

## Features

- **Dashboard** — revenue charts, customer stats, recent activity
- **Customers** — full CRUD, connection status, network sync
- **Billing** — invoice generation, payment recording, PDF export
- **Packages** — service plan management with MikroTik integration
- **Reports** — revenue, collection, customer growth, package distribution
- **Network** — MikroTik server management, OLT devices, sync logs
- **Resellers** — reseller management, commissions, wallet
- **Notifications** — notification logs and stats
- **Settings** — branding, general, email, payment gateway, API access
- **Super Admin Panel** — tenant/ISP management, platform stats
- **Customer Portal** — self-service portal for end customers
- **PWA** — installable as a mobile app with offline support
- **Demo Mode** — explore the app without logging in

## Build

```bash
npm run build
```

Output goes to `dist/`. Can be served from any static host (Nginx, Apache, Netlify, Vercel, etc.).
