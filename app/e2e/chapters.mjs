// Chapter walk: every tour in the chapter shape (data/index.js TOURS with `chapters`), desktop and
// phone. Opens tour.html?inductee=<slug>&autostart=1 and presses Next through every chapter (its map
// leg, then its place). Per chapter: the stage canvas exists, [data-hud=title] holds the chapter
// title, there is one [data-stop] per chapter stop, and the console has no errors. At 390 x 844 the
// title block, the stop dots, the guide's caption, "Hear this chapter" and the guide's upper body
// (guide-safe area) must not overlap, nor the controls hint while it shows. On every device, and at
// 360 x 780 for every chapter, the bottom controls (hear, next card, Moments) stay inside the
// viewport and do not overlap (controls). Before Begin: every chapter that opens straight
// on its place (no map leg), deep-linked without autostart, keeps its camera still for 4 s behind the
// splash and says nothing ("nothing animates or plays until Begin"). Sound blocked (a second
// browser with --autoplay-policy=user-gesture-required, no gesture before the first check): every
// chapter's first line (its map leg's narration, or the opening of a chapter without one) still
// shows as a caption and advances on its clock; "Hear this chapter" brings the opening back; a stop
// with a record still opens it in the viewer (muted, a stop's place note shows on its card); a room chapter with closing lines plays them once
// every stop has been visited. Exit 1 on any failure.
// Needs the dev server (npm run dev, http://localhost:5173).
// Feedback round 7: zoom and pan in a photograph's viewer (zoomPan), the ways out of a photo room's
// record (photoExit), and in the walk, every room stop's record shown at the stop (roomRecords).
// Round 8: a stop picked as soon as its dot shows, or during the opening, moves the camera to its pose (earlyPick).
// Round 9: the guide in frame, beside the focus, unhidden and looking at it, at every view (guideFrame).
// Fix round 12: every stop pick and Step back, her move sampled every frame: never faster than a brisk walk in sight, and
// she ends on her spot (traceCheck).
// usage: node e2e/chapters.mjs [slug ...] [--shots] [--only=zoom,exit] [--chapters=birth,legacy]   --shots writes screenshots to SHOTS (default
// mockup-shots/task4/); without it nothing is written
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { visibleLength } from '../src/tour/labelGeom.js'
import { chromium } from './browser.mjs' // Playwright: $SITE_MODULES or ../Challenge IHH/site (browser.mjs)

const BASE = process.env.BASE || 'http://localhost:5173'
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
// --only=zoom,exit runs only those parts (blocked, muted, walk, pick, small, focus, relayout, guide, maplabels, records, zoom, exit, modelzoom, end); default all
const parts = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',') || null
const want = (part) => !parts || parts.includes(part)
const shots = process.argv.includes('--shots')
const shotDir = (process.env.SHOTS || new URL('../mockup-shots/task4/', import.meta.url).pathname).replace(/\/?$/, '/')
if (shots) mkdirSync(shotDir, { recursive: true })
const SHELL = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
// a second, narrower phone for the bottom controls only (smallControls)
const SMALL_PHONE = { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }

// The bottom controls ("Hear this chapter", the next card, the Moments button, and at a tour's end "Next
// inductee"): each wholly inside
// the viewport, none overlapping another, and the hear button not squeezed below its 44 px target.
async function controls(page, tag) {
  const r = await page.evaluate(() => {
    const b = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const x = el.getBoundingClientRect()
      return x.width && x.height ? { left: x.left, right: x.right, top: x.top, bottom: x.bottom, w: x.width } : null
    }
    return { vw: innerWidth, vh: innerHeight, boxes: { next: b('[data-hud=next]'), hear: b('[data-hud=hear]'), moments: b('[data-hud=moments]'), nextInductee: b('[data-hud=next-inductee]') } }
  })
  const named = Object.entries(r.boxes).filter(([, x]) => x)
  if (!r.boxes.next) fail(`${tag}: no next card`)
  for (const [k, x] of named) if (x.left < 0 || x.top < 0 || x.right > r.vw + 0.5 || x.bottom > r.vh + 0.5) fail(`${tag}: ${k} runs outside the ${r.vw}x${r.vh} viewport ${JSON.stringify([x.left, x.top, x.right, x.bottom].map(Math.round))}`)
  for (let a = 0; a < named.length; a++)
    for (let b = a + 1; b < named.length; b++) if (hit(named[a][1], named[b][1])) fail(`${tag}: ${named[a][0]} overlaps ${named[b][0]}`)
  if (r.boxes.hear && r.boxes.hear.w < 43.5) fail(`${tag}: hear button squeezed to ${Math.round(r.boxes.hear.w)} px`)
}

// 360 x 780: open every chapter (deep link, autostart) and check the bottom controls on its map leg
// and at its place.
async function smallControls(tour) {
  const ctx = await browser.newContext(SMALL_PHONE)
  try {
    const page = await ctx.newPage()
    for (const c of tour.chapters) {
      const tag = `phone-360 ${tour.slug} ${c.id} (${c.tier})`
      try {
        await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
        if (c.map) {
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 20000 })
          await controls(page, `${tag} map`)
          await page.click('[data-hud=next]')
        }
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
        await page.waitForTimeout(1500)
        await controls(page, tag)
        if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-phone360.jpg`, type: 'jpeg', quality: 70 })
      } catch (e) {
        fail(`${tag}: ${e.message.split('\n')[0]}`)
      }
      console.log(`${tag} done`)
    }
  } finally {
    await ctx.close()
  }
}

// Map legs, desktop and 390 x 844 (round 9 fix round 1): once the map has unrolled and the marker has arrived,
// no place label, place-photograph label or un-routed note lies across the route's line (a label over the
// line hides where the journey goes), and no two labels overlap.
async function mapLabels(tour) {
  const chapters = tour.chapters.filter((c) => c.map)
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      for (const c of chapters) {
        const tag = `map ${dev} ${tour.slug}/${c.id}`
        try {
          await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 90000 })
          const ok = await page.waitForFunction(() => window.__mapRoute?.()?.unrolled && window.__mapRoute().arrived, null, { timeout: 60000 }).then(() => true, () => false)
          if (!ok) {
            // every map leg is drawn on the unrolling map: one with no route on screen is broken, never skipped
            // (round 9 final review)
            fail(`${tag}: the map never unrolled and arrived${(await page.evaluate(() => Boolean(window.__mapRoute))) ? '' : ' (no route on the page)'}`)
            continue
          }
          await page.waitForTimeout(800)
          const r = await page.evaluate(() => {
            const pts = window.__mapRoute().pts
            const labels = []
            // the travel pill on the marker counts too (round 9 final review: "By ship" lay over Einstein's label)
            for (const el of document.querySelectorAll('.label-anchor .map-pill')) {
              if (getComputedStyle(el.parentElement).visibility === 'hidden') continue
              const b = el.getBoundingClientRect()
              if (b.width && b.height) labels.push([`pill ${(el.textContent || '').trim().slice(0, 22)}`, { left: b.left, top: b.top, right: b.right, bottom: b.bottom }, true])
            }
            for (const el of document.querySelectorAll('.label-anchor > .map-place')) {
              if (el.classList.contains('is-hidden')) continue
              if (getComputedStyle(el.parentElement).visibility === 'hidden') continue
              const b = el.getBoundingClientRect()
              if (b.width && b.height) labels.push([(el.textContent || '').trim().slice(0, 28), { left: b.left, top: b.top, right: b.right, bottom: b.bottom }])
            }
            return { pts, labels }
          })
          const segHits = (ax, ay, bx, by, q) => {
            if (Math.max(ax, bx) < q.left || Math.min(ax, bx) > q.right || Math.max(ay, by) < q.top || Math.min(ay, by) > q.bottom) return false
            const inside = (x, y) => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom
            if (inside(ax, ay) || inside(bx, by)) return true
            const cross = (px, py, qx, qy) => {
              const d = (bx - ax) * (qy - py) - (by - ay) * (qx - px)
              if (Math.abs(d) < 1e-9) return false
              const s = ((px - ax) * (qy - py) - (py - ay) * (qx - px)) / d
              const u = ((px - ax) * (by - ay) - (py - ay) * (bx - ax)) / d
              return s >= 0 && s <= 1 && u >= 0 && u <= 1
            }
            return cross(q.left, q.top, q.right, q.top) || cross(q.right, q.top, q.right, q.bottom) || cross(q.right, q.bottom, q.left, q.bottom) || cross(q.left, q.bottom, q.left, q.top)
          }
          const px = (b) => JSON.stringify([b.left, b.top, b.right, b.bottom].map(Math.round))
          // the route reads on screen: its drawn length at least 12 % of the view's shorter side (round 9 final review: the
          // Naismith phone map's short line was barely visible between its labels)
          // (only the part inside the view counts: Codex review 2)
          const [vw, vh] = await page.evaluate(() => [innerWidth, innerHeight])
          const length = visibleLength(r.pts, vw, vh)
          const vmin = Math.min(vw, vh)
          if (length < 0.12 * vmin) fail(`${tag}: the route is ${Math.round(length)} px long on screen (at least ${Math.round(0.12 * vmin)})`)
          for (const [name, b, pill] of r.labels) {
            if (pill) continue
            // (a label's own two pixels of edge may touch the line where it leaves the pin)
            const q = { left: b.left + 2, right: b.right - 2, top: b.top + 2, bottom: b.bottom - 2 }
            for (let i = 1; i < r.pts.length; i++) {
              const [a, z] = [r.pts[i - 1], r.pts[i]]
              if (segHits(a[0], a[1], z[0], z[1], q)) {
                fail(`${tag}: the label "${name}" lies across the route ${px(b)}`)
                break
              }
            }
          }
          for (let i = 0; i < r.labels.length; i++)
            for (let j = i + 1; j < r.labels.length; j++) if (hit(r.labels[i][1], r.labels[j][1])) fail(`${tag}: the labels "${r.labels[i][0]}" and "${r.labels[j][0]}" overlap`)
          if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-map-${dev}.jpg`, type: 'jpeg', quality: 70 })
          console.log(`${tag}: ${r.labels.length} labels checked against ${r.pts.length} route points`)
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        }
      }
    } finally {
      await ctx.close()
    }
  }
}

// Round 9 fix round 5 (Codex review 4): every record the tours declare (src/tour/data/records.lock.json, every path: a
// room record or prop, a series member, a gallery-case item, a photo-room record, a map photograph) is bound on the page
// and drawn. Fix round 6 (Codex review 5): drawn means the record's OWN element, not any box at the stop:
//   a map photograph: its own thumbnail in its pin (data-map-media), the image loaded;
//   a photo room's photograph (backdrop:): the backdrop drawn from the place's photograph, loaded and visible;
//   a stop's record: what the scene draws for it (src/tour/recordDraws.js) is in the scene, visible, loaded, and drawn
//     from one of that record's own files (a stop over the photograph: the backdrop, when it is that record or one of
//     its series' members), seen by the camera once the stop is picked (fix round 7: points on the record itself on
//     screen and not hidden by another surface, SEEN_SHARE; a stop over the photograph: points on the photograph over
//     its subject); and the record's viewer opens on that record, its files
//     loaded; for a series, each member in turn (its chip), each member's own files loaded.
// Desktop and 390 x 844 (fix round 7b), each chapter by deep link.
// a stop's record is seen when at least SEEN_SHARE of the points on it (recordDraws.js recordPoints: a 9 x 9 grid over a
// flat record, a model's vertices; a stop over the photograph: a 9 x 9 grid over its subject) are on screen, facing the
// camera and not hidden by any other surface (the guide aside: guideFrame checks she keeps clear of it). A subject
// larger than the view (a tower taller than the screen is high) cannot be all on screen: it is seen when it fills the
// view across or down (seenState `fills`, 95 %), none of its points on screen is hidden or turned away, and at least a
// quarter of it is on screen (as camcheck accepts a record that fills the view). That exception is for a room's, a
// gallery's or a rail record only; a stop over the photograph has its own rule (photoSubjectSeen, fix round 8).
const SEEN_SHARE = 0.9
// (fix round 7b) Points the foreground's frame covers (the photo room's rail and its records) count as cropped, like
// points off screen, not as hidden. A stop over the photograph also keeps its subject's head (the top row of points)
// all seen, and its view shows nothing past the photograph's edges (__photoStage.bounds).
// A subject larger than the frame it is seen in may be cropped where it runs out of that frame, never at the head
// (controller ruling, fix round 7b). The rule (Codex review 7: the crop must be chiefly where the subject runs out of the
// frame, and enough of it must be in view):
//   - the frame is the part of the screen a subject can be seen in: above the rail at the foot of the view
//     (__photoStage.railTop; NDC railTop..1 down) and, across, beside the guide, who stands in front (the wider side of
//     the screen beside her figure as the frame stands her, __photoStage.guideStand: frameW = max(1 - her right, her
//     left + 1)); the subject would need spanX across and
//     spanY down (its 9 x 9 points, unclipped);
//   - its head is all seen; no point is above the screen's top, hidden by the scene or turned away;
//   - a point off a side only if the subject is wider than the frame (spanX > frameW); below the screen's foot only if it
//     is taller than the frame (spanY > frameH); points behind the rail are cut by the frame's foot, so they too only if
//     it is taller than the frame (fix round 8: a subject that fits above the rail is not hidden behind it); no point
//     behind the camera (off screen, but neither above, below nor at a side);
//   - enough in view: the frame can hold at most fit = min(1, frameH / spanY) * min(1, frameW / spanX) of the subject;
//     at least three quarters of that is seen: seen >= 3/4 * fit * points.
const croppedAtFeet = (s, railTop = -1, guide = null) => {
  if (!s || s.points < 9 || s.above || s.occluded || s.back || !s.seen) return false
  if (s.offscreen !== s.above + s.below + s.side) return false
  const frameH = 1 - railTop
  const frameW = guide ? Math.max(1 - guide.x1, guide.x0 + 1) : 2
  if (s.side && !(s.spanX > frameW)) return false
  if (s.below && !(s.spanY > frameH)) return false
  if (s.framed && !(s.spanY > frameH)) return false
  const fit = Math.min(1, frameH / s.spanY) * Math.min(1, frameW / s.spanX)
  return s.seen >= 0.75 * fit * s.points
}

