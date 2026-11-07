// Photo room (place.tier 'photo'): one archival photograph made walkable by camera projection. The
// chapter's `place.photo` (photoProjection.js) gives the photographer's solved camera and the proxy
// shapes that stand where the photo's surfaces are (ground, boxes, cards, a far backdrop); the
// photograph is projected onto them from that camera. Moving the visitor's camera a little off the
// photographer's spot gives real parallax. What the photographer could not see comes from a filled
// "clean plate"; past the photo's edges the projection fades to the gallery dark.
//
// Stops (chapter.stops): `at: { layer, ringY, glowY, glowSize, spotY, dolly }` puts a hotspot over a
// layer of the photograph (picking it turns the camera to it and moves in by `dolly` of the range);
// `rail: true` lays the record on the viewing rail at the foot of the view, and picking it lifts it
// into the middle of the view. The guide stands in front of the rail on the left (or on the side the
// photograph's `guide` gives: on the right, the rail records move to the left), her whole figure in
// frame (owner feedback round 9), sized from the lens the photograph gets. The visitor's frame (guide,
// rail) is drawn over the photograph's world (drei Hud: a scene of its own, after a depth clear), so
// the photograph's proxy shapes, which may stand nearer the eye than she does, never cover her.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Hud } from '@react-three/drei'
import { useScopedTexture } from '../../shared/loadHooks.js'
import { useRecordDraw } from '../recordDraws.js'
import { backdropOf } from '../data/artifacts.js'
import * as THREE from 'three'
import { Hotspot } from '../room/Hotspot.jsx'
import { useClearArea } from '../labelLines.js'
import { Guide } from '../../shared/guide/Guide.jsx'
import { photoLayout, pointAtDepth, FOCUS_RATE, photoFov, visitorFrame, raisedRecordAt, railLayout, RAIL_SLOT, RAIL_CLEAR, stepBackView, setFocusPending, setFocusShown } from './photoProjection.js'

const D2R = THREE.MathUtils.degToRad

// ---------- projection material ----------
const vert = /* glsl */ `
  uniform mat4 projVP;
  varying vec4 vProj;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vProj = projVP * wp;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const frag = /* glsl */ `
  uniform sampler2D photo;
  uniform sampler2D plate;
  uniform sampler2D mask;
  uniform int channel;
  uniform vec3 dark;
  uniform float edge;
  varying vec4 vProj;
  void main() {
    if (vProj.w <= 0.0) discard;
    vec2 uv = vProj.xy / vProj.w * 0.5 + 0.5;
    vec2 e = smoothstep(vec2(0.0), vec2(edge), uv) * smoothstep(vec2(0.0), vec2(edge), 1.0 - uv);
    float inside = e.x * e.y;
    vec3 c;
    float alpha = 1.0;
    if (channel >= 0) {
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
      vec4 m = texture2D(mask, uv);
      float a = channel == 0 ? m.r : channel == 1 ? m.g : m.b;
      a = smoothstep(0.25, 0.75, a);
      if (a < 0.01) discard;
      c = texture2D(photo, uv).rgb;
      alpha = a;
    } else {
      c = texture2D(plate, clamp(uv, 0.0, 1.0)).rgb;
    }
    // a warm gallery dark past the photo's edges; a faint warmth over the silver print
    c = mix(c, c * vec3(1.02, 0.99, 0.94), 0.6);
    gl_FragColor = vec4(mix(dark, c, inside), alpha);
  }
