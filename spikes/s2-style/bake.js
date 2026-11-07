// S2 spike: bake one room in several styles. Same cube capture feeds a 4096x2048 equirect and a 1280x720 flat preview.
// Pipeline: cube capture (HalfFloat, alpha = record-layer mask) -> accumulate K samples into float targets -> resolve (tone, grade, mask) -> 8-bit readback -> WebP.
import * as THREE from 'three';
import { resolveStyle } from './tokens.js';
import { buildRoom, setDomeSample, N_GLYPH, drawNPlate } from './room.js';
import * as A from './analysis.js';

const W = 4096, H = 2048, FW = 1280, FH = 720, FACE = 2048;
const FLAT = { yawDeg: 6, pitchDeg: 3, hfovDeg: 96 };
const ZOOM = { yawDeg: -24, pitchDeg: -2, hfovDeg: 40 };
const RECV = 'http://127.0.0.1:8792/save';
const params = new URLSearchParams(location.search);
const out = (window.__bake = { results: {}, log: [], done: false, error: null, canvases: {} });
const logEl = document.getElementById('log');
const log = (...a) => { const s = a.join(' '); out.log.push(s); logEl.textContent += s + '\n'; };
const ms = (t) => +(performance.now() - t).toFixed(1);
const toBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));
const KiB = (b) => +(b.size / 1024).toFixed(1);

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const ACC_FRAG = `
uniform samplerCube tCube; uniform float uWeight; uniform vec3 uFlip; uniform mat3 uCamRot; uniform mat3 uCubeRot; uniform vec2 uTanHalf; varying vec2 vUv;
vec3 dirEqui(vec2 uv){ float lon = (uv.x - 0.5) * 6.28318530718; float lat = (0.5 - uv.y) * 3.14159265359; return vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat)); }
vec3 dirFlat(vec2 uv){ vec2 n = vec2(uv.x - 0.5, 0.5 - uv.y) * 2.0 * uTanHalf; return uCamRot * normalize(vec3(n.x, n.y, -1.0)); }
void main(){
  #ifdef FLAT
    vec3 d = dirFlat(vUv);
  #else
    vec3 d = dirEqui(vUv);
  #endif
  gl_FragColor = textureCube(tCube, uCubeRot * (d * uFlip)) * uWeight;
}`;
const RES_FRAG = `
uniform sampler2D tAcc; uniform float uTone; uniform float uPost; uniform vec3 uInk; uniform vec3 uPaper; uniform float uLevels; uniform float uBayer; uniform float uCell; uniform float uContrast; uniform float uBias; varying vec2 vUv;
vec3 neutral(vec3 color){
  const float startCompression = 0.8 - 0.04; const float desaturation = 0.15;
  float x = min(color.r, min(color.g, color.b)); float offset = x < 0.08 ? x - 6.25 * x * x : 0.04; color -= offset;
  float peak = max(color.r, max(color.g, color.b)); if (peak < startCompression) return color;
  float d = 1.0 - startCompression; float newPeak = 1.0 - d * d / (peak + d - startCompression); color *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0); return mix(color, vec3(newPeak), g);
}
vec3 oetf(vec3 c){ c = clamp(c, 0.0, 1.0); return mix(pow(c, vec3(1.0 / 2.4)) * 1.055 - 0.055, c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }
float bayer8(ivec2 p){ int x = p.x & 7, y = p.y & 7; int a = x ^ y; int idx = ((a & 1) << 5) | ((y & 1) << 4) | ((a & 2) << 2) | ((y & 2) << 1) | ((a & 4) >> 1) | ((y & 4) >> 2); return (float(idx) + 0.5) / 64.0; }
float bayer4(ivec2 p){ int x = p.x & 3, y = p.y & 3; int a = x ^ y; int idx = ((a & 1) << 3) | ((y & 1) << 2) | ((a & 2) >> 0) | ((y & 2) >> 1); return (float(idx) + 0.5) / 16.0; }
void main(){
  vec4 acc = texture2D(tAcc, vUv);
  float rec = clamp(1.0 - acc.a, 0.0, 1.0);
  vec3 c = max(acc.rgb, 0.0);
  vec3 recRgb = oetf(c);
  vec3 built = oetf(uTone > 0.5 ? neutral(c) : c);
  if (uPost > 0.5) {
    float luma = dot(built, vec3(0.2126, 0.7152, 0.0722));
    luma = clamp((luma - 0.5) * uContrast + 0.5 + uBias, 0.0, 1.0);
    ivec2 p = ivec2(floor(gl_FragCoord.xy / uCell));
    float thr = uBayer > 4.5 ? bayer8(p) : bayer4(p);
    float v = luma * (uLevels - 1.0); float lo = floor(v); float stp = lo + ((v - lo) > thr ? 1.0 : 0.0);
    built = mix(uInk, uPaper, stp / (uLevels - 1.0));
  }
  gl_FragColor = vec4(mix(built, recRgb, rec), 1.0);
}`;


