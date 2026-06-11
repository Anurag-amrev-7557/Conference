#!/usr/bin/env node
/**
 * Static accessibility inventory — grep patterns across src/
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../src');

function walk(dir, ext = ['.tsx', '.ts']) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules') continue;
      files.push(...walk(full, ext));
    } else if (ext.some((e) => entry.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(SRC);

const patterns = [
  {
    id: 'outline-none',
    regex: /outline-none|focus:outline-none/g,
    severity: 'medium',
    wcag: '2.4.7',
  },
  { id: 'empty-alt', regex: /alt=["']["']/g, severity: 'medium', wcag: '1.1.1' },
  { id: 'img-no-alt', regex: /<img(?![^>]*\balt=)[^>]*>/g, severity: 'high', wcag: '1.1.1' },
  { id: 'tabindex-positive', regex: /tabIndex=\{?[1-9]/g, severity: 'high', wcag: '2.4.3' },
  { id: 'autofocus', regex: /autoFocus|autofocus/gi, severity: 'low', wcag: '2.4.3' },
  { id: 'div-onclick', regex: /<div[^>]*onClick/g, severity: 'high', wcag: '4.1.2' },
  { id: 'span-onclick', regex: /<span[^>]*onClick/g, severity: 'high', wcag: '4.1.2' },
  { id: 'role-dialog', regex: /role=["']dialog["']/g, severity: 'info', wcag: '4.1.2' },
  { id: 'aria-live', regex: /aria-live/g, severity: 'info', wcag: '4.1.3' },
  { id: 'sr-only', regex: /sr-only/g, severity: 'info', wcag: '1.3.1' },
  { id: 'h1-usage', regex: /<h1[\s>]/g, severity: 'info', wcag: '1.3.1' },
  { id: 'main-usage', regex: /<main[\s>]/g, severity: 'info', wcag: '1.3.1' },
  { id: 'iframe', regex: /<iframe/g, severity: 'info', wcag: '1.1.1' },
  { id: 'video', regex: /<video/g, severity: 'info', wcag: '1.2.1' },
  { id: 'text-xs-below-12', regex: /text-\[(?:10|11)px\]/g, severity: 'low', wcag: '1.4.4' },
];

const findings = [];
const counts = {};
const MAX_FINDINGS = 2000;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const rel = relative(resolve(__dirname, '..'), file);

  for (const pat of patterns) {
    if (findings.length >= MAX_FINDINGS) break;
    const regex = new RegExp(pat.regex.source, pat.regex.flags);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const before = content.slice(0, match.index);
      const line = before.split('\n').length;
      findings.push({
        pattern: pat.id,
        file: rel,
        line,
        snippet: lines[line - 1]?.trim().slice(0, 120) || '',
        severity: pat.severity,
        wcag: pat.wcag,
      });
      counts[pat.id] = (counts[pat.id] || 0) + 1;
      if (findings.length >= MAX_FINDINGS) break;
    }
  }
}

// Heading inventory per page file
const pageFiles = files.filter((f) => f.includes('/pages/'));
const headingInventory = pageFiles.map((file) => {
  const content = readFileSync(file, 'utf8');
  const rel = relative(resolve(__dirname, '..'), file);
  const headings = {};
  for (let i = 1; i <= 6; i++) {
    const re = new RegExp(`<h${i}[\\s>]`, 'g');
    headings[`h${i}`] = (content.match(re) || []).length;
  }
  return { file: rel, headings };
});

const output = {
  generatedAt: new Date().toISOString(),
  filesScanned: files.length,
  patternCounts: counts,
  totalFindings: findings.length,
  findings,
  headingInventory,
};

const outPath = resolve(__dirname, '../docs/a11y-static-results.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.error(`Scanned ${files.length} files, ${findings.length} pattern matches`);
console.error(`Wrote ${outPath}`);
console.log(JSON.stringify({ patternCounts: counts, headingInventory }, null, 2));
