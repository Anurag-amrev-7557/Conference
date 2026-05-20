# Phase 24 Context: Marketing Stack Production Hardening

**Date:** 2026-05-20  
**Phase:** 24  
**Milestone:** v1.3 — Marketing Integration & Admin Production Readiness  

## Domain

The marketing backend (FastAPI + SQLite) and marketing frontend (React + Vite) must deploy as independent, production-ready services with:
- Explicit environment configuration (no dev-only defaults in production docs)
- Reliable CORS and authentication
- Health checks compatible with container orchestration
- Repeatable verification of critical flows
- Clear API contracts so other services (the book site) can integrate without hidden assumptions

## Decisions Captured

### 1. CORS & Origins Strategy

**Decision:** Static whitelist via environment variable; API key in request header only.

**Rationale:** Industry standard for production. Explicit list provides security (no wildcard), auditability (visible in deployment), and per-environment flexibility (change env, not code).

**Details:**
- Marketing backend enables CORS with `ALLOWED_ORIGINS` env var (comma-separated list)
- Example: `ALLOWED_ORIGINS=https://superhumanly.ai,https://api.superhumanly-thoughts.com`
- Server-to-server calls (book API → marketing backend) use API key in `Authorization` or `X-API-Key` header
- No `allowCredentials=true` — httpOnly cookies not needed for server-to-server

**Implementation hook:** Uncomment and enhance CORS middleware in `marketing_api/main.py`

### 2. Environment Configuration Schema

**Decision:** Marketing backend and frontend are standalone services with clearly documented env contracts. Each service defines what it needs; integrators (book site) know exactly what to provide.

**Details:**
- Both services will have ENV-SCHEMA.md or `.env.example` documenting:
  - Required vs optional
  - Defaults (if any)
  - Purpose and production implications
- Backend env vars:
  - `MARKETING_API_URL` (for self-reference if needed)
  - `ALLOWED_ORIGINS` (CORS whitelist)
  - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (Bedrock)
  - `BEDROCK_MODEL_ID`
  - `VELLUX_API_KEY` (API auth)
  - `DATABASE_URL` (Postgres connection after migration)
  - `ENVIRONMENT` (dev/staging/prod)
  - `LOG_LEVEL` (debug/info/warn/error)
  - Feature toggles (e.g., `ENABLE_EMAIL_AGENT`, `ENABLE_BEDROCK`)
- Frontend env vars:
  - `VITE_MARKETING_API_URL` (backend endpoint)
  - `VITE_MARKETING_KEY` (frontend client key, if needed)
  - `VITE_ENVIRONMENT`

**Implementation hook:** Create `ENV-SCHEMA.md` in both `marketing-backend/` and `marketing-frontend/`; validate at startup

### 3. Health Check & Readiness Probes

**Decision:** Kubernetes-compatible liveness and readiness pattern.

**Details:**
- **`GET /health/live`** (liveness)
  - Returns 200 if process is alive
  - Fast check, minimal logic
  - JSON: `{"status": "alive", "timestamp": "2026-05-20T..."}`
- **`GET /health/ready`** (readiness)
  - Returns 200 only if app + database + critical dependencies are functional
  - Checks:
    - Database connectivity (execute simple query)
    - Bedrock API reachable (or skip if optional in this phase)
  - JSON: `{"status": "ready", "checks": {"database": "ok", "bedrock": "ok"}, "timestamp": "..."}`
- **Frontend behavior:**
  - On app startup, fetch `/api/health/ready` from configured backend
  - If fails, show graceful "Backend unavailable" message; retry periodically
  - On success, proceed with normal app initialization

**Implementation hook:** Add health endpoints to `marketing_api/main.py`; add startup check to React app

### 4. Production Database Strategy

**Decision:** Migrate to PostgreSQL; document the path in Phase 24, execute migration in Phase 25.

**Rationale:** PostgreSQL is production-standard for multi-instance deployments, backups, and scaling. SQLite is not suitable for production environments where multiple processes might access the database.

**Phase 24 scope:**
- Document migration steps in `MIGRATION.md` (schema, data export/import, rollback plan)
- Refactor database layer (if needed) to abstract from SQLite
- Create Alembic migrations or equivalent for schema versioning
- Prepare Postgres connection string pattern in env var schema

**Phase 25 scope:**
- Spin up Postgres (AWS RDS or self-hosted)
- Run migrations
- Verify data integrity
- Test failover and backup strategy

**Implementation hook:** Set up migration tooling (e.g., Alembic) in this phase; actual migration in Phase 25

