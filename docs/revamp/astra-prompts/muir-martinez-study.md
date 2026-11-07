# Astra prompts: John Muir's study, John Muir House, Martinez, Calif. (as photographed October 1960)

Prompts for an agent that drives Blender directly. The room prompt is self-contained; the
artifact prompts below it each build one object to the same rules. Reference build (scripts,
inventory, sources): `assets-src/muir-martinez-study/` in this repo.

---

## Room prompt

You are building a museum recreation of the second-floor study ("scribble den") of the John
Muir House, Martinez, California, as recorded by the Historic American Buildings Survey. The
result is a glTF model for a web museum (react-three-fiber): visitors look around from fixed
viewpoints on phones and walk freely on desktop. Work in Blender with Python, headless where
possible, and keep the build reproducible from scripts.

### Sources (download first; Library of Congress, HABS CA-1890, https://www.loc.gov/item/ca0124/)

- Photograph 13, "JOHN MUIR BEDROOM & STUDY", Jack E. Boucher (HABS), October 1960, master TIFF
  3625 x 5000: https://tile.loc.gov/storage-services/master/pnp/habshaer/ca/ca0100/ca0124/photos/020431pu.tif
- Sheet 13, "Details of John Muir study" (south and west wall elevations, typical arched window,
  plan of the fireplace): .../ca0124/sheet/00013a.tif
- Sheet 3, second floor plan: .../ca0124/sheet/00003a.tif; sheet 8, longitudinal section:
  .../ca0124/sheet/00008a.tif. Drawings measured July 1964 (cover sheet).
- Rights: LoC "No known restrictions on images made by the U.S. Government; images copied from
  other sources may be restricted." Photo 13 and the sheets are HABS/NPS work, not copies. The
  pictures standing on the mantel in photo 13 are other people's works of unknown authorship.

### Integrity rule (hard requirement)

1. Dimensions come from the 1964 drawings; appearance from photo 13. Model only what these show.
   No decor, rugs, furniture, curtains, lamps or pictures that they do not show.
2. The room is dated to the photograph: October 1960. HABS records that the house was bought in
   1955 and "partially repaired and refurnished". Every loose furnishing in photo 13 is a 1960
   furnishing and must not be presented as Muir's own.
3. Walls the photograph does not show (north, east) take the drawings' finish, plain "painted
   plaster", with only the openings the plan draws. The north half of the room stays empty.
4. The mantel pictures are shown as blurred tonal impressions, never sharpened or identified.
5. The photograph is monochrome: colours are interpretive, low-chroma; tones follow the print.
6. Label (on an empty `label_recreation`, extras.text): "Recreation based on Historic American
   Buildings Survey CA-1890 (Library of Congress): photograph 13, 'John Muir bedroom & study',
   Jack E. Boucher, October 1960, and measured drawings, 1964. The room is shown as photographed
   in 1960, after the house was refurnished in 1955; the furnishings are not Muir's own."

### Room and layout (metres; x east, y north, z up; room centred on the origin)

- Room 14'-3" x 17'-8" (4.343 x 5.385), ceiling 11'-0" (3.353). Picture moulding at 2.866, small
  cornice at the ceiling, baseboard 0.278 (all white paint). Below the moulding on the west and
  south walls and the chimney breast: light leaf-sprig wallpaper (tile cut from photo 13 above
  the mantel); above it a plain light frieze. Floor: worn light pine boards running east-west.
- West wall (x = -2.172): chimney breast 1.70 wide, projecting 0.55, centred at y = -0.628;
  window immediately south of it (opening 0.80, centre y = -2.153).
- Typical window (sheet 13): casing 0.10 to the floor, panelled apron below a stool at 0.735,
  lower and upper sashes (meeting rail 1.814), upper sash with a segmental arched head to 2.909,
  casing head with a cap to 3.105. A plain daylight panel behind the glass; no view outside.
  The west window carries a white roller shade pulled down to about 1.47 with a scalloped hem.
