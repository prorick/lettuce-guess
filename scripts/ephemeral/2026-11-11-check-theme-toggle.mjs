// 2026-11-11 — Tessera 5.5: verify the ADR-0004 dark mode toggle in headless Chrome.
// Scenarios: a LIGHT-mode device taps the moon → page goes dark; reload → still dark
// (pre-paint script, data-theme set before Vue mounts); tap the sun → light; and the
// header (now 3 icons) fits a 360px-wide phone without overflow.
//
// Usage: node scripts/ephemeral/2026-11-11-check-theme-toggle.mjs <puppeteer-core dir> <out dir> [url]
//   (needs `npx vite preview --port 4173` running; puppeteer-core lives outside the repo)
//
// Used 2026-11-11 against the local preview build. Outcome: all five states as designed:
// light device default (no data-theme, cream bg) → tap moon → dark (#151c12) → reload has
// data-theme="dark" at domcontentloaded, before Vue mounts (no flash) → tap sun → light.
// No horizontal overflow at 360px; zero console errors. No code changes needed.

import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [pptrDir, outDir, url = 'http://localhost:4173/lettuce-guess/'] = process.argv.slice(2)
if (!pptrDir || !outDir) {
  console.error('usage: node <script> <puppeteer-core dir> <out dir> [url]')
  process.exit(2)
}
const puppeteer = (await import(pathToFileURL(join(pptrDir, 'lib/esm/puppeteer/puppeteer-core.js')).href)).default
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const page = await browser.newPage()
await page.setViewport({ width: 360, height: 760, deviceScaleFactor: 2 })
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const state = () =>
  page.evaluate(() => ({
    dataTheme: document.documentElement.dataset.theme ?? null,
    bg: getComputedStyle(document.body).backgroundColor,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    label: document.querySelector('[aria-label^="Switch to"]')?.getAttribute('aria-label'),
  }))

await page.goto(url, { waitUntil: 'networkidle0' })
await page.keyboard.press('Escape') // dismiss first-visit help
await wait(300)
const before = await state()
await page.screenshot({ path: join(outDir, '1-light-device-default.png') })

await page.click('[aria-label="Switch to dark mode"]')
await wait(300)
const afterTap = await state()
await page.screenshot({ path: join(outDir, '2-tapped-dark.png') })

await page.reload({ waitUntil: 'domcontentloaded' })
const atLoad = await page.evaluate(() => document.documentElement.dataset.theme ?? null) // before Vue mounts
await page.waitForNetworkIdle()
await wait(300)
const afterReload = await state()

await page.click('[aria-label="Switch to light mode"]')
await wait(300)
const backToLight = await state()

console.log(JSON.stringify({ before, afterTap, atLoad, afterReload, backToLight }, null, 2))
await browser.close()
console.log(errors.length ? `errors:\n${errors.join('\n')}` : 'no console errors')
