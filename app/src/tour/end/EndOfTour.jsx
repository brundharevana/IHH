// The end of a tour: after the last chapter, an optional quiz (quiz.js), a ticket the visitor can save
// as a PNG (ticket.js), and a pointer to IHH's own story form (links.js). One dialog, three steps:
// quiz -> ticket -> story. Nothing the visitor does is stored or sent anywhere.
import { useEffect, useMemo, useRef, useState } from 'react'
import INDEX from '../data/facts.generated.json'
import INDUCTEES from '../../landing/data/inductees.json'
import { END_LINKS } from './links.js'
import { buildQuiz, score } from './quiz.js'
import { portraitFor, ticketAlt, ticketData, ticketPng, ticketSvg, toDataUrl } from './ticket.js'
import './end.css'

const inFrame = () => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

// a new tab through the shared helper (public/external-links.js); when a sandbox refuses it, the
// address is shown as copyable text
function openLink(url, from) {
  const L = window.IHHExternalLinks
  if (!L) return void window.open(url, '_blank', 'noopener,noreferrer')
  if (L.openExternal(url) === 'blocked') L.showAddress(url, document, from)
}

// the dialog's Tab stops, in order
const focusables = (root) => [...root.querySelectorAll('a[href], button:not([disabled])')]

// a blob URL for `blob`, revoked when it changes or the component unmounts
function useBlobUrl(blob) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!blob) return setUrl(null)
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

// each screen's heading takes focus when it appears (on open, on each step and each question)
function useHeadingFocus(key) {
  const ref = useRef()
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [key])
  return ref
}