// a room's, a gallery's or a rail record's: SEEN_SHARE, or the fills exception above
const seenOk = (s) => Boolean(s) && s.points >= 9 && (s.seen >= SEEN_SHARE * s.points || (s.fills && !s.occluded && !s.back && s.seen >= 0.25 * s.points))
// A stop over the photograph (fix round 8, Codex review 8: the fills exception let an over-cropped subject through,
// 21 of 81 points seen, without the crop rule): its subject is seen when at least SEEN_SHARE of its points are seen, or
// it is cropped as croppedAtFeet allows with its head all seen (head: the same draw's top-row points). Nothing else:
// no fills exception. Returns how it passed ('whole', 'cropped') or null.
const photoSubjectSeen = (s, head, railTop, guide) => {
  if (!s || s.points < 9) return null
  if (s.seen >= SEEN_SHARE * s.points) return 'whole'
  const headIn = Boolean(head) && head.points > 0 && head.seen === head.points
  return headIn && croppedAtFeet(s, railTop, guide) ? 'cropped' : null
}
// a photo room that keeps a part of its photograph whole in this device's view (photo.keepInView: the Ulm Minster on a
// phone, owner ruling 2026-11-02): how many of its 9 x 9 points are off screen, or behind the guide, now (null: none
// declared)
const keptInView = (page) =>
  page.evaluate(() => {
    const pts = window.__photoStage?.keepInView?.()
    if (!pts) return null
    const cam = window.__tour3.camera
    const V = cam.position.constructor
    // the guide's whole figure on screen (as the guide check measures her, 4 px in): a point behind her is not in view
    // (both in the page's coordinates: the canvas starts below the band in a photo room with one, place.hudBand)
    const g = window.__tourApi?.guideBox?.({ full: true })
    const cv = document.querySelector('.tour-stage canvas').getBoundingClientRect()
    let off = 0
    let behindGuide = 0
    for (const a of pts) {
      const q = new V(...a).project(cam)
      if (!(q.z < 1 && q.z > -1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)) {
        off++
        continue
      }
      const x = cv.left + ((q.x + 1) / 2) * cv.width
      const y = cv.top + ((1 - q.y) / 2) * cv.height
      if (g && !g.behind && x > g.left + 4 && x < g.right - 4 && y > g.top + 4 && y < g.bottom - 4) behindGuide++
    }
    // (fix round 8: no reading of her figure is not "nothing behind her")
    return { points: pts.length, off, behindGuide, noGuide: !g }
  })
// A photo subject's head is never under the HUD (fix round 9, Codex review 9: the title card covered the top of Prague's
// Old Town Hall tower on a desktop and a phone, and no check looked). The rule: at every stop over the photograph, and
// at the room's view at rest, no point of a subject's head (the top row's middle third of its 9 x 9 points, the same
// head the records check reads, and the band below it down to the grid's second row: a head's height, one cell of the
// grid, 15 points on a 17 x 17 grid) that is on screen lies under a HUD panel shown now: the title card, the controls hint,
// the top-right buttons (End tour, sound, Step back), the stop rail (the stop dots and their label), the guide's speech
// bubble, the bottom bar (Hear this chapter, Next, Moments). The panels are measured as the page lays them out (their
// DOM rects, only while shown: not display none, visibility hidden or faded out), the points projected by the scene's
// camera. At a stop its own subject is checked (its head is all on screen, as the head check requires); at rest every
// stop's subject whose head points are on screen. A point under a panel by any amount fails (no margin is allowed).
const HUD_PANELS = [
  ['title card', '[data-hud=title]'],
  ['controls hint', '.hint-pill'],
  ['top-right buttons', '.hud-actions > *'],
  ['Step back', '.hud-back'],
  ['stop rail', '.stop-dots'],
  ['stop rail (label)', '.stop-dot-name'],
  ['guide bubble', '.speech-bubble.is-on'],
  ['bottom bar', '.hud-bottom-right > *'],
  ['bottom bar (Moments)', '[data-hud=moments]'],
]
// Owner-accepted 2026-11-04 (Challenge IHH docs/handoff/DECISIONS.md): HUD stays as is in these views; the check still fails any other view, and fails an entry if a different panel covers the head, or more of it.
// Each entry is one exact view: the inductee, the chapter, the view ('rest', or the stop whose focus view it is), the
// subject whose head is checked (at rest each stop's subject is checked on its own), the viewport, and what covers the
// head there: for each panel (HUD_PANELS names) the exact head points it covers (pt = 3 * (column - 6) + row on the
// head's 5 x 3 points, headUnderHud), as the accepted state was measured (the gate on 52821927, gate-final, and 1f07377d,
// gate-10b: the same counts in both). How it is applied (hudUnder, hudStale):
//   - a failing view that matches no entry fails, as before;
//   - a listed view covered by any other set of panels, or with any other head points covered (more, fewer, or other
//     ones; Codex review 10: a listed view that got worse under the same panel passed), fails;
//   - an entry whose view no longer fails, whose view a run that walks its chapter's records never checks, or whose
//     inductee or chapter no longer exists, fails the run as stale: the list cannot grow or linger silently;
//   - a room with a band (place.hudBand: Prague) may not be listed: it must pass on its own.
// The views are the fix round 9 ones (round9-B-report.md) that no view passing every other rule could clear.
const HUD_ACCEPTED = [
  { inductee: 'einstein', chapter: 'birth', view: 'rest', subject: 'photo', viewport: 'desktop', cover: { 'title card': [1, 2, 4, 5, 7, 8, 10, 11, 13, 14] } },
  { inductee: 'einstein', chapter: 'birth', view: 'photo', subject: 'photo', viewport: 'desktop', cover: { 'title card': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } },
  { inductee: 'einstein', chapter: 'birth', view: 'rest', subject: 'photo', viewport: 'phone', cover: { 'controls hint': [2, 5], 'title card': [0, 1, 3, 4, 6, 7, 9, 10, 12, 13] } },
  { inductee: 'einstein', chapter: 'birth', view: 'photo', subject: 'photo', viewport: 'phone', cover: { 'title card': [0, 1, 3, 4, 6, 7, 9, 10, 12, 13] } },
  { inductee: 'muir', chapter: 'history', view: 'rest', subject: 'photo', viewport: 'desktop', cover: { 'controls hint': [1, 4, 7] } },
  { inductee: 'muir', chapter: 'history', view: 'rest', subject: 'photo', viewport: 'phone', cover: { 'top-right buttons': [0] } },
  { inductee: 'muir', chapter: 'history', view: 'photo', subject: 'photo', viewport: 'phone', cover: { 'top-right buttons': [0, 3, 6, 9] } },
  { inductee: 'lamarr', chapter: 'arriving', view: 'rest', subject: 'photo', viewport: 'phone', cover: { 'controls hint': [2, 5], 'title card': [0] } },
]
const hudKey = (e) => `${e.inductee}/${e.chapter}/${e.view}/${e.subject}/${e.viewport}`
// what covers a head (headUnderHud's under): for each panel, its head points, sorted
const hudCover = (under) => {
  const out = {}
  for (const u of under) (out[u.panel] ||= new Set()).add(u.pt)
  return Object.fromEntries(Object.keys(out).sort().map((p) => [p, [...out[p]].sort((x, y) => x - y)]))
}
const coverText = (c) => Object.entries(c).map(([p, pts]) => `${p} [${pts.join(' ')}] (${pts.length})`).join(', ')
const sameCover = (a, b) => JSON.stringify(Object.keys(a).sort().map((p) => [p, [...a[p]].sort((x, y) => x - y)])) === JSON.stringify(Object.keys(b).sort().map((p) => [p, [...b[p]].sort((x, y) => x - y)]))
// how a covered head differs from its entry (for the message): more points, other ones, fewer, or other panels
function coverChange(listed, now) {
  const pts = (c) => new Set(Object.values(c).flat())
  const [l, n] = [pts(listed), pts(now)]
  const added = [...n].filter((p) => !l.has(p))
  const dropped = [...l].filter((p) => !n.has(p))
  if (added.length && !dropped.length) return `more of the head is covered (now ${n.size} points, listed ${l.size})`
  if (added.length) return `other head points are covered (now ${n.size} points, listed ${l.size})`
  if (dropped.length) return `fewer head points are covered (now ${n.size}, listed ${l.size}: update the entry)`
  return 'other panels cover the same head points'
}
const hudChecked = new Set()
const hudAccepted = new Set()
// a view's head-under-HUD reading (under: the head points under a panel): pass, owner-accepted (an exact entry), or fail
function hudUnder(view, under, msg) {
  const key = hudKey(view)
  hudChecked.add(key)
  if (!under.length) return
  const cover = hudCover(under)
  const entry = HUD_ACCEPTED.find((e) => hudKey(e) === key)
  if (entry && sameCover(entry.cover, cover)) {
    hudAccepted.add(key)
    console.log(`${msg} [owner-accepted 2026-11-04 (HUD_ACCEPTED): ${coverText(cover)}]`)
  } else fail(entry ? `${msg} [listed in HUD_ACCEPTED with ${coverText(entry.cover)}, but covered by ${coverText(cover)}: ${coverChange(entry.cover, cover)}]` : msg)
}
// after a tour's records part: each of its listed views was checked and still fails as listed (else the entry is stale).
// tour.allChapters: the tour's chapters before --chapters= narrowed the run (a chapter left out of the run is not
// checked; one the tour no longer has is stale)
function hudStale(tour) {
  const keys = HUD_ACCEPTED.map(hudKey)
  for (const [i, e] of HUD_ACCEPTED.entries()) {
    if (e.inductee !== tour.slug) continue
    if (keys.indexOf(keys[i]) !== i) fail(`HUD_ACCEPTED ${keys[i]}: listed twice`)
    if (!Object.keys(e.cover || {}).length || Object.values(e.cover).some((pts) => !pts.length)) fail(`HUD_ACCEPTED ${hudKey(e)}: every panel listed needs the head points it covers`)
    const c = tour.chapters.find((x) => x.id === e.chapter)
    if (!c) {
      if (!(tour.allChapters || tour.chapters).some((x) => x.id === e.chapter)) fail(`HUD_ACCEPTED ${hudKey(e)}: stale, the tour has no chapter ${e.chapter} (remove the entry)`)
      continue
    }
    if (c.hudBand) fail(`HUD_ACCEPTED ${hudKey(e)}: a room with a band (place.hudBand) may not be listed`)
    else if (!hudChecked.has(hudKey(e))) fail(`HUD_ACCEPTED ${hudKey(e)}: stale, the listed view was not checked in this run`)
    else if (!hudAccepted.has(hudKey(e))) fail(`HUD_ACCEPTED ${hudKey(e)}: stale, the view no longer fails as listed (remove the entry)`)
  }
}
// an entry for an inductee the app has no chapter tour for is stale too (run: against every tour, walked or not)
function hudStaleTours(tours) {
  for (const e of HUD_ACCEPTED) if (!tours.some((t) => t.slug === e.inductee)) fail(`HUD_ACCEPTED ${hudKey(e)}: stale, there is no chapter tour ${e.inductee} (remove the entry)`)
}
const headUnderHud = (page, ids) =>
  page.evaluate(
    ({ ids, panels }) => {
      const shown = (el) => {
        for (let x = el; x && x !== document.body; x = x.parentElement) {
          const cs = getComputedStyle(x)
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return null
        }
        const b = el.getBoundingClientRect()
        return b.width > 0 && b.height > 0 ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom } : null
      }
      const hud = []
      for (const [name, sel] of panels) for (const el of document.querySelectorAll(sel)) { const b = shown(el); if (b) hud.push([name, b]) }
      const cam = window.__tour3?.camera
      if (!cam || !window.__photoStage?.targetPoints) return { error: 'no camera or photo stage' }
      cam.updateMatrixWorld()
      // the canvas on the page (below the band in a photo room with one, place.hudBand): a point on screen is one on it
      const cv = document.querySelector('.tour-stage canvas').getBoundingClientRect()
      const V = cam.position.constructor
      const out = []
      for (const id of ids) {
        // the head on a 17 x 17 grid over the subject (k = 17 * column + row): columns 6-10 are the 9 x 9 grid's middle
        // third (its columns 3-5 and the points between), rows 0-2 run from its top row down to its second row
        const pts = window.__photoStage.targetPoints(id, 17) || []
        const head = pts.filter((_, k) => k % 17 <= 2 && Math.floor(k / 17) >= 6 && Math.floor(k / 17) <= 10)
        // (each point keeps its place on the head, pt = 3 * (column - 6) + row: an accepted view lists the points covered)
        const onScreen = []
        for (const [pt, a] of head.entries()) {
          const q = new V(...a).project(cam)
          if (!(q.z < 1 && q.z > -1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)) continue
          onScreen.push([cv.left + ((q.x + 1) / 2) * cv.width, cv.top + ((1 - q.y) / 2) * cv.height, pt])
        }
        const under = []
        for (const [x, y, pt] of onScreen) for (const [name, b] of hud) if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) under.push({ panel: name, pt, at: [Math.round(x), Math.round(y)], rect: [b.left, b.top, b.right, b.bottom].map(Math.round) })
        out.push({ id, head: head.length, onScreen: onScreen.map(([x, y]) => [Math.round(x), Math.round(y)]), under })
      }
      return { subjects: out, panels: hud.map(([n, b]) => [n, [b.left, b.top, b.right, b.bottom].map(Math.round)]) }
    },
    { ids, panels: HUD_PANELS },
  )
// Visitor-facing rights text names no owner ruling (owner order 2026-11-04; shared/rightsText.js visitorRights): with a
// record's viewer open, its label and card (the viewer's whole text, shown or not), and every title and aria-label on the
// page, hold no "owner ruling" or "owner-ruled" (any case). The rulings stay in the data, the lock and the provenance.
const RULING_WORDS = /owner[\s-]*rul/i
const rulingShown = (page) =>
  page.evaluate((src) => {
    const re = new RegExp(src, 'i')
    const hits = []
    const near = (t) => {
      const i = t.search(re)
      return t.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ')
    }
    const v = document.querySelector('.artifact-viewer')
    if (!v) hits.push('no viewer open')
    else if (re.test(v.textContent)) hits.push(`text: ...${near(v.textContent)}...`)
    for (const el of document.querySelectorAll('[title], [aria-label]'))
      for (const a of ['title', 'aria-label']) {
        const t = el.getAttribute(a)
        if (t && re.test(t)) hits.push(`${a}: ...${near(t)}...`)
      }
    return hits
  }, RULING_WORDS.source)
