// S5 room driver (spike): re-bake the S2 'ref' room with S2's own code (K = 1, deterministic), derive the record mask by baking once
// without the photograph, paint the constructed layer, then put the record pixels back untouched.
const V = new URLSearchParams(location.search).get('v') || Date.now();
const B = await import('/s2-style/bake.js');
const { Painter, resolveJob } = await import(`/s5-painterly/painterly.js?v=${V}`);
const RECV = 'http://127.0.0.1:8796';
const R = (window.__room = { log: [], ready: false, err: null, res: {} });
const logEl = document.getElementById('log');
const log = (...a) => { const s = a.join(' '); R.log.push(s); logEl.textContent += s + '\n'; };
const tokens = (R.tokens = await (await fetch(`/s5-painterly/painterly-tokens.json?v=${V}`, { cache: 'no-store' })).json());
const painter = (R.painter = new Painter());
const W = 4096, H = 2048, FW = 1280, FH = 720;
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const toBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));
const rgbaCanvas = (rgba, w, h) => { const c = canvas(w, h); c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, w * h * 4), w, h), 0, 0); return c; };
async function post(dest, name, blob) { const r = await fetch(`${RECV}/save?dest=${dest}&name=${name}`, { method: 'POST', body: blob }); if (!r.ok) throw new Error('save failed ' + name + ' ' + r.status); return +(blob.size / 1024).toFixed(1); }
Object.assign(R, { post, toBlob, rgbaCanvas, canvas });

