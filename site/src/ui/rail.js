// Thumbnail rail (real-scan museum spec, Hotspots): one numbered thumbnail button per exhibit along
// the bottom of the stage, the keyboard and screen-reader path to the rings in the room. It is linked
// both ways with the rings (src/museum/rings.js): hovering or focusing a thumbnail lights its ring,
// a ring under the pointer lights its thumbnail (hover()), and the line the narration plays lights
// both (setActive). A click, or Enter / Space on the focused button, chooses the exhibit exactly as
// a ring click does (onPick). Buttons stay hidden until their exhibit is revealed, as the rings do.
//
// buttons: Map id -> <button data-rail=id>; rings: the createRings() handle or null (no 3D room);
// onPick(id, button); onHover(id | null): after a hover change from either side (re-render).
export function createRail(buttons, { rings = null, onPick = null, onHover = null } = {}) {
  let hovered = null, active = [];
  const revealed = new Set();
  const hover = id => {
    const next = buttons.has(id) ? id : null;
    if (next === hovered) return;
    hovered = next;
    for (const [k, b] of buttons) b.classList.toggle('is-hover', k === hovered);
    if (rings) rings.setHover(hovered);
    if (onHover) onHover(hovered);
  };
  const off = [];
  for (const [id, b] of buttons) {
    const on = (ev, fn) => { b.addEventListener(ev, fn); off.push(() => b.removeEventListener(ev, fn)); };
    on('click', () => { if (onPick) onPick(id, b); });
    on('pointerenter', () => hover(id));
    on('focus', () => hover(id));
    on('pointerleave', () => { if (hovered === id) hover(null); });
    on('blur', () => { if (hovered === id) hover(null); });
  }
  return {
    buttons,
    hover,
    hovered: () => hovered,
    // The rings join once the 3D room is running: bring them up to the rail's state.
    attach(r) {
      rings = r;
      if (!rings) return;
      rings.reveal([...revealed]);
      rings.setActive(active);
      rings.setHover(hovered);
    },
    setActive(ids) {
      const set = new Set(ids || []);
      active = [...set];
      for (const [k, b] of buttons) {
        const on = set.has(k);
        b.classList.toggle('is-active', on);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      }
      if (rings) rings.setActive([...set]);
    },
    // Show the thumbnails of revealed exhibits (cumulative); the rings follow with their stagger.
    reveal(ids) {
      const list = [...ids].filter(id => buttons.has(id));
      for (const id of list) { buttons.get(id).hidden = false; revealed.add(id); }
      if (rings) rings.reveal(list);
    },
    dispose() { off.forEach(f => f()); },
  };
}
