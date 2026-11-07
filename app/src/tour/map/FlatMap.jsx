// Variant (b): a vintage paper map lying on the table; the route inks itself in sepia and the
// neutral marker follows the nib.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { greatCircle } from './geo.js'
import { drawPaperMap, LAND_URL } from './paperMap.js'
import { useScopedJSON } from '../../shared/loadHooks.js'
import { Marker, Pin, ProgressLine, along, setLineProgress, useLegClock } from './common.jsx'

export const R = 1.5
const D2R = Math.PI / 180

export const midLon = (a, b) => (a.lon + b.lon) / 2
export const flatXY = (lat, lon, lon0) => [((((lon - lon0 + 540) % 360) - 180) * D2R) * R, lat * D2R * R]

// the paper map: suspends until the land outlines arrive (a failure or a stall becomes the stage's
// recoverable error, stageLoading.jsx)
export function usePaperTexture() {
  const land = useScopedJSON(LAND_URL)
  return useMemo(() => drawPaperMap(land), [land])
}

export function flatCameraFor(size, centerY) {
  const aspect = size.width / size.height
  const need = aspect < 1 ? 2.6 : 3.5
  const dist = Math.max(3.2, need / 2 / (Math.tan((40 * D2R) / 2) * aspect))
  return { pos: new THREE.Vector3(0, centerY - dist * 0.17, dist), look: new THREE.Vector3(0, centerY - 0.15, 0) }
}

export function FlatMap({ data, reduced }) {
  const { from, to } = data
  const lon0 = midLon(from, to)
  const tex = usePaperTexture()
  const { camera, size } = useThree()
  const line = useRef()
  const marker = useRef()
  const clock = useLegClock(0.7, reduced)

  const pts = useMemo(
    () => greatCircle(from, to, 160).map(({ lat, lon }) => [...flatXY(lat, lon, lon0), 0.004]),
    [from, to, lon0],
  )
  const fromP = [...flatXY(from.lat, from.lon, lon0), 0.004]
  const toP = [...flatXY(to.lat, to.lon, lon0), 0.004]
  const centerY = (fromP[1] + toP[1]) / 2 + 0.05

  useEffect(() => {
    if (tex) tex.offset.x = lon0 / 360
  }, [tex, lon0])

  const cam = useMemo(() => flatCameraFor(size, centerY), [size, centerY])
  useEffect(() => {
    camera.position.copy(cam.pos).add(new THREE.Vector3(0, -0.3, 0.6))
    camera.lookAt(cam.look)
  }, [camera, cam])

  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const { travel } = clock(dt)
    setLineProgress(line.current, travel)
    along(pts, travel, v)
    if (marker.current) {
      marker.current.position.copy(v)
      marker.current.visible = travel > 0.001
    }
    camera.position.lerp(cam.pos, reduced ? 1 : 1 - Math.exp(-1.5 * dt))
    camera.lookAt(cam.look)
  })

  return (
    <>
      <ambientLight intensity={1.1} color="#fff4e2" />
      <directionalLight position={[-3, 4, 5]} intensity={1.6} color="#ffe6c4" />
      {tex && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2 * Math.PI * R, Math.PI * R, 1, 1]} />
          <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
        </mesh>
      )}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2 * Math.PI * R + 1.2, Math.PI * R + 1.2]} />
        <meshStandardMaterial color="#2a1d12" roughness={0.8} />
      </mesh>
      <ProgressLine points={pts} lineRef={line} color="#5b2f12" width={3.6} />
      <Pin id="from" position={fromP} label={from.label} date={from.date} note={from.note} side="right" />
      <Pin id="to" position={toP} label={to.label} date={to.date} note={to.note} side="left" />
      <Marker markerRef={marker} paper />
    </>
  )
}
