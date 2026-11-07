import { it, expect, describe } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import * as THREE from 'three';
import { validatePlace, buildReconstructedPlace, SUB_KINDS, UNSEEN_LABEL, PLACE_WALLS, PLACE_MIN, AGAINST_WALL, EXHIBIT_FOOTPRINT } from '../museum/reconstruction.js';
import { HEIGHTS } from '../museum/layout.js';
import { buildRoom } from '../museum/room.js';
import { sceneStats } from '../museum/stats.js';
import { checkBudget } from '../museum/budget.js';

const ok = { w: 4, d: 5, h: 3, items: [{ kind: 'desk', x: 0, z: -1, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'EIN-M-0022' }], unseen: ['south'] };
const B = ['EIN-M-0022'];

it('accepts items that cite a basis and fit the room', () => expect(validatePlace(ok, B)).toEqual([]));
it('rejects items without a basis photo', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], basis: '' }] }, B).join()).toMatch(/basis/);
});
it('rejects items citing a photo that is not a basis of this reconstruction', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], basis: 'EIN-M-0026' }] }, B).join()).toMatch(/basis EIN-M-0026/);
  expect(validatePlace(ok).join()).toMatch(/basis EIN-M-0022/); // no basis list: nothing is cited
});
it('rejects items outside the room', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], x: 9 }] }, B).join()).toMatch(/outside/);
});
it('rejects unknown item kinds', () => {
  expect(validatePlace({ ...ok, items: [{ ...ok.items[0], kind: 'dragon' }] }, B).join()).toMatch(/kind/);
});
it('rejects unseen entries that are not wall names', () => {
  expect(validatePlace({ ...ok, unseen: ['ceiling'] }, B).join()).toMatch(/unseen: ceiling is not a wall/);
});

// Same cases as tools/tests/test_content_check.py, so the build and the content check agree.
const shared = JSON.parse(readFileSync(new URL('../../../tools/tests/fixtures/place_cases.json', import.meta.url), 'utf8'));
function casePlace(c) {
  if ('replace' in c) return c.replace;
  const p = JSON.parse(JSON.stringify(shared.base));
  Object.assign(p, c.place || {});
  if (p.items.length) Object.assign(p.items[0], c.item || {});
  return p;
}
it('rule constants match the shared fixture (mirrored in tools/content_check.py)', () => {
  expect(PLACE_MIN).toEqual(shared.constants.min_size);
  expect(AGAINST_WALL).toBe(shared.constants.against_wall);
  expect(EXHIBIT_FOOTPRINT).toEqual(shared.constants.exhibit_footprint);
  expect(SUB_KINDS).toEqual(shared.constants.sub_kinds);
  // Frames hang around the gallery frame centre; the plinth of a 360 document reaches the floor.
  expect(EXHIBIT_FOOTPRINT.default.bottom).toBeCloseTo(HEIGHTS.frameCentre - 0.5);
  expect(EXHIBIT_FOOTPRINT.default.top).toBeCloseTo(HEIGHTS.frameCentre + 0.7);
});

it('buildReconstructedPlace refuses an exhibit that covers an evidenced item', async () => {
  const c = { ...chapter, exhibits: [{ id: 'exw', number: 1, type: 'framed-photograph', wall: 'east', slot: 3, media_id: 'M1', title: 'T' }] };
  await expect(buildReconstructedPlace(THREE, c, { textures })).rejects.toThrow(/exhibit exw: covers item 3 \(window\) on the east wall/);
});

describe('shared place cases', () => {
  for (const c of shared.cases) {
    it(c.name, () => {
      const errs = validatePlace(casePlace(c), shared.basis, c.exhibits || []);
      if (c.match === null) expect(errs).toEqual([]);
      else expect(errs.join('; ')).toContain(c.match);
    });
  }
});

const chapter = {
  id: 'fx-place', room: 'reconstructed-place',
  reconstruction: {
    basis_media_ids: ['M1', 'M2'],
    place: {
      w: 4, d: 5, h: 3,
      items: [
        { kind: 'desk', x: 0, z: -1.9, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'M1' },
        { kind: 'chair', x: 0, z: -1.2, rotY: Math.PI, w: 0.45, d: 0.45, h: 0.9, basis: 'M1' },
        { kind: 'lamp', x: 0.4, y: 0.75, z: -2, rotY: 0, w: 0.2, d: 0.2, h: 0.45, basis: 'M2' },
        { kind: 'window', x: 1.97, z: 0, rotY: -Math.PI / 2, w: 1, d: 0.06, h: 1.4, y: 0.9, basis: 'M2' },
        { kind: 'bookcase', x: -1.8, z: 0.5, rotY: Math.PI / 2, w: 1.2, d: 0.35, h: 2, basis: 'M1' },
      ],
      unseen: ['south', 'west'],
    },
  },
  exhibits: [{ id: 'ex1', number: 1, type: 'framed-photograph', wall: 'north', slot: 1, media_id: 'M1', title: 'T' }],
  quotes: [],
};
const textures = { plaster: null, oak: null, media: {} };

