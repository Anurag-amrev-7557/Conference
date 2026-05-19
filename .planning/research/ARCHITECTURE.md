# Architecture Research

**Domain:** Premium marketing SPA + headless CMS (React/Vite + Express/Prisma)  
**Researched:** 2026-05-19  
**Confidence:** HIGH (brownfield codebase verified); MEDIUM for prerender tooling choice (ecosystem, not yet installed)

## Executive Integration Answer

SEO and UI polish **extend the existing layers** rather than replacing them. The SPA keeps `WebsiteDataProvider` as the single content source; SEO adds a **parallel head-management layer** (`SeoHead`) and **build/deploy artifacts** (sitemap, prerendered HTML). Premium UI formalizes what `ThemeSynchronizer` and `@theme` in `index.css` already do into a **design-token contract** consumed by sections and admin preview.

**Rendering strategy for this milestone:** **Meta-first + build-time prerender** — not full SSR. Full SSR would fight stack continuity, Docker/Nginx static frontend, and the unified `GET /api/v1/content` hydration model. Google explicitly recommends server-side or pre-rendering when possible ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)); prerender fits the current `frontend` container serving `dist/` without a Node render server.

| Approach | Fit for this repo | Verdict |
|----------|-------------------|---------|
| **Meta-only** (`react-helmet-async`, per-route tags) | Required baseline; fixes social crawlers and UX; insufficient alone for `/blog/:slug` in initial HTML | **Phase 1 — ship first** |
| **Build-time prerender** (Vite post-build, Puppeteer or `vite-plugin-prerender`) | Matches Nginx static hosting; can call API during CI for dynamic slugs | **Phase 2 — recommended crawlability** |
| **Express HTML injection for bots** | Possible via Nginx `map $http_user_agent` → API; adds ops complexity | **Defer** unless GSC shows index gaps after prerender |
| **Full SSR** (Vite SSR, Remix, etc.) | Breaks monolith simplicity; second runtime on edge | **Out of scope** for v1.1 |

---

## Standard Architecture

