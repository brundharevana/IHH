// The gallery-case demo (tour.html?demo=gallery-case): Hedy Lamarr's "The invention" chapter in the
// gallery-case stage. The case layout follows the chapter's stops and panel
// (data/lamarr-chapters-demo.js); the stage is place/GalleryCaseStage.jsx.
import { GalleryCaseStage } from '../place/GalleryCaseStage.jsx'
import { LAMARR_CHAPTERS_DEMO } from '../data/lamarr-chapters-demo.js'

const INVENTION_CHAPTER = LAMARR_CHAPTERS_DEMO.chapters.find((c) => c.id === 'big-work')

export function GalleryCase(props) {
  return <GalleryCaseStage chapter={INVENTION_CHAPTER} {...props} />
}
