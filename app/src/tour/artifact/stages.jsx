// The viewer's stages, one per artifact kind (data/README.md):
//   SheetStage  letter (folded sheet you unfold), sheet (front and back you turn over), document
//               (pages you turn through); drag turns the sheet all the way round
//   PhotoStage  photo / photoset: a photograph, or a set of views (front, back, detail) stepped
//               through like a turntable (drag sideways or the view chips)
//   ModelStage  model: a glTF object (meshopt / Draco compressed, loaded only when opened) you
//               orbit 360 degrees and zoom, with numbered notes pinned to points on it
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PresentationControls, ContactShadows, OrbitControls, Bounds, useBounds } from '@react-three/drei'
import { BoundedLoad } from '../../shared/assetLoads.jsx'
import { LOAD_TIMEOUT_MS, useScopedGLTF, useScopedTexture } from '../../shared/loadHooks.js'
import { viewerScope } from '../../shared/loadScope.js'
import { versioned } from '../../shared/assetVersion.js'
import * as THREE from 'three'
import { dprNow } from '../../shared/dpr.js'
import gsap from 'gsap'
import { clampPan, panRange, zoomFor, MODEL_ZOOM, fitDistance, zoomPress, zoomReady, sheetFitDistance } from './pan.js'

// every viewer's pages and models load through viewerScope (shared/loadScope.js): bounded, aborted
// and evicted on a failure, so Try again starts afresh

const SCALE = 3.4 // metres -> scene units, so a letter-size sheet reads well at fov 30

// ---------- sheets ----------

function bandGeometry(w, h, v0, frac) {
  const g = new THREE.PlaneGeometry(w, h)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setY(i, v0 + uv.getY(i) * frac)
  return g
}

