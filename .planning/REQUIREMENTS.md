# Requirements: Book Website

**Defined:** 2026-05-20
**Milestone:** v1.4 Book Production & CMS Command Center (active) · v1.3 Marketing Integration (paused) · v1.2 Apple-Grade (archived planning) · v1.1 shipped (Phases 10–16)
**Core Value:** Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure, marketing intelligence, and live content controls.

## v1.1 Requirements

### Per-Route Meta & Head Management

- [x] **META-01**: Each public route (`/`, `/blog`, `/blog/:slug`, `/events`, `/community`) renders unique title and meta description in document head
- [x] **META-02**: Each public route renders a canonical link matching `SITE_URL` and the current path
- [x] **META-03**: Each public route renders Open Graph tags (type, title, description, image, url) appropriate to page content
- [x] **META-04**: Each public route renders Twitter card tags consistent with Open Graph data
- [x] **META-05**: Admin and dashboard routes include `noindex` robots directive and are excluded from sitemap
- [x] **META-06**: Static `index.html` contains only minimal shell fallbacks; no duplicate canonical/OG that conflict with per-route head

### Crawl Infrastructure

- [x] **CRAWL-01**: `SITE_URL` environment variable is the single source of truth for absolute URLs in canonical, OG, sitemap, and JSON-LD
- [ ] **CRAWL-02**: `GET /sitemap.xml` generates XML dynamically from published articles and events with accurate `lastmod`
- [ ] **CRAWL-03**: `robots.txt` allows public marketing paths, disallows `/admin` and `/dashboard`, and references the dynamic sitemap URL
- [x] **CRAWL-04**: Build-time prerender produces static HTML for `/`, `/blog`, `/blog/:slug`, `/events` (community excluded per D-15)
- [x] **CRAWL-05**: Prerendered pages include baked meta tags visible in View Source (not only post-hydration DOM)

### Structured Data & Semantics

- [ ] **SCHEMA-01**: Landing page includes `WebSite` and `Organization` JSON-LD derived from CMS settings
- [ ] **SCHEMA-02**: Landing page includes `Book` JSON-LD with title, author, cover image, and ISBN when provided in CMS
- [ ] **SCHEMA-03**: Each blog post page includes `BlogPosting` JSON-LD matching visible article content
- [ ] **SCHEMA-04**: Blog post and events pages include `BreadcrumbList` JSON-LD reflecting navigation hierarchy
- [ ] **SCHEMA-05**: Published events include `Event` JSON-LD with machine-readable ISO start dates
- [ ] **SCHEMA-06**: Public pages pass semantic audit: one `h1`, logical heading order, landmark regions, non-empty image `alt` on key images

### Admin SEO Tools

- [x] **CMS-01**: `Article` model stores `seoTitle`, `seoDescription`, `ogImage`, and `noindex` with API and admin UI
- [x] **CMS-02**: Global `settings.seo` supports `ogImage` and `googleSiteVerification` fields editable in admin
- [ ] **CMS-03**: BlogManager exposes per-article SEO tab with fallback chain (override → title/excerpt → site defaults)
- [ ] **CMS-04**: Admin displays SERP and social snippet preview using the same meta fields as the live site
- [ ] **CMS-05**: OG image uploads are resized server-side to 1200×630 via sharp before storage/serving

### Premium UI & UX

- [ ] **UX-01**: Design tokens (spacing, radius, shadow, typography) are formalized and applied consistently across public sections
- [ ] **UX-02**: Critical fonts are self-hosted (fontsource) to improve LCP and reduce layout shift from webfont loading
- [ ] **UX-03**: Motion and animations respect `prefers-reduced-motion` and avoid layout-affecting properties on critical path
- [ ] **UX-04**: Landing, blog, events, and community flows receive premium visual polish (hierarchy, spacing, CTAs)
- [ ] **UX-05**: Interactive overlays use accessible Radix dialog patterns where modals are required
- [x] **UX-06**: Mobile viewports pass responsive review: no horizontal scroll, 44px touch targets, readable type scale

### Performance & Core Web Vitals

- [ ] **PERF-01**: LCP element on landing and blog is not delayed by opacity-zero or off-screen animation on first paint
- [ ] **PERF-02**: Three.js and heavy GSAP sequences are lazy-loaded or restricted to below-fold/landing-only contexts
- [ ] **PERF-03**: Above-fold images specify width/height or aspect-ratio to prevent cumulative layout shift
- [ ] **PERF-04**: `web-vitals` reports LCP, INP, and CLS to existing telemetry in production

