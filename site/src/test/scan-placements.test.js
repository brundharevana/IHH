// Placements in the scanned rooms (real-scan museum Task 5), checked against the shipped scan geometry
// itself (each device's bundle, decoded with the production meshopt decoder; raycast through the
// occluder index). For every Einstein chapter room and the hallway:
//   - every easel or stand is inside the room, on the scan's floor, and intersects none of the scan
//     (furniture, walls, stoves);
//   - every viewing station, framed for a 1440 x 900 page and a 390 x 844 phone, stands on free floor
//     inside the room, and sees each exhibit of its group with nothing of the scan or another easel in
//     between;
//   - every door stands in a doorway of the scan (scan wall right behind it) with a free approach,
//     and the walk from every station to it crosses nothing.
// The owner-intent framing (framing.test.js) runs on these same rooms.
import { it, expect, describe, beforeAll } from 'vitest';
import * as THREE from 'three';
import { loadScanGeometry } from './scan-geometry.js';
import { createOccluderIndex } from '../museum/occlusion.js';
import { placeScanExhibits, scanSize } from '../museum/scanroom.js';
import { makeExhibit } from '../museum/exhibits.js';
import { createMaterials } from '../museum/materials.js';
import { addDoors } from '../museum/door.js';
import { roomStations } from '../museum/stationcam.js';
import { roomInterior, standPoint, EYE_HEIGHT, fovFor } from '../museum/camera.js';
import { createRings } from '../museum/rings.js';
import { ROOT, listChapters, loadChapter, loadScan } from '../content/load.js';
import { loadHall } from '../content/hall.js';
import { loadStudyCorner, cornerRuntime } from '../content/load.js';
import { buildStudyCorner } from '../museum/reconstruction.js';
import { visibleBox } from '../museum/framing.js';
import { lineExhibits } from '../museum/reveal.js';
import { cueTarget } from '../museum/follow.js';
import { mediaTextureOf } from './media-size.js';

// scene.js DOOR_STANDOFF: the exit walk ends this far in front of a door.
const DOOR_STANDOFF = 0.9;
const CANVASES = [{ name: '1440x900 page', w: 1168, h: 630 }, { name: '390x844 page', w: 358, h: 591, bands: { top: 52, bottom: 170 } }];
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Rooms: each Einstein chapter whose room is a scan, and the hallway (its easels as exhibits).
const rooms = listChapters().filter(c => c.slug === 'einstein').map(c => loadChapter('einstein', c.n))
  .filter(ch => ch.room && typeof ch.room === 'object' && ch.room.scan)
  .map(ch => ({ name: ch.id, chapter: ch }));
const hall = loadHall();
if (hall) {
  rooms.push({ name: 'hall', chapter: {
    room: { scan: hall.scan, ...(hall.stations ? { stations: hall.stations } : {}) }, narration: [], quotes: [],
    exhibits: hall.easels.map((e, i) => { const { slug, ...easel } = e; return { id: slug, number: i + 1, type: 'name-card', title: slug, easel }; }),
  } });
}

const geometry = new Map();
async function scanIndex(id, cls) {
  const key = `${id}:${cls}`;
  if (!geometry.has(key)) {
    const m = loadScan(id);
    const root = await loadScanGeometry(ROOT, m.bundles[cls].file);
    geometry.set(key, createOccluderIndex([root]));
  }
  return geometry.get(key);
}

// sized: exhibits at their media files' aspects, as the runtime sizes them (the close views).
async function layout(chapter, { sized = false } = {}) {
  const materials = await createMaterials(THREE, {});
  const { exhibitMeshes, stands } = placeScanExhibits(THREE, chapter, { makeExhibit, materials, ...(sized ? { textureOf: mediaTextureOf } : {}) });
  const scene = new THREE.Scene();
  for (const s of stands) scene.add(s);
  const doors = chapter.room.doors ? addDoors(THREE, scene, materials, chapter.room.doors, { labels: {} }) : {};
  // The study corner (Task 6) stands in the room as the runtime builds it, framed with its photographs.
  const c = loadStudyCorner('einstein');
  let corner = null;
  if (c && chapter.id === `einstein-${c.chapter}`) {
    const models = await loadScanGeometry(ROOT, c.bundles.desktop.file);
    corner = buildStudyCorner(THREE, cornerRuntime(c, chapter.room.reserved.find(r => r.id === c.area)), { models, materials });
    scene.add(corner.group);
  }
  scene.updateMatrixWorld(true);
  return { scene, exhibitMeshes, stands, doors, corner };
}

