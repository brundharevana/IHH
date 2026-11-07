// S1 spike viewer: Photo Sphere Viewer driven by an ihh-scene/1 descriptor, with a parallel DOM hotspot list and a Lite mode.
const params = new URLSearchParams(location.search);
const FORCE_RM = params.get('rm') === '1'; // test hook: pretend prefers-reduced-motion is on
const FORCE_NOGL = params.get('nogl') === '1'; // test hook: pretend WebGL 2 is missing
const FORCE_PANOFAIL = params.get('panofail') === '1'; // test hook: point the panorama at a missing file
const $ = (s) => document.querySelector(s);
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const state = (window.__s1 = { scene: null, viewer: null, markers: null, mode: null, opener: null, timing: {}, events: [] });
const reduced = () => FORCE_RM || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const WINDS = ['north', 'north-northeast', 'northeast', 'east-northeast', 'east', 'east-southeast', 'southeast', 'south-southeast', 'south', 'south-southwest', 'southwest', 'west-southwest', 'west', 'west-northwest', 'northwest', 'north-northwest'];
const compass = (yawDeg) => WINDS[Math.round((((yawDeg % 360) + 360) % 360) / 22.5) % 16];
const dirText = (h) => {
  const p = Math.round(h.derived.pitchDeg);
  const v = Math.abs(p) < 5 ? 'at eye level' : p > 0 ? `looking up ${p} degrees` : `looking down ${-p} degrees`;
  return `${compass(h.derived.yawDeg)}, ${v}`;
};
const say = (msg) => { const el = $('#live'); el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30); state.events.push(['say', msg]); };
const note = (msg) => { $('#mode-note').textContent = msg; };
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage may be blocked */ } } };

function hasWebGL2() {
  if (FORCE_NOGL) return false;
  try { const c = document.createElement('canvas'); const g = c.getContext('webgl2'); if (!g) return false; const l = g.getExtension('WEBGL_lose_context'); if (l) l.loseContext(); return true; } catch { return false; }
}
function initialMode() {
  const q = params.get('mode');
  if (q === 'lite' || q === '3d') return { mode: q, why: 'set by the page address' };
  if (!hasWebGL2()) return { mode: 'lite', why: 'WebGL 2 is not available in this browser', forced: true };
  const saved = store.get('ihh-s1-mode');
  if (saved === 'lite' || saved === '3d') return { mode: saved, why: 'your saved choice' };
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return { mode: 'lite', why: 'Data Saver or a slow connection was detected' };
  return { mode: '3d', why: '' };
}

function renderList() {
  const ul = $('#hs-list'); ul.textContent = '';
  const hs = [...state.scene.hotspots].sort((a, b) => a.order - b.order);
  hs.forEach((h, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs-btn'; b.dataset.id = h.id; b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML = '<span class="num" aria-hidden="true"></span><span class="label"></span><span class="dir"></span>';
    b.querySelector('.num').textContent = String(i + 1);
    b.querySelector('.label').textContent = h.label;
    b.querySelector('.dir').textContent = dirText(h);
    b.setAttribute('aria-label', `${i + 1}. ${h.label}, ${dirText(h)}`);
    b.addEventListener('click', () => activate(h, b));
    const p = document.createElement('p'); p.className = 'hs-desc'; p.textContent = h.description;
    li.append(b, p); ul.append(li);
  });
}

function openDialog(h, opener) {
  const d = $('#dlg'); state.opener = opener || $('#viewer');
  $('#dlg-kicker').textContent = state.scene.evidence.label;
  $('#dlg-title').textContent = h.label;
  $('#dlg-desc').textContent = h.description;
  $('#dlg-dir').textContent = dirText(h);
  $('#dlg-evidence').textContent = state.scene.evidence.summary;
  $('#dlg-facts').textContent = h.fact_ids.length ? h.fact_ids.join(', ') : 'None attached yet (placeholder: fact_ids is empty).';
  $('#dlg-artifact').textContent = h.artifact_id || 'None attached yet (placeholder: artifact_id is empty).';
  if (state.mode === '3d' && window.matchMedia('(max-width: 860px)').matches) $('#viewer-box').scrollIntoView({ block: 'start' }); // narrow screens: keep the turned view above the bottom sheet
  if (!d.open) d.showModal();
  state.events.push(['dialog-open', h.id]);
}