function useTex(src) {
  const tex = useScopedTexture(src)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const PAPER = '#efe6d2'

// A sheet in `folds` equal bands (1 = flat, 2 = folded in half, 3 = letter tri-fold). Open: flat.
// Closed: the top band folds over the front, then (tri-fold) the bottom band under it.
function Sheet({ page, folds = 1, open = true, flipped = false, reduced }) {
  const face = useTex(page.src)
  const backTex = page.back ? useTex(page.back) : null // eslint-disable-line react-hooks/rules-of-hooks
  const [mw, mh] = page.sizeM || [0.2159, 0.2794]
  const w = mw * SCALE
  const n = Math.max(1, Math.min(3, folds))
  const bh = (mh * SCALE) / n
  const geos = useMemo(() => {
    // band 0 is the top of the sheet; the back of each band shows the same band of the back scan
    // (or plain paper), seen from behind
    const band = (i) => bandGeometry(w, bh, (n - 1 - i) / n, 1 / n)
    return { front: [...Array(n)].map((_, i) => band(i)), back: [...Array(n)].map((_, i) => band(i)) }
  }, [w, bh, n])
  const top = useRef()
  const bot = useRef()
  const turn = useRef()
  const closedTop = Math.PI * 0.96
  const closedBot = -Math.PI * 0.985

  useEffect(() => {
    if (n === 1) return
    const tl = gsap.timeline()
    const d = reduced ? 0 : 0.85
    const lap = reduced ? 0 : '-=0.35'
    if (open) {
      tl.to(top.current.rotation, { x: 0, duration: d, ease: 'power2.inOut' })
      if (bot.current) tl.to(bot.current.rotation, { x: 0, duration: d, ease: 'power2.inOut' }, lap)
    } else {
      if (bot.current) tl.to(bot.current.rotation, { x: closedBot, duration: d, ease: 'power2.inOut' })
      tl.to(top.current.rotation, { x: closedTop, duration: d, ease: 'power2.inOut' }, bot.current ? lap : 0)
    }
    return () => tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced, n])

  useEffect(() => {
    const t = gsap.to(turn.current.rotation, { y: flipped ? Math.PI : 0, duration: reduced ? 0 : 0.8, ease: 'power2.inOut' })
    return () => t.kill()
  }, [flipped, reduced])

  const frontMat = <meshStandardMaterial map={face} roughness={0.92} side={THREE.FrontSide} />
  const backMat = backTex ? <meshStandardMaterial map={backTex} roughness={0.92} side={THREE.FrontSide} /> : <meshStandardMaterial color={PAPER} roughness={0.95} side={THREE.FrontSide} />
  // band i of the front pairs with the same band of the back, seen from behind (mirrored in x)
  const Band = ({ i }) => (
    <>
      <mesh geometry={geos.front[i]} castShadow>{frontMat}</mesh>
      <mesh geometry={geos.back[i]} rotation-y={Math.PI} castShadow>{backMat}</mesh>
    </>
  )
  const initTop = open ? 0 : closedTop
  const initBot = open ? 0 : closedBot
  return (
    <group ref={turn} name="viewer-sheet">
      {n === 1 && <Band i={0} />}
      {n === 2 && (
        <group position={[0, -bh / 2, 0]}>
          <Band i={1} />
          <group ref={top} position={[0, bh / 2, 0.0015]} rotation-x={initTop}>
            <group position={[0, bh / 2, 0]}>
              <Band i={0} />
            </group>
          </group>
        </group>
      )}
      {n === 3 && (
        <>
          <Band i={1} />
          <group ref={top} position={[0, bh / 2, 0.0015]} rotation-x={initTop}>
            <group position={[0, bh / 2, 0]}>
              <Band i={0} />
            </group>
          </group>
          <group ref={bot} position={[0, -bh / 2, 0.0008]} rotation-x={initBot}>
            <group position={[0, -bh / 2, 0]}>
              <Band i={2} />
            </group>
          </group>
        </>
      )}
    </group>
  )
}

// the turn the viewer first holds a sheet at (PresentationControls rotation: a little from above, a little from the side)
const SHEET_TURN = [0.05, -0.12]
// the room the stage keeps clear round a sheet (CSS px): at the sides, and at the top and bottom for the hint below it
// and, with more than one page, the pager over the stage's foot
const SHEET_RESERVE = { x: 12, y: 26, yPager: 80 }

// The camera stands back far enough that the whole sheet, open, is inside the stage (fix round 12, owner report: the
// top of a newspaper's scan was cut off in a 1000 x 570 window; the lens had been fixed at 2.2 units for every page and
// every stage). It moves again when the stage changes size or the page another size.
function FitSheet({ page, pages }) {
  const { camera, size, gl, scene } = useThree()
  const [mw, mh] = page.sizeM || [0.2159, 0.2794]
  const w = mw * SCALE
  const h = mh * SCALE
  useEffect(() => {
    const reserve = { x: SHEET_RESERVE.x, y: pages > 1 ? SHEET_RESERVE.yPager : SHEET_RESERVE.y }
    const d = sheetFitDistance({ w, h }, camera.fov, size.width, size.height, reserve, SHEET_TURN)
    camera.position.set(0, 0, d)
    camera.lookAt(0, 0, 0)
    camera.far = Math.max(camera.far, d * 4)
    camera.updateProjectionMatrix()
  }, [camera, size, w, h, pages])
  // dev only (e2e/viewer-fit.mjs): the sheet's corners on the page, CSS px
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__viewerScan = () => {
      const g = scene.getObjectByName('viewer-sheet')
      if (!g) return null
      g.updateWorldMatrix(true, true)
      const box = new THREE.Box3().setFromObject(g)
      const r = gl.domElement.getBoundingClientRect()
      const v = new THREE.Vector3()
      const xs = []
      const ys = []
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        v.set(x, y, z).project(camera)
        xs.push(r.left + ((v.x + 1) / 2) * r.width)
        ys.push(r.top + ((1 - v.y) / 2) * r.height)
      }
      return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) }
    }
    return () => {
      window.__viewerScan = null
    }
  }, [camera, gl, scene])
  return null
}

