// Station camera ("drag to look around"; real-scan museum spec, Camera; REF-tapestry-v2 section 7.2,
// our own code from those numbers). The visitor stands at a viewing station and turns in place: a
// drag changes yaw and pitch, never the eye; there is no zoom. The turn is damped (DAMPING per 60 fps
// frame, scaled to the real frame time) and the pitch held to the station's range. Moving to another
// station, or turning to face an exhibit, glides GLIDE_MS with an ease-out sine, eye and look target
// lerped together; under reduced motion every move is a FADE_MS fade to dark with a cut at its middle.
//
// A station: { id, position: [x, y, z], look: [x, y, z], pitch?: [minDeg, maxDeg], lookAround?: bool }.
// Time comes from `now` (performance.now by default) and the caller's loop calls update(): the camera
// changes only there, so a slow GPU shows fewer frames of the same glide instead of falling behind.
import { Vector3, PerspectiveCamera, Box3 } from 'three';
import { fovFor, reducedMotion as prefersReducedMotion, EYE_HEIGHT } from './camera.js';
import { frameWall, visibleBox, verticalExtent, aimY, groupDistance, lensFor, freeBand, FRAMING, FOCUS, RING_WORLD, RING_DRAWN } from './framing.js';
import { wallT } from './layout.js';
import { RING } from './rings.js';

// Order along a wall as the visitor facing it reads it, left to right. A group that is not a room
// wall (easels in a scanned room) is read along the right-hand direction of a visitor facing its
// exhibits (exhibits facing `normal`: right = (normal.z, 0, -normal.x)).
const WALL_NAMES = new Set(['north', 'east', 'south', 'west']);
const wallOrder = (wall, p, normal) => (WALL_NAMES.has(wall) ? wallT(wall, p.x, p.z) : p.x * normal.z - p.z * normal.x);

export const DAMPING = 0.08;
// Turn per pixel of drag: ROTATE_SPEED x 2 pi per canvas height (0.16 degrees per px at 900 px).
// The scene follows the finger, as in panorama viewers.
export const ROTATE_SPEED = 0.4;
// Elevation limits in degrees: the ceiling and floor stay readable (fix round 1; REF 7.2's polar
// 0.35 to 2.6 rad, -59 to 70, let a visitor look straight at the ceiling).
export const DEFAULT_PITCH = Object.freeze([-35, 30]);
export const GLIDE_MS = 1600;
export const FADE_MS = 300;
export const stationFov = fovFor;
export const easeOutSine = t => Math.sin((Math.min(1, Math.max(0, t)) * Math.PI) / 2);

