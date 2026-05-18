---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
---

# External Integrations

**Analysis Date:** 2026-05-18

## APIs & External Services

**Book content API (first-party backend):**
- Express server in `server/` — serves CMS data (site content, blogs, events, community)
  - Client: native `fetch` wrapper in `src/lib/api.ts`
  - Base URL: `import.meta.env.VITE_API_URL` or prod default `https://api.superhumanly-thoughts.com/book/api/v1`, dev `http://localhost:3001/api/v1`
  - Auth: `Authorization: Bearer <JWT>` on admin routes after `POST /api/v1/auth/login`
  - Public: `GET /api/v1/content`; admin: `/api/v1/admin/*` (`server/src/routes/contentRoutes.ts`, `adminRoutes.ts`, `authRoutes.ts`)

**Marketing Agent Hub:**
- Telemetry webhook and email-agent API (Superhumanly marketing stack)
  - Client: `MarketingService` in `src/lib/marketing.ts`; contact form in `src/components/ContactSupportModal.tsx`
  - Webhook URL: `VITE_MARKETING_HUB_URL` (`.env.example`: `http://localhost:8000/webhook`; prod fallback `https://api.superhumanly-thoughts.com/marketing/webhook`)
  - Auth: `X-API-KEY` header from `VITE_MARKETING_MASTER_KEY` (`.env.example`: `vellux_studio_2026_pk`)
  - Events: `POST` JSON payloads (`type`, `actor`, `visitor_id`, `content`) with exponential retry (3 attempts)
  - Email: `POST {MARKETING_BASE}/email-agent/process` (base URL = webhook URL with `/webhook` stripped)

**Map tile CDN:**
- CARTO / OpenStreetMap raster tiles — events map basemap
  - Client: `react-leaflet` `TileLayer` in `src/components/events/EventsMap.tsx`
  - URL: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png`
  - No API keys; attribution rendered in map UI

**Google Fonts:**
- Web fonts loaded from CDN in `src/index.css` (`Instrument Serif`, `Plus Jakarta Sans`, `JetBrains Mono`)
  - No env vars; browser fetches `fonts.googleapis.com` at runtime

**Payment / email SaaS:**
- None — no Stripe, SendGrid, or transactional email SDK in dependencies

## Data Storage

**Databases:**
- SQLite (local file) — primary persistence via Prisma
  - Schema: `server/prisma/schema.prisma` (`provider = "sqlite"`, `url = "file:./dev.db"`)
  - Client: `@prisma/client` in `server/src/lib/prisma.ts`
  - Models: `Admin`, `SiteContent`, `Article`, `Event`, `CommunityPost`, `Comment`
  - Migrations: `npm run prisma:migrate` in `server/`; seed via `server/src/seed.ts`

**File Storage:**
- None — thumbnails and avatars stored as string URLs in DB JSON/text fields, not S3/Supabase

**Caching:**
- None — no Redis or in-memory cache layer; each request hits Prisma/SQLite

## Authentication & Identity

**Auth provider:**
- Custom JWT auth on Express — not Auth0/Supabase/OAuth
  - Login: `POST /api/v1/auth/login` with `{ password }` (`server/src/routes/authRoutes.ts`)
  - Password verified with `bcrypt` against `Admin` row (`username: 'admin'`)
  - Token: `jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })`
  - Secret: `JWT_SECRET` env var (`.env.example`); fallback `'supersecret'` in code if unset
  - Admin middleware: `authenticateAdmin` in `server/src/routes/adminRoutes.ts` validates Bearer token

**Frontend session:**
- JWT stored client-side after login (admin UI in `src/pages/AdminPage.tsx` / `src/lib/api.ts`)
- Legacy/config password hints in `src/lib/config.ts` (`VITE_ADMIN_PASSWORD`) — separate from server bcrypt flow
- Marketing identity: `localStorage` keys `vellux_lead_email`, `vellux_visitor_id` (`src/lib/marketing.ts`)

**OAuth integrations:**
- None

## Monitoring & Observability

**Error tracking:**
- None — no Sentry, Datadog, or similar SDK

**Analytics:**
- Marketing Hub webhook only — scroll milestones, outbound clicks, CTA events via `MarketingService` (`src/lib/marketing.ts`, initialized from `src/App.tsx`)

**Logs:**
- stdout only — `console.log` / `console.error` in server and marketing client; no structured log shipping configured

## CI/CD & Deployment

**Hosting:**
- Production hostnames referenced in code/config, not defined in repo:
  - Site: `monograph.superhumanly.ai` (`index.html` meta/OG tags)
  - API: `api.superhumanly-thoughts.com` (`src/lib/api.ts`, `src/lib/marketing.ts`)
  - CORS default includes `https://superhumanly-thoughts.com` (`server/src/index.ts`)
- No `vercel.json`, Dockerfile, or platform config files found

**CI pipeline:**
- None — no `.github/workflows/` in repository

## Environment Configuration

**Development:**
- Copy `.env.example` → `.env` (root) for Vite vars; configure `server/.env` separately for `PORT`, `ALLOWED_ORIGINS`, `JWT_SECRET`
- Required client vars (from `.env.example`): `VITE_MARKETING_HUB_URL`, `VITE_MARKETING_MASTER_KEY`
- Optional client: `VITE_API_URL`, `VITE_ADMIN_PASSWORD` (`src/lib/config.ts`)
- Server: `PORT` (3001), `ALLOWED_ORIGINS` (Vite origins), `JWT_SECRET`
- Local marketing hub expected at `http://localhost:8000` per `.env.example`

**Staging:**
- Not documented in repo — would use alternate `VITE_API_URL` / marketing URLs via env only

**Production:**
- Secrets: env vars on host (not committed); marketing key and JWT must not use `.env.example` placeholders
- Database: SQLite `dev.db` path relative to Prisma schema — production needs persistent volume or migration to hosted SQL if scaling

## Webhooks & Callbacks

**Incoming:**
- None on this codebase — Express does not expose Stripe or third-party webhook endpoints

**Outgoing:**
- Marketing Hub — `POST` to `VITE_MARKETING_HUB_URL` on user events (`src/lib/marketing.ts`)
- Marketing email agent — `POST .../email-agent/process` from `src/components/ContactSupportModal.tsx`
- Book API — all CRUD from `src/lib/api.ts` to local or deployed Express instance

---

*Integration audit: 2026-05-18*
*Update when adding/removing external services*
