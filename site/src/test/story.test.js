// Story mode (src/ui/story.js): the visitor's continuous path room to room in journey order. Pinned
// rooms are joined through the globe (zoom out, fly the arc, zoom in), any step with an unpinned room
// through the door alone, and the last room leads to the ending page, never round in a loop. Every
// timer (the 5 s countdown, the globe's hold, the aerial chain, the door walk) stops on Close story.
import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextStop, leaveUrl, readStory, withoutStory, createTimers, createCountdown, createStory, runGlobeStory, COUNTDOWN_S, HOLD_MS,
  markStoryGo, takeStoryArrival, createLeave, liteStep, liteUrl } from '../ui/story.js';
import { storyJourney } from '../content/journey.js';
import { loadJourney, listChapters, loadChapter } from '../content/load.js';

const room = (id, n, pinned) => ({ id, n, title: `Room ${n}`, href: `/x/${n}/`, pinned });
// Journey order: a (pinned) -> b (pinned) -> c (unpinned) -> d (pinned).
const J = { slug: 'x', rooms: [room('a', 1, true), room('b', 2, true), room('c', 3, false), room('d', 4, true)] };

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

it('nextStop: pinned to pinned goes through the globe, and the room leaves to the globe page', () => {
  const s = nextStop(J, 'a');
  expect(s).toMatchObject({ via: 'globe', from: { id: 'a' }, to: { id: 'b' }, href: '/x/2/?story=1&from=a' });
  expect(leaveUrl(J, s)).toBe('/x/?story=1&from=a');
});

it('nextStop: pinned to unpinned, and unpinned to pinned, are a door step only (no globe trip)', () => {
  const s = nextStop(J, 'b');
  expect(s).toMatchObject({ via: 'door', from: { id: 'b' }, to: { id: 'c' }, href: '/x/3/?story=1&from=b' });
  expect(leaveUrl(J, s)).toBe('/x/3/?story=1&from=b');
  const t = nextStop(J, 'c');
  expect(t).toMatchObject({ via: 'door', to: { id: 'd' }, href: '/x/4/?story=1&from=c' });
  expect(leaveUrl(J, t)).toBe(t.href);
});

it('nextStop: the last room leads to the ending page, never back to the first room', () => {
  const s = nextStop(J, 'd');
  // The ending page is reached in story mode (it opts in to the fade, then drops the parameter).
  expect(s).toMatchObject({ via: 'end', from: { id: 'd' }, to: null, href: '/x/end/?story=1' });
  expect(leaveUrl(J, s)).toBe('/x/end/?story=1');
  // Walk the whole story from the start: every room once, then the end.
  const seen = [];
  for (let step = nextStop(J, null); step.via !== 'end'; step = nextStop(J, step.to.id)) {
    seen.push(step.to.id);
    expect(seen.length).toBeLessThanOrEqual(J.rooms.length);
  }
  expect(seen).toEqual(['a', 'b', 'c', 'd']);
});

it('nextStop: an unknown stop is not on the story (null); the start begins at the first room', () => {
  expect(nextStop(J, 'nowhere')).toBeNull();
  expect(nextStop({ slug: 'x', rooms: [] }, 'a')).toBeNull();
  expect(nextStop(J, null)).toMatchObject({ via: 'globe', from: null, to: { id: 'a' }, href: '/x/1/?story=1' });
  const unpinnedFirst = { slug: 'x', rooms: [room('c', 3, false), room('d', 4, true)] };
  expect(nextStop(unpinnedFirst, null)).toMatchObject({ via: 'door', to: { id: 'c' }, href: '/x/3/?story=1' });
  expect(nextStop({ slug: 'x', rooms: [] }, null)).toMatchObject({ via: 'end', href: '/x/end/?story=1' });
});

it('story URL state: read, and removed on Close story (other parameters and the hash kept)', () => {
  expect(readStory('https://h/x/2/?story=1&from=a')).toEqual({ from: 'a' });
  expect(readStory('https://h/x/2/?story=1')).toEqual({ from: null });
  expect(readStory('https://h/x/2/')).toBeNull();
  expect(readStory('https://h/x/2/?story=0&from=a')).toBeNull();
  expect(withoutStory('https://h/x/2/?debug&story=1&from=a#t')).toBe('/x/2/?debug#t');
  expect(withoutStory('https://h/x/2/?story=1&from=a')).toBe('/x/2/');
  expect(withoutStory('https://h/x/?lite=1&story=1')).toBe('/x/?lite=1');
});

