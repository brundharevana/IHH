// The covered stage (Codex gate round 3): a scanned room's stage is data-covered while its loading
// view or failure card covers it (src/museum/scanstage.js). A covered stage is a held stage: the
// narration pauses and no shortcut starts it (src/ui/player.js), a story countdown stops and an
// arrival waits (src/ui/story.js). These helpers read and watch that one attribute.
export const isCovered = stage => Boolean(stage && stage.hasAttribute && stage.hasAttribute('data-covered'));

// fn(covered) on every change of the covered state. -> stop watching.
export function onCoverChange(stage, fn) {
  if (!stage || typeof MutationObserver !== 'function') return () => {};
  let last = isCovered(stage);
  const mo = new MutationObserver(() => { const now = isCovered(stage); if (now !== last) { last = now; fn(now); } });
  mo.observe(stage, { attributes: true, attributeFilter: ['data-covered'] });
  return () => mo.disconnect();
}

// fn() now if the stage is not covered, else once it is uncovered (never, for a room that failed).
export function whenUncovered(stage, fn) {
  if (!isCovered(stage)) { fn(); return; }
  const off = onCoverChange(stage, covered => { if (!covered) { off(); fn(); } });
}
