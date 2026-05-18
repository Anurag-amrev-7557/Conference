# Requirements: Book Website

**Defined:** 2026-05-18  
**Core Value:** Visitors can discover the book, engage with content and community, and convert to leads — while editors operate a secure, reliable CMS backed by production infrastructure and marketing intelligence.

## v1 Requirements

### Backend Completeness

- [ ] **BACK-01**: User can create, edit, and delete community posts via authenticated admin or moderated public flow (server routes match `src/lib/api.ts`)
- [ ] **BACK-02**: User can add comments to community posts with persistence and cascade delete
- [ ] **BACK-03**: User can vote on community posts with persisted vote counts
- [ ] **BACK-04**: Admin session is validated on load (`GET /api/v1/admin/me` or equivalent); expired JWT redirects to login
- [ ] **BACK-05**: Admin API requests are validated with Zod (or equivalent) before Prisma writes; invalid payloads return 400 with field errors
- [ ] **BACK-06**: Single source of truth for default content — server seed or shared package; frontend `initialData` is skeleton-only
- [ ] **BACK-07**: Content API supports pagination or split endpoints for blog/events/community to avoid monolithic payload at scale

### Security Hardening

- [ ] **SEC-01**: Server refuses to start in production without `JWT_SECRET` set (no `supersecret` fallback)
- [ ] **SEC-02**: Login endpoint has rate limiting and lockout protection against brute force
- [ ] **SEC-03**: Blog markdown and admin-injected custom CSS are sanitized before render
- [ ] **SEC-04**: Marketing events are proxied through book API; browser bundle contains no marketing master API key
- [ ] **SEC-05**: CORS policy separates public read vs admin mutate origins; requests without origin are not blanket-allowed in production
- [ ] **SEC-06**: `dev.db` and secrets are excluded from version control; production seed does not reset admin password on re-run
- [ ] **SEC-07**: Security headers (Helmet/CSP) configured for production admin and public surfaces

### Marketing Integration

- [ ] **MKT-01**: Book API proxy forwards webhook payloads to `marketing-backend` `/webhook` with server-held `VELLUX_API_KEY`
- [ ] **MKT-02**: Page views, CTA clicks, scroll milestones, and outbound link events reach marketing-backend with `source: book_website` and `visitor_id`
- [ ] **MKT-03**: Lead capture and contact forms identify users (`user_identified`, `form_submit`) and trigger identity merge in marketing-backend
- [ ] **MKT-04**: Contact/support flow invokes marketing-backend `/email-agent/process` via server proxy (not direct browser call with secrets)
- [ ] **MKT-05**: CORS and `ALLOWED_ORIGINS` aligned across book frontend, book API, and marketing-backend for dev and prod
- [ ] **MKT-06**: Anonymous telemetry works without email; identified events merge visitor history when email is provided

### Production Infrastructure

- [ ] **INFRA-01**: Root and server `.env.example` document all required variables; no committed production secrets
- [ ] **INFRA-02**: CI pipeline runs lint, typecheck, frontend build, server build, and test suite on PR/push
- [ ] **INFRA-03**: Production database strategy implemented (Postgres migration or documented SQLite volume + backup)
- [ ] **INFRA-04**: Deployment runbook covers frontend static host, book API, and marketing-backend reverse-proxy paths
- [ ] **INFRA-05**: Health checks (`/health` book API, marketing-backend `/`) integrated into deploy verification
- [ ] **INFRA-06**: Package naming and API base URLs aligned to book product domains (resolve Superhumanly/Vellux drift)

### Quality

- [ ] **QUAL-01**: Vitest tests cover `WebsiteDataProvider` merge/preview and critical admin flows
- [ ] **QUAL-02**: Supertest (or equivalent) covers auth, content read, and admin CRUD routes
- [ ] **QUAL-03**: Unused frontend dependencies removed (`three`, `@react-three/*` if still unused)
- [ ] **QUAL-04**: Legacy `VITE_ADMIN_PASSWORD` client config removed; docs reference JWT-only admin auth
- [ ] **QUAL-05**: Smoke script or documented manual checklist validates full local stack (Vite + book API + marketing-backend)

### Multi-Admin RBAC

- [ ] **RBAC-01**: Multiple admin users can be created with unique usernames and bcrypt passwords
- [ ] **RBAC-02**: Roles defined (e.g., owner, editor, moderator) with permission matrix for CMS sections
- [ ] **RBAC-03**: Admin actions (create/update/delete content, settings, users) are logged with actor and timestamp
- [ ] **RBAC-04**: JWT claims include role; middleware enforces permissions per route
- [ ] **RBAC-05**: Owner can invite/deactivate admins without sharing a single password

