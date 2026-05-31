# Conference hero video

Drop the client’s hero file here as **`conference-hero.mp4`** (H.264, muted, 15–30s loop recommended).

Or set in `.env`:

```env
VITE_CONFERENCE_HERO_VIDEO_URL=https://your-cdn.com/conference-hero.mp4
VITE_CONFERENCE_HERO_POSTER_URL=https://your-cdn.com/conference-hero-poster.jpg
```

Until a custom file is added, the site uses a stock conference loop from the CDN defined in `src/components/sections/conference/conferenceHeroMedia.ts`.
