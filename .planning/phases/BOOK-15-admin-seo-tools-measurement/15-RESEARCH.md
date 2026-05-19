# Phase 15 Research: Admin SEO Tools & Measurement

**Researched:** 2026-05-19  
**Phase:** 15-admin-seo-tools-measurement  
**Confidence:** HIGH (existing code paths verified in repo)

## Summary

Phase 15 closes the editor feedback loop: reorganize article SEO into a dedicated tab, preview SERP/social snippets via the same `resolvePageSeo` used on public routes and in Phase 14 prerender, add admin OG upload with **sharp** on Express, wire **web-vitals** RUM through existing `MarketingService`, and prove GSC meta in baked `dist/` HTML.

**Primary integration points:** `src/seo/seoConfig.ts`, `BlogManager.tsx`, `SettingsManager.tsx`, `server/src/routes/adminRoutes.ts`, `MarketingTracker` / `App.tsx`, `scripts/verify-phase14-prerender.mjs` (pattern for MSMT-01).

## Standard Stack (Phase 15 Additions)

| Technology | Version | Purpose | Install location |
|------------|---------|---------|------------------|
| **sharp** | **0.34.5** | Resize/crop OG uploads to 1200×630 | `server/` |
| **multer** | **2.0.2** | Multipart parsing for `POST /admin/og-image` | `server/` |
| **web-vitals** | **5.2.0** | LCP, INP, CLS in production | repo root |

No new public SEO libraries — previews import `resolvePageSeo` only (D-32).

## Package Legitimacy Audit

| Package | Registry | Maintainer signal | Status | Notes |
|---------|----------|-------------------|--------|-------|
| sharp@0.34.5 | npm | lovell/sharp, millions/week | **[OK]** | Native bindings; install in `server/` only |
| multer@2.0.2 | npm | expressjs org | **[OK]** | Standard Express multipart |
| web-vitals@5.2.0 | npm | GoogleChrome/web-vitals | **[OK]** | Official CWV library |

## Architectural Responsibility Map

| Concern | Owner (this phase) | Must NOT |
|---------|-------------------|----------|
| SEO resolution / fallbacks | `resolvePageSeo` in `seoConfig.ts` (read-only for admin) | Duplicate preview logic in admin |
| Admin article SEO UI | `BlogManager` + `ArticleSeoTab` / `SeoPreviewPanel` | New Prisma columns |
| OG file I/O | Express `adminRoutes` + `public/og/` | Client-side-only resize |
| RUM transport | `MarketingService.logEvent` → `/api/v1/marketing/webhook` | New `/marketing/events` route (D-43 intent = existing proxy) |
| GSC meta injection | `SeoHead` (Phase 11 D-19) | Re-implement verification tag |
| Prerender proof | `scripts/verify-phase15-gsc.mjs` | Change prerender pipeline |

## Technical Approach

### 1. Admin preview via `resolvePageSeo` (CMS-03, CMS-04)

**Contract (existing):**

```typescript
// src/seo/seoConfig.ts
export function resolvePageSeo({ pathname, data, article }: ResolvePageSeoInput): PageSeo

// src/seo/types.ts
export interface ResolvePageSeoInput {
  pathname: string
  data: WebsiteData
  article?: Article
}
```

**Draft article pattern:** Build `syntheticArticle: Article` from `editForm` merged over the row being edited (`id`, `slug`, `title`, `excerpt`, `seoTitle`, `seoDescription`, `ogImage`, `noindex`, `isPublished`). Call:

```typescript
resolvePageSeo({
  pathname: `/blog/${editForm.slug || 'preview'}`,
  data: useWebsiteData().data, // or preview merge from provider
  article: syntheticArticle,
})
```

**Fallback labels (D-30):** Compare override fields to `articleSeo` branches in `seoConfig.ts`:

| Field | Override empty → resolved from | Label for editor |
|-------|-------------------------------|------------------|
| Title | `seoTitle` | "Article title + site suffix" |
| Description | `seoDescription` → `excerpt` → `settings.seo.description` | "Short summary" / "Site default description" |
| Image | `ogImage` → `settings.seo.ogImage` → `/og-image.jpg` | "Site default OG image" |

**Debounce:** `useDebouncedValue(editForm, 300)` or equivalent for preview panel only; counters update immediately.

**Placeholder (D-35):** If `!editForm.slug?.trim()`, show muted placeholder in SERP/social mocks ("Add a URL slug to preview").

### 2. SEO tab structure (CMS-03, D-28)

- Tab pair at top of article editor scroll: **Content** | **SEO** (segmented control, match admin tab patterns in `SettingsManager`).
- Move lines ~229–305 (`Search & Social` block) from Content tab into SEO tab.
- Char counters: 70 title, 160 description (per `10-UI-SPEC.md`, D-29).
- Help copy (D-31): "Previews and the live site use the same resolver as public pages (`seoConfig.ts`)."

**New files (recommended):**

| File | Role |
|------|------|
| `src/components/admin/ArticleSeoTab.tsx` | Fields + resolved row + embeds preview |
| `src/components/admin/SeoPreviewPanel.tsx` | SERP + social static mocks (D-33, D-34) |
| `src/hooks/useDraftArticleSeo.ts` | `resolvePageSeo` + fallback labels + debounce |

