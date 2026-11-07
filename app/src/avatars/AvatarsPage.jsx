// Guide candidates: three avatars side by side in one scene, all playing the same scripted beat
// (idle -> talking with lip-sync -> point to the side -> nod) against one narration clip.
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Docent } from './Docent.jsx'
import { CANDIDATES, MOTION, MOTION_NOTE, VISEME_NOTE, mb } from './candidates.js'
import { BEATS, END, MOMENTS, SPEECH, beatAt } from './timeline.js'
import { Narration } from './voice.js'

const SPACING = 1.25
const VIEWS = {
  all: { pos: [0, 1.35, 5.6], look: [0, 1.05, 0], fov: 30 },
  a: { pos: [-SPACING + 0.2, 1.45, 3.4], look: [-SPACING + 0.2, 1.12, 0], fov: 30 },
  b: { pos: [0.2, 1.45, 3.4], look: [0.2, 1.12, 0], fov: 30 },
  c: { pos: [SPACING + 0.2, 1.5, 3.4], look: [SPACING + 0.2, 1.17, 0], fov: 30 },
  // head and shoulders, for judging the face and lip-sync
  'a-face': { pos: [-SPACING, 1.63, 1.3], look: [-SPACING, 1.59, 0], fov: 30 },
  'b-face': { pos: [0, 1.63, 1.3], look: [0, 1.59, 0], fov: 30 },
  'c-face': { pos: [SPACING, 1.68, 1.3], look: [SPACING, 1.64, 0], fov: 30 },
}

function Rig({ view, snap }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(...VIEWS.all.look))
  useFrame((_, dt) => {
    const v = VIEWS[view]
    const k = snap ? 1 : 1 - Math.exp(-dt * 4)
    camera.position.lerp(new THREE.Vector3(...v.pos), k)
    look.current.lerp(new THREE.Vector3(...v.look), k)
    camera.lookAt(look.current)
  })
  return null
}

