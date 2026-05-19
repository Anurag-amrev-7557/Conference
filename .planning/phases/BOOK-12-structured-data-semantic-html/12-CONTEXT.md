# Phase 12: Structured Data & Semantic HTML - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Search engines and assistive tech understand page content through JSON-LD structured data and corrected semantic HTML aligned with visible CMS data. This phase delivers typed JSON-LD builders in `src/seo/`, CMS book metadata for `Book` schema, ISO event dates for `Event` schema, `BreadcrumbList` on blog and events surfaces, and a semantic audit fix pass on public marketing routes. It does not implement dynamic sitemap/robots (Phase 13), prerender (Phase 14), admin SERP preview (Phase 15), per-event detail URLs (`/events/:slug`), or community indexing changes.
</domain>

<decisions>
## Implementation Decisions

### Book metadata source (SCHEMA-02)
- **D-01:** Add **`settings.book`** to the site settings JSON blob (Prisma `SiteContent.settings`, `SiteSettings` TypeScript type, Zod patch schema, admin UI). Do **not** derive `Book` JSON-LD solely from `hero` or `pillars` — hero is marketing copy, not bibliographic metadata.
- **D-02:** **`settings.book` fields:** `title?`, `authorName?`, `authorUrl?`, `isbn?` (ISBN-13 preferred), `coverImageUrl?`, `publisherName?`, `publisherUrl?`. All optional individually; admin labels explain Google Book eligibility.
- **D-03:** **`Book` JSON-LD on `/` only**, emitted when **at least one** of `title`, `authorName`, `isbn`, `coverImageUrl` is non-empty (ROADMAP SCHEMA-02). Omit the `Book` node entirely when all are blank — do not emit empty Book schema.
- **D-04:** Admin surface: new **Book** subsection in `SettingsManager` (adjacent to SEO tab or nested under it). No new top-level admin nav item unless planner prefers grouping under Settings.

### JSON-LD module shape (SCHEMA-01–05)
- **D-05:** Extend **`src/seo/`** with pure builder functions + a single presenter: `JsonLd.tsx` (or `StructuredData.tsx`), e.g. `buildWebSiteSchema`, `buildOrganizationSchema`, `buildBookSchema`, `buildBlogPostingSchema`, `buildEventSchema`, `buildBreadcrumbSchema`, `buildPageGraph`.
- **D-06:** Add **`schema-dts@2`** as devDependency for compile-time schema typing. Serialize with `JSON.stringify` — no runtime schema validator required this phase.
- **D-07:** **One `<script type="application/ld+json">` per page** containing an **`@graph` array** when multiple types apply (e.g. landing: `WebSite` + `Organization` + optional `Book`). On SPA navigation, Helmet replaces the single script tag — avoids duplicate JSON-LD blocks (research Pitfall 6).
- **D-08:** All URL fields in JSON-LD use **`absoluteUrl()`** from `src/seo/siteUrl.ts` — same contract as Phase 11 canonical/OG. Never hardcode production hosts.
- **D-09:** Wire **`JsonLd` alongside `SeoHead`** on: `LandingPage` (`/`), `BlogPostPage` (`/blog/:slug`), `EventsPage` (`/events`). Optionally `BlogPage` for breadcrumb-only graph if not included in listing meta elsewhere.
- **D-10:** JSON-LD respects Phase 11 **robots policy**: omit `BlogPosting` for unpublished/`noindex` articles; omit indexable schemas on admin/dashboard/community/noindex routes (community already noindex).

### Event dates (SCHEMA-05)
- **D-11:** **Prisma migration** adding optional **`startDate DateTime?`** and **`endDate DateTime?`** on `Event`. Display fields (`day`, `weekday`, `time`, `full_time`) remain for UI — ISO fields are the JSON-LD source of truth.
- **D-12:** **No heuristic parsing** of `full_time` / `day` strings for schema dates in v1. Events without `startDate` are **excluded from Event JSON-LD** (still shown in UI).
- **D-13:** Admin **`EventManager`** gains ISO date/time inputs (native `datetime-local` or text ISO inputs) for `startDate`/`endDate` on create/edit. Seed/migration backfill optional — not blocking if seed uses display-only strings.
- **D-14:** **Event JSON-LD fields:** `name` = `title`, `startDate` (required for inclusion), `endDate` when set, `location` as `Place` with `name` from `location` string; add `GeoCoordinates` when `lat`/`lng` present; `image` from `thumbnail` via `absoluteUrl` when relative.