const D2R = Math.PI / 180;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const clampPitch = (pitch, range = DEFAULT_PITCH) => clamp(pitch, range[0] * D2R, range[1] * D2R);
// Yaw 0 looks down -z; positive yaw turns left (towards -x).
export const dirOf = (yaw, pitch) => [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
export function anglesOf(d) {
  const l = Math.hypot(d[0], d[1], d[2]) || 1;
  return { yaw: Math.atan2(-d[0], -d[2]), pitch: Math.asin(clamp(d[1] / l, -1, 1)) };
}
const v3 = a => (Array.isArray(a) ? new Vector3(a[0], a[1], a[2]) : a.clone());

export function createStationCamera(camera, dom, opts = {}) {
  const {
    now = () => performance.now(), reducedMotion = prefersReducedMotion, overlay = null,
    onDragStart = null, onInput = null, onTurn = null,
  } = opts;
  const pos = camera.position.clone();
  let { yaw, pitch } = anglesOf(camera.getWorldDirection(new Vector3()).toArray());
  let range = DEFAULT_PITCH, station = null;
  const pending = { yaw: 0, pitch: 0 };
  let last = null, drag = null, anim = null;

  const apply = () => {
    const d = dirOf(yaw, pitch);
    camera.position.copy(pos);
    camera.lookAt(pos.x + d[0], pos.y + d[1], pos.z + d[2]);
    camera.updateMatrixWorld();
  };
  const settle = (to, ok) => {
    pos.copy(to.pos);
    ({ yaw, pitch } = anglesOf(to.target.clone().sub(to.pos).toArray()));
    range = to.range; station = to.station;
    apply();
    if (to.resolve) to.resolve(ok);
  };
  const setOverlay = o => { if (overlay) overlay.style.opacity = String(o); };
  const cancel = () => {
    if (!anim) return;
    const a = anim; anim = null;
    setOverlay(0);
    if (a.to.resolve) a.to.resolve(false);
  };

  function goTo(st, { instant = false, look = null } = {}) {
    cancel();
    pending.yaw = 0; pending.pitch = 0;
    const to = { pos: v3(st.position), target: v3(look || st.look), range: st.pitch || DEFAULT_PITCH, station: st };
    if (instant) { settle(to, true); return Promise.resolve(true); }
    const from = { pos: pos.clone(), target: pos.clone().add(new Vector3(...dirOf(yaw, pitch))) };
    return new Promise(resolve => {
      to.resolve = resolve;
      anim = reducedMotion() ? { kind: 'fade', t0: now(), to, cut: false } : { kind: 'glide', t0: now(), from, to };
      if (onInput) onInput();
    });
  }

  // Returns true when the camera changed.
  function update() {
    const t = now();
    if (anim && anim.kind === 'glide') {
      const p = Math.min(1, (t - anim.t0) / GLIDE_MS), e = easeOutSine(p), { from, to } = anim;
      if (p >= 1) { anim = null; settle(to, true); return true; }
      pos.lerpVectors(from.pos, to.pos, e);
      const target = from.target.clone().lerp(to.target, e);
      ({ yaw, pitch } = anglesOf(target.sub(pos).toArray()));
      apply();
      return true;
    }
    if (anim && anim.kind === 'fade') {
      const p = Math.min(1, (t - anim.t0) / FADE_MS);
      if (p >= 0.5 && !anim.cut) { anim.cut = true; const { resolve, ...rest } = anim.to; settle(rest, true); anim.to.resolve = resolve; }
      if (p >= 1) { const r = anim.to.resolve; anim = null; setOverlay(0); r(true); return true; }
      setOverlay(p < 0.5 ? p * 2 : (1 - p) * 2);
      return true;
    }
    if (!pending.yaw && !pending.pitch) { last = t; return false; }
    const dt = clamp(last === null ? 1 / 60 : (t - last) / 1000, 0, 0.05);
    last = t;
    const f = 1 - Math.pow(1 - DAMPING, dt * 60);
    yaw += pending.yaw * f; pending.yaw *= 1 - f;
    const p0 = pitch;
    pitch = clampPitch(pitch + pending.pitch * f, range);
    pending.pitch = pitch === p0 + pending.pitch * f ? pending.pitch * (1 - f) : 0; // stop at the limit
    if (Math.abs(pending.yaw) < 1e-6) pending.yaw = 0;
    if (Math.abs(pending.pitch) < 1e-6) pending.pitch = 0;
    apply();
    return true;
  }

  // Pointer: one finger or the main mouse button turns the view; other pointers are ignored.
  const down = e => {
    if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    if (dom.setPointerCapture) { try { dom.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ } }
    if (onDragStart) onDragStart();
  };
  const move = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (anim || (!dx && !dy)) return; // a glide owns the camera until it lands
    const k = (2 * Math.PI * ROTATE_SPEED) / Math.max(1, dom.clientHeight);
    if (!pending.yaw && !pending.pitch) last = now();
    pending.yaw += dx * k; pending.pitch += dy * k;
    if (onInput) onInput();
    if (onTurn) onTurn(); // the visitor turned the view (the narration follow holds off: follow.js)
  };
  const up = e => { if (drag && e.pointerId === drag.id) drag = null; };
  dom.addEventListener('pointerdown', down);
  dom.addEventListener('pointermove', move);
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);
  // Capture lost (the element went inert under the panel, the pointer left the window): the drag ends.
  dom.addEventListener('lostpointercapture', up);
  apply();

  return {
    goTo,
    // Turn in place to face `point` (a glide, or the fade under reduced motion).
    lookAt: (point, o = {}) => goTo({ ...(station || {}), position: pos.toArray(), look: point, pitch: range }, o),
    // Hard set of the eye and gaze (door walk frames, restoring a pose): no transition.
    setPose: (eye, target) => goTo({ ...(station || {}), position: eye, look: target, pitch: range }, { instant: true }),
    // Take `st` as the current station without moving the eye or the gaze (a reflow framed it anew
    // while the visitor looked elsewhere; see reframeAction).
    adopt: st => { station = st; range = st.pitch || DEFAULT_PITCH; },
    update,
    isMoving: () => Boolean(anim || drag || pending.yaw || pending.pitch),
    dragging: () => Boolean(drag),
    station: () => station,
    pose: () => ({ position: pos.toArray(), yaw, pitch }),
    dispose() {
      cancel();
      dom.removeEventListener('pointerdown', down);
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerup', up);
      dom.removeEventListener('pointercancel', up);
      dom.removeEventListener('lostpointercapture', up);
    },
  };
}

