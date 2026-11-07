// Owner intent (Task 4 fix round 1): "the room looks too big, not proportionately angled". From
// every station, on a 16:9 screen, a 1440 x 900 page and a 390 x 844 phone, every exhibit of the
// station's group is wholly in frame, each fills at least 12 % of the frame height, and its ring is
// drawn at least 56 px across. The room opens on a framed view of the first group the narration names.
import { it, expect, describe } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { roomInterior, fovFor } from '../museum/camera.js';
import { roomStations } from '../museum/stationcam.js';
import { visibleBox, FRAMING } from '../museum/framing.js';
import { createRings } from '../museum/rings.js';
import { listChapters, loadChapter, loadScan } from '../content/load.js';
import { placeScanExhibits, scanSize } from '../museum/scanroom.js';
import { makeExhibit } from '../museum/exhibits.js';
import { createMaterials } from '../museum/materials.js';
import { proceduralChapter, PROCEDURAL_NUMBERS } from './procedural.js';

// Canvases: an exact 16:9 stage, the stage on a 1440 x 900 page (min(70vh, 640) tall, 1168 wide),
// a full 1440 x 900 canvas, the stage on a 390 x 844 phone (591 tall, 358 wide) and a full phone.
const CANVASES = [
  { name: '16:9', w: 1120, h: 630 }, { name: '1440x900 page', w: 1168, h: 630 }, { name: '1440x900', w: 1440, h: 900 },
  { name: '390x844 page', w: 358, h: 591 }, { name: '390x844', w: 390, h: 844 },
  // Task 5: the stage on a 1280 x 720 page (the e2e desktop browser), wider than 16:9.
  { name: '1280x720 page', w: 1200, h: 504 },
];
// The shipped Einstein rooms (each its own room in the scanned Great Drawing Room since Task 5), and
// the procedural rooms (fixtures: the same chapters as gallery and reconstructed-place rooms).
const scannedOf = ch => Boolean(ch.room && typeof ch.room === 'object' && ch.room.scan);
const rooms = [
  ...listChapters().filter(c => c.slug === 'einstein').map(c => loadChapter('einstein', c.n)),
  ...PROCEDURAL_NUMBERS.map(n => ({ ...proceduralChapter(n), id: `procedural-${n}` })),
];
// A scanned room's exhibits stand on easels in the scan (scanroom.js); the scan itself is not needed
// for framing, only its measured size.
async function buildAny(chapter) {
  if (!scannedOf(chapter)) return buildRoom(THREE, chapter, { textures: { media: {} }, phone: true });
  const { exhibitMeshes, stands } = placeScanExhibits(THREE, chapter, { makeExhibit, materials: await createMaterials(THREE, {}) });
  const scene = new THREE.Scene(); for (const st of stands) scene.add(st);
  return { scene, exhibitMeshes, start: null, viewpoints: [], size: scanSize(loadScan(chapter.room.scan)) };
}
const authoredOf = ch => (scannedOf(ch) ? ch.room.stations : ch.stations) || [];
const corners = b => [b.min.x, b.max.x].flatMap(x => [b.min.y, b.max.y].flatMap(y => [b.min.z, b.max.z].map(z => new THREE.Vector3(x, y, z))));
const firstNarrated = ch => {
  for (const l of ch.narration || []) for (const id of l.reveals || []) if (ch.exhibits.some(e => e.id === id)) return id;
  return [...ch.exhibits].sort((a, b) => a.number - b.number)[0].id;
};

