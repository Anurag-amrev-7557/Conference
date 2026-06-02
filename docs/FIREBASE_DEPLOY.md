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

### Free-plan architecture (recommended here)

On Render **Free**, use:

- **Neon Postgres** (or Supabase Postgres) for DB
- **Cloudinary** for media/image uploads

This avoids local disk persistence requirements on Free instances.

### Environment variables (Render)

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | long random string |
| `DATABASE_URL` | `postgresql://...` (Neon pooled URL with SSL) |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |
| `API_PUBLIC_URL` | `https://book-website-api.onrender.com` |
| `SITE_URL` | `https://your-project.web.app` (Firebase URL — update after step 2) |
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
DATABASE_URL="postgresql://..." npm run seed
```

Default admin password is set in `server/src/seed.ts` (change after first login).

### Verify API

```bash
curl https://YOUR-RENDER-URL.onrender.com/health
curl -I https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/<sample-public-id>.jpg
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

`firebase-build` strips large MP4s from `dist/` — CMS image uploads are served by Cloudinary URLs.

### Custom domain (optional)

Firebase Console → Hosting → Add custom domain → then update Render `SITE_URL` to match.

---

## Step 3 — Wire them together

1. Render `SITE_URL` = your Firebase Hosting URL (or custom domain)
2. Firebase `.env.production` → `VITE_API_URL` / `VITE_API_ORIGIN` = Render URL
3. Redeploy **both** after changing domains

## Optional — Keep Render warm (free tier)

Render free web services spin down after ~15 minutes without traffic. This repo includes `.github/workflows/render-keepalive.yml`, which pings the API **every 5 minutes**.

### GitHub Actions (included)

1. Push `main` so the workflow file is on the default branch.
2. Repo → **Actions** → enable workflows if prompted.
3. *(Optional)* Override the default URL:
   - **Settings** → **Secrets and variables** → **Actions**
   - Secret: `RENDER_HEALTHCHECK_URL`
   - Value: `https://YOUR-SERVICE.onrender.com/ping`  
     (use `/ping` for a cheap wake-up; use `/health` if you also want DB checks)

Default ping URL (no secret required): `https://superhumanly-thoughts.onrender.com/ping`

Manual test:

```bash
curl -sS https://superhumanly-thoughts.onrender.com/ping
```

### External cron (backup)

If GitHub schedules are delayed, use [cron-job.org](https://cron-job.org) or UptimeRobot (free):

- URL: `https://superhumanly-thoughts.onrender.com/ping`
- Interval: every **5–10 minutes**

Notes:

- Paid Render plans usually do not sleep; keepalive is mainly for free tier.
- Keepalive reduces cold starts; it is not a formal uptime SLA.

### Smoke test

- [ ] Homepage loads and media assets resolve without 404
- [ ] Admin login at `https://your-site.web.app/admin`
- [ ] Save a change in Conference → Hero → persists after refresh
- [ ] Upload image in Admin → Media → URL is `https://res.cloudinary.com/...`
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

CMS data lives in **Postgres (Neon/Supabase)** and media lives in **Cloudinary**.

- For backups, use your Postgres provider snapshots/export tools.
- Do not re-run seed on a live DB expecting a reset — seed only creates defaults when missing.

See [DEPLOY.md](../DEPLOY.md) section “Persisting admin (CMS) changes” for details.

---

## Alternatives

- **Vercel** instead of Firebase for frontend — same Render API; use `npm run vercel-build`
- **AWS / GitLab CI** — [docs/AWS_CICD.md](./AWS_CICD.md)
