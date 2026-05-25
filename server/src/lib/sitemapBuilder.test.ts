import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./crawlPolicy', () => ({
  fetchSitemapEntries: vi.fn(),
}));

vi.mock('./siteUrl', () => ({
  getSiteUrl: () => 'https://example.com',
}));

import { fetchSitemapEntries } from './crawlPolicy';
import { buildSitemapXml } from './sitemapBuilder';

describe('buildSitemapXml', () => {
  beforeEach(() => {
    vi.mocked(fetchSitemapEntries).mockResolvedValue([
      { path: '/', lastmod: '2026-05-01T00:00:00.000Z' },
      { path: '/blog/my-post', lastmod: '2026-05-10T12:00:00.000Z' },
    ]);
  });

  it('returns urlset XML with hostname and lastmod', async () => {
    const xml = await buildSitemapXml();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('https://example.com/');
    expect(xml).toContain('https://example.com/blog/my-post');
    expect(xml).toContain('<lastmod>2026-05-10T12:00:00.000Z</lastmod>');
  });
});
