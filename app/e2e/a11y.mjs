// Accessibility and phone pass (spec section 5): phone layout at 390 px with no horizontal scroll,
// reduced motion = cuts, keyboard reachable, screen-reader labels and live captions, the sound toggle.
//  axe     axe-core (WCAG 2.0-2.2 A/AA and best practice) on the embed page (poster, started, address note) and the landing (entrance, first inductee
//          slide, a story point's card), one chapter per tier
//          (Einstein's study = room, Albright's birth = photo, Lamarr's big work = gallery), the Begin
//          splash, Moments and the artifact viewer, desktop and 390 x 844: 0
//          violations of any impact (undecided checks are listed). On the same pages every control in the
//          accessibility tree (button, link, tab, checkbox, slider, menu item, text box) has a name,
//          and the guide's caption is in a polite aria-live region while it shows.
//  keys    Einstein's whole tour with the keyboard only: Enter on Begin, Tab to every control, the
//          number keys pick each stop, Esc closes a record's viewer (focus back on its dot), Tab to a
//          dot and ArrowRight moves to the next stop, M mutes and unmutes, Tab + Enter on Next, and the
//          last Next ends the tour on the landing. No mouse event is sent. A viewer whose opener is
//          gone gives focus to the current stop's dot.
//  motion  prefers-reduced-motion: reduce, one chapter per tier: picking a stop cuts the camera to
//          it (the pose 150 ms after the pick is the pose 1.5 s later, and it moved); the gallery opens
//          on its start pose with no glide in from the door; nothing in the tour stage has a CSS transition or
//          animation longer than 10 ms.
//  phone   390 x 844, every chapter of every inductee (its map leg and its place) and a record's
//          viewer: no horizontal scroll; every HUD control, the title block and the caption inside the
//          viewport (not cut off); no two of them overlap. Screenshots: --shots.
// Exit 1 on any failure. Needs the dev server (npm run dev, http://localhost:5173).
// usage: node e2e/a11y.mjs [axe] [keys] [motion] [phone] [--shots]   (no section: all four)
//        --shots writes screenshots to SHOTS (default mockup-shots/task15/)
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Playwright and @axe-core/playwright: the app's devDependencies, else $SITE_MODULES (browser.mjs); the
// headless shell is the newest one Playwright installed (Playwright's own default when there is none).
const { chromium, loadAxe } = await import('./browser.mjs')
const AxeBuilder = await loadAxe()

const BASE = process.env.BASE || 'http://localhost:5173'
const SECTIONS = ['axe', 'keys', 'motion', 'phone']
const asked = process.argv.slice(2).filter((a) => SECTIONS.includes(a))
const want = (s) => !asked.length || asked.includes(s)
const shots = process.argv.includes('--shots')
const shotDir = (process.env.SHOTS || fileURLToPath(new URL('../mockup-shots/task15/', import.meta.url))).replace(/\/?$/, '/')
if (shots) mkdirSync(shotDir, { recursive: true })
const SHELL = (() => {
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (!existsSync(cache)) return null
  const builds = readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  for (const b of builds) {
    const p = join(cache, b, 'chrome-headless-shell-mac-arm64/chrome-headless-shell')
    if (existsSync(p)) return p
  }
  return null
})()
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
// one chapter per tier (spec 2.3)
const TIERS = [
  { tier: 'room', slug: 'einstein', chapter: 'big-work' },
  { tier: 'photo', slug: 'albright', chapter: 'birth' },
  { tier: 'gallery', slug: 'lamarr', chapter: 'big-work' },
]
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5

