// Bounded, recoverable asset loading (loadScope.js), the one pattern every 3D part of the site uses:
// the tour stage (rooms, photo rooms, gallery cases, the map), the record viewer and the landing guide.
// - useScopedGLTF / useScopedTexture / useScopedJSON (loadHooks.js): suspend on a load made with the current scope's
//   loaders (LoadScopeContext), tracked so a reset evicts it unless it succeeded.
// - LoadBoundary: catches a failed load below it, reports it (onError) and resets the scope: every
//   request still open is aborted, and every load that did not succeed is evicted.
// - BoundedSuspense: a Suspense whose fallback fails the nearest LoadBoundary once LOAD_TIMEOUT_MS
//   passes; the boundary's reset then aborts the stalled request, so a retry never waits on it.
// - Loaded: tells the page the content above it has arrived (and when it suspends again).
// - useRecovery (loadHooks.js): the state a page keeps for one bounded part: loading / ready / failed, and retry(),
//   which resets the scope before it remounts the part.
import { Component, Suspense, useContext, useEffect, useLayoutEffect } from 'react'
import { FailContext, LOAD_TIMEOUT_MS, LoadScopeContext } from './loadHooks.js'

export class LoadBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
    this.reported = false
    this.fail = (message) => {
      if (!this.state.failed) this.setState({ failed: true })
      this.report(message)
    }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    // a chunk that failed (shared/chunks.js) says what it was; the page offers a reload for it
    const message = error?.name === 'ChunkError' ? error.message : `${this.props.what || 'this place'} did not load (${String(error?.message || error).slice(0, 120)})`
    this.report(message, error)
  }
  report(message, error = null) {
    if (this.reported) return
    this.reported = true
    this.props.onError?.(message, error)
    this.props.scope?.reset()
  }
  render() {
    return <FailContext.Provider value={this.fail}>{this.state.failed ? (this.props.fallback ?? null) : this.props.children}</FailContext.Provider>
  }
}

function LoadTimer({ what }) {
  const fail = useContext(FailContext)
  useEffect(() => {
    if (!fail) return
    const t = setTimeout(() => fail(`${what} did not finish loading within ${LOAD_TIMEOUT_MS / 1000} s`), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [fail, what])
  return null
}

export function BoundedSuspense({ what, fallback = null, children }) {
  return (
    <Suspense
      fallback={
        <>
          <LoadTimer what={what} />
          {fallback}
        </>
      }
    >
      {children}
    </Suspense>
  )
}

export function Loaded({ onLoaded, onPending }) {
  useLayoutEffect(() => {
    onLoaded?.()
    return () => onPending?.()
  }, [onLoaded, onPending])
  return null
}

// inside a canvas: one scope, one boundary, one timed Suspense, the Loaded signal after its content
export function BoundedLoad({ scope, what, load, children }) {
  return (
    <LoadScopeContext.Provider value={scope}>
      <LoadBoundary what={what} scope={scope} onError={load?.onError}>
        <BoundedSuspense what={what}>
          {children}
          <Loaded onLoaded={load?.onLoaded} onPending={load?.onPending} />
        </BoundedSuspense>
      </LoadBoundary>
    </LoadScopeContext.Provider>
  )
}
