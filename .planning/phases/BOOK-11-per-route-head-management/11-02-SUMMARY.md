---
phase: 11-per-route-head-management
plan: 02
subsystem: seo
tags: [react-helmet-async, per-route-seo, meta-tags, admin-copy]

requires:
  - phase: 11-01
    provides: SeoHead, usePageSeo, resolvePageSeo
provides:
  - SeoHead on all App.tsx routes (marketing, admin, dashboard, 404)
  - META-01–05 live head behavior after SPA navigation
  - Admin SEO help microcopy per 11-UI-SPEC

key-files:
  modified:
    - src/pages/LandingPage.tsx
    - src/pages/BlogPage.tsx
    - src/pages/BlogPostPage.tsx
    - src/pages/EventsPage.tsx
    - src/pages/CommunityPage.tsx
    - src/pages/AdminPage.tsx
    - src/pages/DashboardPage.tsx
    - src/pages/NotFoundPage.tsx
    - src/components/admin/BlogManager.tsx
    - src/components/admin/SettingsManager.tsx

requirements-completed: [META-01, META-02, META-03, META-04, META-05]

## One-liner

Wired `SeoHead` + `usePageSeo` on every route; BlogPostPage emits noindex before redirect; admin help copy reflects live head behavior.

## Self-Check: PASSED

- `npm run build` — pass
- All routes import SeoHead only (no direct Helmet)

## Deviations

None.

## Next

Plan 11-03 extends automated resolver tests (partially overlapped with 11-01 vitest bootstrap).
