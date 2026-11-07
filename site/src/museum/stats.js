// Measured room stats for checkBudget (budget.js). Draw calls are estimated as one per mesh plus
// one per extra material group (multi-material meshes such as the document box); triangles from
// each mesh's geometry (times the instance count of an instanced mesh); texture memory as RGBA8 with a full mip chain (x 4/3; x 1 for a texture with generateMipmaps false) for every distinct
// texture that has image dimensions; a compressed (KTX2) texture at its compressed size. Download bytes are not visible in the scene: the caller
// passes the summed size of the room's files.
// The room's environment map (scene.js: PMREMGenerator.fromScene(RoomEnvironment, sigma, ..., { size })).
// Its persistent render target is 3 * max(cube, 112) x 4 * cube texels of half-float RGBA (8 bytes),
// cube = size rounded down to a power of two (three r186 PMREMGenerator._setSize/_allocateTargets).
export const ENVIRONMENT = Object.freeze({ size: 256, sigma: 0.04, intensity: 0.3 });
export function environmentBytes(size = ENVIRONMENT.size) {
  const cube = 2 ** Math.floor(Math.log2(size));
  return 3 * Math.max(cube, 16 * 7) * 4 * cube * 8;
}

// The textures a material holds: its texture slots (map, ...) and its shader uniforms (hotspot rings
// keep their digit atlas in uniforms.atlas.value), each once. Every count and disposal of a tree's
// textures goes through this (sceneStats, scanroom.js runtimeGpuBytes and disposeTree).
export function materialTextures(m) {
  if (!m) return [];
  const out = new Set();
  for (const v of Object.values(m)) if (v && v.isTexture) out.add(v);
  for (const u of Object.values(m.uniforms || {})) if (u && u.value && u.value.isTexture) out.add(u.value);
  return [...out];
}

// scene.environment counts as environmentBytes(userData.pmremSize); canvas textures (labels, wall
// quotes, ring numbers) count by their canvas size like any image, in a material slot or a shader uniform.
export function sceneStats(scene, { downloadBytes } = {}) {
  let drawCalls = 0, triangles = 0, lights = 0;
  const textures = new Set();
  scene.traverse(o => {
    if (o.isLight) lights++;
    if (!o.isMesh) return;
    const g = o.geometry;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    drawCalls += Array.isArray(o.material) && g.groups.length ? g.groups.length : 1;
    // An instanced mesh draws its geometry once per instance (one call, count x the triangles).
    triangles += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1);
    for (const m of mats) for (const t of materialTextures(m)) textures.add(t);
  });
  let textureBytes = 0;
  const env = scene.environment;
  if (env) textureBytes += environmentBytes((env.userData && env.userData.pmremSize) || ENVIRONMENT.size);
  for (const t of textures) {
    // A compressed (KTX2-transcoded) texture counts at its compressed size, every mip level it holds.
    if (t.isCompressedTexture && Array.isArray(t.mipmaps) && t.mipmaps.length) {
      textureBytes += t.mipmaps.reduce((a, m) => a + ((m && m.data && m.data.byteLength) || 0), 0);
      continue;
    }
    const img = t.image;
    // A full mip chain adds a third; a texture that never generates mipmaps is its base level only.
    if (img && img.width && img.height) textureBytes += Math.round(img.width * img.height * 4 * (t.generateMipmaps === false ? 1 : 4 / 3));
  }
  return { drawCalls, triangles, lights, textureBytes, downloadBytes };
}
