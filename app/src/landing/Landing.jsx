import { useCallback, useEffect, useRef, useState } from 'react'
import { lazyChunk } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Entrance from './Entrance.jsx'
import InducteeScroll from './InducteeScroll.jsx'
import GuidePanel from './GuidePanel.jsx'
import TourTransition from './TourTransition.jsx'
import { useMedia } from './useMedia.js'
import { speaker } from '../shared/guide/speech.js'
import { scrollState, readEntrance, range, HANDOFF } from './store.js'
import inductees from './data/inductees.json'
import './landing.css'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// three.js + R3F are the heavy part: load them after the glass UI has painted
const Stage = lazyChunk(() => import('./Stage.jsx'), 'the 3D hall')

export default function Landing({ onStartTour }) {
  // the doors (owner pick); ?entrance=harbor | threads still loads the others, no switcher
  const [variant] = useState(readEntrance)
  const mobile = useMedia('(max-width: 720px)')
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [active, setActive] = useState(-1)
  const [tour, setTour] = useState(null)
  const veil = useRef()
  scrollState.reduced = reduced

  // veil: covers the hand-off from harbour / threads to the hall
  const paintVeil = useCallback(() => {
    if (!veil.current) return
    let o = 0
    if (variant !== 'doors') {
      const s = scrollState
      o = s.entrance < HANDOFF ? range(s.entrance, HANDOFF - 0.08, HANDOFF) : 1 - range(s.arrive, 0.02, 0.32)
      if (s.entrance < HANDOFF - 0.08) o = 0
    }
    veil.current.style.opacity = o.toFixed(3)
  }, [variant])

  // browsers allow sound only after a gesture: the first click, tap or key press unlocks the voice
  useEffect(() => {
    const unlock = () => speaker.unlock()
    const opts = { once: true, capture: true }
    window.addEventListener('pointerdown', unlock, opts)
    window.addEventListener('keydown', unlock, opts)
    return () => {
      window.removeEventListener('pointerdown', unlock, opts)
      window.removeEventListener('keydown', unlock, opts)
    }
  }, [])

  useEffect(() => {
    // fonts and layout settle after first paint; recompute trigger positions once
    const id = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(id)
  }, [variant])

  const walk = () => {
    const st = ScrollTrigger.getById('ind-pin')
    const y = st ? st.start : document.getElementById('inductees').offsetTop
    if (reduced) window.scrollTo(0, y)
    else gsap.to(window, { scrollTo: { y, autoKill: true }, duration: 2.6, ease: 'power2.inOut' })
    document.getElementById('inductees')?.focus({ preventScroll: true })
  }

  const startTour = useCallback((e, { inductee, stop, chapter }) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTour({ inductee, stop, chapter, x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }, [])

  const onActive = useCallback((i) => setActive(i), [])
  const endTour = useCallback(() => setTour(null), [])

  return (
    <div className={`landing${mobile ? ' is-mobile' : ''}`}>
      <a className="skip-link" href="#inductees">
        Skip to the inductees
      </a>
      <ChunkSuspense what="the 3D hall" notice fallback={<div className="stage stage--loading" aria-hidden="true" />}>
        <Stage variant={variant} mobile={mobile} />
      </ChunkSuspense>
      <div className="veil" ref={veil} aria-hidden="true" />

      <header className="topbar">
        <a className="wordmark" href="./" aria-label="Immigrant Hall of Honor, virtual museum, home">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 21V10a8 8 0 0 1 16 0v11" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 21v-9a4 4 0 0 1 8 0v9M2 21h20" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span>Immigrant Hall of Honor</span>
        </a>
      </header>

      <main>
        <Entrance key={variant} variant={variant} reduced={reduced} onWalk={walk} onProgress={paintVeil} />
        <InducteeScroll inductees={inductees} reduced={reduced} onActive={onActive} onTour={startTour} onProgress={paintVeil} />
        <footer className="foot">
          <p>
            Story points quote verified records only and link to their sources. The tour's rooms are recreations modelled
            from photographs (only cleared ones supply pixels), and each label says what its photograph shows; the globe
            uses NASA Blue Marble imagery; each portrait is a verified archive record, credited under it (cropped to the
            frame, never altered). Full list in app/CREDITS.md.
          </p>
        </footer>
      </main>

      <GuidePanel inductee={active >= 0 && !tour ? inductees[active] : null} onYes={startTour} reduced={reduced} />
      <TourTransition request={tour} reduced={reduced} onStartTour={onStartTour} onDone={endTour} />
    </div>
  )
}
