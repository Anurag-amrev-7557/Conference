/**
 * Phase 14 — baked meta in prerendered HTML (no JS execution).
 * Prerequisite: `npm run build` (with API up) or existing dist/ from prerender.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const distDir = resolve(repoRoot, 'dist')

const API_BASE = process.env.UAT_API_URL || 'http://localhost:3001'

const results = []

function pass(name, detail = '') {
  results.push({ ok: true, name, detail })
  console.log(`✅ ${name}${detail ? `: ${detail}` : ''}`)
}

function fail(name, detail) {
  results.push({ ok: false, name, detail })
  console.log(`❌ ${name}: ${detail}`)
}

function distFileForPath(routePath) {
  if (routePath === '/') return resolve(distDir, 'index.html')
  const segments = routePath.replace(/^\/+|\/+$/g, '')
  return resolve(distDir, segments, 'index.html')
}

function assertBakedMeta(html, label, path) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)

  if (!titleMatch?.[1]?.trim() || titleMatch[1].trim().length < 4) {
    fail(`${label} title`, 'missing or too short')
    return false
  }
  if (!descMatch?.[1]?.trim()) {
    fail(`${label} description`, 'missing')
    return false
  }
  if (!canonicalMatch?.[1]?.trim()) {
    fail(`${label} canonical`, 'missing')
    return false
  }
  if (!ogTitleMatch?.[1]?.trim()) {
    fail(`${label} og:title`, 'missing')
    return false
  }
  const slug = path.match(/^\/blog\/([^/]+)$/)?.[1]
  if (slug && !canonicalMatch[1].includes(slug)) {
    fail(`${label} canonical slug`, `expected ${slug} in ${canonicalMatch[1]}`)
    return false
  }
  pass(`${label} baked meta`, titleMatch[1].trim().slice(0, 48))
  return true
}

async function main() {
  if (!existsSync(distDir)) {
    console.error('dist/ missing — run npm run build with API on :3001')
    process.exit(2)
  }

  let paths
  try {
    const res = await fetch(`${API_BASE}/api/v1/seo/prerender-paths`)
    const data = await res.json()
    paths = data.paths
    if (!Array.isArray(paths)) throw new Error('invalid paths')
  } catch (e) {
    console.error('API not reachable at', API_BASE, e)
    process.exit(2)
  }

  if (paths.includes('/community')) {
    fail('prerender-paths excludes community', 'found /community')
  } else {
    pass('prerender-paths excludes /community')
  }

  let ok = true
  for (const path of paths) {
    const file = distFileForPath(path)
    if (!existsSync(file)) {
      fail(`prerender file ${path}`, `missing ${file.replace(repoRoot + '/', '')}`)
      ok = false
      continue
    }
    const html = await readFile(file, 'utf8')
    if (!assertBakedMeta(html, path, path)) ok = false
  }

  const communityFile = resolve(distDir, 'community', 'index.html')
  if (existsSync(communityFile)) {
    fail('community not prerendered', 'dist/community/index.html exists')
    ok = false
  } else {
    pass('no dist/community/index.html')
  }

  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed`)
  process.exit(ok && failed === 0 ? 0 : 1)
}

main()
