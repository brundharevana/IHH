// Scanned rooms (real-scan museum, Task 3): a real room scan (content/scans/<id>.json, bundles built
// by tools/build_scans.py) as the chapter's room, with our exhibits standing on easels in it.
//   scanRuntime(manifest)      what the page passes to the runtime (bundle URLs and sizes, the room size)
//   scanCredit(manifest, name) the credit label and credits section (real place, "Not connected to ...", CC BY)
//   loadScanRoom(scan, cls, { renderer, onProgress, signal }) -> { root, occluder, dispose, bytes, loadMs }
//   buildScanRoom(THREE, chapter, scan, opts) -> what scene.js startRoom needs, as buildRoom returns it
// The scan is photo-textured: its lighting is in the texture, so it renders unlit (MeshBasicMaterial),
// in sRGB, outside tone mapping. Our easels and frames are lit to sit with it (scanLighting).
import { checkScanBundle, SCAN_BUDGET, roomDownloadErrors } from './budget.js';
import { buildStudyCorner } from './reconstruction.js';
import { bounded, fetchWithProgress, scanLoaders } from './loader.js';
import { boxPart, mergeParts } from './geom.js';
import { materialTextures } from './stats.js';

// The manifest's measured room: extent [x, z] and ceiling height in metres, floor at y = 0, centred.
export function scanSize(m) {
  const t = m.transform || {};
  const [w, d] = t.extent_m || [];
  if (!(w > 0 && d > 0 && t.ceiling_m > 0)) throw new Error(`scan ${m.id}: no measured extent or ceiling in its manifest`);
  return { w, d, h: t.ceiling_m };
}

export function scanRuntime(m) {
  const bundle = b => ({ url: `/${b.file}`, bytes: b.bytes, gpu_bytes: b.gpu_bytes, tris: b.tris });
  if (!m.preview) throw new Error(`scan ${m.id}: no preview bundle (python3 tools/build_scans.py ${m.id})`);
  return {
    id: m.id,
    place: m.place,
    preview: bundle(m.preview),
    bundles: { phone: bundle(m.bundles.phone), desktop: bundle(m.bundles.desktop) },
    occluder: { url: `/${m.occluder.file}`, bytes: m.occluder.bytes },
    size: scanSize(m),
  };
}

export function chooseScan(scan, cls) {
  const b = scan && scan.bundles && scan.bundles[cls];
  if (!b) throw new Error(`scan ${scan && scan.id}: no bundle for device class ${cls}`);
  return b;
}

// What a device downloads for the room: the sharp preview, its own bundle and the occluder.
export const scanDownload = (scan, cls) => scan.preview.bytes + chooseScan(scan, cls).bytes + scan.occluder.bytes;

// GPU memory a loaded tree holds, as uploaded: every texture (material slots and shader uniforms,
// materialTextures) at its real size (a compressed KTX2
// texture at its compressed mip sizes; an uncompressed fallback at 4 bytes per texel) and every
// geometry buffer, each counted once.
export function runtimeGpuBytes(root) {
  const geos = new Set(), texs = new Set();
  root.traverse(o => {
    if (o.geometry) geos.add(o.geometry);
    for (const m of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) {
      for (const t of materialTextures(m)) texs.add(t);
    }
  });
  let bytes = 0;
  for (const g of geos) {
    for (const a of Object.values(g.attributes)) bytes += (a.array && a.array.byteLength) || 0;
    if (g.index) bytes += g.index.array.byteLength;
  }
  for (const t of texs) {
    if (Array.isArray(t.mipmaps) && t.mipmaps.length && t.mipmaps[0] && t.mipmaps[0].data) bytes += t.mipmaps.reduce((a, m) => a + ((m && m.data && m.data.byteLength) || 0), 0);
    else if (t.image && t.image.width && t.image.height) bytes += Math.round(t.image.width * t.image.height * 4 * (t.generateMipmaps === false ? 1 : 4 / 3));
  }
  return bytes;
}

