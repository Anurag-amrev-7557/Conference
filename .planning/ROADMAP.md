# Roadmap: Book Website

## Milestones

- ⏸️ **v1.0 Production-Ready** — Phases 1–9 (paused at Phase 3; Phases 1–2 complete) — see [MILESTONES.md](./MILESTONES.md)
- ✅ **v1.1 Premium Presentation & SEO Dominance** — Phases 10–16 (complete 2026-05-19)
- 🚧 **v1.2 Apple-Grade Premium Experience** — Phases 17–23 (in progress; **start with Phase 17 navbar + hero**)

## Overview

**v1.2** elevates every public page and the admin CMS to Apple-minimal premium quality — clear hierarchy, confident spacing, restrained motion, disciplined imagery, and flawless responsiveness — without regressing technical SEO or Core Web Vitals.

**Product order:** **Phase 17** ships the global **navbar** and landing **hero** as the visible quality bar across all breakpoints, then **Phase 18** semantic light/dark tokens, **Phase 19** shared primitives, **Phase 20** remaining public surfaces, **Phase 21** motion/CWV guardrails, **Phase 22** admin parity, **Phase 23** prerender hardening.

**v1.1** (complete) delivered crawlable SEO, prerender, admin SEO tools, and Phase 16 foundation (spacing/type tokens, fonts, Radix modals). **v1.0** marketing integration, infra, RBAC, chat, payments, and mobile remain deferred.

## Phases (v1.2 — active)

- [ ] **Phase 17: Navbar & Landing Hero (First)** — Apple-grade header and hero on `/`; responsive 320px–ultra-wide; LCP-safe; keyboard and touch.
- [ ] **Phase 18: Token Foundation & Theme Architecture** — Semantic light/dark tokens, `next-themes`, CMS `colorScheme`, FOUC-free boot; align navbar/hero to tokens.
- [ ] **Phase 19: Shared UI Primitives** — Unified Button, Input, Card, Dialog on semantic tokens.
- [ ] **Phase 20: Public Surface Polish** — Remaining landing sections, blog, events, community, 404; typography rhythm, prose, imagery.
- [ ] **Phase 21: Motion, Glass & CWV Guardrails** — Restrained motion, blur caps, reduced-motion, Lighthouse and Playwright gates.
- [ ] **Phase 22: Admin Parity & Preview** — Admin on public tokens; Design System light/dark preview; optional theme toggle.
- [ ] **Phase 23: Prerender & Infra Hardening** — Theme-ready static HTML and CI token assertions.

<details>
<summary>✅ v1.1 Premium Presentation & SEO Dominance (Phases 10–16) — COMPLETE 2026-05-19</summary>

## Phases (v1.1 — shipped)

- [x] **Phase 10: SEO Data Model & Site URL Contract**
- [x] **Phase 11: Per-Route Head Management**
- [x] **Phase 12: Structured Data & Semantic HTML**
- [x] **Phase 13: Crawl Policy & Dynamic Sitemap**
- [x] **Phase 14: Build-Time Prerender**
- [x] **Phase 15: Admin SEO Tools & Measurement**
- [x] **Phase 16: Premium UI & Core Web Vitals**

See phase details below under **Phase Details (v1.1)**.

</details>

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
Production infrastructure, quality/testing, RBAC, chat, payments, mobile — deferred.

</details>

## Phase Details (v1.2)

### Phase 17: Navbar & Landing Hero (First)

