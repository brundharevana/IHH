// Camera follows the narration (owner review 4, 2026-10-14): "Prof. Einstein and his wife were
// photographed in 1921." lit ring 4 while the camera stayed on the wide view with exhibit 4 small at
// the far right. When a cue becomes active and names exhibits, the camera glides (a fade under reduced
// motion) to a framed view of exactly those exhibits: every one wholly in frame (inside the free band
// on a phone), at least as large as from its group's station and never under the owner-intent share,
// its ring at least 56 px, the eye inside the room and out of every reserved area and easel. A cue
// naming several exhibits frames them together. A visitor who dragged in the last FOLLOW_QUIET_MS, or
// with the panel open, is not moved; the next cue tries again.
import { it, expect, describe } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { roomInterior, fovFor } from '../museum/camera.js';
import { roomStations, createStationCamera, FADE_MS, FOCUS_FREE_RADIUS, RING_MARGIN_PX, FOCUS_CLEARANCE } from '../museum/stationcam.js';
import { visibleBox, FRAMING } from '../museum/framing.js';
import { createRings, RING } from '../museum/rings.js';
import { createCueFollow, cueTarget, FOLLOW_QUIET_MS } from '../museum/follow.js';
import { lineExhibits } from '../museum/reveal.js';
import { listChapters, loadChapter, loadScan } from '../content/load.js';
import { placeScanExhibits, scanSize } from '../museum/scanroom.js';
import { makeExhibit } from '../museum/exhibits.js';
import { createMaterials } from '../museum/materials.js';
import { proceduralChapter, PROCEDURAL_NUMBERS } from './procedural.js';
import { mediaTextureOf } from './media-size.js';

const CANVASES = [
  { name: '1440x900 page', w: 1168, h: 630 }, { name: '1280x720 page', w: 1200, h: 504 },
  // A desktop stage's controls (door buttons at the top; captions, rail and player bar at the bottom):
  // the close views keep clear of them on every screen (focusBands), group stations only on a phone.
  { name: '1440x900 page with its controls', w: 1168, h: 630, focusBands: { top: 60, bottom: 165 } },
  { name: '390x844 page', w: 358, h: 591, bands: { top: 52, bottom: 170 } }, { name: 'Pixel 7 page', w: 380, h: 587, bands: { top: 52, bottom: 170 } },
];
const scannedOf = ch => Boolean(ch.room && typeof ch.room === 'object' && ch.room.scan);
const rooms = [
  ...listChapters().filter(c => c.slug === 'einstein').map(c => loadChapter('einstein', c.n)),
  ...PROCEDURAL_NUMBERS.map(n => ({ ...proceduralChapter(n), id: `procedural-${n}` })),
];
async function buildAny(chapter) {
  if (!scannedOf(chapter)) return buildRoom(THREE, chapter, { textures: { media: {} }, phone: true });
  // Sized as the runtime sizes them: each exhibit at its media file's aspect.
  const { exhibitMeshes, stands } = placeScanExhibits(THREE, chapter, { makeExhibit, materials: await createMaterials(THREE, {}), textureOf: mediaTextureOf });
  const scene = new THREE.Scene(); for (const st of stands) scene.add(st);
  return { scene, exhibitMeshes, start: null, viewpoints: [], size: scanSize(loadScan(chapter.room.scan)) };
}
const authoredOf = ch => (scannedOf(ch) ? ch.room.stations : ch.stations) || [];
const reservedOf = ch => (scannedOf(ch) && ch.room.reserved) || [];
const corners = b => [b.min.x, b.max.x].flatMap(x => [b.min.y, b.max.y].flatMap(y => [b.min.z, b.max.z].map(z => new THREE.Vector3(x, y, z))));
const camAt = (st, c) => {
  const camera = new THREE.PerspectiveCamera(fovFor(c.w / c.h), c.w / c.h, 0.05, 60);
  camera.position.set(...st.position); camera.lookAt(...st.look); camera.updateMatrixWorld(true);
  return camera;
};
const shareFrom = (camera, box) => { const pts = corners(box).map(p => p.project(camera)); return (Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))) / 2; };
// Every narrated line that names exhibits: [{ cue, ids }].
const namedCues = ch => lineExhibits(ch.narration || [], ch.exhibits || []).map((ids, i) => ({ cue: ch.narration[i].cue, ids })).filter(l => l.ids.length);

