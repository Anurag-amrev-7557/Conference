# Phase 11: Per-Route Head Management - Research

**Researched:** 2026-05-19  
**Domain:** Client-side per-route document head (`react-helmet-async`), centralized `src/seo/` resolver, SPA meta for marketing routes  
**Confidence:** HIGH (locked CONTEXT + codebase); MEDIUM (Helmet React 19 prerender path — verified README, needs Phase 14 validation)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Add **`react-helmet-async@3.0.0`** and mount **`HelmetProvider`** in `main.tsx` wrapping the app tree (outside `Router`, alongside `WebsiteDataProvider`).
- **D-02:** Centralize head logic in **`src/seo/`**: `SeoHead.tsx` (declarative tags), `seoConfig.ts` (`resolvePageSeo`), `types.ts`, `routes.ts` (static route defaults + public route registry for later sitemap/prerender). Pages consume via **`usePageSeo`** hook or thin wrapper — not raw `<Helmet>` scattered per page.
- **D-03:** **Remove SEO duties from `ThemeSynchronizer`** (`App.tsx` lines 68–73: `document.title` and `meta[name=description]`). `ThemeSynchronizer` remains theme/CSS/custom-css only.
- **D-04:** All canonical, `og:url`, and absolute `og:image` / `twitter:image` values use **`absoluteUrl(path)`** from `src/seo/siteUrl.ts` after `WebsiteDataProvider` calls `setSiteOrigin(siteUrl)` — never hardcode `monograph.superhumanly.ai` or read hosts from `index.html`.
- **D-05:** Canonical path = current public pathname (including `/blog/:slug`); trailing-slash policy: **no trailing slash** on canonical paths except root `/`.
- **D-06:** **Blog post (`/blog/:slug`):** `title` = `article.seoTitle` ?? `` `${article.title} | ${settings.seo.title}` ``; `description` = `article.seoDescription` ?? `article.excerpt` ?? `settings.seo.description`; `ogImage` = `article.ogImage` ?? `settings.seo.ogImage` ?? `absoluteUrl('/og-image.jpg')` (static public default).
- **D-07:** **Static marketing routes** (`/`, `/blog`, `/events`, `/community`): use **`routeDefaults` in `seoConfig`** (code-level defaults per section) merged over `settings.seo.title` / `settings.seo.description` / `settings.seo.ogImage` where route-specific copy is not in CMS yet.
- **D-08:** **Events (`/events`)** — per Phase 10 **D-02**: listing-only meta; title from route default or site title; description synthesized from published events context is **not** required in Phase 11 — use route default + site fallbacks (hybrid event-level copy deferred until Event SEO columns exist).
- **D-09:** Unpublished or missing blog slug: render **`noindex`** on client; keep existing redirect-to-`/blog` behavior; do not emit article canonical for unknown slugs.
- **D-10:** **`og:type`**: `article` on `/blog/:slug`; `website` on `/`, `/blog`, `/events`, `/community`.
- **D-11:** Emit full OG set (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and matching Twitter tags (`twitter:card` = **`summary_large_image`**, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:url`) on all **indexable** public routes.
- **D-12:** OG/Twitter image URLs must be **absolute**; relative CMS paths resolved via `absoluteUrl`.
- **D-13:** **`/admin` and `/admin/*` and `/dashboard`**: `meta name="robots" content="noindex,nofollow"` always (META-05).
- **D-14:** **`/community`**: **`noindex,nofollow`** by default (aligns with `.planning/STATE.md` community indexing note until product confirms indexing).
- **D-15:** **Article**: `noindex` when `article.noindex === true` **OR** `!article.isPublished` (combine with OR per Phase 10 research).
- **D-16:** **`NotFoundPage` (`*`)**: `noindex,nofollow` to mitigate soft-404 indexing (research Pitfall 4).
- **D-17:** Strip duplicate **canonical**, **Open Graph**, and **Twitter** blocks from `index.html` (lines 13–28 today).
- **D-18:** Retain minimal shell only: `charset`, `viewport`, `favicon`, generic `<title>` (short site name or "Loading…"), optional single `meta name="description"` with neutral fallback — must not conflict with per-route Helmet output.
- **D-19:** When `settings.seo.googleSiteVerification` is non-empty, inject `<meta name="google-site-verification" content="…" />` on **all public indexable routes** via shared `SeoHead` / site-level defaults (token is site-wide, not per-article). Admin routes excluded.

### Claude's Discretion
- Exact `routeDefaults` copy strings for `/`, `/blog`, `/events`, `/community` (planner may derive from CMS section content or seed).
- Whether `Helmet` `titleTemplate` is used vs explicit string concat in `seoConfig` (prefer explicit concat per D-06 for article titles).
- File naming (`PageSeo.tsx` vs `SeoHead.tsx`) as long as one component owns tag emission.
- Unit/integration test scope for `resolvePageSeo` (recommended, not blocking context).

### Deferred Ideas (OUT OF SCOPE)
- **JSON-LD** (`BlogPosting`, `Event`, `WebSite`, etc.) — Phase 12 (SCHEMA-*).
- **Dynamic sitemap.xml / robots.txt** — Phase 13 (CRAWL-02, CRAWL-03).
- **Build-time prerender** baking head into static HTML — Phase 14 (CRAWL-04, CRAWL-05).
- **Admin SERP + social snippet preview** matching live head — Phase 15 (CMS-03, CMS-04).
- **OG image upload + sharp resize** — Phase 15 (CMS-05).
- **Per-event SEO fields and `/events/:slug` head** — when Event columns and detail routes exist (Phase 10 D-01 deferred).
- **hreflang / IndexNow** — v2 requirements.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **META-01** | Each public route renders unique title and meta description | `resolvePageSeo` + `SeoHead` per page; remove global `ThemeSynchronizer` title/description; article fallback chain D-06 |
| **META-02** | Each public route renders canonical matching `SITE_URL` + path | `normalizeCanonicalPath` + `absoluteUrl`; Phase 10 `setSiteOrigin` from API `siteUrl` |
| **META-03** | Open Graph tags appropriate to page content | `SeoHead` emits `og:*` with `og:type` article vs website (D-10) |
| **META-04** | Twitter card tags consistent with OG | Mirror title/description/image/url; `twitter:card=summary_large_image` (D-11); use `name=` not `property=` for Twitter |
| **META-05** | Admin/dashboard `noindex`; excluded from sitemap | Resolver branch for `/admin`, `/admin/*`, `/dashboard`; sitemap exclusion is Phase 13 |
| **META-06** | `index.html` minimal shell only | Remove lines 10–28 duplicate meta; keep charset/viewport/favicon/neutral fallbacks (D-17–18) |
</phase_requirements>

## Summary

Phase 11 replaces imperative global SEO in `ThemeSynchronizer` and static homepage-only tags in `index.html` with a **single declarative head pipeline**: `react-helmet-async@3.0.0`, a pure `resolvePageSeo` function in `src/seo/seoConfig.ts`, and a shared `SeoHead` component wired on each route. The resolver consumes Phase 10 data already present in the codebase — `Article` SEO fields, `settings.seo`, and `src/seo/siteUrl.ts` fed by `WebsiteDataProvider` via API `siteUrl` (server `SITE_URL`).

**Hard dependency on Phase 10:** Without `setSiteOrigin()` running after content fetch, `absoluteUrl()` returns **relative** paths (`siteUrl.ts` lines 11–14), breaking META-02/03/04. Phase 11 implementation should assume Phase 10 is complete; add a dev-only console warning if `getSiteOrigin()` is empty when resolving public routes.

**Primary recommendation:** Move provider shell to `main.tsx` (`HelmetProvider` → `WebsiteDataProvider` → `App`), implement pure `resolvePageSeo` + unit tests, mount `<SeoHead seo={...} />` at the top of every page component (including `BlogPostPage` before redirect), and trim `index.html` to a non-conflicting shell. Do **not** mix React 19 native `<title>`/`<meta>` with Helmet on different routes (STACK.md).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Per-route title/description/canonical | **Browser / Client** (`SeoHead` + Helmet) | — | SPA head updates on navigation; no SSR in v1.1 |
| SEO resolution / fallback chain | **Browser / Client** (`seoConfig.ts` pure functions) | API (data only) | Business rules live in one testable module; Phase 14 reuses same resolver |
| `SITE_URL` / absolute URL origin | **API / Backend** (`SITE_URL` env, `getSiteUrl()`) | **Browser** (`setSiteOrigin` from `GET /api/v1/content/site`) | CRAWL-01: server is source of truth; client mirrors for head tags |
| CMS SEO field storage | **Database / Storage** (Phase 10) | — | Phase 11 reads only; no schema changes |
| Global theme/CSS variables | **Browser / Client** (`ThemeSynchronizer`) | — | Must not write `document.title` after Phase 11 |
| Crawl files / prerender | — | Phase 13–14 | Out of scope; `routes.ts` registry prepares allowlist |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **react-helmet-async** | **3.0.0** | Per-route `<title>`, meta, canonical, OG/Twitter | Locked D-01; React 19 peer `^16.6 \|\| ^17 \|\| ^18 \|\| ^19` [VERIFIED: npm registry]; official README documents `HelmetProvider` + React 19 hoisting [CITED: github.com/staylor/react-helmet-async] |
| **react-router-dom** | ^7.14.0 (installed) | `useLocation().pathname` for resolver | Already used in `App.tsx` |
| **src/seo/siteUrl.ts** | (Phase 10) | `absoluteUrl`, `setSiteOrigin` | Locked D-04; no second URL helper |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **vitest** | latest stable | Unit tests for `resolvePageSeo` | Recommended discretion; no test runner in repo today |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-helmet-async@3 | React 19 native metadata only | Weaker `titleTemplate`, admin preview parity, Phase 14 head replay; STACK.md says standardize on Helmet |
| Imperative `document.head` | Helmet | Fights `index.html` shell; untestable; current `ThemeSynchronizer` anti-pattern |
| `VITE_SITE_URL` on client | API `siteUrl` only | Drift vs server; violates CRAWL-01 |

**Installation:**

```bash
npm install react-helmet-async@3.0.0
```

**Version verification (2026-05-19):** `npm view react-helmet-async version` → `3.0.0`; `peerDependencies.react` → `^16.6.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`; no `postinstall` script.

## Package Legitimacy Audit

> slopcheck unavailable at research time — package tagged per gate rules below.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| react-helmet-async | npm 3.0.0 | Years (fork of react-helmet) | ~2M/wk (npm) | github.com/staylor/react-helmet-async | unavailable | Approved — locked decision; verify at install |

**Packages removed due to slopcheck [SLOP] verdict:** none  
**Packages flagged as suspicious [SUS]:** none  

*Planner: if slopcheck available at execution, re-run `slopcheck install react-helmet-async --json` before merge.*

## Architecture Patterns

### System Architecture Diagram

```
GET /api/v1/content/site  ──►  siteUrl (SITE_URL)  ──►  setSiteOrigin()
GET /api/v1/content/...   ──►  settings.seo, articles
         │
         ▼
WebsiteDataProvider.data
         │
         ▼
usePageSeo({ article? })  ──►  resolvePageSeo(pathname, data, article?)
         │
         ▼
SeoHead  ──►  <Helmet>  ──►  document.head (title, meta, link canonical)
         │
ThemeSynchronizer (CSS vars only — no title/meta)
```

### Recommended Project Structure

```
src/
├── main.tsx                    # MODIFY: HelmetProvider → WebsiteDataProvider → App
├── App.tsx                     # MODIFY: remove SEO from ThemeSynchronizer; drop inner WebsiteDataProvider if lifted
├── seo/
│   ├── siteUrl.ts              # EXISTS (Phase 10)
│   ├── types.ts                # NEW: PageSeo, ResolvePageSeoInput
│   ├── routes.ts               # NEW: PUBLIC_ROUTE_PATHS, routeDefaults
│   ├── seoConfig.ts            # NEW: resolvePageSeo, normalizeCanonicalPath, resolveImageUrl
│   ├── SeoHead.tsx             # NEW: single Helmet emission component
│   └── usePageSeo.ts           # NEW (or src/hooks/usePageSeo.ts): location + data → PageSeo
├── pages/
│   ├── LandingPage.tsx         # MODIFY: <SeoHead />
│   ├── BlogPage.tsx            # MODIFY
│   ├── BlogPostPage.tsx        # MODIFY: SeoHead before redirect; pass article | undefined
│   ├── EventsPage.tsx          # MODIFY
│   ├── CommunityPage.tsx       # MODIFY (noindex)
│   ├── AdminPage.tsx           # MODIFY: noindex
│   ├── DashboardPage.tsx       # MODIFY: noindex
│   └── NotFoundPage.tsx        # MODIFY: noindex
index.html                      # MODIFY: trim duplicate SEO (META-06)
```

**Rationale:** Matches `.planning/research/ARCHITECTURE.md` and keeps SEO out of section components. `routes.ts` doubles as Phase 13 sitemap allowlist seed (public paths only; community flagged noindex but still listed for product decision later).

### Pattern 1: Pure resolver + dumb presenter

**What:** All branching (admin, community, article, 404, missing slug) lives in `resolvePageSeo`. `SeoHead` only maps `PageSeo` → JSX.

**When to use:** Every route; required for Phase 14 prerender importing the same function.

**Example:**

```typescript
// src/seo/types.ts
export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  ogType: 'website' | 'article';
  ogImage: string;
  ogUrl: string;
  robots?: 'noindex,nofollow';
  googleSiteVerification?: string;
}
```

### Pattern 2: HelmetProvider placement (locked D-01)

**What:** Wrap the full app tree in `main.tsx`, outside `Router`, with `WebsiteDataProvider` as child so all routes and `ThemeSynchronizer` see both contexts.

**Recommended `main.tsx` shell:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { WebsiteDataProvider } from './components/WebsiteDataProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <WebsiteDataProvider>
        <App />
      </WebsiteDataProvider>
    </HelmetProvider>
  </StrictMode>,
);
```

Then **remove** duplicate `WebsiteDataProvider` wrapper from `App.tsx` (keep `ThemeSynchronizer` + `Router` inside `App`).

[CITED: github.com/staylor/react-helmet-async — HelmetProvider wraps entire React tree]

**React 19 note:** On React 19+, `HelmetProvider` is a passthrough; tags still hoist via React. Phase 14 Puppeteer prerender should wait for network idle / `document.title` stable, not rely on `helmetContext` serialization (README: context not populated on React 19 SSR path). [CITED: github.com/staylor/react-helmet-async README — React 19 SSR note]

### Pattern 3: SeoHead tag set (indexable public route)

```tsx
// src/seo/SeoHead.tsx — illustrative; planner implements
import { Helmet } from 'react-helmet-async';
import type { PageSeo } from './types';

export function SeoHead({ seo }: { seo: PageSeo }) {
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.canonical} />
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:url" content={seo.ogUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />
      <meta name="twitter:url" content={seo.ogUrl} />
      {seo.robots && <meta name="robots" content={seo.robots} />}
      {seo.googleSiteVerification && (
        <meta name="google-site-verification" content={seo.googleSiteVerification} />
      )}
    </Helmet>
  );
}
```

Use **`name=`** for Twitter tags (current `index.html` incorrectly uses `property=` for Twitter — do not copy that pattern).

### Anti-Patterns to Avoid

- **Leaving `document.title` in `ThemeSynchronizer`:** Races Helmet on every `settings` change (Pitfall 2/3).
- **`<SeoHead>` only after `if (!article) return null` on blog posts:** Missing slug never sets `noindex` before redirect (D-09, Pitfall 4).
- **Hardcoding `monograph.superhumanly.ai`:** Use `absoluteUrl` only (D-04).
- **Duplicate `meta name="description"` in `index.html` matching CMS copy:** Shell description should be neutral/generic (D-18).

## resolvePageSeo — Implementation Notes

### Signature and inputs

```typescript
export interface ResolvePageSeoInput {
  pathname: string;
  data: WebsiteData;
  article?: Article;
}

export function resolvePageSeo({ pathname, data, article }: ResolvePageSeoInput): PageSeo
```

- **`pathname`:** `useLocation().pathname` (not `window.location` — keeps tests simple).
- **`article`:** Pass `undefined` for static routes; on `BlogPostPage`, pass `data.articles.find(a => a.slug === slug)` even when undefined (missing slug case).

### Path normalization (`normalizeCanonicalPath`)

1. Strip query/hash (router pathname already omits them).
2. If `pathname !== '/'` and ends with `/`, remove trailing slash (D-05).
3. Return path for canonical: `absoluteUrl(normalizedPath)`.

### Route classification (order matters)

| Condition | Behavior |
|-----------|----------|
| `pathname === '/dashboard'` or `pathname.startsWith('/admin')` | `robots: noindex,nofollow`; minimal title "Admin"; no GSC tag (D-13, D-19) |
| `pathname === '/community'` | `noindex,nofollow` + still emit title/description/OG for UX/shares OR minimal set — **locked: noindex** (D-14); omit from indexable GSC set |
| `pathname` not in public registry and not blog slug | `noindex,nofollow` (NotFound `*`, D-16) |
| `/blog/:slug` + no `article` | `noindex,nofollow`; canonical = `absoluteUrl('/blog')` or omit canonical link — **locked: do not emit article canonical** (D-09); prefer `/blog` listing canonical or no canonical element |
| `/blog/:slug` + article | Article branch (D-06, D-10, D-15) |
| `/`, `/blog`, `/events` | Static branch (D-07, D-08) |

### Article branch (D-06, D-10, D-15)

```typescript
const site = data.settings.seo;
const title = article.seoTitle ?? `${article.title} | ${site.title}`;
const description = article.seoDescription ?? article.excerpt ?? site.description;
const ogImage = resolveImageUrl(article.ogImage ?? site.ogImage, '/og-image.jpg');
const canonical = absoluteUrl(normalizeCanonicalPath(`/blog/${article.slug}`));
const noindex = article.noindex === true || !article.isPublished;
```

- `ogType: 'article'`
- `robots` when `noindex`

### Static marketing branch (D-07, D-08)

```typescript
const defaults = routeDefaults[pathname] ?? {};
const title = defaults.title ?? site.title;
const description = defaults.description ?? site.description;
const ogImage = resolveImageUrl(defaults.ogImage ?? site.ogImage, '/og-image.jpg');
const ogType = 'website';
```

`routeDefaults` keys: `'/'`, `'/blog'`, `'/events'`, `'/community'`. Planner seeds copy from hero/blog/events/community section tone (discretion).

**`/events`:** Do **not** synthesize description from `data.events` in Phase 11 (D-08).

### `resolveImageUrl(url, fallbackPath)`

```typescript
function resolveImageUrl(url: string | undefined, fallbackPath: string): string {
  if (!url?.trim()) return absoluteUrl(fallbackPath);
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteUrl(url.startsWith('/') ? url : `/${url}`);
}
```

Default fallback path **`/og-image.jpg`** (D-06). **Codebase gap:** `public/og-image.jpg` is **not** present today (only `favicon.svg`, fonts, static `sitemap.xml`). Planner should add default asset or document deployment expectation — broken OG image hurts META-03/04.

### Google Search Console (D-19, MSMT-01 partial)

```typescript
const googleSiteVerification = site.googleSiteVerification?.trim() || undefined;
```

Include on **indexable** public routes only (exclude admin, dashboard, community noindex, not-found, missing-slug noindex).

### `usePageSeo` hook

```typescript
export function usePageSeo(options?: { article?: Article }) {
  const { pathname } = useLocation();
  const { data } = useWebsiteData();
  return useMemo(
    () => resolvePageSeo({ pathname, data, article: options?.article }),
    [pathname, data, options?.article],
  );
}
```

### BlogPostPage integration (critical)

Current code returns `null` when `!article` after `useEffect` redirect (`BlogPostPage.tsx` lines 39–46). **Change to:**

```tsx
const article = data.articles.find((a) => a.slug === slug);
const seo = usePageSeo({ article });

return (
  <>
    <SeoHead seo={seo} />
    {!article ? null : (/* existing article UI */)}
  </>
);
```

Keep `useEffect` redirect; `noindex` must render on first paint before navigation.

### Dependency on Phase 10 `SITE_URL`

| Piece | Location | Role in Phase 11 |
|-------|----------|-------------------|
| `SITE_URL` env | `server/.env.example`, `server/src/lib/siteUrl.ts` | Server canonical origin |
| `siteUrl` in API | `server/src/routes/contentRoutes.ts` → `getSiteUrl()` | Hydrates client |
| `setSiteOrigin` | `WebsiteDataProvider.tsx` lines 70–72 | Must run before public `SeoHead` resolves absolute URLs |
| `absoluteUrl` | `src/seo/siteUrl.ts` | Returns **relative path unchanged** if origin unset — treat as bug if seen on public routes after load |

**Verification:** With API running, `GET /api/v1/content/site` includes `siteUrl`; after hydration, `getSiteOrigin()` should match production host (not `index.html` hardcode).

## index.html Trim List (META-06)

**Remove entirely (current lines 10–28):**

| Element | Reason |
|---------|--------|
| `<meta name="title" …>` | Non-standard duplicate of `<title>` |
| `<meta name="description" …>` (marketing copy) | Conflicts with per-route Helmet (use neutral shell only if kept) |
| All `property="og:*"` tags | Duplicate canonical homepage OG on every URL (Pitfall 2) |
| All `property="twitter:*"` tags | Same; wrong attribute namespace |
| `<link rel="canonical" href="https://monograph.superhumanly.ai/">` | Wrong canonical on all routes |

**Retain:**

- `<meta charset="UTF-8" />`
- `<meta name="viewport" …>`
- `<link rel="icon" …>`
- `<title>Superhumanly Monograph</title>` or `Loading…` (short, generic)
- Optional: `<meta name="description" content="Loading…" />` — **generic only**, not CMS marketing copy

**Do not add** GSC verification to `index.html` — inject via `SeoHead` when settings populated (D-19).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-navigation head reconciliation | Manual `querySelector` / createElement | react-helmet-async | Dedupes tags, React 19 aware |
| Absolute URL building | String concat with `window.location.origin` | `absoluteUrl` + API `siteUrl` | CRAWL-01; dev/prod parity |
| Route SEO registry | Ad-hoc switches in each page | `resolvePageSeo` + `routes.ts` | Prerender/sitemap parity Phase 13–14 |
| Global title for all routes | `ThemeSynchronizer` SEO block | Per-route `SeoHead` | Pitfall 3 |

## Common Pitfalls

### Pitfall 1: Client-only meta (unchanged after Phase 11)

**What goes wrong:** View Source still shows shell title until Phase 14 prerender.  
**Phase 11 scope:** Helmet fixes **post-hydration** head and social crawlers that execute JS; validate in DevTools Elements, not View Source alone.  
**How to avoid:** Document Phase 14 as crawl completeness gate (ROADMAP Phase 14).

### Pitfall 2: Duplicate canonical / OG from shell + Helmet

**What goes wrong:** Two canonicals; homepage canonical on `/blog/foo`.  
**Prevention:** Complete index.html trim (D-17); verify `document.querySelectorAll('link[rel=canonical]').length === 1` after navigation.  
[CITED: developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics]

### Pitfall 3: ThemeSynchronizer fighting Helmet

**What goes wrong:** `useEffect` in `ThemeSynchronizer` resets `document.title` when `settings` changes.  
**Prevention:** Delete lines 68–73 in `App.tsx`; CSS/customCss only.

### Pitfall 4: Soft 404 / missing blog slug

**What goes wrong:** `BlogPostPage` redirects without `noindex`; garbage URLs indexed.  
**Prevention:** `SeoHead` mounts before `return null`; resolver sets `noindex` when `!article` (D-09).

### Pitfall 5: Unset `siteOrigin` during loading

**What goes wrong:** `absoluteUrl('/blog/x')` → `/blog/x` (relative); invalid canonical.  
**Prevention:** Optional: `SeoHead` renders nothing until `getSiteOrigin()` truthy for indexable routes, or show shell title only while `loading` from `WebsiteDataProvider`.

### Pitfall 6: Missing default OG asset

**What goes wrong:** `og-image.jpg` 404 in social previews.  
**Prevention:** Add `public/og-image.jpg` (1200×630) or change fallback to an existing public URL.

## Code Examples

### resolvePageSeo — admin and static route stubs

```typescript
// src/seo/seoConfig.ts
import type { WebsiteData, Article } from '../lib/websiteData';
import { absoluteUrl } from './siteUrl';
import { routeDefaults, isPublicMarketingPath } from './routes';
import type { PageSeo, ResolvePageSeoInput } from './types';

