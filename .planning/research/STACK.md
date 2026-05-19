# Stack Research

**Domain:** Technical SEO + premium UI on brownfield React 19 / Vite 8 SPA with Express/Prisma API  
**Researched:** 2026-05-19  
**Confidence:** HIGH (versions via npm registry); MEDIUM (prerender path — official RR7 docs vs brownfield SPA tradeoff)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **react-helmet-async** | **3.0.0** | Per-route `<title>`, meta, canonical, OG/Twitter tags | v3 adds React 19 peer support and runtime detection; replaces ad-hoc `document.title` / `querySelector` in `ThemeSynchronizer` with declarative, testable head management. Still valuable when you need `titleTemplate`, `noindex`, or consistent admin snippet preview. |
| **schema-dts** | **2.0.0** | TypeScript types for JSON-LD (`Book`, `Article`, `Organization`, `BreadcrumbList`) | Zero runtime cost; prevents invalid structured-data shapes at compile time. Pair with inline `<script type="application/ld+json">` in page components. |
| **sitemap** | **9.0.1** | Dynamic `sitemap.xml` on Express from Prisma | Replaces stale static `public/sitemap.xml` (lastmod 2024-04-11). Streams XML from published `Article.slug`, events, and static marketing routes. Single source of truth with CMS publishes. |
| **puppeteer** | **25.0.4** | Post-build prerender of public routes | Brownfield app uses `BrowserRouter` in `App.tsx`, not React Router framework mode — RR7’s built-in `prerender` config does not apply without a major routing migration. Puppeteer + a small `scripts/prerender.mts` is the lowest-risk way to emit static HTML for `/`, `/blog`, `/blog/:slug`, `/events`, `/community`. |
| **sharp** | **0.34.5** | OG image resize/optimize on server upload | Native, fast image pipeline for admin “OG image” uploads (1200×630 WebP/JPEG). Keeps LCP-friendly assets without shipping a separate image SaaS. |
| **web-vitals** | **5.2.0** | RUM for LCP, INP, CLS | Feeds Core Web Vitals into existing marketing telemetry or GTM; required to validate SEO milestone, not guess from Lighthouse alone. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@radix-ui/react-dialog** | **1.1.15** | Accessible modal primitive (focus trap, ESC, `aria-*`) | Upgrade `ContactSupportModal`, `LeadCaptureModal`, `CreatePostModal` from hand-rolled overlays — premium UX + a11y without a second design system. |
| **@radix-ui/react-visually-hidden** | **1.2.4** | Screen-reader-only labels | Dialog titles, icon-only buttons in navbar/mobile menu. |
| **@fontsource-variable/plus-jakarta-sans** | **5.2.8** | Self-hosted body font | Replace render-blocking Google Fonts `<link>`; improves LCP and works offline in preview. Match existing `--font-sans` mapping in `App.tsx`. |
| **@fontsource/instrument-serif** | **5.2.8** | Self-hosted heading font | Pairs with existing Instrument Serif usage in theme tokens. |
| **vite-plugin-compression** | **0.5.1** | Brotli/gzip of `dist/` assets | Production static host serves precompressed bundles; cheap win for transfer size (CWV). |
| **rollup-plugin-visualizer** | **6.0.5** | Bundle treemap (dev only) | Audit `three` / `gsap` weight on landing route before lazy-loading decisions. |
| **vite-imagetools** | **10.0.0** | Build-time responsive `srcset` for static images | Hero/OG assets in `public/`; optional if most images are CMS URLs (then **sharp** on server is enough). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **puppeteer** (dev) | Prerender script in CI | Run after `vite build`; point at `vite preview` or `sirv-cli` on `dist/`. Pass route list from `prisma.article.findMany({ where: { isPublished: true } })`. |
| **@types/sitemap** | Types for `sitemap` package | DevDependency on `server/`. |
| **Google Search Console** | Index coverage, CWV field data | No npm package — HTML meta verification tag via `react-helmet-async` on `/` or env-injected snippet in `settings.scripts`. |
| **Lighthouse CI** (optional) | PR performance budgets | `lhci` in GitHub Actions once Phase 4 infra exists; not blocking for stack choice. |

## Installation

```bash
# Frontend (repo root) — SEO head + CWV + premium primitives + fonts
npm install react-helmet-async@3.0.0 web-vitals@5.2.0 \
  @radix-ui/react-dialog@1.1.15 @radix-ui/react-visually-hidden@1.2.4 \
  @fontsource-variable/plus-jakarta-sans@5.2.8 @fontsource/instrument-serif@5.2.8

npm install -D schema-dts@2.0.0 puppeteer@25.0.4 \
  vite-plugin-compression@0.5.1 rollup-plugin-visualizer@6.0.5

# Optional frontend image pipeline
npm install -D vite-imagetools@10.0.0

# Server (server/)
cd server && npm install sitemap@9.0.1 sharp@0.34.5
npm install -D @types/sitemap
```

