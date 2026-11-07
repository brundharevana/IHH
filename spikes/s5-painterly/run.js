// S5 portrait driver (spike). Exposes window.__s5 so the harness can drive it step by step.
const V = new URLSearchParams(location.search).get('v') || Date.now();
const { Painter, resolveJob } = await import(`./painterly.js?v=${V}`);
const { backgroundMask, alphaMask, chamfer } = await import(`./mask.js?v=${V}`);
const RECV = 'http://127.0.0.1:8796';
const S = (window.__s5 = { log: [], results: {}, src: {}, masks: {}, out: {}, done: false, err: null });
const logEl = document.getElementById('log');
const log = (...a) => { const s = a.join(' '); S.log.push(s); logEl.textContent += s + '\n'; };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const toBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));
const KiB = (n) => +(n / 1024).toFixed(1);
const tokens = (S.tokens = await (await fetch(`painterly-tokens.json?v=${V}`, { cache: 'no-store' })).json());
const painter = (S.painter = new Painter());
S.gpu = painter.info; S.compileMs = painter.compileMs; log('gpu', JSON.stringify(painter.info), 'compile', painter.compileMs, 'ms');

// img.decode() never settles while the tab is hidden (observed in the in-app browser); wait for the load event instead
function loadImage(url) { return new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('image failed ' + url)); im.src = url; }); }
export function rgbaCanvas(rgba, w, h) { const c = canvas(w, h); c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, w * h * 4), w, h), 0, 0); return c; }
async function post(dest, name, blob) { const r = await fetch(`${RECV}/save?dest=${dest}&name=${name}`, { method: 'POST', body: blob }); if (!r.ok) throw new Error('save failed ' + name + ' ' + r.status); return blob.size; }
S.post = post; S.rgbaCanvas = rgbaCanvas; S.toBlob = toBlob;

async function sourceRaster(id) {
  if (S.src[id]) return S.src[id];
  const s = tokens.sources[id], H = tokens.targets.portrait.height;
  let r;
  if (s.file.startsWith('svg:')) {
    // optional outline softening for vector art: recolour the ink stroke and scale stroke widths (the SVG file itself is not changed)
    let svgText = await (await fetch(`/s3-avatar/characters/${s.file.slice(4)}.svg`)).text();
    if (s.svgOutline) { svgText = svgText.replaceAll(`stroke="${s.svgOutline.ink}"`, `stroke="${s.svgOutline.color}"`).replace(/stroke-width="([0-9.]+)"/g, (m0, v) => `stroke-width="${(+v * s.svgOutline.widthScale).toFixed(2)}"`); }
    const im = await loadImage(URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' })));
    const w = Math.round((H * 320) / 360);
    const ca = canvas(w, H); const xa = ca.getContext('2d'); xa.drawImage(im, 0, 0, w, H); const alpha = xa.getImageData(0, 0, w, H).data;
    const c = canvas(w, H); const x = c.getContext('2d'); x.fillStyle = '#76788a'; x.fillRect(0, 0, w, H); x.drawImage(im, 0, 0, w, H);
    const rgba = new Uint8Array(x.getImageData(0, 0, w, H).data.buffer);
    // optional pseudo-volume for flat vector art (fictional guide only): shade by distance from the silhouette edge plus a light from the upper left
    const vol = s.volume;
    if (vol) { const N = w * H, inside = new Uint8Array(N); for (let i = 0; i < N; i++) inside[i] = alpha[i * 4 + 3] > 0 ? 0 : 1; const D = chamfer(inside, w, H);
      for (let i = 0; i < N; i++) { if (alpha[i * 4 + 3] === 0) continue; const xx = (i % w) / w, yy = Math.floor(i / w) / H;
        const edge = Math.min(1, D[i] / vol.edgePx); const dirl = 1 + vol.directional * ((0.5 - xx) * 0.8 + (0.5 - yy) * 0.6);
        const k = (vol.edgeDark + (1 - vol.edgeDark) * Math.sqrt(edge)) * dirl; for (let ch = 0; ch < 3; ch++) rgba[i * 4 + ch] = Math.min(255, Math.round(rgba[i * 4 + ch] * k)); } }
    r = { w, h: H, rgba, alpha, canvas: c, flat: ca };
  } else {
    const im = await loadImage(`${RECV}/src/${s.file}`);
    const [cx, cy, cw, ch] = s.crop || [0, 0, im.naturalWidth, im.naturalHeight];
    const w = Math.round((cw * H) / ch);
    const c = canvas(w, H); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, cx, cy, cw, ch, 0, 0, w, H);
    r = { w, h: H, rgba: new Uint8Array(x.getImageData(0, 0, w, H).data.buffer), canvas: c, natural: [im.naturalWidth, im.naturalHeight] };
  }
  return (S.src[id] = r);
}

