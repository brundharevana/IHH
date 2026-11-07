# Astra prompts: Robinson Gymnasium, University of Kansas (1907)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the
artifact prompts each build one object to the same rules. Reference build (scripts,
inventory, sources): `assets-src/naismith-robinson-gym/` in this repo.

---

## Room prompt

You are building a museum recreation of the main hall of Robinson Gymnasium, University of
Kansas, Lawrence, as photographed in 1907, the year it opened (James Naismith taught at KU
from 1898 to 1937 and helped shape the building's design). The result is a glTF model for a
web museum (react-three-fiber): visitors look around from fixed viewpoints on phones and walk
freely on desktop. Work in Blender with Python, headless, reproducible from scripts.

### Sources

- KU University Archives, RG 66/13, "The KU men's basketball team practicing at Robinson
  Gymnasium, 1907" (shown on the Spencer Research Library blog,
  https://blogs.lib.ku.edu/spencer/throwback-thursday-basketball-practice-edition/). No rights
  statement: use it for private reference only. No textures, crops, projections or traced
  pixels from it; never show it to visitors.
- Library of Congress, "Lawrence: today and yesterday" (1913), page 21, photograph 14
  "Robinson Gymnasium", public domain (https://www.loc.gov/item/14022885/). Exterior: a pitched
  roof over the hall, a rhythm of tall windows along the long side.

### Integrity rule (hard requirement)

1. Model only what the 1907 photograph shows. The south end, behind the camera, is a plain
   wall and gable.
2. No court lines, lettering or notices (none are legible). No people, no ball.
3. The hanging rectangular frame is modelled as a frame only; do not guess its purpose.
4. Colour is interpretive; tones follow the photograph (dark trusses and track, light walls,
   bright windows, sun patches on the floor).
5. Label: "Recreation based on photographs: KU University Archives RG 66/13 (1907, reference
   only) and Library of Congress, Lawrence: today and yesterday (1913, exterior)".

### Room and layout (metres; x east = right in the photograph, y north = the end wall it faces, z up)

- Hall 19.8 x 32 (x -9.9..9.9, y -16..16). Polished narrow floor boards. Long walls light
  plaster to the eave at 7.6, darker below a dark wooden chair band at 1.18-1.30, dark
  baseboard. Gable end walls up to the ridge.
- Roof: boarded underside on two slopes from the eave (7.6) to the ridge (13.0). Seven dark
  trusses every 4.5 m (y -13.5..13.5): rafters, a bottom chord rising from the wall heads to
  8.6 at x +-3.4 and 8.9 at the centre, a king post, verticals and diagonals, knee braces into
  the walls; longitudinal struts and purlins between them.
- Running track on the east, west and north sides: dark deck 2.4 deep, top 3.3, 0.4 fascia,
  dark brackets at each truss; railing posts every 2.25 m, top rail 4.35, bottom rail, and
  wire-mesh panels (diamond mesh, about 5 cm) between them. Pale and dark cloth swags hang
  from the top rail, two per bay.
- Windows: on each long wall two tall windows per bay under the track (sill 0.95, head 2.75)
  and one wide window per bay above it (4.75..6.6), dark sashes, bright daylight panes.
- North wall: a dark door at x -5.35, an arched-top door at x +4.7, a small lit hatch at
  x 0.2 (1.95..2.3), slatted wall panels at x -7.5 and +6.8 (1.55..2.4), a vertical pipe at
  x 8.6. Slatted panels also between window bays on the long walls.
- A large dark rectangular frame, 4.6 x 4.1, hung under the third truss from the south
  (y -4.2), bottom at 4.2.
- Pendant lamps on long cords from the trusses (shades at 5.9); small globes under the track.
  Climbing ropes: two near the north-east (x 6.9 and 7.4, y 9.6), one at the west (x -6.6).

### Look and lighting

Late-morning sun from the east, low (about 32 degrees), entering through the upper east
windows and laying bright window-shaped patches across the floor; soft sky light through
every window pane (the panes glow but must not block light); a low fill from the
unphotographed south end. Dark roof, dark under the track. Bake in Cycles per group
(floor, walls, roof, track) at about 64 samples with OpenImageDenoise on the irradiance,
multiplied with the diffuse colour, plus emission, tone-mapped into display-ready sRGB
atlases; bake the railings, drapery, lamps, ropes and panels to per-corner colours; keep the
wire mesh as an alpha-masked texture. Compare renders from the 1907 viewpoint (about
(-0.3, -13.5, 1.7), 31 mm on 36 mm, horizontal, lens shift up 0.125) with the photograph in
greyscale and iterate at least twice; keep those sheets private.

### Export

- `naismith-robinson-gym.glb` <= 10 MB and `naismith-robinson-gym-mobile.glb` <= 5 MB; unlit
  materials, meshopt geometry, WebP or KTX2 textures (mobile <= 1024 px); the wire mesh with
  alphaMode MASK.
- Named nodes: `hotspot_1`..`hotspot_4` (1.6 m, local -Z facing the view): the 1907 viewpoint,
  the centre of the floor facing north, under the east track looking across, the north end
  looking back; `artifact_*`: roof_truss, hanging_frame, track_rail_east / west / north,
  wall_panels, pendant_lamps, climbing_ropes; `label_recreation` with the label in extras.
- `bounds.json`: walkable floor rectangle and padded rope footprints.
- Credit CC0 textures in `app/CREDITS.md`; credit KU University Archives and LoC.

---

## Artifact prompts

Origin at base centre, real-world metres, named as given. Same integrity rule.

### artifact_roof_truss

A dark steel roof truss spanning 19.8 m: rafters from 7.6 at the walls to 13.0 at the ridge;
a bottom chord rising to 8.6 at x +-3.4 and 8.9 at the centre; king post; verticals at
x +-3.4 and +-1.7; diagonals from the bottom chord nodes to the rafters; knee braces into the
walls from 6.2. Members 0.14 wide, 0.12-0.22 deep.

### artifact_hanging_frame

A rectangular frame of dark steel members (0.16 x 0.2), 4.6 wide and 4.1 high, hung
vertically under a truss. Purpose not identified: do not add rings, ropes or apparatus.

### artifact_track_rail_east / west / north

Posts 0.09 square every 2.25 m on the edge of a 2.4 m deep track (deck top 3.3); top rail
0.12 x 0.07 at 4.35; bottom rail at 3.4; diamond wire-mesh panels between; pale and dark
cloth swags hanging from the top rail, two per bay, sagging 0.55 and 0.85.

### artifact_wall_panels

Slatted panels: vertical slats every 0.2 m between top and bottom rails, 0.85 high, 1.6-2.2
wide, light paint, mounted from 1.55 on the walls. Read as radiator covers or vents.

### artifact_pendant_lamps, artifact_climbing_ropes

Small conical shades on long cords from the trusses at 5.9, small globes under the track;
three manila ropes (3.6 cm) hanging from the roof to just above the floor.
