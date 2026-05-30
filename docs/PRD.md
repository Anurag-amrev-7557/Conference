# Product Requirements Document (PRD)

## Superhumanly Monograph — Book & Summit Marketing Platform

**Version:** 1.0  
**Last updated:** 2026-05-30  
**Repository:** `book website-frontend`  
**Production host:** `monograph.superhumanly.ai`

---

## PROJECT OVERVIEW

- **Project name:** Superhumanly Monograph (working title: *Superhumanly Playbook* / *Agentic AI Summit*)
- **One line description:** A premium marketing website where founders and operators discover Superhumanly’s Agentic AI playbook, explore events and thought leadership, and register for the summit—edited by the team through a built-in CMS without redeploying copy.
- **Primary goal:** Drive **qualified summit registrations and lead capture** (name, email, phone, LinkedIn, role) while clearly positioning the book/playbook as the authority product—so a cold visitor understands the offer and completes registration in one session.

**Brownfield note:** This repo is a **React/Vite + Express/Prisma** monorepo. Conference-first routing is live (`/` = summit, `/home` = book landing). This PRD describes the **intended complete product**; many must-haves are already implemented.

---

## TARGET USER

- **Who is the main user:** Founders, CEOs, and operators at SMB to mid-market companies (roughly 10–500 employees) actively exploring AI automation—not students or generic “tech enthusiasts.” They read LinkedIn, attend executive events, and buy playbooks/frameworks, not courses with homework.
- **What problem are they coming to solve:** “I know AI matters for my business, but I don’t have a practical blueprint to build and deploy agentic automation without hiring a large team or drowning in hype.”
- **What does success look like for them:** They leave with a **clear mental model** of agentic AI for their business, **trust Superhumanly** as the guide, **register for the summit** (or book a demo), and optionally **read blog posts / find an event** to stay engaged—feeling the site is credible enough to share with a co-founder or board member.

---

## PAGES AND STRUCTURE

### Conference Homepage (`/`)

- **Purpose:** Primary conversion surface for the AI summit; establish urgency, credibility, and path to register.
- **Key elements:**
  - Full-viewport **Conference Hero** (date, location, headline, primary CTA → `/register`, optional hero video with reduced-motion fallback)
  - **Speakers** grid with photos, names, titles
  - **Conference video** section (embedded or linked media)
  - **Agenda** (schedule blocks, times, sessions)
  - **Sponsors / social proof** logos
  - Optional embedded **Book showcase** (CMS visibility toggle)
  - Teaser **Blog** and **Events** sections (CMS toggles)
  - **Final CTA** block (summit register vs. waitlist copy from CMS)
  - Global **Navbar** (glass/dark-on-hero) + **Footer**
  - Per-route **SEO** (title, description, OG, JSON-LD where configured)
  - Unpublish behavior: if `settings.conference.published === false`, show **404**

### Book Landing Page (`/home`)

- **Purpose:** Long-form marketing home for the playbook/book; nurture visitors who land on “book” positioning rather than summit-first.
- **Key elements:**
  - **Hero** (tagline, headline + accent, subtitle, primary CTA → lead modal or register)
  - **Book showcase** (cover, abstract, author, ISBN when set)
  - **Who we are** section
  - **Blog** preview section
  - **Events** preview section
  - **Final CTA** + **Footer**
  - **Lead capture modal** (email / playbook waitlist flow)
  - SEO: `WebSite`, `Organization`, `Book` JSON-LD when CMS book fields are populated

### Summit Registration (`/register`)

- **Purpose:** Capture high-intent registrants with a premium, trust-heavy form experience.
- **Key elements:**
  - Dark **book-demo** aesthetic (mesh, glow, wave divider)
  - Left **panel** (event value props, ticket framing from CMS)
  - Right **registration form**: full name, email, phone, LinkedIn URL, designation (role dropdown)
  - Submit → API `ConferenceRegistration` (status `pending`; ticket price in cents stored; **no payment UI in v1**)
  - Success state with **Summit ticket** visual + confirmation copy
  - Marketing telemetry: `form_submit`, `user_identified` via book API proxy
  - Mobile: full-width stack, 44px+ touch targets

### Blog Index (`/blog`)

- **Purpose:** SEO + credibility via thought leadership; funnel to registration.
- **Key elements:**
  - **Catalog hero** (eyebrow, title, lede—CMS `catalogPages.blog`)
  - Article cards (thumbnail, category, excerpt, read time)
  - Filter/category UX
  - CTA toward register or playbook

### Blog Article (`/blog/:slug`)

- **Purpose:** Deep engagement and shareable URLs; support organic search.
- **Key elements:**
  - Article header (title, author, date, category)
  - Rich HTML body (sanitized server-side)
  - Table of contents (sticky on desktop where implemented)
  - Related posts / bottom CTA
  - Per-article SEO: `seoTitle`, `seoDescription`, `ogImage`, `noindex`
  - `BlogPosting` + `BreadcrumbList` JSON-LD
  - Prerendered static HTML for crawlers

### Events Index (`/events`)

