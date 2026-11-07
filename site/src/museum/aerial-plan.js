// Pure planning for the aerial zoom (aerial.js): camera paths, quad sizes and the per-level opacity
// schedule. No three.js, no DOM, so vitest can check it. Units: the globe has radius 1; ground
// sizes and altitudes are metres; directions are unit vectors from the globe's centre.
export const R_EARTH = 6371008.8; // mean Earth radius (m): one globe unit
export const ZOOM_MS = 4000;      // globe -> building
export const OUT_MS = 2400;       // building -> globe
export const FADE_MS = 600;       // reduced motion: a fade instead of any camera move
export const FILL = 0.7;          // the end view shows this share of the building image (its soft edge stays out of sight)
const TURN = 0.4;                 // share of the zoom spent turning the globe to the pin

const clamp01 = t => Math.max(0, Math.min(1, t));

// Side of a ground-square image as a quad on a globe of `radius` (tangent plane, small extent).
export const quadSize = (extentM, radius = 1) => (extentM / R_EARTH) * radius;
export const altitudeOf = dist => (dist - 1) * R_EARTH;
export const distanceOf = alt => 1 + alt / R_EARTH;

// Cubic ease in and out, clamped.
export function ease(t) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Altitude on a log scale: equal time for each tenfold change, so the city, street and building
// levels each get a similar share of the dolly.
export const logLerp = (a0, a1, k) => Math.exp(Math.log(a0) + (Math.log(a1) - Math.log(a0)) * k);

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function slerp(p, q, k) {
  const omega = Math.acos(Math.max(-1, Math.min(1, dot(p, q))));
  if (omega < 1e-9) return [...q];
  const s = Math.sin(omega), a = Math.sin((1 - k) * omega) / s, b = Math.sin(k * omega) / s;
  const v = [a * p[0] + b * q[0], a * p[1] + b * q[1], a * p[2] + b * q[2]];
  const l = Math.hypot(...v) || 1;
  return v.map(c => c / l);
}

// Zoom in at time t (0..1): the globe turns to the pin during the first 40 %, while the camera
// dollies from altitude a0 to a1 on a log scale with an ease in and out.
export function zoomPose(t, { from, to, a0, a1 }) {
  return { dir: slerp(from, to, ease(clamp01(t) / TURN)), alt: logLerp(a0, a1, ease(t)) };
}

// Flight between two pins at globe distance d0 -> d1 along the great circle, rising by
// lift * angle at the middle so a long hop shows more of the globe.
export function arcPose(t, p, q, d0, d1 = d0, lift = 0.35) {
  const k = ease(t), omega = Math.acos(Math.max(-1, Math.min(1, dot(p, q))));
  return { dir: slerp(p, q, k), dist: d0 + (d1 - d0) * k + lift * omega * Math.sin(Math.PI * k) };
}
export const arcMs = (p, q) => Math.min(3000, 1200 + 900 * Math.acos(Math.max(-1, Math.min(1, dot(p, q)))));

// Ground span (m) the camera sees looking straight down from `alt`: the larger of width and height.
// `frame` is the projection shift globe.setFrame applies while the stop card covers part of the
// stage; it pushes the far edge of the view out by 2 * shift.
export function viewSpan(alt, fovDeg, aspect, frame = { x: 0, y: 0 }) {
  const half = alt * Math.tan((fovDeg * Math.PI) / 360);
  return 2 * Math.max(half * aspect * (1 + 2 * Math.abs(frame.x || 0)), half * (1 + 2 * Math.abs(frame.y || 0)));
}

// Altitude at which the view spans `fill` of a level's extent.
export const fitAltitude = (extentM, fovDeg, aspect, frame, fill = FILL) => (fill * extentM) / viewSpan(1, fovDeg, aspect, frame);

const ramp = (span, hi, lo) => {
  const k = clamp01((hi - span) / (hi - lo));
  return k * k * (3 - 2 * k);
};

// Opacity of each level's image and labels when the view spans `span` metres. levels: widest first,
// [{ extent, labels: has a label overlay, ok: loaded }]. An image fades in as the view closes from
// 3 to 1.3 times its extent and then stays (the next level covers it, feathered at its edges).
// Labels fade in from 1.6 to 1.05 times the extent and hand over to the next labelled level as that
// one fades in, so two scales of street names never show at once. A level that failed stays at 0.
export function levelOpacities(span, levels) {
  const labelIn = levels.map(l => (l.ok && l.labels ? ramp(span, 1.6 * l.extent, 1.05 * l.extent) : 0));
  return levels.map((l, i) => {
    if (!l.ok) return { image: 0, labels: 0 };
    const j = levels.findIndex((m, k) => k > i && m.ok && m.labels);
    return { image: ramp(span, 3 * l.extent, 1.3 * l.extent), labels: labelIn[i] * (j === -1 ? 1 : 1 - labelIn[j]) };
  });
}

// Index of the closest level that loaded, or -1 when none did.
export function deepestLevel(levels) {
  for (let i = levels.length - 1; i >= 0; i--) if (levels[i].ok) return i;
  return -1;
}

// Credit wording from the manifest, with "(c)" shown as the copyright sign.
export const creditText = text => String(text).replace(/\(c\)/gi, '©');

// Where the zoom ends (index into the levels, widest first). 'building': the closest level. Any
// other precision ('city'): the neighbourhood, the closest level at least NEIGHBOURHOOD_M wide, so
// the view never implies a building the verified fact does not name.
export const NEIGHBOURHOOD_M = 1000;
export function endLevel(extents, precision) {
  if (precision === 'building') return extents.length - 1;
  let k = 0;
  extents.forEach((e, i) => { if (e >= NEIGHBOURHOOD_M) k = i; });
  return k;
}
