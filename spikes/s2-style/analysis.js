// S2 spike: image analysis on RGBA byte arrays (equirect seam metrics, WCAG-style legibility, tone statistics).
const LIN = new Float32Array(256);
for (let v = 0; v < 256; v++) { const c = v / 255; LIN[v] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
export const relLum = (r, g, b) => 0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[b];
export const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// which cube face (hardware major-axis rule) each equirect pixel samples
export function faceMap(W, H) {
  const f = new Uint8Array(W * H); const sx = new Float32Array(W), cx = new Float32Array(W);
  for (let x = 0; x < W; x++) { const lon = ((x + 0.5) / W - 0.5) * 2 * Math.PI; sx[x] = Math.sin(lon); cx[x] = Math.cos(lon); }
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - (y + 0.5) / H) * Math.PI; const sl = Math.sin(lat), cl = Math.cos(lat), ay = Math.abs(sl);
    for (let x = 0; x < W; x++) {
      const dx = sx[x] * cl, dz = -cx[x] * cl, ax = Math.abs(dx), az = Math.abs(dz);
      f[y * W + x] = ax >= ay && ax >= az ? (dx > 0 ? 0 : 1) : ay >= az ? (sl > 0 ? 2 : 3) : (dz > 0 ? 4 : 5);
    }
  }
  return f;
}
export function lumaBytes(rgba, n) { const L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]; return L; }

const pct = (arr, p) => { if (!arr.length) return 0; const a = Float32Array.from(arr).sort(); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };

// Cube-face seam metrics. dLseam: mean |luma step| across a face border; dLctrl: same measure 5 px either side (same face). inkRatio: dark-pixel density within 2 px of a seam over density 7..12 px away.
export function seamMetrics(L, W, H, face, inkThr = 60) {
  const rowLo = Math.floor(H * 0.06), rowHi = Math.floor(H * 0.94);
  const seamD = [], ctrlD = []; const seamPix = [];
  for (let y = rowLo; y < rowHi; y++) for (let x = 8; x < W - 9; x++) {
    const i = y * W + x;
    if (face[i] !== face[i + 1]) { seamD.push(Math.abs(L[i] - L[i + 1])); seamPix.push(i, i + 1); for (const o of [-5, 5]) { const j = i + o; if (face[j] === face[j + 1]) ctrlD.push(Math.abs(L[j] - L[j + 1])); } }
    if (y + 8 < rowHi && face[i] !== face[i + W]) { seamD.push(Math.abs(L[i] - L[i + W])); seamPix.push(i, i + W); for (const o of [-5, 5]) { const j = i + o * W; if (face[j] === face[j + W]) ctrlD.push(Math.abs(L[j] - L[j + W])); } }
  }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const dist = new Uint8Array(W * H).fill(255); const R = 12;
  for (const i of seamPix) { const x = i % W, y = (i / W) | 0; for (let dy = -R; dy <= R; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; for (let dx = -R; dx <= R; dx++) { const xx = x + dx; if (xx < 0 || xx >= W) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); const k = yy * W + xx; if (d < dist[k]) dist[k] = d; } } }
  let inkN = 0, areaN = 0, inkF = 0, areaF = 0;
  for (let y = rowLo; y < rowHi; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const d = dist[i]; if (d <= 2) { areaN++; if (L[i] < inkThr) inkN++; } else if (d >= 7 && d <= 12) { areaF++; if (L[i] < inkThr) inkF++; } }
  const dS = mean(seamD), dC = mean(ctrlD);
  return { seamPairs: seamD.length, dLseam: +dS.toFixed(3), dLctrl: +dC.toFixed(3), dLratio: +(dS / (dC || 1)).toFixed(3), p95seam: +pct(seamD, 0.95).toFixed(1), p95ctrl: +pct(ctrlD, 0.95).toFixed(1), inkDensityNear: +(inkN / (areaN || 1)).toFixed(4), inkDensityFar: +(inkF / (areaF || 1)).toFixed(4), inkRatio: +((inkN / (areaN || 1)) / ((inkF / (areaF || 1)) || 1e-9)).toFixed(3), inkPixelsNear: inkN, seamPixelCount: seamPix.length / 2 };
}

