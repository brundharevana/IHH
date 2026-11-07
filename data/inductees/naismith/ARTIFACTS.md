# James Naismith: artifacts and constellations

Run `naismith-artifacts-2026-10-20`. Adversary: Codex `gpt-6.1-sol` (codex-cli 0.162.1).
`validate.py naismith`: exit 0. Only `verified` items with an open licence (public-domain, cc0,
cc-by, cc-by-sa) from the holder's own rights words are embeddable; everything else is a link or a
recreation candidate. Captions and paragraphs restate verified facts only (fact ids given).

## Counts

| | Before (2026-10-20) | After |
|---|---|---|
| Media records | 48 | 51 |
| Usable (verified + open licence) | 3 (NAI-M-0003, -0004, -0032) | 4 (NAI-M-0003, -0032, -0049, -0050; NAI-M-0004 now link-only, see below) |
| Facts verified | 35 | 35 (+ NAI-F-0125 disputed) |
| Image files built (content/naismith/media-files.json) | 0 | 28 (book pages 1-26, two newspaper pages) |

The usable set is small: almost every Naismith original is held by Springfield College (personal,
non-commercial, educational use only), the University of Kansas (no rights statement beyond
"Library Use and Policies"), the Kansas Historical Society (commercial use needs permission) or
private collectors. loc.gov answered HTTP 429 to every search on 2026-10-20, so LoC searches for
more public-domain items (Spalding basket ball guides, 1936 Olympics photographs, YMCA Training
School views) were not run; that is the main open lead.

**LoC pass 2026-10-22 (run `naismith-loc-2026-10-22`):** LoC searched again (NAI-Q-0323 to -0331).
No new artifact (document or object) was found: LoC holds no Spalding basket ball guide image, no
1936 Olympic basketball photograph and no Y.M.C.A. France photograph; its "Naismith" photo records
are NAI-M-0001/-0002 (on file) and the 2019 Hall of Fame views. Eight public-domain basis photos
were added and verified (NAI-M-0059 to -0066; see ROOMS.md): they are place photographs for the
rooms, not artifacts about him.

