import { test, expect } from 'vitest'
import { photoCamera, photoLayout, solvePhotoCamera, ground } from './photoProjection.js'
import { galleryLayout, MAX_CASE_OBJECTS } from './galleryLayout.js'
import { LAMARR_CHAPTERS_DEMO, NORMANDIE_HARBOR } from '../data/lamarr-chapters-demo.js'
import { validateTour, resolveChapter } from '../data/chapters.js'
import INDEX from '../data/facts.generated.json'

test('the stored Normandie camera is the hand solve (horizon row, liner waterline 313 m)', () => {
  const s = solvePhotoCamera(NORMANDIE_HARBOR)
  expect(NORMANDIE_HARBOR.camera.pitchDeg).toBeCloseTo(s.pitchDeg, 3)
  expect(NORMANDIE_HARBOR.camera.height).toBeCloseTo(s.height, 3)
  const cam = photoCamera(NORMANDIE_HARBOR)
  const { from, to, length } = NORMANDIE_HARBOR.solve
  const a = ground(cam, NORMANDIE_HARBOR.crop, ...from)
  const b = ground(cam, NORMANDIE_HARBOR.crop, ...to)
  expect(a.distanceTo(b)).toBeCloseTo(length, 2)
})

test('photo layout builds every proxy layer and pivots on the named layer', () => {
  const l = photoLayout(NORMANDIE_HARBOR)
  expect(l.boxes.map((b) => b.id)).toEqual(['hull', 'upper', 'ferry-1', 'ferry-2', 'ferry-3'])
  expect(l.cards.map((c) => c.id)).toEqual(['island'])
  const hull = l.boxes[0]
  expect(l.pivot.x).toBeCloseTo(hull.position.x, 6)
  expect(l.pivot.z).toBeCloseTo(hull.position.z, 6)
  expect(l.far).toBeGreaterThan(0)
})

const doc = (id) => ({ id, name: id, art: { id: 'X-M-0001', kind: 'document', pages: [{ src: `/${id}-1.webp` }, { src: `/${id}-2.webp` }] } })
const sheet = (id) => ({ id, name: id, art: { id: 'X-M-0002', kind: 'sheet', pages: [{ src: `/${id}.webp` }] } })

test('gallery: objects left to right in stop order, the first sheet on its stand, the panel on the wall', () => {
  const l = galleryLayout([doc('a'), sheet('s'), doc('b'), { id: 'panel', name: 'Panel', panel: true }])
  expect(l.bed.map((o) => o.id)).toEqual(['a', 'b'])
  expect(l.stand.id).toBe('s')
  expect(l.panel.id).toBe('panel')
  expect(l.bed[0].x).toBeLessThan(l.stand.x)
  expect(l.stand.x).toBeLessThan(l.bed[1].x)
  for (const id of ['a', 'b', 's', 'panel']) expect(l.views.desktop[id] && l.views.phone[id]).toBeTruthy()
  for (const id of ['a', 'b']) expect(l.bed.find((b) => b.id === id).box.min[0]).toBeLessThan(l.bed.find((b) => b.id === id).box.max[0])
})

// owner feedback round 9 (the Berlin case): a single record sits in the middle of the case, several
// share it evenly (equal steps between neighbours, the outer ones as far from either end)
const xs = (l) => [...l.bed.map((b) => ({ id: b.id, x: b.x })), ...(l.stand ? [{ id: l.stand.id, x: l.stand.x }] : [])].sort((a, b) => a.x - b.x).map((o) => o.x)
test('gallery: a single record is centred in the case, a sheet on its stand or a document on the bed', () => {
  expect(galleryLayout([sheet('s')]).stand.x).toBeCloseTo(0, 9)
  const one = galleryLayout([doc('a')])
  expect(one.bed[0].x).toBeCloseTo(0, 9)
  const pages = one.bed[0].pages.map((p) => p.x)
  expect((Math.min(...pages) + Math.max(...pages)) / 2).toBeCloseTo(0, 9)
  expect(galleryLayout([sheet('s'), { id: 'panel', name: 'Panel', panel: true }]).stand.x).toBeCloseTo(0, 9)
})
test('gallery: several records are laid evenly across the case', () => {
  for (const stops of [[sheet('s'), sheet('t')], [doc('a'), sheet('s'), doc('b')], [1, 2, 3, 4, 5].map((i) => doc(`d${i}`))]) {
    const x = xs(galleryLayout(stops))
    const step = x[1] - x[0]
    for (let i = 1; i < x.length; i++) expect(x[i] - x[i - 1]).toBeCloseTo(step, 9)
    expect(x[0] + x[x.length - 1]).toBeCloseTo(0, 9) // symmetric about the middle
  }
})

