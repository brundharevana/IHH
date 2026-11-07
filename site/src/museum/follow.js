// The camera follows the narration (owner review 4, 2026-10-14). When the line playing changes and
// names exhibits (or, for a museum note, an area such as the recreated study corner), the camera goes
// to a framed view of them (stationcam.js roomStations focus; a glide, a fade under reduced motion).
// It never fights the visitor: after a drag (or any move the visitor chose) the camera stays put for
// FOLLOW_QUIET_MS, and while the panel or another overlay holds the stage nothing moves. A cue that
// was skipped is not retried; the next cue tries again.
export const FOLLOW_QUIET_MS = 6000;

// What a narration line asks the camera to frame: { ids, area? } or null. `ids`: the exhibits the
// line names (reveal.js lineExhibits, those already revealed); a museum note frames its area.
export function cueTarget(line, ids = []) {
  if (!line) return null;
  // A museum note frames its area (stationcam.js adds the photographs framed with it), whatever
  // exhibits its cited facts also name.
  if (line.kind === 'museum-note' && line.frames) return { ids: [], area: line.frames };
  return ids.length ? { ids: [...ids] } : null;
}

// move(target): starts the camera move. blocked(): something holds the stage (the panel is open).
export function createCueFollow({ move, now = () => performance.now(), quietMs = FOLLOW_QUIET_MS, blocked = () => false } = {}) {
  let lastKey = null, lastInput = -Infinity;
  return {
    // The visitor turned the view or chose a move: hold the camera for quietMs.
    input() { lastInput = now(); },
    // The line playing is `key` (line index plus what it names). Moves at most once per key; true
    // when it moved.
    cue(key, target) {
      if (key === lastKey) return false;
      lastKey = key;
      if (!target || blocked() || now() - lastInput < quietMs) return false;
      move(target);
      return true;
    },
    // Line `index` (narration line `line`, naming `ids`) is playing. Keyed by the line alone: more
    // exhibits revealed during the same line ("Show all exhibits") do not move the camera again.
    line(index, line, ids = []) {
      return this.cue(`line:${index}`, index >= 0 ? cueTarget(line, ids) : null);
    },
  };
}
