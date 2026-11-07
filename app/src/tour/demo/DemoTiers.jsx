// tour.html?demo=photo-room | gallery-case — the two cheaper chapter presentations, built for Hedy
// Lamarr so the owner can compare them before approving the room plan:
//   photo-room    "Arriving": one archival photograph made walkable by camera projection (PhotoRoom)
//   gallery-case  "The invention": no photograph of the place exists; the documents in a lit case in
//                 an IHH gallery, a wall panel of verified lines (GalleryCase)
// A small switcher at the top moves between the two. Both use the tour's shared HUD parts
// (hud/HudParts.jsx): title block with the basis note under More, numbered stop dots along the
// bottom, the icon-only sound toggle (and the M key), and the controls hint once per chapter.
// Picking a stop moves the camera to the object and the guide talks about it; documents open in the
// shared ArtifactViewer.
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { LabelLayer } from '../labels.jsx'
import { LabelCamera } from '../labelCamera.jsx'
import { dprFor } from '../../shared/dpr.js'
import { SpeechBubble } from '../../shared/guide/SpeechBubble.jsx'
import { ControlsHint, SoundToggle, StopDots, TitleBlock } from '../hud/HudParts.jsx'
import { speaker } from '../../shared/guide/speech.js'
import { setState as setTourState } from '../store.js'
import { PhotoRoom } from './PhotoRoom.jsx'
import { GalleryCase } from './GalleryCase.jsx'
import { LAMARR_CHAPTERS_DEMO } from '../data/lamarr-chapters-demo.js'
import { ARRIVING_CLIP, INVENTION_CLIP } from './lamarr-demo-artifacts.js'
import '../tour.css'
import './demo.css'

const ArtifactViewer = lazy(() => import('../artifact/ArtifactViewer.jsx'))

// tier, chapter and place words, the basis note and the stops come from the chapters themselves
const [ARRIVING_CHAPTER, INVENTION_CHAPTER] = ['arriving', 'big-work'].map((id) => LAMARR_CHAPTERS_DEMO.chapters.find((c) => c.id === id))
const DEMOS = {
  'photo-room': {
    tier: 'Photo room',
    chapter: ARRIVING_CHAPTER.title,
    place: ARRIVING_CHAPTER.place.label,
    note: ARRIVING_CHAPTER.place.note,
    hint: { desktop: 'Drag to look around · Scroll or ↑ ↓ to move closer · Keys 1–2 visit the objects · M mutes the guide', phone: 'Drag to look around · Pinch to move closer · Tap a number' },
    clip: ARRIVING_CLIP,
    objects: ARRIVING_CHAPTER.stops,
  },
  'gallery-case': {
    tier: 'Gallery case',
    chapter: INVENTION_CHAPTER.title,
    place: INVENTION_CHAPTER.place.label,
    note: INVENTION_CHAPTER.place.note,
    hint: { desktop: 'Drag to look · W A S D or click the floor to walk · Keys 1–3 visit the objects · M mutes the guide', phone: 'Drag to look around · Tap a number to visit an object' },
    clip: INVENTION_CLIP,
    objects: INVENTION_CHAPTER.stops,
  },
}

function useMedia(q) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

function Switcher({ demo }) {
  return (
    <nav className="demo-switch glass-pill" aria-label="Compare chapter presentations">
      {Object.entries(DEMOS).map(([id, d]) => (
        <a key={id} href={`/tour.html?demo=${id}`} className={`demo-switch-item ${id === demo ? 'is-on' : ''}`} aria-current={id === demo ? 'page' : undefined}>
          <span className="demo-switch-tier">{d.tier}</span>
          <span className="demo-switch-chapter">{d.chapter}</span>
        </a>
      ))}
    </nav>
  )
}

