# B9 - Zero-risk scans: real museum interiors we can legally use

Date: 2026-10-12. Research spike only; no product code changed, nothing committed. Throwaway proofs are in `<session scratchpad>/spike-scans/` (called `T/` below): `T/www/m.html` (viewer), `T/fetchopt.sh` (download and compress), `T/shot.mjs` (screenshots), `T/glb/*-opt.glb` (compressed rooms). Compressed copies of the proof screenshots are in `docs/research/direction/spikes/b9-*.webp`.

Confidence tags: [H] measured, or read from a primary source this session. [M] from a search summary or secondary page. [L] inference, or not verified.

Follows `B8-photoreal-rooms.md`. B8 rejected the SuperSplat CC BY splats because the licence was only the uploader's claim.

## 0. Recommendation (read this first)

> **Three scans pass all four criteria. Each is published by the Swedish state body that runs the building, under CC BY 4.0. All are photogrammetry meshes (GLB), not Gaussian splats.**
>
> 1. **Glimmingehus, Borgstugan** (Swedish National Heritage Board, Riksantikvarieämbetet). A vaulted medieval hall with a central pillar and bare whitewashed walls: the best place to hang archival photos. **3.0 MB**, 170k triangles after compression. Best fit for criterion 2 (the room is empty).
> 2. **Skokloster Castle, The King's Hall** (Swedish National Historical Museums). A grand baroque hall with a stucco ceiling and 17th-18th-century royal portraits. The most "grand museum" of the three. 9.6 MB, 502k triangles.
> 3. **Hallwyl Museum, The Picture Gallery** (Swedish National Historical Museums). A skylit, barrel-vaulted picture gallery hung with Dutch and Flemish Golden Age paintings. Closest to the requested "skylit gallery". 5.5 MB, 303k triangles. Its walls are full, so our photos would have to hang over the old paintings or on easels.
>
> **Recommended:** Glimmingehus Borgstugan (with its sister rooms) as the main shell. The King's Hall or the Picture Gallery can serve one "grand" room. Credit each room as a CC BY 4.0 work, name the real place, and do not imply that the institution hosts or endorses IHH.
>
> Two limits stay open:
> - These are real named places where the inductees never were. A visible label is needed for honesty, not for law (see 5).
> - The meshes carry only 1024 px textures, so they look soft up close: realism is about 3.5-4 out of 5, below the B8 splats.
>
> No institution-published splat (CC0 or CC BY) of a gallery interior was found.

## 1. Candidates that pass all four criteria

Licence and metadata were read from the Sketchfab Data API (`https://api.sketchfab.com/v3/models/<uid>`) on 2026-10-12 [H]. Sizes and triangle counts are measured [H].

The GLBs were obtained without an account from the Objaverse 1.0 mirror, which holds Sketchfab's own GLB export (generator string `Sketchfab-12.65.0`):
- URL pattern: `https://huggingface.co/datasets/allenai/objaverse/resolve/main/<path>`.
- Dataset licence: ODC-By, with each object keeping its own licence [H, HF API].
- Sketchfab's own download requires a signed-in account (anonymous call: HTTP 401) [H].
- For production, the owner should download from the Sketchfab page with their own free account, so provenance runs straight to the publisher.

Pipeline (`T/fetchopt.sh`): gltf-transform 4.5.1 (MIT) `weld`, then `simplify` (ratio 0.3-0.6, error 0.0005), `join`, and `meshopt` (EXT_meshopt_compression).

### 1.1 Glimmingehus - Borgstugan (and Herregemaket)

| Item | Evidence |
|---|---|
| URL | https://sketchfab.com/3d-models/glimmingehus-borgstugan-modell-6-av-12-a399b4c349d64ec88e35515d1e86c95d ; sister room Herregemaket https://sketchfab.com/3d-models/0cf8ffdf594847da9b99500f7ac00d6b |
| Publisher | Sketchfab account `Riksantikvarieambetet`, the Swedish National Heritage Board. RAÄ is the state agency that manages Glimmingehus. The descriptions embed images from RAÄ's own server (`pub.raa.se`) [H]. A search shows RAÄ published the 12-model Glimmingehus series [M] |
| Licence | "CC Attribution", meaning CC BY 4.0 (`http://creativecommons.org/licenses/by/4.0/`), in the API `license` field; published 2020-10-01 (Borgstugan) and 2020-09-11 (Herregemaket) [H]. The description's "För bildrättigheter" link covers the annotation images, not the model [H, read] |
| Venue terms | The venue operator made the capture and set the licence itself, so no visitor-photography rule applies. RAÄ also publishes a guide that tells heritage bodies to publish 3D on Sketchfab: https://www.raa.se/in-english/outreach-and-exhibitions/guide-for-publishing-3d-models/ [H, page structure] |
| Contents | Bare whitewashed vaults, stone walls, plank floor, wall benches, central stone pillar. No artworks, no people, no logos in the views rendered. Herregemaket has a carved medieval coat of arms (public domain) [H, visual] |
| Format and size | Source GLB 10.7 MB (Borgstugan), 32.1 MB (Herregemaket). Compressed: **2.99 MB / 169,517 tris** and **4.65 MB / 266,639 tris**, each with 1-2 1024x1024 JPEG textures [H] |
| Screenshots | `spikes/b9-glimmingehus-borgstugan-desk.webp`, `spikes/b9-glimmingehus-herregemaket-desk.webp`, `spikes/b9-glimmingehus-herregemaket-phone.webp` |
| Realism (viewed) | Convincing stone-and-plaster room. Soft texture on close walls; no holes in the views used. About 4/5 [H, visual] |
| Fit | Many blank wall bays under the arches, ideal for framed archival photos. The mood is a medieval castle, not a gallery |

