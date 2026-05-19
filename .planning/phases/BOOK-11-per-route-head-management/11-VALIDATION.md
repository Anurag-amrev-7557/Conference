---
phase: 11
slug: per-route-head-management
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
validated: 2026-05-19
---

# Phase 11 — Validation Strategy

> Nyquist validation matrix mapping META-01–META-06 to automated and manual verification.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (root) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Build command** | `npm run build` |
| **Estimated runtime** | ~0.2s (19 tests) + ~20s (build) |

---

## Sampling Rate

- **After every task commit:** `npm run build`
- **After plan 11-03:** `npm test`
- **After plan 11-02:** Manual DevTools head walk (11-UI-SPEC Browser Verification Checklist)
- **Before `/gsd:verify-work`:** All META success criteria in ROADMAP Phase 11
- **Max feedback latency:** 30 seconds (build + vitest)

---

## Requirement → Test Map

| Req ID | Behavior | Test Type | Plan | Task | Automated Command | File Exists | Status |
|--------|----------|-----------|------|------|-------------------|-------------|--------|
| META-01 | Unique title/description per public route | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |
| META-01 | Tab title changes on SPA navigation | manual | 11-02 | 11-02-01 | DevTools after / → /blog → post | ✅ | manual |
| META-02 | Canonical = SITE_URL + path, no trailing slash | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |
| META-02 | Single canonical link in DOM | manual | 11-02 | 11-02-01 | `document.querySelectorAll('link[rel=canonical]').length === 1` | ✅ | manual |
| META-03 | Full OG set; og:type article vs website | unit + manual | 11-03 / 11-02 | 11-03-02 / 11-02-01 | `npm test` + DevTools | ✅ | ✅ green |
| META-04 | Twitter mirrors OG; summary_large_image | manual | 11-02 | 11-02-01 | DevTools twitter:* vs og:* | ✅ | manual |
| META-04 | twitter:* uses name= attribute | unit | 11-01 | 11-01-02 | `SeoHead.source.test.ts` | ✅ | ✅ green |
| META-05 | /admin, /admin/*, /dashboard noindex | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |
| META-05 | Admin noindex in browser | manual | 11-02 | 11-02-02 | Visit /admin — meta robots | ✅ | manual |
| META-06 | index.html shell only | unit | 11-01 | 11-01-03 | `index.shell.test.ts` | ✅ | ✅ green |
| META-06 | View Source has no homepage OG on /blog | manual | 11-01 | 11-01-03 | View Source + navigate /blog | ✅ | manual |
| D-09 | Missing blog slug noindex before redirect | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |
| D-14 | /community noindex | unit + manual | 11-03 / 11-02 | 11-03-02 / 11-02-01 | `npm test` + DevTools | ✅ | ✅ green |
| D-15 | Article noindex \|\| !isPublished | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |
| D-19 | GSC meta on indexable routes only | unit | 11-03 | 11-03-02 | `npm test` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | META-06 | T-11-SC | react-helmet-async@3.0.0 exact version | build | `npm run build` | ✅ | ✅ green |
| 11-01-02 | 01 | 1 | META-01–05 (resolver) | T-11-01 | SeoHead escapes text; seoConfig pure | unit | `npm test` | ✅ | ✅ green |
| 11-01-03 | 01 | 1 | META-06 | T-11-04 | No duplicate shell canonical/OG | unit | `index.shell.test.ts` | ✅ | ✅ green |
| 11-02-01 | 02 | 2 | META-01–04 | T-11-03 | SeoHead before BlogPost null return | build + manual | `npm run build` | ✅ | ✅ green |
| 11-02-02 | 02 | 2 | META-05 | T-11-05 | Admin/dashboard/notFound noindex | unit + manual | `npm test` | ✅ | ✅ green |
| 11-02-03 | 02 | 2 | — | — | Admin help copy only | build | `npm run build` | ✅ | ✅ green |
| 11-03-01 | 03 | 3 | META-01–05 | T-11-SC | vitest devDep install | unit setup | `npm test` | ✅ | ✅ green |
| 11-03-02 | 03 | 3 | META-01–05 | T-11-06 | Resolver branch matrix | unit | `npm test` (15 cases) | ✅ | ✅ green |

---

## Wave 0 / Wave 3 Gaps

- [x] `vitest.config.ts` + `npm test` script — plan 11-03
- [x] `src/seo/seoConfig.test.ts` — META-01–05 unit coverage (15 tests)
- [x] `public/og-image.jpg` — D-06 fallback asset restored
- [x] `index.shell.test.ts` + `SeoHead.source.test.ts` — META-06 shell + META-04 twitter namespace

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SPA navigation head update | META-01 | No E2E in repo | DevTools Elements: navigate routes, compare title and description |
| Single canonical in DOM | META-02 | Needs hydrated DOM | After navigation, one `link[rel=canonical]` |
| Twitter card values in DOM | META-04 | Needs hydrated DOM | Confirm twitter:* values mirror og:* |
| View Source shell | META-06 | Static HTML vs hydrated | View Source: minimal shell; after JS: Helmet tags present |
| Social debugger smoke | META-03 | External tool | Optional Facebook Sharing Debugger on one post URL |
| API siteUrl parity | META-02 | Needs running API | Network: GET content/site siteUrl matches canonical host |

---

## Multi-Source Coverage Audit

| Source | Item | Plan |
|--------|------|------|
| GOAL | Unique head per public URL | 11-01 resolver + 11-02 wire |
| META-01 | Unique title/description | 11-02, 11-03 tests |
| META-02 | Canonical SITE_URL + path | 11-01 seoConfig, 11-03 tests |
| META-03 | Open Graph set | 11-01 SeoHead, 11-02 wire |
| META-04 | Twitter cards | 11-01 SeoHead |
| META-05 | Admin noindex | 11-02, 11-03 tests |
| META-06 | index.html shell | 11-01-03 |
| D-01–D-19 | All locked CONTEXT decisions | 11-01 (D-01–03,6–12,17–19), 11-02 (D-09,13–16,14) |
| RESEARCH | Vitest, og-image, BlogPost pattern | 11-01, 11-03 |
| UI-SPEC | Admin help copy | 11-02-03 |
| Deferred | JSON-LD, sitemap, prerender, SERP preview | — excluded |

**Coverage:** 100% of in-scope requirements and locked decisions mapped.

---

## Validation Sign-Off

- [x] All tasks have automated verify or documented manual path
- [x] No 3 consecutive tasks without automated verify (build/vitest between)
- [x] Wave 3 closes all ❌ W3 file-exists gaps
- [x] `nyquist_compliant: true` after 11-03 completes
- [x] Feedback latency under 30s for build/vitest

**Approval:** validated 2026-05-19

---

## Validation Audit 2026-05-19

| Metric | Count |
|--------|-------|
| Gaps found | 3 |
| Resolved | 3 |
| Escalated | 0 |

**Tests added/verified:**
- `src/seo/seoConfig.test.ts` — 15 resolver cases (existing, green)
- `src/seo/index.shell.test.ts` — META-06 static shell (3 cases)
- `src/seo/SeoHead.source.test.ts` — META-04 twitter `name=` namespace (1 case)
- `public/og-image.jpg` — D-06 fallback asset restored
