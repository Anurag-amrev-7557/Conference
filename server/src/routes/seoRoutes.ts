import { Router, Request, Response } from 'express';
import { buildSitemapXml } from '../lib/sitemapBuilder';
import { listIndexablePaths } from '../lib/crawlPolicy';
import { getSiteUrl } from '../lib/siteUrl';

const router = Router();

const CACHE_CONTROL = 'public, max-age=3600';

router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const xml = await buildSitemapXml();
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', CACHE_CONTROL);
    res.send(xml);
  } catch (err) {
    console.error('[seo] sitemap.xml error', err);
    res.status(500).send('Sitemap generation failed');
  }
});

router.get('/robots.txt', (_req: Request, res: Response) => {
  const sitemapUrl = `${getSiteUrl()}/sitemap.xml`;
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /community',
    '',
    `Sitemap: ${sitemapUrl}`,
    '',
  ].join('\n');

  res.type('text/plain; charset=utf-8');
  res.set('Cache-Control', CACHE_CONTROL);
  res.send(body);
});

router.get('/api/v1/seo/prerender-paths', async (_req: Request, res: Response) => {
  try {
    const paths = await listIndexablePaths();
    res.json({ paths });
  } catch (err) {
    console.error('[seo] prerender-paths error', err);
    res.status(500).json({ error: 'Failed to list prerender paths' });
  }
});

export default router;
