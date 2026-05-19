# Feature Research

**Domain:** Book / author marketing website — technical SEO + premium presentation (v1.1 milestone)
**Researched:** 2026-05-19
**Confidence:** HIGH (stack/architecture), MEDIUM (competitive UX patterns — industry blogs, not A/B data)

## Brownfield Baseline (Already Built — Out of Scope for “New” Rows)

| Capability | Current state |
|------------|---------------|
| Global title + meta description | `index.html` defaults + `ThemeSynchronizer` overwrites from `settings.seo` |
| Static sitemap | `public/sitemap.xml` — 3 URLs, stale `lastmod`, no blog slugs |
| robots.txt | `public/robots.txt` — allow all, sitemap pointer |
| Blog slug URLs | `/blog/:slug`, `Article.slug` in Prisma |
| Admin CMS | Global SEO tab (title + description only); `ogImage` in types unused |
| Premium motion (partial) | Framer Motion on blog (reading progress), GSAP/Three on landing |
| Semantic shells (partial) | `<main>` on some pages; blog uses `<article>` |

This document covers **gaps only** — what v1.1 must add for “SEO dominance” and premium UX.

---

## Feature Landscape

### Table Stakes (Users & Google Expect These)

Missing these makes the site feel amateur and hurts indexation/sharing despite good content.

