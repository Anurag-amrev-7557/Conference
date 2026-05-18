---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
---

# Codebase Concerns

**Analysis Date:** 2026-05-18

## Tech Debt

**Dual source of truth for site content:**
- Issue: `src/lib/websiteData.ts` (`initialData`, ~500 lines) duplicates seed defaults in `server/src/seed.ts`; admin edits live in SQLite while fallbacks stay in the frontend bundle.
- Why: SPA was built with static defaults before the Express API was embedded.
- Impact: New schema fields can appear in the UI but not persist, or seed/remote merges can diverge silently (`WebsiteDataProvider` deep-merge only covers known nested keys).
- Fix approach: Generate shared types + default JSON from one module, or move defaults server-only and treat `initialData` as a thin loading skeleton.

**Legacy client-side admin config:**
- Issue: `src/lib/config.ts` still exposes `VITE_ADMIN_PASSWORD` with fallback `admin123`, but `src/pages/AdminPage.tsx` authenticates via `api.login()` only.
- Files: `src/lib/config.ts`, `src/pages/AdminPage.tsx`
- Why: Migration to JWT backend left dead configuration paths.
- Impact: Confusing ops setup; risk of documenting wrong credentials; unused env vars in deployment.
- Fix approach: Remove password fields from `config.ts`; document only `JWT_SECRET` + seeded admin in server README.

**Package / brand naming mismatch:**
- Issue: Root package is `book-website` (`package.json`) while server is `superhumanly-api` (`server/package.json`, lockfile name).
- Files: `server/package.json`, `server/package-lock.json`, `src/lib/api.ts`, `server/src/index.ts`
- Why: Repo forked from Superhumanly marketing stack without renaming embedded server.
- Impact: Wrong Docker image names, log filters, and deploy manifests; production API host hardcoded to `api.superhumanly-thoughts.com/book/...`.
- Fix approach: Rename server package, align `VITE_API_URL` / CORS `ALLOWED_ORIGINS` with actual book-site domains.

**JSON blobs in Prisma instead of typed columns:**
- Issue: `SiteContent` stores `hero`, `settings`, `appearance`, etc. as `String` JSON (`server/prisma/schema.prisma`).
- Files: `server/src/routes/contentRoutes.ts`, `server/src/routes/adminRoutes.ts`
- Why: Fast CMS-style flexibility.
- Impact: No DB-level validation; corrupt JSON returns empty objects via `safeParse` without surfacing errors to admins.
- Fix approach: Add Zod schemas on PATCH/GET boundaries; optionally normalize to JSON columns with Prisma `Json` type.

