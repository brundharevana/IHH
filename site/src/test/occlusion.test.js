// Ring occlusion index (src/museum/occlusion.js): segment tests against the room's triangles, built
// once per room on a uniform grid so a dense scan (500k triangles) is still cheap to query. Invisible
// objects and skipped ones (the rings) never occlude; a ring's own exhibit is ignored for that ring.
import { it, expect } from 'vitest';
import * as THREE from 'three';
import { createOccluderIndex } from '../museum/occlusion.js';

const wall = (x, y, z, w = 1, h = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial()); m.position.set(x, y, z); m.updateMatrixWorld(true); return m; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

it('finds a blocker on the segment, not beyond it or behind the start', () => {
  const idx = createOccluderIndex([wall(0, 0, -2)]);
  expect(idx.blocked(V(0, 0, 0), V(0, 0, -3))).toBe(true);
  expect(idx.blocked(V(0, 0, 0), V(0, 0, -1.9))).toBe(false); // stops short of the wall
  expect(idx.blocked(V(0, 0, -2.5), V(0, 0, -4))).toBe(false); // starts behind it
  expect(idx.blocked(V(2, 0, 0), V(2, 0, -3))).toBe(false); // passes beside it
});

it('skips invisible objects, skipped objects and the owner of the ring being tested', () => {
  const hidden = wall(0, 0, -2); hidden.visible = false;
  const g = new THREE.Group(); g.visible = false; g.add(wall(1, 0, -2)); g.updateMatrixWorld(true);
  const ring = wall(2, 0, -2); ring.userData.ringId = 'ex1';
  const exhibit = new THREE.Group(); exhibit.add(wall(3, 0, -2)); exhibit.updateMatrixWorld(true);
  const idx = createOccluderIndex([hidden, g, ring, exhibit], { skip: o => Boolean(o.userData.ringId), owners: [exhibit] });
  expect(idx.blocked(V(0, 0, 0), V(0, 0, -3))).toBe(false);
  expect(idx.blocked(V(1, 0, 0), V(1, 0, -3))).toBe(false);
  expect(idx.blocked(V(2, 0, 0), V(2, 0, -3))).toBe(false);
  expect(idx.blocked(V(3, 0, 0), V(3, 0, -3))).toBe(true);
  expect(idx.blocked(V(3, 0, 0), V(3, 0, -3), exhibit)).toBe(false);
});

it('scales to a 500k-triangle scan: one occlusion pass (4 rings x 3 samples) takes under 5 ms', () => {
  // A dense crumpled surface between the eye and the rings, about 500k triangles.
  const geo = new THREE.PlaneGeometry(10, 4, 500, 500);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.05 * Math.sin(pos.getX(i) * 7) * Math.cos(pos.getY(i) * 5));
  const scan = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  scan.position.set(0, 1.5, -3); scan.updateMatrixWorld(true);
  expect(geo.index.count / 3).toBeGreaterThanOrEqual(500000);
  const idx = createOccluderIndex([scan]);
  const eye = V(0, 1.6, 0);
  const targets = [];
  for (const x of [-3, -1, 1, 3]) for (const dx of [-0.1, 0, 0.1]) targets.push(V(x + dx, 1.8, -5));
  for (const t of targets) idx.blocked(eye, t); // warm up the JIT
  let best = Infinity;
  for (let k = 0; k < 5; k++) {
    const t0 = performance.now();
    const hits = targets.map(t => idx.blocked(eye, t));
    best = Math.min(best, performance.now() - t0);
    expect(hits.every(Boolean)).toBe(true);
  }
  console.log(`occlusion pass over ${geo.index.count / 3} triangles: ${best.toFixed(2)} ms`);
  expect(best).toBeLessThan(5);
  // In front of the scan nothing blocks.
  expect(idx.blocked(eye, V(0, 1.6, -2.5))).toBe(false);
});
