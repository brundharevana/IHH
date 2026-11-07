// "Moments That Made Them" (spec 2.7): every turning point of every inductee that has a chapter tour,
// scattered on a dark field or lined up by year. Filter chips narrow it to one kind of moment
// ("Becoming a citizen" puts them side by side); Shuffle re-scatters; a moment opens its chapter
// (tour.html?inductee=&chapter=). Layout and data helpers: ./moments.js.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { INDUCTEES } from '../data/index.js'
import { artifactById } from '../data/artifacts.js'
import generated from '../data/chapters.generated.json'
import { byTimeline, filterByKind, kindLabel, kindsOf, layoutField, momentHref, momentsIndex, thumbLabel, thumbSrc } from './moments.js'
import { NO_THUMB } from './noThumb.js'
import '../tour.css'
import './moments.css'

// The thumbnail with what it shows: the record's title and date as its alt, and its kind and date
// under it (a photograph from another year than the moment says so). A chapter with no cleared image
// (thumbMediaId null, declared `none` in records.lock.json) shows its kind icon; a thumbnail that names a
// record with no image never falls back to the icon unnoticed (round 9 fix round 6): it throws in dev and
// tests, and only a production page draws the icon in its place. Only the chapters in noThumb.js may have no
// thumbnail at all (round 9 fix round 7); any other one throws in dev too.
function Thumb({ moment }) {
  const src = thumbSrc(moment.thumbMediaId)
  if (moment.thumbMediaId && !src && import.meta.env.DEV) throw new Error(`Moments: the thumbnail ${moment.thumbMediaId} of ${moment.slug}/${moment.chapterId} has no image to show`)
  if (!moment.thumbMediaId && !NO_THUMB[`${moment.slug}/${moment.chapterId}`] && import.meta.env.DEV) throw new Error(`Moments: ${moment.slug}/${moment.chapterId} has no thumbnail and is not in noThumb.js`)
  if (src) {
    const label = thumbLabel(artifactById(moment.thumbMediaId), moment.year)
    return (
      <span className="mom-thumb-wrap" data-thumb={moment.thumbMediaId}>
        <img className="mom-thumb" src={src} alt={label.alt} loading="lazy" decoding="async" draggable="false" />
        <span className={`mom-thumb-cap ${label.otherMoment ? 'is-other' : ''}`}>{label.caption}</span>
      </span>
    )
  }
  return (
    <span className="mom-thumb mom-thumb-icon" aria-hidden="true" data-thumb="none">
      <svg viewBox="0 0 48 48" width="34%" height="34%"><circle cx="24" cy="24" r="6" fill="currentColor" /><circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".6" /></svg>
    </span>
  )
}

export function Moments({ reduced = false, onClose }) {
  const [timeline, setTimeline] = useState(false)
  const [seed, setSeed] = useState(7)
  const [kind, setKind] = useState(null)
  const all = useMemo(() => momentsIndex(INDUCTEES, generated), [])
  const shown = useMemo(() => {
    const f = filterByKind(all, kind)
    return timeline ? byTimeline(f) : f
  }, [all, kind, timeline])
  const kinds = useMemo(() => kindsOf(all), [all])
  const rootRef = useRef()
  const closeRef = useRef()
  // a modal layer: focus moves in, Tab stays inside, Escape closes, focus returns to the opener
  useEffect(() => {
    const opener = document.activeElement
    ;(closeRef.current || rootRef.current?.querySelector('a, button'))?.focus({ preventScroll: true })
    return () => {
      if (opener && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [])
  const onKeyDown = (e) => {
    e.stopPropagation() // the tour's own keys (WASD, 1-9, M) stay quiet behind this layer
    if (e.key === 'Escape' && onClose) return onClose()
    if (e.key !== 'Tab') return
    const f = [...rootRef.current.querySelectorAll('a[href], button:not([disabled])')]
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && (document.activeElement === first || !rootRef.current.contains(document.activeElement))) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && (document.activeElement === last || !rootRef.current.contains(document.activeElement))) { e.preventDefault(); first.focus() }
  }
  const fieldRef = useRef()
  const [lay, setLay] = useState(null)
  // measure the field and the tallest card, then place every card (re-run on resize and on any change)
  useLayoutEffect(() => {
    const el = fieldRef.current
    if (!el) return
    const run = () => {
      if (window.matchMedia('(max-width: 720px)').matches) return setLay(null)
      const cards = [...el.children]
      const ch = Math.max(...cards.map((x) => x.offsetHeight), 0)
      const cw = cards[0]?.offsetWidth || 190
      const minH = Math.max(380, window.innerHeight - el.getBoundingClientRect().top - 24 + el.parentElement.parentElement.scrollTop)
      const next = layoutField({ n: shown.length, W: el.clientWidth, cw, ch, minH: Math.min(minH, 620), seed, ordered: timeline })
      const key = [next.height, el.clientWidth, seed, timeline, ch, shown.length].join()
      setLay((p) => (p && p.key === key ? p : { ...next, key }))
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(el)
    return () => ro.disconnect()
  }, [shown, seed, timeline])
  return (
    <div className={`mom-root ${reduced ? 'is-reduced' : ''}`} ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="mom-title" onKeyDown={onKeyDown}>
      <section className="mom-index">
        <header className="mom-head">
          <div>
            <span className="eyebrow">Immigrant Hall of Honor</span>
            <h1 id="mom-title" className="mom-title">Moments That Made Them</h1>
          </div>
          <div className="mom-tools">
            <button type="button" className="btn-glass" aria-pressed={timeline} onClick={() => setTimeline((t) => !t)}>
              {timeline ? 'Scattered view' : 'Timeline view'}
            </button>
            <button type="button" className="btn-glass" onClick={() => setSeed((s) => (s * 48271) % 2147483647)} disabled={timeline}>
              Shuffle
            </button>
            {onClose && (
              <button type="button" className="btn-round" ref={closeRef} onClick={onClose} aria-label="Close Moments That Made Them">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
        </header>
        <div className="mom-kinds" role="group" aria-label="Filter by kind of moment">
          {kinds.map((k) => (
            <button key={k} type="button" className={`mom-tag ${kind === k ? 'is-on' : ''}`} aria-pressed={kind === k} onClick={() => setKind((x) => (x === k ? null : k))}>
              {kindLabel(k)}
            </button>
          ))}
        </div>
        <ol className={`mom-field ${timeline ? 'is-timeline' : ''}`} ref={fieldRef} style={lay ? { height: lay.height } : undefined}>
          {shown.map((m, i) => (
            <li key={`${m.slug}:${m.chapterId}`} className="mom-float" style={lay?.pos[i] ? { left: lay.pos[i].x, top: lay.pos[i].y } : undefined}>
              <a className="mom-float-btn" href={momentHref(m)}>
                <Thumb moment={m} />
                <span className="mom-float-title">{m.title}</span>
                <span className="mom-float-meta">
                  <span className="mom-tag is-static">{kindLabel(m.kind)}</span>
                  {m.year && <span className="mom-year">{m.year}</span>}
                </span>
                <span className="mom-float-who">{m.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

export default Moments
