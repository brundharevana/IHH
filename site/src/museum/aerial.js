// Aerial zoom on the journey globe: from the globe down to the place a stop names, through a stack
// of images (tools/build_aerials.py: site/public/aerial/<slug>/<stop>/, six levels widest first:
// 300 km and 60 km from NASA Blue Marble, then present-day aerial images at 10 km, 2 km, 300 m and
// the building, street names on the two closest), and back out again.
//
// Depth follows the manifest's "precision" (derived at build time from what the verified fact names,
// tools/content_check.py aerial_precision): 'building' ends on the closest level with a ring on the
// building; 'city' ends at the neighbourhood (2 km) with "Approximate location: <place>" and no ring,
// and the closer levels are never loaded.
//
// API (createAerial returns it; Task 4's story mode chains stops with it):
//   chain()                 starts a new visitor action: clears a Skip from the previous one. One
//                           Skip then ends every step of the current action (zoom out, arc, zoom in).
//   zoomIn(stopId)          -> Promise<'arrived' | 'failed' | 'none' | 'cancelled'>
//       turns the globe to the stop and dollies down (about 4 s) while the levels cross-fade in,
//       ending with the "Present-day aerial view" label and the credits. 'none': the stop has no
//       stack; 'failed': no level loaded (the camera is back over the globe).
//   zoomOut()               -> Promise<'globe' | 'cancelled'>
//       dollies back up to the globe and frees the stack's textures.
//   flyAlongArc(fromId, toId) -> Promise<'arrived' | 'cancelled'>
//       flies along the great circle from one pin to the next at globe distance.
//   placeOver(stopId)       -> boolean: puts the camera straight over the stop's pin at globe distance,
//                           at once, without loading its stack (story mode starts a globe trip there).
//   skip()                  jumps the running sequence (and the rest of the chain) to its end.
//   abort()                 drops everything and gives the camera back (WebGL context lost).
//   state(), current(), precision()
//       'idle' | 'loading' | 'zooming' | 'arrived' | 'leaving' | 'flying'; the stop shown; its precision.
// A sequence started while another runs supersedes it (the older promise resolves 'cancelled').
// The stage carries data-aerial="<state>", data-aerial-level="<closest level shown>" and
// data-aerial-precision="building|city".
//
// Rules: a stack loads only when its stop is chosen and its textures are disposed on zoom-out.
// Reduced motion: no camera moves, a short fade straight to the end view. A level that fails to
// load stays hidden and the view ends on the closest level that did load; if none did, the camera
// returns to the globe ('failed') so the caller can show the stop card: never a black stage.
// The images are present-day and labelled so; they make no claim about the inductee's time.
import {
  ZOOM_MS, OUT_MS, FADE_MS, FILL, quadSize, altitudeOf, distanceOf, ease, logLerp, zoomPose, arcPose, arcMs,
  viewSpan, fitAltitude, levelOpacities, deepestLevel, creditText, endLevel,
} from './aerial-plan.js';

const LOAD_WAIT_MS = 6000;   // how long the end of a zoom waits for levels still loading
const SETTLE_MS = 700;       // move to the closest level that loaded, when the planned one failed
const LEVEL_FADE_MS = 450;   // a level that arrives late fades in
const FEATHER = [0.22, 0.18, 0.16, 0.12, 0.12, 0.1]; // soft edge of each level's image (share of its side)
const FOG_EXTENTS = [1000, 20000]; // levels checked for a no-data fill: the city and neighbourhood aerial images
const SEQUENCE = new Set(['loading', 'zooming', 'leaving', 'flying']);
const END = 'arrived';

