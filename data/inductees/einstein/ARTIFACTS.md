# Einstein artifacts (run einstein-docs-2026-10-20)

Real, holder-cleared documents and objects for the tour, organised as constellations (one central
item plus related items, Searchable Museum style). Every id below is on file; statuses are those
computed by `tools/compute_status.py` on 2026-10-20 after Codex adversary runs
`adv-einstein-docs-2026-10-20` and `-20b` (codex-cli 0.162.1, `gpt-6.1-sol`). Only `verified` media
with license_class public-domain / cc0 / cc-by are embeddable; only `verified` facts may supply
captions and paragraphs, and every paragraph below restates the cited claims' own words.

New ids this run: sources EIN-S-0107 to EIN-S-0110; facts EIN-F-0138 to EIN-F-0145; media
EIN-M-0050 to EIN-M-0063; 12 searches (run `einstein-docs-2026-10-20`).

## Counts

| | verified | single-source | disputed | other | total |
|---|---|---|---|---|---|
| Media before (HEAD 486bc7e) | 38 | 0 | 11 | | 49 |
| Media after | 51 | 0 | 12 (+ EIN-M-0058) | | 63 |
| Embeddable artifacts before (documents/objects, verified + usable) | 5: EIN-M-0015, -0016, -0019, -0012, -0002 | | | | |
| Embeddable artifacts after | 18 (+13): EIN-M-0050 to -0057, -0059, -0062, -0063, plus pages 2-3 of EIN-M-0015 | | | | |
| Facts before / after | 61 verified, 61 single-source, 3 disputed (137) / 62 verified (+EIN-F-0138), 67 single-source (+6: pipe, watercolor, stamp), 4 disputed (+EIN-F-0141, not atomic; replaced by EIN-F-0144/-0145) (145) | | | | |

Page images fetched with `tools/fetch_media.py` into `site/public/media/` (panel <= 2048 px,
room <= 768 px): EIN-M-0015-p2/-p3, EIN-M-0050-p1/-p2, -0051-p1, -0052-p1, -0053-p1,
-0054-p1/-p2, -0055-p1, -0056-p1/-p2, -0057-p1, EIN-M-0059. Original sizes: NARA letter pages
2273-2542 x 3051-3150 px; EIN-M-0059 4448 x 5520 px.

## Constellation 1. "Navy problems" (Princeton study, Stop 6) — theme: Science / Work

Centre: the rebuilt Princeton study at 112 Mercer Street (room recreation; basis per the
2026-10-16 owner decisions). Centre caption, from EIN-F-0087 and EIN-F-0055: "Albert Einstein
had a home study at 112 Mercer Street, Princeton, New Jersey." Date for the timeline: 1943-07-24
(EIN-F-0055).

Paragraph (EIN-F-0054, EIN-F-0062, EIN-F-0063, EIN-F-0055): Albert Einstein was working as a
consultant to the United States Government during World War II. Nine letters were written by
Albert Einstein to Lieutenant Stephen Brunauer of the Research and Development Division. They
relate to Einstein's research with the Research and Development Division of the Navy,
specifically underwater explosions and a proposed electromagnetic torpedo detonator. In July 1943
Dr. Albert Einstein is doing research for the Bureau of Ordnance, in his study at Princeton, N.J.

