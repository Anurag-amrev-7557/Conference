---
phase: 10-seo-data-model-site-url-contract
plan: 01
subsystem: seo
tags: [SITE_URL, CRAWL-01, siteUrl, api]

requires: []
provides:
  - server/src/lib/siteUrl.ts (getSiteUrl, absoluteUrl)
  - src/seo/siteUrl.ts (setSiteOrigin, client absoluteUrl)
  - siteUrl on GET /api/v1/content/site
  - Production fail-fast for missing/invalid SITE_URL

key-files:
  created:
    - server/src/lib/siteUrl.ts
    - src/seo/siteUrl.ts
  modified:
    - server/src/index.ts
    - server/src/routes/contentRoutes.ts
    - server/.env.example
    - src/components/WebsiteDataProvider.tsx

requirements-completed: [CRAWL-01]

retroactive_commit: 77bf268
---

## One-liner

SITE_URL is the single public-site origin with server fail-fast, API `siteUrl` exposure, and client `setSiteOrigin` hydration — no VITE_SITE_URL.

## Self-Check: PASSED

- `cd server && npm run build` — pass
- `getSiteUrl()` called at boot in `server/src/index.ts`
- `fetchSitePayload()` includes `siteUrl: getSiteUrl()`
- `WebsiteDataProvider` calls `setSiteOrigin(site.siteUrl)`

## Deviations

Tracked retroactively: implementation landed in monolithic `feat(10): SEO data model and SITE_URL contract` before per-plan SUMMARY files.
