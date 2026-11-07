// The museum guide: one of three Microsoft Rocketbox avatars (MIT, app/CREDITS.md), chosen per
// visitor (guides.js), driven by Rocketbox motion capture:
// - idle mocap at rest; talking-gesture mocap while the guide speaks (speaker.speaking)
// - pointing: the presentation-gesture clip toward the side the artifact is on (`pointAt`)
// - nod: bump `nodKey` to play the listen/accept clip once
// - lip-sync: speaker.sample() -> the 15 Oculus viseme blendshapes, plus jaw, brows and a blink
// - head: turns toward the artifact being talked about (`pointAt` / `lookAtTarget`), else the
//   visitor (camera), on top of the mocap and clamped to what a neck can do
// - fixedYaw: her facing about her own vertical, a number or a function read every frame (the photo
//   room's presenter, who turns toward the photograph's subject while she talks of it); without it the
//   whole body turns toward `faceTarget` (a Vector3 the caller may move every frame, as the room's
//   guide director does: room/RoomGuide.jsx) / the camera.
// - gait: { speed } (m/s, the caller moves her): while she walks, a procedural gait swings her
//   legs and arms on top of the idle mocap (the motion files hold no walk clip).
// - fade: { k, update(dt)? } (k 0..1): her opacity, for a move where she cannot walk (room/RoomGuide.jsx
//   fades her out at one spot and in at the next); 0 hides her. update runs first in her frame, so the k
//   it sets is drawn that same frame.
//
// Retargeting: avatar and motion files carry the same 3ds Max Biped skeleton (same bone names and
// axes, different proportions), so a clip's local bone rotations apply directly. Translation tracks
// are dropped except the pelvis, scaled by the ratio of the two skeletons' leg lengths so the feet
// stay on the floor. Facial-bone tracks are dropped: the face is driven by blendshapes.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScopedGLTF } from '../loadHooks.js'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { speaker } from './speech.js'
import { GUIDES, MOTION, guideId } from './guides.js'
import { VISEMES, VISEME_MORPH } from './visemes.js'

const FACE_BONE = /(Eye|Jaw|Lip|Mouth|Masseter|Caninus|Brow|Cheek|Nose|Tongue|Nub)/