**Private-writings rule (owner, 2026-10-20) applied with tools/set_authorship.py:** NAI-M-0003 private, authors Naismith (d. 1939, NAI-F-0037) and Gulick (d. 1918, LoC heading), published c1894 (NAI-F-0072): public-domain, verified. NAI-M-0049, -0050 private (newspaper), published 1908 / 1898 (holder's created_published field): public-domain, verified. NAI-M-0004 private (USIA copy of a Springfield College photograph; photographer and publication year undocumented): NARA "Unrestricted" alone is not a grant, so `unknown`, link-only (the earlier note already doubted it); owner may supply a publication basis. NAI-M-0051 private, author Naismith (d. 1939): the rule sets public-domain, but the item stays disputed (browser-only page, unreachable live) and its file host is not buildable.

## Artifacts by stop

### Stop 3. School for Christian Workers / YMCA Training School, Springfield (1890-1895)

| Media | Title (holder's) | Holder + id | Date | Rights | Pages | Size | Facts | Interaction |
|---|---|---|---|---|---|---|---|---|
| NAI-M-0003 | Basket ball. (1894) | Library of Congress, ca05024520 (gdcmassbookdig basketball00nais) | c1894 | "The books in this collection are in the public domain and are free to use and reuse." public-domain | 26 page images | 2098 x 3128 px (IIIF full) | NAI-F-0071, NAI-F-0072 | page-through (book) |
| NAI-M-0004 | Photograph of Dr. James Naismith with His First Basketball Team | NARA, NAID 12004702 (306-PSF-86-2445) | undated in the record | Unrestricted; private photograph, so `unknown` (link-only) | 1 | 3799 x 3048 px | NAI-F-0067, NAI-F-0078, NAI-F-0079, NAI-F-0080 | photo panel |

Link-only (Springfield College, rights-restricted; several disputed only because the CONTENTdm page
cannot be read live): NAI-M-0011 "Basketball Rules" (1893), NAI-M-0008 original application to
Springfield College, NAI-M-0009 autobiography (1891), NAI-M-0007 cabinet card (late 1880s),
NAI-M-0010 portrait c. 1893, NAI-M-0006 lantern slide. Lead, not staged: KU exhibit item 5288,
"1891-92 Catalog of the International YMCA Training School".

### Stop 5. University of Kansas, Lawrence (1898-1937)

| Media | Title | Holder + id | Date | Rights | Pages | Size | Facts | Interaction |
|---|---|---|---|---|---|---|---|---|
| NAI-M-0050 | The Topeka state journal (Topeka, Kansas), September 10, 1898, (THIRD EDITION) | LoC Chronicling America, sn82016014, page sequence 7 | 1898-09-10 | Chronicling America statement ("...more than 95 years ago are in the public domain in their entirety..."), public-domain (adversary-judged) | 1 page | 2812 x 3320 px built (IIIF pct:50) | NAI-F-0104, NAI-F-0105 | unfold / zoom to the article |
| NAI-M-0049 | The Topeka state journal (Topeka, Kansas), June 9, 1908, (LAST EDITION) | LoC Chronicling America, sn82016014, page sequence 7 | 1908-06-09 | as above, public-domain | 1 page | 5384 x 6509 px master | NAI-F-0103, NAI-F-0101 | unfold / zoom |
| NAI-M-0051 | James Naismith's medical license application | Kansas Historical Society, Kansas Memory item 215630 (Board of Healing Arts, License Application Files, Box 35) | 1902-02-04 | holder: "To order images and/or obtain permission to use them commercially, please contact the KSHS Reference Desk ..."; public-domain under the private-writings rule (author d. 1939); disputed (browser-only page, unreachable live) | 4 images (application + death notice) | not measured | NAI-F-0125 (disputed) | link only; recreation candidate as a document prop |
| NAI-M-0044 (basis photo) | Lawrence: today and yesterday (1913), page 21 "Robinson Gymnasium" | LoC 14022885 | 1913 | public-domain statement; disputed (adversary could not confirm the page shows the gymnasium without the page record, which loc.gov blocked) | 1 page | 2415 x 3460 | basis for NAI-F-0102 | room |

Link-only, verified but licence unknown: NAI-M-0036 faculty appointment card, NAI-M-0037 chaplain
1916, NAI-M-0038 1925 Jayhawker, NAI-M-0039 with Phog Allen 1932, NAI-M-0040 scrapbook page (KU);
NAI-M-0001 portrait with basketball and NAI-M-0002 fencing photograph (LoC, "No information on
creator or on reproduction rights" / "Rights status not evaluated").

### Legacy

| Media | Title | Holder + id | Date | Rights | Facts | Interaction |
|---|---|---|---|---|---|---|
| NAI-M-0032 | 4c Naismith - Basketball plate proof | Smithsonian National Postal Museum, npm_0.258777.7 | 1961-10-19 (plate proof) | CC0 (object page Usage field) | none yet | object (turn front/back) |
| NAI-M-0060, -0061 (basis photos, new 2026-10-22) | Naismith Memorial Basketball Hall of Fame exterior, day and dusk (Highsmith) | LoC 2019690414, 2019690512 | 2019-05-26 | public-domain, verified | NAI-F-0086 (room basis) | room backdrop for the Legacy constellation |

NAI-M-0032 is usable but cannot be built: tools/fetch_media.py only accepts files from LoC, NARA
and UCLA hosts (request below).

### Stops 1, 2, 4, 6 (Almonte, McGill, Denver, Berlin)

No usable artifact found. McGill Board of Governors minutes (NAI-M-0034, -0035) and the Burnside
Hall gymnasium photograph (NAI-M-0033) are shown on the KU exhibit only; McGill University
Archives holds them ("Please contact the University Archives reference desk ... regarding
copyright"). Berlin 1936: NAI-M-0040 (KU scrapbook, link) and NAI-M-0016 (Springfield College
clipping, link).

## Constellations

### Constellation A. "Thirteen Rules" (stop 3, Springfield)

- **Centre:** NAI-M-0003, "Basket ball." (1894), Library of Congress (book; page-through, 26 pages).
  Theme: Sport / Invention. Date: 1894 (c1894). Caption: "Basket ball, by James Naismith with
  Luther Halsey Gulick, published in New York City by American Sports Publishing Company, c1894."
  (NAI-F-0071, NAI-F-0072).
- Paragraph (NAI-F-0087, NAI-F-0078, NAI-F-0088, NAI-F-0090, NAI-F-0100, NAI-F-0085): Gulick
  challenged Naismith; the first game was played in fulfillment of an assignment given to Naismith
  to create a game that could be played indoors between the football and baseball seasons. Naismith nailed two peach baskets and wrote 13
  rules of the game. In December 1891 he invented basketball in Springfield, and his rules were
  published in January 1892 in the magazine The Triangle.
- Related items:
  | Item | Kind | Theme | Date | Caption | Facts |
  |---|---|---|---|---|---|
  | NAI-M-0004 | photograph (NARA, link only) | Sport | undated in record | Dr. James Naismith, a Springfield College instructor, with the "First Team". | NAI-F-0080, NAI-F-0079 |
  | Original 13 rules typescript, 2 pages | document, recreation candidate | Invention | 1891-12 | (owner approval needed) | NAI-F-0090 |
  | Peach basket and ball | objects, recreation candidates | Invention | 1891-12 | (owner approval needed; not preserved) | NAI-F-0088 |
  | NAI-M-0011 "Basketball Rules" (1893) | document, link only | Invention | 1893 | | |
  | The Triangle, January 1892 | document, lead (Springfield College) | Invention | 1892-01 | | NAI-F-0085 |
  | Gymnasium room (School for Christian Workers) | place, rebuilt room (basis photos restricted) | Place | 1891 | | NAI-F-0117 (single-source) |

### Constellation B. "Doctor of Physical Culture" (stop 5, Kansas)

- **Centre:** NAI-M-0050, The Topeka state journal, September 10, 1898 (newspaper page; unfold).
  Theme: Education / Sport. Date: 1898-09-10. Caption: "Naismith succeeded Rev. Hector Cowan as the
  new director of physical culture." (NAI-F-0104).
- Paragraph (NAI-F-0095, NAI-F-0096, NAI-F-0083, NAI-F-0104, NAI-F-0092, NAI-F-0103, NAI-F-0097,
  NAI-F-0037): In 1895 Naismith moved to Denver, and in 1898 he graduated from Gross Medical
  College. In 1898 he was hired by the University of Kansas to coach basketball, succeeding Rev.
  Hector Cowan as the new director of physical culture, and he taught physical education there.
  Robinson gymnasium was formally dedicated with James Naismith delivering the principal address.
  Naismith retired in 1937 and died on November 28, 1939, in Lawrence, Kansas.
- Related items:
  | Item | Kind | Theme | Date | Caption | Facts |
  |---|---|---|---|---|---|
  | NAI-M-0049 | newspaper page | Education | 1908-06-09 | Robinson gymnasium was formally dedicated with James Naismith delivering the principal address. | NAI-F-0103 |
  | NAI-M-0051 | document (link only) | Medicine | 1902-02-04 | James Naismith's application for a medical license (Kansas Memory). | NAI-F-0125 (disputed) |
  | NAI-M-0044 | building page (basis photo) | Place | 1913 | Robinson Gymnasium (pending re-judgement). | NAI-F-0102 (single-source) |
  | NAI-M-0039 | photograph (link only) | Sport | 1932 | James Naismith and Phog Allen. | |
  | Whistle | object, recreation candidate | Sport | | (private owner) | |
  | NAI-M-0032 | object (CC0) | Legacy | 1961-10-19 | 4c Naismith - Basketball plate proof. | (stamp fact not yet staged) |

## Recreation candidates (owner decides; label "Reconstruction based on [source]")

| Object | Holder | Reference photos | Why it matters |
|---|---|---|---|
| "Original 13 Rules of Basket Ball", typescript, 2 pages, with Naismith's ink note | David and Suzanne Booth; on display at the University of Kansas DeBruce Center | KU and press photographs (rights not open) | the founding document of the game (NAI-F-0090) |
| Peach baskets and the ball of the first game | not preserved | none; generic period objects | NAI-F-0088 |
| Naismith's coaching whistle (Rawlings) | private (sold at Lelands) | auction photographs (rights unknown) | object he used at KU |
| Medicine dosage cups and dental kit | private (Lelands) | auction photographs | his medical training (NAI-F-0096) |
| 1936 Berlin Olympics passport | private (Lelands) | auction photographs | NAI-F-0098 |
| Medical licence application, 1902 | Kansas Historical Society | NAI-M-0051 (4 images, permission needed for commercial use) | could be licensed instead of recreated |

## Rejected or not staged

| Candidate | Why |
|---|---|
| NARA "Naismith" searches | only NAID 12004702 concerns him; others are namesakes |
| Passport applications 1906-1923 | index roll (5361 images) not name-searchable; not pursued |
| LoC Spalding guides | LoC's are base ball guides only |
| Kansas Memory "James Naismith" (1920-1930) and "Naismith and Phog Allen" (1932) photographs | permission needed; the 1932 subject is already NAI-M-0039 |
| Smithsonian Open Access 3D | nothing for Naismith; DEMO_KEY rate-limited (HTTP 429) |

## Registry and tool requests (for the lead; not edited)

| Request | Detail / evidence |
|---|---|
| Add host `www.kansasmemory.gov` to the `kansas-historical-society` entry | page footer "Copyright © 2007-2026 - Kansas Historical Society"; records carry KSHS identifiers (DaRT ID) and call numbers of the State Archives. Then NAI-S-0090 can be typed primary and NAI-F-0125 re-judged. |
| `tools/fetch_media.py` HOLDER_FILE_HOSTS: Smithsonian (postalmuseum.si.edu -> ids.si.edu) | needed to build NAI-M-0032 (CC0) |
| Done 2026-10-22: Highsmith Hall of Fame views staged and verified (NAI-M-0060, -0061); LoC searches re-run (NAI-Q-0323 to -0331). Still open: `tools/fetch_snapshot.py` refuses the LoC book page record for NAI-M-0044 (sp=21) because `resource.fulltext_file` is the whole-book text and `fulltext_service` the page text; accept the page `fulltext_service` when `fulltext_file` is the book file | then re-judge NAI-M-0044 with the page record (sp=21) |
| Ask Springfield College / KU for permission or open licences | the 1891-1893 rules, application and Training School photographs |
