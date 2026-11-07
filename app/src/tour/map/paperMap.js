// Draws an equirectangular vintage paper map onto a canvas (Natural Earth 110m land, public
// domain). Used as a texture by the flat and unroll variants; the land outlines (LAND_URL) load
// through the stage's load scope (FlatMap.jsx usePaperTexture), bounded and recoverable.
import * as THREE from 'three'

export const LAND_URL = '/tour/ne_110m_land.json'

function noise(ctx, w, h, alpha) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * alpha
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n * 0.8
  }
  ctx.putImageData(img, 0, 0)
}

export function drawPaperMap(land, W = 4096, H = 2048) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const px = (lon) => ((lon + 180) / 360) * W
  const py = (lat) => ((90 - lat) / 180) * H

  // paper
  ctx.fillStyle = '#e7d7b4'
  ctx.fillRect(0, 0, W, H)
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.62)
  vg.addColorStop(0, 'rgba(255,248,230,0.35)')
  vg.addColorStop(1, 'rgba(120,80,30,0.35)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  const path = new Path2D()
  for (const f of land.features) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const poly of polys) {
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => (i ? path.lineTo(px(lon), py(lat)) : path.moveTo(px(lon), py(lat))))
        path.closePath()
      }
    }
  }

  // coastal water lines (engraved look): strokes of decreasing alpha around the land
  ctx.save()
  ctx.lineJoin = 'round'
  for (let k = 5; k >= 1; k--) {
    ctx.strokeStyle = `rgba(92,70,40,${0.05 + 0.02 * (5 - k)})`
    ctx.lineWidth = k * 9
    ctx.stroke(path)
    ctx.strokeStyle = '#e7d7b4'
    ctx.lineWidth = k * 9 - 3
    ctx.stroke(path)
  }
  ctx.restore()

  // land
  ctx.fillStyle = '#d9c08e'
  ctx.fill(path)
  ctx.save()
  ctx.clip(path)
  ctx.strokeStyle = 'rgba(110,78,36,0.16)'
  ctx.lineWidth = 2
  for (let x = -H; x < W; x += 14) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + H, H)
    ctx.stroke()
  }
  ctx.restore()
  ctx.strokeStyle = '#6b4c24'
  ctx.lineWidth = 3
  ctx.stroke(path)

  // graticule
  ctx.strokeStyle = 'rgba(107,76,36,0.28)'
  ctx.lineWidth = 1.5
  for (let lon = -180; lon <= 180; lon += 15) {
    ctx.beginPath()
    ctx.moveTo(px(lon), 0)
    ctx.lineTo(px(lon), H)
    ctx.stroke()
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    ctx.beginPath()
    ctx.moveTo(0, py(lat))
    ctx.lineTo(W, py(lat))
    ctx.stroke()
  }

  // compass rose in the North Atlantic
  rose(ctx, px(-42), py(28), 120)
  noise(ctx, W, H, 18)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = THREE.RepeatWrapping
  return tex
}

function rose(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = 'rgba(92,60,25,0.75)'
  ctx.fillStyle = 'rgba(92,60,25,0.75)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    const len = i % 2 ? r * 0.6 : r * 1.05
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * len, Math.sin(a) * len)
    ctx.lineTo(Math.cos(a + 0.28) * r * 0.16, Math.sin(a + 0.28) * r * 0.16)
    ctx.lineTo(Math.cos(a - 0.28) * r * 0.16, Math.sin(a - 0.28) * r * 0.16)
    ctx.closePath()
    i % 2 ? ctx.stroke() : ctx.fill()
  }
  ctx.font = `600 ${r * 0.34}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.fillText('N', 0, -r * 1.12)
  ctx.restore()
}
