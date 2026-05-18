# Phase 2: Security Hardening - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the book site stack for production: eliminate secret fallbacks, throttle login abuse, mitigate XSS from user-generated and admin-injected content, tighten CORS, configure Helmet/CSP, and **proxy marketing telemetry through the book API** so the browser bundle never ships the marketing master key. This phase establishes the secure pipe into `marketing-backend` lead scoring — it does **not** deliver full marketing product features (identity-merge QA, email-agent UX, CRM dashboard) which belong in Phase 3.

</domain>

<decisions>
## Implementation Decisions

### JWT & server boot (SEC-01)
- **D-01:** In **production** (`NODE_ENV=production`), server **refuses to start** if `JWT_SECRET` is unset, empty, or equals `supersecret`.
- **D-02:** In **development**, allow fallback `supersecret` but log a **one-time loud warning** at boot (no fail-fast).
- **D-03:** Remove duplicate JWT secret constants — single shared module imported by `authRoutes` and `adminRoutes`.

### Login brute-force protection (SEC-02)
- **D-04:** Apply **`express-rate-limit`** on `POST /api/v1/auth/login`: **5 requests / 15 minutes / IP**, JSON `429` with generic message (no user enumeration).
- **D-05:** **No account lockout table** in Phase 2 — IP rate limit only (community POST limits from Phase 1 remain separate).
- **D-06:** **No JWT refresh tokens** — keep 24h expiry + Phase 1 `/admin/me` gate; expired session → login with message (D-13 from Phase 1).

### XSS: markdown, community, admin CSS (SEC-03)
- **D-07:** **Blog article HTML** (rendered from markdown) sanitized on the **server before persistence or on public read** using **DOMPurify** (or `isomorphic-dompurify`) with allowlist: headings, paragraphs, links, images, lists, code, blockquote — **no** `script`, `on*` handlers, or `iframe` in article body.
- **D-08:** **Community post/comment `content`** stored as plain text; strip HTML tags / reject obvious script payloads on `POST` (lighter than full markdown pipeline).
- **D-09:** **Admin `settings.customCss`**: reject PATCH bodies containing `<script`, `javascript:`, and CSS `expression(`; return **400** with field error (do not silently strip in Phase 2).
- **D-10:** Sanitize applies to **admin-authored** blog markdown in CMS and **public** community text — not a new moderation product.

### Helmet & CSP (SEC-07)
- **D-11:** Enable **Helmet** with explicit **Content-Security-Policy** tuned for this site:
  - `default-src 'self'`
  - `script-src 'self'` (Vite bundle) — no inline scripts in app shell
  - `style-src 'self' 'unsafe-inline'` (Tailwind + admin `customCss` require inline styles)
  - `img-src 'self' data: https:` (Unsplash / CDN thumbnails)
  - `font-src 'self' https://fonts.gstatic.com`
  - `connect-src 'self'` + book API origin + (dev) marketing-backend if needed for health checks only via proxy
  - `frame-src https://www.youtube.com https://www.youtube-nocookie.com` (hero embed)
- **D-12:** Document CSP tradeoff in plan threat model: `'unsafe-inline'` for styles is accepted until admin CSS is server-sanitized or moved to static files in a later phase.

### CORS policy (SEC-05)
- **D-13:** **Split origin lists**: `ALLOWED_ORIGINS` (public: `GET /content/*`, `GET/POST /community/*`) and `ADMIN_ALLOWED_ORIGINS` (mutating `/admin/*`, `PATCH` content). If `ADMIN_ALLOWED_ORIGINS` unset in dev, default to same list as `ALLOWED_ORIGINS`.
- **D-14:** **Production**: requests **without `Origin`** are **denied** except `GET /health` and same-origin server routes (no blanket `!origin → allow`).
- **D-15:** `credentials: true` only when origin matches **admin** list (Bearer admin from browser).

### Marketing proxy & lead pipeline link (SEC-04)
- **D-16:** Add book API route **`POST /api/v1/marketing/webhook`** (name may vary; must be stable for client) that **server-forwards** to marketing-backend **`POST /webhook`** with header **`X-API-KEY`** from server env `MARKETING_API_KEY` (alias `VELLUX_API_KEY` documented in `.env.example`).
- **D-17:** **Remove from client bundle**: `VITE_MARKETING_MASTER_KEY`, hardcoded `vellux_studio_2026_pk`, and direct calls to marketing-backend URL. `MarketingService` posts to **book API only** (`${API_BASE}/marketing/webhook` or dedicated path).
- **D-18:** **Preserve webhook contract** expected by `marketing-backend/marketing_api/main.py` `WebhookPayload`: `{ id, type, actor: { email }, visitor_id, content }` — include `content.source = "book_website"` and existing event types (`cta_click`, `scroll_milestone`, `user_identified`, `form_submit`, etc.) so **`db.log_event` → `db.score_lead` → segment orchestration** runs unchanged.
- **D-19:** **`visitor_id` remains client-generated** (`MarketingService.getVisitorId()` / `vellux_visitor_id`) and is forwarded by the proxy — aligns with Phase 1 vote dedup (D-08) and Phase 3 identity merge.
- **D-20:** **Do not proxy** `POST /email-agent/process` in Phase 2 — Contact/email agent flows are Phase 3 (`MKT-*`). If UI still calls email agent directly today, plan should flag as out-of-scope fix or temporary 501 until Phase 3.
- **D-21:** Book server env: `MARKETING_BACKEND_URL` (e.g. `http://localhost:8000` dev, prod gateway path `/marketing`) — never exposed to browser.

