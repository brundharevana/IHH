// Navy problems constellation + the Brunauer letter series viewer; Naismith link-only card.
import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
const b = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
for (const [name, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto('http://localhost:5173/tour.html?constellation=einstein-navy-problems', { waitUntil: 'networkidle' })
  await p.waitForSelector('.cst-item')
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `navy-${name}.jpg`, quality: 80 })
  await p.locator('.cst-item', { hasText: 'Letters to Lieutenant' }).click()
  await p.waitForTimeout(600)
  await p.screenshot({ path: `navy-${name}-card.jpg`, quality: 80 })
  await p.getByRole('button', { name: 'Page through the letters' }).click()
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `series-${name}-1.jpg`, quality: 80 })
  await p.getByRole('button', { name: /Letter 5 of 9/ }).click()
  await p.waitForTimeout(2500)
  await p.screenshot({ path: `series-${name}-5.jpg`, quality: 80 })
  console.log(name, 'eyebrow:', await p.locator('.object-card .eyebrow').innerText(), '| title count chips:', await p.locator('.series-dates .chip').count(), '| errors:', errs.length, errs.slice(0, 3))
  // Naismith constellation: link-only item shows no image
  await p.goto('http://localhost:5173/tour.html?constellation=naismith-first-team', { waitUntil: 'networkidle' })
  await p.waitForSelector('.cst-item')
  await p.locator('.cst-item', { hasText: 'First Basketball Team' }).click()
  await p.waitForTimeout(600)
  console.log(name, 'naismith imgs:', await p.evaluate(() => [...document.images].map((i) => i.getAttribute('src'))))
  await p.screenshot({ path: `naismith-linkonly-${name}.jpg`, quality: 80 })
  await p.close()
}
await b.close()
