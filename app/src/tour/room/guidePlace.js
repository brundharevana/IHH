// Where the guide stands: ONE fixed, natural spot per room (owner decisions 2026-10-16 and
// 2026-10-17). She never walks or re-positions when the visitor focuses an artifact; she turns her
// head and gestures toward the artifact being talked about. Each room's spot is in its tour data
// (room.guide: { pos, face }); the room's start view and its focus views (room.poses) are chosen
// around it, so she is in frame BESIDE the artifacts (never in front of one) and clear of the HUD
// panels, on desktop and phone.
//
// study.glb: at the right-hand end of the desk, a step clear of it, turned three-quarters toward
// the room. Stand-in room: her old fixed corner.
// Try another spot in dev with tour.html?guidespot=x,z[,faceX,faceZ].

export const STANDIN_SPOT = { pos: [-0.55, 0, -1.55], face: [0.2, 0, 2.2] }

// dev only: ?guidespot=x,z (and optional ,faceX,faceZ) to try another spot without a rebuild
function devSpot() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('guidespot')
  const n = v?.split(',').map(Number)
  if (!n || n.length < 2 || n.some((k) => !Number.isFinite(k))) return null
  return { pos: [n[0], 0, n[1]], face: n.length >= 4 ? [n[2], 0, n[3]] : [0.2, 0, 0.55] }
}

// spot: the room's { pos, face } (null for the stand-in) -> { pos, yaw }
export function guideSpot(spot) {
  const s = (spot && devSpot()) || spot || STANDIN_SPOT
  const yaw = Math.atan2(s.face[0] - s.pos[0], s.face[2] - s.pos[2])
  return { pos: s.pos, yaw }
}
