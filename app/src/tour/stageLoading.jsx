// Every asset a place loads (the room model, its props, the guide, a photo room's textures, a gallery
// case's pages and models, the map's earth texture and land outlines) either arrives or turns into the
// chapter's recoverable error (ChapterPlayer: the message, Try again, the chapter's records); never an
// endless wait or a blank canvas. The pattern is shared/assetLoads.jsx; the stage has one load scope:
// - StageSuspense: a Suspense that fails the stage once LOAD_TIMEOUT_MS passes;
// - StageBoundary: catches any loader error in the stage below it; either way the stage scope is reset:
//   every request it still has open is aborted and every load that did not succeed is evicted, so Try
//   again fetches them afresh and never attaches to a request that is stuck.
import { stageScope } from '../shared/loadScope.js'
import { BoundedSuspense, LoadBoundary } from '../shared/assetLoads.jsx'

export function StageSuspense({ what, children }) {
  return <BoundedSuspense what={what}>{children}</BoundedSuspense>
}

export function StageBoundary({ what, onError, children }) {
  return (
    <LoadBoundary what={what} onError={onError} scope={stageScope}>
      {children}
    </LoadBoundary>
  )
}