// The label every scanned space shows (spec, Labels): its real name and source, the licence, and that
// it is not connected to the inductee. Texts come from the manifest (tools/build_scans.py).
export function scanCredit(m, inductee) {
  if (!inductee) throw new Error(`scan ${m.id}: the credit label needs the inductee's name`);
  // The label verbatim, split around its licence name so the page can link it.
  const at = m.label.lastIndexOf(m.licence);
  if (at < 0) throw new Error(`scan ${m.id}: the label does not name the licence ${m.licence}`);
  return {
    place: m.place,
    label: m.label,
    labelParts: { before: m.label.slice(0, at), after: m.label.slice(at + m.licence.length) },
    notConnected: `Not connected to ${inductee}.`,
    credit: m.credit,
    publisher: m.publisher,
    licence: { name: m.licence, url: m.licence_url },
    source: m.sketchfab_url,
  };
}

// Scan materials: unlit, sRGB, not tone-mapped. -> the number of scan materials without a texture
// (a failed transcode leaves one; the caller treats any as a failed load).
export function unlitScan(THREE, root) {
  let missing = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const next = mats.map(m => {
      const map = m && m.map;
      if (!map) { missing++; return m; }
      map.colorSpace = THREE.SRGBColorSpace;
      let b = m;
      if (!m.isMeshBasicMaterial) { b = new THREE.MeshBasicMaterial({ map, side: m.side }); m.dispose(); }
      b.toneMapped = false;
      return b;
    });
    o.material = Array.isArray(o.material) ? next : next[0];
  });
  return missing;
}

// Disposes every geometry, material and texture under root, each once.
export function disposeTree(root) {
  const seen = new Set();
  const once = x => { if (x && !seen.has(x)) { seen.add(x); x.dispose(); } };
  root.traverse(o => {
    if (o.geometry) once(o.geometry);
    for (const m of o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []) {
      if (!m) continue;
      for (const t of materialTextures(m)) once(t);
      once(m);
    }
  });
}

// Easel: an exhibit (a makeExhibit group facing +z) on a walnut A-frame standing on the floor at
// { x, z }, turned rotY about the vertical. The picture's centre is at viewing height and it leans
// back a little, as on a museum easel; it never touches the scan's walls or paintings.
export const EASEL = Object.freeze({ centre: 1.42, lean: 0.12, leg: 0.04, backLeg: 0.55 });
export function makeEasel(THREE, picture, { x = 0, z = 0, rotY = 0 } = {}, { material = null } = {}) {
  const box = new THREE.Box3().setFromObject(picture);
  const pw = Math.max(0.3, box.max.x - box.min.x), ph = Math.max(0.3, box.max.y - box.min.y);
  const centre = Math.max(EASEL.centre, 0.8 + ph / 2);
  const top = centre + ph / 2 + 0.12, bottom = centre - ph / 2;
  const mast = new THREE.Group(); mast.name = 'easel-mast';
  mast.rotation.x = -EASEL.lean;
  const parts = [];
  const legX = Math.max(0.22, pw / 2 - 0.06), L = EASEL.leg;
  for (const s of [-1, 1]) parts.push(boxPart(THREE, { w: L, h: top, d: L * 0.75, x: s * legX, y: top / 2, z: -0.06, bevel: 0.004 }));
  parts.push(boxPart(THREE, { w: pw + 0.08, h: 0.03, d: 0.09, x: 0, y: bottom - 0.015, z: -0.01, bevel: 0.004 })); // ledge
  parts.push(boxPart(THREE, { w: 2 * legX + L, h: 0.04, d: L * 0.6, x: 0, y: top - 0.06, z: -0.07, bevel: 0.004 })); // top rail
  // Back leg: from the top of the mast to the floor behind it.
  const a = new THREE.Vector3(0, top - 0.04, -0.08).applyEuler(mast.rotation);
  const b = new THREE.Vector3(0, 0, -EASEL.backLeg);
  const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5);
  const back = boxPart(THREE, { w: L, h: len, d: L * 0.75, bevel: 0.004 });
  back.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.atan2(a.z - b.z, a.y - b.y)).setPosition(mid));
  const frame = new THREE.Mesh(mergeParts(parts), material || new THREE.MeshStandardMaterial({ color: 0x5b4330, roughness: 0.55 }));
  frame.name = 'easel-frame';
  const backLeg = new THREE.Mesh(back, frame.material); backLeg.name = 'easel-back-leg';
  picture.position.set(0, centre, 0.0);
  mast.add(frame, picture);
  const easel = new THREE.Group(); easel.name = 'easel';
  const inner = new THREE.Group(); inner.add(mast, backLeg);
  easel.add(inner);
  // Stand exactly on the floor.
  inner.updateMatrixWorld(true);
  inner.position.y -= new THREE.Box3().setFromObject(inner).min.y;
  easel.position.set(x, 0, z); easel.rotation.y = rotY;
  easel.updateMatrixWorld(true);
  return easel;
}