Also from RAÄ, CC BY: Frustugan (`5c5a648a…`), övre and nedre förstugan, Skytteloftet (an attic with timber posts), and Stora salen (`b6e081b2…`, 900k faces, not proofed). Two models are not downloadable: Dagligstugan (`f72e80eb…`) and its English copy (`76afc1c6…`) [H].

### 1.2 Skokloster Castle - The King's Hall

| Item | Evidence |
|---|---|
| URL | https://sketchfab.com/3d-models/d18155613363445b9b68c0c67196d98d |
| Publisher | Account `SkoklosterCastle`, display name "Skokloster Castle (Skoklosters slott)", linked to skoklostersslott.se [H]. Description credit: "Scan by Erik Lernestål" [H], a photographer at the National Historical Museums [M, realityscan.com]. The castle's own site credits its photos "Skokloster Castle/SHM (CC BY)" [H, page source] |
| Licence | CC BY 4.0 (API `license`), published 2017-08-30 [H]. The National Historical Museums release "3D models … under open licences (CC-BY)" [M, realityscan.com spotlight] |
| Venue terms | The capture and the licence come from the agency that runs the venue (the National Historical Museums, a government agency under the Swedish Ministry of Culture [M]) |
| Contents | 17th-18th-century royal portraits, including two equestrian portraits; 17th-century stucco ceiling; tiled stove; period chairs. All public domain by age [M; artists not individually checked]. No people or logos seen. A red rope hangs from the chandelier [H, visual] |
| Format and size | Source GLB 44.2 MB, 1M faces, one 1024x1024 texture. Compressed: **9.6 MB / 502,181 tris** [H] |
| Screenshots | `spikes/b9-skokloster-kings-hall-desk.webp`, `spikes/b9-skokloster-kings-hall-phone.webp` |
| Realism | Strong sense of a real grand room. Portraits blur up close. About 4/5 [H, visual] |

### 1.3 Hallwyl Museum - The Picture Gallery (and the Great Drawing Room)

| Item | Evidence |
|---|---|
| URL | https://sketchfab.com/3d-models/231fdb3e9e354c6faaa3c250f8c9988f ; Great Drawing Room https://sketchfab.com/3d-models/feb9ad17e042418c8e759b81e3b2e5d7 |
| Publisher | Account `TheHallwylMuseum`, display name "The Hallwyl Museum (Hallwylska museet)", linked to hallwylskamuseet.se. Credit "Scan: Erik Lernestål" [H]. The 2017 project scanned the Picture Gallery first, then the ten first-floor state rooms; the models are "free to download and to re-use under open licences (CC-BY)" [M, realityscan.com spotlight] |
| Licence | CC BY 4.0 (API `license`), published 2017-03-07 [H] |
| Venue terms | Visitor photography is for personal use only [M, Hallwyl visitor PDF]. That rule binds visitors, not the museum's own CC BY release. The museum's site credits its images "the Hallwyls Museum/SHM (CC BY)" [H, page source] |
| Contents | Dutch and Flemish Golden Age paintings (17th century), a carved column on a plinth, folding chairs, rope stanchions, a small red alarm box. No people [H, visual]. Paintings are public domain by age [M: collection described as Golden Age; individual works not checked] |
| Format and size | Source GLB 37.6 MB, 1M faces, one 1024x1024 texture. Compressed: **5.51 MB / 302,533 tris** [H] |
| Screenshots | `spikes/b9-hallwyl-picture-gallery-desk.webp`, `spikes/b9-hallwyl-picture-gallery-pair.webp` (both ends), `spikes/b9-hallwyl-simplify-300k-vs-157k.webp`, `spikes/b9-hallwyl-great-drawing-room-desk.webp` |
| Realism | The skylit gallery reads as real. Defects: holes in the skylight glass, an unscanned void past the stair landing, blurry paintings. About 3.5/5 [H, visual] |
| Fit | Matches "skylit gallery" best, but there is **no blank wall**. Hanging our photos means covering old paintings, or using easels or stands |

