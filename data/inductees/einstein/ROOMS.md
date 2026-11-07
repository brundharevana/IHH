# Albert Einstein: one room per turning point (run einstein-rooms-2026-10-20)

Owner decision 2026-10-20: the tour is a sequence of turning-point chapters, and each chapter
gets, where possible, one rebuilt room made from a real period photograph of that place, holding
that chapter's artifacts. This file maps each chapter to its verified facts, its place, the
photographs found, a buildability rating and the artifacts for the room.

Rules applied: a chapter is defined only from `verified` facts (statuses as computed by
`tools/compute_status.py` on 2026-10-20). A chapter with no verified fact is marked absent and not
filled. Single-source facts are named only as leads. Basis photos are `record_kind: basis-photo`
media (SPEC 3.4.2); a rights-restricted or unknown item is modelling reference only (owner rule
2026-10-16), never embedded.

New this run: sources EIN-S-0111 to EIN-S-0116, basis photos EIN-M-0064 to EIN-M-0069, searches
EIN-Q-0271 to EIN-Q-0291. Adversary: Codex `gpt-6.1-sol` (codex-cli 0.162.1), runs
`adv-einstein-rooms-2026-10-20` and `-20b`.

Ratings: **BUILDABLE-FULL** (photos or drawings enough to model geometry and materials),
**BUILDABLE-PHOTO** (one good photo: a fast camera-projection "photo room"), **NO-PHOTO**
(gallery-case fallback), **ABSENT** (no verified fact for the chapter).

## Chapter table