## Integration Points (Existing Stack)

### Frontend (`src/`)

| Concern | Integration |
|---------|-------------|
| **App shell** | Wrap `App` in `HelmetProvider` in `main.tsx`. Keep `WebsiteDataProvider` — site-wide defaults from `settings.seo` become `Helmet` defaults on a `SiteSeoDefaults` component. |
| **Per-route SEO** | Add `components/seo/PageSeo.tsx` consumed by `LandingPage`, `BlogPage`, `BlogPostPage`, `EventsPage`, `CommunityPage`. Remove SEO block from `ThemeSynchronizer` (lines 68–73 in `App.tsx`) to avoid double-writes. |
| **JSON-LD** | `BlogPostPage`: `Article` + `BreadcrumbList`. `/`: `WebSite` + `Organization` (or `Book` if appropriate). Use `schema-dts` types, serialize with `JSON.stringify`. |
| **Admin preview** | Reuse same `PageSeo` props in admin snippet preview panel (extend `SettingsManager` / per-article fields). |
| **CWV** | `web-vitals` listener in `MarketingTracker` or dedicated `reportWebVitals.ts` posting to `/api/v1/marketing/events` (after proxy hardening). |
| **Vite** | Register `vite-plugin-compression` + optional `vite-imagetools` in `vite.config.ts`; do not add SSR plugins here. |

### Backend (`server/`)

| Concern | Integration |
|---------|-------------|
| **Dynamic sitemap** | New `seoRoutes.ts`: `GET /sitemap.xml` queries `Article` (published), static paths, optional `Event` IDs. Set `SITE_URL` env (e.g. `https://monograph.superhumanly.ai`). Update `public/robots.txt` to reference API-served sitemap or proxy path on CDN. |
| **robots.txt** | `GET /robots.txt` with `Disallow: /admin`, `Disallow: /dashboard`; allow marketing routes. |
| **OG uploads** | Admin route: accept image → **sharp** resize 1200×630 → write to `public/og/` or object storage → persist URL in `SiteContent.settings` JSON (`seo.ogImage`) or per-article field (schema extension). |
| **Prerender input** | Export `GET /api/v1/seo/prerender-paths` (public, cached) returning slug list for CI script — avoids CI needing direct DB file access. |

### Build / Deploy

```text
prisma migrate → vite build → node scripts/prerender.mts → deploy dist/
```

- Prerender only **public** routes; exclude `/admin/*`, `/dashboard`.
- Hosting: serve `dist/blog/my-slug/index.html` when present, else `index.html` (SPA fallback). Many CDNs need explicit rewrite rules (see React Router SPA fallback docs).
- **Do not** run Puppeteer on the production Express server — build-time only.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **react-helmet-async@3** | React 19 native `<title>` / `<meta>` hoisting | Greenfield pages with no `titleTemplate`, no SSR head serialization, no admin preview — fewer deps, but weaker for OG/canonical consistency across 6+ routes. |
| **puppeteer post-build prerender** | React Router 7 `prerender` in `react-router.config.ts` | Willing to migrate from `BrowserRouter` SPA to `@react-router/dev` framework mode; best long-term if milestone budget allows routing restructure. Official docs: https://reactrouter.com/how-to/pre-rendering |
| **puppeteer post-build prerender** | Vike (vite-plugin-ssr) | Greenfield or full SSR/SSG rewrite — too much churn for v1.1 on a CMS-driven site. |
| **puppeteer post-build prerender** | Prerender.io / Cloudflare Workers | Zero build-time Puppeteer, ops cost, vendor lock — good if CI cannot run headless Chrome. |
| **sitemap on Express** | `vite-plugin-sitemap` (build-time only) | Static marketing site with no CMS — fails for dynamic `/blog/:slug` without rebuild on every publish. |
| **sharp on server** | Client-side canvas resize | Avoids quality loss and keeps uploads off oversized originals; don’t process images in browser for OG. |
| **@radix-ui/react-dialog** | `@headlessui/react` | Equivalent a11y; Radix already partially adopted (`@radix-ui/react-slot`). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **vite-plugin-ssr / Vike** | Full-stack SSR framework; replaces Vite SPA architecture and duplicates Express responsibilities. | Post-build prerender or RR7 `prerender` migration. |
| **Next.js / Remix rewrite** | Violates stack-continuity constraint; splits admin CMS and marketing into two deployables. | Stay on Vite + Express; prerender public HTML only. |
| **react-snap** | Unmaintained; breaks on React 18+. | puppeteer prerender script. |
| **vite-react-ssg@0.9.1-beta.1** | Beta; peers `react-router-dom@^6.14`, Vite `<=7` — project is RR **7.14** + Vite **8**. | puppeteer or RR7 framework prerender. |
| **vite-plugin-prerender@1.0.8** | Stale (2021), same Puppeteer approach but unmaintained config surface. | Custom `scripts/prerender.mts` with puppeteer@25. |
| **Separate `react-helmet` (v6)** | Unmaintained; no React 19 support. | react-helmet-async@3. |
| **next-seo** | Next.js-only API. | PageSeo + react-helmet-async. |
| **Material UI / Chakra** | Second design system fights Tailwind 4 + existing motion/3D stack. | Radix primitives + existing CVA/tokens. |
| **Gatsby** | SSG-centric; poor fit for live CMS + admin SPA. | Express sitemap + prerender script. |
| **Client-only sitemap in `public/`** | Already stale; won’t include new blog slugs. | Express `sitemap` package. |

