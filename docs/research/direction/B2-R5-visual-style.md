# B2-R5: Visual style and design system options

Route R5, batch 2. Retrieval date for every source below: 2026-10-08 unless a different source date is given. This report maps the option space with evidence. It does not choose. The user will send design references later.

## 0. Scope, method, limits

- Built on `INTERIM-1.md`, `B1-R1`, `B1-R2`, `B1-R3`, `B1-R8` and `02-museum-best-practices.md`. Not repeated: scene-source analysis, hosting, WebGL baseline, accessible hotspot pattern, evidence-tier idea (B1-R2 s1.7). Those are used as givens.
- Sub-routes covered: (a) scene styles, (b) virtual-heritage principles on visual honesty, (c) typography and colour, (d) motion, (e) design-system mechanics, (f) counter-route on credibility.
- Tools used: Google web search and page fetches (including the in-app browser for pages that returned 403), Google Developer Knowledge MCP, Context7, `curl` against public JSON (caniuse data on GitHub, npm registry, google/fonts METADATA files), `pdftotext` on PDFs the fetcher saved. Counts are in the query log (section 6).
- Not done: no render, no device test, no package install, no Blender (disk is critically low). Every statement about the mobile cost of a style is therefore from documentation, forum threads or my own reasoning, never from measurement. Where a claim is my reasoning, it is marked "(inference)".
- Quoting: charter and article texts are paraphrased. One short quote is used in the whole report (Burra Charter, s2).
- A framing note from the B1 pipeline (inference): constructed rooms are baked offline to equirectangular images. For those, a scene style is paid for at build time (render, compression), not on the visitor's phone. Runtime cost only applies to what stays live: artifact viewer, depth-photo 2.5D, camera moves, avatar, overlays and UI. Several style costs below split along that line.

---

## 1. Findings per sub-route

### (a) Scene styles that agents can repeat and that sit next to black-and-white photographs

#### a-0. Common technical facts (three.js, Context7 and docs)

