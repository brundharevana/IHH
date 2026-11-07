// Story mode: the visitor's continuous path through the museum, room to room in journey order, until
// they close it (spec 2026-10-10-museum-journey-flow-design.md, "The visitor's path").
//
// State lives in the URL only: ?story=1&from=<stop id>. "Start the story" on the globe page begins at
// the first room (zooming in when its stop is pinned, else entering it directly). In a room in story
// mode the narration starts on arrival (the visitor's Start click is the gesture; if the browser still
// blocks it, the big play button stays and the story goes on once the visitor presses it). When the
// narration ends a small card on the stage reads "Continuing to <next> in 5 s" with Stay and Close
// story. Then:
//   pinned room -> pinned room   the room leaves to the globe page (?story=1&from=<room>), which starts
//                                zoomed at that room's place, zooms out, flies the arc and zooms in to
//                                the next, holds 1 s (with Skip) and enters the next room;
//   any step with an unpinned room   the exit door only (walk and fade);
//   the last room                the journey's ending page (/<slug>/end/), never back round.
// Close story (or Esc while the card shows, a leave is under way, or the globe is moving) stops every
// timer: the countdown, the globe's hold, the aerial chain after the step under way, the door walk,
// and removes the story from the URL. Browser Back never resumes a story: a page reached by Back /
// Forward (or restored from the back-forward cache) drops the story parameters and starts nothing.
//
// The pure parts (nextStop, leaveUrl, readStory, withoutStory, createTimers, createCountdown,
// createStory, runGlobeStory) take no DOM and are unit-tested (src/test/story.test.js); mountRoomStory
// and mountGlobeStory wire them to the pages.

import { scrollReveal } from './scroll-reveal.js';

export const COUNTDOWN_S = 5;   // the story card's countdown
export const HOLD_MS = 1000;    // the globe's hold on the arrived view before entering the room
export const FADE_MS = 350;     // the plain fade between pages (View Transitions add their own cross-fade)
const END_NAME = "the journey's end";

// ---- Journey steps. journey = { slug, rooms: [{ id, n, title, href, pinned }] } (content/journey.js storyJourney).
const roomUrl = (room, from) => `${room.href}?story=1${from ? `&from=${encodeURIComponent(from)}` : ''}`;

// The step after stop `current` (a room's stop id), or the first room when current is null.
// -> { via: 'globe' | 'door' | 'end', from: room | null, to: room | null, href } or null when current
// is not a room on the story. href is where the step ends (the next room in story mode, or the end page).
export function nextStop(journey, current) {
  const rooms = (journey && journey.rooms) || [];
  // The ending page in story mode: it opts in to the story's fade, then drops the parameter (end.astro).
  const end = from => ({ via: 'end', from, to: null, href: `/${journey.slug}/end/?story=1` });
  if (current === null || current === undefined) {
    const to = rooms[0];
    if (!to) return end(null);
    return { via: to.pinned ? 'globe' : 'door', from: null, to, href: roomUrl(to, null) };
  }
  const i = rooms.findIndex(r => r.id === current);
  if (i < 0) return null;
  const from = rooms[i], to = rooms[i + 1];
  if (!to) return end(from);
  return { via: from.pinned && to.pinned ? 'globe' : 'door', from, to, href: roomUrl(to, from.id) };
}

// Where a room leaves to for a step: the globe page for a globe trip, else the step's own end.
export function leaveUrl(journey, step) {
  return step.via === 'globe' && step.from ? `/${journey.slug}/?story=1&from=${encodeURIComponent(step.from.id)}` : step.href;
}

// { from } when the URL is in story mode, else null.
export function readStory(href) {
  const u = new URL(href);
  return u.searchParams.get('story') === '1' ? { from: u.searchParams.get('from') } : null;
}
// The same page without the story parameters (path, other parameters, hash).
// Other parameters are kept as written (a bare "?debug" stays bare).
export function withoutStory(href) {
  const u = new URL(href);
  const rest = u.search.slice(1).split('&').filter(p => p && !['story', 'from'].includes(decodeURIComponent(p.split('=')[0])));
  return u.pathname + (rest.length ? `?${rest.join('&')}` : '') + u.hash;
}

