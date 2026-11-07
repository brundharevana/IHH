// Dev only (e2e/chapters.mjs part `records`, round 9 fix round 6, Codex review 5): what each stop draws of its
// record in the scene, so the gate can check the record's OWN element, not just any box at the stop. Every place a
// stage draws a record registers it here: the object that shows it, the record it shows and the file it was drawn
// from (a room record or prop, a photo room's rail record, a gallery case's page or recreation, the photograph a
// photo room stands in under '@backdrop'). window.__recordDraws(id) reports, for each registration, whether the
// object is in the scene and visible and its texture or model has loaded. Production registers nothing.
// Round 9 fix round 7 (Codex review 6): material flags do not say the record can be seen. window.__recordSeen(id)
// adds, per registration, what the camera sees of it now (seenState): points on the record itself, each on screen,
// facing the camera and with nothing in the scene between the camera and it (camcheck's occlusion rays).
import { useEffect } from 'react'
import { Raycaster, Vector3 } from 'three'

const draws = new Map() // stop id -> Set of { media, src, kind, ref }

// stopId: the stop (or '@backdrop'); media: the record shown; src: the file it is drawn from (null for a card);
// kind: 'image' (a texture on a mesh, or a shader's `photo` uniform), 'model' (a glb) or 'card' (a link-only label)
export function useRecordDraw(stopId, media, src, ref, kind = 'image') {
  useEffect(() => {
    if (!import.meta.env.DEV || !stopId) return
    const e = { media, src, kind, ref }
    if (!draws.has(stopId)) draws.set(stopId, new Set())
    draws.get(stopId).add(e)
    return () => draws.get(stopId)?.delete(e)
  }, [stopId, media, src, ref, kind])
}

export const imageOk = (img) => Boolean(img) && (img.naturalWidth ?? img.width ?? 0) > 0 && img.complete !== false
export const imageUrl = (img) => {
  const u = img?.currentSrc || img?.src
  if (!u || typeof u !== 'string' || u.startsWith('data:')) return null
  try {
    return new URL(u, window.location.href).pathname
  } catch {
    return null
  }
}

// one registration's state on the page
export function drawState({ media, src, kind, ref }) {
  const obj = ref?.current
  const out = { media, src, kind, inScene: false, visible: false, loaded: false, drawnFrom: null }
  if (!obj) return out
  let o = obj
  let shown = true
  while (o) {
    if (o.visible === false) shown = false
    if (!o.parent) out.inScene = Boolean(o.isScene)
    o = o.parent
  }
  const meshes = []
  obj.traverse((m) => {
    if (m.isMesh && m.visible !== false) meshes.push(m)
  })
  const mats = meshes.flatMap((m) => (Array.isArray(m.material) ? m.material : [m.material])).filter((x) => x && x.visible !== false && (x.opacity ?? 1) > 0)
  out.visible = shown && mats.length > 0
  if (kind === 'model') out.loaded = meshes.some((m) => (m.geometry?.attributes?.position?.count || 0) > 0)
  else {
    const maps = mats.map((x) => x.map || x.uniforms?.photo?.value).filter(Boolean)
    // the file a texture came from: userData.fetchedFrom (shared/loadScope.js; the image holds a blob: URL), or, for a
    // texture redrawn from a file (a room record drawn down to a canvas), userData.drawnFrom (RoomRecords.jsx
    // useRoomImage), which counts as loaded only once that file had loaded
    const good = maps.find((t) => imageOk(t.image) && t.userData?.sourceLoaded !== false)
    out.loaded = Boolean(good)
    out.drawnFrom = good ? good.userData?.drawnFrom || good.userData?.fetchedFrom || imageUrl(good.image) : null
  }
  return out
}

// the points sampled on a record (SEEN_GRID x SEEN_GRID over a flat record, to within 5 % of its edges, a hair in front
// of its face, with the face's normal; up to SEEN_GRID^2 of a model's vertices, with no normal)
export const SEEN_GRID = 9
export function recordPoints(obj) {
  const pts = []
  obj.updateWorldMatrix(true, true)
  obj.traverse((m) => {
    if (!m.isMesh || m.visible === false) return
    const g = m.geometry
    if (g?.type === 'PlaneGeometry') {
      const { width, height } = g.parameters
      const n = new Vector3(0, 0, 1).transformDirection(m.matrixWorld)
      for (let i = 0; i < SEEN_GRID; i++)
        for (let j = 0; j < SEEN_GRID; j++) {
          const u = -0.45 + (0.9 * i) / (SEEN_GRID - 1)
          const v = -0.45 + (0.9 * j) / (SEEN_GRID - 1)
          pts.push({ p: new Vector3(u * width, v * height, 0.005).applyMatrix4(m.matrixWorld), n })
        }
    } else {
      const pos = g?.attributes?.position
      if (!pos?.count) return
      const step = Math.max(1, Math.floor(pos.count / (SEEN_GRID * SEEN_GRID)))
      for (let k = 0; k < pos.count; k += step) pts.push({ p: new Vector3().fromBufferAttribute(pos, k).applyMatrix4(m.matrixWorld), n: null })
    }
  })
  return pts
}

// a surface that hides what is behind it: a visible mesh that writes colour and is not see-through (the rule of
// e2e/camcheck.mjs: a glass hood at opacity 0.07 or a colourless picking proxy hides nothing)
function hides(o) {
  if (!o.isMesh) return false
  for (let p = o; p; p = p.parent) if (p.visible === false) return false
  return [].concat(o.material).some((x) => x && x.visible !== false && x.colorWrite !== false && !(x.transparent && (x.opacity ?? 1) < 0.5))
}
const nameOf = (o) => {
  for (let q = o; q; q = q.parent) if (q.name) return q.name
  return '(unnamed)'
}

