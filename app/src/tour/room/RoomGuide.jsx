// The guide in a walkable stage (a rebuilt room, the gallery case), owner feedback round 9: she stands
// fully in frame beside what the visitor looks at, and when the view settles somewhere she would be
// out of frame, hidden, or in front of the focus, she walks to a spot that works (guideFrame.js picks it)
// and turns to face it. While she stands she faces the visitor, or, while a stop is focused, mostly toward
// it (her head on it, guide/Guide.jsx).
// Fix round 12 (owner report: she jumped to her new spot in Gothenburg): she never jumps while she can be
// seen. When the camera starts a glide to a known view (a stop picked, Step back: RoomControls publishes it
// as camera.userData.glide), she finds her spot for the view the camera is going to and sets off at once,
// paced to arrive as the camera settles, never faster than a walk (WALK), when it is a short walk (FAR). She turns toward where she is
// going, walks (the procedural gait in Guide.jsx: the motion files hold no walk clip), then turns to face the
// stop or the visitor. Where the straight way is not clear (a wall, a seat row, a stage edge, furniture, the
// visitor), she fades out at her spot and fades in at the new one as the camera settles (FADE). Reduced
// motion: she is there at once. Her first spot in a room is taken at once, as the room comes in.
// Her footprint moves with her, so the visitor never walks through her (room.obstacles).
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Guide } from '../../shared/guide/Guide.jsx'
import { candidates, frameCheck, hudKeepOut, makeContext, solveNow, solveSpot, spotCheck } from './guideFrame.js'

const SETTLE = 0.35 // seconds the camera must hold still before she judges the view
const RECHECK = 1.5 // seconds between her checks of a still view
const BUDGET_MS = 4 // ray-cast time per frame while she looks for a spot
// her pace: a natural walk tops out about 1.2-1.4 m/s; she walks at most WALK, at least SLOW (a stroll), and
// starts later rather than creep when the camera's glide leaves her more time than a stroll needs
const WALK = 1.25 // m/s
const SLOW = 0.6 // m/s
const ACCEL = 2.2 // m/s^2, setting off
const DECEL = 1.6 // m/s^2, coming to a stop
const TURN_FIRST = 0.6 // metres: a longer walk starts with a turn toward where she goes (a shorter one is a step aside)
const TURN_OK = 0.45 // radians: facing this close to her way, she sets off
const TURN_TIME = 0.4 // seconds a turn before the walk takes, about (her pacing allows for it)
const FADE = 0.3 // seconds of a fade out or in, where the straight way is not clear
// metres: a spot farther than this (the visitor flew down a street or across a hall) she fades to; a walk there would
// keep the visitor waiting five seconds or more after the camera has settled (Lamarr's Graben: 22 m, 18 s)
const FAR = 6
const CLEAR_VISITOR = 0.55 // metres her way keeps from the visitor's eye (now and where the camera goes)
const CLEAR_FURNITURE = 0.12 // metres her way keeps from the room's furniture boxes
const FOOT = 0.22
const OPEN = (105 * Math.PI) / 180 // the most her body turns away from the visitor (about side-on)
const UP = new THREE.Vector3(0, 1, 0)

// ground cover (a meadow's grass and flowers) she stands in, rather than behind
export const GROUND_COVER = /grass|flower/i
// a mesh that can hide her: drawn, opaque enough to see, not a helper (hotspot glows, stop anchors), not
// the grass round her feet
function blocks(o) {
  if (!o.isMesh || o.userData.noOcclude || GROUND_COVER.test(o.name)) return false
  for (let p = o; p; p = p.parent) if (!p.visible) return false
  for (const m of [].concat(o.material)) {
    if (!m || m.colorWrite === false || m.visible === false) continue
    if (m.transparent && (m.opacity ?? 1) < 0.5) continue
    return true
  }
  return false
}

