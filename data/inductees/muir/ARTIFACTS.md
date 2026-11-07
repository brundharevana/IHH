# John Muir: artifacts (documents and objects) for the tour rooms

Run `muir-artifacts-2026-10-20`, agent `artifacts-lamarr-muir`. Every search is in `searches.jsonl`
(run id `muir-artifacts-2026-10-20`). Nothing here is publishable until a reviewer approves it
through `review/decisions.jsonl` (G8). Captions and paragraphs use only the words of the verified
facts or media records they cite; site copy must still pass `check_grounding.py` (G6).

## Counts

| | before | after |
|---|---|---|
| Media records | 60 (verified 43) | 66 (verified 46, disputed 20) |
| New media | | MUI-M-0061 to -0066 (verified: -0062 passport application, -0063 Grand Register photo, -0064 BRIT herbarium sheet; disputed: -0061 Hetch Hetchy petition, -0065, -0066 LoC books) |
| Facts | 141 (verified 43) | 144 (verified 46: MUI-F-0142, -0143, -0144) |
| Page/image files in `site/public/media/` | 0 | 3 (`content/muir/media-files.json`: MUI-M-0062 p420, p421; MUI-M-0013) |

## Artifacts by stop

| Stop | Media id | Title | Holder + id | Date | Rights (holder's words) / class | Pages | Resolution | Facts it supports | Interaction |
|---|---|---|---|---|---|---|---|---|---|
| 1-2 Emigration; 6 Martinez | MUI-M-0062 (new, verified) | Passport application of John Muir, Volume 995: May 1 to 6, 1903 | NARA College Park, RG 59 Passport Applications, NAID 235846313, images 0420-0421 | 1903-04-28 (sworn; read on image) | "Unrestricted" / public-domain | 2 (front, back) | 3308x6001, 3360x5961 | MUI-F-0001, -0092 (birth), -0097 (left Scotland 1849); MUI-F-0022 (single-source: needed his father's papers for a passport) | turn (front/back); unfold |
| 2-3 Wisconsin | MUI-M-0034 | John Muir's Clock Design (1863 sketch) | Wisconsin Historical Society W0133MG | 1863 | public-domain (verified earlier) | 1 | holder page | MUI-F-0091 (inventor), MUI-F-0111 (1860 State Fair) | turn |
| 2-3 Wisconsin | MUI-M-0035 | John Muir Clock ("The star hand rising and setting with the sun all the year", 1863) | Wisconsin Historical Society W014DPN | 1863 | public-domain | 1 | holder page | MUI-F-0091 | turn |
| 4 Yosemite | MUI-M-0063 (new, verified) | Muir's signature in Grand Register | NPS Yosemite Historic Photo Collection RL_01368 (Ralph H. Anderson) | 1938-08 (photograph) | "Public domain" (Constraints Information) / public-domain | 1 | TIF 4171x2887 | MUI-F-0141 (first visit 1868), MUI-F-0119 | turn; zoom on signature |
| 4 Yosemite / Sierra | MUI-M-0064 (new, verified) | Pellaea ornithopus, John Muir, 1875, Sierra Nevada (BRIT461292) | Botanical Research Institute of Texas (TORCH portal) | 1875 | "http://creativecommons.org/publicdomain/zero/1.0/" / cc0 | 1 sheet | holder JPG (size not read) | none (collector identity is an inference) | 360-style object view of the herbarium sheet |
| 4 Yosemite | MUI-M-0013 | Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903 | LoC P&P LC-DIG-ppmsca-36413 | 1903 | public-domain | 1 stereograph | TIF 4753x2955 | MUI-F-0086 | turn (stereo card front) |
| 5 Alaska | MUI-M-0043 | John Burroughs and John Muir (Carl Everton Moon, 1909) | Smithsonian NPG NPG.2013.62 | 1909 | cc0 | 1 | holder page | MUI-F-0085 context | turn |
| 6 Martinez | MUI-M-0020 | Self Portrait of John Muir (in a letter to Miss Janet Douglass Moores, February 23, 1887) | NPS GGNRA Park Archives GOGA 32470.0345 | 1887-02-23 | public-domain | 1 | holder page | MUI-F-0069 (writer) | turn; page of a letter |
| 6 Martinez / Hetch Hetchy | MUI-M-0061 (new, DISPUTED) | Petition from the Society for the Preservation of National Parks against Granting San Francisco the Hetch Hetchy Valley | NARA, RG 46, NAID 7268060 | 1913-06-27 | "Unrestricted"; adversary refuted public-domain (privately written letter: see owner questions) | 2 + PDF | 2613x3347, 2612x3379 | MUI-F-0070, -0071, -0142, -0143, -0144 | page-through; unfold the two-page letter |
| 6 Hetch Hetchy | MUI-M-0065 (new, disputed, link only) | Let everyone help to save the famous Hetch-Hetchy Valley... (1911) | LoC tmp93000846 | 1911 | LoC "The books in this collection are in the public domain and are free to use and reuse." (not the approved rule wording) | 1 | 1830x2778 | MUI-F-0061, -0037 | turn (broadside) |
| 6 Sierra Club | MUI-M-0066 (new, disputed, link only) | Articles of association ... of the Sierra club (1892) | LoC 03022601 | 1892 | same LoC wording | booklet | 1120x1937 | MUI-F-0006, -0037, -0019 | page-through |

## Constellations (Searchable Museum style)

Theme tags: Immigration & Migration, Nature, Invention, Writing, Activism, Family, Legacy.

### Constellation A: "Applying for a passport, Martinez, 1903" (stops 1-2 and 6) — centre MUI-M-0062

| Item | Media | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: passport application, front | MUI-M-0062-p420 | Immigration & Migration | 1903-05-05 (Passport Bureau stamp, read on the image; not a fact yet) | Passport application of John Muir, Volume 995: May 1 to 6, 1903. | (media title) |
| Back of the application | MUI-M-0062-p421 | Immigration & Migration | 1903 | (same record) | — |
| Dunbar birthplace (basis photo) | MUI-M-0055 | Immigration & Migration | 1838-04-21 | In 1838, on April 21, John Muir was born in Dunbar, Scotland. | MUI-F-0092 |
| Leaving Scotland | (text item) | Immigration & Migration | 1849 | In 1849, in the company of his father, sister, and brother, ten-year-old John Muir left Scotland for the United States. | MUI-F-0097 |
| Landing in New York | (text item; manifest not found) | Immigration & Migration | 1849 | In 1849 the Muirs landed in New York City and went by boat to Albany and then across the Erie Canal to Buffalo. | MUI-F-0098 |
| Old Muir homestead near Martinez | MUI-M-0060 | Family | — | Old Muir homestead near Martinez [Alhambra Valley]. | MUI-F-0123 |

Paragraph (MUI-F-0092, -0097, -0098, -0099): In 1838, on April 21, John Muir was born in Dunbar,
Scotland. In 1849, in the company of his father, sister, and brother, ten-year-old John Muir left
Scotland for the United States. The Muirs landed in New York City and went by boat to Albany and then
across the Erie Canal to Buffalo, then across the Great Lakes to Milwaukee and overland to Kingston.

Lead (not a fact): on the application Muir swears he sailed from Glasgow "in the ship 'Warren'" on or
about 2 March 1849 and was naturalized on 28 April 1903 at Martinez. A person must transcribe images
0420-0421 (or a Citizen Archivist transcription must appear) before these become facts. This is the
only registered-holder source for the ship's name found so far.

### Constellation B: "Saving Hetch Hetchy, 1913" (stop 6) — centre MUI-M-0061 (pending owner rights ruling)

| Item | Media | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: Society letter, page 1 (letterhead) | MUI-M-0061 p1 | Activism | 1913-06-27 | Mr. John Muir of Martinez was President of the California Branch of the Society for the Preservation of National Parks. | MUI-F-0142 |
| Letter, page 2 with signatures | MUI-M-0061 p2 | Activism | 1913-06-27 | "In behalf of all of the people of the nation we ask your aid in putting an end to these assaults on our great national parks" (joint letter signed by John Muir and others) | MUI-F-0143, MUI-F-0070 |
| Quotation | (quote card) | Activism | 1913-06-27 | "So important a bill should not be rushed through Congress without mature consideration and time allowed for its opponents to be heard." | MUI-F-0144 |
| 1911 broadside | MUI-M-0065 (link only) | Activism | 1911 | Let everyone help to save the famous Hetch-Hetchy Valley... | MUI-F-0061 (single-source) |
| Sierra Club articles, 1892 | MUI-M-0066 (link only) | Legacy | 1892 | In 1892 Muir founded the Sierra Club. | MUI-F-0037 |
| Roosevelt and Muir, Glacier Point | MUI-M-0013 | Nature | 1903 | In 1903 Muir and Roosevelt were in Yosemite. | MUI-F-0086 |

Paragraph (MUI-F-0070, -0071, -0142): Mr. John Muir of Martinez was President of the California
Branch of the Society for the Preservation of National Parks. John Muir and other leading
preservationists signed a petition that the Society submitted to Congress; it urged Congress to
defeat the Raker Bill, which called for a dam to be built across the Hetch Hetchy Valley.
(Quotations MUI-F-0143 and -0144 come from a letter signed by four people; the site must attribute
them to the letter, not to Muir alone.)

### Constellation C: "The inventor-naturalist's hand" (stops 2-4) — centre MUI-M-0034

| Item | Media | Theme | Exact date | One-line caption | Fact ids |
|---|---|---|---|---|---|
| Centre: clock design sketch | MUI-M-0034 | Invention | 1863 | Sketch of John Muir's clock design, 1863. | MUI-F-0091 |
| Star-hand clock illustration | MUI-M-0035 | Invention | 1863 | "The star hand rising and setting with the sun all the year". | MUI-F-0091 |
| State Fair, Madison | (text item) | Invention | 1860 | In 1860 Muir exhibited inventions at the State Fair in Madison. | MUI-F-0111 |
| Herbarium sheet, Sierra Nevada | MUI-M-0064 | Nature | 1875 | Pellaea ornithopus, John Muir, 1875, Sierra Nevada. | — (collector named only as "John Muir") |
| Grand Register signature | MUI-M-0063 | Nature | 1938-08 (photograph) | Muir's signature in Grand Register. | MUI-F-0141 |
| Self-portrait in a letter | MUI-M-0020 | Writing | 1887-02-23 | Self Portrait of John Muir in a letter to Miss Janet Douglass Moores, February 23, 1887. | MUI-F-0069 |

Paragraph (MUI-F-0091, -0111, -0141, -0069): John Muir was an inventor; in 1860 Muir exhibited
inventions at the State Fair in Madison. Muir's first visit to Yosemite was in 1868. John Muir was a
writer.

## Recreation candidates (owner may approve a labelled 3D recreation)

| Object | Holder | Reference photos | Why it matters |
|---|---|---|---|
| Combination alarm clock and study desk ("about 1862") | Wisconsin Historical Society | MUI-M-0032 (rights-restricted photo), MUI-M-0033 drawing (unknown), MUI-M-0036 (unknown); Muir's own 1863 drawings MUI-M-0034/-0035 are public domain | His best-known object; a model built from his own public-domain drawings could be labelled "Reconstruction based on John Muir's Clock Design, 1863 (Wisconsin Historical Society)". |
| Muir's 1869 Yosemite cabin | University of the Pacific (drawing jmd/1186, HTTP 403; Muir-Hanna Trust copyright) | NPS plaque photo MUI-M-0059 (basis) | Stop 4 room; only his own drawing shows it. |
| Muir's journals (e.g. Journal 01, 1867-68; Journal 28, Alaska 1879) | University of the Pacific | MUI-M-0041, -0044 (rights-restricted / unknown) | Page-through journal object; a blank-journal recreation without his text would be possible. |
| Plant press / herbarium specimens 1879 Sitka and Stikine River, 1881 Martinez oaks | Missouri Botanical Garden (images CC BY-NC-SA 3.0) | GBIF/Tropicos MO 727186, 100347820, 100327950 | Ties stops 5 and 6 to his botany; NC licence bars embedding. |
| John Muir stamp (1964, 5c) | Smithsonian National Postal Museum | MUI-M-0039 (rights-restricted) | Legacy room. |

## LoC pass 2026-10-22 (run `muir-loc-2026-10-22`)

No new artifact (document or object): LoC search found no further Muir item. The pass added eight
public-domain place photographs as room basis photos (MUI-M-0076 to -0083, verified; ROOMS.md
chapters 7a, 8a, 8b). The rights question on MUI-M-0065/-0066 (LoC book wording) is unchanged.

## Rejected candidates and why

- University of the Pacific John Muir Papers (letters, journals, drawings): "The unpublished works of
  John Muir are copyrighted by the Muir-Hanna Trust" with permission required; link only.
- MO (Tropicos) specimens: CC BY-NC-SA 3.0 images; ANSP specimens CC BY-NC: not embeddable.
- NHMUK 1896 Ben Lawers and BBM 1897 British Columbia specimens: collector "John Muir" may be another
  person; not staged.
- NARA NAID 296210 (1918 exhibit quoting "Mountains of California"): a later typed excerpt, not
  Muir's document. NARA NAID 123857893 (NHL file): "Restricted - Possibly".
- 1849 ship Warren manifest: NARA M237 Customs Passenger Lists, Port of New York, Roll 78 (April 1 -
  May 3, 1849, NAID 517433260, 1012 unindexed TIFFs, "Unrestricted") and Roll 77 (NAID 517432276)
  hold it if the ship landed in that window; no index or transcription exists, so the list was not
  found. FamilySearch/Ancestry not used (per lead).
- HABS CA-1890 remaining drawing sheets: already handled as basis photos (MUI-M-0052 to -0054);
  `tools/fetch_media.py` cannot fetch records whose url is a tile.loc.gov file (holder host check).

## Requests for the lead / owner

1. Rights ruling, MUI-M-0061 (Hetch Hetchy petition): NARA "Unrestricted", but the adversary twice
   refuted public-domain because the approved NARA rule text says "records created by the federal
   government" and this letter was written by a private society (1913). Same question applies in
   principle to Lamarr's LAM-M-0028 (a private attorney's letter of 1945, verified) and to any NARA
   file holding private letters.
2. Rights ruling, MUI-M-0065 and -0066: LoC rights[0] "The books in this collection are in the public
   domain and are free to use and reuse." Not in the approved LoC wording list; the adversary refuted
   `unknown`. Extend the LoC rule to this exact wording, or keep link only.
3. `tools/fetch_media.py` HOLDER_FILE_HOSTS: add npgallery.nps.gov (MUI-M-0063, -0018 to -0021,
   -0055, -0060), web.corral.tacc.utexas.edu for portal.torcherbaria.org (MUI-M-0064),
   wisconsinhistory.org (MUI-M-0034, -0035) and ids.si.edu for npg.si.edu (MUI-M-0042, -0043) so the
   verified public-domain/CC0 items can be fetched. Not changed here (outside this agent's paths).
4. Registry (proposal only, not edited): Botanical Research Institute of Texas / TORCH portal
   (portal.torcherbaria.org) as an institutional herbarium source; currently secondary.
5. Transcription: NARA NAID 235846313 images 0420-0421 (Muir's passport application: ship Warren,
   Glasgow, March 1849; naturalized 28 April 1903) to turn the Warren lead into facts.
