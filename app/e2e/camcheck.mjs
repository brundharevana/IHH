// Camera focus check: every focus in every rebuilt room of one inductee's tour, desktop + phone.
// The rooms come from the app's own data (data/index.js TOURS): a step tour's room steps
// (?stop=<step id>), or a chapter tour's room-tier chapters (?chapter=<id>).
// Round 9 (owner feedback): at each focus pose, nothing in the room hides the stop's record from the
// camera (a 7 x 7 grid of rays over it: 'occluded'); and every record a room
// shows sits naturally: hung on a wall (a surface right behind it), lying on a table or desk (a surface
// right under it), or on an easel near the room's architecture (a wall, column or building within 2 m),
// never on a post out in the open ('placement').
// usage: node e2e/camcheck.mjs <slug> [roomFilter] [--shots]      (dev server at http://localhost:5173)
import { existsSync } from 'node:fs'
import { chromium } from './browser.mjs' // Playwright: $SITE_MODULES or ../Challenge IHH/site (browser.mjs)

const BASE = process.env.BASE || 'http://localhost:5173'
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const [slug, filter = null] = args
if (!slug) {
  console.log('usage: node e2e/camcheck.mjs <slug> [roomFilter] [--shots]')
  process.exit(2)
}
const shots = process.argv.includes('--shots')
const shotDir = process.env.SHOTS || '.'
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
}
const SHELL = `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`