const EDGE_FRAG = `
uniform samplerCube tCube; uniform float uWeight; uniform vec3 uFlip; uniform mat3 uCubeRot; uniform float uEdgeClamp; uniform float uEdgeStep; uniform float uEdgeThr; uniform vec3 uEdgeInk; varying vec2 vUv;
vec3 dirEqui(vec2 uv){ float lon = (uv.x - 0.5) * 6.28318530718; float lat = (0.5 - uv.y) * 3.14159265359; return vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat)); }
void faceOf(vec3 d, out int f, out vec2 st){
  vec3 a = abs(d);
  if (a.x >= a.y && a.x >= a.z) { if (d.x > 0.0) { f = 0; st = vec2(-d.z, -d.y) / a.x; } else { f = 1; st = vec2(d.z, -d.y) / a.x; } }
  else if (a.y >= a.z) { if (d.y > 0.0) { f = 2; st = vec2(d.x, d.z) / a.y; } else { f = 3; st = vec2(d.x, -d.z) / a.y; } }
  else { if (d.z > 0.0) { f = 4; st = vec2(d.x, -d.y) / a.z; } else { f = 5; st = vec2(-d.x, -d.y) / a.z; } }
}
vec3 faceDir(int f, vec2 s){
  if (f == 0) return vec3(1.0, -s.y, -s.x);
  if (f == 1) return vec3(-1.0, -s.y, s.x);
  if (f == 2) return vec3(s.x, 1.0, s.y);
  if (f == 3) return vec3(s.x, -1.0, -s.y);
  if (f == 4) return vec3(s.x, -s.y, 1.0);
  return vec3(-s.x, -s.y, -1.0);
}
float lumAt(int f, vec2 s){ if (uEdgeClamp > 0.5) s = clamp(s, -1.0, 1.0); vec3 c = textureCube(tCube, faceDir(f, s) * uFlip).rgb; return sqrt(max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 0.0)); }
void main(){
  vec3 d = uCubeRot * dirEqui(vUv); vec4 base = textureCube(tCube, d * uFlip);
  int f; vec2 st; faceOf(d, f, st); float h = uEdgeStep * 2.0 / 2048.0;
  float l00 = lumAt(f, st + h * vec2(-1.0, -1.0)), l10 = lumAt(f, st + h * vec2(0.0, -1.0)), l20 = lumAt(f, st + h * vec2(1.0, -1.0));
  float l01 = lumAt(f, st + h * vec2(-1.0, 0.0)), l21 = lumAt(f, st + h * vec2(1.0, 0.0));
  float l02 = lumAt(f, st + h * vec2(-1.0, 1.0)), l12 = lumAt(f, st + h * vec2(0.0, 1.0)), l22 = lumAt(f, st + h * vec2(1.0, 1.0));
  float gx = (l20 + 2.0 * l21 + l22) - (l00 + 2.0 * l01 + l02); float gy = (l02 + 2.0 * l12 + l22) - (l00 + 2.0 * l10 + l20);
  float e = smoothstep(uEdgeThr, uEdgeThr * 1.6, length(vec2(gx, gy)));
  gl_FragColor = vec4(mix(base.rgb, uEdgeInk, e * base.a), base.a) * uWeight;
}`;

