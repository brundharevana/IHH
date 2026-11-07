// The photo-room demo (tour.html?demo=photo-room): Hedy Lamarr's "Arriving" chapter in the photo-room
// stage. The camera solve, proxies and masks are data (data/lamarr-chapters-demo.js, place.photo);
// the stage is place/PhotoRoomStage.jsx.
import { PhotoRoomStage } from '../place/PhotoRoomStage.jsx'
import { LAMARR_CHAPTERS_DEMO } from '../data/lamarr-chapters-demo.js'

const ARRIVING_CHAPTER = LAMARR_CHAPTERS_DEMO.chapters.find((c) => c.id === 'arriving')

export function PhotoRoom(props) {
  return <PhotoRoomStage chapter={ARRIVING_CHAPTER} {...props} />
}
