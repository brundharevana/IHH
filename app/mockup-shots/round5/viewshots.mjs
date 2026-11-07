import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
const out = process.env.OUT || 'shots'
const only = process.argv[2]
const B = 'http://localhost:5173/tour.html?'
const PAGES = [
  ['viewer-letter', 'viewer=EIN-M-0015', 3500],
  ['viewer-document', 'viewer=test-pages', 3000],
  ['viewer-sheet', 'viewer=test-sheet', 3000],
  ['viewer-photoset', 'viewer=test-photoset', 2000],
  ['viewer-model', 'viewer=test-model', 5000],
  ['viewer-photo', 'viewer=EIN-M-0025', 2000],
  ['constellations-index', 'view=constellations', 2500],
  ['constellation-einstein', 'constellation=einstein-navy-letters', 2500],
  ['constellation-muir', 'constellation=muir-house', 2000],
  ['room-letter', 'inductee=einstein&stop=study&autostart=1&letter=open', 9000],
]
const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--use-angle=metal'] })
for (const [dev, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: dev === 'phone', hasTouch: dev === 'phone' })
  for (const [name, q, wait] of PAGES) {
    if (only && !name.includes(only)) continue
    const page = await ctx.newPage()
    const errs = []
    page.on('pageerror', (e) => errs.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await page.goto(B + q)
    await page.waitForTimeout(wait)
    if (name === 'constellation-einstein') {
      await page.click('.cst-ring li:nth-child(4) button').catch((e) => errs.push('click ' + e.message))
      await page.waitForTimeout(800)
    }
    await page.screenshot({ path: `${out}/${name}-${dev}.jpg`, type: 'jpeg', quality: 62 })
    console.log(dev, name, errs.length ? 'ERRORS ' + errs.slice(0, 3).join(' | ') : 'ok')
    await page.close()
  }
  await ctx.close()
}
await browser.close()
