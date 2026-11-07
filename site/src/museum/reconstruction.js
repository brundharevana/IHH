// Reconstructed place: a room rebuilt only from what is visible in its basis photographs.
// Every item cites the basis photo it is visible in; walls the photos do not show stay a neutral
// flat grey with a floor label. Same rules as tools/content_check.py validate_place (shared cases
// in tools/tests/fixtures/place_cases.json).
import { resolveSlot, HEIGHTS, placeDoors } from './layout.js';
import { addDoors, doorObstacles } from './door.js';
import { createMaterials } from './materials.js';
import { boxPart, cylinderPart, mergeParts, metreUVs } from './geom.js';
import { buildShell, occluderOf } from './shell.js';
import { aimPoint, SPOT, MAX_LIGHTS } from './lighting.js';
import { makeExhibit } from './exhibits.js';
import { exhibitFiles } from './mediafiles.js';

export const PLACE_KINDS = ['desk', 'chair', 'shelf', 'window', 'door', 'lamp', 'document', 'table', 'bookcase', 'blackboard'];
// Sub-objects: things drawn ON a piece of furniture. Each is declared as an item of its own (kind,
// parent item id, basis_media_ids) and is rendered only if declared; value = the parent's kind.
export const SUB_KINDS = { books: 'bookcase', papers: 'desk', 'book-stack': 'desk' };
export const PLACE_WALLS = ['north', 'east', 'south', 'west'];
// Fixed UI label (not content): shown on the floor in front of each unseen wall and in the page.
export const UNSEEN_LABEL = 'Not shown in the source photographs';
// Fixed UI disclosure on every reconstruction plaque: materials are museum stand-ins.
export const COLOUR_NOTE = 'Colours and lighting are not from the source photographs.';
// Fixed UI disclosure on every reconstruction plaque: sizes and arrangement are our estimates.
export const ESTIMATE_NOTE = 'Room size, layout and furniture shapes are estimated from the photographs.';
// Fixed UI disclosure on the plaque of a room page: its two doors lead between the museum's rooms.
// Fixed UI caption under a document hung on the wall, whose face is left blank (its text is not reproduced).
export const DOCUMENT_CAPTION = 'Document (text not reproduced)';
export const DOOR_NOTE = 'The two doors are museum doors between rooms; they are not part of the place.';
export const EYE_HEIGHT = 1.6;
export const LABEL_HEIGHT = 0.3; // centre of the floor-level unseen-wall label
const EPS = 1e-6;
// Smallest room we build (m): smaller than this is not a room a visitor can stand in.
export const PLACE_MIN = { w: 2, d: 2, h: 2.2 };
// An item stands against a wall when its footprint comes within this distance (m) of it.
export const AGAINST_WALL = 0.3;
// Space an exhibit takes on its wall, along the wall (+/- halfWidth from the slot centre) and in
// height. Frames (up to 1.18 m with border) and wall quotes hang around the frame centre with the
// number disc above; a 360 document's plinth stands on the floor. Mirrored in tools/content_check.py.
export const EXHIBIT_FOOTPRINT = {
  default: { halfWidth: 0.6, bottom: HEIGHTS.frameCentre - 0.5, top: HEIGHTS.frameCentre + 0.7 },
  '360-document': { halfWidth: 0.3, bottom: 0, top: 1.45 },
};
const SLOT_WALLS = { north: 'x', south: 'x', east: 'z', west: 'z' };

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isPos = v => isNum(v) && v > 0;

// An item that is a sub-object declaration (not furniture): a sub-object kind, or a parent / basis list.
export const isSub = it => !!it && typeof it === 'object' && (Object.hasOwn(SUB_KINDS, it.kind) || 'parent' in it || 'basis_media_ids' in it);

