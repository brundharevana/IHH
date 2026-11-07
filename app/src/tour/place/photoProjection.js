// Camera projection for a photo room (place.tier 'photo'): the archival photograph's camera, the
// proxy shapes that stand where the photo's surfaces are, all from the chapter's `place.photo` data.
// No React here (tested in node).
//
// photo = {
//   mediaId,                       the photograph (a cleared media id)
//   (files: the record's backdrop, data/artifacts.js backdropOf: the projected photo, the filled clean plate, the proxy masks (r, g, b channels))
//   crop: { x, y, w, h },          the projected frame in the source JPEG's pixels
//   camera: { fovDeg, pitchDeg, height },   the solved photographer's camera (vertical fov)
//   solve?: { horizonRow, from, to, length }  how the camera was solved: pitch from the horizon row,
//                                  height so the ground distance between two pixels is `length`
//   layers: [
//     { id, kind: 'box', mask, from: [u, v], to: [u, v], beam, top, bottom?, inset?, cut?: [from, to] }
//         a box standing on the ground; its near ground line runs pixel `from` to pixel `to`
//     { id, kind: 'card', mask, at: [u, v], width, height, y }   an upright card facing the camera;
//         width is a share of its distance from the camera
//   ],
//   backdropRow,                   the pixel row where the ground meets the far backdrop
//   guide?: { x, xPhone }          where the guide stands across the visitor's frame, as a share of its
//                                  half-width (negative: left; default -0.7 desktop, -0.55 phone), set so
//                                  she stands beside, never over, the stops' subjects
//   look: { yawDeg, yawDegPhone, pitchDeg, dolly, orbit, pivot, restYawDeg?, restPitchDeg?,
//           restYawDegPhone?, restPitchDegPhone? }  the visitor's look-around range; pivot names the
//         layer the camera swings around; rest*: the view at rest (default straight down the
//         photographer's axis), e.g. tilted up on a wide desktop so a standing figure is not cut
// }
// A stop over the photograph (chapter.stops[i].at) names its `layer` (its badge at ringY up, ringX across from the
// layer's centre, in the photo's units), how far the camera moves in (dolly, dollyPhone:
// a share of the look range; on a phone less where the subject would fill the narrow screen), and its `target`: [u0, v0, u1, v1],
// the photo-pixel rectangle of what the focus shows (a person, a building); the guide must not cover it
// once the camera has settled (e2e/chapters.mjs checks every photo-room stop of every tour).
// Units are the photo's own (the Normandie: 1 = 10 m). `mask` is 0 | 1 | 2 (the mask's r | g | b).
import * as THREE from 'three'

const D2R = THREE.MathUtils.degToRad

// The visitor's camera eases toward its target at this rate (1 - exp(-dt * FOCUS_RATE) per frame), so
// a focus has settled to within 0.5 % after FOCUS_SETTLE_MS; a stop's record opens only then.
export const FOCUS_RATE = 4
export const FOCUS_SETTLE_MS = Math.ceil((Math.log(200) / FOCUS_RATE) * 1000)
// A photo room's stop view still being searched (PhotoRoomStage: the search runs a few milliseconds a frame when a pick
// finds no view found ahead of it): ChapterPlayer opens the stop's record only once the stage has taken the pick (its
// focus effect has run for that stop: setFocusShown) and the view is found (focusReady(id)), then FOCUS_SETTLE_MS for the
// camera's ease. Dev only: window.__photoFocusPending() and window.__photoFocusFor(id) for the e2e waits.
let pending = false
let shown = null
let waiters = []
// counts the searches begun (a stop's view searched again after a pick: a layout change while it is shown)
let searches = 0
export const focusSearches = () => searches
const flush = () => {
  if (!waiters.length) return
  waiters = waiters.filter((w) => {
    if (w.id !== shown || pending) return true
    w.resolve()
    return false
  })
}
export function setFocusPending(p) {
  if (p && !pending) searches++
  pending = p
  flush()
}
export function setFocusShown(id) {
  shown = id
  flush()
}
export const focusReady = (id) =>
  new Promise((resolve) => {
    waiters.push({ id, resolve })
    flush()
  })
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__photoFocusPending = () => pending
  window.__photoFocusFor = (id) => shown === id && !pending
}

