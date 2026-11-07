// <TourCanvas /> — the chapter player's R3F canvas and the stage it shows: a map leg (map/), a rebuilt
// room (room/), a photo room or a gallery case (place/). Everything that needs three.js lives here, in
// one lazy chunk, so ChapterPlayer's HUD, the Begin card and the narration are up before it arrives;
// the photo room and the gallery case are chunks of their own, fetched only for a chapter that uses
// them. A room's glb loads when its chapter mounts, never ahead of it.
import { useEffect, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MapStage } from './map/MapStage.jsx'
import { RoomStage } from './room/RoomStage.jsx'
import { LabelCamera } from './labelCamera.jsx'
import { dprFor } from '../shared/dpr.js'
import { StageBoundary, StageSuspense } from './stageLoading.jsx'
import { stageScope } from '../shared/loadScope.js'
import { LoadScopeContext } from '../shared/loadHooks.js'

import { lazyChunk } from '../shared/chunks.js'

// their own chunks, with a deadline (shared/chunks.js); a chunk failure reaches the stage boundary as a
// ChunkError, and the chapter's panel then offers "Reload the page" instead of Try again
const PhotoRoomStage = lazyChunk(() => import('./place/PhotoRoomStage.jsx'), 'the photo room')
const GalleryCaseStage = lazyChunk(() => import('./place/GalleryCaseStage.jsx'), 'the gallery case')

// the lens per tier (the photo room fits its own lens to the photograph)
function TierCamera({ tier, phone }) {
  const { camera } = useThree()
  useEffect(() => {
    if (tier === 'photo') return
    const gallery = tier === 'gallery'
    camera.fov = gallery ? (phone ? 62 : 50) : phone ? 70 : 58
    camera.near = gallery ? 0.05 : 0.01
    camera.far = gallery ? 6000 : 400
    camera.updateProjectionMatrix()
  }, [camera, tier, phone])
  return null
}

// dev only: the scene for the e2e checks (camera, guide bones)
function DevHandle() {
  const state = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__tour3 = state
    window.__tourGuideBox = guideBox
    window.__tourGuideLook = guideLook
    window.__tourGuideHidden = guideHidden
    return () => {
      delete window.__tourGuideBox
      delete window.__tourGuideLook
      delete window.__tourGuideHidden
    }
  }, [state])
  return null
}

// dev only: the guide in CSS pixels: her upper body (head to pelvis, shoulder to shoulder), or with
// { full: true } her whole figure (top of the head to the toes, hand to hand). Unclipped: a box past
// the canvas edge means part of her is out of frame. In the page's coordinates, as the HUD's boxes are
// (the canvas starts below the band in a photo room with one, place.hudBand).
const UPPER = ['Bip01_Head', 'Bip01_Pelvis', 'Bip01_L_UpperArm', 'Bip01_R_UpperArm']
const FULL = [...UPPER, 'Bip01_L_Hand', 'Bip01_R_Hand', 'Bip01_L_Foot', 'Bip01_R_Foot', 'Bip01_L_Toe0', 'Bip01_R_Toe0']
function guideBox({ full = false } = {}) {
  const s = window.__tour3
  if (!s) return null
  const names = full ? FULL : UPPER
  const pts = []
  // the guide's own root (shared/guide/Guide.jsx registers it; a stage may draw her in a scene of its own)
  const roots = window.__guideRoots?.size ? [...window.__guideRoots] : [s.scene]
  for (const r of roots) r.traverse((o) => {
    if (!names.includes(o.name)) return
    const p = o.getWorldPosition(new THREE.Vector3())
    if (o.name === 'Bip01_Head') pts.push(p.clone().add(new THREE.Vector3(0, full ? 0.2 : 0.14, 0)))
    pts.push(p)
  })
  const ndc = pts.map((p) => p.project(s.camera)).filter((p) => p.z < 1)
  if (!ndc.length) return null
  if (full && ndc.length < pts.length) return { behind: true }
  const { width: w, height: h } = s.size
  const c = s.gl.domElement.getBoundingClientRect()
  const xs = ndc.map((p) => c.left + ((p.x + 1) / 2) * w)
  const ys = ndc.map((p) => c.top + ((1 - p.y) / 2) * h)
  const pad = full ? 4 : 8
  return { left: Math.min(...xs) - pad, right: Math.max(...xs) + pad, top: Math.min(...ys) - pad, bottom: Math.max(...ys) + pad }
}

// dev only: how far her gaze is from what she should be looking at (degrees), and at what
function guideLook() {
  const g = window.__guideRoots?.size ? [...window.__guideRoots][0] : null
  return g ? { err: g.userData.lookErr ?? null, at: g.userData.lookAt ?? null } : null
}

