// Variant (a): three-globe Earth (NASA Blue Marble, public domain) with the route inking itself
// along a raised great-circle arc and a neutral marker travelling it.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import ThreeGlobe from 'three-globe'
import * as THREE from 'three'
import { greatCircle } from './geo.js'
import { Marker, Pin, ProgressLine, along, setLineProgress, useLegClock } from './common.jsx'

const S = 0.02 // three-globe radius 100 -> 2 scene units

export function GlobeMap({ data, reduced }) {
  const { from, to } = data
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false })
      .globeImageUrl('/tour/earth-2048.webp')
      .showAtmosphere(true)
      .atmosphereColor('#ffcf9a')
      .atmosphereAltitude(0.14)
      .ringsData([from, to])
      .ringLat('lat')
      .ringLng('lon')
      .ringColor(() => (t) => `rgba(255,155,45,${1 - t})`)
      .ringMaxRadius(2.6)
      .ringPropagationSpeed(1.6)
      .ringRepeatPeriod(1400)
    const m = g.globeMaterial()
    m.color = new THREE.Color('#d9d2c4') // warm the satellite colours slightly toward the palette
    m.shininess = 4
    return g
  }, [from, to])

  const pts = useMemo(
    () =>
      greatCircle(from, to, 160).map(({ lat, lon, t }) => {
        const c = globe.getCoords(lat, lon, 0.22 * Math.sin(Math.PI * t) + 0.004)
        return [c.x * S, c.y * S, c.z * S]
      }),
    [globe, from, to],
  )
  const fromP = useMemo(() => scaled(globe.getCoords(from.lat, from.lon, 0.01)), [globe, from])
  const toP = useMemo(() => scaled(globe.getCoords(to.lat, to.lon, 0.01)), [globe, to])

  const spin = useRef()
  const line = useRef()
  const marker = useRef()
  const clock = useLegClock(1.0, reduced)
  const { camera, size } = useThree()
  const shiftX = size.width / size.height > 1.2 ? 0.9 : 0 // leave the lower-left to the guide
  const v = useMemo(() => new THREE.Vector3(), [])

  // portrait screens: pull back so both place labels stay on screen
  const baseDist = size.width / size.height < 1 ? 7.2 * Math.min(1.7, 0.72 / Math.max(size.width / size.height, 0.4)) : 7.2
  useEffect(() => {
    camera.position.set(0, 0.35, baseDist)
    camera.lookAt(0, 0, 0)
  }, [camera, baseDist])

  // orientation that brings a globe-space point to face the camera (yaw, then pitch)
  const faceAngles = (p) => {
    const yaw = -Math.atan2(p.x, p.z)
    const pitch = Math.atan2(p.y, Math.hypot(p.x, p.z))
    return [pitch * 0.85, yaw]
  }

  useFrame((_, dt) => {
    const { travel, introP } = clock(dt)
    setLineProgress(line.current, travel)
    along(pts, travel, v)
    if (marker.current) {
      marker.current.position.copy(v)
      marker.current.visible = travel > 0.001
    }
    // follow: start looking at Ulm, end looking at Princeton, through the midpoint
    const look = along(pts, Math.max(0.3, Math.min(0.62, travel)), new THREE.Vector3()) // keep both ends in view
    const [px, py] = faceAngles(look)
    if (spin.current) {
      const k = reduced ? 1 : 1 - Math.exp(-2.2 * dt)
      spin.current.rotation.x += (px - spin.current.rotation.x) * k
      spin.current.rotation.y += (py - spin.current.rotation.y) * k
    }
    const dist = baseDist - 1.4 * introP
    camera.position.lerp(new THREE.Vector3(0, 0.35, dist), reduced ? 1 : 0.06)
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[-4, 3, 6]} intensity={2.2} color="#fff1dc" />
      <group position-x={shiftX}>
      <group ref={spin} rotation-order="XYZ">
        <group scale={S}>
          <primitive object={globe} />
        </group>
        <ProgressLine points={pts} lineRef={line} width={3.2} />
        <Pin id="from" position={fromP} cullBackface label={from.label} date={from.date} note={from.note} side="right" />
        <Pin id="to" position={toP} cullBackface label={to.label} date={to.date} note={to.note} side="left" />
        <Marker markerRef={marker} />
      </group>
      </group>
      <Stars />
    </>
  )
}

const scaled = (c) => [c.x * S, c.y * S, c.z * S]

function Stars() {
  const geo = useMemo(() => {
    const n = 900
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 30)
      a.set([v.x, v.y, v.z], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(a, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.12} color="#f0e8dd" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}
