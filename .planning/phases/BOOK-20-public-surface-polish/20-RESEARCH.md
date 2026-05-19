# Phase 20: Public Surface Polish (Blog Index) — Research

**Researched:** 2026-05-19  
**Domain:** React 19 + Vite + Tailwind v4 marketing page refactor (`/blog` index only)  
**Confidence:** HIGH (codebase + approved `20-UI-SPEC.md`); MEDIUM (newsletter adapter shape)

## Summary

The blog index is a single route (`BlogPage.tsx`, ~226 lines) that already has category filtering and a featured hero, but it **violates the Phase 17 quality bar** on typography, layout width, motion (Framer `initial={{ opacity: 0 }}` on `h1`, featured, and grid), non-functional search, custom grid cards (not `playbook-article-card`), missing empty states, and a newsletter form that does not reuse `WaitlistForm` / `MarketingService`. [VERIFIED: `src/pages/BlogPage.tsx`]

The approved `20-UI-SPEC.md` is the execution contract: plain static page wrapper (no Framer), `max-w-[1600px]` shell aligned with `BlogSection.tsx`, new `blog-*` CSS in `index.css`, reuse of `editorial-*` + `playbook-*` families, client-side search + filter with reset affordance, and LCP-safe static above-fold content. **No new npm packages** are required—this phase is CSS + component composition only.

**Primary recommendation:** Ship in **three plans**—(1) `index.css` blog block + page shell/featured + Framer removal, (2) toolbar + playbook grid + empty states, (3) newsletter adapter + `verify-phase20-blog-index.mjs`—mirroring Phase 17’s CSS-first then page then verify pattern. [VERIFIED: `17-RESEARCH.md`, `scripts/verify-phase17-nav-hero.mjs`]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page layout, hierarchy, copy | Browser (React SPA) | — | `BlogPage.tsx` renders static structure from CMS data |
| Category + search filtering | Browser | — | Client-side on `Article[]` from `useWebsiteData()`; no API in scope |
| Featured / grid imagery & LCP | Browser (HTML img attrs) | CDN (thumbnail URLs) | `loading` / `fetchPriority` / dimensions set in markup |
| Newsletter submit + telemetry | Browser | API (`MarketingService` → `/marketing/webhook`) | Same pattern as landing `WaitlistForm` |
| Editorial / playbook visual system | Browser (CSS) | — | `index.css` tokens and classes; no SSR |
| SEO head / JSON-LD | Browser | — | Existing `SeoHead` / `usePageSeo` unchanged |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Visual reference & tone
- **B-01:** Match **landing editorial system** — reuse `editorial-*`, `playbook-*`, `section-eyebrow`, frosted cards, `max-w-[1600px]` horizontal rhythm — not a separate blog aesthetic.
- **B-02:** Keep **serif + sans pairing** for blog marketing headline (Instrument Serif display + Plus Jakarta UI) consistent with playbook section on landing; align with screenshots user provided (DISPATCH eyebrow, “Agentic AI” accent, featured dark card).
- **B-03:** **Light theme only** — same as Phase 17 D-04; no theme toggle on blog.

#### Layout & hierarchy
- **B-04:** **Featured article** remains hero-scale but sits in a **rounded dark container** (or full-bleed within page shell) with gradient overlay, FEATURED badge, read time, author row — polish spacing and typography; avoid flat white card floating on gray if landing uses immersive dark featured treatment.
- **B-05:** **Filters + search** row: pill chips (ALL active = accent), white search field with icon — tighten to landing chip styles; **wire search** to filter title/excerpt (client-side) or document as non-functional with clear empty state if deferred.
- **B-06:** **Article grid** must be visible without excessive scroll — newsletter CTA moves **below grid** (not dominating viewport). Grid uses playbook-card patterns where possible (3-col desktop, 2 tablet, 1 mobile).
- **B-07:** **Newsletter block** — editorial dark card (“Stay Ahead”, serif headline, email + Subscribe) matching Final CTA quality; reuse waitlist patterns if applicable.

#### Motion & performance
- **B-08:** **No opacity-zero LCP** on h1 or featured image — hero copy and featured media visible at first paint (PERF-01).
- **B-09:** Prefer **CSS transitions** over Framer on above-fold blog hero; below-fold grid may use light stagger only with `prefers-reduced-motion` respect.
- **B-10:** Images: explicit dimensions / aspect-ratio, `loading="eager"` + `fetchPriority="high"` only on featured; lazy below fold.

