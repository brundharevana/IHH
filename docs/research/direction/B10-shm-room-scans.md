# B10 - SHM / RAA interior room scans (King's Hall style)

Date: 2026-10-12. Research only. No downloads beyond API metadata and 640 px thumbnails (viewed for scoring, kept in scratchpad). Nothing committed. Follows `B9-zero-risk-scans.md`.

Confidence: [H] read from the Sketchfab API this session. [M] from B9 or inference. [L] not verified.

## 1. Method

- Sketchfab Data API, no account: `/v3/models?user=<name>&count=24` with `next` cursor paging (downloadable and non-downloadable), then `/v3/models/<uid>` for licence, counts, tags, description.
- Accounts swept (user search for every SHM / RAA name I could think of): `SkoklosterCastle`, `TheHallwylMuseum`, `TheRoyalArmoury`, `livrustkammaren`, `historiska`, `Riksantikvarieambetet`, `maritima`, `arkeologerna`. The Livrustkammaren username in the brief is wrong: the real account is `TheRoyalArmoury` (plus a 1-model `livrustkammaren`) [H].
- No SHM or RAA account for Gripsholm, Medelhavsmuseet, Etnografiska, Armemuseum, Medeltidsmuseet exists on Sketchfab [H, search]. `lackoslott` (Lacko Castle, not SHM) has a King's Hall `ae89eaa9...` but it is not downloadable and licence is empty [H].
- `archives` field is **empty for anonymous API calls** on every model, so archive sizes and texture resolution are NOT exposed [H]. Sizes below come from B9's measured GLBs where available; texture size 1024 px per B9 [M].
- `faceCount` is Sketchfab's stored count: Skokloster and Hallwyl rooms are capped at about 1.0M faces (about 500k vertices), a decimated upload, not the raw scan [H].
- Licence: every listed room is "CC Attribution" (CC BY 4.0) in the API `license` field. Nothing is CC0 [H].

## 2. Counts per account (all models, then rooms)

