// Page-made scrolls (src/ui/scroll-reveal.js): a scroll the page starts on its own never overrides a
// scroll it did not make. A native smooth scrollIntoView cannot be stopped (in Chromium an instant
// scrollTo during it does not cancel it: the page then slid back to the top under the visitor's own
// scroll), so the reveal animates the window itself and gives way at once.
import { describe, it, expect } from 'vitest';
import { revealTarget, createScrollReveal } from '../ui/scroll-reveal.js';

function fakeWindow({ y = 0, innerHeight = 700, height = 3000 } = {}) {
  const frames = [];
  const listeners = {};
  const w = {
    scrollY: y, innerHeight,
    document: { documentElement: { scrollHeight: height } },
    calls: [],
    scrollTo({ top }) { w.calls.push(top); w.scrollY = Math.max(0, Math.min(height - innerHeight, Math.round(top))); },
    requestAnimationFrame(fn) { frames.push(fn); return frames.length; },
    cancelAnimationFrame(id) { frames[id - 1] = null; },
    addEventListener(t, fn) { (listeners[t] ||= new Set()).add(fn); },
    removeEventListener(t, fn) { if (listeners[t]) listeners[t].delete(fn); },
    fire(t) { [...(listeners[t] || [])].forEach(fn => fn({ type: t })); },
    listening: t => (listeners[t] ? listeners[t].size : 0),
    // Run the queued frames at time `t`.
    frame(t) { const q = frames.splice(0); q.forEach(fn => fn && fn(t)); },
    pending: () => frames.some(Boolean),
  };
  return w;
}
const el = rect => ({ getBoundingClientRect: () => ({ top: rect.top, height: rect.height, bottom: rect.top + rect.height }) });

describe('revealTarget', () => {
  it('puts the element at the top (start) or in the middle (center), within the page', () => {
    const w = fakeWindow({ y: 500 });
    expect(revealTarget(el({ top: 300, height: 200 }), 'start', w)).toBe(800);
    expect(revealTarget(el({ top: 300, height: 200 }), 'center', w)).toBe(550);
    expect(revealTarget(el({ top: -400, height: 200 }), 'center', w)).toBe(0);
    expect(revealTarget(el({ top: 5000, height: 200 }), 'start', w)).toBe(2300);
  });
});

describe('createScrollReveal', () => {
  it('without motion it jumps straight there and leaves nothing running', () => {
    const w = fakeWindow({ y: 500 });
    const r = createScrollReveal({ win: w, now: () => 0 });
    r.reveal(el({ top: 300, height: 200 }), { block: 'start', smooth: false });
    expect(w.scrollY).toBe(800);
    expect(w.pending()).toBe(false);
    expect(r.running()).toBe(false);
  });

  it('glides there over the duration, then stops listening', () => {
    const w = fakeWindow({ y: 1000 });
    const r = createScrollReveal({ win: w, now: () => 0, duration: 400 });
    r.reveal(el({ top: -1000, height: 200 }), { block: 'start', smooth: true });
    expect(w.listening('wheel')).toBe(1);
    w.frame(200);
    expect(w.scrollY).toBeGreaterThan(0);
    expect(w.scrollY).toBeLessThan(1000);
    w.frame(400);
    expect(w.scrollY).toBe(0);
    expect(r.running()).toBe(false);
    expect(w.pending()).toBe(false);
    expect(w.listening('wheel')).toBe(0);
  });

  it('gives way to a scroll it did not make: the page stays where that scroll put it', () => {
    const w = fakeWindow({ y: 1000 });
    const r = createScrollReveal({ win: w, now: () => 0, duration: 400 });
    r.reveal(el({ top: -1000, height: 200 }), { block: 'start', smooth: true });
    w.frame(100);
    // Someone else (the visitor, the browser, another script) scrolls to 162.
    w.scrollTo({ top: 162 });
    const made = w.calls.length;
    w.frame(200); w.frame(300); w.frame(400);
    expect(w.scrollY).toBe(162);
    expect(w.calls.length).toBe(made);
    expect(r.running()).toBe(false);
    expect(w.listening('wheel')).toBe(0);
  });

  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
    it(`gives way to the visitor's ${ev}`, () => {
      const w = fakeWindow({ y: 1000 });
      const r = createScrollReveal({ win: w, now: () => 0, duration: 400 });
      r.reveal(el({ top: -1000, height: 200 }), { block: 'start', smooth: true });
      w.frame(100);
      const at = w.scrollY;
      w.fire(ev);
      w.frame(200); w.frame(400);
      expect(w.scrollY).toBe(at);
      expect(r.running()).toBe(false);
    });
  }

  it('cancel() stops it where it is; a new reveal replaces the one under way', () => {
    const w = fakeWindow({ y: 1000 });
    const r = createScrollReveal({ win: w, now: () => 0, duration: 400 });
    r.reveal(el({ top: -1000, height: 200 }), { block: 'start', smooth: true });
    w.frame(100);
    const at = w.scrollY;
    r.cancel();
    w.frame(400);
    expect(w.scrollY).toBe(at);
    // A second reveal while one runs: only the second moves the page.
    r.reveal(el({ top: -at, height: 200 }), { block: 'start', smooth: true });
    r.reveal(el({ top: 500 - at, height: 200 }), { block: 'start', smooth: true });
    w.frame(0); w.frame(400);
    expect(w.scrollY).toBe(500);
  });
});
