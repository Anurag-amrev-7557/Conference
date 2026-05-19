---
phase: 10
slug: seo-data-model-site-url-contract
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
validated: 2026-05-19
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (server) |
| **Config file** | `server/vitest.config.ts` |
| **Quick run command** | `cd server && npm test` |
| **Full suite command** | `cd server && npm test` |
| **Estimated runtime** | ~1 second (10 tests) |

---

## Sampling Rate

- **After every task commit:** Run `cd server && npm test`
- **After every plan wave:** Manual curl round-trip (article PUT, settings PATCH, GET `/content/site` includes `siteUrl`)
- **Before `/gsd:verify-work`:** ROADMAP success criteria 1–3 verified in admin + API
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | CRAWL-01 | — | `getSiteUrl()` rejects missing URL in production | unit | `cd server && npm test` | ✅ | ✅ green |
| 10-01-02 | 01 | 1 | CRAWL-01 | — | `absoluteUrl('/blog/x')` returns origin + path | unit | same | ✅ | ✅ green |
| 10-02-01 | 02 | 2 | CMS-01 | T-10-01 | Article SEO Zod accepts/rejects fields | unit | `cd server && npm test` | ✅ | ✅ green |
| 10-02-02 | 02 | 2 | CMS-02 | T-10-02 | `settings.seo` shape accepted in patch schema | unit | same | ✅ | ✅ green |
| 10-03-01 | 03 | 3 | CMS-01/02 | — | Admin UI saves visible in API | manual | Admin → save → DevTools network | ✅ | ✅ green (UAT) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `server/src/lib/siteUrl.ts` + `siteUrl.test.ts` — CRAWL-01
- [x] `server/vitest.config.ts` + `"test": "vitest run"`
- [ ] `supertest` devDependency — deferred; schema + UAT cover CMS persistence

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin UI saves SEO fields | CMS-01, CMS-02 | No E2E framework | BlogManager + SettingsManager → save → verify network payload |
| Article/settings API round-trip | CMS-01, CMS-02 | No supertest harness | curl PUT/PATCH + GET `/content/site` and `/admin/articles` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-05-19

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Gaps found | 4 |
| Resolved | 4 |
| Escalated | 1 (supertest API integration → manual-only) |

**Tests added:**
- `server/src/lib/siteUrl.test.ts` — CRAWL-01 (6 cases)
- `server/src/schemas/article.seo.test.ts` — CMS-01 Zod (3 cases)
- `server/src/schemas/content.seo.test.ts` — CMS-02 settings patch (1 case)
