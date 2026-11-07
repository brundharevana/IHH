// S2 spike: the S1 stand-in room, re-expressed so that one geometry can be rendered in several styles.
// "Illustrative reconstruction (spike)". Not a depiction of any real place. Same axes as S1: +X east, -Z north, +Y up, eye (0,1.6,0).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const SPEC = {
  room: { halfWidthX: 7, halfDepthZ: 10, height: 7.6 },
  eye: [0, 1.6, 0],
  props: [
    { id: 'chalkboard-standing', asset: 'standing_chalkboard_01', res: '1k', role: 'propBoard', pos: [3.2, 0, -4.4], faceEyeOffsetRad: 0.15 },
    { id: 'basket-north', asset: 'wicker_basket_01', res: '1k', role: 'wicker', rimY: 3.05, pos: [0, 0, -7.35], targetWidth: 0.5 }
  ],
  panel: { pos: [-1.6, 0, -3.6], photoW: 1.0 }
};

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}
function woodBoards(ctx, w, h, rand, { cols, hueBase, light, vertical }) {
  for (let i = 0; i < cols; i++) {
    const hue = hueBase + (rand() - 0.5) * 8, sat = 38 + rand() * 14, lig = light + (rand() - 0.5) * 9;
    ctx.fillStyle = `hsl(${hue} ${sat}% ${lig}%)`;
    if (vertical) ctx.fillRect(i * (w / cols), 0, w / cols, h); else ctx.fillRect(0, i * (h / cols), w, h / cols);
    for (let g = 0; g < 26; g++) {
      ctx.strokeStyle = `hsla(${hue} ${sat}% ${lig - 14}% / ${0.08 + rand() * 0.14})`; ctx.lineWidth = 1 + rand() * 1.5; ctx.beginPath();
      if (vertical) { const x = i * (w / cols) + rand() * (w / cols); ctx.moveTo(x, 0); ctx.lineTo(x + (rand() - 0.5) * 6, h); }
      else { const y = i * (h / cols) + rand() * (h / cols); ctx.moveTo(0, y); ctx.lineTo(w, y + (rand() - 0.5) * 6); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(30,18,8,0.55)'; ctx.lineWidth = 2; ctx.beginPath();
    if (vertical) { ctx.moveTo(i * (w / cols), 0); ctx.lineTo(i * (w / cols), h); } else { ctx.moveTo(0, i * (h / cols)); ctx.lineTo(w, i * (h / cols)); }
    ctx.stroke();
  }
}
export const N_GLYPH = { w: 5, h: 7, rows: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'], cell: 56, margin: 28 };
export function drawNPlate(ctx, w, h) {
  const { rows, cell, margin } = N_GLYPH;
  ctx.fillStyle = '#14181c'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#f4efe0';
  rows.forEach((r, y) => [...r].forEach((v, x) => { if (v === '1') ctx.fillRect(margin + x * cell, margin + y * cell, cell, cell); }));
}

async function loadPolyHaven(spec) {
  const t0 = performance.now();
  const files = await (await fetch(`https://api.polyhaven.com/files/${spec.asset}`)).json();
  const g = files.gltf[spec.res].gltf;
  const json = await (await fetch(g.url)).json();
  const map = {}; let declared = g.size;
  for (const [rel, v] of Object.entries(g.include)) { map[rel] = v.url; declared += v.size; }
  for (const b of json.buffers || []) if (map[b.uri]) b.uri = map[b.uri];
  for (const im of json.images || []) if (map[im.uri]) im.uri = map[im.uri];
  const gltf = await new GLTFLoader().parseAsync(JSON.stringify(json), '');
  return { object: gltf.scene, declaredBytes: declared, ms: performance.now() - t0 };
}

// smooth per-vertex normals keyed by position (needed for inverted-hull outlines on hard-edged meshes)
function addSmoothNormals(geo) {
  if (geo.attributes.smoothNormal) return;
  const pos = geo.attributes.position; const nor = geo.attributes.normal;
  if (!nor) geo.computeVertexNormals();
  const n = geo.attributes.normal; const acc = new Map(); const key = (i) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  for (let i = 0; i < pos.count; i++) { const k = key(i); const a = acc.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); acc.set(k, a); }
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const a = acc.get(key(i)); const l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
  geo.setAttribute('smoothNormal', new THREE.BufferAttribute(out, 3));
}
const HULL_VERT = `
attribute vec3 smoothNormal; uniform float uWidth;
void main(){
  vec4 lp = vec4(position, 1.0); vec3 sn = smoothNormal;
  #ifdef USE_INSTANCING
    lp = instanceMatrix * lp; sn = mat3(instanceMatrix) * sn;
  #endif
  vec4 mv = modelViewMatrix * lp;
  vec3 n = normalize(normalMatrix * sn);
  mv.xyz += n * length(mv.xyz) * uWidth;
  gl_Position = projectionMatrix * mv;
}`;
const HULL_FRAG = 'uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }';

function facetPlane(w, h, nx, ny, hex, jitter, rand) {
  const g = new THREE.PlaneGeometry(w, h, nx, ny).toNonIndexed();
  const base = new THREE.Color(hex); const col = new Float32Array(g.attributes.position.count * 3);
  for (let t = 0; t < g.attributes.position.count / 3; t++) {
    const f = 1 + (rand() * 2 - 1) * jitter;
    for (let v = 0; v < 3; v++) { const i = (t * 3 + v) * 3; col[i] = base.r * f; col[i + 1] = base.g * f; col[i + 2] = base.b * f; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// Build a style of the room. S is the resolved style (tokens.js). opts: { cal, photoUrl, log }
export async function buildRoom(S, opts = {}) {
  const T0 = performance.now(); const timings = {};
  const rand = rng(7), frand = rng(11);
  const { halfWidthX: HX, halfDepthZ: HZ, height: H } = SPEC.room;
  const eye = new THREE.Vector3(...SPEC.eye);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(S.surface.background);
  const groups = {}; const info = { triangles: {}, notes: [] };
  const seg = (n) => Math.max(3, Math.round(n * S.geometry.curveScale));
  const tex = !!S.shading.textures;
  const model = S.shading.model;

  let gradient = null;
  if (model === 'toon') {
    const d = new Uint8Array([S.shading.band1, S.shading.band2, S.shading.band3].map((v) => Math.round(v * 255)));
    gradient = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); gradient.minFilter = gradient.magFilter = THREE.NearestFilter; gradient.needsUpdate = true;
  }
  const cache = new Map();
  const M = (role, o = {}) => {
    const key = role + '|' + (o.basic ? 'b' : '') + (o.vc ? 'v' : '') + (o.side || '') + (o.map ? 'm' + o.map.uuid : '') + (o.wire ? 'w' : '');
    if (cache.has(key)) return cache.get(key);
    const color = o.vc ? 0xffffff : new THREE.Color(S.surface[role]);
    const common = { color, vertexColors: !!o.vc, map: o.map || null, side: o.side || THREE.FrontSide };
    let m;
    if (o.basic) m = new THREE.MeshBasicMaterial({ ...common, wireframe: !!o.wire });
    else if (model === 'toon') m = new THREE.MeshToonMaterial({ ...common, gradientMap: gradient });
    else if (model === 'lambert') m = new THREE.MeshLambertMaterial({ ...common, flatShading: !!S.shading.flat });
    else m = new THREE.MeshStandardMaterial({ ...common, roughness: o.rough ?? S.shading.roughness, metalness: o.metal || 0, flatShading: !!S.shading.flat });
    cache.set(key, m); return m;
  };
  const G = (id, parent = scene) => { const g = new THREE.Group(); g.name = id; g.userData.id = id; parent.add(g); groups[id] = g; return g; };
  const add = (g, geo, mat, pos, rot, outline = 'edges') => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (rot) m.rotation.set(...rot);
    m.castShadow = true; m.receiveShadow = true; m.userData.outline = outline; g.add(m); return m;
  };
  const planeGeo = (w, h, role) => (S.geometry.facetGrid > 0 ? facetPlane(w, h, Math.max(1, Math.round(w / 1.2 * S.geometry.facetGrid)), Math.max(1, Math.round(h / 1.2 * S.geometry.facetGrid)), S.surface[role], S.geometry.faceJitter, frand) : new THREE.PlaneGeometry(w, h));
  const planeMat = (role, map) => (S.geometry.facetGrid > 0 ? M(role, { vc: true }) : M(role, { map }));

  // textures only for the baseline style
  let floorTex, wainTex, plasterTex, ceilTex;
  if (tex) {
    floorTex = canvasTex(1024, 1024, (c, w, h) => { woodBoards(c, w, h, rand, { cols: 8, hueBase: 30, light: 46, vertical: true }); for (let j = 0; j < 22; j++) { c.fillStyle = 'rgba(30,18,8,0.5)'; c.fillRect(Math.floor(rand() * 8) * (w / 8), rand() * h, w / 8, 2); } }, [HX * 2 / 1.12, HZ * 2 / 1.12]);
    wainTex = canvasTex(512, 512, (c, w, h) => woodBoards(c, w, h, rand, { cols: 8, hueBase: 28, light: 30, vertical: true }), [HX * 2, 1]);
    plasterTex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#e4d9c0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${90 + rand() * 60},${80 + rand() * 50},${60 + rand() * 40},${0.03 + rand() * 0.06})`; c.fillRect(rand() * w, rand() * h, 2 + rand() * 3, 2 + rand() * 3); } }, [4, 2]);
    ceilTex = canvasTex(512, 512, (c, w, h) => woodBoards(c, w, h, rand, { cols: 8, hueBase: 24, light: 22, vertical: false }), [6, 6]);
  }
  const paintMat = tex ? M('paint', { basic: true }) : M('paint');
  const woodDark = M('timberDark'), woodMid = M('timberMid');

  // shell (never casts shadows: needed so the clay sky-dome light reaches the interior)
  const shell = G('shell');
  const sh = (m) => { m.castShadow = false; return m; };
  sh(add(shell, planeGeo(HX * 2, HZ * 2, 'floor'), planeMat('floor', floorTex), [0, 0, 0], [-Math.PI / 2, 0, 0]));
  sh(add(shell, planeGeo(HX * 2, HZ * 2, 'ceiling'), planeMat('ceiling', ceilTex), [0, H, 0], [Math.PI / 2, 0, 0]));
  const wainH = 1.5;
  const walls = [
    { w: HX * 2, pos: (y) => [0, y, -HZ], rotY: 0 }, { w: HX * 2, pos: (y) => [0, y, HZ], rotY: Math.PI },
    { w: HZ * 2, pos: (y) => [HX, y, 0], rotY: -Math.PI / 2 }, { w: HZ * 2, pos: (y) => [-HX, y, 0], rotY: Math.PI / 2 }
  ];
  for (const w of walls) {
    sh(add(shell, planeGeo(w.w, wainH, 'wainscot'), planeMat('wainscot', wainTex), w.pos(wainH / 2), [0, w.rotY, 0]));
    sh(add(shell, planeGeo(w.w, H - wainH, 'plaster'), planeMat('plaster', plasterTex), w.pos(wainH + (H - wainH) / 2), [0, w.rotY, 0]));
  }
  add(shell, new THREE.BoxGeometry(HX * 2, 0.08, 0.06), woodDark, [0, wainH, -HZ + 0.03]);
  add(shell, new THREE.BoxGeometry(HX * 2, 0.08, 0.06), woodDark, [0, wainH, HZ - 0.03]);
  add(shell, new THREE.BoxGeometry(0.06, 0.08, HZ * 2), woodDark, [HX - 0.03, wainH, 0]);
  add(shell, new THREE.BoxGeometry(0.06, 0.08, HZ * 2), woodDark, [-HX + 0.03, wainH, 0]);

  // roof beams
  const beams = G('beams');
  for (let z = -8; z <= 8; z += 2) add(beams, new THREE.BoxGeometry(HX * 2, 0.36, 0.26), woodDark, [0, H - 0.18, z]);
  add(beams, new THREE.BoxGeometry(0.3, 0.3, HZ * 2), woodDark, [-2.4, H - 0.5, 0]);
  add(beams, new THREE.BoxGeometry(0.3, 0.3, HZ * 2), woodDark, [2.4, H - 0.5, 0]);

  // court markings (thin boxes and a ring)
  const lines = G('floor-lines'); const lw = 0.08, ly = 0.004;
  const strip = (w, d, x, z) => { const m = add(lines, new THREE.BoxGeometry(w, ly, d), paintMat, [x, ly / 2, z], null, 'none'); m.castShadow = false; };
  strip(9, lw, 0, -8); strip(9, lw, 0, 8); strip(lw, 16, -4.5, 0); strip(lw, 16, 4.5, 0); strip(9, lw, 0, 0);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.83, seg(64)), paintMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; ring.receiveShadow = true; ring.userData.outline = 'none'; lines.add(ring);

  // balcony
  const balc = G('balcony'); const sy = 3.475, rx = 5.5, rz = 8.5;
  add(balc, new THREE.BoxGeometry(HX - rx, 0.25, HZ * 2), woodMid, [(HX + rx) / 2, sy, 0]);
  add(balc, new THREE.BoxGeometry(HX - rx, 0.25, HZ * 2), woodMid, [-(HX + rx) / 2, sy, 0]);
  add(balc, new THREE.BoxGeometry(rx * 2, 0.25, HZ - rz), woodMid, [0, sy, -(HZ + rz) / 2]);
  add(balc, new THREE.BoxGeometry(rx * 2, 0.25, HZ - rz), woodMid, [0, sy, (HZ + rz) / 2]);
  const trackMat = M('track');
  for (const sx of [1, -1]) add(balc, new THREE.BoxGeometry(HX - rx - 0.1, 0.02, HZ * 2 - 0.1), trackMat, [sx * (HX + rx) / 2, 3.61, 0], null, 'none');
  const rail = (w, d, x, z, y) => add(balc, new THREE.BoxGeometry(w, 0.07, d), woodDark, [x, y, z]);
  for (const y of [4.62, 3.72]) { rail(0.09, rz * 2, rx, 0, y); rail(0.09, rz * 2, -rx, 0, y); rail(rx * 2, 0.09, 0, -rz, y); rail(rx * 2, 0.09, 0, rz, y); }
  const bal = [];
  for (let z = -rz; z <= rz + 1e-6; z += 0.14) bal.push([rx, z], [-rx, z]);
  for (let x = -rx; x <= rx + 1e-6; x += 0.14) bal.push([x, -rz], [x, rz]);
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), woodMid, bal.length); const mtx = new THREE.Matrix4();
  bal.forEach(([x, z], i) => { mtx.makeTranslation(x, 4.17, z); inst.setMatrixAt(i, mtx); });
  inst.castShadow = inst.receiveShadow = true; inst.userData.outline = 'none'; balc.add(inst);
  const colGeo = new THREE.BoxGeometry(0.28, 3.35, 0.28);
  for (const [x, z] of [[rx, -rz], [rx, -4.25], [rx, 0], [rx, 4.25], [rx, rz], [-rx, -rz], [-rx, -4.25], [-rx, 0], [-rx, 4.25], [-rx, rz], [2.75, -rz], [-2.75, -rz], [2.75, rz], [-2.75, rz]]) add(balc, colGeo, woodDark, [x, 1.675, z]);
  for (const sx of [1, -1]) for (const o of [0.5, 1.0]) add(balc, new THREE.BoxGeometry(0.04, 0.005, HZ * 2 - 0.2), paintMat, [sx * (rx + o), 3.625, 0], null, 'none').castShadow = false;

  // windows (east and west)
  let glassMat;
  if (tex) { const gt = canvasTex(64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dff0ff'); g.addColorStop(1, '#a9c8e8'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); gt.wrapS = gt.wrapT = THREE.ClampToEdgeWrapping; glassMat = M('glass', { basic: true, map: gt }); }
  else glassMat = M('glass', { basic: true });
  const frameMat = M('frame');
  const winE = G('window-east'), winW = G('window-west');
  for (const [g, sx] of [[winE, 1], [winW, -1]]) for (const z of [-6, -3, 0, 3, 6]) {
    const x = sx * (HX - 0.04), rot = [0, sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0];
    add(g, new THREE.PlaneGeometry(1.5, 1.9), glassMat, [x - sx * 0.01, 5.9, z], rot, 'edges').castShadow = false;
    const f = (w, h, dz, dy) => add(g, new THREE.BoxGeometry(0.1, h, w), frameMat, [x - sx * 0.04, 5.9 + dy, z + dz]);
    f(0.1, 2.0, -0.8, 0); f(0.1, 2.0, 0.8, 0); f(1.7, 0.1, 0, 0.95); f(1.7, 0.1, 0, -0.95); f(0.05, 1.9, 0, 0); f(1.5, 0.05, 0, 0.1);
  }

  // wall chalkboard (west wall); text only when the style allows signage
  const board = G('chalkboard-wall');
  let boardTex = null;
  if (S.shading.signage || tex) {
    boardTex = canvasTex(1024, 360, (c, w, h) => {
      c.fillStyle = S.surface.board; c.fillRect(0, 0, w, h);
      if (tex) for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,255,255,${rand() * 0.04})`; c.fillRect(rand() * w, rand() * h, 3 + rand() * 12, 2); }
      c.fillStyle = S.surface.chalk; c.font = 'bold 52px Helvetica, Arial, sans-serif'; c.fillText('ILLUSTRATIVE RECONSTRUCTION', 40, 90);
      c.font = '40px Helvetica, Arial, sans-serif'; c.fillText('(spike) generic stand-in room', 40, 150); c.fillText('Not a depiction of a real place.', 40, 215);
      c.strokeStyle = S.surface.chalk; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 250); c.lineTo(980, 250); c.stroke();
      c.font = '34px Helvetica, Arial, sans-serif'; c.fillText('Rules and scores would be posted here.', 40, 310);
    });
  }
  add(board, new THREE.PlaneGeometry(4, 1.4), boardTex ? M('board', { map: boardTex }) : M('board'), [-HX + 0.07, 2.55, 4], [0, Math.PI / 2, 0]);
  add(board, new THREE.BoxGeometry(0.05, 1.5, 4.1), woodDark, [-HX + 0.03, 2.55, 4]);

  // posts and baskets
  const backMat = M('paper');
  const postN = G('post-north');
  add(postN, new THREE.BoxGeometry(0.14, 3.4, 0.14), woodDark, [0, 1.7, -7.72]);
  add(postN, new THREE.BoxGeometry(1.2, 0.9, 0.05), backMat, [0, 3.3, -7.62]);
  const postS = G('basket-south');
  add(postS, new THREE.BoxGeometry(0.14, 3.4, 0.14), woodDark, [0, 1.7, 7.72]);
  add(postS, new THREE.BoxGeometry(1.2, 0.9, 0.05), backMat, [0, 3.3, 7.62]);
  add(postS, new THREE.TorusGeometry(0.23, 0.014, seg(8), seg(40)), M('metal', { metal: tex ? 0.6 : 0, rough: tex ? 0.4 : undefined }), [0, 3.05, 7.37], [Math.PI / 2, 0, 0], 'hull');
  add(postS, new THREE.CylinderGeometry(0.23, 0.12, 0.42, seg(16), 5, true), M('paint', { basic: true, wire: true, side: THREE.DoubleSide }), [0, 2.84, 7.37], null, 'none');

  // pendant lamps
  const lamps = G('lamps');
  for (const [x, z] of [[-3, -4.5], [3, -4.5], [-3, 5], [3, 5]]) {
    add(lamps, new THREE.ConeGeometry(0.4, 0.3, seg(24), 1, true), M('shade', { side: THREE.DoubleSide }), [x, 5.55, z], null, 'hull');
    add(lamps, new THREE.SphereGeometry(0.11, seg(12), seg(8)), M('bulb', { basic: true }), [x, 5.45, z], null, 'hull');
    add(lamps, new THREE.CylinderGeometry(0.008, 0.008, 1.75, 4), woodDark, [x, 6.55, z], null, 'none');
    if (S.lighting.pendant > 0) { const pl = new THREE.PointLight(0xffe6b8, S.lighting.pendant, 24, 2); pl.position.set(x, 5.3, z); scene.add(pl); }
  }

  // calibration markers (orientation gate), only when asked
  let targets = null;
  if (opts.cal) {
    const cal = G('calibration');
    const cube = add(cal, new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xff0000 }), [5.0, 0.3, 0], null, 'none');
    const lamp = add(cal, new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }), [-3, 7.1, 2.5], null, 'none');
    const nSize = { w: 1.0, h: 1.4, center: new THREE.Vector3(0, 6.3, -HZ + 0.01) };
    const nTex = canvasTex(N_GLYPH.w * N_GLYPH.cell + 2 * N_GLYPH.margin, N_GLYPH.h * N_GLYPH.cell + 2 * N_GLYPH.margin, drawNPlate);
    nTex.wrapS = nTex.wrapT = THREE.ClampToEdgeWrapping; nTex.minFilter = THREE.LinearMipmapLinearFilter;
    const nPlate = add(cal, new THREE.PlaneGeometry(nSize.w, nSize.h), new THREE.MeshBasicMaterial({ map: nTex }), nSize.center.toArray(), null, 'none'); nPlate.castShadow = false;
    targets = { redCube: cube.position.clone(), lamp: lamp.position.clone(), nPlate: nSize };
  }

  // photo panel: the "record" layer. The photograph itself is an unlit ShaderMaterial that writes alpha 0 into the cube, which is the mask the resolve pass uses.
  let photo = null;
  if (opts.photoUrl) {
    const pt = await new THREE.TextureLoader().loadAsync(opts.photoUrl);
    pt.colorSpace = THREE.SRGBColorSpace; pt.anisotropy = 8;
    const aspect = pt.image.width / pt.image.height; const pw = SPEC.panel.photoW, ph = pw / aspect;
    const pg = G('photo-panel'); pg.position.set(...SPEC.panel.pos); pg.rotation.y = Math.atan2(eye.x - SPEC.panel.pos[0], eye.z - SPEC.panel.pos[2]);
    const fw = pw + 0.28, fh = ph + 0.28, cy = 1.35;
    add(pg, new THREE.BoxGeometry(fw + 0.16, fh + 0.16, 0.05), woodDark, [0, cy, 0]);
    const fm = M('frame');
    add(pg, new THREE.BoxGeometry(fw, 0.05, 0.04), fm, [0, cy + fh / 2 - 0.025, 0.04]); add(pg, new THREE.BoxGeometry(fw, 0.05, 0.04), fm, [0, cy - fh / 2 + 0.025, 0.04]);
    add(pg, new THREE.BoxGeometry(0.05, fh - 0.1, 0.04), fm, [-fw / 2 + 0.025, cy, 0.04]); add(pg, new THREE.BoxGeometry(0.05, fh - 0.1, 0.04), fm, [fw / 2 - 0.025, cy, 0.04]);
    add(pg, new THREE.PlaneGeometry(fw - 0.1, fh - 0.1), M('paper'), [0, cy, 0.031], null, 'none');
    const pm = new THREE.ShaderMaterial({ uniforms: { tPhoto: { value: pt } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'uniform sampler2D tPhoto; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tPhoto, vUv).rgb, 0.0); }' });
    const pp = add(pg, new THREE.PlaneGeometry(pw, ph), pm, [0, cy, 0.036], null, 'none'); pp.castShadow = false; pp.name = 'record-photo';
    for (const sx of [-1, 1]) { add(pg, new THREE.BoxGeometry(0.08, 2.3, 0.08), woodDark, [sx * 0.62, 1.15, -0.06]); add(pg, new THREE.BoxGeometry(0.08, 0.06, 0.6), woodDark, [sx * 0.62, 0.03, 0.1]); }
    photo = { w: pw, h: ph, px: [pt.image.width, pt.image.height], center: new THREE.Vector3(SPEC.panel.pos[0], cy, SPEC.panel.pos[2]) };
  }

  // lights
  const L = S.lighting;
  if (L.hemi > 0) scene.add(new THREE.HemisphereLight(new THREE.Color(L.hemiSky), new THREE.Color(L.hemiGround), L.hemi));
  if (L.ambient > 0) scene.add(new THREE.AmbientLight(0xffffff, L.ambient));
  let sun = null;
  if (L.sun > 0) {
    sun = new THREE.DirectionalLight(0xfff0d8, L.sun); sun.position.set(6.3, 7.2, -2); sun.target.position.set(-1, 0, 1.5);
    if (L.sunShadow) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 0.5, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.camera.updateProjectionMatrix(); }
    scene.add(sun, sun.target);
  }
  let dome = null;
  if (L.dome > 0) {
    dome = new THREE.DirectionalLight(0xffffff, 1); dome.castShadow = true; dome.shadow.mapSize.set(2048, 2048);
    Object.assign(dome.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 48 }); dome.shadow.bias = -0.0005; dome.shadow.normalBias = 0.03; dome.shadow.camera.updateProjectionMatrix();
    dome.target.position.set(0, 3, 0); scene.add(dome, dome.target);
  }

  // CC0 props from Poly Haven, restyled
  const T1 = performance.now();
  const loaded = await Promise.all(SPEC.props.map(loadPolyHaven));
  timings.propsNetworkMs = performance.now() - T1;
  const assets = []; const propInfo = {};
  const mod = new SimplifyModifier();
  for (let i = 0; i < SPEC.props.length; i++) {
    const p = SPEC.props[i]; const L0 = loaded[i]; const obj = L0.object; const g = G(p.id); g.add(obj);
    let trisBefore = 0, trisAfter = 0;
    const meshes = []; obj.traverse((o) => { if (o.isMesh) meshes.push(o); });
    for (const o of meshes) {
      const tri = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; trisBefore += tri;
      if (S.geometry.propTris > 0 && tri > S.geometry.propTris) {
        try {
          let geo = o.geometry.clone(); for (const k of Object.keys(geo.attributes)) if (k !== 'position') geo.deleteAttribute(k);
          geo = mergeVertices(geo, 1e-4); const target = Math.max(8, Math.round(S.geometry.propTris / meshes.length / 2));
          const remove = Math.max(0, geo.attributes.position.count - target);
          geo = await mod.modify(geo, remove); geo.computeVertexNormals(); o.geometry = geo;
        } catch (e) { info.notes.push('simplify failed for ' + p.id + ': ' + e.message); }
      }
      trisAfter += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
      if (!tex) { o.material = M(p.role, { side: THREE.DoubleSide }); }
      o.castShadow = o.receiveShadow = true; o.userData.outline = S.outline.props ? 'hull' : 'none';
    }
    info.triangles[p.id] = { before: Math.round(trisBefore), after: Math.round(trisAfter) };
    const box = new THREE.Box3().setFromObject(obj); const size = box.getSize(new THREE.Vector3());
    if (p.id === 'chalkboard-standing') {
      obj.position.y -= box.min.y; g.position.set(...p.pos);
      g.rotation.y = Math.atan2(eye.x - p.pos[0], eye.z - p.pos[2]) + p.faceEyeOffsetRad;
    } else {
      const s = p.targetWidth / Math.max(size.x, size.z); obj.scale.setScalar(s);
      const b2 = new THREE.Box3().setFromObject(obj); obj.position.y += p.rimY - b2.max.y;
      const c = b2.getCenter(new THREE.Vector3()); obj.position.x -= c.x; obj.position.z -= c.z; g.position.set(p.pos[0], 0, p.pos[2]);
    }
    assets.push({ id: p.asset, provider: 'Poly Haven', licence: 'CC0-1.0', pageUrl: `https://polyhaven.com/a/${p.asset}`, declaredBytes: L0.declaredBytes });
  }
  scene.updateMatrixWorld(true);

  // outlines: geometry only, so cube-face borders cannot cut them
  let outlineStats = null;
  if (S.outline.enabled) outlineStats = addOutlines(scene, eye, S.outline);

  // shadow flags for everything inside the shell group are already set; count triangles for the report
  let tris = 0, meshesN = 0; scene.traverse((o) => { if (o.isMesh && !o.userData.isOutline) { meshesN++; const gg = o.geometry; tris += (gg.index ? gg.index.count : gg.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); } });
  timings.buildTotalMs = performance.now() - T0;
  return { scene, eye, groups, assets, info, outlineStats, timings, sun, dome, targets, photo, stats: { meshes: meshesN, triangles: Math.round(tris) } };
}

function addOutlines(scene, eye, O) {
  const w = (O.widthDeg * Math.PI) / 180; const ink = new THREE.Color(O.ink);
  const hullMat = new THREE.ShaderMaterial({ uniforms: { uWidth: { value: w }, uColor: { value: ink } }, vertexShader: HULL_VERT, fragmentShader: HULL_FRAG, side: THREE.BackSide });
  const pos = []; const edgeCache = new Map(); let hulls = 0, segments = 0;
  const targets = []; scene.traverse((o) => { if (o.isMesh && o.userData.outline) targets.push(o); });
  const a = new THREE.Vector3(), b = new THREE.Vector3(), v = new THREE.Vector3(), dir = new THREE.Vector3(), side = new THREE.Vector3();
  for (const m of targets) {
    const mode = m.userData.outline;
    if (mode === 'hull') {
      addSmoothNormals(m.geometry); const h = new THREE.Mesh(m.geometry, hullMat); h.userData.isOutline = true; h.castShadow = h.receiveShadow = false; m.add(h); hulls++;
    } else if (mode === 'edges') {
      let eg = edgeCache.get(m.geometry.uuid); if (!eg) { eg = new THREE.EdgesGeometry(m.geometry, O.crease); edgeCache.set(m.geometry.uuid, eg); }
      const p = eg.attributes.position;
      for (let i = 0; i < p.count; i += 2) {
        a.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(p, i + 1).applyMatrix4(m.matrixWorld);
        dir.subVectors(b, a); const len = dir.length(); if (len < 1e-3) continue; dir.divideScalar(len);
        const ends = [];
        for (const q of [a, b]) {
          v.subVectors(q, eye); const dist = v.length(); v.divideScalar(dist); side.crossVectors(v, dir); if (side.length() < 1e-3) { ends.length = 0; break; }
          side.normalize(); const hw = dist * w * 0.5; const shift = dist * w * 0.8;
          ends.push({ c: q.clone().addScaledVector(v, -shift), s: side.clone().multiplyScalar(hw), hw });
        }
        if (ends.length < 2) continue;
        ends[0].c.addScaledVector(dir, -ends[0].hw); ends[1].c.addScaledVector(dir, ends[1].hw);
        const [e0, e1] = ends; const q0 = e0.c.clone().add(e0.s), q1 = e0.c.clone().sub(e0.s), q2 = e1.c.clone().add(e1.s), q3 = e1.c.clone().sub(e1.s);
        pos.push(...q0.toArray(), ...q1.toArray(), ...q2.toArray(), ...q2.toArray(), ...q1.toArray(), ...q3.toArray()); segments++;
      }
    }
  }
  if (pos.length) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const ribbons = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: ink, side: THREE.DoubleSide })); ribbons.userData.isOutline = true; ribbons.castShadow = ribbons.receiveShadow = false; ribbons.frustumCulled = false; scene.add(ribbons);
  }
  return { hulls, ribbonSegments: segments, widthDeg: O.widthDeg };
}

export function setDomeSample(room, k, K, total) {
  const u = (k + 0.5) / K, phi = k * 2.39996323; const r = Math.sqrt(u);
  const d = new THREE.Vector3(r * Math.cos(phi), Math.max(Math.sqrt(1 - u), 0.12), r * Math.sin(phi)).normalize();
  room.dome.position.copy(room.dome.target.position).addScaledVector(d, 22); room.dome.intensity = total; /* accumulate() averages the K samples */ room.dome.updateMatrixWorld(true);
}
