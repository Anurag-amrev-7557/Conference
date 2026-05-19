# Roadmap: Book Website

## Milestones

- ⏸️ **v1.0 Production-Ready** — Phases 1–9 (paused at Phase 3; Phases 1–2 complete) — see [MILESTONES.md](./MILESTONES.md)
- 🚧 **v1.1 Premium Presentation & SEO Dominance** — Phases 10–16 (in progress)

## Overview

**v1.1** transforms the existing React/Vite monograph site into a crawlable, shareable, premium author brand surface without a framework migration. Work follows dependency order: SEO data model and `SITE_URL` contract → per-route head management → structured data and semantics → crawl policy and dynamic sitemap → build-time prerender → admin SEO tools and measurement → premium UI and Core Web Vitals polish.

**v1.0** foundation (backend APIs, security) remains shipped; marketing integration, infra, RBAC, chat, payments, and mobile stay deferred until v1.0 resumes or a later milestone.

## Phases (v1.1 — active)

- [ ] **Phase 10: SEO Data Model & Site URL Contract** — Prisma/CMS SEO fields and `SITE_URL` as single source of truth for absolute URLs.
- [ ] **Phase 11: Per-Route Head Management** — `react-helmet-async` per-route title, canonical, OG/Twitter; admin `noindex`; shell-only `index.html`.
- [ ] **Phase 12: Structured Data & Semantic HTML** — JSON-LD on landing, blog, events; semantic heading/landmark/alt audit.
- [ ] **Phase 13: Crawl Policy & Dynamic Sitemap** — Live `sitemap.xml` from published content; hardened `robots.txt`.
- [ ] **Phase 14: Build-Time Prerender** — Post-build Puppeteer prerender bakes meta into static HTML for public routes.
- [ ] **Phase 15: Admin SEO Tools & Measurement** — Per-article SEO tab, snippet preview, OG upload pipeline, GSC verification, web-vitals RUM.
- [ ] **Phase 16: Premium UI & Core Web Vitals** — Design tokens, self-hosted fonts, accessible modals, motion/CWV budget, mobile polish.

<details>
<summary>⏸️ v1.0 Production-Ready (Phases 1–9) — PAUSED at Phase 3</summary>

### Phase 1: Backend Completeness ✅
**Goal**: Every CMS and community action the UI exposes persists through validated Express/Prisma APIs.
**Requirements**: BACK-01–BACK-07 | **Completed**: 2026-05-18

### Phase 2: Security Hardening ✅
**Goal**: Production security baselines before payments and multi-user admin.
**Requirements**: SEC-01–SEC-07 | **Completed**: 2026-05-18

### Phase 3: Marketing Integration
**Goal**: Book site and `marketing-backend` work as one lead-intelligence pipeline.
**Requirements**: MKT-01–MKT-06 | **Status**: Not started

### Phases 4–9
Production infrastructure, quality/testing, RBAC, chat, payments, mobile — deferred. Full detail in git history and prior ROADMAP revisions.

</details>

## Phase Details (v1.1)

### Phase 10: SEO Data Model & Site URL Contract

**Goal**: Editors and the stack share one SEO data model; all absolute URLs derive from a single `SITE_URL` configuration.
**Depends on**: v1.0 Phases 1–2 (API/CMS baseline)
**Requirements**: CRAWL-01, CMS-01, CMS-02
**Success Criteria** (what must be TRUE):

  1. Editor can set per-article `seoTitle`, `seoDescription`, `ogImage`, and `noindex` in admin; values persist via API.
  2. Editor can set global default OG image and Google Search Console verification token in site settings.
  3. Canonical, OG, sitemap, and JSON-LD builders all resolve URLs from `SITE_URL` (no hardcoded production host drift).

**Plans**: 3 plans (10-01 SITE_URL, 10-02 data layer, 10-03 admin UI)
**UI hint**: yes

### Phase 11: Per-Route Head Management

**Goal**: Every public URL exposes correct, unique head tags for users, crawlers, and social platforms.
**Depends on**: Phase 10
**Requirements**: META-01, META-02, META-03, META-04, META-05, META-06
**Success Criteria** (what must be TRUE):

  1. Visitor opening `/`, `/blog`, `/blog/:slug`, `/events`, or `/community` sees a unique document title and meta description (verify in dev tools or View Source after prerender).
  2. Each public page includes a canonical link matching `SITE_URL` plus the current path.
  3. Sharing any public page produces correct Open Graph and Twitter card previews (title, description, image, URL).
  4. `/admin` and `/dashboard` include `noindex` and are excluded from sitemap generation.
  5. Root `index.html` contains only minimal shell fallbacks—no duplicate canonical/OG conflicting with route head.

**Plans**: 3 plans

Plans:
- [x] 11-01-PLAN.md — react-helmet-async, src/seo core, provider shell, index.html trim, og-image.jpg
- [x] 11-02-PLAN.md — Wire all routes + admin SEO help microcopy
- [x] 11-03-PLAN.md — Vitest unit tests for resolvePageSeo