export function resolvePageSeo(input: ResolvePageSeoInput): PageSeo {
  const { pathname, data, article } = input;
  const site = data.settings.seo;

  if (pathname === '/dashboard' || pathname.startsWith('/admin')) {
    return {
      title: 'Admin',
      description: site.description,
      canonical: absoluteUrl(pathname),
      ogType: 'website',
      ogImage: resolveImageUrl(site.ogImage, '/og-image.jpg'),
      ogUrl: absoluteUrl(pathname),
      robots: 'noindex,nofollow',
    };
  }

  if (pathname === '/community' || !isPublicMarketingPath(pathname, !!article)) {
    return buildPublicSeo(pathname, data, article, { robots: 'noindex,nofollow' });
  }

  if (pathname.startsWith('/blog/') && !article) {
    return {
      ...buildListingFallback('/blog', data),
      robots: 'noindex,nofollow',
      canonical: absoluteUrl('/blog'),
    };
  }

  if (article) {
    return buildArticleSeo(pathname, data, article);
  }

  return buildStaticSeo(pathname, data);
}
```

### ThemeSynchronizer — SEO removal

```typescript
// App.tsx — delete block 4 "Update SEO" (lines 68-73); keep sections 1-3 and 5-6 only
```

## Testing Approach

### Automated (recommended — discretion)

No test framework exists in root `package.json` today. **Wave 0 (optional but high value):** add `vitest` + `resolvePageSeo` unit tests with mocked `WebsiteData` and stubbed `setSiteOrigin('https://example.com')`.

| Case | Expect |
|------|--------|
| `/` | title from `routeDefaults` or `site.title`; indexable; GSC when set |
| `/blog/my-post` + published article | `og:type=article`; canonical `https://origin/blog/my-post` |
| `/blog/ghost` + no article | `noindex`; no article-shaped canonical |
| `noindex` article flag | `robots` noindex |
| `!isPublished` | `robots` noindex |
| `/admin/settings` | `noindex` |
| `/community` | `noindex` |
| `*` not found | `noindex` |
| Trailing slash `/blog/` | canonical without trailing slash (if router normalizes) |

