// A printed card drawn on a canvas once the gallery fonts are loaded: the gallery's wall panel, the
// card that lies in a case whose chapter has no cleared record (galleryLayout.js caseCard), and the
// labelled card that stands for a link-only record in a room (room/RoomRecords.jsx). Dark ground,
// an optional eyebrow, a title in Fraunces under an orange rule, then lines in one or two columns,
// each with its verified fact id beneath it in orange (the caption style of the panel and the viewer's
// fact chips), and an optional footer line.
//
// spec: { w, h (metres, the card's aspect), eyebrow?, title, lines: [{ text, factId? }], footer?,
//         scale? (type size, 1 = the wall panel), columns? (1 or 2, default 2),
//         fit? (true: the type shrinks from `scale` until every line fits on the card) }
import { useEffect, useState } from 'react'
import * as THREE from 'three'

function wrap(ctx, text, maxW) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  return lines
}

// draws the card at type size k; returns the lowest point the text reached (dry: measure only)
function layout(g, spec, W, H, k, dry) {
  const px = (n) => Math.round(n * k)
  const text = (t, x, y) => dry || g.fillText(t, x, y)
  const rect = (x, y, w, h) => dry || g.fillRect(x, y, w, h)
  let low = 0
  const pad = px(120)
  let top = pad
  if (spec.eyebrow) {
    g.fillStyle = 'rgba(240, 232, 221, 0.55)'
    g.font = `500 ${px(24)}px Poppins, system-ui, sans-serif`
    g.letterSpacing = `${px(5)}px`
    text(spec.eyebrow.toUpperCase(), pad, top + px(10))
    g.letterSpacing = '0px'
  }
  g.fillStyle = '#f0e8dd'
  g.font = `400 ${px(92)}px Fraunces, Georgia, serif`
  for (const [i, t] of wrap(g, spec.title, W - pad * 2).entries()) {
    text(t, pad, top + px(120) + i * px(104))
    if (i > 0) top += px(104)
  }
  g.fillStyle = '#ff9b2d'
  rect(pad, top + px(162), px(120), 3)
  // the lines in columns, the first part of them on the left
  const cols = Math.max(1, Math.min(2, spec.columns || 2))
  const per = Math.ceil(spec.lines.length / cols)
  const gap = px(90)
  const colW = (W - pad * 2 - gap * (cols - 1)) / cols
  const y0 = top + px(250)
  let y = y0
  spec.lines.forEach((l, i) => {
    const col = Math.floor(i / per)
    if (i > 0 && i % per === 0) y = y0
    const x = pad + col * (colW + gap)
    g.font = `400 ${px(31)}px Poppins, system-ui, sans-serif`
    g.fillStyle = 'rgba(254, 240, 215, 0.92)'
    for (const ln of wrap(g, l.text, colW)) {
      text(ln, x, y)
      y += px(46)
    }
    if (l.factId) {
      g.font = `500 ${px(20)}px Poppins, system-ui, sans-serif`
      g.fillStyle = 'rgba(255, 179, 102, 0.85)'
      text(l.factId, x, y + px(4))
    }
    low = Math.max(low, y + px(10))
    y += px(74)
  })
  if (spec.footer) {
    g.font = `400 ${px(20)}px Poppins, system-ui, sans-serif`
    g.fillStyle = 'rgba(240, 232, 221, 0.45)'
    text(spec.footer, pad, H - pad + px(40))
  }
  return low
}

export function paintCard(c, spec) {
  const W = 2048
  const H = Math.round((W * spec.h) / spec.w)
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  let k = spec.scale || 1
  // fit: the largest type size, down to half of `scale`, at which the lines end above the bottom margin
  if (spec.fit) {
    const floor = k / 2
    while (k > floor && layout(g, spec, W, H, k, true) > H - Math.round(60 * k)) k *= 0.94
  }
  g.fillStyle = '#16120e'
  g.fillRect(0, 0, W, H)
  layout(g, spec, W, H, k, false)
  return c
}

// the card as a texture (null until the fonts are in and it is drawn); spec must be stable (memoised)
export function useTextCard(spec) {
  const [tex, setTex] = useState(null)
  useEffect(() => {
    if (!spec) return
    let alive = true
    const draw = async () => {
      try {
        await Promise.all([document.fonts.load('400 92px Fraunces'), document.fonts.load('400 30px Poppins'), document.fonts.load('500 22px Poppins')])
      } catch {
        /* fall back to the system fonts */
      }
      if (!alive) return
      const t = new THREE.CanvasTexture(paintCard(document.createElement('canvas'), spec))
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      setTex(t)
    }
    draw()
    return () => {
      alive = false
    }
  }, [spec])
  useEffect(() => () => tex?.dispose(), [tex])
  return tex
}
