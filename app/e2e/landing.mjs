// Landing turning points: Einstein's chapters are the points around his portrait.
// Per viewport (1440x900, 1280x720, 390x844): the first slide shows one point per chapter, no two
// objects overlap and all sit inside the viewport; each point opens a card (title = chapter title)
// with every other point hidden; Esc closes it and focus returns to the point; the X button closes it
// too. Desktop: "Tour from here" on every point lands on tour.html?inductee=einstein&chapter=<id>
// and the tour's title block shows that chapter's title (phone: one chapter). The inductees still on
// `steps` keep four story points; every other chapter-shape inductee has one point per chapter.
// Real taps at 390x844 and 360x780 (fix round 7b): "Walk their journeys" and the tour HUD's main controls.
// Portraits (1440x900, 390x844): each inductee's slide shows its cleared portrait with credit and rights, or the
// pending panel for an inductee listed pending; the hall requests every portrait; a negative control must fail.
// Exit 1 on any failure.
// Needs the dev server (npm run dev, http://localhost:5173), no other.
// usage: node e2e/landing.mjs [--shots] [--taps|--portraits]   --shots writes screenshots to mockup-shots/task7/; --taps runs
// only the real-tap checks, --portraits only the portrait checks
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from './browser.mjs' // Playwright: $SITE_MODULES or ../Challenge IHH/site (browser.mjs)
import { readFileSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5173'
const shots = process.argv.includes('--shots')
const shotDir = new URL('../mockup-shots/task7/', import.meta.url).pathname
if (shots) mkdirSync(shotDir, { recursive: true })
const SHELL = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const VIEWS = {
  'desktop-1440x900': { viewport: { width: 1440, height: 900 } },
  'desktop-1280x720': { viewport: { width: 1280, height: 720 } },
  'phone-390x844': { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
// the chapters, as exported from the tour data (scripts/export_chapters.mjs)
const ALL_CH = JSON.parse(readFileSync(new URL('../src/tour/data/chapters.generated.json', import.meta.url), 'utf8'))
const CH = ALL_CH.einstein
// the landing's slides in order (inductees.json): a chapter-shape inductee has one point per
// chapter, an inductee still on `steps` keeps four story points
const SLIDES = JSON.parse(readFileSync(new URL('../src/landing/data/inductees.json', import.meta.url), 'utf8')).map((i) => i.slug)
const EXPECTED = SLIDES.map((slug) => (ALL_CH[slug] ? ALL_CH[slug].length : 4))
const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

const browser = await chromium.launch({ ...(existsSync(SHELL) ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu'] })
let fails = 0
const fail = (m) => {
  fails++
  console.log(`  FAIL ${m}`)
}

async function toFirstSlide(page) {
  await page.goto(BASE + '/')
  await page.waitForSelector('#inductees')
  await page.evaluate(() => window.scrollTo(0, document.getElementById('inductees').offsetTop))
  await page.waitForSelector('.slide.is-active', { timeout: 30000 })
  await page.waitForTimeout(4500) // the reveal plays once the camera has settled
}

async function walk(name, opts) {
  const phone = name.startsWith('phone')
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  try {
    await toFirstSlide(page)
    const slide = page.locator('.slide.is-active')
    // one point per chapter; the other inductees keep four story points
    const counts = await page.$$eval('.slide', (els) => els.map((e) => e.querySelectorAll('.art').length))
    if (counts[0] !== CH.length) fail(`${name}: Einstein has ${counts[0]} points, expected ${CH.length}`)
    if (counts.join() !== EXPECTED.join()) fail(`${name}: points per inductee ${counts}, expected ${EXPECTED} (${SLIDES})`)
    // no overlaps, all inside the viewport
    const boxes = await page.$$eval('.slide.is-active .art .obj', (els) => els.map((e) => e.getBoundingClientRect().toJSON()))
    const labels = phone ? [] : await page.$$eval('.slide.is-active .art .art-label', (els) => els.map((e) => e.getBoundingClientRect().toJSON()))
    const vp = opts.viewport
    boxes.forEach((b, i) => {
      if (b.left < 0 || b.top < 0 || b.right > vp.width || b.bottom > vp.height) fail(`${name}: object ${i} outside the viewport`)
      for (let j = i + 1; j < boxes.length; j++) if (hit(b, boxes[j])) fail(`${name}: objects ${i} and ${j} overlap`)
    })
    labels.forEach((b, i) => {
      for (let j = i + 1; j < labels.length; j++) if (hit(b, labels[j])) fail(`${name}: labels ${i} and ${j} overlap`)
      if (b.left < 0 || b.right > vp.width) fail(`${name}: label ${i} outside the viewport`)
    })
    if (phone) {
      const chips = await page.$$eval('.slide.is-active .chip', (els) => els.map((e) => e.getBoundingClientRect().toJSON()))
      if (chips.length !== CH.length) fail(`${name}: ${chips.length} chips`)
      const cols = new Set(chips.map((c) => Math.round(c.left)))
      if (cols.size !== 2) fail(`${name}: chip list has ${cols.size} columns, expected 2`)
      chips.forEach((b, i) => {
        if (b.right > vp.width || b.left < 0) fail(`${name}: chip ${i} outside the viewport`)
        for (let j = i + 1; j < chips.length; j++) if (hit(b, chips[j])) fail(`${name}: chips ${i} and ${j} overlap`)
      })
    }
    if (shots) await page.screenshot({ path: `${shotDir}${name}-ring.png` })
    // open each point
    const sel = phone ? '.slide.is-active .chip' : '.slide.is-active .art'
    for (let k = 0; k < CH.length; k++) {
      const c = CH[k]
      const tag = `${name} ${c.id}`
      const opener = page.locator(sel).nth(k)
      await opener.scrollIntoViewIfNeeded()
      await opener.click()
      const card = slide.locator('.story-card')
      await card.waitFor({ timeout: 5000 })
      const title = (await card.locator('.story-title').textContent()).trim()
      if (title !== c.title) fail(`${tag}: card title "${title}"`)
      await page.waitForTimeout(600) // the others fade out
      const others = await page.$$eval(`.slide.is-active ${phone ? '.sp-list' : '.art:not(.is-open)'}`, (els) => els.map((e) => getComputedStyle(e).visibility))
      if (!others.length || others.some((v) => v !== 'hidden')) fail(`${tag}: other points still visible (${others})`)
      if (shots && k === 0) await page.screenshot({ path: `${shotDir}${name}-card.png` })
      if (k % 2 === 0) {
        await page.keyboard.press('Escape')
      } else {
        await card.locator('.story-close').click()
      }
      await page.waitForFunction(() => !document.querySelector('.slide.is-active .story-card'), null, { timeout: 5000 })
      await page.waitForTimeout(120)
      const back = await opener.evaluate((e) => e === document.activeElement)
      if (!back) fail(`${tag}: focus did not return to the point`)
    }
    if (!errors.length) console.log(`${name}: ${CH.length} points open and close, no overlap`)
  } catch (e) {
    fail(`${name}: ${e.message.split('\n')[0]}`)
  }
  for (const e of errors) fail(`${name}: console error: ${e.slice(0, 300)}`)
  await ctx.close()
}

// Portraits: every inductee except the PORTRAIT_PENDING ones has a portrait in inductees.json, and its slide shows
// it: the image loaded from that file (no "pending" panel), the credit link to the holder's page saying "Portrait: ..."
// with the credit and the holder's rights words in its title. A pending inductee shows the pending panel and no image.
// The hall (3D) requests every portrait file. A negative control breaks one slide's image and credit in the page and
// requires the same check to fail, so a check that passes everything cannot pass here.
const PORTRAIT_PENDING = ['naismith'] // no verified, cleared portrait in the store yet (portraits-report.md)
const INDUCTEES = JSON.parse(readFileSync(new URL('../src/landing/data/inductees.json', import.meta.url), 'utf8'))

async function portraitProblems(page, d) {
  const s = await page.evaluate(() => {
    const slide = document.querySelector('.slide.is-active')
    const img = slide?.querySelector('figure.portrait img')
    const a = slide?.querySelector('.portrait-credit a')
    return {
      label: slide?.getAttribute('aria-label') || '',
      imgs: slide ? slide.querySelectorAll('figure.portrait img').length : 0,
      pending: slide ? slide.querySelectorAll('.portrait-pending').length : 0,
      src: img?.getAttribute('src') || null,
      loaded: !!(img && img.complete && img.naturalWidth > 0),
      alt: img?.getAttribute('alt') || '',
      text: a?.textContent.trim() || '',
      title: a?.getAttribute('title') || '',
      href: a?.getAttribute('href') || '',
      line: slide?.querySelector('.portrait-credit')?.textContent.replace(/\s+/g, ' ').trim() || '',
      licLinks: slide ? [...slide.querySelectorAll('.portrait-credit a')].map((x) => ({ text: x.textContent.trim(), href: x.getAttribute('href') })) : [],
    }
  })
  const out = []
  if (!s.label.endsWith(d.name)) out.push(`active slide is "${s.label}", not ${d.name}`)
  if (!d.portrait) {
    if (s.imgs !== 0 || s.pending !== 1) out.push(`pending inductee shows ${s.imgs} image(s) and ${s.pending} pending panel(s)`)
    return out
  }
  if (s.pending) out.push('shows the "pending" panel')
  if (s.imgs !== 1) out.push(`${s.imgs} portrait images`)
  if (s.src !== d.portrait.src) out.push(`image src ${s.src}, expected ${d.portrait.src}`)
  if (!s.loaded) out.push('portrait image did not load')
  if (s.alt !== d.portrait.alt) out.push('alt text is not the record\'s')
  const shown = s.text.slice('Portrait: '.length)
  // the line names the holder: a start of the credit, three words or more, not cut at an initial ("William J")
  if (!s.text.startsWith('Portrait: ') || !d.portrait.credit.startsWith(shown) || shown.split(/\s+/).length < 3 || /\b[A-Z]$/.test(shown))
    out.push(`credit text "${s.text}"`)
  if (!s.title.includes(d.portrait.credit)) out.push('credit missing from the credit title')
  if (!d.portrait.rights || !s.title.includes(d.portrait.rights)) out.push('rights words missing from the credit title')
  if (s.href !== d.portrait.url) out.push(`credit link ${s.href}, expected ${d.portrait.url}`)
  // a Creative Commons portrait (licence class cc-*, or CC words in its rights): the visible line itself, not a hover
  // title, names the licence with a link to it, and says it was cropped
  const cc = d.portrait.licence || /creative commons|\bCC[ -]BY/i.test(`${d.portrait.rights} ${d.portrait.credit}`)
  if (cc) {
    const lic = d.portrait.licence
    if (!lic) out.push('CC-licensed portrait has no licence (name, url) in inductees.json')
    else {
      if (!s.line.includes(lic.name)) out.push(`visible credit "${s.line}" lacks the licence "${lic.name}"`)
      if (!s.licLinks.some((x) => x.text === lic.name && x.href === lic.url)) out.push(`no visible link "${lic.name}" to ${lic.url}`)
      if (!/^https:\/\/creativecommons\.org\/licenses\//.test(lic.url)) out.push(`licence url ${lic.url} is not a Creative Commons licence`)
    }
    if (d.portrait.changes && !/\bcropped\b/i.test(s.line)) out.push(`visible credit "${s.line}" does not say it was cropped`)
  }
  return out
}

// scroll to slide i as a visitor does (one viewport of scroll per inductee; the phone has no dot buttons)
async function toSlide(page, i, who) {
  await page.evaluate((k) => window.scrollTo(0, document.getElementById('inductees').offsetTop + k * window.innerHeight), i)
  await page.waitForFunction((n) => document.querySelector('.slide.is-active')?.getAttribute('aria-label')?.endsWith(n), who, { timeout: 30000 })
  await page.waitForTimeout(4500) // the reveal plays once the camera has settled
}

async function portraits(name, opts) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  const fetched = new Map()
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('response', (r) => {
    const m = r.url().match(/\/(landing\/portraits\/[^?#]+)/)
    if (m) fetched.set(m[1], r.status())
  })
  for (const d of INDUCTEES)
    if (!d.portrait !== PORTRAIT_PENDING.includes(d.slug)) fail(`${name}: ${d.slug} ${d.portrait ? 'has a portrait but is listed pending' : 'has no portrait in inductees.json'}`)
  try {
    await toFirstSlide(page)
    for (const [i, d] of INDUCTEES.entries()) {
      if (i > 0) await toSlide(page, i, d.name)
      const probs = await portraitProblems(page, d)
      for (const p of probs) fail(`${name} portrait ${d.slug}: ${p}`)
      if (!probs.length) console.log(`${name} portrait ${d.slug}: ${d.portrait ? `${d.portrait.media_id} shown, credit and rights present` : 'pending panel (no cleared portrait)'}`)
      if (shots) await page.screenshot({ path: `${shotDir}portrait-${name}-${d.slug}.png` })
    }
    // visitor-facing rights text names no owner ruling (owner order 2026-11-04; shared/rightsText.js): the portrait
    // credits and the story points' record credits, their text and their titles, on every slide; a negative control
    // puts the words in one credit's title and requires the same check to fail
    const ruling = () =>
      page.evaluate(() => {
        const re = /owner[\s-]*rul/i
        const hits = []
        for (const el of document.querySelectorAll('.portrait-credit, .portrait-credit *, .story-source, .story-source *')) {
          if (el.matches('.portrait-credit, .story-source') && re.test(el.textContent)) hits.push(`text: ${el.textContent.replace(/\s+/g, ' ').trim().slice(0, 160)}`)
          const t = el.getAttribute('title')
          if (t && re.test(t)) hits.push(`title: ${t.slice(0, 160)}`)
        }
        return { hits, credits: document.querySelectorAll('.portrait-credit').length }
      })
    {
      const r = await ruling()
      for (const h of r.hits) fail(`${name}: a credit names an owner ruling to the visitor (${h})`)
      if (!r.credits) fail(`${name}: no portrait credit to read for owner rulings`)
      else if (!r.hits.length) console.log(`${name}: ${r.credits} portrait credits, no owner ruling in their text or titles`)
      await page.evaluate(() => {
        const a = document.querySelector('.portrait-credit a[title]')
        a.dataset.title = a.getAttribute('title')
        a.setAttribute('title', `${a.dataset.title} (Owner ruling 2026-10-27)`)
      })
      const nc = await ruling()
      if (!nc.hits.length) fail(`${name}: owner-ruling negative control: a credit title naming the ruling was not caught`)
      else console.log(`${name}: owner-ruling negative control trips (${nc.hits.length})`)
      await page.evaluate(() => {
        const a = document.querySelector('.portrait-credit a[data-title]')
        a.setAttribute('title', a.dataset.title)
        delete a.dataset.title
      })
    }
    // the hall's frames: every portrait file is requested and served
    for (const d of INDUCTEES.filter((x) => x.portrait))
      if (fetched.get(d.portrait.src) !== 200) fail(`${name}: hall/slide did not load /${d.portrait.src} (status ${fetched.get(d.portrait.src)})`)
    // negative control: the same check must fail on a slide whose image and credit are broken
    const d = INDUCTEES.find((x) => x.portrait)
    await toSlide(page, INDUCTEES.indexOf(d), d.name)
    await page.evaluate(() => {
      const slide = document.querySelector('.slide.is-active')
      slide.querySelector('figure.portrait img')?.remove()
      slide.querySelector('figure.portrait').insertAdjacentHTML('beforeend', '<div class="portrait-pending"></div>')
      slide.querySelector('.portrait-credit a')?.removeAttribute('title')
    })
    const broken = await portraitProblems(page, d)
    if (broken.length < 3) fail(`${name}: negative control: a broken portrait slide gave only ${broken.length} problem(s) (${broken})`)
    else console.log(`${name}: negative control trips (${broken.length} problems on a broken ${d.slug} slide)`)
    // negative control 2: a CC-licensed portrait whose visible line loses the licence and "cropped" must fail
    const ccd = INDUCTEES.find((x) => x.portrait?.licence)
    if (!ccd) fail(`${name}: no CC-licensed portrait to run the licence negative control on`)
    else {
      await toSlide(page, INDUCTEES.indexOf(ccd), ccd.name)
      if ((await portraitProblems(page, ccd)).length) fail(`${name}: ${ccd.slug} fails before the licence control`)
      await page.evaluate(() => document.querySelector('.slide.is-active .portrait-licence')?.remove())
      const noLic = await portraitProblems(page, ccd)
      if (noLic.length < 2) fail(`${name}: licence negative control: removing the visible licence gave ${noLic.length} problem(s)`)
      else console.log(`${name}: licence negative control trips (${noLic.length} problems without the visible licence on ${ccd.slug})`)
    }
  } catch (e) {
    fail(`${name} portraits: ${e.message.split('\n')[0]}`)
  }
  for (const e of errors) fail(`${name} portraits: console error: ${e.slice(0, 300)}`)
  await ctx.close()
}

// "Tour from here" on a point lands on that chapter.
async function tourFrom(name, opts, chapters) {
  const phone = name.startsWith('phone')
  for (const c of chapters) {
    const tag = `${name} tour from ${c.id}`
    const ctx = await browser.newContext(opts)
    const page = await ctx.newPage()
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(String(e)))
    try {
      await toFirstSlide(page)
      const sel = phone ? '.slide.is-active .chip' : '.slide.is-active .art'
      await page.locator(sel).nth(CH.indexOf(c)).click()
      await page.locator('.slide.is-active .story-tour').click()
      await page.waitForURL(`**/tour.html?inductee=einstein&chapter=${c.id}`, { timeout: 30000 })
      await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"]`, { timeout: 90000 })
      const t = await page.locator('[data-hud=title]').first().textContent()
      if (!t.includes(c.title)) fail(`${tag}: tour title block "${t.slice(0, 80)}" lacks "${c.title}"`)
      for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
      console.log(`${tag}: ${c.title}`)
    } catch (e) {
      fail(`${tag}: ${e.message.split('\n')[0]}`)
    }
    await ctx.close()
  }
}

// Real taps (round 9 fix round 7b). On a 390 x 844 phone the invisible "About this place" panel (opacity 0) lay over
// "Walk their journeys" and took every tap; this file never pressed that button (it scrolled by script), so it never
// saw it. Here the button is tapped as a visitor taps it: locator.tap() (touch, no force, no keyboard, no script
// click), which fails when another element would receive the tap. First every point of the button must be its own
// (document.elementFromPoint over a 5 x 3 grid), then the tap must start the walk: the page scrolls to the inductees
// and the first one's slide becomes active.
const TAP_VIEWS = {
  'phone-390x844': VIEWS['phone-390x844'],
  'phone-360x780': { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
async function tapWalk(name, opts) {
  const tag = `${name} tap "Walk their journeys"`
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + '/')
    const btn = page.getByRole('button', { name: 'Walk their journeys' })
    await btn.waitFor({ state: 'visible', timeout: 30000 })
    await page.waitForTimeout(1500)
    const misses = await btn.evaluate((b) => {
      const r = b.getBoundingClientRect()
      const out = []
      for (let i = 1; i <= 5; i++)
        for (let j = 1; j <= 3; j++) {
          const el = document.elementFromPoint(r.left + (r.width * i) / 6, r.top + (r.height * j) / 4)
          if (!b.contains(el)) out.push(el ? `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}` : 'nothing')
        }
      return out
    })
    if (misses.length) fail(`${tag}: ${misses.length} of 15 points of the button are covered (${[...new Set(misses)].join(', ')})`)
    await btn.tap({ timeout: 10000 })
    await page.waitForSelector('.slide.is-active', { timeout: 30000 })
    await page.waitForTimeout(3000)
    const r = await page.evaluate(() => ({ y: window.scrollY, at: document.getElementById('inductees')?.getBoundingClientRect().top, focus: document.activeElement?.id }))
    if (!(r.y > 0) || r.focus !== 'inductees') fail(`${tag}: the walk did not start (${JSON.stringify(r)})`)
    else console.log(`${tag}: the walk starts (scrolled ${Math.round(r.y)} px, focus on the inductees)`)
  } catch (e) {
    fail(`${tag}: ${e.message.split('\n')[0]}`)
  }
  await ctx.close()
}

// The tour's main controls on a phone, by real taps: "Begin the tour", Next (the map leg on to the place, then the
// next chapter), "Hear this chapter" (it toggles), and Moments (opens; its close button closes it).
async function tapTourHud(name, opts) {
  const tag = `${name} tour HUD taps`
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  try {
    await page.goto(`${BASE}/tour.html?inductee=einstein&chapter=leaving`)
    await page.getByRole('button', { name: 'Begin the tour' }).tap({ timeout: 90000 })
    await page.waitForSelector('.tour-stage[data-chapter="leaving"]', { timeout: 90000 })
    if ((await page.getAttribute('.tour-stage', 'data-phase')) === 'map') {
      await page.waitForTimeout(1500)
      await page.locator('[data-hud=next]').tap({ timeout: 15000 })
    }
    await page.waitForSelector('.tour-stage[data-chapter="leaving"][data-phase="room"][data-ready="true"]', { timeout: 90000 })
    await page.waitForTimeout(1500)
    const hear = page.locator('[data-hud=hear]')
    const before = await hear.getAttribute('aria-pressed')
    await hear.tap({ timeout: 15000 })
    await page.waitForTimeout(400)
    if ((await hear.getAttribute('aria-pressed')) === before) fail(`${tag}: tapping "Hear this chapter" did not toggle it`)
    await page.locator('[data-hud=moments]').tap({ timeout: 15000 })
    await page.waitForSelector('.mom-root', { timeout: 15000 })
    await page.getByRole('button', { name: 'Close Moments That Made Them' }).tap({ timeout: 15000 })
    await page.waitForSelector('.mom-root', { state: 'detached', timeout: 15000 })
    await page.locator('[data-hud=next]').tap({ timeout: 15000 })
    await page.waitForFunction(() => document.querySelector('.tour-stage')?.getAttribute('data-chapter') !== 'leaving', null, { timeout: 30000 })
    console.log(`${tag}: Begin, Next, Hear this chapter, Moments (open, close) and Next chapter each take a tap`)
  } catch (e) {
    fail(`${tag}: ${e.message.split('\n')[0]}`)
  }
  await ctx.close()
}

const only = process.argv.includes('--portraits')
if (only) {
  // --portraits: the portrait checks only
  await portraits('desktop-1440x900', VIEWS['desktop-1440x900'])
  await portraits('phone-390x844', VIEWS['phone-390x844'])
} else {
  for (const [name, opts] of Object.entries(TAP_VIEWS)) await tapWalk(name, opts)
  for (const [name, opts] of Object.entries(TAP_VIEWS)) await tapTourHud(name, opts)
}
// --taps: the real-tap checks only
if (!only && !process.argv.includes('--taps')) {
  for (const [name, opts] of Object.entries(VIEWS)) await walk(name, opts)
  await portraits('desktop-1440x900', VIEWS['desktop-1440x900'])
  await portraits('phone-390x844', VIEWS['phone-390x844'])
  await tourFrom('desktop-1440x900', VIEWS['desktop-1440x900'], CH)
  await tourFrom('phone-390x844', VIEWS['phone-390x844'], [CH[3]])
}
await browser.close()
console.log(fails ? `${fails} failure(s)` : 'landing e2e ok')
process.exit(fails ? 1 : 0)
