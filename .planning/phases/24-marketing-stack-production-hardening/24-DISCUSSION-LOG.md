# Phase 24 Discussion Log: Marketing Stack Production Hardening

**Date:** 2026-05-20  
**Participants:** User, Copilot (discuss-phase)  
**Scope:** Clarifying implementation decisions for Phase 24 before planning

## Areas Discussed

### Area 1: CORS & Origins Strategy

**Questions Asked:**
1. How should allowed origins be managed?
   - User choice: "what is the industry practice to flow here. do that"
   - Agent decision: Static whitelist via env var (industry standard)
2. Should CORS include credentials?
   - User choice: "Production practice follow"
   - Agent decision: API key in header only (no allowCredentials flag)

**Decisions:**
- CORS enabled with `ALLOWED_ORIGINS` env var (e.g., `https://superhumanly.ai,https://api.superhumanly-thoughts.com`)
- Server-to-server auth via API key in Authorization/X-API-Key header
- No httpOnly cookie persistence needed

---

### Area 2: Environment Configuration Schema

**Questions Asked:**
1. How should env var schema be documented?
   - User choice: "like marketing frontend and backend can be made a solo service tha can be integraterd wih any other service"
   - Agent interpretation: Each service must have clear, documented env contracts

2. Which env vars should be locked in the schema?
   - User choice: "all"
   - Agent interpretation: Comprehensive schema covering core (API/Auth/Infra), environment (LOG_LEVEL/DEBUG), and feature toggles

**Decisions:**
- ENV-SCHEMA.md (or .env.example) in both services
- Backend vars: MARKETING_API_URL, ALLOWED_ORIGINS, AWS creds, Bedrock, database URL, ENVIRONMENT, LOG_LEVEL, feature toggles
- Frontend vars: VITE_MARKETING_API_URL, VITE_MARKETING_KEY, VITE_ENVIRONMENT
- Treated as independent services with clear integration contracts

---

### Area 3: Health Check & Readiness Probes

**Questions Asked:**
1. What health check pattern?
   - User choice: Liveness vs Readiness (K8s pattern)
2. Does frontend need health checks?
   - User choice: Frontend checks backend readiness

**Decisions:**
- `/health/live` — process alive
- `/health/ready` — app + database + Bedrock checked
- Frontend makes startup call to `/api/health/ready`; shows graceful error if unavailable

---

### Area 4: Production Database Strategy

**Questions Asked:**
1. Production database approach?
   - User choice: PostgreSQL (full migration)
2. When should migration happen?
   - User choice: Defer migration to Phase 25

**Decisions:**
- Phase 24: Document migration path in MIGRATION.md, set up migration tooling (Alembic)
- Phase 25: Execute actual Postgres migration
- Database abstraction layer to be refactored if needed

---

### Area 5: Smoke Check Test Suite

**Questions Asked:**
1. Which flows in smoke tests?
   - User choice: "all"
   - Agent interpretation: Happy path + error cases

2. Technology for smoke checks?
   - User choice: "Those gives reliabliiltiy and accuracy" (ambiguous)
   - Clarification: Python pytest as primary

**Decisions:**
- pytest-based suite in `marketing-backend/tests/test_smoke.py`
- Coverage: lead creation → scoring → email trigger; plus auth failures, DB unavailability, Bedrock fallbacks
- Run locally with `pytest tests/test_smoke.py`; also runs in CI/CD post-deploy

---

### Area 6: Frontend API URL Configuration

**Questions Asked:**
1. How should frontend know backend URL?
   - User choice: Build-time env var (VITE_*)

**Decisions:**
- Vite `VITE_MARKETING_API_URL` at build time
- Different builds for dev/staging/prod (.env.production, .env.staging, etc.)
- No runtime config fetch; frontend stays static

---

## Deferred Ideas (Noted for Future Phases)

- Rate limiting on API endpoints (Phase 25 or 26)
- Multiple Bedrock models + failover (Phase 25+)
- Audit logging for API calls (Phase 25+ for compliance)
- Email delivery tracking via webhooks (Phase 26+)

## User Guidance

The user's key input: "Production practice follow" and "all" indicate a comprehensive, production-hardened approach. Decisions favor:
- Industry standards (static CORS whitelist, K8s health patterns, Postgres)
- Explicit documentation over implicit assumptions
- Standalone services with clear contracts
- Comprehensive testing covering both happy path and errors

---

**Discussion Status:** Complete. Decisions locked and ready for planning.