// Behind a scan: daylight. Its holes are mostly window openings with no glass captured (the King's
// Hall phone mesh shows one); a dark backdrop showed them as black patches in the window.
export const SCAN_BACKDROP = 0xeceae4;

// Stand: a floor-standing exhibit (a 360 document's plinth) at { x, z }, turned rotY: its footprint
// centred on the spot and its base on the floor. The exhibit faces +z before the turn, as on an easel.
export function makeStand(THREE, exhibit, { x = 0, z = 0, rotY = 0 } = {}) {
  const stand = new THREE.Group(); stand.name = 'stand';
  stand.add(exhibit);
  // Its number (the ring's anchor) just above the glass hood (Task 5 review), not high over it.
  const disc = exhibit.getObjectByName('number-disc'), hood = exhibit.getObjectByName('vitrine');
  if (disc && hood) {
    if (!hood.geometry.boundingBox) hood.geometry.computeBoundingBox();
    disc.position.y = hood.position.y + hood.geometry.boundingBox.max.y + 0.03;
  }
  exhibit.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(exhibit), c = b.getCenter(new THREE.Vector3());
  exhibit.position.x -= c.x; exhibit.position.z -= c.z; exhibit.position.y -= b.min.y;
  stand.position.set(x, 0, z); stand.rotation.y = rotY;
  stand.updateMatrixWorld(true);
  return stand;
}

// Our layer's texture sizes per device class (Task 5 fix round 1, SCAN_ROOM_GPU): on a phone every
// exhibit texture is fitted to PHONE_EXHIBIT_PX on its longest edge (the side panel still loads the
// full image), and a name card is drawn at NAME_CARD_PX for the class (no mipmaps on a phone: it is
// seen at about its own size).
export const PHONE_EXHIBIT_PX = 512;
export const NAME_CARD_PX = Object.freeze({ phone: Object.freeze([320, 400]), desktop: Object.freeze([640, 800]) });
export function fitTexturePx(w, h, max) {
  const s = Math.min(1, max / Math.max(w, h));
  return [Math.round(w * s), Math.round(h * s)];
}
// Fits a loaded image texture to `max` px on its longest edge (a canvas copy), in place.
export function fitTexture(texture, max) {
  const img = texture && texture.image;
  if (!img || !img.width || !img.height || Math.max(img.width, img.height) <= max || typeof document === 'undefined') return texture;
  const [w, h] = fitTexturePx(img.width, img.height, max);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return texture;
  ctx.drawImage(img, 0, 0, w, h);
  texture.image = c; texture.needsUpdate = true;
  return texture;
}

// Floor-standing exhibit types (their own stand); every other exhibit stands on an easel.
export const STANDING_TYPES = new Set(['360-document']);

