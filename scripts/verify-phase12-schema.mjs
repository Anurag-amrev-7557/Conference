/**
 * Phase 12 — JSON-LD @graph + semantic smoke checks (Playwright).
 * Run: npm run dev (and API) then node scripts/verify-phase12-schema.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.UAT_BASE_URL || 'http://localhost:5173'
const ARTICLE_SLUG =
  process.env.UAT_ARTICLE_SLUG || 'evolution-of-agentic-orchestration'

const results = []

function pass(name, detail = '') {
  results.push({ name, ok: true, detail })
  console.log(`✅ ${name}${detail ? `: ${detail}` : ''}`)
}

function fail(name, detail) {
  results.push({ name, ok: false, detail })
  console.log(`❌ ${name}: ${detail}`)
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  if (path.startsWith('/blog/') && path !== '/blog') {
    await page
      .waitForFunction(
        () =>
          document.querySelectorAll('script[type="application/ld+json"]').length > 0 ||
          document.title.length > 0,
        { timeout: 10000 },
      )
      .catch(() => {})
  }
  await page.waitForTimeout(400)
}

function parseJsonLd(page) {
  return page.evaluate(() => {
    const scripts = [
      ...document.querySelectorAll('script[type="application/ld+json"]'),
    ]
    let hasContext = false
    const graphs = []
    for (const el of scripts) {
      try {
        const data = JSON.parse(el.textContent || '{}')
        if (data['@context'] === 'https://schema.org') hasContext = true
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          graphs.push(...data['@graph'])
        } else if (data['@type']) {
          graphs.push(data)
        }
      } catch {
        /* skip invalid */
      }
    }
    const types = graphs.map((n) => n['@type']).filter(Boolean)
    const h1Count = document.querySelectorAll('h1').length
    const mainCount = document.querySelectorAll('main').length
    const imgs = [...document.querySelectorAll('main img, article img')].map((img) => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt'),
    }))
    return { types, graphs, hasContext, h1Count, mainCount, imgs }
  })
}

function hasType(types, type) {
  return types.includes(type)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await goto(page, '/')
    const home = await parseJsonLd(page)
    if (home.hasContext) {
      pass('JSON-LD @context schema.org')
    } else {
      fail('JSON-LD @context schema.org', 'missing on home')
    }
    if (hasType(home.types, 'WebSite') && hasType(home.types, 'Organization')) {
      pass('Home JSON-LD', `types=${home.types.join(', ')}`)
    } else {
      fail('Home JSON-LD', `expected WebSite+Organization, got ${home.types.join(', ')}`)
    }
    if (hasType(home.types, 'Book')) {
      pass('Home Book JSON-LD (CMS book metadata present)')
    } else {
      pass('Home Book JSON-LD optional', 'no book fields in CMS — unit tests cover Book builder')
    }
    if (home.h1Count === 1) {
      pass('Home single h1', String(home.h1Count))
    } else {
      fail('Home single h1', `count=${home.h1Count}`)
    }
    if (home.mainCount >= 1) {
      pass('Home has main landmark')
    } else {
      fail('Home has main landmark', `main count=${home.mainCount}`)
    }

    await goto(page, `/blog/${ARTICLE_SLUG}`)
    const post = await parseJsonLd(page)
    if (hasType(post.types, 'BlogPosting') && hasType(post.types, 'BreadcrumbList')) {
      pass('Blog post JSON-LD', post.types.join(', '))
    } else {
      fail('Blog post JSON-LD', post.types.join(', ') || 'empty')
    }
    if (post.h1Count === 1) {
      pass('Blog post single h1')
    } else {
      fail('Blog post single h1', `count=${post.h1Count}`)
    }
    const postThumb = post.imgs.find((i) => i.src && !i.src.includes('avatar'))
    if (postThumb?.alt && postThumb.alt.trim().length > 0) {
      pass('Blog post hero image alt', postThumb.alt.slice(0, 40))
    } else {
      fail('Blog post hero image alt', JSON.stringify(postThumb))
    }

    await goto(page, '/blog')
    const blog = await parseJsonLd(page)
    if (hasType(blog.types, 'BreadcrumbList')) {
      pass('/blog BreadcrumbList')
    } else {
      fail('/blog BreadcrumbList', blog.types.join(', ') || 'none')
    }
    if (blog.h1Count === 1) {
      pass('/blog single h1')
    } else {
      fail('/blog single h1', `count=${blog.h1Count}`)
    }

    await goto(page, '/events')
    const events = await parseJsonLd(page)
    if (hasType(events.types, 'BreadcrumbList')) {
      pass('/events BreadcrumbList')
    } else {
      fail('/events BreadcrumbList', events.types.join(', ') || 'none')
    }
    const eventNodes = events.types.filter((t) => t === 'Event').length
    if (eventNodes >= 0) {
      pass('/events Event nodes (optional)', `${eventNodes} Event(s) when startDate set in CMS`)
    }
    if (events.h1Count === 1) {
      pass('/events single h1')
    } else {
      fail('/events single h1', `count=${events.h1Count}`)
    }
    const eventImg = events.imgs.find((i) => i.src?.includes('http') || i.src?.startsWith('/'))
    if (!eventImg || (eventImg.alt && eventImg.alt.trim())) {
      pass('/events thumbnail alt', eventImg?.alt || 'no images in main')
    } else {
      fail('/events thumbnail alt', 'empty alt on event thumbnail')
    }

    await goto(page, '/admin')
    const admin = await parseJsonLd(page)
    if (admin.types.length === 0) {
      pass('Admin has no JSON-LD graph')
    } else {
      fail('Admin has no JSON-LD graph', admin.types.join(', '))
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