R.bake = async () => {
  const t = performance.now();
  await B.bakeStyle('ref', { fast: true }); const a = window.__bake.canvases.ref; R.bufE = a.bufE.slice(); R.bufF = a.bufF.slice();
  // exact record mask: cast each pixel's view ray at the photograph's plane rectangle (pixel centre test), then dilate 1 px so mixed rim pixels stay the bake's own
  const mesh = a.room.scene.getObjectByName('record-photo'); mesh.updateMatrixWorld(true); const E = a.room.eye.clone();
  const me = mesh.matrixWorld.elements; const ex = [me[0], me[1], me[2]], ey = [me[4], me[5], me[6]], nz = [me[8], me[9], me[10]], C = [me[12], me[13], me[14]];
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); }; const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const sx = Math.hypot(...ex), sy = Math.hypot(...ey); const hw = (mesh.geometry.parameters.width * sx) / 2, hh = (mesh.geometry.parameters.height * sy) / 2; const exn = nrm(ex), eyn = nrm(ey), nzn = nrm(nz);
  const CE = [C[0] - E.x, C[1] - E.y, C[2] - E.z]; const hit = (d) => { const dn = dot(d, nzn); if (Math.abs(dn) < 1e-9) return false; const t = dot(CE, nzn) / dn; if (t <= 0) return false; const P = [d[0] * t - CE[0], d[1] * t - CE[1], d[2] * t - CE[2]]; return Math.abs(dot(P, exn)) <= hw && Math.abs(dot(P, eyn)) <= hh; };
  const dil = (m, w, h) => { const o = m.slice(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (m[i]) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = (x + dx + w) % w, yy = Math.min(h - 1, Math.max(0, y + dy)); if (m[yy * w + xx]) o[i] = 1; } } return o; };
  const cam = B.camRot().elements; const th = Math.tan((96 * Math.PI) / 360), tv = (th * FH) / FW;
  const mF = new Uint8Array(FW * FH); for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const nx = (((x + 0.5) / FW) - 0.5) * 2 * th, ny = (0.5 - (y + 0.5) / FH) * 2 * tv; const l = Math.hypot(nx, ny, 1); const v = [nx / l, ny / l, -1 / l];
    const d = [cam[0] * v[0] + cam[3] * v[1] + cam[6] * v[2], cam[1] * v[0] + cam[4] * v[1] + cam[7] * v[2], cam[2] * v[0] + cam[5] * v[1] + cam[8] * v[2]]; mF[y * FW + x] = hit(d) ? 1 : 0; }
  const mE = new Uint8Array(W * H); for (let y = 0; y < H; y++) { const lat = (0.5 - (y + 0.5) / H) * Math.PI; if (Math.abs(lat) > 0.6) continue; for (let x = 0; x < W; x++) { const lon = ((x + 0.5) / W - 0.5) * 2 * Math.PI;
    mE[y * W + x] = hit([Math.sin(lon) * Math.cos(lat), Math.sin(lat), -Math.cos(lon) * Math.cos(lat)]) ? 1 : 0; } }
  R.recFgeom = dil(mF, FW, FH); R.recEgeom = dil(mE, W, H);
  await B.bakeStyle('ref', { fast: true, nophoto: true }); const b = window.__bake.canvases.ref;
  const mask = (x, y, n) => { const m = new Uint8Array(n); let c = 0; for (let i = 0; i < n; i++) { if (x[i * 4] !== y[i * 4] || x[i * 4 + 1] !== y[i * 4 + 1] || x[i * 4 + 2] !== y[i * 4 + 2]) { m[i] = 1; c++; } } return [m, c]; };
  const [dE] = mask(R.bufE, b.bufE, W * H), [dF] = mask(R.bufF, b.bufF, FW * FH);
  // record = ray-hit mask (dilated 1 px) AND changed-by-the-photo-panel; the diff alone also contains the easel, which is constructed
  R.recE = R.recEgeom.map((v, i) => v & dE[i]); R.recF = R.recFgeom.map((v, i) => v & dF[i]);
  R.recEn = R.recE.reduce((p, v) => p + v, 0); R.recFn = R.recF.reduce((p, v) => p + v, 0);
  R.res.maskAgreement = { geomFlat: R.recFgeom.reduce((p, v) => p + v, 0), geomEquirect: R.recEgeom.reduce((p, v) => p + v, 0), diffFlat: dF.reduce((p, v) => p + v, 0), diffEquirect: dE.reduce((p, v) => p + v, 0) };
  // bounding boxes of the record region
  const bbox = (m, w, h) => { let x0 = w, y0 = h, x1 = -1, y1 = -1; for (let i = 0; i < w * h; i++) if (m[i]) { const x = i % w, y = (i / w) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
  R.res.bake = { ms: +(performance.now() - t).toFixed(0), recordPxEquirect: R.recEn, recordPxFlat: R.recFn, bboxFlat: bbox(R.recF, FW, FH), bboxEquirect: bbox(R.recE, W, H), gpuThree: window.__bake.gpu };
  log('baked', JSON.stringify(R.res.bake)); return R.res.bake;
};

// paint the constructed layer; job target 'roomFlat' or 'equirect'; opts.flatMode forces the no-wrap control on an equirect
R.paint = (buf, w, h, presetId, target, opts = {}) => {
  const tk = { ...tokens, palette: { ...tokens.palette, ...(tokens.roomPalette || {}) } };
  const job = resolveJob(tk, 'room', presetId, target); job.mono = false; job.preBlur = 0; job.levels = [0, 1]; job.yaw = opts.yaw || 0;
  if (opts.flatMode) job.mode = 'flat';
  return painter.paint(buf, w, h, null, job);
};
R.composite = (painted, original, rec) => { const o = painted.slice(); for (let i = 0; i < rec.length; i++) if (rec[i]) { o[i * 4] = original[i * 4]; o[i * 4 + 1] = original[i * 4 + 1]; o[i * 4 + 2] = original[i * 4 + 2]; o[i * 4 + 3] = 255; } return o; };
R.roll = (buf, w, h, dx) => { const o = new Uint8Array(buf.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const s = (y * w + x) * 4, d = (y * w + ((x + dx) % w + w) % w) * 4; o[d] = buf[s]; o[d + 1] = buf[s + 1]; o[d + 2] = buf[s + 2]; o[d + 3] = buf[s + 3]; } return o; };
R.diff = (a, b, n, mask) => { let mx = 0, sum = 0, over2 = 0, cnt = 0; for (let i = 0; i < n; i++) { if (mask && !mask[i]) continue; cnt++; let d = 0; for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(a[i * 4 + k] - b[i * 4 + k])); mx = Math.max(mx, d); sum += d; if (d > 2) over2++; } return { px: cnt, max: mx, mean: +(sum / Math.max(1, cnt)).toFixed(4), fracOver2: +(over2 / Math.max(1, cnt)).toFixed(6) }; };
// wrap metric: mean abs luma step across the u = 0 / 1 seam vs mean step between all other adjacent columns, optionally restricted to |lat| >= latMin
R.wrap = (buf, latMin = 0) => { const lum = (i) => 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2]; let seam = 0, inner = 0, ns = 0, ni = 0;
  for (let y = 0; y < H; y++) { const lat = Math.abs(90 - ((y + 0.5) / H) * 180); if (lat < latMin) continue; const row = y * W * 4;
    seam += Math.abs(lum(row) - lum(row + (W - 1) * 4)); ns++; for (let x = 0; x < W - 1; x += 1) { inner += Math.abs(lum(row + x * 4) - lum(row + (x + 1) * 4)); ni++; } }
  return { seamStep: +(seam / ns).toFixed(3), innerStep: +(inner / ni).toFixed(3), ratio: +((seam / ns) / (inner / ni)).toFixed(3), rows: ns }; };

R.ready = true; log('room ready');
