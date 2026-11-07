// Where a gallery case (place.tier 'gallery') puts the chapter's stops: up to six objects laid left
// to right in the case, in even slots across it in stop order (owner feedback round 9: a single
// record sits in the middle of the case, several share it evenly), the first `sheet` upright on its
// own stand in its slot and the others on the sloped bed, and the wall panel stop on the back wall.
// Also the camera pose and the box (what the visitor looks at, world metres) for each stop, per device.
// No React here (tested in node). Units: metres; the case is centred on x = 0.
//
// A stop: { id, name, art?: artifact record (data/artifacts.js shape), panel?: true, pages?: [i, ...] }
//   pages: which of the record's pages lie on the bed (default the first ones that fit)
//   a `model` record (a labelled recreation) stands in its slot as the object itself: `model` is
//   its glb and the width it is scaled to fit
//   a record with no image (a link-only record: rights unknown, never shown) lies in its slot as a
//   labelled card, `card`, naming it and "View at the holder"
// A case is never empty (feedback round 7): with no object at all (a chapter with no cleared record),
// `caseCard` lays the chapter's verified lines (the wall panel's) in the case as a printed card.

export const CASE = { w: 1.9, d: 1.05, h: 0.92, z: 0 }
export const PANEL = { w: 1.9, h: 1.3, y: 1.9, z: -3.6 }
export const MAX_CASE_OBJECTS = 6
// the printed card in a case with no object: across the bed, in the bed's own (sloped) frame
export const CASE_CARD = { w: 1.5, h: 0.4 }
export const TOP = CASE.h + 0.04
export const BED = { tilt: 0.38, y: TOP + 0.07, depth: 0.46 }
// the first sheet's stand: a dark backing with the sheet on it, tilted back and turned a little (GalleryCaseStage.jsx)
export const STAND = { rotation: [-0.32, -0.2, 0], backW: 0.22, backH: 0.31, pageW: 0.22, pageH: 0.29, z: -0.12 }

// the stand's height: its lowest corner (of the backing or the sheet) rests on the bed's top, 2 mm clear. The bed is
// tilted toward the visitor, so its top under the stand is higher than the case's floor (round 9 fix round 7: the stand
// stood on the floor and its lower quarter was sunk in the bed, hidden).
function standY(x) {
  const [ax, ay] = STAND.rotation
  const corners = [
    [STAND.backW / 2, -STAND.backH / 2, -0.007],
    [-STAND.backW / 2, -STAND.backH / 2, -0.007],
    [STAND.pageW / 2, -STAND.pageH / 2, 0.004],
    [-STAND.pageW / 2, -STAND.pageH / 2, 0.004],
  ]
  // Euler XYZ (three.js): rotate about y, then about x
  const rot = ([px, py, pz]) => {
    const x1 = px * Math.cos(ay) + pz * Math.sin(ay)
    const z1 = -px * Math.sin(ay) + pz * Math.cos(ay)
    return [x1, py * Math.cos(ax) - z1 * Math.sin(ax), py * Math.sin(ax) + z1 * Math.cos(ax)]
  }
  // height above the bed's top of a world point (the bed's frame: y BED.y, tilted BED.tilt about x; top 0.01 up)
  const above = ([, wy, wz]) => (wy - BED.y) * Math.cos(BED.tilt) + wz * Math.sin(BED.tilt) - 0.01
  const low = Math.min(...corners.map((c) => rot(c)).map(([cx, cy, cz]) => above([x + cx, cy, STAND.z + cz])))
  return (0.002 - low) / Math.cos(BED.tilt)
}
// the case's span for objects (the bed's felt runs across all of it)
const SPAN = [-0.83, 0.83]
const PAGE_GAP = 0.26
const PAGE_H = 0.33
// a small hand-laid irregularity, repeated along the bed
const JITTER = [
  { y: 0.012, z: 0.0, r: 0.05 },
  { y: 0.014, z: 0.02, r: -0.04 },
  { y: 0.016, z: -0.01, r: 0.03 },
  { y: 0.014, z: 0.02, r: -0.05 },
]

const imagesOf = (art) => (art?.pages?.length ? art.pages.map((p) => p.src) : art?.photos?.length ? art.photos.map((p) => p.src) : [])

