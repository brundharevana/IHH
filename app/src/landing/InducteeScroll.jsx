import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scrollState } from './store.js'
import { ObjectFrame, objectCaption, KIND_LABEL } from './Artifact.jsx'
import { INDUCTEES as TOURS, resolveStop } from '../tour/data/index.js'
import { visitorRights } from '../shared/rightsText.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const PENDING = 'Story point — pending verification'

// Object anchors on the portrait edge, in tour order alternating left and right, each side spread
// evenly down the portrait and the two sides staggered (searchablemuseum-style). Scales from 4 to 10
// points; with five or more a side the objects shrink (see `data-dense` in landing.css) so neighbours
// on a side never touch at 1280 x 720 or on a phone.
function anchorsFor(n) {
  const perSide = [Math.ceil(n / 2), Math.floor(n / 2)]
  return Array.from({ length: n }, (_, k) => {
    const left = k % 2 === 0
    const m = perSide[left ? 0 : 1]
    const step = 84 / m
    return { side: left ? 'l' : 'r', top: +(8 + step * (Math.floor(k / 2) + (left ? 0.3 : 0.8))).toFixed(1) }
  })
}

// How close the scrolled bay must be to a whole number before that inductee is "here": while the
// camera trucks between niches nothing is shown, so a card never rides over a moving corridor.
const SETTLE = 0.12

function Silhouette() {
  return (
    <div className="portrait-pending" role="img" aria-label="Portrait pending rights clearance">
      <svg viewBox="0 0 200 250" aria-hidden="true">
        <circle cx="100" cy="92" r="40" />
        <path d="M24 250c0-58 34-92 76-92s76 34 76 92z" />
      </svg>
      <span>Portrait pending rights clearance</span>
    </div>
  )
}

function tourLabel(slug, point) {
  // a chapter point is itself the destination: its label is the chapter title
  if (!TOURS[slug] || point.pending || point.kind) return null
  return resolveStop(slug, point.id).label || null
}

function ArtifactPoint({ point, a, k, open, onOpen, tabIndex, btnRef }) {
  const label = point.pending ? PENDING : point.label
  return (
    <button
      ref={btnRef}
      type="button"
      className={`art art--${a.side}${point.pending ? ' art--pending' : ''}${open ? ' is-open' : ''}`}
      style={{ top: `${a.top}%` }}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={`${label}. ${objectCaption(point)}. Open the story point.`}
      tabIndex={tabIndex}
      onClick={() => onOpen(k)}
    >
      <ObjectFrame point={point} />
      <span className="art-line" aria-hidden="true" />
      <span className="art-label" aria-hidden="true">
        <span className="art-kind">{objectCaption(point)}</span>
        <span className="art-title">{label}</span>
      </span>
    </button>
  )
}

