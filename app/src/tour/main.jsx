// Standalone entry for tour.html (mockup). Query params:
//   ?inductee=<slug>        einstein | naismith | muir | albright | lamarr (default einstein);
//                           lamarr-demo (dev server only): the chapter-shape test tour (data/lamarr-chapters-demo.js)
//   ?chapter=<id|kind|fact id>  a tour in the chapter shape starts at that chapter (ChapterPlayer)
//   ?map=unroll|flat|globe  map style (owner pick: unroll; flat by URL only; globe on the dev server only)
//   ?stop=map|room|<step id>|<fact id>  where to start (a landing story point's fact id maps to its stop,
//                           or, for a chapter tour, to its chapter: data/index.js resolveStop)
//   ?focus=<artifact id>    with a room stop: open on that object (review, screenshots)
//   ?autostart=1            skip the Begin card (screenshots; audio may stay muted)
//   ?letter=open            open the room's document (Einstein's letter) once the room is ready
//   ?view=moments           "Moments That Made Them" (moments/); old ?view=constellations and
//                           ?constellation=<id> links redirect to it
//   ?demo=photo-room|gallery-case  (dev server only) the two cheaper chapter presentations (Hedy Lamarr), demo/
//   ?viewer=<media id>      one artifact in the viewer (dev: test-pages, test-sheet, test-photoset, test-model); only a
//                           record the tours declare (data/viewerRoute.js): any other id shows an error, never the tour
import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { lazyChunk } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'
import '../design/tokens.css'
import { TourStage } from './index.jsx'
import { INDUCTEES, TOURS, resolveStop } from './data/index.js'
import { viewerRecord } from './data/viewerRoute.js'

const Moments = lazyChunk(() => import('./moments/Moments.jsx'), 'Moments')
const ArtifactViewer = lazyChunk(() => import('./artifact/ArtifactViewer.jsx'), 'the record viewer')

window.IHHExternalLinks?.install() // public/external-links.js: in a sandboxed embed, a refused new tab shows the address instead
const q = new URLSearchParams(window.location.search)
const pick = (v, allowed, d) => (allowed.includes(v) ? v : d)
// the retired index and its item links (?view=constellations, ?constellation=<id>) open the same page
const legacyIndex = q.get('view') === 'constellations' || q.has('constellation')
if (legacyIndex) window.history.replaceState(null, '', '?view=moments')
const inductee = pick(q.get('inductee'), Object.keys(TOURS), 'einstein')
// a chapter tour starts at ?chapter=, else at the chapter a ?stop= (landing story point) resolves to
const start = TOURS[inductee].chapters
  ? { step: 0, focus: null, ...(INDUCTEES[inductee] ? resolveStop(inductee, q.get('stop')) : { chapter: null, label: null }) }
  : resolveStop(inductee, q.get('stop'))
document.title = `${TOURS[inductee].name} — Guided tour · Immigrant Hall of Honor`

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// ?viewer= present: the record it names, or why it cannot be opened (an unknown or undeclared id fails loudly)
const viewerRoute = q.has('viewer') ? viewerRecord(q.get('viewer')) : null
const viewer = viewerRoute?.art || null
const root = createRoot(document.getElementById('tour-root'))
const demo = import.meta.env.DEV ? q.get('demo') : null
if (import.meta.env.DEV && (demo === 'photo-room' || demo === 'gallery-case')) {
  // the two cheaper chapter presentations, side by side for the owner (demo/DemoTiers.jsx); dev only,
  // so the production build has neither the page nor its chunk
  const DemoTiers = lazy(() => import('./demo/DemoTiers.jsx'))
  root.render(
    <Suspense fallback={null}>
      <DemoTiers demo={demo} />
    </Suspense>,
  )
} else if (viewerRoute?.error) {
  console.error(`tour.html?viewer=${q.get('viewer')}: ${viewerRoute.error}`)
  document.title = 'Record not found · Immigrant Hall of Honor'
  root.render(
    <main tabIndex={-1} className="tour-stage">
      <div className="room-error glass-panel" role="alert" data-viewer-route-error="true">
        <p className="room-error-title">This record cannot be opened here.</p>
        <p className="room-error-why">{viewerRoute.error}</p>
        <div className="room-error-actions">
          <a className="btn-glass" href="/">Go to the museum</a>
        </div>
      </div>
    </main>,
  )
} else if (viewer) {
  document.title = `${viewer.title} · Immigrant Hall of Honor`
  root.render(
    <ChunkSuspense what="the record viewer">
      <main tabIndex={-1} className="tour-stage">
        <ArtifactViewer art={viewer} reduced={reduced} onClose={() => window.history.length > 1 ? window.history.back() : window.location.assign('/')} />
      </main>
    </ChunkSuspense>,
  )
} else if (q.get('view') === 'moments' || legacyIndex) {
  document.title = 'Moments That Made Them · Immigrant Hall of Honor'
  root.render(
    <ChunkSuspense what="Moments">
      <Moments reduced={reduced} onClose={() => window.location.assign('/')} />
    </ChunkSuspense>,
  )
} else root.render(
  // No StrictMode here: its double-mounted effects make drei <Html> unmount its own React roots
  // mid-render under React 19 (labels vanish). Revisit when drei fixes it.
  <TourStage
    inductee={inductee}
    step={start.step}
    chapter={q.get('chapter') || start.chapter}
    startFocus={q.get('focus') || start.focus}
    startLabel={start.label}
    mapVariant={pick(q.get('map'), import.meta.env.DEV ? ['globe', 'flat', 'unroll'] : ['flat', 'unroll'], 'unroll')}
    autostart={q.get('autostart') === '1'}
    openLetter={q.get('letter') === 'open'}
    onEnd={() => window.location.assign('/')}
  />,
)
