// S5 background mask without ML (spike). Region growing from the image border over low-gradient, slowly varying luminance,
// small person-islands absorbed, then a chamfer-distance feather that lies entirely on the background side:
// mask = 0 on every person pixel (so the background stage cannot change the person), ramping to 255 over featherPx into the background.

function boxBlur(src, w, h, r) {
  if (r <= 0) return src;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { let acc = 0; const row = y * w; for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) { tmp[row + x] = acc / (2 * r + 1); acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; } }
  for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) { out[y * w + x] = acc / (2 * r + 1); acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; } }
  return out;
}

export function backgroundMask(rgba, w, h, opt) {
  const t0 = performance.now(), N = w * h;
  let L = new Float32Array(N);
  for (let i = 0; i < N; i++) L[i] = (0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]) / 255;
  L = boxBlur(boxBlur(L, w, h, opt.blurRadius), w, h, opt.blurRadius);
  const G = new Float32Array(N);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; const a = L[i - w - 1], b = L[i - w], c = L[i - w + 1], d = L[i - 1], f = L[i + 1], g = L[i + w - 1], hh = L[i + w], k = L[i + w + 1];
    const gx = (c + 2 * f + k - a - 2 * d - g) / 8, gy = (g + 2 * hh + k - a - 2 * b - c) / 8; G[i] = Math.hypot(gx, gy);
  }
  const bg = new Uint8Array(N), q = new Int32Array(N); let qh = 0, qt = 0;
  const seed = (i) => { if (!bg[i] && G[i] < opt.gradThreshold) { bg[i] = 1; q[qt++] = i; } };
  const edges = new Set(opt.seedEdges);
  if (edges.has('top')) for (let x = 1; x < w - 1; x++) seed(w + x);
  if (edges.has('bottom')) for (let x = 1; x < w - 1; x++) seed((h - 2) * w + x);
  if (edges.has('left')) for (let y = 1; y < h - 1; y++) seed(y * w + 1);
  if (edges.has('right')) for (let y = 1; y < h - 1; y++) seed(y * w + w - 2);
  while (qh < qt) {
    const i = q[qh++], x = i % w, y = (i / w) | 0;
    const nbrs = [x > 1 ? i - 1 : -1, x < w - 2 ? i + 1 : -1, y > 1 ? i - w : -1, y < h - 2 ? i + w : -1];
    for (const n of nbrs) if (n >= 0 && !bg[n] && G[n] < opt.gradThreshold && Math.abs(L[n] - L[i]) < opt.stepTolerance) { bg[n] = 1; q[qt++] = n; }
  }
  // frame row/column: copy neighbour state
  for (let x = 0; x < w; x++) { bg[x] = bg[w + x]; bg[(h - 1) * w + x] = bg[(h - 2) * w + x]; }
  for (let y = 0; y < h; y++) { bg[y * w] = bg[y * w + 1]; bg[y * w + w - 1] = bg[y * w + w - 2]; }
  // close the background (dilate then erode) to bridge grain, square structuring element
  const morph = (src, r, dilate) => { const out = new Uint8Array(N); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = dilate ? 0 : 1;
    for (let dy = -r; dy <= r && (dilate ? !v : v); dy++) { const yy = Math.min(h - 1, Math.max(0, y + dy)); for (let dx = -r; dx <= r; dx++) { const s = src[yy * w + Math.min(w - 1, Math.max(0, x + dx))]; if (dilate && s) { v = 1; break; } if (!dilate && !s) { v = 0; break; } } }
    out[y * w + x] = v; } return out; };
  let m = bg;
  if (opt.closeRadius > 0) m = morph(morph(m, opt.closeRadius, true), opt.closeRadius, false);
  // absorb small person islands (grain, dust) into the background
  const lab = new Int32Array(N).fill(-1); const sizes = []; let islands = 0;
  for (let s = 0; s < N; s++) { if (m[s] || lab[s] >= 0) continue; const id = sizes.length; let n = 0; qh = qt = 0; q[qt++] = s; lab[s] = id;
    while (qh < qt) { const i = q[qh++]; n++; const x = i % w, y = (i / w) | 0; const nbrs = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
      for (const k of nbrs) if (k >= 0 && !m[k] && lab[k] < 0) { lab[k] = id; q[qt++] = k; } }
    sizes.push(n); }
  const person = new Uint8Array(N); for (let i = 0; i < N; i++) if (!m[i]) { if (sizes[lab[i]] >= opt.minIslandPx) person[i] = 1; else islands++; }
  // chamfer distance (3-4) from person pixels, in pixels
  const INF = 1e9, D = new Float32Array(N); for (let i = 0; i < N; i++) D[i] = person[i] ? 0 : INF;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let d = D[i];
    if (x > 0) d = Math.min(d, D[i - 1] + 3); if (y > 0) { d = Math.min(d, D[i - w] + 3); if (x > 0) d = Math.min(d, D[i - w - 1] + 4); if (x < w - 1) d = Math.min(d, D[i - w + 1] + 4); } D[i] = d; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let d = D[i];
    if (x < w - 1) d = Math.min(d, D[i + 1] + 3); if (y < h - 1) { d = Math.min(d, D[i + w] + 3); if (x < w - 1) d = Math.min(d, D[i + w + 1] + 4); if (x > 0) d = Math.min(d, D[i + w - 1] + 4); } D[i] = d; }
  const out = new Uint8Array(N); let bgCount = 0; const f = Math.max(1, opt.featherPx);
  for (let i = 0; i < N; i++) { if (person[i]) continue; bgCount++; const t = Math.min(1, D[i] / 3 / f); out[i] = Math.round(255 * t * t * (3 - 2 * t)); }
  return { mask: out, person, dist: D, stats: { ms: +(performance.now() - t0).toFixed(1), backgroundFraction: +(bgCount / N).toFixed(4), absorbedIslandPx: islands, components: sizes.length } };
}