**Quick run (after Wave 0):** `npx vitest run src/seo/seoConfig.test.ts`

### Manual verification (phase gate)

1. **Duplicate check:** Navigate `/` → `/blog` → `/blog/{slug}`; DevTools → `document.querySelectorAll('link[rel=canonical]').length === 1`.
2. **Title uniqueness:** Tab title changes per route (META-01).
3. **OG tags:** DevTools Elements → `meta[property="og:title"]` content matches article title on post page (META-03).
4. **Admin:** Visit `/admin` — `meta[name=robots"]` contains `noindex` (META-05).
5. **Shell:** View Source — no `og:url` pointing at homepage on `/blog` routes (META-06).
6. **SITE_URL:** Network tab → content site payload `siteUrl`; canonical host matches (not hardcoded monograph unless env says so).

### Phase 14 handoff

Export `resolvePageSeo` without React imports so `scripts/prerender.mts` can call it with fixture data + pathname. Do not import `useWebsiteData` inside `seoConfig.ts`.

## Validation Architecture

> `workflow.nyquist_validation` not set to `false` in `.planning/config.json` — section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed (Vitest recommended Wave 0) |
| Config file | none |
| Quick run command | `npx vitest run src/seo/seoConfig.test.ts` (after setup) |
| Full suite command | same |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| META-01 | Unique title/description per route | unit | `npx vitest run src/seo/seoConfig.test.ts` | ❌ Wave 0 |
| META-02 | Canonical uses SITE_URL origin | unit | same | ❌ Wave 0 |
| META-03 | OG tags on public routes | unit + manual | same + DevTools | ❌ Wave 0 |
| META-04 | Twitter mirrors OG | unit | same | ❌ Wave 0 |
| META-05 | Admin/dashboard noindex | unit | same | ❌ Wave 0 |
| META-06 | index.html shell only | manual | View Source on `/` | N/A |

