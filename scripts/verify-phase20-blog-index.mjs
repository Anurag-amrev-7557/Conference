#!/usr/bin/env node
/**
 * Phase 20 — blog index polish verification
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const fail = (msg) => {
  console.error(`FAIL: ${msg}`)
  process.exit(1)
}
const ok = (msg) => console.log(`OK: ${msg}`)

const blog = readFileSync(join(root, "src/pages/BlogPage.tsx"), "utf8")
const css = readFileSync(join(root, "src/index.css"), "utf8")

if (/framer-motion/.test(blog)) fail("BlogPage still imports framer-motion")
ok("BlogPage has no framer-motion")

if (!/blog-page/.test(blog)) fail("BlogPage missing blog-page wrapper")
ok("blog-page wrapper present")

if (!/blog-featured/.test(blog)) fail("BlogPage missing blog-featured")
ok("blog-featured present")

if (!/playbook-articles--trio/.test(blog)) fail("BlogPage missing playbook grid")
ok("playbook-articles--trio present")

if (!/blog-newsletter/.test(blog)) fail("BlogPage missing blog-newsletter")
ok("blog-newsletter present")

if (!/fetchPriority="high"/.test(blog)) fail("Featured image missing fetchPriority high")
ok("Featured LCP image attributes")

if (/initial=\{[^}]*opacity:\s*0/.test(blog)) {
  fail("BlogPage may hide content with opacity 0 on first paint")
}
ok("No opacity-zero Framer pattern")

if (!/BLOG INDEX/.test(css) || !/blog-featured/.test(css)) {
  fail("index.css missing BLOG INDEX / blog-featured styles")
}
ok("Blog index CSS block present")

console.log("\nPhase 20 blog index verification passed.")
