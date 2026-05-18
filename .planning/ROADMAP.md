# Roadmap: Book Website

## Overview

Milestone v1.0 delivers a production-ready book marketing platform in nine dependency-ordered phases. Foundation work (backend completeness, security, marketing integration, infrastructure, quality) hardens the existing monorepo and marketing-backend linkage before expansion features (multi-admin RBAC, real-time chat, payments, mobile).

## Phases

- [ ] **Phase 1: Backend Completeness** — Close API gaps so every client mutation has a working server route and validated contracts.
- [ ] **Phase 2: Security Hardening** — Production-safe auth, sanitization, CORS, and server-side marketing proxy (no secrets in browser).
- [ ] **Phase 3: Marketing Integration** — End-to-end linkage with `marketing-backend` for telemetry, identity, and email agent flows.
- [ ] **Phase 4: Production Infrastructure** — CI/CD, env separation, database strategy, deployment runbook, domain alignment.
- [ ] **Phase 5: Quality & Testing** — Automated regression coverage and dependency hygiene for release confidence.
- [ ] **Phase 6: Multi-Admin RBAC** — Multiple editors with roles, permissions, and audit logging.
- [ ] **Phase 7: Real-Time Chat** — Live community or support chat with moderation hooks.
- [ ] **Phase 8: Payment Processing** — Book and event checkout with webhooks and marketing events.
- [ ] **Phase 9: Mobile Experience** — Responsive polish, PWA installability, and API stability for native clients.

## Phase Details

### Phase 1: Backend Completeness
**Goal**: Every CMS and community action the UI exposes persists through validated Express/Prisma APIs.
**Depends on**: Nothing (first phase)
**Requirements**: BACK-01, BACK-02, BACK-03, BACK-04, BACK-05, BACK-06, BACK-07
**Success Criteria** (what must be TRUE):
  1. User can create community posts and comments without 404; votes persist.
  2. Admin opening `/admin/*` with an expired token is redirected to login after server validation.
  3. Invalid admin payloads return 400 with field-level errors, not silent Prisma failures.
  4. Default content drift between `websiteData.ts` and seed is eliminated or documented as skeleton-only.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 1`)

Plans:
- [ ] 01-01: Implement community post/comment/vote routes and wire `WebsiteDataProvider` + `api.ts`.
- [ ] 01-02: Add admin session validation endpoint and Zod DTOs on admin mutating routes.
- [ ] 01-03: Refine content API shape (pagination or split endpoints) and shared defaults strategy.

### Phase 2: Security Hardening
**Goal**: The stack meets production security baselines before handling payments and multi-user admin.
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07
**Success Criteria** (what must be TRUE):
  1. Production boot fails fast without strong `JWT_SECRET`.
  2. Login brute-force attempts are throttled.
  3. XSS vectors from markdown and custom CSS are mitigated.
  4. No marketing master key appears in built frontend assets.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 2`)

Plans:
- [ ] 02-01: JWT boot checks, rate limiting, gitignore for `dev.db`, safe seed behavior.
- [ ] 02-02: Markdown/CSS sanitization and tightened Helmet/CSP.
- [ ] 02-03: Marketing proxy routes on book API; remove client-side API key usage.

### Phase 3: Marketing Integration
**Goal**: Book site and `marketing-backend` work as one lead-intelligence pipeline in dev and prod.
**Depends on**: Phase 2
**Requirements**: MKT-01, MKT-02, MKT-03, MKT-04, MKT-05, MKT-06
**Success Criteria** (what must be TRUE):
  1. All telemetry and form events reach marketing-backend with correct payload shape and API key server-side.
  2. Anonymous and identified users merge correctly in marketing identity mesh.
  3. Contact/email agent flow works through proxy without CORS or auth failures locally and in staging.
**Plans**: 2 plans (TBD in `$gsd-plan-phase 3`)

Plans:
- [ ] 03-01: Proxy implementation, event mapping, CORS alignment across three services.
- [ ] 03-02: Lead capture, contact form, and session-resume flows verified against marketing-backend scoring.