**UI hint**: yes

### Phase 12: Structured Data & Semantic HTML

**Goal**: Search engines and assistive tech understand page content through JSON-LD and semantic markup aligned with visible CMS data.
**Depends on**: Phase 11
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06
**Success Criteria** (what must be TRUE):

  1. Landing page includes valid `WebSite` and `Organization` JSON-LD from CMS settings.
  2. Landing page includes `Book` JSON-LD when title, author, cover, or ISBN are provided in CMS.
  3. Each published blog post page includes `BlogPosting` JSON-LD matching the visible article.
  4. Blog and event detail pages include `BreadcrumbList` JSON-LD reflecting site navigation.
  5. Published events expose `Event` JSON-LD with machine-readable ISO start dates.
  6. Public pages pass semantic audit: one `h1`, logical heading order, landmark regions, and non-empty `alt` on key images.

**Plans**: TBD
**UI hint**: yes

### Phase 13: Crawl Policy & Dynamic Sitemap

**Goal**: Crawlers discover all indexable public URLs through authoritative server-generated crawl files.
**Depends on**: Phase 10 (published slugs, `SITE_URL`)
**Requirements**: CRAWL-02, CRAWL-03
**Success Criteria** (what must be TRUE):

  1. `GET /sitemap.xml` returns XML listing published articles and events with accurate `lastmod` dates.
  2. `robots.txt` allows public marketing paths, disallows `/admin` and `/dashboard`, and references the dynamic sitemap URL at `SITE_URL`.

**Plans**: TBD

### Phase 14: Build-Time Prerender

**Goal**: Non-JavaScript crawlers and social bots receive full HTML with baked meta for all indexable marketing routes.
**Depends on**: Phases 11, 13 (working `SeoHead`, crawl route list)
**Requirements**: CRAWL-04, CRAWL-05
**Success Criteria** (what must be TRUE):

  1. View Source on `/`, `/blog`, `/blog/:slug`, and `/events` shows title, description, canonical, and OG tags without executing client JS.
  2. Prerendered HTML matches the meta Helmet renders in development for the same URL.
  3. Build pipeline produces static HTML files for the public route allowlist (community only if product confirms indexing).

**Plans**: TBD

### Phase 15: Admin SEO Tools & Measurement

**Goal**: Editors control and preview SEO before publish; production reports Core Web Vitals and supports Search Console verification.
**Depends on**: Phases 10, 11, 14 (live meta pipeline and prerender)
**Requirements**: CMS-03, CMS-04, CMS-05, MSMT-01, PERF-04
**Success Criteria** (what must be TRUE):

  1. Editor uses a per-article SEO tab with fallback chain (override → title/excerpt → site defaults).
  2. Editor sees SERP and social snippet previews that match live head output for the same fields.
  3. Uploaded OG images are served at 1200×630 after server-side resize.
  4. Google Search Console verification meta from admin settings appears in production HTML, including prerendered pages.
  5. Production telemetry receives LCP, INP, and CLS from `web-vitals`.

**Plans**: TBD
**UI hint**: yes

### Phase 16: Premium UI & Core Web Vitals

**Goal**: The public site feels premium and fast on mobile and desktop without undoing SEO crawlability.
**Depends on**: Phase 15 (SEO milestone stable before motion/font changes)
**Requirements**: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):

  1. Landing, blog, events, and community share consistent design tokens (spacing, radius, shadow, typography).
  2. Critical fonts load from self-hosted packages without visible layout shift from webfont swap.
  3. Animations respect `prefers-reduced-motion`; LCP element is visible on first paint (not opacity-zero).
  4. Mobile viewports pass review: no horizontal scroll, 44px touch targets, readable type scale.
  5. Three.js and heavy GSAP are lazy-loaded or limited to below-fold/landing contexts; above-fold images have dimensions to prevent CLS.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution order (v1.1):** 10 → 11 → 12 → 13 → 14 → 15 → 16  
*(Phase 12 can overlap Phase 13 after Phase 11; Phase 13 must precede Phase 14.)*

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. SEO Data Model & Site URL Contract | v1.1 | 3/3 | Complete    | 2026-05-19 |
| 11. Per-Route Head Management | v1.1 | 3/3 | Complete    | 2026-05-19 |
| 12. Structured Data & Semantic HTML | v1.1 | 0/TBD | Not started | - |
| 13. Crawl Policy & Dynamic Sitemap | v1.1 | 0/TBD | Not started | - |
| 14. Build-Time Prerender | v1.1 | 0/TBD | Not started | - |
| 15. Admin SEO Tools & Measurement | v1.1 | 0/TBD | Not started | - |
| 16. Premium UI & Core Web Vitals | v1.1 | 0/TBD | Not started | - |

**v1.1 requirement coverage:** 33/33 mapped ✓

---
*Roadmap updated: 2026-05-19 — Milestone v1.1 Phases 10–16*
