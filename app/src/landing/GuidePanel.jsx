import { useEffect, useState } from 'react'
import { lazyChunk } from '../shared/chunks.js'
import ChunkSuspense from '../shared/ChunkSuspense.jsx'
import { offerLine, declineLine } from './phrases.js'
import { speaker } from '../shared/guide/speech.js'
import { VoiceToggle } from '../shared/guide/VoiceToggle.jsx'

// The avatar slot shows the shared 3D guide (app/src/shared/guide/Guide.jsx, tour agent) through
// GuideAvatar.jsx, code-split so the panel paints first. While its chunk arrives the placeholder shows;
// if the chunk fails or stalls (shared/chunks.js), the placeholder stays with a "Reload the page" button.
const GuideAvatar = lazyChunk(() => import('./GuideAvatar.jsx'), 'the guide')

function Placeholder() {
  return (
    <div className="guide-avatar-ph">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="24" r="11" />
        <path d="M12 60c0-13 9-21 20-21s20 8 20 21" />
      </svg>
      <span>Guide avatar (3D) &middot; from shared/guide</span>
    </div>
  )
}

export default function GuidePanel({ inductee, onYes, reduced }) {
  const [line, setLine] = useState(null)
  const [nod, setNod] = useState(0)
  const [declined, setDeclined] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // each line is spoken (AI voice, pre-rendered parts) once the visitor has interacted with the
  // page; before that, and when muted, it is a caption only. It waits for the reveal to finish.
  useEffect(() => {
    if (!inductee) {
      speaker.stop()
      return
    }
    const l = offerLine(inductee)
    setLine(l.text)
    setDeclined(false)
    setNod((n) => n + 1)
    const t = setTimeout(() => speaker.say(l), reduced ? 0 : 1600)
    return () => {
      clearTimeout(t)
      speaker.stop()
    }
  }, [inductee, reduced])

  const visible = Boolean(inductee && line)
  const avatar = (
    <div className="guide-avatar">
      <ChunkSuspense what="the guide" compact fallback={<Placeholder />}>
        {visible && <GuideAvatar nodKey={nod} reduced={reduced} compact fallback={<Placeholder />} />}
      </ChunkSuspense>
    </div>
  )

  return (
    <aside className={`guide glass-panel${visible ? ' is-visible' : ''}${collapsed ? ' is-collapsed' : ''}`} aria-label="Museum guide" aria-hidden={!visible} inert={!visible}>
      <div className="guide-head">
        <p className="micro">Your guide</p>
        <VoiceToggle className="guide-voice" />
        <button type="button" className="icon-btn" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed} aria-label={collapsed ? 'Show the guide' : 'Hide the guide'}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            {collapsed ? <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" fill="none" /> : <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />}
          </svg>
        </button>
      </div>
      {!collapsed && (
        <>
          {avatar}
          <p className="guide-line" aria-live="polite">
            {line}
          </p>
          {!declined && inductee && (
            <div className="guide-actions">
              <button type="button" className="btn-primary btn-sm" onClick={(e) => onYes(e, { inductee, stop: null })}>
                Yes
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => {
                  setDeclined(true)
                  const l = declineLine()
                  setLine(l.text)
                  speaker.say(l)
                }}
              >
                Not now
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
