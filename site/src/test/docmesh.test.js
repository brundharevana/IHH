import { it, expect } from 'vitest';
import * as THREE from 'three';
import { makeDocumentMesh } from '../museum/docmesh.js';
it('is a thin paper box with front and back materials', () => {
  const m = makeDocumentMesh(THREE, { width: 0.216, height: 0.279, frontTexture: null, backTexture: null });
  m.geometry.computeBoundingBox();
  const s = new THREE.Vector3(); m.geometry.boundingBox.getSize(s);
  expect(s.x).toBeCloseTo(0.216); expect(s.y).toBeCloseTo(0.279); expect(s.z).toBeCloseTo(0.0015);
  expect(m.material.length).toBe(6);
  expect(m.userData.kind).toBe('document');
});