// Pure. Returns a list of errors; [] means the place may be built.
// `exhibits` are the chapter's exhibits: none may cover an item standing against its wall.
export function validatePlace(place, basisIds = [], exhibits = []) {
  if (!place || typeof place !== 'object' || Array.isArray(place)) return ['place must be an object'];
  const errors = [];
  for (const k of ['w', 'd', 'h']) {
    if (!isNum(place[k])) errors.push(`place ${k} must be a positive number`);
    else if (place[k] < PLACE_MIN[k]) errors.push(`place ${k} must be at least ${PLACE_MIN[k]} m`);
  }
  if (!Array.isArray(place.items) || !place.items.length) errors.push('place items must be a non-empty list');
  if (!Array.isArray(place.unseen)) errors.push('place unseen must be a list of walls');
  else {
    const seen = new Set();
    for (const wall of place.unseen) {
      if (!PLACE_WALLS.includes(wall)) errors.push(`place unseen: ${wall} is not a wall (${PLACE_WALLS.join(', ')})`);
      else if (seen.has(wall)) errors.push(`place unseen: ${wall} listed twice`);
      seen.add(wall);
    }
  }
  const byId = new Map(); // furniture item id -> kind (a sub-object is never a parent)
  (Array.isArray(place.items) ? place.items : []).forEach((it, i) => {
    if (!it || typeof it !== 'object' || Array.isArray(it) || isSub(it) || it.id === undefined) return;
    if (typeof it.id !== 'string' || !it.id.trim()) errors.push(`item ${i}: id must be a non-empty string`);
    else if (byId.has(it.id)) errors.push(`item ${i}: id ${it.id} used twice`);
    else byId.set(it.id, it.kind);
  });
  const roomOk = ['w', 'd', 'h'].every(k => isNum(place[k]) && place[k] >= PLACE_MIN[k]);
  const boxes = [];
  const basis = new Set(basisIds);
  (Array.isArray(place.items) ? place.items : []).forEach((it, i) => {
    const at = `item ${i}`;
    if (!it || typeof it !== 'object' || Array.isArray(it)) { errors.push(`${at}: must be an object`); return; }
    if (isSub(it)) {
      if (!Object.hasOwn(SUB_KINDS, it.kind)) errors.push(`${at}: kind ${it.kind} is not one of ${PLACE_KINDS.join(', ')} or the sub-objects ${Object.keys(SUB_KINDS).join(', ')}`);
      if (typeof it.parent !== 'string' || !it.parent.trim()) errors.push(`${at}: needs a parent item id`);
      else if (!byId.has(it.parent)) errors.push(`${at}: parent ${it.parent} is not an item`);
      else if (Object.hasOwn(SUB_KINDS, it.kind) && byId.get(it.parent) !== SUB_KINDS[it.kind]) errors.push(`${at}: ${it.kind} must stand on a ${SUB_KINDS[it.kind]}, not a ${byId.get(it.parent)}`);
      if (!Array.isArray(it.basis_media_ids) || !it.basis_media_ids.length) errors.push(`${at}: needs basis_media_ids`);
      else for (const b of it.basis_media_ids) if (!basis.has(b)) errors.push(`${at}: basis ${b} is not one of the reconstruction basis photos`);
      return;
    }
    if (!PLACE_KINDS.includes(it.kind)) errors.push(`${at}: kind ${it.kind} is not one of ${PLACE_KINDS.join(', ')}`);
    let ok = true;
    for (const k of ['x', 'z', 'rotY']) if (!isNum(it[k])) { errors.push(`${at}: ${k} must be a number`); ok = false; }
    if (it.y !== undefined && !isNum(it.y)) { errors.push(`${at}: y must be a number`); ok = false; }
    for (const k of ['w', 'd', 'h']) if (!isPos(it[k])) { errors.push(`${at}: ${k} must be a positive number`); ok = false; }
    if (typeof it.basis !== 'string' || !it.basis.trim()) errors.push(`${at}: needs a basis photo id`);
    else if (!basis.has(it.basis)) errors.push(`${at}: basis ${it.basis} is not one of the reconstruction basis photos`);
    if (ok && roomOk) {
      const c = Math.abs(Math.cos(it.rotY)), s = Math.abs(Math.sin(it.rotY));
      const hx = c * it.w / 2 + s * it.d / 2, hz = s * it.w / 2 + c * it.d / 2, y = it.y || 0;
      if (Math.abs(it.x) + hx > place.w / 2 + EPS || Math.abs(it.z) + hz > place.d / 2 + EPS || y < 0 || y + it.h > place.h + EPS) {
        errors.push(`${at}: outside the room`);
      }
      boxes.push({ i, kind: it.kind, x0: it.x - hx, x1: it.x + hx, z0: it.z - hz, z1: it.z + hz, y0: y, y1: y + it.h });
    }
  });
  if (roomOk) {
    for (const ex of exhibits || []) {
      if (!ex || !SLOT_WALLS[ex.wall] || !Number.isInteger(ex.slot) || ex.slot < 1 || ex.slot > 4) continue; // reported by the layout checks
      const fp = EXHIBIT_FOOTPRINT[ex.type] || EXHIBIT_FOOTPRINT.default;
      const p = resolveSlot(place, ex.wall, ex.slot), axis = SLOT_WALLS[ex.wall];
      const c = p[axis], lo = c - fp.halfWidth, hi = c + fp.halfWidth;
      for (const b of boxes) {
        const against = { north: b.z0 <= -place.d / 2 + AGAINST_WALL, south: b.z1 >= place.d / 2 - AGAINST_WALL,
          west: b.x0 <= -place.w / 2 + AGAINST_WALL, east: b.x1 >= place.w / 2 - AGAINST_WALL }[ex.wall];
        const [a0, a1] = axis === 'x' ? [b.x0, b.x1] : [b.z0, b.z1];
        if (against && a0 < hi - EPS && a1 > lo + EPS && b.y0 < fp.top - EPS && b.y1 > fp.bottom + EPS) {
          errors.push(`exhibit ${ex.id}: covers item ${b.i} (${b.kind}) on the ${ex.wall} wall`);
        }
      }
    }
  }
  return errors;
}

// Four stored viewpoints: standing in the centre at eye height, facing each wall, the gaze
// dropped slightly so furniture and the floor-level labels are in view.
export const GAZE_HEIGHT = 1.2;
export function placeViewpoints(place) {
  const y = Math.min(EYE_HEIGHT, place.h - 0.2), t = Math.min(GAZE_HEIGHT, y);
  const at = { north: [0, t, -place.d / 2], east: [place.w / 2, t, 0], south: [0, t, place.d / 2], west: [-place.w / 2, t, 0] };
  return PLACE_WALLS.map(id => ({ id, eye: [0, y, 0], target: at[id] }));
}

// Establishing view: stand in the back corner of the room (BACK_OFF from the south wall, SIDE_OFF
// from the east wall) and look across it toward the north wall at START_ANGLE west of straight
// ahead, so the first frame shows the room's furniture and the exhibits on its west side, not one
// wall of shelves.
export const BACK_OFF = 0.6;
export const SIDE_OFF = 0.5;
export const START_ANGLE = Math.PI / 4;
export function placeStart(place) {
  const y = Math.min(EYE_HEIGHT, place.h - 0.2), t = Math.min(GAZE_HEIGHT, y);
  const eye = [place.w / 2 - SIDE_OFF, y, place.d / 2 - BACK_OFF];
  const tx = Math.max(-place.w / 2, eye[0] - (eye[2] + place.d / 2) * Math.tan(START_ANGLE));
  return { eye, target: [tx, t, -place.d / 2] };
}

// Furniture materials. Wood is the shared walnut PBR set; colours and lighting are museum stand-ins
// (COLOUR_NOTE), never taken from the photographs.
function placeMaterials(THREE, mats) {
  const m = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  const unseen = m(0x8a8a8a, { roughness: 1 });
  unseen.name = 'unseen-neutral';
  const books = m(0xffffff, { roughness: 0.8, map: spineTexture(THREE) });
  books.name = 'books';
  const cloth = m(0x5f5143, { roughness: 0.8 });
  cloth.name = 'cloth';
  const cloth2 = m(0x6e3b2e, { roughness: 0.8 });
  cloth2.name = 'cloth-red';
  // Daylight in the window: brighter toward the top, like an overcast sky over a garden.
  const daylight = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true });
  daylight.name = 'daylight';
  // Milk-glass lamp bowl: glows a little, as if lit.
  const rule = m(0xc9c1b2, { roughness: 0.95 });
  rule.name = 'paper-rule';
  const milk = m(0xf3ece0, { roughness: 0.4, emissive: 0xffd6a0, emissiveIntensity: 0.6 });
  milk.name = 'milk-glass';
  return {
    unseen,
    wood: mats.walnut, // furniture: walnut PBR (materials.js)
    paper: m(0xefe9dc, { roughness: 0.9 }),
    slate: m(0x262b2b, { roughness: 0.8 }),
    daylight, books, cloth, cloth2, milk, rule,
  };
}

// Book cloth spines: a soft vertical shade with two light bands near the head and tail, multiplied by
// each book's own colour (instanceColor). 8 x 64 texels.
function spineTexture(THREE) {
  const w = 8, h = 64, data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    const band = (v > 0.08 && v < 0.11) || (v > 0.86 && v < 0.89) || (v > 0.8 && v < 0.82) ? 1.25 : 1;
    for (let x = 0; x < w; x++) {
      const shade = 0.82 + 0.18 * Math.sin((x / (w - 1)) * Math.PI);
      const c = Math.min(255, Math.round(205 * shade * band));
      data.set([c, c, Math.round(c * 0.97), 255], (y * w + x) * 4);
    }
  }
  const t = new THREE.DataTexture(data, w, h);
  t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}

