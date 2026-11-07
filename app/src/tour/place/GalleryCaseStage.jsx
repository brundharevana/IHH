// Gallery case (place.tier 'gallery', the presentation for a chapter with no usable photograph of
// the place): a calm IHH gallery in the Tapestry palette, a lit museum case holding the chapter's
// objects (galleryLayout.js: up to six on the sloped bed, the first sheet on its own stand; with no
// record, a printed card of the chapter's verified lines, so the case is never empty), a
// framed wall panel printing the chapter's verified lines (place.panel.factIds, the facts' own text
// from facts.generated.json, each id beneath its line), and the guide beside the case. The visitor
// arrives with a short glide in from the gallery door and can then walk the gallery like a rebuilt
// room (room/RoomControls.jsx); objects open in the artifact viewer.
// Units: metres. Page images are the holders' scans named by the artifact records.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { StageSuspense } from '../stageLoading.jsx'
import { useScopedGLTF, useScopedTexture } from '../../shared/loadHooks.js'
import { useRecordDraw } from '../recordDraws.js'
import { versioned } from '../../shared/assetVersion.js'
import * as THREE from 'three'
import { Hotspot } from '../room/Hotspot.jsx'
import { RoomControls } from '../room/RoomControls.jsx'
import { RoomGuide } from '../room/RoomGuide.jsx'
import { screenBox } from '../room/guideFrame.js'
import INDEX from '../data/facts.generated.json'
import { BED, CASE, PANEL, STAND, TOP, galleryLayout } from './galleryLayout.js'
import { useTextCard } from './textCard.js'

const ROOM = { w: 9, d: 12, h: 3.8 }

// Walking: the rebuilt rooms' camera rig, so the controls are the same everywhere: desktop drag to
// look, W A S D / arrows and click the floor to walk, inside the gallery's bounds and around the
// case and the guide; phones look around and glide to the stops. The visitor's eye is at 1.6 m.
const GUIDE_AT = { desktop: [-1.3, 0, -0.1], phone: [-1.0, 0, 0.05] }
const GALLERY = {
  desktop: { door: [0.3, 9.2], start: { pos: [-0.1, 1.6, 2.8], look: [-0.15, 1.05, -1.0] } },
  phone: { door: [0.2, 10], start: { pos: [-0.17, 1.6, 5.1], look: [-0.15, 1.2, -0.6] } },
}

function galleryRoom(dev, glide, layout) {
  const g = GALLERY[dev]
  const guide = GUIDE_AT[dev]
  // her footprint (RoomGuide moves it with her)
  const guideObstacle = [guide[0] - 0.22, guide[2] - 0.22, guide[0] + 0.22, guide[2] + 0.22]
  const pose = ([pos, look]) => ({ pose: { pos, look }, stand: [g.start.pos[0], g.start.pos[2]] })
  // (Step back returns to the start view: the effect below)
  const views = Object.fromEntries(Object.entries(layout.views[dev]).map(([id, v]) => [id, pose(v)]))
  return {
    id: 'gallery-case',
    bounds: { min: [-ROOM.w / 2 + 0.3, 0, PANEL.z + 0.35], max: [ROOM.w / 2 - 0.3, ROOM.h, 6.5] },
    shell: { min: [-ROOM.w / 2, 0, PANEL.z], max: [ROOM.w / 2, ROOM.h, 11] },
    // the case and the guide's spot
    obstacles: [[-CASE.w / 2, CASE.z - CASE.d / 2, CASE.w / 2, CASE.z + CASE.d / 2], guideObstacle],
    guideObstacle,
    start: glide ? { pos: [g.door[0], 1.6, g.door[1]], look: g.start.look } : g.start,
    views,
  }
}

// ---------- the printed cards (textCard.js, drawn once the gallery fonts are loaded) ----------
const PANEL_FOOTER = 'Each line is the text of a verified fact; its id is printed beneath it.'
// the chapter's verified lines (place.panel.factIds: the facts' own text, each id beneath its line)
const panelLines = (panel) => (panel?.factIds || []).map((id) => ({ factId: id, text: INDEX.facts[id]?.claim })).filter((l) => l.text)

