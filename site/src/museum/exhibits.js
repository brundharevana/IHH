import { HEIGHTS, WALL_GAP } from './layout.js';
import { makeDocumentMesh } from './docmesh.js';
import { boxPart } from './geom.js';

const A4 = { w: 0.216, h: 0.279 };

function aspectOf(texture, fallback) {
  const img = texture && texture.image;
  return img && img.width && img.height ? img.width / img.height : fallback;
}

// Exhibit groups sit WALL_GAP in front of their wall (layout.js); parts build back to the wall from
// there, leaving a hair's clearance so the wall and the back never z-fight.
const BACK = -WALL_GAP + 0.002;
// Fixed UI label on the placeholder card (the panel carries the link itself).
export const PLACEHOLDER_CTA = 'See the original';

// Missing texture (no file, a catalogue page instead of an image, a failed load): a designed card
// with the exhibit title and a pointer to the original, never a blank or black plane.
function placeholderCard(THREE, ex, aspect) {
  const card = { title: String(ex.title || ''), cta: PLACEHOLDER_CTA };
  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = 512; c.height = Math.max(256, Math.round(512 / (aspect || 0.75)));
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#efe9dc'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = '#a38f72'; ctx.lineWidth = 6; ctx.strokeRect(18, 18, c.width - 36, c.height - 36);
      ctx.fillStyle = '#2a2622'; ctx.font = '600 34px Georgia, serif'; ctx.textBaseline = 'top';
      const lines = wrapLines(ctx, card.title, c.width - 96).slice(0, 6);
      lines.forEach((l, i) => ctx.fillText(l, 48, 60 + i * 44));
      ctx.fillStyle = '#7a2e1f'; ctx.font = '28px system-ui, sans-serif'; ctx.textBaseline = 'bottom';
      ctx.fillText(card.cta, 48, c.height - 56);
      map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const mat = new THREE.MeshStandardMaterial({ map, color: 0xefe9dc, roughness: 0.9 });
  mat.name = 'placeholder-card'; mat.userData.card = card;
  return mat;
}

// Name card (hallway easels of inductees without a licence-cleared portrait): the name, set large on
// a warm card, never a likeness. ex.title is the inductee's name from their pipeline record.
export const NAME_CARD_ASPECT = 0.8;
function nameCard(THREE, ex) {
  if (typeof document === 'undefined') return null;
  // Drawn at its device size (scanroom.js NAME_CARD_PX); the layout is in units of a 640 px card.
  const [cw, ch] = ex.cardPx || [640, Math.round(640 / NAME_CARD_ASPECT)];
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const k = cw / 640, W = 640, H = ch / k;
  if (ctx.scale) ctx.scale(k, k);
  ctx.fillStyle = '#2f2a24'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#b8955a'; ctx.lineWidth = 8; ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.fillStyle = '#f3eee2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = String(ex.title || '').split(/\s+/).filter(Boolean);
  let size = 96;
  const font = () => { ctx.font = `600 ${size}px Georgia, serif`; };
  font();
  while (size > 36 && Math.max(...words.map(w => ctx.measureText(w).width)) > W - 140) { size -= 4; font(); }
  const lines = wrapLines(ctx, words.join(' '), W - 140);
  const lh = size * 1.15, top = H / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * lh));
  ctx.fillStyle = '#b8955a'; ctx.fillRect(W / 2 - 60, top + (lines.length - 1) * lh + size * 0.9, 120, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (ex.cardMipmaps === false) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
  t.userData = { nameCard: String(ex.title || '') };
  return t;
}

function numberDisc(THREE, ex, y) {
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), new THREE.MeshBasicMaterial({ color: 0xf3eee2 }));
  // Never drawn: the anchor the numbered DOM hotspot is placed on (scene.js placeHotspots).
  disc.name = 'number-disc'; disc.position.set(0, y, 0.02); disc.visible = false;
  disc.userData.number = ex.number;
  return disc;
}

// Picture frame: a bevelled walnut moulding (one extruded shape with the opening cut out) around a
// window mount, hung flush on the wall with a kraft backing board closing its back.
export const FRAME = { maxW: 0.96, maxH: 0.78, mount: 0.06, border: 0.045, depth: 0.03, bevel: 0.006 };
function frameGeometry(THREE, outerW, outerH, innerW, innerH) {
  const { depth, bevel } = FRAME;
  const ow = outerW / 2 - bevel, oh = outerH / 2 - bevel, iw = innerW / 2 + bevel, ih = innerH / 2 + bevel;
  const shape = new THREE.Shape([new THREE.Vector2(-ow, -oh), new THREE.Vector2(ow, -oh), new THREE.Vector2(ow, oh), new THREE.Vector2(-ow, oh)]);
  shape.holes.push(new THREE.Path([new THREE.Vector2(-iw, -ih), new THREE.Vector2(-iw, ih), new THREE.Vector2(iw, ih), new THREE.Vector2(iw, -ih)]));
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 1 });
}

