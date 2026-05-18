# Phase 1: Backend Completeness — Research

**Researched:** 2026-05-18  
**Phase:** 01-backend-completeness  
**Requirements:** BACK-01 through BACK-07

---

## Executive Summary

Phase 1 closes the gap between a working read-only content API and the mutations the React UI already advertises. Community writes currently target non-existent `POST /api/v1/admin/posts` routes while public visitors have no token; admin routes apply JWT to the entire router but lack `/me` and input validation. Vote persistence requires a new `PostVote` table because the existing `votes` integer on `CommunityPost` cannot deduplicate by `vellux_visitor_id`. Zod is not yet a server dependency. The roadmap’s three-plan split (community → admin session/Zod → content API) matches natural file boundaries and dependency order.

---

## Current State

| Area | Works today | Broken / missing |
|------|-------------|------------------|
| Content read | `GET /api/v1/content` returns hero, articles, events, community + comments | Monolithic payload; no pagination |
| Community write | Prisma models exist; UI calls `api.createPost` with admin token | No server routes; public users have no token → silent no-op |
| Votes | `votes` column on posts | `handleVote` empty; no dedup table |
| Admin session | JWT login stores `adminToken` in localStorage | No `GET /admin/me`; stale token shows dashboard |
| Admin mutations | Blogs/events CRUD with `req.body` spread | No Zod; 500 on Prisma errors |
| Defaults | `seed.ts` + `websiteData.ts` both hold full demo content | Drift risk (BACK-06) |

**Route mounting** (`server/src/index.ts`):

- `/api/v1/content` → `contentRoutes`
- `/api/v1/auth` → `authRoutes` (login only)
- `/api/v1/admin` → `adminRoutes` (JWT on all routes via `router.use(authenticateAdmin)`)

**Client API** (`src/lib/api.ts`): `createPost` / `addComment` → `${API_BASE}/admin/posts` (404).

**Provider** (`WebsiteDataProvider.tsx`): `createPost` / `addComment` require `getAdminToken()` and return early without token.

---

## Recommended Architecture

### 1. Split public vs admin community routes

| Surface | Base path | Auth | Operations |
|---------|-----------|------|------------|
| Public community | `/api/v1/community` | None (rate-limited) | `POST /posts`, `POST /posts/:id/comments`, `POST /posts/:id/vote` |
| Admin community | `/api/v1/admin/community` | Bearer JWT | `POST/PUT/DELETE /posts`, `PATCH /posts/:id/pin`, `DELETE /comments/:id` |
| Admin session | `/api/v1/admin/me` | Bearer JWT | Profile snippet `{ ok, role, username, exp }` |

Register `communityRoutes` in `index.ts` **without** admin middleware. Keep blog/event patterns in `adminRoutes.ts`.

### 2. Vote deduplication (BACK-03, D-07–D-10)

Add Prisma model:

```prisma
model PostVote {
  id        String   @id @default(uuid())
  postId    String
  visitorId String
  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  @@unique([postId, visitorId])
}
```

Toggle logic on `POST /api/v1/community/posts/:id/vote`:

- Body: `{ visitorId: string }` (client sends `MarketingService.getVisitorId()` / `vellux_visitor_id`)
- If vote row exists → delete row, decrement `CommunityPost.votes`
- Else → create row, increment `votes`
- Response: `{ votes: number, voted: boolean }`

**[BLOCKING]** After schema edit: `cd server && npx prisma migrate dev --name post_votes` (or `npx prisma db push` for dev SQLite).

### 3. Lightweight public identity (D-01)

- localStorage key: `book_community_author_name` (display name)
- Default avatar URL constant shared with `CommunityPage` (or from settings later)
- Server validates `authorName` non-empty string, max length ~64
- Categories: server allowlist matches `CreatePostModal` — `Architecture`, `Prompt Engineering`, `No-Code`, `Strategy`, `Venture`, `General`

### 4. Rate limiting (D-06)

Add `express-rate-limit` on `/api/v1/community` router only:

- Suggested: 10 POST requests / 15 min / IP (planner discretion in implementation)
- Return `429` with `{ error: 'Too many requests' }`

### 5. Admin `/me` (D-11–D-14)

Add **before** or as first route on admin router with same `authenticateAdmin`:

- Decode JWT with `jwt.verify`, read `exp` and `role` from payload
- Lookup `admin` username from DB (single `admin` user today)
- 401 → client clears `adminToken` + `config.admin.sessionKey`

`AdminPage.tsx`: on mount when token exists, call `api.getAdminMe()`; set `isAuthenticated` false + message on failure.

### 6. Zod validation (D-18, BACK-05)