describe('framed stations', () => {
  for (const chapter of rooms) {
    for (const c of CANVASES) {
      it(`${chapter.id} at ${c.name}: every exhibit of each group in frame, >= 12 % tall, ring >= 56 px`, async () => {
        const built = await buildAny(chapter);
        built.scene.updateMatrixWorld(true);
        const aspect = c.w / c.h, fov = fovFor(aspect);
        const { stations, stationOf, anchors, opening } = roomStations({
          start: built.start, viewpoints: built.viewpoints, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size),
          exhibits: chapter.exhibits, authored: authoredOf(chapter), narration: chapter.narration, aspect, canvasH: c.h, scene: built.scene,
        });
        expect(opening.id).toBe(stationOf.get(firstNarrated(chapter)).id);
        expect(stations[0]).toBe(opening);
        for (const ex of chapter.exhibits) {
          const st = stationOf.get(ex.id);
          const camera = new THREE.PerspectiveCamera(fov, aspect, 0.05, 60);
          camera.position.set(...st.position); camera.lookAt(...st.look); camera.updateMatrixWorld(true);
          const box = visibleBox(built.exhibitMeshes.get(ex.id));
          const pts = corners(box).map(p => p.project(camera));
          for (const p of pts) {
            expect(p.z, `${ex.id} in front`).toBeLessThan(1);
            expect(Math.abs(p.x), `${ex.id} x in frame from ${st.id}`).toBeLessThanOrEqual(1);
            expect(Math.abs(p.y), `${ex.id} y in frame from ${st.id}`).toBeLessThanOrEqual(1);
          }
          const share = (Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))) / 2;
          expect(share, `${ex.id} share of the frame height from ${st.id}`).toBeGreaterThanOrEqual(FRAMING.minExhibitShare);
          // Its ring, as drawn from this station.
          const clock = { t: 0 }, scene = new THREE.Scene(), a = anchors.get(ex.id);
          const rings = createRings(scene, [{ id: ex.id, number: ex.number, anchor: a.anchor }], { now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
          rings.reveal([ex.id]); rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
          expect(rings.state(ex.id).px, `${ex.id} ring from ${st.id}`).toBeGreaterThanOrEqual(56);
          const r = a.anchor.clone().project(camera);
          expect(Math.abs(r.x) <= 1 && Math.abs(r.y) <= 1, `${ex.id} ring in frame`).toBe(true);
          rings.dispose();
        }
      });
    }
  }
  it('a gallery wall is split into groups only as the screen needs: fewer groups on a wide screen than on a phone, fewer than one per exhibit', async () => {
    const chapter = rooms.find(r => r.room === 'chapter-gallery' && r.exhibits.length >= 3);
    const built = await buildRoom(THREE, chapter, { textures: { media: {} }, phone: true });
    const count = c => new Set([...roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, aspect: c.w / c.h, canvasH: c.h }).stationOf.values()].map(s => s.id)).size;
    expect(count(CANVASES[3])).toBeGreaterThan(count(CANVASES[1]));
    expect(count(CANVASES[1])).toBeLessThan(chapter.exhibits.length);
  });
});

// Fix round 2: on a phone the stage keeps a top band (the door chips) and a bottom band (captions,
// rail, player bar). Stations frame each group inside the free rectangle between them: every exhibit
// of the group and its ring stay clear of both bands.
describe('framing inside the free band on a phone', () => {
  const PHONES = [{ name: '390x844 page', w: 358, h: 591, bands: { top: 52, bottom: 170 } }, { name: 'Pixel 7 page', w: 380, h: 587, bands: { top: 52, bottom: 170 } }];
  for (const chapter of rooms) {
    for (const c of PHONES) {
      it(`${chapter.id} at ${c.name}: groups and rings inside the free band`, async () => {
        const built = await buildAny(chapter);
        built.scene.updateMatrixWorld(true);
        const aspect = c.w / c.h, fov = fovFor(aspect);
        const { stationOf, anchors } = roomStations({
          start: built.start, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size),
          exhibits: chapter.exhibits, authored: authoredOf(chapter), narration: chapter.narration, aspect, canvasH: c.h, scene: built.scene, bands: c.bands,
        });
        // NDC limits of the free band.
        const yTop = 1 - (2 * c.bands.top) / c.h, yBottom = -1 + (2 * c.bands.bottom) / c.h;
        for (const ex of chapter.exhibits) {
          const st = stationOf.get(ex.id);
          const camera = new THREE.PerspectiveCamera(fov, aspect, 0.05, 60);
          camera.position.set(...st.position); camera.lookAt(...st.look); camera.updateMatrixWorld(true);
          const pts = corners(visibleBox(built.exhibitMeshes.get(ex.id))).map(p => p.project(camera));
          const ring = anchors.get(ex.id).anchor.clone().project(camera);
          for (const p of [...pts, ring]) {
            expect(p.y, `${ex.id} under the top band from ${st.id}`).toBeLessThanOrEqual(yTop);
            expect(p.y, `${ex.id} above the bottom band from ${st.id}`).toBeGreaterThanOrEqual(yBottom);
            expect(Math.abs(p.x)).toBeLessThanOrEqual(1);
          }
          // The share and ring limits still hold.
          const share = (Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))) / 2;
          expect(share).toBeGreaterThanOrEqual(FRAMING.minExhibitShare);
          // Gliding to the exhibit itself aims inside the band too.
          const own = new THREE.PerspectiveCamera(fov, aspect, 0.05, 60);
          own.position.set(...st.position); own.lookAt(...anchors.get(ex.id).look); own.updateMatrixWorld(true);
          for (const p of corners(visibleBox(built.exhibitMeshes.get(ex.id))).map(q => q.project(own))) {
            expect(p.y, `${ex.id} (own look) under the top band`).toBeLessThanOrEqual(yTop);
            expect(p.y, `${ex.id} (own look) above the bottom band`).toBeGreaterThanOrEqual(yBottom);
          }
        }
      });
    }
  }
});
