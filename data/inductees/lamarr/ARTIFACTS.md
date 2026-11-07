# Hedy Lamarr: artifacts (documents and objects) for the tour rooms

Run `lamarr-artifacts-2026-10-20`, agent `artifacts-lamarr-muir`. Every search is in `searches.jsonl`
(run id `lamarr-artifacts-2026-10-20`). Nothing here is publishable until a reviewer approves it
through `review/decisions.jsonl` (G8). Captions and paragraphs below use only the words of the
verified facts they cite; the site copy must still pass `check_grounding.py` (G6).

## Counts

| | before | after |
|---|---|---|
| Embeddable verified artifacts (documents and photographs with page/image files) | 5 (LAM-M-0001, -0013, -0014, -0015, -0022) | 7 (+ LAM-M-0028; LAM-M-0023 basis photo also fetched) |
| Page/image files in `site/public/media/` | 0 | 29 (`content/lamarr/media-files.json`) |
| Facts | 100 (verified 34 at the start of this run) | 108 (verified 41) |

Fact detail: 8 new facts LAM-F-0101 to LAM-F-0108 from the M-92 file transcriptions (LAM-S-0059).
LAM-F-0101 was judged non-atomic and withdrawn (status rejected); LAM-F-0102 to -0108 are verified
(primary document, adversary `codex:gpt-6.1-sol`, live check unreachable on an api snapshot).
Totals now: facts verified 41, single-source 56, disputed 9, rejected 2; media verified 20.

## Artifacts by stop

