# Phase 17: Token Foundation & Theme Architecture - Context

**Gathered:** 2026-05-19  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver semantic light/dark design tokens, FOUC-free theme boot (`index.html` + `next-themes`), CMS `colorScheme` (light | dark | system) persisted via API/Prisma and editable in Design System admin, extraction of CMS→CSS bridge into `applyAppearance` (from today’s `ThemeSynchronizer` logic), and refactor of **global** surfaces/utilities (`index.css`, shared `@utility` layer, app shell) to use semantic tokens — **without** page-by-page section migration (Phase 19) or prerender body/theme parity (Phase 22 / INFRA-*).
</domain>

<decisions>
## Implementation Decisions

### Apple-minimal neutrals (semantic palette)
- **D-17-01:** Light canvas: **cool Apple-style** (~`#F5F5F7` family), not warm `#F2F2F0` / current `off`.
- **D-17-02:** Dark deepest canvas / stepped surfaces: **Apple-like ~`#1C1C1E`** ladder (not true black, not Material `#121212`).
- **D-17-03:** Light mode primary text: **softer near-black** (~`#1D1D1F` Apple-style), not pure `#000000`.
- **D-17-04:** Light mode separators / elevation: **hairline-first** (low-opacity borders), **minimal shadow** ladder — not stronger shadow-forward depth.

### Theme precedence (CMS vs visitor vs OS)
- **D-17-05 (Claude discretion — user chose “you decide” on live-site rule):** **Hybrid** — If CMS `colorScheme` is **`light` or `dark`**, that mode is **authoritative** on the published site (visitor toggle in Phase 21 does not override). If CMS is **`system`**, the **visitor’s saved preference** (once Phase 21 ships) may override OS-only behavior for that browser; until the toggle exists, `system` follows OS only.
- **D-17-06:** If CMS sets **`dark`**, the site **forces dark UI** even when the visitor’s OS is in light mode.
- **D-17-07 (Claude discretion — user chose “You decide” on preview):** **Admin LivePreview / Design System preview is isolated** from the visitor’s `localStorage` theme — preview reflects editor + preview controls only, not public-site visitor storage.
- **D-17-08:** Default `appearance.colorScheme` for new / migrated records: **`system`**.

### CMS + dark mode strategy
- **D-17-09:** Dark **neutral** surfaces (bg/surface/border): **fixed semantic ladder in CSS** — CMS does **not** derive neutrals from `primaryColor`.
- **D-17-10:** Accent pair on dark: **keep existing `darkenColor` → `--color-accent2`** algorithm for now; no new `--color-accent-on-dark` token in Phase 17.
- **D-17-11:** `settings.customCss`: **apply as-is in both themes** — editor owns breakage/contrast in custom CSS.
- **D-17-12:** Per-neutral **dark palette pickers** in admin: **deferred** (per research / user).

### First paint / FOUC
- **D-17-13:** **View Source / prerender theme-accurate body** is **Phase 22 (INFRA-*)** only — Phase 17 delivers **client** inline boot + `next-themes` + static CSS defaults.
- **D-17-14:** Default static **`html`/`body` background** before any JS: **must match** the new cool light canvas (no white flash against final light theme).
- **D-17-15:** Add **`<meta name="color-scheme" content="light dark">`** in Phase 17 (native controls / scrollbars).
- **D-17-16:** `next-themes` uses **`attribute="class"`** on **`<html>`** (Tailwind `dark:` standard).

### Glass, blur, overlays (token direction)
- **D-17-17:** **Nav / `glass-pill` in dark:** keep frosted feel but **stronger hairline border** + **lower blur radius** than light.
- **D-17-18:** **Content cards in dark:** **frosted glass** on cards (user explicitly chose decorative glass on cards; keep blur **subtle** to limit INP cost).
- **D-17-19:** **Modal overlays in dark:** **dim scrim** (e.g. black ~60%) + modal panel on **`--surface`** (or equivalent semantic), not heavy full-screen blur scrim.
- **D-17-20:** **Performance:** at most **one** `backdrop-filter` layer **above the fold** (nav **or** hero glass — not both stacked).

### Phase 17 vs later phases
- **D-17-21:** **Yes** — Phase 17 updates **global app shell** (`App.tsx` root wrapper, `body` / root backgrounds) to **semantic** tokens (e.g. replace `bg-off` with token-backed surface).
- **D-17-22:** Phase 17 scope for components: **shared `@theme` / `@utility` / global CSS + theme plumbing only**; **do not** migrate individual marketing sections/pages for polish — that is **Phase 19**. Exception: unavoidable wiring for theme provider / `html` class / root div is in scope.
- **D-17-23:** **Yes** — `DesignSystemManager` (or equivalent) exposes **`colorScheme`** editing in **Phase 17** (DSM-05).
- **D-17-24:** **Yes** — **Prisma + content API** persist `appearance.colorScheme` with default **`system`** in Phase 17.

