// A glowing numbered ring (a real <button>, so it is keyboard and screen-reader reachable)
// floating above an artifact, plus a soft additive glow on the artifact itself.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Anchor } from '../labels.jsx'
import * as THREE from 'three'
import { radialTexture } from '../map/common.jsx'

// above: the badge stands on `position` (just over a record) instead of being centred on it; keepClear: it moves
// sideways out of the stage's clear areas (labelLines.js)
export function Hotspot({ index, label, position, glowAt, glowSize = 0.6, glowStrength = 1, seen, active, onSelect, reduced, above = false, keepClear = false }) {
  const glow = useRef()
  useFrame(({ clock }) => {
    if (!glow.current) return
    const k = reduced ? 0.6 : 0.5 + 0.25 * Math.sin(clock.elapsedTime * 1.8 + index)
    glow.current.material.opacity = (active ? 0.15 : k * (seen ? 0.35 : 0.7)) * glowStrength
  })
  return (
    <>
      <sprite ref={glow} position={glowAt} scale={[glowSize, glowSize, 1]} renderOrder={5}>
        <spriteMaterial map={radialTexture()} color="#ff9b2d" transparent depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <Anchor id={`hotspot-${index}`} position={position} avoid="x" keepClear={keepClear}>
        <button
          type="button"
          className={`hotspot ${seen ? 'is-seen' : ''} ${active ? 'is-active' : ''} ${reduced ? 'no-pulse' : ''} ${above ? 'is-above' : ''}`}
          aria-label={`${label}${seen ? ' (seen)' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          <span aria-hidden="true">{index}</span>
          <span className="hotspot-label" aria-hidden="true">{label}</span>
        </button>
      </Anchor>
    </>
  )
}
