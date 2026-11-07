// Room shell: floor, four walls and ceiling as subdivided planes with ambient occlusion baked into
// their vertex colours once at build time (room corners, and contact shadows from the furniture and
// exhibits passed as occluders). Shared by the gallery (room.js) and reconstructed places.
import { gridPlane, bakeAO } from './geom.js';

export const WALL_SIDES = {
  north: { len: r => r.w, pos: r => [0, -r.d / 2], rotY: 0 },
  south: { len: r => r.w, pos: r => [0, r.d / 2], rotY: Math.PI },
  west: { len: r => r.d, pos: r => [-r.w / 2, 0], rotY: Math.PI / 2 },
  east: { len: r => r.d, pos: r => [r.w / 2, 0], rotY: -Math.PI / 2 },
};
// Grid spacing (m) of the baked AO: fine enough for soft contact shadows, coarse enough for the
// triangle budget.
export const AO_STEP = { floor: 0.1, wall: 0.15, ceiling: 0.25 };

// Baked wall light: lit from below the picture rail by the room's lights, falling off toward the
// ceiling (1 at eye height and below, WASH_TOP at the ceiling).
export const WASH_TOP = 0.72;
export const wallWash = h => p => {
  const t = Math.min(1, Math.max(0, (p.y - 1.6) / Math.max(0.1, h - 1.6)));
  return 1 - (1 - WASH_TOP) * t * t * (3 - 2 * t);
};

// room { w, d, h }; wallMaterial(name) -> material; occluders: world boxes (geom.js occlusionAt).
export function buildShell(THREE, room, { floor, ceiling, wallMaterial, occluders = [], shadows = false, bake = () => true }) {
  const { w, d, h } = room;
  const env = { room, occluders };
  const shell = new THREE.Group(); shell.name = 'shell';
  const place = (geometry, material, name, setup, aoOn = true, light = null) => {
    const mesh = new THREE.Mesh(geometry, material);
    setup(mesh); mesh.name = name; mesh.updateMatrix();
    if (aoOn) bakeAO(THREE, geometry, mesh.matrix, env, light);
    mesh.receiveShadow = shadows;
    shell.add(mesh);
    return mesh;
  };
  place(gridPlane(THREE, w, d, AO_STEP.floor), floor, 'floor', m => { m.rotation.x = -Math.PI / 2; });
  place(gridPlane(THREE, w, d, AO_STEP.ceiling), ceiling, 'ceiling', m => { m.rotation.x = Math.PI / 2; m.position.y = h; });
  for (const [name, side] of Object.entries(WALL_SIDES)) {
    const [x, z] = side.pos(room);
    const mat = wallMaterial(name);
    place(gridPlane(THREE, side.len(room), h, AO_STEP.wall), mat, `wall-${name}`, m => {
      m.position.set(x, h / 2, z); m.rotation.y = side.rotY;
    }, bake(name) && mat.vertexColors, wallWash(h));
  }
  return shell;
}

// World-space box of an object (after its matrices are current) as an occluder.
export function occluderOf(THREE, obj, strength, reach) {
  obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj);
  return { min: b.min.toArray(), max: b.max.toArray(), strength, reach };
}