// Our exhibits in a scanned room (chapter exhibits with an `easel: { x, z, rotY, group }` placement):
// each on an easel, or on its own stand. Shared by the runtime and the placement tests. textureOf(ex)
// gives the exhibit's front and back textures. -> { exhibitMeshes: Map id -> exhibit group,
// stands: [easel or stand group] } (the stands are not added to any scene).
export function placeScanExhibits(THREE, chapter, { makeExhibit, materials, textureOf = () => ({}), cls = 'desktop' }) {
  const exhibitMeshes = new Map(), stands = [];
  for (const raw of chapter.exhibits || []) {
    if (!raw.easel) continue;
    const ex = raw.type === 'name-card' ? { ...raw, cardPx: NAME_CARD_PX[cls] || NAME_CARD_PX.desktop, cardMipmaps: cls !== 'phone' } : raw;
    const t = textureOf(ex) || {};
    const g = makeExhibit(THREE, ex, materials, t.front || null, t.back || null, chapter.quotes);
    g.userData.wall = ex.easel.group || `easel-${ex.id}`;
    const stand = STANDING_TYPES.has(ex.type) ? makeStand(THREE, g, ex.easel) : makeEasel(THREE, g, ex.easel, { material: materials.walnut });
    stand.userData.exhibitId = ex.id;
    stands.push(stand); exhibitMeshes.set(ex.id, g);
  }
  return { exhibitMeshes, stands };
}

// Light for our easels and frames in a scanned room: a warm sky/ground fill and a soft key from
// above the viewer, with no tone mapping (the scan is drawn as photographed), so a frame reads about
// as bright as the scanned woodwork beside it.
export function scanLighting(THREE, scene) {
  const hemi = new THREE.HemisphereLight(0xfff3e2, 0x5a4a3c, 1.1);
  const key = new THREE.DirectionalLight(0xfff1dc, 1.4);
  key.position.set(2, 6, 4);
  scene.add(hemi, key);
  return [hemi, key];
}

// Scan loading in two steps (fix round 1, spec: a sharp preview first, then full detail):
//   loadScanPreview: the preview bundle and the occluder (a few hundred kB), shown as soon as they are in;
//   loadScanFull: the device's bundle, swapped in for the preview when it has loaded and transcoded.
// The room download (preview + bundle + occluder) must pass the device's scanned-room budget before
// anything is fetched. A phone whose GPU takes no compressed texture format fails (it would transcode
// to uncompressed RGBA, about 4x the memory). Any failure (HTTP, a stall, the transcoder, a texture
// that did not transcode) rejects, after aborting what is still loading.
async function fetchGlb(url, expected, { signal, onProgress, loaders, THREE }) {
  const buf = await fetchWithProgress(url, { signal, expected, onProgress });
  const g = await loaders.parse(buf, { signal, what: `parsing ${url}` });
  return { root: g.scene, bytes: buf.byteLength };
}
function checkRoom(scan, cls) {
  const b = chooseScan(scan, cls);
  const errs = checkScanBundle({ ...b, bytes: scanDownload(scan, cls) }, cls);
  if (errs.length) throw new Error(`scan ${scan.id} (${cls}) is over budget: ${errs.join('; ')}`);
  return b;
}

export async function loadScanPreview(scan, cls, { renderer, THREE, onProgress = () => {}, signal = null, now = () => performance.now() } = {}) {
  checkRoom(scan, cls);
  const t0 = now();
  const ac = new AbortController();
  if (signal) signal.addEventListener('abort', () => ac.abort(), { once: true });
  const total = scan.preview.bytes + scan.occluder.bytes, got = { p: 0, o: 0 };
  const report = () => onProgress({ loaded: Math.min(total, got.p + got.o), total });
  try {
    const loaders = await scanLoaders(renderer, { signal: ac.signal });
    if (cls === 'phone' && !loaders.compressed) throw new Error('this GPU takes no compressed texture format: a scanned room would need about 4x the texture memory');
    const [prev, occ] = await Promise.all([
      fetchGlb(scan.preview.url, scan.preview.bytes, { signal: ac.signal, loaders, onProgress: p => { got.p = p.loaded; report(); } }),
      fetchGlb(scan.occluder.url, scan.occluder.bytes, { signal: ac.signal, loaders, onProgress: p => { got.o = p.loaded; report(); } }),
      bounded(loaders.ready, { ms: null, signal: ac.signal, what: 'the Basis transcoder' }),
    ]);
    prev.root.name = `scan:${scan.id}:preview`; occ.root.name = `occluder:${scan.id}`;
    const missing = unlitScan(THREE, prev.root);
    if (missing) { disposeTree(prev.root); disposeTree(occ.root); throw new Error(`scan ${scan.id}: preview texture did not load or transcode`); }
    occ.root.updateMatrixWorld(true);
    return { root: prev.root, occluder: occ.root, bytes: prev.bytes + occ.bytes, ms: Math.round(now() - t0), compressed: loaders.compressed };
  } catch (err) {
    ac.abort();
    throw err;
  }
}