### Measurement

- [ ] **MSMT-01**: Google Search Console verification meta tag is injectable from admin settings and appears in prerendered HTML

## v1.2 Requirements — Apple-Grade Premium Experience

**Focus:** Sitewide premium UI/UX and responsiveness; **Phase 17 ships navbar + landing hero first**, then theme tokens, primitives, remaining surfaces, motion/CWV, admin parity, prerender.

### Global navigation (first)

- [ ] **NAV-01**: Visitor sees a premium global header on desktop (clear logo lockup, primary destinations, optional primary CTA) with calm spacing and no visual clutter at `xl` widths
- [ ] **NAV-02**: Visitor can operate all header links and controls with keyboard only, with visible `focus-visible` rings and a sensible tab order (including mobile menu trigger)
- [ ] **NAV-03**: Visitor on phone and tablet gets touch targets ≥44px for menu trigger and primary actions; expanded navigation is usable without introducing horizontal page scroll
- [ ] **NAV-04**: Visitor using skip links or in-page anchors is not permanently obscured by sticky/fixed header chrome (offset or scroll-padding strategy)
- [ ] **NAV-05**: Visitor with `prefers-reduced-motion: reduce` sees minimal or no animated open/close for the mobile navigation layer
- [ ] **NAV-06**: Visitor on viewports from 320px through ultra-wide sees no broken overflow, clipped text, or overlapping layers in the header region

### Landing hero (first)

- [ ] **HERO-01**: Visitor sees hero headline and supporting copy at WCAG-compliant contrast on current light/dark backgrounds
- [ ] **HERO-02**: Visitor’s LCP element in the hero is visible on first paint (no opacity-zero or animation-delay gating on primary headline); hero media uses dimensions or `aspect-ratio` to avoid CLS
- [ ] **HERO-03**: Visitor on touch devices can tap primary hero CTAs comfortably (≥44px height) with clear hover/focus/active states on pointer devices
- [ ] **HERO-04**: Visitor sees balanced whitespace and readable type scale as the hero reflows across `sm` / `md` / `lg` / `xl` breakpoints
- [ ] **HERO-05**: Visitor is not blocked by decorative layers (gradients, mesh, optional 3D) from reading the hero message; heavy effects remain non-LCP or below the fold per prior CWV decisions
- [ ] **HERO-06**: Visitor sees CMS-driven hero title, subtitle, imagery, and CTAs without layout thrash when content hydrates

### Design system & theme architecture

- [ ] **DSM-01**: Visitor with OS dark preference sees appropriate dark neutrals on first paint without a full-screen flash of the wrong theme before hydration
- [ ] **DSM-02**: Visitor can persist light, dark, or system appearance; choice survives reload and does not fight CMS accent/font settings
- [ ] **DSM-03**: Editor can set site `colorScheme` (`light` \| `dark` \| `system`) in Design System admin; published site reflects it via `applyAppearance()`
- [ ] **DSM-04**: Public layouts use semantic surfaces (`bg-bg`, `bg-surface`, `text-text`, borders) instead of hardcoded light-only colors on body and section shells
- [ ] **DSM-05**: Dividers, rings, and subtle borders use tokenized colors in both themes
- [ ] **DSM-06**: Glass, blur, and translucent layers read from semantic tokens in light and dark variants with acceptable contrast
- [ ] **DSM-07**: Accent and CTA colors from CMS remain legible and on-brand in both themes (contrast sanity)

### Shared UI primitives

- [ ] **COMP-01**: Visitor sees one consistent primary/secondary/ghost button treatment (shared primitive / CVA) on landing CTAs, forms, and modals
- [ ] **COMP-02**: Visitor using keyboard or screen reader gets consistent `focus-visible` treatment on buttons, links styled as buttons, inputs, selects, and textareas
- [ ] **COMP-03**: Visitor sees cards, lists, chips, and badges on a clear three-level elevation ladder that reads correctly in dark mode
- [ ] **COMP-04**: Visitor opening a modal gets theme-aware overlay and panel; with reduced motion, dismiss is effectively instant
- [ ] **COMP-05**: Visitor experiences premium navigation chrome (blur, hairline borders) that matches the active theme and does not rely on hover-only critical affordances
- [ ] **TYPE-01**: Visitor reads headings and UI copy on a single documented type scale (fluid display where appropriate, fixed steps for UI chrome)
- [ ] **TYPE-02**: Public marketing UI uses only **Instrument Serif** and **Plus Jakarta Sans** for display and body/UI (no third competing display face)

### Public surfaces (after primitives)

