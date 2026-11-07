# Astra prompts: U.N. Security Council chamber, New York (as photographed 1977-1981)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the artifact
prompts build single objects to the same rules. Reference build: `assets-src/albright-un-security-council/`.

---

## Room prompt

You are building a museum recreation of the U.N. Security Council chamber in New York as it
appears in one colour slide by Bernard Gotfryd, taken between 1977 and 1981. It is the room for the
tour stop on Madeleine Albright's years as U.S. Permanent Representative to the United Nations
(1993-1997). No usable photograph from her years exists, so the room is dated to the slide and the
label says so. The result is a glTF for a web museum (react-three-fiber): fixed viewpoints on
phones, free walking on desktop. Work in Blender with Python, headless, reproducible from scripts.

### Source (download first; public domain under the project's Library of Congress rule)

- LoC LC-GB05-5929, "U.N. Security Council Chamber [United Nations, New York]", Bernard Gotfryd,
  between 1977 and 1981, "No known restrictions on publication", master TIFF 4913 x 3342:
  https://tile.loc.gov/storage-services/master/pnp/gtfy/05900/05929u.tif
  (record https://www.loc.gov/item/2020735470/).

### Integrity rule (hard requirement)

1. Model only what the slide shows; every visible object must be traceable to it. No invented
   decor, flags, plants, screens, cameras or lights.
2. Surfaces the slide does not show (ceiling, south and west walls, the gallery the photographer
   stood in) are plain.
3. No people. Country name plates are blank (the slide shows the members of 1977-81).
4. The mural on the east wall (Per Krohg, 1952) is a work whose rights are not cleared: show it
   only as a heavily blurred tonal impression rectified from the slide (blur about 0.3 m), and its
   part outside the slide's frame as a plain field of the mean tone.
5. Label: "Recreation based on a photograph: U.N. Security Council Chamber, Bernard Gotfryd,
   between 1977 and 1981 (Library of Congress, LC-GB05-5929). Madeleine Albright was U.S.
   Permanent Representative to the United Nations 1993-1997; the chamber is shown as photographed
   about 15 years earlier."

### Layout (metres; x east = towards the mural, y north = towards the interpreters' windows, z up;
origin at the centre of the horseshoe table)

- Room x -12..10, y -12..11, ceiling about 7.6 (not photographed: plain).
- Horseshoe table: a circle of outer radius 4.2, top 0.74 high, 0.85 deep, open to the west over
  +-27 deg; blond wood top and panelled fronts. Inside it a well 0.45 deep with two curved steps at
  the open end, grey-beige carpet. In the well a blond secretariat table 4.3 x 1.05 along the axis
  (x -2.7..1.6) with navy armchairs on both sides.
- 16 places round the horseshoe, 1.25 m apart: navy upholstered armchair with a wooden frame
  outside the table; on the table a dark folder with a white sheet, a gooseneck microphone, a tray
  with a carafe and two glasses, a brown ashtray, two pale discs on the front edge, a blank dark
  name plate at the inner edge.
- Advisers' seats: pairs of swivel shells on one dark pedestal joined by a bright bar with an
  ashtray, grey-blue seats with blue backs, on three arcs 1.35, 2.3 and 3.25 m outside the table
  (the third only on the east side).
- Two rows of red upholstered chairs along the north wall (x -2..8.6) in front of a grey marble
  dado 0.85 high.
- North wall (y 11): very dark brown-violet; two long bands of interpreters' windows (z 3.3-4.2
  and 5.85-6.7, x -12..6.3) with blond wood frames, dark glass and dim booths; a round clock
  (x 4.4, z 5.0, 0.74 across); two doorways with blond frames at x -4.5..-0.9, 2.2 high; at the
  north-east a full-height dark red drape (x 7.9..9.5) and a marble pier at the corner.
- East wall (x 10): grey-veined marble, a marble base 1.0 high and 0.45 deep, and the mural recess
  above it (y -4.5..9.7, z 1.0..7.0).
- Floor: tan-grey carpet.

### Look, lighting, bake

Warm interior light, as on the slide: large soft ceiling sources over the table and the room, a
wash on the mural. Bake in Cycles per material group (floor, walls, tables, mural): irradiance
(direct + indirect) and albedo separately, refill empty texels, denoise the irradiance with
OpenImageDenoise, multiply, tone map with a soft shoulder. Chairs and small table objects (many
parts) bake to a per-corner colour attribute instead. Compare renders from the slide's camera
(about (-3.7, -10.5, 3.5), looking 28 deg east of north and 13 deg down, 30 mm on 36 mm) with the
slide and iterate proportions and tone at least twice.

### Export

`albright-un-security-council.glb` <= 10 MB and `-mobile.glb` <= 5 MB, unlit baked materials,
meshopt geometry, WebP (or KTX2) textures; nodes `hotspot_1..4` (standing viewpoints at 1.6 m,
-Z facing), `artifact_*` (horseshoe_table, secretariat_table, mural, clock, interpreters_windows,
delegate_chairs, advisor_chairs, red_chairs, desk_places), `label_recreation` with the label text;
`bounds.json` with the walkable rectangle and padded obstacles. Log every third-party asset in
`app/CREDITS.md` (CC0 / CC-BY only).

---

## Artifact prompts

Origin at the base centre, metres, same integrity rule.

### artifact_horseshoe_table
A circular horseshoe table, outer radius 4.2, inner 3.35, top 0.74 high, open on one side over
54 deg, blond ash veneer top 0.05 thick, vertical blond panelled fronts outside (to the floor) and
inside (to a well 0.45 below the floor), square end panels. Source: LoC LC-GB05-5929.

### artifact_delegate_chairs
An upholstered armchair: seat 0.55 x 0.5 at 0.45, back to 0.95 leaning slightly, navy
upholstery, a light teak frame with straight legs, arm rests and side rails.

### artifact_advisor_chairs
A pair of swivel shells on one pedestal: dark post with a cross foot, a bright bar 0.95 long with
a small ashtray at its middle, grey-blue seats 0.5 wide at 0.48, blue backs 0.44 high.

### artifact_mural
A flat panel 14.2 x 6.0 set 0.12 into a grey-veined marble wall, with a thin light border; its
image is the slide's view of the mural, rectified and blurred to a tonal impression (no figure or
motif readable).

### artifact_clock
A round wall clock 0.74 across: pale face, brass rim, dark hands, twelve tick marks (no numerals).

### artifact_interpreters_windows
Two long horizontal bands of windows in a dark wall, each about 0.9-1.3 high: dark glass in blond
wood frames with mullions about 2 m apart, a dim booth behind.
