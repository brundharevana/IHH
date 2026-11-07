// HUD text contrast over the live canvas (final review T15: axe leaves text over a WebGL canvas
// "incomplete", and a Task 14c screenshot showed "Hear this chapter" and the "Next chapter" label at
// about 1.3:1 on the bright Oval Office). For each bright room, at desktop and phone, once the HUD has
// settled (every ancestor fully opaque, nothing moving for a second), each label is measured against
// the pixels actually behind it: the region is captured with the text, then with the text made
// transparent, and the text colour (its alpha composited over each background pixel) is compared
// with every background pixel. The 2nd percentile of those contrasts must be at least 4.5:1 for text
// (3:1 for the phone's icon-only "Hear" button). Exit 1 on any failure.
// Needs the dev server (npm run dev, http://localhost:5173). usage: node e2e/hud-contrast.mjs [--shots]
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from './browser.mjs'

const BASE = process.env.BASE || 'http://localhost:5173'
const SHOTS = process.argv.includes('--shots')
const shotDir = fileURLToPath(new URL('../mockup-shots/task19/', import.meta.url))
if (SHOTS) mkdirSync(shotDir, { recursive: true })

// the brightest rooms on file: the Oval Office (April 1993) and the East Room (May 2012)
const ROOMS = [['albright', 'secretary'], ['albright', 'honoured']]
const VIEWS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
// required: the two labels the final review named; the rest of the HUD text is measured when shown
const TARGETS = [
  { sel: '.hud-hear-label', name: 'Hear this chapter', min: 4.5, required: 'desktop' },
  { sel: '.hud-hear svg', name: 'Hear (icon)', min: 3, iconOnly: true, required: 'phone' },
  { sel: '.btn-next-eyebrow', name: 'Next chapter (eyebrow)', min: 4.5, required: true },
  { sel: '.btn-next-label', name: 'Next chapter (label)', min: 4.5, required: true },
  { text: 'End tour', name: 'End tour', min: 4.5 },
  { text: 'Moments That Made Them', name: 'Moments That Made Them', min: 4.5 },
  { sel: '.stop-dot:not(.is-on) > span:first-child', name: 'stop number', min: 4.5 },
  { sel: '.speech-bubble.is-on .speech-text', name: 'guide caption', min: 4.5 },
  { sel: '.speech-bubble.is-on .speech-who', name: 'guide caption eyebrow', min: 4.5 },
  { sel: '.speech-bubble.is-on .speech-src', name: 'guide caption source', min: 4.5 },
  // the controls hint ends after 8 s; the page is opened with the dev hook that holds it, so it is always
  // on screen when measured, and it must be measured in every view
  { sel: '.hint-pill', name: 'controls hint', min: 4.5, required: true },
]
const find = (t) => (t.text ? `[...document.querySelectorAll('button, a')].find((e) => e.textContent.trim() === ${JSON.stringify(t.text)})` : `document.querySelector(${JSON.stringify(t.sel)})`)

const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const decoder = await (await browser.newContext()).newPage()
// PNG -> RGBA pixels, decoded by the browser itself (no image library needed)
async function pixels(png) {
  return decoder.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const c = new OffscreenCanvas(img.width, img.height)
    const g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    return Array.from(g.getImageData(0, 0, img.width, img.height).data)
  }, png.toString('base64'))
}

let fails = 0
const fail = (m) => { fails++; console.log(`  FAIL ${m}`) }

