import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { publicAssetUrl } from './apiPublicUrl';
import { getMediaUploadDir } from './uploadPaths';

export type MediaFileItem = {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  ext: string;
};

const SAFE_FILENAME = /^[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i;

export function isSafeMediaFilename(name: string): boolean {
  return SAFE_FILENAME.test(name);
}

export async function listMediaFiles(): Promise<MediaFileItem[]> {
  const dir = getMediaUploadDir();
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }

  const items: MediaFileItem[] = [];
  for (const filename of names) {
    if (!isSafeMediaFilename(filename)) continue;
    const path = join(dir, filename);
    try {
      const st = await stat(path);
      if (!st.isFile()) continue;
      items.push({
        filename,
        url: publicAssetUrl(`/media/${filename}`),
        size: st.size,
        createdAt: st.mtime.toISOString(),
        ext: filename.split('.').pop()?.toLowerCase() ?? '',
      });
    } catch {
      // File removed between readdir and stat — skip
    }
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}