export function RoomGuide({ room, prefer, occluder, focusBox, badges = null, attention, phone, reduced, obstacle, ready = true, keyLight = true, ...guideProps }) {
  const { camera, size, gl } = useThree()
  const group = useRef()
  const light = useRef()
  const face = useMemo(() => new THREE.Vector3(), [])
  const motion = useMemo(() => ({ speed: 0 }), [])
  // her opacity: Guide.jsx calls update(dt) at the start of its frame and draws her at k that same frame
  const fade = useMemo(() => ({ k: 1, update: null }), [])
  // her body's facing (radians about her vertical), set every frame below and read by Guide.jsx
  const yawOf = useMemo(() => () => st.current?.yaw ?? 0, [])
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const st = useRef(null)
  if (!st.current) st.current = { pos: new THREE.Vector3(...(prefer || [0, 0, 0])), target: null, solver: null, ctx: null, cam: new THREE.Matrix4(), still: 0, judged: false, placed: false, speed: 0, why: null, meshes: null, move: null, yaw: null, glideN: 0, ahead: null, solverGlide: null, spot: null }

  // a new room (or a new preferred spot): start again from her spot there
  useEffect(() => {
    const s = st.current
    s.pos.set(...(prefer || [0, 0, 0]))
    s.target = null
    s.solver = null
    s.judged = false
    s.placed = false
    s.home = null
    s.meshes = null
    s.move = null
    s.ahead = null
    s.solverGlide = null
    s.spot = null
    s.speed = 0
    fade.k = 1
  }, [room, prefer, fade])
  // the room's model (and its records) came in: judge the view again with them
  useEffect(() => {
    st.current.judged = false
  }, [ready])

  // the room's geometry that can hide her, collected each time she judges a view
  const meshes = () => {
    const s = st.current
    if (!s.meshes && occluder.current) {
      s.meshes = []
      occluder.current.traverse((o) => blocks(o) && s.meshes.push(o))
    }
    return s.meshes || []
  }
  const raycast = (a, b) => {
    const dir = b.clone().sub(a)
    const len = dir.length()
    ray.set(a, dir.divideScalar(len))
    ray.near = 0.05
    ray.far = Math.max(0.06, len - 0.15)
    return ray.intersectObjects(meshes(), false).length > 0
  }
  // walkable ground at (x, z): the first surface under her facing up, and level with the ground a step
  // away all round (not a table top or a step's edge), within 1.3 m of the visitor's own ground
  const up = new THREE.Vector3()
  const groundAt = (x, z, top) => {
    ray.set(new THREE.Vector3(x, top, z), new THREE.Vector3(0, -1, 0))
    ray.near = 0
    ray.far = top + 2
    const h = ray.intersectObjects(meshes(), false)[0]
    if (!h?.face) return null
    up.copy(h.face.normal).transformDirection(h.object.matrixWorld)
    return up.y > 0.8 ? h.point.y : null
  }
  const floorAt = (x, z, eyeY = camera.position.y) => {
    const base = eyeY - 1.6
    const top = base + 2.2
    const y = groundAt(x, z, top)
    if (y == null || Math.abs(y - base) > 1.3) return null
    for (const [dx, dz] of [[0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) {
      const n = groundAt(x + dx, z + dz, top)
      if (n == null || Math.abs(n - y) > 0.25) return null
    }
    return y
  }

  // dev only: where she is and what she is doing (e2e/chapters.mjs waits for her to settle)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const s0 = st.current
    window.__guideDirector = {
      state: () => {
        const s = st.current
        return { walking: Boolean(s.target), solving: Boolean(s.solver), settled: s.judged && !s.solver && !s.target && !s.ahead, pos: s.pos.toArray(), spot: s.spot ? s.spot.toArray() : null, move: s.move?.kind || null, blocked: s.blocked || null, fade: fade.k, why: s.why }
      },
      // a spot for another view (pose tuning): { eye, look } and the focus box, with this room's rays
      trial: (eye, look, box) => {
        s0.meshes = null
        // the focus box as the live view gets it (arrays): a Box3 or { min, max } of vectors is converted
        const arr = (v) => (Array.isArray(v) ? v : [v.x, v.y, v.z])
        const focus = box ? { min: arr(box.min), max: arr(box.max), wide: Boolean(box.wide) } : null
        const ctx = makeContext({ view: { eye, look, fov: camera.fov, aspect: size.width / Math.max(1, size.height) }, focus, room: { bounds: room.bounds, obstacles: (room.obstacles || []).filter((o) => o !== obstacle) }, phone, keepOut: hudKeepOut(gl.domElement), raycast, floorAt, badges: badges?.(), size })
        const r = solveNow(ctx, { prefer })
        // a pose search wants a view with a strict spot for her (the relaxed pass is a fallback)
        return r && !r.relaxed ? r.at.toArray() : null
      },
      blocked: (a, b) => {
        s0.meshes = null
        return raycast(new THREE.Vector3(...a), new THREE.Vector3(...b))
      },
      // the last view's best candidates and why each failed (for tuning a room)
      explain: (n = 12) => {
        const s = st.current
        if (!s.ctx) return null
        const why = {}
        const c = candidates(s.ctx, { from: s.pos.toArray(), prefer, why })
        const p = prefer ? frameCheck(new THREE.Vector3(prefer[0], s.ctx.floorY, prefer[2]), s.ctx) : null
        s.meshes = null
        const pr = prefer ? spotCheck(new THREE.Vector3(prefer[0], s.ctx.floorY, prefer[2]), { ...s.ctx, relaxed: true }) : null
        const h = frameCheck(s.pos.clone(), s.ctx)
        return { count: c.length, why, here: { ok: h.ok, why: h.why, rect: h.rect }, prefer: p && { ok: p.ok, why: p.why, rect: p.rect }, preferRelaxed: pr && { ok: pr.ok, why: pr.why }, keepOut: s.ctx.keepOut, focus: s.ctx.focus, top: c.slice(0, n).map((x) => ({ at: x.at.toArray().map((v) => +v.toFixed(2)), score: +x.score.toFixed(3), why: spotCheck(x.at.clone(), s.ctx).why || 'ok' })) }
      },
    }
    return () => {
      window.__guideDirector = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefer, camera, size, room, phone, obstacle, gl])

  const tmp = useMemo(() => ({ dir: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }), [])

  // the context for a view ({ eye, look } arrays): her spot is judged against it
  const contextFor = (eye, look) => {
    const box = focusBox?.() || null
    const r = { bounds: room.bounds, obstacles: (room.obstacles || []).filter((o) => o !== obstacle) }
    // the HUD as it is on the page now (its panels move with the screen and the chapter's end choices)
    const keepOut = hudKeepOut(gl.domElement)
    const eyeY = eye[1]
    return { box, ctx: makeContext({ view: { eye, look, fov: camera.fov, aspect: size.width / Math.max(1, size.height) }, focus: box ? { min: box.min.toArray(), max: box.max.toArray(), wide: Boolean(box.wide) } : null, room: r, phone, keepOut, raycast, floorAt: (x, z) => floorAt(x, z, eyeY), badges: badges?.(), size }) }
  }

  // Is the straight way from a to b clear for her to walk (null), or what is in the way? Not through the room's geometry (rays at her knees,
  // waist and head, and at her waist's two sides), not over a gap, a step or a table (the ground under the way,
  // every 0.4 m, level with the line between her two spots), not through the room's furniture boxes, and not
  // through the visitor (the eye now, and where the camera is going).
  const clearWay = (a, b, eyes) => {
    const dx = b.x - a.x
    const dz = b.z - a.z
    const len = Math.hypot(dx, dz)
    if (len < 1e-3) return null
    const side = tmp.c.set(-dz / len, 0, dx / len)
    s0().meshes = null
    for (const [h, o] of [[0.3, 0], [0.95, 0], [1.6, 0], [0.95, 0.2], [0.95, -0.2]]) {
      const p = new THREE.Vector3(a.x, a.y + h, a.z).addScaledVector(side, o)
      const q = new THREE.Vector3(b.x, b.y + h, b.z).addScaledVector(side, o)
      if (raycast(p, q)) return `the room at ${h} m`
    }
    for (let d = 0.4; d < len - 0.2; d += 0.4) {
      const k = d / len
      const y = a.y + (b.y - a.y) * k
      const g = groundAt(a.x + dx * k, a.z + dz * k, y + 1.2)
      if (g == null || Math.abs(g - y) > 0.2) return g == null ? 'no ground' : `a step of ${(g - y).toFixed(2)} m`
    }
    // the segment against a box (slab test, in the floor plane)
    const crosses = ([ax, az, bx, bz], m) => {
      let t0 = 0
      let t1 = 1
      for (const [p, d, lo, hi] of [[a.x, dx, ax - m, bx + m], [a.z, dz, az - m, bz + m]]) {
        if (Math.abs(d) < 1e-9) {
          if (p < lo || p > hi) return false
          continue
        }
        let u = (lo - p) / d
        let v = (hi - p) / d
        if (u > v) [u, v] = [v, u]
        t0 = Math.max(t0, u)
        t1 = Math.min(t1, v)
        if (t0 > t1) return false
      }
      return true
    }
    for (const o of room.obstacles || []) if (o !== obstacle && crosses(o, CLEAR_FURNITURE)) return 'furniture'
    for (const e of eyes) {
      if (!e) continue
      const k = THREE.MathUtils.clamp(((e[0] - a.x) * dx + (e[2] - a.z) * dz) / (len * len), 0, 1)
      if (Math.hypot(a.x + dx * k - e[0], a.z + dz * k - e[2]) < CLEAR_VISITOR) return 'the visitor'
    }
    return null
  }
  const s0 = () => st.current

  // the time a walk of `d` metres takes at cruise speed v (setting off and stopping included)
  const walkTime = (d, v) => {
    const ramp = v / (2 * ACCEL) + v / (2 * DECEL)
    if (d >= v * ramp) return d / v + ramp
    // too short to reach v: up and straight down again
    const peak = Math.sqrt((2 * d * ACCEL * DECEL) / (ACCEL + DECEL))
    return peak / ACCEL + peak / DECEL
  }
  // what is left of the camera's glide, in seconds (0: none, or it has landed)
  const glideLeft = (g) => (g && g.t < 1 ? (1 - g.t) * g.secs : 0)

  // She goes to `at`: walks there (paced by the camera's glide `g`, when there is one), or, where the straight
  // way is not clear, fades out here and in there. Reduced motion, or a step too small to see: at once.
  const goTo = (at, g = null) => {
    const s = st.current
    s.spot = at.clone()
    const dist = Math.hypot(at.x - s.pos.x, at.z - s.pos.z)
    // sent back to where she is while fading: she fades back in there (never a pop to fully seen)
    // (her spot stays where she is: within 5 cm is the same spot, as for a step too small to see below)
    if (!reduced && dist <= 0.05 && s.move?.kind === 'fade') {
      s.spot = s.pos.clone()
      s.target = s.pos.clone()
      s.move.phase = 'in'
      s.move.glide = null
      return
    }
    if (reduced) {
      s.pos.copy(at)
      s.target = null
      s.move = null
      s.speed = 0
      fade.k = 1
      return
    }
    // a step too small to see (within 5 cm): she stays where she is, and that is her spot (a walk under way stops)
    if (dist <= 0.05) {
      s.spot = s.pos.clone()
      s.target = null
      s.move = null
      s.speed = 0
      return
    }
    s.target = at.clone()
    // already faded out (or fading): she stays out of sight and comes back in at the new spot; fading in somewhere else,
    // she fades out again first
    if (s.move?.kind === 'fade') {
      s.move.glide = g
      if (s.move.phase === 'in') {
        s.move.phase = 'out'
        s.move.gone = 0
      }
      return
    }
    const eyes = [camera.position.toArray(), g?.pos || null]
    s.blocked = dist > FAR ? `farther than ${FAR} m` : clearWay(s.pos, at, eyes)
    if (s.blocked) {
      s.move = { kind: 'fade', phase: 'out', glide: g }
      s.speed = 0
      return
    }
    // her pace: arrive as the camera settles (no faster than WALK, no slower than SLOW: then she sets off later)
    const turn = dist > TURN_FIRST && s.speed < 0.2
    const T = Math.max(0, glideLeft(g) - (turn ? TURN_TIME : 0))
    let v = WALK
    let delay = 0
    if (T > 0) {
      const k = 1 / (2 * ACCEL) + 1 / (2 * DECEL)
      const disc = T * T - 4 * k * dist
      v = disc >= 0 ? (T - Math.sqrt(disc)) / (2 * k) : WALK
      if (v < SLOW) {
        v = SLOW
        delay = Math.max(0, T - walkTime(dist, SLOW))
      }
      v = Math.min(WALK, v)
    }
    s.move = { kind: 'walk', from: s.pos.clone(), dist, done: 0, v, delay, turning: turn, turnT: 0, dir: new THREE.Vector3(at.x - s.pos.x, 0, at.z - s.pos.z).normalize() }
  }

  fade.update = (dt) => {
    const m = st.current.move
    if (m?.kind !== 'fade') return
    if (m.phase === 'out') fade.k = Math.max(0, fade.k - dt / FADE)
    else if (m.phase === 'in') fade.k = Math.min(1, fade.k + dt / FADE)
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    // has the visitor's view settled?
    camera.updateMatrixWorld()
    const moved = camera.matrixWorld.elements.some((v, i) => Math.abs(v - s.cam.elements[i]) > 1e-4)
    if (moved) {
      s.cam.copy(camera.matrixWorld)
      s.still = 0
      s.judged = false
    } else s.still += dt
    // the HUD may change under a still view (a caption, the end of the tour's controls): every couple of
    // seconds she checks her spot again (a quick test; she moves only if it no longer works)
    s.since = (s.since || 0) + dt
    if (s.judged && !s.solver && !s.target && s.since > RECHECK) {
      s.since = 0
      s.judged = false
    }

    // the camera set off on a glide to a known view (RoomControls): she finds her spot there now, so she can
    // walk while it moves (one frame later, once the stop's focus has reached the stage)
    const g = camera.userData.glide
    if (g && g.n !== s.glideN) {
      s.glideN = g.n
      s.ahead = s.placed && g.t < 1 ? { g, wait: 1 } : null
    }
    if (s.ahead && ready && occluder.current) {
      if (s.ahead.wait > 0) s.ahead.wait--
      else {
        const { g: glide } = s.ahead
        s.ahead = null
        s.meshes = null
        const { box, ctx } = contextFor(glide.pos, glide.look)
        s.ctx = ctx
        const here = (s.target || s.pos).clone()
        const dir = (a, b) => tmp.a.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize()
        const home = !box && s.home && Math.hypot(...glide.pos.map((v, i) => v - s.home.eye[i])) < 0.05 && dir(glide.pos, glide.look).angleTo(tmp.b.copy(s.home.dir)) < 0.02
        if (home && here.distanceTo(s.home.pos) > 0.05 && spotCheck(s.home.pos.clone(), { ...ctx, relaxed: true }).ok) {
          s.why = null
          goTo(s.home.pos, glide)
        } else if (!spotCheck(here, ctx).ok) {
          s.solver = solveSpot(ctx, { from: s.pos.toArray(), prefer })
          s.solverGlide = glide
          s.homeView = home
        }
      }
    }

    if (!s.judged && !s.solver && !s.ahead && ready && s.still >= SETTLE && occluder.current) {
      s.judged = true
      s.meshes = null // records and props may have come in since
      camera.getWorldDirection(tmp.dir)
      const eye = camera.position.toArray()
      const look = camera.position.clone().add(tmp.dir).toArray()
      const { box, ctx } = contextFor(eye, look)
      s.ctx = ctx
      const here = (s.target || s.pos).clone()
      // back at the view she was first placed for (the room's start view, after Step back), with no stop
      // focused: her spot there, while it still works
      const home = !box && s.home && s.home.cam.elements.every((v, i) => Math.abs(v - camera.matrixWorld.elements[i]) < 0.02)
      if (home && here.distanceTo(s.home.pos) > 0.05 && spotCheck(s.home.pos.clone(), { ...s.ctx, relaxed: true }).ok) {
        s.why = null
        goTo(s.home.pos)
      } else {
        const now = spotCheck(here, s.ctx)
        s.why = now.ok ? null : now.why
        if (!now.ok || !s.placed) {
          s.solver = solveSpot(s.ctx, { from: s.pos.toArray(), prefer })
          s.solverGlide = null
        }
        // at the home view with nothing better, she goes back to her home spot (solver end, below)
        s.homeView = home
      }
    }

    if (s.solver) {
      // her first spot in a room is found at once (the room has only just come in); later ones a few
      // milliseconds a frame, so the view never stutters while she looks
      const t0 = performance.now()
      let r = s.solver.next()
      // (while her spot does not work, out of frame or under the HUD, she looks harder: a longer budget)
      const budget = s.why ? BUDGET_MS * 3 : BUDGET_MS
      while (!r.done && (!s.placed || performance.now() - t0 < budget)) r = s.solver.next()
      if (r.done) {
        s.solver = null
        // no spot works in the home view: her home spot, where she stood when the visitor arrived
        const at = r.value?.at || (s.homeView && s.home && s.pos.distanceTo(s.home.pos) > 0.05 ? s.home.pos.clone() : null)
        if (at) {
          // the first spot in a room: she is there at once (the room has only just come in); later ones she walks
          // to (or fades to), paced by the camera's glide when she set off for it ahead of the camera
          if (!s.placed) {
            s.pos.copy(at)
            s.spot = at.clone()
            s.target = null
          } else goTo(at, s.solverGlide && s.solverGlide === camera.userData.glide ? s.solverGlide : null)
          s.why = null
        }
        s.solverGlide = null
        // the view she is first placed for is her home view (the room's start view)
        if (!s.placed) {
          camera.getWorldDirection(tmp.dir)
          s.home = { cam: camera.matrixWorld.clone(), eye: camera.position.toArray(), dir: tmp.dir.clone(), pos: s.pos.clone() }
          s.spot = s.pos.clone()
        }
        s.placed = true
      }
    }

    // moving: a walk (turn, then ease in and out along a straight line) or a fade (out here, in there)
    const m = s.move
    let walkDir = null
    if (m?.kind === 'walk') {
      walkDir = m.dir
      if (m.delay > 0) m.delay -= dt
      else if (m.turning) {
        m.turnT += dt
        const want = Math.atan2(m.dir.x, m.dir.z)
        if (s.yaw == null || Math.abs(wrap(want - s.yaw)) < TURN_OK || m.turnT > 1.2) m.turning = false
      } else {
        const left = m.dist - m.done
        s.speed = Math.max(0.05, Math.min(m.v, s.speed + dt * ACCEL, Math.sqrt(2 * DECEL * left)))
        m.done = Math.min(m.dist, m.done + s.speed * dt)
        const k = m.done / m.dist
        s.pos.set(m.from.x + (s.target.x - m.from.x) * k, m.from.y + (s.target.y - m.from.y) * k, m.from.z + (s.target.z - m.from.z) * k)
        if (m.dist - m.done < 1e-4) {
          s.pos.copy(s.target)
          s.target = null
          s.move = null
          s.speed = 0
          walkDir = null
        }
      }
    } else if (m?.kind === 'fade') {
      // (fade.update, called by Guide.jsx earlier this frame, moves k; she moves only after a whole frame has been
      // drawn without her)
      if (m.phase === 'out' && fade.k === 0 && (m.gone = (m.gone || 0) + 1) > 1) m.phase = 'away'
      // out of sight: she comes back in as the camera settles (its glide's last FADE seconds)
      if (m.phase === 'away') {
        s.pos.copy(s.target)
        if (glideLeft(m.glide) <= FADE) m.phase = 'in'
      }
      if (m.phase === 'in') {
        if (fade.k === 1) {
          s.target = null
          s.move = null
        }
      }
    }
    // the gait: her pace while she walks, small steps while she turns on the spot
    motion.speed = s.move?.kind === 'walk' ? (s.move.turning ? 0.35 : s.move.delay > 0 ? 0 : s.speed) : 0

    // standing: toward the visitor; with a stop focused, mostly toward it, still open to the visitor (her
    // head turns the rest, so she never talks about it looking away)
    const toCam = tmp.a.copy(camera.position).sub(s.pos).setY(0).normalize()
    if (attention) {
      const toF = tmp.b.copy(attention).sub(s.pos).setY(0).normalize()
      const mid = toF.clone().multiplyScalar(0.55).addScaledVector(toCam, 0.45)
      if (mid.lengthSq() < 1e-4) mid.copy(toF)
      mid.normalize()
      // never turned more than side-on to the visitor (a stop behind her: she turns her head, not
      // her back)
      const off = mid.angleTo(toCam)
      if (off > OPEN) {
        const sign = Math.sign(toCam.x * mid.z - toCam.z * mid.x) || 1
        mid.copy(toCam).applyAxisAngle(UP, -sign * OPEN)
      }
      face.copy(s.pos).add(mid)
    } else face.copy(s.pos).add(toCam)
    // her body's facing: the way she walks (a long walk), else the standing facing; out of sight it is set at once
    const stand = Math.atan2(face.x - s.pos.x, face.z - s.pos.z)
    const longWalk = walkDir && s.move.dist > TURN_FIRST && !(s.move.delay > 0)
    const want = longWalk ? Math.atan2(walkDir.x, walkDir.z) : stand
    if (s.yaw == null || reduced || (s.move?.kind === 'fade' && s.move.phase !== 'out')) s.yaw = want
    else s.yaw = dampAngle(s.yaw, want, longWalk ? 6 : 3, dt)

    if (group.current) group.current.position.copy(s.pos)
    if (light.current) {
      light.current.position.set(s.pos.x + toCam.x * 1.3, 2.7, s.pos.z + toCam.z * 1.3)
    }
    if (obstacle) {
      const at = s.target || s.pos
      obstacle[0] = at.x - FOOT
      obstacle[1] = at.z - FOOT
      obstacle[2] = at.x + FOOT
      obstacle[3] = at.z + FOOT
    }
  })

  return (
    <>
      {/* a soft key light in front of her, so her face reads in every room */}
      {keyLight && <pointLight ref={light} intensity={1.4} distance={9} color="#ffd9a8" />}
      <group ref={group}>
        <Guide fixedYaw={yawOf} fade={fade} gait={motion} reducedMotion={reduced} {...guideProps} />
      </group>
    </>
  )
}

const wrap = (d) => {
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}
function dampAngle(a, b, lambda, dt) {
  return a + wrap(b - a) * (1 - Math.exp(-lambda * dt))
}