const RECORD_LOCK = JSON.parse(readFileSync(new URL('../src/tour/data/records.lock.json', import.meta.url), 'utf8')).records
async function declaredRecords(tour, dev = 'desktop') {
  const ctx = await browser.newContext(DEVICES[dev])
  try {
    const page = await ctx.newPage()
    for (const c of tour.chapters) {
      const mine = RECORD_LOCK.filter((r) => r.startsWith(`${tour.slug}/${c.id}/`)).map((r) => r.slice(tour.slug.length + c.id.length + 2))
      if (!mine.length) continue
      const tag = `records ${dev === 'desktop' ? '' : `${dev} `}${tour.slug}/${c.id}`
      let checked = 0
      const seenLog = []
      try {
        await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
        const maps = mine.filter((r) => r.startsWith('map:'))
        if (c.map) {
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 90000 })
          await page.waitForFunction(() => window.__mapRoute?.()?.unrolled, null, { timeout: 60000 }).catch(() => {})
          await page.waitForTimeout(800)
          await page.evaluate(() => Promise.all([...document.querySelectorAll('.map-resource-thumb img')].map((i) => ((i.loading = 'eager'), i.decode().catch(() => {})))))
          const pins = await page.evaluate(() => {
            const out = {}
            const thumbs = []
            for (const el of document.querySelectorAll('[data-map-resource]')) {
              const rid = el.getAttribute('data-map-resource')
              out[rid] = el.querySelectorAll('.map-resource-thumb img').length
              for (const b of el.querySelectorAll('[data-map-media]')) {
                const img = b.querySelector('img')
                thumbs.push({ rid, media: b.getAttribute('data-map-media'), loaded: Boolean(img && img.complete && img.naturalWidth > 0) })
              }
            }
            return { out, thumbs, bound: window.__tourApi?.records?.()?.resources || [] }
          })
          for (const m of maps) {
            const [, rid, media] = m.split(':')
            const res = pins.bound.find((r) => r.id === rid)
            if (!res || !res.media.includes(media)) fail(`${tag}: the map photograph ${media} (${rid}) is declared but not bound`)
            const t = pins.thumbs.find((x) => x.rid === rid && x.media === media)
            if (!t) fail(`${tag}: the map photograph ${media} (${rid}) has no thumbnail of its own in its pin`)
            else if (!t.loaded) fail(`${tag}: the map photograph ${media} (${rid}): its thumbnail did not load`)
            checked++
          }
          const per = {}
          for (const m of maps) per[m.split(':')[1]] = (per[m.split(':')[1]] || 0) + 1
          for (const [rid, n] of Object.entries(per)) if ((pins.out[rid] || 0) !== n) fail(`${tag}: the map pin ${rid} shows ${pins.out[rid] || 0} of its ${n} photographs`)
          await page.click('[data-hud=next]')
        } else if (maps.length) fail(`${tag}: map photographs are declared but the chapter has no map`)
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
        await page.waitForTimeout(2500)

        // the photograph the photo room stands in; at rest too, the view shows nothing past its edges (fix round 7b)
        if (mine.some((r) => r.startsWith('backdrop:'))) {
          const b = await page.evaluate(() => window.__photoStage?.bounds?.() || null)
          if (!b || !b.samples || b.outside) fail(`${tag}: the view at rest shows past the photograph's edges (${JSON.stringify(b)})`)
          const k = await keptInView(page)
          if (k && (k.off || k.behindGuide || k.noGuide)) fail(`${tag}: at rest, of the ${k.points} points of the part it keeps in view (photo.keepInView), ${k.off} are off screen and ${k.behindGuide} behind the guide${k.noGuide ? ' (no reading of the guide)' : ''}`)
          // at rest, no subject's head under a HUD panel (HUD_PANELS)
          const atIds = c.stopList.filter((s) => s.at).map((s) => s.id)
          if (atIds.length) {
            const h = await headUnderHud(page, atIds)
            if (h.error) fail(`${tag}: at rest, the head-under-HUD check has no reading (${h.error})`)
            else
              for (const x of h.subjects) {
                hudUnder({ inductee: tour.slug, chapter: c.id, view: 'rest', subject: x.id, viewport: dev }, x.under, `${tag}: at rest, ${x.under.length} of the ${x.onScreen.length} on-screen head points of ${x.id}'s subject are under a HUD panel: ${JSON.stringify(x.under)}`)
                console.log(`${tag}: at rest, ${x.id} head on screen ${JSON.stringify(x.onScreen)}; panels ${JSON.stringify(h.panels)}`)
              }
          }
        }
        for (const x of mine.filter((r) => r.startsWith('backdrop:'))) {
          const media = x.split(':')[1]
          const r = await page.evaluate((media) => {
            const b = window.__tourApi?.records?.()?.backdrop
            const draws = (window.__recordDraws?.('@backdrop') || []).filter((d) => d.media === media)
            return { bound: b?.media === media, good: draws.some((d) => d.inScene && d.visible && d.loaded && b?.files.includes(d.drawnFrom)), draws }
          }, media)
          if (!r.bound) fail(`${tag}: the photograph ${media} the room stands in is declared but not bound`)
          else if (!r.good) fail(`${tag}: the photograph ${media} the room stands in is not drawn from its own file: ${JSON.stringify(r.draws)}`)
          checked++
        }

        // each stop's record (and its series' members)
        const stops = {}
        for (const x of mine.filter((r) => !r.startsWith('map:') && !r.startsWith('backdrop:'))) {
          const series = x.includes('~')
          const [sid, media] = series ? x.split('~') : x.split(':')
          const s = (stops[sid] ||= { record: null, members: [] })
          if (series) s.members.push(media)
          else s.record = media
        }
        for (const [sid, want] of Object.entries(stops)) {
          const st = await page.evaluate((sid) => (window.__tourApi?.records?.()?.stops || []).find((s) => s.id === sid) || null, sid)
          if (!want.record) fail(`${tag}: ${sid} declares series members but no record`)
          if (!st || st.record !== want.record) {
            fail(`${tag}: ${sid}:${want.record} is declared but not bound on the page`)
            continue
          }
          for (const m of want.members) if (!st.letters.includes(m)) fail(`${tag}: ${sid}~${m} is declared but not bound on the page`)
          // pick the stop (the camera goes to it), then what the scene draws for it
          await page.evaluate((sid) => window.__tourApi.select(sid), sid)
          // (a photo room's stop: the stage has taken the pick and its view is found, fix round 12, then the camera's ease)
          if (st.at) await page.waitForFunction((sid) => window.__photoFocusFor?.(sid) ?? true, sid, { timeout: 60000 })
          await page.waitForTimeout(2200)
          const d = await page.evaluate(({ sid, st }) => {
            const own = new Set([st.record, ...st.letters])
            // round 9 fix round 7 (Codex review 6): what the camera sees of it (recordDraws.js seenState), not a box at the
            // stop: points on the record itself (a stop over the photograph: on the photograph over its subject, at.target)
            const points = st.at ? window.__photoStage?.targetPoints?.(sid) || [] : null
            // a stop over the photograph: its subject's head (the top row of the 9 x 9 grid, its middle third), measured on
            // each draw (fix round 8: the head is read on the same draw as the subject, not on the first one)
            const headPoints = st.at ? points.filter((_, k) => k % 9 === 0 && k >= 27 && k < 54) : null
            const all = st.at ? window.__recordSeen?.('@backdrop', { points }) || [] : window.__recordSeen?.(sid) || []
            const allHeads = st.at ? window.__recordSeen?.('@backdrop', { points: headPoints }) || [] : []
            for (const [i, x] of all.entries()) x.head = st.at ? (allHeads[i]?.media === x.media ? allHeads[i].seen : null) : null
            const draws = all.filter((x) => (st.at ? own.has(x.media) : x.media === st.record))
            const files = st.at ? window.__tourApi.records().backdrop?.files || [] : st.files
            const path = (u) => (u ? new URL(u, location.href).pathname : null)
            const ownFile = (x) => (x.kind === 'card' ? st.linkOnly : x.kind === 'model' ? files.includes(path(x.src)) : files.includes(x.drawnFrom))
            const good = draws.filter((x) => x.inScene && x.visible && x.loaded && ownFile(x))
            // the view's bounds
            const bounds = st.at ? window.__photoStage?.bounds?.() || null : null
            const railTop = st.at ? window.__photoStage?.railTop?.() ?? -1 : -1
            // her figure across the screen (NDC) as the frame stands her (the guide check measures her as she stands now)
            const guide = st.at ? window.__photoStage?.guideStand?.() || null : null
            return { n: draws.length, good: good.length, seen: good.map((x) => x.seen), heads: good.map((x) => x.head), draws, bounds, railTop, guide }
          }, { sid, st })
          // the draw that shows most of it (a stop over the photograph: with the head read on that same draw)
          const order = d.seen.map((s, i) => [s, i]).filter(([s]) => s).sort(([a], [b]) => b.seen / b.points - a.seen / a.points)
          const best = order.length ? order[0][0] : null
          const head = order.length ? d.heads[order[0][1]] || null : null
          const headIn = Boolean(head) && head.points > 0 && head.seen === head.points
          const how = st.at ? photoSubjectSeen(best, head, d.railTop, d.guide) : seenOk(best) ? 'seen' : null
          if (best) seenLog.push(`${sid} ${best.seen}/${best.points}${st.at ? ` ${how || 'NOT SEEN'}` : ''}`)
          if (!d.good) fail(`${tag}: ${sid}:${want.record}: the scene does not draw the record itself (${d.n ? JSON.stringify(d.draws) : 'nothing registered'})`)
          else if (!how) fail(`${tag}: ${sid}:${want.record}: the camera does not see its record once the stop is picked (${JSON.stringify(best)}${st.at ? `; frame: rail top ${d.railTop.toFixed(2)}, guide ${JSON.stringify(d.guide)}` : ''})`)
          else if (how === 'cropped') {
            const frameH = 1 - d.railTop
            const frameW = d.guide ? Math.max(1 - d.guide.x1, d.guide.x0 + 1) : 2
            const fit = Math.min(1, frameH / best.spanY) * Math.min(1, frameW / best.spanX)
            console.log(`${tag}: ${sid} cropped: seen ${best.seen}/${best.points} (below ${best.below}, side ${best.side}, framed ${best.framed}), frame ${frameW.toFixed(2)} x ${frameH.toFixed(2)}, span ${best.spanX.toFixed(2)} x ${best.spanY.toFixed(2)}, fit ${fit.toFixed(2)}, needs ${Math.ceil(0.75 * fit * best.points)}`)
          }
          {
            const k = await keptInView(page)
            if (k && (k.off || k.behindGuide || k.noGuide)) fail(`${tag}: at ${sid}, of the ${k.points} points of the part it keeps in view (photo.keepInView), ${k.off} are off screen and ${k.behindGuide} behind the guide${k.noGuide ? ' (no reading of the guide)' : ''}`)
          }
          if (st.at) {
            if (!headIn) fail(`${tag}: ${sid}:${want.record}: the subject's head is not all in view (${JSON.stringify(head)})`)
            if (!d.bounds || !d.bounds.samples || d.bounds.outside) fail(`${tag}: ${sid}:${want.record}: the view shows past the photograph's edges (${JSON.stringify(d.bounds)})`)
            // its head under no HUD panel (HUD_PANELS)
            const h = await headUnderHud(page, [sid])
            const x = h.subjects?.[0]
            if (!x) fail(`${tag}: ${sid}:${want.record}: the head-under-HUD check has no reading (${h.error || 'no subject'})`)
            else {
              hudUnder({ inductee: tour.slug, chapter: c.id, view: sid, subject: sid, viewport: dev }, x.under, `${tag}: ${sid}:${want.record}: ${x.under.length} of the ${x.onScreen.length} on-screen head points of the subject are under a HUD panel: ${JSON.stringify(x.under)}`)
              console.log(`${tag}: ${sid} head on screen ${JSON.stringify(x.onScreen)}; panels ${JSON.stringify(h.panels)}`)
            }
          }
          // the record's own viewer, and each member of a series in it
          await page.evaluate((sid) => window.__tourApi.openRecord(sid), sid)
          const ready = (id) => page.waitForSelector(`.artifact-viewer [data-viewer-record="${id}"][data-viewer-ready="true"]`, { timeout: 45000 }).then(() => true, () => false)
          if (st.letters.length) {
            if (!(await page.waitForSelector(`.artifact-viewer [data-viewer-series="${want.record}"]`, { timeout: 45000 }).then(() => true, () => false))) fail(`${tag}: ${sid}:${want.record}: the series viewer did not open`)
            else
              for (const m of want.members) {
                await page.click(`.artifact-viewer [data-series-member="${m}"]`, { timeout: 15000 }).catch(() => {})
                if (!(await ready(m))) fail(`${tag}: ${sid}~${m}: the series member did not show in the viewer with its own files loaded`)
                for (const h of await rulingShown(page)) fail(`${tag}: ${sid}~${m}: the viewer names an owner ruling to the visitor (${h})`)
                checked++
              }
          } else if (!(await ready(want.record))) fail(`${tag}: ${sid}:${want.record}: the viewer did not show the record with its own files loaded`)
          for (const h of await rulingShown(page)) fail(`${tag}: ${sid}:${want.record}: the viewer names an owner ruling to the visitor (${h})`)
          if (await page.$('.artifact-viewer [data-viewer-error]')) fail(`${tag}: ${sid}:${want.record}: the viewer shows a load error`)
          checked++
          await page.evaluate(() => window.__tourApi.closeRecord())
          await page.waitForTimeout(300)
        }
        if (checked !== mine.length) fail(`${tag}: ${checked} of ${mine.length} declared records checked`)
        console.log(`${tag}: ${checked} of ${mine.length} declared records checked (each drawn as itself, unless a FAIL above says otherwise); seen: ${seenLog.join(', ') || '-'}`)
      } catch (e) {
        fail(`${tag}: ${e.message.split('\n')[0]}`)
      }
    }
  } finally {
    await ctx.close()
  }
}

