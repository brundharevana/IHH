// <TourStage inductee step chapter startFocus onEnd /> — the guided tour for one inductee. A tour in
// the chapter shape (data/chapters.js) plays in ChapterPlayer.jsx (`chapter`: a chapter id, kind or
// fact id); a tour with only `steps` (map legs and recreated rooms, data/<slug>.js) plays in
// StepTour.jsx, until each inductee is converted to chapters. Each player is its own chunk and
// loads only for the tour that needs it; the landing can mount this in place of its scene.
import { TOURS } from './data/index.js'
import { resolveChapter } from './data/chapters.js'
import { lazyChunk } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'

const ChapterPlayer = lazyChunk(() => import('./ChapterPlayer.jsx'), 'the tour')
const StepTour = lazyChunk(() => import('./StepTour.jsx'), 'the tour')

export function TourStage(props) {
  const data = TOURS[props.inductee]
  return (
    // the page's one main landmark appears with the player; until then a busy marker with a status
    // (a chunk that fails or stalls: ChunkSuspense's panel, "Reload the page")
    <ChunkSuspense
      what="the tour"
      fallback={
        <main tabIndex={-1} className="tour-stage" aria-busy="true" aria-label="Loading the tour">
          <p className="chunk-loading" role="status" data-chunk-loading="true">
            Loading the tour…
          </p>
        </main>
      }
    >
      {data?.chapters ? (
        <ChapterPlayer tour={data} startChapter={resolveChapter(data, props.chapter)} onEnd={props.onEnd} autostart={props.autostart} startLabel={props.startLabel} />
      ) : (
        <StepTour {...props} />
      )}
    </ChunkSuspense>
  )
}

export default TourStage
