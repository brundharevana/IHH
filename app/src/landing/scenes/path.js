import * as THREE from 'three'

// Camera path from evenly spaced keyframes: Catmull-Rom through positions and look targets,
// linear through fov. t in [0,1].
export function makePath(frames) {
  const pos = new THREE.CatmullRomCurve3(frames.map((f) => new THREE.Vector3(...f.pos)), false, 'centripetal')
  const look = new THREE.CatmullRomCurve3(frames.map((f) => new THREE.Vector3(...f.look)), false, 'centripetal')
  const fovs = frames.map((f) => f.fov ?? 50)
  return (t, out) => {
    const u = Math.min(1, Math.max(0, t))
    pos.getPoint(u, out.pos)
    look.getPoint(u, out.look)
    const x = u * (fovs.length - 1)
    const i = Math.min(fovs.length - 2, Math.floor(x))
    out.fov = fovs[i] + (fovs[i + 1] - fovs[i]) * (x - i)
    return out
  }
}
