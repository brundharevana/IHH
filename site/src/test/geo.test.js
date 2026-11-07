import { it, expect } from 'vitest';
import { latLonToVec3, vec3ToLatLon, orbitAngles, centralAngle, greatCirclePoints, centreOf, fanOut, nearestAngle } from '../museum/geo.js';

const close = (a, b, eps = 1e-9) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9));

it('places lat/lon on the unit sphere the way SphereGeometry maps an equirectangular image', () => {
  close(latLonToVec3(90, 0), [0, 1, 0]);
  close(latLonToVec3(-90, 0), [0, -1, 0]);
  close(latLonToVec3(0, 0), [1, 0, 0]); // Greenwich on the equator: image centre, u = 0.5
  close(latLonToVec3(0, 90), [0, 0, -1]);
  close(latLonToVec3(0, -90), [0, 0, 1]);
  close(latLonToVec3(0, 180), [-1, 0, 0]);
  expect(Math.hypot(...latLonToVec3(48.3986, 9.9911, 2))).toBeCloseTo(2, 9);
});

it('agrees with three.js SphereGeometry vertex layout (u = phi / 2pi from 180 W)', () => {
  // SphereGeometry: x = -cos(phi) sin(theta), y = cos(theta), z = sin(phi) sin(theta), u = phi / 2pi, v = 1 - theta / pi.
  for (const [lat, lon] of [[40.3522, -74.6569], [46.948, 7.4474], [-33.9, 151.2]]) {
    const u = (lon + 180) / 360, theta = ((90 - lat) * Math.PI) / 180, phi = u * 2 * Math.PI;
    close(latLonToVec3(lat, lon), [-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)]);
  }
});

it('round-trips lat/lon', () => {
  for (const [lat, lon] of [[48.3986, 9.9911], [40.3443, -74.6663], [-12, 179.5], [0, -180 + 1e-6]]) {
    const r = vec3ToLatLon(latLonToVec3(lat, lon));
    expect(r.lat).toBeCloseTo(lat, 9);
    expect(r.lon).toBeCloseTo(lon, 6);
  }
});

it('gives the orbit angles that put the camera over a point', () => {
  for (const [lat, lon] of [[48.4, 10], [40.35, -74.66], [0, 0], [-60, 120]]) {
    const v = latLonToVec3(lat, lon);
    const { azimuth, polar } = orbitAngles(v);
    close([Math.sin(polar) * Math.sin(azimuth), Math.cos(polar), Math.sin(polar) * Math.cos(azimuth)], v);
  }
});

it('measures the central angle between places', () => {
  expect(centralAngle({ lat: 0, lon: 0 }, { lat: 0, lon: 90 })).toBeCloseTo(Math.PI / 2, 9);
  // Bern to Princeton is about 6,300 km on a 6,371 km sphere.
  const km = centralAngle({ lat: 46.948, lon: 7.4474 }, { lat: 40.3522, lon: -74.6569 }) * 6371;
  expect(km).toBeGreaterThan(6200);
  expect(km).toBeLessThan(6400);
});