| # | Media | Item (holder, id) | Exact date | Theme | Caption (verified fact) | Pages / px | Interaction |
|---|---|---|---|---|---|---|---|
| 1 | EIN-M-0050 | Letter to Lt. Brunauer (NARA NAID 305247, RG 74) | 1943-05-17 | Work | EIN-F-0064: in regards to participating in the Research and Development Division of the Navy to research Navy problems | 2 / 2542 x 3150 | page-through, unfold |
| 2 | EIN-M-0015 | Letter to Lt. Brunauer (NAID 305248) | 1943-06-18 | Science | EIN-F-0065: an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship | 3 / 2443 x 3150 | page-through (now all 3 pages) |
| 3 | EIN-M-0051 | Letter (NAID 305249) | 1943-06-29 | Work | EIN-F-0066: will not be able to come to Washington, DC for health reasons | 1 / 2385 x 3063 | turn |
| 4 | EIN-M-0052 | Letter (NAID 305250) | 1943-07-30 | Science | EIN-F-0067: a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship | 1 | turn |
| 5 | EIN-M-0013, EIN-M-0014 | Navy photographs 80-G-42918/42919 (NAID 276538325/-328) | 1943-07-24 | Work | EIN-F-0055 | 5488 x 4404 / 4370 | zoom (photo on the desk) |
| 6 | EIN-M-0053 | Letter (NAID 305251) | 1943-08-13 | Citizenship | EIN-F-0068 (Vannever Bush offer, Division 8); EIN-F-0069: signed copies of a contract and naturalization papers were enclosed | 1 | turn (links to constellation 2) |
| 7 | EIN-M-0054 | Letter (NAID 305252) | 1943-08-22 | Science | EIN-F-0070: the best localization for installation of the torpedo explosion | 2 | page-through |
| 8 | EIN-M-0055, EIN-M-0059 | Letter (NAID 305253) and Navy photo 80-G-42917 (NAID 276538322) | 1943-09-01 | Work | EIN-F-0071 (experiments needed); EIN-F-0138: on 1 Sept. 1943 at Princeton, N.J. engaged in research work for the U.S. Navy | 1; photo 4448 x 5520 | turn; zoom |
| 9 | EIN-M-0056 | Letter (NAID 305254) | 1944-01-04 | Science | EIN-F-0072, EIN-F-0073: a torpedo positioned parallel to the wall of a ship; the idea proved impossible | 2 | page-through |
| 10 | EIN-M-0057 | Letter (NAID 305255) | 1944-10-15 | Science | EIN-F-0074: quick compression in a metal container | 1 | turn |

Room placement caution (LESSONS 2026-10-14): the letters' catalog records do not state where they
were written; show them as Navy correspondence of 1943-44, never as "written in this study".
Related IAS photographs of the study (EIN-M-0030 to -0033, -0042, CC BY, 1954) are later and
belong to the room, not to the 1943 timeline.

Recreation candidate in this constellation: Einstein's brier pipe (see below). Its facts
(EIN-F-0139, -0140, -0144, -0145) are single-source (one holder, Smithsonian) and may not caption
anything until corroborated.

## Constellation 2. "A famous citizen" (Trenton, Stop 5) — theme: Immigration & Citizenship

Centre: EIN-M-0019, Declaration of Intention and Petition for Naturalization (NARA at
Philadelphia, NAID 596270; Unrestricted -> public-domain; 4 page images, all already fetched as
EIN-M-0019-p1..p4). Date: 1936-01-15 (EIN-F-0045). Interaction: page-through and unfold, with the
affixed photograph as a hotspot (EIN-F-0057).

Paragraph (EIN-F-0001, EIN-F-0045, EIN-F-0056, EIN-F-0051): The record of naturalization for
Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival,
Declaration of Intention, Petition for Naturalization, and Oath of Allegiance. The Declaration of
Intention for Albert Einstein is from 1936-01-15. His Petition for Naturalization has petition
number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton. On 1940
Oct. 1, Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of
American citizenship.

| # | Media | Item | Exact date | Theme | Caption (verified fact) | Interaction |
|---|---|---|---|---|---|---|
| 1 | EIN-M-0019 | Naturalization record, NAID 596270 | 1936-01-15 | Citizenship | EIN-F-0001, EIN-F-0045, EIN-F-0056, EIN-F-0057 | page-through, unfold |
| 2 | EIN-M-0002 | "America gains a famous citizen", LoC NYWT&S (2004672481) | 1940-10-01 | Citizenship | EIN-F-0051 | zoom |
| 3 | EIN-M-0053 | Brunauer letter enclosing naturalization papers, NAID 305251 | 1943-08-13 | Citizenship | EIN-F-0069 | turn |

Only three cleared items exist for this stop; no courtroom photograph and no certificate image
were found (NARA holds the petition, not the certificate).

## Constellation 3. "This requires action" (Nassau Point 1939, Stop 4, and Princeton) — theme: Conscience

Centre: EIN-M-0063, Letter from Albert Einstein to President Franklin D. Roosevelt, 8/2/1939
(FDR Library, National Archives Identifier 16608874). Rights, holder's own words (DocsTeach,
National Archives, registry entry docsteach part_of nara): "Public Domain, Free of Known
Copyright Restrictions." Verified, public-domain. Pages: the letter is pp. 2-3 of the catalog PDF
psfa0064.pdf (21 pp., 3,428,369 bytes; page images 787-798 x 1000 px at 100 ppi, low resolution).
Date: 1939-08-02 (EIN-F-0136 is single-source; EIN-F-0135 verified for delivery). Interaction:
page-through (2 pages).

