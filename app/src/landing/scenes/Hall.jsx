import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useScopedTexture } from '../../shared/loadHooks.js'
import { slabTexture, roughTexture, stoneTexture } from './materials.js'
import { smooth, clamp01, scrollState } from '../store.js'
import inductees from '../data/inductees.json'

// The persistent hall: a long gallery running along -z. Inductee niches line the left wall
// (x = -HALF_W); the camera trucks sideways past them, one bay per inductee.

export const HALF_W = 6
export const HEIGHT = 9
export const BAY_Z = [-4, -14, -24, -34, -44]
// the portrait file of each bay's inductee (same order as the landing's slides), null for none
const PORTRAIT_BAYS = BAY_Z.map((_, i) => inductees[i]?.portrait?.src || null)
const PORTRAIT_SRCS = PORTRAIT_BAYS.filter(Boolean)
const HALL_FRONT = 8
const HALL_BACK = -56

// camera poses -------------------------------------------------------------
export const ARRIVAL = { pos: new THREE.Vector3(0, 1.75, 5.5), look: new THREE.Vector3(0, 2.2, -30), fov: 50 }

const _p = new THREE.Vector3()
const _l = new THREE.Vector3()
export function bayPose(i, out) {
  const z = BAY_Z[0] + (BAY_Z[1] - BAY_Z[0]) * i
  out.pos.set(1.4, 1.75, z)
  out.look.set(-HALF_W, 2.05, z)
  out.fov = 46
  return out
}
// arrive: 0..1 from the corridor view to bay 0; bay: float bay index
export function hallPose(arrive, bay, out) {
  bayPose(bay, out)
  const a = smooth(clamp01(arrive))
  if (a < 1) {
    _p.copy(ARRIVAL.pos).lerp(out.pos, a)
    _l.copy(ARRIVAL.look).lerp(out.look, a)
    out.pos.copy(_p)
    out.look.copy(_l)
    out.fov = ARRIVAL.fov + (out.fov - ARRIVAL.fov) * a
  }
  return out
}

// niche back panel: warm radial glow that reads as a lit recess behind the portrait
const nicheGlow = {
  uniforms: { uColor: { value: new THREE.Color('#ffb366') }, uBase: { value: new THREE.Color('#2a2119') }, uLift: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv; uniform vec3 uColor; uniform vec3 uBase; uniform float uLift;
    void main(){
      vec2 p = vUv - vec2(.5,.62);
      float d = length(p*vec2(1.1,.8));
      float g = smoothstep(.62,.0,d);
      float top = smoothstep(.0,1.,vUv.y);
      // uLift 0..1: the niche light rising as its inductee is revealed
      vec3 c = mix(uBase, uColor*.9, (g*.55 + top*.12) * (.45 + .75*uLift));
      gl_FragColor = vec4(c,1.);
      #include <colorspace_fragment>
    }`,
}

// Silhouette canvas for frames without a rights-cleared portrait.
const silhouetteShader = {
  vertexShader: nicheGlow.vertexShader,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    void main(){
      vec3 bg = mix(vec3(.10,.085,.07), vec3(.18,.15,.12), vUv.y);
      vec2 h = (vUv - vec2(.5,.62)) * vec2(1.,1.15);
      float head = smoothstep(.16,.15,length(h));
      vec2 s = (vUv - vec2(.5,.08)) * vec2(.9,1.4);
      float body = smoothstep(.42,.41,length(s)) * step(vUv.y,.42);
      float m = max(head, body);
      vec3 c = mix(bg, vec3(.05,.04,.035), m*.85);
      gl_FragColor = vec4(c,1.);
      #include <colorspace_fragment>
    }`,
}

function Pilasters({ material }) {
  // pilasters between bays on both walls, instanced
  const zs = useMemo(() => {
    // halfway between bays, never behind a niche
    const a = []
    for (let z = BAY_Z[0] + 5; z > HALL_BACK + 2; z -= 10) a.push(z)
    return a
  }, [])
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.5, HEIGHT, 0.9)
    const m = new THREE.InstancedMesh(geo, material, zs.length * 2)
    const o = new THREE.Object3D()
    let k = 0
    for (const z of zs) {
      for (const side of [-1, 1]) {
        o.position.set(side * (HALF_W - 0.25), HEIGHT / 2, z)
        o.updateMatrix()
        m.setMatrixAt(k++, o.matrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
    return m
  }, [zs, material])
  return <primitive object={mesh} />
}

function Coffers({ material }) {
  const mesh = useMemo(() => {
    const rows = []
    for (let z = HALL_FRONT; z > HALL_BACK; z -= 2.5) rows.push(z)
    const geo = new THREE.BoxGeometry(HALF_W * 2, 0.35, 0.3)
    const m = new THREE.InstancedMesh(geo, material, rows.length)
    const o = new THREE.Object3D()
    rows.forEach((z, k) => {
      o.position.set(0, HEIGHT - 0.18, z)
      o.updateMatrix()
      m.setMatrixAt(k, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    return m
  }, [material])
  return <primitive object={mesh} />
}

function Niche({ z, i, trimMat }) {
  // a lit panel 3.8 wide x 5.4 tall inside a projecting stone frame (aedicula)
  const w = 3.8, h = 5.4, y0 = 0.6
  const mat = useMemo(() => new THREE.ShaderMaterial({ ...nicheGlow, uniforms: THREE.UniformsUtils.clone(nicheGlow.uniforms) }), [])
  const lamp = useRef()
  useFrame(() => {
    const lift = scrollState.niche[i]?.v || 0
    mat.uniforms.uLift.value = lift
    if (lamp.current) lamp.current.intensity = 2.5 + 7 * lift
  })
  return (
    <group position={[-HALF_W, 0, z]}>
      <mesh position={[0.03, y0 + h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={mat}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* jambs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.05, y0 + h / 2, s * (w / 2 + 0.18)]} material={trimMat}>
          <boxGeometry args={[0.5, h + 0.2, 0.36]} />
        </mesh>
      ))}
      {/* lintel and sill */}
      <mesh position={[0.08, y0 + h + 0.28, 0]} material={trimMat}>
        <boxGeometry args={[0.6, 0.45, w + 1]} />
      </mesh>
      <mesh position={[0.15, y0 - 0.15, 0]} material={trimMat}>
        <boxGeometry args={[0.7, 0.3, w + 0.8]} />
      </mesh>
      <pointLight ref={lamp} position={[1.2, y0 + h - 0.4, 0]} intensity={2.5} distance={7} decay={2} color="#ffc68a" />
    </group>
  )
}

function PortraitFrame({ z, map }) {
  const silMat = useMemo(() => new THREE.ShaderMaterial(silhouetteShader), [])
  return (
    <group position={[HALF_W - 0.06, 3.1, z]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.3, 2.9, 0.12]} />
        <meshStandardMaterial color="#8c6a3a" metalness={0.85} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.05]} material={map ? undefined : silMat}>
        <planeGeometry args={[1.9, 2.4]} />
        {map && <meshStandardMaterial map={map} roughness={0.7} />}
      </mesh>
      {/* picture light */}
      <mesh position={[0, 1.65, 0.25]}>
        <boxGeometry args={[1.2, 0.08, 0.12]} />
        <meshStandardMaterial color="#8c6a3a" metalness={0.9} roughness={0.3} emissive="#ffb366" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

