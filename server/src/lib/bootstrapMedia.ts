import { copyFile, mkdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { getMediaUploadDir } from './uploadPaths';

const BOOTSTRAP_ASSETS = [
  {
    destName: 'conference-hero.mp4',
    sources: [
      () => process.env.BOOTSTRAP_HERO_VIDEO_PATH?.trim(),
      () => resolve(process.cwd(), '../public/Conference Video 1920x1080.mp4'),
      () => resolve(process.cwd(), 'public/Conference Video 1920x1080.mp4'),
    ],
  },
  {
    destName: 'superhumanly-logo.png',
    sources: [
      () => process.env.BOOTSTRAP_LOGO_PATH?.trim(),
      () => resolve(process.cwd(), '../public/Superhumanly AI Logo.png'),
      () => resolve(process.cwd(), 'public/Superhumanly AI Logo.png'),
    ],
  },
] as const;

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveSource(getters: Array<() => string | undefined>): Promise<string | null> {
  for (const get of getters) {
    const path = get()?.trim();
    if (path && (await fileExists(path))) {
      return path;
    }
  }
  return null;
}

/** Copy bundled marketing assets into persistent media storage (survives redeploy when UPLOAD_ROOT is mounted). */
export async function bootstrapMediaAssets(): Promise<void> {
  const mediaDir = getMediaUploadDir();
  await mkdir(mediaDir, { recursive: true });

  for (const asset of BOOTSTRAP_ASSETS) {
    const dest = join(mediaDir, asset.destName);
    if (await fileExists(dest)) {
      continue;
    }

    const source = await resolveSource([...asset.sources]);
    if (!source) {
      console.warn(`[bootstrap] Skipped ${asset.destName} — no source file found`);
      continue;
    }

    await copyFile(source, dest);
    console.log(`[bootstrap] Copied ${asset.destName} → ${dest}`);
  }
}
