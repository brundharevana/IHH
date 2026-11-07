# Astra prompts: the ceremonial courtroom, U.S. Post Office and Courthouse, Trenton

Reference build: `assets-src/einstein-trenton-courtroom/`.

## Room prompt

Build the ceremonial courtroom (Courtroom 1) of the U.S. Post Office and Courthouse, 402 East State
Street, Trenton, New Jersey (built 1932; now the Clarkson S. Fisher Federal Building and U.S.
Courthouse), as the National Register photograph #26 (2005/2009) and the register form's
description show it. It belongs to the tour chapter on Einstein becoming a citizen (his petition
4009 was in the U.S. District Court in Trenton). It is the courthouse, never "the room where he took
the oath": no source places the 1940 ceremony here.

Sources: NRHP form 12000309 photo #26 and section 7 (MODELLING REFERENCE ONLY, no pixels); Carol
M. Highsmith, Library of Congress 2010719742 (2010, public domain): the building's corridor marble
may be used as a texture.

Layout (x right facing the bench, y towards the bench wall y = 0, z up): room 16 x 20 m, plaster
to 5.3 with a beamed ceiling (beams 0.42 deep) and twelve bronze bowl pendants with glass bells on
four chains; a 7 ft oak wainscot round the room (frieze with paired vents and an escutcheon, a 4 ft
5 in inset panel, a square dado panel, a bottom rail; module 0.75 m). On the bench wall: a white
marble panel in an oak frame with a cornice (frame 3.3 x 3.75, from 0.4), brass filigree borders,
a bronze eagle above; two tall windows at x +-4.6 with dark drapes tied back and valances. A dais
(0.45) with the judge's bench five panels wide and 1.52 high between panelled frame walls with
pilasters and two bronze lamps with hexagonal alabaster shades; the witness box at the judge's left
(two panels, 1.25 high); the clerk's desk in front (three panels, about 2 ft lower). Dark carpet.

Label: "Recreation of the ceremonial courtroom (Courtroom 1) of the U.S. Post Office and Courthouse,
402 East State Street, Trenton, New Jersey (built 1932; now the Clarkson S. Fisher Federal Building
and U.S. Courthouse), the courthouse of the U.S. District Court in Trenton. Modelled from the
National Register photograph of the room (2005 or 2009, reference only) and the register form's
description; marble from Carol M. Highsmith's 2010 photographs of the building (Library of
Congress, public domain). No source places Einstein's 1940 naturalization in this room."

Light, bake, export as for the other rooms (pendants light the ceiling; daylight at the windows);
nodes hotspot_1..4, artifact_* (marble_panel, eagle, judges_bench, witness_box, clerks_desk, lamp_0/1,
pendant, wainscot, window_left), label_recreation; bounds.json.

## Artifact prompts

- artifact_marble_panel: white marble 2.1 x 2.9 with grey-green veining in a stained oak frame with
  a cornice, brass filigree borders either side and across the top.
- artifact_eagle: a cast bronze eagle with spread wings, about 1.6 across.
- artifact_judges_bench: a stained oak bench 3.75 wide and 1.52 high, panelled front.