const VIEW_FRAG = `uniform sampler2D tEq; uniform mat3 uCamRot; uniform vec2 uTanHalf; varying vec2 vUv;
void main(){ vec2 n = vec2(vUv.x - 0.5, 0.5 - vUv.y) * 2.0 * uTanHalf; vec3 d = uCamRot * normalize(vec3(n.x, n.y, -1.0));
  float lon = atan(d.x, -d.z); float lat = asin(clamp(d.y, -1.0, 1.0)); gl_FragColor = vec4(texture2D(tEq, vec2(lon / 6.28318530718 + 0.5, 0.5 - lat / 3.14159265359)).rgb, 1.0); }`;
const canvas = document.createElement('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(64, 64, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const gl = renderer.getContext();
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
out.gpu = { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'n/a', version: gl.getParameter(gl.VERSION), maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) };
const quadGeo = new THREE.PlaneGeometry(2, 2); const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const qScene = new THREE.Scene(); const quad = new THREE.Mesh(quadGeo, null); qScene.add(quad); quad.frustumCulled = false;
const rtOpts = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
const accMat = (flat) => new THREE.ShaderMaterial({ defines: flat ? { FLAT: 1 } : {}, uniforms: { tCube: { value: null }, uWeight: { value: 1 }, uFlip: { value: new THREE.Vector3(1, 1, 1) }, uCamRot: { value: new THREE.Matrix3() }, uCubeRot: { value: new THREE.Matrix3() }, uTanHalf: { value: new THREE.Vector2() } }, vertexShader: VERT, fragmentShader: ACC_FRAG, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
const resMat = new THREE.ShaderMaterial({ uniforms: { tAcc: { value: null }, uTone: { value: 0 }, uPost: { value: 0 }, uInk: { value: new THREE.Vector3() }, uPaper: { value: new THREE.Vector3() }, uLevels: { value: 4 }, uBayer: { value: 8 }, uCell: { value: 2 }, uContrast: { value: 1 }, uBias: { value: 0 } }, vertexShader: VERT, fragmentShader: RES_FRAG, depthTest: false, depthWrite: false });
const matE = accMat(false), matF = accMat(true), matZ = accMat(true);
const matEdge = new THREE.ShaderMaterial({ uniforms: { tCube: { value: null }, uWeight: { value: 1 }, uFlip: { value: new THREE.Vector3(1, 1, 1) }, uCubeRot: { value: new THREE.Matrix3() }, uEdgeClamp: { value: 1 }, uEdgeStep: { value: 3 }, uEdgeThr: { value: 0.12 }, uEdgeInk: { value: new THREE.Color('#1b1612') } }, vertexShader: VERT, fragmentShader: EDGE_FRAG, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor });
const faceMap = A.faceMap(W, H);
const viewMat = new THREE.ShaderMaterial({ uniforms: { tEq: { value: null }, uCamRot: { value: new THREE.Matrix3() }, uTanHalf: { value: new THREE.Vector2() } }, vertexShader: VERT, fragmentShader: VIEW_FRAG, depthTest: false, depthWrite: false });
// what a sphere viewer (bilinear, no mipmaps) shows from a baked equirect: render the equirect texture through a perspective camera into 8-bit
function viewFromEquirect(tex, v) {
  const rt = new THREE.WebGLRenderTarget(FW, FH, { type: THREE.UnsignedByteType, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  viewMat.uniforms.tEq.value = tex; viewMat.uniforms.uCamRot.value.copy(camRot(v)); viewMat.uniforms.uTanHalf.value.set(tanH(v), tanV(v)); quad.material = viewMat;
  renderer.setRenderTarget(rt); renderer.render(qScene, ortho); gl.finish(); const buf = new Uint8Array(FW * FH * 4); renderer.readRenderTargetPixels(rt, 0, 0, FW, FH, buf); renderer.setRenderTarget(null); rt.dispose(); return buf;
}
const eqTexture = (src) => { const t = src instanceof Uint8Array ? new THREE.DataTexture(src, W, H, THREE.RGBAFormat, THREE.UnsignedByteType) : new THREE.Texture(src); t.flipY = false; t.generateMipmaps = false; t.minFilter = t.magFilter = THREE.LinearFilter; t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; return t; };

const hex01 = (h) => new THREE.Vector3(...A.hexRGB(h).map((v) => v / 255));
function camRot(v = FLAT) {
  const cam = new THREE.PerspectiveCamera(); cam.rotation.order = 'YXZ'; cam.rotation.set((v.pitchDeg * Math.PI) / 180, (-v.yawDeg * Math.PI) / 180, 0); cam.updateMatrixWorld(true);
  return new THREE.Matrix3().setFromMatrix4(cam.matrixWorld);
}
const tanH = (v) => Math.tan((v.hfovDeg * Math.PI) / 360), tanV = (v) => tanH(v) * (FH / FW);
const tanHalfV = tanV(FLAT), tanHalfH = tanH(FLAT);
function projectFlat(dir) { // world direction -> flat pixel
  const R = camRot().invert(); const v = dir.clone().normalize().applyMatrix3(R);
  return [((v.x / -v.z / tanHalfH) * 0.5 + 0.5) * FW, (0.5 - (v.y / -v.z / tanHalfV) * 0.5) * FH];
}
function accumulate(rt, mat, w) { const ac = renderer.autoClear; renderer.autoClear = false; mat.uniforms.uWeight.value = w; quad.material = mat; renderer.setRenderTarget(rt); renderer.render(qScene, ortho); renderer.autoClear = ac; }
function resolve(acc, w, h, S, cell) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.UnsignedByteType, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  const u = resMat.uniforms; u.tAcc.value = acc.texture; u.uTone.value = S.lighting.tone === 'neutral' ? 1 : 0;
  const P = S.post; u.uPost.value = P.mode === 'dither' ? 1 : 0; u.uInk.value = hex01(P.ink); u.uPaper.value = hex01(P.paper);
  u.uLevels.value = Math.max(2, P.levels); u.uBayer.value = P.bayer || 8; u.uCell.value = cell || P.cell || 1; u.uContrast.value = P.contrast; u.uBias.value = P.bias;
  quad.material = resMat; renderer.setRenderTarget(rt); renderer.render(qScene, ortho); gl.finish();
  const buf = new Uint8Array(w * h * 4); renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf); renderer.setRenderTarget(null); rt.dispose();
  return buf;
}
function toCanvas(buf, w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(buf.buffer), w, h), 0, 0); return c; }
async function post(dest, name, blob) {
  const r = await fetch(`${RECV}?dest=${dest}&name=${name}`, { method: 'POST', body: blob }); if (!r.ok) throw new Error('save failed ' + name + ' ' + r.status); return r.text();
}

