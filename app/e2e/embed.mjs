// WordPress embed (spec section 6): embed.html inside a host page that inserts the iframe the way
// WordPress does (LESSONS 2026-10-09: an earlier host pasted the oEmbed html as-is, but WordPress
// swaps the sandbox for "allow-scripts" only, which kills target=_blank links in a real embed).
// The host is served from another origin than the museum. Variants of the iframe:
//   hardened-sandbox  sandbox="allow-scripts" security="restricted" (the sandbox wp-embed.js applies to a WordPress embed), allow=fullscreen
//   sandbox-popups    sandbox="allow-scripts allow-same-origin allow-popups", allow=fullscreen
//   custom-html       no sandbox (a Custom HTML block, the recommended snippet), allow=fullscreen
//   hardened-no-fullscreen  sandbox="allow-scripts", no allow=fullscreen attribute
// Embed option B (owner ruling 2026-10-24): the site sends no CORS headers, so a frame with an opaque
// origin (the two hardened variants) cannot run the tour. There the poster must offer the "Open the
// museum" link card instead: no Start button, no tour frame, a visible poster (never a blank frame),
// and the card opens a tab or shows the address (never a dead link), keeping a chapter's query.
// In the other variants: the poster and its controls have accessible names; "Open the museum" opens a
// tab; Start loads the tour inside the frame; Begin starts the guide's audio (autoplay policy: user
// gesture required) and the sound toggle shows "Mute guide"; Fullscreen works (and goes back); the
// artifact viewer's "View at the holder" link opens a tab. In custom-html every inductee's first,
// Arriving and Big work chapters load inside the cross-origin frame. No request fails. Exit 1 on any failure.
// Needs a build (npm run build): it serves dist/ itself (the museum on :4100, the host on :4101).
// usage: npm run build && npm run e2e:embed [-- variant ...]   (EMBED_DEBUG=1 prints the bar/HUD boxes)
import { createServer } from 'node:http'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const { chromium } = await import('./browser.mjs') // the app's devDependency, else $SITE_MODULES
// the newest headless shell Playwright installed (Playwright's own default when there is none), as a11y.mjs does
const SHELL = (() => {
  const cache = join(homedir(), 'Library/Caches/ms-playwright')
  if (!existsSync(cache)) return null
  const builds = readdirSync(cache).filter((d) => d.startsWith('chromium_headless_shell-')).sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  for (const b of builds) {
    const dir = join(cache, b)
    for (const sub of readdirSync(dir)) {
      const exe = join(dir, sub, 'chrome-headless-shell')
      if (existsSync(exe)) return exe
    }
  }
  return null
})()
const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
if (!existsSync(join(DIST, 'embed.html'))) {
  console.error('dist/embed.html missing: run npm run build first')
  process.exit(1)
}
// two servers on free ports; "127.0.0.1" and "localhost" make the host a different origin from the museum
let MUSEUM = ''
let HOST = ''
// a record the tours declare (records.lock.json): ?viewer= opens no other (round 9 fix round 6, data/viewerRoute.js)
const VIEWER = 'EIN-M-0013'
const SOURCE = 'https://catalog.archives.gov/id/276538325' // EIN-M-0013's source in tour/data/einstein-artifacts.js

const VARIANTS = {
  'hardened-sandbox': { sandbox: 'allow-scripts', security: true, fullscreen: true, popups: false, origin: 'null' },
  'sandbox-popups': { sandbox: 'allow-scripts allow-same-origin allow-popups', fullscreen: true, popups: true, origin: 'museum' },
  'custom-html': { sandbox: null, fullscreen: true, popups: true, origin: 'museum' },
  'hardened-no-fullscreen': { sandbox: 'allow-scripts', security: true, fullscreen: false, popups: false, origin: 'null' },
}
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const names = only.length ? only : Object.keys(VARIANTS)
for (const n of names) if (!VARIANTS[n]) { console.error(`unknown variant ${n}`); process.exit(1) }