| Account | Models | Downloadable | Interior rooms | Rooms CC BY + downloadable |
|---|---|---|---|---|
| SkoklosterCastle | 5 | 5 | 1 (King's Hall); rest are objects | 1 |
| TheHallwylMuseum | 13 | 13 | 13 (all rooms) | 13 |
| Riksantikvarieambetet | 27 (+ duplicates) | 23 | 11 Glimmingehus room models, each also as a "barnversion" copy with the same geometry, plus exterior; 3 not downloadable (Dagligstugan, its English copy, kitchen childversion) | 10 unique rooms (see 3) |
| TheRoyalArmoury | 13 | 13 | 0 (armour, helmets, a costume) | 0 |
| livrustkammaren | 1 | 0 | 0 | 0 |
| historiska | 74 | about 50 | 0 (objects, skeletal remains) | 0 |
| maritima | 86 | about 60 | 0 stately; Vasa hold and gun deck are ship interiors (`f505f3ea...`, `98286416...`, CC BY) | 0 usable |
| arkeologer | 74 | 9 | 0 stately (cellars, excavations); almost all not downloadable | 0 |

Total usable rooms: **24 unique** (1 + 13 + 10), of which only 1 is "King's Hall grade" baroque and about 4-5 are in the same stately family.

## 3. Candidate table (sorted by suitability)

Scores 1-5: A = style match to King's Hall, B = open wall/floor for easels, C = scan completeness. Total = A+B+C (max 15). Counts are API (faces / vertices). All CC BY 4.0, all downloadable. "GLB" = B9's measured compressed size where tested.

| # | Room | uid | Account | Faces / verts | Pub. | A | B | C | Total | Visual note |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | The King's Hall | `d18155613363445b9b68c0c67196d98d` | SkoklosterCastle | 999,999 / 499,996 | 2017-08-30 | 5 | 4 | 4 | 13 | Baroque hall, stucco ceiling, chequered stone floor, royal portraits, stove, central table. Reference room. GLB 9.6 MB |
| 2 | The Dining Room | `da3e970d523a46e4974b2357b6a9538e` | TheHallwylMuseum | 999,999 / 499,966 | 2017-11-27 | 4 | 3 | 4 | 11 | Neo-baroque panelling, chandelier, large leaded windows on one wall, one big painting over a hearth, laid table |
| 3 | The Great Drawing Room | `feb9ad17e042418c8e759b81e3b2e5d7` | TheHallwylMuseum | 999,999 / 500,680 | 2018-04-14 | 5 | 2 | 4 | 11 | Most sumptuous room: tapestries, carved ceiling, grand piano, gilded panelling. Crowded. GLB 9.0 MB |
| 4 | The Picture Gallery | `231fdb3e9e354c6faaa3c250f8c9988f` | TheHallwylMuseum | 999,998 / 499,601 | 2017-03-07 | 4 | 3 | 3 | 10 | Long skylit parquet gallery, walls hung full with Dutch/Flemish paintings, wide open floor. Skylight holes. GLB 5.5 MB |
| 5 | The Small Drawing Room | `3a6385844d0647d382a72661bbc556f7` | TheHallwylMuseum | 999,999 / 500,512 | 2017-12-08 | 4 | 2 | 4 | 10 | Carved-wood panelling, large tapestry, marble fireplace, red upholstered seats. Furnished |
| 6 | The Billiards Room | `79615d823a9149069dcd06c20bc9707f` | TheHallwylMuseum | 1,000,000 / 499,595 | 2018-02-05 | 3 | 3 | 4 | 10 | Wood-panelled, tapestry wall, big window bank, billiard table fills centre |
| 7 | The Morning Room | `338cfb58457f41078fc8af7730b52482` | TheHallwylMuseum | 999,999 / 500,181 | 2017-12-11 | 3 | 2 | 4 | 9 | Red-wall salon, painted ceiling, framed family portraits (identifiable people, see 4) |
| 8 | The Upper Vestibule | `e74928dc62fe457892e52dd97b6aa6e0` | TheHallwylMuseum | 1,000,000 / 499,385 | 2017-11-14 | 4 | 2 | 2 | 8 | Stucco stair hall, balustrade, walls covered in ancestor portraits. Unscanned voids (B9) |
| 9 | Glimmingehus Stora salen | `b6e081b28032427c9b3460d59c8054a2` | Riksantikvarieambetet | 900,078 / 449,980 | 2020-09-11 | 2 | 5 | 4 | 11 | Largest hall, heavy timber ceiling, plank floor, one tapestry, bare plaster walls. Medieval, not baroque. Not proofed in B9 |
| 10 | Glimmingehus Borgstugan | `a399b4c349d64ec88e35515d1e86c95d` | Riksantikvarieambetet | 282,402 / 141,202 | 2020-10-01 | 2 | 4 | 4 | 10 | Vaulted hall, central stone pillar and table, wall benches. GLB 3.0 MB (B9) |
| 11 | Glimmingehus Herregemaket | `0cf8ffdf594847da9b99500f7ac00d6b` | Riksantikvarieambetet | 885,740 / 442,943 | 2020-09-11 | 2 | 4 | 4 | 10 | Vaulted chamber, large fireplace, bare walls, flagstone floor. GLB 4.7 MB (B9) |
| 12 | Glimmingehus Frustugan | `5c5a648a43144f55a0d4a7fa58510504` | Riksantikvarieambetet | 887,305 / 443,777 | 2020-10-01 | 2 | 4 | 4 | 10 | Vaulted chamber, Gothic door, window niche, empty floor. Not proofed |
| 13 | Glimmingehus Skytteloftet | `91aee9ca2244404f92933bf1d7e95021` | Riksantikvarieambetet | 899,396 / 449,398 | 2020-10-01 | 1 | 5 | 3 | 9 | Open timber attic, 17 windows, posts and a bench. Not stately |
| 14 | The Armoury | `adbe88dcf04d4a87a4c2f62ed6ca0880` | TheHallwylMuseum | 1,000,000 / 499,289 | 2018-01-19 | 3 | 1 | 4 | 8 | Panelled room, walls covered in antique weapons display |
| 15 | The Porcelain Room | `407a75f63a624494a61da40f5cd07bd0` | TheHallwylMuseum | 999,999 / 498,424 | 2018-02-11 | 3 | 1 | 4 | 8 | Domed painted ceiling, shelves full of porcelain. No free wall |

Lower, listed for completeness (score A/B/C): Hallwyl Smoking Room `2247ed77...` (4/1/4; dark, crowded, large in-room painting); Glimmingehus Upper vestibule `c9320ac2...`, Lower vestibule `d8d72237...`, Attic/Vinden `6df7cd79...`, Cellar and kitchen `11418c6a...`, Larder `41abc6bc...` (all 1-2 style, not proofed; 450k verts each, the larder 400k); Hallwyl Serving Room `a36db9b3...` (2/3/4, kitchen cabinetry), Stables `82abdb57...` and Tack Room `7433d112...` (1-2 / 1-3, utility). Not downloadable, excluded: Glimmingehus Dagligstugan `f72e80eb...` / `76afc1c6...`, kitchen child-version `2c07bc98...`.

Duplicates: each RAA "barnversion" (child edition, `Glimmingehus ... barnversion N(11)`) has identical face and vertex counts to its adult model; same geometry with different annotation text, so I count one room per pair [H].

Scoring basis: thumbnails and descriptions only (no mesh opened this session), so A and B are judged from the beauty-shot thumbnail. C comes from B9's rendered checks where B9 tested the room, else assumed 4 from the identical capture pipeline [M].

## 4. Copyright and people check (metadata and thumbnails only)

- King's Hall: royal portraits (17th-18th c.), no visible people. Cleared in B9 as public domain by age [M].
- Hallwyl rooms are a furnished 1898-1920 home. The Morning Room description names "portraits of the Hallwyl daughters, great grandchildren and sons-in-law"; the Upper Vestibule has ancestor portraits (16th-19th c.). Early-20th-century portraits could still be in copyright if the painter died after 1955; **artist-by-artist check not done** [L]. Treat Morning Room and Upper Vestibule as lower-priority.
- Smoking Room, Picture Gallery, Small Drawing Room: large paintings and tapestries, mostly Golden Age or older [M]; Smoking Room and Dining Room paintings not attributed in descriptions.
- No visitors or staff visible in any thumbnail [H, visual]. Modern items seen in B9 (alarm boxes, rope stanchions) are in the Picture Gallery.
- Glimmingehus: no art; one tapestry in Stora salen. No people [H, visual]. The only extra rights note is the annotation images (RAA's "bildrattigheter" link), which cover the annotations, not the model [B9].
- The scans are published by the same museums that run the venues, under CC BY 4.0, so rights to the capture are clean [M, B9]. Attribution is still required per room: author (Erik Lernestal for SHM rooms, RAA for Glimmingehus), licence link, and a changes note.

## 5. Assignment proposal

Constraint: only **5 rooms really match the King's Hall style** (King's Hall itself, Dining Room, Great Drawing Room, Small Drawing Room, Picture Gallery; Morning Room and Upper Vestibule are weaker on completeness or portraits). There are 5 inductees wanting 2-5 rooms each plus the hallway, i.e. up to 26 slots against about 7 stately scans. **Rooms must repeat across inductees**, or the owner must accept the Glimmingehus medieval rooms (4 good, 3 more marginal) as the open-space alternative.

| Slot | Room | Why |
|---|---|---|
| Hallway | The King's Hall (`d1815561`) | Reference room, owner's choice, most open floor of the stately set |
| Inductee 1 | Dining Room, Picture Gallery, Small Drawing Room | Best stately style, three different moods |
| Inductee 2 | Great Drawing Room, Picture Gallery, Billiards Room | Great Drawing Room is the showpiece; Billiards for a looser room |
| Inductee 3 | Small Drawing Room, Dining Room, Morning Room | Panelled, tapestry rooms; Morning Room only after portrait check |
| Inductee 4 | Picture Gallery, Great Drawing Room, Smoking Room | Gallery reuse is acceptable because it is long and can be split by camera position |
| Inductee 5 | Dining Room, Billiards Room, Upper Vestibule | Vestibule is the weakest; fill with Glimmingehus if it stays voided |

Repeat count: Picture Gallery, Dining Room, Great Drawing Room and Small Drawing Room each repeat 2-3 times. Alternatively, swap in the Glimmingehus rooms (Stora salen, Borgstugan, Herregemaket, Frustugan) to avoid repeats; they have the best easel space but a different (medieval) look, so they break the King's Hall "grand baroque" brief. **Honest summary: there are not enough distinct baroque-style SHM rooms for 5 inductees x 2-5 rooms; plan on repeats or a mixed style.**

Reuse trick available regardless of count: one scan, several camera stations and different easel layouts, so repeats read as different corners.

## 6. Unknowns

- Archive sizes and texture resolution are not exposed anonymously (`archives` is empty). Only B9's GLBs are measured: King's Hall 9.6 MB, Picture Gallery 5.5 MB, Great Drawing Room 9.0 MB, Borgstugan 3.0 MB, Herregemaket 4.7 MB. All others unmeasured; assume about 9 MB compressed at 500k triangles [L].
- Textures are 1024 px in B9's four tested rooms; whether the Sketchfab "original" download has higher resolution is unknown.
- Real phone fps and memory unmeasured (B9 unknown). Each room is 400-500k verts after Sketchfab's own decimation; B9 shows going below about 300k breaks seams.
- Style and space scores are from thumbnails and descriptions, not from walking the mesh. Rooms not proofed in B9: Dining, Small Drawing, Billiards, Morning, Smoking, Armoury, Porcelain, Glimmingehus Stora salen and Frustugan.
- Individual painting and portrait artist attributions and death dates (Hallwyl rooms, King's Hall) are unchecked, so the in-copyright test is not finished.
- Whether SHM treats the CC BY release as covering later republishing by third parties without an email confirmation; B9 suggests `bilder@shm.se` [M].
- Sketchfab's list endpoint shows licence `None` for all models; only the detail endpoint returns it. A re-check just before download is cheap.
