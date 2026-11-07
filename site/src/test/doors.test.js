// Rule: every room has two museum doors, an entrance and an exit, each a framed panel door standing on
// a wall, inside the room, clear of every exhibit (hotspot anchors included), the title panel, the
// bench and, in a reconstructed place, every piece of furniture, declared sub-object and unseen-wall
// label. Their places come from the room's layout (placeDoors), not from coordinates per room.
import { it, expect, beforeAll, afterAll } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { placeDoors, DOOR, ROOM_TYPES, wallT } from '../museum/layout.js';
import { fovFor } from '../museum/camera.js';
import { roomStations } from '../museum/stationcam.js';
import { createOccluderIndex } from '../museum/occlusion.js';
import { roomInterior } from '../museum/camera.js';
import { DOCUMENT_CAPTION } from '../museum/reconstruction.js';
import { leavePlan, walkPose, LEAVE_MAX_MS, createDoors } from '../ui/doors.js';
import { proceduralChapter as loadProcedural, PROCEDURAL_NUMBERS } from './procedural.js';
// The procedural rooms' doors (layout.js placeDoors), on the procedural fixtures (Task 5 moved the
// shipped Einstein rooms into scans; their doors are tested in scan-placements.test.js).
const loadChapter = (slug, n) => loadProcedural(n);
const listChapters = () => PROCEDURAL_NUMBERS.map(n => ({ slug: 'einstein', n }));

const textures = { plaster: null, oak: null, media: {} };
// Canvas stub (as rooms-budget.test.js): records the text drawn, so the door signs can be read back.
const drawn = [];
const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 20 }), fillText: s => drawn.push(String(s)) }, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
beforeAll(() => { globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }; });
afterAll(() => { delete globalThis.document; });
// What the chapter page passes the room: the two door labels (src/content/journey.js roomDoors).
const LABELS = { entrance: 'Back: Journey map', exit: 'Next: American citizenship' };
const withDoors = c => ({ ...c, doors: LABELS });
const gallery = ROOM_TYPES['chapter-gallery'];
// The shipped Einstein gallery rooms (read from content).
const GALLERIES = () => listChapters().filter(c => c.slug === 'einstein').map(c => c.n).filter(n => loadChapter('einstein', n).room === 'chapter-gallery');
const ex = (n, wall, slot, type = 'framed-document') => ({ id: `ex${n}`, number: n, type, wall, slot, media_id: 'M', title: `Item ${n}` });
const synthetic = (wall, slots) => ({ id: 'fx', title: 'Synthetic chapter title', room: 'chapter-gallery', accent: '#5a2a2a', exhibits: slots.map((s, i) => ex(i + 1, wall, s)) });
const ROOMS = [
  // Every shipped Einstein room (read from content), then synthetic layouts.
  ...listChapters().filter(c => c.slug === 'einstein').map(({ n }) => { const c = loadChapter('einstein', n); return [`einstein/${n} (${c.room})`, withDoors(c)]; }),
  ...['north', 'south', 'east', 'west'].map(w => [`gallery, ${w} wall slots 1-4`, synthetic(w, [1, 2, 3, 4])]),
  ['gallery, exhibits on two walls', { ...synthetic('north', [1, 2, 3, 4]), exhibits: [ex(1, 'north', 1), ex(2, 'north', 3), ex(3, 'east', 2), ex(4, 'east', 4)] }],
];
const box = o => new THREE.Box3().setFromObject(o);
const sizeOf = (chapter, size) => size || gallery;

// Things a door must never overlap, by name: exhibits, the title panel, the bench, furniture items
// (with their declared sub-objects inside them) and unseen-wall floor labels.
function obstacles(scene, exhibitMeshes) {
  const out = [...exhibitMeshes].map(([id, g]) => [id, box(g)]);
  for (const name of ['text-panel', 'bench', 'document-caption']) { const o = scene.getObjectByName(name); if (o) out.push([name, box(o)]); }
  const items = scene.getObjectByName('items');
  if (items) for (const g of items.children) out.push([`${g.name} (${g.userData.kind})`, box(g)]);
  scene.traverse(o => { if (o.name.startsWith('unseen-') && o.name !== 'unseen-label') out.push([o.name, box(o)]); });
  return out;
}

