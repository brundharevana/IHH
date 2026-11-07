// Every surface a visitor can see is finished: no near-black planes, frames hang on the wall with a
// finished back, a 360 document's plinth stands against its wall, a missing texture shows a designed
// placeholder card, and the camera is held inside the room (src/museum/camera.js).
import { it, expect } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { makeExhibit } from '../museum/exhibits.js';
import { createMaterials } from '../museum/materials.js';
import { WALL_GAP } from '../museum/layout.js';
import { roomInterior, standPoint, VIEW_MARGIN } from '../museum/camera.js';
import { proceduralChapter, PROCEDURAL_NUMBERS } from './procedural.js';

// WCAG relative luminance of an sRGB colour (0 black, 1 white).
const luminance = c => {
  const lin = v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const s = c.clone().convertLinearToSRGB();
  return 0.2126 * lin(s.r) + 0.7152 * lin(s.g) + 0.0722 * lin(s.b);
};
// Darkest colour a lit surface may have: dark walnut wood (#5b4330) is ~0.065.
const MIN_LUMINANCE = 0.05;
// Procedural rooms (fixtures: the Einstein chapters before Task 5 moved them into scans).
const rooms = PROCEDURAL_NUMBERS.map(proceduralChapter);
const build = chapter => buildRoom(THREE, chapter, { textures: { plaster: null, oak: null, media: {} }, phone: false });

const materialsOf = obj => {
  const out = [];
  obj.traverse(o => { if (o.isMesh) for (const m of [].concat(o.material)) out.push([o, m]); });
  return out;
};

it('no exhibit or furniture surface is near-black (a dark frame or plinth reads as a black hole)', async () => {
  for (const chapter of rooms) {
    const { scene, exhibitMeshes } = await build(chapter);
    const groups = [...exhibitMeshes.values(), scene.getObjectByName('items')].filter(Boolean);
    for (const g of groups) {
      for (const [mesh, m] of materialsOf(g)) {
        if (m.transparent || !m.color) continue; // wall-quote lettering
        expect({ room: chapter.id, mesh: mesh.name || mesh.parent.name, lum: luminance(m.color) >= MIN_LUMINANCE })
          .toEqual({ room: chapter.id, mesh: mesh.name || mesh.parent.name, lum: true });
      }
    }
  }
});

// Distance from the back of an exhibit part to the wall the group hangs on (group local -z is the wall side).
const backGap = (g, mesh) => {
  const box = new THREE.Box3().setFromObject(mesh);
  const inv = g.matrixWorld.clone().invert();
  const local = box.clone().applyMatrix4(inv);
  return local.min.z + WALL_GAP; // the wall plane sits at local z = -WALL_GAP
};

it('framed exhibits hang flush on the wall with a finished backing board', async () => {
  for (const chapter of rooms) {
    const { exhibitMeshes } = await build(chapter);
    for (const ex of chapter.exhibits.filter(e => e.type.startsWith('framed-'))) {
      const g = exhibitMeshes.get(ex.id); g.updateMatrixWorld(true);
      const frame = g.getObjectByName('frame');
      expect(frame, `${chapter.id} ${ex.id} frame`).toBeDefined();
      const gap = backGap(g, frame);
      expect(gap).toBeGreaterThanOrEqual(0); // never behind the wall
      expect(gap).toBeLessThanOrEqual(0.01); // never floating off it
      const back = g.getObjectByName('frame-backing');
      expect(back, `${chapter.id} ${ex.id} backing`).toBeDefined();
      expect(back.material.name).toBe('frame-backing');
      expect(luminance(back.material.color)).toBeGreaterThanOrEqual(MIN_LUMINANCE);
    }
  }
});

it('a 360 document stands on a plinth set against its wall, not out in the room', async () => {
  for (const chapter of rooms) {
    const { exhibitMeshes } = await build(chapter);
    for (const ex of chapter.exhibits.filter(e => e.type === '360-document')) {
      const g = exhibitMeshes.get(ex.id); g.updateMatrixWorld(true);
      const plinth = g.getObjectByName('plinth');
      const gap = backGap(g, plinth);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(0.01);
    }
  }
});

it('a missing texture falls back to a designed placeholder card (title and "See the original"), never a blank or black plane', async () => {
  const mats = await createMaterials(THREE, {});
  const framed = makeExhibit(THREE, { id: 'x', number: 1, type: 'framed-photograph', title: 'A letter' }, mats, null, null, []);
  const pic = framed.getObjectByName('picture');
  expect(pic.material.userData.card).toEqual({ title: 'A letter', cta: 'See the original' });
  expect(luminance(pic.material.color)).toBeGreaterThan(0.3);
  const doc = makeExhibit(THREE, { id: 'y', number: 2, type: '360-document', title: 'A petition' }, mats, null, null, []);
  const front = [].concat(doc.getObjectByProperty('name', 'document').material)[4];
  expect(front.userData.card).toEqual({ title: 'A petition', cta: 'See the original' });
});

it('the camera is held inside the room: stand points for exhibits are clamped to the interior', () => {
  const place = rooms[1].reconstruction.place;
  const box = roomInterior({ w: place.w, d: place.d, h: place.h });
  expect(box.min.x).toBeCloseTo(-place.w / 2 + VIEW_MARGIN);
  expect(box.max.z).toBeCloseTo(place.d / 2 - VIEW_MARGIN);
  expect(box.max.y).toBeLessThan(place.h);
  // A frame on the west wall facing +x: 1.6 m out is inside; 9 m out is clamped back in.
  const near = standPoint(new THREE.Vector3(-2.45, 1.6, 0.5), new THREE.Vector3(1, 0, 0), box, 1.6);
  expect(near.x).toBeCloseTo(-0.85); expect(near.y).toBeCloseTo(1.6);
  const far = standPoint(new THREE.Vector3(-2.45, 1.6, 0.5), new THREE.Vector3(1, 0, 0), box, 9);
  expect(box.containsPoint(far)).toBe(true);
});