// Deterministic pseudo-random numbers (mulberry32), so a room looks the same on every visit.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Muted cloth and paper bindings (none near-black: exhibit-finish.test.js).
const BOOK_COLOURS = [0x6e3b2e, 0x4f5a3f, 0x3f4a5a, 0x7a6a4f, 0x8c7b5c, 0x5c4a3a, 0xb8a888, 0xcfc2a2, 0x6b2f2f, 0x55604f, 0x9a8a6a, 0x4a3f36];

// Books along a shelf run [x0, x1] at height y0 (the board top), at most `maxH` tall and `depth`
// deep (front at z = front). Mostly upright, a few leaning, the odd stack lying flat, short gaps.
// -> [{ w, h, d, x, y, z, rz, colour }] in the bookcase's local frame.
export function fillShelf(rand, { x0, x1, y0, maxH, front, depth }) {
  const out = [];
  let x = x0 + 0.01;
  while (x < x1 - 0.03) {
    const r = rand();
    if (r < 0.05) { x += 0.04 + rand() * 0.12; continue; } // a gap
    if (r < 0.11 && x1 - x > 0.32) { // a stack lying flat
      const n = 2 + Math.floor(rand() * 5), w = 0.2 + rand() * 0.08;
      let y = y0;
      for (let i = 0; i < n && y < y0 + maxH - 0.06; i++) {
        const t = 0.025 + rand() * 0.03;
        out.push({ w, h: t, d: Math.min(depth, 0.15 + rand() * 0.08), x: x + w / 2 + rand() * 0.01, y: y + t / 2, z: front - depth / 2, rz: 0, colour: BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)] });
        y += t;
      }
      x += w + 0.02;
      continue;
    }
    const t = 0.018 + rand() * 0.045, h = Math.min(maxH - 0.01, 0.17 + rand() * 0.15), d = Math.min(depth - 0.01, 0.13 + rand() * 0.1);
    const lean = r > 0.97 && out.length ? 0.2 + rand() * 0.15 : 0;
    // A leaning book rests on the one before it: its foot slides along, its top tips toward the run.
    const dx = lean ? Math.sin(lean) * h / 2 : 0;
    out.push({ w: t, h, d, x: x + t / 2 + dx, y: y0 + Math.cos(lean) * h / 2, z: front - d / 2 - rand() * 0.02, rz: lean, colour: BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)] });
    x += t + (lean ? Math.sin(lean) * h : 0.001);
  }
  // Keep only books wholly inside the run (a leaning book by its tilted extent).
  return out.filter(b => {
    const half = (b.w * Math.cos(b.rz) + b.h * Math.sin(b.rz)) / 2, top = b.y + (b.h * Math.cos(b.rz) + b.w * Math.sin(b.rz)) / 2;
    return b.x - half >= x0 - 1e-6 && b.x + half <= x1 + 1e-6 && top <= y0 + maxH + 1e-6;
  });
}

// One instanced mesh of books for a bookcase w x h x d with `shelves` boards and a centre upright.
function bookInstances(THREE, it, mats, shelves, t, back, seed) {
  const rand = rng(seed);
  const { w, h, d } = it;
  const books = [];
  const bays = w > 1.6 ? [[-w / 2 + t, -t / 2], [t / 2, w / 2 - t]] : [[-w / 2 + t, w / 2 - t]];
  for (let i = 0; i <= shelves; i++) {
    const y0 = i === 0 ? t : (h * i) / (shelves + 1) + t / 2;
    const y1 = i === shelves ? h - t : (h * (i + 1)) / (shelves + 1) - t / 2;
    for (const [x0, x1] of bays) books.push(...fillShelf(rand, { x0, x1, y0, maxH: y1 - y0, front: d / 2 - 0.015, depth: d - back - 0.02 }));
  }
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, mats.books, books.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  books.forEach((b, i) => {
    q.setFromEuler(new THREE.Euler(0, 0, b.rz));
    m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
    mesh.setMatrixAt(i, m); mesh.setColorAt(i, c.setHex(b.colour));
  });
  mesh.name = 'books'; mesh.userData.count = books.length;
  return mesh;
}

