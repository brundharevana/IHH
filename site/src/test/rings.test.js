// Hotspot rings (src/museum/rings.js): glowing numbered rings drawn in 3D, always facing the viewer,
// the drawn ring 44-120 px on screen at any distance, hidden behind walls (an occlusion test at three
// points, run when the eye arrives) but still listed in the rail; hover turns them warm amber and grows
// them 8 % over 200 ms; the narrated ring is lit (x1.18, one pulse) and alone breathes (real-scan
// museum spec, Hotspots; REF-tapestry-v2 section 7.3; Task 4 fix round 1).
import { it, expect, describe, beforeAll, afterAll } from 'vitest';
import * as THREE from 'three';
import { createRings, ringPixels, RING, ringColours, AMBER } from '../museum/rings.js';
import { createRail } from '../ui/rail.js';

// Canvas stub so number textures are drawn (and sized) as in the browser.
const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 20 }) }, { get: (o, k) => (k in o ? o[k] : () => {}), set: () => true });
beforeAll(() => { globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) }; });
afterAll(() => { delete globalThis.document; });

const H = 900;
const cameraAt = (eye, target, aspect = 1.6, fov = 80.9) => {
  const c = new THREE.PerspectiveCamera(fov, aspect, 0.05, 60);
  c.position.set(...eye); c.lookAt(...target); c.updateMatrixWorld(true);
  return c;
};
const make = ({ occluders = [], reduced = false, exhibits, allowBreath = () => true } = {}) => {
  const clock = { t: 0 };
  const scene = new THREE.Scene();
  const ex = exhibits || [
    { id: 'ex1', number: 1, anchor: new THREE.Vector3(0, 1.6, -3) },
    { id: 'ex2', number: 2, anchor: new THREE.Vector3(1, 1.6, -3) },
  ];
  const rings = createRings(scene, ex, { occluders, now: () => clock.t, reducedMotion: () => reduced, viewportHeight: () => H, allowBreath });
  return { clock, scene, rings };
};
// The eye arrives at the camera's place (occlusion is computed there), then frames pass.
const settle = (clock, rings, camera, ms = 1000) => { rings.occlude(camera.position); for (let t = 0; t < ms; t += 20) { clock.t += 20; rings.update(camera); } };

