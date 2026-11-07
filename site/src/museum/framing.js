// Framed viewing stations (real-scan museum, Task 4 fix round 1). The owner's complaint was that a
// room "looks too big, not proportionately angled": the camera stood at the back of the room and
// every exhibit was a speck. Stations are now computed per exhibit group, per canvas aspect, at run
// time, so a group fills a set share of the frame:
//   d = max(Wg / (2 * 0.65 * tan(hfov / 2)), Hg / (2 * 0.3 * tan(vfov / 2)))
// (the group at most 65 % of the frame width and 30 % of its height), clamped to [D_MIN, D_MAX] and
// never so far that an exhibit is under MIN_EXHIBIT_SHARE of the frame height or its ring is drawn
// under MIN_RING_PX. A wall's exhibits are split, in order along the wall, into as few groups as keep
// those limits. The eye stands at eye height in front of the group, inside the room.
import { Box3, Vector3 } from 'three';
import { fovFor, horizontalFov, EYE_HEIGHT } from './camera.js';

export const FRAMING = Object.freeze({
  widthShare: 0.65, heightShare: 0.3, minExhibitShare: 0.12, minRingPx: 56, dMin: 1.4, dMax: 4,
  // Planning margin on the hard limits (the eye is a little off the group's axis).
  margin: 0.95,
});
// The close view a narration cue asks for (owner review 4): the named exhibits fill more of the frame
// than a group station's view, within the same hard limits (in frame, ring >= minRingPx).
// It may stand nearer than a group station (dMin), never so near that the exhibit leaves the frame.
export const FOCUS = Object.freeze({ widthShare: 0.8, heightShare: 0.6, dMin: 1 });
// Ring sizes the framing plans for (rings.js imports these too).
export const RING_WORLD = 0.45;
// The drawn ring (outer edge of its core band) as a share of its square plane.
export const RING_DRAWN = 0.92;

const rad = d => (d * Math.PI) / 180;
export function lensFor(aspect) {
  const vfov = fovFor(aspect);
  return { vfov, hfov: horizontalFov(vfov, aspect) };
}

// Box of an object's visible meshes (the invisible number-disc anchor is left out).
export function visibleBox(obj) {
  const box = new Box3(), part = new Box3();
  obj.updateWorldMatrix(true, true);
  obj.traverse(o => {
    if (!o.isMesh || !o.visible || !o.geometry) return;
    for (let p = o; p; p = p.parent) if (!p.visible) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    box.union(part);
  });
  return box;
}

// A ring's drawn radius in metres at its largest (lit, x1.18), for the vertical extent of a group.
const RING_TOP = (RING_WORLD * RING_DRAWN * 1.18) / 2;
// Free band of the canvas (fix round 2): `bands` are the px a phone stage keeps for its controls at
// the top (door chips) and bottom (captions, rail, player bar). -> the free share of the height and
// the NDC height of the band's middle.
export function freeBand(canvasH, bands = null) {
  const top = (bands && bands.top) || 0, bottom = (bands && bands.bottom) || 0;
  const f = Math.max(0.2, (canvasH - top - bottom) / canvasH);
  return { f, yc: 1 - (2 * (top + (canvasH - top - bottom) / 2)) / canvasH, active: Boolean(top || bottom) };
}
// Vertical extent of exhibit boxes and their rings (ring anchors plus the ring's radius).
export function verticalExtent(boxes, rings = []) {
  let y0 = Infinity, y1 = -Infinity;
  for (const b of boxes) { y0 = Math.min(y0, b.min.y); y1 = Math.max(y1, b.max.y); }
  for (const r of rings) { y0 = Math.min(y0, r.y - RING_TOP); y1 = Math.max(y1, r.y + RING_TOP); }
  return { y0, y1 };
}

// Width of a set of boxes along the wall tangent `along` (horizontal unit vector) and their height.
function extent(boxes, along) {
  let lo = Infinity, hi = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const b of boxes) {
    for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]) {
      const t = x * along.x + z * along.z; lo = Math.min(lo, t); hi = Math.max(hi, t);
    }
    y0 = Math.min(y0, b.min.y); y1 = Math.max(y1, b.max.y);
  }
  return { w: hi - lo, h: y1 - y0 };
}