// A stop's view (focusView) past the visitor's own range: turned or tilted past the look's range, or moved in past it
// (radians and the dolly, as the camera's target holds them).
export const pastRange = (view, { yawMax, pitchMax, dollyMax }) => Math.abs(view.yaw) > yawMax + 1e-9 || Math.abs(view.pitch) > pitchMax + 1e-9 || view.dolly < 0 || view.dolly > dollyMax
// The view Step back eases to from a stop's view: the view at rest where the room asks for it (place.stepBackToRest,
// owner decision 2026-11-04: Prague only) and the stop's view lies past the range; else null, and the camera stays
// where it is (every other room, as before fix round 10: Einstein's and Lamarr's arrivals on a phone stay tilted).
export function stepBackView(view, range, rest, toRest) {
  if (!toRest || !pastRange(view, range)) return null
  return { yaw: rest.yaw, pitch: rest.pitch, dolly: 0 }
}

export function solvePhotoCamera(photo) {
  const { crop, camera, solve } = photo
  const f = crop.h / 2 / Math.tan(D2R(camera.fovDeg / 2))
  const pitch = Math.atan((crop.y + crop.h / 2 - solve.horizonRow) / f)
  const cam = new THREE.PerspectiveCamera(camera.fovDeg, crop.w / crop.h, 1, 6000)
  cam.position.set(0, 1, 0)
  cam.rotation.set(-pitch, 0, 0)
  cam.updateMatrixWorld(true)
  const a = ground(cam, crop, ...solve.from)
  const b = ground(cam, crop, ...solve.to)
  return { pitchDeg: THREE.MathUtils.radToDeg(pitch), height: solve.length / a.distanceTo(b) }
}

export function photoCamera(photo) {
  const { crop, camera } = photo
  const cam = new THREE.PerspectiveCamera(camera.fovDeg, crop.w / crop.h, 1, 6000)
  cam.position.set(0, camera.height, 0)
  cam.rotation.set(-D2R(camera.pitchDeg), 0, 0)
  cam.updateMatrixWorld(true)
  cam.updateProjectionMatrix()
  return cam
}

function pixelRay(cam, crop, u, v) {
  const nx = ((u - crop.x) / crop.w) * 2 - 1
  const ny = -(((v - crop.y) / crop.h) * 2 - 1)
  return new THREE.Vector3(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize()
}

// the point on the projector's ray through pixel (u, v) at depth z (a plane facing the camera)
export function pointAtDepth(cam, crop, u, v, z) {
  const d = pixelRay(cam, crop, u, v)
  return cam.position.clone().addScaledVector(d, (z - cam.position.z) / d.z)
}

// where pixel (u, v) meets the horizontal plane at height y
export function ground(cam, crop, u, v, y = 0) {
  const d = pixelRay(cam, crop, u, v)
  return cam.position.clone().addScaledVector(d, (y - cam.position.y) / d.y)
}

function box(cam, crop, l) {
  const { beam, top, bottom = 0, inset = 0 } = l
  const [from, to] = l.cut || [0, 1]
  const A = ground(cam, crop, ...l.from)
  const B = ground(cam, crop, ...l.to)
  const dir = B.clone().sub(A)
  const len = dir.length()
  dir.normalize()
  const n = new THREE.Vector3(dir.z, 0, -dir.x)
  if (n.dot(A.clone().sub(cam.position).setY(0)) < 0) n.negate()
  const position = A.clone()
    .addScaledVector(dir, len * (from + to) * 0.5)
    .addScaledVector(n, inset + beam / 2)
  position.y = (top + bottom) / 2
  const m = new THREE.Matrix4().makeBasis(dir, new THREE.Vector3(0, 1, 0), n)
  return { id: l.id, mask: l.mask, position, quaternion: new THREE.Quaternion().setFromRotationMatrix(m), size: [len * (to - from), top - bottom, beam] }
}

function card(cam, crop, l) {
  const g = ground(cam, crop, ...l.at)
  const toCam = cam.position.clone().sub(g).setY(0).normalize()
  const dist = g.clone().sub(cam.position).setY(0).length()
  return {
    id: l.id,
    mask: l.mask,
    position: new THREE.Vector3(g.x, l.y, g.z),
    quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam),
    size: [dist * l.width, l.height],
  }
}

