---
phase: 11-per-route-head-management
plan: 03
subsystem: seo
tags: [vitest, unit-tests, resolvePageSeo]

requires:
  - phase: 11-01
    provides: resolvePageSeo, vitest in package.json
provides:
  - vitest.config.ts at repo root
  - 15 unit tests for META-01–05 resolver branches
  - npm test script (vitest run)

key-files:
  created:
    - vitest.config.ts
  modified:
    - src/seo/seoConfig.test.ts

requirements-completed: [META-01, META-02, META-03, META-04, META-05]

## One-liner

Expanded `seoConfig.test.ts` to 15 cases and added standalone `vitest.config.ts` for CI-friendly `npm test`.

## Self-Check: PASSED

- `npm test` — 15/15 pass

## Deviations

Vitest toolchain partially introduced in 11-01; 11-03 adds dedicated config and full META test matrix.

## Next

Phase 12+ sitemap/prerender can reuse `resolvePageSeo` with same test contract.