#### Accessibility
- **B-11:** One `h1` on page; featured title is `h2`. Filter buttons are keyboard-focusable with `focus-visible`. Search input has associated label (visually hidden).
- **B-12:** Touch targets ≥44px on filter pills and subscribe CTA.

#### Empty & edge states
- **B-13:** Zero articles: editorial empty state with link to home or community — not blank page below CTA.
- **B-14:** Filter yields no results: inline message + reset filter affordance.

### Claude's Discretion

*(None listed in CONTEXT.md for blog slice.)*

### Deferred Ideas (OUT OF SCOPE)

- `/blog/:slug` prose refactor
- Events, community, 404
- Dark theme
- Shared primitive library (Phase 19)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (index slice) | Research Support |
|----|---------------------------|------------------|
| **PAGE-02** | Premium `/blog` list layout, hierarchy, related-quality CTAs | Refactor to UI-SPEC DOM tree; `h1` + featured `h2`; playbook grid; newsletter below grid |
| **TYPE-03** | Consistent section rhythm, eyebrows, heading scale | Reuse `editorial-eyebrow`, `editorial-heading--section`, `section-eyebrow`; shell padding matches `BlogSection` / Final CTA |
| **TYPE-04** | Vertical rhythm headings → body → CTAs | UI-SPEC spacing scale (`mb-12`/`mb-16` between blocks); remove ad-hoc `mb-32`/`mt-40` |
| **IMG-01** | Hero/card imagery without CLS | Featured 21:9 + `1200×514`; grid `640×400` + `.playbook-article-card__media` aspect-ratio |
| **PERF-01** | LCP not gated by opacity-zero animation | Remove all Framer from `BlogPage`; no `opacity: 0` on `h1`/featured; grid stagger only via IO below fold |
| **UX-04** | Blog premium polish | Align with Phase 17 bar: tokens, frosted cards, dark featured shell, filter pills |
| **UX-06** | Mobile: no horizontal scroll, 44px targets | `min-h-11` pills/search; `flex-wrap` filters; `w-full sm:w-64` search |
</phase_requirements>

## Current State vs Target (gap analysis)

| Area | Current (`BlogPage.tsx`) | Target (`20-UI-SPEC.md`) |
|------|--------------------------|---------------------------|
| Root wrapper | `motion.div` + Framer on header/featured/grid | Plain `div.blog-page` (no Framer) |
| Max width | `max-w-7xl` | `max-w-[1600px]` + landing horizontal padding |
| Page header | Custom serif classes, `font-light` lede, Framer fade-in | `editorial-*` utilities, static opacity 1 |
| Featured | White card + `shadow-2xl`; badge `text-[10px]` | `.blog-featured` dark immersive; `blog-featured__badge` 11px |
| Grid | Custom 4:3 cards, `motion.article`, no shared CSS | `playbook-articles--trio` + `playbook-article-card` markup from `BlogSection.tsx` |
| Search | Decorative input (no state) | `useState` + filter `title`/`excerpt` |
| Empty states | None | `blog-empty` (zero posts) + `blog-empty-filter` + reset |
| Newsletter | Inline `<form>` (no submit wiring) | `WaitlistForm` adapter + `blog-newsletter__*` dark shell |
| CSS | No `blog-*` block in `index.css` | New `/* ===== BLOG INDEX ===== */` section |

[VERIFIED: `src/pages/BlogPage.tsx`, `src/index.css` grep — no `blog-` classes]

## File-Level Recommendations

| File | Action | Notes |
|------|--------|-------|
| `src/index.css` | **Add** `/* ===== BLOG INDEX ===== */` | `.blog-featured*`, `.blog-filter-pill*`, `.blog-search*`, `.blog-newsletter*`, `.blog-empty*`, `.blog-library--visible` or reuse `.playbook-section--visible` |
| `src/pages/BlogPage.tsx` | **Refactor** (primary) | Structure per UI-SPEC; remove `framer-motion`; wire search/filter/empty states |
| `src/components/sections/BlogSection.tsx` | **Optional extract** | Consider `PlaybookArticleCard` shared by landing + blog to avoid markup drift |
| `src/components/landing/WaitlistForm.tsx` | **Extend** (preferred) | Props for `analyticsLocation`, dark `className`, hidden guide label, blog copy — keep `MarketingService` |
| `src/components/blog/BlogNewsletter.tsx` | **Optional** | Thin section wrapper if `BlogPage` grows too large |
| `scripts/verify-phase20-blog-index.mjs` | **Add** | Mirror Phase 17 static checks (no Framer, LCP patterns, class names) |
| `package.json` | **Add script** | `"verify:phase20": "node scripts/verify-phase20-blog-index.mjs"` |

