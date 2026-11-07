// A recreated room (tour data: room, see data/shape.js): its baked glb (desktop or mobile variant),
// walkable bounds, hotspots on the artifacts the guide talks about, each stop's record shown at the
// stop (RoomRecords.jsx), the guide at her fixed spot and the room's authored camera poses per
// device. Einstein's study falls back to the labelled stand-in until study.glb exists.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { versioned } from '../../shared/assetVersion.js'
import { useThree } from '@react-three/fiber'
import { StandInStudy, STANDIN } from './StandInStudy.jsx'
import { StudyGlb } from './StudyGlb.jsx'
import { probeRoom } from './probeRoom.js'
import { StageSuspense } from '../stageLoading.jsx'
import { useScopedGLTF } from '../../shared/loadHooks.js'
import { useRecordDraw } from '../recordDraws.js'
import { RoomControls } from './RoomControls.jsx'
import { Hotspot } from './Hotspot.jsx'
import { RoomRecords } from './RoomRecords.jsx'
import { guideSpot } from './guidePlace.js'
import { RoomGuide } from './RoomGuide.jsx'
import { screenBox } from './guideFrame.js'
import { useTour } from '../store.js'

// dev only: tweak a pose from the console (window.__roomPoses[<room id>]) and re-focus to see it
const devPoses = (room) => {
  if (import.meta.env.DEV && typeof window !== 'undefined') (window.__roomPoses ||= {})[room.id] = room.poses
}

// Where each numbered ring sits on its node in study.glb (box = the node's world bounding box).
// Desk: over the near half of the top, clear of the papers. Papers and letter: just above the
// sheet, pushed apart so the two rings on the desk top never overlap.
const RINGS = {
  study: {
    desk: (b, c) => new THREE.Vector3(c.x + 0.1, 1.02, c.z - 0.22),
    letter: (b, c) => new THREE.Vector3(c.x - 0.1, b.max.y + 0.06, c.z - 0.02),
    papers: (b, c) => new THREE.Vector3(c.x + 0.12, b.max.y + 0.06, c.z + 0.06),
  },
}

// Default ring: on the side of the object that faces the room's start view, at its middle for tall
// things, just above small ones; flat floor-wide things get it near their centre.
function defaultRing(box, c, size, eye) {
  if (size.y < 0.25 && Math.max(size.x, size.z) > 2) return new THREE.Vector3(c.x, box.max.y + 0.3, c.z)
  const x = THREE.MathUtils.clamp(eye[0], box.min.x, box.max.x)
  const z = THREE.MathUtils.clamp(eye[2], box.min.z, box.max.z)
  // pull it toward the centre on long things so it sits on the object, not at an end
  const k = Math.max(size.x, size.z) > 3 ? 0.75 : 0
  const p = new THREE.Vector3(x + (c.x - x) * k, size.y > 1.2 ? c.y : box.max.y + 0.14, z + (c.z - z) * k)
  return p
}

const footprint = ([x, , z], r = 0.22) => [x - r, z - r, x + r, z + r]


// An object placed in the room that is not part of its baked model (artifact.prop: { src, pos,
// rotY? }), e.g. a labelled recreation on the study desk: its own glb, lit by the room's lights,
// registered as the anchor of its stop like a model node.
function RoomProp({ id, media, prop, register, onPick }) {
  const { scene } = useScopedGLTF(versioned(prop.src))
  const object = useMemo(() => scene.clone(true), [scene])
  const ref = useRef()
  useRecordDraw(id, media, versioned(prop.src), ref, 'model') // dev only (recordDraws.js): the recreation the stop shows
  useEffect(() => {
    if (ref.current) register(id, ref.current)
  }, [id, register, object])
  return (
    <group
      ref={ref}
      position={prop.pos}
      rotation={[0, prop.rotY || 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 6) onPick?.(id)
      }}
    >
      <primitive object={object} />
    </group>
  )
}

