import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { scrollState, range, smooth } from '../store.js'
import { makePath } from './path.js'
import { stoneTexture, bronzeTexture, rng } from './materials.js'
import { ARRIVAL } from './Hall.jsx'

// Monumental bronze doors at the head of the hall. Scroll opens them; warm light spills across the
// forecourt and the camera walks through into the hall of portraits.

const DOOR_Z = 8
const OPEN_W = 6
const OPEN_H = 8.4

export const doorsPose = makePath([
  { pos: [0, 2.4, 48], look: [0, 6.5, DOOR_Z], fov: 50 },
  { pos: [0, 2.0, 36], look: [0, 5.2, DOOR_Z], fov: 48 },
  { pos: [0, 1.85, 24], look: [0, 3.6, 0], fov: 47 },
  { pos: [0, 1.78, 13.5], look: [0, 2.6, -20], fov: 49 },
  { pos: ARRIVAL.pos.toArray(), look: ARRIVAL.look.toArray(), fov: ARRIVAL.fov },
])

const shaftShader = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uOpen: { value: 0 }, uColor: { value: new THREE.Color('#ffb877') } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv; uniform float uOpen; uniform vec3 uColor;
    void main(){
      // vUv.y = 0 at the threshold, 1 far out; vUv.x across
      float v = 1. - vUv.y; // plane is laid flat, so local +y points back at the door
      float spread = mix(.17*uOpen, .5, v)*.9 + .02;
      float across = smoothstep(spread, spread*.3, abs(vUv.x-.5));
      float along = pow(1.-v, 1.6);
      gl_FragColor = vec4(uColor * across * along * uOpen * .9, 1.);
    }`,
}

function Leaf({ side, bronze, open }) {
  const ref = useRef()
  const w = OPEN_W / 2
  useFrame(() => {
    ref.current.rotation.y = side * open.current * 1.42
  })
  const panels = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 2; c++)
      panels.push([(c - 0.5) * 1.25, 1.2 + r * 1.95])
  return (
    <group ref={ref} position={[-side * w, 0, DOOR_Z]}>
      <group position={[side * (w / 2), 0, 0]}>
        <mesh position={[0, OPEN_H / 2, 0]} material={bronze}>
          <boxGeometry args={[w - 0.04, OPEN_H, 0.32]} />
        </mesh>
        {panels.map(([x, y], i) => (
          <group key={i}>
            <mesh position={[x, y, 0.2]} material={bronze}>
              <boxGeometry args={[1.0, 1.6, 0.1]} />
            </mesh>
            <mesh position={[x, y, -0.2]} material={bronze}>
              <boxGeometry args={[1.0, 1.6, 0.1]} />
            </mesh>
          </group>
        ))}
        {/* ring pull near the meeting stile */}
        <mesh position={[-side * (w / 2 - 0.35), 3.9, 0.32]} material={bronze}>
          <torusGeometry args={[0.28, 0.045, 12, 32]} />
        </mesh>
      </group>
    </group>
  )
}

function Lantern({ x }) {
  return (
    <group position={[x, 4.2, DOOR_Z + 0.7]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.22, 0.9, 6]} />
        <meshStandardMaterial color="#ffd9a3" emissive="#ffb366" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.38, 0.4, 6]} />
        <meshStandardMaterial color="#1b1a19" metalness={0.7} roughness={0.4} />
      </mesh>
      <pointLight intensity={6} distance={5.5} color="#ffc27a" />
    </group>
  )
}

// warm key light raking down the door face; its target must live in the scene graph
function KeyLight({ open }) {
  const light = useMemo(() => {
    const l = new THREE.SpotLight('#ffc68a', 260, 40, 0.42, 0.8, 2)
    l.position.set(0, 15, DOOR_Z + 9)
    l.target.position.set(0, 4.5, DOOR_Z)
    return l
  }, [])
  // once the leaves part, the beam would fall through the doorway onto the hall floor: fade it out
  useFrame(() => {
    light.intensity = 220 * (1 - Math.min(1, open.current * 2.5))
  })
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  )
}

function Stars() {
  const pts = useMemo(() => {
    const r = rng(31)
    const a = []
    for (let i = 0; i < 700; i++) {
      const th = r() * Math.PI * 2, y = 0.15 + r() * 0.85
      const rad = Math.sqrt(1 - y * y)
      a.push(Math.cos(th) * rad * 400, y * 400, Math.sin(th) * rad * 400)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3))
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#f0e8dd', size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.55 }))
  }, [])
  return <primitive object={pts} />
}

export default function Doors({ visible = true }) {
  const stone = useMemo(() => stoneTexture('#7d7366', [5, 3], 17), [])
  const ground = useMemo(() => stoneTexture('#3c3731', [10, 10], 23), [])
  const bronzeMap = useMemo(() => bronzeTexture(), [])
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ map: stone, roughness: 0.85 }), [stone])
  const bronze = useMemo(() => new THREE.MeshStandardMaterial({ map: bronzeMap, color: '#d1a56c', metalness: 0.9, roughness: 0.38 }), [bronzeMap])
  const shaft = useMemo(() => new THREE.ShaderMaterial(shaftShader), [])
  const open = useRef(0)
  const seam = useRef()

  useFrame(() => {
    open.current = smooth(range(scrollState.entrance, 0.18, 0.62))
    if (seam.current) seam.current.visible = open.current < 0.04
    // the pool of light reads from the forecourt; it fades as we cross the threshold
    shaft.uniforms.uOpen.value = open.current * (1 - range(scrollState.entrance, 0.5, 0.72))
  })

  const wallW = 60, wallH = 38
  const sideW = (wallW - OPEN_W) / 2
  return (
    <group visible={visible}>
      <Stars />
      {/* forecourt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, DOOR_Z + 40]}>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial map={ground} roughness={0.75} color="#9a8f80" />
      </mesh>
      {/* facade: two side blocks and a lintel block leave the doorway open */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (OPEN_W / 2 + sideW / 2), wallH / 2, DOOR_Z - 0.6]} material={stoneMat}>
          <boxGeometry args={[sideW, wallH, 1.2]} />
        </mesh>
      ))}
      <mesh position={[0, OPEN_H + (wallH - OPEN_H) / 2, DOOR_Z - 0.6]} material={stoneMat}>
        <boxGeometry args={[OPEN_W, wallH - OPEN_H, 1.2]} />
      </mesh>
      {/* door surround */}
      {[-1, 1].map((s) => (
        <mesh key={'j' + s} position={[s * (OPEN_W / 2 + 0.35), OPEN_H / 2, DOOR_Z + 0.2]} material={stoneMat}>
          <boxGeometry args={[0.7, OPEN_H + 0.2, 0.6]} />
        </mesh>
      ))}
      <mesh position={[0, OPEN_H + 0.55, DOOR_Z + 0.25]} material={stoneMat}>
        <boxGeometry args={[OPEN_W + 2.4, 1.1, 0.8]} />
      </mesh>
      {/* blank frieze band (the words live in the page, not the stone) */}
      <mesh position={[0, OPEN_H + 3.2, DOOR_Z + 0.2]} material={stoneMat}>
        <boxGeometry args={[OPEN_W + 14, 2.2, 0.6]} />
      </mesh>
      {/* columns */}
      {[-9.5, -6.2, 6.2, 9.5].map((x) => (
        <group key={x} position={[x, 0, DOOR_Z + 1.6]}>
          <mesh position={[0, 6.6, 0]} material={stoneMat}>
            <cylinderGeometry args={[0.72, 0.82, 12.4, 32]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={stoneMat}>
            <boxGeometry args={[2, 0.6, 2]} />
          </mesh>
          <mesh position={[0, 13.0, 0]} material={stoneMat}>
            <boxGeometry args={[2, 0.5, 2]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 13.6, DOOR_Z + 1.4]} material={stoneMat}>
        <boxGeometry args={[23, 0.9, 3]} />
      </mesh>
      {/* steps */}
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, -0.05 + 0.12 * (2 - k), DOOR_Z + 2.2 + k * 0.9]} material={stoneMat}>
          <boxGeometry args={[24 - k * 1.2, 0.24, 0.9]} />
        </mesh>
      ))}
      {/* light leaking through the seam between the closed leaves */}
      <mesh ref={seam} position={[0, OPEN_H / 2, DOOR_Z]}>
        <planeGeometry args={[0.05, OPEN_H - 0.2]} />
        <meshBasicMaterial color="#ffd3a0" toneMapped={false} />
      </mesh>
      <KeyLight open={open} />
      <Leaf side={1} bronze={bronze} open={open} />
      <Leaf side={-1} bronze={bronze} open={open} />
      {/* light spilling out across the steps */}
      <mesh material={shaft} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.36, DOOR_Z + 13]}>
        <planeGeometry args={[18, 26]} />
      </mesh>
      <Lantern x={-4.6} />
      <Lantern x={4.6} />
      <hemisphereLight args={['#2a3550', '#120d09', 0.45]} />
      <directionalLight position={[-20, 30, 40]} intensity={0.35} color="#9fb2d6" />
    </group>
  )
}