// Parametric primitives (boxes with bevelled edges, cylinders, a torus hoop, a bowl), sized from the
// item's bounding box and merged into one mesh per material; each mesh lists the primitives it was
// built from in geometry.userData.parts. Local origin sits at the item's footprint centre on its
// base; local -z is the item's back.
const BEVEL = 0.006;
// `subs` are the sub-object kinds declared for this item; one that is not declared is not drawn.
// Their parts carry part.sub = kind, so a scene can be checked for what it shows.
function itemMeshes(THREE, it, mats, { seed = 1, onWall = false, subs = new Set(), body = true } = {}) {
  const parts = new Map(); // material -> geometries
  let tag = null;
  const add = (mat, g) => {
    if (tag && g.userData.part) g.userData.part = { ...g.userData.part, sub: tag };
    if (!parts.has(mat)) parts.set(mat, []);
    parts.get(mat).push(g);
  };
  const box = (w, h, d, x, y, z, mat, extra = {}) => add(mat, boxPart(THREE, { w, h, d, x, y, z, bevel: BEVEL, ...extra }));
  const cyl = (rt, rb, ch, x, y, z, mat, extra = {}) => add(mat, cylinderPart(THREE, { rt, rb, h: ch, x, y, z, ...extra }));
  const extra = [];
  const { w, d, h } = it;
  const t = Math.min(0.04, h / 4, w / 4, d / 4);
  switch (it.kind) {
    case 'desk': {
      // body: false draws only the declared sub-objects (on a modelled desk of the same size).
      if (body) {
        box(w, t, d, 0, h - t / 2, 0, mats.wood, { bevel: 0.012 });
        box(t, h - t, d - 0.02, -w / 2 + t / 2 + 0.02, (h - t) / 2, 0, mats.wood);
        box(t, h - t, d - 0.02, w / 2 - t / 2 - 0.02, (h - t) / 2, 0, mats.wood);
      }
      if (subs.has('papers')) {
        const rand = rng(seed);
        tag = 'papers'; // loose papers on the desk top, as in the basis photographs
        for (let i = 0; i < 7; i++) {
          box(0.216, 0.002, 0.279, -w * 0.05 + (rand() - 0.3) * w * 0.45, h + 0.001 + i * 0.0025, (rand() - 0.5) * d * 0.4, mats.paper, { ry: (rand() - 0.5) * 0.5, bevel: 0 });
        }
        tag = null;
      }
      if (subs.has('book-stack')) {
        const rand = rng(seed + 7);
        tag = 'book-stack'; // a stack of books at the desk's end, as in the basis photographs
        let y = h;
        for (let i = 0; i < 6 && w > 0.8; i++) {
          const bt = 0.03 + rand() * 0.025;
          box(0.17 + rand() * 0.06, bt, 0.24 + rand() * 0.05, w / 2 - 0.16, y + bt / 2, -d / 2 + 0.2, [mats.cloth, mats.cloth2, mats.paper][i % 3], { ry: (rand() - 0.5) * 0.15, bevel: 0.003 });
          y += bt;
        }
        tag = null;
      }
      break;
    }
    case 'table':
      box(w, t, d, 0, h - t / 2, 0, mats.wood, { bevel: 0.01 });
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(t, h - t, t, sx * (w / 2 - t / 2 - 0.02), (h - t) / 2, sz * (d / 2 - t / 2 - 0.02), mats.wood);
      break;
    case 'chair': {
      // Bentwood chair: round seat, four splayed legs, a hoop back.
      const seat = Math.min(0.45, h * 0.55), r = Math.min(w, d) / 2, leg = 0.014;
      cyl(r, r * 0.97, 0.035, 0, seat - 0.0175, 0, mats.wood, { seg: 24 });
      for (let k = 0; k < 4; k++) {
        const a = Math.PI / 4 + (k * Math.PI) / 2;
        cyl(leg, leg, seat - 0.03, Math.cos(a) * r * 0.78, (seat - 0.03) / 2, Math.sin(a) * r * 0.78, mats.wood, { rz: -Math.cos(a) * 0.06, rx: Math.sin(a) * 0.06, seg: 8 });
      }
      cyl(r * 0.75, r * 0.75, 0.012, 0, seat * 0.35, 0, mats.wood, { seg: 20, open: true });
      const hoopR = Math.min(r * 0.85, (h - seat) * 0.6);
      const hoop = new THREE.TorusGeometry(hoopR, 0.013, 8, 20, Math.PI).toNonIndexed();
      metreUVs(hoop, 'x');
      hoop.scale(1, (h - seat) / hoopR, 1);
      hoop.translate(0, seat, -r * 0.85);
      hoop.userData.part = { type: 'torus', r: hoopR, tube: 0.013 };
      add(mats.wood, hoop);
      break;
    }
    case 'bookcase': {
      // Open bookcase in two bays: thin back, sides, a centre upright, top, bottom and shelf boards
      // about every 0.38 m, filled with books.
      const back = Math.min(0.02, d / 4), shelves = Math.max(1, Math.round(h / 0.38) - 1);
      if (body) {
        box(w, h, back, 0, h / 2, -d / 2 + back / 2, mats.wood, { bevel: 0.003 });
        box(t, h, d, -w / 2 + t / 2, h / 2, 0, mats.wood);
        box(t, h, d, w / 2 - t / 2, h / 2, 0, mats.wood);
        if (w > 1.6) box(t, h - 2 * t, d - back, 0, h / 2, back / 2, mats.wood);
        box(w, t, d, 0, t / 2, 0, mats.wood);
        box(w + 0.02, t, d + 0.01, 0, h - t / 2, 0.005, mats.wood);
        for (let i = 1; i <= shelves; i++) box(w - 2 * t, t, d - back, 0, (h * i) / (shelves + 1), back / 2, mats.wood);
      }
      if (subs.has('books')) extra.push(bookInstances(THREE, it, mats, shelves, t, back, seed));
      break;
    }
    case 'shelf':
    case 'door':
      box(w, h, d, 0, h / 2, 0, mats.wood);
      break;
    case 'window': {
      const pane = boxPart(THREE, { w: w - 2 * t, h: h - 2 * t, d: Math.min(d, 0.01), x: 0, y: h / 2, z: 0, bevel: 0 });
      const pos = pane.attributes.position, col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const v = pos.getY(i) / h; // 0 at the sill, 1 at the head
        col.set([0.78 + 0.2 * v, 0.82 + 0.17 * v, 0.84 + 0.16 * v], i * 3);
      }
      pane.setAttribute('color', new THREE.BufferAttribute(col, 3)); pane.userData.parts = [pane.userData.part];
      extra.push(new THREE.Mesh(pane, mats.daylight));
      box(w, t, d, 0, t / 2, 0, mats.frame); box(w, t, d, 0, h - t / 2, 0, mats.frame);
      box(t, h, d, -w / 2 + t / 2, h / 2, 0, mats.frame); box(t, h, d, w / 2 - t / 2, h / 2, 0, mats.frame);
      break;
    }
    case 'blackboard':
      box(w, h, d, 0, h / 2, 0, mats.slate);
      break;
    case 'document':
      if (onWall) {
        // A document hung on the wall, as the basis photograph shows it: in a thin frame, its face
        // left blank (its text is not reproduced).
        const f = Math.min(0.025, w / 8, h / 8);
        box(w - 2 * f, h - 2 * f, 0.004, 0, h / 2, -d / 2 + 0.006, mats.paper, { bevel: 0 });
        // Faint ruled lines, so the blank face reads as paper whose text is not shown (DOCUMENT_CAPTION).
        const iw = w - 2 * f - 0.06, top = h - f - 0.05, bottom = f + 0.04;
        for (let y = top; y >= bottom; y -= 0.035) box(iw, 0.0025, 0.001, 0, y, -d / 2 + 0.0085, mats.rule, { bevel: 0 });
        for (const [bw, bh, bx, by] of [[w, f, 0, f / 2], [w, f, 0, h - f / 2], [f, h, -w / 2 + f / 2, h / 2], [f, h, w / 2 - f / 2, h / 2]]) box(bw, bh, d, bx, by, 0, mats.wood, { bevel: 0.003 });
      } else box(w, h, d, 0, h / 2, 0, mats.paper, { bevel: 0 });
      break;
    case 'lamp': {
      // Standard lamp with an upturned bowl shade.
      const r = Math.min(w, d) / 2, base = Math.min(0.03, h / 6), shade = Math.min(0.12, h / 4);
      cyl(r * 0.6, r * 0.65, base, 0, base / 2, 0, mats.brass, { seg: 24 });
      cyl(0.011, 0.011, h - base - shade, 0, base + (h - base - shade) / 2, 0, mats.brass, { seg: 10 });
      const bowl = new THREE.SphereGeometry(r * 0.95, 24, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).toNonIndexed();
      metreUVs(bowl, 'x');
      bowl.scale(1, shade / (r * 0.95), 1); bowl.translate(0, h, 0);
      bowl.userData.part = { type: 'bowl', r: r * 0.95, h: shade };
      add(mats.milk, bowl);
      break;
    }
    default:
      throw new Error(`unknown place item kind ${it.kind}`);
  }
  const out = [...parts].map(([mat, gs]) => new THREE.Mesh(mergeParts(gs), mat));
  return [...out, ...extra];
}