// After a resize frames the stations anew: 'reframe' (step to the station's new place and view) only
// for a visitor at rest who still looks along the station's view (within REFRAME_TOL radians);
// 'adopt' (keep the eye and gaze, update the station record) for one who has turned away or faces an
// exhibit; 'none' while moving or away from any station. `dir` is the camera's view direction.
export const REFRAME_TOL = 1 * D2R;
export function reframeAction({ at, next, dir, moving }) {
  if (moving || !at || !next) return 'none';
  const look = [at.look[0] - at.position[0], at.look[1] - at.position[1], at.look[2] - at.position[2]];
  const ll = Math.hypot(...look) || 1, dl = Math.hypot(...dir) || 1;
  const cos = (look[0] * dir[0] + look[1] * dir[1] + look[2] * dir[2]) / (ll * dl);
  return Math.acos(clamp(cos, -1, 1)) <= REFRAME_TOL ? 'reframe' : 'adopt';
}

// Viewing stations of a built room (Task 4 fix round 1): framed per exhibit group for the canvas
// `aspect` and height `canvasH` (framing.js), recomputed when the canvas changes shape. A wall's
// exhibits are split into groups in wall order; the station of a group stands in front of it at eye
// height, inside the room, looking at its middle. The room opens on the station of the first exhibit
// the narration names (or the lowest-numbered one). Chapter JSON may add `stations` of its own
// (validated by tools/content_check.py); an exhibit's `station` names the one it is seen from.
// A room without exhibits opens on its stored establishing view `start`.
// -> { stations, stationOf: Map exhibitId -> station, anchors: Map exhibitId -> { anchor, look, own },
// opening }: anchors are the ring anchors (the number disc, lifted off the exhibit and raised).
export const RING_LIFT = 0.1;
// ...and raised this far above the number disc, so a ring near its station clears the frame top.
export const RING_RAISE = 0.12;
export function roomStations({ start = null, exhibitMeshes, interior = null, exhibits = [], authored = [], narration = [], aspect = 16 / 9, canvasH = 630, scene = null, bands = null, reserved = [], occluders = null, focusBands = bands }) {
  const anchors = new Map(), walls = new Map(), items = new Map();
  for (const ex of exhibits) {
    const g = exhibitMeshes.get(ex.id);
    if (!g) continue;
    g.updateWorldMatrix(true, true);
    const centre = g.getWorldPosition(new Vector3());
    const q = g.getWorldQuaternion(g.quaternion.clone());
    const normal = new Vector3(0, 0, 1).applyQuaternion(q).setY(0).normalize();
    const disc = g.getObjectByName('number-disc');
    const anchor = (disc ? disc.getWorldPosition(new Vector3()) : centre.clone().setY(centre.y + 0.5)).addScaledVector(normal, RING_LIFT);
    anchor.y += RING_RAISE;
    const box = visibleBox(g);
    anchors.set(ex.id, { anchor, look: box.getCenter(new Vector3()).toArray(), own: g, box });
    const wall = ex.wall || g.userData.wall || 'wall';
    if (!walls.has(wall)) walls.set(wall, []);
    const item = { id: ex.id, box, normal, ring: anchor, t: wallOrder(wall, centre, normal), owner: topOf(g), wall };
    walls.get(wall).push(item); items.set(ex.id, item);
  }
  // The wall's title panel joins its first group when the frame has room for it.
  const panel = scene && scene.getObjectByName('text-panel');
  const stations = [], byExhibit = new Map();
  for (const [wall, items] of walls) {
    items.sort((a, b) => a.t - b.t);
    const extra = panel && items.length && Math.abs(new Vector3(0, 0, 1).applyQuaternion(panel.getWorldQuaternion(panel.quaternion.clone())).dot(items[0].normal) - 1) < 1e-3
      ? [visibleBox(panel)] : [];
    // A scene object framed with this group (the study corner beside its photographs: userData.frameGroup).
    if (scene) for (const o of scene.children) if (o.userData && o.userData.frameGroup === wall) extra.push(visibleBox(o));
    frameWall(items, { aspect, canvasH, interior, extra, bands }).forEach((f, k) => {
      const st = { id: `${wall}-${k + 1}`, position: f.position, look: f.look };
      stations.push(st);
      for (const id of f.ids) {
        byExhibit.set(id, st);
        // Turning to one exhibit of the group keeps it (and its ring) in the free band (the frame) too.
        const a = anchors.get(id), c = a.box.getCenter(new Vector3());
        a.look = [c.x, aimY(verticalExtent([a.box], [a.anchor]), new Vector3(...f.position).distanceTo(c), f.lens, f.band), c.z];
      }
    });
  }
  for (const s of authored || []) {
    const st = { id: s.id, position: [...s.position], look: [...s.look], ...(s.pitch ? { pitch: [...s.pitch] } : {}), ...(s.lookAround === false ? { lookAround: false } : {}) };
    const i = stations.findIndex(x => x.id === st.id);
    if (i >= 0) stations[i] = st; else stations.push(st);
  }
  const stationOf = new Map();
  for (const ex of exhibits) {
    const own = byExhibit.get(ex.id);
    if (!own) continue;
    stationOf.set(ex.id, (ex.station && stations.find(s => s.id === ex.station)) || stations.find(s => s.id === own.id));
  }
  let first = null;
  for (const l of narration || []) { for (const id of l.reveals || []) if (stationOf.has(id)) { first = id; break; } if (first) break; }
  if (!first) first = [...exhibits].filter(e => stationOf.has(e.id)).sort((a, b) => a.number - b.number).map(e => e.id)[0] || null;
  let opening = first ? stationOf.get(first) : null;
  if (!opening && start) { opening = { id: 'start', position: [...start.eye], look: [...start.target] }; stations.push(opening); }
  if (opening) stations.splice(stations.indexOf(opening), 1), stations.unshift(opening);
  // Close views for the narration (follow.js): target { ids, area? } -> a station framing exactly
  // those exhibits (and the scene object standing in `area`, the recreated study corner, with the
  // exhibits of the easel group it is framed with, userData.frameGroup) inside the free band
  // focusBands leaves (the stage's controls, on every screen), memoised for this canvas shape. When
  // no close view stands clear: the targets' group station turned to face them (fallback), never
  // nothing. null only when the target names nothing in this room.
  const memo = new Map();
  const focus = target => {
    if (!target) return null;
    const ids = (target.ids || []).filter(id => items.has(id)), area = target.area || null;
    const key = `focus:${ids.join('+')}${area ? `@${area}` : ''}`;
    if (memo.has(key)) return memo.get(key);
    const parts = ids.map(id => items.get(id)), framed = [...ids], alone = [...parts];
    if (area && scene) {
      for (const o of scene.children) {
        if (!o.userData || o.userData.frameArea !== area) continue;
        o.updateWorldMatrix(true, true);
        const it = { id: area, box: visibleBox(o), normal: new Vector3(0, 0, 1).applyQuaternion(o.getWorldQuaternion(o.quaternion.clone())).setY(0).normalize(), ring: null, owner: o, area: true };
        parts.push(it); alone.push(it);
        // The photographs it is framed with (its group's easels) come into the view whole, rings
        // included: a ring half off the frame edge beside the corner was the fix-round-1 finding.
        for (const it of items.values()) if (it.wall === o.userData.frameGroup && !framed.includes(it.id)) { parts.push(it); framed.push(it.id); }
      }
    }
    let st = null;
    if (parts.length) {
      const others = [...items.values()].filter(it => !framed.includes(it.id));
      const seeds = [...new Set(framed.map(id => stationOf.get(id)).filter(Boolean))];
      let view = focusView(parts, others, { aspect, canvasH, interior, bands: focusBands, reserved, occluders, area, seeds });
      // An area with its photographs may not fit a narrow phone: then the area alone, its
      // photographs' rings wholly on screen or wholly off it like any other ring.
      if (!view && alone.length < parts.length) view = focusView(alone, [...items.values()].filter(it => !ids.includes(it.id)), { aspect, canvasH, interior, bands: focusBands, reserved, occluders, area });
      if (view) st = { id: key, position: view.position, look: view.look, focus: { ids, ...(area ? { area } : {}) }, ringFloor: view.ringFloor };
      else {
        // No framed close view stands clear (never in the shipped rooms; camera-follow.test.js): the
        // first framed exhibit's group station (for an area, its photographs' station), turned to
        // face the targets.
        const own = framed.length ? stationOf.get(framed[0]) : null;
        if (own) {
          const all = new Box3(); for (const p of parts) all.union(p.box);
          st = { id: key, position: [...own.position], look: all.getCenter(new Vector3()).toArray(), focus: { ids, ...(area ? { area } : {}) }, fallback: true };
        }
      }
    }
    memo.set(key, st);
    return st;
  };
  return { stations, stationOf, anchors, opening, focus };
}

