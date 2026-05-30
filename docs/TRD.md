# Technical Requirements Document (TRD)

## Superhumanly Monograph — Book & Summit Marketing Platform

**Version:** 1.0  
**Last updated:** 2026-05-30  
**PRD reference:** [`docs/PRD.md`](./PRD.md) (approved baseline)  
**Repository:** `book website-frontend`

This document describes **how** to build and operate what [`docs/PRD.md`](./PRD.md) defines. It reflects the **current brownfield implementation** and calls out PRD items that are ambiguous, deferred, or risky.

---

## PRD → TRD traceability & flags

| PRD requirement | TRD status | Notes |
|-----------------|------------|--------|
| Summit registration + CRM | **Implemented** | `POST /content/conference-registration`; admin CRUD under `/admin/registrations` |
| Payments for tickets | **Not implemented** | `ticketPriceCents` stored; `status: pending` only — see § Technical risks |
| Public user auth | **Out of scope** | No visitor accounts |
| Community `/community` | **Schema only** | Prisma models exist; **no public route or API** in current `App.tsx` / routes |
| `/dashboard` live metrics | **Mock UI** | Static React page; no backend |
| Marketing lead intelligence | **Optional proxy** | Works when `MARKETING_API_KEY` set; 503 otherwise |
| Email confirmations on register | **Not implemented** | No Resend/SendGrid in repo |
| Full dark-mode system (v1.2) | **Partial** | CMS appearance + runtime CSS vars; not full DSM-01 bake in prerender |

---

## SYSTEM ARCHITECTURE

| Layer | Choice | Notes |
|-------|--------|--------|
| **Frontend framework** | React 19 + Vite 8 + TypeScript | SPA with `react-router-dom` v7; **not** Next.js |
| **Backend/API** | Express 4 (`server/`) | REST under `/api/v1`; monolith API in same repo |
| **Database** | SQLite via Prisma 5 | File DB (`server/prisma/dev.db` dev); `DATABASE_URL` in production |
| **Auth provider** | Custom (bcrypt + JWT) | Single `Admin` row (`username: admin`); no Clerk/Supabase Auth |
| **Hosting/CDN** | Docker Compose: Nginx + static Vite `dist/` + API | Alt: Vercel frontend (`vercel-build` skips prerender) + Render/similar for API |
| **File storage** | Local filesystem | `UPLOAD_ROOT` → `/media/*` and `/og/*` served by Express |
| **Email** | None (v1) | Registration stored only; optional future via marketing-backend |
| **Architecture style** | **Monorepo modular monolith** | JAMstack-like static shell + API; prerender post-build (Puppeteer) |

### Request flow (production)

```text
Browser
  → Nginx (TLS, / → dist/, /api/v1 → server:3001)
  → Express API (Prisma → SQLite, static /media /og)
  → (optional) marketing-backend via server-side proxy

Build pipeline:
  vite build → dist/
  → prerender.mjs (Puppeteer + API prerender-paths) → static HTML per route
```

### Frontend routes (React)

| Path | Component | Auth |
|------|-----------|------|
| `/` | `ConferencePage` + `Navbar` | Public |
| `/home` | `LandingPage` + `Navbar` | Public |
| `/register` | `ConferenceRegisterPage` | Public |
| `/blog`, `/blog/:slug` | `BlogPage`, `BlogPostPage` | Public |
| `/events`, `/events/:id` | `EventsPage`, `EventDetailPage` | Public |
| `/admin/*` | `AdminPage` | Client JWT gate |
| `/dashboard` | `DashboardPage` (mock) | Public (should be noindex) |
| `/conference` | Redirect → `/` | — |
| `*` | `NotFoundPage` | Public |

Content hydration: `WebsiteDataProvider` loads site payload + articles + events (split or legacy `GET /content`).

---

## DATA MODELS

### Entity: Admin

| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | PK |
| username | String | unique |
| password | String | bcrypt hash |
| createdAt | DateTime | default now |

**Relationships:** None.

---

### Entity: SiteContent

Single row `id = "global"`. Large JSON columns (stringified in DB):

| Field | Type | Purpose |
|-------|------|---------|
| id | String | PK, default `"global"` |
| hero | String (JSON) | Book landing hero (`HeroContent`) |
| settings | String (JSON) | Navigation, SEO, conference, registration form, sections, book metadata, scripts |
| appearance | String (JSON) | Colors, typography, theme tokens |
| stats | String (JSON) | Stat[] |
| pillars | String (JSON) | Pillar[] |
| perks | String (JSON) | Perk[] |
| updatedAt | DateTime | |

