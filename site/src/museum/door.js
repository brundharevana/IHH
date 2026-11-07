// Museum doors, built flat against a wall at a placeDoors spot (layout.js), in two styles:
//   gallery ('panelled'): painted joinery architrave, walnut leaf with four raised panels, brass lever
//     and a brass sign;
//   reconstructed place ('modern', museumAdded): a door the museum added to a rebuilt room, so it must
//     not pass for a period door: slim graphite frame, flush leaf painted the museum neutral, a graphite
//     pull bar and a dark museum sign.
// Each door's sign carries its label ("Next: <title>", "Back: <title>"); both signs are drawn on one
// small shared atlas (SIGN_ATLAS px, counted in the room's texture budget). Four meshes per door.
import { boxPart, cylinderPart, mergeParts } from './geom.js';

// Sign centre height (m), above the handle; the hotspot anchor is mid-door below it.
export const PLATE_Y = 1.55;
export const ANCHOR_Y = 1.05;
// Atlas: one row per door (entrance, exit), each SIGN_ATLAS.w x SIGN_ATLAS.h / 2 px; the sign has the
// same 8:1 proportions in metres.
export const SIGN_ATLAS = { w: 512, h: 128 };
export const SIGN = { w: 0.56, h: 0.07 };
const KEYS = ['entrance', 'exit'];
const STYLE = {
  panelled: { ground: '#c9a46a', ink: '#2a2622', font: 'Georgia, serif' },
  modern: { ground: '#2f2d2b', ink: '#f3eee2', font: 'system-ui, sans-serif' },
};

