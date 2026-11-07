# B2-R9: Scene feasibility scan for the five inductees

Route R9, batch 2. Researched and written 2026-10-08. All sources were accessed 2026-10-08 unless another date is given. This is a feasibility scan to pick production methods, not fact verification. No recommendation is made; section 5 lists implications only.

Builds on (not repeated): `INTERIM-1.md`, `B1-R2-scene-production.md` (method comparison, CC0 licence reads for Poly Haven, Kenney, Quaternius, Sketchfab status), `02-museum-best-practices.md`, and the 2026-10-07 content-availability counts in `04-content-availability-A.md` and `-B.md`. Where this report disagrees with or sharpens those, it says so in section 3.

---

## 0. Method, legend, limits

### 0.1 Tag legend (applies to every factual statement)

| Tag | Meaning |
|---|---|
| [P] | Read on a primary or institutional page in this session (URL cited). |
| [M] | Measured by my own query or API call on 2026-10-08 (counts, licence labels exactly as the platform returned them). |
| [L] | Lead, unverified: secondary page, search-engine snippet, uploader description, or my inference. |
| "stated rights" | Rights text copied as the record states it. It is not a legal clearance. Wikimedia Commons licence tags are uploader or community asserted. |

Confidence scale used in section 2: high = [P] or [M], consistent across two or more independent sources; med = a single [P]/[M] source, or an uploader-asserted label; low = [L] only or inference.

Evidence-availability scale used in the matrix (my definition):
- H = at least two distinct open items that directly depict the scene's subject, place and period, plus at least one institutional description.
- M = one open item, or only adjacent-period or adjacent-place items.
- L = no open depiction found; text only.

### 0.2 What was and was not done

- Tools used: Google web search (39 searches) and page fetches (36), Google Developer Knowledge (2), Context7 (6 calls), plus direct probes of the Smithsonian 3D site (about 270 requests via the in-app browser, because WebFetch gets HTTP 403 from 3d.si.edu), Wikimedia Commons API, Library of Congress JSON API, NARA catalog pages, Sketchfab search API, Poly Haven API, Poly Pizza pages, the Institute for Advanced Study repository API, Google Arts & Culture pages. Full list in section 6.
- No media was downloaded. The only file-body requests were HEAD requests to read sizes. No form was submitted (the Open Heritage 3D download form was not used).
- Library of Congress search endpoints timed out on roughly half of the calls. LoC counts below are floors, and item-level rights were read through the item JSON.
- Commons category listings are capped at 20 to 50 files per call; "N files" for a category is the category-info count when I state it, otherwise a listing.
- Statements about what a Commons, LoC or NARA file depicts come from titles, captions and descriptions; I did not view the images (no downloads).
- Disk was about 1.3 GiB free; I installed nothing and wrote only small scripts and JSON to the scratchpad.
- The Smithsonian Open Access API (rate-limited per B1-R2) was not used. I used the 3d.si.edu website search instead, which works from a browser session.
- The shared browser had another agent on tab `seed`; I worked only in my own tab.

---

## 1. Findings per sub-route

Sub-routes:
- 1.1 Smithsonian 3D coverage (item 4 of the brief)
- 1.2 Free 3D prop libraries (item 3)
- 1.3 Real places and open 360 or virtual tours (item 2)
- 1.4 to 1.8 Scene scans per inductee (items 1, 5, 6)
- 1.9 Sensitivity cross-cut (item 6)
- 1.10 Summary matrix
- 1.11 Counter-evidence (arguing against the obvious reading)

### 1.1 Smithsonian 3D (3d.si.edu)

