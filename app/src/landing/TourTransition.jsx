import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { scrollState } from './store.js'

// Full-screen hand-off to the tour: the camera pushes into the niche while a circular mask of
// warm dark opens from the button that was pressed. Then onStartTour runs (see tourHook.js).

export default function TourTransition({ request, reduced, onStartTour, onDone }) {
  const root = useRef()
  const ring = useRef()
  const tl = useRef()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!request) return
    const el = root.current
    const { x, y } = request
    setPending(false)
    const at = `${x}px ${y}px`
    // radius that covers the farthest corner, in px so GSAP can interpolate it
    const R = Math.ceil(Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))) + 2
    const t = gsap.timeline({
      onComplete: async () => {
        const took = await onStartTour({ inductee: request.inductee.slug, stop: request.stop, chapter: request.chapter })
        if (!took) setPending(true)
      },
    })
    if (reduced) {
      t.set(el, { autoAlpha: 1, clipPath: `circle(${R}px at ${at})` }).set('.tt-text > *', { autoAlpha: 1, y: 0 }, 0)
    } else {
      t.set(el, { autoAlpha: 1, clipPath: `circle(0px at ${at})` })
        .set(ring.current, { left: x, top: y, scale: 0, autoAlpha: 1 })
        .to(scrollState, { warp: 1, duration: 1.5, ease: 'power2.in' }, 0)
        .to(ring.current, { scale: 1, duration: 0.9, ease: 'expo.out' }, 0)
        .to(ring.current, { autoAlpha: 0, duration: 0.5 }, 0.5)
        .to(el, { clipPath: `circle(${R}px at ${at})`, duration: 1.15, ease: 'expo.inOut' }, 0.2)
        .fromTo(el.querySelectorAll('.tt-text > *'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out' }, 0.75)
    }
    tl.current = t
    return () => t.kill()
  }, [request, reduced, onStartTour])

  // coming Back from the tour page (bfcache): open the hall again instead of a covered screen
  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return
      scrollState.warp = 0
      gsap.set(root.current, { autoAlpha: 0 })
      onDone()
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [onDone])

  const back = () => {
    setPending(false)
    const t = tl.current
    const finish = () => {
      scrollState.warp = 0
      gsap.set(root.current, { autoAlpha: 0 })
      onDone()
    }
    if (!t || reduced) return finish()
    t.eventCallback('onReverseComplete', finish)
    t.timeScale(1.6).reverse()
  }

  const name = request?.inductee.name
  const stopLabel = request?.stop ? request.inductee.points.find((p) => p.id === request.stop)?.label : null
  return (
    <>
      <span className="tt-ring" ref={ring} aria-hidden="true" />
      <div className="tour-transition" ref={root} role="dialog" aria-modal="true" aria-hidden={!request} aria-label="Starting the tour">
        <div className="tt-text">
          <p className="micro">Entering the tour</p>
          <p className="tt-name">{name}</p>
          {stopLabel && <p className="tt-stop">{request.chapter ? 'From chapter' : 'From story point'}: {stopLabel}</p>}
          {pending && (
            <div className="tt-pending glass-panel">
              <p>
                The tour scene is not in this build yet. Integration hook: <code>onStartTour(&#123; inductee, stop &#125;)</code>{' '}
                would open <code>tour.html?inductee={request.inductee.slug}{request.chapter ? `&chapter=${request.chapter}` : request.stop ? `&stop=${request.stop}` : ''}</code>.
              </p>
              <button type="button" className="btn-secondary" onClick={back} autoFocus>
                Back to the hall
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
