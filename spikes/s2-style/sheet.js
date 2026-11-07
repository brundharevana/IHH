// S2 spike: compose the comparison sheet and the legibility figure from saved flat previews and results JSON.
import { composeSheet, legibilityFigure } from './figures.js';
const RECV = 'http://127.0.0.1:8792/save';
const logEl = document.getElementById('log'); const log = (...a) => { logEl.textContent += a.join(' ') + '\n'; };
const ORDER = [
  { id: 'clay', letter: 'a', title: 'Clay / architectural maquette', reads: 'My reading: a physical model. Quiet, neutral, plainly constructed. Closest to the "honest reconstruction" register.' },
  { id: 'lowpoly', letter: 'b', title: 'Low-poly, flat-shaded, period palette', reads: 'My reading: an illustration or game environment. Clearly constructed; carries the most colour.' },
  { id: 'toon', letter: 'c', title: 'Toon / cel shading with outlines', reads: 'My reading: a drawing or comic frame. Clearly interpretive; the outlines make it read as drawn, not recorded.' },
  { id: 'duotone', letter: 'd', title: 'Duotone ordered-dither grade (clay base)', reads: 'My reading: a printed reproduction. Shares the photograph\'s tones, so the room could be mistaken for a record unless labelled.' }
];
const img = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; });
const toCanvas = (i) => { const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); return c; };
const toBlob = (c, q) => new Promise((r) => c.toBlob(r, 'image/webp', q));
async function save(name, blob) { const r = await fetch(`${RECV}?dest=docs&name=${name}`, { method: 'POST', body: blob }); if (!r.ok) throw new Error('save ' + name); return r.text(); }
const TW = (await (await fetch('out/timings-warm5.json')).json()).summary;
const items = [], legItems = [];
for (const o of ORDER) {
  const r = await (await fetch(`out/results-${o.id}.json`)).json(); const res = r.result; const runs = r.runs; const c0 = runs[0].timings; const cold = c0.pixelsReadyMs; const warm = TW[o.id].bakeToPixelsMedian;
  const c = toCanvas(await img(`out/${o.id}-flat.webp`));
  items.push({ canvas: c, title: `(${o.letter}) ${o.title}`, sub: [
    `Equirect 4096x2048 WebP q70: ${res.sizes.equirectWebp70KiB} KiB   |   flat 1280x720: ${res.sizes.flatWebp80KiB} KiB   |   bake to pixels ${(warm / 1000).toFixed(2)} s warm (median of 5), ${(cold / 1000).toFixed(2)} s cold   |   ${res.authoredTokens} authored tokens`,
    o.reads] });
  const L = res.legibilityFlat;
  legItems.push({ canvas: c, leg: L, title: `(${o.letter}) ${o.title}`, line: `bare white text: worst ${L.whiteBare.min}:1, ${(L.whiteBare.passAA * 100).toFixed(0)} % of blocks pass 4.5:1   |   bare dark text: worst ${L.inkBare.min}:1, ${(L.inkBare.passAA * 100).toFixed(0)} % pass   |   white on scrim: worst ${L.whiteOnScrim.min}:1` });
}
const sheet = composeSheet(items, {
  header: ['S2 style variants: one illustrative room, one camera, four looks', 'Illustrative reconstruction (spike). Generic stand-in room, not a depiction of a real place. The framed photograph is the same untouched archival image in every tile.'],
  footer: ['Photograph: Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, 1903 (Underwood & Underwood), left frame of a stereograph. Library of Congress Prints and Photographs Division, LC-DIG-ppmsca-36413.', 'Rights advisory on the item record: "No known restrictions on publication." https://www.loc.gov/item/93503130/   |   Props: Poly Haven CC0 (standing_chalkboard_01, wicker_basket_01).']
});
document.getElementById('sheet').src = sheet.toDataURL('image/webp', 0.8);
let q = 0.8, blob = await toBlob(sheet, q); while (blob.size > 1.4e6 && q > 0.5) { q -= 0.05; blob = await toBlob(sheet, q); }
log('sheet', sheet.width + 'x' + sheet.height, 'q' + q.toFixed(2), (blob.size / 1024).toFixed(1) + ' KiB', await save('s2-style-sheet.webp', blob));
const leg = legibilityFigure(legItems); const lb = await toBlob(leg, 0.8); log('legibility', leg.width + 'x' + leg.height, (lb.size / 1024).toFixed(1) + ' KiB', await save('s2-ui-legibility.webp', lb));
window.__sheetDone = true;
