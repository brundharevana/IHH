// Phone budget on the real chapter rooms, scene side: built by the room builder with textures the
// size of the files the room loads on a phone (the room's PBR maps, materials.js ROOM_TEXTURES, and
// /media/room/<key>.jpg), canvas textures (unseen-wall
// labels, wall quotes) drawn on a stub canvas of the real size, and the environment map scene.js adds.
// Download bytes are measured on the built page in e2e/budget.spec.js (HTML, JS, textures, portrait).
import { it, expect, beforeAll, afterAll, describe } from 'vitest';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildRoom } from '../museum/room.js';
import { checkBudget, PHONE_BUDGET } from '../museum/budget.js';
import { sceneStats, ENVIRONMENT } from '../museum/stats.js';
import { exhibitFiles } from '../museum/mediafiles.js';
import { listChapters, loadChapter, loadJourney, jpegSize, webpSize, ROOT, MEDIA_DIR } from '../content/load.js';
import { roomTextureList } from '../museum/materials.js';
import { roomStations } from '../museum/stationcam.js';
import { createRings, RING_ATLAS } from '../museum/rings.js';
import { placeScanExhibits, scanLighting, runtimeGpuBytes, fitTexturePx, PHONE_EXHIBIT_PX, NAME_CARD_PX } from '../museum/scanroom.js';
import { SCAN_ROOM_GPU } from '../museum/budget.js';
import { hallView, loadHall } from '../content/hall.js';
import { gatedPortrait } from '../content/portrait.js';
import { listInductees, listPipelineInductees, loadInductee, factIndex, mediaIndex, portraitFiles } from '../content/load.js';
import { makeExhibit } from '../museum/exhibits.js';
import { createMaterials } from '../museum/materials.js';
import { addDoors } from '../museum/door.js';
import { SCAN_BUDGET } from '../museum/budget.js';
import { loadScan } from '../content/load.js';
import { proceduralChapter, PROCEDURAL_NUMBERS } from './procedural.js';
import { loadStudyCorner, cornerRuntime } from '../content/load.js';
import { buildStudyCorner } from '../museum/reconstruction.js';
import { loadScanGeometry } from './scan-geometry.js';

// The study corner (Task 6) of a chapter, as cornerRuntime gives it to the runtime, or null.
export function chapterCorner(chapter) {
  const c = loadStudyCorner('einstein');
  if (!c || !chapter.id || chapter.id !== `einstein-${c.chapter}`) return null;
  return cornerRuntime(c, (chapter.room.reserved || []).find(r => r.id === c.area));
}

const PUBLIC = join(ROOT, 'site', 'public');
const texture = path => {
  const buf = readFileSync(path);
  const size = path.endsWith('.webp') ? webpSize(buf) : jpegSize(buf);
  if (!size) throw new Error(`${path}: not a JPEG or WebP`);
  return new THREE.Texture({ width: size.width, height: size.height });
};
// Canvas stub: exhibits.js and reconstruction.js size their canvases themselves; drawing is a no-op.
const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 28 }) }, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
beforeAll(() => { globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }; });
afterAll(() => { delete globalThis.document; });

// The hotspot rings scene.js adds to the room, with the phone digit atlas.
function addRings(built, chapter) {
  const exhibits = chapter.exhibits || [];
  const { anchors } = roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, exhibits });
  return createRings(built.scene, exhibits.filter(e => anchors.has(e.id)).map(e => ({ id: e.id, number: e.number, anchor: anchors.get(e.id).anchor })), { atlasScale: RING_ATLAS.phone });
}
export async function measureRoom(chapter, { rings = true } = {}) {
  const keys = [...new Set((chapter.exhibits || []).flatMap(e => { const f = exhibitFiles(e); return [f.front, f.back]; }).filter(Boolean))];
  const media = Object.fromEntries(keys.map(k => [k, texture(join(MEDIA_DIR, 'room', `${k}.jpg`))]));
  const sets = {};
  for (const r of roomTextureList(chapter.room || 'chapter-gallery', { phone: true })) (sets[r.set] = sets[r.set] || {})[r.map] = texture(join(PUBLIC, r.url));
  const built = await buildRoom(THREE, chapter, { phone: true, textures: { sets, media } });
  const { scene } = built;
  if (rings) addRings(built, chapter);
  scene.environment = new THREE.Texture(); scene.environment.userData.pmremSize = ENVIRONMENT.size; // as scene.js
  return sceneStats(scene);
}

