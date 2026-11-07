// The dark glass design system (src/styles/tokens.css; real-scan museum Task 7): Poppins self-hosted
// under the SIL Open Font License with the licence file beside it, no font from another host; every
// text colour on glass at 4.5:1 or more over the darkest and lightest backdrop, also with the solid
// panels of prefers-reduced-transparency.
import { it, expect, describe } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readTokens, parseColor, checkPairs, contrast, PAIRS } from '../styles/contrast.js';

const css = readFileSync('src/styles/tokens.css', 'utf8');
const base = readTokens(css);
const rt = { ...base, ...readTokens(css, { media: 'prefers-reduced-transparency' }) };

describe('fonts', () => {
  it('Poppins 300-700 is self-hosted as WOFF2 with the OFL licence file', () => {
    for (const w of [300, 400, 500, 600, 700]) {
      expect(existsSync(`public/fonts/poppins/poppins-latin-${w}-normal.woff2`), `weight ${w}`).toBe(true);
      const head = readFileSync(`public/fonts/poppins/poppins-latin-${w}-normal.woff2`).subarray(0, 4).toString('latin1');
      expect(head).toBe('wOF2');
      expect(css).toMatch(new RegExp(`font-weight: ${w}; src: url\\(/fonts/poppins/poppins-latin-${w}-normal\\.woff2\\)`));
    }
    const ofl = readFileSync('public/fonts/poppins/OFL.txt', 'utf8');
    expect(ofl).toMatch(/SIL Open Font License, Version 1\.1/);
    expect(ofl).toMatch(/Poppins Project Authors/);
  });
  it('loads no font or stylesheet from another host', () => {
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u.startsWith('/fonts/poppins/'), u).toBe(true);
    expect(css).not.toMatch(/@import|fonts\.googleapis|fonts\.gstatic/);
    for (const f of ['src/layouts/Base.astro', 'src/pages/index.astro']) expect(readFileSync(f, 'utf8')).not.toMatch(/fonts\.googleapis|fonts\.gstatic|https?:\/\/[^"']*\.woff2?/);
  });
  it('the credits page names the typeface and its licence', () => {
    const page = readFileSync('src/pages/how-this-was-made.astro', 'utf8');
    expect(page).toMatch(/Poppins/);
    expect(page).toMatch(/SIL Open Font License 1\.1/);
    expect(page).toMatch(/\/fonts\/poppins\/OFL\.txt/);
  });
});

describe('contrast over glass', () => {
  it('parses the colour forms the tokens use', () => {
    expect(parseColor('#0b0f15')).toEqual([11, 15, 21, 1]);
    expect(parseColor('rgb(255 255 255 / .14)')).toEqual([255, 255, 255, 0.14]);
    expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(contrast([255, 255, 255], [0, 0, 0])).toBeCloseTo(21, 5);
  });
  it('every text token on glass passes 4.5:1 over the darkest and the lightest backdrop', () => {
    const r = checkPairs(base);
    expect(r).toHaveLength(PAIRS.length * 2);
    expect(r.filter(x => !x.ok)).toEqual([]);
  });
  it('and with the solid panels of prefers-reduced-transparency', () => {
    expect(checkPairs(rt).filter(x => !x.ok)).toEqual([]);
  });
  it('the check catches a panel too clear for white text over a light backdrop', () => {
    const r = checkPairs({ ...base, '--glass-panel': 'rgb(255 255 255 / .12)' });
    expect(r.some(x => !x.ok && x.backdrop === 'lightest')).toBe(true);
  });
  it('reduced transparency makes every glass surface solid and drops the blur', () => {
    expect(rt['--glass-blur']).toBe('none');
    for (const t of ['--glass-panel', '--glass-fill', '--glass-fill-hover', '--hero-scrim']) expect(parseColor(rt[t])[3], t).toBe(1);
    expect(parseColor(base['--glass-panel'])[3]).toBeLessThan(1); // glass by default
  });
  it('the contrast script prints every pair and exits 0', () => {
    const r = spawnSync(process.execPath, ['scripts/contrast-check.mjs'], { encoding: 'utf8' });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/lightest/);
  });
});