it.each(ROOMS)('%s: an entrance and an exit door, on walls, inside the room, clear of everything else', async (_, chapter) => {
  const { scene, exhibitMeshes, doors, size } = await buildRoom(THREE, chapter, { textures, phone: true });
  scene.updateMatrixWorld(true);
  const r = sizeOf(chapter, size);
  expect(Object.keys(doors).sort()).toEqual(['entrance', 'exit']);
  const boxes = {};
  for (const key of ['entrance', 'exit']) {
    const g = doors[key];
    expect(g, `${key} door`).toBeTruthy();
    expect(g.name).toBe(`door-${key}`);
    expect(g.userData.door).toBe(key);
    const b = boxes[key] = box(g);
    // Inside the room (walls at +/- w/2, +/- d/2; floor 0; ceiling h).
    expect(b.min.x).toBeGreaterThanOrEqual(-r.w / 2 - 1e-6); expect(b.max.x).toBeLessThanOrEqual(r.w / 2 + 1e-6);
    expect(b.min.z).toBeGreaterThanOrEqual(-r.d / 2 - 1e-6); expect(b.max.z).toBeLessThanOrEqual(r.d / 2 + 1e-6);
    expect(b.min.y).toBeGreaterThanOrEqual(-1e-6); expect(b.max.y).toBeLessThan(r.h);
    // On a wall: flat against one wall plane, standing on the floor, door-sized.
    const touches = [b.min.x + r.w / 2, r.w / 2 - b.max.x, b.min.z + r.d / 2, r.d / 2 - b.max.z].filter(v => v < 0.01);
    expect(touches.length, `${key} door touches exactly one wall`).toBe(1);
    const thick = Math.min(b.max.x - b.min.x, b.max.z - b.min.z), wide = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
    expect(thick, "flat on the wall (handle included)").toBeLessThanOrEqual(0.1);
    expect(wide).toBeGreaterThanOrEqual(0.9 - 1e-6);
    expect(b.max.y - b.min.y).toBeGreaterThanOrEqual(2.0);
    expect(b.min.y).toBeLessThan(0.01);
    // Faces into the room.
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
    const c = b.getCenter(new THREE.Vector3());
    expect(n.x * -c.x + n.z * -c.z, `${key} door faces in`).toBeGreaterThan(0);
    // Clear of every exhibit, the title panel, the bench and the furniture.
    for (const [name, ob] of obstacles(scene, exhibitMeshes)) expect(b.intersectsBox(ob), `${key} door overlaps ${name}`).toBe(false);
    // The hotspot anchor sits mid-door, below the sign (which carries the same label), on the door.
    const anchor = g.getObjectByName('door-anchor');
    expect(anchor, `${key} door anchor`).toBeTruthy();
    const a = anchor.getWorldPosition(new THREE.Vector3());
    expect(b.clone().expandByScalar(0.05).containsPoint(a)).toBe(true);
    expect(a.y).toBeGreaterThan(0.9); expect(a.y).toBeLessThan(1.4);
    expect(Math.hypot(a.x - c.x, a.z - c.z)).toBeLessThan(0.06);
  }
  expect(boxes.entrance.intersectsBox(boxes.exit), 'the doors overlap each other').toBe(false);
});

const meshes = g => { const out = {}; g.traverse(o => { if (o.isMesh) out[o.name] = o; }); return out; };
it('gallery doors are panelled walnut doors in the museum kit: joinery architrave, brass fittings, a sign', async () => {
  const { doors } = await buildRoom(THREE, withDoors(loadChapter('einstein', 1)), { textures, phone: true });
  for (const g of Object.values(doors)) {
    const m = meshes(g);
    expect(Object.keys(m).sort()).toEqual(['door-fittings', 'door-frame', 'door-leaf', 'door-sign']);
    expect(m['door-frame'].material.name).toBe('joinery');
    expect(m['door-leaf'].material.name).toBe('walnut');
    expect(m['door-leaf'].geometry.userData.parts.length, 'leaf with raised panels').toBeGreaterThan(1);
    expect(m['door-fittings'].material.name).toBe('brass');
    expect(g.userData.museumAdded).toBe(false);
  }
});