**Goal**: The first impression on `/` matches Apple-minimal premium quality — global navigation and hero are polished, accessible, and responsive on every breakpoint before sitewide token and page work continues.
**Depends on**: v1.1 Phase 16 (spacing/type tokens, fontsource, section utilities, Radix modals baseline)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06
**Success Criteria** (what must be TRUE):

  1. Visitor on desktop sees a calm, premium header (logo, primary nav, optional CTA) with clear hierarchy and no clutter at `xl` widths.
  2. Visitor on phone/tablet opens navigation with ≥44px controls; no horizontal page scroll; sticky header does not permanently hide in-page anchor targets.
  3. Visitor using keyboard or screen reader can reach all header actions with visible `focus-visible` rings and logical tab order (including mobile menu).
  4. Visitor with `prefers-reduced-motion: reduce` sees minimal menu animation; visitor with motion allowed still avoids layout-thrashing header transitions.
  5. Visitor’s LCP in the hero is visible on first paint; hero media does not cause CLS; primary CTAs meet touch size and contrast requirements.
  6. Visitor sees CMS-driven hero copy and imagery without layout thrash on hydration; decorative layers do not obscure the message.

**Plans**: TBD
**UI hint**: yes

### Phase 18: Token Foundation & Theme Architecture

**Goal**: Visitors and editors experience consistent light, dark, and system themes with no flash of wrong theme and CMS-compatible semantic surfaces; navbar and hero align to semantic tokens.
**Depends on**: Phase 17 (navbar/hero structure stable)
**Requirements**: DSM-01, DSM-02, DSM-03, DSM-04, DSM-05, DSM-06, DSM-07
**Success Criteria** (what must be TRUE):

  1. Visitor with OS dark preference sees dark neutrals on first paint (no full-screen flash of light theme before hydration).
  2. Visitor can persist light, dark, or system preference; choice survives reload without conflicting with CMS appearance accent/fonts.
  3. Editor can set site `colorScheme` (light | dark | system) in Design System admin; published site reflects the choice via `applyAppearance()`.
  4. Public pages use semantic surfaces (`bg-bg`, `bg-surface`, `text-text`, borders, accent) — not hardcoded `bg-white` or light-only glass rgba on body and section utilities.
  5. Glass, CTA, and section `@utility` styles read from semantic tokens in both light and dark variants.
  6. Navbar and hero from Phase 17 use semantic tokens in both themes without regressing layout or contrast.

**Plans**: TBD
**UI hint**: yes

### Phase 19: Shared UI Primitives

**Goal**: Every interactive control on public and admin routes shares one token-driven primitive set with accessible focus and touch targets.
**Depends on**: Phase 18
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, TYPE-01, TYPE-02
**Success Criteria** (what must be TRUE):

  1. Visitor sees consistent button styles (primary, secondary, ghost) on landing CTAs, modals, and forms — one CVA `Button`, not split `btn-cta-*` vs slate variants.
  2. Visitor using keyboard or screen reader gets visible `focus-visible` rings on inputs, selects, textareas, and buttons; mobile tap targets are at least 44px tall on primary actions.
  3. Visitor sees cards, lists, chips, and badges with a clear 3-level elevation ladder that respects dark mode surfaces.
  4. Visitor opening a modal sees theme-aware overlay and panel with enter/exit motion; with reduced motion preferred, the dialog closes instantly without animation.
  5. Visitor on mobile and desktop gets premium navigation: readable glass/blur per theme, thumb-zone CTAs, and no hover-only critical affordances.
  6. Site-wide typography uses one optical scale (fluid display, fixed UI steps) and only Instrument Serif + Plus Jakarta Sans — no third display face.

**Plans**: TBD
**UI hint**: yes

### Phase 20: Public Surface Polish

**Goal**: Every public marketing route feels Apple-minimal premium with unified rhythm, reading experience, and stable imagery in both themes.
**Depends on**: Phase 19
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, TYPE-03, TYPE-04, IMG-01, IMG-02, IMG-03, IMG-04
**Success Criteria** (what must be TRUE):

  1. Visitor on `/` sees cohesive sections below the hero using shared tokens, typography, and imagery (hero quality bar from Phase 17 maintained).
  2. Visitor on `/blog` and `/blog/:slug` gets premium cards, hero, comfortable prose (~65ch), and related/CTA blocks with logical heading hierarchy.
  3. Visitor on `/events` sees map, cards, and detail views matching premium visual and dark-mode standards.
  4. Visitor on `/community` sees feed, posts, modals, and create flow matching the same quality bar in light and dark.
  5. Visitor hitting an unknown URL sees an on-brand minimal 404 with a clear escape CTA built from shared primitives.
  6. Visitor scrolling public routes sees consistent `section-public` / `section-inner` rhythm, eyebrows, and headings; card and hero images do not cause layout shift; book cover and OG imagery remain legible in dark mode.

