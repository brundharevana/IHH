// Each room stores a composed establishing view (built.start): standing back from the wall it faces,
// at eye height. Since Task 4 fix round 1 it is the opening only of a room without exhibits; rooms
// with exhibits open on a framed exhibit group (stationcam.js roomStations, framing.js).
import { it, expect } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { roomInterior, fovFor, horizontalFov, MIN_HFOV, MAX_FOV, BASE_FOV } from '../museum/camera.js';
import { proceduralChapter, PROCEDURAL_NUMBERS } from './procedural.js';
import { roomStations } from '../museum/stationcam.js';
import { createOccluderIndex } from '../museum/occlusion.js';

const build = chapter => buildRoom(THREE, chapter, { textures: { plaster: null, oak: null, media: {} }, phone: true });
// Every shipped Einstein room (read from content, never a fixed list).
// Procedural rooms (fixtures: the Einstein chapters before Task 5 moved them into scans).
const rooms = PROCEDURAL_NUMBERS.map(proceduralChapter);

it('every room has a start pose at eye height, inside the room, at least 2.5 m back from the wall it faces', async () => {
  for (const chapter of rooms) {
    const { start, size } = await build(chapter);
    expect(start, chapter.id).toBeDefined();
    const eye = new THREE.Vector3(...start.eye), target = new THREE.Vector3(...start.target);
    expect(eye.y).toBeCloseTo(1.6);
    expect(roomInterior(size).containsPoint(eye)).toBe(true);
    // The facing wall is where the gaze ray meets the room box.
    const dir = target.clone().sub(eye).setY(0).normalize();
    const tWall = Math.min(...['x', 'z'].map(a => (dir[a] === 0 ? Infinity : ((Math.sign(dir[a]) * (a === 'x' ? size.w : size.d)) / 2 - eye[a]) / dir[a])));
    expect(tWall, `${chapter.id} distance to facing wall`).toBeGreaterThanOrEqual(2.5);
  }
});

it('the study opens from the back of the room looking at the bookcase wall, not from its centre', async () => {
  const { start, size } = await build(rooms[1]);
  expect(start.eye[2]).toBeGreaterThan(size.d / 4); // back half of the room
  expect(start.target[2]).toBeCloseTo(-size.d / 2); // facing the north (bookcase) wall
});

it('the start eye is not inside any piece of furniture', async () => {
  const { scene, start } = await build(rooms[1]);
  const eye = new THREE.Vector3(...start.eye);
  scene.updateMatrixWorld(true);
  for (const item of scene.getObjectByName('items').children) {
    expect(new THREE.Box3().setFromObject(item).expandByScalar(0.2).containsPoint(eye), item.name).toBe(false);
  }
});

it('the lens widens on a portrait phone so the horizontal view is at least MIN_HFOV degrees', () => {
  for (const aspect of [358 / 591, 390 / 600, 0.75, 1, 1200 / 630, 2.4]) {
    const fov = fovFor(aspect);
    expect(fov).toBeGreaterThanOrEqual(BASE_FOV);
    expect(fov).toBeLessThanOrEqual(MAX_FOV);
    if (aspect >= 0.6) expect(horizontalFov(fov, aspect)).toBeGreaterThanOrEqual(MIN_HFOV - 0.01);
  }
  // Real-scan museum spec (Camera): 75 degrees vertical from 16:9 up; it was a 50 degree lens before.
  expect(fovFor(1200 / 630)).toBe(75);
  expect(fovFor(16 / 9)).toBe(75);
});

// The first frame (Task 4 fix round 1): a framed view of the first narrated exhibit group, on a
// phone held upright and on a desktop screen (framing.test.js checks every exhibit of the group in
// frame and big enough). In a reconstructed place the bookcase, the room's character, was in that
// first frame when it was an establishing view; now it is in clear view one turn away.
const inFrame = (camera, p) => {
  const v = p.clone().project(camera);
  return v.z < 1 && Math.abs(v.x) <= 0.92 && Math.abs(v.y) <= 0.92;
};
it('the opening view shows at least one exhibit, on a phone and on a desktop', async () => {
  for (const chapter of rooms) {
    const built = await build(chapter), { scene, exhibitMeshes } = built;
    scene.updateMatrixWorld(true);
    for (const [w, h] of [[390, 644], [1200, 630]]) {
      const aspect = w / h;
      const { opening } = roomStations({ start: built.start, exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect, canvasH: h, scene });
      const camera = new THREE.PerspectiveCamera(fovFor(aspect), aspect, 0.05, 40);
      camera.position.set(...opening.position); camera.lookAt(...opening.look); camera.updateMatrixWorld(true);
      const shown = [...exhibitMeshes.values()].filter(g => inFrame(camera, g.getWorldPosition(new THREE.Vector3())));
      expect(shown.length, `${chapter.id} at aspect ${aspect.toFixed(2)}`).toBeGreaterThanOrEqual(1);
      if (chapter.room === 'reconstructed-place') {
        const bookcase = scene.getObjectByName('items').children.find(g => g.userData.kind === 'bookcase');
        const c = new THREE.Box3().setFromObject(bookcase).getCenter(new THREE.Vector3());
        const eye = new THREE.Vector3(...opening.position);
        const idx = createOccluderIndex([scene], { owners: [bookcase] });
        expect(idx.blocked(eye, c, bookcase), `${chapter.id} bookcase in clear view from the opening station`).toBe(false);
      }
    }
  }
});
