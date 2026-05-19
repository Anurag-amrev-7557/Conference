---
phase: 11-per-route-head-management
plan: 01
subsystem: seo
tags: [react-helmet-async, vitest, seo, meta-tags, helmet]

requires:
  - phase: 10-seo-data-model-site-url-contract
    provides: siteUrl.ts, Article SEO fields, setSiteOrigin from WebsiteDataProvider
provides:
  - react-helmet-async HelmetProvider shell in main.tsx
  - Pure resolvePageSeo pipeline in src/seo/
  - SeoHead and usePageSeo for per-route wiring in plan 02
  - Minimal index.html shell (META-06)
  - Default public/og-image.jpg fallback asset
affects:
  - 11-02 (wire SeoHead on pages)
  - 11-03 (verification)
  - phase-13-sitemap
  - phase-14-prerender

tech-stack:
  added: [react-helmet-async@3.0.0, vitest]
  patterns: [pure resolver + Helmet presenter, HelmetProvider outside Router]

key-files:
  created:
    - src/seo/types.ts
    - src/seo/routes.ts
    - src/seo/seoConfig.ts
    - src/seo/SeoHead.tsx
    - src/seo/usePageSeo.ts
    - src/seo/seoConfig.test.ts
    - public/og-image.jpg
  modified:
    - package.json
    - src/main.tsx
    - src/App.tsx
    - index.html
    - vite.config.ts

key-decisions:
  - "Lifted WebsiteDataProvider to main.tsx under HelmetProvider per D-01"
  - "Admin SEO title uses 'Admin — {site.title}' with noindex and no GSC tag"
  - "Vitest added for resolvePageSeo unit coverage (recommended in research)"

patterns-established:
  - "Pattern: resolvePageSeo (pure) → SeoHead (Helmet) → usePageSeo (hook)"
  - "Pattern: routeDefaults registry for static marketing paths"

requirements-completed: [META-06]

duration: 35min
completed: 2026-05-19
---

# Phase 11 Plan 01: SEO Foundation Summary

**react-helmet-async shell, pure resolvePageSeo pipeline, and META-06 minimal index.html without competing global SEO**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-05-19T06:03:00Z
- **Completed:** 2026-05-19T06:38:00Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments

- Installed `react-helmet-async@3.0.0` and mounted `HelmetProvider` → `WebsiteDataProvider` → `App` in `main.tsx`
- Built `src/seo/` module: `resolvePageSeo`, `normalizeCanonicalPath`, `resolveImageUrl`, `SeoHead`, `usePageSeo`, `routes.ts` registry
- Removed `ThemeSynchronizer` document.title/meta description updates; trimmed `index.html` duplicate OG/Twitter/canonical
- Added `public/og-image.jpg` (1200×630) for `absoluteUrl('/og-image.jpg')` fallback

## Task Commits

1. **Task 1: Install react-helmet-async and mount provider shell** - `7eb5806` (feat)
2. **Task 2: Create src/seo core module** - `1fdb6b0` (test), `a829e50` (feat)
3. **Task 3: Strip ThemeSynchronizer SEO, trim index.html, add default OG asset** - `c06b694` (feat)

**Plan metadata:** pending (docs commit after this file)

## Files Created/Modified

- `src/seo/seoConfig.ts` - Pure route/article/admin/community resolver (no React imports)
- `src/seo/SeoHead.tsx` - Single Helmet tag emitter (text props only, no dangerouslySetInnerHTML)
- `src/seo/usePageSeo.ts` - Hook combining location, website data, optional article
- `src/seo/routes.ts` - `routeDefaults`, `PUBLIC_ROUTE_PATHS`, path helpers
- `src/main.tsx` - HelmetProvider + WebsiteDataProvider shell
- `index.html` - Charset, viewport, favicon, neutral title/description only

## Decisions Made

- Lifted `WebsiteDataProvider` to `main.tsx` per D-01 (single provider, Helmet outside Router)
- Seeded distinct `routeDefaults` titles for `/`, `/blog`, `/events`, `/community`
- Added Vitest for `resolvePageSeo` behavior coverage (8 tests)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- npm cache permission error on vitest install — resolved using `--cache /tmp/npm-cache-book`
- `index.html` root element typo during edit — corrected via Python rewrite

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 11-02 can wire `<SeoHead seo={usePageSeo(...)} />` on each page component
- `resolvePageSeo` and `usePageSeo` ready; pages not yet mounting SeoHead (intentional for plan 01 scope)

---
*Phase: 11-per-route-head-management*
*Completed: 2026-05-19*

## Self-Check: PASSED

- FOUND: src/seo/seoConfig.ts
- FOUND: src/seo/SeoHead.tsx
- FOUND: src/seo/usePageSeo.ts
- FOUND: public/og-image.jpg
- FOUND: 7eb5806
- FOUND: 1fdb6b0
- FOUND: a829e50
- FOUND: c06b694
