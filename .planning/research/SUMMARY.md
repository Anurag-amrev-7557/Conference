# Project Research Summary

**Project:** Book Website — v1.1 Premium Presentation & SEO Dominance  
**Domain:** Brownfield author/book marketing SPA (React 19 / Vite 8 + Express/Prisma CMS) with technical SEO and premium UI polish  
**Researched:** 2026-05-19  
**Confidence:** HIGH (stack, architecture, pitfalls — codebase-verified); MEDIUM (prerender CI path, competitive UX patterns)

## Executive Summary

This milestone upgrades an existing monograph marketing site from a functional CMS-driven SPA to a crawlable, shareable, premium author brand surface. Experts do **not** rewrite brownfield React/Vite apps as Next.js for SEO—they layer a **meta-first + build-time prerender** strategy on the existing static-hosting model, generate crawl artifacts from the same Prisma source of truth as the CMS, and treat Core Web Vitals as a launch gate alongside visual polish.

The recommended approach is **stack continuity**: keep `BrowserRouter`, `WebsiteDataProvider`, and Docker/Nginx static frontend; add `react-helmet-async` per-route head management, Express-driven dynamic `sitemap.xml`, JSON-LD from CMS fields, and a **post-build Puppeteer prerender** for public routes only (`/`, `/blog`, `/blog/:slug`, `/events`, `/community`). Admin stays client-rendered with `noindex`. Avoid full SSR, Vike, react-snap, or framework migration unless a separate phase is explicitly budgeted.

The dominant risks are **shipping client-only meta** (invisible to non-JS crawlers and social bots), **duplicate canonicals** from static `index.html` plus Helmet, and **CWV regression** from uncapped GSAP/Three/Framer on the critical path. Mitigate by establishing a single head owner (`src/seo/`), locking `SITE_URL` for all absolute URLs, prerendering only an explicit route allowlist, and enforcing a motion/bundle budget before the premium UI pass.

## Key Findings

### Recommended Stack

Extend the existing stack with targeted SEO and UX packages—no framework migration. **react-helmet-async@3** (React 19) replaces imperative `document.title` in `ThemeSynchronizer`. **schema-dts** types JSON-LD at compile time. **sitemap@9** on Express generates live XML from published Prisma rows. **puppeteer@25** post-build prerenders public HTML because RR7 framework `prerender` does not apply to `BrowserRouter` without a routing restructure. **sharp** resizes OG uploads; **web-vitals** validates the SEO milestone in production.

