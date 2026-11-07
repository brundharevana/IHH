import { ROOM_TYPES, WALL_GAP, resolveSlot, introPanel, wallT, placeDoors } from './layout.js';
import { addDoors, doorObstacles } from './door.js';
import { createMaterials } from './materials.js';
import { galleryLighting } from './lighting.js';
import { makeExhibit } from './exhibits.js';
import { exhibitFiles } from './mediafiles.js';
import { buildReconstructedPlace } from './reconstruction.js';
import { buildShell, occluderOf, WALL_SIDES } from './shell.js';
import { boxPart, cylinderPart, mergeParts } from './geom.js';

// Gallery establishing view: from the south-east corner, looking across the room at the exhibit
// wall, so the first frame shows the hang, the bench, the track lights and a side wall. The gaze
// drops about 8 degrees: the pictures sit in the upper half, clear of the stage play button.
export const GALLERY_START = Object.freeze({ eye: [2.6, 1.6, 3.2], target: [-1.2, 0.1, -6] });

// Museum finishes, heights in metres from the floor.
export const GALLERY_FINISH = { skirting: 0.1, pictureRail: 3.1, trackOffset: 1.6, bench: { w: 1.8, d: 0.48, h: 0.45, fromWall: 4.2 } };

// Wall lettering for the chapter: the title only, on a w x h board. The lettering is sized to the
// board so the longest word always fits.
function textPanel(THREE, chapter, mats, { w, h }) {
  const g = new THREE.Group(); g.name = 'text-panel';
  const board = new THREE.Mesh(boxPart(THREE, { w, h, d: 0.02, bevel: 0.003 }), mats.joinery);
  board.position.z = 0.01; g.add(board);
  let map = null;
  if (typeof document !== 'undefined') {
    const PX = 366; // canvas pixels per metre of board
    const c = document.createElement('canvas'); c.width = Math.round((w - 0.06) * PX); c.height = Math.round((h - 0.06) * PX);
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#b3aa9d'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#2a2622'; ctx.textBaseline = 'top';
      const pad = Math.round(c.width * 0.08), words = String(chapter.title || '').split(/\s+/);
      let size = 58;
      const font = () => { ctx.font = `600 ${size}px Georgia, serif`; };
      font();
      while (size > 20 && Math.max(...words.map(x => ctx.measureText(x).width)) > c.width - 2 * pad) { size -= 2; font(); }
      let line = '', y = pad + size * 0.6;
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > c.width - 2 * pad) { ctx.fillText(line, pad, y); y += size * 1.2; line = word; } else line = next;
      }
      if (line) ctx.fillText(line, pad, y);
      ctx.fillRect(pad, pad * 0.6, 60 * (size / 58), 4);
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.06, h - 0.06), new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : 0xb3aa9d, roughness: 0.7 }));
  face.position.z = 0.0205; face.name = 'text-panel-face'; g.add(face);
  g.userData.text = String(chapter.title || '');
  return g;
}

