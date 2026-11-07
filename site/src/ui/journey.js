// Journey page runtime (/<slug>/): picks the globe or the flat map, then wires pins, the numbered
// stop buttons in the list, the stop card on the stage, the aerial zoom and the "Play journey" tour.
// Choosing a stop (pin, list title, the card's previous / next) that has an aerial stack plays the
// zoom (src/museum/aerial.js): down to the place (the building only when the verified fact names an
// address and a building-precise source exists, else the neighbourhood), then "Enter the room" for a stop with a room,
// or the stop card for one without. Back to the globe (or closing that card) zooms out; choosing
// another stop from the aerial view zooms out, flies along the arc and zooms in. A stop without a
// stack gets the turn of the globe and the stop card. The tour only turns the globe and opens cards.
// Mode precedence is the rooms' (capability.js chooseMode): no WebGL2 or ?lite -> flat map; a
// stored choice wins over the reduced-motion query; reduced motion alone -> flat map. If the globe
// cannot start, or its WebGL context is lost, the flat map shows instead. The stop list below is
// the accessible path in every mode.
import { chooseMode, probeWebGL2, readModePref, wireModeLinks } from '../museum/capability.js';
import { createPanel } from './panel.js';
import { scrollReveal } from './scroll-reveal.js';
import { mountGlobeStory } from './story.js';

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const DWELL_MS = 6500; // how long the tour stays on each stop's card

