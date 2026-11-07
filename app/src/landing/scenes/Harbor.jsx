import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { scrollState, range, smooth } from '../store.js'
import { makePath } from './path.js'
import { rng } from './materials.js'

// Dawn harbour: a steamship glides in from the right as you scroll, the sun clears the horizon,
// then the camera rises toward the sky and the veil hands over to the hall.

export const harborPose = makePath([
  { pos: [0, 1.4, 34], look: [14, -7, -100], fov: 48 },
  { pos: [-1.5, 1.9, 29], look: [10, -5.5, -90], fov: 46 },
  { pos: [-2.5, 2.6, 24], look: [4, -3.5, -80], fov: 44 },
  { pos: [-1.5, 4.5, 19], look: [1, 6, -70], fov: 46 },
  { pos: [0, 16, 10], look: [0, 60, -40], fov: 54 },
])

const SKY_GLSL = /* glsl */ `
  uniform vec3 uSun;
  vec3 skyColor(vec3 d){
    float h = d.y;
    vec3 zenith = vec3(.03,.055,.10);
    vec3 mid = vec3(.17,.24,.33);
    vec3 horizon = vec3(1.0,.60,.32);
    float s = max(dot(d,uSun),0.);
    vec3 col = mix(horizon, mid, smoothstep(0.,.16,h));
    col = mix(col, zenith, smoothstep(.16,.75,h));
    col = mix(col, horizon*1.1, pow(s,6.)*.55*(1.-smoothstep(0.,.4,h)));
    col += vec3(1.,.72,.42)*pow(s,60.)*.8;
    col += vec3(1.,.9,.7)*smoothstep(.99955,.9998,s)*8.;
    return col;
  }
`

function Sky({ sunDir }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uSun: { value: sunDir } },
        vertexShader: `varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `${SKY_GLSL}
          varying vec3 vPos;
          void main(){
            vec3 d = normalize(vPos);
            vec3 c = d.y < 0. ? mix(vec3(1.,.6,.32)*.45, vec3(.02,.03,.05), smoothstep(0.,-.08,d.y)) : skyColor(d);
            gl_FragColor = vec4(c,1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [sunDir]
  )
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[900, 48, 24]} />
    </mesh>
  )
}

function Water({ sunDir, mobile }) {
  const ref = useRef()
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSun: { value: sunDir }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uTime; varying vec3 vWorld;
          void main(){
            vec4 w = modelMatrix*vec4(position,1.);
            w.y += sin(w.x*.08+uTime*.6)*.12 + sin(w.z*.11-uTime*.8)*.1;
            vWorld = w.xyz;
            gl_Position = projectionMatrix*viewMatrix*w;
          }`,
        fragmentShader: /* glsl */ `${SKY_GLSL}
          uniform float uTime; varying vec3 vWorld;
          vec2 wave(vec2 p, vec2 dir, float f, float a, float s){
            float ph = dot(p,dir)*f + uTime*s;
            return dir * cos(ph) * f * a;
          }
          void main(){
            vec2 p = vWorld.xz;
            vec2 g = wave(p, normalize(vec2(1.,.3)), .35, .18, 1.1)
                   + wave(p, normalize(vec2(-.4,1.)), .6, .08, 1.7)
                   + wave(p, normalize(vec2(.7,-.6)), 1.4, .03, 2.6)
                   + wave(p, normalize(vec2(-.9,-.2)), 2.9, .012, 3.4);
            vec3 n = normalize(vec3(-g.x, 1., -g.y));
            vec3 v = normalize(cameraPosition - vWorld);
            vec3 r = reflect(-v, n); r.y = abs(r.y);
            float fres = .02 + .98*pow(1.-max(dot(n,v),0.),5.);
            vec3 deep = vec3(.015,.035,.05);
            vec3 col = mix(deep, skyColor(r), fres);
            float s = max(dot(r,uSun),0.);
            col += vec3(1.,.78,.5)*(pow(s,700.)*14. + pow(s,60.)*.35);
            float dist = length(vWorld.xz - cameraPosition.xz);
            col = mix(col, vec3(1.,.6,.32)*.55, smoothstep(120.,700.,dist));
            gl_FragColor = vec4(col,1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [sunDir]
  )
  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt
  })
  const seg = mobile ? 64 : 160
  return (
    <mesh ref={ref} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -300]}>
      <planeGeometry args={[1800, 1400, seg, seg]} />
    </mesh>
  )
}

