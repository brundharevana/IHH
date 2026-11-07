// <StepTour inductee step startFocus onEnd /> — a tour with only `steps` (map legs and recreated
// rooms, data/<slug>.js), played in order, until each inductee is converted to chapters (then it
// plays in ChapterPlayer.jsx). Renders its own canvas and glass HUD. Loaded lazily by index.jsx.
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { lazyChunk } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { INDUCTEES } from './data/index.js'
import { firstPlace, lastPlace } from './data/shape.js'
import { MapStage } from './map/MapStage.jsx'
import { RoomStage } from './room/RoomStage.jsx'
import { artifactById } from './data/artifacts.js'
import { Hud } from './hud/Hud.jsx'
import { createPhrasebook } from './phrases.js'
import { getState, setState, useTour } from './store.js'
import { speaker } from '../shared/guide/speech.js'
import { LabelLayer } from './labels.jsx'
import { LabelCamera } from './labelCamera.jsx'
import { dprFor } from '../shared/dpr.js'
import './tour.css'

function useMedia(q) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(q).matches
  const [m, setM] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

// Dev-only handle for inspecting the scene from the browser console.
function DevHandle() {
  const state = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__tour3 = state
    // the browser automation runs in an isolated world: answer DOM events instead
    const on = (e) => {
      try {
        document.body.dataset.tourDebug = JSON.stringify(new Function('s', 'THREE', e.detail)(state, THREE))
      } catch (err) {
        document.body.dataset.tourDebug = 'ERR ' + err.message
      }
    }
    document.addEventListener('tour-debug', on)
    return () => document.removeEventListener('tour-debug', on)
  }, [state])
  return null
}

