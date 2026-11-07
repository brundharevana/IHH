// Variant (c): the satellite globe zooms in and unrolls into the detailed paper map, then the
// route inks itself place to place. One mesh: every vertex carries its sphere position and its flat
// position; a uniform morphs between them while the texture cross-fades from satellite to paper.
// A leg may pass several places (data: leg.places, leg.segments); the marker spends the same time
// on each segment and carries the segment's verified mode of travel, or stays neutral.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScopedTexture } from '../../shared/loadHooks.js'
import * as THREE from 'three'
import { greatCircle, easeInOut, clamp01 } from './geo.js'
import { Marker, Pin, ResourcePin, UnroutedNote, along, setLineProgress, useLegClock, TRAVEL_SECONDS } from './common.jsx'
import { R, flatXY, usePaperTexture } from './FlatMap.jsx'
import { Line } from '@react-three/drei'
import { useAvoidLine } from '../labelLines.js'
import { setState, getState, useTour } from '../store.js'

const D2R = Math.PI / 180
const INTRO = 3.2
const SPACE = '#0a0e14'
const SPACE_C = new THREE.Color(SPACE)
const MARGIN_C = new THREE.Color('#c4ad84') // the paper's vignetted edge (paperMap.js)
const SAMPLES = 90 // per segment, so the inked fraction maps to segments evenly

function spherePos(lat, lonRel, lift = 0) {
  const la = lat * D2R
  const lo = lonRel * D2R
  const r = R + lift
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo) - R]
}

function buildGeometry(lon0) {
  const g = new THREE.PlaneGeometry(2 * Math.PI * R, Math.PI * R, 256, 128)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  const sph = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    const lonRel = (u - 0.5) * 360
    const lat = (v - 0.5) * 180
    sph.set(spherePos(lat, lonRel), i * 3)
  }
  g.setAttribute('aSphere', new THREE.BufferAttribute(sph, 3))
  g.userData.lon0 = lon0
  return g
}

