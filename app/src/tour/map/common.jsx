// Pieces shared by the three map variants: the leg clock, the neutral travel marker, place pins
// and the progressive route line.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Anchor } from '../labels.jsx'
import * as THREE from 'three'
import { setState, getState, useTour } from '../store.js'
import { clamp01, easeInOut } from './geo.js'
import { UNROUTED_NOTE } from '../data/chapters.js'
import { artifactById } from '../data/artifacts.js'
import { recordImage } from '../room/roomRecords.js'

export const TRAVEL_SECONDS = 4.6

// Leg clock: `intro` seconds of scene-setting, then 0..1 travel over `seconds`.
export function useLegClock(intro, reduced, seconds = TRAVEL_SECONDS) {
  const c = useRef({ e: 0, done: false })
  return (dt) => {
    const s = c.current
    // nothing moves behind the splash: the leg's clock starts when the visitor presses Begin
    if (getState().started) s.e += reduced ? 999 : Math.min(dt, 0.05)
    const raw = clamp01((s.e - intro) / seconds)
    if (raw >= 1 && !s.done) {
      s.done = true
      if (getState().travel < 1) setState({ travel: 1 })
    }
    return { e: s.e, introP: clamp01(s.e / Math.max(intro, 0.0001)), travel: easeInOut(raw), raw }
  }
}

// Route drawn as a thick line whose visible length follows `progress` (0..1).
export function ProgressLine({ points, color = '#ff9b2d', width = 3, dashed = false, lineRef, opacity = 1 }) {
  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={width}
      dashed={dashed}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}

export function setLineProgress(line, p) {
  if (!line) return
  const g = line.geometry
  const segs = g.attributes.instanceStart ? g.attributes.instanceStart.count : 0
  g.instanceCount = Math.max(0, Math.floor(segs * p))
}

// Transport icons, shown only on a segment whose mode a verified fact names (data: segment.mode).
const ICONS = {
  ship: 'M3 15.5l1.6 3.5h14.8l1.6-3.5H3zm2-1.5h14l-1.2-4H13V6h-2v4H6.2L5 14zm6-10h2v1.5h-2V4z',
  train: 'M7 3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-2.2 2.9L19.5 20h-2.2l-1.5-2h-7.6l-1.5 2H4.5l1.7-2.1A3 3 0 0 1 4 15V6a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v4h12V6a1 1 0 0 0-1-1H7zm1 8.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm8 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z',
  plane: 'M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5l8 2.5z',
}
const MODE_WORD = { ship: 'By ship', train: 'By train', plane: 'By plane' }
const PENDING = 'Mode of travel pending verification'

export function TravelPill({ segment }) {
  const mode = segment?.mode
  // an un-routed line (owner decision 2026-10-29): no mode and no route; its note sits beside the line (UnroutedNote)
  if (segment?.routed === false) return null
  if (!mode) return <span className="map-pill map-pill-pending">{segment?.label || PENDING}</span>
  return (
    <span className="map-pill map-pill-mode">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d={ICONS[mode]} fill="currentColor" />
      </svg>
      {segment.label || MODE_WORD[mode]}
    </span>
  )
}

// The travel marker. Neutral (no ship, no plane) unless the segment's mode is a verified fact.
export function Marker({ markerRef, scale = 1, labelled = true, paper = false, segment = null }) {
  const halo = useRef()
  useFrame(({ clock }) => {
    if (halo.current) {
      const s = 1 + 0.25 * Math.sin(clock.elapsedTime * 3)
      halo.current.scale.setScalar(s)
    }
  })
  const haloTex = useMemo(() => radialTexture(), [])
  return (
    <group ref={markerRef} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.035, 24, 16]} />
        <meshBasicMaterial color={paper ? '#3a1a08' : '#fef0d7'} toneMapped={false} />
      </mesh>
      <sprite ref={halo} scale={paper ? [0.16, 0.16, 1] : [0.22, 0.22, 1]}>
        <spriteMaterial
          map={haloTex}
          color={paper ? '#9a3f10' : '#ff9b2d'}
          opacity={paper ? 0.55 : 1}
          transparent
          depthWrite={false}
          blending={paper ? THREE.NormalBlending : THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {labelled && (
        <Anchor id="marker-pill" position={[0, 0.1, 0]} avoid>
          <TravelPill segment={segment} />
        </Anchor>
      )}
    </group>
  )
}

