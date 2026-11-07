// A map leg (a map step of the tour data: places joined by segments): one of three variants plus the
// guide presenting from the lower-left corner. The globe and flat variants (URL only) draw the
// first and last place; the unroll variant (owner pick) draws every place on the route.
import { lazy, useCallback, useEffect, useMemo, useState } from 'react'
import { Hud, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FlatMap } from './FlatMap.jsx'
import { UnrollMap } from './UnrollMap.jsx'
import { Guide } from '../../shared/guide/Guide.jsx'
import { useTour } from '../store.js'
import { StageSuspense } from '../stageLoading.jsx'
import { Loaded } from '../../shared/assetLoads.jsx'

// The spec's map is the globe-to-map unroll. The globe variant (three-globe, whose Earth image loads
// outside the stage's load scope and readiness) is a dev-only comparison (?map=globe on the dev
// server): it is not in the production build (scripts/check_dist.mjs).
const VARIANTS = {
  flat: FlatMap,
  unroll: UnrollMap,
  ...(import.meta.env.DEV ? { globe: lazy(() => import('./GlobeMap.jsx').then((m) => ({ default: m.GlobeMap }))) } : {}),
}

// The map and its guide load in their own timed Suspense each (one never hides the other); onLoaded
// once both are in (ChapterPlayer: data-map-ready, the loading status).
export function MapStage({ leg, reduced, onLoaded }) {
  const variant = useTour((s) => s.mapVariant)
  const run = useTour((s) => s.mapRun)
  const Variant = VARIANTS[variant] || UnrollMap
  const data = useMemo(() => ({ ...leg, from: leg.places[0], to: leg.places[leg.places.length - 1] }), [leg])
  const [mapIn, setMapIn] = useState(false)
  const [guideIn, setGuideIn] = useState(false)
  const mapLoaded = useCallback(() => setMapIn(true), [])
  const guideLoaded = useCallback(() => setGuideIn(true), [])
  useEffect(() => {
    if (mapIn && guideIn) onLoaded?.()
  }, [mapIn, guideIn, onLoaded])
  return (
    <>
      <color attach="background" args={['#0a0e14']} />
      <StageSuspense what="the map">
        <Variant key={`${variant}-${run}`} data={data} reduced={reduced} />
        <Loaded onLoaded={mapLoaded} />
      </StageSuspense>
      <MapGuide reduced={reduced} onLoaded={guideLoaded} />
    </>
  )
}

function MapGuide({ reduced, onLoaded }) {
  const { size } = useThree()
  const [headY, setHeadY] = useState(1.45)
  const onMeasure = useCallback(({ headY: y }) => setHeadY(y), [])
  const aspect = size.width / size.height
  const phone = aspect < 1
  // frame the guide from the waist up, filling ~40% (desktop) / ~30% (phone) of the height
  const share = phone ? 0.2 : 0.34
  const H = 0.82 / share / 2
  const dist = H / Math.tan((30 * Math.PI) / 360)
  const camY = headY - 0.7 + H
  const halfW = H * aspect
  const x = -halfW + (phone ? 0.22 : 0.55)
  const nod = useTour((s) => s.nod)
  const travel = useTour((s) => s.travel)
  const started = useTour((s) => s.started)
  // behind the splash she stands in calm idle: no pointing until the tour begins
  const point = useMemo(() => (started && travel < 1 ? new THREE.Vector3(x + 2.5, headY + 0.1, 1.2) : null), [started, travel, x, headY])
  return (
    <Hud renderPriority={1}>
      <PerspectiveCamera makeDefault position={[0, camY, dist]} fov={30} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[-3, 2, -2]} intensity={1.4} color="#ff9b2d" />
      <StageSuspense what="the guide">
        <Guide position={[x, 0, 0]} pointAt={point} nodKey={nod} reducedMotion={reduced} onMeasure={onMeasure} />
        <Loaded onLoaded={onLoaded} />
      </StageSuspense>
    </Hud>
  )
}