async function activate(h, btn) {
  if (state.mode !== '3d' || !state.viewer) { openDialog(h, btn); return; }
  const target = { yaw: rad(h.derived.yawDeg), pitch: rad(h.derived.pitchDeg) };
  say(`Turning to ${h.label}, ${dirText(h)}.`);
  if (reduced()) { state.viewer.rotate(target); state.events.push(['jump', h.id]); }
  else {
    state.events.push(['animate', h.id]);
    const done = await state.viewer.animate({ ...target, speed: 900 }); // PSV Animation: thenable, resolves true when finished, false when cancelled (no .catch)
    if (done === false) return; // user or another action took over the view; do not open
  }
  try { state.markers.showMarkerTooltip(h.id); } catch { /* marker may be off screen */ }
  openDialog(h, btn);
}

async function ensureViewer() {
  if (state.viewer) return;
  const t0 = performance.now();
  for (const href of ['https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@5.15.1/index.css', 'https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/markers-plugin@5.15.1/index.css']) {
    if (!document.querySelector(`link[href="${href}"]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); }
  }
  const [{ Viewer }, { MarkersPlugin }] = await Promise.all([import('@photo-sphere-viewer/core'), import('@photo-sphere-viewer/markers-plugin')]);
  state.timing.importMs = Math.round(performance.now() - t0);
  const pano = state.scene.render.pano;
  const markers = state.scene.hotspots.map((h, i) => ({
    id: h.id,
    position: { yaw: `${h.derived.yawDeg}deg`, pitch: `${h.derived.pitchDeg}deg` },
    html: `<span class="pin" aria-hidden="true">${[...state.scene.hotspots].sort((a, b) => a.order - b.order).findIndex((x) => x.id === h.id) + 1}</span>`,
    size: { width: 32, height: 32 }, anchor: 'center center',
    tooltip: { content: h.label, position: 'top' }
  }));
  const viewer = new Viewer({
    container: $('#viewer'), panorama: FORCE_PANOFAIL ? pano.src + '.missing' : pano.src, navbar: false, defaultYaw: '0deg', defaultPitch: '0deg', defaultZoomLvl: 40,
    mousewheelCtrlKey: false, touchmoveTwoFingers: false, loadingTxt: 'Loading the 360 view...',
    rendererParameters: { alpha: true, antialias: true, preserveDrawingBuffer: params.get('capture') === '1' },
    plugins: [MarkersPlugin.withConfig({ markers })]
  });
  state.viewer = viewer; state.markers = viewer.getPlugin(MarkersPlugin);
  await new Promise((res, rej) => {
    viewer.addEventListener('ready', res, { once: true });
    viewer.addEventListener('panorama-error', (e) => rej(new Error('the panorama image failed to load')), { once: true });
    setTimeout(() => rej(new Error('panorama did not become ready in 20 s')), 20000);
  });
  state.timing.panoReadyMs = Math.round(performance.now() - t0);
  const mk = viewer.container.querySelector('.psv-markers'); if (mk) mk.setAttribute('aria-hidden', 'true');
  const pc = viewer.container.querySelector('.psv-container'); if (pc) pc.setAttribute('aria-hidden', 'true'); // canvas, loader and hidden panel are visual only; the list is the accessible route
  state.markers.addEventListener('select-marker', ({ marker }) => { const h = state.scene.hotspots.find((x) => x.id === marker.id); if (h) openDialog(h, null); });
  viewer.addEventListener('position-updated', ({ position }) => { $('#pos').textContent = `yaw ${deg(position.yaw).toFixed(0)}, pitch ${deg(position.pitch).toFixed(0)}, zoom ${Math.round(viewer.getZoomLevel())}`; });
  $('#pos').textContent = 'view ready';
}
function destroyViewer() { if (state.viewer) { try { state.viewer.destroy(); } catch { /* ignore */ } state.viewer = null; state.markers = null; } $('#viewer').textContent = ''; }

async function setMode(mode, why, persist) {
  state.mode = mode;
  document.body.classList.toggle('lite', mode === 'lite');
  $('#view3d').hidden = mode === 'lite'; $('#viewlite').hidden = mode !== 'lite';
  $('#lite').checked = mode === 'lite';
  if (persist) store.set('ihh-s1-mode', mode);
  if (mode === 'lite') {
    destroyViewer();
    note('Lite mode is on' + (why ? ': ' + why : '') + '. The 3D viewer is not loaded.');
    return;
  }
  note('Loading the 3D viewer...');
  try { await ensureViewer(); note('3D view is ready.'); }
  catch (e) { state.timing.error = String(e); destroyViewer(); await setMode('lite', '3D could not start (' + (e && e.message ? e.message : e) + ')', false); }
}

let pending = null; // last requested target, so fast key repeats accumulate instead of restarting from the mid-animation position
function nudge(dy, dp) {
  const v = state.viewer; if (!v) return;
  const base = pending || v.getPosition();
  const t = { yaw: base.yaw + rad(dy), pitch: Math.max(-1.45, Math.min(1.45, base.pitch + rad(dp))) };
  if (reduced()) { pending = null; v.rotate(t); return; }
  pending = t;
  v.animate({ ...t, speed: 220 }).then(() => { if (pending === t) pending = null; });
}
function act(a) {
  const v = state.viewer; if (!v) return;
  if (a === 'left') nudge(-15, 0); else if (a === 'right') nudge(15, 0); else if (a === 'up') nudge(0, 10); else if (a === 'down') nudge(0, -10);
  else if (a === 'in') v.zoomIn(10); else if (a === 'out') v.zoomOut(10);
  else if (a === 'reset') { pending = null; if (reduced()) { v.rotate({ yaw: 0, pitch: 0 }); v.zoom(40); } else v.animate({ yaw: 0, pitch: 0, zoom: 40, speed: 600 }); say('View reset to north.'); }
}

function renderCredits() {
  const s = state.scene;
  const rows = s.assets.map((a) => `<tr><td>${a.role}</td><td>${a.provider}: <a href="${a.pageUrl}">${a.id}</a></td><td>${a.licence}</td><td>${a.resolution}, ${(a.declaredBytes / 1024).toFixed(0)} KB</td></tr>`).join('');
  const g = s.gates;
  $('#credits').innerHTML = `<p>${s.evidence.summary}</p>
  <table><thead><tr><th>Used for</th><th>Source</th><th>Licence</th><th>Size</th></tr></thead><tbody>${rows}</tbody></table>
  <p>Build checks run at bake time: handedness ${g.handedness.checks.filter((c) => c.pass).length} of ${g.handedness.checks.length} passed; hotspot-lands-on-its-object ${g.objectId.filter((c) => c.pass).length} of ${g.objectId.length} passed. Baked ${s.render.builder.bakedAt} with ${s.render.builder.engine}.</p>`;
}

async function main() {
  const t0 = performance.now();
  state.scene = await (await fetch('scene.json')).json();
  state.timing.sceneJsonMs = Math.round(performance.now() - t0);
  $('#lite-img').src = state.scene.render.pano.preview;
  renderList(); renderCredits();
  $('#lite').addEventListener('change', (e) => setMode(e.target.checked ? 'lite' : '3d', e.target.checked ? 'chosen by you' : '', true));
  $('.toolbar').addEventListener('click', (e) => { const b = e.target.closest('button[data-act]'); if (b) act(b.dataset.act); });
  $('#viewer').addEventListener('keydown', (e) => {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', Home: 'reset' };
    const a = map[e.key]; if (a) { e.preventDefault(); act(a); }
  });
  const dlg = $('#dlg');
  $('#dlg-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { try { state.markers && state.markers.hideMarkerTooltip(); } catch { /* ignore */ } const o = state.opener; if (o && o.isConnected) o.focus(); state.events.push(['dialog-close', document.activeElement && (document.activeElement.dataset.id || document.activeElement.id)]); });
  const init = initialMode();
  if (init.forced) { $('#lite').disabled = true; }
  await setMode(init.mode, init.why, false);
  state.timing.interactiveMs = Math.round(performance.now() - t0);
  state.ready = true;
}
main().catch((e) => { state.error = String(e && e.stack || e); note('Something went wrong: ' + e); });
