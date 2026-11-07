// Exhibit panel, opened ON the stage (it lives inside .stage): docked on the right of the 3D view at
// >= 900 px, a bottom sheet over the stage below (CSS). A NON-modal dialog (role="dialog", labelled
// by its heading, no aria-modal): focus goes to the heading, Escape and Close return focus to the
// opener (the hotspot or list button that opened it), and Tab is not trapped, so it may walk on to
// the narration player or the journey tour controls, which stay operable. Only what the panel
// covers goes inert while it is open: the 3D canvas and its hotspots or pins (`inert` option).
// Previous / next step through the exhibits in number order.
import { initToggletips } from './sources.js';
import { scrollReveal } from './scroll-reveal.js';

export function createPanel(aside, { inert = [], order = [], onStep = null, onToggle = null } = {}) {
  const body = aside.querySelector('[data-panel-body]');
  const closeBtn = aside.querySelector('[data-panel-close]');
  const prev = aside.querySelector('[data-panel-prev]');
  const next = aside.querySelector('[data-panel-next]');
  const stage = aside.closest('[data-stage]');
  let opener = null, fallback = null, current = null;
  let inerted = [];

  function showMissing(fig) {
    const media = fig.querySelector('[data-media]');
    const notice = fig.querySelector('[data-media-missing]');
    if (media) media.hidden = true;
    if (notice) notice.hidden = false;
  }

  function wireMedia(root) {
    const fig = root.querySelector('[data-figure]');
    if (!fig) return;
    const media = fig.querySelector('[data-media]');
    if (!media) return;
    media.addEventListener('error', () => showMissing(fig), { once: true });
    if (media.tagName === 'MODEL-VIEWER') {
      // Loaded only when a 3D document is opened; keeps the chapter bundle small.
      import('@google/model-viewer').catch(() => showMissing(fig));
    } else if (media.complete && media.naturalWidth === 0 && media.getAttribute('src')) {
      showMissing(fig);
    }
  }

  // Bring the stage into view when the panel opens from elsewhere on the page (the list below).
  function revealStage() {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= innerHeight) return;
    const smooth = !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    // Never a native smooth scrollIntoView: it cannot be stopped and lands after later scrolls
    // (src/ui/scroll-reveal.js).
    scrollReveal().reveal(stage, { block: r.height > innerHeight ? 'start' : 'center', smooth });
  }

  function stepState() {
    const i = order.indexOf(current);
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i === -1 || i >= order.length - 1;
  }

  // `from`: the element focus returns to on close; `back`: used when `from` cannot take focus.
  // `focus: false` leaves focus where it is (an automatic tour opening cards must not pull focus
  // away from its own Pause and Stop buttons, which are kept live).
  function open(exhibitId, from, back = null, { focus = true } = {}) {
    const tpl = document.getElementById(`tpl-${exhibitId}`);
    if (!tpl) return;
    opener = from || null; fallback = back; current = exhibitId;
    const frag = tpl.content.cloneNode(true);
    body.replaceChildren(frag);
    wireMedia(body); // after insertion: template content is inert until adopted, and error events are async
    initToggletips(body);
    if (!inerted.length) { inerted = inert.filter(el => el && !el.inert); inerted.forEach(el => { el.inert = true; }); }
    aside.hidden = false;
    aside.scrollTop = 0;
    if (stage) stage.dataset.panelOpen = '';
    if (onToggle) onToggle(true);
    stepState();
    revealStage();
    const heading = aside.querySelector('#panel-title');
    if (heading && focus) heading.focus({ preventScroll: true });
    document.addEventListener('keydown', onKey, true);
  }

  function close() {
    if (aside.hidden) return;
    aside.hidden = true;
    if (stage) delete stage.dataset.panelOpen;
    if (onToggle) onToggle(false);
    inerted.forEach(el => { el.inert = false; }); // before focus returns to the opener
    inerted = [];
    body.replaceChildren();
    document.removeEventListener('keydown', onKey, true);
    const to = opener, alt = fallback; opener = null; fallback = null; current = null;
    if (to && to.isConnected) to.focus();
    if (alt && alt.isConnected && document.activeElement !== to) alt.focus();
  }

  // Escape closes the dialog wherever focus is, since Tab may leave the panel. An open source tip
  // takes Esc first (src/ui/sources.js, installed by initToggletips before this listener).
  function onKey(e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    close();
  }

  const step = d => {
    const i = order.indexOf(current) + d;
    if (i < 0 || i >= order.length || !onStep) return;
    onStep(order[i]);
  };
  if (prev) prev.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));
  closeBtn.addEventListener('click', close);
  return { open, close, isOpen: () => !aside.hidden, current: () => current };
}
