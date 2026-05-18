# Phase 1: Backend Completeness - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Close API gaps so every CMS and community action the UI exposes persists through validated Express/Prisma APIs. This phase delivers working community write/vote routes, admin session validation, Zod-validated admin mutations, and a clarified content/default-data strategy — without security hardening (Phase 2), marketing proxy (Phase 3), or RBAC (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Community write access
- **D-01:** Public visitors may create posts and comments with **lightweight identity** — display name stored in `localStorage`, pre-filled on subsequent posts (not a fresh prompt every time, not a fixed "Community Member" placeholder).
- **D-02:** **Split route model** — public `POST` routes under `/api/v1/community/*` for create; admin routes for delete, pin, and CMS-managed posts.
- **D-03:** Content goes **live immediately**; no approval queue in Phase 1. Admins may delete or pin posts.
- **D-04:** Admins can manage community from **CMS** (create/pin/delete) in addition to public creation — same pattern as blogs/events managers.
- **D-05:** Post **categories** use the existing fixed list in `CreatePostModal` (Architecture, Prompt Engineering, etc.).
- **D-06:** **Basic per-IP rate limiting** on community `POST` routes in Phase 1 (lightweight; broader security in Phase 2).

### Vote persistence
- **D-07:** **Persist votes to the database** in Phase 1 (BACK-03); do not hide vote UI or keep local-only counts.
- **D-08:** Voter dedup uses **`vellux_visitor_id`** from `src/lib/marketing.ts` (aligns with marketing identity mesh in Phase 3).
- **D-09:** **Toggle upvote** — clicking again removes the vote; net count adjusts (not up/down, not increment-only).
- **D-10:** Vote mutation via **`POST /api/v1/community/posts/:id/vote`** (public route).

### Admin session validation
- **D-11:** Validate admin JWT **on every `/admin/*` mount** via `GET /api/v1/admin/me` before rendering the dashboard.
- **D-12:** `/admin/me` returns a **profile snippet**: `{ ok, role, username, exp }` (enough for header display and expiry awareness).
- **D-13:** On expired/invalid token: **redirect to login** with a clear message; do not use silent refresh (no refresh-token flow in Phase 1).
- **D-14:** On 401 from `/admin/me`: **clear `adminToken` and `config.admin.sessionKey`** from `localStorage`.

### Content API shape & validation
- **D-15:** **Keep monolithic `GET /api/v1/content`** for plans 01-01 and 01-02; add **pagination query params** (`limit`, `offset`) on articles/events/community in plan 01-03 (BACK-07).
- **D-16:** When endpoints split in 01-03, `WebsiteDataProvider` loads via **parallel `Promise.all` fetches** and merges results.
- **D-17:** **Server seed is authoritative** for default content; `src/lib/websiteData.ts` `initialData` is a **thin offline skeleton only** — must not diverge from seed (BACK-06).
- **D-18:** **Shared Zod schemas** in `server/src/schemas/` validate **all admin mutating routes** (content PATCH, blogs, events, community admin) with **400 + field-level errors** (BACK-05).

### Agent discretion
User selected "You decide" for all discussion questions. Locked recommendations above are the planner's binding defaults unless the user edits CONTEXT.md before `$gsd-plan-phase 1`.

Areas deferred to agent within phase scope: exact rate-limit thresholds, Zod schema field names, and pagination default page sizes.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan breakdown (01-01..01-03)
- `.planning/REQUIREMENTS.md` — BACK-01 through BACK-07
- `.planning/PROJECT.md` — Core value, constraints, marketing-backend coupling notes

### Codebase maps
- `.planning/codebase/ARCHITECTURE.md` — Unified content fetch, admin mutation flow, known community gap
- `.planning/codebase/INTEGRATIONS.md` — Book API routes, JWT auth, marketing visitor_id
- `.planning/codebase/CONCERNS.md` — Community 404s, admin session stub, vote no-op, dual content source

### Implementation touchpoints
- `server/prisma/schema.prisma` — `CommunityPost`, `Comment`, `Admin` models
- `server/src/routes/adminRoutes.ts` — Existing admin CRUD (blogs/events); extend for community + `/me`
- `server/src/routes/contentRoutes.ts` — Monolithic `GET /content`
- `server/src/seed.ts` — Authoritative default content target
- `src/lib/api.ts` — Client API surface (community calls currently point at missing `/admin/posts`)
- `src/components/WebsiteDataProvider.tsx` — `createPost`/`addComment` require token today (broken for public UX)
- `src/pages/CommunityPage.tsx` — Public community UI, empty `handleVote`
- `src/pages/AdminPage.tsx` — Token-in-localStorage gate without server validation
- `src/lib/marketing.ts` — `vellux_visitor_id` for vote dedup

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/api.ts` — Extend with public community + vote methods; add `getAdminMe()`
- `WebsiteDataProvider` — Mutation/refetch pattern already used for blogs/events; split public vs admin token usage for community
- `adminRoutes.ts` — JWT `authenticateAdmin` middleware ready to mount `/me` and community admin handlers
- Prisma models — `CommunityPost` / `Comment` already exist; votes column on posts

### Established Patterns
- Unified `GET /content` hydrates entire site; provider deep-merges with `initialData`
- Admin mutations: Bearer JWT → Prisma write → `fetchContent()` refresh
- JSON stringify/parse for `SiteContent` blobs in routes

### Integration Points
- `CommunityPage` → public community routes (no admin token)
- `AdminPage` mount → `GET /admin/me` before dashboard render
- Plan 01-03 → optional split endpoints + pagination on provider fetch path

</code_context>

<specifics>
## Specific Ideas

- User chose to discuss all four gray areas and deferred implementation details to the planner ("You decide" on every question).
- Roadmap plan order should be respected: community routes first (01-01), admin session + Zod (01-02), content API pagination + defaults (01-03).

</specifics>

<deferred>
## Deferred Ideas

- **Approval queue for community posts** — stronger spam control; belongs in Phase 6+ moderation or Phase 2 rate-limit hardening if needed sooner.
- **Up/down voting** — Reddit-style scores; not in Phase 1 (toggle upvote only).
- **JWT refresh tokens / silent re-auth** — Phase 2 security or later.
- **Marketing server-side proxy** — Phase 3 (SEC-04 / MKT-01).
- **Multi-admin RBAC** — Phase 6; `/admin/me` returns role stub only to prepare claims shape.

</deferred>

---

*Phase: 01-Backend Completeness*
*Context gathered: 2026-05-18*
