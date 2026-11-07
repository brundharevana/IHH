// Stand-in study used until the study-room agent's study.glb lands. Procedural furniture with
// Poly Haven CC0 textures (see app/CREDITS.md). It is a placeholder, labelled as such in the HUD,
// not a reconstruction of the 1943 photographs.
import { useMemo } from 'react'
import * as THREE from 'three'
import { useScopedTexture } from '../../shared/loadHooks.js'

export const STANDIN = {
  bounds: { min: [-3.6, 0, -2.55], max: [3.6, 3, 2.6] },
  start: { pos: [0.2, 1.6, 2.2], look: [0.6, 1.25, -2.4] },
  guide: [-0.55, 0, -1.55],
  // xz boxes [minX, minZ, maxX, maxZ] used for walking collision
  obstacles: [
    [0.85, -2.75, 2.55, -1.8], // desk
    [1.4, -1.9, 2.0, -1.25], // chair
    [-3.35, -3.0, -1.85, -2.45], // bookcase
    [-0.85, -1.85, -0.25, -1.25], // guide
  ],
  views: {
    desk: { stand: [1.5, -0.55], theta: 0, phi: 1.12 },
    bookcase: { stand: [-2.4, -0.9], theta: 0, phi: 1.42 },
    letter: { stand: [1.3, -0.9], theta: 0, phi: 0.5 },
    papers: { stand: [2.1, -0.9], theta: 0, phi: 0.5 },
  },
}

function useTex(url, repeat = [1, 1], srgb = true) {
  const t = useScopedTexture(url)
  return useMemo(() => {
    const c = t.clone()
    c.wrapS = c.wrapT = THREE.RepeatWrapping
    c.repeat.set(...repeat)
    if (srgb) c.colorSpace = THREE.SRGBColorSpace
    c.anisotropy = 8
    c.needsUpdate = true
    return c
  }, [t, repeat, srgb])
}

const W = 8
const D = 6
const H = 3

