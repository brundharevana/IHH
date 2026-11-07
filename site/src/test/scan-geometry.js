// Test helper: a shipped scan bundle's geometry, read from disk with the production glTF loader and
// meshopt decoder. Textures (KTX2) are dropped before parsing: Node has no Basis transcoder, and the
// placement and occlusion checks need positions only. -> THREE.Group (the scan's root, root matrix
// applied by the loader, so positions are in room metres).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GLB_MAGIC = 0x46546c67, JSON_CHUNK = 0x4e4f534a, BIN_CHUNK = 0x004e4942;

// The GLB with its texture references removed (materials keep their factors).
export function geometryOnlyGlb(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== GLB_MAGIC) throw new Error('not a GLB');
  let at = 12, json = null, bin = null;
  while (at < buf.byteLength) {
    const len = dv.getUint32(at, true), type = dv.getUint32(at + 4, true);
    const body = buf.subarray(at + 8, at + 8 + len);
    if (type === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(body));
    else if (type === BIN_CHUNK) bin = body;
    at += 8 + len;
  }
  delete json.textures; delete json.images; delete json.samplers;
  for (const m of json.materials || []) {
    if (m.pbrMetallicRoughness) { delete m.pbrMetallicRoughness.baseColorTexture; delete m.pbrMetallicRoughness.metallicRoughnessTexture; }
    delete m.emissiveTexture; delete m.normalTexture; delete m.occlusionTexture;
  }
  const drop = ['KHR_texture_basisu', 'KHR_texture_transform'];
  json.extensionsRequired = (json.extensionsRequired || []).filter(e => !drop.includes(e));
  json.extensionsUsed = (json.extensionsUsed || []).filter(e => !drop.includes(e));
  let text = new TextEncoder().encode(JSON.stringify(json));
  const pad = (4 - (text.byteLength % 4)) % 4;
  if (pad) { const t = new Uint8Array(text.byteLength + pad).fill(0x20); t.set(text); text = t; }
  const binLen = bin ? bin.byteLength + ((4 - (bin.byteLength % 4)) % 4) : 0;
  const out = new Uint8Array(12 + 8 + text.byteLength + (bin ? 8 + binLen : 0));
  const o = new DataView(out.buffer);
  o.setUint32(0, GLB_MAGIC, true); o.setUint32(4, 2, true); o.setUint32(8, out.byteLength, true);
  o.setUint32(12, text.byteLength, true); o.setUint32(16, JSON_CHUNK, true); out.set(text, 20);
  if (bin) {
    const b = 20 + text.byteLength;
    o.setUint32(b, binLen, true); o.setUint32(b + 4, BIN_CHUNK, true); out.set(bin, b + 8);
  }
  return out.buffer;
}

// file: a manifest path such as "scans/<id>/phone/room.<sha8>.glb" (under site/public).
export async function loadScanGeometry(root, file) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
  await MeshoptDecoder.ready;
  const buf = readFileSync(join(root, 'site', 'public', file));
  const g = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(geometryOnlyGlb(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)), '');
  g.scene.updateMatrixWorld(true);
  return g.scene;
}
