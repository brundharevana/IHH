// S1 spike: bake the room to a 4096x2048 equirectangular image, run the handedness + object-ID gates, export.
import * as THREE from 'three';
import { buildRoom, SPEC, N_GLYPH, drawNPlate } from './room.js';

const W = 4096, H = 2048, FACE = 2048;
const RECV = 'http://127.0.0.1:8791/save';
const params = new URLSearchParams(location.search);
const out = (window.__bake = { done: false, error: null, log: [] });
const logEl = document.getElementById('log');
const log = (...a) => { const s = a.join(' '); out.log.push(s); logEl.textContent += s + '\n'; };
const ms = (t) => +(performance.now() - t).toFixed(1);
const deg = (r) => (r * 180) / Math.PI;

const EQ_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const EQ_FRAG = `
uniform samplerCube tCube; uniform vec3 uFlip; uniform float uYaw; varying vec2 vUv;
void main(){
  float lon = (vUv.x - 0.5) * 6.28318530718 + uYaw;
  float lat = (0.5 - (1.0 - vUv.y)) * 3.14159265359;
  vec3 d = vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat)) * uFlip;
  gl_FragColor = vec4(textureCube(tCube, d).rgb, 1.0);
  #ifndef RAW_OUT
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #endif
}`;
function eqMaterial(cubeTex, raw) {
  return new THREE.ShaderMaterial({ vertexShader: EQ_VERT, fragmentShader: EQ_FRAG, defines: raw ? { RAW_OUT: 1 } : {}, uniforms: { tCube: { value: cubeTex }, uFlip: { value: new THREE.Vector3(1, 1, 1) }, uYaw: { value: 0 } }, depthTest: false, depthWrite: false, toneMapped: !raw });
}

function dirToPixel(d) { const l = d.length(); const lon = Math.atan2(d.x, -d.z), lat = Math.asin(d.y / l); return [(lon / (2 * Math.PI) + 0.5) * W, (0.5 - lat / Math.PI) * H]; }
function pixelDir(x, y) { const lon = ((x + 0.5) / W - 0.5) * 2 * Math.PI, lat = (0.5 - (y + 0.5) / H) * Math.PI; return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), -Math.cos(lon) * Math.cos(lat)); }
const angleDeg = (a, b) => deg(Math.acos(Math.min(1, Math.max(-1, a.clone().normalize().dot(b.clone().normalize())))));

function colourCentroid(img, test) {
  const d = img.data; let sx = 0, sy = 0, sz = 0, n = 0;
  for (let y = 0; y < H; y++) {
    const w = Math.cos((0.5 - (y + 0.5) / H) * Math.PI);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (test(d[i], d[i + 1], d[i + 2])) { const v = pixelDir(x, y); sx += v.x * w; sy += v.y * w; sz += v.z * w; n++; }
    }
  }
  return { count: n, dir: n ? new THREE.Vector3(sx, sy, sz).normalize() : null };
}
function lumAt(img, x, y) {
  let s = 0, c = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = (Math.round(x) + dx + W) % W, yy = Math.min(H - 1, Math.max(0, Math.round(y) + dy)); const i = (yy * W + xx) * 4;
    s += 0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2]; c++;
  }
  return s / c;
}
function pearson(a, b) {
  const n = a.length; const ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
  let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
  return sab / Math.sqrt(saa * sbb || 1);
}

