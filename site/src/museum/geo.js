// Pure geometry for the journey globe (globe.js): no three.js, no DOM, so vitest can check it.
// Unit sphere, y up. Longitude 0 faces +x and longitude 90 E faces -z, which is how three.js
// SphereGeometry lays an equirectangular texture (u = 0 at 180 W): a pin placed with
// latLonToVec3 sits on the same spot of the Blue Marble image.
const RAD = Math.PI / 180;

export function latLonToVec3(lat, lon, r = 1) {
  const phi = (lon + 180) * RAD, theta = (90 - lat) * RAD;
  return [-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta)];
}

export function vec3ToLatLon([x, y, z]) {
  const r = Math.hypot(x, y, z) || 1;
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, y / r))) / RAD;
  let lon = Math.atan2(z, -x) / RAD - 180;
  if (lon < -180) lon += 360;
  return { lat, lon };
}

// camera-controls orbit angles that put the camera straight above a point (a direction from the
// centre): position = (sin p sin a, cos p, sin p cos a).
export function orbitAngles([x, y, z]) {
  const r = Math.hypot(x, y, z) || 1;
  return { azimuth: Math.atan2(x, z), polar: Math.acos(Math.max(-1, Math.min(1, y / r))) };
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = a => { const l = Math.hypot(...a) || 1; return a.map(v => v / l); };

// Central angle (radians) between two { lat, lon }.
export function centralAngle(a, b) {
  return Math.acos(Math.max(-1, Math.min(1, dot(latLonToVec3(a.lat, a.lon), latLonToVec3(b.lat, b.lon)))));
}

// Points along the great circle from a to b ({ lat, lon }), lifted off the surface by
// lift * angle * sin(pi t) so a long hop arcs higher than a short one. Returns [] when the two
// places are closer than minAngle (a hop inside one town draws nothing).
export function greatCirclePoints(a, b, { segments = 64, lift = 0.25, radius = 1, minAngle = 0.002 } = {}) {
  const p = latLonToVec3(a.lat, a.lon), q = latLonToVec3(b.lat, b.lon);
  const omega = Math.acos(Math.max(-1, Math.min(1, dot(p, q))));
  if (omega < minAngle) return [];
  const s = Math.sin(omega), out = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const k0 = Math.sin((1 - t) * omega) / s, k1 = Math.sin(t * omega) / s;
    const v = norm([k0 * p[0] + k1 * q[0], k0 * p[1] + k1 * q[1], k0 * p[2] + k1 * q[2]]);
    const h = radius * (1 + lift * omega * Math.sin(Math.PI * t));
    out.push(v.map(c => c * h));
  }
  return out;
}

// Mean direction of a set of { lat, lon }: where the opening view looks so every pin is in sight.
export function centreOf(places) {
  if (!places.length) return { lat: 20, lon: 0 };
  const sum = places.reduce((acc, p) => { const v = latLonToVec3(p.lat, p.lon); return acc.map((c, i) => c + v[i]); }, [0, 0, 0]);
  return vec3ToLatLon(norm(sum));
}

// Screen layout for pin labels. Pins closer than `gap` px (several stops in one town) are grouped
// and their labels fanned out on a short arc above the group's centre, `gap` apart, so each stays
// a separate target; a lone pin keeps its own point. In: [{ id, x, y }]; out: Map id -> { x, y,
// ax, ay } (label position and the anchor it points at).
export function fanOut(points, gap = 32) {
  const groups = [];
  for (const p of points) {
    const g = groups.find(gr => gr.some(q => Math.hypot(q.x - p.x, q.y - p.y) < gap));
    if (g) g.push(p); else groups.push([p]);
  }
  // Merge groups that became neighbours through a later member.
  for (let i = 0; i < groups.length; i++) {
    for (let j = groups.length - 1; j > i; j--) {
      if (groups[i].some(a => groups[j].some(b => Math.hypot(a.x - b.x, a.y - b.y) < gap))) groups[i].push(...groups.splice(j, 1)[0]);
    }
  }
  const out = new Map();
  for (const g of groups) {
    if (g.length === 1) { const [p] = g; out.set(p.id, { x: p.x, y: p.y, ax: p.x, ay: p.y }); continue; }
    const cx = g.reduce((s, p) => s + p.x, 0) / g.length, cy = g.reduce((s, p) => s + p.y, 0) / g.length;
    // Labels on a circle around the group's centre, on its upper half, neighbours `gap` apart.
    const n = g.length, spread = Math.min(Math.PI * 0.9, (n - 1) * 0.6);
    const radius = Math.max(gap * 1.25, (gap * 1.05) / (2 * Math.sin(spread / (2 * (n - 1)))));
    g.forEach((p, i) => {
      const a = -Math.PI / 2 - spread / 2 + (spread * i) / (n - 1);
      out.set(p.id, { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a), ax: p.x, ay: p.y });
    });
  }
  separate([...out.values()], gap);
  return out;
}

// A fanned label can still land within `gap` of a pin outside its group (or of another group's
// label): push every such pair apart along the line between them until all placed pins are at least
// `gap` apart (or the passes run out). Anchors never move; a moved pin gets a leader line to its dot.
function separate(placed, gap, passes = 60) {
  for (let k = 0; k < passes; k++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i], b = placed[j];
        let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d >= gap) continue;
        if (d < 1e-9) { dx = 0; dy = 1; d = 1; } // on top of each other: apart vertically
        const push = (gap - Math.hypot(b.x - a.x, b.y - a.y)) / 2 + 0.01;
        a.x -= (dx / d) * push; a.y -= (dy / d) * push;
        b.x += (dx / d) * push; b.y += (dy / d) * push;
        moved = true;
      }
    }
    if (!moved) return;
  }
}

// The angle equal to `target` (mod 2 pi) nearest to `current`, so a flight turns the short way.
export function nearestAngle(current, target) {
  const t = Math.PI * 2;
  return current + ((((target - current) % t) + t + Math.PI) % t) - Math.PI;
}
