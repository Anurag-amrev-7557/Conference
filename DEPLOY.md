# Deploy: Firebase Hosting + Render (primary)

**Start here:** [docs/FIREBASE_DEPLOY.md](./docs/FIREBASE_DEPLOY.md) — step-by-step guide.

| Component | Platform | Root |
|-----------|----------|------|
| React SPA | **Firebase Hosting** | repository root |
| Express API + SQLite + uploads | **Render** Web Service | `server/` |

```text
https://your-project.web.app  →  Firebase (dist/)
https://your-api.onrender.com →  Render (Express)
  ├── /api/v1/*
  ├── /media/*
  └── /health
```

Also supported: Vercel frontend + Render API, Docker Compose, AWS — see sections below.

---

## Quick checklist (Firebase + Render)

- [ ] Render: disk at `/var/data`, `DATABASE_URL` + `UPLOAD_ROOT` set
- [ ] Render: `API_PUBLIC_URL`, `SITE_URL` (Firebase URL), `JWT_SECRET` set
- [ ] Render: migrations applied, admin seeded once
- [ ] Firebase: `.env.production` with `VITE_API_URL` → Render
- [ ] `npm run firebase-build && firebase deploy --only hosting`
- [ ] Admin save + media upload work (CORS)

Full walkthrough: **[docs/FIREBASE_DEPLOY.md](./docs/FIREBASE_DEPLOY.md)**

---

## 1. Render (API)

See [docs/FIREBASE_DEPLOY.md](./docs/FIREBASE_DEPLOY.md#step-1--render-backend-first) or use `render.yaml` Blueprint.

| Setting | Value |
|---------|--------|
| Build Command | `npm ci && npm run build && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Disk | 1GB+ at `/var/data` |

```env
DATABASE_URL=file:/var/data/prod.db
UPLOAD_ROOT=/var/data
API_PUBLIC_URL=https://book-website-api.onrender.com
SITE_URL=https://your-project.web.app
JWT_SECRET=…
```

---

## 2. Firebase Hosting (frontend)

```bash
cp .env.production.example .env.production
npm run firebase-build
firebase deploy --only hosting
```

See [docs/FIREBASE_DEPLOY.md](./docs/FIREBASE_DEPLOY.md#step-2--firebase-frontend).

---

## 3. Local development

**Terminal 1 — API**

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

**Terminal 2 — Frontend**

```bash
cp .env.production.example .env.local
# VITE_API_URL=http://localhost:3001/api/v1
npm install
npm run dev
```

---

## 4. Persisting admin (CMS) changes

Admin saves go to the **Render API database** (Postgres on Neon/Supabase in production) — not Firebase Hosting.

| What | Where | Survives redeploy if… |
|------|-------|------------------------|
| CMS content | Postgres (`DATABASE_URL`) | DB provider snapshots / backups |
| Uploads | Cloudinary (or Render disk if `STORAGE_PROVIDER=local`) | Cloudinary account / disk mounted |
| Frontend static files | Firebase Hosting | Redeploy replaces build only |
| Live first-paint CMS | `GET /api/v1/content/bootstrap` on Render | API + DB healthy (no Firebase redeploy needed) |

Visitors load fresh CMS data via API prefetch on each visit. Firebase only needs redeploy when you change frontend code or want to refresh the baked `index.html` snapshot.

**Backups:** Postgres provider tools, or `cd server && npm run backup:db` / `POST /api/v1/admin/backup` for SQLite dev.

**Full CMS bootstrap guide:** [docs/FIREBASE_DEPLOY.md](./docs/FIREBASE_DEPLOY.md#cms-content-on-first-paint-no-cloud-functions-required)

---

## 5. Alternative: Vercel frontend

Same Render API. Use `npm run vercel-build` and set `SITE_URL` on Render to your Vercel URL.

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://your-api.onrender.com/api/v1` |
| `VITE_ADMIN_PASSWORD` | admin seed password |

---

## 6. Other

- **AWS / GitLab CI:** [docs/AWS_CICD.md](./docs/AWS_CICD.md)
- **Docker Compose:** `docker-compose.yml` at repo root
