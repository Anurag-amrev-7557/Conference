/**
 * Post-build prerender — bakes Helmet head tags into static HTML (CRAWL-04, CRAWL-05).
 *
 * Prerequisites:
 *   1. `npm run build` completed (dist/ exists)
 *   2. API running with seeded DB (default http://localhost:3001)
 *
 * Env:
 *   PRERENDER_API_URL — API origin (default http://localhost:3001)
 *   PRERENDER_PREVIEW_PORT — preview port (default 4173)
 *   PRERENDER_SKIP — set to 1 to no-op (CI without API)
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const distDir = resolve(repoRoot, 'dist')
const shellFile = resolve(distDir, '.prerender-shell.html')

const API_URL = (process.env.PRERENDER_API_URL || 'http://localhost:3001').replace(/\/$/, '')
const PREVIEW_PORT = Number(process.env.PRERENDER_PREVIEW_PORT || 4173)
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`

function distFileForPath(routePath) {
  const normalized = routePath === '/' ? '/' : `/${routePath.replace(/^\/+|\/+$/g, '')}`
  if (normalized === '/') return resolve(distDir, 'index.html')
  const segments = normalized.slice(1)
  return resolve(distDir, segments, 'index.html')
}

async function fetchPrerenderPaths() {
  const res = await fetch(`${API_URL}/api/v1/seo/prerender-paths`)
  if (!res.ok) throw new Error(`prerender-paths ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data.paths)) throw new Error('invalid prerender-paths payload')
  return data.paths
}

function waitForPreviewReady(url, timeoutMs = 60000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url)
        if (res.ok || res.status === 404) return resolve()
      } catch {
        /* retry */
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Preview server not ready at ${url}`))
        return
      }
      setTimeout(tick, 300)
    }
    tick()
  })
}

function startPreview() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env } },
    )
    let settled = false
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString()
      if (text.includes('error') && !settled) {
        settled = true
        reject(new Error(text))
      }
    })
    child.stdout?.on('data', () => {})
    waitForPreviewReady(PREVIEW_URL)
      .then(() => {
        if (!settled) {
          settled = true
          resolve(child)
        }
      })
      .catch((err) => {
        child.kill()
        reject(err)
      })
  })
}

async function ensureSpaShellBackup() {
  if (!existsSync(shellFile)) {
    await copyFile(resolve(distDir, 'index.html'), shellFile)
  }
}

async function restoreSpaShell() {
  await copyFile(shellFile, resolve(distDir, 'index.html'))
}

async function prepareDistForPath(routePath) {
  if (/^\/blog\/[^/]+$/.test(routePath)) {
    const blogIndex = resolve(distDir, 'blog', 'index.html')
    if (existsSync(blogIndex)) await unlink(blogIndex)
  }
  if (/^\/events\/[^/]+$/.test(routePath)) {
    const eventsIndex = resolve(distDir, 'events', 'index.html')
    if (existsSync(eventsIndex)) await unlink(eventsIndex)
  }
  if (routePath !== '/') {
    const outFile = distFileForPath(routePath)
    if (existsSync(outFile)) await unlink(outFile)
  }
  await restoreSpaShell()
}

async function prerenderPath(page, path) {
  await prepareDistForPath(path)
  const url = `${PREVIEW_URL}${path === '/' ? '/' : path}`
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

  const slugSegment = path.match(/^\/blog\/([^/]+)$/)?.[1]

  await page.waitForFunction(
    (expectedPath, blogSlug) => {
      const title = document.title?.trim() || ''
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || ''
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
      const hostTitle = title === window.location.host || title === '127.0.0.1'
      if (title.length < 4 || hostTitle || !ogTitle || ogTitle.length < 4) return false
      if (blogSlug) {
        return canonical.includes(blogSlug) && window.location.pathname.includes(blogSlug)
      }
      if (expectedPath !== '/') {
        return canonical.includes(expectedPath) || window.location.pathname === expectedPath
      }
      return ogTitle.length > 10 && (canonical.length > 0 || document.querySelectorAll('link[rel="canonical"]').length > 0)
    },
    { timeout: 60000 },
    path,
    slugSegment ?? null,
  )

  const html = await page.content()
  const outFile = distFileForPath(path)
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, html, 'utf8')
  return outFile
}

async function main() {
  if (process.env.PRERENDER_SKIP === '1') {
    console.log('[prerender] PRERENDER_SKIP=1 — skipping')
    return
  }

  console.log('[prerender] Fetching paths from', API_URL)
  const paths = await fetchPrerenderPaths()
  if (paths.includes('/community')) {
    throw new Error('refusing to prerender /community (D-15)')
  }
  // Deepest routes first — otherwise dist/blog/index.html shadows /blog/:slug
  paths.sort((a, b) => b.split('/').filter(Boolean).length - a.split('/').filter(Boolean).length)
  console.log('[prerender] Paths:', paths.join(', '))

  await ensureSpaShellBackup()

  console.log('[prerender] Starting vite preview on', PREVIEW_URL)
  const preview = await startPreview()

  const browser = await puppeteer.launch({ headless: true })

  try {
    for (const path of paths) {
      const page = await browser.newPage()
      const out = await prerenderPath(page, path)
      await page.close()
      console.log(`[prerender] ${path} → ${out.replace(repoRoot + '/', '')}`)
    }
  } finally {
    await browser.close()
    preview.kill('SIGTERM')
  }

  console.log('[prerender] Done', paths.length, 'routes')
}

main().catch((err) => {
  console.error('[prerender] Failed:', err.message)
  process.exit(1)
})
