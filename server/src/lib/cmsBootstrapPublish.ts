import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { buildCmsBootstrapPayload } from './publicSiteContent';

let publishTimer: ReturnType<typeof setTimeout> | null = null;
let publishInFlight: Promise<void> | null = null;

function resolvePublishPath(): string | null {
  const custom = process.env.CMS_BOOTSTRAP_PUBLISH_PATH?.trim();
  if (custom) return resolve(custom);
  return null;
}

async function postDeployWebhook(): Promise<void> {
  const webhookUrl = process.env.CMS_BOOTSTRAP_DEPLOY_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const res = await fetch(webhookUrl, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`deploy webhook ${res.status}`);
  }
}

async function postPublishUrl(json: string): Promise<void> {
  const publishUrl = process.env.CMS_BOOTSTRAP_PUBLISH_URL?.trim();
  if (!publishUrl) return;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = process.env.CMS_BOOTSTRAP_PUBLISH_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(publishUrl, { method: 'POST', headers, body: json });
  if (!res.ok) {
    throw new Error(`publish url ${res.status}`);
  }
}

/** Regenerate bootstrap JSON and optionally notify CDN / deploy hooks. */
export async function publishCmsBootstrap(): Promise<void> {
  if (publishInFlight) return publishInFlight;

  const run = async () => {
    const payload = await buildCmsBootstrapPayload();
    const json = `${JSON.stringify(payload, null, 2)}\n`;

    const publishPath = resolvePublishPath();
    if (publishPath) {
      await mkdir(dirname(publishPath), { recursive: true });
      await writeFile(publishPath, json, 'utf8');
      console.log(`[cms-bootstrap] Wrote ${publishPath} (v${payload.contentVersion})`);
    }

    await Promise.allSettled([postPublishUrl(json), postDeployWebhook()]);
  };

  publishInFlight = run()
    .catch((err) => {
      console.error('[cms-bootstrap] publish failed:', err instanceof Error ? err.message : err);
    })
    .finally(() => {
      publishInFlight = null;
    });

  return publishInFlight;
}

/** Debounced publish after admin mutations (coalesces rapid saves). */
export function scheduleCmsBootstrapPublish(): void {
  if (publishTimer) clearTimeout(publishTimer);
  publishTimer = setTimeout(() => {
    publishTimer = null;
    void publishCmsBootstrap();
  }, 500);
}
