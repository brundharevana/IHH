import { useCallback, useEffect, useState } from 'react'
import { lazyChunk, reloadPage } from '../shared/chunks.js'
import { Canvas, useThree } from '@react-three/fiber'
import { BoundedLoad } from '../shared/assetLoads.jsx'
import { useRecovery } from '../shared/loadHooks.js'
import { guideScope } from '../shared/loadScope.js'

// Head-and-shoulders view of the visitor's guide (app/src/shared/guide/Guide.jsx: one of three
// Rocketbox avatars, picked once per visitor) in its own small canvas. Loaded through
// import.meta.glob so the landing still builds, and falls back to the placeholder, if that
// component is absent. The camera frames the head the avatar reports (the three differ in height).
// The guide's models load through the landing's own load scope (shared/assetLoads.jsx): the
// placeholder shows until the guide is in; a failure or a stall (LOAD_TIMEOUT_MS) keeps it and offers
// "Load the guide again", which aborts and evicts what did not load before the canvas mounts again.
const found = import.meta.glob('../shared/guide/Guide.jsx')
const loader = found['../shared/guide/Guide.jsx']
const SharedGuide = loader ? lazyChunk(() => loader().then((m) => ({ default: m.Guide })), 'the guide') : null

export const hasSharedGuide = Boolean(SharedGuide)

function Frame({ headY, compact }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    // eye level a little above the head bone; look slightly down to the chin and shoulders
    camera.position.set(0, headY + 0.08, compact ? 1.3 : 1.6)
    camera.lookAt(0, headY - 0.04, 0)
  }, [camera, headY, compact])
  return null
}

export default function GuideAvatar({ nodKey, reduced, compact, fallback = null }) {
  const [headY, setHeadY] = useState(1.55)
  const onMeasure = useCallback(({ headY: y }) => setHeadY(y), [])
  const load = useRecovery(guideScope)
  if (!SharedGuide) return fallback
  return (
    <div className="guide-avatar-load" data-guide-state={load.status}>
      {load.status !== 'resetting' && (
        <Canvas
          key={load.attempt}
          className="guide-canvas"
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.63, compact ? 1.3 : 1.6], fov: compact ? 24 : 28, near: 0.05, far: 20 }}
          gl={{ alpha: true, antialias: true }}
          aria-hidden="true"
        >
          <Frame headY={headY} compact={compact} />
          <ambientLight intensity={0.8} color="#ffe9d2" />
          <directionalLight position={[1.2, 2.2, 2]} intensity={1.9} color="#ffe2c0" />
          <directionalLight position={[-2, 1.6, -1.5]} intensity={1.4} color="#ff9b2d" />
          <BoundedLoad scope={guideScope} what="the guide" load={load}>
            <SharedGuide nodKey={nodKey} reducedMotion={reduced} onMeasure={onMeasure} />
          </BoundedLoad>
        </Canvas>
      )}
      {load.status !== 'ready' && <div className="guide-avatar-cover">{fallback}</div>}
      {load.status === 'failed' && (
        // a failed code chunk is fetched again only by a page reload (shared/chunks.js)
        <button type="button" className="guide-retry" onClick={load.reload ? reloadPage : load.retry} aria-label={load.reload ? 'Reload the page to load the guide' : 'Load the guide again'} title={`The ${load.message}.`}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