### Sampling Rate

- **Per task commit:** `npx vitest run src/seo/seoConfig.test.ts` (when added)
- **Per wave merge:** full vitest file + manual route walk above
- **Phase gate:** Manual checklist green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest` + `vitest.config.ts` (or `vite.config` test block)
- [ ] `src/seo/seoConfig.test.ts` — covers META-01–05 resolver branches
- [ ] `public/og-image.jpg` — default OG fallback asset (Pitfall 6)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V5 Input Validation | yes | Phase 10 Zod on `ogImage` https URLs; React attribute escaping in Helmet |
| V2 Authentication | no | — |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `seoTitle` / `seoDescription` in meta | Tampering | React escapes text in JSX props; no `dangerouslySetInnerHTML` in `SeoHead` |
| Open redirect via canonical | Spoofing | Build canonical from `pathname` only, not query params |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | vite, npm install | ✓ | (host) | — |
| npm | install react-helmet-async | ✓ | — | — |
| API + `SITE_URL` | absoluteUrl hydration | ✓ in dev if server running | — | Dev fallback `http://localhost:5173` in server `siteUrl.ts` |
| vitest | unit tests | ✗ | — | Manual-only gate |
| slopcheck | package audit | ✗ | — | Human verify install |
| ctx7 | docs lookup | ✗ | — | GitHub README + npm view |

