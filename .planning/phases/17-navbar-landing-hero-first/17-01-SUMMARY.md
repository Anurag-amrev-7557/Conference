# Plan 17-01 Summary

**Status:** Complete  
**Completed:** 2026-05-19

## What shipped

- Added `settings.navigation.primaryCta: { label, href }` to `SiteSettings` type and `initialData` defaults (`Join Now`, `/#final-cta`)
- Deep-merge `primaryCta` in `WebsiteDataProvider` when hydrating from API
- Admin Navigation tab: Primary CTA label + URL fields with helper microcopy
- Server seed updated with `primaryCta` default

## Files changed

- `src/lib/websiteData.ts`
- `src/components/WebsiteDataProvider.tsx`
- `src/components/admin/SettingsManager.tsx`
- `server/src/seed.ts`

## Verification

- `npm run build:no-prerender` passes
