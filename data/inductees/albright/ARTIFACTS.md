# Madeleine Albright: artifacts and constellations

Run `albright-artifacts-2026-10-20`. Adversary: Codex `gpt-6.1-sol` (codex-cli 0.162.1), run
`adv-20261020T165709-82a0`: 9 judged, 9 supported. `validate.py albright`: exit 0.

Owner rule 2026-10-20 (privately written items): a letter, memo or application is embeddable only if every author died before 1956, the holder explicitly states public domain, or it was published before 1931; NARA "Unrestricted" alone is not a grant; federal-government-created records stay public domain. Applied below: Albright died 2022-03-23 (ALB-F-0004), so her handwritten letters (ALB-M-0054 pp. 1-2, ALB-M-0056) are link-only until the owner rules whether a Secretary of State's handwritten letter to the President is an official federal record. ALB-M-0054 pp. 3-7 (State Department release) and ALB-M-0055 (typed memorandum cleared by State Department staff) are federal records; ALB-M-0055 needs the owner's confirmation. All photographs listed are by White House, Vice Presidential or State Department photographers (federal works) or LoC items under the approved LoC rule. Each media record's notes carry the authors and death years.

**Outcome after the rule (tools/set_authorship.py, apply_rights_rule.py, Codex re-judgement, 2026-10-20):** ALB-M-0054, -0055 and -0056 were recorded as `federal` (official correspondence of the Secretary of State, author Madeleine K. Albright, d. 2022, ALB-F-0004). Codex did not accept that: the NARA records name only the federal series creator and custody, not federal authorship of the letters (0054, 0055 unclear; 0056 refuted). All three are now **disputed** and go to the owner: either rule them official records (federal, public domain; the scans show Secretary of State letterhead) or `private` (link-only, Albright died 2022). They are removed from the build until then. ALB-M-0048 (swearing-in video, White House Television Office) is `federal`, verified.

Rules used here: an artifact is embeddable only when it is `verified` with licence public-domain,
cc0, cc-by or cc-by-sa, from the holder's own rights field (NARA `useRestriction.status`
"Unrestricted" = public-domain under the approved rule). Captions and paragraphs below restate
verified facts only; each sentence names its fact ids. Status words are the package's own.

## Counts

| | Before (2026-10-20) | After |
|---|---|---|
| Media records | 53 | 61 |
| Usable (verified + open licence) | 12 | 17 (ALB-M-0057..0061 new; ALB-M-0054..0056 disputed, see below) |
| Facts verified | 71 | 72 (new ALB-F-0196) |
| Sources | 124 | 128 |
| Image files built to site/public/media | 0 | 15 (content/albright/media-files.json); ALB-M-0054, -0055, -0056 not built (below) |

New media: ALB-M-0054..0061 (all NARA, "Unrestricted", verified public-domain).

## Artifacts by stop

Resolution is the holder's file as served by the NARA catalog (`objectUrl`) or LoC (`tile.loc.gov`).

### Stop 1. Prague