export function photoLayout(photo) {
  const cam = photoCamera(photo)
  const { crop } = photo
  const boxes = photo.layers.filter((l) => l.kind === 'box').map((l) => box(cam, crop, l))
  const cards = photo.layers.filter((l) => l.kind === 'card').map((l) => card(cam, crop, l))
  const far = -ground(cam, crop, crop.x + crop.w / 2, photo.backdropRow).z
  const pivotOf = [...boxes, ...cards].find((b) => b.id === photo.look.pivot)
  const pivot = pivotOf ? pivotOf.position.clone().setY(0) : new THREE.Vector3(0, 0, -far / 2)
  const hfov = 2 * Math.atan(Math.tan(D2R(photo.camera.fovDeg / 2)) * (crop.w / crop.h))
  const projVP = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
  return { cam, projVP, boxes, cards, far, pivot, hfov, pitch: D2R(photo.camera.pitchDeg) }
}

// the lens for a photograph on this screen (vertical, degrees): the narrower of the photo's two angles, times the
// photograph's lens share for this device (photo.lens: { desktop?, phone? }; default 0.96 on a desktop, 0.94 on a phone)
export function photoFov(photo, layout, size, phone) {
  const aspect = size.width / Math.max(size.height, 1)
  const fit = 2 * THREE.MathUtils.radToDeg(Math.atan(Math.tan(layout.hfov / 2) / aspect))
  return Math.min(photo.camera.fovDeg, fit) * (photo.lens?.[phone ? 'phone' : 'desktop'] ?? (phone ? 0.94 : 0.96))
}

// The visitor's frame, in screen terms (NDC: -1..1 across and up the screen): how tall the guide looks
// (her whole figure), where her feet are, how far across she stands, and the top of the viewing rail.
// On a phone her upper body stays above the HUD (the caption's top is near -0.36); on a desktop she
// stands clear of the caption and the corner buttons, her feet on the foot of the frame.
const FRAME = {
  desktop: { height: 0.95, feet: -0.88, x: 0.5, rail: -0.84 },
  desktopRight: { height: 0.9, feet: -0.72, x: 0.66, rail: -0.68 },
  // a phone's rail sits at her feet, under the caption, unless records lie on it (then above the caption)
  phone: { height: 0.62, feet: -0.64, x: 0.56, rail: -0.6, railWithRecords: -0.36 },
}
const FIGURE_H = 1.86 // her height with her hair, metres
// The frame's heights are the page's (the HUD lies over the page): in a photo room with a band (place.hudBand) the
// canvas starts below it, and the guide and the rail keep their places on the page, so she stays clear of the caption
// and the bottom bar as in every other room. page: { top, pageHeight } in CSS px when the canvas starts below the page's
// top (its height runs to the page's foot), else null (the frame as it is).
function onCanvas(f, page) {
  if (!page || !(page.top > 0)) return f
  const h = page.pageHeight - page.top
  const y = (ndc) => 1 - (2 * (((1 - ndc) / 2) * page.pageHeight - page.top)) / h
  const out = { ...f, height: (f.height * page.pageHeight) / h, feet: y(f.feet), rail: y(f.rail) }
  if (f.railWithRecords != null) out.railWithRecords = y(f.railWithRecords)
  return out
}
export function visitorFrame(photo, fovDeg, aspect, phone, railRecords = false, page = null) {
  const T = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  const sideX = phone ? (photo.guide?.xPhone ?? -0.55) : (photo.guide?.x ?? -0.7)
  const side = sideX > 0 ? 1 : -1
  const f = onCanvas(phone ? FRAME.phone : side > 0 ? FRAME.desktopRight : FRAME.desktop, page)
  const dg = FIGURE_H / (f.height * T) // her distance from the eye
  const dr = dg + 0.9 // the rail's, just behind her
  const at = (ndcX, ndcY, d) => [ndcX * d * T * aspect, ndcY * d * T, -d]
  // how far out from the middle she stands (NDC): the frame's, or a photograph's own on a desktop (photo.guide.across:
  // further out where a wide subject needs the room she would take pointing at it)
  const across = (!phone && photo.guide?.across) || f.x
  return {
    side,
    T,
    phone,
    // where she stands across the screen (NDC), and her feet and the top of her head (NDC)
    guideNdcX: side * across,
    guideNdcY: [f.feet, f.feet + f.height],
    guide: at(side * across, f.feet, dg),
    rail: { d: dr, y: (railRecords && f.railWithRecords ? f.railWithRecords : f.rail) * dr * T, halfW: dr * T * aspect, scale: dr / 4 },
    // the rail records lie on the other side of the frame from her
    railX: -side * 0.4 * dr * T * aspect,
  }
}

