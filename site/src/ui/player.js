// Narration player on the 3D stage (Tapestry / video-player style): a large centred play button
// before the first start, then a compact control bar over the bottom of the stage (play/pause,
// scrubber, time, captions toggle, mute) and captions drawn over the scene from the WebVTT cue
// track. The transcript below the stage stays the accessible text alternative; the caption overlay
// is aria-hidden so screen readers do not hear every line twice. No autoplay, except in story mode
// (tryPlay), which the visitor started.
// Keyboard (focus anywhere in the stage, or nowhere in particular): Space or K play/pause,
// C captions, M mute; the scrubber takes the arrow keys.

export function fmtTime(s) {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Index of the cue playing at time t (cues sorted by startTime), or -1. Between cues (the short
// pauses in the narration) the previous cue stays current, so a caption does not flicker off.
export function cueIndexAt(cues, t) {
  let at = -1;
  for (let i = 0; i < cues.length; i++) if (cues[i].startTime <= t + 1e-3) at = i; else break;
  return at;
}

const isTyping = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
const activates = el => el && /^(BUTTON|A|SUMMARY|SELECT)$/.test(el.tagName);

// Captions on a phone (fix round 2): at most `lines` lines. A cue that needs more is split into pages of
// whole words, shown one after another over the cue's time. measure(text) -> px width.
export function captionPages(text, measure, maxWidth, lines = 2) {
  const words = String(text).split(/\s+/).filter(Boolean), rows = [];
  let row = '';
  for (const w of words) {
    const next = row ? `${row} ${w}` : w;
    if (row && measure(next) > maxWidth) { rows.push(row); row = w; } else row = next;
  }
  if (row) rows.push(row);
  const pages = [];
  for (let i = 0; i < rows.length; i += lines) pages.push(rows.slice(i, i + lines).join(' '));
  return pages.length ? pages : [''];
}
export function pageAt(pages, cue, t) {
  const span = Math.max(1e-3, (cue.endTime || cue.startTime + 1) - cue.startTime);
  const k = Math.floor(((t - cue.startTime) / span) * pages.length);
  return pages[Math.min(pages.length - 1, Math.max(0, k))];
}

// Calls `fn` once the document's web fonts are ready and again whenever a font finishes loading
// (Font Loading API), so text measured with a fallback font is measured again with the real one.
export function onFontsChange(doc, fn) {
  const fonts = doc && doc.fonts;
  if (!fonts) return;
  if (fonts.ready && typeof fonts.ready.then === 'function') fonts.ready.then(() => fn());
  if (typeof fonts.addEventListener === 'function') fonts.addEventListener('loadingdone', () => fn());
}

import { isCovered, onCoverChange } from './stagecover.js';

export function createStagePlayer({ stage, audio, track }) {
  const q = sel => stage.querySelector(sel);
  const big = q('[data-stage-play]'), play = q('[data-play]'), scrub = q('[data-scrub]'), time = q('[data-time]');
  const cc = q('[data-cc]'), mute = q('[data-mute]'), captions = q('[data-captions]'), captionText = q('[data-caption-text]');
  const cues = () => (track && track.cues ? [...track.cues] : []);
  let captionsOn = true;
  let scrubbing = false;

  // Paging applies where the stylesheet limits the caption's lines (--caption-lines, phones).
  let measureCtx = null;
  const pageCache = new Map();
  const pagedCaption = (cue, t) => {
    const lines = parseInt(getComputedStyle(captions).getPropertyValue('--caption-lines'), 10);
    if (!lines) return cue.text;
    const cs = getComputedStyle(captionText), cc = getComputedStyle(captions);
    const width = stage.clientWidth - parseFloat(cc.paddingLeft) - parseFloat(cc.paddingRight) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
    const key = `${cue.id}|${width}|${cs.font}|${lines}`;
    if (!pageCache.has(key)) {
      if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
      let pages = [cue.text];
      if (measureCtx) { measureCtx.font = cs.font; pages = captionPages(cue.text, s => measureCtx.measureText(s).width, width, lines); }
      pageCache.set(key, pages);
    }
    return pageAt(pageCache.get(key), cue, t);
  };
  // The cache key holds the font shorthand, which does not change when the web font replaces its
  // fallback: drop the measured pages when fonts load and show the current cue measured again.
  onFontsChange(document, () => { pageCache.clear(); render(); });
  const render = () => {
    const playing = !audio.paused && !audio.ended;
    const label = playing ? 'Pause narration' : 'Play narration';
    play.setAttribute('aria-label', label);
    play.dataset.state = playing ? 'playing' : 'paused';
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    scrub.max = String(d || 0);
    if (!scrubbing) scrub.value = String(audio.currentTime || 0);
    const text = `${fmtTime(audio.currentTime)} / ${fmtTime(d)}`;
    time.textContent = text;
    scrub.setAttribute('aria-valuetext', `${fmtTime(audio.currentTime)} of ${fmtTime(d)}`);
    const list = cues(), i = cueIndexAt(list, audio.currentTime);
    const started = stage.dataset.started === 'true';
    const caption = started && i >= 0 ? pagedCaption(list[i], audio.currentTime) : '';
    if (caption !== captionText.textContent) {
      captionText.textContent = caption;
      captionText.classList.remove('is-turn');
      if (caption) { void captionText.offsetWidth; captionText.classList.add('is-turn'); } // restart the fade
    }
    captions.hidden = !captionsOn || !captionText.textContent;
  };

  const start = () => {
    stage.dataset.started = 'true';
    big.hidden = true;
  };
  // A covered stage (loading view, failure card, context loss) holds the narration: nothing starts it
  // (its controls are hidden), a playing narration pauses, and it resumes when the stage is uncovered.
  let resumeOnUncover = false;
  onCoverChange(stage, covered => {
    if (covered) { if (!audio.paused && !audio.ended) { resumeOnUncover = true; audio.pause(); } }
    else if (resumeOnUncover) { resumeOnUncover = false; const p = audio.play(); if (p && p.catch) p.catch(() => render()); }
    render();
  });
  const toggle = () => {
    if (isCovered(stage)) return;
    if (audio.paused || audio.ended) { start(); const p = audio.play(); if (p && p.catch) p.catch(() => render()); }
    else audio.pause();
    render();
  };
  const setCaptions = on => { captionsOn = on; cc.setAttribute('aria-pressed', String(on)); render(); };
  const setMuted = on => { audio.muted = on; mute.setAttribute('aria-pressed', String(on)); mute.setAttribute('aria-label', on ? 'Unmute' : 'Mute'); };

  big.addEventListener('click', () => { toggle(); play.focus(); });
  play.addEventListener('click', toggle);
  cc.addEventListener('click', () => setCaptions(!captionsOn));
  mute.addEventListener('click', () => setMuted(!audio.muted));
  scrub.addEventListener('input', () => {
    scrubbing = true;
    start();
    audio.currentTime = Number(scrub.value);
    scrubbing = false;
    render();
  });
  for (const ev of ['play', 'pause', 'ended', 'timeupdate', 'seeked', 'loadedmetadata', 'durationchange']) audio.addEventListener(ev, render);
  // A seek from elsewhere (a test, the transcript) also counts as starting.
  audio.addEventListener('seeked', () => { if (audio.currentTime > 0) start(); render(); });
  if (track) track.addEventListener('cuechange', render);

  const onKey = e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === 'k' || (k === ' ' && !activates(e.target))) { e.preventDefault(); toggle(); }
    else if (k === 'c') { e.preventDefault(); setCaptions(!captionsOn); }
    else if (k === 'm') { e.preventDefault(); setMuted(!audio.muted); }
  };
  stage.addEventListener('keydown', onKey);
  // With nothing focused (focus on <body>), the shortcuts work too, as on a video page.
  document.addEventListener('keydown', e => { if (e.target === document.body) onKey(e); });

  // Story mode only (src/ui/story.js): start the narration on arrival, the visitor having pressed
  // "Start the story". Resolves true when it plays; false when the browser blocks it, and the big
  // play button stays for the visitor to press.
  const tryPlay = async () => {
    if (isCovered(stage)) return false;
    try {
      const p = audio.play();
      if (p && p.then) await p;
      start(); render();
      return true;
    } catch {
      render();
      return false;
    }
  };

  setCaptions(true);
  setMuted(false);
  render();
  // Once the visitor acts in the room (chooses an exhibit, drags, uses the rail), the big centre play
  // button collapses into the bar's play button, which stays: nothing then covers the middle of the stage.
  const collapse = () => { if (big) big.hidden = true; };
  return { toggle, render, tryPlay, collapse, captionsOn: () => captionsOn };
}
