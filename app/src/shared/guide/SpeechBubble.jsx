// Glass speech bubble showing the line being spoken, plus a polite live region for screen readers.
import { useSyncExternalStore } from 'react'
import { speaker } from './speech.js'

export function useSpokenLine() {
  return useSyncExternalStore(
    (fn) => speaker.subscribe(fn),
    () => speaker.line,
    () => null,
  )
}

export function SpeechBubble({ tail = 'left', className = '' }) {
  const line = useSpokenLine()
  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {line ? `${line.who}: ${line.text}` : ''}
      </div>
      <div className={`speech-bubble tail-${tail} ${line ? 'is-on' : ''} ${className}`} aria-hidden="true">
        {line && (
          <>
            <span className="speech-who">
              {line.who} <span className="speech-ai">· AI voice</span>
            </span>
            <p className="speech-text">{line.text}</p>
            {line.factIds?.length > 0 && <span className="speech-src">Source record {line.factIds.join(', ')}</span>}
          </>
        )}
      </div>
    </>
  )
}