// a card in the case: the chapter's lines when the case has no record (caseCard), or a link-only
// record's label (its title and "View at the holder"; never an image)
function CaseCard({ spec, w, h, position, rotation, stopId = null, media = null }) {
  const tex = useTextCard(spec)
  const ref = useRef()
  useRecordDraw(stopId, media, null, ref, 'card') // dev only (recordDraws.js): a link-only record's label
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.003]} receiveShadow>
        <boxGeometry args={[w + 0.03, h + 0.03, 0.004]} />
        <meshStandardMaterial color="#2b2119" roughness={0.7} />
      </mesh>
      <mesh receiveShadow>
        <planeGeometry args={[w, h]} />
        {tex ? <meshStandardMaterial key="card" map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.9} /> : <meshStandardMaterial key="blank" color="#16120e" />}
      </mesh>
    </group>
  )
}

// ---------- the gallery ----------
function floorTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#1b1510'
  g.fillRect(0, 0, 512, 512)
  // long boards, a faint grain
  for (let i = 0; i < 8; i++) {
    g.fillStyle = `rgba(${40 + (i % 3) * 6}, ${30 + (i % 2) * 4}, 22, 0.55)`
    g.fillRect(0, i * 64, 512, 62)
    g.fillStyle = 'rgba(0,0,0,0.5)'
    g.fillRect(0, i * 64 + 62, 512, 2)
  }
  for (let k = 0; k < 900; k++) {
    g.fillStyle = `rgba(255, 220, 180, ${Math.random() * 0.025})`
    g.fillRect(Math.random() * 512, Math.random() * 512, 40 + Math.random() * 120, 1)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 4)
  t.anisotropy = 8
  return t
}

// one page at height h (narrower than maxW), its width from the scan's own aspect
function Page({ src, h, maxW = Infinity, position, rotation, stopId, media }) {
  const tex = useScopedTexture(src)
  const ref = useRef()
  useRecordDraw(stopId, media, src, ref) // dev only (recordDraws.js): this page of the stop's record
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const aspect = tex.image ? tex.image.width / tex.image.height : 0.7
  const w = Math.min(h * aspect, maxW)
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[w, w / aspect]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  )
}

// a labelled recreation (a model record) standing in its slot on a low riser over the bed: scaled
// to fit the slot, its base on the riser, centred on the slot
function CaseModel({ src, fitW, fitD, x, stopId, media }) {
  const { scene } = useScopedGLTF(versioned(src))
  const ref = useRef()
  useRecordDraw(stopId, media, versioned(src), ref, 'model') // dev only (recordDraws.js): the recreation itself
  const obj = useMemo(() => {
    const o = scene.clone(true)
    const box = new THREE.Box3().setFromObject(o)
    const size = box.getSize(new THREE.Vector3())
    const k = Math.min(fitW / Math.max(1e-6, size.x), fitD / Math.max(1e-6, size.z), 0.22 / Math.max(1e-6, size.y))
    o.scale.setScalar(k)
    const c = box.getCenter(new THREE.Vector3())
    o.position.set(-c.x * k, -box.min.y * k, -c.z * k)
    o.traverse((m) => {
      if (m.isMesh) m.castShadow = m.receiveShadow = true
    })
    return o
  }, [scene, fitW, fitD])
  return (
    <group position={[x, BED.y + 0.05, 0.02]}>
      <mesh position={[0, -0.012, 0]} receiveShadow castShadow>
        <boxGeometry args={[fitW, 0.024, fitD * 0.7]} />
        <meshStandardMaterial color="#2a2019" roughness={0.9} />
      </mesh>
      <primitive ref={ref} object={obj} />
    </group>
  )
}