const vert = /* glsl */ `
  attribute vec3 aSphere;
  uniform float uMorph;
  uniform float uR;
  varying vec2 vUv;
  varying vec3 vN;
  void main() {
    vUv = uv;
    vec3 p = mix(aSphere, position, uMorph);
    vN = normalize(mix(normalize(aSphere + vec3(0.0, 0.0, uR)), vec3(0.0, 0.0, 1.0), uMorph));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const frag = /* glsl */ `
  uniform sampler2D uEarth;
  uniform sampler2D uPaper;
  uniform float uMix;
  uniform float uOffset;
  uniform float uHasPaper;
  varying vec2 vUv;
  varying vec3 vN;
  void main() {
    vec2 uv = vec2(vUv.x + uOffset, vUv.y);
    vec3 e = texture2D(uEarth, uv).rgb;
    vec3 p = mix(e, texture2D(uPaper, uv).rgb, uHasPaper);
    vec3 col = mix(e, p, uMix);
    float light = 0.62 + 0.55 * max(dot(normalize(vN), normalize(vec3(-0.35, 0.45, 0.85))), 0.0);
    gl_FragColor = vec4(col * light, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// longitudes unwrapped against the first place, so a route never jumps across the date line
function unwrap(places) {
  const base = places[0].lon
  return places.map((p) => base + ((((p.lon - base) % 360) + 540) % 360) - 180)
}

// Camera over the flat map framing every place of the leg (plus room for the labels and the guide
// in the lower-left corner). Einstein's two-place leg keeps its earlier framing (3.5 units wide).
function fitFlatCamera(size, box, fov) {
  const aspect = size.width / size.height
  const phone = aspect < 1
  const w = box.max.x - box.min.x
  const h = box.max.y - box.min.y
  // (a short leg on a phone may come nearer than on a desktop, so its line reads between its labels: round 9 final review)
  const need = Math.max(phone ? 0.35 : 0.45, w * (phone ? 1.18 : 1.6), h * (phone ? 2.2 : 2.0) * aspect)
  const dist = Math.max(0.35, need / 2 / (Math.tan((40 * D2R) / 2) * aspect))
  // keep the top edge of the view on the map (no sky above the north pole)
  // (a phone keeps the route centred: its tall view runs past the paper, onto the paper-toned backdrop)
  const top = phone ? Infinity : (Math.PI / 2) * R - dist * Math.tan((29 * D2R)) * 1.05
  const cy = Math.min((box.min.y + box.max.y) / 2 + 0.05 * (need / 3.5), top)
  const cx = (box.min.x + box.max.x) / 2
  const pos = new THREE.Vector3(cx, cy - dist * 0.17, dist)
  const look = new THREE.Vector3(cx, cy - 0.15 * (need / 3.5), 0)
  if (!phone) keepOnMap(pos, look, fov)
  return { need, pos, look }
}

// Where the view's top and bottom edges meet the map plane (z = 0); the camera has no roll.
function edges(pos, look, fov) {
  const pitch = Math.atan2(look.y - pos.y, pos.z - look.z)
  const half = (fov * D2R) / 2
  return [pos.y + Math.tan(pitch - half) * pos.z, pos.y + Math.tan(pitch + half) * pos.z]
}

// Desktop: keep the whole view on the paper: no sky past the north edge, no void past the south
// edge (a wide, shallow leg such as Vienna to Los Angeles showed the black beyond 90 S). A phone's
// tall view of a wide leg is taller than the whole map; moving closer would crop the route, so
// there the backdrop takes the paper's tone instead (see the backdrop below).
function keepOnMap(pos, look, fov) {
  const north = (Math.PI / 2) * R
  const south = -north
  let [bottom, top] = edges(pos, look, fov)
  if (top - bottom > north - south) {
    // too tall for the map: move closer until it fits (the edges scale with the distance)
    const k = ((north - south) * 0.98) / (top - bottom)
    const mid = (top + bottom) / 2
    pos.z *= k
    pos.y = mid + (pos.y - mid) * k
    look.y = mid + (look.y - mid) * k
    ;[bottom, top] = edges(pos, look, fov)
  }
  const shift = bottom < south ? south - bottom : top > north ? north - top : 0
  pos.y += shift
  look.y += shift
}

export function UnrollMap({ data, reduced }) {
  const places = data.places
  const segments = data.segments
  const nSeg = places.length - 1
  const lons = useMemo(() => unwrap(places), [places])
  const lon0 = (Math.min(...lons) + Math.max(...lons)) / 2
  const earth = useScopedTexture('/tour/earth-2048.webp')
  const paper = usePaperTexture()
  const { camera, size } = useThree()
  const geo = useMemo(() => buildGeometry(lon0), [lon0])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.DoubleSide,
        uniforms: {
          uMorph: { value: 0 },
          uR: { value: R },
          uEarth: { value: null },
          uPaper: { value: null },
          uMix: { value: 0 },
          uOffset: { value: lon0 / 360 },
          uHasPaper: { value: 0 },
        },
      }),
    [lon0],
  )
  useEffect(() => {
    earth.colorSpace = THREE.SRGBColorSpace
    earth.wrapS = THREE.RepeatWrapping
    earth.needsUpdate = true
    mat.uniforms.uEarth.value = earth
  }, [earth, mat])
  useEffect(() => {
    if (paper) {
      paper.offset.x = 0
      mat.uniforms.uPaper.value = paper
      mat.uniforms.uHasPaper.value = 1
    }
  }, [paper, mat])

  // the route: SAMPLES + 1 points per segment (the joints repeat), each with sphere and flat forms
  const route = useMemo(() => {
    const out = []
    for (let i = 0; i < nSeg; i++) {
      const a = { lat: places[i].lat, lon: lons[i] }
      const b = { lat: places[i + 1].lat, lon: lons[i + 1] }
      const gc = greatCircle(a, b, SAMPLES)
      const ang = Math.acos(Math.min(1, Math.max(-1, Math.sin(a.lat * D2R) * Math.sin(b.lat * D2R) + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.cos((b.lon - a.lon) * D2R))))
      const lift = 0.28 * Math.min(1, ang / 0.9)
      for (const { lat, lon, t } of gc) {
        out.push({ s: spherePos(lat, lon - lon0, 0.012 + lift * Math.sin(Math.PI * t)), f: [...flatXY(lat, lon, lon0), 0.006] })
      }
    }
    return out
  }, [places, lons, lon0, nSeg])
  const pins = useMemo(
    () => places.map((p, i) => ({ s: spherePos(p.lat, lons[i] - lon0, 0.01), f: [...flatXY(p.lat, lons[i], lon0), 0.006] })),
    [places, lons, lon0],
  )
  // round 9: the place photographs (data: leg.resources) and the middle of each un-routed line (its note), each with
  // its sphere and flat positions, morphing with the map like the pins
  const resources = useMemo(() => data.resources || [], [data.resources])
  const resPins = useMemo(
    () => resources.map((r) => {
      const lon = places[0].lon + ((((r.lon - places[0].lon) % 360) + 540) % 360) - 180
      return { s: spherePos(r.lat, lon - lon0, 0.012), f: [...flatXY(r.lat, lon, lon0), 0.008] }
    }),
    [resources, places, lon0],
  )
  const notes = useMemo(
    () => segments.map((s, i) => (s.routed === false ? { i, ...route[i * (SAMPLES + 1) + Math.floor(SAMPLES / 2)] } : null)).filter(Boolean),
    [segments, route],
  )
  const resRefs = useRef([])
  const noteRefs = useRef([])
  const [unrolled, setUnrolled] = useState(false)
  const initialPts = useMemo(() => route.map((r) => r.s), [route])
  const flatPts = useMemo(() => route.map((r) => r.f), [route])
  const box = useMemo(() => new THREE.Box3().setFromPoints(pins.map((p) => new THREE.Vector3(...p.f))), [pins])
  const meanX = useMemo(() => pins.reduce((a, p) => a + p.f[0], 0) / pins.length, [pins])

  const line = useRef()
  const backdrop = useRef()
  const marker = useRef()
  const pinRefs = useRef([])
  const travelSeconds = Math.max(TRAVEL_SECONDS, 1.7 * nSeg)
  const clock = useLegClock(INTRO, reduced, travelSeconds)
  const flatCam = useMemo(() => fitFlatCamera(size, box, camera.fov), [size, box, camera.fov])
  const zoom = THREE.MathUtils.clamp(flatCam.need / 3.5, 0.3, 1.4)
  const globeCam = useMemo(() => {
    const midLat = (box.min.y + box.max.y) / 2 / (D2R * R)
    const mid = spherePos(midLat, 0, 0)
    const dir = new THREE.Vector3(mid[0], mid[1], mid[2] + R).normalize()
    const dist = size.width / size.height < 1 ? 7.5 : 5.2
    return { pos: dir.clone().multiplyScalar(dist).add(new THREE.Vector3(0, 0, -R)), look: new THREE.Vector3(0, 0, -R) }
  }, [box, size])

  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), v: new THREE.Vector3(), arr: [] }), [])
  // the place labels keep clear of the route as it lies now (labels.jsx), every third point of it
  const routeNow = useMemo(() => {
    const out = []
    return () => {
      out.length = 0
      const a = tmp.arr.length ? tmp.arr : initialPts.flat()
      for (let i = 0; i < a.length; i += 9) out.push(a[i], a[i + 1], a[i + 2])
      const n = a.length - 3
      if (n >= 0 && n % 9) out.push(a[n], a[n + 1], a[n + 2])
      return out
    }
  }, [tmp, initialPts])
  useAvoidLine(routeNow)
  // dev only (e2e/chapters.mjs): the route on screen, in CSS pixels, once the map has unrolled
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__mapRoute = () => {
      const a = routeNow()
      const pts = []
      for (let i = 0; i + 2 < a.length; i += 3) {
        const p = tmp.v.set(a[i], a[i + 1], a[i + 2]).project(camera)
        pts.push([((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height])
      }
      return { unrolled: lastMorph.current > 0.999, arrived: getState().seg === nSeg, pts }
    }
    return () => {
      window.__mapRoute = null
    }
  }, [routeNow, tmp, camera, size, nSeg])
  const lastMorph = useRef(-1)
  const seg = useTour((s) => s.seg)

  useFrame((_, dt) => {
    const { e, travel: tr } = clock(dt)
    const m = easeInOut(clamp01((e - 0.9) / 1.9))
    mat.uniforms.uMorph.value = m
    mat.uniforms.uMix.value = clamp01((m - 0.15) / 0.7)
    // space behind the globe; the paper's margin tone once it has unrolled
    backdrop.current?.color.copy(SPACE_C).lerp(MARGIN_C, mat.uniforms.uMix.value)

    if (Math.abs(m - lastMorph.current) > 1e-4 && line.current) {
      lastMorph.current = m
      tmp.arr.length = 0
      for (const r of route) tmp.arr.push(r.s[0] + (r.f[0] - r.s[0]) * m, r.s[1] + (r.f[1] - r.s[1]) * m, r.s[2] + (r.f[2] - r.s[2]) * m)
      line.current.geometry.setPositions(tmp.arr)
      pins.forEach((pin, i) => pinRefs.current[i]?.position.set(...pin.s.map((s, k) => s + (pin.f[k] - s) * m)))
      resPins.forEach((pin, i) => resRefs.current[i]?.position.set(...pin.s.map((s, k) => s + (pin.f[k] - s) * m)))
      notes.forEach((n, i) => noteRefs.current[i]?.position.set(...n.s.map((s, k) => s + (n.f[k] - s) * m)))
    }
    if (!unrolled && m > 0.96) setUnrolled(true)
    // the same time on every segment: the inked fraction is (segment + progress within it) / nSeg
    setLineProgress(line.current, tr)
    const g = Math.min(nSeg - 1e-6, tr * nSeg)
    const i = Math.floor(g)
    const segPts = flatPts.slice(i * (SAMPLES + 1), (i + 1) * (SAMPLES + 1))
    along(segPts, g - i, tmp.v)
    if (marker.current) {
      marker.current.position.copy(tmp.v)
      // on arrival the marker (and its travel pill) leaves the destination's label clear
      marker.current.visible = tr > 0.001 && (nSeg === 1 || tr < 0.999)
    }
    // seg: -1 before the marker sets off, the segment it is on, then nSeg once it has arrived
    const at = tr <= 0.001 ? -1 : tr >= 0.999 ? nSeg : i
    if (getState().seg !== at) setState({ seg: at })
    // camera: hold on the globe, dolly in, then settle over the flat map
    const zoomIn = clamp01(e / 1.1)
    const gPos = globeCam.pos.clone().lerp(globeCam.look, 0.18 * easeInOut(zoomIn))
    tmp.pos.copy(gPos).lerp(flatCam.pos, m)
    tmp.look.copy(globeCam.look).lerp(flatCam.look, m)
    camera.position.copy(tmp.pos)
    camera.lookAt(tmp.look)
  })

  const last = places.length - 1
  return (
    <>
      <mesh geometry={geo} material={mat} />
      <Line ref={line} points={initialPts} color="#5b2f12" lineWidth={3.6} transparent depthWrite={false} />
      {places.map((p, i) => {
        // a minor waypoint's label shows while the marker travels on from it
        const shown = !p.minor || seg === i
        const side = p.side || (i === 0 ? (pins[i].f[0] >= meanX ? 'right' : 'left') : pins[i].f[0] >= meanX && i !== last ? 'right' : 'left')
        return (
          <group key={p.id} ref={(el) => (pinRefs.current[i] = el)} position={pins[i].s}>
            <Pin id={p.id} position={[0, 0, 0]} label={p.label} date={p.date} note={p.note} side={side} minor={p.minor} shown={shown} size={0.022 * zoom} active={seg === i} />
          </group>
        )
      })}
      {resources.map((r, i) => (
        <group key={r.id} ref={(el) => (resRefs.current[i] = el)} position={resPins[i].s}>
          <ResourcePin resource={r} shown={unrolled} size={0.016 * zoom} />
        </group>
      ))}
      {notes.map((n, k) => (
        <group key={`note-${n.i}`} ref={(el) => (noteRefs.current[k] = el)} position={n.s}>
          <UnroutedNote id={`${data.id || 'leg'}-${n.i}`} shown={unrolled} />
        </group>
      ))}
      <Marker markerRef={marker} paper scale={zoom} segment={segments[THREE.MathUtils.clamp(seg, 0, segments.length - 1)]} />
      <mesh position={[0, 0, -R * 2.6]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial ref={backdrop} color={SPACE} />
      </mesh>
    </>
  )
}