const browser = await chromium.launch({ ...(SHELL ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu'] })
let fails = 0
const fail = (msg) => {
  fails++
  console.log(`  FAIL ${msg}`)
}

async function withPage(opts, fn, tag) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  try {
    await fn(page)
  } catch (e) {
    fail(`${tag}: ${e.message.split('\n')[0]}`)
  } finally {
    for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
    await ctx.close()
  }
}

const placeReady = (page, ch, timeout = 90000) =>
  page.waitForSelector(`.tour-stage[data-chapter="${ch}"][data-phase="room"][data-ready="true"]`, { timeout })

// open a chapter at its place, the tour begun (autostart; a map leg is skipped with Next)
async function openPlace(page, slug, chapter, extra = {}) {
  await page.goto(`${BASE}/tour.html?inductee=${slug}&chapter=${chapter}&autostart=1`)
  const phase = await page.waitForSelector(`.tour-stage[data-chapter="${chapter}"]`, { timeout: 90000 })
  if ((await phase.getAttribute('data-phase')) === 'map' && !extra.keepMap) await page.click('[data-hud=next]')
  await placeReady(page, chapter)
  await page.waitForTimeout(1500)
}

// ---------- axe, names, live captions ----------
async function axe(page, tag) {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  for (const v of r.violations) {
    const where = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')
    fail(`${tag}: axe ${v.impact} ${v.id} (${v.nodes.length}): ${v.help} @ ${where}`)
  }
  // "incomplete": axe could not decide (text over the WebGL canvas has no background it can read, so
  // its colour contrast is always undecided). Listed, never passed silently; contrast of the HUD's
  // glass over the canvas is judged from the screenshots.
  for (const v of r.incomplete) {
    const where = v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')
    console.log(`  incomplete ${tag}: axe ${v.id} (${v.nodes.length}): ${v.help} @ ${where}`)
  }
  console.log(`${tag}: axe ${r.violations.length} violation(s), ${r.incomplete.length} undecided, ${r.passes.length} rule(s) passed`)
}

// every control in the accessibility tree has a name
const CONTROL_ROLES = new Set(['button', 'link', 'tab', 'checkbox', 'radio', 'slider', 'menuitem', 'textbox', 'combobox', 'switch', 'spinbutton', 'searchbox'])
async function names(page, tag) {
  const cdp = await page.context().newCDPSession(page)
  const { nodes } = await cdp.send('Accessibility.getFullAXTree')
  let n = 0
  for (const node of nodes) {
    const role = node.role?.value
    if (node.ignored || !CONTROL_ROLES.has(role)) continue
    n++
    const name = (node.name?.value || '').trim()
    if (!name) fail(`${tag}: a ${role} has no accessible name (backend node ${node.backendDOMNodeId})`)
  }
  await cdp.detach()
  console.log(`${tag}: ${n} control(s), each named`)
}

// the shown caption is announced: a polite live region carries the same text
async function liveCaption(page, tag) {
  const shown = await page.waitForSelector('.speech-bubble.is-on .speech-text', { timeout: 20000 }).catch(() => null)
  if (!shown) return fail(`${tag}: no caption showed`)
  const r = await page.evaluate(() => {
    const text = document.querySelector('.speech-bubble.is-on .speech-text')?.textContent || ''
    const live = [...document.querySelectorAll('[aria-live]')].filter((el) => el.getAttribute('aria-live') !== 'off' && !el.closest('[aria-hidden="true"]'))
    return { text, live: live.map((el) => ({ mode: el.getAttribute('aria-live'), text: el.textContent || '' })) }
  })
  if (!r.live.some((l) => l.mode === 'polite' && l.text.includes(r.text))) fail(`${tag}: caption "${r.text.slice(0, 50)}" is in no polite aria-live region`)
  else console.log(`${tag}: caption announced through aria-live=polite`)
}

async function axeSection() {
  for (const [dev, opts] of Object.entries(DEVICES)) {
    await withPage(opts, async (page) => {
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await axe(page, `${dev} landing`)
      await names(page, `${dev} landing`)
      // the inductees' slides, and a story point's card open on the first
      await page.evaluate(() => window.scrollTo(0, document.getElementById('inductees').offsetTop))
      await page.waitForSelector('.slide.is-active', { timeout: 30000 })
      await page.waitForTimeout(4500)
      if (dev === 'phone') {
        const sw = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth))
        if (sw > 390) fail(`phone landing: horizontal scroll (${sw} > 390)`)
      }
      await axe(page, `${dev} landing slide`)
      await names(page, `${dev} landing slide`)
      const opener = page.locator(dev === 'phone' ? '.slide.is-active .chip' : '.slide.is-active .art').first()
      await opener.scrollIntoViewIfNeeded()
      await opener.click()
      await page.waitForSelector('.slide.is-active .story-card', { timeout: 5000 })
      await page.waitForTimeout(700)
      await axe(page, `${dev} landing story card`)
      await names(page, `${dev} landing story card`)
    }, `${dev} landing`)

    await withPage(opts, async (page) => {
      await page.goto(`${BASE}/tour.html?inductee=einstein&chapter=big-work`)
      await page.waitForSelector('.tour-splash .btn-cream', { timeout: 90000 })
      await axe(page, `${dev} Begin splash`)
      await names(page, `${dev} Begin splash`)
    }, `${dev} Begin splash`)

    for (const t of TIERS) {
      const tag = `${dev} ${t.slug}/${t.chapter} (${t.tier})`
      await withPage(opts, async (page) => {
        await openPlace(page, t.slug, t.chapter)
        await liveCaption(page, tag)
        await axe(page, tag)
        await names(page, tag)
      }, tag)
    }

    await withPage(opts, async (page) => {
      await page.goto(`${BASE}/tour.html?view=moments`, { waitUntil: 'networkidle' })
      await page.waitForSelector('.mom-float')
      await page.waitForTimeout(1200)
      await axe(page, `${dev} Moments`)
      await names(page, `${dev} Moments`)
    }, `${dev} Moments`)

    // the WordPress embed page (embed.html): the poster, then the started state with the address note
    // that stands in for a refused new tab, which is shown on a fresh page (axe sees the top document)
    await withPage(opts, async (page) => {
      await page.goto(`${BASE}/embed.html`, { waitUntil: 'networkidle' })
      await axe(page, `${dev} embed poster`)
      await names(page, `${dev} embed poster`)
      await page.getByRole('button', { name: 'Start the museum' }).click()
      await page.locator('#fs, #open-bar').first().waitFor({ state: 'visible' })
      await axe(page, `${dev} embed started`)
      await names(page, `${dev} embed started`)
      await page.evaluate(() => window.IHHExternalLinks.showAddress('https://example.org/', document, null))
      await axe(page, `${dev} embed address note`)
      await names(page, `${dev} embed address note`)
    }, `${dev} embed`)

    // the viewer, opened from a stop with a record in each tier
    for (const t of TIERS) {
      const tag = `${dev} viewer ${t.slug}/${t.chapter}`
      await withPage(opts, async (page) => {
        await openPlace(page, t.slug, t.chapter)
        const id = await page.evaluate(async ({ slug, chapter }) => {
          const { TOURS } = await import('/src/tour/data/index.js')
          const ch = TOURS[slug].chapters.find((c) => c.id === chapter)
          return ch.stops.find((s) => s.art || s.artifact)?.id || null
        }, t)
        if (!id) return fail(`${tag}: no stop with a record`)
        await page.click(`[data-stop="${id}"]`)
        await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 })
        await page.waitForTimeout(1200)
        await axe(page, tag)
        await names(page, tag)
      }, tag)
    }
  }
}

