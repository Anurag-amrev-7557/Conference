---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
---

# Codebase Structure

**Analysis Date:** 2026-05-18

## Directory Layout

```
book website-frontend/
├── src/                    # React/Vite SPA (public + admin UI)
│   ├── main.tsx            # React DOM entry
│   ├── App.tsx             # Router, providers, theme sync
│   ├── pages/              # Route-level page components
│   ├── components/         # UI, sections, admin, events, community
│   └── lib/                # API client, types, config, marketing
├── server/                 # Express API + Prisma
│   ├── src/                # TypeScript source
│   │   ├── index.ts        # Server bootstrap
│   │   ├── routes/         # content, auth, admin routers
│   │   ├── lib/prisma.ts   # Prisma singleton
│   │   └── seed.ts         # DB seed script
│   └── prisma/             # schema + migrations + dev.db
├── public/                 # Static assets (textures, icons)
├── dist/                   # Vite production build output
├── .planning/codebase/     # GSD mapping artifacts (this doc)
├── index.html              # Vite HTML shell
├── vite.config.ts          # Vite + React + Tailwind plugins
├── package.json            # Frontend scripts/deps
└── .env.example            # Env var template (VITE_*)
```

## Directory Purposes

**`src/`:**
- Purpose: Entire client application
- Contains: `.tsx` pages/components, `.ts` lib modules, `index.css`
- Key files: `main.tsx`, `App.tsx`, `lib/api.ts`, `lib/websiteData.ts`
- Subdirectories:
  - `pages/` — one file per route (`LandingPage`, `AdminPage`, `BlogPage`, etc.)
  - `components/sections/` — landing page blocks (Hero, Blog, Events, …)
  - `components/admin/` — CMS managers (BlogManager, PageEditor, DesignSystemManager, …)
  - `components/ui/` — shared primitives (Button, Card, SplashScreen, …)
  - `components/events/`, `community/`, `landing/` — feature-specific UI
  - `lib/` — API, config, marketing, utils

**`server/src/`:**
- Purpose: REST API implementation
- Contains: Express app, route modules, Prisma client, seed
- Key files: `index.ts`, `routes/contentRoutes.ts`, `routes/authRoutes.ts`, `routes/adminRoutes.ts`
- Subdirectories: `routes/`, `lib/`

**`server/prisma/`:**
- Purpose: Database schema and migrations
- Contains: `schema.prisma`, `migrations/`, SQLite `dev.db`
- Key files: `schema.prisma` (models: Admin, SiteContent, Article, Event, CommunityPost, Comment)

**`public/`:**
- Purpose: Assets served as-is by Vite
- Contains: `textures/`, `assets/`, favicon, robots, sitemap

**`dist/`:**
- Purpose: Frontend build artifacts (`npm run build`)
- Committed: Typically no (build output)

**`server/dist/`:**
- Purpose: Compiled server JS (`npm run build` in `server/`)
- Committed: May exist locally from builds

## Key File Locations

**Entry Points:**
- `src/main.tsx` — React SPA bootstrap
- `src/App.tsx` — React Router routes and global wrappers
- `server/src/index.ts` — Express listen on port 3001 (default)
- `index.html` — Vite entry HTML

**Configuration:**
- `vite.config.ts` — Vite plugins (React, Tailwind v4)
- `package.json` — Frontend: `dev`, `build`, `lint`, `preview`
- `server/package.json` — API: `dev`, `build`, `start`, Prisma scripts
- `.env.example` — Documents `VITE_API_URL`, marketing keys, etc.
- `server/.env` (local, not committed) — `JWT_SECRET`, `PORT`, `ALLOWED_ORIGINS`

**Core Logic:**
- `src/lib/api.ts` — HTTP client for `/content`, `/auth/login`, `/admin/*`
- `src/components/WebsiteDataProvider.tsx` — Central client state + mutations
- `src/lib/websiteData.ts` — Types, `initialData`, icon maps
- `server/src/routes/contentRoutes.ts` — Public unified GET
- `server/src/routes/adminRoutes.ts` — Protected PATCH/CRUD
- `server/prisma/schema.prisma` — Data model

**Admin vs public routing:**
- Public routes: defined in `src/App.tsx` (`/`, `/events`, `/community`, `/blog`, …)
- Admin routes: nested in `src/pages/AdminPage.tsx` under `/admin/*`

**Testing:**
- No dedicated `tests/` directory observed in repo root

**Documentation / planning:**
- `.planning/codebase/` — Architecture/structure maps (GSD)

## Naming Conventions

**Files:**
- React pages: `PascalCase` + `Page` suffix — `LandingPage.tsx`, `BlogPostPage.tsx`
- React components: `PascalCase.tsx` — `Navbar.tsx`, `BlogManager.tsx`
- Lib modules: `camelCase.ts` — `api.ts`, `websiteData.ts`, `marketing.ts`
- Server routes: `camelCase` + `Routes.ts` — `contentRoutes.ts`, `adminRoutes.ts`

**Directories:**
- Feature grouping under `components/` — `admin/`, `sections/`, `events/`, `community/`
- Server split: `routes/` for HTTP, `lib/` for shared server utilities

**Exports:**
- Pages often use named exports (`export function LandingPage`) or `export const AdminPage`
- Route modules default-export Express `Router` instances

## Where to Add New Code

**New public page:**
- Page component: `src/pages/NewPage.tsx`
- Route: add `<Route>` in `src/App.tsx`
- Optional nav link: `settings.navigation.links` (CMS) or `Navbar.tsx`

**New landing section:**
- Component: `src/components/sections/NewSection.tsx`
- Wire into: `src/pages/LandingPage.tsx`
- CMS fields: extend `websiteData.ts` types + `SiteContent` JSON + `contentRoutes` parse/serialize

**New admin manager:**
- Component: `src/components/admin/NewManager.tsx`
- Route: add nested `<Route>` in `src/pages/AdminPage.tsx`
- API: extend `src/lib/api.ts` and `server/src/routes/adminRoutes.ts` with JWT guard

**New API resource:**
- Prisma model: `server/prisma/schema.prisma` + migration
- Include in unified fetch: `server/src/routes/contentRoutes.ts`
- CRUD: `server/src/routes/adminRoutes.ts`
- Client types + provider methods: `websiteData.ts`, `WebsiteDataProvider.tsx`

**Shared UI primitive:**
- `src/components/ui/`
- Utilities: `src/lib/utils.ts` (`cn` helper pattern)

## Special Directories

**`server/prisma/migrations/`:**
- Purpose: Prisma migration history
- Source: `prisma migrate dev`
- Committed: Yes

**`node_modules/` (root and `server/`):**
- Purpose: Dependencies
- Committed: No

**`.planning/`:**
- Purpose: GSD planning and codebase intelligence
- Committed: Project-dependent

---

*Structure analysis: 2026-05-18*
*Update when directory structure changes*
