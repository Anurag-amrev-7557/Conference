# Phase 12: Structured Data & Semantic HTML - Research

**Researched:** 2026-05-19  
**Domain:** JSON-LD structured data (`schema-dts`), CMS book metadata, Event ISO dates, semantic HTML audit  
**Confidence:** HIGH (CONTEXT locked + Phase 11 `src/seo/` foundation)

## Summary

Phase 12 extends the Phase 11 `src/seo/` module with pure JSON-LD builders and a `JsonLd` Helmet presenter emitting one `application/ld+json` script per page with an `@graph` array. Book bibliographic data lives in `settings.book` (JSON blob, no new Prisma table). Event schema requires Prisma `startDate`/`endDate` columns — display strings remain for UI. Semantic fixes target indexable marketing routes only.

**Primary recommendation:** Wave 1 data model → Wave 2 builders + JsonLd → Wave 3 page wiring + admin → Wave 4 semantic audit + vitest. Reuse `absoluteUrl()` for every URL field; omit schemas when data is missing (no empty Book/Event nodes).

## Phase Requirements

| ID | Research Support |
|----|------------------|
| SCHEMA-01 | `buildWebSiteSchema` + `buildOrganizationSchema` from `settings.seo` + `appearance` on `/` |
| SCHEMA-02 | `settings.book` CMS + `buildBookSchema`; emit only when title/author/isbn/cover present |
| SCHEMA-03 | `buildBlogPostingSchema` on `/blog/:slug`; skip if unpublished/noindex |
| SCHEMA-04 | `buildBreadcrumbSchema` on blog post, blog index, events listing |
| SCHEMA-05 | Event `startDate` migration + `buildEventSchema` per published event on `/events` |
| SCHEMA-06 | h1/landmark/alt audit on `/`, `/blog`, `/blog/:slug`, `/events` |

## Standard Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **schema-dts** | **2.0.0** | Compile-time JSON-LD types (devDependency) |
| **react-helmet-async** | 3.0.0 (installed) | Inject JSON-LD script tag |
| **vitest** | 4.x (installed) | Unit tests for pure builders |

## Architecture

```
resolvePageJsonLd({ pathname, data, article?, events? })
  → WithContext<Thing>[] 
  → JsonLd renders <script type="application/ld+json">{@graph}</script>
```

Mirror `resolvePageSeo` pattern: pure functions in `src/seo/jsonLdConfig.ts`, hook `usePageJsonLd`, presenter `JsonLd.tsx`.

## Pitfalls

| Pitfall | Mitigation |
|---------|------------|
| Duplicate JSON-LD on SPA nav | Single Helmet script per page; @graph replaces on route change |
| Schema ≠ visible content | Build from same Article/Event/settings fields rendered on page |
| Event without ISO date | Exclude from Event JSON-LD (D-12) |
| Empty Book schema | Omit node when all book fields blank (D-03) |

## Don't Hand-Roll

| Problem | Use Instead |
|---------|-------------|
| Untyped JSON-LD | schema-dts `WithContext<T>` |
| Manual script DOM | Helmet via JsonLd.tsx |
| Parsing full_time strings | Prisma DateTime fields |

## Codebase Touchpoints

- `src/seo/seoConfig.ts` — parallel resolver for JSON-LD
- `server/prisma/schema.prisma` — Event dates
- `src/lib/websiteData.ts` — SiteSettings.book, AppEvent dates
- `src/pages/LandingPage.tsx`, `BlogPostPage.tsx`, `EventsPage.tsx`, `BlogPage.tsx`