// Small caption card (w x 0.05 m) reading DOCUMENT_CAPTION, its top edge at the group origin.
function documentCaption(THREE, w) {
  const h = 0.05;
  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ece5d6'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#2a2622'; ctx.font = 'italic 17px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(DOCUMENT_CAPTION, c.width / 2, c.height / 2, c.width - 12);
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : 0xece5d6, roughness: 0.9 }));
  mesh.position.y = -h / 2;
  const g = new THREE.Group(); g.name = 'document-caption'; g.userData.text = DOCUMENT_CAPTION; g.add(mesh);
  return g;
}

// Floor-level label at the foot of an unseen wall, standing just in front of it.
function floorLabel(THREE, len) {
  const w = Math.min(len * 0.8, 2.4), h = 0.24;
  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 102;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#d8d4cc'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#2a2622'; ctx.font = '44px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(UNSEEN_LABEL, c.width / 2, c.height / 2, c.width - 40);
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, color: map ? 0xffffff : 0xd8d4cc }));
  mesh.position.y = LABEL_HEIGHT; mesh.name = 'unseen-label'; mesh.userData.text = UNSEEN_LABEL;
  return mesh;
}

// Study lighting, at most 4 live lights: daylight through the first window (the shadow caster on
// desktop), the standard lamp switched on, and spots on the exhibits, one per wall that carries
// them. A dim hemisphere fill takes any slot left. Contact darkening is baked (shell.js).
function placeLighting(THREE, scene, place, items, exhibits, phone) {
  const lights = [];
  const win = items.find(it => it.kind === 'window');
  if (win) {
    const inward = new THREE.Vector3(Math.sin(win.rotY), 0, Math.cos(win.rotY)); // the window's front faces into the room
    const sun = new THREE.SpotLight(0xe9f0ff, phone ? 55 : 65, 0, 0.7, 0.85, 2);
    sun.position.set(win.x - inward.x * 1.6, Math.min(place.h + 0.6, (win.y || 0) + win.h + 0.9), win.z - inward.z * 1.6);
    sun.target.position.set(win.x + inward.x * 2.6, 0.4, win.z + inward.z * 2.6);
    sun.castShadow = !phone;
    if (!phone) { sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0005; sun.shadow.radius = 5; }
    scene.add(sun, sun.target); lights.push(sun);
  }
  const lamp = items.find(it => it.kind === 'lamp');
  if (lamp) {
    const bulb = new THREE.PointLight(0xffc488, 2.2, 6, 2);
    bulb.position.set(lamp.x, (lamp.y || 0) + lamp.h - 0.04, lamp.z);
    scene.add(bulb); lights.push(bulb);
  }
  const byWall = new Map();
  for (const g of exhibits) { const k = g.userData.wall; if (!byWall.has(k)) byWall.set(k, []); byWall.get(k).push(g); }
  for (const grp of byWall.values()) {
    if (lights.length >= MAX_LIGHTS) break;
    const target = grp.map(g => aimPoint(THREE, g)).reduce((a, b) => a.add(b), new THREE.Vector3()).divideScalar(grp.length);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(grp[0].getWorldQuaternion(new THREE.Quaternion())).setY(0).normalize();
    const at = target.clone().add(normal.multiplyScalar(1.5)); at.y = place.h - 0.1;
    target.y -= 0.15;
    const spread = grp.length > 1 ? grp[grp.length - 1].position.distanceTo(grp[0].position) / 2 + 0.35 : 0.45;
    const s = new THREE.SpotLight(SPOT.color, SPOT.intensity * 0.55, 0, Math.min(1.1, Math.atan(spread / at.distanceTo(target)) + 0.06), 0.8, 2);
    s.position.copy(at); s.target.position.copy(target);
    scene.add(s, s.target); lights.push(s);
  }
  if (lights.length < MAX_LIGHTS) {
    const fill = new THREE.HemisphereLight(0xfff6ea, 0x3a332c, 0.3);
    scene.add(fill); lights.push(fill);
  }
  if (phone || !lights.some(l => l.castShadow)) {
    const first = lights.find(l => l.isSpotLight);
    if (first && !phone) first.castShadow = true;
  }
  return lights;
}

// Domestic wall colour for reconstructed rooms: a museum stand-in, not the photographed wallpaper.
export const STUDY_WALL = 0xb4a68f;
const WALL_ROT = { north: 0, east: -Math.PI / 2, south: Math.PI, west: Math.PI / 2 };
// Contact darkening each kind throws onto the floor and walls (strength 0-1, reach in metres).
const OCCLUSION = { bookcase: [0.55, 0.15], desk: [0.4, 0.25], table: [0.35, 0.2], chair: [0.3, 0.15], lamp: [0.25, 0.1], shelf: [0.4, 0.1], door: [0, 0.1], window: [0, 0.1], blackboard: [0.3, 0.04], document: [0.2, 0.03] };