- **Purpose:** Show where leaders meet IRL/online; drive event detail views and summit interest.
- **Key elements:**
  - **Catalog hero** (CMS `catalogPages.events`)
  - Event cards (date, host, location, tags, price, status)
  - **Map** view (lat/lng when provided)
  - Link to event detail

### Event Detail (`/events/:id`)

- **Purpose:** Full context for a single event; SEO for event discovery.
- **Key elements:**
  - Event metadata (time, host, location, tags, price, thumbnail)
  - `Event` JSON-LD with ISO dates
  - Per-event SEO overrides
  - Included in **sitemap** and **prerender** when published
  - CTA back to register or related events

### Admin CMS (`/admin/*`)

- **Purpose:** Secure content operations for non-developers; no code deploy for copy/media/SEO changes.
- **Key elements:**
  - **Login** (JWT, bcrypt on server—not client-side password env)
  - **Overview** dashboard
  - **Homepage / Conference** manager (hero, sections, speakers, agenda, sponsors, publish flag)
  - **Page editor** (landing section copy, visibility toggles)
  - **Blog workspace** (CRUD, publish, SEO tab, preview)
  - **Events workspace** (CRUD, map coords, SEO)
  - **Design system** (colors, typography, radius, shadows, custom CSS, live preview)
  - **Media** hub (OG, covers, uploads; OG resized 1200×630)
  - **Site settings** (navigation, footer, social, route SEO, scripts, GSC meta, book metadata)
  - **Registrations** list (conference signups, status, export/admin CRUD)
  - `noindex` on all admin routes; excluded from sitemap

### Marketing Dashboard (`/dashboard`)

- **Purpose:** Placeholder / demo only today—“Automation CRM” mock UI for future marketing analytics integration.
- **Key elements:** Static metrics cards, workflow sidebar—**not wired to live data**. Treat as **nice-to-have / future**, not launch blocker.

### 404 Not Found (`*`)

- **Purpose:** On-brand dead-end recovery.
- **Key elements:** Clear message, link to `/` or `/home`, consistent navbar/footer tokens.

### Redirects

- `/conference` → `/` (canonical summit URL is root).

### Deferred: Community (`/community`)

- UGC feed, posts, votes, comments exist in **Prisma schema** but public route is **not mounted** in `App.tsx`. Restore only if product explicitly wants community; default **noindex** for SEO risk.

---

## FEATURES — MUST HAVE

1. **CMS-driven public content** — Single `GET /api/v1/content` hydrates hero, settings, appearance, articles, events; public pages react to publish/visibility without rebuild for copy changes.
2. **Conference-first homepage** — Premium dark hero (ai4.io-inspired), speakers, agenda, sponsors, register CTAs; admin can publish/unpublish and edit all conference blocks.
3. **Summit registration capture** — Validated form → `ConferenceRegistration` in SQLite; admin **Registrations** view; marketing events on submit.
4. **Book landing + lead capture** — `/home` with book showcase, sections, modal or CTA paths to capture emails/leads.
5. **Blog & events catalogs + detail pages** — Published-only public data; admin CRUD with publish workflow.
6. **Admin authentication** — JWT after server bcrypt login; all `/api/v1/admin/*` protected; session check on load.
7. **SEO & crawlability** — `SITE_URL`-driven canonical/OG; dynamic `sitemap.xml` / `robots.txt`; prerender for key routes; per-route and per-article/event SEO; admin `noindex` for `/admin` and `/dashboard`.
8. **Responsive, accessible chrome** — Mobile nav, skip/focus patterns, reduced-motion on hero video and conference reveals; no horizontal scroll on 320px+.
9. **Design system from CMS** — Accent color, fonts (Instrument Serif + Plus Jakarta Sans), radius/shadows, optional custom CSS and header/footer script injection (sanitized).
10. **Production deploy path** — Docker Compose (Nginx + Vite static + Express API + SQLite volume); documented `JWT_SECRET`, seed, prerender workflow (`docs/deployment.md`).

---

## FEATURES — NICE TO HAVE

1. **Apple-grade UI pass (v1.2)** — Formal design tokens, dark mode parity, shared button/card primitives, lazy Three.js/GSAP only below fold.
2. **Live marketing-backend integration (v1.3)** — Full lead intelligence, webhook proxy hardening, real `/dashboard` metrics.
3. **Online payments for tickets** — Stripe/Razorpay checkout; today `ticketPriceCents` is stored but status stays `pending` without payment gateway.
4. **Community route re-enabled** — Public `/community` with moderation admin; keep `noindex` unless brand approves indexing.
5. **Public user accounts** — Reader profiles, saved articles (out of scope in planning).
6. **RBAC for multiple admin roles** — Single admin user model today.
7. **hreflang / IndexNow / author pages** — v2 SEO enhancements.
8. **SSR / Next.js migration** — Deferred; prerender on Vite SPA is the chosen path.
9. **SERP/social snippet preview in admin** — Planned UX polish (CMS-04).
10. **Dedicated conference ticket pricing section on homepage** — Premium tier cards (CONF-05; partially covered by registration settings).

---

## DESIGN REQUIREMENTS

