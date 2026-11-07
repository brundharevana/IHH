// <ArtifactViewer art onClose reduced autoOpen autoPlay placeNote? placeNoteLabel? /> — one viewer for every artifact record
// (placeNoteLabel: the note's heading, the stop's own when the record is not a photograph; default "Not taken here")
// (data/artifacts.js, shape in data/README.md): a stage for the kind (stages.jsx) beside an object
// card in the style of a museum label: title, maker and date, holder and catalogue id, rights, a
// Source link, two to four short lines from verified facts, notes pinned on a 3D object, and the
// guide's narration when the record has a clip. Einstein's letter of June 18, 1943 is a 'letter'.
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { speaker } from '../../shared/guide/speech.js'
import { useSpokenLine } from '../../shared/guide/SpeechBubble.jsx'
import { SheetStage, PhotoStage, ModelStage } from './stages.jsx'
import { useRecovery } from '../../shared/loadHooks.js'
import { viewerScope } from '../../shared/loadScope.js'
import { ARTIFACTS, seriesLetters } from '../data/artifacts.js'
import { isPanKey, modelZoomKey, panByKey } from './pan.js'
import { visitorRights } from '../../shared/rightsText.js'
// the viewer's styles live in the tour stylesheet: import it here too, so the standalone page (tour.html?viewer=<id>,
// which loads no chapter player) is styled (round 9 part B, step 5)
import '../tour.css'

const STAGES = { letter: SheetStage, sheet: SheetStage, document: SheetStage, photo: PhotoStage, photoset: PhotoStage, model: ModelStage }
const HINT = {
  letter: 'Drag to turn the letter',
  sheet: 'Drag to turn the sheet',
  document: 'Drag to turn the page',
  photoset: 'Drag sideways to turn it',
  model: 'Drag to turn it all the way round · scroll, pinch or + − to zoom',
}

// the kind's own action (left of the listen button): label in both states, so the row keeps its
// layout when the label changes
function toggleFor(art, st) {
  if (art.kind === 'letter') return { label: st.open ? 'Fold the letter' : 'Unfold the letter', pressed: st.open, act: (s) => ({ ...s, open: !s.open }) }
  if (art.kind === 'sheet' || art.kind === 'document') return { label: st.flipped ? 'Show the front' : 'Turn it over', pressed: st.flipped, act: (s) => ({ ...s, flipped: !s.flipped }) }
  // Fit to view also brings the picture back to its middle
  if (art.kind === 'photo' || art.kind === 'photoset') return { label: st.zoom ? 'Fit to view' : 'Look closer', pressed: st.zoom, act: (s) => ({ ...s, zoom: !s.zoom, pan: [0, 0] }) }
  if (art.kind === 'model') return { label: 'Reset the view', pressed: undefined, act: (s) => ({ ...s, reset: s.reset + 1, note: null }) }
  return null
}

// A click or tap on the backdrop around the record (the overlay itself, the empty stage around a
// photograph or a page) closes the viewer. Only a press that both starts and ends there and barely
// moves: a drag that pans a zoomed photograph or turns a sheet never closes it.
const BACKDROP = ['letter-overlay', 'letter-stage', 'photo-stage']
const isBackdrop = (el) => Boolean(el?.classList && BACKDROP.some((c) => el.classList.contains(c)))
function useOutsideClose(onClose) {
  const press = useRef(null)
  return {
    down: (e) => {
      press.current = isBackdrop(e.target) ? { x: e.clientX, y: e.clientY } : null
    },
    click: (e) => {
      const p = press.current
      press.current = null
      if (!p || !isBackdrop(e.target) || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) return
      onClose()
    },
  }
}

