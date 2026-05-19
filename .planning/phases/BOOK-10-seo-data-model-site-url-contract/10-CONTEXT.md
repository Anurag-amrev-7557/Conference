# Phase 10: SEO Data Model & Site URL Contract - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Editors and the stack share one SEO data model; all absolute URLs derive from a single `SITE_URL` configuration. This phase delivers Prisma/API/type changes for per-article SEO fields and extended global `settings.seo`, plus the `SITE_URL` env contract and URL resolution helpers used by later phases (head tags, sitemap, JSON-LD, prerender). It does not implement per-route Helmet, dynamic sitemap, prerender, snippet preview, or OG upload pipeline.

</domain>

<decisions>
## Implementation Decisions

### Event SEO scope (Phase 10 vs later)
- **D-01:** Phase 10 adds SEO fields to **Article** and global `settings.seo` only — **no** `seoTitle`, `seoDescription`, `ogImage`, or `noindex` columns on the **Event** model in this phase.
- **D-02:** Until Event-specific SEO fields exist, downstream phases use a **hybrid fallback** for `/events`: meta title from event `title`; description synthesized from `host` + `location`; OG image from event `thumbnail` when present, else global `settings.seo.ogImage`.
- **D-03:** **Listing-only indexing** for events in v1.1 — only `/events` is an indexable URL. The current UI uses `EventDetailsDrawer` on the listing page; there is no `/events/:slug` route today.
- **D-04:** **Sitemap (Phase 13):** Include only the `/events` hub URL until routable per-event detail pages exist; do not emit per-event URLs in `sitemap.xml` based on drawer-only UX.

### Claude's Discretion
- **Event indexing / sitemap (user: "you decide"):** Locked to listing-only + single `/events` sitemap entry per D-03/D-04 and current routing in `src/App.tsx`.
- **Undiscussed Phase 10 areas** (SITE_URL host, Article Prisma shape, admin UI depth, URL helper module location): Follow `.planning/REQUIREMENTS.md` (CRAWL-01, CMS-01, CMS-02), ROADMAP success criteria, and `.planning/research/SUMMARY.md` Phase 1 recommendations unless the user adds context before planning.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 10 goal, success criteria, dependencies.
- `.planning/REQUIREMENTS.md` — CRAWL-01, CMS-01, CMS-02 (Phase 10); CMS-03–CMS-05 deferred to Phase 15.
- `.planning/PROJECT.md` — v1.1 milestone constraints; production hosts note.
- `.planning/STATE.md` — milestone decisions; community indexing note (Phases 13–14).

### Research (SEO architecture)
- `.planning/research/SUMMARY.md` — dependency order, SITE_URL-first, Article columns, event deferral pattern.
- `.planning/research/ARCHITECTURE.md` — `src/seo/` module, fallback chains, Prisma extensions.
- `.planning/research/STACK.md` — `SITE_URL` env, sitemap, field names.
- `.planning/research/PITFALLS.md` — domain drift, duplicate canonicals, global-only SEO.
- `.planning/research/FEATURES.md` — per-entity SEO vs deferred features.

### Prior phase context
- `.planning/phases/01-backend-completeness/01-CONTEXT.md` — CMS/API baseline.
- `.planning/phases/BOOK-02-security-hardening/02-CONTEXT.md` — env/CORS patterns.

### Codebase maps
- `.planning/codebase/STACK.md` — Prisma, Vite env exposure rules.
- `.planning/codebase/ARCHITECTURE.md` — `WebsiteDataProvider`, JSON `settings` blob pattern.
- `.planning/codebase/INTEGRATIONS.md` — API base URLs vs public site host.

### Implementation touchpoints
- `server/prisma/schema.prisma` — `Article`, `Event`, `SiteContent` models.
- `server/src/seed.ts` — authoritative `settings.seo` seed shape.
- `server/src/routes/contentRoutes.ts` — content payload parsing/merge.
- `server/src/routes/adminRoutes.ts` — article CRUD persistence.
- `src/lib/websiteData.ts` — `Article`, `SiteSettings` TypeScript types.
- `src/components/admin/BlogManager.tsx` — article editor (no SEO fields yet).
- `src/components/admin/SettingsManager.tsx` — global SEO tab (title/description only).
- `src/pages/EventsPage.tsx` — listing + drawer (no detail route).
- `src/App.tsx` — route table; `ThemeSynchronizer` global meta (Phase 11 will split).
- `index.html` — hardcoded `monograph.superhumanly.ai` canonical/OG (Phase 11 shell trim).
- `server/.env.example` — server env template (`SITE_URL` to be added).
- `.env.example` — client env template.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SiteContent.settings` JSON blob already stores `seo.title` and `seo.description`; extend same object for `ogImage` and `googleSiteVerification` without a new table.
- `SiteSettings` / `Article` interfaces in `src/lib/websiteData.ts` — extend types alongside Prisma migration.
- `BlogManager` and `SettingsManager` — natural admin surfaces for per-article and global SEO fields (full SEO tab + snippet preview deferred to Phase 15 per CMS-03/CMS-04).
- `WebsiteDataProvider` deep-merge for `settings.seo` — preserve merge pattern when API returns new fields.

### Established Patterns
- Flexible CMS fields live in JSON columns on `SiteContent`; relational entities (`Article`, `Event`) use Prisma columns for queryable/indexable data.
- Public content loads via single `GET /api/v1/content`; admin mutations via `/api/v1/admin/*` with JWT.
- Production host drift exists: `index.html` uses `monograph.superhumanly.ai`; API client defaults to `api.superhumanly-thoughts.com` — Phase 10 must introduce `SITE_URL` as the single origin for **public site** absolute URLs.

### Integration Points
- Prisma migration on `Article` + admin/content route serializers must return new fields in unified content payload.
- `server/.env.example` (and deploy docs) need `SITE_URL`; URL helper consumed in Phase 11+ (`src/seo/`, `seoRoutes`, sitemap builder).
- Events: `EventsPage` + `EventDetailsDrawer` — meta for events is page-level `/events` until detail routes and Event SEO columns are added in a later phase.

</code_context>

<specifics>
## Specific Ideas

- User explicitly scoped Phase 10 data model to **Article + global settings**, not Event columns.
- Event meta before per-event fields: **hybrid** fallback (title + host/location description + thumbnail/global OG).
- Align event sitemap and indexing with **current single-route** events UX (drawer, not detail pages).

</specifics>

<deferred>
## Deferred Ideas

- **Event model SEO columns** (`seoTitle`, `seoDescription`, `ogImage`, `noindex`) — add when per-event detail URLs or editorial need justifies migration (likely Phase 12+ alongside Event JSON-LD).
- **Per-event sitemap URLs** — only after routable `/events/:slug` (or similar) exists; until then `/events` only.
- **BlogManager SEO tab with fallback chain + SERP preview** — Phase 15 (CMS-03, CMS-04).
- **OG image upload + sharp 1200×630 pipeline** — Phase 15 (CMS-05); Phase 10 may use URL strings only for `ogImage`.
- **SITE_URL host choice, admin UI depth, Article field nullability** — not discussed; planner uses requirements + research defaults.

</deferred>

---

*Phase: 10-SEO Data Model & Site URL Contract*
*Context gathered: 2026-05-19*
