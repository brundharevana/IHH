# Review checklist: Hedy Lamarr (lamarr)

Generated 2026-11-02 by tools/export.py (preview export).

This is a preview. Every block of wordpress.html is stamped "DRAFT — NOT REVIEWED"; do not publish it.

Facts: disputed 8, rejected 3, single-source 57, verified 47. Media: disputed 16, pending 1, rejected 3, verified 22.

How to use this checklist: for each item, open the source link and find the quote, then tick one box (for an edit, write the new wording). Return the file to the maintainer, who records the decisions in review/decisions.jsonl and runs tools/apply_review.py. Approval does not override the checks: only verified items can be approved and published. Disputed, conflicting and single-source items can be edited (then checked again), rejected, or given a note.

## 1. Disputed: the independent checker did not agree (8)

### LAM-F-0013 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr died Jan. 19, 2000.

**About:** category death, date 2000-01-19

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Born Nov. 9, 1914 - Died Jan. 19, 2000" (inductee header, dates line) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0046, Smithsonian Institution (institutional): "Sitter William Horatio Powell, 29 Jul 1892 - 5 Mar 1984 Hedy Lamarr, 9 Nov 1914 - 19 Jan 2000" (Sitter) <https://npg.si.edu/object/npg_NPG.96.211>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Died: Jan. 19, 2000, Casselberry, Florida" (line 64, header field 'Died') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0010, Encyclopaedia Britannica (secondary): "died January 19, 2000, near Orlando, Florida, U.S." (paragraph 1) <https://www.britannica.com/biography/Hedy-Lamarr>
- LAM-S-0013, The National WWII Museum (secondary): "On January 19, 2000, Lamarr passed away in Casselberry, Florida at the age of 85." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0009 found (https://www.invent.org/inductees/hedy-lamarr); LAM-S-0046 found (https://npg.si.edu/object/npg\_NPG.96.211); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech)

**Checker's reasoning:** The cited passages agree on the death date; the Britannica live page could not be loaded.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-smithsonian-F-30 (same claim: 'The sitter Hedy Lamarr: 9 Nov 1914 - 19 Jan 2000.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-4 (part: 'Hedy Lamarr died on Jan. 19, 2000.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-13 (part: 'Hedy Lamarr died January 19, 2000.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-56 (part: 'On January 19, 2000, Lamarr passed away.')

### LAM-F-0016 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr became a U.S. citizen in 1953.

**About:** category citizenship, date 1953

**Evidence** (open the link and find the quote):

- LAM-S-0010, Encyclopaedia Britannica (secondary): "Lamarr became a U.S. citizen in 1953." (paragraph 3) <https://www.britannica.com/biography/Hedy-Lamarr>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Citizenship Date: 1953" (line 68, header field 'Citizenship Date') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "Although she was not yet a US citizen (and would not be naturalized until 1953)" (paragraph 8) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0016, National Women's History Museum (secondary): "The rejection led Lamarr to instead support the war efforts with her celebrity by selling war bonds." (paragraph beginning "The two came up with an extraordinary new communication system", last sentence) <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0016, National Women's History Museum (secondary): "Happy in her adopted country, she became an American citizen in April 1953." (paragraph beginning "The two came up with an extraordinary new communication system", last sentence) <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Naturalization card for Hedy Lamarr, April 10, 1953. (Records of the Immigration and Naturalization Service, National Archives)" (image caption after paragraph 16) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run lamarr-citizen-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0016 found (https://www.womenshistory.org/education-resources/biographies/hedy-lamarr); LAM-S-0044 found (https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/)

**Checker's reasoning:** No problem found with the claim or quoted evidence; Britannica's live page was unreachable.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; womenshistory.org: National Women's History Museum, institutional

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-8 (same claim: "Hedy Lamarr's citizenship date was 1953."); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-46 (same claim: 'Hedy Lamarr was not naturalized as a US citizen until 1953.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-78 (same claim: 'Lamarr became an American citizen in April 1953.'); merge lamarr-2026-10-09: evidence combined from tmp-nara-F-25 (same claim: 'A Naturalization card for Hedy Lamarr is from April 10, 1953, in the Records of the Immigration and Naturalization Service.')

### LAM-F-0017 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr was living alone at the time of her death.

**About:** category death

**Evidence** (open the link and find the quote):

- LAM-S-0010, Encyclopaedia Britannica (secondary): "but was living alone at the time of her death" (paragraph 7) <https://www.britannica.com/biography/Hedy-Lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr)

**Checker's reasoning:** The snapshot states the claim exactly; the live Britannica page could not be loaded.

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

### LAM-F-0021 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr was born November 9, 1913/14.

**About:** category birth

**Evidence** (open the link and find the quote):

- LAM-S-0010, Encyclopaedia Britannica (secondary): "Hedy Lamarr (born November 9, 1913/14, Vienna, Austria" (paragraph 1) <https://www.britannica.com/biography/Hedy-Lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr)

**Checker's reasoning:** The snapshot gives the same November 9, 1913/14 date; the live Britannica page could not be loaded.

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-12 ('Hedy Lamarr was born November 9, 1913/14, in Vienna, Austria.')

### LAM-F-0022 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr died near Orlando, Florida, U.S.

**About:** category death, place near Orlando, Florida

**Evidence** (open the link and find the quote):

- LAM-S-0010, Encyclopaedia Britannica (secondary): "died January 19, 2000, near Orlando, Florida, U.S." (paragraph 1) <https://www.britannica.com/biography/Hedy-Lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr)

**Checker's reasoning:** The snapshot states that she died near Orlando, Florida; the live Britannica page could not be loaded.

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-13 ('Hedy Lamarr died January 19, 2000, near Orlando, Florida, U.S.') Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): Casselberry is the place of death (see LAM-F-0004); 'near Orlando' is consistent with it.

### LAM-F-0026 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr went to Hollywood in 1937.

**About:** category immigration, date 1937, place Hollywood

**Evidence** (open the link and find the quote):

- LAM-S-0010, Encyclopaedia Britannica (secondary): "After leaving the possessive Mandl, she went to Hollywood in 1937" (paragraph 3) <https://www.britannica.com/biography/Hedy-Lamarr>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Place & Date of Immigration: Hollywood, California in 1937" (line 65, header field 'Place & Date of Immigration') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/)

**Checker's reasoning:** Both snapshots state Hollywood and 1937, and the live IHH page confirms them; Britannica could not be loaded.

**Why it is not verified:** G10: LAM-S-0010: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-19 ('After leaving Mandl, Hedy Lamarr went to Hollywood in 1937.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-5 (part: "Hedy Lamarr's place and date of immigration were Hollywood, California in 1937.") Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): arrival year 1937 (see LAM-F-0100).

### LAM-F-0082 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr was an actor.

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Creators: Antheil, George, 1900-1959, Composer Lamarr, Hedy (1914-2000), Actor" (Summary, Creators) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Occupation: Inventor, Actress" (line 67, header field 'Occupation') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict refuted; quote in snapshot yes; found in the live source no; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0045 not found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/)

**Checker's reasoning:** The live Smithsonian page lists Lamarr as a creator but omits the quoted “Actor” designation.

**Why it is not verified:** G4: adversary verdict is refuted; G10: LAM-S-0045: adversary did not find the quote in the live source (not found)

**Notes:** Creator heading Lamarr, Hedy (1914-2000), Actor.; merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-7 (part: "Hedy Lamarr's occupation was actress.")

### LAM-F-0098 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Austrian Hedy Kiesler, with Hollywood ahead of her, was here in person, as New York saw her.

**About:** category immigration, place New York

**Evidence** (open the link and find the quote):

- LAM-S-0051, Library of Congress (primary): "In Ecstasy? —With Hollywood Ahead of Her" (page OCR (full\_text), photo caption headline) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>
- LAM-S-0051, Library of Congress (primary): "Austrian Hedy Kiesler" (page OCR (full\_text), photo caption) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>
- LAM-S-0051, Library of Congress (primary): "Now Miss Kiesler is here in person (above as New York saw her)" (page OCR (full\_text), photo caption) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>
- LAM-S-0051, Library of Congress (primary): "date: 1937-10-04" (date field) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-2026-11-02, 2026-11-02): verdict unclear; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic no; source type right yes.

**Live check per source:** LAM-S-0051 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ct/batch\_ct\_grasso\_ver02/data/sn82014085/00393346954/1937100401/0555.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The claim combines nationality, a Hollywood prospect, and her presence as seen in New York, so it is not atomic. The live OCR source could not be loaded.

**Why it is not verified:** G4: adversary verdict is unclear; G4: adversary did not find the claim atomic (G3)

**Notes:** Tour research 2026-10-15: contemporaneous evidence that she was in New York by early October 1937 (arrival leg). The ship is not named on this page. Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the publication date of the newspaper page; the quoted text does not state the date of the event itself (the caption says she 'was here in person' with no date). The publication date stays in the source and the claim.

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the newspaper page's publication date, and the quoted text does not state the date of the event itself.

## 2. Conflicting: sources disagree (0)

None.

## 3. Single-source: needs a second independent source (57)

### LAM-F-0003 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr won the Electronic Frontier Foundation (EFF) Pioneer Award (1997).

**About:** category award, date 1997

**Evidence** (open the link and find the quote):

- LAM-S-0003, Immigrant Hall of Honor (secondary): "Won the Electronic Frontier Foundation (EFF) Pioneer Award (1997)" (line 92, Awards & Honors list item 2) <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0016, National Women's History Museum (secondary): "The Electronic Frontier Foundation jointly awarded Lamarr and Antheil with their Pioneer Award in 1997." (paragraph beginning "Meanwhile, Lamarr’s patent expired") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0013, The National WWII Museum (secondary): "In 1997, Lamarr and Antheil were jointly honored with the Electronic Frontier Foundation’s Pioneer Award. Lamarr’s son accepted the award on her behalf" (paragraph 18) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "She recruited George Antheil, a composer she met through MGM Studios" (paragraph 8) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "the Lamarr-Antheil duo were not recognized and awarded for their invention until the late 1990s and early 2000s. They both received the Electronic Frontier Foundation Pioneer Award and the Bulbie Gnass Spirit of Achievement Bronze Award" (paragraph 17) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): womenshistory.org: National Women's History Museum, institutional; nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0016 lacks word 'won' not in its quotes; name 'EFF' not in its quotes \| LAM-S-0013 lacks word 'won' not in its quotes; name 'EFF' not in its quotes \| LAM-S-0044 lacks year 1997 not in its quotes; word 'won' not in its quotes; name 'EFF' not in its quotes; event\_date 1997 not in its quotes

**Notes:** Single-source secondary claim from IHH's current page; needs independent corroboration.; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-79 (same claim: 'The Electronic Frontier Foundation jointly awarded Lamarr and Antheil with their Pioneer Award in 1997.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-55 (part: "In 1997, Lamarr and Antheil were jointly honored with the Electronic Frontier Foundation's Pioneer Award."); merge lamarr-2026-10-09: evidence combined from tmp-nara-F-26 (part: 'Hedy Lamarr and George Antheil both received the Electronic Frontier Foundation Pioneer Award.')

### LAM-F-0004 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr died in Casselberry, Florida.

**About:** category death, place Casselberry, Florida

**Evidence** (open the link and find the quote):

- LAM-S-0003, Immigrant Hall of Honor (secondary): "Died: Jan. 19, 2000, Casselberry, Florida" (line 64, header field 'Died') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "On January 19, 2000, Lamarr passed away in Casselberry, Florida at the age of 85." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks word 'died' not in its quotes

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-baseline-F-4 ('Hedy Lamarr died on Jan. 19, 2000, in Casselberry, Florida.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-56 (part: 'Lamarr passed away in Casselberry, Florida.') Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): place of death Casselberry decided by the contemporary obituary, Orlando Sentinel, Jan 20, 2000 (Roger Moore): 'CASSELBERRY - Hedy Lamarr ... was found dead in her home Wednesday' and 'Lamarr had lived in the Orlando area for the past decade, in Altamonte Springs and, for the past few months, in Casselberry.' Altamonte Springs (Wien Geschichte Wiki) was her earlier residence; 'near Orlando' (LAM-F-0022) is the region, not a different place. The Sentinel is not in the registry, so it is not staged as evidence; the death certificate was not found.

### LAM-F-0005 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr was the first woman to receive the BULBIE Gnass Spirit of Achievement Bronze Award.

**About:** category award

**Evidence** (open the link and find the quote):

- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "She later went on to be the first woman to receive the BULBIE Gnass Spirit of Achievement Bronze Award" (biography paragraph) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "Hedy Lamarr - Florida Inventors Hall of Fame" (page title) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "by presenting her with the EFF Pioneer Award" (inductee biography, paragraph 1) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0016, National Women's History Museum (secondary): "Lamarr also became the first woman to receive the Invention Convention’s Bulbie Gnass Spirit of Achievement Award." (paragraph beginning "Meanwhile, Lamarr’s patent expired") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "First woman to win the Invention Convention’s Bulbie Gnass Spirit of Achievement Award (1997)" (line 94, Awards & Honors list item 3) <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): floridainvents.org: Florida Inventors Hall of Fame, institutional; womenshistory.org: National Women's History Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0016 lacks name 'Bronze' not in its quotes \| LAM-S-0003 lacks word 'receive' not in its quotes; name 'Bronze' not in its quotes

**Notes:** No year on this page; the IHH page gives 1997. Award body (Invention Convention) page not found.; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-73 (same claim: 'Lamarr was the first woman to receive the BULBIE Gnass Spirit of Achievement Bronze Award.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-80 (same claim: 'Lamarr became the first woman to receive the Invention Convention’s Bulbie Gnass Spirit of Achievement Award.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-17 (same claim: 'Hedy Lamarr was the first woman to win the Invention Convention’s Bulbie Gnass Spirit of Achievement Award (1997).')

### LAM-F-0014 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Lamarr and Antheil never profited from their invention during their lifetime.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Although Lamarr and Antheil never profited from their invention during their lifetime" (paragraph 3) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0015 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** When the patent was issued in 1942, it listed Hedy Lamarr's maiden and married name at the time, Hedy Kiesler Markey.

**About:** category identity, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "When the patent was issued in 1942, it listed her maiden and married name at the time, Hedy Kiesler Markey." (paragraph 3) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0017, Library of Congress (institutional): "And her 1942 invention of “spread-spectrum” technology (US Patent #2,292,387; registered on August 11, 1942, under Lamarr’s then-married name of Hedy Kiesler Marke)" (post body, paragraph 2) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0017 lacks name 'When' not in its quotes; word 'issued' not in its quotes; word 'listed' not in its quotes; word 'maiden' not in its quotes ...

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-loc-F-2 (same claim: "US Patent #2,292,387 was registered under Lamarr's then-married name of Hedy Kiesler Marke.")

### LAM-F-0018 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr died in Florida in the year 2000.

**About:** category death, date 2000, place Florida

**Evidence** (open the link and find the quote):

- LAM-S-0012, Lemelson-MIT Program (secondary): "She died in Florida in the year 2000." (last paragraph) <https://lemelson.mit.edu/resources/hedy-lamarr>
- LAM-S-0012, Lemelson-MIT Program (secondary): "Silver Screen actress Hedy Lamarr" (paragraph 1) <https://lemelson.mit.edu/resources/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): lemelson.mit.edu: Lemelson-MIT Program, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

### LAM-F-0019 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1960, Hedy Lamarr was honored with a star on the Hollywood Walk of Fame.

**About:** category award, date 1960

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "In 1960, she was honored with a star on the Hollywood Walk of Fame." (paragraph 18) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "AWARDS & HONORS" (line 88, section heading) <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Star on the Hollywood Walk of Fame (1960)" (line 90, Awards & Honors list item 1) <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Hedy Lamarr - Hollywood Walk of Fame" (page title) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Ceremony date 02/08/1960" (Star Facts, Ceremony date) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Star Facts Category Motion Pictures Address 6247 Hollywood Blvd. Ceremony date 02/08/1960" (Star Facts block) <https://walkoffame.com/hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; walkoffame.com: Hollywood Walk of Fame, institutional

**Why it is not verified:** G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0006 lacks word 'honored' not in its quotes

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-15 (same claim: 'Hedy Lamarr has a star on the Hollywood Walk of Fame (1960).'); merge lamarr-2026-10-09: evidence combined from tmp-domain-F-18 (same claim: "Hedy Lamarr's Hollywood Walk of Fame ceremony date is 02/08/1960."); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-70 (part: "Hedy Lamarr's Hollywood Walk of Fame ceremony date is 02/08/1960.")

### LAM-F-0023 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Lamarr passed away at the age of 85.

**About:** category death

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "On January 19, 2000, Lamarr passed away in Casselberry, Florida at the age of 85." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0047, National Inventors Hall of Fame (institutional): "Though Lamarr died in 2000 at the age of 85, her accomplishments continue to be celebrated." ('A Lasting Legacy' section, first paragraph (snapshot line 192)) <https://www.invent.org/blog/inventors/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T161312-f0cb, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0047 lacks word 'passed' not in its quotes; word 'away' not in its quotes

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-56 ('On January 19, 2000, Lamarr passed away in Casselberry, Florida at the age of 85.')

### LAM-F-0024 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Mayer and Lamarr were both passengers on the ship the SS Normandie bound for New York.

**About:** category immigration

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "Mayer and Lamarr were both passengers on the ship the SS Normandie bound for New York, where they agreed to change her name from Hedwig Kiesler to Hedy Lamarr in homage to Barbara La Marr, a silent film star." (paragraph 6) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-45 ('Mayer and Lamarr were both passengers on the ship the SS Normandie bound for New York, where they agreed to change her name from Hedwig Kiesler to Hedy Lamarr in homage to Barbara La Marr, a silent film star.')

### LAM-F-0025 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Mayer and Lamarr agreed to change her name from Hedwig Kiesler to Hedy Lamarr in homage to Barbara La Marr, a silent film star.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "Mayer and Lamarr were both passengers on the ship the SS Normandie bound for New York, where they agreed to change her name from Hedwig Kiesler to Hedy Lamarr in homage to Barbara La Marr, a silent film star." (paragraph 6) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-45 ('Mayer and Lamarr were both passengers on the ship the SS Normandie bound for New York, where they agreed to change her name from Hedwig Kiesler to Hedy Lamarr in homage to Barbara La Marr, a silent film star.')

### LAM-F-0027 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr signed a contract to work for Louis B. Mayer in Hollywood.

**About:** category immigration

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "In 1937, she fled to London, where she met Louis B. Mayer, co-founder of Metro-Goldwyn-Mayer (MGM) Studios, who was scouting for European talent, and she signed a contract to work for him in Hollywood." (paragraph 6) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0014, Jewish Women's Archive (secondary): "Lamarr reached America via London, where she met Hollywood mogul Louis B. Mayer, who was on the lookout for émigré talent. Either in London or on board the Normandie to America, she signed a contract with Mayer and joined MGM." (paragraph 6) <https://jwa.org/encyclopedia/article/lamarr-hedy>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; jwa.org: Jewish Women's Archive, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0014 lacks word 'work' not in its quotes

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-44 ('In 1937, Hedy Lamarr fled to London, where she met Louis B. Mayer, co-founder of Metro-Goldwyn-Mayer (MGM) Studios, and she signed a contract to work for him in Hollywood.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-64 (part: 'Either in London or on board the Normandie to America, Lamarr signed a contract with Mayer and joined MGM.')

### LAM-F-0028 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Lamarr reached America via London.

**About:** category immigration

**Evidence** (open the link and find the quote):

- LAM-S-0014, Jewish Women's Archive (secondary): "Lamarr reached America via London, where she met Hollywood mogul Louis B. Mayer, who was on the lookout for émigré talent. Either in London or on board the Normandie to America, she signed a contract with Mayer and joined MGM." (paragraph 6) <https://jwa.org/encyclopedia/article/lamarr-hedy>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): jwa.org: Jewish Women's Archive, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-64 ('Lamarr reached America via London, where she met Hollywood mogul Louis B. Mayer; either in London or on board the Normandie to America, she signed a contract with Mayer and joined MGM.')

### LAM-F-0029 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** On June 10, 1941, Lamarr and Antheil filed a patent application for their invention.

**About:** category invention, date 1941-06-10

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "On June 10, 1941, the pair filed a patent application for their invention (Lamarr used her current legal name on the application, Hedy Kiesler Markey); on August 11, 1942, the invention received US patent No. 2,292,387." (paragraph 12) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0002, Google Patents (secondary): "SECRET COMMUNICATION SYSTEM Filed June 10, 1941 2 Sheets-Sheet 2 Patented Aug. 111, 1942 SECRET COMlVIUNICATION SYSTEM Hedy Kiesler Markey, Los Angeles, and George Anthcil, Manhattan Beach, Calif." (Description, patent heading (OCR text)) <https://patents.google.com/patent/US2292387A/en>
- LAM-S-0002, Google Patents (secondary): "Application June 10, 1941, Serial No. 397,412" (Description, application line) <https://patents.google.com/patent/US2292387A/en>
- LAM-S-0002, Google Patents (secondary): "Antheil George" (Info, Inventor field) <https://patents.google.com/patent/US2292387A/en>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks name 'Antheil' not in its quotes \| LAM-S-0002 lacks name 'Lamarr' not in its quotes; word 'invention' not in its quotes

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-50 ('On June 10, 1941, Lamarr and Antheil filed a patent application for their invention, and on August 11, 1942, the invention received US patent No. 2,292,387.'); merge lamarr-2026-10-09: evidence combined from tmp-domain-F-2 (part: 'Hedy Kiesler Markey and George Antheil filed the Secret Communication System patent application June 10, 1941.')

### LAM-F-0030 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr worked with Hollywood composer George Antheil to invent a frequency hopping technique.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "But Lamarr also worked with Hollywood composer George Antheil to invent a frequency hopping technique that today is referenced as an important development in the field of wireless communications." (paragraph 1) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-6 ('Hedy Lamarr worked with Hollywood composer George Antheil to invent a frequency hopping technique that today is referenced as an important development in the field of wireless communications.')

### LAM-F-0031 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Lamarr and Antheil's frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Lamarr and Antheil's frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes. Multiple radio frequencies were used to broadcast a radio signal, switching frequencies at split-second intervals in a seemingly random manner that would sound like mere noise to anyone listening." (paragraph 2) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-8 ("Lamarr and Antheil's frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes , with multiple radio frequencies used to broadcast a radio signal, switching frequencies at split-second intervals in a seemingly random manner.")

### LAM-F-0032 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In Lamarr and Antheil's frequency hopping, multiple radio frequencies were used to broadcast a radio signal, switching frequencies at split-second intervals in a seemingly random manner.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Lamarr and Antheil's frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes. Multiple radio frequencies were used to broadcast a radio signal, switching frequencies at split-second intervals in a seemingly random manner that would sound like mere noise to anyone listening." (paragraph 2) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-8 ("Lamarr and Antheil's frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes , with multiple radio frequencies used to broadcast a radio signal, switching frequencies at split-second intervals in a seemingly random manner.")

### LAM-F-0033 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age.

**About:** category career, place Hollywood

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah"." (paragraph 1) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-5 ('Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah".')

### LAM-F-0034 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in "Ziegfeld Girl".

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah"." (paragraph 1) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-5 ('Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah".')

### LAM-F-0035 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Lamarr's ashes were partially scattered in the Vienna Woods according to her last wishes.

**About:** category death, place Vienna Woods

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "Her ashes were partially scattered in the Vienna Woods according to her last wishes, and in 2014, a memorial to Lamarr was erected in Vienna’s Central Cemetery, where the remainder of her ashes were buried." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-57 ("Lamarr's ashes were partially scattered in the Vienna Woods according to her last wishes, and in 2014, a memorial to Lamarr was erected in Vienna's Central Cemetery, where the remainder of her ashes were buried.")

### LAM-F-0036 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Following her death in January 2000, Hedy Lamarr was cremated.

**About:** category death, date 2000-01

**Evidence** (open the link and find the quote):

- LAM-S-0015, Jewish Museum Vienna (institutional): "Following her death in January 2000, she was cremated. Her ashes were brought to Vienna: a part was strewn in the woods of “Am Himmel” – a place their mother frequently visited as a child in Vienna’s 19th district – by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery." (paragraph 4) <https://www.jmw.at/en/news/letters_from_hollywood>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0015 found (https://www.jmw.at/en/news/letters\_from\_hollywood)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-69 ('Following her death in January 2000, Hedy Lamarr was cremated; part of her ashes was strewn in the woods of "Am Himmel" in Vienna\\'s 19th district by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery.')

### LAM-F-0037 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Part of Hedy Lamarr's ashes was strewn in the woods of "Am Himmel" in Vienna's 19th district by her children Denise and Anthony Loder.

**About:** category death, place Vienna

**Evidence** (open the link and find the quote):

- LAM-S-0015, Jewish Museum Vienna (institutional): "Following her death in January 2000, she was cremated. Her ashes were brought to Vienna: a part was strewn in the woods of “Am Himmel” – a place their mother frequently visited as a child in Vienna’s 19th district – by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery." (paragraph 4) <https://www.jmw.at/en/news/letters_from_hollywood>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0015 found (https://www.jmw.at/en/news/letters\_from\_hollywood)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-69 ('Following her death in January 2000, Hedy Lamarr was cremated; part of her ashes was strewn in the woods of "Am Himmel" in Vienna\\'s 19th district by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery.')

### LAM-F-0038 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The rest of Hedy Lamarr's ashes were buried in a tomb of honor at the Vienna Central Cemetery.

**About:** category death, place Vienna Central Cemetery

**Evidence** (open the link and find the quote):

- LAM-S-0015, Jewish Museum Vienna (institutional): "Following her death in January 2000, she was cremated. Her ashes were brought to Vienna: a part was strewn in the woods of “Am Himmel” – a place their mother frequently visited as a child in Vienna’s 19th district – by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery." (paragraph 4) <https://www.jmw.at/en/news/letters_from_hollywood>
- LAM-S-0013, The National WWII Museum (secondary): "Her ashes were partially scattered in the Vienna Woods according to her last wishes, and in 2014, a memorial to Lamarr was erected in Vienna’s Central Cemetery, where the remainder of her ashes were buried." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0015 found (https://www.jmw.at/en/news/letters\_from\_hollywood); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech)

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks word 'rest' not in its quotes; word 'tomb' not in its quotes; word 'honor' not in its quotes

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-69 ('Following her death in January 2000, Hedy Lamarr was cremated; part of her ashes was strewn in the woods of "Am Himmel" in Vienna\\'s 19th district by her children Denise and Anthony Loder, and the rest were buried in a tomb of honor at the Vienna Central Cemetery.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-57 (part: "The remainder of Lamarr's ashes were buried in Vienna's Central Cemetery.")

### LAM-F-0039 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr's 1942 invention of spread-spectrum technology was US Patent #2,292,387, registered on August 11, 1942.

**About:** category invention, date 1942-08-11

**Evidence** (open the link and find the quote):

- LAM-S-0017, Library of Congress (institutional): "And her 1942 invention of “spread-spectrum” technology (US Patent #2,292,387; registered on August 11, 1942, under Lamarr’s then-married name of Hedy Kiesler Marke)" (post body, paragraph 2) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>
- LAM-S-0017, Library of Congress (institutional): "the celebrated screen siren Hedy Lamarr has been rediscovered" (post body, paragraph 1) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Library of Congress blog post (Now See Hear!, 2022). Corroborates the 1942 patent claim on the IHH page; compare LAM-F-0002 (Google Patents: granted 1942-08-11).

### LAM-F-0041 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Delilah was an iconic film role of Hedy Lamarr.

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0017, Library of Congress (institutional): "the celebrated screen siren Hedy Lamarr has been rediscovered. But not so much for her extraordinary beauty or even her various iconic film roles (“Delilah,” anyone?)" (post body, paragraph 1) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0042 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** George Antheil invented a torpedo guidance system with Hollywood starlet Hedy Lamarr.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0018, Library of Congress (institutional): "Extraordinarily, he invented a torpedo guidance system with Hollywood starlet Hedy Lamarr that was later adopted by the Navy." (Introduction, paragraph 2) <https://guides.loc.gov/antheil>
- LAM-S-0018, Library of Congress (institutional): "A radical force in early twentieth-century music, George Antheil (1900--1959)" (Introduction, paragraph 1) <https://guides.loc.gov/antheil>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Library of Congress research guide; 'he' in the quoted sentence is George Antheil (subject of the paragraph). No date given.

### LAM-F-0045 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The 1937 March issue of LOOK contains an article on Hedy (Lamarr) Kiesler's role in the movie Ecstasy.

**About:** category career, date 1937

**Evidence** (open the link and find the quote):

- LAM-S-0019, Library of Congress (institutional): "Illus. in: LOOK v. 1, no. 3 (1937 March), cover." (item.notes\[0\]) <https://www.loc.gov/item/2002706794/>
- LAM-S-0019, Library of Congress (institutional): "Issue contains articles on infant health care, Marlene Dietrich, children of sharecroppers, Greta Garbo, and Hedy (Lamarr) Kiesler's role in the movie "Ecstasy", each with a feature illustration on the cover." (item.notes\[1\]) <https://www.loc.gov/item/2002706794/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** LOOK Magazine Photograph Collection catalog record; subject heading Lamarr, Hedy,--1913-2000.

### LAM-F-0047 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr made it big in acting before ever moving to the United States.

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Hedy Lamarr made it big in acting before ever moving to the United States." (paragraph 4) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0048 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr's role in the Czech film Ecstasy got international attention in 1933.

**About:** category career, date 1933

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Her role in the Czech film Ecstasy got international attention in 1933" (paragraph 4) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0049 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr fled Europe and found her way to the United States through a job offer from Hollywood's MGM Studios.

**About:** category immigration

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "she fled Europe and found her way to the United States through a job offer from Hollywood’s MGM Studios" (paragraph 6) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** No arrival date, port or vessel is given; see the naturalization file LAM-S-0001 for the certificate of arrival.

### LAM-F-0050 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr became one of the most sought-after leading women in Hollywood.

**About:** category career, place Hollywood

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr became one of the most sought-after leading women in Hollywood" (paragraph 7) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0051 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in the 1939 film Algiers.

**About:** category career, date 1939

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "starred in popular movies like the 1939 film Algiers" (paragraph 7) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0052 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr wanted to join the Inventors' Council in Washington, DC, where she thought she would be of better service to the war effort.

**About:** category work, place Washington, DC

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr wanted to join the Inventors’ Council in Washington, DC, where she thought she would be of better service to the war effort." (paragraph 7) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0053 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr's path to inventing began when she heard about the Navy's difficulties with radio-controlled torpedoes.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr’s path to inventing the cornerstone of Wi-Fi began when she heard about the Navy’s difficulties with radio-controlled torpedoes." (paragraph 8) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0054 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr recruited George Antheil, a composer she met through MGM Studios, to create a Secret Communication System.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "She recruited George Antheil, a composer she met through MGM Studios, in order to create what was known as a Secret Communication System." (paragraph 8) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0055 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The idea behind the Secret Communication System was a system that constantly changed frequencies, making it difficult for the Axis powers to decode the radio messages.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "The idea behind the invention was to create a system that constantly changed frequencies, making it difficult for the Axis powers to decode the radio messages." (paragraph 9) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "in order to create what was known as a Secret Communication System" (paragraph 8) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0056 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1942, under her then-married name, Hedy Kiesler Markey, Hedy Lamarr filed for a patent for the Secret Communication System, patent case file 2,292,387.

**About:** category invention, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "In 1942, under her then-married name, Hedy Kiesler Markey, she filed for a patent for the Secret Communication System, patent case file 2,292,387, and proposed it to the Navy." (paragraph 11) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** The NARA original record is LAM-S-0037 (NAID 167820368).

### LAM-F-0057 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr proposed the Secret Communication System to the Navy.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "In 1942, under her then-married name, Hedy Kiesler Markey, she filed for a patent for the Secret Communication System, patent case file 2,292,387, and proposed it to the Navy." (paragraph 11) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0058 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The Navy refused to accept the Secret Communication System during World War II.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "The Navy refused to accept the new technology during World War II." (paragraph 14) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "The first part of Lamarr and Antheil’s Secret Communication System story did not see a happy Hollywood ending." (paragraph 14) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "However, the Navy rejected usage of their patent" (paragraph 13) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0013, The National WWII Museum (secondary): "Lamarr and Antheil introduced the idea" (paragraph 12) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "Lamarr donated the patent to the U.S. Naval war effort, and although the Navy didn’t employ it during WWII" (biography paragraph) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0012, Lemelson-MIT Program (secondary): "Although the U.S. Navy originally rejected Lamarr's idea, they did use her concept of "frequency-hopping" during missions in later years." (paragraph 4) <https://lemelson.mit.edu/resources/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; floridainvents.org: Florida Inventors Hall of Fame, institutional; lemelson.mit.edu: Lemelson-MIT Program, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks word 'refused' not in its quotes; word 'accept' not in its quotes; name 'Secret' not in its quotes; name 'Communication' not in its quotes ... \| LAM-S-0007 lacks word 'refused' not in its quotes; word 'accept' not in its quotes; name 'Secret' not in its quotes; name 'Communication' not in its quotes ... \| LAM-S-0012 lacks word 'refused' not in its quotes; word 'accept' not in its quotes; name 'Secret' not in its quotes; name 'Communication' not in its quotes ...

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-51 (same claim: 'The Navy rejected usage of the patent of Lamarr and Antheil.'); merge lamarr-2026-10-09: evidence combined from tmp-domain-F-29 (same claim: "The Navy didn't employ Lamarr's patent during WWII."); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-38 (part: "The U.S. Navy originally rejected Lamarr's idea.")

### LAM-F-0059 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr helped with the war effort by working with the USO.

**About:** category work

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr continued on in Hollywood and found other ways to help with the war effort, such as working with the USO." (paragraph 15) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0060 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr filmed her last scene with the 1958 film The Female Animal.

**About:** category career, date 1958

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Around the time Lamarr filmed her last scene with the 1958 film The Female Animal" (paragraph 16) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0066 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1933, Friedrich "Fritz" Mandl, an Austrian munitions dealer, saw Hedy Lamarr perform in the play Sissy in Vienna.

**About:** category career, date 1933, place Vienna

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "In 1933, the Austrian munitions dealer Friedrich "Fritz" Mandl saw Hedwig perform in the play Sissy in Vienna, and they were married later that year." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0067 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr went to England in 1937.

**About:** category immigration, date 1937, place England

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Hedy left Mandl in 1937 and went to England where she met Louis B. Mayer, a film producer and co-founder of Metro-Goldwyn-Mayer (MGM) studios who got her a ticket to Hollywood" (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0013, The National WWII Museum (secondary): "In 1937, she fled to London, where she met Louis B. Mayer, co-founder of Metro-Goldwyn-Mayer (MGM) Studios, who was scouting for European talent, and she signed a contract to work for him in Hollywood." (paragraph 6) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks word 'went' not in its quotes; name 'England' not in its quotes; place: name 'England' not in its quotes

**Notes:** Bears on the page's 'Hollywood, California in 1937' immigration claim: this source has her go first to England in 1937, then to Hollywood (no arrival port or date given).; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-44 (part: 'In 1937, Hedy Lamarr fled to London.') Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): arrival year 1937 (see LAM-F-0100).

### LAM-F-0068 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In England, Hedy Lamarr met Louis B. Mayer, a film producer and co-founder of Metro-Goldwyn-Mayer (MGM) studios.

**About:** category career, place England

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Hedy left Mandl in 1937 and went to England where she met Louis B. Mayer, a film producer and co-founder of Metro-Goldwyn-Mayer (MGM) studios who got her a ticket to Hollywood" (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0013, The National WWII Museum (secondary): "In 1937, she fled to London, where she met Louis B. Mayer, co-founder of Metro-Goldwyn-Mayer (MGM) Studios, who was scouting for European talent, and she signed a contract to work for him in Hollywood." (paragraph 6) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0014, Jewish Women's Archive (secondary): "Lamarr reached America via London, where she met Hollywood mogul Louis B. Mayer, who was on the lookout for émigré talent. Either in London or on board the Normandie to America, she signed a contract with Mayer and joined MGM." (paragraph 6) <https://jwa.org/encyclopedia/article/lamarr-hedy>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0045 found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0014 unreachable (https://jwa.org/encyclopedia/article/lamarr-hedy)

**Checker's reasoning:** The Smithsonian and National WWII Museum live pages contain the quoted meeting and Mayer descriptions; the Jewish Women's Archive page could not be read.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; jwa.org: Jewish Women's Archive, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks name 'England' not in its quotes; word 'film' not in its quotes; word 'producer' not in its quotes; place: name 'England' not in its quotes \| LAM-S-0014 lacks name 'England' not in its quotes; word 'film' not in its quotes; word 'producer' not in its quotes; word 'co' not in its quotes ...

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-44 (part: 'In London, Hedy Lamarr met Louis B. Mayer, co-founder of Metro-Goldwyn-Mayer (MGM) Studios.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-64 (part: 'In London, Lamarr met Hollywood mogul Louis B. Mayer.')

### LAM-F-0069 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Louis B. Mayer got Hedy Lamarr a ticket to Hollywood.

**About:** category immigration, place Hollywood

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Hedy left Mandl in 1937 and went to England where she met Louis B. Mayer, a film producer and co-founder of Metro-Goldwyn-Mayer (MGM) studios who got her a ticket to Hollywood" (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** No date or port of entry given.

### LAM-F-0070 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in Algiers (1938).

**About:** category career, date 1938

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "where she starred in a roster of films including Algiers (1938), White Cargo (1942), Tortilla Flat (1942), and Samson and Delilah (1949)." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0071 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in White Cargo (1942).

**About:** category career, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "where she starred in a roster of films including Algiers (1938), White Cargo (1942), Tortilla Flat (1942), and Samson and Delilah (1949)." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0072 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in Tortilla Flat (1942).

**About:** category career, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "where she starred in a roster of films including Algiers (1938), White Cargo (1942), Tortilla Flat (1942), and Samson and Delilah (1949)." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0073 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr starred in Samson and Delilah (1949).

**About:** category career, date 1949

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "where she starred in a roster of films including Algiers (1938), White Cargo (1942), Tortilla Flat (1942), and Samson and Delilah (1949)." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah"." (paragraph 1) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0009 lacks year 1949 not in its quotes; event\_date 1949 not in its quotes

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-5 (part: 'Hedy Lamarr starred in "Samson and Delilah".')

### LAM-F-0074 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1940 Hedy Lamarr met George Antheil at the home of actress Janet Gaynor and her husband, costume designer Gilbert Adrian.

**About:** category invention, date 1940

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "In 1940 at the home of actress Janet Gaynor and her husband, costume designer Gilbert Adrian, Lamarr met Antheil." (Historical, paragraph 3) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0013, The National WWII Museum (secondary): "In 1940, Lamarr met avant-garde composer George Antheil at a dinner party in Hollywood." (paragraph 9) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0013 lacks word 'home' not in its quotes; word 'actress' not in its quotes; name 'Janet' not in its quotes; name 'Gaynor' not in its quotes ...

**Notes:** George is supplied by the Summary quote.; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-48 (same claim: 'In 1940, Lamarr met avant-garde composer George Antheil at a dinner party in Hollywood.')

### LAM-F-0075 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr and George Antheil began work on one of Lamarr's invention ideas, a radio-guided torpedo with synchronized anti-jamming frequency hopping.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "She and Antheil began work on one of Lamarr's invention ideas, a radio-guided torpedo with synchronized anti-jamming frequency hopping." (Historical, paragraph 3) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** The source calls it Lamarr's invention idea.

### LAM-F-0076 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr brought to the partnership knowledge of munitions, gleaned from her years of marriage to Fritz Mandl, a munitions manufacturer.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr brought to their partnership knowledge of munitions, gleaned from her years of marriage to Fritz Mandl, a munitions manufacturer" (Historical, paragraph 3) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "Lamarr had at one time been married to a munitions manufacturer, giving her the foundation for her knowledge of weapons systems, including torpedo control systems." (paragraph 2) <https://www.invent.org/inductees/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0009 lacks word 'brought' not in its quotes; word 'partnership' not in its quotes; word 'gleaned' not in its quotes; word 'years' not in its quotes ...

**Notes:** merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-7 (part: "Hedy Lamarr's marriage to a munitions manufacturer gave her the foundation for her knowledge of weapons systems, including torpedo control systems.")

### LAM-F-0077 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr and George Antheil worked together from 1940 to 1942, with Lamarr explaining the basics of the idea.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr and Antheil worked together from 1940 to 1942 with Lamarr explaining the basics of the idea" (Historical, paragraph 4) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0078 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr and George Antheil worked with the attorneys Lyon & Lyon to draft patent claims and explain their invention to the National Inventors Council and the United States Patent Office.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr and Antheil worked together, along with the attorneys Lyon & Lyon to draft patent claims and explain their invention to both the National Inventors Council and the United States Patent Office." (Historical, paragraph 4) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0079 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr and George Antheil were awarded U.S. Patent 2,292,387, for a Secret Communication System, in August 1942.

**About:** category invention, date 1942-08

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr and Antheil worked together, along with the attorneys Lyon & Lyon to draft patent claims and explain their invention to both the National Inventors Council and the United States Patent Office. They were awarded U.S. Patent 2,292,387 in August 1942." (Historical, paragraph 4) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0016, National Women's History Museum (secondary): "After its creation, Lamarr and Antheil sought a patent and military support for the invention." (paragraph beginning "The two came up with an extraordinary new communication system") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0016, National Women's History Museum (secondary): "While awarded U.S. Patent No. 2,292,387 in August of 1942, the Navy decided against the implementation of the new system." (paragraph beginning "The two came up with an extraordinary new communication system") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): womenshistory.org: National Women's History Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0016 lacks date 'August 1942' (1942-08) not in its quotes; name 'George' not in its quotes; name 'Secret' not in its quotes; name 'Communication' not in its quotes ...

**Notes:** Corroborates LAM-F-0002 (Google Patents, secondary) from a registered institution; the IHH page dates the patent 1942.; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-77 (same claim: 'Lamarr and Antheil were awarded U.S. Patent No. 2,292,387 in August of 1942.')

### LAM-F-0080 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The bulk of the correspondence in the Hedy Lamarr and George Antheil Invention Papers is between Lamarr and Antheil and their patent attorneys Lyon & Lyon of Los Angeles and the United States Patent Office.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Guide to the Hedy Lamarr and George Antheil Invention Papers" (heading) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "The bulk of the correspondence is between Lammar/Antheil and their patent attorneys Lyon & Lyon of Los Angeles and the United States Patent Office." (Content Description, paragraph 2) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr and Antheil worked together, along with the attorneys Lyon & Lyon to draft patent claims and explain their invention to both the National Inventors Council and the United States Patent Office." (Historical, paragraph 4) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** The source misspells Lamarr as Lammar in this sentence.

### LAM-F-0081 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The Hedy Lamarr and George Antheil Invention Papers include correspondence with the National Inventors Council detailing the invention's significance.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Guide to the Hedy Lamarr and George Antheil Invention Papers" (heading) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Also included is correspondence with the National Inventors Council detailing the invention's significance." (Content Description, paragraph 2) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### LAM-F-0112 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Hedy Lamarr was naturalized in 1953.

**About:** category citizenship, date 1953

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Naturalization card for Hedy Lamarr, April 10, 1953. (Records of the Immigration and Naturalization Service, National Archives)" (image caption after paragraph 16) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "Although she was not yet a US citizen (and would not be naturalized until 1953)" (paragraph 8) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0071, Library of Congress (primary): "title: Evening star (Washington, D.C.), April 11, 1953" (title field) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0071, Library of Congress (primary): "Actress Hedy Lamarr has taken the oath as a United States citi zen along with 40 other aliens," (page OCR (full\_text), AP item datelined LOS ANGELES, April 11) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0071, Library of Congress (primary): "Miss Lamarr, 38, was natural ized under her real name, Hedwig Eva Maria Kiesler." (page OCR (full\_text), same AP item) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>

**Extractor:** claude:claude-opus-5-5 (run lamarr-citizen-2026-11-01, 2026-11-01) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run lamarr-citizen-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0044 found (https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0071 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_dongiovanni\_ver01/data/sn83045462/00280606157/1953041101/0005.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The Library of Congress live record and OCR could not be loaded. The snapshot quotes and the other live sources support naturalization in 1953.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): LAM-S-0044 lacks word 'naturalized' not in its quotes \| LAM-S-0071 lacks word 'naturalized' not in its quotes

**Notes:** Fact research lamarr-citizen-2026-11-01 (owner: find at least a naturalization year). Two independent holders state the year: NARA (Prologue caption of the INS naturalization card dated April 10, 1953) and The National WWII Museum. The Library of Congress page (Evening star, April 11, 1953, AP) is a dated contemporary report of the oath and naturalization; its OCR splits 'citizen' and 'naturalized' across lines. event\_date is the year only: the April 11 report says the oath has been taken, and the April 10 report (LAM-S-0063) says she gets her citizenship that day. LAM-F-0016 (same year, 'became a U.S. citizen') stays disputed only because its Britannica browser snapshot is unreachable live (G10, rejudged 2026-11-01).

## 4. Verified, awaiting your decision (47)

### LAM-F-0001 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The naturalization file at the National Archives at Riverside for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey, contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization.

**About:** category immigration

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "This file contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>
- LAM-S-0001, U.S. National Archives and Records Administration (primary): "National Archives at Riverside" (physicalOccurrences\[0\].referenceUnits\[0\].name) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-legacy-2026-10-08, 2026-10-08) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261008T204701-5c50, 2026-10-08): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Migrated from data/provenance/facts.jsonl F-0002 (legacy status verified by one agent only). Claim reworded for G2: 'U.S.' dropped and 'NARA' replaced by 'the National Archives' because no evidence quote states them. Naturalization date not yet extracted from the document. Reworded 2026-10-08 for the G2 content-word rule (a claim may contain no content word its quotes lack), using only words from its evidence quotes; meaning unchanged. Previous wording: "The National Archives holds Hedy Lamarr's naturalization file under the name Hedwig Maria Stauffer; the National Archives lists her other names as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey. The file contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization."

### LAM-F-0006 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 2014 Hedy Lamarr was inducted into the National Inventors Hall of Fame.

**About:** category award, date 2014

**Evidence** (open the link and find the quote):

- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "and in 2014 she was inducted into the National Inventors Hall of Fame." (biography paragraph) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0007, Florida Inventors Hall of Fame (secondary): "Hedy Lamarr - Florida Inventors Hall of Fame" (page title) <https://floridainvents.org/hedy-lamarr/>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Inducted into the National Inventors Hall of Fame (2014)" (line 96, Awards & Honors list item 4) <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "National Inventors Hall of Fame" (page title) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "Frequency Hopping Communication System U.S. Patent No. 2,292,387 Inducted in 2014" (inductee header) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "She recruited George Antheil, a composer she met through MGM Studios" (paragraph 8) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "in 2014 they were inducted into the National Inventors Hall of Fame" (paragraph 17) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "the Lamarr-Antheil duo" (paragraph 17) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "in 2014, a memorial to Lamarr was erected in Vienna’s Central Cemetery, where the remainder of her ashes were buried. That same year, she was posthumously inducted into the National Inventors Hall of Fame. Antheil was inducted as well." (paragraph 19) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): floridainvents.org: Florida Inventors Hall of Fame, institutional; nationalww2museum.org: The National WWII Museum, institutional

**Notes:** Corroborates tmp-institutional-F-3 (NIHF's own page).; merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-18 (same claim: 'Hedy Lamarr was inducted into the National Inventors Hall of Fame (2014).'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-3 (same claim: 'Hedy Lamarr was inducted into the National Inventors Hall of Fame in 2014 for a Frequency Hopping Communication System, U.S. Patent No. 2,292,387.'); merge lamarr-2026-10-09: evidence combined from tmp-nara-F-27 (same claim: 'In 2014 Hedy Lamarr and George Antheil were inducted into the National Inventors Hall of Fame.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-58 (part: 'Lamarr was posthumously inducted into the National Inventors Hall of Fame in 2014.')

### LAM-F-0007 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedwig Maria Stauffer is also known as Hedy Lamarr.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Name as listed in the NARA naturalization file description (LAM-S-0001).

### LAM-F-0008 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedwig Maria Stauffer is also known as Hedwig Kiesler Mandl Markey.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Name as listed in the NARA naturalization file description (LAM-S-0001).

### LAM-F-0009 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedwig Maria Stauffer is also known as Hedy Kiesler.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Name as listed in the NARA naturalization file description (LAM-S-0001).

### LAM-F-0010 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedwig Maria Stauffer is also known as Hedy Mandl.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Name as listed in the NARA naturalization file description (LAM-S-0001).

### LAM-F-0011 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedwig Maria Stauffer is also known as Hedy Markey.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0001, U.S. National Archives and Records Administration (primary): "for Hedwig Maria Stauffer, also known as Hedy Lamarr, Hedwig Kiesler Mandl Markey, Hedy Kiesler, Hedy Mandl, and Hedy Markey." (scopeAndContentNote) <https://catalog.archives.gov/id/335708097>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Name as listed in the NARA naturalization file description (LAM-S-0001).

### LAM-F-0012 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr was born Nov. 9, 1914.

**About:** category birth, date 1914-11-09

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "Born Nov. 9, 1914 - Died Jan. 19, 2000" (inductee header, dates line) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0046, Smithsonian Institution (institutional): "Sitter William Horatio Powell, 29 Jul 1892 - 5 Mar 1984 Hedy Lamarr, 9 Nov 1914 - 19 Jan 2000" (Sitter) <https://npg.si.edu/object/npg_NPG.96.211>
- LAM-S-0045, Smithsonian Institution (institutional): "Hedy Lamarr was born Hedwig Eva Maria Kiesler in Vienna, Austria in 1914." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Born: Nov. 9, 1914, Vienna, Austria" (line 63, header field 'Born') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Hedy Lamarr - Hollywood Walk of Fame" (page title) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Born: 1914-11-09, Vienna, Austria" (About, Born) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0012, Lemelson-MIT Program (secondary): "Silver Screen actress Hedy Lamarr, born on November 9, 1914 in Vienna" (paragraph 1) <https://lemelson.mit.edu/resources/hedy-lamarr>
- LAM-S-0016, National Women's History Museum (secondary): "Lamarr was originally Hedwig Eva Kiesler, born in Vienna, Austria on November 9th, 1914 into a well-to-do Jewish family." (paragraph beginning "Lamarr was originally Hedwig Eva Kiesler") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0013, The National WWII Museum (secondary): "Hedy Lamarr was born Hedwig Kiesler on November 9, 1914, in Vienna, Austria." (paragraph 4) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0014, Jewish Women's Archive (secondary): "Born Hedwig Kiesler on November 9, 1914, in Vienna, the only child of Gertrud (née Lichtwitz) and Emil Kiesler" (paragraph 2) <https://jwa.org/encyclopedia/article/lamarr-hedy>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-dec4, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0009 found (https://www.invent.org/inductees/hedy-lamarr); LAM-S-0046 found (https://npg.si.edu/object/npg\_NPG.96.211); LAM-S-0045 found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0006 found (https://walkoffame.com/hedy-lamarr/); LAM-S-0012 found (https://lemelson.mit.edu/resources/hedy-lamarr); LAM-S-0016 found (https://www.womenshistory.org/education-resources/biographies/hedy-lamarr); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0014 unreachable (https://jwa.org/encyclopedia/article/lamarr-hedy)

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): lemelson.mit.edu: Lemelson-MIT Program, institutional; womenshistory.org: National Women's History Museum, institutional; nationalww2museum.org: The National WWII Museum, institutional; jwa.org: Jewish Women's Archive, institutional

**Notes:** NIHF gives 1914; the authority heading gives 1913 and a variant 1915. No birthplace on this page.; merge lamarr-2026-10-09: evidence combined from tmp-smithsonian-F-3 (same claim: 'Hedy Lamarr was born on 9 Nov 1914.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-3 (part: 'Hedy Lamarr was born on Nov. 9, 1914.'); merge lamarr-2026-10-09: evidence combined from tmp-domain-F-19 (part: 'Hedy Lamarr was born 1914-11-09.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-36 (part: 'Hedy Lamarr was born November 9, 1914.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-75 (part: 'Lamarr was born on November 9th, 1914.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-40 (part: 'Hedy Lamarr was born on November 9, 1914.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-60 (part: 'Hedy Lamarr was born on November 9, 1914.')

### LAM-F-0020 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr was born Hedwig Kiesler.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0013, The National WWII Museum (secondary): "Hedy Lamarr was born Hedwig Kiesler on November 9, 1914, in Vienna, Austria." (paragraph 4) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0014, Jewish Women's Archive (secondary): "Born Hedwig Kiesler on November 9, 1914, in Vienna, the only child of Gertrud (née Lichtwitz) and Emil Kiesler" (paragraph 2) <https://jwa.org/encyclopedia/article/lamarr-hedy>
- LAM-S-0008, U.S. National Archives and Records Administration (institutional): "sourceNotes\[1\]: Halliwell's Filmgoer's companion, 1983 (Hedy Lamarr; real name Hedwig Kiesler; b. 1913)" (sourceNotes\[1\]) <https://catalog.archives.gov/id/10569195>
- LAM-S-0045, Smithsonian Institution (institutional): "Hedy Lamarr was born Hedwig Eva Maria Kiesler in Vienna, Austria in 1914." (snapshot line 41) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr, born Hedwig Eva Maria Kiesler, grew up in a Catholic household in Austria" (snapshot line 27) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0014 unreachable (https://jwa.org/encyclopedia/article/lamarr-hedy); LAM-S-0008 unreachable (https://catalog.archives.gov/proxy/records/search?naId=10569195); LAM-S-0045 found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0044 found (https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/)

**Checker's reasoning:** No problem found with the claim. The Jewish Women's Archive page and National Archives catalog record could not be loaded live.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional; jwa.org: Jewish Women's Archive, institutional.

**Notes:** merge lamarr-2026-10-09: atomic part of compound tmp-institutional-F-40 ('Hedy Lamarr was born Hedwig Kiesler on November 9, 1914, in Vienna, Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-60 (part: 'Hedy Lamarr was born Hedwig Kiesler.'); merge lamarr-2026-10-09: evidence combined from tmp-identify-F-1 (part: "Hedy Lamarr's real name was Hedwig Kiesler.") \| recovery 2026-10-10: corroborating evidence from LAM-S-0045 (Smithsonian) and LAM-S-0044 (National Archives) attached; adversary cleared for re-judgement.

### LAM-F-0040 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr was an inventor.

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0017, Library of Congress (institutional): "Yes, the lady was an inventor." (post body, paragraph 2) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>
- LAM-S-0017, Library of Congress (institutional): "the celebrated screen siren Hedy Lamarr has been rediscovered" (post body, paragraph 1) <https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Occupation: Inventor, Actress" (line 67, header field 'Occupation') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0002, Google Patents (secondary): "Inventor Markey Hedy Kiesler" (patent page, Inventor field) <https://patents.google.com/patent/US2292387A/en>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0017 found (https://blogs.loc.gov/now-see-hear/2022/03/gloria-swanson-a-woman-of-invention/); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0002 found (https://patents.google.com/patent/US2292387A/en)

**Checker's reasoning:** No problem found.

**Notes:** The post's paragraph 2 refers back to Hedy Lamarr named in paragraph 1.; merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-7 (part: "Hedy Lamarr's occupation was inventor.") tour-links-2026-11-01 (2026-11-01): evidence from LAM-S-0002, the source of shipped tour record LAM-M-0036, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### LAM-F-0043 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The 1941 poster for the Metro-Goldwyn-Mayer film Ziegfeld Girl shows Hedy Lamarr.

**About:** category career, date 1941

**Evidence** (open the link and find the quote):

- LAM-S-0024, Library of Congress (primary): "Poster for "Ziegfeld Girl" shows Judy Garland, Hedy Lamarr, Tony Martin, Lana Turner, James Stewart and Ziegfeld girls." (item.summary) <https://www.loc.gov/item/2005697125/>
- LAM-S-0024, Library of Congress (primary): "A Metro-Goldwyn-Mayer film." (item.notes\[0\]) <https://www.loc.gov/item/2005697125/>
- LAM-S-0024, Library of Congress (primary): "\[S.l. : s.n., 1941\]" (item.created\_published) <https://www.loc.gov/item/2005697125/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Prints and Photographs catalog record; subject heading Lamarr, Hedy,--1913-2000--Performances. The poster image is a media lead.

### LAM-F-0044 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The 1940 motion picture poster for the Metro-Goldwyn-Mayer picture Boom Town shows Hedy Lamarr in scenes from the movie.

**About:** category career, date 1940

**Evidence** (open the link and find the quote):

- LAM-S-0025, Library of Congress (primary): "Motion picture poster for "Boom Town" shows Clark Gable, Spencer Tracy, Claudette Colbert, and Hedy Lamarr in scenes from the movie." (item.summary) <https://www.loc.gov/item/2004673433/>
- LAM-S-0025, Library of Congress (primary): "A Metro-Goldwyn-Mayer picture." (item.notes\[3\]) <https://www.loc.gov/item/2004673433/>
- LAM-S-0025, Library of Congress (primary): "\[S.l. : s.n., 1940\]" (item.created\_published) <https://www.loc.gov/item/2004673433/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Prints and Photographs catalog record; subject heading Lamarr, Hedy,--1913-2000--Performances. The poster image is a media lead.

### LAM-F-0046 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Inventors of Patent Case File No. 2,292,387, Secret Communication System, were Hedy Kiesler Markey and George Antheil.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0037, U.S. National Archives and Records Administration (primary): "title: Patent Case File No. 2,292,387, Secret Communication System, Inventors Hedy Kiesler Markey and George Antheil" (title) <https://catalog.archives.gov/id/167820368>
- LAM-S-0002, Google Patents (secondary): "US2292387A - Secret communication system - Google Patents" (page title) <https://patents.google.com/patent/US2292387A/en>
- LAM-S-0002, Google Patents (secondary): "Inventor Markey Hedy Kiesler Antheil George" (Info, Inventor field) <https://patents.google.com/patent/US2292387A/en>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Original-record catalog description at NARA (Utility Patent Case Files, National Archives at Kansas City). Hedy Kiesler Markey is the married name Lamarr used; the Prologue post (LAM-S-0044) cites this NAID as her patent case file.; merge lamarr-2026-10-09: evidence combined from tmp-domain-F-1 (same claim: 'The inventors of patent US2292387A, Secret communication system, are Markey Hedy Kiesler and Antheil George.')

### LAM-F-0061 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** EVERYBODY JOINS U.S. WAR EFFORT \[ETC.\] (1942) has film entertainers on war bond tours, including Heddy Lamar.

**About:** category work, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0039, U.S. National Archives and Records Administration (primary): "film entertainers on war bond tours (including James Cagney, Ronald Colman, Bing Crosby, Irene Dunne, Greer Garson, and Heddy Lamar)" (scopeAndContentNote) <https://catalog.archives.gov/id/38919>
- LAM-S-0039, U.S. National Archives and Records Administration (primary): "title: EVERYBODY JOINS U.S. WAR EFFORT \[ETC.\]" (title) <https://catalog.archives.gov/id/38919>
- LAM-S-0039, U.S. National Archives and Records Administration (primary): "productionDates\[0\].year: 1942" (productionDates\[0\].year) <https://catalog.archives.gov/id/38919>
- LAM-S-0039, U.S. National Archives and Records Administration (primary): "subjects\[9\].heading: Lamarr, Hedy, 1913-2000" (subjects\[9\].heading) <https://catalog.archives.gov/id/38919>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** The scope note spells the name 'Heddy Lamar'; the record's subject heading is Lamarr, Hedy, 1913-2000.

### LAM-F-0062 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** THE ARMY HOUR of 1954-03-05 has a COMMAND PERFORMANCE comedy sequence from Hollywood, California, with Milton Berle, Hedy LaMarr and Edward G. Robinson.

**About:** category career, date 1954-03-05, place Hollywood, California

**Evidence** (open the link and find the quote):

- LAM-S-0040, U.S. National Archives and Records Administration (primary): "(3) COMMAND PERFORMANCE. Hollywood, California, comedy sequence with Milton Berle, Hedy LaMarr and Edward G. Robinson" (scopeAndContentNote) <https://catalog.archives.gov/id/110111>
- LAM-S-0040, U.S. National Archives and Records Administration (primary): "title: THE ARMY HOUR" (title) <https://catalog.archives.gov/id/110111>
- LAM-S-0040, U.S. National Archives and Records Administration (primary): "broadcastDates\[0\].logicalDate: 1954-03-05" (broadcastDates\[0\].logicalDate) <https://catalog.archives.gov/id/110111>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** The date is the Army Hour broadcast date; the Command Performance sequence may be older material. Spelled 'Hedy LaMarr' in the record.

### LAM-F-0063 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Radio Scripts files for the broadcast Command Performance contain studio photographs of program participants, including Hedy Lamarr.

**About:** category work

**Evidence** (open the link and find the quote):

- LAM-S-0041, U.S. National Archives and Records Administration (primary): "The files for the broadcast "Command Performance" contain studio photographs of program participants, including such notables as Bing Crosby, Dinah Shore, Judy Garland, Jack Benny and Hedy Lamarr." (scopeAndContentNote) <https://catalog.archives.gov/id/563593>
- LAM-S-0041, U.S. National Archives and Records Administration (primary): "title: Radio Scripts" (title) <https://catalog.archives.gov/id/563593>
- LAM-S-0041, U.S. National Archives and Records Administration (primary): "subjects\[3\].heading: Lamarr, Hedy, 1913-2000" (subjects\[3\].heading) <https://catalog.archives.gov/id/563593>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Series of the War Department Bureau of Public Relations, 1942-1945.

### LAM-F-0064 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr was born in Vienna, Austria in 1914.

**About:** category birth, date 1914, place Vienna, Austria

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Hedy Lamarr was born Hedwig Eva Maria Kiesler in Vienna, Austria in 1914." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "Born in Austria, Lamarr had at one time been married to a munitions manufacturer" (paragraph 2) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Born: Nov. 9, 1914, Vienna, Austria" (line 63, header field 'Born') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Hedy Lamarr - Hollywood Walk of Fame" (page title) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0006, Hollywood Walk of Fame (secondary): "Born: 1914-11-09, Vienna, Austria" (About, Born) <https://walkoffame.com/hedy-lamarr/>
- LAM-S-0012, Lemelson-MIT Program (secondary): "Silver Screen actress Hedy Lamarr, born on November 9, 1914 in Vienna" (paragraph 1) <https://lemelson.mit.edu/resources/hedy-lamarr>
- LAM-S-0016, National Women's History Museum (secondary): "Lamarr was originally Hedwig Eva Kiesler, born in Vienna, Austria on November 9th, 1914 into a well-to-do Jewish family." (paragraph beginning "Lamarr was originally Hedwig Eva Kiesler") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0013, The National WWII Museum (secondary): "Hedy Lamarr was born Hedwig Kiesler on November 9, 1914, in Vienna, Austria." (paragraph 4) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>
- LAM-S-0014, Jewish Women's Archive (secondary): "Born Hedwig Kiesler on November 9, 1914, in Vienna, the only child of Gertrud (née Lichtwitz) and Emil Kiesler" (paragraph 2) <https://jwa.org/encyclopedia/article/lamarr-hedy>
- LAM-S-0010, Encyclopaedia Britannica (secondary): "Hedy Lamarr (born November 9, 1913/14, Vienna, Austria" (paragraph 1) <https://www.britannica.com/biography/Hedy-Lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T000919-e0d9, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0045 found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0009 found (https://www.invent.org/inductees/hedy-lamarr); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0006 found (https://walkoffame.com/hedy-lamarr/); LAM-S-0012 found (https://lemelson.mit.edu/resources/hedy-lamarr); LAM-S-0016 found (https://www.womenshistory.org/education-resources/biographies/hedy-lamarr); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech); LAM-S-0014 unreachable (https://jwa.org/encyclopedia/article/lamarr-hedy); LAM-S-0010 unreachable (https://www.britannica.com/biography/Hedy-Lamarr)

**Checker's reasoning:** Multiple accessible sources explicitly give Vienna, Austria, and 1914. Britannica’s snapshot gives the year as 1913/14, but does not exclude 1914; its live page and the Jewish Women’s Archive page were unreachable.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): lemelson.mit.edu: Lemelson-MIT Program, institutional

**Notes:** Supports the page's birth year 1914 (the NARA/LoC authority heading gives 1913); the Historical note cites Rhodes, Hedy's Folly (2011).; merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-4 (same claim: 'Hedy Lamarr was born in Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-3 (part: 'Hedy Lamarr was born in Vienna, Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-domain-F-19 (part: 'Hedy Lamarr was born in Vienna, Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-36 (part: 'Hedy Lamarr was born in Vienna.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-75 (part: 'Lamarr was born in Vienna, Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-40 (part: 'Hedy Lamarr was born in Vienna, Austria.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-60 (part: 'Hedy Lamarr was born in Vienna.'); merge lamarr-2026-10-09: evidence combined from tmp-institutional-F-12 (part: 'Hedy Lamarr was born in Vienna, Austria.')

### LAM-F-0065 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr was born Hedwig Eva Maria Kiesler.

**About:** category identity

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Hedy Lamarr was born Hedwig Eva Maria Kiesler in Vienna, Austria in 1914." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Lamarr, born Hedwig Eva Maria Kiesler, grew up in a Catholic household in Austria" (paragraph 5) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0003, Immigrant Hall of Honor (secondary): "Birth Name: Hedwig Eva Maria Kiesler" (line 62, header field 'Birth Name') <https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/>
- LAM-S-0008, U.S. National Archives and Records Administration (institutional): "sourceNotes\[3\]: Young, C. Films of Hedy Lamarr, 1978, p. 11 (Hedy Lamarr; b. Hedwig Eva Maria Kiesler on Nov. 9, 1914 in Vienna, Austria)" (sourceNotes\[3\]) <https://catalog.archives.gov/id/10569195>

**Extractor:** claude:claude-opus-5-5 (run lamarr-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T001038-4324, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0045 found (https://sova.si.edu/record/NMAH.AC.1590); LAM-S-0044 found (https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/); LAM-S-0003 found (https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/); LAM-S-0008 unreachable (https://catalog.archives.gov/proxy/records/search?naId=10569195)

**Checker's reasoning:** The quoted sources support the birth name; the National Archives catalog proxy was unreachable.

**Notes:** Birth name; corroborates the identify family's NARA authority note from an independent publisher.; merge lamarr-2026-10-09: evidence combined from tmp-nara-F-2 (same claim: 'Hedy Lamarr was born Hedwig Eva Maria Kiesler.'); merge lamarr-2026-10-09: evidence combined from tmp-baseline-F-2 (same claim: "Hedy Lamarr's birth name was Hedwig Eva Maria Kiesler."); merge lamarr-2026-10-09: evidence combined from tmp-identify-F-2 (same claim: 'Hedy Lamarr was b. Hedwig Eva Maria Kiesler.')

### LAM-F-0083 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Lamarr died in 2000 at the age of 85.

**About:** category death, date 2000

**Evidence** (open the link and find the quote):

- LAM-S-0047, National Inventors Hall of Fame (institutional): "Though Lamarr died in 2000 at the age of 85, her accomplishments continue to be celebrated." ('A Lasting Legacy' section, first paragraph (snapshot line 192)) <https://www.invent.org/blog/inventors/hedy-lamarr>
- LAM-S-0048, Biography.com (secondary): "A recluse later in life, Lamarr died in her Florida home in 2000 at age 85." (snapshot line 117) <https://www.biography.com/actors/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** recovery 2026-10-10: atomic restatement of LAM-F-0023 ('Lamarr passed away at the age of 85.') in the words of the National Inventors Hall of Fame quote, corroborated by Biography.com; LAM-F-0023 keeps its computed status.

### LAM-F-0084 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Lamarr and Antheil were awarded U.S. Patent 2,292,387 in 1942.

**About:** category invention, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "Lamarr and Antheil worked together, along with the attorneys Lyon & Lyon to draft patent claims and explain their invention to both the National Inventors Council and the United States Patent Office. They were awarded U.S. Patent 2,292,387 in August 1942." (Historical, paragraph 4) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0016, National Women's History Museum (secondary): "After its creation, Lamarr and Antheil sought a patent and military support for the invention." (paragraph beginning "The two came up with an extraordinary new communication system") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>
- LAM-S-0016, National Women's History Museum (secondary): "While awarded U.S. Patent No. 2,292,387 in August of 1942, the Navy decided against the implementation of the new system." (paragraph beginning "The two came up with an extraordinary new communication system") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** recovery 2026-10-10: split from LAM-F-0079 (patent award without the system name and month, which only the Smithsonian states); LAM-F-0079 keeps its computed status.

### LAM-F-0085 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Electronic Frontier Foundation awarded Lamarr and Antheil the Pioneer Award.

**About:** category award

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "the Lamarr-Antheil duo were not recognized and awarded for their invention until the late 1990s and early 2000s. They both received the Electronic Frontier Foundation Pioneer Award and the Bulbie Gnass Spirit of Achievement Bronze Award" (paragraph 17) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0016, National Women's History Museum (secondary): "The Electronic Frontier Foundation jointly awarded Lamarr and Antheil with their Pioneer Award in 1997." (paragraph beginning "Meanwhile, Lamarr’s patent expired") <https://www.womenshistory.org/education-resources/biographies/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): womenshistory.org: National Women's History Museum, institutional

**Notes:** recovery 2026-10-10: split from LAM-F-0003 (award without the year, which the National Archives page does not state); LAM-F-0003 keeps its computed status. Note for review: EFF's own 1997 release (w2.eff.org/awards/pioneer/1997.php) calls it a special award given at the Pioneer Awards.

### LAM-F-0086 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1940 Lamarr met George Antheil.

**About:** category invention, date 1940

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "In 1940 at the home of actress Janet Gaynor and her husband, costume designer Gilbert Adrian, Lamarr met Antheil." (Historical, paragraph 3) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0045, Smithsonian Institution (institutional): "Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387)." (Summary) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0013, The National WWII Museum (secondary): "In 1940, Lamarr met avant-garde composer George Antheil at a dinner party in Hollywood." (paragraph 9) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Notes:** recovery 2026-10-10: split from LAM-F-0074 (the meeting, without the place, which only the Smithsonian states); LAM-F-0074 keeps its computed status.

### LAM-F-0087 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr starred in Samson and Delilah.

**About:** category career

**Evidence** (open the link and find the quote):

- LAM-S-0045, Smithsonian Institution (institutional): "where she starred in a roster of films including Algiers (1938), White Cargo (1942), Tortilla Flat (1942), and Samson and Delilah (1949)." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>
- LAM-S-0009, National Inventors Hall of Fame (institutional): "Actress Hedy Lamarr was best known for her work in Hollywood during its Golden Age, starring in films such as "Ziegfeld Girl" and "Samson and Delilah"." (paragraph 1) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0048, Biography.com (secondary): "She starred in such films as Tortilla Flat, Lady of the Tropics, Boom Town, and Samson and Delilah." (snapshot line 117) <https://www.biography.com/actors/hedy-lamarr>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** recovery 2026-10-10: split from LAM-F-0073 (the role without the film year, which only the Smithsonian states); LAM-F-0073 keeps its computed status.

### LAM-F-0088 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Lamarr was married to Friedrich Mandl.

**About:** category family

**Evidence** (open the link and find the quote):

- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "In addition, she was married to Friedrich Mandl, a rich ammunition manufacturer with connections to both Fascist Italy and Nazi Germany." (snapshot line 27) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0045, Smithsonian Institution (institutional): "In 1933, the Austrian munitions dealer Friedrich "Fritz" Mandl saw Hedwig perform in the play Sissy in Vienna, and they were married later that year." (Historical, paragraph 1) <https://sova.si.edu/record/NMAH.AC.1590>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** recovery 2026-10-10: split from LAM-F-0076 (the marriage to Mandl, without the munitions knowledge, which only the Smithsonian states); LAM-F-0076 keeps its computed status.

### LAM-F-0089 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1942, Lamarr's married name was Hedy Kiesler Markey.

**About:** category identity, date 1942

**Evidence** (open the link and find the quote):

- LAM-S-0009, National Inventors Hall of Fame (institutional): "When the patent was issued in 1942, it listed her maiden and married name at the time, Hedy Kiesler Markey." (paragraph 3) <https://www.invent.org/inductees/hedy-lamarr>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "In 1942, under her then-married name, Hedy Kiesler Markey, she filed for a patent for the Secret Communication System, patent case file 2,292,387, and proposed it to the Navy." (paragraph 11) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>

**Extractor:** claude:claude-opus-5-5 (run lamarr-recovery-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184132-209d, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** recovery 2026-10-10: split from LAM-F-0015 (the 1942 married name, without the issued-patent listing, which only the National Inventors Hall of Fame states); LAM-F-0015 keeps its computed status.

### LAM-F-0090 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Patent 2,292,387, Secret Communication System, was patented Aug. 11, 1942.

**About:** category invention, date 1942-08-11

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "Patented Aug. 11, 1942 2,292,387 UNITED STATES PATENT OFFICE 2,292,387 SECRET COMMUNICATION SYSTEM" (transcription of objectId 167820376 (302050\_2292387\_07.jpg, first page of the printed patent)) <https://catalog.archives.gov/id/167820368>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15: atomic replacement for the grant half of LAM-F-0002 (non-atomic, disputed), from the patent case file itself.

### LAM-F-0091 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Secret Communication System, by Hedy Kiesler Markey and George Antheil, was filed June 10, 1941.

**About:** category invention, date 1941-06-10

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "H. K. MARKEY ET AL Secret Communication System Filed June 10, 1941 2 Sheets-Sheet 1 \[top left corner\] 2,292,387 \[schematic drawings\] Hedy Kiesler Markey George Antheil" (transcription of objectId 167820374 (302050\_2292387\_05.jpg, drawing sheet 1)) <https://catalog.archives.gov/id/167820368>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15: atomic replacement for the filing half of LAM-F-0002.

### LAM-F-0092 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The United States Patent Office allowed the application of Hedy Kiesler Markey for a patent for the Secret Communication System with 6 claims; Notice of Allowance NOV 13 1941.

**About:** category invention, date 1941-11-13

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "Notice of Allowance NOV 13 1941" (transcription of objectId 167820370 (302050\_2292387\_01.jpg, file wrapper card)) <https://catalog.archives.gov/id/167820368>
- LAM-S-0049, U.S. National Archives and Records Administration (primary): "Department of Commerce United States Patent Office Washington November Thirteenth, 1941 Hedy Kiesler Markey et al Your APPLICATION for a patent for an IMPROVEMENT in Secret Communication System Filed June 10, 1941 has been examined and ALLOWED with 6 claims." (transcription of objectId 167820408 (302050\_2292387\_39.jpg, notice of allowance)) <https://catalog.archives.gov/id/167820368>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15.

### LAM-F-0093 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The post-office address of Hedy Kiesler Markey and George Antheil, petitioners to the U.S. Patent Office on Jun 10 1941, was 11805 Bellagio Road, Bel-Air, Los Angeles, California.

**About:** category invention, date 1941-06-10, place 11805 Bellagio Road, Bel-Air, Los Angeles, California

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "MAIL DIVISION Jun 10 1941 U.S. PATENT OFFICE 51/91 \[stamped slightly below\] 754 397412 Petition and Power of Attorney To the Hon. Commissioner of Patents: \[Handwritten in green ink across above\] 387 Your petitioner s HEDY KIESLER MARKEY and GEORGE ANTHEIL, citizens of \[crossed out\] the United States, residing at \[end cross out\] of Germany (Austria) and the United States, respectively, residing at Los Angeles and Manhattan Beach, respectively, in the County of Los Angeles and the State of California whose post-office address \[crossed out\] is \[end cross out\] are 11805 Bellagio Road Bel-Air, Los Angeles, California pray" (transcription of objectId 167820403 (302050\_2292387\_34.jpg, Petition and Power of Attorney); address checked against the page image) <https://catalog.archives.gov/id/167820368>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15: the only dated street address for Lamarr's 1941 Los Angeles stop found so far.

### LAM-F-0094 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Secret Communication System contemplates employing records of the type used for many years in player pianos, which consist of long rolls of paper having perforations.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "UNITED STATES PATENT OFFICE 2,292,387 SECRET COMMUNICATION SYSTEM" (transcription of objectId 167820376 (heading)) <https://catalog.archives.gov/id/167820368>
- LAM-S-0049, U.S. National Archives and Records Administration (primary): "we contemplate employing records of the type used for many years in player pianos, and which consist of long rolls of paper having perforations" (transcription of objectId 167820376, paragraph 3) <https://catalog.archives.gov/id/167820368>
- LAM-S-0050, United States Patent and Trademark Office (primary): "UNITED STATES PATENT OFFICE (1) 2,292,387 SECRET COMMUNICATION SYSTEM" (descriptionHtml heading) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>
- LAM-S-0050, United States Patent and Trademark Office (primary): "we contemplate employing records of the type used for many years in player pianos, and which consist of long rolls of paper having perforations" (descriptionHtml paragraph (5)) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368); LAM-S-0050 unreachable (https://ppubs.uspto.gov/api/patents/highlight/US-2292387-A?queryId=1&source=USOCR&includeSections=true)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15: artifact text for the patent stop.

### LAM-F-0095 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a conventional player piano record there may be 88 rows of perforations, and in the Secret Communication System such a record would permit the use of 88 different carrier frequencies.

**About:** category invention

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "UNITED STATES PATENT OFFICE 2,292,387 SECRET COMMUNICATION SYSTEM" (transcription of objectId 167820376 (heading)) <https://catalog.archives.gov/id/167820368>
- LAM-S-0049, U.S. National Archives and Records Administration (primary): "In a conventional player piano rec­ord there may be 88 rows of perforations, and in our system such a record would permit the use of 88 different carrier frequencies" (transcription of objectId 167820376, paragraph 3) <https://catalog.archives.gov/id/167820368>
- LAM-S-0050, United States Patent and Trademark Office (primary): "UNITED STATES PATENT OFFICE (1) 2,292,387 SECRET COMMUNICATION SYSTEM" (descriptionHtml heading) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>
- LAM-S-0050, United States Patent and Trademark Office (primary): "In a conventional player piano record there may be 88 rows of perforations, and in our system such a record would permit the use of 88 different carrier frequencies" (descriptionHtml paragraph (5)) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368); LAM-S-0050 unreachable (https://ppubs.uspto.gov/api/patents/highlight/US-2292387-A?queryId=1&source=USOCR&includeSections=true)

**Checker's reasoning:** no problem found

**Notes:** Tour research 2026-10-15.

### LAM-F-0096 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1941 Hedy Kiesler Markey and George Antheil signed at Los Angeles, Calif., as inventors of the Secret Communication System.

**About:** category invention, date 1941, place Los Angeles, Calif.

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "Signed at Los Angeles, Calif. this 5th \[handwritten\] day of June \[handwritten\], 1941 Inventor sign full name: Hedy Kiesler Markey \[handwritten signature\] George Antheil \[handwritten signature\] OATH STATE OF CALIFORNIA ss. COUNTY OF LOS ANGELES HEDY KIESLER MARKEY \[name circled\] and GEORGE ANTHEIL \[name circled\] The above named petitioners, being duly sworn, depose and say that they are citizens of \[crossed out\] the United States and resident \[end cross out\] Germany (Austria) and The United States, respectively, residing at Los Angeles and Manhattan Beach, respectively, in the County of Los Angeles and State of California; that they verily believe themselves to be the original, first and joint inventors or discoverers of the SECRET COMMUNICATION SYSTEM" (transcription of objectId 167820402 (302050\_2292387\_33.jpg, signature and oath page)) <https://catalog.archives.gov/id/167820368>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368)

**Checker's reasoning:** No problem found in the snapshot evidence; the live source was unreachable.

**Notes:** Tour research 2026-10-15.

### LAM-F-0097 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Patent 2,292,387, Secret Communication System, is by Hedy Kiesler Markey of Los Angeles and George Antheil of Manhattan Beach, Calif.

**About:** category invention, place Los Angeles

**Evidence** (open the link and find the quote):

- LAM-S-0049, U.S. National Archives and Records Administration (primary): "PATENT No. 2292387 1941 DATED AUG 11 1942 DIV. 51 EX'R's BOOK: 2-14-14 \[Faint ink\] Issue Aug 11 1942 Name: HEDY KIESLER MARKEY and GEORGE ANTHEIL of: LOS ANGELES , MANHATTAN BEACH State of: CALIFORNIA - Calif Invention SECRET COMMUNICATION SYSTEM" (transcription of objectId 167820370 (302050\_2292387\_01.jpg, file wrapper card)) <https://catalog.archives.gov/id/167820368>
- LAM-S-0050, United States Patent and Trademark Office (primary): "inventorsName: KIESLER MARKEY HEDY; GEORGE ANTHEIL" (inventorsName field) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>
- LAM-S-0050, United States Patent and Trademark Office (primary): "UNITED STATES PATENT OFFICE (1) 2,292,387 SECRET COMMUNICATION SYSTEM (2) Hedy Hiesler Markey, Los Angeles, and George Antheil, Manhattan Beach, Calif." (descriptionHtml heading, lines (1)-(2)) <https://ppubs.uspto.gov/pubwebapp/external.html?q=2292387.pn.&db=USOCR>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0049 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/167820368); LAM-S-0050 unreachable (https://ppubs.uspto.gov/api/patents/highlight/US-2292387-A?queryId=1&source=USOCR&includeSections=true)

**Checker's reasoning:** No problem found in the snapshot evidence; both live sources were unreachable.

**Notes:** Tour research 2026-10-15.

### LAM-F-0099 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedi Kiesler, the star of the film Ecstasy, filed suit for divorce from her Austrian husband, Fritz Mandle.

**About:** category family

**Evidence** (open the link and find the quote):

- LAM-S-0052, Library of Congress (primary): "This is Hedi Kiesler, the star of the film “Ecstasy,” who has filed suit for divorce from her munitions-making Austrian husband, Fritz Mandle." (page OCR (full\_text), photo caption 'ROMANCE WORE THIN') <https://www.loc.gov/resource/sn82016181/1937-09-20/ed-1/?sp=1>
- LAM-S-0052, Library of Congress (primary): "date: 1937-09-20" (date field) <https://www.loc.gov/resource/sn82016181/1937-09-20/ed-1/?sp=1>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-2026-11-02, 2026-11-02): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0052 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_bullock\_ver01/data/sn82016181/00516999603/1937092001/0637.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains both quoted passages and supports the claim. The live Library of Congress record and OCR text could not be loaded.

**Notes:** Tour research 2026-10-15: leaving-Vienna context for the London/Atlantic leg; the page spells her name Hedi and his Mandle. Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the publication date of the newspaper page; the quoted text does not state the date of the event itself (the caption says she 'has filed suit' with no date). The publication date stays in the source and the claim.

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the newspaper page's publication date, and the quoted text does not state the date of the event itself.

### LAM-F-0100 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Waterbury Democrat (Waterbury, Conn.), October 4, 1937, on Austrian Hedy Kiesler: Now Miss Kiesler is here in person (above as New York saw her).

**About:** category immigration, place New York

**Evidence** (open the link and find the quote):

- LAM-S-0051, Library of Congress (primary): "title: The Waterbury Democrat (Waterbury, Conn.), October 4, 1937" (title field) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>
- LAM-S-0051, Library of Congress (primary): "Austrian Hedy Kiesler" (page OCR (full\_text), photo caption) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>
- LAM-S-0051, Library of Congress (primary): "Now Miss Kiesler is here in person (above as New York saw her)" (page OCR (full\_text), photo caption) <https://www.loc.gov/resource/sn82014085/1937-10-04/ed-1/?sp=14>

**Extractor:** claude:claude-opus-5-5 (run lamarr-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-2026-11-02, 2026-11-02): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0051 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ct/batch\_ct\_grasso\_ver02/data/sn82014085/00393346954/1937100401/0555.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found; the live OCR source could not be loaded.

**Notes:** Tour research 2026-10-15: rewording of LAM-F-0098 after the adversary refuted it (the caption's date is the paper's publication date, not a dated sighting). States only what the dated page prints. (event\_date was the page's publication date; removed 2026-11-02.) Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): arrival 1937 decided by this page (LoC Chronicling America, primary) and the same wire caption in The Bismarck Tribune and The Times-News, Oct 4, 1937; The Washington Times, Oct 6, 1937, p. 7 ('has changed her name in Holly wood. Henceforth she is to be known as Hedy LaMarr'). The Wien Geschichte Wiki's 1938 is not used (it may conflate the June 1938 San Ysidro entry). Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the publication date of the newspaper page; the quoted text does not state the date of the event itself (the caption says 'Now Miss Kiesler is here' with no date). The publication date stays in the source and the claim.

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the newspaper page's publication date, and the quoted text does not state the date of the event itself.

### LAM-F-0102 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mrs. Hedwig Loder's father was the late Emil Kiesler of Vienna.

**About:** category family, place Vienna

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "Mrs. Hedwig Loder’s father, the late Emil Kiesler of Vienna" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165306-cea5, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** No problem found in the snapshot evidence; live verification was unavailable.

**Notes:** Artifacts research 2026-10-20: M-92 file, attorney's letter of December 7th 1945.

### LAM-F-0103 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mrs. Hedwig Loder's father died in 1935.

**About:** category family, date 1935

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "Mrs. Hedwig Loder’s father died in 1935" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165306-cea5, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** No problem found in the snapshot evidence; live verification was unavailable.

**Notes:** Artifacts research 2026-10-20: M-92 file.

### LAM-F-0104 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mrs. Hedwig Loder was the only child of Emil Kiesler.

**About:** category family

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "inherited by Mrs. Hedwig Loder, his only child" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>
- LAM-S-0059, U.S. National Archives and Records Administration (primary): "the late Emil Kiesler of Vienna" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165306-cea5, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** No problem found in the snapshot evidence; live verification was unavailable.

**Notes:** Artifacts research 2026-10-20: M-92 file.

### LAM-F-0105 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mrs. Gertrude Kiesler was the mother of Mrs. Hedwig Loder.

**About:** category family

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "inherited by Mrs. Hedwig Loder, his only child, together with Mrs. Gertrude Kiesler, her mother." (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165306-cea5, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** No problem found in the snapshot evidence; live verification was unavailable.

**Notes:** Artifacts research 2026-10-20: M-92 file.

### LAM-F-0106 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Paul Reiner, attorney for Miss Hedy Lamarr, asked for protection of Mrs. Loder's property interests in the oilfields of Zistersdorf in Austria.

**About:** category legacy, date 1945-12-07, place Zistersdorf, Austria

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "PAUL REINER ATTORNEY AT LAW" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>
- LAM-S-0059, U.S. National Archives and Records Administration (primary): "I am writing this letter as the attorney for Miss Hedy Lamarr" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>
- LAM-S-0059, U.S. National Archives and Records Administration (primary): "The purpose for this letter is to ask for your protection of Mrs. Loder’s property interests in the oilfields of Zistersdorf in Austria." (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>
- LAM-S-0059, U.S. National Archives and Records Administration (primary): "December 7th 1945" (transcription of objectId 74395331 (dn1929-d-242-00671.jpg, letter page II)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165306-cea5, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** No problem found in the snapshot evidence; live verification was unavailable.

**Notes:** Artifacts research 2026-10-20: M-92 file. Category legacy is the closest available; a reviewer may recategorize (family/other).

### LAM-F-0107 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Miss Hedy Lamarr by marriage became Mrs. Hedwig Loder.

**About:** category family

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "Miss Hedy Lamarr of 2702 Benedict Canyon, Beverly Hills, California who by marriage became Mrs. Hedwig Loder" (transcription of objectId 74395330 (dn1929-d-242-00670.jpg, letter of Paul Reiner, page 1)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165550-7c76, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** The snapshot’s transcription of Paul Reiner’s letter explicitly states the claimed change of name by marriage. The live transcription endpoint and catalog record were unreachable.

**Notes:** Artifacts research 2026-10-20: atomic replacement (name half) for the withdrawn LAM-F-0101. Recategorized identity -\> family (marriage name; Hedwig Loder is not an alias in inductee.json) on 2026-10-20.

### LAM-F-0108 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mrs. Hedwig Loder was a British subject.

**About:** category citizenship

**Evidence** (open the link and find the quote):

- LAM-S-0059, U.S. National Archives and Records Administration (primary): "by attorneys for Mrs. Hedwig Loder, British Subject." (transcription of objectId 74395329 (dn1929-d-242-00669.jpg, Property Control Branch memo)) <https://catalog.archives.gov/id/74395327>

**Extractor:** claude:claude-opus-5-5 (run lamarr-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T165440-9590, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** The snapshot contains the exact quoted passage identifying Mrs. Hedwig Loder as a British subject. The live source could not be reached through either shell or web access.

**Notes:** Artifacts research 2026-10-20: atomic replacement (nationality half) for the withdrawn LAM-F-0101; the letter of December 7th 1945 states the same ('who is a British subject').

### LAM-F-0109 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On the September bond selling tour of the motion picture stars, Hedy Lamarr was at a rally at Military Common, Orange, N. J.

**About:** category other, place Military Common, Orange, N. J.

**Evidence** (open the link and find the quote):

- LAM-S-0062, Library of Congress (primary): "Hedy Lamarr has been a remarkable success on the September bond, selling tour of the motion picture stars. This photo shows her during a rally at Military Common, Orange, N. J." (page 70, photo caption "SPEAKING FOR UNCLE SAM" (OCR full text)) <https://www.loc.gov/resource/sn83045462/1942-09-13/ed-1/?sp=70>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-cfd9, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0062 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_1warhol\_ver01/data/sn83045462/00280603648/1942091301/0564.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot caption directly supports the single rally appearance and its location. The live source could not be loaded through web or shell access.

**Notes:** Ratio-lift RL-F-013 (reworded to the caption's words). event\_date left empty: the caption gives the month without the year (issue 1942-09-13). The photograph is a wire photo (not usable). Chapter lamarr/history (no cleared photograph of the place).

### LAM-F-0110 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Hedy Lamarr's ashes were buried at the Vienna Central Cemetery.

**About:** category death, place Vienna Central Cemetery

**Evidence** (open the link and find the quote):

- LAM-S-0015, Jewish Museum Vienna (institutional): "Her ashes were brought to Vienna" (on file) <https://www.jmw.at/en/news/letters_from_hollywood>
- LAM-S-0015, Jewish Museum Vienna (institutional): "the rest were buried in a tomb of honor at the Vienna Central Cemetery" (on file) <https://www.jmw.at/en/news/letters_from_hollywood>
- LAM-S-0013, The National WWII Museum (secondary): "a memorial to Lamarr was erected in Vienna’s Central Cemetery, where the remainder of her ashes were buried" (on file) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-cfd9, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0015 found (https://www.jmw.at/en/news/letters\_from\_hollywood); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech)

**Checker's reasoning:** Both sources confirm burial of her remaining ashes at Vienna Central Cemetery after some were scattered; the claim does not specify that all her ashes were buried there.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Notes:** Ratio-lift RL-F-014. Quotes verbatim: JMW says "the rest", the WWII Museum "the remainder" (task 14b ruling); the claim uses only words both pages carry (the other part was strewn in the woods, LAM-S-0015). Lifts LAM-F-0038 (single-source). Chapter lamarr/legacy.

### LAM-F-0113 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Evening star (Washington, D.C.), April 11, 1953, from Los Angeles: a court rite makes an American of actress Hedy Lamarr, who has taken the oath along with 40 other aliens.

**About:** category citizenship, date 1953, place Los Angeles

**Evidence** (open the link and find the quote):

- LAM-S-0071, Library of Congress (primary): "title: Evening star (Washington, D.C.), April 11, 1953" (title field) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0071, Library of Congress (primary): "Drama-Laden Rite Makes American Os Hedy Lamarr" (page OCR (full\_text), headline of the AP item (OCR 'Os' for 'Of')) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0071, Library of Congress (primary): "LOS ANGELES, April 11.— Actress Hedy Lamarr has taken the oath as a United States citi zen along with 40 other aliens," (page OCR (full\_text), AP item, first paragraph) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0071, Library of Congress (primary): "There was unexpected drama in the court ceremony." (page OCR (full\_text), AP item, second paragraph) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>
- LAM-S-0044, U.S. National Archives and Records Administration (institutional): "Naturalization card for Hedy Lamarr, April 10, 1953. (Records of the Immigration and Naturalization Service, National Archives)" (image caption after paragraph 16) <https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/>
- LAM-S-0013, The National WWII Museum (secondary): "Although she was not yet a US citizen (and would not be naturalized until 1953)" (paragraph 8) <https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech>

**Extractor:** claude:claude-opus-5-5 (run lamarr-citizen-2026-11-01, 2026-11-01) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-0113-2026-11-02, 2026-11-02): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0071 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_dongiovanni\_ver01/data/sn83045462/00280606157/1953041101/0005.xml&format=alto\_xml&full\_text=1); LAM-S-0044 found (https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/); LAM-S-0013 found (https://www.nationalww2museum.org/war/articles/hedy-lamarrs-wwii-invention-helped-shape-modern-tech)

**Checker's reasoning:** The snapshots contain every quoted passage, and the claim describes the newspaper report and its account of one naturalization ceremony. The Library of Congress live OCR could not be loaded.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): nationalww2museum.org: The National WWII Museum, institutional

**Notes:** Fact research lamarr-citizen-2026-11-01 (owner: find at least a naturalization year). A dated contemporary Library of Congress page (AP item, Evening star, April 11, 1953) reports that Lamarr has taken the oath in a court ceremony. event\_date is the year only: the item says the oath has been taken (the April 10 page, LAM-S-0063, says she gets her citizenship that day), so the publication day is not used as the event day. Same year as LAM-F-0112 (NARA caption of the naturalization card dated April 10, 1953, and The National WWII Museum) and LAM-F-0016. 2026-11-02 (owner ruling: the year must rest on a source that states it): corroborating evidence attached from LAM-F-0112's sources, LAM-S-0013 ('would not be naturalized until 1953') and the LAM-S-0044 NARA card caption ('April 10, 1953'). event\_date stays the year only.

### LAM-F-0114 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Atlanta daily world (Atlanta, Georgia), April 29, 1953, from Los Angeles, Cal.: Hedwig Eva Maria Kiesler, better known as Hedy Lamarr, received her United States citizenship recently in this city.

**About:** category citizenship, place Los Angeles

**Evidence** (open the link and find the quote):

- LAM-S-0074, Library of Congress (primary): "title: Atlanta daily world (Atlanta, Georgia), April 29, 1953, (City Edition)" (title field) <https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4>
- LAM-S-0074, Library of Congress (primary): "HEDY BECOMES CITIZEN LOS ANGELES, CAL. Hedwig Eva Maria Kiesler, better known as Hedy Lamarr, received her United States citizenship recently in this city!" (page OCR (full\_text), item headed HEDY BECOMES CITIZEN) <https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4>

**Extractor:** claude:claude-opus-5-5 (run tour-2026-11-01, 2026-11-01) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-2026-11-02, 2026-11-02): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0074 unreachable (https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4&fo=json)

**Checker's reasoning:** The snapshot contains both quoted passages and supports the claim. The live Library of Congress record and its OCR text could not be loaded.

**Notes:** Tour-research dry run tour-2026-11-01 (enrich), work item r4 (citizen chapter). States only what the dated page prints; (earlier note, superseded: event\_date was the publication date although the item says 'recently'). Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the publication date of the newspaper page; the quoted text does not state the date of the event itself (the item says 'recently'). The publication date stays in the source and the claim.

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the newspaper page's publication date, and the quoted text does not state the date of the event itself.

### LAM-F-0115 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Washington daily news (Washington, D.C.), October 1, 1941, from Hollywood, Oct. 1: Hedy Lamarr has invented a remote control device for use in warfare.

**About:** category invention, place Hollywood

**Evidence** (open the link and find the quote):

- LAM-S-0075, Library of Congress (primary): "title: The Washington daily news (Washington, D.C.), October 1, 1941" (title field) <https://www.loc.gov/resource/sn82016181/1941-10-01/ed-1/?sp=32>
- LAM-S-0075, Library of Congress (primary): "Hedy Invents Defense Device HOLLYWOOD. Oct. 1— Hedy Lamarr has invented a remote control device for use in warfare that is considered" (page OCR (full\_text), item headed Hedy Invents Defense Device) <https://www.loc.gov/resource/sn82016181/1941-10-01/ed-1/?sp=32>

**Extractor:** claude:claude-opus-5-5 (run tour-2026-11-01, 2026-11-01) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run date-ruling-2026-11-02, 2026-11-02): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0075 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_hara\_ver01/data/sn82016181/00516999846/1941100101/1088.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains both quoted passages and supports the claim. The live Library of Congress record and OCR text could not be loaded.

**Notes:** Tour-research dry run tour-2026-11-01 (enrich), work item r6 (big-work records). States only what the dated page prints; (earlier note, superseded: event\_date was the publication date; the item says the device 'was disclosed today', datelined Oct. 1). Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the publication date of the newspaper page; the quoted text does not state the date of the event itself (the item says she 'has invented' a device; only the disclosure is 'today', datelined Oct. 1). The publication date stays in the source and the claim.

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-11-02 (leave the date out unless confirmed): event\_date removed. It was the newspaper page's publication date, and the quoted text does not state the date of the event itself.

## 5. Pending: not checked yet, or a check failed (0)

None.

## 6. Verified and already approved or edited (0)

None.

## 7. Media (39)

### LAM-M-0001 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Patent Case File No. 2,292,387, Secret Communication System (document) <https://catalog.archives.gov/id/167820368>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/167820368>

**Credit:** National Archives at Kansas City, Records of the Patent and Trademark Office, Utility Patent Case Files, NAID 167820368.

**Alt text** (published as the image description): Patent Case File No. 2,292,387, Secret Communication System, Inventors Hedy Kiesler Markey and George Antheil. Architectural and Engineering Drawings and Textual Records.

**Sources:** LAM-S-0037

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182103-79ae, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Rights statement is useRestriction.status of the NARA record; source staged by the nara family. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09) cleared for re-verification.

### LAM-M-0002 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** With Mama Hedy Lamarr and Papa John Loder Watching Eagerly, 10 Month Old Denise Hedwig Loder Awaits Her Christening (image) <https://catalog.archives.gov/id/213259618>

**Licence:** unknown; link only, never embedded

**Rights statement:** "This image may be subject to copyright or other intellectual property restrictions." <https://catalog.archives.gov/id/213259618>

**Credit:** National Archives at College Park - Still Pictures, Records of the U.S. Information Agency, Photographic File of the Paris Bureau of the New York Times, NAID 213259618.

**Alt text** (published as the image description): Original Caption: Beverly Hills, Calif. April 8, 1946. With Mama Hedy Lamarr and Papa John Loder watching eagerly, 10 months old Denise Hedwig Loder awaits her christening at All Saints Episcopal Church. Godmother Bette Davis is holding her.

**Sources:** LAM-S-0043

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Restricted - Possibly' (Copyright): a possible restriction, so unknown; link only. Source staged by the nara family.

### LAM-M-0003 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** EVERYBODY JOINS U.S. WAR EFFORT \[ETC.\] (video) <https://catalog.archives.gov/id/38919>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Some or all of this material may be restricted by copyright or other intellectual property right restrictions." <https://catalog.archives.gov/id/38919>

**Credit:** National Archives at College Park - Motion Pictures, NAID 38919.

**Alt text** (published as the image description): Shows celebrities in military service and film entertainers on war bond tours (including James Cagney, Ronald Colman, Bing Crosby, Irene Dunne, Greer Garson, and Heddy Lamar). Shows scenes of Hollywood and Washington, D.C. 1942.

**Sources:** LAM-S-0039

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Restricted - Possibly' (Copyright): unknown; link only. The record also lists a copy on the National Archives YouTube channel. Source staged by the nara family.

### LAM-M-0004 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** ARMY-NAVY SCREEN MAGAZINE, NO. 26 (video) <https://catalog.archives.gov/id/36192>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Some or all of this material may be restricted by copyright or other intellectual property rights restrictions." <https://catalog.archives.gov/id/36192>

**Credit:** National Archives at College Park - Motion Pictures, Records of the Office of the Chief Signal Officer, NAID 36192.

**Alt text** (published as the image description): Army - Navy Screen Magazine, 1944. Dinah Shore sings at the Hollywood Canteen. Personages: Lana Turner, Deanna Durbin, Marlene Dietrich, Xavier Cugat, Lewis Stone, Eddie Cantor, Hedy Lamarr, Red Skelton, and Jimmy Durante.

**Sources:** LAM-S-0038

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Restricted - Possibly': unknown; link only. The description JSON lists no digital object, so the film may not be viewable online. Source staged by the nara family.

### LAM-M-0005 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hedy Lamarr (image) <https://catalog.archives.gov/id/350486745>

**Licence:** unknown; link only, never embedded

**Rights statement:** "The copyright status of this photograph is unknown." <https://catalog.archives.gov/id/350486745>

**Credit:** Harry S. Truman Library, National Archives and Records Administration, NAID 350486745.

**Alt text** (published as the image description): Actress Hedy Lamarr standing by a column near the entrance of a building. ca. 1940.

**Sources:** LAM-S-0026

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Undetermined' with the note quoted as the rights statement: unknown; link only.

### LAM-M-0006 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Lamarr, Hedy (image) <https://catalog.archives.gov/id/178991813>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Copyright restrictions may apply to the use of any items credited to a private photographer or company. Such items comprise more than half the series." <https://catalog.archives.gov/id/178991813>

**Credit:** National Archives at College Park - Still Pictures, Records of the Office of War Information, Photographs of Wartime Personalities, NAID 178991813.

**Alt text** (published as the image description): Lamarr, Hedy. Photographs of Wartime Personalities, Records of the Office of War Information.

**Sources:** LAM-S-0027

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** File unit 208-WP-16V; no digital objects in the catalog record, so this is a link to the catalog description only. NARA useRestriction.status 'Restricted - Possibly': unknown.

### LAM-M-0007 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Stars donate at Red Cross Handicap (image) <https://www.loc.gov/item/00649869/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Publication may be restricted. For information see "New York World-Telegram & ...," https://www.loc.gov/rr/print/res/076\_nyw.html" <https://www.loc.gov/rr/print/res/076_nyw.html>

**Credit:** Library of Congress, Prints & Photographs Division, NYWT&S Collection, LC-USZ62-123401. Acme Newspictures, Inc. photograph.

**Alt text** (published as the image description): Gene Markey, wife Hedy Lamarr and Adolph Menjou, making donations to a Red Cross girl as they attend the running of the Red Cross Handicap at Hollywood Park. 1940.

**Sources:** LAM-S-0022

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** LoC rights\_advisory 'Publication may be restricted': unknown; link only.

### LAM-M-0008 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hvor Olien sprang (image) <https://www.loc.gov/item/2006677622/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions ...," https://www.loc.gov/rr/print/195\_copr.html" <https://www.loc.gov/rr/print/195_copr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Lester Glassner Collection of Movie Posters, LC-USZC4-13192.

**Alt text** (published as the image description): Motion picture poster for "Hvor Olien sprang" shows head-shots of Spencer Tracy, Hedy Lamarr, Claudette Colbert and Clark Gable above an image of burning oil fields. 1946.

**Sources:** LAM-S-0023

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** LoC rights\_advisory 'Rights status not evaluated': unknown; link only.

### LAM-M-0009 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Ziegfeld girl (image) <https://www.loc.gov/item/2005697125/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions...," https://www.loc.gov/rr/print/195\_copr.html" <https://www.loc.gov/rr/print/195_copr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Lester Glassner Collection of Movie Posters, LC-USZC4-12802.

**Alt text** (published as the image description): Poster for "Ziegfeld Girl" shows Judy Garland, Hedy Lamarr, Tony Martin, Lana Turner, James Stewart and Ziegfeld girls. A Metro-Goldwyn-Mayer film, 1941.

**Sources:** LAM-S-0024

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** LoC rights\_advisory 'Rights status not evaluated': unknown; link only.

### LAM-M-0010 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Boom Town (image) <https://www.loc.gov/item/2004673433/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions...," https://www.loc.gov/rr/print/195\_copr.html" <https://www.loc.gov/rr/print/195_copr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Lester Glassner Collection of Movie Posters, LC-USZC4-12354.

**Alt text** (published as the image description): Motion picture poster for "Boom Town" shows Clark Gable, Spencer Tracy, Claudette Colbert, and Hedy Lamarr in scenes from the movie. 1940.

**Sources:** LAM-S-0025

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** LoC rights\_advisory 'Rights status not evaluated': unknown; link only.

### LAM-M-0011 (disputed)

- [ ] reject
- [ ] note: 

**Item:** William Powell and Hedy Lamarr (image) <https://npg.si.edu/object/npg_NPG.96.211>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Usage conditions apply" <https://npg.si.edu/object/npg_NPG.96.211>

**Credit:** National Portrait Gallery, Smithsonian Institution

**Alt text** (published as the image description): William Powell and Hedy Lamarr by Jacques Kapralik, 1942. Color halftone on paper (magazine cover).

**Sources:** LAM-S-0046

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict unclear; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** The snapshot contains the rights statement and matching holder-published title, credit, date, artist, sitter, and medium details. The live NPG page could not be loaded/read, and this browser-fetched source requires quote\_in\_live "yes" for support.

**Why it is not verified:** G4: adversary verdict is unclear; G10: snapshot supplied by browser/manual for LAM-S-0046 (browser); the adversary must find the quote live (quote\_in\_live is 'unreachable')

**Notes:** NPG 'Restrictions & Rights: Usage conditions apply' (not Open Access/CC0): rights-restricted; link only. Source staged by the smithsonian family.

### LAM-M-0012 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** I Cospiratori (image) <https://npg.si.edu/object/npg_NPG.2018.31>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Usage conditions apply" <https://npg.si.edu/object/npg_NPG.2018.31>

**Credit:** National Portrait Gallery, Smithsonian Institution

**Alt text** (published as the image description): I Cospiratori by Luigi Martinati, c. 1944. Chromolithographic poster; sitters Hedy Lamarr and Paul Henreid. Italia.

**Sources:** LAM-S-0028

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NPG 'Restrictions & Rights: Usage conditions apply': rights-restricted; link only.

### LAM-M-0013 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Actress Hedy Lamarr, 1939 (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002d9663>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://digital.library.ucla.edu/catalog/ark:/21198/zz002d9663>

**Credit:** Los Angeles Times Photographic Collection, University of California, Los Angeles. Library. Department of Special Collections. CC BY 4.0.

**Alt text** (published as the image description): Portrait of actress Hedy Lamarr. January 19, 1939. Newspaper caption: IN FILM SPAT -- Hedy Lamarr, actress, who is in row over contract (Los Angeles Times, 10/4/1939).

**Sources:** LAM-S-0029

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6e98, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0029 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz002d9663)

**Checker's reasoning:** no problem found

**Notes:** Rights from the holder's own record (UCLA Library Digital Collections), which also lists Rights statement 'copyrighted' and UCLA Special Collections as rights holder alongside the CC BY 4.0 licence. Commons copy: File:Hedy Lamarr, 1939.jpg (not staged).

### LAM-M-0014 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Actress Heddy LaMarr at the "Tales of Manhattan" film premiere in Los Angeles, Calif., 1942 (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v4v7>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v4v7>

**Credit:** Los Angeles Times Photographic Collection, University of California, Los Angeles. Library. Department of Special Collections. CC BY 4.0.

**Alt text** (published as the image description): Actress Heddy LaMarr at the "Tales of Manhattan" film premiere in Los Angeles, Calif., August 5, 1942.

**Sources:** LAM-S-0030

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6e98, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0030 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v4v7)

**Checker's reasoning:** no problem found

**Notes:** Holder record (UCLA) gives Rights statement 'copyrighted', rights holder The Regents of the University of California, and the CC BY 4.0 licence. The holder spells the name 'Heddy LaMarr'; title kept as the holder titles it. Commons copy: File:Hedy Lamarr at the Tales of Manhattan premiere.jpg (not staged).

### LAM-M-0015 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Actress Hedy LaMarr and John Loder in courtroom, 1946 (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v7w6>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v7w6>

**Credit:** Los Angeles Times Photographic Collection, University of California, Los Angeles. Library. Department of Special Collections. CC BY 4.0.

**Alt text** (published as the image description): Actress Hedy LaMarr and John Loder in courtroom, confronting men suspected of robbing their house in Los Angeles, Calif., May 20, 1946.

**Sources:** LAM-S-0031

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6e98, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0031 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz0002v7w6)

**Checker's reasoning:** no problem found

**Notes:** Holder record (UCLA) gives Rights statement 'copyrighted', rights holder The Regents of the University of California, and the CC BY 4.0 licence. Commons copy: File:Hedy Lamarr and John Loder.jpg (not staged).

### LAM-M-0016 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hedy Lamarr and Victor Mature in a scene from Samson and Delilah (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz00284mp7>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "copyrighted" <https://digital.library.ucla.edu/catalog/ark:/21198/zz00284mp7>

**Credit:** UCLA Library Special Collections, Motion Picture Stills.

**Alt text** (published as the image description): Hedy Lamarr and Victor Mature in a scene from Samson and Delilah. Black-and-white photograph, between Oct 4 and Dec 14, 1948.

**Sources:** LAM-S-0032

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6e98, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0032 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz00284mp7)

**Checker's reasoning:** no problem found

**Notes:** Holder's Rights statement is 'copyrighted' with no licence on the page: rights-restricted; link only.

### LAM-M-0017 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hedy Lamarr in The Strange Woman (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz001npt3p>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "copyrighted" <https://digital.library.ucla.edu/catalog/ark:/21198/zz001npt3p>

**Credit:** UCLA Library Special Collections, Motion Picture Stills.

**Alt text** (published as the image description): Hedy Lamarr in The Strange Woman. Black-and-white photograph, between December 10 1945 and March 1946.

**Sources:** LAM-S-0033

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6e98, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0033 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz001npt3p)

**Checker's reasoning:** no problem found

**Notes:** Holder's Rights statement is 'copyrighted' with no licence on the page: rights-restricted; link only.

### LAM-M-0018 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Hedy Lamarr and George Antheil Invention Papers (document) <https://sova.si.edu/record/NMAH.AC.1590>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Collection items available for reproduction, but the Archives Center makes no guarantees concerning copyright restrictions. Other intellectual property rights may apply. Archives Center cost-recovery and use fees may apply when requesting reproductions." <https://sova.si.edu/record/NMAH.AC.1590>

**Credit:** Hedy Lamarr and George Antheil Invention Papers, Archives Center, National Museum of American History

**Alt text** (published as the image description): Collection documents the invention work of Hedy Lamarr and George Antheil for a Secret Communication System (US Patent 2,292,387): invention documents, primarily typescript correspondence and one notebook of hand drawn sketches and handwritten notes, 1940 to 1942.

**Sources:** LAM-S-0045

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154242-df44, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic no; source type right yes.

**Checker's reasoning:** The rights statement is present in both the snapshot and live Smithsonian page, and the descriptive fields are shown by the holder. However, the record describes a collection/finding aid containing multiple documents and a notebook, not one atomic media item.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim atomic (G3)

**Notes:** Finding aid 'Conditions Governing Use' makes no copyright guarantee: unknown; link only. The finding aid shows a 'Digital Only' filter, so some items may be digitized; item-level pages were not staged. Source staged by the smithsonian family.

### LAM-M-0022 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Petition for Naturalization for Hedwig Maria Stauffer (document) <https://catalog.archives.gov/id/335708097>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/335708097>

**Credit:** National Archives at Riverside, Petition for Naturalization for Hedwig Maria Stauffer, NAID 335708097.

**Alt text** (published as the image description): This file contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization for Hedwig Maria Stauffer, also known as Hedy Lamarr.

**Sources:** LAM-S-0001

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002607-2da1, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0001 unreachable (https://catalog.archives.gov/id/335708097)

**Checker's reasoning:** The snapshot supports the rights statement, title, credit, and description. The live National Archives record could not be loaded.

**Notes:** Tour research 2026-10-15: artifact for the naturalization stop (6 page images, digitalObjects 335708097-01..06.JPG, 2618x3175 px for page 1). Rights from the holder's useRestriction.status in LAM-S-0001. Page 1 (Declaration of Intention, Los Angeles, April 4, 1939) and page 2 (Petition, 1953) show the San Ysidro entry of June 11, 1938; those details are read from the images only and are not facts (no text layer).

### LAM-M-0023 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** S.S. Normandie arriving in New York Harbor on maiden voyage (image) <https://www.loc.gov/item/97504351/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. No renewal in Copyright office. (verified in 1998)" <https://www.loc.gov/item/97504351/>

**Credit:** Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): S.S. Normandie arriving in New York Harbor on maiden voyage.

**Sources:** LAM-S-0053

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0024

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-basis-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0053 found (https://www.loc.gov/item/97504351/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md, not staged as media before). Ship for the London to New York leg (stop 2). TIFF master; JPEG 640x458. The record is dated c1936 Jan. 27 (maiden voyage); it is not her 1937 crossing.

### LAM-M-0024 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Arrival of Normandie (image) <https://www.loc.gov/item/97504355/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Arrival of Normandie.

**Sources:** LAM-S-0054

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0024

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-basis-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0054 unreachable (https://www.loc.gov/item/97504355/)

**Checker's reasoning:** No problem found in the snapshot; the live Library of Congress record could not be loaded.

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md, not staged as media before). The record carries no rights advisory (notes: Copyright by Ralph Morgan): link only.

### LAM-M-0025 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Normandie, French Line poster (image) <https://www.loc.gov/item/2002718947/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions..." (http://lcweb.loc.gov/rr/print/195\_copr.html)." <https://www.loc.gov/item/2002718947/>

**Credit:** A. M. Cassandre; Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Normandie, French Line poster.

**Sources:** LAM-S-0055

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0024

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0055 found (https://www.loc.gov/item/2002718947/)

**Checker's reasoning:** The Library of Congress identifies the item as a color lithographic poster, not a photograph or survey drawing, so it does not qualify as a basis photo.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md, not staged as media before). Poster, 1935: shows the ship, not an interior. Rights not evaluated: link only.

### LAM-M-0026 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Craft workers on strike stand outside Metro-Goldwyn-Mayer Studios, Culver City, 1937 (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p15>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p15>

**Credit:** Los Angeles Daily News Negatives, UCLA Library Special Collections

**Alt text** (published as the image description): Craft workers on strike stand outside Metro-Goldwyn-Mayer Studios, Culver City, 1937.

**Sources:** LAM-S-0056

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0027

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0056 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p15)

**Checker's reasoning:** The UCLA snapshot places the photographed MGM Studios in Culver City, while the linked stop fact names Hollywood. The photograph therefore does not establish the place named by that fact.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md, not staged as media before). Exterior of the MGM studios, July 31, 1937 (stop 3). IIIF 6200x5054. No verified fact places Lamarr on the lot; the link is to her Mayer contract.

### LAM-M-0027 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Culver City Chief of Police C.T. Truschel watches craft workers on strike at MGM studios (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p4q>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p4q>

**Credit:** Los Angeles Daily News Negatives, UCLA Library Special Collections

**Alt text** (published as the image description): Culver City Chief of Police C.T. Truschel watches craft workers on strike at MGM studios.

**Sources:** LAM-S-0057

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0027

**Independent checker:** codex:gpt-6-sol (run adv-lamarr-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0057 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz00288p4q)

**Checker's reasoning:** The UCLA snapshot places the photograph at MGM studios in Culver City, while the linked stop fact names Hollywood. The holder’s page could not be loaded for a live check.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md, not staged as media before). Exterior of the MGM studios, 1937 (stop 3).

### LAM-M-0028 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** M-92 Hedwig Loder (Née Lamarr) (document) <https://catalog.archives.gov/id/74395327>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/74395327>

**Credit:** National Archives, Records of U.S. Occupation Headquarters, World War II (RG 260), Correspondence Relating to Claims and Queries, file M-92 Hedwig Loder (Née Lamarr), NAID 74395327.

**Alt text** (published as the image description): File M-92 Hedwig Loder (Née Lamarr) from the Correspondence Relating to Claims and Queries of the Records of U.S. Occupation Headquarters, World War II: letters of December 7th 1945 and January 1946 about the protection of Mrs. Hedwig Loder's property interests in the oilfields of Zistersdorf in Austria.

**Sources:** LAM-S-0058, LAM-S-0059

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173817-fb48, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0058 unreachable (https://catalog.archives.gov/proxy/records/search?naId=74395327); LAM-S-0059 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/74395327)

**Checker's reasoning:** The snapshots support the title, credit, description and listed signers; unknown is consistent with the private-writings rule because no qualifying death dates, publication or explicit public-domain declaration are established. Both live sources were unreachable, including the catalog-page fallback.

**Notes:** Artifacts research 2026-10-20: 9 page images dn1929-d-242-00668..00676.jpg (catalog.archives.gov/medialz/microfilm-publications/DN1929\_PropertyControlBranch\_USACA/DN1929\_0242/images/), page 2 is 2980x3570 px. Rights from the holder's useRestriction.status in the record snapshot. Pages: 1 file cover; 2 USFA Property Control Branch memo 7 January 1946; 3-4 Paul Reiner letter December 7th 1945; 5 reply 7 January 1946; 6 cover letter 24 January 1946; 7-9 British Element ACA letter 12 Jan 46. Stop 1 (Vienna). Authorship set on 2026-10-20: private (Paul Reiner, British Element, Allied Commission for Austria, USFA Property Control Branch) (private-writings rule, DECISIONS 2026-10-20): M-92 property file with private and non-U.S. correspondence. Applied the approved rights rule (DECISIONS 2026-10-20, private writings in public archives, private-writings rule) on 2026-10-20: license\_class set back to unknown (link-only): private writing; no sourced death year for Paul Reiner; the holder's statement 'Unrestricted' alone is not a rights grant for a private writing. Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-20261020T165440-9590, 2026-10-20) cleared for re-verification. Authorship set on 2026-10-20: private (Paul Reiner, Walker M. Treece, John G. Arnold, Director, Finance Division, British Element, Allied Commission for Austria (signature unreadable)) (private-writings rule, DECISIONS 2026-10-20): adversary 2026-10-20: list every named signer.

### LAM-M-0029 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 11., Zentralfriedhof - Ehrengräber von Beethoven, Mozart und Schubert, Ansichtskarte (image) <https://sammlung.wienmuseum.at/en/object/129280-11-zentralfriedhof-ehrengraeber-von-beethoven-mozart-und-schubert-ansichtskarte/>

**Licence:** cc0; can be shown on the site

**Rights statement:** "CC0" <https://sammlung.wienmuseum.at/en/object/129280-11-zentralfriedhof-ehrengraeber-von-beethoven-mozart-und-schubert-ansichtskarte/>

**Credit:** Wien Museum, inventory 58891/1013 (Sperlings Postkartenverlag, around 1905), CC0

**Alt text** (published as the image description): Zentralfriedhof, Ehrengräber von Beethoven, Mozart und Schubert, Ansichtskarte, around 1905.

**Sources:** LAM-S-0060

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0038

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T010544-58e0, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0060 found (https://sammlung.wienmuseum.at/en/object/129280-11-zentralfriedhof-ehrengraeber-von-beethoven-mozart-und-schubert-ansichtskarte/)

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): sammlung.wienmuseum.at: Wien Museum, secondary (museum collection holder).

**Notes:** Run lamarr-euro-2026-10-22 (European archives pass for the turning-point rooms). Collotype postcard of the graves of honour section of the Zentralfriedhof (Vienna Central Cemetery), around 1905; holder statement 'CC0' with the reuse note 'You can download and reuse ... this image under the condition of CC0'. Chapter 10 (death and legacy); LAM-F-0038 (buried in a tomb of honor at the Vienna Central Cemetery) is single-source, so the room is a lead until it is corroborated. Her grave (2014) is not in the picture.

### LAM-M-0030 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** The busy Graben, Vienna, Austria. (image) <https://www.loc.gov/item/2019632509/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2019632509/>

**Credit:** Library of Congress Prints and Photographs Division (stereograph)

**Alt text** (published as the image description): The busy Graben, Vienna, Austria; stereograph, \[1902\].

**Sources:** LAM-S-0061

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): LAM-F-0064

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015550-e3df, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0061 unreachable (https://www.loc.gov/item/2019632509/)

**Checker's reasoning:** The snapshot supports the Vienna location, \[1902\] date, stereograph format, repository credit, and exact rights wording qualifying under the approved rule; no problem found. Live verification failed through both web access and shell, and search did not recover the record.

**Notes:** LoC pass lamarr-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 1 (born in Vienna, 1914, LAM-F-0064). A Vienna street twelve years before her birth; no address on file. 1024x532 service JPEG. Other Vienna views 1898-1929 in the same search (2019631727 Rathhaus 1929, 2001705747 trolley cars 1923). Largest file listed: 1024x532 https://tile.loc.gov/storage-services/service/pnp/stereo/1s10000/1s17000/1s17200/1s17205v.jpg.

### LAM-M-0031 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Hedy Lamarr a Citizen (Evening star (Washington, D.C.), 1953-04-10, p. 6) (image) <https://www.loc.gov/resource/sn83045462/1953-04-10/ed-1/?sp=6>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1953-04-10/ed-1/?sp=6>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1953-04-10

**Alt text** (published as the image description): Evening star, April 10, 1953, p. 6: Hedy Lamarr a Citizen (LAM-F-0065, LAM-F-0064).

**Sources:** LAM-S-0063

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0063 unreachable (https://www.loc.gov/resource/sn83045462/1953-04-10/ed-1/?sp=6)

**Checker's reasoning:** The 1953 page is less than 95 years old, and the Library of Congress warns that such newspapers may contain copyrighted third-party material; its statement does not establish this page as public domain.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-001, 2026-10-29). Chapter: lamarr/birth. Shows: The item headed "Hedy Lamarr a Citizen" in its column; OCR: "Hedwig Eva Maria Kiesler, better known as Hedy Lamarr, actress, gets her American citizenship today. Miss Lamarr, 38, who came here in 1937 from her native Vienna" Holder date: 1953-04-10. Resolution: crop region 700,4100,1900,1500 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_carmen\_ver01:data:sn83045462:00280606145:1953041001:0642/700,4100,1900,1500/full/0/default.jpg). Preview previews/lam-birth-evestar-1953-04-10-p6.jpg sha256 89510017b7a1b1ebc2aefc2bdd7a259c1e5c162112d556f91966e1c5a64c0c5d. Supports facts: LAM-F-0065, LAM-F-0064. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. A 1953 item; placed in birth because it gives her birth name and native Vienna (no PD record from 1914 was found). Could move to legacy. Page snapshot snapshots/loc-sn83045462\_1953-04-10\_ed-1\_sp\_6.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0032 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Ecstatic (The Bismarck tribune (Bismarck, N.D.), 1937-10-04, p. 1) (image) <https://www.loc.gov/resource/sn85042243/1937-10-04/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn85042243/1937-10-04/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; The Bismarck tribune (Bismarck, N.D.), 1937-10-04

**Alt text** (published as the image description): The Bismarck tribune, October 4, 1937, p. 1: Ecstatic; Austrian Hedy Kiesler is here in person, as New York saw her (LAM-F-0100).

**Sources:** LAM-S-0064

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0064 unreachable (https://www.loc.gov/resource/sn85042243/1937-10-04/ed-1/?sp=1)

**Checker's reasoning:** The 1937 newspaper falls within the rights statement’s warning that issues less than 95 years old may contain copyrighted third-party material, so the public-domain classification is not established. The live item page could not be loaded.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-002, 2026-10-29). Chapter: lamarr/arriving. Shows: The item headed "Ecstatic" in its column; OCR: "Now Miss Kiesler is here in person (above as New York saw her)" Holder date: 1937-10-04. Resolution: crop region 2900,1700,2268,2700 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:ndhi:batch\_ndhi\_jemhadar\_ver01:data:sn85042243:00383346162:1937100401:0290/2900,1700,2268,2700/2000,/0/default.jpg). Preview previews/lam-arriving-bismarck-1937-10-04-p1.jpg sha256 430a50b48a1917be23edf52e2a53a96864f7f0f8d7c2d0c6be03899eb34ee557. Supports facts: LAM-F-0100. Rights basis: Owner ruling 2026-10-27: LoC Chronicling America 1933-1939 pages may display under LoC's statement. Same NEA picture and caption as the Waterbury Democrat page behind LAM-F-0100 (also printed in the Hendersonville times-news, same day). Photo agency picture on a CA page: covered by the page ruling only. Page snapshot snapshots/loc-sn85042243\_1937-10-04\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-27 (1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement): the adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0033 (disputed)

- [ ] reject
- [ ] note: 

**Item:** LaMarr Now (The Washington times (Washington \[D.C.\]), 1937-10-06, p. 7) (image) <https://www.loc.gov/resource/sn84026749/1937-10-06/ed-1/?sp=7>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn84026749/1937-10-06/ed-1/?sp=7>

**Credit:** Library of Congress, Chronicling America; The Washington times (Washington \[D.C.\]), 1937-10-06

**Alt text** (published as the image description): The Washington times, October 6, 1937, p. 7: LaMarr Now (LAM-F-0020).

**Sources:** LAM-S-0065

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0065 unreachable (https://www.loc.gov/resource/sn84026749/1937-10-06/ed-1/?sp=7)

**Checker's reasoning:** The 1937 newspaper is less than 95 years old, and the Library of Congress statement warns that such issues may contain copyrighted third-party material. Its wording does not establish a public-domain license for this image.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-003, 2026-10-29). Chapter: lamarr/arriving. Shows: The item headed "LaMarr Now" in its column; OCR: "HEDY KEISLER, European actress who created a sensation by appearing nude in the motion picture "Ecstasy," has changed her name in Hollywood. Henceforth she is to be known as Hedy LaMarr." Holder date: 1937-10-06. Resolution: crop region 900,100,1900,2000 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_hawthorne\_ver01:data:sn84026749:00205698231:1937100601:0287/900,100,1900,2000/full/0/default.jpg). Preview previews/lam-arriving-washtimes-1937-10-06-p7.jpg sha256 b7427b0906b80a86e449469541c7c5e2cca30dfdec75dd24af5de71dd4552423. Supports facts: LAM-F-0020. Rights basis: Owner ruling 2026-10-27: LoC Chronicling America 1933-1939 pages may display under LoC's statement. Caption spells 'Keisler'. Name change is single-source here: no new fact staged; narration may only use LAM-F-0020. Page snapshot snapshots/loc-sn84026749\_1937-10-06\_ed-1\_sp\_7.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-27 (1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement): the adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0034 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Enchanting Hedy Lamarr (Evening star (Washington, D.C.), 1940-08-15, p. 6) (image) <https://www.loc.gov/resource/sn83045462/1940-08-15/ed-1/?sp=6>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1940-08-15/ed-1/?sp=6>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1940-08-15

**Alt text** (published as the image description): Evening star, August 15, 1940, p. 6: Enchanting Hedy Lamarr, soon to appear in M-G-M's feature Boom Town (LAM-F-0044).

**Sources:** LAM-S-0066

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0066 unreachable (https://www.loc.gov/resource/sn83045462/1940-08-15/ed-1/?sp=6)

**Checker's reasoning:** The 1940 newspaper falls under the Library of Congress statement for papers less than 95 years old, which warns that they may contain copyrighted third-party material. That qualified statement does not establish the page's public-domain classification.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-004, 2026-10-29). Chapter: lamarr/first-work. Shows: The item headed "Enchanting Hedy Lamarr" in its column; OCR: "Enchanting Hedy Lamarr, soon to appear at Loew's Palace in M-G-M's feature, "Boom Town."" Holder date: 1940-08-15. Resolution: crop region 1300,1500,2400,2600 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_1rothko\_ver02:data:sn83045462:00280602991:1940081501:0120/1300,1500,2400,2600/2000,/0/default.jpg). Preview previews/lam-firstwork-evestar-1940-08-15-p6.jpg sha256 f0cf2f300b56463bde9eda37d3f0cc327e6a46590ab91426ac047999a7d96ae4. Supports facts: LAM-F-0044. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. It is an advertisement (Ross jewellers); label it so. Page snapshot snapshots/loc-sn83045462\_1940-08-15\_ed-1\_sp\_6.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0035 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Boom Town (The Waterbury Democrat (Waterbury, Conn.), 1940-08-30, p. 15) (image) <https://www.loc.gov/resource/sn82014085/1940-08-30/ed-1/?sp=15>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn82014085/1940-08-30/ed-1/?sp=15>

**Credit:** Library of Congress, Chronicling America; The Waterbury Democrat (Waterbury, Conn.), 1940-08-30

**Alt text** (published as the image description): The Waterbury Democrat, August 30, 1940, p. 15: Boom Town (LAM-F-0044).

**Sources:** LAM-S-0067

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0067 unreachable (https://www.loc.gov/resource/sn82014085/1940-08-30/ed-1/?sp=15)

**Checker's reasoning:** The 1940 newspaper is less than 95 years old. The Library of Congress says such issues may contain copyrighted third-party material, so its statement does not establish that this page is public domain.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-005, 2026-10-29). Chapter: lamarr/first-work. Shows: The item headed "Boom Town (theatre feature and advertisement)" in its column; OCR: "With Clark Gable, Spencer Tracy, Claudette Colbert and Hedy Lamarr in stellar roles, "Boom Town"" Holder date: 1940-08-30. Resolution: crop region 2900,2700,2350,3300 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:ct:batch\_ct\_hepburn\_ver01:data:sn82014085:00393347624:1940083001:0918/2900,2700,2350,3300/2000,/0/default.jpg). Preview previews/lam-firstwork-waterbury-1940-08-30-p15.jpg sha256 f927a5fd278dc098e82fbb6f88222ccf3e577ef231445755fc96a42283497666. Supports facts: LAM-F-0044. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. Page snapshot snapshots/loc-sn82014085\_1940-08-30\_ed-1\_sp\_15.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0036 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Patent 2,292,387, Secret Communication System, patented Aug. 11, 1942 (image) <https://patents.google.com/patent/US2292387A/en>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Pursuant to federal law, most government-produced materials appearing on this website are not subject to copyright restrictions within the United States and are therefore in the public domain." <https://www.uspto.gov/terms-use-uspto-websites>

**Credit:** United States Patent and Trademark Office, Patent 2,292,387

**Alt text** (published as the image description): U.S. Patent 2,292,387, Secret Communication System, patented Aug. 11, 1942 (LAM-F-0090, LAM-F-0097).

**Sources:** LAM-S-0002, LAM-S-0068

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source no; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0002 not found (https://patents.google.com/patent/US2292387A/en); LAM-S-0068 found (https://www.uspto.gov/terms-use-uspto-websites)

**Checker's reasoning:** The rights statement is absent from the live Google Patents item page. USPTO’s statement covers most government-produced material on its own website and does not establish that this privately invented patent image is public domain.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G10: LAM-S-0002: adversary did not find the quote in the live source (not found)

**Notes:** Round 9 records (research R9-M-LAM-006, 2026-10-29). Chapter: lamarr/honoured. Shows: Printed patent sheet 1 (drawings) with the patent number and date. Holder date: 1942-08-11. Resolution: PDF page rendered at 100 dpi. Preview previews/lam-honoured-US2292387-p1.jpg sha256 265d3721c82b7724263e761ecdcea4a4ffc44a9a780114607c24f3474ce3400d. Supports facts: LAM-F-0040, LAM-F-0090, LAM-F-0097, LAM-F-0084. Rights basis: Federal work (patent printed by the USPTO); USPTO statement. Placed in honoured (0 records; the 2014 induction honours this invention, LAM-F-0006/LAM-F-0040). Different from LAM-M-0001 (NARA case file). Could move to big-work instead. title corrected on 2026-10-30 (the item page does not number the sheet; the adversary refuted the added words); was: Patent 2,292,387, Secret Communication System, patented Aug. 11, 1942 (printed patent, sheet 1) alt\_text narrowed on 2026-10-30 to the holder's own words (the adversary found the earlier wording said more than the snapshots show); was: First drawing sheet of U.S. Patent 2,292,387, Secret Communication System, patented Aug. 11, 1942 (LAM-F-0090, LAM-F-0097).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: US federal publications (GPO/govinfo, USPTO patents, NARA press releases) may display. The adversary refuted the record because the public-domain statement is the publisher's site-wide notice (17 U.S.C. 105 on govinfo; the USPTO terms of use), not a line on the item page; the ruling covers exactly that question.

### LAM-M-0037 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Stars' bond drive (The East Hartford gazette (East Hartford, Conn.), 1942-09-04, p. 1) (image) <https://www.loc.gov/resource/sn85009852/1942-09-04/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn85009852/1942-09-04/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; The East Hartford gazette (East Hartford, Conn.), 1942-09-04

**Alt text** (published as the image description): The East Hartford gazette, September 4, 1942, p. 1: the stars' bond drive; Hedy Lamarr was in the group (LAM-F-0061).

**Sources:** LAM-S-0069

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0069 unreachable (https://www.loc.gov/resource/sn85009852/1942-09-04/ed-1/?sp=1)

**Checker's reasoning:** The Library of Congress says this 1942 newspaper is believed to be in the public domain but may contain copyrighted third-party material. That wording does not establish the record’s public-domain classification.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-007, 2026-10-29). Chapter: lamarr/history. Shows: The item headed "Stars' bond drive" in its column; OCR: "In the group were Hedy Lamarr, Irene Dunne, Ann Rutherford, Greer Garson" Holder date: 1942-09-04. Resolution: crop region 3300,5000,1865,2400 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:ct:batch\_ct\_carpsurprise\_ver01:data:sn85009852:00517174749:1942090401:0403/3300,5000,1865,2400/full/0/default.jpg). Preview previews/lam-history-ehartford-1942-09-04-p1.jpg sha256 45ddbe95b0af6ba2973a7f104cefeb0984665649e94c508c8e65c77052fb1997. Supports facts: LAM-F-0061. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. Title descriptive (headline not in OCR). Page snapshot snapshots/loc-sn85009852\_1942-09-04\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0038 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Stars at war plants (The Waterbury Democrat (Waterbury, Conn.), 1942-09-16, p. 5) (image) <https://www.loc.gov/resource/sn82014085/1942-09-16/ed-1/?sp=5>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn82014085/1942-09-16/ed-1/?sp=5>

**Credit:** Library of Congress, Chronicling America; The Waterbury Democrat (Waterbury, Conn.), 1942-09-16

**Alt text** (published as the image description): The Waterbury Democrat, September 16, 1942, p. 5: Hedy Lamarr on the bond selling tour of the motion picture stars (LAM-F-0109, LAM-F-0061).

**Sources:** LAM-S-0070

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0070 unreachable (https://www.loc.gov/resource/sn82014085/1942-09-16/ed-1/?sp=5)

**Checker's reasoning:** For this 1942 newspaper, the Library of Congress says it may contain copyrighted third-party material; its wording does not establish the public-domain classification, and the approved rights rule does not cover this advisory. The live item could not be loaded.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-008, 2026-10-29). Chapter: lamarr/history. Shows: The item headed "Stars at war plants (bond tour)" in its column; OCR: "After Hedy Lamarr's visits to the Johnson and Johnson plant in Elizabeth, N. J., one hundred per cent enrollment for the bond savings plan was announced." Holder date: 1942-09-16. Resolution: crop region 900,3800,1900,2400 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:ct:batch\_ct\_ives\_ver02:data:sn82014085:00393347119:1942091601:0206/900,3800,1900,2400/full/0/default.jpg). Preview previews/lam-history-waterbury-1942-09-16-p5.jpg sha256 7dabe491c89cb5020bebd3d85b6b57e46a7598cabf635994dac5a02f0b1a5fce. Supports facts: LAM-F-0061, LAM-F-0109. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. Title descriptive. Page snapshot snapshots/loc-sn82014085\_1942-09-16\_ed-1\_sp\_5.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0039 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Drama-Laden Rite Makes American Of Hedy Lamarr (Evening star (Washington, D.C.), 1953-04-11, p. 5) (image) <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1953-04-11

**Alt text** (published as the image description): Evening star, April 11, 1953, p. 5: Drama-Laden Rite Makes American Of Hedy Lamarr.

**Sources:** LAM-S-0071

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0071 unreachable (https://www.loc.gov/resource/sn83045462/1953-04-11/ed-1/?sp=5)

**Checker's reasoning:** The 1953 newspaper page falls within the Library of Congress advisory’s warning that third-party material may be copyrighted. That advisory does not establish a public-domain classification for this page.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-LAM-009, 2026-10-29). Chapter: lamarr/legacy. Shows: The item headed "Drama-Laden Rite Makes American Of Hedy Lamarr" in its column; OCR: "Actress Hedy Lamarr has taken the oath as a United States citizen along with 40 other aliens" Holder date: 1953-04-11. Resolution: crop region 2800,700,2000,3000 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_dongiovanni\_ver01:data:sn83045462:00280606157:1953041101:0005/2800,700,2000,3000/full/0/default.jpg). Preview previews/lam-legacy-evestar-1953-04-11-p5.jpg sha256 81cf7e7b8b3103b31ae4d8647d2b80b94ffc918cee7a5c199d4301dca60cb6ee. Supports facts: LAM-F-0001, R9-F-003. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. The portrait is an AP Wirephoto (agency) on the page: show as part of the page only. Page snapshot snapshots/loc-sn83045462\_1953-04-11\_ed-1\_sp\_5.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0040 (pending)

- [ ] reject
- [ ] note: 

**Item:** Movie Legend Hedy Lamarr to be Given Special Award at EFF's Sixth Annual Pioneer Awards (EFF media release, 1997) (document) <https://w2.eff.org/awards/pioneer/1997.php>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "Any and all original material on the EFF website may be freely distributed at will under the Creative Commons Attribution 4.0 International License (CC-BY), unless otherwise noted" <https://www.eff.org/copyright>

**Credit:** Electronic Frontier Foundation, media release, March 1997 (CC BY 4.0)

**Alt text** (published as the image description): EFF media release, March 1997: the Electronic Frontier Foundation will honor Hedy Lamarr with a special award for her co-invention of spread-spectrum broadcast communications technologies.

**Sources:** LAM-S-0072, LAM-S-0073

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-lamarr-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** LAM-S-0072 unreachable (https://w2.eff.org/awards/pioneer/1997.php); LAM-S-0073 found (https://www.eff.org/copyright)

**Checker's reasoning:** The cited item is an EFF media release, but the record classifies it as an image and provides no image URL. The release URL could not be read live.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): eff.org: Electronic Frontier Foundation, secondary

**Why it is not verified:** G4: the record or its sources changed after the adversary judged it (judged\_sha256 no longer matches); judge the item again

**Notes:** Round 9 records (research R9-M-LAM-010, 2026-10-29). Chapter: lamarr/honoured. Shows: Text of the release (no image). Holder date: 1997-03-12. Resolution: HTML page. Preview previews/lam-honoured-eff-pioneer-1997.html sha256 c0745d8ed7aeb53fe87128cbc6fbe45cf09b30bb1b29b0ac8680d8ef387000eb. Supports facts: LAM-F-0085. Rights basis: CC BY 4.0 by EFF's site-wide policy for original material. Text-only record. Its sentence on 'spread-spectrum' is EFF's wording; narrate only LAM-F-0085. media\_type corrected on 2026-10-30 (a media release page, not an image); was: image

### LAM-M-0041 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Hedy Becomes Citizen (Atlanta daily world (Atlanta, Georgia), 1953-04-29, p. 4) (image) <https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4>

**Credit:** Library of Congress, Chronicling America; Atlanta daily world (Atlanta, Georgia), 1953-04-29

**Alt text** (published as the image description): Atlanta daily world, April 29, 1953, p. 4: the item Hedy Becomes Citizen (LAM-F-0114).

**Sources:** LAM-S-0074

**Independent checker:** codex:gpt-6-sol (run tour-2026-11-01-merge, 2026-11-02): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0074 unreachable (https://www.loc.gov/resource/sn82015425/1953-04-29/ed-1/?sp=4)

**Checker's reasoning:** The Library of Congress says this 1953 newspaper is believed to be in the public domain but may contain copyrighted material; its wording does not establish the claimed public-domain class under the approved rule. The live item page could not be loaded.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Tour-research dry run tour-2026-11-01 (enrich), work item r4. Chapter: lamarr/citizen. Rights: the holder's statement on the page record (snapshot rights\[0\]).

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-10-29 (applied to this item 2026-11-02, owner approval of the merge): Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### LAM-M-0042 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Hedy Invents Defense Device (The Washington daily news (Washington, D.C.), 1941-10-01, p. 32) (image) <https://www.loc.gov/resource/sn82016181/1941-10-01/ed-1/?sp=32>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn82016181/1941-10-01/ed-1/?sp=32>

**Credit:** Library of Congress, Chronicling America; The Washington daily news (Washington, D.C.), 1941-10-01

**Alt text** (published as the image description): The Washington daily news, October 1, 1941, p. 32: the item Hedy Invents Defense Device (LAM-F-0115).

**Sources:** LAM-S-0075

**Independent checker:** codex:gpt-6-sol (run tour-2026-11-01-merge, 2026-11-02): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** LAM-S-0075 unreachable (https://www.loc.gov/resource/sn82016181/1941-10-01/ed-1/?sp=32)

**Checker's reasoning:** The Library of Congress warns that newspapers published less than 95 years ago may contain copyrighted third-party material. Its statement does not establish public-domain status for this 1941 page under the approved rule.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Tour-research dry run tour-2026-11-01 (enrich), work item r6. Chapter: lamarr/big-work. Rights: the holder's statement on the page record (snapshot rights\[0\]).

**Review so far:** pending; note: 2026-11-02 project owner: Owner ruling 2026-10-29 (applied to this item 2026-11-02, owner approval of the merge): Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

## 8. Draft content (18 units)

Each line is one unit of drafts/profile.json or of the experience chapters (content:...) and the facts it cites. Included units are in wordpress.html; withheld ones are not, for the reason given. The final export also needs, for each sentence, title and caption, a current "supported" verdict from the sentence adversary (drafts/grounding.jsonl, G6).

- [ ] profile:summary:0: Hedy Lamarr was an inventor. (facts LAM-F-0040; included)
- [ ] profile:summary:1: In 2014 Hedy Lamarr was inducted into the National Inventors Hall of Fame. (facts LAM-F-0006; included)
- [ ] profile:sections:immigration:0: The naturalization file at the National Archives at Riverside for Hedwig Maria Stauffer contains a certificate of arrival, declaration of intention, affidavits of witnesses, and petition for naturalization. (facts LAM-F-0001; included)
- [ ] profile:sections:immigration:title: Naturalization file (facts LAM-F-0001; included)
- [ ] profile:sections:film:0: The 1940 motion picture poster for the Metro-Goldwyn-Mayer picture Boom Town shows Hedy Lamarr in scenes from the movie. (facts LAM-F-0044; included)
- [ ] profile:sections:film:1: The 1941 poster for the Metro-Goldwyn-Mayer film Ziegfeld Girl shows Hedy Lamarr. (facts LAM-F-0043; included)
- [ ] profile:sections:film:title: Film (facts LAM-F-0044, LAM-F-0043; included)
- [ ] profile:sections:invention:0: The inventors of Patent Case File No. 2,292,387, Secret Communication System, were Hedy Kiesler Markey and George Antheil. (facts LAM-F-0046; included)
- [ ] profile:sections:invention:title: Secret Communication System (facts LAM-F-0046; included)
- [ ] profile:sections:war:0: EVERYBODY JOINS U.S. WAR EFFORT \[ETC.\] (1942) has film entertainers on war bond tours, including Heddy Lamar. (facts LAM-F-0061; included)
- [ ] profile:sections:war:title: War bond tours (facts LAM-F-0061; included)
- [ ] profile:sections:radio:0: The Army Hour of March 5, 1954, has a Command Performance comedy sequence from Hollywood, California, with Milton Berle, Hedy Lamarr and Edward G. Robinson. (facts LAM-F-0062; included)
- [ ] profile:sections:radio:1: The Radio Scripts files for the broadcast Command Performance contain studio photographs of program participants, including Hedy Lamarr. (facts LAM-F-0063; included)
- [ ] profile:sections:radio:title: Command Performance (facts LAM-F-0062, LAM-F-0063; included)
- [ ] profile:timeline:0: The 1940 motion picture poster for the Metro-Goldwyn-Mayer picture Boom Town shows Hedy Lamarr in scenes from the movie. (facts LAM-F-0044; included)
- [ ] profile:timeline:1: The 1941 poster for the Metro-Goldwyn-Mayer film Ziegfeld Girl shows Hedy Lamarr. (facts LAM-F-0043; included)
- [ ] profile:timeline:2: The Army Hour of March 5, 1954, has a Command Performance comedy sequence from Hollywood, California, with Milton Berle, Hedy Lamarr and Edward G. Robinson. (facts LAM-F-0062; included)
- [ ] profile:timeline:3: In 2014 Hedy Lamarr was inducted into the National Inventors Hall of Fame. (facts LAM-F-0006; included)

## 9. Avatar lines (1)

Quote lines are the inductee's exact words. Narration in the inductee's voice is shown on the site labelled "AI recreation".

- [ ] profile:avatar_lines:0 (guide, narration): Hedy Lamarr was an inventor. (facts LAM-F-0040)

## 10. How to cite

Generated from inductee.json for the page; it states no fact about the inductee. A how_to_cite text in drafts/profile.json is not published.

Hedy Lamarr. Immigrant Hall of Honor. https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/

## 11. Gaps (17)

Parts of the life story with no verified source yet. These are not errors.

- Birth: no verified fact yet; date and place facts LAM-F-0012, LAM-F-0021, LAM-F-0064 are disputed (sources disagree on the year, and live checks of browser-fetched sources failed)
- Family: no verified fact yet; parents, marriages and children are only deferred candidates in staging, none corroborated
- Education: no verified source yet; the IHH page education claim and other schooling candidates are deferred, single-source
- Arrival in the United States: no verified source yet; LAM-F-0024, LAM-F-0027, LAM-F-0028, LAM-F-0049, LAM-F-0069 are single-source and LAM-F-0026 is disputed
- Immigration section rests on LAM-F-0067 and LAM-F-0001 only; the naturalization file LAM-S-0001 is described but its certificate of arrival contents are not yet read
- Citizenship: no verified fact yet; LAM-F-0016 is disputed (live check of a browser-fetched source failed)
- Career: early European career (stage, first films, Ecstasy) rests on single-source facts LAM-F-0047, LAM-F-0048, LAM-F-0066; LAM-F-0082 was refuted on the live check
- Main work (invention): patent dates verified as LAM-F-0090 and LAM-F-0091 (LAM-F-0002 rejected as superseded); LAM-F-0029, LAM-F-0039, LAM-F-0056 single-source
- War work: section rests on one fact, LAM-F-0061; LAM-F-0059 (USO) and LAM-F-0052 are single-source
- Awards: LAM-F-0005 (Bulbie Gnass award) and LAM-F-0019 (Hollywood Walk of Fame) are single-source by holder count
- Death: section rests on one fact, LAM-F-0023; date and place LAM-F-0013, LAM-F-0022 disputed, LAM-F-0004, LAM-F-0018 single-source; burial facts LAM-F-0035 to LAM-F-0038 single-source
- Legacy: no verified fact yet; every legacy candidate (wireless technology, Navy adoption, estate, memorial) is deferred and single-source
- IHH page claims not independently confirmed: birth date and place, death date and place, arrival 1937 in Hollywood, education 1929, citizenship 1953, more than 30 films, Wi-Fi and Bluetooth legacy, first woman to win the Bulbie award, Walk of Fame 1960
- Media: no usable licence for LAM-M-0001 to LAM-M-0010 and LAM-M-0018 (licence class unknown) and LAM-M-0011, LAM-M-0012, LAM-M-0016, LAM-M-0017 (rights-restricted); LAM-M-0019 to LAM-M-0021 rejected for no rights statement; only LAM-M-0013 to LAM-M-0015 are cc-by
- Names: aliases 'Kiesler, Hedwig' and 'Lamarr, Hedy' have no snapshot evidence because the id.loc.gov authority record fetch failed
- Searches that found nothing: Smithsonian site searches (11 of 18), Library of Congress (8 of 32, including id.loc.gov and finding aids), media photo searches (7 of 22), 13 corroboration searches
- Deferred over the fact cap: 113 candidates in staging/deferred-lamarr-2026-10-09, including all family, education and legacy candidates

## 12. Rejected (6)

Kept in the log for the record; no action needed.

- LAM-F-0002: Patent US2292387A was filed on June 10, 1941 and granted on August 11, 1942.
- LAM-F-0101: Miss Hedy Lamarr by marriage became Mrs. Hedwig Loder and is a British subject.
- LAM-F-0111: In April 1953 Hedy Lamarr took the oath as a United States citizen in Los Angeles.
- LAM-M-0019: Hedy Kiesler 1933
- LAM-M-0020: Grave of Hedy Lamarr, Vienna Central Cemetery
- LAM-M-0021: Pronunciation of "Hedy Lamarr" in Austrian German
