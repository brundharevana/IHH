// <ChapterPlayer tour startChapter onEnd /> — plays an inductee's tour as turning-point chapters
// (data/chapters.js): for each chapter its map leg (if it has one: the unroll map with its places
// and segments), then its place on one of three tiers — a rebuilt room (room/RoomStage.jsx), a photo
// room (place/PhotoRoomStage.jsx) or a gallery case (place/GalleryCaseStage.jsx) — then the next
// chapter. One shared HUD on every chapter (hud/HudParts.jsx): title block (name; chapter · place;
// the basis note under More), End tour and the sound toggle, the chapter's numbered stops, the
// controls hint with the opening line, "Hear this chapter" (bottom right: the opening and the
// chapter's narration again) and "Next chapter" in the next-stop slot. The opening is the chapter's
// own `opening` clip, else its voiced opening line '<slug>:ch:<kind>:opening' (narration/<slug>.json,
// gated by check_narration.py). A chapter's closing lines (a room's `room.closing`, a photo room's or gallery's
// `closing`) play once every stop has been visited.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { mapCanvasLabel } from './hud/mapFootnote.js'
import { mapFootnote } from './hud/mapFootnote.js'
import { ControlsHint, MomentsButton, SoundToggle, StopDots, TitleBlock } from './hud/HudParts.jsx'
import { SpeechBubble } from '../shared/guide/SpeechBubble.jsx'
import { speaker } from '../shared/guide/speech.js'
import { artifactById, backdropOf } from './data/artifacts.js'
import { INDUCTEES, nextInductee } from './data/index.js'
import { FOCUS_SETTLE_MS, focusReady, focusSearches } from './place/photoProjection.js'
import { createPhrasebook } from './phrases.js'
import { getState, setState, useTour } from './store.js'
import { LabelLayer } from './labels.jsx'
import { versioned } from '../shared/assetVersion.js'
import { isChunkError, lazyChunk, reloadPage } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'
import './tour.css'

// The canvas with its stages (three.js, react-three-fiber, the room and map code) loads after the
// HUD and the Begin card are up; the two cheaper stages (and the gallery's fact index) load only
// when a chapter needs them (TourCanvas.jsx).
const TourCanvas = lazyChunk(() => import('./TourCanvas.jsx'), 'the 3D stage')
const Moments = lazyChunk(() => import('./moments/Moments.jsx'), 'Moments')
const ArtifactViewer = lazyChunk(() => import('./artifact/ArtifactViewer.jsx'), 'the record viewer')

const HINTS = {
  room: { desktop: 'Drag to look · W A S D or click the floor to walk · Keys 1–9 visit the objects · M mutes the guide', phone: 'Drag to look around · Tap a number to visit an object' },
  gallery: { desktop: 'Drag to look · W A S D or click the floor to walk · Keys 1–9 visit the objects · M mutes the guide', phone: 'Drag to look around · Tap a number to visit an object' },
  photo: { desktop: 'Drag to look around · Scroll or ↑ ↓ to move closer · Keys 1–9 visit the objects · M mutes the guide', phone: 'Drag to look around · Pinch to move closer · Tap a number' },
}
// the band's gap under the lowest top HUD panel (place.hudBand), in CSS px
const BAND_GAP = 8
const GALLERY_NOTE = 'Gallery case — no photograph of the place is on file, so the documents are shown in an IHH gallery. The gallery is not a recreation of a real room.'

