---
phase: 02-security-hardening
plan: 01
subsystem: auth
tags: [jwt, rate-limit, express, prisma, security]

requires:
  - phase: 01-backend-completeness
    provides: auth routes, admin JWT gate, seed pipeline
provides:
  - Centralized JWT secret resolution with production fail-fast
  - Login brute-force throttling (5/15min per IP)
  - Safe admin seed (no password overwrite on re-run)
  - dev.db excluded from version control
affects: [02-02-xss-sanitization, 02-03-marketing-proxy]

tech-stack:
  added: []
  patterns:
    - "Single jwtSecret module imported at boot and by auth/admin routes"
    - "Per-route rate limiter on POST /login only"

key-files:
  created:
    - server/src/lib/jwtSecret.ts
    - server/.env.example
  modified:
    - server/src/routes/authRoutes.ts
    - server/src/routes/adminRoutes.ts
    - server/src/index.ts
    - server/src/seed.ts
    - .gitignore
    - .env.example

key-decisions:
  - "Production rejects missing or default JWT_SECRET before listen()"
  - "Development uses supersecret with one-time console warning"
  - "Login 429 returns generic message without username hints"

patterns-established:
  - "Import getJwtSecret() at module load in index.ts for early misconfig exit"

requirements-completed: [SEC-01, SEC-02, SEC-06]

duration: 15min
completed: 2026-05-18
---

# Phase 02 Plan 01: JWT, Login Throttle, Secrets Hygiene

**Production-safe JWT configuration, login rate limiting, and seed/gitignore hardening before XSS and marketing proxy work.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments

- `getJwtSecret()` fails fast in production when `JWT_SECRET` is missing or `supersecret`
- Login limited to 5 attempts per 15 minutes per IP with generic 429 body
- Admin seed upsert no longer resets password on update
- `server/prisma/dev.db` removed from git tracking and added to `.gitignore`

## Task Commits

1. **Task 1: jwtSecret module and route wiring** - `dd7949e`
2. **Task 2: login rate limiter** - `d2a5f2a`
3. **Task 3: safe seed and gitignore** - `0221cfa`
4. **Task 4: boot-time jwtSecret validation** - `12bddca`

## Files Created/Modified

- `server/src/lib/jwtSecret.ts` - JWT secret resolution (D-01–D-03)
- `server/src/routes/authRoutes.ts` - getJwtSecret + loginLimiter (D-04, D-05)
- `server/src/routes/adminRoutes.ts` - getJwtSecret for verify
- `server/src/index.ts` - early getJwtSecret() call
- `server/src/seed.ts` - upsert `update: {}` (D-23)
- `.gitignore` - dev.db paths (D-22)
- `.env.example` / `server/.env.example` - JWT_SECRET documented (D-24)

## Self-Check: PASSED

- Production `JWT_SECRET=` throws before use
- `npm run build` in server succeeds
- No literal `supersecret` in auth/admin routes
