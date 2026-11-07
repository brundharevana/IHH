# B12 - Museum-style interior models (scans and artist-made)

Date: 2026-10-12. Research only. Nothing downloaded except API metadata and 720 px thumbnails. Nothing committed. Follows `B9-zero-risk-scans.md` and `B10-shm-room-scans.md`.

Confidence tags: [H] read from the Sketchfab Data API (`/v3/search`, `/v3/models/<uid>`, `/v3/models?user=`, `/v3/users/<uid>`) or seen in a thumbnail this session. [M] carried over from B9/B10 or a secondary source. [L] inference, not verified.

Brief: a warm, stately, dignified interior for (a) a grand hallway with five inductee portraits on easels and (b) inductee rooms where photos and documents hang or stand with numbered hotspot rings. The owner likes Skokloster's King's Hall and Renend Studio's "Modular Vintage Living Room".

## 0. Recommendation (read this first)

| # | Model | Author | Licence | Faces / verts | Use | Risk |
|---|---|---|---|---|---|---|
| 1 | [The King's Hall](https://sketchfab.com/3d-models/the-king-s-hall-d18155613363445b9b68c0c67196d98d) (real scan) | SkoklosterCastle (Swedish National Historical Museums) | CC BY 4.0, downloadable | 999,999 / 499,996 | Grand hallway with the five portrait easels | Low |
| 2 | [Modular Vintage Living Room - Game Ready PBR](https://sketchfab.com/3d-models/modular-vintage-living-room-game-ready-pbr-d83c3f837bae4c9aa52fafc476500386) (artist-made) | RenendStudio (Renend Studio) | CC BY 4.0, downloadable | 105,279 / 56,409 | Inductee-room template and study corner; re-dressed per inductee | Medium |
| 3 | [Margam Castle - Entrance Hall](https://sketchfab.com/3d-models/margam-castle-entrance-hall-07507e2498d94a58819e2e461b170866) (real scan) | Greenhatch-Group (surveyor) for Swansea University and Neath Port Talbot Council | CC BY 4.0, downloadable | 999,999 / 709,849 | One inductee room with bare walls (best hanging space of the three) | Low-medium |

Plan in one line: the King's Hall as the hallway, Renend's room as a reusable, re-dressable inductee room, and Margam's Entrance Hall as a real-scan alternative for one or two rooms. Credit each as a CC BY 4.0 work, name the real place for scans, and do not imply endorsement.

Before Renend's room ships, one check is mandatory (section 4): download it and inspect texture and material names and embedded metadata for signs of a purchased kit.

## 1. Method

- Sketchfab search API, no account, `downloadable=true`, `license=by` and `license=cc0`, `sort_by=-likeCount`. 53 queries in 3 batches: museum interior, art gallery interior, gallery hall, grand hall, baroque hall, library interior, victorian interior, period room, exhibition hall, vintage room, manor hall, museum, palace interior, ballroom, victorian library, mansion interior, castle hall, vintage living room, victorian room, old library, study room, classic interior, renaissance hall, georgian interior, palace hall, gothic interior, throne room, drawing room, salon, hallway interior, modular interior, manor interior, museum hall, gallery, library, ellis island, victorian study, reading room, 1920s office, wood paneled room, oak panel, library room, historic house interior, stately home, great hall interior, picture gallery, portrait gallery, entrance hall, grand staircase, museum room, period interior [H].
- About 600 unique hits screened by name; about 30 interiors pulled for full metadata, uploader profile and other uploads; 19 viewed as thumbnails [H].
- `archives` is empty for anonymous calls, so texture resolution and archive size are not exposed for any model [H, same as B10].
- Other sources:
  - **Poly Haven:** CC0, but it has no interior architecture models. It does have useful CC0 props: Chandelier_01-03, GothicCabinet_01, GothicCommode_01, ClassicConsole_01, book sets. It also has interior HDRIs ("ballroom", "entrance_hall", "old_hall", "museum_of_ethnography") that could serve as lighting or backdrops [H, `api.polyhaven.com/assets`].
  - **ambientCG:** CC0 materials only, no interiors [M].
  - **Fab and BlenderKit:** free Fab items are mostly under the Fab Standard licence, and BlenderKit's default is "Royalty Free". Both fail our CC0 / CC BY rule, and neither was searched further [M].
  - **Smithsonian Open Access 3D:** CC0 objects only. No room interiors were found in the Sketchfab mirror [H, search hits were all objects].

## 2. Shortlist (12)

Scores 1-5: Style = warm, stately, dignified. Space = free wall and floor for hung or standing exhibits. Real = realism. Phone = size estimate after Draco or meshopt plus KTX2 compression [L unless stated].

| Model (uid prefix) | Author | Type | Faces | Separate meshes? | Style | Space | Real | Phone | Licence risk |
|---|---|---|---|---|---|---|---|---|---|
| **King's Hall** (d1815561) | SkoklosterCastle | scan | 1.0M | No (one baked mesh) | 5 | 3 | 5 | ~9.6 MB at 502k tris [M, B9 measured] | Low: the institution controls the space. Portraits are 17th-18th century (public domain) |
| **Renend Vintage Living Room** (d83c3f83) | RenendStudio | artist, modular | 105k | Yes: "30+ standalone props" [H] | 5 | 4 | 3.5 | ~5-10 MB, unknown textures [L] | Medium (section 4) |
| **Margam Entrance Hall** (07507e24) | Greenhatch-Group | scan (TLS + SfM) | 1.0M | No | 4 | 5 | 4 | ~4-6 MB at 300k tris [L] | Low-medium: surveyor-uploaded, but the owner (NPT Council) was a named project partner [H, description] |
| Hallwyl Great Drawing Room (feb9ad17) | TheHallwylMuseum | scan | 1.0M | No | 5 | 2 | 5 | ~5-6 MB [M] | Low |
| Hallwyl Upper Vestibule (e74928dc) | TheHallwylMuseum | scan | 1.0M | No | 5 | 2 (stairwell, walls full of portraits) | 5 | ~5-6 MB [M] | Low |
| Hallwyl Smoking Room (2247ed77) / Billiards Room (79615d82) | TheHallwylMuseum | scan | 1.0M each | No | 5 (dark wood, warm) | 2 | 5 | ~5-6 MB [M] | Low |
| Ballsalen, Frogner hovedgard (1ec8d370) | Tidvis (Oslo history-communication company) | scan | 999k | No | 3.5 (pale, 18th-century, empty) | 5 | 4 | ~5 MB [L] | Medium: made by a contractor, not Oslo Museum. No description of rights [H] |
| Margam Castle - The Staircase (770a8fe5) | Greenhatch-Group | scan | 981k | No | 5 (Gothic Revival lantern stair) | 1 | 4 | ~5 MB [L] | Low-medium |
| VINTAGE LIVING ROOM (5b1e8185) | oxygen3d | artist | 202k | Unknown | 4.5 (fireplace, study) | 2 (dense props) | 3.5 | ~8 MB, "2k textures" [H] | Medium-high: account of 64 "GAME READY ASSET PACK" uploads, including replicas of real firearms; asset-flip pattern; description has no credits [H] |
| Art Gallery (3c3248e0) | denis_cliofas | artist | 284k | Probably | 2 (cold grey, modern) | 5 | 3.5 | ~6 MB [L] | Low: established artist (joined 2017, ArtStation, 26 models) [H] |
| Gallery Museum Showroom Banquet Hall (7ab823cd) | jimbogies | artist | 29k | Probably | 2 (plain, office-like) | 5 | 2 | <2 MB [L] | Low |
| Glimmingehus Borgstugan (B9) | Riksantikvarieambetet | scan | ~170k after compression | No | 3 (medieval, whitewashed) | 5 | 4 | 3.0 MB [M, B9 measured] | Low |

Rejected (examples):
- **Tourist scans of spaces the uploader does not control:** artfletch "Hintze Hall" (photographed "as a tourist" at the Natural History Museum) and "Lincoln's Inn Drawing Room"; AlvaroL Hintze Hall [H].
- **Game rips:** windofglass "The Mansion interiors" (ripped from The Evil Within) [H].
- **No mesh:** giravolt "Palau Moja" is a point cloud with 0 faces [H].
- **Off-style:** Harrison House "Nursery Room" (IU Indianapolis Library, CC BY, real) is small and child-themed. Margam Drawing Room & Library and Dining Room are stripped to bare brick and carpet [H, thumbnails].

## 3. Top 3 rationale

### 3.1 Skokloster Castle, The King's Hall: the hallway

- **Fit:** the most "stately hall" model on Sketchfab under CC BY. It has a stucco ceiling, a chequered floor, a tiled stove, and a long axis that suits a walk-in camera [H, thumbnail].
- **Use:**
  - Five easels along the floor axis, one station per inductee portrait.
  - Its existing royal portraits read as "a hall of honour" context.
- **Limits:**
  - The walls are already hung, so our portraits must stand on easels.
  - The furniture is baked into the scan and cannot be removed. Clear floor space is about the central third.
  - Textures are 1024 px, so close-ups are soft [M, B9].
- **Risk: low.** The institution publishes the scan of its own building. The baked paintings are 17th-18th-century and public domain. Credit: "The King's Hall, Skokloster Castle, by Swedish National Historical Museums (SkoklosterCastle), CC BY 4.0".

### 3.2 Renend Studio, Modular Vintage Living Room: the inductee-room template and study corner

- **Fit:**
  - The owner's own pick: warm herringbone floor, dark coffered ceiling, gothic windows, bookcases, fireplace, chandeliers.
  - 105k faces, game-ready PBR, tagged for Unity, UE5 and Blender [H].
  - The only top candidate with separate meshes ("30+ standalone props") [H], so the sofas and tables can be removed for exhibit stands and the room dressed differently for each inductee. This is the main advantage over the scans.
- **Use:**
  - One shell reused for all five rooms (Einstein's study, Muir's reading room, and so on), with props and colour grading varied.
  - The bookcase and fireplace corner becomes the "study corner".
- **Limits:**
  - Realism is game-art (about 3.5/5), so it may sit oddly beside the photoreal King's Hall. Harmonise with one colour grade and the same lighting style.
  - The wall paintings are framed landscapes of unknown origin. Remove them or replace them with our exhibits; they are separate props.
- **Risk: medium** [H unless noted]:
  - Account created 2026-01-05, 33 models, 117 followers.
  - Almost every earlier upload is a small low-poly prop (300-25k faces). This 105k full environment (2026-08-26) is a large step up in scope.
  - Two earlier uploads are under "Free Standard", so the author picks licences deliberately.
  - The description has no third-party credits, and its preview images are hosted on imgur.
  - Nothing proves asset-flipping, but the "new account, sudden AAA environment" pattern is the red flag the brief names.
- **Mitigation before use:**
  1. Download the source and list texture filenames, material names, and FBX/GLB generator and author metadata.
  2. Check for Quixel, Megascans, Fab, TurboSquid, Unreal Marketplace and Evermotion naming, and for "Poliigon" or "Substance" sample names.
  3. Reverse-image-search the three imgur previews.
  4. Optionally ask the author through Sketchfab to confirm the room is all original work.
  5. Keep the CC BY credit: "Modular Vintage Living Room by Renend Studio, CC BY 4.0".

### 3.3 Margam Castle, Entrance Hall: the real-scan inductee room with open walls

- **Fit:** a Gothic Revival hall with oak linenfold-style wainscot, a fan-vaulted pier, a carved Gothic fireplace, a chequered floor and warm ochre walls. The upper walls are almost empty, which makes it the best hanging surface of the three. Real scan (terrestrial laser plus SfM, May 2024) [H].
- **Use:**
  - One or two inductee rooms (for example Muir or Naismith), with exhibits hung on the bare ochre walls and easels on the floor.
  - Sister scans exist from the same project, all CC BY and downloadable [H]. "The Staircase" (`770a8fe5`) is a spectacular vista, though poor for exhibits; the Drawing Room and Dining Room are bare brick and are rejected.
- **Limits:**
  - The room is smaller and plainer than the King's Hall.
  - Modern clutter is baked in: a smoke detector, and in the sister rooms fire-exit doors and cables.
  - Two framed prints hang on the walls. They are probably archive views of Margam [L]; cover them with our exhibits.
  - Texture resolution is unknown.
- **Risk: low-medium.** The uploader is the survey contractor, not the owner. However, the description names Neath Port Talbot Council (the owner) as a partner in the Margam Interiors project, which was publicly funded through the UK Shared Prosperity Fund, and the CC BY release fits that public-benefit purpose [H, description]. Credit: "Margam Castle - Entrance Hall, surveyed by Greenhatch Group Ltd for Swansea University, CC BY 4.0".

## 4. Asset-flip and rights checks done

| Model | Check | Result |
|---|---|---|
| Renend room | Account age, upload history, licence mix, description credits | New account, mostly small props, sudden full environment, no credits. Medium, unresolved until files are inspected [H] |
| oxygen3d room | Same | 64 "GAME READY ... PACK" uploads, including firearm replicas, one a month or more. Typical bundle-reupload profile. Not shortlisted for the top 3 [H] |
| denis_cliofas gallery | Same | Since 2017, ArtStation linked, consistent hand-made portfolio. Clean, but off-style [H] |
| Margam set | Description, institution link | Owner named as a project partner. Publicly funded [H] |
| Frogner ballroom | Uploader profile | Tidvis is an Oslo firm of historians and animators that made an 18th-century exhibition. Likely commissioned, but no rights statement [H]. Owner: Oslo Museum [L] |

## 5. Unknowns

- Texture resolution and download size for every model: the API does not expose `archives` anonymously [H].
- Renend room provenance until its files are opened (section 3.2).
- Whether Renend's framed paintings reproduce in-copyright art. They are removable either way.
- Margam's two framed prints: what they are, and their rights status [L].
- Visual mismatch between game-art (Renend) and photoreal scans (King's Hall, Margam) in one tour. This needs a spike render.
- Frogner ballroom: no rights statement. Confirm with Tidvis or Oslo Museum before use.

## 6. Files

- Thumbnails (from Sketchfab API thumbnails, 720 px webp, under 70 KB each):
  - `docs/research/direction/spikes/b12-1-skokloster-kings-hall.webp`
  - `docs/research/direction/spikes/b12-2-renend-vintage-living-room.webp`
  - `docs/research/direction/spikes/b12-3-margam-entrance-hall.webp`
- Raw API JSON and contact sheets, not in the repo: scratchpad `b12/` (`m_<uid>.json`, `grid.jpg`, `grid2.jpg`).

Overall confidence: high on licence, counts and authorship (read from the API). Medium on style and space scores (thumbnails only, no in-engine render). Low on phone sizes for models not measured in B9.
