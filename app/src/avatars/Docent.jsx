// One guide candidate: a Rocketbox avatar (GLB with blendshapes) driven by Rocketbox
// motion-capture clips from a separate, shared motion GLB.
//
// Retargeting: both files carry the same 3ds Max Biped skeleton (same bone names and bone axes,
// different proportions), so a clip's local bone rotations apply directly. Translation tracks are
// dropped except the pelvis, which is scaled by the ratio of the two skeletons' leg lengths so the
// feet stay on the floor. Facial-bone tracks are dropped: the face is driven by blendshapes.
//
// Every frame is computed from the shared timeline time `t` (no accumulated mixer state), so the
// page can scrub to any moment.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { versioned } from '../shared/assetVersion.js'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { BEATS, SPEECH, weightsAt } from './timeline.js'
import { VISEMES } from './voice.js'

const FACE_BONE = /(Eye|Jaw|Lip|Mouth|Masseter|Caninus|Brow|Cheek|Nose|Tongue|Nub)/
const VISEME_KEY = Object.fromEntries(VISEMES.map((v, i) => [v, `AA_VI_${String(i).padStart(2, '0')}_${v === 'sil' ? 'Sil' : v === 'kk' ? 'KK' : v === 'PP' ? 'PP' : v}`]))

function legLength(root) {
  const thigh = root.getObjectByName('Bip01_L_Thigh')
  const calf = root.getObjectByName('Bip01_L_Calf')
  const foot = root.getObjectByName('Bip01_L_Foot')
  if (!thigh || !calf || !foot) return 1
  return calf.position.length() + foot.position.length()
}

function retarget(clip, motionRoot, avatarRoot) {
  const k = legLength(avatarRoot) / legLength(motionRoot)
  const tracks = []
  for (const tr of clip.tracks) {
    const [node, prop] = tr.name.split('.')
    if (FACE_BONE.test(node)) continue
    if (prop === 'quaternion') tracks.push(tr)
    else if (prop === 'position' && node === 'Bip01_Pelvis') {
      const t2 = tr.clone()
      for (let i = 0; i < t2.values.length; i++) t2.values[i] *= k
      tracks.push(t2)
    }
  }
  return new THREE.AnimationClip(clip.name, clip.duration, tracks)
}

// deterministic blink: ~every 3-5 s, 150 ms long
function blinkAt(t, seed) {
  const period = 3.4 + seed * 1.3
  const p = ((t + seed * 2.1) % period) / period
  const d = p * period
  return d < 0.15 ? Math.sin((d / 0.15) * Math.PI) : 0
}

const tmpQ = new THREE.Quaternion()
const tmpQ2 = new THREE.Quaternion()
const tmpV = new THREE.Vector3()
const tmpV2 = new THREE.Vector3()