describe('size on screen', () => {
  it('is a 0.45 m plane whose drawn ring (0.92 of it) is held to 44-120 px at any distance', () => {
    expect(RING.world).toBe(0.45);
    expect(RING.drawn).toBeGreaterThanOrEqual(0.88);
    expect(RING.drawn).toBeLessThanOrEqual(0.92);
    expect([RING.minPx, RING.maxPx]).toEqual([44, 120]);
    const f = (d) => ringPixels(RING.world, d, 80.9, H);
    expect(f(3)).toBeGreaterThan(44);
    expect(f(3)).toBeLessThan(120);
    const { clock, rings } = make({ exhibits: [{ id: 'near', number: 1, anchor: new THREE.Vector3(0, 1.6, -0.5) }, { id: 'far', number: 2, anchor: new THREE.Vector3(0, 1.6, -40) }] });
    rings.reveal(['near', 'far']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -1]);
    settle(clock, rings, camera);
    // Unclamped they would be ~475 px and ~6 px.
    expect(ringPixels(RING.world, 0.5, 80.9, H)).toBeGreaterThan(400);
    expect(ringPixels(RING.world, 40, 80.9, H)).toBeLessThan(20);
    for (const id of ['near', 'far']) {
      const s = rings.state(id);
      // Breathing (+/-2 %) never takes a ring under the 44 px touch-target floor.
      expect(s.px, id).toBeGreaterThanOrEqual(44);
      expect(s.px, id).toBeLessThanOrEqual(120 * 1.02 + 1e-9);
    }
    expect(rings.state('near').basePx).toBe(120);
    expect(rings.state('far').basePx).toBe(44);
  });
  it('faces the viewer (billboard)', () => {
    const { clock, rings, scene } = make();
    rings.reveal(['ex1']);
    const camera = cameraAt([2, 1.6, 1], [0, 1.6, -3]);
    settle(clock, rings, camera);
    const mesh = scene.getObjectByName('rings').children.find(m => m.userData.ringId === 'ex1');
    expect(mesh.quaternion.angleTo(camera.quaternion)).toBeLessThan(1e-6);
  });
  it('appears in turn, 100 ms apart', () => {
    const { clock, rings } = make();
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -1]);
    rings.reveal(['ex1', 'ex2']);
    clock.t = 50; rings.update(camera);
    expect(rings.state('ex1').visible).toBe(true);
    expect(rings.state('ex2').visible).toBe(false);
    clock.t = 120; rings.update(camera);
    expect(rings.state('ex2').visible).toBe(true);
    expect(RING.staggerMs).toBe(100);
  });
  it('only the lit ring breathes, +/-2 % over 4 s, and only while breathing is allowed; never under reduced motion', () => {
    expect([RING.breathe, RING.breatheMs]).toEqual([0.02, 4000]);
    const run = ({ reduced = false, allow = true, active = true }) => {
      const { clock, rings } = make({ reduced, allowBreath: () => allow });
      rings.reveal(['ex1', 'ex2']);
      if (active) rings.setActive(['ex1']);
      const camera = cameraAt([0, 1.6, 0], [0, 1.6, -1]);
      settle(clock, rings, camera, 2000);
      const seen = { ex1: [], ex2: [] };
      for (let i = 0; i < 200; i++) { clock.t += 20; rings.update(camera); for (const id of ['ex1', 'ex2']) seen[id].push(rings.state(id).breath); }
      return { rings, range: id => [Math.min(...seen[id]), Math.max(...seen[id])] };
    };
    const lit = run({});
    expect(lit.range('ex1')[0]).toBeCloseTo(0.98, 2);
    expect(lit.range('ex1')[1]).toBeCloseTo(1.02, 2);
    expect(lit.range('ex2')).toEqual([1, 1]); // not lit: still
    expect(lit.rings.breathing()).toBe(true);
    for (const o of [{ allow: false }, { reduced: true }, { active: false }]) {
      const r = run(o);
      expect(r.range('ex1'), JSON.stringify(o)).toEqual([1, 1]);
      expect(r.rings.breathing(), JSON.stringify(o)).toBe(false);
      expect(r.rings.animating(), JSON.stringify(o)).toBe(false); // nothing asks for frames
    }
  });
  it('the lit ring is x1.18 with one slow pulse, and stays cream: amber is for hover only', () => {
    expect(RING.litScale).toBe(1.18);
    const { clock, rings } = make({ allowBreath: () => false });
    rings.reveal(['ex1']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -3]);
    settle(clock, rings, camera, 600);
    const base = rings.state('ex1').px;
    rings.setActive(['ex1']);
    const pulse = [];
    for (let t = 0; t < 3000; t += 20) { clock.t += 20; rings.update(camera); pulse.push(rings.state('ex1').pulseMul); }
    expect(rings.state('ex1').litMul).toBeCloseTo(1.18, 9);
    expect(rings.state('ex1').px).toBeCloseTo(base * 1.18, 6);
    expect(rings.state('ex1').warm).toBe(0);
    expect(rings.state('ex1').lit).toBe(1);
    // One hump: up then down, once, then still.
    expect(Math.max(...pulse)).toBeGreaterThan(1.04);
    const humps = pulse.filter((v, i) => i > 0 && i < pulse.length - 1 && v > pulse[i - 1] && v >= pulse[i + 1]).length;
    expect(humps).toBe(1);
    expect(pulse.at(-1)).toBe(1);
    expect(rings.animating()).toBe(false);
  });
});

