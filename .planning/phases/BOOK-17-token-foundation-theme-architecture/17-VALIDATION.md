---
phase: 17
slug: token-foundation-theme-architecture
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 17 — Validation Strategy

> Validation contract for Phase 17 (token foundation & theme architecture).

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vite.config.ts` / `vitest` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | under 60 seconds |

## Sampling Rate

- **After each plan commit:** `npm test`
- **Before phase close:** `npm run build:no-prerender`

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 17-verify-01 | 01 | 1 | DSM-02, DSM-03 | manual + unit | `npm test` | pending |
| 17-verify-02 | 02 | 1 | DSM-01, DSM-06, DSM-07 | manual contrast | `npm run build:no-prerender` | pending |
| 17-verify-03 | 03 | 1 | DSM-04, DSM-05 | manual admin | `npm test` | pending |

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| FOUC / first paint | DSM-02, DSM-03 | Browser paint | Throttle CPU in DevTools, hard refresh; `html` should match OS/storage before React. |
| CMS forces dark | DSM-04, precedence | OS + CMS interaction | CMS `colorScheme` = dark, OS = light; site stays dark. |
| Glass readability | DSM-07 | Visual | Toggle `.dark` on `html`; nav pill readable, borders visible. |

## Validation Sign-Off

- [ ] `npm test` green after implementation
- [ ] `npm run build:no-prerender` succeeds
- [ ] Manual matrix above completed once

**Approval:** pending