`

// the photo room's files come from the record it names (artifacts.js backdropOf): the place cannot draw one
// photograph under another record's id (round 9 fix round 7, Codex review 6); a record with none fails the place
function photoFiles(photo) {
  const f = backdropOf(photo?.mediaId)
  if (!f) throw new Error(`photo room: the record ${photo?.mediaId} has no photo room files (its backdrop)`)
  return f
}

function useProjection(photo, projVP) {
  const files = photoFiles(photo)
  const [img, plate, mask] = useScopedTexture([files.photo, files.plate, files.mask])
  return useMemo(() => {
    for (const t of [img, plate, mask]) {
      t.colorSpace = THREE.NoColorSpace // sampled and written as is: the canvas shows the file's pixels
      t.anisotropy = 8
      t.generateMipmaps = t !== mask
      t.minFilter = t === mask ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter
    }
    const make = (channel) =>
      new THREE.ShaderMaterial({
        uniforms: { photo: { value: img }, plate: { value: plate }, mask: { value: mask }, channel: { value: channel }, projVP: { value: projVP }, dark: { value: new THREE.Color('#0d0b09') }, edge: { value: 0.12 } },
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.DoubleSide,
        // the cut-out edges blend over the plate (drawn after it, as transparent)
        transparent: channel >= 0,
      })
    return { plate: make(-1), masks: [make(0), make(1), make(2)] }
  }, [img, plate, mask, projVP])
}

// ---------- the visitor's camera ----------
const UP = THREE.Object3D.DEFAULT_UP
const LEVEL = new THREE.Vector3()
// the camera for a view (yaw and pitch from the photographer's axis, dolly forward): it swings around the pivot as it
// turns, then moves forward along the level view direction
function placeCamera(cam, layout, look, yaw, pitch, dolly) {
  const p = cam.position.copy(layout.cam.position).sub(layout.pivot).applyAxisAngle(UP, -yaw * look.orbit).add(layout.pivot)
  p.addScaledVector(LEVEL.set(0, 0, -1).applyAxisAngle(UP, yaw), dolly)
  p.y -= dolly * 0.25
  cam.rotation.set(-layout.pitch + pitch, yaw, 0, 'YXZ')
  cam.updateMatrixWorld()
}


// How much of the screen shows past the photograph's edges for a camera: an n x n grid over the screen (its corners
// included), each ray to the photograph's surfaces, the hit point projected by the photographer's camera (projVP); a
// ray that hits nothing, or a point outside the photograph's frame, is past its edges. A ray the foreground covers (the
// rail, its records; given as a test) is not counted. Round 9 fix round 7b: a focus view never shows past the edges.
const RAY = new THREE.Raycaster()
const V4 = new THREE.Vector4()
function photoBounds(cam, photoGroup, projVP, covered = null, n = 5) {
  const out = { samples: 0, outside: 0, covered: 0 }
  if (!photoGroup) return out
  photoGroup.updateWorldMatrix(true, true)
  cam.updateMatrixWorld()
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const ndc = new THREE.Vector2(-1 + (2 * i) / (n - 1), -1 + (2 * j) / (n - 1))
      RAY.setFromCamera(ndc, cam)
      if (covered?.(RAY.ray.direction)) {
        out.covered++
        continue
      }
      out.samples++
      const hit = RAY.intersectObject(photoGroup, true)[0]
      if (!hit) {
        out.outside++
        continue
      }
      V4.set(hit.point.x, hit.point.y, hit.point.z, 1).applyMatrix4(projVP)
      const u = (V4.x / V4.w) * 0.5 + 0.5
      const v = (V4.y / V4.w) * 0.5 + 0.5
      if (V4.w <= 0 || u < -0.002 || u > 1.002 || v < -0.002 || v > 1.002) out.outside++
    }
  return out
}

// Where a pixel (u, v) of the photograph is drawn in the room: the first of the photograph's surfaces along the
// photographer's ray through it that shows that pixel (a cut-out layer only where its mask holds it; else the plate,
// the ground or the far backdrop behind). A stop's subject is drawn there, not on its layer's plane: the Ulm Minster
// lies on the far backdrop behind the 'front' layer (round 9 fix round 7b). Falls back to the layer's depth.
function subjectLocator(layout, photo, photoGroup, mats) {
  const img = mats?.plate?.uniforms?.mask?.value?.image
  let mask = null
  if (img && typeof document !== 'undefined') {
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const g = c.getContext('2d', { willReadFrequently: true })
    g.drawImage(img, 0, 0)
    mask = { w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data }
  }
  const ray = new THREE.Raycaster()
  // the photograph's surfaces where they stand (before the first frame their world matrices are not set yet)
  photoGroup?.updateWorldMatrix(true, true)
  const far = (u, v) => pointAtDepth(layout.cam, photo.crop, u, v, -layout.far / 2)
  return (u, v, fallbackZ) => {
    const fallback = () => pointAtDepth(layout.cam, photo.crop, u, v, fallbackZ)
    if (!photoGroup) return fallback()
    const o = layout.cam.position
    ray.set(o, far(u, v).sub(o).normalize())
    for (const h of ray.intersectObject(photoGroup, true)) {
      const ch = h.object.material?.uniforms?.channel?.value ?? -1
      if (ch < 0) return h.point
      if (!mask) continue
      const x = Math.min(mask.w - 1, Math.max(0, Math.round(((u - photo.crop.x) / photo.crop.w) * mask.w)))
      const y = Math.min(mask.h - 1, Math.max(0, Math.round(((v - photo.crop.y) / photo.crop.h) * mask.h)))
      if (mask.data[(y * mask.w + x) * 4 + ch] >= 128) return h.point
    }
    return fallback()
  }
}

// A test for a camera: whether a world direction from it is covered by the foreground (the rail and its records, not
// the guide), which stands in the camera's eye space wherever the camera is
function foregroundCover(foreground, guide) {
  const skip = new Set()
  guide?.traverse((o) => skip.add(o))
  const ray = new THREE.Raycaster()
  return (cam) => {
    if (!foreground) return () => false
    // the foreground stands where this camera is (Foreground moves it to the camera every frame; the next frame puts
    // it back where the real camera is)
    foreground.position.copy(cam.position)
    foreground.quaternion.copy(cam.quaternion)
    foreground.updateWorldMatrix(true, true)
    const meshes = []
    foreground.traverse((o) => o.isMesh && !skip.has(o) && o.visible !== false && meshes.push(o))
    return (dir) => {
      ray.set(cam.position, dir)
      ray.near = 0.05
      ray.far = Infinity
      return ray.intersectObjects(meshes, false).length > 0
    }
  }
}

// The HUD panels over the canvas now, as NDC rectangles (4 px larger all round): the title card, the controls hint, the
// top-right buttons, Step back, the stop rail and its labels, the guide's speech bubble (its slot, as tall as a two-line
// caption when it is empty, as room/guideFrame.js hudKeepOut reserves it), Hear / Next and Moments. A subject's head
// keeps clear of them (focusView, the view at rest; e2e/chapters.mjs checks it). Only panels shown now are read.
const HUD_PANELS = ['[data-hud=title]', '.hint-pill', '.hud-actions', '.hud-back', '.stop-dots', '.stop-dot-name', '.bubble-slot', '.hud-bottom-right', '[data-hud=moments]']
function hudPanels(canvas, sels = HUD_PANELS) {
  if (typeof document === 'undefined' || !canvas) return []
  const c = canvas.getBoundingClientRect()
  if (!c.width || !c.height) return []
  const shown = (el) => {
    for (let x = el; x && x !== document.body; x = x.parentElement) {
      const cs = getComputedStyle(x)
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05) return false
    }
    return true
  }
  const out = []
  const m = 4
  for (const sel of sels)
    for (const el of document.querySelectorAll(sel)) {
      if (!shown(el)) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const top = sel === '.bubble-slot' ? Math.min(r.top, r.bottom - (c.width < 720 ? 130 : 120)) - 10 : r.top
      out.push({ x0: ((r.left - m - c.left) / c.width) * 2 - 1, x1: ((r.right + m - c.left) / c.width) * 2 - 1, y0: 1 - ((r.bottom + m - c.top) / c.height) * 2, y1: 1 - ((top - m - c.top) / c.height) * 2 })
    }
  return out
}
// The HUD panels a pick may see from here: the panels shown now and Step back, which shows once a stop is picked (it is
// put where ChapterPlayer puts it, measured with the rest and taken out again in the same task, so it is never drawn);
// and, while the controls hint shows (it goes after a few seconds), the same without it
function pickHuds(canvas) {
  if (typeof document === 'undefined') return [hudPanels(canvas)]
  const host = !document.querySelector('.hud-back') && document.querySelector('.stop-dots')?.parentElement
  let el = null
  if (host) {
    el = document.createElement('button')
    el.type = 'button'
    el.className = 'btn-glass hud-back'
    el.textContent = 'Step back'
    el.tabIndex = -1
    el.setAttribute('aria-hidden', 'true')
    host.appendChild(el)
  }
  try {
    const out = [hudPanels(canvas)]
    // (without the hint: the same panels less its own; it is never touched, so it never restarts its fade)
    if (document.querySelector('.hint-pill')) out.push(hudPanels(canvas, HUD_PANELS.filter((x) => x !== '.hint-pill')))
    return out
  } finally {
    el?.remove()
  }
}

// The view for a stop over the photograph. Every view it takes stays inside the photograph's frame (photoBounds: no
// dark past its edges, on a desktop or a phone) and keeps the subject (at.target, on its layer) clear of the guide's
// figure and of the foreground drawn over the photograph (the rail and its records). In order:
//   1. the tuned view (rest yaw and pitch, the stop's dolly) or the tuned direction moving in less, or the least turn
//      across and then the least tilt toward the subject, that shows all of the subject (round 9 fix round 7: the
//      records gate found Einstein's Minster half out of view);
//   2. else (a subject larger than the view inside the frame: Muir's Roosevelt at Glacier Point) the view that keeps
//      the head in view, the subject's top, and shows the most of the rest: it is cropped at the feet, never at the
//      head (round 9 fix round 7b, controller ruling); a view the records gate's crop rule accepts (fix round 8: the
//      photographer's direction may then tilt past the look's range, still inside the photograph's frame);
//   3. else null (the caller then tries without the HUD panels, the head rule below, and last takes the tuned view).
// Every view it takes also keeps the subject's head clear of the HUD panels (hud, NDC rectangles: hudPanels): the head
// band, the top row's middle third down to the second row of the 9 x 9 grid, as e2e/chapters.mjs reads it (fix round 9,
// Codex review 9: the title card covered the top of Prague's tower). For a head at the photograph's top edge the
// crop search may then move in up to the look's own range (look.dolly, as far as the visitor can scroll).
// Fix round 12 (a pick froze a phone for up to 10 s): a generator that yields after each view it judges, so the search
// runs in slices of a few milliseconds a frame (searchSlice) and ahead of a pick; it returns exactly the view the single
// run did (the same candidates, in the same order, judged by the same rules). Phase 1 stops at the first view that
// passes; the crop phases rank every view by its score, so they run to the end (the best score is the rule).
function* focusViewSteps({ camera, layout, photo, look, stop, restYaw, restPitch, dolly, yawMax, pitchMax, guideRect, foreground, guide, photoGroup, subjectAt, keep = [], railTop = -1, hud = [] }) {
  const tuned = { yaw: restYaw, pitch: restPitch, dolly }
  const t = stop?.at?.target
  if (!t) return tuned
  const layer = [...layout.boxes, ...layout.cards].find((b) => b.id === stop.at.layer)
  const z = layer ? layer.position.z : -layout.far / 2
  const at = (u, v) => (subjectAt ? subjectAt(u, v, z) : pointAtDepth(layout.cam, photo.crop, u, v, z))
  const pts = [at(t[0], t[1]), at(t[2], t[1]), at(t[0], t[3]), at(t[2], t[3])]
  const mid = at((t[0] + t[2]) / 2, (t[1] + t[3]) / 2)
  // the head: the subject's top, across its middle (a figure's arms or a crowd may run past the screen's sides)
  const headPts = [0.4, 0.5, 0.6].map((f) => at(t[0] + (t[2] - t[0]) * f, t[1] + (t[3] - t[1]) * 0.03))
  const headAim = at((t[0] + t[2]) / 2, t[1] + (t[3] - t[1]) * 0.2)
  const cam = camera.clone()
  const q = new THREE.Vector3()
  // the head band on a 17 x 17 grid: columns 6-10 (the 9 x 9 grid's middle third), rows 0-2 (its top row to its second)
  const headBand = []
  for (let i = 6; i <= 10; i++) for (let j = 0; j <= 2; j++) headBand.push(at(t[0] + (t[2] - t[0]) * (0.05 + (0.9 * i) / 16), t[1] + (t[3] - t[1]) * (0.05 + (0.9 * j) / 16)))
  // no point of it on screen under a HUD panel (a point off screen is judged by the head and crop rules)
  const clearOfHud = () =>
    !hud.length ||
    headBand.every((P) => {
      q.copy(P).project(cam)
      if (!(q.z > -1 && q.z < 1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)) return true
      return !hud.some((r) => q.x >= r.x0 && q.x <= r.x1 && q.y >= r.y0 && q.y <= r.y1)
    })
  const grid = []
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) grid.push(at(t[0] + (t[2] - t[0]) * (0.05 + (0.9 * i) / 4), t[1] + (t[3] - t[1]) * (0.05 + (0.9 * j) / 4)))
  // the foreground (a Hud that moves with the camera): its surfaces in its own eye space, ray-cast from the eye
  const fgMeshes = []
  if (foreground) {
    const skip = new Set()
    guide?.traverse((o) => skip.add(o))
    foreground.updateWorldMatrix(true, true)
    const lifted = (o) => {
      for (let p = o; p && p !== foreground; p = p.parent) if (p.userData.lifted) return true
      return false
    }
    // a rail record off the rail (the previous stop's, still settling) is left out: it is on its way back to the rail
    foreground.traverse((o) => o.isMesh && !skip.has(o) && o.visible !== false && !lifted(o) && fgMeshes.push(o))
  }
  const ray = new THREE.Raycaster()
  const fgPos = new THREE.Vector3()
  const fgQuat = new THREE.Quaternion()
  const fgScale = new THREE.Vector3()
  if (foreground) foreground.matrixWorld.decompose(fgPos, fgQuat, fgScale)
  const camInv = new THREE.Quaternion()
  // a world direction from the candidate camera, covered by the foreground (which stands in the camera's eye space)
  const coveredDir = (dir) => {
    if (!fgMeshes.length) return false
    // (the foreground where it is drawn now: the search runs over several frames while it moves with the camera, so its
    // place is read with its meshes' own, never kept from the search's start; fix round 12)
    foreground.matrixWorld.decompose(fgPos, fgQuat, fgScale)
    ray.set(fgPos, dir.clone().applyQuaternion(camInv).applyQuaternion(fgQuat))
    ray.near = 0.05
    ray.far = Infinity
    return ray.intersectObjects(fgMeshes, false).length > 0
  }
  const coveredPoint = (P) => coveredDir(P.clone().sub(cam.position).normalize())
  const onScreen = (P) => (q.copy(P).project(cam), q.z > -1 && q.z < 1 && Math.abs(q.x) <= 0.97 && Math.abs(q.y) <= 0.97)
  const inFrame = () => photoBounds(cam, photoGroup, layout.projVP, coveredDir, 9).outside === 0
  const place = (v) => {
    placeCamera(cam, layout, look, v.yaw, v.pitch, v.dolly)
    cam.matrixWorldInverse.copy(cam.matrixWorld).invert()
    camInv.copy(cam.quaternion).invert()
  }
  // the subject's part on screen keeps clear of the guide's figure
  const g = guideRect
  const clearOfGuide = () => {
    const guideRect = g
    if (!guideRect) return true
    // the subject's corners and its grid: its pixels may lie at different depths (a cut-out over the backdrop)
    const qs = [...pts, ...grid].map((P) => q.copy(P).project(cam).clone())
    const c = (x) => THREE.MathUtils.clamp(x, -1, 1)
    const xs = qs.map((p) => c(p.x))
    const ys = qs.map((p) => c(p.y))
    return Math.max(...xs) <= guideRect.x0 || Math.min(...xs) >= guideRect.x1 || Math.max(...ys) <= guideRect.y0 || Math.min(...ys) >= guideRect.y1
  }
  const whole = (v) => {
    place(v)
    return pts.every(onScreen) && keep.every(onScreen) && clearOfGuide() && clearOfHud() && !grid.some(coveredPoint) && inFrame()
  }
  // the views tried, in order: the tuned direction moving in less, then turned toward the subject (or its head)
  const ks = [1, 0.75, 0.5, 0.25, 0]
  // back past the photographer's spot up to three times the look's dolly range (Fountain Lake on a phone: the lake shore
  // only clears the guide and the rail from further back)
  const dollies = [...ks.map((k) => dolly * k), ...[1, 2, 3, 4, 6, 8, 12].map((j) => (-look.dolly * j) / 4)]
  const views = dollies.map((d) => ({ yaw: restYaw, pitch: restPitch, dolly: d }))
  // at a dolly, the views turned toward the subject (its middle, then its head), in tenths of the turn and the tilt
  const aimed = (dl) => {
    const out = []
    for (const aimAt of [mid, headAim]) {
      const aim = { yaw: restYaw, pitch: restPitch, dolly: dl }
      for (let i = 0; i < 3; i++) {
        place(aim)
        const d = aimAt.clone().sub(cam.position)
        aim.yaw = THREE.MathUtils.clamp(Math.atan2(-d.x, -d.z), -yawMax, yawMax)
        aim.pitch = THREE.MathUtils.clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)) + layout.pitch, -pitchMax, pitchMax)
      }
      // the least turn across first (a turn across brings the photograph's side edge nearer), then the least tilt
      for (let i = 0; i <= 10; i++)
        for (let j = 0; j <= 10; j++) if (i || j) out.push({ yaw: restYaw + ((aim.yaw - restYaw) * i) / 10, pitch: restPitch + ((aim.pitch - restPitch) * j) / 10, dolly: aim.dolly })
    }
    return out
  }
  for (const dl of dollies) views.push(...aimed(dl))
  for (const v of views) {
    if (whole(v)) return v
    yield
  }
  // a subject larger than the frame: the head in view, and the most of it the frame can hold. The frame is the screen
  // above the rail and beside the guide; the score is the share seen over the share the frame could hold at this scale,
  // as e2e/chapters.mjs (croppedAtFeet) measures a crop
  const frameH = 1 - (railTop ?? -1)
  const frameW = g ? Math.max(1 - g.x1, g.x0 + 1) : 2
  // scored as the gate scores it (a 9 x 9 grid over the subject); the coarse grid first ranks the views
  const fine = []
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) fine.push(at(t[0] + (t[2] - t[0]) * (0.05 + (0.9 * i) / 8), t[1] + (t[3] - t[1]) * (0.05 + (0.9 * j) / 8)))
  const score = (pointsOf) => {
    const qs = pointsOf.map((P) => q.copy(P).project(cam).clone())
    const xs = qs.map((p) => p.x)
    const ys = qs.map((p) => p.y)
    const fit = Math.min(1, frameH / (Math.max(...ys) - Math.min(...ys))) * Math.min(1, frameW / (Math.max(...xs) - Math.min(...xs)))
    return pointsOf.filter((P) => onScreen(P) && !coveredPoint(P)).length / (fit * pointsOf.length)
  }
  const ranked = []
  for (const v of views) {
    yield
    place(v)
    if (!headPts.every((P) => onScreen(P) && !coveredPoint(P)) || !keep.every(onScreen) || !clearOfGuide() || !clearOfHud()) continue
    ranked.push({ v, score: score(grid) })
  }
  ranked.sort((a, b) => b.score - a.score)
  // first the views that cut nothing at the top (no point of the subject above the screen's top), then any
  function* pick(topWhole) {
    let best = null
    let scored = 0
    for (const r of ranked) {
      if (scored >= 24) break
      yield
      place(r.v)
      if (!inFrame()) continue
      if (topWhole && fine.some((P) => (q.copy(P).project(cam), q.z > -1 && q.z < 1 && q.y > 1))) continue
      scored++
      const s = score(fine)
      if (!best || s > best.score) best = { v: r.v, score: s }
    }
    return best
  }
  const best = (yield* pick(true)) || (yield* pick(false))
  // the crop the records gate accepts (e2e/chapters.mjs croppedAtFeet, round 9 fix round 8), on the same 9 x 9 grid:
  // nothing above the screen's top or behind the camera, the head (the top row's middle third) seen, cut off a side
  // only if the subject is wider than the frame, below the screen's foot or behind the rail only if it is taller, and at
  // least three quarters of what the frame can hold seen. Its score (seen over what the frame can hold), or null
  const headRow = fine.filter((_, k) => k % 9 === 0 && k >= 27 && k < 54)
  // on screen as the gate counts it (the screen's own edge, not onScreen's margin)
  const inView = (P) => (q.copy(P).project(cam), q.z > -1 && q.z < 1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)
  const cropScore = () => {
    const xs = []
    const ys = []
    let below = 0
    let side = 0
    let framed = 0
    let seen = 0
    for (const P of fine) {
      q.copy(P).project(cam)
      if (!(q.z > -1 && q.z < 1) || q.y > 1) return null
      xs.push(q.x)
      ys.push(q.y)
      if (q.y < -1) below++
      else if (Math.abs(q.x) > 1) side++
      else if (coveredPoint(P)) framed++
      else seen++
    }
    if (!headRow.every((P) => inView(P) && !coveredPoint(P))) return null
    const spanX = Math.max(...xs) - Math.min(...xs)
    const spanY = Math.max(...ys) - Math.min(...ys)
    if (side && !(spanX > frameW)) return null
    if ((below || framed) && !(spanY > frameH)) return null
    const fit = Math.min(1, frameH / spanY) * Math.min(1, frameW / spanX)
    return seen >= 0.75 * fit * fine.length ? seen / (fit * fine.length) : null
  }
  if (best) {
    place(best.v)
    if (cropScore() != null) return best.v
  }
  // else the best view that crop allows: the views above, and the photographer's direction tilted past the look's range
  // in quarter degrees (a subject whose head is at the photograph's top edge: Albright's Prague tower on a desktop
  // shows its head whole only from the photographer's spot, tilted up about 8 degrees, where the layers do not part),
  // each inside the photograph's frame
  const tilts = []
  // (and moved in further, up to the look's range: a head at the photograph's top edge clears the HUD only when the
  // photograph above it fills the band the HUD covers)
  const deeper = hud.length ? [0.25, 0.5, 0.75, 1].map((k) => look.dolly * k).filter((d) => d > dolly) : []
  for (const dl of [...dollies, ...deeper]) for (let a = 0.25; a <= 45; a += 0.25) for (const sg of [1, -1]) tilts.push({ yaw: restYaw, pitch: restPitch + sg * D2R(a), dolly: dl })
  // (and at those deeper dollies, turned toward the subject too, fix round 10: on the shorter canvas below Prague's band,
  // place.hudBand, a phone keeps the tower's whole width clear of the photograph's left edge only moved in and turned)
  for (const dl of deeper) tilts.push(...aimed(dl))
  const allowed = []
  for (const v of [...ranked.map((r) => r.v), ...tilts]) {
    yield
    place(v)
    if (fine.some((P) => (q.copy(P).project(cam), !(q.z > -1 && q.z < 1) || q.y > 1))) continue
    if (!headRow.every(inView) || !keep.every(onScreen) || !clearOfGuide() || !clearOfHud()) continue
    const sc = cropScore()
    if (sc != null) allowed.push({ v, score: sc })
  }
  allowed.sort((a, b) => b.score - a.score)
  for (const r of allowed) {
    yield
    place(r.v)
    if (inFrame()) return r.v
  }
  return best ? best.v : null
}
// A stop's view, as the pick has always taken it: focusView with the HUD panels, else without them, else the tuned view.
function* stopViewSteps(opts, guideStand, tuned) {
  const v = (yield* focusViewSteps({ ...opts, guideRect: guideStand })) || (yield* focusViewSteps({ ...opts, guideRect: guideStand, hud: [] }))
  return v || tuned
}
// Run a search for up to `ms` milliseconds; the result once it is done, else undefined (call again next frame).
function searchSlice(job, ms) {
  const t0 = performance.now()
  do {
    const r = job.gen.next()
    if (r.done) {
      job.done = true
      job.value = r.value
      return r.value
    }
  } while (performance.now() - t0 < ms)
  return undefined
}
// a stop's dolly, a share of the look's range (on a phone its own where it has one)
const stopDolly = (stop, phone) => (phone ? stop.at.dollyPhone : null) ?? stop.at.dolly ?? 0.7
// milliseconds of search a frame: for the stop just picked, and ahead of a pick (well under a 16 ms frame on a phone)
const PICK_MS = 8
const PRE_MS = 5
// Starts on the photographer's spot. Drag (or arrow keys) looks around up to the yaw range; the
// camera also swings a little around the pivot as it turns, which is what shows the depth. Wheel /
// pinch moves forward. A slow drift shows the parallax before the visitor touches anything.
// the head band of a stop's subject (as focusView and e2e/chapters.mjs read it): 17 x 17 grid, columns 6-10, rows 0-2
const headBandOf = (layout, photo, stop, sub) => targetPoints(layout, photo, stop, 17, sub).filter((_, k) => k % 17 <= 2 && Math.floor(k / 17) >= 6 && Math.floor(k / 17) <= 10)
// the panels the view at rest keeps the subjects' heads clear of: all of HUD_PANELS but Step back (shown only at a stop)
const REST_PANELS = HUD_PANELS.filter((s) => s !== '.hud-back')
// the layout the HUD panels were measured at: the window's size and the canvas's place and size on the page (a resize,
// a phone turned, a band that grew)
const hudLayout = (canvas) => {
  if (typeof window === 'undefined' || !canvas) return null
  const c = canvas.getBoundingClientRect()
  return [window.innerWidth, window.innerHeight, c.left, c.top, c.width, c.height].map(Math.round).join()
}
// the panels seen at the layout before are dropped; the ones shown now are measured where they now are
function hudRemeasure(h, canvas, at) {
  h.keys = new Set()
  h.rects = []
  h.at = at
  for (const r of hudPanels(canvas, REST_PANELS)) {
    h.keys.add([r.x0, r.x1, r.y0, r.y1].map((v) => v.toFixed(2)).join())
    h.rects.push(r)
  }
}
function usePhotoCamera({ photo, layout, reduced, phone, started, focusDolly, focusStop, guideRef, foregroundRef, photoRef, mats, guideStand, railTop, atStops = [], stepBackToRest = false }) {
  const { camera, gl, size } = useThree()
  // a phone may swing less around the pivot as it turns (look.orbitPhone: the Ulm Minster, whole at the photograph's
  // left edge, would otherwise need a turn that brings the edge into view)
  const look = useMemo(() => (phone && photo.look.orbitPhone != null ? { ...photo.look, orbit: photo.look.orbitPhone } : photo.look), [photo.look, phone])
  const yawMax = D2R(phone ? look.yawDegPhone ?? look.yawDeg : look.yawDeg)
  const pitchMax = D2R(look.pitchDeg)
  const dollyMax = look.dolly
  // the view at rest (optional): turned / tilted toward the photograph's subject when the screen shows
  // only part of it (a near-square photograph on a wide desktop or a tall phone screen); look-around
  // and the idle drift stay inside the range around the photographer's axis
  const restYaw = D2R((phone ? look.restYawDegPhone : look.restYawDeg) ?? 0)
  const restPitch = D2R((phone ? look.restPitchDegPhone : look.restPitchDeg) ?? 0)
  const s = useRef({ yaw: restYaw, pitch: restPitch, dolly: 0, ty: restYaw, tp: restPitch, td: 0, idle: 0, drag: null })
  // the HUD panels shown so far in this room at this layout (a panel once shown stays counted: the controls hint shows
  // for a few seconds after arrival, and the view at rest does not move back when it fades); the view at rest is found
  // again when a new one shows. A new layout (a resize, a phone turned: hudLayout) drops them all and measures the
  // panels shown now, where they now are (Codex review 10: the panels' old places stayed counted after a rotation)
  const hudSeen = useRef({ keys: new Set(), rects: [], t: 0, at: null })
  const [hudTick, setHudTick] = useState(0)

  // Fix round 12 (a pick froze a phone for up to 10 s): each stop's view is found ahead of a pick, a few milliseconds a
  // frame (PRE_MS), with the HUD as the pick will see it (the panels shown now, and Step back where it will stand; and
  // without the controls hint, which goes after a few seconds), and
  // kept per stop and layout: the cache below is emptied whenever the layout, the lens, the photograph or the frame
  // changes, and its key holds everything else the search reads (the stop, its dolly, the HUD panels, the rail records
  // lifted off the rail, the lens). A pick finds its view there; else the camera eases toward the room's view at rest while
  // the search runs (PICK_MS a frame) and turns to the view it finds, unless the visitor has moved the camera meanwhile.
  const views = useRef({ cache: new Map(), search: null, pre: null, done: new Set() })
  useEffect(() => {
    views.current.cache = new Map()
    views.current.pre = null
    views.current.done = new Set()
  }, [layout, photo, look, size, phone, mats, guideStand, railTop, restYaw, restPitch, yawMax, pitchMax, dollyMax])
  // the search's inputs for a stop, and the key they make
  const searchFor = (stop, hud) => {
    camera.fov = photoFov(photo, layout, size, phone)
    camera.updateProjectionMatrix()
    const sub = subjectLocator(layout, photo, photoRef?.current, mats)
    // the part this device's view keeps whole (photo.keepInView)
    const keepRect = photo.keepInView?.[phone ? 'phone' : 'desktop']
    const dolly = dollyMax * stopDolly(stop, phone)
    const opts = { camera, layout, photo, look, stop, restYaw, restPitch, dolly, yawMax, pitchMax, foreground: foregroundRef?.current, guide: guideRef?.current, photoGroup: photoRef?.current, subjectAt: sub, keep: keepRect ? targetPoints(layout, photo, { at: { target: keepRect, layer: null } }, 5, sub).map((a) => new THREE.Vector3(...a)) : [], railTop, hud }
    const lifted = []
    foregroundRef?.current?.traverse((o) => o.userData.lifted && lifted.push(o.uuid))
    const key = [stop.id, dolly, camera.fov, camera.aspect, lifted.sort().join('+'), hud.map((r) => [r.x0, r.x1, r.y0, r.y1].join(',')).sort().join(';')].join('|')
    return { opts, key, tuned: { yaw: restYaw, pitch: restPitch, dolly } }
  }

  useEffect(() => {
    const el = gl.domElement
    const st = s.current
    const down = (e) => {
      st.drag = { x: e.clientX, y: e.clientY, yaw: st.ty, pitch: st.tp }
      st.idle = 0
      st.touched = true
      st.acted = (st.acted || 0) + 1
    }
    const move = (e) => {
      if (!st.drag) return
      // dragging across the whole screen sweeps the full range once
      const k = (2 * yawMax) / Math.max(size.width, 1)
      st.ty = THREE.MathUtils.clamp(st.drag.yaw + (e.clientX - st.drag.x) * k, -yawMax, yawMax)
      // (a focus view may be tilted past the range, focusView: a drag from it starts where it is)
      st.tp = THREE.MathUtils.clamp(st.drag.pitch + (e.clientY - st.drag.y) * k * 0.6, Math.min(-pitchMax, st.drag.pitch), Math.max(pitchMax, st.drag.pitch))
    }
    const up = () => (st.drag = null)
    const wheel = (e) => {
      e.preventDefault()
      st.td = THREE.MathUtils.clamp(st.td - e.deltaY * 0.02, 0, dollyMax)
      st.idle = 0
      st.touched = true
      st.acted = (st.acted || 0) + 1
    }
    const key = (e) => {
      // arrows on the stop dots move between the stops, not the camera
      if (e.target.closest?.('input, textarea, [role="dialog"], .stop-dots')) return
      const step = D2R(4)
      if (e.key === 'ArrowLeft') st.ty = Math.min(yawMax, st.ty + step)
      else if (e.key === 'ArrowRight') st.ty = Math.max(-yawMax, st.ty - step)
      else if (e.key === 'ArrowUp') st.td = Math.min(dollyMax, st.td + 2)
      else if (e.key === 'ArrowDown') st.td = Math.max(0, st.td - 2)
      else return
      st.idle = 0
      st.touched = true
      st.acted = (st.acted || 0) + 1
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', key)
    }
  }, [gl, size.width, yawMax, pitchMax, dollyMax])

  // a stop over the photograph: the camera turns to it and moves in (focusView)
  useEffect(() => {
    const st = s.current
    // the slow drift stops while a stop over the photograph is in view: it would carry the framed view past the
    // photograph's edge or off the subject's head (round 9 fix round 7b)
    const was = st.focused
    st.focused = focusDolly != null
    if (focusDolly == null) {
      // in a room that asks for it (place.stepBackToRest, owner decision 2026-11-04: Prague only), stepping back from a
      // focus view past the visitor's own range (focusView may tilt past it to show a head at the photograph's edge)
      // returns to the view at rest: the drift (its width is the rest view's) and a drag from there would carry the view
      // past the photograph's edges (fix round 10: Prague's tower below the band, tilted up 11.5 degrees on a desktop,
      // where the view stays inside the frame only within 0.3 degrees of turn). Every other room, and a focus view
      // inside the range, stays where it is, as before (stepBackView).
      const to = was ? stepBackView({ yaw: st.ty, pitch: st.tp, dolly: st.td }, { yawMax, pitchMax, dollyMax }, { yaw: st.restYaw ?? restYaw, pitch: st.restPitch ?? restPitch }, stepBackToRest) : null
      if (to) {
        st.ty = to.yaw
        st.tp = to.pitch
        st.td = to.dolly
        st.idle = 0
      }
      return
    }
    st.touched = true
    // her figure as the frame stands her (guideStand), not as she is caught at this moment: the view then does not
    // depend on her gesture of the moment or on whether her model has loaded yet
    // (fix round 9: if no view keeps the head clear of the HUD, the view the other rules choose; the gate reports it)
    const { opts, key, tuned } = searchFor(focusStop, hudPanels(gl.domElement))
    const vs = views.current
    const hit = vs.cache.get(key)
    if (hit) {
      vs.search = null
      setFocusPending(false)
      focusTo(hit, tuned)
      setFocusShown(focusStop.id)
      vs.shown = focusStop.id
    } else {
      // not found yet: the search runs a few milliseconds a frame (useFrame), then the camera turns to the view it finds
      vs.search = { gen: stopViewSteps(opts, guideStand, tuned), key, stop: focusStop.id, acted: st.acted || 0, tuned }
      setFocusPending(true)
      // (the same stop searched again, its layout changed while it is shown: the camera holds its view meanwhile)
      const again = vs.shown === focusStop.id
      vs.shown = focusStop.id
      setFocusShown(focusStop.id)
      // (else toward the room's view at rest, the default view, where a pick is usually made: no detour toward a view
      // the search may not choose, fix round 12, the gate's first run: Prague moved in and back out again)
      if (!again) {
        st.ty = st.restYaw ?? restYaw
        st.tp = st.restPitch ?? restPitch
        st.td = 0
        st.idle = 0
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusDolly, focusStop, dollyMax, restYaw, restPitch, camera, layout, photo, look, size, phone, yawMax, pitchMax, guideRef, foregroundRef, photoRef, mats, guideStand, railTop, gl, stepBackToRest])
  // a pick or a Step back elsewhere ends a search still running (nothing waits on it any more)
  useEffect(() => {
    if (focusStop) return
    views.current.shown = null
    views.current.search = null
    setFocusPending(false)
    setFocusShown(null)
  }, [focusStop])
  useEffect(
    () => () => {
      setFocusPending(false)
      setFocusShown(null)
    },
    [],
  )
  const focusTo = (v, tuned) => {
    const st = s.current
    // dev only: the view focusView chose, and whether it is the tuned one
    if (import.meta.env.DEV && typeof window !== 'undefined') window.__photoFocus = { ...v, tuned: v.yaw === tuned.yaw && v.pitch === tuned.pitch && v.dolly === tuned.dolly }
    st.ty = v.yaw
    st.tp = v.pitch
    st.td = v.dolly
    st.idle = 0
  }

  // dev only (e2e/chapters.mjs, the guide part): the view the camera eases to now, the view at rest and the look's
  // range, so the gate reads where Step back leaves the camera (place.stepBackToRest)
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return
    window.__photoCam = () => {
      const st = s.current
      return { yaw: st.ty, pitch: st.tp, dolly: st.td, rest: { yaw: st.restYaw ?? restYaw, pitch: st.restPitch ?? restPitch }, range: { yawMax, pitchMax, dollyMax } }
    }
    return () => {
      window.__photoCam = null
    }
  }, [restYaw, restPitch, yawMax, pitchMax, dollyMax])

  // the view fills the screen without showing the photo's edges at rest: the narrower of the photo's
  // two angles decides the lens
  useEffect(() => {
    camera.fov = photoFov(photo, layout, size, phone)
    camera.near = 0.05
    camera.far = 6000
    camera.updateProjectionMatrix()
  }, [camera, size, phone, layout, photo])

  // the view at rest inside the photograph's frame too (round 9 fix round 7b, controller ruling 1): the tuned rest
  // direction, or the nearest to it that shows nothing past the photograph's edges (Glacier Point's rest tilt showed
  // above its top edge) and keeps whole the part the photo keeps in view (keepInView: the Ulm Minster on a phone);
  // and the idle drift only as wide as stays inside the frame
  useEffect(() => {
    const photoGroup = photoRef?.current
    if (!photoGroup) return
    const st = s.current
    camera.fov = photoFov(photo, layout, size, phone)
    camera.updateProjectionMatrix()
    const cam = camera.clone()
    const cover = foregroundCover(foregroundRef?.current, guideRef?.current)
    // the part this device's view keeps whole (photo.keepInView: the Ulm Minster on a phone), where its pixels are drawn
    const keepRect = photo.keepInView?.[phone ? 'phone' : 'desktop']
    const keep = keepRect ? targetPoints(layout, photo, { at: { target: keepRect, layer: null } }, 5, subjectLocator(layout, photo, photoGroup, mats)).map((a) => new THREE.Vector3(...a)) : []
    const q = new THREE.Vector3()
    // every stop's subject's head band: a point of it on screen is never under a HUD panel (fix round 9)
    const sub = subjectLocator(layout, photo, photoGroup, mats)
    const heads = atStops.flatMap((st) => headBandOf(layout, photo, st, sub)).map((a) => new THREE.Vector3(...a))
    // (a new layout: the panels as they lie now, hudRemeasure; the frame's poll then finds the same layout)
    const at = hudLayout(gl.domElement)
    if (hudSeen.current.at !== at) hudRemeasure(hudSeen.current, gl.domElement, at)
    const hud = hudSeen.current.rects
    const onScr = (P) => (q.copy(P).project(cam), q.z > -1 && q.z < 1 && Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1)
    // the head points the tuned rest shows stay on screen: a head is not cleared of the HUD by turning it out of view
    placeCamera(cam, layout, look, restYaw, restPitch, 0)
    const shownTuned = heads.map(onScr)
    const underHud = () =>
      hud.length > 0 &&
      heads.some((P, i) => {
        if (!onScr(P)) return shownTuned[i]
        return hud.some((r) => q.x >= r.x0 && q.x <= r.x1 && q.y >= r.y0 && q.y <= r.y1)
      })
    let hudToo = true
    const inFrame = (yaw, pitch) => {
      placeCamera(cam, layout, look, yaw, pitch, 0)
      if (keep.some((P) => (q.copy(P).project(cam), !(q.z > -1 && q.z < 1 && Math.abs(q.x) <= 0.98 && Math.abs(q.y) <= 0.98)))) return false
      if (hudToo && underHud()) return false
      return photoBounds(cam, photoGroup, layout.projVP, cover(cam), 9).outside === 0
    }
    // the tuned rest, else the nearest view to it (in yaw, then pitch) that passes (if none keeps the heads clear of the
    // HUD, the nearest that passes the other rules: the gate reports it)
    let rest = null
    const steps = []
    for (let i = -20; i <= 20; i++) for (let j = -10; j <= 10; j++) steps.push([restYaw + (i / 20) * yawMax, restPitch + (j / 10) * pitchMax])
    steps.sort((a, b) => Math.abs(a[0] - restYaw) - Math.abs(b[0] - restYaw) || Math.abs(a[1] - restPitch) - Math.abs(b[1] - restPitch))
    for (const pass of [true, false]) {
      hudToo = pass
      for (const [y, p] of steps) if (Math.abs(y) <= yawMax && Math.abs(p) <= pitchMax && inFrame(y, p)) {
        rest = [y, p]
        break
      }
      if (rest) break
    }
    if (!rest) rest = [restYaw, restPitch]
    let amp = (yawMax - Math.abs(restYaw)) * 0.45
    while (amp > 0.001 && !(inFrame(rest[0] + amp, rest[1]) && inFrame(rest[0] - amp, rest[1]))) amp *= 0.8
    st.restYaw = rest[0]
    st.restPitch = rest[1]
    st.driftAmp = amp > 0.001 ? amp : 0
    // a new HUD panel alone (hudTick), or a new layout (a resize, a phone turned), moves the camera only while it is
    // still on the view at rest the room opened on: never once the visitor has looked around or picked a stop (fix
    // round 9: stepping back from a stop must not be followed by a move when a caption shows; Codex review 10: nor a
    // rotation); the view at rest, its drift and the view Step back may return to are found again all the same
    const hudOnly = st.hudTick !== undefined && st.hudTick !== hudTick
    st.hudTick = hudTick
    const relaid = st.restAt !== undefined && st.restAt !== at
    st.restAt = at
    if (!st.focused && !st.drag && !((hudOnly || relaid) && st.touched)) {
      st.ty = rest[0]
      st.tp = rest[1]
      // before Begin the camera does not move: it starts on the clamped rest view
      if (!started) {
        st.yaw = rest[0]
        st.pitch = rest[1]
      }
    }
    if (import.meta.env.DEV && typeof window !== 'undefined') window.__photoRest = { yaw: rest[0], pitch: rest[1], drift: st.driftAmp, tuned: rest[0] === restYaw && rest[1] === restPitch, hud: hud.length, hudClear: hudToo, at }
  }, [camera, layout, photo, look, size, phone, restYaw, restPitch, yawMax, pitchMax, photoRef, foregroundRef, guideRef, started, mats, atStops, hudTick, gl])

  useFrame((state, dt) => {
    const st = s.current
    // the search for the stop just picked (PICK_MS a frame), else the next stop's view ahead of a pick (PRE_MS a frame)
    const vs = views.current
    if (vs.search) {
      const job = vs.search
      const v = searchSlice(job, PICK_MS)
      if (job.done) {
        vs.cache.set(job.key, v)
        vs.search = null
        setFocusPending(false)
        // (the visitor has looked around since the pick: the camera stays where they put it)
        if ((st.acted || 0) === job.acted) focusTo(v, job.tuned)
      }
    } else if (started && photoRef?.current && atStops.length) {
      // (twice a second) the next stop with no view yet for a HUD a pick would see from now (pickHuds)
      vs.poll = (vs.poll || 0) + dt
      if (!vs.pre && vs.poll > 0.5) {
        vs.poll = 0
        const huds = pickHuds(gl.domElement)
        find: for (const hud of huds)
          for (const stop of atStops) {
            if (!stop.at?.target) continue
            const job = searchFor(stop, hud)
            if (vs.cache.has(job.key) || vs.done.has(job.key)) continue
            vs.done.add(job.key)
            vs.pre = { gen: stopViewSteps(job.opts, guideStand, job.tuned), key: job.key }
            break find
          }
      }
      if (vs.pre) {
        const v = searchSlice(vs.pre, PRE_MS)
        if (vs.pre.done) {
          vs.cache.set(vs.pre.key, v)
          vs.pre = null
        }
      }
    }
    // a HUD panel not shown before (read twice a second): the view at rest is found again
    const h = hudSeen.current
    h.t += dt
    if (h.t > 0.5) {
      h.t = 0
      let added = false
      const at = hudLayout(gl.domElement)
      if (h.at !== at) {
        hudRemeasure(h, gl.domElement, at)
        added = true
      }
      for (const r of hudPanels(gl.domElement, REST_PANELS)) {
        const key = [r.x0, r.x1, r.y0, r.y1].map((v) => v.toFixed(2)).join()
        if (h.keys.has(key)) continue
        h.keys.add(key)
        h.rects.push(r)
        added = true
      }
      if (added) setHudTick((n) => n + 1)
    }
    // the idle clock (and with it the drift) starts only once the tour has begun
    if (started) st.idle += dt
    // a slow drift after a few idle seconds (not with reduced motion)
    let drift = 0
    if (!reduced && !st.drag && !st.focused && st.idle > 2.5) drift = Math.sin((st.idle - 2.5) * 0.35) * (st.driftAmp ?? (yawMax - Math.abs(restYaw)) * 0.45) * Math.min(1, (st.idle - 2.5) / 3)
    const k = reduced ? 1 : 1 - Math.exp(-dt * FOCUS_RATE)
    st.yaw += (st.ty + drift - st.yaw) * k
    st.pitch += (st.tp - st.pitch) * k
    st.dolly += (st.td - st.dolly) * k
    // swing around the pivot, then dolly forward along the level view direction
    placeCamera(camera, layout, look, st.yaw, st.pitch, st.dolly)
  })
}

// ---------- the visitor's frame ----------
// The guide and a viewing rail stay with the visitor (like a presenter at the side of the frame);
// the photograph's world moves behind them.
function Foreground({ children, groupRef }) {
  const g = useRef()
  useEffect(() => {
    if (groupRef) groupRef.current = g.current
  })
  const { camera } = useThree()
  useFrame(() => {
    if (!g.current) return
    g.current.position.copy(camera.position)
    g.current.quaternion.copy(camera.quaternion)
  })
  return <group ref={g}>{children}</group>
}

// A record on the rail. When its stop is picked it rises off the rail and turns to face the visitor
// in the middle of the view (about a second); it settles back when the stop is left. Reduced motion:
// it moves at once.
const REST_ROT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.55, 0, -0.12))
const UP_ROT = new THREE.Quaternion()
const RisingRecord = forwardRef(function RisingRecord({ raised, reduced, rest, up, restScale = 1, upScale = 1, children }, ref) {
  const g = useRef()
  useImperativeHandle(ref, () => g.current)
  const k = useRef(0)
  const a = useMemo(() => new THREE.Vector3(...rest), [rest])
  const b = useMemo(() => new THREE.Vector3(...up), [up])
  useFrame((_, dt) => {
    if (!g.current) return
    const to = raised ? 1 : 0
    k.current = reduced ? to : k.current + Math.sign(to - k.current) * Math.min(Math.abs(to - k.current), dt / 0.9)
    const t = k.current
    // off the rail (rising, raised or settling back): focusView leaves it out, it is on its way back to the rail
    g.current.userData.lifted = t > 0.001
    const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
    g.current.position.lerpVectors(a, b, e)
    // a small lift off the rail before it travels
    g.current.position.y += Math.sin(Math.PI * e) * 0.12
    g.current.quaternion.slerpQuaternions(REST_ROT, UP_ROT, e)
    // the rail lies further out than it did (the guide stands in front of it): a record there is drawn
    // larger, and comes up to its own size near the eye
    g.current.scale.setScalar(restScale + (upScale - restScale) * e)
  })
  return (
    <group ref={g} position={rest} quaternion={REST_ROT} scale={restScale}>
      {children}
    </group>
  )
})

// the ground point under a layer of the photograph (the pivot when the layer is not found)
function layerCenter(layout, id) {
  const b = [...layout.boxes, ...layout.cards].find((x) => x.id === id)
  return b ? b.position.clone().setY(0) : layout.pivot.clone()
}

// the screen box of a stop's subject: the corners of its photo-pixel rectangle, at its layer's depth
function targetScreenBox(layout, photo, stop, camera, size) {
  const t = stop?.at?.target
  if (!t) return null
  const layer = [...layout.boxes, ...layout.cards].find((b) => b.id === stop.at.layer)
  const z = layer ? layer.position.z : -layout.far / 2
  const pts = [
    [t[0], t[1]],
    [t[2], t[1]],
    [t[0], t[3]],
    [t[2], t[3]],
  ].map(([u, v]) => pointAtDepth(layout.cam, photo.crop, u, v, z).project(camera))
  const xs = pts.map((p) => ((p.x + 1) / 2) * size.width)
  const ys = pts.map((p) => ((1 - p.y) / 2) * size.height)
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
}

// dev only: world points over a stop's subject on the photograph, on its layer's depth (as targetScreenBox)
function targetPoints(layout, photo, stop, n, subjectAt) {
  const t = stop?.at?.target
  if (!t) return []
  const layer = [...layout.boxes, ...layout.cards].find((b) => b.id === stop.at.layer)
  const z = layer ? layer.position.z : -layout.far / 2
  const out = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const u = t[0] + (t[2] - t[0]) * (0.05 + (0.9 * i) / (n - 1))
      const v = t[1] + (t[3] - t[1]) * (0.05 + (0.9 * j) / (n - 1))
      out.push((subjectAt ? subjectAt(u, v, z) : pointAtDepth(layout.cam, photo.crop, u, v, z)).toArray())
    }
  return out
}

// The presenter in the visitor's frame: three-quarters to the visitor at rest; while she talks about a
// stop over the photograph, mostly turned toward its subject (her head turns the rest: owner feedback
// round 9, she never talks looking away from what she talks about). Her yaw is in the frame's own space.
function PhotoGuide({ at, restYaw, pointAt, nod, reduced, groupRef }) {
  const g = useRef()
  useEffect(() => {
    if (groupRef) groupRef.current = g.current
  })
  const st = useRef({ yaw: restYaw })
  const local = useMemo(() => new THREE.Vector3(), [])
  const yaw = useCallback(
    (dt) => {
      const s = st.current
      let want = restYaw
      if (pointAt && g.current?.parent) {
        // the subject in the frame's space (the visitor's eye is the frame's origin)
        g.current.parent.updateWorldMatrix(true, false)
        local.copy(pointAt)
        g.current.parent.worldToLocal(local)
        const tx = local.x - at[0]
        const tz = local.z - at[2]
        const tl = Math.hypot(tx, tz) || 1
        const cx = -at[0]
        const cz = -at[2]
        const cl = Math.hypot(cx, cz) || 1
        // mostly toward the subject, still open to the visitor
        const bx = 0.6 * (tx / tl) + 0.4 * (cx / cl)
        const bz = 0.6 * (tz / tl) + 0.4 * (cz / cl)
        if (Math.hypot(bx, bz) > 1e-3) want = Math.atan2(bx, bz)
      }
      let d = want - s.yaw
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      s.yaw = reduced ? want : s.yaw + d * (1 - Math.exp(-3 * (dt || 0.016)))
      return s.yaw
    },
    [pointAt, restYaw, at, reduced, local],
  )
  return (
    <group ref={g} position={at}>
      <Guide fixedYaw={yaw} pointAt={pointAt} lookAtTarget={null} nodKey={nod} reducedMotion={reduced} />
    </group>
  )
}

const recordImage = (art) => art?.pages?.[0]?.src || art?.photos?.[0]?.src

// on a phone her figure and the hand she points with take more of the screen's width (NDC) than on a desktop
const RAISED_CLEAR_PHONE = 0.38
function RailRecord({ stop, index, x, railY, d, k = 1, guideSide = -1, frame, screenAspect, phone, reduced, focus, seen, onPick, register }) {
  const tex = useScopedTexture(recordImage(stop.art))
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef()
  useRecordDraw(stop.id, stop.art?.id, recordImage(stop.art), ref) // dev only (recordDraws.js): the rail record itself
  useEffect(() => {
    register(stop.id, ref)
  }, [register, stop.id])
  const aspect = tex.image ? tex.image.width / tex.image.height : 0.82
  // at most a rail slot wide (a wide photograph is made shorter: railLayout keeps the slots clear of her)
  const h = Math.min(0.4, (RAIL_SLOT - 0.05) / aspect)
  const w = h * aspect
  // it rises in front of the visitor, clear of the guide (its mount included), inside the screen; on a phone at its
  // own spot (further out, a little higher), moved over and made smaller if it must (round 9 fix round 7b: on a
  // phone it rose at a fixed spot, and a wide record ran past the screen's edge)
  const railNdc = frame ? frame.rail.y / (frame.rail.d * frame.T) : 0
  const raised = frame ? (phone ? raisedRecordAt(frame, screenAspect, w + 0.03, 2.3, 0.1, { clear: RAISED_CLEAR_PHONE, h: h + 0.04, bottom: railNdc + 0.26 }) : raisedRecordAt(frame, screenAspect, w + 0.03)) : null
  return (
    <>
      <RisingRecord ref={ref} raised={focus === stop.id} reduced={reduced} rest={[x, railY + 0.05 * k, -d + 0.3]} up={raised ? raised.pos : [-guideSide * 0.25, 0.1, -2.3]} upScale={raised ? raised.scale : 1} restScale={k}>
        <mesh position={[0, 0, -0.004]}>
          <boxGeometry args={[w + 0.03, h + 0.04, 0.006]} />
          <meshStandardMaterial color="#b9a888" roughness={0.9} />
        </mesh>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} roughness={0.85} />
        </mesh>
      </RisingRecord>
      <Hotspot index={index} label={stop.name} position={[x, railY + 0.3 * k, -d + 0.3]} glowAt={[x, railY + 0.08 * k, -d + 0.3]} glowSize={0.7 * k} glowStrength={0.5} seen={seen.includes(stop.id)} active={focus === stop.id} reduced={reduced} onSelect={() => onPick(stop.id)} />
    </>
  )
}

export function PhotoRoomStage({ chapter, phone, reduced, focus, seen = [], onPick, pointAt, nod, onReady, started = true }) {
  const photo = chapter.place.photo
  const layout = useMemo(() => photoLayout(photo), [photo])
  const mats = useProjection(photo, layout.projVP)
  const focused = chapter.stops.find((s) => s.id === focus)
  const { size } = useThree()
  const aspect = size.width / Math.max(size.height, 1)

  // the visitor's frame from the lens this screen gets: the guide in front of a rail across the foot of
  // the view, on the left (or the photograph's own side, photo.guide), the rail records on the other side
  const hasRail = chapter.stops.some((s) => s.rail)
  // (the canvas below a band, place.hudBand: the frame keeps its places on the page, visitorFrame)
  const page = useMemo(() => (size.top > 0 ? { top: size.top, pageHeight: size.top + size.height } : null), [size.top, size.height])
  const frame = useMemo(() => visitorFrame(photo, photoFov(photo, layout, size, phone), aspect, phone, hasRail, page), [photo, layout, size, phone, aspect, hasRail, page])
  // the guide's figure: a view the camera turns to for a stop keeps the subject clear of her figure
  const guideG = useRef()
  const foregroundG = useRef()
  // her figure on screen (NDC, from where the frame stands her): half her width as the guide check measures her, head
  // to toes and hand to hand (about 45 px of a 390 px phone, 55 px of a 1440 px desktop view)
  const guideStand = useMemo(() => {
    const half = frame.phone ? 0.2 : 0.08
    return { x0: frame.guideNdcX - half, x1: frame.guideNdcX + half, y0: frame.guideNdcY[0], y1: frame.guideNdcY[1] }
  }, [frame])
  // dev only (recordDraws.js): the photograph the room stands in; also what a focus view must stay inside (focusView)
  const backdrop = useRef()
  const scene = useMemo(() => chapter.stops.filter((s) => s.at), [chapter.stops])
  usePhotoCamera({ photo, layout, reduced, phone, started, focusDolly: focused?.at ? stopDolly(focused, phone) : null, focusStop: focused?.at ? focused : null, guideRef: guideG, foregroundRef: foregroundG, photoRef: backdrop, mats, guideStand, railTop: frame.rail.y / (frame.rail.d * frame.T), atStops: scene, stepBackToRest: Boolean(chapter.place.stepBackToRest) })
  const d = frame.rail.d
  const halfW = frame.rail.halfW
  const railY = frame.rail.y
  const railK = frame.rail.scale
  const side = -frame.side

  useRecordDraw('@backdrop', photo.mediaId, photoFiles(photo).photo, backdrop)
  const rail = chapter.stops.filter((s) => s.rail)
  const railAt = useMemo(() => railLayout(frame, aspect, rail.length), [frame, aspect, rail.length])
  const centerOf = (id) => layerCenter(layout, id)

  // where the guide points for each stop: a world point, or the rail record's group (it moves)
  const spots = useRef({})
  const register = useMemo(() => (id, ref) => (spots.current[id] = ref), [])
  // dev only (e2e/chapters.mjs): a stop's subject (at.target) on screen, in CSS pixels
  const three = useThree()
  // a rail record's box on screen (round 9 fix round 1: the guide never covers it, nor it her), at rest or raised
  const railBox = useCallback(
    (id) => {
      const g = spots.current[id]?.current
      if (!g) return null
      g.updateWorldMatrix(true, true)
      const b = new THREE.Box3().setFromObject(g)
      if (b.isEmpty()) return null
      const pts = [b.min.x, b.max.x].flatMap((x) => [b.min.y, b.max.y].flatMap((y) => [b.min.z, b.max.z].map((z) => new THREE.Vector3(x, y, z).project(three.camera))))
      const xs = pts.map((p) => ((p.x + 1) / 2) * three.size.width)
      const ys = pts.map((p) => ((1 - p.y) / 2) * three.size.height)
      return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
    },
    [three.camera, three.size],
  )
  // the badges over the photograph keep clear of her figure and of the rail records (round 9 final review: a badge
  // drifting over her was hidden, removing the control; it moves aside instead)
  const clearOf = useCallback(() => {
    const W = three.size.width
    const H = three.size.height
    const half = frame.phone ? RAIL_CLEAR.phone : RAIL_CLEAR.desktop
    const [y0, y1] = frame.guideNdcY
    const guide = { left: ((frame.guideNdcX - half + 1) / 2) * W, right: ((frame.guideNdcX + half + 1) / 2) * W, top: ((1 - y1) / 2) * H, bottom: ((1 - y0) / 2) * H }
    return [guide, ...chapter.stops.filter((s) => s.rail).map((s) => railBox(s.id)).filter(Boolean)]
  }, [three.size, frame, chapter.stops, railBox])
  useClearArea(clearOf)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    // the boxes below in the page's coordinates, as the HUD's boxes and the guide's (TourCanvas guideBox) are: the canvas
    // starts below the band in a photo room with one (place.hudBand)
    const onPage = (b) => {
      if (!b) return b
      const c = three.gl.domElement.getBoundingClientRect()
      return { left: b.left + c.left, right: b.right + c.left, top: b.top + c.top, bottom: b.bottom + c.top }
    }
    window.__photoStage = {
      // the subject's box on screen, from where its pixels are drawn (subjectLocator, 9 x 9), as focusView frames it
      // (round 9 fix round 7b: the corners at the layer's depth missed a subject drawn on the backdrop behind it)
      targetBox: (id) => {
        const pts = targetPoints(layout, photo, chapter.stops.find((s) => s.id === id), 9, subjectLocator(layout, photo, backdrop.current, mats))
        if (!pts.length) return onPage(targetScreenBox(layout, photo, chapter.stops.find((s) => s.id === id), three.camera, three.size))
        const ps = pts.map((a) => new THREE.Vector3(...a).project(three.camera))
        const xs = ps.map((p) => ((p.x + 1) / 2) * three.size.width)
        const ys = ps.map((p) => ((1 - p.y) / 2) * three.size.height)
        return onPage({ left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) })
      },
      // points on the photograph over a stop's subject (at.target, n x n), where its pixels lie on the stop's layer:
      // the records gate checks the camera sees them (round 9 fix round 7, Codex review 6)
      // the top of the rail at the foot of the view (NDC): the foot of the frame a subject is seen in
      railTop: () => frame.rail.y / (frame.rail.d * frame.T),
      // her figure across the screen as the frame stands her (NDC; what focusView keeps a subject clear of)
      guideStand: () => ({ x0: guideStand.x0, x1: guideStand.x1 }),
      targetPoints: (id, n = 9) => targetPoints(layout, photo, chapter.stops.find((s) => s.id === id), n, subjectLocator(layout, photo, backdrop.current, mats)),
      // the part of the photograph this device's view must keep whole (photo.keepInView, e.g. the Ulm Minster on a
      // phone), as world points where its pixels are drawn
      keepInView: (n = 9) => {
        const rect = photo.keepInView?.[phone ? 'phone' : 'desktop']
        return rect ? targetPoints(layout, photo, { at: { target: rect, layer: null } }, n, subjectLocator(layout, photo, backdrop.current, mats)) : null
      },
      // how much of the screen shows past the photograph's edges now (photoBounds; the foreground's rail and records
      // and the guide cover their part): a focus view must show none (round 9 fix round 7b)
      bounds: (n = 9) => {
        const fg = foregroundG.current
        const skip = new Set()
        guideG.current?.traverse((o) => skip.add(o))
        const meshes = []
        fg?.traverse((o) => o.isMesh && !skip.has(o) && o.visible !== false && meshes.push(o))
        const r = new THREE.Raycaster()
        const covered = (dir) => {
          r.set(three.camera.position, dir)
          r.near = 0.05
          return r.intersectObjects(meshes, false).length > 0
        }
        return photoBounds(three.camera, backdrop.current, layout.projVP, covered, n)
      },
      railBox: (id) => onPage(railBox(id)),
      railIds: () => chapter.stops.filter((s) => s.rail).map((s) => s.id),
      stopIds: () => chapter.stops.map((s) => s.id),
    }
    return () => {
      window.__photoStage = null
    }
  }, [layout, photo, chapter.stops, three.camera, three.size, three.gl, railBox, mats, phone, frame, guideStand])

  useEffect(() => {
    for (const s of chapter.stops) if (s.at) spots.current[s.id] = layerCenter(layout, s.at.layer).setY(s.at.spotY ?? 3)
    onReady?.({ spots: spots.current })
  }, [onReady, layout, chapter.stops])

  return (
    <>
      <color attach="background" args={['#0d0b09']} />
      <hemisphereLight args={['#ffe9c9', '#2a2018', 0.9]} />

      {/* the photograph's world: the ground, the far backdrop, the proxies (one group: every surface the photograph is
          projected on, which the records gate checks a stop over the photograph against) */}
      <group ref={backdrop} name="photo-room-photograph">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -layout.far / 2 + 20]} material={mats.plate}>
          <planeGeometry args={[layout.far * 3, layout.far + 40]} />
        </mesh>
        <mesh position={[0, layout.far * 0.45, -layout.far]} material={mats.plate}>
          <planeGeometry args={[layout.far * 4, layout.far * 0.9 + 2]} />
        </mesh>
        {layout.boxes.map((b) => (
          <mesh key={b.id} position={b.position} quaternion={b.quaternion} material={mats.masks[b.mask]}>
            <boxGeometry args={b.size} />
          </mesh>
        ))}
        {layout.cards.map((c) => (
          <mesh key={c.id} position={c.position} quaternion={c.quaternion} material={mats.masks[c.mask]}>
            <planeGeometry args={c.size} />
          </mesh>
        ))}
      </group>

      {scene.map((s) => {
        const c = centerOf(s.at.layer)
        return (
          <Hotspot
            key={s.id}
            keepClear
            index={chapter.stops.indexOf(s) + 1}
            label={s.name}
            position={c.clone().setY(s.at.ringY ?? 6).setX(c.x + (s.at.ringX ?? 0)).toArray()}
            glowAt={c.clone().setY(s.at.glowY ?? 2.5).toArray()}
            glowSize={s.at.glowSize ?? 14}
            glowStrength={0.35}
            seen={seen.includes(s.id)}
            active={focus === s.id}
            reduced={reduced}
            onSelect={() => onPick(s.id)}
          />
        )
      })}

      <Hud>
        <Foreground groupRef={foregroundG}>
          <hemisphereLight args={['#ffe9c9', '#2a2018', 0.9]} />
          <pointLight position={[frame.guide[0] + side * 0.8 * railK, frame.guide[1] + 1.9, frame.guide[2] + 1.8]} intensity={5} distance={8 + d} color="#ffd9a8" />
          <directionalLight position={[2, 3, 1]} intensity={1.1} color="#fff0d6" />
          {/* the rail, behind her */}
          <mesh position={[0, railY, -d + 0.35]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[halfW * 2.6, 0.07 * railK, 0.42 * railK]} />
            <meshStandardMaterial color="#2a1f17" roughness={0.55} metalness={0.05} />
          </mesh>
          {/* its dark front, from the rail down past the foot of the frame */}
          <mesh position={[0, (railY - d * frame.T * 1.2) / 2, -d + 0.52]}>
            <boxGeometry args={[halfW * 2.6, railY + d * frame.T * 1.2, 0.05]} />
            <meshStandardMaterial color="#120e0b" roughness={0.9} />
          </mesh>
          {rail.map((s, i) => (
            <RailRecord key={s.id} stop={s} index={chapter.stops.indexOf(s) + 1} x={railAt.xs[i]} railY={railY} d={d} k={railAt.scale} guideSide={frame.side} frame={frame} screenAspect={aspect} phone={phone} reduced={reduced} focus={focus} seen={seen} onPick={onPick} register={register} />
          ))}
          {/* the guide, her whole figure in frame, in front of the rail */}
          <PhotoGuide at={frame.guide} restYaw={side * (phone ? 0.25 : 0.42)} pointAt={pointAt} nod={nod} reduced={reduced} groupRef={guideG} />
        </Foreground>
      </Hud>
    </>
  )
}

export default PhotoRoomStage