const LAUNCH = { ...(existsSync(SHELL) ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu'] }
const browser = await chromium.launch(LAUNCH)
// Photo-room stops over the photograph (stop.at), desktop and 390 x 844: picking the stop, the camera
// settles before the record's viewer opens (it moves no more than 2 % of its way in after the viewer
// is up), and once settled the guide's upper body does not overlap the stop's subject (at.target, the
// photo-pixel rectangle of what the focus shows, projected at its layer's depth). A stop without a
// target fails.
async function photoFocus(tour) {
  const chapters = tour.chapters.filter((c) => c.tier === 'photo' && c.stopList.some((s) => s.at || s.rail))
  if (!chapters.length) return
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      for (const c of chapters) {
        await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
        // a chapter with a map leg opens on it: Next goes on to the place
        if (c.map) {
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 90000 })
          await page.click('[data-hud=next]', { timeout: 30000 })
        }
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
        await page.waitForTimeout(3000)
        // round 9 fix round 1: the rail records too (raised to the middle of the view, they are the focus)
        for (const s of c.stopList.filter((x) => x.at || x.rail)) {
          const tag = `focus ${dev} ${tour.slug}/${c.id}/${s.id}`
          if (s.at && !s.at.target) {
            fail(`${tag}: stop has no at.target (the subject the guide must not cover)`)
            continue
          }
          const cam = () => page.evaluate(() => window.__tour3.camera.position.toArray())
          const p0 = await cam()
          await page.evaluate((id) => window.__tourApi.select(id), s.id)
          // (its view found first, fix round 12: the record opens once the camera has eased to it)
          if (s.at) await page.waitForFunction((id) => window.__photoFocusFor?.(id) ?? true, s.id, { timeout: 60000 }).catch(() => fail(`${tag}: the stop's view was not found in 60 s`))
          const opened = await page.waitForSelector('.object-card', { timeout: 8000 }).catch(() => null)
          if (!opened) fail(`${tag}: the record's viewer did not open`)
          const p1 = await cam()
          if (s.rail) await page.waitForTimeout(1200) // the record rises off the rail (about a second)
          const r = await page.evaluate(({ id, rail }) => ({ guide: window.__tourApi.guideBox(), target: rail ? window.__photoStage?.railBox?.(id) : window.__photoStage?.targetBox(id), vw: innerWidth, vh: innerHeight }), { id: s.id, rail: s.rail })
          await page.waitForTimeout(600)
          const p2 = await cam()
          const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
          // (a rail record rises in the foreground; the camera does not dolly for it and keeps its slow drift at rest)
          if (!s.rail && dist(p1, p2) > 0.02 * dist(p0, p1) + 1e-4) fail(`${tag}: the viewer opened before the camera settled (moved ${dist(p1, p2).toFixed(4)} of ${dist(p0, p1).toFixed(4)} after it opened)`)
          if (!r.target) fail(`${tag}: no target box`)
          else if (!r.guide) fail(`${tag}: no guide box`)
          else if (hit(r.guide, r.target))
            fail(`${tag}: guide overlaps the stop's subject ${JSON.stringify([r.guide, r.target].map((x) => [x.left, x.top, x.right, x.bottom].map(Math.round)))}`)
          console.log(`${tag} guide=${JSON.stringify(r.guide && [r.guide.left, r.guide.top, r.guide.right, r.guide.bottom].map(Math.round))} target=${JSON.stringify(r.target && [r.target.left, r.target.top, r.target.right, r.target.bottom].map(Math.round))}`)
          await page.evaluate(() => window.__tourApi.back())
          await page.waitForTimeout(1500)
        }
      }
    } catch (e) {
      fail(`focus ${dev} ${tour.slug}: ${e.message.split('\n')[0]}`)
    } finally {
      await ctx.close()
    }
  }
}

// open a chapter's place (deep link, autostart; past its map leg) and wait until it is ready
async function openPlace(page, tour, c) {
  await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
  if (c.map) {
    await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"]`, { timeout: 90000 })
    await page.click('[data-hud=next]', { timeout: 30000 })
  }
  await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
  await page.waitForTimeout(1500)
}
// A resize, or a phone turned, in a photo room (Codex review 10: the HUD panels' places measured before a rotation stayed
// counted, and the view at rest kept clear of panels no longer there). Each photo room opens at a first layout (a phone
// on its side, a smaller desktop window), settles, and is turned or resized to the gate's phone or desktop viewport. Its
// view at rest there must be the view a room opened at that viewport takes (the same yaw and pitch), the camera must go
// to it (the visitor has not acted), and its subjects' heads must be covered by the HUD exactly as in the room opened
// there, and by nothing a view there may not have: no panel, or only panels and head points an owner-accepted entry for
// that view lists (HUD_ACCEPTED; the records part holds the entry to its exact points as it measures them). Then
// the visitor acts (an arrow key) and the window goes back to the first layout: the view at rest is found again, but
// the camera stays where the visitor turned it (fix round 9: the view moves for the HUD only before the visitor acts).
// The controls hint is held on screen in both rooms (window.__IHH_HOLD_HINT), so both lay out the same panels, and both
// run with reduced motion: no idle drift, the camera on the view at rest itself when the heads are read.
const RELAYOUTS = [
  { name: 'phone turned upright', from: { width: 844, height: 390 }, to: 'phone' },
  { name: 'desktop window resized', from: { width: 1180, height: 820 }, to: 'desktop' },
]
// the view at rest once it holds still (read until it is the same three times running, from 2.5 s on)
async function restSettled(page) {
  let last = null
  let same = 0
  await page.waitForTimeout(2500)
  for (let i = 0; i < 20 && same < 3; i++) {
    const r = await page.evaluate(() => ({ rest: window.__photoRest || null, cam: window.__photoCam?.() || null }))
    const k = JSON.stringify(r)
    same = k === last ? same + 1 : 1
    last = k
    if (same < 3) await page.waitForTimeout(600)
  }
  return JSON.parse(last)
}
async function photoRelayout(tour) {
  const chapters = tour.chapters.filter((c) => c.tier === 'photo')
  if (!chapters.length) return
  const near = (a, b) => Math.abs(a - b) < 1e-6
  for (const r of RELAYOUTS) {
    const dev = DEVICES[r.to]
    for (const c of chapters) {
      const tag = `relayout ${r.name} ${tour.slug}/${c.id}`
      const atIds = c.stopList.filter((x) => x.at).map((x) => x.id)
      const reading = async (page) => {
        const v = await restSettled(page)
        const h = atIds.length ? await headUnderHud(page, atIds) : { subjects: [] }
        return { ...v, h }
      }
      const fresh = await browser.newContext({ ...dev, reducedMotion: 'reduce' })
      const turned = await browser.newContext({ ...dev, viewport: r.from, reducedMotion: 'reduce' })
      try {
        for (const ctx of [fresh, turned]) await ctx.addInitScript(() => { window.__IHH_HOLD_HINT = true })
        const pf = await fresh.newPage()
        await openPlace(pf, tour, c)
        const want0 = await reading(pf)
        const pt = await turned.newPage()
        await openPlace(pt, tour, c)
        const before = await restSettled(pt)
        await pt.setViewportSize(dev.viewport)
        const got = await reading(pt)
        if (!want0.rest || !got.rest || !before.rest) {
          fail(`${tag}: no reading of the view at rest (${JSON.stringify({ fresh: want0.rest, before: before.rest, after: got.rest })})`)
          continue
        }
        if (got.rest.at === before.rest.at) fail(`${tag}: the view at rest was not found again for the new layout (${got.rest.at})`)
        if (got.rest.at !== want0.rest.at) fail(`${tag}: the layout after the change (${got.rest.at}) is not the one a room opened there has (${want0.rest.at})`)
        const deg = (x) => ((x * 180) / Math.PI).toFixed(2)
        if (!near(got.rest.yaw, want0.rest.yaw) || !near(got.rest.pitch, want0.rest.pitch))
          fail(`${tag}: the view at rest after the change is yaw ${deg(got.rest.yaw)} pitch ${deg(got.rest.pitch)}, a room opened at this layout rests at yaw ${deg(want0.rest.yaw)} pitch ${deg(want0.rest.pitch)} (HUD panels counted: ${got.rest.hud}, there ${want0.rest.hud})`)
        if (!got.cam || !near(got.cam.yaw, got.rest.yaw) || !near(got.cam.pitch, got.rest.pitch)) fail(`${tag}: the camera does not go to the view at rest after the change (${JSON.stringify(got.cam)})`)
        if (got.h.error || want0.h.error) fail(`${tag}: the head-under-HUD check has no reading (${got.h.error || want0.h.error})`)
        else
          for (const id of atIds) {
            const x = got.h.subjects.find((y) => y.id === id)
            const y = want0.h.subjects.find((z) => z.id === id)
            const now = hudCover(x?.under || [])
            const there = hudCover(y?.under || [])
            const entry = HUD_ACCEPTED.find((e) => hudKey(e) === hudKey({ inductee: tour.slug, chapter: c.id, view: 'rest', subject: id, viewport: r.to }))
            if (!sameCover(now, there)) fail(`${tag}: at rest, ${id}'s head is covered by ${coverText(now) || 'nothing'}, in a room opened at this layout by ${coverText(there) || 'nothing'}`)
            else if (Object.entries(now).some(([p, pts]) => !entry?.cover[p] || pts.some((x) => !entry.cover[p].includes(x)))) fail(`${tag}: at rest, ${id}'s head is under a HUD panel: ${coverText(now)}${entry ? ` (listed in HUD_ACCEPTED with ${coverText(entry.cover)})` : ''}`)
            console.log(`${tag}: at rest yaw ${deg(got.rest.yaw)} pitch ${deg(got.rest.pitch)} (before ${deg(before.rest.yaw)} ${deg(before.rest.pitch)}), ${id} head covered by ${coverText(now) || 'nothing'}`)
          }
        // the visitor acts, then the window goes back: the camera stays
        await pt.evaluate(() => document.activeElement?.blur?.())
        await pt.keyboard.press('ArrowLeft')
        await pt.waitForTimeout(300)
        const acted = await pt.evaluate(() => window.__photoCam?.() || null)
        await pt.setViewportSize(r.from)
        const back = await restSettled(pt)
        if (!acted || !back.cam || !back.rest) fail(`${tag}: no reading after the visitor acted (${JSON.stringify({ acted, back })})`)
        else {
          if (back.rest.at === got.rest.at) fail(`${tag}: the view at rest was not found again after the window went back`)
          if (!near(back.cam.yaw, acted.yaw) || !near(back.cam.pitch, acted.pitch)) fail(`${tag}: the visitor turned the view to yaw ${deg(acted.yaw)} pitch ${deg(acted.pitch)}, and the window going back moved it to ${deg(back.cam.yaw)} ${deg(back.cam.pitch)}`)
        }
      } catch (e) {
        fail(`${tag}: ${e.message.split('\n')[0]}`)
      } finally {
        await fresh.close()
        await turned.close()
      }
    }
  }
}
const openRecord = async (page, id) => {
  await page.click(`[data-stop="${id}"]`)
  await page.waitForSelector('.artifact-viewer[role=dialog] [data-viewer-ready="true"]', { timeout: 30000 })
}

// The guide in frame (owner feedback round 9), every chapter of every tier, desktop and 390 x 844: at
// the chapter's start view, at every stop's focus pose, after a zoom in at a room's first stop (desktop
// wheel), and after stepping back, once the camera and the guide have settled: her whole figure (top of
// the head to the toes, hand to hand) is inside the viewport (6 px margin), nothing in the scene hides her
// head, chest, pelvis or knees (her feet may be behind a seat row or a desk), she does not overlap the
// focused stop's box on screen (its record, its object, its gallery slot, its photo subject) unless she
// stands beyond it (behind a desk; never in front of it), and her gaze is within 30 degrees of what she
// should be looking at (the focused stop, else the visitor).
const settled = (page) =>
  page
    .waitForFunction(
      () => {
        const c = window.__tour3?.camera
        if (!c) return false
        const m = c.matrixWorld.elements.map((v) => v.toFixed(4)).join()
        const now = performance.now()
        const w = (window.__guideSettle ||= { m: '', t: 0, start: now })
        // a photo room's camera drifts slowly at rest (its parallax), and its presenter stands still in the
        // visitor's frame: there the camera's ease to a stop (under 2 s) is the wait, from when the stop's view is found
        // (fix round 12: a pick with no view found ahead eases toward the tuned view while the search runs)
        if (window.__photoStage) {
          if (window.__photoFocusPending?.()) {
            w.start = now
            return false
          }
          return now - w.start > 2500
        }
        if (w.m !== m) {
          w.m = m
          w.t = now
          return false
        }
        const d = window.__guideDirector?.state()
        return now - w.t > 600 && (!d || d.settled)
      },
      null,
      { timeout: 20000, polling: 100 },
    )
    .then(() => true, () => false)