it('storyJourney: the rooms in journey order, each once, with whether their stop is on the globe', () => {
  const chapters = new Map([[1, 'One'], [2, 'Two']]);
  const journey = { stops: [
    { id: 'p', map: { x: 1, y: 1 } }, { id: 's2', chapter: 2, map: { x: 1, y: 1 } }, { id: 'n', chapter: 9 },
    { id: 's1', chapter: 1 }, { id: 's2b', chapter: 2 },
  ] };
  expect(storyJourney(journey, { slug: 'x', chapters })).toEqual({ slug: 'x', rooms: [
    { id: 's2', n: 2, title: 'Two', href: '/x/2/', pinned: true },
    { id: 's1', n: 1, title: 'One', href: '/x/1/', pinned: false },
  ] });
  // The shipped Einstein story: the study (pinned) -> American citizenship (unpinned) -> the end.
  const ch = new Map(listChapters().filter(c => c.slug === 'einstein').map(c => [c.n, loadChapter('einstein', c.n).title]));
  const ej = storyJourney(loadJourney('einstein'), { slug: 'einstein', chapters: ch });
  let step = nextStop(ej, null), hops = 0;
  while (step.via !== 'end') { step = nextStop(ej, step.to.id); hops++; expect(hops).toBeLessThanOrEqual(ej.rooms.length); }
  expect(step.href).toBe('/einstein/end/?story=1');
});

it('timers: clearAll stops every timer that has not fired', () => {
  const timers = createTimers();
  const fired = [];
  timers.later(() => fired.push(1), 100);
  timers.later(() => fired.push(2), 2000);
  vi.advanceTimersByTime(150);
  expect(fired).toEqual([1]);
  expect(timers.size()).toBe(1);
  timers.clearAll();
  expect(timers.size()).toBe(0);
  vi.advanceTimersByTime(10000);
  expect(fired).toEqual([1]);
});

it('countdown: ticks 5, 4, 3, 2, 1 once a second, then done once; stop() ends it', () => {
  const timers = createTimers(), ticks = [], done = vi.fn();
  const c = createCountdown({ timers, onTick: s => ticks.push(s), onDone: done });
  c.start();
  expect(ticks).toEqual([5]);
  vi.advanceTimersByTime(4999);
  expect(ticks).toEqual([5, 4, 3, 2, 1]);
  expect(done).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(done).toHaveBeenCalledTimes(1);
  expect(c.running()).toBe(false);
  vi.advanceTimersByTime(20000);
  expect(done).toHaveBeenCalledTimes(1);
  // Stopped half way: nothing more.
  const d2 = vi.fn(), c2 = createCountdown({ timers, onTick: () => {}, onDone: d2 });
  c2.start(); vi.advanceTimersByTime(2500); c2.stop();
  expect(timers.size()).toBe(0);
  vi.advanceTimersByTime(20000);
  expect(d2).not.toHaveBeenCalled();
  expect(COUNTDOWN_S).toBe(5);
});

function roomStory(step = nextStop(J, 'b')) {
  const go = vi.fn(), states = [];
  const story = createStory({ step, go, onState: (s, info) => states.push([s, info && info.left]) });
  return { story, go, states };
}

it('room story: narration end shows the countdown, then continues to the next stop once', () => {
  const { story, go, states } = roomStory();
  expect(story.state()).toBe('playing');
  story.narrationEnded();
  expect(story.state()).toBe('counting');
  expect(states[0]).toEqual(['counting', 5]);
  vi.advanceTimersByTime(5000);
  expect(go).toHaveBeenCalledTimes(1);
  expect(go.mock.calls[0][0]).toMatchObject({ via: 'door', to: { id: 'c' } });
  expect(story.state()).toBe('leaving');
  story.narrationEnded(); // a late ended event while leaving does not start a second countdown
  vi.advanceTimersByTime(10000);
  expect(go).toHaveBeenCalledTimes(1);
});

it('room story: Stay cancels the countdown and the visitor remains; a later narration end counts again', () => {
  const { story, go } = roomStory();
  story.narrationEnded();
  vi.advanceTimersByTime(2000);
  story.stay();
  expect(story.state()).toBe('staying');
  vi.advanceTimersByTime(20000);
  expect(go).not.toHaveBeenCalled();
  story.narrationEnded();
  vi.advanceTimersByTime(5000);
  expect(go).toHaveBeenCalledTimes(1);
});

it('room story: Close story stops every timer and every registered motion (walk), and nothing restarts it', () => {
  const { story, go } = roomStory();
  const walk = vi.fn(), tour = vi.fn();
  story.onClose(walk); story.onClose(tour);
  story.narrationEnded();
  vi.advanceTimersByTime(3000);
  story.close();
  expect(story.state()).toBe('closed');
  expect(walk).toHaveBeenCalledTimes(1);
  expect(tour).toHaveBeenCalledTimes(1);
  expect(story.timers.size()).toBe(0);
  vi.advanceTimersByTime(60000);
  story.narrationEnded();
  vi.advanceTimersByTime(60000);
  expect(go).not.toHaveBeenCalled();
  story.close(); // idempotent
  expect(walk).toHaveBeenCalledTimes(1);
  // Close while leaving (the walk to the door under way) also stops it.
  const r = roomStory();
  const w2 = vi.fn();
  r.story.onClose(w2);
  r.story.narrationEnded();
  vi.advanceTimersByTime(5000);
  expect(r.story.state()).toBe('leaving');
  r.story.close();
  expect(w2).toHaveBeenCalledTimes(1);
});