// ---------- keyboard-only walk of Einstein's tour ----------
const active = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    return el ? { hud: el.getAttribute('data-hud'), stop: el.getAttribute('data-stop'), cls: el.className?.baseVal ?? el.className, name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 40), inDialog: Boolean(el.closest('[role=dialog]')) } : null
  })

// Tab until the focused element matches, at most `max` presses; returns false if never
async function tabTo(page, pred, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const a = await active(page)
    if (a && pred(a)) return true
  }
  return false
}

async function keysSection() {
  const tag = 'keys einstein'
  await withPage(DEVICES.desktop, async (page) => {
    // a mouse event anywhere fails the walk
    await page.exposeFunction('__mouseUsed', (type) => fail(`${tag}: a ${type} event reached the page`))
    await page.addInitScript(() => {
      for (const t of ['mousedown', 'pointerdown', 'click']) window.addEventListener(t, (e) => e.isTrusted && e.detail > 0 && window.__mouseUsed(t), true)
    })
    const tours = await (async () => {
      await page.goto(`${BASE}/tour.html?inductee=einstein`)
      return page.evaluate(async () => {
        const { TOURS } = await import('/src/tour/data/index.js')
        return TOURS.einstein.chapters.map((c) => ({ id: c.id, map: Boolean(c.map), tier: c.place.tier, stops: c.stops.map((s) => ({ id: s.id, opens: Boolean(s.art || s.artifact) })) }))
      })
    })()
    await page.waitForSelector('.tour-splash .btn-cream', { timeout: 90000 })
    const a0 = await active(page)
    if (!a0 || !/btn-cream/.test(a0.cls)) fail(`${tag}: Begin is not focused on load (${JSON.stringify(a0)})`)
    await page.keyboard.press('Enter')
    await page.waitForSelector('.tour-splash', { state: 'detached', timeout: 10000 })

    for (const [i, c] of tours.entries()) {
      const ct = `${tag} ${i + 1}/${tours.length} ${c.id} (${c.tier})`
      await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"]`, { timeout: 30000 })
      if (c.map) {
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 30000 })
        if (!(await tabTo(page, (a) => a.hud === 'next'))) fail(`${ct}: Tab never reached Next on the map leg`)
        await page.keyboard.press('Enter')
      }
      await placeReady(page, c.id)
      await page.waitForTimeout(1200)
      // every HUD control is reachable with Tab
      const reached = new Set()
      for (let k = 0; k < 30; k++) {
        await page.keyboard.press('Tab')
        const a = await active(page)
        if (a?.hud) reached.add(a.hud)
        if (a?.stop) reached.add('stop')
        if (/hud-sound/.test(a?.cls || '')) reached.add('sound')
        if (/hud-end/.test(a?.cls || '')) reached.add('end')
      }
      const need = ['next', 'moments', 'sound', 'end', ...(c.stops.length ? ['stop'] : [])]
      const missing = need.filter((x) => !reached.has(x))
      if (missing.length) fail(`${ct}: Tab never reached ${missing.join(', ')}`)
      // number keys pick each stop; a record opens in the viewer, Esc closes it
      for (const [k, s] of c.stops.slice(0, 9).entries()) {
        await page.keyboard.press(String(k + 1))
        await page.waitForFunction((id) => document.querySelector(`[data-stop="${id}"]`)?.getAttribute('aria-current') === 'true', s.id, { timeout: 5000 }).catch(() => fail(`${ct}: key ${k + 1} did not pick ${s.id}`))
        if (s.opens) {
          const viewer = await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 }).catch(() => null)
          if (!viewer) {
            fail(`${ct}: stop ${s.id} did not open its record`)
            continue
          }
          const inside = await active(page)
          if (!inside?.inDialog) fail(`${ct}: focus is not inside the viewer when it opens (${JSON.stringify(inside)})`)
          await page.keyboard.press('Escape')
          const closed = await page.waitForSelector('.artifact-viewer', { state: 'detached', timeout: 5000 }).catch(() => null)
          if (closed === null && (await page.$('.artifact-viewer'))) fail(`${ct}: Esc did not close the viewer of ${s.id}`)
          await page.waitForFunction(() => document.activeElement && document.activeElement !== document.body, null, { timeout: 1000 }).catch(() => {})
          const after = await active(page)
          if (after?.stop !== s.id) fail(`${ct}: focus did not go back to dot ${k + 1} after closing the viewer of ${s.id} (${JSON.stringify(after)})`)
        } else await page.waitForTimeout(600)
      }
      // arrow right on a focused dot moves to the next stop and picks it
      if (c.stops.length > 1) {
        // Tab reaches the dots' one tab stop (the current stop's dot); ArrowRight moves to the next
        if (!(await tabTo(page, (x) => Boolean(x.stop)))) fail(`${ct}: Tab never reached a stop dot`)
        const from = (await active(page))?.stop
        const i = c.stops.findIndex((x) => x.id === from)
        const to = c.stops[(i + 1) % c.stops.length].id
        await page.keyboard.press('ArrowRight')
        const a = await active(page)
        if (a?.stop !== to) fail(`${ct}: ArrowRight on dot ${i + 1} did not move to the next dot (${JSON.stringify(a)})`)
        if (await page.$('.artifact-viewer')) await page.keyboard.press('Escape')
        await page.waitForSelector('.artifact-viewer', { state: 'detached', timeout: 5000 }).catch(() => fail(`${ct}: Esc did not close the viewer after the arrow`))
      }
      // M mutes and unmutes
      await page.keyboard.press('m')
      if (!(await page.$('.hud-sound.is-muted'))) fail(`${ct}: M did not mute`)
      await page.keyboard.press('m')
      if (await page.$('.hud-sound.is-muted')) fail(`${ct}: M did not unmute`)
      // Tab to Next, Enter
      if (!(await tabTo(page, (a) => a.hud === 'next'))) fail(`${ct}: Tab never reached Next`)
      await page.keyboard.press('Enter')
      console.log(`${ct} done`)
    }
    await page.waitForURL(`${BASE}/`, { timeout: 15000 }).catch(() => fail(`${tag}: the last Next did not end the tour on the landing (${page.url()})`))
  }, tag)
}

