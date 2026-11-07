// S1 spike: procedural stand-in room. "Illustrative reconstruction (spike)". Not a depiction of any real place.
// World axes: +X east, -Z north, +Y up. Eye at SPEC.camera.eye. Yaw 0 = north, yaw +90 deg = east.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const SPEC = {
  schema: 'ihh-scene/1',
  id: 's1-gym-stand-in',
  title: 'Gymnasium-like room (generic stand-in)',
  evidence: {
    tier: 'illustrative',
    label: 'Illustrative reconstruction (spike)',
    summary: 'Generic stand-in room built from primitives and two CC0 props. Not a depiction of any real place or period.',
    refs: []
  },
  camera: { eye: [0, 1.6, 0] },
  room: { halfWidthX: 7, halfDepthZ: 10, height: 7.6 },
  props: [
    { id: 'chalkboard-standing', provider: 'polyhaven', asset: 'standing_chalkboard_01', res: '1k', pos: [3.2, 0, -4.4], faceEyeOffsetRad: 0.15 },
    { id: 'basket-north', provider: 'polyhaven', asset: 'wicker_basket_01', res: '1k', rimY: 3.05, pos: [0, 0, -7.35], targetWidth: 0.5 }
  ],
  hotspots: [
    { id: 'h-basket', order: 2, label: 'Basket on a post, north end',
      description: 'A wicker basket fixed to a wooden post at the north end of the room, about three metres above the floor. It is a generic CC0 prop used as a stand-in; it does not depict any real object.',
      anchor: { object: 'basket-north' }, expect: 'basket-north' },
    { id: 'h-chalkboard', order: 3, label: 'Standing chalkboard',
      description: 'A free-standing chalkboard on the north-east side of the floor, turned toward the viewer. It is a CC0 3D model placed as a stand-in and carries no text.',
      anchor: { object: 'chalkboard-standing' }, expect: 'chalkboard-standing' },
    { id: 'h-track', order: 1, label: 'Running track balcony',
      description: 'A raised walkway runs around the room above head height, with a wooden rail and balusters. From the floor you see the rail and the underside; the walking surface is out of sight. Generic construction, not measured from any real building.',
      anchor: { world: [-5.5, 4.62, 3.0] }, expect: 'balcony' },
    { id: 'h-windows', order: 4, label: 'Tall windows, east wall',
      description: 'A row of tall windows in the east wall, above the balcony rail. They supply the daylight in the picture.',
      anchor: { world: [6.95, 6.0, -3.0] }, expect: 'window-east' }
  ]
};

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

