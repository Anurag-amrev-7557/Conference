# Phase 10: SEO Data Model & Site URL Contract - Research

**Researched:** 2026-05-19  
**Domain:** Prisma/CMS SEO fields, `SITE_URL` env contract, absolute URL helpers (brownfield Express + React/Vite)  
**Confidence:** HIGH (codebase + locked CONTEXT); MEDIUM (client `siteUrl` delivery pattern — recommend API field)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Phase 10 adds SEO fields to **Article** and global `settings.seo` only — **no** `seoTitle`, `seoDescription`, `ogImage`, or `noindex` columns on the **Event** model in this phase.
- **D-02:** Until Event-specific SEO fields exist, downstream phases use a **hybrid fallback** for `/events`: meta title from event `title`; description synthesized from `host` + `location`; OG image from event `thumbnail` when present, else global `settings.seo.ogImage`.
- **D-03:** **Listing-only indexing** for events in v1.1 — only `/events` is an indexable URL. The current UI uses `EventDetailsDrawer` on the listing page; there is no `/events/:slug` route today.
- **D-04:** **Sitemap (Phase 13):** Include only the `/events` hub URL until routable per-event detail pages exist; do not emit per-event URLs in `sitemap.xml` based on drawer-only UX.

### Claude's Discretion
- **Event indexing / sitemap (user: "you decide"):** Locked to listing-only + single `/events` sitemap entry per D-03/D-04 and current routing in `src/App.tsx`.
- **Undiscussed Phase 10 areas** (SITE_URL host, Article Prisma shape, admin UI depth, URL helper module location): Follow `.planning/REQUIREMENTS.md` (CRAWL-01, CMS-01, CMS-02), ROADMAP success criteria, and `.planning/research/SUMMARY.md` Phase 1 recommendations unless the user adds context before planning.

### Deferred Ideas (OUT OF SCOPE)
- **Event model SEO columns** (`seoTitle`, `seoDescription`, `ogImage`, `noindex`) — add when per-event detail URLs or editorial need justifies migration (likely Phase 12+ alongside Event JSON-LD).
- **Per-event sitemap URLs** — only after routable `/events/:slug` (or similar) exists; until then `/events` only.
- **BlogManager SEO tab with fallback chain + SERP preview** — Phase 15 (CMS-03, CMS-04).
- **OG image upload + sharp 1200×630 pipeline** — Phase 15 (CMS-05); Phase 10 may use URL strings only for `ogImage`.
- **SITE_URL host choice, admin UI depth, Article field nullability** — not discussed; planner uses requirements + research defaults.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **CRAWL-01** | `SITE_URL` env is single source of truth for absolute URLs in canonical, OG, sitemap, JSON-LD | Server-only `SITE_URL` in `server/.env.example`; `server/src/lib/siteUrl.ts` with boot validation (mirror `jwtSecret.ts`); expose read-only `siteUrl` on `GET /api/v1/content/site` so client/build consumers do not need a second env var; Google requires fully-qualified URLs in sitemaps [CITED: developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap] |
| **CMS-01** | `Article` stores `seoTitle`, `seoDescription`, `ogImage`, `noindex` with API and admin UI | Prisma columns on `Article`; extend `articleCreateSchema` / `articleUpdateSchema`; fields flow through `mapArticle` + split content endpoints; **basic** inline fields in `BlogManager` (not Phase 15 SEO tab) |
| **CMS-02** | Global `settings.seo` supports `ogImage` and `googleSiteVerification` editable in admin | Extend JSON blob in `SiteContent.settings` (no new table); `SettingsManager` SEO tab inputs; preserve `WebsiteDataProvider` deep-merge for `settings.seo`; seed + `initialData` defaults |
</phase_requirements>

## Summary