// What the camera sees of `obj` now. points: [{ p: Vector3 | [x, y, z], n?: Vector3 }] (default recordPoints(obj));
// skip: objects never counted as hiding it (the guide). A point is seen when it is inside the view, in front of the
// camera, faces it (a flat record seen from behind is not seen) and no other surface lies on the ray to it.
// overlays: scenes drawn over this one whatever their depth (a stage's foreground in a Hud: the photo room's rail and
// guide): their surfaces hide a point wherever they lie on the ray in front of the camera.
export function seenState(obj, three, points = null, skip = [], overlays = []) {
  const { camera } = three
  let scene = obj
  while (scene.parent) scene = scene.parent
  const pts = (points || recordPoints(obj)).map((x) => (Array.isArray(x) ? { p: new Vector3(...x), n: null } : x.isVector3 ? { p: x, n: null } : x))
  const own = new Set()
  obj.traverse((o) => own.add(o))
  const skipped = new Set()
  for (const s of skip) s?.traverse?.((o) => skipped.add(o))
  const blockers = []
  scene.traverse((o) => !own.has(o) && !skipped.has(o) && hides(o) && blockers.push(o))
  const over = []
  for (const s of overlays) if (s !== scene) s.traverse((o) => !own.has(o) && !skipped.has(o) && hides(o) && over.push(o))
  camera.updateMatrixWorld()
  const eye = camera.getWorldPosition(new Vector3())
  const ray = new Raycaster()
  const out = { points: pts.length, seen: 0, offscreen: 0, above: 0, below: 0, side: 0, framed: 0, back: 0, occluded: 0, occluders: [], fills: false }
  const names = new Set()
  // the record's extent on screen, clipped to the view: a record larger than the view (a tower taller than the
  // screen is high) cannot be all on screen, and is in view when it fills the view across or down
  const ext = { x0: 1, x1: -1, y0: 1, y1: -1, behind: false }
  const span = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
  for (const { p, n } of pts) {
    const q = p.clone().project(camera)
    if (!(q.z < 1 && q.z > -1)) ext.behind = true
    else {
      // its whole extent on screen, unclipped (how much screen it would need)
      span.x0 = Math.min(span.x0, q.x)
      span.x1 = Math.max(span.x1, q.x)
      span.y0 = Math.min(span.y0, q.y)
      span.y1 = Math.max(span.y1, q.y)
      const cx = Math.max(-1, Math.min(1, q.x))
      const cy = Math.max(-1, Math.min(1, q.y))
      ext.x0 = Math.min(ext.x0, cx)
      ext.x1 = Math.max(ext.x1, cx)
      ext.y0 = Math.min(ext.y0, cy)
      ext.y1 = Math.max(ext.y1, cy)
    }
    if (!(q.z < 1 && q.z > -1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)) {
      out.offscreen++
      // where it is cropped: above the screen's top (at the head), below its foot, or at a side
      if (q.z < 1 && q.z > -1) {
        if (q.y > 1) out.above++
        else if (q.y < -1) out.below++
        else out.side++
      }
      continue
    }
    const dir = p.clone().sub(eye)
    const len = dir.length()
    if (n && n.dot(dir) >= 0) {
      out.back++
      continue
    }
    ray.set(eye, dir.normalize())
    ray.near = 0.05
    ray.far = Math.max(0.06, len - 0.02)
    let hit = ray.intersectObjects(blockers, false)[0]
    if (!hit && over.length) {
      ray.far = Infinity
      // the foreground's frame (the rail and its records) crops it like the screen's edge: `framed`, not hidden
      if (ray.intersectObjects(over, false)[0]) {
        out.framed++
        continue
      }
    }
    if (hit) {
      out.occluded++
      names.add(nameOf(hit.object))
    } else out.seen++
  }
  out.occluders = [...names].slice(0, 6)
  out.fills = !ext.behind && (ext.x1 - ext.x0 >= 1.9 || ext.y1 - ext.y0 >= 1.9)
  // the screen it would need, across and down (NDC; 2 is the whole screen)
  out.spanX = span.x1 - span.x0
  out.spanY = span.y1 - span.y0
  // it runs past the screen's foot (cropped at the feet)
  out.reachesFoot = !ext.behind && ext.y0 <= -0.99
  // or past a side of the screen (a subject wider than a phone's view inside the photograph's frame)
  out.reachesSide = !ext.behind && (ext.x0 <= -0.99 || ext.x1 >= 0.99)
  return out
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__recordDraws = (id) => [...(draws.get(id) || [])].map(drawState)
  // opts.points: world points to check instead of the record's own (a photo room stop: its subject on the photograph)
  const rootOf = (o) => {
    while (o?.parent) o = o.parent
    return o
  }
  window.__recordSeen = (id, opts = {}) => {
    const main = window.__tour3?.scene
    // the scenes drawn over the stage's own (a Hud foreground): any registered record's or the guide's scene that is
    // not the main one
    const others = new Set()
    for (const set of draws.values()) for (const e of set) e.ref?.current && others.add(rootOf(e.ref.current))
    for (const g of window.__guideRoots || []) others.add(rootOf(g))
    others.delete(main)
    return [...(draws.get(id) || [])].map((e) => ({
      ...drawState(e),
      seen:
        e.ref?.current && window.__tour3
          ? seenState(e.ref.current, window.__tour3, opts.points || null, [...(window.__guideRoots || [])], rootOf(e.ref.current) === main ? [...others] : [])
          : null,
    }))
  }
}