| # | Chapter | Verified facts | Place | Photos (holder, id, date, rights, resolution, status) | Rating | Artifacts for the room |
|---|---|---|---|---|---|---|
| 1 | Birth and birthplace | EIN-F-0005 (born 14 March 1879 in Ulm, Germany) | The house at Bahnhofstrasse 20, Ulm (destroyed 17 December 1944, per the Commons description) | **EIN-M-0069** 1870 building plan, street elevations + ground plan + section, Stadtarchiv Ulm B 613 Bahnhofstr. 20 (file on Wikimedia Commons, Stadtarchiv gift upload), 4644 x 3125 px; rights: no holder statement found, `unknown`, reference only; status **disputed** (adversary refuted: the only rights wording is the Commons uploader's, not the holder's). Run einstein-euro-2026-10-22: no Stadtarchiv Ulm online catalogue or item rights statement found (EIN-Q-0292); Europeana lists five LBI/ANU "Birthplace of Albert Einstein; Bahnhofstrasse 20, Ulm" photographs (1945, InC-EDU, no holder item page): lead, reference only at best. **EIN-M-0075** (new, LoC pass 2026-10-22) LoC photochrom "[Ulm, Wurtemburg, Germany]", ca. 1890-1900, public-domain, verified, 1024 x 756: a city view for the setting, not the house | BUILDABLE-FULL (exterior street front from the plan; no interior) | none on file (the 1879 birth register entry, Stadtarchiv Ulm, is on Commons only: lead) |
| 2 | Education before the US | none (no verified fact on Munich, Aarau or ETH Zurich) | — | not searched beyond leads (no fact to link) | ABSENT | — |
| 3 | Leaving home and why | EIN-F-0109 (in 1933 renounced his German citizenship), EIN-F-0108 (immigrated to the United States). The reason is only single-source (EIN-F-0014 "for political reasons", EIN-F-0052 "after the Nazis came to power"), so no "why" is shown | No verified place (Berlin, Caputh and the Brussels legation are not in any fact) | none | NO-PHOTO | none |
| 4 | Arriving in the US | EIN-F-0122 (17 Oct 1933, Red Star liner Westernland), EIN-F-0123 (taken off at Quarantine, sped ashore by tug), EIN-F-0124 (landed at the Battery), EIN-F-0125, EIN-F-0126 (to Princeton by automobile), EIN-F-0128 (first lived at 2 Library Place) | Deck of the Westernland / the Battery, New York | none staged. Leads: Osher Map Library (Univ. of Southern Maine) postcard "S.S. Westernland" c.1932 and Red Star Line brochures c.1930 (no rights statement, no image file online); LoC has no Westernland item (re-checked 2026-10-22); **EIN-M-0074** (new) the Battery, New York, 1933, NYWT&S staff photograph, public-domain, verified, 1024 x 813 (veterans boarding a bus: the place, not his landing); no photograph of 2 Library Place at IAS | BUILDABLE-PHOTO (upgraded from NO-PHOTO: one 1933 street-level view of the Battery; label it the Battery in 1933, never his arrival) | newspaper pages EIN-S-0101 to -0104 (LoC Chronicling America, link only) |
| 5 | First work in the US | none verified (IAS appointment EIN-F-0008, EIN-F-0026 and the Fuld Hall office EIN-F-0088 are single-source) | (Fuld Hall, IAS, if EIN-F-0088 is corroborated; Fuld Hall opened 1939, so not his 1933 office) | existing items EIN-M-0028 (IAS E 41, 1955, CC BY, 2104 x 1518) and EIN-M-0029 (1955, CC BY, 3024 x 2419): Fuld Hall office, no person; IAS Fuld Hall floor plans c.1939/1947 (InC) as leads | ABSENT (would be BUILDABLE-FULL once EIN-F-0088 has a second holder) | — |
| 6 | Becoming a citizen | EIN-F-0001, EIN-F-0045 (declaration 1936-01-15), EIN-F-0056 (petition 4009, U.S. District Court for the District of New Jersey, Trenton), EIN-F-0057, EIN-F-0051 (1 Oct 1940, certificate from Judge Phillip Forman) | U.S. Post Office and Courthouse, 402 East State Street, Trenton (built 1932; the NRHP form says its courtrooms 1-3 are original and the floors hold U.S. District Court offices) | **EIN-M-0068** NRHP registration form 12000309 (NPS NPGallery), photo #26 "Third floor, ceremonial courtroom", 2005/2009, ~1630 x 1257 px grayscale, page 55 of the PDF; section 7 describes Courtroom 1 (oak wainscot, dais, ceiling) in detail; rights: no item statement, `unknown`, reference only; status **disputed** (G10 only: Codex could not open the 7.5 MB PDF live; content judged consistent). Also EIN-M-0002 (LoC NYWT&S, the 1940 ceremony itself, public-domain). **New 2026-10-22:** **EIN-M-0071** exterior, **EIN-M-0072** front entrance, **EIN-M-0073** interior corridors (LoC Highsmith 2010, public-domain, verified, jp2 up to 5514 px). NARA NAID 135815057 (same form, 138 MB, Restricted - Possibly) | BUILDABLE-FULL (upgraded from PHOTO: embeddable exterior, entrance and corridor plus the reference-only courtroom view and the NRHP description) | EIN-M-0019 (naturalization record, NARA, public-domain, 4 pages), EIN-M-0002 (ceremony photograph, public-domain), EIN-M-0053 (1943 letter enclosing naturalization papers) |
| 7 | The big work | EIN-F-0055 (24 July 1943, research for the Bureau of Ordnance in his study at Princeton), EIN-F-0138, EIN-F-0087 (home study at 112 Mercer Street), EIN-F-0086, EIN-F-0054, EIN-F-0062 to -0074 (Navy letters), EIN-F-0111 (pursued a unified field theory) | The study, 112 Mercer Street, Princeton (existing room) | existing: EIN-M-0043 (IAS E 39, 1986, InC-RUU, 3015 x 2408, verified), EIN-M-0044 (Burnett 1969, verified), EIN-M-0045 to -0048 (Burnett 1969, disputed), EIN-M-0013/-0014 (NARA 1943, public-domain, 5488 x 4404/4370), EIN-M-0030 to -0033, -0042 (IAS 1954, CC BY). Lead: IAS parlor 1986 (handle 20.500.12111/1135, InC-RUU, 3024 x 2419) | BUILDABLE-FULL (built) | EIN-M-0050 to -0057, EIN-M-0015, EIN-M-0059 (Navy letters and photos, see ARTIFACTS.md constellation 1) |
| 8 | Part of a historic event | EIN-F-0110 (signed a letter to President Roosevelt), EIN-F-0135 (Sachs delivered it 11 Oct 1939), EIN-F-0080, EIN-F-0075 (Emergency Committee of Atomic Scientists) | Nassau Point, Peconic, Long Island (the letter's heading), but that place fact (EIN-F-0136) is single-source | none staged. Leads: IAS "Helen Dukas at Nassau Point" 1938 (handles 20.500.12111/9837, /9838) and 1939 (/9839), InC-RUU, 2208-2904 px, outdoor views without Einstein; a 1939 portrait at Nassau Point whose copyright the Southold Historical Society owns | NO-PHOTO (BUILDABLE-PHOTO, reference only, once EIN-F-0136 is corroborated, for example by the FDR Library transcription) | EIN-M-0063 (letter to FDR, public-domain), EIN-M-0016 (ECAS letter 1947), EIN-M-0012 (with Nehru) |
| 9 | Why the Hall honours him | **EIN-F-0146** (awarded the 1921 Nobel Prize for Physics; NPS, Nobel, NHL form), **EIN-F-0147** (received his Nobel Prize in 1922; Nobel + NPS), **EIN-F-0148** (for his services to theoretical physics, and especially for his discovery of the law of the photoelectric effect; Nobel + NPS), all **verified** (run einstein-euro-2026-10-22). Room fact EIN-F-0149 (Nobel Lecture delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923) is single-source (Nobel page only). Earlier stand-in: EIN-F-0091, -0117, -0121 (1921 NAS / White House) | Kongresshallen, Jubileumsutställningen, Gothenburg, 11 July 1923 (the Nobel lecture) | **EIN-M-0070** Göteborgs stadsmuseum GhmF:148, A. W. Karnell, 1923-07-11, glass negative, interior of the hall from the audience with Einstein at the lectern, "Public Domain Mark" / "Upphovsrätt utslocknad", public-domain, web image about 750 x 595 (tif listed on the record); **disputed** (G10 only: JavaScript page unreachable for Codex; Codex judged it supported). Recorded as an item (it shows him), so it is both the chapter's artifact and the room view. Earlier: White House 1921 items EIN-M-0003 to -0005, -0034 to -0037, EIN-M-0026 | **BUILDABLE-PHOTO** (one interior view of the hall on the day; was NO-PHOTO / stand-in). The room title may use EIN-F-0146 to -0148 (verified); the Gothenburg place rests on EIN-F-0149 (single-source) plus the holder's own caption | EIN-M-0070 (embeddable once a person confirms the page); EIN-M-0062 (stamp). No open-licence image of the Nobel diploma or the 1922 ceremony found (nobelprize.org images are Nobel Foundation copyright) |
| 10 | Death and legacy | EIN-F-0006 (died 18 April 1955 at Princeton), EIN-F-0050, EIN-F-0107 (112 Mercer Street his home until his death in 1955), EIN-F-0132 (designated a National Historic Landmark in 1976), EIN-F-0133 (no alterations since he lived there), EIN-F-0134 | 112 Mercer Street, Princeton: the house front and street | **EIN-M-0064** IAS E 42, Alan Richards, undated, CC BY 4.0, 3000 x 2400, **verified**; **EIN-M-0065** IAS choir caroling in front of the house, Alan Richards, undated, CC BY 4.0, 1555 x 1240, **disputed** (G10 only: IAS page unreachable for Codex; content supported); **EIN-M-0066** IAS EB 081, colour, undated, InC-RUU, 2086 x 1505, **verified**, reference only; **EIN-M-0067** NPS NHL photograph 1975, 2226 x 1797, rights unknown, **verified**, reference only. Lead: IAS 1974 view (handle 20.500.12111/1131, InC-RUU, 736 x 1047) | BUILDABLE-FULL (four exterior views from three angles, two embeddable CC BY; the study room supplies the interior) | EIN-M-0017 (NHL file, link only); EIN-M-0062 (stamp) |

### LoC pass 2026-10-22 (run `einstein-loc-2026-10-22`)

loc.gov answered the JSON API again (polite client, one request at a time, 4.5 s spacing; HTTP 520
errors retried, no 403/429). Sources EIN-S-0119 to -0124, media EIN-M-0071 to -0076, searches
EIN-Q-0301 to -0311. Codex `gpt-6.1-sol` 6/6 supported; all **verified**, all public-domain under
the approved LoC rule:

| Media | Title (holder's) | LoC id | Date | Size (px) | Basis for | Chapter |
|---|---|---|---|---|---|---|
| EIN-M-0071 | Exterior, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton (Highsmith; "Built in 1932") | 2010719739 | 2010 | jp2 5514 x 2881 | EIN-F-0056 | 6 |
| EIN-M-0072 | Front entrance, same building | 2010719735 | 2010 | jp2 4908 x 2537 | EIN-F-0056 | 6 |
| EIN-M-0073 | Interior corridors, same building | 2010719742 | 2010 | jp2 4614 x 3258 | EIN-F-0056 | 6 |
| EIN-M-0074 | World War veterans leaving the Battery ... (NYWT&S staff photograph; "No known copyright restriction") | 2002709322 | 1933 | 1024 x 813 | EIN-F-0124 | 4 (the Battery in 1933; another event) |
| EIN-M-0075 | [Ulm, Wurtemburg, Germany], photochrom | 2002720824 | ca. 1890-1900 | 1024 x 756 | EIN-F-0005 | 1 (city view; not Bahnhofstrasse 20) |
| EIN-M-0076 | [Albert Einstein speaking], Harris & Ewing (item, not a basis photo) | 2016877613 | ca. 1940 | 817 x 1024 | none | portrait for any room |

The Highsmith Trenton set (2010719731 to -47) has exteriors, details, the entrance, corridors, WPA
murals and a postal window, but no courtroom view; the courtroom stays EIN-M-0068 (reference only).
LoC holds no Westernland photograph (EIN-Q-0305, -0306). The Zurich Polytechnikum photochrom
93506994 (c.1890-1900, "No known restrictions on publication") is a lead for chapter 2 if a
verified ETH fact appears; not staged.

Coordinates are in TOUR-RESEARCH.md (Ulm birthplace not geocoded; Trenton courthouse candidate
Q17509836 is now backed by the NRHP form's address, 402 East State Street).

## European archives pass (run einstein-euro-2026-10-22)

Lead ruling 2026-10-22: verify the Nobel Prize for chapter 9 and look for an open-licence image of
the diploma or ceremony. New: EIN-S-0117 (Nobel lecture page), EIN-S-0118 (Göteborgs stadsmuseum
GhmF:148), facts EIN-F-0146 to -0149, item EIN-M-0070, searches EIN-Q-0292 to -0300. Adversary:
Codex `gpt-6.1-sol` (codex-cli 0.162.1), run adv-20261022T010434-2745: 5 of 5 supported.

| Chapter | Before | After | Why |
|---|---|---|---|
| 9 Why the Hall honours him | NO-PHOTO (stand-in only) | **BUILDABLE-PHOTO** | Three verified Nobel facts; a public-domain 1923 interior of the Nobel lecture hall with Einstein (EIN-M-0070, disputed on G10 only) |
| 1 Birth | BUILDABLE-FULL (reference only) | unchanged | Stadtarchiv Ulm rights still unknown |
| 2 Education | ABSENT | unchanged | ETH E-Pics viewer gave no results in the pane; no verified fact to link a photo to |

Registry proposal (not edited; for `data/registry/PROPOSED.md`): **Göteborgs stadsmuseum**, kind
`museum`, exact host `samlingar.goteborgsstadsmuseum.se`, `may_be: ["institutional"]`. Evidence
2026-10-22: `https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402044` redirects (302)
to `/object/402044` on the same host; the page header and footer read "Göteborgs stadsmuseum,
Norra Hamngatan 12, 411 14 Göteborg, stadsmuseum@kultur.goteborg.se" (Carlotta collections system);
Europeana names the data provider "Museum of Gothenburg". The person adding it should check the TLS
certificate organization (the page needs JavaScript, so the adversary cannot read it live).

Open items: a person opens EIN-S-0118 and confirms "Public Domain Mark" to clear EIN-M-0070 (G10);
a second holder for EIN-F-0149 (Gothenburg lecture place) would make the room title verified; ask
the museum for the tif master (web image ~750 px).

## Recommended build priority (story value x photo quality)

| Rank | Room | Why |
|---|---|---|
| 1 | Chapter 10, 112 Mercer Street front (street + porch) | Two embeddable CC BY photographs (EIN-M-0064 verified) plus colour and 1975 references; the house is unchanged since his time (EIN-F-0133); it is the doorway into the existing study room (chapter 7), so the two rooms share one site. |
| 2 | Chapter 6, Trenton federal courthouse, ceremonial courtroom | The citizenship chapter is the Hall's core story and has the strongest artifacts (naturalization record and the 1940 ceremony photo, both public-domain); one courtroom photograph plus a detailed written description, and since 2026-10-22 three embeddable Highsmith views of the building (EIN-M-0071 to -0073). Label it the Trenton courthouse of the U.S. District Court, never "the room where he took the oath" (no source places the 1940 ceremony in this room). |
| 3 | Chapter 1, Ulm birthplace street front | A full set of 1870 elevations, plan and section makes an accurate exterior possible for a house that no longer exists; rights need the Stadtarchiv Ulm's own statement (reference-only modelling is allowed meanwhile). |
| 4 | Chapter 9, White House grounds 1921 (if the owner accepts the stand-in) | Public-domain LoC photographs of the place, with him in them. |
| 5 | Chapters 4, 8 | Chapter 4 now has a 1933 Battery street view (EIN-M-0074; LoC holds no Westernland photograph); chapter 8 waits for a second source for the Nassau Point heading (8). Chapters 2, 3, 5 stay absent until a verified fact exists. |

Chapter 7 (the study) is already built.

## Open items for a person

1. EIN-M-0065 and EIN-M-0068 are disputed only because the live pages could not be opened by the
   adversary (IAS Cloudflare check; a 7.5 MB NPGallery PDF). A reviewer can confirm the snapshot
   text on the live page and approve.
2. EIN-M-0069 (Ulm plan): ask the Stadtarchiv Ulm for its rights statement and an item page or
   master file; until then reference only. The Commons PD-old-70 tag is an uploader claim.
3. NPGallery shows only a site-wide copyright notice ("Permission must be secured from the
   individual copyright owners ... Digital assets without any copyright restrictions are public
   domain."), so NPS photographs (EIN-M-0067, -0068) are recorded `unknown`. The owner may rule
   whether a caption "NPS Photo" is enough to treat an image as a federal work.
4. Done 2026-10-22 (LoC pass): Highsmith Trenton views read (no courtroom view; three staged),
   Battery 1933 staged, Westernland not held by LoC.
5. Chapter 9 stand-in: whether the 1921 White House reception may carry the "why the Hall honours
   him" chapter until an award fact (Nobel, Copley, Franklin Medal) is corroborated.

## Ratio-lift pass (run `ratio-lift-2026-10-24`)

Task 14b: the ratio-lift research records (workspace `ratio-lift/`, ids RL-*) taken through
staging -> merge -> Codex adversary (gpt-6.1-sol) -> compute_status -> validate. Each record's notes
keep its RL id. Only **verified** (V) facts are content; D = disputed, S = single-source.
Sources EIN-S-0125 to -0128; searches EIN-Q-0312 to -0324 (run ratio-lift-2026-10-24).

| Chapter | New facts | Place | Basis photos | Rating change |
|---|---|---|---|---|
| 9 Why the Hall honours him (Gothenburg) | **EIN-F-0150 V** (Einstein delivered an address at Gottenberg, Sweden, before a scientific body on his theory of relativity), **EIN-F-0151 V** (King Gustaf among those present); both from the *Connecticut Hebrew Record*, 3 Aug 1923, p. 4 (LoC, primary). RL-F-001 split into these two atomic facts | Gothenburg ("Gottenberg" in the paper) | EIN-M-0070 (unchanged; the hall on 11 July 1923) | the room now has verified place facts; EIN-F-0149 stays single-source |
| 8 Part of a historic event (Nassau Point) | **EIN-F-0152 D** (letter heading: Old Grove Rd., Nassau Point, Peconic, Long Island, August 2nd, 1939, to F.D. Roosevelt), from NARA NAID 16608874 PDF p. 2, transcribed by hand and checked against the page image (EIN-S-0126, manual). Codex supported it twice; disputed on G10 only (the live PDF was unreachable to Codex, and a manual snapshot needs live confirmation) | Nassau Point (the letter's address) | none (IAS photos 403; reference only) | unchanged until a person confirms EIN-S-0126 live |
| 3 Leaving home | **EIN-F-0153 V** (informed the German Consulate in Brussels that he is renouncing his German citizenship; *Daily Worker*, 31 Mar 1933), **EIN-F-0154 V** (landed in Brussels from his trip to the United States; *Daily Alaska Empire*, 30 Mar 1933) | Brussels | none found (LoC: no Antwerp quay or Belgenland items) | NONE (a place now, no photo) |