it('in a reconstructed place the doors are visibly modern museum doors, not period doors', async () => {
  const { doors } = await buildRoom(THREE, withDoors(loadChapter('einstein', 2)), { textures, phone: true });
  for (const g of Object.values(doors)) {
    const m = meshes(g);
    expect(g.userData.museumAdded).toBe(true);
    expect(Object.keys(m).sort()).toEqual(['door-fittings', 'door-frame', 'door-leaf', 'door-sign']);
    // Flush leaf (one slab, no panels) painted in the museum neutral; graphite frame and pull handle.
    expect(m['door-leaf'].geometry.userData.parts.length).toBe(1);
    expect(m['door-leaf'].material.name).toBe('museum-neutral');
    expect(m['door-leaf'].material.map || null).toBeNull();
    for (const k of ['door-frame', 'door-fittings']) expect(m[k].material.name).toBe('fitting');
    // A vertical pull bar, not a lever: its longest part stands upright.
    const parts = m['door-fittings'].geometry.userData.parts;
    expect(parts.some(p => p.type === 'cylinder' && p.h >= 0.3)).toBe(true);
    // Nothing of the door uses the walnut of the furniture.
    g.traverse(o => { if (o.isMesh) expect(o.material.name).not.toBe('walnut'); });
  }
});

it('each door carries a sign with its own label, both drawn on one small shared atlas', async () => {
  for (const n of listChapters().filter(c => c.slug === 'einstein').map(c => c.n)) {
    drawn.length = 0;
    const { doors } = await buildRoom(THREE, withDoors(loadChapter('einstein', n)), { textures, phone: true });
    const signs = ['entrance', 'exit'].map(k => meshes(doors[k])['door-sign']);
    expect(signs.map(s => s.userData.text)).toEqual([LABELS.entrance, LABELS.exit]);
    expect(drawn).toEqual(expect.arrayContaining([LABELS.entrance, LABELS.exit]));
    const [a, b] = signs.map(s => s.material.map);
    expect(a).toBeTruthy();
    expect(a).toBe(b); // one texture for both signs
    expect(a.image.width * a.image.height).toBeLessThanOrEqual(512 * 128);
  }
  // Without labels (a dev room) the atlas is still drawn and counted, with no text on it.
  drawn.length = 0;
  const { doors } = await buildRoom(THREE, loadChapter('einstein', 1), { textures, phone: true });
  expect(meshes(doors.exit)['door-sign'].material.map).toBeTruthy();
  expect(['entrance', 'exit'].map(k => meshes(doors[k])['door-sign'].userData.text)).toEqual(['', '']);
  expect(drawn.filter(t => /^(Next|Back|Exit)/.test(t))).toEqual([]);
});

const inFrame = (camera, p) => { const v = p.clone().project(camera); return v.z < 1 && Math.abs(v.x) <= 0.95 && Math.abs(v.y) <= 0.95; };
// Task 4 fix round 1: the room opens on a framed view of the first narrated exhibit group, not on an
// establishing view turned to show the exit door; the doors are reached with the stage door buttons,
// or by turning in place. These tests check that a door is in clear view when the visitor at the
// opening station turns to face it (they checked the door in the opening frame before).
const opening = (built, chapter, w, h) => roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect: w / h, canvasH: h, scene: built.scene }).opening;
const facing = (eye, target, aspect) => {
  const camera = new THREE.PerspectiveCamera(fovFor(aspect), aspect, 0.05, 40);
  camera.position.set(...eye); camera.lookAt(...target); camera.updateMatrixWorld(true);
  return camera;
};
const doorPoint = g => { const c = box(g).getCenter(new THREE.Vector3()); return new THREE.Vector3(c.x, 1.1, c.z); };
const doorSeen = (built, eye, g, aspect) => {
  const p = doorPoint(g), camera = facing(eye, p.toArray(), aspect);
  const idx = createOccluderIndex([built.scene], { owners: [g] });
  return inFrame(camera, p) && !idx.blocked(new THREE.Vector3(...eye), p, g);
};
it('in every gallery, turning in place at the opening station brings each door into clear view, on a phone and on a desktop', async () => {
  const galleries = GALLERIES();
  expect(galleries.length).toBeGreaterThan(0);
  for (const n of galleries) {
    const chapter = withDoors(loadChapter('einstein', n));
    const built = await buildRoom(THREE, chapter, { textures, phone: true });
    built.scene.updateMatrixWorld(true);
    for (const [w, h] of [[358, 591], [1168, 630]]) {
      const st = opening(built, chapter, w, h);
      for (const k of ['exit', 'entrance']) expect(doorSeen(built, st.position, built.doors[k], w / h), `einstein/${n} ${k} door at ${w}x${h}`).toBe(true);
    }
  }
});