export function SheetStage({ art, state, reduced, load }) {
  const page = art.pages[state.page] || art.pages[0]
  const folds = art.kind === 'letter' ? art.folds || 3 : 1
  const sheetH = (page.sizeM || [0.2159, 0.2794])[1] * SCALE
  return (
    <Canvas shadows dpr={dprNow()} camera={{ position: [0, 0, 2.2], fov: 30 }} role="img" aria-label={`${art.title}, three-dimensional view. Drag to turn it.`}>
      <FitSheet page={page} pages={art.pages.length} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[1.5, 2.5, 3]} intensity={2.2} color="#fff3df" castShadow />
      <directionalLight position={[-2, 1, -2]} intensity={0.7} color="#ff9b2d" />
      <BoundedLoad scope={viewerScope} what="this page" load={load}>
        <PresentationControls key={state.page} global={false} cursor snap={false} speed={1.4} rotation={[0.05, -0.12, 0]} polar={[-0.5, 0.5]} azimuth={[-Infinity, Infinity]} damping={reduced ? 0.01 : 0.2}>
          <Sheet key={page.src} page={page} folds={folds} open={state.open} flipped={state.flipped} reduced={reduced} />
        </PresentationControls>
        <ContactShadows position={[0, -sheetH / 2 - 0.075, 0]} opacity={0.45} scale={Math.max(3, sheetH * 2)} blur={2.4} far={1.2} />
      </BoundedLoad>
    </Canvas>
  )
}

// ---------- photographs ----------