it('draws a great-circle arc that starts and ends on the two places and rises in between', () => {
  const a = { lat: 46.948, lon: 7.4474 }, b = { lat: 40.3522, lon: -74.6569 };
  const pts = greatCirclePoints(a, b, { segments: 32, lift: 0.25 });
  expect(pts).toHaveLength(33);
  close(pts[0], latLonToVec3(a.lat, a.lon));
  close(pts[32], latLonToVec3(b.lat, b.lon));
  const heights = pts.map(p => Math.hypot(...p));
  expect(Math.max(...heights)).toBeCloseTo(1 + 0.25 * centralAngle(a, b), 9);
  expect(heights[16]).toBe(Math.max(...heights));
  heights.forEach(h => expect(h).toBeGreaterThanOrEqual(1 - 1e-12));
  // Every point lies in the plane of the great circle through a, b and the centre.
  const p = latLonToVec3(a.lat, a.lon), q = latLonToVec3(b.lat, b.lon);
  const n = [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  for (const v of pts) expect(n[0] * v[0] + n[1] * v[1] + n[2] * v[2]).toBeCloseTo(0, 9);
});

it('draws nothing between two stops in the same town', () => {
  expect(greatCirclePoints({ lat: 40.3522, lon: -74.6569 }, { lat: 40.3522, lon: -74.6569 })).toEqual([]);
  expect(greatCirclePoints({ lat: 40.3522, lon: -74.6569 }, { lat: 40.3443, lon: -74.6663 })).toEqual([]);
});

it('centres the opening view between the stops', () => {
  const c = centreOf([{ lat: 46.948, lon: 7.4474 }, { lat: 40.3522, lon: -74.6569 }]);
  expect(c.lon).toBeGreaterThan(-74.6569);
  expect(c.lon).toBeLessThan(7.4474);
  expect(centreOf([{ lat: 10, lon: 20 }])).toMatchObject({ lat: expect.closeTo(10, 9), lon: expect.closeTo(20, 9) });
});

it('fans out pin labels that would overlap, and leaves a lone pin where it is', () => {
  const pts = [{ id: 'ulm', x: 400, y: 200 }, { id: 'p33', x: 100, y: 300 }, { id: 'mercer', x: 101, y: 302 }, { id: 'p55', x: 100, y: 300 }];
  const out = fanOut(pts, 32);
  expect(out.get('ulm')).toEqual({ x: 400, y: 200, ax: 400, ay: 200 });
  const fanned = ['p33', 'mercer', 'p55'].map(id => out.get(id));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    expect(Math.hypot(fanned[i].x - fanned[j].x, fanned[i].y - fanned[j].y)).toBeGreaterThanOrEqual(32);
  }
  // Each label still points at its own pin, sits above the group, and the order runs left to right.
  expect(fanned.map(f => [f.ax, f.ay])).toEqual([[100, 300], [101, 302], [100, 300]]);
  fanned.forEach(f => expect(f.y).toBeLessThan(300));
  expect(fanned[0].x).toBeLessThan(fanned[1].x);
  expect(fanned[1].x).toBeLessThan(fanned[2].x);
});

it('turns the short way round', () => {
  expect(nearestAngle(0, 0.5)).toBeCloseTo(0.5, 12);
  expect(nearestAngle(6, -0.5)).toBeCloseTo(2 * Math.PI - 0.5, 12);
  expect(nearestAngle(-7, 3)).toBeCloseTo(3 - 4 * Math.PI, 12);
  for (const [c, t] of [[0.1, 3.2], [10, -10], [-3, 3]]) {
    const r = nearestAngle(c, t);
    expect(Math.abs(r - c)).toBeLessThanOrEqual(Math.PI + 1e-12);
    expect(Math.cos(r)).toBeCloseTo(Math.cos(t), 12);
    expect(Math.sin(r)).toBeCloseTo(Math.sin(t), 12);
  }
});

// No two placed pins closer than the gap, also between a fanned group and a pin outside it: a fanned
// label can land on a lone pin nearby (the Washington, Mercer Street and Princeton fan on a phone,
// next to San Diego's pin), which makes both too small a touch target.
it('fanOut keeps every placed pin at least the gap from every other, across groups', () => {
  const gap = 34;
  const pts = [{ id: 'a', x: 100, y: 100 }, { id: 'b', x: 105, y: 102 }, { id: 'c', x: 110, y: 98 }, { id: 'lone', x: 60, y: 60 }];
  const out = fanOut(pts, gap);
  const placed = [...out.values()];
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    expect(Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y)).toBeGreaterThanOrEqual(gap - 1e-6);
  }
  // Every pin keeps its anchor (the dot its leader line goes to).
  for (const p of pts) expect([out.get(p.id).ax, out.get(p.id).ay]).toEqual([p.x, p.y]);
  // A pin that did not need to move stays on its dot.
  const far = fanOut([{ id: 'x', x: 0, y: 0 }, { id: 'y', x: 200, y: 0 }], gap);
  expect(far.get('x')).toEqual({ x: 0, y: 0, ax: 0, ay: 0 });
});
