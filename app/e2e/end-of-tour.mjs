// End of the tour (quiz, ticket, story): every inductee, desktop 1280x800 and phone 375x667. The last
// chapter's Next opens the dialog ([role=dialog].end-of-tour[data-end-step]). Each visit starts at the
// chapter of the tour's last quiz question (?chapter=) and walks with Next to the end, so the quiz holds
// exactly the questions about the walked chapters (buildQuiz with those chapters) and the ticket counts
// exactly those chapters. Per inductee and device:
//   run A  Start the quiz, answer one, click the card's (non-focusable) eyebrow text, Escape mid-quiz ->
//          the tour ends on the landing (/)
//   run B  (prefers-reduced-motion) Skip to your ticket -> ticket without a stamp, QR slot says "QR code
//          (placeholder)", Give feedback disabled ("coming soon"); Share your story -> story form button
//          disabled ("coming soon"); Back; no CSS animation running in the dialog; Back to the museum -> /;
//          the ticket's chapter line counts the walked chapters ("N chapters · <years>"); the focus trap
//          (Shift+Tab from the heading, Tab from the last control), the tour behind inert, M and W A S D
//          reach no window key handler
//   run C  the whole quiz, picking option 0 every time -> stamp "Quiz <right> of <total>" equals the count
//          computed in Node from buildQuiz/score (loaded through Vite SSR); Save ticket downloads
//          ihh-ticket-<slug>.png, a PNG (magic bytes) 2400 px wide; Back to the museum -> /
// Runs B and C: the ticket image's alt carries the name, visit date, chapters, stamp (if any) and number;
// a visible line "You got <right> of <total>." only with a result; the name ends left of the perforation.
// On every step: axe on the dialog (no serious or critical violation); on the phone the dialog card,
// its buttons and the ticket stay inside the viewport and the page does not scroll sideways
// (scrollWidth <= 375). Once (Einstein): the page inside a sandboxed iframe (allow-scripts
// allow-same-origin), Save ticket shows the inline fallback image and the hint, no uncaught error.
// Once (Naismith, desktop): a visit that starts at the last chapter, which has no question, opens the
// dialog on the ticket with no quiz and no stamp.
// No page error or console error in any run. Exit 1 on any failure.
// Needs the dev server (npm run dev, http://localhost:5173; the gate uses BASE=http://localhost:5174).
// usage: node e2e/end-of-tour.mjs [slug ...]
import { createServer } from 'node:http'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { createServer as createVite } from 'vite'
import { chromium, loadAxe } from './browser.mjs'