function Quiz({ tour, questions, onDone }) {
  const [at, setAt] = useState(-1) // -1: the intro
  const [picks, setPicks] = useState(() => questions.map(() => null))
  const heading = useHeadingFocus(at)
  if (at < 0)
    return (
      <>
        <span className="eyebrow">End of the tour</span>
        <h2 id="end-title" className="end-title" tabIndex={-1} ref={heading}>
          A short quiz
        </h2>
        <p className="end-copy">{`A few questions about ${tour.name}, answered by records from this tour. Optional.`}</p>
        <div className="end-actions">
          <button type="button" className="btn-cream" onClick={() => setAt(0)}>
            Start the quiz
          </button>
          <button type="button" className="btn-glass" onClick={() => onDone(null)}>
            Skip to your ticket
          </button>
        </div>
      </>
    )
  const q = questions[at]
  const pick = picks[at]
  const last = at === questions.length - 1
  const choose = (i) => {
    if (pick != null) return
    setPicks((p) => p.map((v, k) => (k === at ? i : v)))
  }
  return (
    <>
      <span className="eyebrow">{`Question ${at + 1} of ${questions.length}`}</span>
      <h2 id="end-title" className="end-title end-question" tabIndex={-1} ref={heading}>
        {q.prompt}
      </h2>
      <div className="end-options" role="group" aria-labelledby="end-title">
        {q.options.map((o, i) => (
          <button
            key={o}
            type="button"
            className={`end-option ${pick != null && i === q.answer ? 'is-right' : ''} ${pick === i && i !== q.answer ? 'is-wrong' : ''}`}
            aria-pressed={pick != null ? pick === i : undefined}
            aria-disabled={pick != null && pick !== i ? 'true' : undefined}
            onClick={() => choose(i)}
            data-end-option={i}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="end-feedback" aria-live="polite">
        {pick != null && (
          <>
            <p className="end-verdict">{pick === q.answer ? 'Right.' : 'Not quite.'}</p>
            <p className="end-reveal">
              <span className="end-reveal-label">From the record:</span> {q.reveal}
            </p>
          </>
        )}
      </div>
      {pick != null && (
        <div className="end-actions">
          <button type="button" className="btn-cream" onClick={() => (last ? onDone(score(questions, picks)) : setAt(at + 1))} data-end="advance">
            {last ? 'See your ticket' : 'Next question'}
          </button>
        </div>
      )}
    </>
  )
}

function Ticket({ tour, result, visitedOn, chapterIds, nextSlug, nextName, onStory, onClose }) {
  const [svg, setSvg] = useState(null)
  const [png, setPng] = useState(null) // the inline fallback image
  const [fallback, setFallback] = useState(false)
  const [saving, setSaving] = useState(false)
  const svgBlob = useMemo(() => (svg ? new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }) : null), [svg])
  const svgUrl = useBlobUrl(svgBlob)
  const pngUrl = useBlobUrl(png)
  const feedbackRef = useRef()
  const heading = useHeadingFocus('ticket')

  const data = useMemo(() => ticketData(tour, { portrait: portraitFor(tour.slug, INDUCTEES), result, now: visitedOn, visited: chapterIds }), [tour, result, visitedOn, chapterIds])

  useEffect(() => {
    let live = true
    Promise.all([data.portrait ? toDataUrl(data.portrait.src) : null, END_LINKS.feedbackQrImage ? toDataUrl(END_LINKS.feedbackQrImage) : null]).then(([portraitData, qr]) => {
      if (live) setSvg(ticketSvg(data, { qr, portraitData }))
    })
    return () => {
      live = false
    }
  }, [data])

  const save = async () => {
    setSaving(true)
    try {
      const blob = await ticketPng(svg)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ihh-ticket-${tour.slug}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
      // a framed page may refuse downloads (sandbox without allow-downloads) without saying so
      if (inFrame()) {
        setPng(blob)
        setFallback(true)
      }
    } catch {
      setPng(null)
      setFallback(true) // the SVG preview itself, with the hint
    } finally {
      setSaving(false)
    }
  }

  // the image's alt states what the card states (name, date, chapters, stamp, number)
  const alt = ticketAlt(data)
  return (
    <>
      <span className="eyebrow">End of the tour</span>
      <h2 id="end-title" className="end-title" tabIndex={-1} ref={heading}>
        Your ticket
      </h2>
      {result && (
        <p className="end-copy end-score" data-end-score>
          {`You got ${result.right} of ${result.total}.`}
        </p>
      )}
      <div className="end-ticket">
        {svgUrl ? (
          <img className="end-ticket-img" src={svgUrl} alt={alt} data-end-ticket />
        ) : (
          <p className="end-copy" role="status">
            Making your ticket…
          </p>
        )}
      </div>
      {fallback && (
        <div className="end-save-fallback" data-end-save-fallback>
          <p className="end-hint">Press and hold, or right-click, to save the ticket.</p>
          {(pngUrl || svgUrl) && <img className="end-ticket-img" src={pngUrl || svgUrl} alt={alt} />}
        </div>
      )}
      <div className="end-actions">
        <button type="button" className="btn-cream" onClick={save} disabled={!svg || saving} data-end="save">
          Save ticket
        </button>
        {END_LINKS.feedbackUrl ? (
          <button type="button" className="btn-glass" ref={feedbackRef} onClick={() => openLink(END_LINKS.feedbackUrl, feedbackRef.current)} data-end="feedback">
            Give feedback
          </button>
        ) : (
          <button type="button" className="btn-glass" disabled data-end="feedback">
            Feedback link coming soon
          </button>
        )}
        <button type="button" className="btn-glass" onClick={onStory} data-end="story">
          Share your story
        </button>
      </div>
      <div className="end-actions end-leave">
        {nextSlug && nextName && (
          <a className="btn-glass end-link" href={`tour.html?inductee=${nextSlug}`} data-end="next-inductee">
            {`Next inductee: ${nextName}`}
          </a>
        )}
        <button type="button" className="btn-glass" onClick={onClose} data-end="close">
          Back to the museum
        </button>
      </div>
    </>
  )
}

function Story({ onBack }) {
  const ref = useRef()
  const heading = useHeadingFocus('story')
  return (
    <>
      <span className="eyebrow">Your story</span>
      <h2 id="end-title" className="end-title" tabIndex={-1} ref={heading}>
        Share your immigration story
      </h2>
      <p className="end-copy">
        IHH collects visitors&apos; stories through its own form. This museum does not keep anything you write. If IHH features your story, it is shown as a visitor&apos;s story, not as verified history. If you are under 13, ask a parent or guardian first.
      </p>
      <div className="end-actions">
        {END_LINKS.storyUrl ? (
          <button type="button" className="btn-cream" ref={ref} onClick={() => openLink(END_LINKS.storyUrl, ref.current)} data-end="story-form">
            Go to the story form
          </button>
        ) : (
          <button type="button" className="btn-cream" disabled data-end="story-form">
            Story form coming soon
          </button>
        )}
        <button type="button" className="btn-glass" onClick={onBack} data-end="back">
          Back to your ticket
        </button>
      </div>
    </>
  )
}

// chapterIds: the chapters shown in this visit (ChapterPlayer); the quiz asks about and the ticket counts only those
export default function EndOfTour({ tour, chapterIds = null, nextSlug, nextName, reduced = false, onClose }) {
  const questions = useMemo(() => buildQuiz(tour, INDEX, chapterIds), [tour, chapterIds])
  const [step, setStep] = useState(questions.length ? 'quiz' : 'ticket')
  const [result, setResult] = useState(null)
  const [visitedOn, setVisitedOn] = useState(() => (questions.length ? null : new Date()))
  const rootRef = useRef()

  // on close, focus goes back to the opener if it is still there
  useEffect(() => {
    const opener = document.activeElement
    return () => {
      if (opener && opener !== document.body && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [])

  // While open, everything outside the dialog is inert (no focus, no clicks, hidden from assistive
  // technology): every sibling of the dialog and of each of its ancestors up to <body>. Only the
  // elements this effect made inert are restored on close.
  useEffect(() => {
    const made = []
    for (let el = rootRef.current; el && el !== document.body; el = el.parentElement) {
      for (const sib of el.parentElement?.children || []) {
        if (sib !== el && !sib.hasAttribute('inert')) {
          sib.setAttribute('inert', '')
          made.push(sib)
        }
      }
    }
    return () => made.forEach((el) => el.removeAttribute('inert'))
  }, [])

  // Keys that arrive while focus is on no element (<body>, e.g. after the focused button became
  // disabled) are the dialog's too: Escape ends the tour, Tab moves into the dialog, and no key reaches
  // the tour's own shortcuts (window listeners, bubble phase) behind it. Keys in another layer added
  // later (the copyable-address note of external-links.js) are left to it.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const key = (e) => {
      const root = rootRef.current
      if (!root || (e.target !== document.body && e.target !== document.documentElement)) return
      e.stopPropagation()
      if (e.key === 'Escape') onCloseRef.current?.()
      else if (e.key === 'Tab') {
        e.preventDefault()
        const f = focusables(root)
        ;(e.shiftKey ? f.at(-1) : f[0])?.focus()
      }
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [])

  const toTicket = (r) => {
    setResult(r)
    setVisitedOn((v) => v || new Date())
    setStep('ticket')
  }
  const onKeyDown = (e) => {
    e.stopPropagation() // the tour's own keys stay quiet behind this layer
    if (e.key === 'Escape') return onClose?.()
    if (e.key !== 'Tab') return
    // Focus wraps inside the dialog. From the first control, the heading or the dialog itself (both
    // tabIndex -1, before every control), Shift+Tab goes to the last control; Tab from the last goes to
    // the first.
    const f = focusables(rootRef.current)
    if (!f.length) return e.preventDefault()
    const at = f.indexOf(document.activeElement)
    if (e.shiftKey && at <= 0) {
      e.preventDefault()
      f.at(-1).focus()
    } else if (!e.shiftKey && (at === f.length - 1 || !rootRef.current.contains(document.activeElement))) {
      e.preventDefault()
      f[0].focus()
    }
  }

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby="end-title" className={`end-of-tour ${reduced ? 'is-reduced' : ''}`} data-end-step={step} onKeyDown={onKeyDown}>
      <div className="glass-panel end-card" key={step}>
        {step === 'quiz' && <Quiz tour={tour} questions={questions} onDone={toTicket} />}
        {step === 'ticket' && <Ticket tour={tour} result={result} visitedOn={visitedOn} chapterIds={chapterIds} nextSlug={nextSlug} nextName={nextName} onStory={() => setStep('story')} onClose={onClose} />}
        {step === 'story' && <Story onBack={() => setStep('ticket')} />}
      </div>
    </div>
  )
}