// A stop on a part of the room that has no node of its own (artifact.anchor: { pos, size }), e.g. a
// record shown at one of a room's wall panels when the glb holds all of them as one node: an
// invisible box (never drawn, still clickable) registered as the anchor of its stop.
function RoomAnchor({ id, anchor, register, onPick }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) register(id, ref.current)
  }, [id, register])
  return (
    <mesh
      ref={ref}
      position={anchor.pos}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta <= 6) onPick?.(id)
      }}
    >
      <boxGeometry args={anchor.size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}

function buildRoom(cfg, probe, model, phone) {
  const b = probe.bounds
  // her spot is an obstacle too, so the visitor never walks through the guide (RoomGuide moves it with her)
  const guideObstacle = footprint(cfg.guide.pos)
  const room = {
    ...STANDIN,
    id: cfg.id,
    source: probe.url.split('/').pop(),
    bounds: b ? { min: b.min, max: b.max } : STANDIN.bounds,
    obstacles: [...(b?.obstacles?.length ? b.obstacles : STANDIN.obstacles), guideObstacle],
    guideObstacle,
    label: model?.label || null,
    // a natural landscape with no built structure (data: room.landscape): its easels stand on the ground
    landscape: Boolean(cfg.landscape),
  }
  if (!model) return room
  if (model.shell) room.shell = { min: model.shell.min.toArray(), max: model.shell.max.toArray() }
  const vps = model.viewpoints.map((o) => {
    o.updateWorldMatrix(true, false)
    return o.getWorldPosition(new THREE.Vector3())
  })
  const poses = cfg.poses[phone ? 'phone' : 'desktop']
  room.start = { pos: poses.start.pos, look: poses.start.look }
  room.views = Object.fromEntries(
    Object.entries(poses)
      .filter(([id]) => id !== 'start')
      .map(([id, v]) => {
        const vp = vps[v.stand] || vps[0]
        return [id, { pose: v, stand: vp ? [vp.x, vp.z] : undefined }]
      }),
  )
  return room
}

