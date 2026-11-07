// Pixel-ratio range for every R3F canvas (spec section 5: DPR cap 1.5 on phones). A canvas that
// already caps lower keeps its own cap.
export const PHONE_DPR_MAX = 1.5
export const DESKTOP_DPR_MAX = 2
export const dprFor = (phone) => [1, phone ? PHONE_DPR_MAX : DESKTOP_DPR_MAX]
// For a canvas whose component does not track the phone query itself (the viewer's stages): reads
// the same query the tour uses for its phone layout.
export const PHONE_QUERY = '(max-width: 720px), (pointer: coarse)'
export const dprNow = () => dprFor(typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches)
