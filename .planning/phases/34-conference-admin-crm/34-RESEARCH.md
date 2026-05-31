# Phase 34 Research (lean)

**Today:** All conference copy lives in section component files (`ConferenceHero`, `SPEAKERS`, `SCHEDULE`, `FAQ_ITEMS`, etc.).

**Reuse:** `settings` JSON already PATCHes via `updateSettings`; extend with `settings.conference` like `catalogPages` / `sections` (Phase 29). No new Prisma column.

**Admin:** Single `ConferenceManager` — mirror `SettingsManager` catalog tab pattern (one save, one form object).

**Public:** `useWebsiteData().data.settings.conference ?? defaultConferenceContent` in each section (or pass from `ConferencePage`).

**Model (minimal):**

```typescript
settings.conference?: {
  hero: { badge, title, titleAccent, lede, dateLabel, locationLabel, primaryCtaLabel, secondaryCtaLabel, videoUrl?, posterUrl?, metrics[] };
  sections: { socialProof?, speakers?, agenda?, faq? }; // eyebrow, title, lede
  speakers: { id, name, title, company, image }[];
  agenda: { id, label, sessions: { id, time, title, speaker, track }[] }[];
  faq: { id, question, answer }[];
  logos: { id, name }[];
}
```