### Phase 4: Production Infrastructure
**Goal**: The project is deployable repeatably with documented env, database, and health verification.
**Depends on**: Phase 3
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. CI passes lint, build, and tests on every PR.
  2. Database strategy is chosen and implemented (Postgres or persistent SQLite) with backup path documented.
  3. Deploy runbook brings up frontend + book API + marketing-backend behind reverse proxy.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 4`)

Plans:
- [ ] 04-01: Env examples, naming alignment, health-check integration.
- [ ] 04-02: CI workflow (GitHub Actions or equivalent).
- [ ] 04-03: Database migration/volume + deployment runbook.

### Phase 5: Quality & Testing
**Goal**: Critical journeys have automated coverage so foundation phases stay stable during expansion.
**Depends on**: Phase 4
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05
**Success Criteria** (what must be TRUE):
  1. Auth and admin CRUD routes have API tests; provider merge logic has unit tests.
  2. Full local smoke path documented and runnable in one command sequence.
  3. Dead dependencies and legacy config removed.
**Plans**: 2 plans (TBD in `$gsd-plan-phase 5`)

Plans:
- [ ] 05-01: Vitest + supertest suite for highest-risk paths.
- [ ] 05-02: Cleanup, smoke script, and release checklist.

### Phase 6: Multi-Admin RBAC
**Goal**: Multiple staff can manage the site with role-appropriate permissions and accountability.
**Depends on**: Phase 5
**Requirements**: RBAC-01, RBAC-02, RBAC-03, RBAC-04, RBAC-05
**Success Criteria** (what must be TRUE):
  1. Owner can create editor/moderator accounts without sharing one password.
  2. Editors cannot access sections outside their role (e.g., settings vs blogs only).
  3. Audit log shows who changed what and when.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 6`)

Plans:
- [ ] 06-01: Admin user model, roles, JWT claims, permission middleware.
- [ ] 06-02: Admin UI for user management and role assignment.
- [ ] 06-03: Audit log storage and viewer in admin.

### Phase 7: Real-Time Chat
**Goal**: Users can converse in real time with persisted history and moderator controls.
**Depends on**: Phase 6
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05
**Success Criteria** (what must be TRUE):
  1. Messages appear in channel within 1s under normal load.
  2. History loads on join; moderators can delete/mute per RBAC.
  3. Optional marketing events fire for high-value chat engagement.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 7`)

Plans:
- [ ] 07-01: Transport layer (WebSocket/SSE) and message persistence schema.
- [ ] 07-02: Chat UI integrated with community or support entry point.
- [ ] 07-03: Moderation tools and marketing event hooks.

### Phase 8: Payment Processing
**Goal**: Users can buy the book and pay for events with verified webhooks and admin visibility.
**Depends on**: Phase 7
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**Success Criteria** (what must be TRUE):
  1. Successful Stripe (or chosen provider) checkout completes and records order state.
  2. Paid event registration reflects in admin and triggers marketing lead event.
  3. Webhook signatures are verified; invalid payloads rejected.
**Plans**: 3 plans (TBD in `$gsd-plan-phase 8`)

Plans:
- [ ] 08-01: Payment provider integration, product/catalog model, checkout UI.
- [ ] 08-02: Webhook handlers and admin registration views.
- [ ] 08-03: Marketing-backend purchase events and receipt flow.

### Phase 9: Mobile Experience
**Goal**: Core journeys work excellently on mobile with installable PWA and stable APIs for future native apps.
**Depends on**: Phase 8
**Requirements**: MOB-01, MOB-02, MOB-03, MOB-04, MOB-05
**Success Criteria** (what must be TRUE):
  1. Landing, blog, events, and lead capture pass mobile UX review on iOS and Android browsers.
  2. PWA is installable with manifest and icons; offline shell behavior documented.
  3. Admin CMS usable on tablet for common edit tasks.
**Plans**: 2 plans (TBD in `$gsd-plan-phase 9`)

Plans:
- [ ] 09-01: Responsive polish, PWA manifest, service worker shell.
- [ ] 09-02: API versioning policy doc and admin tablet layout pass.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → … → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Backend Completeness | 0/3 | Not started | - |
| 2. Security Hardening | 0/3 | Not started | - |
| 3. Marketing Integration | 0/2 | Not started | - |
| 4. Production Infrastructure | 0/3 | Not started | - |
| 5. Quality & Testing | 0/2 | Not started | - |
| 6. Multi-Admin RBAC | 0/3 | Not started | - |
| 7. Real-Time Chat | 0/3 | Not started | - |
| 8. Payment Processing | 0/3 | Not started | - |
| 9. Mobile Experience | 0/2 | Not started | - |