export function GalleryCaseStage({ chapter, phone, reduced, focus, seen = [], onPick, pointAt, nod, onReady, glide, controlsRef, started = true }) {
  const dev = phone ? 'phone' : 'desktop'
  const layout = useMemo(() => galleryLayout(chapter.stops), [chapter])
  const room = useMemo(() => galleryRoom(dev, glide, layout), [dev, glide, layout])
  const floorRef = useRef()
  const anchor = useMemo(() => new THREE.Object3D(), [])
  const index = (id) => chapter.stops.findIndex((s) => s.id === id) + 1
  const name = (id) => chapter.stops.find((s) => s.id === id)?.name
  const mediaOf = (id) => chapter.stops.find((s) => s.id === id)?.art?.id || null

  // the glide in from the gallery door, once the rig is in place and the tour has begun; the guide takes
  // her place once the visitor has arrived at the start view (her home view)
  const [arrived, setArrived] = useState(!glide)
  useEffect(() => {
    if (!glide || !started) return
    let live = true
    const s = GALLERY[dev].start
    const t = setTimeout(() => {
      const p = controlsRef.current?.walkTo(s.pos[0], s.pos[2], s.look)
      Promise.resolve(p).then(() => live && setArrived(true))
    }, 400)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [dev, glide, started, controlsRef])

  // a stop moves the camera to its pose; leaving it walks back to the gallery's start view (round 9, as
  // in a room: the view the guide has her spot in)
  const last = useRef(null)
  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    if (focus && room.views[focus]) {
      last.current = focus
      c.focus(anchor, room.views[focus])
    } else if (!focus && last.current) {
      last.current = null
      const s = GALLERY[dev].start
      if (c.mode === 'focus') c.walkTo(s.pos[0], s.pos[2], s.look)
    }
  }, [focus, room, anchor, controlsRef, dev])

  const floor = useMemo(floorTexture, [])
  // spotlight targets must be in the scene for their world matrices to update
  const targets = useMemo(() => ({ case: new THREE.Object3D(), panel: new THREE.Object3D(), guide: new THREE.Object3D() }), [])
  const p = chapter.place.panel
  const panelSpec = useMemo(() => (p ? { w: PANEL.w, h: PANEL.h, eyebrow: p.eyebrow, title: p.title, lines: panelLines(p), footer: PANEL_FOOTER } : null), [p])
  const panel = useTextCard(panelSpec)
  // no record in the case: the same lines, printed on a card that lies in it
  const caseSpec = useMemo(() => (layout.caseCard && p ? { w: layout.caseCard.w, h: layout.caseCard.h, eyebrow: p.eyebrow, title: p.title, lines: panelLines(p), scale: 1.25, fit: true } : null), [layout, p])
  const linkSpecs = useMemo(() => Object.fromEntries(layout.bed.filter((b) => b.card).map((b) => [b.id, { w: b.card.w, h: b.card.h, eyebrow: 'Link only', title: b.card.title, lines: [{ text: 'View at the holder (the record card has the link)' }], scale: 1.4, columns: 1, fit: true }])), [layout])

  useEffect(() => {
    const spots = {}
    for (const b of layout.bed) spots[b.id] = new THREE.Vector3(...b.spot)
    if (layout.stand) spots[layout.stand.id] = new THREE.Vector3(...layout.stand.spot)
    if (layout.panel) spots[layout.panel.id] = new THREE.Vector3(...layout.panel.spot)
    onReady?.({ spots })
  }, [onReady, layout])

  const guideAt = GUIDE_AT[dev]
  const [bx0, bx1] = layout.bedSpan
  // what the visitor looks at for each stop (galleryLayout boxes), for the guide and the e2e checks
  const boxes = useMemo(() => {
    const out = {}
    for (const e of [...layout.bed, layout.stand, layout.panel].filter(Boolean)) out[e.id] = new THREE.Box3(new THREE.Vector3(...e.box.min), new THREE.Vector3(...e.box.max))
    return out
  }, [layout])
  const focusRef = useRef(focus)
  focusRef.current = focus
  const focusBox = useCallback(() => boxes[focusRef.current] || null, [boxes])
  // the stops' numbered badges: she keeps her upper body clear of them (round 9 fix round 1)
  const badgePoints = useCallback(() => {
    const out = layout.bed.map((b) => b.ring)
    if (layout.stand) out.push(layout.stand.ring)
    if (layout.panel) out.push(layout.panel.ring)
    return out.map((r) => (Array.isArray(r) ? r : r.toArray()))
  }, [layout])
  const attention = useMemo(() => (focus && boxes[focus] ? boxes[focus].getCenter(new THREE.Vector3()) : null), [focus, boxes])
  const occluder = useRef()
  const three = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__stageFocus = {
      box: (id) => (boxes[id] ? screenBox(boxes[id], three.camera, three.size) : null),
      // the guide stands behind the stop's slot (beyond the case): farther from the eye than all of it
      behind: (id) => {
        const b = boxes[id]
        const g = window.__guideRoots?.size ? [...window.__guideRoots][0] : null
        if (!b || !g) return false
        const at = g.getWorldPosition(new THREE.Vector3())
        const eye = three.camera.position
        const corners = [b.min.x, b.max.x].flatMap((x) => [b.min.z, b.max.z].map((z) => Math.hypot(x - eye.x, z - eye.z)))
        return Math.hypot(at.x - eye.x, at.z - eye.z) > Math.max(...corners) + 0.25
      },
    }
    return () => {
      window.__stageFocus = null
    }
  }, [boxes, three.camera, three.size])

  return (
    <>
      <color attach="background" args={['#0b0907']} />
      <fog attach="fog" args={['#0b0907', 7, 15]} />
      <hemisphereLight args={['#ffe6c4', '#1a120c', 0.36]} />
      {/* the case light: a soft cone from the ceiling */}
      <primitive object={targets.case} position={[0, CASE.h, 0]} />
      <primitive object={targets.panel} position={[0, PANEL.y - 0.1, PANEL.z]} />
      <spotLight position={[0.3, ROOM.h - 0.1, 0.9]} target={targets.case} angle={0.42} penumbra={0.75} intensity={13} distance={9} decay={1.6} color="#ffe2b8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      {/* the wall wash on the panel */}
      <spotLight position={[0, ROOM.h - 0.1, PANEL.z + 1.4]} target={targets.panel} angle={0.7} penumbra={0.9} intensity={16} distance={8} decay={1.6} color="#ffdcb0" />
      {/* two dim washes on the side walls, so the room reads */}
      <pointLight position={[-ROOM.w / 2 + 0.6, 2.8, -1.5]} intensity={1.6} distance={5} color="#ffcf9a" />
      <pointLight position={[ROOM.w / 2 - 0.6, 2.8, -1.5]} intensity={1.6} distance={5} color="#ffcf9a" />
      {/* the guide's own light: a soft spot from the front right on her face and upper body, and a
          low fill so her clothes and hands read against the dark wall */}
      <primitive object={targets.guide} position={[guideAt[0], 1.35, guideAt[2]]} />
      <spotLight position={[guideAt[0] + 1.1, 2.6, guideAt[2] + 2.0]} target={targets.guide} angle={0.5} penumbra={0.85} intensity={14} distance={6} decay={1.4} color="#ffe2bf" />
      <pointLight position={[guideAt[0] + 0.5, 1.1, guideAt[2] + 1.3]} intensity={1.6} distance={3.5} color="#ffd9a8" />

      {/* everything that can stand between the visitor and the guide (RoomGuide ray-casts it) */}
      <group ref={occluder}>
        {/* room shell */}
        <mesh
          ref={floorRef}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          onClick={(e) => {
            // click the floor to walk there (desktop); only when the floor is what was clicked
            if (e.delta > 6 || e.intersections[0]?.object !== floorRef.current) return
            controlsRef.current?.walkOnFloor(e.point)
          }}
        >
          <planeGeometry args={[ROOM.w, ROOM.d * 2]} />
          <meshStandardMaterial map={floor} roughness={0.42} metalness={0.05} color="#a08a76" />
        </mesh>
        <mesh position={[0, ROOM.h / 2, PANEL.z - 0.02]} receiveShadow>
          <planeGeometry args={[ROOM.w, ROOM.h]} />
          <meshStandardMaterial color="#1f1c19" roughness={0.95} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[(s * ROOM.w) / 2, ROOM.h / 2, 0]} rotation={[0, (-s * Math.PI) / 2, 0]} receiveShadow>
            <planeGeometry args={[ROOM.d * 2, ROOM.h]} />
            <meshStandardMaterial color="#1a1816" roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, ROOM.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM.w, ROOM.d * 2]} />
          <meshStandardMaterial color="#0e0c0a" roughness={1} />
        </mesh>

        {/* the wall panel, framed */}
        {chapter.place.panel && (
          <group position={[0, PANEL.y, PANEL.z + 0.03]}>
            <mesh position={[0, 0, -0.012]}>
              <boxGeometry args={[PANEL.w + 0.08, PANEL.h + 0.08, 0.03]} />
              <meshStandardMaterial color="#2b2119" roughness={0.6} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.005]}>
              <planeGeometry args={[PANEL.w, PANEL.h]} />
              {/* a lit label: the text reads at any distance; the frame and the wall take the light */}
              {panel ? <meshStandardMaterial key="panel" map={panel} emissiveMap={panel} emissive="#ffffff" emissiveIntensity={0.62} roughness={0.85} /> : <meshStandardMaterial key="blank" color="#16120e" />}
            </mesh>
          </group>
        )}

        {/* the case: plinth, a felt bed, a glass hood with dark edges */}
        <group position={[0, 0, CASE.z]}>
          <mesh position={[0, CASE.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[CASE.w, CASE.h, CASE.d]} />
            <meshStandardMaterial color="#251c15" roughness={0.55} metalness={0.05} />
          </mesh>
          <mesh position={[0, CASE.h + 0.004, 0]} receiveShadow>
            <boxGeometry args={[CASE.w - 0.08, 0.04, CASE.d - 0.08]} />
            <meshStandardMaterial color="#3a2c22" roughness={1} />
          </mesh>
          <mesh position={[0, CASE.h + 0.025 + 0.24, 0]}>
            <boxGeometry args={[CASE.w - 0.02, 0.48, CASE.d - 0.02]} />
            <meshPhysicalMaterial color="#e8f0f0" transparent opacity={0.07} roughness={0.05} metalness={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <lineSegments position={[0, CASE.h + 0.025 + 0.24, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(CASE.w - 0.02, 0.48, CASE.d - 0.02)]} />
            <lineBasicMaterial color="#6b5a48" transparent opacity={0.7} />
          </lineSegments>
        </group>

        {/* the objects fanned on a bed sloped toward the visitor */}
        {(layout.bed.length > 0 || layout.caseCard) && (
          <group position={[0, BED.y, 0]} rotation={[BED.tilt, 0, 0]}>
            <mesh position={[(bx0 + bx1) / 2, 0, 0]} receiveShadow>
              <boxGeometry args={[bx1 - bx0, 0.02, BED.depth]} />
              <meshStandardMaterial color="#3d2f25" roughness={1} />
            </mesh>
            {layout.bed.flatMap((b) => b.pages.map((pg) => <Page key={`${b.id}-${pg.src}`} stopId={b.id} media={mediaOf(b.id)} src={pg.src} h={pg.h} maxW={pg.maxW} position={[pg.x, pg.y, pg.z]} rotation={[-Math.PI / 2, 0, pg.rot]} />))}
            {layout.bed
              .filter((b) => b.card)
              .map((b) => (
                <CaseCard key={b.id} stopId={b.id} media={mediaOf(b.id)} spec={linkSpecs[b.id]} w={b.card.w} h={b.card.h} position={[b.card.x, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]} />
              ))}
            {layout.caseCard && caseSpec && <CaseCard spec={caseSpec} w={layout.caseCard.w} h={layout.caseCard.h} position={[layout.caseCard.x, layout.caseCard.y, layout.caseCard.z]} rotation={[-Math.PI / 2, 0, 0]} />}
          </group>
        )}
        {/* a recreation stands in its own slot */}
        {layout.bed
          .filter((b) => b.model)
          .map((b) => (
            <StageSuspense key={b.id} what={`the recreation ${b.id}`}>
              <CaseModel stopId={b.id} media={mediaOf(b.id)} src={b.model.src} fitW={b.model.fitW} fitD={b.model.fitD} x={b.x} />
            </StageSuspense>
          ))}
        {/* the first sheet upright on a small dark stand */}
        {layout.stand?.src && (
          <group position={layout.stand.position} rotation={STAND.rotation}>
            <Page stopId={layout.stand.id} media={mediaOf(layout.stand.id)} src={layout.stand.src} h={STAND.pageH} position={[0, 0, 0.004]} rotation={[0, 0, 0]} />
            <mesh position={[0, 0, -0.004]} castShadow>
              <boxGeometry args={[STAND.backW, STAND.backH, 0.006]} />
              <meshStandardMaterial color="#14100c" roughness={0.6} />
            </mesh>
          </group>
        )}
      </group>

      {layout.bed.map((b) => (
        <Hotspot key={b.id} index={index(b.id)} label={name(b.id)} position={b.ring} glowAt={b.glowAt} glowSize={b.glowSize} glowStrength={0.4} seen={seen.includes(b.id)} active={focus === b.id} reduced={reduced} onSelect={() => onPick(b.id)} />
      ))}
      {layout.stand && (
        <Hotspot index={index(layout.stand.id)} label={name(layout.stand.id)} position={layout.stand.ring} glowAt={layout.stand.position} glowSize={0.55} glowStrength={0.4} seen={seen.includes(layout.stand.id)} active={focus === layout.stand.id} reduced={reduced} onSelect={() => onPick(layout.stand.id)} />
      )}
      {layout.panel && (
        <Hotspot index={index(layout.panel.id)} label={name(layout.panel.id)} position={layout.panel.ring} glowAt={layout.panel.glowAt} glowSize={0.01} glowStrength={0} seen={seen.includes(layout.panel.id)} active={focus === layout.panel.id} reduced={reduced} onSelect={() => onPick(layout.panel.id)} />
      )}

      <RoomControls ref={controlsRef} room={room} phone={phone} reduced={reduced} />

      <RoomGuide
        room={room}
        badges={badgePoints}
        ready={arrived}
        prefer={guideAt}
        obstacle={room.guideObstacle}
        occluder={occluder}
        focusBox={focusBox}
        attention={attention}
        phone={phone}
        reduced={reduced}
        pointAt={pointAt}
        lookAtTarget={attention}
        nodKey={nod}
      />
    </>
  )
}

export default GalleryCaseStage