| Stop | Media id | Title | Holder + id | Date | Rights (holder's words) | Pages / files | Resolution (largest) | Facts it supports | Interaction |
|---|---|---|---|---|---|---|---|---|---|
| 1 Vienna (family) | LAM-M-0028 (new) | M-92 Hedwig Loder (Née Lamarr) | NARA, RG 260, Correspondence Relating to Claims and Queries, NAID 74395327 | 1945-12-07 to 1946-01-24 | "Unrestricted" (public-domain under the approved rule) | 9 (p1 file cover; p2 USFA memo 7 Jan 1946; p3-4 Paul Reiner letter of December 7th 1945; p5 reply 7 Jan 1946; p6 cover 24 Jan 1946; p7-9 British Element ACA letter 12 Jan 46) | 4684x4565 (p1), letter p3 2740x3598 | LAM-F-0102, -0103, -0104, -0105, -0106, -0107, -0108 | page-through; unfold the two-page letter |
| 3 MGM | LAM-M-0013 | Actress Hedy Lamarr, 1939 | UCLA Library Special Collections (LA Times photographic archive) | 1939-01-19 | CC BY 4.0 (holder statement on file) | 1 | 2049x2575 | (portrait) | turn (photo print front) |
| 4 Naturalization | LAM-M-0022 | Petition for Naturalization for Hedwig Maria Stauffer | NARA Riverside, NAID 335708097 | 1939-1953 | "Unrestricted" | 9 JPG (335708097-01..09) | 2618x3175 (p1) | LAM-F-0001, -0007 to -0011 | page-through; unfold declaration |
| 4 Normandie arrival (basis photo) | LAM-M-0023 | S.S. Normandie arriving in New York Harbor on maiden voyage | LoC P&P LC-USZ62-90162 | 1935 | "No known restrictions on publication..." | 1 (TIFF master) | 1536x1098 | basis for LAM-F-0024 stop | context image |
| 5 Bel-Air invention | LAM-M-0001 | Patent Case File No. 2,292,387, Secret Communication System | NARA Kansas City, RG 241, NAID 167820368 | 1941-06-10 to 1942-08-11 | "Unrestricted" | 7 of 43 fetched: _34 petition and power of attorney, _33 signatures and oath, _05 and _06 drawing sheets, _07 printed patent, _39 notice of allowance, _41 final fee | about 2500x3300 | LAM-F-0046, -0084, -0090 to -0097 | page-through; unfold the drawing sheet |
| 5 / later life | LAM-M-0014 | Actress Heddy LaMarr at the "Tales of Manhattan" film premiere, 1942 | UCLA Library Special Collections | 1942-08-05 | CC BY 4.0 | 1 | 2049x2563 | (photo) | turn |
| 5 / later life | LAM-M-0015 | Actress Hedy LaMarr and John Loder in courtroom, 1946 | UCLA Library Special Collections | 1946-05-20 | CC BY 4.0 | 1 | 2049x2563 | context for LAM-F-0107 (Loder marriage name) | turn |

Link-only (verified records, rights not usable): LAM-M-0002 (NARA photo with John Loder and Denise,
1946, "Restricted - Possibly"), LAM-M-0003 and -0004 (NARA newsreels, unknown), LAM-M-0009 and -0010
(LoC MGM posters *Ziegfeld Girl* 1941 and *Boom Town* 1940, "Rights status not evaluated"), LAM-M-0012
and -0016/-0017 (rights-restricted photographs).

## Constellations (Searchable Museum style)

Theme tags: Immigration & Migration, Family, Film, Invention, Citizenship, Legacy.

### Constellation A: "Secret Communication System" (stop 5, Bel-Air) — centre LAM-M-0001

| Item | Media / page | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: patent case file, petition page | LAM-M-0001-p34 | Invention | 1941-06-10 | Hedy Kiesler Markey and George Antheil, petitioners to the U.S. Patent Office on Jun 10 1941, of 11805 Bellagio Road, Bel-Air. | LAM-F-0093 |
| Drawing sheet 1 | LAM-M-0001-p5 | Invention | 1941-06-10 | Secret Communication System, by Hedy Kiesler Markey and George Antheil, filed June 10, 1941. | LAM-F-0091 |
| Signatures and oath | LAM-M-0001-p33 | Invention | 1941 | In 1941 Hedy Kiesler Markey and George Antheil signed at Los Angeles, Calif., as inventors. | LAM-F-0096 |
| Notice of allowance | LAM-M-0001-p39 | Invention | 1941-11-13 | The United States Patent Office allowed the application with 6 claims. | LAM-F-0092 |
| Printed patent | LAM-M-0001-p7 | Invention | 1942-08-11 | Patent 2,292,387, Secret Communication System, was patented Aug. 11, 1942. | LAM-F-0090, LAM-F-0084 |
| Player-piano record (recreation candidate, see below) | none yet | Invention | — | The system contemplates employing records of the type used for many years in player pianos. | LAM-F-0094, LAM-F-0095 |
| Tales of Manhattan premiere photo | LAM-M-0014 | Film | 1942-08-05 | Actress Heddy LaMarr at the "Tales of Manhattan" film premiere in Los Angeles, Calif., August 5, 1942. | (media title; LAM-F-0089 for the 1942 married name) |

Paragraph (facts LAM-F-0086, -0046, -0091, -0090): In 1940 Lamarr met George Antheil. The inventors of
Patent Case File No. 2,292,387, Secret Communication System, were Hedy Kiesler Markey and George
Antheil. It was filed June 10, 1941 and patented Aug. 11, 1942.

### Constellation B: "Hedwig Loder's claim, Vienna" (stop 1, Vienna) — centre LAM-M-0028

| Item | Media / page | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: Paul Reiner's letter, page 1 | LAM-M-0028-p3 | Family | 1945-12-07 | Paul Reiner, attorney for Miss Hedy Lamarr, asked for protection of Mrs. Loder's property interests in the oilfields of Zistersdorf in Austria. | LAM-F-0106 |
| Letter, page II | LAM-M-0028-p4 | Family | 1945-12-07 | (page II of the same letter) | LAM-F-0106 |
| Property Control Branch memo | LAM-M-0028-p2 | Immigration & Migration | 1946-01-07 | Mrs. Hedwig Loder was a British subject. | LAM-F-0108 |
| Reply to the attorney | LAM-M-0028-p5 | Family | 1946-01-07 | (same file) | LAM-F-0106 |
| British Element ACA letter | LAM-M-0028-p7 | Legacy | 1946-01-12 | (same file) | — |
| Courtroom photo with John Loder | LAM-M-0015 | Family | 1946-05-20 | Actress Hedy LaMarr and John Loder in courtroom, 1946. | LAM-F-0107 |

Paragraph (facts LAM-F-0064, -0102, -0103, -0104, -0105, -0107): Hedy Lamarr was born in Vienna,
Austria in 1914. Mrs. Hedwig Loder's father was the late Emil Kiesler of Vienna; he died in 1935.
Mrs. Hedwig Loder was the only child of Emil Kiesler, and Mrs. Gertrude Kiesler was her mother. Miss
Hedy Lamarr by marriage became Mrs. Hedwig Loder.

### Constellation C: "Hedwig Maria Stauffer becomes a citizen" (stop 4) — centre LAM-M-0022

| Item | Media / page | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: naturalization file, page 1 | LAM-M-0022-p1 | Citizenship | 1939-04-04 (date read on the image; not a fact yet) | The naturalization file at the National Archives at Riverside for Hedwig Maria Stauffer. | LAM-F-0001 |
| Petition page | LAM-M-0022-p2 | Citizenship | 1953-02-25 (image only) | Hedwig Maria Stauffer is also known as Hedy Lamarr. | LAM-F-0007 |
| Further pages | LAM-M-0022-p3..p9 | Citizenship | — | Also known as Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, Hedy Markey. | LAM-F-0008 to -0011 |
| SS Normandie arriving in New York (basis photo) | LAM-M-0023 | Immigration & Migration | 1935 | S.S. Normandie arriving in New York Harbor on maiden voyage. | stop context; LAM-F-0024 single-source |
| 1939 portrait | LAM-M-0013 | Film | 1939-01-19 | Actress Hedy Lamarr, 1939. | — |

Dates in the centre rows that are read from the page images are leads, not facts: a person should
transcribe pages 1-2 of NAID 335708097 (no Citizen Archivist transcription exists) before the site
shows them.

## Recreation candidates (owner may approve a labelled 3D recreation)

| Object | Holder | Reference | Why it matters |
|---|---|---|---|
| Frequency-hopping player-piano record and the two synchronized record mechanisms | NARA (public domain): drawing sheets 302050_2292387_05 and _06 of LAM-M-0001 | LAM-M-0001-p5, -p6 plus LAM-F-0094, -0095 | The invention's core object; the patent drawings are public domain, so a model can be built from the holder's own drawings and labelled "Reconstruction based on Patent Case File No. 2,292,387". |
| SS Normandie (exterior) | LoC LC-USZ62-90162 (public domain), LAM-M-0023 | basis photo already on file | Crossing to New York, 1937 (LAM-F-0024, single-source). |
| MGM film costumes (*Ziegfeld Girl*, *Samson and Delilah*) | Academy Museum / private collections; LoC posters LAM-M-0009, -0010 are "Rights status not evaluated" | posters only (link) | Film career room; no open image or 3D scan found. |

## Rejected candidates and why

- NARA NAID 472569372 "Mandl, Fritz" (external assets file, 43 pages, Unrestricted): about her first
  husband, not her; not staged.
- NARA NAID 365843771 Playbill "As The Girls Go": "Restricted - Possibly".
- NARA NAID 350963395 FDR PPF 9 Gifts - L: one PDF, not read (NARA keyword search was blocked for the
  rest of the run; retry).
- LoC Chronicling America pages naming her (1935-1963): LoC's general newspaper statement, not the
  approved rights wording; link only (LAM-S-0051 already on file).
- Smithsonian (NMAH Lamarr-Antheil papers, NPG photographs): Open Access API rate-limited (HTTP 429)
  and collections.si.edu 403 to curl; NPG items on file are rights-restricted.
- USPTO printed patent PDF (image-ppubs.uspto.gov): duplicates page _07 of the NARA case file, and
  `tools/fetch_media.py` does not list USPTO as a file host.

- LoC pass 2026-10-22 (LAM-Q-0292 to -0300): "Hedy Lamarr" photo search returns only the posters and
  the 1940 Red Cross photograph already on file; no new artifact. One basis photo added (LAM-M-0030,
  Vienna 1902; ROOMS.md).

## Requests for the lead / owner

- Rights check: LAM-M-0028 is verified public-domain from NARA "Unrestricted", but pages 3-4 and 7-9
  are letters written by a private attorney (1945) and by the British Element (1946), not by the U.S.
  government; the approved NARA rule text speaks of "records created by the federal government". The
  Muir petition (MUI-M-0061) was refuted on exactly this point. Owner to rule whether NARA
  "Unrestricted" covers private letters in federal files before these pages are embedded.
- Registry: none new for Lamarr.
- Transcription: NAID 335708097 pages 1-2 (declaration of April 4, 1939 and petition of 1953: San
  Ysidro entry, June 11, 1938, afoot) need a human transcription before they become facts.
- Retry NARA keyword searches ("Hedy Markey", "Kiesler Markey", "Lamarr Antheil", war bonds) when the
  catalog search endpoint answers JSON again.
