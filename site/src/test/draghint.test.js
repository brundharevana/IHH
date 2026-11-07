// "Drag to look around" hint (src/ui/draghint.js): a glass pill shown when the narration ends, on a
// station where looking around is allowed; hidden on the first drag with a 200 ms fade (real-scan
// museum spec, Camera; REF-tapestry-v2 section 7.4).
import { it, expect, vi, afterEach } from 'vitest';
import { createDragHint, HINT_FADE_MS } from '../ui/draghint.js';

afterEach(() => vi.useRealTimers());
const fakeEl = () => {
  const classes = new Set();
  return { hidden: true, classes, classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) } };
};

it('appears after the narration ends and hides on the first drag', () => {
  vi.useFakeTimers();
  const el = fakeEl(), audio = new EventTarget();
  const hint = createDragHint(el, { audio, lookAround: () => true });
  expect(el.hidden).toBe(true);
  audio.dispatchEvent(new Event('play'));
  expect(el.hidden).toBe(true); // not while the narration plays
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(false);
  vi.advanceTimersByTime(20);
  expect(el.classList.contains('is-on')).toBe(true);
  expect(hint.shown()).toBe(true);
  hint.dragged();
  expect(el.classList.contains('is-on')).toBe(false); // fading out
  expect(HINT_FADE_MS).toBe(200);
  vi.advanceTimersByTime(HINT_FADE_MS);
  expect(el.hidden).toBe(true);
  expect(hint.shown()).toBe(false);
  // Once the visitor has dragged, the hint does not come back.
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(true);
});

it('is not shown where looking around is not allowed, or while something else holds the stage', () => {
  const el = fakeEl(), audio = new EventTarget();
  let allowed = false, blocked = false;
  createDragHint(el, { audio, lookAround: () => allowed, blocked: () => blocked });
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(true);
  allowed = true; blocked = true;
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(true);
  blocked = false;
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(false);
});

it('a drag before the narration ends means it is never shown', () => {
  const el = fakeEl(), audio = new EventTarget();
  const hint = createDragHint(el, { audio, lookAround: () => true });
  hint.dragged();
  audio.dispatchEvent(new Event('ended'));
  expect(el.hidden).toBe(true);
});
