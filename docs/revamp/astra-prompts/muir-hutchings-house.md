# Astra prompts: Room in the old Hutchings House, Yosemite Valley (as photographed about 1902)

Prompts for an agent that drives Blender directly. Reference build: `assets-src/muir-hutchings-house/`.

---

## Room prompt

You are building a museum recreation of a room of the Hutchings hotel in Yosemite Valley, "built
around an 8 foot cedar tree", as shown in one Underwood & Underwood stereograph of about 1902. It is
the room for John Muir's Yosemite chapter. It is NOT Muir's cabin; one source says Muir ran a sawmill
for James Hutchings in the valley after he settled there in 1869, and no source places him in this
room. The result is a glTF for a web museum (fixed viewpoints on phones, free walking on desktop).
Work in Blender with Python, headless, reproducible.

### Source (public domain under the project's Library of Congress rule)

LoC 90715649, Underwood & Underwood, "Room in the old Hutchings House--first in the valley--built
around an 8 foot cedar tree, Yosemite Valley, Cal.", c1902, "No known restrictions on publication.",
master TIFF https://tile.loc.gov/storage-services/master/pnp/cph/3c00000/3c00000/3c00900/3c00937u.tif.
Context only: Soule's c1870 exteriors of Hutchings' Hotel (LoC 2006679428, 2006678855).

### Integrity rule

1. Model only what the stereograph shows; walls it does not show are plain.
2. No people (an old man in a rocking chair and a woman reading are in the photograph; keep their
   chairs, not them).
3. The photograph is black and white: colours are interpretive and the label says so.
4. Label: "Recreation based on a photograph: 'Room in the old Hutchings House -- first in the valley
   -- built around an 8 foot cedar tree, Yosemite Valley', Underwood & Underwood stereograph, about
   1902 (Library of Congress). A room of the Hutchings hotel as photographed in 1902. One source says
   Muir ran a sawmill for James Hutchings in the valley after he settled there in 1869; this is not
   Muir's cabin, and no source places him in this room. Colours are interpretive: the photograph is
   black and white."

### Layout (metres; camera of the left image at the origin, 1.1 m up, looking +y; f about 1344 px on
the 1635 x 1650 image, horizon 175 px below centre)

- Incense cedar trunk centred at (-0.15, 4.0), 2.44 m across at the floor (the caption's "8 foot"),
  flared and deeply fluted at the foot, rising through the ceiling; very dark bark with pale ridges.
- Around its foot an octagonal grass bed about 0.6 m wide, edged with low pale boards (one flat board
  in front), dry grass about 0.1-0.25 m tall.
- Back wall y 5.6 on the left, papered (small floral print), with a white panelled door and a glazed
  transom at x -2.95..-2.10.
- Ceiling papered with a different small print, sloping: about 4.2 m on the left, falling to 2.2 m
  just right of the trunk, flat beyond.
- Right of the trunk a papered pier (face y 5.0, x 0.75..1.30) and a lower window bay (y 6.3) with a
  dark patterned frieze at 1.95-2.2 and a window with gathered lace curtains (x 1.75..2.95).
- A small table with a white cloth at (1.1, 4.05) with two dark bottles and two pale jars; a spindle-back
  side chair at (1.55, 2.95); a spindle-back rocking chair at (-1.85, 2.85).
- Plank floor, dark.

### Look, bake, export

Soft light from the camera side and the left (the trunk's left flank lit, shadows to the right),
daylight through the window. Bake per group (room, trunk, props) with OIDN-denoised irradiance x
albedo; grass blades and chairs as per-corner colour exported as COLOR_0. Compare with the left image
at least twice. Export `muir-hutchings-house.glb` <= 10 MB, `-mobile.glb` <= 5 MB, `hotspot_1..4`,
`artifact_*` (cedar_trunk, door, lace_curtains, table, rocking_chair), `label_recreation`, `bounds.json`.

---

## Artifact prompts

### artifact_cedar_trunk
A cedar trunk 2.44 m across at the floor, flaring at the foot with shallow buttresses, deeply fluted
vertical bark, 4.5 m tall, cut flat where it meets a ceiling; very dark brown bark with pale ridges.

### artifact_rocking_chair
A late-19th-century wooden rocking chair: spindle back of five turned spindles, top rail, plank seat at
0.43, arm rests, two curved rockers; dark stained wood.
