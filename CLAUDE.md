# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspaces from root
npm install

# Run all apps in dev mode (API :3001, web :3000, public-site :3002)
npm run dev

# Run a single app
cd apps/api && npm run dev
cd apps/web && npm run dev
cd apps/public-site && npm run dev

# Database (run from packages/database)
npx prisma migrate dev --name <migration-name>
npx prisma generate
npm run db:seed
npx prisma studio

# Type-check all packages
npm run lint
```

## Architecture

**Turborepo monorepo** with three apps and two shared packages:

```
apps/api          → Express REST API (port 3001)
apps/web          → Next.js 14 — Admin + Customer Dashboard (port 3000)
apps/public-site  → Next.js 14 — Public profile pages (port 3002)
packages/database → Prisma client + schema (shared by api only)
packages/types    → TypeScript types shared across all apps
```

### API (`apps/api`)

- **Auth:** JWT access tokens (15 min) + refresh tokens (7 days stored in PostgreSQL `RefreshToken` table). Tokens issued via `src/utils/jwt.ts`, validated in `src/middleware/auth.ts`.
- **Route structure:** Three protected route groups — `/admin/*` (SUPER_ADMIN | SUPPORT roles), `/customer/*` (CUSTOMER role), `/p/*` (public, no auth).
- **Analytics tracking:** `POST /p/:slug/event` records `AnalyticsEvent` rows. IPs are SHA-256 hashed before storage (KVKK compliance).
- **QR generation:** `src/utils/qrcode.ts` wraps the `qrcode` npm package; produces PNG buffers or SVG strings.
- **vCard:** `src/utils/vcard.ts` generates `.vcf` content server-side; served as a file download at `GET /p/:slug/vcard`.
- **Error handling:** All route handlers use `try/catch → next(err)`. `AppError` class carries `statusCode` and optional field-level `errors`. `src/middleware/errorHandler.ts` is the Express error handler.

### Dashboard (`apps/web`)

- **Auth state:** Access/refresh tokens stored in cookies via `js-cookie`; user info in `localStorage`. `lib/auth.ts` manages read/write. `lib/api.ts` (axios instance) auto-refreshes on 401 and redirects to `/login` on failure.
- **Role routing:** `app/page.tsx` reads the stored user role and redirects — CUSTOMER → `/dashboard`, admin roles → `/admin/dashboard`.
- **First-login flow:** If `user.passwordChanged === false` after login, redirect to `/change-password` before entering the app.
- **Shared sidebar:** `components/Sidebar.tsx` renders different nav items based on role (admin nav vs customer nav).

### Public Site (`apps/public-site`)

- Profile pages at `/u/[slug]` are server-rendered via `generateMetadata` + async page component fetching from the API.
- `ProfileView` is a client component that fires a `PAGE_VIEW` analytic event on mount via `useEffect` and tracks button clicks inline.
- The `source` query param (e.g. `?source=qr`) is passed through to the analytics event.

## Key Data Model Facts

- A `User` always has exactly one `Profile` (created automatically on user creation by the admin endpoint).
- `Profile.slug` equals `User.username` by default; it's the public URL identifier.
- `Profile.isPublished = false` means the public page returns 404.
- Analytics queries use raw SQL (`prisma.$queryRaw`) only for the daily grouping query; everything else uses the Prisma query builder.
- Package limits (maxPages, analyticsRetentionDays, etc.) are stored in the `Package` model — enforcement is the responsibility of API routes (not yet fully implemented in Faz 1).

## Environment Variables

Root `.env` is read by `apps/api`. Each Next.js app has its own `.env.local`:

| App | Key variables |
|-----|--------------|
| `apps/api` | `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, `PUBLIC_SITE_URL`, `FRONTEND_URL` |
| `apps/web` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PUBLIC_SITE_URL` |
| `apps/public-site` | `API_URL` (server-side fetch), `NEXT_PUBLIC_API_URL` (client-side tracking) |

Copy the `.env.example` / `.env.local.example` files in each app to get started.