describe('cue -> framed station for the exhibits it names', () => {
  for (const chapter of rooms) {
    for (const c of CANVASES) {
      it(`${chapter.id} at ${c.name}: each cue's exhibits wholly in frame, large, ring >= 56 px, eye inside and clear`, async () => {
        const built = await buildAny(chapter);
        built.scene.updateMatrixWorld(true);
        const interior = roomInterior(built.size);
        const { stationOf, anchors, focus } = roomStations({
          start: built.start, exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, authored: authoredOf(chapter),
          narration: chapter.narration, aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null, reserved: reservedOf(chapter),
          ...(c.focusBands ? { focusBands: c.focusBands } : {}),
        });
        const fb = c.focusBands || c.bands;
        const yTop = fb ? 1 - (2 * fb.top) / c.h : 1, yBottom = fb ? -1 + (2 * fb.bottom) / c.h : -1;
        const cues = namedCues(chapter);
        expect(cues.length).toBeGreaterThan(0);
        for (const { cue, ids } of cues) {
          const st = focus({ ids });
          expect(st, `${cue}: a station`).toBeTruthy();
          expect(st.fallback, `${cue}: framed, not the fallback`).toBeFalsy();
          expect(st.id).toBe(`focus:${ids.join('+')}`);
          const eye = new THREE.Vector3(...st.position);
          expect(interior.containsPoint(eye), `${cue}: eye inside the room`).toBe(true);
          for (const r of reservedOf(chapter)) {
            expect(eye.x >= r.min[0] && eye.x <= r.max[0] && eye.z >= r.min[1] && eye.z <= r.max[1], `${cue}: eye in reserved ${r.id}`).toBe(false);
          }
          for (const ex of chapter.exhibits) {
            const b = visibleBox(built.exhibitMeshes.get(ex.id));
            const pad = ids.includes(ex.id) ? 0.2 : FOCUS_CLEARANCE - 1e-6; // other easels: kept FOCUS_CLEARANCE away
            expect(eye.x > b.min.x - pad && eye.x < b.max.x + pad && eye.z > b.min.z - pad && eye.z < b.max.z + pad, `${cue}: eye within ${pad.toFixed(2)} m of ${ex.id}`).toBe(false);
          }
          const camera = camAt(st, c);
          // No ring of the room cut by the frame edge: each wholly on screen with its margin, or wholly off.
          for (const ex of chapter.exhibits) {
            const a = anchors.get(ex.id), q = a.anchor.clone().project(camera);
            if (q.z >= 1) continue;
            const clock = { t: 0 }, scene = new THREE.Scene();
            const rings = createRings(scene, [{ id: ex.id, number: 1, anchor: a.anchor }], { now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
            rings.reveal([ex.id]); clock.t = 1000; rings.update(camera);
            const rr = rings.state(ex.id).px / 2; rings.dispose();
            const x = ((q.x + 1) / 2) * c.w, y = ((1 - q.y) / 2) * c.h;
            const on = x - rr - RING_MARGIN_PX >= 0 && x + rr + RING_MARGIN_PX <= c.w && y - rr - RING_MARGIN_PX >= 0 && y + rr + RING_MARGIN_PX <= c.h;
            const off = x + rr <= 0 || x - rr >= c.w || y + rr <= 0 || y - rr >= c.h;
            expect(on || off, `${cue}: ring ${ex.id} at (${x.toFixed(0)}, ${y.toFixed(0)}) r ${rr.toFixed(0)} cut by the frame edge`).toBe(true);
          }
          for (const id of ids) {
            const box = visibleBox(built.exhibitMeshes.get(id));
            for (const p of corners(box).map(q => q.project(camera))) {
              expect(p.z, `${cue} ${id} in front`).toBeLessThan(1);
              expect(Math.abs(p.x), `${cue} ${id} x in frame`).toBeLessThanOrEqual(1);
              expect(p.y, `${cue} ${id} under the top band`).toBeLessThanOrEqual(yTop);
              expect(p.y, `${cue} ${id} above the bottom band`).toBeGreaterThanOrEqual(yBottom);
            }
            const share = shareFrom(camera, box);
            expect(share, `${cue} ${id} share`).toBeGreaterThanOrEqual(FRAMING.minExhibitShare);
            // A cue naming one exhibit: the close view is never smaller than its group's station showed
            // it, and clearly larger when that station framed it among others (the owner's complaint).
            const groupCam = camAt(stationOf.get(id), c), group = shareFrom(groupCam, box);
            // (Compared where both views keep to the same rules: with the desktop controls the close
            // view keeps clear of them while a desktop group station does not; and a group station
            // whose view puts this exhibit's lit ring within RING_MARGIN_PX of the free frame's edge, or
            // the exhibit itself past the free band (with the exhibit at its media file's real aspect a
            // group station can: a pre-existing gap of the group framing, reported), breaks the close
            // view's rules (fix round 1), so the close view may stand back from it.)
            const inBand = cam => corners(box).map(p => p.project(cam)).every(p => Math.abs(p.x) <= 1 && p.y <= yTop && p.y >= yBottom);
            const ringClear = cam => {
              const q = anchors.get(id).anchor.clone().project(cam), dist = anchors.get(id).anchor.distanceTo(cam.position);
              const px = Math.min(RING.maxPx, Math.max(RING.minPx, (RING.world * RING.drawn * c.h) / (2 * dist * Math.tan((cam.fov * Math.PI) / 360))));
              const rr = (px * RING.litScale * (1 + RING.pulse) * (1 + RING.breathe) * RING.hoverScale) / 2 + RING_MARGIN_PX;
              const x = ((q.x + 1) / 2) * c.w, y = ((1 - q.y) / 2) * c.h, top = c.bands ? c.bands.top : 0, bottom = c.h - (c.bands ? c.bands.bottom : 0);
              return x - rr >= 0 && x + rr <= c.w && y - rr >= top && y + rr <= bottom;
            };
            if (ids.length === 1 && !c.focusBands && ringClear(groupCam) && inBand(groupCam)) {
              expect(share, `${cue} ${id}: ${share.toFixed(3)} from the close view vs ${group.toFixed(3)} from ${stationOf.get(id).id}`).toBeGreaterThanOrEqual(group - 1e-6);
              if ([...stationOf.values()].filter(s => s === stationOf.get(id)).length > 1) expect(share, `${cue} ${id} larger than in ${stationOf.get(id).id}`).toBeGreaterThan(group * 1.1);
            }
            const clock = { t: 0 }, scene = new THREE.Scene(), a = anchors.get(id);
            const rings = createRings(scene, [{ id, number: 1, anchor: a.anchor }], { now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
            rings.reveal([id]); rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
            // Rings at least minRingPx; a cue naming several exhibits too wide for that together (a
            // phone) frames them all with rings at the size rings.js never draws under.
            expect(st.ringFloor).toBe(ids.length > 1 && c.w < 600 ? st.ringFloor : FRAMING.minRingPx);
            expect([FRAMING.minRingPx, RING.minPx]).toContain(st.ringFloor);
            expect(rings.state(id).basePx, `${cue} ${id} ring`).toBeGreaterThanOrEqual(st.ringFloor);
            // The whole ring, with a margin, inside the free frame (review fix round 1: a ring clipped
            // at the frame edge).
            const r = a.anchor.clone().project(camera), px = rings.state(id).px;
            const sx = ((r.x + 1) / 2) * c.w, sy = ((1 - r.y) / 2) * c.h, rr = px / 2 + RING_MARGIN_PX;
            const top = fb ? fb.top : 0, bottom = c.h - (fb ? fb.bottom : 0);
            expect(r.z < 1 && sx - rr >= 0 && sx + rr <= c.w && sy - rr >= top && sy + rr <= bottom, `${cue} ${id} ring at (${sx.toFixed(0)}, ${sy.toFixed(0)}) r ${rr.toFixed(0)} wholly in the free frame`).toBe(true);
            rings.dispose();
          }
        }
      });
    }
  }
  it('a cue naming several exhibits frames them together from one station (chapter 2, c3: both study photographs)', async () => {
    const chapter = loadChapter('einstein', 2);
    const line = chapter.narration.find(l => l.cue === 'c3');
    expect(line.reveals.length).toBeGreaterThan(1);
    const built = await buildAny(chapter);
    built.scene.updateMatrixWorld(true);
    const c = CANVASES[0];
    const { stationOf, focus } = roomStations({ exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect: c.w / c.h, canvasH: c.h, scene: built.scene, reserved: reservedOf(chapter) });
    // Their group stations differ: no single framed group view shows both.
    expect(stationOf.get(line.reveals[0]).id).not.toBe(stationOf.get(line.reveals[1]).id);
    const st = focus({ ids: line.reveals });
    const camera = camAt(st, c);
    for (const id of line.reveals) for (const p of corners(visibleBox(built.exhibitMeshes.get(id))).map(q => q.project(camera))) {
      expect(Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z < 1, `${id} in frame`).toBe(true);
    }
  });
  it('the same cue gives the same station (memoised per canvas shape); an unknown exhibit gives none', async () => {
    const chapter = loadChapter('einstein', 3), built = await buildAny(chapter);
    built.scene.updateMatrixWorld(true);
    const { focus } = roomStations({ exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect: 1.8, canvasH: 630, scene: built.scene });
    expect(focus({ ids: ['ex4'] })).toBe(focus({ ids: ['ex4'] }));
    expect(focus({ ids: ['nope'] })).toBeNull();
    expect(focus(null)).toBeNull();
  });
});

describe('the close view stands clear', () => {
  // Chapter 3's last cue (exhibit 4) at a 1440 x 900 page: where the eye would stand unhindered, then
  // the same with a reserved area, a piece of furniture, or furniture beside that spot.
  const frame = async (extra = {}) => {
    const chapter = loadChapter('einstein', 3), built = await buildAny(chapter);
    built.scene.updateMatrixWorld(true);
    return roomStations({ exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect: 1168 / 630, canvasH: 630, scene: built.scene, ...extra }).focus({ ids: ['ex4'] });
  };
  const near = (a, b, r) => Math.hypot(a[0] - b[0], a[2] - b[2]) < r;
  it('never in a reserved area', async () => {
    const free = await frame();
    const [x, , z] = free.position;
    const st = await frame({ reserved: [{ id: 'kept', min: [x - 0.3, z - 0.3], max: [x + 0.3, z + 0.3] }] });
    expect(st.fallback).toBeFalsy();
    expect(near(st.position, free.position, 0.3)).toBe(false);
  });
  it('never where the room\'s occluders put furniture, nor within FOCUS_FREE_RADIUS of it', async () => {
    const free = await frame();
    const f = free.position;
    // Furniture filling a 0.4 m cylinder at the spot: any segment touching it is blocked.
    const at = (p, q, r) => { for (let t = 0; t <= 1; t += 0.05) { const x = p.x + (q.x - p.x) * t, z = p.z + (q.z - p.z) * t; if (Math.hypot(x - f[0], z - f[2]) < r) return true; } return false; };
    const here = await frame({ occluders: { blocked: (a, b) => at(a, b, 0.2) } });
    expect(here.fallback).toBeFalsy();
    // Probed in sixteen directions: a 0.2 m post between two probes is found from 0.46 m away.
    const gap = Math.hypot(here.position[0] - f[0], here.position[2] - f[2]) - 0.2;
    expect(gap, `${gap.toFixed(3)} m from the furniture`).toBeGreaterThanOrEqual(FOCUS_FREE_RADIUS - 0.05);
  });
});

// The museum note frames the recreated study corner: a stand-in object in its reserved area, framed
// with the photographs of its group (the corner's photo_group); the corner's own bundle is not needed.
describe('the museum note\'s close view (chapter 2, the study corner)', () => {
  const PHONE = { w: 358, h: 591, bands: { top: 52, bottom: 170 } };
  const withCorner = async () => {
    const chapter = loadChapter('einstein', 2), built = await buildAny(chapter);
    const area = chapter.room.reserved.find(r => r.id === 'study-corner');
    const corner = new THREE.Group();
    corner.userData = { frameGroup: 'study', frameArea: 'study-corner' };
    const desk = new THREE.Mesh(new THREE.BoxGeometry(area.max[0] - area.min[0] - 0.2, 2.2, area.max[1] - area.min[1] - 0.2));
    desk.position.set((area.min[0] + area.max[0]) / 2, 1.1, (area.min[1] + area.max[1]) / 2);
    corner.add(desk); built.scene.add(corner); built.scene.updateMatrixWorld(true);
    return { chapter, built, corner };
  };
  const frame = ({ chapter, built }, c, extra = {}) => roomStations({ exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits: chapter.exhibits, narration: chapter.narration, aspect: c.w / c.h, canvasH: c.h, scene: built.scene, bands: c.bands || null, reserved: reservedOf(chapter), ...extra });
  it('frames the corner with the photograph beside it, every ring of the view wholly on screen with a margin', async () => {
    const room = await withCorner();
    for (const c of [CANVASES[0], PHONE]) {
      const r = frame(room, c), st = r.focus({ ids: [], area: 'study-corner' });
      expect(st && !st.fallback, `${c.w}: framed`).toBe(true);
      const camera = camAt(st, c);
      const yTop = c.bands ? 1 - (2 * c.bands.top) / c.h : 1, yBottom = c.bands ? -1 + (2 * c.bands.bottom) / c.h : -1;
      for (const p of corners(visibleBox(room.corner)).map(q => q.project(camera))) expect(Math.abs(p.x) <= 1 && p.y <= yTop && p.y >= yBottom && p.z < 1, `${c.w}: corner in frame`).toBe(true);
      // Every ring of the room wholly on screen with its margin, or wholly off it (ring 1 was cut).
      for (const ex of room.chapter.exhibits) {
        const a = r.anchors.get(ex.id), q = a.anchor.clone().project(camera);
        if (q.z >= 1) continue;
        const clock = { t: 0 }, scene = new THREE.Scene();
        const rings = createRings(scene, [{ id: ex.id, number: 1, anchor: a.anchor }], { now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
        rings.reveal([ex.id]); clock.t = 1000; rings.update(camera);
        const rr = rings.state(ex.id).px / 2; rings.dispose();
        const x = ((q.x + 1) / 2) * c.w, y = ((1 - q.y) / 2) * c.h;
        const on = x - rr - RING_MARGIN_PX >= 0 && x + rr + RING_MARGIN_PX <= c.w && y - rr - RING_MARGIN_PX >= 0 && y + rr + RING_MARGIN_PX <= c.h;
        const off = x + rr <= 0 || x - rr >= c.w || y + rr <= 0 || y - rr >= c.h;
        expect(on || off, `${c.w}: ring ${ex.id} at (${x.toFixed(0)}, ${y.toFixed(0)}) cut by the frame edge`).toBe(true);
      }
      const ex2 = room.chapter.exhibits.find(e => e.easel.group === 'study').id;
      const clock = { t: 0 }, scene = new THREE.Scene(), a = r.anchors.get(ex2);
      const rings = createRings(scene, [{ id: ex2, number: 2, anchor: a.anchor }], { now: () => clock.t, reducedMotion: () => true, viewportHeight: () => c.h });
      rings.reveal([ex2]); rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
      const q = a.anchor.clone().project(camera), px = rings.state(ex2).px;
      const x = ((q.x + 1) / 2) * c.w, y = ((1 - q.y) / 2) * c.h, rr = px / 2 + RING_MARGIN_PX;
      expect(x - rr >= 0 && x + rr <= c.w && y - rr >= (c.bands ? c.bands.top : 0) && y + rr <= c.h - (c.bands ? c.bands.bottom : 0), `${c.w}: ring ${ex2} at (${x.toFixed(0)}, ${y.toFixed(0)}) r ${rr.toFixed(0)} wholly on screen`).toBe(true);
      rings.dispose();
    }
  });
  it('with no clear close view it falls back to the corner\'s group station, never a silent no-op', async () => {
    const room = await withCorner();
    const r = frame(room, CANVASES[0], { occluders: { blocked: () => true } });
    const st = r.focus({ ids: [], area: 'study-corner' });
    expect(st).toBeTruthy();
    expect(st.fallback).toBe(true);
    const ex2 = room.chapter.exhibits.find(e => e.easel.group === 'study').id;
    expect(st.position).toEqual(r.stationOf.get(ex2).position);
    // An exhibit cue likewise.
    const ex = r.focus({ ids: ['ex3'] });
    expect(ex.fallback).toBe(true);
    expect(ex.position).toEqual(r.stationOf.get('ex3').position);
  });
});

describe('what a cue asks the camera to frame', () => {
  it('the exhibits the line names, or the area a museum note frames; nothing for a line that names neither', () => {
    expect(cueTarget({ cue: 'c1' }, ['ex1', 'ex2'])).toEqual({ ids: ['ex1', 'ex2'] });
    expect(cueTarget({ cue: 'c2' }, [])).toBeNull();
    expect(cueTarget({ cue: 'c9', kind: 'museum-note', frames: 'study-corner' }, [])).toEqual({ ids: [], area: 'study-corner' });
    // A museum note frames its area (with the photographs beside it), whatever exhibits its facts name.
    expect(cueTarget({ cue: 'c10', kind: 'museum-note', frames: 'study-corner' }, ['ex1', 'ex2'])).toEqual({ ids: [], area: 'study-corner' });
    expect(cueTarget(null, ['ex1'])).toBeNull();
  });
});

describe('following the narration without fighting the visitor', () => {
  const setup = (o = {}) => {
    const clock = { t: 100000 }, moves = [];
    const follow = createCueFollow({ now: () => clock.t, move: t => moves.push(t), ...o });
    return { clock, moves, follow };
  };
  it('keys on the line alone: "Show all exhibits" mid-line (more ids revealed) does not move the camera again', () => {
    const { follow, moves } = setup();
    const line = { cue: 'c4' };
    expect(follow.line(3, line, ['ex2'])).toBe(true);
    expect(follow.line(3, line, ['ex2', 'ex3'])).toBe(false);
    expect(follow.line(4, { cue: 'c5' }, ['ex3'])).toBe(true);
    expect(moves).toEqual([{ ids: ['ex2'] }, { ids: ['ex3'] }]);
  });
  it('moves once per cue change, never again for the same cue', () => {
    const { follow, moves } = setup();
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(true);
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(false);
    expect(follow.cue('2|', null)).toBe(false);
    expect(follow.cue('3|ex2', { ids: ['ex2'] })).toBe(true);
    expect(moves).toEqual([{ ids: ['ex1'] }, { ids: ['ex2'] }]);
  });
  it('a drag in the last 6 s holds the camera; the next cue after the quiet time moves it', () => {
    expect(FOLLOW_QUIET_MS).toBeGreaterThanOrEqual(5000);
    expect(FOLLOW_QUIET_MS).toBeLessThanOrEqual(7000);
    const { follow, moves, clock } = setup();
    follow.input();
    clock.t += FOLLOW_QUIET_MS - 1;
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(false);
    clock.t += 2;
    // Same cue: not retried (resume on the NEXT cue).
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(false);
    expect(follow.cue('2|ex2', { ids: ['ex2'] })).toBe(true);
    expect(moves).toEqual([{ ids: ['ex2'] }]);
  });
  it('the open panel (or anything else holding the stage) suppresses the move', () => {
    let open = true;
    const { follow, moves } = setup({ blocked: () => open });
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(false);
    open = false;
    expect(follow.cue('2|ex2', { ids: ['ex2'] })).toBe(true);
    expect(moves).toEqual([{ ids: ['ex2'] }]);
  });
  it('under reduced motion the move is the station camera\'s fade with a cut, never a glide', async () => {
    const clock = { t: 0 }, overlay = { style: { opacity: '' } };
    const camera = new THREE.PerspectiveCamera(75, 1.6, 0.05, 40);
    const dom = Object.assign(new EventTarget(), { clientWidth: 1440, clientHeight: 900, style: {} });
    const cam = createStationCamera(camera, dom, { now: () => clock.t, reducedMotion: () => true, overlay });
    cam.goTo({ id: 'a', position: [0, 1.6, 0], look: [0, 1.6, -5] }, { instant: true });
    const target = { id: 'focus:ex1', position: [2, 1.6, 0], look: [2, 1.6, -5] };
    let p = null;
    const follow = createCueFollow({ now: () => 1e6, move: () => { p = cam.goTo(target); } });
    expect(follow.cue('1|ex1', { ids: ['ex1'] })).toBe(true);
    const xs = [];
    for (let t = 0; t <= FADE_MS; t += 25) { clock.t = t; cam.update(); xs.push(camera.position.x); }
    await p;
    expect(new Set(xs)).toEqual(new Set([0, 2]));
    expect(cam.station().id).toBe('focus:ex1');
  });
  it('a real drag reports a turn (the follow\'s input); a glide does not', () => {
    const turns = [];
    const camera = new THREE.PerspectiveCamera(75, 1.6, 0.05, 40);
    const dom = Object.assign(new EventTarget(), { clientWidth: 1440, clientHeight: 900, style: {}, setPointerCapture() {} });
    const cam = createStationCamera(camera, dom, { now: () => 0, reducedMotion: () => false, onTurn: () => turns.push(1) });
    cam.goTo({ id: 'a', position: [0, 1.6, 0], look: [0, 1.6, -5] });
    expect(turns.length).toBe(0);
    cam.goTo({ id: 'a', position: [0, 1.6, 0], look: [0, 1.6, -5] }, { instant: true });
    const ev = (type, x) => Object.assign(new Event(type), { clientX: x, clientY: 10, pointerId: 1, button: 0, isPrimary: true, pointerType: 'mouse' });
    dom.dispatchEvent(ev('pointerdown', 10)); dom.dispatchEvent(ev('pointermove', 40));
    expect(turns.length).toBe(1);
  });
});
