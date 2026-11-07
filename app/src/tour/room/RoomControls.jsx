// One camera rig (drei CameraControls / camera-controls) with two modes:
//  walk  - first person: the orbit target sits 1 cm ahead of the eye, so dragging looks around;
//          desktop adds WASD / arrow keys and click-the-floor-to-walk, clamped to the room
//          bounds and furniture boxes. Phones get look-around only and glide between stands.
//  focus - an authored pose (eye + target) per artifact; drag orbits it, wheel zooms.
//
// Transitions are ours, not camera-controls': its setLookAt(..., true) eases the orbit target and
// the spherical angles separately, so (a) the azimuth runs the long way round whenever the two
// poses sit either side of its +-180 degree seam (it never wraps), and (b) the eye follows an orbit
// around a moving target and can swing outside the room. glide() moves the eye in a straight line
// (both ends are inside the room) and turns the view direction along the shortest arc.
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'

const EPS = 0.01
let glides = 0
const EYE = 1.6
const { ACTION } = CameraControlsImpl

export const RoomControls = forwardRef(function RoomControls({ room, phone, reduced, onWalk }, ref) {
  const cc = useRef()
  const keys = useRef(new Set())
  const mode = useRef('walk')
  const { camera } = useThree()
  const tmp = useRef({ dir: new THREE.Vector3(), pos: new THREE.Vector3(), right: new THREE.Vector3(), tgt: new THREE.Vector3() }).current
  const anim = useRef(null)

  // Straight-line eye, shortest-arc view direction, eased; resolves when it lands.
  const glide = (pos, look, transition) => {
    const c = cc.current
    if (anim.current) anim.current.done()
    anim.current = null
    if (!transition) {
      c.setLookAt(...pos, ...look, false)
      c.normalizeRotations()
      return Promise.resolve()
    }
    const p0 = c.getPosition(new THREE.Vector3())
    const t0 = c.getTarget(new THREE.Vector3())
    const p1 = new THREE.Vector3(...pos)
    const t1 = new THREE.Vector3(...look)
    const d0 = t0.clone().sub(p0)
    const d1 = t1.clone().sub(p1)
    const r0 = Math.max(d0.length(), EPS)
    const r1 = Math.max(d1.length(), EPS)
    d0.normalize()
    d1.normalize()
    const turn = new THREE.Quaternion().setFromUnitVectors(d0, d1)
    const angle = d0.angleTo(d1)
    const secs = THREE.MathUtils.clamp(0.55 + 0.32 * p0.distanceTo(p1) + 0.45 * angle, 0.6, 1.9)
    // where the camera is going and how long it takes, for the guide (RoomGuide.jsx: she sets off for her spot
    // there at once and arrives as the camera settles); t runs 0 -> 1 with the glide (1: landed, or cut short)
    const pub = { n: ++glides, pos: [...pos], look: [...look], secs, t: 0 }
    camera.userData.glide = pub
    return new Promise((resolve) => {
      anim.current = {
        t: 0,
        step(dt) {
          this.t = Math.min(1, this.t + dt / secs)
          pub.t = this.t
          const k = this.t < 0.5 ? 4 * this.t ** 3 : 1 - (-2 * this.t + 2) ** 3 / 2
          tmp.pos.lerpVectors(p0, p1, k)
          tmp.dir.copy(d0).applyQuaternion(new THREE.Quaternion().slerp(turn, k))
          tmp.tgt.copy(tmp.pos).addScaledVector(tmp.dir, r0 + (r1 - r0) * k)
          c.setLookAt(tmp.pos.x, tmp.pos.y, tmp.pos.z, tmp.tgt.x, tmp.tgt.y, tmp.tgt.z, false)
          if (this.t >= 1) this.done()
        },
        done() {
          pub.t = 1
          c.setLookAt(...pos, ...look, false)
          c.normalizeRotations()
          if (anim.current === this) anim.current = null
          resolve()
        },
      }
    })
  }

  const valid = (x, z) => {
    const [minX, , minZ] = room.bounds.min
    const [maxX, , maxZ] = room.bounds.max
    if (x < minX + 0.25 || x > maxX - 0.25 || z < minZ + 0.25 || z > maxZ - 0.25) return false
    return !room.obstacles.some(([ax, az, bx, bz]) => x > ax - 0.3 && x < bx + 0.3 && z > az - 0.3 && z < bz + 0.3)
  }

  // nearest walkable floor point (inside the bounds, outside the furniture boxes)
  const clampXZ = (p) => {
    const [minX, , minZ] = room.bounds.min
    const [maxX, , maxZ] = room.bounds.max
    const x = THREE.MathUtils.clamp(p.x, minX + 0.26, maxX - 0.26)
    const z = THREE.MathUtils.clamp(p.z, minZ + 0.26, maxZ - 0.26)
    if (valid(x, z)) return [x, z]
    for (let r = 0.1; r < 3; r += 0.1) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2
        if (valid(x + Math.cos(a) * r, z + Math.sin(a) * r)) return [x + Math.cos(a) * r, z + Math.sin(a) * r]
      }
    }
    return [room.start.pos[0], room.start.pos[2]]
  }

  const setWalkInput = (c) => {
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.NONE
    c.touches.three = ACTION.NONE
    c.azimuthRotateSpeed = -0.32
    c.polarRotateSpeed = -0.32
    c.minPolarAngle = 0.35
    c.maxPolarAngle = Math.PI - 0.35
  }
  const setFocusInput = (c) => {
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.wheel = ACTION.DOLLY
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.TOUCH_DOLLY
    c.azimuthRotateSpeed = 0.5
    c.polarRotateSpeed = 0.5
    c.minPolarAngle = 0
    c.maxPolarAngle = Math.PI * 0.55
    c.minDistance = 0.25
    c.maxDistance = 2.6
  }

  const walkTo = (x, z, lookAt, transition = !reduced) => {
    const c = cc.current
    mode.current = 'walk'
    setWalkInput(c)
    c.minDistance = 0
    c.maxDistance = Infinity
    c.getPosition(tmp.pos)
    let dir
    if (lookAt) dir = new THREE.Vector3(lookAt[0] - x, lookAt[1] - EYE, lookAt[2] - z).normalize()
    else {
      camera.getWorldDirection(tmp.dir)
      dir = tmp.dir.clone()
    }
    return glide([x, EYE, z], [x + dir.x * EPS, EYE + dir.y * EPS, z + dir.z * EPS], transition)
  }

  useImperativeHandle(ref, () => ({
    get mode() {
      return mode.current
    },
    async focus(object, view) {
      const c = cc.current
      if (!c || !object) return
      mode.current = 'focus'
      setFocusInput(c)
      const t = !reduced
      // an authored pose (eye + target): framed around the guide's fixed spot, see RoomStage
      const pose = view?.pose
      if (pose) {
        // a pose may look further up than the default focus clamp (pose.lookUp, degrees above the
        // horizon), for a subject high over the eye (the ball on the Hall of Fame tower, 27 m up)
        if (pose.lookUp) c.maxPolarAngle = Math.max(c.maxPolarAngle, Math.PI / 2 + (pose.lookUp * Math.PI) / 180)
        const d = Math.hypot(...pose.pos.map((v, i) => v - pose.look[i]))
        // zoom in by at most an eighth of the way: the guide must still find a spot in frame beside the
        // stop (owner feedback round 9: after a zoom she walks to one; RoomGuide.jsx)
        c.minDistance = Math.min(d, Math.max(0.25, d * 0.88))
        c.maxDistance = Math.max(2.6, d + 0.4)
        return glide(pose.pos, pose.look, t)
      }
      if (anim.current) anim.current.done()
      c.normalizeRotations()
      const box = new THREE.Box3().setFromObject(object)
      // fitToBox snaps to the nearest axis; seed the snap with the view we want, then tilt.
      c.rotateTo(view?.theta ?? 0, view?.phi ?? Math.PI / 2, false)
      await Promise.all([
        c.fitToBox(box, t, { paddingTop: 0.12, paddingBottom: 0.12, paddingLeft: 0.18, paddingRight: 0.18 }),
        c.rotatePolarTo(view?.phi ?? Math.PI / 2, t),
      ])
    },
    walkTo,
    // Leave focus for the room's start view (owner feedback round 9: the view the room is framed for,
    // with room for the guide beside what it shows)
    home() {
      return walkTo(room.start.pos[0], room.start.pos[2], room.start.look)
    },
    // Leave focus and stand at the artifact's stand point, still facing it.
    back(view, target) {
      const s = view?.stand
      if (s) return walkTo(s[0], s[1], target)
      cc.current.getPosition(tmp.pos)
      return walkTo(...clampXZ(tmp.pos), target)
    },
    walkOnFloor(point) {
      if (phone || mode.current !== 'walk') return
      if (!valid(point.x, point.z)) {
        // step back toward the eye until the spot is free
        cc.current.getPosition(tmp.pos)
        for (let k = 0.9; k > 0; k -= 0.1) {
          const x = tmp.pos.x + (point.x - tmp.pos.x) * k
          const z = tmp.pos.z + (point.z - tmp.pos.z) * k
          if (valid(x, z)) return walkTo(x, z)
        }
        return
      }
      onWalk?.()
      return walkTo(point.x, point.z)
    },
  }))

  useEffect(() => {
    const c = cc.current
    c.smoothTime = reduced ? 0 : 0.45
    c.draggingSmoothTime = reduced ? 0 : 0.09
    c.dollyToCursor = false
    // the orbit target may sit on any object in the room (the bookcase is beyond the walkable
    // area), so the boundary is the room shell when the model gives one, not the walkable box
    const lim = room.shell || room.bounds
    c.setBoundary(new THREE.Box3(new THREE.Vector3(...lim.min), new THREE.Vector3(...lim.max)))
    walkTo(room.start.pos[0], room.start.pos[2], room.start.look, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  useEffect(() => {
    if (phone) return
    const typing = () => {
      const a = document.activeElement
      return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)
    }
    const down = (e) => {
      if (typing()) return
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        if (k.startsWith('arrow') && document.activeElement && document.activeElement !== document.body && document.activeElement.tagName !== 'CANVAS') return
        keys.current.add(k)
        e.preventDefault()
      }
    }
    const up = (e) => keys.current.delete(e.key.toLowerCase())
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [phone])

  useFrame((_, dt) => {
    const c = cc.current
    const k = keys.current
    if (anim.current) {
      // a key press takes over from a transition; otherwise it runs to its pose
      if (k.size) anim.current.done()
      else return anim.current.step(Math.min(dt, 0.05))
    }
    if (!c || k.size === 0) return
    if (mode.current !== 'walk') {
      onWalk?.()
      c.getPosition(tmp.pos)
      walkTo(...clampXZ(tmp.pos), null, false)
      return
    }
    const f = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0)
    const s = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0)
    if (!f && !s) return
    camera.getWorldDirection(tmp.dir)
    const look = tmp.dir.clone()
    tmp.dir.y = 0
    tmp.dir.normalize()
    tmp.right.set(-tmp.dir.z, 0, tmp.dir.x)
    const speed = 1.6 * Math.min(dt, 0.05)
    c.getPosition(tmp.pos)
    const nx = tmp.pos.x + (tmp.dir.x * f + tmp.right.x * s) * speed
    const nz = tmp.pos.z + (tmp.dir.z * f + tmp.right.z * s) * speed
    // slide along walls/furniture: try the full step, then each axis alone
    const [x, z] = valid(nx, nz) ? [nx, nz] : valid(nx, tmp.pos.z) ? [nx, tmp.pos.z] : valid(tmp.pos.x, nz) ? [tmp.pos.x, nz] : [tmp.pos.x, tmp.pos.z]
    c.setLookAt(x, EYE, z, x + look.x * EPS, EYE + look.y * EPS, z + look.z * EPS, false)
  })

  return <CameraControls ref={cc} makeDefault />
})