**Core technologies:**
- **react-helmet-async@3.0.0** — Per-route title, canonical, OG/Twitter; admin snippet preview parity
- **schema-dts@2.0.0** — Typed `Book`, `Article`, `Organization`, `BreadcrumbList` JSON-LD
- **sitemap@9.0.1** (server) — Dynamic `sitemap.xml` replacing stale `public/sitemap.xml`
- **puppeteer@25.0.4** (dev/CI) — Post-`vite build` prerender via `scripts/prerender.mts`
- **sharp@0.34.5** (server) — 1200×630 OG image pipeline on admin upload
- **web-vitals@5.2.0** — RUM for LCP, INP, CLS (feeds existing marketing telemetry)
- **@radix-ui/react-dialog@1.1.15** + **@fontsource/*** — Accessible modals and self-hosted fonts (LCP win)

**Critical version notes:** Align Node 20+ for puppeteer/sharp; do not use vite-react-ssg (peers RR6/Vite≤7). Standardize on Helmet everywhere—do not mix React 19 native metadata and Helmet on different pages.

### Expected Features

Brownfield already has global title/description, static sitemap, blog slugs, admin CMS, and partial premium motion. v1.1 closes **gaps only**.

**Must have (table stakes):**
- Per-route meta (title, description, canonical, OG, Twitter) — especially `/blog/:slug`
- Crawlable HTML for public routes — build-time prerender, not SPA shell alone
- Dynamic XML sitemap + hardened `robots.txt` — blog slugs, fresh `lastmod`, block `/admin`
- JSON-LD (`WebSite`, `Organization`, `Book`, `BlogPosting`) — from CMS fields visible on page
- Per-article SEO fields in CMS + global OG / GSC verification
- Core Web Vitals + mobile pass — lazy heavy assets, image dimensions, `prefers-reduced-motion`
- Semantic HTML audit — one `h1`, landmarks, image `alt`
- Search Console verification meta from admin

**Should have (competitive):**
- Admin SERP/social snippet preview — after per-entity SEO is stable
- `BreadcrumbList` JSON-LD — low effort once meta pipeline exists
- Event structured data — after machine-readable dates on `Event` model
- Premium editorial UX — reading progress, typography, restrained motion system

**Defer (v2+):**
- hreflang / multi-locale
- Full SSR or React Router framework migration
- Author profile pages (`/author`) with Person schema
- IndexNow — optional after dynamic sitemap is reliable

**Anti-features to reject:** keyword meta fields, auto tag archives, indexing all community UGC, heavy 3D on every page, client-only sitemap in JS, duplicate global meta on every URL.

### Architecture Approach

SEO and UI polish **extend existing layers**—`WebsiteDataProvider` remains the single content source. Add a parallel **`src/seo/`** module (`SeoHead`, `seoConfig`, `JsonLd`, route registry) and server **`seoRoutes`** for crawl files. Remove SEO duties from `ThemeSynchronizer` (theme/CSS only). Build order: data model → client head → semantics + JSON-LD → robots/sitemap → prerender → admin tools → measurement → UI polish.

**Major components:**
1. **SeoHead + seoConfig** — Declarative per-route head; fallback chain entity → route default → site `settings.seo`
2. **seoRoutes + sitemapBuilder** (Express) — Authoritative sitemap from published Prisma rows; `SITE_URL` env
3. **Prerender pipeline** (`scripts/prerender.mts`) — CI calls API for slug list; writes `dist/blog/:slug/index.html`; never prerender `/admin`
4. **JsonLd components** — Presentational structured data from same CMS fields rendered on page
5. **Design token bridge** — Formalize `@theme` + `appearance` CSS variables before section-level UI pass

### Critical Pitfalls

1. **Client-only meta is insufficient** — `ThemeSynchronizer` global title/description is invisible to many crawlers; prerender must bake Helmet output into static HTML. Verify with View Source, not DevTools Elements.
2. **Duplicate/conflicting canonical and OG tags** — Static `index.html` already has homepage canonical; strip to minimal shell; one head owner per URL via `SeoHead`.
3. **Global SEO masking per-page needs** — Extend `Article` with `seoTitle`, `seoDescription`, `ogImage`, `noindex`; per-entity admin tab with fallback chain.
4. **Soft 404s on SPA catch-all** — Unknown slugs return HTTP 200; add `noindex` before redirect, real 404 at hosting layer, or prerender 404 for bad slugs.
5. **CWV regression from premium motion** — Cap GSAP/Three/Framer on critical path; `prefers-reduced-motion`; lazy-load below fold; LCP element must not start at `opacity: 0`.

## Implications for Roadmap

Based on combined research, use **dependency-ordered phases** that separate crawl infrastructure from visual polish. Do not start prerender until per-route `SeoHead` works in dev and `SITE_URL` is locked.

### Phase 1: SEO Data Model & Site URL Contract
**Rationale:** Prisma/types and `SITE_URL` block every downstream SEO artifact; domain drift (`monograph.superhumanly.ai` vs `api.superhumanly-thoughts.com`) must be fixed first.  
**Delivers:** `Article` SEO columns (`seoTitle`, `seoDescription`, `ogImage`, `noindex`), extended `settings.seo` (OG image, GSC verification), `SITE_URL` env, API merge logic in `websiteData.ts`.  
**Addresses:** Per-article SEO in CMS (P1), canonical absolute URLs.  
**Avoids:** Pitfall 10 (domain inconsistency), Pitfall 3 (global-only SEO).

### Phase 2: Per-Route Head Management
**Rationale:** Meta layer is required baseline for navigation UX, admin preview, and prerender input; must exist before crawl files and prerender.  
**Delivers:** `HelmetProvider`, `src/seo/` (`SeoHead`, `seoConfig`, `usePageSeo`), route registry; SEO removed from `ThemeSynchronizer`; `index.html` reduced to shell fallbacks.  
**Uses:** react-helmet-async@3, schema-dts (types only).  
**Addresses:** Per-route meta tags (P1), Search Console verification injection.  
**Avoids:** Pitfalls 1–2 (client-only meta, duplicate tags).

### Phase 3: Structured Data & Semantic HTML
**Rationale:** JSON-LD depends on resolved canonical URLs and article fields from Phase 1–2; semantic audit is low-cost parallel work.  
**Delivers:** `JsonLd` components on landing (`WebSite`, `Organization`, `Book`), blog post (`BlogPosting`), events stub; heading/`h1`/alt audit on public pages.  
**Addresses:** JSON-LD (P1), semantic HTML (P1).  
**Avoids:** Pitfall 6 (late/duplicated JSON-LD).

### Phase 4: Crawl Policy & Dynamic Sitemap
**Rationale:** Sitemap requires published slugs from Phase 1; robots policy before prerender route discovery.  
**Delivers:** `seoRoutes.ts`, `sitemapBuilder.ts`, `GET /sitemap.xml`, `robots.txt` (disallow `/admin`, `/dashboard`); optional `GET /api/v1/seo/prerender-paths`; nginx location for sitemap.  
**Uses:** sitemap@9 on Express.  
**Addresses:** Dynamic sitemap (P1), robots hardening (P1).  
**Avoids:** Pitfalls 5, 9 (stale sitemap, indexed admin).

### Phase 5: Build-Time Prerender
**Rationale:** Highest implementation cost; depends on working `SeoHead`, route list API, and CI API access.  
**Delivers:** `scripts/prerender.mts`, `package.json` build hook, Docker/CI `PRERENDER_API_URL`, CDN rewrite rules for prerendered paths; exclude admin/community if product says noindex.  
**Uses:** puppeteer@25 post-build.  
**Addresses:** Crawlable HTML (P1), social sharing cards.  
**Avoids:** Pitfalls 1, 4, 8 (empty shell, soft 404, API waterfall in first HTML).

### Phase 6: Admin SEO Tools & Measurement
**Rationale:** Editors need per-entity controls and preview after live meta pipeline is stable.  
**Delivers:** `BlogManager` / `SettingsManager` SEO tabs, snippet preview component, sharp OG upload route, `web-vitals` RUM to marketing events, GSC verification field.  
**Uses:** sharp@0.34.5, web-vitals@5.2.0.  
**Addresses:** Per-article CMS (P1), admin SERP preview (P2), Search Console (P1).  
**Avoids:** Pitfall 3 (editors think global SEO is enough).

### Phase 7: Premium UI & Core Web Vitals
**Rationale:** Visual polish and performance budget last—motion/fonts must not undo SEO work; tokens from Phase 1 enable consistent pass.  
**Delivers:** Design token contract (`tokens.css` / `@theme`), Radix dialog upgrades for modals, fontsource self-hosting, `prefers-reduced-motion` guards, lazy Three/GSAP, `vite-plugin-compression`, image dimensions/`fetchpriority`, mobile touch targets.  
**Uses:** @radix-ui/react-dialog, @fontsource/*, vite-plugin-compression.  
**Addresses:** CWV + mobile polish (P1), premium motion system (differentiator).  
**Avoids:** Pitfall 7 (CWV regression).

### Phase Ordering Rationale

- **Data before head before crawl artifacts before prerender** — Feature dependency graph and architecture build order agree; prerender without per-route meta wastes CI time.
- **JSON-LD and sitemap parallelize after Phase 2** — Both need canonical URLs and published flags but not each other.
- **UI polish last** — Prevents GSAP/Three/font changes from invalidating CWV validation done for SEO milestone sign-off.
- **Admin preview after live pipeline** — Preview component reuses same `PageSeo` props as production routes.

### Research Flags

Phases likely needing `/gsd:plan-phase --research-phase <N>` during planning:

- **Phase 5 (Prerender):** CI/Docker integration, CDN rewrite rules, Puppeteer on Alpine vs Debian, fallback if headless Chrome blocked in CI
- **Phase 4 (Sitemap/nginx):** Exact production proxy path for `/sitemap.xml` (API vs baked `dist/`)
- **Phase 7 (CWV):** Bundle budget for `three`/`gsap` on landing—may need route-level code splitting spike

Phases with standard patterns (lighter research):

- **Phase 2 (Helmet):** react-helmet-async@3 + Google JS SEO docs—well documented
- **Phase 3 (JSON-LD):** Google Book/Article structured data guides—schema-dts patterns established
- **Phase 6 (Admin SEO UI):** Extends existing `SettingsManager` / `BlogManager` patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm versions verified; brownfield constraints explicit; RR7 prerender ruled out without migration |
| Features | HIGH | Google Search Central + codebase audit; MVP checklist clear |
| Architecture | HIGH | Verified against `App.tsx`, Express, nginx, provider pattern |
| Pitfalls | HIGH | Codebase-specific (index.html, ThemeSynchronizer, static sitemap) + official Google docs |

**Overall confidence:** HIGH for phase structure and stack choices; MEDIUM for prerender CI ergonomics and exact deploy rewrite config.

### Gaps to Address

- **Prerender CI without DB access:** Use `GET /api/v1/seo/prerender-paths` vs direct Prisma in build—decide in Phase 5 planning.
- **Community indexing policy:** Default `noindex` for `/community` unless product explicitly wants UGC indexed—confirm before Phase 4–5.
- **Event schema dates:** `Event` model may need ISO `startDate` migration before Event JSON-LD (defer to v1.1.x per FEATURES.md).
- **Cloudflare/prerender vendor fallback:** If CI cannot run Puppeteer, document infra-only phase (no npm dep)—per STACK variant.
- **React Router framework migration:** Optional mid-milestone cost spike—only if prerender maintenance exceeds budget; treat as separate milestone, not v1.1 default.

## Sources

### Primary (HIGH confidence)
- [Google Search Central — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central — Article/BlogPosting](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search Central — Book structured data](https://developers.google.com/search/docs/appearance/structured-data/book)
- [Google Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [React Router Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) — framework mode only; not current SPA
- [react-helmet-async v3 on npm](https://www.npmjs.com/package/react-helmet-async)
- Brownfield codebase: `package.json`, `src/App.tsx`, `index.html`, `public/sitemap.xml`, `server/prisma/schema.prisma`, `.planning/codebase/*`

### Secondary (MEDIUM confidence)
- [Chapter — author website design](https://blog.chapter.pub/author-website-design/) — competitive UX patterns
- [Guided Web Design — high-converting author layouts](https://guidedwebdesign.com/blog/high-converting-author-website-layouts)
- SPA prerender ecosystem articles — supports prerender rationale; cross-checked with Google docs
- [web.dev — Core Web Vitals](https://web.dev/articles/vitals)

### Tertiary (needs validation during execution)
- Exact nginx/CDN rewrite rules for prerendered `dist/blog/:slug/index.html` on production host
- Lighthouse CI in GitHub Actions — optional, not blocking stack choice

---
*Research completed: 2026-05-19*  
*Ready for roadmap: yes*
