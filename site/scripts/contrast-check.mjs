// Contrast check for text on glass (src/styles/contrast.js): every text token over its glass layers,
// composited on the darkest (black) and lightest (white) backdrop, with the default glass and with
// the solid panels of prefers-reduced-transparency. Exits 1 if any pair is under 4.5:1.
// Also the 3D rings' numbers, from the shader's constants (src/museum/ringdigit.js).
// Usage (from site/): node scripts/contrast-check.mjs   (run by the npm prebuild; VOA_TOKENS overrides the file, tests)
import { readFileSync } from 'node:fs';
import { readTokens, checkPairs, AA_TEXT, contrast } from '../src/styles/contrast.js';
import { digitBackgrounds, digitReach, BACKING, DIGIT } from '../src/museum/ringdigit.js';

const css = readFileSync(process.env.VOA_TOKENS || new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const base = readTokens(css);
const modes = { glass: base, 'reduced-transparency': { ...base, ...readTokens(css, { media: 'prefers-reduced-transparency' }) } };
let bad = 0;
for (const [mode, tokens] of Object.entries(modes)) {
  for (const r of checkPairs(tokens)) {
    if (!r.ok) bad++;
    console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.ratio.toFixed(2).padStart(5)}:1  ${mode.padEnd(20)} ${r.backdrop.padEnd(8)} ${r.name}`);
  }
}
// The 3D rings' white numbers (src/museum/rings.js): the shader's own layers, composited from its
// constants (src/museum/ringdigit.js) over black and white, lit and not, at every radius the digits reach.
for (const lit of [0, 1]) for (const [name, bd] of [['darkest', [0, 0, 0]], ['lightest', [255, 255, 255]]]) {
  const ratio = Math.min(...digitBackgrounds([bd]).filter(b => b.lit === lit).map(b => contrast(DIGIT.rgb, b.rgb)));
  const ok = ratio >= AA_TEXT && Math.max(digitReach(1), digitReach(2)) < BACKING.radius;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${ratio.toFixed(2).padStart(5)}:1  ${'shader'.padEnd(20)} ${name.padEnd(8)} ring number${lit ? ' (lit)' : ''} over its backing`);
}
if (bad) { console.error(`contrast-check: ${bad} pair(s) under ${AA_TEXT}:1`); process.exit(1); }
console.log(`contrast-check: every pair at ${AA_TEXT}:1 or more`);
