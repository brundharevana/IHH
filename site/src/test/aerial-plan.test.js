import { it, expect } from 'vitest';
import {
  R_EARTH, quadSize, ease, logLerp, zoomPose, arcPose, viewSpan, fitAltitude, levelOpacities, deepestLevel,
  creditText, altitudeOf, distanceOf, ZOOM_MS, endLevel,
} from '../museum/aerial-plan.js';
import { latLonToVec3 } from '../museum/geo.js';

const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);
// Six levels since fix round 1: 300 km and 60 km (NASA Blue Marble), 10 km, 2 km, 300 m, building.
const LEVELS = [300000, 60000, 10000, 2000, 300, 150].map((extent, i) => ({ extent, labels: i >= 4, ok: true }));

it('sizes a quad from its ground extent and the globe radius', () => {
  near(quadSize(R_EARTH), 1);
  near(quadSize(10000), 10000 / R_EARTH);
  near(quadSize(150, 2), (2 * 150) / R_EARTH);
  expect(quadSize(150)).toBeLessThan(quadSize(300));
});

it('converts between camera distance (globe units) and altitude (metres)', () => {
  near(altitudeOf(1 + 1000 / R_EARTH), 1000, 1e-6);
  near(distanceOf(1000), 1 + 1000 / R_EARTH);
});

it('eases in and out, clamped to [0, 1]', () => {
  expect(ease(-1)).toBe(0); expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); expect(ease(2)).toBe(1);
  near(ease(0.5), 0.5);
  expect(ease(0.1)).toBeLessThan(0.1); expect(ease(0.9)).toBeGreaterThan(0.9);
});

it('interpolates altitude on a log scale, so each zoom level gets a similar share of the time', () => {
  near(logLerp(1000, 10, 0), 1000); near(logLerp(1000, 10, 1), 10); near(logLerp(1000, 10, 0.5), 100, 1e-9);
});

it('the zoom-in path turns to the pin early, then dollies down monotonically to the building altitude', () => {
  const from = latLonToVec3(30, -40), to = latLonToVec3(40.3443, -74.6663);
  const a0 = 7e6, a1 = 200;
  const start = zoomPose(0, { from, to, a0, a1 }), end = zoomPose(1, { from, to, a0, a1 });
  near(start.alt, a0, 1e-6); near(end.alt, a1, 1e-6);
  start.dir.forEach((v, i) => near(v, from[i], 1e-9));
  end.dir.forEach((v, i) => near(v, to[i], 1e-9));
  // Facing the pin well before the camera is low (the turn is done by 40 % of the time).
  zoomPose(0.4, { from, to, a0, a1 }).dir.forEach((v, i) => near(v, to[i], 1e-9));
  let prev = Infinity;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const p = zoomPose(t, { from, to, a0, a1 });
    expect(p.alt).toBeLessThanOrEqual(prev + 1e-9);
    near(Math.hypot(...p.dir), 1, 1e-9);
    prev = p.alt;
  }
  expect(ZOOM_MS).toBeGreaterThanOrEqual(3500); expect(ZOOM_MS).toBeLessThanOrEqual(4500);
});

it('the arc flight follows the great circle and rises mid-way on a long hop', () => {
  const p = latLonToVec3(48.3986, 9.9911), q = latLonToVec3(40.3522, -74.6569);
  const a = arcPose(0, p, q, 2.1), b = arcPose(1, p, q, 2.1), m = arcPose(0.5, p, q, 2.1);
  a.dir.forEach((v, i) => near(v, p[i])); b.dir.forEach((v, i) => near(v, q[i]));
  near(a.dist, 2.1); near(b.dist, 2.1);
  expect(m.dist).toBeGreaterThan(2.1);
  // Mid-way the direction is equidistant from both ends (on the great circle).
  const dot = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
  near(dot(m.dir, p), dot(m.dir, q), 1e-9);
  // Same place: no movement, no rise.
  const s = arcPose(0.5, p, p, 2.1); near(s.dist, 2.1); s.dir.forEach((v, i) => near(v, p[i]));
});

