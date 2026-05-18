# Research Summary — Milestone v1.0

**Synthesized:** 2026-05-18 (inline from codebase maps; subagents not installed)

## Stack (current + additions)

| Layer | Current | Production additions |
|-------|---------|----------------------|
| Frontend | React 19, Vite 8, Tailwind 4 | PWA plugin, responsive admin; optional React Native later |
| Book API | Express 4, Prisma 5, SQLite | Zod validation, rate-limit, marketing proxy; Postgres option Phase 4 |
| Marketing | FastAPI, SQLite, Bedrock, Resend | CORS enablement, shared `VELLUX_API_KEY`, coordinated deploy |
| Chat | None | Socket.io or SSE + Redis adapter if scaling |
| Payments | None | Stripe Checkout + webhooks on book API |
| CI | None | GitHub Actions: lint, tsc, vitest, supertest |

## Feature table stakes

- Complete CRUD for all CMS surfaces already in UI
- Server-side marketing proxy (industry standard)
- JWT session validation on admin load
- CI + health checks before claiming production
- RBAC before multi-person editorial teams
- Payment webhooks with signature verification

## Watch out for

- Community API gap (client calls routes that do not exist)
- Marketing key in Vite bundle
- SQLite file locking under concurrent admin + chat + payments
- CORS commented out in marketing-backend `main.py` — must align for prod
- Monolithic `GET /content` will not scale with chat history and large community

## Build order rationale

Foundation phases 1–5 de-risk expansion phases 6–9. Payments require security + RBAC; chat requires RBAC for moderation; mobile last so API contracts stabilize.
