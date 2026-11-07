# B5 · Museum architecture and realistic rendering for the live 3D rooms

Status: research note, 2026-10-09. Feeds the spec for the user decision "Rooms look like a real museum" (DECISIONS.md, 2026-10-09). Recommendations are labeled as such. Confidence per finding: **High** (primary or official source, or measured here), **Med** (credible secondary source or one primary source), **Low** (industry blog, forum, or my inference).

Scope: (1) how real museums are built and fitted out, (2) how to make a three.js WebGL2 scene read as a real museum on phones, (3) free CC0/CC-BY props, (4) a "museum kit" spec that parallel agents can assemble rooms from.

Method: web search, official docs, Context7 for three.js (`/mrdoob/three.js`, current dev docs), Google Developer Knowledge for GPU/web performance, Poly Haven / ambientCG / Sketchfab public APIs queried directly, the Smithsonian guidelines PDF text-extracted and read in full for numbers, and a small texture re-encode measurement in `scratchpad/b5/` (no file over 1.2 MB downloaded; Blender NOT downloaded, see 2.4).

---

## TL;DR

1. What makes a room read as "a museum" is a short, consistent list: generous ceiling height (4-5 m in galleries, 8 m+ in a hall), a calm envelope (smooth painted walls, oak or terrazzo floor, a shadow-gap skirting), objects held apart from the wall by **furniture** (frames with window mounts, vitrines, plinths, reading rails), a **consistent label system** at fixed heights, **dim ambient light with pools of warm accent light** on objects, and an **axial doorway** that lets you see into the next room (enfilade). Copy these; skip period-room reconstruction (that is the Tenement Museum model, which the user ruled out).
2. Biography/history museums rarely use the white cube. They use a muted, darker wall colour per section, partly because paper must be lit at about 50 lux, and a dark wall at low light makes the object pop. Recommendation: one neutral shell colour plus one darker accent colour per chapter.
3. On phones, realism comes mostly from **lighting that looks baked** (soft ambient, contact darkening at corners, soft spot pools), not from heavy materials or post-processing. Use: PBR Neutral tone mapping, PMREM `RoomEnvironment` (zero download) at low intensity, at most 4 live spotlights and 1 shadow map rendered once, fake light pools and corner AO baked into simple textures, KTX2 textures, no transmission glass, no post-processing on mobile.
4. Museum furniture is simple box geometry. **Build vitrines, plinths, benches, rails, track lights and frames procedurally** in the kit (near-zero bytes, exact sizes, consistent). Use CC0 Poly Haven assets only for a few real props (picture frames, a bench, a marble bust, a suitcase), and CC0 textures (Poly Haven / ambientCG) for oak, terrazzo and stone.
5. The kit (section 4) defines 4 room archetypes, 7 exhibit types, a label template, one material palette, one lighting rig and a per-room budget (mobile: ≤ 80 draw calls, ≤ 150k triangles, ≤ 4 live lights, ≤ 2.5 MB room payload).

---

## 1. Museum architecture and exhibition design conventions

### 1.1 Gallery typologies

| Typology | What it is | Origin / exemplar | Use for IHH | Confidence |
|---|---|---|---|---|
| **Enfilade** | A run of rooms with doorways aligned on one axis, so the visitor sees through several rooms at once | Dulwich Picture Gallery (Soane, opened 1817): "simple, top lit enfilade" of five sequential galleries, widely cited as one of the most influential museum designs | Chapter rooms of one inductee in a line: chapter 1 -> 2 -> 3 -> 4, doorways on axis. Gives the "I am in a museum" read instantly and a natural "next room" cue | High (Dulwich official page + Architect magazine) |
| **Top-lit gallery** | Daylight from lanterns/skylights or a diffusing laylight ceiling, no side windows on hanging walls | Dulwich (vertical + sloping lanterns, light without glare) | Gallery ceiling as a softly glowing laylight panel (emissive plane) is the cheapest way to fake a bright, even, museum ambient | High (source) / Med (rendering use) |
| **Rotunda / atrium hall** | Domed or tall central hall that sets the mood and distributes visitors | Altes Museum, Berlin (Schinkel, 1830): 23 m rotunda after the Pantheon, coffered dome, skylight; Ellis Island Registry Room (Beaux-Arts, Guastavino tile vault) | The shared 3D entrance hall: a rotunda with five portrait niches, one per inductee | High |
| **White cube** | Plain white rectangular rooms, ceiling light, no ornament; a 20th-century convention for modern art (MoMA 1930s, Barr) | Tate essay "The white cube and beyond"; O'Doherty 1976 critique | Not the default for a history museum (see 1.4); useful for a neutral "introduction" wall | High |
| **Black box / media room** | Dark, acoustically dead room with a screen or projection | Standard in history museums (e.g. Museum of Jewish Heritage combines archival material with modern media) | One per inductee where a real recording or film exists (e.g. Einstein 1945 VOA audio, Naismith 1939 WOR) | Med |
| **Period room** | Reconstructed living space | Tenement Museum, 97 Orchard St (7 apartments + a shop restored; guided tours only); Einsteinhaus Bern 2nd floor | Excluded by user decision (no reconstructed homes). Mention only as contrast | High |

Sources: Dulwich Picture Gallery, "Our architecture", https://www.dulwichpicturegallery.org.uk/about/our-architecture (n.d., accessed 2026-10-09); Architect magazine, "Lumière Mystérieuse", https://www.architectmagazine.com/technology/lumiere-mysterieuse_o (n.d.); Staatliche Museen zu Berlin, Altes Museum profile, https://www.smb.museum/en/museums-institutions/altes-museum/about-us/profile/ (n.d.); Tate Etc., "The white cube and beyond", issue 21, https://tate.org.uk/tate-etc/issue-21-spring-2011/white-cube-and-beyond (2011); NPS, "Second Floor", https://www.nps.gov/elis/planyourvisit/second-floor.htm (2013-11-14); Tenement Museum fact sheet, NPS, https://www.nps.gov/npnh/learn/news/fact-sheet-loea.htm (n.d.).

