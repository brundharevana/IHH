// Screen-space labels for 3D anchors, rendered by ONE DOM layer outside the canvas.
// (Replaces drei <Html>, whose per-label React roots unmount themselves mid-render under
// React 19 and made labels vanish.) Anchors register from inside the R3F tree; the layer
// projects them through the main camera every animation frame.
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { clearShift, layoutBadges, segHitsRect } from './labelGeom.js'
import { clearAreas, lines } from './labelLines.js'

const registry = new Map()
const listeners = new Set()
let version = 0
export const view = { camera: null, width: 1, height: 1 }
const emit = () => {
  version++
  listeners.forEach((l) => l())
}

// Inside the canvas: anchor `render` (a function returning DOM JSX) to an Object3D ref.
export function useLabel(id, objRef, render, opts = {}) {
  const renderRef = useRef(render)
  renderRef.current = render
  useEffect(() => {
    registry.set(id, { objRef, render: () => renderRef.current(), opts })
    emit()
    return () => {
      registry.delete(id)
      emit()
    }
  }, [id, objRef, opts.cullBackface, opts.offsetY, opts.avoid, opts.keepClear])
  // re-render the layer when the content changes
  useEffect(() => emit())
}

// avoid: a place label that must not overlap the other `avoid` labels (map pins); when two would
// overlap, the later one moves up or down just clear of the earlier one (and of the map's lines). avoid 'x':
// a stop's numbered badge, spread left and right of the badges it overlaps, in their order (stops seen
// nearly in line, far off: round 9, the North Hall easels).
// keepClear: a badge moved sideways out of the stage's clear areas (labelLines.js clearAreas)
export function Anchor({ id, position, children, cullBackface = false, avoid = false, keepClear = false }) {
  const ref = useRef()
  useLabel(id, ref, () => children, { cullBackface, avoid, keepClear })
  return <group ref={ref} position={position} />
}

const GAP = 6



function separate(items, width, segs = [], rectOf = (el) => el.getBoundingClientRect()) {
  const placed = []
  for (const it of items) {
    const box = it.el.firstElementChild && rectOf(it.el.firstElementChild)
    if (!box || !box.width) continue
    const b = box
    const dx = b.left < GAP ? GAP - b.left : b.right > width - GAP ? Math.max(GAP - b.left, width - GAP - b.right) : 0
    const r0 = { l: b.left + dx, r: b.right + dx, t: b.top, b: b.bottom }
    const free = (mx, my) => {
      if (placed.some((q) => r0.l + mx < q.r + GAP && r0.r + mx > q.l - GAP && r0.t + my < q.b + GAP && r0.b + my > q.t - GAP)) return false
      const q = { l: r0.l + mx - 2, r: r0.r + mx + 2, t: r0.t + my - 2, b: r0.b + my + 2 }
      for (let i = 0; i < segs.length; i += 4) if (segHitsRect(segs[i], segs[i + 1], segs[i + 2], segs[i + 3], q)) return false
      return true
    }
    // the smallest vertical move that clears every label placed so far, and the map's lines
    let my = 0
    for (let k = 1; !free(0, my) && k <= 80; k++) my = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 6
    if (!free(0, my)) my = 0
    const mx = 0
    const r = { l: r0.l + mx, r: r0.r + mx, t: r0.t + my, b: r0.b + my }
    if (dx || mx || my) it.el.style.transform = `translate3d(${(it.x + dx + mx).toFixed(1)}px, ${(it.y + my).toFixed(1)}px, 0)`
    placed.push(r)
  }
}

// scratch vectors, cloned from the camera's own position (no three import in this module)
const scratch = {}

