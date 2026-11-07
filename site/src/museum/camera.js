// Visitor camera helpers: the lens, the room interior the eye is held in, and where to stand in
// front of an exhibit. The camera itself turns in place at viewing stations (stationcam.js).
import { Box3, Vector3 } from 'three';

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EYE_HEIGHT = 1.6;
// The eye keeps at least this distance (m) from every wall, the floor and the ceiling.
export const VIEW_MARGIN = 0.3;
// Distance (m) a visitor stands from an exhibit when flown to it.
export const STANDOFF = 1.6;

// Lens (real-scan museum spec, Camera; REF-tapestry-v2 section 7.2): 75 degrees vertical on a 16:9
// screen. A narrower screen keeps the 16:9 horizontal field (107.5 degrees) and derives the vertical
// field from it, capped at MAX_FOV; a wider one keeps the base vertical field.
export const BASE_FOV = 75;
export const MAX_FOV = 95;
export const REF_ASPECT = 16 / 9;
// No longer a lens input; the floor every screen down to a 0.6 aspect still sees across (tests).
export const MIN_HFOV = 55;
const rad = d => (d * Math.PI) / 180, deg = r => (r * 180) / Math.PI;
export const horizontalFov = (fov, aspect) => deg(2 * Math.atan(Math.tan(rad(fov) / 2) * aspect));
export function fovFor(aspect) {
  if (!(aspect > 0) || aspect >= REF_ASPECT) return BASE_FOV;
  const h = rad(horizontalFov(BASE_FOV, REF_ASPECT));
  return Math.min(MAX_FOV, Math.max(BASE_FOV, deg(2 * Math.atan(Math.tan(h / 2) / aspect))));
}

// Box the eye may occupy in a room of w x d x h metres centred on the origin, floor at y = 0.
export function roomInterior({ w, d, h }) {
  return new Box3(
    new Vector3(-w / 2 + VIEW_MARGIN, VIEW_MARGIN, -d / 2 + VIEW_MARGIN),
    new Vector3(w / 2 - VIEW_MARGIN, h - VIEW_MARGIN, d / 2 - VIEW_MARGIN),
  );
}

// Where to stand to look at an exhibit at `pos` facing `normal`: `standoff` metres out at eye
// height, clamped to the interior box.
export function standPoint(pos, normal, box, standoff = STANDOFF) {
  const eye = pos.clone().add(normal.clone().setY(0).normalize().multiplyScalar(standoff));
  eye.y = EYE_HEIGHT;
  return box ? box.clampPoint(eye, eye) : eye;
}