function handednessGate(img, eye, T) {
  const checks = [];
  // 1. east marker: red cube at +X must land at yaw +90 (east), not -90
  const red = colourCentroid(img, (r, g, b) => r > 170 && g < 70 && b < 70);
  const expRed = T.redCube.clone().sub(eye);
  const eRed = red.dir ? angleDeg(red.dir, expRed) : 999;
  checks.push({ name: 'red cube (east, +X) at expected direction', pass: red.count > 150 && eRed < 2.0, measured: { pixels: red.count, errDeg: +eRed.toFixed(2), yawDeg: red.dir ? +deg(Math.atan2(red.dir.x, -red.dir.z)).toFixed(2) : null, pitchDeg: red.dir ? +deg(Math.asin(red.dir.y)).toFixed(2) : null }, expected: { yawDeg: +deg(Math.atan2(expRed.x, -expRed.z)).toFixed(2), pitchDeg: +deg(Math.asin(expRed.y / expRed.length())).toFixed(2) } });
  // 2. up marker: yellow lamp on the ceiling must land at expected (catches vertical flip)
  const yel = colourCentroid(img, (r, g, b) => r > 200 && g > 200 && b < 80);
  const expY = T.lamp.clone().sub(eye);
  const eY = yel.dir ? angleDeg(yel.dir, expY) : 999;
  checks.push({ name: 'yellow ceiling lamp (up) at expected direction', pass: yel.count > 150 && eY < 2.0, measured: { pixels: yel.count, errDeg: +eY.toFixed(2), yawDeg: yel.dir ? +deg(Math.atan2(yel.dir.x, -yel.dir.z)).toFixed(2) : null, pitchDeg: yel.dir ? +deg(Math.asin(yel.dir.y)).toFixed(2) : null }, expected: { yawDeg: +deg(Math.atan2(expY.x, -expY.z)).toFixed(2), pitchDeg: +deg(Math.asin(expY.y / expY.length())).toFixed(2) } });
  // 3. "N" on the north wall reads as N (not mirrored, not flipped)
  const cw = N_GLYPH.w * N_GLYPH.cell + 2 * N_GLYPH.margin, ch = N_GLYPH.h * N_GLYPH.cell + 2 * N_GLYPH.margin;
  const tc = document.createElement('canvas'); tc.width = cw; tc.height = ch; const tctx = tc.getContext('2d'); drawNPlate(tctx, cw, ch);
  const tex = tctx.getImageData(0, 0, cw, ch).data;
  const cols = 30, rows = 42, meas = [], expN = [], expM = [], expV = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const u = (c + 0.5) / cols, v = (r + 0.5) / rows;
    const P = new THREE.Vector3(T.nPlate.center.x + (u - 0.5) * T.nPlate.w, T.nPlate.center.y + (0.5 - v) * T.nPlate.h, T.nPlate.center.z);
    const [px, py] = dirToPixel(P.clone().sub(eye));
    meas.push(lumAt(img, px, py));
    const lum = (uu, vv) => { const i = (Math.min(ch - 1, Math.floor(vv * ch)) * cw + Math.min(cw - 1, Math.floor(uu * cw))) * 4; return 0.2126 * tex[i] + 0.7152 * tex[i + 1] + 0.0722 * tex[i + 2]; };
    expN.push(lum(u, v)); expM.push(lum(1 - u, v)); expV.push(lum(u, 1 - v));
  }
  const rN = pearson(meas, expN), rM = pearson(meas, expM), rV = pearson(meas, expV);
  // N mirrored left-right equals N flipped top-bottom, so test the cells that differ: the diagonal triangles where N is bright and mirror-N is dark (A) and the reverse (B).
  let sa = 0, na = 0, sb = 0, nb = 0, lo = Infinity, hi = -Infinity;
  meas.forEach((m, i) => { lo = Math.min(lo, m); hi = Math.max(hi, m); const d = expN[i] - expM[i]; if (d > 100) { sa += m; na++; } else if (d < -100) { sb += m; nb++; } });
  const sel = na && nb ? (sa / na - sb / nb) / (hi - lo || 1) : 0;
  checks.push({ name: 'N glyph on north wall reads un-mirrored, upright', pass: rN >= 0.8 && sel >= 0.4, measured: { rNormal: +rN.toFixed(3), rMirrored: +rM.toFixed(3), rFlippedV: +rV.toFixed(3), diagonalContrast: +sel.toFixed(3), cellsA: na, cellsB: nb } });
  return { pass: checks.every((c) => c.pass), checks };
}

async function postFile(dest, name, blob) {
  const r = await fetch(`${RECV}?dest=${dest}&name=${name}`, { method: 'POST', body: blob });
  if (!r.ok) throw new Error('save failed ' + name + ' ' + r.status);
  return r.text();
}
const toBlob = (canvas, type, q) => new Promise((res) => canvas.toBlob(res, type, q));