**Finding 1.1.1: no Smithsonian 3D object exists for any of the five inductees.** [M]
Site search `https://3d.si.edu/explore?edan_q=<term>` returned "Your search found no results" for `einstein`, `lamarr`, `muir`, `naismith`, `albright`, and also for `yosemite`, `immigra`, `blackboard`, `chalkboard`, `slate`, `lantern`, `phonograph`, `vacuum tube`, `passport`, `liner`, `wagon` (Smithsonian 3D Explore, https://3d.si.edu/explore, 2026-10-08). Search is full text over record descriptions, so a name inside a description would also have matched. This agrees with, and strengthens, the 2026-10-07 "0 results" API-side reads in `04-content-availability-B.md`.

**Finding 1.1.2: thematic CC0 objects do exist that could stand in as period analogues.** [M]
Media-level CC0 confirmed by the site's CC0 facet (`edan_fq[media_usage]=media_usage:"CC0"`), not by the record's metadata line:

| Object (3d.si.edu) | Why it might be relevant | Scene link |
|---|---|---|
| Camilla Gottlieb's Suitcase, https://3d.si.edu/object/3d/camilla-gottliebs-suitcase:0a0dc543-3c9b-421d-95fe-5f60f23addab | Vienna 1938 Jewish refugee's luggage; the record says US quotas refused entry (read on the page) [P] | E1, A2 (sensitive: a real victim's object) |
| Theodore Roosevelt (NPG bas-relief, Sally James Farnham, 1906), https://3d.si.edu/object/3d/theodore-roosevelt:1788235b-d2bc-4287-8fb5-f2965a069fd9 | Same model on Sketchfab as "Theodore Roosevelt Bronze Relief", CC0, 150,000 faces | M1 |
| gymnasium suit, 3-piece (NMAH), https://3d.si.edu/object/3d/gymnasium-suit-3-piece:dcbeee14-b4ef-43a9-b541-c8402dd9400b; Gym Suit uniform worn at Alhambra High School (1918), https://3d.si.edu/object/3d/gym-suit-uniform-worn-alhambra-high-school:aad71ac7-170e-447f-8d0a-55f3d475b3b7 | Women's gym wear, 1800s and 1918 | N1 (period flavour only) |
| Ringside bell from Dundee's 5th St. Gym | A gym bell | N1 |
| Stereoscope (French, 1905-1920), https://3d.si.edu/object/3d/stereoscope:0f4ebbe5-7f32-4792-933c-296f328df4c5 | Viewing device for archival photo pairs | E-scenes, M1 |
| Page induction coil (US patent 76,654), Western Electric tangent galvanometer, Morse-Vail Telegraph Key, Chester telegraph relay, Henry trough battery, Davenport electric motor (patent 132), Abraham Lincoln's Patent Model, Refrigerator patent model by Thomas Elkins | 1860s-70s electrical and patent-model objects | E3 and L2 (patent-model analogues, US not Swiss, 1860s not 1900s) |
| Desk from the Hope School (Rosenwald school, 1925-1954); Portable desk Thomas Jefferson used to draft the Declaration | Period desks | E2, A4 |
| Cabin from Point of Pines Plantation (SC) | A historic cabin | M3 (weak fit; US South) |
| Sneakers worn by Julius "Dr. J" Erving | Basketball | N1 (wrong era) |

**Finding 1.1.3: record-level "Usage CC0" is not the same as media-level CC0.** [M]
Not CC0 at media level (CC0 facet excluded them): Basketball Uniform, 1922-1924 (the record metadata says "Usage CC0", but its 3D media usage tab says there are restrictions and non-commercial download only), Anastacio Atig Omandam's Steamer Trunk, Alexander Graham Bell Experimental Telephone, Typewriter used by Maya Angelou, Grand piano owned and used by Thelonious Monk. Contradiction in the other direction: Carnegie Mansion: Exterior shows "Usage conditions apply" in its metadata line but appears in the CC0 facet with other Carnegie Mansion objects. The per-media usage tab (`id="tab-usage-..."`) states "This media is in the public domain" for CC0 media. Source: object pages and facet queries on https://3d.si.edu, 2026-10-08.

**Finding 1.1.4: Smithsonian GLBs are large for a web scene.** [M]
For Camilla Gottlieb's Suitcase the page offers: 100k-triangle, 2048-px Draco GLB = 2,526,400 bytes; 150k-triangle, 4096-px GLB = 11,662,592 bytes; plus glTF, OBJ and USDZ downloads (HEAD requests to `https://3d-api.si.edu/content/document/3d_package:0a0dc543-3c9b-421d-95fe-5f60f23addab/resources/...`, 2026-10-08). INTERIM-1 sets about 3 MB per scene including artifacts, so one live Smithsonian prop at the smallest offered variant is about the whole budget. The glTF-Transform CLI documents `resize`, `webp`, `uastc`/`etc1s` (KTX2), `meshopt`, `draco` and a meshoptimizer-based `simplify` (Context7 `/websites/gltf-transform_dev`, CLI listing v4.4.1); not run here (disk).

**Finding 1.1.5: Context7 has no index for Smithsonian Open Access, the Smithsonian Voyager viewer, or the Sketchfab Data API.** [M]
Resolve calls returned unrelated libraries (Voyager the Compose navigation library, Sketchfab OAuth2 only). The 3d.si.edu pages themselves point to the viewer at https://smithsonian.github.io/dpo-voyager/ [M].

### 1.2 Free 3D prop libraries

Licences re-read or re-measured today; B1-R2's licence reads for Poly Haven, Kenney and Quaternius are not repeated.

**Finding 1.2.1: Poly Haven has 521 models; relevant CC0 items exist, but sizes matter.** [M]
`https://api.polyhaven.com/assets?t=models` returned 521 models (fetched 2026-10-08). Items that fit these scenes by name or category, with the glTF 1k bundle size from `https://api.polyhaven.com/files/<id>`:

| Poly Haven id | Possible use | 1k glTF bundle | Source polycount |
|---|---|---|---|
| `vintage_suitcase` https://polyhaven.com/a/vintage_suitcase | E1, L3, A2 | 4.29 MB (2k: 15.75 MB) | 16,474 |
| `standing_chalkboard_01` | E7, N2 | 2.62 MB | 2,372 |
| `SchoolDesk_01`, `SchoolChair_01` | E3 (clerk desk stand-in, style fit unverified) | 0.42 MB (desk) | 4,162 / 5,072 |
| `desk_lamp_arm_01` | E3, M2, L2 | 2.88 MB | 25,710 |
| `vintage_oil_lamp` | M2 | 2.07 MB | 7,208 |
| `wicker_basket_01`, `wicker_basket_02` | N1 (peach-basket stand-in, shape differs) | not read | 22,276 |
| `pine_tree_01` | M1 | 958.12 MB at 1k (17,427,094 polys) | unusable live |
| `ship_pinnace`, `modular_wooden_pier`, `life_jacket` | M4, L3 | not read | 183,837 / 84,780 / 8,968 |
| `wooden_bookshelf_worn`, `ArmChair_01`, `Rockingchair_01`, `metal_office_desk`, `mantel_clock_01`, `vintage_cabinet_01`, `book_encyclopedia_set_01` | E2, E6, M2, A4 | not read | 10k to 67k |

No Poly Haven model matched `typewriter`, `piano`, `globe`, `telescope` or `basketball` by name, category or tag (keyword scan of the 521 records) [M]. Poly Haven's CC0 licence was read by B1-R2 at https://polyhaven.com/license and is not re-read here.

**Finding 1.2.2: Sketchfab's public search API still works today and returns downloadable CC0 museum scans for some props and none for others.** [M]
`https://api.sketchfab.com/v3/search?type=models&downloadable=true&license=cc0` (queried 2026-10-08; `count=6`, so a "6" means at least 6):
- CC0 hits: telescope 4 (e.g. "Refracting telescope", 46,208 faces, https://sketchfab.com/3d-models/none-acefc3a7d4434628bd28f29fceb47b8b), microscope 4, globe 6, oil lamp 6, radio 6 (Philips 7-39 radio, Marconi radio set), film camera 2, gramophone 1, gymnasium 2 ("gymnasium suit, 3-piece" and "bloomers" by the Smithsonian), "Theodore Roosevelt Bronze Relief" (Smithsonian). Most museum scans run 40k to 640k faces.
- CC0 zero hits: player piano, typewriter, blackboard, campfire, steamship, ocean liner, peach basket, basketball hoop, clapperboard, Einstein, Hedy Lamarr, John Muir, Naismith, Yosemite, Half Dome, giant sequoia, Kramgasse, Charles Bridge, Prague Castle.
- CC BY (attribution) examples: "SS Normandie" 44,360 faces (https://sketchfab.com/3d-models/none-71d13eccd77a460ebe2a7538645a42e3); "Half Dome, Yosemite" 908,605 faces; "Yosemite Historic Mountaineers Cabin" 101,046 faces; typewriters (6 hits, 5,392 to 103,297 faces); "Upright Piano" 11,444 faces; "Gymnasium" 62,031 faces; "Basketball Court"; "Prague Castle" 1,517,663 faces; "United Nations Headquarters" 9,288 faces; "LeCoultre Camera" 417,447 faces; "Blackboard" (17 to 1,084 faces).
- Fan likenesses of the inductees exist under CC BY ("Hedy Lamarr", 694,610 faces; "Albert Einstein", 2,681,034 faces; "John Muir Statue", 20,363 faces). A CC BY licence on a model does not address publicity or likeness rights.
- Epic's 2024-10-22 notice (Sketchfab blog post 142060004160, cited by B1-R2) is the latest I can find; the API being live today does not settle the long-term status.

**Finding 1.2.3: Poly Pizza licence is per model; about a fifth of a 32-model sample was CC0.** [M]
Browser reads of model pages from search results for typewriter, piano, basketball, tent, ship, blackboard, radio, telescope (4 each, 2026-10-08): 7 of 32 read as CC0 (Armory_3D "Basket ball and hoop" https://poly.pizza/m/i3LLacyQP4; Quaternius "Tent" https://poly.pizza/m/5Q7qIrfDxA; Quaternius "Sail Ship" https://poly.pizza/m/cIzO4MBPqI; Quaternius "Ship" https://poly.pizza/m/mEQj2wZ3GC; Quaternius "Radio" https://poly.pizza/m/TPqvwkyWdV; Kenney "Radio" https://poly.pizza/m/ShNRjTDU3i; CreativeTrio "Telescope" https://poly.pizza/m/RjyTCQvA8b); 25 read as Creative Commons Attribution, including every typewriter, piano, blackboard and "Cruise ship" (Poly by Google imports). Parsing was by page text, so each licence must be re-read at asset time.

**Finding 1.2.4: Kenney packs are CC0 per pack page; Quaternius lists matching nature, interior and ship packs.** [P]
- Kenney Furniture Kit, 140 files, "Creative Commons CC0", v1.0 2018 (https://kenney.nl/assets/furniture-kit); Survival Kit, 80 models, CC0, v2.0 (https://kenney.nl/assets/survival-kit; the fetch tool's summary says tents and campfires, to be confirmed at download); Nature Kit, 330 files, CC0, 2020 (https://kenney.nl/assets/nature-kit).
- Quaternius pack list: Stylized Nature MegaKit, Ultimate Stylized Nature, Ultimate Nature, Ultimate House Interior, Ultimate Furniture, Furniture Pack, Ships Pack, Fantasy Props MegaKit; no camping, school or gym packs listed (https://quaternius.com/). Licence is by B1-R2's read of https://quaternius.com/faq.html; the home page itself states no licence.

### 1.3 Real places and open 360 or virtual tours

Nothing open-licensed and embeddable was found for any of the five inductees' real places. What exists is link-out or rights-restricted. [M/P, searched across 11 place-specific queries]

| Place | What exists | Licence or embeddability |
|---|---|---|
| Einstein-Haus, Kramgasse 49, Bern (apartment 1903-1905, museum with period furnishings) | Opening hours and exhibition description on tourism pages [L]; the IGE page on his patent-office workplace says nothing about virtual tours or a replica desk [P: https://ige.ch/en/about-us/the-history-of-the-ipi/einstein/einstein-at-the-patent-office]; `einstein-bern.ch/en/` returned 404 to WebFetch | No virtual tour found in three searches. Commons "Einsteinhaus Bern" category: 13 files, titles suggest exterior or plaque views only, 12 CC BY-SA or CC BY, 1 PD [M]. |
| Patent office, Genfergasse/Speichergasse, Bern | Room 86, third floor, lectern; July 1902 to autumn 1909 [P: IGE page above] | No tour. |
| 112 Mercer Street, Princeton | Private residence owned by the Institute for Advanced Study; Einstein reportedly asked that it never become a museum [L: Princeton Historical Society and Discover snippets] | No tour. IAS archives hold 1986 interior photographs (see E6). |
| Yosemite: Mariposa Grove, Glacier Point | Google Arts & Culture hub "United Parks of America" lists Yosemite, "The fight for Yosemite" (https://artsandculture.google.com/story/wgWR4r9pQQYRLg) and "Explore With John Muir" (https://artsandculture.google.com/story/dgXRokL0OWMAxw); the hub links a Street View position at lat 37.5013, lng -119.6129, which is in the Mariposa Grove area [M, observed 2026-10-08] | Google Arts & Culture and Street View terms; B1-R8 covers link-out versus embed. Commons has 12 files in "360° panoramics in California", none at Yosemite; 18 items across all of "360° panoramics in the United States" [M]. |
| John Muir National Historic Site, Martinez | Google Arts & Culture partner page, 62 items including "Desk" and "John Muir home" (https://artsandculture.google.com/partner/John-Muir-National-Historic-Site) [M]; CyArk and NPS terrestrial LiDAR captured 30 July to 1 August 2013, DOI 10.26301/0scs-yy66 [P: https://openheritage3d.org/project/0scs-yy66] | LiDAR licence "CC BY-NC-SA" (4.0 link on page); download is a form with name, email and organisation and a licence agreement; file size shown as "N/A GB". The legacy NPS virtual museum exhibit URL `nps.gov/museum/exhibits/jomu/...` now redirects to the NPS Museums index [M, curl]. Some GA&C asset titles carry "please contact park for photo usage information" [P]. |
| Glacier Bay / Muir Glacier | NASA Goddard 360 video "Fly Above Alaskan Glaciers in 360", PD per Commons, 3840x2048, 431,641,876 bytes, but Icy Bay, not Muir Glacier [M: https://commons.wikimedia.org/wiki/File:Fly_Above_Alaskan_Glaciers_in_360_Y2eysSmn9VU.webm] | PD; file too large to ship whole. |
| Springfield College (State and Sherman streets, site of the 1891 gym) | Springfield College page names the corner and does not say whether the building survives or mention any virtual tour [P: https://springfield.edu/where-basketball-was-invented-the-birthplace-of-basketball]; Hall of Fame "1891 Gallery" is mentioned in snippets [L] | No tour found. |
| University of Kansas, DeBruce Center and Allen Fieldhouse | Home of the Original 13 Rules document (bought at auction 2010 for $4.3 million per news snippets [L]); Kansas Athletics "Jayhawks360" has 75 panoramic spins by a vendor, Circlescapes [L] | Vendor-hosted, no open licence. |
| Prague | Not searched for open tours | Out of scope; Street View exists but is link-out only (B1-R8). |
| Washington: State Department Diplomatic Reception Rooms; National Archives Rotunda; United Nations HQ | DRR site has a "Virtual Tour" menu item; WebFetch got 403, so content and licence were not read [L]. UN virtual tour is a live guided tour, not a self-guided 360 [L]. NARA Rotunda: no virtual tour in results [L]. | Unknown. |

**Google Developer Knowledge** contains Street View Static API documents only: the metadata endpoint tells you whether a panorama exists at a location, is free of charge and consumes no quota, but needs an API key (Street View Static API metadata, https://developers.google.com/maps/documentation/streetview/metadata). It has no coverage maps for these sites. I did not create a key, so Street View coverage at the five sites is unmeasured; the only coverage evidence is the Yosemite link above.

**The Google Arts & Culture hub itself** (https://artsandculture.google.com/project/national-park-service, observed 2026-10-08) shows "200+ stories, 5,000+ images, 450+ virtual tours, 60+ videos", with Yosemite and Ellis Island ("Tour Ellis Island", https://artsandculture.google.com/story/ZwXRBph11x8RWw) and John Muir NHS as partners; the NPS release says launch 25 August 2026 and names neither Yosemite nor John Muir NHS (https://www.nps.gov/orgs/1207/national-park-service-and-google-arts-and-culture-launch-united-parks-of-america-virtual-hub.htm). A trade article dated 2026-08-27 said "30 virtual tours" (https://unofficialnetworks.com/2026/08/27/national-park-service-partners-with-google-for-new-virtual-hub-30-virtual-tours/).

### 1.4 Einstein: scene scans

Context for all Einstein scenes: Commons "Albert Einstein" has subcategories by year; LoC and NARA coverage is in `04-content-availability-A.md` (NARA NAID 596270 petition, LoC photo set). Rights caveat carried over: the name and likeness are licensed through the Hebrew University and an agent according to secondary sources (`04-content-availability-A.md`, [L]).

**E1. Arrival in the US, October 1933** (candidate from brief)
- Fact status: arrived New York 17 October 1933, sailed Southampton 7 October on the Westernland [L: auction listings and a biography snippet; one snippet says "Westmoreland", an error].
- (1) Open imagery:
  - Commons File:Einstein 1933 alt.jpg, PD per Commons, 2945x3758, "Distributed by ACME Newspictures", credit New York Daily News, dated 1933-10-18, caption "in Princeton" (https://commons.wikimedia.org/wiki/File:Einstein_1933_alt.jpg). PD label is uploader asserted; a news-agency photo from 1933 needs a renewal check.
  - Commons File:Einstein USA Schiff Hs 0304-1151-007.jpg, PD per Commons, ETH-Bibliothek, 3958x5969; the caption says the Belgenland gangplank at Antwerp, so it shows departure, not US arrival (https://commons.wikimedia.org/wiki/File:Einstein_USA_Schiff_Hs_0304-1151-007.jpg).
  - Commons video "Albert Einstein arrives in America from Nazi Germany in 1933" (Russian title), PD per Commons, Universal News via archive.org, 400x300 (listed in https://commons.wikimedia.org/wiki/Category:Albert_Einstein_in_1933); Internet Archive CEP_00_011 "Albert Einstein Comes To America" has an uploader-asserted public-domain licenseurl (from `04-content-availability-A.md`).
  - LoC Chronicling America newspapers 13 to 27 October 1933: the query "Einstein Westernland 1933" gave 104 results (floor), e.g. Washington Daily News 17 Oct 1933, https://www.loc.gov/item/sn82016181/1933-10-17/ed-1/ [M].
- (2) Place: the pier and ship do not survive as open 360; none found.
- (3) Props: Poly Haven `vintage_suitcase` (CC0); Smithsonian Camilla Gottlieb's Suitcase (CC0, refugee-specific); Quaternius Ships Pack (CC0, stylised); Sketchfab "SS Normandie" (CC BY, wrong ship). No CC0 liner or steamship found on Sketchfab.
- (4) Smithsonian 3D: none for Einstein.
- (5) Feasibility: constructed room Med (deck and cabin from generic references; no interior record of the real ship); archival-in-3D Med (one clearly US-side photo plus newsreel and newspapers); both Med-High.
- (6) Sensitivity: refugee flight from Nazi persecution; the newsreel caption itself says he was in danger. Avoid swastikas and persecution imagery.

**E2. Naturalization, 1 October 1940** (candidate)
- (1) Open imagery:
  - LoC 2004672481 "America gains a famous citizen", photo Al Aumuller, 1940 Oct. 1, stated rights "No known copyright restriction. For information see 'New York World-Telegram & ...'" (https://www.loc.gov/item/2004672481/) [P].
  - Commons mirror File:Albert Einstein citizenship NYWTS.jpg, PD per Commons, 2250x1820, caption names Judge Phillip Forman handing him the certificate (https://commons.wikimedia.org/wiki/File:Albert_Einstein_citizenship_NYWTS.jpg).
  - Commons File:Citizen-Einstein.jpg and Citizen-Einstein2.jpg, PD, 1940-10-01; 5 files in "Albert Einstein in 1940"; NARA petition NAID 596270 on Commons as File:Declaration of Intention for Albert Einstein (3678684847).jpg, PD.
- (2) Place: federal court in New Jersey [L]; no open tour.
- (3) Props: Poly Haven `metal_office_desk`, `wooden_bookshelf_worn`; nothing period-specific. Smithsonian: none that fit.
- (5) Feasibility: constructed Med; archival-in-3D High (one strong photo and a primary document); document-first High; both High.
- (6) Sensitivity: low. The petition carries personal details of a long-deceased person; no living-person data noted.

**E3. Bern patent office, 1902 to 1909 / Einstein-Haus** (candidate)
- Fact status [P]: room 86, third floor, corner of Speichergasse and Genfergasse, from July 1902 to autumn 1909, at a "famous lectern" (IGE page above).
- (1) Open imagery: Commons File:Einstein patentoffice.jpg (4360x5699, PD per Commons, credited to Lucien Chavan, cropped from a Hebrew University Archives copy, dated 1904 or 1905); File:Albert Einstein ETH-Bib Portr 05937.jpg (8206x11811, PD per Commons, ETH-Bibliothek, 1905); 3 patent-office photo versions and ETH portrait in "Albert Einstein in 1905" (https://commons.wikimedia.org/wiki/Category:Albert_Einstein_in_1905) [M]. The IGE page shows a lectern photograph of 1904 with no credit or licence [P].
- (2) Place: Einstein-Haus has an era-furnished apartment [L]; no tour; modern exterior photos CC BY-SA.
- (3) Props: Poly Haven `SchoolDesk_01` (lectern stand-in; style unverified), `desk_lamp_arm_01`, `stationery_supplies`; Smithsonian CC0 patent models (US 1860s) as analogues only.
- (5) Feasibility: constructed Med-High (room and furniture type are documented in words, one photo); archival-in-3D Med (one core photo); both High.
- (6) Sensitivity: low.

**E4. 1919 eclipse expeditions, Principe and Sobral** (candidate)
- (1) Open imagery:
  - ESO "Original image of the 1919 solar eclipse" and "Highest resolution image of the 1919 solar eclipse (potw1926a)", CC BY 4.0 per Commons, 23800x14191 and 24085x19423; ESO page (2019-07-01) calls it a digitally restored copy of the Sobral plate scanned by Landessternwarte Heidelberg-Königstuhl, credit "ESO/Landessternwarte Heidelberg-Königstuhl/F. W. Dyson, A. S. Eddington, & C. Davidson" (https://eso.org/public/images/potw1926a/) [P]. ESO's page does not print the licence name in the fetched text; CC BY 4.0 comes from the Commons file pages.
  - Commons "1919 Greenwich Observatory Sobral expedition": about 20 files, mostly Observatório Nacional plates and photos, PD per Commons; "Eclipse instruments at Sobral.jpg" PD; "1919 Eclipse expedition to test relativity.jpg" (Illustrated London News 22 Nov 1919 scan, 6189x8150, PD) [M]. "Eddington Memorial on Príncipe.jpg" is CC BY-SA 4.0 (2022).
- (2) Place: Roça Sundy (Príncipe) and Sobral; no open 360 found.
- (3) Props: sky needs data not props. Telescope: Sketchfab CC0 "Refracting telescope" (above) or Poly Pizza CC0 "Telescope" (CreativeTrio). A star-catalogue sky generator is plausible (Stellarium is GPL according to search snippets [L]); not tested.
- (4) Smithsonian 3D: none.
- (5) Feasibility: constructed High (sky dome plus coast is simple), archival-in-3D High (plates and expedition photos), both High.
- (6) Sensitivity: plantation setting on Príncipe under Portuguese colonial rule [L]; mention in context.

**E5. Solvay conference, Brussels, 1927** (candidate)
- (1) Open imagery: Commons category "Albert Einstein in 1927" has 8 PD-labelled versions of the Benjamin Couprie group photograph, the best "Solvay conference 1927 restored.jpg" at 4708x3227; the description names 29 people (I counted them) and cites ETH doi 10.3932/ethz-a-000046848 (https://commons.wikimedia.org/wiki/File:Solvay_conference_1927_restored.jpg) [M].
- (2) Place: the Solvay institute building in Brussels per the caption [L]; no tour.
- (3) Props: none required; picture frames are available.
- (5) Feasibility: constructed Med; archival-in-3D High (one large PD photograph with 29 labelled people, a natural hotspot set); both High.
- (6) Sensitivity: low.

**E6. Princeton study, 112 Mercer Street / IAS office** (candidate)
- (1) Open imagery:
  - IAS Archives "Albert Einstein's house, study", Gayle Kerley photograph, 1986, B&W, stated rights: "This item is protected by copyright and/or related rights. However, for this item, either (a) no rights-holder(s) have been identified or (b) one or more rights-holder(s) have been identified but none have been located. Researchers are free to use this item in any way that is permitted by the copyright and related rights legislation that applies to their use" (rightsstatements.org InC-RUU 1.0), https://albert.ias.edu/20.500.12111/1136, IIIF available [P]. Sibling records: bedroom, parlor (1986), and house exteriors where IAS states its own copyright or requires permission (15 of 278 search hits for "Einstein house study" inspected, mixed rights) [M].
  - Commons: 7 files of the house exterior, CC BY-SA 3.0 or 4.0, and one 1949 PD photo of Nehru and Indira Gandhi visiting.
- (2) Place: private residence, off limits [L].
- (3) Props: Poly Haven `ArmChair_01`, `wooden_bookshelf_worn`, `standing_chalkboard_01`.
- (5) Feasibility: constructed Med if the 1986 photographs can be used as reference; archival-in-3D Low (no clearly open interior photograph); both Low-Med.
- (6) Sensitivity: a private home the owner reportedly did not want to become a museum [L]; reconstructing it as a visitable room may conflict with that wish.

**E7 (ALT, evidence-based replacement). Pasadena blackboard and Mount Wilson, January 1931**
- (1) Commons File:Albert Einstein writing on a blackboard in Pasadena (1931).jpg, PD per Commons, Associated Press, 14 January 1931, 2294x3000, caption: board of the Carnegie Institute at the Mt. Wilson Observatory, Pasadena (https://commons.wikimedia.org/wiki/File:Albert_Einstein_writing_on_a_blackboard_in_Pasadena_(1931).jpg); "Albert Einstein in 1931" has at least 14 files (listing capped), mostly PD, including Einstein with Chaplin and Millikan [M]. The AP source and the PD claim are uploader-asserted.
- (2) Place: Mount Wilson Observatory (Hooker telescope category on Commons); no tour searched in depth.
- (3) Props: Poly Haven `standing_chalkboard_01`; Sketchfab CC0 refracting telescopes.
- (5) Feasibility: constructed High, archival-in-3D High, both High.
- (6) Sensitivity: low.

### 1.5 Muir: scene scans

**M1. Yosemite camp with Theodore Roosevelt, 15 to 17 May 1903** (candidate)
- Fact status [P]: NPS states May 1903, three days; night 1 Mariposa Grove, night 2 near Sentinel Dome in a snowstorm, night 3 at the edge of Bridalveil Meadow; Roosevelt signed the Yosemite Recession bill in June 1906; image credit is the Library of Congress photograph at Glacier Point (https://www.nps.gov/jomu/learn/historyculture/john-muir-and-president-roosevelt.htm).
- (1) Open imagery:
  - LoC 93503130, "[Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903]", c1906 [photo taken 1903], stated rights "No known restrictions on publication."; web JPEG 1024x637; TIFF master 42,185,854 bytes (https://www.loc.gov/item/93503130/) [P/M].
  - LoC Panoramic Photographs collection: 31 results for "Yosemite", e.g. "Panorama Yosemite" c1899 (https://www.loc.gov/item/2007660599/) and "Upper Yosemite" c1911 (https://www.loc.gov/item/2007660622/), stated rights "No known restrictions on publication."; web JPEG 1429x420 (so masters are needed); TIFF master of the 1899 item is 5,050,802 bytes [M]. Pixel dimensions of masters were not read.
  - LoC photochroms, 6 Yosemite results c1898 (e.g. https://www.loc.gov/item/2008678186/), rights not read.
  - Commons "Historical images of Grizzly Giant": at least 25 files labelled PD or "No restrictions" (NYPL plates, 1866 and 1870; California Historical Society c1902; listing capped at 25) [M]. The CHS horseback photo of Muir and Roosevelt is noted as "No known copyright restrictions" in `04-content-availability-B.md`.
- (2) Place: Mariposa Grove and Glacier Point exist today; Street View and Google Arts & Culture link-outs only (section 1.3).
- (3) Props: Kenney Survival Kit and Nature Kit (CC0), Quaternius nature packs (CC0), Poly Pizza Quaternius "Tent" (CC0); Sketchfab CC BY photogrammetry "Half Dome, Yosemite" (908,605 faces) as a reference only; Poly Haven pine tree is unusable live (958 MB at 1k).
- (4) Smithsonian 3D: Theodore Roosevelt bas-relief (CC0) as a prop on a camp table; nothing for Muir or Yosemite.
- (5) Feasibility: constructed High; archival-in-3D High (wrap-around panoramic strips plus one figure photograph); both High. This is the best-evidenced scene in the set.
- (6) Sensitivity: Yosemite is homeland of the Ahwahneechee and neighbouring peoples; the 1903 trip fed the transfer of the valley from state to federal management [L for Indigenous history; P for the transfer]. Roosevelt's wider record is contested [L].

**M2. The "scribble den", Strentzel-Muir House, Martinez** (candidate)
- Fact status: [P] Google Arts & Culture item "Desk" (contributor NPS John Muir NHS): "Muir converted one of the bedrooms into his private retreat, calling it the Scribble Den" (https://artsandculture.google.com/asset/desk/nwEKAXU5NCLBzw). [L] An NPS Historic Furnishings Report by Mary Grassick (Harpers Ferry Center), approved 15 November 2005, discusses the Scribble Den at about page 66 (search snippet); its `nps.gov/parkhistory/online_books/jomu/strentzel-muir_hfr.pdf` URL returned an HTML index page, not a PDF, on 2026-10-08, so the report was not read.
- (1) Open imagery: no open interior photograph found. Commons "John Muir National Historic Site" has 27 files, exteriors, garden, windmill, sequoia, no interiors [M]. GA&C holds 62 NPS items; the original NPS slideshow page for the desk now redirects to the NPS Museums index [M]. At least one GA&C asset title says "please contact park for photo usage information" [P].
- (2) Place: the site is open to visitors (hours on the GA&C partner page [P]). CyArk and NPS LiDAR, CC BY-NC-SA, form-gated, captured 2013 (section 1.3). I did not download it.
- (3) Props: Poly Haven `wooden_bookshelf_worn`, `Rockingchair_01`, `vintage_oil_lamp`; Smithsonian none that fit (the Jefferson portable desk is the nearest analogue).
- (5) Feasibility: constructed Med-High if the Historic Furnishings Report is obtained and LiDAR geometry is allowed; archival-in-3D Low-Med (rights unclear); both Med.
- (6) Sensitivity: low; the LiDAR's non-commercial and share-alike terms are the constraint.

**M3. Arrival in Wisconsin, 1849 (Fountain Lake farm, then Hickory Hill)** (candidate)
- Fact status: [L] family emigrated 1849; Fountain Lake Farm on 160 acres, then Hickory Hill about four miles away (Sierra Club exhibit pages, https://www.sierraclub.org/john-muir-exhibit/visit-john-muir-s-wisconsin-farm, snippet only). [P] NPS (earlier report) gives 1849 and Milwaukee.
- (1) Open imagery: none found. Commons has no category for the farm. Muir's own text, "The Story of My Boyhood and Youth" (1913), is public domain (cover scan on Commons, "No restrictions") [M].
- (2) Place: a Marquette County park on the former farm site, now called Ennis Lake [L]; no tour.
- (3) Props: Kenney Nature Kit, Quaternius nature, Poly Haven crates and barrels.
- (5) Feasibility: constructed Med (landscape from text); archival-in-3D Low; both Low-Med.
- (6) Sensitivity: low.

**M4. Glacier Bay and Muir Glacier, Alaska** (candidate "glacier/Alaska")
- Fact status: [L] Muir visited Glacier Bay in 1879 and 1880; Harriman Alaska Expedition 1899. Not read on an institutional page.
- (1) Open imagery:
  - LoC "photos" search for "Muir Glacier Alaska": 14 results, e.g. "Steamer TOPEKA at Muir Glacier, Alaska" 1895, stated rights "No known restrictions on publication." (https://www.loc.gov/item/2006675650/); "Muir Glacier, Glacier Bay, Alaska" c1900, stated rights "Rights status not evaluated." (https://www.loc.gov/item/2024686354/); LoC panoramic "Muir Glacier looking down Uzron" 1899 (https://www.loc.gov/item/2007661341/) [P/M].
  - Commons "Muir Glacier": 137 files and 14 subcategories including 1887, 1895, 1900, 1910 and 1977; "Harriman Alaska Expedition" 65 files plus "Images from the Harriman Alaska Expedition Collection" 254 files [M].
  - Repeat photography August 1941 versus August 2004 (USGS, NSIDC and Glacier Bay archive credits), described at EGU: "Image of the week: 63 years of the Muir glacier's retreat" (https://blogs.egu.eu/divisions/cr/2015/10/30/image-of-the-week-63-years-of-the-muir-glaciers-retreat/) [L: blog summarising USGS pages].
  - NASA Goddard 360 flight video over Icy Bay (PD per Commons, above).
- (2) Place: Glacier Bay National Park; the glacier terminus retreated about 4 miles northwest out of the 2004 frame [L, EGU].
- (3) Props: terrain is procedural; Poly Haven `ship_pinnace` (CC0) for a boat.
- (5) Feasibility: constructed Med; archival-in-3D High (many photographs of the glacier from 1887 onward, none seen of Muir there); both High.
- (6) Sensitivity: Tlingit homeland (the LoC title "Muir Glacier (in Hoonah territory)", https://www.loc.gov/item/2020637542/) [P]; climate-change framing.

### 1.6 Lamarr: scene scans

**L1. Hollywood set, "Algiers" (1938)** (candidate)
- (1) Open imagery: Commons "Algiers (film)" has 14 files, all PD per Commons, plus "Algiers (1938).webm" at 466x360 (credit "YouTube") and a "film screenshots" subcategory; the largest still is 4000x3059 (https://commons.wikimedia.org/wiki/Category:Algiers_(film)) [M]. Internet Archive "Algiers_" has an uploader-asserted public-domain licenseurl and is about 2,255 MB; Wikipedia states a missed renewal (both from `04-content-availability-B.md`, [L]).
- (2) Place: a studio set; no real place.
- (3) Props: Poly Haven `vintage_video_camera` and `filmstrip_projector_8mm` (not 1930s equipment), Sketchfab CC BY "LeCoultre Camera" (417,447 faces); no CC0 clapperboard.
- (5) Feasibility: constructed Low-Med (no set plans found); archival-in-3D Med (stills and film frames, low resolution); both Med.
- (6) Sensitivity: Lamarr's likeness and estate publicity rights (`04-content-availability-B.md`, [L]); other actors in the stills have their own rights; the film's colonial-Casbah depiction is a stereotype [L].

**L2. Invention workbench: frequency hopping with George Antheil** (candidate)
- Fact status [P]: US Patent 2,292,387, co-inventor George Antheil, filed 10 June 1941, granted 11 August 1942, Antheil's player-piano knowledge helped (National WWII Museum, https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); National Inventors Hall of Fame (inducted 2014) lists a patent document image, a war bonds advertisement photograph and display images (https://www.invent.org/inductees/hedy-lamarr).
- (1) Open imagery: Commons "United States patent 2292387": 46 files including the pages of "Patent Case File No. 2,292,387, Secret Communication System ... DPLA" (PD per Commons; the full prosecution file); Antheil portraits and "George Antheil noisemaker", 8 PD files [M]. Antheil's description of Lamarr's "drawing room" with drawing boards is in a secondary page [L]; no open photograph of her workspace.
- (2) Place: none.
- (3) Props: Poly Haven `desk_lamp_arm_01`, `stationery_supplies`, `clipboard`, `wooden_bookshelf_worn`. No CC0 piano or player piano on Poly Haven or Sketchfab; CC BY options are Sketchfab "Upright Piano" (11,444 faces) and Poly Pizza "Piano" (Poly by Google).
- (4) Smithsonian 3D: none (the only piano is the Monk grand, not CC0 media).
- (5) Feasibility: constructed Med; document-first High (the whole patent file is open); both High.
- (6) Sensitivity: low; weapons context is a radio-guided torpedo.

**L3. Aboard the Normandie, 1937** (candidate "arrival 1937 (lead)")
- Fact status [P]: Lamarr and Louis B. Mayer were both aboard the Normandie to New York in 1937 and agreed her new name on the voyage (National WWII Museum, link above).
- (1) Open imagery: Commons "Normandie (ship, 1935)" about 30 files plus "Interiors of the Normandie" 13 files: NYPL photograph of the ship at Pier 88, 14 September 1938 (PD per Commons), Gallica images (PD per Commons), CC0 interior photographs uploaded 2024-07-24 by user HerRobin as "own work" (subject and provenance unverified: could be a model or exhibit) [M]; LoC 97504351 "S.S. Normandie arriving in New York Harbor on maiden voyage", c1936 Jan. 27, stated rights "No known restrictions on publication. No renewal in Copyright office. (verified in 1998)" (https://www.loc.gov/item/97504351/) [P].
- (2) Place: none open.
- (3) Props: Sketchfab CC BY "SS Normandie" 44,360 faces; Poly Haven `vintage_suitcase`, `modular_wooden_pier`, `life_jacket`.
- (5) Feasibility: constructed Med; archival-in-3D Med; both Med-High.
- (6) Sensitivity: Lamarr was fleeing Austria and a controlling first marriage [L]; handle with care.

**L4. War bond drives, 1942, and the Hollywood Canteen** (candidate)
- Fact status [P]: $25 million in war bonds in 1942, a staged "kiss auction", volunteer at the Hollywood Canteen after its October 1942 opening (National WWII Museum, link above).
- (1) Open imagery: NARA "S-4921 Hedy Lamarr Film Beauty and U.S. Canteen Hostess" (NAID 148960657, Office of War Information Feature Stories, stated "Access: Unrestricted", "Use: Unrestricted") is a file unit marked "NOT YET AVAILABLE ONLINE" (https://catalog.archives.gov/id/148960657) [P]. Commons has a 1942 Colonial Theater advertisement (PD, 1917x2537), "Hedy Lamarr - Screenland (October 1942).png" (PD) and "Hedy Lamarr Jimmy Stewart.jpg" (PD) [M].
- (2) Place: none.
- (5) Feasibility: constructed Low-Med; archival-in-3D Low-Med; both Low-Med.
- (6) Sensitivity: likeness and the "sold kisses" framing.

### 1.7 Albright: scene scans

**A1. Prague childhood and flight (1937, 1939, 1948)** (candidate; all leads)
- Fact status [P] history.state.gov: born 15 May 1937 in Prague; family immigrated 1948 to Denver after the communist coup; citizen 1957 (https://history.state.gov/departmenthistory/people/albright-madeleine-korbel). [L] The 1939 flight to London, the 1941 conversion, and the deaths of three grandparents in the Holocaust (search snippets from Wikipedia, Algemeiner, J. Weekly, Unpacked); she said in 1997 her parents had not told her of their Jewish ancestry [L].
- (1) Open imagery: no family or personal photographs found openly licensed. Generic Prague: LoC photochrom prints c1890, 12 results for "Prague" and 8 for "Prag" (e.g. https://www.loc.gov/item/2002708487/ and https://www.loc.gov/item/2017659163/); I read one LoC Prague print, 94512595, "Prague. Old bridge over the Moldau", c1860-1890: "No known restrictions on publication in the United States. Use elsewhere may be restricted by other countries' laws." [P]. Commons "Prague in the 1930s": about 21 files, mostly PD (two CC BY-SA, one "No restrictions"), mostly postcards and suburbs, plus "1937 in Prague", "1938 in Prague" and "Charles Bridge in the 1930s" subcategories [M].
- (2) Place: Prague; no open 360.
- (3) Props: Sketchfab CC BY "Prague Castle" (1,517,663 faces) and "Old Town Square" (1,540,319 faces); no CC0.
- (4) Smithsonian 3D: none.
- (5) Feasibility: constructed Low (no interior evidence for the childhood home); archival-in-3D Med for generic Prague with a period mismatch (c1890 versus 1937); both Low.
- (6) Sensitivity: HIGH. See 1.9.

**A2. Arrival in the US, November 1948, SS America** (candidate; lead)
- Fact status [L]: sailed Southampton 5 November, arrived 11 November 1948; a snippet says "Ellis Island", which needs checking (see section 3).
- (1) Open imagery: Commons "America (ship, 1940)": about 25 files including three DPLA "Le Havre Arrival on America S.S. (Orangerie Exhibit)" images (PD per Commons, 1948-1967), construction photographs (PD), 1954 United States Lines brochure interiors tagged CC0 by the uploader (FirstClassBallroom 5868x2388, MainLounge, FirstClassDining; a CC0 tag on a 1954 commercial brochure is unverified), and about ten CC BY-SA 3.0 photos [M].
- (2) Place: none open.
- (3) Props: Poly Haven `vintage_suitcase`; Smithsonian Camilla Gottlieb's Suitcase (sensitive); Omandam steamer trunk is not CC0 media.
- (5) Feasibility: constructed Med; archival-in-3D Med; both Med.
- (6) Sensitivity: moderate; links to A1.

**A3. UN ambassador seat, 1993 to 1997** (candidate)
- Fact status [P]: UN ambassador 27 January 1993 to 21 January 1997 (history.state.gov, above).
- (1) Open imagery: Commons "Madeleine Albright during her confirmation hearing to be US representative to the UN.jpg", PD, 1993-01-23; Clinton Library DPLA photographs of 1993 (PD per Commons); "United Nations Security Council chamber" category with 2024 photographs by Joel Gonzalez labelled PD (provenance unverified; UN photographs often carry UN copyright [L]) [M].
- (2) Place: UN HQ; the official virtual tour is live and guided [L].
- (3) Props: Sketchfab CC BY "United Nations Headquarters" (9,288 faces, building only); generic table and chairs.
- (5) Feasibility: constructed Med (the chamber's mural is by Per Krohg, d. 1965, so likely still in copyright [L]); archival-in-3D Med; both Med.
- (6) Sensitivity: moderate; decisions during Rwanda, Bosnia and Iraq sanctions remain contested [L].

**A4. Secretary of State, 1997** (candidate)
- Fact status [P]: Secretary of State from 23 January 1997 per the history.state.gov fetch summary (end date not read exactly).
- (1) Open imagery: Commons "Madeleine Albright in 1997": DPLA photograph "Madeleine Albright speaks at her swearing-in ceremony as Secretary of State", 23 January 1997, 5438x3699, PD per Commons; "Swearing In of Madeleine Albright as Sec. of State (1997).webm" (640x480, PD); about 15 files; plus 7 PD State Department photographs in "Madeleine Albright in the Diplomatic Reception Rooms" [M].
- (2) Place: the Diplomatic Reception Rooms run public tours (Wednesdays per a snippet [L]); the site's virtual tour was not readable (403).
- (3) Props: Poly Haven `ArmChair_01`, `vintage_cabinet_01`, `mantel_clock_01`, `fancy_picture_frame_01`; Smithsonian Jefferson portable desk (CC0, analogue only).
- (5) Feasibility: constructed Med-High; archival-in-3D Med-High; both High.
- (6) Sensitivity: low-moderate.

**A5 (ALT). Naturalization ceremony at the National Archives, 14 September 2016; "Read My Pins"**
- (1) NARA NAID 445648827 "Madeleine Albright Make Remarks During the Naturalization Ceremony at the National Archives in Washington, D.C.", local ID 64-CFDA-20160914-01-098, 1 image, "Access: Unrestricted", "Use: Unrestricted" (https://catalog.archives.gov/id/445648827) [P]. "Read My Pins: The Madeleine Albright Collection" opened at the Smithsonian Castle on 18 June 2010 with 200+ pins per search snippets [L]; Commons has one PD photograph of pins from the LBJ Foundation (1032x616) [M]; pin photographs elsewhere are not open.
- (5) Feasibility: archival-in-3D High for the ceremony; an artifact scene about the pins would rely on illustration.
- (6) Sensitivity: low.

### 1.8 Naismith: scene scans

**N1. Springfield gymnasium, December 1891** (candidate)
- Fact status [P]: gym at the corner of State and Sherman streets, part of the School for Christian Workers building; rules written December 1891, published January 1892; Naismith asked the janitor for two 18-inch boxes and got two peach baskets nailed to the balcony rail at ten feet (https://springfield.edu/where-basketball-was-invented-the-birthplace-of-basketball). The first-game date of 21 December 1891 is [L] (Mass Moments snippet).
- (1) Open imagery: Commons File:Firstbasketball.jpg (514x740, PD, 1891, "the first basketball court at Springfield College"); File:FirstTeam1892.jpg (629x456, PD, names 10 players); File:Naismith Rules of Basketball 1892 first draft.jpg (1997x1217, PD); File:Dr. James Naismith's Original 13 Rules of Basket Ball.jpg (392x2084, PD, The Triangle, 15 January 1892) [M]; NARA NAID 12004702 "Photograph of Dr. James Naismith with His First Basketball Team", "Use: Unrestricted", original caption cites Springfield College as source (https://catalog.archives.gov/id/12004702) [P]. Springfield College Archives items via Digital Commonwealth carry "personal, non-commercial, and educational use, provided that ownership is properly cited" (from `04-content-availability-B.md`).
- (2) Place: no confirmation the 1891 building survives; no tour.
- (3) Props: Poly Pizza Armory_3D "Basket ball and hoop" (CC0); Poly Haven `wicker_basket_01` as a peach-basket stand-in; Smithsonian CC0 "gymnasium suit, 3-piece", "gymnasium suit, bloomers" (via Sketchfab, 99,999 and 100,000 faces), "Ringside bell"; Sketchfab CC BY "Gymnasium" (62,031 faces).
- (5) Feasibility: constructed High (balcony rail, height, baskets, rules are documented in words); archival-in-3D Med (two images); both High.
- (6) Sensitivity: low; gym suits in the Smithsonian set are women's wear, so they serve only as period texture.

**N2. University of Kansas and the original rules** (candidate)
- (1) Open imagery: the 1892 Triangle print and the first-draft scan (above, PD per Commons); Commons "Kansas U team 1899.jpg" (PD); KU's "James Naismith Scrapbook Page" (1936 Olympics article) is governed by "Library Use and Policies" (https://exhibits.lib.ku.edu/items/show/5273) [P]; KU's only known Naismith audio (1939) cannot be redistributed (`04-content-availability-B.md`).
- (2) Place: DeBruce Center; vendor 360 tour of Athletics facilities only (section 1.3).
- (3) Props: Poly Haven `standing_chalkboard_01` or a display case; nothing needed.
- (5) Feasibility: constructed Med; document-first High; both High.
- (6) Sensitivity: the 1939 radio clip is off-limits.

**N3. Berlin 1936: basketball's Olympic debut** (candidate)
- Fact status [P] Olympedia: final 14 August 1936, Tennisplatz 4, Reichssportfeld, Berlin, sand court, heavy rain, United States 19, Canada 8; the page does not mention Naismith (https://www.olympedia.org/results/31800). [L] Naismith attended, threw the first ball and awarded medals (secondary pages).
- (1) Open imagery: no archival photograph found openly licensed. Commons category "Basketball at the 1936 Summer Olympics" has one file, a 2012 CC BY-SA 3.0 photo of a stadium arena; "Edmonton Grads Olympic Team in Europe" (1936, "No restrictions") is a team photo [M]. KU scrapbook page (library-policy terms).
- (2) Place: the Reichssportfeld exists as the Olympiastadion complex; not searched for tours.
- (3) Props: Poly Pizza CC0 "Basket ball and hoop"; muddy ground is a texture task.
- (5) Feasibility: constructed Med (facts are specific: outdoor sand court, rain); archival-in-3D Low; both Low-Med.
- (6) Sensitivity: HIGH; see 1.9.

### 1.9 Sensitivity cross-cut

| Inductee | Notes for scene design | Status |
|---|---|---|
| Albright | Her Jewish ancestry was undisclosed to her until adulthood; she said in 1997 that her parents had never told her; three grandparents died in the Holocaust; her parents converted in 1941; her memoir "Prague Winter" (2012) retraces this. Any childhood scene implies what a child knew and can misrepresent a family's history. Family or IHH sign-off needed before A1. | [L] (snippets from Wikipedia, Algemeiner, J. Weekly, Unpacked) |
| Albright | Contested policy decisions in the 1990s (Rwanda, Bosnia, Kosovo, Iraq sanctions) | [L] |
| Einstein | Fled Nazi persecution (the Commons description of the 1933 newsreel says he was in great danger); avoid swastikas and persecution imagery; the 1939 letter on atomic weapons and the 2018-published travel diaries are known controversies | [M] for the Commons caption; [L] for the rest |
| Naismith | Berlin 1936 was the Nazi Olympics; a USHMM-sold book frames the US basketball team's participation as deception (https://shop.ushmm.org/products/games-of-deception-the-true-story-of-the-first-u-s-olympic-basketball-team-at-the-1936-olympics-in-hitlers-germany) | [P] for the book's existence; [L] for content |
| Muir | Yosemite as Indigenous homeland; Muir's early writings include racist remarks and the Sierra Club apologised in 2020; Hetch Hetchy | [L] |
| Lamarr | Austrian and Jewish background, first marriage to an arms dealer, "Ecstasy" (1933) nude scene, estate publicity rights (CMG Worldwide client page), reductive "most beautiful woman" framing | [L] |
| General | Smithsonian "Camilla Gottlieb's Suitcase" belonged to a Jewish refugee refused entry under US quotas: a real person's object, to be shown only with its story, not as set dressing | [P] |
| General | USHMM images are typically permission-based and not open (not verified here) | [L] |

### 1.10 Summary matrix (inductee x scene x best method x evidence availability)

Methods: C = constructed room, baked or live; P = archival photograph placed in 3D; B = both; D = document-first in a simple room; S = sky or data generated. Feasibility is C / P / B (H, M, L). Evidence uses the section 0.1 scale. Place evidence tiers: T1 contemporaneous plan or photo of the actual interior, T2 institutional description, T3 secondary narrative only, T4 nothing.

| # | Inductee | Scene | Best method | Open depiction found | Place tier | Evidence | C / P / B | Sensitivity |
|---|---|---|---|---|---|---|---|---|
| E1 | Einstein | Arrival in US 1933 | B | 1 US-side photo, newsreel, 104+ newspaper hits | T3 | M | M / M / M-H | Med |
| E2 | Einstein | Naturalization 1940 | D, B | LoC photo, NARA petition, 5 Commons files | T3 | H | M / H / H | Low |
| E3 | Einstein | Bern patent office | B | 2 PD photos | T2 (IGE text) | M | M-H / M / H | Low |
| E4 | Einstein | 1919 eclipse | S + P | ESO plate CC BY 4.0, 20+ Commons files | T3 | H | H / H / H | Low |
| E5 | Einstein | Solvay 1927 | P | 8 PD versions, 29 named people | T3 | H | M / H / H | Low |
| E6 | Einstein | Princeton study | C | 1986 IAS photos (InC-RUU), exteriors only | T1 (restricted) | L | M / L / L-M | Med (ethics, rights) |
| E7 | Einstein | Pasadena blackboard 1931 (ALT) | B | PD AP photo, 14+ files in 1931 | T3 | H | H / H / H | Low |
| M1 | Muir | Camp with Roosevelt 1903 | B | LoC photo, 31 LoC panoramas, 25+ Commons | T2 (NPS page) | H | H / H / H | Med |
| M2 | Muir | Scribble den | C | no open interior photo; LiDAR (NC-SA) | T2 (HFR, not read) | M | M-H / L-M / M | Low |
| M3 | Muir | Wisconsin farm 1849 | C | none; PD text | T3 | L | M / L / L-M | Low |
| M4 | Muir | Muir Glacier, Alaska | P | 14 LoC, 137 Commons, repeat photos | T3 | H | M / H / H | Low |
| L1 | Lamarr | "Algiers" set | P / B | 14 PD stills, PD film | T4 | M | L-M / M / M | Med-High (likeness) |
| L2 | Lamarr | Patent workbench | D | full patent case file (46 files) | T4 | H | M / n.a. / H | Low |
| L3 | Lamarr | Normandie 1937 | B | LoC photo, NYPL, CC0 interiors (provenance?) | T3 | M | M / M / M-H | Med |
| L4 | Lamarr | War bonds 1942 | D / P | ads only; NARA item not online | T4 | L | L-M / L-M / L-M | Med |
| A1 | Albright | Prague childhood | P (generic) | no family photos; 1890 photochroms | T4 | L | L / M / L | High |
| A2 | Albright | SS America 1948 | B | 25 files (PD, CC0 claim, BY-SA) | T3 | M | M / M / M | Med |
| A3 | Albright | UN seat 1993-97 | B | PD hearing photo, chamber photos | T2 | M | M / M / M | Med |
| A4 | Albright | Secretary of State 1997 | B | PD swearing-in photo and video | T2 | H | M-H / M-H / H | Low-Med |
| A5 | Albright | NARA naturalization 2016 (ALT) | P | NARA item, unrestricted | T1 | H | M / H / H | Low |
| N1 | Naismith | Springfield gym 1891 | B | 2 PD photos, 2 PD documents | T2 (Springfield page) | M | H / M / H | Low |
| N2 | Naismith | KU and the rules | D | PD 1892 print and draft | T3 | H | M / H / H | Low |
| N3 | Naismith | Berlin 1936 | C | none (1 modern photo) | T2 (Olympedia) | L | M / L / L-M | High |

Tally of the 21 baseline scenes by evidence rating: H 8 (E2, E4, E5, M1, M4, L2, A4, N2), M 8 (E1, E3, M2, L1, L3, A2, A3, N1), L 5 (E6, M3, L4, A1, N3). Per inductee, scenes rated M or H: Einstein 5 of 6, Muir 3 of 4, Lamarr 3 of 4, Albright 3 of 4, Naismith 2 of 3. Two ALT scenes (E7, A5) are both H.

### 1.11 Counter-evidence: arguments against the obvious reading

1. "Plenty of PD material exists" is weaker than it looks. Commons licence tags are uploader asserted; LoC says "Rights status not evaluated" for many Lamarr and Einstein items; "No known restrictions" is an institution's statement, not a licence. Example: the Einstein arrival photograph is a 1933 ACME news-agency picture labelled PD without a renewal check (E1).
2. Most strong archival items are single flat photographs. Only a few are wide enough to serve as wrap-around backdrops: the LoC panoramas of Yosemite and Muir Glacier. The remaining scenes use photographs as framed objects, which is the "fake-immersive" risk flagged in INTERIM-1 if overused.
3. The Smithsonian 3D "CC0 wow" does not reach the inductees: zero objects, and only a subset of thematic objects are CC0 at media level. The record-level label misleads in at least five cases.
4. Free props are cheap only when baked. A single Smithsonian GLB at its smallest offered size is about 2.5 MB; Poly Haven props range from 0.42 MB to 4.29 MB at 1k, and one pine tree is 958 MB. B1-R2's baked equirect prototype was 88 to 241 KB, so the build-time cost of heavy props does not reach the visitor if scenes are baked, but live 3D props would.
5. Open 360s of the real places do not exist (section 1.3). The only 360 asset found, the NASA video, is a different glacier and 432 MB.
6. Licences with strings: CyArk LiDAR is non-commercial share-alike; Commons BY-SA photos could force share-alike on a composite if baked into a texture; the Springfield College Archives terms are "non-commercial and educational"; KU items are under library policy; IAS photographs are "in copyright, rights-holder unlocatable". Each affects whether IHH can adopt and maintain without permission steps.
7. The scenes with the most evidence are not always the scenes with the most appeal. Princeton (E6) has the highest recognition and the weakest open evidence; Prague (A1) carries the strongest story and the weakest open evidence and the highest sensitivity.

---

## 2. Per-finding confidence

| ID | Finding | Confidence | Why |
|---|---|---|---|
| F1 | No Smithsonian 3D object for any of the five inductees | High | Site search returned no results for all five names and 11 related terms; full-text index; agrees with 2026-10-07 API reads |
| F2 | Thematic CC0 3D objects exist (e.g. TR relief, gym suits, patent models, refugee suitcase) | High | Confirmed with the media-level CC0 facet and object pages |
| F3 | Record-level "Usage CC0" differs from media-level CC0 for at least five objects | High | Observed on object pages and facet queries; Carnegie Mansion shows the inverse mismatch |
| F4 | Smallest Smithsonian GLB offered for the suitcase is 2.53 MB; largest 11.66 MB | High | HEAD requests, Content-Length |
| F5 | Poly Haven sizes and polycounts for listed props, and no piano, typewriter, globe, telescope, basketball | High | API responses |
| F6 | Sketchfab has CC0 museum scans for telescope, microscope, globe, oil lamp, radio, camera, gymnasium suits, and none for typewriter, piano, ocean liner, blackboard, campfire | Medium-High | API search with `count=6`; absence depends on search terms and ranking |
| F7 | About a fifth of sampled Poly Pizza models were CC0 | Medium | n=32, page-text parse; per-asset re-read needed |
| F8 | No open 360 or virtual tour exists for the inductees' real places | Medium | 11 targeted searches and category checks; absence of evidence; DRR and UN tours not read |
| F9 | CyArk Muir-house LiDAR is CC BY-NC-SA, form-gated, 2013 | High | Read on the Open Heritage project page |
| F10 | Google Arts & Culture holds 62 John Muir NHS items and a Yosemite hub; terms are Google's, some NPS assets need park permission | Medium-High | Pages observed; reuse terms not read |
| F11 | Yosemite 1903 trip facts (dates, camps) | High | Read on nps.gov |
| F12 | LoC Panoramic Photographs hold 31 Yosemite results with "No known restrictions on publication" | High for the two items read; Medium for all 31 | Two items' rights read, 31 counted |
| F13 | LoC 14 Muir Glacier photos 1895-1910 plus Commons categories | High for count; Medium for rights | Two LoC items' rights differ (one "No known restrictions", one "Rights status not evaluated") |
| F14 | Einstein naturalization photograph and petition are openly usable | High | LoC stated rights; NARA catalog; consistent on Commons |
| F15 | ESO eclipse plate scan is CC BY 4.0 | Medium | ESO page names the credit but not the licence in fetched text; licence from Commons |
| F16 | Solvay 1927 photo is PD with 29 named sitters | High for the list; Medium for PD | Commons description lists names; PD label uploader asserted but consistent with age |
| F17 | IAS 1986 interior photographs of the Einstein house exist but are "in copyright, rights-holder unlocatable" | High | Read on the IAS repository |
| F18 | Lamarr patent case file is fully open as 46 Commons files | Medium | Commons tags; DPLA origin; not each page viewed |
| F19 | NARA S-4921 Lamarr item is not online | High | Read on the catalog |
| F20 | Normandie CC0 interior images have unknown provenance | Medium | Uploader says "own work", 2024 |
| F21 | Albright childhood and flight facts, and her family's disclosure history | Low | Search snippets only |
| F22 | Albright SecState and UN dates | Medium | Fetch-tool summary of history.state.gov; one end date not exact |
| F23 | Albright 2016 NARA photo is unrestricted and digitized | High | Read on catalog |
| F24 | Springfield 1891 gym details (location, baskets, rules) | High | Read on springfield.edu |
| F25 | Olympedia final details; Naismith role in Berlin not on Olympedia | Medium-High | Olympedia read; secondary sources contradict by omission |
| F26 | No open archival photograph of the 1936 final | Medium | Commons searches, KU page; other archives not checked |
| F27 | Evidence tally: H 8, M 8, L 5 of 21 baseline scenes | Medium | Uses my rating scale; individual ratings are judgments |
| F28 | Lamarr and Mayer on the Normandie 1937; $25M bonds 1942 | Medium-High | National WWII Museum page |
| F29 | Einstein arrival date and ship | Low-Medium | Secondary pages; one snippet misnames the ship |
| F30 | Context7 has no Smithsonian, Voyager or Sketchfab-API docs | High | Six calls |

---

## 3. Contradictions

1. **Smithsonian record versus media usage.** Basketball Uniform 1922-1924: record says "Usage CC0", media tab says restricted and non-commercial; CC0 facet agrees with the media tab. Carnegie Mansion: Exterior: metadata "Usage conditions apply" but the CC0 facet lists it. Resolution used: trust the media-level facet and tab.
2. **Kenney.** The category page footer reads "All rights reserved" while each pack page states "Creative Commons CC0" (Furniture, Survival, Nature). B1-R2 read the CC0 statement on the support page. Pack-page wording is treated as controlling.
3. **CyArk access.** A 2013 article said Muir project data would be "freely available" through CyArk; the dataset page today shows CC BY-NC-SA 4.0 with a gated download.
4. **NPS Muir resources.** The GA&C partner page links `nps.gov/museum/exhibits/jomu/index.html` as the "Virtual Museum Exhibit"; that URL (and the desk slideshow) redirects to the NPS Museums index. The NPS Historic Furnishings Report URL redirects to an index page, while a search snippet says the PDF exists.
5. **NPS and Google Arts & Culture hub counts.** Trade article 2026-08-27: 150+ stories, 30 virtual tours; the hub page today: 200+ stories, 450+ virtual tours. The NPS release names neither Yosemite nor John Muir NHS; the hub page does. Likely the hub grew or counts differ.
6. **Naismith at Berlin.** Secondary pages say he attended and awarded medals; the Olympedia final page does not mention him.
7. **Albright's arrival.** A snippet says she arrived at Ellis Island on 11 November 1948. From general knowledge, unverified [L]: after 1924 most immigrants were processed at consulates abroad and Ellis Island mainly held detainees until it closed in 1954, while liners docked at Manhattan piers. Treat the place as unresolved.
8. **Einstein arrival ship name.** "Westernland" in most sources; one snippet writes "Westmoreland".
9. **Commons versus LoC rights.** Commons labels items PD where LoC says "Rights status not evaluated" or "Publication may be restricted" (e.g. Lamarr and Einstein studio photographs). Both are cited as stated; neither is a clearance.
10. **Normandie dates.** LoC titles 97504351 "arriving ... on maiden voyage" with date c1936 Jan. 27; secondary sources place the maiden voyage in 1935 [L]. Not resolved here.
11. **Counts versus 2026-10-07 reports.** `04-content-availability-B.md` listed Naismith Commons depth-1 files as 20; the direct category now shows 16 files plus the Naismith Museum subcategory with 3. The earlier figure counted depth-1 files differently.

---

## 4. Open questions and assumptions

### Open questions
1. IHH's status: does a non-commercial licence (CyArk NC-SA, Springfield College "non-commercial and educational") suit an organisation that takes donations, and would share-alike propagate to the scene files?
2. Will John Muir NHS permit reuse of its photographs and the 2013 LiDAR for a non-commercial education site? Where is the 2005 Historic Furnishings Report PDF hosted now?
3. Can the Institute for Advanced Study permit use of the 1986 Einstein-house interior photographs (rights statement InC-RUU) as reference or texture?
4. Do the Normandie "interior" CC0 photographs show original fittings or an exhibit or model? Same question for the 1954 SS America brochure CC0 tags.
5. Do any of the three 1933 photographs or the newsreel show the actual US arrival, as opposed to Antwerp or Princeton?
6. Pixel dimensions of the LoC TIFF masters (Yosemite panoramas, Muir Glacier panoramas) were not read; if they are near the 1429-pixel web width, the "wrap-around" use degrades.
7. Does Einstein-Haus Bern, the Basketball Hall of Fame or KU hold digital interior imagery they would license? The Diplomatic Reception Rooms virtual tour could not be fetched (403): content and terms are unread.
8. Is Street View coverage present at Mariposa Grove, Glacier Point, Kramgasse, Springfield College, KU, Prague? Only Yosemite is evidenced; the metadata API is free but needs a key.
9. Is the 1891 Springfield building extant, and what other photographs does Springfield College Archives hold at item level (not searched)?
10. What do Naismith's 1936 Berlin photographs look like in archives that were not searched (Olympedia images, LA84, Bundesarchiv, Alberta Archives)?
11. Does IHH or the Albright family wish childhood scenes (A1) to exist at all?
12. How does the future AI chatbot's fact log treat scenes built on copyrighted memoir sources (Albright's "Prague Winter") versus scenes with open primary documents?

### Assumptions
1. The five inductees and the candidate scenes are as the brief states; ALT scenes were added only with evidence (E7, A5).
2. "Openly licensed" includes PD (by age or statement), CC0, CC BY, CC BY-SA with share-alike noted, and LoC or NARA "no known restrictions / unrestricted" statements, which are institution statements, not licences.
3. All rights text is as displayed on 2026-10-08 and may change.
4. The H/M/L evidence scale and C/P/B feasibility ratings are my judgments from the cited counts, not measurements.
5. Production by AI coding agents on the shared engine is unchanged from B1-R2.
6. Smithsonian site search is full-text and complete for the site's public 3D objects.

---

## 5. Implications (no recommendation)

1. If a scene must rest on openly licensed archival imagery without a rights step, 8 baseline scenes qualify most clearly (E2, E4, E5, M1, M4, L2, A4, N2), plus the two ALT scenes (E7, A5). The other 13 depend on permissions, reconstruction from text, or weaker provenance.
2. If every inductee needs 3 to 4 scenes, Naismith is the thinnest (2 of 3 at M or H; Berlin is text-only), then Muir and Albright (3 of 4 each). Einstein has 5 of 6. These counts shift if ALT scenes or permissions are admitted.
3. If a "reconstruction" label applies to any constructed room, the evidence tier still differs sharply: Springfield 1891 and the eclipse sky can cite specific documents; Princeton, Wisconsin and Prague cannot.
4. If the Smithsonian 3D collection is wanted as a wow element, it can only appear as thematic analogues; every use must say it is not the inductee's own object.
5. If props are baked into 4096x2048 panoramas, the heavy CC0 sources (Smithsonian 2.5 MB at best, Poly Haven 0.4 to 4.3 MB) cost build time, not visitor bytes; if props stay live, they approach or exceed the per-scene budget.
6. If the real place is to be shown, link-out to Google Arts & Culture or Street View is the only found route; embedding or caching those depends on B1-R8's terms.
7. If the LiDAR dataset is acceptable under NC and SA, it could give true room geometry for M2; if not, the same room relies on a report not yet read.
8. Scenes with open primary documents (E2, L2, N2) map directly to fact ids with primary-source links; scenes built from text alone (M3, N3, A1) would link to secondary or copyrighted sources.
9. Sensitivity gates sit on A1, N3, E1 and L1; they affect whether a scene exists, not only how it looks.
10. The Smithsonian record-versus-media licence mismatch means any automated asset ingest needs the media-level field, and the same applies to Commons and Poly Pizza per-asset tags.

---

## 6. Query log (all dated 2026-10-08)

Counts: Google web searches 39; Google web page fetches 36; Google Developer Knowledge 2; Context7 6; direct site and API probes listed by group (approximate counts where scripts looped).

### 6.1 Google web searches (WebSearch, standard mode)
1. Smithsonian 3D Digitization 3d.si.edu Einstein OR Lamarr OR Muir OR Naismith OR Albright object model CC0
2. Einstein-Haus Bern virtual tour 360 Kramgasse 49 Einstein apartment online
3. John Muir National Historic Site Martinez virtual tour 360 Muir Mansion scribble den NPS
4. Einstein arrival New York Westernland October 1933 Princeton photograph archive public domain
5. Theodore Roosevelt John Muir Glacier Point Yosemite 1903 camp Mariposa Grove photograph Library of Congress no known restrictions
6. Naismith first basketball game December 1891 Springfield YMCA Training School gymnasium photograph Springfield College archives
7. Madeleine Albright arrived New York 1948 SS America Korbel family Denver
8. Naismith Hall of Fame Springfield virtual tour 360 Basketball Hall of Fame online tour
9. Berlin 1936 Olympics basketball final outdoor tennis court rain Naismith presented medals photograph
10. Einstein Patent Office Bern desk 1902-1909 Swiss Federal Institute of Intellectual Property Genfergasse photographs
11. Einstein-Haus Bern einstein-museum.ch official website virtual visit online exhibition apartment second floor
12. Hedy Lamarr Louis B. Mayer Normandie 1937 contract MGM London ship voyage New York
13. Hedy Lamarr George Antheil player piano frequency hopping 1941 patent workshop
14. Google Arts & Culture National Park Service John Muir National Historic Site OR Yosemite virtual tour street view tour
15. Diplomatic Reception Rooms State Department virtual tour Treaty Room Secretary of State office Truman Building 360
16. CyArk Open Heritage John Muir National Historic Site Martinez point cloud download license Scottish Ten Dunbar birthplace
17. openheritage3d.org John Muir National Historic Site Martinez California CyArk dataset license CC BY-NC-SA point cloud
18. nps.gov "scribble den" John Muir study second floor Martinez mansion room desk papers photograph
19. Wikimedia Commons 360 panorama Glacier Point Yosemite equirectangular CC BY-SA OR Mariposa Grove Grizzly Giant panorama
20. John Muir Fountain Lake farm Hickory Hill Wisconsin Muir Park State Natural Area 1849 homestead photographs
21. "Historic Furnishings Report" Strentzel-Muir House John Muir National Historic Site scribble den furnishings npshistory.com
22. Madeleine Albright Read My Pins brooch collection exhibition Smithsonian OR museum photographs
23. Madeleine Albright Prague childhood 1937 1939 flight London Holocaust grandparents learned 1997 Korbel family Jewish heritage
24. "United Parks of America" Google Arts & Culture National Park Service virtual hub 30 virtual tours 3D models
25. James Naismith original 13 rules DeBruce Center University of Kansas virtual exhibit Naismith150 digital collections
26. 1936 Berlin Olympics basketball final photograph United States Canada mud tennis court Bundesarchiv OR LA84 OR Olympedia
27. Hedy Lamarr 1942 war bonds sold $25 million Stage Door Canteen Hollywood Canteen photograph National Archives
28. Einstein study 112 Mercer Street interior second floor desk books private residence Institute for Advanced Study
29. Library of Congress photochrom Prague Bohemia Detroit Publishing Company Charles Bridge Hradcany no known restrictions
30. Muir Glacier Glacier Bay repeat photography USGS National Park Service 1941 2004 then and now
31. Springfield College Archives digital collections 1891 gymnasium School for Christian Workers building photograph
32. Einstein 1919 eclipse Principe Eddington Cottingham expedition photographs Sobral Observatório Nacional open license
33. Stellarium license GPL render equirectangular sky past date 1919 Principe planetarium open source
34. United Nations Headquarters virtual tour 360 Security Council chamber visit.un.org copyright
35. DeBruce Center University of Kansas virtual tour 360 Rules Gallery OR Allen Fieldhouse virtual tour
36. National Archives Rotunda Charters of Freedom virtual tour 360 naturalization ceremony
37. Bundesarchiv Bild Olympia 1936 Basketball Berlin Tennisplatz Finale USA Kanada Regen Foto
38. Naismith 1936 Berlin Olympics attended invited Springfield College jump ball primary source photo
39. Einstein arrived New York October 17 1933 aboard Westernland Institute for Advanced Study

### 6.2 Google web page fetches (WebFetch, with outcome)
1. https://3d.si.edu/explore?edan_q=einstein (HTTP 403; in-app browser used instead)
2. https://www.nps.gov/jomu/learn/photosmultimedia/index.htm
3. https://www.einstein-bern.ch/en/ (404)
4. https://ige.ch/en/about-us/the-history-of-the-ipi/einstein/einstein-at-the-patent-office
5. https://www.nps.gov/jomu/learn/photosmultimedia/photogallery.htm (empty gallery text)
6. https://www.cyark.org/news/cyark-joins-transatlantic-project-to-celebrate-john-muir (no project detail)
7. https://unofficialnetworks.com/2026/08/27/... (403; read in browser)
8. https://openheritage3d.org/project.php?id=jdr8-6w26 (portal page)
9. https://www.cyark.org/projects/john-muir-national-historic-site
10. https://cyark.org/news/3d-scanning-conducted-at-john-muiros-home-in-martinez-ca (no detail)
11. https://doi.org/10.26301/0scs-yy66 (redirect)
12. https://amerisurv.com/2013/08/20/3d-scanning-conducted-at-john-muirs-home-in-martinez-california/
13. https://openheritage3d.org/project/0scs-yy66
14. https://www.nps.gov/museum/exhibits/jomu/home.html (redirect to directory)
15. https://www.nps.gov/parkhistory/online_books/jomu/strentzel-muir_hfr.pdf (index page, no PDF text)
16. https://www.nps.gov/orgs/1207/national-park-service-and-google-arts-and-culture-launch-united-parks-of-america-virtual-hub.htm
17. https://albert.ias.edu/20.500.12111/1136 (403; read in browser)
18. https://www.loc.gov/item/94512595 (403; read via JSON API)
19. https://kenney.nl/assets/category:3D
20. https://quaternius.com/packs.html (404)
21. https://kenney.nl/assets/furniture-kit
22. https://kenney.nl/assets/survival-kit
23. https://kenney.nl/assets/nature-kit
24. https://kenney.nl/assets/watercraft-pack (404)
25. https://www.nps.gov/jomu/learn/historyculture/john-muir-and-president-roosevelt.htm
26. https://history.state.gov/departmenthistory/people/albright-madeleine-korbel
27. https://eso.org/public/images/potw1926a/
28. https://exhibits.lib.ku.edu/items/show/5273
29. https://diplomaticrooms.state.gov/virtual-tour/ (403)
30. https://quaternius.com/
31. https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech
32. https://www.invent.org/inductees/hedy-lamarr
33. https://www.springfieldcollege.edu/where-basketball-was-invented-the-birthplace-of-basketball (redirect)
34. https://www.olympedia.org/results/31800
35. https://springfield.edu/where-basketball-was-invented-the-birthplace-of-basketball
36. https://www.nps.gov/museum/exhibits/jomu/index.html (directory page only)

### 6.3 Google Developer Knowledge MCP
1. search_documents: Street View coverage check, Street View Static API metadata endpoint and Street View Publish API (returned metadata, overview and request docs)
2. search_documents: Google Arts & Culture Open Heritage or virtual tour partner program for museums and historic sites 360 imagery requirements (returned Street View ready camera specs and VR View 360 media format docs; nothing on Arts & Culture)

### 6.4 Context7 MCP
1. resolve-library-id: "Smithsonian Open Access API" (no match)
2. resolve-library-id: "Sketchfab Data API" (only Sketchfab OAuth2)
3. resolve-library-id: "Smithsonian Voyager dpo-voyager" (unrelated Voyager libraries)
4. resolve-library-id: "Smithsonian Open Access" (no match)
5. resolve-library-id: "glTF-Transform" (matches `/websites/gltf-transform_dev`, `/donmccurdy/gltf-transform`, `/cesiumgs/gltf-pipeline`)
6. query-docs `/websites/gltf-transform_dev`: CLI optimize, simplify, resize and compress textures for a high-poly GLB

### 6.5 Direct probes (site search, APIs, browser reads)
- Smithsonian 3D site search and object pages (in-app browser, own tab): about 270 requests in six scripts: 34 term searches; 54 terms x2 (all and CC0 facet); 49 CC0-facet term searches; 15 object lookups; 27 candidates x2 for media-level CC0; plus about 19 object page reads and 2 HEAD requests to 3d-api.si.edu for GLB sizes.
- Wikimedia Commons API (urllib, user agent `IHH-research/1.0`): about 110 calls (file searches, category member listings, subcategory lists, category-name searches, file metadata).
- Library of Congress JSON API: about 45 calls (item JSON for about 14 items; photo, panoramic-collection and photochrom searches); roughly half of the main search calls timed out.
- Sketchfab search API: 59 queries (18 CC0 + 13 CC BY props, then 14 CC0 + 14 CC BY inductee and place terms).
- Poly Haven API: 1 model list (521 records), 6 file listings, 1 info call.
- Poly Pizza: 10 search pages and 32 model pages in the in-app browser.
- National Archives catalog: 3 record pages (148960657, 12004702, 445648827) in the in-app browser.
- Institute for Advanced Study repository: 1 record page and 1 REST search ("Einstein house study", 278 hits, 15 inspected).
- Google Arts & Culture: 4 pages in the in-app browser (hub, John Muir NHS partner page, "Desk" asset, "Explore With John Muir" story).
- curl: NPS legacy exhibit and HFR URLs (2), npshistory.com HEAD (3).
- Not done: Smithsonian Open Access API (rate-limited per B1-R2), Mapillary, Street View metadata (needs key), NARA API (key), any download of media or datasets.
