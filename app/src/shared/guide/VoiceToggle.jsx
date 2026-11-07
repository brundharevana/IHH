// Voice on/off for the guide, plus the "AI voice" label. Turning the voice on also counts as the
// user gesture that lets audio start (browsers block sound until then).
import { useSyncExternalStore } from 'react'
import { speaker } from './speech.js'
import './voice.css'

export function useVoice() {
  return useSyncExternalStore(
    (fn) => speaker.subscribeState(fn),
    () => speaker.state,
    () => speaker.state,
  )
}

export function VoiceToggle({ className = '' }) {
  const { muted } = useVoice()
  return (
    <button
      type="button"
      className={`voice-toggle ${muted ? 'is-muted' : ''} ${className}`}
      aria-pressed={!muted}
      aria-label={muted ? 'Turn the guide voice on (AI voice)' : 'Turn the guide voice off (AI voice)'}
      onClick={() => {
        speaker.unlock()
        speaker.setMuted(!muted)
      }}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor" />
        {muted ? (
          <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path d="M13 7.2a4 4 0 0 1 0 5.6M15.4 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
      <span className="voice-ai">AI voice</span>
    </button>
  )
}
