// "Drag to look around" hint (real-scan museum spec, Camera; REF-tapestry-v2 section 7.4): a glass
// pill over a hand icon, shown when the narration ends on a station where looking around is
// allowed, and hidden for good on the visitor's first drag. It fades in and out over HINT_FADE_MS
// (CSS on .is-on; static under reduced motion); it is aria-hidden decoration, the rail and the
// "Look around" buttons being the accessible equivalents.
// el: the hint element; audio: the narration (an EventTarget firing 'ended'); lookAround(): whether
// the current station allows it; blocked(): something else holds the stage (panel, story card).
export const HINT_FADE_MS = 200;

export function createDragHint(el, { audio = null, lookAround = () => true, blocked = () => false } = {}) {
  let dragged = false, timer = null;
  const show = () => {
    if (dragged || !el || !lookAround() || blocked()) return;
    clearTimeout(timer);
    el.hidden = false;
    timer = setTimeout(() => el.classList.add('is-on'), 16); // after a style pass, so the fade runs
  };
  const hide = () => {
    if (!el || el.hidden) return;
    clearTimeout(timer);
    el.classList.remove('is-on');
    timer = setTimeout(() => { el.hidden = true; }, HINT_FADE_MS);
  };
  if (audio) audio.addEventListener('ended', show);
  return {
    show,
    hide,
    dragged() { dragged = true; hide(); },
    shown: () => Boolean(el && !el.hidden),
  };
}