// Round 9 fix round 1 (review of part A): she is also never under the HUD: her upper body (head to pelvis,
// shoulder to shoulder) is clear of every panel on the page now (title, top buttons, Step back, stop dots, the
// caption while it shows, Hear / Next, Moments, the controls hint) and of every stop badge; she is at least 15 %
// of the viewport's height; a photo room's rail records never overlap her, at rest or raised (a raised one is the
// focus, checked like any other); and the middle-quarter shortcut for a whole building or a landscape applies only
// to a stop whose data says so (wide), never by its size on screen (as the solver: room/guideFrame.js focusRect).
// the guide's least height, a share of the view's (round 9 final review: matched to the solver's relaxed floor,
// PREFS minHeight x 0.8 of the NDC height of 2: desktop 0.22, phone 0.152)
const MIN_SHARE = { desktop: 0.22, phone: 0.15 }
async function guideCheck(page, tag, focusId, { rail = false, wide = false } = {}) {
  await page.evaluate(() => (window.__guideSettle = null))
  if (!(await settled(page))) fail(`${tag}: the camera or the guide never settled (${JSON.stringify(await page.evaluate(() => window.__guideDirector?.state() || null))})`)
  await page.waitForTimeout(2500) // her head and body finish turning (smoothly, after any walk)
  const r = await page.evaluate(
    ({ id, rail }) => {
      const g = window.__tourApi.guideBox({ full: true })
      const up = window.__tourApi.guideBox()
      let f = null
      if (id) f = rail ? window.__photoStage?.railBox?.(id) ?? null : window.__stageFocus?.box(id) ?? window.__photoStage?.targetBox(id) ?? null
      const shown = (el) => {
        for (let x = el; x && x !== document.body; x = x.parentElement) {
          const cs = getComputedStyle(x)
          if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return null
        }
        const b = el.getBoundingClientRect()
        return b.width > 0 && b.height > 0 ? { left: b.left, top: b.top, right: b.right, bottom: b.bottom } : null
      }
      const hud = []
      const panels = [['title', '[data-hud=title]'], ['top buttons', '.hud-actions'], ['Step back', '.hud-back'], ['stop dots', '.stop-dots'], ['caption', '.speech-bubble.is-on'], ['Hear / Next', '.hud-bottom-right'], ['Moments', '[data-hud=moments]'], ['controls hint', '.hint-pill']]
      for (const [name, sel] of panels) for (const el of document.querySelectorAll(sel)) { const b = shown(el); if (b) hud.push([name, b]) }
      for (const el of document.querySelectorAll('.label-anchor .hotspot')) { const b = shown(el); if (b) hud.push([`stop badge ${(el.textContent || '').trim()}`, b]) }
      // each room stop's record on screen, by its badge's number (a badge never covers its own record)
      const own = []
      const ids = window.__tourApi.info()?.spots?.map((s) => s.id) || []
      const rec = window.__roomRecords?.()?.meshes || {}
      for (const el of document.querySelectorAll('.label-anchor .hotspot')) {
        const b = shown(el)
        const n = Number(el.querySelector('span')?.textContent)
        const id = ids[n - 1]
        if (b && id && rec[id]) own.push([id, b, window.__stageFocus?.box(id) || null])
      }
      const rails = (window.__photoStage?.railIds?.() || []).filter((x) => x !== id).map((x) => [x, window.__photoStage.railBox(x)]).filter(([, b]) => b)
      // every rail record's box, and each badge's stop (by its number), for the badge-over-a-record check of photo rooms
      const allRails = (window.__photoStage?.railIds?.() || []).map((x) => [x, window.__photoStage.railBox(x)]).filter(([, b]) => b)
      const stopIds = window.__photoStage?.stopIds?.() || []
      const badgeStops = [...document.querySelectorAll('.label-anchor .hotspot')].map((el) => { const b = shown(el); return b ? [stopIds[Number(el.querySelector('span')?.textContent) - 1] || null, b] : null }).filter(Boolean)
      // the view: the canvas on the page (below the band in a photo room with one, place.hudBand; else the viewport)
      const c = document.querySelector('.tour-stage canvas').getBoundingClientRect()
      const cv = { left: c.left, top: c.top, right: c.right, bottom: c.bottom, width: c.width, height: c.height }
      return { g, up, f, hud, own, rails, allRails, badgeStops, stopCount: stopIds.length, behind: Boolean(id && window.__stageFocus?.behind?.(id)), hidden: window.__tourGuideHidden?.() || null, look: window.__tourGuideLook?.() || null, vw: innerWidth, vh: innerHeight, cv, why: window.__guideDirector?.state()?.why || null }
    },
    { id: focusId, rail },
  )
  const M = 6
  const px = (b) => JSON.stringify([b.left, b.top, b.right, b.bottom].map(Math.round))
  // two boxes overlap by more than a few pixels both ways (an edge that only touches is not a cover)
  const covers = (a, b, d = 6) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > d && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > d
  if (!r.g || r.g.behind) fail(`${tag}: the guide is not in front of the camera${r.why ? ` (${r.why})` : ''}`)
  else {
    const v = r.cv
    if (r.g.left < v.left - M || r.g.top < v.top - M || r.g.right > v.right + M || r.g.bottom > v.bottom + M) fail(`${tag}: the guide is not fully in frame ${px(r.g)} in ${px(v)}${r.why ? ` (${r.why})` : ''}`)
    const tall = r.g.bottom - r.g.top
    const least = (r.vw < 720 ? MIN_SHARE.phone : MIN_SHARE.desktop) * v.height
    if (tall < least) fail(`${tag}: the guide is too small: ${Math.round(tall)} px tall in a ${Math.round(v.height)} px view (at least ${Math.round(least)})`)
    const inner = { left: r.g.left + 4, right: r.g.right - 4, top: r.g.top + 4, bottom: r.g.bottom - 4 }
    // beyond a stop's object (behind a desk) she is not in front of it; a stop that is a whole building or a
    // landscape (its data: wide) is the place she stands in front of: she keeps clear of its middle (a quarter of
    // the screen's width), as the solver does. Any other focus is checked whole, however wide it shows
    let f = r.f
    if (f && wide) {
      const c = (f.left + f.right) / 2
      f = { ...f, left: c - 0.125 * r.cv.width, right: c + 0.125 * r.cv.width }
    }
    if (f && hit(inner, f) && !r.behind) fail(`${tag}: the guide overlaps the focus ${px(r.g)} vs ${px(f)}`)
    // her upper body (head to pelvis) is never under a HUD panel or a stop badge
    if (r.up) {
      const body = { left: r.up.left + 8, right: r.up.right - 8, top: r.up.top + 8, bottom: r.up.bottom - 8 }
      for (const [name, b] of r.hud) if (covers(body, b)) fail(`${tag}: the ${name} covers the guide ${px(body)} vs ${px(b)}`)
    }
    // two stop badges never sit on one another ("tap a number" must be unambiguous; round 9, North Hall)
    const badges = r.hud.filter(([name]) => name.startsWith('stop badge'))
    for (let i = 0; i < badges.length; i++)
      for (let j = i + 1; j < badges.length; j++)
        if (covers(badges[i][1], badges[j][1], 2)) fail(`${tag}: the ${badges[i][0].slice(0, 12)} and ${badges[j][0].slice(0, 12)} overlap ${px(badges[i][1])} vs ${px(badges[j][1])}`)
    // a badge sits by its record, never over most of it (round 9: Almonte's badges hid its records at the start view)
    for (const [id, b, rb] of r.own || []) {
      if (!rb) continue
      const ix = Math.max(0, Math.min(b.right, rb.right) - Math.max(b.left, rb.left))
      const iy = Math.max(0, Math.min(b.bottom, rb.bottom) - Math.max(b.top, rb.top))
      const area = Math.max(1, (rb.right - rb.left) * (rb.bottom - rb.top))
      if ((ix * iy) / area > 0.3) fail(`${tag}: the badge of ${id} covers ${Math.round((100 * ix * iy) / area)} % of its record ${px(b)} vs ${px(rb)}`)
    }
    // every stop badge is whole on screen (round 9 final review: Almonte's badge 1 was cut at the phone's edge)
    // (at a stop the view turns away from some stops: a badge wholly out of view is fine there; at rest every badge is
    // whole on screen)
    for (const [name, b] of r.hud.filter(([n]) => n.startsWith('stop badge'))) {
      const inside = b.left >= r.cv.left && b.top >= r.cv.top && b.right <= r.cv.right && b.bottom <= r.cv.bottom
      const outside = b.right <= r.cv.left || b.bottom <= r.cv.top || b.left >= r.cv.right || b.top >= r.cv.bottom
      // (a room's records may be all round the visitor: at rest, a badge out of view there is fine; a photo room's
      // view is fixed, so there every badge is on screen)
      if (!inside && (!(focusId || !r.stopCount) || !outside)) fail(`${tag}: the ${name.slice(0, 14)} is ${outside ? 'out of' : 'cut by the edge of'} the view ${px(b)} in ${px(r.cv)}`)
    }
    // at rest, every stop of a photo room has its badge on screen (round 9 final review: a badge was hidden while it
    // crossed her, so the check passed by removing the control)
    if (!focusId && r.stopCount && r.badgeStops.length !== r.stopCount) fail(`${tag}: ${r.badgeStops.length} of ${r.stopCount} stop badges are on screen`)
    // a photo room's badge never sits over a rail record other than its own (round 9 final review: Madrid's badge 3
    // over rail record 1)
    for (const [sid, b] of r.badgeStops || []) for (const [rid, rb] of r.allRails || []) if (rid !== sid && covers(b, rb)) fail(`${tag}: the badge of ${sid} sits over the rail record ${rid} ${px(b)} vs ${px(rb)}`)
    // a rail record never overlaps her (she would cover it, or it her)
    for (const [id, b] of r.rails) if (covers(inner, b)) fail(`${tag}: the rail record ${id} overlaps the guide ${px(inner)} vs ${px(b)}`)
  }
  // her feet may be behind a seat row or a desk in front of her; the rest of her must be in sight
  const hidden = (r.hidden || []).filter((p) => p !== 'feet')
  if (hidden.length) fail(`${tag}: the scene hides the guide's ${r.hidden.join(', ')}`)
  if (!r.look || r.look.err == null) fail(`${tag}: no gaze reading`)
  else if (r.look.err > 30) fail(`${tag}: the guide looks ${Math.round(r.look.err)} degrees away from the ${r.look.at}`)
  if (focusId && !r.f) fail(`${tag}: no focus box for ${focusId}${rail ? ' (rail record)' : ''}`)
  return r
}
// Step back in a photo room (fix round 10b, owner decision 2026-11-04): a stop's view past the look's range (turned or
// tilted past it, or moved in past it; focusView may go past it to show a head at the photograph's edge) returns to the
// view at rest only in a room with place.stepBackToRest (Prague); in every other room, and from a view inside the
// range, the camera's target is exactly where the stop left it, as before fix round 10.
// The rooms that return to rest (owner decision 2026-11-04: Prague only; Einstein's and Lamarr's arrivals on a phone,
// whose stop views lie past the range, must stay where the stop left them).
const STEP_BACK_TO_REST = ['albright/birth']
const R2D = (r) => (r * 180) / Math.PI
function stepBackCheck(tag, c, held, now, slug) {
  if (c.stepBackToRest !== STEP_BACK_TO_REST.includes(`${slug}/${c.id}`)) fail(`${tag}: place.stepBackToRest is ${c.stepBackToRest} here; the owner's decision (2026-11-04) sets it on ${STEP_BACK_TO_REST.join(', ')} only`)
  if (!now) return fail(`${tag}: no camera reading (__photoCam)`)
  const { yawMax, pitchMax, dollyMax } = held.range
  const past = Math.abs(held.yaw) > yawMax + 1e-9 || Math.abs(held.pitch) > pitchMax + 1e-9 || held.dolly < 0 || held.dolly > dollyMax
  const want = c.stepBackToRest && past ? { yaw: held.rest.yaw, pitch: held.rest.pitch, dolly: 0 } : { yaw: held.yaw, pitch: held.pitch, dolly: held.dolly }
  const deg = (v) => `yaw ${R2D(v.yaw).toFixed(2)} pitch ${R2D(v.pitch).toFixed(2)} dolly ${v.dolly.toFixed(3)}`
  const off = Math.max(Math.abs(now.yaw - want.yaw), Math.abs(now.pitch - want.pitch), Math.abs(now.dolly - want.dolly))
  const what = c.stepBackToRest && past ? 'the view at rest' : 'the stop\'s view'
  if (off > 1e-6) fail(`${tag}: Step back left the camera at ${deg(now)}, not ${what} (${deg(want)}; the stop's view ${deg(held)}, range yaw ${R2D(yawMax).toFixed(2)} pitch ${R2D(pitchMax).toFixed(2)} dolly ${dollyMax}${c.stepBackToRest ? ', place.stepBackToRest' : ''})`)
  else if (past) console.log(`${tag}: the stop's view lies past the range (${deg(held)}); Step back left it at ${what} (${deg(now)})`)
}
// Fix round 12 (owner report: in Gothenburg she jumped to her new spot when a stop was picked): every stop pick and
// every Step back, desktop and 390 x 844, samples the guide's position every animation frame from the pick until she has
// settled. A room's guide is sampled in the world (she walks the room); a photo room's presenter is sampled in her frame's
// space (the foreground she stands in moves with the camera, so a step there is a move on screen).
// The rule: no single frame may move her farther than a brisk walk would, WALK_LIMIT (2 m/s: a natural walking pace is
// 1.2-1.4 m/s, a brisk one about 2 m/s; she walks at most 1.25 m/s, room/RoomGuide.jsx WALK) times that frame's time. The
// frame time is the scene's own (the canvas clock, read with her position, so the two always belong to the same frames),
// at most FRAME_MAX (0.05 s: the scene clamps a longer frame to 0.05 s, so nothing in it moves farther than in 0.05 s). A frame is exempt only while she is not drawn at all on both
// of its ends (fully faded out: a way the room blocks is a fade out at one spot and in at the next, never a jump in sight),
// and a fade is a fade, never a pop: her opacity changes by at most a whole fade in FADE_MIN (0.15 s) per frame time.
// Once settled she must stand exactly on her spot: the director's chosen spot (rooms), or the presenter's own place in the
// frame (photo rooms, where it is where she stood before the pick), fully drawn, with no move left.
const WALK_LIMIT = 2.0
const FRAME_MAX = 0.05
const FADE_MIN = 0.15
const traceStart = (page) =>
  page.evaluate(() => {
    if (window.__guideTraceRaf) cancelAnimationFrame(window.__guideTraceRaf)
    const tr = (window.__guideTrace = [])
    const loop = (t) => {
      const g = [...(window.__guideRoots || [])].find((o) => { for (let p = o.parent; p; p = p.parent) if (!p.visible) return false; return true })
      if (g) {
        const e = g.matrixWorld.elements
        const w = [e[12], e[13], e[14]]
        // in her frame's space: the space of her top group under its scene (a photo room's foreground)
        let top = g
        while (top.parent && top.parent.parent) top = top.parent
        const c = g.position.clone().setFromMatrixPosition(g.matrixWorld).applyMatrix4(top.matrixWorld.clone().invert()).toArray()
        tr.push({ t, s: window.__tour3?.clock?.elapsedTime ?? t / 1000, w, c, o: g.userData.fade ?? 1 })
      }
      window.__guideTraceRaf = requestAnimationFrame(loop)
    }
    window.__guideTraceRaf = requestAnimationFrame(loop)
  })
