// Where the guide stands for a view (owner feedback round 9): fully in frame, beside what the visitor
// is looking at (never in front of it), clear of the HUD, seen from the camera with nothing between,
// on the room's floor, and inside its walkable bounds. No React here (tested in node: guideFrame.test.js);
// room/RoomGuide.jsx runs it whenever the visitor's view settles somewhere new, and she walks to the
// spot it returns.
//
// view   { eye: [x, y, z], look: [x, y, z], fov (vertical, degrees), aspect }
// focus  null, or the focused stop's world box { min: [x, y, z], max: [x, y, z] }
// room   { bounds: { min, max }, obstacles: [[minX, minZ, maxX, maxZ], ...] }
// keepOut  screen rectangles in NDC ({ x0, x1, y0, y1 }) her upper body may not cover (the HUD panels)
// raycast(from, to) -> true when the room's geometry blocks the straight line between two points
// prefer / from: [x, y, z] (her room spot, where she stands now)
// floorAt(x, z) -> the height of walkable ground there (a floor, a path, a slope), or null (none, or a
// table or a step she cannot stand on)
import * as THREE from 'three'

// her figure, from her feet (metres): the top of her head, shoulders, hands (arms by her sides, with room
// for a gesture and for her turning to face what she talks about)
export const FIGURE = { top: 1.86, shoulderY: 1.45, shoulder: 0.24, pelvisY: 0.92, hip: 0.18, handY: 0.82, hand: 0.45, foot: 0.16, toe: 0.22 }
// how tall she should look (NDC height of her whole figure, 2 = the screen's height) and how far from
// the screen's top and bottom (margin) and sides (marginX) she must stay (NDC; her gestures and her turn
// reach past the figure's estimate, most on a narrow phone)
export const PREFS = {
  desktop: { height: 0.95, minHeight: 0.55, maxHeight: 1.3, margin: 0.03, marginX: 0.08, focusX: 0.05, distances: [1.8, 6.6], laterals: [0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] },
  phone: { height: 0.62, minHeight: 0.38, maxHeight: 0.95, margin: 0.025, marginX: 0.14, focusX: 0.08, distances: [2.2, 8.5], laterals: [0.14, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.76] },
}
// the HUD panels, in NDC, that her figure keeps clear of (approximately: e2e/chapters.mjs checks the real ones)
export const KEEP_OUT = {
  // title plate (top left), caption (bottom middle), Hear / Next (bottom right), Moments (bottom left)
  desktop: [
    { x0: -1, x1: -0.41, y0: 0.68, y1: 1 },
    { x0: -0.4, x1: 0.4, y0: -1, y1: -0.53 },
    { x0: 0.26, x1: 1, y0: -1, y1: -0.79 },
    { x0: -1, x1: -0.64, y0: -1, y1: -0.82 },
  ],
  // title plate and the top buttons; everything below the caption's top (caption, stops, controls)
  phone: [
    { x0: -1, x1: 0.16, y0: 0.69, y1: 1 },
    { x0: 0.18, x1: 1, y0: 0.86, y1: 1 },
    { x0: -1, x1: 1, y0: -1, y1: -0.36 },
  ],
}

// The HUD panels on screen now, in NDC (the canvas's frame), read from the page: title plate, top
// buttons, Step back, stop dots, the caption's slot (as tall as a two-line caption when it is empty),
// Hear / Next and Moments. Null when the page has none of them (node tests): KEEP_OUT stands in.
const HUD = ['[data-hud=title]', '.hud-actions', '.hud-back', '.stop-dots', '.bubble-slot', '.hud-bottom-right', '[data-hud=moments]']
export function hudKeepOut(canvas, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !canvas) return null
  const c = canvas.getBoundingClientRect()
  if (!c.width || !c.height) return null
  const out = []
  for (const sel of HUD) {
    const el = doc.querySelector(sel)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    // the caption's slot: as tall as a two-line caption when it is empty, and a little room above it
    const top = sel === '.bubble-slot' ? Math.min(r.top, r.bottom - (c.width < 720 ? 130 : 120)) - 10 : r.top
    if (r.bottom - top < 1) continue
    const nx = (x) => ((x - c.left) / c.width) * 2 - 1
    const ny = (y) => 1 - ((y - c.top) / c.height) * 2
    out.push({ x0: nx(r.left), x1: nx(r.right), y0: ny(r.bottom), y1: ny(top), caption: sel === '.bubble-slot' })
  }
  return out.length ? out : null
}