// Outside the canvas: the DOM layer.
export function LabelLayer() {
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => version,
  )
  const els = useRef(new Map())
  const layer = useRef()
  useEffect(() => {
    let raf
    const tick = () => {
      const cam = view.camera
      // the layer lies over the canvas (in a photo room with a band, place.hudBand, both start below the top HUD): a
      // label's box is read from the layer's own origin, as the anchors are placed and the stage's clear areas given
      const at = layer.current?.getBoundingClientRect()
      const ox = at?.left || 0
      const oy = at?.top || 0
      const rectOf = (el) => {
        const b = el.getBoundingClientRect()
        return { left: b.left - ox, right: b.right - ox, top: b.top - oy, bottom: b.bottom - oy, width: b.width, height: b.height }
      }
      const avoid = []
      const badges = []
      if (cam && !scratch.v) Object.assign(scratch, { v: cam.position.clone(), n: cam.position.clone(), toCam: cam.position.clone() })
      const { v, n, toCam } = scratch
      for (const [id, item] of registry) {
        const el = els.current.get(id)
        const o = item.objRef.current
        if (!el) continue
        if (!cam || !o) {
          el.style.visibility = 'hidden'
          continue
        }
        let shown = true
        for (let p = o; p; p = p.parent) if (!p.visible) shown = false
        o.getWorldPosition(v)
        if (item.opts.cullBackface) {
          // hide labels on the far side of the globe (the globe sits at the world origin)
          n.copy(v).normalize()
          toCam.subVectors(cam.position, v).normalize()
          if (n.dot(toCam) < 0.05) shown = false
        }
        v.project(cam)
        if (v.z > 1 || v.z < -1) shown = false
        const x = (v.x * 0.5 + 0.5) * view.width
        const y = (-v.y * 0.5 + 0.5) * view.height
        el.style.visibility = shown ? 'visible' : 'hidden'
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        if (shown && item.opts.avoid && !el.firstElementChild?.classList.contains('is-hidden')) (item.opts.avoid === 'x' ? badges : avoid).push({ el, x, y, dx: 0, keep: Boolean(item.opts.keepClear) })
      }
      if (avoid.length) {
        // the map's lines on screen, as segments [ax, ay, bx, by, ...]
        const segs = []
        for (const get of lines) {
          const a = get()
          let px = null
          let py = null
          for (let i = 0; i + 2 < a.length; i += 3) {
            v.set(a[i], a[i + 1], a[i + 2]).project(cam)
            const ok = v.z <= 1 && v.z >= -1
            const x = (v.x * 0.5 + 0.5) * view.width
            const y = (-v.y * 0.5 + 0.5) * view.height
            if (ok && px !== null) segs.push(px, py, x, y)
            px = ok ? x : null
            py = ok ? y : null
          }
        }
        separate(avoid, view.width, segs, rectOf)
      }
      if (badges.length) {
        // badges partly past the view's edge come back inside it (round 9 final review: Almonte's badge 1 was cut), and
        // badges that overlap are spread side by side in their order (North Hall's easels), as one layout (labelGeom.js)
        const rects = badges.map((it) => {
          const b = it.el.firstElementChild && rectOf(it.el.firstElementChild)
          return b && b.width ? { l: b.left, r: b.right, t: b.top, b: b.bottom } : null
        })
        layoutBadges(rects, view.width, view.height).forEach((m, k) => {
          const it = badges[k]
          it.dx = m.dx
          it.dy = m.dy
          if (m.dx || m.dy) it.el.style.transform = `translate3d(${(it.x + it.dx).toFixed(1)}px, ${(it.y + it.dy).toFixed(1)}px, 0)`
        })
      }
      if (clearAreas.size && badges.some((b) => b.keep)) {
        const areas = [...clearAreas].flatMap((get) => get() || [])
        const boxOf = (it) => {
          const b = it.el.firstElementChild && rectOf(it.el.firstElementChild)
          return b && b.width ? { left: b.left, right: b.right, top: b.top, bottom: b.bottom } : null
        }
        for (const it of badges) {
          if (!it.keep) continue
          const b = boxOf(it)
          if (!b) continue
          // inside the view's width (a photo room's badge marks its subject; at the phone's narrow view it may lie
          // past the edge), then clear of her figure, the rail records and the other badges
          const into = b.left < GAP ? GAP - b.left : b.right > view.width - GAP ? view.width - GAP - b.right : 0
          const r = { l: b.left + into, r: b.right + into, t: b.top, b: b.bottom }
          const others = badges.filter((x) => x !== it).map(boxOf).filter(Boolean)
          const m = clearShift(r, [...areas, ...others], view.width, view.height)
          const dx = into + m.dx
          if (dx || m.dy) {
            it.dx += dx
            it.dy = (it.dy || 0) + m.dy
            it.el.style.transform = `translate3d(${(it.x + it.dx).toFixed(1)}px, ${(it.y + it.dy).toFixed(1)}px, 0)`
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="label-layer" ref={layer}>
      {[...registry.entries()].map(([id, item]) => (
        <div
          key={id}
          className="label-anchor"
          style={{ visibility: 'hidden' }}
          ref={(el) => (el ? els.current.set(id, el) : els.current.delete(id))}
        >
          {item.render()}
        </div>
      ))}
    </div>
  )
}
