# Phase 2: Security Hardening - RESEARCH.md

**Researched:** 2026-05-18
**Status:** Ready for planning

## Summary

Phase 2 hardens an Express/Prisma API + Vite React SPA that already has Helmet (default config), community rate limiting, and JWT admin auth from Phase 1. The highest-risk gaps are duplicated `JWT_SECRET` fallbacks, marketing credentials in the client bundle, permissive CORS (`!origin → allow`), unsanitized blog markdown / `customCss`, and seed behavior that resets admin passwords on every run.

## Current State (codebase)

| Area | Location | Finding |
|------|----------|---------|
| JWT secret | `server/src/routes/authRoutes.ts`, `adminRoutes.ts` | Both use `process.env.JWT_SECRET \|\| 'supersecret'` independently |
| Helmet | `server/src/index.ts` | `app.use(helmet())` with no custom CSP |
| CORS | `server/src/index.ts` | Single `ALLOWED_ORIGINS`; `if (!origin \|\| ALLOWED_ORIGINS.includes(origin))` allows no-origin |
| Login rate limit | `authRoutes.ts` | None (community has 60/15min limiter) |
| Marketing client | `src/lib/marketing.ts` | `VITE_MARKETING_MASTER_KEY` + hardcoded `vellux_studio_2026_pk`; direct fetch to marketing URL |
| Email agent | `src/components/ContactSupportModal.tsx` | Direct `POST {MARKETING}/email-agent/process` — out of scope per D-20 |
| Blog XSS | `src/pages/BlogPostPage.tsx` | `react-markdown` without server sanitization |
| customCss | `src/App.tsx`, admin PATCH | Injected via `styleTag.innerHTML = settings.customCss` with no server validation |
| Community content | `communityRoutes.ts` | Plain text stored; no HTML strip on POST |
| Seed | `server/src/seed.ts` | `upsert` **update** overwrites admin password every run |
| gitignore | root `.gitignore` | No `dev.db` / `*.db-journal` entries |
| Env docs | `.env.example` | Exposes `VITE_MARKETING_MASTER_KEY` |

## Marketing-backend contract

`marketing-backend/marketing_api/main.py`:
- `POST /webhook` expects `WebhookPayload`: `{ id, type, actor: { email }, visitor_id?, content? }`
- Auth: `X-API-KEY` header vs `VELLUX_MASTER_KEY`
- `log_event` → `score_lead` → segment orchestration unchanged if proxy preserves shape

Book proxy should forward body + `X-API-KEY` from `MARKETING_API_KEY` (alias `VELLUX_API_KEY` in docs) to `{MARKETING_BACKEND_URL}/webhook`.

## Recommended implementation slices

### Slice 02-01 — Boot, auth abuse, secrets hygiene (SEC-01, SEC-02, SEC-06)

1. Add `server/src/lib/jwtSecret.ts` (or `config/secrets.ts`) exporting `getJwtSecret()`:
   - Production: throw if unset, empty, or `supersecret`
   - Development: allow `supersecret` with one-time `console.warn`
2. Replace inline secrets in `authRoutes.ts` and `adminRoutes.ts`
3. Add `loginLimiter` on `POST /login` only: 5 req / 15 min / IP, JSON 429 generic message
4. Fix `seed.ts`: `upsert` with `update: {}` for admin (create-only password)
5. Root `.gitignore`: `server/prisma/dev.db`, `*.db-journal`; `git rm --cached` if tracked
6. Update `server/.env.example` and root `.env.example` per D-24

### Slice 02-02 — XSS + headers (SEC-03, SEC-07)

1. Install `isomorphic-dompurify` (or `dompurify` + jsdom) in **server**
2. Sanitize article `body` on admin create/update and/or on public article GET (prefer write + read defense)
3. Community POST: strip tags / reject `<script` patterns in `content`
4. Extend `contentPatchSchema` or dedicated validator: reject `settings.customCss` containing `<script`, `javascript:`, `expression(`
5. Replace `helmet()` with explicit CSP per D-11; document `'unsafe-inline'` for styles in threat model

### Slice 02-03 — Proxy + CORS (SEC-04, SEC-05)

1. `server/src/routes/marketingRoutes.ts`: `POST /webhook` → server-side fetch to marketing-backend
2. Mount at `/api/v1/marketing` in `index.ts`
3. Refactor `src/lib/marketing.ts`: POST to `${API_BASE}/marketing/webhook` (no `X-API-KEY` in browser)
4. Remove `VITE_MARKETING_MASTER_KEY` from `.env.example`; add server-only `MARKETING_API_KEY`, `MARKETING_BACKEND_URL`
5. Split CORS: public routes vs admin; production deny missing Origin except `/health`
6. Flag `ContactSupportModal` direct email-agent call — document as Phase 3 / show user-visible error in dev

## Validation Architecture

Nyquist applies: security behaviors are testable with supertest + env fixtures.

| Requirement | Automated check | Manual |
|-------------|-----------------|--------|
| SEC-01 | Boot test: `NODE_ENV=production` without JWT_SECRET exits non-zero | — |
| SEC-02 | Supertest: 6th login in window → 429 | — |
| SEC-03 | Unit: DOMPurify strips `<script>` from sample markdown | Visual blog render |
| SEC-04 | Grep built `dist/assets/*.js` for `vellux_studio_2026_pk` → no match | — |
| SEC-05 | Supertest OPTIONS without Origin in prod mode → blocked on `/admin` | — |
| SEC-06 | `git check-ignore server/prisma/dev.db` | Re-run seed idempotency |
| SEC-07 | Response headers include `Content-Security-Policy` | Browser devtools |

**Framework:** Vitest or Jest in `server/` (add if missing — Wave 0 in VALIDATION.md).

**Quick command:** `cd server && npm test` (after Wave 0 setup).

## Risks & pitfalls

- **Helmet CSP breaks Vite HMR:** Tune `connect-src` for dev (`localhost:5173`, ws:).
- **Proxy timeout:** Marketing-backend down should return 502, not hang; use `fetch` with AbortSignal 10s.
- **CORS credentials:** Only enable for admin origin list when Bearer from browser.
- **Sanitize on write only:** Old malicious articles in DB need migration pass or sanitize-on-read.

## RESEARCH COMPLETE
