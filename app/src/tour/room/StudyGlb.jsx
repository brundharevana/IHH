// Loads a recreated room's model when it exists:
//   /models/<id>/<id>.glb (<id>-mobile.glb on phones) and /models/<id>/bounds.json.
// Named nodes (see public/models/<id>/nodes.json): hotspot_1..4 standing viewpoints (eye height,
// local -Z faces the view), artifact_* objects, label_recreation (extras.text).
// Each tour artifact names the glb nodes it is anchored to (data: artifact.nodes).
// Materials are KHR_materials_unlit with baked lighting: they are shown as baked, never lit or
// tone-mapped a second time.
import { useEffect, useMemo } from 'react'
import { useScopedGLTF } from '../../shared/loadHooks.js'
import * as THREE from 'three'

// probeRoom (the model's URL and bounds) lives in ./probeRoom.js.

// The rooms' exporter (Blender 5 glTF, roomkit.export_glb) writes a placeholder all-white VEC3
// COLOR_0 on every vertex-coloured mesh and the baked light (the 'light' attribute) as COLOR_1.
// three.js only reads COLOR_0 (geometry 'color'), so those meshes (windows, ironwork, rails,
// furniture) rendered flat white. Use the baked attribute when COLOR_0 carries no information.
function adoptBakedVertexLight(g) {
  const baked = g?.attributes?.color_1
  const c = g?.attributes?.color
  if (!baked) return false
  if (c) {
    for (let i = 0; i < c.count; i++) {
      if (c.getX(i) < 0.999 || c.getY(i) < 0.999 || c.getZ(i) < 0.999) return false
    }
  }
  g.setAttribute('color', baked)
  g.deleteAttribute('color_1')
  return true
}

export function StudyGlb({ url, artifacts, register, onPick, onModel }) {
  const { scene } = useScopedGLTF(url)
  const nodes = useMemo(() => {
    const byName = {}
    scene.traverse((o) => {
      if (o.name) byName[o.name] = o
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = false
        adoptBakedVertexLight(o.geometry)
        // the sky dome sits ~300 m out, past every room's fog: fogging it turned the sky into the
        // background colour (the black sky over the MGM street)
        if (/^sky/.test(o.name)) for (const m of [].concat(o.material)) if (m) m.fog = false
        for (const m of [].concat(o.material)) {
          if (!m) continue
          // baked light: show the texture as authored (sRGB in, no tone curve, no scene lights)
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
          if (m.isMeshBasicMaterial) m.toneMapped = false
          m.needsUpdate = true
        }
      }
    })
    const found = {}
    for (const a of artifacts) {
      const n = (a.nodes || [`artifact_${a.id}`]).map((k) => byName[k]).find(Boolean)
      if (n) found[a.id] = n
    }
    const viewpoints = Object.keys(byName)
      .filter((k) => /^hotspot_\d+$/.test(k))
      .sort()
      .map((k) => byName[k])
    const label = byName.label_recreation?.userData?.text || null
    scene.updateWorldMatrix(true, true)
    const shell = new THREE.Box3().setFromObject(scene)
    return { found, viewpoints, label, shell }
  }, [scene, artifacts])

  useEffect(() => {
    for (const [id, o] of Object.entries(nodes.found)) register(id, o)
    onModel?.({ viewpoints: nodes.viewpoints, label: nodes.label, shell: nodes.shell })
  }, [nodes, register, onModel])

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        let o = e.object
        while (o) {
          const id = Object.entries(nodes.found).find(([, n]) => n === o)?.[0]
          if (id) {
            e.stopPropagation()
            if (e.delta <= 6) onPick?.(id)
            return
          }
          o = o.parent
        }
      }}
    />
  )
}
