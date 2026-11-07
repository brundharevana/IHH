// Rule: the chapter title panel is the introductory text panel of the exhibit wall: on the same
// wall as the first exhibit, to its left with a gap, at eye level on the hanging line, clear of
// every frame and hotspot, and in view from the opening station. Its place is derived from the exhibit layout.
import { it, expect } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { ROOM_TYPES, HEIGHTS, wallT } from '../museum/layout.js';
import { fovFor, roomInterior } from '../museum/camera.js';
import { roomStations } from '../museum/stationcam.js';
import { proceduralChapter } from './procedural.js';
// The gallery's wall title panel (procedural rooms; fixtures from before Task 5's scanned rooms).
const loadChapter = (slug, n) => proceduralChapter(n);

const textures = { plaster: null, oak: null, media: {} };
const r = ROOM_TYPES['chapter-gallery'];
const ex = (n, wall, slot, type = 'framed-document') => ({ id: `ex${n}`, number: n, type, wall, slot, media_id: 'M', title: `Item ${n}` });
const synthetic = (wall, slots) => ({
  id: 'fx', title: 'Synthetic chapter title', room: 'chapter-gallery', accent: '#5a2a2a', exhibits: slots.map((s, i) => ex(i + 1, wall, s)),
});
const chapters = [
  ['chapter 1', loadChapter('einstein', 1)],
  ...['north', 'south', 'east', 'west'].map(w => [`${w} wall, slots 2-4`, synthetic(w, [2, 3, 4])]),
  ['north wall, slot 1 only', synthetic('north', [1])],
];
const build = c => buildRoom(THREE, c, { textures, phone: false });
const tRange = (wall, box) => {
  const ts = [[box.min.x, box.min.z], [box.min.x, box.max.z], [box.max.x, box.min.z], [box.max.x, box.max.z]].map(([x, z]) => wallT(wall, x, z));
  return { min: Math.min(...ts), max: Math.max(...ts) };
};

it.each(chapters)('%s: the title panel is on the first exhibit wall, left of it with a gap, clear of every frame', async (_, chapter) => {
  const { scene, exhibitMeshes } = await build(chapter);
  scene.updateMatrixWorld(true);
  const panel = scene.getObjectByName('text-panel');
  expect(panel, 'title panel exists').toBeDefined();
  expect(panel.userData.text).toBe(chapter.title);
  const first = chapter.exhibits.find(e => e.number === 1), fg = exhibitMeshes.get(first.id);
  // Same wall: same facing, and the same distance from the wall plane (within the hang depth).
  expect(panel.rotation.y).toBeCloseTo(fg.rotation.y);
  const pb = new THREE.Box3().setFromObject(panel), fb = new THREE.Box3().setFromObject(fg);
  const normalAxis = ['north', 'south'].includes(first.wall) ? 'z' : 'x';
  expect(Math.abs(pb.getCenter(new THREE.Vector3())[normalAxis] - fb.getCenter(new THREE.Vector3())[normalAxis])).toBeLessThan(0.1);
  // Left of exhibit 1 (viewer's left facing the wall), with a gap of at least 0.15 m.
  const pt = tRange(first.wall, pb), ft = tRange(first.wall, fb);
  expect(ft.min - pt.max, 'gap to exhibit 1').toBeGreaterThanOrEqual(0.15);
  // On the wall, not past its end.
  expect(pt.min).toBeGreaterThanOrEqual(-(first.wall === 'north' || first.wall === 'south' ? r.w : r.d) / 2);
  // No bounding-box overlap with any exhibit, hotspot anchors included (they ride inside the exhibit group).
  for (const [id, g] of exhibitMeshes) {
    expect(pb.intersectsBox(new THREE.Box3().setFromObject(g)), `overlaps ${id}`).toBe(false);
  }
  // Eye level, on the hanging line.
  expect(pb.getCenter(new THREE.Vector3()).y).toBeGreaterThanOrEqual(1.4);
  expect(pb.getCenter(new THREE.Vector3()).y).toBeLessThanOrEqual(1.6);
  expect(HEIGHTS.frameCentre - pb.getCenter(new THREE.Vector3()).y).toBeLessThanOrEqual(0.15);
  // It stays on the wall: no part of it is below the skirting or above the picture rail.
  expect(pb.min.y).toBeGreaterThan(0.5);
  expect(pb.max.y).toBeLessThan(3.1);
});

it('no title panel hangs on a wall without exhibits', async () => {
  const { scene } = await build(loadChapter('einstein', 1));
  scene.updateMatrixWorld(true);
  const pb = new THREE.Box3().setFromObject(scene.getObjectByName('text-panel'));
  expect(pb.getCenter(new THREE.Vector3()).x).not.toBeCloseTo(-r.w / 2, 0);
  expect(pb.getCenter(new THREE.Vector3()).z).toBeLessThan(-r.d / 2 + 0.3); // north wall
});

const inFrame = (camera, p) => {
  const v = p.clone().project(camera);
  return v.z < 1 && Math.abs(v.x) <= 0.92 && Math.abs(v.y) <= 0.92;
};
// Task 4 fix round 1: the opening is a framed view of the first exhibit group (it was an establishing
// view with the title panel in it). The title panel is wholly in view once the visitor
// at the opening station turns to it, on a phone and on a desktop.
it('the title panel is fully in view from the opening station, a turn away, on a phone and on a desktop', async () => {
  const chapter = loadChapter('einstein', 1);
  const built = await build(chapter), { scene } = built;
  scene.updateMatrixWorld(true);
  const pb = new THREE.Box3().setFromObject(scene.getObjectByName('text-panel'));
  const corners = [pb.min.x, pb.max.x].flatMap(x => [pb.min.y, pb.max.y].flatMap(y => [pb.min.z, pb.max.z].map(z => new THREE.Vector3(x, y, z))));
  for (const [w, h] of [[358, 591], [390, 644], [1200, 630], [1168, 630]]) { // the stage on phones and on 1440 x 900-class desktops
    const aspect = w / h;
    const { opening } = roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect, canvasH: h, scene });
    const camera = new THREE.PerspectiveCamera(fovFor(aspect), aspect, 0.05, 40);
    camera.position.set(...opening.position);
    camera.lookAt(...pb.getCenter(new THREE.Vector3()).toArray()); camera.updateMatrixWorld(true);
    for (const c of corners) expect(inFrame(camera, c), `corner ${c.toArray()} at ${w}x${h}`).toBe(true);
  }
});