// The study's exhibits hang on the west wall and its only free wall is on the north-east: the opening
// frames the exhibits; the exit is a turn away, in clear view (no bookcase or desk in between).
it('the study: from the opening station the exit door is in clear view once the visitor turns to it', async () => {
  const chapter = withDoors(loadChapter('einstein', 2));
  const built = await buildRoom(THREE, chapter, { textures, phone: true });
  built.scene.updateMatrixWorld(true);
  for (const [w, h] of [[358, 591], [1168, 630]]) {
    const st = opening(built, chapter, w, h);
    expect(doorSeen(built, st.position, built.doors.exit, w / h), `exit at ${w}x${h}`).toBe(true);
    // The opening itself looks at exhibits (framing.test.js checks the framing).
    const camera = facing(st.position, st.look, w / h);
    expect([...built.exhibitMeshes.values()].some(g => inFrame(camera, g.getWorldPosition(new THREE.Vector3()))), 'an exhibit').toBe(true);
  }
});

it('the entrance is on a different wall from the exit, and doors keep 0.4 m from corners and the title panel', async () => {
  for (const n of listChapters().filter(c => c.slug === 'einstein').map(c => c.n)) {
    const { scene, doors, size } = await buildRoom(THREE, withDoors(loadChapter('einstein', n)), { textures, phone: true });
    scene.updateMatrixWorld(true);
    expect(doors.entrance.userData.spot.wall, `einstein/${n}`).not.toBe(doors.exit.userData.spot.wall);
    if (loadChapter('einstein', n).room !== 'chapter-gallery') continue; // the study's north-east stretch is narrower than a door plus 0.8 m
    for (const g of Object.values(doors)) {
      const s = g.userData.spot, len = s.wall === 'north' || s.wall === 'south' ? size.w : size.d;
      expect(len / 2 - (Math.abs(s.t) + s.w / 2), `${g.name} to the corner`).toBeGreaterThanOrEqual(0.4 - 1e-9);
      const pb = box(scene.getObjectByName('text-panel'));
      const db = box(g).expandByScalar(0.4);
      expect(db.intersectsBox(pb), `${g.name} within 0.4 m of the title panel`).toBe(false);
    }
  }
});

// placeDoors on its own: a pure layout helper.
const view = { eye: [2.6, 1.6, 3.2], target: [-1.2, 0.1, -6] };
it('placeDoors puts both doors on free wall, never on a wall segment an obstacle blocks', () => {
  // Block the whole north, east and south walls: both doors go on the west wall, side by side.
  const blocked = [
    { min: [-4, 0, -6], max: [4, 3, -5.5] }, { min: [3.5, 0, -6], max: [4, 3, 6] }, { min: [-4, 0, 5.5], max: [4, 3, 6] },
  ];
  const d = placeDoors(gallery, blocked, view);
  for (const k of ['entrance', 'exit']) {
    expect(d[k].wall).toBe('west');
    expect(d[k].x).toBeCloseTo(-gallery.w / 2);
    expect(d[k].rotY).toBeCloseTo(Math.PI / 2);
    expect(Math.abs(d[k].z) + DOOR.w / 2).toBeLessThanOrEqual(gallery.d / 2);
  }
  expect(Math.abs(d.entrance.z - d.exit.z)).toBeGreaterThanOrEqual(DOOR.w + DOOR.gap - 1e-9);
});