- [ ] **PAGE-01**: Visitor on `/` sees cohesive sections (below hero) using shared rhythm, tokens, and imagery discipline
- [ ] **PAGE-02**: Visitor on `/blog` and `/blog/:slug` sees premium list/detail layouts, comfortable prose width (~65ch), and related/CTA blocks with correct heading hierarchy
- [ ] **PAGE-03**: Visitor on `/events` sees map, cards, and detail states at the same quality bar in light and dark
- [ ] **PAGE-04**: Visitor on `/community` sees feed, composer, modals, and detail views matching the public marketing polish
- [ ] **PAGE-05**: Visitor on unknown URLs sees an on-brand minimal 404 with a clear escape CTA built from shared primitives
- [ ] **TYPE-03**: Visitor scrolling public routes sees consistent section rhythm (`section-public` / `section-inner`), eyebrow text, and heading scale
- [ ] **TYPE-04**: Visitor sees consistent vertical rhythm between headings, body, and CTAs within long-form and marketing blocks
- [ ] **IMG-01**: Visitor sees hero and card imagery without cumulative layout shift (explicit dimensions or aspect boxes)
- [ ] **IMG-02**: Visitor in dark mode can still parse book cover, avatars, and key photography without muddy gray-on-gray
- [ ] **IMG-03**: Visitor previewing shares gets OG imagery that remains legible at social crop sizes
- [ ] **IMG-04**: Visitor benefits from responsive image selection or art direction where the design specifies multiple breakpoints

### Motion, glass & CWV guardrails

- [ ] **MOT-01**: Visitor with `prefers-reduced-motion: reduce` sees no scroll-jank reveals, no custom cursor or magnetic hover effects, and instant modal dismissal
- [ ] **MOT-02**: Visitor with motion allowed sees scroll-driven reveals only below the fold, once per element, using transform/opacity — never on the LCP hero
- [ ] **MOT-03**: Visitor sees backdrop blur capped: at most one strong above-the-fold blur layer; low-end or reduced-motion users get solid fallbacks
- [ ] **MOT-04**: Visitor on mobile is not burdened by default custom cursor or magnetic pull effects
- [ ] **CWV-01**: Lighthouse performance and accessibility on landing and blog do not regress versus the v1.1 Phase 16 baseline
- [ ] **CWV-02**: Production RUM still reports LCP, INP, and CLS via `web-vitals` after UI changes
- [ ] **CWV-03**: CI or local verify can capture Playwright snapshots (or equivalent) for landing, blog, and admin preview in light and dark

### Admin parity & preview

- [ ] **ADM-01**: Editor sees admin chrome (layout, sidebar, tables) on the same semantic tokens as the public site (density utilities allowed)
- [ ] **ADM-02**: Editor uses blog, events, pages, community, and settings managers with the same `Input`, `Button`, and card primitives as the public site
- [ ] **ADM-03**: Editor previews light, dark, and system appearances accurately in Design System before publish (`previewData` / `applyAppearance()`)
- [ ] **ADM-04**: Editor LivePreview reflects theme changes without duplicating divergent theme logic from production
- [ ] **TYPE-05**: Editor UI respects the same type scale rules where it surfaces public-facing previews
- [ ] **COMP-06**: Editor-facing destructive or irreversible actions use the same dialog primitive and focus trap behavior as the public site

### Prerender & infra hardening

- [ ] **INFRA-01**: Visitor viewing View Source on prerendered routes sees critical `:root` semantic tokens and correct `color-scheme` without executing client JS
- [ ] **INFRA-02**: Build or verify scripts fail when prerendered HTML is missing expected semantic token hooks or theme contract classes

## v2 Requirements

Deferred enhancements beyond v1.2 roadmap scope.

### International & Discovery

- **I18N-01**: hreflang tags and locale-specific URLs for multi-language content
- **I18N-02**: IndexNow ping on article publish for faster Bing discovery

### Advanced SEO

- **SEO-ADV-01**: Author profile pages (`/author`) with Person schema
- **SEO-ADV-02**: FAQ / HowTo structured data for landing Q&A sections

### v1.0 Deferred (prior milestone)

- Production infra (INFRA-*), RBAC, chat, payments, mobile — see archived v1.0 requirements in git history

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full SSR / Next.js migration | Research recommends prerender on existing Vite SPA; rewrite cost exceeds v1.1 value |
| Keyword meta tag field | Google ignores; encourages stuffing |
| Indexing all community UGC | Brand SEO risk; default noindex unless explicitly required |
| Auto-generated tag archive pages | Thin duplicate content risk |
| Heavy 3D hero on every page | CWV regression; landing-only per research |
| hreflang | No bilingual content in v1.1 |

