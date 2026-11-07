# Hedy Lamarr: one room per turning point (run lamarr-rooms-2026-10-20)

Owner decision 2026-10-20: the tour is a sequence of turning-point chapters, each with, where
possible, one rebuilt room made from a real period photograph of that place, holding that
chapter's artifacts. This file maps each chapter to its verified facts, its place, the photographs
found, a buildability rating and the artifacts for the room.

Rules applied: a chapter is defined only from `verified` facts (statuses as computed on
2026-10-20). A chapter with no verified fact is marked absent and not filled; single-source facts
appear only as leads. Basis photos are `record_kind: basis-photo` media (SPEC 3.4.2);
rights-restricted or unknown items are modelling reference only (owner rule 2026-10-16).

This run added no new basis photo for Lamarr: every search for a place tied to a verified fact
came back empty (searches LAM-Q-0276 to LAM-Q-0285, run `lamarr-rooms-2026-10-20`). loc.gov was
blocked for the whole run (HTTP 429, then 403 and a Cloudflare challenge; not bypassed).

Ratings: **BUILDABLE-FULL**, **BUILDABLE-PHOTO** (one good photo, a camera-projection "photo
room"), **NO-PHOTO** (gallery-case fallback), **ABSENT** (no verified fact).

## Chapter table

| # | Chapter | Verified facts | Place | Photos (holder, id, date, rights, resolution, status) | Rating | Artifacts for the room |
|---|---|---|---|---|---|---|
| 1 | Birth and birthplace | LAM-F-0012 (born Nov. 9, 1914), LAM-F-0064 (born in Vienna, Austria, 1914), LAM-F-0020, LAM-F-0065 (born Hedwig Eva Maria Kiesler), LAM-F-0102 to -0105 (father the late Emil Kiesler of Vienna, died 1935; only child; mother Gertrude Kiesler) | Vienna (city only: no verified fact names Döbling, a street or a building; the Peter-Jordan-Strasse 12 address is only in the unregistered Wien Geschichte Wiki) | none. Leads: ONB Bildarchiv Austria and Wien Museum street views of Döbling, once an address is a fact; Theatermuseum Wien portraits of Hedy Kiesler (Atelier Willinger), which are of her, not of a place | NO-PHOTO | LAM-M-0028 (NARA M-92 file "Hedwig Loder (Née Lamarr)", 1945-46, about the Kiesler family in Vienna; rights question open, see ARTIFACTS.md) |
| 2 | Education before the US | none (stage and film work in Vienna, LAM-F-0066 *Sissy*, LAM-F-0048 *Ecstasy*, are single-source) | — | — | ABSENT | — |
| 3 | Leaving home and why | LAM-F-0088 (married to Friedrich Mandl) only; leaving (LAM-F-0067 England 1937, LAM-F-0049 "fled Europe", LAM-F-0028 via London) is single-source, and no source gives a verified reason | — | — | ABSENT | — |
| 4 | Arriving in the US | LAM-F-0100 (*Waterbury Democrat*, 4 Oct 1937: "Now Miss Kiesler is here in person (above as New York saw her)"); the ship (LAM-F-0024, SS Normandie) is single-source | New York, October 1937; SS Normandie | existing: **LAM-M-0023** "S.S. Normandie arriving in New York Harbor on maiden voyage", LoC P&P LC-USZ62-90162, 1935/36, "No known restrictions on publication...", public-domain, 1536 x 1098 JPEG (TIFF master), **verified**; LAM-M-0024 "Arrival of Normandie", LoC LC-USZ62-90163, 1938, rights unknown, verified, reference only; LAM-M-0025 Cassandre poster, disputed (a lithograph, not a photograph). No Normandie interior at LoC or NARA | BUILDABLE-PHOTO (exterior ship and harbor; the ship link rests on single-source LAM-F-0024, so the room must be labelled as the Normandie arriving in New York, 1935/36, not her crossing) | LAM-S-0051 newspaper page (link only) |
| 5 | First work in the US | LAM-F-0043 (1941 MGM poster, *Ziegfeld Girl*), LAM-F-0044 (1940 MGM poster, *Boom Town*), LAM-F-0087 (*Samson and Delilah*). No verified fact puts her on the MGM lot (contract LAM-F-0027 is single-source; LAM-F-0026 "went to Hollywood" is disputed) | Metro-Goldwyn-Mayer studios, Culver City (existing street-front room) | existing: LAM-M-0026 and -0027 (UCLA, Los Angeles Daily News negatives, MGM studios, Culver City, July 1937, CC BY 4.0, 6200 x 5054 for -0026), both **disputed**: the adversary refuted them because their linked fact (LAM-F-0027) names Hollywood, not Culver City | BUILDABLE-PHOTO (built; the basis link needs a fact that names MGM in Culver City) | LAM-M-0013 (LA Times portrait 1939, CC BY), LAM-M-0009/-0010 (MGM posters, link only) |
| 6 | Becoming a citizen | LAM-F-0001 (naturalization file at the National Archives at Riverside, 1939-1953), LAM-F-0007 to -0011 (names in the file). LAM-F-0016 (citizen in 1953) is disputed | Not a verified place: the court (Los Angeles) and the San Ysidro entry of 11 June 1938 are read from the page images only, not facts | none (NARA has no photograph of the 1940 U.S. Court House, Los Angeles) | NO-PHOTO | LAM-M-0022 (petition, NARA NAID 335708097, public-domain, 9 pages, 2618 x 3175) |
| 7 | The big work | LAM-F-0086 (met Antheil 1940), LAM-F-0091 (filed June 10, 1941), LAM-F-0093 (post-office address 11805 Bellagio Road, Bel-Air, Los Angeles), LAM-F-0096 (signed at Los Angeles, 1941), LAM-F-0092, LAM-F-0090, LAM-F-0084, LAM-F-0094, LAM-F-0095 (player-piano records, 88 frequencies), LAM-F-0046 | 11805 Bellagio Road, Bel-Air | none (UCLA "Bellagio Road" 0 results; NARA nothing; no LoC check) | NO-PHOTO (a gallery case; the patent drawings themselves are public domain and can drive a 3D model of the device, not of the room) | LAM-M-0001 (patent case file, NARA, public-domain, 43 pages: petition p34, drawings p5-6, printed patent p7, allowance p39) |
| 8 | Part of a historic event | LAM-F-0061 (1942 newsreel: film entertainers on war bond tours, including "Heddy Lamar"), LAM-F-0062, LAM-F-0063 (Command Performance broadcast from Hollywood, 1954; studio photographs in the radio scripts files) | No verified place for the bond tour; "Hollywood, California" for the 1954 broadcast (no studio named) | none | NO-PHOTO | LAM-M-0003/-0004 (NARA newsreels, link only) |
| 9 | Why the Hall honours her | LAM-F-0006 (2014, National Inventors Hall of Fame), LAM-F-0085 (EFF Pioneer Award), LAM-F-0040 (an inventor) | No place in the facts | none | NO-PHOTO | LAM-M-0001 (patent) as the honour's object |
| 10 | Death and legacy | LAM-F-0083 (died in 2000 at the age of 85). Place of death (LAM-F-0004 Casselberry) and the grave of honour at the Vienna Central Cemetery (LAM-F-0038) are single-source | No verified place | **LAM-M-0029** (run lamarr-euro-2026-10-22) Wien Museum 58891/1013 "11., Zentralfriedhof - Ehrengräber von Beethoven, Mozart und Schubert, Ansichtskarte", around 1905, collotype postcard, holder statement "CC0", **verified**, embeddable; basis for LAM-F-0038 (single-source). Shows the graves-of-honour section, not her 2014 grave. Further CC0 leads in the same collection: main gate 1040802 (1900-1904), 129282, arcades 110295/110298, plan "Situation der Gräberanlage für berühmte Männer" 131330. Earlier: the Commons grave photo LAM-M-0020 was rejected (no holder statement) | **BUILDABLE-PHOTO** (outdoor, period view of the graves of honour; label it the Vienna Central Cemetery graves of honour around 1905, and wait for LAM-F-0038 to be corroborated before the room names her tomb) | — |

## Recommended build priority (story value x photo quality)

| Rank | Room | Why |
|---|---|---|
| 1 | Chapter 4, SS Normandie arriving in New York | The only new-country arrival image with a public-domain, verified holder record (LAM-M-0023); a strong, simple photo room (ship + harbor). Label it the Normandie's arrival, 1935/36, until LAM-F-0024 is corroborated or the 1937 manifest is found. |
| 2 | Chapter 5, MGM Culver City street front (already built) | Keep, but the basis photos need a verified fact naming MGM in Culver City before they verify; until then the room should be labelled from the photographs' own captions only. |
| 3 | Chapter 7, the invention (gallery case + 3D device) | The richest verified chapter (ten facts, a 43-page public-domain case file), but no photograph of 11805 Bellagio Road exists in the archives searched; build a gallery case around the patent pages and a labelled model of the player-piano record mechanism from the drawing sheets. |

Chapters 1, 6, 8, 9 and 10 are gallery cases until a verified fact names a specific place and a
photograph of it is found; chapters 2 and 3 stay absent.

## Open items for a person

1. A verified source for a Vienna address (birthplace or the Döbling family home) would open
   chapter 1 to ONB / Wien Museum street photographs.
2. Transcribing pages 1-2 of NAID 335708097 would make the San Ysidro entry (11 June 1938) and the
   Los Angeles court facts, opening chapter 6 to a border-station or courthouse room.
3. Done 2026-10-22 (LoC pass): LoC holds no Normandie interior, no MGM studio-lot photograph and no
   Bel-Air view (searches LAM-Q-0292 to -0300); see the LoC section below.
4. LAM-M-0026/-0027 (MGM) need either a fact naming MGM studios in Culver City or a change of
   their `basis_for` to such a fact, then a new adversary run.

## European archives pass (run lamarr-euro-2026-10-22)

New: LAM-S-0060, LAM-M-0029 (verified, cc0), searches LAM-Q-0286 to -0291. Codex `gpt-6.1-sol`: supported.

| Chapter | Before | After | Why |
|---|---|---|---|
| 10 Death and legacy | NO-PHOTO | **BUILDABLE-PHOTO** (lead: LAM-F-0038 is single-source) | Wien Museum CC0 postcard of the graves of honour, around 1905 |
| 1 Birth | NO-PHOTO | unchanged | Wien Museum has CC0 Döbling views (e.g. Peter-Jordan-Straße), but no verified fact names Döbling or a street |
| 2 Education | ABSENT | unchanged | ÖNB Bildarchiv / Filmarchiv: no item page found; Ekstase stills would show her, not a place |

Registry proposal (not edited; for `data/registry/PROPOSED.md`): **Wien Museum**, kind `museum`,
exact host `sammlung.wienmuseum.at`, `may_be: ["institutional"]`. Evidence 2026-10-22: plain HTTPS
fetches of object pages answer HTTP 200 with page titles ending "– Wien Museum Online Sammlung" and
the footer "Wien Museum Online Sammlung, onlinesammlung@wienmuseum.at, 1040 Vienna, Karlsplatz 8";
object ids redirect (meta refresh) to their canonical slug URL on the same host. The person adding it
should check the TLS certificate organization.

## LoC pass (run lamarr-loc-2026-10-22)

New: LAM-S-0061, **LAM-M-0030** LoC stereograph "The busy Graben, Vienna, Austria", [1902], "No known
restrictions on publication.", public-domain, **verified** (Codex `gpt-6.1-sol`: supported), 1024 x
532; basis for LAM-F-0064 (born in Vienna, 1914). Searches LAM-Q-0292 to -0300.

| Chapter | Before | After | Why |
|---|---|---|---|
| 1 Birth | NO-PHOTO | **BUILDABLE-PHOTO** (city street, not her address) | an embeddable Vienna street view twelve years before her birth; no verified fact names Döbling or a street |
| 4 Arriving | BUILDABLE-PHOTO | unchanged | LoC has no Normandie interior (searches for dining room, salon, French Line); LAM-M-0023/-0024 stay the only ship views |
| 5 First work (MGM) | BUILDABLE-PHOTO | unchanged | LoC has posters and portraits, no studio-lot photograph |
| 7 Bel-Air | NO-PHOTO | unchanged | nothing at LoC |

Other Vienna views at LoC (Parliament 1926, Rathhaus 1929, trolley cars 1923 2001705747) are leads
only; not staged.

## Ratio-lift pass (run `ratio-lift-2026-10-24`)

Task 14b: the ratio-lift research records (workspace `ratio-lift/`, ids RL-*) taken through
staging -> merge -> Codex adversary (gpt-6.1-sol) -> compute_status -> validate. Each record's notes
keep its RL id. Only **verified** (V) facts are content; D = disputed, S = single-source.
Source LAM-S-0062; searches LAM-Q-0301 to -0307.

| Chapter | New facts | Place | Basis photos | Rating change |
|---|---|---|---|---|
| 10 Death and legacy | **LAM-F-0110 V** (Hedy Lamarr's ashes were buried at the Vienna Central Cemetery; Jewish Museum Vienna "the rest" + National WWII Museum "the remainder", quoted verbatim; the claim uses only words both carry). Lifts LAM-F-0038's place | Vienna Central Cemetery | LAM-M-0029 V (Wien Museum CC0 postcard of the graves of honour, around 1905; unchanged). Further Wien Museum CC0 leads not checked | BUILDABLE-PHOTO; the room may now name the Central Cemetery (still label the view "graves of honour, around 1905", not her 2014 grave) |
| 8 Part of a historic event | **LAM-F-0109 V** (on the September bond selling tour of the motion picture stars, at a rally at Military Common, Orange, N. J.; *Evening Star*, 13 Sep 1942) | Military Common, Orange, N. J. | none cleared (the caption's photo is a wire photo) | NONE (place verified, no photo) |
