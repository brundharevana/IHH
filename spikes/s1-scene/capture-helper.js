// Spike test harness only (not part of the engine): rasterise the current page with html2canvas and save it through recv.py.
let loaded;
function loadH2C() {
  if (window.html2canvas) return Promise.resolve();
  return (loaded ||= new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.onload = res; s.onerror = () => rej(new Error('html2canvas failed to load')); document.head.append(s);
  }));
}
// While the browser pane is hidden requestAnimationFrame stalls and PSV's render loop never runs: render once by hand and tell the markers plugin.
export async function forceRender() {
  const v = window.__s1 && window.__s1.viewer; if (!v) return false;
  const core = await import('@photo-sphere-viewer/core'); const r = v.renderer;
  r.renderer.render(r.scene, r.camera); v.dispatchEvent(new core.events.RenderEvent()); return true;
}
export async function shot(name, { q = 0.85 } = {}) {
  await loadH2C(); await forceRender();
  // html2canvas cannot read a WebGL canvas reliably: swap each canvas for an <img> of its pixels while capturing
  const swapped = [];
  document.querySelectorAll('canvas.psv-canvas').forEach((c) => {
    const img = new Image(); img.src = c.toDataURL('image/png'); img.style.cssText = c.style.cssText + ';width:' + c.clientWidth + 'px;height:' + c.clientHeight + 'px;display:block;';
    c.after(img); c.style.display = 'none'; swapped.push([c, img]);
  });
  await Promise.all(swapped.map(([, i]) => new Promise((r) => { i.onload = r; i.onerror = r; setTimeout(r, 2000); })));
  // html2canvas has no top layer: pin an open <dialog> at its real rectangle and fake the backdrop
  const dlg = document.querySelector('dialog[open]'); let back, oldStyle;
  if (dlg) {
    const r = dlg.getBoundingClientRect(); oldStyle = dlg.getAttribute('style');
    back = document.createElement('div'); back.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9998'; document.body.append(back);
    dlg.style.cssText = `position:fixed;margin:0;inset:auto;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:9999;display:block`;
  }
  const cv = await window.html2canvas(document.body, { scale: 1, useCORS: true, backgroundColor: getComputedStyle(document.body).backgroundColor, width: innerWidth, height: innerHeight, windowWidth: innerWidth, windowHeight: innerHeight, x: window.scrollX, y: window.scrollY });
  swapped.forEach(([c, i]) => { c.style.display = ''; i.remove(); });
  if (dlg) { back.remove(); if (oldStyle === null) dlg.removeAttribute('style'); else dlg.setAttribute('style', oldStyle); }
  const blob = await new Promise((r) => cv.toBlob(r, 'image/webp', q));
  const resp = await fetch('http://127.0.0.1:8791/save?dest=docs&name=' + name, { method: 'POST', body: blob });
  return { name, w: cv.width, h: cv.height, kb: +(blob.size / 1024).toFixed(1), status: resp.status };
}