Paragraph (EIN-F-0110, EIN-F-0135, EIN-F-0080, EIN-F-0079, EIN-F-0075): Albert Einstein signed
a letter to President Roosevelt. Alexander Sachs delivered Einstein's letter to President
Roosevelt on October 11, 1939. Albert Einstein was Chairman of the Emergency Committee of Atomic
Scientists. In a letter of October 11, 1947, he wrote on behalf of the Committee regarding
questions, topics, and warnings concerning the use of nuclear or atomic resources as a means for
diplomatic or military solutions; in a letter of November 29, 1947, he writes as Chairman
discussing the issue of international atomic energy control.

| # | Media | Item | Exact date | Theme | Caption (verified fact) | Status |
|---|---|---|---|---|---|---|
| 1 | EIN-M-0063 | Letter to FDR (DocsTeach / NAID 16608874) | 1939-08-02 | Conscience | EIN-F-0110, EIN-F-0135 | verified, public-domain |
| 2 | EIN-M-0058 | ECAS letter, NAID 7873452 (2 pages, ~9.3 / 7.6 MB JPEG) | 1947-10-11 | Conscience | EIN-F-0079, EIN-F-0080 | disputed (rights; owner decision 2) |
| 3 | EIN-M-0016 | ECAS letter, NAID 7873451 (5 sheets + PDF) | 1947-11-29 | Conscience | EIN-F-0075 | verified, public-domain |
| 4 | EIN-M-0012 | Einstein and Prime Minister Nehru, NAID 348448945 | 1949-11-05 (catalog date) | Conscience | (no caption fact beyond the record title) | verified, public-domain |

Pages 7-9 of the same PDF hold FDR's memorandum to General Watson (13 Oct 1939), a draft reply
and FDR's reply to Einstein at Old Grove Road, Nassau Point, Peconic: federal records and strong
companions, but no item-level record or legible text source exists yet to caption them (OCR is
unusable). Staging them needs page-level records (tool request 2).

## Legacy (optional, any room) — theme: Legacy

| Media | Item | Exact date | Rights | Caption | Status |
|---|---|---|---|---|---|
| EIN-M-0062 | 8c Albert Einstein plate proof, Prominent Americans Issue, Plate No. 28398 (National Postal Museum 0.305037.5) | 1966-02-16 | "CC0" (page Usage field; si.edu: "This media is in the public domain") | EIN-F-0143 (single-source): subject of an 8c stamp of the Prominent Americans Issue | verified, cc0; 1916 x 2240 px; not fetched (tool request 1) |

Not tied to a stop place or date: show it only with its own date, never in a dated room title.

## Recreation candidates (rights-restricted photos only; owner may approve a labelled 3D recreation)

| Object | Holder, id | Reference photos | Facts (status) | Why it matters |
|---|---|---|---|---|
| Einstein's brier pipe | NMAH 1996.0006.01 (record nmah_334905), EIN-M-0060 link-only | 4 museum photographs (IDS NMAH-79-2614, NMAH-79-6255, ...), "Usage Conditions Apply" / "There are restrictions for re-using this image" | EIN-F-0139 gave it to Gina Plunguian in 1953; EIN-F-0140 hole worn through its bit; EIN-F-0144 wood; EIN-F-0145 15.8 cm x 3.6 cm (all single-source, one holder) | His best-known personal object; the museum calls it the most popular object in its Modern Physics collection. A recreation would show only the record's facts (wood, size, worn bit). |
| "Einstein in His Study", watercolor by Gina Plunguian | NMAH 1996.0006.02, EIN-M-0061 link-only | 1 image (IDS NMAH-NMAH2002-32476), usage conditions apply | EIN-F-0142 (single-source) | A 1953 view of the study by the pipe's recipient; private modelling reference for the study room only. |
| Nobel diploma, violin, compass, Oxford blackboard | not researched this run | none found | none | Owner's examples; no holder record was opened, so nothing is claimed. The IAS Fuld Hall blackboard photographs are already cleared (EIN-M-0028, -0029, CC BY). |

## Rejected or link-only candidates

