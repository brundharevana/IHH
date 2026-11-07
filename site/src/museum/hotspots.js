// Placing a hotspot (a door pill, src/museum/scene.js placeDoorSpots) clear of the stage's own
// controls. p: the hotspot centre on the canvas; rects: control boxes in canvas coordinates; r: the
// hotspot's radius, or rx / ry its half-width and half-height; gap: the clearance kept around a control. Returns the centre to use: p when it is clear, else
// moved straight down just below the covering control (or straight up just above it) when that place is
// clear of every control and inside the stage, else null (hide it; the exhibit list is its equivalent).
export function clearOfControls(p, rects, { w, h, r = 0, rx = r, ry = r, gap }) {
  const hit = q => rects.find(c => q.x + rx > c.x0 - gap && q.x - rx < c.x1 + gap && q.y + ry > c.y0 - gap && q.y - ry < c.y1 + gap);
  const inside = q => q.y - ry >= 0 && q.y + ry <= h && q.x - rx >= 0 && q.x + rx <= w;
  if (!hit(p)) return p;
  // Candidate places: just below or above each control in the hotspot's column, nearest first.
  const cands = [];
  for (const c of rects) {
    if (!(p.x + rx > c.x0 - gap && p.x - rx < c.x1 + gap)) continue;
    cands.push({ x: p.x, y: c.y1 + gap + ry + 1 }, { x: p.x, y: c.y0 - gap - ry - 1 });
  }
  cands.sort((a, b) => Math.abs(a.y - p.y) - Math.abs(b.y - p.y));
  return cands.find(q => inside(q) && !hit(q)) || null;
}