async function traceCheck(page, tag, tier) {
  const r = await page.evaluate(() => {
    cancelAnimationFrame(window.__guideTraceRaf)
    window.__guideTraceRaf = null
    const roots = [...(window.__guideRoots || [])]
    const g = roots[0]
    return { tr: window.__guideTrace || [], d: window.__guideDirector?.state() || null, at: g ? [g.matrixWorld.elements[12], g.matrixWorld.elements[13], g.matrixWorld.elements[14]] : null }
  })
  const key = tier === 'photo' ? 'c' : 'w'
  const tr = r.tr
  if (tr.length < 10) return fail(`${tag}: only ${tr.length} frames of the guide sampled`)
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  let worst = { ratio: 0 }
  let moved = 0
  let faded = false
  for (let i = 1; i < tr.length; i++) {
    const a = tr[i - 1]
    const b = tr[i]
    if (a.o < 1 || b.o < 1) faded = true
    const step = dist(a[key], b[key])
    moved += step
    const dt = Math.min(FRAME_MAX, b.s - a.s)
    if (Math.abs(b.o - a.o) > dt / FADE_MIN + 1e-9) fail(`${tag}: the guide's opacity went from ${a.o.toFixed(2)} to ${b.o.toFixed(2)} in one frame, ${Math.round(b.t - tr[0].t)} ms after the pick (a pop, not a fade)`)
    if (a.o === 0 && b.o === 0) continue
    const ratio = step / (WALK_LIMIT * dt)
    if (ratio > worst.ratio) worst = { ratio, step, dt, at: Math.round(b.t - tr[0].t), o: [a.o, b.o] }
  }
  if (worst.ratio > 1) fail(`${tag}: the guide moved ${worst.step.toFixed(3)} m in one frame of ${(worst.dt * 1000).toFixed(1)} ms, ${(worst.step / worst.dt).toFixed(1)} m/s, faster than a brisk walk (${WALK_LIMIT} m/s), ${worst.at} ms after the pick, drawn at ${worst.o.map((v) => v.toFixed(2)).join(' -> ')}`)
  const last = tr.at(-1)
  if (last.o !== 1) fail(`${tag}: the guide ends ${last.o === 0 ? 'faded out' : `part faded (${last.o.toFixed(2)})`}`)
  if (tier === 'photo') {
    const off = dist(tr[0].c, last.c)
    if (off > 0.01) fail(`${tag}: the presenter ends ${off.toFixed(3)} m from her place in the frame`)
  } else {
    const d = r.d
    if (!d || !d.spot) fail(`${tag}: no spot from the guide's director`)
    else {
      if (d.move) fail(`${tag}: the guide is still moving (${d.move})`)
      const off = Math.max(dist(d.spot, d.pos), r.at ? dist(r.at, d.spot) : Infinity, dist(last.w, d.spot))
      if (off > 0.01) fail(`${tag}: the guide ends ${off.toFixed(3)} m from her spot ${JSON.stringify(d.spot.map((v) => +v.toFixed(2)))}`)
    }
  }
  if (moved > 0.05) console.log(`${tag}: guide moved ${moved.toFixed(2)} m${faded ? ' (with a fade)' : ''}, worst frame ${(100 * worst.ratio).toFixed(0)} % of the limit`)
}
async function guideFrame(tour) {
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      for (const c of tour.chapters) {
        const tag = `guide ${dev} ${tour.slug}/${c.id} (${c.tier})`
        try {
          await openPlace(page, tour, c)
          await guideCheck(page, `${tag} start`, null)
          for (const [k, s] of c.stopList.entries()) {
            await traceStart(page)
            await page.evaluate((id) => window.__tourApi.select(id), s.id)
            await guideCheck(page, `${tag} stop ${s.id}`, s.id, { rail: s.rail, wide: s.wide })
            await traceCheck(page, `${tag} stop ${s.id} move`, c.tier)
            if (k === 0 && c.tier === 'room' && dev === 'desktop') {
              // zoom in (focus mode: the wheel dollies toward the stop)
              const box = await page.evaluate(() => {
                const r = document.querySelector('.tour-stage canvas').getBoundingClientRect()
                return [r.left + r.width / 2, r.top + r.height / 2]
              })
              await page.mouse.move(box[0], box[1])
              for (let n = 0; n < 4; n++) await page.mouse.wheel(0, -120)
              await guideCheck(page, `${tag} stop ${s.id} zoomed in`, s.id, { wide: s.wide })
            }
            // where Step back leaves a photo room's camera (fix round 10b, owner decision 2026-11-04): in a room with
            // place.stepBackToRest (Prague) a stop's view past the look's range returns to the view at rest; everywhere
            // else the view stays where the stop left it, as before fix round 10 (Einstein's and Lamarr's arrivals on a
            // phone stay tilted)
            const held = c.tier === 'photo' && s.at ? await page.evaluate(() => window.__photoCam?.() || null) : null
            if (c.tier === 'photo' && s.at && !held) fail(`${tag} stop ${s.id}: no camera reading (__photoCam)`)
            await traceStart(page)
            await page.evaluate(() => window.__tourApi.back())
            await guideCheck(page, `${tag} stop ${s.id} stepped back`, null)
            await traceCheck(page, `${tag} stop ${s.id} stepped back move`, c.tier)
            if (held) stepBackCheck(`${tag} stop ${s.id} stepped back`, c, held, await page.evaluate(() => window.__photoCam?.() || null), tour.slug)
          }
          console.log(`${tag} done`)
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        }
      }
    } finally {
      await ctx.close()
    }
  }
}

// The end of a tour (owner feedback round 9): its last chapter offers "Next inductee: <name>" beside
// "Finish the tour", desktop and 390 x 844: the next inductee in the landing's scroll order (data/index.js
// INDUCTEE_ORDER, wrapping after the last), a real link a keyboard reaches (Tab), named for a screen reader,
// inside the viewport and clear of the other controls; following it opens that inductee's tour.
async function tourEnd(tour) {
  const c = tour.chapters[tour.chapters.length - 1]
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const tag = `end ${dev} ${tour.slug}/${c.id}`
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      await openPlace(page, tour, c)
      const want = await page.evaluate(async (slug) => {
        const { INDUCTEES, nextInductee } = await import('/src/tour/data/index.js')
        const n = nextInductee(slug)
        return n ? { slug: n, name: INDUCTEES[n].name } : null
      }, tour.slug)
      if (!want) {
        fail(`${tag}: no next inductee for ${tour.slug}`)
        continue
      }
      const link = await page.evaluate(() => {
        const a = document.querySelector('[data-hud=next-inductee]')
        return a && { tag: a.tagName, href: a.getAttribute('href'), text: a.textContent.replace(/\s+/g, ' ').trim(), finish: document.querySelector('[data-hud=next]')?.textContent.replace(/\s+/g, ' ').trim() }
      })
      if (!link) {
        fail(`${tag}: no "Next inductee" at the end of the tour`)
        continue
      }
      if (link.tag !== 'A' || link.href !== `tour.html?inductee=${want.slug}`) fail(`${tag}: "Next inductee" is ${link.tag} ${link.href}, not a link to ${want.slug}`)
      if (!link.text.includes('Next inductee') || !link.text.includes(want.name)) fail(`${tag}: "Next inductee" reads "${link.text}", not ${want.name}`)
      if (!/Finish the tour/.test(link.finish || '')) fail(`${tag}: no "Finish the tour" beside it ("${link.finish}")`)
      await controls(page, tag)
      // owner round 9 screenshots: a name must wrap between words, never inside one ("Madelein / e")
      const split = await page.evaluate(() => {
        const out = []
        for (const el of document.querySelectorAll('[data-hud=next-inductee], [data-hud=next]')) {
          const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
          for (let t = walk.nextNode(); t; t = walk.nextNode()) {
            for (const m of t.data.matchAll(/\S+/g)) {
              const r = document.createRange()
              r.setStart(t, m.index)
              r.setEnd(t, m.index + m[0].length)
              const tops = new Set([...r.getClientRects()].filter((q) => q.width > 0).map((q) => Math.round(q.top)))
              if (tops.size > 1) out.push(m[0])
            }
          }
        }
        return out
      })
      if (split.length) fail(`${tag}: words broken across lines in the end cards: ${split.join(', ')}`)
      if (dev === 'desktop') {
        // the keyboard reaches it
        let reached = false
        for (let n = 0; n < 40 && !reached; n++) {
          await page.keyboard.press('Tab')
          reached = await page.evaluate(() => document.activeElement?.dataset?.hud === 'next-inductee')
        }
        if (!reached) fail(`${tag}: Tab never reaches "Next inductee"`)
        else await page.keyboard.press('Enter')
      } else await page.click('[data-hud=next-inductee]')
      const ok = await page.waitForFunction((slug) => new URLSearchParams(location.search).get('inductee') === slug && document.querySelector('.splash-title, [data-hud=title]'), want.slug, { timeout: 30000 }).then(() => true, () => false)
      if (!ok) fail(`${tag}: following "Next inductee" did not open ${want.slug}'s tour`)
      else {
        const title = await page.evaluate(() => (document.querySelector('.splash-title') || document.querySelector('[data-hud=title]'))?.textContent || '')
        if (!title.includes(want.name)) fail(`${tag}: the next tour shows "${title}", not ${want.name}`)
      }
      if (shots) await page.screenshot({ path: `${shotDir}end-${tour.slug}-${dev}.jpg`, type: 'jpeg', quality: 70 })
      console.log(`${tag} -> ${want.slug} done`)
    } catch (e) {
      fail(`${tag}: ${e.message.split('\n')[0]}`)
    } finally {
      await ctx.close()
    }
  }
}

// Model zoom (owner feedback round 9, the Lamarr mechanism): every 3D record in the viewer
// (tour.html?viewer=<id>), desktop and 390 x 844. "Zoom in" and "Zoom out" are named buttons a keyboard
// reaches; each moves the camera closer or back; + and - do the same; the wheel zooms on the desktop;
// pressed again and again they stop at a limit (the button is then disabled) and never pass it.
async function modelZoom() {
  const probe = await browser.newPage()
  await probe.goto(`${BASE}/tour.html?view=moments`)
  const ids = await probe.evaluate(async () => {
    const { ARTIFACTS } = await import('/src/tour/data/artifacts.js')
    return Object.values(ARTIFACTS).filter((a) => a.kind === 'model' && !a.test && a.model?.src).map((a) => a.id)
  })
  await probe.close()
  if (!ids.length) return fail('model-zoom: no 3D records found')
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      for (const id of ids) {
        const tag = `model-zoom ${dev} ${id}`
        try {
          await page.goto(`${BASE}/tour.html?viewer=${id}`)
          await page.waitForSelector('.artifact-viewer [data-viewer-ready="true"]', { timeout: 30000 })
          await page.waitForFunction(() => window.__modelZoom?.base > 0, null, { timeout: 15000 })
          await page.waitForTimeout(1500) // the fit settles
          const z = () => page.evaluate(() => ({ ...window.__modelZoom }))
          // at rest: the ease is done and the distance holds still (the controls' damping and their distance limits can
          // still move it a little after the ease ends: round 9 fix round 2, a press out to the far limit)
          const rest = async () => {
            await page.waitForFunction(() => window.__modelZoom && !window.__modelZoom.moving, null, { timeout: 5000 }).catch(() => {})
            let prev = (await z()).d
            for (let k = 0; k < 30; k++) {
              await page.waitForTimeout(200)
              const now = (await z()).d
              if (Math.abs(now - prev) < 1e-4 * Math.max(prev, 1e-6)) break
              prev = now
            }
            return z()
          }
          const names = await page.$$eval('.stage-zoom button', (bs) => bs.map((b) => b.getAttribute('aria-label')))
          if (JSON.stringify(names) !== JSON.stringify(['Zoom in', 'Zoom out'])) fail(`${tag}: zoom buttons are ${JSON.stringify(names)}`)
          const a = await rest()
          await page.click('.stage-zoom [data-zoom="in"]')
          const b = await rest()
          if (!(b.d < a.d * 0.95)) fail(`${tag}: Zoom in did not move closer (${a.d.toFixed(3)} -> ${b.d.toFixed(3)})`)
          await page.keyboard.press('-')
          const c = await rest()
          if (!(c.d > b.d * 1.05)) fail(`${tag}: the - key did not move back (${b.d.toFixed(3)} -> ${c.d.toFixed(3)})`)
          // round 9 fix round 1: Ctrl / Cmd with + or - is the browser's zoom, never the model's
          // (the rig counts the zoom presses it takes: none may come from these keys; and the view does not move)
          for (const k of ['Control+Equal', 'Meta+Minus']) await page.keyboard.press(k)
          const cm = await rest()
          if (cm.presses !== c.presses) fail(`${tag}: Ctrl / Cmd with + or - reached the model's zoom (${c.presses} -> ${cm.presses} presses)`)
          if (Math.abs(cm.d - c.d) > c.d * 0.01) fail(`${tag}: Ctrl / Cmd with + or - zoomed the model (${c.d.toFixed(3)} -> ${cm.d.toFixed(3)})`)
          // the keyboard reaches the buttons
          await page.focus('.stage-zoom [data-zoom="in"]')
          await page.keyboard.press('Enter')
          const k = await rest()
          if (!(k.d < c.d * 0.95)) fail(`${tag}: Enter on the focused Zoom in did not zoom (${c.d.toFixed(3)} -> ${k.d.toFixed(3)})`)
          if (dev === 'desktop') {
            const box = await page.evaluate(() => {
              const r = document.querySelector('.artifact-viewer canvas').getBoundingClientRect()
              return [r.left + r.width / 2, r.top + r.height / 2]
            })
            await page.mouse.move(box[0], box[1])
            await page.waitForTimeout(800)
            const k2 = await rest()
            for (let n = 0; n < 6; n++) {
              await page.mouse.wheel(0, 120)
              await page.waitForTimeout(100)
            }
            await page.waitForTimeout(1500) // the controls' damping settles
            const w = await rest()
            if (!(w.d > k2.d * 1.02)) fail(`${tag}: the wheel did not zoom out (${k2.d.toFixed(3)} -> ${w.d.toFixed(3)})`)
          }
          for (let n = 0; n < 14; n++) await page.keyboard.press('+')
          const near = await rest()
          if (near.limit !== 'near' || near.d < near.base * 0.3 * 0.99) fail(`${tag}: zooming in did not stop at its limit (${JSON.stringify(near)})`)
          if (!(await page.$eval('.stage-zoom [data-zoom="in"]', (b) => b.disabled))) fail(`${tag}: Zoom in is not disabled at the limit`)
          for (let n = 0; n < 14; n++) await page.keyboard.press('-')
          const far = await rest()
          if (far.limit !== 'far' || far.d > far.base * 1.8 * 1.01) fail(`${tag}: zooming out did not stop at its limit (${JSON.stringify(far)})`)
          if (shots) await page.screenshot({ path: `${shotDir}model-zoom-${id}-${dev}.jpg`, type: 'jpeg', quality: 70 })
          console.log(`${tag} done`)
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        }
      }
    } finally {
      await ctx.close()
    }
  }
}

