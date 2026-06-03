# Keep Render API awake (free tier)

Render **free** web services sleep after **~15 minutes** with no HTTP traffic. When asleep, the first request can take **30–90 seconds** (cold start).

GitHub Actions alone is **not reliable** for this: scheduled workflows on free GitHub can be delayed by hours or skipped.

## Recommended: UptimeRobot (free, 24/7)

1. Sign up at [uptimerobot.com](https://uptimerobot.com) (free plan).
2. **Add New Monitor** → type **HTTP(s)**.
3. **URL:** `https://superhumanly-thoughts.onrender.com/ping`
4. **Monitoring interval:** 5 minutes.
5. Save.

No code changes required. This is the most dependable free option.

## Alternative: cron-job.org

1. [cron-job.org](https://cron-job.org) → create account.
2. Create cron job:
   - URL: `https://superhumanly-thoughts.onrender.com/ping`
   - Schedule: every 5 minutes
3. Enable the job.

## What this repo already does

| Layer | Behavior |
|-------|----------|
| **GitHub Actions** | `.github/workflows/render-keepalive.yml` pings `/health` every 5 min — best-effort only. |
| **Frontend** | `ApiKeepAlive` pings `/ping` every 8 min while someone has the site open. |
| **Endpoints** | `GET /ping` (light), `GET /health` (includes DB check). |

## Permanent fix (no sleep)

Upgrade the Render service to a **paid** plan (Starter+). Paid instances do not spin down on idle.

## Verify

```bash
curl -sS https://superhumanly-thoughts.onrender.com/ping
```

Expect: `{"ok":true,...}`

After setting up UptimeRobot, leave the site closed for 20+ minutes, then run `curl` again — response should be fast (under a few seconds), not a long timeout.