export async function loadScanFull(scan, cls, { renderer, THREE, onProgress = () => {}, signal = null, now = () => performance.now() } = {}) {
  const b = checkRoom(scan, cls);
  const t0 = now();
  const ac = new AbortController();
  if (signal) signal.addEventListener('abort', () => ac.abort(), { once: true });
  try {
    const loaders = await scanLoaders(renderer, { signal: ac.signal });
    const [full] = await Promise.all([fetchGlb(b.url, b.bytes, { signal: ac.signal, loaders, onProgress }), bounded(loaders.ready, { ms: null, signal: ac.signal, what: 'the Basis transcoder' })]);
    full.root.name = `scan:${scan.id}`;
    const missing = unlitScan(THREE, full.root);
    if (missing) { disposeTree(full.root); throw new Error(`scan ${scan.id}: ${missing} texture(s) did not load or transcode`); }
    // GPU memory as it will be uploaded: within the device's limit, or the full bundle is not shown.
    const gpu = runtimeGpuBytes(full.root);
    if (gpu > SCAN_BUDGET[cls].gpuBytes) { disposeTree(full.root); throw new Error(`scan ${scan.id} (${cls}) needs ${gpu} GPU bytes, over ${SCAN_BUDGET[cls].gpuBytes}`); }
    return { root: full.root, bytes: full.bytes, gpu, ms: Math.round(now() - t0) };
  } catch (err) {
    ac.abort();
    throw err;
  }
}

// The scanned room as scene.js startRoom uses a built room: the preview of the scan at once, our
// exhibits on easels (chapter exhibits with an `easel: { x, z, rotY }` placement), lights for the
// easels, the occluder layer for the rings, and the room's size. room.detail() then loads the full
// bundle and swaps it in. makeExhibit and the materials are passed in (room code).
// Doors: chapter.room.doors { entrance, exit } spots { x, z, rotY, w, h } at the scan's real doorways
// (the museum's labelled doors set in them; door.js), signs from chapter.doors. -> { entrance, exit }.
// The recreated study corner (Task 6; chapter.corner = cornerRuntime(...), src/content/load.js): its
// prop bundle for the device class, counted in the room's download (scan + corner within SCAN_BUDGET),
// built by reconstruction.js buildStudyCorner.
export async function loadStudyCorner(THREE, corner, cls, { scan, renderer, materials, signal = null } = {}) {
  const b = corner.bundles && corner.bundles[cls];
  if (!b) throw new Error(`study corner: no bundle for device class ${cls}`);
  if (!scan) throw new Error('study corner: loads only with its scanned room');
  const over = roomDownloadErrors(scanDownload(scan, cls), b.bytes, cls);
  if (over.length) throw new Error(`study corner (${cls}): ${over.join('; ')}`);
  const loaders = await scanLoaders(renderer, { signal });
  const [g] = await Promise.all([fetchGlb(b.url, b.bytes, { signal, loaders, onProgress: () => {} }), bounded(loaders.ready, { ms: null, signal, what: 'the Basis transcoder' })]);
  return { ...buildStudyCorner(THREE, corner, { models: g.root, phone: cls === 'phone', materials }), bytes: g.bytes };
}