describe('occlusion', () => {
  it('a ring behind a wall is hidden (raycast against the room) yet stays listed in the rail', () => {
    // A wall between the visitor and exhibit 1; exhibit 2 is in the clear.
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 0.1), new THREE.MeshBasicMaterial());
    wall.position.set(0, 1.5, -1.5); wall.updateMatrixWorld(true);
    const room = new THREE.Group(); room.add(wall); room.updateMatrixWorld(true);
    const { clock, rings } = make({ occluders: [room] });
    rings.reveal(['ex1', 'ex2']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -3]);
    settle(clock, rings, camera);
    expect(rings.state('ex1').occluded).toBe(true);
    expect(rings.state('ex1').visible).toBe(false);
    expect(rings.state('ex2').visible).toBe(true);
    // Not pickable while hidden.
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    expect(rings.pick(ray)).toBe(null);
    // The rail still lists it, and choosing it there opens it.
    const btns = new Map(['ex1', 'ex2'].map(id => [id, fakeButton(id)]));
    const picked = [];
    const rail = createRail(btns, { rings, onPick: id => picked.push(id) });
    rail.reveal(['ex1', 'ex2']);
    expect(btns.get('ex1').hidden).toBe(false);
    btns.get('ex1').dispatchEvent(new Event('click'));
    expect(picked).toEqual(['ex1']);
    // Turning or moving without arriving changes nothing; arriving on the other side shows it.
    const camera2 = cameraAt([0, 1.6, -2], [0, 1.6, -3]);
    clock.t += 20; rings.update(camera2);
    expect(rings.state('ex1').visible).toBe(false);
    settle(clock, rings, camera2, 200);
    expect(rings.state('ex1').visible).toBe(true);
  });
  it('a ring partly behind a pillar (one of three points) is drawn with depth testing; two or more hide it', () => {
    // A thin pillar covering only the right-hand sample of ring 1 as seen from the eye.
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 3, 0.03), new THREE.MeshBasicMaterial());
    const side = (RING.world * RING.drawn * RING.sampleSpread) / 2;
    pillar.position.set(side / 2, 1.5, -1.5); pillar.updateMatrixWorld(true);
    const { clock, rings } = make({ occluders: [pillar] });
    rings.reveal(['ex1', 'ex2']);
    settle(clock, rings, cameraAt([0, 1.6, 0], [0, 1.6, -3]), 600);
    const s1 = rings.state('ex1');
    expect(s1.blockedSamples).toBe(1);
    expect(s1.visible).toBe(true);
    expect(s1.depthTest).toBe(true); // the pillar covers its part of the ring
    expect(rings.state('ex2').depthTest).toBe(false); // clear rings draw on top
  });
  it('no occlusion work while every ring is hidden (panel open); it is redone when they return', () => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 0.1), new THREE.MeshBasicMaterial());
    wall.position.set(0, 1.5, -1.5); wall.updateMatrixWorld(true);
    const { clock, rings } = make({ occluders: [wall] });
    rings.reveal(['ex1']);
    settle(clock, rings, cameraAt([0, 1.6, -2], [0, 1.6, -3]), 600);
    expect(rings.state('ex1').visible).toBe(true);
    rings.setHidden(true);
    const behind = cameraAt([0, 1.6, 0], [0, 1.6, -3]);
    rings.occlude(behind.position);
    expect(rings.state('ex1').occluded).toBe(false); // not computed while hidden
    rings.setHidden(false);
    expect(rings.state('ex1').occluded).toBe(true); // computed on return, for the eye it arrived at
  });
  it('the exhibit a ring belongs to never hides its own ring', () => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.05), new THREE.MeshBasicMaterial());
    frame.position.set(0, 1.6, -3.05); frame.updateMatrixWorld(true);
    // The anchor sits just inside the frame's front face: the ray to it crosses the frame.
    const anchor = new THREE.Vector3(0, 1.6, -3.04), camera = cameraAt([0.9, 1.6, -2.9], [0, 1.6, -3]);
    const own = make({ occluders: [frame], exhibits: [{ id: 'ex1', number: 1, anchor, own: frame }] });
    own.rings.reveal(['ex1']);
    settle(own.clock, own.rings, camera);
    expect(own.rings.state('ex1').visible).toBe(true);
    // Any other object in the same place hides it.
    const other = make({ occluders: [frame], exhibits: [{ id: 'ex1', number: 1, anchor }] });
    other.rings.reveal(['ex1']);
    settle(other.clock, other.rings, camera);
    expect(other.rings.state('ex1').occluded).toBe(true);
  });
});

describe('hover and highlight', () => {
  it('hover grows a ring x1.08 over 200 ms and turns it warm amber', () => {
    expect([RING.hoverScale, RING.hoverMs]).toEqual([1.08, 200]);
    expect(AMBER.core).toEqual([255, 214, 150]);
    expect(ringColours(1).core).toEqual(AMBER.core);
    expect(ringColours(0).core).toEqual([255, 248, 238]);
    const { clock, rings } = make();
    rings.reveal(['ex1']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -1]);
    settle(clock, rings, camera, 500);
    expect(rings.state('ex1').hoverMul).toBe(1);
    rings.setHover('ex1');
    clock.t += 100; rings.update(camera);
    expect(rings.state('ex1').hoverMul).toBeGreaterThan(1);
    expect(rings.state('ex1').hoverMul).toBeLessThan(1.08);
    clock.t += 100; rings.update(camera);
    expect(rings.state('ex1').hoverMul).toBeCloseTo(1.08, 9);
    expect(rings.state('ex1').warm).toBe(1);
    expect(rings.state('ex1').hover).toBe(true);
    rings.setHover(null);
    clock.t += 200; rings.update(camera);
    expect(rings.state('ex1').hoverMul).toBe(1);
    expect(rings.state('ex1').warm).toBe(0);
  });
  it('the line playing lights its ring (setActive)', () => {
    const { clock, rings } = make();
    rings.reveal(['ex1', 'ex2']);
    rings.setActive(['ex2']);
    settle(clock, rings, cameraAt([0, 1.6, 0], [0, 1.6, -1]), 400);
    expect(rings.state('ex2').active).toBe(true);
    expect(rings.state('ex2').lit).toBe(1);
    expect(rings.state('ex1').active).toBe(false);
    rings.setActive('ex1');
    expect(rings.state('ex1').active).toBe(true);
    expect(rings.state('ex2').active).toBe(false);
  });
  it('hides every ring while the panel is open', () => {
    const { clock, rings } = make();
    rings.reveal(['ex1']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -1]);
    settle(clock, rings, camera, 400);
    rings.setHidden(true); rings.update(camera);
    expect(rings.state('ex1').visible).toBe(false);
    rings.setHidden(false); rings.update(camera);
    expect(rings.state('ex1').visible).toBe(true);
  });
  it('picks the ring under the pointer', () => {
    const { clock, rings } = make();
    rings.reveal(['ex1']);
    const camera = cameraAt([0, 1.6, 0], [0, 1.6, -3]);
    settle(clock, rings, camera, 400);
    const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    expect(rings.pick(ray)).toBe('ex1');
    rings.dispose();
  });
});

