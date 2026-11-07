// Round 6 screenshots. usage: node shot.mjs <name> <url-query> [desktop|phone|both] [actions-json]
// actions: [{wait:ms} | {key:'2'} | {down/up:'w'} | {click:'selector'} | {drag:[x1,y1,x2,y2]} | {eval:'js'} | {shot:'suffix'}]
import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'

const [name, query, which = 'both', acts = '[]'] = process.argv.slice(2)
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
const dir = new URL('.', import.meta.url).pathname
const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] })
for (const dev of which === 'both' ? ['desktop', 'phone'] : [which]) {
  const ctx = await browser.newContext(DEVICES[dev])
  const page = await ctx.newPage()
  page.on('console', (m) => m.type() === 'error' && console.log(`[${dev}] console error:`, m.text().slice(0, 300)))
  page.on('pageerror', (e) => console.log(`[${dev}] page error:`, e.message.slice(0, 300)))
  await page.goto(`http://localhost:5173/tour.html?${query}`)
  await page.waitForTimeout(6000)
  let shot = 0
  for (const a of JSON.parse(acts)) {
    if (a.wait) await page.waitForTimeout(a.wait)
    if (a.key) await page.keyboard.press(a.key)
    if (a.down) await page.keyboard.down(a.down)
    if (a.up) await page.keyboard.up(a.up)
    if (a.click) await page.click(a.click)
    if (a.drag) {
      const [x1, y1, x2, y2] = a.drag
      await page.mouse.move(x1, y1)
      await page.mouse.down()
      for (let i = 1; i <= 12; i++) await page.mouse.move(x1 + ((x2 - x1) * i) / 12, y1 + ((y2 - y1) * i) / 12)
      await page.mouse.up()
    }
    if (a.eval) console.log(`[${dev}] eval:`, JSON.stringify(await page.evaluate(a.eval)))
    if (a.shot) {
      await page.screenshot({ path: `${dir}${name}-${a.shot}-${dev}.jpg`, quality: 82, type: 'jpeg' })
      shot++
    }
  }
  if (!shot) await page.screenshot({ path: `${dir}${name}-${dev}.jpg`, quality: 82, type: 'jpeg' })
  await ctx.close()
}
await browser.close()
