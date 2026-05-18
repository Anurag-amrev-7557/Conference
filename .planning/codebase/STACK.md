---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
---

# Technology Stack

**Analysis Date:** 2026-05-18

## Languages

**Primary:**
- TypeScript ~5.9 (root `package.json`) — all React UI in `src/`
- TypeScript ^5.4 (server `package.json`) — Express API in `server/src/`

**Secondary:**
- JavaScript — `eslint.config.js`, Vite/ESLint config only
- SQL (Prisma schema) — data models in `server/prisma/schema.prisma`

## Runtime

**Environment:**
- Node.js — required for Vite dev server, frontend build, and Express API (no `engines` field in either `package.json`; server targets `@types/node` ^20, root `@types/node` ^24)
- Modern browsers — SPA served from Vite `dist/`; uses DOM APIs, `localStorage`, and `fetch`

**Package Manager:**
- npm — separate lockfiles at repo root and under `server/`
- Lockfiles: `package-lock.json`, `server/package-lock.json`

## Frameworks

**Core (frontend):**
- React ^19.2 — UI in `src/` (`src/main.tsx`, `src/App.tsx`)
- React Router DOM ^7.14 — client routing (`src/App.tsx`)
- Vite ^8.0 — dev server and production bundler (`vite.config.ts`)

**Core (backend):**
- Express ^4.19 — HTTP API (`server/src/index.ts`)
- Prisma ^5.12 — ORM and migrations (`server/prisma/schema.prisma`, `server/src/lib/prisma.ts`)

**Testing:**
- None configured — no Jest, Vitest, or Playwright in either `package.json`

**Build/Dev:**
- Vite + `@vitejs/plugin-react` ^6 — React HMR and build (`vite.config.ts`)
- TypeScript project references — root `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`
- `tsc -b && vite build` — frontend production build (`package.json` scripts)
- `tsc` → `server/dist/` — backend compile (`server/package.json`, `server/tsconfig.json`)
- `ts-node-dev` — backend hot reload in dev (`server/package.json` `dev` script)
- ESLint ^9 flat config — `eslint.config.js` with `typescript-eslint`, React hooks/refresh plugins

## Key Dependencies

**Critical (frontend):**
- `react` / `react-dom` ^19.2 — component tree
- `react-router-dom` ^7.14 — `/`, `/events`, `/blog`, `/admin`, etc.
- `tailwindcss` ^4.2 + `@tailwindcss/vite` — styling via `src/index.css` (`@import "tailwindcss"`)
- `@tailwindcss/typography` — prose styles for blog markdown

**Critical (backend):**
- `@prisma/client` ^5.12 — database access (`server/src/lib/prisma.ts`)
- `jsonwebtoken` ^9.0 — admin JWT after login (`server/src/routes/authRoutes.ts`, `adminRoutes.ts`)
- `bcrypt` ^5.1 — password hashing for `Admin` model (`server/src/routes/authRoutes.ts`)
- `helmet` ^8.1 + `cors` ^2.8 — security headers and origin allowlist (`server/src/index.ts`)
- `dotenv` ^16.4 — loads `server/.env` at startup

**Presentation / UX (frontend):**
- `framer-motion` ^12, `gsap` ^3 + `@gsap/react` — animations
- `three` ^0.183 + `@react-three/fiber` / `drei` / `postprocessing` — 3D hero/visuals
- `leaflet` ^1.9 + `react-leaflet` ^5 — events map (`src/components/events/EventsMap.tsx`)
- `react-markdown` ^10 — blog post rendering
- `lucide-react`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` — UI primitives

## Configuration

**Environment:**
- Root `.env.example` — documents client (`VITE_*`) and server (`PORT`, `ALLOWED_ORIGINS`, `JWT_SECRET`) variables
- Vite exposes only `VITE_*` to the browser (`src/lib/api.ts`, `src/lib/marketing.ts`, `src/lib/config.ts`)
- Server reads `process.env` in `server/src/index.ts` and route files

**Build:**
- `vite.config.ts` — React + Tailwind Vite plugins
- `tsconfig.app.json` — strict ES2023 + React JSX for `src/`
- `tsconfig.node.json` — Vite config typing
- `server/tsconfig.json` — CommonJS emit to `server/dist/`, `rootDir` `server/src`
- `eslint.config.js` — lint `**/*.{ts,tsx}`, ignore `dist/`

**Database:**
- SQLite file datasource — `provider = "sqlite"`, `url = "file:./dev.db"` in `server/prisma/schema.prisma`
- Prisma scripts: `prisma:generate`, `prisma:migrate`, `prisma:studio`, `seed` in `server/package.json`

## Platform Requirements

**Development:**
- Node.js + npm on macOS/Linux/Windows
- Two processes typical: `npm run dev` (Vite, default port 5173) and `cd server && npm run dev` (Express on `PORT` default 3001)
- Run `server` Prisma migrate/generate and `seed` before admin login works
- CORS allowlist must include Vite origin (`ALLOWED_ORIGINS` in `.env.example`)

**Production:**
- Frontend: static assets from `dist/` (Vite build); canonical URLs in `index.html` point to `monograph.superhumanly.ai`
- API: compiled `server/dist/index.js` via `npm start`; production API base hardcoded in `src/lib/api.ts` as `https://api.superhumanly-thoughts.com/book/api/v1` when `import.meta.env.PROD`
- SQLite file DB suitable for single-node deploy; not configured for PostgreSQL/MySQL in schema
- No `.github/workflows` or Docker files in repo — deployment platform not codified

---

*Stack analysis: 2026-05-18*
*Update after major dependency changes*
