// Spike test harness only: turn the live viewer to each hotspot's derived yaw/pitch, grab the WebGL canvas, and save a 2x2 figure with the view centre marked.
export async function run(saveName = 's1-hotspot-centering.webp') {
  const v = window.__s1.viewer; const c = document.querySelector('canvas.psv-canvas');
  const frame = (n = 2) => new Promise((res) => { let k = 0; const t = setTimeout(res, 4000); const f = () => { if (++k >= n) { clearTimeout(t); res(); } else requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const hs = [...window.__s1.scene.hotspots].sort((a, b) => a.order - b.order);
  const W = 640, H = 400, HEAD = 40;
  const fig = document.createElement('canvas'); fig.width = W * 2; fig.height = (H + HEAD) * 2;
  const x = fig.getContext('2d'); x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, fig.width, fig.height); x.textBaseline = 'top';
  const out = [];
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i];
    v.rotate({ yaw: (h.derived.yawDeg * Math.PI) / 180, pitch: (h.derived.pitchDeg * Math.PI) / 180 }); await frame(3);
    const p = v.getPosition(); const ox = (i % 2) * W, oy = Math.floor(i / 2) * (H + HEAD);
    const sc = Math.min(W / c.width, H / c.height), dw = c.width * sc, dh = c.height * sc;
    const img = new Image(); img.src = c.toDataURL('image/png'); await img.decode(); // toDataURL reads the drawing buffer; drawImage(canvas) returned blank while the pane was hidden
    x.drawImage(img, ox + (W - dw) / 2, oy + HEAD, dw, dh);
    const cx = ox + W / 2, cy = oy + HEAD + H / 2;
    x.strokeStyle = '#00e5ff'; x.lineWidth = 2; x.beginPath();
    x.moveTo(cx - 20, cy); x.lineTo(cx - 6, cy); x.moveTo(cx + 6, cy); x.lineTo(cx + 20, cy); x.moveTo(cx, cy - 20); x.lineTo(cx, cy - 6); x.moveTo(cx, cy + 6); x.lineTo(cx, cy + 20); x.stroke();
    const yd = (p.yaw * 180) / Math.PI, pd = (p.pitch * 180) / Math.PI;
    x.fillStyle = '#1a1a17'; x.font = 'bold 15px Helvetica, Arial, sans-serif'; x.fillText(`${i + 1}. ${h.label}`, ox + 8, oy + 4);
    x.font = '13px Helvetica, Arial, sans-serif'; x.fillText(`view yaw ${yd.toFixed(1)}, pitch ${pd.toFixed(1)} (descriptor ${h.derived.yawDeg}, ${h.derived.pitchDeg}); cross-hair = view centre`, ox + 8, oy + 22);
    out.push({ id: h.id, viewYaw: +yd.toFixed(2), viewPitch: +pd.toFixed(2), descYaw: h.derived.yawDeg, descPitch: h.derived.pitchDeg });
  }
  const blob = await new Promise((r) => fig.toBlob(r, 'image/webp', 0.85));
  const resp = await fetch('http://127.0.0.1:8791/save?dest=docs&name=' + saveName, { method: 'POST', body: blob });
  return { out, status: resp.status, kb: Math.round(blob.size / 1024), canvas: [c.width, c.height] };
}
