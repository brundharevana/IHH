// The lines the label layer (labels.jsx) keeps place labels clear of: the map's route, registered by the map.
import { useEffect } from 'react'

// Lines on the map the place labels keep clear of (round 9 fix round 1: on a phone a label lay across the
// route): each a function returning the line's points now, flat [x, y, z, ...] in world space.
export const lines = new Set()
export function useAvoidLine(get) {
  useEffect(() => {
    lines.add(get)
    return () => lines.delete(get)
  }, [get])
}

// Screen areas a stop's badge keeps clear of (round 9 final review: a photo room's badge drifting over the guide was
// hidden, which removed the control; it is moved aside instead): functions returning rectangles in CSS px
// ({ left, top, right, bottom }), registered by a stage (PhotoRoomStage: the guide's figure and the rail records).
export const clearAreas = new Set()
export function useClearArea(get) {
  useEffect(() => {
    clearAreas.add(get)
    return () => clearAreas.delete(get)
  }, [get])
}