### Event + breadcrumb scope (SCHEMA-04–05)
- **D-15:** **No `/events/:slug` routes** this phase. Event structured data lives on **`/events` listing page only** — one `Event` node per published event with valid `startDate` in the page `@graph`.
- **D-16:** **`BreadcrumbList` on `/blog/:slug`:** `Home > Blog > {article.title}` (three items, last item `@id` = article canonical URL).
- **D-17:** **`BreadcrumbList` on `/events`:** `Home > Events` (two items — no per-event crumbs without detail URLs).
- **D-18:** **`BreadcrumbList` on `/blog` index (optional):** `Home > Blog` if SCHEMA-04 "blog pages" includes listing; include when low effort alongside post breadcrumbs.
- **D-19:** Landing `/` does **not** need BreadcrumbList (root page).

### Semantic audit depth (SCHEMA-06)
- **D-20:** Audit and fix **public indexable marketing routes only:** `/`, `/blog`, `/blog/:slug`, `/events`. Exclude `/community` (noindex), admin, dashboard, 404 from SCHEMA-06 scope.
- **D-21:** **One visible `<h1>` per page.** Landing hero: promote visible headline to `<h1>` (today hero uses styled text without h1). Blog post: article title is page `<h1>`; markdown body headings start at `<h2>`.
- **D-22:** Landmarks: ensure **`<main>`**, **`<header>`** (nav), **`<footer>`** on audited pages. `BlogPostPage` already has `<article>` + `<main>` — preserve and align heading order.
- **D-23:** **Non-empty `alt` on key images:** article thumbnails (`article.title` or excerpt), author avatars (`authorName`), event thumbnails (`event.title`). Decorative-only images may use `alt=""` with `role="presentation"` if needed.
- **D-24:** Fix **`CommunityPage` double-h1** only if touched by shared components — not in SCHEMA-06 scope unless planner bundles as quick win; do not expand scope to community layout refactor.

### BreadcrumbList labels (SCHEMA-04)
- **D-25:** **Auto-generate labels** from code — no CMS overrides for breadcrumb text this phase.
- **D-26:** Fixed label map: **Home** → `settings.seo.title` or `appearance.brandName`; **Blog** → `routeDefaults['/blog'].title` short label or literal `"Blog"`; **Events** → `"Events"`.
- **D-27:** Last crumb for articles uses **`article.title` verbatim** (must match visible page heading / BlogPosting `headline`).

### Claude's Discretion
- Exact file names under `src/seo/` (`jsonLd/` subfolder vs flat).
- Whether `WebSite` includes `SearchAction` (defer unless search exists).
- `Organization` logo URL source (`appearance.brandLogoText` vs future logo upload — use site OG image or favicon absolute URL as fallback).
- Vitest coverage for pure JSON-LD builders (recommended, aligned with Phase 11 Nyquist pattern).
- Admin Book UI layout (fields order, help copy).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 12 goal, success criteria, SCHEMA-01–06.
- `.planning/REQUIREMENTS.md` — SCHEMA-01 through SCHEMA-06.
- `.planning/PROJECT.md` — v1.1 constraints; no framework migration.
- `.planning/STATE.md` — `SITE_URL` single source of truth; community noindex.

