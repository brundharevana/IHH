// Gallery lighting: at most 4 live lights. Each exhibit (or group of exhibits, when there are more
// than four) gets a warm track spot from the ceiling track in front of its wall; every other pool
// of light and all contact darkening is baked into the shell (shell.js). Ambient comes from the
// room's environment map (scene.js). One shadow on desktop, none on a phone.
export const MAX_LIGHTS = 4;
export const SPOT = { color: 0xffe2bf, intensity: 60, angle: 0.26, penumbra: 0.7, decay: 2 };

// Where a spot aims at an exhibit group: the document on a plinth, else the group's centre.
export function aimPoint(THREE, g) {
  const doc = g.getObjectByName('document');
  return (doc || g).getWorldPosition(new THREE.Vector3());
}

// Spot head: a short cylinder on a stem, pointing from `from` to `to`. Merge-ready geometry.
function head(THREE, from, to) {
  const dir = to.clone().sub(from).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  const body = new THREE.CylinderGeometry(0.045, 0.038, 0.16, 16, 1, false).toNonIndexed();
  body.applyMatrix4(new THREE.Matrix4().compose(from, q, new THREE.Vector3(1, 1, 1)));
  body.userData.part = { type: 'cylinder', rt: 0.045, rb: 0.038, h: 0.16 };
  const stem = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8).toNonIndexed();
  stem.translate(from.x, from.y + 0.07, from.z);
  stem.userData.part = { type: 'cylinder', rt: 0.008, rb: 0.008, h: 0.1 };
  return [body, stem];
}

export function galleryLighting(THREE, scene, room, exhibits, { phone, trackOffset = 1.6 }) {
  const groups = [];
  const n = Math.min(MAX_LIGHTS, exhibits.length);
  exhibits.forEach((g, i) => { const k = Math.floor((i * n) / exhibits.length); (groups[k] = groups[k] || []).push(g); });
  const lights = [], heads = [];
  for (const grp of groups) {
    // Aim a little below the centre: the beam's near (upper) edge is brighter, which would otherwise
    // lift the pool above the picture.
    const target = grp.map(g => aimPoint(THREE, g)).reduce((a, b) => a.add(b), new THREE.Vector3()).divideScalar(grp.length);
    target.y -= 0.2;
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(grp[0].getWorldQuaternion(new THREE.Quaternion()));
    const at = target.clone().add(normal.clone().setY(0).normalize().multiplyScalar(trackOffset - 0.05));
    at.y = room.h - 0.2;
    const spread = grp.length > 1 ? grp[grp.length - 1].position.distanceTo(grp[0].position) / 2 : 0;
    const s = new THREE.SpotLight(SPOT.color, SPOT.intensity * (phone ? 0.85 : 1), 0, SPOT.angle + Math.atan(spread / 3), SPOT.penumbra, SPOT.decay);
    s.position.copy(at); s.target.position.copy(target);
    scene.add(s, s.target); lights.push(s);
    heads.push(...head(THREE, at, target));
  }
  if (lights.length && !phone) {
    // The shadow goes to the spot over a plinth (its case throws a shadow on the floor), else the first.
    const k = Math.max(0, groups.findIndex(grp => grp.some(g => g.getObjectByName('plinth'))));
    lights[k].castShadow = true;
    lights[k].shadow.mapSize.set(1024, 1024); lights[k].shadow.bias = -0.0004; lights[k].shadow.radius = 4;
  }
  if (lights.length < MAX_LIGHTS) {
    const fill = new THREE.HemisphereLight(0xfff3e2, 0x4a4036, 0.25);
    scene.add(fill); lights.push(fill);
  }
  return { lights, heads };
}