**Do not touch (this slice):** `BlogPostPage.tsx`, `EventsPage.tsx`, `CommunityPage.tsx`, `NotFoundPage.tsx`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^19.2.4 | UI | Project baseline [VERIFIED: `package.json`] |
| react-router-dom | ^7.14.0 | `/blog` route | Existing `App.tsx` route |
| tailwindcss | ^4.2.2 | Utilities + `@utility` | Phase 16–17 pattern |
| lucide-react | ^1.7.0 | Search, empty-state icons | Already on `BlogPage` |
| framer-motion | ^12.38.0 | **Remove from BlogPage only** | Phase 17 removed from nav/hero; blog is next public surface |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| — | — | No new installs | CSS + composition only |

**Installation:** None for blog index slice.

## Package Legitimacy Audit

> No external packages are installed in this slice.

| Package | Disposition |
|---------|-------------|
| *(none)* | N/A — refactor only |

## Architecture Patterns

### System Architecture Diagram

```
[Visitor] → GET /blog (SPA)
    → WebsiteDataProvider (articles[])
    → BlogPage
        ├─ SeoHead / JsonLd (unchanged)
        ├─ Navbar (Phase 17)
        ├─ main.blog-page__main
        │   ├─ header (editorial, static, h1)
        │   ├─ featured? (articles[0], eager LCP img)
        │   ├─ blog-library (playbook-section + IO)
        │   │   ├─ toolbar: category ∪ search → filtered list
        │   │   ├─ empty-filter | ul.playbook-articles--trio
        │   │   └─ empty-page if articles.length === 0
        │   └─ blog-newsletter → WaitlistForm → MarketingService
        └─ Footer
```

### Recommended Project Structure

```
src/
├── pages/BlogPage.tsx           # orchestrates sections
├── components/
│   ├── sections/BlogSection.tsx # landing playbook (reference markup)
│   └── landing/WaitlistForm.tsx # extend for newsletter
├── index.css                    # blog-* block after playbook section
└── scripts/verify-phase20-blog-index.mjs
```

### Pattern 1: Reuse landing playbook grid markup

**What:** Copy the `<ul className="playbook-articles playbook-articles--trio">` / `playbook-article-card` structure from `BlogSection.tsx` verbatim into `BlogPage` (or extract a shared card component).

**When to use:** All non-featured articles in the grid (B-06).

**Example:** [VERIFIED: `src/components/sections/BlogSection.tsx` lines 48–96]

```tsx
<ul className="playbook-articles playbook-articles--trio list-none p-0 m-0">
  {articles.map((article, idx) => (
    <li
      key={article.id}
      className="playbook-article-card group"
      style={{ "--article-i": idx } as CSSProperties}
    >
      <Link to={`/blog/${article.slug}`} className="playbook-article-card__link">
        {/* media, body, meta — same as BlogSection */}
      </Link>
    </li>
  ))}
</ul>
```

### Pattern 2: IntersectionObserver for below-fold stagger only

**What:** Attach `playbook-section` + IO on `section.blog-library`; add `playbook-section--visible` when intersecting—reuses existing opacity/stagger rules without Framer.

**When to use:** Article grid only—not on header or featured (B-08, B-09).

**Example:** [VERIFIED: `BlogSection.tsx` lines 13–28; `index.css` `.playbook-section--visible .playbook-article-card`]

### Pattern 3: Client-side filter pipeline

**What:** Single derived list from `remainingArticles` (excludes featured `articles[0]`).

```tsx
const [selectedCategory, setSelectedCategory] = useState("ALL")
const [searchQuery, setSearchQuery] = useState("")
const q = searchQuery.trim().toLowerCase()

const gridArticles = useMemo(() => {
  let list =
    selectedCategory === "ALL"
      ? remainingArticles
      : remainingArticles.filter((a) => a.category === selectedCategory)
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q),
    )
  }
  return list
}, [remainingArticles, selectedCategory, q])
```