function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
// the chapter's opening line: its own clip, else the voiced line for its kind; only keys the
// visitor's guide has a clip for (resolved when it plays, so it follows the current voice)
const openingOf = (tour, c) => {
  const o = c.opening || { keys: [`${tour.slug}:ch:${c.kind}:opening`], factIds: [] }
  const keys = (o.keys || []).filter((k) => speaker.has(k))
  return keys.length ? { ...o, keys } : null
}
// "Hear this chapter": the opening, then the chapter's narration (a room's arrival lines), once each
const hearingOf = (opening, c) => {
  const parts = [opening, c.narration, c.place.tier === 'room' ? c.place.room?.narration : null].filter(Boolean)
  const keys = [...new Set(parts.flatMap((p) => p.keys || []))]
  return keys.length ? { keys, factIds: [...new Set(parts.flatMap((p) => p.factIds || []))] } : null
}
const placeLabel = (c) => c.place.label || c.place.room?.title || ''
// what the guide says once every stop is seen: a room's closing, else the chapter's own (a photo room's,
// a gallery's; the last chapter of a tour in time order may end there)
const closingOf = (c) => (c.place.tier === 'room' ? c.place.room?.closing : c.closing) || null
const recordOf = (stop) => stop.art || (stop.artifact ? artifactById(stop.artifact) : null)
// two clips as one: their keys in order, each once
const joinClips = (...clips) => {
  const parts = clips.filter((p) => p?.keys?.length)
  if (!parts.length) return null
  return { keys: [...new Set(parts.flatMap((p) => p.keys))], factIds: [...new Set(parts.flatMap((p) => p.factIds || []))] }
}
// the record as the viewer gets it: the stop's narration of it first (what it shows and why it matters
// here: record lines, owner decision 2026-10-27), then the record's own clip; the viewer plays it as it
// opens, so no record stop is silent (src/tour/data/narration.test.js)
// dev only (__tourApi.records): the files a record is drawn from (its pages, photographs, thumbnail, model)
const recordFiles = (a) => (a ? [...(a.pages || []).map((p) => p.src), ...(a.photos || []).map((p) => p.src), a.thumb, a.model?.src].filter(Boolean) : [])

const narratedRecord = (stop, art) => {
  const clip = joinClips(stop.clip, art.clip)
  return clip ? { ...art, clip } : art
}