### Secrets, gitignore, seed (SEC-06)
- **D-22:** Ensure **`server/prisma/dev.db`** and `*.db-journal` in **`.gitignore`**; remove from git index if tracked.
- **D-23:** **`seed.ts` in production**: create admin only if missing; **never overwrite** existing admin password on re-run.
- **D-24:** **`.env.example`** documents `JWT_SECRET`, `MARKETING_API_KEY`, `MARKETING_BACKEND_URL`, `ALLOWED_ORIGINS`, `ADMIN_ALLOWED_ORIGINS` — no marketing key in root `.env.example` for Vite.

### Claude's Discretion
User selected **"You decide"** for all standard gray areas. Locked recommendations above are binding unless CONTEXT.md is edited before `$gsd-plan-phase 2`.

Planner discretion within phase scope: exact rate-limit window numbers, DOMPurify allowlist tag list, CSP directive fine-tuning, marketing route file name (`marketingRoutes.ts` vs mount path), and whether sanitization runs on write vs read for articles.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, plans 02-01..02-03
- `.planning/REQUIREMENTS.md` — SEC-01 through SEC-07
- `.planning/PROJECT.md` — Marketing-backend coupling, server-side proxy decision
- `.planning/phases/01-backend-completeness/01-CONTEXT.md` — Prior auth/community decisions (D-06, D-08, D-11–D-14)

### Codebase maps
- `.planning/codebase/CONCERNS.md` — JWT fallback, marketing key in bundle, CORS no-origin allow, customCss XSS
- `.planning/codebase/INTEGRATIONS.md` — Book API + Marketing Hub contracts
- `.planning/codebase/STACK.md` — Helmet, cors, env vars

### Book website implementation
- `server/src/index.ts` — Helmet, CORS, route mounting
- `server/src/routes/authRoutes.ts` — Login + JWT sign
- `server/src/routes/adminRoutes.ts` — JWT verify, content PATCH (customCss)
- `server/src/routes/communityRoutes.ts` — Existing public POST rate limit
- `server/src/seed.ts` — Admin bootstrap behavior
- `src/lib/marketing.ts` — Telemetry client to refactor (proxy target)
- `src/lib/api.ts` — `VITE_API_URL` base for proxy path
- `.env.example` — Secret documentation

### Marketing-backend (sibling repo — lead & engagement pipeline)
- `/Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py` — `WebhookPayload`, `/webhook`, `/events`, `verify_api_key`, lead scoring flow
- `/Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py` — `log_event`, `merge_visitor_data`, `score_lead`
- `/Users/anuragverma/Downloads/marketing-backend/.planning/codebase/ARCHITECTURE.md` — Ingestion → scoring → orchestration overview

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `express-rate-limit` already on community router — reuse pattern for login limiter
- `authenticateAdmin` + `GET /admin/me` — no change to auth model in Phase 2
- `MarketingService` call sites: `App.tsx`, `HeroSection`, `BookShowcase`, `LeadCaptureModal`, `WaitlistForm` — all should route through proxy after refactor

### Established Patterns
- Env-based config in `server/src/index.ts` (`ALLOWED_ORIGINS` comma list)
- JWT `Bearer` on admin routes; public read mostly unauthenticated
- Marketing events: anonymous-first with `anonymous@tracking.node` until `identify(email)`

### Integration Points
- New `server/src/routes/marketingRoutes.ts` (or similar) mounted at `/api/v1/marketing`
- `src/lib/marketing.ts` → `fetch(\`${API_BASE}/marketing/webhook\`)` without API key header
- Production deploy must set book server `MARKETING_API_KEY` == marketing-backend `VELLUX_API_KEY`

</code_context>

<specifics>
## Specific Ideas

- User asked for **"You decide"** on all discussion areas but added: **lead tracking / user engagement tracking in `marketing-backend` must be linked to `book-website-frontend`.**
- Interpretation: Phase 2 proxy is the **integration seam** — every `MarketingService.logEvent` / `identify` must reach marketing-backend's webhook so leads accumulate and scores update. Phase 3 validates merge behavior and email agent end-to-end.
- User expectation: book site behavior visible in marketing-backend lead/event data (same `visitor_id` mesh as community votes).

</specifics>

<deferred>
## Deferred Ideas

- **Full marketing integration** (identity-merge test suite, email agent via proxy, CRM `/dashboard` live data) — Phase 3 (`MKT-01`–`MKT-06`).
- **JWT refresh / silent re-auth** — still out of scope; revisit only if ops require.
- **Account-level login lockout** after N failures — defer unless rate limit insufficient.
- **Strict CSP without `'unsafe-inline'` styles** — requires redesign of admin customCss delivery.
- **Postgres / infra secrets management** — Phase 4.
- **RBAC / multi-admin** — Phase 6.

</deferred>

---

*Phase: 02-Security Hardening*
*Context gathered: 2026-05-18*