- **Overall feel:** Premium B2B SaaS + executive summit—confident, dark hero stages, high contrast typography, subtle noise/grain, restrained motion. Conference = **ai4.io-inspired** impact; book landing = cleaner light sections with editorial serif headlines.
- **Color preference:** CMS **primary accent** (Superhumanly brand blue family). Conference: dark navy/black hero with light text and accent CTAs. Book landing: off-white / white surfaces with accent for links and CTAs.
- **Font style:** **Instrument Serif** (display/headings), **Plus Jakarta Sans** (UI/body). Optional **JetBrains Mono** for code in blog only. No third competing display face on marketing UI.
- **Reference sites:**
  - https://ai4.io/ (conference layout, dark hero, social proof density)
  - https://linear.app/ (premium SaaS spacing and typography)
  - https://vercel.com/ (marketing clarity and CTA hierarchy)
- **What to avoid:** Generic Bootstrap look; heavy scroll-jacking / Locomotive; 3D hero on every page; opacity-zero LCP animations; keyword meta stuffing; client-exposed admin or marketing API keys; auto-indexing all community UGC; cluttered nav (>4 primary destinations).

---

## TECHNICAL REQUIREMENTS

- **Authentication needed:**
  - **Public visitors:** No login/signup.
  - **Admin:** Yes — JWT after `POST` login; Bearer on admin API; bcrypt in `Admin` table.
- **Database needed:** Yes — SQLite via Prisma (production volume mounted). Stores: `SiteContent`, `Article`, `Event`, `CommunityPost` / `Comment` / `PostVote` (latent), `ConferenceRegistration`, `Admin`.
- **Payments needed:** No for v1 launch — registration records intent and ticket price in cents; payment gateway is future.
- **Mobile responsive:** Yes — all public routes and admin; 44px touch targets; responsive forms and maps.
- **Integrations:**
  - Book API (`/api/v1`) — required
  - Marketing backend (optional) — telemetry/lead events proxied through book server; no secrets in frontend
  - Google Search Console — verification meta from admin
  - web-vitals — LCP/INP/CLS in production
  - sharp — server-side OG resize (1200×630)
  - Email service — not wired; manual/export from registrations or future marketing stack
  - Google Analytics — via CMS script injection if desired

**Stack:** React 19 + Vite 6 + TypeScript + Tailwind 4 + Express + Prisma + SQLite + Docker/Nginx.

---

## CONTENT

- **Copy:** Hybrid — seed in `server/src/seed.ts` provides defaults; **editors own final copy via admin CMS**. AI should only fill gaps during initial build, then replace with approved brand voice.
- **Images:** Real images preferred for speakers, sponsors, book cover, OG. Placeholders in dev; **Media manager** for production. Hero video optional with poster fallback.
- **Logo:** Text/wordmark + CMS brand name today; provide **SVG/PNG** when brand finalizes.
- **Brand voice:** Direct, founder-to-founder, anti-jargon, emphasis on *shipping agentic systems* not slide decks.

---

## SUCCESS CRITERIA

1. **5-second comprehension:** A first-time visitor on `/` understands it is an **AI summit / Superhumanly event** and sees a single obvious **Register** action without scrolling on mobile.
2. **Registration works end-to-end:** Submit on `/register` creates a row in admin **Registrations**, fires marketing `form_submit`, and shows success UI with no console errors.
3. **CMS round-trip:** Editor changes conference hero in **Admin → Homepage**, saves, refreshes `/`, sees update without a frontend code change.
4. **SEO sanity:** View Source on `/` and a published `/blog/:slug` shows unique title, meta description, canonical, OG; `sitemap.xml` lists published posts and events; `/admin` is `noindex`.
5. **Mobile performance:** No horizontal scroll at 375px; LCP hero text visible on first paint; Core Web Vitals monitored without regression.
6. **Security:** Admin login only via API; `JWT_SECRET` rotated in production; default seed password changed before go-live.
7. **Book path works:** `/home` presents playbook, book metadata, and CTAs; book JSON-LD validates when ISBN/cover provided.
8. **Deploy repeatability:** Another operator can deploy from `docs/deployment.md`, run seed/smoke checks, and re-run prerender after publish.

---

## APPENDIX — IMPLEMENTATION STATUS

| Area | Status in repo |
|------|----------------|
| Conference `/`, register, admin conference | Shipped (v1.5) |
| Book `/home`, blog, events, admin CMS | Shipped (v1.4) |
| SEO/prerender/sitemap | Mostly shipped; some schema items open in `.planning/REQUIREMENTS.md` |
| Payments | Not implemented |
| Community public route | Backend only; route not mounted |
| `/dashboard` | Mock UI |
| v1.2 premium UI | Planned, paused |

---

## HOW TO USE THIS DOCUMENT

- **Lovable / Bolt:** Paste this file (or sections) as the first message before building UI.
- **This repo:** Use as acceptance criteria for gaps (payments, community, dashboard, v1.2 polish)—not a mandate to regenerate the app from scratch.
- **Planning:** Cross-reference `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, and `.planning/ROADMAP.md`.
