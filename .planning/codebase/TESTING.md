---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
last_mapped_at: 2026-05-18
---

# Testing Patterns

**Analysis Date:** 2026-05-18

## Test Framework

**Runner:**
- **No automated test runner is configured.** Root `package.json` has no `test` script; `server/package.json` has no test or coverage scripts.
- No `vitest.config.ts`, `jest.config.js`, or `playwright.config.ts` in the repo.
- Grep across `*.ts` / `*.tsx` / `*.json` finds no `*.test.ts`, `*.spec.ts`, or `describe(` blocks.

**Assertion library:**
- N/A until a framework is added.

**Run commands (current verification only):**
```bash
# Frontend — typecheck + production build
npm run build          # tsc -b && vite build (root)

# Frontend — lint
npm run lint           # eslint . (root)

# Server — compile
cd server && npm run build   # tsc → server/dist/

# Server — manual API smoke
cd server && npm run dev     # ts-node-dev on server/src/index.ts
curl http://localhost:3001/health
```

## Test File Organization

**Location:**
- No collocated `*.test.tsx` beside `src/components/`.
- No `server/src/**/*.test.ts` beside routes.
- No top-level `tests/`, `__tests__/`, or `e2e/` directories.

**Naming (if adding tests):**
- Prefer `module-name.test.ts` / `ComponentName.test.tsx` alongside source, matching common Vite + Vitest conventions.
- Integration tests for API: `server/src/routes/contentRoutes.integration.test.ts` or `server/tests/content.integration.test.ts`.

**Suggested structure:**
```
src/
  lib/
    api.ts
    api.test.ts
  components/
    WebsiteDataProvider.tsx
    WebsiteDataProvider.test.tsx
server/
  src/
    routes/
      authRoutes.ts
      authRoutes.test.ts
```

## Test Structure

**Suite organization (recommended — not yet present):**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('api.login', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('throws when response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Incorrect administrative password.' }),
    } as Response);
    await expect(api.login('wrong')).rejects.toThrow('Incorrect administrative password.');
  });
});
```

**Patterns to adopt:**
- Arrange / act / assert in unit tests.
- Mock `fetch` for `src/lib/api.ts`; mock `prisma` for server route tests.
- Use `beforeEach` to reset mocks; avoid shared mutable state across tests.

## Mocking

**Framework:**
- Not in use. **Vitest** is the natural fit (Vite frontend already on Vitest’s typical stack).

**Frontend mocking targets:**
- `global.fetch` for all `src/lib/api.ts` methods.
- `localStorage` for admin auth flows (`src/pages/AdminPage.tsx`).
- Context: wrap components with `WebsiteDataProvider` and stub `api.getContent`.

**Server mocking targets:**
- `@prisma/client` via test doubles or a test database.
- `jsonwebtoken` / `bcrypt` in `server/src/routes/authRoutes.ts` for isolated auth tests.
- Do not hit production DB from unit tests; use Prisma migrate to a test DB or `vi.mock('../lib/prisma')`.

**What not to mock:**
- Pure helpers like `cn()` in `src/lib/utils.ts`.
- `safeParse` logic inside `contentRoutes` (test directly with fixture strings).

## Fixtures and Factories

**Test data:**
- Reuse shapes from `src/lib/websiteData.ts` (`initialData`, `Article`, `WebsiteData`) as factory bases.
- Seed script `server/src/seed.ts` documents realistic Prisma records for manual/integration setup.

**Location (recommended):**
- `src/test/factories/websiteData.ts` for frontend factories.
- `server/src/test/fixtures/` for JSON payloads matching API contracts.

## Coverage

**Requirements:**
- No coverage threshold or reporting configured.
- No `c8` / `istanbul` / `vitest --coverage` script.

**If enabling later:**
- Add `vitest` + `@vitest/coverage-v8` to root devDependencies.
- Exclude `server/dist/`, `*.config.*`, and seed scripts from coverage.

## Test Types

**Unit tests (priority — missing):**
- `src/lib/api.ts` — status handling, error messages, Authorization headers on admin methods.
- `server/src/routes/contentRoutes.ts` — `safeParse` behavior, response shape mapping.
- `src/lib/utils.ts` — `cn()` class merging.

**Integration tests (missing):**
- Express routes with supertest: `GET /api/v1/content`, `POST /api/v1/auth/login`, protected `PATCH /api/v1/admin/content` with/without Bearer token.
- Requires test DB or Prisma mock; run against `server/src/index.ts` app export (may need small refactor to export `app` for supertest).

**E2E tests (missing):**
- No Playwright/Cypress. Valuable flows: public landing load, admin login, blog CRUD, events map.
- Would run against `npm run dev` (frontend `:5173`) + `server` `:3001`.

## CI / Automation

**Continuous integration:**
- No `.github/workflows/` (or other CI config) in the repository.
- No pre-commit hooks for tests detected.

**Current quality gates:**
- Manual: `npm run lint`, `npm run build`, `cd server && npm run build`.
- Runtime smoke: `GET /health` on the Express server.

## Common Patterns (for future tests)

**Async API errors (frontend):**
```typescript
await expect(api.getContent()).rejects.toThrow('Failed to fetch content');
```

**HTTP error responses (server):**
```typescript
// Expect 401 without token on admin routes
const res = await request(app).patch('/api/v1/admin/content').send({});
expect(res.status).toBe(401);
expect(res.body.error).toMatch(/Unauthorized/);
```

**React component smoke:**
```typescript
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../pages/NotFoundPage';

it('renders not found messaging', () => {
  render(<NotFoundPage />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
```

**Snapshot testing:**
- Not used; prefer explicit assertions on API JSON and rendered text.

## Recommended adoption order

1. Add **Vitest** + **React Testing Library** at repo root; test `src/lib/api.ts` and one UI primitive (`Button`).
2. Add **supertest** in `server/`; test auth middleware and public `GET /` content route.
3. Optional **Playwright** for admin login + content publish happy path.
4. Add GitHub Actions workflow: `lint` → `build` (frontend) → `build` (server) → `test`.

---

*Testing analysis: 2026-05-18*
*Update when test patterns change*
