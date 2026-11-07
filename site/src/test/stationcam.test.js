// Station camera (src/museum/stationcam.js): the visitor turns in place at a viewing station
// (real-scan museum spec, Camera; REF-tapestry-v2 section 7.2). 75 degree vertical lens on 16:9,
// narrower screens keep the 16:9 horizontal field with the vertical capped at 95 degrees; damping
// 0.08; no zoom; pitch limited; station moves glide 1.6 s with an ease-out curve, and under reduced
// motion become a 300 ms fade with a cut in the middle.
import { it, expect, describe } from 'vitest';
import * as THREE from 'three';
import {
  createStationCamera, stationFov, easeOutSine, GLIDE_MS, FADE_MS, DAMPING, DEFAULT_PITCH, clampPitch,
} from '../museum/stationcam.js';
import { horizontalFov } from '../museum/camera.js';

const deg = r => (r * 180) / Math.PI;
// A canvas stand-in: an event target with a size, and pointer capture as a no-op.
class FakeDom extends EventTarget {
  constructor(w = 1440, h = 900) { super(); this.clientWidth = w; this.clientHeight = h; this.style = {}; }
  setPointerCapture() {}
  releasePointerCapture() {}
}
const pointer = (type, x, y, extra = {}) => Object.assign(new Event(type), { clientX: x, clientY: y, pointerId: 1, button: 0, isPrimary: true, pointerType: 'mouse', ...extra });
const setup = ({ reduced = false, w = 1440, h = 900 } = {}) => {
  const clock = { t: 0 };
  const camera = new THREE.PerspectiveCamera(75, w / h, 0.05, 40);
  const dom = new FakeDom(w, h);
  const overlay = { style: { opacity: '' } };
  const cam = createStationCamera(camera, dom, { now: () => clock.t, reducedMotion: () => reduced, overlay });
  return { clock, camera, dom, overlay, cam };
};
const dir = camera => camera.getWorldDirection(new THREE.Vector3());
const A = { id: 'a', position: [0, 1.6, 0], look: [0, 1.6, -5] };
const B = { id: 'b', position: [2, 1.6, 0], look: [2, 1.6, 5] };

describe('lens', () => {
  it('is 75 degrees vertical on a 16:9 screen (107.5 degrees across)', () => {
    expect(stationFov(16 / 9)).toBeCloseTo(75, 6);
    expect(horizontalFov(stationFov(16 / 9), 16 / 9)).toBeCloseTo(107.5, 0);
    // Wider than 16:9 keeps the base vertical field.
    expect(stationFov(2.4)).toBeCloseTo(75, 6);
  });
  it('keeps the 16:9 horizontal field on narrower screens: 80.9 degrees at 1440 x 900', () => {
    expect(stationFov(1440 / 900)).toBeCloseTo(80.9, 1);
    expect(horizontalFov(stationFov(1440 / 900), 1440 / 900)).toBeCloseTo(107.5, 0);
  });
  it('caps the vertical field at 95 degrees on a 390 x 844 phone', () => {
    expect(stationFov(390 / 844)).toBe(95);
    for (const a of [0.3, 0.46, 0.75, 1, 1.3, 1.6, 1.78, 2.5]) {
      expect(stationFov(a)).toBeGreaterThanOrEqual(75);
      expect(stationFov(a)).toBeLessThanOrEqual(95);
    }
  });
});