### 5. Smoke Check Test Suite

**Decision:** Comprehensive pytest-based tests covering happy path AND error cases.

**Critical flows to verify:**
1. **Happy path:**
   - POST `/webhook` with valid lead payload → stored in database
   - POST `/leads/{id}/profile` with name/company → scoring triggered
   - POST `/email-agent/process` with recipient/subject/body → email sent (or Bedrock fallback)
2. **Error cases:**
   - Invalid/missing API key → 403 Forbidden
   - Database unavailable → appropriate error response (not 500 crash)
   - Bedrock service unavailable → graceful fallback or clear error
   - Malformed JSON → 422 Unprocessable Entity

**Test tool:** Python pytest (matches backend tech stack)

**Where it lives:** `marketing-backend/tests/test_smoke.py`

**How it runs:**
- Locally: `pytest tests/test_smoke.py`
- In CI/CD: Run after deploy step
- Can be parameterized for different environments (local, staging, prod)

**Implementation hook:** Create smoke test file with parametrized fixtures for API endpoints

### 6. Frontend API URL Configuration

**Decision:** Build-time environment variable (Vite pattern). Different builds for dev/staging/prod.

**Details:**
- Frontend uses `import.meta.env.VITE_MARKETING_API_URL` for the backend endpoint
- At build time, Vite substitutes the value from env vars or `.env.production`, `.env.staging`, etc.
- Example `.env.production`: `VITE_MARKETING_API_URL=https://api.superhumanly-thoughts.com/marketing`
- No runtime config fetch — keeps frontend static and fast
- No hardcoding — environment-specific

**Implementation hook:** Ensure Vite build process passes `VITE_MARKETING_API_URL` to the React app; use it in API client initialization

---

## Deferred Ideas

- **Rate limiting:** Add per-endpoint rate limits (Phase 25 or 26, can be done in middleware)
- **Custom Bedrock fallback models:** Support multiple LLM models; fail over gracefully (Phase 25+)
- **Audit logging:** Log all API calls and lead mutations for compliance (Phase 25 after core integration)
- **Email delivery tracking:** Webhooks from email service to track opens/clicks (Phase 26+)

## Canonical References

- [ROADMAP.md](../.planning/ROADMAP.md) — Phase 24 goal and success criteria
- [REQUIREMENTS.md](../.planning/REQUIREMENTS.md) — MKT-01 through MKT-04 locked requirements
- [PROJECT.md](../.planning/PROJECT.md) — Marketing backend/frontend context and constraints
- `/Users/anuragverma/Downloads/marketing-backend/` — FastAPI service (source of truth)
- `/Users/anuragverma/Downloads/marketing-frontend/` — React service (source of truth)
- `marketing_api/main.py` — Current API routes, CORS setup, Bedrock integration

## Code Context

### Current State

**Marketing Backend:**
- FastAPI app with routes: `/`, `/leads`, `/leads/{id}`, `/events`, `/email-agent/process`, `/webhook`
- CORS middleware commented out (must be uncommented and configured)
- API key verification via `verify_api_key()` dependency
- SQLite database in `marketing_agent.db`
- Bedrock integration for email orchestration

**Marketing Frontend:**
- React + Vite + Tailwind CSS
- Vite config already has `base: '/marketing/'` (correct)
- No `.env.example` file yet (needs to be added)
- Unknown current health check behavior (to be documented)

### Patterns to Leverage

- **Python FastAPI patterns:** Use for backend (already in place); extend with health endpoints
- **Vite env pattern:** Already used (`base: '/marketing/'`); extend with `VITE_MARKETING_API_URL`
- **Pytest for testing:** Backend codebase should have test structure; create smoke test file using same patterns

---

## Next Steps

1. **Researcher:** Investigate Postgres migration best practices, Alembic setup, and health check implementations in FastAPI
2. **Planner:** Create detailed tasks for:
   - CORS middleware uncomment + ALLOWED_ORIGINS env var
   - Health endpoints (`/health/live`, `/health/ready`)
   - ENV-SCHEMA.md for both services
   - Smoke test suite structure
   - Database abstraction layer (if needed for Postgres-readiness)
   - Frontend env var integration and startup check
3. **Executor:** Implement in order of dependency (CORS → env schema → health checks → smoke tests → frontend config)

---

**Phase 24 success:** Marketing backend and frontend deploy independently with explicit env handling, health checks, and verified lead-intake flow. No dev-only assumptions in production docs.