const browser = await chromium.launch({ ...(existsSync(SHELL) ? { executablePath: SHELL } : {}), args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const probe = await browser.newPage()
await probe.goto(`${BASE}/tour.html?view=moments`)
const ROOMS = await probe.evaluate(async (slug) => {
  const { TOURS } = await import('/src/tour/data/index.js')
  const t = TOURS[slug]
  if (!t) return null
  if (t.chapters) return t.chapters.filter((c) => c.place.tier === 'room').map((c) => [c.id, `chapter=${c.id}`])
  return t.steps.filter((s) => s.type === 'room').map((s) => [s.id, `stop=${s.id}`])
}, slug)
await probe.close()
if (!ROOMS?.length) {
  console.log(ROOMS ? `${slug}: no rebuilt rooms to check` : `unknown tour ${slug}`)
  await browser.close()
  process.exit(ROOMS ? 0 : 2)
}
// the occlusion grid's side (GRID x GRID rays over each record)
const GRID = 7
let fails = 0
for (const [dev, opts] of Object.entries(DEVICES)) {
  for (const [stop, query] of ROOMS) {
    const ind = slug
    if (filter && !`${ind}-${stop}`.includes(filter)) continue
    // a fresh browser context per room: a long run kept every closed room's GPU memory in one context, and a later room
    // then failed to load within the 90 s wait (round 9 fix round 2: three Albright runs)
    const ctx = await browser.newContext(opts)
    const page = await ctx.newPage()
    await page.goto(`${BASE}/tour.html?inductee=${ind}&${query}&autostart=1`)
    // a chapter with a map leg opens on the map: go on to its place
    const leg = await page.waitForSelector('.tour-stage[data-phase="map"]', { timeout: 8000 }).catch(() => null)
    if (leg) await page.click('[data-hud=next]')
    // the room is ready (a chapter with no stop, round 9, has no spots to visit)
    await page.waitForFunction(() => window.__tourApi?.info()?.room, null, { timeout: 90000 })
    await page.waitForTimeout(1500)
    const ids = await page.evaluate(() => window.__tourApi.info().spots.map((s) => s.id))
    // where each record sits (once per room and device)
    // every record the room's data declares (roomRecords.js declaredRecordIds, not only the bindings that survived) must be there: a missing one fails (Codex review 2: a missing mesh was swallowed
    // here and skipped below, so a record that never drew passed placement and occlusion)
    const allIn = await page.waitForFunction(() => {
      const r = window.__roomRecords?.()
      return r && r.declared.every((id) => r.meshes[id])
    }, null, { timeout: 30000 }).then(() => true, () => false)
    if (!allIn) {
      const missing = await page.evaluate(() => {
        const r = window.__roomRecords?.()
        return r ? r.declared.filter((id) => !r.meshes[id]) : ['(no record registry on the page)']
      })
      fails++
      console.log(`${dev} ${slug}/${stop} FAIL missing record mesh: ${missing.join(', ')}`)
    }
    const placed = await page.evaluate(() => {
      const s = window.__tour3
      const V = s.camera.position.constructor
      const rec = window.__roomRecords?.() || { declared: [], expected: [], meshes: {} }
      const guide = new Set()
      for (const g of window.__guideRoots || []) g.traverse((o) => guide.add(o))
      const out = []
      for (const id of rec.declared) {
        const m = rec.meshes[id]
        if (!m) {
          out.push({ id, mount: 'missing', d: null, anchor: null, ok: false })
          continue
        }
        // the room's own architecture only: not this or any record, its frame, mat or easel
        const own = new Set()
        for (const r of Object.values(rec.meshes)) r.parent.parent.traverse((o) => own.add(o))
        s.scene.traverse((o) => o.userData.easel && o.traverse((x) => own.add(x)))
        const meshes = []
        s.scene.traverse((o) => {
          if (!o.isMesh || own.has(o) || guide.has(o)) return
          for (let p = o; p; p = p.parent) if (!p.visible) return
          const mt = [].concat(o.material).find((x) => x && x.colorWrite !== false && !(x.transparent && (x.opacity ?? 1) < 0.5))
          if (mt) meshes.push(o)
        })
        m.updateWorldMatrix(true, false)
        const c = m.getWorldPosition(new V())
        const n = new V(0, 0, 1).transformDirection(m.matrixWorld)
        const ray = new s.raycaster.constructor()
        const first = (from, dir, far) => {
          ray.set(from, dir.clone().normalize())
          ray.near = 0
          ray.far = far
          const h = ray.intersectObjects(meshes, false)[0]
          return h ? h.distance : null
        }
        // architecture for an easel to stand by: an upright built surface, not a tree, a lamp or rising
        // terrain (round 9 review: any mesh within 2 m used to count). Named by the mesh and its parents.
        const NOT_ARCH = /tree|trunk|leaf|leaves|foliage|bush|shrub|plant|flower|lamp|lantern|light|terrain|ground|grass|lawn|meadow|rock|boulder|hill|cliff|water|sky/i
        const chain = (o) => {
          const n = []
          for (let p = o; p && p !== s.scene; p = p.parent) if (p.name) n.push(p.name)
          return n.join('<')
        }
        const firstArch = (from, dir, far) => {
          ray.set(from, dir.clone().normalize())
          ray.near = 0
          ray.far = far
          for (const h of ray.intersectObjects(meshes, false)) {
            const nm = chain(h.object)
            if (NOT_ARCH.test(nm)) continue
            const fn = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null
            if (fn && Math.abs(fn.y) > 0.5) continue
            return { d: h.distance, name: nm || '(unnamed)' }
          }
          return null
        }
        let mount = m.userData.mount
        let d = null
        let ok = false
        let anchor = null
        if (mount === 'wall') {
          d = first(c.clone().addScaledVector(n, 0.02), n.clone().negate(), 0.5)
          ok = d !== null && d <= 0.2
        } else if (mount === 'lie') {
          // it rests on its near edge (the far edge raised for reading): a surface right under that edge
          const edge = new V(0, -m.geometry.parameters.height * 0.45, 0).applyMatrix4(m.matrixWorld)
          d = first(edge.add(new V(0, 0.05, 0)), new V(0, -1, 0), 0.5)
          ok = d !== null && d <= 0.12
        } else {
          // an easel: the nearest architecture around it (a wall, a column, a hedge, a railing; not grass or ground clutter), from hip
          // height to above the record
          let best = null
          for (const y of [0.85, c.y, c.y + 0.5])
            for (let k = 0; k < 16; k++) {
              const a = (k / 16) * Math.PI * 2
              const h = firstArch(new V(c.x, y, c.z), new V(Math.cos(a), 0, Math.sin(a)), 3)
              if (h !== null && (best === null || h.d < best.d)) best = h
            }
          d = best ? best.d : null
          anchor = best ? best.name : null
          ok = d !== null && d <= 2.0
          // or it stands on a stage or dais: the floor under it is raised, with the stage's edge (a drop of
          // 0.3 m or more) within 2 m
          if (!ok) {
            const under = first(new V(c.x, c.y, c.z), new V(0, -1, 0), 4)
            const floorY = under === null ? null : c.y - under
            if (floorY !== null && floorY >= 0.3)
              for (let k = 0; k < 8 && !ok; k++) {
                const a = (k / 8) * Math.PI * 2
                const n = first(new V(c.x + Math.cos(a) * 2, floorY + 0.5, c.z + Math.sin(a) * 2), new V(0, -1, 0), 4)
                if (n !== null && floorY + 0.5 - n <= floorY - 0.3) {
                  ok = true
                  mount = 'stand (on a stage)'
                }
              }
          }
          // a natural landscape (the room's data says so: no built structure in its model) has nothing to stand
          // near: there the easel must stand on the ground
          if (!ok && window.__tourApi.info().room.landscape) {
            const g = first(new V(c.x, 0.6, c.z), new V(0, -1, 0), 1)
            ok = g !== null && g <= 0.7
            if (ok) mount = 'stand (landscape)'
          }
        }
        out.push({ id, mount, d: d === null ? null : +d.toFixed(2), anchor, ok })
      }
      return out
    })
    for (const p of placed) {
      if (!p.ok) fails++
      console.log(`${dev} ${slug}/${stop} ${p.id} placement=${p.mount} d=${p.d}${p.anchor ? ` by=${p.anchor.slice(0, 60)}` : ''} ${p.ok ? 'ok' : 'FAIL placement'}`)
    }
    // visit each artifact in order (focus -> focus), then back, then each from the walk view
    const order = [...ids.map((id) => ({ id, from: 'prev' })), ...ids.map((id) => ({ id, from: 'back' }))]
    for (const { id, from } of order) {
      if (from === 'back') {
        await page.evaluate(() => window.__tourApi.back())
        await page.waitForTimeout(2200)
      }
      const r = await page.evaluate(async ([id, GRID]) => {
        const s = window.__tour3
        const THREE = s.camera.constructor.prototype.constructor // unused
        const cam = s.camera
        const yawOf = () => {
          const e = cam.matrixWorld.elements
          // forward = -z column
          return Math.atan2(-e[8], -e[10])
        }
        const info = window.__tourApi.info()
        const shell = info.room.shell || info.room.bounds
        let prev = yawOf()
        let total = 0
        let maxStep = 0
        let outside = 0
        const y0 = prev
        window.__tourApi.select(id)
        const t0 = performance.now()
        await new Promise((res) => {
          const tick = () => {
            const y = yawOf()
            let d = y - prev
            while (d > Math.PI) d -= 2 * Math.PI
            while (d < -Math.PI) d += 2 * Math.PI
            total += Math.abs(d)
            maxStep = Math.max(maxStep, Math.abs(d))
            prev = y
            const p = cam.position
            if (p.x < shell.min[0] - 0.05 || p.x > shell.max[0] + 0.05 || p.z < shell.min[2] - 0.05 || p.z > shell.max[2] + 0.05 || p.y < 0.05 || p.y > shell.max[1] + 0.05) outside++
            if (performance.now() - t0 > 3200) return res()
            requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
        let net = prev - y0
        while (net > Math.PI) net -= 2 * Math.PI
        while (net < -Math.PI) net += 2 * Math.PI
        // framing: artifact box corners in NDC
        const spot = info.spots.find((x) => x.id === id)
        const b = spot.box
        const pts = []
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new cam.position.constructor(x, y, z).project(cam))
        const inFront = pts.filter((p) => p.z < 1).length
        const minX = Math.max(-1, Math.min(...pts.map((p) => p.x)))
        const maxX = Math.min(1, Math.max(...pts.map((p) => p.x)))
        const minY = Math.max(-1, Math.min(...pts.map((p) => p.y)))
        const maxY = Math.min(1, Math.max(...pts.map((p) => p.y)))
        const c = spot.center.clone().project(cam)
        // how face-on: angle between view dir and the box's thin axis (only meaningful for flat boxes)
        const size = b.getSize(spot.center.clone())
        const fwd = cam.getWorldDirection(spot.center.clone())
        let incidence = null
        if (Math.min(size.x, size.z) < 0.4 * Math.max(size.x, size.z) && size.y < 2.5) {
          const ax = size.x < size.z ? [1, 0] : [0, 1]
          const h = Math.hypot(fwd.x, fwd.z)
          incidence = (Math.acos(Math.abs(fwd.x * ax[0] + fwd.z * ax[1]) / h) * 180) / Math.PI
        }
        // nothing in the room between the camera and the stop's record (its middle and near its corners)
        let occluded = null
        const occluders = new Set()
        const rr = window.__roomRecords?.()
        const rm = rr?.meshes?.[id]
        // a stop whose record the room should show but does not: the occlusion check cannot pass
        if (!rm && rr?.declared?.includes(id)) occluded = -1
        if (rm) {
          // only the record's own face is excluded (round 9 fix round 7, Codex review 6 follow-up): its frame, mat, easel or
          // anything else in its mount hides it wherever it lies in front of the face (the rays end 5 mm in front of the
          // face, so a frame behind it is never hit); the whole mount used to be excluded, so a panel in front of a
          // record in its own mount group passed
          const own = new Set([rm])
          const guide = new Set()
          for (const g of window.__guideRoots || []) g.traverse((o) => guide.add(o))
          const meshes = []
          s.scene.traverse((o) => {
            if (!o.isMesh || own.has(o) || guide.has(o)) return
            for (let p = o; p; p = p.parent) if (!p.visible) return
            const mt = [].concat(o.material).find((x) => x && x.colorWrite !== false && !(x.transparent && (x.opacity ?? 1) < 0.5))
            if (mt) meshes.push(o)
          })
          const g = rm.geometry.parameters
          rm.updateWorldMatrix(true, false)
          const ray = new s.raycaster.constructor()
          occluded = 0
          // a 7 x 7 grid over the record (to within 5 % of its edges): a bar or a beam end across part of it is hit
          // (round 9 final review: five rays let a window rail across the Robinson journal pass between them)
          const grid = []
          for (let i = 0; i < GRID; i++) for (let j = 0; j < GRID; j++) grid.push([-0.45 + (0.9 * i) / (GRID - 1), -0.45 + (0.9 * j) / (GRID - 1)])
          for (const [u, v] of grid) {
            const p = new cam.position.constructor(u * g.width, v * g.height, 0.005).applyMatrix4(rm.matrixWorld)
            const dir = p.clone().sub(cam.position)
            const len = dir.length()
            ray.set(cam.position, dir.normalize())
            ray.near = 0.05
            ray.far = len - 0.02
            const hit = ray.intersectObjects(meshes, false)[0]
            if (hit) {
              occluded++
              let n = ''
              for (let q = hit.object; q && q !== s.scene && !n; q = q.parent) n = q.name
              occluders.add(`${n || '(unnamed)'}@y${hit.point.y.toFixed(2)}`)
            }
          }
        }
        const rawW = (Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x))) / 2
        const rawH = (Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y))) / 2
        return {
          shown: (Math.max(0, maxX - minX) * Math.max(0, maxY - minY)) / 4 / Math.max(1e-6, rawW * rawH),
          vcx: (minX + maxX) / 2,
          vcy: (minY + maxY) / 2,
          incidence,
          total: (total * 180) / Math.PI,
          net: (Math.abs(net) * 180) / Math.PI,
          maxStep: (maxStep * 180) / Math.PI,
          outside,
          inFront,
          visW: Math.max(0, maxX - minX) / 2,
          visH: Math.max(0, maxY - minY) / 2,
          cx: c.x,
          cy: c.y,
          size: size.toArray().map((v) => +v.toFixed(2)),
          cam: cam.position.toArray().map((v) => +v.toFixed(2)),
          occluded,
          occluders: [...occluders].slice(0, 6),
        }
      }, [id, GRID])
      const bad = []
      if (r.total > r.net + 15) bad.push('long-way')
      if (r.total > 120) bad.push('yaw>120')
      if (r.outside) bad.push('outside-shell')
      if (r.inFront < 8) bad.push('behind')
      // the visible part of the artifact sits in the frame (rooms keep the guide beside it, so
      // the artifact is rarely dead centre) and most of it is on screen unless it fills the view
      if (Math.abs(r.vcx) > 0.8 || Math.abs(r.vcy) > 0.8) bad.push('off-centre')
      if (r.shown < 0.5 && r.visW * r.visH < 0.25) bad.push('cropped')
      if (r.visW * r.visH < 0.004) bad.push('tiny')
      if (r.incidence !== null && r.incidence > 62) bad.push('edge-on')
      if (r.occluded === -1) bad.push('missing record mesh')
      else if (from === 'prev' && r.occluded) bad.push(`occluded(${r.occluded}/${GRID * GRID}: ${r.occluders.join(' ')})`)
      if (bad.length) fails++
      console.log(`${dev} ${ind}/${stop} ${id} from=${from} yawTotal=${r.total.toFixed(0)} net=${r.net.toFixed(0)} centre=(${r.vcx.toFixed(2)},${r.vcy.toFixed(2)}) shown=${r.shown.toFixed(2)} vis=${r.visW.toFixed(2)}x${r.visH.toFixed(2)} inc=${r.incidence === null ? '-' : r.incidence.toFixed(0)} cam=${r.cam} ${bad.length ? 'FAIL ' + bad.join(',') : 'ok'}`)
      if (shots && from === 'prev') await page.screenshot({ path: `${shotDir}/focus-${ind}-${stop}-${id}-${dev}.jpg`, type: 'jpeg', quality: 70 })
    }
    await ctx.close()
  }
}
await browser.close()
console.log(fails ? `FAILURES: ${fails}` : 'ALL OK')
process.exit(fails ? 1 : 0)