function woodBoards(ctx, w, h, rand, { cols, hueBase, light, vertical }) {
  const n = cols;
  for (let i = 0; i < n; i++) {
    const hue = hueBase + (rand() - 0.5) * 8, sat = 38 + rand() * 14, lig = light + (rand() - 0.5) * 9;
    ctx.fillStyle = `hsl(${hue} ${sat}% ${lig}%)`;
    if (vertical) ctx.fillRect(i * (w / n), 0, w / n, h); else ctx.fillRect(0, i * (h / n), w, h / n);
    for (let g = 0; g < 26; g++) {
      ctx.strokeStyle = `hsla(${hue} ${sat}% ${lig - 14}% / ${0.08 + rand() * 0.14})`;
      ctx.lineWidth = 1 + rand() * 1.5;
      ctx.beginPath();
      if (vertical) { const x = i * (w / n) + rand() * (w / n); ctx.moveTo(x, 0); ctx.lineTo(x + (rand() - 0.5) * 6, h); }
      else { const y = i * (h / n) + rand() * (h / n); ctx.moveTo(0, y); ctx.lineTo(w, y + (rand() - 0.5) * 6); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(30,18,8,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (vertical) { ctx.moveTo(i * (w / n), 0); ctx.lineTo(i * (w / n), h); } else { ctx.moveTo(0, i * (h / n)); ctx.lineTo(w, i * (h / n)); }
    ctx.stroke();
  }
}

export const N_GLYPH = { w: 5, h: 7, rows: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'], cell: 56, margin: 28 };

export function drawNPlate(ctx, w, h) {
  const { rows, cell, margin } = N_GLYPH;
  ctx.fillStyle = '#14181c'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f4efe0';
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
  return { object: gltf.scene, declaredBytes: declared, fileUrls: [g.url, ...Object.values(map)], ms: performance.now() - t0 };
}

export async function buildRoom(log = () => {}) {
  const timings = {};
  const T0 = performance.now();
  const rand = rng(7);
  const { halfWidthX: HX, halfDepthZ: HZ, height: H } = SPEC.room;
  const eye = new THREE.Vector3(...SPEC.camera.eye);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222018);
  const groups = {};
  const G = (id, parent = scene) => { const g = new THREE.Group(); g.name = id; g.userData.id = id; parent.add(g); groups[id] = g; return g; };
  const add = (g, geo, mat, pos, rot) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (rot) m.rotation.set(...rot);
    m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };

  // textures and materials
  const floorTex = canvasTex(1024, 1024, (c, w, h) => { woodBoards(c, w, h, rand, { cols: 8, hueBase: 30, light: 46, vertical: true }); for (let j = 0; j < 22; j++) { c.fillStyle = 'rgba(30,18,8,0.5)'; c.fillRect(Math.floor(rand() * 8) * (w / 8), rand() * h, w / 8, 2); } }, [HX * 2 / 1.12, HZ * 2 / 1.12]);
  const wainTex = canvasTex(512, 512, (c, w, h) => woodBoards(c, w, h, rand, { cols: 8, hueBase: 28, light: 30, vertical: true }), [HX * 2 / 1.0, 1]);
  const plasterTex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#e4d9c0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${90 + rand() * 60},${80 + rand() * 50},${60 + rand() * 40},${0.03 + rand() * 0.06})`; c.fillRect(rand() * w, rand() * h, 2 + rand() * 3, 2 + rand() * 3); } }, [4, 2]);
  const ceilTex = canvasTex(512, 512, (c, w, h) => woodBoards(c, w, h, rand, { cols: 8, hueBase: 24, light: 22, vertical: false }), [6, 6]);
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x6d4524, roughness: 0.75 });
  const woodMid = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.7 });
  const matFloor = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.45 });
  const matWain = new THREE.MeshStandardMaterial({ map: wainTex, roughness: 0.8 });
  const matPlaster = new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.95 });
  const matCeil = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.9 });
  const paint = new THREE.MeshBasicMaterial({ color: 0xf2eee0 });

  // shell
  const shell = G('shell');
  add(shell, new THREE.PlaneGeometry(HX * 2, HZ * 2), matFloor, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  add(shell, new THREE.PlaneGeometry(HX * 2, HZ * 2), matCeil, [0, H, 0], [Math.PI / 2, 0, 0]);
  const wainH = 1.5;
  const walls = [
    { id: 'n', w: HX * 2, pos: (y) => [0, y, -HZ], rotY: 0 },
    { id: 's', w: HX * 2, pos: (y) => [0, y, HZ], rotY: Math.PI },
    { id: 'e', w: HZ * 2, pos: (y) => [HX, y, 0], rotY: -Math.PI / 2 },
    { id: 'w', w: HZ * 2, pos: (y) => [-HX, y, 0], rotY: Math.PI / 2 }
  ];
  for (const w of walls) {
    add(shell, new THREE.PlaneGeometry(w.w, wainH), matWain, w.pos(wainH / 2), [0, w.rotY, 0]);
    add(shell, new THREE.PlaneGeometry(w.w, H - wainH), matPlaster, w.pos(wainH + (H - wainH) / 2), [0, w.rotY, 0]);
  }
  // chair rail strips (small relief)
  add(shell, new THREE.BoxGeometry(HX * 2, 0.08, 0.06), woodDark, [0, wainH, -HZ + 0.03]);
  add(shell, new THREE.BoxGeometry(HX * 2, 0.08, 0.06), woodDark, [0, wainH, HZ - 0.03]);
  add(shell, new THREE.BoxGeometry(0.06, 0.08, HZ * 2), woodDark, [HX - 0.03, wainH, 0]);
  add(shell, new THREE.BoxGeometry(0.06, 0.08, HZ * 2), woodDark, [-HX + 0.03, wainH, 0]);

  // roof beams
  const beams = G('beams');
  for (let z = -8; z <= 8; z += 2) add(beams, new THREE.BoxGeometry(HX * 2, 0.36, 0.26), woodDark, [0, H - 0.18, z]);
  add(beams, new THREE.BoxGeometry(0.3, 0.3, HZ * 2), woodDark, [-2.4, H - 0.5, 0]);
  add(beams, new THREE.BoxGeometry(0.3, 0.3, HZ * 2), woodDark, [2.4, H - 0.5, 0]);

  // court markings
  const lines = G('floor-lines');
  const lw = 0.08, ly = 0.004;
  const strip = (w, d, x, z) => add(lines, new THREE.BoxGeometry(w, ly, d), paint, [x, ly / 2, z]);
  strip(9, lw, 0, -8); strip(9, lw, 0, 8); strip(lw, 16, -4.5, 0); strip(lw, 16, 4.5, 0); strip(9, lw, 0, 0);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.83, 64), paint); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; lines.add(ring);

  // balcony (running-track suggestion)
  const balc = G('balcony');
  const sy = 3.475, rx = 5.5, rz = 8.5;
  add(balc, new THREE.BoxGeometry(HX - rx, 0.25, HZ * 2), woodMid, [(HX + rx) / 2, sy, 0]);
  add(balc, new THREE.BoxGeometry(HX - rx, 0.25, HZ * 2), woodMid, [-(HX + rx) / 2, sy, 0]);
  add(balc, new THREE.BoxGeometry(rx * 2, 0.25, HZ - rz), woodMid, [0, sy, -(HZ + rz) / 2]);
  add(balc, new THREE.BoxGeometry(rx * 2, 0.25, HZ - rz), woodMid, [0, sy, (HZ + rz) / 2]);
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x9a5b43, roughness: 0.9 });
  for (const sx of [1, -1]) add(balc, new THREE.BoxGeometry(HX - rx - 0.1, 0.02, HZ * 2 - 0.1), trackMat, [sx * (HX + rx) / 2, 3.61, 0]);
  const rail = (w, d, x, z, y) => add(balc, new THREE.BoxGeometry(w, 0.07, d), woodDark, [x, y, z]);
  for (const y of [4.62, 3.72]) { rail(0.09, rz * 2, rx, 0, y); rail(0.09, rz * 2, -rx, 0, y); rail(rx * 2, 0.09, 0, -rz, y); rail(rx * 2, 0.09, 0, rz, y); }
  const bal = [];
  for (let z = -rz; z <= rz + 1e-6; z += 0.14) { bal.push([rx, z], [-rx, z]); }
  for (let x = -rx; x <= rx + 1e-6; x += 0.14) { bal.push([x, -rz], [x, rz]); }
  const balGeo = new THREE.BoxGeometry(0.04, 0.9, 0.04);
  const inst = new THREE.InstancedMesh(balGeo, woodMid, bal.length);
  const mtx = new THREE.Matrix4();
  bal.forEach(([x, z], i) => { mtx.makeTranslation(x, 4.17, z); inst.setMatrixAt(i, mtx); });
  inst.castShadow = inst.receiveShadow = true; balc.add(inst);
  const colGeo = new THREE.BoxGeometry(0.28, 3.35, 0.28);
  const cols = [[rx, -rz], [rx, -4.25], [rx, 0], [rx, 4.25], [rx, rz], [-rx, -rz], [-rx, -4.25], [-rx, 0], [-rx, 4.25], [-rx, rz], [2.75, -rz], [-2.75, -rz], [2.75, rz], [-2.75, rz]];
  for (const [x, z] of cols) add(balc, colGeo, woodDark, [x, 1.675, z]);
  // track lane lines on the walking surface
  for (const sx of [1, -1]) for (const o of [0.5, 1.0]) add(balc, new THREE.BoxGeometry(0.04, 0.005, HZ * 2 - 0.2), paint, [sx * (rx + o), 3.625, 0]);

  // windows (east and west)
  const glassTex = canvasTex(64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dff0ff'); g.addColorStop(1, '#a9c8e8'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  glassTex.wrapS = glassTex.wrapT = THREE.ClampToEdgeWrapping;
  const glassMat = new THREE.MeshBasicMaterial({ map: glassTex });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xcfc6b0, roughness: 0.8 });
  const winE = G('window-east'), winW = G('window-west');
  for (const [g, sx] of [[winE, 1], [winW, -1]]) {
    for (const z of [-6, -3, 0, 3, 6]) {
      const x = sx * (HX - 0.04), rot = [0, sx > 0 ? -Math.PI / 2 : Math.PI / 2, 0];
      add(g, new THREE.PlaneGeometry(1.5, 1.9), glassMat, [x - sx * 0.01, 5.9, z], rot);
      const f = (w, h, dz, dy) => add(g, new THREE.BoxGeometry(0.1, h, w), frameMat, [x - sx * 0.04, 5.9 + dy, z + dz]);
      f(0.1, 2.0, -0.8, 0); f(0.1, 2.0, 0.8, 0); f(1.7, 0.1, 0, 0.95); f(1.7, 0.1, 0, -0.95); f(0.05, 1.9, 0, 0); f(1.5, 0.05, 0, 0.1);
    }
  }

  // wall chalkboard (primitive, west wall)
  const board = G('chalkboard-wall');
  const boardTex = canvasTex(1024, 360, (c, w, h) => {
    c.fillStyle = '#1f2b25'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,255,255,${rand() * 0.04})`; c.fillRect(rand() * w, rand() * h, 3 + rand() * 12, 2); }
    c.fillStyle = '#eceae0'; c.font = 'bold 52px Helvetica, Arial, sans-serif'; c.fillText('ILLUSTRATIVE RECONSTRUCTION', 40, 90);
    c.font = '40px Helvetica, Arial, sans-serif'; c.fillText('(spike) generic stand-in room', 40, 150);
    c.fillText('Not a depiction of a real place.', 40, 215);
    c.strokeStyle = '#eceae0'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 250); c.lineTo(980, 250); c.stroke();
    c.font = '34px Helvetica, Arial, sans-serif'; c.fillText('Rules and scores would be posted here.', 40, 310);
  });
  add(board, new THREE.PlaneGeometry(4, 1.4), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.9 }), [-HX + 0.07, 2.55, 4], [0, Math.PI / 2, 0]);
  add(board, new THREE.BoxGeometry(0.05, 1.5, 4.1), woodDark, [-HX + 0.03, 2.55, 4]);

  // posts and baskets
  const postN = G('post-north');
  add(postN, new THREE.BoxGeometry(0.14, 3.4, 0.14), woodDark, [0, 1.7, -7.72]);
  add(postN, new THREE.BoxGeometry(1.2, 0.9, 0.05), new THREE.MeshStandardMaterial({ color: 0xd9cfb8, roughness: 0.8 }), [0, 3.3, -7.62]);
  const postS = G('basket-south');
  add(postS, new THREE.BoxGeometry(0.14, 3.4, 0.14), woodDark, [0, 1.7, 7.72]);
  add(postS, new THREE.BoxGeometry(1.2, 0.9, 0.05), new THREE.MeshStandardMaterial({ color: 0xd9cfb8, roughness: 0.8 }), [0, 3.3, 7.62]);
  add(postS, new THREE.TorusGeometry(0.23, 0.014, 8, 40), new THREE.MeshStandardMaterial({ color: 0x5a5a5a, metalness: 0.6, roughness: 0.4 }), [0, 3.05, 7.37], [Math.PI / 2, 0, 0]);
  add(postS, new THREE.CylinderGeometry(0.23, 0.12, 0.42, 16, 5, true), new THREE.MeshBasicMaterial({ color: 0xe8e4d8, wireframe: true }), [0, 2.84, 7.37]);

  // calibration markers (handedness gate)
  const cal = G('calibration');
  const cube = add(cal, new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0xff0000 }), [5.0, 0.3, 0]); cube.name = 'calibration-cube';
  const lamp = add(cal, new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }), [-3, 7.1, 2.5]); lamp.name = 'calibration-lamp';
  add(cal, new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6), woodDark, [-3, 7.3, 2.5]);
  const nPlateSize = { w: 1.0, h: 1.4, center: new THREE.Vector3(0, 6.3, -HZ + 0.01) };
  const nTex = canvasTex(N_GLYPH.w * N_GLYPH.cell + 2 * N_GLYPH.margin, N_GLYPH.h * N_GLYPH.cell + 2 * N_GLYPH.margin, drawNPlate);
  nTex.wrapS = nTex.wrapT = THREE.ClampToEdgeWrapping; nTex.minFilter = THREE.LinearMipmapLinearFilter;
  const nPlate = add(cal, new THREE.PlaneGeometry(nPlateSize.w, nPlateSize.h), new THREE.MeshBasicMaterial({ map: nTex }), nPlateSize.center.toArray());
  nPlate.name = 'calibration-n-plate'; nPlate.castShadow = false;

  // pendant lamps + lights
  const lamps = G('lamps');
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0c8 });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x2c4a3a, roughness: 0.6, side: THREE.DoubleSide });
  for (const [x, z] of [[-3, -4.5], [3, -4.5], [-3, 5], [3, 5]]) {
    add(lamps, new THREE.ConeGeometry(0.4, 0.3, 24, 1, true), shadeMat, [x, 5.55, z]);
    add(lamps, new THREE.SphereGeometry(0.11, 12, 8), bulbMat, [x, 5.45, z]);
    add(lamps, new THREE.CylinderGeometry(0.008, 0.008, 1.75, 4), woodDark, [x, 6.55, z]);
    const pl = new THREE.PointLight(0xffe6b8, 38, 24, 2); pl.position.set(x, 5.3, z); scene.add(pl);
  }
  const hemi = new THREE.HemisphereLight(0xcfdcff, 0x7a6244, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.2);
  sun.position.set(6.3, 7.2, -2); sun.target.position.set(-1, 0, 1.5);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 0.5, far: 30 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  timings.proceduralMs = performance.now() - T0;

  // CC0 props (Poly Haven)
  const assets = [];
  const T1 = performance.now();
  const loaded = await Promise.all(SPEC.props.map(loadPolyHaven));
  timings.propsNetworkMs = performance.now() - T1;
  const propInfo = {};
  SPEC.props.forEach((p, i) => {
    const L = loaded[i]; const obj = L.object;
    const g = G(p.id);
    g.add(obj);
    obj.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(obj); const size = box.getSize(new THREE.Vector3());
    propInfo[p.id] = { sizeRaw: size.toArray().map((v) => +v.toFixed(3)) };
    if (p.id === 'chalkboard-standing') {
      obj.position.y -= box.min.y;
      g.position.set(...p.pos);
      const toEye = Math.atan2(eye.x - p.pos[0], eye.z - p.pos[2]);
      g.rotation.y = toEye + p.faceEyeOffsetRad;
    } else if (p.id === 'basket-north') {
      const s = p.targetWidth / Math.max(size.x, size.z);
      obj.scale.setScalar(s);
      const b2 = new THREE.Box3().setFromObject(obj);
      obj.position.y += p.rimY - b2.max.y;
      const c = b2.getCenter(new THREE.Vector3());
      obj.position.x -= c.x; obj.position.z -= c.z;
      g.position.set(p.pos[0], 0, p.pos[2]);
    }
    assets.push({ id: p.asset, provider: 'Poly Haven', licence: 'CC0-1.0', pageUrl: `https://polyhaven.com/a/${p.asset}`, resolution: p.res, declaredBytes: L.declaredBytes, role: p.id, fileUrls: L.fileUrls, ms: Math.round(L.ms) });
  });

  // environment light (static, baked-friendly)
  scene.updateMatrixWorld(true);

  // resolve anchors and calibration targets
  const worldOf = (id) => new THREE.Box3().setFromObject(groups[id]).getCenter(new THREE.Vector3());
  const hotspots = SPEC.hotspots.map((h) => {
    const w = h.anchor.world ? new THREE.Vector3(...h.anchor.world) : worldOf(h.anchor.object);
    return { ...h, worldResolved: w };
  });
  const targets = {
    redCube: cube.getWorldPosition(new THREE.Vector3()),
    lamp: lamp.getWorldPosition(new THREE.Vector3()),
    nPlate: { center: nPlateSize.center.clone(), w: nPlateSize.w, h: nPlateSize.h }
  };
  timings.buildTotalMs = performance.now() - T0;
  return { scene, eye, groups, assets, propInfo, hotspots, targets, timings, sun, buildEnv: (renderer) => { const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env; scene.environmentIntensity = 0.35; pm.dispose(); } };
}