it('builds one group per item, each tagged with its basis photo', async () => {
  const { scene } = await buildReconstructedPlace(THREE, chapter, { textures, phone: false });
  const items = scene.getObjectByName('items').children;
  expect(items.length).toBe(5);
  expect(items.map(g => g.userData.basis)).toEqual(['M1', 'M1', 'M2', 'M2', 'M1']);
  // Parametric primitives only (merged into one mesh per material), plus instanced book boxes.
  for (const g of items) {
    expect(g.children.length).toBeGreaterThan(0);
    for (const m of g.children) {
      if (m.isInstancedMesh) { expect(m.name).toBe('books'); expect(m.geometry.type).toBe('BoxGeometry'); continue; }
      expect(m.geometry.userData.parts.length).toBeGreaterThan(0);
      for (const part of m.geometry.userData.parts) expect(['box', 'cylinder', 'torus', 'bowl']).toContain(part.type);
    }
  }
});

it('gives unseen walls the neutral material and a floor label, seen walls plaster', async () => {
  const { scene } = await buildReconstructedPlace(THREE, chapter, { textures, phone: false });
  for (const wall of PLACE_WALLS) {
    const mesh = scene.getObjectByName(`wall-${wall}`);
    const unseen = chapter.reconstruction.place.unseen.includes(wall);
    expect(mesh.material.name === 'unseen-neutral').toBe(unseen);
    expect(mesh.material.map || null).toBeNull();
    const label = scene.getObjectByName(`unseen-${wall}`);
    if (unseen) expect(label.getObjectByName('unseen-label').userData.text).toBe(UNSEEN_LABEL);
    else expect(label).toBeUndefined();
  }
  // Labels stand at floor level at the foot of their wall, just inside the room, facing in.
  const at = wall => {
    const l = scene.getObjectByName(`unseen-${wall}`).getObjectByName('unseen-label');
    return { p: l.getWorldPosition(new THREE.Vector3()), n: new THREE.Vector3(0, 0, 1).applyQuaternion(l.getWorldQuaternion(new THREE.Quaternion())) };
  };
  const south = at('south'), west = at('west');
  expect(south.p.z).toBeCloseTo(2.49); expect(south.p.y).toBeLessThan(0.5); expect(south.n.z).toBeCloseTo(-1);
  expect(west.p.x).toBeCloseTo(-1.99); expect(west.n.x).toBeCloseTo(1);
});

it('uses at most 4 lights, one shadow on desktop and none on phone, within the draw-call budget', async () => {
  for (const phone of [false, true]) {
    const { scene } = await buildReconstructedPlace(THREE, chapter, { textures, phone });
    const lights = [];
    scene.traverse(o => { if (o.isLight) lights.push(o); });
    expect(lights.length).toBeLessThanOrEqual(4);
    expect(lights.filter(l => l.castShadow).length).toBe(phone ? 0 : 1);
    // No textures are loaded in this fixture and nothing is downloaded: both measured as 0.
    expect(checkBudget(sceneStats(scene, { downloadBytes: 0 }))).toEqual([]);
  }
});

it('stores 4 viewpoints, from the centre at eye height facing each wall', async () => {
  const { viewpoints } = await buildReconstructedPlace(THREE, chapter, { textures, phone: true });
  expect(viewpoints.map(v => v.id)).toEqual(['north', 'east', 'south', 'west']);
  for (const v of viewpoints) expect(v.eye).toEqual([0, 1.6, 0]);
  expect(viewpoints[0].target).toEqual([0, 1.2, -2.5]);
  expect(viewpoints[1].target).toEqual([2, 1.2, 0]);
});

