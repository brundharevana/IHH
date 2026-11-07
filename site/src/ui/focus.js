// Focus trap decision for Tab inside a dialog. `count` focusable items, `active` is the index
// of the focused one (-1 when focus is not on any of them). Returns the index to focus, or -1
// to let the browser move focus normally.
export function trapIndex(count, active, shift) {
  if (count === 0) return -1;
  if (active === -1) return shift ? count - 1 : 0;
  if (shift && active === 0) return count - 1;
  if (!shift && active === count - 1) return 0;
  return -1;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"]), model-viewer, audio[controls]';

export function focusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter(el => !el.closest('[hidden]') && el.getClientRects().length > 0);
}
