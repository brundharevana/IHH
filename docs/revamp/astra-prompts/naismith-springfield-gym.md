# Astra prompts: the Springfield gymnasium (School for Christian Workers, c. 1887-1894)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the
artifact prompts each build one object to the same rules. Reference build (scripts,
inventory, sources): `assets-src/naismith-springfield-gym/` in this repo.

---

## Room prompt

You are building a museum recreation of the gymnasium of the School for Christian Workers,
Springfield, Massachusetts, where James Naismith's students first played basketball in
December 1891. The result is a glTF model for a web museum (react-three-fiber): visitors
look around from fixed viewpoints on phones and walk freely on desktop. Work in Blender with
Python, headless, and keep the build reproducible from scripts.

### Sources (reference only: model from them, never copy them)

- Springfield College Archives and Special Collections, "School for Christian Workers
  Gymnasium", c. 1887, rg111-01-03-005:
  https://cdm16122.contentdm.oclc.org/digital/collection/p15370coll2/id/695
- Same holder, "School for Christian Workers Gymnasium", c. 1894 (Armory Hill YMCA pamphlet),
  ms523-03-07-04-003: https://cdm16122.contentdm.oclc.org/digital/collection/p15370coll2/id/696

Both are rights-restricted ("personal, non-commercial, and educational use"). Download them
for private reference only. Do not use any pixel of them: no textures, crops, projections or
traced images. Do not show them to visitors.

### Integrity rule (hard requirement)

1. Model only what the two photographs show. The shell may use both; the movable apparatus
   follows the c. 1887 photograph only.
2. Do NOT model peach baskets: no photograph shows them. The tour points at the north and
   south gallery rails instead (the baskets were nailed to the lower rail, one at each end;
   that rail was ten feet high).
3. Unphotographed surfaces (south and west walls) are plain: no windows, doors or fittings.
4. Boards hanging from the gallery stay blank; the dial has no markings.
5. People are not modelled.
6. Colour is interpretive; tones follow the photographs.
7. Label: "Recreation based on photographs c. 1887 and c. 1894, Springfield College Archives
   and Special Collections (reference only); the room where basketball was first played,
   December 1891".

### Room and layout (metres; x east, y north = the wall the c. 1887 camera faces, z up)

- Floor 12.4 x 11 (x -6.2..6.2, y -5.5..5.5): narrow worn boards, dark. Flat boarded ceiling
  at 5.8, light. North and east walls brick; west and south walls plain brick-toned paint.
- Gallery (running track) round all four walls, depth 1.8, deck top 3.0, painted fascia
  2.7..3.0, inner corners rounded (radius 1.4; the north-east corner is seen curving). Turned
  cream balusters every 0.14 between a lower rail whose top is at 3.05 (10 ft) and a darker
  wooden hand rail at 3.95.
- Columns under the gallery edge: round painted shafts on whitewashed conical bases; square
  light posts continue to the ceiling on the north and east sides. One dark iron column
  stands free in the floor at (0.5, -1.0), floor to ceiling, carrying a gas ring (0.64 across)
  on a curved bracket at about 4.3.
- North wall: a multi-pane window at the west end under the gallery (x -5.6..-4.4, sill 0.95,
  head 2.45); above the gallery a large round-arched window (x -5.4..-4.1) and two arched-head
  windows (x -1.5..-0.6 and 1.8..2.7). A dumbbell rack across the west end at 1.2; a frame of
  vertical iron rods (pulley weights) x -4.4..-0.9, 2.45 high; a coil of vertical pipes at its
  foot; a small round dial by the stair head.
- Stair to the gallery against the north wall under the gallery, rising westward from x 3.3
  to x -0.4, 16 risers, closed stringer with a boarded panel, turned balusters, hand rail,
  square newel. The gallery deck is open over the upper flight.
- Four blank grey boards (1.25 x 0.72) hang under the gallery fascia (three on the north, one
  on the east near the corner). Six pale wands hang on the east wall under the gallery.
- Floor apparatus (c. 1887): parallel bars at (-1.7, 2.2), rails 3.3 long at 1.35, on two
  uprights each; a vaulting buck (padded oval body on one iron post, top 1.14) at (-0.8, -1.7);
  five quilted canvas mats; a low dark box by the bars; a low platform at the stair foot.