// onError(message): the room could not be loaded (probe failure, timeout or model error); the chapter
// shows a recoverable error (ChapterPlayer: retry, or the chapter's records) instead of a blank stage.
export function RoomStage({ room: cfg, phone, reduced, controlsRef, onPick, onReady, onError }) {
  const [probe, setProbe] = useState(undefined)
  useEffect(() => {
    const ctl = new AbortController()
    devPoses(cfg)
    probeRoom(cfg.model, phone, { signal: ctl.signal }).then(
      (s) => {
        if (ctl.signal.aborted) return
        setProbe(s)
        // no model and no stand-in: nothing to show, so it is an error the visitor can act on
        if (s === null && !cfg.standIn) onError?.('room model is missing')
      },
      (e) => {
        if (ctl.signal.aborted) return
        setProbe(null)
        onError?.(`the room did not load (${e?.message || 'error'})`)
      },
    )
    return () => ctl.abort()
  }, [cfg, phone, onError])

  const [model, setModel] = useState(null)
  const standIn = probe === null && cfg.standIn
  const room = useMemo(() => {
    if (probe) return buildRoom(cfg, probe, model, phone)
    return { ...STANDIN, id: cfg.id, source: 'stand-in' }
  }, [cfg, probe, model, phone])
  // the room's own spot for her (guidePlace.js): where she starts, and where she likes to stand
  const prefer = useMemo(() => [...guideSpot(standIn ? null : cfg.guide).pos], [cfg, standIn])

  // outdoor rooms carry a sky dome as far out as their shell (the Hall of Fame grounds: 500 m); the
  // lens must reach past it, or the dome is clipped to the background colour
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    if (!room.shell) return
    const reach = Math.hypot(...[0, 1, 2].map((k) => Math.max(Math.abs(room.shell.min[k]), Math.abs(room.shell.max[k]))))
    if (camera.far >= reach * 1.05) return
    const before = camera.far
    camera.far = reach * 1.05
    camera.updateProjectionMatrix()
    return () => {
      camera.far = before
      camera.updateProjectionMatrix()
    }
  }, [camera, room.shell])

  const recordMeshesRef = useRef({}) // the records shown at the stops, by stop (RoomRecords)
  const anchorsRef = useRef({})
  const [anchors, setAnchors] = useState({})
  const register = useCallback((id, o) => {
    if (o && anchorsRef.current[id] !== o) {
      anchorsRef.current[id] = o
      setAnchors({ ...anchorsRef.current })
    }
  }, [])

  const spots = useMemo(() => {
    const rings = RINGS[cfg.id]
    return cfg.artifacts
      .map((a, i) => {
        const o = anchors[a.id]
        if (!o) return null
        o.updateWorldMatrix(true, true)
        const box = new THREE.Box3().setFromObject(o)
        const c = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        let ring
        // a record shown at the stop: its badge stands just above it (round 9 fix round 1: Almonte)
        const above = !a.ring && Boolean(a.display)
        if (a.ring) ring = new THREE.Vector3(...a.ring)
        else if (above && a.display.mount === 'lie') {
          // a record lying on a table: past its far edge from the room's start view, so the badge stands beyond it,
          // not on it (seen from standing height, its far part is the higher one on screen)
          const away = new THREE.Vector3(c.x - room.start.pos[0], 0, c.z - room.start.pos[2]).normalize()
          const reach = Math.abs(away.x) * size.x * 0.5 + Math.abs(away.z) * size.z * 0.5
          ring = new THREE.Vector3(c.x + away.x * (reach + 0.04), box.max.y + 0.03, c.z + away.z * (reach + 0.04))
        } else if (above) ring = new THREE.Vector3(c.x, box.max.y + 0.03, c.z)
        else if (probe && rings?.[a.id]) ring = rings[a.id](box, c)
        else if (!probe) ring = size.y > 1.2 ? new THREE.Vector3(c.x, c.y + 0.25, box.max.z) : new THREE.Vector3(c.x, box.max.y + 0.14, c.z)
        else ring = defaultRing(box, c, size, room.start.pos)
        return { ...a, index: i + 1, center: c, box, ring, above, glow: Math.max(0.35, Math.min(1.6, Math.max(size.x, size.y, size.z) * 1.3)), object: o }
      })
      .filter(Boolean)
  }, [anchors, cfg, probe, room])

  // ready once the stops' objects are in; a chapter with no stop (round 9: Almonte) once the room is
  const roomIn = Boolean(model) || standIn
  const noStops = cfg.artifacts.length === 0
  useEffect(() => {
    if (spots.length || (noStops && roomIn)) onReady?.({ room, spots })
  }, [spots, room, onReady, noStops, roomIn])

  // dev only (e2e): the focused stop's box on screen in CSS pixels (its record, else its object)
  const three = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const boxOf = (id) => {
      const m = recordMeshesRef.current[id]
      return m ? new THREE.Box3().setFromObject(m) : spots.find((x) => x.id === id)?.box
    }
    window.__stageFocus = {
      box: (id) => {
        const box = boxOf(id)
        return box ? screenBox(box, three.camera, three.size) : null
      },
      // the guide stands behind the stop's object (beyond a desk): farther from the eye than all of its box
      behind: (id) => {
        const box = boxOf(id)
        const g = window.__guideRoots?.size ? [...window.__guideRoots][0] : null
        if (!box || !g) return false
        const at = g.getWorldPosition(new THREE.Vector3())
        const eye = three.camera.position
        const corners = [box.min.x, box.max.x].flatMap((x) => [box.min.z, box.max.z].map((z) => Math.hypot(x - eye.x, z - eye.z)))
        return Math.hypot(at.x - eye.x, at.z - eye.z) > Math.max(...corners) + 0.25
      },
    }
    return () => {
      window.__stageFocus = null
    }
  }, [spots, three.camera, three.size])

  const focus = useTour((s) => s.focus)
  const seen = useTour((s) => s.seen)
  const pointArr = useTour((s) => s.pointAt)
  const nod = useTour((s) => s.nod)
  const pointAt = useMemo(() => (pointArr ? new THREE.Vector3(...pointArr) : null), [pointArr])
  // she keeps her head on the focused artifact for as long as it is focused (pointing is shorter)
  const focusCenter = useMemo(() => spots.find((x) => x.id === focus)?.center || null, [spots, focus])
  // what the visitor looks at when a stop is focused: the record shown there, else the stop's object
  const occluder = useRef()
  const onRecord = useCallback((id, m) => {
    if (m) recordMeshesRef.current[id] = m
    else delete recordMeshesRef.current[id]
  }, [])
  const focusRef = useRef(null)
  focusRef.current = focus
  const focusBox = useCallback(() => {
    const id = focusRef.current
    if (!id) return null
    const m = recordMeshesRef.current[id]
    if (m) return new THREE.Box3().setFromObject(m).expandByScalar(0.04)
    const s = spots.find((x) => x.id === id)
    if (!s?.box) return null
    // a whole building or a landscape (the stop's data: wide) is the place she stands in front of (guideFrame.js focusRect)
    const box = s.box.clone()
    box.wide = Boolean(s.wide)
    return box
  }, [spots])

  // the stops' numbered badges (Hotspot, drawn over the scene): she keeps her upper body clear of them
  const badgePoints = useCallback(() => spots.map((s) => ({ at: s.ring.toArray(), above: s.above })), [spots])

  if (probe === undefined || (probe === null && !cfg.standIn)) return null
  const [fogNear, fogFar] = cfg.fog || [9, 18]

  return (
    <>
      <color attach="background" args={['#14100c']} />
      <fog attach="fog" args={['#14100c', fogNear, fogFar]} />
      {/* lights reach only the lit models (guide, stand-in); the rooms are baked */}
      <hemisphereLight args={['#ffe9c9', '#3a2a1c', 0.9]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[-0.6, 3.4, -4.5]}
        intensity={probe ? 1.6 : 2.4}
        color="#fff0d6"
        castShadow={!probe}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />
      <group
        ref={occluder}
        onClick={(e) => {
          if (e.delta > 6 || e.point.y > 0.15) return
          controlsRef.current?.walkOnFloor(e.point)
        }}
      >
        <StageSuspense what="the room model">
          {probe ? (
            <>
              <StudyGlb url={probe.url} artifacts={cfg.artifacts} register={register} onPick={onPick} onModel={setModel} />
              {cfg.artifacts
                .filter((a) => a.prop)
                .map((a) => (
                  <RoomProp key={a.id} id={a.id} media={a.art?.id || a.artifact || null} prop={a.prop} register={register} onPick={onPick} />
                ))}
              {cfg.artifacts
                .filter((a) => a.anchor)
                .map((a) => (
                  <RoomAnchor key={a.id} id={a.id} anchor={a.anchor} register={register} onPick={onPick} />
                ))}
            </>
          ) : (
            <StandInStudy register={register} onPick={onPick} />
          )}
        </StageSuspense>
        {/* each stop's record, shown at the stop (roomRecords.js), once the room itself is in */}
        {probe && model && <RoomRecords room={cfg} phone={phone} onPick={onPick} onRecord={onRecord} />}
      </group>

      {spots.map((s) => (
        <Hotspot
          key={s.id}
          index={s.index}
          label={s.name}
          position={s.ring.toArray()}
          above={s.above}
          glowAt={s.center.toArray()}
          glowSize={s.glow}
          glowStrength={probe ? 0.45 : 1}
          seen={seen.includes(s.id)}
          active={focus === s.id}
          reduced={reduced}
          onSelect={() => onPick(s.id)}
        />
      ))}

      <StageSuspense what="the guide">
        <RoomGuide
          room={room}
          prefer={prefer}
          obstacle={room.guideObstacle}
          occluder={occluder}
          focusBox={focusBox}
          badges={badgePoints}
          attention={focusCenter}
          ready={roomIn && (spots.length > 0 || noStops)}
          phone={phone}
          reduced={reduced}
          pointAt={pointAt}
          lookAtTarget={focusCenter}
          nodKey={nod}
        />
      </StageSuspense>
      <RoomControls ref={controlsRef} room={room} phone={phone} reduced={reduced} />
    </>
  )
}
