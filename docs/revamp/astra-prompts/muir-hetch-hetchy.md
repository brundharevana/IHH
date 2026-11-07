# Astra prompts: Hetch Hetchy Valley before the dam (as photographed about 1911)

Reference build: `assets-src/muir-hetch-hetchy/`.

## Room prompt

Build an outdoor museum "room": the meadow on the floor of the Hetch Hetchy Valley before the dam, as
in Matt Ashby Wolfskill's panorama "Hetch - Hetchy Valley, Sierra Nevada Mts., Calif.", c1911 (LoC
2007660474, "No known restrictions on publication."). Muir signed the petition urging Congress to defeat
the Raker Bill, which called for a dam across this valley. Colours interpretive.

Label: "Recreation based on a photograph: Hetch Hetchy Valley, Sierra Nevada, California, before the
dam -- panorama by Matt Ashby Wolfskill, about 1911 (Library of Congress). The far view is the photograph
itself; the meadow is modelled to match it. John Muir signed the petition that urged Congress to defeat
the Raker Bill, which called for a dam across this valley. Colours are interpretive: the photograph is
black and white."

Build: repair the panorama's two plate joins, treat it as cylindrical, 120 deg wide, horizon 197 px
below its top; put the part above 1.5 deg below the horizon on a cylinder 260 m away (emission, so it
keeps its tones). Model the meadow: a ground disc with dry grass texture, about 20 000 grass blades
0.25-0.7 m tall and a few hundred white flowers within 18 m. Behind the visitor (outside the panorama)
plain sky and a hazy band. Export `muir-hetch-hetchy.glb` / `-mobile`, hotspot_1..4,
artifact_view_1911, label_recreation, bounds.json.