| Feature | Why Expected | Complexity | Notes / CMS dependency |
|---------|--------------|------------|------------------------|
| **Per-route meta tags** (title, description, canonical, OG, Twitter) | Every shared blog URL should show the article title and image, not the homepage defaults. Google and social crawlers use `<head>` per URL. | MEDIUM | Requires `react-helmet-async` (or equivalent) on each public route **plus** crawlable HTML (see prerender). Extend beyond global `settings.seo` in `App.tsx`. Blog: derive from `Article`; static routes: section-specific defaults in CMS or code. |
| **Crawlable HTML for public routes** | React SPA serves one shell; social bots and delayed Google indexing see empty/generic head without prerender/SSR. | HIGH | **Recommended:** build-time prerender for `/`, `/blog`, `/blog/:slug`, `/events`, `/community` (Vite plugin or Puppeteer post-build). Full SSR is overkill for this site size. Blocks correct OG until done. |
| **Dynamic XML sitemap** | Static file misses all blog posts and has wrong dates; Google expects `lastmod` when content changes ([Google sitemap docs](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)). | MEDIUM | **Depends on Express API:** `GET /sitemap.xml` generated from `Article`, `Event`, published flags. Include only canonical HTTPS URLs. Replace hand-edited `public/sitemap.xml`. |
| **robots.txt hardening** | Best practice: allow marketing pages, disallow private/admin surfaces. | LOW | Disallow `/admin`, `/dashboard`; keep sitemap URL. Optional: `Disallow: /community` if UGC should not be indexed (product decision). No CMS — deploy config. |
| **JSON-LD structured data** | Book/author sites use `Book`, `Organization`/`WebSite`, `BlogPosting`, `Event` for rich results ([Google Book](https://developers.google.com/search/docs/appearance/structured-data/book), [Article/BlogPosting](https://developers.google.com/search/docs/appearance/structured-data/article)). | MEDIUM | **CMS:** global book metadata (ISBN, author name, image) in `settings`; per-article `BlogPosting` from existing `Article` fields (`title`, `authorName`, `publishedAt`, `thumbnail`). Validate with Rich Results Test. |
| **Semantic HTML & heading hierarchy** | One clear `h1` per page, logical `h2`–`h3`, landmarks (`header`, `main`, `nav`, `footer`) — accessibility and SEO alignment. | LOW–MEDIUM | Audit landing sections and blog markdown output. Fix empty `alt` on author avatars in `BlogPostPage`. |
| **Core Web Vitals pass** | Google uses LCP, INP, CLS as page-experience signals ([CWV docs](https://developers.google.com/search/docs/appearance/core-web-vitals)). | MEDIUM | Defer heavy Three.js/GSAP below fold or lazy-load; reserve image dimensions; reduce layout shift on theme/font load from `ThemeSynchronizer`. |
| **Mobile-first responsive polish** | Majority of author-site traffic is mobile; broken tap targets or horizontal scroll = bounce. | MEDIUM | Table stakes for UX milestone: consistent spacing scale, `sm:` breakpoints on hero/CTA, 44px touch targets. Uses existing Tailwind + `appearance` tokens. |
| **404 / soft-404 handling** | Unknown URLs should return proper status and `noindex` where appropriate. | LOW | `NotFoundPage` exists; ensure server/CDN returns 404 (not 200) for unknown paths if prerender adds static routes. |
| **Search Console verification** | Cannot measure indexing/CWV without property verification ([GSC help](https://support.google.com/webmasters/answer/35179)). | LOW | **CMS:** optional `settings.seo.googleSiteVerification` meta tag field in admin; inject in `index.html` or Helmet. |
| **Internal linking** | Blog hubs and related posts distribute PageRank; author sites link book → blog → events. | LOW | Partial: related articles on `BlogPostPage`. Add contextual links from landing sections to `/blog`, `/events`; breadcrumb UI optional. |
| **Image SEO basics** | Crawlable images need `alt`, reasonable file size, stable URLs. | LOW | **CMS:** alt text on article thumbnails (new field or reuse title/excerpt). Hero and OG images from settings. |

### Differentiators (Competitive Advantage)

Not required to launch, but align with “premium” and “SEO dominance” positioning for a monograph/playbook brand.

| Feature | Value Proposition | Complexity | Notes / CMS dependency |
|---------|-------------------|------------|------------------------|
| **Admin SERP + social snippet preview** | Editors see Google/Twitter card mock before publish — reduces bad CTR from truncated titles. | MEDIUM | **Depends on** per-route meta + `react-helmet-async`. Build in `SettingsManager` / `BlogManager` using same fields as live meta. |
| **Per-entity SEO overrides in CMS** | Global SEO is insufficient for ranking long-tail blog queries; competitors tune each post. | MEDIUM | **Prisma:** add `metaTitle`, `metaDescription`, `ogImage`, `canonicalUrl`, `noindex` on `Article` (optional on `Event`). **BlogManager** tab mirroring global SEO. Fallback chain: override → title/excerpt → site defaults. |
| **Book + Author rich results** | `Book` schema with ISBN, offers, ratings drives knowledge panel / book actions where eligible. | MEDIUM | **CMS:** book panel in settings (title, ISBN-13, cover URL, author Person, publisher Org). Single JSON-LD template on landing. |
| **BreadcrumbList JSON-LD** | Clear trail in SERPs for blog and events (`Home > Blog > Post`). | LOW | Code-generated from route + `Article.title`; no CMS unless custom labels needed. |
| **Event structured data** | Events map can surface event rich results when dates/locations are structured. | MEDIUM | Map `Event` model to `Event` schema; needs ISO dates — may require schema migration (`startDate` vs display strings). |
| **Premium editorial reading UX** | Differentiator vs template author sites: progress bar, typography, share/bookmark (already started on blog). | MEDIUM | Extend reading progress, ToC from markdown headings, estimated read time sync with `Article.time`. Mostly frontend. |
| **Stable, intentional motion system** | Premium feel without jank: reduced-motion respect, no CLS from animations. | MEDIUM | Centralize motion tokens; `prefers-reduced-motion` guard on Framer/GSAP; avoid animating layout-affecting properties. |
| **Design system consolidation** | Consistent radius, shadow, type from `appearance` across admin + public — “one brand” feel. | MEDIUM | **CMS:** already has `appearance` — enforce token usage in section components; document spacing scale in code. |
| **hreflang / multi-locale** | Only if brand goes international. | HIGH | **Anti-scope for v1.1** unless bilingual content exists. |
| **IndexNow / Bing Webmaster** | Faster discovery after publish for Bing ecosystem. | LOW | Ping on article publish from Express — optional after dynamic sitemap. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Keyword meta tag field** | Legacy SEO belief | Google ignores `keywords` since ~2009; encourages stuffing. | Focus on title, description, content, internal links. |
| **Auto-generated tag/author archive pages** | “More indexed pages” | Thin duplicate content, crawl budget waste, manual actions risk. | One `/blog` index + strong post pages; categories as filters with canonical to `/blog`. |
| **Full SSR migration for entire app** | “Maximum SEO” | High cost for admin + community; Express already separate. | Prerender **public marketing routes only**; keep SPA for `/admin`. |
| **Indexing all community UGC** | Community growth | Low-quality UGC, duplicate titles, moderation risk hurts brand queries. | `noindex` community or selective indexing; canonical to hub. |
| **Heavy 3D hero on all pages** | Visual wow | Kills LCP/INP on mobile ([web.dev CWV](https://web.dev/articles/vitals#core-web-vitals)). | Landing-only, lazy init, static poster image for LCP. |
| **Infinite scroll blog without paginated fallback** | Modern UX | Crawlers may not see all posts; no stable URLs for page 2+. | Paginated `/blog?page=` or “Load more” with `<a href>` fallbacks. |
| **Separate mobile subdomain (m.)** | Old mobile pattern | Splits signals, duplicate content. | Responsive CSS (current stack). |
| **Client-only sitemap in JS bundle** | SPA convenience | Crawlers won’t execute reliably; must be raw XML at `/sitemap.xml`. | Server-generated or build-time XML. |
| **Duplicate global meta on every URL** | Easy implementation | All SERPs look identical; poor CTR for blog. | Per-route Helmet + prerendered head. |
| **AI-generated SEO text without review** | Speed | E-E-A-T risk for YMYL-adjacent business/AI topics. | Human-edited overrides in CMS; AI suggest-only if ever added. |
| **Structured data that doesn’t match visible content** | Rich result chasing | Manual actions, rich result loss ([Google SD policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)). | Generate JSON-LD from same fields rendered on page. |

---

## Feature Dependencies

```
[Crawlable HTML / Prerender]
    └──requires──> [Per-route meta tags in <head>]
                       └──requires──> [CMS fields OR sensible defaults per route]

[Dynamic sitemap.xml]
    └──requires──> [Published Article/Event in DB]
    └──enhances──> [Search Console monitoring]

[JSON-LD BlogPosting]
    └──requires──> [Per-route canonical URL]
    └──requires──> [Article author/date/image visible on page]

[Admin SERP preview]
    └──requires──> [Per-entity SEO overrides]
    └──requires──> [Per-route meta tags]

[Book schema on landing]
    └──requires──> [CMS: book metadata block in settings]
    └──enhances──> [Brand + product queries]

[Social sharing cards for blog]
    └──requires──> [Prerender OR SSR] + [og:image per post]

[Core Web Vitals pass]
    └──conflicts──> [Heavy uncapped 3D/motion on critical path]
```

### Dependency Notes

- **Prerender requires per-route meta:** Injecting meta only via `useEffect` (current `ThemeSynchronizer` pattern) is invisible to non-JS crawlers; prerender must bake Helmet output into static HTML.
- **Dynamic sitemap requires API:** `WebsiteDataProvider` loads content client-side; sitemap generation belongs in `server/` reading Prisma, not Vite alone.
- **Per-article SEO requires schema migration:** `Article` has no SEO columns today; admin UI depends on API + Prisma change before BlogManager fields matter.
- **Community indexing conflicts with brand SEO:** Default to `noindex` for `/community` unless moderation and quality bar are explicit requirements.

---

## MVP Definition

### Launch With (v1.1 — this milestone)

Minimum to claim “technical SEO foundation” + visible premium polish:

- [ ] **Per-route meta + canonical + OG/Twitter** — all public routes, especially `/blog/:slug`
- [ ] **Prerender public routes** (or SSR subset) — crawlable head and body for indexable pages
- [ ] **Dynamic sitemap + robots.txt tune** — blog slugs, events, fresh `lastmod`; block admin
- [ ] **JSON-LD:** `WebSite`, `Organization`, `Book` (landing), `BlogPosting` (posts)
- [ ] **CMS: per-article SEO fields** + global OG image / verification tag
- [ ] **CWV + mobile pass** — lazy heavy assets, image dimensions, reduced-motion
- [ ] **Semantic/heading audit** — one `h1`, fix alts, landmark consistency
- [ ] **Search Console verification** — meta tag from admin settings

### Add After Validation (v1.1.x)

- [ ] **Admin SERP/social preview** — once per-entity SEO is stable
- [ ] **Event structured data** — after date fields are machine-readable
- [ ] **BreadcrumbList schema** — low effort once meta pipeline exists
- [ ] **IndexNow ping** — after dynamic sitemap and publish flow are reliable

### Future Consideration (v2+)

- [ ] **hreflang** — only if multi-language content ships
- [ ] **Author profile pages (`/author`)** — Person schema hub; needs content strategy
- [ ] **FAQ / HowTo schema** — if landing adds structured Q&A sections
- [ ] **Full SSR** — only if prerender limits exceeded (thousands of routes)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Per-route meta tags | HIGH | MEDIUM | P1 |
| Prerender / crawlable HTML | HIGH | HIGH | P1 |
| Dynamic sitemap | HIGH | MEDIUM | P1 |
| JSON-LD (Book + BlogPosting) | HIGH | MEDIUM | P1 |
| Per-article SEO in CMS | HIGH | MEDIUM | P1 |
| robots.txt / noindex rules | MEDIUM | LOW | P1 |
| CWV + mobile polish | HIGH | MEDIUM | P1 |
| Search Console verification field | MEDIUM | LOW | P1 |
| Semantic HTML / alt text | MEDIUM | LOW | P1 |
| Admin snippet preview | MEDIUM | MEDIUM | P2 |
| Event schema | MEDIUM | MEDIUM | P2 |
| BreadcrumbList | LOW | LOW | P2 |
| IndexNow | LOW | LOW | P3 |
| hreflang | LOW | HIGH | P3 |

**Priority key:** P1 = milestone launch blockers; P2 = soon after; P3 = defer

---

## Competitor Feature Analysis

Patterns from high-performing author/book marketing sites (e.g. major publisher author pages, BookBub-linked author hubs, 2025–2026 industry guides — [Chapter author design](https://blog.chapter.pub/author-website-design/), [Guided Web Design conversion layouts](https://guidedwebdesign.com/blog/high-converting-author-website-layouts)):

| Feature | Typical competitor | Our approach (v1.1) |
|---------|------------------|---------------------|
| Homepage clarity (who / what / buy) | Hero + single primary CTA above fold | Polish landing hierarchy + internal links; book CTA via existing hero/CMS |
| Email capture | Lead magnet, prominent signup | Existing registry CTA; ensure visible on mobile — UX phase |
| Blog SEO | Unique title/description per post, share images | **Gap:** add per-article CMS + prerender |
| Structured data | Book + Article markup on key pages | **Gap:** JSON-LD templates from CMS |
| Sitemap | Auto-updated on publish | **Gap:** API-driven sitemap |
| Premium feel | Fast load, strong typography, restrained motion | Leverage existing blog editorial UI; cap motion for CWV |
| Social proof | Reviews, endorsements | Use stats/testimonials sections — content in CMS, not new SEO tech |
| Events | Calendar + location | Events map exists; add Event schema when dates are structured |

---

## Sources

- [Google Search Central — Article/BlogPosting structured data](https://developers.google.com/search/docs/appearance/structured-data/article) (HIGH)
- [Google Search Central — Book structured data](https://developers.google.com/search/docs/appearance/structured-data/book) (HIGH)
- [Google Search Central — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) (HIGH)
- [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) (HIGH)
- [Google Search Console — Verify site ownership](https://support.google.com/webmasters/answer/35179) (HIGH)
- Codebase: `index.html`, `public/sitemap.xml`, `public/robots.txt`, `src/App.tsx`, `server/prisma/schema.prisma`, `SettingsManager.tsx` (HIGH)
- [react-helmet-async](https://www.npmjs.com/package/react-helmet-async) — per-route head management (MEDIUM)
- Author UX patterns: [Chapter — author website design](https://blog.chapter.pub/author-website-design/), [Guided Web Design — converting layouts](https://guidedwebdesign.com/blog/high-converting-author-website-layouts) (MEDIUM)
- SPA SEO prerender patterns: [Vite SSR guide](https://vitejs.dev/guide/ssr.html), industry prerender articles (MEDIUM)

---
*Feature research for: Premium Presentation & SEO Dominance (v1.1)*
*Researched: 2026-05-19*