**Missing dependencies with no fallback:**

- None blocking implementation (vitest optional per context).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global `document.title` in `ThemeSynchronizer` | Per-route `SeoHead` | Phase 11 | Unique SERP titles per URL |
| Static homepage OG in `index.html` | Helmet per route + trimmed shell | Phase 11 | Fixes wrong canonical on deep links |
| react-helmet (sync) | react-helmet-async@3 | 3.0.0 | React 19 support |

**Deprecated/outdated:**

- `meta name="title"` in shell — remove with index.html trim.
- `property="twitter:*"` — use `name="twitter:*"` in `SeoHead`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Phase 10 complete: API returns `siteUrl`, Article SEO fields populated | Phase 10 dependency | Relative canonicals until Phase 10 ships |
| A2 | Default OG at `/og-image.jpg` is acceptable | resolvePageSeo | 404 previews until asset added |
| A3 | Community gets noindex but may still render OG tags for sharing | D-14 | Product may want full omit — confirm in verify-work |

## Open Questions

1. **Default OG asset**
   - What we know: D-06 requires `absoluteUrl('/og-image.jpg')`; file missing from `public/`.
   - What's unclear: Use seed image vs CMS-only OG.
   - Recommendation: Add `public/og-image.jpg` in Phase 11 Wave 0 or first SEO task.

