#!/usr/bin/env node
/**
 * Book website production smoke (REL-06).
 * Env: BOOK_API_URL (default http://127.0.0.1:3001), SITE_URL (optional, for absolute checks)
 */
const API = (process.env.BOOK_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
const SITE = (process.env.SITE_URL || 'http://127.0.0.1').replace(/\/$/, '')

const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exit(1)
}
const ok = (msg) => console.log(`OK: ${msg}`)

async function getJson(path) {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) fail(`${path} returned ${res.status}`)
  return res.json()
}

async function main() {
  const health = await getJson('/health')
  if (health.status !== 'healthy') fail('/health status not healthy')
  ok('/health')

  const site = await getJson('/api/v1/content/site')
  if (!site.hero || !site.settings) fail('/content/site missing hero/settings')
  ok('/api/v1/content/site')

  const pathsRes = await getJson('/api/v1/seo/prerender-paths')
  if (!Array.isArray(pathsRes.paths) || !pathsRes.paths.includes('/')) {
    fail('prerender-paths missing /')
  }
  ok('prerender-paths')

  const sitemap = await fetch(`${API}/sitemap.xml`)
  if (!sitemap.ok) fail('sitemap.xml not ok')
  const xml = await sitemap.text()
  if (!xml.includes('<urlset')) fail('sitemap.xml invalid')
  ok('sitemap.xml')

  const robots = await fetch(`${API}/robots.txt`)
  if (!robots.ok) fail('robots.txt not ok')
  const robotsTxt = await robots.text()
  if (!robotsTxt.includes('Sitemap:')) fail('robots.txt missing Sitemap')
  ok('robots.txt')

  const loginRes = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_SEED_PASSWORD || 'Welcome@1234' }),
  })
  const loginJson = await loginRes.json()
  if (!loginRes.ok || !loginJson.token) fail('admin login failed')
  ok('admin login')

  const token = loginJson.token
  const patchRes = await fetch(`${API}/api/v1/admin/content`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      settings: {
        ...site.settings,
        seo: { ...site.settings.seo, title: site.settings.seo?.title || 'Smoke test' },
      },
    }),
  })
  if (!patchRes.ok) fail('admin content PATCH failed')
  ok('admin content PATCH round-trip')

  console.log('\nProduction smoke passed.')
  console.log(`API: ${API}`)
  console.log(`SITE_URL hint: ${SITE}`)
}

main().catch((e) => fail(e.message))
