import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { isSafeMediaFilename, listMediaFiles } from './listMediaFiles';

describe('listMediaFiles', () => {
  const env = process.env;
  let uploadRoot: string;

  beforeEach(async () => {
    uploadRoot = join(tmpdir(), `media-test-${randomUUID()}`);
    process.env = { ...env, UPLOAD_ROOT: uploadRoot, NODE_ENV: 'development', PORT: '3001' };
    delete process.env.API_PUBLIC_URL;
    await mkdir(join(uploadRoot, 'media'), { recursive: true });
  });

  afterEach(async () => {
    process.env = env;
    await rm(uploadRoot, { recursive: true, force: true });
  });

  it('rejects unsafe filenames', () => {
    expect(isSafeMediaFilename('../evil.jpg')).toBe(false);
    expect(isSafeMediaFilename('notes.txt')).toBe(false);
    expect(isSafeMediaFilename(`${randomUUID()}.jpg`)).toBe(true);
  });

  it('lists safe files with metadata', async () => {
    const id = randomUUID();
    const filename = `${id}.png`;
    await writeFile(join(uploadRoot, 'media', filename), Buffer.from('x'));

    const items = await listMediaFiles();
    expect(items).toHaveLength(1);
    expect(items[0].filename).toBe(filename);
    expect(items[0].ext).toBe('png');
    expect(items[0].url).toContain(`/media/${filename}`);
    expect(items[0].size).toBeGreaterThan(0);
    expect(items[0].createdAt).toBeTruthy();
  });

  it('ignores non-image and dotfiles', async () => {
    await writeFile(join(uploadRoot, 'media', 'readme.txt'), 'x');
    await writeFile(join(uploadRoot, 'media', '.DS_Store'), 'x');
    expect(await listMediaFiles()).toHaveLength(0);
  });
});
