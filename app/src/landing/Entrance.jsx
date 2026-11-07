import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scrollState } from './store.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Short lines per entrance. They describe the scene only; no claims about anyone.
const LEDE = {
  harbor: 'Dawn over the water. Scroll to come ashore.',
  doors: 'The doors are heavy. Scroll to open them.',
  threads: 'Many routes, drawn toward one coast. Scroll to follow them in.',
}

// The hero, the about panel and the scroll cue fade with the scroll (their opacity is computed from --e in
// landing.css). A faded one must not take taps or focus: on a phone the invisible about panel lay over "Walk their
// journeys" and swallowed every tap (round 9 fix round 7b, found by the WordPress full-page test). Each [data-fade]
// element that has faded out is made inert and visibility: hidden (.is-faded), and given back as it fades in.
function hideFaded(root) {
  for (const el of root.querySelectorAll('[data-fade]')) {
    const faded = parseFloat(getComputedStyle(el).opacity) < 0.02
    if (el.classList.contains('is-faded') === faded) continue
    el.classList.toggle('is-faded', faded)
    el.inert = faded
  }
}

// reduced motion: cut between three held states instead of scrubbing
const cut = (e) => (e < 0.3 ? 0 : e < 0.8 ? 0.55 : 1)

export default function Entrance({ variant, reduced, onWalk, onProgress }) {
  const root = useRef()

  useGSAP(
    () => {
      const proxy = { e: 0 }
      const apply = () => {
        const e = reduced ? cut(proxy.e) : proxy.e
        scrollState.entrance = e
        root.current.style.setProperty('--e', e.toFixed(4))
        hideFaded(root.current)
        onProgress?.()
      }
      gsap.to(proxy, {
        e: 1,
        ease: 'none',
        onUpdate: apply,
        scrollTrigger: {
          id: 'entrance',
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? true : 0.9,
        },
      })
      apply()
    },
    { scope: root, dependencies: [variant, reduced], revertOnUpdate: true }
  )

  return (
    <section ref={root} className={`entrance entrance--${variant}`} aria-labelledby="ihh-title">
      <div className="entrance-sticky">
        <div className="hero" data-fade>
          <p className="eyebrow">A virtual museum</p>
          <h1 id="ihh-title" className="hero-title">
            <span>Immigrant</span> <span>Hall of Honor</span>
          </h1>
          <p className="hero-lede">{LEDE[variant]}</p>
          <button type="button" className="btn-primary" onClick={onWalk}>
            Walk their journeys
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 1v11M2.5 7.5 7 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <a className="btn-secondary hero-moments" href="tour.html?view=moments">
            Moments That Made Them
          </a>
        </div>

        <aside className="about glass-panel" aria-label="About this place" data-fade>
          <p className="micro">What this place is</p>
          <blockquote className="about-quote">
            <p>&ldquo;Immigrants built America. We&rsquo;re building a museum.&rdquo;</p>
            <footer>
              Immigrant Hall of Honor,{' '}
              <a href="https://immigranthallofhonor.org/" target="_blank" rel="noopener noreferrer">
                immigranthallofhonor.org
              </a>
            </footer>
          </blockquote>
          <p className="about-body">
            This page is a virtual hall for that museum. Five inductees wait along it. Each
            story point you open quotes a record that was checked against its source, and links to that source. Where
            a record has not been checked yet, the slot says so.
          </p>
        </aside>

        {variant === 'threads' && <p className="scene-caption">The routes drawn here are illustrative, not migration data.</p>}

        <div className="scroll-cue" aria-hidden="true" data-fade>
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  )
}