## v1.4 Requirements — Book Production & CMS Command Center

**Focus:** Production SEO, complete admin CMS for visitor-visible content, release validation. Marketing stack deferred.

### SEO production (SEO-01 … SEO-07)

- [x] **SEO-01:** `SITE_URL` required and documented in Compose, Docker, and `docs/deployment.md`
- [x] **SEO-02:** `/events/:id` included in sitemap and prerender path list when published
- [x] **SEO-03:** Production Docker/CI build reliably produces or skips prerender (`PRERENDER_SKIP` or staged API+DB build)
- [x] **SEO-04:** Documented procedure to re-run prerender after blog/event/global SEO publish
- [x] **SEO-05:** Per-route default title/description/OG editable in admin (backed by `SiteContent`, not only `routes.ts`)
- [x] **SEO-06:** Premium social cards (`og:site_name`, locale, `twitter:site` where applicable)
- [ ] **SEO-07:** Prerendered HTML reflects published appearance tokens where feasible (deferred — client theme injection; document in runbook)

### Admin command center (ADM-05 … ADM-14)

- [x] **ADM-05:** Landing section copy (hero incl. tagline + CTAs, who-we-are headers, community block, final CTA) editable and persisted
- [x] **ADM-06:** Catalog heroes for `/blog` and `/events` editable (eyebrow, title, lede)
- [x] **ADM-07:** Section visibility toggles match what `LandingPage` renders
- [x] **ADM-08:** Central **Media** manager for OG, covers, thumbnails, reusable image URLs
- [x] **ADM-09:** Navigation, footer links, social URLs, primary CTA CMS-driven without public `config.ts` fallbacks
- [x] **ADM-10:** Header/footer custom scripts injected safely on publish
- [x] **ADM-11:** Blog editor: preview, SEO tab, publish workflow, category alignment (existing BlogManager + ArticleSeoTab)
- [x] **ADM-12:** Events: per-event SEO fields + admin form parity with public detail page
- [x] **ADM-13:** Community admin: comment delete, optional post edit, moderation UX
- [x] **ADM-14:** Orphan admin components removed or consolidated into PageEditor/Settings

### Production release (REL-05 … REL-08)

- [x] **REL-05:** Deploy runbook covers admin bootstrap, `JWT_SECRET`, `SITE_URL`, prerender, credential rotation
- [x] **REL-06:** Automated smoke checks: public routes, sitemap/robots, admin login, content PATCH round-trip
- [x] **REL-07:** `REQUIREMENTS.md` checkboxes synced with shipped v1.1 + v1.4 work
- [x] **REL-08:** Production password not left at seed default without explicit dev-only guard (documented in runbook)

## v1.3 Requirements — Marketing Integration & Admin Production Readiness (paused)

**Focus:** Production readiness for the marketing backend/frontend, book website integration with marketing services, and admin customization parity for live content control.

### Marketing stack production readiness

- [ ] **MKT-01**: Marketing backend exposes stable production routes for webhook ingestion, event capture, email-agent processing, and health checks with explicit env configuration
- [ ] **MKT-02**: Marketing frontend builds and serves correctly under the `/marketing` base path with a configurable API URL and no asset or routing breakage in production
- [ ] **MKT-03**: Marketing deployment docs and env examples describe production hostnames, origins, and local development overrides without leaking dev-only assumptions into release notes
- [ ] **MKT-04**: Marketing backend and marketing frontend have repeatable smoke checks that confirm the primary lead-intake and orchestration flows still work after deploy

### Book-to-marketing integration

- [ ] **INT-01**: Book website telemetry, lead capture, and support/email-agent requests use the book server proxy instead of shipping marketing secrets to the browser
- [ ] **INT-02**: Book server forwards `/api/v1/marketing/webhook` and `/api/v1/marketing/email-agent/process` to the marketing backend with the expected payload, headers, and error handling
- [ ] **INT-03**: Visitor identity and engagement tracking remain stable across page views, CTA clicks, and form submissions so the marketing backend can merge lead context reliably
- [ ] **INT-04**: Book site, book server, and marketing backend share the same production origin and CORS contract, with no mismatched hostnames or path prefixes in release configs

### Admin customization parity

