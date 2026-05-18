---
phase: 02-security-hardening
plan: 02
subsystem: security
tags: [xss, dompurify, helmet, csp, sanitize]

requires:
  - phase: 02-security-hardening
    plan: 01
    provides: stable auth baseline before content hardening
provides:
  - Server-side article HTML sanitization (DOMPurify allowlist)
  - Community plain-text strip on POST
  - Admin customCss rejection on dangerous patterns
  - Explicit Helmet CSP headers
affects: [02-03-marketing-proxy]

tech-stack:
  added: [isomorphic-dompurify]
  patterns:
    - "Sanitize on write for admin articles; sanitize on read for public API"
    - "Reject (400) dangerous customCss rather than silent strip"

key-files:
  created:
    - server/src/lib/sanitize.ts
  modified:
    - server/src/routes/adminRoutes.ts
    - server/src/routes/contentRoutes.ts
    - server/src/routes/communityRoutes.ts
    - server/src/index.ts

requirements-completed: [SEC-03, SEC-07]

completed: 2026-05-18
---

# Phase 02 Plan 02: XSS Mitigation and CSP

**Stored XSS defenses for blog, community, and admin CSS plus production Content-Security-Policy headers.**

## Accomplishments

- `sanitizeArticleHtml`, `stripCommunityText`, `validateCustomCss` library (D-07–D-09)
- Article create/update and public GET paths sanitized
- Community POST bodies stripped of HTML tags
- Helmet CSP with YouTube frame-src and dev connect-src (D-11, D-12)

## Task Commits

1. **sanitize library** - `b4907a4`
2. **admin article + customCss** - `b165af5`
3. **public + community** - `c5ff87c`
4. **Helmet CSP** - `7277fa2`

## Self-Check: PASSED

- Build succeeds; sanitize removes script tags from sample HTML
- validateCustomCss rejects `expression(` patterns
