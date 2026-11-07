// A code-split part of the page (chunks.js): a visible status while its chunk arrives, and if it
// fails or stalls, a panel that says so and offers "Reload the page" (and Close, where the part can
// be closed). Any other error thrown by the part shows the same panel.
import { Component, Suspense } from 'react'
import { reloadPage } from './chunks.js'
import './chunks.css'

class ChunkBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const { what, onClose, compact, notice } = this.props
    if (compact)
      return (
        <>
          {this.props.placeholder}
          <button type="button" className="chunk-reload-compact" onClick={reloadPage} aria-label={`Reload the page (${what} could not be loaded)`} title={String(error.message || error)} data-chunk-error="true">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          </button>
        </>
      )
    return (
      <div className={`chunk-error${notice ? ' chunk-error--notice' : ''}`} role="alert" data-chunk-error="true">
        <p className="chunk-error-title">{this.props.title || `${what[0].toUpperCase()}${what.slice(1)} could not be loaded.`}</p>
        <p className="chunk-error-why">The {String(error.message || error)}. Reloading the page fetches it again.</p>
        <div className="chunk-error-actions">
          <button type="button" className="chunk-btn" onClick={reloadPage}>
            Reload the page
          </button>
          {onClose && (
            <button type="button" className="chunk-btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    )
  }
}

// compact: a small reload button over `fallback` (the landing guide's slot); notice: the panel sits in
// a corner instead of over the page (the landing, whose content stays usable)
export default function ChunkSuspense({ what, title, onClose, compact = false, notice = false, fallback, children }) {
  return (
    <ChunkBoundary what={what} title={title} onClose={onClose} compact={compact} notice={notice} placeholder={fallback}>
      <Suspense fallback={fallback === undefined ? <p className="chunk-loading" role="status" data-chunk-loading="true">Loading {what}…</p> : fallback}>{children}</Suspense>
    </ChunkBoundary>
  )
}