// she stands behind the focused object: farther from the eye than any point of its box, by a step
export function behindFocus(at, ctx) {
  const b = ctx.focusBox
  if (!b) return false
  const eye = ctx.camera.position
  const near = new THREE.Vector3(Math.min(Math.max(eye.x, b.min[0]), b.max[0]), Math.min(Math.max(eye.y, b.min[1]), b.max[1]), Math.min(Math.max(eye.z, b.min[2]), b.max[2]))
  const far = Math.max(...[b.min[0], b.max[0]].flatMap((x) => [b.min[2], b.max[2]].map((z) => Math.hypot(x - eye.x, z - eye.z))))
  return Math.hypot(at.x - eye.x, at.z - eye.z) > Math.max(far, near.distanceTo(eye)) + 0.25
}

// how far her pointing hand reaches to the side (metres)
const REACH = 0.45

const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

export function makeCamera({ eye, look, fov, aspect }) {
  const c = new THREE.PerspectiveCamera(fov, aspect, 0.05, 1000)
  c.position.set(...eye)
  c.lookAt(...look)
  c.updateMatrixWorld(true)
  c.updateProjectionMatrix()
  return c
}

// the screen rectangle (NDC) of a set of world points; null when any is behind the camera
function rectOf(points, camera) {
  let x0 = Infinity
  let x1 = -Infinity
  let y0 = Infinity
  let y1 = -Infinity
  const v = new THREE.Vector3()
  for (const p of points) {
    v.copy(p).project(camera)
    if (v.z >= 1 || v.z <= -1) return null
    x0 = Math.min(x0, v.x)
    x1 = Math.max(x1, v.x)
    y0 = Math.min(y0, v.y)
    y1 = Math.max(y1, v.y)
  }
  return { x0, x1, y0, y1 }
}

// her figure's points standing at `at` (feet), seen square-on from the camera (`w` scales its width:
// turned three-quarters, as she stands when she talks, she is narrower)
function figurePoints(at, right, upper = false, w = 1, toEye = new THREE.Vector3(-right.z, 0, right.x)) {
  const F = FIGURE
  const p = (y, side) => new THREE.Vector3(at.x + right.x * side * w, at.y + y, at.z + right.z * side * w)
  const top = [p(F.top, 0), p(F.shoulderY, F.shoulder), p(F.shoulderY, -F.shoulder)]
  // her upper body: the top of her head to her pelvis, shoulder to shoulder (as e2e/chapters.mjs measures it from her
  // joints: head, pelvis, upper arms); her hands may pass in front of a panel
  if (upper) return [...top, p(F.pelvisY, F.hip), p(F.pelvisY, -F.hip)]
  // her toes reach a little toward the eye, lower on the screen than her heels
  const toe = p(0, 0).addScaledVector(toEye, F.toe)
  return [...top, p(F.handY, F.hand), p(F.handY, -F.hand), p(0, F.foot), p(0, -F.foot), toe]
}

// the focused stop's rectangle on screen (clipped to the screen). A stop whose focus is a whole building
// or a landscape (its data says so: `wide: true`; the place she stands in front of) is narrowed to its
// middle (a quarter of the screen's width), where the visitor's eye goes. The shortcut goes by KIND, never
// by size (round 9 fix round 1): a record seen close on a phone may fill the screen, and she must still keep
// clear of all of it.
export function focusRect(focus, camera) {
  if (!focus) return null
  const pts = []
  for (const x of [focus.min[0], focus.max[0]]) for (const y of [focus.min[1], focus.max[1]]) for (const z of [focus.min[2], focus.max[2]]) pts.push(new THREE.Vector3(x, y, z))
  const v = new THREE.Vector3()
  const ndc = pts.map((p) => v.copy(p).project(camera).clone()).filter((p) => p.z < 1)
  if (!ndc.length) return null
  const r = {
    x0: Math.max(-1, Math.min(...ndc.map((p) => p.x))),
    x1: Math.min(1, Math.max(...ndc.map((p) => p.x))),
    y0: Math.max(-1, Math.min(...ndc.map((p) => p.y))),
    y1: Math.min(1, Math.max(...ndc.map((p) => p.y))),
  }
  if (focus.wide && r.x1 - r.x0 > 0.5) {
    const c = (r.x0 + r.x1) / 2
    r.x0 = c - 0.25
    r.x1 = c + 0.25
    r.wide = true
  }
  return r
}

