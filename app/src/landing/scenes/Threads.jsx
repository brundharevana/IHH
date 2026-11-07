import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useScopedTexture } from '../../shared/loadHooks.js'
import { scrollState, range, smooth } from '../store.js'
import { makePath } from './path.js'
import { rng } from './materials.js'

// A dark globe with many glowing threads converging on the United States.
// The routes are ILLUSTRATIVE: port cities chosen for shape, not migration data. The page says so.

const R = 10

export function latLon(lat, lon, r = R, out = new THREE.Vector3()) {
  const phi = ((90 - lat) * Math.PI) / 180
  const th = ((lon + 180) * Math.PI) / 180
  return out.set(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th))
}

const US = latLon(38.5, -92)

export const threadsPose = makePath([
  { pos: [0, 3, 44], look: [0, 0, 0], fov: 38 },
  { pos: [7, 6, 33], look: [0, 1.5, 0], fov: 40 },
  { pos: [3, 8, 25], look: [US.x * 0.6, US.y * 0.6, US.z * 0.6], fov: 42 },
  { pos: [US.x * 1.8, US.y * 1.55, US.z * 1.75], look: [US.x, US.y, US.z], fov: 46 },
  { pos: [US.x * 1.12, US.y * 1.12, US.z * 1.12], look: [US.x * 0.9, US.y * 0.9, US.z * 0.9], fov: 60 },
])

// [lat, lon] port cities around the world (illustrative)
const ORIGINS = [
  [53.35, -6.26], [53.41, -2.98], [53.55, 9.99], [40.85, 14.27], [44.41, 8.93], [49.49, 0.11],
  [38.72, -9.14], [37.98, 23.73], [59.91, 10.75], [59.33, 18.07], [54.35, 18.65], [46.48, 30.72],
  [41.01, 28.98], [33.89, 35.5], [6.45, 3.39], [14.69, -17.44], [-33.92, 18.42], [19.08, 72.88],
  [14.6, 120.98], [31.23, 121.47], [22.32, 114.17], [35.44, 139.64], [37.57, 126.98], [-33.87, 151.21],
  [-12.05, -77.04], [-34.6, -58.38], [-22.91, -43.17], [19.43, -99.13], [23.11, -82.37], [18.54, -72.34],
  [4.71, -74.07], [17.97, -76.79], [10.82, 106.63], [24.86, 67.0], [30.04, 31.24], [9.03, 38.74],
  [35.69, 51.39], [51.51, -0.13], [52.37, 4.9], [64.15, -21.94], [-1.29, 36.82], [13.75, 100.5],
]
const DEST = {
  east: [[40.71, -74.0], [42.36, -71.06], [39.29, -76.61], [39.95, -75.17]],
  west: [[37.77, -122.42], [34.05, -118.24], [47.61, -122.33]],
  south: [[25.76, -80.19], [29.3, -94.8], [29.95, -90.07]],
  mid: [[41.88, -87.63]],
}

function destFor(lat, lon, i) {
  if (lon > 95 || lon < -150) return DEST.west[i % DEST.west.length]
  if (lat < 25 && lon < -30) return DEST.south[i % DEST.south.length]
  if (i % 7 === 0) return DEST.mid[0]
  return DEST.east[i % DEST.east.length]
}

