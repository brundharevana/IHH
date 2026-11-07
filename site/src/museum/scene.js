// Chapter page runtime: Lite redirect, room build, render on demand, narration reveals,
// numbered list and panel. The list and panel work even if the 3D room cannot start.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRoom } from './room.js';
import { buildTimeline, revealedAt, lineExhibits } from './reveal.js';
import { chooseMode, probeWebGL2, readModePref, wireModeLinks } from './capability.js';
import { reducedMotion, roomInterior, fovFor, BASE_FOV, standPoint, EYE_HEIGHT } from './camera.js';
import { createStationCamera, roomStations, reframeAction } from './stationcam.js';
import { createRings, RING_ATLAS } from './rings.js';
import { createOccluderIndex } from './occlusion.js';
import { createCueFollow } from './follow.js';
import { visibleBox } from './framing.js';
import { createPanel } from '../ui/panel.js';
import { exhibitFiles, roomTextureUrl } from './mediafiles.js';
import { roomTextureList } from './materials.js';
import { ENVIRONMENT } from './stats.js';
import { initToggletips } from '../ui/sources.js';
import { createStagePlayer, cueIndexAt } from '../ui/player.js';
import { createDoors, walkPose } from '../ui/doors.js';
import { mountRoomStory, liteRedirectUrl } from '../ui/story.js';
import { createRail } from '../ui/rail.js';
import { clearOfControls } from './hotspots.js';
import { createDragHint } from '../ui/draghint.js';
import { buildScanRoom, fitTexture, runtimeGpuBytes, PHONE_EXHIBIT_PX } from './scanroom.js';
import { deviceClass, disposeScanLoaders, loadImage } from './loader.js';
import { scanLoadingView, prefetchNextScan } from './scanstage.js';
import { makeExhibit } from './exhibits.js';
import { addDoors } from './door.js';
import { createMaterials } from './materials.js';

// The exit walk ends this far in front of the door (m), looking at it a little below the label plate.
export const DOOR_STANDOFF = 0.9;
const DOOR_GAZE_Y = 1.3;
// Spacing (px) a door pill keeps from a hotspot ring (WCAG 2.5.8 target spacing).
const SPOT_GAP = 24;
const CONTROL_GAP = 6;
// Idle frames while the lit ring breathes (ms between frames): slow motion, so a low rate is smooth.
const BREATH_FRAME_MS = 66;
// The lit ring breathes while the narration plays and for this long after the visitor's last input;
// otherwise a room at rest draws no frames at all.
export const BREATH_AFTER_INPUT_MS = 8000;
const reducedData = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-data: reduce)').matches;

// A room image under the loading inactivity rule (loader.js loadImage): bytes that stall, a decode
// that hangs or an abort end in null, and the room shows its flat colour or placeholder card.
async function loadTexture(url, colour = true, { signal = null } = {}) {
  try {
    const t = new THREE.Texture(await loadImage(url, { signal }));
    t.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace; // normal and ARM maps are data
    t.needsUpdate = true;
    return t;
  } catch {
    return null; // missing or stalled texture: buildRoom falls back to flat colour / placeholder
  }
}

// A chapter whose room is a scan: chapter.room = { scan: "<id>", stations? } (content/scans/<id>.json).
export const scanIdOf = chapter => (chapter && chapter.room && typeof chapter.room === 'object' && chapter.room.scan) || null;