// ---- Timers. Every story timer goes through one registry, so Close story can stop them all.
export function createTimers({ set = (f, ms) => setTimeout(f, ms), clear = t => clearTimeout(t) } = {}) {
  const live = new Set();
  return {
    later(fn, ms) { const t = set(() => { live.delete(t); fn(); }, ms); live.add(t); return t; },
    cancel(t) { if (live.delete(t)) clear(t); },
    clearAll() { for (const t of live) clear(t); live.clear(); },
    size: () => live.size,
  };
}

// Counts down whole seconds: onTick(seconds left) at once and each second, onDone() at zero.
export function createCountdown({ seconds = COUNTDOWN_S, timers, onTick, onDone }) {
  let left = seconds, t = null, running = false;
  const step = () => {
    t = null; left -= 1;
    if (left <= 0) { running = false; onDone(); return; }
    onTick(left); t = timers.later(step, 1000);
  };
  const stop = () => { if (t !== null) timers.cancel(t); t = null; running = false; };
  return {
    start() { stop(); left = seconds; running = true; onTick(left); t = timers.later(step, 1000); },
    stop,
    running: () => running,
    left: () => left,
  };
}

// The story in a room. States: 'playing' (in the room, narration on) -> 'counting' (the card) ->
// 'leaving' (go(step) called once), or 'staying' (Stay), or 'closed' (Close story; final).
// onState(state, { left, step }) lets the page draw the card. onClose(fn) registers a motion to stop
// on close (the door walk).
export function createStory({ step, go, onState = () => {}, timers = createTimers(), seconds = COUNTDOWN_S }) {
  let state = 'playing';
  const closers = [];
  const countdown = createCountdown({
    seconds, timers,
    onTick: left => onState('counting', { left, step }),
    onDone: () => { state = 'leaving'; onState('leaving', { step }); go(step); },
  });
  return {
    timers, step,
    state: () => state,
    narrationEnded() {
      if (state !== 'playing' && state !== 'staying') return;
      state = 'counting';
      countdown.start();
    },
    stay() {
      if (state !== 'counting') return;
      countdown.stop(); state = 'staying'; onState('staying', { step });
    },
    // The visitor took a door themselves: no countdown any more.
    leave() {
      if (state === 'closed' || state === 'leaving') return;
      countdown.stop(); state = 'leaving'; onState('leaving', { step });
    },
    onClose(fn) { closers.push(fn); },
    close() {
      if (state === 'closed') return;
      state = 'closed';
      countdown.stop(); timers.clearAll();
      for (const f of closers) f();
      onState('closed', { step });
    },
  };
}