The Great Drawing Room (9.0 MB / 437,905 tris) shows baroque tapestries and wood panelling. It is a lavish but crowded room, a weaker fit.

## 2. Phone feasibility

| Room | Download (meshopt GLB) | Triangles | GPU textures (1024² RGBA + mips) | Fits today's 2.5 MB / 150k budget? |
|---|---|---|---|---|
| Glimmingehus Borgstugan | 2.99 MB | 169,517 | about 11 MB (2 textures) | Almost. Slightly over on both |
| Glimmingehus Herregemaket | 4.65 MB | 266,639 | about 5.6 MB | No; fits a 15 MB room |
| Hallwyl Picture Gallery | 5.51 MB | 302,533 | about 5.6 MB | No; fits a 15 MB room |
| Skokloster King's Hall | 9.6 MB | 502,181 | about 5.6 MB | No; fits a 15 MB room only with more reduction |

- Simplifying further breaks the mesh. A 157k-tri Picture Gallery (3.68 MB) showed many black cracks along texture seams (`b9-hallwyl-simplify-300k-vs-157k.webp`) [H]. A UV-aware simplifier (gltfpack, or Blender with seams protected) is needed to go lower [L].
- Frame rate: Apple M1 headless (Metal), all rooms loaded in 124-174 ms and rendered at the headless cap [H]. **Real-phone fps was not measured.** About 300-500k unlit triangles is normally fine on recent phones, but is a risk on low-end Android [L].
- Lighting: render unlit (`MeshBasicMaterial`), because the scan texture already holds the room's real light.

## 3. Near-misses and why they fail