export function devicePrefs(phone) {
  return phone ? PREFS.phone : PREFS.desktop
}

function inRoom(x, z, room, clearance = 0.32) {
  const b = room.bounds
  if (!b) return true
  if (x < b.min[0] + clearance || x > b.max[0] - clearance || z < b.min[2] + clearance || z > b.max[2] - clearance) return false
  return !(room.obstacles || []).some(([ax, az, bx, bz]) => x > ax - clearance && x < bx + clearance && z > az - clearance && z < bz + clearance)
}

// The cheap part of the test of a spot (no ray casts): in the room, fully on screen at a sensible size,
// clear of the focus and the HUD. Returns { ok, why, rect, height, at }.
export function frameCheck(at, ctx) {
  const { camera, right, prefs, focus, keepOut, room } = ctx
  if (!inRoom(at.x, at.z, room)) return { ok: false, why: 'outside the walkable floor' }
  // a step away from a low thing she talks about (right over the case's bed, she would talk to her feet)
  const fb = ctx.focusBox
  if (fb && fb.max[1] < 1.2 && Math.hypot(at.x - (fb.min[0] + fb.max[0]) / 2, at.z - (fb.min[2] + fb.max[2]) / 2) < 0.9) return { ok: false, why: 'too close to the focus' }
  const w = ctx.relaxed ? 0.85 : 1
  const pts = figurePoints(at, right, false, w)
  // with a stop focused she points at it (the presentation gesture): her arm reaches toward it (the
  // relaxed pass leaves that room out)
  if (focus && !ctx.relaxed && !focus.wide) {
    const c = new THREE.Vector3(at.x, at.y + 1.3, at.z).project(camera)
    const toward = (focus.x0 + focus.x1) / 2 > c.x ? 1 : -1
    pts.push(new THREE.Vector3(at.x + right.x * toward * REACH, at.y + 1.3, at.z + right.z * toward * REACH))
  }
  const rect = rectOf(pts, camera)
  if (!rect) return { ok: false, why: 'behind the camera' }
  const m = ctx.relaxed ? prefs.margin * 0.4 : prefs.margin
  const mx = ctx.relaxed ? prefs.marginX * 0.5 : prefs.marginX
  const height = rect.y1 - rect.y0
  // her toes reach forward of her feet, toward the eye: a little more room at the bottom
  if (rect.x0 < -1 + mx || rect.x1 > 1 - mx || rect.y0 < -1 + m + (ctx.relaxed ? 0.02 : 0.07) || rect.y1 > 1 - m) return { ok: false, why: 'not fully on screen', rect, height }
  // relaxed (a small room): she may stand nearer and look larger, as long as all of her is in frame
  // (or farther and smaller, when the HUD leaves her only a narrow band: a phone at a tour's end)
  const maxH = ctx.relaxed ? prefs.maxHeight * 1.4 : prefs.maxHeight
  const minH = ctx.relaxed ? prefs.minHeight * 0.8 : prefs.minHeight
  if (height < minH || height > maxH) return { ok: false, why: `too ${height < prefs.minHeight ? 'small' : 'large'} (${height.toFixed(2)})`, rect, height }
  if (focus) {
    // room for her arm when she points at it (the presentation gesture as a stop is picked); she may
    // stand behind an object the stop shows (beyond a desk), never in front of it
    const f = { x0: focus.x0 - prefs.focusX, x1: focus.x1 + prefs.focusX, y0: focus.y0 - 0.05, y1: focus.y1 + 0.05 }
    if (hit(rect, f) && !behindFocus(at, ctx)) return { ok: false, why: 'covers the focus', rect, height }
  }
  // her upper body keeps clear of the HUD panels; her legs may pass behind them (a softer cost: candidates)
  const upper = rectOf(figurePoints(at, right, true, w), camera)
  // (round 9 fix round 1: the caption may no longer cross her waist in the relaxed pass; the e2e checks her
  // head to her pelvis against every panel)
  for (const k of keepOut || []) if (hit(upper, k)) return { ok: false, why: 'under the HUD', rect, height }
  // nor under a stop's numbered badge (a 38 px disc, drawn over the scene where the stop is)
  for (const b of ctx.badges || []) if (hit(upper, b)) return { ok: false, why: 'under a stop badge', rect, height }
  const legsUnder = (keepOut || []).some((k) => hit(rect, k))
  return { ok: true, rect, height, legsUnder }
}

