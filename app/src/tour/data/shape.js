// The shape every inductee's tour data follows (one file per inductee, app/src/tour/data/<slug>.js).
//
// tour = { slug, name, steps: [step, ...], storyStops: { <fact id>: { step, focus?, label } } }
// A tour is an ordered list of steps, played in order:
//   map step  { id, type: 'map', title, places: [place, ...], segments: [segment, ...], narration }
//             the route runs place to place (segments[i] joins places[i] and places[i + 1]); the
//             guide narrates while it inks itself (globe-to-map unroll, map/UnrollMap.jsx)
//   room step { id, type: 'room', title, room }   a recreated room (room/RoomStage.jsx)
// place    { id, label, date?, note?, lat, lon, coord, factIds, minor?, side? }
//            label / date / note are verified wording only (date: the fact's year, or left out when
//            the date is unresolved, CONFLICTS.md); coord names the coordinate source
//            (coords.snapshot.json: 'wikidata:Q..' or 'holder:<key>'); minor: a waypoint whose
//            label shows only while the marker is on its way from it (close neighbours would overlap);
//            side: 'left' | 'right' | 'above' | 'below' the dot for its label (default from its place on the route)
// segment  { mode: null | 'ship' | 'train' | 'plane', label?, factIds? }
//            mode only where a verified fact names it; otherwise null, the neutral marker and
//            "Mode of travel pending verification"
// narration { keys: ['<slug>:<chapter>:<cue>', ...], factIds }   clips in shared/guide/voice-manifest.json
// room     { id, title, model, standIn?, guide: { pos, face }, poses: { desktop, phone },
//            fog?: [near, far], labelFallback?, labelText?, narration?, closing?, landscape?,
//            artifacts: [artifact, ...] }
//            model: '/models/<id>/<id>' (+ .glb, -mobile.glb on phones, bounds.json beside it);
//            guide: her preferred spot (where she starts; round 9: she walks to another when the view
//            settles where she would be out of frame, hidden or in front of the focus: room/RoomGuide.jsx);
//            poses: per device { start: { pos, look }, <artifact id>: { pos, look, stand } }: the focus views
//            (each record face-on and unhidden: e2e/camcheck.mjs);
//            landscape: a natural landscape with no built structure (its easels stand on the ground);
//            narration plays on arrival, closing once every artifact has been seen; labelText (chapter
//            tours) replaces the glb's own label where that says more than the verified facts
// artifact { id, nodes: [glb node names], name, clip: narration, ring?: [x, y, z], artifact?, prop?, anchor?, wide? }
//            wide: the stop is a whole building or a landscape, never a record (the guide keeps clear of its middle only)
//            artifact: a record id in data/artifacts.js (media id): after the guide's intro the
//            object opens in the artifact viewer (letter, document, photo, glTF object...), README.md;
//            prop: { src, pos, rotY? } its own glb set in the room; anchor: { pos, size } an invisible box
//            standing for a part of the room that has no node of its own (RoomStage.jsx)

export const narr = (slug, chapter, cues, factIds) => ({
  keys: cues.map((c) => `${slug}:${chapter}:${c}`),
  factIds,
})

export const firstPlace = (tour) => tour.steps.find((s) => s.type === 'map')?.places[0] || null
export const lastPlace = (tour) => {
  const maps = tour.steps.filter((s) => s.type === 'map')
  const m = maps[maps.length - 1]
  return m ? m.places[m.places.length - 1] : null
}
