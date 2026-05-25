import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isAllowedOgMime } from './adminRoutes';

const src = readFileSync(resolve(import.meta.dirname, 'adminRoutes.ts'), 'utf8');

describe('admin og-image route (CMS-05)', () => {
  it('registers POST /og-image behind authenticateAdmin', () => {
    expect(src).toMatch(/router\.use\(authenticateAdmin\)/);
    expect(src).toMatch(/router\.post\(['"]\/og-image['"]/);
    expect(src).toMatch(/ogUpload\.single\(['"]file['"]\)/);
  });

  it('writes under repo-root public/og', () => {
    expect(src).toMatch(/public\/og/);
    expect(src).toMatch(/1200,\s*630/);
  });
});

describe('isAllowedOgMime', () => {
  it('allows jpeg, png, webp only', () => {
    expect(isAllowedOgMime('image/jpeg')).toBe(true);
    expect(isAllowedOgMime('image/png')).toBe(true);
    expect(isAllowedOgMime('image/webp')).toBe(true);
    expect(isAllowedOgMime('image/gif')).toBe(false);
    expect(isAllowedOgMime('application/pdf')).toBe(false);
  });
});