// The full test: the cheap one, then she stands on walkable ground (the room's floor, a path, a slope:
// floorAt says how high it is there) and, at that height, is still framed, and nothing in the room hides her.
export function spotCheck(at, ctx) {
  let f = frameCheck(at, ctx)
  if (!f.ok) return f
  if (ctx.floorAt) {
    const y = ctx.floorAt(at.x, at.z)
    if (y == null) return { ...f, ok: false, why: 'no floor there' }
    if (Math.abs(y - at.y) > 1e-3) {
      at.y = y
      f = frameCheck(at, ctx)
      if (!f.ok) return f
    }
  }
  if (ctx.raycast) {
    // head, chest, waist and knees in sight (her feet may be behind a seat row or a desk in front of her)
    const eye = ctx.camera.position
    for (const h of [1.72, 1.35, 0.95, 0.5]) {
      if (ctx.raycast(eye, new THREE.Vector3(at.x, at.y + h, at.z))) return { ...f, ok: false, why: `hidden at ${h} m` }
    }
    // and across her shoulders, every 8 cm out to a little past them: a pole may hide one side of her while her middle
    // shows (round 9, the Graben column), and a thin post or an easel's edge may stand between her middle and her
    // shoulder (round 9 fix round 3, the Hall of Fame photograph on a phone: two rays, at her shoulders' edges, missed it;
    // turned to point, her upper arm sits anywhere in that span)
    const reach = FIGURE.shoulder * 1.35
    for (let k = 1; k * 0.08 <= reach + 1e-6; k++)
      for (const s of [-1, 1]) {
        const p = new THREE.Vector3(at.x, at.y + FIGURE.shoulderY - 0.05, at.z).addScaledVector(ctx.right, s * k * 0.08)
        if (ctx.raycast(eye, p)) return { ...f, ok: false, why: `hidden at the ${s < 0 ? 'left' : 'right'} shoulder` }
      }
  }
  return f
}

// badges: the stops' numbered badges (world points: the badge's centre, or { at, above } for one standing on the
// point); size: the canvas in CSS px (a
// badge is BADGE_PX across, with a few pixels' margin)
export const BADGE_PX = 38
function badgeRects(points, camera, size) {
  if (!points?.length) return []
  const w = size?.width || 1440
  const h = size?.height || w / camera.aspect
  const rx = ((BADGE_PX / 2 + 6) / w) * 2
  const ry = ((BADGE_PX / 2 + 6) / h) * 2
  const out = []
  for (const p of points) {
    // a point, or { at, above }: a badge standing on the point (its centre half a badge and 4 px higher)
    const at = Array.isArray(p) ? p : p.at
    const v = new THREE.Vector3(...at).project(camera)
    if (v.z >= 1 || v.z <= -1) continue
    if (!Array.isArray(p) && p.above) v.y += ((BADGE_PX / 2 + 4) / h) * 2
    out.push({ x0: v.x - rx, x1: v.x + rx, y0: v.y - ry, y1: v.y + ry })
  }
  return out
}
export function makeContext({ view, focus = null, room, phone = false, keepOut = null, raycast = null, floorAt = null, badges = null, size = null }) {
  const camera = makeCamera(view)
  const fwd = new THREE.Vector3(view.look[0] - view.eye[0], 0, view.look[2] - view.eye[2])
  if (fwd.lengthSq() < 1e-8) fwd.set(0, 0, -1)
  fwd.normalize()
  const right = new THREE.Vector3(-fwd.z, 0, fwd.x)
  // the ground under the visitor's eye (eye height 1.6 m): where candidate spots start before floorAt
  const floorY = view.eye[1] - 1.6
  return { camera, fwd, right, prefs: devicePrefs(phone), phone, focus: focusRect(focus, camera), focusBox: focus, keepOut: keepOut ?? KEEP_OUT[phone ? 'phone' : 'desktop'], badges: badgeRects(badges, camera, size), room, raycast, floorAt, floorY }
}