// dev only: which of her body points (head, chest, pelvis, knees, feet) the scene she stands in hides
// from the camera (a stage that draws her over everything, the photo room's foreground, hides none;
// ground cover she stands in, a meadow's grass, is not counted)
function guideHidden() {
  const s = window.__tour3
  const g = window.__guideRoots?.size ? [...window.__guideRoots][0] : null
  if (!s || !g) return null
  let scene = g
  while (scene.parent) scene = scene.parent
  const mine = new Set()
  g.traverse((o) => mine.add(o))
  const meshes = []
  scene.traverse((o) => {
    // the grass and flowers of a meadow are what she stands in, not something in front of her
    if (!o.isMesh || mine.has(o) || o.userData.noOcclude || /grass|flower/i.test(o.name)) return
    for (let p = o; p; p = p.parent) if (!p.visible) return
    const m = [].concat(o.material).find((x) => x && x.colorWrite !== false && !(x.transparent && (x.opacity ?? 1) < 0.5))
    if (m) meshes.push(o)
  })
  const base = g.getWorldPosition(new THREE.Vector3())
  const eye = s.camera.getWorldPosition(new THREE.Vector3())
  const ray = new THREE.Raycaster()
  const hidden = []
  // down her middle, and out to both shoulders (round 9: a column hid half of her while her middle showed)
  const points = [['head', 1.72], ['chest', 1.35], ['pelvis', 0.95], ['knees', 0.5], ['feet', 0.12]].map(([name, h]) => [name, base.clone().add(new THREE.Vector3(0, h, 0))])
  g.traverse((o) => {
    if (o.name === 'Bip01_L_UpperArm') points.push(['left shoulder', o.getWorldPosition(new THREE.Vector3())])
    if (o.name === 'Bip01_R_UpperArm') points.push(['right shoulder', o.getWorldPosition(new THREE.Vector3())])
  })
  for (const [name, p] of points) {
    const dir = p.clone().sub(eye)
    const len = dir.length()
    ray.set(eye, dir.normalize())
    ray.near = 0.05
    ray.far = len - 0.15
    if (ray.intersectObjects(meshes, false).length) hidden.push(name)
  }
  return hidden
}

export default function TourCanvas({ ch, phase, tier, room, run, phone, reduced, controlsRef, onPick, onReady, onStageError, onMapLoaded, attempt = 0, stageProps, label }) {
  // Try again (attempt): the stage mounts again only once its load scope is reset (every request still
  // open aborted and given up, every load that did not succeed evicted), so the retry fetches afresh
  // and never attaches to a stuck request
  const [resetFor, setResetFor] = useState(attempt)
  useEffect(() => {
    if (attempt === resetFor) return
    let live = true
    stageScope.reset().then(() => live && setResetFor(attempt))
    return () => {
      live = false
    }
  }, [attempt, resetFor])
  const { pointArr, ...rest } = stageProps
  const pointAt = useMemo(() => (pointArr ? new THREE.Vector3(...pointArr) : null), [pointArr])
  const props = { ...rest, pointAt }
  return (
    <Canvas
      shadows
      dpr={dprFor(phone)}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ fov: phone ? 70 : 58, near: 0.01, far: 400, position: [0, 1.6, 2.2] }}
      role="img"
      aria-label={label}
    >
      <DevHandle />
      <LabelCamera />
      <TierCamera tier={phase === 'map' ? 'map' : tier} phone={phone} />
      <LoadScopeContext.Provider value={stageScope}>
        {resetFor === attempt && (
          <StageBoundary key={`${ch.id}-${phase}-${attempt}`} what="this place" onError={onStageError}>
            <StageSuspense what={phase === 'map' ? 'the map' : 'this place'}>
              {phase === 'map' && ch.map ? (
                <MapStage key={`${ch.id}-${run}`} leg={ch.map} reduced={reduced} onLoaded={onMapLoaded} />
              ) : tier === 'room' ? (
                <RoomStage key={`${ch.id}-${attempt}`} room={room} phone={phone} reduced={reduced} controlsRef={controlsRef} onPick={onPick} onReady={onReady} onError={onStageError} />
              ) : tier === 'photo' ? (
                <PhotoRoomStage key={`${ch.id}-${attempt}`} {...props} />
              ) : (
                <GalleryCaseStage key={`${ch.id}-${attempt}`} {...props} controlsRef={controlsRef} glide={!reduced} />
              )}
            </StageSuspense>
          </StageBoundary>
        )}
      </LoadScopeContext.Provider>
    </Canvas>
  )
}