function framed(THREE, ex, mats, texture) {
  const g = new THREE.Group();
  const { maxW, maxH, mount, border, depth, bevel } = FRAME;
  let h = maxH, w = h * aspectOf(texture, 0.75);
  if (w > maxW) { w = maxW; h = w / aspectOf(texture, 0.75); }
  const mw = w + mount * 2, mh = h + mount * 2, fw = mw + border * 2, fh = mh + border * 2;
  // Hung flush on the wall: the frame's back touches the wall, the backing board closes it.
  const frame = new THREE.Mesh(frameGeometry(THREE, fw, fh, mw, mh), mats.frame);
  frame.position.z = BACK + bevel; frame.name = 'frame'; g.add(frame);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), mats.backing);
  backing.position.z = BACK - 0.001; backing.rotation.y = Math.PI; backing.name = 'frame-backing'; g.add(backing);
  // Mount set back in the rebate, the picture on its face.
  const front = BACK + depth * 0.55;
  const mountMesh = new THREE.Mesh(new THREE.PlaneGeometry(mw, mh), mats.mount);
  mountMesh.position.z = front; mountMesh.name = 'mount'; g.add(mountMesh);
  const picMat = texture ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 }) : placeholderCard(THREE, ex, w / h);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), picMat);
  pic.position.z = front + 0.002; pic.name = 'picture'; g.add(pic);
  g.add(numberDisc(THREE, ex, fh / 2 + 0.12));
  g.userData.frameSize = { w: fw, h: fh };
  return g;
}

function wrapLines(ctx, text, maxW) {
  const lines = []; let line = '';
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxW) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function quote(THREE, ex, quotes) {
  // Verbatim from the chapter's validated quotes; no fallback to any other text.
  const q = (quotes || []).find(x => x.id === ex.quote_id);
  if (!q) throw new Error(`wall-quote exhibit ${ex.id}: quote_id ${ex.quote_id === undefined ? '(missing)' : ex.quote_id} not found in chapter quotes`);
  const g = new THREE.Group();
  g.userData.quoteText = q.text;
  const w = 1.2, h = 0.6;
  let map = null;
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#f3eee2'; ctx.font = 'italic 56px Georgia, serif'; ctx.textBaseline = 'top';
      const lines = wrapLines(ctx, q.text, c.width - 80);
      lines.forEach((l, i) => ctx.fillText(l, 40, 40 + i * 72));
      map = new THREE.CanvasTexture(c);
    }
  }
  const mat = new THREE.MeshBasicMaterial({ map, transparent: true, color: map ? 0xffffff : 0xf3eee2 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  plane.position.z = 0.01; plane.name = 'quote-text'; g.add(plane);
  g.add(numberDisc(THREE, ex, h / 2 + 0.12));
  return g;
}

// Free-standing plinth with a recessed toe and a glass hood, set back against its wall so it never
// stands out in the room; the document lies on a reading slope under the glass.
export const PLINTH = { w: 0.6, d: 0.5, toe: 0.06, hood: 0.3 };
function document360(THREE, ex, mats, texture, backTexture) {
  const g = new THREE.Group();
  const top = HEIGHTS.caseTop - HEIGHTS.frameCentre; // group origin sits at frameCentre
  const floorY = -HEIGHTS.frameCentre, { w, d, toe, hood } = PLINTH, standZ = BACK + d / 2;
  const body = new THREE.Mesh(boxPart(THREE, { w, h: HEIGHTS.caseTop - toe, d, bevel: 0.008 }), mats.plinth);
  body.position.set(0, floorY + toe + (HEIGHTS.caseTop - toe) / 2, standZ); body.name = 'plinth'; g.add(body);
  const toeMesh = new THREE.Mesh(boxPart(THREE, { w: w - 0.04, h: toe, d: d - 0.02, bevel: 0 }), mats.joinery);
  toeMesh.position.set(0, floorY + toe / 2, standZ - 0.01); toeMesh.name = 'plinth-toe'; g.add(toeMesh);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, hood, d - 0.04), mats.glass);
  glass.position.set(0, top + hood / 2, standZ); glass.name = 'vitrine'; glass.renderOrder = 2; g.add(glass);
  const aspect = aspectOf(texture, A4.w / A4.h);
  const height = ex.height || A4.h, width = ex.width || height * aspect;
  const doc = makeDocumentMesh(THREE, { width, height, frontTexture: texture || null, backTexture: backTexture || null });
  doc.name = 'document';
  if (!texture) doc.material[4] = placeholderCard(THREE, ex, width / height);
  doc.position.set(0, top + 0.07, standZ);
  doc.rotation.x = -Math.PI / 2 + 0.37; // lies on a reading slope, tilted toward the visitor
  g.add(doc);
  g.add(numberDisc(THREE, ex, top + hood + 0.15));
  return g;
}

export function makeExhibit(THREE, ex, mats, texture, backTexture, quotes) {
  let g;
  switch (ex.type) {
    case 'framed-document':
    case 'framed-photograph': g = framed(THREE, ex, mats, texture); break;
    case 'name-card': g = framed(THREE, ex, mats, nameCard(THREE, ex)); break;
    case 'wall-quote': g = quote(THREE, ex, quotes); break;
    case '360-document': g = document360(THREE, ex, mats, texture, backTexture); break;
    default: throw new Error(`unknown exhibit type ${ex.type}`);
  }
  g.userData.exhibitId = ex.id;
  g.userData.number = ex.number;
  g.userData.type = ex.type;
  return g;
}
