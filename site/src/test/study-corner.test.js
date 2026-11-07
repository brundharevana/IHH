// Task 6: the recreated study corner in chapter 2's scanned room (content/einstein/study-corner.json).
//   - every corner object is a declared item citing the basis photographs (the declared-items rule,
//     shared with tools/content_check.py through tools/tests/fixtures/corner_cases.json);
//   - the model source's licence record (CC BY credit, changes, pinned source sha256) and its bought-kit
//     check are on file;
//   - the label is built from the basis photographs' records and is drawn in the room;
//   - only declared objects are drawn: every mesh of the built corner belongs to a declared object or
//     to the museum's own label and floor shadow, and the bundle carries only the declared models;
//   - the corner stands inside its reserved area; it is part of the room download, so the scan's
//     preview, bundle and occluder plus the corner fit SCAN_BUDGET.downloadBytes on each device;
//   - the chair is our own procedural bentwood chair (the kit's chair is not of the photographs' kind
//     of design); the plaque says the furniture is modern stand-ins.
import { it, expect, describe, beforeAll, afterAll } from 'vitest';
import * as THREE from 'three';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateCorner, buildStudyCorner, cornerLabelErrors, CORNER_KINDS, SUB_KINDS, LABEL_SIGN, CORNER_LABEL_PREFIX, CORNER_NOTE, CORNER_WHERE_LITE, CORNER_MUSEUM_PARTS } from '../museum/reconstruction.js';
import { createMaterials } from '../museum/materials.js';
import { SCAN_BUDGET, roomDownloadErrors } from '../museum/budget.js';
import * as budgetModule from '../museum/budget.js';
import { scanRuntime, scanDownload } from '../museum/scanroom.js';
import { ROOT, loadChapter, loadScan, loadStudyCorner, studyCornerView, cornerRuntime, hasStudyCorner, factIndex, mediaIndex } from '../content/load.js';
import { loadScanGeometry } from './scan-geometry.js';

const shared = JSON.parse(readFileSync(new URL('../../../tools/tests/fixtures/corner_cases.json', import.meta.url), 'utf8'));
const clone = o => JSON.parse(JSON.stringify(o));
function applyCase(c) {
  const out = clone(shared.base);
  const walk = (path) => { let o = out; for (const k of path.slice(0, -1)) o = o[k]; return [o, path[path.length - 1]]; };
  for (const [path, value] of c.set || []) { const [o, k] = walk(path); o[k] = clone(value); }
  for (const path of c.delete || []) { const [o, k] = walk(path); if (Array.isArray(o)) o.splice(k, 1); else delete o[k]; }
  return out;
}

// Canvas stub for the label texture (exhibits.js and reconstruction.js size their canvases themselves).
const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 20 }) }, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
beforeAll(() => { globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }; });
afterAll(() => { delete globalThis.document; });

describe('declared-items rule (shared with tools/content_check.py)', () => {
  it('rule constants match the shared fixture', () => {
    expect(CORNER_KINDS).toEqual(shared.constants.corner_kinds);
    expect(SUB_KINDS).toEqual(shared.constants.sub_kinds);
    expect(LABEL_SIGN).toEqual(shared.constants.label_sign);
    expect(CORNER_LABEL_PREFIX).toBe(shared.constants.label_prefix);
    // The fixed disclosures a museum-note narration line may draw on (tools/content_check.py check_museum_note).
    expect(CORNER_NOTE).toBe(shared.constants.corner_note);
    expect(CORNER_WHERE_LITE).toBe(shared.constants.corner_where_lite);
  });
  for (const c of shared.cases) {
    it(c.name, () => {
      const errs = validateCorner(applyCase(c), shared.area);
      if (c.match === null) expect(errs).toEqual([]);
      else expect(errs.join('; ')).toContain(c.match);
    });
  }
});

const corner = loadStudyCorner('einstein');
const chapter = corner ? loadChapter('einstein', corner.chapter) : null;
const area = chapter ? (chapter.room.reserved || []).find(r => r.id === corner.area) : null;

