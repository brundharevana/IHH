// Hotspot rings (real-scan museum spec, Hotspots; REF-tapestry-v2 section 7.3, our own recipe):
// a glowing numbered ring per exhibit, drawn in 3D and always facing the viewer. Its plane is
// RING.world across; the ring drawn on it (the outer edge of its core band, RING.drawn of the plane)
// is held to RING.minPx-RING.maxPx on screen at any distance.
// Motion: rings appear RING.staggerMs apart and grow in; hover turns a ring warm amber (hover only)
// and grows it x RING.hoverScale. The ring the narration names is lit: x RING.litScale, a stronger
// halo and one slow pulse, and it alone breathes +/-RING.breathe over RING.breatheMs, only while
// `allowBreath()` (the narration plays, or soon after input; scene.js). Reduced motion: no breathing,
// pulse, grow-in or tweens.
// Occlusion (fix round 1): computed only when the eye arrives somewhere (occlude(eye); occlusion
// depends on the eye's position alone), against an occluder index (occlusion.js) built once, at three
// points across each ring. Two or more points behind the room: hidden (and not pickable; the rail
// still lists it). One: drawn with depth testing so the occluder covers its part. None: drawn on top
// (depthTest false), so a ring never sinks into the wall it hangs in front of when seen obliquely.
// Rings are also hidden while the camera travels (setTravelling) and while the panel is open.
// The ring is drawn by a fragment shader (no texture); the numbers come from one shared digit atlas
// without mipmaps.
import * as THREE from 'three';
import { reducedMotion as prefersReducedMotion } from './camera.js';
import { createOccluderIndex } from './occlusion.js';
import { RING_WORLD, RING_DRAWN } from './framing.js';
import { BACKING, DIGIT } from './ringdigit.js';

export const RING = Object.freeze({
  world: RING_WORLD, drawn: RING_DRAWN, minPx: 44, maxPx: 120,
  revealMs: 450, staggerMs: 100,
  breathe: 0.02, breatheMs: 4000,
  hoverScale: 1.08, hoverMs: 200,
  litScale: 1.18, litMs: 300, pulse: 0.06, pulseMs: 1600,
  // Occlusion sample points sit this share of the drawn radius either side of the centre.
  sampleSpread: 0.6,
});
// Digit atlas cell (px) at scale 1 (phone); desktop uses scale 2. One atlas for all rings.
export const RING_ATLAS = Object.freeze({ cellW: 40, cellH: 64, phone: 1, desktop: 2 });
export const IDLE = Object.freeze({ core: [255, 248, 238], glow: [255, 248, 238] });
export const AMBER = Object.freeze({ core: [255, 214, 150], glow: [255, 190, 105] });
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
export const ringColours = warm => ({ core: mix(IDLE.core, AMBER.core, warm), glow: mix(IDLE.glow, AMBER.glow, warm) });

// On-screen size (CSS px) of an object `world` metres across at `distance` with a vertical field of
// `fovDeg` on a canvas `viewportH` px tall.
export function ringPixels(world, distance, fovDeg, viewportH) {
  return (world * viewportH) / (2 * Math.max(1e-6, distance) * Math.tan((fovDeg * Math.PI) / 360));
}
export const easeOutQuad = t => { const x = Math.min(1, Math.max(0, t)); return x * (2 - x); };

// Digits 0-9 side by side, white on transparent, no mipmaps (a ring is never minified much).
export function digitAtlas(scale = 1) {
  if (typeof document === 'undefined') return null;
  const w = RING_ATLAS.cellW * scale, h = RING_ATLAS.cellH * scale;
  const c = document.createElement('canvas');
  c.width = w * 10; c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${Math.round(h * 0.86)}px Poppins, system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 10; i++) ctx.fillText(String(i), w * i + w / 2, h / 2 + h * 0.04);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  return t;
}

const VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Radii are shares of the plane's half-size: disc to 0.84, halo 0.76-1.0 (peak 0.88-0.92), solid core
// band 0.88-0.92 (the drawn ring), then the number on an opaque dark backing disc (ringdigit.js
// BACKING, reaching past the digits: 4.5:1 or more for the white digits over any background, checked
// by the contrast gate from the same constants).
const f = v => v.toFixed(4);
const FRAG = /* glsl */`
uniform sampler2D atlas;
uniform float hasAtlas;
uniform vec2 digits;
uniform float count;
uniform float cellAspect;
uniform float warm;
uniform float lit;
uniform float opacity;
uniform vec3 coreIdle;
uniform vec3 coreWarm;
uniform vec3 glowWarm;
varying vec2 vUv;
vec4 over(vec4 top, vec4 under) {
  float a = top.a + under.a * (1.0 - top.a);
  vec3 c = (top.rgb * top.a + under.rgb * under.a * (1.0 - top.a)) / max(a, 1e-4);
  return vec4(c, a);
}
void main() {
  vec2 p = vUv - 0.5;
  float d = length(p) * 2.0;
  float aa = max(fwidth(d), 1e-3);
  vec3 core = mix(coreIdle, coreWarm, warm);
  vec3 glow = mix(coreIdle, glowWarm, warm);
  vec4 col = vec4(0.0);
  float disc = (1.0 - smoothstep(0.84 - aa, 0.84, d)) * mix(0.18, 0.36, clamp(d / 0.84, 0.0, 1.0)) * (1.0 + 0.9 * lit);
  col = over(vec4(coreIdle, disc), col);
  float halo = smoothstep(0.76, 0.88, d) * (1.0 - smoothstep(0.92, 1.0, d)) * (0.4 + 0.45 * lit + 0.15 * warm);
  col = over(vec4(glow, halo), col);
  float band = smoothstep(0.88 - aa, 0.88, d) * (1.0 - smoothstep(0.92, 0.92 + aa, d));
  col = over(vec4(core, band), col);
  col = over(vec4(${f(BACKING.rgb[0] / 255)}, ${f(BACKING.rgb[1] / 255)}, ${f(BACKING.rgb[2] / 255)}, ${f(BACKING.alpha)} * (1.0 - smoothstep(${f(BACKING.radius)} - aa, ${f(BACKING.radius)}, d))), col);
  if (hasAtlas > 0.5) {
    float h = count > 1.5 ? ${f(DIGIT.h2)} : ${f(DIGIT.h)};
    float w = h * cellAspect;
    vec2 q = vec2((p.x + w * count * 0.5) / w, (p.y + h * 0.5) / h);
    if (q.x >= 0.0 && q.x < count && q.y >= 0.0 && q.y <= 1.0) {
      float k = floor(q.x);
      float digit = k < 0.5 ? digits.x : digits.y;
      float a = texture2D(atlas, vec2((digit + fract(q.x)) / 10.0, q.y)).a;
      col = over(vec4(1.0, 1.0, 1.0, a), col);
    }
  }
  if (d > 1.0) col.a = 0.0;
  gl_FragColor = vec4(col.rgb, col.a * opacity);
}`;
const rgb = a => new THREE.Vector3(a[0] / 255, a[1] / 255, a[2] / 255);