// The distance the shares ask for, and the farthest the hard limits allow, for a group.
// rings: the group's ring anchors (Vector3); a ring off the line of sight is farther than d.
// shares: the share of the frame the group should fill (FRAMING for a group station, FOCUS for the
// close view a narration cue asks for).
export function groupDistance(boxes, along, { hfov, vfov }, canvasH, rings = [], bands = null, shares = FRAMING) {
  const { w, h } = extent(boxes, along);
  const th = Math.tan(rad(hfov) / 2), tv = Math.tan(rad(vfov) / 2);
  const want = Math.max(w / (2 * shares.widthShare * th), h / (2 * shares.heightShare * tv));
  const smallest = Math.min(...boxes.map(b => b.max.y - b.min.y));
  const byShare = smallest / (2 * FRAMING.minExhibitShare * tv);
  const ringReach = (RING_WORLD * RING_DRAWN * canvasH) / (2 * FRAMING.minRingPx * tv);
  const all = new Box3(); for (const b of boxes) all.union(b);
  const c = all.getCenter(new Vector3());
  // Each ring's distance from the eye (which stands d out from the group's centre along its normal):
  // its offset across and up, and how far behind the centre's plane it sits (Task 5: a ring over an
  // easel stands behind a plinth in front of it; on a wall all rings share the plane).
  const normal = new Vector3(along.z, 0, -along.x);
  const byRing = rings.length ? Math.min(...rings.map(r => {
    const off = Math.hypot((r.x - c.x) * along.x + (r.z - c.z) * along.z, r.y - EYE_HEIGHT);
    const back = (c.x - r.x) * normal.x + (c.z - r.z) * normal.z;
    return Math.sqrt(Math.max(0, ringReach * ringReach - off * off)) - back;
  })) : ringReach;
  const limit = Math.min(FRAMING.dMax, byShare, byRing) * FRAMING.margin;
  // Nearer than this and the group no longer fits across the frame (90 % of its width), or (with
  // its rings) into 90 % of the free band's height.
  const v = verticalExtent(boxes, rings), band = freeBand(canvasH, bands);
  // Across: every box corner within 90 % of the half-width, a corner nearer the eye (a deep exhibit
  // such as a plinth, Task 5) seen from that much closer. For flat wall exhibits this is w / (2 * 0.9 * th).
  let fitW = 0;
  for (const b of boxes) for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]) {
    const t = (x - c.x) * along.x + (z - c.z) * along.z, s = (x - c.x) * normal.x + (z - c.z) * normal.z;
    fitW = Math.max(fitW, s + Math.abs(t) / (0.9 * th));
  }
  // Up and down: the exhibits and their rings within 90 % of the free band's height (the whole frame
  // when no band is kept; Task 5: an easel's ring stands high above a low plinth beside it).
  const fit = Math.max(fitW, (v.y1 - v.y0) / (2 * 0.9 * band.f * tv));
  return { want, limit, fit, w, h };
}

// items: [{ id, box (Box3, world), normal (horizontal unit Vector3 out of the wall), ring (anchor) }]
// in wall order (left to right as the visitor facing the wall reads it). -> [{ ids, position, look }]
export function frameWall(items, { aspect, canvasH, interior = null, extra = [], bands = null }) {
  if (!items.length) return [];
  const lens = lensFor(aspect);
  const normal = items[0].normal.clone().setY(0).normalize();
  const along = new Vector3(-normal.z, 0, normal.x);
  const groups = [];
  let cur = [];
  const ok = list => {
    const g = groupDistance(list.map(i => i.box), along, lens, canvasH, list.filter(i => i.ring).map(i => i.ring), bands);
    return g.fit <= g.limit;
  };
  for (const it of items) {
    if (cur.length && !ok([...cur, it])) { groups.push(cur); cur = []; }
    cur.push(it);
  }
  if (cur.length) groups.push(cur);
  return groups.map((g, k) => {
    // Extra boxes (the wall's title panel) join the first group only when it still fits.
    const withExtra = k === 0 && extra.length && ok([...g, ...extra.map(box => ({ box }))]);
    const boxes = [...g.map(i => i.box), ...(withExtra ? extra : [])];
    const rings = g.filter(i => i.ring).map(i => i.ring);
    const dist = groupDistance(boxes, along, lens, canvasH, rings, bands);
    const d = Math.min(Math.max(dist.want, FRAMING.dMin, dist.fit), Math.max(dist.limit, dist.fit));
    const all = new Box3(); for (const b of boxes) all.union(b);
    const centre = all.getCenter(new Vector3());
    const eye = centre.clone().addScaledVector(normal, d); eye.y = EYE_HEIGHT;
    if (interior) interior.clampPoint(eye, eye);
    const look = centre.clone();
    const band = freeBand(canvasH, bands);
    // Aim so the exhibits and their rings sit in the middle of the free band (of the frame without one).
    look.y = aimY(verticalExtent(boxes, rings), eye.distanceTo(centre), lens, band);
    return { ids: g.map(i => i.id), position: eye.toArray(), look: look.toArray(), distance: d, lens, band };
  });
}

// The height to look at so a vertical extent's middle projects at the free band's middle, seen from
// `depth` metres (a point dy above the look point projects at dy / (depth * tan(vfov / 2)) in NDC).
export function aimY({ y0, y1 }, depth, { vfov }, band) {
  return (y0 + y1) / 2 - band.yc * depth * Math.tan(rad(vfov) / 2);
}