test('gallery: up to six objects, slots never overlap', () => {
  const six = [1, 2, 3, 4, 5, 6].map((i) => doc(`d${i}`))
  const l = galleryLayout(six)
  expect(l.bed).toHaveLength(MAX_CASE_OBJECTS)
  for (let i = 1; i < l.bed.length; i++) expect(l.bed[i].x - l.bed[i - 1].x).toBeGreaterThanOrEqual(l.bed[i].slotW - 1e-9)
  expect(() => galleryLayout([...six, doc('d7')])).toThrow(/at most 6/)
})

test('gallery: the demo case lays its two objects evenly (the file fanned in the left half, the patent on its stand in the right)', () => {
  const big = LAMARR_CHAPTERS_DEMO.chapters.find((c) => c.kind === 'big-work')
  const l = galleryLayout(big.stops)
  expect(l.bed).toHaveLength(1)
  expect(l.bed[0].x).toBeCloseTo(-0.415, 3)
  expect(l.bed[0].pages.map((p) => p.x)).toEqual([-0.726, -0.519, -0.311, -0.104].map((x) => expect.closeTo(x, 2)))
  expect(l.stand.x).toBeCloseTo(0.415, 3)
})

test('the Lamarr chapter demo is a valid tour of verified facts and cleared media', () => {
  expect(validateTour(LAMARR_CHAPTERS_DEMO, INDEX)).toEqual([])
  expect(LAMARR_CHAPTERS_DEMO.chapters.map((c) => c.place.tier)).toEqual(['photo', 'room', 'gallery'])
  expect(resolveChapter(LAMARR_CHAPTERS_DEMO, 'big-work')).toBe(2)
  for (const c of LAMARR_CHAPTERS_DEMO.chapters) for (const s of c.stops) expect(s.id && s.name).toBeTruthy()
})

test('every photo-room stop over the photograph names its subject (at.target) inside the crop', async () => {
  const { TOURS } = await import('../data/index.js')
  let n = 0
  for (const [slug, tour] of Object.entries(TOURS))
    for (const c of tour.chapters || [])
      for (const s of c.stops)
        if (s.at) {
          n++
          const t = s.at.target
          const { x, y, w, h } = c.place.photo.crop
          expect(t, `${slug}/${c.id}/${s.id}`).toHaveLength(4)
          expect(t[0] < t[2] && t[1] < t[3], `${slug}/${c.id}/${s.id}`).toBe(true)
          expect(t[0] >= x && t[1] >= y && t[2] <= x + w && t[3] <= y + h, `${slug}/${c.id}/${s.id} inside the crop`).toBe(true)
        }
  expect(n).toBeGreaterThan(0)
})

test('a focus settles before its record opens: the wait is the time the camera ease takes to 0.5 %', async () => {
  const { FOCUS_RATE, FOCUS_SETTLE_MS } = await import('./photoProjection.js')
  expect(Math.exp((-FOCUS_RATE * FOCUS_SETTLE_MS) / 1000)).toBeLessThanOrEqual(0.005)
})

// feedback round 7: no gallery case renders as an empty glass box
const caseShows = (l) => [...l.bed.map((b) => b.pages.length > 0 || Boolean(b.model) || Boolean(b.card)), Boolean(l.stand?.src)].filter(Boolean).length + (l.caseCard ? 1 : 0)

