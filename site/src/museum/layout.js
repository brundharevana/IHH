export const ROOM_TYPES = { 'chapter-gallery': { w: 8, d: 12, h: 4.5 }, 'reconstructed-place': null };
// Exhibit groups are anchored this far in front of their wall; exhibits build back to the wall from there.
export const WALL_GAP = 0.05;
export const HEIGHTS = { labelCentre: 1.37, frameCentre: 1.6, caseTop: 0.915, textCentre: 1.5 };
const WALL = {
  north: { axis: 'x', len: r => r.w, fixed: r => ({ z: -r.d / 2 + WALL_GAP }), rotY: 0 },
  south: { axis: 'x', len: r => r.w, fixed: r => ({ z: r.d / 2 - WALL_GAP }), rotY: Math.PI },
  west: { axis: 'z', len: r => r.d, fixed: r => ({ x: -r.w / 2 + WALL_GAP }), rotY: Math.PI / 2 },
  east: { axis: 'z', len: r => r.d, fixed: r => ({ x: r.w / 2 - WALL_GAP }), rotY: -Math.PI / 2 },
};
// Slot 1 is on the visitor's left facing the wall: x ascends on north, descends on south;
// z descends on west, ascends on east.
export function resolveSlot(room, wall, slot) {
  const w = WALL[wall];
  if (!w) throw new Error(`unknown wall ${wall}`);
  if (!Number.isInteger(slot) || slot < 1 || slot > 4) throw new Error(`slot must be 1-4, got ${slot}`);
  const len = w.len(room), step = len / 5, along = -len / 2 + step * slot;
  const pos = { x: 0, y: HEIGHTS.frameCentre, z: 0, ...w.fixed(room), rotY: w.rotY };
  pos[w.axis] = wall === 'south' || wall === 'west' ? -along : along;
  return pos;
}

// Position along a wall as the visitor facing it reads it, left to right (the order slots run in),
// 0 at the wall's middle: x on north, -x on south, z on east, -z on west.
export function wallT(wall, x, z) {
  const w = WALL[wall];
  if (!w) throw new Error(`unknown wall ${wall}`);
  const v = w.axis === 'x' ? x : z;
  return wall === 'south' || wall === 'west' ? -v : v;
}

// The introductory text panel of an exhibit wall: museum convention hangs it to the left of the
// first exhibit. `right` is where that exhibit starts and `left` where the wall (or the exhibit
// before it) ends, both as wallT values. The panel keeps `gap` clear of the exhibit and `edge`
// clear of `left`, is as wide as that space allows up to `maxW`, and hangs at HEIGHTS.textCentre.
// -> { x, y, z, rotY, w, h }, or null when less than `minW` is free (the caller then needs another place).
export const INTRO = { maxW: 1.4, minW: 0.5, gap: 0.2, edge: 0.15 };
export function introPanel(room, wall, { right, left = null }, opts = {}) {
  const { maxW, minW, gap, edge } = { ...INTRO, ...opts };
  const w0 = WALL[wall];
  if (!w0) throw new Error(`unknown wall ${wall}`);
  const half = w0.len(room) / 2;
  const lo = Math.max(left === null ? -half : left, -half) + edge, hi = Math.min(right, half) - gap;
  const w = Math.min(maxW, hi - lo);
  if (w < minW) return null;
  const t = hi - w / 2;
  const h = Math.min(0.9, Math.max(0.6, w * 1.1));
  const pos = { x: 0, y: HEIGHTS.textCentre, z: 0, ...w0.fixed(room), rotY: w0.rotY };
  pos[w0.axis] = wall === 'south' || wall === 'west' ? -t : t;
  return { ...pos, w, h };
}