- [ ] **ADM-01**: Admin users can customize page sections, components, and copy across public routes without losing persisted data or breaking the current schema
- [ ] **ADM-02**: Admin users can adjust global colors, typography, layout spacing, and custom CSS through the CMS with preview-first behavior before publish
- [ ] **ADM-03**: Live preview reflects page and style edits closely enough that editors can trust it as the pre-publish source of truth
- [ ] **ADM-04**: Admin customization surfaces remain accessible and responsive, including focus states, inputs, dialogs, and any destructive actions needed for content management

### Release validation

- [ ] **REL-01**: Release verification covers the integrated book site, book server, marketing backend, and marketing frontend with build and smoke checks
- [ ] **REL-02**: The end-to-end lead path from public CTA to marketing backend capture and follow-up is verified before release
- [ ] **REL-03**: Deployment docs capture required env vars, hostnames, base paths, and rollback notes for the combined stack
- [ ] **REL-04**: Production readiness checks can be repeated by another operator without relying on hidden local setup knowledge

## Traceability

### v1.4 (active)

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEO-01 … SEO-06 | Phase 28 | Shipped |
| SEO-07 | Phase 31 | Partial |
| ADM-05 … ADM-07, ADM-09, SEO-05 | Phase 29 | Shipped |
| ADM-08, ADM-10 … ADM-14 | Phase 30 | Shipped |
| REL-05 … REL-08 | Phase 31 | Shipped |

### v1.3 (paused)

| Requirement | Phase | Status |
|-------------|-------|--------|
| MKT-01 … MKT-04 | Phase 24 | Deferred |
| INT-01 … INT-04 | Phase 25 | Deferred |
| ADM-01 … ADM-04 | Phase 26 | Deferred |
| REL-01 … REL-04 | Phase 27 | Deferred |

### v1.2 (archived planning)

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 17 | Pending |
| NAV-02 | Phase 17 | Pending |
| NAV-03 | Phase 17 | Pending |
| NAV-04 | Phase 17 | Pending |
| NAV-05 | Phase 17 | Pending |
| NAV-06 | Phase 17 | Pending |
| HERO-01 | Phase 17 | Pending |
| HERO-02 | Phase 17 | Pending |
| HERO-03 | Phase 17 | Pending |
| HERO-04 | Phase 17 | Pending |
| HERO-05 | Phase 17 | Pending |
| HERO-06 | Phase 17 | Pending |
| DSM-01 | Phase 18 | Pending |
| DSM-02 | Phase 18 | Pending |
| DSM-03 | Phase 18 | Pending |
| DSM-04 | Phase 18 | Pending |
| DSM-05 | Phase 18 | Pending |
| DSM-06 | Phase 18 | Pending |
| DSM-07 | Phase 18 | Pending |
| COMP-01 | Phase 19 | Pending |
| COMP-02 | Phase 19 | Pending |
| COMP-03 | Phase 19 | Pending |
| COMP-04 | Phase 19 | Pending |
| COMP-05 | Phase 19 | Pending |
| TYPE-01 | Phase 19 | Pending |
| TYPE-02 | Phase 19 | Pending |
| PAGE-01 | Phase 20 | Pending |
| PAGE-02 | Phase 20 | Pending |
| PAGE-03 | Phase 20 | Pending |
| PAGE-04 | Phase 20 | Pending |
| PAGE-05 | Phase 20 | Pending |
| TYPE-03 | Phase 20 | Pending |
| TYPE-04 | Phase 20 | Pending |
| IMG-01 | Phase 20 | Pending |
| IMG-02 | Phase 20 | Pending |
| IMG-03 | Phase 20 | Pending |
| IMG-04 | Phase 20 | Pending |
| MOT-01 | Phase 21 | Pending |
| MOT-02 | Phase 21 | Pending |
| MOT-03 | Phase 21 | Pending |
| MOT-04 | Phase 21 | Pending |
| CWV-01 | Phase 21 | Pending |
| CWV-02 | Phase 21 | Pending |
| CWV-03 | Phase 21 | Pending |
| ADM-01 | Phase 22 | Pending |
| ADM-02 | Phase 22 | Pending |
| ADM-03 | Phase 22 | Pending |
| ADM-04 | Phase 22 | Pending |
| TYPE-05 | Phase 22 | Pending |
| COMP-06 | Phase 22 | Pending |
| INFRA-01 | Phase 23 | Pending |
| INFRA-02 | Phase 23 | Pending |

### v1.1 (shipped)

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRAWL-01 … PERF-03 | Phases 10–16 | See git history / phase summaries |

**Coverage:**
- v1.4 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-20*
*Last updated: 2026-05-21 — v1.4 book production active; v1.3 paused*
