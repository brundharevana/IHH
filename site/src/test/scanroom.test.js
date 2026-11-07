// Scanned rooms (real-scan museum, Task 3): what the page gives the runtime, credits, easels,
// unlit scan materials, disposal, and compressed texture memory in sceneStats.
import { it, expect, describe } from 'vitest';
import * as THREE from 'three';
import { scanRuntime, scanCredit, scanSize, makeEasel, unlitScan, disposeTree, chooseScan, scanDownload, runtimeGpuBytes } from '../museum/scanroom.js';
import { materialTextures } from '../museum/stats.js';
import { sceneStats } from '../museum/stats.js';
import { loadScan } from '../content/load.js';

describe('loadScan', () => {
  it('reads a usable manifest', () => {
    const m = loadScan('kings-hall');
    expect(m.id).toBe('kings-hall');
    // Content-hashed names (Task 5): room.<first 8 hex of sha256>.glb, read from the manifest.
    expect(m.bundles.phone.file).toBe(`scans/kings-hall/phone/room.${m.bundles.phone.sha256.slice(0, 8)}.glb`);
    expect(m.occluder.file).toBe(`scans/kings-hall/occluder.${m.occluder.sha256.slice(0, 8)}.glb`);
  });
  it('refuses an unusable room and an unknown id', () => {
    expect(() => loadScan('hallwyl-picture-gallery')).toThrow(/hallwyl-picture-gallery.*not usable/);
    expect(() => loadScan('margam-entrance-hall')).toThrow(/not usable/);
    expect(() => loadScan('no-such-room')).toThrow(/no-such-room/);
    expect(() => loadScan('../einstein/inductee')).toThrow(/scan id/);
  });
});

describe('scanRuntime', () => {
  it('gives the runtime only what it needs: preview, bundle URLs and sizes, the occluder, the room size', () => {
    const m = loadScan('kings-hall');
    const b = d => ({ url: `/scans/kings-hall/${d}/room.${m.bundles[d].sha256.slice(0, 8)}.glb`, bytes: m.bundles[d].bytes, gpu_bytes: m.bundles[d].gpu_bytes, tris: m.bundles[d].tris });
    expect(scanRuntime(m)).toEqual({
      id: 'kings-hall',
      place: "The King's Hall, Skokloster Castle, Sweden",
      preview: { url: `/scans/kings-hall/preview/room.${m.preview.sha256.slice(0, 8)}.glb`, bytes: m.preview.bytes, gpu_bytes: m.preview.gpu_bytes, tris: m.preview.tris },
      bundles: { phone: b('phone'), desktop: b('desktop') },
      occluder: { url: `/scans/kings-hall/occluder.${m.occluder.sha256.slice(0, 8)}.glb`, bytes: m.occluder.bytes },
      size: { w: m.transform.extent_m[0], d: m.transform.extent_m[1], h: m.transform.ceiling_m },
    });
    expect(m.preview.bytes).toBeLessThanOrEqual(400000);
  });
  it('the room size comes from the measured extent and ceiling of the squared room', () => {
    const m = loadScan('hallwyl-great-drawing-room');
    expect(scanSize(m)).toEqual({ w: m.transform.extent_m[0], d: m.transform.extent_m[1], h: m.transform.ceiling_m });
    // Squared to its walls (fix round 1): no longer the 12.2 x 11.8 m bounding box of a room at 45 degrees.
    expect(Math.abs(m.transform.walls_off_axis_deg)).toBeLessThanOrEqual(2);
    expect(scanSize(m).w * scanSize(m).d).toBeLessThan(12.188 * 11.822 * 0.8);
  });
  it('a device downloads the preview, its bundle and the occluder', () => {
    const r = scanRuntime(loadScan('kings-hall'));
    expect(scanDownload(r, 'phone')).toBe(r.preview.bytes + r.bundles.phone.bytes + r.occluder.bytes);
    expect(scanDownload(r, 'desktop')).toBe(r.preview.bytes + r.bundles.desktop.bytes + r.occluder.bytes);
  });
  it('chooses the bundle for the device class', () => {
    const m = loadScan('kings-hall'), r = scanRuntime(m);
    expect(chooseScan(r, 'phone').url).toBe(`/${m.bundles.phone.file}`);
    expect(chooseScan(r, 'desktop').url).toBe(`/${m.bundles.desktop.file}`);
    expect(chooseScan(r, 'phone').url).not.toBe(chooseScan(r, 'desktop').url);
    expect(() => chooseScan(r, 'tablet')).toThrow(/tablet/);
  });
});

