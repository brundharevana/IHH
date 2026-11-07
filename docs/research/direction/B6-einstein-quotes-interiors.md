# Task 10b report: Einstein verified direct quotes and interior basis photos

Status: DONE. Run id `einstein-t10b-2026-10-09`, date 2026-10-09, branch feat/foundation.
Pipeline path only: staging `t10b.jsonl` + `t10b.searches.jsonl` -> `fetch_snapshot.py` (6 browser, 3 http, 1 api)
-> `merge_staging.py` -> `adversary.py --engine codex` (runs adv-20261009T190133-9e8d, adv-20261009T190337-307c)
-> `compute_status.py` -> `validate.py einstein` (0 errors, 0 warnings) -> `pytest tools` (990 passed).
Merged: 7 facts (EIN-F-0082..0088), 10 sources (EIN-S-0062..0071), 6 media (EIN-M-0028..0033), 28 searches.
No tool code changed. One registry proposal added to `data/registry/PROPOSED.md` (proposals only; `institutions.json` untouched).

## New verified direct-quote facts (is_direct_quote true, claim = evidence quote verbatim)

| Id | Quote (claim) | Sources | Status |
|---|---|---|---|
| EIN-F-0082 | "Now it appears almost certain that this could be achieved in the immediate future." | EIN-S-0068 LoC blog "Einstein's Fateful Letter" (In Custodia Legis, 2020-08-13; registry `loc`, institutional) + EIN-S-0069 GHDI transcription of the letter (secondary) | verified |
| EIN-F-0083 | "However such bombs might very well prove to be too heavy for transportation by air." | EIN-S-0068 (LoC) + EIN-S-0069 (GHDI has "However, such bombs", comma) | verified |
| EIN-F-0084 | "How I wish that somewhere there existed an island for those who are wise and of goodwill! In such a place even I would be an ardent patriot." | EIN-S-0008 IAS "Albert Einstein: In Brief" (institutional) + EIN-S-0070 AIP exhibit "In Brief" (secondary) | verified |
| EIN-F-0085 | "One thing I have learned in a long life: that all our science, measured against reality, is primitive and childlike—and yet it is the most precious thing we have." | EIN-S-0008 (IAS) + EIN-S-0070 (AIP, spaced en dash) | verified |

Context for the slice:
- F-0082 and F-0083 are sentences of the 2 August 1939 letter to President F. D. Roosevelt (event_date 1939-08-02).
  "this" in F-0082 refers to a nuclear chain reaction in a large mass of uranium (previous sentence). The LoC post says
  the letter was drafted by Einstein and Leo Szilard; an attribution line should say "letter signed by Einstein" rather
  than imply sole authorship. No primary transcription exists on a registered site: NARA NAID 16608874 (file unit
  "Sachs, Alexander") is a PDF scan with no extracted text; NAID 593374 returned 0 hits.
- F-0084 and F-0085 are pull quotes in the IAS timeline (1939 and 1955 entries); neither IAS nor AIP names the source
  document or date, and the IAS page states it is based on the AIP exhibit, so the two holders share one origin text.
  G5 passes deterministically; treat these as weaker than F-0082/F-0083 and do not attach a date or occasion to them.

Other new facts (basis for room labels):
- EIN-F-0086 verified: "Albert Einstein had a study at his Princeton, N.J. home." (LoC 2002711237 primary + NARA EIN-S-0029).
- EIN-F-0087 verified: "Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey." (IAS EIN-S-0065, -0067 + NPS EIN-S-0057).
- EIN-F-0088 single-source: "Albert Einstein had an office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey." (IAS only).

## Verified, usable interior photographs (basis_media candidates)

