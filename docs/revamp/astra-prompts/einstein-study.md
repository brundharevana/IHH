# Astra prompts: Einstein's study, Princeton N.J. (1943)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the
artifact prompts below it each build one object to the same rules and can be merged into
the room. Reference build (scripts, inventory, sources): `assets-src/study/` in this repo.

---

## Room prompt

You are building a museum recreation of Albert Einstein's study at Princeton, N.J., as it
appears in two US Navy photographs taken on 24 July 1943. The result is a glTF model for a
web museum (react-three-fiber): visitors look around from fixed viewpoints on phones and
walk freely on desktop. Work in Blender with Python, headless where possible, and keep the
build reproducible from scripts.

### Sources (download these first; both are public domain)

- NARA 80-G-42918, NAID 276538325, 5488 x 4404:
  https://catalog.archives.gov/medialz/stillpix/111-c/Batch0006/80-G-0042918_001.jpg
  Caption: "Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his
  study at Princeton, N.J. ..." (record: https://catalog.archives.gov/id/276538325).
- NARA 80-G-42919, NAID 276538328, 5488 x 4370:
  https://catalog.archives.gov/medialz/stillpix/111-c/Batch0006/80-G-0042919_001.jpg
  (record: https://catalog.archives.gov/id/276538328).

### Integrity rule (hard requirement)

1. Model ONLY objects visible in these two photographs. Anything a visitor can see must be
   traceable to one of them. Do not add decor, plants, lamps, rugs, curtains, doors,
   paintings, radiators, mouldings or props that the photographs do not show.
2. Surfaces the photographs do not show (side and front walls, ceiling, floor beyond the
   rug, hidden supports such as the lamp base, desk legs and globe stand) are plain and
   minimal.
3. Do not model people, clothing, or the papers in people's hands.
4. Do not complete partly legible text: book spines, box lids and the card on the model
   hull stay illegible.
5. The two framed pictures of uncertain authorship (portrait print, calendar artwork) are
   shown as blurred tonal impressions, not reproductions.
6. The photographs are monochrome: colours are interpretive, low-chroma period choices;
   tones (dark/light) must follow the photographs.
7. Do not claim an address. The label is: "Recreation based on photographs: National
   Archives 80-G-42918, 80-G-42919 (24 July 1943)".

### Room and layout (metres; x east = right in the photos, y north = toward the bookcase
wall, z up; the bookcase wall's inner face is y = 2.0)

- Room x -2.6..2.6, y -2.2..2.0, ceiling 2.85. Only the north wall is photographed: light,
  finely mottled wallpaper. Other walls plain warm grey-beige, ceiling plain off-white,
  floor plain dark brown.
- Window in the north wall: opening x 1.09..1.99, sill 0.92, head 2.25; white painted
  casing (0.10 wide), a white sill/stool projecting about 0.17, two sashes with one vertical
  bar each, a soft daylight panel behind the glass (no exterior view).
- Rug: 3.0 x 2.3 centred (-0.35, 0.45): dark red-brown field with pale stepped
  (concentric, stair-cornered) bands, after the corner fragment at the lower left of 42919.
- Bookcase across the north wall, x -1.84..0.44: three open bays of 0.76, depth 0.34,
  height 2.33, very dark stained wood; closed cupboard base up to 1.00 with paired doors;
  shelves at 1.00, 1.27, 1.53, 1.79, 2.05. Shelves packed with books 0.16-0.30 tall:
  mostly dark cloth/leather with pale bands at head and foot, about one in four pale
  paper-bound; some leaning, a few short lying stacks. On the shelves: a small head
  sculpture on a dark block (cupboard top, x -0.08), an open shallow white box (cupboard
  top, x 0.07), a pendulum letter scale with a semicircular brass arc and ball weight
  (cupboard top, x -1.65), a white model hull with a leaning card (top shelf, right bay), a
  dark carved figure (top shelf, middle bay), a dark vase-shaped object (third shelf, right
  end), a book lying across the tops of a row (fourth shelf, right bay).
- Wall section between the bookcase and the window (x 0.44..0.99): a framed certificate
  (image 0.17 x 0.235, thin dark frame) centred at x 0.715, z 1.28 - its image is a
  frontal crop of 42918 (the diploma of the Naturforschende Gesellschaft in Bern naming
  Einstein "Ehrenmitglied"); above it a framed portrait print (image 0.17 x 0.22, dark
  frame, pale mat) at z 1.66 - a heavily blurred crop of 42919.
- On the window sill at its left end: a small standing spiral-top calendar (0.14 x 0.19),
  blurred crop of 42919.
- Desk: 1.25 x 0.72, top 0.76, centred (0.50, 0.62), turned -15 deg about z; dark wood;
  plain legs.
- Two bentwood side chairs (round seat 0.42 at 0.46 high, leg ring, hoop back to about
  0.88): Einstein's at (0.42, 1.22) facing west-southwest; a visitor's at (-0.35, 0.78)
  facing east.
- Floor globe behind the desk at (0.98, 1.68): ball about 0.32 diameter centred at 0.86,
  aged tan mottled surface (no legible geography), dark meridian half-ring, minimal stand.
- Floor lamp at (-0.42, 1.45): turned brass pole, short side arm, white opal glass bowl
  shade 0.20 diameter with its rim at about 1.42, minimal base.
- On the desk: a stack of papers, a handwritten sheet (illegible strokes), an envelope,
  two pale box lids with two pairs of bands and a round emblem, a lidded cylindrical jar
  (0.14 diameter, 0.13 high, metal body, wooden lid with a knob), a straight pipe at the
  front left, a bent pipe at the back, a rounded-square metal ashtray with two matches, a
  small patterned booklet, and about eight books stacked at the right end.

### Look and lighting

Warm, quiet, photographic period look - museum quality, not a greybox. Light: daylight
through the window (neutral, soft), a large soft fill from the unphotographed front of the
room (the 1943 photographs were lit from the camera side), a gentle ceiling bounce, and a
warm 25 W bulb inside the opal bowl. Bake in Cycles: per material group, bake diffuse
irradiance (direct + indirect, no colour) and diffuse colour separately, multiply, add
emission, tone map with a soft shoulder, and save display-ready sRGB atlases (shell 2048,
bookcase 2048, desk and free-standing furniture 2048, wall pictures 1024). For the books
(many small boxes) bake irradiance to a corner colour attribute instead and multiply it
with the spine texture. Bake all groups with the original materials in place, then swap
to the baked materials. Compare renders from the two photo viewpoints against the
photographs (greyscale side by side) and iterate on proportions, tone and light at least
twice.

### Export

- `study.glb` (desktop) <= 10 MB and `study-mobile.glb` (phone) <= 5 MB.
- Unlit materials (KHR_materials_unlit) with the baked atlases; books carry COLOR_0.
- Geometry compressed with EXT_meshopt_compression; textures KTX2 (or WebP when KTX2
  tooling is unavailable); mobile textures at most 1024 px.
- Named nodes: `hotspot_1`..`hotspot_4` (standing viewpoints at eye height 1.6 m, facing
  the area of interest: the two photo viewpoints at about (-0.2, -0.45) and (-0.45, -0.95),
  one by the window, one in front of the bookcase); `artifact_<name>` for every framable
  object (bookcase, desk, chairs, globe, floor_lamp, certificate, portrait_print, calendar,
  head_sculpture, open_box, letter_scale, model_boat, dark_figure, dark_vase, lidded_jar,
  pipe_straight, pipe_bent, ashtray, paper_box_1, paper_box_2, desk_books); an empty
  `label_recreation` carrying the label text above.
- `bounds.json` with the walkable floor rectangle and padded furniture footprints in glTF
  coordinates (x, z = -y).
- Log every third-party asset (licence, URL) in `app/CREDITS.md`; CC0 / CC-BY only.

---

## Artifact prompts

Each prompt builds one object, origin at its base centre, real-world metres, named as
given, ready to drop into the room above. Same integrity rule: only what the photographs
show; no invented detail; illegible text stays illegible.

### artifact_bookcase

Build a three-bay open bookcase, 2.28 wide, 0.34 deep, 2.33 high, in very dark stained
wood (almost black in the photographs, slight grain). Closed cupboard base 1.00 high with
two plain doors per bay and small vertical pulls; shelves 0.028 thick at 1.00, 1.27, 1.53,
1.79 and 2.05; 0.035 outer sides, 0.025 dividers, a 0.035 top with a small overhang, a
recessed plinth. Fill each shelf with books 0.16-0.30 tall, 0.018-0.055 thick, 0.15-0.23
deep, set back unevenly from the shelf edge: mostly dark cloth and leather with pale
bands near head and foot, about one in four pale paper-bound, a few leaning, a few short
lying stacks. Spines carry no legible titles. Source: NARA 80-G-42918 and 80-G-42919.

### artifact_desk

A plain writing table 1.25 x 0.72, top 0.76 high, 0.035 thick, with a 0.1 apron and four
square legs; dark wood, worn satin finish. Only the top and the front edge are visible in
the photographs, so keep the underside minimal. Source: 80-G-42918, 80-G-42919.

### artifact_chair_einstein / artifact_chair_visitor

A bentwood side chair: round seat 0.42 diameter at 0.46 high with a bent rim, cane-tone
seat, two splayed front legs, rear legs continuing up into a hoop back about 0.88 high
with an inner loop, a ring stretcher at 0.20. Dark stained beech. Source: the hoop backs
behind the sitters in 80-G-42918 and 80-G-42919.

### artifact_globe

A floor globe: ball about 0.32 diameter, centre 0.86 high, tilted 23 deg, aged tan mottled
surface with faint graticule lines and no legible geography; a dark half-meridian ring;
the stand is not photographed, so a minimal dark column and foot. Source: behind the desk
at right in 80-G-42918 and 80-G-42919.

### artifact_floor_lamp

A floor lamp: slender turned brass pole, a short curved side arm near the top holding a
socket, and a white opal glass bowl shade 0.20 across with its rim about 1.42 high,
glowing softly; minimal round base (not photographed). Source: between the sitters in
80-G-42918 and 80-G-42919.

### artifact_certificate

A thin dark wooden frame, glazed, image 0.17 x 0.235. The image is a frontal crop of NARA
80-G-42918 (pixels x 4455-5040, y 790-1595 of the 5488 px master), toned to warm grey:
the honorary-membership diploma of the Naturforschende Gesellschaft in Bern made out to
Einstein. Hangs from a short cord, tilted forward about 1.5 deg.

### artifact_portrait_print

A dark wooden frame with a pale mat, image 0.17 x 0.22: a crop of NARA 80-G-42919 (pixels
x 4350-4855, y 335-995) blurred to a tonal impression of a bearded old man in a skullcap
(artist and rights unknown, so do not reproduce the print).

### artifact_calendar

A small standing spiral-top calendar, 0.14 x 0.19, leaning back on the window sill; its
image is a crop of NARA 80-G-42919 (pixels x 5010-5390, y 2270-2790), blurred; the
caption reads "Russian War Relief" in the photograph and must not be sharpened or
completed.

### artifact_head_sculpture

A small head sculpture, about 0.17 high, on a 0.09 dark block; pale plaster or terracotta
tone; simplified form, no invented facial detail. Source: 80-G-42918, on the cupboard top.

### artifact_letter_scale

A pendulum letter scale: dark base 0.13 x 0.08, a brass post, a semicircular brass scale
arc about 0.24 across, a beam and a dark ball weight. Source: 80-G-42919, lower left.

### artifact_model_boat

A white model hull about 0.35 long lying on the top shelf with a small card leaning on it;
the card text is not reproduced. Source: 80-G-42918, top shelf.

### artifact_lidded_jar

A lidded cylindrical jar 0.14 diameter, 0.13 high: reflective metal body, turned wooden
lid set slightly proud, a small knob in a shallow recess. Source: 80-G-42918, 80-G-42919,
front centre of the desk.

### artifact_pipe_straight / artifact_pipe_bent

Two tobacco pipes in dark briar with black stems: a straight one about 0.17 long lying at
the front left of the desk, and a larger bent one by the sitter's hand. Source:
80-G-42918 (both), 80-G-42919 (straight).

### artifact_ashtray

A rounded-square shallow metal tray 0.13 x 0.105 with two spent matches. Source:
80-G-42918, 80-G-42919.

### artifact_paper_box_1 / artifact_paper_box_2

Two flat pale card box lids 0.23 x 0.29 x 0.035 with two pairs of grey bands and a round
emblem; the lettering ("TYPE..." partly visible) stays an illegible grey block. Source:
80-G-42918, 80-G-42919.

### artifact_desk_books

About eight closed books stacked at the right end of the desk, slightly askew, dark and
maroon cloth with one pale volume and one patterned top board. Source: 80-G-42918,
80-G-42919.
