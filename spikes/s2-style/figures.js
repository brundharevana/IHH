// S2 spike: figure composition (comparison sheet, seam crops, legibility overlay). Harness code, not part of any engine.
const FONT = 'Helvetica, Arial, sans-serif';
const INK = '#1a1a17', PAPER = '#f3f1ec';

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function text(ctx, s, x, y, { size = 16, weight = 'normal', color = INK, font = FONT, align = 'left' } = {}) { ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillText(s, x, y); }

// 2x2 comparison sheet of flat previews. items: [{ canvas, title, sub }]
export function composeSheet(items, { header, footer }) {
  const TW = 1280, TH = 720, LAB = 88, HEAD = 84, FOOT = 64;
  const c = mk(TW * 2, HEAD + 2 * (TH + LAB) + FOOT); const x = c.getContext('2d');
  x.fillStyle = PAPER; x.fillRect(0, 0, c.width, c.height);
  text(x, header[0], 24, 14, { size: 26, weight: 'bold' }); text(x, header[1], 24, 50, { size: 17, color: '#4a4a44' });
  items.forEach((it, i) => {
    const ox = (i % 2) * TW, oy = HEAD + Math.floor(i / 2) * (TH + LAB);
    x.drawImage(it.canvas, ox, oy, TW, TH);
    text(x, it.title, ox + 24, oy + TH + 10, { size: 25, weight: 'bold' });
    it.sub.forEach((line, k) => text(x, line, ox + 24, oy + TH + 44 + k * 21, { size: 16, color: '#4a4a44' }));
  });
  text(x, footer[0], 24, c.height - FOOT + 8, { size: 15, color: '#4a4a44' }); text(x, footer[1], 24, c.height - FOOT + 32, { size: 15, color: '#4a4a44' });
  return c;
}

