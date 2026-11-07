import * as THREE from 'three'

// Procedural textures generated on a canvas at runtime: no downloads, no third-party files.

function canvasTexture(size, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  draw(g, size)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 4
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}

// seeded PRNG so textures are stable between reloads
export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Honed limestone: soft mottling plus faint veins.
export function stoneTexture(base = '#6d6458', repeat = [2, 2], seed = 7) {
  const r = rng(seed)
  return canvasTexture(512, (g, n) => {
    g.fillStyle = base
    g.fillRect(0, 0, n, n)
    for (let i = 0; i < 1400; i++) {
      const x = r() * n, y = r() * n, rad = 3 + r() * 22
      const a = 0.01 + r() * 0.025
      g.fillStyle = r() > 0.5 ? `rgba(255,240,220,${a})` : `rgba(20,14,8,${a})`
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill()
    }
    g.strokeStyle = 'rgba(30,22,14,.18)'
    for (let v = 0; v < 6; v++) {
      g.lineWidth = 0.6 + r() * 1.2
      g.beginPath()
      let x = r() * n, y = 0
      g.moveTo(x, y)
      while (y < n) { x += (r() - 0.5) * 40; y += 10 + r() * 30; g.lineTo(x, y) }
      g.stroke()
    }
  }, { repeat })
}

// Polished floor slabs with thin joints.
export function slabTexture(repeat = [3, 18]) {
  const r = rng(3)
  return canvasTexture(512, (g, n) => {
    g.fillStyle = '#1b1612'
    g.fillRect(0, 0, n, n)
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,235,210' : '0,0,0'},${0.015 + r() * 0.03})`
      g.beginPath(); g.arc(r() * n, r() * n, 2 + r() * 26, 0, Math.PI * 2); g.fill()
    }
    g.strokeStyle = 'rgba(0,0,0,.55)'
    g.lineWidth = 3
    g.strokeRect(0, 0, n, n)
    g.beginPath(); g.moveTo(0, n / 2); g.lineTo(n, n / 2); g.stroke()
  }, { repeat })
}

// Hammered bronze for the doors.
export function bronzeTexture() {
  const r = rng(11)
  return canvasTexture(256, (g, n) => {
    g.fillStyle = '#7a5a33'
    g.fillRect(0, 0, n, n)
    for (let i = 0; i < 1600; i++) {
      const v = r()
      g.fillStyle = v > 0.6 ? `rgba(255,214,150,${0.04 + r() * 0.06})` : `rgba(30,18,6,${0.05 + r() * 0.08})`
      g.beginPath(); g.arc(r() * n, r() * n, 1 + r() * 5, 0, Math.PI * 2); g.fill()
    }
    // verdigris in the low spots
    for (let i = 0; i < 120; i++) {
      g.fillStyle = `rgba(70,120,100,${0.04 + r() * 0.05})`
      g.beginPath(); g.arc(r() * n, r() * n, 2 + r() * 10, 0, Math.PI * 2); g.fill()
    }
  }, { repeat: [1, 3] })
}

// Soft roughness variation (linear data, not colour)
export function roughTexture(repeat = [3, 18]) {
  const r = rng(5)
  return canvasTexture(256, (g, n) => {
    g.fillStyle = 'rgb(70,70,70)'
    g.fillRect(0, 0, n, n)
    for (let i = 0; i < 500; i++) {
      const v = 40 + Math.floor(r() * 90)
      g.fillStyle = `rgba(${v},${v},${v},.25)`
      g.beginPath(); g.arc(r() * n, r() * n, 4 + r() * 30, 0, Math.PI * 2); g.fill()
    }
  }, { repeat, srgb: false })
}
