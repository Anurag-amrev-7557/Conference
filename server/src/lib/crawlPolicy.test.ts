import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildSitemapEntriesFromRows,
  entriesToAbsoluteUrls,
  isArticleIndexable,
  listIndexablePathsFromEntries,
} from './crawlPolicy';
import { absoluteUrl, getSiteUrl } from './siteUrl';

describe('isArticleIndexable', () => {
  it('includes published indexable articles', () => {
    expect(isArticleIndexable({ isPublished: true, noindex: false })).toBe(true);
  });

  it('excludes noindex and drafts', () => {
    expect(isArticleIndexable({ isPublished: true, noindex: true })).toBe(false);
    expect(isArticleIndexable({ isPublished: false, noindex: false })).toBe(false);
  });
});

describe('buildSitemapEntriesFromRows', () => {
  const siteDate = new Date('2026-05-01T00:00:00.000Z');

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    process.env.SITE_URL = 'https://example.com';
  });

  it('includes static hubs and indexable article slugs only', () => {
    const entries = buildSitemapEntriesFromRows({
      siteUpdatedAt: siteDate,
      articles: [
        {
          slug: 'live-post',
          updatedAt: new Date('2026-05-10T00:00:00.000Z'),
          isPublished: true,
          noindex: false,
        },
        {
          slug: 'hidden',
          updatedAt: new Date('2026-05-11T00:00:00.000Z'),
          isPublished: true,
          noindex: true,
        },
      ],
      events: [
        {
          id: 'evt-1',
          updatedAt: new Date('2026-05-09T00:00:00.000Z'),
          isPublished: true,
          noindex: false,
        },
      ],
    });

    const paths = listIndexablePathsFromEntries(entries);
    expect(paths).toEqual(['/', '/blog', '/blog/live-post', '/events', '/events/evt-1']);
    expect(paths).not.toContain('/community');
    expect(paths).not.toContain('/admin');
  });

  it('prerender paths match sitemap paths', () => {
    const entries = buildSitemapEntriesFromRows({
      siteUpdatedAt: siteDate,
      articles: [],
      events: [],
    });
    expect(listIndexablePathsFromEntries(entries)).toEqual(entries.map((e) => e.path));
  });

  it('uses SITE_URL for absolute locs', () => {
    const entries = buildSitemapEntriesFromRows({
      siteUpdatedAt: siteDate,
      articles: [
        {
          slug: 'x',
          updatedAt: siteDate,
          isPublished: true,
          noindex: false,
        },
      ],
      events: [],
    });
    const urls = entriesToAbsoluteUrls(entries);
    expect(urls[0]).toBe(`${getSiteUrl()}/`);
    expect(urls).toContain(absoluteUrl('/blog/x'));
  });
});
