# Astra prompts: Metro-Goldwyn-Mayer studios street front, Culver City (31 July 1937)

Prompts for an agent that drives Blender directly. Reference build: `assets-src/lamarr-mgm-gate/`.

---

## Room prompt

You are building an exterior museum "room": the street front of the Metro-Goldwyn-Mayer studios
in Culver City, California, with its colonnade and iron gate, as it appears in one news
photograph of 31 July 1937. It belongs to the tour stop on Hedy Lamarr joining MGM in 1937; the
visitor stands in the street in front of the studio. The result is a glTF for a web museum
(react-three-fiber). Work in Blender with Python, headless, reproducible from scripts.

### Source (modelling reference only: no pixels from it in any texture)

The photograph's record (LAM-M-0026) is disputed, so since 2026-10-22 it is used as reference only
for shape, proportions, wording and tone. Banner and plate lettering is re-set in Playfair Display
(SIL OFL 1.1) on generated cloth and plate; nothing is cut or rectified from the photograph (see
`assets-src/lamarr-mgm-gate/SOURCES.md`).

- UCLA Library Special Collections, Los Angeles Daily News Negatives, "Craft workers on strike
  stand outside Metro-Goldwyn-Mayer Studios, Culver City, 1937", July 31, 1937,
  ark:/21198/zz00288p15, 6200 x 5054:
  https://iiif.library.ucla.edu/iiif/2/ark%3A%2F21198%2Fzz00288p15/full/full/0/default.jpg
  Credit: "Los Angeles Daily News Negatives, UCLA Library Special Collections, CC BY 4.0".

### Integrity rule (hard requirement)

1. Model only what the photograph shows. No people, no cars, no invented signs, lamps or
   planting.
2. Do not call it the main gate and do not place Hedy Lamarr here: the caption says only
   "outside Metro-Goldwyn-Mayer Studios". Label: "Recreation based on a photograph:
   Metro-Goldwyn-Mayer studios, Culver City, 31 July 1937, Los Angeles Daily News Negatives, UCLA
   Library Special Collections (CC BY 4.0). People and cars in the photograph are not shown."
3. Unseen surfaces (behind the camera, across the side street, the backs of buildings) are plain.
4. The photograph is monochrome: colours are interpretive (warm white stucco, red-white-blue
   bunting and flag); tones follow the photograph.

### Layout (metres; x along the street front, y into the studio, z up; column centres on y = 0)

- Colonnade: one fluted Corinthian column at the corner building (x -2.73) and eleven
  free-standing ones at x 0, 3.62, then every 3.04 m to 30.98; plinth 0.92 square, shaft 0.64
  tapering to 0.56, capital tops at 6.93. Entablature to 7.62 with dentils, a balustrade on top
  to 8.46 with piers over the columns. Portico ceiling at 6.93, back wall at y 3.0: per bay a
  door or a barred window below, an arched window above; in the fifth bay (between the fifth and
  sixth free-standing columns) a 2.4 m wide ornamental iron gate with an arched top to 5 m.
- Above the portico a set-back upper storey (y 3.5, to 11.5 high, x -2.4..17.5) with a row of
  small windows.
- Corner building at the left (x -10.5..-2.4, front y 0.6, 10.8 high, three storeys): stucco
  with recessed panels, two paired windows on the second floor, five narrow ones on the third,
  two arched barred windows below, a round vent, the "CASTING OFFICE" plate (generated plate,
  lettering re-set after the photograph) and a small notice plate; a mailbox at its right corner.
- Beyond the colonnade a long low pilastered building (5.8 high) with one gabled bay, a hedge,
  two timber utility poles, trees behind.
- Street: asphalt with a double white centre line at y -8.2, studio-side sidewalk and curb
  (y -2.3), a side street at the left with a rounded corner.
- Dressing (the 1937 convention): a banner "WELCOME Metro-Goldwyn-Mayer PICTURES CONVENTION"
  under a leaning pole on each free-standing column but the first, hanging across the street front
  (texture: generated cloth, lettering re-set after the nearest banner); a tall banner from the corner
  building's roof; bunting fans on the frieze, one per bay; a large striped flag hung from a wire
  in front of the corner building (stripes vertical, no canton visible).
- Sky: flat pale grey, as in the photograph.

### Look, light, bake

Hazy Californian daylight: bright overcast sky plus a soft sun from the camera's side. Bake per
group (ground, facade, colonnade, cloth) with OpenImageDenoise; balusters, bars, the gate and
poles to per-corner colour. Match the photograph's camera (about (-18.6, -18.1, 1.77), looking 52
deg from the street-front normal towards the colonnade, 38 mm on 36 mm) and iterate proportions
and tone at least twice.

### Export

`lamarr-mgm-gate.glb` <= 10 MB, `-mobile.glb` <= 5 MB, unlit baked materials, meshopt, WebP;
nodes `hotspot_1..4`, `artifact_*` (colonnade, columns, gate, corner_building,
casting_office_sign, banner, banners, banner_corner, bunting, flag, mailbox), `label_recreation`;
`bounds.json`. Credit the photograph (as reference), the font (OFL) and the CC0 textures in `app/CREDITS.md`.

---

## Artifact prompts

### artifact_columns
A fluted Corinthian column 6.93 high: square plinth 0.92 x 0.32, moulded base, shaft with 20
shallow flutes tapering from 0.64 to 0.56, a capital with a flared bell, two leaf bands and a
square abacus 0.98 across. Cast stone, warm white.

### artifact_gate
An ornamental wrought-iron gate 2.4 wide: vertical bars rising to an arched top 5.0 high,
horizontal rails at 0.5, 2.4-2.6 and 4.2, a band of small rings at 3.4. Dark iron.

### artifact_banner
A cloth banner about 1.4 x 2.9 hanging under a pole that leans out from a column, its face
across the street front; image: generated cloth with the nearest banner's wording re-set in
Playfair Display (the photograph is reference only).

### artifact_casting_office_sign
A small enamel-like plate 0.62 x 0.38 on the corner building; image: a generated plate reading
"CASTING OFFICE", lettering re-set in Playfair Display (the photograph is reference only).

### artifact_mailbox
A 1930s US street mailbox: box 0.46 x 0.42 with a rounded top, four short legs, dark green.