// The viewer's opener is gone when it closes (a hotspot that unmounted): focus goes to the current
// stop's dot, not to <body>. The opener is a stand-in button removed while the viewer is up.
async function focusFallback() {
  const tag = 'keys focus fallback einstein/big-work'
  await withPage(DEVICES.desktop, async (page) => {
    await openPlace(page, 'einstein', 'big-work')
    const id = await page.evaluate(async () => {
      const { TOURS } = await import('/src/tour/data/index.js')
      return TOURS.einstein.chapters.find((c) => c.id === 'big-work').stops.find((s) => s.art || s.artifact).id
    })
    await page.evaluate((s) => {
      const b = document.createElement('button')
      b.id = 'gone-opener'
      b.textContent = 'opener'
      document.body.append(b)
      b.focus()
      window.__tourApi.select(s)
    }, id)
    await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 })
    await page.evaluate(() => document.getElementById('gone-opener').remove())
    await page.keyboard.press('Escape')
    await page.waitForSelector('.artifact-viewer', { state: 'detached', timeout: 5000 })
    await page.waitForFunction(() => document.activeElement && document.activeElement !== document.body, null, { timeout: 1000 }).catch(() => {})
    const a = await active(page)
    if (a?.stop !== id) fail(`${tag}: with its opener gone, focus did not go to dot ${id} (${JSON.stringify(a)})`)
    else console.log(`${tag}: focus went to the current stop's dot`)
  }, tag)
}