// A stand-in for the aerial API (src/museum/aerial.js) that records the calls in order.
function fakeAerial(results = {}) {
  const calls = [];
  let st = 'idle';
  const settle = (name, v) => new Promise(r => { calls.push(name); st = SEQ.has(name) ? 'zooming' : st; queueMicrotask(() => { st = v === 'arrived' && name.startsWith('zoomIn') ? 'arrived' : 'idle'; r(v); }); });
  const SEQ = new Set();
  return {
    calls,
    chain: () => calls.push('chain'),
    skip: () => calls.push('skip'),
    zoomIn: id => settle(`zoomIn:${id}`, results[`zoomIn:${id}`] || 'arrived'),
    zoomOut: () => settle('zoomOut', results.zoomOut || 'globe'),
    flyAlongArc: (a, b) => settle(`arc:${a}->${b}`, results[`arc:${a}->${b}`] || 'arrived'),
    placeOver: id => { calls.push(`placeOver:${id}`); return true; },
    state: () => st,
  };
}
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

it('globe story: arriving from a pinned room starts over its pin at globe distance (its stack never loaded), flies the arc, zooms in, holds 1 s, enters', async () => {
  const aerial = fakeAerial(), go = vi.fn(), phases = [];
  const run = runGlobeStory({ step: nextStop(J, 'a'), aerial, go, onPhase: p => phases.push(p) });
  await flush();
  expect(aerial.calls).toEqual(['chain', 'placeOver:a', 'arc:a->b', 'zoomIn:b']);
  expect(aerial.calls).not.toContain('zoomIn:a'); // the previous room's aerial stack is never requested
  expect(phases).toContain('hold');
  expect(go).not.toHaveBeenCalled();
  vi.advanceTimersByTime(HOLD_MS - 1);
  expect(go).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(go).toHaveBeenCalledWith('/x/2/?story=1&from=a', { fade: false });
  expect(HOLD_MS).toBe(1000);
  expect(run.state()).toBe('done');
});

it('globe story: Start the story at a pinned first room zooms in only; Skip during the hold enters at once', async () => {
  const aerial = fakeAerial(), go = vi.fn();
  const run = runGlobeStory({ step: nextStop(J, null), aerial, go });
  await flush();
  expect(aerial.calls).toEqual(['chain', 'zoomIn:a']);
  expect(run.state()).toBe('hold');
  run.skip();
  expect(go).toHaveBeenCalledWith('/x/1/?story=1', { fade: false });
  vi.advanceTimersByTime(5000);
  expect(go).toHaveBeenCalledTimes(1);
});

it('globe story: a failed aerial load falls back to a fade into the room, never a stop', async () => {
  for (const r of ['failed', 'none']) {
    const aerial = fakeAerial({ 'zoomIn:b': r }), go = vi.fn();
    runGlobeStory({ step: nextStop(J, 'a'), aerial, go });
    await flush();
    expect(go).toHaveBeenCalledWith('/x/2/?story=1&from=a', { fade: true });
  }
  // Without the aerial zoom (flat map, no WebGL): a fade straight in.
  const go = vi.fn();
  runGlobeStory({ step: nextStop(J, 'a'), aerial: null, go });
  await flush();
  expect(go).toHaveBeenCalledWith('/x/2/?story=1&from=a', { fade: true });
});

it('globe story: a door step or the end reached on the globe page goes on with a fade', async () => {
  const go = vi.fn(), aerial = fakeAerial();
  runGlobeStory({ step: nextStop(J, 'b'), aerial, go });
  runGlobeStory({ step: nextStop(J, 'd'), aerial, go });
  await flush();
  expect(go.mock.calls).toEqual([['/x/3/?story=1&from=b', { fade: true }], ['/x/end/?story=1', { fade: true }]]);
  expect(aerial.calls).toEqual([]);
});

