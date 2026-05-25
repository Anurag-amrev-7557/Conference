#!/usr/bin/env node
/**
 * Phase 17 — navbar + hero premium refactor verification
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exit(1)
}
const ok = (msg) => console.log(`OK: ${msg}`)

const read = (rel) => readFileSync(join(root, rel), 'utf8')

const navbar = read('src/components/Navbar.tsx')
const hero = read('src/components/sections/HeroSection.tsx')
const css = read('src/index.css')
const websiteData = read('src/lib/websiteData.ts')

if (/framer-motion/.test(navbar)) fail('Navbar still imports framer-motion')
ok('Navbar has no framer-motion')

if (/ContactSupportModal/.test(navbar)) fail('Navbar still references ContactSupportModal')
ok('Navbar removed Support AI modal')

if (!/primaryCta/.test(navbar)) fail('Navbar missing primaryCta usage')
ok('Navbar uses primaryCta')

if (/Join Now/.test(navbar)) fail('Navbar still hardcodes Join Now')
ok('Navbar has no hardcoded Join Now')

if (/framer-motion|useMotionValue|mouseX/.test(hero)) fail('Hero still has motion tracking')
ok('Hero has no framer/mouse FX')

if (/initial=\{[^}]*hidden|opacity:\s*0[^1-9]/.test(hero) && /motion\.h1|variants.*hidden/.test(hero)) {
  fail('Hero h1 may be hidden on first paint')
}
ok('Hero avoids opacity-zero LCP pattern')

if (!/editorial-heading/.test(hero) || !/editorial-accent/.test(hero)) {
  fail('Hero h1 should use shared editorial typography')
}
ok('Hero h1 uses editorial typography')

if (!/btn-cta-primary/.test(hero) || !/btn-cta-secondary/.test(hero)) fail('Hero missing button pair')
ok('Hero uses primary/secondary buttons')

if (!/scroll-padding-top/.test(css)) fail('index.css missing scroll-padding-top')
ok('scroll-padding-top configured')

if (!/primaryCta/.test(websiteData)) fail('websiteData missing primaryCta')
ok('primaryCta in websiteData types/defaults')

console.log('\nPhase 17 verification passed.')
