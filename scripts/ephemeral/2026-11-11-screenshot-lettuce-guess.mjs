// 2026-11-11 — Tessera 5.5: drive the built Lettuce Guess in headless Chrome and
// screenshot each screen (help, mid-game, invalid word, win, random round, dark mode)
// before the first deploy, so the "make it aesthetic" ask is checked by eye, not assumed.
//
// Usage: node scripts/ephemeral/2026-11-11-screenshot-lettuce-guess.mjs <puppeteer-core dir> <out dir> [url]
//   (puppeteer-core lives outside the repo, e.g. in a scratch folder — it is not a project dependency;
//    needs `npx vite preview --port 4173` running.)
//
// Used 2026-11-11 (pre-first-deploy), puppeteer-core@24 against Chrome in the
// scratchpad: puzzle #1 = SHRED. Outcome: help, mid-game, "Not in our word list"
// toast + shake, win sheet, random round, reload-restores-result all rendered as
// designed, light and dark; zero console errors. No code changes needed.
// Gotcha found: headless Chrome inherits the host's dark appearance, hence the
// explicit light emulation up top.

import { readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [pptrDir, outDir, url = 'http://localhost:4173/lettuce-guess/'] = process.argv.slice(2)
if (!pptrDir || !outDir) {
  console.error('usage: node <script> <puppeteer-core dir> <out dir> [url]')
  process.exit(2)
}
const puppeteer = (await import(pathToFileURL(join(pptrDir, 'lib/esm/puppeteer/puppeteer-core.js')).href)).default
mkdirSync(outDir, { recursive: true })

// Today's answer, recomputed the same way src/game/daily.ts does (launch 2026-11-11, local days).
const answers = JSON.parse(readFileSync('src/words/answers.ts', 'utf8').match(/= (".*")\.split/)[1]).split(' ')
const day = (d) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000)
const n = Math.max(1, day(new Date()) - day(new Date(2026, 10, 11)) + 1)
const answer = answers[(n - 1) % answers.length]
console.log(`puzzle #${n}, answer ${answer}`)

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
})
const page = await browser.newPage()
await page.setViewport({ width: 400, height: 860, deviceScaleFactor: 2 })
// Headless Chrome follows the host's appearance; pin light first, dark is checked at the end.
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

const shot = (name) => page.screenshot({ path: join(outDir, `${name}.png`) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function guess(word) {
  await page.keyboard.type(word)
  await page.keyboard.press('Enter')
  await wait(2000)
}

await page.goto(url, { waitUntil: 'networkidle0' })
await wait(400)
await shot('1-help-first-visit')
await page.keyboard.press('Escape')
await wait(300)

const opener = answer === 'crane' ? 'slate' : 'crane'
await guess(opener)
await guess(answer === 'stoic' ? 'about' : 'stoic')
await page.keyboard.type('lem')
await wait(200)
await shot('2-mid-game')

for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace')
await page.keyboard.type('qzxjv')
await page.keyboard.press('Enter')
await wait(250)
await shot('3-not-a-word')
for (let i = 0; i < 5; i++) await page.keyboard.press('Backspace')

await guess(answer)
await wait(1800)
await shot('4-win-result')

const buttons = await page.$$('button')
for (const b of buttons) {
  const t = await b.evaluate((el) => el.textContent?.trim())
  if (t === 'Play a random word') {
    await b.click()
    break
  }
}
await wait(400)
await guess('crane')
await shot('5-random-round')

await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
await page.reload({ waitUntil: 'networkidle0' })
await wait(500)
await shot('6-dark-reload-restores-result')
await page.keyboard.press('Escape')
await wait(300)
await shot('7-dark-board')

await browser.close()
console.log(errors.length ? `console errors:\n${errors.join('\n')}` : 'no console errors')