describe('scanCredit', () => {
  it('names the real place, says it is not connected to the inductee, and links the licence', () => {
    const c = scanCredit(loadScan('kings-hall'), 'Albert Einstein');
    expect(c.label).toBe("3D scan of The King's Hall, Skokloster Castle, Sweden (Skokloster Castle (Skoklosters slott), CC BY 4.0).");
    expect(c.notConnected).toBe('Not connected to Albert Einstein.');
    expect(c.licence).toEqual({ name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' });
    expect(c.source).toBe('https://sketchfab.com/3d-models/the-king-s-hall-d18155613363445b9b68c0c67196d98d');
    expect(c.credit).toMatch(/^This work is based on "The King´s Hall"/);
    expect(c.credit).toMatch(/Scan by Erik Lernestål/);
    expect(c.place).toBe("The King's Hall, Skokloster Castle, Sweden");
    // The label split around the licence name, for its link; joined it is the label verbatim.
    expect(c.labelParts.before + c.licence.name + c.labelParts.after).toBe(c.label);
    expect(c.labelParts.after).toBe(').');
  });
  it('needs an inductee name', () => {
    expect(() => scanCredit(loadScan('kings-hall'), '')).toThrow(/inductee/);
  });
});

describe('unlitScan', () => {
  it('renders scan materials unlit, sRGB, and outside tone mapping', () => {
    const map = new THREE.Texture(); map.colorSpace = THREE.NoColorSpace;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ map }));
    const root = new THREE.Group(); root.add(mesh);
    const missing = unlitScan(THREE, root);
    expect(missing).toBe(0);
    expect(mesh.material.isMeshBasicMaterial).toBe(true);
    expect(mesh.material.map).toBe(map);
    expect(map.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(mesh.material.toneMapped).toBe(false);
  });
  it('counts a scan material that lost its texture (a failed transcode)', () => {
    const root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()));
    expect(unlitScan(THREE, root)).toBe(1);
  });
});

describe('makeEasel', () => {
  it('stands an exhibit on an easel on the floor, facing along rotY, with the exhibit pickable', () => {
    const picture = new THREE.Group(); picture.userData.exhibitId = 'ex1';
    picture.add(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial()));
    const easel = makeEasel(THREE, picture, { x: 1, z: -2, rotY: Math.PI / 2 });
    expect(easel.name).toBe('easel');
    expect(easel.position.toArray()).toEqual([1, 0, -2]);
    expect(easel.rotation.y).toBeCloseTo(Math.PI / 2);
    easel.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(easel);
    expect(box.min.y).toBeCloseTo(0, 3); // stands on the floor
    // The picture faces +x (rotY = 90 degrees) and sits at viewing height.
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(picture.getWorldQuaternion(new THREE.Quaternion()));
    expect(n.x).toBeGreaterThan(0.95);
    const c = picture.getWorldPosition(new THREE.Vector3());
    expect(c.y).toBeGreaterThan(1.2); expect(c.y).toBeLessThan(1.7);
    let o = easel.getObjectByName('easel-frame');
    expect(o).toBeTruthy();
    // Picking walks up from any mesh to the exhibit id.
    o = picture.children[0];
    while (o && !o.userData.exhibitId) o = o.parent;
    expect(o.userData.exhibitId).toBe('ex1');
  });
});

describe('disposeTree', () => {
  it('disposes every geometry, material and texture once', () => {
    const disposed = [];
    const track = x => { x.addEventListener('dispose', () => disposed.push(x.isTexture ? 'tex' : x.type)); return x; };
    const tex = track(new THREE.Texture());
    const mat = track(new THREE.MeshBasicMaterial({ map: tex }));
    const g1 = track(new THREE.BoxGeometry()), g2 = track(new THREE.PlaneGeometry());
    const root = new THREE.Group();
    root.add(new THREE.Mesh(g1, mat), new THREE.Mesh(g2, mat));
    disposeTree(root);
    expect(disposed.sort()).toEqual(['BoxGeometry', 'MeshBasicMaterial', 'PlaneGeometry', 'tex'].sort());
  });
});

describe('sceneStats with compressed textures', () => {
  it('counts a KTX2 (compressed) texture at its compressed size, all mip levels', () => {
    const scene = new THREE.Scene();
    const mipmaps = [{ data: new Uint8Array(2048 * 2048 / 2), width: 2048, height: 2048 }, { data: new Uint8Array(1024 * 1024 / 2), width: 1024, height: 1024 }];
    const t = new THREE.CompressedTexture(mipmaps, 2048, 2048, THREE.RGB_ETC1_Format);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ map: t })));
    expect(sceneStats(scene, { downloadBytes: 0 }).textureBytes).toBe(2048 * 2048 / 2 + 1024 * 1024 / 2);
  });
});

describe('runtimeGpuBytes', () => {
  it('counts textures as uploaded (compressed or not) plus geometry buffers, each once', () => {
    const root = new THREE.Group();
    const t = new THREE.CompressedTexture([{ data: new Uint8Array(1000), width: 64, height: 64 }], 64, 64);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(30), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(6), 1));
    const mat = new THREE.MeshBasicMaterial({ map: t });
    root.add(new THREE.Mesh(geo, mat), new THREE.Mesh(geo, mat));
    expect(runtimeGpuBytes(root)).toBe(1000 + 120 + 12);
    // An uncompressed fallback (RGBA32 transcode) counts at its real size.
    const rgba = new THREE.CompressedTexture([{ data: new Uint8Array(64 * 64 * 4), width: 64, height: 64 }], 64, 64, THREE.RGBAFormat);
    const r2 = new THREE.Group(); r2.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: rgba })));
    expect(runtimeGpuBytes(r2)).toBe(64 * 64 * 4 + 132);
  });
});

