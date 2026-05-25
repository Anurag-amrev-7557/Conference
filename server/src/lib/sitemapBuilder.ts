import { SitemapStream, streamToPromise } from 'sitemap';
import { fetchSitemapEntries } from './crawlPolicy';
import { getSiteUrl } from './siteUrl';

export async function buildSitemapXml(): Promise<string> {
  const entries = await fetchSitemapEntries();
  const stream = new SitemapStream({ hostname: getSiteUrl() });

  for (const entry of entries) {
    stream.write({ url: entry.path, lastmod: entry.lastmod });
  }
  stream.end();

  const buffer = await streamToPromise(stream);
  return buffer.toString();
}