### Look and lighting

Quiet, evenly lit period interior (the c. 1887 print is a long, even exposure). Daylight
through the photographed north windows; a large soft fill from the unphotographed south at
gallery height (standing in for unseen windows without inventing them); a gentle ceiling
bounce. Bake in Cycles per material group: diffuse irradiance (direct + indirect, no colour)
at about 64 samples, denoised with OpenImageDenoise, times the diffuse colour, plus emission,
tone-mapped with a soft shoulder into display-ready sRGB atlases (floor 2048, walls and
ceiling 2048, gallery and stair 2048, apparatus 1024). Bake the many small parts (balusters,
rods, wands, rack, gas fittings) to a per-corner colour attribute instead. Compare renders
from the c. 1887 viewpoint (about (0.1, -3.55, 2.0), 20 mm on 36 mm, looking north) with the
photograph, side by side in greyscale, and iterate on proportions and light at least twice.
Keep those comparison sheets private.

### Export

- `naismith-springfield-gym.glb` <= 10 MB and `naismith-springfield-gym-mobile.glb` <= 5 MB;
  unlit materials (KHR_materials_unlit), meshopt geometry, WebP (or KTX2) textures, mobile
  textures at most 1024 px.
- Named nodes: `hotspot_1`..`hotspot_4` (standing viewpoints at 1.6 m, local -Z facing the
  view): the c. 1887 viewpoint, mid-floor facing the north gallery rail, by the stair facing
  the bars, the north-west of the floor looking back south; `artifact_*` for the north and
  south gallery rails, staircase rail, free-standing column, gas ring, signboards, weight
  frame, dumbbell rack, wands, parallel bars, vaulting buck, mats; `label_recreation` with the
  label text in extras.
- `bounds.json`: walkable floor rectangle and padded footprints (apparatus, columns, stair).
- Credit every CC0 texture in `app/CREDITS.md`; credit Springfield College as reference.

---

## Artifact prompts

Origin at base centre, real-world metres, named as given. Same integrity rule.

### artifact_gallery_rail_north / artifact_gallery_rail_south

One side of the gallery balustrade: turned cream balusters (about 0.07 thick, vase-turned
middle, plain blocks top and bottom) every 0.14 between a lower rail with its top at 3.05
(10 ft) and a darker wooden hand rail at 3.95; straight middle run, quarter-curves at the
corners (radius 1.4). Source: c. 1887 and c. 1894 photographs.

### artifact_staircase_rail

Turned balusters on each of 16 treads and a sloping wooden hand rail from a square newel
(1.2 high) at the foot to the gallery deck. Source: c. 1887 photograph.

### artifact_column_center and artifact_gas_ring

A dark cast-iron column, 0.18 across, 5.8 high, with a flared foot and a plain capital. A
curved iron bracket leaves it at about 4.9 and carries a horizontal brass gas ring 0.64
across, with four spokes, at about 4.3. Source: c. 1887 photograph (foreground).

### artifact_parallel_bars

Two light wooden rails 3.3 long, 0.46 apart, 1.35 high, each on two square uprights set
0.45 in from the ends, on long floor sleds joined by cross feet. Source: c. 1887 photograph.

### artifact_vaulting_buck

A padded leather body, oval in section, about 0.65 long and 0.3 across, on a single iron post
with a screw collar for height, on cross feet; top 1.14. Source: c. 1887 photograph.

### artifact_mats

Five quilted canvas mats about 8 cm thick, 1.2-2.4 long, edges rounded. Source: c. 1887.

### artifact_weight_frame

A frame of eleven vertical iron rods 2.45 high between a top and a bottom rail, 3.5 long,
against the wall; read as a pulley-weight frame. Source: c. 1887 photograph.

### artifact_dumbbell_rack, artifact_wands, artifact_signboards

A wall rail at 1.2 with a row of small dumbbells; six pale wands about 1.05 long hanging on
the wall; four plain grey boards 1.25 x 0.72 hanging under the gallery fascia, blank.
Source: c. 1887 photograph.
