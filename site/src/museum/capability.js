// Mode precedence (spec: Lite by capability probe, reduced-motion preference, or toggle; same content):
//   1. no WebGL2 -> lite   2. ?lite=1 -> lite   3. stored choice ('lite' or '3d') wins over the media query
//   4. prefers-reduced-motion -> lite   5. otherwise 3d
// A reduced-motion visitor who chooses 3D gets the room with camera flights and portrait motion still off.
export function chooseMode({ webgl2, liteParam = false, userPref = null, reducedMotion = false }) {
  if (!webgl2 || liteParam) return 'lite';
  if (userPref === 'lite') return 'lite';
  if (userPref === '3d') return '3d';
  return reducedMotion ? 'lite' : '3d';
}

const KEY = 'voa-mode';

export function readModePref() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function storeModePref(mode) {
  try { localStorage.setItem(KEY, mode); } catch { /* blocked storage: the choice just is not remembered */ }
}

// Links marked data-voa-mode="lite|3d" record the visitor's explicit choice when followed (click, Enter, middle-click).
export function wireModeLinks(root = document) {
  const record = e => {
    const a = e.target.closest && e.target.closest('a[data-voa-mode]');
    if (a) storeModePref(a.dataset.voaMode);
  };
  root.addEventListener('click', record);
  root.addEventListener('auxclick', record);
}

// Touches the DOM; exercised by e2e tests, not in Node.
export function probeWebGL2() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}