// ---------- reduced motion: cuts ----------
const pose = (page) => page.evaluate(() => {
  const c = window.__tour3?.camera
  return c ? [...c.position.toArray(), ...c.quaternion.toArray()] : null
})
const delta = (a, b) => Math.max(...a.map((v, k) => Math.abs(v - b[k])))

async function motionSection() {
  for (const t of TIERS) {
    const tag = `reduced-motion ${t.slug}/${t.chapter} (${t.tier})`
    await withPage({ ...DEVICES.desktop, reducedMotion: 'reduce' }, async (page) => {
      await page.goto(`${BASE}/tour.html?inductee=${t.slug}&chapter=${t.chapter}&autostart=1`)
      const st = await page.waitForSelector(`.tour-stage[data-chapter="${t.chapter}"]`, { timeout: 90000 })
      if ((await st.getAttribute('data-phase')) === 'map') await page.click('[data-hud=next]')
      await placeReady(page, t.chapter)
      if (!(await page.$('.tour-stage.is-reduced'))) fail(`${tag}: the stage does not know motion is reduced`)
      // arrival: the pose does not change after the stage is in (no glide in from the door)
      const a0 = await pose(page)
      await page.waitForTimeout(1500)
      const a1 = await pose(page)
      if (!a0 || !a1) return fail(`${tag}: no camera`)
      if (delta(a0, a1) > 1e-3) fail(`${tag}: the camera moved on arrival (${delta(a0, a1).toExponential(2)})`)
      // picking each stop cuts to it
      const stops = await page.$$eval('[data-stop]', (els) => els.map((e) => e.getAttribute('data-stop')))
      let cuts = 0
      for (const id of stops.slice(0, 3)) {
        const p0 = await pose(page)
        // every frame from the pick: the camera's pose, and whether a photo room is still searching the stop's view (fix
        // round 12: with no view found ahead, the view is searched a few milliseconds a frame and cut to once found)
        await page.evaluate(() => {
          const tr = (window.__cutTrace = [])
          const t0 = performance.now()
          const loop = () => {
            const c = window.__tour3?.camera
            if (c) tr.push({ t: performance.now() - t0, p: [...c.position.toArray(), ...c.quaternion.toArray()], pending: Boolean(window.__photoFocusPending?.()) })
            if (performance.now() - t0 < 6000) requestAnimationFrame(loop)
          }
          requestAnimationFrame(loop)
        })
        // not awaited: select() resolves only after the guide has spoken
        await page.evaluate((s) => {
          window.__tourApi.select(s)
        }, id)
        await page.waitForTimeout(6200)
        const p2 = await pose(page)
        const tr = await page.evaluate(() => window.__cutTrace)
        const moved = delta(p0, p2)
        const near = (a, b) => delta(a, b) <= 0.02 * moved + 1e-4
        // a cut: no frame shows the camera between where it was and its pose; and it is on its pose within 150 ms of the
        // pick, or of the end of the search for the stop's view (a photo room with no view found ahead)
        const between = tr.filter((x) => !near(x.p, p0) && !near(x.p, p2))
        const searchEnd = tr.reduce((e, x) => (x.pending ? null : e ?? x.t), null) ?? 0
        const lastPending = tr.filter((x) => x.pending).at(-1)?.t ?? null
        const from = lastPending == null ? 0 : searchEnd
        const at = tr.find((x) => x.t >= from + 150)
        if (moved < 1e-3) {
          console.log(`${tag}: stop ${id} keeps the view (no camera move)`)
        } else if (between.length) fail(`${tag}: stop ${id} tweens (${between.length} frames between its start and its pose, the first ${Math.round(between[0].t)} ms in)`)
        else if (at && !near(at.p, p2)) fail(`${tag}: stop ${id} is not on its pose 150 ms ${lastPending == null ? 'after the pick' : 'after its view was found'} (${delta(at.p, p2).toFixed(4)} of ${moved.toFixed(4)})`)
        else cuts++
        if (await page.$('.artifact-viewer')) await page.keyboard.press('Escape')
        await page.evaluate(() => window.__tourApi.back())
        await page.waitForTimeout(400)
        const p3 = await pose(page)
        await page.waitForTimeout(1200)
        const p4 = await pose(page)
        if (delta(p3, p4) > 1e-3) fail(`${tag}: stepping back from ${id} tweens (${delta(p3, p4).toFixed(4)} after 400 ms)`)
      }
      if (!cuts) fail(`${tag}: no stop moved the camera, so no cut was seen`)
      // the HUD has no transition or animation longer than 10 ms
      const slow = await page.evaluate(() => {
        const ms = (v) => Math.max(...v.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000)))
        return [...document.querySelectorAll('.tour-stage, .tour-stage *')]
          .map((el) => ({ el, cs: getComputedStyle(el) }))
          .filter(({ cs }) => (cs.transitionProperty !== 'none' && ms(cs.transitionDuration) > 10) || (cs.animationName !== 'none' && ms(cs.animationDuration) > 10))
          .map(({ el, cs }) => `${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).split(' ')[0]} (${cs.transitionProperty} ${cs.transitionDuration}; ${cs.animationName} ${cs.animationDuration})`)
      })
      for (const s of [...new Set(slow)].slice(0, 12)) fail(`${tag}: moves with reduced motion: ${s}`)
      console.log(`${tag}: ${cuts} cut(s)`)
    }, tag)
  }
}

