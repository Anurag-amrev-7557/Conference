import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(import.meta.dirname, 'seoRoutes.ts'), 'utf8');

describe('seoRoutes crawl policy (CRAWL-02, CRAWL-03)', () => {
  it('serves sitemap.xml with XML content type and cache header', () => {
    expect(src).toMatch(/router\.get\(['"]\/sitemap\.xml['"]/);
    expect(src).toMatch(/application\/xml/);
    expect(src).toMatch(/max-age=3600/);
  });

  it('serves robots.txt with admin, dashboard, and community disallow', () => {
    expect(src).toMatch(/router\.get\(['"]\/robots\.txt['"]/);
    expect(src).toMatch(/Disallow: \/admin/);
    expect(src).toMatch(/Disallow: \/dashboard/);
    expect(src).toMatch(/Disallow: \/community/);
    expect(src).toMatch(/Sitemap: \$\{sitemapUrl\}/);
  });

  it('exposes prerender-paths for Phase 14', () => {
    expect(src).toMatch(/\/api\/v1\/seo\/prerender-paths/);
    expect(src).toMatch(/listIndexablePaths/);
  });
});