export default function Hall({ mobile = false, visible = true }) {
  const floorTex = useMemo(() => slabTexture([3, 22]), [])
  const floorRough = useMemo(() => roughTexture([3, 22]), [])
  const wallTex = useMemo(() => stoneTexture('#3a332b', [6, 2], 21), [])
  const trimTex = useMemo(() => stoneTexture('#8a7d6b', [1, 2], 9), [])
  // one texture per inductee whose landing portrait is a verified, cleared record (inductees.json `portrait`); a bay
  // without one keeps the silhouette canvas
  const maps = useScopedTexture(PORTRAIT_SRCS)
  const bayMaps = useMemo(() => {
    let k = 0
    return PORTRAIT_BAYS.map((src) => {
      if (!src) return null
      const t = maps[k++]
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })
  }, [maps])

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92, color: '#b8ab99' }), [wallTex])
  const trimMat = useMemo(() => new THREE.MeshStandardMaterial({ map: trimTex, roughness: 0.7 }), [trimTex])
  const ceilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#17130f', roughness: 0.9 }), [])
  const len = HALL_FRONT - HALL_BACK
  const midZ = (HALL_FRONT + HALL_BACK) / 2

  return (
    <group visible={visible}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]}>
        <planeGeometry args={[HALF_W * 2, len]} />
        {mobile ? (
          <meshStandardMaterial map={floorTex} roughnessMap={floorRough} roughness={0.35} metalness={0.15} />
        ) : (
          <MeshReflectorMaterial
            map={floorTex}
            roughnessMap={floorRough}
            roughness={0.45}
            metalness={0.2}
            blur={[400, 120]}
            resolution={512}
            mixBlur={1}
            mixStrength={1.1}
            mixContrast={1}
            mirror={0.4}
            depthScale={0}
          />
        )}
      </mesh>
      {/* centre inlay: a thin brass line down the hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, midZ]}>
        <planeGeometry args={[0.05, len]} />
        <meshStandardMaterial color="#c9954f" metalness={1} roughness={0.25} emissive="#ff9b2d" emissiveIntensity={0.25} />
      </mesh>
      {/* walls */}
      <mesh position={[-HALF_W, HEIGHT / 2, midZ]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[len, HEIGHT]} />
      </mesh>
      <mesh position={[HALF_W, HEIGHT / 2, midZ]} rotation={[0, -Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[len, HEIGHT]} />
      </mesh>
      {/* ceiling + coffers + skylight strip */}
      <mesh position={[0, HEIGHT, midZ]} rotation={[Math.PI / 2, 0, 0]} material={ceilMat}>
        <planeGeometry args={[HALF_W * 2, len]} />
      </mesh>
      <Coffers material={trimMat} />
      {/* cornice + skirting */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (HALF_W - 0.2), HEIGHT - 0.9, midZ]} material={trimMat}>
            <boxGeometry args={[0.5, 0.5, len]} />
          </mesh>
          <mesh position={[s * (HALF_W - 0.1), 0.2, midZ]} material={trimMat}>
            <boxGeometry args={[0.25, 0.4, len]} />
          </mesh>
        </group>
      ))}
      <Pilasters material={trimMat} />
      {BAY_Z.map((z, i) => (
        <Niche key={z} z={z} i={i} trimMat={trimMat} />
      ))}
      {BAY_Z.map((z, i) => (
        <PortraitFrame key={'f' + z} z={z + 1.5} map={bayMaps[i]} />
      ))}
      {/* far end: a tall window of dawn light */}
      <mesh position={[0, 4.6, HALL_BACK + 0.05]}>
        <planeGeometry args={[4.2, 7.4]} />
        <meshBasicMaterial color="#c98f55" />
      </mesh>
      <mesh position={[0, HEIGHT / 2, HALL_BACK]} material={wallMat}>
        <planeGeometry args={[HALF_W * 2, HEIGHT]} />
      </mesh>
      <pointLight position={[0, 5, HALL_BACK + 4]} intensity={18} distance={24} decay={2} color="#ffcf98" />
      <ambientLight intensity={0.25} color="#ffe2c0" />
    </group>
  )
}