### Claude's Discretion (explicit)
- **Live-site precedence (D-17-05):** User selected “you decide”; locked as **hybrid** above.
- **Admin preview isolation (D-17-07):** User selected “You decide”; locked as **isolated from visitor `localStorage`**.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning / requirements
- `/Users/anuragverma/Downloads/book website-frontend/.planning/ROADMAP.md` — Phase 17 goal, success criteria, requirements DSM-01–DSM-07
- `/Users/anuragverma/Downloads/book website-frontend/.planning/REQUIREMENTS.md` — v1.2 DSM-* acceptance text
- `/Users/anuragverma/Downloads/book website-frontend/.planning/research/SUMMARY.md` — synthesized stack and phase order
- `/Users/anuragverma/Downloads/book website-frontend/.planning/research/STACK.md` — `next-themes`, inline boot, Tailwind v4 patterns
- `/Users/anuragverma/Downloads/book website-frontend/.planning/research/ARCHITECTURE.md` — three-tier token stack, `applyAppearance` extraction
- `/Users/anuragverma/Downloads/book website-frontend/.planning/research/PITFALLS.md` — FOUC, accent-only mapping, prerender drift
- `/Users/anuragverma/Downloads/book website-frontend/.planning/phases/BOOK-16-premium-ui-core-web-vitals/16-CONTEXT.md` — Phase 16 locked tokens, fonts, reduced-motion (do not regress)

### Implementation touchpoints
- `/Users/anuragverma/Downloads/book website-frontend/src/App.tsx` — `ThemeSynchronizer` (source for `applyAppearance` extraction)
- `/Users/anuragverma/Downloads/book website-frontend/src/index.css` — `@theme`, `@utility`, global `body`
- `/Users/anuragverma/Downloads/book website-frontend/index.html` — shell for inline boot + meta
- `/Users/anuragverma/Downloads/book website-frontend/src/main.tsx` — provider mount order for `next-themes`
- `/Users/anuragverma/Downloads/book website-frontend/src/lib/websiteData.ts` — `SiteAppearance` (extend with `colorScheme`)
- `/Users/anuragverma/Downloads/book website-frontend/src/components/admin/DesignSystemManager.tsx` — admin UI for appearance (add `colorScheme`)
- `/Users/anuragverma/Downloads/book website-frontend/server/prisma/schema.prisma` — JSON / appearance storage for persisted `colorScheme`
- `/Users/anuragverma/Downloads/book website-frontend/server/src/routes/contentRoutes.ts` (and related admin/content handlers) — API shape for appearance updates

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`ThemeSynchronizer` in `src/App.tsx`:** Maps `appearance` + `settings` to `--color-accent`, `--color-accent2`, fonts, `--radius-global`, `--shadow-dynamic`, and injects `customCss`. Becomes thin wrapper calling shared `applyAppearance`.
- **Phase 16 tokens in `src/index.css`:** `--space-*`, `--radius-*`, `--text-*`, shadows — extend with **semantic** `--color-bg`, `--color-surface`, text/border tokens and `dark` variants rather than replacing spacing scale.
- **`SiteAppearance` in `src/lib/websiteData.ts`:** Single type to extend with `colorScheme: 'light' | 'dark' | 'system'`.
- **Default appearance object** in same file: add `colorScheme: 'system'` for dev/seed consistency.

### Established patterns
- Runtime theming via **`document.documentElement.style.setProperty`** — keep for CMS brand knobs; semantic neutrals live in CSS with `dark` class / `light-dark()`.
- **Tailwind v4 `@theme` + utilities** — new semantic colors should register as theme colors so components can use `bg-bg`, `text-foreground`, etc., aligned with decisions.

### Integration points
- **`WebsiteDataProvider`:** Supplies `data` / preview; `applyAppearance` runs whenever `appearance` changes (including preview).
- **`main.tsx` / root render:** Wrap with `ThemeProvider` from `next-themes` **outside** or **around** router as required by library; ensure single `html` document.
- **Prerender (`scripts/prerender.mjs`):** **Out of scope for Phase 17** per D-17-13 — do not block Phase 17 on it; Phase 22 aligns static HTML.

</code_context>

<specifics>
## Specific Ideas

- User wants **Apple-minimal** direction: cool neutrals, stepped dark `#1C1C1E`, restrained hairline elevation.
- User wants **frosted dark cards** even though research warned against glass everywhere — implement with **subtle** blur and **D-17-20** cap to mitigate INP.

</specifics>

<deferred>
## Deferred Ideas

- **Prerender / View Source theme parity** — Phase 22 (INFRA-01, INFRA-02).
- **Per-section / per-page visual polish** — Phase 19 (PAGE-*, TYPE-03/04, IMG-*).
- **Visitor-facing theme toggle UI** — Phase 21 (COMP-06) when CMS is `system`; precedence rules in D-17-05 already reserve behavior.
- **CMS full dark palette pickers** — deferred explicitly (D-17-12).

</deferred>

---

*Phase: 17-Token Foundation & Theme Architecture*  
*Context gathered: 2026-05-19*