export async function buildScanRoom(THREE, chapter, scan, { renderer, cls, media = {}, makeExhibit, materials, exhibitFiles, addDoors = null, onProgress, signal } = {}) {
  // The study corner (if any) loads with the preview, so the room never shows without it.
  // `media` may be a promise (scene.js starts the exhibit images with the preview, each bounded by
  // the loading inactivity rule): the room is built once the preview and the images are in.
  const [prev, corner, pictures] = await Promise.all([
    loadScanPreview(scan, cls, { renderer, THREE, onProgress, signal }),
    chapter.corner ? loadStudyCorner(THREE, chapter.corner, cls, { scan, renderer, materials, signal }) : null,
    media,
  ]);
  media = pictures || {};
  const scene = new THREE.Scene(); scene.background = new THREE.Color(SCAN_BACKDROP);
  const holder = new THREE.Group(); holder.name = 'scan';
  holder.add(prev.root); scene.add(holder);
  const lights = scanLighting(THREE, scene);
  scene.userData.lights = lights.length;
  // A picture: the exhibit's media file, or (hallway portraits) its own image URL.
  const textureOf = ex => {
    const f = exhibitFiles(ex);
    return { front: f.front ? media[f.front] : (ex.image ? media[ex.image] : null), back: f.back ? media[f.back] : null };
  };
  const { exhibitMeshes, stands: easels } = placeScanExhibits(THREE, chapter, { makeExhibit, materials, textureOf, cls });
  for (const e of easels) scene.add(e);
  if (corner) scene.add(corner.group);
  const spots = (chapter.room && chapter.room.doors) || null;
  const doors = spots && addDoors ? addDoors(THREE, scene, materials, spots, { labels: chapter.doors || {} }) : {};
  scene.updateMatrixWorld(true);
  // What is shown now: the preview, then the full bundle.
  let cur = { id: scan.id, scan, phase: 'preview', root: prev.root, occluder: prev.occluder, previewBytes: prev.bytes, previewMs: prev.ms, fullBytes: 0, fullMs: null, gpu: null };
  const drop = c => { c.root.removeFromParent(); disposeTree(c.root); if (c.occluder) disposeTree(c.occluder); };
  const size = { ...scan.size };
  const doorGroups = Object.values(doors).filter(Boolean);
  const room = {
    scene, exhibitMeshes, viewpoints: [], doors, size, scanned: true,
    // Ring occlusion: the scan's low-poly occluder layer (never drawn), the easels and the doors.
    occluders: [prev.occluder, ...easels, ...doorGroups, ...(corner ? [corner.group] : [])],
    corner: corner ? { group: corner.group, bytes: corner.bytes } : null,
    start: { eye: [0, 1.6, Math.min(size.d / 2 - 1, 3)], target: [0, 1.4, 0] },
    scan: () => ({ id: cur.id, cls, phase: cur.phase, bytes: cur.previewBytes + cur.fullBytes, previewBytes: cur.previewBytes, previewMs: cur.previewMs, fullMs: cur.fullMs, gpu: cur.gpu, root: cur.root }),
    // Full detail: the device bundle replaces the preview (disposed). Resolves true when shown,
    // false when it could not load (the preview stays: a whole room, at lower detail).
    async detail({ onProgress: onDetail = () => {}, signal: s = null } = {}) {
      const full = await loadScanFull(cur.scan, cls, { renderer, THREE, onProgress: onDetail, signal: s });
      cur.root.removeFromParent(); disposeTree(cur.root);
      holder.add(full.root);
      cur = { ...cur, phase: 'full', root: full.root, fullBytes: full.bytes, fullMs: full.ms, gpu: full.gpu };
      return true;
    },
    // Replace the whole scan in place (another room of the same style, or the leak check): the new
    // preview, occluder and full bundle load first; then the old ones are disposed.
    async swapScan(next) {
      const p = await loadScanPreview(next, cls, { renderer, THREE });
      const full = await loadScanFull(next, cls, { renderer, THREE });
      disposeTree(p.root);
      drop(cur);
      holder.add(full.root);
      room.occluders[0] = p.occluder;
      cur = { id: next.id, scan: next, phase: 'full', root: full.root, occluder: p.occluder, previewBytes: p.bytes, previewMs: p.ms, fullBytes: full.bytes, fullMs: full.ms, gpu: full.gpu };
      return true;
    },
    dispose() {
      drop(cur);
      for (const e of [...easels, ...doorGroups, ...(corner ? [corner.group] : [])]) { e.removeFromParent(); disposeTree(e); }
      for (const l of lights) l.dispose && l.dispose();
    },
  };
  return room;
}