### 3. OG upload API (CMS-05, D-36–D-39)

**Route:** `POST /api/v1/admin/og-image` on `adminRoutes` (after `authenticateAdmin`).

**Pipeline:**

1. `multer` memory storage, single field `file`, limit 5MB.
2. MIME allowlist: `image/jpeg`, `image/png`, `image/webp`.
3. `sharp(buffer).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 })`.
4. Write `public/og/{uuid}.jpg` relative to **repo root** (not `server/` cwd — resolve via `path.join(repoRoot, 'public', 'og', ...)` from `import.meta.url` or `process.cwd()` documented in route).
5. Response `{ url: "/og/{filename}" }`.

**Client:** `api.uploadOgImage(token, FormData)` in `src/lib/api.ts`; `OgImageUpload.tsx` with progress, toast on error, sets `ogImage` on success. Wire on article SEO tab and `SettingsManager` SEO tab (D-37); **keep URL input** (D-37).

**Serving:** Vite dev serves `public/og/`; production static host must serve uploaded files from same tree (document in plan verify).

### 4. Google Search Console (MSMT-01, D-40–D-41)

- **No code change to `SeoHead`** — token already on indexable routes when `settings.seo.googleSiteVerification` set.
- Update `SettingsManager` help (D-40): after save, run `npm run build` so prerender bakes meta into `dist/index.html`; verify in View Source.
- **`scripts/verify-phase15-gsc.mjs`:** Requires `dist/` + optional env `GSC_TEST_TOKEN`. Grep `dist/index.html` for `name="google-site-verification"` and `content="{token}"`. Pattern mirrors `verify-phase14-prerender.mjs`.

### 5. Core Web Vitals RUM (PERF-04, D-42–D-44)

```typescript
// src/lib/reportWebVitals.ts (new)
import { onLCP, onINP, onCLS } from 'web-vitals'

export function initWebVitalsReporting() {
  if (!import.meta.env.PROD) return
  const report = (metric) => {
    MarketingService.logEvent('web_vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      path: window.location.pathname,
    })
  }
  onLCP(report); onINP(report); onCLS(report)
}
```

**HMR guard (D-44):** Module-level `let started = false` — skip if already started.

**Wire:** Call `initWebVitalsReporting()` once from `MarketingTracker` `useEffect` with `[]` deps (same mount as `MarketingService.init()`), not from both `App.tsx` and tracker.

**Note:** `MarketingService` posts to `${API_BASE}/marketing/webhook` (existing); event `type: 'web_vital'` in payload.

### 6. Testing strategy

| Area | Approach |
|------|----------|
| `resolvePageSeo` | Extend `src/seo/seoConfig.test.ts` if adding exported `getSeoFallbackLabels` helper (Claude discretion D-30) |
| OG route | `server/src/routes/adminOgImage.test.ts` — mock sharp, assert 401 without token, 400 bad MIME |
| web-vitals | `src/lib/reportWebVitals.test.ts` — mock `import.meta.env.PROD`, assert no-op in dev |
| GSC | `node scripts/verify-phase15-gsc.mjs` after build with token in DB/seed |

## Pitfalls

1. **Dev API base:** Admin fetch uses `http://localhost:3001/api/v1` in dev (`api.ts`) — OG upload must use same origin + Bearer token.
2. **Preview vs prerender:** Previews use client `resolvePageSeo`; Phase 14 bakes Helmet output — same inputs must match (D-30 synthetic article must include `isPublished` realistically for robots preview).
3. **`noindex` preview:** Unpublished or `noindex` articles show `robots` in resolver — SERP mock should still show title/description but optional badge "Hidden from search" (discretion).
4. **sharp on deploy:** Server needs write access to `public/og/` or uploads 404 in production.
5. **Do not add `/api/v1/marketing/events`** — use webhook proxy only.

## UI Specification Decision

**ROADMAP `UI hint: yes`** — A separate `15-UI-SPEC.md` is **not required**. Locked UI is fully specified in `15-CONTEXT.md` (D-28–D-39) plus inherited limits from `10-UI-SPEC.md` (70/160 counters). Executable plans **embed** SERP/social mock dimensions (D-33, D-34) in task actions. Optional `15-UI-SPEC.md` only if `/gsd:ui-phase` is run later for pixel-polish before Phase 16.

## Out of Scope (confirmed)

- iframe / live crawler preview (deferred)
- Per-event SEO fields (Phase 11 D-08)
- S3/CDN for OG (deferred)
- Lighthouse CI / GSC API (backlog)
- Premium admin redesign (Phase 16)

## Sources

- `15-CONTEXT.md` — D-28–D-44
- `src/seo/seoConfig.ts`, `seoConfig.test.ts`
- `src/components/admin/BlogManager.tsx` (Search & Social block ~229–305)
- `server/src/routes/adminRoutes.ts`, `marketingRoutes.ts`
- `src/lib/marketing.ts`, `src/App.tsx` MarketingTracker
- `.planning/research/STACK.md` — sharp, web-vitals
- `scripts/verify-phase14-prerender.mjs` — MSMT-01 verify pattern