const BASE = process.env.BASE || 'http://localhost:5173'
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const SHELL = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const DEVICES = {
  desktop: { viewport: { width: 1280, height: 800 } },
  phone: { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
}
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

// the expected quiz result, computed in Node from the same data the page reads
const vite = await createVite({ root: new URL('..', import.meta.url).pathname, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
const { TOURS, INDUCTEE_ORDER } = await vite.ssrLoadModule('/src/tour/data/index.js')
const { buildQuiz, score } = await vite.ssrLoadModule('/src/tour/end/quiz.js')
const { QUESTIONS } = await vite.ssrLoadModule('/src/tour/end/questions.js')
const { ticketData, chapterLine } = await vite.ssrLoadModule('/src/tour/end/ticket.js')
const INDEX = (await vite.ssrLoadModule('/src/tour/data/facts.generated.json')).default
const slugs = only.length ? only : INDUCTEE_ORDER
// the chapters a visit walks: from the chapter of the tour's last quiz question to the last chapter
const walkOf = (slug) => {
  const ids = TOURS[slug].chapters.map((c) => c.id)
  const at = (QUESTIONS[slug] || []).map((q) => ids.indexOf(q.chapter))
  if (!at.length || at.includes(-1)) throw new Error(`${slug}: no quiz question, or one on a chapter the tour lacks; this test needs a question on a tour chapter`)
  return ids.slice(Math.max(...at))
}
const lineOf = (slug, visited) => chapterLine(ticketData(TOURS[slug], { visited }))
const expected = (slug) => {
  const qs = buildQuiz(TOURS[slug], INDEX, walkOf(slug))
  const { right, total } = score(qs, qs.map(() => 0))
  return { total, stamp: `Quiz ${right} of ${total}`, score: `You got ${right} of ${total}.`, line: lineOf(slug, walkOf(slug)) }
}
const lastOf = (slug) => {
  const c = TOURS[slug].chapters.at(-1)
  return { id: c.id, map: !!c.map, year: c.year }
}

const AxeBuilder = await loadAxe()
const browser = await chromium.launch({ ...(existsSync(SHELL) ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu'] })
let fails = 0
const fail = (msg) => {
  fails++
  console.log(`  FAIL ${msg}`)
}

async function withPage(opts, tag, fn) {
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(`uncaught ${e.message}`))
  try {
    await fn(page)
  } catch (e) {
    fail(`${tag}: ${e.message.split('\n')[0]}`)
  } finally {
    for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
    await ctx.close()
  }
}

// each chapter of the walk at its place, then Next; after the last one the dialog opens (on the quiz
// unless the walk holds no question)
async function openEnd(page, slug, walk = walkOf(slug), endStep = 'quiz') {
  await page.goto(`${BASE}/tour.html?inductee=${slug}&chapter=${walk[0]}&autostart=1`)
  for (const id of walk) {
    if (TOURS[slug].chapters.find((c) => c.id === id).map) {
      await page.waitForSelector(`.tour-stage[data-chapter="${id}"][data-phase="map"]`, { timeout: 90000 })
      await page.click('[data-hud=next]')
    }
    await page.waitForSelector(`.tour-stage[data-chapter="${id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
    await page.waitForTimeout(1000)
    await page.click('[data-hud=next]')
  }
  await page.waitForSelector(`[role=dialog].end-of-tour[data-end-step=${endStep}]`, { timeout: 20000 })
}

// Reduced motion, sampled the moment a step shows (before any wait, while a 0.4-0.5 s fade would still be
// running): the dialog carries is-reduced, its and the card's computed animation-name is none, and no
// animation runs inside it.
async function reducedNow(page, tag) {
  const r = await page.evaluate(() => {
    const d = document.querySelector('.end-of-tour')
    const card = d.querySelector('.end-card')
    return {
      cls: d.classList.contains('is-reduced'),
      dialog: getComputedStyle(d).animationName,
      card: getComputedStyle(card).animationName,
      running: document.getAnimations().filter((a) => d.contains(a.effect?.target)).map((a) => a.animationName || a.transitionProperty || a.constructor.name),
    }
  })
  if (!r.cls) fail(`${tag}: reduced motion, the dialog has no is-reduced class`)
  if (r.dialog !== 'none') fail(`${tag}: reduced motion, dialog animation-name is ${r.dialog}`)
  if (r.card !== 'none') fail(`${tag}: reduced motion, card animation-name is ${r.card}`)
  if (r.running.length) fail(`${tag}: reduced motion, animation running in the dialog: ${r.running.join(', ')}`)
}

// axe on the dialog, and on a phone its geometry
async function checkStep(page, tag, dev) {
  // the step's entrance animations have finished (axe would read a half-faded colour)
  await page.waitForFunction(() => { const d = document.querySelector('.end-of-tour'); return !document.getAnimations().some((a) => d.contains(a.effect?.target)) }, null, { timeout: 5000 }).catch(() => fail(`${tag}: animations in the dialog still running after 5 s`))
  const r = await new AxeBuilder({ page }).include('.end-of-tour').withTags(AXE_TAGS).analyze()
  for (const v of r.violations.filter((x) => x.impact === 'serious' || x.impact === 'critical')) {
    fail(`${tag}: axe ${v.impact} ${v.id} (${v.nodes.length}): ${v.help} @ ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  }
  if (dev !== 'phone') return
  const g = await page.evaluate(() => {
    const W = document.documentElement.clientWidth
    const H = window.innerHeight
    const out = (r) => r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5
    const bad = []
    for (const sel of ['.end-of-tour', '.end-card', '.end-card button', '.end-card a', '.end-ticket-img']) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect()
        if (r.width && out(r)) bad.push(`${sel}${el.dataset.end ? `[${el.dataset.end}]` : ''} ${Math.round(r.left)},${Math.round(r.top)} to ${Math.round(r.right)},${Math.round(r.bottom)}`)
      }
    }
    return { bad, scrollWidth: document.documentElement.scrollWidth, W, H }
  })
  for (const b of g.bad) fail(`${tag}: outside the ${g.W}x${g.H} viewport: ${b}`)
  if (g.scrollWidth > 375) fail(`${tag}: the page scrolls sideways (scrollWidth ${g.scrollWidth})`)
}

// The ticket for screen readers and small screens: the image's alt carries every detail on the card, and
// a visible line above it gives the quiz result (none without a result). The name, in the page's own
// fonts, ends left of the perforation (x 860).
async function checkTicketText(page, tag, { name, one, stamp, score = null }) {
  const alt = await page.getAttribute('[data-end-ticket]', 'alt')
  for (const part of [name, 'Visited ', one, 'No. IHH-', ...(stamp ? [stamp] : [])]) if (!alt.includes(part)) fail(`${tag}: the ticket alt lacks "${part}" (${alt})`)
  if (!stamp && /Quiz/.test(alt)) fail(`${tag}: the ticket alt states a quiz without one (${alt})`)
  const shown = await page.locator('[data-end-score]').allInnerTexts()
  if (score ? shown.join() !== score : shown.length) fail(`${tag}: the quiz result line is ${JSON.stringify(shown)}, expected ${score ? `"${score}"` : 'none'}`)
  if (score && !(await page.locator('[data-end-score]').isVisible())) fail(`${tag}: the quiz result line is not visible`)
  const right = await page.evaluate(async () => {
    const box = document.createElement('div')
    box.style.cssText = 'position:fixed;left:0;top:0;width:1200px;visibility:hidden'
    box.innerHTML = await (await fetch(document.querySelector('[data-end-ticket]').src)).text()
    document.body.appendChild(box)
    const b = box.querySelector('text[font-family^="Fraunces"]').getBBox()
    box.remove()
    return b.x + b.width
  })
  if (right > 860) fail(`${tag}: the name runs to x ${Math.round(right)}, over the perforation (860)`)
}

// Focus stays in the dialog: Shift+Tab from the heading and Tab from the last control wrap inside it; the
// tour behind it is inert; M (mute) and W A S D (walk) reach none of the tour's window key handlers, with
// focus on the heading or on no element.
async function checkFocusTrap(page, tag) {
  const inDialog = () => page.evaluate(() => document.querySelector('.end-of-tour').contains(document.activeElement))
  const lastControl = () => page.evaluate(() => { const f = [...document.querySelectorAll('.end-of-tour a[href], .end-of-tour button:not([disabled])')]; return document.activeElement === f.at(-1) })
  const firstControl = () => page.evaluate(() => document.activeElement === document.querySelector('.end-of-tour a[href], .end-of-tour button:not([disabled])'))
  await page.focus('#end-title')
  await page.keyboard.press('Shift+Tab')
  if (!(await inDialog()) || !(await lastControl())) fail(`${tag}: Shift+Tab from the heading did not go to the dialog's last control`)
  await page.keyboard.press('Tab')
  if (!(await inDialog()) || !(await firstControl())) fail(`${tag}: Tab from the last control did not wrap to the first`)
  const inert = await page.evaluate(() => {
    const d = document.querySelector('.end-of-tour')
    const behind = [...document.querySelectorAll('.tour-hud, .stage-frame')]
    return { behind: behind.length, live: behind.filter((el) => !el.closest('[inert]')).map((el) => el.className), dialog: !!d.closest('[inert]') }
  })
  if (!inert.behind || inert.live.length) fail(`${tag}: the tour behind the dialog is not inert (${inert.live.join(', ') || 'none found'})`)
  if (inert.dialog) fail(`${tag}: the dialog itself is inert`)
  const muteLabel = () => page.getAttribute('.hud-sound', 'aria-label')
  const before = await muteLabel()
  await page.evaluate(() => {
    window.__endKeys = []
    window.addEventListener('keydown', (e) => window.__endKeys.push(e.key))
  })
  await page.focus('#end-title')
  for (const k of ['m', 'w', 'a', 's', 'd']) await page.keyboard.press(k)
  await page.evaluate(() => document.activeElement.blur())
  for (const k of ['m', 'w']) await page.keyboard.press(k)
  const leaked = await page.evaluate(() => window.__endKeys)
  if (leaked.length) fail(`${tag}: keys reached the tour's window handlers behind the dialog: ${leaked.join(' ')}`)
  if ((await muteLabel()) !== before) fail(`${tag}: M changed the guide's mute state behind the dialog`)
  await page.keyboard.press('Tab')
  if (!(await inDialog())) fail(`${tag}: Tab with focus on no element did not move into the dialog`)
}

const step = (page) => page.getAttribute('[role=dialog].end-of-tour', 'data-end-step')
const ticketSvgText = (page) => page.evaluate(async () => (await fetch(document.querySelector('[data-end-ticket]').src)).text())
const onLanding = (page) => page.waitForURL((u) => !u.pathname.includes('tour.html'), { timeout: 15000 }).then(() => new URL(page.url()).pathname === '/', () => false)

async function walkQuiz(page) {
  let n = 0
  for (;;) {
    await page.waitForSelector('[data-end-option]')
    await page.click('[data-end-option="0"]')
    await page.waitForSelector('[data-end=advance]')
    const label = await page.textContent('[data-end=advance]')
    n++
    await page.click('[data-end=advance]')
    if (/See your ticket/.test(label)) return n
    if (n > 10) throw new Error('the quiz never ends')
  }
}

try {
  for (const slug of slugs) {
    const exp = expected(slug)
    for (const [dev, opts] of Object.entries(DEVICES)) {
      const tag = `${slug}/${dev}`

      await withPage({ ...opts, reducedMotion: 'reduce' }, `${tag} A`, async (page) => {
        await openEnd(page, slug)
        await reducedNow(page, `${tag} quiz intro`)
        await checkStep(page, `${tag} quiz intro`, dev)
        await page.click('text=Start the quiz')
        await page.waitForSelector('[data-end-option]')
        await reducedNow(page, `${tag} question`)
        await page.click('[data-end-option="0"]')
        await page.waitForSelector('[data-end=advance]')
        await checkStep(page, `${tag} question`, dev)
        // a click on text that takes no focus leaves focus in the dialog, so Escape still ends the tour
        await page.click('.end-card .eyebrow')
        if (!(await page.evaluate(() => document.querySelector('.end-of-tour').contains(document.activeElement)))) fail(`${tag}: after a click on the card text, focus left the dialog`)
        await page.keyboard.press('Escape')
        if (!(await onLanding(page))) fail(`${tag}: Escape mid-quiz did not end the tour on / (${page.url()})`)
      })

      await withPage({ ...opts, reducedMotion: 'reduce' }, `${tag} B`, async (page) => {
        await openEnd(page, slug)
        await reducedNow(page, `${tag} quiz intro`)
        await page.click('text=Skip to your ticket')
        await page.waitForSelector('[role=dialog].end-of-tour[data-end-step=ticket]', { timeout: 20000 })
        await reducedNow(page, `${tag} ticket`)
        await page.waitForSelector('[data-end-ticket]', { timeout: 20000 })
        if ((await step(page)) !== 'ticket') fail(`${tag}: Skip did not reach the ticket`)
        const svg = await ticketSvgText(page)
        if (/Quiz \d+ of \d+/.test(svg)) fail(`${tag}: the skipped ticket carries a quiz stamp`)
        // the ticket counts the walked chapters
        const one = exp.line
        if (!svg.includes(`>${one}<`)) fail(`${tag}: the ticket does not say "${one}" (${(svg.match(/>(\d+ chapters? [^<]*)</) || [, 'none'])[1]})`)
        await checkTicketText(page, tag, { name: TOURS[slug].name, one, stamp: null })
        await checkFocusTrap(page, tag)
        if (!svg.includes('QR code (placeholder)')) fail(`${tag}: the QR slot does not say "QR code (placeholder)"`)
        const fb = page.locator('[data-end=feedback]')
        if (!(await fb.isDisabled()) || !/coming soon/i.test(await fb.innerText())) fail(`${tag}: the feedback button is not a disabled "coming soon" button (${await fb.innerText()})`)
        await checkStep(page, `${tag} ticket`, dev)
        await page.click('[data-end=story]')
        await page.waitForSelector('[role=dialog].end-of-tour[data-end-step=story]')
        await reducedNow(page, `${tag} story`)
        const sf = page.locator('[data-end=story-form]')
        if (!(await sf.isDisabled()) || !/coming soon/i.test(await sf.innerText())) fail(`${tag}: the story form button is not a disabled "coming soon" button (${await sf.innerText()})`)
        await checkStep(page, `${tag} story`, dev)
        await page.click('[data-end=back]')
        await page.waitForSelector('[role=dialog].end-of-tour[data-end-step=ticket]')
        await page.click('[data-end=close]')
        if (!(await onLanding(page))) fail(`${tag}: Back to the museum did not end the tour on / (${page.url()})`)
      })

      await withPage(opts, `${tag} C`, async (page) => {
        await openEnd(page, slug)
        // without reduced motion the dialog does animate (so the reduced-motion checks are measuring something)
        if (!(await page.evaluate(() => { const d = document.querySelector('.end-of-tour'); return !d.classList.contains('is-reduced') && document.getAnimations().some((a) => d.contains(a.effect?.target)) }))) fail(`${tag}: normal motion, the dialog did not animate in`)
        await page.click('text=Start the quiz')
        const n = await walkQuiz(page)
        if (n !== exp.total) fail(`${tag}: ${n} questions, expected ${exp.total}`)
        await page.waitForSelector('[role=dialog].end-of-tour[data-end-step=ticket] [data-end-ticket]', { timeout: 20000 })
        const svg = await ticketSvgText(page)
        await checkTicketText(page, tag, { name: TOURS[slug].name, one: exp.line, stamp: exp.stamp, score: exp.score })
        if (!svg.includes(`>${exp.stamp}<`)) fail(`${tag}: stamp is not "${exp.stamp}" (${(svg.match(/Quiz \d+ of \d+/) || ['none'])[0]})`)
        await checkStep(page, `${tag} ticket with stamp`, dev)
        const dl = page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
        await page.click('[data-end=save]')
        const d = await dl
        if (!d) fail(`${tag}: Save ticket produced no download`)
        else {
          if (d.suggestedFilename() !== `ihh-ticket-${slug}.png`) fail(`${tag}: download named ${d.suggestedFilename()}, expected ihh-ticket-${slug}.png`)
          const path = await d.path()
          const b = path ? readFileSync(path) : Buffer.alloc(0)
          if (b.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') fail(`${tag}: the download is not a PNG`)
          else if (b.readUInt32BE(16) !== 2400) fail(`${tag}: ticket PNG is ${b.readUInt32BE(16)} px wide, expected 2400`)
          if (path) rmSync(path, { force: true })
        }
        await page.click('[data-end=close]')
        if (!(await onLanding(page))) fail(`${tag}: Back to the museum did not end the tour on / (${page.url()})`)
      })
      console.log(`${tag}: done (${exp.stamp}, ${exp.line})`)
    }
  }

  // a visit that saw only a chapter without questions: no quiz, the dialog opens on the ticket
  if (!only.length || only.includes('naismith')) {
    const last = lastOf('naismith')
    if (QUESTIONS.naismith.some((q) => q.chapter === last.id)) fail(`naismith: the last chapter ${last.id} has a question; the no-quiz check needs a chapter without one`)
    await withPage({ ...DEVICES.desktop, reducedMotion: 'reduce' }, 'naismith/desktop D', async (page) => {
      await openEnd(page, 'naismith', [last.id], 'ticket')
      await page.waitForSelector('[data-end-ticket]', { timeout: 20000 })
      if (await page.locator('text=Start the quiz').count()) fail('naismith/desktop D: a quiz is offered for a visit with no question')
      const svg = await ticketSvgText(page)
      if (/Quiz \d+ of \d+/.test(svg)) fail('naismith/desktop D: the ticket carries a quiz stamp')
      const one = lineOf('naismith', [last.id])
      if (!svg.includes(`>${one}<`)) fail(`naismith/desktop D: the ticket does not say "${one}"`)
      console.log('naismith/desktop D: done (no quiz)')
    })
  }

  // a sandboxed embed: embed.html in an iframe with sandbox="allow-scripts allow-same-origin" (another origin than the museum)
  if (!only.length || only.includes('einstein')) {
    const last = lastOf('einstein')
    const host = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' }).end(
        `<!doctype html><title>Host</title><iframe title="IHH" width="960" height="640" style="border:0" sandbox="allow-scripts allow-same-origin" allow="fullscreen" src="${BASE}/embed.html?inductee=einstein&chapter=${last.id}"></iframe>`,
      )
    })
    await new Promise((r) => host.listen(0, '127.0.0.1', r))
    await withPage({ viewport: { width: 1280, height: 800 } }, 'sandboxed embed', async (page) => {
      await page.goto(`http://localhost:${host.address().port}/`)
      const find = async (part) => {
        for (let i = 0; i < 120; i++) {
          const f = page.frames().find((x) => x.url().includes(part))
          if (f) return f
          await page.waitForTimeout(250)
        }
        throw new Error(`no ${part} frame`)
      }
      const e = await find('embed.html')
      await e.getByRole('button', { name: 'Start the museum' }).click()
      const t = await find('tour.html')
      await t.getByRole('button', { name: /Begin the tour/ }).click({ timeout: 60000 })
      await t.locator(`main[data-chapter="${last.id}"]`).waitFor({ timeout: 60000 })
      if ((await t.locator('main').getAttribute('data-phase')) === 'map') await t.locator('[data-hud=next]').click({ timeout: 15000 })
      await t.locator(`main[data-chapter="${last.id}"][data-phase="room"][data-ready="true"]`).waitFor({ timeout: 90000 })
      await page.waitForTimeout(1000)
      await t.locator('[data-hud=next]').click()
      await t.locator('[role=dialog].end-of-tour[data-end-step=quiz]').waitFor({ timeout: 20000 })
      await t.getByRole('button', { name: 'Skip to your ticket' }).click()
      await t.locator('[data-end-ticket]').waitFor({ timeout: 20000 })
      await t.locator('[data-end=save]').click()
      await t.locator('[data-end-save-fallback]').waitFor({ timeout: 15000 })
      if (!(await t.getByText('Press and hold, or right-click, to save the ticket.').isVisible())) fail('sandboxed embed: the save hint is not visible')
      const shown = await t.locator('[data-end-save-fallback] img').evaluate((i) => i.complete && i.naturalWidth > 0)
      if (!shown) fail('sandboxed embed: the fallback image did not load')
      console.log('sandboxed embed: done')
    })
    host.close()
  }
} finally {
  await browser.close()
  await vite.close()
}
console.log(fails ? `${fails} FAILURE(S)` : 'end-of-tour: all checks passed')
process.exit(fails ? 1 : 0)