**Reset handler (B-14):** `setSelectedCategory("ALL"); setSearchQuery("")` on “Show all articles”.

[VERIFIED: `Article` has `title`, `excerpt`, `category` in `src/lib/websiteData.ts`]

### Pattern 4: Featured article selection (unchanged semantics)

**What:** `featuredArticle = articles[0]` (most recent published list order); `remainingArticles = articles.slice(1)`.

**When:** Any published count ≥ 1. If zero published, skip featured and show `blog-empty` (B-13).

### Anti-Patterns to Avoid

- **Framer on above-fold blog content:** Current `initial={{ opacity: 0 }}` on `h1` and featured directly breaks PERF-01. [VERIFIED: `BlogPage.tsx`]
- **Custom grid cards diverging from landing:** Creates double maintenance and fails TYPE-03 rhythm.
- **Putting newsletter above grid:** Violates B-06 / UI-SPEC content order.
- **IO class on entire page:** Would hide `playbook-article-card` opacity until scroll—only apply `playbook-section--visible` on `blog-library`, not page root.
- **Using `font-light` / `text-[10px]` on blog:** UI-SPEC limits weights to 400/600 and labels to 11px.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Article card layout | New card CSS | `playbook-article-card*` | Landing already tuned; TYPE-03/IMG-01 |
| Below-fold reveal | Framer stagger | `playbook-section` + IO | Reduced-motion block exists in CSS |
| Newsletter API wiring | New endpoint | `MarketingService.identify` + `logEvent` | Same as `WaitlistForm` |
| Search backend | Server search API | Client filter on loaded articles | Locked in UI-SPEC scope |
| Filter chip styles | Inline Tailwind only | `.blog-filter-pill` in `index.css` | Touch targets + focus rings centralized |

## Framer Removal Strategy

| Step | Action |
|------|--------|
| 1 | Remove `import { motion } from 'framer-motion'` from `BlogPage.tsx` |
| 2 | Replace `<motion.div className="min-h-screen...">` with `<div className="blog-page min-h-screen bg-off overflow-x-hidden">` |
| 3 | Replace `motion.span/h1/p/section/article` with semantic elements + static classes |
| 4 | Delete all `initial` / `animate` / `transition` props on blog page |
| 5 | Add `useRef` + `useEffect` IO on `section.blog-library` with class `playbook-section` (copy from `BlogSection`) |
| 6 | Keep `framer-motion` in `package.json`—still used by admin, events, community, `BlogPostPage` (out of slice) |
| 7 | Add `verify-phase20-blog-index.mjs` asserting `/framer-motion/` absent from `BlogPage.tsx` |

**Do not** uninstall `framer-motion` globally in this phase.

[VERIFIED: `grep framer-motion` — `BlogPage.tsx` is one of few public marketing pages still using it]

## Search / Filter Implementation

| Requirement | Implementation |
|-------------|----------------|
| Categories | Keep `['ALL', 'RESEARCH', 'STRATEGY', 'PLAYBOOK', 'GUIDE']`; match `Article.category` strings from CMS/seed |
| Active pill | `aria-pressed={selectedCategory === cat}`; class `blog-filter-pill--active` |
| Search | Controlled input; debounce **not required** (small lists); placeholder **Search resources…** per UI-SPEC |
| Combined logic | Category filter first, then search on title + excerpt (case-insensitive) |
| Empty filter | Show `blog-empty-filter` when `gridArticles.length === 0` but `articles.length > 0` |
| Zero posts | Show `blog-empty` when `articles.length === 0`; primary CTA `Browse the playbook` → `/#dispatch` |
| Featured visibility | Featured stays visible even when grid filters to zero (featured is not in grid list) |

**Edge case:** Seed currently has **one** published article (`server/src/seed.ts`)—grid is often empty after featured split; filter-empty vs page-empty behavior must still be testable. [VERIFIED: seed file]

## WaitlistForm Reuse for Newsletter

| Approach | Recommendation |
|----------|----------------|
| **A. Extend `WaitlistForm` with props** | **Preferred** — `analyticsLocation: 'blog_newsletter'`, `variant: 'dark'`, `showGuideLabel: false`, custom `submitLabel` / `placeholder` / `successCopy` from UI-SPEC |
| B. Duplicate form in `BlogNewsletter.tsx` | Faster but duplicates validation + `MarketingService` calls |
| C. Raw `<form preventDefault>` | **Reject** — loses telemetry and error/success patterns (B-07) |