// One canvas texture with both labels, or null where there is no canvas (a test without a document stub).
function signAtlas(THREE, labels, style) {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = SIGN_ATLAS.w; c.height = SIGN_ATLAS.h;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const st = STYLE[style], rowH = SIGN_ATLAS.h / 2;
  ctx.fillStyle = st.ground; ctx.fillRect(0, 0, c.width, c.height);
  KEYS.forEach((k, i) => {
    const text = labels[k] || '';
    if (!text) return;
    let size = 34;
    const font = () => { ctx.font = `600 ${size}px ${st.font}`; };
    font();
    while (size > 14 && ctx.measureText(text).width > c.width - 32) { size -= 2; font(); }
    ctx.fillStyle = st.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, c.width / 2, i * rowH + rowH / 2);
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// The sign face: a plane whose texture coordinates pick the door's row of the atlas.
function signFace(THREE, key, mat, text) {
  const g = new THREE.PlaneGeometry(SIGN.w, SIGN.h), uv = g.attributes.uv, row = KEYS.indexOf(key);
  for (let i = 0; i < uv.count; i++) uv.setY(i, (1 - row) * 0.5 + uv.getY(i) * 0.5); // canvas row 0 is the top half
  const m = new THREE.Mesh(g, mat); m.name = 'door-sign'; m.userData.text = text;
  return m;
}

function panelled(THREE, mats, w, h) {
  const casing = 0.08, casingD = 0.03;
  const lw = w - 2 * casing + 0.02, lh = h - casing + 0.01;
  const frame = [], leaf = [], fit = [];
  for (const s of [-1, 1]) frame.push(boxPart(THREE, { w: casing, h, d: casingD, x: s * (w / 2 - casing / 2), y: h / 2, z: casingD / 2, bevel: 0.006 }));
  frame.push(boxPart(THREE, { w, h: casing, d: casingD + 0.006, x: 0, y: h - casing / 2, z: (casingD + 0.006) / 2, bevel: 0.006 }));
  const leafD = 0.018;
  leaf.push(boxPart(THREE, { w: lw, h: lh, d: leafD, x: 0, y: lh / 2, z: leafD / 2 + 0.002, bevel: 0.003, grain: 'y' }));
  const pw = (lw - 0.36) / 2, rail = 0.14;
  const tall = { h: lh * 0.5, y: lh - rail - lh * 0.25 }, short = { h: lh * 0.24, y: rail + lh * 0.12 + 0.04 };
  for (const p of [tall, short]) for (const s of [-1, 1]) {
    leaf.push(boxPart(THREE, { w: pw, h: p.h, d: 0.012, x: s * (pw / 2 + 0.04), y: p.y, z: leafD + 0.008, bevel: 0.004, grain: 'y' }));
  }
  const hx = lw / 2 - 0.1, hy = 1.0, front = leafD + 0.004;
  fit.push(boxPart(THREE, { w: 0.05, h: 0.2, d: 0.008, x: hx, y: hy, z: front, bevel: 0.002 }));
  fit.push(cylinderPart(THREE, { rt: 0.009, rb: 0.009, h: 0.05, x: hx, y: hy + 0.04, z: front + 0.025, rx: Math.PI / 2, seg: 10 }));
  fit.push(boxPart(THREE, { w: 0.13, h: 0.018, d: 0.018, x: hx - 0.055, y: hy + 0.04, z: front + 0.05, bevel: 0.006 }));
  // Sign backing between the two tall panels' tops and the rail: a brass plate a little larger than the face.
  fit.push(boxPart(THREE, { w: SIGN.w + 0.02, h: SIGN.h + 0.02, d: 0.006, x: 0, y: PLATE_Y, z: leafD + 0.023, bevel: 0.002 }));
  return { frame: [frame, mats.joinery], leaf: [leaf, mats.walnut], fit: [fit, mats.brass], signZ: leafD + 0.027 };
}

function modern(THREE, mats, neutral, w, h) {
  const casing = 0.05, casingD = 0.025;
  const lw = w - 2 * casing, lh = h - casing;
  const frame = [], fit = [];
  for (const s of [-1, 1]) frame.push(boxPart(THREE, { w: casing, h, d: casingD, x: s * (w / 2 - casing / 2), y: h / 2, z: casingD / 2, bevel: 0.002 }));
  frame.push(boxPart(THREE, { w, h: casing, d: casingD, x: 0, y: h - casing / 2, z: casingD / 2, bevel: 0.002 }));
  const leafD = 0.02;
  const leaf = [boxPart(THREE, { w: lw, h: lh, d: leafD, x: 0, y: lh / 2, z: leafD / 2 + 0.002, bevel: 0.002 })];
  // Pull bar: an upright graphite bar on two standoffs.
  const hx = lw / 2 - 0.09, front = leafD + 0.002, barH = 0.36;
  fit.push(cylinderPart(THREE, { rt: 0.012, rb: 0.012, h: barH, x: hx, y: 1.0, z: front + 0.05, seg: 12 }));
  for (const s of [-1, 1]) fit.push(cylinderPart(THREE, { rt: 0.007, rb: 0.007, h: 0.05, x: hx, y: 1.0 + s * (barH / 2 - 0.04), z: front + 0.025, rx: Math.PI / 2, seg: 8 }));
  fit.push(boxPart(THREE, { w: SIGN.w + 0.02, h: SIGN.h + 0.02, d: 0.006, x: 0, y: PLATE_Y, z: leafD + 0.005, bevel: 0.001 }));
  return { frame: [frame, mats.fitting], leaf: [leaf, neutral], fit: [fit, mats.fitting], signZ: leafD + 0.009 };
}

// spot: { x, z, rotY, w, h } from placeDoors; key: 'entrance' | 'exit'.
function buildDoor(THREE, parts, spot, key, sign, museumAdded) {
  const g = new THREE.Group(); g.name = `door-${key}`;
  for (const [name, [list, mat]] of [['door-frame', parts.frame], ['door-leaf', parts.leaf], ['door-fittings', parts.fit]]) {
    const m = new THREE.Mesh(mergeParts(list), mat); m.name = name; g.add(m);
  }
  const face = signFace(THREE, key, sign.material, sign.labels[key] || '');
  face.position.set(0, PLATE_Y, parts.signZ); g.add(face);
  const plateMark = new THREE.Object3D(); plateMark.name = 'door-plate'; plateMark.position.set(0, PLATE_Y, parts.signZ); g.add(plateMark);
  const anchor = new THREE.Object3D(); anchor.name = 'door-anchor'; anchor.position.set(0, ANCHOR_Y, parts.signZ); g.add(anchor);
  g.position.set(spot.x, 0, spot.z); g.rotation.y = spot.rotY;
  g.userData = { door: key, spot, museumAdded };
  return g;
}

// Builds both doors at the spots placeDoors returned (a missing spot builds no door) and adds them to
// the scene. labels: { entrance, exit } sign texts (absent in dev rooms: blank signs, the atlas still
// drawn so its memory is always counted). museumAdded: the modern style of a reconstructed place.
// -> { entrance, exit } (Group or null).
export function addDoors(THREE, scene, mats, spots, { museumAdded = false, labels = {} } = {}) {
  const style = museumAdded ? 'modern' : 'panelled';
  const map = signAtlas(THREE, labels, style);
  const material = new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : STYLE[style].ground, roughness: museumAdded ? 0.6 : 0.4, metalness: 0 });
  material.name = 'door-sign';
  let neutral = null;
  if (museumAdded) { neutral = new THREE.MeshStandardMaterial({ color: 0xd8d1c5, roughness: 0.55 }); neutral.name = 'museum-neutral'; }
  const out = {};
  for (const key of KEYS) {
    const s = spots[key];
    if (!s) { out[key] = null; continue; }
    const parts = museumAdded ? modern(THREE, mats, neutral, s.w, s.h) : panelled(THREE, mats, s.w, s.h);
    out[key] = buildDoor(THREE, parts, s, key, { material, labels }, museumAdded);
    scene.add(out[key]);
  }
  return out;
}

// World boxes ({ min, max } arrays) of the named objects in a built room a door must keep clear of:
// exhibits, the title panel, the bench, furniture items and unseen-wall floor labels.
export function doorObstacles(THREE, scene, exhibitMeshes) {
  scene.updateMatrixWorld(true);
  const objs = [...exhibitMeshes.values()];
  for (const name of ['text-panel', 'bench', 'document-caption']) { const o = scene.getObjectByName(name); if (o) objs.push(o); }
  const items = scene.getObjectByName('items');
  if (items) objs.push(...items.children);
  scene.traverse(o => { if (/^unseen-(north|east|south|west)$/.test(o.name)) objs.push(o); });
  return objs.map(o => { const b = new THREE.Box3().setFromObject(o); return { min: b.min.toArray(), max: b.max.toArray() }; });
}