// Where a rail record rises to on a desktop (in the foreground's eye space) and its size there: centred
// when it fits, else moved away from the guide and, if it must, made smaller, so it never covers her
// figure or the hand she points with (round 9: the Madrid photograph covered half of her). w is the
// record's width in metres at its own size; d its distance from the eye.
export const RAISED_CLEAR = 0.16 // NDC kept clear inside her centre line: her half-width and her hand
// On a phone (round 9 fix round 7b; it used to rise at a fixed spot, and a wide record ran past the screen's edge):
// opts.clear is her half-width there (RAIL_CLEAR.phone), and opts.h with opts.bottom keep its foot above the records
// and badges on the rail (NDC), making it smaller if it must.
export function raisedRecordAt(frame, aspect, w, d = 1.55, y = 0.02, opts = {}) {
  const W = d * frame.T * aspect // half the screen's width in metres at that distance
  const far = 0.92 // the screen edge it may reach on her other side (NDC)
  const lo = Math.abs(frame.guideNdcX) - (opts.clear ?? RAISED_CLEAR) // its nearest edge to her, as distance past centre
  const span = far + lo
  let half = w / 2 / W
  let scale = Math.min(1, span / (2 * half))
  if (opts.h && opts.bottom != null) scale = Math.min(scale, Math.max(0.1, (2 * (y - opts.bottom * d * frame.T)) / opts.h))
  half = (w / 2 / W) * scale
  // centre in "away from her" terms: 0 when it fits, moved over as far as it must
  const u = Math.max(0, half - lo)
  return { pos: [-frame.side * u * W, y, -d], scale }
}

// Where the rail records lie at rest (eye-space x of each, and their scale), first stop nearest her: on
// the far side of the frame from her, never across her figure or the hand she points with (round 9 fix
// round 1: on a phone the Bismarck tribune lay over her), made smaller only if they must. Centred where
// they used to lie (0.4 of the half-width out) when that is clear of her.
export const RAIL_SLOT = 0.55 // metres per record on the rail at scale 1 (a record is at most this wide)
export const RAIL_CLEAR = { phone: 0.3, desktop: 0.16 } // NDC kept clear inside her centre line
export function railLayout(frame, aspect, n) {
  const k = frame.rail.scale
  const side = -frame.side // the records' side of the screen
  const W = (frame.rail.d - 0.3) * frame.T * aspect // half the screen's width at the records' depth
  const u0 = -(Math.abs(frame.guideNdcX) - (frame.phone ? RAIL_CLEAR.phone : RAIL_CLEAR.desktop))
  const u1 = 0.92
  const slot = (RAIL_SLOT * k) / W // a record's slot, in NDC
  const s = Math.min(1, (u1 - u0) / (n * slot))
  const halfG = (n * slot * s) / 2
  const was = (side * frame.railX) / W - ((n - 1) / 2) * slot // the group's old centre
  const uc = Math.min(u1 - halfG, Math.max(u0 + halfG, was))
  const xs = Array.from({ length: n }, (_, i) => side * (uc + (i - (n - 1) / 2) * slot * s) * W)
  return { xs, scale: k * s }
}