**Key `settings` nested objects (application-level, not separate tables):**

- `settings.conference` — hero, speakers, agenda, sponsors, FAQ, `published` flag
- `settings.conferenceRegistration` — form copy, `ticketPriceCents`
- `settings.navigation`, `settings.footer`, `settings.seo`, `settings.routeSeo`
- `settings.catalogPages.blog` / `.events`
- `settings.sections.*`, `settings.visibility`, `settings.book`
- `settings.scripts.header` / `.footer`, `settings.customCss`

**Relationships:** None (1:1 with site).

---

### Entity: Article

| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | PK |
| slug | String | unique |
| title, category, time, excerpt, content | String | content HTML sanitized on read/write |
| thumbnail | String | URL |
| isPublished | Boolean | default true |
| authorName, authorRole, authorAvatar | String | |
| publishedAt | String | display sort key |
| seoTitle, seoDescription, ogImage | String? | |
| noindex | Boolean | default false |
| createdAt, updatedAt | DateTime | |

**Relationships:** None.

---

### Entity: Event

| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | PK |
| day, weekday, time, full_time, title, host, location | String | |
| tags | String | JSON array serialized |
| price, thumbnail, status | String | |
| isPublished | Boolean | |
| startDate, endDate | DateTime? | ISO in API responses |
| lat, lng | Float? | map |
| seoTitle, seoDescription, ogImage | String? | |
| noindex | Boolean | |
| createdAt, updatedAt | DateTime | |

**Relationships:** None.

---

### Entity: ConferenceRegistration

| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | PK |
| name, email, phone, linkedIn, designation | String | email lowercased on write |
| ticketPriceCents | Int | default 2000 |
| status | String | default `"pending"` |
| createdAt, updatedAt | DateTime | |

**Relationships:** None.

---

### Entity: CommunityPost, Comment, PostVote (latent)

Present in Prisma; **no active public/admin HTTP surface** in current route modules. If PRD community is revived:

- `CommunityPost` 1:N `Comment`
- `CommunityPost` 1:N `PostVote` (unique `[postId, visitorId]`)

---

## API ENDPOINTS / ROUTES

Base: `/api/v1` unless noted. Auth = Bearer JWT (`Authorization: Bearer <token>`) for admin routes.

### Health & SEO (root-mounted)

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/health` | API liveness | No |
| GET | `/sitemap.xml` | Dynamic sitemap from DB | No |
| GET | `/robots.txt` | Crawl rules; disallow admin/dashboard/community | No |
| GET | `/api/v1/seo/prerender-paths` | Path list for build-time prerender | No |

### Public content

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/content/site` | Hero, appearance, settings (incl. conference + registration settings) | No |
| GET | `/content/articles` | Paginated articles (`limit`, `offset`, `X-Total-Count`) | No |
| GET | `/content/events` | Paginated events | No |
| GET | `/content` | Legacy monolithic payload | No |
| POST | `/content/conference-registration` | Create registration (Zod validated) | No |

### Auth

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/auth/login` | Body: `{ password }` → `{ token, success }` | No (rate-limited: 5 / 15 min / IP) |

### Marketing proxy (optional)

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/marketing/events` | Proxy engagement events to marketing-backend | No (API key server-side) |
| POST | `/marketing/webhook` | Proxy webhook payload | No |
| POST | `/marketing/email-agent/process` | Proxy email-agent | No |

Returns **503** if `MARKETING_API_KEY` / `VELLUX_API_KEY` unset.

### Admin (all require JWT)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/me` | Session validation |
| PATCH | `/admin/content` | Merge-patch `SiteContent` (Zod + customCss validation) |
| POST | `/admin/og-image` | Upload → sharp 1200×630 JPEG → `/og/` |
| POST | `/admin/media-image` | Upload → `/media/` (max 1920px) |
| GET | `/admin/media` | List media library |
| DELETE | `/admin/media/:filename` | Delete media file |
| POST | `/admin/blogs` | Create article |
| PUT | `/admin/blogs/:id` | Update article |
| DELETE | `/admin/blogs/:id` | Delete article |
| POST | `/admin/events` | Create event |
| PUT | `/admin/events/:id` | Update event |
| DELETE | `/admin/events/:id` | Delete event |
| GET | `/admin/registrations` | List registrations |
| GET | `/admin/registrations/:id` | Get one |
| POST | `/admin/registrations` | Manual create |
| PUT | `/admin/registrations/:id` | Update status/fields |
| DELETE | `/admin/registrations/:id` | Delete |

