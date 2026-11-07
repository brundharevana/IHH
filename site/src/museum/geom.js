// Geometry kit for rooms and furniture: bevelled boxes with texture coordinates in metres (so one
// wood texture keeps its real size on every board), merging many parts into one mesh per material
// (draw-call budget), subdivided planes, and ambient occlusion baked into vertex colours.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Box-projected UVs in metres: each vertex takes the two coordinates of the plane its normal faces.
// `grain` is the axis the texture's u direction (the wood grain) follows where the face allows it.
export function metreUVs(geometry, grain = 'x') {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal, uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const p = { x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i) };
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    // The two axes in the face plane, grain first when it lies in the plane.
    const plane = ax >= ay && ax >= az ? ['z', 'y'] : ay >= az ? ['x', 'z'] : ['x', 'y'];
    const [u, v] = plane.includes(grain) ? [grain, plane.find(a => a !== grain)] : plane;
    uv.setXY(i, p[u], p[v]);
  }
  uv.needsUpdate = true;
  return geometry;
}

// A box part: w x h x d metres centred at (x, y, z), turned ry about y, edges rounded by `bevel` m.
// Returns non-indexed geometry (merge-ready) tagged with what it is, for tests and provenance.
export function boxPart(THREE, { w, h, d, x = 0, y = 0, z = 0, ry = 0, rx = 0, bevel = 0.004, grain }) {
  const r = Math.min(bevel, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const g = r > 1e-4 ? new RoundedBoxGeometry(w, h, d, 1, r) : new THREE.BoxGeometry(w, h, d);
  metreUVs(g, grain || (w >= h && w >= d ? 'x' : h >= d ? 'y' : 'z'));
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0)), new THREE.Vector3(1, 1, 1));
  const out = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m);
  g.dispose();
  out.userData.part = { type: 'box', w, h, d, x, y, z, ry, rx, bevel: r };
  return out;
}

export function cylinderPart(THREE, { rt, rb, h, x = 0, y = 0, z = 0, rx = 0, rz = 0, ry = 0, seg = 20, open = false }) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
  metreUVs(g, 'y');
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(1, 1, 1));
  const out = (g.index ? g.toNonIndexed() : g.clone()).applyMatrix4(m);
  g.dispose();
  out.userData.part = { type: 'cylinder', rt, rb, h, x, y, z };
  return out;
}

// Many parts -> one geometry; the parts' tags are kept on geometry.userData.parts.
export function mergeParts(parts) {
  const clean = parts.map(p => {
    for (const k of Object.keys(p.attributes)) if (!['position', 'normal', 'uv'].includes(k)) p.deleteAttribute(k);
    return p;
  });
  const g = mergeGeometries(clean, false);
  if (!g) throw new Error('mergeParts: parts have incompatible attributes');
  g.userData.parts = parts.map(p => p.userData.part);
  for (const p of parts) p.dispose();
  return g;
}

// Plane of w x h metres in its local xy, facing +z, subdivided about every `step` m (for baked AO),
// with UVs in metres from its lower-left corner.
export function gridPlane(THREE, w, h, step) {
  const g = new THREE.PlaneGeometry(w, h, Math.max(1, Math.round(w / step)), Math.max(1, Math.round(h / step)));
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) + w / 2, pos.getY(i) + h / 2);
  return g;
}

// Ambient occlusion baked once into vertex colours (multiplies the surface colour under every light,
// so it also darkens under direct light: contact shadows on a phone without shadow maps).
// Occluders are world-space boxes { min: [x,y,z], max: [x,y,z], strength, reach }; the room box
// darkens along its own corners (floor/wall, wall/wall and wall/ceiling edges).
export function boxDistance(p, b) {
  let s = 0;
  for (let k = 0; k < 3; k++) {
    const v = p[k] < b.min[k] ? b.min[k] - p[k] : p[k] > b.max[k] ? p[k] - b.max[k] : 0;
    s += v * v;
  }
  return Math.sqrt(s);
}

export function occlusionAt(p, n, { room, occluders = [] }) {
  let ao = 1;
  if (room) {
    // Distance to each room surface the point is not on: corners and edges darken softly.
    const faces = [p[0] + room.w / 2, room.w / 2 - p[0], p[1], room.h - p[1], p[2] + room.d / 2, room.d / 2 - p[2]];
    const normals = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    faces.forEach((dist, k) => {
      const on = normals[k][0] * n[0] + normals[k][1] * n[1] + normals[k][2] * n[2] > 0.9 && dist < 0.02;
      if (on) return;
      const strength = k === 3 ? 0.18 : 0.32; // the ceiling edge is softer than the floor and wall corners
      ao *= 1 - strength * Math.exp(-Math.max(0, dist) / 0.22);
    });
  }
  for (const b of occluders) {
    const c = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
    // Only occluders on the lit side of the surface.
    if ((c[0] - p[0]) * n[0] + (c[1] - p[1]) * n[1] + (c[2] - p[2]) * n[2] <= 0) continue;
    const dist = boxDistance(p, b);
    ao *= 1 - (b.strength ?? 0.5) * Math.exp(-dist / (b.reach ?? 0.15));
  }
  return Math.max(0.3, ao);
}

// Writes a `color` attribute on a geometry already placed in world space by `matrix`.
// `light(p)` (optional) multiplies in baked light: e.g. walls washed brighter low down than high up.
export function bakeAO(THREE, geometry, matrix, env, light = null) {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  const nm = new THREE.Matrix3().getNormalMatrix(matrix);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(matrix);
    n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
    const v = occlusionAt(p.toArray(), n.toArray(), env) * (light ? light(p) : 1);
    col[i * 3] = v; col[i * 3 + 1] = v; col[i * 3 + 2] = v;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geometry;
}
