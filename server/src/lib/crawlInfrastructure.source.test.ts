import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(import.meta.dirname, '../../..');

describe('crawl infrastructure wiring (D-09–D-11)', () => {
  it('does not ship static public sitemap or robots', () => {
    expect(existsSync(resolve(repoRoot, 'public/sitemap.xml'))).toBe(false);
    expect(existsSync(resolve(repoRoot, 'public/robots.txt'))).toBe(false);
  });

  it('nginx proxies sitemap and robots to API', () => {
    const nginx = readFileSync(resolve(repoRoot, 'nginx.conf'), 'utf8');
    expect(nginx).toMatch(/location = \/sitemap\.xml/);
    expect(nginx).toMatch(/location = \/robots\.txt/);
    expect(nginx).toMatch(/proxy_pass http:\/\/book_api/);
  });

  it('vite dev server proxies crawl files to API', () => {
    const vite = readFileSync(resolve(repoRoot, 'vite.config.ts'), 'utf8');
    expect(vite).toMatch(/['"]\/sitemap\.xml['"]/);
    expect(vite).toMatch(/['"]\/robots\.txt['"]/);
    expect(vite).toMatch(/localhost:3001/);
  });
});
