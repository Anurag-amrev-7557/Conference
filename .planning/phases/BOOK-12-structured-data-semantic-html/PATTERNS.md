# Phase 12 — Pattern Map

## Closest analogs

| New artifact | Closest existing | Action |
|--------------|------------------|--------|
| `JsonLd.tsx` | `src/seo/SeoHead.tsx` | Same Helmet presenter pattern |
| `jsonLdConfig.ts` | `src/seo/seoConfig.ts` | Pure resolver, no React imports |
| `usePageJsonLd.ts` | `src/seo/usePageSeo.ts` | useLocation + useWebsiteData |
| `settings.book` admin | `SettingsManager` SEO tab | Same field/help styling as Phase 10/11 |
| Event ISO fields | `Article` SEO fields in Prisma | Migration + EventManager inputs |

## Conventions to follow

- Mount `JsonLd` immediately after `SeoHead` in page fragment root
- All URLs via `absoluteUrl()` from `src/seo/siteUrl.ts`
- Zod: extend content patch with `settings.book` object schema (https URLs for cover)
- Vitest: `src/seo/*.test.ts` pattern from Phase 11
