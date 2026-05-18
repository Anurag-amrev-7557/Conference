---
last_mapped_commit: cbfa5f6b729226efe0f097b832354c6d9c8a8fb5
last_mapped_at: 2026-05-18
---

# Coding Conventions

**Analysis Date:** 2026-05-18

## Naming Patterns

**Files:**
- React components and pages use **PascalCase** filenames: `src/components/ui/Button.tsx`, `src/pages/AdminPage.tsx`, `src/components/admin/BlogManager.tsx`.
- Shared libraries use **camelCase**: `src/lib/api.ts`, `src/lib/websiteData.ts`, `src/lib/utils.ts`, `src/lib/config.ts`.
- Server route modules use **camelCase** with a `Routes` suffix: `server/src/routes/contentRoutes.ts`, `server/src/routes/authRoutes.ts`, `server/src/routes/adminRoutes.ts`.
- Entry points: `src/main.tsx`, `src/App.tsx`, `server/src/index.ts`.

**Functions:**
- **camelCase** for functions and methods (`fetchContent`, `handleLogin`, `safeParse`).
- Event handlers prefixed with `handle`: `handleLogin`, `handleMouseMove` in `src/pages/AdminPage.tsx`.
- React components as **named exports** using `export function ComponentName` or `export const ComponentName: React.FC`.

**Variables:**
- **camelCase** for locals and state (`isAuthenticated`, `previewData`, `API_BASE`).
- **UPPER_SNAKE_CASE** for module-level constants: `JWT_SECRET`, `ALLOWED_ORIGINS` in `server/src/routes/authRoutes.ts` and `server/src/index.ts`.

**Types:**
- **PascalCase** interfaces in `src/lib/websiteData.ts` (`Article`, `AppEvent`, `WebsiteData`) with no `I` prefix.
- Union string literals for constrained fields (e.g. `status: 'Upcoming' | 'Past'`).
- `ButtonProps` extends HTML attributes plus CVA variants in `src/components/ui/Button.tsx`.

## Code Style

**Formatting:**
- No Prettier config; style is enforced indirectly by TypeScript compiler options and ESLint.
- Frontend uses 2-space indentation (observed in `src/` and `eslint.config.js` ecosystem).
- Server uses semicolons and CommonJS `import`/`export` style in `server/src/`.

**Linting:**
- ESLint 9 **flat config** in `eslint.config.js`.
- Extends `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react-hooks` recommended, and `eslint-plugin-react-refresh` (Vite).
- Targets `**/*.{ts,tsx}` with `globals.browser`; `dist` is ignored via `globalIgnores`.
- Run from repo root: `npm run lint` (see root `package.json`).
- No dedicated lint script in `server/package.json`; server TypeScript is checked via `npm run build` in `server/` (`tsc` only).