### Static asset routes (Express, not under `/api/v1`)

| Path | Purpose |
|------|---------|
| GET `/media/:file` | Uploaded images |
| GET `/og/:file` | OG images |

---

## AUTHENTICATION FLOW

| Topic | Implementation |
|-------|----------------|
| **Sign up** | None — admin created via `npm run seed` in `server/` |
| **Login** | `POST /auth/login` with admin password; bcrypt compare against `Admin.password` |
| **Session** | JWT (`role: admin`, **24h** expiry); stored in `localStorage` as `adminToken` |
| **Protected routes** | **Admin UI only** (`/admin/*`) — client checks token + `GET /admin/me` |
| **Role-based access** | **No** — single admin role in JWT payload |
| **Password reset** | **No** — rotate via DB/seed/runbook |
| **Email verification** | **No** |

**Security requirements:**

- Never use `VITE_ADMIN_PASSWORD` or expose secrets in frontend bundle.
- Production: `JWT_SECRET` ≥ 32 chars; change default seed password before go-live.

---

## THIRD-PARTY INTEGRATIONS

### Marketing backend (optional)

| Item | Detail |
|------|--------|
| **Purpose** | Page views, CTA clicks, form_submit, lead identity merge |
| **Keys** | `MARKETING_API_KEY` or `VELLUX_API_KEY`; `MARKETING_BACKEND_URL` (default `http://localhost:8000`) |
| **Implementation** | Browser → `MarketingService` → `POST /api/v1/marketing/events` → server proxy with `X-API-Key` |
| **Contract** | Actions must match `marketing-backend/docs/EVENT_CONTRACT.md` |

### Google Search Console

| Item | Detail |
|------|--------|
| **Purpose** | Site verification meta tag |
| **Keys** | None — value from CMS `settings.seo.googleSiteVerification` |
| **Implementation** | Injected via `SeoHead` / prerendered HTML |

### web-vitals

| Item | Detail |
|------|--------|
| **Purpose** | RUM (LCP, INP, CLS) |
| **Keys** | None |
| **Implementation** | `initWebVitalsReporting()` in `App.tsx` |

### Stripe / email (PRD future)

| Item | Detail |
|------|--------|
| **Purpose** | Ticket payment; transactional email |
| **Status** | **Not integrated** — design when PRD payments scope opens |

### Leaflet / OpenStreetMap

| Item | Detail |
|------|--------|
| **Purpose** | Events map |
| **Keys** | None (tile provider as configured in component) |
| **Implementation** | `react-leaflet` on events pages |

---

## ENVIRONMENT VARIABLES

### Root / Docker Compose

| Variable | Required | Purpose |
|----------|----------|---------|
| `SITE_URL` | **Yes** (prod) | Canonical origin: sitemap, OG, canonical, JSON-LD |
| `JWT_SECRET` | **Yes** (prod) | Admin JWT signing |
| `ALLOWED_ORIGINS` | **Yes** (prod) | CORS for public API |
| `ADMIN_ALLOWED_ORIGINS` | **Yes** (prod) | CORS for admin uploads from editor origin |
| `MARKETING_API_KEY` | No | Enable marketing proxy |
| `MARKETING_BACKEND_URL` | No | Upstream marketing API |
| `MARKETING_BACKEND_IMAGE` | No | Compose only if bundling marketing service |

### Server (`server/`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No | Default `3001` |
| `NODE_ENV` | No | `production` enables strict SITE_URL/JWT checks |
| `DATABASE_URL` | Prod | SQLite path (e.g. `file:/app/prisma/prod.db`) |
| `UPLOAD_ROOT` | No | Override media/og directory |
| `API_PUBLIC_URL` | Prod* | Absolute URLs in upload responses (*if API on different host) |
| `PRERENDER_SKIP` | No | `1` = skip prerender in Docker build |
| `VELLUX_API_KEY` | No | Alias for marketing API key |

### Frontend (build-time)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | Prod* | API base, e.g. `https://monograph.superhumanly.ai/api/v1` |

### Prerender script