- North wall: two such windows, centres x = -0.545 and 0.545 (2'-9" each, 10" pier).
- South wall: four-panel door, leaf 0.76 x 2.276 centred x = -0.582, moulded casing; at the west
  end a washstand alcove: opening x -2.113..-1.326, 0.55 deep, scroll corbels at 2.29 with
  pendant drops, a shouldered arched head rising to 2.472; inside, a white marble top at 0.756
  with a 0.20 splash on three sides, a round basin and two nickel taps; below, a painted cabinet
  with four drawers (east) and a panelled door (west), porcelain knobs.
- East wall: a closed door of the same type to the hall, centred y = -1.993 (from the plan).
- Fireplace on the breast: white marble mantel, surround 1.16 wide projecting 0.12, shelf
  1.65 x 0.22 with rounded front corners at 1.106; round-arched opening 0.62 wide, 0.78 high
  with a raised band, a shell keystone block, raised spandrel panels, pilaster legs with plinths;
  dark slate hearth 1.40 x 0.36; sooted brick firebox with splayed cheeks; iron fire basket.

### 1960 furnishings (mark each as post-1955 in the inventory)

Gilt overmantel mirror 0.84 x 0.72 with a wreath-and-bow crest, hung on a wire from the picture
moulding and tilted forward; on the shelf two dark-framed pictures (south half), two unframed
photographic prints on dark boards and a small frame (north half), a dark book at the south
end, a stack of folders at the north end; a small dark-framed mirror with rounded top corners
leaning on the washstand top; the roller shade.

### Look and lighting

October afternoon: low sun from the west-south-west (azimuth 255 deg, elevation 24 deg) through
the lower sash of the west window, casting a bright patch on the floor; soft skylight from the
three windows; a weak fill from the camera side. Bake in Cycles (64-128 samples, irradiance
denoised with OpenImageDenoise), multiply with albedo, add emission, soft-shoulder tone map,
save display-ready sRGB atlases (2048; props 1024). Make the daylight panels transparent to
shadow rays so the sun passes. Avoid coplanar overlapping faces (Cycles shades them black).
Compare from the photo 13 viewpoint (camera at (1.105, 1.978, 1.307), yaw 248 deg, level, 40 mm on
a 36 mm sensor fitted to the image height, lens shift x 0.384, y -0.044) against the photograph
and iterate at least twice on proportions and tone.

### Export

- `muir-martinez-study.glb` <= 10 MB, `muir-martinez-study-mobile.glb` <= 5 MB; unlit materials,
  meshopt geometry, WebP textures (mobile <= 1024 px).
- Nodes: `hotspot_1`..`hotspot_4` (eye height 1.6, -Z facing the view): the photo 13 viewpoint,
  in front of the fireplace, at the washstand alcove, facing the north windows;
  `artifact_fireplace`, `artifact_overmantel_mirror`, `artifact_mantel_pictures`,
  `artifact_fire_grate`, `artifact_washstand_alcove`, `artifact_alcove_mirror`,
  `artifact_west_window`, `artifact_west_window_shade`, `artifact_north_windows`,
  `artifact_door_south`; `label_recreation`.
- `bounds.json`: walkable rectangle and the padded fireplace footprint (glTF x, z = -y).

---

## Artifact prompts

Same rules: origin at the base centre, metres, only what photo 13 and the drawings show.

### artifact_fireplace

White marble mantel after sheet 13 and photo 13: surround 1.16 wide, 1.06 high to the shelf,
projecting 0.12; round-arched opening 0.62 x 0.78 (straight jambs to 0.47, semicircular head)
framed by a raised 0.075 band; a keystone block with a fan shell; triangular spandrel panels;
pilaster legs with sunk panels and plinth blocks; shelf 1.65 x 0.22 x 0.045 with rounded front
corners. Sooted brick firebox. The fixture belongs to the house (1882), not to the 1960 set.

### artifact_washstand_alcove

Recess 0.79 wide, 0.55 deep, plaster lined, with scroll corbels and pendant drops at 2.29 and a
shouldered arched head to 2.47; marble top at 0.756 with splash on three sides, round basin
(shown as a rimmed opening), two nickel taps; cabinet below with four small drawers and a
panelled door with porcelain knobs. Source: sheet 13 south and west walls, photo 13.

### artifact_overmantel_mirror (1960 furnishing)

Gilt frame 0.84 x 0.72 with leafy ornament (keep it a textured gilt surface, no invented carving),
corner bosses, a wreath-and-bow crest; flat grey glass; hung on a wire, tilted forward 6 deg.

### artifact_mantel_pictures (1960 furnishings)

Two dark-framed pictures leaning at the south end of the shelf, two unframed prints on dark
boards and a small frame at the north end, a dark book, a stack of folders; faces are blurred
tonal crops of photo 13 (makers unknown), never sharpened or identified.

### artifact_fire_grate (1960 furnishing)

Iron fire basket 0.40 x 0.22 with four horizontal bars and turned corner posts with finials.

### artifact_alcove_mirror (1960 furnishing)

Mirror 0.40 x 0.46 in a dark wooden frame with rounded top corners, leaning against the splash.

### artifact_west_window / artifact_north_windows / artifact_west_window_shade

Sheet 13 "typical window with arched head" as in the room prompt; the shade (1960) is white
fabric on a roller with a scalloped hem, pulled down to about 1.47 m.