// A place on the route; a `minor` waypoint keeps its dot and shows its label only while `shown`.
export function Pin({ id, position, label, date, note, side = 'right', active, cullBackface = false, minor = false, shown = true, size = 0.022 }) {
  // the route's places appear once the tour has begun (the splash shows a still, empty globe)
  const started = useTour((st) => st.started)
  return (
    <group position={position} visible={started}>
      <mesh>
        <sphereGeometry args={[minor ? size * 0.7 : size, 16, 12]} />
        <meshBasicMaterial color={active ? '#ff9b2d' : '#f0e8dd'} toneMapped={false} />
      </mesh>
      <Anchor id={`pin-${id}`} position={[0, 0, 0]} cullBackface={cullBackface} avoid>
        <div className={`map-place side-${side} ${active ? 'is-active' : ''} ${minor ? 'is-minor' : ''} ${shown ? '' : 'is-hidden'}`}>
          {date && <span className="map-place-date">{date}</span>}
          <span className="map-place-name">{label}</span>
          {note && <span className="map-place-note">{note}</span>}
        </div>
      </Anchor>
    </group>
  )
}

let _radial = null
export function radialTexture() {
  if (_radial) return _radial
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,255,255,1)')
  gr.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  gr.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 128, 128)
  _radial = new THREE.CanvasTexture(c)
  return _radial
}

// Position along a polyline at fraction t.
export function along(points, t, out = new THREE.Vector3()) {
  const n = points.length - 1
  const f = Math.min(n - 1e-6, Math.max(0, t * n))
  const i = Math.floor(f)
  const k = f - i
  const a = points[i]
  const b = points[i + 1]
  return out.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k)
}

// The note beside an un-routed line (owner decision 2026-10-29): it sits at the middle of the line once the map has
// unrolled, so the line never reads as a route.
export function UnroutedNote({ id, shown }) {
  return (
    <Anchor id={`unrouted-${id}`} position={[0, 0, 0]} avoid>
      <div className={`map-place map-unrouted side-below ${shown ? '' : 'is-hidden'}`} data-map-unrouted="true">
        <span className="map-place-note">{UNROUTED_NOTE}</span>
      </div>
    </Anchor>
  )
}

// A place photograph on the map (round 9): a small pin with the record's thumbnail at a verified place; picking it
// opens the record in the viewer (ChapterPlayer reads the store's mapRecord).
export function ResourcePin({ resource, shown, size = 0.016 }) {
  const started = useTour((st) => st.started)
  const arts = (resource.media || []).map((id) => artifactById(id)).filter((a) => a && !a.linkOnly)
  return (
    <group visible={started && shown}>
      <mesh>
        <octahedronGeometry args={[size, 0]} />
        <meshBasicMaterial color="#9a3f10" toneMapped={false} />
      </mesh>
      <Anchor id={`res-${resource.id}`} position={[0, 0, 0]} avoid>
        <div className={`map-place map-resource side-above ${started && shown ? '' : 'is-hidden'}`} data-map-resource={resource.id}>
          <span className="map-place-date">Place photographs · {resource.label}</span>
          <span className="map-resource-thumbs">
            {arts.map((a) => (
              <button key={a.id} type="button" className="map-resource-thumb" data-map-media={a.id} tabIndex={started && shown ? 0 : -1} aria-label={`Open the photograph: ${a.title}`} onClick={() => setState({ mapRecord: a.id })}>
                <img src={a.thumb || recordImage(a)} alt="" loading="lazy" />
              </button>
            ))}
          </span>
        </div>
      </Anchor>
    </group>
  )
}
