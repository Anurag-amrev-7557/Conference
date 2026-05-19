# Book Website (Superhumanly Monograph)

## What This Is

A full-stack author/book marketing website with a React/Vite public site, embedded admin CMS, Express/Prisma content API, and integration with the Superhumanly marketing-backend for lead intelligence, scoring, and agentic email. This milestone takes the existing prototype to production-grade quality and extends it with enterprise features: multi-admin RBAC, real-time chat, payments, and a mobile experience.

## Core Value

Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure and marketing intelligence.

## Requirements

### Validated

- ✓ Public marketing site with landing, events map, blog, and community UI (`src/pages/*`, `src/components/sections/*`)
- ✓ Unified content hydration via `GET /api/v1/content` and `WebsiteDataProvider`
- ✓ Admin CMS for appearance, pages, blogs, events, and settings (`src/components/admin/*`, `/admin/*`)
- ✓ JWT admin authentication against Express API (`server/src/routes/authRoutes.ts`, `adminRoutes.ts`)
- ✓ Prisma models for site content, articles, events, community posts, and comments (`server/prisma/schema.prisma`)
- ✓ Marketing telemetry client posting to marketing-backend webhook shape (`src/lib/marketing.ts` → `marketing_api/main.py`)

### Active

- [ ] Backend APIs complete for all client mutations (community writes, votes, admin session validation)
- [ ] Security hardened for production (secrets, rate limits, XSS/CSS sanitization, server-side marketing proxy)
- [ ] Marketing-backend integration production-ready (identity merge, lead capture, email agent, CORS alignment)
- [ ] Production infrastructure (CI/CD, env separation, deploy docs, database strategy for scale)
- [ ] Automated test coverage for critical paths
- [ ] Multi-admin RBAC with roles and audit trail
- [ ] Real-time chat for community or support
- [ ] Payment processing for book/events
- [ ] Mobile app (or installable PWA) for core reader journeys

### Out of Scope

- Replacing marketing-backend with a new analytics stack — extend and integrate the existing FastAPI service
- Full e-commerce marketplace — payments target book purchase and event registration, not multi-vendor catalog
- Native iOS/Android store apps in v1 if PWA satisfies mobile requirement — evaluate in Phase 9 planning

## Context

**Brownfield baseline (mapped 2026-05-18):** Monorepo at `book website-frontend` with embedded `server/` (Express + SQLite/Prisma). Codebase maps live in `.planning/codebase/`. Known gaps: community write routes missing on server, marketing API key exposed in browser bundle, SQLite not production-scaled, no CI/tests, single admin account, placeholder `/dashboard` CRM page.

**Marketing-backend** (`/Users/anuragverma/Downloads/marketing-backend/`): FastAPI service with `/webhook`, `/events`, `/email-agent/process`, lead scoring (Bronze→Platinum), Bedrock orchestration, SQLite `marketing_agent.db`. Shared `VELLUX_API_KEY` / `VITE_MARKETING_MASTER_KEY` convention.

**Production hosts referenced in code:** `monograph.superhumanly.ai`, `api.superhumanly-thoughts.com` (book API path `/book/api/v1`, marketing `/marketing/webhook`).

## Constraints

- **Stack continuity:** Keep React/Vite frontend and Express/Prisma backend unless a phase explicitly requires change (e.g., Postgres migration)
- **Marketing-backend coupling:** Book site must integrate with existing `marketing-backend` API contracts; coordinate CORS, API keys, and webhook payloads
- **Security:** Marketing credentials must not ship in client bundles — server-side proxy is the target pattern
- **Phased delivery:** Foundation phases (backend, security, marketing, infra, quality) precede expansion phases (RBAC, chat, payments, mobile)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-scope milestone includes RBAC, chat, payments, mobile | User explicitly requested all capability areas in milestone scope | — Pending |
| Marketing integration via server-side proxy | Industry practice; removes `VITE_MARKETING_MASTER_KEY` from browser | — Pending |
| Database strategy deferred to Phase 4 planning | User chose "decide in phase planning" between Postgres vs SQLite volume | — Pending |
| Phase order: foundation before expansion | Backend/security/marketing/infra/quality unblock enterprise features | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Current Milestone: v1.1 Premium Presentation & SEO Dominance

**Goal:** Transform the book website into a polished, modern, conversion-ready experience with best-in-class technical SEO so the site ranks competitively on Google for brand and topic queries.

**Target features:**
- Technical SEO foundation (per-route meta, JSON-LD, dynamic sitemap, robots tuning)
- Crawlability & Core Web Vitals (prerender/SSR strategy, performance, semantic HTML)
- Content SEO (slug URLs, heading hierarchy, internal linking, per-page admin SEO)
- Search Console readiness (verification, analytics, indexability audit)
- Premium UI/UX polish (design system, responsive layouts, stable motion, premium flows)
- Admin SEO tools (per-page OG images, noindex, snippet preview)

**Prior milestone (v1.0) — paused at Phase 3:** Backend completeness and security hardening shipped (Phases 1–2). Marketing integration, infra, RBAC, chat, payments, and mobile deferred.

---
*Last updated: 2026-05-19 after milestone v1.1 initialization*
