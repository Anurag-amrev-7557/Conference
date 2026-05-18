---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
---

# Architecture

**Analysis Date:** 2026-05-18

## Pattern Overview

**Overall:** Full-stack monorepo — React/Vite SPA (public marketing site + embedded admin CMS) with a separate Express REST API and SQLite/Prisma persistence.

**Key Characteristics:**
- Single unified content payload (`GET /api/v1/content`) hydrates the entire public site on load
- JSON blobs in `SiteContent` for flexible CMS fields (hero, settings, appearance, stats, pillars, perks)
- Admin surface is client-side gated (JWT in `localStorage`) with server-side `Bearer` middleware on mutating routes
- Third-party marketing telemetry via `MarketingService` (external webhook, not the book API)

## Layers

**Presentation (SPA):**
- Purpose: Routes, pages, section components, admin UI, theme/runtime CSS injection
- Contains: `src/pages/*`, `src/components/**`, `src/App.tsx`
- Depends on: `WebsiteDataProvider`, `api`, `websiteData` types, `config`, `marketing`
- Used by: Browser via `src/main.tsx`

**Client data / state:**
- Purpose: Fetch, merge, preview, and persist site content; expose mutations to admin managers
- Contains: `src/components/WebsiteDataProvider.tsx`, `src/lib/websiteData.ts`, `src/lib/api.ts`
- Depends on: REST API (`VITE_API_URL` or prod default)
- Used by: All pages and admin components via `useWebsiteData()`

**API gateway (Express):**
- Purpose: HTTP server, CORS, security headers, route mounting
- Contains: `server/src/index.ts`
- Depends on: Route modules, `dotenv`, `helmet`, `cors`
- Used by: Frontend `fetch`, health checks

**Route / controller layer:**
- Purpose: Map HTTP verbs to Prisma operations; auth on admin namespace
- Contains: `server/src/routes/contentRoutes.ts`, `authRoutes.ts`, `adminRoutes.ts`
- Depends on: `server/src/lib/prisma.ts`, JWT/bcrypt
- Used by: `server/src/index.ts` at `/api/v1/content`, `/api/v1/auth`, `/api/v1/admin`

**Persistence:**
- Purpose: SQLite storage via Prisma; seed bootstrap
- Contains: `server/prisma/schema.prisma`, `server/src/seed.ts`
- Depends on: Prisma Client
- Used by: All route handlers

## Data Flow

**Public page load:**

1. `src/main.tsx` mounts `App` inside `StrictMode`
2. `WebsiteDataProvider` calls `api.getContent()` → `GET /api/v1/content`
3. `contentRoutes` loads `SiteContent` (id `global`), `Article`, `Event`, `CommunityPost` (+ comments) in parallel
4. JSON string fields parsed (`hero`, `settings`, `appearance`, event `tags`, etc.); response merged with `initialData` in provider
5. `ThemeSynchronizer` in `App.tsx` applies `appearance` / `settings` to CSS variables, meta tags, custom CSS
6. React Router renders page components reading `useWebsiteData().data`

**Admin mutation:**

1. User visits `/admin/*`; `AdminPage` shows login unless `adminToken` in `localStorage`
2. `api.login(password)` → `POST /api/v1/auth/login` → bcrypt check against `Admin` row → JWT (24h)
3. Admin managers call context methods (`updateAppearance`, `createArticle`, etc.)
4. Provider reads token, calls `api.updateGlobalContent` / CRUD helpers with `Authorization: Bearer <token>`
5. `adminRoutes` runs `authenticateAdmin` middleware (`jwt.verify`) then Prisma write
6. Provider `fetchContent()` refreshes unified payload

**Marketing telemetry (parallel):**

1. `MarketingTracker` in `App.tsx` calls `MarketingService.init()` and logs `page_view` on route changes
2. Events POST to `VITE_MARKETING_HUB_URL` (default external marketing webhook), independent of book API

