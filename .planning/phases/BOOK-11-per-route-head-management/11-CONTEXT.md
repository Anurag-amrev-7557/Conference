# Phase 11: Per-Route Head Management - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Every public URL exposes correct, unique head tags for users, crawlers, and social platforms. This phase delivers `react-helmet-async` integration, a centralized `src/seo/` module (`SeoHead`, `seoConfig`, route registry), per-route title/canonical/OG/Twitter/robots resolution using Phase 10 data (`Article` SEO fields, `settings.seo`, `SITE_URL` via `absoluteUrl`), admin/dashboard `noindex`, and a trimmed `index.html` shell without duplicate canonical/OG. It does not implement JSON-LD (Phase 12), dynamic sitemap/robots (Phase 13), prerender (Phase 14), admin SERP/snippet preview (Phase 15), or OG upload pipeline (Phase 15).
</domain>

<decisions>
## Implementation Decisions

### Head architecture (`src/seo/`)
- **D-01:** Add **`react-helmet-async@3.0.0`** and mount **`HelmetProvider`** in `main.tsx` wrapping the app tree (outside `Router`, alongside `WebsiteDataProvider`).
- **D-02:** Centralize head logic in **`src/seo/`**: `SeoHead.tsx` (declarative tags), `seoConfig.ts` (`resolvePageSeo`), `types.ts`, `routes.ts` (static route defaults + public route registry for later sitemap/prerender). Pages consume via **`usePageSeo`** hook or thin wrapper — not raw `<Helmet>` scattered per page.
- **D-03:** **Remove SEO duties from `ThemeSynchronizer`** (`App.tsx` lines 68–73: `document.title` and `meta[name=description]`). `ThemeSynchronizer` remains theme/CSS/custom-css only.

### Absolute URLs and canonical
- **D-04:** All canonical, `og:url`, and absolute `og:image` / `twitter:image` values use **`absoluteUrl(path)`** from `src/seo/siteUrl.ts` after `WebsiteDataProvider` calls `setSiteOrigin(siteUrl)` — never hardcode `monograph.superhumanly.ai` or read hosts from `index.html`.
- **D-05:** Canonical path = current public pathname (including `/blog/:slug`); trailing-slash policy: **no trailing slash** on canonical paths except root `/`.

### Meta fallback chain
- **D-06:** **Blog post (`/blog/:slug`):** `title` = `article.seoTitle` ?? `` `${article.title} | ${settings.seo.title}` ``; `description` = `article.seoDescription` ?? `article.excerpt` ?? `settings.seo.description`; `ogImage` = `article.ogImage` ?? `settings.seo.ogImage` ?? `absoluteUrl('/og-image.jpg')` (static public default).
- **D-07:** **Static marketing routes** (`/`, `/blog`, `/events`, `/community`): use **`routeDefaults` in `seoConfig`** (code-level defaults per section) merged over `settings.seo.title` / `settings.seo.description` / `settings.seo.ogImage` where route-specific copy is not in CMS yet.
- **D-08:** **Events (`/events`)** — per Phase 10 **D-02**: listing-only meta; title from route default or site title; description synthesized from published events context is **not** required in Phase 11 — use route default + site fallbacks (hybrid event-level copy deferred until Event SEO columns exist).
- **D-09:** Unpublished or missing blog slug: render **`noindex`** on client; keep existing redirect-to-`/blog` behavior; do not emit article canonical for unknown slugs.

