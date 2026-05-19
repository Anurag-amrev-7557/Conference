# Phase 11: Per-Route Head Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 11-Per-Route Head Management
**Mode:** `--auto` (autonomous selection, no user prompts)
**Areas discussed:** Head architecture, Fallback chain, OG/Twitter mapping, Robots/noindex policy, index.html shell, GSC verification meta

---

## Head component architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Central `src/seo/` (`SeoHead` + `seoConfig` + hook) | Matches research ARCHITECTURE.md; testable resolver; one head owner | ✓ |
| Inline `<Helmet>` per page | Faster but duplicates logic; harder prerender parity | |
| Keep `ThemeSynchronizer` for global title | Conflicts with per-route meta; duplicate writes | |

**Auto choice:** Central `src/seo/` module + `react-helmet-async@3.0.0`; strip SEO from `ThemeSynchronizer`.
**Notes:** `[auto] Head architecture → Central src/seo/ (recommended default)`

---

## Meta fallback chain

| Option | Description | Selected |
|--------|-------------|----------|
| Entity → route default → site `settings.seo` | Research Pattern 1; articles use Prisma SEO fields | ✓ |
| Site global only until Phase 15 | Violates META-01 for `/blog/:slug` | |
| Per-event fields on `/events` | Out of scope — Phase 10 deferred Event columns | |

**Auto choice:** Article chain per D-06; static routes use `routeDefaults` + site SEO; `/events` uses route defaults only (no per-event synthesis in Phase 11).
**Notes:** `[auto] Fallback chain → entity → route → site (recommended)`

---

## Open Graph and Twitter card mapping

| Option | Description | Selected |
|--------|-------------|----------|
| `og:type` article on posts, website elsewhere; `summary_large_image` | Standard social preview behavior | ✓ |
| Single `website` type everywhere | Wrong semantics for blog posts | |

**Auto choice:** D-10/D-11; absolute image URLs via `absoluteUrl`.
**Notes:** `[auto] OG/Twitter → article vs website types + summary_large_image`

---

## Robots / noindex policy

| Option | Description | Selected |
|--------|-------------|----------|
| noindex admin, dashboard, community, 404; article if `noindex \|\| !isPublished` | Matches META-05 + STATE.md + Phase 10 research | ✓ |
| Index `/community` by default | Contradicts STATE.md pending product decision | |

**Auto choice:** D-13–D-16.
**Notes:** `[auto] Robots → strict noindex on admin/dashboard/community/404; article gating`

---

## index.html shell cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal shell — strip canonical/OG/Twitter duplicates | META-06; avoids Pitfall 2 duplicate canonicals | ✓ |
| Keep static OG for homepage fallback | Conflicts with Helmet on every route | |

**Auto choice:** D-17/D-18.
**Notes:** `[auto] index.html → minimal shell only (recommended)`

---

## Google Search Console verification injection

| Option | Description | Selected |
|--------|-------------|----------|
| Site-wide meta on all public indexable routes when token set | MSMT-01; token is global in `settings.seo` | ✓ |
| Landing page only | Under-injects for deep links shared in GSC | |

**Auto choice:** D-19.
**Notes:** `[auto] GSC meta → all public indexable routes`

---

## Claude's Discretion

- `routeDefaults` marketing copy strings.
- `titleTemplate` vs explicit concat (prefer explicit per D-06).
- Test coverage depth for `resolvePageSeo`.

## Deferred Ideas

- JSON-LD, sitemap, prerender, admin snippet preview, OG upload pipeline, per-event SEO — see CONTEXT.md `<deferred>`.