### Prior phase context
- `.planning/phases/BOOK-11-per-route-head-management/11-CONTEXT.md` — `src/seo/` module, `absoluteUrl`, robots/noindex policy, `/events` listing-only.
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-CONTEXT.md` — settings.seo shape, Article fields, Event SEO columns deferred.

### Research (structured data & semantics)
- `.planning/research/SUMMARY.md` — schema-dts, JSON-LD layer order, dependency after head tags.
- `.planning/research/ARCHITECTURE.md` — `JsonLd` component pattern, `@graph`, page wiring table.
- `.planning/research/STACK.md` — `schema-dts@2.0.0`, JSON-LD injection pattern.
- `.planning/research/FEATURES.md` — Book CMS panel, BlogPosting field mapping, Event ISO dates note.
- `.planning/research/PITFALLS.md` — Pitfall 6 duplicate/late JSON-LD; structured data must match visible content.

### External (Google)
- [Google Book structured data](https://developers.google.com/search/docs/appearance/structured-data/book)
- [Article/BlogPosting structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

### Implementation touchpoints
- `src/seo/` — extend with JSON-LD builders + `JsonLd.tsx` (alongside `SeoHead`, `seoConfig`, `siteUrl.ts`).
- `src/pages/LandingPage.tsx` — WebSite, Organization, Book graph.
- `src/pages/BlogPostPage.tsx` — BlogPosting + BreadcrumbList; semantic h1/alt fixes.
- `src/pages/EventsPage.tsx` — Event nodes + BreadcrumbList.
- `src/pages/BlogPage.tsx` — optional BreadcrumbList.
- `src/components/sections/HeroSection.tsx` — h1 promotion for landing.
- `src/lib/websiteData.ts` — `SiteSettings.book` type.
- `server/prisma/schema.prisma` — Event `startDate`/`endDate`; settings JSON for book.
- `server/src/schemas/content.ts` — Zod for `settings.book` patch.
- `src/components/admin/SettingsManager.tsx` — Book metadata admin.
- `src/components/admin/EventManager.tsx` — ISO date fields.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/seo/seoConfig.ts` + `resolvePageSeo` — pure resolver pattern to mirror for JSON-LD builders.
- `src/seo/SeoHead.tsx` + `react-helmet-async` — mount JSON-LD script via same Helmet provider.
- `src/seo/siteUrl.ts` — `absoluteUrl`, `setSiteOrigin` for all `@id` and URL fields.
- `src/seo/routes.ts` — `routeDefaults` for breadcrumb section labels.
- `Article` model — `title`, `authorName`, `publishedAt`, `thumbnail`, `excerpt`, SEO fields for BlogPosting.
- `Event` model — `title`, `location`, `lat`/`lng`, `thumbnail`, `isPublished`; needs ISO dates (D-11).

### Established Patterns
- Settings stored as JSON in `SiteContent.settings` — extend with `book` object without new Prisma table.
- Phase 11 wires `SeoHead` first child on each page — add `JsonLd` immediately after or inside same fragment.
- No JSON-LD exists today — greenfield within `src/seo/`.

### Integration Points
- `WebsiteDataProvider` hydrates settings + articles + events — builders consume same `data` as `usePageSeo`.
- Admin saves via existing content PATCH routes — book fields follow Phase 10 SEO field pattern.
- Phase 14 prerender will snapshot JSON-LD in Helmet output — keep builders pure for reuse.

</code_context>

<specifics>
## Specific Ideas

- User selected **all six gray areas** — decisions locked with research-aligned defaults (no per-area overrides).
- Book metadata requires dedicated CMS panel — not hero/pillar derivation.
- Event schema requires real ISO dates — no string parsing hacks.
- Breadcrumbs auto-generated — no CMS label editor this phase.

</specifics>

<deferred>
## Deferred Ideas

- **`/events/:slug` detail routes** and per-event BreadcrumbList — future phase when event detail URLs exist.
- **Event SEO columns** (`seoTitle`, `ogImage`, etc.) — Phase 10 deferred; still out of scope unless planner bundles with Event dates migration.
- **SearchAction** on WebSite schema — defer until site search exists.
- **Community semantic audit** — community is noindex; layout fixes not required for SCHEMA-06 acceptance.
- **Rich Results Test CI automation** — manual smoke via Google tool; formal CI in later validation phase.
- **hreflang / multi-locale JSON-LD** — v2.

</deferred>

---

*Phase: 12-structured-data-semantic-html*
*Context gathered: 2026-05-19*
