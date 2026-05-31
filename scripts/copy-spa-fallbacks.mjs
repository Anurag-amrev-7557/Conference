/**
 * S3 static website / CloudFront: copy index.html under each client route directory.
 * Bare paths (e.g. GET /blog) are uploaded separately via scripts/upload-spa-routes.sh.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const indexHtml = join(dist, 'index.html')

const SPA_ROUTES = [
  'home',
  'register',
  'events',
  'blog',
  'dashboard',
  'admin',
]

if (!existsSync(indexHtml)) {
  console.error('copy-spa-fallbacks: dist/index.html not found — run vite build first.')
  process.exit(1)
}

for (const route of SPA_ROUTES) {
  const routeDir = join(dist, route)
  mkdirSync(routeDir, { recursive: true })
  copyFileSync(indexHtml, join(routeDir, 'index.html'))
}

copyFileSync(indexHtml, join(dist, '404.html'))

console.log(`copy-spa-fallbacks: wrote ${SPA_ROUTES.length} route index.html fallbacks + 404.html`)
