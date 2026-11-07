import { describe, it, expect } from 'vitest';
import { driftOffset, breathZoom, sweepPos, motionState, MAX_SHIFT_PX } from '../ui/portrait.js';

describe('portrait motion maths', () => {
  it('parallax never shifts a pixel more than 6 CSS px', () => {
    expect(MAX_SHIFT_PX).toBe(6);
    for (const w of [240, 480, 900]) {
      const h = w * 800 / 648;
      for (let t = 0; t < 120; t += 0.37) {
        for (const ptr of [[0, 0], [0.5, 0.5], [-0.5, 0.5], [0.5, -0.5]]) {
          const [ox, oy] = driftOffset(t, ptr, w, h);
          // Shader shift = off * (depth - 0.5); |depth - 0.5| <= 0.5.
          const px = Math.hypot(ox * 0.5 * w, oy * 0.5 * h);
          expect(px).toBeLessThanOrEqual(MAX_SHIFT_PX + 1e-9);
        }
      }
    }
  });
  it('parallax actually moves', () => {
    const a = driftOffset(0, [0, 0], 480, 593), b = driftOffset(3, [0, 0], 480, 593);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeGreaterThan(0.001);
  });
  it('breathing zoom stays within 0.6 % either side of its mean and never shows the frame edge', () => {
    let lo = Infinity, hi = -Infinity;
    for (let t = 0; t < 10; t += 0.05) { const z = breathZoom(t); lo = Math.min(lo, z); hi = Math.max(hi, z); }
    expect(lo).toBeGreaterThanOrEqual(1);
    expect(hi - lo).toBeLessThanOrEqual(0.012 + 1e-9);
    expect(hi - lo).toBeGreaterThan(0.01);
  });
  it('light sweep repeats every 14 s', () => {
    expect(sweepPos(1)).toBeCloseTo(sweepPos(15));
  });
});

describe('when the canvas runs', () => {
  const base = { gl: true, motionOn: true, reduced: false, inView: true, pageVisible: true };
  it('runs only when visible, wanted and allowed', () => {
    expect(motionState(base)).toEqual({ showCanvas: true, run: true, showButton: true });
    expect(motionState({ ...base, inView: false }).run).toBe(false);
    expect(motionState({ ...base, pageVisible: false }).run).toBe(false);
    expect(motionState({ ...base, motionOn: false })).toEqual({ showCanvas: false, run: false, showButton: true });
  });
  it('a lost WebGL context falls back to the still image until it is restored', () => {
    expect(motionState({ ...base, lost: true })).toEqual({ showCanvas: false, run: false, showButton: false });
    expect(motionState({ ...base, lost: false })).toEqual({ showCanvas: true, run: true, showButton: true });
  });
  it('reduced motion or no WebGL2 gives the still image and no motion button', () => {
    expect(motionState({ ...base, reduced: true })).toEqual({ showCanvas: false, run: false, showButton: false });
    expect(motionState({ ...base, gl: false })).toEqual({ showCanvas: false, run: false, showButton: false });
  });
});
