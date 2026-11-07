# Einstein tour research (run einstein-tour-2026-10-15)

Research for 5-6 tour stops: a real place, a date range, what he did there, artifacts, how he got
there, period photographs of the place (basis for room recreations), and coordinates. Every fact id
below is in `facts.jsonl`; status is as computed by `tools/compute_status.py` on 2026-10-15. Only
`verified` facts may carry a stop on the site. `single-source` and `conflicting` items are listed so
the owner can see what exists and what is missing; they are not publishable.

New ids from this run: sources EIN-S-0093 to EIN-S-0106, facts EIN-F-0122 to EIN-F-0137, media
EIN-M-0042 to EIN-M-0049, searches (33) under run id `einstein-tour-2026-10-15`.

## Counts

| | verified | single-source | disputed | conflicting | rejected | total |
|---|---|---|---|---|---|---|
| Facts before | 47 | 61 | 3 | 0 | 10 | 121 |
| Facts after | 52 | 71 | 3 | 1 | 10 | 137 |
| Media before | 35 | 0 | 6 | 0 | 0 | 41 |
| Media after | 36 | 0 | 7 | 0 | 6 | 49 |

New verified facts: EIN-F-0128, -0132, -0133, -0134, -0135. New verified media: EIN-M-0042.
The six rejected media are the interior photographs withdrawn on the lead's instruction (see
"Period photographs" below); their adversary verdicts were "supported" and are kept for audit.

## Proposed stops

### Stop 1. Washington, D.C., April 1921: White House and the National Academy of Sciences

- What: received at the White House by President Harding with the National Academy of Sciences;
  at the Academy's meeting at the Smithsonian Institution.
- Verified facts: EIN-F-0117 (with Harding and group at the White House), EIN-F-0105 (Harding,
  Einstein and his wife photographed 1921, April 25), EIN-F-0118, EIN-F-0121 (NAS meeting at the
  Smithsonian Institution, 1921), EIN-F-0093 (with Elsa, State, War, and Navy building behind).
- Single-source / disputed: EIN-F-0090, -0091, -0092, -0094, -0095, -0096 (single-source);
  EIN-F-0104, -0119 (disputed).
- Travel leg: unverified. The 1921 crossing to New York was not researched in this run.
- Artifacts (media): EIN-M-0003, -0004, -0005, -0034, -0035, -0036, -0037 (LoC, public-domain);
  EIN-M-0026 (Smithsonian NPG, Harris & Ewing, cc0).
- Period photographs of the place: the LoC Harris & Ewing and National Photo Company prints above
  are outdoor views (White House grounds, State, War, and Navy building). Largest JPEG served
  1024 px wide; TIFF masters: 2016885955 `31006a.tif` 145,412,168 bytes, 2016885960 `31011a.tif`
  144,646,664 bytes, 2016885961 `31012a.tif` 142,983,752 bytes, 2016885962 `31013a.tif`
  144,529,448 bytes, 2016830269/-70/-71 `0403[8-9]u.tif`/`04040u.tif` about 23 MB each (pixel size
  not in the records). Rights: "No known restrictions on publication" (LoC). No interior photograph
  of the White House reception or the Smithsonian luncheon found.
- Coordinates (published coordinates, approximate; Wikidata P625 per the site's 2026-10-09
  decision): White House Q35525 38.8978, -77.0367; Smithsonian Institution Building Q605937
  38.8887, -77.0260. The facts name "Smithsonian Institution", not a building: pin the city or the
  institution, not the Castle, unless a source names the building.
- Gaps: travel leg; any interior photograph.

### Stop 2. San Diego and Pasadena, 31 December 1930 to February 1931

- What: arrived at San Diego on the Belgenland; at Caltech's Athenaeum in Pasadena.
- Verified facts: EIN-F-0113, -0114, -0115, -0120 (San Diego arrival, reception, Mayor Clark),
  EIN-F-0116 (The Athenaeum, Caltech).