// The scene-level object holding `o` (an exhibit's easel or frame group), which an occluder test may
// ignore when it looks at that exhibit.
function topOf(o) {
  let x = o;
  while (x.parent && !x.parent.isScene) x = x.parent;
  return x;
}

const inRect = (x, z, r, pad = 0) => x >= r.min[0] - pad && x <= r.max[0] + pad && z >= r.min[1] - pad && z <= r.max[1] + pad;
// Does the floor segment a -> b ([x, z]) cross the rectangle r ({ min: [x, z], max: [x, z] })?
function segmentCrosses(a, b, r) {
  if (inRect(a[0], a[1], r) || inRect(b[0], b[1], r)) return true;
  let t0 = 0, t1 = 1;
  for (const [p, d, lo, hi] of [[a[0], b[0] - a[0], r.min[0], r.max[0]], [a[1], b[1] - a[1], r.min[1], r.max[1]]]) {
    if (Math.abs(d) < 1e-12) { if (p < lo || p > hi) return false; continue; }
    let ta = (lo - p) / d, tb = (hi - p) / d;
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
    if (t0 > t1) return false;
  }
  return true;
}
const rectOf = (b, pad) => ({ min: [b.min.x - pad, b.min.z - pad], max: [b.max.x + pad, b.max.z + pad] });
// Clearance the eye keeps from another easel (its box, in plan) and from the scan around it.
export const FOCUS_CLEARANCE = 0.3;
export const FOCUS_FREE_RADIUS = 0.5;
// A target's ring keeps this many px from the frame edge (and the free band's), drawn at its largest.
export const RING_MARGIN_PX = 8;
export const FOCUS_SIDE_COST = 0.05;
export const FOCUS_FOREGROUND_M = 1.5;
// Sideways shifts (m) of the point looked at, from the targets' middle.
export const FOCUS_TURNS = [0, 0.2, -0.2, 0.4, -0.4];
// Up and down shifts (m) of the point looked at, from where aimY centres the targets and rings.
export const FOCUS_TILTS = [0, 0.05, -0.05];
const RING_MAX_GROWTH = RING.litScale * (1 + RING.pulse) * (1 + RING.breathe) * RING.hoverScale;
// Sideways steps (m) from straight in front, nearest first: a view a little from the side when the
// floor straight in front is taken.
export const FOCUS_OFFSETS = [0, ...Array.from({ length: 8 }, (_, k) => [(k + 1) * 0.25, -(k + 1) * 0.25]).flat()];
const corners8 = b => [b.min.x, b.max.x].flatMap(x => [b.min.y, b.max.y].flatMap(y => [b.min.z, b.max.z].map(z => new Vector3(x, y, z))));

