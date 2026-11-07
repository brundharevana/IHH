# Einstein slice: what is not included, and why

Task 10c, 2026-10-09; refreshed 2026-10-10 to the re-verified facts. Every visible sentence in `chapters/1.json` and `chapters/2.json` passes
`python3 tools/content_check.py einstein`. This file lists what the slice leaves out because no
verified fact, usable media record or source supports it. Each item says what would close the gap.

## Facts and quotes

| Gap | Why | To close it |
|---|---|---|
| Quotes EIN-F-0084 and EIN-F-0085 (IAS "In Brief") | single-source: IAS republishes the AIP exhibit text, no named document or date | find the original document and a second independent holder |
| Context of quote q1 ("this" is a nuclear chain reaction in a large mass of uranium) | no verified fact states the sentence before it | stage the letter's preceding sentence as a direct-quote fact (needs a registered transcription) |
| Leo Szilard's part in drafting the 1939 letter | stated only in the LoC blog (EIN-S-0068), not a verified fact | stage it as a fact; EIN-F-0089 is single-source and EIN-F-0110 (verified) has no date, so the letter is not on the site yet |
| Arrival on 3 June 1935 at New York on the SS Queen of Bermuda; oath sworn 1 October 1940 | visible in the NARA scans (EIN-M-0019 pages 1, 2, 4) but no verified fact restates them | stage facts quoting the NARA record (transcribed by a person) |
| Swiss citizenship 1901, Patent Office, Berne 1908, German citizen 1914, U.S. citizen 1940 (EIN-F-0010 to -0016, -0112) | single-source after the 2026-10-10 recheck; the Berne, German-citizen and Princeton 1933 journey stops and the citizenship quiz were removed | a second independent registered holder whose own quote covers the whole claim |
| Journey and quiz stop for U.S. citizenship | EIN-F-0016 is single-source | the stop is "Certificate of American citizenship, 1940" on EIN-F-0051 (verified, place-free) |
| Year of first arrival | EIN-F-0004 (1932), EIN-F-0043 (1932/33) and EIN-F-0049 (1932) are single-source and disagree with EIN-F-0015 (1933) | conflicting status by a reviewer; all four are single-source, so the site says only "immigrated to the United States" (EIN-F-0108, verified, no date) |
| Date in cue c10 (EIN-F-0051, "On 1940 Oct. 1") | the grounding gate does not read "1940 Oct. 1" as a date, so "1 October 1940" fails; the record's own form reads badly aloud | the sentence is narrated without its date; a gate date-format addition would allow it |
| Present tense of EIN-F-0055 ("is doing research") | the NARA caption is present tense | narration uses "was doing" (a be/do form); the exhibit note keeps the caption's words |

## Media

| Gap | Why | To close it |
|---|---|---|
| EIN-M-0002, Einstein receiving his citizenship certificate (1940) | LoC wording "No known copyright restriction" is not in the rights rule on file, so licence class stays unknown | the extended rule (DECISIONS 2026-10-09, Task 10d) may allow it if the record credits a New York World-Telegram & Sun staff photographer; then add it to chapter 1 for cue c10 |
| A media record for the 1939 letter to Roosevelt | NARA NAID 16608874 (file unit "Sachs, Alexander") is a scan with no extracted text and was not staged as media | stage the item as a media record; then it can be a 360 document and a wall quote |
| The other eight Brunauer letters (EIN-F-0064, -0066 to -0074) | only NAID 305248 (EIN-M-0015, 18 June 1943) is a media record | stage NAIDs 305249 to 305255 as media |
| Pages 2 and 3 of the 18 June 1943 letter | a typed letter is single-sided, so the 360 document is page 1 with a plain paper back | the panel's "See the original" link opens all pages at NARA |
| IAS study photographs EIN-M-0030 to -0033 shown as images | albert.ias.edu answers plain downloads with HTTP 403 (Cloudflare) | they are cited and linked on the plaque; download the files in a browser and add them to `media-files.json` |
| Holder photo date for EIN-M-0013 and EIN-M-0014 (24 July 1943) | the date is in the records' alt text and evidence, not in the "Photo date as stated by the holder" marker the plaque reads | add the marker through the pipeline; until then the plaque shows the source's accessed date |
| EIN-M-0003 to -0005 (Washington, 1921 to 1923), EIN-M-0025 (San Diego, 1930) | usable, but no verified fact covers those visits, so no grounded title | stage facts about the visits |
| EIN-M-0012 (Nehru, 1949), EIN-M-0016 (1947 letter), EIN-M-0026/-0027 (NPG portraits), EIN-M-0028/-0029 (Fuld Hall office) | outside these two chapters; the office facts (EIN-F-0088) are single-source | later chapters |
| Page-level alt text for EIN-M-0019 | the media record has one title for all four pages | page titles would need their own grounded records |
| An archival recording of Einstein's voice | none cleared | quotes use the labeled AI voice (einstein-ai) |

## The reconstructed study (chapter 2)

- Room size (5 x 4.5 x 2.8 m) and item sizes are estimates; no source gives dimensions.
- No photograph shows how the walls join. The bookcase wall is placed north, the window wall south and
  the framed-certificate wall east as an arrangement for the visit, not as evidence. The west wall is
  unseen and labeled.
- The 1943 (NARA) and 1954 (IAS) photographs are eleven years apart; furniture may have moved.
- Seen in the photographs but not built, because the museum kit has no item kind for them: the etched
  portrait and the small framed picture, the globe, the potted plant, the driftwood, the model sailboat,
  the bust, the tobacco tin, pipe, ashtray and matchbox, the telephone, the 1954 armchair and its plaid
  blanket, the round carved side table, the stacks of books, the rug and the view through the window.
- Colours, materials and light are museum stand-ins (stated on the plaque).
