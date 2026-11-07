# Astra prompts: the Kongresshallen, Gothenburg Jubilee Exhibition (11 July 1923)

Reference build: `assets-src/einstein-gothenburg-lecture-hall/`.

## Room prompt

Build the Kongresshallen of the 1923 Gothenburg Jubilee Exhibition as A. W. Karnell's photograph of
11 July 1923 shows it during a lecture (Goteborgs stadsmuseum GhmF:148; the museum's record names
Einstein lecturing on relativity to the Scandinavian Congress of Naturalists). It belongs to the
tour chapter on why the Hall honours him (the 1921 Nobel Prize; the lecture is the Nobel lecture
per a single source). Source: MODELLING REFERENCE ONLY (no pixels); all textures generated.

Layout (x along the hall, stage end x = 0, far end -48; y across towards the photographed long wall
y = 24; z up): eight white transverse ribs (0.7 wide, 0.75 deep) at x -2..-44 on a superellipse
section (apex 17 m), with rosettes; the vault between them white with painted cloud-edged ornament
panels near the top and a clerestory window per bay on the far side; on the far wall tall
chevron-glazed windows in the four bays nearest the stage (z 0.6..10.4), climbing vines either side
of each rib, flower boxes along its foot; tiered white chandeliers with drooping fringes, one per
rib, bottoms at 7.4; a semicircular stage (radius 9, 1.0 high) with a white curved edge and a white
lectern on a low step at its front; rows of wooden folding seats on arcs round the stage with two
radial aisles; at the far end a stepped white platform and a clipped tree in a tub. People are not
modelled; the near wall and stage end wall are plain.

Label: "Recreation based on a photograph: the Kongresshallen of the Gothenburg Jubilee Exhibition, 11
July 1923, Anders Wilhelm Karnell, Goteborgs stadsmuseum GhmF:148 (used as a modelling reference).
The museum's record describes Einstein lecturing on relativity to the Scandinavian Congress of
Naturalists in this hall that day. People are not shown; the walls the photograph does not show
are plain."

Nodes hotspot_1..4, artifact_* (ribs, stage, lectern, carafe, seats, chandelier, tall_windows),
label_recreation; bounds.json.

## Artifact prompts

- artifact_lectern: a white lectern 0.62 x 0.95, 1.12 high, sloped top, on a 0.22 step, with a
  water carafe and a glass.
- artifact_chandelier: a tiered white chandelier 2.35 high, four tiers of drooping leaf fringes,
  hung on a rod from the vault.