// Segments across a box: vertical lines on a grid over its footprint and horizontal lines through it.
function boxSegments(b, step = 0.1) {
  const segs = [], y0 = Math.max(b.min.y, 0.04);
  for (let x = b.min.x; x <= b.max.x + 1e-9; x += step) for (let z = b.min.z; z <= b.max.z + 1e-9; z += step) segs.push([V(x, y0, z), V(x, b.max.y, z)]);
  for (const y of [y0, 0.3, 0.7, 1.1, 1.5, 1.9, b.max.y - 0.02].filter(y => y >= y0 && y <= b.max.y)) {
    for (let z = b.min.z; z <= b.max.z + 1e-9; z += step) segs.push([V(b.min.x, y, z), V(b.max.x, y, z)]);
    for (let x = b.min.x; x <= b.max.x + 1e-9; x += step) segs.push([V(x, y, b.min.z), V(x, y, b.max.z)]);
  }
  return segs;
}

// Does the floor segment a -> b ([x, z]) touch the reserved rectangle r ({ min: [x, z], max: [x, z] })?
function crossesRect(a, b, r) {
  const [x0, z0] = r.min, [x1, z1] = r.max;
  const inside = ([x, z]) => x >= x0 && x <= x1 && z >= z0 && z <= z1;
  if (inside(a) || inside(b)) return true;
  // Slab clipping of the segment against the rectangle.
  let t0 = 0, t1 = 1;
  for (const [p, d, lo, hi] of [[a[0], b[0] - a[0], x0, x1], [a[1], b[1] - a[1], z0, z1]]) {
    if (Math.abs(d) < 1e-12) { if (p < lo || p > hi) return false; continue; }
    let ta = (lo - p) / d, tb = (hi - p) / d;
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
    if (t0 > t1) return false;
  }
  return true;
}