**Plans**: TBD
**UI hint**: yes

### Phase 21: Motion, Glass & CWV Guardrails

**Goal**: Motion and glass enhance the brand without hurting vestibular comfort, INP, or Lighthouse scores established in v1.1.
**Depends on**: Phase 20
**Requirements**: MOT-01, MOT-02, MOT-03, MOT-04, CWV-01, CWV-02, CWV-03
**Success Criteria** (what must be TRUE):

  1. Visitor with `prefers-reduced-motion: reduce` sees no scroll-triggered reveals, instant modal dismiss, and no custom cursor or magnetic effects.
  2. Visitor with motion allowed sees scroll reveals only once, below the fold, using transform/opacity — never on the LCP hero.
  3. Visitor experiences backdrop blur on navigation and at most one above-the-fold layer; low-end or reduced-motion users get solid fallbacks.
  4. Visitor on mobile is not burdened by default custom cursor or magnetic hover effects.
  5. Lighthouse performance and accessibility on landing and blog do not regress vs v1.1 Phase 16 baseline; production still reports LCP, INP, CLS via `web-vitals`.
  6. CI or local verify captures Playwright snapshots for landing, blog, and admin preview in both light and dark.

**Plans**: TBD
**UI hint**: yes

### Phase 22: Admin Parity & Preview

**Goal**: Editors work in a CMS that looks and previews like the public premium experience, including accurate light/dark/system preview.
**Depends on**: Phase 21
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, TYPE-05, COMP-06
**Success Criteria** (what must be TRUE):

  1. Editor sees admin layout, sidebar, and chrome using the same semantic tokens as the public site (density utilities allowed; no separate gray admin theme).
  2. Editor uses blog, events, pages, and community managers with shared `Input`, `Button`, and card primitives aligned to public spacing and type scale.
  3. Editor in Design System manager previews light, dark, and system appearances accurately via `previewData || data` and `applyAppearance()` before publish.
  4. Editor in LivePreview sees theme changes in the iframe without duplicate theme logic diverging from production.
  5. Visitor can optionally switch light / dark / system from public nav or footer after system tokens are stable.

**Plans**: TBD
**UI hint**: yes

### Phase 23: Prerender & Infra Hardening

**Goal**: View Source and crawlers receive theme-accurate static HTML aligned with hydrated React output.
**Depends on**: Phase 18 (token contract); best completed after Phase 22 (stable theme API)
**Requirements**: INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):

  1. Visitor viewing View Source on prerendered public routes sees critical `:root` semantic tokens and correct `color-scheme` without executing client JS.
  2. Prerender pipeline waits for theme-ready state or inlines tokens so static HTML matches hydrated light/dark appearance for the configured site default.
  3. CI or verify script fails the build when expected semantic token classes are missing from prerendered public HTML.

**Plans**: TBD

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

**Plans**: 4 plans

Plans:
- [x] 12-01-PLAN.md — settings.book CMS + Event startDate/endDate migration
- [x] 12-02-PLAN.md — JSON-LD builders, JsonLd.tsx, vitest
- [x] 12-03-PLAN.md — Wire JsonLd on landing, blog, events pages
- [x] 12-04-PLAN.md — Semantic audit (h1, alt, landmarks) + verify script

**UI hint**: yes

### Phase 13: Crawl Policy & Dynamic Sitemap