it('places exhibits on the place walls and refuses an invalid place', async () => {
  const { exhibitMeshes } = await buildReconstructedPlace(THREE, chapter, { textures, phone: false });
  expect(exhibitMeshes.get('ex1').position.z).toBeCloseTo(-2.45);
  const bad = { ...chapter, reconstruction: { ...chapter.reconstruction, basis_media_ids: ['M1'] } };
  await expect(buildReconstructedPlace(THREE, bad, { textures })).rejects.toThrow(/basis M2 is not one of/);
});

it('buildRoom dispatches reconstructed-place rooms here', async () => {
  const room = await buildRoom(THREE, chapter, { textures, phone: false });
  expect(room.viewpoints.length).toBe(4);
  expect(room.scene.getObjectByName('items').children.length).toBe(5);
});

it('a bookcase is drawn with sides, top, bottom and shelf boards, not one solid slab', async () => {
  const c = { ...chapter, exhibits: [], reconstruction: { ...chapter.reconstruction, place: { ...chapter.reconstruction.place,
    items: [{ kind: 'bookcase', x: 0, z: -2.2, rotY: 0, w: 2, d: 0.4, h: 2.3, basis: chapter.reconstruction.basis_media_ids[0] }] } } };
  const { scene } = await buildReconstructedPlace(THREE, c, { textures, phone: true });
  const g = scene.getObjectByName('item-0');
  const parts = g.children.filter(m => !m.isInstancedMesh).flatMap(m => m.geometry.userData.parts);
  const boards = parts.filter(p => p.type === 'box' && p.h < 0.05 && p.w > 1.5);
  expect(boards.length).toBeGreaterThanOrEqual(5); // top, bottom and at least 3 shelves
  expect(parts.length).toBeGreaterThanOrEqual(boards.length + 3); // plus two sides and a back
  const back = parts.find(p => p.h > 2 && p.w > 1.5);
  expect(back.d).toBeLessThan(0.05);
});

it('a bookcase is filled with books that stay inside it: upright, a few lying flat, varied heights', async () => {
  const place = { ...chapter.reconstruction.place, items: [{ id: 'bc', kind: 'bookcase', x: 0, z: -2.2, rotY: 0, w: 3, d: 0.4, h: 2.3, basis: 'M1' }, { kind: 'books', parent: 'bc', basis_media_ids: ['M1'] }] };
  const c = { ...chapter, exhibits: [], reconstruction: { ...chapter.reconstruction, place } };
  const { scene } = await buildReconstructedPlace(THREE, c, { textures, phone: true });
  const g = scene.getObjectByName('item-0'); g.updateMatrixWorld(true);
  const books = g.getObjectByName('books');
  expect(books.isInstancedMesh).toBe(true);
  expect(books.count).toBeGreaterThan(150);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const heights = new Set();
  let flat = 0;
  for (let i = 0; i < books.count; i++) {
    books.getMatrixAt(i, m); m.decompose(p, q, s);
    const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(), s).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)).translate(p);
    expect(box.min.x).toBeGreaterThanOrEqual(-1.5); expect(box.max.x).toBeLessThanOrEqual(1.5);
    expect(box.min.y).toBeGreaterThanOrEqual(0); expect(box.max.y).toBeLessThanOrEqual(2.3);
    expect(box.min.z).toBeGreaterThanOrEqual(-0.2); expect(box.max.z).toBeLessThanOrEqual(0.2);
    if (s.x > s.y) flat++;
    heights.add(Math.round(s.y * 100));
  }
  expect(flat).toBeGreaterThan(3);
  expect(flat).toBeLessThan(books.count / 4);
  expect(heights.size).toBeGreaterThan(10);
});

// Sub-objects (books, papers, a book stack) are claims about what is on the furniture: each is drawn
// only if the chapter declares it (kind, parent item id, basis photos), never by default.
const subParts = g => g.children.filter(m => !m.isInstancedMesh).flatMap(m => m.geometry.userData.parts).filter(p => p.sub).map(p => p.sub);
const withItems = items => ({ ...chapter, exhibits: [], reconstruction: { ...chapter.reconstruction, place: { ...chapter.reconstruction.place, items } } });
const desk = { id: 'dk', kind: 'desk', x: 0, z: -1.9, rotY: 0, w: 1.2, d: 0.6, h: 0.75, basis: 'M1' };
const bookcase = { id: 'bc', kind: 'bookcase', x: 0, z: -2.2, rotY: 0, w: 3, d: 0.4, h: 2.3, basis: 'M1' };
const sub = (kind, parent) => ({ kind, parent, basis_media_ids: ['M1'] });