// the museum: dist/ with the headers vercel.json declares (option B: none for CORS, so an
// opaque-origin frame cannot fetch the tour's modules; the poster's link card is its way in)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.glb': 'model/gltf-binary', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const rules = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).headers.map((h) => ({ re: new RegExp(`^${h.source}$`), headers: h.headers }))
// negative cases: paths the museum answers 404 for (BLOCKED, any method), answers 500 once for a GET
// (FAIL_GET_ONCE: the HEAD probe passes, the model load fails), or never answers the first GET for
// (HANG_GET_ONCE: that connection stays open, stalled, for the rest of the run; a later GET is
// answered, so a retry recovers only if it does not wait on the stalled request)
const BLOCKED = new Set()
const FAIL_GET_ONCE = new Set()
const HANG_GET_ONCE = new Set()
const stalled = []
const museum = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (BLOCKED.has(path)) return res.writeHead(404).end('not found')
  if (req.method === 'GET' && FAIL_GET_ONCE.has(path)) {
    FAIL_GET_ONCE.delete(path)
    return res.writeHead(500).end('server error')
  }
  if (req.method === 'GET' && HANG_GET_ONCE.has(path)) {
    HANG_GET_ONCE.delete(path)
    stalled.push(res) // the response never comes
    return
  }
  let file = normalize(join(DIST, path))
  if (!file.startsWith(DIST)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) return res.writeHead(404).end('not found')
  const h = { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' }
  for (const r of rules) if (r.re.test(path)) for (const x of r.headers) h[x.key] = x.value
  const body = readFileSync(file)
  const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '')
  if (range) {
    const a = +range[1]
    const b = range[2] ? +range[2] : body.length - 1
    return res.writeHead(206, { ...h, 'Content-Range': `bytes ${a}-${b}/${body.length}`, 'Content-Length': b - a + 1, 'Accept-Ranges': 'bytes' }).end(body.subarray(a, b + 1))
  }
  res.writeHead(200, { ...h, 'Content-Length': body.length, 'Accept-Ranges': 'bytes' }).end(body)
})

// the host page: the iframe is inserted by script, the way wp-embed.js does it (setAttribute sandbox
// and security on a fresh iframe), not pasted as markup
const hostPage = (v, query) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Host page</title></head><body>
<h1>A WordPress post</h1><div id="slot" style="max-width:960px"></div>
<script>
  var f = document.createElement('iframe');
  f.setAttribute('src', ${JSON.stringify(`${MUSEUM}/embed.html${query}`)});
  f.setAttribute('title', 'Immigrant Hall of Honor');
  f.setAttribute('width', '960'); f.setAttribute('height', '600'); f.style.cssText = 'border:0;width:100%;max-width:960px;height:600px';
  f.setAttribute('class', 'wp-embedded-content');
  ${v.sandbox ? `f.setAttribute('sandbox', ${JSON.stringify(v.sandbox)});` : ''}
  ${v.security ? "f.setAttribute('security', 'restricted');" : ''}
  ${v.fullscreen ? "f.setAttribute('allow', 'fullscreen');" : ''}
  document.getElementById('slot').appendChild(f);
</script></body></html>`
let current = VARIANTS['custom-html']
const host = createServer((req, res) => {
  const u = new URL(req.url, 'http://x')
  res.writeHead(200, { 'Content-Type': 'text/html' }).end(hostPage(current, u.searchParams.get('q') || ''))
})
await new Promise((r) => museum.listen(0, '127.0.0.1', r))
await new Promise((r) => host.listen(0, '127.0.0.1', r))
MUSEUM = `http://127.0.0.1:${museum.address().port}`
HOST = `http://localhost:${host.address().port}`

const browser = await chromium.launch({
  ...(existsSync(SHELL) ? { executablePath: SHELL } : {}),
  args: ['--use-angle=metal', '--enable-gpu', '--autoplay-policy=user-gesture-required'],
})
let fails = 0
const fail = (m) => {
  fails++
  console.log(`  FAIL ${m}`)
}
const step = async (tag, fn) => {
  try {
    await fn()
  } catch (e) {
    fail(`${tag}: ${String(e.message || e).split('\n')[0]}`)
  }
}
const frameBy = (page, part) => page.frames().find((f) => f.url().includes(part))
const waitFrame = async (page, part) => {
  for (let i = 0; i < 100; i++) {
    const f = frameBy(page, part)
    if (f) return f
    await page.waitForTimeout(100)
  }
  throw new Error(`no frame ${part}`)
}

// allowed: paths a negative case breaks on purpose (their HTTP error or failed request is the point)
async function newHostPage(ctx, v, query = '', allowed = []) {
  current = v
  const page = await ctx.newPage()
  page.on('requestfailed', (r) => {
    if (/googleapis|gstatic|favicon/.test(r.url())) return
    if (allowed.includes(new URL(r.url()).pathname)) return
    if (r.failure()?.errorText === 'net::ERR_ABORTED') return // the page closed or moved on mid-prefetch; a CORS refusal is ERR_FAILED
    fail(`request failed: ${r.url()} (${r.failure()?.errorText})`)
  })
  // an HTTP error from the museum or the host (a missing model, texture, module) fails the run
  page.on('response', (r) => {
    if (r.status() < 400 || /favicon/.test(r.url())) return
    const path = new URL(r.url()).pathname
    if (allowed.includes(path)) return
    fail(`HTTP ${r.status()}: ${r.url()}`)
  })
  page.on('pageerror', (e) => {
    const msg = String(e.message || e).split('\n')[0]
    // a negative case's own broken asset surfaces as the loader's rejection; anything else is a failure
    if (allowed.some((p) => msg.includes(p))) return
    fail(`page error (${query || 'no query'}): ${msg}`)
  })
  await page.goto(`${HOST}/?q=${encodeURIComponent(query)}`)
  return page
}

