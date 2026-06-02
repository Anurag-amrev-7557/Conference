# Deploy: Firebase Hosting + Render

**Recommended production setup** for this repo.

| Component | Platform | Root |
|-----------|----------|------|
| React SPA | **Firebase Hosting** | repository root (`dist/`) |
| Express API + SQLite + uploads | **Render Web Service** | `server/` |

```text
https://your-project.web.app     → Firebase Hosting (frontend)
https://book-website-api.onrender.com  → Render (API)
  ├── /api/v1/*                  → JSON API + admin
  ├── /media/*                   → hero video, logos, CMS uploads
  └── /health                    → uptime checks
```

---

## Step 1 — Render (backend) first

Deploy the API **before** the frontend so you have a live `API_PUBLIC_URL`.

### Option A: Blueprint

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect this repo (`render.yaml` at root)

### Option B: Manual Web Service

| Setting | Value |
|---------|--------|
| Root Directory | `server` |
| Build Command | `npm ci && npm run build && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

### Persistent disk (required)

Attach a disk **1 GB+** mounted at **`/var/data`**.

### Environment variables (Render)

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | long random string |
| `DATABASE_URL` | `file:/var/data/prod.db` |
| `UPLOAD_ROOT` | `/var/data` |
| `API_PUBLIC_URL` | `https://book-website-api.onrender.com` |
| `SITE_URL` | `https://your-project.web.app` (Firebase URL — update after step 2) |
| `BACKUP_ON_START` | `1` (optional) |
| `RESEND_API_KEY` | from [resend.com](https://resend.com) — required for registration emails |
| `EMAIL_FROM` | `Superhumanly Summit <notifications@yourdomain.com>` |
| `REGISTRATION_NOTIFY_EMAIL` | fallback admin inbox if not set in Admin CRM |

After you connect a custom Firebase domain, update `SITE_URL` to that URL and redeploy Render.

Optional CORS extras (comma-separated):

```env
ALLOWED_ORIGINS=https://your-project.web.app,https://your-project.firebaseapp.com
ADMIN_ALLOWED_ORIGINS=https://your-project.web.app
```

If omitted, `SITE_URL` is merged into CORS automatically.

### Seed admin (once)

Render Shell or local against prod DB:

```bash
cd server
DATABASE_URL="file:/var/data/prod.db" npm run seed
```

Default admin password is set in `server/src/seed.ts` (change after first login).

### Verify API

```bash
curl https://YOUR-RENDER-URL.onrender.com/health
curl -I https://YOUR-RENDER-URL.onrender.com/media/conference-hero.mp4
```

---

## Step 2 — Firebase (frontend)

### One-time setup

```bash
npm i -g firebase-tools
firebase login
firebase init hosting   # choose existing project, public dir: dist, SPA: yes
```

Or copy `.firebaserc.example` → `.firebaserc` and set your project ID.

### Production env (build time)

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:

```env
VITE_API_URL=https://book-website-api.onrender.com/api/v1
VITE_API_ORIGIN=https://book-website-api.onrender.com
VITE_ADMIN_PASSWORD=your-seed-admin-password
```

### Build & deploy

```bash
npm ci
npm run firebase-build
firebase deploy --only hosting
```

`firebase-build` strips large MP4s from `dist/` — hero video is served from Render `/media/`.

### Custom domain (optional)

Firebase Console → Hosting → Add custom domain → then update Render `SITE_URL` to match.

---

## Step 3 — Wire them together

1. Render `SITE_URL` = your Firebase Hosting URL (or custom domain)
2. Firebase `.env.production` → `VITE_API_URL` / `VITE_API_ORIGIN` = Render URL
3. Redeploy **both** after changing domains

### Smoke test

- [ ] Homepage loads hero video (from Render `/media/`)
- [ ] Admin login at `https://your-site.web.app/admin`
- [ ] Save a change in Conference → Hero → persists after refresh
- [ ] Upload image in Admin → Media → URL is `https://…onrender.com/media/…`
- [ ] Submit test registration → admin inbox receives Approve/Deny email → click updates CRM

---

## Registration email (approve / deny from inbox)

Email runs on **Render only** (Firebase Hosting cannot send mail). Uses [Resend](https://resend.com) over HTTPS.

1. Create a Resend account and verify your sending domain (or use their sandbox for testing).
2. Set Render env: `RESEND_API_KEY`, `EMAIL_FROM`, and optionally `REGISTRATION_NOTIFY_EMAIL`.
3. In **Admin → Registrations → Form copy → Email notifications**, set the admin notification email and enable alerts.

When someone registers, that inbox gets **Approve** / **Deny** buttons. Clicking hits `GET /api/v1/registrations/review?token=…` on Render, updates SQLite status (`confirmed` / `cancelled`), and optionally emails the registrant. Links expire in 7 days.

`API_PUBLIC_URL` must match your live Render URL so review links work.

---

## Local development

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
# set VITE_API_URL=http://localhost:3001/api/v1
npm install
npm run dev
```

---

## Persistence & backups

CMS data lives on Render’s **persistent disk**, not in Firebase Hosting.

- **Backups:** `cd server && npm run backup:db` or `POST /api/v1/admin/backup`
- **Do not** re-run seed on a live DB expecting a reset — seed only creates empty DB content

See [DEPLOY.md](../DEPLOY.md) section “Persisting admin (CMS) changes” for details.

---

## Alternatives

- **Vercel** instead of Firebase for frontend — same Render API; use `npm run vercel-build`
- **AWS / GitLab CI** — [docs/AWS_CICD.md](./AWS_CICD.md)
