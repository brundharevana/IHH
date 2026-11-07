// Page-made scrolls: bringing the stage (an exhibit panel opening, the aerial zoom) or a story room
// into view. Rule: a scroll the page starts on its own never overrides a scroll it did not make.
//
// A native smooth scrollIntoView cannot be stopped once started: in Chromium an instant scrollTo
// made while it runs does not cancel it, and under load (software WebGL, a busy machine) it lands
// hundreds of ms later, after the visitor or another script has scrolled, and slides the page away
// from where they put it (reproduced: the room page slid back to the top after an exhibit panel
// closed; flake-report 2026-10-12). So the reveal animates the window here, one instant step per
// frame, and gives way at once to anything else: a scroll it did not make (the window is not where
// it left it), the visitor's wheel, touch, key or pointer, cancel(), or a newer reveal.
export const REVEAL_MS = 450;

// The window scroll that puts `el` at the top ('start') or in the middle ('center') of the
// viewport, within the page.
export function revealTarget(el, block, win = window) {
  const r = el.getBoundingClientRect();
  const want = block === 'center' ? win.scrollY + r.top - (win.innerHeight - r.height) / 2 : win.scrollY + r.top;
  const max = Math.max(0, win.document.documentElement.scrollHeight - win.innerHeight);
  return Math.round(Math.max(0, Math.min(max, want)));
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const VISITOR = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

export function createScrollReveal({ win = window, now = () => performance.now(), duration = REVEAL_MS } = {}) {
  let frame = 0, stopListening = null;
  const cancel = () => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    if (stopListening) { stopListening(); stopListening = null; }
  };
  const jump = top => win.scrollTo({ top, behavior: 'instant' });

  function reveal(el, { block = 'start', smooth = true } = {}) {
    cancel();
    if (!el) return;
    const to = revealTarget(el, block, win);
    const from = win.scrollY;
    if (!smooth || Math.abs(to - from) < 1) { if (Math.abs(to - from) >= 1) jump(to); return; }
    const opts = { capture: true, passive: true };
    VISITOR.forEach(t => win.addEventListener(t, cancel, opts));
    stopListening = () => VISITOR.forEach(t => win.removeEventListener(t, cancel, opts));
    const t0 = now();
    let left = from; // where this reveal last put the window
    const step = t => {
      frame = 0;
      if (Math.abs(win.scrollY - left) > 1) { cancel(); return; } // someone else scrolled: give way
      const k = Math.min(1, Math.max(0, (t - t0) / duration));
      jump(from + (to - from) * ease(k));
      left = win.scrollY;
      if (k < 1) frame = win.requestAnimationFrame(step); else cancel();
    };
    frame = win.requestAnimationFrame(step);
  }

  return { reveal, cancel, running: () => Boolean(frame) };
}

// The one page-wide instance: a newer reveal (panel, aerial, story) replaces the one under way.
let shared = null;
export function scrollReveal() {
  if (!shared) shared = createScrollReveal();
  return shared;
}