function handednessGate(rgba, room) {
  const eye = room.eye, Tg = room.targets; const deg = (r) => (r * 180) / Math.PI;
  const pixelDir = (x, y) => { const lon = ((x + 0.5) / W - 0.5) * 2 * Math.PI, lat = (0.5 - (y + 0.5) / H) * Math.PI; return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), -Math.cos(lon) * Math.cos(lat)); };
  const dirToPixel = (d) => { const l = d.length(); const lon = Math.atan2(d.x, -d.z), lat = Math.asin(d.y / l); return [(lon / (2 * Math.PI) + 0.5) * W, (0.5 - lat / Math.PI) * H]; };
  const ang = (a, b) => deg(Math.acos(Math.min(1, Math.max(-1, a.clone().normalize().dot(b.clone().normalize())))));
  const centroid = (test) => { let sx = 0, sy = 0, sz = 0, n = 0; for (let y = 0; y < H; y++) { const w = Math.cos((0.5 - (y + 0.5) / H) * Math.PI); for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (test(rgba[i], rgba[i + 1], rgba[i + 2])) { const v = pixelDir(x, y); sx += v.x * w; sy += v.y * w; sz += v.z * w; n++; } } } return { n, dir: n ? new THREE.Vector3(sx, sy, sz).normalize() : null }; };
  const red = centroid((r, g, b) => r > 170 && g < 70 && b < 70), yel = centroid((r, g, b) => r > 200 && g > 200 && b < 80);
  const eR = red.dir ? ang(red.dir, Tg.redCube.clone().sub(eye)) : 999, eY = yel.dir ? ang(yel.dir, Tg.lamp.clone().sub(eye)) : 999;
  const lum = (x, y) => { let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = (Math.round(x) + dx + W) % W, yy = Math.min(H - 1, Math.max(0, Math.round(y) + dy)); const i = (yy * W + xx) * 4; s += 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]; } return s / 9; };
  const cw = N_GLYPH.w * N_GLYPH.cell + 2 * N_GLYPH.margin, ch = N_GLYPH.h * N_GLYPH.cell + 2 * N_GLYPH.margin; const tc = document.createElement('canvas'); tc.width = cw; tc.height = ch; const tx = tc.getContext('2d'); drawNPlate(tx, cw, ch); const tex = tx.getImageData(0, 0, cw, ch).data;
  const cols = 30, rows = 42, meas = [], expN = [], expM = []; const tl = (u, v) => { const i = (Math.min(ch - 1, Math.floor(v * ch)) * cw + Math.min(cw - 1, Math.floor(u * cw))) * 4; return 0.2126 * tex[i] + 0.7152 * tex[i + 1] + 0.0722 * tex[i + 2]; };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const u = (c + 0.5) / cols, v = (r + 0.5) / rows; const P = new THREE.Vector3(Tg.nPlate.center.x + (u - 0.5) * Tg.nPlate.w, Tg.nPlate.center.y + (0.5 - v) * Tg.nPlate.h, Tg.nPlate.center.z); const [px, py] = dirToPixel(P.sub(eye)); meas.push(lum(px, py)); expN.push(tl(u, v)); expM.push(tl(1 - u, v)); }
  let sa = 0, na = 0, sb = 0, nb = 0, lo = Infinity, hi = -Infinity; meas.forEach((m, i) => { lo = Math.min(lo, m); hi = Math.max(hi, m); const d = expN[i] - expM[i]; if (d > 100) { sa += m; na++; } else if (d < -100) { sb += m; nb++; } });
  const sel = na && nb ? (sa / na - sb / nb) / (hi - lo || 1) : 0;
  const checks = [{ name: 'red cube east', pass: red.n > 150 && eR < 2, errDeg: +eR.toFixed(2), px: red.n }, { name: 'yellow lamp up', pass: yel.n > 150 && eY < 2, errDeg: +eY.toFixed(2), px: yel.n }, { name: 'N reads un-mirrored', pass: sel >= 0.4, diagonalContrast: +sel.toFixed(3) }];
  return { pass: checks.every((c) => c.pass), checks };
}

