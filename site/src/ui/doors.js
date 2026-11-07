// Room doors at runtime: the entrance and exit door hotspots in the scene and the matching stage
// buttons ("Previous room" / "Next room"), all plain links (ChapterRoom.astro), so they work as
// links without script and before the 3D room starts. A plain click on any of them leaves the room:
// a short walk to that door (at most LEAVE_MAX_MS, eased), then a fade, then the link is followed.
// Under reduced motion there is no walk, only the fade. Esc during a leave cancels it; the visitor
// stays in the room. A modified click (new tab, new window) is left to the browser.
//
// Hooks for story mode (Task 4), on the controller createDoors returns (scene.js startChapter
// returns it as `doors`):
//   exitTo(url)  leave through the exit door to `url` (default: the exit door's own link). Resolves
//                true once navigation has started, false if the leave was cancelled (Esc, cancel())
//                or another leave is already under way.
//   onArrive(fn) call fn() once the room has arrived: the 3D room is ready, or failed to start (the
//                doors then still work as links). Called at once if the room has already arrived.
//   cancel()     stop a leave under way (what Esc does); the camera returns to where it stood.
//   beforeNavigate(fn)  fn(url) runs at the moment a leave navigates (after the walk and the fade),
//                never for a cancelled leave: story mode writes its autoplay token there.
// The controller exists before the 3D room loads: startChapter creates it synchronously, and it is
// available at once from currentDoors() and as the detail of a 'voa:doors' event on document, so
// story mode can register onArrive before the room has arrived.
// The room passed to setRoom() provides walkToDoor(key, ms) -> Promise<boolean>, stopWalk() and
// restorePose() (back to the pose before the leave began).
import { reducedMotion } from '../museum/camera.js';

export const LEAVE_MAX_MS = 1200;
// Walk then fade; the fade alone under reduced motion.
export function leavePlan(reduced) {
  return reduced ? { walkMs: 0, fadeMs: 350 } : { walkMs: 850, fadeMs: 300 };
}

export const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
// Camera pose at walk progress t in [0, 1] (clamped) from `from` to `to`, both { eye, target }.
export function walkPose(from, to, t) {
  const k = easeInOut(Math.min(1, Math.max(0, t)));
  if (k === 0) return { eye: [...from.eye], target: [...from.target] };
  if (k === 1) return { eye: [...to.eye], target: [...to.target] };
  const mix = (a, b) => a.map((v, i) => v + (b[i] - v) * k);
  return { eye: mix(from.eye, to.eye), target: mix(from.target, to.target) };
}

let current = null;
// The doors controller of this page (null before startChapter has created it).
export const currentDoors = () => current;

const plainClick = e => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function createDoors({ root = document, navigate = url => location.assign(url), reduced = reducedMotion } = {}) {
  const stage = root.querySelector('[data-stage]');
  const fade = root.querySelector('[data-door-fade]');
  const links = [...root.querySelectorAll('a[data-door], a[data-door-hotspot]')];
  const hrefOf = key => {
    const a = links.find(l => (l.dataset.door || l.dataset.doorHotspot) === key);
    return a ? a.href : null;
  };
  let room = null, arrived = false, leaving = null;
  const waiting = [], before = [];

  const reset = () => {
    leaving = null;
    if (stage) delete stage.dataset.leaving;
    if (fade) { fade.classList.remove('is-on'); fade.hidden = true; }
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function leave(key, url) {
    if (leaving || !url) return false;
    const token = leaving = { cancelled: false };
    const plan = leavePlan(reduced());
    const walk = plan.walkMs > 0 && room && room.walkToDoor;
    if (stage) stage.dataset.leaving = walk ? 'walk' : 'fade';
    if (walk) await room.walkToDoor(key, plan.walkMs);
    if (token.cancelled) return false;
    if (fade) {
      fade.style.transitionDuration = `${plan.fadeMs}ms`;
      fade.hidden = false;
      fade.getBoundingClientRect(); // start the transition from transparent
      fade.classList.add('is-on');
    }
    await sleep(plan.fadeMs);
    if (token.cancelled) return false;
    for (const fn of before) fn(url);
    navigate(url);
    return true;
  }

  const cancel = () => {
    if (!leaving) return;
    leaving.cancelled = true;
    if (room && room.restorePose) room.restorePose();
    reset();
  };

  for (const a of links) {
    a.addEventListener('click', e => {
      if (!plainClick(e)) return;
      e.preventDefault();
      leave(a.dataset.door || a.dataset.doorHotspot, a.href);
    });
  }
  // Esc cancels a leave, unless something nearer took it (an open source toggletip, src/ui/sources.js).
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.defaultPrevented && leaving) cancel(); });
  // Back / forward from the next page may restore this one from the back-forward cache mid-fade.
  addEventListener('pageshow', e => { if (e.persisted) { if (room && room.restorePose) room.restorePose(); reset(); } });

  const controller = {
    exitTo: (url = hrefOf('exit')) => leave('exit', url),
    onArrive(fn) { if (arrived) fn(); else waiting.push(fn); },
    beforeNavigate(fn) { before.push(fn); },
    cancel,
    setRoom(r) { room = r; },
    arrive() {
      if (arrived) return;
      arrived = true;
      for (const fn of waiting.splice(0)) fn();
    },
  };
  current = controller;
  if (typeof document !== 'undefined' && document.dispatchEvent) document.dispatchEvent(new CustomEvent('voa:doors', { detail: controller }));
  return controller;
}