| Candidate | Fails on | Detail |
|---|---|---|
| Hallwyl Upper Vestibule `e74928dc…` | 4 (quality) | CC BY, same publisher. The stair hall has large unscanned voids at our camera positions [H, rendered] |
| Fitzwilliam Museum galleries (`fitzwilliammuseum`, CC BY) | Not a scan; 2 | "Gallery 1" says "Created using SketchUp Pro 2020, nothing in this model is scanned" [H]. "Gallery 3 - Fitz Favourites" is also CG, with paintings that may be in copyright. Most other galleries are not downloadable [H] |
| Mia "Arts of Southeast Asia gallery" `79805169…` (CC0, Minneapolis Institute of Art) | Not a scan | A designed virtual gallery with scanned sculptures. Clean licence, but CG walls [H] |
| Petäjävesi Old Church `6f203e9e…` (Museovirasto / Finnish Heritage Agency, CC BY 4.0) | 4 (size) | 117.5 MB, 1.97M faces. A church interior, not a gallery [H] |
| Finnish National Museum `2250ba8f…` (Museovirasto, CC BY) | 2 / fit | Exterior only [H, thumbnail] |
| Morbase "Sala do Capítulo" `1fd2871b…` (CC0, Montemor-o-Novo virtual museum) | 1 (provenance), fit | Municipal-project account; the rights link to the convent was not verified. Contains an ossuary urn. The page embeds copyrighted TV theme audio, which shows careless rights handling [H] |
| Misiones Coloniales de Chihuahua (non-profit, many church interiors) | 2, 4 | Active churches with religious images and possibly people. 50-450 MB [H, listing] |
| artfletch (Hintze Hall, St Stephen Walbrook, …) and other individual uploaders (`trolleway`, `micropalaeontology`, `jimbogies`, …) | 1 | Uploader is not the rights holder of the space |
| Zenodo "3dbigdataspace" records of the Hallwyl rooms (e.g. https://zenodo.org/records/10364307) | 1 (provenance) | Mirrors of Objaverse ("Source: Objaverse 1.0 / Sketchfab") uploaded by a third party. Licence carried over as CC BY 4.0; use the original instead [H] |
| B8's SuperSplat splats (AGNSW, Hurstville, …) | 1, 2, 3 | Uploader assertion; in-copyright art; visitors visible (see B8) |
| Open Heritage 3D / CyArk open data | 1 | CC BY-NC 4.0 (non-commercial) [M] |
| Smithsonian Open Access 3D (CC0) | Fit | Objects (Apollo 11 interior, busts), no gallery rooms. The Smithsonian splat page (3d.si.edu/node/53) returned a service error twice, so it is unchecked [H] |
| Poly Haven / ambientCG | Format | CC0, but no scanned interior meshes; only HDRI panoramas (covered in B8 option A) [H, B8] |
| Wikimedia Commons 3D | 4 | STL only (untextured); textured glTF is still a prototype [M] |
| Polycam / Luma / SuperSplat public galleries | 1 | No institution-published gallery interior found; licences are uploader assertions [L, not exhaustive] |
| Korea Heritage Service (`KHS_Asset`, CC BY) | Fit | Palace furniture and props, not whole rooms [H] |

## 4. Integration notes

- **Splat vs mesh.** All passing candidates are meshes. The proofs use three.js `GLTFLoader` with `MeshoptDecoder` and a rotation-only camera (`T/www/m.html`, three 0.186.1). Spark (B8) is not needed for these rooms. A splat could be trained from the same room, but the institutions published only meshes; a self-trained splat would need the original photos, which are not public.
- **Scale.** The Picture Gallery GLB has odd units (0.37 x 0.23 x 0.79). The other rooms are about 11-28 units across. Each room needs a scale and camera-height calibration [H].
- **Sources for production.** Download from each Sketchfab page with an owner-held free account. Record the uid, licence URL and access date in the media ledger, the same way as `media.jsonl`.
- **Credit line** (CC BY 4.0 needs title, author, licence link and an indication of changes). Example: "Glimmingehus, Borgstugan. 3D scan: Riksantikvarieämbetet (Swedish National Heritage Board), CC BY 4.0. Reduced and recompressed for the web." [H, licence terms]
- **Texture ceiling.** Every GLB checked has 1024x1024 textures. Whether Sketchfab's "original format" download has higher-resolution textures is unknown.

## 5. Truth and brand caveats (not legal blockers)

- Each room is a real, named Swedish place that none of the inductees visited. The room needs an on-screen label, for example "Setting: a 3D scan of Glimmingehus castle, Sweden (c. 1500). Not connected to Einstein." This is the same issue B8 raised for AGNSW, but here it is honesty, not licence risk [L, project rule].
- CC BY 4.0 grants no endorsement (section 2(a)(6)) and no trademark rights. Name the institution only as the source of the scan; do not use its logo [H, licence text].
- Hanging photos over the Hallwyl paintings changes how public-domain works appear. That is legal, but it is a curatorial choice to flag [L].

## 6. Unknowns

- Real-device fps and memory for 170k-500k-triangle rooms (not measured).
- Whether Sketchfab's own downloads equal the Objaverse GLBs byte for byte, and whether higher-resolution textures exist [L].
- Individual painting attributions in the King's Hall and the Picture Gallery were not checked one by one. Both collections are 17th-18th century by publisher description [M].
- No legal review. The licence evidence is strong (state agencies licensing their own captures), but the owner may want a one-line email confirmation from RAÄ / SHM (`bilder@shm.se` is listed for image questions [M]).
- Glimmingehus Stora salen and Frustugan were not proofed.

## 7. Sources (accessed 2026-10-12)

- Sketchfab Data API: `/v3/models/<uid>`, `/v3/models?user=<username>`, `/v3/search?type=models&downloadable=true&license=cc0|by|by-sa`, `/v3/search?type=users`. Anonymous `/v3/models/<uid>/download` returns 401.
- Model pages: Borgstugan https://sketchfab.com/3d-models/a399b4c349d64ec88e35515d1e86c95d ; Herregemaket https://sketchfab.com/3d-models/0cf8ffdf594847da9b99500f7ac00d6b ; Stora salen https://sketchfab.com/3d-models/b6e081b28032427c9b3460d59c8054a2 ; King's Hall https://sketchfab.com/3d-models/d18155613363445b9b68c0c67196d98d ; Picture Gallery https://sketchfab.com/3d-models/231fdb3e9e354c6faaa3c250f8c9988f ; Great Drawing Room https://sketchfab.com/3d-models/feb9ad17e042418c8e759b81e3b2e5d7
- Objaverse 1.0: https://huggingface.co/datasets/allenai/objaverse (licence ODC-By; `object-paths.json.gz`).
- RealityScan spotlight on the Hallwyl scans: https://www.realityscan.com/spotlights/3d-museum-tour-of-hallwyl-house-attracts-fans-around-the-world
- RAÄ 3D publishing guide: https://www.raa.se/in-english/outreach-and-exhibitions/guide-for-publishing-3d-models/
- Hallwyl visitor information PDF: https://hallwylskamuseet.se/wp-content/uploads/2026/02/Visit-the-Hallwyl-museum-ENG.pdf (via search summary)
- Official sites, image credit lines: https://hallwylskamuseet.se/en/ , https://skoklostersslott.se/en/
- Wikimedia Commons LSH licence page: https://commons.wikimedia.org/wiki/Commons:LSH
- Zenodo API (`/api/records?q=Hallwyl`).
- CyArk open archive: https://cyark.org/about/our-journey-to-an-open-archive
- CC BY 4.0 legal code: https://creativecommons.org/licenses/by/4.0/legalcode
- gltf-transform 4.5.1 (MIT): https://gltf-transform.dev