// click a control that should open a tab (popups allowed) or show the address (not allowed)
async function opensOrShows(page, ctx, frame, click, v, expectUrl, tag, noteSel) {
  let popup = null
  const got = ctx.waitForEvent('page', { timeout: 2500 }).then((p) => (popup = p)).catch(() => null)
  await click()
  await got
  if (v.popups) {
    if (!popup) return fail(`${tag}: popups are allowed but no tab opened`)
    await popup.waitForLoadState('domcontentloaded').catch(() => {})
    if (!popup.url().startsWith(expectUrl)) fail(`${tag}: tab opened ${popup.url()}, expected ${expectUrl}`)
    await popup.close()
    if (await frame.locator(noteSel).isVisible().catch(() => false)) fail(`${tag}: the address note showed although the tab opened`)
  } else {
    if (popup) { await popup.close(); return fail(`${tag}: a tab opened although the sandbox has no allow-popups`) }
    const note = frame.locator(noteSel)
    if (!(await note.isVisible())) return fail(`${tag}: no tab and no address shown (dead link)`)
    const val = await note.locator('input').inputValue()
    if (!val.startsWith(expectUrl)) fail(`${tag}: address shown is ${val}, expected ${expectUrl}`)
    const ro = await note.locator('input').evaluate((i) => i.readOnly && document.activeElement === i)
    if (!ro) fail(`${tag}: the address is not a focused read-only field`)
    await page.keyboard.press('m') // typed in the note: must not reach the page's handlers (tour: M mutes)
    await page.keyboard.press('Escape')
    if (await note.isVisible()) fail(`${tag}: Esc did not close the address note`)
    if (!(await frame.evaluate(() => document.activeElement?.tagName === 'A'))) fail(`${tag}: focus did not return to the link after closing the note`)
  }
}

// option B in an opaque-origin frame: a visible poster with the link card, no Start, no tour frame,
// and a card that opens a tab or shows the address
async function linkOnly(page, ctx, emb, v, q, expectUrl) {
  const tag = `link-only${q ? ` ${q}` : ''}`
  await step(`${tag}: poster`, async () => {
    await emb.waitForSelector('#open-card')
    const st = await emb.evaluate(() => {
      const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight }
      return {
        state: document.getElementById('embed').dataset.state,
        start: !!document.getElementById('start'),
        note: vis(document.getElementById('sandboxed')),
        card: vis(document.getElementById('open-card')),
        poster: vis(document.getElementById('poster')),
        text: document.getElementById('poster').innerText.trim().length,
        href: document.getElementById('open-card').href,
      }
    })
    if (st.state !== 'link-only') fail(`${tag}: embed state is ${st.state}, expected link-only`)
    if (st.start) fail(`${tag}: the Start button shows although the frame cannot run the tour`)
    if (!st.poster || st.text < 40) fail(`${tag}: the poster is not visible (blank frame)`)
    if (!st.note) fail(`${tag}: no note says why the tour cannot run here`)
    if (!st.card) fail(`${tag}: the "Open the museum" link card is not visible`)
    if (st.href !== expectUrl) fail(`${tag}: link card points to ${st.href}, expected ${expectUrl}`)
  })
  await step(`${tag}: link card`, () => opensOrShows(page, ctx, emb, () => emb.getByRole('link', { name: /Open the museum in its own page/ }).click(), v, expectUrl, `${tag} card`, '#ext-link-note'))
  await step(`${tag}: modifier clicks stay native`, async () => {
    const seen = await emb.evaluate(() => {
      const a = document.getElementById('open-card')
      const out = []
      const spy = (e) => { out.push(e.defaultPrevented); e.preventDefault() }
      window.addEventListener('click', spy)
      for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }, {}]) a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
      window.removeEventListener('click', spy)
      return out
    })
    if (seen.slice(0, 4).some(Boolean)) fail(`${tag}: a modified click on the link card was hijacked ${JSON.stringify(seen)}`)
    if (seen[4] !== true) fail(`${tag}: a plain click is not handled by the sandbox fallback`)
    for (const p of ctx.pages()) if (p !== page) await p.close()
  })
  await step(`${tag}: no tour frame`, async () => {
    await page.waitForTimeout(1500)
    if (frameBy(page, 'tour.html')) fail(`${tag}: a tour frame loaded in an opaque-origin frame`)
  })
}

