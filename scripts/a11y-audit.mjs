#!/usr/bin/env node
/**
 * Playwright + axe-core accessibility scan for all public and admin routes.
 * Usage: BOOK_URL=http://localhost:5173 node scripts/a11y-audit.mjs
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = (process.env.BOOK_URL || 'http://localhost:5173').replace(/\/$/, '');

const PUBLIC_ROUTES = [
  '/',
  '/register',
  '/blog',
  '/events',
  '/speakers',
  '/nonexistent-page-for-404',
];

const VIEWPORTS = [
  { name: 'mobile', width: 320, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/design',
  '/admin/media',
  '/admin/blogs',
  '/admin/events',
  '/admin/settings',
  '/admin/conference',
  '/admin/newsletter',
  '/admin/users',
  '/admin/registrations',
];

async function scanPage(page, url, label) {
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    return {
      label,
      url,
      status: response?.status() ?? 0,
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 5).map((n) => n.target.join(' > ')),
      })),
      incomplete: results.incomplete.length,
      passes: results.passes.length,
    };
  } catch (err) {
    return {
      label,
      url,
      error: err.message,
      violations: [],
    };
  }
}

async function discoverDynamicRoutes(page) {
  const dynamic = [];
  try {
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);
    const blogLinks = await page
      .locator('a[href^="/blog/"]')
      .evaluateAll((els) =>
        [...new Set(els.map((a) => a.getAttribute('href')).filter(Boolean))].slice(0, 2),
      );
    dynamic.push(...blogLinks);

    await page.goto(`${baseUrl}/events`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1000);
    const eventLinks = await page
      .locator('a[href^="/events/"]')
      .evaluateAll((els) =>
        [...new Set(els.map((a) => a.getAttribute('href')).filter(Boolean))].slice(0, 2),
      );
    dynamic.push(...eventLinks);
  } catch {
    // bootstrap may be unavailable
  }
  return dynamic;
}

async function keyboardChecks(page, route) {
  const issues = [];
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(800);

    // Skip link
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el
        ? { tag: el.tagName, text: el.textContent?.slice(0, 60), href: el.getAttribute('href') }
        : null;
    });
    if (route === '/' && focused?.text !== 'Skip to main content') {
      issues.push({ check: 'skip-link-first-tab', detail: focused });
    }

    // Count focusable without visible focus (sample)
    const focusables = await page.evaluate(() => {
      const els = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      return els.length;
    });
    issues.push({ check: 'focusable-count', count: focusables });

    // Landmark check
    const landmarks = await page.evaluate(() => ({
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      h1: document.querySelectorAll('h1').length,
      mainContentDiv: document.querySelectorAll('#main-content').length,
    }));
    if (landmarks.h1 !== 1) {
      issues.push({ check: 'h1-count', expected: 1, actual: landmarks.h1 });
    }
    if (landmarks.main === 0 && route !== '/nonexistent-page-for-404') {
      issues.push({ check: 'missing-main-landmark', landmarks });
    }
    if (landmarks.main > 1) {
      issues.push({ check: 'multiple-main', count: landmarks.main });
    }
    if (landmarks.mainContentDiv > 0 && landmarks.main > 0) {
      issues.push({ check: 'main-inside-main-content-div', landmarks });
    }
  } catch (err) {
    issues.push({ check: 'error', message: err.message });
  }
  return issues;
}

const browser = await chromium.launch({ headless: true });
const results = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  publicScans: [],
  adminScans: [],
  keyboardChecks: [],
  summary: { totalViolations: 0, routesScanned: 0, routesWithViolations: 0, axeErrors: 0 },
};

try {
  const discoveryContext = await browser.newContext();
  const discoveryPage = await discoveryContext.newPage();
  const dynamicRoutes = await discoverDynamicRoutes(discoveryPage);
  await discoveryContext.close();

  const allPublicRoutes = [...PUBLIC_ROUTES, ...dynamicRoutes];

  for (const route of allPublicRoutes) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      const scan = await scanPage(page, `${baseUrl}${route}`, `${route} @ ${vp.name}`);
      await context.close();
      results.publicScans.push({ route, viewport: vp.name, ...scan });
      results.summary.routesScanned++;
      if (scan.error) results.summary.axeErrors++;
      if (scan.violations?.length) {
        results.summary.routesWithViolations++;
        results.summary.totalViolations += scan.violations.length;
      }
    }
  }

  // Keyboard checks on key routes (desktop only)
  for (const route of ['/', '/register', '/blog', '/speakers']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const kc = await keyboardChecks(page, route);
    await context.close();
    results.keyboardChecks.push({ route, issues: kc });
  }

  // Admin — login page only (no auth token); scan what's reachable
  for (const route of ADMIN_ROUTES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const scan = await scanPage(page, `${baseUrl}${route}`, `admin ${route}`);
    await context.close();
    results.adminScans.push({ route, ...scan });
    results.summary.routesScanned++;
    if (scan.error) results.summary.axeErrors++;
    if (scan.violations?.length) {
      results.summary.routesWithViolations++;
      results.summary.totalViolations += scan.violations.length;
    }
  }

  // Admin dark theme on login
  const darkContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await darkContext.addInitScript(() => {
    localStorage.setItem('admin_theme', 'dark');
  });
  const darkPage = await darkContext.newPage();
  const darkLogin = await scanPage(darkPage, `${baseUrl}/admin`, 'admin login dark theme');
  await darkContext.close();
  results.adminScans.push({ route: '/admin', theme: 'dark', ...darkLogin });
} finally {
  await browser.close();
}

const outPath = resolve(__dirname, '../docs/a11y-axe-results.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(results, null, 2));

console.error(`Scanned ${results.summary.routesScanned} route/viewport combinations`);
console.error(`Total axe violation groups: ${results.summary.totalViolations}`);
console.error(`Wrote ${outPath}`);