**TypeScript (frontend — `tsconfig.app.json`):**
- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noEmit` (Vite handles emit).
- `jsx: "react-jsx"`, `moduleResolution: "bundler"`, target ES2023.
- Build gate: `npm run build` runs `tsc -b && vite build`.

**TypeScript (server — `server/tsconfig.json`):**
- `strict: true`, CommonJS modules, `outDir: ./dist`, `rootDir: ./src`.
- No path aliases; imports are relative (`../lib/prisma`).

## Import Organization

**Order (typical frontend file):**
1. React / router / animation libraries (`react`, `react-router-dom`, `framer-motion`).
2. Third-party UI/icons (`lucide-react`, `@radix-ui/react-slot`).
3. Internal components (`../components/...`, `./components/...`).
4. Lib modules (`../lib/api`, `../lib/websiteData`).

**Patterns:**
- No `@/` path alias in `vite.config.ts` or tsconfig; use **relative paths** from `src/`.
- `import type { ... }` used where types are type-only (e.g. `WebsiteDataProvider.tsx`).
- Server routes: Express + relative prisma import (`import prisma from '../lib/prisma'`).

## Component Conventions (frontend)

**Structure:**
- **Functional components only**; no class components.
- Pages in `src/pages/` compose sections and admin UIs.
- Feature folders: `src/components/sections/`, `src/components/admin/`, `src/components/ui/`, `src/components/community/`, `src/components/events/`.
- Global data via **React Context**: `src/components/WebsiteDataProvider.tsx` exposes `useWebsiteData()`.
- Routing in `src/App.tsx` with `react-router-dom` v7 (`BrowserRouter`, nested `/admin/*`).

**UI primitives:**
- shadcn-style pattern: `class-variance-authority` + `cn()` from `src/lib/utils.ts` (`clsx` + `tailwind-merge`).
- `React.forwardRef` for reusable controls (`src/components/ui/Button.tsx`, `Card.tsx`).
- Tailwind utility classes; typography plugin via `@tailwindcss/typography`.
- Heavy animation: GSAP, Framer Motion, React Three Fiber in marketing/hero sections.

**Styling:**
- Tailwind v4 via `@tailwindcss/vite` in `vite.config.ts`.
- CSS variables for theming set at runtime in `ThemeSynchronizer` inside `src/App.tsx` (`--color-accent`, fonts, radius).

## API & Server Conventions

**Route layout (`server/src/index.ts`):**
- Base prefix `/api/v1/` with routers mounted at:
  - `/api/v1/content` → `contentRoutes`
  - `/api/v1/auth` → `authRoutes`
  - `/api/v1/admin` → `adminRoutes` (JWT middleware on all routes)
- Health check: `GET /health` (no version prefix).

**Handler pattern:**
- Express `Router()` per domain file; async route handlers with **try/catch**.
- JSON responses: `res.json({ ... })` on success; `res.status(4xx|5xx).json({ error: '...' })` on failure.
- Prisma access through singleton `server/src/lib/prisma.ts`.
- JSON columns stored as strings in DB; parsed with local `safeParse` helpers in `server/src/routes/contentRoutes.ts`.

**Auth:**
- Admin login: `POST /api/v1/auth/login` with bcrypt + JWT (`server/src/routes/authRoutes.ts`).
- Protected admin routes use `authenticateAdmin` middleware checking `Authorization: Bearer <token>` in `server/src/routes/adminRoutes.ts`.

**Frontend API client (`src/lib/api.ts`):**
- Single `api` object with async methods; `fetch` to `VITE_API_URL` or dev/prod defaults.
- On failure: `if (!res.ok) throw new Error('...')` with optional `data.error` from login.
- Admin calls pass `Authorization: Bearer ${token}` header.

## Error Handling

**Server:**
- Catch blocks return generic 500 messages; some routes log with `console.error` (e.g. content fetch in `contentRoutes.ts`).
- Auth failures return **401** with `{ error: string }`; no thrown errors to Express error middleware (no central error handler registered).

**Frontend:**
- API layer throws `Error`; UI catches in try/catch and sets local error state (`AdminPage` login).
- `WebsiteDataProvider` logs persistence failures with `console.error` and often keeps optimistic/local state.
- Fallback: if `api.getContent()` fails, provider uses `initialData` from `src/lib/websiteData.ts`.

**Security notes:**
- `JWT_SECRET` and CORS `ALLOWED_ORIGINS` from env in `server/src/index.ts`; helmet + credentials-enabled CORS.
- Frontend `src/lib/config.ts` documents env-based admin password (`VITE_ADMIN_PASSWORD`); avoid hardcoding secrets in new code.

## Logging & Comments

**Logging:**
- `console.log` for server startup (`server/src/index.ts`) and seed success (`server/src/seed.ts`).
- `console.error` for fetch/persistence failures in provider and admin managers.
- No structured logger (pino/winston).

**Comments:**
- Sparse; used for section headers in routes (`// GET /api/v1/content`) and non-obvious merge logic in `WebsiteDataProvider`.
- Block comments in `src/lib/config.ts` for env guidance.

## Function & Module Design

**Exports:**
- Named exports preferred for components and hooks.
- Default export for `App` (`src/App.tsx`) and Express `router` default exports in `server/src/routes/*`.
- UI barrel pattern: export component + variants (`Button`, `buttonVariants`).

**State:**
- Local `useState` / `useEffect` in pages; global site data in context.
- `localStorage` for `adminToken`, preview flags, session keys (`config.admin.sessionKey`).

---

*Convention analysis: 2026-05-18*
*Update when patterns change*