// ---------- 390 x 844 layout, every chapter ----------
async function phoneLayout(page, tag) {
  const r = await page.evaluate(() => {
    const vis = (el) => {
      const cs = getComputedStyle(el)
      const b = el.getBoundingClientRect()
      return cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05 && b.width > 0 && b.height > 0 ? b : null
    }
    const box = (el, name) => {
      const b = el && vis(el)
      return b ? { name, left: b.left, right: b.right, top: b.top, bottom: b.bottom } : null
    }
    const q = (s) => document.querySelector(s)
    const parts = [
      box(q('[data-hud=title]'), 'title'),
      box(q('.hud-actions'), 'actions'),
      box(q('.stop-dots'), 'dots'),
      box(q('.speech-bubble.is-on'), 'caption'),
      box(q('[data-hud=hear]'), 'hear'),
      box(q('[data-hud=next]'), 'next'),
      box(q('[data-hud=moments]'), 'moments'),
      box(q('.hud-back'), 'back'),
    ].filter(Boolean)
    // every control on screen (the HUD, the viewer) lies wholly inside the viewport
    const controls = [...document.querySelectorAll('.tour-hud button, .tour-hud a, .artifact-viewer button, .artifact-viewer a')]
      .map((el) => {
        const b = box(el, el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30) || el.className)
        return b && { ...b, el }
      })
      .filter(Boolean)
    // a control below the fold of a scrolling panel (the viewer's card on a phone, the series' date
    // row) is reached by scrolling it: it counts as cut off only when that panel is
    const scroller = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const cs = getComputedStyle(p)
        if ((/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight) || (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth)) return p
      }
      return null
    }
    for (const c of controls) c.scroller = box(scroller(c.el), 'scroller')
    // the viewer card's labels (DATED, PHOTOGRAPH, CATALOGUE ...) never run into their text
    const labels = [...document.querySelectorAll('.letter-lines li, .object-meta dt')]
      .map((el) => {
        const label = el.matches('dt') ? el : el.querySelector('.letter-line-label')
        const text = el.matches('dt') ? el.nextElementSibling : el.querySelector('.letter-line-text')
        if (!label || !text) return null
        const a = label.getBoundingClientRect()
        const t = text.getBoundingClientRect()
        // a label's words wider than its column overflow it (scrollWidth); or the boxes cross
        const over = label.scrollWidth > label.clientWidth + 0.5 || (a.right > t.left + 0.5 && a.bottom > t.top + 0.5 && t.bottom > a.top + 0.5 && a.left < t.right)
        return over ? label.textContent.trim() : null
      })
      .filter(Boolean)
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
    return { vw: innerWidth, vh: innerHeight, sw, parts, controls: controls.map(({ el, ...c }) => c), labels }
  })
  if (r.sw > r.vw) fail(`${tag}: horizontal scroll (${r.sw} > ${r.vw})`)
  const out = (c) => c.left < -0.5 || c.top < -0.5 || c.right > r.vw + 0.5 || c.bottom > r.vh + 0.5
  for (const c of [...r.parts, ...r.controls]) {
    const reach = c.scroller && !out(c.scroller) ? c.scroller : null
    if (out(c) && !reach) fail(`${tag}: ${c.name} is cut off ${JSON.stringify([c.left, c.top, c.right, c.bottom].map(Math.round))}`)
  }
  for (const l of r.labels) fail(`${tag}: the card label "${l}" runs into its text`)
  for (let a = 0; a < r.parts.length; a++)
    for (let b = a + 1; b < r.parts.length; b++) if (hit(r.parts[a], r.parts[b])) fail(`${tag}: ${r.parts[a].name} overlaps ${r.parts[b].name} ${JSON.stringify([r.parts[a], r.parts[b]].map((x) => [x.left, x.top, x.right, x.bottom].map(Math.round)))}`)
}

