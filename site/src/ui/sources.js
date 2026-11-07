// Fact chips: each is a <button aria-expanded> that toggles its source details inside a
// role="status" region. Click or keyboard only; nothing depends on hover.
// Esc closes the innermost open thing first: a document-level capture listener (installed once, with
// the first chips) closes the toggletip that holds focus and marks the key handled (preventDefault), so
// the story, an exhibit panel or a door leave, which all skip a handled Esc, leave it alone.
export function initToggletips(root) {
  const doc = root && root.ownerDocument ? root.ownerDocument : (typeof document !== 'undefined' ? document : null);
  if (doc && !doc.voaTipEsc) {
    doc.voaTipEsc = true;
    doc.addEventListener('keydown', e => onTipEscape(e, doc.activeElement), true);
  }
  for (const btn of root.querySelectorAll('button[data-chip]')) {
    if (btn.dataset.wired) continue;
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => setTip(btn, btn.getAttribute('aria-expanded') !== 'true'));
  }
}

export function setTip(btn, open) {
  const region = document.getElementById(btn.getAttribute('aria-controls'));
  const body = region && region.querySelector('[data-tip-body]');
  if (!body) return;
  btn.setAttribute('aria-expanded', String(open));
  body.hidden = !open;
}

// Esc on an open toggletip (focus in it or on its chip): close it, mark the key handled; true if so.
export function onTipEscape(e, active) {
  if (e.key !== 'Escape' || e.defaultPrevented) return false;
  if (!closeTipFor(active)) return false;
  e.preventDefault();
  return true;
}

// Closes the open toggletip that contains or controls the focused element; true if one closed.
export function closeTipFor(active) {
  const chip = active && active.closest && active.closest('[data-chip-wrap]');
  const btn = chip && chip.querySelector('button[data-chip][aria-expanded="true"]');
  if (!btn) return false;
  setTip(btn, false);
  btn.focus();
  return true;
}
