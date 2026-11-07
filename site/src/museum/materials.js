// Shared museum materials. Room textures are CC0 Poly Haven PBR sets (site/public/tex/CREDITS.md),
// loaded per room type and device profile from ROOM_TEXTURES; geometry carries UVs in metres
// (geom.js), so each map repeats at its real-world size. A missing map falls back to a flat colour;
// missing exhibit media to a placeholder card (exhibits.js).

// Real-world size (m) one texture tile covers.
export const TILE_METRES = { parquet: 1.7, planks: 1.7, walnut: 0.7, plaster: 2, linen: 0.5 };
// Factor on each set's ARM roughness. The parquet scan is lacquered (mean roughness ~0.1, a mirror
// under track spots); museum floors are satin-sealed, so it is taken to ~0.5.
export const ROUGHNESS_SCALE = { parquet: 5, planks: 1.3, walnut: 1.3 };
// Per room type: the texture sets it loads and the size (px) of each map, [phone, desktop]. Phone
// sizes are what the phone texture budget is measured with (src/test/rooms-budget.test.js).
export const ROOM_TEXTURES = {
  'chapter-gallery': {
    floor: 'parquet',
    sets: {
      parquet: { color: [512, 1024], normal: [512, 1024], arm: [256, 256] },
      walnut: { color: [256, 512], normal: [256, 512] },
      plaster: { normal: [256, 512] },
      linen: { color: [256, 256], normal: [256, 256] },
    },
  },
  'reconstructed-place': {
    floor: 'planks',
    sets: {
      planks: { color: [512, 1024], normal: [512, 1024], arm: [256, 256] },
      walnut: { color: [512, 1024], normal: [512, 1024], arm: [256, 256] },
      plaster: { normal: [256, 512] },
      linen: { color: [256, 256] },
    },
  },
};
export const roomTextureFile = (set, map, px) => `/tex/${set}/${map}-${px}.webp`;
// [{ set, map, url }] a room loads on this profile.
export function roomTextureList(roomType, { phone }) {
  const spec = ROOM_TEXTURES[roomType];
  if (!spec) return [];
  return Object.entries(spec.sets).flatMap(([set, maps]) =>
    Object.entries(maps).map(([map, px]) => ({ set, map, url: roomTextureFile(set, map, px[phone ? 0 : 1]) })));
}

// Warm grey shell (B5: history museums avoid the white cube), pale ceiling, painted joinery.
export const SHELL = { wall: 0xc4bcb0, ceiling: 0xe4ded4, painted: 0xb3aa9d, plinth: 0xd8d1c5 };

// `textures`: { sets: { <set>: { color, normal, arm } } } of loaded THREE textures (any may be absent).
export async function createMaterials(THREE, textures = {}, { floor = 'parquet' } = {}) {
  const sets = textures.sets || {};
  const tile = (set, map) => {
    const t = sets[set] && sets[set][map];
    if (!t) return null;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / TILE_METRES[set], 1 / TILE_METRES[set]);
    return t;
  };
  // opts: fallback colour without a map, tint over the map, normal strength, roughness without an ARM
  // map, and a factor on the ARM roughness (a matt, waxed floor rather than a mirror under the spots).
  const pbr = (set, { fallback = 0x8a6a46, tint = 0xffffff, normal = 1, flatRoughness = 0.6, roughnessScale = 1 } = {}, params = {}) => {
    const map = tile(set, 'color'), normalMap = tile(set, 'normal'), arm = tile(set, 'arm');
    const m = new THREE.MeshStandardMaterial({ roughness: 1, ...params });
    m.color.set(map ? tint : fallback);
    if (map) m.map = map;
    if (normalMap) { m.normalMap = normalMap; m.normalScale.set(normal, normal); }
    if (arm) { m.roughnessMap = arm; m.aoMap = arm; m.aoMapIntensity = 0.7; m.roughness = roughnessScale; } else m.roughness = flatRoughness;
    return m;
  };

  // Floor: oak parquet (gallery) or plank floor (study), AO baked into vertex colours.
  const floorMat = pbr(floor, { fallback: 0x8a6a46, flatRoughness: 0.6, roughnessScale: ROUGHNESS_SCALE[floor] ?? 1 }, { vertexColors: true });
  floorMat.name = 'floor';
  // Painted plaster walls: flat colour, a faint plaster normal, AO in vertex colours.
  const plasterNormal = tile('plaster', 'normal');
  const painted = (color, name) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, vertexColors: true, side: THREE.FrontSide });
    if (plasterNormal) { m.normalMap = plasterNormal; m.normalScale.set(0.35, 0.35); }
    m.name = name;
    return m;
  };
  const plaster = painted(SHELL.wall, 'plaster');
  const accents = new Map();
  const accent = hex => {
    if (!accents.has(hex)) accents.set(hex, painted(new THREE.Color(hex), 'accent'));
    return accents.get(hex);
  };
  // Walnut: frames and furniture. Lifted dark wood (tools/build_room_textures.py) so it never reads black.
  const frame = pbr('walnut', { fallback: 0x5b4330, flatRoughness: 0.5, normal: 0.6, roughnessScale: ROUGHNESS_SCALE.walnut });
  frame.name = 'walnut';
  // Painted joinery: skirting, plinths, the wall text panel.
  const joinery = new THREE.MeshStandardMaterial({ color: SHELL.painted, roughness: 0.6 });
  joinery.name = 'joinery';
  const plinth = new THREE.MeshStandardMaterial({ color: SHELL.plinth, roughness: 0.55 });
  plinth.name = 'plinth';
  // No surface a visitor sees is near-black (src/test/exhibit-finish.test.js): kraft-paper backing board.
  const backing = new THREE.MeshStandardMaterial({ color: 0xa38f72, roughness: 0.95 });
  backing.name = 'frame-backing';
  // Window mount (passe-partout) around every framed picture.
  const mount = new THREE.MeshStandardMaterial({ color: 0xece5d6, roughness: 0.95 });
  mount.name = 'mount';
  // Ceiling: no light points up at it, so a little self-light keeps it reading as pale plaster, not a void.
  const ceiling = new THREE.MeshStandardMaterial({ color: SHELL.ceiling, emissive: 0x2c2924, roughness: 1, vertexColors: true });
  ceiling.name = 'ceiling';
  // Vitrine glass: thin, clear, reflective (the room's environment map); no transmission (phone cost).
  const glass = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0, depthWrite: false, envMapIntensity: 2.5 });
  glass.name = 'glass';
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a46a, metalness: 1, roughness: 0.32 });
  brass.name = 'brass';
  // Lighting track and fittings: graphite powder coat.
  const fitting = new THREE.MeshStandardMaterial({ color: 0x4a4845, metalness: 0.5, roughness: 0.45 });
  fitting.name = 'fitting';
  const fabric = pbr('linen', { fallback: 0x7d6b58, tint: 0x8a7560, flatRoughness: 0.95, normal: 0.8 });
  fabric.roughness = 0.95; fabric.roughnessMap = null; fabric.aoMap = null;
  fabric.name = 'fabric';
  return { plaster, oak: floorMat, floor: floorMat, accent, frame, walnut: frame, joinery, plinth, backing, mount, ceiling, glass, brass, fitting, fabric };
}
