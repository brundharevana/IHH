// The ring's number and what lies behind it (Codex gate round 3), shared by the fragment shader in
// rings.js and the contrast gate (scripts/contrast-check.mjs): the same constants and the same layer
// stack, so the gate checks what the shader draws. Radii are shares of the ring plane's half-size.
//   disc   translucent pale fill to 0.84, alpha 0.18 (centre) to 0.36 (edge), x (1 + 0.9 lit)
//   halo   0.76-1.0 (zero inside 0.76), band 0.88-0.92 (zero inside 0.88)
//   BACKING an opaque dark disc to BACKING.radius, under the digits
//   digits white, DIGIT.h (one digit) or DIGIT.h2 (two) of the plane high, cell aspect 40:64
export const BACKING = Object.freeze({ rgb: [31, 29, 26], alpha: 1, radius: 0.6 });
export const DIGIT = Object.freeze({ h: 0.36, h2: 0.30, cellAspect: 40 / 64, rgb: [255, 255, 255] });
export const DISC_IDLE = [255, 248, 238];

// Farthest point of the digits from the centre, as a share of the half-size (one or two digits).
export function digitReach(count) {
  const h = count > 1 ? DIGIT.h2 : DIGIT.h, w = h * DIGIT.cellAspect * count;
  return 2 * Math.hypot(w / 2, h / 2);
}

// Source-over in the shader's non-premultiplied form.
const over = (top, under) => {
  const a = top[3] + under[3] * (1 - top[3]);
  const c = [0, 1, 2].map(i => (top[i] * top[3] + under[i] * under[3] * (1 - top[3])) / Math.max(a, 1e-4));
  return [...c, a];
};
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// What is drawn behind the digits at radius d (no anti-aliasing), composited over `backdrop` [r, g, b]
// as the blend does (rgb * a + backdrop * (1 - a)). lit, warm in [0, 1].
export function behindDigits(d, backdrop, { lit = 0 } = {}) {
  let col = [0, 0, 0, 0];
  const disc = (d < 0.84 ? 1 : 0) * (0.18 + (0.36 - 0.18) * Math.min(1, d / 0.84)) * (1 + 0.9 * lit);
  col = over([...DISC_IDLE, Math.min(1, disc)], col);
  const halo = smooth(0.76, 0.88, d) * (1 - smooth(0.92, 1.0, d)) * (0.4 + 0.45 * lit + 0.15);
  col = over([...DISC_IDLE, halo], col);
  col = over([...BACKING.rgb, BACKING.alpha * (d < BACKING.radius ? 1 : 0)], col);
  return [0, 1, 2].map(i => col[i] * col[3] + backdrop[i] * (1 - col[3]));
}

// The worst background under the digits over the given backdrops, for every state.
export function digitBackgrounds(backdrops = [[0, 0, 0], [255, 255, 255]]) {
  const out = [];
  const reach = Math.max(digitReach(1), digitReach(2));
  for (const lit of [0, 1]) for (const backdrop of backdrops) for (let d = 0; d <= reach + 1e-9; d += 0.01) {
    out.push({ lit, backdrop, d, rgb: behindDigits(d, backdrop, { lit }) });
  }
  return out;
}