// The globe's part of a step. For a globe trip from a pinned room: start over that room's pin at globe
// distance (aerial placeOver, no image stack), fly the arc, zoom in to the next room; for the start of the
// story at a pinned first room: zoom in. Then hold HOLD_MS (Skip enters at once) and go(href, { fade:
// false }). A door step, the end, no aerial zoom, or an aerial image that fails to load: go(href,
// { fade: true }) straight away (a fade, never a black stage). Close stops the chain after the aerial
// step under way and the hold; an aerial step superseded by the visitor ('cancelled') ends the run.
// States: 'moving' | 'hold' | 'done' | 'closed'.
export function runGlobeStory({ step, aerial, go, onPhase = () => {}, timers = createTimers(), hold = HOLD_MS }) {
  let state = 'moving';
  const set = s => { state = s; onPhase(s); };
  const final = () => state === 'closed' || state === 'done';
  const enter = fade => {
    if (final()) return;
    timers.clearAll(); set('done');
    go(step.href, { fade });
  };
  const run = {
    timers,
    state: () => state,
    skip() {
      if (state === 'hold') enter(false);
      else if (state === 'moving' && aerial) aerial.skip();
    },
    close() {
      if (final()) return;
      timers.clearAll(); set('closed');
    },
  };
  const ok = r => !final() && r !== 'cancelled';
  (async () => {
    if (!step) { run.close(); return; }
    if (step.via !== 'globe' || !step.to || !aerial) { enter(true); return; }
    aerial.chain();
    if (step.from) {
      // Start over the previous room's pin at globe distance (its aerial stack is never loaded).
      aerial.placeOver(step.from.id);
      if (!ok(await aerial.flyAlongArc(step.from.id, step.to.id))) { run.close(); return; }
    }
    const r = await aerial.zoomIn(step.to.id);
    if (!ok(r)) { run.close(); return; }
    if (r !== 'arrived') { enter(true); return; }
    set('hold');
    timers.later(() => enter(false), hold);
  })();
  return run;
}

// ---- Autoplay permission. The narration starts on arrival only when the visitor got here through the
// story: the page that navigates sets a one-shot token naming the page it goes to (Start the story,
// the countdown, a story door, the Lite redirect), and the arrival takes it. A typed, pasted, reloaded
// or Back / Forward story URL has no token: Play waits for the visitor.
const TOKEN = 'voa-story-go';
export function markStoryGo(storage, path) {
  try { storage.setItem(TOKEN, path); } catch { /* blocked storage: no autoplay, Play still works */ }
}
export function takeStoryArrival({ storage, path, navType }) {
  let token = null;
  try { token = storage.getItem(TOKEN); storage.removeItem(TOKEN); } catch { return false; }
  return navType === 'navigate' && token === path;
}

// Leaving a page: fade, then navigate, unless cancelled during the fade (Close story, Esc). mark(href)
// runs at the moment of navigation, never for a cancelled leave (the story's autoplay token).
export function createLeave({ fade, navigate, mark = () => {} }) {
  let state = 'idle', token = 0;
  return {
    go(href) {
      if (state === 'leaving') return;
      state = 'leaving';
      const t = ++token;
      Promise.resolve(fade()).then(() => { if (state === 'leaving' && t === token) { mark(href); navigate(href); } });
    },
    cancel() { if (state === 'leaving') { state = 'cancelled'; token++; } },
    leaving: () => state === 'leaving',
  };
}

// ---- Lite story: every room is a chapter on one page (/<slug>/lite/), so globe and door steps alike
// move to the next chapter there; after the last room, the ending page.
export const liteUrl = (slug, n, from) => `/${slug}/lite/?story=1${from ? `&from=${encodeURIComponent(from)}` : ''}#chapter-${n}`;
export function liteStep(journey, current) {
  const s = nextStop(journey, current);
  if (!s) return null;
  return s.via === 'end' ? { kind: 'end', href: s.href } : { kind: 'chapter', room: s.to };
}

// ---- Page wiring.
const navType = () => {
  try { const e = performance.getEntriesByType('navigation')[0]; return e ? e.type : 'navigate'; } catch { return 'navigate'; }
};
const session = () => { try { return sessionStorage; } catch { return null; } };
const pathOf = href => new URL(href, location.href).pathname;
const goToken = href => { const s = session(); if (s) markStoryGo(s, pathOf(href)); };
const arrivalAllowed = () => { const s = session(); return s ? takeStoryArrival({ storage: s, path: location.pathname, navType: navType() }) : false; };
const dropStoryFromUrl = () => { try { history.replaceState(history.state, '', withoutStory(location.href)); } catch { /* sandboxed */ } };
const viewTransitions = () => typeof window !== 'undefined' && 'CSSViewTransitionRule' in window;
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const plainClick = e => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
// The page's opt-in to cross-document View Transitions (Base.astro adds it on a story URL): on while a
// story runs from this page, off once it is closed, so other navigation is unchanged.
export function storyTransitions(on) {
  let el = document.getElementById('voa-vt');
  if (on && !el) {
    el = document.createElement('style'); el.id = 'voa-vt'; el.textContent = '@view-transition { navigation: auto; }';
    document.head.append(el);
  } else if (!on && el) el.remove();
}

