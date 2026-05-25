# Phase 24: Marketing Stack Production Hardening - Research

**Researched:** 2026-05-20  
**Domain:** FastAPI/React production hardening, env contracts, readiness probes, Postgres migration readiness, pytest smoke tests  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 1. CORS & Origins Strategy

**Decision:** Static whitelist via environment variable; API key in request header only.

**Rationale:** Industry standard for production. Explicit list provides security (no wildcard), auditability (visible in deployment), and per-environment flexibility (change env, not code).

**Details:**
- Marketing backend enables CORS with `ALLOWED_ORIGINS` env var (comma-separated list)
- Example: `ALLOWED_ORIGINS=https://superhumanly.ai,https://api.superhumanly-thoughts.com`
- Server-to-server calls (book API → marketing backend) use API key in `Authorization` or `X-API-Key` header
- No `allowCredentials=true` — httpOnly cookies not needed for server-to-server

**Implementation hook:** Uncomment and enhance CORS middleware in `marketing_api/main.py`

#### 2. Environment Configuration Schema

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

#### 3. Health Check & Readiness Probes

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

#### 4. Production Database Strategy

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

#### 5. Smoke Check Test Suite

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

#### 6. Frontend API URL Configuration

**Decision:** Build-time environment variable (Vite pattern). Different builds for dev/staging/prod.

**Details:**
- Frontend uses `import.meta.env.VITE_MARKETING_API_URL` for the backend endpoint
- At build time, Vite substitutes the value from env vars or `.env.production`, `.env.staging`, etc.
- Example `.env.production`: `VITE_MARKETING_API_URL=https://api.superhumanly-thoughts.com/marketing`
- No runtime config fetch — keeps frontend static and fast
- No hardcoding — environment-specific

**Implementation hook:** Ensure Vite build process passes `VITE_MARKETING_API_URL` to the React app; use it in API client initialization

### the agent's Discretion

None captured in `CONTEXT.md`.

### Deferred Ideas (OUT OF SCOPE)

- **Rate limiting:** Add per-endpoint rate limits (Phase 25 or 26, can be done in middleware)
- **Custom Bedrock fallback models:** Support multiple LLM models; fail over gracefully (Phase 25+)
- **Audit logging:** Log all API calls and lead mutations for compliance (Phase 25 after core integration)
- **Email delivery tracking:** Webhooks from email service to track opens/clicks (Phase 26+)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MKT-01 | Marketing backend exposes stable production routes for webhook ingestion, event capture, email-agent processing, and health checks with explicit env configuration | Backend CORS/env contract, `/health/live`, `/health/ready`, smoke coverage, and Postgres-ready DB wiring |
| MKT-02 | Marketing frontend builds and serves correctly under the `/marketing` base path with a configurable API URL and no asset or routing breakage in production | Vite env contract, `VITE_MARKETING_API_URL`, and startup readiness gate |
| MKT-03 | Marketing deployment docs and env examples describe production hostnames, origins, and local development overrides without leaking dev-only assumptions into release notes | `ENV-SCHEMA.md`, `.env.example`, and origin whitelist docs |
| MKT-04 | Marketing backend and marketing frontend have repeatable smoke checks that confirm the primary lead-intake and orchestration flows still work after deploy | `pytest` smoke suite, TestClient pattern, and error-case coverage |
</phase_requirements>

## Summary

The backend already has the right core service shape for Phase 24: FastAPI routes, API-key auth, a local database layer, Bedrock orchestration, and a placeholder CORS configuration. The gap is that the production contract is not actually enforced yet. `ALLOWED_ORIGINS` is read from env, but the middleware remains commented out; readiness endpoints do not exist; and the current database story is still SQLite-only with no Alembic scaffold or migration environment. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/.env.example]

