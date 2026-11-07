// Seeking a narration from a test. Setting currentTime only starts a seek: the media element finishes
// it with 'seeked', which on a loaded machine came 4-7 s later (flake-report 2026-10-12), and the
// page's own seek handlers (reveals, highlight, captions, the big play button) run then. So a test
// waits for that event, never for a fixed time, before it looks at what the seek changed.
// `to`: seconds, or { cue: id, dt } (dt seconds into that cue), or { end: s } (s seconds before the end).
export async function seekNarration(page, to, sel = '#narration') {
  return page.evaluate(([s, to]) => new Promise((resolve, reject) => {
    const a = document.querySelector(s);
    if (!a) { reject(new Error(`no narration at ${s}`)); return; }
    const go = () => {
      let t = to;
      if (to && typeof to === 'object' && 'cue' in to) {
        const track = document.getElementById('cues').track;
        const c = [...(track.cues || [])].find(x => x.id === to.cue);
        if (!c) { reject(new Error(`no cue ${to.cue}`)); return; }
        t = c.startTime + (to.dt ?? 0.1);
      } else if (to && typeof to === 'object' && 'end' in to) {
        t = Math.max(0, a.duration - to.end);
      }
      a.addEventListener('seeked', () => resolve(a.currentTime), { once: true });
      a.currentTime = t;
    };
    // { end } needs the duration: wait for the metadata if it is not there yet.
    if (to && typeof to === 'object' && 'end' in to && !(Number.isFinite(a.duration) && a.duration > 0)) a.addEventListener('loadedmetadata', go, { once: true });
    else go();
  }), [sel, to]);
}