// A full-page fade (the room's dark ground). out: to dark, then resolve; in: from dark to the page.
// The layer has its own marker: Base.astro marks the <html> of a story page data-story-fade="in", and a
// shared selector would fade (or blank) the whole document instead of the layer.
const FADE_LAYER = 'div[data-story-fade-layer]';
function fadeLayer() {
  let el = document.querySelector(FADE_LAYER);
  if (!el) {
    el = document.createElement('div');
    el.dataset.storyFadeLayer = '';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = `position:fixed;inset:0;z-index:60;background:#1f1d1a;pointer-events:none;opacity:0;transition:opacity ${FADE_MS}ms ease`;
    document.body.append(el);
  }
  return el;
}
export function fadeOut() {
  const el = fadeLayer();
  el.style.transition = 'none'; el.style.opacity = '0';
  el.getBoundingClientRect();
  el.style.transition = `opacity ${FADE_MS}ms ease`; el.style.opacity = '1';
  return new Promise(r => setTimeout(r, FADE_MS));
}
// The plain fade into a page, where cross-document View Transitions are not supported.
export function fadeIn() {
  if (viewTransitions()) return;
  const el = fadeLayer();
  el.style.transition = 'none'; el.style.opacity = '1';
  el.getBoundingClientRect();
  el.style.transition = `opacity ${FADE_MS}ms ease`; el.style.opacity = '0';
}
const clearFade = () => { const el = document.querySelector(FADE_LAYER); if (el) { el.style.transition = 'none'; el.style.opacity = '0'; } };

// The countdown card and the polite announcements, shared by the room and the Lite page. The card
// never takes focus; if focus was on its Stay button when it goes, focus moves to `focusAfter`.
// persistent: the card stays (the Lite story bar, with Close story), only Stay and the countdown go.
// Announcement timers go through the story's timer registry.
function cardView({ card, text, stay, live, timers, persistent = false, idleText = () => '', focusAfter = () => null }) {
  let announced = false;
  const say = t => { if (!live) return; live.textContent = ''; timers.later(() => { live.textContent = t; }, 50); };
  return {
    say,
    counting(name, left) {
      if (text) text.textContent = `Continuing to ${name} in ${left} s`;
      if (card && !persistent) card.hidden = false;
      if (stay) stay.hidden = false;
      if (!announced) { announced = true; say(`Continuing to ${name} in ${left} seconds. Stay, or Close story.`); }
    },
    rest() {
      announced = false;
      if (!card) return;
      const had = persistent ? stay && stay.contains(document.activeElement) : card.contains(document.activeElement);
      if (persistent) { if (stay) stay.hidden = true; if (text) text.textContent = idleText(); } else card.hidden = true;
      const to = had && focusAfter();
      if (to) to.focus({ preventScroll: true });
    },
  };
}

import { isCovered, whenUncovered } from './stagecover.js';