// luminance percentiles (0..1) of the source raster, used as a uniform tonal stretch
function levelsOf(src, [plo, phi]) {
  if (src.levels) return src.levels; const hist = new Uint32Array(256); const N = src.w * src.h; let n = 0;
  for (let i = 0; i < N; i++) { if (src.alpha && src.alpha[i * 4 + 3] === 0) continue; hist[Math.round(0.2126 * src.rgba[i * 4] + 0.7152 * src.rgba[i * 4 + 1] + 0.0722 * src.rgba[i * 4 + 2])]++; n++; }
  const at = (p) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= p * n) return v / 255; } return 1; };
  return (src.levels = [at(plo), at(phi)]);
}

function maskFor(id, src, job) {
  if (S.masks[id]) return S.masks[id];
  let m = null;
  if (job.background === 'replace') m = backgroundMask(src.rgba, src.w, src.h, job.maskOpt);
  else if (job.background === 'alpha') m = alphaMask(src.alpha, src.w, src.h, job.maskOpt.featherPx);
  return (S.masks[id] = m);
}

export async function paintSource(id, presetId, { noMask = false, yaw = 0 } = {}) {
  const src = await sourceRaster(id); const job = resolveJob(tokens, id, presetId, 'portrait'); job.yaw = yaw;
  const m = noMask ? null : maskFor(id, src, job);
  job.levels = levelsOf(src, tokens.palette.autoLevels);
  const res = painter.paint(src.rgba, src.w, src.h, m ? m.mask : null, job);
  return { ...res, w: src.w, h: src.h, mask: m };
}
S.paintSource = paintSource;

// all sources x presets, saved to the scratchpad; returns timings and sizes
S.runAll = async (ids = Object.keys(tokens.sources), presets = Object.keys(tokens.presets)) => {
  for (const id of ids) for (const p of presets) {
    const r = await paintSource(id, p); const c = rgbaCanvas(r.rgba, r.w, r.h);
    const t = performance.now(); const b = await toBlob(c, 'image/webp', 0.85); const encMs = +(performance.now() - t).toFixed(1);
    await post('scratch', `${id}-${p}.webp`, b);
    S.out[`${id}-${p}`] = c;
    (S.results[id] ||= {})[p] = { w: r.w, h: r.h, timings: r.timings, encodeWebp85Ms: encMs, webp85KiB: KiB(b.size), mask: r.mask ? r.mask.stats : null };
    log('painted', id, p, JSON.stringify(r.timings), 'webp', KiB(b.size), 'KiB');
  }
  return S.results;
};

// warm timing: n runs after one cold run (median and range)
S.bench = async (id = 'einstein', presets = Object.keys(tokens.presets), n = 5) => {
  const out = {};
  for (const p of presets) { const runs = []; for (let i = 0; i < n + 1; i++) { const r = await paintSource(id, p); runs.push(r.timings.totalMs); }
    const warm = runs.slice(1).sort((a, b) => a - b); out[p] = { coldMs: runs[0], warmMedianMs: warm[Math.floor(warm.length / 2)], warmMin: warm[0], warmMax: warm[warm.length - 1], w: S.src[id].w, h: S.src[id].h }; }
  return (S.benchResult = out);
};

// does the background stage change the person? paint with and without the mask; diff person pixels by distance from the mask edge
S.bgInvariance = async (id = 'einstein', preset = 'medium') => {
  const a = await paintSource(id, preset), b = await paintSource(id, preset, { noMask: true });
  const m = S.masks[id]; const N = a.w * a.h; const bgSet = new Uint8Array(N); for (let i = 0; i < N; i++) bgSet[i] = m.person[i] ? 0 : 1;
  const din = chamfer(bgSet, a.w, a.h);
  const bands = [[0, 2], [2, 5], [5, 10], [10, 20], [20, 40], [40, 1e9]]; const res = [];
  for (const [lo, hi] of bands) { let n = 0, nd = 0, sum = 0, mx = 0;
    for (let i = 0; i < N; i++) { if (!m.person[i] || din[i] < lo || din[i] >= hi) continue; n++; let d = 0; for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(a.rgba[i * 4 + k] - b.rgba[i * 4 + k])); if (d > 0) nd++; sum += d; mx = Math.max(mx, d); }
    res.push({ band: `${lo}-${hi === 1e9 ? 'inf' : hi}px`, personPx: n, changedFrac: n ? +(nd / n).toFixed(4) : 0, meanMaxChDiff: n ? +(sum / n).toFixed(3) : 0, maxDiff: mx }); }
  return (S.bgInv = { id, preset, radius: tokens.presets[preset].radius, passes: tokens.presets[preset].passes, bands: res });
};

S.ready = true; log('ready');