// Zoom and pan (feedback round 7): the tour's first photograph record (Einstein: the Ulm photochrom,
// EIN-M-0075), desktop and 390 x 844. "Look closer" zooms; a drag (mouse on desktop, a touch drag on
// the phone) and then an arrow key each move the visible part of the photograph, which never shows
// past the picture's edges; "Fit to view" brings the whole photograph back.
async function zoomPan(tour) {
  const c = tour.chapters.find((x) => x.stopList.some((s) => s.kind === 'photo'))
  if (!c) return
  const s = c.stopList.find((x) => x.kind === 'photo')
  // the visible part of the photograph: the stage's box in the picture's own 0..1 coordinates
  const region = (page) =>
    page.evaluate(() => {
      const fig = document.querySelector('.artifact-viewer .photo-stage')
      const img = fig?.querySelector('img')
      if (!img) return null
      const f = fig.getBoundingClientRect()
      const i = img.getBoundingClientRect()
      const x0 = (Math.max(f.left, i.left) - i.left) / i.width
      const x1 = (Math.min(f.right, i.right) - i.left) / i.width
      const y0 = (Math.max(f.top, i.top) - i.top) / i.height
      const y1 = (Math.min(f.bottom, i.bottom) - i.top) / i.height
      return { x0, x1, y0, y1, w: i.width, fw: f.width, centre: [f.left + f.width / 2, f.top + f.height / 2] }
    })
  const moved = (a, b) => Math.max(Math.abs(a.x0 - b.x0), Math.abs(a.y0 - b.y0)) > 0.02
  // a stage edge past the picture's edge would show the backdrop inside the stage
  const insidePicture = (r) => r.x0 >= -0.001 && r.y0 >= -0.001 && r.x1 <= 1.001 && r.y1 <= 1.001
  const settle = (page) => page.waitForTimeout(700) // the zoom eases over .5 s
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const tag = `zoom-pan ${dev} ${tour.slug}/${c.id}/${s.id}`
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      await openPlace(page, tour, c)
      await openRecord(page, s.id)
      const look = page.locator('.artifact-viewer button', { hasText: 'Look closer' })
      await look.click()
      await settle(page)
      const z = await region(page)
      if (!z || z.w < z.fw * 0.9) fail(`${tag}: "Look closer" did not zoom (${JSON.stringify(z)})`)
      // drag the picture toward the bottom right: the view moves toward its top left
      const [cx, cy] = z.centre
      if (dev === 'phone') {
        const cdp = await ctx.newCDPSession(page)
        const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] })
        await touch('touchStart', cx, cy)
        for (let k = 1; k <= 8; k++) await touch('touchMove', cx + k * 15, cy + k * 10)
        await touch('touchEnd')
      } else {
        await page.mouse.move(cx, cy)
        await page.mouse.down()
        await page.mouse.move(cx + 160, cy + 100, { steps: 8 })
        await page.mouse.up()
      }
      await settle(page)
      const d = await region(page)
      if (!d || !moved(z, d)) fail(`${tag}: dragging did not move the visible part (${JSON.stringify([z, d])})`)
      else if (!(d.x0 < z.x0 || d.y0 < z.y0)) fail(`${tag}: the drag moved the view the wrong way (${JSON.stringify([z, d])})`)
      if (d && !insidePicture(d)) fail(`${tag}: the drag panned past the picture's edge (${JSON.stringify(d)})`)
      if (await page.$('.artifact-viewer')) {
        // an arrow along an axis the zoomed picture overhangs (a tall photograph may still fit across)
        const key = d.x1 - d.x0 < 0.99 ? 'ArrowRight' : 'ArrowDown'
        for (let n = 0; n < 8; n++) await page.keyboard.press(key)
        await settle(page)
        const k = await region(page)
        if (!k || !moved(d, k)) fail(`${tag}: ${key} did not move the visible part (${JSON.stringify([d, k])})`)
        if (k && !insidePicture(k)) fail(`${tag}: the arrow keys panned past the picture's edge (${JSON.stringify(k)})`)
        // the pan buttons are named for a screen reader
        const names = await page.$$eval('.stage-pan button', (bs) => bs.map((b) => b.getAttribute('aria-label')))
        if (names.length !== 4 || names.some((n) => !n)) fail(`${tag}: pan buttons without names (${JSON.stringify(names)})`)
        await page.locator('.artifact-viewer button', { hasText: 'Fit to view' }).click()
        await settle(page)
        const f = await region(page)
        if (!f || f.x0 > 0.001 || f.y0 > 0.001 || f.x1 < 0.999 || f.y1 < 0.999) fail(`${tag}: "Fit to view" did not show the whole photograph (${JSON.stringify(f)})`)
      }
      console.log(`${tag} done`)
    } catch (e) {
      fail(`${tag}: ${e.message.split('\n')[0]}`)
    } finally {
      await ctx.close()
    }
  }
}

// The way out of a photograph (feedback round 7), every photo-room chapter, desktop and 390 x 844:
// once a stop's record is open there is a close button in the top-right corner of the screen with an
// accessible name; it, Esc, and a click or tap outside the record each close it, and focus goes back
// to the stop's dot.
async function photoExit(tour) {
  const chapters = tour.chapters.filter((c) => c.tier === 'photo' && c.stopList.some((s) => s.opens))
  for (const [dev, opts] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      for (const c of chapters) {
        const s = c.stopList.find((x) => x.opens)
        const tag = `photo-exit ${dev} ${tour.slug}/${c.id}/${s.id}`
        try {
          await openPlace(page, tour, c)
          const ways = {
            'the close button': async () => {
              const b = await page.evaluate(() => {
                const el = document.querySelector('.artifact-viewer .letter-close')
                const r = el?.getBoundingClientRect()
                return el && { name: el.getAttribute('aria-label') || '', right: r.right, top: r.top, w: r.width, vw: innerWidth, hit: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.letter-close') === el }
              })
              if (!b) return fail(`${tag}: no close button`)
              if (!/close/i.test(b.name)) fail(`${tag}: the close button has no accessible name ("${b.name}")`)
              if (b.right < b.vw - 80 || b.top > 80 || b.right > b.vw) fail(`${tag}: the close button is not in the top-right corner (${JSON.stringify(b)})`)
              if (b.w < 44) fail(`${tag}: the close button is smaller than 44 px (${b.w})`)
              if (!b.hit) fail(`${tag}: the close button is covered`)
              await page.click('.artifact-viewer .letter-close')
            },
            Esc: () => page.keyboard.press('Escape'),
            'a click outside': async () => {
              // the overlay's own margin, at the top left (clear of the record, its card and the close button)
              const target = await page.evaluate(() => document.elementFromPoint(24, 40)?.className || '')
              if (!/letter-overlay/.test(target)) fail(`${tag}: the point outside is "${target}", not the backdrop`)
              if (dev === 'phone') await page.touchscreen.tap(24, 40)
              else await page.mouse.click(24, 40)
            },
          }
          for (const [way, close] of Object.entries(ways)) {
            await openRecord(page, s.id)
            await page.waitForTimeout(400)
            await close()
            const gone = await page.waitForSelector('.artifact-viewer', { state: 'detached', timeout: 5000 }).then(() => true, () => false)
            if (!gone) {
              fail(`${tag}: ${way} did not close the record`)
              await page.keyboard.press('Escape')
              continue
            }
            await page.waitForFunction((id) => document.activeElement?.dataset?.stop === id, s.id, { timeout: 2000 }).catch(async () => {
              const a = await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 80))
              fail(`${tag}: after ${way}, focus is not on the stop's dot (${a})`)
            })
            if (await page.$('.hud-back')) fail(`${tag}: after ${way}, the view is still held at the stop`)
            await page.waitForTimeout(600)
          }
          console.log(`${tag} done`)
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        }
      }
    } finally {
      await ctx.close()
    }
  }
}

// Room records (feedback round 7): in a rebuilt room every stop that refers to a record shows it at the
// stop: a visible mesh with its image (or a link-only record's card) drawn, by the stop's own object or
// its number.
async function roomRecords(page, tag) {
  const ok = await page
    .waitForFunction(
      () => {
        const r = window.__roomRecords?.()
        return r && r.declared.every((id) => r.meshes[id]?.material?.map?.image?.width > 0)
      },
      null,
      { timeout: 30000 },
    )
    .then(() => true, () => false)
  const r = await page.evaluate(() => {
    const rec = window.__roomRecords?.()
    if (!rec) return null
    const spots = window.__tourApi.info()?.spots || []
    // every stop that declares a record in the tour data (not only those the room kept: Codex review 3)
    return rec.declared.map((id) => {
      const m = rec.meshes[id]
      if (!m) return { id, missing: true }
      m.updateWorldMatrix(true, false)
      let shown = m.visible
      for (let o = m.parent; o; o = o.parent) shown = shown && o.visible
      const p = m.getWorldPosition(m.position.clone())
      const s = m.geometry.parameters
      const spot = spots.find((x) => x.id === id)
      // at the stop: on (or by) the stop's object, or within 2 m of its number (a stop whose object is
      // a whole colonnade or desk shows its record by the number, where the visitor looks)
      const box = spot?.box.clone().expandByScalar(1.5)
      return { id, shown, image: m.material.map?.image?.width || 0, size: [s.width, s.height], near: spot ? box.containsPoint(p) || spot.ring.distanceTo(p) <= 2 : null }
    })
  })
  if (!r) return fail(`${tag}: the room reports no records (window.__roomRecords)`)
  if (!ok) fail(`${tag}: not every record at a stop was drawn within 30 s (${JSON.stringify(r)})`)
  for (const x of r) {
    if (x.missing) fail(`${tag}: stop ${x.id} refers to a record but the room shows none`)
    else {
      if (!x.shown || !x.image || Math.min(...x.size) < 0.08) fail(`${tag}: the record at stop ${x.id} is not visible (${JSON.stringify(x)})`)
      if (x.near === false) fail(`${tag}: the record at stop ${x.id} is not at its stop`)
    }
  }
  if (r.length) console.log(`${tag}: records at stops ${r.map((x) => x.id).join(', ')}`)
}

let fails = 0
const fail = (msg) => {
  fails++
  console.log(`  FAIL ${msg}`)
}

// Behind the splash nothing moves: the camera pose of a chapter opened straight on its place (no
// map leg, no autostart) is the same after 4 s, the splash is up and no caption shows.
const pose = (page) =>
  page.evaluate(() => {
    const c = window.__tour3?.camera
    return c ? [...c.position.toArray(), ...c.quaternion.toArray()] : null
  })
async function beforeBegin(tour, dev, opts) {
  const still = tour.chapters.filter((c) => !c.map)
  if (!still.length) return console.log(`${dev} ${tour.slug}: no chapter opens without a map leg; before-Begin check skipped`)
  for (const c of still) {
    const tag = `${dev} ${tour.slug} before Begin ${c.id} (${c.tier})`
    const ctx = await browser.newContext(opts)
    try {
      const page = await ctx.newPage()
      const errors = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}`)
      await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-ready="true"]`, { timeout: 90000 })
      await page.waitForTimeout(500)
      const p0 = await pose(page)
      await page.waitForTimeout(4000)
      const p1 = await pose(page)
      if (!p0 || !p1) fail(`${tag}: no camera`)
      else {
        const moved = Math.max(...p0.map((v, k) => Math.abs(v - p1[k])))
        if (moved > 1e-4) fail(`${tag}: the camera moved before Begin (max change ${moved.toExponential(2)})`)
      }
      if (!(await page.$('.tour-splash'))) fail(`${tag}: no Begin splash`)
      if (await page.$('.speech-bubble.is-on')) fail(`${tag}: the guide spoke before Begin`)
      for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
      console.log(`${tag} done`)
    } catch (e) {
      fail(`${tag}: ${e.message.split('\n')[0]}`)
    } finally {
      await ctx.close()
    }
  }
}

// Sound blocked, no gesture: captions run on their clock, the HUD and the stops still work.
const caption = (page) => page.evaluate(() => (document.querySelector('.speech-bubble.is-on .speech-text')?.textContent || ''))
// The first caption shows (the controls hint with it when asked) and advances on its own.
async function firstLine(page, tag, { hint }) {
  const shown = await page.waitForSelector('.speech-bubble.is-on .speech-text', { timeout: 20000 }).catch(() => null)
  const first = shown ? await caption(page) : ''
  if (!first) {
    fail(`${tag}: no caption`)
    return false
  }
  // the controls hint starts with the opening line (8 s)
  if (hint && !(await page.$('.hint-pill'))) fail(`${tag}: no controls hint with the opening line`)
  // advances: the caption changes or clears within 40 s
  const moved = await page.waitForFunction((t) => (document.querySelector('.speech-bubble.is-on .speech-text')?.textContent || '') !== t, first, { timeout: 40000 }).catch(() => null)
  if (!moved) fail(`${tag}: the caption "${first.slice(0, 60)}" never advanced`)
  return true
}