### Real-Time Chat

- [ ] **CHAT-01**: Authenticated or guest users can join a real-time channel (community or support)
- [ ] **CHAT-02**: Messages deliver with sub-second latency (WebSocket or SSE; technology chosen in phase plan)
- [ ] **CHAT-03**: Chat history persists and loads on channel open
- [ ] **CHAT-04**: Moderators can delete messages and mute users (ties to RBAC)
- [ ] **CHAT-05**: Chat events optionally feed marketing-backend for engagement scoring

### Payment Processing

- [ ] **PAY-01**: User can purchase the book (or designated product) via integrated checkout (Stripe or equivalent)
- [ ] **PAY-02**: User can pay for paid events with confirmation and receipt
- [ ] **PAY-03**: Webhook handler on book API verifies payment provider signatures and updates order/registration state
- [ ] **PAY-04**: Admin can view payment/registration status for events
- [ ] **PAY-05**: Successful purchase triggers marketing-backend event (`purchase`, `form_submit`) for lead scoring

### Mobile App

- [ ] **MOB-01**: Core reader journeys (landing, blog read, events list, lead capture) work on mobile viewports with responsive polish
- [ ] **MOB-02**: Installable PWA with manifest, icons, and offline shell (or native wrapper decision documented)
- [ ] **MOB-03**: Mobile push notification strategy documented (defer implementation if PWA-only v1)
- [ ] **MOB-04**: Admin CMS usable on tablet breakpoints for content edits (responsive admin layout)
- [ ] **MOB-05**: API contracts stable for future native app consumers (versioned or documented breaking-change policy)

## v2 Requirements

Deferred enhancements beyond v1 roadmap scope.

### Analytics & Observability

- **OBS-01**: Sentry or equivalent error tracking on frontend and API
- **OBS-02**: Structured logging with request IDs shipped to log aggregator

### Advanced Community

- **COMM-01**: User accounts for community (OAuth) with reputation
- **COMM-02**: AI moderation queue for posts and comments

## Out of Scope

| Feature | Reason |
|---------|--------|
| Replacing marketing-backend | User requires integration with existing workspace service |
| Multi-vendor marketplace | Payments limited to book and events |
| Custom ML training pipeline | Not part of book website domain |
| Streamlit marketing dashboard in book repo | Lives in marketing-backend `streamlit_app.py` |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACK-01 | Phase 1 | Pending |
| BACK-02 | Phase 1 | Pending |
| BACK-03 | Phase 1 | Pending |
| BACK-04 | Phase 1 | Pending |
| BACK-05 | Phase 1 | Pending |
| BACK-06 | Phase 1 | Pending |
| BACK-07 | Phase 1 | Pending |
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 2 | Pending |
| SEC-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| SEC-06 | Phase 2 | Pending |
| SEC-07 | Phase 2 | Pending |
| MKT-01 | Phase 3 | Pending |
| MKT-02 | Phase 3 | Pending |
| MKT-03 | Phase 3 | Pending |
| MKT-04 | Phase 3 | Pending |
| MKT-05 | Phase 3 | Pending |
| MKT-06 | Phase 3 | Pending |
| INFRA-01 | Phase 4 | Pending |
| INFRA-02 | Phase 4 | Pending |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 4 | Pending |
| INFRA-05 | Phase 4 | Pending |
| INFRA-06 | Phase 4 | Pending |
| QUAL-01 | Phase 5 | Pending |
| QUAL-02 | Phase 5 | Pending |
| QUAL-03 | Phase 5 | Pending |
| QUAL-04 | Phase 5 | Pending |
| QUAL-05 | Phase 5 | Pending |
| RBAC-01 | Phase 6 | Pending |
| RBAC-02 | Phase 6 | Pending |
| RBAC-03 | Phase 6 | Pending |
| RBAC-04 | Phase 6 | Pending |
| RBAC-05 | Phase 6 | Pending |
| CHAT-01 | Phase 7 | Pending |
| CHAT-02 | Phase 7 | Pending |
| CHAT-03 | Phase 7 | Pending |
| CHAT-04 | Phase 7 | Pending |
| CHAT-05 | Phase 7 | Pending |
| PAY-01 | Phase 8 | Pending |
| PAY-02 | Phase 8 | Pending |
| PAY-03 | Phase 8 | Pending |
| PAY-04 | Phase 8 | Pending |
| PAY-05 | Phase 8 | Pending |
| MOB-01 | Phase 9 | Pending |
| MOB-02 | Phase 9 | Pending |
| MOB-03 | Phase 9 | Pending |
| MOB-04 | Phase 9 | Pending |
| MOB-05 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-18*  
*Last updated: 2026-05-18 after roadmap creation*
