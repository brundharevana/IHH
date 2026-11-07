// The record viewer fits its window (fix round 12, owner report: in a 1000 x 570 window a newspaper's scan was cut off
// at the top and the card ran off the right edge). Every record the tours show (records.lock.json, opened on its own
// page, tour.html?viewer=<id>), at 1440 x 900, 1000 x 570, 1280 x 600, 390 x 844 and 360 x 640:
//   - the scan (a sheet's page as the camera shows it, a photograph's painted picture) is whole: its four corners lie
//     inside the viewer's stage and inside the window, before the visitor moves or zooms anything (a 3D object has no
//     scan; only its card is checked);
//   - the card fits: its box inside the window's width (and, unless the viewer scrolls, its height), and its title, each
//     button and each rights row inside the window and not clipped by the card or the viewer, once scrolled into view
//     (the card, or the viewer on a phone, may scroll; nothing may run past an edge).
// Exit 1 on any failure. Needs the dev server (BASE, default http://localhost:5173).
// usage: node e2e/viewer-fit.mjs [record id ...] [--viewports=1000x570,360x640]   (default: all records, all five)
import { readFileSync } from 'node:fs'
import { chromium } from './browser.mjs'

const BASE = process.env.BASE || 'http://localhost:5173'
const VIEWPORTS = {
  '1440x900': { viewport: { width: 1440, height: 900 } },
  '1000x570': { viewport: { width: 1000, height: 570 } },
  '1280x600': { viewport: { width: 1280, height: 600 } },
  '390x844': { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  '360x640': { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
const LOCK = JSON.parse(readFileSync(new URL('../src/tour/data/records.lock.json', import.meta.url), 'utf8')).records
// the record of each lock entry: the part after its last ':' or '~' (as data/viewerRoute.js reads it)
const ALL = [...new Set(LOCK.map((r) => r.split(/[:~]/).pop()).filter((id) => id !== 'none'))].sort()
const asked = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const IDS = asked.length ? asked : ALL
const SHELL = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const { existsSync } = await import('node:fs')
const browser = await chromium.launch({ ...(existsSync(SHELL) ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu'] })
let fails = 0
const fail = (msg) => {
  fails++
  console.log(`  FAIL ${msg}`)
}
const E = 0.5 // px: rounding

// measured in the page: the scan's corners, the stage, the card and its parts, each part's clipping
const measure = () => {
  const rect = (el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
  }
  const stageEl = document.querySelector('.letter-stage')
  const kind = [...(stageEl?.classList || [])].find((c) => c.startsWith('stage-'))?.slice(6) || null
  let scan = null
  if (kind === 'letter' || kind === 'sheet' || kind === 'document') scan = window.__viewerScan?.() || null
  else if (kind === 'photo' || kind === 'photoset') {
    // the painted picture inside the img box (object-fit: contain), unzoomed
    const img = document.querySelector('.photo-stage img')
    if (img && img.naturalWidth) {
      const b = rect(img)
      const bw = b.right - b.left
      const bh = b.bottom - b.top
      const k = Math.min(bw / img.naturalWidth, bh / img.naturalHeight)
      const w = img.naturalWidth * k
      const h = img.naturalHeight * k
      scan = { left: b.left + (bw - w) / 2, right: b.left + (bw + w) / 2, top: b.top + (bh - h) / 2, bottom: b.top + (bh + h) / 2, zoomed: img.classList.contains('is-zoomed') }
    }
  }
  return { kind, scan, stage: stageEl ? rect(stageEl) : null, vw: document.documentElement.clientWidth, vh: document.documentElement.clientHeight }
}
// each part of the card, scrolled into view (the card or the viewer may scroll), and every box that clips it
const cardParts = () => {
  const card = document.querySelector('.object-card')
  if (!card) return null
  const rect = (el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
  }
  const clips = (el) => {
    const out = []
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p)
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) out.push([p.className || p.tagName, rect(p)])
    }
    return out
  }
  // the card's box at rest (before any part is scrolled into view), and whether something above it scrolls
  const box = rect(card)
  const scrolls = clips(card).length > 0
  const parts = [['title', card.querySelector('.letter-title')], ...[...card.querySelectorAll('button, a.btn-glass, a.btn-cream')].map((b) => [`button "${(b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)}"`, b])]
  // the rights rows: each meta row (its term and its text) in the card
  for (const dt of card.querySelectorAll('.object-meta dt')) parts.push([`row "${dt.textContent.trim()}"`, dt], [`row "${dt.textContent.trim()}" text`, dt.nextElementSibling])
  const out = []
  for (const [name, el] of parts) {
    if (!el) continue
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    out.push({ name, r: rect(el), clips: clips(el), wide: el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1 })
  }
  return { box, scrolls, parts: out }
}

const onlyVp = process.argv.find((a) => a.startsWith('--viewports='))?.slice(12).split(',') || null
for (const [vp, opts] of Object.entries(VIEWPORTS).filter(([k]) => !onlyVp || onlyVp.includes(k))) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  let n = 0
  for (const id of IDS) {
    const tag = `${vp} ${id}`
    try {
      await page.goto(`${BASE}/tour.html?viewer=${id}`)
      await page.waitForSelector('.artifact-viewer [data-viewer-ready="true"]', { timeout: 30000 })
      await page.waitForTimeout(400) // the sheet's lens and the photograph's layout settle
      const m = await page.evaluate(measure)
      const W = m.vw
      const H = m.vh
      const inside = (r, b) => r.left >= b.left - E && r.top >= b.top - E && r.right <= b.right + E && r.bottom <= b.bottom + E
      const px = (r) => JSON.stringify([r.left, r.top, r.right, r.bottom].map(Math.round))
      if (m.kind !== 'model') {
        if (!m.scan) fail(`${tag}: no scan reading (${m.kind})`)
        else if (m.scan.zoomed) fail(`${tag}: the photograph opens zoomed in`)
        else {
          const win = { left: 0, top: 0, right: W, bottom: H }
          if (!inside(m.scan, m.stage)) fail(`${tag}: the scan ${px(m.scan)} runs past the viewer's stage ${px(m.stage)} (${m.kind})`)
          if (!inside(m.scan, win)) fail(`${tag}: the scan ${px(m.scan)} runs past the ${W}x${H} window (${m.kind})`)
        }
      }
      const c = await page.evaluate(cardParts)
      if (!c) fail(`${tag}: no card`)
      else {
        if (c.box.left < -E || c.box.right > W + E) fail(`${tag}: the card ${px(c.box)} runs past the window's sides (${W} px)`)
        if (!c.scrolls && (c.box.top < -E || c.box.bottom > H + E)) fail(`${tag}: the card ${px(c.box)} runs past the window's top or foot (${H} px) and nothing scrolls`)
        for (const p of c.parts) {
          if (!inside(p.r, { left: 0, top: 0, right: W, bottom: H })) fail(`${tag}: the card's ${p.name} ${px(p.r)} is outside the ${W}x${H} window`)
          for (const [who, b] of p.clips) if (!inside(p.r, b)) fail(`${tag}: the card's ${p.name} ${px(p.r)} is cut by ${who} ${px(b)}`)
          if (p.wide) fail(`${tag}: the card's ${p.name} is wider than its box (cut)`)
        }
      }
      n++
    } catch (e) {
      fail(`${tag}: ${String(e.message || e).split('\n')[0]}`)
    }
  }
  console.log(`${vp}: ${n} of ${IDS.length} records checked`)
  await ctx.close()
}
await browser.close()
console.log(fails ? `FAILURES: ${fails}` : 'ALL OK')
process.exit(fails ? 1 : 0)