// Room page. data = { journey, current } (the room's stop id); doors: src/ui/doors.js controller;
// player: the stage player (tryPlay); audio: the narration element (null without narration).
export function mountRoomStory({ data, doors, player = null, audio = null, root = document }) {
  if (!data || !readStory(location.href)) return null;
  const step = navType() === 'back_forward' ? null : nextStop(data.journey, data.current);
  if (!step) { dropStoryFromUrl(); storyTransitions(false); return null; }
  const autoplay = arrivalAllowed();
  storyTransitions(true);
  const stage = root.querySelector('[data-stage]');
  const card = root.querySelector('[data-story-card]');
  const pill = root.querySelector('[data-story-pill]');
  const heading = root.querySelector('[data-chapter-head] h1');
  const exitBtn = root.querySelector('a[data-door="exit"]');
  const nextName = step.to ? step.to.title : END_NAME;
  const timers = createTimers();
  const view = cardView({ card, text: card && card.querySelector('[data-story-text]'), live: root.querySelector('[data-story-announce]'), timers,
    focusAfter: () => exitBtn });
  const { say } = view;
  if (stage) stage.dataset.story = 'playing';
  if (pill) pill.hidden = false;

  // The exit door, its stage button and the chapter nav's Next go on with the story.
  const exits = [...root.querySelectorAll('a[data-door="exit"], a[data-door-hotspot="exit"], a[data-nav="next"]')];
  const original = new Map(exits.map(a => [a, a.getAttribute('href')]));
  const to = leaveUrl(data.journey, step);
  for (const a of exits) a.setAttribute('href', to);

  const story = createStory({
    step, timers,
    go: () => { doors.exitTo(to); },
    onState: (s, { left } = {}) => {
      if (stage) stage.dataset.story = s;
      if (s === 'counting') view.counting(nextName, left); else view.rest();
    },
  });
  story.onClose(() => doors.cancel());
  // The autoplay token is written when a story exit actually navigates (after the walk and the fade),
  // never at the click: a leave cancelled by Close story or Esc leaves no token behind.
  const toAbs = h => new URL(h, location.href).href;
  if (doors.beforeNavigate) doors.beforeNavigate(url => { if (story.state() !== 'closed' && toAbs(url) === toAbs(to)) goToken(url); });
  const close = ({ quiet = false } = {}) => {
    if (story.state() === 'closed') return;
    const had = pill && pill.contains(document.activeElement);
    story.close();
    for (const [a, h] of original) a.setAttribute('href', h);
    if (stage) delete stage.dataset.story;
    if (pill) pill.hidden = true;
    if (cardClose) cardClose.hidden = true;
    if (had && exitBtn) exitBtn.focus({ preventScroll: true });
    dropStoryFromUrl();
    storyTransitions(false);
    if (!quiet) say('Story closed. You stay in this room.');
  };
  if (card) {
    card.querySelector('[data-story-stay]').addEventListener('click', () => { story.stay(); say('Countdown stopped. You stay in this room.'); });
    card.querySelector('[data-story-close]').addEventListener('click', () => close());
  }
  if (pill) pill.addEventListener('click', () => close());
  // The failure card (a covered stage) offers Close story itself: the stage's own pill is hidden then.
  const cardClose = root.querySelector('[data-scan-failed-close-story]');
  if (cardClose) { cardClose.hidden = false; cardClose.addEventListener('click', () => close()); }
  // Esc closes the story in any state (the doors' own Esc handler cancels a walk). An open exhibit
  // panel takes Esc first (it prevents the default).
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.defaultPrevented) close(); });
  // Taking a door by hand ends the countdown. A door carries the token when its leave navigates (above);
  // the chapter nav's Next is a plain link that navigates at the click, so its token is written now.
  for (const a of root.querySelectorAll('a[data-door], a[data-door-hotspot], a[data-nav="next"]')) {
    a.addEventListener('click', e => {
      if (!plainClick(e) || story.state() === 'closed') return;
      if (a.dataset.nav === 'next') goToken(a.href);
      story.leave();
    });
  }
  // The back-forward cache: stop everything on the way out, and come back to a room without a story.
  addEventListener('pagehide', e => { if (e.persisted) close({ quiet: true }); });
  addEventListener('pageshow', e => { if (e.persisted) { close({ quiet: true }); clearFade(); } });

  // An exhibit opened while counting holds the story (as Stay); a narration that ends while one is
  // open counts once it is closed. A covered stage (failure card, context loss) holds it too: a
  // countdown under way stops and counts again on recovery; nothing navigates behind the card.
  let pending = false;
  const panelOpen = () => stage && 'panelOpen' in stage.dataset;
  const covered = () => isCovered(stage);
  const ended = () => { if (panelOpen() || covered()) pending = true; else story.narrationEnded(); };
  if (stage && typeof MutationObserver === 'function') {
    new MutationObserver(() => {
      if (covered() && story.state() === 'counting') { story.stay(); pending = true; }
      else if (panelOpen() && story.state() === 'counting') story.stay();
      else if (!panelOpen() && !covered() && pending) { pending = false; story.narrationEnded(); }
    }).observe(stage, { attributes: true, attributeFilter: ['data-panel-open', 'data-covered'] });
  }

  fadeIn();
  // The arrival waits for an uncovered stage: a room that failed to start never autoplays behind
  // its failure card.
  doors.onArrive(() => whenUncovered(stage, async () => {
    if (story.state() === 'closed') return;
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    const title = heading ? heading.textContent.trim() : '';
    if (!audio || !player) { say(`Now in: ${title}`); ended(); return; }
    audio.addEventListener('ended', ended);
    audio.addEventListener('error', ended, { once: true });
    const ok = autoplay ? await player.tryPlay() : false;
    if (story.state() === 'closed') return;
    if (stage) stage.dataset.storyAutoplay = ok ? 'playing' : autoplay ? 'blocked' : 'held';
    say(ok ? `Now in: ${title}` : `Now in: ${title}. Press Play to hear the narration; the story goes on when it ends.`);
  }));
  return { story, close, step };
}