**Dark styling:** `waitlist-form__input` targets light Final CTA shell. Add `.blog-newsletter .blog-newsletter__input` overrides (white/10 border, light text) rather than reusing light input classes unmodified. [VERIFIED: `index.css` waitlist-form block ~2096–2211]

**Submit button:** `btn-cta-primary` with blog override `bg-accent hover:bg-accent2` per UI-SPEC; `min-h-[3.25rem]` satisfies B-12.

**Success/error copy:** Use UI-SPEC strings; map validation error to `waitlist-form__error` pattern.

## What to Reuse from Landing (Phase 17 bar)

| Asset | Location | Blog usage |
|-------|----------|------------|
| `editorial-eyebrow`, `editorial-heading--section`, `editorial-accent`, `editorial-lede` | `index.css` ~570–632 | Page header (B-02) |
| `section-eyebrow` | `@utility` | “Dispatch” eyebrow |
| `playbook-articles--trio`, `playbook-article-card*` | `index.css` ~1415–1607 | Grid (B-06) |
| Horizontal shell padding | `BlogSection.tsx` `px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1600px]` | `blog-page__main` |
| IO pattern | `BlogSection` / `FinalCTA` | `blog-library`; optional newsletter IO |
| `btn-cta-primary` / `btn-cta-secondary` | `@utility` | Empty-state CTA; newsletter submit |
| `scroll-padding-top` on `html` | Phase 17 | Navbar offset `pt-28 sm:pt-32` on main |
| `MarketingService` + waitlist success UX | `WaitlistForm.tsx` | Newsletter (B-07) |

**Typography caveat:** Global `.editorial-lede` uses `font-weight: 300` [VERIFIED: `index.css` line 629], but UI-SPEC allows only 400/600 on `/blog`. Add scoped override:

```css
.blog-page .editorial-lede {
  font-weight: 400;
}
```

## Recommended Plan Split (3 plans)

### 20-01 — Blog index CSS + shell + featured (LCP-safe)

- Add `index.css` blog block per UI-SPEC minimum classes
- Refactor `BlogPage` wrapper, header, featured (`blog-featured*`)
- Remove all Framer from `BlogPage`
- Fix author `alt` text (currently empty on featured avatar)
- **Requirements:** PERF-01, IMG-01 (featured), TYPE-03/04 (header rhythm), partial PAGE-02

### 20-02 — Toolbar, playbook grid, empty states

- Implement search state + filter pipeline
- Replace custom grid with `playbook-article-card` markup + IO on `blog-library`
- `blog-empty` + `blog-empty-filter` + reset control
- Filter pills `blog-filter-pill`, search `blog-search`, a11y labels/`aria-pressed`
- **Requirements:** PAGE-02, UX-04, UX-06, B-05/B-13/B-14

### 20-03 — Newsletter + verification

- `WaitlistForm` props + `blog-newsletter` shell (dark card, locked copy)
- Optional: extract `PlaybookArticleCard` if 20-02 duplicated markup
- `scripts/verify-phase20-blog-index.mjs` + `npm run verify:phase20`
- `npm run build` + lint
- **Requirements:** B-07, UX-06 (subscribe target), regression guard for PERF-01

*Alternative 4-plan split:* separate 20-01 CSS-only file commit if planner wants smaller diffs—functionally equivalent.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| LCP regression if featured wrapped in IO/hidden opacity | HIGH | Never apply `playbook-section--visible` to featured/header; static `opacity: 1` |
| `playbook-article-card` default `opacity: 0` before IO | MEDIUM | Only parent `blog-library` gets IO; reduced-motion CSS already forces visible |
| Single seed article → empty grid looks broken | MEDIUM | Test page-empty vs filter-empty; document in UAT |
| `editorial-lede` font-weight 300 vs UI-SPEC 400 | MEDIUM | `.blog-page` scoped override |
| WaitlistForm light styles on dark newsletter | MEDIUM | Blog-scoped input/submit classes; don’t reuse Final CTA shell verbatim |
| Category mismatch CMS vs hardcoded pills | LOW | Categories already uppercase in seed; admin should use same enum |
| `section-public` / `section-inner` utilities unused | LOW | UI-SPEC chose playbook shell; TYPE-03 satisfied via editorial + max-width rhythm (document in plan) |
| Phase 19 Button primitive | LOW | Explicitly out of scope; keep `btn-cta-*` |