### Open Graph and Twitter
- **D-10:** **`og:type`**: `article` on `/blog/:slug`; `website` on `/`, `/blog`, `/events`, `/community`.
- **D-11:** Emit full OG set (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and matching Twitter tags (`twitter:card` = **`summary_large_image`**, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:url`) on all **indexable** public routes.
- **D-12:** OG/Twitter image URLs must be **absolute**; relative CMS paths resolved via `absoluteUrl`.

### Robots / noindex policy
- **D-13:** **`/admin` and `/admin/*` and `/dashboard`**: `meta name="robots" content="noindex,nofollow"` always (META-05).
- **D-14:** **`/community`**: **`noindex,nofollow`** by default (aligns with `.planning/STATE.md` community indexing note until product confirms indexing).
- **D-15:** **Article**: `noindex` when `article.noindex === true` **OR** `!article.isPublished` (combine with OR per Phase 10 research).
- **D-16:** **`NotFoundPage` (`*`)**: `noindex,nofollow` to mitigate soft-404 indexing (research Pitfall 4).

### `index.html` shell (META-06)
- **D-17:** Strip duplicate **canonical**, **Open Graph**, and **Twitter** blocks from `index.html` (lines 13–28 today).
- **D-18:** Retain minimal shell only: `charset`, `viewport`, `favicon`, generic `<title>` (short site name or "Loading…"), optional single `meta name="description"` with neutral fallback — must not conflict with per-route Helmet output.

### Google Search Console verification (MSMT-01 partial)
- **D-19:** When `settings.seo.googleSiteVerification` is non-empty, inject `<meta name="google-site-verification" content="…" />` on **all public indexable routes** via shared `SeoHead` / site-level defaults (token is site-wide, not per-article). Admin routes excluded.

### Claude's Discretion
- Exact `routeDefaults` copy strings for `/`, `/blog`, `/events`, `/community` (planner may derive from CMS section content or seed).
- Whether `Helmet` `titleTemplate` is used vs explicit string concat in `seoConfig` (prefer explicit concat per D-06 for article titles).
- File naming (`PageSeo.tsx` vs `SeoHead.tsx`) as long as one component owns tag emission.
- Unit/integration test scope for `resolvePageSeo` (recommended, not blocking context).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 11 goal, success criteria, META-01–06.
- `.planning/REQUIREMENTS.md` — META-01 through META-06.
- `.planning/PROJECT.md` — v1.1 constraints; no framework migration.
- `.planning/STATE.md` — community default `noindex`; prerender note for Phase 14.

### Prior phase context
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-CONTEXT.md` — Article SEO fields, Event hybrid fallback (D-02), listing-only `/events`, no Event columns in Phase 10.
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-RESEARCH.md` — duplicate canonical pitfall; `noindex || !isPublished`; Phase 11 consumes `src/seo/siteUrl.ts`.

### Research (head management architecture)
- `.planning/research/SUMMARY.md` — SeoHead + seoConfig pattern; ThemeSynchronizer split; dependency order.
- `.planning/research/ARCHITECTURE.md` — `src/seo/` structure, `resolvePageSeo` example, layered SEO pattern.
- `.planning/research/STACK.md` — `react-helmet-async@3.0.0`, HelmetProvider placement, PageSeo integration.
- `.planning/research/PITFALLS.md` — duplicate tags, client-only meta, soft 404s.
- `.planning/research/FEATURES.md` — per-route meta requirements.

### Codebase maps
- `.planning/codebase/STACK.md` — React 19 / Vite 8 SPA.
- `.planning/codebase/ARCHITECTURE.md` — `WebsiteDataProvider`, routing.
- `.planning/codebase/CONVENTIONS.md` — component patterns.

### Implementation touchpoints
- `src/main.tsx` — add `HelmetProvider`.
- `src/App.tsx` — routes; strip SEO from `ThemeSynchronizer`.
- `index.html` — shell trim (META-06).
- `src/seo/siteUrl.ts` — `setSiteOrigin`, `absoluteUrl` (Phase 10).
- `src/components/WebsiteDataProvider.tsx` — hydrates `siteUrl` + `settings.seo` + articles.
- `src/lib/websiteData.ts` — `Article` SEO fields, `SiteSettings.seo`.
- `src/pages/LandingPage.tsx`, `BlogPage.tsx`, `BlogPostPage.tsx`, `EventsPage.tsx`, `CommunityPage.tsx` — wire `SeoHead` / `usePageSeo`.
- `src/pages/AdminPage.tsx`, `DashboardPage.tsx`, `NotFoundPage.tsx` — `noindex`.
- `package.json` — add `react-helmet-async`.
- `server/src/lib/siteUrl.ts` — server `SITE_URL` (reference only; head is client-side this phase).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/seo/siteUrl.ts` — origin store fed by API `siteUrl`; use for all absolute URLs in head tags.
- `WebsiteDataProvider` — already merges `settings.seo` and article list; single hydration point for `resolvePageSeo`.
- `Article` type includes `seoTitle`, `seoDescription`, `ogImage`, `noindex` (Phase 10).
- `settings.seo` includes `ogImage`, `googleSiteVerification` (Phase 10 admin).

### Established Patterns
- SPA routing via `react-router-dom` in `App.tsx`; marketing tracker on `location.pathname`.
- Global meta today: imperative `document.title` + `querySelector` in `ThemeSynchronizer` — **must be removed** to avoid fighting Helmet.
- `index.html` still hardcodes `monograph.superhumanly.ai` canonical/OG — **conflicts with per-route head** until D-17.

### Integration Points
- Each public page component mounts `SeoHead` (or calls `usePageSeo`) after `useWebsiteData()` is available.
- Admin routes under `/admin/*` and `/dashboard` get robots noindex without needing CMS data.
- Phase 14 prerender will snapshot the same Helmet output — keep resolver pure in `seoConfig.ts` for reuse.

</code_context>

<specifics>
## Specific Ideas

- Auto mode (`--auto`): all gray areas resolved with research-aligned defaults; no user overrides this session.
- Carry forward Phase 10 event scope: `/events` listing only; no per-event head variants until Event model SEO exists.
- Community indexing remains **noindex** until STATE.md blocker is resolved with product.

</specifics>

<deferred>
## Deferred Ideas

- **JSON-LD** (`BlogPosting`, `Event`, `WebSite`, etc.) — Phase 12 (SCHEMA-*).
- **Dynamic sitemap.xml / robots.txt** — Phase 13 (CRAWL-02, CRAWL-03).
- **Build-time prerender** baking head into static HTML — Phase 14 (CRAWL-04, CRAWL-05).
- **Admin SERP + social snippet preview** matching live head — Phase 15 (CMS-03, CMS-04).
- **OG image upload + sharp resize** — Phase 15 (CMS-05).
- **Per-event SEO fields and `/events/:slug` head** — when Event columns and detail routes exist (Phase 10 D-01 deferred).
- **hreflang / IndexNow** — v2 requirements.

</deferred>

---

*Phase: 11-Per-Route Head Management*
*Context gathered: 2026-05-19*