// Start the museum and Begin, step past a map leg with Next, then require the expected chapter in
// its place phase with its stage ready, and the network quiet. Nothing here is allowed to fail silently.
async function enterChapter(p, id) {
  const e = await waitFrame(p, 'embed.html')
  await e.getByRole('button', { name: 'Start the museum' }).click()
  const t = await waitFrame(p, 'tour.html')
  await t.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 60000 })
  await t.locator(`main[data-chapter="${id}"]`).waitFor({ timeout: 60000 })
  if ((await t.locator('main').getAttribute('data-phase')) === 'map') await t.locator('[data-hud=next]').click({ timeout: 15000 })
  await t.locator(`main[data-chapter="${id}"][data-phase="room"][data-ready="true"]`).waitFor({ timeout: 90000 })
  await p.waitForLoadState('networkidle', { timeout: 30000 })
  if (await t.locator('[data-room-error]').isVisible()) throw new Error(`room error: ${await t.locator('[data-room-error]').innerText()}`)
}

async function runVariant(name) {
  const v = VARIANTS[name]
  console.log(`variant ${name}`)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  await ctx.route('https://digital.library.ucla.edu/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>holder</title>' }))
  await ctx.addInitScript(() => {
    window.__plays = 0
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...a) {
      return play.apply(this, a).then((r) => { window.__plays++; return r })
    }
  })
  try {
    // 1. poster, origin, link card, fullscreen, Start, audio
    const page = await newHostPage(ctx, v)
    const emb = await waitFrame(page, 'embed.html')
    await step('origin', async () => {
      await emb.waitForSelector('#open-card')
      const o = await emb.evaluate(() => window.origin)
      const want = v.origin === 'museum' ? MUSEUM : 'null'
      if (o !== want) fail(`embed origin is ${o}, expected ${want}`)
    })
    await step('poster names', async () => {
      if (v.origin !== 'null') await emb.getByRole('button', { name: 'Start the museum' }).waitFor({ timeout: 3000 })
      await emb.getByRole('link', { name: /Open the museum in its own page/ }).waitFor({ timeout: 3000 })
      await emb.getByRole('heading', { name: 'Immigrant Hall of Honor' }).waitFor({ timeout: 3000 })
    })
    if (v.origin === 'null') {
      await linkOnly(page, ctx, emb, v, '', `${MUSEUM}/`)
      await page.close()
      // a chapter link keeps its chapter: the card opens tour.html with the same query
      for (const q of [`?inductee=lamarr&chapter=arriving`, `?viewer=${VIEWER}`]) {
        const p = await newHostPage(ctx, v, q)
        await linkOnly(p, ctx, await waitFrame(p, 'embed.html'), v, q, `${MUSEUM}/tour.html${q}`)
        await p.close()
      }
      return
    }
    await step('link card', () => opensOrShows(page, ctx, emb, () => emb.getByRole('link', { name: /Open the museum in its own page/ }).click(), v, `${MUSEUM}/`, 'link card', '#ext-link-note'))
    await step('start', async () => {
      await emb.getByRole('button', { name: 'Start the museum' }).click()
      const tour = await waitFrame(page, 'tour.html')
      await tour.getByRole('button', { name: /Begin the tour/ }).waitFor({ timeout: 60000 })
    })
    const tour = frameBy(page, 'tour.html')
    await step('fullscreen', async () => {
      const fs = emb.getByRole('button', { name: 'Fullscreen' })
      const bar = emb.getByRole('link', { name: 'Open the museum' })
      if (v.fullscreen) {
        await fs.waitFor({ state: 'visible', timeout: 3000 })
        if (await bar.isVisible()) fail('fullscreen is available but the Open the museum link replaces it')
        await fs.click()
        await page.waitForTimeout(600)
        if (!(await emb.evaluate(() => !!document.fullscreenElement))) return fail('Fullscreen did not enter fullscreen')
        if ((await fs.getAttribute('aria-pressed')) !== 'true') fail('fullscreen button is not aria-pressed while fullscreen')
        await fs.click()
        await page.waitForTimeout(600)
        if (await emb.evaluate(() => !!document.fullscreenElement)) fail('second press did not leave fullscreen')
        if ((await fs.getAttribute('aria-pressed')) !== 'false') fail('fullscreen button stays aria-pressed after leaving fullscreen')
      } else {
        if (await fs.isVisible()) fail('no allow=fullscreen but the Fullscreen button still shows')
        await bar.waitFor({ state: 'visible', timeout: 3000 })
        await opensOrShows(page, ctx, emb, () => bar.click(), v, `${MUSEUM}/`, 'bar link', '#ext-link-note')
      }
    })
    await step('modifier clicks stay native', async () => {
      // ctrl/cmd/shift/middle clicks on a link are not hijacked: nothing prevents the default by the time it bubbles up
      const seen = await emb.evaluate(() => {
        const a = document.getElementById('open-card')
        const out = []
        const spy = (e) => { out.push(e.defaultPrevented); e.preventDefault() }
        window.addEventListener('click', spy)
        for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }, {}]) a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
        window.removeEventListener('click', spy)
        return out
      })
      if (seen.slice(0, 4).some(Boolean)) fail(`a modified click on the link card was hijacked ${JSON.stringify(seen)}`)
      if (v.popups ? false : seen[4] !== true) fail('a plain click is not handled by the sandbox fallback')
      for (const p of ctx.pages()) if (p !== page) await p.close()
      const close = emb.locator('#ext-link-note').getByRole('button', { name: 'Close' })
      if (await close.isVisible()) await close.click()
    })
    await step('audio after tap', async () => {
      if ((await tour.evaluate(() => window.__plays)) !== 0) fail('audio played before any tap')
      await tour.getByRole('button', { name: /Begin the tour/ }).click()
      await tour.waitForFunction(() => window.__plays > 0, null, { timeout: 20000 })
      await tour.getByRole('button', { name: 'Mute guide' }).waitFor({ timeout: 3000 })
    })
    await step('top-right bar clear of the tour HUD, after Begin', async () => {
      for (const [w, h] of [[1280, 800], [390, 844]]) {
        await page.setViewportSize({ width: w, height: h })
        await page.waitForTimeout(800)
        const bar = await emb.evaluate(() => [...document.querySelectorAll('#bar > *')].filter((e) => !e.hidden).map((e) => { const r = e.getBoundingClientRect(); return { n: e.textContent.trim(), l: r.left, t: r.top, r: r.right, b: r.bottom } }))
        const off = await emb.evaluate(() => { const r = document.getElementById('tour').getBoundingClientRect(); return { x: r.left, y: r.top } })
        const hud = (await tour.evaluate(() => [...document.querySelectorAll('button, a, [role=button], input')].filter((e) => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.pointerEvents !== 'none' }).map((e) => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute('aria-label') || e.textContent || e.className).toString().trim().slice(0, 30), l: r.left, t: r.top, r: r.right, b: r.bottom } }))).map((x) => ({ n: x.n, l: x.l + off.x, t: x.t + off.y, r: x.r + off.x, b: x.b + off.y }))
        if (process.env.EMBED_DEBUG) console.log(w, JSON.stringify(bar), JSON.stringify(hud.map((x) => [x.n, Math.round(x.l), Math.round(x.t), Math.round(x.r), Math.round(x.b)])))
        for (const b of bar) for (const x of hud) if (b.l < x.r && x.l < b.r && b.t < x.b && x.t < b.b) fail(`${w}x${h}: embed bar "${b.n}" overlaps tour control "${x.n}"`)
        if (!bar.length || !hud.length) fail(`${w}x${h}: nothing to compare (bar ${bar.length}, tour controls ${hud.length})`)
      }
      await page.setViewportSize({ width: 1280, height: 800 })
    })
    await page.close()

    // 2. the artifact viewer's source link inside the frame
    const page2 = await newHostPage(ctx, v, `?viewer=${VIEWER}`)
    const emb2 = await waitFrame(page2, 'embed.html')
    await step('viewer source link', async () => {
      await emb2.getByRole('button', { name: 'Start the museum' }).click()
      const t = await waitFrame(page2, 'tour.html')
      const link = t.getByRole('link', { name: /View at the holder/ })
      await link.waitFor({ timeout: 60000 })
      const attrs = await link.evaluate((a) => ({ href: a.href, target: a.target }))
      if (attrs.href !== SOURCE) fail(`source link href ${attrs.href}`)
      await opensOrShows(page2, ctx, t, () => link.click(), v, SOURCE, 'source link', '#ext-link-note')
    })
    await page2.close()

    // 3. every inductee in the recommended Custom HTML iframe (cross-origin to the host): every
    // inductee's asset folders load inside the frame
    if (name === 'custom-html') {
      const all = JSON.parse(readFileSync(new URL('../src/tour/data/chapters.generated.json', import.meta.url), 'utf8'))
      for (const [slug, chs] of Object.entries(all)) {
        // first chapter, Arriving (Lamarr's is the Normandie photo room, textures from /rooms-demo) and Big work
        const ids = [...new Set([chs[0].id, 'arriving', 'big-work'])].filter((id) => chs.some((c) => c.id === id))
        for (const id of ids) {
          await step(`inductee ${slug}/${id}`, async () => {
            const p = await newHostPage(ctx, v, `?inductee=${slug}&chapter=${id}`)
            try {
              await enterChapter(p, id)
              console.log(`  loaded ${slug}/${id}`)
            } finally {
              await p.close()
            }
          })
        }
      }
      // negative cases: any asset of a place, a map leg or a record that fails or never arrives (the
      // room model's HEAD or GET, a prop, the guide, a photo room's texture, the map's land outlines and
      // earth, a record's page or model) shows the recoverable panel, never a blank stage and never
      // "ready"; Try again (which aborts what is still open and evicts what did not load) recovers once
      // the asset is back. A stalled first request stays open throughout: the retry must not wait on it.
      const GLB = (p) => `/models/${p}/${p}.glb`
      const MUIR_MAP = { q: '?inductee=muir&chapter=arriving', id: 'arriving', phase: 'map' }
      const cases = [
        { tag: 'room model missing (HEAD 404)', q: '?inductee=einstein&chapter=citizen', id: 'citizen', set: BLOCKED, path: GLB('einstein-trenton-courtroom'), says: /model is missing/ },
        { tag: 'room model GET fails once', q: '?inductee=einstein&chapter=citizen', id: 'citizen', set: FAIL_GET_ONCE, path: GLB('einstein-trenton-courtroom'), says: /did not load/ },
        { tag: 'prop model missing', q: '?inductee=einstein&chapter=big-work', id: 'big-work', set: BLOCKED, path: '/artifacts/einstein/pipe.glb', says: /did not load/ },
        { tag: 'guide model missing', q: '?inductee=einstein&chapter=citizen&guide=a', id: 'citizen', set: BLOCKED, path: '/models/guide-candidates/docent-a-business-female-02.glb', says: /did not load/ },
        { tag: 'photo room texture missing', q: '?inductee=einstein&chapter=birth', id: 'birth', set: BLOCKED, path: '/rooms/einstein/ulm-photo.webp', says: /did not load/ },
        { tag: 'room model GET never answers', q: '?inductee=einstein&chapter=citizen', id: 'citizen', set: HANG_GET_ONCE, path: GLB('einstein-trenton-courtroom'), says: /did not finish loading/, loading: true },
        { tag: 'map land outlines never answer', ...MUIR_MAP, set: HANG_GET_ONCE, path: '/tour/ne_110m_land.json', says: /did not finish loading/, loading: true },
        { tag: 'map earth texture never answers', ...MUIR_MAP, set: HANG_GET_ONCE, path: '/tour/earth-2048.webp', says: /did not finish loading/, loading: true },
        { tag: 'map earth texture missing', ...MUIR_MAP, set: BLOCKED, path: '/tour/earth-2048.webp', says: /did not load/ },
        { tag: 'map guide never answers', ...MUIR_MAP, q: `${MUIR_MAP.q}&guide=b`, set: HANG_GET_ONCE, path: '/models/guide-candidates/docent-b-business-female-01.glb', says: /did not finish loading/, loading: true },
        { tag: 'viewer document page missing', q: '?viewer=NAI-M-0003', viewer: true, set: BLOCKED, path: '/media/naismith/NAI-M-0003-p3.webp', says: /did not load/ },
        { tag: 'viewer document page never answers', q: '?viewer=NAI-M-0003', viewer: true, set: HANG_GET_ONCE, path: '/media/naismith/NAI-M-0003-p3.webp', says: /did not finish loading/, loading: true },
        { tag: 'viewer model missing', q: '?viewer=NAI-PEACH-BASKET-RECREATION', viewer: true, set: BLOCKED, path: '/artifacts/naismith/peach-basket.glb', says: /did not load/ },
      ]
      for (const c of cases) {
        await step(`negative: ${c.tag}`, async () => {
          c.set.add(c.path)
          const p = await newHostPage(ctx, v, c.q, [c.path])
          try {
            const e = await waitFrame(p, 'embed.html')
            await e.getByRole('button', { name: 'Start the museum' }).click()
            const t = await waitFrame(p, 'tour.html')
            if (!c.viewer) await t.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 60000 })
            const loadingSel = c.viewer ? '[data-viewer-loading]' : '[data-stage-loading]'
            if (c.loading) await t.locator(loadingSel).waitFor({ state: 'visible', timeout: 30000 })
            const panel = t.locator(c.viewer ? '[data-viewer-error]' : '[data-room-error]')
            await panel.waitFor({ state: 'visible', timeout: 90000 })
            const text = await panel.innerText()
            if (!/could not be loaded/.test(text) || !c.says.test(text)) fail(`${c.tag}: the panel says: ${text}`)
            if (!c.viewer && (await panel.getByRole('button').count()) < 2) fail(`${c.tag}: the panel offers no records besides Try again`)
            const readySel = c.viewer ? '[data-viewer-ready="true"]' : c.phase === 'map' ? `main[data-chapter="${c.id}"][data-phase="map"][data-map-ready="true"]` : `main[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`
            if (await t.locator(readySel).count()) fail(`${c.tag}: reported ready with the error panel up`)
            if (await t.locator(loadingSel).isVisible()) fail(`${c.tag}: the loading status stayed with the error panel`)
            c.set.delete(c.path) // the asset is back (a stalled request stays stalled)
            await panel.getByRole('button', { name: 'Try again' }).click()
            await t.locator(readySel).waitFor({ timeout: 90000 })
            if (await panel.isVisible()) fail(`${c.tag}: the error stayed after Try again loaded it`)
          } finally {
            c.set.delete(c.path)
            await p.close()
          }
        })
      }
      // round 9 fix round 6 (Codex review 5): the standalone record page with an unknown id, or with a record that no
      // tour declares (EIN-M-0025 is in artifacts.js but not in records.lock.json), shows an error, never a record
      // and never the tour
      for (const [tag, id, says] of [['unknown', 'NOPE-M-0000', /no record with the id NOPE-M-0000/], ['undeclared', 'EIN-M-0025', /EIN-M-0025 is not shown in these tours/]]) {
        await step(`negative: viewer route, ${tag} record`, async () => {
          const p = await newHostPage(ctx, v, `?viewer=${id}`)
          try {
            const e = await waitFrame(p, 'embed.html')
            await e.getByRole('button', { name: 'Start the museum' }).click()
            const t = await waitFrame(p, 'tour.html')
            const panel = t.locator('[data-viewer-route-error]')
            await panel.waitFor({ state: 'visible', timeout: 30000 })
            const text = await panel.innerText()
            if (!says.test(text)) fail(`viewer route ${id}: the error says: ${text}`)
            if (await t.locator('.artifact-viewer, main[data-chapter], canvas').count()) fail(`viewer route ${id}: a record or the tour was drawn behind the error`)
          } finally {
            await p.close()
          }
        })
      }
      // the landing's guide: a missing model keeps the placeholder and offers "Load the guide again",
      // which loads it once it is back
      await step('negative: landing guide model missing', async () => {
        const path = '/models/guide-candidates/docent-a-business-female-02.glb'
        BLOCKED.add(path)
        const p = await ctx.newPage()
        const errs = []
        // as in the cases above, the broken model's own rejection may surface; anything else is a failure
        p.on('pageerror', (e) => {
          const msg = String(e.message || e).split('\n')[0]
          if (!msg.includes(path)) errs.push(msg)
        })
        p.on('response', (r) => r.status() >= 400 && new URL(r.url()).pathname !== path && !/favicon/.test(r.url()) && errs.push(`HTTP ${r.status()} ${r.url()}`))
        try {
          await p.goto(`${MUSEUM}/?guide=a`)
          await p.waitForSelector('#inductees', { timeout: 60000 })
          await p.evaluate(() => window.scrollTo(0, document.getElementById('inductees').offsetTop))
          const retry = p.getByRole('button', { name: 'Load the guide again' })
          await retry.waitFor({ state: 'visible', timeout: 90000 })
          if (!(await p.locator('.guide-avatar-load[data-guide-state="failed"] .guide-avatar-ph').count())) fail('landing guide: no placeholder while it failed')
          BLOCKED.delete(path)
          await retry.click()
          await p.locator('.guide-avatar-load[data-guide-state="ready"]').waitFor({ timeout: 90000 })
          if (await retry.isVisible()) fail('landing guide: the retry stayed after the guide loaded')
          for (const m of errs) fail(`landing guide: ${m}`)
        } finally {
          BLOCKED.delete(path)
          await p.close()
        }
      })
      // the landing's 3D hall: its portrait missing, the threads entrance's Earth stalled. A notice says
      // so and "Load it again" (scope reset, then remount) loads it once it is back; the page stays usable.
      const landingCases = [
        { tag: 'landing hall portrait missing', q: '', set: BLOCKED, path: '/landing/portraits/einstein.jpg', says: /did not load/ },
        { tag: 'landing threads Earth never answers', q: '?entrance=threads', set: HANG_GET_ONCE, path: '/landing/earth-2048.webp', says: /did not finish loading/, loading: true },
      ]
      for (const c of landingCases) {
        await step(`negative: ${c.tag}`, async () => {
          c.set.add(c.path)
          const p = await ctx.newPage()
          const errs = []
          p.on('pageerror', (e) => {
            const msg = String(e.message || e).split('\n')[0]
            if (!msg.includes(c.path.slice(1))) errs.push(msg) // the loader names the page-relative URL
          })
          p.on('response', (r) => r.status() >= 400 && new URL(r.url()).pathname !== c.path && !/favicon/.test(r.url()) && errs.push(`HTTP ${r.status()} ${r.url()}`))
          try {
            await p.goto(`${MUSEUM}/${c.q}`)
            if (c.loading) await p.locator('.stage-status[role=status]').waitFor({ state: 'visible', timeout: 30000 })
            const notice = p.locator('[data-landing-3d-error]')
            await notice.waitFor({ state: 'visible', timeout: 90000 })
            const text = await notice.innerText()
            if (!c.says.test(text)) fail(`${c.tag}: the notice says: ${text}`)
            if (!(await p.locator('#inductees').count())) fail(`${c.tag}: the landing content is gone`)
            c.set.delete(c.path)
            await notice.getByRole('button', { name: 'Load it again' }).click()
            await p.locator('.stage[data-landing-3d="ready"]').waitFor({ timeout: 90000 })
            if (await notice.isVisible()) fail(`${c.tag}: the notice stayed after the hall loaded`)
            for (const m of errs) fail(`${c.tag}: ${m}`)
          } finally {
            c.set.delete(c.path)
            await p.close()
          }
        })
      }
      // code chunks: a chunk that fails or stalls shows a panel whose only retry is "Reload the page"
      // (never a dead Try again), and the reload loads the part once the chunk is back
      const chunk = (name) => `/assets/${readdirSync(new URL('../dist/assets/', import.meta.url)).find((f) => f.startsWith(`${name}-`) && f.endsWith('.js'))}`
      const chunkCases = [
        { tag: 'viewer chunk missing', q: '?viewer=NAI-M-0003', set: BLOCKED, path: chunk('ArtifactViewer'), panel: '[data-chunk-error]', says: /could not be fetched/, ready: '[data-viewer-ready="true"]' },
        { tag: 'viewer chunk never answers', q: '?viewer=NAI-M-0003', set: HANG_GET_ONCE, path: chunk('ArtifactViewer'), panel: '[data-chunk-error]', says: /did not finish loading/, ready: '[data-viewer-ready="true"]', loading: '[data-chunk-loading]' },
        { tag: 'photo room chunk missing', q: '?inductee=einstein&chapter=birth', begin: true, set: BLOCKED, path: chunk('PhotoRoomStage'), panel: '[data-room-error]', says: /could not be fetched/, ready: 'main[data-chapter="birth"][data-phase="room"][data-ready="true"]' },
      ]
      for (const c of chunkCases) {
        await step(`negative: ${c.tag}`, async () => {
          c.set.add(c.path)
          const p = await newHostPage(ctx, v, c.q, [c.path])
          try {
            const e = await waitFrame(p, 'embed.html')
            await e.getByRole('button', { name: 'Start the museum' }).click()
            const t = await waitFrame(p, 'tour.html')
            if (c.begin) await t.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 60000 })
            if (c.loading) await t.locator(c.loading).waitFor({ state: 'visible', timeout: 15000 })
            const panel = t.locator(c.panel)
            await panel.waitFor({ state: 'visible', timeout: 90000 })
            const text = await panel.innerText()
            if (!/could not be loaded/.test(text) || !c.says.test(text)) fail(`${c.tag}: the panel says: ${text}`)
            if (await panel.getByRole('button', { name: 'Try again' }).count()) fail(`${c.tag}: a chunk failure offers Try again, which cannot fetch it`)
            if (await t.locator(c.ready).count()) fail(`${c.tag}: reported ready with the error panel up`)
            c.set.delete(c.path)
            await panel.getByRole('button', { name: 'Reload the page' }).click()
            if (c.begin) await t.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 60000 })
            await t.locator(c.ready).waitFor({ timeout: 90000 })
            if (await t.locator(c.panel).count()) fail(`${c.tag}: the panel stayed after the reload`)
          } finally {
            c.set.delete(c.path)
            await p.close()
          }
        })
      }
      // Lamarr's Normandie photograph record is served from /rooms-demo: open it in the viewer and
      // require the image to have decoded (a refused load leaves naturalWidth 0)
      await step('viewer LAM-M-0023 (/rooms-demo)', async () => {
        const p = await newHostPage(ctx, v, '?viewer=LAM-M-0023')
        const e = await waitFrame(p, 'embed.html')
        await e.getByRole('button', { name: 'Start the museum' }).click()
        const t = await waitFrame(p, 'tour.html')
        await t.waitForSelector('img[src*="/rooms-demo/"]', { timeout: 60000 })
        await p.waitForTimeout(3000)
        const imgs = await t.evaluate(() => [...document.querySelectorAll('img[src*="/rooms-demo/"]')].map((i) => i.complete && i.naturalWidth > 0))
        if (!imgs.length) fail('the viewer shows no /rooms-demo photograph')
        else if (!imgs.every(Boolean)) fail('the /rooms-demo photograph did not load in the frame')
        await p.close()
      })
    }
  } finally {
    await ctx.close()
  }
}

for (const n of names) await runVariant(n)
for (const r of stalled) r.destroy()
await browser.close()
museum.close()
host.close()
console.log(fails ? `\n${fails} FAIL` : '\nembed: all variants pass')
process.exit(fails ? 1 : 0)