// Museum doors (entrance and exit), outer size of the framed door in metres (`w`, or `minW` where
// only that fits). A door stands flat on a wall and keeps `clear` metres of floor in front of it free
// (the visitor walks up to it); along the wall it keeps at least `gap` from any obstacle and `edge`
// from the room's corners, and `room` (0.4 m) wherever the wall allows.
export const DOOR = { w: 1.0, minW: 0.9, h: 2.15, clear: 0.5, gap: 0.2, edge: 0.15, room: 0.4, step: 0.05 };
// Half fields of view (degrees, with a margin for the door's own width) the exit is aimed at: a phone
// held upright (55 degrees across, camera.js MIN_HFOV) and a desktop canvas (about 80 degrees).
export const DOOR_VIEW = { phone: 22, wide: 32 };
// A door this far from corners and obstacles is as good as any further away (then nearer the gaze wins).
const CLEAR_ENOUGH = 1.0;
const DOOR_WALLS = ['north', 'east', 'south', 'west'];

// Blocked stretches of `wall` as wallT intervals [lo, hi] (obstacle extents, no gap): every obstacle
// that reaches into the zone a door on this wall needs (wall plane to `clear` in, floor to door height).
function blockedOn(room, wall, obstacles, d) {
  const w = WALL[wall];
  const plane = { north: -room.d / 2, south: room.d / 2, west: -room.w / 2, east: room.w / 2 }[wall];
  const inward = { north: 1, south: -1, west: 1, east: -1 }[wall];
  const depth = [plane, plane + inward * d.clear].sort((a, b) => a - b);
  const depthAxis = w.axis === 'x' ? 2 : 0;
  const out = [];
  for (const o of obstacles) {
    if (o.max[1] <= 0 || o.min[1] >= d.h) continue;
    if (o.max[depthAxis] <= depth[0] || o.min[depthAxis] >= depth[1]) continue;
    const ts = [[o.min[0], o.min[2]], [o.min[0], o.max[2]], [o.max[0], o.min[2]], [o.max[0], o.max[2]]].map(([x, z]) => wallT(wall, x, z));
    out.push([Math.min(...ts), Math.max(...ts)]);
  }
  return out.sort((a, b) => a[0] - b[0]);
}

// Free stretches of `wall` (wallT [lo, hi]) where a door may stand, after the hard gap and edge.
function freeOn(room, wall, blocked, d) {
  const half = WALL[wall].len(room) / 2;
  const free = [];
  let lo = -half + d.edge;
  const hi = half - d.edge;
  for (const [b0, b1] of blocked) {
    if (b0 - d.gap > lo) free.push([lo, Math.min(b0 - d.gap, hi)]);
    lo = Math.max(lo, b1 + d.gap);
  }
  if (lo < hi) free.push([lo, hi]);
  return free;
}

// The door at wallT `t` on `wall`, `w` wide: its centre on the wall plane at floor level, facing in.
function doorAt(room, wall, t, w, h) {
  const wl = WALL[wall];
  const plane = { north: { z: -room.d / 2 }, south: { z: room.d / 2 }, west: { x: -room.w / 2 }, east: { x: room.w / 2 } }[wall];
  const pos = { x: 0, y: 0, z: 0, ...plane, rotY: wl.rotY };
  pos[wl.axis] = wall === 'south' || wall === 'west' ? -t : t;
  return { wall, t, ...pos, w, h };
}

