// Journey globe: a three.js Earth (NASA Blue Marble, public domain) with a soft atmosphere, a dot
// at each mapped stop's named place, numbered DOM pins over them and great-circle arcs between
// consecutive stops. Renders on demand: the loop runs only while the camera moves or an arc draws.
// Drag turns the globe (with a short glide after release), wheel and pinch zoom within limits;
// there is no pan. Under reduced motion every flight jumps, arcs appear whole, nothing glides.
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { latLonToVec3, orbitAngles, greatCirclePoints, centreOf, fanOut, nearestAngle } from './geo.js';
import { sceneStats } from './stats.js';

export const TEXTURES = { large: '/globe/earth-4096.webp', small: '/globe/earth-2048.webp' };
export const FOV = 32;
const MIN_DIST = 1.35, MAX_DIST = 6;
const ARC_COLOR = 0xffc65c, DOT_COLOR = 0xffd166;
const PIN_GAP = 34; // px between fanned pin labels (pins are 32 px)

const ATMOSPHERE = {
  vertex: `varying vec3 vN; varying vec3 vV;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv; }`,
  // Outer glow on the back faces of a larger shell (radius R): b is how far the view ray passes
  // from the centre (R * sqrt(1 - d^2) for a back face), so the glow is brightest at the Earth's
  // edge (b = 1) and fades to nothing at the shell's edge (b = R).
  halo: `varying vec3 vN; varying vec3 vV; uniform vec3 color; uniform float R;
    void main() { float d = dot(vN, vV); float b = R * sqrt(max(0.0, 1.0 - d * d));
      float i = pow(clamp((R - b) / (R - 1.0), 0.0, 1.0), 3.0);
      gl_FragColor = vec4(color * i * 0.55, i); }`,
  // Haze over the globe itself: thin at the centre, a soft blue at the edge.
  haze: `varying vec3 vN; varying vec3 vV; uniform vec3 color;
    void main() { float f = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 3.0); gl_FragColor = vec4(color * f * 0.5, f * 0.5); }`,
};

// Vertical field of view: FOV on a wide stage; on a tall (phone) stage it widens so the
// horizontal field is still FOV and the whole globe fits across.
export function fovFor(aspect) {
  const r = Math.PI / 180;
  return Math.max(FOV, (2 * Math.atan(Math.tan((FOV * r) / 2) / aspect)) / r);
}
// Distance that fits the whole globe (radius 1) in the narrower field with a margin for the glow.
export function fitDistance(aspect, margin = 1.1) {
  const v = (fovFor(aspect) * Math.PI) / 180, h = 2 * Math.atan(Math.tan(v / 2) * aspect);
  return Math.min(MAX_DIST, margin / Math.sin(Math.min(v, h) / 2));
}

