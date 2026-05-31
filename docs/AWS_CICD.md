# AWS CI/CD — Book Website

GitLab CI/CD for the **book website monorepo** (React SPA + Express API), following the same pattern as **automl-frontend** (S3 static deploy) and **automl-backend** (Docker on EC2).

Pipeline file: [`.gitlab-ci.yml`](../.gitlab-ci.yml)

Remote: `git@gitlab.com:Generative_admin/bookwebsite.git`

---

## Pipeline stages

| Stage | Jobs | Purpose |
|-------|------|---------|
| **verify** | `verify_frontend`, `verify_server` | Lint, typecheck, build, API smoke test |
| **build** | `build_frontend`, `build_api_image` | `dist/` artifact + API Docker image → GitLab Container Registry |
| **deploy** | `deploy_frontend_staging`, `deploy_api_staging` | **Manual** until AWS staging is ready |

MRs and pushes to `staging` / `main` run verify + build automatically. Deploy jobs are **manual** — click **Play** in GitLab after AWS is provisioned.

---

## GitLab CI/CD variables

Set in **Settings → CI/CD → Variables** (mask/protect secrets).

### Frontend (S3 + optional CloudFront)

| Variable | Example | Required for deploy |
|----------|---------|---------------------|
| `S3_FRONTEND_BUCKET` | `book-website-staging-frontend` | Yes |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1234567890ABC` | No (cache invalidation) |
| `STAGING_VITE_API_URL` | `https://api.staging.example.com/api/v1` | Yes (real staging API URL) |
| `STAGING_VITE_ADMIN_PASSWORD` | *(matches seeded admin)* | Recommended |

`STAGING_VITE_API_URL` is baked into the Vite build at CI time.

### API (EC2 + Docker)

| Variable | Example | Required for deploy |
|----------|---------|---------------------|
| `EC2_HOST` | `3.15.0.0` or DNS name | Yes |
| `EC2_USER` | `ubuntu` | Yes |
| `EC2_SSH_PRIVATE_KEY` | PEM file (**File** type) | Yes |
| `DEPLOY_PATH` | `/home/ubuntu/book-website` | No (default shown) |

GitLab Container Registry vars (`CI_REGISTRY_*`) are provided automatically.

---

## AWS resources to create (staging)

### 1. Frontend — S3 (+ CloudFront recommended)

1. S3 bucket (e.g. `book-website-staging-frontend`)
2. Block public access off *or* use CloudFront OAC (preferred)
3. Static website hosting: index + error document → `index.html` (for bare S3; CloudFront uses custom error → 200 → `/index.html` for `/blog/:slug` routes)
4. CloudFront distribution → custom domain (optional)
5. Set `S3_FRONTEND_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID` in GitLab

**Note:** Dynamic routes (`/blog/my-post`, `/events/123`) need CloudFront **custom error response** (403/404 → `/index.html`, 200) or prerender at build time with a live API.

### 2. API — EC2

1. Ubuntu 22.04+ instance, security group: `22`, `80`/`443` (if proxy), `3001` (internal only if behind nginx)
2. Install Docker + Docker Compose (optional for local stack testing)
3. Create deploy directory on instance:

```bash
mkdir -p /home/ubuntu/book-website/server
```

4. Create **`/home/ubuntu/book-website/server/.env`** on the instance (never commit):

```env
NODE_ENV=production
PORT=3001
SITE_URL=https://staging.yourdomain.com
API_PUBLIC_URL=https://api.staging.yourdomain.com
JWT_SECRET=<long-random-string>
DATABASE_URL=file:/var/data/prod.db
UPLOAD_ROOT=/var/data
ALLOWED_ORIGINS=https://staging.yourdomain.com
ADMIN_ALLOWED_ORIGINS=https://staging.yourdomain.com
```

5. First-time on instance (after first deploy):

```bash
docker exec book-website-api npx prisma migrate deploy
docker exec book-website-api npm run seed
```

6. Set `EC2_HOST`, `EC2_USER`, `EC2_SSH_PRIVATE_KEY` in GitLab

The deploy job pulls `$CI_REGISTRY_IMAGE/api:staging` (or commit SHA), runs container `book-website-api` with volume `book-website-data:/var/data`.

### 3. Reverse proxy (recommended)

Point nginx/Caddy on EC2 or ALB:

- `https://staging.yourdomain.com` → S3/CloudFront (frontend)
- `https://api.staging.yourdomain.com` → `127.0.0.1:3001` (API)

Update `SITE_URL`, `API_PUBLIC_URL`, and `STAGING_VITE_API_URL` to match.

---

## Local parity

```bash
# Verify (same as CI)
npm ci && npm run lint && npx tsc -b && PRERENDER_SKIP=1 npm run build:no-prerender
cd server && npm ci && npm run build && npm test

# Staging-style frontend build
npm run build:staging

# Full stack via Docker Compose (local / single EC2 option)
docker compose up --build
```

---

## Enabling automatic deploy

After AWS is stable, edit `.gitlab-ci.yml` deploy jobs:

```yaml
when: manual   # change to → on_success
```

Or keep manual for production (`main`) and auto for `staging`.

---

## Related docs

- [DEPLOY.md](../DEPLOY.md) — Vercel + Render split (alternative to AWS)
- [docker-compose.yml](../docker-compose.yml) — local nginx + frontend + API stack
