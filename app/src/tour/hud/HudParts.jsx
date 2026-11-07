// Shared HUD parts for every chapter view (rebuilt rooms, map legs, the photo room and the gallery
// case demos), so the whole tour behaves the same:
//  - TitleBlock: inductee name and chapter · place; the basis note (recreation label, map route
//    note) folds under "More".
//  - StopDots: the chapter's objects as numbered glass dots along the bottom centre (Tapestry
//    style). Click, number keys 1-9, or arrow left/right on a focused dot pick a stop.
//  - SoundToggle: a small icon-only mute button for the guide, plus the M key (WCAG 1.4.2: audio
//    that plays for more than 3 s needs a visible way to stop it). The AI voice disclosure stays in
//    the guide's caption line ("Guide · AI voice").
//  - MomentsButton: the bottom-left "Moments That Made Them" link (icon only on a phone).
//  - ControlsHint: the controls hint, shown once per chapter per session when the chapter opens,
//    for a few seconds, then it fades.
import { useEffect, useId, useRef, useState } from 'react'
import { speaker } from '../../shared/guide/speech.js'
import { useVoice } from '../../shared/guide/VoiceToggle.jsx'

const typing = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
const dialogOpen = () => Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'))

export function TitleBlock({ name, stop, note }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="hud-brand" data-hud="title">
      <span className="hud-name">{name}</span>
      <span className="hud-stop">{stop}</span>
      {note && (
        <>
          <button type="button" className="hud-more" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
            {open ? 'Less' : 'More'}
            <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d={open ? 'M3 7.5l3-3 3 3' : 'M3 4.5l3 3 3-3'} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <p id={id} className="recreation-note" hidden={!open}>
            {note}
          </p>
        </>
      )}
    </div>
  )
}

export function StopDots({ items, focus, seen = [], onSelect, label = 'Stops in this chapter' }) {
  const list = useRef()
  const pick = useRef(onSelect)
  pick.current = onSelect
  const ids = items.map((i) => i.id).join('|')

  // number keys 1-9 pick a stop from anywhere (not while typing or with a dialog open)
  useEffect(() => {
    const all = ids.split('|').filter(Boolean)
    const key = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || typing(e.target) || dialogOpen()) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > Math.min(9, all.length)) return
      e.preventDefault()
      pick.current(all[n - 1])
      list.current?.querySelectorAll('button')[n - 1]?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [ids])

  if (!items.length) return null
  const cur = items.findIndex((i) => i.id === focus)
  // arrow left / right on a focused dot moves to the previous / next stop and picks it
  const onKey = (e, i) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    e.stopPropagation()
    const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
    list.current?.querySelectorAll('button')[j]?.focus()
    onSelect(items[j].id)
  }
  return (
    <nav className="stop-dots" aria-label={label}>
      <ol ref={list}>
        {items.map((it, i) => {
          const on = it.id === focus
          const was = seen.includes(it.id)
          return (
            <li key={it.id}>
              <button
                type="button"
                className={`stop-dot ${on ? 'is-on' : ''} ${was ? 'is-seen' : ''}`}
                data-stop={it.id}
                aria-label={`${i + 1}. ${it.name}${was ? ' (seen)' : ''}`}
                aria-current={on ? 'true' : undefined}
                tabIndex={cur < 0 ? (i === 0 ? 0 : -1) : on ? 0 : -1}
                onClick={() => onSelect(it.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span aria-hidden="true">{i + 1}</span>
                <span className="stop-dot-name" aria-hidden="true">{it.name}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SoundToggle({ className = '' }) {
  const { muted } = useVoice()
  const toggle = () => {
    speaker.unlock()
    speaker.setMuted(!speaker.muted)
  }
  useEffect(() => {
    const key = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || typing(e.target)) return
      if (e.key !== 'm' && e.key !== 'M') return
      speaker.unlock()
      speaker.setMuted(!speaker.muted)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return (
    <button type="button" className={`btn-round hud-sound ${muted ? 'is-muted' : ''} ${className}`} aria-label={muted ? 'Unmute guide' : 'Mute guide'} title={muted ? 'Unmute guide (M)' : 'Mute guide (M)'} onClick={toggle}>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" />
        {muted ? (
          <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path d="M13 7.2a4 4 0 0 1 0 5.6M15.4 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </button>
  )
}

// Shown when `cue` turns truthy (the chapter's opening line), once per chapter per session.
const SHOW_MS = 8000
const FADE_MS = 900
const seenKey = (k) => `ihh-hint-shown:${k}`
function wasShown(k) {
  try {
    return sessionStorage.getItem(seenKey(k)) === '1'
  } catch {
    return false
  }
}
function markShown(k) {
  try {
    sessionStorage.setItem(seenKey(k), '1')
  } catch {
    /* storage blocked: the hint may show again on the next visit to this chapter */
  }
}

export function MomentsButton({ phone, onClick }) {
  return (
    <button type="button" className={`${phone ? 'btn-round' : 'btn-glass'} hud-moments hud-corner`} onClick={onClick} aria-label="Moments That Made Them" title="Moments That Made Them" data-hud="moments">
      {phone ? (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.2" opacity=".6" /><circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" /></svg>
      ) : (
        'Moments That Made Them'
      )}
    </button>
  )
}

export function ControlsHint({ cue, chapter, text }) {
  const [st, setSt] = useState('off') // off | on | fading
  useEffect(() => {
    if (!cue || !chapter || wasShown(chapter)) return
    markShown(chapter)
    setSt('on')
    // dev server only (the production build drops it): an e2e that measures the hint holds it on screen
    // (window.__IHH_HOLD_HINT, set by e2e/hud-contrast.mjs before the page loads)
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.__IHH_HOLD_HINT) return () => setSt('off')
    const t1 = setTimeout(() => setSt('fading'), SHOW_MS)
    const t2 = setTimeout(() => setSt('off'), SHOW_MS + FADE_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      setSt('off')
    }
  }, [cue, chapter])
  if (st === 'off') return null
  return (
    <p className={`hint-pill ${st === 'fading' ? 'is-fading' : ''}`} role="status">
      {text}
    </p>
  )
}
