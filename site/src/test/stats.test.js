import { it, expect } from 'vitest';
import * as THREE from 'three';
import { sceneStats } from '../museum/stats.js';
import { makeDocumentMesh } from '../museum/docmesh.js';

it('counts meshes, material groups, triangles, lights and texture memory', () => {
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial())); // 12 triangles, 1 call
  const tex = new THREE.Texture({ width: 512, height: 256 });
  scene.add(makeDocumentMesh(THREE, { width: 0.2, height: 0.3, frontTexture: tex, backTexture: tex })); // 6 groups
  scene.add(new THREE.HemisphereLight(), new THREE.SpotLight());
  const s = sceneStats(scene, { downloadBytes: 1234 });
  expect(s).toEqual({ drawCalls: 7, triangles: 24, lights: 2, textureBytes: Math.round(512 * 256 * 4 * 4 / 3), downloadBytes: 1234 });
});
it('leaves downloadBytes undefined when not measured, so checkBudget fails', () => {
  expect(sceneStats(new THREE.Scene()).downloadBytes).toBeUndefined();
});

import { ENVIRONMENT, environmentBytes } from '../museum/stats.js';
it('environment map memory follows the PMREM layout scene.js uses (3*max(size,112) x 4*size, half-float RGBA)', () => {
  expect(ENVIRONMENT.size).toBe(256);
  expect(environmentBytes()).toBe(768 * 1024 * 8);
  expect(environmentBytes(64)).toBe(336 * 256 * 8);
});
it('counts scene.environment when the room has one', () => {
  const scene = new THREE.Scene();
  scene.environment = { isTexture: true, userData: { pmremSize: 256 } };
  expect(sceneStats(scene, { downloadBytes: 0 }).textureBytes).toBe(environmentBytes(256));
});
it('counts canvas textures (labels, wall quotes) by their canvas size', () => {
  const scene = new THREE.Scene();
  const canvas = { width: 1024, height: 102 };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) })));
  expect(sceneStats(scene, { downloadBytes: 0 }).textureBytes).toBe(Math.round(1024 * 102 * 4 * 4 / 3));
});

// An instanced mesh draws its geometry once per instance: every instance's triangles count.
it('counts the triangles of every instance of an instanced mesh (one draw call)', () => {
  const scene = new THREE.Scene();
  scene.add(new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), 50));
  const s = sceneStats(scene);
  expect(s.triangles).toBe(12 * 50);
  expect(s.drawCalls).toBe(1);
});

it('counts textures held in shader uniforms (hotspot ring numbers)', () => {
  const scene = new THREE.Scene();
  const map = new THREE.Texture({ width: 112, height: 112 });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { map: { value: map }, warm: { value: 0 } } })));
  expect(sceneStats(scene).textureBytes).toBe(Math.round(112 * 112 * 4 * 4 / 3));
});

it('counts a texture without mipmaps at its base level only (the ring digit atlas)', () => {
  const scene = new THREE.Scene();
  const atlas = new THREE.Texture({ width: 400, height: 64 }); atlas.generateMipmaps = false;
  const mipped = new THREE.Texture({ width: 64, height: 64 });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: { atlas: { value: atlas } } })));
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: mipped })));
  expect(sceneStats(scene).textureBytes).toBe(400 * 64 * 4 + Math.round(64 * 64 * 4 * 4 / 3));
});