describe('look around', () => {
  it('turns in place: a drag rotates the view and never moves the eye; no zoom', () => {
    const { clock, camera, dom, cam } = setup();
    cam.goTo(A, { instant: true });
    const eye = camera.position.clone(), before = dir(camera);
    dom.dispatchEvent(pointer('pointerdown', 700, 450));
    dom.dispatchEvent(pointer('pointermove', 800, 450));
    dom.dispatchEvent(pointer('pointerup', 800, 450));
    for (let i = 0; i < 120; i++) { clock.t += 16.7; cam.update(); }
    expect(camera.position.distanceTo(eye)).toBe(0);
    expect(dir(camera).angleTo(before)).toBeGreaterThan(0.05);
    expect(camera.zoom).toBe(1);
    // The scene follows the finger: dragging right turns the view to the left (-x when facing -z).
    expect(dir(camera).x).toBeLessThan(0);
    dom.dispatchEvent(Object.assign(new Event('wheel'), { deltaY: -500 }));
    clock.t += 100; cam.update();
    expect(camera.zoom).toBe(1);
    expect(camera.fov).toBe(75);
  });
  it('damps the turn by 0.08 per 60 fps frame: 8 % of the drag lands on the first frame', () => {
    expect(DAMPING).toBe(0.08);
    const { clock, dom, cam } = setup();
    cam.goTo(A, { instant: true });
    const y0 = cam.pose().yaw;
    dom.dispatchEvent(pointer('pointerdown', 700, 450));
    dom.dispatchEvent(pointer('pointermove', 790, 450));
    dom.dispatchEvent(pointer('pointerup', 790, 450));
    const total = (2 * Math.PI * 0.4 * 90) / 900;
    clock.t += 1000 / 60; cam.update();
    expect(cam.pose().yaw - y0).toBeCloseTo(total * 0.08, 5);
    for (let i = 0; i < 300; i++) { clock.t += 1000 / 60; cam.update(); }
    expect(cam.pose().yaw - y0).toBeCloseTo(total, 4);
    expect(cam.isMoving()).toBe(false);
  });
  it('clamps the pitch to the station range, and to the default range without one', () => {
    // Fix round 1: about 35 degrees down to 30 up (it was REF 7.2's -59 to 70), so a visitor cannot
    // end up looking at the ceiling or the floor.
    expect(DEFAULT_PITCH).toEqual([-35, 30]);
    expect(deg(clampPitch(Math.PI / 2))).toBeCloseTo(30, 6);
    expect(deg(clampPitch(-Math.PI / 2))).toBeCloseTo(-35, 6);
    expect(deg(clampPitch(0.5, [-10, 20]))).toBeCloseTo(20, 6);
    const { clock, dom, cam } = setup();
    cam.goTo({ ...A, pitch: [-15, 10] }, { instant: true });
    // A long drag down (scene follows the finger: the view tilts up) and a long drag up.
    dom.dispatchEvent(pointer('pointerdown', 700, 100));
    dom.dispatchEvent(pointer('pointermove', 700, 899));
    dom.dispatchEvent(pointer('pointerup', 700, 899));
    for (let i = 0; i < 200; i++) { clock.t += 16.7; cam.update(); }
    expect(deg(cam.pose().pitch)).toBeCloseTo(10, 4);
    dom.dispatchEvent(pointer('pointerdown', 700, 899));
    dom.dispatchEvent(pointer('pointermove', 700, 0));
    dom.dispatchEvent(pointer('pointerup', 700, 0));
    for (let i = 0; i < 200; i++) { clock.t += 16.7; cam.update(); }
    expect(deg(cam.pose().pitch)).toBeCloseTo(-15, 4);
  });
  it('reports the first drag of each press (the drag hint hides on it)', () => {
    const camera = new THREE.PerspectiveCamera(75, 1.6, 0.05, 40), dom = new FakeDom();
    let drags = 0;
    const cam = createStationCamera(camera, dom, { now: () => 0, reducedMotion: () => false, onDragStart: () => drags++ });
    cam.goTo(A, { instant: true });
    dom.dispatchEvent(pointer('pointerdown', 10, 10));
    expect(drags).toBe(1);
    cam.dispose();
    dom.dispatchEvent(pointer('pointerdown', 10, 10));
    expect(drags).toBe(1);
  });
});

describe('moving between stations', () => {
  it('glides 1.6 s with an ease-out sine, position and look target lerped together', async () => {
    expect(GLIDE_MS).toBeGreaterThanOrEqual(1600);
    expect(GLIDE_MS).toBeLessThanOrEqual(2000);
    expect(easeOutSine(0)).toBe(0);
    expect(easeOutSine(1)).toBe(1);
    expect(easeOutSine(0.5)).toBeCloseTo(Math.sin(Math.PI / 4), 9);
    // Ease-out: fast start, slow finish.
    expect(easeOutSine(0.25)).toBeGreaterThan(0.25);
    expect(easeOutSine(0.9) - easeOutSine(0.8)).toBeLessThan(easeOutSine(0.2) - easeOutSine(0.1));
    const { clock, camera, cam } = setup();
    cam.goTo(A, { instant: true });
    let done = false;
    const p = cam.goTo(B).then(v => { done = v; });
    clock.t = GLIDE_MS / 2; cam.update();
    expect(camera.position.x).toBeCloseTo(2 * easeOutSine(0.5), 6);
    expect(cam.isMoving()).toBe(true);
    clock.t = GLIDE_MS - 1; cam.update();
    await Promise.resolve();
    expect(done).toBe(false);
    clock.t = GLIDE_MS; cam.update();
    await p;
    expect(done).toBe(true);
    expect(camera.position.toArray()).toEqual([2, 1.6, 0]);
    expect(dir(camera).z).toBeCloseTo(1, 6);
    expect(cam.isMoving()).toBe(false);
  });
  it('lookAt turns in place toward a point', async () => {
    const { clock, camera, cam } = setup();
    cam.goTo(A, { instant: true });
    const p = cam.lookAt([5, 1.6, 0]);
    clock.t = GLIDE_MS; cam.update(); await p;
    expect(camera.position.toArray()).toEqual([0, 1.6, 0]);
    expect(dir(camera).x).toBeCloseTo(1, 6);
  });
  it('under reduced motion a move is a 300 ms fade with a cut, never a glide', async () => {
    expect(FADE_MS).toBe(300);
    const { clock, camera, overlay, cam } = setup({ reduced: true });
    cam.goTo(A, { instant: true });
    const p = cam.goTo(B);
    const seen = [];
    for (let t = 0; t <= FADE_MS; t += 25) {
      clock.t = t; cam.update();
      seen.push(camera.position.x);
      if (t === 125) expect(Number(overlay.style.opacity)).toBeGreaterThan(0.7);
    }
    await p;
    // Only the two end poses are ever shown: before the cut at A, after it at B.
    expect(new Set(seen)).toEqual(new Set([0, 2]));
    expect(seen.indexOf(2)).toBeGreaterThanOrEqual(6); // the cut is at mid-fade (150 ms)
    expect(Number(overlay.style.opacity)).toBe(0);
    expect(cam.isMoving()).toBe(false);
  });
  it('a newer move replaces one under way (the earlier one resolves false)', async () => {
    const { clock, camera, cam } = setup();
    cam.goTo(A, { instant: true });
    const first = cam.goTo(B);
    clock.t = 400; cam.update();
    const second = cam.goTo(A);
    expect(await first).toBe(false);
    clock.t = 400 + GLIDE_MS; cam.update();
    expect(await second).toBe(true);
    expect(camera.position.toArray()).toEqual([0, 1.6, 0]);
  });
});

