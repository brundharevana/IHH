// The hooks and context of bounded, recoverable asset loading (components: assetLoads.jsx).
import { createContext, useCallback, useContext, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { LOAD_TIMEOUT_MS, LoadScope } from './loadScope.js'

export { LOAD_TIMEOUT_MS }

export const LoadScopeContext = createContext(null)
export const FailContext = createContext(null)
const pageScope = new LoadScope('page')
export const useLoadScope = () => useContext(LoadScopeContext) || pageScope

function useScoped(loader, input, key) {
  const scope = useLoadScope()
  const l = scope[loader]
  const k = `${loader}:${key}`
  scope.track(k, () => useLoader.clear(l, input))
  const out = useLoader(l, input)
  scope.done(k)
  return out
}
export const useScopedGLTF = (url) => useScoped('gltf', url, url)
export const useScopedTexture = (input) => useScoped('texture', input, Array.isArray(input) ? input.join('|') : input)
export const useScopedJSON = (url) => useScoped('json', url, url)

export function useRecovery(scope) {
  const [s, set] = useState({ attempt: 0, status: 'loading', message: null, reload: false })
  // reload: the failure was a code chunk (shared/chunks.js), which only a page reload fetches again
  const onError = useCallback((message, error) => set((x) => (x.status === 'failed' ? x : { ...x, status: 'failed', message, reload: error?.name === 'ChunkError' })), [])
  const onLoaded = useCallback(() => set((x) => (x.status === 'loading' ? { ...x, status: 'ready' } : x)), [])
  const onPending = useCallback(() => set((x) => (x.status === 'ready' ? { ...x, status: 'loading' } : x)), [])
  const retry = useCallback(() => {
    set((x) => ({ ...x, status: 'resetting' }))
    scope.reset().then(() => set((x) => ({ attempt: x.attempt + 1, status: 'loading', message: null, reload: false })))
  }, [scope])
  return { ...s, onError, onLoaded, onPending, retry }
}