### 1.2 Proportions

| Item | Value | Source | Confidence |
|---|---|---|---|
| Gallery ceiling height | 3.4-4.3 m minimum for typical exhibition space; contemporary galleries often 5+ m | Nelson Museum gallery specs PDF (https://nelsonmuseum.ca/wp-content/uploads/2022/11/Gallery-Floorplan-Specs.pdf, 2022) and search summary | Med |
| Rotunda height | Altes Museum rotunda 23 m | SMB profile (above) | High |
| Clear floor between wall and central furniture | 1.2-1.5 m to step back and view | Gallery spec summary (above) | Med |
| Circulation route | ≥ 915 mm (36 in) for one-way; ≥ 1525 mm (60 in) recommended so wheelchair users can stop at cases | Smithsonian Guidelines for Accessible Exhibition Design (SGAED), §circulation | High |
| Clear space at every case side | 760 x 1220 mm | SGAED | High |
| Painting centre height | 57 in / 1.45 m (convention used by galleries and museums) | Fine Art Shippers, "Museum-standard art hanging", https://fineartshippers.com/museum-standard-art-hanging-best-practices-and-guidelines-to-follow/ (n.d.) and others | Med (convention, not a standard) |

Recommendation (Med): galleries 8 m wide x 12 m deep x 4.5 m clear, doorways 2.0 x 3.0 m on axis; hall rotunda 14 m diameter, 10 m to oculus (scaled down from Altes Museum so it fits a phone frustum and keeps the oculus visible from the floor).

### 1.3 Materials

- Walls: smooth painted plaster/gypsum board, matte; stone (limestone) only in halls and at thresholds. Ellis Island: Beaux-Arts, tile vault; Deutsches Museum's 2022 refurbishment used an exhibition-wide architectural concept with barrel-vaulted and cross-vaulted ceilings in acoustic plaster (Lindner Group, https://lindner-group.com/en/about-us/news-events/the-most-modern-german-museum-ever, n.d.). **Med.**
- Floors: oak plank or parquet in galleries, terrazzo or stone in halls (observed convention; no single standard). **Low-Med.**
- Rendering implication (my inference, **Med**): real museum walls are almost featureless. A rough "plaster" texture makes a room look like an old house, not a gallery. Use flat colour plus a very subtle roughness/normal noise, and spend texture budget on the floor, where texture reads.

### 1.4 Wall colour in history and biography museums

- The white cube is a 20th-century modern-art convention (MoMA under Barr, 1930s); colour returned to galleries and the Musée d'Orsay is quoted as saying white is "a terrible backdrop" for pre-20th-century art (ARTnews, "When white is wrong", https://www.artnews.com/art-news/news/when-white-is-wrong-275/, n.d.; MoMA Inside/Out, https://www.moma.org/explore/inside_out/2010/03/11/small-steps-lead-to-bigger-changes-moma-s-shifting-wall-colors/, 2010-03-11). **Med.**
- Dark, saturated walls combined with conservation lighting make objects stand out; exhibition palettes are chosen per period or per subject (Sherwin-Williams, "Does art make the walls?", https://www.sherwin-williams.com/architects-specifiers-designers/education/project-profiles/sw-article-pro-doesartmakewlls, n.d.). **Med.**
- SGAED: when material must stay ≤ 50 lux, "provide the highest contrasting background to make objects stand out in the case". **High.**

Recommendation (Med): shell walls warm grey (not white); each chapter gets one darker accent wall colour (deep blue-grey, deep green, oxblood, graphite) behind its key exhibits. Paper documents on dark walls under a warm spot read as "precious original", which is the museum signal we want.

### 1.5 Display furniture (SGAED numbers unless noted)

| Furniture | Rule | Confidence |
|---|---|---|
| Table/desk case (viewed from above) | Top of case max 915 mm (36 in); shallow cases serve both standing and seated visitors | High |
| Small objects in cases | Centre line ≤ 1015 mm (40 in); seated eye level 1090-1295 mm | High |
| Placement in case | Small items at front, larger behind; labels at front at 45°, never on the back wall of the case | High |
| Label rail (reading rail) | Top of label ≈ 1015 mm; rails/barriers max 915 mm | High |
| Wall-mounted objects | Protrude ≤ 100 mm if between 685 and 2030 mm above floor | High |
| Tall freestanding case | Commonly 1.5-1.8 m high, 0.8-1.2 m wide, 0.5-0.8 m deep | Low (vendor: degreefurniture.com) |

### 1.6 Labels and type

| Item | Value | Source | Confidence |
|---|---|---|---|
| Wall label height | Between 1220 and 1675 mm; centre line 1370 mm (54 in) optimal | SGAED | High |
| Type by viewing distance (x-height / set size, Helvetica) | <75 mm: 4.5 mm / 24 pt; 1 m: 9 mm / 48 pt; 2 m: 19 mm / 100 pt; 3 m: 28 mm / 148 pt | SGAED Fig. 12 (from Parks Canada) | High |
| Overhead signs at 2030 mm | Caps ≥ 75 mm | SGAED | High |
| Leading | ≥ 120% of type size | SGAED | High |
| Alignment | Flush left; never centre more than 3 lines | SGAED | High |
| Surface | Matte, non-glare; consistent location across the exhibition | SGAED | High |
| Light on labels | 100-300 lux, same as surroundings, uniform | SGAED | High |
| Length | Max 75-100 words per label (SGAED). Serrell: title 1-7 words, intro 20-125, object label 75-150 | SGAED; Serrell, *Exhibit Labels: An Interpretive Approach* (1996; summary via St Olaf, https://wp.stolaf.edu/art/?p=7469) | High / Med |

Rendering implication (High, by arithmetic): on a phone, a 9 mm x-height label at 1.5 m virtual distance is a few pixels tall. **In-scene labels are a visual signifier only** (number, title, a few text lines). The readable, accessible text lives in the DOM side panel / bottom sheet, which is already decided (REF-tapestry-parity). Camera stops should frame the object with its label so it reads as "labeled", not to make it legible.

### 1.7 Lighting practice

| Item | Value | Source | Confidence |
|---|---|---|---|
| Paper, textiles, photographs | Max 50 lux (25-50 for works on paper); limited duration | Texas Historical Commission, "Light level recommendations" (https://www.thc.texas.gov/public/upload/publications/Light%20Level%20Recommendations%202013.pdf, 2013); Smithsonian NMAA light duration guidelines (https://asia.si.edu/research/conservation-scientific-research/exhibitions-conservation/light-duration-guidelines, n.d.) | High |
| Oil paintings, less sensitive | Up to ~200 lux | CIBSE/SLL LG8 (2021) summary, https://www.cibse.org/knowledge-research/knowledge-portal/lg8-lighting-for-museums-and-art-galleries | Med |
| Accessible levels | Ambient 50-300 lux; text panels 100-300; objects 100-300 where conservation allows; pathways 100-300 | SGAED Fig. 8 | High |
| At 50 lux, SGAED advises | Even light, no spotlight, low ambient, high-contrast background | SGAED | High |
| Object : background contrast | EN 16163:2014 groups 1:1, 3:1, 10:1; 3:1 minimum to stand out, 5:1+ dramatic | iconarp.ktun.edu.tr paper citing EN 16163 (https://iconarp.ktun.edu.tr/index.php/iconarp/article/view/266/228, n.d.); ERCO "Presenting art with light" (https://www.erco.com/projects/focus/photometrics/presenting-art-with-light-6453/en, n.d.) | Med |
| Track spot beams | Narrow 10-24° for accent, 30-36° for wall washing | Vendor pages (Eglo, Regent) | Low-Med |

Rendering implication (Med): we are not bound by conservation, but we should *look* conservation-correct: a dim ambient (walls at about a third of the object's brightness), warm 3000 K accent pools on documents, slightly brighter even light in the hall. A 3:1 accent ratio is the default; 5:1 for the single "hero" object per room.

### 1.8 Circulation and wayfinding

- SGAED: consistent label locations; floor plan at key points; mid-point exits in large exhibitions; seating with arms and backs. **High.**
- Ellis Island second floor: one great hall in the middle, two themed wings ("Through America's Gate", "Peak Immigration Years") either side, objects such as inspection cards, passports and original benches. **High** (NPS page).
- Museum of Jewish Heritage: chronological, one theme per floor (Jewish Life a Century Ago, The War Against the Jews, Jewish Renewal); hexagonal core building by Roche-Dinkeloo (1997). **High** (Wikipedia + architect page, https://www.rochemodern.com/projects/mjh, n.d.).
- Recommendation: one inductee = one wing off the hall, chapters in chronological enfilade, a room number + chapter title over each doorway, a bench in each gallery, "back to hall" always visible as a doorway.

### 1.9 Exemplary museums and what makes them read as "a museum"

| Museum | What reads as "museum" | Take for IHH | Confidence |
|---|---|---|---|
| **Ellis Island National Museum of Immigration** (NYC) | Monumental Beaux-Arts Registry Room (Guastavino tile vault, arched windows, original benches); themed wings with documents in cases; restored hearing room | The hall: a vaulted, tile/terrazzo, daylit volume with benches. Documents in cases in the wings | High |
| **Smithsonian NMAH, "Many Voices, One Nation"** (2017) | 500-year chronological/thematic journey; ~200 artifacts + ~90 loans, ordinary objects (a trunk, a bowl, a jersey) given dignity by cases and labels | Small personal objects on plinths with a label read as "evidence" | High (SI newsdesk, https://dashboard.si.edu/es/newsdesk/releases/many-voices-one-nation-exhibition-opens-june-28-smithsonian) |
| **Museum of Jewish Heritage** (NYC) | Austere, symbolic architecture; strict chronology; archival material plus media | Strict chronology per inductee; a media room where recordings exist | High |
| **Einstein Museum, Bern Historical Museum** | Biography set against world history; >1,000 m²; began as a 2005 temporary show made permanent | A biography can carry 3-4 galleries if each pairs life events with the world around them | Med (museumspass.com / inexhibit.com; no design detail found) |
| **Deutsches Museum** (Munich, reopened 2022) | One architectural concept across 19-20 exhibitions; vaulted ceilings, acoustic plaster | A single kit across all five inductees is what makes it feel like one institution | Med |
| **Tenement Museum** (NYC) and **Einsteinhaus Bern** | Period rooms; immersive but they read as "a home", not "a gallery" | Counter-example. Do not build homes | High |

---

## 2. Making a three.js scene look like a real museum on phones

three.js current release: **r186 (npm `three@0.186.1`, 2026-09-24)**; verified from the npm registry. Context7 docs are the dev branch. **High.**

### 2.1 Colour pipeline and tone mapping

- Available on WebGLRenderer: `NoToneMapping, Linear, Reinhard, Cineon, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping, CustomToneMapping`; set `renderer.toneMapping` and `renderer.toneMappingExposure`; `outputColorSpace` defaults to `SRGBColorSpace` (Context7, `examples/webgl_tonemapping.html`, `OutputPass.js`). **High.**
- Khronos PBR Neutral exists to make base colours show "without saturation loss, hue skews" under grey lighting; three.js ships it (Khronos news, https://www.khronos.org/news/permalink/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products, 2024). **High.**
- Recommendation (Med): **NeutralToneMapping** in galleries, so archival documents, portraits and wall colours keep their real hue (credibility). AgX is fine for the hall if we want a softer filmic roll-off; ACES shifts hues and oversaturates, which is wrong for archival records.
- If an `EffectComposer` is ever used, tone mapping moves to `OutputPass`. **High.**

### 2.2 Environment light (IBL)

- `new PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture` -> `scene.environment` gives studio-like IBL with zero download (Context7, RoomEnvironment docs; derived from Google model-viewer). `scene.environmentIntensity` (since r163) attenuates it. **High.**
- Poly Haven has real museum HDRIs (CC0): `museum_of_ethnography`, `sculpture_exhibition`, `entrance_hall`, `church_museum`; 1k `.hdr` is 1.6-1.7 MB each, 2k is 6.3-6.8 MB (Poly Haven API, measured 2026-10-09). Load with `HDRLoader` (renamed from RGBELoader). **High.**
- Recommendation (Med): `RoomEnvironment` at `environmentIntensity` 0.25-0.5 in galleries (gives glass, varnish and frames believable reflections without brightening the room); a 1k museum HDRI only in the hall, desktop tier, if the hall needs it.

### 2.3 Direct light, shadows and spot pools

- Lights are physically based: `SpotLight(color, intensity[cd], distance, angle, penumbra, decay=2)`; `spotLight.map` projects a texture (gobo). **High** (Context7).
- Shadow types are `BasicShadowMap | PCFShadowMap | VSMShadowMap`; since r182 PCFSoftShadowMap is deprecated and PCFShadowMap is soft (cgworld r182 note, https://cgworld.jp/flashnews/01-202512-Threejs-r182.html, 2025-12). `shadowMap.autoUpdate=false` + `needsUpdate=true` renders shadows once for a static room. **High.**
- Discover three.js: direct lights are expensive, point-light shadows cost 6 passes, "bake lighting and shadow maps to reduce the number of lights", cap pixel ratio to 2 on phones (https://discoverthreejs.com/tips-and-tricks/, n.d.). **Med-High.**
- Google VR performance guidance: full-frame post-processing "very expensive and should not be used" on mobile; high-res shadow maps expensive, bake them; always compress textures and use mipmaps (Google VR, https://developers.google.com/vr/develop/best-practices/perf-best-practices). **Med** (written for mobile VR, but the same tile-based GPUs).
- Recommendation (Med): per room **≤ 4 live SpotLights** (hero object + up to 3 key exhibits), **1 shadow-caster** (512-1024 map, rendered once), every other "spot pool" is fake: a soft radial gradient texture on an additive plane on the wall/floor or baked into the lightmap. Toggle lights by intensity, never add/remove (avoids shader recompiles).

### 2.4 Baked lighting / AO (how to do it for free)

| Option | How | Cost | Verdict |
|---|---|---|---|
| A. Blender Cycles bake, headless | `bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT','INDIRECT'}, margin=16, ...)` into a lightmap on a second UV; export glTF; in three.js set `lightMap.channel = 1` (lightMap/aoMap UVs come from `texture.channel`, Context7 WebGLPrograms.js) | Blender 4.5 macOS arm64 DMG is **309 MB** (HEAD request) -> over the 20 MB download cap and tight on disk; needs user approval | Best quality (true GI). Only for the hall, if the user approves the install |
| B. In-browser bake at build time | three.js `ProgressiveLightMap` addon (`addObjectsToLightMap`, `update(camera, blendWindow)`), run in the existing headless-browser bake step (S1 already bakes panoramas this way), save PNG -> KTX2 | No install; reuses S1 tooling | Soft shadows and AO-like falloff; no real bounce light. Good enough for box rooms. **Recommended default** |
| C. Analytic fakes, no bake | Corner/skirting darkening via gradient textures; shadow-gap skirting geometry; contact-shadow blob under plinths/benches; laylight ceiling emissive | Near zero | Always do this; it is most of the "museum" look |

Key simplification (Med, my inference): procedural rooms are axis-aligned boxes, so every wall/floor/ceiling plane already has a clean UV; a lightmap UV1 is just "each plane gets a rectangle in a 1024 atlas". No unwrapping needed. `three-gpu-pathtracer` (MIT, gkjohnson) can render reference stills but is not a lightmap baker out of the box (**Med**).

### 2.5 Materials and textures

- CC0 sources: Poly Haven ("use our assets for any purpose... do not need to give credit", https://polyhaven.com/license) and ambientCG (CC0 1.0, https://docs.ambientcg.com/license/). **High.**
- Relevant Poly Haven textures (API, 2026-10-09): `terrazzo_tiles`, `herringbone_parquet`, `rectangular_parquet`, `oak_veneer_01..05`, `wood_floor`, `marble_tiles`, `granite_tile`, `white_plaster_02`, `grey_plaster`, `plaster_grey_04`, `stone_tiles`. ambientCG: `Terrazzo013`, `Terrazzo018`, `WoodFloor040-070`, `Plaster001-007`, `PaintedPlaster017`. **High.**
- Measured (this note): Poly Haven 1k diffuse JPGs are heavy (terrazzo 1,166 KB; parquet 829 KB; plaster 527 KB). Re-encoded to 512 px q75 they are 128 / 81 / 84 KB. A full 1k glTF texture set is ~4 MB. So: **512 px tiling textures, 2-3 maps (base colour, normal, ORM), KTX2**. **High.**
- KTX2: `new KTX2Loader().setTranscoderPath(...).detectSupport(renderer)`; `GLTFLoader.setKTX2Loader`; `gltfpack -cc -tc` or glTF Transform (MIT) produce ETC1S/UASTC + meshopt (Context7 `webgl_loader_gltf_compressed.html`). GPU memory: a 1024² RGBA8 texture with mips ≈ 5.6 MB; as ETC1S->ETC2/BC1 ≈ 0.7 MB; UASTC->ASTC/BC7 ≈ 1.4 MB (arithmetic). Android guidance: ASTC ~8x smaller than uncompressed; always mipmap (developer.android.com/games/optimize/textures). **High.**
- Neither `basisu`/`toktx` nor Blender is installed locally; `cwebp` is. KTX2 encoding via `npx @gltf-transform/cli` needs the KTX-Software binary (not checked; flag for the build plan). **High** (checked).

### 2.6 Glass vitrines

- `MeshPhysicalMaterial.transmission` triggers an additional render of the scene; cost scales with screen area and scene draw cost; more expensive than alpha blending (three.js forum, https://discourse.threejs.org/t/transmission-effect-pbr-material-performance/59274, 2024). **Med.**
- Recommendation (Med): vitrine glass = `MeshStandardMaterial({ transparent: true, opacity: 0.08-0.12, roughness: 0.05, metalness: 0, depthWrite: false })` lit by the PMREM environment, plus thin metal/oak edge frames and one bright specular edge line. This reads as glass on a phone. Transmission glass only on a desktop "high" tier, if at all.

### 2.7 Post-processing

- Recommendation (Med): **none on mobile**. Use `antialias: true` (MSAA on the default framebuffer), DPR cap 2 (1.5 on low tier). Desktop high tier may add SSAO/GTAO only if the bake is skipped; vignette is cheaper in CSS. Bloom is unnecessary (no emissive hot spots in a gallery except the laylight).

### 2.8 Budgets (mobile-first)

- Draw calls: industry rule of thumb "under ~100" for mid-range hardware (blogs, **Low-Med**); geometry/count reduction, merging static meshes and instancing per Android optimisation tips (**High**). Render on demand (camera moving or panel animating), stop the loop under full-screen overlays (already item 34 in REF-tapestry-parity).
- Payload reference: S1 panorama page ~896 KiB in 3D; S1's two unoptimised CC0 props were ~5.3 MB declared (REF-tapestry-parity §C) -> props must be compressed or procedural.

### 2.9 Examples of realistic web galleries

| Example | What to learn | Confidence |
|---|---|---|
| Google Arts & Culture **Pocket Gallery** (Vermeer, 2018; Pocket Gallery Editor) | Seven-room gallery designed with architects; simple architecture, colour-coded rooms, hi-res artwork does the work | Med (TechCrunch, 9to5Google 2018-12-03; Google blog) |
| Poly Haven museum HDRIs (`museum_of_ethnography`, `sculpture_exhibition`) | Real reference for light ratios and wall tones; use as look-dev reference even if not shipped | High |
| three.js `webgl_shadowmap_progressive` (ProgressiveLightMap) | In-browser soft-shadow accumulation for static rooms | High |
| MyGallery3D, Byron Virtual Museum, Chromomatrix (three.js galleries) | Baked lighting + mobile optimisation is the common pattern | Low (marketing pages) |
| Sketchfab "Church Vr Galery", Hallwyl Museum "The Billiards Room" (CC-BY scans) | Scanned rooms look real but are 350k-1M faces: unusable on phones | High (API face counts) |

---

## 3. Free 3D museum furniture and props

Poly Haven models are **CC0**; dimensions from the API are in mm (W x D x H as listed); sizes are the 1k glTF total (measured 2026-10-09).

| Asset | Source / licence | Size (mm) | 1k glTF | Use | Note |
|---|---|---|---|---|---|
| `hanging_picture_frame_01` | Poly Haven, CC0 | 594 x 16 x 841 | 0.40 MB | framed document/photo | swap the picture texture for the archival image |
| `hanging_picture_frame_02` | Poly Haven, CC0 | 752 x 33 x 500 | n/m | landscape frame | |
| `hanging_picture_frame_03` | Poly Haven, CC0 | 385 x 32 x 502 | n/m | small frame | |
| `fancy_picture_frame_01/02` | Poly Haven, CC0 | 603 x 20 x 464 / 661 x 89 x 771 | 0.74 MB (01) | gilded portrait frame for the hall | ornate; hall only |
| `standing_picture_frame_01` | Poly Haven, CC0 | 201 x 100 x 250 | 0.45 MB | small photo in a vitrine | |
| `painted_wooden_bench` | Poly Haven, CC0 | 1165 x 497 x 889 | 1.99 MB | gallery bench | heavy; procedural bench is lighter |
| `marble_bust_01` | Poly Haven, CC0 | 272 x 300 x 515 | 0.90 MB | generic "museum object" on a plinth (hall decoration only, never presented as an inductee artefact) | |
| `vintage_suitcase` | Poly Haven, CC0 | 1608 x 239 x 568 (open set) | 4.29 MB | immigration journey prop in a vitrine, labeled "illustrative" | needs gltfpack |
| `wooden_display_shelves_01` | Poly Haven, CC0 | 1078 x 372 x 1556 | n/m | wall case interior | |
| `book_encyclopedia_set_01`, `mantel_clock_01`, `wall_clock` | Poly Haven, CC0 | 551 x 163 x 237 etc. | n/m | props inside cases | illustrative tier |
| "A bench" (scan) | Sketchfab WirtualneMuzeaMalopolski, **CC0** | 420k faces | n/a | none | too heavy |
| "Museum Showcase - Die Vitrine" | Sketchfab oneironauticus, **CC-BY** (2023-09-14), 724 faces | not stated | n/a | reference only | attribution needed; procedural is simpler |
| "Small Museum Display Case" | Sketchfab charlottekimberly, **CC-BY** (2021-06-21), 82 faces | not stated | n/a | reference only | |
| Museum HDRIs (4 listed in 2.2) | Poly Haven, CC0 | n/a | 1.6-1.7 MB (1k .hdr) | IBL / look-dev | |

Searches for CC0/CC-BY track lights, plinths and stanchions returned nothing usable (Sketchfab API, 2026-10-09). **High** (for the search; absence of evidence is not proof).

Recommendation (High confidence that it is cheaper; Med that it looks as good): **generate vitrines, plinths, reading rails, track + spot heads, benches, stanchions and plain frames procedurally** in the kit from the dimensions in section 4. They are boxes, bevelled boxes and cylinders; a parametric generator gives exact SGAED heights, consistent materials, zero download and trivial lightmap UVs. Use Poly Haven assets only where organic detail matters (gilded frames in the hall, a bust, a suitcase). Licences: CC0 needs no credit; still list every asset in "How this was made" credits.

---

## 4. Recommended "museum kit" spec

Designed so parallel agents assemble rooms from a JSON spec; all numbers in metres, Y-up, floor at y = 0, room origin at the centre of the entry doorway, -Z into the room. Recommendations, confidence **Med** unless stated (they apply sourced conventions from section 1; device performance untested).

### 4.1 Room archetypes

| Id | Archetype | Inner size W x D x H | Envelope | Doorways | Max exhibits |
|---|---|---|---|---|---|
| `hall.rotunda` | Shared entrance hall | Ø 14, 10 to oculus; drum 7 high | Limestone lower band 0-2.4, plaster above, coffered dome or flat laylight ring, terrazzo floor with inlaid ring Ø 6 | 5 portrait niches (one per inductee, 2.4 w x 4.0 h, 0.4 deep, arched) + 1 entry | 5 niches + 1 central object |
| `wing.entrance` | Inductee vestibule (journey map) | 6 x 8 x 4.5 | Shell walls; one accent wall with the journey map as a large printed graphic | entry from hall, axial exit to chapter 1 | title wall + map + portrait + 1 quote |
| `gallery.standard` | Chapter gallery | 8 x 12 x 4.5 (variant `gallery.long` 8 x 16) | Shell walls + 1-2 accent walls, oak floor, laylight ceiling panel 6 x 10 inset 0.3, shadow-gap skirting 0.10 | axial in/out, 2.0 x 3.0 | 6-9 numbered exhibits |
| `media.blackbox` | Recording/film room | 6 x 8 x 4.0 | Walls/ceiling near-black (albedo 0.03), dark carpet, screen 3.2 x 1.8 at 1.2-3.0 | one doorway with light-lock jog | 1 screen + 1 bench + 1 label |

Wing layout: hall -> `wing.entrance` -> chapter galleries 1..N (3-4) in enfilade -> optional `media.blackbox` off the last gallery -> exit doorway back to the hall (ending: quiz or another inductee).

### 4.2 Material palette (one shared file `kit/materials.json`)

| Token | Material | Values |
|---|---|---|
| `wall.shell` | Matte paint | base #CFCAC1 (warm grey), roughness 0.92, no albedo texture, 512 subtle normal noise |
| `wall.accent.<name>` | Matte paint | `slate` #3E4A52, `green` #34463B, `oxblood` #5A2B2B, `graphite` #2E2F31, `ochre` #8A6A3A; roughness 0.9. One per chapter |
| `ceiling` | Matte white | #E9E6E0, roughness 1 |
| `laylight` | Emissive diffuser | emissive #FFF6E8, intensity tuned so floor ≈ 1/3 of hero object brightness |
| `floor.oak` | PBR | Poly Haven `oak_veneer_01` or ambientCG `WoodFloor0xx`, 512 px, repeat 1 per 1.2 m, roughness ~0.55 |
| `floor.terrazzo` | PBR | Poly Haven `terrazzo_tiles` / ambientCG `Terrazzo013`, 512 px, roughness ~0.4 |
| `stone.limestone` | PBR | Poly Haven `stone_tiles` / `granite_tile`, 512 px |
| `furn.oak` | PBR | `oak_veneer_0x`, 256-512 px |
| `furn.lacquer` | Painted MDF | matches wall accent, roughness 0.6 |
| `metal.bronze` | PBR | #6B5A3E, metalness 1, roughness 0.45 (rails, frame edges) |
| `glass.vitrine` | Standard | opacity 0.10, roughness 0.05, depthWrite false |
| `mount.mat` | Off-white board | #EFE9DC roughness 1 (window mount around documents) |
| `label.panel` | Matte print | #F3EFE6 text #1E1E1E (light) or inverse on dark walls; contrast ≥ 70% (SGAED) |

### 4.3 Lighting rig (one shared module `kit/lighting.js`)

- Renderer: WebGL2 `WebGLRenderer({ antialias: true })`, `outputColorSpace = SRGBColorSpace`, `toneMapping = NeutralToneMapping`, exposure 1.0 (galleries), AgX optional for the hall; DPR `min(devicePixelRatio, 2)` (1.5 on low tier).
- IBL: PMREM `RoomEnvironment`, `scene.environmentIntensity` 0.35 (gallery) / 0.6 (hall).
- Ambient: lightmap (`lightMap.channel = 1`, from build-time ProgressiveLightMap bake) or, if absent, `HemisphereLight` at low intensity + analytic corner AO textures.
- Accent: SpotLight colour ≈ 3000 K (#FFD8B0), angle 12-18°, penumbra 0.6, decay 2, mounted on the visible ceiling track 0.4 m below ceiling, 30° from vertical toward the wall (standard museum aiming angle, avoids glare on glazing; Low-Med). Target ratio object : wall = 3:1, hero 5:1.
- Caps: ≤ 4 live spots per room, 1 shadow-caster (PCFShadowMap, 1024 desktop / 512 mobile, rendered once). Extra pools = fake gradient planes. Lights for not-yet-revealed exhibits stay at intensity 0 and fade up on the narration cue (no recompiles).
- Lite tier / reduced motion: no live spots, lightmap + fake pools only.

### 4.4 Exhibit types (`exhibit.type`)

| Type | Geometry (procedural unless noted) | Mounting | Label position |
|---|---|---|---|
| `framed-document` | Frame 30-40 mm oak/black + 60-100 mm window mount + glazing plane (env reflection only) + archival image plane (untouched texture, separate layer) | Centre 1.45 m (or 1.37 m for small items); protrudes ≤ 0.10 m | Right of frame, 0.10 m gap, label centre 1.37 m |
| `vitrine-desk` | Slope-top table case 1.2 x 0.7, deck 0.76 front / 0.86 back, glass top max 0.915 (SGAED), oak or lacquer base | Free-standing, 1.5 m clear on viewing sides | On the front lip at 45° |
| `vitrine-tower` | Plinth 0.6 x 0.6 x 0.9 + glass hood 0.6 high | Object centre ≤ 1.0-1.2 m | Separate rail label in front, top 1.0 m |
| `wall-quote` | Cut-letter text texture on the wall (cap height 0.08-0.12 m) + attribution line + cite id | Band 1.8-2.6 m on an accent wall | Attribution under the quote |
| `portrait-niche` | Recess 0.3-0.4 deep, accent colour inside, living-portrait plane (B4 decision) in a gilded or plain frame, own spot | Portrait centre 1.6 m (hall: 2.2 m, larger) | Plaque below at 1.2 m |
| `model-object` | glTF object (Draco/meshopt + KTX2) on a 0.45 x 0.45 x 1.0 plinth, optional acrylic hood | Object centre ≤ 1.2 m | Rail label in front |
| `intro-panel` | Wall text panel 1.2 x 1.6 (chapter title 1-7 words + intro ≤ 100 words), number and dates | Centre 1.45 m, first wall seen on entry | Is itself the label |

Exhibit numbers: a 0.06 m disc with a number on the label (matches the numbered-object row in the UI). The scene's number is always the same number as the DOM list.

### 4.5 Label template (in-scene signifier; full text in DOM)

```jsonc
{ "id": "ein-c2-03", "number": 3, "type": "framed-document",
  "title": "[document title, placeholder]",                     // 1-7 words
  "line2": "[place, date from verified facts]",                  // place, date
  "credit": "NARA, record id ...", "tier": "documented",          // documented | reconstruction | illustrative
  "factIds": ["..."], "cue": "narration-cue-id" }
```
Rendered on a 0.15 x 0.10 m matte panel (0.30 x 0.20 for intro), flush-left, sans-serif (Montserrat per IHH brand), contrast ≥ 70%, centre 1.37 m. Textures generated at build time to a shared label atlas (one draw call per room for all labels).

### 4.6 Room spec shape (what an agent writes)

```json
{ "room": "ein-c2", "archetype": "gallery.standard", "size": [8,12,4.5],
  "accent": { "wall": "north", "color": "slate" }, "floor": "floor.oak",
  "exits": { "in": "ein-c1", "out": "ein-c3" },
  "exhibits": [ { "id": "ein-c2-03", "type": "framed-document", "wall": "east",
                  "u": 0.35, "size": [0.42,0.55], "spot": true, "hero": false } ],
  "cameraStops": [ { "exhibit": "ein-c2-03", "distance": 1.6, "height": 1.45 } ] }
```
Placement is by wall + normalised position `u` (0..1) so agents never type raw coordinates; the kit enforces heights, clearances (1.5 m in front of cases), max 4 spots, and that every exhibit number exists in the DOM list. A validator (same pattern as S1's schema + negative tests) rejects violations at build.

### 4.7 Per-room performance budget (gate, mobile tier)

| Metric | Budget | Basis |
|---|---|---|
| Draw calls | ≤ 80 (merge static shell; label atlas; instanced frames/rails) | Rule of thumb ~100 (Low-Med) with margin |
| Triangles | ≤ 150k incl. props | Inference; S2 rooms were 9-33k without props |
| Live lights | ≤ 4 spots + IBL; ≤ 1 shadow map (once) | Discover three.js, Google VR guidance |
| Texture GPU memory | ≤ 24 MB (KTX2) | arithmetic in 2.5 |
| Room payload (excl. shared libs ~450 KiB and archival images) | ≤ 2.5 MB; lightmap atlas ≤ 400 KB | S1 measurements, 2.5 measurement |
| Archival images | Separate, lazy, 1-2k WebP, never baked into the scene | Decided (SYNTHESIS / REF parity) |
| Frame time | 30 fps floor on the test phones during camera flights; render on demand at rest | Untested -> vertical-slice device test |
| Post-processing | none (mobile) | Google VR guidance |

---

## 5. Open questions and risks

1. **Blender bake** needs a 309 MB download and user approval (disk and the 20 MB cap). Default plan works without it (ProgressiveLightMap + analytic fakes). Ask the user only if the hall looks flat.
2. **KTX2 encoder** (KTX-Software `ktx`/`toktx` or `basisu`) is not installed; glTF Transform needs it for ETC1S/UASTC. Check binary size before installing; WebP-in-glTF (`cwebp` present) is the fallback (smaller download, but uncompressed in GPU memory).
3. **No device test yet** for live rooms on iOS Safari / Chromebook (already flagged in REF-tapestry-parity §C). The budgets in 4.7 are a starting point, not measured.
4. Wall-colour choice per chapter is a curatorial call; propose swatches to the user in the vertical slice.
5. Einstein Museum Bern design details were not found online (Med gap); none of the claims above depend on it.

## 6. Sources (title, URL, date)

- Smithsonian Accessibility Program, *Smithsonian Guidelines for Accessible Exhibition Design*, https://www.sifacilities.si.edu/sites/default/files/Files/Accessibility/accessible-exhibition-design1.pdf (undated PDF, c. 1996; text extracted and read 2026-10-09).
- Texas Historical Commission, *Light Level Recommendations*, https://www.thc.texas.gov/public/upload/publications/Light%20Level%20Recommendations%202013.pdf (2013).
- Smithsonian National Museum of Asian Art, *Light duration guidelines*, https://asia.si.edu/research/conservation-scientific-research/exhibitions-conservation/light-duration-guidelines (n.d.).
- CIBSE/SLL, *LG8 Lighting for museums and art galleries* (2021), https://www.cibse.org/knowledge-research/knowledge-portal/lg8-lighting-for-museums-and-art-galleries.
- ERCO, *Presenting art with light*, https://www.erco.com/projects/focus/photometrics/presenting-art-with-light-6453/en (n.d.).
- ICONARP paper citing EN 16163:2014 contrast groups, https://iconarp.ktun.edu.tr/index.php/iconarp/article/view/266/228 (n.d.).
- Dulwich Picture Gallery, *Our architecture*, https://www.dulwichpicturegallery.org.uk/about/our-architecture (n.d.).
- Staatliche Museen zu Berlin, *Altes Museum profile*, https://www.smb.museum/en/museums-institutions/altes-museum/about-us/profile/ (n.d.).
- Tate Etc., *The white cube and beyond*, https://tate.org.uk/tate-etc/issue-21-spring-2011/white-cube-and-beyond (2011).
- MoMA Inside/Out, *Small steps lead to bigger changes: MoMA's shifting wall colors*, https://www.moma.org/explore/inside_out/2010/03/11/small-steps-lead-to-bigger-changes-moma-s-shifting-wall-colors/ (2010-03-11).
- ARTnews, *When white is wrong*, https://www.artnews.com/art-news/news/when-white-is-wrong-275/ (n.d.).
- Sherwin-Williams, *Does art make the walls?*, https://www.sherwin-williams.com/architects-specifiers-designers/education/project-profiles/sw-article-pro-doesartmakewlls (n.d.).
- Nelson Museum, *Gallery floorplan specs*, https://nelsonmuseum.ca/wp-content/uploads/2022/11/Gallery-Floorplan-Specs.pdf (2022).
- Fine Art Shippers, *Museum-standard art hanging*, https://fineartshippers.com/museum-standard-art-hanging-best-practices-and-guidelines-to-follow/ (n.d.).
- St Olaf (summary of Serrell 1996), *Interpretive writing for the exhibition*, https://wp.stolaf.edu/art/?p=7469 (n.d.).
- NPS, *Ellis Island second floor*, https://www.nps.gov/elis/planyourvisit/second-floor.htm (2013-11-14); NPS, *Ellis Island Reimagined*, https://home.nps.gov/elis/getinvolved/ellis-island-reimagined.htm (n.d.).
- Smithsonian newsdesk, *"Many Voices, One Nation" exhibition opens June 28*, https://dashboard.si.edu/es/newsdesk/releases/many-voices-one-nation-exhibition-opens-june-28-smithsonian (2017).
- Roche-Dinkeloo / Roche Modern, *Museum of Jewish Heritage*, https://www.rochemodern.com/projects/mjh (n.d.); Wikipedia, *Museum of Jewish Heritage*, https://en.wikipedia.org/wiki/Museum_of_Jewish_Heritage (accessed 2026-10-09).
- Museumspass, *Bernisches Historisches Museum / Einstein Museum*, https://museumspass.com/en/museum/bernisches-historisches-museum-einstein-museum (n.d.); Einsteinhaus Bern, https://www.einstein-bern.ch/en/einstein-house (n.d.).
- Lindner Group, *The most modern German museum ever* (Deutsches Museum), https://lindner-group.com/en/about-us/news-events/the-most-modern-german-museum-ever (n.d.); Deutsches Museum, *The road to the future*, https://www.deutsches-museum.de/en/museum/press/press-kit/press-releases/the-road-to-the-future (2022).
- NPS, *Lower East Side Tenement Museum fact sheet*, https://www.nps.gov/npnh/learn/news/fact-sheet-loea.htm (n.d.).
- three.js docs and examples via Context7 `/mrdoob/three.js` (dev branch, queried 2026-10-09): `webgl_tonemapping.html`, `OutputPass.js`, `RoomEnvironment`, `Scene.environmentIntensity`, `WebGLPrograms.js` (texture channel), `KTX2Loader`, `webgl_loader_gltf_compressed.html`, `SpotLight`, `WebGLRenderer.shadowMap`, `ProgressiveLightMap`, `HDRLoader`.
- npm registry, `three` versions, https://registry.npmjs.org/three (0.186.1, 2026-09-24).
- CGWorld, *Three.js r182*, https://cgworld.jp/flashnews/01-202512-Threejs-r182.html (2025-12).
- Khronos, *PBR Neutral tone mapper released*, https://www.khronos.org/news/permalink/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products (2024).
- Discover three.js, *Tips and tricks*, https://discoverthreejs.com/tips-and-tricks/ (n.d.).
- Google VR, *Performance best practices*, https://developers.google.com/vr/develop/best-practices/perf-best-practices (n.d.); Android Developers, *Optimize textures*, https://developer.android.com/games/optimize/textures (n.d.); *Optimization tips*, https://developer.android.com/games/optimize/optimization-tips (n.d.) (via Google Developer Knowledge).
- three.js forum, *Transmission effect PBR material performance*, https://discourse.threejs.org/t/transmission-effect-pbr-material-performance/59274 (2024).
- Blender Python API, `bpy.ops.object.bake`, https://docs.blender.org/api/current/bpy.ops.object.html (current, read 2026-10-09); Blender 4.5.3 macOS arm64 DMG size via HEAD, https://download.blender.org/release/Blender4.5/ (2026-10-09).
- gkjohnson, *three-gpu-pathtracer* (MIT), https://github.com/gkjohnson/three-gpu-pathtracer.
- Poly Haven licence, https://polyhaven.com/license; Poly Haven API, https://api.polyhaven.com/assets (queried 2026-10-09).
- ambientCG licence, https://docs.ambientcg.com/license/; ambientCG API v2 (queried 2026-10-09).
- Sketchfab Data API v3 search, https://api.sketchfab.com/v3/search (queried 2026-10-09).
- glTF Transform (MIT), https://gltf-transform.dev/.
- TechCrunch / 9to5Google, Google Arts & Culture Pocket Gallery, https://9to5google.com/2018/12/03/google-ar-pocket-gallery-vermeer/ (2018-12-03); Google blog, *Pocket Gallery Editor*, https://blog.google/outreach-initiatives/arts-culture/taking-curation-to-the-next-level-with-pocket-gallery-editor/ (n.d.).