// WCAG-style worst-case contrast of overlay text on blocks of the image. White text is judged on each block's lightest 5 % (p95 luminance), dark text on its darkest 5 % (p5).
export function legibility(rgba, W, H, { bw = 160, bh = 40, y0 = 0, y1 = H, inkHex = '#1a1a17', scrim = [18, 16, 14, 0.72] } = {}) {
  const Link = relLum(...hexRGB(inkHex)); const w = [], k = [], s = [];
  let worstW = { c: 1e9 }, worstK = { c: 1e9 };
  const buf = new Float32Array(bw * bh), bufS = new Float32Array(bw * bh);
  for (let by = y0; by + bh <= y1; by += bh) for (let bx = 0; bx + bw <= W; bx += bw) {
    let n = 0;
    for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) {
      const i = (y * W + x) * 4; const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      buf[n] = relLum(r, g, b);
      const a = scrim[3]; bufS[n] = relLum(Math.round(scrim[0] * a + r * (1 - a)), Math.round(scrim[1] * a + g * (1 - a)), Math.round(scrim[2] * a + b * (1 - a))); n++;
    }
    const sa = buf.slice().sort(), sb = bufS.slice().sort();
    const cw = contrast(1, sa[Math.floor(0.95 * n)]), ck = contrast(sa[Math.floor(0.05 * n)], Link), cs = contrast(1, sb[Math.floor(0.95 * n)]);
    w.push(cw); k.push(ck); s.push(cs);
    if (cw < worstW.c) worstW = { c: cw, x: bx, y: by, scrim: cs }; if (ck < worstK.c) worstK = { c: ck, x: bx, y: by };
  }
  const sum = (a) => ({ min: +Math.min(...a).toFixed(2), p5: +pct(a, 0.05).toFixed(2), median: +pct(a, 0.5).toFixed(2), passAA: +(a.filter((v) => v >= 4.5).length / a.length).toFixed(3), pass3: +(a.filter((v) => v >= 3).length / a.length).toFixed(3) });
  return { blocks: w.length, block: [bw, bh], whiteBare: sum(w), inkBare: sum(k), whiteOnScrim: sum(s), worstWhite: worstW, worstInk: worstK };
}

// luma percentiles and mean colours of the darkest / lightest tails, for deriving duotone ink and paper from a photograph
export function toneTails(rgba, n, lo = 0.02, hi = 0.98) {
  const idx = Array.from({ length: n }, (_, i) => i); const L = lumaBytes(rgba, n); idx.sort((a, b) => L[a] - L[b]);
  const avg = (from, to) => { let r = 0, g = 0, b = 0, c = 0; for (let t = from; t < to; t++) { const i = idx[t] * 4; r += rgba[i]; g += rgba[i + 1]; b += rgba[i + 2]; c++; } return [r / c, g / c, b / c].map(Math.round); };
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const dark = avg(Math.floor(n * 0.0), Math.floor(n * lo)), light = avg(Math.floor(n * hi), n), mid = avg(Math.floor(n * 0.45), Math.floor(n * 0.55));
  return { p02: L[idx[Math.floor(n * lo)]], p98: L[idx[Math.floor(n * hi)]], darkHex: hex(dark), lightHex: hex(light), midHex: hex(mid), meanLuma: L.reduce((s, v) => s + v, 0) / n };
}

export function diffStats(a, b, n) { let sad = 0, sse = 0; for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) { const d = a[i * 4 + c] - b[i * 4 + c]; sad += Math.abs(d); sse += d * d; } const mse = sse / (n * 3); return { meanAbs: +(sad / (n * 3)).toFixed(3), psnr: mse > 0 ? +(10 * Math.log10(255 * 255 / mse)).toFixed(2) : Infinity }; }

// shift a face map in yaw by dx pixels: a "null seam" placement with the same geometry but different content underneath
export function shiftFace(face, W, H, dx) { const f = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) f[y * W + x] = face[y * W + ((x + dx) % W)]; return f; }
// real borders against 7 yaw-shifted placements; z-scores say whether the real value sits outside the null spread
export function seamNull(rgba, W, H, face, inkThr = 60) {
  const L = lumaBytes(rgba, W * H); const real = seamMetrics(L, W, H, face, inkThr); const nulls = [];
  for (let j = 1; j <= 7; j++) nulls.push(seamMetrics(L, W, H, shiftFace(face, W, H, 128 * j), inkThr));
  const stat = (k) => { const v = nulls.map((n) => n[k]); const m = v.reduce((a, b) => a + b, 0) / v.length; const sd = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length); return { mean: +m.toFixed(3), sd: +sd.toFixed(3), min: +Math.min(...v).toFixed(3), max: +Math.max(...v).toFixed(3), z: sd > 0 ? +((real[k] - m) / sd).toFixed(2) : 0 }; };
  return { real, null: { dLratio: stat('dLratio'), inkRatio: stat('inkRatio'), p95seam: stat('p95seam') } };
}

