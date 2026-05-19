/**
 * Automated Phase 11 head-tag verification (Playwright).
 * Run: node scripts/verify-phase11-head.mjs
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.UAT_BASE_URL || 'http://localhost:5173'
const ARTICLE_SLUG =
  process.env.UAT_ARTICLE_SLUG || 'evolution-of-agentic-orchestration'

async function getHead(page) {
  return page.evaluate(() => {
    const meta = (name, attr = 'name') => {
      const els = [...document.querySelectorAll(`meta[${attr}="${name}"]`)]
      return els.at(-1)?.getAttribute('content') ?? null
    }
    const prop = (name) => meta(name, 'property')
    const canonicals = [...document.querySelectorAll('link[rel="canonical"]')].map(
      (el) => el.getAttribute('href'),
    )
    return {
      title: document.title,
      description: meta('description'),
      robots: meta('robots'),
      canonicals,
      ogType: prop('og:type'),
      ogTitle: prop('og:title'),
      ogDescription: prop('og:description'),
      ogImage: prop('og:image'),
      ogUrl: prop('og:url'),
      twitterCard: meta('twitter:card'),
      twitterTitle: meta('twitter:title'),
      twitterDescription: meta('twitter:description'),
      twitterImage: meta('twitter:image'),
      twitterUrl: meta('twitter:url'),
      gsc: meta('google-site-verification'),
    }
  })
}

async function goto(page, path) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    if (path.includes('/blog/') && path !== '/blog') {
      await page.waitForFunction(
        () => document.querySelectorAll('title').length === 1 && document.title.length > 0,
        { timeout: 10000 },
      ).catch(() => {})
    }
    await page.waitForTimeout(500)
}

const results = []

function pass(name, detail = '') {
  results.push({ name, ok: true, detail })
  console.log(`✅ ${name}${detail ? `: ${detail}` : ''}`)
}

function fail(name, detail) {
  results.push({ name, ok: false, detail })
  console.log(`❌ ${name}: ${detail}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    // Test 1: Unique titles
    await goto(page, '/')
    const home = await getHead(page)
    await goto(page, '/blog')
    const blog = await getHead(page)
    await goto(page, `/blog/${ARTICLE_SLUG}`)
    const post = await getHead(page)
    await goto(page, '/events')
    const events = await getHead(page)
    await goto(page, '/community')
    const community = await getHead(page)

    if (home.title && blog.title && home.title !== blog.title) {
      pass('Test 1 — unique titles / vs /blog', `${home.title.slice(0, 40)}… ≠ ${blog.title.slice(0, 40)}…`)
    } else {
      fail('Test 1 — unique titles / vs /blog', `home="${home.title}" blog="${blog.title}"`)
    }
    if (home.description && blog.description && home.description !== blog.description) {
      pass('Test 1 — unique descriptions / vs /blog')
    } else {
      fail('Test 1 — unique descriptions / vs /blog', `same or empty`)
    }
    if (post.title.includes('Evolution') || post.title.includes('Agentic')) {
      pass('Test 1 — article title', post.title)
    } else {
      fail('Test 1 — article title', post.title)
    }
    if (events.title && events.title !== home.title) {
      pass('Test 1 — /events unique title', events.title)
    } else {
      fail('Test 1 — /events unique title', events.title)
    }
    if (community.robots === 'noindex,nofollow') {
      pass('Test 1 — /community noindex', community.robots)
    } else {
      fail('Test 1 — /community noindex', String(community.robots))
    }

    // Test 2: Canonical
    const canonChecks = [
      ['/', home, `${BASE}/`],
      ['/blog', blog, `${BASE}/blog`],
      [`/blog/${ARTICLE_SLUG}`, post, `${BASE}/blog/${ARTICLE_SLUG}`],
      ['/events', events, `${BASE}/events`],
    ]
    for (const [path, head, expected] of canonChecks) {
      if (head.canonicals.length === 1 && head.canonicals[0] === expected) {
        pass(`Test 2 — canonical ${path}`, expected)
      } else {
        fail(`Test 2 — canonical ${path}`, `got ${JSON.stringify(head.canonicals)} expected ${expected}`)
      }
    }

    // Test 3: OG
    await goto(page, '/')
    const homeOg = await getHead(page)
    await goto(page, `/blog/${ARTICLE_SLUG}`)
    const postOg = await getHead(page)
    if (homeOg.ogType === 'website' && homeOg.ogTitle && homeOg.ogImage?.match(/^https?:\/\//)) {
      pass('Test 3 — home OG set', `type=${homeOg.ogType}`)
    } else {
      fail('Test 3 — home OG set', JSON.stringify({ ogType: homeOg.ogType, ogImage: homeOg.ogImage }))
    }
    if (postOg.ogType === 'article') {
      pass('Test 3 — article og:type', postOg.ogType)
    } else {
      fail('Test 3 — article og:type', String(postOg.ogType))
    }

    // Test 4: Twitter mirrors OG
    if (
      postOg.twitterCard === 'summary_large_image' &&
      postOg.twitterTitle === postOg.ogTitle &&
      postOg.twitterDescription === postOg.ogDescription &&
      postOg.twitterImage === postOg.ogImage
    ) {
      pass('Test 4 — Twitter mirrors OG on article')
    } else {
      fail('Test 4 — Twitter mirrors OG', JSON.stringify({
        card: postOg.twitterCard,
        titleMatch: postOg.twitterTitle === postOg.ogTitle,
        imageMatch: postOg.twitterImage === postOg.ogImage,
      }))
    }

    // Test 5: Admin noindex
    for (const path of ['/admin', '/admin/settings', '/dashboard']) {
      await goto(page, path)
      const head = await getHead(page)
      if (head.robots === 'noindex,nofollow' && !head.gsc) {
        pass(`Test 5 — noindex ${path}`)
      } else {
        fail(`Test 5 — noindex ${path}`, `robots=${head.robots} gsc=${head.gsc}`)
      }
    }

    // Test 6: index.html shell
    const indexHtml = readFileSync(resolve(__dirname, '../index.html'), 'utf8')
    const hasShellOg = /property=["']og:/.test(indexHtml) || /name=["']twitter:/.test(indexHtml)
    const hasShellCanon = /rel=["']canonical["']/.test(indexHtml)
    if (!hasShellOg && !hasShellCanon) {
      pass('Test 6 — index.html shell has no OG/Twitter/canonical')
    } else {
      fail('Test 6 — index.html shell', 'found og/twitter/canonical in static HTML')
    }
    await goto(page, '/blog')
    const afterHydrate = await getHead(page)
    if (afterHydrate.canonicals.length === 1) {
      pass('Test 6 — single canonical after hydration')
    } else {
      fail('Test 6 — single canonical after hydration', String(afterHydrate.canonicals.length))
    }

    // Test 7: Invalid slug noindex before redirect (D-09)
    const invalidCapture = { robots: null, canonical: null }
    page.on('framenavigated', async () => {
      if (!page.url().includes('invalid-slug-xyz')) return
      const head = await getHead(page)
      if (head.robots === 'noindex,nofollow') invalidCapture.robots = head.robots
      if (head.canonicals.at(-1)?.endsWith('/blog')) {
        invalidCapture.canonical = head.canonicals.at(-1)
      }
    })
    await goto(page, '/blog/invalid-slug-xyz')
    await page.waitForURL('**/blog', { timeout: 8000 }).catch(() => {})
    if (invalidCapture.robots === 'noindex,nofollow' && invalidCapture.canonical?.endsWith('/blog')) {
      pass('Test 7 — invalid slug noindex + /blog canonical before redirect')
    } else {
      fail('Test 7 — invalid slug', JSON.stringify(invalidCapture))
    }

    // Test 8: SPA navigation duplicates
    await goto(page, '/')
    let head = await getHead(page)
    let count = head.canonicals.length
    await page.click('a[href="/blog"], a[href^="/blog"]')
    await page.waitForTimeout(800)
    head = await getHead(page)
    if (head.canonicals.length === 1 && head.title !== home.title) {
      pass('Test 8 — SPA nav updates title without duplicate canonical')
    } else {
      fail('Test 8 — SPA nav', JSON.stringify({ canonicals: head.canonicals.length, title: head.title }))
    }

    // Test 9: Admin help copy (source file grep)
    const blogSrc = readFileSync(resolve(__dirname, '../src/components/admin/BlogManager.tsx'), 'utf8')
    const settingsSrc = readFileSync(resolve(__dirname, '../src/components/admin/SettingsManager.tsx'), 'utf8')
    if (
      blogSrc.includes('live site') &&
      !blogSrc.includes('after Phase 11') &&
      settingsSrc.includes('aria-describedby="settings-og-help"') &&
      settingsSrc.includes('aria-describedby="settings-gsc-help"')
    ) {
      pass('Test 9 — admin SEO help copy present')
    } else {
      fail('Test 9 — admin help copy', 'missing expected strings')
    }
  } finally {
    await browser.close()
  }

  const failed = results.filter((r) => !r.ok)
  console.log(`\n--- ${results.length - failed.length}/${results.length} checks passed ---`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