export async function buildReconstructedPlace(THREE, chapter, { textures = {}, phone = false } = {}) {
  const rec = chapter.reconstruction || {};
  const place = rec.place;
  const errors = validatePlace(place, rec.basis_media_ids || [], chapter.exhibits || []);
  if (errors.length) throw new Error(`reconstructed place ${chapter.id || ''}: ${errors.join('; ')}`);

  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2622);
  const base = await createMaterials(THREE, textures, { floor: 'planks' });
  const mats = { ...base, ...placeMaterials(THREE, base) };
  base.plaster.color.set(STUDY_WALL); // a warmer, darker domestic wall than the gallery's (our choice, COLOUR_NOTE)
  const { w, d, h } = place;
  const unseen = new Set(place.unseen);

  const items = new THREE.Group(); items.name = 'items';
  // Furniture is built from the items; a sub-object (books, papers, book-stack) is built only if
  // an item declares it, on the parent it names.
  const furniture = place.items.filter(it => !isSub(it));
  const declared = new Map(); // parent item id -> declared sub-object kinds
  for (const it of place.items) if (isSub(it)) declared.set(it.parent, (declared.get(it.parent) || new Set()).add(it.kind));
  furniture.forEach((it, i) => {
    const g = new THREE.Group();
    const c = Math.abs(Math.cos(it.rotY)), sn = Math.abs(Math.sin(it.rotY));
    const hx = c * it.w / 2 + sn * it.d / 2, hz = sn * it.w / 2 + c * it.d / 2;
    const onWall = (it.y || 0) > 0.3 && (Math.abs(it.x) + hx >= w / 2 - AGAINST_WALL || Math.abs(it.z) + hz >= d / 2 - AGAINST_WALL);
    for (const mesh of itemMeshes(THREE, it, mats, { seed: 1000 + i, onWall, subs: declared.get(it.id) || new Set() })) {
      mesh.castShadow = !phone; mesh.receiveShadow = !phone; g.add(mesh);
    }
    g.position.set(it.x, it.y || 0, it.z); g.rotation.y = it.rotY;
    g.name = `item-${i}`; g.userData = { kind: it.kind, basis: it.basis, onWall };
    items.add(g);
  });
  scene.add(items);
  // Caption card under each document hung on the wall (fixed UI text, not content).
  items.children.forEach((g, i) => {
    const it = furniture[i];
    if (it.kind !== 'document' || !g.userData.onWall) return;
    const cap = documentCaption(THREE, Math.min(0.42, Math.max(0.3, it.w)));
    cap.position.set(it.x, (it.y || 0) - 0.06, it.z); cap.rotation.y = it.rotY;
    cap.translateZ(-it.d / 2 + 0.004); // flat on the wall, as the document's back is
    scene.add(cap);
  });

  const media = textures.media || {};
  const exhibitMeshes = new Map();
  for (const ex of chapter.exhibits || []) {
    const f = exhibitFiles(ex);
    const g = makeExhibit(THREE, ex, mats, f.front ? media[f.front] : null, f.back ? media[f.back] : null, chapter.quotes);
    const p = resolveSlot(place, ex.wall, ex.slot);
    g.position.set(p.x, p.y, p.z); g.rotation.y = p.rotY; g.userData.wall = ex.wall;
    scene.add(g); exhibitMeshes.set(ex.id, g);
  }
  scene.updateMatrixWorld(true);

  // Shell with baked contact shadows from the furniture and exhibits.
  const occluders = [];
  items.children.forEach((g, i) => {
    const [s, reach] = OCCLUSION[furniture[i].kind] || [0.3, 0.1];
    if (s > 0) occluders.push(occluderOf(THREE, g, s, reach));
  });
  for (const g of exhibitMeshes.values()) {
    const plinth = g.getObjectByName('plinth'), frame = g.getObjectByName('frame');
    if (plinth) occluders.push(occluderOf(THREE, plinth, 0.6, 0.12));
    if (frame) occluders.push(occluderOf(THREE, frame, 0.3, 0.035));
  }
  const shell = buildShell(THREE, place, {
    floor: mats.floor, ceiling: mats.ceiling, occluders, shadows: !phone,
    wallMaterial: name => (unseen.has(name) ? mats.unseen : mats.plaster),
  });
  for (const name of PLACE_WALLS) {
    const wall = shell.getObjectByName(`wall-${name}`);
    wall.userData.unseen = unseen.has(name);
    if (unseen.has(name)) {
      const g = new THREE.Group(); g.rotation.y = WALL_ROT[name];
      const label = floorLabel(THREE, name === 'north' || name === 'south' ? w : d);
      label.position.z = -(name === 'north' || name === 'south' ? d : w) / 2 + 0.01; // faces into the room
      g.add(label); g.name = `unseen-${name}`; shell.add(g);
    }
  }
  scene.add(shell);

  // Museum doors (entrance and exit): added by the museum, not evidenced (DOOR_NOTE), in the modern
  // museum style; on free wall clear of every item, its declared sub-objects, the exhibits, captions
  // and the unseen-wall labels (each at its own footprint); unseen walls first.
  const spots = placeDoors(place, doorObstacles(THREE, scene, exhibitMeshes), placeStart(place), { prefer: place.unseen });
  const doors = addDoors(THREE, scene, mats, spots, { museumAdded: true, labels: chapter.doors || {} });

  placeLighting(THREE, scene, place, place.items, [...exhibitMeshes.values()], phone);
  scene.userData.environmentIntensity = 0.35;
  return { scene, exhibitMeshes, viewpoints: placeViewpoints(place), start: placeStart(place), size: { w, d, h }, doors };
}

// --- The recreated study corner (Task 6) ---------------------------------------------------------
// A corner of period furniture inside a scanned room, in an area the chapter reserves for it
// (content/<slug>/study-corner.json). Same declared-items rule as a reconstructed place: every object
// is declared with the basis photographs it is visible in; sub-objects are drawn only if declared;
// a model's mesh may carry a sub-object (the bookcase's books) only if the corner declares it.
// Mirrored in tools/content_check.py validate_corner (shared cases: tools/tests/fixtures/corner_cases.json).
export const CORNER_KINDS = ['desk', 'chair', 'shelf', 'lamp', 'table', 'bookcase'];
// The recreation label: a slanted museum sign at floor level (w x h, d deep on its foot).
export const LABEL_SIGN = Object.freeze({ w: 0.8, d: 0.08, h: 0.36 });
export const CORNER_LABEL_PREFIX = 'Recreation based on photographs: ';
// Fixed UI disclosure on the corner's plaque.
export const CORNER_NOTE = 'Modern stand-in furniture of the kinds these two photographs show. The designs are not the originals; sizes and positions are estimated.';
// The Lite page has no 3D room: its copy of the plaque says where the corner stands.
export const CORNER_WHERE_LITE = 'In the 3D museum, this recreated corner stands in the room for this chapter.';
// The museum's own parts of the corner (not period objects): the label and the floor shadow.
export const CORNER_MUSEUM_PARTS = ['recreation-label', 'contact-shadow'];
const CATALOGUE_ID = /\b\d{1,3}-[A-Z]{1,3}-\d+\b/g;

function cornerFootprint(x, z, rot, w, d) {
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  const hx = c * w / 2 + s * d / 2, hz = s * w / 2 + c * d / 2;
  return [x - hx, x + hx, z - hz, z + hz];
}
const insideArea = (f, a) => f[0] >= a.min[0] - EPS && f[1] <= a.max[0] + EPS && f[2] >= a.min[1] - EPS && f[3] <= a.max[1] + EPS;
const overlaps = (a, b) => a[0] < b[1] - EPS && b[0] < a[1] - EPS && a[2] < b[3] - EPS && b[2] < a[3] - EPS;

