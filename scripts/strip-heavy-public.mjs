/**
 * Remove large MP4s from dist/ so Firebase Hosting bandwidth stays low.
 * Hero video is served from the API (/media/conference-hero.mp4).
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const MAX_BYTES = 2 * 1024 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!entry.name.toLowerCase().endsWith('.mp4')) {
      continue;
    }
    const info = await stat(full);
    if (info.size >= MAX_BYTES) {
      await unlink(full);
      console.log(`[strip-heavy-public] removed ${full} (${Math.round(info.size / 1024 / 1024)}MB)`);
    }
  }
}

await walk(distDir);