it('measures the ground span the view shows, wider when the frame is shifted for the stop card', () => {
  const fov = 32, r = Math.PI / 180;
  const plain = viewSpan(1000, fov, 1.6);
  near(plain, 2 * 1000 * Math.tan((fov * r) / 2) * 1.6, 1e-9); // wide stage: the width is the larger span
  const tall = viewSpan(1000, fov, 0.5);
  near(tall, 2 * 1000 * Math.tan((fov * r) / 2), 1e-9);
  expect(viewSpan(1000, fov, 1.6, { x: 0.2, y: 0 })).toBeGreaterThan(plain);
});

it('fits the building level so its image (not its soft edge) fills the view', () => {
  for (const [aspect, frame] of [[1.6, { x: 0, y: 0 }], [0.46, { x: 0, y: 0.2 }], [1.6, { x: 0.21, y: 0 }]]) {
    const alt = fitAltitude(150, 32, aspect, frame, 0.7);
    near(viewSpan(alt, 32, aspect, frame), 105, 1e-6);
  }
});

it('opacity schedule: each level starts to fade in at about 3x its extent; the end shows the closest level and its labels', () => {
  const at = span => levelOpacities(span, LEVELS);
  // From orbit nothing of the stack shows.
  expect(at(5e6).every(l => l.image === 0 && l.labels === 0)).toBe(true);
  // Each level: nothing above 3x its extent, something just below, fully in by 1.3x.
  LEVELS.forEach((l, i) => {
    expect(at(3.01 * l.extent)[i].image).toBe(0);
    expect(at(2.9 * l.extent)[i].image).toBeGreaterThan(0);
    expect(at(1.3 * l.extent)[i].image).toBe(1);
  });
  // State (the 300 km level in), city not yet.
  const state = at(300000);
  expect(state[0].image).toBe(1); expect(state[2].image).toBe(0);
  // Neighbourhood (city precision ends here, 0.7 of 2 km): levels 0-3 opaque, no street names yet.
  const hood = at(1400);
  expect(hood.slice(0, 4).map(l => l.image)).toEqual([1, 1, 1, 1]);
  expect(hood.every(l => l.labels === 0)).toBe(true);
  // Building (the fitted end, 0.7 of 150 m): every level opaque, only the closest labels.
  const end = at(105);
  expect(end.map(l => l.image)).toEqual([1, 1, 1, 1, 1, 1]);
  expect(end[5].labels).toBe(1); expect(end[4].labels).toBe(0);
  // Street (300 m): level 4 labels in.
  expect(at(300)[4].labels).toBe(1);
  // Monotone: as the span shrinks, no image fades back out.
  let prev = at(1e7).map(l => l.image);
  for (let s = 1e7; s > 50; s *= 0.9) {
    const cur = at(s).map(l => l.image);
    cur.forEach((v, i) => expect(v).toBeGreaterThanOrEqual(prev[i] - 1e-12));
    prev = cur;
  }
});

it('a level that failed to load stays hidden and the labels of the level above take over', () => {
  const lv = LEVELS.map((l, i) => (i === 5 ? { ...l, ok: false } : l));
  const end = levelOpacities(105, lv);
  expect(end[5]).toEqual({ image: 0, labels: 0 });
  expect(end[4].labels).toBe(1);
  expect(deepestLevel(lv)).toBe(4);
  expect(deepestLevel(LEVELS)).toBe(5);
  expect(deepestLevel(LEVELS.map(l => ({ ...l, ok: false })))).toBe(-1);
});

it('the zoom ends where the verified place allows: the building, or the neighbourhood (about 2 km) for a city', () => {
  const extents = LEVELS.map(l => l.extent);
  expect(endLevel(extents, 'building')).toBe(5);
  expect(endLevel(extents, 'city')).toBe(3);
  expect(endLevel(extents, 'anything else')).toBe(3);
  expect(endLevel([300000, 60000, 10000], 'city')).toBe(2); // no 2 km level: the closest wider one
});

it('renders "(c)" in credit text as the copyright sign', () => {
  expect(creditText('(c) OpenStreetMap contributors')).toBe('© OpenStreetMap contributors');
  expect(creditText('(c)swisstopo')).toBe('©swisstopo');
  expect(creditText('U.S. Geological Survey')).toBe('U.S. Geological Survey');
});
