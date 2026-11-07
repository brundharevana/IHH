// "Look closer" scales the photograph by ZOOM; while zoomed the visitor pans it (drag, touch drag,
// the arrow keys, the pan buttons). The pan is held in the viewer's state as [x, y], each -1..1 of
// the room the zoomed picture has past the stage's edges on that axis (panRange), so an edge of the
// photograph never comes inside the stage. +x shows more of the left of the picture, +y more of its top.
export const ZOOM = 1.8
// the scale "Look closer" uses: ZOOM, or more for a tall picture in a wide stage, so the zoomed picture
// always fills the stage's width (a portrait in a short viewer would otherwise stay narrower than it)
// never more than ZOOM_MAX: a very thin, tall picture would otherwise zoom without bound
export const ZOOM_MAX = 4
export const zoomFor = (stage, picture) => (stage && picture?.w ? Math.max(ZOOM, Math.min(ZOOM_MAX, stage.w / picture.w)) : ZOOM)
export const PAN_STEP = 0.25
export const clampPan = (v) => Math.max(-1, Math.min(1, v))
// how far (CSS px) the zoomed picture can move each way before an edge shows: the scaled picture's
// overhang past the stage, half on each side (0 when it fits)
export function panRange(stage, picture, zoom = ZOOM) {
  return [Math.max(0, (picture.w * zoom - stage.w) / 2), Math.max(0, (picture.h * zoom - stage.h) / 2)]
}

// an arrow key while zoomed: ArrowLeft shows more of the left of the picture, ArrowUp more of its top
const KEY_PAN = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }
export const isPanKey = (key) => key in KEY_PAN
export function panByKey(pan = [0, 0], key, step = PAN_STEP) {
  const d = KEY_PAN[key]
  return d ? [clampPan(pan[0] + d[0] * step), clampPan(pan[1] + d[1] * step)] : pan
}

// A 3D object's zoom (stages.jsx ZoomRig): distances as shares of the whole-object view's (the
// distance drei Bounds fits it at, margin 1.25); each step moves 28 % closer or back, within the limits.
export const MODEL_ZOOM = { step: 0.72, near: 0.3, far: 1.8 }
export function fitDistance(size, fovDeg, aspect, margin = 1.25) {
  const m = Math.max(size.x, size.y, size.z)
  const h = m / (2 * Math.atan((Math.PI * fovDeg) / 360))
  return margin * Math.max(h, h / aspect)
}
export const zoomTo = (d, dir, base) => Math.min(base * MODEL_ZOOM.far, Math.max(base * MODEL_ZOOM.near, d * (dir > 0 ? MODEL_ZOOM.step : 1 / MODEL_ZOOM.step)))

// + and - zoom a 3D record in the viewer (1 in, -1 out, 0 neither); never with Ctrl, Cmd or Alt held, which
// are the browser's own zoom (round 9 fix round 1: the viewer blocked page zoom, an accessibility regression)
export function modelZoomKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return 0
  if (e.key === '+' || e.key === '=') return 1
  if (e.key === '-' || e.key === '_') return -1
  return 0
}

// A zoom press on a 3D record (stages.jsx ZoomRig). Before the object is in and sized (base 0) the press waits
// in a queue (Codex review, round 9: a press made while the model loaded was dropped); once it is sized,
// zoomReady applies the waiting presses in order. s: { base, goal, queued }; d: the camera's distance now.
export function zoomPress(s, dir, d) {
  if (!s.base) {
    s.queued = [...(s.queued || []), dir]
    return s
  }
  s.goal = zoomTo(s.goal ?? d, dir, s.base)
  return s
}
export function zoomReady(s, d) {
  const q = s.queued || []
  s.queued = []
  for (const dir of q) s.goal = zoomTo(s.goal ?? d, dir, s.base)
  return s
}

// A sheet (letter, sheet, document page) is seen whole when the viewer opens (fix round 12, owner report: a newspaper's
// scan was cut off at the top in a 1000 x 570 window): the camera's distance at which every corner of a w x h sheet,
// turned as the viewer first holds it (rot: [x, y] radians, three's XYZ order), lies inside the stage less `reserve`
// CSS px on each side (x: left and right; y: top and bottom, where the hint and a page's pager sit). W x H: the stage
// in CSS px; fovDeg: the camera's vertical lens. The camera looks along -z at the sheet's centre.
export function sheetFitDistance({ w, h }, fovDeg, W, H, reserve = { x: 0, y: 0 }, rot = [0, 0]) {
  const t = Math.tan((Math.PI * fovDeg) / 360)
  const aspect = W / Math.max(1, H)
  const mx = Math.max(0.2, 1 - (2 * reserve.x) / Math.max(1, W))
  const my = Math.max(0.2, 1 - (2 * reserve.y) / Math.max(1, H))
  const [rx, ry] = rot
  let d = 0
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) {
      const x0 = (sx * w) / 2
      const y0 = (sy * h) / 2
      const x1 = x0 * Math.cos(ry)
      const z1 = -x0 * Math.sin(ry)
      const y2 = y0 * Math.cos(rx) - z1 * Math.sin(rx)
      const z2 = y0 * Math.sin(rx) + z1 * Math.cos(rx)
      d = Math.max(d, z2 + Math.abs(x1) / (mx * t * aspect), z2 + Math.abs(y2) / (my * t))
    }
  return d
}
