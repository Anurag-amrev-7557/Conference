#!/usr/bin/env node
/**
 * Assistive-technology oriented audit:
 * - Authenticated admin axe scans (light + dark)
 * - Playwright accessibility tree snapshots on key flows
 * - Keyboard navigation checks (tab order, traps, landmarks)
 *
 * Usage:
 *   BOOK_URL=http://localhost:5173 \
 *   API_URL=http://localhost:3001/api/v1 \
 *   A11Y_ADMIN_USER=admin \
 *   A11Y_ADMIN_PASSWORD=... \
 *   node scripts/a11y-at-audit.mjs
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const baseUrl = (process.env.BOOK_URL || 'http://localhost:5173').replace(/\/$/, '');
const apiBase = (process.env.API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
const adminUser = process.env.A11Y_ADMIN_USER || 'admin';
const adminPass = process.env.A11Y_ADMIN_PASSWORD || '';

const ADMIN_ROUTES = [
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

const PUBLIC_FLOWS = [
  { id: 'home-skip-link', route: '/', setup: null },
  { id: 'register-form', route: '/register', setup: null },
  { id: 'blog-index', route: '/blog', setup: null },
  { id: 'speakers-catalog', route: '/speakers', setup: null },
];

async function adminLogin(request) {
  if (!adminPass) return { ok: false, reason: 'A11Y_ADMIN_PASSWORD not set' };
  const res = await request.post(`${apiBase}/auth/login`, {
    data: { username: adminUser, password: adminPass },
  });
  if (!res.ok()) {
    return { ok: false, reason: `Login failed: ${res.status()}` };
  }
  return { ok: true };
}

async function axeScan(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return {
    label,
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(' > ')),
    })),
    incomplete: results.incomplete.length,
    passes: results.passes.length,
  };
}

async function landmarkAudit(page, waitForAdmin = false) {
  if (waitForAdmin) {
    await page
      .locator('#admin-main')
      .waitFor({ state: 'attached', timeout: 15000 })
      .catch(() => {});
  }
  return page.evaluate(() => {
    const count = (sel) => document.querySelectorAll(sel).length;
    return {
      main: count('main'),
      nav: count('nav'),
      h1: count('h1'),
      title: document.title?.trim() || '',
      lang: document.documentElement.lang || '',
    };
  });
}

async function tabWalk(page, steps = 12) {
  const trail = [];
  for (let i = 0; i < steps; i += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return {
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        name:
          el.getAttribute('aria-label') ||
          (el instanceof HTMLInputElement ? el.labels?.[0]?.textContent?.trim() : null) ||
          el.textContent?.trim().slice(0, 60) ||
          '',
        href: el.getAttribute('href'),
      };
    });
    trail.push(focused);
  }
  return trail;
}

async function testMobileNav(page) {
  const toggle = page.getByRole('button', { name: /open menu/i });
  if ((await toggle.count()) === 0) return { skipped: true };
  await toggle.click();
  await page.waitForTimeout(400);
  const expanded = await toggle.getAttribute('aria-expanded');
  const menuVisible = await page
    .locator('.nav-dock__link--mobile')
    .first()
    .isVisible()
    .catch(() => false);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const closed = await toggle.getAttribute('aria-expanded');
  return { expanded, menuVisible, closedAfterEscape: closed === 'false' };
}

async function testCookieBanner(page) {
  await page.evaluate(() => {
    localStorage.removeItem('cms_cookie_consent');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const dialog = page.getByRole('dialog', { name: /cookie consent/i });
  if ((await dialog.count()) === 0) return { skipped: true, reason: 'banner disabled' };
  const modal = await dialog.getAttribute('aria-modal');
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() =>
    document.activeElement?.textContent?.trim().slice(0, 40),
  );
  return { ariaModal: modal, firstTabFocus: firstFocus };
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  adminAuth: null,
  adminAxe: [],
  publicAxe: [],
  landmarks: [],
  keyboard: [],
  a11ySnapshots: [],
  manualVoiceOverNvdaChecklist: [],
  summary: { adminViolations: 0, publicViolations: 0, keyboardIssues: 0 },
};

const browser = await chromium.launch({ headless: true });

try {
  // --- Public flows ---
  for (const flow of PUBLIC_FLOWS) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${flow.route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    const axe = await axeScan(page, `public ${flow.route}`);
    report.publicAxe.push(axe);
    report.summary.publicViolations += axe.violations.length;

    const landmarks = await landmarkAudit(page);
    report.landmarks.push({ flow: flow.id, route: flow.route, ...landmarks });

    if (flow.route === '/') {
      const skipTrail = await tabWalk(page, 1);
      report.keyboard.push({
        check: 'skip-link-first-tab',
        pass: skipTrail[0]?.name === 'Skip to main content',
        detail: skipTrail[0],
      });

      const mobile = await testMobileNav(page);
      report.keyboard.push({ check: 'mobile-nav-escape', ...mobile });

      const cookie = await testCookieBanner(page);
      report.keyboard.push({ check: 'cookie-banner', ...cookie });
    }

    if (flow.route === '/register') {
      await page.locator('#main-content').focus();
      const trail = await tabWalk(page, 12);
      const namedFields = trail.filter((t) => t?.tag === 'input' || t?.tag === 'select');
      report.keyboard.push({
        check: 'register-tab-order',
        pass: namedFields.length >= 2,
        trail: namedFields,
      });
    }

    try {
      const snapshot = await page.accessibility.snapshot({ interestingOnly: true });
      report.a11ySnapshots.push({
        flow: flow.id,
        role: snapshot?.role,
        name: snapshot?.name,
        childRoles: (snapshot?.children || []).slice(0, 8).map((c) => ({
          role: c.role,
          name: c.name?.slice(0, 80),
        })),
      });
    } catch (err) {
      report.a11ySnapshots.push({ flow: flow.id, error: err.message });
    }

    await context.close();
  }

  // --- Authenticated admin ---
  const authContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const authRequest = authContext.request;
  const login = await adminLogin(authRequest);
  report.adminAuth = login;

  if (login.ok) {
    const authPage = await authContext.newPage();
    await authPage.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await authPage.waitForTimeout(3000);

    for (const theme of ['light', 'dark']) {
      await authPage.evaluate((t) => {
        localStorage.setItem('admin_theme', t);
        document.querySelector('.admin-shell')?.setAttribute('data-theme', t);
      }, theme);

      for (const route of ADMIN_ROUTES) {
        await authPage.goto(`${baseUrl}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        await authPage.waitForTimeout(2500);
        const axe = await axeScan(authPage, `admin ${route} (${theme})`);
        report.adminAxe.push(axe);
        report.summary.adminViolations += axe.violations.length;

        const landmarks = await landmarkAudit(authPage, true);
        report.landmarks.push({ flow: `admin-${theme}`, route, ...landmarks });

        if (route === '/admin/dashboard' && theme === 'light') {
          const h1count = landmarks.h1;
          report.keyboard.push({
            check: 'admin-single-h1',
            pass: h1count === 1,
            h1count,
            route,
          });
        }
      }
    }

    // Command palette keyboard
    await authPage.goto(`${baseUrl}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await authPage.waitForTimeout(1500);
    await authPage.keyboard.press('Control+k');
    await authPage.waitForTimeout(500);
    let paletteOpen = await authPage
      .getByLabel(/search pages and actions/i)
      .isVisible()
      .catch(() => false);
    if (!paletteOpen) {
      await authPage
        .getByRole('button', { name: /open command palette/i })
        .first()
        .click();
      await authPage.waitForTimeout(400);
      paletteOpen = await authPage
        .getByLabel(/search pages and actions/i)
        .isVisible()
        .catch(() => false);
    }
    report.keyboard.push({ check: 'command-palette-open', pass: paletteOpen });
    await authPage.keyboard.press('Escape');

    try {
      const snapshot = await authPage.accessibility.snapshot({ interestingOnly: true });
      report.a11ySnapshots.push({
        flow: 'admin-dashboard',
        role: snapshot?.role,
        childRoles: (snapshot?.children || []).slice(0, 12).map((c) => ({
          role: c.role,
          name: c.name?.slice(0, 80),
        })),
      });
    } catch (err) {
      report.a11ySnapshots.push({ flow: 'admin-dashboard', error: err.message });
    }
  }

  await authContext.close();
} finally {
  await browser.close();
}

report.summary.keyboardIssues = report.keyboard.filter((k) => k.pass === false).length;

report.manualVoiceOverNvdaChecklist = [
  {
    area: 'Homepage',
    voiceOver: 'Rotor > Landmarks: one Main, nav regions named. Hero H1 announced once.',
    nvda: 'D landmarks: single main. H quick nav: one H1.',
  },
  {
    area: 'Mobile nav',
    voiceOver: 'Open menu: VO reads expanded state. Tab cycles inside; VO+Esc closes.',
    nvda: 'Open menu: expanded announced. Tab trapped; Escape closes.',
  },
  {
    area: 'Register form',
    voiceOver: 'Each field label read with control. Error alerts announced on submit.',
    nvda: 'Tab through fields: label association verified. role=alert on errors.',
  },
  {
    area: 'Carousels',
    voiceOver: 'Prev/next buttons labeled. Pagination group announced.',
    nvda: 'Carousel controls reachable; slide change does not move focus unexpectedly.',
  },
  {
    area: 'Cookie banner',
    voiceOver: 'Dialog role + modal on open. Focus on Accept.',
    nvda: 'Browse mode: dialog intercepts focus until Accept.',
  },
  {
    area: 'Admin (authenticated)',
    voiceOver: 'Single H1 per view. Data tables: column headers read with cells.',
    nvda: 'Table navigation: headers associated. Sort buttons announced.',
  },
  {
    area: 'Admin dark mode',
    voiceOver: 'Contrast sufficient on login + dashboard (visual check).',
    nvda: 'Muted text readable at 100% zoom.',
  },
];

const outJson = resolve(__dirname, '../docs/a11y-at-results.json');
const outMd = resolve(__dirname, '../docs/A11Y_AT_AUDIT.md');
mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, JSON.stringify(report, null, 2));

const md = `# Assistive Technology & Authenticated Admin Audit

**Generated:** ${report.generatedAt}  
**Base URL:** ${baseUrl}  
**Admin auth:** ${report.adminAuth?.ok ? 'success' : report.adminAuth?.reason || 'not attempted'}

## Automated summary

| Check | Result |
|-------|--------|
| Public axe violation groups | ${report.summary.publicViolations} |
| Admin axe violation groups (authenticated) | ${report.summary.adminViolations} |
| Keyboard check failures | ${report.summary.keyboardIssues} |

## Keyboard checks

${report.keyboard
  .map(
    (k) =>
      `- **${k.check}**: ${k.pass === false ? 'FAIL' : k.pass === true ? 'PASS' : 'INFO'} ${k.skipped ? '(skipped)' : ''} ${JSON.stringify(k).slice(0, 120)}`,
  )
  .join('\n')}

## Landmarks (sample)

${report.landmarks
  .slice(0, 15)
  .map((l) => `- \`${l.route}\` — main:${l.main} nav:${l.nav} h1:${l.h1} title:"${l.title}"`)
  .join('\n')}

## Admin axe (authenticated)

${
  report.adminAxe.length === 0
    ? '_Admin routes not scanned — set A11Y_ADMIN_PASSWORD._'
    : report.adminAxe
        .filter((a) => a.violations.length)
        .map((a) => `- **${a.label}**: ${a.violations.map((v) => v.id).join(', ')}`)
        .join('\n') || '_No axe violations on authenticated admin routes._'
}

## Manual VoiceOver / NVDA checklist

${report.manualVoiceOverNvdaChecklist
  .map(
    (item) => `### ${item.area}
- **VoiceOver:** ${item.voiceOver}
- **NVDA:** ${item.nvda}`,
  )
  .join('\n\n')}

## Raw data

- [\`docs/a11y-at-results.json\`](a11y-at-results.json)
`;

writeFileSync(outMd, md);

console.error(`Wrote ${outJson}`);
console.error(`Wrote ${outMd}`);
console.error(
  `Admin violations: ${report.summary.adminViolations}, Public: ${report.summary.publicViolations}, Keyboard issues: ${report.summary.keyboardIssues}`,
);