- Add `zod` to `server/package.json`
- `server/src/schemas/` — `contentPatchSchema`, `articleSchema`, `eventSchema`, `communityPostSchema`, `commentSchema`
- Middleware `validateBody(schema)` → `400` + `{ error: 'Validation failed', details: [{ path, message }] }`
- Apply to: `PATCH /admin/content`, blog/event CRUD, admin community routes

### 7. Content API evolution (D-15–D-17, BACK-07)

**Plans 01-01/02:** Keep monolithic `GET /content`.

**Plan 01-03:**

- Add query params on monolithic route: `?articlesLimit=&articlesOffset=` etc., OR
- Split: `GET /content/site`, `/content/articles`, `/content/events`, `/content/community`
- `WebsiteDataProvider`: `Promise.all` parallel fetches, merge into existing `WebsiteData` shape
- Trim `websiteData.ts` `initialData` to structural skeleton (ids, empty arrays, minimal hero keys); document in file header that seed is authoritative

---

## File-Level Plan

| File | Action |
|------|--------|
| `server/prisma/schema.prisma` | Add `PostVote`, relation on `CommunityPost` |
| `server/src/routes/communityRoutes.ts` | **New** — public POST handlers |
| `server/src/routes/adminRoutes.ts` | `/me`, community admin CRUD, Zod middleware |
| `server/src/index.ts` | Mount community router; optional rate limit |
| `server/src/schemas/*.ts` | **New** — Zod schemas |
| `server/src/middleware/validate.ts` | **New** — shared validator |
| `src/lib/api.ts` | Public community + vote + `getAdminMe`; admin community methods |
| `src/components/WebsiteDataProvider.tsx` | Public vs admin paths; `votePost` |
| `src/pages/CommunityPage.tsx` | Wire vote, display name from localStorage |
| `src/pages/AdminPage.tsx` | Session validation on mount |
| `src/components/admin/CommunityManager.tsx` | **New** — CMS community manager (D-04) |
| `src/lib/websiteData.ts` | Skeleton-only defaults (plan 03) |

---

## Dependencies to Add

| Package | Plan | Purpose |
|---------|------|---------|
| `zod` | 01-02 | Request validation |
| `express-rate-limit` | 01-01 | Community POST throttling |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Open POST spam | IP rate limit + fixed categories; Phase 2 adds stronger limits |
| Visitor ID spoofing | Acceptable for Phase 1; marketing mesh alignment in Phase 3 |
| JWT still uses `supersecret` fallback | Out of phase scope (SEC-01 in Phase 2); document in plan threat_model |
| No automated tests yet | Manual curl checklist in VALIDATION.md; Phase 5 adds Vitest/supertest |
| Admin community UI scope creep | Mirror BlogManager minimal CRUD only |

---

## Validation Architecture

Phase 1 has **no existing test runner** (no `test` script in root or server `package.json`). Validation strategy:

| Layer | Approach | When |
|-------|----------|------|
| **Wave 0** | Document manual curl/smoke commands in `01-VALIDATION.md` | Before execute |
| **Per-task** | `curl` / browser smoke per acceptance criteria | After each task |
| **Per-plan** | Full manual script: community post → comment → vote → admin login → invalid payload 400 | End of plan |
| **Phase verify** | `$gsd-verify-work` conversational UAT against ROADMAP success criteria | After all plans |

**Wave 0 deliverables (lightweight):**

- `server/scripts/smoke-phase1.sh` (optional) — curl sequence against localhost:3001
- No Vitest until Phase 5 (QUAL-01/02)

**Sampling:** After each plan commit, run that plan’s `<verification>` block. Before `$gsd-verify-work`, run all three plan verification sections.

**Nyquist note:** Automated commands are mostly manual until Phase 5; `01-VALIDATION.md` maps each BACK-* requirement to a concrete curl or browser step so executors are not blocked.

---

## Requirement Traceability

| REQ-ID | Research conclusion |
|--------|---------------------|
| BACK-01 | Public + admin community post routes; CMS `CommunityManager` |
| BACK-02 | `POST /community/posts/:id/comments` + cascade via Prisma |
| BACK-03 | `PostVote` + toggle endpoint |
| BACK-04 | `GET /admin/me` + AdminPage mount check |
| BACK-05 | Zod on all admin mutating routes |
| BACK-06 | Skeleton `initialData` + seed authoritative comment |
| BACK-07 | Pagination or split endpoints in 01-03 |

---

## RESEARCH COMPLETE

**Output:** `.planning/phases/01-backend-completeness/01-RESEARCH.md`  
**Ready for:** `$gsd-plan-phase 1` planner spawn (3 plans: 01-01, 01-02, 01-03)