**Goal**: Crawlers discover all indexable public URLs through authoritative server-generated crawl files.
**Depends on**: Phase 10 (published slugs, `SITE_URL`)
**Requirements**: CRAWL-02, CRAWL-03
**Success Criteria** (what must be TRUE):

  1. `GET /sitemap.xml` returns XML listing published articles and events with accurate `lastmod` dates.
  2. `robots.txt` allows public marketing paths, disallows `/admin` and `/dashboard`, and references the dynamic sitemap URL at `SITE_URL`.

**Plans**: 3 plans

Plans:
- [x] 13-01-PLAN.md — crawlPolicy + sitemapBuilder + GET /sitemap.xml
- [x] 13-02-PLAN.md — GET /robots.txt + remove static files + nginx/vite proxy
- [x] 13-03-PLAN.md — prerender-paths API + verify-phase13-crawl.mjs

### Phase 14: Build-Time Prerender

**Goal**: Non-JavaScript crawlers and social bots receive full HTML with baked meta for all indexable marketing routes.
**Depends on**: Phases 11, 13 (working `SeoHead`, crawl route list)
**Requirements**: CRAWL-04, CRAWL-05
**Success Criteria** (what must be TRUE):

  1. View Source on `/`, `/blog`, `/blog/:slug`, and `/events` shows title, description, canonical, and OG tags without executing client JS.
  2. Prerendered HTML matches the meta Helmet renders in development for the same URL.
  3. Build pipeline produces static HTML files for the public route allowlist (community only if product confirms indexing).

**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — prerender.mjs + puppeteer + build script
- [x] 14-02-PLAN.md — verify-phase14-prerender.mjs

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

**Plans**: 3 plans

Plans:
- [x] 15-01-PLAN.md — SEO tab, resolvePageSeo previews, SERP/social mocks (CMS-03, CMS-04)
- [x] 15-02-PLAN.md — POST /admin/og-image sharp pipeline + OgImageUpload (CMS-05)
- [x] 15-03-PLAN.md — web-vitals RUM + GSC help + verify-phase15-gsc.mjs (MSMT-01, PERF-04)

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

**Plans**: 1 plan (inline execution)

Plans:
- [x] 16-SUMMARY.md — tokens, fontsource, motion, lazy GSAP, CLS, Radix modals

**UI hint**: yes

## Progress

**Execution order (v1.2):** 17 → 18 → 19 → 20 → 21 → 22 → 23  
*(Phase 23 execution fits after admin preview is verified; token contract from Phase 18.)*

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 17. Navbar & Landing Hero (First) | v1.2 | 0/TBD | Not started | - |
| 18. Token Foundation & Theme Architecture | v1.2 | 0/TBD | Not started | - |
| 19. Shared UI Primitives | v1.2 | 0/TBD | Not started | - |
| 20. Public Surface Polish | v1.2 | 0/TBD | Not started | - |
| 21. Motion, Glass & CWV Guardrails | v1.2 | 0/TBD | Not started | - |
| 22. Admin Parity & Preview | v1.2 | 0/TBD | Not started | - |
| 23. Prerender & Infra Hardening | v1.2 | 0/TBD | Not started | - |

**v1.2 requirement coverage:** 50/50 mapped ✓

<details>
<summary>v1.1 Progress (complete)</summary>

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. SEO Data Model & Site URL Contract | v1.1 | 3/3 | Complete | 2026-05-19 |
| 11. Per-Route Head Management | v1.1 | 3/3 | Complete | 2026-05-19 |
| 12. Structured Data & Semantic HTML | v1.1 | 4/4 | Complete | 2026-05-19 |
| 13. Crawl Policy & Dynamic Sitemap | v1.1 | 3/3 | Complete | 2026-05-19 |
| 14. Build-Time Prerender | v1.1 | 2/2 | Complete | 2026-05-19 |
| 15. Admin SEO Tools & Measurement | v1.1 | 3/3 | Complete | 2026-05-19 |
| 16. Premium UI & Core Web Vitals | v1.1 | 1/1 | Complete | 2026-05-19 |

</details>

---
*Roadmap updated: 2026-05-19 — v1.2 Phases 17–23; Phase 17 navbar + hero first; v1.1 complete*
