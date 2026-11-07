// Thin paper box (1.5 mm) with front/back faces mapped; also exported to GLB for <model-viewer>.
// BoxGeometry material order: +x, -x, +y, -y, +z (front), -z (back).
export function makeDocumentMesh(THREE, { width, height, frontTexture, backTexture }) {
  const geo = new THREE.BoxGeometry(width, height, 0.0015);
  const edge = new THREE.MeshStandardMaterial({ color: 0xe9e2d0, roughness: 0.9 });
  const face = t => new THREE.MeshStandardMaterial({ map: t || null, color: t ? 0xffffff : 0xf3eee2, roughness: 0.85 });
  const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, face(frontTexture), face(backTexture)]);
  mesh.userData.kind = 'document';
  return mesh;
}
