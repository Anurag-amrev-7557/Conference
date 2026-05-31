import { join } from 'node:path';

/**
 * Root for uploaded files. On Render, mount a persistent disk at /var/data and set UPLOAD_ROOT=/var/data.
 * Default: {cwd}/public (server/public when Render rootDir is server/).
 */
export function getUploadRoot(): string {
  const custom = process.env.UPLOAD_ROOT?.trim();
  if (custom) {
    return custom.replace(/\/+$/, '');
  }
  return join(process.cwd(), 'public');
}

export function getMediaUploadDir(): string {
  return join(getUploadRoot(), 'media');
}

export function getOgUploadDir(): string {
  return join(getUploadRoot(), 'og');
}