- **Toon material.** `MeshToonMaterial` shades with a `gradientMap`; the docs require `NearestFilter` for both min and max filters, and the map is non-colour data so `colorSpace` must stay `NoColorSpace`. Source: three.js docs `MeshToonMaterial` via Context7 `/mrdoob/three.js` (accessed 2026-10-08).
- **Outlines have three routes in three.js.** `OutlineEffect` (object-based, WebGLRenderer only, intended for toon materials); `OutlinePass` (screen-space pass in `EffectComposer`); and for the experimental `WebGPURenderer`, the TSL `toonOutlinePass`, which only outlines objects using toon materials. Sources: three.js docs `OutlineEffect`, `OutlinePass`, `toonOutlinePass` via Context7 (2026-10-08).
- **Cost model for outlines (forum-level evidence).** A three.js forum summary says the object-based method traverses the scene twice and slows with object count, while the screen-space method depends mostly on render resolution and has resolution and aliasing problems. Source: "OutlinePass with EffectComposer or OutlineEffect" (https://discourse.threejs.org/t/outlinepass-with-effectcomposer-or-outlineeffect/19790, retrieved 2026-10-08; thread date not shown). Low-grade source.
- **Post-processing merge.** The pmndrs `postprocessing` library (Zlib licence, v6.39.5 per npm) merges any set of effects into one compound shader pass and uses a single fullscreen triangle. Source: README and manual via Context7 `/pmndrs/postprocessing` (2026-10-08); npm registry (2026-10-08). The documentation says nothing about mobile; a web-search summariser's line that it is "well suited for mobile" is not in the docs (see Contradictions).
- **Mobile advice is old or indirect.** Google's "Journey through Middle-earth" case study (Nexus 10 era, 2014, so [OLD]) lists: low-poly models, low-res textures, fewer draw calls, simpler materials and lighting, remove post effects and turn off antialiasing, render the canvas at half size and scale up with CSS (https://web.dev/case-studies/hobbit, via Google Developer Knowledge, 2026-10-08). Android's games optimisation page (current) warns that `discard` in a fragment shader disables Early-Z and recommends ASTC compression (up to 8x smaller than uncompressed) and half-float post-processing buffers (https://developer.android.com/games/optimize/optimization-tips, via Google Developer Knowledge). Relevance: mask-based outline shaders that use `discard` (see a-2) fall under the Early-Z warning. Chrome and Safari cap simultaneous WebGL canvases at about 16 (Chrome WebGPU migration page, via Google Developer Knowledge).
- **Lighting-model cost.** three.js docs state `MeshLambertMaterial` uses per-fragment shading and performs better than Phong, Standard and Physical materials. Source: three.js docs via Context7. The 2014 case study's "Lambert is per-vertex" statement is outdated by this.
- **Colour grading in-engine.** `LUTPass` (3D lookup table, `intensity` option) exists in three.js addons; tone mapping options include ACESFilmic, AgX and Neutral, applied through `OutputPass`. Source: three.js docs via Context7.

#### a-1. Options compared

Effort ratings are my judgement for AI coding agents working from one shared kit (inference). "Reads as" is what the literature or precedent suggests the look signals.

| Option | Agent production effort | Mobile cost, live vs baked | Reads as (record vs reconstruction) | Evidence quality |
|---|---|---|---|---|
| Low-poly flat-shaded | Lowest: primitives plus a palette, no UV or PBR work | Live: lowest of the set (Lambert tier). Baked: tiny files likely (inference) | Illustration or model; no claim of material evidence. Risk of reading as "game" (inference) | Indirect |
| Toon / cel with outlines | Medium: gradient map, outline route, per-asset method choice | Live: extra pass or second mesh per object. Baked: zero at runtime; outline seams in equirect are an open risk (inference) | Drawing or print; "interpretation" register | Indirect, one detailed 2026 article |
| White-box / clay / maquette | Low to medium: one matte neutral material, ambient occlusion, soft light | Live: low. Baked: low; no textures, small files (inference) | Strongest explicit "this is a model" signal in the heritage literature | Strong on the principle, thin on web museums |
| Diorama / cut-out layered 2.5D of archival photos | Medium: depth or layer separation per photo, hotspot authoring in image space | Live: a few textured quads, cheap; parallax motion needs a reduced-motion path | Keeps the photograph as record; the depth is the inferred layer | Technique sources thin; vestibular guidance strong |
| Painterly / ink-wash NPR | Highest: tuning, noise, full-screen filters; hardest to keep identical across agents (inference) | Live: full-screen passes; reference example needs WebGPU. Baked: filter runs offline | Interpretation; "art" register; highest wow potential (inference) | One 2026 article, WebGPU-only |
| Duotone / sepia / halftone / dither unification layer | Low as a final pass; works on any of the above | Live: per-pixel ALU, cheap; baked: free. Dithered images compress worse (inference) | Ties 3D to period photographs without touching the photographs | Technique sources fine; heritage precedent thin |

#### a-2. Findings by option

**Low-poly flat-shaded.**
- B1-R2 already established that Kenney (CC0) and Quaternius (CC0) are game-art kits in this style, and that mixing them with scanned PBR assets breaks consistency (B1-R2 s1.2 style caveat; licence rows cited there: https://kenney.nl/support, https://quaternius.com/faq.html, accessed 2026-10-08).
- A museum-education precedent exists for low-polygon models served to phones and tablets over web VR: "Developing 3D graphics software as educational material for museum education course (The case of Hunat social complex)", Erciyes University repository (https://avesis.erciyes.edu.tr/yayin/419390ea-533f-424f-accb-503c459b5328/developing-3d-graphics-software-as-educational-material-formuseum-education-course-the-case-of-hunat-social-complex; year not shown in the result). Low-grade, abstract level only.
- Game and web examples whose look is flat or low-poly (URLs verified reachable 2026-10-08; the style attribution is my knowledge, not sourced in this session): A Short Hike https://www.ashorthike.com/, Monument Valley https://www.monumentvalleygame.com/, Firewatch https://www.firewatchgame.com/. Awwwards entries tagged stylised WebGL storytelling: Prometheus Fuels by Active Theory (https://www.awwwards.com/sites/prometheus-fuels, date not shown on the page I read; described as stylised, colourful, retrofuturistic); Mongols Invasion 3D website (https://www.awwwards.com/inspiration/3d-webgl-website-experience-mongols-invasion-3d-website; the page gave no visual-style statement).

**Toon / cel with outlines.**
- The most detailed current account is Codrops, "Still: From Akira to Ink Wash, Building a Generative Garden in WebGPU" by Ming Jyun Hung (https://tympanus.net/codrops/2026/09/09/still-from-akira-to-ink-wash-building-a-generative-garden-in-webgpu/, 2026-09-09). Points that matter here: toon lighting quantised to two levels (one shadow band, one lit band) because more steps stop reading like print; the same quantised lighting applied to every asset is what makes the scene read as one image; outlines use an inverted hull on the character but a mask-based shader on instanced petals because a second mesh per instance would be too expensive; the mask-based route uses `discard` (Early-Z concern above). It is built on WebGPU and TSL, so it is a technique reference, not a drop-in for the WebGL2 baseline.
- Historical-content precedents with a woodcut or illustration look that earned scholarly respect (secondary, review-level sources): Pentiment borrows from late-medieval illumination and early woodcuts and used a historian team (https://www.avclub.com/pentiment-preview and https://www.vice.com/en/article/pentiment-review/, both 2022 era; search-result summary only). Valiant Hearts: The Great War (stylised 2D) is described by teachers and historians as usable in class, with teacher mediation, and its characters are fictional but inspired by wartime letters (https://www.playthepast.org/?p=5063 and https://www.gamedeveloper.com/design/a-valiant-hearts-history-lesson, 2014 era; search-result summary only).
- Whether a toon outline survives the bake from cube faces to equirectangular without visible seams or uneven line weight was not found in any source (inference: line width is set in screen pixels per cube face, so angular width varies across the panorama).

**White-box / clay / maquette.**
- The strongest evidence in the whole route. Unger, Dzurilla, Kostal and Kosta, "Breathing Life into Archaeological Archives: Crafting Compelling Narratives with 3D Digital Storytelling", Internet Archaeology 72, article 13 (https://intarch.ac.uk/journal/issue72/13/, March 2026): for videos made for the National Museum in Prague, the final design for models used clay render, non-photorealistic rendering and transparency for uncertain data, and a photorealistic render only for completely credible data and contexts (Figures 10 and 11 captions). The authors argue for standardised visual languages and report no user comprehension study.
- Frischer and Stinson, "The Importance of Scientific Authentication and a Formal Visual Language in Virtual Models of Archaeological Sites" (in *Interpreting the Past*, Ename Center, Brussels, 2007; conference 2002; PDF https://www.iath.virginia.edu/images/pdfs/Frischer_Stinson.pdf, text extracted locally): digital restoration fills lost areas with schematic forms and lighter, less saturated colours (they settled near 70 to 75 percent of sampled colour intensity, with a grain texture to remove plasticity), applies the Venice Charter logic to virtual models, shows wholly hypothetical elements only in grey tones (their floor-paving example), and treats simplicity of appearance as an aesthetic value that conveys conjecture. They state there are no agreed standards for this.
- Strothotte, Masuch and Isenberg, "Visualizing Knowledge about Virtual Reconstructions of Ancient Architecture", Computer Graphics International 1999 (https://tobias.isenberg.cc/p/Strothotte1999VKV, search-result summary): sketchy non-photorealistic styles encode uncertain features, because photorealistic images leave the impression that the depicted thing exists and that detailed information is known. Roussou and Drettakis, "Photorealism and Non-Photorealism in Virtual Heritage Representation", VAST 2003 (https://diglib.eg.org/bitstream/handle/10.2312/VAST.VAST03.051-060/051-060.pdf, abstract via https://hal-univ-tlse3.archives-ouvertes.fr/INRIA/inria-00606745 search summary; full text blocked 403): NPR can give believable environments while keeping the data valid, and interactivity matters as much as realism.
- Physical museum analogue: the Neues Museum Berlin (Chipperfield and Harrap) restoration followed the Venice Charter: gaps are filled so the new does not imitate the lost and stays distinguishable in material (Dezeen, 2009-03-04, https://www.dezeen.com/2009/03/04/neues-museum-by-david-chipperfield-architects-and-julian-harrap-architects/; search-result summary).
- Gap: no source found that tested whether a general or student audience reads a clay or white-box look as honest, dull, or unfinished. "Dull" is a risk against the wow-factor criterion (my inference; not evidence-based).

**Diorama / papercraft / cut-out layered 2.5D.**
- B1-R2 s1.4 covers depth-map displacement of archival photos (Depth Anything V2 Small Apache-2.0; Base and Large CC-BY-NC; Depth Pro disputed) and says the 3D effect is the only inferred layer and must be labelled. This route adds the cut-out variant: separate the photo into a few flat layers. Practitioner descriptions say the layer behind a cut-out subject must be painted in (https://www.picturecorrect.com/parallax-animation-bringing-still-photographs-to-life/, undated). That painted-in area is generated pixels that never existed in the record (inference: it changes the evidential status of the layer, which displacement does not).
- Parallax is a named vestibular trigger: web.dev says parallax scrolling animations can cause vestibular reactions (dizziness, nausea, migraine) because background elements move at different rates (https://web.dev/articles/prefers-reduced-motion and https://web.dev/learn/accessibility/motion, via Google Developer Knowledge). Any 2.5D motion needs a static equivalent under `prefers-reduced-motion`.
- Paper dioramas are an old form (1850s, Henri Lefort) so the look has a historical referent (https://people.stfx.ca/rbantjes/Optical_Devices/Optical_Box_Taxonomy/Image_Paper_Dioramas.html, undated). No web-museum precedent with a verified accessibility record was found.

**Painterly / ink-wash NPR.**
- Same Codrops article: ink-wash ground shadow built from the shadow map, a woven-silk overlay across the frame, and sketch-like noise on contours. Everything is WebGPU/TSL. Elsewhere: Codrops "Sketchy Pencil Effect with Three.js Post-Processing" (2022-11-29, https://tympanus.net/codrops/2022/11/29/sketchy-pencil-effect-with-three-js-post-processing/, Sobel edge detection; search-result summary).
- Consistency across parallel agents is the open issue: many tuned noise and threshold parameters (inference). A baked offline filter (for example Kuwahara) would sidestep runtime cost but has the same equirect seam question as toon outlines (inference).

**Duotone / sepia / halftone / dither as a unifying layer.**
- Dithering as a WebGL post-effect: Codrops, "Building a Real-Time Dithering Shader" by Niccolo Fanton (https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/, 2025-06-04): ordered Bayer 4x4, optional pixelation and grayscale, built as an `Effect` for the pmndrs library, no texture needed; the author frames it as styling and flattening, not photorealism. Repo: https://github.com/niccolofanton/dithering-shader. Game precedent: Return of the Obra Dinn (https://obradinn.com/), whose author developed a blue-noise dithering variant (search-result summary, https://www.alanzucconi.com/?p=10365). A WebGL port exists at https://github.com/yunjay/Return-of-the-One-Bit.
- Colour grade as the unifier: three.js `LUTPass` or a custom pass (a-0). A CSS "fake duotone" on 2D images (tint layer with a multiply blend) is described as used by the Smithsonian National Museum of the American Indian for portraits (https://thelawlers.com/Blognosticator/?p=592; blog, date not shown; low grade). The CSS or SVG-filter implementation details themselves are my knowledge, not sourced.
- Archival photographs and colour: archivists regard colourisation as potentially a misrepresentation or even a defacing of the record; where done it should be labelled and not claim authority; the 2021 Tuol Sleng colourisation case was condemned and the publisher apologised (https://fortune.com/2021/05/12/colorizing-black-and-white-photos-pictures-of-the-past-historic-images-ethics-review-photography; also https://ojs.utlib.ee/index.php/bjah/article/view/BJAH.2022.23.06, 2022; search-result summaries). Grading the constructed 3D toward monochrome leaves the photographs untouched; this asymmetry is analytical, not a source claim.
- Evidence-tier encoding limit: a duotone world has little hue range, and WCAG 1.4.1 (Level A, page updated 2025-09-16, https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) says colour cannot be the only means of conveying information. Tier cues would need to be line style, texture, pattern, icon or text.

**Award-level and institutional precedents (virtual reconstruction of the past on the web).**
- Persepolis Reimagined, Getty (built by Monks): Awwwards Site of the Day 2022-06-01, score 7.96; WebGL, GSAP and Vue; three-colour palette #987654, #D14836, #ECD06F; Awwwards developer scores include accessibility 7.4 of 10 and web performance 7.2 (https://www.awwwards.com/sites/persepolis-reimagined). I opened the live site (https://persepolis.getty.edu/): dark background, a serif display face, a gold ring control, and settings and sound buttons on the intro screen; I did not test its accessibility or how it labels conjecture.
- B1-R1 already listed National Gallery Imaginarium, Mouthful of Dust and Getty Tracing Art with their accessibility probes; not repeated.

### (b) Virtual-heritage principles on visual honesty

- **London Charter** (2009; v2.1 per B1-R2; https://londoncharter.org/principles/documentation.html, page read 2026-10-08 through a summariser, so paraphrase only): the documentation principle asks that it be made clear to users what a visualisation seeks to represent (the existing state, an evidence-based restoration or a hypothetical reconstruction) and the extent and nature of factual uncertainty (4.4); that the creative and interpretive decisions be documented as paradata (4.6); that sources and provenance be documented (4.5); and that significant hypothetical dependencies between elements be identifiable by users with their reasoning (4.10). The principles page I read gives no prescription for how uncertainty is to be drawn; the Charter sets the duty, not the visual device.
- **Seville Principles** (International Principles of Virtual Archaeology, ratified by ICOMOS 2017): secondary sources agree that Principle 4 (authenticity) is about distinguishing reality from speculation and clarifying accuracy levels, and Principle 7 (scientific transparency) is about making documentation accessible. Source: search-result summaries only; the result lists included ISPRS Archives XLVIII-2/W12-2026 p. 471 (https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/471/2026/isprs-archives-XLVIII-2-W12-2026-471-2026.pdf, 2026) and an MDPI Arts article 14(4):69 (https://www.mdpi.com/2076-0752/14/4/69), but the PDF text was not extractable and MDPI returned 403. The primary text was not retrievable (smartheritage.com returned empty content; sevilleprinciples.com refused the connection). González García, "Virtual recreation as a valid scientific representation for raising public awareness", Archeologia e Calcolatori 35.2 (2024), 147-156 (https://www.archcalc.cnr.it/indice/PDF35.2/16_Gonzalez_Garcia.pdf, text extracted locally) quotes the Seville definitions: "virtual reconstruction" is visual recovery of a built object from existing physical evidence plus reasonable comparative inference; "virtual recreation" covers the past environment, landscape, uses and cultural meaning, including unverified elements and humanising elements. She cites the Extended Matrix (Demetrescu) as a tool for tracing hypotheses.
  - Relevance (inference): IHH's constructed rooms (furniture, props, people, atmosphere) fit the Seville "recreation" definition more closely than "reconstruction".
- **ICOMOS Ename Charter** (2008): visual reconstructions should rest on detailed systematic analysis of the available data and sources, clearly document the information sources used, and offer alternative reconstructions from the same evidence for comparison where available; full scientific documentation (an analytical, critical report) should be available to visitors and researchers. Source: text as reproduced in search-result summaries (one result: https://works.bepress.com/neil_silberman/19/) and the Frischer and Stinson PDF, which discusses the Charter; I did not obtain the ICOMOS document itself.
- **Venice Charter Art. 12 (1964)** and **Burra Charter Art. 20.2**: replacements and reconstructions must stay distinguishable. The Burra wording is: "Reconstruction should be identifiable on close inspection or through additional interpretation." (Australia ICOMOS, https://marquis-kyle.com.au/burra99.htm, via search-result summary.) Note the second route, interpretation, which a label or panel can satisfy without changing the look.
- **Practice has no standard.** Frischer and Stinson (2007) report no agreed standard; Unger et al. (2026) still call for standardised visual languages; a survey-style summary says terminology and scales differ across projects. Techniques in use: optical transparency, wireframe, colour scales and colour coding, hatching and line types, superimposed schematic rendering on a photorealistic base, NPR and clay renders, sketchy line work; the Swedish Pompeii project is said to use a five-level uncertainty scale (search-result summaries only; primary not opened). Sources: https://isprs-archives.copernicus.org/articles/XLII-2-W9/409/2019/isprs-archives-XLII-2-W9-409-2019.pdf (2019), https://intarch.ac.uk/journal/issue72/13/ (2026), https://diglib.eg.org/items/3d3a9a52-0b6e-461e-b5f3-2b6de0437a32/full (Zuk, Carpendale and Glanzman, VAST 2005, abstract only).
- **Perception evidence is old and not experimental.** Ogleby, "The 'Truthlikeness' of Virtual Reality Reconstructions of Architectural Heritage: Concepts and Metadata", ISPRS Commission VI WG VI/4 (https://www.isprs.org/proceedings/XXXVI/5-W47/pdf/ogleby.pdf, read locally, undated in the file; ISPRS volume XXXVI is 2007): the more photorealistic a reconstruction, the more likely viewers perceive it as a true image; proposes a metadata standard for veracity. I found no controlled study of whether transparency, wireframe or clay styles actually change viewer comprehension.
- **Photographs and belief.** Nonprobative photographs raise the truthiness of claims (Newman, Garry and colleagues, e.g. https://researchportalplus.anu.edu.au/en/publications/nonprobative-photographs-or-words-inflate-truthiness/; abstract-level). Relevance: archival photographs placed next to a claim are persuasive by being photographs, whatever their evidential weight (inference).

### (c) Typography and colour

**Licences and delivery (verified).**
- Google Fonts states all fonts are open source and usable in commercial and non-commercial projects (https://developers.google.com/fonts via Google Developer Knowledge). web.dev advises self-hosting WOFF2 only (https://web.dev/learn/performance/optimize-web-fonts). Self-hosting packages exist on npm under OFL-1.1 (@fontsource and @fontsource-variable, v5.3.0, registry checked 2026-10-08), including `@fontsource/cooper-hewitt`.
- The google/fonts repository `METADATA.pb` files (raw GitHub, 2026-10-08) list licence "OFL" for every family below.

| Family | Class | Date added to Google Fonts | Notes |
|---|---|---|---|
| Montserrat | geometric sans | 2011-12-13 | Current IHH site body and heading face (measured below); loaded from fonts.googleapis.com |
| Nunito Sans | sans | 2016-10-06 | In IHH heading font stack |
| Fraunces | soft-serif display | 2020-10-29 | Variable font; axes not checked this session |
| Source Serif 4 | text serif | 2021-11-16 | Designer Frank Griesshammer |
| Literata | text serif | 2018-12-06 | Designer TypeTogether; book-reading origin is my knowledge |
| Newsreader | text serif | 2020-07-01 | Production Type |
| Crimson Pro, Lora, Merriweather, Playfair Display | serifs | 2018, 2011, 2011, 2011 | Common alternatives |
| Public Sans | neutral sans | 2019-06-07 | Made for the US Web Design System |
| Inter | UI sans | 2020-01-24 | |
| IBM Plex Sans / Serif | sans, serif | 2018-03-12 | Bold Monday |
| Atkinson Hyperlegible; Next | low-vision sans | 2021-04-30; 2025-01-07 | Braille Institute; Next released 2025-02-10 with 7 weights, 150+ languages, variable and mono versions (https://ophthalmologymanagement.com/news/2025/applied-design-and-braille-institute-partner-to-launch-typeface-for-making-reading-easier/) |
| Lexend | reading-oriented sans | 2021-03-09 | |
| Cooper Hewitt | museum sans | n/a on Google Fonts; @fontsource package OFL-1.1 | See below |

**What leading museum teams use (open licences noted).**
- Cooper Hewitt (Smithsonian Design Museum): own typeface by Chester Jenkins, released free under the SIL OFL with web font and UFO sources on GitHub, alongside other open-source assets (https://www.cooperhewitt.org/open-source-at-cooper-hewitt/cooper-hewitt-the-typeface-by-chester-jenkins/; release date not stated on the page).
- Smithsonian brand: Minion Pro and Basier Circle; units may pick their own fonts and colours under shared components; the Drupal design system uses mostly black and white with blue and yellow accents (https://logo.si.edu/visual-styles/typography, 403 to the fetcher, so via search summary; https://atendesigngroup.com/smithsonian). Both named faces are commercial (my knowledge).
- Rijksmuseum: custom typeface by Paul van der Laan (Bold Monday) and a palette derived from collection highlights, in the Irma Boom house style (2011); the 2020 website by Fabrique and Q42 is "image first" with extremely large images and simplicity, European Design Awards gold 2021 (https://atypi.org/presentation/the-new-rijksmuseum-identity-and-typeface-family/; https://q42.nl/en/work/rijks-website1; https://awards.europeandesign.org/winner/248792). Typeface licence not found.
- MoMA: MoMA Sans by Christian Schwartz at Commercial Type (2017, 23 weights) and a modular identity by Order (2019) (https://type.today/en/journal/moma_sans; https://order.design/project/moma). Commercial; no open-source design system found.
- Library of Congress: Pentagram identity with Druk Condensed Super and Sharp Grotesk 20 (https://creativebloq.com/news/library-of-congress-brand-gets-typographic-renewal). Commercial. I did not find loc.gov's own web design system.
- Net: of the named lineages, the open ones are Cooper Hewitt (OFL) and, from government, Public Sans (OFL). The others are commercial or unverified.

**IHH's existing brand (measured from the live site, 2026-10-08, in-app browser).**
- Body and heading face Montserrat (heading stack lists Avenir, Montserrat, Nunito Sans first); body 16 px, colour #666666 on background rgb(243,249,255); button red #d60810 with white text. Kadence palette tokens: #ed1b24, #d60810, #000000, #ffd133, #666666, #7db2f1, #0d5ab6, #cae2ff, #ffffff.
- WCAG contrast ratios I computed from those hex values: #666666 on #f3f9ff 5.42; white on #d60810 5.38; white on #ed1b24 4.39 (below 4.5 for normal text, passes as large text); #ffd133 on black 14.42; #ffd133 on white 1.46; #0d5ab6 on white 6.66; #7db2f1 on white 2.21; #ed1b24 on black 4.78.

**Contrast rules and tooling.**
- Normal text needs 4.5:1, large text (at least 24 px, or 18.5 px bold) and essential icons 3:1 (https://web.dev/learn/accessibility/color-contrast, via Google Developer Knowledge). Lighthouse and DevTools can audit (https://developer.chrome.com/docs/devtools/accessibility/contrast).
- Text over imagery: WCAG failure F83 (page updated 2026-03-09, https://www.w3.org/WAI/WCAG22/Techniques/failures/F83): quick check against the lightest area (for light text) or darkest area (for dark text) of the image; if that fails, each letter must still have enough contrast against what is directly behind it. Implication for archival photographs (varied tones): a measured worst case, not an average.
- Palette systems with contrast built in: USWDS grades (0 white to 100 black; a grade difference of 50 or more gives AA, 40 or more gives AA large text, 70 or more gives AAA; page 2022-06-03, v3.14.0, https://designsystem.digital.gov/design-tokens/color/overview/). Material 3 HCT tone: tone is the lightness axis and tone difference sets contrast (https://developer.android.com/design/ui/mobile/guides/styles/color, via Google Developer Knowledge); the specific rule that a tone difference of 40 guarantees 3:1 and 50 guarantees 4.5:1 comes from a search summary and was not confirmed on the primary Material page (fetch returned no content). Material Color Utilities is described as Apache-2.0 (secondary).

**Dark versus light.**
- Nielsen Norman Group review (2020-02-02, https://www.nngroup.com/articles/dark-mode/): for people with normal vision, light mode (positive polarity) gave better acuity and proofreading performance, with the advantage growing as font size shrinks (Piepenbrock et al. 2013); at night light mode was still better in glanceable reading (Dobres et al. 2017); people with cloudy ocular media such as cataracts read better in dark mode (Legge); the article suggests dark mode as an option, not a default, for long reading. Museum immersive sites frequently use dark UIs (Getty Persepolis above; the reference site in `01-reference-and-ihh-audit.md` A7 also has a dark gallery theme). I found no evidence that dark UI improves learning or credibility.

**Type for readers with reading difficulties.**
- Specialised dyslexia fonts: no improvement in speed or accuracy in children with dyslexia (Wery and Diliberto 2017, https://pmc.ncbi.nlm.nih.gov/articles/PMC5629233); extra letter and word spacing helps, including for non-dyslexic readers (Marinus et al. 2016, summarised in https://www.brainfacts.org/Diseases-and-Disorders/Childhood-Disorders/2017/Can-Special-Fonts-Help-People-With-Dyslexia-082117 and https://www.readingrockets.org/blogs/shanahan-on-literacy/what-about-special-fonts-kids-dyslexia-or-other-reading-problems). So the evidence points at spacing and size controls more than at a special face. Atkinson Hyperlegible was designed for low vision, and I did not find controlled evidence for its benefit.

### (d) Motion

**View Transitions support (data from the caniuse repository, JSON read 2026-10-08).**

| Feature | Chrome | Edge | Safari / iOS | Firefox | Samsung Internet | Global share |
|---|---|---|---|---|---|---|
| Same-document (`startViewTransition`) | 111+ | 111+ | 18.0+ | 144+ | 23+ | 91.75% |
| Cross-document (`@view-transition { navigation: auto }`) | 126+ | 126+ | 18.2+ | partial: Level 1 only, no cross-document (160 listed as partial) | no (v30) | 85.97% full, 1.81% partial |

- Confirmed by Google Developer Knowledge `answer_query`: same-document view transitions are Baseline Newly available since 2025-10-14 (web.dev, 2025-10-16, https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available); cross-document is Chromium plus Safari 18.2 and not Firefox; Firefox 144 lacks view transition types, added in 147 for same-document only. A search summary says cross-document and `@view-transition` are Interop 2026 focus items (secondary).
- Cross-document rules (Chrome docs, https://developer.chrome.com/docs/web-platform/view-transitions/cross-document): same-origin only; both pages opt in with the CSS at-rule; user-initiated navigations such as address-bar entry, bookmarks and reloads are excluded; a navigation taking more than 4 seconds skips the transition; unsupported browsers ignore the rule and load normally; in Chrome 126 only main-frame navigations were covered, iframe support "later" (current status not verified), which matters for any embed.
- The premise in the brief that cross-document transitions work in "Safari/Firefox" is half right: Safari yes, Firefox no.

**Reduced motion.**
- CSS: `@media (prefers-reduced-motion)` can set `animation: none` on the transition pseudo-elements, though a subtler animation that still explains the relationship is also acceptable (https://developer.chrome.com/docs/web-platform/view-transitions/same-document, via Google Developer Knowledge). JS-driven motion (three.js camera, Web Animations API, library tweens) must listen to the media query itself (https://web.dev/articles/prefers-reduced-motion). Support 96.45% (caniuse). Windows frames the setting positively ("Show animations"), so defaults matter (https://web.dev/learn/accessibility/motion). Astro's `ClientRouter` disables transitions automatically under the setting (B1-R3 a5). Playwright can test it with the `reducedMotion: 'reduce'` context option (Context7 `/microsoft/playwright`).
- Even short animations should get pause or stop controls for people who asked for reduced motion (web.dev motion module). B1-R1 lists WCAG 2.2.2 (Level A) and 2.3.3 (AAA).

**Performance on slow phones.**
- Third-party RUM (corewebvitals.io, last reviewed February 2026; A/B tests on 5 sites, over 500,000 page views, 120,000 mobile same-site views, 7 days): view transitions added about 70 ms to LCP on repeat mobile page views, 5 ms on fast desktop, 40 to 77 ms on slow CPUs; the author suggests prerendering with Speculation Rules or limiting transitions to wider viewports (https://www.corewebvitals.io/pagespeed/view-transition-web-performance). WebKit bug reports describe jank with many shared elements (https://bugs.webkit.org/show_bug.cgi?id=282267). Single vendor-neutral data set, not peer reviewed.
- Core Web Vitals "good" thresholds: LCP 2.5 s, INP 200 ms, CLS 0.1 at the 75th percentile (https://web.dev/articles/vitals; thresholds article updated 2025-05-07). In May 2022 CrUX data, 56% of phone origins met 200 ms INP [OLD] (https://web.dev/articles/defining-core-web-vitals-thresholds).

**Scroll-driven animation.**
- CSS scroll and view timelines run off the main thread; support is Chrome and Edge 115+, Safari 26, no Firefox in the support table I retrieved; feature-detect with `@supports (animation-timeline: scroll())`; Tokopedia reports average CPU during scrolling falling from 50% to 2% after replacing JS scroll handlers (https://developer.chrome.com/docs/css-ui/scroll-driven-animations and https://developer.chrome.com/blog/css-ui-ecommerce-sda, via Google Developer Knowledge). Single-company case study.

**Library licensing and size.**

| Library | Version (npm) | Licence | Notes |
|---|---|---|---|
| GSAP | 3.15.0 (2026-04-13) | "Standard no charge" licence, proprietary, not OSI | See below |
| Motion (motion.dev) | 14.0.0 (2026-10-02) | MIT | Hybrid engine: WAAPI or rAF; `animate` mini about 2.3 kB, hybrid about 17-18 kB; `scroll()`; React `MotionConfig reducedMotion="user"` is documented for React and Vue; for vanilla use I assume the media query must be read by hand (inference) (Context7 `/websites/motion_dev`) |
| Lenis (smooth scroll) | 1.3.26 (2026-08-05) | MIT | Scroll-hijack critiques recorded in B1-R1 |
| three.js | 0.186.1 (2026-09-24) | MIT | |

- GSAP licence text read on the source page (https://gsap.com/community/standard-license/, effective 2025-04-30, last modified 2025-05-30): permitted use is implementation on any website, web app or digital interface by any person or entity, including competitors of Webflow in other areas; commercial use is stated to be free including the former members-only plugins (SplitText, MorphSVG); prohibited is use inside tools that let users build visual animations without code and that help create a product competing with Webflow's visual animation builder; AI-generated GSAP code is stated as not prohibited; Webflow owns the IP; Webflow may terminate in its discretion for non-compliance; Webflow may amend by posting, but users who reject an amendment may keep using earlier versions under earlier terms; the licence is incorporated into Webflow's Terms of Service. An older formulation in a search snippet (free "as long as end users are not charged a fee") is not in the current text.
- Motion's own size comparison against GSAP (23 kB) is a vendor statement on a comparison page (https://motion.dev/docs/gsap-vs-motion, via Context7), low grade.
- Award precedents use GSAP: Getty Tracing Art (GSAP ScrollTrigger, Lenis, three.js, KTX2 per B1-R1) and Persepolis Reimagined (GSAP, Vue).

### (e) Design-system mechanics for parallel agents

**Tokens.**
- The Design Tokens Community Group released Format Module 2025.10 as its first stable version on 2025-10-28 (https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/; https://www.designtokens.org/; spec https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/). It states it is not a W3C Standard and not on the Standards Track. Types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, and composites strokeStyle, border, transition, shadow, gradient, typography. Colour includes modern spaces (Display P3, Oklch and CSS Color 4 per the announcement). Implementers listed: Style Dictionary, Tokens Studio, Terrazzo, Figma, Penpot, Sketch, Framer, Supernova, zeroheight and others.
- Tooling: Style Dictionary 5.6.0 (Apache-2.0; v5 adopts DTCG 2025.10 as its base format per a search summary; Context7 shows `$value` / `$type` tokens and a `css/variables` format that accepts multiple selectors to nest dark-theme output, https://github.com/style-dictionary/style-dictionary); Terrazzo CLI 2.7.1 (MIT, npm).
- DESIGN.md (Google Labs, Apache-2.0, status alpha per its README, https://github.com/google-labs-code/design.md): one Markdown file with YAML front matter tokens (colour, dimension, typography, references) and prose rationale; a CLI lints structure and checks WCAG contrast and exports to DTCG or Tailwind. Secondary articles describe it as the design counterpart of AGENTS.md. Alpha status and a single source.

**Shared scene kit (what the engine can enforce).**
- Fixed rendering settings in three.js: tone mapping choice, colour management and output colour space, `LUTPass` grade, one gradient map and light rig for toon, one material set (Context7 docs above). B1-R2 s1.7 and s1.10 already propose the linter gates (object-ID pass for hotspots, size budgets, licence allowlist, palette and lighting conformance). The palette-conformance gate is described but unbuilt there.
- Evidence found on how well LLM agents hold a style across many scenes: none directly. B1-R2 recorded spatial placement as the weak point (BlenderGym, SceneCraft). Whether palette drift or geometry drift is the larger risk for agents is unmeasured.

**Visual regression and golden images.**
- Playwright (1.64.0, Apache-2.0, published 2026-10-07 per B1-R2 and npm) `toHaveScreenshot` compares with pixelmatch (pixelmatch 8.0.0 is ISC on npm). Docs: rendering varies with OS, version, settings, hardware and headless mode, so baselines should be created and compared in the same environment (typically Docker or CI); file names carry browser and platform suffixes; options include `threshold` (default 0.2), `maxDiffPixels`, `maxDiffPixelRatio`, `animations: 'disabled'`, `mask`, `stylePath`; `--update-snapshots` refreshes baselines; `snapshotPathTemplate` controls layout (https://playwright.dev/docs/test-snapshots; Context7 `/microsoft/playwright`).
- The assertion waits until two consecutive screenshots are identical (Context7, Playwright source and API docs). A continuously rendering WebGL canvas (auto-rotate, drifting camera) never stabilises unless the page offers a frozen or seeded mode (inference from that behaviour).
- Headless WebGL: Chrome deprecated automatic SwiftShader fallback for WebGL as of Chrome 137 (May 2025); context creation now fails unless started with `--enable-unsafe-swiftshader` (Chromium blink-dev "Intent to Remove: SwiftShader Fallback", https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM/m/oLrB5up_BwAJ; Esri support note https://support.esri.com/en-us/knowledge-base/usage-of-arcgis-maps-sdk-for-javascript-with-chrome-whe-000038872). Playwright's Firefox build sets `webgl.forbid-software` false to allow software WebGL on GPU-less machines (Context7 Playwright source). Golden images made by a CPU rasteriser will differ from GPU renders, so goldens are tied to the runner stack.
- Practitioner guides name CSS animation, late fonts, dynamic content and GPU or OS anti-aliasing as the main flake sources and suggest pinning a Playwright Docker image (https://argos-ci.com/blog/playwright-visual-regression-testing-ci, https://testquality.com/playwright-visual-regression-guide/; vendor blogs, undated).

### (f) Counter-route: is a strongly stylised look a credibility risk with teachers?

- **Looks drive credibility judgements in general.** Fogg et al., "How do users evaluate the credibility of Web sites? A study with over 2,500 participants", DUX 2003: 2,684 people rated two live sites; "design look" was the most frequent category of comment (46.1%), more for finance (54.6%), search (52.6%), travel (50.5%) and e-commerce (46.2%) and less for health (41.8%), news (39.6%) and nonprofit sites (39.4%) (numbers from a secondary summary, https://en.wikipedia.org/wiki/Stanford_Web_Credibility_Project and https://internetnews.com/marketing/study-for-site-cred-looks-matter; the DUX paper itself not opened; study is 2003 [OLD]; participants were consumers, not teachers). Robins and Holmes, "Aesthetics and credibility in web site design", Information Processing and Management 44 (2008) 386-399: identical content with higher aesthetic treatment was judged more credible, within seconds (https://makinggood.ac.nz/media/1276/robinsholmes_2008_aestheticsandcredibilityinwebdesign.pdf). Both studies manipulate polish, not "stylised versus realistic".
- **Direct test of image style, one study.** Ramsey, Gonsalves, Holt and Borron, "Real, Illustrated, or Cartooned? How Image Style Shapes Perceptions of Farmers' Source Credibility", Journal of Applied Communications 110(1), 2026, N = 492: no significant credibility difference among a photograph, an AI illustration and an AI cartoon of the same farmer; photographs were strongly preferred (410 vs 43 vs 39) (https://journals.newprairiepress.org/jac/article/id/20785/). Different subject (a person, not a scene) and AI-generated stimuli.
- **Photographs versus cartoons in persuasion.** A University of Illinois brochure study (Rodriguez) found photographs more credible and cartoons more persuasive, with longer viewing of cartoons (press coverage: https://thearabianpost.com/photos-more-credible-cartoons-more-persuasive-study-shows/; original not opened).
- **Teachers and appearance.** Wineburg and McGrew (Stanford History Education Group): undergraduates and PhD historians judged sites by logos, layout, references and a .org domain by reading within the site, while professional fact-checkers left the site and checked what others said, reaching better conclusions in less time (https://ed.stanford.edu/news/stanford-scholars-observe-experts-see-how-they-evaluate-credibility-information-online; https://stanforddaily.com/2017/10/26/fact-checkers-more-likely-than-peer-expert-groups-to-identify-credible-information-determine-gse-researchers/). So surface cues sway novices; the trained route is provenance. B1-R1's teacher interview points the same way: institutional credibility, linked primary sources and a bibliography with years.
- **Emotional design.** Brom, Starkova and D'Mello, "How effective is emotional design? A meta-analysis on facial anthropomorphisms and pleasant colors during multimedia learning", Educational Research Review 25 (2018) 100-119: the manuscript I read (https://artemis.ms.mff.cuni.cz/main/papers/emodesign_manuscript_1rev_180928_FINAL_norev.pdf) reports d+ of 0.387 (retention, k = 18), 0.317 (comprehension, k = 14) and 0.327 (transfer, k = 27); a secondary summary of the published version gives g+ of 0.35, 0.29 and 0.27, with affect and motivation effects of 0.09 to 0.15. Facial anthropomorphisms and warm colours are not the same thing as a stylised world.
- **Stylised work that educators and historians accepted** (all secondary): Valiant Hearts and Pentiment (a-2). Both are narrative games that exposed their sources or consulted historians; neither is a museum reference site.
- **Gap.** I found no study of teacher or student credibility judgements for stylised versus realistic 3D or 360 historical environments, and no study of "AI recreation" labels on avatars.

---

## 2. Per-finding confidence

| ID | Finding (short) | Confidence | Why |
|---|---|---|---|
| a1 | three.js toon, outline and LUT API facts | high | Official docs through Context7 |
| a2 | Outline cost model (object-based vs screen-space) | low | Forum thread and search summary; unmeasured |
| a3 | Post effects on phones: advice is old; pmndrs merging passes is documented, mobile suitability is not | med | Docs plus a 2014 case study plus Android page; no benchmark |
| a4 | Style cost splits into bake-time and runtime in the baked pipeline | med | Follows from B1-R2's pipeline; my inference |
| a5 | Low-poly flat is cheapest and kits exist | med | Docs and B1-R2 licences; no benchmark |
| a6 | Toon technique details (two bands, hull vs mask outlines) | high for what the article says; med for transfer | Detailed 2026 article; WebGPU-only code |
| a7 | Clay render, NPR, transparency, schematic and grey for uncertain data | high that sources say it; med that it transfers to a student-facing web museum | Peer-reviewed 2026 and 2007 papers; no audience test |
| a8 | Photorealism raises perceived truth of reconstructions | med | Several papers, mostly 1999-2007, no controlled study |
| a9 | Cut-out layers fabricate hidden pixels; parallax triggers vestibular issues | med (vestibular high; fabrication inference low) | web.dev for the vestibular claim; practitioner article plus reasoning for the other |
| a10 | Painterly NPR high wow, high agent-consistency risk | low | One WebGPU article; consistency claim is inference |
| a11 | Dither or grade as a unifier is technically cheap and has precedents | med | Codrops 2025, Obra Dinn, three.js docs; no heritage precedent |
| a12 | Colourising archival photographs is contested | med | Archival-ethics articles, one 2022 journal page |
| a13 | Persepolis Reimagined facts | high for dates and scores; low for style and accessibility | Awwwards page read; site not audited |
| b1 | London Charter duties on clarity and paradata | med | Read via summariser of the official page; B1-R2 read principles directly |
| b2 | Charter does not prescribe a visual device | med | Absence in pages read |
| b3 | Seville P4 and P7 content; recreation vs reconstruction definitions | med | Primary unreachable; one article quotes the definitions |
| b4 | Ename Charter on documented reconstructions and alternatives | med | Search-result text; ICOMOS document not opened |
| b5 | Venice 12 and Burra 20.2 distinguishability | high | Consistent across several results; Burra wording quoted |
| b6 | No agreed standard for visual uncertainty | high | Independent sources 2007 and 2026 |
| b7 | Frischer and Stinson specifics (70-75%, grey for hypothetical) | high | PDF text read locally |
| b8 | Unger et al. 2026 style rule | high | Page read |
| b9 | No controlled user study of uncertainty styles found | low | Absence of evidence in my searches only |
| c1 | All candidate families OFL; Fontsource packages OFL | high | METADATA files and npm checked |
| c2 | Only Cooper Hewitt and Public Sans are open among the museum and government lineages | med | Licences of Rijksmuseum, Smithsonian, MoMA and LoC faces inferred or unverified |
| c3 | Special dyslexia fonts do not help; spacing does | med | Two studies via summaries and PMC |
| c4 | Light mode better for normal vision; dark for cataract; offer both | med-high | NN/g review of named studies; 2020 |
| c5 | Contrast ratios and F83 text-over-image test | high | W3C and web.dev |
| c6 | IHH brand tokens and contrast ratios | high | Measured on the live site; ratios computed |
| c7 | USWDS and HCT tone systems give contrast by construction | med-high | USWDS page read; HCT 40 and 50 numbers secondary |
| c8 | Colour-coded tiers need non-colour cues | high | WCAG 1.4.1 page |
| d1 | View Transitions support matrix | high | caniuse JSON, GDK answer, web.dev agree |
| d2 | Reduced-motion mechanics | high | web.dev, Chrome docs |
| d3 | View transitions cost about 70 ms LCP on mobile repeat views | low-med | Third-party RUM, one author |
| d4 | Scroll-driven animations support and CPU benefit | med | Chrome docs; one case study; Firefox gap per a doc table |
| d5 | GSAP licence terms | high | Licence page read in full |
| d6 | Motion MIT; size figures | high (licence), low-med (sizes) | npm field; vendor comparison page |
| d7 | Parallax is a vestibular trigger | high | web.dev |
| e1 | DTCG 2025.10 stable but not a W3C Standard | high | Community Group pages |
| e2 | Style Dictionary 5 and Terrazzo support DTCG | med-high | npm, Context7, search summary |
| e3 | DESIGN.md exists, alpha | med | README via summariser |
| e4 | Playwright comparison mechanics and platform-specific baselines | high | Official docs |
| e5 | Chrome 137 SwiftShader fallback deprecation | high | Chromium sources |
| e6 | Animating canvases do not stabilise screenshots | med | Follows from documented stabilisation; not tested |
| f1 | Design look dominates credibility comments (46.1%) | med | Secondary report of a 2003 study |
| f2 | Higher aesthetic treatment raises credibility | med | Robins and Holmes 2008, abstract-level; single paper plus related work |
| f3 | Photo vs illustration vs cartoon: no credibility difference in one study | med | Journal page read; one study, AI stimuli, farmer image |
| f4 | Photos inflate belief | med-high | Multiple replications in results; abstract-level |
| f5 | Novices use surface cues; experts check provenance | med | Stanford reports via summaries |
| f6 | Emotional design gives small learning gains | med | Manuscript read; published numbers differ slightly |
| f7 | No direct evidence on teacher response to stylised 3D | low | Absence in my searches only |

---

## 3. Contradictions and tensions

1. **Brief versus data on cross-document View Transitions.** The brief says cross-document works in "Safari/Firefox". caniuse: Safari 18.2+ yes; Firefox only Level 1 (same-document). GDK `answer_query` agrees (Firefox not supported).
2. **GSAP "free" versus "not open source".** The current licence is free for commercial use (primary text) but proprietary, revocable and amendable by Webflow. A search snippet quoting an end-user-fee condition reflects older wording that is absent from the current text.
3. **Polish raises credibility versus photorealism over-persuades.** Fogg and Robins and Holmes say a more polished look raises credibility; the virtual-heritage papers say a more photorealistic look raises belief in reconstructed details. They measure different things (site polish versus rendering realism) but point at opposite decisions when wow and honesty are weighed together.
4. **Emotional design helps; decorative extras hurt.** Brom (2018) finds small learning gains from friendly faces and warm colours; B1-R1's coherence and seductive-detail evidence says decorative extras hurt. The manipulations differ (colour and face design versus added irrelevant material).
5. **Dark immersion versus light-mode reading performance.** Museum and award sites favour dark UIs; the NN/g review favours light for reading (except low-vision cases such as cataracts).
6. **Brom numbers.** Manuscript d+ (0.387, 0.317, 0.327) versus published g+ per summary (0.35, 0.29, 0.27). Likely version and metric difference; not reconciled.
7. **Post-processing "for mobile".** A web-search summary called pmndrs postprocessing well suited to mobile; the library documentation says only that it merges passes and uses one triangle, and the 2014 Google case study advises removing post effects on mobile.
8. **Award-site trend claims.** B1-R1 already discarded the unsourced "61 percent of Awwwards winners are immersive 3D" claim; nothing in this route supports it either.
9. **"Free" fonts with a museum feel.** The museum faces people associate with the lineage (Minion Pro, Basier Circle, MoMA Sans, Druk, Sharp Grotesk) are commercial or unverified; only Cooper Hewitt is an open museum face.

---

## 4. Open questions and assumptions

Open questions
- Does a toon, painterly or outlined look survive the cube-to-equirect bake without seams or uneven line weight? No source; needs a spike on the build machine (disk-blocked).
- Do viewers (students, teachers) read a clay or schematic look as honest or as unfinished? No audience data found.
- Do cross-document View Transitions run inside an iframe (the WordPress oEmbed route in B1)? Chrome 126 said main frame only; current status not verified.
- Whether IHH wants to keep Montserrat and its red, yellow and blue palette, or accepts a separate look for the showcase; #ed1b24 text on white fails 4.5:1 so some brand pairs need care.
- How IHH treats a revocable, proprietary licence (GSAP) versus MIT (Motion) for a site it must maintain; no legal review done.
- Whether an AI-agent build drifts more in palette, geometry or lighting; no evidence.
- The primary texts of the Seville Principles and the Ename Charter were not read; the full DUX 2003 paper and the Rodriguez brochure study were not read.
- Real-device cost of each style on a mid-range Android and an older iPhone: unmeasured.
- Whether a dithered or high-contrast look breaks the 3 MB per-scene budget through compression behaviour: untested.

Assumptions
- The baked-panorama pipeline from B1 holds, so runtime style cost is limited to live overlays.
- The five inductee scenes are "recreations" in Seville terms (inferred from B1's evidence-tier discussion).
- Audience for credibility is teachers and students per the brief; no teacher data beyond B1-R1's interviews.
- Dates of unlabelled sources (forum threads, practitioner blogs) are unknown and marked.

---

## 5. Implications (no recommendation)

- **Style is a three-way trade, not a single axis.** Honesty signal, wow and agent consistency pull differently: clay and schematic looks have the best heritage evidence and the lowest cost but the weakest case for wow; painterly looks have the opposite profile; toon and low-poly sit between (a-1 table).
- **The literature's graded rule needs graded content.** "Photorealistic only for credible data, clay or NPR or transparency otherwise" presupposes a model with mixed certainty. If every constructed room is a recreation, a uniform non-photographic look makes the render style a constant, and the tier signal moves into labels, outline or texture conventions and the "how this was made" panel (the Burra wording explicitly allows identification through interpretation instead of appearance).
- **Colour cannot carry the tier signal alone.** WCAG 1.4.1 and a possibly duotone world mean tiers need line, pattern, icon or text cues in addition to any hue.
- **Photographs stay the record.** Both the colourisation-ethics sources and the truthiness research point at treating the archival image as untouched and putting any grading, depth or animation on the constructed layer.
- **Motion budget.** Parallax, camera fly-throughs, auto-rotate and page transitions each need a reduced-motion path; cross-document View Transitions would apply to Chrome, Edge and Safari only, so any Firefox or iframe case degrades to a plain load. Cost is measured only at about 70 ms LCP on repeat mobile views from one third-party data set.
- **Library choice carries a governance dimension.** MIT (Motion, Lenis, three.js) has no revocation or unilateral-amendment clause; the GSAP licence has both, though it is currently free for commercial use.
- **Brand constraint.** IHH's live site uses Montserrat and a red, yellow, blue palette; any showcase either inherits those tokens or defines a second set that a design-token file can map between.
- **Type licensing is not a constraint.** Every candidate family checked is OFL; the open museum-lineage face is Cooper Hewitt. The practical limits are legibility, spacing controls and contrast, not licences.
- **Design-system mechanics exist and are free**: DTCG 2025.10 tokens, Style Dictionary or Terrazzo, Playwright snapshots in a pinned environment, a frozen-render mode for golden images. DESIGN.md is alpha.
- **Credibility risk is not shown to come from stylisation itself.** The evidence ties credibility to polish and provenance cues; the one direct image-style test found no difference; but there is no teacher-specific or stylised-3D study, so the risk is neither confirmed nor ruled out.

---

## 6. Query log (all dated 2026-10-08)

### 6a. Google web searches (WebSearch), 59

1. London Charter computer-based visualisation principle 4 documentation transparency hypothetical reconstruction evidence
2. Seville Principles virtual archaeology authenticity scientific transparency visual representation
3. GSAP free licence Webflow acquisition all plugins commercial standard no charge
4. cross-document view transitions browser support Firefox Safari 2026 @view-transition navigation auto
5. Design Tokens Community Group format specification first stable version 2025.10
6. Stanford Web Credibility Project guidelines design look Fogg 2003
7. Style Dictionary v5 DTCG 2025.10 CSS variables output
8. aesthetic-usability effect perceived credibility website visual design trust Lindgaard Tractinsky
9. Firefox cross-document view transitions @view-transition status 2026 Interop
10. Cooper Hewitt typeface open source SIL OFL Chester Jenkins
11. Smithsonian design system typography fonts colours Public Sans web standards
12. Rijksmuseum design system typography colour digital design team
13. ICOMOS Ename Charter 2008 interpretation presentation visual reconstructions alternative reconstructions
14. Roussou Drettakis photorealism non-photorealism virtual heritage uncertainty
15. visualizing uncertainty archaeological 3D reconstruction transparency colour coding wireframe
16. Ename Charter 2008 text Principle 2 information sources visual reconstructions
17. Burra Charter reconstruction identifiable on close inspection; Venice Charter Article 12
18. museum white model massing model clay render virtual reconstruction hypothetical neutral colour
19. Rome Reborn, Digital Hadrian's Villa, Virtual Pompeii certainty colour coded hypothetical
20. Seville Principles Authenticity virtual reconstruction distinguish real restored hypothetical principle 4 text
21. three.js toon shading outline inverted hull vs post-processing performance mobile
22. Awwwards low poly 3D website three.js stylised museum educational history
23. paper cut-out layered diorama parallax website historical photographs 2.5D museum
24. Return of the Obra Dinn dithering shader three.js ordered dithering 1-bit WebGL
25. pmndrs postprocessing performance mobile merge effects EffectPass low-end
26. Playwright visual regression WebGL canvas flaky deterministic SwiftShader Docker platform snapshots
27. papercraft paper cut-out 3D website three.js (Awwwards only)
28. low poly stylised 3D website WebGL storytelling (Awwwards only)
29. toon shader outline stylised illustrated 3D site three.js (Awwwards, Codrops)
30. Tenement Museum virtual immigrant stories website design illustration style
31. Newman Garry photos truthiness nonprobative photographs
32. Robins Holmes aesthetics and credibility in web site design 2008
33. Atkinson Hyperlegible Next Braille Institute Google Fonts release 2025 OFL
34. dyslexia friendly fonts evidence Wery Diliberto Marinus letter spacing
35. dark mode vs light mode reading performance positive polarity Nielsen Norman Group
36. WCAG text over image background contrast technique scrim worst case 1.4.3
37. Fogg Soohoo Danielson Marable Stanton Tauber 2003 how do users evaluate credibility design look 46.1%
38. Wineburg McGrew lateral reading students judged credibility by appearance fact checkers
39. Brom Starkova D'Mello 2018 emotional design meta-analysis
40. illustration versus photograph perceived credibility stylised cartoon images
41. MoMA website typeface design system Order identity 2019 MoMA Sans
42. Rijksmuseum typeface Paul van der Laan Bold Monday licence house style palette
43. "Photos more credible, cartoons more persuasive" wind energy study
44. "How effective is emotional design" meta-analysis abstract effect sizes
45. Neues Museum Berlin Chipperfield restoration new additions distinguishable Venice Charter
46. virtual heritage level of uncertainty reconstruction user perception photorealistic misinterpret as fact
47. "Principles of Seville" ICOMOS 2017 ratified authenticity level of accuracy scientific transparency text
48. Valiant Hearts educational value historians classroom stylised primary sources
49. Pentiment art style illuminated manuscript woodcut historians praised accuracy
50. colourisation of archival historical photographs ethics archivists guidance
51. Material Design 3 HCT tone contrast guarantee 40 and 50
52. USWDS colour system grades magic number contrast
53. DESIGN.md design system file for AI coding agents tokens format Stitch AGENTS.md
54. Library of Congress website design typography colours design system
55. duotone treatment archival black-and-white photographs museum CSS blend SVG
56. Chrome removed SwiftShader automatic fallback WebGL headless Playwright CI
57. view transitions performance low-end mobile large snapshots INP
58. Strothotte Masuch Isenberg visualizing knowledge about virtual reconstructions of ancient architecture 1999
59. Zuk Carpendale Glanzman visualizing temporal uncertainty 3D virtual reconstructions VAST 2005

### 6b. Google Developer Knowledge MCP, 10

1. search_documents: cross-document view transitions @view-transition navigation auto browser support prefers-reduced-motion
2. search_documents: Google Fonts licensing open source OFL commercial use self-host
3. search_documents: prefers-reduced-motion animation accessibility vestibular disorders web.dev
4. search_documents: colour contrast accessibility text over images WCAG 4.5:1 Lighthouse
5. search_documents: view transitions same-document startViewTransition reduced motion animation none accessibility
6. search_documents: WebGL performance low-end mobile texture size draw calls antialias devicePixelRatio
7. search_documents: scroll-driven animations animation-timeline browser support performance compositor
8. answer_query: browsers supporting cross-document and same-document view transitions; progressive enhancement
9. search_documents: Core Web Vitals thresholds LCP INP CLS
10. search_documents: HCT colour space tone contrast ratio Material 3

### 6c. Context7, 16

Resolve library id (5): three.js; Motion; Playwright; postprocessing (pmndrs); Style Dictionary.
Query docs (11):
1. /mrdoob/three.js: MeshToonMaterial gradientMap NearestFilter
2. /mrdoob/three.js: OutlineEffect, OutlinePass, inverted hull, toonOutlinePass
3. /websites/motion_dev: reduced motion MotionConfig, animate() mini bundle size
4. /microsoft/playwright: toHaveScreenshot maxDiffPixels threshold update snapshots
5. /mrdoob/three.js: LUT pass, tone mapping options, output colour space
6. /microsoft/playwright: snapshotPathTemplate, launchOptions, reducedMotion context option
7. /pmndrs/postprocessing: EffectPass merging, resolution scale, performance
8. /style-dictionary/style-dictionary: DTCG `$value` `$type`, css/variables, themes
9. /websites/motion_dev: MIT licence, hybrid engine, scroll()
10. /mrdoob/three.js: flatShading, Lambert versus other materials
11. /microsoft/playwright: animations disabled, stabilisation loop, deviceScaleFactor

### 6d. Page fetches and shell reads (not counted against the quotas)

Page fetches (WebFetch or in-app browser), about 49: London Charter principles and documentation pages; GSAP licence (fetch and browser); caniuse JSON x2; designtokens.org; W3C DTCG announcement and format report; Seville sources (several failed or empty: smartheritage.com, sevilleprinciples.com, ISPRS PDF unreadable, MDPI 403); Internet Archaeology issue 72 article 13; Roussou and Drettakis (403); Awwwards pages (Mongols, Prometheus, Persepolis, WebGL menu); Getty Persepolis site; Codrops "Still" and "Dithering" (via browser after 403); JAC journal page (Ramsey et al.); Brom manuscript PDF; Ogleby PDF; Frischer and Stinson PDF; WCAG F83 and 1.4.1; Cooper Hewitt typeface page; credibility.stanford.edu; logo.si.edu (403); Material blog (redirect, empty); DESIGN.md README; USWDS colour page; Playwright snapshots docs; web.dev same-document Baseline post; corewebvitals.io; NN/g dark mode; Argos blog (404); IHH home page (computed styles via browser script).
Shell reads: caniuse JSON for view-transitions, cross-document-view-transitions, prefers-reduced-motion (scroll-timeline file names not found); npm registry for gsap, motion, lenis, three, postprocessing, style-dictionary, @playwright/test, @terrazzo/cli, pixelmatch and 10 font packages; google/fonts METADATA.pb for 16 families; `pdftotext` on four saved PDFs; HEAD checks on 18 example URLs; contrast ratios computed with a short Python script.
