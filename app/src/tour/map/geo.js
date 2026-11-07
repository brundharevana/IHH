// Great-circle sampling and projections shared by the three map variants.
const D2R = Math.PI / 180

export function toVec(lat, lon) {
  const la = lat * D2R
  const lo = lon * D2R
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]
}

export function greatCircle(a, b, n = 160) {
  const A = toVec(a.lat, a.lon)
  const B = toVec(b.lat, b.lon)
  const dot = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]))
  const w = Math.acos(dot)
  const out = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const s1 = Math.sin((1 - t) * w) / Math.sin(w)
    const s2 = Math.sin(t * w) / Math.sin(w)
    const x = s1 * A[0] + s2 * B[0]
    const y = s1 * A[1] + s2 * B[1]
    const z = s1 * A[2] + s2 * B[2]
    out.push({ lat: Math.atan2(z, Math.hypot(x, y)) / D2R, lon: Math.atan2(y, x) / D2R, t })
  }
  return out
}

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const clamp01 = (t) => Math.min(1, Math.max(0, t))