| Variable | Purpose |
|----------|---------|
| `PRERENDER_API_URL` | API for `/seo/prerender-paths` (default `http://localhost:3001`) |
| `PRERENDER_PREVIEW_PORT` | Vite preview port (default `4173`) |
| `PRERENDER_SKIP` | `1` = no-op |

---

## FRONTEND COMPONENT STRUCTURE

| Concern | Choice |
|---------|--------|
| **Component library** | Radix primitives (`@radix-ui/react-dialog`, slot) + custom UI (`Button`, `Card`) + CVA |
| **State management** | React Context (`WebsiteDataProvider`, `ConferenceRevealContext`) + local state; no Zustand |
| **Form handling** | Controlled inputs + native submit; Zod validation on **server** |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) + large `index.css` design tokens |
| **SEO** | `react-helmet-async` (`SeoHead`, `JsonLd`) |
| **Animation** | Framer Motion, GSAP (lazy below fold where used) |
| **Icons** | `lucide-react` |

### Key reusable components

| Component | Role |
|-----------|------|
| `Navbar` | Global nav, dark-on-hero, mobile menu |
| `Footer` | CMS links + social |
| `ConferenceHero`, `ConferenceSpeakers`, `ConferenceAgenda`, … | Summit page sections |
| `HeroSection`, `BookShowcase`, `WhoWeAreSection`, … | Book landing |
| `BookDemoForm`, `BookDemoPanel` | `/register` |
| `LeadCaptureModal` | Playbook waitlist on `/home` |
| `SeoHead`, `JsonLd`, `usePageSeo` | Per-route meta |
| `admin/*` | `AdminLayout`, `ConferenceManager`, `BlogManager`, `EventManager`, `MediaManager`, `DesignSystemManager`, `SettingsManager`, `RegistrationManager` |
| `InjectedScripts` | CMS header/footer scripts |

### Directory layout

```text
src/
  pages/           # Route-level pages
  components/
    sections/      # Marketing sections
    admin/           # CMS UI
    ui/              # Primitives
  lib/               # api.ts, marketing.ts, websiteData.ts
  seo/               # Hooks + head helpers
  hooks/
server/
  src/routes/        # Express routers
  src/schemas/       # Zod
  prisma/schema.prisma
scripts/prerender.mjs
docs/deployment.md
```

---

## PERFORMANCE & SECURITY

| Topic | Approach |
|-------|----------|
| **Image optimization** | sharp on upload; responsive CSS; lazy `BookShowcase`; dimensions/aspect-ratio on heroes where implemented |
| **Caching** | `sitemap.xml` / `robots.txt`: `Cache-Control: public, max-age=3600`; static `/media`, `/og`: 7d in prod |
| **Prerender** | Post-build Puppeteer snapshots per `listIndexablePaths()`; community excluded |
| **Rate limiting** | `POST /auth/login`: 5 requests / 15 min / IP |
| **Input validation** | Zod (`validateBody`) on registration, content patch, articles, events |
| **HTML sanitization** | `sanitizeArticleHtml` (isomorphic-dompurify) on article bodies |
| **Custom CSS** | `validateCustomCss` on admin settings patch |
| **CORS** | Restricted in production to `ALLOWED_ORIGINS` + `ADMIN_ALLOWED_ORIGINS` (+ SITE_URL) |
| **Helmet CSP** | `style-src 'unsafe-inline'` for Tailwind + runtime custom CSS |
| **Encryption** | HTTPS in production; SQLite file at rest on host volume (no app-level field encryption) |
| **Upload limits** | 5MB per image; MIME allowlist JPEG/PNG/WebP |

---

## ERROR HANDLING & LOGGING

| Topic | Approach |
|-------|----------|
| **Error monitoring** | None wired (Sentry optional future) |
| **Logging** | `console.error` on server catch blocks; no structured log aggregator |
| **User-facing errors** | JSON `{ error: string }` from API; forms show inline message (e.g. registration validation) |
| **Marketing proxy** | 502 upstream unreachable; 503 if not configured |
| **Admin** | 401 with message; login form displays server error |

---

## TESTING PLAN

| Layer | Tool | Status |
|-------|------|--------|
| **Unit** | Vitest (root + `server/`) | Yes — routes, SEO, registration, sanitization |
| **E2E** | Playwright (`e2e:smoke`), Puppeteer (prerender) | Smoke scripts present |
| **Production smoke** | `npm run smoke:production` | Documented in runbook |

### Manual QA checklist (pre-launch)