// the viewer and its stages (three.js loaders, glTF decoders) load only when an artifact opens
const ArtifactViewer = lazyChunk(() => import('./artifact/ArtifactViewer.jsx'), 'the record viewer')
const Moments = lazyChunk(() => import('./moments/Moments.jsx'), 'Moments')

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export default function StepTour({ inductee = 'einstein', step: startStep = 0, startFocus = null, startLabel = null, onEnd, mapVariant, autostart = false, openLetter = false }) {
  const data = INDUCTEES[inductee] || INDUCTEES.einstein
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const phone = useMedia('(max-width: 720px), (pointer: coarse)')
  const started = useTour((s) => s.started)
  const phase = useTour((s) => s.phase)
  const stepIdx = useTour((s) => s.step)
  const variant = useTour((s) => s.mapVariant)
  const run = useTour((s) => s.mapRun)
  const focus = useTour((s) => s.focus)
  const seen = useTour((s) => s.seen)
  const letterOpen = useTour((s) => s.letterOpen)
  const step = data.steps[stepIdx] || data.steps[0]
  const room = step.type === 'room' ? step.room : null
  const book = useMemo(() => createPhrasebook(room?.id), [room])
  const roomRef = useRef(room)
  roomRef.current = room
  const controls = useRef()
  const roomInfo = useRef(null)
  const selRun = useRef(0)
  const closed = useRef(false) // this room's closing narration has played
  const [roomSource, setRoomSource] = useState('stand-in')
  const [roomNote, setRoomNote] = useState(null)
  const [objects, setObjects] = useState(false)

  // sound needs a gesture: Begin, or the first click / key press when the tour autostarts
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
    const i = Math.min(Math.max(0, startStep), data.steps.length - 1)
    setState({ step: i, phase: data.steps[i].type, started: autostart, ...(mapVariant ? { mapVariant } : {}), focus: null, travel: 0, seg: -1, seen: [], hintCue: 0 })
    return () => speaker.stop()
  }, [startStep, mapVariant, autostart, data])

  // Map leg: the guide narrates while the route draws itself.
  useEffect(() => {
    if (!started || phase !== 'map' || step.type !== 'map') return
    let live = true
    setState({ travel: 0, seg: -1 })
    speaker.playClip({ ...step.narration, who: 'Guide' }).then((ok) => live && ok && setState((s) => ({ nod: s.nod + 1 })))
    return () => {
      live = false
      speaker.stop()
    }
  }, [started, phase, step, variant, run])

  // Room arrival: the story point the visitor came from, else the room's narration (facts about the
  // place) and then the guide's arrival line.
  const pendingFocus = useRef(startFocus)
  useEffect(() => {
    if (!started || phase !== 'room' || !room) return
    let live = true
    closed.current = false
    const t = setTimeout(async () => {
      const f = pendingFocus.current
      if (f) {
        // the room may still be loading: onReady picks the stop up then
        if (roomInfo.current?.room.id === room.id) {
          pendingFocus.current = null
          selectRef.current?.(f)
        }
        return
      }
      if (speaker.speaking) return
      const mine = selRun.current
      if (room.narration && !(await speaker.playClip({ ...room.narration, who: 'Guide' }))) return
      if (!live || mine !== selRun.current || getState().focus !== null) return
      // the opening line invites the visitor to look around: the controls hint shows with it
      setState((s) => ({ hintCue: s.hintCue + 1 }))
      speaker.say(book.arrival({ invite: true }))
    }, 900)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [started, phase, room, book])

  const select = useCallback(
    async (id) => {
      if (!room) return
      const art = room.artifacts.find((a) => a.id === id)
      const info = roomInfo.current
      const spot = info?.spots.find((s) => s.id === id)
      if (!art || !spot) return
      const mine = ++selRun.current
      speaker.stop()
      setState({ focus: id, pointAt: spot.center.toArray(), letterOpen: false })
      controls.current?.focus(spot.object, info.room.views?.[id])
      const still = () => mine === selRun.current
      const intro = book.intro(id)
      if ((intro && !(await speaker.say(intro))) || !still()) return
      if (art.artifact) {
        setState((s) => ({ letterOpen: true, seen: s.seen.includes(id) ? s.seen : [...s.seen, id], nod: s.nod + 1, pointAt: null }))
        return
      }
      if (!(await speaker.playClip({ ...art.clip, who: 'Guide' })) || !still()) return
      setState((s) => ({ seen: s.seen.includes(id) ? s.seen : [...s.seen, id], nod: s.nod + 1, pointAt: null }))
      await wait(900)
      if (!still()) return
      const unseen = room.artifacts.map((a) => a.id).filter((x) => !getState().seen.includes(x))
      if (!unseen.length && room.closing && !closed.current) {
        // every object seen: the room's closing lines, then the guide's own last word
        closed.current = true
        if (!(await speaker.playClip({ ...room.closing, who: 'Guide' })) || !still()) return
        setState((s) => ({ nod: s.nod + 1 }))
        await wait(500)
        if (!still()) return
      }
      const nudge = book.nudge(unseen)
      if (nudge) speaker.say(nudge)
    },
    [room, book],
  )

  const selectRef = useRef(select)
  selectRef.current = select
  // dev only: drive focus from the browser (camera checks in the mockup scripts)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__tourApi = { select: (id) => selectRef.current(id), back: () => backRef.current(), info: () => roomInfo.current, controls: () => controls.current }
  }, [])

  const back = useCallback(() => {
    const id = getState().focus
    const info = roomInfo.current
    const spot = info?.spots.find((s) => s.id === id)
    selRun.current++
    setState({ focus: null, pointAt: null, letterOpen: false })
    controls.current?.back(info?.room.views?.[id], spot ? spot.center.toArray() : null)
  }, [])
  const backRef = useRef(back)
  backRef.current = back

  // ?letter=open for the mockup screenshots: jump straight to the letter once the room is ready.
  const onReady = useCallback(
    (info) => {
      roomInfo.current = info
      setRoomSource(info.room.source)
      setRoomNote(info.room.label || null)
      if (pendingFocus.current && getState().started && getState().phase === 'room') {
        const f = pendingFocus.current
        pendingFocus.current = null
        setTimeout(() => select(f), 600)
      }
      const opener = openLetter && info.room.id && roomRef.current?.artifacts.find((a) => a.artifact)
      if (opener && !getState().letterOpen && !info.opened && info.spots.some((s) => s.id === opener.id)) {
        info.opened = true
        setTimeout(() => select(opener.id), 400)
      }
    },
    [openLetter, select],
  )

  const focusArt = room?.artifacts.find((a) => a.id === focus)
  const openArt = focusArt?.artifact ? artifactById(focusArt.artifact) : null

  const nextStep = data.steps[stepIdx + 1] || null
  const unseen = room ? room.artifacts.filter((a) => !seen.includes(a.id)) : []
  const nextLabel =
    phase === 'map' || !room
      ? nextStep?.title || 'Finish the tour'
      : unseen.length
        ? unseen.find((a) => a.id !== focus)?.name || unseen[0].name
        : nextStep?.title || 'Finish the tour'
  const end = () => {
    speaker.stop()
    selRun.current++
    onEnd?.()
  }
  const goStep = (i) => {
    speaker.stop()
    selRun.current++
    roomInfo.current = null
    const s = data.steps[i]
    setState((st) => ({ step: i, phase: s.type, focus: null, pointAt: null, letterOpen: false, seen: [], travel: 0, seg: -1, hintCue: 0, mapRun: s.type === 'map' ? st.mapRun + 1 : st.mapRun }))
  }
  const next = () => {
    if (phase === 'room' && room) {
      const target = unseen.find((a) => a.id !== focus) || unseen[0]
      if (target) return select(target.id)
    }
    if (nextStep) goStep(stepIdx + 1)
    else end()
  }

  const first = firstPlace(data)
  const last = lastPlace(data)
  const mapLabel = step.type === 'map' ? `Map of the journey: ${step.places.map((p) => p.label).join(', then ')}` : ''

  return (
    <main tabIndex={-1} className={`tour-stage ${phone ? 'is-phone' : ''} ${reduced ? 'is-reduced' : ''} ${phase === 'map' && variant !== 'globe' ? 'map-paper' : ''}`}>
      <Canvas
        shadows
        dpr={dprFor(phone)}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: phone ? 70 : 58, near: 0.01, far: 400, position: [0, 1.6, 2.2] }}
        role="img"
        aria-label={phase === 'map' ? mapLabel : `${room?.title || 'The room'}, a room you can look around`}
      >
        <DevHandle />
        <LabelCamera />
        <Suspense fallback={null}>
          {phase === 'map' && step.type === 'map' ? (
            <MapStage key={`${step.id}-${run}`} leg={step} reduced={reduced} />
          ) : room ? (
            <RoomStage key={room.id} room={room} phone={phone} reduced={reduced} controlsRef={controls} onPick={select} onReady={onReady} />
          ) : null}
        </Suspense>
      </Canvas>

      <LabelLayer />

      <Hud data={data} step={step} room={room} phone={phone} roomSource={roomSource} roomNote={roomNote} onEnd={end} onNext={next} nextLabel={nextLabel} onSelect={select} onBack={back} hintKey={room ? `${data.slug || inductee}:${room.id}` : null} onObjects={() => {
        speaker.stop()
        selRun.current++
        setObjects(true)
      }} />

      {objects && (
        <ChunkSuspense what="Moments" onClose={() => setObjects(false)}>
          <Moments reduced={reduced} onClose={() => setObjects(false)} />
        </ChunkSuspense>
      )}

      {letterOpen && openArt && (
        <ChunkSuspense what="the record viewer" onClose={() => setState({ letterOpen: false })}>
          <ArtifactViewer
            key={openArt.id}
            art={openArt}
            reduced={reduced}
            autoOpen={reduced}
            onClose={() => setState({ letterOpen: false })}
          />
        </ChunkSuspense>
      )}

      {!started && (
        <div className="tour-splash">
          <div className="glass-panel splash-card">
            <span className="eyebrow">Immigrant Hall of Honor · Guided tour</span>
            <h1 className="splash-title">{data.name}</h1>
            {first && last && (
              <p className="splash-sub">
                {first.label}{first.date ? ` · ${first.date}` : ''}
                <span aria-hidden="true"> — </span>
                {last.label}{last.date ? ` · ${last.date}` : ''}
              </p>
            )}
            {startLabel && <p className="splash-from">Starting at: {startLabel}</p>}
            <p className="splash-note">Your guide speaks with captions (AI voice). Sound on if you can.</p>
            <button
              type="button"
              className="btn-cream"
              autoFocus
              onClick={() => {
                speaker.unlock()
                setState({ started: true })
              }}
            >
              Begin the tour
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