## Stack Patterns by Variant

**If milestone ships without routing migration (default):**
- **react-helmet-async** + **schema-dts** + Express **sitemap** + **puppeteer** post-build prerender.
- Express continues to serve API; CDN/static host serves prerendered `dist/`.
- Admin stays client-rendered (`noindex` via Helmet).

**If team approves React Router framework migration mid-milestone:**
- Add `@react-router/dev`, `react-router.config.ts` with `async prerender({ getStaticPaths })` loading slugs from Prisma.
- Drop puppeteer script; use RR7-generated `build/client/**/*.html`.
- **Cost:** Restructure `App.tsx` routes, data loading, and deploy rewrites — plan as its own phase.

**If prerender CI is blocked (no headless Chrome):**
- Ship helmet + sitemap + JSON-LD first (indexing improvement without full HTML snapshot).
- Add Cloudflare prerender or similar for bot User-Agents only — document as infra phase, not npm dep.

**Premium UI without new CSS frameworks:**
- Radix Dialog for modals + fontsource for fonts + existing Tailwind tokens (`--radius-global`, `--shadow-dynamic`).
- Defer heavy `three` hero behind `matchMedia('(prefers-reduced-motion)')` and dynamic `import()` — code change, not a package.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-helmet-async@3.0.0 | react@^19.2.4 | peer: `^16.6 \|\| ^17 \|\| ^18 \|\| ^19` (npm, HIGH) |
| react-helmet-async@3.0.0 | react-router-dom@^7.14.0 | Works in SPA mode; no conflict |
| puppeteer@25.0.4 | Node 20+ | Align with server `@types/node` ^20; Chromium downloaded on install (~size CI concern) |
| sharp@0.34.5 | Node 20+ on Linux deploy | May need `libc` compat on Alpine — use Debian-based image or sharp prebuilds |
| vite-plugin-compression@0.5.1 | vite@^8.0.1 | Dev plugin only |
| web-vitals@5.2.0 | Modern browsers | INP replaces FID in v4+; v5 current on npm |
| sitemap@9.0.1 | express@^4.19.2 | ESM/CJS: use `import sitemap from 'sitemap'` or dynamic import in TS |
| @radix-ui/react-dialog@1.1.15 | react@^19.2.4 | Matches existing `@radix-ui/react-slot@^1.2.4` generation |

## React 19 Native Metadata (Optional Simplification)

React 19 can hoist `<title>`, `<meta>`, `<link>` from components to `<head>` without Helmet. **Limitation:** `htmlAttributes`/`bodyAttributes`, `titleTemplate`, and SSR head replay still favor **react-helmet-async@3** for this project’s admin preview and future prerender head replay.

**Recommendation:** Standardize on **react-helmet-async@3** for one pattern across all public routes and admin preview — avoids mixing native metadata and Helmet on different pages.

## Data Model Extensions (Not npm — required for stack to work)

| Field | Location | Purpose |
|-------|----------|---------|
| `seoTitle`, `seoDescription`, `ogImage`, `noindex` | `Article` and/or `SiteContent.settings` JSON | Per-post OG + snippet preview |
| `SITE_URL` | server `.env` | Canonical + sitemap absolute URLs |
| `prerenderPaths` | build script input | `/`, `/blog`, `/events`, `/community`, `/blog/${slug}` |

## Sources

- [react-helmet-async v3.0.0 on npm](https://www.npmjs.com/package/react-helmet-async) — React 19 peerDependencies (HIGH)
- [react-helmet-async PR #260](https://github.com/staylor/react-helmet-async/pull/260) — React 19 support notes (HIGH)
- [React Router Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) — official `prerender` config; requires framework mode (HIGH)
- [npm registry](https://www.npmjs.com/) — version pins for sitemap, sharp, puppeteer, web-vitals, radix (HIGH)
- Project baseline: `.planning/codebase/STACK.md`, `package.json`, `vite.config.ts`, `index.html`, `public/sitemap.xml`, `src/App.tsx` (HIGH)
- SPA SEO delivery / AI crawlers — industry articles (MEDIUM): indexing delay and non-JS crawlers motivate prerender, not helmet alone

---
*Stack research for: v1.1 Premium Presentation & SEO Dominance*  
*Researched: 2026-05-19*