// A scanned room, our side of it, as a device of class `cls` loads it: the easels and stands with
// their exhibits (room textures, on a phone fitted to PHONE_EXHIBIT_PX), name cards at their device
// size, the museum doors and their sign atlas, the rings and the easel lights. -> { stats (sceneStats),
// gpu: GPU bytes as uploaded (runtimeGpuBytes, as the runtime counts it) }.
export async function measureScanLayer(chapter, { rings = true, cls = 'phone' } = {}) {
  const fitted = path => {
    const t = texture(path);
    if (cls !== 'phone') return t;
    const [w, h] = fitTexturePx(t.image.width, t.image.height, PHONE_EXHIBIT_PX);
    return new THREE.Texture({ width: w, height: h });
  };
  const keys = [...new Set((chapter.exhibits || []).flatMap(e => { const f = exhibitFiles(e); return [f.front, f.back]; }).filter(Boolean))];
  const media = Object.fromEntries(keys.map(k => [k, fitted(join(MEDIA_DIR, 'room', `${k}.jpg`))]));
  for (const ex of chapter.exhibits || []) if (ex.image) media[ex.image] = fitted(ex.imageFile);
  const materials = await createMaterials(THREE, {});
  const textureOf = ex => { const f = exhibitFiles(ex); return { front: f.front ? media[f.front] : (ex.image ? media[ex.image] : null), back: f.back ? media[f.back] : null }; };
  const { exhibitMeshes, stands } = placeScanExhibits(THREE, chapter, { makeExhibit, materials, textureOf, cls });
  const scene = new THREE.Scene();
  for (const st of stands) scene.add(st);
  scanLighting(THREE, scene); scene.userData.lights = 2;
  if (chapter.room.doors) addDoors(THREE, scene, materials, chapter.room.doors, { labels: { entrance: 'Back', exit: 'Next' } });
  // The study corner (Task 6): its meshes as built (geometry from the shipped bundle) and its KTX2
  // textures at the size the build recorded for the device (Node has no transcoder to upload them).
  let cornerTextures = 0;
  const corner = chapterCorner(chapter);
  if (corner) {
    const rec = loadStudyCorner('einstein').bundles[cls];
    const models = await loadScanGeometry(ROOT, rec.file);
    scene.add(buildStudyCorner(THREE, corner, { models, phone: cls === 'phone', materials }).group);
    cornerTextures = rec.gpu_texture_bytes;
  }
  scene.updateMatrixWorld(true);
  if (rings) {
    const exhibits = chapter.exhibits || [];
    const { anchors } = roomStations({ exhibitMeshes, exhibits });
    createRings(scene, exhibits.filter(e => anchors.has(e.id)).map(e => ({ id: e.id, number: e.number, anchor: anchors.get(e.id).anchor })), { atlasScale: RING_ATLAS[cls] });
  }
  return { stats: sceneStats(scene), gpu: runtimeGpuBytes(scene) + cornerTextures, corner: Boolean(corner) };
}

// The hallway as the page builds it (src/pages/hall/index.astro): its easels, the cleared portrait as
// an image (its file on disk for the size), name cards for the others.
function hallChapter() {
  const withContent = new Set(listInductees());
  const v = hallView({
    hall: loadHall(), inductees: listPipelineInductees(),
    built: s => withContent.has(s) && Boolean(loadJourney(s)),
    portraitOf: s => (withContent.has(s) ? gatedPortrait(loadInductee(s), { ...factIndex(s), media: mediaIndex(s) }, x => Boolean(portraitFiles(x))) : null),
  });
  const exhibits = v.exhibits.map(e => (e.image ? { ...e, imageFile: portraitFiles(e.id).image } : e));
  return { id: 'hall', room: { scan: v.scan }, narration: [], quotes: [], exhibits };
}

// Review ruling (Task 5 fix round 1): the whole room on the GPU, the scan as its bundle records it
// plus our layer as uploaded, within SCAN_ROOM_GPU for the device class: every chapter and the hall.
describe('a scanned room, scan and our layer together, within the device GPU limit', () => {
  const scannedRooms = () => [...listChapters().filter(c => c.slug === 'einstein').map(c => loadChapter('einstein', c.n)).filter(ch => ch.room && typeof ch.room === 'object'), hallChapter()];
  for (const cls of ['phone', 'desktop']) {
    it(`every chapter and the hall on a ${cls}`, async () => {
      for (const ch of scannedRooms()) {
        const { gpu, corner } = await measureScanLayer(ch, { cls });
        if (ch.id === 'einstein-2') expect(corner, 'the study corner is counted in its room').toBe(true);
        const scan = loadScan(ch.room.scan).bundles[cls].gpu_bytes;
        console.log(`room gpu ${ch.id} ${cls}`, JSON.stringify({ layer: gpu, scan, total: gpu + scan, limit: SCAN_ROOM_GPU[cls] }));
        expect(gpu + scan, `${ch.id} on a ${cls}`).toBeLessThanOrEqual(SCAN_ROOM_GPU[cls]);
      }
    });
  }
  it('a phone gets exhibit textures of at most 512 px and name cards of 320 x 400 without mipmaps', () => {
    expect(PHONE_EXHIBIT_PX).toBe(512);
    expect(fitTexturePx(768, 570, 512)).toEqual([512, 380]);
    expect(fitTexturePx(400, 300, 512)).toEqual([400, 300]);
    expect(NAME_CARD_PX.phone).toEqual([320, 400]);
  });
});