describe('runtimeGpuBytes: shader-uniform textures', () => {
  // Codex gate 2026-10-14. Rule: a material's textures are its texture slots AND its shader uniforms
  // (the ring digit atlas lives in uniforms.atlas.value), one set, each texture counted once.
  it('counts a texture held in a shader uniform, once even when a slot holds it too', () => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(30), 3));
    const atlas = new THREE.CompressedTexture([{ data: new Uint8Array(500), width: 32, height: 32 }], 32, 32);
    const ring = new THREE.ShaderMaterial({ uniforms: { atlas: { value: atlas }, tint: { value: 1 } } });
    const root = new THREE.Group();
    root.add(new THREE.Mesh(geo, ring));
    expect(runtimeGpuBytes(root)).toBe(500 + 120);
    root.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: atlas })));
    expect(runtimeGpuBytes(root)).toBe(500 + 120);
  });
  it('agrees with sceneStats and disposeTree on which textures a tree holds', () => {
    const tex = new THREE.Texture(); let disposed = 0; tex.dispose = () => { disposed++; };
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.ShaderMaterial({ uniforms: { atlas: { value: tex } } })));
    expect(materialTextures(root.children[0].material)).toEqual([tex]);
    disposeTree(root);
    expect(disposed).toBe(1);
  });
});

// Task 3 fix round 1: every shipped scan is squared to its walls (the Great Drawing Room stood at about
// 45 degrees, the Dining Room at 27). Read from the shipped occluder (it carries the room's root
// matrix): the area-weighted wall normals, modulo 90 degrees, are within 2 degrees of the axes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, listScans } from '../content/load.js';
describe('shipped scans are axis-aligned', () => {
  it.each(listScans())('%s: walls within 2 degrees of x and z', async id => {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
    await MeshoptDecoder.ready;
    const buf = readFileSync(join(ROOT, 'site', 'public', loadScan(id).occluder.file));
    const g = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
    g.scene.updateMatrixWorld(true);
    let sx = 0, sy = 0, area = 0;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    g.scene.traverse(o => {
      if (!o.isMesh) return;
      const p = o.geometry.attributes.position, idx = o.geometry.index;
      for (let i = 0; i < idx.count; i += 3) {
        a.fromBufferAttribute(p, idx.getX(i)).applyMatrix4(o.matrixWorld);
        b.fromBufferAttribute(p, idx.getX(i + 1)).applyMatrix4(o.matrixWorld);
        c.fromBufferAttribute(p, idx.getX(i + 2)).applyMatrix4(o.matrixWorld);
        const n = b.clone().sub(a).cross(c.clone().sub(a)), s2 = n.length() / 2;
        if (s2 < 1e-9) continue;
        n.normalize();
        if (Math.abs(n.y) > 0.2) continue;
        const ang = Math.atan2(n.z, n.x);
        sx += s2 * Math.cos(4 * ang); sy += s2 * Math.sin(4 * ang); area += s2;
      }
    });
    expect(area).toBeGreaterThan(10);
    const yaw = (Math.atan2(sy, sx) / 4) * 180 / Math.PI;
    expect(Math.abs(yaw)).toBeLessThanOrEqual(2);
  });
});

// Task 5 review: a 360 document's number (its ring) sits just above its glass hood on its stand, not
// floating half a metre over it.
import { makeStand } from '../museum/scanroom.js';
import { makeExhibit as makeEx } from '../museum/exhibits.js';
import { createMaterials as mats } from '../museum/materials.js';
describe('a 360 document on its stand', () => {
  it('carries its number just above the hood', async () => {
    const g = makeEx(THREE, { id: 'd', number: 4, type: '360-document', pages: [1], title: 'Doc' }, await mats(THREE, {}), null, null, []);
    const stand = makeStand(THREE, g, { x: 1, z: 2, rotY: 0.5 });
    stand.updateMatrixWorld(true);
    const hood = new THREE.Box3().setFromObject(stand.getObjectByName('vitrine'));
    const disc = stand.getObjectByName('number-disc').getWorldPosition(new THREE.Vector3());
    expect(disc.y - hood.max.y).toBeGreaterThan(0);
    expect(disc.y - hood.max.y).toBeLessThanOrEqual(0.06);
  });
});

// Task 5 review: holes in a scan are where its windows stand open (no glass was captured); behind
// them the scene shows daylight, not a dark void.
import { SCAN_BACKDROP } from '../museum/scanroom.js';
it('a scanned room is set against a daylight backdrop', () => {
  expect(typeof SCAN_BACKDROP).toBe('number');
  const c = new THREE.Color(SCAN_BACKDROP);
  expect(0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b).toBeGreaterThan(0.8);
});
