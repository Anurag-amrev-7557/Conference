# Phase 2 Discussion Log

**Date:** 2026-05-18  
**Phase:** 02 — Security Hardening

## Session Summary

Single-pass discussion. User selected **"You decide"** for all gray areas and added a freeform requirement to link **marketing-backend** lead/engagement tracking to the book website.

## Gray Areas Presented

| Area | Topic |
|------|--------|
| JWT boot policy & login protection | SEC-01, SEC-02 |
| Markdown/CSS sanitization & CSP | SEC-03, SEC-07 |
| CORS: public read vs admin mutate | SEC-05 |
| Marketing proxy scope | SEC-04 |
| Secrets, dev.db gitignore & seed | SEC-06 |

## User Selections

| Area | Choice | Notes |
|------|--------|-------|
| All standard areas | You decide | Planner locks recommendations in CONTEXT.md |
| (freeform) | Marketing-backend linkage | Lead tracking / engagement events from book site must flow into marketing-backend pipeline |

## Locked Outcomes (see `02-CONTEXT.md`)

- Production JWT fail-fast; dev warning-only fallback
- Login 5/15min/IP rate limit; no refresh tokens
- DOMPurify for blog markdown; light validation for community; reject dangerous customCss
- CSP tuned for YouTube + fonts + Tailwind inline styles
- Split CORS lists; deny missing Origin in production (except health)
- `POST /api/v1/marketing/webhook` proxy preserving `WebhookPayload` contract; no client API key
- dev.db gitignore; production seed must not reset admin password

## Deferred During Discussion

- Email agent proxy → Phase 3
- Full MKT integration testing → Phase 3