// opts: overlay (the stage's fade layer, for reduced-motion moves), onDragStart (a press on the
// canvas), playing() (the narration is playing: the lit ring may breathe); for a scanned room, scan
// (scanRuntime of its manifest), onProgress({ loaded, total }) while its bundle streams in, and
// altScan (another scan, for the dispose check's test hook only).
// onTurn: the visitor turned the view with a drag (the narration follow holds off, follow.js).
async function startRoom(canvas, chapter, doorSpots = new Map(), { overlay = null, onDragStart = null, onTurn = null, playing = () => false, scan = null, onProgress = () => {}, altScan = null } = {}) {
  const phone = matchMedia('(max-width: 899px), (pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone });
  try {
    return await startRoomWith(renderer, canvas, chapter, doorSpots, { overlay, onDragStart, onTurn, playing, scan, onProgress, altScan, phone });
  } catch (err) {
    // A room that failed to start holds no GPU memory and no transcoder workers.
    disposeScanLoaders(renderer);
    renderer.dispose();
    throw err;
  }
}

async function startRoomWith(renderer, canvas, chapter, doorSpots, { overlay, onDragStart, onTurn, playing, scan, onProgress, altScan, phone }) {
  const scanned = Boolean(scan);
  if (scanned && scan.id !== scanIdOf(chapter)) throw new Error(`room scan ${scanIdOf(chapter)} has no matching scan data (${scan.id})`);
  const cls = scanned ? deviceClass() : null;
  // A scan is drawn as photographed: no tone mapping (it would wash out the photo texture).
  renderer.toneMapping = scanned ? THREE.NoToneMapping : THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !phone && !scanned;

  const ids = [...new Set((chapter.exhibits || []).flatMap(e => { const f = exhibitFiles(e); return [f.front, f.back]; }).filter(Boolean))];
  // Hallway portraits name their own image (the gated /portraits/<slug>.webp), keyed by its URL.
  const images = [...new Set((chapter.exhibits || []).map(e => e.image).filter(Boolean))];
  const roomTex = scanned ? [] : roomTextureList(chapter.room || 'chapter-gallery', { phone });
  const anisotropy = phone ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // Every image load is bounded (loadTexture) and cancelled if the room fails to start. A scanned
  // room starts its preview at once, in parallel with the images (buildScanRoom awaits `media`).
  const loads = new AbortController();
  const media = Promise.all([
    Promise.all(ids.map(id => loadTexture(roomTextureUrl(id), true, { signal: loads.signal }))),
    Promise.all(images.map(url => loadTexture(url, true, { signal: loads.signal }))),
  ]).then(([mediaTex, imageTex]) => {
    const m = Object.fromEntries([...ids.map((id, i) => [id, mediaTex[i]]), ...images.map((u, i) => [u, imageTex[i]])].filter(([, t]) => t));
    // A scanned room on a phone fits our exhibit textures to PHONE_EXHIBIT_PX (the whole room within
    // SCAN_ROOM_GPU; the side panel loads the full image).
    if (scanned && cls === 'phone') for (const t of Object.values(m)) fitTexture(t, PHONE_EXHIBIT_PX);
    return m;
  });
  let built;
  try {
    if (scanned) {
      built = await buildScanRoom(THREE, chapter, scan, { renderer, cls, media, makeExhibit, materials: await createMaterials(THREE, {}), exhibitFiles, addDoors, onProgress, signal: loads.signal });
    } else {
      const setTex = await Promise.all(roomTex.map(r => loadTexture(r.url, r.map === 'color', { signal: loads.signal })));
      const sets = {};
      roomTex.forEach((r, i) => {
        const t = setTex[i];
        if (!t) return;
        t.anisotropy = anisotropy;
        (sets[r.set] = sets[r.set] || {})[r.map] = t;
      });
      built = await buildRoom(THREE, chapter, { textures: { sets, media: await media }, phone });
    }
  } catch (err) {
    loads.abort();
    throw err;
  }
  const { scene, exhibitMeshes, viewpoints = [], size, doors = {} } = built;
  if (scanned) canvas.dataset.scan = 'preview';

  // Procedural rooms get a soft studio environment for their PBR finishes; a scan carries its own
  // light in its texture (scanroom.js scanLighting lights the easels).
  if (!scanned) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), ENVIRONMENT.sigma, 0.1, 100, { size: ENVIRONMENT.size }).texture;
    scene.environment.userData.pmremSize = ENVIRONMENT.size; // sceneStats counts its memory
    scene.environmentIntensity = scene.userData.environmentIntensity ?? ENVIRONMENT.intensity;
    pmrem.dispose();
  }

  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.05, 40);
  const interior = roomInterior(size);
  // Viewing stations framed per exhibit group for this canvas (framing.js), and any the chapter
  // declares; recomputed when the canvas changes shape. The room opens on the first narrated group.
  scene.updateMatrixWorld(true);
  // On a phone-sized stage (fix round 2) the stations frame each group in the band left free between
  // the top controls (door chips) and the bottom ones (two caption lines, the rail, the player bar).
  const narrowStage = () => typeof matchMedia === 'function' && matchMedia('(max-width: 899px)').matches;
  // all: measure on a wide stage too (the narration's close views keep clear of the captions, the
  // rail and the player bar on every screen; group stations do so on a phone only).
  const measureBands = (all = false) => {
    if (!all && !narrowStage()) return null;
    const cr = canvas.getBoundingClientRect();
    let top = 0;
    for (const el of document.querySelectorAll('[data-door-nav], [data-story-pill]:not([hidden])')) {
      const r = el.getBoundingClientRect();
      if (r.height) top = Math.max(top, r.bottom - cr.top + 4);
    }
    let bottom = 0;
    const bar = document.querySelector('[data-player]'), rail = document.querySelector('[data-rail-list]'), cap = document.querySelector('[data-captions]');
    if (bar) bottom = Math.max(bottom, cr.bottom - bar.getBoundingClientRect().top);
    if (rail) bottom = Math.max(bottom, parseFloat(getComputedStyle(rail).bottom) + 64);
    if (cap) {
      const span = cap.querySelector('[data-caption-text]'), cs = getComputedStyle(span);
      const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
      const two = Math.min(parseFloat(cs.maxHeight) || Infinity, 2 * lineH + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom));
      bottom = Math.max(bottom, parseFloat(getComputedStyle(cap).bottom) + two + 4);
    }
    return { top: Math.round(top), bottom: Math.round(bottom) };
  };
  let bands = measureBands(), focusBands = measureBands(true);
  // The close views the narration asks for (stationcam.js focus) stand on free floor with nothing
  // between the eye and the exhibits: tested against the room's occluders (a scan's low-poly layer,
  // the easels, the study corner), indexed once on first use.
  let focusIndex = null, ringGroup = null;
  const focusOccluders = () => {
    if (!focusIndex) {
      const roots = built.occluders || scene.children.filter(c => c !== ringGroup);
      focusIndex = createOccluderIndex(roots, { skip: o => o === ringGroup || Boolean(o.userData && o.userData.ringId), owners: scene.children.filter(c => c !== ringGroup) });
    }
    return focusIndex;
  };
  const frameStations = () => roomStations({
    start: built.start, exhibitMeshes, interior, exhibits: chapter.exhibits || [], authored: (scanned && chapter.room.stations) || chapter.stations || [],
    narration: chapter.narration || [], aspect: canvas.clientWidth / Math.max(1, canvas.clientHeight),
    canvasH: Math.max(1, canvas.clientHeight), scene, bands,
    reserved: (scanned && chapter.room.reserved) || [], occluders: focusOccluders, focusBands,
  });
  let { stations, stationOf, anchors, focus } = frameStations();
  // Render on demand: the loop runs only while something moves (`kick` starts it).
  let running = false, dirty = false;
  const kick = () => { if (!running) { running = true; timer.update(); requestAnimationFrame(tick); } };
  // A move or drag marks the camera moving at once (not at the next drawn frame), so a wait for
  // "rest" never returns before the move has begun.
  const cam = createStationCamera(camera, canvas, { overlay, onDragStart, onTurn, onInput: () => { canvas.dataset.camera = 'moving'; kick(); } });
  // First frame: the opening station, no transition.
  cam.goTo(stations[0], { instant: true });

  // The lit ring breathes only while the narration plays or soon after input, with the stage on
  // screen; never with reduced motion (rings.js) or reduced data. Otherwise a room at rest draws nothing.
  let lastInput = -Infinity, onScreen = true;
  // Input wakes the lit ring's breathing (breathe is defined with the render loop below).
  const noteInput = () => { lastInput = performance.now(); if (breatheRef) breatheRef(); };
  let breatheRef = null;
  for (const ev of ['pointerdown', 'keydown', 'wheel']) document.addEventListener(ev, noteInput, { capture: true, passive: true });
  const allowBreath = () => onScreen && !reducedData() && (playing() || performance.now() - lastInput < BREATH_AFTER_INPUT_MS);
  // Hotspot rings: one per exhibit on its number anchor, hidden where the room stands between the
  // eye and the anchor. The occluders are the room (a room may give a low-poly occluder layer as
  // built.occluders, as a scan should); indexed once, tested only when the eye arrives somewhere.
  const rings = createRings(scene, (chapter.exhibits || []).filter(e => anchors.has(e.id)).map(e => ({ id: e.id, number: e.number, anchor: anchors.get(e.id).anchor, own: anchors.get(e.id).own })), {
    occluders: () => built.occluders || scene.children.filter(c => c !== ringGroup),
    viewportHeight: () => canvas.clientHeight,
    atlasScale: phone ? RING_ATLAS.phone : RING_ATLAS.desktop,
    allowBreath,
  });
  ringGroup = rings.group;
  rings.occlude(camera.position);
  // A move that changes where the eye stands hides the rings until it lands; occlusion is then tested
  // from where the eye arrived. A turn in place keeps them (occlusion depends on position only).
  const goTo = (st, o) => {
    if (new THREE.Vector3(...st.position).distanceTo(camera.position) > 1e-3) rings.setTravelling(true);
    return cam.goTo(st, o).then(ok => {
      if (ok) { rings.occlude(camera.position); rings.setTravelling(false); dirty = true; kick(); }
      return ok;
    });
  };

  // Canvas-relative boxes of the stage controls a door pill keeps clear of; measured on resize and
  // whenever a control changes size (shown, hidden, relabelled), not on every frame.
  let controlRects = [];
  const controls = [...document.querySelectorAll('[data-door-nav], [data-now], [data-stage-play], [data-story-pill], [data-rail-list]')];
  const measureControls = () => {
    const cr = canvas.getBoundingClientRect();
    controlRects = controls.map(el => el.getBoundingClientRect()).filter(r => r.width && r.height)
      .map(r => ({ x0: r.left - cr.left, x1: r.right - cr.left, y0: r.top - cr.top, y1: r.bottom - cr.top }));
  };
  const anchor = new THREE.Vector3();
  // A ring's place on the canvas (CSS px), or null when it is not drawn.
  const ringOnCanvas = id => {
    const st = rings.state(id);
    if (!st || !st.visible) return null;
    const p = new THREE.Vector3(...st.position);
    if (p.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) <= 0) return null;
    p.project(camera);
    return { x: ((p.x + 1) / 2) * canvas.clientWidth, y: ((1 - p.y) / 2) * canvas.clientHeight, px: st.px };
  };
  // Door hotspots: labelled pills mid-door, below the door's sign; hidden while the anchor is behind
  // the visitor or out of the view, otherwise kept wholly inside the stage. Rings win: a door pill
  // that would cover one, or come within the 24 px target spacing of one, is hidden (the stage door
  // buttons stay as its equivalent). A pill under a stage control moves just clear of it.
  const placeDoorSpots = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const taken = [];
    for (const id of anchors.keys()) {
      const q = ringOnCanvas(id);
      if (q) { const r = q.px / 2 + SPOT_GAP; taken.push({ x0: q.x - r, x1: q.x + r, y0: q.y - r, y1: q.y + r }); }
    }

    for (const [key, btn] of doorSpots) {
      const a = doors[key] && doors[key].getObjectByName('door-anchor');
      if (!a) { btn.dataset.offscreen = ''; continue; }
      a.getWorldPosition(anchor);
      const behind = anchor.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) <= 0;
      anchor.project(camera);
      let x = ((anchor.x + 1) / 2) * w;
      const y = ((1 - anchor.y) / 2) * h;
      if (behind || x < 0 || x > w || y < 0 || y > h) { btn.dataset.offscreen = ''; continue; }
      delete btn.dataset.offscreen;
      const half = btn.offsetWidth / 2 + 4, hh = btn.offsetHeight / 2;
      x = Math.min(Math.max(x, half), Math.max(half, w - half));
      if (taken.some(r => x + half > r.x0 && x - half < r.x1 && y + hh > r.y0 && y - hh < r.y1)) { btn.dataset.offscreen = ''; continue; }
      // Under a stage control (the big play button sits mid-stage): just below or above it, or hidden.
      const q = clearOfControls({ x, y }, controlRects, { w, h, rx: half, ry: hh, gap: CONTROL_GAP });
      if (!q || taken.some(r => q.x + half > r.x0 && q.x - half < r.x1 && q.y + hh > r.y0 && q.y - hh < r.y1)) { btn.dataset.offscreen = ''; continue; }
      btn.style.setProperty('--x', `${q.x.toFixed(1)}px`); btn.style.setProperty('--y', `${q.y.toFixed(1)}px`);
    }
  };
  // Frames are dropped, never queued: a frame is drawn only once the GPU has finished the previous
  // one (a WebGL2 fence, polled without waiting). Camera motion is timed by the clock, so a slow GPU
  // shows fewer frames of the same glide instead of falling seconds behind it (with software
  // rendering, a turn queued about 12 s of frames and stalled the page until they drained).
  const gl = renderer.getContext();
  let fence = null;
  const gpuBusy = () => {
    if (!fence) return false;
    if (gl.clientWaitSync(fence, 0, 0) === gl.TIMEOUT_EXPIRED) return true;
    gl.deleteSync(fence); fence = null;
    return false;
  };
  // Camera state on the canvas: "moving" from the start of a glide, fade, walk or drag until the
  // camera has settled, then "rest" once that pose is drawn. Door pills and rings follow the drawn
  // camera, so they are still targets only at rest.
  let walk = null; // the door walk under way (walkToDoor)
  const markCamera = () => { canvas.dataset.camera = walk || cam.isMoving() ? 'moving' : 'rest'; };
  let renders = 0;
  const render = () => {
    if (fence) { gl.deleteSync(fence); fence = null; }
    rings.update(camera);
    renderer.render(scene, camera); renders++; placeDoorSpots();
    fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    markCamera();
  };
  const timer = new THREE.Timer();
  let breath = null;
  const breathe = () => {
    if (breath || !rings.breathing() || document.visibilityState === 'hidden') return;
    // The idle frames end by themselves when breathing stops being allowed (no frame is drawn then).
    breath = setTimeout(() => { breath = null; dirty = true; kick(); }, BREATH_FRAME_MS);
  };
  const tick = () => {
    timer.update();
    const moved = cam.update();
    if (moved || rings.animating()) dirty = true;
    if (dirty && !gpuBusy()) { dirty = false; render(); }
    if (moved || dirty || cam.isMoving() || rings.animating()) requestAnimationFrame(tick);
    else { running = false; markCamera(); breathe(); }
  };
  breatheRef = () => { if (!running) breathe(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') breathe(); });
  // Off screen (scrolled away): no breathing frames.
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(entries => { onScreen = entries.some(e => e.isIntersecting); if (onScreen) breathe(); }).observe(canvas);
  }
  canvas.dataset.camera = 'rest';

  // While the panel covers part of the stage, shift the projection so the scene's centre (where a
  // glide puts the exhibit) sits in the middle of the part still visible: left of the side panel,
  // above the bottom sheet. Fractions of the canvas width / height.
  let frame = { x: 0, y: 0 };
  const applyFrame = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (frame.x || frame.y) camera.setViewOffset(w, h, frame.x * w, frame.y * h, w, h);
    else camera.clearViewOffset();
  };
  let lastH = 0;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const nb = measureBands(), nf = measureBands(true);
    const reshaped = Math.abs(camera.aspect - w / h) > 1e-3 || h !== lastH || JSON.stringify(nb) !== JSON.stringify(bands) || JSON.stringify(nf) !== JSON.stringify(focusBands);
    bands = nb; focusBands = nf;
    camera.aspect = w / h; camera.fov = fovFor(camera.aspect); lastH = h;
    applyFrame(); camera.updateProjectionMatrix();
    // A new shape frames the groups anew; a visitor standing at a framed station and looking along its
    // view steps to its new place.
    if (reshaped && stations) {
      // A close view (the narration's, focus) is framed anew for the new shape like any station.
      const at = cam.station(), was = at && (at.focus ? at : stations.find(st => st.id === at.id));
      ({ stations, stationOf, anchors, focus } = frameStations());
      const now = was && (was.focus ? focus(was.focus) : stations.find(st => st.id === was.id));
      // Only a visitor still looking along the station's view is moved; one who has turned away keeps
      // their view (the station record is swapped silently), so a reflow never snaps them back.
      const act = reframeAction({ at: was, next: now, dir: camera.getWorldDirection(new THREE.Vector3()).toArray(), moving: cam.isMoving() || Boolean(walk) });
      if (act === 'reframe') { cam.goTo(now, { instant: true }); rings.occlude(camera.position); }
      else if (act === 'adopt') cam.adopt(now);
    }
    render();
  };
  new ResizeObserver(() => { measureControls(); resize(); }).observe(canvas);
  if (controls.length) { const ro = new ResizeObserver(() => { measureControls(); render(); }); for (const el of controls) ro.observe(el); }
  measureControls();
  resize();

  function stopWalk() {
    if (!walk) return;
    cancelAnimationFrame(walk.raf); clearTimeout(walk.timer); walk.resolve(false); walk = null;
    rings.occlude(camera.position); rings.setTravelling(false);
    kick();
  }
  // The pose before the last leave began, to return to when the leave is cancelled (Esc) or the page
  // comes back from the back-forward cache.
  let beforeLeave = null;
  function restorePose() {
    stopWalk();
    if (!beforeLeave) return;
    const { eye, target } = beforeLeave;
    beforeLeave = null;
    cam.setPose(eye, target);
    rings.occlude(camera.position);
    dirty = true; kick();
  }
  const screenRect = ids => {
    const r = canvas.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of ids) {
      const b = anchors.get(id) && anchors.get(id).box;
      if (!b) continue;
      for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
        const p = new THREE.Vector3(x, y, z).project(camera);
        const px = r.left + ((p.x + 1) / 2) * r.width, py = r.top + ((1 - p.y) / 2) * r.height;
        x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      }
    }
    return Number.isFinite(x0) ? { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } : null;
  };
  const canvasToClient = q => { const r = canvas.getBoundingClientRect(); return { x: r.left + q.x, y: r.top + q.y }; };

  // Leaving the room: everything it put on the GPU is released (the scan, easels, rings, renderer).
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (built.dispose) built.dispose();
    rings.dispose();
    disposeScanLoaders(renderer);
    renderer.dispose();
  };
  // Mean and spread of the drawn frame's luminance (sampled on a grid), read right after drawing it.
  const pixels = () => {
    render();
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, px = new Uint8Array(4);
    const vals = [];
    for (let j = 1; j < 16; j++) for (let i = 1; i < 16; i++) {
      gl.readPixels(Math.floor((i / 16) * w), Math.floor((j / 16) * h), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      vals.push(0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]);
    }
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { mean, spread: Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) };
  };
  const memory = () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures });

  return {
    render, exhibitMeshes, camera, scene, doors, rings, dispose,
    scanned,
    // Scanned room: full detail replaces the preview (scanroom.js). canvas data-scan says which is
    // shown: "preview", then "full"; "preview-only" when the full bundle could not load (the preview
    // is a whole room at lower detail, so it stays). Resolves true when the full bundle is shown.
    async detail(opts = {}) {
      if (!scanned) return true;
      try {
        await built.detail(opts);
        canvas.dataset.scan = 'full';
        dirty = true; kick();
        return true;
      } catch (err) {
        canvas.dataset.scan = 'preview-only';
        console.warn('scanned room: full detail did not load; the preview stays', err);
        return false;
      }
    },
    // After a WebGL context restore three.js uploads everything again on the next frame.
    restored: () => { dirty = true; kick(); },
    stations: () => stations,
    // The narration names `target` ({ ids, area? }, follow.js cueTarget): go to its framed close view
    // (a glide; a fade under reduced motion). Not during a door walk. Resolves true on arrival.
    follow(target) {
      if (walk) return Promise.resolve(false);
      const st = focus(target);
      if (!st) return Promise.resolve(false);
      const at = cam.station();
      if (at && at.id === st.id && !cam.isMoving()) return Promise.resolve(true);
      kick();
      return goTo(st);
    },
    kick: () => { dirty = true; kick(); },
    // The station the camera stands at (null during the door walk's free poses).
    station: () => cam.station(),
    // The ring under a canvas point (client px), or null.
    ringAt(clientX, clientY) {
      const r = canvas.getBoundingClientRect(), ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
      return rings.pick(ray);
    },
    // Re-measure the stage controls a door pill keeps clear of (they hide or move when the panel opens or closes).
    measureControls: () => { measureControls(); render(); },
    // e2e test hooks (window.__voa with ?debug): only in builds made with PUBLIC_TEST_HOOKS=1 (the
    // Playwright configs); Vite folds the flag at build time so production output has none of this.
    debug: import.meta.env.PUBLIC_TEST_HOOKS === '1' ? {
      // Scanned room: what loaded (device class, bytes, load time), and its GPU memory now.
      scan: () => {
        if (!scanned) return null;
        const sc = built.scan();
        let textured = true;
        sc.root.traverse(o => { if (o.isMesh && !(o.material && o.material.map)) textured = false; });
        return { id: sc.id, cls: sc.cls, phase: sc.phase, bytes: sc.bytes, previewBytes: sc.previewBytes, previewMs: sc.previewMs, fullMs: sc.fullMs, gpu: sc.gpu, textured, memory: memory(),
          toneMapping: renderer.toneMapping === THREE.NoToneMapping ? 'none' : String(renderer.toneMapping) };
      },
      pixels,
      // GPU bytes the whole drawn room holds as uploaded (scan, easels, exhibits, doors, rings).
      gpuBytes: () => runtimeGpuBytes(scene),
      // The study corner as drawn (Task 6): its declared objects, label and downloaded bytes.
      corner: () => {
        const c = built.corner;
        if (!c) return null;
        const objects = [];
        c.group.traverse(o => { if (o.userData.objectId) objects.push(o.userData.objectId); });
        const label = c.group.getObjectByName('recreation-label');
        return { objects: [...new Set(objects)].sort(), label: label && label.userData.text, bytes: c.bytes, inScene: c.group.parent === scene };
      },
      // Dispose check: load another scan in place of this one, then this one again; the renderer's
      // geometry and texture counts must come back to what they were.
      scanCycle: async () => {
        if (!scanned || !altScan) return null;
        render();
        const before = memory(), ids = [built.scan().id];
        await built.swapScan(altScan); render();
        const during = memory(); ids.push(built.scan().id);
        await built.swapScan(scan); render();
        ids.push(built.scan().id);
        return { ids, before, during, after: memory() };
      },
      cameraPose: () => ({
        position: camera.position.toArray(),
        direction: camera.getWorldDirection(new THREE.Vector3()).toArray(),
        renders,
        inside: interior.containsPoint(camera.position),
        fov: camera.fov, aspect: camera.aspect, zoom: camera.zoom,
        station: cam.station() ? cam.station().id : null,
      }),
      moving: () => Boolean(walk) || cam.isMoving(),
      // Stand at `eye` looking at `target` (screenshots and placement checks from any point).
      pose: (eye, target) => { stopWalk(); cam.setPose(eye, target); rings.occlude(camera.position); dirty = true; kick(); return true; },
      stations: () => stations.map(s => ({ id: s.id, position: s.position, look: s.look })),
      stationOf: id => (stationOf.get(id) || {}).id || null,
      // Turn in place to face a door (e2e: the door pill in the room; visitors use the stage door buttons).
      doorWorld: key => { const a = doors[key] && doors[key].getObjectByName('door-anchor'); return a ? a.getWorldPosition(new THREE.Vector3()).toArray() : null; },
      faceDoor: key => { const a = doors[key] && doors[key].getObjectByName('door-anchor'); if (a) { kick(); cam.lookAt(a.getWorldPosition(new THREE.Vector3()).toArray()); } return Boolean(a); },
      idle: () => ({ running, breathing: rings.breathing(), renders }),
      bands: () => bands,
      focusBands: () => focusBands,
      // Client rect of exhibits as drawn now: one exhibit, or every exhibit seen from a station.
      exhibitScreen: id => screenRect([id]),
      // What an exhibit's picture shows: 'image' (its media file) or 'placeholder' (the designed card).
      exhibitPicture: id => {
        const g = exhibitMeshes.get(id);
        if (!g) return null;
        let card = false;
        g.traverse(o => { for (const m of o.material ? [].concat(o.material) : []) if (m && m.name === 'placeholder-card') card = true; });
        return card ? 'placeholder' : 'image';
      },
      groupScreen: stationId => screenRect([...stationOf.keys()].filter(id => stationOf.get(id).id === stationId)),
      // The close view a cue's target asks for ({ ids, area? }), as framed for the canvas now.
      focusStation: target => { const s = focus(target); return s && { id: s.id, position: s.position, look: s.look, fallback: Boolean(s.fallback), ringFloor: s.ringFloor ?? null }; },
      // Client rect of the object standing in a reserved area (the study corner) as drawn now.
      areaScreen: area => {
        const o = scene.children.find(c => c.userData && c.userData.frameArea === area);
        if (!o) return null;
        const b = visibleBox(o), r = canvas.getBoundingClientRect();
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
          const p = new THREE.Vector3(x, y, z).project(camera);
          const px = r.left + ((p.x + 1) / 2) * r.width, py = r.top + ((1 - p.y) / 2) * r.height;
          x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        }
        return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
      },
      // A ring's mesh as drawn: its scale and how far it is turned from facing the camera (radians).
      ringMesh: id => { const m = rings.group.children.find(x => x.userData.ringId === id); return m && { visible: m.visible, scale: m.scale.x, turn: m.getWorldQuaternion(new THREE.Quaternion()).angleTo(camera.getWorldQuaternion(new THREE.Quaternion())), pos: m.getWorldPosition(new THREE.Vector3()).toArray() }; },
      // The ring under a client point (what a click or hover there would hit), or null.
      ringAt: (x, y) => { const r = canvas.getBoundingClientRect(), ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera); return rings.pick(ray); },
      // A ring's state and its centre in client px (null centre when it is not drawn).
      ring: id => { const st = rings.state(id), q = ringOnCanvas(id); return st && { ...st, screen: q ? { ...canvasToClient(q), px: q.px } : null }; },
      // Screen point (client px) of a door's hotspot anchor, or null without that door.
      doorScreen: key => {
        const a = doors[key] && doors[key].getObjectByName('door-anchor');
        if (!a) return null;
        const p = a.getWorldPosition(new THREE.Vector3()), behind = p.clone().sub(camera.position).dot(camera.getWorldDirection(new THREE.Vector3())) <= 0;
        p.project(camera);
        const r = canvas.getBoundingClientRect();
        return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height, behind };
      },
      // Screen point (client px) of an exhibit's centre, for e2e clicks on the scene.
      screenOf: id => {
        const g = exhibitMeshes.get(id);
        if (!g) return null;
        const p = g.getWorldPosition(new THREE.Vector3()).project(camera), r = canvas.getBoundingClientRect();
        return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height };
      },
    } : null,
    // Exit walk to a door: an eased walk of `ms` to DOOR_STANDOFF in front of it, timed by the clock
    // (frames are dropped, not queued). Resolves true at the door, false if stopped (stopWalk).
    walkToDoor(key, ms) {
      const g = doors[key];
      if (!g) return Promise.resolve(false);
      stopWalk();
      const plate = g.getObjectByName('door-anchor').getWorldPosition(new THREE.Vector3());
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
      const eye = standPoint(plate, normal, interior, DOOR_STANDOFF); eye.y = Math.min(EYE_HEIGHT, interior.max.y);
      const from = { eye: camera.position.toArray(), target: camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3())).toArray() };
      beforeLeave = { ...from };
      const to = { eye: eye.toArray(), target: [plate.x, DOOR_GAZE_Y, plate.z] };
      canvas.dataset.camera = 'moving';
      rings.setTravelling(true);
      return new Promise(resolve => {
        const t0 = performance.now();
        walk = { resolve };
        const finish = () => {
          if (!walk) return;
          cancelAnimationFrame(walk.raf); clearTimeout(walk.timer);
          const p = walkPose(from, to, 1);
          cam.setPose(p.eye, p.target);
          walk = null; rings.occlude(camera.position); rings.setTravelling(false); dirty = true; kick();
          resolve(true);
        };
        const step = () => {
          if (!walk) return;
          const t = Math.min(1, (performance.now() - t0) / ms);
          if (t >= 1) { finish(); return; }
          const p = walkPose(from, to, t);
          cam.setPose(p.eye, p.target);
          dirty = true; kick();
          walk.raf = requestAnimationFrame(step);
        };
        // The walk ends on the clock, not on a frame: a slow GPU (a scanned room under software
        // rendering) shows fewer frames of it, never a longer walk.
        walk.timer = setTimeout(finish, ms);
        step();
      });
    },
    stopWalk,
    restorePose,
    // Glide to the exhibit's station, turning to face it (a fade under reduced motion). Resolves true
    // when the camera has arrived, false when another move replaced this one.
    flyTo(id) {
      const st = stationOf.get(id), a = anchors.get(id);
      if (!st || !a) return Promise.resolve(true);
      kick();
      return goTo(st, { look: a.look });
    },
    setFrame(x, y) { frame = { x, y }; applyFrame(); camera.updateProjectionMatrix(); render(); },
    // Phone bottom sheet (fix round 2): shift the view so the exhibit's middle sits in the middle of
    // the strip still visible above the sheet, the player bar and any caption over them.
    framePanel(id) {
      const a = anchors.get(id);
      if (!a) return;
      frame = { x: 0, y: 0 }; applyFrame(); camera.updateProjectionMatrix();
      const cr = canvas.getBoundingClientRect(), h = canvas.clientHeight;
      const c = a.box.getCenter(new THREE.Vector3()).project(camera), y = ((1 - c.y) / 2) * h;
      let bottom = h;
      for (const el of document.querySelectorAll('[data-player], [data-captions]:not([hidden])')) {
        const r = el.getBoundingClientRect();
        if (r.height) bottom = Math.min(bottom, r.top - cr.top);
      }
      this.setFrame(0, (y - bottom / 2) / h);
    },
    viewpoints: viewpoints.map(v => v.id),
    // Stored viewpoint: stand in the centre facing a wall (a glide; a fade under reduced motion).
    lookFrom(id) {
      const v = viewpoints.find(x => x.id === id);
      if (!v) return Promise.resolve(false);
      kick();
      return goTo({ id: `view-${id}`, position: v.eye, look: v.target });
    },
  };
}