// exact mask from an alpha channel (SVG rasters): background where alpha == 0, same feather rule
export function alphaMask(rgbaWithAlpha, w, h, featherPx) {
  const N = w * h, person = new Uint8Array(N); for (let i = 0; i < N; i++) person[i] = rgbaWithAlpha[i * 4 + 3] > 0 ? 1 : 0;
  const INF = 1e9, D = new Float32Array(N); for (let i = 0; i < N; i++) D[i] = person[i] ? 0 : INF;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let d = D[i]; if (x > 0) d = Math.min(d, D[i - 1] + 3); if (y > 0) { d = Math.min(d, D[i - w] + 3); if (x > 0) d = Math.min(d, D[i - w - 1] + 4); if (x < w - 1) d = Math.min(d, D[i - w + 1] + 4); } D[i] = d; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let d = D[i]; if (x < w - 1) d = Math.min(d, D[i + 1] + 3); if (y < h - 1) { d = Math.min(d, D[i + w] + 3); if (x < w - 1) d = Math.min(d, D[i + w + 1] + 4); if (x > 0) d = Math.min(d, D[i + w - 1] + 4); } D[i] = d; }
  const out = new Uint8Array(N); for (let i = 0; i < N; i++) { if (person[i]) continue; const t = Math.min(1, D[i] / 3 / Math.max(1, featherPx)); out[i] = Math.round(255 * t * t * (3 - 2 * t)); }
  return { mask: out, person, dist: D, stats: { backgroundFraction: +(1 - person.reduce((a, b) => a + b, 0) / N).toFixed(4) } };
}

// chamfer distance (px) from every pixel to the nearest pixel where src[i] == 1
export function chamfer(src, w, h) {
  const N = w * h, INF = 1e9, D = new Float32Array(N); for (let i = 0; i < N; i++) D[i] = src[i] ? 0 : INF;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; let d = D[i]; if (x > 0) d = Math.min(d, D[i - 1] + 3); if (y > 0) { d = Math.min(d, D[i - w] + 3); if (x > 0) d = Math.min(d, D[i - w - 1] + 4); if (x < w - 1) d = Math.min(d, D[i - w + 1] + 4); } D[i] = d; }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let d = D[i]; if (x < w - 1) d = Math.min(d, D[i + 1] + 3); if (y < h - 1) { d = Math.min(d, D[i + w] + 3); if (x < w - 1) d = Math.min(d, D[i + w + 1] + 4); if (x > 0) d = Math.min(d, D[i + w - 1] + 4); } D[i] = d; }
  for (let i = 0; i < N; i++) D[i] /= 3; return D;
}
