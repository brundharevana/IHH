// A static model URL with its content version (?v=<hash>, from scripts/assetVersions.mjs), so the
// year-long immutable cache on /models never serves a superseded room. URLs outside the versioned
// folders, or of files that do not exist, are returned unchanged.
import VERSIONS from 'virtual:asset-versions'

export function versioned(url, versions = VERSIONS) {
  if (typeof url !== 'string') return url
  const [path, query] = url.split('?')
  const v = versions[path]
  if (!v || /(^|&)v=/.test(query || '')) return url
  return `${path}?${query ? `${query}&` : ''}v=${v}`
}