for (const [slug, chapter] of ROOMS) {
  for (const [view, opts] of Object.entries(VIEWS)) {
    const ctx = await browser.newContext({ viewport: { width: opts.width, height: opts.height }, ...opts })
    const page = await ctx.newPage()
    // hold the controls hint on screen (dev hook, HudParts.jsx ControlsHint): measured, never timed out
    await page.addInitScript(() => { window.__IHH_HOLD_HINT = true })
    const tag = `${slug}/${chapter} ${view}`
    await page.goto(`${BASE}/tour.html?inductee=${slug}&chapter=${chapter}&autostart=1`)
    await page.waitForSelector('canvas', { timeout: 60000 })
    await page.waitForSelector('[data-hud=next]', { timeout: 60000 })
    await page.waitForSelector('[data-hud=hear]', { timeout: 60000 }).catch(() => fail(`${tag}: no "Hear this chapter" button`))
    // settled: the HUD fully opaque and unchanged for a second, the room's arrival over
    await page.waitForTimeout(6000)
    const settled = await page.waitForFunction(() => {
      const op = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o }
      const els = [document.querySelector('[data-hud=next]'), document.querySelector('[data-hud=hear]')].filter(Boolean)
      const key = JSON.stringify(els.map((e) => [op(e), e.getBoundingClientRect().toJSON()]))
      const ok = els.length && els.every((e) => op(e) > 0.999) && window.__hudKey === key
      window.__hudKey = key
      return ok
    }, null, { timeout: 30000, polling: 1000 }).then(() => true, () => false)
    if (!settled) fail(`${tag}: the HUD never settled at full opacity`)
    if (SHOTS) await page.screenshot({ path: `${shotDir}hud-${slug}-${chapter}-${view}.jpg`, quality: 80 })
    // freeze transitions before each element is checked, not between its two screenshots: a hint whose
    // 8 s had just run out would pass the opacity check, then snap to transparent for the screenshot and
    // be measured as its own background (a race, not the colours)
    const freeze = '* { transition: none !important; animation: none !important; caret-color: transparent !important; }'
    await page.addStyleTag({ content: freeze })
    for (const t of TARGETS) {
      const info = await page.evaluate(`(() => {
        for (const e of document.querySelectorAll('[data-hud-probe]')) e.removeAttribute('data-hud-probe')
        const el = ${find(t)}
        if (!el) return null
        el.setAttribute('data-hud-probe', '1')
        // the box of the text itself (a pill's rounded corners show the room, which is not behind the text)
        let r = el.getBoundingClientRect()
        const box = r
        if (el.textContent.trim() && !(el instanceof SVGElement)) {
          // the element's own visible text: its direct text nodes when it has some (a stop dot's number,
          // not its hidden name tooltip), else all of its text
          const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
          const range = document.createRange()
          let t = null
          for (const n of own.length ? own : [el]) {
            range.selectNodeContents(n)
            const b = range.getBoundingClientRect()
            t = t ? { left: Math.min(t.left, b.left), top: Math.min(t.top, b.top), right: Math.max(t.right, b.right), bottom: Math.max(t.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom }
          }
          if (t && t.right - t.left > 2 && t.bottom - t.top > 2) r = { x: t.left, y: t.top, width: t.right - t.left, height: t.bottom - t.top, top: t.top, bottom: t.bottom }
        }
        const cs = getComputedStyle(el)
        let op = 1
        for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity)
        const visible = box.width > 2 && box.height > 2 && r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && op > 0.999 && r.bottom > 0 && r.top < innerHeight
        return { x: r.x, y: r.y, w: r.width, h: r.height, color: cs.color, visible }
      })()`)
      const required = t.required === true || t.required === view
      if (!info || !info.visible) {
        // the phone hides the label (icon only); a caption or hint may have ended by now
        if (required) fail(`${tag}: ${t.name} is not shown`)
        continue
      }
      if (t.iconOnly && view === 'desktop') continue
      const clip = { x: Math.max(0, info.x - 1), y: Math.max(0, info.y - 1), width: info.w + 2, height: info.h + 2 }
      // the element as it is now (class and opacity): a timed label (the controls hint ends after 8 s) that
      // starts to fade between the check above and the two screenshots would be measured as its own background
      const state = () => page.evaluate(() => {
        const el = document.querySelector('[data-hud-probe]')
        if (!el || !el.isConnected) return 'gone'
        let op = 1
        for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity)
        return `${el.className}|${op.toFixed(3)}`
      })
      const before = await state()
      const bg = await pixels(await page.screenshot({ clip, animations: 'disabled' }))
      const rgba = info.color.match(/[\d.]+/g).map(Number)
      const [r, g, b] = rgba
      const a = rgba.length > 3 ? rgba[3] : 1
      // the background behind the text: the same region with the text transparent
      await page.evaluate(() => {
        const el = document.querySelector('[data-hud-probe]')
        // a caption that has ended meanwhile is gone: the before/after check below reports it
        if (!el) return
        for (const c of [el, ...el.querySelectorAll('*')]) for (const k of ['color', 'fill', 'stroke', 'text-shadow']) c.style.setProperty(k, k === 'text-shadow' ? 'none' : 'transparent', 'important')
      })
      const behind = await pixels(await page.screenshot({ clip, animations: 'disabled' }))
      const after = await state()
      await page.evaluate(() => {
        const el = document.querySelector('[data-hud-probe]')
        if (!el) return
        for (const c of [el, ...el.querySelectorAll('*')]) for (const k of ['color', 'fill', 'stroke', 'text-shadow']) c.style.removeProperty(k)
        el?.removeAttribute('data-hud-probe')
      })
      if (after !== before) {
        // it ended while it was being measured: as for a label that has already ended, not measured
        if (required) fail(`${tag}: ${t.name} ended while it was measured (${before} -> ${after})`)
        else console.log(`  --   ${tag}: ${t.name} ended while it was measured; not measured`)
        continue
      }
      const ratios = []
      for (let i = 0; i < behind.length; i += 4) {
        const back = [behind[i], behind[i + 1], behind[i + 2]]
        const text = [r * a + back[0] * (1 - a), g * a + back[1] * (1 - a), b * a + back[2] * (1 - a)]
        ratios.push(ratio(text, back))
      }
      ratios.sort((p, q) => p - q)
      const low = ratios[Math.floor(ratios.length * 0.02)]
      const changed = bg.some((v, i) => Math.abs(v - behind[i]) > 8)
      const msg = `${tag}: ${t.name} ${low.toFixed(2)}:1 (need ${t.min}:1; text ${info.color})`
      if (!changed) fail(`${tag}: ${t.name}: hiding the text changed no pixel (not measured)`)
      else if (low < t.min) fail(msg)
      else console.log(`  ok   ${msg}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(fails ? `\n${fails} FAIL` : '\nhud contrast: all labels pass')
process.exit(fails ? 1 : 0)