// Pure. Errors for a corner against its area { id, min: [x, z], max: [x, z] }; [] means it may be built.
export function validateCorner(corner, area) {
  if (!corner || typeof corner !== 'object' || Array.isArray(corner)) return ['corner must be an object'];
  const errors = [];
  let basis = corner.basis_media_ids;
  if (!Array.isArray(basis) || !basis.length || !basis.every(b => typeof b === 'string' && b)) { errors.push('basis_media_ids must be a non-empty list'); basis = []; }
  basis = new Set(basis);
  let objs = corner.objects;
  if (!Array.isArray(objs) || !objs.length) { errors.push('objects must be a non-empty list'); objs = []; }
  const models = corner.models && typeof corner.models === 'object' && !Array.isArray(corner.models) ? corner.models : {};
  const ids = new Set(), furniture = new Map(), subs = new Map();
  objs.forEach((o, i) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) { errors.push(`object ${i}: must be an object`); return; }
    if (typeof o.id !== 'string' || !o.id.trim()) { errors.push(`object ${i}: id must be a non-empty string`); return; }
    if (ids.has(o.id)) errors.push(`id ${o.id} used twice`);
    ids.add(o.id);
  });
  for (const o of objs) if (o && typeof o.id === 'string' && !('parent' in o) && !furniture.has(o.id)) furniture.set(o.id, o);
  const boxes = [];
  for (const o of objs) {
    if (!o || typeof o.id !== 'string') continue;
    const at = `object ${o.id}`;
    if (!Array.isArray(o.basis_media_ids) || !o.basis_media_ids.length) errors.push(`${at}: needs basis_media_ids`);
    else for (const b of o.basis_media_ids) if (!basis.has(b)) errors.push(`${at}: basis ${b} is not one of the corner's basis photos`);
    if ('parent' in o) {
      const isSubKind = Object.hasOwn(SUB_KINDS, o.kind);
      if (!isSubKind) errors.push(`${at}: kind ${o.kind} is not one of the sub-objects ${Object.keys(SUB_KINDS).join(', ')}`);
      if (!furniture.has(o.parent)) errors.push(`${at}: parent ${o.parent} is not an object`);
      else if (isSubKind && furniture.get(o.parent).kind !== SUB_KINDS[o.kind]) errors.push(`${at}: ${o.kind} must stand on a ${SUB_KINDS[o.kind]}, not a ${furniture.get(o.parent).kind}`);
      else subs.set(o.parent, (subs.get(o.parent) || new Set()).add(o.kind));
      continue;
    }
    if (!CORNER_KINDS.includes(o.kind)) errors.push(`${at}: kind ${o.kind} is not one of ${CORNER_KINDS.join(', ')}`);
    let ok = true;
    for (const k of ['x', 'z', 'rotY']) if (!isNum(o[k])) { errors.push(`${at}: ${k} must be a number`); ok = false; }
    for (const k of ['w', 'd', 'h']) if (!isPos(o[k])) { errors.push(`${at}: ${k} must be a positive number`); ok = false; }
    if ('model' in o && !Object.hasOwn(models, o.model)) errors.push(`${at}: model ${o.model} is not in models`);
    if (ok) {
      const fp = cornerFootprint(o.x, o.z, o.rotY, o.w, o.d);
      if (!area || !insideArea(fp, area)) errors.push(`${at}: outside the area ${area && area.id}`);
      for (const [oid, other] of boxes) if (overlaps(fp, other)) errors.push(`objects ${oid} and ${o.id} overlap`);
      boxes.push([o.id, fp]);
    }
  }
  const users = new Map();
  for (const o of furniture.values()) if ('model' in o) users.set(o.model, [...(users.get(o.model) || []), o.id]);
  for (const [mid, spec] of Object.entries(models)) {
    if (!users.has(mid)) { errors.push(`model ${mid} is not used by any object`); continue; }
    if (users.get(mid).length > 1) { errors.push(`model ${mid} is used by more than one object`); continue; }
    for (const kind of (spec && spec.includes) || []) {
      if (!Object.hasOwn(SUB_KINDS, kind)) errors.push(`model ${mid} includes ${kind}, which is not a sub-object kind`);
      else if (!(subs.get(users.get(mid)[0]) || new Set()).has(kind)) errors.push(`model ${mid} includes ${kind}, which is not declared on object ${users.get(mid)[0]}`);
    }
  }
  const la = corner.label_at;
  if (!la || !['x', 'z', 'rotY'].every(k => isNum(la[k]))) errors.push('label_at must be {x, z, rotY}');
  else {
    const fp = cornerFootprint(la.x, la.z, la.rotY, LABEL_SIGN.w, LABEL_SIGN.d);
    if (!area || !insideArea(fp, area)) errors.push(`label_at: outside the area ${area && area.id}`);
    for (const [oid, other] of boxes) if (overlaps(fp, other)) errors.push(`label_at: the label overlaps object ${oid}`);
  }
  return errors;
}

// The label names the basis photographs as their records do (tools/content_check.py corner_label_errors).
export function cornerLabelErrors(label, credits) {
  if (typeof label !== 'string' || !label.startsWith(CORNER_LABEL_PREFIX)) return [`label must start with '${CORNER_LABEL_PREFIX}'`];
  const errs = [], rest = label.slice(CORNER_LABEL_PREFIX.length);
  const want = credits.map(c => (String(c || '').match(CATALOGUE_ID) || [])[0]).filter(Boolean);
  const named = rest.match(CATALOGUE_ID) || [];
  for (const i of want) if (!named.includes(i)) errs.push(`label does not name ${i}`);
  for (const i of named) if (!want.includes(i)) errs.push(`label names ${i}, which is not a basis photograph's catalogue id`);
  const holder = rest.split(CATALOGUE_ID)[0].trim();
  if (!holder || !credits.every(c => String(c || '').includes(holder))) errs.push(`label holder '${holder}' must appear in every basis photograph's credit`);
  return errs;
}

