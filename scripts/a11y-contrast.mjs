#!/usr/bin/env node
/**
 * Computes WCAG contrast ratios for design tokens used in the book website.
 * Outputs JSON to stdout and optionally writes to docs/a11y-contrast-results.json
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function grade(ratio, largeText = false) {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'FAIL';
}

const publicTokens = {
  '--color-text': '#000000',
  '--color-text2': '#2D2D2D',
  '--color-text3': '#5C5C5C',
  '--color-muted': '#333333',
  '--color-bg': '#F2F2F0',
  '--color-off': '#EBEBE8',
  '--color-border': '#D1D1CE',
  '--color-accent': '#003E99',
  '--color-accent2': '#002D70',
  '--color-accent-light': '#E0E9FF',
  '--color-green': '#0E4F25',
  '--color-green-bg': '#E8F5EE',
  '--color-tag': '#E2E2DF',
  body_white: '#ffffff',
};

const adminLight = {
  '--ds-fg-primary': '#0f0f0f',
  '--ds-fg-secondary': '#525252',
  '--ds-fg-tertiary': '#737373',
  '--ds-bg-base': '#fafafa',
  '--ds-bg-surface': '#ffffff',
  '--ds-bg-muted': '#f5f5f5',
  '--ds-border': '#e5e5e5',
  '--ds-accent': '#2563eb',
  '--ds-danger': '#dc2626',
};

const adminDark = {
  '--ds-fg-primary': '#fafafa',
  '--ds-fg-secondary': '#a3a3a3',
  '--ds-fg-tertiary': '#737373',
  '--ds-bg-base': '#0a0a0a',
  '--ds-bg-surface': '#171717',
  '--ds-bg-muted': '#262626',
  '--ds-border': '#404040',
  '--ds-accent': '#3b82f6',
  '--ds-danger': '#f87171',
};

const pairs = [
  // Public — body text on backgrounds
  { fg: '--color-text', bg: '--color-bg', context: 'Primary body text on page bg', large: false },
  { fg: '--color-text', bg: 'body_white', context: 'Primary text on white body', large: false },
  { fg: '--color-text2', bg: '--color-bg', context: 'Secondary text on page bg', large: false },
  { fg: '--color-text3', bg: '--color-bg', context: 'Tertiary text on page bg', large: false },
  {
    fg: '--color-text3',
    bg: '--color-off',
    context: 'Tertiary text on off-white surface',
    large: false,
  },
  { fg: '--color-muted', bg: '--color-bg', context: 'Muted text on page bg', large: false },
  {
    fg: '--color-green',
    bg: '--color-green-bg',
    context: 'Success text on success bg',
    large: false,
  },
  { fg: '#ffffff', bg: '--color-accent', context: 'White text on accent button', large: false },
  { fg: '#ffffff', bg: '--color-accent2', context: 'White text on accent2', large: false },
  {
    fg: '--color-accent',
    bg: '--color-accent-light',
    context: 'Accent text on accent-light bg',
    large: false,
  },
  { fg: '--color-text3', bg: '--color-tag', context: 'Tag/meta text on tag bg', large: false },
  // Nav on hero (approximate dark overlay)
  { fg: '#ffffff', bg: '#1a1a2e', context: 'Nav links on dark hero (approx)', large: false },
  {
    fg: 'rgba-white-70',
    bg: '#1a1a2e',
    context: 'Nav secondary on dark hero',
    large: false,
    customFg: () => {
      // #ffffff at 70% over #1a1a2e blended
      const bg = hexToRgb('#1a1a2e');
      const fg = [255, 255, 255];
      const alpha = 0.7;
      const blended = fg.map((f, i) => Math.round(f * alpha + bg[i] * (1 - alpha)));
      return blended;
    },
  },
  // Admin light
  {
    fg: '--ds-fg-primary',
    bg: '--ds-bg-base',
    context: 'Admin primary on base (light)',
    large: false,
    palette: 'adminLight',
  },
  {
    fg: '--ds-fg-secondary',
    bg: '--ds-bg-surface',
    context: 'Admin secondary on surface (light)',
    large: false,
    palette: 'adminLight',
  },
  {
    fg: '--ds-fg-tertiary',
    bg: '--ds-bg-surface',
    context: 'Admin tertiary on surface (light)',
    large: false,
    palette: 'adminLight',
  },
  {
    fg: '#ffffff',
    bg: '--ds-accent',
    context: 'White on admin accent button (light)',
    large: false,
    palette: 'adminLight',
  },
  {
    fg: '--ds-danger',
    bg: '--ds-bg-surface',
    context: 'Danger text on surface (light)',
    large: false,
    palette: 'adminLight',
  },
  // Admin dark
  {
    fg: '--ds-fg-primary',
    bg: '--ds-bg-base',
    context: 'Admin primary on base (dark)',
    large: false,
    palette: 'adminDark',
  },
  {
    fg: '--ds-fg-secondary',
    bg: '--ds-bg-surface',
    context: 'Admin secondary on surface (dark)',
    large: false,
    palette: 'adminDark',
  },
  {
    fg: '--ds-fg-tertiary',
    bg: '--ds-bg-surface',
    context: 'Admin tertiary on surface (dark)',
    large: false,
    palette: 'adminDark',
  },
  {
    fg: '#ffffff',
    bg: '--ds-accent',
    context: 'White on admin accent button (dark)',
    large: false,
    palette: 'adminDark',
  },
  {
    fg: '--ds-danger',
    bg: '--ds-bg-surface',
    context: 'Danger text on surface (dark)',
    large: false,
    palette: 'adminDark',
  },
  // Edge case accent overrides
  { fg: '#ffffff', bg: '#ffcc00', context: 'White on yellow accent (edge case CMS)', large: false },
  {
    fg: '#ffffff',
    bg: '#88cc88',
    context: 'White on light green accent (edge case CMS)',
    large: false,
  },
];

const palettes = { public: publicTokens, adminLight, adminDark };

function resolveColor(token, paletteName = 'public') {
  const palette = palettes[paletteName] || publicTokens;
  if (token.startsWith('#')) return token;
  return palette[token] || publicTokens[token];
}

const results = pairs.map((pair) => {
  const paletteName = pair.palette || 'public';
  const palette = palettes[paletteName];
  let ratio;
  let fgHex;
  let bgHex;

  if (pair.customFg) {
    const fgRgb = pair.customFg();
    bgHex = resolveColor(pair.bg, paletteName);
    const bgRgb = hexToRgb(bgHex);
    const l1 = relativeLuminance(fgRgb);
    const l2 = relativeLuminance(bgRgb);
    ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    fgHex = `rgb(${fgRgb.join(',')})`;
  } else {
    fgHex = resolveColor(pair.fg, paletteName);
    bgHex = resolveColor(pair.bg, paletteName);
    ratio = contrastRatio(fgHex, bgHex);
  }

  return {
    context: pair.context,
    foreground: fgHex,
    background: bgHex,
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: grade(ratio, pair.large),
    wcagAALarge: grade(ratio, true),
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  standard: 'WCAG 2.2',
  results,
  failures: results.filter((r) => r.wcagAA === 'FAIL'),
};

const outPath = resolve(__dirname, '../docs/a11y-contrast-results.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(JSON.stringify(output, null, 2));
console.error(`\nWrote ${outPath}`);
console.error(`Failures: ${output.failures.length}`);
