---
phase: 10
slug: seo-data-model-site-url-contract
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (Vitest planned, not present in repo) |
| **Config file** | none — Wave 0 optional: `server/vitest.config.ts` |
| **Quick run command** | `cd server && npm run build` |
| **Full suite command** | N/A until Vitest added |
| **Estimated runtime** | ~15 seconds (build only) |

---

## Sampling Rate

- **After every task commit:** Run `cd server && npm run build`
- **After every plan wave:** Manual curl round-trip (article PUT, settings PATCH, GET `/content/site` includes `siteUrl`)
- **Before `/gsd:verify-work`:** ROADMAP success criteria 1–3 verified in admin + API
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CRAWL-01 | — | `getSiteUrl()` rejects missing URL in production | unit | `vitest server/src/lib/siteUrl.test.ts` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | CRAWL-01 | — | `absoluteUrl('/blog/x')` returns origin + path | unit | same | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | CMS-01 | T-10-01 | Article SEO fields round-trip via PUT/GET | integration | vitest + supertest | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | CMS-02 | T-10-02 | `settings.seo.ogImage` persists via PATCH | integration | supertest | ❌ W0 | ⬜ pending |
| 10-03-01 | 03 | 3 | CMS-01/02 | — | Admin UI saves visible in API | manual | Admin → save → DevTools network | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `server/src/lib/siteUrl.ts` + `siteUrl.test.ts` — CRAWL-01
- [ ] `server/vitest.config.ts` + `"test": "vitest run"` — optional but aligns with Phase 2
- [ ] `supertest` devDependency — admin integration tests for CMS-01/02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin UI saves SEO fields | CMS-01, CMS-02 | No E2E framework | BlogManager + SettingsManager → save → verify network payload |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
