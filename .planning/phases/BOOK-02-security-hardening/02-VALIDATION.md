---
phase: 02
slug: security-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (install in `server/` if absent) |
| **Config file** | `server/vitest.config.ts` (Wave 0) |
| **Quick run command** | `cd server && npm test` |
| **Full suite command** | `cd server && npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd server && npm test`
- **After every plan wave:** Run `cd server && npm test` + grep dist for leaked keys after 02-03
- **Before `/gsd:verify-work`:** Full suite green + manual CSP smoke in browser
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SEC-01 | T-02-01 | prod boot throws without JWT_SECRET | unit | `NODE_ENV=production JWT_SECRET= npm test -- jwtSecret` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SEC-02 | T-02-02 | 6th login → 429 | integration | `npm test -- authRateLimit` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | SEC-06 | T-02-03 | seed upsert does not update password | integration | `npm test -- seed` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | SEC-03 | T-02-04 | script stripped from article HTML | unit | `npm test -- sanitize` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SEC-07 | T-02-05 | CSP header present | integration | `npm test -- helmet` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | SEC-04 | T-02-06 | proxy forwards webhook | integration | `npm test -- marketingProxy` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | SEC-05 | T-02-07 | no-origin denied on admin in prod | integration | `npm test -- cors` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/vitest.config.ts` — vitest + supertest setup
- [ ] `server/src/__tests__/setup.ts` — test app factory from `index.ts` export
- [ ] `server/package.json` — `"test": "vitest run"` script

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blog render safe | SEC-03 | Visual DOM | Create article with `<script>alert(1)</script>`; confirm no execution |
| CSP allows YouTube embed | SEC-07 | Browser | Load hero with YouTube iframe |
| Built bundle no marketing key | SEC-04 | Vite build | `npm run build` then `rg vellux_studio dist/` → empty |

---
