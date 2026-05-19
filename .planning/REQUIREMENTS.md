# Requirements: Book Website

**Defined:** 2026-05-19  
**Milestone:** v1.1 Premium Presentation & SEO Dominance  
**Core Value:** Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure and marketing intelligence.

## v1.1 Requirements

### Per-Route Meta & Head Management

- [x] **META-01**: Each public route (`/`, `/blog`, `/blog/:slug`, `/events`, `/community`) renders unique title and meta description in document head
- [x] **META-02**: Each public route renders a canonical link matching `SITE_URL` and the current path
- [x] **META-03**: Each public route renders Open Graph tags (type, title, description, image, url) appropriate to page content
- [x] **META-04**: Each public route renders Twitter card tags consistent with Open Graph data
- [x] **META-05**: Admin and dashboard routes include `noindex` robots directive and are excluded from sitemap
- [x] **META-06**: Static `index.html` contains only minimal shell fallbacks; no duplicate canonical/OG that conflict with per-route head

### Crawl Infrastructure

- [ ] **CRAWL-01**: `SITE_URL` environment variable is the single source of truth for absolute URLs in canonical, OG, sitemap, and JSON-LD
- [ ] **CRAWL-02**: `GET /sitemap.xml` generates XML dynamically from published articles and events with accurate `lastmod`
- [ ] **CRAWL-03**: `robots.txt` allows public marketing paths, disallows `/admin` and `/dashboard`, and references the dynamic sitemap URL
- [ ] **CRAWL-04**: Build-time prerender produces static HTML for `/`, `/blog`, `/blog/:slug`, `/events` (and `/community` if indexed)
- [ ] **CRAWL-05**: Prerendered pages include baked meta tags visible in View Source (not only post-hydration DOM)

### Structured Data & Semantics

- [ ] **SCHEMA-01**: Landing page includes `WebSite` and `Organization` JSON-LD derived from CMS settings
- [ ] **SCHEMA-02**: Landing page includes `Book` JSON-LD with title, author, cover image, and ISBN when provided in CMS
- [ ] **SCHEMA-03**: Each blog post page includes `BlogPosting` JSON-LD matching visible article content
- [ ] **SCHEMA-04**: Blog post and events pages include `BreadcrumbList` JSON-LD reflecting navigation hierarchy
- [ ] **SCHEMA-05**: Published events include `Event` JSON-LD with machine-readable ISO start dates
- [ ] **SCHEMA-06**: Public pages pass semantic audit: one `h1`, logical heading order, landmark regions, non-empty image `alt` on key images

### Admin SEO Tools

- [ ] **CMS-01**: `Article` model stores `seoTitle`, `seoDescription`, `ogImage`, and `noindex` with API and admin UI
- [ ] **CMS-02**: Global `settings.seo` supports `ogImage` and `googleSiteVerification` fields editable in admin
- [ ] **CMS-03**: BlogManager exposes per-article SEO tab with fallback chain (override → title/excerpt → site defaults)
- [ ] **CMS-04**: Admin displays SERP and social snippet preview using the same meta fields as the live site
- [ ] **CMS-05**: OG image uploads are resized server-side to 1200×630 via sharp before storage/serving

### Premium UI & UX

- [ ] **UX-01**: Design tokens (spacing, radius, shadow, typography) are formalized and applied consistently across public sections
- [ ] **UX-02**: Critical fonts are self-hosted (fontsource) to improve LCP and reduce layout shift from webfont loading
- [ ] **UX-03**: Motion and animations respect `prefers-reduced-motion` and avoid layout-affecting properties on critical path
- [ ] **UX-04**: Landing, blog, events, and community flows receive premium visual polish (hierarchy, spacing, CTAs)
- [ ] **UX-05**: Interactive overlays use accessible Radix dialog patterns where modals are required
- [ ] **UX-06**: Mobile viewports pass responsive review: no horizontal scroll, 44px touch targets, readable type scale

### Performance & Core Web Vitals

- [ ] **PERF-01**: LCP element on landing and blog is not delayed by opacity-zero or off-screen animation on first paint
- [ ] **PERF-02**: Three.js and heavy GSAP sequences are lazy-loaded or restricted to below-fold/landing-only contexts
- [ ] **PERF-03**: Above-fold images specify width/height or aspect-ratio to prevent cumulative layout shift
- [ ] **PERF-04**: `web-vitals` reports LCP, INP, and CLS to existing telemetry in production

### Measurement

- [ ] **MSMT-01**: Google Search Console verification meta tag is injectable from admin settings and appears in prerendered HTML

## v2 Requirements

Deferred enhancements beyond v1.1 roadmap scope.

### International & Discovery

- **I18N-01**: hreflang tags and locale-specific URLs for multi-language content
- **I18N-02**: IndexNow ping on article publish for faster Bing discovery

### Advanced SEO

- **SEO-ADV-01**: Author profile pages (`/author`) with Person schema
- **SEO-ADV-02**: FAQ / HowTo structured data for landing Q&A sections

### v1.0 Deferred (prior milestone)

- Marketing integration (MKT-*), production infra (INFRA-*), RBAC, chat, payments — see archived v1.0 requirements in git history

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full SSR / Next.js migration | Research recommends prerender on existing Vite SPA; rewrite cost exceeds v1.1 value |
| Keyword meta tag field | Google ignores; encourages stuffing |
| Indexing all community UGC | Brand SEO risk; default noindex unless explicitly required |
| Auto-generated tag archive pages | Thin duplicate content risk |
| Heavy 3D hero on every page | CWV regression; landing-only per research |
| hreflang | No bilingual content in v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRAWL-01 | Phase 10 | Pending |
| CMS-01 | Phase 10 | Pending |
| CMS-02 | Phase 10 | Pending |
| META-01 | Phase 11 | Complete |
| META-02 | Phase 11 | Complete |
| META-03 | Phase 11 | Complete |
| META-04 | Phase 11 | Complete |
| META-05 | Phase 11 | Complete |
| META-06 | Phase 11 | Complete |
| SCHEMA-01 | Phase 12 | Pending |
| SCHEMA-02 | Phase 12 | Pending |
| SCHEMA-03 | Phase 12 | Pending |
| SCHEMA-04 | Phase 12 | Pending |
| SCHEMA-05 | Phase 12 | Pending |
| SCHEMA-06 | Phase 12 | Pending |
| CRAWL-02 | Phase 13 | Pending |
| CRAWL-03 | Phase 13 | Pending |
| CRAWL-04 | Phase 14 | Pending |
| CRAWL-05 | Phase 14 | Pending |
| CMS-03 | Phase 15 | Pending |
| CMS-04 | Phase 15 | Pending |
| CMS-05 | Phase 15 | Pending |
| MSMT-01 | Phase 15 | Pending |
| PERF-04 | Phase 15 | Pending |
| UX-01 | Phase 16 | Pending |
| UX-02 | Phase 16 | Pending |
| UX-03 | Phase 16 | Pending |
| UX-04 | Phase 16 | Pending |
| UX-05 | Phase 16 | Pending |
| UX-06 | Phase 16 | Pending |
| PERF-01 | Phase 16 | Pending |
| PERF-02 | Phase 16 | Pending |
| PERF-03 | Phase 16 | Pending |

**Coverage:**
- v1.1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0

---
*Requirements defined: 2026-05-19*  
*Last updated: 2026-05-19 after v1.1 roadmap traceability*
