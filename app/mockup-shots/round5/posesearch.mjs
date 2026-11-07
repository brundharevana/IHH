// usage: node posesearch.mjs <inductee> <stop> <roomKey> <device> <artifactId> [<artifactId>...]
import { chromium } from '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs'
import fs from 'fs'
const [ind, stop, key, dev, ...ids] = process.argv.slice(2)
const POSES = JSON.parse(fs.readFileSync(new URL('../../src/tour/data/room-poses.json', import.meta.url)))
const guide = POSES[key].guide
const vp = dev === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const browser = await chromium.launch({ executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell', args: ['--use-angle=metal'] })
const page = await browser.newPage({ viewport: vp, isMobile: dev === 'phone', hasTouch: dev === 'phone' })
await page.goto(`http://localhost:5173/tour.html?inductee=${ind}&stop=${stop}&autostart=1`)
await page.waitForFunction(() => window.__tourApi?.info()?.spots?.length, null, { timeout: 60000 })
for (const id of ids) {
  const best = await page.evaluate(({ id, guide, phone }) => {
    const info = window.__tourApi.info()
    const cam0 = window.__tour3.camera
    const cam = cam0.clone()
    const V = cam0.position.constructor
    const spot = info.spots.find((s) => s.id === id)
    const b = spot.box
    const size = b.getSize(new V())
    const c = spot.center.clone()
    const thin = Math.min(size.x, size.z) < 0.4 * Math.max(size.x, size.z) ? (size.x < size.z ? 'x' : 'z') : null
    const [minX, , minZ] = info.room.bounds.min
    const [maxX, , maxZ] = info.room.bounds.max
    const valid = (x, z) => x > minX + 0.25 && x < maxX - 0.25 && z > minZ + 0.25 && z < maxZ - 0.25 && !info.room.obstacles.some(([ax, az, bx, bz]) => x > ax - 0.3 && x < bx + 0.3 && z > az - 0.3 && z < bz + 0.3)
    const corners = []
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) corners.push(new V(x, y, z))
    const gHead = new V(guide.pos[0], 1.62, guide.pos[2])
    const gWaist = new V(guide.pos[0], 1.0, guide.pos[2])
    const gFeet = new V(guide.pos[0], 0.0, guide.pos[2])
    let best = null
    const step = 0.15
    for (let x = minX; x <= maxX; x += step)
      for (let z = minZ; z <= maxZ; z += step) {
        if (!valid(x, z)) continue
        const eye = new V(x, 1.6, z)
        if (eye.distanceTo(gHead) < 1.2) continue
        // incidence on a thin (wall-mounted) artifact
        const d = c.clone().sub(eye)
        const h = Math.hypot(d.x, d.z)
        let inc = 0
        if (thin) inc = (Math.acos(Math.abs(thin === 'x' ? d.x : d.z) / h) * 180) / Math.PI
        if (inc > 40) continue
        // the camera must be on the room side of the artifact
        for (const sx of [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6]) {
          cam.position.copy(eye)
          cam.lookAt(c)
          // swing the aim sideways so the guide may come into the frame
          cam.rotateY((sx * cam.fov * Math.PI) / 180 / 2)
          const pitch = Math.atan2(c.y - 1.6, h)
          cam.updateMatrixWorld()
          cam.updateProjectionMatrix()
          const P = corners.map((p) => p.clone().project(cam))
          if (P.some((p) => p.z > 1 || Math.abs(p.x) > 0.95 || Math.abs(p.y) > 0.92)) continue
          const area = ((Math.max(...P.map((p) => p.x)) - Math.min(...P.map((p) => p.x))) * (Math.max(...P.map((p) => p.y)) - Math.min(...P.map((p) => p.y)))) / 4
          const hd = gHead.clone().project(cam)
          const ws = gWaist.clone().project(cam)
          const ft = gFeet.clone().project(cam)
          const guideIn = hd.z < 1 && Math.abs(hd.x) < 0.8 && hd.y < 0.85 && ws.y > -0.95
          const share = (hd.y - ft.y) / 2
          // guide overlapping the artifact
          const ax0 = Math.min(...P.map((p) => p.x)), ax1 = Math.max(...P.map((p) => p.x))
          const overlap = guideIn && hd.x > ax0 - 0.05 && hd.x < ax1 + 0.05 && eye.distanceTo(gHead) < eye.distanceTo(c)
          let score = Math.min(area, 0.35) * 3 - inc / 90 - Math.abs(pitch) * 0.5
          if (guideIn && share > (phone ? 0.2 : 0.28) && share < (phone ? 0.5 : 0.6)) score += 0.6
          if (overlap) score -= 1
          // the phone keeps the bottom 30% for the HUD
          if (phone && Math.min(...P.map((p) => p.y)) < -0.4) score -= 0.4
          if (!best || score > best.score) {
            const look = new V(0, 0, -1).applyQuaternion(cam.quaternion).multiplyScalar(h).add(eye)
            best = { score: +score.toFixed(3), pos: [+x.toFixed(2), 1.6, +z.toFixed(2)], look: look.toArray().map((v) => +v.toFixed(2)), inc: +inc.toFixed(0), area: +area.toFixed(3), guideIn, share: +share.toFixed(2), overlap }
          }
        }
      }
    return best
  }, { id, guide, phone: dev === 'phone' })
  console.log(id, JSON.stringify(best))
}
await browser.close()