export function galleryLayout(stops) {
  const panel = stops.find((s) => s.panel) || null
  const objects = stops.filter((s) => !s.panel)
  if (objects.length > MAX_CASE_OBJECTS) throw new Error(`a gallery case holds at most ${MAX_CASE_OBJECTS} objects (got ${objects.length})`)
  const standStop = objects.find((s) => s.art?.kind === 'sheet' && imagesOf(s.art).length) || null
  const onBed = objects.filter((s) => s !== standStop)
  const [x0, x1] = SPAN
  // every object in the case has an even slot, in stop order
  const slotW = objects.length ? (x1 - x0) / objects.length : 0
  const slotX = (s) => x0 + slotW * (objects.indexOf(s) + 0.5)
  // one object fans up to four pages; two share them; more show one page each
  const perObject = onBed.length === 1 ? 4 : onBed.length === 2 ? 2 : 1
  let j = 0
  const bed = onBed.map((s) => {
    const x = slotX(s)
    const all = imagesOf(s.art)
    const srcs = (s.pages ? s.pages.map((k) => all[k]) : all).filter(Boolean).slice(0, perObject)
    const gap = Math.min(PAGE_GAP, slotW / Math.max(1, srcs.length))
    const pages = srcs.map((src, k) => {
      const jt = JITTER[j++ % JITTER.length]
      return { src, x: x + (k - (srcs.length - 1) / 2) * gap, y: jt.y, z: jt.z, rot: jt.r, maxW: gap * 0.92, h: PAGE_H }
    })
    const model = s.art?.kind === 'model' && s.art.model?.src ? { src: s.art.model.src, fitW: slotW * 0.88, fitD: BED.depth * 0.9 } : null
    const card = !pages.length && !model ? { title: s.art?.title || s.name, w: Math.min(0.5, slotW * 0.9), h: 0.3, x } : null
    // what the visitor sees of it: its pages' span (or the model's, or the card's) on the bed
    const half = pages.length ? Math.max(...pages.map((p) => Math.abs(p.x - x) + p.maxW / 2)) : model ? model.fitW / 2 : (card?.w ?? slotW) / 2
    const box = { min: [x - half, TOP, -BED.depth / 2 - 0.02], max: [x + half, BED.y + (model ? 0.26 : 0.16), BED.depth / 2 + 0.02] }
    return { id: s.id, x, slotW, pages, model, card, box, ring: [x, TOP + 0.36, 0.05], glowAt: [x, BED.y + 0.02, 0.05], glowSize: Math.min(1.1, slotW), spot: [x + 0.02, TOP, 0.05] }
  })
  const sx = standStop ? slotX(standStop) : 0
  const sy = standY(sx)
  const lift = sy - (TOP + 0.17)
  const stand = standStop
    ? { id: standStop.id, x: sx, src: imagesOf(standStop.art)[0], position: [sx, sy, STAND.z], ring: [sx, TOP + 0.5 + lift, STAND.z], spot: [sx, sy, STAND.z], box: { min: [sx - 0.13, TOP + lift, -0.26], max: [sx + 0.13, TOP + 0.34 + lift, 0.0] } }
    : null
  const panelAt = panel
    ? { id: panel.id, ring: [PANEL.w / 2 + 0.2, PANEL.y + 0.25, PANEL.z + 0.1], glowAt: [0, PANEL.y, PANEL.z + 0.05], spot: [0, PANEL.y, PANEL.z], box: { min: [-PANEL.w / 2, PANEL.y - PANEL.h / 2, PANEL.z], max: [PANEL.w / 2, PANEL.y + PANEL.h / 2, PANEL.z + 0.05] } }
    : null

  // camera poses [eye, target]: far enough back that the guide stands beside the case in the same
  // view, her whole figure in frame (owner feedback round 9; room/RoomGuide.jsx places her); the
  // record itself opens in the viewer
  const views = { desktop: {}, phone: {} }
  for (const b of [...bed, ...(stand ? [stand] : [])]) {
    const y = b === stand ? 1.08 : 1.0
    views.desktop[b.id] = [[b.x * 0.6 + 0.25, 1.62, 2.6], [b.x * 0.85, y, -0.1]]
    views.phone[b.id] = [[b.x * 0.3, 1.7, 5.4], [b.x * 0.6, y - 0.05, -0.1]]
  }
  if (panelAt) {
    views.desktop[panelAt.id] = [[0.3, 1.6, 1.0], [0.1, 1.55, PANEL.z]]
    // a phone: the panel on the right of the view, the guide beside it on the left
    views.phone[panelAt.id] = [[-0.35, 1.6, 2.7], [-0.75, 1.55, PANEL.z]]
  }
  const caseCard = !bed.length && !stand ? { x: 0, y: 0.012, z: 0, ...CASE_CARD } : null
  return { bed, stand, panel: panelAt, caseCard, views, bedSpan: [x0, x1] }
}
