# Astra prompts: the Rotunda of the National Archives, Washington (as photographed 14 September 2016)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the artifact
prompts build single objects to the same rules. Reference build: `assets-src/albright-archives-rotunda/`.

---

## Room prompt

You are building a museum recreation of the Rotunda of the National Archives in Washington as it
was set up on 14 September 2016 for the naturalization ceremony at which Madeleine Albright spoke.
It is the room for the tour stop "Becoming a citizen". It is NOT her own naturalization (1957), whose
place no source records; the label says so. The result is a glTF for a web museum (react-three-fiber):
fixed viewpoints on phones, free walking on desktop. Work in Blender with Python, headless,
reproducible from scripts.

### Sources (download first; NARA "Unrestricted", read as public domain)

NARA RG 64, file unit "Constitution Day Naturalization Ceremony", 14 Sep 2016, frames
64-CFDA-20160914-01-027, -060, -117 ("LB&B Staff Prepare the Rotunda ..."), -100 and -095
("Madeleine Albright Make Remarks ..."), from
https://catalog.archives.gov/medialz/stillpix/064-cfda/2016/Batch0002/20160914-01/64-CFDA-20160914-01-NNN.jpg
(catalog records NAID 445648685, 445648751, 445648865, 445648831, 445648821). All Canon 5D Mark III;
-060, -027, -117 at 24 mm.

### Integrity rule (hard requirement)

1. Model only what the five frames show; every visible object traceable to a frame. No invented
   decor, plants, screens or signs.
2. What no frame shows (the dome, the far end of the hall, the left side wall, the second mural, the
   Declaration's case at the shrine's centre) is plain.
3. No people. The mural (Barry Faulkner, 1936) appears only as a heavily blurred tonal impression
   rectified from frame 060 (blur about 0.26 m); the second mural is a plain field of the mean tone.
   The lectern's seal is a blurred relief impression.
4. Label: "Recreation based on photographs: the Rotunda of the National Archives, Washington,
   14 September 2016, prepared for the naturalization ceremony at which Madeleine Albright spoke
   (National Archives, 64-CFDA-20160914-01-027, -060, -095, -100, -117). This is not her own
   naturalization (1957); no source records where that took place."

### Layout (metres; origin at the apse centre on the floor, +y towards the shrine bay, z up)

- Fit the camera of frame 060 first (24 mm; f = 3840 px on 5629 px; height 1.6 m): it stands at
  about (-8.65, -0.32), looking along a heading of 80.7 deg (from +y towards +x), 2.6 deg down.
- Apse: a half circle of radius 10.5 m (weakly determined; 10-18 m fit equally), limestone ashlar,
  base course to 2.06 with a moulded top, cornice underside at 9.28, a band at about 9.9, wall to
  10.4, then a plain half dome.
- Mural on the right of the shrine: azimuth 10.4-71 deg, frame from 3.22 to 7.66 m high (11 m of
  arc), light frame and a stone ledge under it. A dark-red-and-teal exhibition ribbon hangs across it
  from top right to lower left. The mirrored mural on the left is plain.
- Shrine bay between the murals: a pedestal course 3.05 m high and 1.05 deep; light stone columns
  (shaft radius 0.52) at azimuth 78.6 and 101.4 on it; green marble columns (radius 0.34) at 83.9 and
  96.1; between them a dark green inscribed tablet (86-94 deg, 3.2-9.0 m) in a stone surround. On the
  pedestal face under the right light column, the carved panel "CONSTITUTION / OF THE / UNITED
  STATES OF AMERICA" (2.7 x 1.0) and in front of it two sloped gilded Constitution cases.
- Right side wall (x = 10.5 from y 0 to -4.06, then set back 0.4): two arched niches (1.0 wide,
  sill 2.1, spring 4.85, centres y -2.15 and -5.6) with surrounds and keystones; an arched opening
  (y -8.95..-12.75, spring 6.74) closed by a gilded bronze gate (vertical bars with spear tips, top
  rail 4.95 with discs); bright plain space beyond.
- Floor: cream marble with grey bands (rings about r 4 and near the cases) and brown roundels about
  2.4 m across (one at about (-4.1, 2.7)).
- Ceremony set: lectern (red-brown wood, top 1.29) on a dark platform at (-1.25, 4.55), two
  gooseneck microphones, a blurred bronze seal on its front; a loudspeaker on a stand at its left;
  three teal chairs behind it; two U.S. flags on gold poles flanking the tablet; dark sloped exhibit
  cases with lit panels along the apse wall under the mural; an audio table at front left; rows of
  white folding chairs (y 2.2 to -8.3, centre aisle).

### Look, lighting, bake

Warm, dim tungsten light as in the frames: a broad soft source high in the dome, washes on the
murals and the shrine bay, a soft fill over the floor; the opening behind the gate glows. Bake in
Cycles per material group (walls, apse, floor, vault, mural, cases): irradiance (direct + indirect)
and albedo separately, refill empty texels, denoise with OpenImageDenoise, multiply, soft-shoulder
tone map; unwrap curved walls with seams at sharp edges (angle-based) so they stay undistorted.
Chairs, gate, microphones, loudspeaker and ribbon bake to a per-corner colour attribute and must be
exported as glTF COLOR_0. Compare renders from the frame-060 camera with the photograph and iterate
at least twice.

### Export

`albright-archives-rotunda.glb` <= 10 MB and `-mobile.glb` <= 5 MB, unlit baked materials, meshopt
geometry, WebP textures; nodes `hotspot_1..4` (1.6 m, -Z facing), `artifact_*` (mural, tablet,
light_column, constitution_inscription, constitution_cases, exhibit_cases, lectern, flag_1/2,
niches, bronze_gate, audience_chairs), `label_recreation` with the label text; `bounds.json`.

---

## Artifact prompts

Origin at the base centre, metres, same integrity rule.

### artifact_lectern
A red-brown wooden lectern 0.62 x 0.46 x 0.95 on a 0.70 x 0.54 plinth, slanted desk top rising from
1.15 at the front to 1.29 at the back, on a dark platform 2.2 x 1.6 x 0.2; a bronze disc 0.58 across
on its front showing only a blurred relief (no legible insignia); two black gooseneck microphones.

### artifact_constitution_cases
Two sloped display cases 1.45 wide, 0.78 deep, front 0.92, back 1.18 high; stone bodies, gilded
carved rims, under glass a pale parchment impression (no readable text).

### artifact_tablet
A dark green stone tablet 1.45 x 5.8 in a light stone surround; the lowest metre carries soft,
unreadable lines of an inscription (as in the shallow-focus frame 027), above it plain.

### artifact_bronze_gate
A gilded bronze grille 3.8 wide: vertical bars 0.16 apart, 5.3 high with spear tips, a top rail at
4.95 and a second rail 0.45 below with discs every third bar.

### artifact_mural
A curved painted panel 11 m long and 4.1 m high on a wall of radius 10.5, in a light frame 0.16
wide, set over a projecting stone ledge; the painting shown only as a tonal impression blurred about
0.26 m (no figure readable).