it('a desk without a declared papers item renders no papers, and no book stack', async () => {
  const { scene } = await buildReconstructedPlace(THREE, withItems([desk]), { textures, phone: true });
  const g = scene.getObjectByName('item-0');
  expect(subParts(g)).toEqual([]);
  // No loose sheet (a 2 mm slab) and nothing standing on the desk top, whatever its tag.
  const parts = g.children.flatMap(m => m.geometry.userData.parts);
  expect(parts.filter(p => p.h === 0.002)).toEqual([]);
  expect(parts.filter(p => p.y > desk.h)).toEqual([]);
});

it('papers and a book stack are rendered on their parent desk when declared, each on its own', async () => {
  let r = await buildReconstructedPlace(THREE, withItems([desk, sub('papers', 'dk')]), { textures, phone: true });
  expect(new Set(subParts(r.scene.getObjectByName('item-0')))).toEqual(new Set(['papers']));
  r = await buildReconstructedPlace(THREE, withItems([desk, sub('book-stack', 'dk')]), { textures, phone: true });
  expect(new Set(subParts(r.scene.getObjectByName('item-0')))).toEqual(new Set(['book-stack']));
  r = await buildReconstructedPlace(THREE, withItems([desk, sub('papers', 'dk'), sub('book-stack', 'dk')]), { textures, phone: true });
  expect(new Set(subParts(r.scene.getObjectByName('item-0')))).toEqual(new Set(['papers', 'book-stack']));
});

it('a bookcase without a declared books item holds no books; sub-object declarations are not furniture', async () => {
  const { scene } = await buildReconstructedPlace(THREE, withItems([bookcase]), { textures, phone: true });
  expect(scene.getObjectByName('item-0').getObjectByName('books')).toBeUndefined();
  const d = await buildReconstructedPlace(THREE, withItems([bookcase, sub('books', 'bc')]), { textures, phone: true });
  expect(d.scene.getObjectByName('items').children.length).toBe(1);
  expect(d.scene.getObjectByName('item-0').getObjectByName('books').count).toBeGreaterThan(150);
});

it('a sub-object declared on the wrong parent, or without basis photos, is refused by the build', async () => {
  await expect(buildReconstructedPlace(THREE, withItems([desk, sub('books', 'dk')]), { textures })).rejects.toThrow(/books must stand on a bookcase/);
  await expect(buildReconstructedPlace(THREE, withItems([desk, { kind: 'papers', parent: 'dk' }]), { textures })).rejects.toThrow(/needs basis_media_ids/);
});

// Fix round 1 (Task 6): a scanned room carries no reconstructed-place record (its place is not on
// show); the recreated corner's declared items are checked in study-corner.test.js.
it('no shipped scanned chapter carries a reconstruction block', () => {
  const dir = new URL('../../../content/einstein/chapters/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const ch = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    if (typeof ch.room === 'object') expect(ch, f).not.toHaveProperty('reconstruction');
  }
});

// A document hung on the wall shows no text (its text is not reproduced): its face is faintly ruled
// paper, and a small caption says so, so the blank face reads as intentional, not a missing image.
it('a wall document has a ruled-paper face and the caption "Document (text not reproduced)"', async () => {
  const { DOCUMENT_CAPTION } = await import('../museum/reconstruction.js');
  expect(DOCUMENT_CAPTION).toBe('Document (text not reproduced)');
  const { proceduralChapter } = await import('./procedural.js');
  const { scene } = await buildRoom(THREE, proceduralChapter(2), { textures: { media: {} }, phone: true });
  scene.updateMatrixWorld(true);
  const doc = scene.getObjectByName('items').children.find(g => g.userData.kind === 'document');
  const rules = [];
  doc.traverse(o => { if (o.isMesh && o.material.name === 'paper-rule') rules.push(...o.geometry.userData.parts); });
  expect(rules.length, 'ruled lines on the face').toBeGreaterThanOrEqual(8);
  const caption = scene.getObjectByName('document-caption');
  expect(caption, 'caption').toBeTruthy();
  expect(caption.userData.text).toBe(DOCUMENT_CAPTION);
  // Just below the document, on the same wall, facing the same way.
  const db = new THREE.Box3().setFromObject(doc), cb = new THREE.Box3().setFromObject(caption);
  expect(cb.max.y).toBeLessThanOrEqual(db.min.y + 1e-6);
  expect(db.min.y - cb.max.y).toBeLessThan(0.12);
  const n = g => new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
  expect(n(caption).dot(n(doc))).toBeCloseTo(1);
});
