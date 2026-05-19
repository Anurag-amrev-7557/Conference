---
phase: 12
slug: structured-data-semantic-html
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
---

# Phase 12 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (root) + Playwright script |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && node scripts/verify-phase12-schema.mjs` |
| **Estimated runtime** | ~20s |

## Per-Task Verification Map

| Task ID | Plan | Requirement | Test Type | Automated Command | Status |
|---------|------|-------------|-----------|-------------------|--------|
| 12-01-01 | 01 | SCHEMA-05 | build | `cd server && npm run build` | pending |
| 12-01-02 | 01 | SCHEMA-02 | build | `npm run build` | pending |
| 12-02-02 | 02 | SCHEMA-01–05 | unit | `npm test` | pending |
| 12-03-01 | 03 | SCHEMA-01–04 | build | `npm run build` | pending |
| 12-04-02 | 04 | SCHEMA-06 | e2e | `node scripts/verify-phase12-schema.mjs` | pending |

## Manual-Only

| Behavior | Why Manual |
|----------|------------|
| Google Rich Results Test | External tool on staging URL |