export async function startGlobe({ canvas, stage, stops, pins, leaders, reduced = () => false, phone = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const large = !phone && renderer.capabilities.maxTextureSize >= 4096;
  const map = await new THREE.TextureLoader().loadAsync(large ? TEXTURES.large : TEXTURES.small);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 50);
  scene.add(camera);
  // Gentle light that travels with the camera: the side facing the visitor is always lit, with a
  // soft fall-off toward the edge so the globe reads as round.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.35));
  const sun = new THREE.DirectionalLight(0xfff6ea, 1.5);
  sun.position.set(-1.2, 1.1, 2.2);
  camera.add(sun);

  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, phone ? 64 : 96, phone ? 48 : 64),
    new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0 }));
  scene.add(earth);
  const shell = (r, side, frag) => new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE.vertex, fragmentShader: frag, uniforms: { color: { value: new THREE.Color(0x8ab8ff) }, R: { value: r } },
    side, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(shell(1.012, THREE.FrontSide, ATMOSPHERE.haze));
  scene.add(shell(1.12, THREE.BackSide, ATMOSPHERE.halo));

  // A small bright dot on the surface at each stop (hidden by the globe when on the far side).
  const dotGeo = new THREE.SphereGeometry(0.0085, 12, 8), dotMat = new THREE.MeshBasicMaterial({ color: DOT_COLOR });
  const at = new Map(), decor = [];
  for (const s of stops) {
    const p = new THREE.Vector3(...latLonToVec3(s.lat, s.lon, 1.002));
    at.set(s.id, p);
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(p);
    decor.push(dot);
    scene.add(dot);
  }

  // Arcs between consecutive stops; a hop within one town draws nothing. Drawn in by index range.
  const arcs = [];
  for (let i = 1; i < stops.length; i++) {
    const pts = greatCirclePoints(stops[i - 1], stops[i], { segments: 96, lift: 0.22, radius: 1.003 });
    if (!pts.length) continue;
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    const tubular = 128, radial = 6;
    const geo = new THREE.TubeGeometry(curve, tubular, 0.0042, radial, false);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: ARC_COLOR, transparent: true, opacity: 0.95 }));
    mesh.userData = { full: geo.index.count, step: radial * 6 };
    arcs.push(mesh);
    decor.push(mesh);
    scene.add(mesh);
  }
  let arcProgress = 0; // 0..arcs.length
  const setArcs = v => {
    arcProgress = Math.max(0, Math.min(arcs.length, v));
    arcs.forEach((m, i) => {
      const f = Math.max(0, Math.min(1, arcProgress - i));
      const { full, step } = m.userData;
      m.geometry.setDrawRange(0, Math.round((full / step) * f) * step);
      m.visible = f > 0;
    });
  };
  setArcs(0);

  CameraControls.install({ THREE });
  const cc = new CameraControls(camera, canvas);
  const A = CameraControls.ACTION;
  cc.mouseButtons.left = A.ROTATE; cc.mouseButtons.middle = A.DOLLY; cc.mouseButtons.right = A.NONE; cc.mouseButtons.wheel = A.DOLLY;
  cc.touches.one = A.TOUCH_ROTATE; cc.touches.two = A.TOUCH_DOLLY; cc.touches.three = A.NONE;
  cc.truckSpeed = 0; cc.dollyToCursor = false;
  cc.minDistance = MIN_DIST; cc.maxDistance = MAX_DIST;
  cc.minPolarAngle = 0.18; cc.maxPolarAngle = Math.PI - 0.18;
  cc.smoothTime = 0.9; cc.draggingSmoothTime = 0.12;
  // Turning speed follows the zoom, so a drag moves the land under the finger at any distance.
  const tuneSpeed = () => { const s = Math.max(0.12, (cc.distance - 1) * 0.42); cc.azimuthRotateSpeed = s; cc.polarRotateSpeed = s; };
  tuneSpeed();

  let fit = 3;
  // Opening view: the stops' centre, but no further north than their mean latitude (the centre of
  // a long east-west journey lies on a great circle that bulges toward the pole).
  const c0 = centreOf(stops), meanLat = stops.reduce((a, s) => a + s.lat, 0) / (stops.length || 1);
  const centre = { lat: Math.min(c0.lat, meanLat - 6), lon: c0.lon };
  const startAngles = orbitAngles(latLonToVec3(centre.lat, centre.lon));

  // Pins: DOM buttons placed after every render on their dot; a pin on the far side is hidden.
  // Pins of stops in one town are fanned out (fanOut) with a leader line to their dot.
  const proj = new THREE.Vector3(), camDir = new THREE.Vector3();
  const placePins = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camDir.copy(camera.position).normalize();
    const horizon = 1 / camera.position.length() + 0.02;
    const shown = [];
    for (const s of stops) {
      const p = at.get(s.id), btn = pins.get(s.id);
      if (!btn) continue;
      const facing = p.clone().normalize().dot(camDir) > horizon;
      proj.copy(p).project(camera);
      const x = ((proj.x + 1) / 2) * w, y = ((1 - proj.y) / 2) * h;
      if (!facing || x < 0 || x > w || y < 0 || y > h) { btn.dataset.offscreen = ''; continue; }
      delete btn.dataset.offscreen;
      shown.push({ id: s.id, x, y });
    }
    const layout = fanOut(shown, PIN_GAP);
    const lines = [];
    for (const [id, q] of layout) {
      const btn = pins.get(id);
      btn.style.setProperty('--x', `${q.x.toFixed(1)}px`); btn.style.setProperty('--y', `${q.y.toFixed(1)}px`);
      if (q.x !== q.ax || q.y !== q.ay) lines.push(`<line x1="${q.ax.toFixed(1)}" y1="${q.ay.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" />`);
    }
    if (leaders) leaders.innerHTML = lines.join('');
  };

  let renders = 0, lost = false;
  const afterRender = new Set();
  const render = () => { if (lost) return; renderer.render(scene, camera); renders++; placePins(); afterRender.forEach(f => f()); };

  // Arc draw-in: one arc after another, about 1.4 s each.
  let arcAnim = null;
  const drawArcs = () => {
    if (reduced()) { setArcs(arcs.length); render(); return; }
    arcAnim = { t0: performance.now(), from: arcProgress };
    kick();
  };
  const stepArcs = now => {
    if (!arcAnim) return false;
    const v = arcAnim.from + (now - arcAnim.t0) / 1400;
    setArcs(v);
    if (v >= arcs.length) arcAnim = null;
    return true;
  };

  const timer = new THREE.Timer();
  let running = false;
  // Manual camera (the aerial zoom, aerial.js): while `manual` is set the controls never move the
  // camera (camera-controls' update() always writes the camera); a `driver` step, when present,
  // places it each frame and returns false when done.
  let manual = false, driver = null;
  const tick = () => {
    timer.update();
    const delta = timer.getDelta(), now = performance.now();
    let moved = false;
    if (driver) {
      const d = driver;
      moved = true;
      if (!d.step(now)) { driver = null; d.resolve(true); }
    } else if (!manual) moved = cc.update(delta);
    const drawing = stepArcs(now);
    if (moved && !manual) tuneSpeed();
    if (moved || drawing) render();
    if (driver || moved || drawing || (!manual && cc.currentAction) || arcAnim) requestAnimationFrame(tick);
    else running = false;
  };
  const kick = () => { if (!running && !lost) { running = true; timer.update(); requestAnimationFrame(tick); } };
  for (const ev of ['controlstart', 'control', 'transitionstart']) cc.addEventListener(ev, kick);
  canvas.addEventListener('wheel', kick, { passive: true });

  // Glide after a drag: keep turning a little in the direction of the last movement, easing out.
  let last = null, vel = [0, 0];
  cc.addEventListener('controlstart', () => { last = { a: cc.azimuthAngle, p: cc.polarAngle, t: performance.now() }; vel = [0, 0]; });
  cc.addEventListener('control', () => {
    const now = performance.now(), dt = Math.max(1, now - last.t);
    vel = [(cc.azimuthAngle - last.a) / dt, (cc.polarAngle - last.p) / dt];
    last = { a: cc.azimuthAngle, p: cc.polarAngle, t: now };
  });
  cc.addEventListener('controlend', () => {
    if (reduced() || !last || performance.now() - last.t > 80) return;
    const k = 260; // ms of carry
    cc.rotate(Math.max(-0.6, Math.min(0.6, vel[0] * k)), Math.max(-0.3, Math.min(0.3, vel[1] * k)), true);
  });

  // While the stop card covers part of the stage, shift the projection so the centre of the view
  // (where a flight puts the stop) sits in the middle of the part still visible.
  let frame = { x: 0, y: 0 };
  const applyFrame = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (frame.x || frame.y) camera.setViewOffset(w, h, frame.x * w, frame.y * h, w, h);
    else camera.clearViewOffset();
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = fovFor(camera.aspect);
    fit = fitDistance(camera.aspect);
    applyFrame(); camera.updateProjectionMatrix();
    render();
  };
  new ResizeObserver(resize).observe(canvas);

  // Context loss (GPU reset, too many contexts): the page shows the flat map until it is restored.
  const onLost = new Set();
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; running = false; onLost.forEach(f => f(true)); });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false; map.needsUpdate = true;
    onLost.forEach(f => f(false));
    resize(); kick();
  });

  // Opening view: every pin in sight. A slow settle from a little further out and round, unless
  // the visitor asked for reduced motion.
  const w0 = canvas.clientWidth || 1, h0 = canvas.clientHeight || 1;
  camera.aspect = w0 / h0; camera.fov = fovFor(camera.aspect); fit = fitDistance(camera.aspect);
  const settle = !reduced();
  cc.rotateTo(startAngles.azimuth + (settle ? 0.55 : 0), startAngles.polar + (settle ? -0.12 : 0), false);
  cc.dollyTo(fit * (settle ? 1.18 : 1), false);
  cc.update(0);
  resize();
  if (settle) {
    const prev = cc.smoothTime; cc.smoothTime = 1.6;
    kick();
    Promise.all([cc.rotateTo(startAngles.azimuth, startAngles.polar, true), cc.dollyTo(fit, true)]).then(() => { cc.smoothTime = prev; });
    setTimeout(drawArcs, 700);
  } else {
    drawArcs();
  }

  const flyDistance = () => Math.min(fit, Math.max(2.1, fit * 0.72));
  const NEAR = camera.near, FAR = camera.far;
  // Hand the camera to aerial.js. take(): controls off; drive(step): step(now) places the camera
  // each frame until it returns false (resolves true), or until cancelled (resolves false);
  // release(dir, dist): back to the controls, above `dir` at globe distance `dist`.
  const host = {
    THREE, scene, camera, renderer, flyDistance,
    dirOf: id => (at.get(id) ? at.get(id).clone().normalize() : null),
    take() {
      if (manual) return;
      manual = true; cc.enabled = false; arcAnim = null; setArcs(arcs.length);
    },
    drive(step) {
      host.take();
      if (driver) { const d = driver; driver = null; d.resolve(false); }
      return new Promise(resolve => { driver = { step, resolve }; kick(); });
    },
    cancel() { if (driver) { const d = driver; driver = null; d.resolve(false); } },
    // Place the camera straight above `dir` at globe distance `dist`, north up, with near and far
    // planes that suit the altitude. Close to the ground the stop dots (54 km across) and the arcs
    // would fill the view, so they hide below about 1500 km.
    place(dir, dist) {
      const show = dist > 1.24;
      decor.forEach(m => { m.visible = show && (m.geometry === dotGeo || m.geometry.drawRange.count > 0); });
      camera.position.set(dir[0] * dist, dir[1] * dist, dir[2] * dist);
      camera.near = Math.max(1e-8, Math.min(NEAR, (dist - 1) * 0.25));
      camera.far = dist + 2;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
    },
    release(dir, dist) {
      if (!manual) return;
      host.cancel();
      camera.near = NEAR; camera.far = FAR; camera.updateProjectionMatrix();
      decor.forEach(m => { m.visible = true; });
      setArcs(arcProgress);
      const { azimuth, polar } = orbitAngles(dir);
      cc.normalizeRotations();
      cc.rotateTo(nearestAngle(cc.azimuthAngle, azimuth), Math.max(cc.minPolarAngle, Math.min(cc.maxPolarAngle, polar)), false);
      cc.dollyTo(Math.max(MIN_DIST, Math.min(MAX_DIST, dist)), false);
      manual = false; cc.enabled = true;
      cc.update(0); tuneSpeed(); render();
    },
    manual: () => manual,
    frame: () => ({ ...frame }),
    onRender: f => { afterRender.add(f); return () => afterRender.delete(f); },
    render,
    lost: () => lost,
  };
  return {
    host,
    render,
    onContextLost: f => onLost.add(f),
    // Turn the globe so the stop faces the visitor, at a regional zoom; a jump under reduced motion.
    flyTo(id) {
      const p = at.get(id);
      if (!p || manual) return Promise.resolve();
      const { azimuth, polar } = orbitAngles(p.toArray());
      const smooth = !reduced();
      cc.normalizeRotations();
      kick();
      // Under 30 degrees north the view tilts a touch so the stop sits a little above the centre.
      return Promise.all([
        cc.rotateTo(nearestAngle(cc.azimuthAngle, azimuth), Math.max(cc.minPolarAngle, polar), smooth),
        cc.dollyTo(flyDistance(), smooth),
      ]).then(render);
    },
    setFrame(x, y) { frame = { x, y }; applyFrame(); camera.updateProjectionMatrix(); render(); },
    debug: {
      renders: () => renders,
      moving: () => running,
      arcs: () => ({ count: arcs.length, progress: arcProgress }),
      texture: () => ({ url: large ? TEXTURES.large : TEXTURES.small, width: map.image.width, height: map.image.height }),
      stats: () => sceneStats(scene),
      pose: () => ({ distance: manual ? camera.position.length() : cc.distance, azimuth: cc.azimuthAngle, polar: cc.polarAngle, fit, manual }),
      // Client point of a stop's dot, for e2e clicks.
      screenOf: id => {
        const p = at.get(id); if (!p) return null;
        const q = p.clone().project(camera), r = canvas.getBoundingClientRect();
        return { x: r.left + ((q.x + 1) / 2) * r.width, y: r.top + ((1 - q.y) / 2) * r.height };
      },
      loseContext: () => renderer.getContext().getExtension('WEBGL_lose_context'),
    },
  };
}
