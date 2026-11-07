// An exhibit hotspot never sits under a stage control (the door buttons, now-showing, the big play
// button, the Close story pill): a covered hotspot cannot be clicked. It moves just clear of the
// control, below it when the stage has room there, else above; when neither fits it is hidden (the
// numbered exhibit list stays its equivalent).
import { it, expect } from 'vitest';
import { clearOfControls } from '../museum/hotspots.js';

const R = 18, GAP = 6;
const overlaps = (p, r) => p.x + R > r.x0 - GAP && p.x - R < r.x1 + GAP && p.y + R > r.y0 - GAP && p.y - R < r.y1 + GAP;

it('leaves a hotspot clear of every control where it is', () => {
  expect(clearOfControls({ x: 300, y: 300 }, [{ x0: 10, x1: 200, y0: 10, y1: 60 }], { w: 800, h: 500, r: R, gap: GAP })).toEqual({ x: 300, y: 300 });
});

it('moves a hotspot under a top control to just below it', () => {
  const nav = { x0: 400, x1: 790, y0: 10, y1: 60 };
  const p = clearOfControls({ x: 500, y: 40 }, [nav], { w: 800, h: 500, r: R, gap: GAP });
  expect(p.x).toBe(500);
  expect(overlaps(p, nav)).toBe(false);
  expect(p.y).toBeCloseTo(60 + GAP + R + 1, 5);
});

it('moves above a control at the foot of the stage, and clears stacked controls', () => {
  const foot = { x0: 0, x1: 800, y0: 440, y1: 490 };
  const p = clearOfControls({ x: 300, y: 470 }, [foot], { w: 800, h: 500, r: R, gap: GAP });
  expect(overlaps(p, foot)).toBe(false);
  expect(p.y).toBeLessThan(440);
  const a = { x0: 0, x1: 800, y0: 10, y1: 60 }, b = { x0: 0, x1: 800, y0: 64, y1: 110 };
  const q = clearOfControls({ x: 300, y: 30 }, [a, b], { w: 800, h: 500, r: R, gap: GAP });
  expect(overlaps(q, a) || overlaps(q, b)).toBe(false);
});

it('returns null when no clear place stays inside the stage', () => {
  expect(clearOfControls({ x: 300, y: 100 }, [{ x0: 0, x1: 800, y0: 0, y1: 200 }], { w: 800, h: 210, r: R, gap: GAP })).toBeNull();
});

// Door pills are wide: the same rule with separate half-width and half-height. With the 75 degree
// lens a door often sits behind the big play button in the middle of the stage.
it('moves a wide door pill just clear of the play button covering it (nearer side first), keeping its column', () => {
  const play = { x0: 556, x1: 644, y0: 214, y1: 302 };
  const q = clearOfControls({ x: 600, y: 250 }, [play], { w: 1200, h: 510, rx: 150, ry: 24, gap: 6 });
  expect(q).toEqual({ x: 600, y: play.y0 - 6 - 24 - 1 }); // above: 67 px away, below would be 83
  expect(clearOfControls({ x: 600, y: 270 }, [play], { w: 1200, h: 510, rx: 150, ry: 24, gap: 6 })).toEqual({ x: 600, y: play.y1 + 6 + 24 + 1 });
  // Too wide for the stage height left below and above: hidden.
  expect(clearOfControls({ x: 600, y: 250 }, [{ x0: 0, x1: 1200, y0: 30, y1: 480 }], { w: 1200, h: 510, rx: 150, ry: 24, gap: 6 })).toBeNull();
});
