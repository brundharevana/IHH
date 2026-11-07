# Astra prompts: 112 Mercer Street, Princeton, the house front and the street

Prompts for an agent that drives Blender directly. Reference build:
`assets-src/einstein-mercer-street-front/`.

---

## Room prompt

You are building an exterior museum "room": the front of Albert Einstein's house at 112 Mercer
Street, Princeton, New Jersey, and the street before it, as photographs of the house show it. It
belongs to the tour chapter on his death and legacy (112 Mercer Street was his home until his death
in 1955; the house is a National Historic Landmark and unaltered since he lived there). Its front
door is the doorway into the existing study room (the study inside this house). The result is a
glTF for a web museum (react-three-fiber). Work in Blender with Python, headless, reproducible.

### Sources

- Basis (may supply textures, credit required): Alan Richards, "Albert Einstein's house",
  undated, Shelby White and Leon Levy Archives Center, Institute for Advanced Study, IAS E 42,
  CC BY 4.0, 3000 x 2400. Frontal view from across the street in winter.
- Reference only (no pixels): IAS EB 081 colour view from the left (InC-RUU); NPS NHL
  photograph 1975 from the right (rights unknown); IAS choir photograph at the porch (CC BY 4.0).

### Integrity rule (hard requirement)

1. Model only what the photographs show. No people, cars, wires, snow, signs or lamps.
2. Do not say Einstein stood anywhere in particular. Label: "Recreation based on photographs:
   112 Mercer Street, Princeton, New Jersey, the house front and street. Basis: Alan Richards,
   "Albert Einstein's house" (undated, winter), Shelby White and Leon Levy Archives Center,
   Institute for Advanced Study, IAS E 42 (CC BY 4.0); an undated colour view and a 1975 National
   Park Service photograph used as reference. The photographs show the house after Einstein's
   lifetime; it was his home until his death in 1955. Snow, wires, cars and people are not shown."
3. Unseen surfaces (the house's back, the far side of the street) are plain.

### Layout (metres; x along the street, y into the lot, front wall y = 0, z up)

- Main block: two storeys, side-gabled, 7.6 wide, 9 deep, white clapboard on a brick
  foundation (first floor at 0.85); frieze 7.0-7.4 with dentils, cornice to 7.62, roof at 30 deg
  to a ridge at 10.2; chimney on the front slope near the left gable (top 10.6, two pots).
- Front: second floor three 6/6 windows (x -2.11, 0, 2.11; sill 4.88; 0.86 x 1.62) with
  near-black louvred shutters; first floor two tall 6/9 windows (x -2.11, 0.05; sill 1.86)
  with shutters; the front door with transom and surround at x 2.35 (1.42 x 2.93; texture from
  IAS E 42).
- Porch across the front: deck at 1.0 (x -3.25..3.7, 2.3 deep), four round columns at x -2.91,
  -0.83, 1.25, 3.33 to 3.52, entablature to 4.18 with blocks over the columns, low roof, railings
  with square balusters (not in the door bay), lattice skirt, brick piers, five steps at x
  1.7..2.95 with iron handrails.
- Wing at the right, set back: x 3.8..9.2, front y 3.3, two storeys to 6.3, flat roof, two bays
  of shuttered windows, brick chimney near its left.
- Front walk of flagstones from the steps to the sidewalk (x 2.3); clipped hedge across the lawn
  at y -6.5 (1.1 high) with a gap for the walk; rhododendrons along the porch.
- Sidewalk y -8.6..-10, tree lawn, curb at -12.15, street to -24.5; driveway at the left.
- Neighbours: gable-fronted house and a shed at the left; a side-gabled metal-roofed house at the
  right with its gable end toward 112. Spruces left and behind right, two arborvitae before the
  wing, leafless deciduous trees.

### Look, light, bake

Bright overcast with a soft sun from the street side. Bake per group (ground, street, far ground,
house, neighbours) with OpenImageDenoise; windows, railings, columns, trees and hedges to
per-corner colour (export it as glTF COLOR_0). Match the IAS E 42 camera ((0.6, -18.5, 1.6),
level, 29.7 mm on 36 mm, rise 0.081) and iterate at least twice.

### Export

`einstein-mercer-street-front.glb` <= 10 MB, `-mobile.glb` <= 5 MB, unlit baked materials, meshopt,
WebP; nodes `hotspot_1..4`, `artifact_*` (house, front_door with extras leads_to: study,
doorway_study, porch, porch_columns, shutters, wing, chimney, hedge, front_walk,
second_floor_windows), `label_recreation`; `bounds.json`.

---

## Artifact prompts

### artifact_front_door
A panelled front door 1.03 x 2.14 under a rectangular transom with radiating glazing bars, in a
pilastered surround 1.42 wide and 2.93 high; image: IAS E 42 crop. It leads into the study room.

### artifact_porch_columns
Four round porch columns 0.3 thick on square plinths, simple moulded caps, white paint.

### artifact_shutters
Louvred shutters, near-black, one pair to each front window.

### artifact_chimney
A stuccoed chimney stack on the front roof slope with two clay pots.