// a photograph is a plain <img>: its load and error events drive the viewer's status, a stall fails it
// after LOAD_TIMEOUT_MS, and a retry (the stage remounted with a new attempt) asks for a URL of its own,
// so the browser cannot hand back the stalled request
export function PhotoStage({ art, state, setState, load, attempt = 0 }) {
  const photos = art.photos || []
  const cur = photos[state.view] || photos[0]
  const drag = useRef(null)
  const img = useRef(null)
  const fig = useRef(null)
  const timer = useRef(null)
  const [dims, setDims] = useState(null) // { stage: {w, h}, picture: {w, h} } in CSS px, unzoomed
  const { onLoaded, onPending, onError } = load || {}
  useEffect(() => {
    if (!cur || (img.current?.complete && img.current.naturalWidth)) return void onLoaded?.()
    onPending?.()
    timer.current = setTimeout(() => onError?.(`photograph did not finish loading within ${LOAD_TIMEOUT_MS / 1000} s`), LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer.current)
  }, [cur, onLoaded, onPending, onError])
  // the stage's and the picture's layout sizes (offsetWidth ignores the zoom transform)
  const measure = () => {
    const f = fig.current
    const i = img.current
    if (!f || !i || !i.offsetWidth) return
    setDims({ stage: { w: f.clientWidth, h: f.clientHeight }, picture: { w: i.offsetWidth, h: i.offsetHeight } })
  }
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !fig.current) return
    const ro = new ResizeObserver(measure)
    ro.observe(fig.current)
    if (img.current) ro.observe(img.current)
    return () => ro.disconnect()
  }, [cur])
  const settle = (ok) => {
    clearTimeout(timer.current)
    if (ok) {
      measure()
      onLoaded?.()
    } else onError?.('photograph did not load')
  }
  const zoom = zoomFor(dims?.stage, dims?.picture)
  const range = dims ? panRange(dims.stage, dims.picture, zoom) : [0, 0]
  const pan = state.zoom ? state.pan || [0, 0] : [0, 0]
  const step = (d) => setState((s) => ({ ...s, view: (s.view + d + photos.length) % photos.length, pan: [0, 0] }))
  // zoomed: dragging pans the picture under the pointer (mouse or touch); a photo set otherwise
  // turns like a turntable: dragging sideways steps to the next view
  const onDown = (e) => {
    if (!state.zoom && photos.length < 2) return
    drag.current = { x: e.clientX, y: e.clientY, pan: pan.slice() }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    // no easing while the picture follows the pointer
    if (state.zoom) e.currentTarget.classList.add('is-panning')
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (state.zoom) {
      const next = [range[0] ? clampPan(d.pan[0] + dx / range[0]) : 0, range[1] ? clampPan(d.pan[1] + dy / range[1]) : 0]
      setState((s) => ({ ...s, pan: next }))
      return
    }
    if (Math.abs(dx) > 60) {
      step(dx < 0 ? 1 : -1)
      d.x = e.clientX
    }
  }
  const onUp = (e) => {
    drag.current = null
    e.currentTarget.classList.remove('is-panning')
  }
  if (!cur) return null
  const transform = state.zoom ? `translate(${(pan[0] * range[0]).toFixed(1)}px, ${(pan[1] * range[1]).toFixed(1)}px) scale(${zoom.toFixed(3)})` : undefined
  return (
    <figure
      ref={fig}
      className={`photo-stage ${state.zoom ? 'is-zoomed' : ''}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      data-pan={state.zoom ? pan.map((v) => v.toFixed(3)).join(',') : undefined}
    >
      <img
        key={cur.src}
        ref={img}
        src={attempt ? `${cur.src}${cur.src.includes('?') ? '&' : '?'}retry=${attempt}` : cur.src}
        alt={cur.alt || art.alt || art.title}
        className={state.zoom ? 'is-zoomed' : ''}
        style={transform ? { transform } : undefined}
        draggable="false"
        loading="lazy"
        decoding="async"
        onLoad={() => settle(true)}
        onError={() => settle(false)}
      />
      {photos.length > 1 && <figcaption className="photo-view-label">{cur.label}</figcaption>}
    </figure>
  )
}

// ---------- glTF objects ----------

function Fit({ children, resetKey }) {
  const api = useBounds()
  useEffect(() => {
    api.refresh().clip().fit()
  }, [api, resetKey])
  return children
}

// A numbered pin drawn in the scene (always on top); the card lists the same notes as buttons,
// the keyboard and screen-reader path. (drei <Html> pins unmount badly under React 19.)
const pinTex = new Map()
function pinTexture(n, on) {
  const k = `${n}${on ? 'on' : ''}`
  if (pinTex.has(k)) return pinTex.get(k)
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  g.fillStyle = on ? '#fef0d7' : '#ff9b2d'
  g.beginPath()
  g.arc(32, 32, 28, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#1a1209'
  g.font = '600 30px Poppins, system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(String(n), 32, 34)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  pinTex.set(k, t)
  return t
}

function NotePin({ n, position, on, onClick }) {
  const ref = useRef()
  // a constant size on screen whatever the zoom
  useFrame(({ camera }) => {
    if (!ref.current) return
    const d = camera.position.distanceTo(ref.current.getWorldPosition(new THREE.Vector3()))
    ref.current.scale.setScalar(d * 0.045)
  })
  return (
    <sprite
      ref={ref}
      position={position}
      renderOrder={10}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <spriteMaterial map={pinTexture(n, on)} depthTest={false} transparent toneMapped={false} />
    </sprite>
  )
}

function ModelInner({ model, onNote, active, resetKey }) {
  // meshopt-compressed files decode in the browser; Draco decoders load only when a file needs them
  const gltf = useScopedGLTF(versioned(model.src))
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  return (
    <Bounds margin={1.25}>
      <Fit resetKey={resetKey}>
        <primitive object={scene} />
        {(model.notes || []).map((n, i) => (
          <NotePin key={i} n={i + 1} position={n.pos} on={active === i} onClick={() => onNote(i)} />
        ))}
      </Fit>
    </Bounds>
  )
}

// Zoom on a model (owner feedback round 9): the wheel, a pinch, the viewer's + and - buttons and keys
// all move the camera toward or away from the object, between limits set from the object's size
// (close enough to read a detail, never inside it; far enough to see it whole, never lost). A button
// press eases there (at once with reduced motion). The rig reports when a limit is reached, so the
// viewer can disable that button.
function ZoomRig({ cmd, reduced, onLimit }) {
  const { camera, controls, scene } = useThree()
  const st = useRef({ base: 0, goal: null, limit: null, queued: [] })
  useEffect(() => {
    const s = st.current
    // each press once (the effect also runs when the camera or the controls change)
    if (!cmd?.n || cmd.n === s.lastN) return
    s.lastN = cmd.n
    s.presses = (s.presses || 0) + 1
    // a press while it still moves goes on from where the last one was going; one made before the object is
    // sized (or the controls are up) waits (zoomPress) and is applied once it is (zoomReady, below)
    zoomPress(s, cmd.dir, controls && s.base ? camera.position.distanceTo(controls.target) : 0)
  }, [cmd, camera, controls])
  useFrame((_, dt) => {
    const s = st.current
    if (!controls) return
    // the whole-object distance, once the object is in
    if (!s.base) {
      const box = new THREE.Box3()
      scene.traverse((o) => o.isMesh && box.expandByObject(o))
      if (box.isEmpty()) return
      s.base = fitDistance(box.getSize(new THREE.Vector3()), camera.fov, camera.aspect)
      zoomReady(s, camera.position.distanceTo(controls.target))
    }
    controls.minDistance = s.base * MODEL_ZOOM.near
    controls.maxDistance = s.base * MODEL_ZOOM.far
    const off = camera.position.clone().sub(controls.target)
    let d = off.length()
    if (s.goal !== null) {
      d = reduced ? s.goal : d + (s.goal - d) * Math.min(1, dt * 10)
      if (Math.abs(d - s.goal) < 1e-3 * s.base) {
        d = s.goal
        s.goal = null
      }
      camera.position.copy(controls.target).addScaledVector(off.normalize(), d)
      controls.update()
    }
    const limit = d <= s.base * MODEL_ZOOM.near * 1.02 ? 'near' : d >= s.base * MODEL_ZOOM.far * 0.98 ? 'far' : null
    // dev only (e2e/chapters.mjs modelZoom): the camera's distance, the whole-object distance, the limit
    if (import.meta.env.DEV) window.__modelZoom = { d, base: s.base, limit, moving: s.goal !== null, presses: s.presses || 0 }
    if (limit !== s.limit) {
      s.limit = limit
      onLimit?.(limit)
    }
  })
  return null
}

export function ModelStage({ art, state, setState, reduced, load }) {
  const [touched, setTouched] = useState(false)
  const onLimit = useCallback((limit) => setState((s) => (s.zoomLimit === limit ? s : { ...s, zoomLimit: limit })), [setState])
  return (
    <Canvas dpr={dprNow()} camera={{ position: [0, 0.4, 3], fov: 30, near: 0.01, far: 100 }} role="img" aria-label={`${art.title}, three-dimensional object. Drag to turn it all the way round; scroll, pinch or use the zoom buttons to move closer.`}>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#fff3df', '#2a1e14', 0.8]} />
      <directionalLight position={[2, 3, 3]} intensity={2} color="#fff3df" />
      <directionalLight position={[-3, 1, -2]} intensity={0.6} color="#ff9b2d" />
      <BoundedLoad scope={viewerScope} what="this object" load={load}>
        <ModelInner model={art.model} active={state.note} resetKey={state.reset} onNote={(i) => setState((s) => ({ ...s, note: s.note === i ? null : i }))} />
      </BoundedLoad>
      <OrbitControls makeDefault enablePan={false} enableDamping={!reduced} enableZoom zoomToCursor={false} autoRotate={!reduced && !touched} autoRotateSpeed={0.6} onStart={() => setTouched(true)} />
      <ZoomRig cmd={state.zoomCmd} reduced={reduced} onLimit={onLimit} />
    </Canvas>
  )
}
