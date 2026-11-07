// Glass HUD over the canvas: the title block (basis note under More), sound toggle, End tour,
// speech bubble, next stop, the numbered stop dots (the keyboard / screen-reader path to every
// hotspot) and the controls hint, shown once when the chapter opens (hud/HudParts.jsx).
// The map style is fixed to the owner's pick (globe to map); others are URL-only (?map=).
import { SpeechBubble } from '../../shared/guide/SpeechBubble.jsx'
import { ControlsHint, MomentsButton, SoundToggle, StopDots, TitleBlock } from './HudParts.jsx'
import { useTour } from '../store.js'
import { mapFootnote } from './mapFootnote.js'

export function Hud({ data, step, room, phone, roomSource, roomNote, onEnd, onNext, nextLabel, onSelect, onBack, onObjects, hintKey }) {
  const phase = useTour((s) => s.phase)
  const travel = useTour((s) => s.travel)
  const focus = useTour((s) => s.focus)
  const seen = useTour((s) => s.seen)
  const hintCue = useTour((s) => s.hintCue)
  const label = roomNote || room?.labelFallback || null
  const note =
    phase === 'map' && step.type === 'map'
      ? mapFootnote(step)
      : phase === 'room' && room
        ? roomSource === 'stand-in'
          ? 'Stand-in room · the study model is in progress'
          : label
        : null

  return (
    <div className={`tour-hud phase-${phase}`}>
      <header className="hud-top">
        <TitleBlock key={`${step.id}-${room?.id || ''}`} name={data.name} stop={step.title} note={note} />
        <div className="hud-actions">
          <button type="button" className="btn-glass hud-end" onClick={onEnd}>
            End tour
          </button>
          <SoundToggle />
        </div>
      </header>

      {phase === 'room' && room && (
        <>
          <ControlsHint cue={hintCue} chapter={hintKey} text={phone ? 'Drag to look around · Tap a number to visit an object' : 'Drag to look · W A S D or click the floor to walk · Keys 1–9 visit the objects · M mutes the guide'} />
          <StopDots items={room.artifacts} focus={focus} seen={seen} onSelect={onSelect} label="Objects in this room" />
          {focus && (
            <button type="button" className="btn-glass hud-back" onClick={onBack}>
              Step back
            </button>
          )}
        </>
      )}

      {onObjects && <MomentsButton phone={phone} onClick={onObjects} />}

      <footer className="hud-bottom">
        <div className="bubble-slot">
          <SpeechBubble tail={phase === 'map' ? 'left' : 'down'} />
        </div>
        <button type="button" className={`btn-next ${phase === 'map' && travel >= 1 ? 'is-ready' : ''}`} onClick={onNext}>
          <span className="btn-next-eyebrow">Next stop</span>
          <span className="btn-next-label">{nextLabel}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </footer>
    </div>
  )
}