export async function startJourney({ stops, story: storyData = null }) {
  wireModeLinks();
  const flat = document.querySelector('[data-flat-map]');
  const figure = document.querySelector('[data-globe-figure]');
  const webgl2 = probeWebGL2();
  const mode = chooseMode({ webgl2, liteParam: new URL(location.href).searchParams.has('lite'), userPref: readModePref(), reducedMotion: reducedMotion() });
  const toGlobe = document.querySelector('[data-to-globe]');
  const startLink = document.querySelector('[data-story-start]');
  // Story mode without the globe (flat map, no WebGL, the globe failed): fades between pages only. When
  // the rooms open as Lite too (the same mode choice), the story runs on the Lite page.
  const plainStory = () => mountGlobeStory({ data: storyData, ui: { start: startLink }, lite: mode === 'lite' });
  if (mode === 'lite' || !figure || !stops.length) {
    if (toGlobe && webgl2 && stops.length) toGlobe.hidden = false;
    plainStory();
    return;
  }

  const stage = figure.querySelector('[data-stage]');
  const canvas = document.createElement('canvas');
  canvas.id = 'globe';
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);
  const showGlobe = on => { figure.hidden = !on; flat.hidden = on; listButtons.forEach(([b, span]) => { b.hidden = !on; span.hidden = on; }); };

  const pins = new Map([...stage.querySelectorAll('[data-pin]')].map(b => [b.dataset.pin, b]));
  const listButtons = [...document.querySelectorAll('[data-show-stop]')].map(b => [b, b.parentElement.querySelector('[data-title-static]')]);
  const showBtn = new Map(listButtons.map(([b]) => [b.dataset.showStop, b]));
  const order = stops.map(s => s.id);
  const label = new Map(stops.map(s => [s.id, `Stop ${s.number}: ${s.label}`]));
  const announce = stage.querySelector('[data-announce]');
  const byId = new Map(stops.map(s => [s.id, s]));
  const tour = stage.querySelector('[data-tour]');
  const playBtn = tour.querySelector('[data-tour-play]');
  const stopBtn = tour.querySelector('[data-tour-stop]');
  const playLabel = tour.querySelector('[data-tour-label]');

  showGlobe(true);
  let globe = null;
  try {
    const { startGlobe } = await import('../museum/globe.js');
    globe = await startGlobe({
      canvas, stage, stops, pins, leaders: stage.querySelector('[data-leaders]'), reduced: reducedMotion,
      phone: matchMedia('(max-width: 899px), (pointer: coarse)').matches,
    });
  } catch (err) {
    console.error('globe failed to start', err);
    canvas.dataset.ready = 'failed';
    showGlobe(false);
    plainStory();
    return;
  }

  let aerial = null;
  try {
    const { createAerial } = await import('../museum/aerial.js');
    const q = sel => stage.querySelector(sel);
    aerial = createAerial({
      host: globe.host, stage, stops, reduced: reducedMotion,
      ui: { skip: q('[data-aerial-skip]'), back: q('[data-aerial-back]'), caption: q('[data-aerial-caption]'), place: q('[data-aerial-place]'),
        credits: q('[data-aerial-credits]'), enter: q('[data-aerial-enter]'), mark: q('[data-aerial-mark]') },
    });
  } catch (err) {
    console.error('aerial zoom unavailable', err); // pins still turn the globe and open the card
  }

  let active = null;
  const setActive = id => {
    active = id;
    for (const [pid, p] of pins) p.classList.toggle('is-active', pid === id);
  };

  const panel = createPanel(document.getElementById('panel'), {
    inert: [canvas, stage.querySelector('[data-pins]')], // what the card covers; the tour controls stay live
    order,
    onStep: id => { if (playing()) tourGo(order.indexOf(id)); else visit(id, pins.get(id), showBtn.get(id)); },
    // Keep the stop in the visible part of the stage: the bottom sheet covers 58 % of the stage
    // height on a phone, the side card min(420 px, 42 %) of its width on desktop (panel.css).
    onToggle: open => {
      if (open) { cardFrame(true); return; }
      if (quietClose) return;
      if (aerial && aerial.state() === 'arrived') { leaveAerial(); return; }
      cardFrame(false); setActive(null); if (playing()) endTour();
    },
  });
  let quietClose = false;
  const closeQuietly = () => { if (!panel.isOpen()) return; quietClose = true; panel.close(); quietClose = false; };
  // Keep the stop in the visible part of the stage: the bottom sheet covers 58 % of the stage
  // height on a phone, the side card min(420 px, 42 %) of its width on desktop (panel.css).
  // Phone: the stop sits a little below the middle of the strip above the sheet, so the labels
  // fanned out above it stay clear of the tour buttons in the stage's top corner.
  // In the aerial view on a phone the stop sits midway between the bottom of the zoom's bar (Back
  // and the caption, measured: a long place or credit wraps to more lines) and the sheet, so the
  // building marker stays clear of both. Before the bar has a size, a one-line caption's 130 px.
  const aerialBar = stage.querySelector('.aerial-bar');
  const barBottom = () => {
    const b = aerialBar && aerialBar.getBoundingClientRect();
    return b && b.height > 0 ? b.bottom - stage.getBoundingClientRect().top : 130;
  };
  let framed = false;
  function cardFrame(on) {
    framed = on;
    const h = Math.max(1, stage.clientHeight);
    if (!on) globe.setFrame(0, 0);
    else if (matchMedia('(max-width: 899px)').matches) {
      globe.setFrame(0, aerial && aerial.state() !== 'idle' ? Math.max(0, Math.min(0.2, 0.5 - (barBottom() + 0.42 * h) / 2 / h)) : 0.2);
    }
    else globe.setFrame(Math.min(420 / Math.max(1, canvas.clientWidth), 0.42) / 2, 0);
  }
  // The bar grows when its caption appears or wraps: frame the stop again against its new size.
  if (aerialBar && typeof ResizeObserver === 'function') new ResizeObserver(() => { if (framed) cardFrame(true); }).observe(aerialBar);

  // ---- Aerial zoom. `visiting` numbers the visitor's latest choice; an older one stops at its next step.
  let visiting = 0, returnTo = null;
  const say = text => { if (announce) announce.textContent = text; };
  function revealStage() {
    const r = stage.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= innerHeight) return;
    scrollReveal().reveal(stage, { block: r.height > innerHeight ? 'start' : 'center', smooth: !reducedMotion() });
  }
  // Focus follows the controls on the stage: during a sequence, when the focused control is gone
  // (hidden pin, Back or Enter that just hid, the closed card), Skip takes focus.
  const lost = a => !a || a === document.body || a.closest('[data-pins]') || a.closest('#panel[hidden]') ||
    (typeof a.checkVisibility === 'function' && !a.checkVisibility({ visibilityProperty: true }));
  if (aerial) aerial.onChange(s => {
    const skip = stage.querySelector(stage.hasAttribute('data-story') ? '[data-story-skip]' : '[data-aerial-skip]');
    if (s !== 'idle' && s !== 'arrived' && lost(document.activeElement)) skip.focus({ preventScroll: true });
  });
  // Escape in the aerial end view (no card open; the card handles its own Escape) goes back to the globe.
  if (aerial) document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !e.defaultPrevented && aerial.state() === 'arrived' && !panel.isOpen()) { e.preventDefault(); leaveAerial(); }
  });
  async function visit(id, opener, fallback) {
    story.close(); // a stop the visitor chose ends the story
    const s = byId.get(id);
    if (!aerial || !s || !s.aerial) { if (aerial && aerial.state() !== 'idle') await leaveAerial({ refocus: false }); openStop(id, opener, fallback); return; }
    const mine = ++visiting;
    aerial.chain(); // a new visitor action: one Skip ends all of its steps
    returnTo = { id, opener, fallback };
    closeQuietly();
    setActive(id);
    revealStage();
    say(`Zooming to ${s.label}. Press Skip or Escape to jump to the end.`);
    const prev = aerial.current();
    if (prev && prev !== id) {
      if ((await aerial.zoomOut()) === 'cancelled' || mine !== visiting) return;
      if ((await aerial.flyAlongArc(prev, id)) === 'cancelled' || mine !== visiting) return;
    }
    const zoom = aerial.zoomIn(id); // enters 'loading' at once, so the frame below is the aerial one
    cardFrame(!s.room);
    const r = await zoom;
    if (r === 'cancelled' || mine !== visiting) return;
    if (r === 'arrived' && s.room) {
      say(`Present-day aerial view${aerial.precision() === 'building' ? '' : ', approximate location'}: ${s.label}.`);
      stage.querySelector('[data-aerial-enter]').focus({ preventScroll: true });
      return;
    }
    // No room, or no aerial image loaded: the stop card. Focus comes back here via returnTo.
    panel.open(id, null, null);
  }
  // Back to the globe from the building: zoom out, then focus the stop's pin (or its list button).
  async function leaveAerial({ refocus = true } = {}) {
    story.close();
    const mine = ++visiting;
    aerial.chain();
    closeQuietly();
    const r = await aerial.zoomOut();
    if (r === 'cancelled' || mine !== visiting) return;
    cardFrame(false); setActive(null);
    const back = returnTo; returnTo = null;
    if (!refocus || !back) return;
    const pin = pins.get(back.id);
    requestAnimationFrame(() => {
      if (pin && !pin.hasAttribute('data-offscreen') && back.opener === pin) pin.focus();
      else if (back.fallback || back.opener) (back.fallback || back.opener).focus();
    });
  }
  const backBtn = stage.querySelector('[data-aerial-back]');
  if (backBtn) backBtn.addEventListener('click', () => leaveAerial());

  // Turn the globe to the stop and open its card on the stage. Focus returns to `opener` (the pin
  // or the list button), or to `fallback` when the opener cannot take focus.
  function openStop(id, opener, fallback = null, { focus = true } = {}) {
    setActive(id);
    globe.flyTo(id);
    panel.open(id, opener, fallback, { focus });
    if (!focus && announce) announce.textContent = label.get(id);
  }
  for (const [id, p] of pins) p.addEventListener('click', () => { if (playing()) endTour(); visit(id, p, showBtn.get(id)); });
  for (const [id, b] of showBtn) b.addEventListener('click', () => { if (playing()) endTour(); visit(id, b); });

  // Tour: stop to stop in list order, opening each card; Pause holds it, Stop ends it. The cards
  // open without taking focus so the tour's own buttons stay under the visitor's hand.
  let state = 'idle', index = -1, timer = 0;
  const playing = () => state !== 'idle';
  const setState = s => {
    state = s;
    playBtn.dataset.state = s;
    playLabel.textContent = s === 'playing' ? 'Pause' : s === 'paused' ? 'Resume journey' : 'Play journey';
    stopBtn.hidden = s === 'idle';
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => (index < order.length - 1 ? tourGo(index + 1) : endTour({ keepCard: true })), DWELL_MS); };
  function tourGo(i) {
    index = i;
    const id = order[i];
    openStop(id, playBtn, null, { focus: false });
    if (state === 'playing') schedule();
  }
  function endTour({ keepCard = false } = {}) {
    clearTimeout(timer);
    setState('idle');
    index = -1;
    if (!keepCard && panel.isOpen()) panel.close();
  }
  playBtn.addEventListener('click', () => {
    story.close();
    if (state === 'playing') { clearTimeout(timer); setState('paused'); return; }
    if (state === 'paused') { setState('playing'); schedule(); return; }
    setState('playing');
    tourGo(0);
  });
  stopBtn.addEventListener('click', () => { endTour(); playBtn.focus(); });

  globe.onContextLost(lost => {
    if (lost) { story.close({ quiet: true }); visiting++; if (aerial) aerial.abort(); if (playing()) endTour(); if (panel.isOpen()) panel.close(); }
    showGlobe(!lost);
    canvas.dataset.ready = lost ? 'lost' : 'true';
  });

  // Story mode (?story=1&from=<room>, or "Start the story"): the zoom sequence between rooms.
  const story = mountGlobeStory({
    data: storyData, aerial, stage, say,
    ui: { start: startLink, bar: stage.querySelector('[data-story-bar]'), status: stage.querySelector('[data-story-status]'),
      skip: stage.querySelector('[data-story-skip]'), close: stage.querySelector('[data-story-close]') },
    onStart: () => {
      visiting++; // a visit under way stops at its next step
      if (playing()) endTour();
      closeQuietly();
      revealStage();
    },
  });

  // Test hook, only in PUBLIC_TEST_HOOKS=1 builds (the Playwright configs) and with ?debug: read-only
  // globe state for e2e checks. Vite folds the flag at build time, so production output has no hook.
  if (import.meta.env.PUBLIC_TEST_HOOKS === '1' && new URL(location.href).searchParams.has('debug')) {
    window.__voaGlobe = { ...globe.debug, active: () => active, tour: () => ({ state, index }) };
    if (aerial) window.__voaAerial = { ...aerial.debug, state: aerial.state, current: aerial.current };
  }
  canvas.dataset.ready = 'true';
}