### System Overview (Target State)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CDN / Nginx (reverse-proxy)                         │
│  /  /blog/*  /events  …  → static dist (index.html + prerendered paths)    │
│  /api/v1/*              → Express (book API)                              │
│  /sitemap.xml /robots.txt → Express seoRoutes OR baked into dist/public   │
└──────────────────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│   React SPA (Vite)   │              │  Express + Prisma    │
│                      │   fetch      │                      │
│ WebsiteDataProvider ─┼─────────────►│ GET /content         │
│ SeoHead (per route)  │              │ seoRoutes (sitemap)  │
│ ThemeSynchronizer    │              │ adminRoutes (CMS)    │
│ JsonLd components    │              │                      │
└─────────────────────┘              └─────────────────────┘
         ▲
         │ vite build + prerender script (CI: API up → slug list → HTML files)
         └──────────────────────────────────────────────────────────────────
```

### Component Responsibilities

| Component | Responsibility | Implementation in this repo |
|-----------|----------------|------------------------------|
| **WebsiteDataProvider** | Authoritative CMS payload; admin mutations | Existing — keep as single hydration point |
| **ThemeSynchronizer** | Runtime design tokens (CSS vars, custom CSS) | Existing in `App.tsx` — **remove SEO duties** |
| **SeoHead** (new) | Per-route `<title>`, meta, canonical, OG, robots | `react-helmet-async` + route/entity resolver |
| **seoConfig / usePageSeo** (new) | Merge global `settings.seo` + page/article overrides | Pure functions + hook |
| **JsonLd** (new) | Inject `application/ld+json` (Organization, Article, Event) | React components per page type |
| **seoRoutes** (new) | Dynamic `sitemap.xml`, optional `robots.txt` | Express module; Prisma queries published slugs |
| **Prerender pipeline** (new) | Emit static HTML for public routes at build | Post-`vite build` script or Vite plugin; needs route list from API/seed |
| **Design tokens** (extend) | Single source for color, type, radius, motion | Formalize `@theme` + CMS `appearance` bridge |
| **Admin SEO UI** (extend) | Per-entity OG, noindex, snippet preview | Extend `SettingsManager`, `BlogManager` |

### Current vs Target (Integration Points)

| Layer | Current | Change |
|-------|---------|--------|
| `index.html` | Static global meta + canonical | Minimal shell; fallbacks only; route meta from `SeoHead` |
| `App.tsx` `ThemeSynchronizer` | Sets `document.title` + description globally | SEO → `SeoHead`; theme only in synchronizer |
| `BlogPostPage` | No per-article meta | `usePageSeo(article)` + Article JSON-LD |
| `Article` / `SiteSettings` types | `settings.seo` title/description/ogImage optional | Add per-route and per-article SEO fields |
| Express `index.ts` | No SEO routes | Mount `seoRoutes`; optional static file headers |
| `vite build` | SPA only | Add prerender step + env `PRERENDER_API_URL` |
| `nginx.conf` | `/` → frontend, `/api/` → API | Add `location = /sitemap.xml` (and robots) if served by API |
| Admin | Global SEO tab only | Per-blog SEO fields, snippet preview, noindex toggle |

---

## Recommended Project Structure

```
src/
├── seo/                      # NEW — head tags, JSON-LD, config resolution
│   ├── SeoHead.tsx
│   ├── JsonLd.tsx
│   ├── seoConfig.ts
│   ├── routes.ts             # public route registry for sitemap/prerender
│   └── types.ts
├── styles/                   # NEW or extend index.css
│   └── tokens.css            # documented token contract (optional split from @theme)
├── hooks/
│   └── usePageSeo.ts         # NEW
├── components/
│   └── WebsiteDataProvider.tsx  # MODIFIED — expose seo helpers if needed
├── pages/
│   ├── BlogPostPage.tsx      # MODIFIED — SeoHead + semantic article shell
│   └── ...                   # MODIFIED — h1 hierarchy, SeoHead per route
server/src/
├── routes/
│   └── seoRoutes.ts          # NEW — sitemap.xml, robots.txt
├── lib/
│   └── sitemapBuilder.ts     # NEW
scripts/
└── prerender.mts             # NEW — post-build static HTML generation
public/
├── robots.txt                # NEW or template
└── (og defaults)
```

### Structure Rationale

- **`src/seo/`:** Keeps SEO out of `App.tsx` and section components; one import per page. Matches existing pattern (`lib/marketing.ts`, `lib/api.ts`).
- **Server sitemap in Express:** Content lives in Prisma; sitemap must reflect published `Article.slug` and public routes without manual updates. Build can **also** emit sitemap for offline/CDN, but API-generated stays authoritative after CMS edits until next build.
- **Prerender script outside Vite core:** Brownfield safety — add post-build step before committing to a specific Vite plugin; plugin can replace script later.

---

## Architectural Patterns

### Pattern 1: Layered SEO (Meta → Structured Data → Prerender → Crawl Files)

**What:** Four layers that stack; each layer works without the next but crawl quality improves cumulatively.

**When to use:** All public marketing routes in v1.1.

**Trade-offs:** Meta-only is fast but leaves empty shell for first crawl wave; prerender adds CI time and requires API during build.

**Data flow:**

```
Prisma (Article, SiteContent.settings)
    ↓ GET /api/v1/content
WebsiteDataProvider.data
    ↓
seoConfig.resolve({ route, article?, settings })
    ↓
SeoHead + JsonLd (client)  |  prerender script (build: same resolve, write HTML)
    ↓
sitemapBuilder ← Prisma published slugs (server) / route registry (client)
```

**Example (conceptual):**

```typescript
// src/seo/seoConfig.ts
export function resolvePageSeo(
  pathname: string,
  data: WebsiteData,
  article?: Article,
): PageSeo {
  const base = data.settings.seo;
  if (article) {
    return {
      title: article.seoTitle ?? `${article.title} | ${base.title}`,
      description: article.seoDescription ?? article.excerpt,
      canonical: `${SITE_URL}/blog/${article.slug}`,
      ogImage: article.ogImage ?? base.ogImage,
      noindex: !article.isPublished,
    };
  }
  return routeDefaults[pathname] ?? base;
}
```

### Pattern 2: Head Management via react-helmet-async (Not document.* in ThemeSynchronizer)

**What:** Declarative per-route head tags that reconcile on navigation.

**When to use:** All SPA routes; admin routes get `noindex`.

**Trade-offs:** Still client-rendered until prerender runs; must not duplicate tags from `index.html`.

**Example:**

```tsx
// src/seo/SeoHead.tsx
<Helmet>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <link rel="canonical" href={seo.canonical} />
  <meta property="og:title" content={seo.title} />
  {seo.noindex && <meta name="robots" content="noindex,nofollow" />}
</Helmet>
```

Mount `<HelmetProvider>` in `main.tsx` above `WebsiteDataProvider` or inside it.

### Pattern 3: Build-Time Prerender with API-Backed Route Discovery

**What:** After `vite build`, a Node script loads `dist/index.html`, visits each public URL (local preview server or headless Chrome), waits for content, writes `dist/blog/my-slug/index.html`.

**When to use:** Public routes: `/`, `/blog`, `/blog/:slug` (published only), `/events`, `/community` (if indexed).

**Trade-offs:** CI must run API + seed; content changes need rebuild or scheduled pipeline. **Do not prerender** `/admin/*`, `/dashboard`.

**Integration with Docker:** `docker compose build frontend` should run prerender when `PRERENDER_API_URL` points at a reachable API (build arg or multi-stage with ephemeral API).

### Pattern 4: Design Token Bridge (CMS appearance → CSS variables)

**What:** Already partially implemented: `@theme` in `index.css` defines defaults; `ThemeSynchronizer` maps `appearance` to `--color-accent`, `--font-serif`, `--radius-global`, etc.

**When to use:** Premium UI milestone — formalize token names, document in `tokens.css`, ensure admin preview and public site use same variable names.

**Trade-offs:** Runtime injection prevents full static CSS extraction; acceptable for brand theming.

**Example (existing pattern to preserve):**

```tsx
// App.tsx ThemeSynchronizer — keep theme-only
document.documentElement.style.setProperty('--color-accent', appearance.primaryColor);
```

Add token tiers: `--space-*`, `--ease-*`, `--duration-*` for motion consistency (Framer/GSAP).

### Pattern 5: JSON-LD as Presentational SEO Components

**What:** Small components render `<script type="application/ld+json">` from CMS entities.

**When to use:** Home (`Organization` + `WebSite`), blog post (`Article` or `BlogPosting`), events (`Event`).

**Trade-offs:** Google allows JS-generated structured data but recommends testing in Rich Results Test ([structured data JS guide](https://developers.google.com/search/docs/guides/generate-structured-data-with-javascript)).

---

## Data Flow

### Public Page Load (unchanged core, extended head)

```
Browser GET /
    ↓
Nginx → frontend container (static file or prerendered /index.html)
    ↓
main.tsx → WebsiteDataProvider.fetchContent()
    ↓
GET /api/v1/content → contentRoutes → Prisma
    ↓
React Router renders page
    ↓
SeoHead resolves meta from route + data
ThemeSynchronizer applies appearance CSS vars
JsonLd injects schema
MarketingTracker logs page_view (unchanged)
```

### Admin SEO Save

```
SettingsManager / BlogManager
    ↓
updateSettings / updateArticle (existing provider methods)
    ↓
PUT /api/v1/admin/* → Prisma
    ↓
fetchContent() refresh
    ↓
(Optional future) POST /api/v1/admin/rebuild-sitemap or CI webhook
```

### Build / Deploy

```
npm run build (tsc + vite build)
    ↓
node scripts/prerender.mts
    - fetch GET /api/v1/content (or /content/site + articles list)
    - for each public route: render HTML → dist/.../index.html
    ↓
Docker frontend image copies dist/
    ↓
Nginx serves static; /api proxied to Express
```

### State Management

| State | Owner | SEO/UI notes |
|-------|-------|----------------|
| Site content | `WebsiteDataProvider` | Add seo fields to types + merge logic |
| Document head | `SeoHead` + Helmet | Replaces imperative `document.title` in ThemeSynchronizer |
| Theme tokens | `ThemeSynchronizer` + `@theme` | UI polish extends variables, not duplicate inline styles |
| Crawl artifacts | Express and/or `dist/` | Sitemap must list only published, indexable URLs |

---

## Suggested Build Order

Order respects dependencies: **data model → client head → semantics → structured data → crawl files → prerender → admin tools → measurement → UI polish**.

| Order | Workstream | New / Modified | Depends on | Delivers |
|-------|------------|----------------|------------|----------|
| **1** | Design token contract | **Modify** `index.css`, `ThemeSynchronizer`; optional `tokens.css` | — | Stable variables for UI polish pass |
| **2** | SEO data model | **Modify** `websiteData.ts`, Prisma/`Article`, seed, provider merge; **Modify** admin save payloads | — | Per-article and per-route SEO fields in API |
| **3** | `SeoHead` + route registry | **New** `src/seo/*`, `usePageSeo`; **Modify** `main.tsx`, `App.tsx` (strip SEO from ThemeSynchronizer), each public `pages/*` | 2 | Correct titles/descriptions/canonicals on navigation |
| **4** | Semantic HTML & heading audit | **Modify** section/page components | 1 (tokens) | Accessible outline, CWV-friendly markup |
| **5** | JSON-LD | **New** `JsonLd.tsx`; **Modify** `LandingPage`, `BlogPostPage`, `EventsPage` | 2, 3 | Rich result eligibility |
| **6** | `robots.txt` + meta robots policy | **New** `public/robots.txt` or `seoRoutes`; **Modify** admin noindex flags | 3 | Crawl policy; block `/admin` |
| **7** | Dynamic sitemap | **New** `seoRoutes.ts`, `sitemapBuilder.ts`; **Modify** `server/index.ts`, `nginx.conf` | 2 | Discoverable URLs for GSC |
| **8** | Build-time prerender | **New** `scripts/prerender.mts`; **Modify** `package.json`, CI/Dockerfile, `vite.config` | 2, 3, 7 (route list) | HTML in first response for key URLs |
| **9** | Admin SEO tools | **Modify** `SettingsManager`, `BlogManager`; **New** snippet preview component | 2, 3 | Editors control OG, noindex, previews |
| **10** | Search Console & analytics | **Modify** `settings.scripts` injection or env-based GSC verification meta | 3 | Verification, monitoring |
| **11** | Premium UI polish pass | **Modify** sections, motion (Framer/GSAP), responsive layouts | 1, 4 | Visual milestone completion |
| **12** | CWV & performance | **Modify** images, lazy-load, bundle split, prerender cache headers | 8, 11 | LCP/INP targets |

**Parallelizable after step 3:** Steps 4–5 (semantics + JSON-LD) and 6–7 (robots + sitemap) can run in parallel. Step 11 (UI polish) can start after step 1 and overlap with 3–7.

**Do not start prerender (8) before:** route-level `SeoHead` works in dev, published slug list is stable, and CI can reach the API.

---

## New vs Modified Checklist

### New

| Artifact | Purpose |
|----------|---------|
| `src/seo/SeoHead.tsx` | Per-route head tags |
| `src/seo/JsonLd.tsx` | Structured data |
| `src/seo/seoConfig.ts` | Resolve meta from CMS + route |
| `src/seo/routes.ts` | Canonical public path list |
| `src/hooks/usePageSeo.ts` | Page-level hook |
| `server/src/routes/seoRoutes.ts` | Sitemap/robots HTTP |
| `server/src/lib/sitemapBuilder.ts` | XML generation from Prisma |
| `scripts/prerender.mts` | Post-build static HTML |
| `public/robots.txt` | Default crawl rules |

### Modified

| Artifact | Change |
|----------|--------|
| `src/App.tsx` | Remove SEO from `ThemeSynchronizer`; wrap with `SeoHead` at router level or per page |
| `src/main.tsx` | `HelmetProvider` |
| `src/lib/websiteData.ts` | Extend `Article`, `SiteSettings.seo`, route SEO map |
| `src/pages/BlogPostPage.tsx` | `SeoHead`, `<article>`, JSON-LD |
| `src/pages/*.tsx` | Per-route SEO + semantic landmarks |
| `src/components/admin/SettingsManager.tsx` | OG image, GSC meta, snippet preview |
| `src/components/admin/BlogManager.tsx` | Per-article SEO fields |
| `server/prisma/schema.prisma` | Optional `seoTitle`, `seoDescription`, `ogImage`, `noindex` on `Article` |
| `server/src/index.ts` | Mount `/sitemap.xml`, `/robots.txt` |
| `nginx.conf` | Proxy or alias for sitemap if API-served |
| `vite.config.ts` / `package.json` | Prerender script, `react-helmet-async` |
| `index.html` | Reduce duplicate static meta (keep charset, viewport, fallback) |
| `docs/deployment.md` | Document prerender env and rebuild-on-publish |

### Unchanged (explicitly)

- `WebsiteDataProvider` hydration pattern (`GET /api/v1/content`)
- React Router history API routes (already correct for Google)
- Marketing telemetry path (`MarketingTracker` → server proxy)
- Admin JWT auth model
- Docker topology (static frontend + API); no SSR Node on edge

---

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| **0–1k users** | Meta + sitemap + prerender sufficient; SQLite OK |
| **1k–100k users** | CDN cache static assets; shorten prerender set to money pages; consider on-publish rebuild webhook |
| **100k+** | Postgres migration (deferred v1.0); ISR-like rebuild queue; edge CDN for `dist/`; optional dedicated render worker |

### Scaling Priorities

1. **First bottleneck:** Stale prerender after CMS publish — mitigate with rebuild on admin save or nightly CI.
2. **Second bottleneck:** Large unified content payload — split read endpoints only if LCP suffers (not required for v1.1).

---

## Anti-Patterns

### Anti-Pattern 1: Full SSR Rewrite for SEO

**What people do:** Migrate to Next.js/Remix for ranking.  
**Why it's wrong:** Violates stack continuity; duplicates CMS hydration; new deploy model.  
**Do this instead:** Meta layer + build-time prerender on existing Vite output.

### Anti-Pattern 2: SEO Only in ThemeSynchronizer / document.*

**What people do:** Keep global `useEffect` title updates (current `App.tsx`).  
**Why it's wrong:** One title for all routes; blog posts invisible to OG; races with Helmet.  
**Do this instead:** `SeoHead` per route; ThemeSynchronizer for CSS only.

### Anti-Pattern 3: Static sitemap checked into git

**What people do:** Hand-maintained `sitemap.xml`.  
**Why it's wrong:** Drifts from CMS slugs and `isPublished`.  
**Do this instead:** Generate from Prisma in `seoRoutes` (and optionally bake at build).

### Anti-Pattern 4: Prerendering admin and community UGC

**What people do:** Prerender all routes from react-snap crawl.  
**Why it's wrong:** Admin leaks, infinite community URLs, stale UGC.  
**Do this instead:** Explicit allowlist in `src/seo/routes.ts`.

### Anti-Pattern 5: Duplicate canonical / robots in index.html and Helmet

**What people do:** Static canonical in `index.html` plus JS canonical per route.  
**Why it's wrong:** Google warns against conflicting canonicals.  
**Do this instead:** Single canonical source per URL in `SeoHead`; minimal `index.html` shell.

### Anti-Pattern 6: UI polish without token contract

**What people do:** Per-component color/spacing tweaks.  
**Why it's wrong:** Fighting CMS `appearance` and inconsistent premium feel.  
**Do this instead:** Extend `@theme` + CSS variables first, then section pass.

---

## Integration Points

### External Services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| **Google Search Console** | HTML meta verification in `settings` or env | After sitemap URL live |
| **Analytics** | Existing `settings.scripts.header/footer` | Load after consent if required |
| **Social crawlers** | OG/Twitter tags in `SeoHead` | Require absolute image URLs (`ogImage`) |
| **marketing-backend** | Unchanged — no SEO coupling | Keep telemetry separate from crawl layer |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **SPA ↔ Express** | `GET /content` for hydration; `GET /sitemap.xml` for crawlers | Sitemap does not need full content payload |
| **Build ↔ API** | Prerender script calls API during CI | Fail build if API unreachable or document contract |
| **SeoHead ↔ WebsiteDataProvider** | Read-only `data` + route params | No second fetch for SEO |
| **Admin ↔ SEO fields** | Same admin PUT paths | Extend JSON on `Article` / `settings` |
| **Nginx ↔ frontend/API** | Static files vs proxy | Add explicit locations for sitemap/robots if API-served |

### Prerender vs SSR vs Meta-Only Decision Record

| Criterion | Meta-only | Prerender | SSR |
|-----------|-----------|-----------|-----|
| Implementation cost | Low | Medium | High |
| Fits Docker static frontend | Yes | Yes | No (needs Node render) |
| Dynamic CMS blog slugs | Poor initial HTML | Good | Best |
| Admin preview | Native SPA | Native SPA | Complex |
| **Recommendation** | **Required** | **Adopt for v1.1** | **Defer** |

---

## Sources

- [Google Search Central — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) (HIGH — official; recommends pre-render/SSR when possible)
- Brownfield codebase: `.planning/codebase/ARCHITECTURE.md`, `src/App.tsx`, `server/src/index.ts`, `docs/deployment.md`, `nginx.conf` (HIGH)
- [vite-plugin-prerender](https://www.npmjs.com/package/vite-plugin-prerender) (MEDIUM — ecosystem option; evaluate vs custom `scripts/prerender.mts`)
- SPA delivery / indexing discussions (MEDIUM — supporting rationale for prerender; not sole authority)

---
*Architecture research for: Book Website v1.1 — Premium Presentation & SEO Dominance*  
*Researched: 2026-05-19*