export function ChapterPlayer({ tour, startChapter = 0, onEnd, autostart = false, startLabel = null }) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const phone = useMedia('(max-width: 720px), (pointer: coarse)')
  const started = useTour((s) => s.started)
  const phase = useTour((s) => s.phase)
  const index = useTour((s) => s.chapter)
  const run = useTour((s) => s.mapRun)
  const travel = useTour((s) => s.travel)
  const focus = useTour((s) => s.focus)
  const seen = useTour((s) => s.seen)
  const pointArr = useTour((s) => s.pointAt)
  const nod = useTour((s) => s.nod)
  const hintCue = useTour((s) => s.hintCue)
  const ch = tour.chapters[index] || tour.chapters[0]
  const chRef = useRef(ch)
  chRef.current = ch
  const tier = ch.place.tier
  const room = tier === 'room' ? ch.place.room : null
  const book = useMemo(() => createPhrasebook(room?.id), [room])
  const controls = useRef()
  const spots = useRef(null) // the stage's stop positions (onReady)
  const roomInfo = useRef(null)
  const selRun = useRef(0)
  const [moments, setMoments] = useState(false)
  const [ready, setReady] = useState(null) // the chapter id whose stage reported ready
  const [open, setOpen] = useState(null) // { stop, art } in the artifact viewer
  // round 9: a place photograph picked on the map leg opens in the viewer; closing it returns to the map
  const mapRecord = useTour((s) => s.mapRecord)
  useEffect(() => {
    if (!mapRecord) return
    const art = artifactById(mapRecord)
    if (art) {
      speaker.stop()
      setOpen({ stop: { id: `map-${mapRecord}`, name: art.title, map: true }, art })
    }
    setState({ mapRecord: null })
  }, [mapRecord])
  const [roomNote, setRoomNote] = useState(null)
  const [hearing, setHearing] = useState(false) // "Hear this chapter" is playing
  const closed = useRef(null) // the chapter id whose room closing has played
  const hud = useRef()
  // a place that could not be loaded (any asset: room model, prop, guide, photo-room texture, gallery
  // page; a timeout counts): { chapter, message }. Try again clears the loader cache for this chapter
  // and remounts the stage (attempt, TourCanvas).
  const [stageError, setStageError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  // a chunk that failed (shared/chunks.js) cannot be fetched again by remounting: its panel reloads
  const onStageError = useCallback((message, error) => setStageError((e) => (e?.chapter === ch.id ? e : { chapter: ch.id, message, reload: isChunkError(error) })), [ch.id])
  // the chapter id whose map leg (map, earth, land outlines, guide) has loaded
  const [mapLoaded, setMapLoaded] = useState(null)
  const onMapLoaded = useCallback(() => setMapLoaded(ch.id), [ch.id])
  const stageFailed = stageError?.chapter === ch.id ? stageError.message : null
  const stageReload = stageError?.chapter === ch.id && stageError.reload

  // the title block's height varies (a long place label wraps, More opens the note): on phones the
  // controls hint sits just under it (--hud-title-bottom, tour.css)
  useEffect(() => {
    const el = hud.current?.querySelector('[data-hud=title]')
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => hud.current?.style.setProperty('--hud-title-bottom', `${Math.round(el.getBoundingClientRect().bottom)}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [index, phase])
  // the bottom controls' height (at a tour's end on a phone the two end cards may wrap their names): the
  // stops, "Hear this chapter" and the caption sit above it (--hud-row-height, tour.css)
  useEffect(() => {
    const el = hud.current?.querySelector('.hud-bottom-right')
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => hud.current?.style.setProperty('--hud-row-height', `${Math.round(el.getBoundingClientRect().height)}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [index, phase])

  // A photo room with a band (place.hudBand, owner decision 2026-11-04: Prague's Old Town Square): a dark band behind
  // the top HUD, and the canvas starts below it, so the photograph is framed under the title card, the top-right
  // buttons, the controls hint and Step back, whose head no view could keep clear of them (fix round 9). Its height is
  // the top HUD's own: the lowest bottom of the title card (as it opens, its More note closed), the top-right buttons,
  // and the slots of the controls hint and Step back (hidden copies in the same places, .hud-band-probe: the band does
  // not change when the hint shows or fades, or when a stop is picked), plus BAND_GAP. The HUD itself is unchanged.
  const banded = phase === 'room' && tier === 'photo' && Boolean(ch.place.hudBand)
  const [band, setBand] = useState(0)
  useEffect(() => {
    const root = hud.current
    if (!banded || !root || typeof ResizeObserver === 'undefined') {
      setBand(0)
      return
    }
    let raf = 0
    const measure = () => {
      const title = root.querySelector('[data-hud=title]')
      // a note the visitor opens (More) lies over the photograph, as in every room: the band keeps its height
      if (title?.querySelector('.hud-more[aria-expanded="true"]')) return
      const els = [title, root.querySelector('.hud-actions'), ...root.querySelectorAll('.hud-band-probe > *')].filter(Boolean)
      setBand(Math.ceil(Math.max(0, ...els.map((el) => el.getBoundingClientRect().bottom)) + BAND_GAP))
    }
    // (a frame later: the phone's hint slot sits under the title block, --hud-title-bottom, set by its own observer)
    const later = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    const ro = new ResizeObserver(later)
    for (const el of [root.querySelector('[data-hud=title]'), root.querySelector('.hud-actions'), ...root.querySelectorAll('.hud-band-probe > *')]) if (el) ro.observe(el)
    window.addEventListener('resize', later)
    later()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', later)
    }
  }, [banded, index, phase, phone])

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
    const i = Math.min(Math.max(0, startChapter), tour.chapters.length - 1)
    setState({ chapter: i, phase: tour.chapters[i].map ? 'map' : 'room', started: autostart, mapVariant: 'unroll', focus: null, pointAt: null, travel: 0, seg: -1, seen: [], hintCue: 0, letterOpen: false })
    return () => speaker.stop()
  }, [tour, startChapter, autostart])

  // map leg: the guide narrates while the route draws itself
  useEffect(() => {
    if (!started || phase !== 'map' || !ch.map) return
    let live = true
    setState({ travel: 0, seg: -1 })
    if (ch.map.narration) speaker.playClip({ ...ch.map.narration, who: 'Guide' }).then((ok) => live && ok && setState((s) => ({ nod: s.nod + 1 })))
    return () => {
      live = false
      speaker.stop()
    }
  }, [started, phase, ch, run])

  // place arrival: once the stage is in, the chapter's opening line; the controls hint starts with
  // its first caption (sound or not), or on arrival when the chapter has no opening
  useEffect(() => {
    if (!started || phase !== 'room' || ready !== ch.id) return
    let live = true
    let hinted = false
    const hint = () => {
      if (!live || hinted) return
      hinted = true
      setState((s) => ({ hintCue: s.hintCue + 1 }))
    }
    const t = setTimeout(async () => {
      if (!live || getState().focus !== null) return
      // the opening, then the chapter's arrival lines (one story in order: the place, then what happened here)
      const opening = hearingOf(openingOf(tour, ch), ch)
      if (!opening) return hint()
      const ok = await speaker.playClip({ ...opening, who: 'Guide', onStart: hint })
      hint() // no caption came (a clip failed to load): the hint still shows once
      if (ok && live) setState((s) => ({ nod: s.nod + 1 }))
    }, 900)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [started, phase, ready, ch, tour])

  // a chapter's closing lines, once, after every stop has been visited
  const closeRoom = async (still) => {
    const closing = closingOf(ch)
    if (!closing || closed.current === ch.id) return
    const seenNow = getState().seen
    if (!ch.stops.every((s) => seenNow.includes(s.id))) return
    await wait(900)
    if (!still()) return
    // marked played only once it has played through (an interruption leaves it for the next stop)
    if ((await speaker.playClip({ ...closing, who: 'Guide' })) && still()) {
      closed.current = ch.id
      setState((s) => ({ nod: s.nod + 1 }))
    }
  }

  const hear = async () => {
    selRun.current++
    if (hearing) {
      speaker.stop()
      setHearing(false)
      return
    }
    const clip = hearingOf(openingOf(tour, ch), ch)
    if (!clip) return
    const mine = selRun.current
    setOpen(null)
    speaker.unlock()
    setHearing(true)
    const ok = await speaker.playClip({ ...clip, who: 'Guide' })
    if (mine !== selRun.current) return
    setHearing(false)
    if (ok) setState((s) => ({ nod: s.nod + 1 }))
  }

  const onReady = useCallback(
    (info) => {
      spots.current = info.spots
      if (info.room) {
        roomInfo.current = info
        setRoomNote(info.room.source === 'stand-in' ? 'Stand-in room · the room model is in progress' : info.room.label || null)
        // a stop picked while the room was still loading (its dots show before the model is in) set the focus
        // but had no spot to fly to: the camera goes there now, once the room's spots exist
        const pending = getState().focus
        const spot = pending ? info.spots.find((s) => s.id === pending) : null
        if (spot) {
          controls.current?.focus(spot.object, info.room.views?.[pending])
          setState({ pointAt: spot.center.toArray() })
        }
      }
      setReady(ch.id)
    },
    [ch.id],
  )

  // a stop's position: room spots carry their centre; the photo room and gallery hand over points
  // or (a record on the photo room's rail) the moving object
  const where = (id) => {
    const s = spots.current
    if (!s) return null
    if (Array.isArray(s)) return s.find((x) => x.id === id)?.center.toArray() || null
    const v = s[id]
    if (!v) return null
    if (v.isVector3) return v.toArray()
    return v.current ? v.current.getWorldPosition(v.current.position.clone()).toArray() : null
  }

  const select = async (id) => {
    const stop = ch.stops.find((s) => s.id === id)
    if (!stop) return
    const mine = ++selRun.current
    const still = () => mine === selRun.current
    speaker.stop()
    setHearing(false)
    setOpen(null)
    const at = where(id)
    setState((s) => ({ focus: id, pointAt: at, seen: s.seen.includes(id) ? s.seen : [...s.seen, id], nod: s.nod + 1 }))
    const art = recordOf(stop)
    if (tier === 'room') {
      const info = roomInfo.current
      const spot = info?.spots.find((s) => s.id === id)
      if (spot) controls.current?.focus(spot.object, info.room.views?.[id])
      const intro = book.intro(id)
      if ((intro && !(await speaker.say(intro))) || !still()) return
      if (art) return setOpen({ stop, art })
      if (stop.clip && (await speaker.playClip({ ...stop.clip, who: 'Guide' })) && still()) {
        setState((s) => ({ nod: s.nod + 1, pointAt: null }))
        await closeRoom(still)
      }
      return
    }
    if (!art) {
      // no record to open (a wall panel): the guide talks about it while the camera holds there
      if (stop.clip && (await speaker.playClip({ ...stop.clip, who: 'Guide' })) && still()) {
        setState((s) => ({ nod: s.nod + 1 }))
        await closeRoom(still)
      }
      return
    }
    // the camera goes to the object first (a rail record rises; a stop over the photograph waits until its view is
    // found, fix round 12, and the camera's ease to it has settled), then the viewer opens on it
    if (tier === 'photo' && !stop.rail && stop.at) {
      // the view found, then the camera's ease to it; again if the view was searched again meanwhile (a layout change
      // while it is shown), at most a few times. (A stage that never takes the pick, unmounted mid-way, does not hold
      // the record back for ever.)
      for (let n = 0; n < 4; n++) {
        await Promise.race([focusReady(id), wait(60000)])
        const s0 = focusSearches()
        await wait(reduced ? 150 : FOCUS_SETTLE_MS)
        if (!still()) return
        if (focusSearches() === s0) break
      }
    } else await wait(reduced ? 150 : tier === 'gallery' ? 1100 : stop.rail ? 1050 : FOCUS_SETTLE_MS)
    if (still()) setOpen({ stop, art })
  }
  const selectRef = useRef(select)
  selectRef.current = select

  const back = () => {
    const id = getState().focus
    selRun.current++
    speaker.stop()
    setHearing(false)
    setOpen(null)
    setState({ focus: null, pointAt: null })
    if (tier === 'room') {
      // back to the room's start view (round 9: a stand point beside a wall left no room for the guide in
      // the view; the start view is framed around her)
      if (id && controls.current?.home) controls.current.home()
    }
  }
  const backRef = useRef(back)
  backRef.current = back

  // Esc steps back from a stop the camera has moved to (the same as "Step back"), when no record or
  // other dialog is open (the viewer handles its own Esc); focus goes to that stop's dot
  useEffect(() => {
    const key = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return
      const id = getState().focus
      if (!id) return
      e.preventDefault()
      backRef.current()
      document.querySelector(`.stop-dot[data-stop="${CSS.escape(id)}"]`)?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const goChapter = (i) => {
    speaker.stop()
    setHearing(false)
    selRun.current++
    spots.current = null
    roomInfo.current = null
    setOpen(null)
    setReady(null)
    setMapLoaded(null)
    setRoomNote(null)
    const c = tour.chapters[i]
    setState((s) => ({ chapter: i, phase: c.map ? 'map' : 'room', focus: null, pointAt: null, seen: [], travel: 0, seg: -1, hintCue: 0, mapRun: s.mapRun + 1 }))
  }
  const end = () => {
    speaker.stop()
    setHearing(false)
    selRun.current++
    onEnd?.()
  }
  const nextChapter = tour.chapters[index + 1] || null
  const next = () => {
    if (phase === 'map') {
      speaker.stop()
      setHearing(false)
      setState({ phase: 'room' })
    } else if (nextChapter) goChapter(index + 1)
    else end()
  }

  // Once this chapter's stage is ready, the next chapter's room model is fetched at low priority so
  // "Next chapter" finds it in the HTTP cache. Only that one room, one chapter ahead, and never on
  // a data-saver connection; the room still loads when its own chapter mounts.
  const nextModel = nextChapter?.place.tier === 'room' ? nextChapter.place.room?.model : null
  useEffect(() => {
    if (ready !== ch.id || !nextModel || navigator.connection?.saveData) return
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'fetch'
    link.crossOrigin = 'anonymous'
    link.href = versioned(phone ? `${nextModel}-mobile.glb` : `${nextModel}.glb`) // the URL probeRoom will fetch
    document.head.appendChild(link)
    return () => link.remove()
  }, [ready, ch.id, nextModel, phone])

  // dev only: drive the tour from the browser (e2e/chapters.mjs, e2e/camcheck.mjs)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__tourApi = {
      select: (id) => selectRef.current(id),
      // open or close a stop's record viewer straight away (e2e/chapters.mjs part records: without the guide's
      // spoken intro first)
      openRecord: (id) => {
        const stop = chRef.current.stops.find((s) => s.id === id)
        const art = stop && recordOf(stop)
        if (art) setOpen({ stop, art })
        return Boolean(art)
      },
      closeRecord: () => setOpen(null),
      back: () => backRef.current(),
      info: () => roomInfo.current,
      controls: () => controls.current,
      chapter: () => ({ index: getState().chapter, phase: getState().phase, ready }),
      speaking: () => speaker.speaking,
      usingAudio: () => Boolean(speaker.cur?.useAudio),
      guideBox: (opts) => window.__tourGuideBox?.(opts) ?? null,
      // the records the chapter binds now (e2e/chapters.mjs part records, against records.lock.json), with each
      // record's own files (and its series members'), which what the scene draws for the stop must come from
      records: () => ({
        stops: chRef.current.stops.map((s) => {
          const a = recordOf(s)
          const members = (a?.letters || []).map((m) => artifactById(m)).filter(Boolean)
          return { id: s.id, record: a?.id || null, letters: a?.letters || [], linkOnly: Boolean(a?.linkOnly), at: Boolean(s.at), files: [a, ...members].flatMap(recordFiles) }
        }),
        // the backdrop's own file, from the record store (the record's photo room), never from place.photo: a place
        // that named another record would serve that record's file, or none (round 9 fix round 7, Codex review 6)
        backdrop: chRef.current.place?.tier === 'photo' ? { media: chRef.current.place.photo.mediaId, files: [backdropOf(chRef.current.place.photo.mediaId)?.photo].filter(Boolean) } : null,
        resources: (chRef.current.map?.resources || []).map((r) => ({ id: r.id, media: r.media || [] })),
      }),
    }
  }, [ready])

  const note =
    phase === 'map' && ch.map
      ? mapFootnote(ch.map)
      : tier === 'room'
        ? // the room's label (the tour data's labelText where the glb's own says more than the
          // verified facts, else its glb's, else the fallback), then any note the chapter adds to it
          [room?.labelText || roomNote || room?.labelFallback, room?.note].filter(Boolean).join(' ') || null
        : ch.place.note || (tier === 'gallery' ? GALLERY_NOTE : null)
  const stopLabel = `${ch.title} · ${placeLabel(ch)}`
  const nextLabel = phase === 'map' ? placeLabel(ch) : nextChapter ? nextChapter.title : 'Finish the tour'
  // the end of the tour also offers the next inductee, in the landing's order (round 9; data/index.js)
  const nextSlug = phase === 'room' && !nextChapter ? nextInductee(tour.slug) : null
  const nextPerson = nextSlug ? INDUCTEES[nextSlug] : null
  const places = tour.chapters.filter((c) => c.map).flatMap((c) => c.map.places)
  const first = places[0]
  const last = places[places.length - 1]
  const hearClip = hearingOf(openingOf(tour, ch), ch)
  const canvasLabel =
    phase === 'map' && ch.map ? mapCanvasLabel(ch.map) : `${placeLabel(ch)}, a place you can look around`
  const stageProps = { chapter: ch, phone, reduced, focus, seen, onPick: select, pointArr, nod, onReady, started }

  return (
    <main tabIndex={-1} className={`tour-stage chapter-player tier-${tier} ${phone ? 'is-phone' : ''} ${reduced ? 'is-reduced' : ''} ${phase === 'map' ? 'map-paper' : ''} ${nextPerson ? 'is-end' : ''}`} data-chapter={ch.id} data-phase={phase} data-ready={ready === ch.id ? 'true' : 'false'} data-map-ready={phase === 'map' ? String(mapLoaded === ch.id) : undefined}>
      {band > 0 && <div className="hud-band" aria-hidden="true" style={{ height: `${band}px` }} data-hud-band={band} />}
      {/* the canvas, its vignette and its labels (below the band, if the room has one) */}
      <div className="stage-frame" style={band > 0 ? { top: `${band}px` } : undefined}>
        <ChunkSuspense
          what="the 3D stage"
          fallback={<div className="tour-canvas-loading" role="img" aria-label={canvasLabel} />}
        >
          <TourCanvas ch={ch} phase={phase} tier={tier} room={room} run={run} phone={phone} reduced={reduced} controlsRef={controls} onPick={select} onReady={onReady} onStageError={onStageError} onMapLoaded={onMapLoaded} attempt={attempt} stageProps={stageProps} label={canvasLabel} />
        </ChunkSuspense>
        {phase === 'room' && tier !== 'room' && <div className="place-vignette" aria-hidden="true" />}

        <LabelLayer />
      </div>

      {started && !stageFailed && (phase === 'map' ? mapLoaded !== ch.id : ready !== ch.id) && (
        <p className="stage-loading glass-pill" role="status" data-stage-loading="true">
          {phase === 'map' ? 'Loading the map…' : 'Loading this place…'}
        </p>
      )}
      {started && stageFailed && (
        <div className="room-error glass-panel" role="alert" data-room-error="true">
          <p className="room-error-title">This place could not be loaded.</p>
          <p className="room-error-why">The {stageFailed}. {stageReload ? 'Reload the page' : 'Try again'}, or open this chapter&rsquo;s records.</p>
          <div className="room-error-actions">
            {stageReload ? (
              <button type="button" className="btn-glass" onClick={reloadPage}>
                Reload the page
              </button>
            ) : (
              <button type="button" className="btn-glass" data-room-retry onClick={() => { setStageError(null); setMapLoaded(null); setAttempt((a) => a + 1) }}>
                Try again
              </button>
            )}
            {ch.stops.filter((st) => recordOf(st)).map((st) => (
              <button type="button" key={st.id} className="btn-glass" onClick={() => setOpen({ stop: st, art: recordOf(st) })}>
                {st.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={hud} className={`tour-hud phase-${phase}`}>
        <header className="hud-top">
          <TitleBlock key={`${ch.id}-${phase}`} name={tour.name} stop={stopLabel} note={note} />
          <div className="hud-actions">
            <button type="button" className="btn-glass hud-end" onClick={end}>
              End tour
            </button>
            <SoundToggle />
          </div>
        </header>

        {banded && (
          <div className="hud-band-probe" aria-hidden="true">
            <p className="band-probe-hint">{HINTS[tier][phone ? 'phone' : 'desktop']}</p>
            <span className="btn-glass band-probe-back">Step back</span>
          </div>
        )}
        {phase === 'room' && (
          <>
            <ControlsHint cue={hintCue} chapter={`${tour.slug}:${ch.id}`} text={HINTS[tier][phone ? 'phone' : 'desktop']} />
            <StopDots items={ch.stops} focus={focus} seen={seen} onSelect={select} label="Objects in this chapter" />
            {focus && !open && (
              <button type="button" className="btn-glass hud-back" onClick={back}>
                Step back
              </button>
            )}
          </>
        )}

        <MomentsButton
          phone={phone}
          onClick={() => {
            speaker.stop()
            setMoments(true)
          }}
        />

        <footer className="hud-bottom">
          <div className="bubble-slot">
            <SpeechBubble tail={phase === 'map' ? 'left' : 'down'} />
          </div>
          <div className="hud-bottom-right">
            {phase === 'room' && hearClip && (
              <button type="button" className={`btn-glass hud-hear ${hearing ? 'is-on' : ''}`} onClick={hear} aria-pressed={hearing} data-hud="hear">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  {hearing ? <path d="M7 7h10v10H7z" fill="currentColor" /> : <path d="M8 6l10 6-10 6z" fill="currentColor" />}
                </svg>
                <span className="hud-hear-label">Hear this chapter</span>
              </button>
            )}
            {nextPerson && (
              // its own row, over "Finish the tour"
              <div className="end-next">
                <a className="btn-next btn-next-inductee" href={`tour.html?inductee=${nextSlug}`} data-hud="next-inductee" onClick={() => speaker.stop()}>
                  <span className="btn-next-eyebrow">Next inductee</span>
                  <span className="btn-next-label">{nextPerson.name}</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            )}
            <button type="button" className={`btn-next ${phase === 'map' && travel >= 1 ? 'is-ready' : ''}`} onClick={next} data-hud="next">
              <span className="btn-next-eyebrow">{phase === 'map' ? 'Next stop' : nextChapter ? 'Next chapter' : 'End of the tour'}</span>
              <span className="btn-next-label">{nextLabel}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </footer>
      </div>

      {moments && (
        <ChunkSuspense what="Moments" onClose={() => setMoments(false)}>
          <Moments reduced={reduced} onClose={() => setMoments(false)} />
        </ChunkSuspense>
      )}

      {open && (
        // the viewer's own chunk: a visible status while it arrives; if it fails or stalls, a panel
        // that reloads the page or closes it (the tour stays). Its assets have their own bounded
        // loading (ArtifactViewer).
        <ChunkSuspense
          key={open.stop.id + open.art.kind}
          what="the record viewer"
          onClose={() => setOpen(null)}
          fallback={
            <p className="stage-loading glass-pill" role="status" data-viewer-loading="true">
              Opening the record…
            </p>
          }
        >
          <ArtifactViewer
            key={open.stop.id + open.art.kind}
            art={narratedRecord(open.stop, open.art)}
            reduced={reduced}
            autoOpen
            autoPlay
            eyebrowExtra={open.stop.extra || ''}
            placeNote={open.stop.placeNote || ''}
            placeNoteLabel={open.stop.placeNoteLabel || undefined}
            onClose={
              open.stop.map
                ? () => setOpen(null)
                : tier === 'room'
                ? () => {
                    setOpen(null)
                    const mine = selRun.current
                    closeRoom(() => mine === selRun.current)
                  }
                : () => {
                    back()
                    const mine = selRun.current
                    closeRoom(() => mine === selRun.current)
                  }
            }
          />
        </ChunkSuspense>
      )}

      {!started && (
        <div className="tour-splash">
          <div className="glass-panel splash-card">
            <span className="eyebrow">Immigrant Hall of Honor · Guided tour</span>
            <h1 className="splash-title">{tour.name}</h1>
            {first && last && (
              <p className="splash-sub">
                {first.label}
                {first.date ? ` · ${first.date}` : ''}
                <span aria-hidden="true"> — </span>
                {last.label}
                {last.date ? ` · ${last.date}` : ''}
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

export default ChapterPlayer
