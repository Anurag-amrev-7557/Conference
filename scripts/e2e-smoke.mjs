#!/usr/bin/env node
import { chromium } from 'playwright'

const backendUrl = process.env.MARKETING_BACKEND_URL || 'http://127.0.0.1:8000'
const marketingUrl = process.env.MARKETING_FRONTEND_URL || 'http://localhost:5174/marketing/'
const bookUrl = process.env.BOOK_FRONTEND_URL || 'http://localhost:5175/'

const fail = (message) => {
  console.error(`FAIL: ${message}`)
  process.exit(1)
}

const ok = (message) => console.log(`OK: ${message}`)

async function checkJsonResponse(response, label) {
  if (!response.ok()) {
    fail(`${label} returned ${response.status()}`)
  }

  const payload = await response.json().catch(() => null)
  if (!payload) {
    fail(`${label} did not return JSON`)
  }

  return payload
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })

try {
  const live = await page.request.get(`${backendUrl}/health/live`)
  const liveJson = await checkJsonResponse(live, 'backend /health/live')
  if (liveJson.status !== 'alive' && liveJson.status !== 'ok') {
    fail('backend /health/live status was not alive')
  }
  ok('backend /health/live is healthy')

  const ready = await page.request.get(`${backendUrl}/health/ready`)
  const readyJson = await checkJsonResponse(ready, 'backend /health/ready')
  if (readyJson.status !== 'ready' && readyJson.status !== 'ok' && readyJson.status !== 'degraded') {
    fail('backend /health/ready returned unexpected status')
  }
  ok('backend /health/ready responded')

  const leadsResponse = page.waitForResponse((response) => response.url().includes('/leads') && response.ok())
  const statsResponse = page.waitForResponse((response) => response.url().includes('/stats') && response.ok())
  await page.goto(marketingUrl, { waitUntil: 'networkidle' })
  await Promise.all([leadsResponse, statsResponse])
  await page.getByRole('heading', { name: 'Market Overview' }).waitFor({ state: 'visible' })
  await page.getByText('Customer Identities', { exact: false }).waitFor({ state: 'visible' })
  ok('marketing frontend dashboard loaded and fetched backend data')

  await page.goto(bookUrl, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Book a demo' }).waitFor({ state: 'visible' })
  await page.getByRole('link', { name: /Join founder network/i }).waitFor({ state: 'visible' })
  ok('book website frontend landing page loaded')

  console.log('\nE2E smoke check passed.')
} finally {
  await browser.close()
}