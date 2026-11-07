# James Naismith: one room per turning point

Run `naismith-rooms-2026-10-20` (owner decision 2026-10-20: the tour is a sequence of turning-point
chapters, one rebuilt room per chapter where a real period photograph allows it). Adversary: Codex
`gpt-6.1-sol` (codex-cli 0.162.1). `validate.py naismith`: exit 0 (0 errors, 33 warnings).

Status words are the package's own (`compute_status.py`). Chapters use verified facts for copy;
single-source and disputed facts are listed so a person can see what the room would rest on.

Ratings: **BUILDABLE-FULL** (interior and exterior photographs, enough to model geometry and
materials), **BUILDABLE-PHOTO** (one good photograph: a camera-projection "photo room"),
**NO-PHOTO** (gallery-case fallback). "Embeddable" means verified with an open licence from the
holder's own words; everything else is reference only (modelling basis, never shown), per the
2026-10-16 owner rule.

## What this run added

| Media | Title (holder's) | Holder, id | Date | Rights (holder's words) | Size (px) | Basis for | Status |
|---|---|---|---|---|---|---|---|
| NAI-M-0052 | Presbyterian College students at dinner, Montreal, QC, 1889 | McCord Museum, II-89481 (Wm. Notman & Son) | 1889/04 | "Public Domain / You can freely copy, modify and distribute this image, even for commercial purposes." public-domain | 3002 x 2378 | NAI-F-0094 | disputed (adversary: snapshot supports; live page unreachable, browser snapshot) |
| NAI-M-0053 | Morrice Hall, Presbyterian College, Montreal, QC, about 1887 | McCord Museum, VIEW-1597 | about 1887 | same | not measured (2 images) | NAI-F-0094 | disputed (supported; live unreachable) |
| NAI-M-0054 | Library, Presbyterian College, McGill University, Montreal, QC, about 1895 | McCord Museum, VIEW-2970 | about 1895 | same | 3002 x 2384 | NAI-F-0094 | disputed (unclear; live unreachable) |
| NAI-M-0055 | General view of McGill College, Montreal, QC, about 1885 | McCord Museum, VIEW-1458 | about 1885 | same | 2998 x 2244 | NAI-F-0084, NAI-F-0121 | disputed (supported; live unreachable) |
| NAI-M-0056 | Arts Building, McGill College, Montreal, Quebec, about 1875 | McCord Museum, VIEW-964.1 (William Notman Studio) | about 1875 | same | 13842 x 9600 | NAI-F-0121 | disputed (unclear; live unreachable) |
| NAI-M-0057 | High School, Almonte, ON, about 1910 | McCord Museum, MP-0000.648.11 (halftone print) | about 1910 | same | 3000 x 1634 | NAI-F-0115 | disputed (supported; live unreachable) |
| NAI-M-0058 | Douglas County Courthouse | National Park Service, NRHP NRIS 75000708 (photographs PDF) | 1974 views | none on the asset page ("Copyright Information:" empty), unknown | about 1575 x 1066 per page | NAI-F-0064 | disputed (**refuted**: the PDF holds four photographs, not one item; see open items) |

McCord pages answer plain fetches with HTTP 403, so their snapshots are browser copies (sha256
checked equal in the browser); every McCord item is disputed only because the adversary cannot
read the page live (the same G10 limit as the Springfield College CONTENTdm items). A person who
opens each link and confirms the "Public Domain" label clears them.

Re-judged this run (earlier Codex runs had failed): NAI-M-0033 (McGill gymnasium interior),
NAI-M-0041 (Robinson Gymnasium interior 1907), NAI-M-0042 (School for Christian Workers gymnasium
c. 1887) are now **verified** (licence unknown or restricted, so reference only); NAI-M-0043,
-0045, -0046, -0047, -0048 stay disputed (CONTENTdm pages unreadable live).

## LoC pass 2026-10-22 (run `naismith-loc-2026-10-22`)

loc.gov JSON API answered again (polite client: one request at a time, 4.5 s spacing; several HTTP
520 errors retried, no 403/429). Searches NAI-Q-0323 to NAI-Q-0331. Eight new basis photos, all
LoC "No known restrictions on publication." (public-domain under the approved rule), Codex
`gpt-6.1-sol` 8 of 8 supported, all **verified**:

