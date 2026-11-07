// Ambient room tone (Base.astro header button). Off by default; nothing is fetched or played until
// the visitor asks for it. aria-pressed is "true" only while the tone is actually playing. The
// choice is kept in localStorage (every access wrapped: a blocked storage just means it is not
// remembered). A remembered "on" starts only after the visitor's first click or key press on the
// next page (browsers block sound before a gesture, and the page must not start sound on its own);
// until then the button stays unpressed. If starting fails, the stored choice is reset to off.
// deps (tests): { store, AudioContext, fetch, win }; defaults are the browser's.
const KEY = 'voa-ambient';
const SRC = '/audio/room-tone.mp3';
const VOLUME = 0.5;

export function readAmbient(store) {
  try { return store.getItem(KEY) === 'on'; } catch { return false; }
}
export function writeAmbient(store, on) {
  try { store.setItem(KEY, on ? 'on' : 'off'); } catch { /* not remembered */ }
}

function browserDeps() {
  let store = null;
  try { store = window.localStorage; } catch { /* blocked */ }
  return { store, AudioContext: window.AudioContext || window.webkitAudioContext, fetch: (...a) => window.fetch(...a), win: window };
}

export function mountAmbient(btn, deps = browserDeps()) {
  if (!btn) return;
  const { store, AudioContext: AC, fetch, win } = deps;
  let ctx = null, source = null, buffer = null, want = false;

  const show = state => {
    btn.dataset.state = state; // off | loading | on | waiting
    btn.setAttribute('aria-pressed', String(state === 'on'));
  };

  async function start() {
    if (!AC) throw new Error('no Web Audio');
    ctx = ctx || new AC();
    await ctx.resume();
    if (!buffer) {
      const res = await fetch(SRC);
      if (!res.ok) throw new Error(`room tone: ${res.status}`);
      buffer = await ctx.decodeAudioData(await res.arrayBuffer());
    }
    if (!want || source) return; // turned off while loading, or already playing
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 1.5);
    source = ctx.createBufferSource();
    source.buffer = buffer; source.loop = true; // a decoded buffer loops without a gap
    source.connect(gain).connect(ctx.destination);
    source.start();
    show('on');
  }
  function stop() {
    if (source) { try { source.stop(); } catch { /* already stopped */ } source.disconnect(); source = null; }
    if (ctx) ctx.suspend();
    show('off');
  }
  function turnOn() {
    want = true;
    if (store) writeAmbient(store, true);
    show('loading');
    start().catch(() => {
      want = false;
      if (store) writeAmbient(store, false);
      stop();
    });
  }
  function turnOff() {
    want = false;
    if (store) writeAmbient(store, false);
    stop();
  }

  show('off');
  btn.addEventListener('click', () => (want ? turnOff() : turnOn()));
  if (store && readAmbient(store)) {
    show('waiting');
    const first = e => {
      win.removeEventListener('pointerdown', first, true);
      win.removeEventListener('keydown', first, true);
      if (e.target === btn || btn.contains(e.target)) return; // the button's own click decides
      if (!want) turnOn();
    };
    win.addEventListener('pointerdown', first, true);
    win.addEventListener('keydown', first, true);
  }
}
