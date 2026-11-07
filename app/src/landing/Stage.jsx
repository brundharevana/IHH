import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { scrollState, HANDOFF } from './store.js'
import Hall, { hallPose } from './scenes/Hall.jsx'
import { BoundedLoad } from '../shared/assetLoads.jsx'
import { useRecovery } from '../shared/loadHooks.js'
import { landingScope } from '../shared/loadScope.js'
import { loadChunk, reloadPage } from '../shared/chunks.js'

// One persistent Canvas behind the glass UI. The entrance variant is code-split and loaded on
// demand; the hall is always mounted so the hand-off is instant. The hall's portrait and the threads'
// Earth load through the landing's load scope, and the entrance chunk with a deadline: while they
// load a quiet status shows, and if one fails or stalls a notice says so with "Load it again" (or
// "Reload the page" for a code chunk). The landing's own content stays usable throughout.

const LOADERS = {
  harbor: () => import('./scenes/Harbor.jsx').then((m) => ({ Scene: m.default, pose: m.harborPose })),
  doors: () => import('./scenes/Doors.jsx').then((m) => ({ Scene: m.default, pose: m.doorsPose })),
  threads: () => import('./scenes/Threads.jsx').then((m) => ({ Scene: m.default, pose: m.threadsPose })),
}


const BG = { harbor: '#0a0e14', doors: '#070a10', threads: '#04060a', hall: '#0b0907' }

function Rig({ variant, entrancePose, entranceGroup, hallGroup }) {
  const { camera, scene } = useThree()
  const target = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 50 }), [])
  const look = useRef(new THREE.Vector3(0, 2, 0))
  const prev = useRef(null)
  const fogs = useMemo(
    () => ({
      doors: new THREE.Fog(BG.doors, 30, 160),
      hall: new THREE.Fog(BG.hall, 18, 75),
    }),
    []
  )

  useFrame((_, dt) => {
    const s = scrollState
    const doors = variant === 'doors'
    const inHall = s.arrive > 0.001 || s.entrance >= (doors ? 0.999 : HANDOFF)
    if (!inHall && !entrancePose) {
      // entrance scene still loading: show nothing rather than flash the hall
      if (entranceGroup.current) entranceGroup.current.visible = false
      if (hallGroup.current) hallGroup.current.visible = false
      return
    }
    if (inHall) hallPose(s.arrive, s.bay, target)
    else entrancePose(s.entrance, target)

    if (s.warp > 0) {
      // tour transition: push toward what we are looking at and widen the lens
      target.pos.lerp(target.look, s.warp * 0.32)
      target.fov += s.warp * 22
    }

    if (entranceGroup.current) entranceGroup.current.visible = !inHall || doors
    if (hallGroup.current) hallGroup.current.visible = inHall || doors

    const phase = inHall ? 'hall' : variant
    const teleport = prev.current !== phase && !doors
    if (prev.current !== phase) {
      scene.background = new THREE.Color(BG[phase])
      scene.fog = fogs[phase] || null
      prev.current = phase
    }

    const snap = teleport || s.reduced
    const k = snap ? 1 : 1 - Math.exp(-dt * 5)
    camera.position.lerp(target.pos, k)
    look.current.lerp(target.look, k)
    camera.lookAt(look.current)
    const f = camera.fov + (target.fov - camera.fov) * k
    if (Math.abs(f - camera.fov) > 0.01) {
      camera.fov = f
      camera.updateProjectionMatrix()
    }
  })
  return null
}

function World({ variant, mobile }) {
  const [mod, setMod] = useState(null)
  const [failed, setFailed] = useState(null)
  const entranceGroup = useRef()
  const hallGroup = useRef()
  useEffect(() => {
    let live = true
    setMod(null)
    loadChunk(LOADERS[variant], 'the entrance scene').then(
      (m) => live && setMod(m),
      (e) => live && setFailed(e),
    )
    return () => {
      live = false
    }
  }, [variant])
  if (failed) throw failed // to the load boundary (a ChunkError: the notice offers a reload)
  const Scene = mod?.Scene
  return (
    <>
      <Rig variant={variant} entrancePose={mod?.pose} entranceGroup={entranceGroup} hallGroup={hallGroup} />
      <group ref={entranceGroup}>{Scene && <Scene mobile={mobile} />}</group>
      <group ref={hallGroup}>
        <Hall mobile={mobile} />
      </group>
      <Environment resolution={mobile ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffd8a8" scale={[12, 1.5, 1]} position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#f0e8dd" scale={[6, 10, 1]} position={[-9, 3, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#9fb2d6" scale={[6, 10, 1]} position={[9, 3, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#ffb366" scale={[8, 3, 1]} position={[0, 4, -9]} />
      </Environment>
    </>
  )
}

export default function Stage({ variant, mobile }) {
  const load = useRecovery(landingScope)
  return (
    <>
    <div className="stage" aria-hidden="true" data-landing-3d={load.status}>
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        camera={{ fov: 50, near: 0.1, far: 2500, position: [0, 2, 34] }}
        gl={{ antialias: !mobile, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        {load.status !== 'resetting' && (
          <BoundedLoad key={load.attempt} scope={landingScope} what="the 3D hall" load={load}>
            <World variant={variant} mobile={mobile} />
          </BoundedLoad>
        )}
        {!mobile && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
            <Vignette offset={0.28} darkness={0.72} />
            <Noise opacity={0.028} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
    {(load.status === 'loading' || load.status === 'resetting') && (
      <p className="stage-status" role="status">
        Loading the 3D hall…
      </p>
    )}
    {load.status === 'failed' && (
      <div className="stage-status stage-status--failed" role="alert" data-landing-3d-error="true">
        <p>The 3D hall could not be loaded: the {load.message}.</p>
        <button type="button" onClick={load.reload ? reloadPage : load.retry}>
          {load.reload ? 'Reload the page' : 'Load it again'}
        </button>
      </div>
    )}
    </>
  )
}