it('placeDoors keeps a door clear of an obstacle standing in front of the wall, not only one on it', () => {
  // A table 0.3 m out from the middle of the west wall, everything else blocked but the west wall.
  const blocked = [
    { min: [-4, 0, -6], max: [4, 3, -5.5] }, { min: [3.5, 0, -6], max: [4, 3, 6] }, { min: [-4, 0, 5.5], max: [4, 3, 6] },
    { min: [-3.7, 0, -1], max: [-3.2, 0.8, 1] },
  ];
  const d = placeDoors(gallery, blocked, view);
  for (const k of ['entrance', 'exit']) expect(Math.abs(d[k].z) - DOOR.w / 2, `${k} clear of the table`).toBeGreaterThanOrEqual(1 + DOOR.gap - 1e-9);
});

it('placeDoors returns null for a door that cannot fit, never a door through an obstacle', () => {
  const all = [{ min: [-4, 0, -6], max: [4, 3, 6] }];
  expect(placeDoors(gallery, all, view)).toEqual({ entrance: null, exit: null });
  // Room for exactly one door: the exit gets it.
  const one = [{ min: [-4, 0, -6], max: [4, 3, -5.5] }, { min: [3.5, 0, -6], max: [4, 3, 6] }, { min: [-4, 0, 5.5], max: [4, 3, 6] },
    { min: [-4, 0, -6], max: [-3.5, 3, 0] }, { min: [-4, 0, 1.6], max: [-3.5, 3, 6] }];
  const d = placeDoors(gallery, one, view);
  expect(d.exit).not.toBeNull();
  expect(d.entrance).toBeNull();
});

it('placeDoors faces the exit toward the opening view and the entrance away from it', () => {
  const d = placeDoors(gallery, [], view);
  const dir = new THREE.Vector2(view.target[0] - view.eye[0], view.target[2] - view.eye[2]).normalize();
  const off = s => { const v = new THREE.Vector2(s.x - view.eye[0], s.z - view.eye[2]).normalize(); return Math.acos(Math.max(-1, Math.min(1, v.dot(dir)))); };
  expect(off(d.exit)).toBeLessThan(off(d.entrance));
  expect(off(d.entrance)).toBeGreaterThan(Math.PI / 2);
});

it('placeDoors fits a 0.9 m door where a 1 m door does not fit, never narrower', () => {
  // Only a 0.95 m stretch of the west wall is free (plus the gaps).
  const g = DOOR.gap, blocked = [
    { min: [-4, 0, -6], max: [4, 3, -5.5] }, { min: [3.5, 0, -6], max: [4, 3, 6] }, { min: [-4, 0, 5.5], max: [4, 3, 6] },
    { min: [-4, 0, -6], max: [-3.5, 3, -g] }, { min: [-4, 0, 0.95 + g], max: [-3.5, 3, 6] },
  ];
  const d = placeDoors(gallery, blocked, view);
  expect(d.exit).toMatchObject({ wall: 'west', w: DOOR.minW });
  expect(d.entrance).toBeNull();
  expect(DOOR.minW).toBe(0.9);
  const tight = [...blocked.slice(0, 4), { min: [-4, 0, 0.85 + g], max: [-3.5, 3, 6] }];
  expect(placeDoors(gallery, tight, view)).toEqual({ entrance: null, exit: null });
});