Phase 10 is a **data-and-contract** phase: extend the existing Prisma `Article` model and `SiteContent.settings.seo` JSON, wire them through the established admin/content API paths, and introduce **`SITE_URL` as the authoritative public-site origin** with shared URL helpers for Phases 11–14. The brownfield stack already has global `settings.seo.title` / `description`, article CRUD, and deep-merge hydration — Phase 10 adds columns and env discipline without new npm dependencies.

**Critical constraint:** Do **not** add Event SEO columns or per-event sitemap URLs (D-01, D-04). Event meta remains a **runtime hybrid fallback** in later phases.

**Domain drift today:** `index.html` hardcodes `https://monograph.superhumanly.ai/` for canonical/OG; API marketing defaults use `api.superhumanly-thoughts.com`. Phase 10 does not fix head tags (Phase 11) but must establish `SITE_URL` so all future builders stop copying hosts from HTML.

**Primary recommendation:** Ship a Prisma migration for nullable Article SEO columns; extend `settings.seo` with `ogImage` + `googleSiteVerification`; add `SITE_URL` to server env with production fail-fast; implement `getSiteUrl()` / `absoluteUrl(path)` on the server and a thin `src/seo/siteUrl.ts` fed by API `siteUrl`; add minimal admin inputs in `BlogManager` + `SettingsManager` (URL strings only, no upload pipeline).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Article SEO persistence (`seoTitle`, etc.) | **Database / Storage** (Prisma `Article`) | API / Backend (Zod + admin routes) | Queryable per-entity fields belong on relational model, not JSON blob |
| Global SEO defaults (`settings.seo`) | **Database / Storage** (`SiteContent.settings` JSON) | API / Backend + **Browser** (admin UI) | Existing pattern for site-wide config; no new table |
| `SITE_URL` configuration | **API / Backend** (env + boot validation) | Build/CI (Phase 14 prerender) | Canonical origin is server-known; must not ship in client bundle as a secret |
| Absolute URL resolution (`/blog/:slug` → full URL) | **API / Backend** (`siteUrl.ts`) | **Frontend Server** (client reads `siteUrl` from API) | Single resolver prevents drift; client must not hardcode production host |
| Admin SEO editing | **Browser / Client** (admin CMS) | API / Backend (PATCH/PUT) | Editors interact via existing `BlogManager` / `SettingsManager` |
| Event listing SEO (hybrid fallback) | **Browser / Client** (Phase 11 `seoConfig`) | — | No Event columns in Phase 10; page-level `/events` only |
| Sitemap URL list | **API / Backend** (Phase 13) | — | Out of Phase 10 scope; consumes `SITE_URL` + published slugs |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Prisma** | ^5.12.1 (installed) | `Article` migration + client | Existing CMS persistence; SQLite already in use |
| **Zod** | ^3.24.2 (installed) | Validate article + settings payloads | Matches `articleCreateSchema`, `contentPatchSchema` patterns |
| **Express** | ^4.19.2 (installed) | Content/admin routes | No new SEO route module in Phase 10 |
| **dotenv** | ^16.4.5 (installed) | Load `SITE_URL` on server boot | Same as `JWT_SECRET`, `ALLOWED_ORIGINS` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| *(none new)* | — | — | Phase 10 is schema + env + types + admin fields only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma columns on `Article` | SEO fields inside `content` JSON or `SiteContent` | Breaks CMS-01 “Article model stores…”; worse query/filter for sitemap |
| `SITE_URL` only on server | Duplicate `VITE_SITE_URL` on client | Drift risk; violates CRAWL-01 spirit — prefer API-injected `siteUrl` |
| Store `siteUrl` in DB | Env-only `SITE_URL` | DB copy drifts from deploy env; env is correct source |

**Installation:** None — no new packages for Phase 10.

**Version verification:** Existing stack confirmed in `server/package.json` and root `package.json` (2026-05-19 codebase read).

## Package Legitimacy Audit