1. `/` conference hero, CTA → `/register`, unpublished conference → 404  
2. `/register` submit → row in Admin → Registrations; success UI  
3. `/home` lead modal / CTAs; book section visibility toggles  
4. `/blog` + published `/blog/:slug`; draft/unpublished not linked in sitemap  
5. `/events` map + `/events/:id`  
6. Admin login, edit conference hero, PATCH content, refresh public site  
7. Upload media + OG image; URLs load on public origin  
8. View Source on `/` and blog post: title, canonical, OG  
9. `GET /sitemap.xml`, `/robots.txt`  
10. Mobile 375px: nav, register form, no horizontal scroll  
11. Rotate off seed admin password; verify JWT invalidation after secret change  

### Browser targets

- Chrome (latest 2 versions) — primary  
- Safari (latest macOS + iOS) — required  
- Firefox (latest) — smoke  
- Edge (Chromium) — optional parity with Chrome  

---

## DEPLOYMENT & CI/CD

| Topic | Implementation |
|-------|----------------|
| **Method** | `docker compose` per `docs/deployment.md` (Nginx + frontend + server + sqlite volume) |
| **Environments** | Dev (Vite :5173 + API :3001); production (single domain preferred) |
| **Domain** | `monograph.superhumanly.ai` (referenced in tests/docs) |
| **Preview deployments** | Vercel possible with `vercel-build` (no prerender); full SEO needs API + prerender job |
| **DB migrations** | `prisma migrate` + `npm run seed` on first deploy |
| **Post-publish** | Re-run `npm run prerender` after content/SEO publish when using static prerender |

### Build commands

```bash
# Full production static + prerender (API must be up + seeded)
npm run build

# Frontend only (e.g. Vercel)
npm run build:no-prerender

# Server
cd server && npm run build && npm start
```

---

## TECHNICAL RISKS

| Risk | Severity | Mitigation |
|------|----------|------------|
| **SQLite on single host** | Medium | Accept for v1 traffic; plan Postgres if multi-instance or HA required |
| **Prerender drift** | Medium | Content/SEO changes need prerender re-run; Docker uses `PRERENDER_SKIP=1` then CI prerender |
| **JSON blob `SiteContent`** | Medium | No relational integrity for nested conference/settings; validate in Zod + admin UX; consider splitting only if merge conflicts hurt editors |
| **Payments without gateway** | High (product) | PRD promises tickets — implement Stripe Checkout + webhook before selling paid tickets |
| **No registration email** | Medium | Users expect confirmation; add Resend/SendGrid or marketing-backend trigger |
| **Community schema without API** | Low | Dead code confusion — remove models or implement routes + moderation before PRD promises community |
| **`/dashboard` mock** | Low | Misleading if linked publicly; keep noindex; wire to marketing-backend or remove |
| **Marketing proxy optional** | Medium | Telemetry silently 503 if key missing — monitor in prod |
| **JWT in localStorage** | Medium | XSS would expose admin token; keep CSP strict; no user-generated script without sanitization review |
| **Custom CSS + injected scripts** | High | Admin can inject header/footer HTML — trust model is **admin-only**; audit script injection policy |
| **CSP `unsafe-inline` styles** | Low | Required for Tailwind/runtime theme until extracted CSS pipeline exists |
| **Conference at `/` vs `/home`** | Low | SEO/canonical discipline — ensure sitemap and nav reflect product choice |
| **v1.2 dark mode / prerender theme** | Medium | SEO-07 partial — crawlers may not see full `:root` tokens without JS (INFRA-01 deferred) |
| **File upload on ephemeral disks** | Medium | Render/serverless without persistent volume loses media — use mounted `UPLOAD_ROOT` or S3 future |

---

## IMPLEMENTATION NOTES FOR BUILDERS (Lovable/Bolt)

If regenerating UI against this TRD:

1. **Keep API contract** — do not invent Supabase tables; map UI to `SiteContent` PATCH and existing REST paths.  
2. **Registration** must call `POST /api/v1/content/conference-registration`, not a generic form backend.  
3. **Admin** is password + JWT, not OAuth.  
4. **Prerender/SEO** require Node build step — pure static export without API loses dynamic sitemap and CMS.  
5. Treat **PRD appendix** shipped vs deferred table as the scope boundary for v1 launch.

---

*TRD derived from `docs/PRD.md` and codebase as of 2026-05-30. Update this document when payment, community, or marketing integration ships.*