| Media | Title (holder's) | Holder + id | Date | Rights | Pages | Size | Facts | Interaction |
|---|---|---|---|---|---|---|---|---|
| ALB-M-0054 | Letter from Madeleine Albright to President Clinton | William J. Clinton Library (NARA), NAID 131043289 | not in the catalog record (see note A) | Unrestricted, public-domain | 7 (pp. 1-2 handwritten letter on Secretary of State letterhead; pp. 3-7 typed State Department release) + PDF | 3351 x 4031 px | context: ALB-F-0095, ALB-F-0041 (placement needs a reviewer, note A) | page-through; unfold pp. 3-7 |
| ALB-M-0057 | President Clinton with Madeline Albright and Warren Christopher | Clinton Library, NAID 183373904 (42-WHPO-P02724-26), photographer Robert McNeely | 1993-04-20 | Unrestricted, public-domain | 1 | catalog JPG | ALB-F-0196 (new) | photo panel |

Link-only (rights-restricted): ALB-M-0043 Havel and Albright; ALB-M-0045 Order of the White Lion
pin, 1997 (Read My Pins). Text source shown as a link: ALB-S-0074, her 14 July 1997 address
(State Department archive transcript).

### Stop 4. Arrival, New York Harbor, 1948, and citizenship

| Media | Title | Holder + id | Date | Rights | Facts | Interaction |
|---|---|---|---|---|---|---|
| ALB-M-0017 | Madeleine Albright Make Remarks During the Naturalization Ceremony at the National Archives | NARA, NAID 445648831 | 2016-09-14 | public-domain | ALB-F-0074 | photo panel |
| ALB-M-0052 (basis photo) | Liner, "America" | LoC, Harris & Ewing, 2016876065 | 1938 or 1939 | public-domain | basis for ALB-F-0185 (single-source) | room/ship reference, never captioned as her voyage |

No passenger manifest found (searches ALB-Q-0328..0330): New York arrival lists for 1948 are not
digitized in the NARA catalog.

### Stop 7. United Nations, New York (1993-1997)

| Media | Title | Holder + id | Date | Rights | Pages | Facts | Interaction |
|---|---|---|---|---|---|---|---|
| ALB-M-0058 | V000113, January 27, 1993 (contact sheet) | NARA, Vice Presidential Photographs, NAID 24326093 | 1993-01-27 | public-domain | 2 images | ALB-F-0141 | turn (contact sheet as object) |
| ALB-M-0002 | Madeleine K. Albright before the Sen. For. Rel. Cmte during her confirmation hearing | LoC 2019646238 | 1993-01 | public-domain | 1 | ALB-F-0051 | photo panel |
| ALB-M-0057 | (see stop 1) | | 1993-04-20 | | | ALB-F-0196 | photo panel |
| ALB-M-0061 | Ambassador Albright with Ambassador Steinberg Upon Her Arrival in Angola | NARA RG 59, 59-PA-367-1, NAID 404793993 | 1996-01 | public-domain | 2 images (front + second) | ALB-F-0142 | photo panel |
| ALB-M-0049 (basis photo) | U.N. Security Council Chamber | LoC 2020735470 (Bernard Gotfryd) | 1977-1981 | public-domain | 1 | room basis only | room |

### Stop 8. Secretary of State, Washington (1997-2001)

| Media | Title | Holder + id | Date | Rights | Pages | Facts | Interaction |
|---|---|---|---|---|---|---|---|
| ALB-M-0056 | Letter from Madeline Albright to President William Jefferson Clinton | Clinton Library, President Has Seen Files, NAID 163545400 | not in the record (note A) | public-domain | 2 + PDF, 2513 x 3017 px | context: ALB-F-0195 (note A) | turn / page-through |
| ALB-M-0059 | Swearing-In Ceremony for Madeleine Albright as Secretary of State | Clinton Library, NAID 131493882 (P49689-09a), photographer Ralph Alswang | 1997-01-23 | public-domain | 1 (3 MB JPG) | ALB-F-0193, ALB-F-0138 | photo panel |
| ALB-M-0014 | Madeleine Albright speaks at her swearing-in ceremoney as Secretary of State | NARA, NAID 183374012 | 1997-01-23 | public-domain | 1 | ALB-F-0193 | photo panel |
| ALB-M-0048 | Remarks at the Swearing-In of Madeleine K. Albright as Secretary of State and an Exchange With Reporters (video record) | NARA, NAID 521066039 | 1997-01-23 | public-domain | video | ALB-F-0193 | her recorded words (play) |
| ALB-M-0015 | Secretary of State Madeleine Albright shakes hands with American family members | NARA, NAID 6496756 | 1997-02-22 | public-domain | 1 | ALB-F-0059 | photo panel |
| ALB-M-0016 | President Clinton and Secretary of State Madeleine Albright Talk During the Wye River Plenary Session | NARA, NAID 131493884 | 1998-10-15 | public-domain | 1 | (no fact linked yet) | photo panel |
| ALB-M-0060 | Secretary Madeleine K. Albright at the Truman Library, Independence, Missouri | NARA RG 59, 59-PA-366-3, NAID 505632161 | 1999-03 | public-domain | 1 TIFF master | ALB-F-0150 | photo panel |
| ALB-M-0055 | Memo from Madeleine Albright to President Clinton | Clinton Library, NAID 131043614 | not in the record (note A) | public-domain | 3 + PDF, 3351 x 4031 px | none (note A) | page-through |
| ALB-M-0050, ALB-M-0053 (basis photos) | War Department Building (State Department building) exteriors | LoC | ca. 1940, ca. 1943 | public-domain | | room basis | room |

Also on file, usable, outside the stops: ALB-M-0001 (1988, Dukakis adviser), ALB-M-0010 (2008 DNC),
ALB-M-0018 (Obama greeting).

**Note A (reviewer):** the NARA records for ALB-M-0054, -0055 and -0056 carry only a title; no
date, description or transcription. What the scans show (read by the agent, NOT facts): ALB-M-0054
p. 1 is dated "July 14, 1997", written on the way back from Prague, followed by the text of "A
Moment of Celebration and of Dedication", address to the people of Prague, Obecni Dum, July 14,
1997; ALB-M-0056 is dated "January 15, 2001"; ALB-M-0055 is dated December 4, 2000, subject "White
House Conference on Culture and Diplomacy". None of this may appear in captions until a holder
transcription (Clinton Library, or NARA Citizen Archivist transcription, fetchable through the
approved contributions endpoint) or a person's reviewed transcription exists. Placing ALB-M-0054
in the Prague room is a curatorial choice a reviewer must confirm.

## Constellations (Searchable Museum style)

Each item: theme tag, date for the timeline, one-line caption, facts. Paragraphs use verified
facts only.

### Constellation A. "Back to Prague" (stop 1, Prague)

- **Centre (pending owner ruling):** ALB-M-0054, Letter from Madeleine Albright to President
  Clinton (document, 7 pages; page-through). Disputed: federal or private authorship (above).
  Theme: Diplomacy / Homeland. Date: catalog undated (scan reads 1997-07-14; note A). Caption:
  holder title. **Until ruled, the centre is ALB-M-0057** (photograph, federal, 1993-04-20, the
  Havel book), and ALB-M-0054 is a link.
- Paragraph (facts ALB-F-0041, ALB-F-0080, ALB-F-0095, ALB-F-0071): Madeleine Albright was born
  in Prague, Czechoslovakia. On July 14, 1997, Secretary of State Madeleine K. Albright addressed
  the people of Prague at Obecni Dum. Between 5 and 8 March 2000 she visited Prague and Brno,
  where she met with President Václav Havel.
- Related items:
  | Item | Kind | Theme | Date | Caption | Facts |
  |---|---|---|---|---|---|
  | ALB-M-0057 | photograph | Diplomacy | 1993-04-20 | President Clinton, United Nations Ambassador Madeleine Albright and Secretary of State Warren Christopher look at a book given to the President by President Vaclav Havel of Czechoslovakia. | ALB-F-0196 |
  | ALB-S-0074 | her own words (transcript link) | Homeland | 1997-07-14 | Address to the people of Prague at Obecni Dum. | ALB-F-0095 |
  | ALB-M-0043 | photograph (link only, rights-restricted) | Diplomacy | | President Václav Havel and Secretary Albright. | |
  | Order of the White Lion pin | object, recreation candidate | Honours | 1997 | (needs owner approval; see below) | ALB-F-0011 (single-source) |
  | ALB-M-0060 | photograph | Diplomacy | 1999-03 | Secretary Madeleine K. Albright at the Truman Library, Independence, Missouri, for the NATO Enlargement Ceremony. | ALB-F-0150 |
  | Prague birthplace / room | place | Immigration & Migration | 1937-05-15 | Madeleine Albright was born in Prague on May 15, 1937. | ALB-F-0041, ALB-F-0003 |

### Constellation B. "A Seat at the United Nations" (stop 7)

- **Centre:** ALB-M-0058, contact sheet V000113 (object; turn). Theme: Diplomacy. Date: 1993-01-27.
  Caption: "Contact sheet with photographs of Vice President Gore swearing in Madeleine Albright as
  Ambassador to the United Nations."
- Paragraph (ALB-F-0029, ALB-F-0051, ALB-F-0141, ALB-F-0170): In 1993 Albright was appointed
  Ambassador to the United Nations by President Clinton. She testified in front of the Senate
  Foreign Relations Committee during her confirmation hearing, and Vice President Gore was
  photographed swearing her in on January 27, 1993. From 1993 to 1997 she served as the U.S.
  Permanent Representative to the United Nations.
- Related items:
  | Item | Kind | Theme | Date | Caption | Facts |
  |---|---|---|---|---|---|
  | ALB-M-0002 | photograph | Diplomacy | 1993-01-23 | Madeleine Albright testifying before the Senate Foreign Relations Committee during her confirmation hearing. | ALB-F-0051 |
  | ALB-M-0057 | photograph | Diplomacy | 1993-04-20 | (as above) | ALB-F-0196 |
  | ALB-M-0061 | photograph (2 images) | Diplomacy | 1996-01 | Ambassador Albright with Ambassador Steinberg upon her arrival in Angola, January 1996. | ALB-F-0142 |
  | ALB-M-0049 | room basis photograph | Place | 1977-1981 | U.N. Security Council Chamber (not of her tenure). | room basis |
  | Serpent pin | object, recreation candidate | Diplomacy | | (owner approval needed) | none verified |

### Constellation C. "Secretary of State" (stop 8)

- **Centre:** ALB-M-0059, Swearing-In Ceremony for Madeleine Albright as Secretary of State
  (photograph; federal). Theme: Leadership. Date: 1997-01-23. Caption: holder title. If the owner
  rules her handwritten letters federal records, ALB-M-0056 (farewell letter, 2 pages; turn; scan
  reads 2001-01-15, note A) becomes the centre.
- Paragraph (ALB-F-0023, ALB-F-0193, ALB-F-0138, ALB-F-0162, ALB-F-0194, ALB-F-0195): Madeleine
  Korbel Albright was confirmed as Secretary of State by the U.S. Senate on January 22, 1997, and
  was sworn in in the Oval Office on January 23, 1997; Vice President Gore administered the oath.
  She was Secretary of State from 1997 to 2001. From her office she had been able to look out over
  the Mall, to the Lincoln Memorial and the Washington Monument. Her farewell remarks at the
  Department were on January 19, 2001.
- Related items:
  | Item | Kind | Theme | Date | Caption | Facts |
  |---|---|---|---|---|---|
  | ALB-M-0056 | document, link-only pending owner ruling | Leadership | catalog undated | Letter from Madeline Albright to President William Jefferson Clinton. | none (note A) |
  | ALB-M-0048 | her recorded words (video) | Leadership | 1997-01-23 | Remarks at the swearing-in, with an exchange with reporters. | ALB-F-0193 |
  | ALB-M-0015 | photograph | Diplomacy | 1997-02-22 | Shaking hands with American family members at Camp Bonifas, Panmunjom, South Korea. | ALB-F-0059 |
  | ALB-M-0060 | photograph (TIFF) | Diplomacy | 1999-03 | At the Truman Library, Independence, Missouri, for the NATO Enlargement Ceremony. | ALB-F-0150 |
  | ALB-M-0055 | document (3 pages), disputed pending owner ruling | Diplomacy | catalog undated | Memo from Madeleine Albright to President Clinton. | none (note A) |
  | ALB-M-0017 | photograph | Citizenship | 2016-09-14 | Remarks at the naturalization ceremony at the National Archives. | ALB-F-0074 |

Optional constellation D, "Arrival" (stop 4): centre ALB-M-0017; paragraph from ALB-F-0175,
ALB-F-0183, ALB-F-0184, ALB-F-0026, ALB-F-0074; related ALB-M-0052 (ship basis photo, labelled as
the liner, not her voyage), ALB-S-0067 (1998 naturalization-ceremony remarks, link). Thin on
objects; no manifest.

## Recreation candidates (rights-restricted or no open image; owner decides)

| Object | Holder | Reference photos | Why it matters |
|---|---|---|---|
| Serpent pin | Albright collection; Read My Pins (State Department, National Museum of American Diplomacy) | ALB-M-0028 (readmypins.state.gov, rights-restricted), ALB-S-0085 | the pin story from her UN years |
| Order of the White Lion pin, 1997 | Read My Pins | ALB-M-0045 (rights-restricted) | honour received in Prague (ALB-F-0011, single-source) |
| Secretary of State Diamond Eagle pin | Read My Pins | ALB-S-0084 | symbol of office |
| Breaking the Glass Ceiling pin; Bug pin; American Flag pin; Peace Dove pin | Read My Pins | ALB-S-0087, -0086, -0091, -0090 | pins tied to milestones |
| Pins 2012.0098.01-.03, identification badge .04 (2000), scarf .05, cards .06-.09, stationery .10, paper pad .11, glasses .12, cosmetics case .13, briefcase .14, helmet .15, necklace .16, red suit .17, red shoes .18 | Smithsonian NMAH, accession 2012.0098 (credit line "Albright") | none online (Open Access API: no media; object page HTTP 403 on 2026-10-20) | personal objects of a Secretary of State; ask NMAH for images |

## Rejected or not staged

| Candidate | Why |
|---|---|
| NAID 646482963 (farewell letter PDF, Thank You Letters, Jan. 20, 2001) | second copy of ALB-M-0056; not staged |
| NSC / First Lady file units with Albright speeches (NAID 40478374 and others) | "Restricted - Possibly" |
| NAID 18471265 Albright interview (Dayton oral history) | "Restricted - Possibly" |
| NMAH Diana Walker photographs 2003.0250.121-.124 | already ALB-M-0023 (rights-restricted) |
| 1948 SS America passenger manifest | not online in the NARA catalog |
| Smithsonian 3D | none for Albright |

## Registry and tool requests (for the lead; not edited)

- Transcriptions for ALB-M-0054/-0055/-0056 (note A) so the letters' own words can become facts.
- Smithsonian Open Access API key (DEMO_KEY rate-limited) to re-run NMAH object searches.
- loc.gov returned HTTP 429 to every search on 2026-10-20. Re-run 2026-10-22 (run
  `albright-loc-2026-10-22`, ALB-Q-0358 to -0371): the "Madeleine Albright" photo search (54 results)
  returned CQ Roll Call frames of 1997-1999 events already represented on file (ALB-M-0004 etc.);
  no new artifact staged. Ten public-domain room basis photos were added (ALB-M-0072 to -0081: London
  shelter, S.S. America interiors 1940/1946, Oval Office, Truman Library, Prague; see ROOMS.md).

## Pins in official photographs (run albright-pins-2026-10-22)

Owner decision 2026-10-22: no 3D recreations or close-up museum photographs of her brooches.
Instead, official U.S. Government photographs (federal works) in which she is wearing a pin, at a
moment that is a verified fact. "Pin visible" below is the agent's observation of the image, not a
fact: captions never mention a pin unless a source names it. A brooch is linked (link-only) only
where a source identifies which pin she wore at that moment. Codex `gpt-6.1-sol`, run
`adv-20261022T010929-5746`: 8 judged, 8 supported. `validate.py albright`: exit 0.

| Media | Photograph (holder's title) | Holder, id, photographer | Moment | Fact ids | Brooch (sourced) |
|---|---|---|---|---|---|
| ALB-M-0059 (= ALB-M-0014, same frame) | Swearing-In Ceremony for Madeleine Albright as Secretary of State | Clinton Library, P49689-09a, NAID 131493882 (183374012); Ralph Alswang, White House Photograph Office | 1997-01-23, Oval Office | ALB-F-0193, ALB-F-0138 | **Yes.** Read My Pins (ALB-S-0084) names the antique Secretary of State Diamond Eagle pin for this ceremony (fact ALB-F-0136, single-source); link-only ALB-M-0027 / https://readmypins.state.gov/see-the-pins/symbols-of-service/secretary-of-state-diamond-eagle-pin |
| ALB-M-0057 | President Clinton with Madeline Albright and Warren Christopher | Clinton Library, 42-WHPO-P02724-26, NAID 183373904; Robert McNeely | 1993-04-20, Oval Office | ALB-F-0196 | no source names the pin |
| ALB-M-0061 | Ambassador Albright with Ambassador Steinberg Upon Her Arrival in Angola | NARA RG 59 (State Department), 59-PA-367-1, NAID 404793993; no photographer named | 1996-01, Angola | ALB-F-0142 | no source names the pin |
| **ALB-M-0071 (new)** | Secretary of Defense William Cohen, accompanied by ... Secretary of State Madeleine Albright (right), speaks during a press conference, held July 8, 1997, at the Miguel Angel Hotel, Madrid, Spain | NARA RG 330 (DoD), 330-CFD-DD-SD-03-01644, NAID 6598395; R. D. Ward ("Civilian": federal employment not stated, reviewer to confirm) | 1997-07-08, Madrid (NATO summit) | **ALB-F-0200 (new, verified)** | no source names the pin |
| **ALB-M-0070 (new)** | Madeleine Albright Make Remarks During the Naturalization Ceremony at the National Archives in Washington, D.C. | NARA RG 64, 64-CFDA-20160914-01-095, NAID 445648821; no photographer named | 2016-09-14, National Archives Rotunda | ALB-F-0198 | no source names the pin |
| ALB-M-0017 | (same title; frame -100, distant view) | NARA RG 64, NAID 445648831 | 2016-09-14 | ALB-F-0198 | no |

All six records now carry `authorship.kind: federal` (photographer where the record names one);
all are verified, licence public-domain (NARA "Unrestricted" under the approved rule).

Captions (the holder's words or verified facts only):
- ALB-M-0059: "Madeleine Albright was sworn in as Secretary of State in the Oval Office on January 23, 1997." (ALB-F-0193). With the brooch link: "In honor of her swearing-in as Secretary of State on January 23, 1997, Albright acquired an antique eagle pin." (ALB-F-0136, single-source: needs review before publication).
- ALB-M-0071: "On July 8, 1997, at the Miguel Angel Hotel, Madrid, Spain, Secretary of State Madeleine Albright and Secretary of Defense William Cohen talked to reporters about the decision, made at the NATO summit, to invite Poland, Hungary, and the Czech Republic to begin accession negotiations to join the NATO alliance." (ALB-F-0200)
- ALB-M-0070: "On September 14, 2016, Madeleine Albright was at the naturalization ceremony at the National Archives in Washington to make remarks." (ALB-F-0198)

Gaps (searches ALB-Q-0352 to -0357):
- Sourced pin moments with a federal photographer but no online federal photograph: Sunburst pin,
  walking from Marine One, 1999 (Clinton Library/Sharon Farmer, ALB-S-0092: no catalog item found);
  Bug pin, UN news conference, 14 Sep 2000 (U.S. Department of State, ALB-S-0086); Peace Dove pin,
  Rwanda, 1997 (U.S. Department of State, ALB-S-0090). The RG 59 Albright photo series (NAID
  75495855) has 631 file units but only 7 items described online; a digitization request for the
  file units "United Nations General Assembly" (Sept 2000) and the December 1997 Africa trip would
  close two of these.
- 2012 Medal of Freedom: the three digitized Obama Library frames (NAIDs 674695906/-10/-12) show
  other recipients, not Albright. 1999 NATO: ALB-M-0060/-62/-63 (Truman Library) show no pin clearly.
- Viewed and not staged (no pin clearly visible): Wye River 1998 (ALB-M-0016), Korea 1997, Zagreb
  1994, Sarajevo 1997, Camp David 2000, Oslo 1999, Angola 1997, Hickam 2000, Obama 2010 (ALB-M-0018).