// A framed close view of `parts` ([{ box, normal, ring, owner }]: the exhibits a cue names, and the
// object in the area a museum note frames). The eye stands in front of them at eye height, at the
// distance FOCUS asks for (they fill more of the frame than from their group's station) within the
// hard limits, up to 2 m to the side (FOCUS_OFFSETS); of the candidates that pass, the one showing
// the targets largest (less FOCUS_SIDE_COST per metre to the side) that stands clear of the room. A candidate is kept only when,
// seen through the lens: every box corner and ring is in frame (inside the free band on a phone, 4 %
// in from its edges), each exhibit fills at least FRAMING.minExhibitShare of the height and its ring
// is drawn at least FRAMING.minRingPx across; the eye is inside the room, outside every reserved
// area and other easel, and (with `occluders`: { blocked(a, b, owner) } or an array of them, the
// room's occluder index) stands on free floor with nothing between it and each target.
// -> { position, look } or null.
function focusView(parts, others, { aspect, canvasH, interior, bands, reserved, occluders, area, seeds = [] }) {
  const lens = lensFor(aspect), band = freeBand(canvasH, bands);
  const normal = parts.reduce((n, p) => n.add(p.normal), new Vector3()).setY(0);
  if (normal.lengthSq() < 1e-9) normal.copy(parts[0].normal);
  normal.normalize();
  const along = new Vector3(-normal.z, 0, normal.x);
  const boxes = parts.map(p => p.box), rings = parts.filter(p => p.ring).map(p => p.ring);
  const g = groupDistance(boxes, along, lens, canvasH, rings, bands, FOCUS);
  const near = Math.max(0.6, g.fit);
  // Farthest: the hard limits (ring size, share), or, for several exhibits (too wide for them on a
  // phone: the second pass below) or an area (the study corner, which has no ring), as far as the
  // room allows.
  const wide = parts.length > 1 || parts.some(p => p.area);
  const far = Math.max(g.limit, g.fit, wide ? FRAMING.dMax * 2 : 0);
  const d0 = Math.min(Math.max(g.want, FOCUS.dMin, g.fit), far);
  const all = new Box3(); for (const b of boxes) all.union(b);
  const centre = all.getCenter(new Vector3());
  const vext = verticalExtent(boxes, rings);
  const idx = !occluders ? [] : [].concat(typeof occluders === 'function' ? occluders() : occluders).filter(Boolean);
  const blocked = (a, b, owner) => idx.some(i => i.blocked(a, b, owner));
  const keepOut = [...others.map(o => rectOf(o.box, FOCUS_CLEARANCE)), ...(reserved || [])];
  const ownArea = area && (reserved || []).find(r => r.id === area);
  const camera = new PerspectiveCamera(lens.vfov, aspect, 0.05, 60), canvasW = canvasH * aspect;
  const tv = Math.tan((lens.vfov * Math.PI) / 360);
  const yTop = band.yc + band.f - 0.01 * band.f, yBottom = band.yc - band.f + 0.01 * band.f;
  const ds = [d0];
  for (let k = 1; k <= 40; k++) for (const d of [d0 - 0.1 * k, d0 + 0.1 * k]) if (d >= near - 1e-9 && d <= far + 1e-9) ds.push(d);
  // Two passes for a cue naming several exhibits: a phone may be too narrow to hold them all with
  // every ring at minRingPx; the second pass frames them together with their rings at the size
  // rings.js holds every ring to anyway (RING.minPx), rather than leave one out.
  const ringFloors = parts.length > 1 ? [FRAMING.minRingPx, RING.minPx] : [FRAMING.minRingPx];
  // Every candidate that passes the plan checks and the lens checks is scored by its smallest
  // target's share of the frame height (the targets as large as possible), less a cost for each
  // metre to the side; the occluder checks (raycasts, the costly part) then run in score order.
  const sightRects = [...others.map(o => rectOf(o.box, 0.05)), ...(reserved || []).filter(r => r !== ownArea)];
  const clearOfRoom = (eye, look) => {
    if (!idx.length) return true;
    if (blocked(new Vector3(eye.x, 0.05, eye.z), eye.clone().setY(eye.y + 0.2))) return false;
    // The occluder layer is coarser than the scan: the eye keeps FOCUS_FREE_RADIUS from it, probed
    // in sixteen directions, from knee to eye height.
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8, dx = Math.cos(a) * FOCUS_FREE_RADIUS, dz = Math.sin(a) * FOCUS_FREE_RADIUS;
      for (const y of [0.3, 0.5, 1.0, eye.y]) if (blocked(new Vector3(eye.x, y, eye.z), new Vector3(eye.x + dx, y, eye.z + dz))) return false;
    }
    if (parts.some(p => blocked(eye, p.box.getCenter(new Vector3()), p.owner))) return false;
    // No piece of the room close in front of the eye across the lower part of the view (a chair
    // filling the foreground, fix round 1): rays through the frame's lower half are clear for
    // FOCUS_FOREGROUND_M.
    camera.position.copy(eye); camera.lookAt(look); camera.updateMatrixWorld(true);
    for (const nx of [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]) for (const ny of [-0.3, -0.6, -0.9]) {
      const dir = new Vector3(nx, ny, 0.5).unproject(camera).sub(eye).normalize();
      if (blocked(eye, eye.clone().addScaledVector(dir, FOCUS_FOREGROUND_M))) return false;
    }
    // Nothing of the room in front of the lower part of the view either (a chair filling the
    // foreground): the bottom corners of each target, 5 cm in and up, are in clear sight too.
    return !parts.some(p => { const c = p.box.getCenter(new Vector3()); return [[p.box.min.x, p.box.min.z], [p.box.max.x, p.box.min.z], [p.box.min.x, p.box.max.z], [p.box.max.x, p.box.max.z]].some(([x, z]) => blocked(eye, new Vector3(x + Math.sign(c.x - x) * 0.05, p.box.min.y + 0.05, z + Math.sign(c.z - z) * 0.05), p.owner)); });
  };
  // -> the smallest target share through the lens from `eye` looking at `look`, or -1 when a lens check fails.
  const lensScore = (eye, look, ringFloor) => {
    camera.position.copy(eye); camera.lookAt(look); camera.updateMatrixWorld(true);
    let score = Infinity;
    for (const p of parts) {
      const pts = corners8(p.box).map(q => q.project(camera));
      if (pts.some(q => q.z >= 1 || Math.abs(q.x) > 0.99 || q.y > yTop || q.y < yBottom)) return -1;
      const share = (Math.max(...pts.map(q => q.y)) - Math.min(...pts.map(q => q.y))) / 2;
      if (!p.area && share < FRAMING.minExhibitShare) return -1;
      if (!p.area) score = Math.min(score, share);
      if (p.ring) {
        const r = p.ring.clone().project(camera);
        // As rings.js draws it: never under RING.minPx.
        const px = (RING_WORLD * RING_DRAWN * canvasH) / (2 * Math.max(1e-6, p.ring.distanceTo(eye)) * tv);
        // The whole ring as drawn at its largest (lit, pulsing, hovered), plus RING_MARGIN_PX, on
        // screen inside the free band.
        const rad = (Math.min(RING.maxPx, Math.max(RING.minPx, px)) * RING_MAX_GROWTH) / 2 + RING_MARGIN_PX;
        const mx = (2 * rad) / canvasW, my = (2 * rad) / canvasH;
        if (r.z >= 1 || Math.abs(r.x) > 1 - mx || r.y > band.yc + band.f - my || r.y < band.yc - band.f + my || Math.max(px, RING.minPx) < ringFloor) return -1;
      }
    }
    // No other ring cut by the frame edge (fix round 1: ring 1 half off the left edge beside the
    // corner): each is wholly on screen with its margin, or wholly off it.
    for (const o of others) {
      if (!o.ring) continue;
      const r = o.ring.clone().project(camera);
      if (r.z >= 1) continue;
      const px = (RING_WORLD * RING_DRAWN * canvasH) / (2 * Math.max(1e-6, o.ring.distanceTo(eye)) * tv);
      const rad = (Math.min(RING.maxPx, Math.max(RING.minPx, px)) * RING_MAX_GROWTH) / 2;
      const mx = (2 * rad) / canvasW, my = (2 * rad) / canvasH, ex = (2 * RING_MARGIN_PX) / canvasW, ey = (2 * RING_MARGIN_PX) / canvasH;
      const inside = Math.abs(r.x) <= 1 - mx - ex && Math.abs(r.y) <= 1 - my - ey;
      const outside = Math.abs(r.x) >= 1 + mx || Math.abs(r.y) >= 1 + my;
      if (!inside && !outside) return -1;
    }
    // An area alone (no exhibit share): nearer the asked-for distance is better.
    return Number.isFinite(score) ? score : 1 / (1 + Math.abs(eye.distanceTo(centre) - d0));
  };
  // The vertical extent to centre in the band from `eye`: the targets' boxes and their rings drawn at
  // their largest (lit, pulsing, hovered) plus RING_MARGIN_PX, in metres at that distance.
  const extentFrom = eye => {
    let { y0, y1 } = verticalExtent(boxes, []);
    for (const r of rings) {
      const dist = Math.max(1e-6, r.distanceTo(eye));
      const px = Math.min(RING.maxPx, Math.max(RING.minPx, (RING_WORLD * RING_DRAWN * canvasH) / (2 * dist * tv)));
      const m = ((px * RING_MAX_GROWTH) / 2 + RING_MARGIN_PX) * ((2 * dist * tv) / canvasH);
      y0 = Math.min(y0, r.y - m); y1 = Math.max(y1, r.y + m);
    }
    return { y0, y1 };
  };
  for (const ringFloor of ringFloors) {
    const found = [];
    for (const d of ds) for (const off of FOCUS_OFFSETS) {
      const eye = centre.clone().addScaledVector(normal, d).addScaledVector(along, off); eye.y = EYE_HEIGHT;
      if (interior && !interior.containsPoint(eye)) continue;
      if (keepOut.some(r => inRect(eye.x, eye.z, r))) continue;
      if (parts.some(p => !p.area && inRect(eye.x, eye.z, rectOf(p.box, FOCUS_CLEARANCE)))) continue;
      // Nothing (another easel, a reserved area other than the one framed) on the floor line to a target.
      if (parts.some(p => { const c = p.box.getCenter(new Vector3()); return sightRects.some(r => segmentCrosses([eye.x, eye.z], [c.x, c.z], r)); })) continue;
      // The gaze at the targets' middle, or turned a little either way (a ring beside the view then
      // falls wholly in or wholly out of the frame) or tilted a little (the lit ring above, the
      // exhibit's foot below, both kept clear of the band's edges).
      for (const turn of FOCUS_TURNS) for (const tilt of FOCUS_TILTS) {
        const look = centre.clone().addScaledVector(along, turn); look.y = aimY(extentFrom(eye), eye.distanceTo(centre), lens, band) + tilt;
        const score = lensScore(eye, look, ringFloor);
        // A step to the side costs FOCUS_SIDE_COST of share per metre, a turn or tilt half that: a
        // view from straight in front wins over a slightly larger oblique one.
        if (score >= 0) found.push({ eye, look, score: score - FOCUS_SIDE_COST * (Math.abs(off) + (Math.abs(turn) + Math.abs(tilt)) / 2), off: Math.abs(off) });
      }
    }
    // The targets' own group stations compete too (the view they give, held to the same checks).
    for (const sd of seeds) {
      const eye = v3(sd.position), look = v3(sd.look);
      if (interior && !interior.containsPoint(eye)) continue;
      if (keepOut.some(r => inRect(eye.x, eye.z, r))) continue;
      const score = lensScore(eye, look, ringFloor);
      if (score >= 0) found.push({ eye, look, score, off: 0 });
    }
    found.sort((a, b) => b.score - a.score || a.off - b.off);
    for (const f of found) if (clearOfRoom(f.eye, f.look)) return { position: f.eye.toArray(), look: f.look.toArray(), ringFloor };
  }
  return null;
}