// exhibits: [{ id, number, anchor: Vector3 (world), own?: Object3D (its exhibit, never its occluder) }].
// opts: index (an occluder index) or occluders (Object3D[] or a function returning them; indexed once
// on first use), now, reducedMotion, allowBreath, viewportHeight (CSS px), atlasScale.
export function createRings(scene, exhibits, opts = {}) {
  const {
    occluders = [], now = () => performance.now(), reducedMotion = prefersReducedMotion,
    viewportHeight = () => 900, atlasScale = RING_ATLAS.phone, allowBreath = () => true,
  } = opts;
  let index = opts.index || null;
  const group = new THREE.Group(); group.name = 'rings';
  scene.add(group);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const atlas = digitAtlas(atlasScale);
  const rings = new Map();
  exhibits.forEach((ex, i) => {
    const n = Math.max(0, Math.min(99, Math.round(ex.number) || 0)), two = n >= 10;
    const material = new THREE.ShaderMaterial({
      name: 'hotspot-ring', vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        atlas: { value: atlas }, hasAtlas: { value: atlas ? 1 : 0 },
        digits: { value: new THREE.Vector2(two ? Math.floor(n / 10) : n, n % 10) }, count: { value: two ? 2 : 1 },
        cellAspect: { value: RING_ATLAS.cellW / RING_ATLAS.cellH },
        warm: { value: 0 }, lit: { value: 0 }, opacity: { value: 1 },
        coreIdle: { value: rgb(IDLE.core) }, coreWarm: { value: rgb(AMBER.core) }, glowWarm: { value: rgb(AMBER.glow) },
      },
      transparent: true, depthWrite: false, depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `ring-${ex.id}`; mesh.renderOrder = 9999; mesh.visible = false;
    mesh.userData.ringId = ex.id; mesh.userData.number = ex.number;
    mesh.position.copy(ex.anchor);
    group.add(mesh);
    rings.set(ex.id, {
      id: ex.id, index: i, mesh, own: ex.own || null, anchor: ex.anchor.clone(),
      shownAt: null, occluded: false, partial: false, blockedSamples: 0,
      hover: false, hoverFrom: 0, hoverTo: 0, hoverT0: -Infinity,
      active: false, litFrom: 0, litTo: 0, litT0: -Infinity, activeAt: -Infinity,
      basePx: 0, px: 0, breath: 1, hoverMul: 1, litMul: 1, pulseMul: 1, warm: 0, lit: 0, grow: 0,
    });
  });
  let hiddenAll = false, travelling = false, hovered = null, lastEye = null, stale = false;
  const tween = (from, to, t0, ms, t) => from + (to - from) * easeOutQuad((t - t0) / ms);
  const indexOf = () => {
    if (!index) {
      const roots = (typeof occluders === 'function' ? occluders() : occluders) || [];
      index = createOccluderIndex(roots, { skip: o => o === group || Boolean(o.userData && o.userData.ringId), owners: exhibits.map(e => e.own).filter(Boolean) });
    }
    return index;
  };

  // Occlusion from the eye at `eye` (a Vector3): three points across each ring.
  function occlude(eye) {
    lastEye = eye.clone();
    if (hiddenAll) { stale = true; return; }
    stale = false;
    const idx = indexOf(), up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3();
    const spread = (RING.world * RING.drawn * RING.sampleSpread) / 2;
    for (const r of rings.values()) {
      side.copy(r.anchor).sub(eye).cross(up);
      if (side.lengthSq() < 1e-12) side.set(1, 0, 0);
      side.normalize().multiplyScalar(spread);
      let k = 0;
      for (const s of [0, 1, -1]) if (idx.blocked(eye, r.anchor.clone().addScaledVector(side, s), r.own)) k++;
      r.blockedSamples = k; r.occluded = k >= 2; r.partial = k === 1;
      r.mesh.material.depthTest = r.partial;
    }
  }

  function update(camera, { viewportH = viewportHeight() } = {}) {
    const t = now(), reduced = reducedMotion(), breathe = !reduced && allowBreath();
    const eye = camera.getWorldPosition(new THREE.Vector3());
    const q = camera.getWorldQuaternion(new THREE.Quaternion());
    for (const r of rings.values()) {
      if (r.shownAt === null || t < r.shownAt) { r.mesh.visible = false; continue; }
      const dist = r.anchor.distanceTo(eye);
      const plane = ringPixels(RING.world, dist, camera.fov, viewportH); // px of the plane unclamped
      const drawnRaw = plane * RING.drawn;
      r.basePx = Math.min(RING.maxPx, Math.max(RING.minPx, drawnRaw));
      r.grow = reduced ? 1 : easeOutQuad((t - r.shownAt) / RING.revealMs);
      r.breath = r.active && breathe ? 1 + RING.breathe * Math.sin((2 * Math.PI * (t - r.activeAt)) / RING.breatheMs) : 1;
      const h = reduced ? r.hoverTo : tween(r.hoverFrom, r.hoverTo, r.hoverT0, RING.hoverMs, t);
      r.hoverMul = 1 + (RING.hoverScale - 1) * h; r.warm = h;
      r.lit = reduced ? r.litTo : tween(r.litFrom, r.litTo, r.litT0, RING.litMs, t);
      r.litMul = 1 + (RING.litScale - 1) * r.lit;
      const pt = (t - r.activeAt) / RING.pulseMs;
      r.pulseMul = r.active && !reduced && pt >= 0 && pt <= 1 ? 1 + RING.pulse * Math.sin(Math.PI * pt) : 1;
      r.px = Math.max(RING.minPx, r.basePx * r.breath * r.hoverMul * r.litMul * r.pulseMul);
      const world = (r.px / Math.max(1e-6, drawnRaw)) * RING.world * r.grow;
      r.mesh.scale.set(world, world, 1);
      r.mesh.quaternion.copy(q);
      const u = r.mesh.material.uniforms;
      u.warm.value = r.warm; u.lit.value = r.lit;
      r.mesh.visible = !hiddenAll && !travelling && !r.occluded;
    }
    group.updateMatrixWorld(true);
  }

  const setHover = id => {
    if (id === hovered) return;
    const t = now();
    for (const r of rings.values()) {
      const on = r.id === id;
      if (on === r.hover) continue;
      const cur = tween(r.hoverFrom, r.hoverTo, r.hoverT0, RING.hoverMs, t);
      r.hover = on; r.hoverFrom = cur; r.hoverTo = on ? 1 : 0; r.hoverT0 = t;
    }
    hovered = rings.has(id) ? id : null;
  };

  return {
    group, atlas,
    // Show rings (cumulative), each RING.staggerMs after the one before in this call.
    reveal(ids) {
      const t = now();
      let k = 0;
      for (const id of ids) { const r = rings.get(id); if (r && r.shownAt === null) r.shownAt = t + RING.staggerMs * k++; }
    },
    setActive(ids) {
      const set = new Set(ids === null || ids === undefined ? [] : Array.isArray(ids) ? ids : [ids]), t = now();
      for (const r of rings.values()) {
        const on = set.has(r.id);
        if (on === r.active) continue;
        const cur = tween(r.litFrom, r.litTo, r.litT0, RING.litMs, t);
        r.active = on; r.litFrom = cur; r.litTo = on ? 1 : 0; r.litT0 = t;
        if (on) r.activeAt = t;
      }
    },
    setHover,
    setHidden(v) {
      hiddenAll = Boolean(v);
      if (hiddenAll) for (const r of rings.values()) r.mesh.visible = false;
      else if (stale && lastEye) occlude(lastEye);
    },
    setTravelling(v) { travelling = Boolean(v); if (travelling) for (const r of rings.values()) r.mesh.visible = false; },
    occlude,
    update,
    // The visible ring a ray hits (inside its circle), nearest first, or null.
    pick(raycaster) {
      const meshes = [...rings.values()].filter(r => r.mesh.visible).map(r => r.mesh);
      for (const h of raycaster.intersectObjects(meshes, false)) {
        if (!h.uv || Math.hypot(h.uv.x - 0.5, h.uv.y - 0.5) <= 0.5) return h.object.userData.ringId;
      }
      return null;
    },
    // Still changing without camera motion: growing in, a hover or lit tween, the lit pulse.
    animating() {
      const t = now();
      if (reducedMotion()) return [...rings.values()].some(r => r.shownAt !== null && t < r.shownAt);
      for (const r of rings.values()) {
        if (r.shownAt === null) continue;
        if (t < r.shownAt + RING.revealMs || t < r.hoverT0 + RING.hoverMs || t < r.litT0 + RING.litMs) return true;
        if (r.active && t < r.activeAt + RING.pulseMs) return true;
      }
      return false;
    },
    // Breathing needs idle frames: only for a lit ring on screen, and only while allowBreath().
    breathing: () => !reducedMotion() && allowBreath() && !hiddenAll && !travelling && [...rings.values()].some(r => r.active && r.mesh.visible),
    state(id) {
      const r = rings.get(id);
      if (!r) return null;
      return {
        visible: r.mesh.visible, occluded: r.occluded, partial: r.partial, blockedSamples: r.blockedSamples, depthTest: r.mesh.material.depthTest,
        px: r.px, basePx: r.basePx, breath: r.breath, hoverMul: r.hoverMul, litMul: r.litMul, pulseMul: r.pulseMul,
        warm: r.warm, hover: r.hover, active: r.active, lit: r.lit, position: r.anchor.toArray(),
      };
    },
    dispose() {
      scene.remove(group);
      geometry.dispose();
      if (atlas) atlas.dispose();
      for (const r of rings.values()) r.mesh.material.dispose();
    },
  };
}
