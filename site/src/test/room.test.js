import { it, expect } from 'vitest';
import * as THREE from 'three';
import { buildRoom } from '../museum/room.js';
import { ROOM_TYPES, resolveSlot } from '../museum/layout.js';

const chapter = {
  id: 'fx-1', room: 'chapter-gallery', accent: '#5a2a2a',
  quotes: [{ id: 'q1', text: 'Imagination is useful.', fact_id: 'F2' }],
  exhibits: [
    { id: 'ex1', number: 1, type: 'framed-document', wall: 'north', slot: 2, media_id: 'M1', title: 'Letter' },
    { id: 'ex2', number: 2, type: 'wall-quote', wall: 'east', slot: 3, quote_id: 'q1', title: 'Quote' },
    { id: 'ex3', number: 3, type: '360-document', wall: 'west', slot: 1, media_id: 'MISSING', title: 'Letter 360' },
  ],
};
const textures = { plaster: null, oak: null, media: { M1: null } };

it('places exhibits at resolveSlot positions', async () => {
  const { scene, exhibitMeshes } = await buildRoom(THREE, chapter, { textures, phone: false });
  const r = ROOM_TYPES['chapter-gallery'];
  for (const ex of chapter.exhibits.slice(0, 2)) {
    const g = exhibitMeshes.get(ex.id), p = resolveSlot(r, ex.wall, ex.slot);
    expect(g).toBeDefined();
    expect(g.position.x).toBeCloseTo(p.x); expect(g.position.y).toBeCloseTo(p.y); expect(g.position.z).toBeCloseTo(p.z);
    expect(g.rotation.y).toBeCloseTo(p.rotY);
    expect(g.userData.exhibitId).toBe(ex.id);
  }
  expect(exhibitMeshes.size).toBe(3);
  expect(scene.children.length).toBeGreaterThan(0);
});

it('uses at most 4 lights and at most 1 shadow, none on phone', async () => {
  for (const phone of [false, true]) {
    const { scene } = await buildRoom(THREE, chapter, { textures, phone });
    const lights = []; scene.traverse(o => { if (o.isLight) lights.push(o); });
    expect(lights.length).toBeLessThanOrEqual(4);
    expect(lights.filter(l => l.castShadow).length).toBe(phone ? 0 : 1);
  }
});

it('does not crash on a missing media texture', async () => {
  const { exhibitMeshes } = await buildRoom(THREE, chapter, { textures, phone: true });
  expect(exhibitMeshes.get('ex3')).toBeDefined();
});

it('reconstructed-place without a valid place is refused, never a fake room', async () => {
  await expect(buildRoom(THREE, { ...chapter, room: 'reconstructed-place' }, { textures, phone: false }))
    .rejects.toThrow(/place must be an object/);
});

it('galleries have no stored viewpoints', async () => {
  expect((await buildRoom(THREE, chapter, { textures, phone: false })).viewpoints).toEqual([]);
});

it('wall-quote renders only the chapter quote, throws without a valid quote_id', async () => {
  const mk = ex => ({ ...chapter, exhibits: [{ id: 'q', number: 1, type: 'wall-quote', wall: 'north', slot: 1, title: 'T', text: 'ungrounded', ...ex }] });
  await expect(buildRoom(THREE, mk({}), { textures, phone: false })).rejects.toThrow(/exhibit q.*quote_id/);
  await expect(buildRoom(THREE, mk({ quote_id: 'zzz' }), { textures, phone: false })).rejects.toThrow(/exhibit q.*zzz/);
  const { exhibitMeshes } = await buildRoom(THREE, mk({ quote_id: 'q1' }), { textures, phone: false });
  expect(exhibitMeshes.get('q').userData.quoteText).toBe('Imagination is useful.');
});

it('rejects the non-canonical "360 document" type', async () => {
  const c = { ...chapter, exhibits: [{ id: 'd', number: 1, type: '360 document', wall: 'north', slot: 1 }] };
  await expect(buildRoom(THREE, c, { textures, phone: false })).rejects.toThrow(/unknown exhibit type/);
});
