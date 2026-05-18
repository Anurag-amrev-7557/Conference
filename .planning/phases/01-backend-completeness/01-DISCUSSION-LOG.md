# Phase 1: Backend Completeness - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 01-Backend Completeness
**Areas discussed:** Community write access, Vote persistence, Admin session on load, Content API shape

---

## Community write access

| Option | Description | Selected |
|--------|-------------|----------|
| Anyone (anonymous) | Public POST with display name only | |
| Lightweight identity | Name in localStorage, reused | ✓ (agent) |
| Admin/moderators only | Read-only public feed | |
| You decide | Planner picks | ✓ (user) |

**User's choice:** You decide (all four initial questions)
**Notes:** Planner locked split public/admin routes, live publish + admin delete/pin, CMS community manager, fixed categories, basic IP rate limit. Follow-up: remember display name, both public+CMS, fixed categories, basic rate limit — all via agent discretion.

---

## Vote persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — persist to DB | Vote endpoint, survives refresh | ✓ (agent) |
| Hide vote UI | Remove misleading controls | |
| Local-only | Browser optimistic only | |
| You decide | Planner picks | ✓ (user) |

**User's choice:** You decide
**Notes:** Planner locked: persist votes, dedup via `vellux_visitor_id`, toggle upvote, `POST .../vote`.

---

## Admin session on load

| Option | Description | Selected |
|--------|-------------|----------|
| On every /admin/* mount | GET /admin/me before dashboard | ✓ (agent) |
| On first mutation only | Stale UI risk | |
| Mount + periodic refresh | Re-check every N minutes | |
| You decide | Planner picks | ✓ (user) |

**User's choice:** You decide
**Notes:** Planner locked: validate on mount, profile snippet response, redirect on expiry, clear token + session flags on 401.

---

## Content API shape

| Option | Description | Selected |
|--------|-------------|----------|
| Keep monolithic GET /content | Defer split to end of phase | ✓ (agent, plans 01-01/02) |
| Add pagination params | limit/offset on sub-resources | ✓ (agent, plan 01-03) |
| Split endpoints | Parallel provider fetches | ✓ (agent, plan 01-03) |
| You decide | Planner picks | ✓ (user) |

**User's choice:** You decide
**Notes:** Planner locked: seed authoritative, thin frontend skeleton, shared Zod schemas for all admin mutating routes.

---

## Agent discretion

User selected "You decide" on every AskUserQuestion. CONTEXT.md §Agent discretion documents the binding planner defaults applied from codebase analysis and ROADMAP.md plan order.

## Deferred Ideas

- Community approval queue
- Up/down voting
- JWT refresh / silent re-auth
- Marketing proxy (Phase 3)
- RBAC (Phase 6)
