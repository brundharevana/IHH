// Screen geometry for the label layer (labels.jsx); no React here (tested in node).

// does segment (ax, ay)-(bx, by) cross the rectangle?
export function segHitsRect(ax, ay, bx, by, r) {
  if (Math.max(ax, bx) < r.l || Math.min(ax, bx) > r.r || Math.max(ay, by) < r.t || Math.min(ay, by) > r.b) return false
  const inside = (x, y) => x >= r.l && x <= r.r && y >= r.t && y <= r.b
  if (inside(ax, ay) || inside(bx, by)) return true
  const cross = (px, py, qx, qy) => {
    const d = (bx - ax) * (qy - py) - (by - ay) * (qx - px)
    if (Math.abs(d) < 1e-9) return false
    const s = ((px - ax) * (qy - py) - (py - ay) * (qx - px)) / d
    const u = ((px - ax) * (by - ay) - (py - ay) * (bx - ax)) / d
    return s >= 0 && s <= 1 && u >= 0 && u <= 1
  }
  return cross(r.l, r.t, r.r, r.t) || cross(r.r, r.t, r.r, r.b) || cross(r.r, r.b, r.l, r.b) || cross(r.l, r.b, r.l, r.t)
}

// Keep place labels inside the view and push overlapping ones apart vertically, in registration
// order (the route's order).

// The least move (px, { dx, dy }) that takes rectangle r (l, r, t, b) clear of every area (left, right, top, bottom),
// with a gap, staying inside [0, width] x [0, height]: sideways first, else up or down (a badge over a row of rail
// records with no room beside them goes above them); { dx: 0, dy: 0 } when it is clear already or nothing clears it.
export function clearShift(r, areas, width, height = Infinity, gap = 6) {
  const hits = (dx, dy) => areas.some((a) => r.l + dx < a.right + gap && r.r + dx > a.left - gap && r.t + dy < a.bottom + gap && r.b + dy > a.top - gap)
  if (!hits(0, 0)) return { dx: 0, dy: 0 }
  const fits = (dx, dy) => r.l + dx >= 0 && r.r + dx <= width && r.t + dy >= 0 && r.b + dy <= height
  const xs = areas.flatMap((a) => [a.right + gap - r.l, a.left - gap - r.r])
  const sx = xs.filter((dx) => fits(dx, 0) && !hits(dx, 0)).sort((p, q) => Math.abs(p) - Math.abs(q))
  if (sx.length) return { dx: sx[0], dy: 0 }
  const ys = areas.flatMap((a) => [a.top - gap - r.b, a.bottom + gap - r.t])
  const sy = ys.filter((dy) => fits(0, dy) && !hits(0, dy)).sort((p, q) => Math.abs(p) - Math.abs(q))
  return sy.length ? { dx: 0, dy: sy[0] } : { dx: 0, dy: 0 }
}

// How far to move a rectangle that is partly out of the view back inside it ({ dx, dy }); a rectangle wholly out of
// the view stays where it is (the visitor has turned away from it).
export function intoView(r, width, height, gap = 6) {
  const out = r.r <= 0 || r.b <= 0 || r.l >= width || r.t >= height
  if (out) return { dx: 0, dy: 0 }
  const dx = r.l < gap ? gap - r.l : r.r > width - gap ? width - gap - r.r : 0
  const dy = r.t < gap ? gap - r.t : r.b > height - gap ? height - gap - r.b : 0
  return { dx, dy }
}

// Where the stops' badges go on screen (labels.jsx): each partly past the view's edge comes back inside (a badge wholly
// out of view stays out: the visitor has turned away from it); then, in their left-to-right order, each badge moves right
// just clear of the badges before it at its height, and the row is pulled back from the right edge (round 9 fix round 2:
// a run kept inside the view landed on the badge before it). rects: the badges at their anchor points ({ l, r, t, b },
// null for one not drawn); returns an offset { dx, dy } for each.
export function layoutBadges(rects, width, height, gap = 6) {
  const off = rects.map((r) => (r ? intoView(r, width, height, gap) : { dx: 0, dy: 0 }))
  const items = rects
    .map((r, i) => (r ? { i, l: r.l + off[i].dx, w: r.r - r.l, t: r.t + off[i].dy, b: r.b + off[i].dy, out: r.r <= 0 || r.l >= width || r.b <= 0 || r.t >= height } : null))
    .filter((x) => x && !x.out)
    .sort((p, q) => p.l - q.l)
  const level = (a, b) => a.t < b.b + gap && a.b > b.t - gap
  for (let k = 0; k < items.length; k++) {
    const x = items[k]
    for (let j = 0; j < k; j++) if (level(items[j], x)) x.l = Math.max(x.l, items[j].l + items[j].w + gap)
  }
  for (let k = items.length - 1; k >= 0; k--) {
    const x = items[k]
    let maxR = width - gap
    for (let j = k + 1; j < items.length; j++) if (level(items[j], x)) maxR = Math.min(maxR, items[j].l - gap)
    if (x.l + x.w > maxR) x.l = maxR - x.w
  }
  for (const x of items) off[x.i].dx += x.l - (rects[x.i].l + off[x.i].dx)
  return off
}

// The length of a polyline ([[x, y], ...], CSS px) that lies inside the view [0, width] x [0, height]: each segment
// clipped to the view (Liang-Barsky). The map e2e's readability floor uses it (Codex review 2: an off-screen route
// counted in full).
export function visibleLength(pts, width, height) {
  let total = 0
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const dx = x1 - x0
    const dy = y1 - y0
    let t0 = 0
    let t1 = 1
    let inside = true
    for (const [p, q] of [[-dx, x0], [dx, width - x0], [-dy, y0], [dy, height - y0]]) {
      if (p === 0) {
        if (q < 0) inside = false
        continue
      }
      const r = q / p
      if (p < 0) t0 = Math.max(t0, r)
      else t1 = Math.min(t1, r)
    }
    if (inside && t1 > t0) total += (t1 - t0) * Math.hypot(dx, dy)
  }
  return total
}
