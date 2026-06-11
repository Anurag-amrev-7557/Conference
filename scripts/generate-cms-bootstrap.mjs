/**
 * Fetch CMS slices from the API and write public/cms-bootstrap.json for first-paint hydration.
 *
 * Env:
 *   BOOTSTRAP_API_URL — API origin (default http://localhost:3001)
 *   BOOTSTRAP_OPTIONAL — set to 1 to keep existing file when API is unreachable
 */
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const outFile = resolve(repoRoot, 'public/cms-bootstrap.json')

const API_URL = (
  process.env.BOOTSTRAP_API_URL ||
  process.env.PRERENDER_API_URL ||
  process.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:3001'
).replace(/\/$/, '')

const OPTIONAL = process.env.BOOTSTRAP_OPTIONAL === '1'

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

async function buildBootstrapPayload() {
  return fetchJson(`${API_URL}/api/v1/content/bootstrap`)
}

async function readExistingBootstrap() {
  if (!existsSync(outFile)) return null
  try {
    return JSON.parse(await readFile(outFile, 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  console.log('[cms-bootstrap] Fetching from', API_URL)

  try {
    const payload = await buildBootstrapPayload()
    await writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.log(
      '[cms-bootstrap] Wrote',
      outFile.replace(`${repoRoot}/`, ''),
      `(version ${payload.contentVersion ?? '?'})`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cms-bootstrap] Failed:', message)

    if (OPTIONAL || existsSync(outFile)) {
      const existing = await readExistingBootstrap()
      if (existing) {
        console.warn('[cms-bootstrap] Keeping existing bootstrap file')
        return
      }
    }

    if (OPTIONAL) {
      const stub = { contentVersion: 0, articles: [], events: [] }
      await writeFile(outFile, `${JSON.stringify(stub, null, 2)}\n`, 'utf8')
      console.warn('[cms-bootstrap] Wrote empty stub (BOOTSTRAP_OPTIONAL=1)')
      return
    }

    process.exit(1)
  }
}

main()