- Single-source / disputed: EIN-F-0097, -0099, -0100, -0101, -0102, -0103; EIN-F-0098 (disputed).
- Travel leg: SS Belgenland, verified (EIN-F-0114, EIN-F-0120).
- Artifacts: EIN-M-0025 (UCLA, cc-by), EIN-M-0038 (LoC, unknown), EIN-M-0039 and -0040 (IAS,
  InC-RUU, rights-restricted), EIN-M-0041 (Smithsonian Institution Archives, "Copyright Not
  Evaluated", unknown).
- Period photographs of the place: EIN-M-0040 (Einstein dining at The Athenaeum) and EIN-M-0041
  (Michelson, Einstein, Millikan at The Athenaeum, February 1931) both show him, so they are media;
  neither is embeddable. No photograph of the Athenaeum interior without him was searched.
- Coordinates: San Diego Q16552 32.715, -117.1625 (city). The Athenaeum has no Wikidata entity
  (search 2026-10-15 returned none); not pinned.
- Gaps: the San Diego pier and the Athenaeum have no published coordinates on file.

### Stop 3. Arrival, 17 October 1933: New York harbor, the Battery, then Princeton (2 Library Place)

- What: arrived on the Red Star liner Westernland, was taken off at Quarantine by tug, landed at
  the Battery, went to Princeton by automobile; first Princeton home at 2 Library Place.
- Verified facts: EIN-F-0128 ("When Albert Einstein first came to Princeton in 1933, he lived at 2
  Library Place"; NHL nomination form, primary, and NPS).
- Single-source (this run): EIN-F-0122 (arrived on the Red Star liner Westernland, 17 Oct 1933),
  EIN-F-0123 (taken off at Quarantine, sped ashore by tug), EIN-F-0124 (party landed at the
  Battery), EIN-F-0125 (with Mrs. Einstein and Dr Walther Mayer), EIN-F-0126 (to Princeton by
  automobile, October 1933), EIN-F-0127 (arrived in Princeton in October 1933; IAS). Earlier:
  EIN-F-0015, -0026, -0043, -0049, -0052 (single-source).
- Travel legs: Atlantic crossing on the Westernland (EIN-F-0122, single-source); ship to shore by
  tug (EIN-F-0123, single-source); New York to Princeton by automobile (EIN-F-0126, single-source).
  All rest on Chronicling America pages, which are one holder (LoC) and secondary. The departure
  port and date were not verified.
- Ship-name conflict: "Westernland" in the AP (EIN-S-0101), UP (EIN-S-0102) and Washington Times
  (EIN-S-0103) texts; "S. S. Westerland" in a photo caption on EIN-S-0104 and in the Henderson Daily
  Dispatch AP text (not staged); modern web pages say "Westmoreland" (not used). Tug vs launch:
  EIN-S-0102 says tug, the EIN-S-0104 caption says launch.
- Artifacts: none on file. The newspaper pages themselves (LoC, Chronicling America) are the only
  period documents found.
- Period photographs: EIN-S-0104 (Washington Times, 18 Oct 1933, p. 1) carries an International
  News Photo of Frau Einstein leaving the ship and a portrait of Einstein; a newspaper reproduction
  with a wire-service credit, so not usable under the LoC rule. No photograph of 2 Library Place
  found.
- Coordinates: The Battery Q13689 40.7036, -74.0161. 2 Library Place: no entity found; not
  geocoded (no assumption).
- Gaps: an institutional or primary source for the ship (a passenger manifest; NARA's catalog does
  not hold the 1933 New York lists online, and the commercial indexes need accounts the owner would
  have to use); 2 Library Place photographs and coordinates.

### Stop 4. Nassau Point, Peconic, Long Island, summer 1939: the letter to Roosevelt

- What: the letter of 2 August 1939 to President Roosevelt carries the heading "Old Grove Rd.,
  Nassau Point, Peconic, Long Island"; delivered by Alexander Sachs on 11 October 1939.
- Verified facts: EIN-F-0110 (signed a letter to President Roosevelt), EIN-F-0135 (Sachs delivered
  it on October 11, 1939; FDR Library blog and Law Library of Congress blog).
- Single-source: EIN-F-0136 (heading Old Grove Rd., Nassau Point, Peconic, Long Island; GHDI
  only, secondary), EIN-F-0137 (letter in the Sachs, Alexander file, FDR Library, Hyde Park;
  DocsTeach only, secondary), EIN-F-0089 (signed it in August 1939), EIN-F-0082, -0083 (two
  sentences of the letter, direct quotes).
- Travel leg: unverified.
- Artifact: EIN-M-0049, the letter, National Archives Catalog NAID 16608874 (FDR Library, file unit
  "Sachs, Alexander"; one PDF, psfa0064.pdf, 3,428,369 bytes, not downloaded). Status disputed:
  NARA's use restriction is "Unrestricted", which the approved rule maps to public-domain, but the
  adversary refuted it: the letter is privately authored, so "Unrestricted" does not show it is in
  the public domain. Owner decision needed.
- Period photographs of the place: none found.
- Coordinates: Peconic (census-designated place) Q3461877 41.0306, -72.46, a CDP centroid, not the
  cottage. Secondary web pages place Nassau Point in Cutchogue and the cottage on "West Cove Road";
  not verified and in tension with the letter heading, so not used.
- Gaps: any registered source naming Peconic or Nassau Point (searches of nps.gov, archives.gov,
  loc.gov, energy.gov, osti.gov and Chronicling America found none); photographs; travel.

### Stop 5. Trenton, New Jersey, 1940: United States citizenship

- What: declaration of intention 1936; petition 4009 in the U.S. District Court, Trenton;
  photographed on 1 October 1940 receiving his certificate from Judge Phillip Forman.
- Verified facts: EIN-F-0001, EIN-F-0045 (declaration dated 1936-01-15), EIN-F-0051 (1 Oct 1940,
  certificate from Judge Phillip Forman), EIN-F-0056 (petition 4009, District Court, Trenton),
  EIN-F-0057.
- Single-source: EIN-F-0016, -0044, -0046.
- Travel leg: unverified (Princeton to Trenton).
- Artifacts: EIN-M-0019 (naturalization record, NARA NAID 596270, public-domain; four page images
  and a PDF), EIN-M-0002 (LoC NYWT&S photograph "America gains a famous citizen", public-domain;
  largest JPEG 1024 x 831, TIFF `05649u.tif` 16,497,450 bytes).
- Period photographs of the place: EIN-M-0002 shows the ceremony itself. No photograph of the
  courtroom without him found.
- Coordinates: Trenton Q25330 40.2203, -74.7658 (city). The Clarkson S. Fisher Federal Building
  and U.S. Courthouse (Q17509836, 40.22, -74.7594) is a candidate only: no source on file says the
  1940 ceremony was held there.
- Gaps: the court building and room; Chronicling America AP reports of 1 Oct 1940 (Henderson
  Daily Dispatch pp. 1, 3) are too badly OCRed to quote.

### Stop 6. Princeton, 112 Mercer Street (1936-1955) and his office at the Institute

- What: home and study at 112 Mercer Street; office in Fuld Hall; wartime Navy work in the study.
- Verified facts: EIN-F-0106 (purchased 1936), EIN-F-0107 (home until 1955), EIN-F-0087 (home study
  at 112 Mercer Street), EIN-F-0086, EIN-F-0055 (24 July 1943, research for the Bureau of Ordnance in
  his study), EIN-F-0054, EIN-F-0132 (house designated a National Historic Landmark in 1976),
  EIN-F-0133 (no interior or exterior alterations since he lived there, per the NHL form),
  EIN-F-0134 (Margot owned the house since 1955).
- Single-source: EIN-F-0130 (walls of his study covered with pictures of Michael Faraday, James
  Clerk Maxwell and Isaac Newton; IAS only), EIN-F-0131 (acquired by IAS in 1986), EIN-F-0088
  (office in Fuld Hall; IAS only).
- Conflicting: EIN-F-0129 (IAS: purchased in 1935) against EIN-F-0106 (NHL form and NPS: 1936).
  The same IAS page dates the house to 1838 (moved in the 1870s); the NHL form says builder and
  date unknown, probably 1870s or 1880s (not staged). Owner decision needed.
- Travel leg: not applicable (the IAS page says the house is about a mile from the campus; not
  staged).
- Artifacts: EIN-M-0015 (letter to Lt. Stephen Brunauer, NARA, public-domain), EIN-M-0016
  (Emergency Committee of Atomic Scientists letter, NARA, public-domain), EIN-M-0012 (with Nehru,
  NARA, public-domain); place of writing of the letters is not verified.
- Period photographs that show him in the study or office (media):

| Media | Holder, id | Date | Rights | License | Pixels |
|---|---|---|---|---|---|
| EIN-M-0013 | NARA 80-G-42918 (NAID 276538325) | 24 Jul 1943 | Unrestricted | public-domain | 5488 x 4404 |
| EIN-M-0014 | NARA 80-G-42919 (NAID 276538328) | 24 Jul 1943 | Unrestricted | public-domain | 5488 x 4370 |
| EIN-M-0030 | IAS E 30 | 1954 | CC BY | cc-by | 3019 x 2419 |
| EIN-M-0031 | IAS E 03 | 1954 | CC BY | cc-by | 1920 x 1413 |
| EIN-M-0032 | IAS E 04 | 1954 | CC BY | cc-by | 2115 x 1515 |
| EIN-M-0033 | IAS E 11 | 1954 | CC BY | cc-by | 1497 x 1152 |
| EIN-M-0042 (new) | IAS E 12 | undated | CC BY | cc-by | 1513 x 1212 |

  Pixel sizes: NARA from the JPEG header of the catalog image (first 128 KB read, not saved); IAS
  from each item's IIIF manifest. The two NARA 1943 photographs are the highest-resolution,
  embeddable views of the study.

- Fuld Hall office (no person in frame; IAS): EIN-M-0028 (E 41, 1955, CC BY, 2104 x 1518) and
  EIN-M-0029 (1955, CC BY, 3024 x 2419) were already media before the lead's instruction; they are
  left as they are for the owner's decision on the record kind.
- Coordinates: 112 Mercer Street Q43282043 40.3443, -74.6663; Fuld Hall Q120868923 40.3318,
  -74.6681. The NHL nomination's UTM reference (EIN-S-0091) is unreadable in the OCR.

## Period photographs for room recreation (not media records)

On the lead's instruction (2026-10-15), place and interior photographs that do not show Einstein
are listed here, not in `media.jsonl`. The six such items staged earlier in this run were withdrawn
(EIN-M-0043 to EIN-M-0048, status rejected, notes say why); their sources stay on file.

All belong to Stop 6 (study at 112 Mercer Street; facts EIN-F-0087, EIN-F-0130, EIN-F-0133). The
photographs were taken after his death (1969, 1986); EIN-F-0133 (NHL form) says the house had no
interior alterations since he lived there, but that a given object was his or stood there in his
time is not a fact on file. A reconstruction may show only what a photograph shows.

| Title | Holder | Date | Rights statement (holder's words) | Pixels | URL | Source on file |
|---|---|---|---|---|---|---|
| Albert Einstein's house, study | IAS E 39, Gayle Kerley | 1986 | InC-RUU: https://rightsstatements.org/page/InC-RUU/1.0/?language=en | 3015 x 2408 | https://albert.ias.edu/entities/archivalmaterial/b3abbc37-704b-46a7-912d-aa9bb6554fc3 | EIN-S-0095 |
| Office | IAS, Jack Burnett (handle 20.500.12111/9536) | 1969 | "Permission to use this image must be requested from the Institute's Archives." | 3586 x 2386 | https://albert.ias.edu/entities/archivalmaterial/8bd84192-9c03-4c5a-8ab0-75bd68819b02 | EIN-S-0096 |
| Office | IAS, Jack Burnett (9537) | 1969 | same | 3586 x 2386 | https://albert.ias.edu/entities/archivalmaterial/b9ccbff0-b65e-4d12-8ea2-93e9d9d4972a | EIN-S-0097 |
| Desk | IAS, Jack Burnett (9519) | 1969 | same | 3586 x 2386 | https://albert.ias.edu/entities/archivalmaterial/36730a3c-49c3-4c40-b64c-3fe4cf02f829 | EIN-S-0098 |
| Bookcases | IAS, Jack Burnett (9522) | 1969 | same | 3586 x 2386 | https://albert.ias.edu/entities/archivalmaterial/f85299a4-7b9a-431c-81d1-22360ba48d43 | EIN-S-0099 |
| Desk by door | IAS, Jack Burnett (9520) | 1969 | same | 3586 x 2386 | https://albert.ias.edu/entities/archivalmaterial/36d95e51-b670-44c7-baab-b894570b47d1 | EIN-S-0100 |

The rest of the Jack Burnett collection (same rights; not snapshotted): Bookcases and plants by
window (9518), Chairs and table by fireplace (9516), Chair by fireplace (9526), Dining room (9521),
Bedroom (9523), Bed and bedside table (9524), Lamp (9527), Chairs and table by windows (9529),
Piano (9530), Mantel (9531), Kitchen counter (9533), Bureau and mirror (9534), Pipes and
snuffboxes (9538), View from window of flowering trees (9541), Recamier and chairs by window (9542,
1793 x 1193). Handles resolve as https://albert.ias.edu/20.500.12111/<n>. The Description field
says they "document the interior of Albert Einstein's former residence at 112 Mercer Street" and
were "taken in 1969 at the behest of Otto Nathan"; which room each shows is not stated beyond the
title.

Further leads that show him (InC-RUU or permission required; not staged): IAS E 17, E 19 (with Urey
and Szilard), E 20 (with Urey), EB 090 (all "home office at 112 Mercer Street", late 1940s,
2488 x 1588 to 3053 x 2477); Herman Landshoff folio "Albert Einstein at Home, Princeton, 1946-1950"
(13 images, 2958 x 4092 to 4085 x 3207 px; the Muenchner Stadtmuseum claims copyright); LoC
2002711237 "Famed scientist at work for U.S. Navy" (1943, "Rights status not evaluated"). IAS also
holds Fuld Hall floor plans (first and second floors; items 71dd6bee..., d169738b..., 457980e2...)
and staff directories 1936-37 and 1938-39 that may give his office and home address; not opened.

## Registry requests

Not edited (agents never write the registry). Adversary suggestions from this run, for a person to
check and, if confirmed, add to `data/registry/PROPOSED.md` with domain evidence (not collected in
this run):

- docsteach.org: DocsTeach, National Archives Foundation (suggested as institutional; would let
  EIN-F-0137 count, together with the NARA file record, toward corroboration).
- germanhistorydocs.org: German History in Documents and Images, German Historical Institute
  Washington (suggested as institutional; EIN-F-0136).
- fdrlibrary.org: the FDR Library's own site (a NARA presidential library); not fetched in this
  run; its letter transcription could corroborate the Peconic heading if registered.

## Owner decisions needed

1. 1935 or 1936 for the purchase of 112 Mercer Street (EIN-F-0129 conflicting with EIN-F-0106), and
   the house's construction date.
2. EIN-M-0049: does NARA "Unrestricted" make a privately authored letter in a presidential
   library public-domain under the approved rule? The adversary says no.
3. A record kind for reconstruction-basis photographs (the six withdrawn items, and whether
   EIN-M-0028/-0029, Fuld Hall office without a person, should move there).
4. Whether post-1955 interior photographs (1969, 1986) may be a reconstruction basis for the room
   as he used it, given EIN-F-0133.
5. Permission requests to the IAS archives for the Jack Burnett photographs (contact is the
   owner's).
6. Whether to pursue a passenger manifest for the Westernland arrival (commercial genealogy
   indexes; owner's accounts), which would move EIN-F-0122 to a primary source.

## Method

1. Read the skill, SPEC, PATTERNS and LESSONS; listed the 121 facts, 92 sources and 41 media on file
   to find what each stop already had.
2. Searches (33, logged in `searches.jsonl` with what each produced): web search for discovery
   only; the Chronicling America JSON API for October 1933 and October 1940 reports; the LoC
   Prints & Photographs and photos JSON searches; the NARA catalog proxy API; the IAS archives'
   DSpace discover API and IIIF manifests (read in the in-app browser, since albert.ias.edu and
   ias.edu answer plain fetches with a Cloudflare 403); the Smithsonian collections search was
   blocked by a bot check, which was not bypassed.
3. Snapshots: `tools/fetch_snapshot.py` for loc.gov (fo=json plus LoC's OCR text service), NARA
   (proxy API) and DocsTeach (http); IAS pages as browser snapshots of the page's main or article
   element text, written to a file and saved with `--from-file --method browser`.
4. Claims were written only with words in the quotes (G2); OCR text was quoted as served, errors
   included. Merged with `merge_staging.py` (16 facts, 14 sources, 8 media, 33 searches); one fact's
   event_date was cut to the year before any verdict because DocsTeach writes the date as 8/2/1939.
5. Adversary: Codex CLI 0.156.0 with `--model gpt-6-sol`. The model in LESSONS 2026-10-14
   (`gpt-6.1-sol`) was refused ("not supported when using Codex with a ChatGPT account"; one item
   recorded unclear, then judged again); the account's models cache lists gpt-6-astra, gpt-6-sol,
   gpt-6-luna, gpt-5.6-*. Result: 22 items judged, 21 supported, 1 refuted (EIN-M-0049); the
   LoC OCR text service was unreachable for the adversary on the five newspaper facts.
6. `compute_status.py`, then `validate.py einstein`: 0 errors.
7. Not done in this run: no aggregate export; the registry was not edited; nothing was pushed.

## Ratio-lift additions (run ratio-lift-2026-10-24)

Gothenburg lecture: EIN-F-0150, -0151 (verified). Nassau Point: EIN-F-0152 (disputed, G10 only). Brussels 1933: EIN-F-0153, -0154 (verified). Details per chapter: ROOMS.md, section "Ratio-lift pass".