describe.each(rooms)('$name', ({ chapter }) => {
  const scan = loadScan(chapter.room.scan), size = scanSize(scan), interior = roomInterior(size);
  let built;
  beforeAll(async () => { built = await layout(chapter); }, 60000);

  it.each(['desktop', 'phone'])('every easel stands on the %s scan\'s floor, inside the room, clear of the scan', async cls => {
    const index = await scanIndex(chapter.room.scan, cls);
    expect(built.stands.length).toBe((chapter.exhibits || []).length);
    for (const stand of built.stands) {
      const id = stand.userData.exhibitId, b = new THREE.Box3().setFromObject(stand);
      // Inside the room's measured extent, under its ceiling.
      expect(Math.abs(b.min.x) < size.w / 2 && Math.abs(b.max.x) < size.w / 2 && Math.abs(b.min.z) < size.d / 2 && Math.abs(b.max.z) < size.d / 2, `${id} inside the room`).toBe(true);
      expect(b.max.y, `${id} under the ceiling`).toBeLessThan(size.h);
      expect(b.min.y, `${id} stands on the floor`).toBeCloseTo(0, 3);
      // Real floor under its footprint: the scan's floor within 3 cm of y = 0 at its corners and centre.
      const c = b.getCenter(V(0, 0, 0));
      for (const [x, z] of [[b.min.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.min.z], [b.max.x, b.max.z], [c.x, c.z]]) {
        expect(index.blocked(V(x, 0.03, z), V(x, -0.2, z)), `${id}: scan floor under (${x.toFixed(2)}, ${z.toFixed(2)})`).toBe(true);
        expect(index.blocked(V(x, 0.03, z), V(x, 0.3, z)), `${id}: nothing of the scan just above the floor at (${x.toFixed(2)}, ${z.toFixed(2)})`).toBe(false);
      }
      // Nothing of the scan inside its box.
      const hit = boxSegments(b).find(([p, q]) => index.blocked(p, q));
      expect(hit && hit.map(p => p.toArray().map(v => +v.toFixed(2))), `${id} intersects the scan`).toBeUndefined();
    }
  }, 120000);

  // Task 6: the study corner stands inside its reserved area on the scan's floor and touches nothing
  // of the scan (furniture, walls); from its photographs' station it is in view.
  it.each(['desktop', 'phone'])('the study corner (if any) stands on the %s scan\'s floor inside its area, clear of the scan', async cls => {
    if (!built.corner) return;
    const index = await scanIndex(chapter.room.scan, cls);
    const area = chapter.room.reserved.find(r => r.id === loadStudyCorner('einstein').area);
    for (const [id, g] of built.corner.objects) {
      const b = new THREE.Box3().setFromObject(g, true);
      expect(b.min.x >= area.min[0] - 1e-3 && b.max.x <= area.max[0] + 1e-3 && b.min.z >= area.min[1] - 1e-3 && b.max.z <= area.max[1] + 1e-3, `${id} inside ${area.id}`).toBe(true);
      const c = b.getCenter(V(0, 0, 0));
      for (const [x, z] of [[b.min.x, b.min.z], [b.min.x, b.max.z], [b.max.x, b.min.z], [b.max.x, b.max.z], [c.x, c.z]]) {
        expect(index.blocked(V(x, 0.03, z), V(x, -0.2, z)), `${id}: scan floor under (${x.toFixed(2)}, ${z.toFixed(2)})`).toBe(true);
      }
      const hit = boxSegments(b).find(([p, q]) => index.blocked(p, q));
      expect(hit && hit.map(p => p.toArray().map(v => +v.toFixed(2))), `${id} intersects the scan`).toBeUndefined();
    }
  }, 120000);

  it.each(CANVASES)('the study corner (if any) is framed with its photographs at $name', async c => {
    if (!built.corner) return;
    const group = loadStudyCorner('einstein').photo_group;
    const { stationOf } = roomStations({
      exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, authored: chapter.room.stations || [],
      narration: chapter.narration || [], aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null,
    });
    const ex = chapter.exhibits.find(e => e.easel.group === group), st = stationOf.get(ex.id);
    const camera = new THREE.PerspectiveCamera(fovFor(c.w / c.h), c.w / c.h, 0.05, 40);
    camera.position.set(...st.position); camera.lookAt(...st.look); camera.updateMatrixWorld(true);
    // On a page wide enough for the group and the corner, the desk is in the frame from that station;
    // on a phone the group is framed alone and the visitor turns to the corner: nothing of the scan
    // or an easel stands between the eye and the desk.
    const centre = new THREE.Box3().setFromObject(built.corner.objects.get('desk'), true).getCenter(V(0, 0, 0));
    if (!c.bands) {
      const desk = centre.clone().project(camera);
      expect(Math.abs(desk.x) <= 1 && Math.abs(desk.y) <= 1 && desk.z < 1, `desk in view from ${st.id} (${desk.x.toFixed(2)}, ${desk.y.toFixed(2)})`).toBe(true);
    }
    const index = await scanIndex(chapter.room.scan, 'desktop'), easels = createOccluderIndex(built.stands);
    const eye = V(...st.position);
    expect(index.blocked(eye, centre), `the scan between ${st.id} and the corner's desk`).toBe(false);
    expect(easels.blocked(eye, centre), `an easel between ${st.id} and the corner's desk`).toBe(false);
  }, 60000);

  it.each(CANVASES)('stations framed for a $name stand on free floor and see their exhibits', async c => {
    const index = await scanIndex(chapter.room.scan, 'desktop');
    const easels = createOccluderIndex([...built.stands, ...(built.corner ? [built.corner.group] : [])], { owners: built.stands });
    const { stations, stationOf } = roomStations({
      exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, authored: chapter.room.stations || [],
      narration: chapter.narration || [], aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null,
    });
    for (const st of stations) {
      const e = V(...st.position);
      expect(interior.containsPoint(e), `${st.id} inside the room`).toBe(true);
      for (const r of chapter.room.reserved || []) expect(crossesRect([e.x, e.z], [e.x, e.z], r), `${st.id} stands in the area reserved for ${r.id}`).toBe(false);
      expect(index.blocked(V(e.x, 0.05, e.z), V(e.x, e.y + 0.2, e.z)), `${st.id}: the scan over or under the eye`).toBe(false);
      for (const [dx, dz] of [[0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) for (const y of [0.5, 1.0, e.y]) {
        expect(index.blocked(V(e.x, y, e.z), V(e.x + dx, y, e.z + dz)), `${st.id}: scan within 0.3 m of the visitor at ${y} m`).toBe(false);
      }
      expect(easels.blocked(V(e.x, 0.05, e.z), V(e.x, e.y, e.z)), `${st.id} stands in an easel`).toBe(false);
    }
    for (const ex of chapter.exhibits) {
      const st = stationOf.get(ex.id), g = built.exhibitMeshes.get(ex.id);
      const centre = new THREE.Box3().setFromObject(g).getCenter(V(0, 0, 0)), eye = V(...st.position);
      expect(index.blocked(eye, centre), `${ex.id}: the scan between ${st.id} and the exhibit`).toBe(false);
      const own = built.stands.find(s => s.userData.exhibitId === ex.id);
      expect(easels.blocked(eye, centre, own), `${ex.id}: another easel between ${st.id} and the exhibit`).toBe(false);
    }
  }, 120000);

  it('doors stand in the scan\'s doorways with a free approach, and the walk to them from any station is clear', async () => {
    const spots = chapter.room.doors || {};
    if (!Object.keys(spots).length) return;
    const index = await scanIndex(chapter.room.scan, 'desktop');
    const easels = createOccluderIndex([...built.stands, ...(built.corner ? [built.corner.group] : [])]);
    const { stations } = roomStations({ exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, authored: chapter.room.stations || [], narration: chapter.narration || [], aspect: 1168 / 630, canvasH: 630, scene: built.scene });
    for (const [key, g] of Object.entries(built.doors)) {
      if (!g) continue;
      const n = V(0, 0, 1).applyQuaternion(g.quaternion), p = g.position;
      for (const y of [0.3, 1.2, 2.0]) {
        // The scan's doorway right behind the door (its leaf or reveal within 0.4 m), nothing in front.
        expect(index.blocked(V(p.x + n.x * 0.05, y, p.z + n.z * 0.05), V(p.x - n.x * 0.4, y, p.z - n.z * 0.4)), `${key}: scan doorway behind at ${y} m`).toBe(true);
        expect(index.blocked(V(p.x + n.x * 0.05, y, p.z + n.z * 0.05), V(p.x + n.x * 1.5, y, p.z + n.z * 1.5)), `${key}: free approach at ${y} m`).toBe(false);
      }
      const plate = g.getObjectByName('door-anchor').getWorldPosition(V(0, 0, 0));
      const stand = standPoint(plate, n, interior, DOOR_STANDOFF); stand.y = EYE_HEIGHT;
      for (const st of stations) {
        const e = V(...st.position);
        expect(index.blocked(e, stand), `walk from ${st.id} to the ${key} door crosses the scan`).toBe(false);
        expect(easels.blocked(e, stand), `walk from ${st.id} to the ${key} door crosses an easel`).toBe(false);
        // Task 5 review (I4): a reserved area (Task 6's study corner) will hold furniture: no walk
        // to a door may cross it.
        for (const r of chapter.room.reserved || []) {
          expect(crossesRect([e.x, e.z], [stand.x, stand.z], r), `walk from ${st.id} to the ${key} door crosses the area reserved for ${r.id}`).toBe(false);
        }
      }
    }
  }, 120000);
});

// Owner review 4: the close view each narration cue asks for (follow.js, stationcam.js focus), framed
// as the runtime frames it (against the scan's occluder layer, the easels, the doors and the corner),
// stands on free floor inside the room, out of every reserved area, with nothing of the full-detail
// scan or another easel between the eye and what it frames, and every named exhibit's ring drawn in
// clear view. A museum note frames the recreated study corner: the whole corner is in the frame.
describe.each(rooms)('$name narration close views', ({ chapter }) => {
  it.each(CANVASES)('every cue\'s close view at $name stands free and sees what it frames', async c => {
    const scan = loadScan(chapter.room.scan), interior = roomInterior(scanSize(scan));
    const occluder = await loadScanGeometry(ROOT, scan.occluder.file);
    const built = await layout(chapter, { sized: true });
    const roots = [occluder, ...built.stands, ...Object.values(built.doors).filter(Boolean), ...(built.corner ? [built.corner.group] : [])];
    const runtime = createOccluderIndex(roots, { owners: roots });
    const { focus, anchors } = roomStations({
      exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, authored: chapter.room.stations || [],
      narration: chapter.narration || [], aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null,
      reserved: chapter.room.reserved || [], occluders: runtime,
      // The stage's controls, which the close views keep clear of on every screen (scene.js focusBands).
      focusBands: c.bands || { top: 60, bottom: 165 },
    });
    const index = await scanIndex(chapter.room.scan, 'desktop');
    const easels = createOccluderIndex([...built.stands, ...(built.corner ? [built.corner.group] : [])], { owners: [...built.stands, ...(built.corner ? [built.corner.group] : [])] });
    const named = lineExhibits(chapter.narration || [], chapter.exhibits || []);
    const targets = (chapter.narration || []).map((l, i) => cueTarget(l, named[i])).filter(Boolean);
    if ((chapter.narration || []).some(l => l.kind === 'museum-note')) expect(targets.some(t => t.area), 'a museum note frames its area').toBe(true);
    for (const t of targets) {
      const st = focus(t);
      const what = `${st && st.id} at ${st && st.position.map(v => v.toFixed(2))}`;
      expect(st, `a close view for ${JSON.stringify(t)}`).toBeTruthy();
      expect(st.fallback, `${what}: framed, not the fallback`).toBeFalsy();
      const e = V(...st.position);
      expect(interior.containsPoint(e), `${what} inside the room`).toBe(true);
      for (const r of chapter.room.reserved || []) expect(crossesRect([e.x, e.z], [e.x, e.z], r), `${what} stands in ${r.id}`).toBe(false);
      expect(index.blocked(V(e.x, 0.05, e.z), V(e.x, e.y + 0.2, e.z)), `${what}: the scan over or under the eye`).toBe(false);
      for (const [dx, dz] of [[0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) for (const y of [0.5, 1.0, e.y]) {
        expect(index.blocked(V(e.x, y, e.z), V(e.x + dx, y, e.z + dz)), `${what}: scan within 0.3 m of the visitor at ${y} m`).toBe(false);
      }
      expect(easels.blocked(V(e.x, 0.05, e.z), V(e.x, e.y, e.z)), `${what} stands in an easel`).toBe(false);
      const camera = new THREE.PerspectiveCamera(fovFor(c.w / c.h), c.w / c.h, 0.05, 40);
      camera.position.copy(e); camera.lookAt(...st.look); camera.updateMatrixWorld(true);
      // Nothing of the full-detail scan close in front across the lower part of the view (fix round
      // 1: a chair filling the foreground of the corner's view on the phone).
      for (const nx of [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]) for (const ny of [-0.3, -0.6, -0.9]) {
        const dir = new THREE.Vector3(nx, ny, 0.5).unproject(camera).sub(e).normalize();
        expect(index.blocked(e, e.clone().addScaledVector(dir, 1.2)), `${what}: the scan within 1.2 m in the foreground at (${nx}, ${ny})`).toBe(false);
      }
      // A museum note frames the corner with the photographs of its group: their rings too.
      const group = t.area ? chapter.exhibits.filter(x => x.easel.group === loadStudyCorner('einstein').photo_group).map(x => x.id) : [];
      for (const id of [...t.ids, ...group]) {
        const centre = new THREE.Box3().setFromObject(built.exhibitMeshes.get(id)).getCenter(V(0, 0, 0));
        const own = built.stands.find(s => s.userData.exhibitId === id);
        expect(index.blocked(e, centre), `${id}: the scan between ${what} and the exhibit`).toBe(false);
        expect(easels.blocked(e, centre, own), `${id}: another easel between ${what} and the exhibit`).toBe(false);
        const clock = { t: 0 }, scene = new THREE.Scene(), a = anchors.get(id);
        const rings = createRings(scene, [{ id, number: 1, anchor: a.anchor, own: a.own }], { occluders: [occluder, ...built.stands, ...Object.values(built.doors).filter(Boolean), ...(built.corner ? [built.corner.group] : [])], now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
        rings.reveal([id]); rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
        expect(rings.state(id).visible, `${id} ring from ${what}`).toBe(true);
        rings.dispose();
      }
      if (t.area) {
        expect(built.corner, 'the study corner stands in this room').toBeTruthy();
        const box = visibleBox(built.corner.group);
        for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
          const p = V(x, y, z).project(camera);
          expect(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1, `${what}: corner point (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) in frame`).toBe(true);
        }
        const desk = new THREE.Box3().setFromObject(built.corner.objects.get('desk'), true).getCenter(V(0, 0, 0));
        expect(index.blocked(e, desk), `${what}: the scan between the eye and the corner's desk`).toBe(false);
        expect(createOccluderIndex(built.stands).blocked(e, desk), `${what}: an easel between the eye and the corner's desk`).toBe(false);
      }
    }
  }, 120000);
});

// Review focus 3: from its station every exhibit's ring is drawn, nothing of the room in front of
// it, tested as the runtime tests it: against the scan's occluder layer, the easels and the doors.
describe.each(rooms)('$name rings', ({ chapter }) => {
  it.each(CANVASES)('every ring is in clear view from its station at $name', async c => {
    const scan = loadScan(chapter.room.scan);
    const occluder = await loadScanGeometry(ROOT, scan.occluder.file);
    const built = await layout(chapter);
    const { stationOf, anchors } = roomStations({
      exhibitMeshes: built.exhibitMeshes, interior: roomInterior(scanSize(scan)), exhibits: chapter.exhibits, authored: chapter.room.stations || [],
      narration: chapter.narration || [], aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null,
    });
    for (const ex of chapter.exhibits) {
      const st = stationOf.get(ex.id), a = anchors.get(ex.id);
      const clock = { t: 0 }, scene = new THREE.Scene();
      const rings = createRings(scene, [{ id: ex.id, number: ex.number, anchor: a.anchor, own: a.own }], {
        occluders: [occluder, ...built.stands, ...Object.values(built.doors).filter(Boolean), ...(built.corner ? [built.corner.group] : [])], now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h,
      });
      rings.reveal([ex.id]);
      const camera = new THREE.PerspectiveCamera(fovFor(c.w / c.h), c.w / c.h, 0.05, 40);
      camera.position.set(...st.position); camera.lookAt(...a.look); camera.updateMatrixWorld(true);
      rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
      expect(rings.state(ex.id).blockedSamples, `${ex.id} ring from ${st.id}`).toBe(0);
      expect(rings.state(ex.id).visible, `${ex.id} ring from ${st.id}`).toBe(true);
      rings.dispose();
    }
  }, 60000);
});

describe('rooms sharing one scan', () => {
  it('each chapter stands only its own exhibits', async () => {
    const byScan = new Map();
    for (const r of rooms) { const id = r.chapter.room.scan; byScan.set(id, [...(byScan.get(id) || []), r]); }
    const shared = [...byScan.values()].find(list => list.length >= 2);
    expect(shared, 'two chapters on one scan').toBeTruthy();
    for (const r of shared) {
      const { exhibitMeshes } = await layout(r.chapter);
      expect([...exhibitMeshes.keys()].sort()).toEqual(r.chapter.exhibits.map(e => e.id).sort());
    }
  });
});
