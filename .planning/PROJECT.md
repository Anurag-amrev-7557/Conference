# Book Website (Superhumanly Monograph)

## What This Is

A full-stack author/book marketing website with a React/Vite public site, embedded admin CMS, Express/Prisma content API, and optional integration with the Superhumanly marketing-backend for lead intelligence. **v1.4** focuses on production-ready SEO, a complete CMS command center for all visitor-visible content, and documented admin access — without marketing-stack work.

## Core Value

Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure and live content controls.

## Requirements

### Validated

- ✓ Public marketing site with landing, events map, blog, and community UI (`src/pages/*`, `src/components/sections/*`)
- ✓ Unified content hydration via `GET /api/v1/content` and `WebsiteDataProvider`
- ✓ Admin CMS for appearance, pages, blogs, events, and settings (`src/components/admin/*`, `/admin/*`)
- ✓ JWT admin authentication against Express API (`server/src/routes/authRoutes.ts`, `adminRoutes.ts`)
- ✓ Prisma models for site content, articles, events, community posts, and comments (`server/prisma/schema.prisma`)
- ✓ SEO foundation: Helmet meta, JSON-LD, dynamic sitemap/robots, prerender, admin SEO tools (v1.1 Phases 10–16)

### Active (v1.4)

- [ ] Production SEO hardening: `SITE_URL`, event detail URLs in sitemap/prerender, Docker prerender strategy, premium social meta
- [ ] Admin CMS command center: section copy, catalog heroes, per-route SEO, visibility parity, media uploads, script injection
- [ ] Production release validation: smoke checks, deploy runbook, credential rotation guidance

### Out of Scope (v1.4)

- marketing-backend / marketing-frontend hardening (v1.3 Phases 24–25 — **paused**)
- Full SSR / Next.js migration
- hreflang, IndexNow, community UGC indexing
- RBAC, payments, native apps

## Context

**Brownfield baseline:** Monorepo at `book website-frontend` with embedded `server/` (Express + SQLite/Prisma). v1.1 shipped SEO/prerender; v1.2 UI track paused; v1.3 marketing integration paused per product choice.

**Production hosts referenced in code:** `monograph.superhumanly.ai`, book API under `/api/v1`.

## Constraints

- **Stack continuity:** React/Vite frontend and Express/Prisma backend
- **Security:** Server-only secrets; admin bcrypt login (not `VITE_ADMIN_PASSWORD`)
- **Scope:** Book website + server only in v1.4

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Extend `SiteContent` JSON for section copy and route SEO | Avoid parallel CMS DB; matches existing pattern | v1.4 |
| Docker builds use `PRERENDER_SKIP=1`; prerender in CI/post-publish | API+DB not available at image build time | v1.4 |
| v1.3 marketing integration paused | User priority is book production launch | 2026-05-21 |

## Current Milestone: v1.5 Conference Launch

**Goal:** Launch a premium, ai4.io-inspired conference page to attract users, integrated seamlessly with the existing public site architecture.

**Paused:** v1.3 Marketing Integration (Phases 24–27); v1.2 Apple-grade UI (Phases 17–23).

**Builds on:** v1.4 CMS Command Center (Phases 28–31).

---
*Last updated: 2026-05-25 — v1.5 milestone started*