// Candidate spots for a view, best first (cheap checks passed): distances along the view, across both
// sides of the screen; scored on her size, a place beside the focus (on its other side from the
// screen's middle), a short walk from where she stands, and the room's own spot for her (prefer).
export function candidates(ctx, { from = null, prefer = null, why = null } = {}) {
  const { camera, fwd, right, prefs, focus } = ctx
  const eye = camera.position
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect
  const fc = focus ? (focus.x0 + focus.x1) / 2 : 0
  const out = []
  const [d0, d1] = prefs.distances
  const tryAt = (at) => {
    const f = frameCheck(at, ctx)
    if (why && !f.ok) why[f.why.replace(/ \(.*/, '')] = (why[f.why.replace(/ \(.*/, '')] || 0) + 1
    if (!f.ok) return
    let score = Math.abs(f.height - prefs.height) * 2.2 + (f.legsUnder ? 0.35 : 0)
    const cx = (f.rect.x0 + f.rect.x1) / 2
    score += Math.abs(Math.abs(cx) - 0.55) * 0.6
    if (focus && Math.sign(cx) === Math.sign(fc) && Math.abs(fc) > 0.15) score += 0.5
    if (from) score += 0.12 * Math.hypot(at.x - from[0], at.z - from[2])
    if (prefer) score += 0.3 * Math.min(2, Math.hypot(at.x - prefer[0], at.z - prefer[2]))
    out.push({ at, score, rect: f.rect })
  }
  if (prefer) tryAt(new THREE.Vector3(prefer[0], ctx.floorY, prefer[2]))
  if (from) tryAt(new THREE.Vector3(from[0], ctx.floorY, from[2]))
  for (let d = d0; d <= d1 + 1e-6; d += 0.25) {
    for (const lx of prefs.laterals) {
      for (const side of [-1, 1]) {
        const lat = side * lx * tanH * d
        tryAt(new THREE.Vector3(eye.x + fwd.x * d + right.x * lat, ctx.floorY, eye.z + fwd.z * d + right.z * lat))
      }
    }
  }
  return out.sort((a, b) => a.score - b.score)
}

// A generator (so a caller can spread the ray casts over frames): yields after each candidate it
// rejects, returns the first that passes every check ({ at, rect, relaxed }) or null. When none does (a
// small room on a phone), it tries again with her figure as narrow as she stands turned three-quarters,
// a thinner margin, nearer (larger) or farther (smaller) than preferred (the e2e check of her real figure is the judge;
// her head to her waist stays clear of the HUD either way).
export function* solveSpot(ctx, opts = {}) {
  for (const relaxed of [false, true]) {
    const c2 = relaxed ? { ...ctx, relaxed: true } : ctx
    for (const c of candidates(c2, opts)) {
      const r = spotCheck(c.at, c2)
      if (r.ok) return { at: c.at, rect: r.rect, relaxed }
      yield r.why
    }
  }
  return null
}

// run the generator to its end (tests, reduced motion)
export function solveNow(ctx, opts = {}) {
  const g = solveSpot(ctx, opts)
  let r = g.next()
  while (!r.done) r = g.next()
  return r.value
}

// a world box on screen, in CSS pixels (clipped to the screen)
export function screenBox(box, camera, size) {
  const pts = []
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z).project(camera))
  const front = pts.filter((p) => p.z < 1)
  if (!front.length) return null
  const xs = front.map((p) => Math.min(size.width, Math.max(0, ((p.x + 1) / 2) * size.width)))
  const ys = front.map((p) => Math.min(size.height, Math.max(0, ((1 - p.y) / 2) * size.height)))
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
}