## Common Pitfalls

### Pitfall 1: Opacity-zero LCP on marketing headlines

**What goes wrong:** Framer or CSS hides `h1`/featured until animation completes.  
**Why:** Copy-paste from pre–Phase 17 patterns.  
**How to avoid:** Static render above fold; verify with `verify-phase20` script.  
**Warning signs:** Lighthouse LCP element delayed; `initial={{ opacity: 0 }}` in file.

### Pitfall 2: Grid cards invisible on first paint

**What goes wrong:** Applying `playbook-section--visible` too late or to wrong parent leaves cards at `opacity: 0`.  
**Why:** `.playbook-article-card` defaults hidden until visible class on ancestor.  
**How to avoid:** IO only on `blog-library`; test with reduced motion (should be instant visible).

### Pitfall 3: Newsletter before grid

**What goes wrong:** Large dark CTA pushes article grid below fold on laptop heights.  
**Why:** Current `BlogPage` uses `mt-40` newsletter after grid but old layout still heavy.  
**How to avoid:** Locked order in UI-SPEC; use `mt-12 sm:mt-16` on newsletter only.

### Pitfall 4: Non-functional search left in place

**What goes wrong:** UX debt; B-05 allows deferral only with explicit empty state—which is worse than wiring client filter.  
**How to avoid:** Implement ~15 lines of filter state in 20-02.

## Code Examples

### Static page header (no Framer)

```tsx
<header className="blog-page__header text-center mb-12 sm:mb-16">
  <div className="editorial-eyebrow editorial-eyebrow--center mb-6 sm:mb-7">
    <span className="editorial-eyebrow__rule" aria-hidden />
    <span className="section-eyebrow !mb-0">Dispatch</span>
    <span className="editorial-eyebrow__rule" aria-hidden />
  </div>
  <h1 className="editorial-heading editorial-heading--section">
    The <span className="editorial-accent">Agentic AI</span> Playbook
  </h1>
  <p className="editorial-lede max-w-2xl mx-auto">
    Diving deep into the architecture of agentic systems…
  </p>
</header>
```

### Featured image LCP attributes

```tsx
<img
  src={featuredArticle.thumbnail}
  alt={featuredArticle.title}
  width={1200}
  height={514}
  loading="eager"
  fetchPriority="high"
  className="blog-featured__img w-full h-full object-cover"
/>
```

[Source: `20-UI-SPEC.md` Imagery table; existing attrs in `BlogPage.tsx`]

## Validation Architecture

> `workflow.nyquist_validation` not set to `false` in `.planning/config.json` — section included. No dedicated `/blog` unit tests exist today.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.6 |
| Config file | Vite defaults (inline in vite config) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | No Framer / opacity-zero LCP on blog index | static script | `npm run verify:phase20` (Wave 0) | ❌ Wave 0 |
| PAGE-02 | Playbook grid classes present | static script | same | ❌ Wave 0 |
| IMG-01 | Featured width/height attrs | static script | same | ❌ Wave 0 |
| UX-06 | `min-h-11` on filter/search | static script / manual | same | ❌ Wave 0 |
| TYPE-03/04, UX-04 | Visual rhythm | manual UAT | Browser 320px–2xl | — |

### Sampling Rate

- **Per task commit:** `npm run verify:phase20` (after Wave 0)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Manual UAT on `/blog` per `20-UI-SPEC.md` + requirements

### Wave 0 Gaps

- [ ] `scripts/verify-phase20-blog-index.mjs` — PERF-01, Framer absence, class presence
- [ ] `package.json` — `"verify:phase20"` script
- [ ] No component unit tests required unless planner adds shallow render tests (optional)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V5 Input Validation | yes | Email `includes("@")` + required field (same as landing); no new fields |
| V2/V3/V4 | no | Public page; no auth |
| V6 Cryptography | no | No secrets in blog index |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via article title in search | Tampering/Spoofing | React text escaping; no `dangerouslySetInnerHTML` on index |
| Newsletter spam | DoS | Same client-side gate as landing; server webhook rate limits (backend, out of slice) |