test('gallery: a case with no object holds a printed card of the verified lines; a link-only record lies as a labelled card', () => {
  const l = galleryLayout([{ id: 'panel', name: 'Panel', panel: true }])
  expect(l.bed).toHaveLength(0)
  expect(l.caseCard).toBeTruthy()
  const link = galleryLayout([{ id: 'l', name: 'A letter', art: { id: 'X-M-0003', kind: 'sheet', title: 'A letter', linkOnly: true } }])
  expect(l.stand).toBeNull()
  expect(link.bed[0].card).toMatchObject({ title: 'A letter' })
  expect(link.caseCard).toBeNull()
  expect(galleryLayout([doc('a')]).caseCard).toBeNull()
})

test('every gallery chapter of every tour shows its records or its verified lines in the case; nothing in it is empty', async () => {
  const { TOURS } = await import('../data/index.js')
  let n = 0
  for (const [slug, tour] of Object.entries(TOURS))
    for (const c of tour.chapters || []) {
      if (c.place.tier !== 'gallery') continue
      n++
      const tag = `${slug}/${c.id}`
      const l = galleryLayout(c.stops)
      expect(caseShows(l), `${tag}: the case shows nothing`).toBeGreaterThan(0)
      for (const b of l.bed) expect(b.pages.length > 0 || Boolean(b.model) || Boolean(b.card), `${tag}/${b.id}: an empty slot in the case`).toBe(true)
      if (l.stand) expect(l.stand.src, `${tag}/${l.stand.id}: an empty stand`).toBeTruthy()
      // the card in the case prints the panel's verified lines: there is at least one
      if (l.caseCard) expect((c.place.panel?.factIds || []).filter((f) => INDEX.facts[f]?.claim).length, `${tag}: a case card with no verified line`).toBeGreaterThan(0)
    }
  expect(n).toBeGreaterThan(0)
})

test('a raised rail record stays clear of the guide on a desktop (round 9, the Madrid photograph)', async () => {
  const { visitorFrame, raisedRecordAt } = await import('./photoProjection.js')
  for (const aspect of [1440 / 900, 1280 / 800, 1920 / 1080]) {
    for (const guideX of [-0.7, 0.7]) {
      const frame = visitorFrame({ guide: { x: guideX } }, 40, aspect, false, true)
      // a wide photograph (the Madrid press conference is about 1.6 : 1) and a tall letter
      for (const w of [0.64, 0.33]) {
        const r = raisedRecordAt(frame, aspect, w)
        const W = -r.pos[2] * frame.T * aspect
        const c = r.pos[0] / W
        const half = (w * r.scale) / 2 / W
        // the guide's side of the record, in NDC, stays beyond her figure and pointing hand
        const near = frame.side < 0 ? c - half : -(c + half)
        expect(near).toBeGreaterThan(-(Math.abs(frame.guideNdcX) - 0.15))
        // and the record stays on screen
        expect(Math.abs(c) + half).toBeLessThan(0.95)
        expect(r.scale).toBeGreaterThan(0.5)
        expect(r.scale).toBeLessThanOrEqual(1)
      }
    }
  }
})

// round 9 fix round 1: on a phone the rail records lay across her figure (Lamarr, the Bismarck tribune)
test('the rail records at rest stay clear of the guide, on a phone and a desktop', async () => {
  const { visitorFrame, railLayout, RAIL_SLOT } = await import('./photoProjection.js')
  for (const [aspect, phone] of [[390 / 844, true], [360 / 740, true], [1440 / 900, false], [1280 / 800, false]]) {
    for (const guideX of [-0.62, -0.55, 0.62]) {
      for (const fov of [38, 50, 62]) {
        const frame = visitorFrame({ guide: { x: guideX, xPhone: guideX } }, fov, aspect, phone, true)
        for (const n of [1, 2, 3]) {
          const r = railLayout(frame, aspect, n)
          const W = (frame.rail.d - 0.3) * frame.T * aspect // half the screen at the records' depth
          const half = (RAIL_SLOT * r.scale) / 2 / W
          // her figure and her pointing hand: within 0.3 (phone) or 0.16 (desktop) NDC of her centre line
          const clear = phone ? 0.3 : 0.16
          for (const x of r.xs) {
            const c = x / W
            const near = frame.side < 0 ? c - half : -(c + half)
            expect(near, `${phone ? 'phone' : 'desktop'} ${guideX} fov ${fov} n ${n}`).toBeGreaterThan(-(Math.abs(frame.guideNdcX) - clear) - 1e-9)
            expect(Math.abs(c) + half).toBeLessThan(0.96)
          }
          // the records do not overlap one another
          for (let i = 1; i < n; i++) expect(Math.abs(r.xs[i] - r.xs[i - 1]) + 1e-9).toBeGreaterThanOrEqual(RAIL_SLOT * r.scale * 0.999)
          expect(r.scale).toBeGreaterThan(0)
        }
      }
    }
  }
})