// -> { scene, exhibitMeshes, viewpoints, start, size, doors }; start is the establishing { eye, target }; viewpoints is [] for galleries; size is the room's
// { w, d, h } (the camera is held inside it, camera.js roomInterior); doors is { entrance, exit } (door.js groups, null where no wall is free).
export async function buildRoom(THREE, chapter, { textures = {}, phone = false } = {}) {
  if (chapter.room === 'reconstructed-place') return buildReconstructedPlace(THREE, chapter, { textures, phone });
  const r = ROOM_TYPES[chapter.room || 'chapter-gallery'];
  if (!r) throw new Error(`unknown room type ${chapter.room}`);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2622);
  const mats = await createMaterials(THREE, textures, { floor: 'parquet' });
  const media = textures.media || {};

  // Exhibits first: they cast contact shadows into the baked shell.
  const exhibitMeshes = new Map();
  for (const ex of chapter.exhibits || []) {
    const f = exhibitFiles(ex);
    const g = makeExhibit(THREE, ex, mats, f.front ? media[f.front] : null, f.back ? media[f.back] : null, chapter.quotes);
    const p = resolveSlot(r, ex.wall, ex.slot);
    g.position.set(p.x, p.y, p.z); g.rotation.y = p.rotY; g.userData.wall = ex.wall;
    scene.add(g); exhibitMeshes.set(ex.id, g);
  }
  scene.updateMatrixWorld(true);
  const occluders = [];
  for (const g of exhibitMeshes.values()) {
    const plinth = g.getObjectByName('plinth'), frame = g.getObjectByName('frame');
    if (plinth) occluders.push(occluderOf(THREE, plinth, 0.6, 0.12));
    if (frame) occluders.push(occluderOf(THREE, frame, 0.3, 0.035));
  }

  const { skirting, pictureRail, trackOffset, bench } = GALLERY_FINISH;
  const hung = new Set((chapter.exhibits || []).map(e => e.wall));
  const benchWall = [...hung][0] || 'north';
  // Bench: centred in the room, facing the main exhibit wall.
  const bw = WALL_SIDES[benchWall], [bx, bz] = bw.pos(r);
  const benchPos = new THREE.Vector3(bx, 0, bz).add(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), bw.rotY).multiplyScalar(bench.fromWall));
  occluders.push({ min: [benchPos.x - bench.w / 2, 0, benchPos.z - bench.d / 2], max: [benchPos.x + bench.w / 2, bench.h, benchPos.z + bench.d / 2], strength: 0.45, reach: 0.18 });

  const accentWall = chapter.accent || '#3a2a2a';
  scene.add(buildShell(THREE, r, {
    floor: mats.floor, ceiling: mats.ceiling, occluders, shadows: !phone,
    wallMaterial: name => (name === benchWall ? mats.accent(accentWall) : mats.plaster),
  }));

  // Joinery around all four walls: painted skirting and a walnut picture rail with brass hanging
  // rods down to each frame; one mesh per material.
  const joinery = [], walnut = [], brass = [], fittings = [];
  for (const [name, side] of Object.entries(WALL_SIDES)) {
    const len = side.len(r), [x, z] = side.pos(r);
    const inward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), side.rotY);
    const at = (off, y) => ({ x: x + inward.x * off, y, z: z + inward.z * off, ry: side.rotY });
    joinery.push(boxPart(THREE, { w: len, h: skirting, d: 0.018, ...at(0.009, skirting / 2), bevel: 0.003 }));
    walnut.push(boxPart(THREE, { w: len, h: 0.045, d: 0.022, ...at(0.011, pictureRail), bevel: 0.006 }));
    if (!hung.has(name)) continue;
    // Track along the wall, a little below the ceiling.
    fittings.push(boxPart(THREE, { w: len - 1, h: 0.035, d: 0.05, ...at(trackOffset, r.h - 0.12), bevel: 0.004 }));
    const along = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), side.rotY), c = at(trackOffset, r.h - 0.06);
    for (const s of [-1, 1]) fittings.push(cylinderPart(THREE, { rt: 0.006, rb: 0.006, h: 0.12, x: c.x + along.x * s * (len / 2 - 0.8), y: c.y, z: c.z + along.z * s * (len / 2 - 0.8), seg: 8 }));
  }
  for (const g of exhibitMeshes.values()) {
    const size = g.userData.frameSize;
    if (!size) continue;
    for (const sx of [-1, 1]) {
      const top = new THREE.Vector3(sx * (size.w / 2 - 0.08), size.h / 2, -0.035).applyMatrix4(g.matrixWorld);
      const len = pictureRail - top.y;
      brass.push(cylinderPart(THREE, { rt: 0.0025, rb: 0.0025, h: len, x: top.x, y: top.y + len / 2, z: top.z, seg: 6 }));
    }
  }
  // Bench: walnut frame, linen-covered seat.
  const benchParts = [], cushion = [];
  const bLeg = 0.05, seatT = 0.07;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) benchParts.push(boxPart(THREE, { w: bLeg, h: bench.h - seatT, d: bLeg, x: sx * (bench.w / 2 - 0.12), y: (bench.h - seatT) / 2, z: sz * (bench.d / 2 - 0.06), bevel: 0.006 }));
  for (const sz of [-1, 1]) benchParts.push(boxPart(THREE, { w: bench.w - 0.2, h: 0.06, d: 0.03, x: 0, y: bench.h - seatT - 0.04, z: sz * (bench.d / 2 - 0.06), bevel: 0.005 }));
  for (const sz of [-1, 1]) benchParts.push(boxPart(THREE, { w: bench.w - 0.24, h: 0.03, d: 0.025, x: 0, y: 0.1, z: sz * (bench.d / 2 - 0.06), bevel: 0.004 }));
  cushion.push(boxPart(THREE, { w: bench.w, h: seatT, d: bench.d, x: 0, y: bench.h - seatT / 2, z: 0, bevel: 0.025 }));
  const benchGroup = new THREE.Group(); benchGroup.name = 'bench';
  benchGroup.add(new THREE.Mesh(mergeParts(benchParts), mats.walnut), new THREE.Mesh(mergeParts(cushion), mats.fabric));
  benchGroup.position.copy(benchPos); benchGroup.rotation.y = bw.rotY;
  benchGroup.children.forEach(m => { m.castShadow = !phone; m.receiveShadow = !phone; });
  scene.add(benchGroup);

  const finish = new THREE.Group(); finish.name = 'finishes';
  for (const [parts, mat, name] of [[joinery, mats.joinery, 'skirting'], [walnut, mats.walnut, 'picture-rail'], [brass, mats.brass, 'hanging-rods']]) {
    if (!parts.length) continue;
    const m = new THREE.Mesh(mergeParts(parts), mat); m.name = name; finish.add(m);
  }
  scene.add(finish);

  // Wall text: the chapter title is the introductory panel of the exhibit wall, to the left of the
  // first exhibit (or of the first exhibit's left neighbour's right edge, whichever is nearer), at
  // eye level, flat against the wall. Its place comes from the layout, not from coordinates here.
  if (chapter.title && exhibitMeshes.size) {
    const first = [...(chapter.exhibits || [])].sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity))[0];
    const range = g => {
      const bx = new THREE.Box3().setFromObject(g), ts = [[bx.min.x, bx.min.z], [bx.min.x, bx.max.z], [bx.max.x, bx.min.z], [bx.max.x, bx.max.z]].map(([x, z]) => wallT(first.wall, x, z));
      return { min: Math.min(...ts), max: Math.max(...ts) };
    };
    const fr = range(exhibitMeshes.get(first.id));
    const left = Math.max(-Infinity, ...(chapter.exhibits || []).filter(e => e.wall === first.wall && e.id !== first.id)
      .map(e => range(exhibitMeshes.get(e.id))).filter(t => t.max <= fr.min).map(t => t.max));
    const spot = introPanel(r, first.wall, { right: fr.min, left: Number.isFinite(left) ? left : null });
    if (spot) {
      const panel = textPanel(THREE, chapter, mats, spot);
      panel.position.set(spot.x, spot.y, spot.z); panel.rotation.y = spot.rotY;
      panel.translateZ(-(WALL_GAP - 0.002)); // flat against the wall, as the frames are
      scene.add(panel);
    }
  }

  // Entrance and exit doors on free wall, clear of the exhibits, the title panel and the bench.
  // chapter.doors: the sign labels the chapter page passes ({ entrance, exit }, journey.js roomDoors).
  const spots = placeDoors(r, doorObstacles(THREE, scene, exhibitMeshes), GALLERY_START);
  const doors = addDoors(THREE, scene, mats, spots, { labels: chapter.doors || {} });

  const { lights, heads } = galleryLighting(THREE, scene, r, [...exhibitMeshes.values()], { phone, trackOffset });
  for (const hd of heads) fittings.push(hd);
  const fitMesh = new THREE.Mesh(mergeParts(fittings), mats.fitting); fitMesh.name = 'track-lighting';
  scene.add(fitMesh);
  scene.userData.lights = lights.length;
  scene.userData.environmentIntensity = 0.4;
  return { scene, exhibitMeshes, viewpoints: [], start: GALLERY_START, size: { w: r.w, d: r.d, h: r.h }, doors };
}