## Environment Availability

**Step 2.6:** SKIPPED — no new external dependencies. Existing `npm run dev` / CMS API sufficient.

| Dependency | Required By | Available | Fallback |
|------------|------------|-----------|----------|
| Node + npm | build/verify | ✓ (project runs) | — |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `articles[0]` is acceptable “most recent featured” ordering | Featured pattern | Wrong post featured if API sort changes |
| A2 | Extending `WaitlistForm` is acceptable vs new component | Newsletter | Props creep; mitigated by optional defaults |
| A3 | TYPE-03 satisfied without `section-public` utility on blog | Architecture | Auditor may expect utility classes—document playbook shell equivalence |
| A4 | Optional `PlaybookArticleCard` extract is planner discretion | File recommendations | Duplication if skipped |

## Open Questions

1. **Extract `PlaybookArticleCard` shared component?**
   - What we know: `BlogSection` and `BlogPage` will share nearly identical list markup.
   - What's unclear: Whether planner wants extract in 20-02 or inline copy.
   - Recommendation: Extract if markup exceeds ~40 lines in `BlogPage`; otherwise copy once and defer extract to Phase 21 cleanup.

2. **Newsletter IO fade-in**
   - What we know: UI-SPEC allows optional IO after grid; shell text must not start `opacity: 0` in viewport.
   - Recommendation: Skip newsletter IO in v1 slice unless executor has time—static newsletter is safer for PERF-01.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Framer fade-in on blog marketing hero | CSS-only above fold; IO below fold | PERF-01 alignment with Phase 17 |
| Custom blog grid cards | `playbook-article-card` family | TYPE-03 consistency with landing |
| Decorative search field | Client filter on title/excerpt | B-05 fulfilled without API |

## Sources

### Primary (HIGH confidence)

- `20-CONTEXT.md`, `20-UI-SPEC.md` — locked blog slice contract
- `src/pages/BlogPage.tsx` — current implementation gaps
- `src/components/sections/BlogSection.tsx` — playbook markup reference
- `src/components/landing/WaitlistForm.tsx` — newsletter reuse target
- `src/index.css` — editorial, playbook, waitlist, btn utilities
- `17-RESEARCH.md`, `scripts/verify-phase17-nav-hero.mjs` — quality bar + verify pattern
- `package.json` — versions

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — requirement IDs PAGE-02, TYPE-03/04, IMG-01, PERF-01, UX-04/06
- `.planning/ROADMAP.md` — Phase 20 scope

### Tertiary

- None required for this slice (no new libraries)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; patterns exist in repo
- Architecture: HIGH — UI-SPEC + CONTEXT lock most decisions
- Pitfalls: HIGH — PERF/framer issues verified in current `BlogPage.tsx`
- Newsletter adapter: MEDIUM — props design not yet implemented

**Research date:** 2026-05-19  
**Valid until:** 2026-06-19 (stable CSS/React patterns)

---

## RESEARCH COMPLETE

**Phase:** 20 — Public Surface Polish (blog index slice)  
**Confidence:** HIGH

### Key Findings

- `BlogPage.tsx` still uses Framer with opacity-zero entrances on `h1`, featured, and grid—direct PERF-01 conflict; remove Framer entirely from this file.
- No `blog-*` CSS exists yet; landing patterns (`editorial-*`, `playbook-article-card*`) are ready to reuse but grid markup must be replaced, not tweaked.
- Search is currently non-functional; client-side filter on `title` + `excerpt` is the locked approach and is trivial with existing `Article` fields.
- Newsletter should extend `WaitlistForm` + `MarketingService` with dark `blog-newsletter` overrides—not a raw unwired form.
- Recommended **3 plans**: CSS/shell/featured → toolbar/grid/empties → newsletter/verify script.

### File Created

`/Users/anuragverma/Downloads/book website-frontend/.planning/phases/BOOK-20-public-surface-polish/20-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | No new deps; verified package.json |
| Architecture | HIGH | UI-SPEC DOM tree + CONTEXT locks |
| Pitfalls | HIGH | Confirmed in live BlogPage source |

### Open Questions

- Optional `PlaybookArticleCard` extract vs inline markup duplication.
- Optional newsletter IO (recommend static for safety).

### Ready for Planning

Research complete. Planner can now create PLAN.md files for the blog index slice only.
