/**
 * Phase 13 — sitemap.xml + robots.txt smoke checks.
 * Prerequisite: API on :3001; for :5173 proxy, run `npm run dev` too.
 */
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const API_BASE = process.env.UAT_API_URL || 'http://localhost:3001'
const FRONT_BASE = process.env.UAT_BASE_URL || 'http://localhost:5173'
const USE_FRONT = process.env.UAT_USE_VITE_PROXY === '1'
const BASE = USE_FRONT ? FRONT_BASE : API_BASE

const results = []

function pass(name, detail = '') {
  results.push({ ok: true, name, detail })
  console.log(`✅ ${name}${detail ? `: ${detail}` : ''}`)
}

function fail(name, detail) {
  results.push({ ok: false, name, detail })
  console.log(`❌ ${name}: ${detail}`)
}

async function main() {
  if (existsSync(resolve(repoRoot, 'public/sitemap.xml'))) {
    fail('static public/sitemap.xml removed', 'file still exists')
  } else {
    pass('static public/sitemap.xml removed')
  }
  if (existsSync(resolve(repoRoot, 'public/robots.txt'))) {
    fail('static public/robots.txt removed', 'file still exists')
  } else {
    pass('static public/robots.txt removed')
  }

  let origin
  try {
    const siteRes = await fetch(`${API_BASE}/api/v1/content/site`)
    const site = await siteRes.json()
    origin = site.siteUrl?.replace(/\/+$/, '')
    if (!origin) throw new Error('no siteUrl from API')
  } catch (e) {
    console.error('API not reachable at', API_BASE, e)
    process.exit(2)
  }

  const sitemapRes = await fetch(`${BASE}/sitemap.xml`)
  if (!sitemapRes.ok) {
    fail('GET /sitemap.xml', String(sitemapRes.status))
    process.exit(1)
  }
  const xml = await sitemapRes.text()
  if (!xml.includes('<urlset') || !xml.includes('<loc>')) {
    fail('sitemap XML shape', 'missing urlset/loc')
  } else {
    pass('sitemap XML valid')
  }
  if (!xml.includes(`${origin}/`)) {
    fail('sitemap uses SITE_URL', `expected ${origin}`)
  } else {
    pass('sitemap SITE_URL origin', origin)
  }
  if (xml.includes('/community') || xml.includes('/admin')) {
    fail('sitemap exclusions', 'found community or admin URL')
  } else {
    pass('sitemap excludes community/admin')
  }
  const slugMatch = xml.match(/<loc>[^<]*\/blog\/[^<]+<\/loc>/)
  if (slugMatch) {
    pass('sitemap includes blog slug', slugMatch[0].slice(0, 60))
  } else {
    pass('sitemap blog slugs', 'none in DB (optional)')
  }
  if (xml.includes('<lastmod>')) {
    pass('sitemap has lastmod')
  } else {
    fail('sitemap lastmod', 'missing')
  }

  const robotsRes = await fetch(`${BASE}/robots.txt`)
  const robots = await robotsRes.text()
  if (!robots.includes('Disallow: /admin')) fail('robots /admin', robots)
  else pass('robots Disallow /admin')
  if (!robots.includes('Disallow: /dashboard')) fail('robots /dashboard', robots)
  else pass('robots Disallow /dashboard')
  if (!robots.includes('Disallow: /community')) fail('robots /community', robots)
  else pass('robots Disallow /community')
  if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
    fail('robots Sitemap line', robots)
  } else {
    pass('robots dynamic Sitemap URL')
  }

  const pathsRes = await fetch(`${API_BASE}/api/v1/seo/prerender-paths`)
  const { paths } = await pathsRes.json()
  if (!Array.isArray(paths) || paths.length < 3) {
    fail('prerender-paths', JSON.stringify(paths))
  } else {
    pass('prerender-paths', `${paths.length} paths`)
  }
  if (paths.includes('/community')) {
    fail('prerender-paths excludes community', paths.join(', '))
  } else {
    pass('prerender-paths excludes /community')
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n--- ${results.length - failed.length}/${results.length} checks passed ---`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
