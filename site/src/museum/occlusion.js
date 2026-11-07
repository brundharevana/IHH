// Occluder index for the hotspot rings (Task 4 fix round 1). Ring occlusion is a segment test from
// the eye to a few points on each ring, run only when the eye arrives somewhere (occlusion depends on
// the eye's position, not where it looks). A scanned room may carry 500k triangles, so the room's
// triangles are bucketed once into a uniform grid and a segment visits only the cells it crosses
// (3D DDA), testing each triangle at most once (Moller-Trumbore).
// roots: Object3D[] (a room scene, or a low-poly occluder layer when a room provides one). Invisible
// objects never occlude, nor do objects `skip` accepts (and their children). `owners` are objects
// (exhibits) a test may ignore: blocked(a, b, owner) disregards that owner's triangles.
import { Vector3 } from 'three';

export function createOccluderIndex(roots, { skip = () => false, owners = [] } = {}) {
  const tris = [], own = [];
  const v = new Vector3();
  const ownerOf = o => { for (let x = o; x; x = x.parent) { const i = owners.indexOf(x); if (i >= 0) return i; } return -1; };
  const walk = (o, hiddenAbove) => {
    if (hiddenAbove || !o.visible || skip(o)) return;
    if (o.isMesh && o.geometry && o.geometry.attributes.position && !o.isInstancedMesh) {
      o.updateWorldMatrix(true, false);
      const pos = o.geometry.attributes.position, idx = o.geometry.index;
      const n = idx ? idx.count : pos.count, owner = ownerOf(o);
      for (let i = 0; i < n; i++) {
        v.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(o.matrixWorld);
        tris.push(v.x, v.y, v.z);
        if (i % 3 === 2) own.push(owner);
      }
    }
    for (const c of o.children) walk(c, false);
  };
  for (const r of roots) walk(r, false);
  const T = new Float32Array(tris), O = Int16Array.from(own), count = O.length;

  // Grid: about two triangles per cell, at most 96 cells along an axis.
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < T.length; i += 3) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], T[i + a]); hi[a] = Math.max(hi[a], T[i + a]); }
  const size = hi.map((h, a) => Math.max(h - lo[a], 1e-3) + 1e-3);
  const cell = Math.max(Math.cbrt((size[0] * size[1] * size[2]) / Math.max(1, count / 2)), 1e-3);
  const res = size.map(s => Math.min(96, Math.max(1, Math.ceil(s / cell))));
  const step = size.map((s, a) => s / res[a]);
  const cellOf = (p, a) => Math.min(res[a] - 1, Math.max(0, Math.floor((p - lo[a]) / step[a])));
  const nCells = res[0] * res[1] * res[2];
  const start = new Int32Array(nCells + 1);
  const range = (t, a) => {
    const o = t * 9 + a, x0 = Math.min(T[o], T[o + 3], T[o + 6]), x1 = Math.max(T[o], T[o + 3], T[o + 6]);
    return [cellOf(x0, a), cellOf(x1, a)];
  };
  const forCells = (t, fn) => {
    const [x0, x1] = range(t, 0), [y0, y1] = range(t, 1), [z0, z1] = range(t, 2);
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(x + res[0] * (y + res[1] * z));
  };
  for (let t = 0; t < count; t++) forCells(t, c => { start[c + 1]++; });
  for (let c = 0; c < nCells; c++) start[c + 1] += start[c];
  const fill = start.slice(0, nCells), items = new Int32Array(start[nCells]);
  for (let t = 0; t < count; t++) forCells(t, c => { items[fill[c]++] = t; });
  const stamp = new Uint32Array(count);
  let query = 0;

  // Does the segment a -> b (open at both ends) cross a triangle?
  function hit(t, ox, oy, oz, dx, dy, dz) {
    const o = t * 9;
    const e1x = T[o + 3] - T[o], e1y = T[o + 4] - T[o + 1], e1z = T[o + 5] - T[o + 2];
    const e2x = T[o + 6] - T[o], e2y = T[o + 7] - T[o + 1], e2z = T[o + 8] - T[o + 2];
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-12) return false;
    const inv = 1 / det, sx = ox - T[o], sy = oy - T[o + 1], sz = oz - T[o + 2];
    const u = (sx * px + sy * py + sz * pz) * inv;
    if (u < 0 || u > 1) return false;
    const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
    const w = (dx * qx + dy * qy + dz * qz) * inv;
    if (w < 0 || u + w > 1) return false;
    const s = (e2x * qx + e2y * qy + e2z * qz) * inv;
    return s > 1e-4 && s < 1 - 1e-4;
  }

  function blocked(a, b, owner = null) {
    if (!count) return false;
    const skipOwner = owner ? owners.indexOf(owner) : -1;
    query = (query + 1) >>> 0;
    if (query === 0) { stamp.fill(0); query = 1; }
    const o = [a.x, a.y, a.z], d = [b.x - a.x, b.y - a.y, b.z - a.z];
    // Clip the segment to the grid box.
    let t0 = 0, t1 = 1;
    for (let k = 0; k < 3; k++) {
      if (Math.abs(d[k]) < 1e-12) { if (o[k] < lo[k] || o[k] > lo[k] + size[k]) return false; continue; }
      let ta = (lo[k] - o[k]) / d[k], tb = (lo[k] + size[k] - o[k]) / d[k];
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return false;
    }
    const p = [0, 1, 2].map(k => o[k] + d[k] * t0);
    const c = [0, 1, 2].map(k => cellOf(p[k], k));
    const dir = d.map(x => Math.sign(x));
    const tDelta = d.map((x, k) => (x ? Math.abs(step[k] / x) : Infinity));
    const tMax = d.map((x, k) => {
      if (!x) return Infinity;
      const edge = lo[k] + (c[k] + (x > 0 ? 1 : 0)) * step[k];
      return (edge - o[k]) / x;
    });
    for (;;) {
      const id = c[0] + res[0] * (c[1] + res[1] * c[2]);
      for (let i = start[id]; i < start[id + 1]; i++) {
        const t = items[i];
        if (stamp[t] === query) continue;
        stamp[t] = query;
        if (skipOwner >= 0 && O[t] === skipOwner) continue;
        if (hit(t, o[0], o[1], o[2], d[0], d[1], d[2])) return true;
      }
      const k = tMax[0] < tMax[1] ? (tMax[0] < tMax[2] ? 0 : 2) : (tMax[1] < tMax[2] ? 1 : 2);
      if (tMax[k] > t1) return false;
      c[k] += dir[k];
      if (c[k] < 0 || c[k] >= res[k]) return false;
      tMax[k] += tDelta[k];
    }
  }
  return { blocked, triangles: count };
}