// hall: the hallway (/hall/): no narration, every easel shown from the start; an easel with an `href`
// (the inductee's journey map) is chosen by following it.
export async function startChapter({ slug, n, chapter, story = null, scan = null, next = null, hall = false }) {
  const lite = chooseMode({ webgl2: probeWebGL2(), liteParam: new URL(location.href).searchParams.has('lite'), userPref: readModePref(), reducedMotion: reducedMotion() });
  wireModeLinks();
  // The hallway's Lite form is its own list of inductees below the stage: no 3D stage.
  if (lite === 'lite' && hall) {
    const st = document.querySelector('[data-stage]'), cv = document.getElementById('room');
    if (st) st.hidden = true;
    if (cv) cv.dataset.ready = 'lite';
    return null;
  }
  // In story mode the Lite page goes on with the story (src/ui/story.js).
  if (lite === 'lite') { location.replace(liteRedirectUrl({ slug, n })); return null; }

  // Every chip on the page outside the panel (heading, plaque note, list, portrait transcript); panel chips are wired on open.
  initToggletips(document.querySelector('.voa-chapter') || document.body);
  const buttons = new Map([...document.querySelectorAll('#exhibits button[data-exhibit]')].map(b => [b.dataset.exhibit, b]));
  const railButtons = new Map([...document.querySelectorAll('[data-rail]')].map(b => [b.dataset.rail, b]));
  const doorSpots = new Map([...document.querySelectorAll('[data-door-hotspot]')].map(b => [b.dataset.doorHotspot, b]));
  const stage = document.querySelector('[data-stage]');
  // Doors work as links from the start; the walk joins once the 3D room is running.
  const doors = createDoors();
  const revealed = new Set();
  let room = null;
  // Easels that lead elsewhere (the hallway's journey-map links) are followed, not opened.
  const hrefOf = new Map((chapter.exhibits || []).filter(e => e.href).map(e => [e.id, e.href]));
  // Exhibits in number order, for the panel's previous / next.
  const order = [...(chapter.exhibits || [])].filter(e => !hrefOf.has(e.id)).sort((a, b) => a.number - b.number).map(e => e.id);
  const audio = document.getElementById('narration');
  // "Drag to look around": after the narration, where the station allows it, never over the panel
  // or the story's countdown card.
  const hint = createDragHint(document.querySelector('[data-drag-hint]'), {
    audio,
    lookAround: () => Boolean(room) && (!room.station() || room.station().lookAround !== false),
    blocked: () => Boolean(stage && ('panelOpen' in stage.dataset || ['counting', 'leaving'].includes(stage.dataset.story))),
  });
  const panel = createPanel(document.getElementById('panel'), {
    // What the panel covers; the player stays live.
    inert: [document.getElementById('room'), document.querySelector('[data-hotspots]'), document.querySelector('[data-rail-list]')],
    order,
    onStep: id => openExhibit(id, railButtons.get(id), buttons.get(id)),
    // Keep the exhibit in the visible part of the stage: the bottom sheet covers 58 % of the stage
    // height on a phone; the side panel min(420 px, 42 %) of its width on desktop (ChapterRoom.astro).
    onToggle: open => {
      if (open) hint.hide();
      if (!room) return;
      room.rings.setHidden(open); // rings step aside while the panel is open
      room.measureControls();
      const canvas = document.getElementById('room');
      if (!open) room.setFrame(0, 0);
      else if (matchMedia('(max-width: 899px)').matches) room.framePanel(panel.current());
      else room.setFrame(Math.min(420 / Math.max(1, canvas.clientWidth), 0.42) / 2, 0);
    },
  });
  // The camera follows the narration (follow.js): a cue naming exhibits takes the camera to their
  // close view, unless the visitor turned the view or chose a move in the last FOLLOW_QUIET_MS, or the
  // panel or the story's card holds the stage.
  const follow = createCueFollow({
    move: target => { if (room) room.follow(target); },
    blocked: () => panel.isOpen() || Boolean(stage && ['counting', 'leaving'].includes(stage.dataset.story)),
  });
  // The thumbnail rail: the keyboard and screen-reader path to the rings, linked both ways with them.
  const rail = createRail(railButtons, {
    // A rail link (hallway) is followed by the browser itself.
    onPick: (id, b) => { if (b.tagName !== 'A') openExhibit(id, b, buttons.get(id)); },
    onHover: () => { if (room) room.kick(); },
  });

  const reveal = ids => {
    const fresh = [];
    for (const id of ids) {
      if (revealed.has(id)) continue; // cumulative: never hidden again, even on a backward seek
      revealed.add(id); fresh.push(id);
      const b = buttons.get(id);
      if (b) b.closest('li').hidden = false;
    }
    if (!fresh.length) return;
    rail.reveal(fresh);
    if (room) room.kick();
  };

  // Choosing an exhibit (ring, thumbnail, list item, picture in the room): it is revealed, the camera
  // glides to its station and turns to it, then the panel opens. Focus returns to the opener on close
  // (the thumbnail, or the list item when that cannot take focus). A later choice replaces an earlier
  // one still gliding.
  // While gliding, the stage is aria-busy and a polite live region says where the camera is going.
  let choosing = 0;
  const moveNote = document.querySelector('[data-move-announce]');
  const openExhibit = async (id, opener, fallback = null) => {
    if (hrefOf.has(id)) { location.assign(hrefOf.get(id)); return; }
    reveal([id]);
    hint.hide();
    follow.input(); // the visitor chose where to look: the narration does not take the camera away
    if (player) player.collapse(); // the visitor has acted: the big play button gives way
    const mine = ++choosing;
    // Stepping with the panel open (previous / next) swaps it at once and the camera follows.
    if (panel.isOpen()) {
      panel.open(id, opener, fallback);
      if (room) room.flyTo(id).then(ok => { if (ok && panel.isOpen() && panel.current() === id && matchMedia('(max-width: 899px)').matches) room.framePanel(id); });
      return;
    }
    if (room) {
      const b = buttons.get(id);
      if (moveNote && b) moveNote.textContent = `Moving to exhibit ${b.textContent.trim()}`;
      if (stage) stage.setAttribute('aria-busy', 'true');
      const arrived = await room.flyTo(id);
      if (mine === choosing && stage) stage.removeAttribute('aria-busy');
      if (!arrived || mine !== choosing) return;
    }
    panel.open(id, opener, fallback);
  };
  for (const [id, b] of buttons) b.addEventListener('click', () => openExhibit(id, b));
  const showAll = document.getElementById('show-all');
  if (showAll) showAll.addEventListener('click', () => reveal(buttons.keys()));

  // Narration cues drive reveals (cumulative) and the highlight of the line playing now: its ring
  // and thumbnail light up, its list item and source chips are marked, its transcript line is marked,
  // a "now showing" button offers the panel, and a polite live region names it once per line.
  // Without audio there is no cue track and nothing reveals until "Show all exhibits".
  const cueTrack = document.getElementById('cues');
  let player = null, resync = null;
  if (audio && cueTrack) {
    let timeline = null, cues = [];
    const track = cueTrack.track;
    track.mode = 'hidden';
    player = createStagePlayer({ stage, audio, track });
    const lines = lineExhibits(chapter.narration || [], chapter.exhibits || []);
    const lineOfCue = new Map((chapter.narration || []).map((l, i) => [l.cue, i]));
    const ready = () => {
      if (timeline || !track.cues || !track.cues.length) return;
      cues = [...track.cues].sort((x, y) => x.startTime - y.startTime);
      try {
        timeline = buildTimeline(chapter.narration || [], cues.map(c => ({ id: c.id, startTime: c.startTime })), chapter.exhibits || []);
      } catch (err) {
        console.error('reveal timeline', err);
      }
    };
    const highlight = createHighlighter({ buttons, rail, lines, openExhibit });
    const sync = () => {
      ready();
      if (!timeline) return;
      reveal(revealedAt(timeline, audio.currentTime));
      const started = audio.currentTime > 0 || !audio.paused;
      const cue = started ? cues[cueIndexAt(cues, audio.currentTime)] : null;
      const line = cue && lineOfCue.has(cue.id) ? lineOfCue.get(cue.id) : -1;
      highlight(line, revealed);
      if (room) {
        // The same exhibits the highlight names (revealed), or the area a museum note frames; once
        // per line. Only once the room runs: a cue that played during the load is followed when it is ready.
        const ids = line >= 0 ? (lines[line] || []).filter(id => revealed.has(id)) : [];
        follow.line(line, (chapter.narration || [])[line], ids);
        room.kick();
      }
    };
    resync = sync;
    cueTrack.addEventListener('load', ready);
    audio.addEventListener('loadedmetadata', ready);
    for (const ev of ['timeupdate', 'seeked', 'play']) audio.addEventListener(ev, sync);
    // The lit ring breathes while the narration plays: wake the idle frames.
    audio.addEventListener('play', () => { if (room) room.kick(); });
    track.addEventListener('cuechange', sync);
  }

  // The hallway has no narration: every easel is shown from the start.
  if (hall) reveal((chapter.exhibits || []).map(e => e.id));
  // Story mode (?story=1): narration on arrival, the countdown card, on to the next room (src/ui/story.js).
  mountRoomStory({ data: story, doors, player, audio: player ? audio : null });

  const canvas = document.getElementById('room');
  const loading = scanIdOf(chapter) ? scanLoadingView() : null;
  // WebGL context lost (GPU reset, too many contexts), during the load or after: the stage shows the
  // fallback card, never a black frame; when the context is restored the room is drawn again.
  let contextLost = false;
  // A scanned room's canvas is not "ready" while the failure card covers it.
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault(); // allows webglcontextrestored
    contextLost = true; canvas.dataset.context = 'lost';
    if (loading) { loading.fail(); if (canvas.dataset.ready === 'true') canvas.dataset.ready = 'false'; }
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false; canvas.dataset.context = 'restored';
    if (room) { if (loading) { loading.recover(); canvas.dataset.ready = 'true'; } room.restored(); }
  });
  let detailed = Promise.resolve();
  try {
    room = await startRoom(canvas, chapter, doorSpots, {
      overlay: document.querySelector('[data-stage-fade]'),
      // A press on the room counts as the visitor taking the view, even during an automatic glide
      // (which drops the drag's turn until it lands).
      onDragStart: () => { hint.dragged(); follow.input(); if (player) player.collapse(); },
      onTurn: () => follow.input(),
      playing: () => Boolean(audio && !audio.paused && !audio.ended),
      scan: scanIdOf(chapter) ? scan : null,
      onProgress: p => { if (loading) loading.progress(p); },
      altScan: next && next.scan,
    });
    for (const [key, h] of doorSpots) h.hidden = !room.doors[key];
    rail.attach(room.rings);
    doors.setRoom(room);
    room.render();
    // Test hook, only in PUBLIC_TEST_HOOKS=1 builds and with ?debug: camera state for e2e checks.
    if (import.meta.env.PUBLIC_TEST_HOOKS === '1' && room.debug && new URL(location.href).searchParams.has('debug')) window.__voa = room.debug;
    if (loading && !contextLost) { loading.recover(); loading.done(); }
    canvas.dataset.ready = loading && contextLost ? 'false' : 'true';
    if (room.scanned) {
      detailed = room.detail({ onProgress: p => { if (loading) loading.detail(p); } })
        .then(() => { if (loading) loading.detailDone(); });
    }
    wirePicking(canvas, room, rail, id => openExhibit(id, railButtons.get(id), buttons.get(id)));
    wireViewpoints(room, () => follow.input());
    // A page that is really unloaded (not kept in the back-forward cache) releases its room.
    addEventListener('pagehide', e => { if (!e.persisted && room) room.dispose(); });
    // The line playing now, when the narration started while the room loaded (a story room): its
    // close view. Before the narration starts nothing is revealed or followed.
    if (resync && audio && (audio.currentTime > 0 || !audio.paused)) resync();
  } catch (err) {
    if (loading) loading.fail();
    canvas.dataset.ready = 'failed';
    console.error('room failed to start', err);
  }
  doors.arrive();
  if (room) prefetchNextScan({ next, doors, audio: player ? audio : null, after: detailed });
  return { doors };
}