export default function DemoTiers({ demo = 'photo-room' }) {
  const cfg = DEMOS[demo] || DEMOS['photo-room']
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const phone = useMedia('(max-width: 720px), (pointer: coarse)')
  const [focus, setFocus] = useState(null)
  const [seen, setSeen] = useState([])
  const [open, setOpen] = useState(null)
  const [pointAt, setPointAt] = useState(null)
  const [nod, setNod] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [arrived, setArrived] = useState(demo !== 'gallery-case' || reduced)
  const [hintCue, setHintCue] = useState(0)
  const spots = useRef({})
  const run = useRef(0)
  const controls = useRef()

  useEffect(() => {
    document.title = `${cfg.tier}: ${cfg.chapter} · Hedy Lamarr · Immigrant Hall of Honor`
    // the shared speech bubble reads the tour store; keep the room phase so it lays out as in a room
    setTourState({ phase: 'room', started: true })
    const unlock = () => speaker.unlock()
    window.addEventListener('pointerdown', unlock, { once: true, capture: true })
    window.addEventListener('keydown', unlock, { once: true, capture: true })
    return () => speaker.stop()
  }, [cfg])

  // gallery: the place card fades as the camera arrives from the door (GalleryCase glides it in)
  useEffect(() => {
    if (arrived) return
    const t = setTimeout(() => setArrived(true), 3000)
    return () => clearTimeout(t)
  }, [arrived])

  // the controls hint once the chapter has opened (after the glide in the gallery)
  useEffect(() => {
    if (!arrived) return
    const t = setTimeout(() => setHintCue((n) => n + 1), demo === 'gallery-case' ? 300 : 1200)
    return () => clearTimeout(t)
  }, [arrived, demo])

  const onReady = useCallback((info) => (spots.current = info.spots), [])

  const where = (id) => {
    const s = spots.current[id]
    if (!s) return null
    if (s.isVector3) return s.clone()
    return s.current ? s.current.getWorldPosition(new THREE.Vector3()) : null
  }

  const pick = useCallback(
    (id) => {
      const obj = cfg.objects.find((o) => o.id === id)
      if (!obj) return
      const mine = ++run.current
      speaker.stop()
      setPlaying(false)
      setFocus(id)
      setSeen((s) => (s.includes(id) ? s : [...s, id]))
      setPointAt(where(id))
      setNod((n) => n + 1)
      if (!obj.art) {
        // no record to open (the wall panel): the guide talks about it while the camera holds there
        if (obj.clip) {
          speaker.unlock()
          speaker.playClip({ ...obj.clip, who: 'Guide' }).then((ok) => ok && mine === run.current && setNod((n) => n + 1))
        }
        return
      }
      // the camera goes to the object first (in the photo room the file rises from the rail), then
      // the viewer opens on it and the guide talks about it
      const wait = reduced ? 150 : demo === 'gallery-case' ? 1100 : id === 'file' ? 1050 : 700
      setTimeout(() => mine === run.current && setOpen(obj), wait)
    },
    [cfg, demo, reduced],
  )

  const back = () => {
    run.current++
    speaker.stop()
    setOpen(null)
    setFocus(null)
    setPointAt(null)
  }

  const hear = async () => {
    if (playing) {
      speaker.stop()
      setPlaying(false)
      return
    }
    run.current++
    setOpen(null)
    speaker.unlock()
    setPlaying(true)
    const ok = await speaker.playClip({ ...cfg.clip, who: 'Guide' })
    setPlaying(false)
    if (ok) setNod((n) => n + 1)
  }

  const props = { phone, reduced, focus, seen, onPick: pick, pointAt, nod, onReady }

  return (
    <main tabIndex={-1} className={`tour-stage demo-tiers demo-${demo} ${phone ? 'is-phone' : ''} ${reduced ? 'is-reduced' : ''}`}>
      <Canvas
        shadows={demo === 'gallery-case'}
        dpr={dprFor(phone)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: phone ? 62 : 50, near: 0.05, far: 6000, position: [0, 1.6, 4] }}
        role="img"
        aria-label={demo === 'photo-room' ? 'A photograph of New York Harbor you can look into' : 'A gallery with a lit case of documents'}
      >
        <LabelCamera />
        <Suspense fallback={null}>{demo === 'gallery-case' ? <GalleryCase {...props} controlsRef={controls} glide={!reduced} /> : <PhotoRoom {...props} />}</Suspense>
      </Canvas>
      <div className="demo-vignette" aria-hidden="true" />

      <LabelLayer />

      <div className="tour-hud phase-room">
        <header className="hud-top">
          <TitleBlock name="Hedy Lamarr" stop={`${cfg.chapter} · ${cfg.place}`} note={cfg.note} />
          {!phone && <Switcher demo={demo} />}
          <div className="hud-actions">
            <SoundToggle />
          </div>
        </header>
        {phone && <Switcher demo={demo} />}

        <ControlsHint cue={hintCue} chapter={`lamarr:demo:${demo}`} text={cfg.hint[phone ? 'phone' : 'desktop']} />

        <StopDots items={cfg.objects} focus={focus} seen={seen} onSelect={pick} label="Objects in this chapter" />
        {focus && !open && (
          <button type="button" className="btn-glass hud-back" onClick={back}>
            Step back
          </button>
        )}

        <footer className="hud-bottom">
          <div className="bubble-slot">
            <SpeechBubble tail="down" />
          </div>
          <button type="button" className={`btn-next ${playing ? 'is-ready' : ''}`} onClick={hear} aria-pressed={playing}>
            <span className="btn-next-eyebrow">Your guide</span>
            <span className="btn-next-label">{playing ? 'Stop' : 'Hear this chapter'}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              {playing ? <path d="M7 7h10v10H7z" fill="currentColor" /> : <path d="M8 6l10 6-10 6z" fill="currentColor" />}
            </svg>
          </button>
        </footer>
      </div>

      {demo === 'gallery-case' && (
        <div className={`demo-arrive ${arrived ? 'is-gone' : ''}`} aria-hidden={arrived}>
          <span className="eyebrow">{cfg.chapter}</span>
          <span className="demo-arrive-place">{cfg.place}</span>
        </div>
      )}

      {open && (
        <Suspense fallback={null}>
          <ArtifactViewer key={open.id + open.art.kind} art={open.art} reduced={reduced} autoOpen autoPlay eyebrowExtra={open.extra || ''} onClose={back} />
        </Suspense>
      )}
    </main>
  )
}