// The procedural rooms (fixtures: the Einstein chapters before Task 5; the shipped scanned rooms are
// checked the same way against their scans in scan-placements.test.js): framed stations per
// exhibit group (framing.test.js checks the framing itself), each inside the room at eye height, clear
// of furniture, with every ring in clear view from its exhibit's station; the room opens on the
// station of the first narrated exhibit.
describe('stations of the procedural rooms', async () => {
  const { buildRoom } = await import('../museum/room.js');
  const { roomInterior } = await import('../museum/camera.js');
  const { roomStations } = await import('../museum/stationcam.js');
  const { createRings } = await import('../museum/rings.js');
  const { proceduralChapter, PROCEDURAL_NUMBERS } = await import('./procedural.js');
  const rooms = PROCEDURAL_NUMBERS.map(proceduralChapter);
  it('frames each exhibit group from inside the room, every ring in clear view from its station', async () => {
    for (const chapter of rooms) {
      for (const [w, h] of [[1168, 630], [358, 591]]) {
        const built = await buildRoom(THREE, chapter, { textures: { media: {} }, phone: true });
        built.scene.updateMatrixWorld(true);
        const interior = roomInterior(built.size);
        const { stations, stationOf, anchors, opening } = roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, interior, exhibits: chapter.exhibits, narration: chapter.narration, aspect: w / h, canvasH: h, scene: built.scene });
        expect(stations[0]).toBe(opening);
        const walls = new Set(chapter.exhibits.map(e => e.wall));
        for (const st of stations) expect(walls.has(st.id.split('-')[0]), st.id).toBe(true);
        for (const ex of chapter.exhibits) {
          const st = stationOf.get(ex.id);
          expect(st.id.startsWith(`${ex.wall}-`), `${chapter.id} ${ex.id}`).toBe(true);
          const eye = new THREE.Vector3(...st.position);
          expect(interior.containsPoint(eye), `${chapter.id} ${st.id} inside`).toBe(true);
          expect(eye.y).toBeCloseTo(1.6, 1);
          const clock = { t: 0 }, scene = new THREE.Scene(), a = anchors.get(ex.id);
          const rings = createRings(scene, [{ id: ex.id, number: ex.number, anchor: a.anchor, own: a.own }], { occluders: [built.scene], now: () => clock.t, reducedMotion: () => true });
          rings.reveal([ex.id]);
          const camera = new THREE.PerspectiveCamera(stationFov(w / h), w / h, 0.05, 40);
          camera.position.copy(eye); camera.lookAt(...a.look); camera.updateMatrixWorld(true);
          rings.occlude(camera.position); clock.t = 1000; rings.update(camera);
          expect(rings.state(ex.id).visible, `${chapter.id} ${ex.id} ring from ${st.id}`).toBe(true);
          expect(rings.state(ex.id).blockedSamples, `${chapter.id} ${ex.id} ring from ${st.id}`).toBe(0);
          rings.dispose();
        }
        if (chapter.room === 'reconstructed-place') {
          for (const st of stations) {
            const eye = new THREE.Vector3(...st.position);
            for (const item of built.scene.getObjectByName('items').children) {
              expect(new THREE.Box3().setFromObject(item).expandByScalar(0.2).containsPoint(eye), `${st.id} in ${item.name}`).toBe(false);
            }
          }
        }
      }
    }
  });
  it('a room without exhibits opens on its stored establishing view', async () => {
    const built = await buildRoom(THREE, rooms[0], { textures: { media: {} }, phone: true });
    const { opening, stations } = roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, exhibits: [] });
    expect(opening).toEqual({ id: 'start', position: built.start.eye, look: built.start.target });
    expect(stations).toEqual([opening]);
  });
  it('an authored station replaces or adds to the defaults and an exhibit may name it', async () => {
    const chapter = rooms[0];
    const built = await buildRoom(THREE, chapter, { textures: { media: {} }, phone: true });
    const near = { id: 'close', position: [0, 1.6, -3], look: [0, 1.6, -6], pitch: [-20, 20] };
    const exhibits = chapter.exhibits.map((e, i) => (i === 0 ? { ...e, station: 'close' } : e));
    const { stations, stationOf } = roomStations({ start: built.start, exhibitMeshes: built.exhibitMeshes, interior: roomInterior(built.size), exhibits, authored: [near] });
    expect(stations.find(s => s.id === 'close')).toEqual(near);
    expect(stationOf.get(exhibits[0].id).id).toBe('close');
    expect(stationOf.get(exhibits[1].id).id.startsWith(`${exhibits[1].wall}-`)).toBe(true);
  });
});