function SingleViewer({ art, onClose, reduced, autoOpen = false, autoPlay = false, onPrev, onNext, onStep = null, stageExtra = null, eyebrowExtra = '', keepFocus = false, placeNote = '', placeNoteLabel = 'Not taken here' }) {
  const [st, setSt] = useState({ open: autoOpen || art.kind !== 'letter', flipped: false, page: art.startPage || 0, view: 0, zoom: false, pan: [0, 0], note: null, reset: 0, zoomCmd: null, zoomLimit: null })
  const [playing, setPlaying] = useState(false)
  const line = useSpokenLine()
  const closeRef = useRef()
  const Stage = STAGES[art.kind] || PhotoStage
  const pages = art.pages?.length || 0
  const views = art.photos?.length || 0
  const pannable = (art.kind === 'photo' || art.kind === 'photoset') && st.zoom

  // focus moves to Close once, when the viewer opens (not again when the parent re-renders with a
  // new onClose: that would pull a keyboard user back from the control they tabbed to)
  useEffect(() => {
    if (!keepFocus) closeRef.current?.focus()
  }, [keepFocus])
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') {
        // handled here: the tour's own Esc (step back from a stop) leaves it alone
        e.preventDefault()
        return onClose()
      }
      if (e.target.closest?.('input, textarea')) return
      // a 3D object: + and - move closer and back (stages.jsx ZoomRig)
      // (never with Ctrl, Cmd or Alt held: those are the browser's own zoom, pan.js modelZoomKey)
      const dir = art.kind === 'model' ? modelZoomKey(e) : 0
      if (dir) {
        e.preventDefault()
        return setSt((s) => ({ ...s, zoomCmd: { n: (s.zoomCmd?.n || 0) + 1, dir } }))
      }
      // zoomed in on a photograph: the arrows move around it (not to the next view)
      if (pannable && isPanKey(e.key)) {
        e.preventDefault()
        return setSt((s) => ({ ...s, pan: panByKey(s.pan, e.key) }))
      }
      if (e.key === 'ArrowRight' && pages > 1) setSt((s) => ({ ...s, page: Math.min(pages - 1, s.page + 1), flipped: false }))
      if (e.key === 'ArrowLeft' && pages > 1) setSt((s) => ({ ...s, page: Math.max(0, s.page - 1), flipped: false }))
      if (e.key === 'ArrowRight' && views > 1) setSt((s) => ({ ...s, view: (s.view + 1) % views }))
      if (e.key === 'ArrowLeft' && views > 1) setSt((s) => ({ ...s, view: (s.view - 1 + views) % views }))
      // one photograph of a photograph series: the arrows step to the next or previous photograph
      if (onStep && pages <= 1 && views <= 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) onStep(e.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose, pages, views, pannable, onStep, art.kind])

  // a folded letter unfolds on its own shortly after it appears (reduced motion: it starts open)
  useEffect(() => {
    if (art.kind !== 'letter' || reduced || autoOpen) return
    const t = setTimeout(() => setSt((s) => ({ ...s, open: true })), 900)
    return () => clearTimeout(t)
  }, [art, reduced, autoOpen])

  useEffect(() => () => speaker.stop(), [])

  // gesture: the visitor pressed listen (sound may start); an automatic start (the viewer opened from a
  // stop) never unlocks sound by itself: it plays aloud only if a gesture already did, else on captions
  const play = useCallback(async (gesture = true) => {
    if (playing) {
      speaker.stop()
      setPlaying(false)
      return
    }
    if (gesture) speaker.unlock()
    setPlaying(true)
    await speaker.playClip({ ...art.clip, who: 'Guide' })
    setPlaying(false)
  }, [playing, art])

  // opened from a chapter stop: the guide starts talking about the object straight away
  const auto = useRef(autoPlay)
  useEffect(() => {
    if (!auto.current || !art.clip) return
    auto.current = false
    play(false)
  }, [play, art])

  const outside = useOutsideClose(onClose)
  const toggle = toggleFor(art, st)
  const note = art.model?.notes?.[st.note]
  // the record's page, photograph or model: bounded loading with a visible status, and a recoverable
  // error (Try again resets the viewer's load scope, then remounts the stage)
  const load = useRecovery(viewerScope)

  return (
    <div className="artifact-viewer" role="dialog" aria-modal="true" aria-labelledby="artifact-title">
      <div className="letter-overlay" onPointerDown={outside.down} onClick={outside.click}>
      <div className={`letter-stage stage-${art.kind}`} data-viewer-record={art.id} data-viewer-ready={load.status === 'ready' ? 'true' : 'false'}>
        {load.status !== 'resetting' && <Stage key={load.attempt} art={art} state={st} setState={setSt} reduced={reduced} load={load} attempt={load.attempt} />}
        {(load.status === 'loading' || load.status === 'resetting') && (
          <p className="stage-loading glass-pill" role="status" data-viewer-loading="true">
            Loading this record…
          </p>
        )}
        {load.status === 'failed' && (
          <div className="room-error glass-panel" role="alert" data-viewer-error="true">
            <p className="room-error-title">This record could not be loaded.</p>
            <p className="room-error-why">The {load.message}. Try again, or use the Source link on the card.</p>
            <div className="room-error-actions">
              <button type="button" className="btn-glass" onClick={load.retry}>
                Try again
              </button>
            </div>
          </div>
        )}
        {pages > 1 && (
          <div className="stage-pager glass-pill" role="group" aria-label="Pages">
            <button type="button" className="btn-round" disabled={st.page === 0} onClick={() => setSt((s) => ({ ...s, page: s.page - 1, flipped: false }))} aria-label="Previous page">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span aria-live="polite">
              {art.pages[st.page].label && !/^Page \d+$/.test(art.pages[st.page].label) ? `${art.pages[st.page].label} · ` : 'Page '}
              {st.page + 1} of {pages}
            </span>
            <button type="button" className="btn-round" disabled={st.page === pages - 1} onClick={() => setSt((s) => ({ ...s, page: s.page + 1, flipped: false }))} aria-label="Next page">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
        {views > 1 && (
          <div className="stage-views" role="group" aria-label="Views">
            {art.photos.map((p, i) => (
              <button key={p.src} type="button" className={`chip ${st.view === i ? 'is-on' : ''}`} aria-pressed={st.view === i} onClick={() => setSt((s) => ({ ...s, view: i }))}>
                {p.label || `View ${i + 1}`}
              </button>
            ))}
          </div>
        )}
        {pannable && (
          <div className={`stage-pan glass-pill ${views > 1 ? 'has-views' : ''}`} role="group" aria-label="Move around the photograph">
            {[
              ['ArrowLeft', 'Show more of the left', 'M15 6l-6 6 6 6'],
              ['ArrowUp', 'Show more of the top', 'M6 15l6-6 6 6'],
              ['ArrowDown', 'Show more of the bottom', 'M6 9l6 6 6-6'],
              ['ArrowRight', 'Show more of the right', 'M9 6l6 6-6 6'],
            ].map(([k, label, d]) => (
              <button key={k} type="button" className="btn-round" aria-label={label} data-pan-key={k} onClick={() => setSt((s) => ({ ...s, pan: panByKey(s.pan, k) }))}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ))}
          </div>
        )}
        {art.kind === 'model' && (
          <div className="stage-zoom glass-pill" role="group" aria-label="Zoom">
            {[
              [1, 'Zoom in', 'near', 'M12 6v12M6 12h12'],
              [-1, 'Zoom out', 'far', 'M6 12h12'],
            ].map(([dir, label, limit, d]) => (
              <button key={dir} type="button" className="btn-round" aria-label={label} data-zoom={dir > 0 ? 'in' : 'out'} disabled={st.zoomLimit === limit} onClick={() => setSt((s) => ({ ...s, zoomCmd: { n: (s.zoomCmd?.n || 0) + 1, dir } }))}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            ))}
          </div>
        )}
        {(art.kind === 'photo' || art.kind === 'photoset') && (
          <p className="sr-only" aria-live="polite">
            {st.zoom ? 'Zoomed in. Drag the photograph or use the arrow keys or the arrow buttons to move around it; Fit to view shows all of it.' : ''}
          </p>
        )}
        {stageExtra}
        {pannable ? <p className="letter-hint" aria-hidden="true">Drag or use the arrows to look around it</p> : HINT[art.kind] && <p className="letter-hint" aria-hidden="true">{HINT[art.kind]}</p>}
      </div>

      <aside className="letter-panel glass-panel object-card">
        <p className="eyebrow">
          {art.test ? 'Viewer test · not an artifact' : `${art.theme ? `${art.theme} · ` : ''}${art.id}${eyebrowExtra}`}
        </p>
        <h2 id="artifact-title" className="letter-title">{art.title}</h2>
        {(art.maker || art.date) && (
          <p className="object-byline">
            {art.maker}
            {art.maker && art.date ? ' · ' : ''}
            {art.date}
          </p>
        )}
        {/* a labelled recreation (approved, spec 2.4) says so on its card, under the title */}
        {art.recreation && <p className="object-byline object-recreation">{art.recreation}</p>}
        {/* what the recreation does not show (e.g. fewer rows than the facts describe) */}
        {art.recreationNote && <p className="object-byline object-recreation">{art.recreationNote}</p>}
        {/* the stop shows this record in a place it was not made (e.g. a portrait in a room): say so */}
        {placeNote && (
          <p className="object-place-note">
            <span className="letter-line-label">{placeNoteLabel}</span>
            <span className="object-place-note-text">{placeNote}</span>
          </p>
        )}
        {art.lines?.length > 0 && (
          <ul className="letter-lines">
            {art.lines.map((l) => (
              <li key={l.label + l.text}>
                <span className="letter-line-label">{l.label}</span>
                <span className="letter-line-text">
                  {l.text} <span className="fact-chip" title="Verified fact id">{l.factId}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {art.model?.notes?.length > 0 && (
          <div className="object-notes">
            <span className="letter-line-label">Notes on the object</span>
            <ol>
              {art.model.notes.map((n, i) => (
                <li key={i}>
                  <button type="button" className={`object-note ${st.note === i ? 'is-on' : ''}`} aria-expanded={st.note === i} onClick={() => setSt((s) => ({ ...s, note: s.note === i ? null : i }))}>
                    <span className="object-note-num" aria-hidden="true">{i + 1}</span>
                    {n.label}
                  </button>
                </li>
              ))}
            </ol>
            {note && (
              <p className="letter-line-text">
                {note.text} {note.factId && <span className="fact-chip" title="Verified fact id">{note.factId}</span>}
              </p>
            )}
          </div>
        )}
        {(toggle || art.clip) && (
          <div className={`letter-actions ${toggle && art.clip ? '' : 'is-single'}`}>
            {toggle && (
              <button type="button" className="btn-glass" onClick={() => setSt(toggle.act)} aria-pressed={toggle.pressed}>
                {toggle.label}
              </button>
            )}
            {art.clip && (
              <button type="button" className="btn-cream" onClick={play} aria-pressed={playing}>
                <span className={`audio-dot ${playing ? 'is-on' : ''}`} aria-hidden="true" />
                {playing ? 'Stop narration' : art.listen || 'Hear about this'}
              </button>
            )}
          </div>
        )}
        {art.clip && (
          <p className={`letter-caption ${playing && line ? 'is-on' : ''}`} aria-live="polite">
            {playing && line ? line.text : ''}
          </p>
        )}
        {!art.test && (
          <dl className="object-meta">
            {art.holder && (
              <>
                <dt>Holder</dt>
                <dd>{art.holder}</dd>
              </>
            )}
            {art.catalogueId && (
              <>
                <dt>Catalogue</dt>
                <dd>{art.catalogueId}</dd>
              </>
            )}
            {art.rights && (
              <>
                <dt>Rights</dt>
                {/* the holder's rights words, without the project's note of an owner ruling (shared/rightsText.js) */}
                <dd>{visitorRights(art.rights)}</dd>
              </>
            )}
            {art.source && (
              <>
                <dt>Source</dt>
                <dd>
                  <a href={art.source} target="_blank" rel="noreferrer noopener">
                    View at the holder<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </dd>
              </>
            )}
            {/* related items shown only at their holders (link-only records: never an image here) */}
            {art.links?.map((l) => (
              <Fragment key={l.href}>
                <dt>See also</dt>
                <dd>
                  <a href={l.href} target="_blank" rel="noreferrer noopener">
                    {l.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
        {art.credit && <p className="letter-credit">{art.credit}</p>}
        {(onPrev || onNext) && (
          <div className="object-walk">
            {onPrev && (
              <button type="button" className="btn-glass" onClick={onPrev}>
                Previous object
              </button>
            )}
            {onNext && (
              <button type="button" className="btn-glass" onClick={onNext}>
                Next object
              </button>
            )}
          </div>
        )}
      </aside>
      </div>
      {/* the way out, in the same top-right corner on every record and every screen (it stays put
          while a phone scrolls the card); Esc and a click or tap outside the record close it too */}
      <button ref={closeRef} type="button" className="btn-round letter-close" onClick={onClose} aria-label="Close the record">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}

const withSeriesClip = (letter, clip) => ({
  ...letter,
  clip: { keys: [...new Set([...clip.keys, ...(letter.clip?.keys || [])])], factIds: [...new Set([...(clip.factIds || []), ...(letter.clip?.factIds || [])])] },
})
const shortDate = (d = '') => d.replace(/^([A-Z][a-z]{2})[a-z]*/, '$1')

// A series (kind 'series'): the viewer pages through the records in date order. A date picker sits
// above the stage; the object card below it is the current record's own, with its own citation.
// A photograph series (unit 'photograph', owner feedback round 8: the photographs of one moment at one
// stop) is stepped the same way; its chips are numbered (its photographs may share a date) and the
// arrow keys step through it.
function SeriesViewer({ art, onClose, reduced, autoPlay = false }) {
  const letters = seriesLetters(art)
  const photos = art.unit === 'photograph'
  const unit = photos ? 'Photograph' : 'Letter'
  const [i, setI] = useState(0)
  // the series' narration plays once, as the viewer opens: paging back to the first letter remounts it,
  // and must not play it again
  const auto = useRef(autoPlay)
  useEffect(() => {
    if (i !== 0) auto.current = false
  }, [i])
  const n = letters.length
  const go = useCallback((k) => setI(Math.max(0, Math.min(n - 1, k))), [n])
  const step = useCallback((d) => setI((k) => Math.max(0, Math.min(n - 1, k + d))), [n])
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'PageDown') go(i + 1)
      if (e.key === 'PageUp') go(i - 1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [i, go])
  if (!n) return null
  const picker = (
    <div className="series-picker glass-pill" role="group" data-viewer-series={art.id} aria-label={`${art.title}: choose a ${unit.toLowerCase()}`}>
      <button type="button" className="btn-round" disabled={i === 0} onClick={() => go(i - 1)} aria-label={`Previous ${unit.toLowerCase()}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <ol className="series-dates">
        {letters.map((l, k) => (
          <li key={l.id}>
            <button type="button" className={`chip ${k === i ? 'is-on' : ''}`} data-series-member={l.id} aria-pressed={k === i} aria-label={photos ? `${unit} ${k + 1} of ${n}: ${l.title}` : `Letter ${k + 1} of ${n}: ${l.date}`} onClick={() => go(k)}>
              {photos ? k + 1 : shortDate(l.date)}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="btn-round" disabled={i === n - 1} onClick={() => go(i + 1)} aria-label={`Next ${unit.toLowerCase()}`}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span className="series-count" aria-live="polite">{unit} {i + 1} of {n}</span>
    </div>
  )
  return (
    <SingleViewer
      key={letters[i].id}
      // the series' own narration (the stop's record line) opens the first letter, before its own clip
      art={i === 0 && art.clip ? withSeriesClip(letters[0], art.clip) : letters[i]}
      autoPlay={auto.current && i === 0}
      reduced={reduced}
      onClose={onClose}
      stageExtra={picker}
      onStep={photos ? step : null}
      eyebrowExtra={` · ${unit} ${i + 1} of ${n}`}
      keepFocus={i > 0}
    />
  )
}

// Focus goes back to what opened the viewer (a stop dot, a hotspot) when it closes; without this it
// falls to <body> and a keyboard user starts again from the top of the page. Captured in a layout
// effect, before the viewer's own effect moves focus to Close; restored once the viewer is gone, and
// only if focus fell to <body> or the main landmark (never taken from a control the visitor has moved to). When the opener
// is gone (a hotspot that unmounted), focus goes to the current stop's dot (the dots' tab stop), else
// to the page's main landmark.
function returnTarget(opener) {
  if (opener && opener !== document.body && opener.isConnected) return opener
  return document.querySelector('.stop-dot[aria-current="true"]') || document.querySelector('.stop-dot[tabindex="0"]') || document.querySelector('main')
}
function useReturnFocus() {
  useLayoutEffect(() => {
    const opener = document.activeElement
    return () => {
      setTimeout(() => {
        const now = document.activeElement
        // a click on the backdrop leaves focus on the page's main landmark (focusable, tabindex -1):
        // that counts as fallen too
        if (now && now !== document.body && !now.matches?.('main.tour-stage')) return
        returnTarget(opener)?.focus({ preventScroll: true })
      }, 0)
    }
  }, [])
}

export function ArtifactViewer(props) {
  useReturnFocus()
  return props.art.kind === 'series' ? <SeriesViewer {...props} /> : <SingleViewer {...props} />
}

export default ArtifactViewer
