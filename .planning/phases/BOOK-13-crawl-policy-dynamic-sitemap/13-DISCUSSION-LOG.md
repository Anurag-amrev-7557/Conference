# Phase 13: Crawl Policy & Dynamic Sitemap - Discussion Log

> **Audit trail only.** Decisions are in `13-CONTEXT.md`.

**Date:** 2026-05-19  
**Phase:** 13-crawl-policy-dynamic-sitemap  
**Areas discussed:** Community indexing, Sitemap URL inventory, Crawler routing, Freshness signals

---

## Community indexing policy

| Option | Description | Selected |
|--------|-------------|----------|
| Meta noindex only + omit from sitemap | Phase 11 already; discovery via internal links still possible | |
| Add `Disallow: /community` + omit sitemap/prerender | Strongest v1.1 UGC block; aligns with STATE.md blocker | ✓ |
| Include `/community` in sitemap | Product wants UGC indexed | |

**User's choice:** All areas — lock community disallow in robots and exclude from sitemap/prerender-paths.  
**Notes:** Resolves `.planning/STATE.md` community indexing concern before Phase 14.

---

## Sitemap URL inventory

| Option | Description | Selected |
|--------|-------------|----------|
| Hubs + published non-noindex articles; events hub only | Matches Phase 10 D-04 and Phase 11 filters | ✓ |
| Per-event URLs in sitemap | No detail routes yet | |

**User's choice:** All areas — reaffirm Phase 10/11 URL rules.

---

## Crawler routing

| Option | Description | Selected |
|--------|-------------|----------|
| Express root routes + delete static `public/` files + nginx proxy | Research-aligned | ✓ |
| Keep static `public/sitemap.xml` as fallback | Risks stale crawl | |

**User's choice:** All areas — API authoritative; Vite dev proxy for local testing.

---

## Freshness signals

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic per-request XML; `lastmod` from `updatedAt`; 1h cache | Simple, correct for CMS publishes | ✓ |
| IndexNow on every article save | Out of phase scope | |

**User's choice:** All areas — on-demand generation; IndexNow deferred.

---

## Session

- **Existing context:** Update (replace synthesized draft)
- **Existing plans:** Replan after discuss
- **Chain:** `--chain` → plan-phase → execute-phase
