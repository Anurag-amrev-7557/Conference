---
phase: 1
slug: backend-completeness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual curl + browser smoke (Vitest/supertest deferred to Phase 5) |
| **Config file** | none — Wave 0 installs smoke script |
| **Quick run command** | `bash server/scripts/smoke-phase1.sh` |
| **Full suite command** | Run all three plan `<verification>` blocks sequentially |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run task-specific curl/browser step from Per-Task map
- **After every plan wave:** Run plan `<verification>` block
- **Before `$gsd-verify-work`:** Full phase smoke + ROADMAP success criteria
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01-01 | 1 | BACK-01 | T-01-01 | Rate limit returns 429 after threshold | manual | `curl -X POST localhost:3001/api/v1/community/posts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01-01 | 1 | BACK-02 | — | Comment persists on post | manual | `curl POST .../comments` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01-01 | 1 | BACK-03 | T-01-02 | Toggle vote dedupes visitorId | manual | Two vote POSTs same visitorId | ❌ W0 | ⬜ pending |
| 01-02-01 | 01-02 | 2 | BACK-04 | T-01-03 | Expired JWT returns 401 on /admin/me | manual | `curl -H "Bearer bad" /admin/me` | ❌ W0 | ⬜ pending |
| 01-02-02 | 01-02 | 2 | BACK-05 | T-01-04 | Invalid body returns 400 + details | manual | `curl PATCH /admin/content -d '{}'` | ❌ W0 | ⬜ pending |
| 01-03-01 | 01-03 | 3 | BACK-06 | — | initialData header documents skeleton | source | `grep skeleton-only src/lib/websiteData.ts` | ✅ | ⬜ pending |
| 01-03-02 | 01-03 | 3 | BACK-07 | — | Pagination or split fetch works | manual | Browser network tab shows parallel or paginated calls | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/scripts/smoke-phase1.sh` — curl sequence for community + admin + validation 400
- [ ] Document server start: `cd server && npm run dev` + `npm run seed` if empty DB

*Existing infrastructure does not cover Phase 1 — Wave 0 is required before autonomous execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Public post without login | BACK-01 | No test runner | Open `/community`, create post with display name, refresh — post visible |
| Admin redirect on stale token | BACK-04 | Browser localStorage | Set invalid `adminToken`, open `/admin/dashboard` — redirect to login |
| Vote toggle | BACK-03 | UI + network | Click vote twice — count returns to original |
| Zod field errors | BACK-05 | Admin UI | Submit blog with missing title — 400 with field path in response |

---

## Validation Sign-Off

- [ ] All tasks have manual verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without verify step
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 complete

**Approval:** pending
