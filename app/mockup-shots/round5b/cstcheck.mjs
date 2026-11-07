// Constellation index layout check: no floating card overlaps the header, the tag row or another card,
// at each viewport, after Shuffle, and in Timeline view. Also: no link-only media renders an image.
// usage: node cstcheck.mjs [--shots]
import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
const shots = process.argv.includes('--shots')
const VIEWS = [['desktop', 1440, 900], ['laptop', 1280, 720], ['phone', 390, 844]]
const URL = 'http://localhost:5173/tour.html?view=constellations'
const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
let bad = 0
for (const [name, w, h] of VIEWS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.cst-float'); await page.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')))
  const modes = [['normal', 0], ['shuffle1', 1], ['shuffle2', 2], ['shuffle3', 3], ['timeline', -1]]
  for (const [mode, n] of modes) {
    if (mode === 'timeline') await page.getByRole('button', { name: /Timeline view/ }).click()
    else for (let i = 0; i < (n ? 1 : 0); i++) await page.getByRole('button', { name: 'Shuffle' }).click()
    await page.waitForTimeout(1500); await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
    const r = await page.evaluate(() => {
      const box = (el) => { const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom } }
      const cards = [...document.querySelectorAll('.cst-float')].map((e) => ({ t: e.textContent.slice(0, 30), ...box(e.firstElementChild) }))
      const fixed = ['.cst-head', '.cst-themes'].map((s) => ({ t: s, ...box(document.querySelector(s)) }))
      const field = box(document.querySelector('.cst-field'))
      return { cards, fixed, field, imgs: [...document.querySelectorAll('.cst-float img')].map((i) => i.getAttribute('src')) }
    })
    const probs = []
    r.cards.forEach((a, i) => {
      r.fixed.forEach((f) => hit(a, f) && probs.push(`${a.t} x ${f.t}`))
      if (a.left < -1 || a.right > w + 1) probs.push(`${a.t} off-screen`)
      r.cards.slice(i + 1).forEach((b) => hit(a, b) && probs.push(`${a.t} x ${b.t}`))
    })
    if (r.imgs.some((s) => /NAI-M-0004/.test(s))) probs.push('NAI-M-0004 image shown')
    console.log(name, mode, probs.length ? 'OVERLAP ' + probs.join(' | ') : 'ok', `(${r.cards.length} cards, field h ${Math.round(r.field.bottom - r.field.top)})`)
    bad += probs.length
    if (shots && (mode === 'normal' || mode === 'timeline') && name !== 'laptop') await page.screenshot({ path: `index-${name}-${mode}.jpg`, quality: 80, fullPage: false })
  }
  await page.close()
}
await browser.close()
process.exit(bad ? 1 : 0)
