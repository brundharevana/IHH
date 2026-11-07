# Astra prompts: Presbyterian College, Montreal, the dining room (April 1889)

Prompts for an agent that drives Blender directly. Reference build:
`assets-src/naismith-presbyterian-dining-hall/`.

## Room prompt

Build an interior museum "room": one corner of the dining room of the Presbyterian College,
Montreal, as a photograph of April 1889 shows it (students at dinner at a round table). It belongs
to the tour chapter on James Naismith's education in Montreal (he entered the college in 1887). The
result is a glTF for a web museum. Work in Blender with Python, headless, reproducible.

Source (MODELLING REFERENCE ONLY, no pixels): Wm. Notman & Son, "Presbyterian College students at
dinner, Montreal, QC, 1889", McCord Stewart Museum II-89481. All textures are generated.

Integrity: model only what the photograph shows; no people; do not name the diners or place
Naismith at the table. Label: "Recreation based on a photograph: Presbyterian College, Montreal, the
dining room, April 1889 (Wm. Notman & Son, McCord Stewart Museum II-89481, used as a modelling
reference). The photograph shows students at dinner; it does not name them. James Naismith entered
the college in 1887. People are not shown; the walls the photograph does not show are plain."

Layout (x right in the photograph, y towards the back wall at y = 0, z up): back wall to 5.0 with
a dark wainscot to 1.15 (band of roundels, lozenge panels, boarded dado); a shuttered window at x
-2.99..-1.65 (two tiers of louvred folding shutters, z 1.62..3.95); a recess x -1.35..0.53, 0.5 deep,
4.25 high, framed by a broad dark architrave, holding a brass gas bracket with three opal globes
(arms at 2.42) and a panelled door with carved upper panels; a sideboard x 2.05..3.1 with white jugs;
a panelled door with a carved transom panel and an etched-glass upper panel at x 3.35..4.07 (to
3.92). A round table (radius 1.08) with a white cloth at (0.25, -1.6), nine bentwood-like side
chairs pushed back unevenly, a cruet stand, glasses and plates; a second clothed table at front
left. Pale worn pine floor. Room 11 x 11 m; unphotographed walls plain with the wainscot continued.

Light and bake: soft daylight from the front left; bake with OpenImageDenoise; chairs, bracket,
joinery to per-corner colour exported as glTF COLOR_0. Camera of the photograph (0, -7.9, 1.55),
level, 34.6 mm, rise -0.09. Export `naismith-presbyterian-dining-hall.glb` <= 10 MB, `-mobile.glb`
<= 5 MB; nodes hotspot_1..4, artifact_* (dining_table, chair, table_setting, sideboard, gas_bracket,
window_shutters, door_right, door_recess), label_recreation; bounds.json.

## Artifact prompts

- artifact_gas_bracket: a brass wall bracket, two drop pipes from a wall plate, a cross bar 0.9
  long with three arms carrying opal glass globes.
- artifact_chair: a dark side chair with turned front legs, raked back posts, a pressed back panel
  and seat, stretchers.
- artifact_dining_table: a round table 2.16 across under a white cloth to 0.3 above the floor.