function hullGeometry() {
  // side profile (x = length, y = height), extruded across the beam
  const s = new THREE.Shape()
  s.moveTo(-12, -1.4)
  s.lineTo(9.5, -1.4)
  s.quadraticCurveTo(12.2, -1.0, 12.9, 2.3)
  s.lineTo(-11.6, 2.0)
  s.quadraticCurveTo(-13.0, 1.2, -12.6, -0.2)
  s.quadraticCurveTo(-12.4, -1.1, -12, -1.4)
  const g = new THREE.ExtrudeGeometry(s, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.3, bevelSegments: 3, steps: 1, curveSegments: 16 })
  g.translate(0, 0, -1.6)
  g.computeVertexNormals()
  return g
}

function Ship() {
  const ref = useRef()
  const hull = useMemo(hullGeometry, [])
  const windows = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.22, 0.22)
    const mat = new THREE.MeshBasicMaterial({ color: '#ffc27a', toneMapped: false })
    const pts = []
    const r = rng(4)
    for (let x = -9.5; x < 9; x += 0.75) if (r() > 0.25) pts.push([x, 1.15, 2.0])
    for (let x = -6; x < 4.5; x += 0.6) if (r() > 0.35) pts.push([x, 2.95, 1.55])
    for (let x = -4; x < 2.5; x += 0.6) if (r() > 0.45) pts.push([x, 4.2, 1.25])
    const m = new THREE.InstancedMesh(geo, mat, pts.length)
    const o = new THREE.Object3D()
    pts.forEach((p, i) => {
      o.position.set(...p)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    return m
  }, [])
  const rigging = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(
      [[-12, 2.2, 0], [-8, 10.5, 0], [-8, 10.5, 0], [6.5, 11.5, 0], [6.5, 11.5, 0], [12.8, 2.6, 0]].map((p) => new THREE.Vector3(...p))
    )
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#1a1714', transparent: true, opacity: 0.7 }))
  }, [])

  useFrame(({ clock }) => {
    const e = scrollState.entrance
    const t = smooth(range(e, 0, 0.62))
    const g = ref.current
    // glide in from the right, easing to a stop off the bow
    g.position.x = 62 - t * 64
    g.position.z = -72 + t * 6
    g.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.12
    g.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.008
    g.rotation.x = Math.sin(clock.elapsedTime * 0.62) * 0.01
  })

  const cream = '#e6dccb'
  return (
    <group ref={ref} rotation={[0, Math.PI, 0]}>
      <mesh geometry={hull}>
        <meshStandardMaterial color="#121418" roughness={0.55} metalness={0.3} />
      </mesh>
      {/* boot topping at the waterline */}
      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[22.6, 0.4, 3.95]} />
        <meshStandardMaterial color="#5e1c15" roughness={0.7} />
      </mesh>
      {/* deck houses */}
      <mesh position={[-1, 2.9, 0]}>
        <boxGeometry args={[11.5, 1.5, 3.1]} />
        <meshStandardMaterial color={cream} roughness={0.6} />
      </mesh>
      <mesh position={[-1, 4.15, 0]}>
        <boxGeometry args={[7.2, 1.0, 2.5]} />
        <meshStandardMaterial color={cream} roughness={0.6} />
      </mesh>
      <mesh position={[3.4, 5.05, 0]}>
        <boxGeometry args={[1.6, 0.8, 2.2]} />
        <meshStandardMaterial color={cream} roughness={0.6} />
      </mesh>
      {/* funnels */}
      {[-3.6, -0.6].map((x) => (
        <group key={x} position={[x, 6.1, 0]} rotation={[0, 0, 0.08]}>
          <mesh>
            <cylinderGeometry args={[0.58, 0.62, 2.8, 24]} />
            <meshStandardMaterial color="#c49a5e" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.55, 24]} />
            <meshStandardMaterial color="#141210" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* masts */}
      {[[-8, 6.2], [6.5, 6.9]].map(([x, h]) => (
        <mesh key={x} position={[x, 2 + h / 2 + 1, 0]}>
          <cylinderGeometry args={[0.07, 0.11, h + 2, 8]} />
          <meshStandardMaterial color="#2a241e" roughness={0.6} />
        </mesh>
      ))}
      <primitive object={rigging} />
      <primitive object={windows} />
      <primitive object={windows.clone()} rotation={[0, Math.PI, 0]} />
      {/* masthead light */}
      <mesh position={[6.5, 11.6, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshBasicMaterial color="#fff2d8" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Shore({ mobile }) {
  const city = useMemo(() => {
    const r = rng(9)
    const n = mobile ? 70 : 140
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.translate(0, 0.5, 0)
    const mat = new THREE.MeshBasicMaterial({ color: '#4a3a34', fog: false })
    const m = new THREE.InstancedMesh(geo, mat, n)
    const o = new THREE.Object3D()
    for (let i = 0; i < n; i++) {
      const x = -260 + r() * 520
      const tall = Math.abs(x) < 70 ? 1 : 0.45
      o.position.set(x, 0, -420 - r() * 60)
      o.scale.set(5 + r() * 12, (4 + r() * 26 * tall) * (r() > 0.92 ? 2.2 : 1), 6)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    return m
  }, [mobile])
  const lights = useMemo(() => {
    const r = rng(12)
    const pts = []
    for (let i = 0; i < (mobile ? 120 : 260); i++) pts.push(-250 + r() * 500, 1 + r() * 18, -415 - r() * 40)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffc27a', size: 1.6, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.8 }))
  }, [mobile])
  return (
    <group>
      <primitive object={city} />
      <primitive object={lights} />
      {/* headland and lighthouse, left */}
      <mesh position={[-150, -14, -300]} scale={[90, 24, 40]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#2a2124" fog={false} />
      </mesh>
      <mesh position={[-140, 14, -300]}>
        <cylinderGeometry args={[1.4, 2, 14, 12]} />
        <meshBasicMaterial color="#d9cbb5" fog={false} />
      </mesh>
      <mesh position={[-140, 22, -300]}>
        <sphereGeometry args={[1.6, 12, 8]} />
        <meshBasicMaterial color="#fff0cf" toneMapped={false} fog={false} />
      </mesh>
    </group>
  )
}

function Pier() {
  const posts = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.22, 0.26, 5, 10)
    const mat = new THREE.MeshStandardMaterial({ color: '#2b2219', roughness: 0.9 })
    const pts = []
    for (let z = -6; z < 34; z += 2.6) pts.push([15.5, z], [18.5, z])
    const m = new THREE.InstancedMesh(geo, mat, pts.length)
    const o = new THREE.Object3D()
    pts.forEach(([x, z], i) => {
      o.position.set(x, 0.6, z)
      o.rotation.z = (i % 3) * 0.02 - 0.02
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    return m
  }, [])
  return (
    <group>
      <primitive object={posts} />
      <mesh position={[17, 3.05, 14]}>
        <boxGeometry args={[4.2, 0.25, 41]} />
        <meshStandardMaterial color="#3a2d21" roughness={0.85} />
      </mesh>
      {/* bollards + a lamp on the pier end */}
      <mesh position={[15.8, 3.5, -4]}>
        <cylinderGeometry args={[0.2, 0.25, 0.7, 12]} />
        <meshStandardMaterial color="#1b1a19" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[18.4, 5.2, -5]}>
        <cylinderGeometry args={[0.05, 0.06, 4, 8]} />
        <meshStandardMaterial color="#1b1a19" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[18.4, 7.3, -5]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial color="#ffd9a3" toneMapped={false} />
      </mesh>
      <pointLight position={[18.4, 7.2, -5]} intensity={8} distance={14} color="#ffc27a" />
    </group>
  )
}

export default function Harbor({ mobile = false, visible = true }) {
  const sunDir = useMemo(() => new THREE.Vector3(0.18, 0.02, -1).normalize(), [])
  const light = useRef()
  useFrame(() => {
    // the sun clears the horizon over the course of the entrance
    const e = scrollState.entrance
    sunDir.set(0.18 - e * 0.05, 0.004 + e * 0.07, -1).normalize()
    if (light.current) light.current.position.copy(sunDir).multiplyScalar(200)
  })
  return (
    <group visible={visible}>
      <Sky sunDir={sunDir} />
      <Water sunDir={sunDir} mobile={mobile} />
      <Shore mobile={mobile} />
      <Ship />
      <Pier />
      <directionalLight ref={light} color="#ffb877" intensity={2.4} />
      <hemisphereLight args={['#5d6578', '#2a1a10', 0.7]} />
    </group>
  )
}