// Muted: Begin, then M at once. The guide's lines still show and advance, the hint shows with the
// opening, and a click on a record stop opens it (the stop with a place note first, whose viewer
// card must show that note).
async function mutedPass(tour) {
  for (const c of tour.chapters) {
    const tag = `muted ${tour.slug} ${c.id} (${c.tier})`
    const ctx = await browser.newContext(DEVICES.desktop)
    try {
      const page = await ctx.newPage()
      const errors = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}`)
      await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"]`, { timeout: 90000 })
      if (!c.map) await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-ready="true"]`, { timeout: 90000 })
      await page.click('.tour-splash .btn-cream')
      await page.keyboard.press('m')
      if (!(await page.$('.hud-sound.is-muted'))) fail(`${tag}: M did not mute the guide`)
      if (c.map) {
        await firstLine(page, `${tag} map leg`, { hint: false })
        await page.click('[data-hud=next]')
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
      }
      await firstLine(page, tag, { hint: true })
      // a record stop opens it; a stop with a place note (a record shown where it was not made)
      // is the one opened, and its viewer card must show the note
      const rec = c.stopList.find((x) => x.placeNote) || c.stopList.find((x) => x.opens)
      if (rec) {
        await page.click(`[data-stop="${rec.id}"]`)
        const viewer = await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 }).catch(() => null)
        if (!viewer) fail(`${tag}: stop ${rec.id} did not open its record`)
        else if (rec.placeNote) {
          const card = await page.$eval('.artifact-viewer .object-card', (el) => el.textContent).catch(() => '')
          if (!card.includes(rec.placeNote)) fail(`${tag}: stop ${rec.id}: the viewer card lacks its place note "${rec.placeNote}"`)
          else console.log(`${tag}: stop ${rec.id} card shows its place note`)
        }
      }
      for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
      console.log(`${tag} done`)
    } catch (e) {
      fail(`${tag}: ${e.message.split('\n')[0]}`)
    } finally {
      await ctx.close()
    }
  }
}

async function blockedAudio(tour) {
  const muted = await chromium.launch({ ...LAUNCH, args: [...LAUNCH.args, '--autoplay-policy=user-gesture-required'] })
  try {
    for (const c of tour.chapters) {
      const tag = `blocked-audio ${tour.slug} ${c.id} (${c.tier})`
      const ctx = await muted.newContext(DEVICES.desktop)
      try {
        const page = await ctx.newPage()
        const errors = []
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
        page.on('pageerror', (e) => errors.push(String(e)))
        await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
        // Every action before step 5 is untrusted (element.click() / __tourApi, no pointerdown):
        // no user activation, so the browser keeps sound blocked and the captions run on a clock.
        const untrustedClick = (sel) => page.evaluate((q) => document.querySelector(q)?.click(), sel)
        const audible = async (where) => {
          if (await page.evaluate(() => window.__tourApi?.usingAudio?.())) fail(`${tag}: sound played without a gesture (${where})`)
        }
        // 1. the first line: map narration on a map leg, else the opening (with the controls hint)
        await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="${c.map ? 'map' : 'room'}"]`, { timeout: 90000 })
        if (!(await firstLine(page, tag, { hint: !c.map }))) continue
        await audible('first line')
        if (c.map) {
          await untrustedClick('[data-hud=next]')
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
          await firstLine(page, `${tag} after the map leg`, { hint: true })
          await audible('opening after the map leg')
        }
        // 2. a stop with a record still opens it
        const rec = c.stopList.find((x) => x.opens)
        if (rec) {
          await untrustedClick(`[data-stop="${rec.id}"]`)
          const viewer = await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 }).catch(() => null)
          if (!viewer) fail(`${tag}: stop ${rec.id} did not open its record`)
          await page.evaluate(() => window.__tourApi.back())
        }
        // 3. a chapter's closing lines (a room's, a photo room's or a gallery's) once every stop has been visited
        if (c.closing) {
          for (const st of c.stopList) {
            await untrustedClick(`[data-stop="${st.id}"]`)
            await page.waitForTimeout(400)
            await page.waitForFunction(() => !window.__tourApi?.speaking?.(), null, { timeout: 60000 }).catch(() => fail(`${tag}: stop ${st.id} never finished`))
            if (st.opens) {
              // the viewer opens (in a photo room or gallery, once the camera has settled) and narrates its
              // record: let it finish, then close it
              await page.waitForSelector('.artifact-viewer[role=dialog]', { timeout: 30000 }).catch(() => fail(`${tag}: stop ${st.id} did not open its record`))
              await page.waitForTimeout(400)
              await page.waitForFunction(() => !window.__tourApi?.speaking?.(), null, { timeout: 60000 }).catch(() => {})
              await untrustedClick('.artifact-viewer .letter-close')
              await page.waitForFunction(() => !document.querySelector('.artifact-viewer[role=dialog]'), null, { timeout: 10000 }).catch(() => {})
            }
          }
          const closed = await page.waitForFunction((id) => document.querySelector('.speech-bubble.is-on .speech-src')?.textContent.includes(id), c.closing, { timeout: 15000 }).catch(() => null)
          if (!closed) fail(`${tag}: no closing lines (${c.closing}) after every stop`)
        }
        await audible('stops')
        // 4. last, a real click: "Hear this chapter" brings the opening back, pressed while it plays
        const hear = await page.$('[data-hud=hear]')
        if (!hear) fail(`${tag}: no "Hear this chapter" button`)
        else {
          await page.waitForFunction(() => !window.__tourApi?.speaking?.(), null, { timeout: 60000 }).catch(() => {})
          await hear.click()
          const again = await page.waitForSelector('.speech-bubble.is-on .speech-text', { timeout: 10000 }).catch(() => null)
          if (!again) fail(`${tag}: "Hear this chapter" showed no caption`)
          if ((await hear.getAttribute('aria-pressed')) !== 'true') fail(`${tag}: "Hear this chapter" is not pressed while it plays`)
        }
        for (const e of errors) fail(`${tag}: console error: ${e.slice(0, 300)}`)
        console.log(`${tag} done`)
      } catch (e) {
        fail(`${tag}: ${e.message.split('\n')[0]}`)
      } finally {
        await ctx.close()
      }
    }
  } finally {
    await muted.close()
  }
}

// A stop picked as soon as its dot shows (owner round 8: a visitor clicking a stop must see the camera move). Every
// room chapter, desktop and phone: stop 1 is picked the moment the dots appear (the room's model may still be
// loading, the opening not yet played); then, in each tour's first room chapter, again while the opening plays.
// For the "dots" pick the room's model (.glb) is held back until after the click, and the stage must still report
// data-ready="false" when it is clicked, so the race is real on every run (review minor: on a warm load it was not).
// The camera must then land on that stop's own pose (RoomStage views[id].pose) within 100 s (the held model loads
// first; the flight itself takes under 2 s).
async function earlyPick(tour) {
  const rooms = tour.chapters.filter((c) => c.tier === 'room' && c.stops)
  for (const [dev, opts] of Object.entries(DEVICES))
    for (const [k, c] of rooms.entries())
      for (const when of k === 0 ? ['dots', 'opening'] : ['dots']) {
        const tag = `${dev} ${tour.slug} ${c.id} pick stop 1 (${when === 'dots' ? 'as the dots show' : 'during the opening'})`
        const ctx = await browser.newContext(opts)
        try {
          const page = await ctx.newPage()
          // hold the room's model until the stop is picked (only for the "as the dots show" pick)
          let release = () => {}
          const held = new Promise((r) => (release = r))
          if (when === 'dots')
            await page.route(/\.glb(\?|$)/, async (route) => {
              await held
              await route.continue()
            })
          await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&chapter=${c.id}&autostart=1`)
          if (c.map) {
            await page.waitForSelector('.tour-stage[data-phase="map"]', { timeout: 30000 })
            await page.click('[data-hud=next]')
          }
          await page.waitForSelector('[data-stop]', { timeout: 90000 })
          if (when === 'opening') {
            await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-ready="true"]`, { timeout: 90000 })
            await page.waitForSelector('.speech-bubble.is-on', { timeout: 20000 })
          }
          if (when === 'dots') {
            const ready = await page.getAttribute('.tour-stage', 'data-ready')
            if (ready !== 'false') fail(`${tag}: the stage was ready (data-ready="${ready}") before the pick: no race`)
          }
          await (await page.$$('[data-stop]'))[0].click()
          release()
          const id = c.stopList[0].id
          const got = await page
            .waitForFunction(
              (id) => {
                const pose = window.__tourApi?.info()?.room?.views?.[id]?.pose
                const cam = window.__tour3?.camera?.position
                if (!pose || !cam) return false
                return Math.hypot(cam.x - pose.pos[0], cam.y - pose.pos[1], cam.z - pose.pos[2]) < 0.15 && cam.toArray()
              },
              id,
              { timeout: 100000, polling: 250 },
            )
            .then(() => true)
            .catch(() => false)
          if (!got) {
            const where = await page.evaluate((id) => ({ cam: window.__tour3?.camera?.position.toArray(), pose: window.__tourApi?.info()?.room?.views?.[id]?.pose?.pos }), id)
            fail(`${tag}: the camera did not move to the stop's pose (${JSON.stringify(where)})`)
          }
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        } finally {
          await ctx.close()
        }
      }
  console.log(`${tour.slug}: early stop picks checked in ${rooms.length} room(s)`)
}

async function run() {
  // the tours, read from the app's own data through the dev server
  const probe = await browser.newPage()
  await probe.goto(`${BASE}/tour.html?view=moments`)
  const tours = await probe.evaluate(async () => {
    const { TOURS } = await import('/src/tour/data/index.js')
    const { artifactById } = await import('/src/tour/data/artifacts.js')
    const kindOf = (s) => (s.art || (s.artifact ? artifactById(s.artifact) : null))?.kind || null
    return Object.entries(TOURS)
      .filter(([, t]) => t.chapters)
      .map(([slug, t]) => ({
        slug,
        chapters: t.chapters.map((c) => ({
          id: c.id,
          title: c.title,
          tier: c.place.tier,
          map: Boolean(c.map),
          hudBand: Boolean(c.place.hudBand),
          stepBackToRest: Boolean(c.place.stepBackToRest),
          stops: c.stops.length,
          stopList: c.stops.map((s) => ({ id: s.id, kind: kindOf(s), opens: Boolean(s.art || s.artifact), rail: Boolean(s.rail), wide: Boolean(s.wide), placeNote: s.placeNote || null, at: s.at ? { layer: s.at.layer, target: s.at.target || null } : null })),
          closing: (c.place.tier === 'room' ? c.place.room?.closing : c.closing)?.factIds?.[0] || null,
        })),
      }))
  })
  await probe.close()
  const walk = tours.filter((t) => !only.length || only.includes(t.slug))
  // --chapters=a,b: only those chapters of each tour (a quick re-check while tuning; the gate runs them all)
  const pick = process.argv.find((a) => a.startsWith('--chapters='))?.slice(11).split(',') || null
  for (const t of walk) t.allChapters = t.chapters
  if (pick) for (const t of walk) t.chapters = t.chapters.filter((c) => pick.includes(c.id))
  if (want('records')) hudStaleTours(tours)
  if (!walk.length) {
    fail(`no chapter tours to walk (asked: ${only.join(', ') || 'all'}; found: ${tours.map((t) => t.slug).join(', ') || 'none'})`)
    return
  }

  // the 3D records' zoom, once per run (they are records, not one tour's)
  if (want('modelzoom') && (!only.length || only.includes('lamarr'))) await modelZoom()
  for (const tour of walk) {
    if (want('blocked')) await blockedAudio(tour)
    if (want('muted')) await mutedPass(tour)
    for (const [dev, opts] of Object.entries(want('walk') ? DEVICES : {})) {
      await beforeBegin(tour, dev, opts)
      const ctx = await browser.newContext(opts)
      const page = await ctx.newPage()
      const errors = []
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.goto(`${BASE}/tour.html?inductee=${tour.slug}&autostart=1`)
      let reported = 0 // console errors are charged to the chapter being opened (the Next before it included)
      for (const [i, c] of tour.chapters.entries()) {
        const tag = `${dev} ${tour.slug} ${i + 1}/${tour.chapters.length} ${c.id} (${c.tier})`
        try {
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"]`, { timeout: 20000 })
          if (c.map) {
            await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="map"] canvas`, { timeout: 20000 })
            await page.waitForTimeout(2500)
            if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-map-${dev}.jpg`, type: 'jpeg', quality: 70 })
            await controls(page, `${tag} map`)
            await page.click('[data-hud=next]')
          }
          await page.waitForSelector(`.tour-stage[data-chapter="${c.id}"][data-phase="room"][data-ready="true"]`, { timeout: 90000 })
          const r = await page.evaluate(() => {
            const canvas = document.querySelector('.tour-stage canvas')
            const box = canvas?.getBoundingClientRect()
            return { canvas: Boolean(canvas && box.width > 0 && box.height > 0), title: document.querySelector('[data-hud=title]')?.textContent || '', stops: document.querySelectorAll('[data-stop]').length }
          })
          if (!r.canvas) fail(`${tag}: no stage canvas`)
          if (!r.title.includes(c.title)) fail(`${tag}: title block "${r.title}" lacks "${c.title}"`)
          if (r.stops !== c.stops) fail(`${tag}: ${r.stops} stop dots, chapter has ${c.stops}`)
          if (c.tier === 'room') await roomRecords(page, tag)
          // the opening line's caption (the place arrival plays it after a short beat)
          const caption = await page.waitForSelector('.speech-bubble.is-on', { timeout: 15000 }).catch(() => null)
          if (!caption) fail(`${tag}: no caption for the opening line`)
          await page.waitForTimeout(2500)
          await controls(page, tag)
          if (dev === 'phone') {
            const boxes = await page.evaluate(() => {
              const b = (sel) => {
                const el = document.querySelector(sel)
                if (!el) return null
                const r = el.getBoundingClientRect()
                return r.width && r.height ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom } : null
              }
              const g = window.__tourApi?.guideBox?.()
              // (clipped to the canvas: below the band in a photo room with one, place.hudBand)
              const cv = document.querySelector('.tour-stage canvas').getBoundingClientRect()
              const clip = g && { left: Math.max(cv.left, g.left), right: Math.min(cv.right, g.right), top: Math.max(cv.top, g.top), bottom: Math.min(cv.bottom, g.bottom) }
              return { title: b('[data-hud=title]'), dots: b('.stop-dots'), caption: b('.speech-bubble.is-on'), hint: b('.hint-pill'), hear: b('[data-hud=hear]'), next: b('[data-hud=next]'), guide: clip && clip.right > clip.left && clip.bottom > clip.top ? clip : null }
            })
            for (const k of ['title', 'dots', 'caption', 'guide']) if (!boxes[k] && !(k === 'dots' && c.stops === 0)) fail(`${tag}: no ${k} box`)
            const names = Object.keys(boxes).filter((k) => boxes[k])
            for (let a = 0; a < names.length; a++)
              for (let b = a + 1; b < names.length; b++) if (hit(boxes[names[a]], boxes[names[b]])) fail(`${tag}: ${names[a]} overlaps ${names[b]} ${JSON.stringify([boxes[names[a]], boxes[names[b]]].map((x) => [x.left, x.top, x.right, x.bottom].map(Math.round)))}`)
          }
          if (shots) await page.screenshot({ path: `${shotDir}${tour.slug}-${c.id}-${dev}.jpg`, type: 'jpeg', quality: 70 })
        } catch (e) {
          fail(`${tag}: ${e.message.split('\n')[0]}`)
        }
        for (const e of errors.slice(reported)) fail(`${tag}: console error: ${e.slice(0, 300)}`)
        reported = errors.length
        console.log(`${tag} done`)
        if (i < tour.chapters.length - 1) await page.click('[data-hud=next]', { timeout: 10000 }).catch((e) => fail(`${tag}: Next: ${e.message.split('\n')[0]}`))
      }
      await page.waitForTimeout(1000)
      for (const e of errors.slice(reported)) fail(`${dev} ${tour.slug} end: console error: ${e.slice(0, 300)}`)
      await ctx.close()
    }
    if (want('pick')) await earlyPick(tour)
    if (want('small')) await smallControls(tour)
    if (want('focus')) await photoFocus(tour)
    if (want('relayout')) await photoRelayout(tour)
    if (want('guide')) await guideFrame(tour)
    if (want('maplabels')) await mapLabels(tour)
    if (want('records')) {
      for (const dev of ['desktop', 'phone']) await declaredRecords(tour, dev)
      hudStale(tour)
    }
    if (want('end')) await tourEnd(tour)
    if (want('zoom')) await zoomPan(tour)
    if (want('exit')) await photoExit(tour)
  }
}

try {
  await run()
} catch (e) {
  fail(`run: ${e.message.split('\n')[0]}`)
} finally {
  await browser.close()
}
console.log(fails ? `FAILURES: ${fails}` : 'ALL OK')
process.exit(fails ? 1 : 0)