Rights wording is the holder's own. Photo dates are the holder's (schema has no photo_date field; dates are in each
item's `notes` and here). Positions are as seen in the photograph (left/right from the camera).

### A. Home study, 112 Mercer Street, Princeton (1943; NARA, public-domain) -- already on file, verified
EIN-M-0013 (NAID 276538325, 80-G-42918) and EIN-M-0014 (NAID 276538328, 80-G-42919). Holder: National Archives at College
Park, Still Pictures, RG 80. Rights: NARA useRestriction "Unrestricted" -> public-domain under the approved rule.
Photo date: 24 July 1943 (caption: "in his study at Princeton, N.J."; LoC copy 2002711237 says "in his study at his
Princeton, N.J. home", EIN-F-0086). Both shot from the same spot, landscape:
- Back wall, full width left two-thirds: dark wooden built-in bookcases floor to near ceiling, 4-5 shelves, packed with
  bound books, some lying flat; on the top shelf (centre-right) a small model sailboat and a label "Y-38"-like tag.
- Left: tall standing lamp with a white glass bowl shade, in front of the bookcase (upper left).
- Centre shelf (mid height, behind Einstein's head in M-0013): a small bronze or plaster bust of a head on a wooden block.
- Right wall: pale patterned wallpaper; two framed items: upper, a framed etched portrait of a bearded man (M-0014,
  upper right); lower, a framed certificate in German blackletter that appears to read "Naturforschende Gesellschaft
  ... Bern ... Professor Dr. Albert Einstein, Princeton N.J. ... Ehrenmitglied" (honorary membership; reading not
  verified, do not caption it).
- Far right edge: a small framed picture or card on the wall (M-0014), a dark leather armchair back, a stack of about
  eight hardbound books on a side table (lower right).
- Foreground right: Einstein's dark wooden desk at a slight angle, covered with loose papers and printed sheets; a
  cylindrical metal tobacco tin with lid (centre of desk), a briar pipe lying flat, a small ashtray with a cigarette,
  a matchbox. Einstein sits behind the desk in a bentwood chair (back visible behind his right shoulder), wearing a
  light linen jacket.
- Left foreground: visitors sit on a bentwood chair; a patterned rug edge visible lower left (M-0014).

### B. Home study, 112 Mercer Street (1954; IAS, CC BY) -- new
Holder: Shelby White and Leon Levy Archives Center, Institute for Advanced Study. Photographer Alan Richards.
Rights (verbatim): "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the
"CC By" license to support research use with proper attribution. For more information, see
https://creativecommons.org/licenses/by/4.0/". license_class cc-by. Credit line in each record.

- EIN-M-0031 "Albert Einstein in study, standing" (IAS E 03, 20.500.12111/1094), 1954. Window wall of the study:
  centre and right, a very large picture window (one big pane, mullioned casement at its left) looking onto bare trees
  and a white clapboard garage/outbuilding with multi-pane windows; left wall: a tall dark bookcase (far left) and two
  framed pictures one above the other (an engraving-like portrait, and a framed print); a terrestrial globe on a stand
  in front of the window's left corner; low long wooden table across the foreground holding stacked books, papers, a
  potted spider plant (centre right) and a piece of driftwood (right); Einstein stands behind the table in a sweater.
- EIN-M-0033 "Albert Einstein in study, looking out window" (IAS E 11, 1091), 1954. Same window wall, wider: confirms
  the big window (right two-thirds), a narrower white casement window to its left, white plaster walls, a low ceiling
  edge; far left a dark bookcase with books and a cabinet base; two framed pictures on the left wall; a round side table
  with a pierced/carved base holding a desk set and a small box (left foreground) and the globe behind it; the long
  table (trestle legs) under the window with stacked books, papers, potted plant, a telephone on the sill (left).
- EIN-M-0030 "Albert Einstein in study, seated" (IAS E 30, 1093), 1954, "the last photograph that Alan Richards took of
  Einstein". Bookcase wall: full-width dark bookcase, upper open shelves with books upright and stacked flat, lower
  closed cupboards with panelled doors (right); Einstein in a wooden-armed upholstered armchair (centre left) with a
  plaid blanket over its right arm; corner of a paper-covered table at lower right.
- EIN-M-0032 "Albert Einstein in study, seated" (IAS E 04, 1092), 1954. Same bookcase wall from further back: bookcase
  across the whole back wall (left section crammed with flat-stacked books), lower panelled cupboards right; armchair
  centre; tubular-metal chair edge at left; floor lamp with white bowl shade at right (same lamp type as 1943); papers,
  a bottle and objects on a table in the blurred foreground.

### C. Office in Fuld Hall, Institute for Advanced Study (1955; IAS, CC BY) -- new
Same holder, photographer and rights wording as B. Taken in 1955 (holder date; no month given).
- EIN-M-0028 "Albert Einstein's office and blackboard" (IAS E 41, 1119). Left: built-in bookcases (books and loose
  pamphlets) on the left wall and a wood-panelled section; centre-left: a wooden desk heaped with papers and a dark
  cylindrical tin, a black upholstered chair behind it and another black chair to its right; centre-right on the back
  wall: a large slate blackboard in a wooden frame with chalk tray, covered with equations in boxes; open shelving with
  stacked papers left of the blackboard; tall bookcase right of it; a wall outlet below the blackboard; foreground
  right: the edge of a large dark table with papers.
- EIN-M-0029 "Albert Einstein's office" (IAS E 40, 1118). Opposite view: three large multi-pane sash windows on two
  walls (corner of the room, bay-like), radiator under the right window; a long dark table in front of the windows with
  a reading stand/lectern on it (left of centre) and papers; a wooden pedestal desk (right) with drawers, covered with
  papers and a dark tin; a leather swivel armchair (left of desk) and a second wooden armchair behind it; a small
  wooden footstool with arched cut-out (centre); a metal wastebasket (right of desk); an electric fan on the floor
  (far left); a leather chair arm in the foreground (lower left).

Not usable (searched, rights bar them): LoC 2002711237 (same 1943 scene, "Rights status not evaluated"); IAS late-1940s
study photos 1194/1195/1196 and Lotte Jacobi 1938 (1327) and Gayle Kerley 1986 (1136) are InC-RUU; IAS Jack Burnett 1969
interior set (Desk, Office, Bookcases, Dining room...) says "Permission to use this image must be requested".

### EIN-M-0022 (Bern patent office portrait)
Not resolved; left disputed. IAS holds a print said to be from the Bern patent office (EB 054, 20.500.12111/1151) but its
rights are InC-RUU; no ETH Library or Einstein Archives item page with a usable rights statement was found. It is a
portrait, not a room view, so it is not needed as basis media.

## Search log summary (all 28 searches are in searches.jsonl, run einstein-t10b-2026-10-09)
- NARA proxy: free-text search not supported; naId lookups returned 503 for about an hour, then 16608874 (FDR letter
  file unit, scan only) and 593374 (0 hits). No transcription anywhere in the NARA catalog for the FDR letter.
- WebSearch (8): FDR letter text on archives.gov / nps.gov / loc.gov (none on a registered site except the LoC blog);
  Einstein quotes on nps.gov / loc.gov (none usable); ias.edu quotes and photos (led to albert.ias.edu); ETH patent office.
- LoC JSON: 8 photo queries (study, princeton, office, home, desk, mercer, patent office, trenton) and 3 site searches
  (letter 32478 results, "why I am an American", radio address).
- AIP exhibit pages fetched (inbrief.htm source of the IAS quotes).
- albert.ias.edu DSpace API (in-app browser, Cloudflare blocks plain fetches): 6 image queries, ~95 records reviewed;
  rights checked per item; 6 CC BY interiors staged.
- NARA 80-G-42918 / 80-G-42919 image files viewed to describe the 1943 study.

## Concerns
- Browser snapshots (EIN-S-0062..0067, albert.ias.edu) rely on Codex reaching the live page; one item (EIN-M-0029) was
  `unreachable` on the first pass and passed on a re-run. A future re-judgement may flip them to disputed if Cloudflare
  blocks Codex.
- F-0084/F-0085 have no named document/date; IAS and AIP share one origin text.
- F-0082/F-0083: letter co-drafted by Szilard; the slice's attribution should say "letter signed by Einstein, 2 Aug 1939".
- Codex suggested a registry entry for germanhistorydocs.org; written to PROPOSED.md (#4) for a person to review.
- export/ was not regenerated (not part of this task).