**Unused heavy frontend dependencies:**
- Issue: `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, and `three` are in `package.json` but not imported anywhere under `src/`.
- Impact: Larger install surface and risk of stale security advisories on unused packages.
- Fix approach: Remove unused deps or wire 3D features; run `npm ls` after cleanup.

## Known Bugs

**Community write APIs are client-only stubs:**
- Symptoms: Creating posts or comments on `/community` shows alerts or no-ops; network calls 404.
- Trigger: Submit post/comment on `src/pages/CommunityPage.tsx` → `createPost` / `addComment` in `src/components/WebsiteDataProvider.tsx` → `src/lib/api.ts` `POST /admin/posts` and `POST /admin/posts/:id/comments`.
- Files: `src/lib/api.ts`, `src/components/WebsiteDataProvider.tsx`, `src/pages/CommunityPage.tsx`
- Root cause: `server/src/routes/adminRoutes.ts` implements blogs/events only; no community routes despite Prisma `CommunityPost` / `Comment` models and public read in `server/src/routes/contentRoutes.ts`.
- Fix approach: Add authenticated `POST/PUT/DELETE` handlers for posts/comments mirroring blog CRUD, or gate UI until backend exists.

**Admin session not validated on load:**
- Symptoms: `/admin/*` renders dashboard if `localStorage.adminToken` exists, even when token is expired or JWT secret rotated.
- Trigger: Open `/admin/dashboard` with stale token after 24h expiry (`server/src/routes/authRoutes.ts`).
- Files: `src/pages/AdminPage.tsx`, `server/src/routes/adminRoutes.ts`
- Workaround: Manual logout clears token.
- Fix approach: On mount, call a lightweight `GET /api/v1/admin/me` that runs `authenticateAdmin`; redirect to login on 401.

**Votes on community posts are non-functional:**
- Symptoms: Vote UI in community components does not persist.
- Trigger: `handleVote` in `src/pages/CommunityPage.tsx` is empty (“can stay local for now”).
- Fix approach: Add `PATCH` vote endpoint or remove UI to avoid misleading users.

## Security Considerations

**JWT secret fallback in production:**
- Risk: If `JWT_SECRET` is unset, both `server/src/routes/authRoutes.ts` and `server/src/routes/adminRoutes.ts` use hardcoded `'supersecret'`, allowing trivial token forgery.
- Current mitigation: `.env.example` documents `JWT_SECRET`; Helmet enabled in `server/src/index.ts`.
- Recommendations: Fail fast at server boot when `JWT_SECRET` is missing or weak; never ship default.

**Marketing API key embedded in client bundle:**
- Risk: `src/lib/marketing.ts` falls back to a public `VITE_MARKETING_MASTER_KEY` value (also mirrored in `.env.example`); anyone can POST telemetry or spam the marketing webhook.
- Files: `src/lib/marketing.ts`, `.env.example`
- Current mitigation: Optional override via env at build time.
- Recommendations: Proxy marketing events through `server/` with server-side key; rate-limit and authenticate webhook calls.

**Admin token in `localStorage`:**
- Risk: XSS on any page (including admin-injected `customCss`) can exfiltrate bearer tokens used for all mutating APIs.
- Files: `src/pages/AdminPage.tsx`, `src/components/WebsiteDataProvider.tsx`
- Current mitigation: Helmet on API; React default escaping for most UI.
- Recommendations: HttpOnly cookie session, short-lived tokens + refresh, CSP restricting inline styles/scripts.

**Stored XSS via admin-controlled content:**
- Risk: `settings.customCss` is written with `styleTag.innerHTML` in `src/App.tsx`; blog HTML from `ReactMarkdown` without sanitization in `src/pages/BlogPostPage.tsx`; mass-assignment on admin routes accepts arbitrary `req.body` fields.
- Files: `src/App.tsx`, `src/pages/BlogPostPage.tsx`, `server/src/routes/adminRoutes.ts`, `src/components/admin/SettingsManager.tsx`
- Current mitigation: Admin-only write paths (JWT).
- Recommendations: Sanitize markdown (rehype-sanitize), allowlist CSS properties, validate DTOs before Prisma writes.

**CORS allows missing `Origin`:**
- Risk: `server/src/index.ts` callback permits requests when `!origin`, which can weaken browser CSRF assumptions for non-browser clients and some tools.
- Current mitigation: Explicit allowlist for browser origins including `https://superhumanly-thoughts.com`.
- Recommendations: Require origin for credentialed routes; separate public vs admin CORS policies.

**Default seed password committed to repo:**
- Risk: `server/src/seed.ts` hashes documented default password `Welcome@1234` on every seed run; predictable if seed is run in production without rotation.
- Current mitigation: bcrypt hashing.
- Recommendations: Read initial password from env; force change on first login; never re-upsert password on `update` in production seeds.

**SQLite database file in version control:**
- Risk: `server/prisma/dev.db` is tracked in git (may contain local admin hashes and content).
- Files: `server/prisma/dev.db`, `server/prisma/schema.prisma`
- Current mitigation: None in `.gitignore`.
- Recommendations: Add `server/prisma/*.db` to `.gitignore`; use migrations + seed in CI only.

**No login rate limiting or lockout:**
- Risk: `POST /api/v1/auth/login` (`server/src/routes/authRoutes.ts`) is brute-forceable.
- Recommendations: `express-rate-limit`, exponential backoff, audit logging.

## Performance Bottlenecks

**Monolithic content fetch:**
- Problem: `GET /api/v1/content` loads site JSON, all articles, events, and community posts with comments in one query (`server/src/routes/contentRoutes.ts`).
- Cause: Single endpoint for entire SPA state.
- Improvement path: Split public endpoints (hero/settings vs blog list vs community page); add pagination and `If-None-Match` caching.

**Marketing scroll listener without teardown:**
- Problem: `MarketingService.trackScroll()` registers a window `scroll` listener on every `init()` with no removal (`src/lib/marketing.ts`).
- Cause: `MarketingService.init()` called once from `src/App.tsx` but pattern is fragile if re-init.
- Improvement path: Singleton guard, `AbortController`, or passive listener registered once in module scope.

**Large static fallback bundle:**
- Problem: `src/lib/websiteData.ts` ships full demo content even when API is healthy.
- Impact: Increases JS payload and merge work on every fetch.
- Improvement path: Trim `initialData` to structural defaults; lazy-load demo assets.

## Fragile Areas

**WebsiteDataProvider merge and preview:**
- File: `src/components/WebsiteDataProvider.tsx`
- Why fragile: Combines `initialData`, remote API, preview overlay, and `localStorage` admin token; `updateArticles` / `updateEvents` update local state only (legacy) while CRUD paths hit API.
- Common failures: Preview shows unsaved data; missing token silently no-ops mutations (`if (!token) return`).
- Safe modification: Add explicit error toasts when token missing; unify all mutations through `updateGlobal` or dedicated API helpers.
- Test coverage: None.

**ThemeSynchronizer color math:**
- File: `src/App.tsx` (`darkenColor` swaps R/B channels when computing `--color-accent2`).
- Common failures: Broken secondary accent colors for some hex inputs.
- Safe modification: Use a tested color library or CSS `color-mix`.
- Test coverage: None.

**Prisma JSON parse fallbacks:**
- File: `server/src/routes/contentRoutes.ts` (`safeParse`)
- Why fragile: Invalid JSON in DB returns `{}` or `[]` without admin-visible errors.
- Safe modification: Log parse failures with field name; return 500 or partial error payload in staging.

## Scaling Limits

**SQLite file database:**
- Current capacity: Single-node, file lock under concurrent writes (`server/prisma/schema.prisma` → `file:./dev.db`).
- Limit: Write contention and no horizontal API replicas sharing one file.
- Symptoms at limit: `SQLITE_BUSY`, failed admin saves under traffic.
- Scaling path: PostgreSQL datasource, connection pooling, managed backups.

**Single shared admin account:**
- Current capacity: One `Admin` row keyed by username `admin` (`server/src/routes/authRoutes.ts`).
- Limit: No per-editor audit trail or role separation.
- Scaling path: Multi-user admin table, roles, and activity log.

## Dependencies at Risk

**Pinned marketing hub URL to Superhumanly domain:**
- Risk: `src/lib/api.ts` and `src/lib/marketing.ts` default production hosts to `api.superhumanly-thoughts.com`.
- Impact: Book-site deploy breaks if DNS or path prefix (`/book/api/v1`) changes.
- Migration plan: Require `VITE_API_URL` in production builds; document reverse-proxy path.

**Vellux / Superhumanly naming drift:**
- Risk: Mixed identifiers (`vellux_*` localStorage keys, “Vellux Security Policy” in CORS errors, Superhumanly branding in `index.html`).
- Impact: Analytics and support confusion across products.
- Migration plan: Namespace keys under `book_website_*` in a single rename pass.

## Missing Critical Features

**Server `.env` not gitignored at server root:**
- Problem: Only root `.env.example` exists; no `server/.env.example` for `DATABASE_URL` overrides.
- Blocks: Clear separation of frontend vs backend secrets in deploy.
- Implementation complexity: Low (copy example + document `cd server && npm run dev`).

**Community moderation and auth:**
- Problem: Public community writes imply open posting once APIs exist; no user accounts.
- Blocks: Spam control, accountable posts.
- Implementation complexity: Medium (auth provider or captcha + admin moderation queue).

## Test Coverage Gaps

**Entire stack untested:**
- What's not tested: No `*.test.ts` / `*.spec.ts` files; root `package.json` has no `test` script; server has no test runner.
- Risk: Regressions in auth, content merge, and community API gaps ship unnoticed.
- Priority: High for `server/src/routes/authRoutes.ts`, `adminRoutes.ts`, and `WebsiteDataProvider.tsx`.
- Difficulty to test: Add Vitest for frontend, supertest for Express routes, in-memory SQLite for Prisma.

**Admin CRUD contracts:**
- What's not tested: Mass-assignment on blog/event create (`req.body` spread into Prisma).
- Risk: Unexpected fields corrupt records or bypass `isPublished` flags.
- Priority: Medium
- Difficulty to test: Schema validation layer (Zod) plus contract tests.

**Marketing retry logic:**
- What's not tested: Exponential backoff in `src/lib/marketing.ts` `logEvent`.
- Risk: Silent telemetry loss or duplicate events on edge cases.
- Priority: Low
- Difficulty to test: Mock `fetch` in Vitest.

---

*Concerns audit: 2026-05-18*
*Update as issues are fixed or new ones discovered*
