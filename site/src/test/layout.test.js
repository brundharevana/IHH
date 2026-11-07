import { describe, it, expect } from 'vitest';
import { resolveSlot, ROOM_TYPES, HEIGHTS } from '../museum/layout.js';
const room = ROOM_TYPES['chapter-gallery'];
const WALLS = ['north', 'south', 'west', 'east'];
// Facing direction of a frame with rotY (plane normal is +z at rotY 0).
const normal = (rotY) => ({ x: Math.sin(rotY), z: Math.cos(rotY) });
describe('resolveSlot', () => {
  it('places north wall slots inside the room facing south', () => {
    const p = resolveSlot(room, 'north', 1);
    expect(p.z).toBeCloseTo(-room.d / 2 + 0.05);
    expect(p.y).toBeCloseTo(HEIGHTS.frameCentre);
    expect(p.rotY).toBeCloseTo(0);
    expect(Math.abs(p.x)).toBeLessThan(room.w / 2);
  });
  it('spreads four slots evenly and in order along a wall', () => {
    const xs = [1, 2, 3, 4].map(s => resolveSlot(room, 'north', s).x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(xs[1] - xs[0]).toBeCloseTo(xs[3] - xs[2]);
  });
  it('rejects bad walls and slots', () => {
    expect(() => resolveSlot(room, 'up', 1)).toThrow();
    expect(() => resolveSlot(room, 'north', 5)).toThrow();
    expect(() => resolveSlot(room, 'north', 0)).toThrow();
    expect(() => resolveSlot(room, 'north', 1.5)).toThrow();
  });
  describe.each(WALLS)('%s wall', (wall) => {
    const ps = [1, 2, 3, 4].map(s => resolveSlot(room, wall, s));
    it('keeps every slot inside the room bounds at frame height', () => {
      for (const p of ps) {
        expect(Math.abs(p.x)).toBeLessThan(room.w / 2);
        expect(Math.abs(p.z)).toBeLessThan(room.d / 2);
        expect(p.y).toBeCloseTo(HEIGHTS.frameCentre);
      }
    });
    it('faces into the room (toward the room centre)', () => {
      for (const p of ps) {
        const n = normal(p.rotY);
        expect(n.x * -p.x + n.z * -p.z).toBeGreaterThan(0);
      }
    });
    it('orders slots left to right from the visitor view, evenly spaced', () => {
      const n = normal(ps[0].rotY);
      const fwd = { x: -n.x, z: -n.z }; // visitor looks at the wall
      const left = { x: fwd.z, z: -fwd.x };
      const d = ps.map(p => p.x * left.x + p.z * left.z);
      expect(d[0]).toBeGreaterThan(d[1]);
      expect(d[1]).toBeGreaterThan(d[2]);
      expect(d[2]).toBeGreaterThan(d[3]);
      expect(d[0] - d[1]).toBeCloseTo(d[2] - d[3]);
    });
  });
});
