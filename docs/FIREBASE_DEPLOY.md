# Deploy: Firebase Hosting + Render

**Recommended production setup** for this repo.

| Component | Platform | Root |
|-----------|----------|------|
| React SPA | **Firebase Hosting** | repository root (`dist/`) |
| Express API + SQLite + uploads | **Render Web Service** | `server/` |

```text
https://your-project.web.app     → Firebase Hosting (frontend)
https://book-website-api.onrender.com  → Render (API)
  ├── /api/v1/content/bootstrap  → live CMS snapshot (first-paint source)
  ├── /api/v1/*                  → JSON API + admin
  ├── /media/*                   → hero video, logos, CMS uploads
  └── /health                    → uptime checks
```

---

## CMS content on first paint (no Cloud Functions required)

Firebase **Spark (free)** cannot deploy Cloud Functions in production. You do **not** need them for CMS: the live API on Render is the source of truth.

### How it works

| Layer | What | When it updates |
|-------|------|-----------------|
| **Live API** | `GET /api/v1/content/bootstrap` | Immediately on every admin save |
| **Client prefetch** | `main.tsx` fetches bootstrap before React mounts | Every page load |
| **Build snapshot** | `public/cms-bootstrap.json` baked into `index.html` | Each `firebase-build` / `npm run build` |
| **Session cache** | `sessionStorage` (30 min) | After a successful API fetch |

```text
Page load
  ├─ inline HTML bootstrap (from last firebase-build)     ← fast offline fallback
  ├─ prefetch GET /api/v1/content/bootstrap (Render)      ← wins if contentVersion is newer
  └─ React renders once with merged CMS data              ← no hardcoded marketing flash
```

After an admin saves in the CMS, the **next visitor** gets fresh content from Render without redeploying Firebase. No full-page loader.

### Render env (recommended — zero config)

No extra variables are required. Ensure these are already set:

| Variable | Purpose |
|----------|---------|
| `API_PUBLIC_URL` | Bootstrap + media URLs |
| `SITE_URL` | CORS allows your Firebase / custom domain |
| `DATABASE_URL` | CMS persistence |

Verify bootstrap is live:

```bash
curl -s https://YOUR-RENDER-URL.onrender.com/api/v1/content/bootstrap | head -c 200
# Should return JSON with "contentVersion", "settings", "articles", …
```

### Optional Render env (advanced publish hooks)

Set these **only** if you want side effects after admin saves (debounced ~500 ms). The default Firebase + Render setup does **not** need them.

| Variable | Platform | Purpose |
|----------|----------|---------|
| `CMS_BOOTSTRAP_PUBLISH_PATH` | Co-located static | Write `cms-bootstrap.json` to disk (not used with Firebase Hosting) |
| `CMS_BOOTSTRAP_PUBLISH_URL` | Custom webhook | `POST` full bootstrap JSON + optional `Authorization: Bearer` |
| `CMS_BOOTSTRAP_PUBLISH_TOKEN` | With `PUBLISH_URL` | Shared secret for the webhook |
| `CMS_BOOTSTRAP_DEPLOY_WEBHOOK_URL` | Vercel / CI | Trigger a static rebuild after CMS mutations |

**Firebase Spark:** skip `PUBLISH_PATH` and Cloud Functions. Live prefetch from Render is sufficient.

**Vercel frontend:** optional `CMS_BOOTSTRAP_DEPLOY_WEBHOOK_URL` → Vercel deploy hook refreshes the baked `index.html` snapshot (slower than API prefetch, ~minutes).

Admin mutations that trigger publish (when hooks are set): `PATCH /content`, blog/event CRUD, revision restore, import.

### Local dev

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — frontend (predev regenerates public/cms-bootstrap.json)
npm run dev
```

`vite.config.ts` injects `public/cms-bootstrap.json` into `index.html`. With the API running, prefetch uses the live bootstrap automatically.

### Why not Firebase Cloud Functions?

| Plan | Cloud Functions |
|------|-----------------|
| **Spark (free)** | No production deploy |
| **Blaze (pay-as-you-go)** | Allowed; generous free tier, billing account required |

For this stack, **Render already serves live bootstrap** — upgrading Firebase to Blaze only makes sense if you need same-origin `/cms-bootstrap.json` without calling Render (unusual with `VITE_API_URL`).

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
| `SITE_URL` | `https://superhumanly-thoughts.com` (canonical custom domain) |
| `RESEND_API_KEY` | from [resend.com](https://resend.com) — required for registration emails |
| `EMAIL_FROM` | `Superhumanly Summit <notifications@yourdomain.com>` |
| `REGISTRATION_NOTIFY_EMAIL` | fallback admin inbox if not set in Admin CRM |

After you connect a custom Firebase domain, update `SITE_URL` to that URL and redeploy Render.

Optional CORS extras (comma-separated):

```env
ALLOWED_ORIGINS=https://superhumanly-thoughts.com,https://www.superhumanly-thoughts.com,https://superhumanly-thoughts.web.app,https://superhumanly-thoughts.firebaseapp.com
ADMIN_ALLOWED_ORIGINS=https://superhumanly-thoughts.com,https://www.superhumanly-thoughts.com,https://superhumanly-thoughts.web.app
```

If omitted, production CORS still merges `SITE_URL`, its `www` pair, and the Firebase default hosts automatically.

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

Render free services sleep after ~15 minutes without traffic. **GitHub Actions alone is not enough** (schedules are often delayed).

**Do this:** set up **UptimeRobot** (5-minute HTTP monitor on `/ping`). Full steps: **[docs/RENDER_KEEPALIVE.md](./RENDER_KEEPALIVE.md)**.

This repo also includes GitHub Actions + frontend `ApiKeepAlive` as extras—not a substitute for UptimeRobot.

### Smoke test

- [ ] Homepage loads and media assets resolve without 404
- [ ] `curl …/api/v1/content/bootstrap` returns JSON with your CMS `contentVersion`
- [ ] Homepage shows CMS copy on first load (no flash of old hardcoded text)
- [ ] Admin login at `https://your-site.web.app/admin`
- [ ] Save a change in Conference → Hero → persists after refresh
- [ ] Hard-refresh homepage in a private window → change visible without `firebase deploy`
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