async function phoneSection() {
  const probe = await browser.newPage()
  await probe.goto(`${BASE}/tour.html?view=moments`)
  const tours = await probe.evaluate(async () => {
    const { TOURS } = await import('/src/tour/data/index.js')
    return Object.entries(TOURS)
      .filter(([, t]) => t.chapters)
      .map(([slug, t]) => ({ slug, chapters: t.chapters.map((c) => ({ id: c.id, tier: c.place.tier, map: Boolean(c.map), record: c.stops.find((s) => s.art || s.artifact)?.id || null })) }))
  })
  await probe.close()
  for (const tour of tours) {
    await withPage(DEVICES.phone, async (page) => {
      for (const c of tour.chapters) {
        const tag = `phone ${tour.slug} ${c.id} (${c.tier})`
        await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
        if (c.map) {
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"] canvas`, { timeout: 30000 })
          await page.waitForTimeout(2500)
          await phoneLayout(page, `${tag} map`)
          if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-map-phone.jpg`, type: 'jpeg', quality: 70 })
          await page.click('[data-hud=next]')
        }
        await placeReady(page, c.id)
        await page.waitForSelector('.speech-bubble.is-on', { timeout: 15000 }).catch(() => null)
        await page.waitForTimeout(2000)
        await phoneLayout(page, tag)
        if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-phone.jpg`, type: 'jpeg', quality: 70 })
        if (c.record) {
          await page.click(`[data-stop="${c.record}"]`)
          const v = await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 }).catch(() => null)
          if (!v) fail(`${tag}: stop ${c.record} did not open its record`)
          else {
            await page.waitForTimeout(1200)
            await phoneLayout(page, `${tag} viewer ${c.record}`)
            if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-viewer-phone.jpg`, type: 'jpeg', quality: 70 })
          }
        }
        console.log(`${tag} done`)
      }
    }, `phone ${tour.slug}`)
  }
}

try {
  if (want('axe')) await axeSection()
  if (want('keys')) {
    await keysSection()
    await focusFallback()
  }
  if (want('motion')) await motionSection()
  if (want('phone')) await phoneSection()
} catch (e) {
  fail(`run: ${e.message.split('\n')[0]}`)
} finally {
  await browser.close()
}
console.log(fails ? `FAILURES: ${fails}` : 'ALL OK')
process.exit(fails ? 1 : 0)
