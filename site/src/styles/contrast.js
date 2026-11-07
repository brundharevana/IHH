// Text contrast over the glass panels of the dark design system (src/styles/tokens.css). Glass is
// translucent, so what a reader sees depends on what lies behind it: a panel can sit over the
// darkest (black) or the lightest (white) part of a backdrop image, and backdrop blur only averages
// those pixels, so black and white bound every case. Each pair composites its layers over both
// backdrops and needs WCAG 1.4.3 AA (4.5:1) for text on the result. Under
// prefers-reduced-transparency the panels are solid; the same pairs are checked with those values.
// All colours are read from tokens.css, so a token change is checked as written.

// Custom properties declared in the first block whose selector matches `selector` (exactly) inside
// the stylesheet, or inside the @media block whose condition contains `media`.
export function readTokens(css, { selector = ':root', media = null } = {}) {
  let scope = css;
  if (media) {
    const at = css.search(new RegExp(`@media[^{]*${media.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^{]*\\{`));
    if (at < 0) throw new Error(`no @media block with ${media}`);
    scope = css.slice(at).replace(/^@media[^{]*\{/, '');
  } else {
    // Ignore @media blocks when reading the base tokens.
    scope = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  }
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|[}\\s,])${esc}\\s*\\{([^}]*)\\}`).exec(scope);
  if (!m) throw new Error(`no ${selector} block${media ? ` in @media ${media}` : ''}`);
  const out = {};
  for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim();
  return out;
}

// #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(r g b / a), rgb(r, g, b), rgba(r, g, b, a) -> [r, g, b, a].
export function parseColor(s) {
  const t = String(s).trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(t);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad colour ${s}`);
    const n = i => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = /^rgba?\(([^)]*)\)$/.exec(t);
  if (!m) throw new Error(`bad colour ${s}`);
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) throw new Error(`bad colour ${s}`);
  const num = (p, scale) => (p.endsWith('%') ? (parseFloat(p) / 100) * scale : parseFloat(p));
  const [r, g, b] = parts.slice(0, 3).map(p => num(p, 255));
  const a = parts[3] === undefined ? 1 : num(parts[3], 1);
  if (![r, g, b, a].every(Number.isFinite)) throw new Error(`bad colour ${s}`);
  return [r, g, b, a];
}

// Source-over compositing of `top` (with alpha) on an opaque `bottom`.
export const over = (top, bottom) => [0, 1, 2].map(i => top[i] * top[3] + bottom[i] * (1 - top[3])).concat(1);

const lin = c => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
export const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const BACKDROPS = Object.freeze({ darkest: [0, 0, 0, 1], lightest: [255, 255, 255, 1] });
export const AA_TEXT = 4.5;

// What text sits on what: `text` is a token (or a literal colour), `layers` the surfaces under it,
// bottom first. Every pair is a real use on the home page, the timeline, the shared chrome or the
// chapter stage.
export const PAIRS = Object.freeze([
  { name: 'heading and body text on a glass panel', text: '--voa-text', layers: ['--glass-panel'] },
  { name: 'secondary text on a glass panel', text: '--voa-text-2', layers: ['--glass-panel'] },
  { name: 'muted text ("Coming soon", dates) on a glass panel', text: '--voa-text-3', layers: ['--glass-panel'] },
  { name: 'links and source chips on a glass panel', text: '--voa-accent-text', layers: ['--glass-panel'] },
  { name: 'Info button label on a panel', text: '--voa-text', layers: ['--glass-panel', '--glass-fill'] },
  { name: 'Info button label, hovered', text: '--voa-text', layers: ['--glass-panel', '--glass-fill-hover'] },
  { name: 'Explore button label (gradient start)', text: '--voa-on-accent', layers: ['--voa-orange-1'] },
  { name: 'Explore button label (gradient end)', text: '--voa-on-accent', layers: ['--voa-orange-2'] },
  { name: 'hero text on the hero scrim', text: '--voa-text', layers: ['--hero-scrim'] },
  { name: 'hero intro text on the hero scrim', text: '--voa-text-2', layers: ['--hero-scrim'] },
  { name: 'header and footer links on the chrome bar', text: '--voa-text', layers: ['--glass-panel'] },
  // White text on the chapter stage, over whatever the scanned room shows behind it.
  { name: 'drag hint and full-detail pill on the stage', text: '#ffffff', layers: ['--stage-pill'] },
  { name: 'player bar time and labels (top of its gradient)', text: '#ffffff', layers: ['--stage-bar-top'] },
  { name: 'caption lines on the stage', text: '#ffffff', layers: ['--stage-caption'] },
  { name: 'play button, door buttons and story pill on the stage', text: '#ffffff', layers: ['--stage-control'] },
  { name: 'story card on the stage', text: '#ffffff', layers: ['--stage-card'] },
  // Rail numbers over a thumbnail (as bright as the backdrop) and its dimming veil in each state.
  { name: 'rail number on its disc (normal)', text: '#ffffff', layers: ['rgb(0 0 0 / 0.42)', '--stage-rail-num'] },
  { name: 'rail number on its disc (hover)', text: '#ffffff', layers: ['rgb(0 0 0 / 0.42)', '--stage-rail-num'] },
  { name: 'rail number on its disc (lit)', text: '#ffffff', layers: ['rgb(0 0 0 / 0.25)', '--stage-rail-num'] },
]);

const resolve = (tokens, v) => {
  if (!v.startsWith('--')) return parseColor(v);
  if (!(v in tokens)) throw new Error(`token ${v} is not defined`);
  return parseColor(tokens[v]);
};

// -> [{ name, backdrop, ratio, ok }] for every pair over both backdrops.
export function checkPairs(tokens, pairs = PAIRS) {
  const out = [];
  for (const p of pairs) {
    for (const [backdrop, base] of Object.entries(BACKDROPS)) {
      const surface = p.layers.reduce((acc, l) => over(resolve(tokens, l), acc), base);
      const text = over(resolve(tokens, p.text), surface);
      const ratio = contrast(text, surface);
      out.push({ name: p.name, backdrop, ratio, ok: ratio >= AA_TEXT });
    }
  }
  return out;
}