function StoryCard({ inductee, point, k, side, onClose, onTour }) {
  const ref = useRef()
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [point])
  const m = point.artifact?.media
  const where = tourLabel(inductee.slug, point)
  return (
    <div
      className={`story-card glass-panel story-card--${side}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`sc-${inductee.slug}-${k}`}
      tabIndex={-1}
      ref={ref}
    >
      <button type="button" className="icon-btn story-close" onClick={onClose} aria-label="Close story point">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div className="story-object">
        <ObjectFrame point={point} large />
        {!point.pending && !m?.thumb && (
          <p className="story-object-note">
            {m
              ? `${KIND_LABEL[point.artifact.kind]} held by ${m.holder || 'its holder'}; cleared for use, not on display here yet.`
              : 'No image is linked to this record yet. The icon stands for the source the fact quotes.'}
          </p>
        )}
      </div>
      <p className="micro" id={`sc-${inductee.slug}-${k}`}>
        {inductee.name} &middot; {objectCaption(point)}
      </p>
      {point.pending ? (
        <>
          <h3 className="story-title">{PENDING}</h3>
          <p className="story-body">This slot stays empty until a record for it has been checked against its source.</p>
        </>
      ) : (
        <>
          <h3 className="story-title">{point.label}</h3>
          <p className="story-body">{point.claim}</p>
          <p className="story-source">
            Source:{' '}
            <a href={point.source.url} target="_blank" rel="noopener noreferrer">
              {point.source.title}
            </a>
            {point.source.institution ? `, ${point.source.institution}` : ''}
          </p>
          {m && (
            <p className="story-source">
              {KIND_LABEL[point.artifact.kind]}:{' '}
              <a href={m.url} target="_blank" rel="noopener noreferrer" title={visitorRights(m.rights)}>
                {m.title}
              </a>
              . {m.credit}
            </p>
          )}
          <button type="button" className="btn-secondary story-tour" onClick={(e) => onTour(e, point)}>
            <span>Tour from here</span>
            {where && <span className="story-tour-where">{where}</span>}
          </button>
        </>
      )}
    </div>
  )
}

// The credit's first sentence for the line under the name: a full stop after a lone initial ("William J. Clinton
// Library") does not end it; the whole credit and the rights words are in the link's title.
const firstSentence = (credit) => credit.split(/(?<!\b[A-Z])\. /)[0]

function Slide({ d, i, n, isActive, onTour, slideRef }) {
  const [open, setOpen] = useState(-1)
  const arts = useRef([])
  const chips = useRef([])
  const lastOpener = useRef(null)
  useEffect(() => {
    if (!isActive) setOpen(-1)
  }, [isActive])
  const close = useCallback(() => {
    setOpen(-1)
    // focus goes back to the object (or phone chip) that opened the card
    const el = lastOpener.current
    requestAnimationFrame(() => el?.focus({ preventScroll: true }))
  }, [])
  useEffect(() => {
    if (open < 0) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])
  const tab = isActive ? 0 : -1
  const openAt = (k, from) => {
    lastOpener.current = from
    setOpen(k)
  }
  const anchors = anchorsFor(d.points.length)
  const side = open >= 0 && anchors[open].side === 'l' ? 'r' : 'l'
  return (
    <article
      ref={slideRef}
      className={`slide${isActive ? ' is-active' : ''}${open >= 0 ? ' has-open' : ''}`}
      data-dense={Math.ceil(d.points.length / 2) >= 5 ? '' : undefined}
      aria-roledescription="slide"
      aria-label={`${i + 1} of ${n}: ${d.name}`}
      aria-hidden={!isActive}
      inert={!isActive}
    >
      <p className="eyebrow slide-eyebrow reveal-card">
        Inductee {i + 1} of {n}
      </p>
      <div className="portrait-wrap">
        <figure className="portrait reveal-card">
          {d.portrait ? (
            <img src={d.portrait.src} alt={d.portrait.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
          ) : (
            <Silhouette />
          )}
        </figure>
        {d.points.map((p, k) => (
          <ArtifactPoint
            key={p.id}
            point={p}
            a={anchors[k]}
            k={k}
            open={open === k}
            onOpen={(kk) => openAt(kk, arts.current[kk])}
            tabIndex={tab}
            btnRef={(el) => (arts.current[k] = el)}
          />
        ))}
      </div>
      <h2 className="ind-name reveal-card">{d.name}</h2>
      <p className="portrait-credit reveal-card">
        {d.portrait ? (
          <>
            <a href={d.portrait.url} target="_blank" rel="noopener noreferrer" tabIndex={tab} title={[d.portrait.credit, visitorRights(d.portrait.rights), d.portrait.changes].filter(Boolean).join(' ')}>
              Portrait: {firstSentence(d.portrait.credit)}
            </a>
            {/* a Creative Commons portrait: the licence, linked, and that it was cropped, in visible text (CC BY 4.0, 3(a)) */}
            {d.portrait.licence && (
              <span className="portrait-licence">
                {' · '}
                <a href={d.portrait.licence.url} target="_blank" rel="license noopener noreferrer" tabIndex={tab}>
                  {d.portrait.licence.name}
                </a>
                {d.portrait.changes ? ' · cropped' : ''}
              </span>
            )}
          </>
        ) : (
          'No portrait shown: none of the records for this inductee is cleared for use yet.'
        )}
      </p>
      {/* phone: the objects as a two-column list under the name */}
      <ul className="sp-list">
        {d.points.map((p, k) => (
          <li key={p.id} className="reveal-art">
            <button
              ref={(el) => (chips.current[k] = el)}
              type="button"
              className={`chip${p.pending ? ' chip--pending' : ''}${open === k ? ' is-open' : ''}`}
              onClick={() => openAt(k, chips.current[k])}
              tabIndex={tab}
              aria-expanded={open === k}
              aria-haspopup="dialog"
            >
              <ObjectFrame point={p} />
              <span className="chip-text" title={p.pending ? undefined : p.label}>{p.pending ? 'Pending verification' : p.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {open >= 0 && (
        <StoryCard inductee={d} point={d.points[open]} k={open} side={side} onClose={close} onTour={(e, p) => onTour(e, { inductee: d, stop: p.id, chapter: p.kind ? p.id : null })} />
      )}
    </article>
  )
}

// One reveal per inductee, played (not scrubbed) once the camera has settled at that niche:
// (the niche light rises first, tweened on entry), then portrait card and name fade/scale in
// together, then the objects draw in.
// Leaving is one quick fade of the whole slide (and its niche light), then the reveal rewinds
// unseen, so two inductees never share the screen. Reduced motion: no motion, just the end state.
function buildReveal(el, i, reduced) {
  const q = gsap.utils.selector(el)
  const r = (v) => (reduced ? 0 : v)
  const tl = gsap.timeline({ paused: true })
  tl.fromTo(
    q('.reveal-card'),
    { autoAlpha: 0, y: r(16), scale: reduced ? 1 : 0.955 },
    { autoAlpha: 1, y: 0, scale: 1, duration: r(0.85), ease: 'expo.out', stagger: r(0.03) },
    r(0.62),
  )
  tl.fromTo(q('.art .obj, .reveal-art'), { autoAlpha: 0, scale: reduced ? 1 : 0.6 }, { autoAlpha: 1, scale: 1, duration: r(0.55), ease: 'back.out(1.7)', stagger: r(0.09) }, r(1.15))
  tl.fromTo(q('.art-line'), { scaleX: 0 }, { scaleX: 1, duration: r(0.45), ease: 'power2.out', stagger: r(0.09) }, r(1.3))
  tl.fromTo(q('.art-label'), { autoAlpha: 0 }, { autoAlpha: 1, duration: r(0.5), ease: 'power2.out', stagger: r(0.09) }, r(1.45))
  return tl
}

export default function InducteeScroll({ inductees, reduced, onActive, onTour, onProgress }) {
  const root = useRef()
  const slides = useRef([])
  const [active, setActive] = useState(-1)
  const n = inductees.length

  useEffect(() => {
    onActive(active)
  }, [active, onActive])

  useGSAP(
    () => {
      const proxy = { bay: 0 }
      const reveals = slides.current.map((el, i) => {
        gsap.set(el, { autoAlpha: 0 })
        return buildReveal(el, i, reduced)
      })
      let last = -2
      const paint = () => {
        const bay = reduced ? Math.round(proxy.bay) : proxy.bay
        scrollState.bay = bay
        const near = Math.round(bay)
        const here = scrollState.arrive > 0.985 && Math.abs(bay - near) < SETTLE ? near : -1
        if (here !== last) {
          reveals.forEach((tl, i) => {
            const el = slides.current[i]
            if (i === here) {
              gsap.killTweensOf(el)
              gsap.set(el, { autoAlpha: 1, scale: 1 })
              // the niche light rises first, then the card (see buildReveal)
              gsap.to(scrollState.niche[i], { v: 1, duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.3, ease: 'power2.out', overwrite: true })
              tl.play()
            } else if (tl.progress() > 0 || gsap.getProperty(el, 'autoAlpha') > 0) {
              tl.pause()
              gsap.to(scrollState.niche[i], { v: 0, duration: reduced ? 0 : 0.6, ease: 'power1.out', overwrite: true })
              gsap.to(el, { autoAlpha: 0, scale: reduced ? 1 : 0.985, duration: reduced ? 0 : 0.28, ease: 'power2.in', onComplete: () => tl.pause(0) })
            }
          })
          last = here
          setActive(here)
        }
        onProgress?.()
      }

      // 1) arrival: the camera moves from the corridor to the first niche. Scrubbed, and it settles
      //    at one end or the other, so it never rests half-way.
      ScrollTrigger.create({
        id: 'arrive',
        trigger: root.current,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        snap: reduced ? undefined : { snapTo: [0, 1], directional: true, duration: { min: 0.4, max: 1 }, delay: 0.1, ease: 'power2.inOut' },
        onUpdate: (self) => {
          scrollState.arrive = self.progress
          paint()
        },
      })

      // 2) one viewport of scroll per inductee; the slide layer itself is fixed
      gsap.to(proxy, {
        bay: n - 1,
        ease: 'none',
        onUpdate: paint,
        scrollTrigger: {
          id: 'ind-pin',
          trigger: root.current,
          start: 'top top',
          end: () => `+=${(n - 1) * window.innerHeight}`,
          scrub: reduced ? true : 0.6,
          snap: reduced ? undefined : { snapTo: 1 / (n - 1), inertia: false, duration: { min: 0.3, max: 0.8 }, delay: 0.1, ease: 'power2.inOut' },
          invalidateOnRefresh: true,
        },
      })
      paint()
      return () => reveals.forEach((tl) => tl.kill())
    },
    { scope: root, dependencies: [reduced, n], revertOnUpdate: true },
  )

  const jump = (i) => {
    const st = ScrollTrigger.getById('ind-pin')
    if (!st) return
    const y = st.start + (st.end - st.start) * (i / (n - 1))
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section id="inductees" ref={root} className="inductees" aria-label="Inductees" tabIndex={-1} style={{ '--n': n }}>
      <div className="ind-layer">
        {inductees.map((d, i) => (
          <Slide key={d.slug} d={d} i={i} n={n} isActive={active === i} onTour={onTour} slideRef={(el) => (slides.current[i] = el)} />
        ))}
        <nav className={`ind-dots${active >= 0 ? ' is-on' : ''}`} aria-label="Choose an inductee">
          {inductees.map((d, i) => (
            <button key={d.slug} type="button" className={active === i ? 'is-active' : ''} aria-label={`Go to ${d.name}`} aria-current={active === i ? 'true' : undefined} onClick={() => jump(i)}>
              <span />
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}