export function Docent({ cand, motionUrl, getT, narration, seed = 0, lookAt = true, ...props }) {
  const avatar = useGLTF(versioned(cand.url))
  const motion = useGLTF(versioned(motionUrl))
  const { camera } = useThree()
  const scene = useMemo(() => {
    const s = cloneSkinned(avatar.scene)
    s.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.frustumCulled = false
        const m = o.material
        if (m.name?.endsWith('_opacity')) { m.alphaTest = 0.5; m.transparent = false; m.alphaToCoverage = true; m.side = THREE.FrontSide }
        if (m.name?.endsWith('_glasses')) { m.transparent = true; m.depthWrite = false }
        if (m.map) m.map.anisotropy = 8
      }
    })
    return s
  }, [avatar])

  const rig = useMemo(() => {
    const mixer = new THREE.AnimationMixer(scene)
    const byName = Object.fromEntries(motion.animations.map((c) => [c.name, c]))
    const actions = BEATS.map((b) => {
      const take = { ...b, ...(b.take?.[cand.motion] || {}), ...(b.take?.[cand.id] || {}) }
      const clip = retarget(byName[take.clip], motion.scene, scene)
      const a = mixer.clipAction(clip)
      a.play()
      a.setEffectiveWeight(0)
      return { beat: b, take, action: a, duration: clip.duration }
    })
    const morphMeshes = []
    scene.traverse((o) => { if (o.isMesh && o.morphTargetDictionary) morphMeshes.push(o) })
    const head = scene.getObjectByName('Bip01_Head')
    const neck = scene.getObjectByName('Bip01_Neck')
    return { mixer, actions, morphMeshes, head, neck, headFwd: null, look: 0 }
  }, [scene, motion, cand])

  useEffect(() => () => rig.mixer.stopAllAction(), [rig])
  useEffect(() => {
    // read-only handle for the screenshot scripts (bone positions at a given moment)
    window.__docents = { ...(window.__docents || {}), [cand.id]: scene }
  }, [cand.id, scene])

  const setMorph = (key, v) => {
    for (const m of rig.morphMeshes) {
      const i = m.morphTargetDictionary[key]
      if (i !== undefined) m.morphTargetInfluences[i] = v
    }
  }

  const root = useRef()

  useFrame(() => {
    const t = getT()
    const w = weightsAt(t)
    rig.actions.forEach(({ beat, take, action, duration }, i) => {
      let local = take.from + (t - beat.start) * (take.speed ?? 1)
      local = take.loop ? ((local % duration) + duration) % duration : THREE.MathUtils.clamp(local, 0, duration - 1e-3)
      action.time = local
      action.setEffectiveWeight(w[i])
    })
    rig.mixer.update(0)
    scene.updateMatrixWorld(true)

    // Head: turn a little toward the camera on top of the mocap (who you are talking to).
    if (lookAt && rig.head) {
      if (!rig.headFwd) {
        // the avatar faces +Z of its root group; express that axis in head-local space once
        rig.head.getWorldQuaternion(tmpQ)
        const fwdWorld = new THREE.Vector3(0, 0, 1).applyQuaternion(root.current.getWorldQuaternion(tmpQ2))
        rig.headFwd = fwdWorld.applyQuaternion(tmpQ.clone().invert())
      }
      rig.head.getWorldQuaternion(tmpQ)
      rig.head.getWorldPosition(tmpV)
      const cur = rig.headFwd.clone().applyQuaternion(tmpQ)
      const want = tmpV2.copy(camera.position).sub(tmpV).normalize()
      const angle = cur.angleTo(want)
      const amount = THREE.MathUtils.clamp(0.55 * (1 - angle / 1.4), 0, 0.55)
      const delta = new THREE.Quaternion().setFromUnitVectors(cur, want)
      const target = delta.multiply(tmpQ)
      tmpQ.slerp(target, amount)
      rig.head.parent.getWorldQuaternion(tmpQ2).invert()
      rig.head.quaternion.copy(tmpQ2.multiply(tmpQ))
    }

    // Face: visemes (with a little co-articulation from neighbouring samples), blink, brows, smile
    const at = t - SPEECH.at + SPEECH.from
    const speaking = narration && at >= SPEECH.from && at <= SPEECH.to
    const acc = Object.fromEntries(VISEMES.map((v) => [v, 0]))
    let level = 0
    if (speaking) {
      for (const [dt, k] of [[-0.05, 0.25], [0, 0.5], [0.05, 0.25]]) {
        const m = narration.mouth(at + dt)
        const lv = Math.min(1, m.level * 1.7)
        acc[m.v] += k * lv
        level += k * lv
      }
    }
    for (const v of VISEMES) setMorph(VISEME_KEY[v], Math.min(0.85, acc[v] * 1.3))
    setMorph('AK_25_JawOpen', Math.min(0.4, level * 0.3))
    const b = blinkAt(t, seed)
    setMorph('AK_09_EyeBlinkLeft', b)
    setMorph('AK_10_EyeBlinkRight', b)
    const nodW = w[BEATS.findIndex((x) => x.id === 'nod')]
    const brow = speaking ? Math.min(0.35, level * 0.3) : 0
    const rest = cand.restFace || {}
    setMorph('AK_03_BrowInnerUp', (rest.AK_03_BrowInnerUp || 0) + brow + nodW * 0.15)
    setMorph('AK_19_EyeSquintLeft', (rest.AK_19_EyeSquintLeft || 0) + nodW * 0.15)
    setMorph('AK_20_EyeSquintRight', (rest.AK_20_EyeSquintRight || 0) + nodW * 0.15)
    const smile = (rest.smile ?? 0.18) + nodW * 0.25 - level * 0.12
    setMorph('AK_44_MouthSmileLeft', smile)
    setMorph('AK_45_MouthSmileRight', smile)
    setMorph('AK_07_CheekSquintLeft', nodW * 0.2)
    setMorph('AK_08_CheekSquintRight', nodW * 0.2)
  })

  return (
    <group {...props}>
      <group ref={root}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