export function distToSeam(face, W, H, R = 8) {
  const dist = new Uint8Array(W * H).fill(255); const rowLo = Math.floor(H * 0.06), rowHi = Math.floor(H * 0.94);
  for (let y = rowLo; y < rowHi; y++) for (let x = 0; x < W - 1; x++) {
    const i = y * W + x; const hit = face[i] !== face[i + 1] ? [i, i + 1] : face[i] !== face[i + W] ? [i, i + W] : null; if (!hit) continue;
    for (const j of hit) { const cx = j % W, cy = (j / W) | 0; for (let dy = -R; dy <= R; dy++) { const yy = cy + dy; if (yy < 0 || yy >= H) continue; for (let dx = -R; dx <= R; dx++) { const xx = cx + dx; if (xx < 0 || xx >= W) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); const k = yy * W + xx; if (d < dist[k]) dist[k] = d; } } }
  }
  return dist;
}
// Two bakes of the same room whose cube is yawed 45 deg apart show identical content except where a cube border (of either bake) lies.
// |luma difference| near a border of either bake, against far from both, isolates the cost of the cube-to-equirect step.
export function rotationDiff(L0, L1, W, H, face) {
  const d0 = distToSeam(face, W, H, 8), d1 = distToSeam(shiftFace(face, W, H, 512), W, H, 8);
  const near = [], far = []; const rowLo = Math.floor(H * 0.06), rowHi = Math.floor(H * 0.94);
  for (let y = rowLo; y < rowHi; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const d = Math.abs(L0[i] - L1[i]); const m = Math.min(d0[i], d1[i]); if (m <= 2) near.push(d); else if (m > 8) far.push(d); }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1); const p = (a, q) => pct(a, q);
  const frac = (a, t) => a.filter((v) => v > t).length / (a.length || 1);
  return { nearPixels: near.length, farPixels: far.length, meanNear: +mean(near).toFixed(3), meanFar: +mean(far).toFixed(3), ratio: +(mean(near) / (mean(far) || 1e-9)).toFixed(2), p99Near: +p(near, 0.99).toFixed(1), p99Far: +p(far, 0.99).toFixed(1), fracOver24Near: +frac(near, 24).toFixed(4), fracOver24Far: +frac(far, 24).toFixed(4) };
}

// Horizontal run length (px) of pixels within `radius` (RGB distance) of the outline ink, rows within +-20 deg pitch, binned by distance from the centre of the cube face.
// Constant angular line weight shows as equal means in all three bins; a per-face screen-space line gets thinner towards the border.
export function lineWeightByFacePos(rgba, W, H, inkRGB, radius = 22, maxRun = 10) {
  const y0 = Math.floor(H * (0.5 - 20 / 180)), y1 = Math.floor(H * (0.5 + 20 / 180)); const bins = [0, 1, 2].map(() => ({ n: 0, sum: 0 }));
  const isInk = (i) => { const dr = rgba[i * 4] - inkRGB[0], dg = rgba[i * 4 + 1] - inkRGB[1], db = rgba[i * 4 + 2] - inkRGB[2]; return dr * dr + dg * dg + db * db < radius * radius; };
  for (let y = y0; y < y1; y++) { let x = 0; while (x < W) { if (!isInk(y * W + x)) { x++; continue; } const st = x; while (x < W && isInk(y * W + x)) x++; const len = x - st; if (len > maxRun) continue; const yaw = ((st + len / 2) / W) * 360 - 180; const off = ((((yaw + 45) % 90) + 90) % 90) - 45; const s = Math.abs(Math.tan((off * Math.PI) / 180)); const b = Math.min(2, Math.floor(s * 3)); bins[b].n++; bins[b].sum += len; } }
  return bins.map((b, i) => ({ faceRadius: ['0-0.33', '0.33-0.67', '0.67-1'][i], runs: b.n, meanRunPx: +(b.sum / (b.n || 1)).toFixed(2) }));
}
