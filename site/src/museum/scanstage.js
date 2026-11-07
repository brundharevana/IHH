// Scanned-room stage (real-scan museum, Tasks 3 and 5): the loading view over the stage and the
// prefetch of the next room's bundles. Used by scene.js startChapter.
import { reducedMotion } from './camera.js';
import { chooseScan } from './scanroom.js';
import { deviceClass, prefetch } from './loader.js';

// Loading view of a scanned room (ChapterRoom.astro [data-scan-loading]): the room's name and the
// bytes streamed so far, over the stage until the room is drawn. On failure the stage shows the Lite
// fallback message ([data-scan-failed]) instead; never a black stage.
const MB = b => (b / 1e6).toFixed(1);
// The preview's bytes drive the loading view; once the preview is drawn the view fades out and a
// small "full detail" pill ([data-scan-detail]) shows the full bundle's bytes until it is swapped in.
// While the failure card is up nothing is drawn over it: no pill, and the view does not come back.
export function scanLoadingView(root = document, { reduced = reducedMotion } = {}) {
  const view = root.querySelector('[data-scan-loading]'), failed = root.querySelector('[data-scan-failed]');
  const pill = root.querySelector('[data-scan-detail]');
  const bar = view && view.querySelector('progress'), text = view && view.querySelector('[data-scan-progress-text]');
  const pillBar = pill && pill.querySelector('progress');
  // The stage under the loading view or the failure card: data-covered hides its controls (CSS in
  // ChapterRoom.astro); set in the markup for a scanned room, cleared when the room is drawn.
  const anchor = view || failed;
  const stage = anchor && typeof anchor.closest === 'function' ? anchor.closest('[data-stage]') : null;
  const cover = on => { if (stage) stage.toggleAttribute('data-covered', on); };
  let shown = -1, down = false;
  const setBar = (b, { loaded, total }) => { b.setAttribute('max', String(total)); b.setAttribute('value', String(Math.min(loaded, total))); };
  return {
    progress(p) {
      if (!bar || !(p.total > 0)) return;
      setBar(bar, p);
      const pct = Math.floor((100 * p.loaded) / p.total);
      if (pct !== shown) { shown = pct; if (text) text.textContent = `${MB(p.loaded)} of ${MB(p.total)} MB`; }
    },
    // The preview is drawn: the loading view fades out over it.
    done() {
      if (!down) cover(false);
      if (!view || view.hidden) return;
      view.classList.add('is-leaving');
      setTimeout(() => { view.hidden = true; view.classList.remove('is-leaving'); }, reduced() ? 0 : 400);
    },
    detail(p) { if (pill && !down && p.total > 0) { pill.hidden = false; if (pillBar) setBar(pillBar, p); } },
    detailDone() { if (pill) pill.hidden = true; },
    fail() {
      down = true;
      cover(true);
      if (view) view.hidden = true;
      if (pill) pill.hidden = true;
      if (failed) { failed.hidden = false; failed.focus({ preventScroll: true }); }
    },
    recover() { down = false; cover(false); if (failed) failed.hidden = true; },
    failed: () => down,
  };
}

// Prefetch the next room's scan bundle (this device's class) during the narration: once the room has
// arrived and the narration plays, or at arrival in a room without narration; never in competition
// with this room's own full bundle (`after`). Same origin only, never under Save-Data (loader.js
// prefetch); cancelled if the visitor leaves another way, also before it has started.
export function prefetchNextScan({ next, doors, audio, after = Promise.resolve(), prefetchImpl = prefetch, cls = deviceClass, base = null }) {
  const nextScan = next && next.scan;
  if (!nextScan) return;
  let started = false, cancelled = false, parts = [];
  const go = () => {
    if (started) return;
    started = true;
    after.then(() => {
      if (cancelled) return;
      const b = chooseScan(nextScan, cls());
      parts = [prefetchImpl(nextScan.preview.url), prefetchImpl(nextScan.occluder.url), prefetchImpl(b.url)];
    });
  };
  doors.onArrive(() => {
    if (!audio) go();
    else if (!audio.paused) go();
    else audio.addEventListener('play', go, { once: true });
  });
  const here = () => base || location.href;
  doors.beforeNavigate(url => {
    if (next.href && new URL(url, here()).href === new URL(next.href, here()).href) return;
    cancelled = true;
    parts.forEach(x => x.abort());
  });
}