// seam crops: 4 windows of the raw equirect around cube-face borders, nearest-neighbour 2x, cyan ticks in the gutter where the face changes (no overlay on the pixels)
export const SEAM_SITES = [
  { name: 'A  yaw +45, pitch +6 (vertical border, eye level)', yaw: 45, pitch: 6 },
  { name: 'B  yaw -135, pitch +12 (vertical border)', yaw: -135, pitch: 12 },
  { name: 'C  yaw 0, pitch +45 (top/side border)', yaw: 0, pitch: 45 },
  { name: 'D  yaw +45, pitch +35 (corner of three faces)', yaw: 45, pitch: 35.3 }
];
export function seamCrops(buf, W, H, face, label) {
  const CW = 288, CH = 216, S = 2, G = 8, LAB = 22;
  const out = mk(2 * (CW * S + G) + G, 2 * (CH * S + G + LAB) + G + 30); const x = out.getContext('2d'); x.fillStyle = PAPER; x.fillRect(0, 0, out.width, out.height);
  text(x, label, G, 6, { size: 15, weight: 'bold' });
  SEAM_SITES.forEach((s, i) => {
    const cx = Math.round(((s.yaw + 180) / 360) * W), cy = Math.round((0.5 - s.pitch / 180) * H);
    const x0 = Math.min(W - CW, Math.max(0, cx - CW / 2)), y0 = Math.min(H - CH, Math.max(0, cy - CH / 2));
    const ox = G + (i % 2) * (CW * S + G), oy = 30 + G + Math.floor(i / 2) * (CH * S + G + LAB);
    const tmp = mk(CW, CH); const t = tmp.getContext('2d'); const id = t.createImageData(CW, CH);
    for (let yy = 0; yy < CH; yy++) for (let xx = 0; xx < CW; xx++) { const si = ((y0 + yy) * W + x0 + xx) * 4, di = (yy * CW + xx) * 4; id.data[di] = buf[si]; id.data[di + 1] = buf[si + 1]; id.data[di + 2] = buf[si + 2]; id.data[di + 3] = 255; }
    t.putImageData(id, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(tmp, ox, oy + LAB, CW * S, CH * S);
    text(x, s.name, ox, oy + 2, { size: 13 });
    x.fillStyle = '#00a6d6';
    for (let xx = 0; xx < CW - 1; xx++) { // ticks on the top and bottom edge where the face changes
      if (face[y0 * W + x0 + xx] !== face[y0 * W + x0 + xx + 1]) x.fillRect(ox + (xx + 1) * S - 1, oy + LAB - 7, 3, 6);
      if (face[(y0 + CH - 1) * W + x0 + xx] !== face[(y0 + CH - 1) * W + x0 + xx + 1]) x.fillRect(ox + (xx + 1) * S - 1, oy + LAB + CH * S + 1, 3, 6);
    }
    for (let yy = 0; yy < CH - 1; yy++) { // ticks on the left edge
      if (face[(y0 + yy) * W + x0] !== face[(y0 + yy + 1) * W + x0]) x.fillRect(ox - 7, oy + LAB + (yy + 1) * S - 1, 6, 3);
      if (face[(y0 + yy) * W + x0 + CW - 1] !== face[(y0 + yy + 1) * W + x0 + CW - 1]) x.fillRect(ox + CW * S + 1, oy + LAB + (yy + 1) * S - 1, 6, 3);
    }
  });
  return out;
}

// legibility figure: sample overlay text placed on each style's worst-case blocks (flat preview coordinates)
export function legibilityFigure(items) {
  const TW = 960, TH = 540, LAB = 54, HEAD = 40;
  const c = mk(TW * 2, HEAD + 2 * (TH + LAB)); const x = c.getContext('2d'); x.fillStyle = PAPER; x.fillRect(0, 0, c.width, c.height);
  text(x, 'Overlay text on each style (flat previews at 75 %). Boxes mark the measured worst-case 160x40 blocks. White text bare, dark text bare, white text on a 72 % dark scrim.', 16, 12, { size: 16, weight: 'bold' });
  items.forEach((it, i) => {
    const ox = (i % 2) * TW, oy = HEAD + Math.floor(i / 2) * (TH + LAB); const k = 0.75;
    x.drawImage(it.canvas, ox, oy, TW, TH);
    const L = it.leg;
    const place = (blk, label, fg, scrim, ratio) => {
      const bx = ox + blk.x * k, by = oy + blk.y * k, bw = 160 * k, bh = 40 * k;
      x.strokeStyle = '#ff2bd6'; x.lineWidth = 2; x.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
      const tx = Math.min(bx, ox + TW - 330), ty = by + bh + 4;
      if (scrim) { x.fillStyle = 'rgba(18,16,14,0.72)'; x.fillRect(tx - 6, ty - 3, 324, 24); }
      text(x, `${label} ${ratio}:1`, tx, ty, { size: 17, weight: 'bold', color: fg });
    };
    place(L.worstWhite, 'White text, bare', '#ffffff', false, L.worstWhite.c.toFixed(2));
    place(L.worstInk, 'Dark text, bare', '#1a1a17', false, L.worstInk.c.toFixed(2));
    const sb = { x: Math.min(L.worstWhite.x, 1100), y: Math.min(L.worstWhite.y + 70, 650) };
    const tx = ox + sb.x * k, ty = oy + sb.y * k; x.fillStyle = 'rgba(18,16,14,0.72)'; x.fillRect(Math.min(tx, ox + TW - 330) - 6, ty - 3, 324, 24);
    text(x, `White text on scrim ${L.worstWhite.scrim.toFixed(2)}:1`, Math.min(tx, ox + TW - 330), ty, { size: 17, weight: 'bold', color: '#ffffff' });
    text(x, it.title, ox + 12, oy + TH + 8, { size: 20, weight: 'bold' });
    text(x, it.line, ox + 12, oy + TH + 33, { size: 14, color: '#4a4a44' });
  });
  return c;
}

// viewed-through-a-sphere-viewer figure: same camera, crop of (a) direct render, (b) baked equirect (lossless) viewed, (c) baked equirect as WebP q70 viewed. 2x nearest-neighbour.
export function viewedFigure(title, bufs, W, H, region = { x: 880, y: 250, w: 256, h: 144 }) {
  const S = 2, G = 8, LAB = 24; const cw = region.w * S, ch = region.h * S;
  const c = mk(3 * cw + 4 * G, ch + LAB + 36 + G); const x = c.getContext('2d'); x.fillStyle = PAPER; x.fillRect(0, 0, c.width, c.height);
  text(x, title, G, 6, { size: 15, weight: 'bold' });
  ['direct render at this camera (what a runtime effect would show)', 'baked equirect, lossless, viewed with bilinear sampling', 'baked equirect saved as WebP q70, viewed'].forEach((lab, i) => {
    const ox = G + i * (cw + G), oy = 30; text(x, lab, ox, oy, { size: 12 });
    const tmp = mk(region.w, region.h); const t = tmp.getContext('2d'); const id = t.createImageData(region.w, region.h); const b = bufs[i];
    for (let yy = 0; yy < region.h; yy++) for (let xx = 0; xx < region.w; xx++) { const si = ((region.y + yy) * W + region.x + xx) * 4, di = (yy * region.w + xx) * 4; id.data[di] = b[si]; id.data[di + 1] = b[si + 1]; id.data[di + 2] = b[si + 2]; id.data[di + 3] = 255; }
    t.putImageData(id, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(tmp, ox, oy + LAB - 4, cw, ch);
  });
  return c;
}
