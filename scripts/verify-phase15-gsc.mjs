/**
 * Phase 15 — GSC verification meta in prerendered dist/index.html (MSMT-01).
 * Prerequisite: npm run build (API on :3001). Set GSC_TEST_TOKEN to the saved settings token.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distIndex = resolve(__dirname, '../dist/index.html')
const token = process.env.GSC_TEST_TOKEN?.trim()

function hasGscMeta(html, expected) {
  const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`<meta[^>]+name=["']google-site-verification["'][^>]+content=["']${escaped}["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']${escaped}["'][^>]+name=["']google-site-verification["']`, 'i'),
  ]
  return patterns.some((re) => re.test(html))
}

async function main() {
  if (!existsSync(distIndex)) {
    console.error('dist/index.html missing — run npm run build with API on :3001')
    process.exit(2)
  }
  if (!token) {
    console.error('Set GSC_TEST_TOKEN to the googleSiteVerification value from settings/seed')
    process.exit(2)
  }

  const html = await readFile(distIndex, 'utf8')
  if (hasGscMeta(html, token)) {
    console.log('✅ google-site-verification meta found in dist/index.html')
    process.exit(0)
  }
  console.error('❌ google-site-verification meta missing or token mismatch')
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