function Gallery({ getT, narration, view }) {
  return (
    <>
      <color attach="background" args={['#0b0907']} />
      <fog attach="fog" args={['#0b0907', 9, 22]} />
      <hemisphereLight args={['#f6e7d2', '#2a2118', 0.6]} />
      <directionalLight position={[-1.5, 2.2, 5]} intensity={0.9} color="#fff1e0" />
      <directionalLight position={[2.5, 4.5, 3.5]} intensity={2.2} color="#ffe2bf" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -2, 0.5, 14]} />
      </directionalLight>
      <spotLight position={[-3, 3.2, 2]} angle={0.7} penumbra={0.8} intensity={14} color="#9fb2d6" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} color="#ffd8a8" scale={[10, 2, 1]} position={[0, 6, 2]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={0.9} color="#f0e8dd" scale={[4, 6, 1]} position={[-6, 2, 4]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={0.4} color="#9fb2d6" scale={[4, 6, 1]} position={[6, 2, -2]} rotation={[0, -Math.PI / 2, 0]} />
      </Environment>

      {/* stone floor and a back wall with a warm wash, so the silhouettes read */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial color="#2a241e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3, -3.2]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#4a3c2e" roughness={0.95} />
      </mesh>
      {/* the "exhibit" they point at: a framed placard on the guide's left (screen right) */}
      {CANDIDATES.map((c, i) => (
        <group key={c.id} position={[(i - 1) * SPACING + 0.55, 1.45, -0.55]} rotation-y={-0.5} visible={view === 'all' || view === c.id}>
          <mesh>
            <boxGeometry args={[0.26, 0.34, 0.02]} />
            <meshStandardMaterial color="#5a4630" roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position-z={0.011}>
            <planeGeometry args={[0.2, 0.28]} />
            <meshStandardMaterial color="#e9dcc6" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <ContactShadows position={[0, 0.002, 0]} opacity={0.55} scale={8} blur={2.4} far={2.5} resolution={512} />

      {CANDIDATES.map((c, i) => (
        <Docent key={c.id} cand={c} motionUrl={MOTION[c.motion].url} getT={getT} narration={narration} seed={i * 0.37} position={[(i - 1) * SPACING, 0, 0]} visible={view === 'all' || view === c.id} />
      ))}
    </>
  )
}

export function AvatarsPage({ fixedT = null, view: initialView = 'all', face: initialFace = false, autoplay = false }) {
  const narration = useMemo(() => new Narration('/avatars/2-narration.mp3', '/avatars/2-narration.vtt'), [])
  const [who, setWho] = useState(initialView)
  const [face, setFace] = useState(initialFace)
  const view = who === 'all' ? 'all' : face ? `${who}-face` : who
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(BEATS[0])
  const [audioOn, setAudioOn] = useState(null) // null until the narration is due
  const clock = useRef({ t0: performance.now(), base: fixedT ?? 0, playing: autoplay && fixedT === null, fixed: fixedT })

  useEffect(() => {
    narration.ready.then(() => setReady(true))
    return () => narration.stop()
  }, [narration])

  const getT = useCallback(() => {
    const c = clock.current
    if (c.fixed !== null) return c.fixed
    if (!c.playing) return c.base
    const t = c.base + (performance.now() - c.t0) / 1000
    if (t >= END) {
      c.playing = false
      c.base = END
      return END
    }
    return t
  }, [])

  // expose for screenshots: window.__avatars.seek(t)
  useEffect(() => {
    window.__avatars = {
      seek: (t) => { clock.current.fixed = t },
      time: () => getT(),
      ready: () => narration.ready,
    }
  }, [narration, getT])

  useEffect(() => {
    let id
    const tick = () => {
      const b = beatAt(getT())
      setBeat((p) => (p.id === b.id ? p : b))
      setPlaying(clock.current.playing)
      id = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(id)
  }, [getT])

  const playFrom = async (t) => {
    const c = clock.current
    c.fixed = null
    c.base = t
    c.t0 = performance.now()
    c.playing = true
    narration.stop()
    setAudioOn(null)
    const at = t - SPEECH.at + SPEECH.from
    // the narration starts at SPEECH.at; schedule it, or join it mid-way
    clearTimeout(c.timer)
    const start = async (from) => {
      const ok = await narration.play(from)
      setAudioOn(ok)
      // keep the timeline locked to the audio clock once it plays
      if (ok) {
        c.base = SPEECH.at + (from - SPEECH.from)
        c.t0 = performance.now() - (narration.audio.currentTime - from) * 1000
        const stopAt = () => {
          if (narration.audio.currentTime >= SPEECH.to) narration.stop()
          else if (c.playing) requestAnimationFrame(stopAt)
        }
        stopAt()
      }
    }
    if (at < SPEECH.from) c.timer = setTimeout(() => start(SPEECH.from), (SPEECH.at - t) * 1000)
    else if (at < SPEECH.to) start(at)
  }

  const stop = () => {
    const c = clock.current
    c.base = getT()
    c.playing = false
    clearTimeout(c.timer)
    narration.stop()
  }

  const jump = (t) => {
    stop()
    clock.current.fixed = null
    clock.current.base = t
  }

  return (
    <div className="av-page">
      <header className="av-head">
        <div>
          <span className="eyebrow">Immigrant Hall of Honor · guide avatar</span>
          <h1>Three candidates for the museum guide</h1>
          <p className="av-lede">
            Same script for all three: idle, then talking with lip-sync to the Einstein study narration, a gesture
            toward the exhibit at their side, and a nod. Pick one; the motion and face rig carry over to the tour.
          </p>
        </div>
        <div className="av-cams">
          <nav className="seg" aria-label="Camera">
            {[['all', 'All three'], ['a', 'A'], ['b', 'B'], ['c', 'C']].map(([k, l]) => (
              <button key={k} type="button" className={who === k ? 'is-on' : ''} aria-pressed={who === k} onClick={() => setWho(k)}>
                {l}
              </button>
            ))}
          </nav>
          <button type="button" className={`chip ${face && who !== 'all' ? 'is-on' : ''}`} aria-pressed={face} disabled={who === 'all'} onClick={() => setFace((f) => !f)}>
            Face close-up
          </button>
        </div>
      </header>

      <section className="av-stage" aria-label="Avatar comparison scene">
        <Canvas shadows dpr={[1, 2]} camera={{ position: VIEWS.all.pos, fov: 30, near: 0.1, far: 40 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}>
          <Rig view={view} snap={fixedT !== null} />
          <Suspense fallback={null}>
            <Gallery getT={getT} narration={narration} view={who} />
          </Suspense>
        </Canvas>

        <div className="av-controls glass-panel">
          <button type="button" className="btn-accent" onClick={() => (playing ? stop() : playFrom(getT() >= END - 0.1 ? 0 : getT()))} disabled={!ready}>
            {playing ? 'Pause' : 'Play the sequence'}
          </button>
          <ol className="av-beats" aria-label="Jump to a moment">
            {MOMENTS.map((m) => (
              <li key={m.id}>
                <button type="button" className={`chip ${beat.id === m.id || (m.id === 'idle' && beat.id === 'rest') ? 'is-on' : ''}`} onClick={() => jump(m.t)}>
                  {m.label}
                </button>
              </li>
            ))}
          </ol>
          <span className="av-audio" aria-live="polite">{!playing ? 'Sound on when you press play' : audioOn === null ? 'Narration starts after the idle beat' : audioOn ? 'Narration playing' : 'Narration blocked by the browser; the mouth still follows the recording'}</span>
        </div>
      </section>

      <section className="av-cards" aria-label="Candidate details">
        {CANDIDATES.map((c) => (
          <article key={c.id} className={`av-card glass-panel ${who === c.id ? 'is-on' : ''}`}>
            <span className="eyebrow">{c.label}</span>
            <h2>{c.name}</h2>
            <p className="av-look">{c.look}</p>
            <dl>
              <dt>Source</dt>
              <dd><a href={c.sourceUrl} target="_blank" rel="noreferrer">{c.source}</a></dd>
              <dt>Licence</dt>
              <dd>{c.licence}</dd>
              <dt>File size</dt>
              <dd>{mb(c.bytes)} model + {mb(MOTION[c.motion].bytes)} shared motion file ({c.motion})</dd>
              <dt>Face</dt>
              <dd>{VISEME_NOTE}</dd>
              <dt>Motion</dt>
              <dd>{MOTION_NOTE}</dd>
            </dl>
          </article>
        ))}
      </section>
      <footer className="av-foot">
        Lip-sync here is approximate (recording loudness plus caption letters mapped to visemes). Narration lines are
        verified fact text from content/einstein. Credits: app/CREDITS.md.
      </footer>
    </div>
  )
}