it('globe story: Close story stops the aerial chain after the step under way and the hold timer; no navigation', async () => {
  const aerial = fakeAerial(), go = vi.fn();
  const run = runGlobeStory({ step: nextStop(J, 'a'), aerial, go });
  run.close(); // during the flight along the arc
  await flush();
  vi.advanceTimersByTime(10000);
  expect(aerial.calls).toEqual(['chain', 'placeOver:a', 'arc:a->b']);
  expect(go).not.toHaveBeenCalled();
  expect(run.state()).toBe('closed');
  // Closed during the hold.
  const a2 = fakeAerial(), g2 = vi.fn();
  const r2 = runGlobeStory({ step: nextStop(J, null), aerial: a2, go: g2 });
  await flush();
  expect(r2.state()).toBe('hold');
  r2.close();
  expect(r2.timers.size()).toBe(0);
  vi.advanceTimersByTime(10000);
  expect(g2).not.toHaveBeenCalled();
  // A superseded aerial step ('cancelled', e.g. the visitor chose a pin) ends the story run too.
  const a3 = fakeAerial({ 'arc:a->b': 'cancelled' }), g3 = vi.fn();
  const r3 = runGlobeStory({ step: nextStop(J, 'a'), aerial: a3, go: g3 });
  await flush();
  vi.advanceTimersByTime(10000);
  expect(a3.calls).not.toContain('zoomIn:b');
  expect(g3).not.toHaveBeenCalled();
  expect(r3.state()).toBe('closed');
});

// sessionStorage stand-in.
const store = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m }; };

it('autoplay on arrival only after a story navigation: the one-shot token the story set for this path', () => {
  const st = store();
  const at = (o = {}) => takeStoryArrival({ storage: st, path: '/x/2/', navType: 'navigate', ...o });
  expect(at()).toBe(false); // a typed or pasted story URL: Play waits for the visitor
  markStoryGo(st, '/x/2/');
  expect(at({ navType: 'reload' })).toBe(false); // not a navigation from the story
  markStoryGo(st, '/x/2/');
  expect(at({ path: '/x/1/' })).toBe(false); // the token names another page
  markStoryGo(st, '/x/2/');
  expect(at()).toBe(true);
  expect(at()).toBe(false); // one shot
  markStoryGo(st, '/x/2/');
  expect(at({ navType: 'back_forward' })).toBe(false);
  expect(at()).toBe(false); // consumed by the Back arrival too
  // Blocked storage: no token, never a throw.
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  expect(() => markStoryGo(broken, '/x/2/')).not.toThrow();
  expect(takeStoryArrival({ storage: broken, path: '/x/2/', navType: 'navigate' })).toBe(false);
});

it('leaving a page after the fade: closing during the fade means no navigation', async () => {
  const nav = vi.fn();
  let release;
  const fade = () => new Promise(r => { release = r; });
  const leave = createLeave({ fade, navigate: nav });
  leave.go('/x/2/?story=1');
  leave.cancel(); // Close story / Esc during the fade
  release(); await flush();
  expect(nav).not.toHaveBeenCalled();
  const l2 = createLeave({ fade: () => Promise.resolve(), navigate: nav });
  l2.go('/x/2/?story=1'); await flush();
  expect(nav).toHaveBeenCalledWith('/x/2/?story=1');
  expect(l2.leaving()).toBe(true);
});

it('Lite story: chapters in journey order on one page, then the ending page; never a loop', () => {
  expect(liteUrl('x', 2, 'a')).toBe('/x/lite/?story=1&from=a#chapter-2');
  expect(liteUrl('x', 1, null)).toBe('/x/lite/?story=1#chapter-1');
  // Globe and door steps alike are the next chapter on the Lite page.
  expect(liteStep(J, 'a')).toEqual({ kind: 'chapter', room: J.rooms[1] });
  expect(liteStep(J, 'b')).toEqual({ kind: 'chapter', room: J.rooms[2] });
  expect(liteStep(J, 'd')).toEqual({ kind: 'end', href: '/x/end/?story=1' });
  expect(liteStep(J, 'nowhere')).toBeNull();
  const seen = [];
  for (let s = liteStep(J, 'a'); s.kind === 'chapter'; s = liteStep(J, s.room.id)) { seen.push(s.room.id); expect(seen.length).toBeLessThan(4); }
  expect(seen).toEqual(['b', 'c', 'd']);
});

// The autoplay token is written at the moment the page actually goes, never before: a leave cancelled
// during its fade (Close story, Esc) leaves no token behind for a later, unrelated arrival.
it('leaving a page: the token is marked only at the navigation, never for a cancelled leave', async () => {
  const order = [];
  const mark = vi.fn(h => order.push(`mark:${h}`));
  const nav = vi.fn(h => order.push(`nav:${h}`));
  let release;
  const leave = createLeave({ fade: () => new Promise(r => { release = r; }), navigate: nav, mark });
  leave.go('/x/2/?story=1');
  expect(mark).not.toHaveBeenCalled(); // not at the click: only when the page goes
  leave.cancel();
  release(); await flush();
  expect(mark).not.toHaveBeenCalled();
  const l2 = createLeave({ fade: () => Promise.resolve(), navigate: nav, mark });
  l2.go('/x/3/?story=1'); await flush();
  expect(order).toEqual(['mark:/x/3/?story=1', 'nav:/x/3/?story=1']);
});
