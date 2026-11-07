# Astra prompts: Glacier Point, Yosemite (as photographed 1903)

Reference build: `assets-src/muir-glacier-point-1903/`.

## Room prompt

You are building an outdoor museum "room": the granite ledge at Glacier Point, Yosemite, and the view
across the valley to Yosemite Falls, as in the Underwood & Underwood stereographs of July 1903 (LoC
2010647431, -432, -433) and the 1903 photograph of Theodore Roosevelt and John Muir on the ledge (LoC
93503130), all "No known restrictions on publication.". Muir and Roosevelt were in Yosemite together in
1903. No people are modelled.

Integrity: the far view is the 1903 photograph itself (the left image of 1s02031u) projected from the
1903 camera onto a distant cylinder, with Roosevelt's figure painted out by copying neighbouring cliff
texture (record the painted region); everything outside the photograph's frame is plain sky and haze.
The prints are sepia: colours interpretive. Label: "Recreation based on photographs: Glacier Point,
Yosemite, 1903 -- Underwood & Underwood stereographs of President Roosevelt on the ledge (July 1903) and
the photograph of Theodore Roosevelt and John Muir standing on it (1903), Library of Congress. Muir and
Roosevelt were in Yosemite together in 1903. The far view is the 1903 photograph itself, with
Roosevelt's figure painted out; the people are not modelled."

Layout: camera at (0, 0, 1.5) looking +y, 9 deg down, f about 3000 px on the 2060 px left image. A
granite ledge about 18 x 15 m, a low dome highest near (0.6, 3.2) where the figures stand, rolling off
to the left and breaking off beyond y 5.6; thin snow patches and low brush with dead twigs at the
lower left; a dead branch lying across the rock; loose stones. The view cylinder 120 m away covers the
photograph's frame; a pale sky dome and a haze band all round.

Bake the ledge (atlas) with soft high sun and sky; the view as emission (so it keeps the photograph's
tones); brush as per-corner colour (COLOR_0). Compare with the left image twice. Export
`muir-glacier-point-1903.glb` / `-mobile`, hotspot_1..4, artifact_granite_ledge, artifact_view_1903,
label_recreation, bounds.json.
