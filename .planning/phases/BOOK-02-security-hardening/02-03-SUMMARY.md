---
phase: 02-security-hardening
plan: 03
subsystem: integrations
tags: [marketing, cors, proxy, webhook]

requires:
  - phase: 02-security-hardening
    plan: 01
    provides: auth baseline
  - phase: 02-security-hardening
    plan: 02
    provides: CSP and sanitization
provides:
  - Server-side marketing webhook proxy (no browser API keys)
  - Split public/admin CORS policy
  - Phase 3 deferral for email-agent in ContactSupportModal
affects: [phase-03-marketing]

requirements-completed: [SEC-04, SEC-05]

completed: 2026-05-18
---

# Phase 02 Plan 03: Marketing Proxy and CORS

**Marketing telemetry flows through the book API; production CORS denies blind cross-origin admin access.**

## Accomplishments

- `POST /api/v1/marketing/webhook` proxies to marketing-backend with server `X-API-KEY` (D-16–D-19, D-21)
- `MarketingService` uses `${API_BASE}/marketing/webhook` with no client secrets (D-17)
- `corsPolicy.ts` splits `ALLOWED_ORIGINS` / `ADMIN_ALLOWED_ORIGINS` (D-13–D-15)
- Contact support uses mailto until Phase 3 email-agent proxy (D-20)

## Task Commits

1. **marketing proxy route** - `42538b7`
2. **MarketingService refactor** - `f1a102e`
3. **CORS split** - `92fa753`
4. **ContactSupport deferral** - `8a9261d`

## Self-Check: PASSED

- `npm run build` succeeds; `dist/` contains no `vellux_studio_2026_pk` or `VITE_MARKETING_MASTER_KEY`