it('placeDoors stands the exit in the middle of free wall in view, not jammed against a corner or obstacle', () => {
  // The west wall is free; a door hard in the north-west corner would be nearest the gaze.
  const blocked = [{ min: [-4, 0, -6], max: [4, 3, -5.5] }, { min: [3.5, 0, -6], max: [4, 3, 6] }, { min: [-4, 0, 5.5], max: [4, 3, 6] }];
  const d = placeDoors(gallery, blocked, view);
  const corner = gallery.d / 2 - (Math.abs(d.exit.t) + d.exit.w / 2);
  expect(corner).toBeGreaterThanOrEqual(0.4);
  // ... and it is still in the opening view (within the phone's half field of view).
  const dir = new THREE.Vector2(view.target[0] - view.eye[0], view.target[2] - view.eye[2]).normalize();
  const v = new THREE.Vector2(d.exit.x - view.eye[0], d.exit.z - view.eye[2]).normalize();
  expect(Math.acos(v.dot(dir)) * 180 / Math.PI).toBeLessThanOrEqual(27.5);
});

it('placeDoors prefers the walls it is told to (an unseen wall in a reconstruction) for both doors', () => {
  const d = placeDoors(gallery, [], view, { prefer: ['east'] });
  expect(d.exit.wall).toBe('east');
  // The entrance takes another wall when one is free.
  expect(d.entrance.wall).not.toBe('east');
});

// The exit walk: at most 1.2 s, eased; under reduced motion a fade only.
it('leaving takes at most 1.2 s; reduced motion has no walk, only a fade', () => {
  const full = leavePlan(false), reduced = leavePlan(true);
  expect(full.walkMs).toBeGreaterThan(0);
  expect(full.walkMs + full.fadeMs).toBeLessThanOrEqual(LEAVE_MAX_MS);
  expect(LEAVE_MAX_MS).toBeLessThanOrEqual(1200);
  expect(reduced.walkMs).toBe(0);
  expect(reduced.fadeMs).toBeGreaterThan(0);
  expect(reduced.fadeMs).toBeLessThanOrEqual(LEAVE_MAX_MS);
});

it('the walk is eased: it starts and ends slowly and reaches the door pose exactly', () => {
  const from = { eye: [0, 1.6, 0], target: [0, 1.6, -1] }, to = { eye: [2, 1.6, -2], target: [3, 1.2, -2] };
  const at = t => walkPose(from, to, t);
  expect(at(0)).toEqual(from);
  expect(at(1)).toEqual(to);
  const step = (a, b) => Math.hypot(...at(b).eye.map((v, i) => v - at(a).eye[i]));
  expect(step(0, 0.1)).toBeLessThan(step(0.45, 0.55));
  expect(step(0.9, 1)).toBeLessThan(step(0.45, 0.55));
  expect(at(-1)).toEqual(from); expect(at(2)).toEqual(to);
});

// A door leave tells its listeners just before it navigates (story mode writes its autoplay token
// there), and never when the leave is cancelled during the walk or the fade.
it('doors: beforeNavigate runs right before the navigation, never for a cancelled leave', async () => {
  const listeners = {};
  const link = { dataset: { door: 'exit' }, href: 'http://h/x/2/?story=1', addEventListener: (t, f) => { listeners.click = f; } };
  const stage = { dataset: {} };
  const root = { querySelector: s => (s === '[data-stage]' ? stage : null), querySelectorAll: () => [link], addEventListener: (t, f) => { listeners.key = f; } };
  const saved = globalThis.addEventListener;
  globalThis.addEventListener = () => {};
  try {
    const order = [];
    const doors = createDoors({ root, navigate: u => order.push(`nav:${u}`), reduced: () => false });
    let walked;
    doors.setRoom({ walkToDoor: () => new Promise(r => { walked = r; }), restorePose: () => {} });
    doors.beforeNavigate(u => order.push(`before:${u}`));
    const click = { button: 0, preventDefault() {} };
    listeners.click(click);
    listeners.key({ key: 'Escape', defaultPrevented: false }); // Esc mid-walk
    walked(true);
    await new Promise(r => setTimeout(r, 400));
    expect(order).toEqual([]);
    const p = doors.exitTo('http://h/x/3/?story=1');
    walked(true);
    expect(await p).toBe(true);
    expect(order).toEqual(['before:http://h/x/3/?story=1', 'nav:http://h/x/3/?story=1']);
  } finally { globalThis.addEventListener = saved; }
});