export async function bakeStyle(id, opt = {}) {
  const T = {}; const t0 = performance.now();
  const tokens = opt.tokenDoc || await (await fetch(opt.tokens || 'styles-all.json')).json();
  const S = resolveStyle(tokens, id); out.lastStyle = S; S.debug = { noShadow: 0 };
  for (const kv of (opt.override || params.get('o') || '').split(',').filter(Boolean)) { // spike convenience: ?o=lighting.dome=6,lighting.hemi=0.3
    const [path, val] = kv.split('='); const parts = path.split('.'); let o = S; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]; const k = parts[parts.length - 1];
    o[k] = typeof o[k] === 'number' ? +val : val.startsWith('_') ? '#' + val.slice(1) : val;
  }
  renderer.shadowMap.enabled = !S.debug.noShadow;
  let t = performance.now();
  const room = await buildRoom(S, { photoUrl: opt.nophoto ? null : 'photo/glacier-point-1903-left-frame.jpg', cal: !!opt.cal });
  T.buildMs = ms(t); T.propsNetworkMs = +room.timings.propsNetworkMs.toFixed(1);
  const rt = new THREE.WebGLCubeRenderTarget(FACE, { type: THREE.HalfFloatType, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const cc = new THREE.CubeCamera(0.1, 100, rt); cc.position.copy(room.eye); room.scene.add(cc);
  const accE = new THREE.WebGLRenderTarget(W, H, rtOpts), accF = new THREE.WebGLRenderTarget(FW, FH, rtOpts), accZ = new THREE.WebGLRenderTarget(FW, FH, rtOpts);
  for (const a of [accE, accF, accZ]) { renderer.setRenderTarget(a); renderer.setClearColor(0x000000, 0); renderer.clear(); }
  const cubeRot = new THREE.Matrix3(); if (opt.cubeYawDeg) { cc.rotation.y = (opt.cubeYawDeg * Math.PI) / 180; cc.updateMatrixWorld(true); cubeRot.setFromMatrix4(new THREE.Matrix4().makeRotationY((-opt.cubeYawDeg * Math.PI) / 180)); }
  for (const m of [matE, matF, matZ, matEdge]) m.uniforms.uCubeRot.value.copy(cubeRot);
  matE.uniforms.tCube.value = rt.texture; matF.uniforms.tCube.value = rt.texture; matZ.uniforms.tCube.value = rt.texture;
  matF.uniforms.uCamRot.value.copy(camRot()); matF.uniforms.uTanHalf.value.set(tanHalfH, tanHalfV);
  matZ.uniforms.uCamRot.value.copy(camRot(ZOOM)); matZ.uniforms.uTanHalf.value.set(tanH(ZOOM), tanV(ZOOM));
  if (opt.flip) matE.uniforms.uFlip.value.set(...opt.flip); else matE.uniforms.uFlip.value.set(1, 1, 1);
  const K = Math.max(1, S.lighting.dome > 0 ? S.lighting.domeSamples : 1);
  t = performance.now();
  for (let k = 0; k < K; k++) {
    if (room.dome) setDomeSample(room, k, K, S.lighting.dome);
    renderer.shadowMap.needsUpdate = true; cc.update(renderer, room.scene);
    if (opt.edgeMode) { matEdge.uniforms.tCube.value = rt.texture; matEdge.uniforms.uEdgeClamp.value = opt.edgeMode === 1 ? 1 : 0; matEdge.uniforms.uEdgeStep.value = opt.edgeStep || 3; matEdge.uniforms.uEdgeInk.value.set(S.outline.ink); accumulate(accE, matEdge, 1 / K); } else accumulate(accE, matE, 1 / K);
    accumulate(accF, matF, 1 / K); accumulate(accZ, matZ, 1 / K);
    if (k === 0) { gl.finish(); T.firstSampleMs = ms(t); }
  }
  gl.finish(); T.captureAccumMs = ms(t); T.samples = K;
  t = performance.now(); const bufE = resolve(accE, W, H, S, S.post.cell); T.resolveEquirectMs = ms(t);
  t = performance.now(); const bufF = resolve(accF, FW, FH, S, S.post.cell); T.resolveFlatMs = ms(t);
  const bufZ = resolve(accZ, FW, FH, S, S.post.cell); const cE = toCanvas(bufE, W, H), cF = toCanvas(bufF, FW, FH), cZ = toCanvas(bufZ, FW, FH);
  T.pixelsReadyMs = ms(t0);
  // encode
  t = performance.now(); const bE = await toBlob(cE, 'image/webp', 0.7); T.encodeEquirectWebpMs = ms(t);
  t = performance.now(); const bF = await toBlob(cF, 'image/webp', 0.8); T.encodeFlatWebpMs = ms(t); const bZ = await toBlob(cZ, 'image/webp', 0.8);
  const sizes = { equirectWebp70KiB: KiB(bE), flatWebp80KiB: KiB(bF) };
  if (!opt.fast) {
    sizes.equirectJpeg70KiB = KiB(await toBlob(cE, 'image/jpeg', 0.7)); sizes.equirectWebp50KiB = KiB(await toBlob(cE, 'image/webp', 0.5));
    sizes.equirectWebpLosslessKiB = KiB(await toBlob(cE, 'image/webp', 1)); sizes.equirectPngKiB = KiB(await toBlob(cE, 'image/png'));
  }
  T.totalMs = ms(t0);
  const res = { id, tokenCount: S.tokenCount, authoredTokens: S.authoredTokens, timings: T, sizes, stats: room.stats, outline: room.outlineStats, propTriangles: room.info.triangles, notes: room.info.notes, assets: room.assets };
  // analysis
  if (!opt.fast) {
    t = performance.now();
    res.seams = A.seamNull(bufE, W, H, faceMap, 60); res.analysisSeamMs = ms(t);
    const eqRows = [Math.floor(H / 6), Math.floor((H * 5) / 6)];
    if (S.outline.enabled || opt.edgeMode) res.lineWeight = A.lineWeightByFacePos(bufE, W, H, A.hexRGB(S.outline.ink));
    res.legibilityFlat = A.legibility(bufF, FW, FH); res.legibilityEquirect = A.legibility(bufE, W, H, { y0: Math.floor(eqRows[0] / 40) * 40, y1: eqRows[1] });
    if (room.photo) {
      const [px, py] = projectFlat(room.photo.center.clone().sub(room.eye)); const x0 = Math.round(px) - 24, y0 = Math.round(py) - 24; let r = 0, g = 0, b = 0; const uniq = new Set();
      for (let y = y0; y < y0 + 48; y++) for (let x = x0; x < x0 + 48; x++) { const i = (y * FW + x) * 4; r += bufF[i]; g += bufF[i + 1]; b += bufF[i + 2]; uniq.add((bufF[i] << 16) | (bufF[i + 1] << 8) | bufF[i + 2]); }
      res.photoPatch = { centerPx: [Math.round(px), Math.round(py)], meanRGB: [r, g, b].map((v) => Math.round(v / 2304)), distinctColours: uniq.size, widthPx: Math.round((room.photo.w / room.photo.center.clone().sub(room.eye).length()) * (FW / 2 / tanHalfH)) };
    }
    const lumaE = A.lumaBytes(bufE, W * H); let mean = 0; for (let i = 0; i < lumaE.length; i++) mean += lumaE[i]; res.equirectMeanLuma = +(mean / lumaE.length).toFixed(1);
    const uq = new Set(); for (let i = 0; i < W * H; i += 7) uq.add((bufE[i * 4] >> 2 << 12) | (bufE[i * 4 + 1] >> 2 << 6) | (bufE[i * 4 + 2] >> 2)); res.distinctColours6bit = uq.size;
    if (opt.cal) res.handedness = handednessGate(bufE, room);
  }
  if (!opt.fast) {
    t = performance.now();
    const raw = eqTexture(bufE), dec = eqTexture(await createImageBitmap(bE)); res.viewed = {};
    for (const [k, v, ref] of [['wide', FLAT, bufF], ['zoom', ZOOM, bufZ]]) {
      const vr = viewFromEquirect(raw, v), vd = viewFromEquirect(dec, v);
      res.viewed[k] = { resampleOnly: A.diffStats(vr, ref, FW * FH), withWebp70: A.diffStats(vd, ref, FW * FH) };
      (out.viewed ||= {})[id + '-' + k] = { vr, vd, ref };
    }
    raw.dispose(); dec.dispose(); res.viewedMs = ms(t);
  }
  out.canvases[id] = { cE, cF, cZ, bufE, bufF, bufZ, blobE: bE, blobF: bF, blobZ: bZ, room, S };
  out.results[id] = res; (out.runs ||= []).push({ id, timings: T, sizes });
  // dispose
  rt.dispose(); accE.dispose(); accF.dispose(); accZ.dispose(); room.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { for (const m of [].concat(o.material)) { for (const v of Object.values(m)) if (v && v.isTexture) v.dispose(); m.dispose(); } } });
  log('baked', id, JSON.stringify({ timings: T, sizes }));
  return res;
}

