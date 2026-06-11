# Book Website (Superhumanly Playbook)

Marketing site and admin CMS for the Superhumanly Agentic Playbook — React 19 SPA with an Express/Prisma API.

## Stack

| Layer    | Technology                                                |
| -------- | --------------------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind 4, React Router 7              |
| API      | Express, Prisma, PostgreSQL (production)                  |
| Deploy   | Firebase Hosting + Render API (primary), Vercel supported |

## Quick start

```bash
# Frontend
cp .env.example .env.local   # optional for local API override
npm ci
npm run dev                  # http://localhost:5173

# API (separate terminal)
cd server
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD
npm ci
npx prisma migrate dev
ADMIN_PASSWORD='your-secure-password' npm run seed
npm run dev                  # http://localhost:3001
```

## Production deploy

**Primary path:** [docs/FIREBASE_DEPLOY.md](docs/FIREBASE_DEPLOY.md)

1. Deploy the API to Render using `render.yaml` and `server/.env.example`.
2. Set `VITE_API_URL` and `VITE_API_ORIGIN` in `.env.production`.
3. Run `npm run firebase-build` (requires `VITE_API_URL`).
4. `firebase deploy --only hosting`
5. Run `node scripts/smoke-production.mjs` against your live URLs.

**Post-deploy SEO:** Production builds fetch `robots.txt` and `sitemap.xml` from the API into `dist/`. For full slug meta tags, run prerender when the API is reachable:

```bash
VITE_API_URL=https://your-api.onrender.com/api/v1 npm run build
```

CI builds use `PRERENDER_SKIP=1` for speed; schedule a prerendered build after CMS content changes.

## Environment variables

| Variable          | Where          | Required                 |
| ----------------- | -------------- | ------------------------ |
| `VITE_API_URL`    | Frontend build | Yes (production)         |
| `VITE_API_ORIGIN` | Frontend build | Recommended              |
| `JWT_SECRET`      | API            | Yes (production)         |
| `ADMIN_PASSWORD`  | API seed       | Yes (for `npm run seed`) |
| `DATABASE_URL`    | API            | Yes                      |
| `SITE_URL`        | API            | Yes (production)         |

See `.env.example`, `.env.production.example`, and `server/.env.example`.

## Scripts

| Command                    | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Vite dev server with API proxy                      |
| `npm run build`            | Full build + prerender                              |
| `npm run firebase-build`   | Production build for Firebase (strips heavy assets) |
| `npm test`                 | Frontend unit tests (Vitest)                        |
| `npm run smoke:production` | Post-deploy smoke checks                            |
| `cd server && npm test`    | API unit + integration tests                        |

## Security

- Admin auth uses **httpOnly cookies** (not localStorage).
- `JWT_SECRET` must be set in production — the API refuses to start without it.
- Third-party scripts from the CMS require cookie consent and pass a domain allowlist.

## Documentation

- [Firebase + Render deploy](docs/FIREBASE_DEPLOY.md)
- [Docker / local runbook](docs/deployment.md)
- [Admin user guide](docs/ADMIN-USER-GUIDE.md)