// Marks the narration line `line` (index into narration, -1 for none): the revealed exhibits it
// names light up (ring and thumbnail, list item with its chips), the transcript line is marked, the
// "now showing" button opens the first of them, and the live region announces them once per line.
function createHighlighter({ buttons, rail, lines, openExhibit }) {
  const now = document.querySelector('[data-now]');
  const live = document.querySelector('[data-announce]');
  const transcript = [...document.querySelectorAll('.transcript [data-line]')];
  let current = null, announced = -1, nowId = null;
  if (now) now.addEventListener('click', () => { if (nowId) openExhibit(nowId, rail.buttons.get(nowId), buttons.get(nowId)); });
  return (line, revealed) => {
    const ids = line >= 0 ? (lines[line] || []).filter(id => revealed.has(id)) : [];
    const key = `${line}|${ids.join(',')}`;
    if (key === current) return;
    current = key;
    for (const [id, b] of buttons) {
      const on = ids.includes(id), li = b.closest('li');
      li.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    }
    rail.setActive(ids);
    transcript.forEach((p, i) => {
      p.classList.toggle('is-current', i === line);
      if (i === line) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    nowId = ids[0] || null;
    if (now) {
      now.hidden = !nowId;
      if (nowId) now.textContent = `Open ${buttons.get(nowId).textContent.trim()}`;
    }
    if (ids.length && line !== announced && live) {
      announced = line;
      live.textContent = `Now showing exhibit ${ids.map(id => buttons.get(id).textContent.trim()).join('; exhibit ')}`;
    }
  };
}

// Clicking or tapping in the room: a ring opens its exhibit; so does a picture on the wall, revealed
// or not (it is visible before the narration names it, so it must answer a click). Moving the mouse
// over a ring lights it and its thumbnail.
function wirePicking(canvas, room, rail, pick) {
  // A thumbnail with keyboard focus keeps its ring lit when the mouse moves off a ring.
  const focusedRail = () => { const a = document.activeElement; return (a && a.dataset && a.dataset.rail) || null; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  // One press at a time: a second finger's lift is not a click.
  let down = null;
  canvas.addEventListener('pointerdown', e => { if (!down || !e.isPrimary) down = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null; });
  canvas.addEventListener('pointercancel', e => { if (down && e.pointerId === down.id) down = null; });
  canvas.addEventListener('pointerup', e => {
    const d = down;
    if (!d || e.pointerId !== d.id) return;
    down = null;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return; // a drag, not a click
    const ring = room.ringAt(e.clientX, e.clientY);
    if (ring) { pick(ring); return; }
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, room.camera);
    for (const hit of ray.intersectObjects([...room.exhibitMeshes.values()], true)) {
      let o = hit.object;
      while (o && !o.userData.exhibitId) o = o.parent;
      if (o) { pick(o.userData.exhibitId); return; }
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const id = room.ringAt(e.clientX, e.clientY);
    canvas.style.cursor = id ? 'pointer' : '';
    if (id !== rail.hovered() && !(id === null && focusedRail() === rail.hovered())) rail.hover(id);
  });
  canvas.addEventListener('pointerleave', () => {
    canvas.style.cursor = '';
    if (rail.hovered() !== null && focusedRail() !== rail.hovered()) rail.hover(null);
  });
}

// Look-around buttons (reconstructed places): shown only once the 3D room is running.
function wireViewpoints(room, onChoose = () => {}) {
  const group = document.querySelector('[data-look-around]');
  if (!group || !room.viewpoints.length) return;
  for (const b of group.querySelectorAll('button[data-viewpoint]')) {
    if (room.viewpoints.includes(b.dataset.viewpoint)) b.addEventListener('click', () => { onChoose(); room.lookFrom(b.dataset.viewpoint); });
    else b.hidden = true;
  }
  group.hidden = false;
}