// Codex gate 2026-10-14. Rule: white text on a see-through fill over the 3D stage takes its fill from a
// --stage-* token, so the contrast check (PAIRS) sees it over a white backdrop; no literal translucent
// fill under white text in ChapterRoom.astro.
describe('stage text fills are checked tokens', () => {
  it('no white-text rule on the chapter stage uses a literal translucent background', () => {
    const src = readFileSync(new URL('../components/ChapterRoom.astro', import.meta.url), 'utf8');
    const translucent = /#[0-9a-f]{8}\b|#[0-9a-f]{4}\b|rgba?\([^)]*\/\s*[\d.]+\s*\)|rgba\(/i;
    const offenders = [...src.matchAll(/(\.voa-chapter [^{]+)\{([^}]*)\}/g)]
      .filter(([, , body]) => /(^|[;\s])color:\s*#fff(fff)?\b/i.test(body))
      .filter(([, , body]) => { const bg = (body.match(/background:\s*([^;]+);?/) || [])[1] || ''; return translucent.test(bg); })
      .map(([, sel]) => sel.trim());
    expect(offenders).toEqual([]);
    for (const t of ['--stage-pill', '--stage-bar-top', '--stage-caption', '--stage-control', '--stage-card']) {
      expect(PAIRS.some(p => p.layers.includes(t)), t).toBe(true);
    }
  });
});

// Codex gate round 2. Rule: a rail number is white on its own solid dark disc, in every state (normal,
// hover, lit), whatever the thumbnail behind it; the lit state shows by the ring and border, never by
// washing out the number. The disc colour is a checked token (contrast gate PAIRS).
describe('rail numbers', () => {
  const src = readFileSync(new URL('../components/ChapterRoom.astro', import.meta.url), 'utf8');
  const rules = [...src.matchAll(/(\.voa-chapter [^{]+)\{([^}]*)\}/g)].map(([, sel, body]) => [sel.trim(), body]);
  it('sit on a solid --stage-rail-num disc, checked over the brightest thumbnail in every state', () => {
    const num = rules.filter(([sel]) => /\.rail-num\b/.test(sel));
    const base = num.find(([sel]) => sel === '.voa-chapter .rail-num');
    expect(base, 'a .rail-num rule').toBeTruthy();
    expect(base[1]).toMatch(/background:\s*var\(--stage-rail-num\)/);
    expect(base[1]).toMatch(/border-radius:\s*50%/);
    expect(base[1]).toMatch(/color:\s*#fff\b/);
    expect(parseColor(base_tokens()['--stage-rail-num'])[3], 'the disc is opaque').toBe(1);
    // No state rule changes the number's colour, backing or opacity.
    for (const [sel, body] of num.filter(r => r !== base)) expect(body, sel).not.toMatch(/background|opacity|(^|[;\s])color:/);
    for (const [sel, body] of rules.filter(([s]) => /\.rail-btn[^{]*(:hover|is-hover|is-active)/.test(s))) expect(body, sel).not.toMatch(/opacity/);
    for (const state of ['normal', 'hover', 'lit']) {
      const pair = PAIRS.find(p => p.name === `rail number on its disc (${state})`);
      expect(pair, state).toBeTruthy();
      expect(pair.layers).toContain('--stage-rail-num');
    }
  });
});
function base_tokens() { return readTokens(readFileSync('src/styles/tokens.css', 'utf8')); }

// Codex gate round 3. Rule: a 3D ring's white number is drawn on an opaque dark backing that reaches
// past the digits, so it reads at 4.5:1 or more over any background in every state; the gate composites
// the shader's own constants (src/museum/ringdigit.js) over black and white.
import { digitBackgrounds, digitReach, BACKING, DIGIT } from '../museum/ringdigit.js';
describe('ring digits', () => {
  it('white digits over the composited ring layers reach 4.5:1 over black and white, lit or not', () => {
    const worst = Math.min(...digitBackgrounds().map(b => contrast(DIGIT.rgb, b.rgb)));
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });
  it('the backing reaches past both one- and two-digit numbers, and the shader uses these constants', () => {
    expect(Math.max(digitReach(1), digitReach(2))).toBeLessThan(BACKING.radius);
    const src = readFileSync(new URL('../museum/rings.js', import.meta.url), 'utf8');
    expect(src).toMatch(/BACKING/);
    expect(src).toMatch(/DIGIT\.h/);
  });
});