**State Management:**
- Server: authoritative state in SQLite (`dev.db` via Prisma)
- Client: React context holds merged site data; admin preview overlays via `previewData` + `localStorage` flags
- Auth token: `localStorage.adminToken`; session flag `config.admin.sessionKey`
- Fallback: if content fetch fails, provider uses `initialData` from `websiteData.ts`

## Key Abstractions

**WebsiteData:**
- Purpose: Typed shape for all CMS-driven site content (hero, articles, events, community, settings, appearance)
- Examples: `src/lib/websiteData.ts` (`initialData`, interfaces)
- Pattern: Default seed + deep merge with API response

**api client:**
- Purpose: Thin `fetch` wrapper for public, auth, and admin endpoints
- Examples: `src/lib/api.ts`
- Pattern: Module singleton; base URL from `import.meta.env.VITE_API_URL` or environment-specific defaults

**SiteContent JSON columns:**
- Purpose: Schema-flexible CMS blocks without relational migrations per field
- Examples: `hero`, `settings`, `appearance`, `stats`, `pillars`, `perks` on `SiteContent` model
- Pattern: `JSON.stringify` on write, `safeParse` on read in `contentRoutes.ts`

**Admin route guard:**
- Purpose: Protect all `/api/v1/admin/*` handlers
- Examples: `authenticateAdmin` in `server/src/routes/adminRoutes.ts`
- Pattern: JWT Bearer middleware applied via `router.use(authenticateAdmin)`

## Entry Points

**Frontend bootstrap:**
- Location: `src/main.tsx` → `src/App.tsx`
- Triggers: Browser load of Vite-built `index.html`
- Responsibilities: React root, router, global provider, marketing tracker, theme sync

**Express server:**
- Location: `server/src/index.ts`
- Triggers: `npm run dev` / `npm start` in `server/` (port `PORT` or 3001)
- Responsibilities: Middleware stack, mount `/api/v1/*`, `/health`

**Database seed:**
- Location: `server/src/seed.ts`
- Triggers: `npm run seed` (Prisma seed config)
- Responsibilities: Upsert `admin` user, populate `SiteContent` and sample entities

## Public vs Admin Surfaces

| Surface | Routes | Auth | Data access |
|--------|--------|------|-------------|
| Public | `/`, `/events`, `/community`, `/blog`, `/blog/:slug` | None | Read via unified content fetch |
| Admin CMS | `/admin/dashboard`, `pages`, `design`, `blogs`, `events`, `settings` | Password → JWT | Mutations through `WebsiteDataProvider` + admin API |
| Placeholder | `/dashboard` | None | Static mock CRM UI (`DashboardPage.tsx`), no API |

Admin UI lives under `src/components/admin/*` and nested routes in `src/pages/AdminPage.tsx`. Public landing composes section components from `src/components/sections/*`.

**Note:** `src/lib/api.ts` defines `createPost` / `addComment` targeting `/admin/posts`, but `adminRoutes.ts` currently implements content, blogs, and events only — community write paths are not yet wired on the server.

## Error Handling

**Strategy:** Try/catch in route handlers → `500` JSON `{ error }`; client throws `Error` on non-OK `fetch` responses.

**Patterns:**
- Content fetch failure: log + fall back to `initialData` in `WebsiteDataProvider`
- Auth failure: `401` with message; `AdminPage` displays error string
- Admin mutations: console error + rethrow from provider methods
- CORS rejection: callback error from origin allowlist in `server/src/index.ts`

## Cross-Cutting Concerns

**Authentication:**
- Single admin user (`username: 'admin'`) in `Admin` model; password-only login (no username field in UI)
- JWT signed with `JWT_SECRET` (default `supersecret` if unset)

**Validation:**
- Minimal server-side validation; request bodies passed largely straight to Prisma
- Client relies on TypeScript interfaces in `websiteData.ts`

**Security:**
- `helmet()` on API; CORS allowlist via `ALLOWED_ORIGINS`
- Admin routes require valid Bearer token

**Theming / SEO:**
- Runtime CSS variables and injected `<style id="custom-css-runtime">` from `ThemeSynchronizer`
- Document title and meta description from `settings.seo`

---

*Architecture analysis: 2026-05-18*
*Update when major patterns change*
