# Pitfalls Research

**Domain:** Adding aggressive technical SEO + premium UI to an existing React/Vite marketing SPA (brownfield book website)
**Researched:** 2026-05-19
**Confidence:** HIGH (codebase-specific pitfalls); MEDIUM (ecosystem patterns verified against Google Search Central)

## Critical Pitfalls

### Pitfall 1: Assuming client-side meta updates are enough for indexing

**What goes wrong:**
Every public URL (`/`, `/blog`, `/blog/:slug`, `/events`, `/community`) serves the same `index.html` shell. Per-route titles and descriptions are not implemented today; `ThemeSynchronizer` only applies **global** `settings.seo.title` and `settings.seo.description` after `WebsiteDataProvider` finishes fetching. Crawlers and social preview bots often see homepage defaults from `index.html` (static OG, canonical, title) until JS runs—and some bots never execute JS.

**Why it happens:**
Teams bolt on `document.title` / `useEffect` meta updates because it “works in the browser.” Google’s JavaScript SEO docs explicitly note that rendering is queued separately from crawling, and that pre-rendering/SSR is still recommended for speed and for non-JS crawlers ([JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).

**How to avoid:**
Choose an explicit crawl strategy early: **build-time prerender** (Vite SSG plugin / `vite-plugin-ssr` / custom prerender script) for marketing routes + dynamic blog slugs from API, **or** lightweight SSR/meta injection at the edge. Pair with per-route head management (`react-helmet-async` or equivalent) that runs during prerender/SSR, not only after client hydration.

**Warning signs:**
- View Source on `/blog/my-post` shows homepage `<title>` and OG tags
- Rich Results Test / URL Inspection “HTML” tab differs from “Rendered” tab for title/description
- Social share previews always show homepage copy

**Phase to address:**
**Crawlability & Core Web Vitals** (prerender/SSR strategy) + **Technical SEO foundation** (per-route meta)

---

### Pitfall 2: Duplicate and conflicting meta/canonical tags

**What goes wrong:**
`index.html` already defines `<title>`, `meta name="title"`, `meta description`, full Open Graph/Twitter set, and a **homepage-only** `<link rel="canonical" href="https://monograph.superhumanly.ai/" />`. Adding Helmet or manual DOM updates without removing or reconciling static tags yields duplicate descriptions, conflicting canonicals, or canonicals that always point to `/` on every route—classic duplicate-content signals.

**Why it happens:**
SEO work is layered onto the existing shell without a single “head owner.” Google warns that multiple or changing `rel="canonical"` implementations cause unexpected consolidation ([JavaScript SEO basics — canonical](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).

**How to avoid:**
One head pipeline per route: either **server/prerender emits the only canonical + OG set**, or client replaces tags atomically (remove stale `link[rel=canonical]` / duplicate `og:*` before insert). Per-route canonical must match the public URL (including slug paths). Keep `index.html` minimal (charset, viewport, default fallbacks only).

**Warning signs:**
- Lighthouse SEO audit flags “Document does not have a valid `rel=canonical`” or multiple canonicals
- `document.querySelectorAll('link[rel=canonical]').length > 1`
- Blog URLs in Search Console indexed with homepage title snippet

**Phase to address:**
**Technical SEO foundation** (per-route meta, canonical policy)

---

### Pitfall 3: Global admin SEO settings masking per-page needs

**What goes wrong:**
`SettingsManager` exposes a single site-wide SEO title/description; `ThemeSynchronizer` applies them on every route. Blog posts, events, and landing sections need unique titles, descriptions, and OG images—but editors believe SEO is “done” after filling global fields.

**Why it happens:**
The CMS was designed with one `settings.seo` blob in Prisma JSON, matching early prototype needs—not page-level SEO objects.

**How to avoid:**
Extend content models (articles, events, static pages) with `seoTitle`, `seoDescription`, `ogImage`, `noindex`, `canonicalOverride`. Admin UI: per-entity SEO tab + snippet preview. Runtime: route-level head resolver with fallback chain (entity → section default → site default).

**Warning signs:**
- All Search Console URLs share identical title length/pattern
- CTR flat for long-tail blog queries despite good content

**Phase to address:**
**Content SEO** + **Admin SEO tools** (per-page fields, snippet preview)

---

### Pitfall 4: Soft 404s on SPA catch-all routes

**What goes wrong:**
`NotFoundPage` renders for `path="*"` but the server still returns **HTTP 200** with the SPA shell. Google documents soft 404 risk for client-routed SPAs ([JavaScript SEO basics — soft 404](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)). Invalid `/blog/bad-slug` may briefly render then client-redirect (`BlogPostPage` navigates to `/blog` when `article` is missing) without `noindex`.

**Why it happens:**
React Router handles missing routes in the browser; static hosting (S3, nginx `try_files`) serves `index.html` for all paths.

**How to avoid:**
Hosting layer: map unknown paths to real **404** where possible, or prerender a `/404.html` with `noindex`. App layer: for unknown slugs, set `robots` noindex **before** redirect (Google notes removing `noindex` via JS may not work as expected). Prefer server/prerender to emit 404 status for unknown blog slugs.

**Warning signs:**
- Search Console “Indexed, though blocked by robots.txt” / “Crawled – currently not indexed” spikes on garbage URLs
- “Soft 404” validation in URL Inspection

**Phase to address:**
**Crawlability & Core Web Vitals** + **Content SEO** (slug validation)

---

### Pitfall 5: Dynamic sitemap that omits or stale-lists CMS content

**What goes wrong:**
A static `public/sitemap.xml` ships once and never includes new blog posts, unpublished drafts, or `/admin` paths incorrectly included. Conversely, sitemaps list draft URLs because they read unfiltered Prisma data.

**Why it happens:**
Sitemaps are treated as a one-time file instead of a **build/deploy artifact** generated from the same API that powers the site.

**How to avoid:**
Generate `sitemap.xml` (and `robots.txt`) on the Express server or at CI build time from published articles/events only; reference sitemap in robots; ping Search Console after deploy. Exclude `/admin`, `/dashboard`, preview query params.

**Warning signs:**
- New posts not appearing in Coverage report weeks after publish
- Sitemap contains 404 URLs or admin URLs

**Phase to address:**
**Technical SEO foundation** (dynamic sitemap) + **Search Console readiness**

---

### Pitfall 6: JSON-LD and structured data injected too late or duplicated

**What goes wrong:**
`Book`, `Article`, `Organization`, `Event` schema added via `useEffect` after `WebsiteDataProvider` fetch. Structured data missing in initial HTML, invalid after admin edits, or duplicated on route changes without cleanup.

**Why it happens:**
Developers follow React patterns; Google allows JS-generated JSON-LD but recommends testing rendered output ([structured data with JavaScript](https://developers.google.com/search/docs/guides/generate-structured-data-with-javascript)).

**How to avoid:**
Inject JSON-LD during prerender/SSR for public routes; on client navigation, replace a single `#structured-data` script tag. Validate with Rich Results Test per template type. Map fields from CMS (author, datePublished, image URL absolute paths).

**Warning signs:**
- Rich Results Test: “No items detected” on live URL
- Multiple `application/ld+json` blocks after client navigations

**Phase to address:**
**Technical SEO foundation** (JSON-LD) + **Content SEO** (article/event fields)

---

### Pitfall 7: Core Web Vitals regression from “premium” motion stack

**What goes wrong:**
LCP and INP worsen after adding more Framer Motion (`HeroSection`, `BookShowcase` GSAP + ScrollTrigger, scroll-linked springs on `BlogPostPage`), optional Three.js, extra fonts, and full-screen blurs. Hero content animates from `opacity: 0`; mouse-tracking `useMotionValue` runs on every move; main thread blocked during interaction.

**Why it happens:**
Premium UI is judged visually in dev on fast machines, not on mid-tier mobile with 4× CPU slowdown. Unused `@react-three/*` deps in `package.json` invite “just add a 3D hero” without bundle budget.

**How to avoid:**
Performance budget before polish: LCP element (hero H1/image) visible without waiting for animation timelines; `prefers-reduced-motion` disables non-essential motion; code-split GSAP/Three to non-critical routes; use `transform`/`opacity` only; lazy-load below-fold only ([Google lazy-loading guidance](https://developers.google.com/search/docs/guides/lazy-loading)). Remove or wire Three.js deliberately—do not add to landing bundle speculatively.

**Warning signs:**
- Lighthouse mobile LCP > 2.5s, INP > 200ms after UI milestone
- Main bundle grows > 30% with no route-level splitting
- Hero text invisible in Lighthouse screenshot at load

**Phase to address:**
**Premium UI/UX polish** (must include perf budget) + **Crawlability & Core Web Vitals**

---

### Pitfall 8: SEO-critical content blocked behind client fetch waterfall

**What goes wrong:**
All public copy and blog HTML arrive via monolithic `GET /api/v1/content` inside `WebsiteDataProvider`. Meta tags and article body depend on network + JSON parse before meaningful DOM exists—hurting LCP and delaying what Google sees on first render.

**Why it happens:**
Existing architecture optimizes CMS simplicity over crawl latency (documented in `CONCERNS.md`).

**How to avoid:**
For SEO routes: prerender with embedded critical JSON, or split endpoints (`/api/v1/articles/:slug`) with parallel fetch; inline critical article title/excerpt in prerendered HTML; cache public content at CDN with `ETag`.

**Warning signs:**
- Blank or generic hero until API completes on slow 3G
- URL Inspection shows thin content in HTML, full content only after render

**Phase to address:**
**Crawlability & Core Web Vitals** (ties to backend content API shape)

---

### Pitfall 9: Indexing admin, preview, and staging surfaces

**What goes wrong:**
`/admin/*`, `/dashboard`, and admin preview overlays become discoverable via links or sitemap leaks. `robots.txt` alone is insufficient if pages are linked internally.

**Why it happens:**
No `noindex` on authenticated routes; staging domains copy production `robots.txt`.

**How to avoid:**
`noindex, nofollow` on all admin routes (static in prerender or meta); `X-Robots-Tag` on admin API responses; disallow `/admin` in robots; separate staging hostname with global noindex.

**Warning signs:**
- Site: search shows admin login or “dashboard” titles
- Coverage includes `/admin/dashboard`

**Phase to address:**
**Technical SEO foundation** + **Search Console readiness**

---

### Pitfall 10: Domain and brand URL inconsistency

**What goes wrong:**
`index.html` canonical/OG use `monograph.superhumanly.ai` while API defaults reference `api.superhumanly-thoughts.com` and CORS lists mixed Superhumanly/Vellux origins. Sitemap, canonical, and OG URLs disagree across environments—split ranking signals.

**Why it happens:**
Brownfield rebrand without a single production URL matrix (documented naming drift in `CONCERNS.md`).

**How to avoid:**
Lock one canonical origin in env (`SITE_URL`); generate all absolute URLs from it; 301 non-canonical hosts; align `VITE_API_URL` and marketing proxy paths in same phase as SEO.

**Warning signs:**
- Search Console property mismatch (www vs apex, old domain still receiving impressions)
- OG debugger shows wrong host

**Phase to address:**
**Search Console readiness** + **Production infrastructure** (if env alignment not done)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Client-only `document.title` per route | Fast to ship | Poor snippets, weak non-Google bots | Never for public marketing URLs |
| Static `sitemap.xml` in `public/` | Zero backend work | Stale/incomplete index | Never after blog CMS is live |
| Reuse global `settings.seo` for all pages | No schema migration | Wrong titles on long-tail pages | Temporary ≤1 week with explicit debt ticket |
| Add Three.js hero for “wow” | Visual differentiation | +200KB+ JS, GPU drain, CWV fail | Only if lazy-loaded, off critical path, and budget passes |
| Skip `prefers-reduced-motion` | Less CSS/JS branching | A11y complaints, motion sickness, CLS from interrupted animations | Never for production marketing site |
| Block JS in `robots.txt` to “fix” crawl errors | Quick Search Console green | Broken rendering in Googlebot | **Never** — Google needs JS/CSS for rendering |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Google Search Console** | Verify only homepage; ignore Coverage/Pages | Verify domain property; submit sitemap; fix indexed vs excluded per URL type |
| **Google Rich Results / URL Inspection** | Test logged-in or draft URLs | Test public prerendered URL; compare HTML vs rendered |
| **Open Graph / Twitter** | Only `og:title` via JS | Absolute `og:url`, `og:image` (1200×630), per-article image from CMS |
| **Express content API** | Sitemap hand-maintained separately | Single generator reading `isPublished` flags from Prisma |
| **Admin CMS preview** | Preview URLs share production slug | `noindex` preview routes or tokenized preview host |
| **Marketing-backend events** | Flood page_view on meta-only changes | Debounce head updates; don’t fire duplicate page_view on SEO A/B |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| GSAP ScrollTrigger on landing | Janky scroll, high main-thread time | Scope to below-fold; kill on `prefers-reduced-motion` | Mobile mid-tier, INP failures |
| Framer Motion on every admin + public component | Large JS parse cost | Lazy-load admin motion; static public chrome | First visit LCP |
| Hero `initial={{ opacity: 0 }}` | LCP element delayed | Animate only non-LCP elements; SSR visible hero | Always on mobile Lighthouse |
| Monolithic `/api/v1/content` | Slow TTFB for first paint | Split + cache public reads | >50 articles or slow DB |
| `websiteData.ts` fallback bundle | Inflated JS regardless of API health | Skeleton defaults only | Every page load |
| Lazy-loading hero/heading images | LCP not in first paint | `fetchpriority="high"`, no lazy above fold | Google lazy-load audit fail |
| Custom webfonts without metrics | CLS on font swap | `font-display: optional` or size-adjust + preload | First contentful paint |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Admin-injected `customCss` + new third-party scripts for “premium” | XSS breaks site + poisons SEO (malicious redirects) | Keep Phase 2 sanitization; CSP; no arbitrary script tags from CMS |
| Public `noindex` toggles without auth | Competitor/noise can deindex pages | Server-enforced `noindex` only via authenticated admin |
| Leaking draft articles in sitemap/API | Unpublished content indexed | Filter `isPublished` server-side for sitemap and public API |
| Staging with production `robots` | Staging duplicates indexed | `noindex` all non-prod; basic auth on staging |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Heavy motion without reduced-motion | Vestibular issues; feels sluggish | `prefers-reduced-motion: reduce` disables GSAP/hero loops |
| Layout shift from dynamic nav/hero | CLS, mistrust | Reserve height for navbar, hero media dimensions |
| Infinite scroll blog without paginated URLs | Can’t share deep links; crawl gaps | Paginated routes or “load more” with `?page=` per Google pagination guidance |
| SEO snippet preview only in admin global tab | Editors optimize wrong page | Per-article live preview component |
| Custom cursor (`CustomCursor`) on touch | Broken mobile UX, wasted JS | Disable below `lg` or pointer:fine |

## "Looks Done But Isn't" Checklist

- [ ] **Per-route meta:** View Source (not DevTools Elements) on `/blog/:slug` shows unique title, description, canonical — verify with curl or prerender output
- [ ] **Sitemap:** Includes all published slugs; excludes drafts, admin, 404s — verify count matches DB `isPublished`
- [ ] **robots.txt:** References sitemap; does **not** disallow `/assets/*.js` or CSS — verify in Search Console robots tester
- [ ] **Structured data:** Rich Results Test passes for `Article` on a live post URL
- [ ] **404 handling:** Unknown slug returns 404 status or documented noindex+redirect strategy — verify with `curl -I`
- [ ] **OG images:** Absolute URLs resolve 200; not default homepage image on articles
- [ ] **CWV:** Mobile Lighthouse field-like lab run on `/` and `/blog/[top-post]` — LCP, INP, CLS in “good” range
- [ ] **Admin routes:** `site:example.com/admin` returns no results
- [ ] **Canonical host:** One hostname in Search Console; no mixed `superhumanly-thoughts` vs `monograph` in tags

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong canonical sitewide | MEDIUM | Fix tags + deploy; request indexing for key URLs; wait for recrawl |
| Soft 404 mass indexing | MEDIUM | Add noindex/404; validate redirects; temporary removal tool for worst URLs |
| CWV regression | MEDIUM–HIGH | Profile bundle; defer motion; prerender hero; redeploy; monitor CrUX 28d |
| Duplicate meta | LOW | Single head owner; redeploy; no removal tool needed if content unchanged |
| Stale sitemap | LOW | Regenerate; resubmit sitemap in GSC |
| Indexed admin | LOW | noindex + robots disallow; removal request if sensitive |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Client-only meta insufficient | Crawlability & CWV + Technical SEO | View Source + URL Inspection HTML vs rendered |
| Duplicate/conflicting meta & canonical | Technical SEO | `canonical` count = 1; matches `location.href` path |
| Global SEO only | Content SEO + Admin SEO tools | Blog post has unique title in SERP preview tool |
| Soft 404s | Crawlability & CWV + Content SEO | `curl -I` on bad slug; GSC Page indexing |
| Stale/wrong sitemap | Technical SEO | Sitemap URL count = published posts; no admin URLs |
| Late JSON-LD | Technical SEO | Rich Results Test on production URL |
| Motion/CWV regression | Premium UI + Crawlability & CWV | Lighthouse mobile + `prefers-reduced-motion` manual test |
| API content waterfall | Crawlability & CWV | LCP element in prerender HTML without waiting for fetch |
| Indexed admin/preview | Technical SEO + Search Console | `site:domain admin`; Coverage filters |
| Domain inconsistency | Search Console readiness + Infra | All tags use `SITE_URL`; redirect audit |

## Sources

- [Google Search Central — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) (HIGH)
- [Google Search Central — Fix lazy-loaded content](https://developers.google.com/search/docs/guides/lazy-loading) (HIGH)
- Codebase: `index.html`, `src/App.tsx` (`ThemeSynchronizer`), `src/components/admin/SettingsManager.tsx`, `.planning/codebase/CONCERNS.md` (HIGH)
- [React SPA SEO audit patterns](https://crawlix.app/blog/react-spa-seo-audit/) (MEDIUM — ecosystem, cross-check with Google docs)
- [Core Web Vitals optimization patterns](https://web.dev/articles/vitals) (MEDIUM)

---
*Pitfalls research for: v1.1 Premium Presentation & SEO Dominance — brownfield React/Vite SPA*
*Researched: 2026-05-19*
