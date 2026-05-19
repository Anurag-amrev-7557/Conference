---
phase: 11
slug: per-route-head-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 11 — Validation Strategy

> Nyquist validation matrix mapping META-01–META-06 to automated and manual verification.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (added in plan 11-03) |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run src/seo/seoConfig.test.ts` |
| **Full suite command** | `npm test` |
| **Build command** | `npm run build` |
| **Estimated runtime** | ~10s (vitest) + ~20s (build) |

---

## Sampling Rate

- **After every task commit:** `npm run build`
- **After plan 11-03:** `npx vitest run src/seo/seoConfig.test.ts`
- **After plan 11-02:** Manual DevTools head walk (11-UI-SPEC Browser Verification Checklist)
- **Before `/gsd:verify-work`:** All META success criteria in ROADMAP Phase 11
- **Max feedback latency:** 30 seconds (build + vitest)

---

## Requirement → Test Map

| Req ID | Behavior | Test Type | Plan | Task | Automated Command | File Exists | Status |
|--------|----------|-----------|------|------|-------------------|-------------|--------|
| META-01 | Unique title/description per public route | unit | 11-03 | 11-03-02 | `npx vitest run src/seo/seoConfig.test.ts` | ❌ W3 | ⬜ pending |
| META-01 | Tab title changes on SPA navigation | manual | 11-02 | 11-02-01 | DevTools after / → /blog → post | ✅ | ⬜ pending |
| META-02 | Canonical = SITE_URL + path, no trailing slash | unit | 11-03 | 11-03-02 | vitest canonical assertions | ❌ W3 | ⬜ pending |
| META-02 | Single canonical link in DOM | manual | 11-02 | 11-02-01 | `document.querySelectorAll('link[rel=canonical]').length === 1` | ✅ | ⬜ pending |
| META-03 | Full OG set; og:type article vs website | unit + manual | 11-03 / 11-02 | 11-03-02 / 11-02-01 | vitest ogType + DevTools og:title | ❌ W3 | ⬜ pending |
| META-04 | Twitter mirrors OG; summary_large_image | manual | 11-02 | 11-02-01 | DevTools twitter:* vs og:* | ✅ | ⬜ pending |
| META-04 | twitter:* uses name= attribute | manual | 11-01 | 11-01-02 | Inspect SeoHead.tsx Elements | ✅ | ⬜ pending |
| META-05 | /admin, /admin/*, /dashboard noindex | unit | 11-03 | 11-03-02 | vitest robots on admin paths | ❌ W3 | ⬜ pending |
| META-05 | Admin noindex in browser | manual | 11-02 | 11-02-02 | Visit /admin — meta robots | ✅ | ⬜ pending |
| META-06 | index.html shell only | automated grep | 11-01 | 11-01-03 | grep no og:/canonical in index.html | ✅ | ⬜ pending |
| META-06 | View Source has no homepage OG on /blog | manual | 11-01 | 11-01-03 | View Source + navigate /blog | ✅ | ⬜ pending |
| D-09 | Missing blog slug noindex before redirect | manual | 11-02 | 11-02-01 | /blog/invalid-slug Elements panel | ✅ | ⬜ pending |
| D-14 | /community noindex | unit + manual | 11-03 / 11-02 | 11-03-02 / 11-02-01 | vitest + DevTools | ❌ W3 | ⬜ pending |
| D-15 | Article noindex \|\| !isPublished | unit | 11-03 | 11-03-02 | vitest article branches | ❌ W3 | ⬜ pending |
| D-19 | GSC meta on indexable routes only | unit | 11-03 | 11-03-02 | vitest googleSiteVerification | ❌ W3 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | META-06 | T-11-SC | react-helmet-async@3.0.0 exact version | build | `npm run build` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | META-01–05 (resolver) | T-11-01 | SeoHead escapes text; seoConfig pure | build | `npm run build` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | META-06 | T-11-04 | No duplicate shell canonical/OG | grep | plan verify grep index.html | ✅ | ⬜ pending |
| 11-02-01 | 02 | 2 | META-01–04 | T-11-03 | SeoHead before BlogPost null return | build + manual | `npm run build` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 2 | META-05 | T-11-05 | Admin/dashboard/notFound noindex | build + manual | `npm run build` | ✅ | ⬜ pending |
| 11-02-03 | 02 | 2 | — | — | Admin help copy only | build | `npm run build` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 3 | META-01–05 | T-11-SC | vitest devDep install | unit setup | `npx vitest run --passWithNoTests` | ❌ W3 | ⬜ pending |
| 11-03-02 | 03 | 3 | META-01–05 | T-11-06 | Resolver branch matrix | unit | `npx vitest run src/seo/seoConfig.test.ts` | ❌ W3 | ⬜ pending |

---

## Wave 0 / Wave 3 Gaps

- [ ] `vitest.config.ts` + `npm test` script — plan 11-03
- [ ] `src/seo/seoConfig.test.ts` — META-01–05 unit coverage
- [ ] `public/og-image.jpg` — plan 11-01-03 (Pitfall 6)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SPA navigation head update | META-01 | No E2E in repo | DevTools Elements: navigate routes, compare title and description |
| Twitter card attribute namespace | META-04 | DOM inspection | Confirm `name="twitter:*"` not `property=` |
| View Source shell | META-06 | Static HTML vs hydrated | View Source: no og:* ; after JS: Helmet tags present |
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

- [ ] All tasks have automated verify or documented manual path
- [ ] No 3 consecutive tasks without automated verify (build/vitest between)
- [ ] Wave 3 closes all ❌ W3 file-exists gaps
- [ ] `nyquist_compliant: true` after 11-03 completes
- [ ] Feedback latency under 30s for build/vitest

**Approval:** pending