// Where the entrance and exit doors go, derived from the room's layout. `room` is { w, d, h };
// `obstacles` are world boxes { min: [x, y, z], max: [x, y, z] } of everything a door must keep clear
// of (exhibits with their hotspot anchors, the title panel, the bench, furniture, floor labels);
// `view` is the establishing view { eye, target }; opts.prefer lists walls to use first (the unseen
// walls of a reconstructed place, where a museum door claims nothing about the place).
// Exit, in order of preference: a preferred wall; in the phone's opening view, else in a wide
// screen's; then at least CLEAR_ENOUGH from corners and obstacles (the middle of a long free
// stretch), at least `room` where possible; then nearest the gaze. A door in no view goes nearest
// the gaze first. Entrance: another wall than the
// exit (same wall only as a fallback); a preferred wall; clear; then furthest behind the visitor (the
// door they came in by). -> { entrance, exit }, each { wall, t, x, y, z, rotY, w, h } or null.
export function placeDoors(room, obstacles, view, opts = {}) {
  const d = { ...DOOR, ...opts };
  const h = Math.min(d.h, room.h - 0.3);
  const prefer = new Set(opts.prefer || []);
  const [ex, , ez] = view.eye, [tx, , tz] = view.target;
  const dl = Math.hypot(tx - ex, tz - ez) || 1;
  const angle = (x, z) => {
    const vx = x - ex, vz = z - ez, l = Math.hypot(vx, vz) || 1;
    return (Math.acos(Math.max(-1, Math.min(1, (vx * (tx - ex) + vz * (tz - ez)) / (l * dl)))) * 180) / Math.PI;
  };
  const cands = [];
  for (const wall of DOOR_WALLS) {
    const blocked = blockedOn(room, wall, obstacles, { ...d, h });
    const half = WALL[wall].len(room) / 2;
    for (const [a, b] of freeOn(room, wall, blocked, d)) {
      const w = b - a >= d.w - 1e-9 ? d.w : b - a >= d.minW - 1e-9 ? d.minW : 0;
      if (!w) continue;
      const ts = [];
      for (let t = a + w / 2; t <= b - w / 2 + 1e-9; t += d.step) ts.push(Math.min(t, b - w / 2));
      if (ts[ts.length - 1] < b - w / 2 - 1e-9) ts.push(b - w / 2);
      for (const t of ts) {
        const c = doorAt(room, wall, t, w, h);
        // Clearance: distance from the door's edges to the nearest corner or obstacle on this wall.
        let clear = Math.min(t - w / 2 + half, half - t - w / 2);
        for (const [b0, b1] of blocked) clear = Math.min(clear, b1 <= t - w / 2 ? t - w / 2 - b1 : b0 >= t + w / 2 ? b0 - t - w / 2 : 0);
        // In view: the whole door width within the half field of view.
        const off = Math.max(...[-w / 2, w / 2].map(s => {
          const p = doorAt(room, wall, t + s, w, h);
          return angle(p.x, p.z);
        }));
        cands.push({ c, clear, off, centre: angle(c.x, c.z) });
      }
    }
  }
  // Lexicographic comparison of score arrays (lower is better).
  const lower = (p, q) => { for (let i = 0; i < p.length; i++) if (Math.abs(p[i] - q[i]) > 1e-9) return p[i] < q[i]; return false; };
  const pick = (list, score) => list.reduce((m, x) => (m === null || lower(score(x), score(m)) ? x : m), null);
  const clearRank = x => [x.clear >= d.room - 1e-9 ? 0 : 1, -Math.min(x.clear, CLEAR_ENOUGH)];
  // Out of every view, nearness to the gaze comes before clearance: a turn toward the door then
  // turns least, keeping the room's exhibits in frame.
  const viewTier = x => (x.off <= DOOR_VIEW.phone ? 0 : x.off <= DOOR_VIEW.wide ? 1 : 2);
  const exitBest = pick(cands, x => [prefer.has(x.c.wall) ? 0 : 1, viewTier(x),
    ...(viewTier(x) < 2 ? [...clearRank(x), x.centre] : [x.centre, ...clearRank(x)])]);
  if (!exitBest) return { entrance: null, exit: null };
  const exit = exitBest.c;
  const apart = x => x.c.wall !== exit.wall || Math.abs(x.c.t - exit.t) >= (x.c.w + exit.w) / 2 + d.gap - 1e-9;
  const entBest = pick(cands.filter(apart), x => [x.c.wall === exit.wall ? 1 : 0, prefer.has(x.c.wall) ? 0 : 1, ...clearRank(x), -x.centre]);
  return { entrance: entBest ? entBest.c : null, exit };
}