const VERTEX = `varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Image (or label overlay) with a soft square edge. Where the source has no data (fogMap, see
// noDataMask) the image turns to a pale haze that lightens away from the centre, so the gap reads
// as fog rather than a flat slab.
const FRAGMENT = `uniform sampler2D map; uniform sampler2D fogMap; uniform float hasFog; uniform float opacity; uniform float feather; uniform float radial;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv);
    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float a = feather > 0.0 ? smoothstep(0.0, feather, e) : 1.0;
    // A round soft edge as well, so a level arriving in the middle of the view blends in as a soft
    // patch, not a square; wide on the levels the zoom passes through, narrow on the end level.
    if (feather > 0.05) a *= 1.0 - smoothstep(radial, 0.5, distance(vUv, vec2(0.5)));
    if (hasFog > 0.5) {
      float f = texture2D(fogMap, vUv).r;
      float r = smoothstep(0.05, 0.75, distance(vUv, vec2(0.5)));
      vec3 fog = pow(mix(vec3(0.66, 0.70, 0.73), vec3(0.83, 0.85, 0.87), r), vec3(2.2));
      c.rgb = mix(c.rgb, fog, f * 0.94);
      a *= 1.0 - f * r * 0.55;
    }
    gl_FragColor = vec4(c.rgb, c.a * a * opacity);
    #include <colorspace_fragment>
  }`;

// No-data area of an aerial image (a flat fill where the source has no imagery, e.g. LGL-BW stops
// at the Bavarian border on the Danube): the most common colour, when it covers over 6 % of the
// image and touches its edge, flood-filled from the edge so lone pixels of that colour elsewhere
// stay. Returns a soft-edged mask canvas (white = no data) or null. Runs on a 256 px copy.
export function noDataMask(img, doc = document) {
  const N = 256, c = doc.createElement('canvas');
  c.width = N; c.height = N;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(img, 0, 0, N, N);
  let data;
  try { data = g.getImageData(0, 0, N, N).data; } catch { return null; }
  const key = i => ((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2);
  const count = new Map();
  for (let i = 0; i < data.length; i += 4) { const k = key(i); count.set(k, (count.get(k) || 0) + 1); }
  let best = -1, n = 0;
  for (const [k, v] of count) if (v > n) { best = k; n = v; }
  if (n < N * N * 0.06) return null;
  const r0 = ((best >> 12) & 63) * 4 + 2, g0 = ((best >> 6) & 63) * 4 + 2, b0 = (best & 63) * 4 + 2;
  const flat = p => Math.abs(data[p * 4] - r0) <= 6 && Math.abs(data[p * 4 + 1] - g0) <= 6 && Math.abs(data[p * 4 + 2] - b0) <= 6;
  const mask = new Uint8Array(N * N), stack = [];
  for (let i = 0; i < N; i++) for (const p of [i, (N - 1) * N + i, i * N, i * N + N - 1]) if (!mask[p] && flat(p)) { mask[p] = 1; stack.push(p); }
  if (!stack.length) return null;
  while (stack.length) {
    const p = stack.pop(), x = p % N, y = (p - x) / N;
    for (const q of [x > 0 ? p - 1 : -1, x < N - 1 ? p + 1 : -1, y > 0 ? p - N : -1, y < N - 1 ? p + N : -1]) {
      if (q >= 0 && !mask[q] && flat(q)) { mask[q] = 1; stack.push(q); }
    }
  }
  const out = g.createImageData(N, N);
  for (let p = 0; p < N * N; p++) { const v = mask[p] ? 255 : 0; out.data.set([v, v, v, 255], p * 4); }
  g.putImageData(out, 0, 0);
  // Soften the boundary: blur a copy back in.
  const soft = doc.createElement('canvas');
  soft.width = N; soft.height = N;
  const s = soft.getContext('2d');
  s.filter = 'blur(5px)';
  s.drawImage(c, 0, 0);
  return soft;
}

export function createAerial({ host, stage, stops, ui, reduced = () => false }) {
  const { THREE, scene, camera } = host;
  const byId = new Map(stops.map(s => [s.id, s]));
  const plane = new THREE.PlaneGeometry(1, 1);
  let state = 'idle', stack = null, seq = 0, skipped = 0, chainSkipped = false, settling = null, onChange = () => {};

  // ---- DOM: Skip, Back to the globe, label and credits, Enter the room, the building marker.
  const setState = s => {
    state = s;
    stage.dataset.aerial = s;
    ui.skip.hidden = !SEQUENCE.has(s);
    ui.back.hidden = s !== END;
    const room = s === END && stack && byId.get(stack.id).room;
    ui.enter.hidden = !room;
    if (room) { ui.enter.href = room.href; ui.enter.textContent = room.text; }
    if (s === 'idle') { delete stage.dataset.aerialLevel; delete stage.dataset.aerialPrecision; ui.mark.hidden = true; ui.caption.hidden = true; }
    else update();
    onChange(s);
  };
  const showCredits = (s, m, precision, shownLevels) => {
    ui.place.textContent = precision === 'building' ? s.label : `Approximate location: ${s.label}`;
    ui.credits.replaceChildren();
    // Credit only what is shown: the street-name source only when a labelled level is loaded.
    const labelled = shownLevels.some(lv => lv.labels);
    (m.credits || []).filter(cr => cr.source !== 'osm' || labelled).forEach((cr, i) => {
      if (i) ui.credits.append('; ');
      ui.credits.append(cr.source === 'osm' ? 'Street names: ' : 'Imagery: ');
      const a = document.createElement('a');
      a.href = /^https?:\/\//.test(String(cr.url)) ? cr.url : '#';
      a.textContent = creditText(cr.text);
      ui.credits.append(a, ` (${cr.licence})`);
    });
  };

  // ---- Stack: manifest, one quad per level image and label overlay, on the tangent plane at the pin.
  function material(tex, feather, fog = null, radial = 0.43) {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX, fragmentShader: FRAGMENT,
      uniforms: { map: { value: tex }, fogMap: { value: fog }, hasFog: { value: fog ? 1 : 0 }, opacity: { value: 0 },
        feather: { value: feather }, radial: { value: radial } },
      transparent: true, depthTest: false, depthWrite: false,
    });
  }
  function loadTexture(url) {
    return new THREE.TextureLoader().loadAsync(url).then(t => { t.colorSpace = THREE.SRGBColorSpace; return t; });
  }
  async function loadStack(s) {
    const url = new URL(s.aerial, location.href);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`aerial manifest ${res.status}`);
    const m = await res.json();
    if (!Array.isArray(m.levels) || !m.levels.length) throw new Error('aerial manifest has no levels');
    const precision = m.precision === 'building' ? 'building' : 'city';
    // Only the levels this stop's precision shows are loaded.
    const shown = m.levels.slice(0, endLevel(m.levels.map(lv => Number(lv.extent_m)), precision) + 1);
    const dir = host.dirOf(s.id);
    const n = new THREE.Vector3(...dir), east = new THREE.Vector3(0, 1, 0).cross(n).normalize(), north = n.clone().cross(east);
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    group.matrix.makeBasis(east, north, n).setPosition(n);
    group.matrixWorldNeedsUpdate = true;
    scene.add(group);
    const st = { id: s.id, dir, manifest: m, precision, shown, group, levels: [], disposed: false };
    st.levels = shown.map((lv, i) => {
      const L = { extent: Number(lv.extent_m), hasLabels: Boolean(lv.labels), ok: null, labelOk: false, at: 0, img: null, lbl: null, textures: [] };
      const size = quadSize(L.extent);
      const keep = t => { if (st.disposed) { t.dispose(); return null; } L.textures.push(t); return t; };
      L.loaded = loadTexture(new URL(lv.file, url).href).then(tex => {
        if (!keep(tex)) return;
        let fog = null;
        if (L.extent >= FOG_EXTENTS[0] && L.extent <= FOG_EXTENTS[1] && tex.image) {
          const mask = noDataMask(tex.image);
          if (mask) { fog = keep(new THREE.CanvasTexture(mask)); }
        }
        const feather = FEATHER[Math.min(i, FEATHER.length - 1)];
        L.img = new THREE.Mesh(plane, material(tex, feather, fog, i === shown.length - 1 ? 0.43 : 0.5 - 1.6 * feather));
        L.img.scale.setScalar(size); L.img.renderOrder = 100 + i * 2; L.img.visible = false;
        group.add(L.img);
        L.ok = true; L.at = performance.now(); pulse();
      }, () => { L.ok = false; });
      L.labelsLoaded = lv.labels ? loadTexture(new URL(lv.labels, url).href).then(tex => {
        if (!keep(tex)) return;
        L.lbl = new THREE.Mesh(plane, material(tex, 0.02));
        L.lbl.scale.setScalar(size); L.lbl.renderOrder = 101 + i * 2; L.lbl.visible = false;
        group.add(L.lbl);
        L.labelOk = true; pulse();
      }, () => { L.labelOk = false; }) : Promise.resolve();
      return L;
    });
    st.settled = Promise.all(st.levels.flatMap(L => [L.loaded, L.labelsLoaded]));
    return st;
  }
  function freeStack(st) {
    if (!st || st.disposed) return;
    st.disposed = true;
    scene.remove(st.group);
    for (const L of st.levels) {
      for (const mesh of [L.img, L.lbl]) if (mesh) mesh.material.dispose();
      L.textures.forEach(t => t.dispose());
      L.textures = [];
    }
  }
  function disposeStack() { const st = stack; stack = null; freeStack(st); }
  const usable = st => st.levels.map(L => ({ extent: L.extent, labels: L.hasLabels && L.labelOk, ok: L.ok === true }));
  const planned = st => deepestLevel(st.levels.map(L => ({ ok: L.ok !== false })));

  // Per frame: each level's opacity from the ground span in view (aerial-plan.js levelOpacities),
  // a late level's fade-in, and (building precision only) the marker over the building.
  const mark = new THREE.Vector3();
  function update() {
    if (!stack) return;
    const alt = altitudeOf(camera.position.length());
    const span = viewSpan(alt, camera.fov, camera.aspect, host.frame());
    const ops = levelOpacities(span, usable(stack));
    const now = performance.now();
    let level = -1;
    stack.levels.forEach((L, i) => {
      const k = L.ok ? Math.min(1, (now - L.at) / LEVEL_FADE_MS) : 0;
      if (L.img) { const o = ops[i].image * k; L.img.material.uniforms.opacity.value = o; L.img.visible = o > 0.001; if (o > 0.5) level = i; }
      if (L.lbl) { const o = ops[i].labels * k; L.lbl.material.uniforms.opacity.value = o; L.lbl.visible = o > 0.001; }
    });
    if (level >= 0) stage.dataset.aerialLevel = String(level); else delete stage.dataset.aerialLevel;
    stage.dataset.aerialPrecision = stack.precision;
    // The label and credits show whenever any image of the stack is on the stage.
    const any = stack.levels.some(L => L.img && L.img.visible);
    ui.caption.hidden = !(any || state === END) || state === 'idle';
    const last = stack.levels.length - 1;
    const showMark = stack.precision === 'building' && level >= Math.max(0, last - 1) && state !== 'idle';
    ui.mark.hidden = !showMark;
    if (showMark) {
      mark.set(...stack.dir).project(camera);
      ui.mark.style.setProperty('--x', `${(((mark.x + 1) / 2) * stage.clientWidth).toFixed(1)}px`);
      ui.mark.style.setProperty('--y', `${(((1 - mark.y) / 2) * stage.clientHeight).toFixed(1)}px`);
    }
  }
  host.onRender(update);
  // Keep rendering for a moment (a level that arrived while nothing moves fades in).
  let pulseUntil = 0, pulsing = false;
  function pulse(ms = LEVEL_FADE_MS + 50) {
    pulseUntil = Math.max(pulseUntil, performance.now() + ms);
    if (pulsing) return;
    pulsing = true;
    const loop = () => {
      if (!stack || performance.now() > pulseUntil) { pulsing = false; host.render(); return; }
      if (!host.lost()) host.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ---- Sequences.
  const canvas = host.renderer.domElement;
  const timers = new Set();
  const later = (f, ms) => { const t = setTimeout(() => { timers.delete(t); f(); }, ms); timers.add(t); };
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); canvas.style.opacity = ''; };
  // A new sequence supersedes the running one: its drive, its fade timers and any wait end.
  const begin = () => { host.cancel(); clearTimers(); if (settling) settling(); return ++seq; };
  const wasSkipped = token => skipped === token || chainSkipped;
  const currentDir = () => camera.position.clone().normalize().toArray();
  const endAltitude = (st, i) => fitAltitude(st.levels[i].extent, camera.fov, camera.aspect, host.frame(), FILL);
  // Reduced motion: fade the stage's canvas out, apply the change, fade back in. Resolves false
  // when superseded (its timers are cleared by begin / abort).
  const dip = (token, change) => new Promise(resolve => {
    canvas.style.transition = `opacity ${FADE_MS / 2}ms ease`;
    canvas.style.opacity = '0';
    later(() => {
      if (token !== seq) { resolve(false); return; }
      change(); host.render(); canvas.style.opacity = '1';
      later(() => resolve(token === seq), FADE_MS / 2);
    }, FADE_MS / 2);
    const check = () => { if (token !== seq) resolve(false); else if (timers.size) requestAnimationFrame(check); };
    requestAnimationFrame(check);
  });
  // Wait for levels still loading (ok === null), at most `ms`. Skip does not end the wait (a
  // pending level is not a failed one); a newer sequence does.
  const waitLoads = (st, ms) => new Promise(resolve => {
    let done = false;
    const end = () => { if (!done) { done = true; if (settling === end) settling = null; resolve(); } };
    settling = end;
    st.settled.then(end); setTimeout(end, ms);
  });

  async function zoomIn(id) {
    const token = begin();
    const s = byId.get(id), dir = host.dirOf(id);
    if (!s || !s.aerial || !dir) return 'none';
    if (stack && stack.id !== id) disposeStack();
    host.take();
    setState('loading');
    if (!stack) {
      let st;
      try { st = await loadStack(s); } catch (err) {
        console.warn('aerial stack failed to load', err);
        if (token !== seq) return 'cancelled';
        return backToGlobe(dir, token);
      }
      // A newer sequence started while this manifest loaded: drop this stack, never adopt it.
      if (token !== seq) { freeStack(st); return 'cancelled'; }
      stack = st;
    }
    const st = stack, target = Math.max(0, planned(st));
    showCredits(s, st.manifest, st.precision, st.shown);
    const from = currentDir(), to = dir.toArray(), a0 = altitudeOf(camera.position.length());
    const a1 = endAltitude(st, target);
    setState('zooming');
    if (reduced()) {
      await waitLoads(st, LOAD_WAIT_MS);
      if (token !== seq) return 'cancelled';
      const d = deepestLevel(usable(st));
      if (d < 0) return backToGlobe(dir, token);
      if (!(await dip(token, () => host.place(to, distanceOf(endAltitude(st, d)))))) return 'cancelled';
    } else {
      const t0 = performance.now();
      const ok = wasSkipped(token) ? false : await host.drive(now => {
        const t = (now - t0) / ZOOM_MS, p = zoomPose(t, { from, to, a0, a1 });
        host.place(p.dir, distanceOf(p.alt));
        return t < 1;
      });
      if (token !== seq) return 'cancelled';
      if (!ok) host.place(to, distanceOf(a1)); // skipped: jump, but still let pending levels arrive
      await waitLoads(st, LOAD_WAIT_MS);
      if (token !== seq) return 'cancelled';
      const d = deepestLevel(usable(st));
      if (d < 0) return backToGlobe(dir, token);
      const a2 = endAltitude(st, d);
      if (Math.abs(a2 - a1) > 1e-3 * a1 && !wasSkipped(token)) {
        const t1 = performance.now(), from2 = altitudeOf(camera.position.length());
        await host.drive(now => {
          const t = (now - t1) / SETTLE_MS;
          host.place(to, distanceOf(logLerp(from2, a2, ease(t))));
          return t < 1;
        });
        if (token !== seq) return 'cancelled';
      }
      host.place(to, distanceOf(a2));
    }
    host.render();
    setState(END);
    pulse();
    return END;
  }

  // No level loaded: back over the globe, stack gone; the caller shows the stop card instead.
  async function backToGlobe(dir, token) {
    disposeStack();
    const d = host.flyDistance();
    if (camera.position.length() < d - 1e-6 && !reduced() && !wasSkipped(token)) {
      const a0 = altitudeOf(camera.position.length()), a1 = altitudeOf(d), t0 = performance.now(), to = dir.toArray();
      await host.drive(now => { const t = (now - t0) / FADE_MS; host.place(to, distanceOf(logLerp(a0, a1, ease(t)))); return t < 1; });
      if (token !== seq) return 'cancelled';
    }
    host.release(dir.toArray(), d);
    setState('idle');
    return 'failed';
  }

  async function zoomOut() {
    const token = begin();
    if (!stack && !host.manual()) return 'globe';
    const dir = stack ? stack.dir : currentDir();
    const d = host.flyDistance(), a0 = altitudeOf(camera.position.length()), a1 = altitudeOf(d);
    setState('leaving');
    if (reduced()) {
      if (!(await dip(token, () => host.place(dir, d)))) return 'cancelled';
    } else if (a0 < a1 && !wasSkipped(token)) {
      const t0 = performance.now();
      await host.drive(now => { const t = (now - t0) / OUT_MS; host.place(dir, distanceOf(logLerp(a0, a1, ease(t)))); return t < 1; });
    }
    if (token !== seq) return 'cancelled';
    disposeStack();
    host.release(dir, d);
    setState('idle');
    return 'globe';
  }

  async function flyAlongArc(fromId, toId) {
    const token = begin();
    const q = host.dirOf(toId);
    if (!q) return 'cancelled';
    if (stack) disposeStack();
    const p = host.dirOf(fromId) || new THREE.Vector3(...currentDir());
    const d = host.flyDistance(), P = p.toArray(), Q = q.toArray();
    setState('flying');
    if (reduced()) {
      if (!(await dip(token, () => host.place(Q, d)))) return 'cancelled';
    } else if (!wasSkipped(token)) {
      const ms = arcMs(P, Q), t0 = performance.now();
      await host.drive(now => { const t = (now - t0) / ms, pose = arcPose(t, P, Q, d); host.place(pose.dir, pose.dist); return t < 1; });
    }
    if (token !== seq) return 'cancelled';
    host.release(Q, d);
    setState('idle');
    return 'arrived';
  }

  function placeOver(id) {
    begin();
    const dir = host.dirOf(id);
    if (!dir) return false;
    disposeStack();
    host.take();
    host.place(dir.toArray(), host.flyDistance());
    host.release(dir.toArray(), host.flyDistance());
    if (state !== 'idle') setState('idle');
    host.render();
    return true;
  }

  function chain() { chainSkipped = false; }
  // Skip: the running sequence jumps to its end, and so does every later step of this action.
  function skip() {
    if (!SEQUENCE.has(state)) return;
    skipped = seq; chainSkipped = true;
    host.cancel();
  }

  function abort() {
    seq++;
    host.cancel();
    clearTimers();
    if (settling) settling();
    const dir = stack ? stack.dir : currentDir();
    disposeStack();
    if (host.manual()) host.release(dir, host.flyDistance());
    if (state !== 'idle') setState('idle');
  }

  ui.skip.addEventListener('click', skip);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !e.defaultPrevented && SEQUENCE.has(state)) { e.preventDefault(); skip(); }
  });
  setState('idle');

  return {
    chain, zoomIn, zoomOut, flyAlongArc, placeOver, skip, abort,
    state: () => state,
    current: () => (stack ? stack.id : null),
    precision: () => (stack ? stack.precision : null),
    onChange: f => { onChange = f; },
    debug: {
      levels: () => (stack ? stack.levels.map(L => ({ extent: L.extent, ok: L.ok, labels: L.labelOk,
        image: L.img ? L.img.material.uniforms.opacity.value : 0, label: L.lbl ? L.lbl.material.uniforms.opacity.value : 0 })) : []),
      textures: () => host.renderer.info.memory.textures,
      altitude: () => altitudeOf(camera.position.length()),
      // Client point of the shown stop's place (the centre of the end view), for e2e checks.
      centre: () => {
        if (!stack) return null;
        mark.set(...stack.dir).project(camera);
        const r = canvas.getBoundingClientRect();
        return { x: r.left + ((mark.x + 1) / 2) * r.width, y: r.top + ((1 - mark.y) / 2) * r.height };
      },
    },
  };
}