> **No external packages introduced in this phase.** Slopcheck not run (nothing to install).

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| — | — | — | N/A |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
                    ┌─────────────────────────────────────┐
                    │  Deploy env: SITE_URL (server only)    │
                    │  e.g. https://monograph.superhumanly.ai│
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  server/src/lib/siteUrl.ts           │
                    │  getSiteUrl() · absoluteUrl(path)    │
                    └─────────────────┬───────────────────┘
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐      ┌──────────────────────┐    ┌─────────────────────┐
│ Prisma Article   │      │ SiteContent.settings  │    │ GET /content/site    │
│ seoTitle, etc.   │      │ .seo.ogImage,         │    │ + siteUrl (computed) │
│ (new columns)    │      │ .googleSiteVerification│   └──────────┬──────────┘
└────────┬─────────┘      └──────────┬───────────┘               │
         │                             │                            │
         └──────────────┬──────────────┘                            │
                        ▼                                            ▼
              ┌─────────────────────┐              ┌──────────────────────────┐
              │ Admin PATCH/PUT      │              │ WebsiteDataProvider merge   │
              │ /admin/content       │              │ settings.seo + articles     │
              │ /admin/blogs/:id     │              └──────────┬───────────────┘
              └─────────────────────┘                             │
                                                                  ▼
                                                    ┌──────────────────────────┐
                                                    │ Phase 11+: src/seo/*      │
                                                    │ Helmet · sitemap · JSON-LD│
                                                    └──────────────────────────┘
```

### Recommended Project Structure

```text
server/
├── prisma/schema.prisma          # Article SEO columns
├── prisma/migrations/            # new migration
├── src/lib/siteUrl.ts            # NEW — SITE_URL parse, absoluteUrl()
├── src/routes/contentRoutes.ts   # inject siteUrl in fetchSitePayload
├── src/schemas/article.ts        # optional SEO fields
├── .env.example                  # SITE_URL=
src/
├── lib/websiteData.ts            # Article + SiteSettings.seo types
├── seo/siteUrl.ts                # NEW — client helper (uses API siteUrl)
├── components/admin/
│   ├── BlogManager.tsx           # inline SEO fields
│   └── SettingsManager.tsx       # ogImage + googleSiteVerification
```

### Pattern 1: Relational SEO on `Article`, global SEO in JSON settings

**What:** Add nullable Prisma columns for per-article overrides; extend nested `settings.seo` object for site defaults (OG image URL, GSC verification token).

**When to use:** Always for Phase 10 — matches existing split (entities vs `SiteContent` blob) documented in CONTEXT.

**Example:**

```prisma
// server/prisma/schema.prisma — recommended shape
model Article {
  // ...existing fields...
  seoTitle       String?
  seoDescription String?
  ogImage        String?
  noindex        Boolean  @default(false)
}
```

```typescript
// src/lib/websiteData.ts — align TypeScript
export interface Article {
  // ...existing...
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  noindex?: boolean;
}

export interface SiteSettings {
  seo: {
    title: string;
    description: string;
    ogImage?: string;
    googleSiteVerification?: string;
  };
  // ...
}
```

### Pattern 2: `SITE_URL` server module with production fail-fast

**What:** Mirror Phase 2 `jwtSecret.ts`: read `process.env.SITE_URL`, normalize trailing slash, validate with `URL` constructor; fail boot in production if missing/invalid; dev default `http://localhost:5173`.

**When to use:** Any absolute URL for sitemap (Phase 13), canonical/OG (Phase 11), JSON-LD `@id` (Phase 12).

**Example:**

```typescript
// server/src/lib/siteUrl.ts — pattern (implement in phase)
import { URL } from 'node:url';

function normalizeOrigin(raw: string): string {
  const u = new URL(raw);
  return u.origin; // strips path; use origin only
}

export function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL?.trim() ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  if (!raw) throw new Error('SITE_URL is required in production');
  return normalizeOrigin(raw);
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
```

### Pattern 3: Expose `siteUrl` on public content API (avoid `VITE_SITE_URL` drift)

**What:** Add computed `siteUrl: getSiteUrl()` to `fetchSitePayload()` return value in `contentRoutes.ts` (not stored in Prisma). Client `WebsiteDataProvider` merges into state or reads from site slice.

**When to use:** Phase 10+ so browser and admin preview use the same origin as server sitemap without a second env var.

**Anti-pattern:** Adding `VITE_SITE_URL` that can disagree with `SITE_URL` in production.

### Pattern 4: Minimal admin UI (Phase 10 depth)

**What:** CMS-01/02 require “admin UI” but CMS-03/04 defer the SEO **tab** and SERP preview to Phase 15.

**When to use:** Phase 10 plan tasks:
- `SettingsManager` SEO tab: add URL input for `form.seo.ogImage`, text input for `form.seo.googleSiteVerification` (meta content token only).
- `BlogManager` editor: add fields block (seo title, meta description, OG image URL, noindex toggle) below excerpt/cover — **not** a separate tab.

### Anti-Patterns to Avoid

- **Event SEO columns in Phase 10:** Violates D-01; use hybrid fallback in Phase 11 `seoConfig` for `/events` only.
- **Storing `SITE_URL` in `SiteContent` JSON:** Env is deploy-specific; DB copy will drift across staging/prod.
- **Hardcoding `monograph.superhumanly.ai` in new code:** Use `getSiteUrl()` only; leave `index.html` cleanup to Phase 11 (META-06).
- **OG upload / sharp in Phase 10:** CMS-05 deferred; accept HTTPS URL strings only.
- **Full SEO tab + fallback preview in Phase 10:** Scope creep into Phase 15.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Absolute URL joining | String concat with hardcoded host | `absoluteUrl(path)` from `siteUrl.ts` | Trailing slashes, `http` vs `https`, wrong host break canonical/OG |
| SEO field validation | Ad-hoc `if` checks in routes | Zod optional fields on article + settings patch | Consistent 400 responses; matches admin middleware |
| Second public origin env | `VITE_SITE_URL` duplicate | API `siteUrl` from `SITE_URL` | CRAWL-01 single source |
| Event per-URL sitemap entries | Drawer deep-links as URLs | Single `/events` hub until detail routes exist | D-03/D-04 |

**Key insight:** The expensive mistakes in this milestone are **host drift** and **schema scope creep** (Event columns), not missing libraries.

## Common Pitfalls

### Pitfall 1: Partial field plumbing (API returns columns but Zod strips them)

**What goes wrong:** Admin saves `seoTitle` but `articleUpdateSchema` omits keys → Prisma never receives them, or client types omit fields → TS errors silenced with `Partial<Article>`.

**Why it happens:** Four touchpoints must align: Prisma, Zod, `websiteData.ts`, admin form state.

**How to avoid:** Single checklist task: migration → generate client → schema → types → BlogManager → verify round-trip with `curl` PUT + GET articles.

**Warning signs:** DB column populated in Prisma Studio but empty in network response.

### Pitfall 2: `settings.seo` merge drops new keys

**What goes wrong:** PATCH sends partial `settings`; server `JSON.stringify` replaces entire blob incorrectly, or client merge overwrites `googleSiteVerification` with `undefined`.

**Why it happens:** `WebsiteDataProvider` only deep-merges known nested keys (`seo`, `visibility`, `navigation`).

**How to avoid:** When extending `seo`, merge `{ ...initialData.settings.seo, ...remoteData.settings.seo }` (already present) and ensure admin `setForm` spreads `form.seo` on each change.

### Pitfall 3: `noindex` vs `isPublished` confusion

**What goes wrong:** Editors expect draft = noindex; only `noindex` flag is set but article stays published.

**How to avoid:** Document in admin copy: `noindex` is explicit SEO control; `isPublished` still gates public listing. Phase 11 resolver should combine: `noindex || !isPublished` for robots meta.

### Pitfall 4: Nullable migration on SQLite prod copy

**What goes wrong:** Deploy without `prisma migrate deploy` leaves missing columns → 500 on article fetch.

**How to avoid:** Plan includes migrate step in deploy docs; dev uses `npm run prisma:migrate` in `server/`.

### Pitfall 5: Treating API host as site URL

**What goes wrong:** Using `VITE_API_URL` or `api.superhumanly-thoughts.com` for canonicals.

**Why it happens:** INTEGRATIONS.md documents API base separately from marketing site host.

**How to avoid:** `SITE_URL` = public marketing origin only (`https://monograph.superhumanly.ai` per PROJECT.md / current `index.html`).

## Code Examples

### Extend Zod article schema

```typescript
// server/src/schemas/article.ts — extend existing schemas
seoTitle: z.string().max(200).optional().nullable(),
seoDescription: z.string().max(500).optional().nullable(),
ogImage: z.string().url().optional().nullable(), // or z.string() if relative URLs needed
noindex: z.boolean().optional(),
```

Use `.url()` only if all OG images are absolute HTTPS; CMS thumbnails already use full URLs in seed.

### Inject `siteUrl` in content payload

```typescript
// server/src/routes/contentRoutes.ts — in fetchSitePayload()
import { getSiteUrl } from '../lib/siteUrl';

async function fetchSitePayload() {
  const content = await prisma.siteContent.findUnique({ where: { id: 'global' } });
  return {
    hero: safeParse(content?.hero),
    // ...
    settings: safeParse(content?.settings),
    appearance: safeParse(content?.appearance),
    siteUrl: getSiteUrl(), // computed, not from DB
  };
}
```

### Client absolute URL helper (Phase 11 consumes)

```typescript
// src/seo/siteUrl.ts
export function absoluteUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global-only `settings.seo` + `ThemeSynchronizer` | Per-article Prisma SEO + route resolver (Phase 11) | v1.1 milestone | Blog posts get unique meta |
| Hardcoded hosts in `index.html` | `SITE_URL` env + helpers | Phase 10 | Fixes drift for sitemap/canonical |
| Static `public/sitemap.xml` | Dynamic Express sitemap (Phase 13) | v1.1 | Phase 10 only supplies `SITE_URL` + data model |

**Deprecated/outdated:**
- Copying `monograph.superhumanly.ai` into new modules — replace with `getSiteUrl()` [verified: `index.html` lines 15–28]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Production `SITE_URL` should default to `https://monograph.superhumanly.ai` (matches `index.html` + PROJECT.md) | SITE_URL | Wrong canonical domain in GSC |
| A2 | Article SEO columns should be **nullable** optional fields (existing rows need no backfill) | Prisma | Forced defaults overwrite editorial intent |
| A3 | Exposing `siteUrl` on `GET /content/site` is acceptable for CRAWL-01 (env remains source) | Architecture | User may insist on env-only client access |
| A4 | CMS-01 “admin UI” = inline fields, not Phase 15 SEO tab | Admin UI | Scope dispute if user expected full tab |
| A5 | `ogImage` values are URL strings only in Phase 10 | CMS-02 | Editors may expect upload UX |

## Open Questions

1. **Confirm production `SITE_URL` value**
   - What we know: `index.html` and PROJECT.md reference `monograph.superhumanly.ai`; `src/lib/config.ts` references `playbook.superhumanly.ai` for a different purpose.
   - What's unclear: Which host is canonical for v1.1 GSC property.
   - Recommendation: Planner adds deploy checklist item; default `https://monograph.superhumanly.ai` unless user overrides in discuss.

2. **Include `siteUrl` in API response vs wait for Phase 11**
   - What we know: CRAWL-01 requires single source; API injection avoids `VITE_SITE_URL`.
   - Recommendation: Include in Phase 10 — low cost, high drift prevention.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Prisma, server | ✓ | v22.20.0 | — |
| npm | migrate, dev | ✓ | 11.6.4 | — |
| Prisma CLI | migration | ✓ | ^5.12.1 (server dep) | — |
| SQLite (`dev.db`) | local CMS | ✓ | file-backed | — |
| slopcheck | package audit | ✗ | — | N/A (no new packages) |

**Missing dependencies with no fallback:** none for Phase 10 scope.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed (Vitest planned in Phase 2 validation doc, not present in repo) |
| Config file | none — Wave 0 optional: `server/vitest.config.ts` |
| Quick run command | `cd server && npm run build` (typecheck compile) |
| Full suite command | N/A until Vitest added |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRAWL-01 | `getSiteUrl()` rejects missing URL in production | unit | `vitest server/src/lib/siteUrl.test.ts` | ❌ Wave 0 |
| CRAWL-01 | `absoluteUrl('/blog/x')` returns origin + path | unit | same | ❌ Wave 0 |
| CMS-01 | Article SEO fields round-trip via PUT/GET | integration | `vitest` + supertest on admin routes | ❌ Wave 0 |
| CMS-02 | `settings.seo.ogImage` persists via PATCH `/admin/content` | integration | supertest | ❌ Wave 0 |
| CMS-01/02 | Admin UI saves visible in API | manual | Admin → save → DevTools network | ✅ manual UAT |

### Sampling Rate

- **Per task commit:** `cd server && npm run build`
- **Per wave merge:** Manual curl round-trip (article PUT, settings PATCH, GET `/content/site` includes `siteUrl`)
- **Phase gate:** ROADMAP success criteria 1–3 verified in admin + API

### Wave 0 Gaps

- [ ] `server/src/lib/siteUrl.ts` + `siteUrl.test.ts` — CRAWL-01
- [ ] `server/vitest.config.ts` + `"test": "vitest run"` — optional but aligns with Phase 2 VALIDATION.md
- [ ] `supertest` devDependency — admin integration tests for CMS-01/02

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | yes (admin-only writes) | Existing `authenticateAdmin` on `/admin/*` |
| V5 Input Validation | yes | Zod on article + settings; optional `.url()` on `ogImage` |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored XSS via `seoDescription` | Tampering | Output encoded in React; Phase 11 meta tags escape via Helmet; no raw HTML in SEO fields |
| Open redirect via malicious `ogImage` URL | Spoofing | Validate URL scheme (`https:` only) in Zod; CSP `img-src` already allows https: (Phase 2) |
| Admin-only SEO tampering | Elevation | JWT on admin routes (existing) |
| `googleSiteVerification` token injection | Tampering | Treat as plain string; length cap in Zod; only inject as meta `content` in Phase 11 |

## Sources

### Primary (HIGH confidence)
- Codebase: `server/prisma/schema.prisma`, `server/src/routes/contentRoutes.ts`, `server/src/routes/adminRoutes.ts`, `server/src/schemas/article.ts`, `src/lib/websiteData.ts`, `src/components/WebsiteDataProvider.tsx`, `src/components/admin/BlogManager.tsx`, `src/components/admin/SettingsManager.tsx`, `index.html`, `server/.env.example`
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-CONTEXT.md`
- `.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `STACK.md`, `PITFALLS.md`
- [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) — absolute URL requirement

### Secondary (MEDIUM confidence)
- `.planning/PROJECT.md` — production hosts
- `.planning/codebase/INTEGRATIONS.md` — API vs public host separation
- Phase 2 env patterns (`jwtSecret.ts`, server-only secrets)

### Tertiary (LOW confidence)
- Exact GSC property host choice between `monograph.*` vs `playbook.*` — confirm with user at deploy

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; existing Prisma/Zod/Express patterns verified in repo
- Architecture: HIGH — CONTEXT locks Event scope; codebase touchpoints mapped
- Pitfalls: HIGH — domain drift and multi-file plumbing documented in PITFALLS.md + `index.html`

**Research date:** 2026-05-19  
**Valid until:** 2026-06-19 (stable Prisma/env patterns)
