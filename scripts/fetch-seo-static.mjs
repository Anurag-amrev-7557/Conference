/**
 * Writes robots.txt and sitemap.xml into dist/ from the live API so static hosts
 * serve crawler files before SPA fallbacks (Vercel, Firebase).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const distDir = resolve(root, 'dist');

function resolveApiOrigin() {
  const fromEnv =
    process.env.VITE_API_ORIGIN?.trim() ||
    process.env.PRERENDER_API_URL?.trim() ||
    process.env.VITE_API_URL?.trim()?.replace(/\/api\/v1\/?$/, '');
  return fromEnv?.replace(/\/$/, '') || null;
}

async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }
  return res.text();
}

const origin = resolveApiOrigin();
if (!origin) {
  if (process.env.SEO_STATIC_OPTIONAL === '1') {
    console.log('[fetch-seo-static] skipped — no API origin configured');
    process.exit(0);
  }
  console.error('[fetch-seo-static] Set VITE_API_ORIGIN or PRERENDER_API_URL');
  process.exit(1);
}

await mkdir(distDir, { recursive: true });

for (const file of ['robots.txt', 'sitemap.xml']) {
  const body = await fetchText(`${origin}/${file}`);
  await writeFile(resolve(distDir, file), body, 'utf8');
  console.log(`[fetch-seo-static] wrote dist/${file}`);
}