describe('the shipped study corner', () => {
  it('exists for Einstein and stands in a reserved area of its scanned chapter room', () => {
    expect(hasStudyCorner('einstein')).toBe(true);
    expect(corner.chapter).toBe(2);
    expect(chapter.room.scan).toBe('hallwyl-great-drawing-room');
    expect(area, `reserved area ${corner.area}`).toBeTruthy();
    expect(area.min).toEqual([2.3, -2.5]);
    expect(area.max).toEqual([4.1, -1.0]);
  });

  it('declares every object with basis photographs of the corner, inside its area', () => {
    expect(validateCorner(corner, area)).toEqual([]);
    expect(corner.basis_media_ids).toEqual(['EIN-M-0013', 'EIN-M-0014']);
    for (const o of corner.objects) {
      expect(o.basis_media_ids.length, o.id).toBeGreaterThan(0);
      for (const b of o.basis_media_ids) expect(corner.basis_media_ids).toContain(b);
    }
    // Only object kinds the photographs show: no telephone, radiator, painting or other kit prop.
    expect([...new Set(corner.objects.map(o => o.kind))].sort()).toEqual(['book-stack', 'bookcase', 'books', 'chair', 'desk', 'lamp', 'papers']);
    // The photographs show bentwood chairs: the chair is our procedural bentwood chair, not a kit model.
    const chair = corner.objects.find(o => o.kind === 'chair');
    expect(chair.model).toBeUndefined();
    expect(Object.keys(corner.models).sort()).toEqual(['bookcase', 'desk']);
    expect(Object.values(corner.models).map(m => m.node)).not.toContain('SM_Sandalye_P1');
  });

  it('labels the corner from the basis photographs\' records', () => {
    expect(corner.label).toBe('Recreation based on photographs: National Archives 80-G-42918, 80-G-42919');
    const media = mediaIndex('einstein');
    const credits = corner.basis_media_ids.map(id => media.get(id).credit);
    expect(cornerLabelErrors(corner.label, credits)).toEqual([]);
    expect(cornerLabelErrors('Recreation based on photographs: National Archives 80-G-42918', credits).join()).toMatch(/80-G-42919/);
    expect(cornerLabelErrors('Recreation based on photographs: National Archives 80-G-42918, 80-G-42919, 80-G-1', credits).join()).toMatch(/80-G-1/);
    expect(cornerLabelErrors('Reconstruction: National Archives 80-G-42918, 80-G-42919', credits).join()).toMatch(/must start with/);
  });

  it('records the model source\'s licence, changes, pinned source and a passed bought-kit check', () => {
    const models = Object.values(corner.models);
    expect(models.length).toBeGreaterThan(0);
    for (const m of models) {
      const s = corner.sources.find(x => x.id === m.source);
      expect(s, `source ${m.source}`).toBeTruthy();
      expect(s.licence).toBe('CC BY 4.0');
      expect(s.licence_url).toBe('https://creativecommons.org/licenses/by/4.0/');
      expect(s.credit).toContain(s.author);
      expect(s.credit).toContain(s.title);
      expect(s.credit).toContain('CC BY 4.0');
      expect(s.changes).toMatch(/^Changes: /);
      expect(s.source_sha256).toBe('09e6ce8628779b2fdea80ac01f41f8ae5bb459dc5372d740830500b411e91b2f');
      expect(s.url).toMatch(/^https:\/\/sketchfab\.com\/3d-models\//);
      expect(s.kit_check.result).toBe('pass');
      expect(s.kit_check.checks.length).toBeGreaterThan(0);
      expect(s.kit_check.excluded.images).toContain('Tablo_P1_Albedo');
      expect(s.kit_check.reverse_image_search).toBeTruthy();
    }
  });

  it('page view: the label, both photographs from their records, the note and the model credit', () => {
    const v = studyCornerView(corner, { ...factIndex('einstein'), media: mediaIndex('einstein') });
    expect(v.label).toBe(corner.label);
    expect(v.basis.map(b => b.id)).toEqual(['EIN-M-0013', 'EIN-M-0014']);
    expect(v.basis[0].url).toBe('https://catalog.archives.gov/id/276538325');
    expect(v.basis[0].label).toBe('Dr. Albert Einstein With Lieutenant (jg) Clifford L. Comstock, U.S. National Archives and Records Administration, accessed 2026-10-09');
    expect(v.note).toBe(CORNER_NOTE);
    expect(CORNER_NOTE).toBe('Modern stand-in furniture of the kinds these two photographs show. The designs are not the originals; sizes and positions are estimated.');
    expect(v.credits).toEqual([{ text: corner.sources[0].credit, licence: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' }, source: corner.sources[0].url, changes: corner.sources[0].changes }]);
  });

  it('runtime data names each device\'s bundle with its size', () => {
    const r = cornerRuntime(corner, area);
    for (const cls of ['phone', 'desktop']) {
      expect(r.bundles[cls].url).toBe(`/${corner.bundles[cls].file}`);
      expect(r.bundles[cls].bytes).toBe(corner.bundles[cls].bytes);
    }
    expect(r.area).toEqual({ id: area.id, min: area.min, max: area.max });
    expect(r.label).toBe(corner.label);
    expect(r).not.toHaveProperty('sources'); // credits are page text, not runtime data
  });

  it('is part of the room download: scan preview + bundle + occluder + corner fit SCAN_BUDGET per device', () => {
    expect(budgetModule.CORNER_BUDGET).toBeUndefined(); // no separate corner allowance
    const scan = scanRuntime(loadScan(loadChapter('einstein', corner.chapter).room.scan));
    for (const cls of ['phone', 'desktop']) {
      const b = corner.bundles[cls], p = join(ROOT, 'site', 'public', b.file);
      expect(existsSync(p), b.file).toBe(true);
      expect(readFileSync(p).byteLength).toBe(b.bytes);
      expect(scanDownload(scan, cls) + b.bytes, cls).toBeLessThanOrEqual(SCAN_BUDGET[cls].downloadBytes);
      expect(roomDownloadErrors(scanDownload(scan, cls), b.bytes, cls)).toEqual([]);
      expect(roomDownloadErrors(SCAN_BUDGET[cls].downloadBytes - b.bytes + 1, b.bytes, cls).join()).toMatch(/over the .* room download limit/);
      expect(roomDownloadErrors(NaN, b.bytes, cls).length).toBe(1);
    }
  });
});

// The built corner, from the shipped bundle (geometry only: Node has no Basis transcoder).
async function built(cls = 'phone', c = corner) {
  const models = await loadScanGeometry(ROOT, c.bundles[cls].file);
  const materials = await createMaterials(THREE, {});
  return buildStudyCorner(THREE, cornerRuntime(c, area), { models, phone: cls === 'phone', materials });
}
const ownerOf = o => { for (let p = o; p; p = p.parent) { if (p.userData && (p.userData.objectId || p.userData.museum)) return p.userData; } return null; };

describe('the built study corner', () => {
  it('draws the chair as our bentwood chair (hoop back), not a bundle model', async () => {
    const { objects } = await built('phone');
    const chair = objects.get('chair');
    expect(chair).toBeTruthy();
    const parts = [];
    let model = false;
    chair.traverse(o => { if (o.name && o.name.startsWith('model-')) model = true; if (o.isMesh) parts.push(...(o.geometry.userData.parts || [o.geometry.userData.part]).filter(Boolean)); });
    expect(model).toBe(false);
    expect(parts.some(p => p.type === 'torus')).toBe(true);
  });

  it.each(['phone', 'desktop'])('on a %s draws only declared objects, each once, plus the museum label and floor shadow', async cls => {
    const { group } = await built(cls);
    const declared = new Set(corner.objects.map(o => o.id));
    const seen = new Set(), museum = new Set();
    group.traverse(o => {
      if (!o.isMesh && !o.isInstancedMesh) return;
      const u = ownerOf(o);
      expect(u, `mesh ${o.name || o.uuid} belongs to no declared object`).toBeTruthy();
      if (u.museum) { expect(CORNER_MUSEUM_PARTS).toContain(u.museum); museum.add(u.museum); } else { expect(declared.has(u.objectId), u.objectId).toBe(true); seen.add(u.objectId); }
      // A part built as a sub-object (papers, book-stack, books) is held by that declared sub-object.
      for (const p of (o.geometry && o.geometry.userData.parts) || []) if (p.sub) expect(corner.objects.find(x => x.id === u.objectId).kind, `${p.sub} part held by ${u.objectId}`).toBe(p.sub);
    });
    // Every furniture object is drawn; sub-objects are drawn on their parent (books in the bookcase model).
    for (const o of corner.objects.filter(x => !x.parent)) expect(seen.has(o.id), o.id).toBe(true);
    for (const o of corner.objects.filter(x => x.parent && !(corner.models[corner.objects.find(p => p.id === x.parent).model] || { includes: [] }).includes.includes(x.kind))) expect(seen.has(o.id), o.id).toBe(true);
    expect([...museum].sort()).toEqual([...CORNER_MUSEUM_PARTS].sort());
  });

  it('refuses a bundle that carries a model the corner does not declare', async () => {
    const models = await loadScanGeometry(ROOT, corner.bundles.phone.file);
    const extra = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2)); extra.name = 'telephone';
    models.add(extra);
    const materials = await createMaterials(THREE, {});
    expect(() => buildStudyCorner(THREE, cornerRuntime(corner, area), { models, phone: true, materials })).toThrow(/telephone/);
  });

  it('draws a sub-object only when it is declared', async () => {
    const c = clone(corner);
    c.objects = c.objects.filter(o => o.kind !== 'papers');
    const { group } = await built('phone', c);
    // Nothing drawn is papers: no mesh owned by a papers object, no part built as papers.
    let papers = 0;
    group.traverse(o => {
      if (!o.isMesh) return;
      if (ownerOf(o) && ownerOf(o).objectId === 'papers') papers++;
      if (((o.geometry && o.geometry.userData.parts) || []).some(p => p.sub === 'papers')) papers++;
    });
    expect(papers).toBe(0);
  });

  it('stands wholly inside its reserved area, on the floor', async () => {
    const { group } = await built('desktop');
    group.updateMatrixWorld(true);
    // Every object and the label (the floor shadow is a flat decal that fades out past the area).
    const b = new THREE.Box3();
    for (const c of group.children) if (c.name !== 'contact-shadow') b.expandByObject(c, true); // precise: vertices, not a turned AABB
    expect(b.min.x).toBeGreaterThanOrEqual(area.min[0] - 1e-3);
    expect(b.max.x).toBeLessThanOrEqual(area.max[0] + 1e-3);
    expect(b.min.z).toBeGreaterThanOrEqual(area.min[1] - 1e-3);
    expect(b.max.z).toBeLessThanOrEqual(area.max[1] + 1e-3);
    expect(b.min.y).toBeGreaterThanOrEqual(-1e-3);
    // Each model sits on the floor at its declared size.
    for (const o of corner.objects.filter(x => x.model)) {
      const g = group.getObjectByName(`object-${o.id}`).getObjectByName(`model-${o.model}`), ob = new THREE.Box3().setFromObject(g, true);
      expect(ob.min.y, o.id).toBeCloseTo(0, 2);
      expect(ob.max.y, o.id).toBeCloseTo(o.h, 1);
    }
  });

  it('shows the recreation label and a baked contact shadow on the floor', async () => {
    const { group } = await built('phone');
    const label = group.getObjectByName('recreation-label');
    expect(label.userData.text).toBe(corner.label);
    const shadow = group.getObjectByName('contact-shadow');
    expect(shadow.material.map || shadow.material.alphaMap).toBeTruthy();
    expect(shadow.material.transparent).toBe(true);
    expect(shadow.material.depthWrite).toBe(false);
    const sb = new THREE.Box3().setFromObject(shadow);
    expect(sb.max.y).toBeLessThan(0.01);
  });

  it('is framed with the easel group of a basis photograph beside it; both photographs are on show', async () => {
    const { group } = await built('phone');
    expect(group.userData.frameGroup).toBe(corner.photo_group);
    const grouped = chapter.exhibits.filter(e => e.easel.group === corner.photo_group).map(e => e.media_id);
    expect(grouped.length).toBeGreaterThan(0);
    for (const m of grouped) expect(corner.basis_media_ids).toContain(m);
    for (const b of corner.basis_media_ids) expect(chapter.exhibits.map(e => e.media_id)).toContain(b);
  });
});