// Rail and rings are one control in two places: hovering or focusing a thumbnail lights its ring,
// hovering a ring lights its thumbnail, and the narration lights both.
class FakeButton extends EventTarget {
  constructor(id) { super(); this.dataset = { rail: id }; this.hidden = true; this.attrs = {}; this.classes = new Set(); const self = this; this.classList = { toggle(c, on) { if (on === undefined) on = !self.classes.has(c); if (on) self.classes.add(c); else self.classes.delete(c); return on; }, contains: c => self.classes.has(c), add: c => self.classes.add(c), remove: c => self.classes.delete(c) }; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
}
function fakeButton(id) { return new FakeButton(id); }

describe('rail <-> rings', () => {
  it('hover and focus on a thumbnail light its ring; hovering a ring lights its thumbnail', () => {
    const { rings } = make();
    const btns = new Map(['ex1', 'ex2'].map(id => [id, fakeButton(id)]));
    const rail = createRail(btns, { rings });
    rail.reveal(['ex1', 'ex2']);
    btns.get('ex2').dispatchEvent(new Event('pointerenter'));
    expect(rings.state('ex2').hover).toBe(true);
    expect(btns.get('ex2').classList.contains('is-hover')).toBe(true);
    btns.get('ex2').dispatchEvent(new Event('pointerleave'));
    expect(rings.state('ex2').hover).toBe(false);
    btns.get('ex1').dispatchEvent(new Event('focus'));
    expect(rings.state('ex1').hover).toBe(true);
    btns.get('ex1').dispatchEvent(new Event('blur'));
    expect(rings.state('ex1').hover).toBe(false);
    // The other way: the canvas reports a ring under the pointer.
    rail.hover('ex2');
    expect(btns.get('ex2').classList.contains('is-hover')).toBe(true);
    expect(btns.get('ex1').classList.contains('is-hover')).toBe(false);
    expect(rings.state('ex2').hover).toBe(true);
    rail.hover(null);
    expect(btns.get('ex2').classList.contains('is-hover')).toBe(false);
    expect(rings.state('ex2').hover).toBe(false);
  });
  it('the narration lights the ring and its thumbnail together', () => {
    const { rings } = make();
    const btns = new Map(['ex1', 'ex2'].map(id => [id, fakeButton(id)]));
    const rail = createRail(btns, { rings });
    rail.setActive(['ex1']);
    expect(btns.get('ex1').classList.contains('is-active')).toBe(true);
    expect(btns.get('ex1').getAttribute('aria-current')).toBe('true');
    expect(rings.state('ex1').active).toBe(true);
    rail.setActive([]);
    expect(btns.get('ex1').classList.contains('is-active')).toBe(false);
    expect(btns.get('ex1').getAttribute('aria-current')).toBe(null);
    expect(rings.state('ex1').active).toBe(false);
  });
  it('a click (Enter on the button) chooses the exhibit, as a ring click does', () => {
    const picked = [];
    const btns = new Map([['ex1', fakeButton('ex1')]]);
    createRail(btns, { onPick: (id, b) => picked.push([id, b.dataset.rail]) });
    btns.get('ex1').dispatchEvent(new Event('click'));
    expect(picked).toEqual([['ex1', 'ex1']]);
  });
});