2. **Canonical for missing blog slug**
   - What we know: D-09 forbids article canonical; redirect to `/blog`.
   - What's unclear: Whether to emit `/blog` canonical or no `<link rel="canonical">`.
   - Recommendation: Emit `/blog` canonical + `noindex` (discourages indexing garbage URL without claiming article URL).

3. **MSMT-01 vs Phase 15**
   - What we know: D-19 injects GSC meta on indexable routes this phase.
   - What's unclear: REQUIREMENTS traceability lists MSMT-01 as Phase 15.
   - Recommendation: Implement D-19 in Phase 11; mark MSMT-01 partial in verification; full prerender visibility in Phase 14/15.

## Sources

### Primary (HIGH confidence)
- `11-CONTEXT.md` — locked decisions D-01–D-19
- Codebase: `src/App.tsx`, `src/main.tsx`, `index.html`, `src/seo/siteUrl.ts`, `WebsiteDataProvider.tsx`, `BlogPostPage.tsx`, `server/src/lib/siteUrl.ts`, `server/src/routes/contentRoutes.ts`
- [react-helmet-async README](https://github.com/staylor/react-helmet-async/blob/main/README.md) — HelmetProvider, React 19 behavior (fetched 2026-05-19)
- [npm react-helmet-async@3.0.0](https://www.npmjs.com/package/react-helmet-async) — version and peer deps (verified via `npm view`)

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md`, `STACK.md`, `PITFALLS.md`, `SUMMARY.md`
- `.planning/phases/BOOK-10-seo-data-model-site-url-contract/10-RESEARCH.md` — SITE_URL contract
- [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) — duplicate canonical, soft 404 (cited in PITFALLS.md)

### Tertiary (LOW confidence)
- WebSearch summary of react-helmet-async 3 — cross-checked against GitHub README

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — locked version + npm + official README
- Architecture: HIGH — codebase inspected; CONTEXT locked
- Pitfalls: HIGH — PITFALLS.md aligns with live `index.html` / `ThemeSynchronizer`
- Phase 10 dependency: MEDIUM — client `siteUrl` path exists in code; Phase 10 execution status may still be in progress per STATE.md

**Research date:** 2026-05-19  
**Valid until:** 2026-06-19 (stable stack); 2026-05-26 for React 19 + Helmet edge cases