| Candidate | Holder, id | Why |
|---|---|---|
| EIN-M-0049 (letter to FDR, file-unit record) | NARA NAID 16608874 | Adversary refuted twice: recorded "Unrestricted" differs from the item-level statement. Superseded by EIN-M-0063; a person should reject it (owner decision 1). |
| 1946 Emergency Committee letters | NARA | None found; the catalog's Emergency Committee letters are 1947 (EIN-M-0016, EIN-M-0058). |
| VOA / broadcast recordings | NARA 2839108 (Unrestricted, no digital object), 2133027 and 6919484 (1946-05-09, Princeton statement), 2363855, 135575, 570908, 472449885 | Restricted - Possibly (copyright note) or no audio online; link-only, not staged. |
| California 1931 photographs | LoC 2022886679-92 | "Rights status not evaluated". |
| Letter to Roman Totenberg, 1935 | LoC 2023864069 (Music Division) | Permission of the rights holders required. |
| [Albert Einstein speaking], Harris & Ewing | LoC 2016877613 | Staged 2026-10-22 as item **EIN-M-0076** ("No known restrictions on publication...", public-domain, verified, 817 x 1024); no place or date beyond "ca. 1940" in the record, so a portrait for any room, not a chapter artifact. |
| Smithsonian portraits and photographs | NPG 77.164, 2012.77.24, 88.201, 79.249, 79.251, 77.51, 2006.77 (Eisenstaedt), S/NPG.69.14, 78.16, 78.TC345, 66.6, 78.11, 67.16, 82.TC100, 80.64, 2010.54; NMAH "Einstein Before Blackboard" (Lucien Aigner, 1940), medals | Image rights restricted (usage conditions / copyright lines). NPG.72.56 (Julius C. Turner etching, 1921, CC0) is usable but not tied to a stop. |
| Smithsonian 3D | Open Access API and si.edu "3D Objects" facet | 0 Einstein 3D models. |
| Time card, poem, NHL nomination | NARA 597840, 519767870, 135813661 | Restricted - Fully / Possibly (already on file as EIN-M-0011, -0018, -0017). |

## Requests for the lead (not edited by this agent)

1. Tool: `tools/fetch_media.py` HOLDER_FILE_HOSTS has no Smithsonian entry; add
   `postalmuseum.si.edu -> ids.si.edu` (download https://ids.si.edu/ids/download?id=NPM-0_305037_5.jpg)
   to fetch EIN-M-0062.
2. Tool: page extraction from holder PDFs (EIN-M-0063 is pp. 2-3 of
   https://catalog.archives.gov/medialive/74/6088/16608874/content/arcmedia/presidential-libraries/roosevelt/psf/psfa0064.pdf),
   and a file-host mapping docsteach.org -> catalog.archives.gov for that record.
3. Registry: none needed this run.

## Owner decisions needed

1. Reject EIN-M-0049 in favour of EIN-M-0063 (same letter; EIN-M-0063 carries the National
   Archives' item-level wording "Public Domain, Free of Known Copyright Restrictions.").
2. EIN-M-0058 (ECAS letter 1947-10-11): the adversary refuted public-domain because the letter is
   written by Einstein, not by a federal agency, so NARA "Unrestricted" does not show federal
   creation. The same reasoning applies to the other Einstein-authored letters it accepted
   (EIN-M-0015, -0016, -0050 to -0057): the verdicts are inconsistent, and the approved rule
   (DECISIONS 2026-10-09) reads "records created by the federal government". General information,
   not legal advice: Einstein died in 1955, so in the U.S. his unpublished works passed life + 70
   years at the start of 2026; whether each letter was unpublished is not established here. The
   owner should decide whether the NARA rule covers privately written letters in federal files, or
   whether these need the holder's item-level statement (as DocsTeach gave for the FDR letter).
3. Whether to approve labelled 3D recreations of the pipe from the museum's restricted photographs
   used as private reference only (same terms as the rooms, DECISIONS 2026-10-16).
4. Corroboration for the pipe facts (a second holder) before they caption anything.

## European archives pass (run einstein-euro-2026-10-22)

| Media | Title | Holder, id | Date | Rights (holder's words) | Status | Room |
|---|---|---|---|---|---|---|
| EIN-M-0070 | Albert Einstein, Nobel Lecture to the Nordic Assembly of Naturalists, Kongresshallen, Gothenburg, July 11, 1923 | Göteborgs stadsmuseum, GhmF:148 (photo A. W. Karnell, 1871-1934) | 1923-07-11 | "Public Domain Mark"; copyright field "Upphovsrätt utslocknad": public-domain | disputed (G10 only: browser snapshot, page unreadable live to Codex; content supported) | Chapter 9, centre object and room view |

Facts for its caption: EIN-F-0146, EIN-F-0147, EIN-F-0148 (verified: the 1921 Nobel Prize for
Physics, received in 1922, for the photoelectric effect); EIN-F-0149 (Gothenburg lecture, single-source).
No open-licence image of the Nobel diploma or the 1922 award was found: nobelprize.org images are
Nobel Foundation copyright; Europeana's other Einstein Nobel hits are LBI (InC-EDU) and TopFoto (InC).
