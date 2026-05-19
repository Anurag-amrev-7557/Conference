# Phase 10: SEO Data Model & Site URL Contract - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 10-SEO Data Model & Site URL Contract
**Areas discussed:** Event SEO scope

---

## Event SEO scope (Phase 10 model)

| Option | Description | Selected |
|--------|-------------|----------|
| Article + global only | Events use visible-field fallbacks until Phase 12/13; keeps Phase 10 smaller | ✓ |
| Add Event SEO columns now | Same four fields as Article to avoid later migration | |
| You decide | Pick per dependency order | |

**User's choice:** Article + global only
**Notes:** Matches CMS-01 scope (Article); Event columns explicitly out of Phase 10.

---

## Event meta fallback (before Event SEO fields)

| Option | Description | Selected |
|--------|-------------|----------|
| Visible event fields | title, host, location, thumbnail only | |
| Site-wide settings.seo only | Same global meta for all events | |
| Hybrid | Event title + host/location description; OG from thumbnail or global ogImage | ✓ |

**User's choice:** Hybrid
**Notes:** Informs Phase 11 `seoConfig` for `/events` until per-event overrides exist.

---

## Event indexing policy

| Option | Description | Selected |
|--------|-------------|----------|
| Listing only | `/events` indexable; no per-event URLs | ✓ (Claude discretion) |
| Detail pages | Each event gets own URL and can be indexed | |
| Listing + noindex details later | If detail URLs added, default noindex | |

**User's choice:** You decide
**Notes:** Current app has only `Route path="/events"` and drawer UI — discretion: listing only.

---

## Event sitemap entries (Phase 13)

| Option | Description | Selected |
|--------|-------------|----------|
| Only `/events` | Single hub entry | ✓ (Claude discretion) |
| Per-event if routed | Per-event URLs when detail routes exist | |
| You decide | Align at Phase 13 with routing | ✓ (user selected; resolved as hub-only) |

**User's choice:** You decide
**Notes:** Resolved to `/events` only until routable detail pages exist.

---

## Claude's Discretion

- Event indexing: listing-only (`/events`) based on current routing.
- Event sitemap: single `/events` URL until per-event routes ship.
- Undiscussed gray areas (SITE_URL, Article storage, admin UI depth, URL helpers): defer to REQUIREMENTS.md + research SUMMARY.md.

## Deferred Ideas

- Event Prisma SEO columns and per-event sitemap entries — future phase when detail URLs exist.
- Full BlogManager SEO tab, snippet preview, OG upload pipeline — Phases 15+ per roadmap.
