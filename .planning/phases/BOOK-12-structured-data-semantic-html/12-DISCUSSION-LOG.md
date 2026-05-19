# Phase 12: Structured Data & Semantic HTML - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 12-structured-data-semantic-html
**Areas discussed:** Book metadata source, JSON-LD module shape, Event dates, Event + breadcrumb scope, Semantic audit depth, BreadcrumbList labels

---

## Book metadata source

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated `settings.book` CMS panel | ISBN, author, cover, publisher in admin; typed JSON in settings blob | ✓ |
| Derive from hero/showcase only | Reuse existing hero/pillar copy for Book schema | |

**User's choice:** All areas — accept research-aligned defaults (dedicated book panel).
**Notes:** Hero headline is marketing copy; SCHEMA-02 requires bibliographic fields not present today.

---

## JSON-LD module shape

| Option | Description | Selected |
|--------|-------------|----------|
| `src/seo/` module + `schema-dts` + `@graph` in one script | Mirrors SeoHead pattern; typed builders; single script per page | ✓ |
| Inline `<script>` per page without shared module | Faster but duplicates logic | |
| Multiple script tags per type | Simpler per-type but risks SPA duplication | |

**User's choice:** All areas — extend `src/seo/` with JsonLd + pure builders.
**Notes:** Aligns with `.planning/research/ARCHITECTURE.md` Pattern 5.

---

## Event dates for SCHEMA-05

| Option | Description | Selected |
|--------|-------------|----------|
| Prisma `startDate`/`endDate` migration | ISO source of truth; display strings unchanged for UI | ✓ |
| Parse existing `full_time` / `day` strings | No migration but fragile | |

**User's choice:** All areas — migration + admin ISO inputs; skip Event JSON-LD when startDate missing.

---

## Event + breadcrumb scope

| Option | Description | Selected |
|--------|-------------|----------|
| `/events` listing only — Event nodes in page graph | No detail URLs in roadmap | ✓ |
| Wait for `/events/:slug` | Blocks SCHEMA-05 until new routes | |
| Breadcrumb Home > Events only | Two-item trail on listing | ✓ |

**User's choice:** All areas — listing-only Event schema; blog post gets three-item breadcrumb.

---

## Semantic audit depth

| Option | Description | Selected |
|--------|-------------|----------|
| Public marketing routes only | `/`, `/blog`, `/blog/:slug`, `/events` | ✓ |
| Full site including community/admin | Broader but out of phase value | |

**User's choice:** All areas — fix h1, landmarks, key image alt on indexable marketing pages.

---

## BreadcrumbList labels

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from route + entity title | Home / Blog / article.title | ✓ |
| Configurable labels in CMS | Editorial control; more admin UI | |

**User's choice:** All areas — code-generated labels; no CMS breadcrumb editor.

---

## Claude's Discretion

- JsonLd file layout, Organization logo fallback, WebSite SearchAction deferral, vitest scope for builders.

## Deferred Ideas

- `/events/:slug`, Event SEO columns, SearchAction, community layout audit, hreflang.
