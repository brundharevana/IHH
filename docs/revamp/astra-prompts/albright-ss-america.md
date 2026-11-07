# Astra prompts: S.S. America, tourist lounge (as photographed 18 October 1940)

Reference build: `assets-src/albright-ss-america/`.

## Room prompt

You are building a museum recreation of the tourist lounge of the liner S.S. America (United States
Lines) as photographed by Gottscho-Schleisner on 18 October 1940. It is the room for Madeleine
Albright's arrival chapter. One source says she arrived in the United States aboard the SS America in
1948; no source records her class or that she used this room, and the ship was refitted after the war:
say so in the label. glTF for a web museum; Blender with Python, headless, reproducible.

Source: LoC 2018738228, "S.S. America, United States Lines. Tourist lounge, general", service JPEG
https://tile.loc.gov/storage-services/service/pnp/gsc/5a05000/5a05700/5a05791r.jpg (560 x 392,
"No known restrictions on publication."). Companion interiors (cross-check only): LoC 2018737793,
2018737781, 2018737774, 2018746147, 2018746142.

Integrity: model only what the photograph shows; at 560 px keep details simple; walls not shown
plain; no people; black-and-white photograph, colours interpretive. Label: "Recreation based on a
photograph: S.S. America (United States Lines), tourist lounge, Gottscho-Schleisner, 18 October 1940
(Library of Congress). One source says Madeleine Albright arrived in the United States as a young girl
aboard the SS America in 1948; no source records her class or that she used this room, and the ship
was refitted after the war. Colours are interpretive: the photograph is black and white."

Layout (metres; camera at (0, 0, 1.2) looking +y, verticals parallel, about 23.5 mm on 36 mm):
ceiling 2.9 m. Left wall x -4.45 with three drawn, pleated curtains (y 5.4-8.0, 9.4-12.0, 12.8-15.4,
z 0.8-2.4) under pelmets, a light trough along its top, a sconce between windows. A partition at y 8.5
from x 0 to 4.5 carrying a framed needlework panel (x 1.4-4.4, z 0.55-2.25) with a round clock above;
the left part of the room continues to y 16 with a second panel, a console and two table lamps. Light
horizontal panelling; ceiling beams crossing obliquely from (0.3, 2.9) to (2.6, 7.6) and from (-1.6,
3.2) to (3.4, 6.3), dark vent panels. Slim white columns with dark base rings at (-1.7, 2.5), (2.5,
3.65) and the partition's end. Furniture groups: a boxy patterned club armchair and an open-box end
table front left, a three-seat sofa and low square tables, plain armchairs at right, patterned
armchairs under the panel, light wooden-frame side chairs, more groups at the back. Beige carpet.

Bake (walls and props atlases; furniture as per-corner colour exported as COLOR_0), compare with the
photograph twice, export `albright-ss-america.glb` <= 10 MB / `-mobile` <= 5 MB with hotspot_1..4,
artifact_* (tapestry, clock, columns, window_curtains, patterned_armchair, sofa), label_recreation,
bounds.json.

## Artifact prompts

### artifact_patterned_armchair
A 1940 club armchair 0.64 x 0.66 x 0.70: boxy base, square arms 0.25 high, low back, loose seat
cushion, small dark block feet; small geometric-patterned upholstery.

### artifact_tapestry
A framed needlework panel 3.0 x 1.7 in a thin wood frame: rows of square motifs (animals, plants) in
muted reds, browns and creams, shown only as soft as the 560-px photograph allows.
