# Phase 13: Crawl Policy & Dynamic Sitemap - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Crawlers discover indexable public URLs through authoritative server-generated `sitemap.xml` and `robots.txt`. This phase replaces stale static crawl files in `public/` with Express routes backed by Prisma (`Article`, `Event`, `SiteContent`) and `SITE_URL` from `server/src/lib/siteUrl.ts`. It does not implement build-time prerender (Phase 14), JSON-LD changes (Phase 12), or per-event detail URLs (`/events/:slug`).
</domain>

<decisions>
## Implementation Decisions

### Community indexing policy (resolves STATE.md blocker)
- **D-14:** **`Disallow: /community`** in `robots.txt` in addition to existing Phase 11 `noindex` meta on `/community`. Crawlers should not spend budget on UGC until product explicitly re-enables indexing.
- **D-15:** **Omit `/community`** from sitemap and `prerender-paths` (same inclusion rules). Phase 14 prerender allowlist must exclude `/community` unless product reverses D-14/D-15 in a future phase.

### Sitemap URL inventory (CRAWL-02)
- **D-01:** **`GET /sitemap.xml`** on Express; production nginx proxies before SPA catch-all.
- **D-02:** Use **`sitemap@9`**; hostname from `getSiteUrl()`.
- **D-03:** **Include:** `/`, `/blog`, each **`/blog/{slug}`** where `isPublished === true` and `noindex !== true`, **`/events` hub only** (Phase 10 D-04).
- **D-04:** **Exclude:** `/community`, `/admin`, `/admin/*`, `/dashboard`, drafts, noindex articles, per-event URLs, API paths.
- **D-05:** **`lastmod`:** ISO 8601 from Prisma `updatedAt`; `/` and `/blog` use `max(article.updatedAt)` or `SiteContent.updatedAt`; `/events` uses `max(event.updatedAt)` among published events or site fallback.
- **D-16:** Omit `changefreq` / `priority` unless `sitemap` package requires defaults (Google largely ignores).

### Robots policy (CRAWL-03)
- **D-06:** **`GET /robots.txt`** dynamic on Express.
- **D-07:** Template:
  ```
  User-agent: *
  Allow: /

  Disallow: /admin
  Disallow: /dashboard
  Disallow: /community

  Sitemap: {getSiteUrl()}/sitemap.xml
  ```
- **D-08:** Do **not** disallow `/assets`, JS, or CSS.

### Crawler routing & static file removal
- **D-09:** **Delete** `public/sitemap.xml` and `public/robots.txt` — API is authoritative.
- **D-10:** **`nginx.conf`:** `location = /sitemap.xml` and `location = /robots.txt` → API.
- **D-11:** **Vite dev proxy** for `/sitemap.xml` and `/robots.txt` → `http://localhost:3001`.
- **D-17:** Mount crawl routes at **app root** (`/sitemap.xml`, `/robots.txt`), not only under `/api/v1`.

### Freshness & Phase 14 handoff
- **D-18:** Sitemap/robots **regenerated on each request** (no separate publish webhook this phase).
- **D-19:** **`Cache-Control: public, max-age=3600`** on both crawl responses.
- **D-20:** **`GET /api/v1/seo/prerender-paths`** returns `{ paths: string[] }` using **`server/src/lib/crawlPolicy.ts`** — same filters as sitemap loc paths.
- **D-21:** **`crawlPolicy.ts`** is single source; sitemap builder and prerender-paths both import it.

### Claude's Discretion
- Exact `sitemap` stream API (`SitemapStream` vs helper).
- Staging `SITE_URL` / global noindex for non-prod hosts (document in server `.env.example` only if not already).

</decisions>

<canonical_refs>
## Canonical References

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 13 success criteria, CRAWL-02, CRAWL-03
- `.planning/REQUIREMENTS.md` — CRAWL-02, CRAWL-03
- `.planning/STATE.md` — community indexing resolved via D-14/D-15

### Prior phases
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-CONTEXT.md` — D-04 events hub-only sitemap
- `.planning/phases/BOOK-11-per-route-head-management/11-CONTEXT.md` — community/admin noindex meta
- `src/seo/routes.ts` — public route registry (client mirror; server duplicates in crawlPolicy)

### Implementation
- `server/src/lib/siteUrl.ts` — CRAWL-01
- `.planning/research/STACK.md` — sitemap@9, seoRoutes pattern
- `.planning/research/PITFALLS.md` — Pitfall 5 stale sitemap, Pitfall 9 admin leak

### External
- [Google — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/src/lib/siteUrl.ts` — `getSiteUrl()`, `absoluteUrl()` for all sitemap `loc` values
- `src/seo/routes.ts` — `PUBLIC_ROUTE_PATHS`, `parseBlogSlug`, `isAdminPath` (mirror rules server-side)
- `src/seo/seoConfig.ts` — indexability: community/admin noindex, article `noindex` / `isPublished`
- `public/sitemap.xml`, `public/robots.txt` — stale; to be removed

### Established Patterns
- Express routers in `server/src/routes/`; mount in `index.ts`
- Phase 11/12 verify scripts: `scripts/verify-phase11-head.mjs`, `verify-phase12-schema.mjs`
- Nginx: `/api/` → book_api; crawl files need dedicated `location =` blocks

### Integration Points
- Prisma `Article`, `Event`, `SiteContent` for dynamic URL list + `lastmod`
- `nginx.conf` Docker compose front door
- Phase 14 consumes `prerender-paths` API

</code_context>

<specifics>
## Specific Ideas

- Discuss updated synthesized context; all four gray areas covered.
- Align robots + sitemap + prerender-paths so community is blocked consistently (meta + robots + omission from sitemap).

</specifics>

<deferred>
## Deferred Ideas

- **IndexNow ping on publish** — after dynamic sitemap is stable in production
- **Per-event sitemap URLs** — when `/events/:slug` routes exist
- **GSC sitemap ping automation** — manual submit acceptable for v1.1

</deferred>

---

*Phase: 13-crawl-policy-dynamic-sitemap*
*Context gathered: 2026-05-19*