async function saveOutputs(id) {
  const c = out.canvases[id], res = out.results[id]; const F = await import('./figures.js'); const saved = [];
  saved.push(await post('docs', `s2-${id}-equirect.webp`, c.blobE)); saved.push(await post('docs', `s2-${id}-flat.webp`, c.blobF)); saved.push(await post('out', `${id}-flat.webp`, c.blobF)); saved.push(await post('out', `${id}-zoom.webp`, c.blobZ));
  if (!params.get('fast')) { const fig = F.seamCrops(c.bufE, W, H, faceMap, `${id}: four sites on cube-face borders of the baked equirect (2x nearest-neighbour; cyan ticks in the gutter mark where the face changes)`); saved.push(await post('docs', `s2-${id}-seams.webp`, await toBlob(fig, 'image/webp', 0.85))); }
  if (out.viewed && out.viewed[id + '-zoom']) { const v = out.viewed[id + '-zoom']; const fig = F.viewedFigure(`${id}: zoom camera (40 deg wide), crop 256x144 at 2x`, [v.ref, v.vr, v.vd], FW, FH); saved.push(await post('docs', `s2-${id}-viewed.webp`, await toBlob(fig, 'image/webp', 0.85))); }
  saved.push(await post('out', `results-${id}.json`, new Blob([JSON.stringify({ result: res, runs: (out.runs || []).filter((r) => r.id === id), gpu: out.gpu, three: THREE.REVISION }, null, 1)], { type: 'application/json' })));
  log('saved', id, saved.length, 'files');
}
async function main() {
  log('gpu', JSON.stringify(out.gpu), 'three r' + THREE.REVISION);
  const ids = (params.get('style') || '').split(',').filter(Boolean);
  const reps = +(params.get('repeat') || 1);
  for (const id of ids) for (let r = 0; r < reps; r++) {
    const res = await bakeStyle(id, { cal: params.get('cal') === '1', fast: params.get('fast') === '1' });
    res.run = r + 1;
    if (r < reps - 1) delete out.canvases[id];
    else if (params.get('save') === '1') await saveOutputs(id);
  }
  out.done = true;
}
export async function rotationTest(id, opt = {}) {
  await bakeStyle(id, { ...opt, fast: true, cubeYawDeg: 0 }); const e0 = out.canvases[id].bufE.slice();
  await bakeStyle(id, { ...opt, fast: true, cubeYawDeg: 45 }); const e1 = out.canvases[id].bufE;
  const L0 = A.lumaBytes(e0, W * H), L1 = A.lumaBytes(e1, W * H); const r = A.rotationDiff(L0, L1, W, H, faceMap);
  const f1 = A.shiftFace(faceMap, W, H, 512); const q = (L, f) => { const m = A.seamMetrics(L, W, H, f, 60); return { inkRatio: m.inkRatio, dLratio: m.dLratio }; };
  r.paired = { 'bake0 at bake0 borders': q(L0, faceMap), 'bake45 at bake0 borders (no border there)': q(L1, faceMap), 'bake0 at bake45 borders (no border there)': q(L0, f1), 'bake45 at bake45 borders': q(L1, f1) }; return r;
}
window.__bakeStyle = bakeStyle; window.__rotationTest = rotationTest;
if (params.get('style')) main().catch((e) => { out.error = String((e && e.stack) || e); log('ERROR', out.error); out.done = true; });
else out.done = true;
export { renderer, W, H, FW, FH, FLAT, ZOOM, post, toBlob, KiB, toCanvas, faceMap, camRot, projectFlat };