// round 9 fix round 7: the records gate (e2e/chapters.mjs, seenState) found the stand's sheet sunk into the sloped bed,
// its lower quarter hidden in five gallery chapters. The stand (its dark backing and the sheet on it) rests its lower
// edge on the bed's top: not below it, and not floating above it.
test("gallery: the stand's sheet rests on the bed, none of it below the bed's top", async () => {
  const THREE = await import('three')
  const { BED, STAND } = await import('./galleryLayout.js')
  const l = galleryLayout([sheet('s')])
  const g = new THREE.Group()
  g.position.set(...l.stand.position)
  g.rotation.set(...STAND.rotation)
  g.updateMatrixWorld()
  // the bed's top face, in the bed's own frame (y BED.y, tilted BED.tilt about x; its top 0.01 above its middle)
  const bed = new THREE.Group()
  bed.position.set(0, BED.y, 0)
  bed.rotation.set(BED.tilt, 0, 0)
  bed.updateMatrixWorld()
  const inv = bed.matrixWorld.clone().invert()
  const lows = []
  for (const [hw, h, z] of [[STAND.backW / 2, STAND.backH, -0.004 - 0.003], [STAND.pageW / 2, STAND.pageH, 0.004]])
    for (const x of [-hw, hw]) lows.push(new THREE.Vector3(x, -h / 2, z).applyMatrix4(g.matrixWorld))
  const heights = lows.map((p) => p.clone().applyMatrix4(inv).y - 0.01)
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(-0.001)
  expect(Math.min(...heights)).toBeLessThan(0.01)
})

// fix round 10 (owner decision 2026-11-04, place.hudBand): below a band the canvas is shorter, and the guide and the rail
// keep their places on the page (clear of the caption and the bottom bar, as in every other room); without a band the
// frame is exactly as before
test('the visitor frame keeps its page places on a canvas below a band, and is unchanged without one', async () => {
  const { visitorFrame } = await import('./photoProjection.js')
  for (const [W, H, top, phone] of [[1440, 900, 168, false], [390, 844, 190, true]]) {
    const h = H - top
    for (const guideX of [-0.7, 0.62]) {
      const photo = { guide: { x: guideX, xPhone: guideX } }
      const full = visitorFrame(photo, 40, W / H, phone, true)
      expect(visitorFrame(photo, 40, W / H, phone, true, null)).toEqual(full)
      expect(visitorFrame(photo, 40, W / H, phone, true, { top: 0, pageHeight: H })).toEqual(full)
      const band = visitorFrame(photo, 40, W / h, phone, true, { top, pageHeight: H })
      // a canvas NDC height to page px, and the full page's NDC height to page px
      const pageY = (ndc) => top + ((1 - ndc) / 2) * h
      const fullY = (ndc) => ((1 - ndc) / 2) * H
      expect(pageY(band.guideNdcY[0])).toBeCloseTo(fullY(full.guideNdcY[0]), 6)
      expect(pageY(band.guideNdcY[1])).toBeCloseTo(fullY(full.guideNdcY[1]), 6)
      expect(pageY(band.rail.y / (band.rail.d * band.T))).toBeCloseTo(fullY(full.rail.y / (full.rail.d * full.T)), 6)
      expect(band.guideNdcX).toBe(full.guideNdcX)
    }
  }
})