export function StandInStudy({ register, onPick }) {
  const planks = useTex('/tour/tex/planks-color.webp', [4, 3])
  const walnut = useTex('/tour/tex/walnut-color.webp', [1, 1])
  const walnutLong = useTex('/tour/tex/walnut-color.webp', [6, 0.5])
  const plasterN = useTex('/tour/tex/plaster-normal.webp', [3, 1.5], false)
  const scan = useScopedTexture('/tour/letter-EIN-M-0015-p1.webp')
  const scanTop = useMemo(() => {
    const t = scan.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.repeat.set(1, 1 / 3)
    t.offset.set(0, 2 / 3)
    t.needsUpdate = true
    return t
  }, [scan])

  const wood = <meshStandardMaterial map={walnut} roughness={0.55} color="#b98f6a" />
  const pick = (id) => (e) => {
    e.stopPropagation()
    if (e.delta > 6) return
    onPick?.(id)
  }

  return (
    <group>
      {/* floor, rug, ceiling */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow name="floor">
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={planks} roughness={0.7} color="#c9a27c" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.2, 0.004, -0.4]} receiveShadow>
        <planeGeometry args={[3.4, 2.3]} />
        <meshStandardMaterial color="#5b2b22" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.2, 0.006, -0.4]} receiveShadow>
        <ringGeometry args={[0, 0.01, 4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#d9cdb6" roughness={1} />
      </mesh>

      {/* walls with wainscot */}
      {[
        [[0, H / 2, -D / 2], 0, W],
        [[0, H / 2, D / 2], Math.PI, W],
        [[-W / 2, H / 2, 0], Math.PI / 2, D],
        [[W / 2, H / 2, 0], -Math.PI / 2, D],
      ].map(([p, r, w], i) => (
        <group key={i} position={p} rotation-y={r}>
          <mesh receiveShadow>
            <planeGeometry args={[w, H]} />
            <meshStandardMaterial color="#cbb795" normalMap={plasterN} normalScale={[0.6, 0.6]} roughness={0.95} />
          </mesh>
          <mesh position={[0, -H / 2 + 0.45, 0.012]} receiveShadow>
            <planeGeometry args={[w, 0.9]} />
            <meshStandardMaterial map={walnutLong} color="#8a6446" roughness={0.6} />
          </mesh>
          <mesh position={[0, -H / 2 + 0.92, 0.03]}>
            <boxGeometry args={[w, 0.05, 0.04]} />
            <meshStandardMaterial color="#4a3020" roughness={0.6} />
          </mesh>
          <mesh position={[0, H / 2 - 0.06, 0.03]}>
            <boxGeometry args={[w, 0.12, 0.06]} />
            <meshStandardMaterial color="#e2d6bf" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* window on the back wall */}
      <group position={[-0.4, 1.75, -D / 2 + 0.02]}>
        <mesh>
          <planeGeometry args={[1.3, 1.6]} />
          <meshBasicMaterial color="#fff3da" toneMapped={false} />
        </mesh>
        {[[-0.68, 0, 0.08, 1.74], [0.68, 0, 0.08, 1.74], [0, 0.84, 1.44, 0.08], [0, -0.84, 1.44, 0.08], [0, 0, 1.3, 0.04], [0, 0, 0.04, 1.6]].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.03]}>
            <boxGeometry args={[w, h, 0.06]} />
            <meshStandardMaterial color="#efe6d4" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, -0.9, 0.1]}>
          <boxGeometry args={[1.6, 0.05, 0.22]} />
          <meshStandardMaterial color="#efe6d4" />
        </mesh>
      </group>

      {/* desk */}
      <group position={[1.7, 0, -2.25]} ref={(o) => register('desk', o)} onClick={pick('desk')}>
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.05, 0.78]} />
          {wood}
        </mesh>
        {[-0.52, 0.52].map((x) => (
          <mesh key={x} position={[x, 0.37, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.46, 0.74, 0.72]} />
            {wood}
          </mesh>
        ))}
        {[-0.52, 0.52].flatMap((x) =>
          [0.18, 0.4, 0.62].map((y) => (
            <mesh key={`${x}${y}`} position={[x, y, 0.365]}>
              <boxGeometry args={[0.08, 0.018, 0.02]} />
              <meshStandardMaterial color="#c8a46a" metalness={0.8} roughness={0.35} />
            </mesh>
          )),
        )}
        {/* lamp */}
        <group position={[0.6, 0.785, -0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.03, 24]} />
            <meshStandardMaterial color="#3b2c1c" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.4, 12]} />
            <meshStandardMaterial color="#3b2c1c" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.09, 0.17, 0.18, 24, 1, true]} />
            <meshStandardMaterial color="#e9d6a8" emissive="#ffcf87" emissiveIntensity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 0.32, 0]} intensity={2.2} distance={4} decay={1.6} color="#ffc27a" />
        </group>
        {/* ink stand and blotter */}
        <mesh position={[-0.05, 0.79, 0.05]} receiveShadow>
          <boxGeometry args={[0.62, 0.01, 0.42]} />
          <meshStandardMaterial color="#2f3a2e" roughness={0.9} />
        </mesh>
        <mesh position={[-0.55, 0.815, -0.22]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.09]} />
          <meshStandardMaterial color="#1d1712" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* the letter, folded, on the blotter */}
      <group position={[1.55, 0.802, -2.1]} rotation-y={0.18} ref={(o) => register('letter', o)} onClick={pick('letter')}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.2163, 0.006, 0.093]} />
          <meshStandardMaterial color="#efe7d4" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.0032, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.2163, 0.093]} />
          <meshStandardMaterial map={scanTop} roughness={0.9} />
        </mesh>
      </group>

      {/* contract and naturalization papers, a loose stack */}
      <group position={[2.12, 0.79, -2.05]} ref={(o) => register('papers', o)} onClick={pick('papers')}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i * 0.004, 0.002 + i * 0.0025, -i * 0.003]} rotation-y={-0.3 + i * 0.09} castShadow receiveShadow>
            <boxGeometry args={[0.2159, 0.0018, 0.279]} />
            <meshStandardMaterial color={i % 2 ? '#e8dcc2' : '#f1e9d6'} roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* chair */}
      <group position={[1.7, 0, -1.55]} rotation-y={Math.PI}>
        <mesh position={[0, 0.46, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 28]} />
          {wood}
        </mesh>
        {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.23, z]} castShadow>
            <cylinderGeometry args={[0.018, 0.016, 0.46, 10]} />
            {wood}
          </mesh>
        ))}
        <mesh position={[0, 0.72, 0.18]} castShadow>
          <torusGeometry args={[0.19, 0.016, 10, 32, Math.PI]} />
          {wood}
        </mesh>
      </group>

      <Bookcase position={[-2.6, 0, -2.72]} wood={wood} register={register} onClick={pick('bookcase')} />
    </group>
  )
}

function Bookcase({ position, wood, register, onClick }) {
  const books = useMemo(() => {
    const out = []
    const tones = ['#5a2a1f', '#2f3b2c', '#6b4a2a', '#26324a', '#7a5b36', '#3c2a1e', '#8a6a3f', '#4a1f1c']
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let s = 0; s < 5; s++) {
      let x = -0.62
      while (x < 0.6) {
        const w = 0.025 + rnd() * 0.035
        const h = 0.24 + rnd() * 0.12
        if (rnd() > 0.93) {
          x += 0.08
          continue
        }
        out.push({ x: x + w / 2, y: 0.08 + s * 0.42 + h / 2, w, h, d: 0.2 + rnd() * 0.06, c: tones[Math.floor(rnd() * tones.length)], lean: rnd() > 0.95 ? 0.15 : 0 })
        x += w + 0.002
      }
    }
    return out
  }, [])
  return (
    <group position={position} ref={(o) => register('bookcase', o)} onClick={onClick}>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 2.2, 0.36]} />
          {wood}
        </mesh>
      ))}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <mesh key={s} position={[0, 0.06 + s * 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.42, 0.03, 0.36]} />
          {wood}
        </mesh>
      ))}
      <mesh position={[0, 1.1, -0.17]}>
        <boxGeometry args={[1.42, 2.2, 0.02]} />
        <meshStandardMaterial color="#3b281a" roughness={0.8} />
      </mesh>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0.02]} rotation-z={b.lean} castShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.c} roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}