async function main() {
  const T = {};
  const tStart = performance.now();
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; // r186 removed PCFSoftShadowMap (it logs a warning and falls back to this)
  renderer.toneMapping = THREE.NeutralToneMapping;
  const gl = renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  out.gpu = { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a', version: gl.getParameter(gl.VERSION), maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE), maxCube: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE), drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight] };
  log('GPU', JSON.stringify(out.gpu));
  log('three', THREE.REVISION);

  const room = await buildRoom(log);
  T.procedural = +room.timings.proceduralMs.toFixed(1); T.propsNetwork = +room.timings.propsNetworkMs.toFixed(1);
  room.buildEnv(renderer);
  log('built: procedural', T.procedural, 'ms; props network', T.propsNetwork, 'ms; props', JSON.stringify(room.propInfo));

  // cube bake (cold then warm)
  const rt = new THREE.WebGLCubeRenderTarget(FACE, { type: THREE.HalfFloatType, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const cc = new THREE.CubeCamera(0.1, 100, rt); cc.position.copy(room.eye); room.scene.add(cc);
  let t = performance.now(); cc.update(renderer, room.scene); gl.finish(); T.cubeCold = ms(t);
  t = performance.now(); cc.update(renderer, room.scene); gl.finish(); T.cubeWarm = ms(t);
  log('cube bake cold', T.cubeCold, 'ms, warm', T.cubeWarm, 'ms');

  // equirect pass
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), eqMaterial(rt.texture, false));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const qs = new THREE.Scene(); qs.add(quad);
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const ctx = c2.getContext('2d', { willReadFrequently: true });
  const equirect = (flip, yaw) => { quad.material.uniforms.uFlip.value.set(...flip); quad.material.uniforms.uYaw.value = yaw || 0; renderer.setRenderTarget(null); renderer.render(qs, cam); gl.finish(); ctx.drawImage(canvas, 0, 0); };
  t = performance.now(); equirect([1, 1, 1]); T.equirectCold = ms(t);
  t = performance.now(); equirect([1, 1, 1]); T.equirectWarm = ms(t);
  t = performance.now(); const img = ctx.getImageData(0, 0, W, H); T.readback = ms(t);
  log('equirect cold', T.equirectCold, 'warm', T.equirectWarm, 'readback', T.readback);
  T.bakeWarmTotal = +(T.cubeWarm + T.equirectWarm + T.readback).toFixed(1);

  // handedness gate: the real bake, then negative controls through the same code path
  t = performance.now();
  const gate = handednessGate(img, room.eye, room.targets); T.gateMs = ms(t);
  out.gate = gate; log('handedness gate (real bake):', gate.pass ? 'PASS' : 'FAIL', JSON.stringify(gate.checks.map((c) => c.measured)));
  const keep = ctx.getImageData(0, 0, W, H);
  const thumbs = [];
  const thumb = (label, g) => { const t = document.createElement('canvas'); t.width = 768; t.height = 384; t.getContext('2d').drawImage(c2, 0, 0, 768, 384); thumbs.push({ label, t, pass: g.pass, vals: g.checks.map((c) => c.measured) }); };
  thumb('real bake (no flip)', gate);
  const controls = {};
  for (const [name, flip, yaw] of [['mirrorX', [-1, 1, 1], 0], ['flipY', [1, -1, 1], 0], ['yawPlus90', [1, 1, 1], Math.PI / 2]]) {
    equirect(flip, yaw); const g = handednessGate(ctx.getImageData(0, 0, W, H), room.eye, room.targets); thumb('negative control: ' + name, g);
    controls[name] = { gatePass: g.pass, failedChecks: g.checks.filter((c) => !c.pass).map((c) => c.name), n: g.checks.map((c) => c.measured) };
    log('negative control', name, '-> gate', g.pass ? 'PASS (BAD: gate did not catch it)' : 'FAIL (good: caught)', JSON.stringify(controls[name].failedChecks));
  }
  out.controls = controls;
  equirect([1, 1, 1]);
  ctx.putImageData(keep, 0, 0);

  // object-ID pass: every hotspot's derived yaw/pitch must land on its own object
  const ids = Object.keys(room.groups); const idIndex = {}; ids.forEach((id, i) => { idIndex[id] = i + 1; });
  const saved = []; const mats = {};
  const ownerId = (o) => { let p = o; while (p) { if (p.userData && p.userData.id && room.groups[p.userData.id] === p) return p.userData.id; p = p.parent; } return null; };
  room.scene.traverse((o) => { if (o.isMesh) { const id = ownerId(o); if (!id) return; saved.push([o, o.material]); mats[id] = mats[id] || new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB((idIndex[id] * 10) / 255, 0, 0, THREE.LinearSRGBColorSpace), side: THREE.DoubleSide }); o.material = mats[id]; } });
  const bg = room.scene.background, env = room.scene.environment; room.scene.background = new THREE.Color(0, 0, 0); room.scene.environment = null;
  const rtId = new THREE.WebGLCubeRenderTarget(1024, { type: THREE.UnsignedByteType, generateMipmaps: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const ccId = new THREE.CubeCamera(0.1, 100, rtId); ccId.position.copy(room.eye); room.scene.add(ccId);
  t = performance.now(); ccId.update(renderer, room.scene); gl.finish();
  quad.material = eqMaterial(rtId.texture, true); equirect([1, 1, 1]); const idImg = ctx.getImageData(0, 0, W, H); T.idPass = ms(t);
  room.scene.remove(ccId); rtId.dispose();
  for (const [o, m] of saved) o.material = m;
  room.scene.background = bg; room.scene.environment = env;
  const idInv = {}; for (const [k, v] of Object.entries(idIndex)) idInv[v * 10] = k;
  room.hotspots.forEach((h) => { h.worldResolved = new THREE.Vector3(...h.worldResolved.toArray().map((v) => +v.toFixed(3))); }); // store millimetres; derive angles from the STORED anchor so they can be recomputed exactly
  const hot = room.hotspots.map((h) => {
    const dir = h.worldResolved.clone().sub(room.eye);
    const yaw = deg(Math.atan2(dir.x, -dir.z)), pitch = deg(Math.asin(dir.y / dir.length()));
    const [px, py] = dirToPixel(dir); const i = (Math.min(H - 1, Math.round(py)) * W + (Math.round(px) % W)) * 4;
    const got = idInv[Math.round(idImg.data[i] / 10) * 10] || ('unknown:' + idImg.data[i]);
    return { id: h.id, expect: h.expect, got, pass: got === h.expect, yawDeg: +yaw.toFixed(2), pitchDeg: +pitch.toFixed(2), distanceM: +dir.length().toFixed(2), px: Math.round(px), py: Math.round(py) };
  });
  out.idPass = hot; log('ID pass', JSON.stringify(hot.map((h) => [h.id, h.expect, h.got, h.pass])));

  // memory estimate
  const seen = new Set(); let texBytes = 0, texCount = 0; const texList = [];
  room.scene.traverse((o) => { if (!o.material) return; for (const m of [].concat(o.material)) for (const k of Object.keys(m)) { const v = m[k]; if (v && v.isTexture && !seen.has(v)) { seen.add(v); const im = v.image; if (im && (im.width || im.videoWidth)) { const b = im.width * im.height * 4 * (v.generateMipmaps ? 4 / 3 : 1); texBytes += b; texCount++; texList.push([k, im.width + 'x' + im.height, Math.round(b / 1024)]); } } } });
  out.memory = {
    sceneTexturesMiB: +(texBytes / 1048576).toFixed(1), sceneTextureCount: texCount,
    cubeRtMiB: +((6 * FACE * FACE * 8) / 1048576).toFixed(1),
    equirectDrawingBufferMiB: +((W * H * 4) / 1048576).toFixed(1),
    viewerEquirectRGBA8MiB: +((W * H * 4) / 1048576).toFixed(1),
    viewerEquirectWithMipsMiB: +((W * H * 4 * 4 / 3) / 1048576).toFixed(1),
    previewRGBA8MiB: +((1024 * 512 * 4) / 1048576).toFixed(2),
    rendererInfo: { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }
  };
  log('memory', JSON.stringify(out.memory));

  // beauty image: re-render beauty equirect (cube RT currently holds ID pass) -> redo cube beauty
  quad.material = eqMaterial(rt.texture, false);
  equirect([1, 1, 1]);
  const finalImg = ctx.getImageData(0, 0, W, H);
  const gate2 = handednessGate(finalImg, room.eye, room.targets);
  out.gateFinal = gate2.pass; log('final image gate re-check:', gate2.pass ? 'PASS' : 'FAIL');

  // handedness gate figure: expected positions ringed on every panel
  const fig = document.createElement('canvas'); fig.width = 1536; fig.height = 2 * (384 + 54); const fx = fig.getContext('2d');
  fx.fillStyle = '#fbfaf6'; fx.fillRect(0, 0, fig.width, fig.height); fx.font = '15px Helvetica, Arial, sans-serif'; fx.textBaseline = 'top';
  const px2 = (v) => { const [x, y] = dirToPixel(v.clone().sub(room.eye)); return [x * 0.1875, y * 0.1875]; };
  thumbs.forEach((tb, i) => {
    const ox = (i % 2) * 768, oy = Math.floor(i / 2) * (384 + 54);
    fx.drawImage(tb.t, ox, oy + 54);
    fx.fillStyle = tb.pass ? '#0a5c1f' : '#a31212'; fx.font = 'bold 16px Helvetica, Arial, sans-serif';
    fx.fillText(`${tb.label}: gate ${tb.pass ? 'PASS' : 'FAIL'}`, ox + 8, oy + 6);
    fx.fillStyle = '#1a1a17'; fx.font = '13px Helvetica, Arial, sans-serif';
    const m = tb.vals; fx.fillText(`red cube err ${m[0].errDeg} deg, lamp err ${m[1].errDeg} deg, N contrast ${m[2].diagonalContrast} (need >= 0.4)`, ox + 8, oy + 30);
    fx.lineWidth = 2; fx.strokeStyle = '#00b7ff';
    for (const v of [room.targets.redCube, room.targets.lamp]) { const [x, y] = px2(v); fx.beginPath(); fx.arc(ox + x, oy + 54 + y, 14, 0, Math.PI * 2); fx.stroke(); }
    const [nx, ny] = px2(room.targets.nPlate.center); fx.strokeRect(ox + nx - 12, oy + 54 + ny - 16, 24, 32);
  });
  const figBlob = await toBlob(fig, 'image/webp', 0.85); out.handednessFigKB = +(figBlob.size / 1024).toFixed(1);

  // encode + sizes
  const sizes = {}; const enc = {};
  for (const q of [0.6, 0.7, 0.8, 0.9]) {
    t = performance.now(); const bw = await toBlob(c2, 'image/webp', q); const tw = ms(t);
    t = performance.now(); const bj = await toBlob(c2, 'image/jpeg', q); const tj = ms(t);
    sizes['q' + q] = { webpKB: +(bw.size / 1024).toFixed(1), jpegKB: +(bj.size / 1024).toFixed(1), webpMs: tw, jpegMs: tj };
    if (q === 0.8) { enc.webp = bw; enc.jpeg = bj; }
  }
  out.sizes = sizes; log('sizes', JSON.stringify(sizes));
  // preview 1024x512
  const pc = document.createElement('canvas'); pc.width = 1024; pc.height = 512; const pctx = pc.getContext('2d'); pctx.imageSmoothingQuality = 'high'; pctx.drawImage(c2, 0, 0, 1024, 512);
  const prev = await toBlob(pc, 'image/webp', 0.8); out.previewWebpKB = +(prev.size / 1024).toFixed(1); log('preview 1024x512 webp q0.8 KB', out.previewWebpKB);

  // descriptor
  const f = (v) => +v.toFixed(2);
  const descriptor = {
    schema: 'ihh-scene/1', id: SPEC.id, title: SPEC.title,
    evidence: SPEC.evidence,
    render: {
      mode: 'baked-equirect',
      pano: { src: 'pano/room-4096.webp', preview: 'pano/room-1024.webp', w: W, h: H, projection: 'equirectangular', yawOffsetDeg: 0, convention: 'yaw 0 = image centre = north (-Z); yaw +90 deg = east (+X); pitch +90 = up' },
      builder: { kit: 's1-gym-v0', seed: 7, eye: SPEC.camera.eye, engine: 'three@0.186.1 (r' + THREE.REVISION + ')', toneMapping: 'NeutralToneMapping', cubeFacePx: FACE, bakedAt: new Date().toISOString() }
    },
    stops: [{ id: 's0', yawDeg: 0, pitchDeg: 0, fovDeg: 80, label: 'Facing north' }],
    hotspots: room.hotspots.map((h, i) => ({ id: h.id, order: h.order, label: h.label, description: h.description, anchor: { world: h.worldResolved.toArray(), source: h.anchor.object ? { object: h.anchor.object } : { world: true } }, derived: { yawDeg: hot[i].yawDeg, pitchDeg: hot[i].pitchDeg, distanceM: hot[i].distanceM }, expectObject: h.expect, fact_ids: [], artifact_id: null, content_status: 'placeholder' })),
    assets: room.assets.map((a) => ({ id: a.id, provider: a.provider, licence: a.licence, pageUrl: a.pageUrl, resolution: a.resolution, declaredBytes: a.declaredBytes, role: a.role })),
    a11y: {
      alt: 'Illustrative reconstruction (spike): a generic gymnasium-like room seen from its centre, with a wooden floor, a raised running-track balcony, two basket-and-post stations at the north and south ends, tall windows, and chalkboards.',
      longDescription: 'The room is a generic stand-in. A wooden floor with painted court lines fills the centre. A raised balcony with a wooden rail and balusters runs around all four sides. At the north end a wicker basket is fixed to a post; at the south end a hoop with a net is fixed to a second post. A standing chalkboard sits on the north-east side. Tall windows line the east and west walls above the balcony. A small calibration panel (the letter N), a red cube and a yellow disc are test markers used to check the image is not mirrored; they are not part of any real room.'
    },
    budgets: { panoKB: 1500, textureMax: 4096 },
    gates: { handedness: { pass: gate.pass, checks: gate.checks.map((c) => ({ name: c.name, pass: c.pass })) }, objectId: hot.map((h) => ({ hotspot: h.id, expect: h.expect, got: h.got, pass: h.pass })) }
  };
  out.descriptor = descriptor;

  T.total = ms(tStart); out.timings = T;
  const allPass = gate.pass && gate2.pass && hot.every((h) => h.pass) && Object.values(controls).every((c) => !c.gatePass);
  out.allGatesOk = allPass; log('TIMINGS', JSON.stringify(T)); log('ALL GATES OK:', allPass);

  if ((params.get('save') === '1' && allPass) || params.get('save') === 'force') {
    log(await postFile('pano', 'room-4096.webp', enc.webp));
    log(await postFile('docs', 's1-room-equirect.webp', enc.webp));
    log(await postFile('docs', 's1-handedness-gate.webp', figBlob));
    log(await postFile('pano', 'room-1024.webp', prev));
    log(await postFile('root', 'scene.json', new Blob([JSON.stringify(descriptor, null, 2)], { type: 'application/json' })));
    const report = { gpu: out.gpu, timings: T, sizes, previewWebpKB: out.previewWebpKB, memory: out.memory, gate: out.gate, controls, idPass: hot, props: room.propInfo, assets: room.assets, resources: performance.getEntriesByType('resource').map((r) => [r.name.replace(/^https:\/\//, ''), Math.round(r.transferSize / 1024), Math.round(r.duration)]) };
    log(await postFile('root', 'bake-report.json', new Blob([JSON.stringify(report, null, 1)], { type: 'application/json' })));
  }
  // show result on page
  const pv = document.getElementById('preview'); pv.src = URL.createObjectURL(prev); pv.hidden = false;
  window.__room = { renderer, room, rt, cc, quad, qs, cam, ctx, c2, equirect };
  out.done = true;
}
main().catch((e) => { out.error = String(e && e.stack || e); log('ERROR', out.error); out.done = true; });
