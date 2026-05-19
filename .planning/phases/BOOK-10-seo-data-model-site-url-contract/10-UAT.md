---
status: complete
phase: 10-seo-data-model-site-url-contract
source:
  - .planning/ROADMAP.md (Phase 10 success criteria)
  - .planning/phases/BOOK-10-seo-data-model-site-url-contract/10-CONTEXT.md
started: 2026-05-19T12:00:00Z
updated: 2026-05-19T13:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: With no server running, start the API from a clean state (npm run dev in server/). The process boots without errors. GET http://localhost:3001/api/v1/content/site returns JSON including siteUrl (non-empty https origin) and settings.seo with ogImage and googleSiteVerification keys.
result: pass

### 2. SITE_URL on content API
expected: GET /api/v1/content/site responds with siteUrl equal to the configured SITE_URL env (no trailing slash). Example when SITE_URL=https://monograph.superhumanly.ai the field is exactly that origin.
result: pass

### 3. Per-article SEO in admin and API
expected: In Admin → Blog, editing an article shows Search & Social fields (SEO Title, SEO Description, OG Image URL, noindex toggle). Saving persists values; reloading the editor or GET /api/v1/content/articles shows the same seoTitle, seoDescription, ogImage, and noindex.
result: pass

### 4. Global SEO settings in admin and API
expected: In Admin → Settings → SEO tab, fields for Default Open Graph Image URL and Google Search Console Verification appear before Save SEO Strategy. Saving persists; GET /api/v1/content/site settings.seo includes ogImage and googleSiteVerification.
result: pass

### 5. SITE_URL contract for downstream phases
expected: Phase 10 does not yet change index.html canonical tags (Phase 11). Confirm server/.env.example documents SITE_URL and client has src/seo/siteUrl.ts fed from API siteUrl (no VITE_SITE_URL). After site loads, absoluteUrl('/blog/test') would use API-provided origin when wired in Phase 11+.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