// Contact shadow baked from the objects' footprints: a soft dark field on the floor (alpha only), a
// fixed small texture (128 px), so the corner sits on the scan's floor without live shadows.
const SHADOW_PX = 128, SHADOW_MARGIN = 0.25;
function contactShadow(THREE, objects, area) {
  const x0 = area.min[0] - SHADOW_MARGIN, z0 = area.min[1] - SHADOW_MARGIN;
  const w = area.max[0] - area.min[0] + 2 * SHADOW_MARGIN, d = area.max[1] - area.min[1] + 2 * SHADOW_MARGIN;
  const a = new Float32Array(SHADOW_PX * SHADOW_PX);
  const reach = { bookcase: 0.16, desk: 0.12, chair: 0.1, lamp: 0.12, table: 0.12, shelf: 0.12 };
  const strength = { bookcase: 0.75, desk: 0.5, chair: 0.45, lamp: 0.4, table: 0.5, shelf: 0.6 };
  for (let j = 0; j < SHADOW_PX; j++) for (let i = 0; i < SHADOW_PX; i++) {
    const x = x0 + ((i + 0.5) / SHADOW_PX) * w, z = z0 + ((j + 0.5) / SHADOW_PX) * d;
    let v = 0;
    for (const o of objects) {
      // Distance from the point to the object's (turned) footprint rectangle.
      const c = Math.cos(o.rotY), s = Math.sin(o.rotY), dx = x - o.x, dz = z - o.z;
      const lx = c * dx - s * dz, lz = s * dx + c * dz;
      const ex = Math.max(Math.abs(lx) - o.w / 2, 0), ez = Math.max(Math.abs(lz) - o.d / 2, 0);
      const dist = Math.hypot(ex, ez), r = reach[o.kind] || 0.12;
      // Under a piece with legs (desk, chair) the floor is shaded lightly; under a cabinet fully.
      const inside = ex === 0 && ez === 0 ? (o.kind === 'bookcase' ? 1 : 0.55) : 0;
      v = Math.max(v, (strength[o.kind] || 0.5) * Math.max(inside, Math.exp(-((dist / r) ** 2) * 2.2)));
    }
    a[j * SHADOW_PX + i] = v;
  }
  const data = new Uint8Array(SHADOW_PX * SHADOW_PX * 4);
  for (let k = 0; k < a.length; k++) data.set([0, 0, 0, Math.round(255 * Math.min(1, a[k]) * 0.8)], k * 4);
  const tex = new THREE.DataTexture(data, SHADOW_PX, SHADOW_PX);
  tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, map: tex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x0 + w / 2, 0.004, z0 + d / 2);
  mesh.name = 'contact-shadow'; mesh.renderOrder = 1;
  mesh.userData.museum = 'contact-shadow';
  return mesh;
}

// The recreation label: a slanted sign on a low foot, its text drawn on a canvas (two lines).
function recreationLabel(THREE, text, at, mats) {
  const g = new THREE.Group(); g.name = 'recreation-label';
  g.userData = { museum: 'recreation-label', text };
  const { w, d, h } = LABEL_SIGN, ph = 0.2;
  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#efe9dc'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#2a2622'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cut = text.indexOf(': ');
      const lines = cut > 0 ? [text.slice(0, cut + 1), text.slice(cut + 2)] : [text];
      ctx.font = '600 54px system-ui, sans-serif';
      lines.forEach((l, i) => ctx.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * 76, c.width - 60));
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, ph), new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : 0xefe9dc, roughness: 0.9 }));
  face.position.set(0, h - ph / 2 * Math.cos(0.6), 0); face.rotation.x = -0.6; face.name = 'label-face';
  const foot = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, h - ph * Math.cos(0.6), d), mats.walnut || mats.wood);
  foot.position.y = (h - ph * Math.cos(0.6)) / 2;
  g.add(face, foot);
  g.position.set(at.x, 0, at.z); g.rotation.y = at.rotY;
  return g;
}

// The corner as the runtime builds it: corner = cornerRuntime(...) (src/content/load.js); models = the
// loaded bundle's scene (one named node per declared model). -> { group, objects: Map id -> Group,
// light }. Refuses a bundle node that is not a declared model (nothing undeclared is drawn).
export function buildStudyCorner(THREE, corner, { models = null, phone = false, materials = {} } = {}) {
  const errors = validateCorner(corner, corner.area);
  if (errors.length) throw new Error(`study corner: ${errors.join('; ')}`);
  const declaredModels = new Set(Object.keys(corner.models || {}));
  const nodes = new Map();
  if (models) {
    for (const n of models.children) {
      if (!declaredModels.has(n.name)) throw new Error(`study corner: the bundle carries ${n.name || 'an unnamed node'}, which is not a declared model`);
      nodes.set(n.name, n);
    }
  }
  const mats = { ...materials, ...placeMaterials(THREE, materials) };
  const group = new THREE.Group(); group.name = 'study-corner';
  // frameArea: the reserved area it stands in; a museum-note cue that frames this area frames the
  // corner (stationcam.js roomStations focus).
  group.userData = { frameGroup: corner.photo_group, label: corner.label, frameArea: corner.area && corner.area.id };
  const furniture = corner.objects.filter(o => !('parent' in o));
  const objects = new Map();
  const tag = (g, id) => { g.userData.objectId = id; return g; };
  furniture.forEach((o, i) => {
    const g = tag(new THREE.Group(), o.id); g.name = `object-${o.id}`; g.userData.kind = o.kind;
    const included = new Set(((corner.models || {})[o.model] || {}).includes || []);
    if (o.model) {
      const n = nodes.get(o.model);
      if (!n) throw new Error(`study corner: model ${o.model} for ${o.id} is not in the bundle`);
      const m = n.clone(); m.name = `model-${o.model}`; g.add(m);
    } else {
      for (const m of itemMeshes(THREE, o, mats, { seed: 2000 + i })) g.add(m);
    }
    // Each declared sub-object its parent's mesh does not carry is built on its own (body: false)
    // and held by a group tagged with its own declared id.
    for (const so of corner.objects.filter(x => x.parent === o.id && !included.has(x.kind))) {
      const h = tag(new THREE.Group(), so.id); h.name = `object-${so.id}`;
      for (const m of itemMeshes(THREE, o, mats, { seed: 2000 + i, subs: new Set([so.kind]), body: false })) h.add(m);
      g.add(h);
    }
    g.position.set(o.x, 0, o.z); g.rotation.y = o.rotY;
    group.add(g); objects.set(o.id, g);
  });
  for (const m of group.children) m.traverse(x => { if (x.isMesh) { x.castShadow = false; x.receiveShadow = false; } });
  group.add(contactShadow(THREE, furniture, corner.area));
  group.add(recreationLabel(THREE, corner.label, corner.label_at, mats));
  // Key light from the scan's window behind the corner: soft, no shadows, only on our furniture.
  let light = null;
  if (corner.light) {
    light = new THREE.SpotLight(0xfff4e6, phone ? 9 : 12, 6, 0.75, 0.9, 1.5);
    light.position.set(...corner.light.from); light.target.position.set(...corner.light.to);
    light.name = 'study-corner-key';
    group.add(light, light.target);
  }
  group.updateMatrixWorld(true);
  return { group, objects, light };
}