function legLength(root) {
  const calf = root.getObjectByName('Bip01_L_Calf')
  const foot = root.getObjectByName('Bip01_L_Foot')
  if (!calf || !foot) return 1
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

const tmpQ = new THREE.Quaternion()
const tmpQ2 = new THREE.Quaternion()
const tmpV = new THREE.Vector3()
const tmpV2 = new THREE.Vector3()
const bodyFwd = new THREE.Vector3()
const POINT_HOLD = 4.6 // seconds of the presentation gesture before the arms return to talking
const STRIDE = 1.35 // metres per gait cycle (two steps)
const LATERAL = new THREE.Vector3(1, 0, 0) // her left (she faces +Z of her root)
const GAIT = [
  // [bone, swing amplitude (rad, about her lateral axis; negative swings forward), phase offset, knee-style bend]
  ['Bip01_L_Thigh', -0.38, 0, 0],
  ['Bip01_R_Thigh', -0.38, Math.PI, 0],
  ['Bip01_L_Calf', 0.55, 0, 1],
  ['Bip01_R_Calf', 0.55, Math.PI, 1],
  ['Bip01_L_UpperArm', 0.22, 0, 0],
  ['Bip01_R_UpperArm', 0.22, Math.PI, 0],
]

export function Guide({ guide, pointAt = null, nodKey = 0, reducedMotion = false, faceTarget = null, fixedYaw = null, lookAtTarget = null, gait = null, fade = null, onMeasure, ...props }) {
  const cfg = GUIDES[guide || guideId()]
  const avatar = useScopedGLTF(cfg.url)
  const motion = useScopedGLTF(MOTION[cfg.motion])
  const { camera, gl, scene: world } = useThree()
  const root = useRef()

  const scene = useMemo(() => {
    const s = cloneSkinned(avatar.scene)
    s.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.frustumCulled = false
        const m = o.material
        if (m.name?.endsWith('_opacity')) Object.assign(m, { alphaTest: 0.5, transparent: false, alphaToCoverage: true, side: THREE.FrontSide })
        if (m.name?.endsWith('_glasses')) Object.assign(m, { transparent: true, depthWrite: false })
        if (m.map) m.map.anisotropy = 8
        // a see-through copy for a fade (its own shader program, built ahead: a fade must never wait on a compile)
        const faded = m.clone()
        Object.assign(faded, { transparent: true, depthWrite: false })
        o.userData.mats = { seen: m, faded, opacity: m.opacity }
      }
    })
    return s
  }, [avatar])

  const rig = useMemo(() => {
    const mixer = new THREE.AnimationMixer(scene)
    const byName = Object.fromEntries(motion.animations.map((c) => [c.name, c]))
    const make = (name, loop = true) => {
      const clip = byName[name]
      if (!clip) return null
      const a = mixer.clipAction(retarget(clip, motion.scene, scene))
      a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
      a.clampWhenFinished = !loop
      a.play()
      a.setEffectiveWeight(0)
      return a
    }
    const t = cfg.takes
    const actions = {
      idle: make(t.idle),
      talk: t.talk.map((n) => make(n)).filter(Boolean),
      pointL: make(t.point.left, false),
      pointR: make(t.point.right, false),
      nod: make(t.nod, false),
    }
    const morphMeshes = []
    scene.traverse((o) => {
      if (o.isMesh && o.morphTargetDictionary) morphMeshes.push(o)
    })
    const gait = GAIT.map(([name, amp, off, bend]) => ({ bone: scene.getObjectByName(name), amp, off, bend })).filter((b) => b.bone)
    return { mixer, actions, morphMeshes, gait, head: scene.getObjectByName('Bip01_Head'), headFwd: null }
  }, [scene, motion, cfg])

  useEffect(() => () => rig.mixer.stopAllAction(), [rig])

  // dev only: the e2e checks find her through this registry (her figure on screen, where she looks);
  // a stage may draw her in a scene of its own (the photo room's foreground)
  useEffect(() => {
    const g = root.current
    if (!import.meta.env.DEV || !g) return
    const set = (window.__guideRoots ||= new Set())
    set.add(g)
    return () => set.delete(g)
  }, [])

  const st = useRef({
    t: 0,
    w: { idle: 1, talk: 0, point: 0, nod: 0 },
    talkIdx: 0,
    wasSpeaking: false,
    pointSide: null,
    pointT: -1,
    nodT: -1,
    blinkAt: 1.2,
    blink: 0,
    vis: Object.fromEntries(VISEMES.map((v) => [v, 0])),
    level: 0,
    look: new THREE.Vector3(0, 1.6, 3),
    measured: false,
    gaitW: 0,
    phase: 0,
  })

  useEffect(() => {
    if (!nodKey) return
    st.current.nodT = 0
    const a = rig.actions.nod
    if (a) {
      a.reset()
      a.setEffectiveTimeScale(0.95)
      a.play()
    }
  }, [nodKey, rig])

  // pointing starts when a target arrives: pick the side of her body the target is on
  const pointKey = pointAt ? pointAt.toArray().map((v) => v.toFixed(2)).join(',') : ''
  useEffect(() => {
    const s = st.current
    if (!pointAt || reducedMotion || !root.current) {
      s.pointT = -1
      return
    }
    root.current.updateWorldMatrix(true, false)
    const local = root.current.worldToLocal(pointAt.clone())
    // the avatar faces +Z of its root, so her left hand is on +X
    s.pointSide = local.x >= 0 ? 'L' : 'R'
    s.pointT = 0
    const a = rig.actions[`point${s.pointSide}`]
    if (a) {
      a.reset()
      a.time = cfg.takes.point.from
      a.setEffectiveTimeScale(cfg.takes.point.speed)
      a.play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointKey, reducedMotion, rig])

  const setMorph = (key, v) => {
    for (const m of rig.morphMeshes) {
      const i = m.morphTargetDictionary[key]
      if (i !== undefined) m.morphTargetInfluences[i] = v
    }
  }

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const s = st.current
    const g = root.current
    if (!g) return
    s.t += dt

    // her opacity (a fade between two spots): the see-through materials only while she is not fully seen.
    // Their shader programs are built once she has stood in the scene half a second (its lights and fog in),
    // so the first fade does not stall a frame on a compile.
    if (fade && !s.warmed && s.t > 0.5) {
      s.warmed = true
      const swap = (key) => scene.traverse((o) => o.userData.mats && (o.material = o.userData.mats[key]))
      swap('faded')
      try {
        gl.compileAsync(scene, camera, world).catch(() => {})
      } finally {
        swap(s.fadeK < 1 ? 'faded' : 'seen')
      }
    }
    fade?.update?.(dt)
    const k = fade ? THREE.MathUtils.clamp(fade.k, 0, 1) : 1
    if (k !== s.fadeK) {
      s.fadeK = k
      scene.traverse((o) => {
        const m = o.userData.mats
        if (!m) return
        o.material = k < 1 ? m.faded : m.seen
        m.faded.opacity = m.opacity * k
      })
      g.visible = k > 0
      g.userData.fade = k
    }

    // body facing (a fixed yaw may be a function, read every frame)
    if (fixedYaw !== null) g.rotation.y = typeof fixedYaw === 'function' ? fixedYaw(dt) : fixedYaw
    else {
      const face = faceTarget || camera.position
      g.getWorldPosition(tmpV2)
      const yaw = Math.atan2(face.x - tmpV2.x, face.z - tmpV2.z)
      g.rotation.y = reducedMotion ? yaw : dampAngle(g.rotation.y, yaw, gait?.speed > 0.05 ? 6 : 3, dt)
    }

    // which clips carry the body this frame
    const speaking = speaker.speaking
    if (speaking && !s.wasSpeaking) s.talkIdx = (s.talkIdx + 1) % Math.max(1, rig.actions.talk.length)
    s.wasSpeaking = speaking
    if (s.pointT >= 0) {
      s.pointT += dt
      if (s.pointT > POINT_HOLD) s.pointT = -1
    }
    if (s.nodT >= 0) {
      s.nodT += dt
      if (s.nodT > 2.2) s.nodT = -1
    }
    const want = { idle: 1, talk: 0, point: 0, nod: 0 }
    if (!reducedMotion) {
      if (s.nodT >= 0) want.nod = 3
      else if (s.pointT >= 0) want.point = 3
      else if (speaking) want.talk = 2
    }
    for (const k of Object.keys(want)) s.w[k] = THREE.MathUtils.damp(s.w[k], want[k], 4, dt)
    const sum = s.w.idle + s.w.talk + s.w.point + s.w.nod || 1
    const A = rig.actions
    A.idle?.setEffectiveWeight(s.w.idle / sum)
    A.talk.forEach((a, i) => a.setEffectiveWeight(i === s.talkIdx ? s.w.talk / sum : 0))
    A.pointL?.setEffectiveWeight(s.pointSide === 'L' ? s.w.point / sum : 0)
    A.pointR?.setEffectiveWeight(s.pointSide === 'R' ? s.w.point / sum : 0)
    A.nod?.setEffectiveWeight(s.w.nod / sum)
    rig.mixer.update(reducedMotion ? dt * 0.5 : dt)
    g.updateWorldMatrix(true, true)

    // walking: legs and arms swing about her lateral axis, at the pace she moves
    const speed = gait?.speed || 0
    s.gaitW = reducedMotion ? 0 : THREE.MathUtils.damp(s.gaitW, speed > 0.05 ? 1 : 0, 8, dt)
    if (s.gaitW > 0.002) {
      s.phase += (dt * Math.max(speed, 0.4) * Math.PI * 2) / STRIDE
      g.getWorldQuaternion(tmpQ2)
      const lateral = tmpV.copy(LATERAL).applyQuaternion(tmpQ2)
      for (const b of rig.gait) {
        const x = Math.sin(s.phase + b.off)
        // a knee bends only while its leg swings through (one way, never backwards)
        const a = b.bend ? b.amp * Math.max(0, Math.cos(s.phase + b.off)) : b.amp * x
        b.bone.parent.getWorldQuaternion(tmpQ).invert()
        const axis = tmpV2.copy(lateral).applyQuaternion(tmpQ).normalize()
        b.bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, a * s.gaitW))
      }
      g.updateWorldMatrix(true, true)
    }

    if (!s.measured && rig.head) {
      s.measured = true
      rig.head.getWorldPosition(tmpV)
      g.getWorldPosition(tmpV2)
      onMeasure?.({ headY: tmpV.y - tmpV2.y })
    }

    // head toward what we are talking about, else the visitor, on top of the mocap
    if (rig.head) {
      if (!rig.headFwd) {
        rig.head.getWorldQuaternion(tmpQ)
        const fwdWorld = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(tmpQ2))
        rig.headFwd = fwdWorld.applyQuaternion(tmpQ.clone().invert())
      }
      const target = pointAt || lookAtTarget || camera.position
      if (reducedMotion) s.look.copy(target)
      else s.look.lerp(target, 1 - Math.exp(-5 * dt))
      rig.head.getWorldQuaternion(tmpQ)
      rig.head.getWorldPosition(tmpV)
      const cur = rig.headFwd.clone().applyQuaternion(tmpQ)
      const wantDir = tmpV2.copy(s.look).sub(tmpV).normalize()
      // she turns her head all the way to what she is talking about within a neck's reach (about
      // 70 degrees off her body's facing); past that, less and less (her body turns the rest). The reach is
      // measured from her body, not from where the mocap holds her head at this moment: a talking take that
      // swings the head away must not take her gaze off the stop with it (fix round 12, the gate: the
      // male guide's gaze drifted up to 58 degrees off Trenton's photograph while he talked about it)
      const angle = bodyFwd.set(0, 0, 1).applyQuaternion(g.getWorldQuaternion(tmpQ2)).angleTo(wantDir)
      const amount = THREE.MathUtils.clamp(angle < 1.2 ? 0.95 : 0.95 * (1 - (angle - 1.2) / 0.9), 0, 0.95)
      const delta = new THREE.Quaternion().setFromUnitVectors(cur, wantDir)
      const aim = delta.multiply(tmpQ)
      tmpQ.slerp(aim, amount)
      rig.head.parent.getWorldQuaternion(tmpQ2).invert()
      rig.head.quaternion.copy(tmpQ2.multiply(tmpQ))
      if (import.meta.env.DEV) {
        // how far her gaze is from what she should be looking at, in degrees (e2e/chapters.mjs)
        rig.head.updateWorldMatrix(true, false)
        rig.head.getWorldQuaternion(tmpQ)
        rig.head.getWorldPosition(tmpV)
        const now = rig.headFwd.clone().applyQuaternion(tmpQ)
        g.userData.lookErr = THREE.MathUtils.radToDeg(now.angleTo(tmpV2.copy(target).sub(tmpV).normalize()))
        g.userData.lookAt = pointAt || lookAtTarget ? 'focus' : 'visitor'
      }
    }

    // face: visemes from the speaker, jaw, brows, smile, blink
    const m = speaker.sample()
    s.level = THREE.MathUtils.damp(s.level, Math.min(1, m.level * 1.6), 20, dt)
    for (const v of VISEMES) {
      s.vis[v] = THREE.MathUtils.damp(s.vis[v], v === m.unit ? s.level : 0, 22, dt)
      setMorph(VISEME_MORPH[v], Math.min(0.85, s.vis[v] * 1.3))
    }
    setMorph('AK_25_JawOpen', Math.min(0.4, s.level * 0.3))
    if (s.t > s.blinkAt) {
      s.blink = 1
      s.blinkAt = s.t + 2.6 + Math.random() * 3.2
    }
    s.blink = Math.max(0, s.blink - dt / 0.15)
    const b = Math.sin((1 - s.blink) * Math.PI) * (s.blink > 0 ? 1 : 0)
    setMorph('AK_09_EyeBlinkLeft', b)
    setMorph('AK_10_EyeBlinkRight', b)
    const rest = cfg.restFace || {}
    const nodW = s.w.nod / sum
    setMorph('AK_03_BrowInnerUp', (rest.AK_03_BrowInnerUp || 0) + Math.min(0.35, s.level * 0.3) + nodW * 0.15)
    setMorph('AK_19_EyeSquintLeft', (rest.AK_19_EyeSquintLeft || 0) + nodW * 0.15)
    setMorph('AK_20_EyeSquintRight', (rest.AK_20_EyeSquintRight || 0) + nodW * 0.15)
    const smile = (rest.smile ?? 0.18) + nodW * 0.25 - s.level * 0.12
    setMorph('AK_44_MouthSmileLeft', smile)
    setMorph('AK_45_MouthSmileRight', smile)
  })

  return (
    <group {...props}>
      <group ref={root}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

function dampAngle(a, b, lambda, dt) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return a + d * (1 - Math.exp(-lambda * dt))
}