// Lite page (/<slug>/lite/?story=1#chapter-<n>). data = { journey }. The chapters play one at a time in
// journey order: the chapter's heading takes focus and is announced, its narration starts (autoplay
// rules as in a room), and at its end the story bar counts down to the next chapter (Stay, Close
// story; Esc closes); after the last room, the ending page. The bar's Close story is always there.
export function mountLiteStory({ data, root = document }) {
  const journey = data && data.journey;
  if (!journey || !readStory(location.href)) return null;
  if (navType() === 'back_forward' || !journey.rooms.length) { dropStoryFromUrl(); storyTransitions(false); return null; }
  const autoplay = arrivalAllowed();
  storyTransitions(true);
  const bar = root.querySelector('[data-story-bar]');
  const stay = bar && bar.querySelector('[data-story-stay]');
  const timers = createTimers();
  let room = null, story = null, listening = null;
  const view = cardView({ card: bar, text: bar && bar.querySelector('[data-story-text]'), stay, live: root.querySelector('[data-story-announce]'),
    timers, persistent: true, idleText: () => (room ? `Story: ${room.title}` : 'Story'),
    focusAfter: () => bar && bar.querySelector('[data-story-close]') });
  const { say } = view;
  const leave = createLeave({ fade: fadeOut, navigate: href => location.assign(href), mark: goToken });
  const sectionOf = r => root.getElementById ? root.getElementById(`chapter-${r.n}`) : document.getElementById(`chapter-${r.n}`);

  const close = ({ quiet = false } = {}) => {
    if (!story) return;
    const had = bar && bar.contains(document.activeElement);
    story.close(); story = null;
    leave.cancel(); clearFade();
    timers.clearAll();
    if (listening) { listening.abort(); listening = null; }
    if (bar) bar.hidden = true;
    dropStoryFromUrl();
    storyTransitions(false);
    if (!quiet) say('Story closed.');
    const h = room && sectionOf(room) && sectionOf(room).querySelector('h2');
    if (had && h) h.focus({ preventScroll: true });
  };

  function enter(r, { play }) {
    room = r;
    const section = sectionOf(r);
    const step = liteStep(journey, r.id);
    if (listening) listening.abort();
    listening = new AbortController();
    story = createStory({
      step, timers,
      go: s => {
        if (s.kind === 'end') { leave.go(s.href); return; }
        const a = section && section.querySelector('audio[data-narration]');
        if (a && !a.paused) a.pause();
        enter(s.room, { play: true });
      },
      onState: (st, { left } = {}) => {
        if (st === 'counting') view.counting(step.kind === 'end' ? END_NAME : step.room.title, left); else view.rest();
      },
    });
    view.rest();
    if (bar) bar.hidden = false;
    try { history.replaceState(history.state, '', `${location.pathname}${location.search}#chapter-${r.n}`); } catch { /* sandboxed */ }
    const h = section && section.querySelector('h2');
    if (section) scrollReveal().reveal(section, { block: 'start', smooth: !reducedMotion() });
    if (h) {
      h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
      // The browser's own move to the #chapter fragment at the end of loading resets focus: focus the
      // heading again then, unless the visitor has put focus somewhere themselves.
      if (document.readyState !== 'complete') {
        addEventListener('load', () => setTimeout(() => {
          const a = document.activeElement;
          if (room === r && (!a || a === document.body)) h.focus({ preventScroll: true });
        }, 0), { once: true });
      }
    }
    const audio = section && section.querySelector('audio[data-narration]');
    if (!audio) { say(`Now in: ${r.title}`); story.narrationEnded(); return; }
    const ended = () => { if (story) story.narrationEnded(); };
    audio.addEventListener('ended', ended, { signal: listening.signal });
    audio.addEventListener('error', ended, { signal: listening.signal, once: true });
    const now = story;
    const p = play ? Promise.resolve().then(() => audio.play()).then(() => true, () => false) : Promise.resolve(false);
    p.then(ok => {
      if (story !== now) return;
      say(ok ? `Now in: ${r.title}` : `Now in: ${r.title}. Press Play to hear the narration; the story goes on when it ends.`);
    });
  }

  if (bar) {
    if (stay) stay.addEventListener('click', () => { if (story) { story.stay(); say('Countdown stopped.'); } });
    bar.querySelector('[data-story-close]').addEventListener('click', () => close());
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.defaultPrevented) close(); });
  addEventListener('pagehide', e => { if (e.persisted) close({ quiet: true }); });
  addEventListener('pageshow', e => { if (e.persisted) { close({ quiet: true }); clearFade(); } });

  const n = Number((/^#chapter-(\d+)$/.exec(location.hash) || [])[1]);
  const first = journey.rooms.find(r => r.n === n) || journey.rooms[0];
  fadeIn();
  enter(first, { play: autoplay });
  return { close, room: () => room };
}

// The room page's redirect to Lite (no WebGL2, reduced motion without a stored 3D choice, ?lite): in
// story mode it keeps the story (and the right to start the narration, when the room had it).
export function liteRedirectUrl({ slug, n }) {
  const st = readStory(location.href);
  if (!st || navType() === 'back_forward') return `/${slug}/lite/#chapter-${n}`;
  const url = liteUrl(slug, n, st.from);
  if (arrivalAllowed()) goToken(url);
  return url;
}

// Globe page. data = { journey }; aerial: the aerial zoom API (null on the flat map or without
// WebGL); ui = { start, bar, status, skip, close }; say: the stage's polite live region;
// stage: the globe stage (null on the flat map); lite: rooms will open as Lite (the Start link goes to
// the Lite page). Returns { close, active } so the page can end the story on any visitor action of
// its own (a pin, a stop, the tour, Back to the globe).
export function mountGlobeStory({ data, aerial = null, stage = null, ui = {}, say = () => {}, onStart = () => {}, lite = false }) {
  const journey = data && data.journey;
  let run = null, step = null, leave = null, mayPlay = true;
  const setBar = on => {
    if (ui.bar) ui.bar.hidden = !on;
    if (stage) { if (on) stage.dataset.story = run ? run.state() : 'moving'; else delete stage.dataset.story; }
  };
  const close = ({ quiet = false } = {}) => {
    if (!run) return;
    const had = ui.bar && ui.bar.contains(document.activeElement);
    run.close(); run = null;
    if (leave) { leave.cancel(); leave = null; }
    clearFade();
    setBar(false);
    dropStoryFromUrl();
    storyTransitions(false);
    if (!quiet) say('Story closed.');
    if (had && ui.start) ui.start.focus({ preventScroll: true });
  };
  const begin = (s, { replace }) => {
    step = s;
    storyTransitions(true);
    const name = s.to ? s.to.title : END_NAME;
    if (ui.status) ui.status.textContent = `Story: on to ${name}`;
    leave = createLeave({ fade: fadeOut, navigate: href => (replace ? location.replace(href) : location.assign(href)),
      mark: href => { if (mayPlay) goToken(href); } });
    const mine = leave;
    run = runGlobeStory({
      step: s, aerial,
      onPhase: p => {
        if (stage && run && ui.bar && !ui.bar.hidden) stage.dataset.story = p;
        if (p === 'hold') {
          if (ui.status) ui.status.textContent = `Entering ${name}`;
          const enter = stage && stage.querySelector('[data-aerial-enter]');
          if (enter) enter.setAttribute('href', s.href);
          say(`Entering ${name}. Press Skip to go now, or Close story to stay.`);
        }
      },
      go: href => { mine.go(href); },
    });
    // The bar only for a sequence on the globe; a door step or the end just fades on.
    setBar(Boolean(aerial) && Boolean(stage) && s.via === 'globe' && Boolean(s.to));
  };

  if (ui.skip) ui.skip.addEventListener('click', () => { if (run) run.skip(); });
  if (ui.close) ui.close.addEventListener('click', () => close());
  // "Enter the room" pressed during the hold: the same way in as the hold's own end (one navigation,
  // with the autoplay token and the fade), the hold's timer cancelled.
  const enterLink = stage && stage.querySelector('[data-aerial-enter]');
  if (enterLink) enterLink.addEventListener('click', e => {
    if (!plainClick(e) || !run || run.state() !== 'hold') return;
    e.preventDefault();
    run.skip();
  });
  // Esc during the story closes it, up to the moment the page goes (before the aerial's own Esc = Skip,
  // which it pre-empts).
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !e.defaultPrevented && run && (['moving', 'hold'].includes(run.state()) || (leave && leave.leaving()))) {
      e.preventDefault(); close();
    }
  }, true);
  addEventListener('pagehide', e => { if (e.persisted) close({ quiet: true }); });
  addEventListener('pageshow', e => { if (e.persisted) { close({ quiet: true }); clearFade(); } });

  if (ui.start && journey) {
    const first = journey.rooms[0];
    if (lite && first) ui.start.setAttribute('href', liteUrl(journey.slug, first.n, null));
    ui.start.addEventListener('click', e => {
      if (!plainClick(e)) return;
      // Without the globe (flat map) the link itself enters the first room (or its Lite chapter).
      if (!aerial || !stage) { storyTransitions(true); goToken(ui.start.href); return; }
      e.preventDefault();
      if (run) close({ quiet: true });
      mayPlay = true; // the visitor's own Start click
      onStart();
      begin(nextStop(journey, null), { replace: false });
    });
  }
  // Arriving from a room: ?story=1&from=<room>. Not by Back / Forward.
  const st = journey ? readStory(location.href) : null;
  if (st) {
    const s = navType() === 'back_forward' || !st.from ? null : nextStop(journey, st.from);
    if (!s) { dropStoryFromUrl(); storyTransitions(false); }
    else {
      // The next room starts its narration only if this page was reached through the story.
      mayPlay = arrivalAllowed();
      fadeIn(); if (aerial && stage && s.via === 'globe') onStart(); begin(s, { replace: true });
    }
  }
  return { close, active: () => Boolean(run), step: () => step, state: () => (run ? run.state() : 'idle') };
}