it('the content check knows the gallery size the room is built at (stations stand inside it)', async () => {
  const { readFileSync } = await import('node:fs');
  const { ROOM_TYPES } = await import('../museum/layout.js');
  const py = readFileSync(new URL('../../../tools/content_check.py', import.meta.url), 'utf8');
  const m = /GALLERY_SIZE = \{"w": ([\d.]+), "d": ([\d.]+), "h": ([\d.]+)\}/.exec(py);
  expect(m && m.slice(1).map(Number)).toEqual([ROOM_TYPES['chapter-gallery'].w, ROOM_TYPES['chapter-gallery'].d, ROOM_TYPES['chapter-gallery'].h]);
});

it('a lost pointer capture ends the drag (no turn keeps running on later moves)', () => {
  const camera = new THREE.PerspectiveCamera(75, 1.6, 0.05, 40), dom = new FakeDom();
  const cam = createStationCamera(camera, dom, { now: () => 0, reducedMotion: () => false });
  cam.goTo(A, { instant: true });
  dom.dispatchEvent(pointer('pointerdown', 100, 100));
  expect(cam.dragging()).toBe(true);
  dom.dispatchEvent(pointer('lostpointercapture', 100, 100));
  expect(cam.dragging()).toBe(false);
  dom.dispatchEvent(pointer('pointermove', 300, 100));
  expect(cam.isMoving()).toBe(false);
});

// Task 4 review minor (carried to Task 7): when the stage changes shape the stations are framed
// anew. A visitor still looking along their station's view steps to its new place; one who has
// turned away (or faces an exhibit) keeps their view, and only the station record is updated.
describe('reflow after a resize', async () => {
  const { reframeAction } = await import('../museum/stationcam.js');
  const A2 = { ...A, position: [0, 1.6, 0.4] };
  it('reframes a visitor at rest who looks along the station view', () => {
    expect(reframeAction({ at: A, next: A2, dir: [0, 0, -1], moving: false })).toBe('reframe');
    // A degree-sized wobble from damping still counts as the station view.
    expect(reframeAction({ at: A, next: A2, dir: [Math.sin(0.01), 0, -Math.cos(0.01)], moving: false })).toBe('reframe');
  });
  it('keeps the view of a visitor who has turned away: the station is updated silently', () => {
    expect(reframeAction({ at: A, next: A2, dir: [1, 0, 0], moving: false })).toBe('adopt');
    expect(reframeAction({ at: A, next: A2, dir: [Math.sin(0.2), 0, -Math.cos(0.2)], moving: false })).toBe('adopt');
  });
  it('does nothing while the camera moves or away from any station', () => {
    expect(reframeAction({ at: A, next: A2, dir: [0, 0, -1], moving: true })).toBe('none');
    expect(reframeAction({ at: null, next: A2, dir: [0, 0, -1], moving: false })).toBe('none');
    expect(reframeAction({ at: A, next: null, dir: [0, 0, -1], moving: false })).toBe('none');
  });
  it('adopt swaps the station without moving the eye or the gaze', () => {
    const { camera, cam } = setup();
    cam.goTo(A, { instant: true });
    cam.lookAt([5, 1.6, 0], { instant: true });
    const before = { p: camera.position.toArray(), d: dir(camera).toArray() };
    cam.adopt(A2);
    expect(cam.station()).toBe(A2);
    expect(camera.position.toArray()).toEqual(before.p);
    dir(camera).toArray().forEach((v, i) => expect(v).toBeCloseTo(before.d[i], 9));
    expect(cam.isMoving()).toBe(false);
  });
});