| Media | Title (holder's) | LoC id | Date | Size (px) | Basis for | Chapter |
|---|---|---|---|---|---|---|
| NAI-M-0059 | Old Hall, McGill University, Montreal (Detroit Publishing Co.) | 2016798726 | between 1890 and 1901 | 794 x 1024 | NAI-F-0084 | 2b / 3 |
| NAI-M-0066 | Nat[iona]l Y.M.C.A. training school [Springfield College], Springfield, Mass. (Detroit Publishing Co.) | 2016796049 | between 1900 and 1920 | 1024 x 824 | NAI-F-0040 | 4 (later campus, not the 1890 building) |
| NAI-M-0062 to -0065 | Kansas State University [i.e., University of Kansas] (A. Lawrence c1913; J.L. Morris c1908) | 2007662163 to -166 | c1908, c1913 | 1750-2723 x 420 | NAI-F-0091 | 7 (campus panoramas; the records name no building, so Robinson Gymnasium is not confirmed in view) |
| NAI-M-0060, -0061 | View / Dusk view of a tower hoisting a symbolic basketball outside the Naismith Memorial Basketball Hall of Fame (Carol M. Highsmith) | 2019690414, 2019690512 | 2019-05-26 | 733 x 1024, 693 x 1024 | NAI-F-0086 | 9 (present building) |

NAI-M-0044 (Lawrence 1913, page 21 "Robinson Gymnasium") stays disputed: the page record
(`/resource/gdcmassbookdig.lawrencetodayyes00lawr/?sp=21`) names the whole-book text as
`resource.fulltext_file` and the page text as `fulltext_service`, and `tools/fetch_snapshot.py`
refuses a record whose two pointers differ. Tool request for the lead (not changed here).

## Chapters and rooms

| # | Chapter | Facts | Place | Photos (holder / id / date / rights / size) | Rating | Artifacts in the room |
|---|---|---|---|---|---|---|
| 1 | Birth and birthplace | verified NAI-F-0035 (born in Almonte, Ontario, November 6, 1861), NAI-F-0114 (raised by his uncle Peter Young); single-source NAI-F-0036 (Ramsay Township), NAI-F-0116 (duck on a rock in Bennie's Corners) | Family farmhouse north of Almonte (no source gives its address) | NAI-M-0012 "Birthplace of Dr. James Naismith", Springfield College ms506-01-04-026, 1900-1940?, rights-restricted (non-commercial), 973 x 930, disputed; NAI-M-0048 Annie Naismith outside the birthplace, ms506-01-04-024, same rights, 981 x 988, disputed. Exteriors only | BUILDABLE-PHOTO (exterior, reference only, low resolution) | none usable; NAI-M-0007 cabinet card (late 1880s, link) as a portrait |
| 2a | Education before the US: Almonte | single-source NAI-F-0115 (in 1875 began high school at Almonte High School) | Almonte High School | NAI-M-0057 McCord MP-0000.648.11, about 1910, public domain, 3000 x 1634 (exterior halftone; no source on file dates the building, so it may not be the 1875 building) | BUILDABLE-PHOTO (exterior) | none |
| 2b | Education before the US: McGill and the Presbyterian College | verified NAI-F-0094 (in 1887 entered the Presbyterian College in Montreal), NAI-F-0084 (appointment as instructor at McGill); single-source NAI-F-0121 (BA 1887; ruled in CONFLICTS.md), NAI-F-0109 and NAI-F-0048 (Instructor in Gymnastics, 1888), NAI-F-0020 (first director of athletics) | Presbyterian College (Morrice Hall, McTavish Street) and McGill College; the gymnasium at Burnside Hall | **Interior:** NAI-M-0052 students at dinner, April 1889, public domain, 3002 x 2378; NAI-M-0054 library about 1895, public domain, 3002 x 2384; NAI-M-0033 interior of the gymnasium at Burnside Hall, c. 1890, McGill University Archives via KU exhibit item 5258, rights unknown ("contact the University Archives reference desk"), 1068 x 790, **verified**. **Exterior:** NAI-M-0053 Morrice Hall about 1887 (public domain); NAI-M-0055 McGill College about 1885 (public domain, 2998 x 2244); NAI-M-0056 Arts Building about 1875 (public domain, 13842 x 9600); **NAI-M-0059** Old Hall (Arts Building) 1890-1901, LoC, public domain, verified, 794 x 1024 | **BUILDABLE-FULL** (Presbyterian College: dining hall interior + Morrice Hall exterior + library interior, all public domain); McGill gymnasium BUILDABLE-PHOTO (reference only until McGill grants use) | NAI-M-0034 Board of Governors minute, 15 Sept 1888 (link); NAI-M-0007 cabinet card (link) |
| 3 | Leaving home and why | single-source NAI-F-0039 and NAI-F-0110 (McGill minute of 26 Sept 1890: letter of resignation indicating his intention to study in Springfield); NAI-F-0060 (forewent ordination to become a student in 1890-91); disputed NAI-F-0007 (late summer 1890, bid farewell to Almonte), NAI-F-0006 | McGill (the resignation is a Board minute); no separate place | none beyond chapter 2b | NO-PHOTO (reuse the McGill room; the reason "to study in Springfield" is the minute's own wording, single-source) | NAI-M-0035 minute of 26 Sept 1890 (link) |
| 4 | Arriving in the US | single-source NAI-F-0040 (came to Springfield College, then the International YMCA Training School, in 1890), NAI-F-0001 | School for Christian Workers building, corner of State and Sherman streets, Springfield (NAI-F-0117 single-source) | NAI-M-0045 building c. 1887, 781 x 631; NAI-M-0046 1887-1896?, 767 x 554; NAI-M-0047 c. 1889 (winter); all Springfield College, rights-restricted, disputed; **NAI-M-0066** LoC Detroit Publishing view of the Training School, 1900-1920, public domain, verified, 1024 x 824 (the later Lake Massasoit campus, not the 1890 building) | BUILDABLE-PHOTO (exterior street front, reference only, low resolution; one embeddable view of the later campus) | NAI-M-0008 original application to Springfield College (link); NAI-M-0009 autobiography 1891 (link) |
| 5 | First work in the US (the invention) | verified NAI-F-0100 (December 1891 invented basketball in Springfield), NAI-F-0067, NAI-F-0079, NAI-F-0080, NAI-F-0087, NAI-F-0088, NAI-F-0090, NAI-F-0078, NAI-F-0085, NAI-F-0099; single-source NAI-F-0089 (baskets on the lower rail of the gymnasium balcony), NAI-F-0011, NAI-F-0047, NAI-F-0061 | Gymnasium of the School for Christian Workers building (**existing room**) | NAI-M-0042 gymnasium c. 1887, 799 x 646, **verified**, rights-restricted; NAI-M-0043 gymnasium c. 1894, 505 x 737, disputed; exteriors as chapter 4 | BUILDABLE-FULL (built; reference only, ask Springfield College for TIFF masters) | **NAI-M-0003** "Basket ball" (1894), LoC, public domain, embeddable; NAI-M-0004 first team (NARA, link); NAI-M-0011 rules 1893, NAI-M-0010 portrait c. 1893, NAI-M-0006 lantern slide 1892 (link) |
| 5b | (between Springfield and Kansas) Denver | verified NAI-F-0095 (moved to Denver in 1895), NAI-F-0096 (graduated from Gross Medical College in 1898), NAI-F-0105 (a resident of Denver); single-source NAI-F-0049 (directorship of physical education at the large YMCA in Denver) | Denver YMCA (1895-1898 building not identified); Gross Medical College | none: Denver Public Library photographs are of the 1906-07 YMCA at 16th Avenue and Lincoln (too late) and Gross Medical College appears only on index cards; LoC HABS CO-35 is the 1920s Glenarm branch | NO-PHOTO | none |
| 6 | Becoming a citizen | single-source NAI-F-0008 (naturalized American citizen in 1925; Smithsonian + DCB), NAI-F-0041 (filed near the end of the war); disputed NAI-F-0064 (citizen in the District Court of Douglas County, Kansas, May 4, 1925) and NAI-F-0065 (declaration September 11, 1918), both from a Springfield College letter (live page unreadable) | District Court of Douglas County: Douglas County Courthouse, Lawrence (completed 1904 per the NRHP nomination) | NAI-M-0058 NRHP 75000708 photographs PDF, 1974 exteriors (KSHS staff), about 1575 x 1066, rights unknown, **refuted as an item** (four photographs in one record) | BUILDABLE-PHOTO (exterior only, reference only; no source on file says the court sat in this building in 1925) | none (the Springfield College citizenship letter, source NAI-S-0020, is a lead for a media record) |
| 7 | The big work: University of Kansas | verified NAI-F-0021, NAI-F-0083, NAI-F-0091, NAI-F-0092, NAI-F-0093, NAI-F-0051, NAI-F-0074, NAI-F-0104, NAI-F-0101, NAI-F-0103, NAI-F-0097; single-source NAI-F-0102 (instrumental in the design of Robinson Gymnasium), NAI-F-0122 (team practised there, 1907), NAI-F-0108 (razed November 1967), NAI-F-0055 | Robinson Gymnasium, Jayhawk Boulevard (**existing room**) | NAI-M-0041 team practising, 1907, KU University Archives RG 66/13, rights not stated, 1100 x 866, **verified**; NAI-M-0044 "Lawrence: today and yesterday" (1913) page 21 exterior, LoC, public domain, disputed. **NAI-M-0062 to -0065** LoC campus panoramas c1908/c1913, public domain, verified, up to 2723 x 420 (no building named in the records; Robinson Gymnasium not confirmed) | BUILDABLE-FULL (built; interior reference only) | **NAI-M-0049**, **NAI-M-0050** (Topeka state journal 1908, 1898; public domain, embeddable); NAI-M-0036 to -0040 (KU, link); NAI-M-0002 fencing photograph (link); NAI-M-0051 medical licence 1902 (disputed, link) |
| 8 | Part of a historic event | verified NAI-F-0098 (in 1936 at the Olympics in Berlin); single-source NAI-F-0123 (addressed all of the international teams), NAI-F-0124 (honorary referee), NAI-F-0063; also WWI: single-source NAI-F-0059 (in France fall 1917 to 1919, organizing sports for American soldiers), NAI-F-0111, NAI-F-0026 | Berlin 1936 Olympic basketball venue (not named by any fact on file); France (no place named) | none: Bundesarchiv picture database has no 1936 basketball image (earliest 1940s); Commons has only a 2012 own-work photo; LoC search blocked (HTTP 429). WWI: NARA has Y.M.C.A. athletics film/photos but no fact names a place | NO-PHOTO | NAI-M-0040 KU scrapbook page with the Berlin article (link); NAI-M-0016 clipping "Dr. Naismith honored at olympic games" (link); NAI-M-0014 Seerley, McCurdy and Naismith in France (link) |
| 9 | Why the Hall honours him | verified NAI-F-0086 (inducted into the Basketball Hall of Fame in 1959); single-source NAI-F-0027 (contributor), NAI-F-0028 (FIBA 2007), NAI-F-0029 (Canada's Sports Hall of Fame 1955), NAI-F-0031, NAI-F-0033 (LL.D. McGill 1938), NAI-F-0034, NAI-F-0062 | Naismith Memorial Basketball Hall of Fame, Springfield (present building; the 1959 enshrinement predates it) | **NAI-M-0060, -0061** LoC Carol M. Highsmith, 2019 exterior (day and dusk), public domain, verified, 733 x 1024 / 693 x 1024 | BUILDABLE-PHOTO (upgraded from NO-PHOTO: modern exterior, embeddable) | **NAI-M-0032** 4c Naismith plate proof (Smithsonian NPM, CC0, embeddable once fetch_media allows the host); NAI-M-0019 stamp 1961, NAI-M-0029 statue, NAI-M-0013 honorary degree card (link) |
| 10 | Death and legacy | verified NAI-F-0037 (died November 28, 1939, in Lawrence), NAI-F-0081, NAI-F-0082; single-source NAI-F-0002 (died at his home, 1515 University Drive), NAI-F-0004 (laid to rest at KU), NAI-F-0108; disputed NAI-F-0118 (Springfield building torn down 1965) | Home at 1515 University Drive; grave (Memorial Park Cemetery per the City of Lawrence page, no fact on file) | none found at a holder | NO-PHOTO | NAI-M-0018 clipping "Dr. Naismith, inventor of basketball, dies" (link); NAI-M-0020 court dedication 2007 (link) |

## Build priority (story value x photo quality)

| Priority | Room | Why |
|---|---|---|
| (built) | Springfield gymnasium (ch. 5) and KU Robinson Gymnasium (ch. 7) | already built; NAI-M-0042 and NAI-M-0041 now verified as their basis |
| **1** | Presbyterian College dining hall, Montreal, 1889 (ch. 2b) | the only new interior photographed during his student years; public domain at 3000 px, with Morrice Hall exterior (1887) and library interior for materials; NAI-F-0094 verified; artifacts could be embedded once a person confirms the McCord pages |
| **2** | McGill gymnasium at Burnside Hall, c. 1890 (ch. 2b/3) | where he taught gymnastics before leaving; interior photograph verified but rights unknown, so ask McGill University Archives; public-domain McGill College exteriors (1875, 1885) give the campus setting; holds the 1888 and 1890 Board minutes (resignation to study in Springfield) |
| **3** | Almonte (ch. 1 and 2a): birthplace farmhouse + high school | story weight of birthplace; birthplace photos are restricted (Springfield College) and low resolution, the high school photo is public domain but c. 1910; a photo room is feasible |
| 4 | Douglas County Courthouse (ch. 6) | the only citizenship place on file, but the date facts are disputed and the photo record must be split per photograph |
| 5 | Hall of Fame exterior (ch. 9) | modern exterior; Highsmith NAI-M-0060/-0061 now verified and embeddable |
| - | Denver, Berlin, France, Lawrence home/grave | NO-PHOTO: gallery cases with the linked artifacts |

## Open items for the owner or a person

1. **Registry proposal (not edited; for data/registry/PROPOSED.md):** McCord Stewart Museum,
   kind museum, exact host `collections.musee-mccord-stewart.ca`, `may_be: ["institutional"]`.
   Evidence: 2026-10-20 in-app browser: the host serves "Online Collections | McCord Museum -
   Montreal Social History Museum" pages naming "Notman Photographic Archives" and
   reference.mccord@mccord-stewart.ca; plain curl answers HTTP 403, so the TLS certificate
   organization should be checked by the person adding it. Until then NAI-S-0091..0096 stay secondary.
2. McCord items NAI-M-0052..0057: disputed only for G10 (browser snapshot, live page unreadable to
   the adversary). A reviewer opening the links and confirming the "Public Domain" label settles them.
3. NAI-M-0058 refuted as non-atomic: the NRHP photographs PDF holds four photographs. Withdraw it
   and stage one record per photograph if the citizenship room is wanted (needs a per-page url the
   merge accepts; the same url is skipped as a duplicate).
4. Done 2026-10-22 (LoC pass): Old Hall, KU panoramas, Highsmith Hall of Fame and the Training
   School view staged and verified. LoC has no 1936 Olympic basketball, Y.M.C.A. France, Robinson
   Gymnasium or Douglas County Courthouse photograph (NAI-Q-0326 to -0331). Still open: a person
   viewing the KU panoramas can say whether Robinson Gymnasium is in view; NAI-M-0044 needs the
   fetch_snapshot page-text fix above.
5. Library and Archives Canada Collection Search answered a security check; not bypassed (Almonte,
   Bennies Corners photographs not searched there). Mississippi Valley Textile Museum and the
   Naismith Museum (Almonte) not searched.
6. No fact names the Berlin venue, a place in France, the 1895-1898 Denver YMCA building, or the
   grave; each would need a sourced fact before a room.

## Method

Read the skill, SPEC 3.4.2 / 3.4.3, LESSONS, TOUR-RESEARCH, ARTIFACTS and CONFLICTS; mapped the 120
live facts to the ten chapters. Searched (NAI-Q-0293..0317): LoC JSON (until 429), McCord eMuseum
(in-app browser), Denver Public Library, Bundesarchiv, NARA catalog, LAC (blocked), Commons
(discovery only), NPGallery, WebSearch. Staged 7 sources and 7 basis photos (`merge_staging.py`),
snapshots via `fetch_snapshot.py` (`--method browser` for McCord, http for NPGallery), Codex
adversary on the 7 new and 8 earlier failed basis photos, `compute_status.py`, `validate.py`.

## European and Canadian archives pass (run naismith-euro-2026-10-22)

Searches NAI-Q-0318 to -0322. No new items; no rating change.

- Lead ruling 2026-10-22 (McCord Stewart may be proposed; look for a second source for its items):
  no second holder found. BAnQ, Canadiana, Europeana and web searches return only the McCord Stewart
  object pages for the Notman Presbyterian College and McGill views; the Notman glass negatives are
  unique to McCord, so NAI-M-0052 to -0057 can be cleared only by a person confirming each McCord
  page (G10), not by a second holder. The registry proposal in item 1 above stands.
- Library and Archives Canada Collection Search: **blocked**, HTTP 403 "Security Check"; stopped
  as instructed.
- Canadiana.ca: searchable by plain fetch, but document pages expose page images only (no text), so
  no quotable snapshot. Leads for chapter 2b facts: Presbyterian College calendars 1887/88
  (oocihm.8_01632_9) and 1888/89 (oocihm.8_01632_10), McGill annual report 1888 (oocihm.8_00509_1),
  University gazette 1886-1889; a person could transcribe the Naismith entries (manual snapshot).
- Europeana: no 1936 Olympic basketball photograph; one item lead, Estonian Sports and Olympic
  Museum "Basketball creator J. Naismith" (CC0, muis.ee 28373), a portrait, not a place.

## Ratio-lift pass (run `ratio-lift-2026-10-24`)

Task 14b: the ratio-lift research records (workspace `ratio-lift/`, ids RL-*) taken through
staging -> merge -> Codex adversary (gpt-6.1-sol) -> compute_status -> validate. Each record's notes
keep its RL id. Only **verified** (V) facts are content; D = disputed, S = single-source.
Sources NAI-S-0106 to -0108; searches NAI-Q-0332 to -0345.

| Chapter | New facts | Place | Basis photos | Rating change |
|---|---|---|---|---|
| 8 Part of a historic event (Berlin 1936) | **NAI-F-0126 D** (at Berlin Dr. Naismith was honored at the formal opening of the basketball tournament; NABC Bulletin No. 1, 1936-37, KU ku-phog:47983, transcribed from the page image because the OCR is garbled). Single-source (KU only) and disputed on G10 (manual snapshot, live page unreachable to Codex). NAI-F-0098 V stays the place fact | Berlin | **none staged.** NARA RG 242 "Summer Olympic Games, Berlin" photographs NAID 404792491, -493, -495, -497, -499, -501 (242-HD-370, -370-1, -370-2, -371, -371-1, -371-2; basketball games, 1936; ~4000 px): **reference only** (controller ruling, confirmed by the owner 2026-10-24: seized foreign records; NARA "Unrestricted" is not a copyright clearance; never staged, never displayed, never exported as media). Not staged because the approved NARA rule would mark any media record for them public-domain; generated textures only, never displayed | BUILDABLE-PHOTO (reference only) |
| 10 Death and legacy | **NAI-F-0127 V** (died at the residence at 1515 University Drive, Lawrence, on November 28, 1939; NRHP form 08000614, primary), **NAI-F-0128 V** (died in his home just off the University of Kansas campus; *Waterbury Democrat*, 28 Nov 1939). Lift NAI-F-0002's place | 1515 University Drive, Lawrence | none online (the NRHP photographs are listed, not published) | NONE (place verified, no photo) |
| 2b McGill (room naismith-mcgill-old-hall) | **NAI-F-0129 V** (James Naismith attended McGill; KU + Canada's Sports Hall of Fame) | McGill | existing room photos | label the room "McGill College", never his classroom |