const { downloadBytes, ...SCENE_BUDGET } = PHONE_BUDGET;
const rooms = listChapters().filter(c => c.slug === 'einstein');
const scannedOf = ch => Boolean(ch.room && typeof ch.room === 'object' && ch.room.scan);
// Every room a journey stop opens is measured: the rooms here are the chapters the shipped journey names.
it('measures every Einstein room on the journey', () => {
  const named = [...new Set(loadJourney('einstein').stops.filter(s => s.chapter !== undefined).map(s => s.chapter))].sort((a, b) => a - b);
  expect(named.length).toBeGreaterThan(0);
  expect(rooms.map(r => r.n)).toEqual(named);
});
// Shipped rooms are scanned (Task 5): our layer stays within the procedural scene limits (unchanged),
// and the room's scan within its phone scanned-room limits.
for (const { slug, n } of rooms) {
  it(`${slug}/${n} is within the phone scene budget`, async () => {
    const chapter = loadChapter(slug, n);
    const stats = scannedOf(chapter) ? (await measureScanLayer(chapter)).stats : await measureRoom(chapter);
    console.log(`budget ${slug}/${n}`, JSON.stringify(stats));
    expect(checkBudget(stats, SCENE_BUDGET)).toEqual([]);
    if (scannedOf(chapter)) {
      const b = loadScan(chapter.room.scan).bundles.phone;
      expect(b.gpu_bytes).toBeLessThanOrEqual(SCAN_BUDGET.phone.gpuBytes);
      console.log(`budget ${slug}/${n} with the scan (phone)`, JSON.stringify({ textureBytes: stats.textureBytes + b.gpu_texture_bytes, gpuBytes: stats.textureBytes + b.gpu_bytes }));
    }
  });
}
// The procedural rooms (fixtures: the Einstein chapters before Task 5) keep their budget.
for (const n of PROCEDURAL_NUMBERS) {
  it(`procedural room ${n} is within the phone scene budget`, async () => {
    const stats = await measureRoom(proceduralChapter(n));
    expect(checkBudget(stats, SCENE_BUDGET)).toEqual([]);
  });
}
it('the stub canvas is counted (room 2 has an unseen-wall label)', async () => {
  const withLabel = await measureRoom(proceduralChapter(2));
  const noLabel = await measureRoom({ ...proceduralChapter(2), reconstruction: { ...proceduralChapter(2).reconstruction,
    place: { ...proceduralChapter(2).reconstruction.place, unseen: [] } } });
  expect(withLabel.textureBytes - noLabel.textureBytes).toBe(Math.round(1024 * 102 * 4 * 4 / 3));
});
it('reads the pixel size of the WebP room maps it measures', () => {
  expect(webpSize(readFileSync(join(PUBLIC, 'tex', 'parquet', 'color-512.webp')))).toEqual({ width: 512, height: 512 });
  expect(webpSize(readFileSync(join(PUBLIC, 'tex', 'walnut', 'normal-1024.webp')))).toEqual({ width: 1024, height: 1024 });
  expect(webpSize(Buffer.from('not a webp file at all, really not'))).toBeNull();
});
it('counts the hotspot rings: one draw call per exhibit and one shared digit atlas without mipmaps', async () => {
  const chapter = loadChapter('einstein', 1);
  const measure = scannedOf(chapter) ? async (c, o) => (await measureScanLayer(c, o)).stats : measureRoom;
  const withRings = await measure(chapter), without = await measure(chapter, { rings: false });
  const n = chapter.exhibits.length;
  expect(withRings.textureBytes - without.textureBytes).toBe(10 * RING_ATLAS.cellW * RING_ATLAS.cellH * RING_ATLAS.phone ** 2 * 4);
  expect(withRings.drawCalls - without.drawCalls).toBe(n);
});