test("a photograph's lens share (photo.lens) narrows the lens on its device only", async () => {
  const { photoFov } = await import('./photoProjection.js')
  const layout = { hfov: (46 * Math.PI) / 180 }
  const photo = { camera: { fovDeg: 48.6 } }
  const size = { width: 1440, height: 732 }
  expect(photoFov({ ...photo, lens: { desktop: 0.92 } }, layout, size, false) / photoFov(photo, layout, size, false)).toBeCloseTo(0.92 / 0.96, 9)
  expect(photoFov({ ...photo, lens: { desktop: 0.92 } }, layout, size, true)).toBe(photoFov(photo, layout, size, true))
})

// fix round 10b (owner decision 2026-11-04): Step back returns a stop's view past the look's range to the view at rest
// only in a room that asks for it (place.stepBackToRest: Prague); Einstein's and Lamarr's arrivals on a phone, whose
// stop views lie past the range, stay tilted where the stop left them, as before fix round 10. The stop views are the
// ones focusView chose in the browser (e2e/chapters.mjs, the guide part, fix round 10b), in degrees.
test('Step back returns to rest past the range only where the room asks for it (Prague), as before elsewhere', async () => {
  const { TOURS } = await import('../data/index.js')
  const { stepBackView, pastRange } = await import('./photoProjection.js')
  const R = (d) => (d * Math.PI) / 180
  const views = [
    // [inductee, chapter, phone, stop view { yaw, pitch (degrees), dolly }, where Step back leaves it]
    ['einstein', 'arriving', true, { yaw: 0, pitch: -6.75, dolly: -0.3 }, 'stays'],
    ['lamarr', 'arriving', true, { yaw: -3.91, pitch: -9.91, dolly: 3.5 }, 'stays'],
    ['albright', 'birth', false, { yaw: 0, pitch: 11.5, dolly: 0 }, 'rest'],
  ]
  for (const [slug, id, phone, deg, want] of views) {
    const c = TOURS[slug].chapters.find((x) => x.id === id)
    const tag = `${slug}/${id} ${phone ? 'phone' : 'desktop'}`
    const look = c.place.photo.look
    const range = { yawMax: R(phone ? look.yawDegPhone ?? look.yawDeg : look.yawDeg), pitchMax: R(look.pitchDeg), dollyMax: look.dolly }
    const rest = { yaw: R((phone ? look.restYawDegPhone : look.restYawDeg) ?? 0), pitch: R((phone ? look.restPitchDegPhone : look.restPitchDeg) ?? 0) }
    const view = { yaw: R(deg.yaw), pitch: R(deg.pitch), dolly: deg.dolly }
    // each of these stop views lies past the range: the room's setting alone decides where Step back leaves it
    expect(pastRange(view, range), `${tag}: the stop view lies past the range`).toBe(true)
    const to = stepBackView(view, range, rest, Boolean(c.place.stepBackToRest))
    if (want === 'stays') expect(to, `${tag}: Step back keeps the stop's view (no place.stepBackToRest)`).toBe(null)
    else expect(to, `${tag}: Step back returns to the view at rest`).toEqual({ yaw: rest.yaw, pitch: rest.pitch, dolly: 0 })
  }
  // a view inside the range stays where it is, with the setting or without it
  const inside = { yaw: 0, pitch: 0, dolly: 1 }
  for (const toRest of [true, false]) expect(stepBackView(inside, { yawMax: R(4), pitchMax: R(4), dollyMax: 2 }, { yaw: 0, pitch: 0 }, toRest)).toBe(null)
  // only Prague's Old Town Square asks for it (owner decision 2026-11-04)
  const asking = Object.entries(TOURS).flatMap(([slug, t]) => (t.chapters || []).filter((c) => c.place.stepBackToRest).map((c) => `${slug}/${c.id}`))
  expect(asking).toEqual(['albright/birth'])
})