The frontend is also close, but not contract-complete. It already deploys under `/marketing`, yet it still reads `VITE_API_URL` instead of the phase decision `VITE_MARKETING_API_URL`, and there is no startup health gate that can surface backend readiness before the UI becomes interactive. There are no backend test files or pytest configuration in the marketing backend tree, so the smoke-check requirement is still a clean-slate implementation. [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/vite.config.ts] [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/main.tsx] [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/App.tsx] [VERIFIED: file_search results in /Users/anuragverma/Downloads/marketing-backend/**]

**Primary recommendation:** harden the service contract first, then add migration scaffolding, then add smoke verification. Do not start the actual Postgres cutover in Phase 24; make Phase 24 produce a database path and tests that are ready for Phase 25. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale | Source |
|------------|-------------|----------------|-----------|--------|
| CORS allowlist and API-key auth | API / Backend | Browser / Client | The backend owns cross-origin policy and request authorization; the browser only consumes the policy. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] [CITED: https://fastapi.tiangolo.com/tutorial/cors/] |
| Liveness and readiness probes | API / Backend | Frontend bootstrap | Health endpoints are server contracts; the frontend only polls them and reacts. | [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/testing/] |
| Env schemas and runtime validation | API / Backend and Frontend build config | Deployment docs | Env contracts must be explicit per service so deployment and integration stay deterministic. | [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://vite.dev/guide/env-and-mode] |
| Postgres readiness and migrations | Database / Storage | API / Backend | Schema versioning belongs with the database layer, not ad hoc route code. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html] |
| Smoke tests | API / Backend + CI | Frontend build validation | The backend owns request/response truth; the frontend only verifies it can locate and reach the API. | [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/testing/] |

## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard | Source |
|----------------|---------|---------|--------------|--------|
| FastAPI | 0.110.0 | Backend API framework | Already powers the marketing backend and supports CORS, health endpoints, and TestClient-based testing cleanly. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/requirements.txt] [CITED: https://fastapi.tiangolo.com/tutorial/cors/] |
| Uvicorn | 0.27.1 | ASGI server | Current server pinned in the backend requirements. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/requirements.txt] |
| React | 19.2.4 | Frontend runtime | Current frontend runtime pinned in the marketing frontend package manifest. | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/package.json] |
| Vite | 8.0.4 | Frontend build system and env loader | Current frontend build tool; Vite env files are the right place for `VITE_MARKETING_API_URL`. | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/package.json] [CITED: https://vite.dev/guide/env-and-mode] |
| axios | 1.15.0 | Browser API client | Already used by the frontend API wrapper; keep it and parameterize the base URL through Vite env. | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/package.json] [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] |

### Supporting
| Library / Tool | Version | Purpose | When to Use | Source |
|----------------|---------|---------|------------|--------|
| pytest | install in backend venv | Python test runner for smoke tests | Use for backend smoke coverage and CI gating. | [CITED: https://docs.pytest.org/en/stable/explanation/goodpractices.html] [CITED: https://fastapi.tiangolo.com/tutorial/testing/] |
| Alembic | install in backend venv | Database migration environment | Use for Postgres migration readiness and repeatable schema versioning. | [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html] |
| HTTPX / TestClient | already present as backend dependency | FastAPI request testing | Use for route smoke checks and dependency override patterns. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/requirements.txt] [CITED: https://fastapi.tiangolo.com/tutorial/testing/] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff | Source |
|------------|-----------|----------|--------|
| Header API key auth | Cookie-based session auth | Cookies require credentialed CORS and more browser/session complexity; the phase decision explicitly avoids that. | [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/cors/] |
| Live runtime config fetch in frontend | Build-time Vite env substitution | Runtime fetch adds boot complexity and another failure mode; Vite envs are designed for build-time configuration. | [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://vite.dev/guide/env-and-mode] |
| One-off SQL scripts | Alembic migration environment | Ad hoc scripts are hard to repeat, review, and roll back; Alembic gives versioned upgrade/downgrade history. | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html] |

**Installation:**
```bash
# backend tooling for Phase 24 and 25 readiness
pip install pytest alembic
```

## Architecture Patterns

### System Architecture Diagram

```text
Browser / marketing frontend
  -> Vite env: VITE_MARKETING_API_URL
  -> API client base URL
  -> GET /health/ready at startup
  -> normal app render or graceful unavailable state

Marketing backend (FastAPI)
  -> CORSMiddleware with ALLOWED_ORIGINS allowlist
  -> /health/live (process alive)
  -> /health/ready (DB + critical dependency checks)
  -> webhook / events / email-agent routes
  -> database layer
  -> Bedrock / external services when enabled

Database / storage
  -> SQLite today
  -> Alembic scaffold + Postgres-ready URL contract for Phase 25
```

### Recommended Project Structure
```text
marketing-backend/
├── marketing_api/
├── alembic/
├── alembic.ini
├── tests/
└── ENV-SCHEMA.md

marketing-frontend/
├── src/
├── ENV-SCHEMA.md
└── .env.example
```

### Pattern 1: Explicit env contracts
**What:** Each service documents required, optional, and production-only variables in `ENV-SCHEMA.md` and mirrors the same shape in `.env.example`. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://vite.dev/guide/env-and-mode]
**When to use:** Any deployment that has more than one environment or more than one service.
**Example:**
```text
Required: ALLOWED_ORIGINS, VELLUX_API_KEY, DATABASE_URL
Optional: AWS_REGION, BEDROCK_MODEL_ID, ENABLE_BEDROCK
Frontend: VITE_MARKETING_API_URL, VITE_ENVIRONMENT
```

### Pattern 2: Split liveness vs readiness
**What:** Liveness only answers whether the process is alive; readiness answers whether the app can serve traffic.
**When to use:** Containerized or load-balanced deployments.
**Example:**
```text
/health/live -> 200 if FastAPI process is up
/health/ready -> 200 if DB is reachable and enabled dependencies pass
```

### Pattern 3: Versioned DB migrations
**What:** Keep database schema changes in Alembic revisions instead of embedded DDL or one-off scripts.
**When to use:** Any move from SQLite toward PostgreSQL or any schema change that must be repeatable.
**Example:**
```text
alembic init alembic
alembic revision -m "baseline marketing schema"
alembic upgrade head
```

### Anti-Patterns to Avoid
- **Wildcard CORS with auth headers:** avoid `*` when the app uses header-based API keys; FastAPI docs call out that credentials and wildcards do not mix cleanly. [CITED: https://fastapi.tiangolo.com/tutorial/cors/]
- **Hardcoded production host defaults in code:** the current backend defaults `ALLOWED_ORIGINS` to a production hostname, which can hide missing deploy config. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py]
- **Client secrets in `VITE_*` variables:** Vite exposes `VITE_*` values to browser bundles, so do not put real secrets there. [CITED: https://vite.dev/guide/env-and-mode]
- **Treating SQLite as the long-term production target:** the current codebase is file-backed SQLite, but the phase decision already moves the real migration to PostgreSQL. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why | Source |
|---------|-------------|-------------|-----|--------|
| CORS origin parsing and preflight handling | Custom middleware logic | FastAPI `CORSMiddleware` | Standard, tested behavior with explicit origin allowlists. | [CITED: https://fastapi.tiangolo.com/tutorial/cors/] |
| Schema migration tracking | Ad hoc SQL scripts | Alembic | Versioned revisions, upgrade/downgrade flow, and repeatable environment setup. | [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html] |
| FastAPI route smoke checks | Manual clicking only | `pytest` + `TestClient` | FastAPI explicitly documents this as the standard testing path. | [CITED: https://fastapi.tiangolo.com/tutorial/testing/] |
| Frontend env resolution | Runtime config fetch from arbitrary endpoint | Vite env files and `import.meta.env` | Vite is built for build-time env substitution and mode-specific configuration. | [CITED: https://vite.dev/guide/env-and-mode] |

**Key insight:** the hard parts here are not the routes themselves; they are the operational contracts around them. CORS, readiness, migrations, and smoke tests all need explicit tooling because each one is easy to fake in development and easy to break in production.

## Common Pitfalls

### Pitfall 1: Readiness becomes a false green
**What goes wrong:** The service reports ready even when the database is down or the frontend cannot actually use it.
**Why it happens:** Teams often reuse the liveness check or return 200 from a trivial route.
**How to avoid:** Make `/health/ready` do a real database query and surface dependency-specific status.
**Warning signs:** K8s or container health checks say healthy while lead ingestion or email processing fails.

### Pitfall 2: Env docs drift from runtime behavior
**What goes wrong:** `.env.example` and release docs mention one variable name, while the code reads another.
**Why it happens:** The codebase currently uses `VITE_API_URL`, but the phase decision uses `VITE_MARKETING_API_URL`. [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md]
**How to avoid:** Treat env schema files as part of the contract and update code and docs together.
**Warning signs:** Builds succeed locally but the deployed frontend points at localhost or the wrong host.

### Pitfall 3: Migration tooling is postponed too long
**What goes wrong:** Teams defer Alembic until after they need a database change, then discover there is no versioning baseline.
**Why it happens:** SQLite feels simple until schema history matters.
**How to avoid:** Scaffold Alembic in Phase 24 even if the actual Postgres cutover is deferred to Phase 25.
**Warning signs:** Database changes are being made manually in the app or by editing the file database directly.

### Pitfall 4: Smoke tests hit live external services
**What goes wrong:** CI becomes flaky and expensive because tests depend on Bedrock, email providers, or external webhooks.
**Why it happens:** The happy path is easier to script against real services than to isolate.
**How to avoid:** Mock dependency calls or swap them through dependency overrides; only validate the request/response boundary in smoke tests.
**Warning signs:** Tests pass only when external credentials are present or when the network is fast.

## Code Examples

Verified patterns from official sources:

### FastAPI CORS
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = ["https://example.org", "https://www.example.org"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Source: [FastAPI CORS docs](https://fastapi.tiangolo.com/tutorial/cors/)

### FastAPI smoke test with TestClient
```python
from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
```
Source: [FastAPI testing docs](https://fastapi.tiangolo.com/tutorial/testing/)

### Vite env access
```ts
const apiBaseUrl = import.meta.env.VITE_MARKETING_API_URL;
```
Source: [Vite env docs](https://vite.dev/guide/env-and-mode)

## Current-State Gaps

| Gap | Evidence | Why it matters | Source |
|-----|----------|----------------|--------|
| CORS middleware is still disabled | `CORSMiddleware` is imported, but the `app.add_middleware(...)` block is commented out | Browser calls from a separate origin will fail until CORS is actually enabled | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] |
| Default CORS origin is production-only | `ALLOWED_ORIGINS` falls back to `https://superhumanly-thoughts.com` | Missing env config can silently point the app at the wrong origin in non-prod environments | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] |
| No liveness or readiness routes exist | The backend exposes `/`, `/events/live`, and the main business routes, but not `/health/live` or `/health/ready` | Container orchestration cannot distinguish process health from dependency health | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] |
| SQLite is still the runtime database | `database.py` opens `marketing_agent.db`; the env example also points at the SQLite file | Production Postgres cutover still needs migration scaffolding and a connection contract | [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/.env.example] |
| No Alembic scaffold is present | No `alembic.ini` or `alembic/` directory exists in the backend tree | Schema versioning cannot be repeated, reviewed, or rolled back yet | [VERIFIED: file_search results in /Users/anuragverma/Downloads/marketing-backend/**] |
| No backend smoke test suite exists | No backend `tests/` tree or `test_smoke.py` file was found | Phase 24 cannot prove the integration contract after deploy | [VERIFIED: file_search results in /Users/anuragverma/Downloads/marketing-backend/**] |
| Frontend uses the wrong env variable name for this phase | `src/lib/api.ts` reads `VITE_API_URL` instead of `VITE_MARKETING_API_URL` | Phase 24 deploys can drift from the contract and point at localhost or the wrong backend | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] |
| Frontend startup has no backend readiness gate | `src/main.tsx` only mounts the app, and `src/App.tsx` only sets up routing | Users can land on the app before the backend is actually available | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/main.tsx] [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/App.tsx] |
| The frontend `.env.example` is still generic | It only documents `VITE_API_URL` | Deployment docs do not yet match the phase contract or the marketing/backend naming | [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/.env.example] |

## Recommended Approach

1. Re-enable CORS in `marketing_api/main.py` with `ALLOWED_ORIGINS` as a comma-split allowlist, `allow_credentials=False`, and explicit methods/headers. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] [CITED: https://fastapi.tiangolo.com/tutorial/cors/]
2. Add `/health/live` and `/health/ready` to the backend, with `ready` performing a real database check and reporting dependency status rather than only process status. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/testing/]
3. Introduce `ENV-SCHEMA.md` in both services and align the `.env.example` files so the documented names match the runtime names exactly. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://vite.dev/guide/env-and-mode]
4. Scaffold Alembic now, but keep the live database file-backed until Phase 25; the goal in Phase 24 is migration readiness, not the live cutover. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html]
5. Add backend smoke tests with `pytest` and `TestClient`, covering success and failure cases for auth, DB-down, malformed JSON, and fallback behavior. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/testing/] [CITED: https://docs.pytest.org/en/stable/explanation/goodpractices.html]
6. Switch the frontend API client to `VITE_MARKETING_API_URL` and add a startup readiness fetch that can block the UI or show a graceful unavailable state until the backend reports ready. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://vite.dev/guide/env-and-mode]

## File-Level Recommendations

- `marketing-backend/marketing_api/main.py`: re-enable CORS, add `/health/live` and `/health/ready`, and make env parsing fail closed when required values are missing. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py]
- `marketing-backend/marketing_api/.env.example`: replace dev/prod ambiguity with explicit required/optional sections and production-safe examples. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/.env.example]
- `marketing-backend/ENV-SCHEMA.md`: document the backend env contract once, then make the app and deploy docs refer to that file. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md]
- `marketing-backend/alembic.ini` and `marketing-backend/alembic/env.py`: scaffold the migration environment and wire it to the eventual Postgres `DATABASE_URL`. [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html]
- `marketing-backend/tests/test_smoke.py`: implement the smoke suite using FastAPI `TestClient`, dependency overrides, and strict assertions on auth and error handling. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md] [CITED: https://fastapi.tiangolo.com/tutorial/testing/]
- `marketing-frontend/src/lib/api.ts`: rename `VITE_API_URL` to `VITE_MARKETING_API_URL`, keep the base URL centralized, and avoid leaking any secrets through `VITE_*`. [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] [CITED: https://vite.dev/guide/env-and-mode]
- `marketing-frontend/src/App.tsx` or a small bootstrap wrapper: add the startup readiness gate before the router fully renders the app shell. [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/App.tsx]
- `marketing-frontend/.env.example`: document `VITE_MARKETING_API_URL` and mode-specific examples for local/staging/prod. [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/.env.example] [CITED: https://vite.dev/guide/env-and-mode]
- `marketing-frontend/ENV-SCHEMA.md`: mirror the backend schema so integrators know exactly what the standalone frontend expects. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md]

## Risks

- A permissive CORS policy or credentialed CORS would conflict with the locked header-based auth strategy and widen the browser attack surface. [CITED: https://fastapi.tiangolo.com/tutorial/cors/]
- A readiness check that always includes Bedrock can create false outages if the dependency is intentionally optional or temporarily unavailable; keep the check aligned with the feature flag/operational mode. [VERIFIED: /Users/anuragverma/Downloads/book website-frontend/.planning/phases/24-marketing-stack-production-hardening/24-CONTEXT.md]
- The frontend env rename is easy to miss in production builds because Vite substitutes env values at build time, not at runtime. [CITED: https://vite.dev/guide/env-and-mode]
- Leaving SQLite in place without an Alembic scaffold makes the Phase 25 migration much riskier, because there is no versioned baseline to move from. [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html]
- Smoke tests that call real Bedrock or delivery services will be flaky and slow; keep them at the API boundary and mock external integrations. [CITED: https://fastapi.tiangolo.com/tutorial/testing/]
- The backend still defaults `VELLUX_API_KEY` to a hardcoded value in code, so env hardening must include removing or overriding that default. [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py]

## Suggested Split into Executable Plans

1. **Plan A: service contract hardening**
   - Re-enable CORS.
   - Add `ENV-SCHEMA.md` and align `.env.example` files.
   - Rename the frontend API env variable.
   - Add the frontend startup readiness gate.

2. **Plan B: backend operability**
   - Add `/health/live` and `/health/ready`.
   - Centralize env parsing and fail closed on missing required vars.
   - Add graceful dependency-status reporting for the readiness endpoint.

3. **Plan C: migration readiness + verification**
   - Scaffold Alembic and a baseline migration environment.
   - Keep SQLite active for now but wire the DB contract for Postgres.
   - Add `pytest` smoke tests with `TestClient` and dependency overrides.
   - Wire a fast local smoke command and a post-deploy smoke command for CI.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python | backend implementation and tests | ✓ | 3.14.2 | — |
| npm | frontend build and validation | ✓ | 11.6.4 | — |
| pytest | backend smoke tests | ✗ | — | Install in the backend virtual environment |
| alembic | migration environment | ✗ | — | Install in the backend virtual environment |
| psql | local Postgres checks | ✗ | — | Use a managed DB or containerized Postgres instead |

**Missing dependencies with no fallback:**
- None blocking Phase 24 planning.

**Missing dependencies with fallback:**
- `pytest` and `alembic` can be installed into the backend venv when the implementation phase starts.
- `psql` is useful for local DB verification but not required to plan the migration scaffold.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/main.py] - current backend routes, CORS stub, auth, and env usage
- [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/database.py] - current SQLite storage and schema shape
- [VERIFIED: /Users/anuragverma/Downloads/marketing-backend/marketing_api/.env.example] - current backend env example
- [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/lib/api.ts] - current frontend API base URL handling
- [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/.env.example] - current frontend env example
- [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/vite.config.ts] - `/marketing` base path
- [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/main.tsx] - frontend bootstrap entry
- [VERIFIED: /Users/anuragverma/Downloads/marketing-frontend/src/App.tsx] - frontend router entry

### Secondary (MEDIUM confidence)
- [CITED: https://fastapi.tiangolo.com/tutorial/cors/] - CORS middleware and credential behavior
- [CITED: https://fastapi.tiangolo.com/tutorial/testing/] - TestClient and pytest testing pattern
- [CITED: https://alembic.sqlalchemy.org/en/latest/tutorial.html] - Alembic environment and revision flow
- [CITED: https://vite.dev/guide/env-and-mode] - Vite env file loading and `VITE_` exposure rules
- [CITED: https://docs.pytest.org/en/stable/explanation/goodpractices.html] - pytest discovery and test layout conventions

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - current repo versions are clear, but Alembic/pytest are not yet installed in the local environment
- Architecture: HIGH - current routes, env variables, and base path are directly verified in source
- Pitfalls: MEDIUM - risks are grounded in current source behavior plus current official docs

**Research date:** 2026-05-20  
**Valid until:** 2026-06-19
