# Book Website Production Deployment Runbook

Production deployment for the book website monorepo (Vite frontend + Express/Prisma API). Marketing-backend integration is **out of scope** for v1.4; this runbook covers the book stack only.

## 1. Topology

- Edge reverse proxy: Nginx (`reverse-proxy`)
- Frontend static app: Vite build served by Nginx (`frontend`)
- Book API: Express + Prisma SQLite (`server`)
- Persistent DB volume: `sqlite-data` mounted at `/app/prisma`

Public traffic:

- `/` → `frontend`
- `/api/v1/*` → `server`
- `/health` → `server:/health`
- `/sitemap.xml`, `/robots.txt` → `server` (dynamic SEO)

## 2. Required environment variables

Root `.env` (used by `docker compose`):

```env
# Canonical origin for sitemap, canonical links, OG URLs (SEO-01)
SITE_URL=https://your-production-domain.com

JWT_SECRET=replace_with_long_random_secret
ALLOWED_ORIGINS=https://your-production-domain.com
ADMIN_ALLOWED_ORIGINS=https://your-production-domain.com

# Optional marketing dependency (can omit for book-only deploy)
MARKETING_API_KEY=
MARKETING_BACKEND_IMAGE=ghcr.io/your-org/marketing-backend:latest
```

Server-only (also set on `server` service in Compose):

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | Absolute URLs in sitemap, canonical, JSON-LD |
| `JWT_SECRET` | Admin JWT signing (min 32 chars in production) |
| `DATABASE_URL` | SQLite path inside container |
| `ALLOWED_ORIGINS` | CORS for public API |
| `ADMIN_ALLOWED_ORIGINS` | CORS for admin routes |

Frontend build-time:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Browser API base (e.g. `https://your-domain.com/api/v1`) |

## 3. Admin bootstrap credentials

After first deploy, seed the database:

```bash
cd server && npm run seed
```

| Field | Dev seed value |
|-------|----------------|
| **Admin URL** | `/admin` (password-only; username is implicit `admin`) |
| **Username** | `admin` |
| **Password** | `Welcome@1234` |

Defined in `server/src/seed.ts`. The seed `upsert` with `update: {}` does **not** rotate an existing admin password.

### Production password (REL-08)

- **Do not** leave `Welcome@1234` in production.
- Rotate by updating the `Admin` row (bcrypt hash) via a one-off script or new env-driven seed path.
- Document who rotated and when in your ops log.

`VITE_ADMIN_PASSWORD` in `src/lib/config.ts` is **not** used for login; authentication is server bcrypt only.

## 4. Docker build and prerender (SEO-03, SEO-04)

The frontend `Dockerfile` sets `PRERENDER_SKIP=1` during `npm run build` because the API and database are not available inside the image build layer.

**Recommended production flow:**

1. Build SPA: `npm run build:no-prerender` (or full build with `PRERENDER_SKIP=1`).
2. Start API with seeded DB on the target host or CI agent.
3. Run prerender against live API:

```bash
export PRERENDER_API_URL=http://127.0.0.1:3001   # or internal service URL
export SITE_URL=https://your-production-domain.com
npm run build:no-prerender && node scripts/prerender.mjs
```

4. Deploy the resulting `dist/` to the frontend container or CDN.

**Re-run prerender after CMS publish** (blog/event/global SEO or appearance changes that affect HTML head):

```bash
# API must be up with current DB
PRERENDER_API_URL=http://127.0.0.1:3001 SITE_URL=https://your-domain.com npm run prerender
# Redeploy dist/ to frontend
```

Paths come from `GET /api/v1/seo/prerender-paths` (includes `/`, `/blog`, `/blog/:slug`, `/events`, `/events/:id` for published indexable events).

Fast local/dev image builds only:

```bash
PRERENDER_SKIP=1 docker compose build frontend
```

## 5. First deploy

```bash
docker compose build --no-cache frontend server
docker compose up -d
docker compose exec server sh -lc 'cd /app && npx prisma db push && npm run seed'
```

Verify:

```bash
curl -fsS http://localhost/health
curl -fsS http://localhost/api/v1/content/site
curl -fsS http://localhost/sitemap.xml | head
npm run smoke:production   # with BOOK_API_URL=http://localhost
```

## 6. Database persistence (SQLite)

Backups: `./scripts/backup-sqlite.sh`

Restore: `./scripts/restore-sqlite.sh /path/to/backup.db` then `docker compose up -d server`

## 7. Deploy update procedure

1. Backup DB: `./scripts/backup-sqlite.sh`
2. Pull/build: `docker compose build frontend server && docker compose up -d`
3. Migrate schema if needed: `docker compose exec server npx prisma db push`
4. Re-run prerender (section 4) if content/SEO changed; redeploy `dist/`
5. Run `npm run smoke:production` against the public URL

## 8. Health verification checklist

- [ ] `GET /health` → `{ "status": "healthy" }`
- [ ] `GET /api/v1/content/site` → JSON with `hero`, `settings`
- [ ] `GET /sitemap.xml` → valid XML with `SITE_URL` host
- [ ] `GET /robots.txt` → references sitemap, disallows `/admin`
- [ ] Admin login at `/admin` with rotated password
- [ ] View Source on `/` shows title, canonical, `og:site_name` after prerender

## 9. Operational notes

- Keep `JWT_SECRET` server-side only; never `VITE_` prefix.
- Custom header/footer scripts are edited in **Settings → Advanced** and injected client-side on publish.
- For combined book + marketing deploy, resume v1.3 runbook when that milestone is active.