const threadShader = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv; uniform float uTime; uniform float uOffset; uniform float uSpeed; uniform float uReveal;
    void main(){
      float along = vUv.x;
      if (along > uReveal) discard;
      float head = fract(along - uTime*uSpeed + uOffset);
      float comet = pow(head, 10.) * 1.6;
      float base = .16 + .25*smoothstep(.6,1.,along);
      vec3 warm = mix(vec3(1.,.55,.18), vec3(1.,.92,.78), comet);
      gl_FragColor = vec4(warm * (base + comet), 1.);
    }`,
}

function Thread({ from, to, seed, mobile }) {
  const mat = useMemo(() => {
    const r = rng(seed)
    const m = new THREE.ShaderMaterial({
      ...threadShader,
      uniforms: { uTime: { value: 0 }, uOffset: { value: r() }, uSpeed: { value: 0.12 + r() * 0.14 }, uReveal: { value: 0 } },
    })
    return m
  }, [seed])
  const geo = useMemo(() => {
    const a = latLon(from[0], from[1], 1)
    const b = latLon(to[0], to[1], 1)
    const ang = a.angleTo(b)
    const lift = 0.4 + ang * 2.6
    const pts = []
    const q = new THREE.Vector3()
    for (let k = 0; k <= 48; k++) {
      const t = k / 48
      // slerp on the unit sphere, then lift above the surface
      q.copy(a).lerp(b, t).normalize()
      if (ang > 2.6) q.add(new THREE.Vector3(0, Math.sin(Math.PI * t) * 0.35, 0)).normalize()
      pts.push(q.clone().multiplyScalar(R + Math.sin(Math.PI * t) * lift))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, mobile ? 0.03 : 0.02, 4, false)
  }, [from, to, mobile])
  const delay = useMemo(() => rng(seed + 3)() * 0.25, [seed])
  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
    // threads draw themselves in over the first half of the entrance
    mat.uniforms.uReveal.value = 0.02 + smooth(range(scrollState.entrance, delay, delay + 0.35)) * 1.0
  })
  return <mesh geometry={geo} material={mat} />
}

function Pulse({ at }) {
  const ref = useRef()
  const pos = useMemo(() => latLon(at[0], at[1], R + 0.03), [at])
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()), [pos])
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.6 + at[0]) % 1
    ref.current.scale.setScalar(0.06 + t * 0.32)
    ref.current.material.opacity = (1 - t) * 0.7
  })
  return (
    <mesh ref={ref} position={pos} quaternion={quat}>
      <ringGeometry args={[0.86, 1, 48]} />
      <meshBasicMaterial color="#ffb366" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  )
}

function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        // back faces of a slightly larger shell: brightest where it meets the globe's limb, fading outward
        fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float d = abs(dot(vN, vV)); float i = pow(smoothstep(0., .34, d), 3.) * (1. - smoothstep(.34, .6, d)); gl_FragColor = vec4(vec3(1.,.62,.3)*i*.45, 1.); }`,
      }),
    []
  )
  return (
    <mesh material={mat} scale={1.06}>
      <sphereGeometry args={[R, 64, 32]} />
    </mesh>
  )
}

function Starfield({ count }) {
  const pts = useMemo(() => {
    const r = rng(77)
    const a = []
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(300 + r() * 200)
      a.push(v.x, v.y, v.z)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3))
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#f0e8dd', size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.6, fog: false }))
  }, [count])
  return <primitive object={pts} />
}

export default function Threads({ mobile = false, visible = true }) {
  const earth = useScopedTexture('landing/earth-2048.webp')
  earth.colorSpace = THREE.SRGBColorSpace
  earth.anisotropy = 8
  const globe = useRef()
  const routes = useMemo(() => {
    const list = ORIGINS.map((o, i) => ({ from: o, to: destFor(o[0], o[1], i), seed: i * 13 + 5 }))
    return mobile ? list.filter((_, i) => i % 2 === 0) : list
  }, [mobile])
  const dests = useMemo(() => [...DEST.east, ...DEST.west, ...DEST.south, ...DEST.mid], [])

  useFrame(({ clock }) => {
    // the globe turns the Atlantic toward us, then settles with North America facing the camera
    const e = scrollState.entrance
    const settle = smooth(range(e, 0, 0.55))
    globe.current.rotation.y = (1 - settle) * -1.05 + Math.sin(clock.elapsedTime * 0.05) * 0.02 * (1 - settle)
  })

  return (
    <group visible={visible}>
      <Starfield count={mobile ? 500 : 1400} />
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[R, mobile ? 64 : 128, mobile ? 32 : 64]} />
          <meshStandardMaterial map={earth} color="#8f97a3" roughness={0.8} metalness={0} emissiveMap={earth} emissive="#4a505c" emissiveIntensity={0.55} />
        </mesh>
        <Atmosphere />
        {routes.map((r) => (
          <Thread key={r.seed} {...r} mobile={mobile} />
        ))}
        {dests.map((d) => (
          <Pulse key={d.join()} at={d} />
        ))}
      </group>
      <directionalLight position={[-30, 20, 30]} intensity={1.6} color="#ffe3c4" />
      <ambientLight intensity={0.12} />
    </group>
  )
}
