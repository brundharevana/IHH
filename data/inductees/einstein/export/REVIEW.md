# Review checklist: Albert Einstein (einstein)

Generated 2026-11-02 by tools/export.py (preview export).

This is a preview. Every block of wordpress.html is stamped "DRAFT — NOT REVIEWED"; do not publish it.

Facts: conflicting 2, disputed 5, rejected 11, single-source 69, verified 71. Media: disputed 25, rejected 1, verified 67.

How to use this checklist: for each item, open the source link and find the quote, then tick one box (for an edit, write the new wording). Return the file to the maintainer, who records the decisions in review/decisions.jsonl and runs tools/apply_review.py. Approval does not override the checks: only verified items can be approved and published. Disputed, conflicting and single-source items can be edited (then checked again), rejected, or given a note.

## 1. Disputed: the independent checker did not agree (5)

### EIN-F-0048 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein was a German-born physicist.

**About:** category career

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "In 1936, German-born physicist Albert Einstein filed this Declaration of Intention to become an American citizen." (summary\[0\]) <https://www.loc.gov/item/2021667583/>
- EIN-S-0060, DocsTeach (National Archives Foundation) (institutional): "In 1936, German-born physicist Albert Einstein filed this Declaration of Intention to become an American citizen." (document description) <https://docsteach.org/document/declaration-intention-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict unclear; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic no; source type right yes.

**Live check per source:** EIN-S-0012 found (https://www.loc.gov/item/2021667583/); EIN-S-0060 found (https://docsteach.org/document/declaration-intention-einstein/)

**Checker's reasoning:** The claim combines two attributes: German birth and occupation as a physicist.

**Why it is not verified:** G4: adversary verdict is unclear; G4: adversary did not find the claim atomic (G3)

**Notes:** LoC summary describes him as German-born physicist. Recategorized identity -\> career by the critic (run einstein-2026-10-09): a statement about his work, not a name; the adversary verdict is stale and is judged again. Corroborated 2026-10-10 (einstein-recover) by DocsTeach EIN-S-0060, whose caption is word for word the LoC caption (likely a shared NARA origin).

### EIN-F-0104 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1921, on April 25, Albert Einstein and Warren Harding were with a group at the White House, Washington, D.C.

**About:** category other, date 1921, place White House, Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0021, Library of Congress (primary): "item.title: \[Albert Einstein, Warren Harding and group at White House, Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885955/>
- EIN-S-0077, Library of Congress (primary): "cite\_this.chicago: Harding, Prof. Einstein & wife, 4/25/21. , 1921. \[April 25\] Photograph." (cite\_this.chicago) <https://www.loc.gov/item/2016830269/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165845-1910, 2026-10-10): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right yes.

**Checker's reasoning:** The quoted evidence states one White House group photograph and a separate Harding/Einstein/wife photograph dated April 25, 1921, but it does not state that the White House group photograph occurred on April 25. The claim combines the date from the second record with the place/group from the first, adding information not directly stated by the quotes.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Journey pin fact for the Washington room built only from LoC photograph records (no manual newspaper snapshot). The White House and the group come from the Harris & Ewing record (dated \[between 1921 and 1923\]); the day comes from the National Photo Company negative of Harding and Einstein, which LoC dates 4/25/21 and cites as '1921. \[April 25\]'. That the two negatives show the same occasion is an inference for the adversary and reviewer to judge; the Evening Star of April 25, 1921 (EIN-F-0090) reports the White House reception that day. event\_date is 1921 because the gate cannot assemble the day from LoC's '1921. \[April 25\]'; the claim text carries the day.

### EIN-F-0119 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein was photographed in Washington, D.C., by Harris & Ewing.

**About:** category other, place Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0020, Library of Congress (primary): "item.title: \[Albert Einstein, Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885961/>
- EIN-S-0020, Library of Congress (primary): "cite\_this.chicago: Harris & Ewing, photographer. Albert Einstein, Washington, D.C. United States Washington D.C. District of Columbia Washington D.C,. Photograph." (cite\_this.chicago) <https://www.loc.gov/item/2016885961/>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184453-1531, 2026-10-10): verdict refuted; quote in snapshot yes; found in the live source no; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** The snapshot contains both quoted passages, but the live LoC JSON's Chicago citation has changed: it includes cite markup and a different place-order/punctuation, so the quoted passage is not present live as given.

**Why it is not verified:** G4: adversary verdict is refuted; G10: adversary did not find the quote in the live source

**Notes:** LoC record EIN-S-0020 (Washington, D.C. 1921 room). LoC devised the title; the location is based on related, adjacent negatives.

### EIN-F-0141 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein's brier pipe has an overall material of wood and overall measurements of 15.8 cm x 3.6 cm.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0108, Smithsonian Institution (institutional): "Einstein's Brier Pipe" (page title) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "wood (overall material)" (Physical Description) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "Measurements overall: 15.8 cm x 3.6 cm" (Physical Specifications) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict unclear; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic no; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905?form=FUNPYRYGFFP)

**Checker's reasoning:** The snapshot and Smithsonian record returned by web search contain all quoted passages. The claim combines two independent attributes, material and measurements, so it fails the atomicity requirement.

**Why it is not verified:** G4: adversary verdict is unclear; G4: adversary did not find the claim atomic (G3)

**Notes:** Dimensions and material for a labelled 3D recreation.

### EIN-F-0152 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein, Old Grove Rd., Nassau Point, Peconic, Long Island, August 2nd, 1939, to F.D. Roosevelt, President of the United States.

**About:** category other, date 1939-08-02, place Old Grove Rd., Nassau Point, Peconic, Long Island

**Evidence** (open the link and find the quote):

- EIN-S-0126, U.S. National Archives and Records Administration (primary): "Albert Einstein Old Grove Rd. Nassau Point Peconic, Long Island August 2nd, 1939 F.D. Roosevelt, President of the United States," (PDF psfa0064.pdf page 2, letter heading (manual transcription checked against the page image)) <https://catalog.archives.gov/medialive/74/6088/16608874/content/arcmedia/presidential-libraries/roosevelt/psf/psfa0064.pdf>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T170517-0525, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0126 unreachable (https://catalog.archives.gov/medialive/74/6088/16608874/content/arcmedia/presidential-libraries/roosevelt/psf/psfa0064.pdf)

**Checker's reasoning:** The snapshot contains the complete quoted heading and supports the sender, address, date, and recipient. The live PDF could not be loaded through the web tool or shell, so its contents remain unverified.

**Why it is not verified:** G10: EIN-S-0126: snapshot supplied by manual; the adversary must find the quote live (result is 'unreachable')

**Notes:** Ratio-lift RL-F-002. The letter's own heading, restated in its words (the record never says "letter" or "wrote", so the claim keeps the heading's form). Same heading as EIN-F-0136 (single-source, from EIN-S-0069), here from the NARA original. Places the letter's address, not Einstein's whereabouts. Chapter einstein/history (Nassau Point).

**Review so far:** pending; note: 2026-10-24 project owner: Owner live-check 2026-10-24: opened NARA NAID 16608874 (https://catalog.archives.gov/id/16608874) in a browser and it loads.

## 2. Conflicting: sources disagree (2)

### EIN-F-0106 (conflicting)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1936 Albert Einstein purchased 112 Mercer Street.

**About:** category other, date 1936, place 112 Mercer Street, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0091, National Park Service (primary): "The Albert Einstein House in Princeton, New Jersey, is a simple two story" (Section 7, Description, first paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "In 1936 he purchased 112 Mercer Street." (Section 7, Description, fourth paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0057, National Park Service (institutional): "The Albert Einstein House in Princeton, New Jersey" (paragraph describing the house) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0057, National Park Service (institutional): "In 1936 he purchased 112 Mercer Street." (paragraph describing the house) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** conflicting is kept (set by a person or the merge step)

**Notes:** Split from EIN-F-0087 (home study at 112 Mercer Street) so the journey map's Princeton pin rests on an atomic fact that the NHL nomination form (primary, NPS) states on its own; the NPS article repeats the nomination's wording (same holder). Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): no primary record of the purchase was found (see EIN-F-0129); the NHL form (1975) is the nomination's statement, not a record of the time. Per the rule the year should not be shown on the site: content/einstein/journey.json (mercer-street) and quiz.json (mercer) still cite this fact and need a person's decision; status left as computed. Owner decision 2026-10-18: purchase year not shown on the site (1935 vs 1936 unresolved without Mercer County Deed 2663); status set conflicting by a person; journey stop and quiz question no longer cite it.

### EIN-F-0129 (conflicting)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein purchased 112 Mercer Street in 1935.

**About:** category other, date 1935, place 112 Mercer Street, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0093, Institute for Advanced Study (institutional): "112 Mercer Street in Princeton, New Jersey, served as the residence of the renowned physicist Albert Einstein from 1935 until his death in 1955." (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "Einstein purchased the home in 1935" (paragraph 2) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** no verdict yet.

**Why it is not verified:** conflicting is kept (set by a person or the merge step)

**Notes:** CONFLICT for owner decision: IAS (this source, owner of the house since 1986) says purchased 1935 and residence from 1935; the NHL nomination form (EIN-S-0091, primary) and NPS article (EIN-S-0057) say 'In 1936 he purchased 112 Mercer Street' (EIN-F-0106, verified). Not resolved by this run. The same IAS page also says the house was built in 1838 on Alexander Street and moved in the 1870s, while the NHL form says builder and date unknown, probably 1870s or 1880s (not staged). Ruling 2026-10-17 (owner rule: a primary record decides; CONFLICTS.md): no primary record was found after a hard search (Chronicling America 1935-1936, Daily Princetonian archive behind a bot check, archive.org, Mercer County land records behind registration). Lead: Mercer County Clerk Deed 2663 (recorded 1 or 2 August 1935; buyer named as Elsa Einstein, seller Mary Clark Marden), cited by a Wikipedia article, not read. Per the rule the purchase year is not to be shown on the site until the deed is read; the conflict stays here.

## 3. Single-source: needs a second independent source (69)

### EIN-F-0004 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein immigrated to Princeton, N.J., in 1932.

**About:** category immigration, date 1932, place Princeton, N.J.

**Evidence** (open the link and find the quote):

- EIN-S-0002, Immigrant Hall of Honor (secondary): "Albert Einstein immigrated to Princeton, N.J., in 1932." (BIOGRAPHY section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Place & Date of Immigration: Princeton, New Jersey in 1932" (ALBERT EINSTEIN (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** Single-source secondary claim from IHH's current page. Suspected error on IHH page: same vague immigration statement as the fact list: a residence town rather than a port of entry, year only; needs a primary arrival record. Merge 2026-10-09: combined with duplicate candidates tmp-baseline-F-5 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0007 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** After the Nazis seized power in Germany, Albert Einstein immigrated to the US.

**About:** category immigration

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "After the Nazis seized power in Germany, Einstein immigrated to the US, where he worked at the Institute for Advanced Study in Princeton, New Jersey." (Life, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein grew up in Munich" (Life, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0057, National Park Service (institutional): "When the German National Socialist Workers Party under Adolf Hitler came to power, with its anti-Semitic rhetoric and disregard for democratic principles, Einstein emigrated to the United States (which he had first visited in 1921) to accept a position at Princeton’s Institute for Advanced Studies." (Article body, paragraph beginning 'In 1921, the Nobel Prize in Physics was awarded' (snapshot line 42)) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T025822-2c28, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0057 lacks name 'After' not in its quotes; name 'Nazis' not in its quotes; word 'seized' not in its quotes; name 'Germany' not in its quotes ...

**Notes:** Nobel page gives no date or port; IHH lead 'Princeton, New Jersey in 1932' not confirmed by this page. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-40 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0008 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In the US, Albert Einstein worked at the Institute for Advanced Study in Princeton, New Jersey.

**About:** category career, place Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "After the Nazis seized power in Germany, Einstein immigrated to the US, where he worked at the Institute for Advanced Study in Princeton, New Jersey." (Life, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein grew up in Munich" (Life, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "\* Albert Einstein was formally associated with the Institute for Advanced Study located in Princeton, New Jersey." (Biographical, footnote) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was formally associated with the Institute for Advanced Study located in Princeton, New Jersey." (Biographical, footnote) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0013, Library of Congress (institutional): "With the rise of Adolf Hitler and Nazism, Einstein left Germany in 1932 to move to America where he took part in the Institute for Advanced Studies of Princeton." (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "Herb Block pays tribute to scientist Albert Einstein" (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "he took part in the Institute for Advanced Studies of Princeton" (item.notes\[0\] (exhibit caption label)) <https://www.loc.gov/item/00652204/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0004 lacks name 'US' not in its quotes; word 'worked' not in its quotes \| EIN-S-0013 lacks name 'US' not in its quotes; word 'worked' not in its quotes; name 'New' not in its quotes; name 'Jersey' not in its quotes ...

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-44, tmp-domain-F-58, tmp-institutional-F-14, tmp-loc-F-11, tmp-media-F-5 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0009 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In one of several epoch-making studies beginning in 1905, Albert Einstein explained that light consists of quanta.

**About:** category work, date 1905

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "In one of several epoch-making studies beginning in 1905, Albert Einstein explained that light consists of quanta" (Work, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "In one of several epoch-making studies beginning in 1905, Albert Einstein explained that light consists of quanta—packets with fixed energies corresponding to certain frequencies." (Facts, Work) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-41 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0010 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1901 Albert Einstein acquired Swiss citizenship.

**About:** category citizenship, date 1901

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "In 1901, the year he gained his diploma, he acquired Swiss citizenship" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0059, American Institute of Physics (secondary): "1901 Becomes Swiss citizen." (An Albert Einstein Chronology, entry 1901 (snapshot line 16)) <https://history.aip.org/exhibits/einstein/chron.htm>
- EIN-S-0009, The Franklin Institute (secondary): "In 1901, he gained his degree and acquired Swiss citizenship." (laureate biography, paragraph 1) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0059 lacks word 'acquired' not in its quotes; word 'citizenship' not in its quotes

**Notes:** Merge 2026-10-09: also carries evidence from compound candidate tmp-institutional-F-5 ("In 1901, the year Albert Einstein gained his diploma, he acquired Swiss citizenship."), split into atomic parts. Corroborated 2026-10-10 (einstein-recover) by the Franklin Institute laureate text EIN-S-0009; caution: that text closely follows the Nobel biography.

### EIN-F-0011 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1901, unable to find a teaching post, Albert Einstein accepted a position as technical assistant in the Swiss Patent Office.

**About:** category career, date 1901

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "In 1901, the year he gained his diploma, he acquired Swiss citizenship and, as he was unable to find a teaching post, he accepted a position as technical assistant in the Swiss Patent Office." (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "he accepted a position as technical assistant in the Swiss Patent Office" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "he accepted a position as technical assistant in the Swiss Patent Office" (paragraph 1) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0009 lacks year 1901 not in its quotes; word 'unable' not in its quotes; word 'find' not in its quotes; word 'teaching' not in its quotes ...

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-6 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0012 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1908 Albert Einstein was appointed Privatdozent in Berne.

**About:** category career, date 1908, place Berne

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "in 1908 he was appointed Privatdozent in Berne" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "In 1908 he was appointed Privatdozent in Berne" (paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin)

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-8 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0013 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein became a German citizen in 1914.

**About:** category citizenship, date 1914

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He became a German citizen in 1914" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "He became a German citizen in 1914" (paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin)

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-12 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0014 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1933 Albert Einstein renounced his German citizenship for political reasons.

**About:** category citizenship, date 1933

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He became a German citizen in 1914 and remained in Berlin until 1933 when he renounced his citizenship for political reasons" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "remained in Berlin until 1933 when he renounced his citizenship for political reasons" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "remained in Berlin until 1933 when he renounced his citizenship for political reasons" (paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>
- EIN-S-0012, Library of Congress (institutional): "Following the Nazi takeover of political power in Germany in 1933 and the onset of persecution of the German Jews, Einstein renounced his German citizenship and immigrated to the United States to take the position of Professor of Theoretical Physics at Princeton." (summary\[0\]) <https://www.loc.gov/item/2021667583/>
- EIN-S-0009, The Franklin Institute (secondary): "He became a German citizen in 1914 and remained in Berlin until 1933 when he renounced his citizenship for political reasons" (laureate biography, paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0012 lacks word 'reasons' not in its quotes

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-13, tmp-loc-F-8 (same claim staged by several families); every supporting quote kept verbatim. Corroborated 2026-10-10 (einstein-recover) by the Franklin Institute laureate text EIN-S-0009; caution: that text closely follows the Nobel biography.

### EIN-F-0015 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1933 Albert Einstein emigrated to America to take the position of Professor of Theoretical Physics at Princeton.

**About:** category immigration, date 1933, place Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "remained in Berlin until 1933 when he renounced his citizenship for political reasons and emigrated to America to take the position of Professor of Theoretical Physics at Princeton" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "remained in Berlin until 1933 when he renounced his citizenship for political reasons and emigrated to America to take the position of Professor of Theoretical Physics at Princeton" (paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>
- EIN-S-0012, Library of Congress (institutional): "Following the Nazi takeover of political power in Germany in 1933 and the onset of persecution of the German Jews, Einstein renounced his German citizenship and immigrated to the United States to take the position of Professor of Theoretical Physics at Princeton." (summary\[0\]) <https://www.loc.gov/item/2021667583/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0012 lacks word 'emigrated' not in its quotes; name 'America' not in its quotes

**Notes:** Contradicts the IHH immigration year 1932: this page gives 1933. No port or arrival date here. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-42, tmp-loc-F-6 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0016 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein became a United States citizen in 1940.

**About:** category citizenship, date 1940

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He became a United States citizen in 1940" (Biographical, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "He became a United States citizen in 1940" (paragraph 2) <https://fi.edu/en/awards/laureates/albert-einstein>
- EIN-S-0012, Library of Congress (institutional): "On the basis of this declaration, the man who had first proposed the theory of relativity in 1905 became a U.S. citizen in 1940." (summary\[0\]) <https://www.loc.gov/item/2021667583/>
- EIN-S-0013, Library of Congress (institutional): "He became a U.S. citizen in 1940." (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "Herb Block pays tribute to scientist Albert Einstein" (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Citizenship Date: 1940" (ALBERT EINSTEIN (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0012 lacks name 'United' not in its quotes; name 'States' not in its quotes \| EIN-S-0013 lacks name 'United' not in its quotes; name 'States' not in its quotes \| EIN-S-0002 lacks word 'became' not in its quotes; name 'United' not in its quotes; name 'States' not in its quotes; word 'citizen' not in its quotes

**Notes:** Year only; the exact date needs the NARA naturalization record EIN-S-0001. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-15, tmp-loc-F-3, tmp-media-F-6, tmp-baseline-F-10 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0017 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein's special theory of relativity stemmed from an attempt to reconcile the laws of mechanics with the laws of the electromagnetic field.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "his special theory of relativity stemmed from an attempt to reconcile the laws of mechanics with the laws of the electromagnetic field" (Biographical, paragraph 5) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-20 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0018 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein dealt with problems of statistical mechanics merged with quantum theory, which led to an explanation of the Brownian movement of molecules.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He dealt with classical problems of statistical mechanics and problems in which they were merged with quantum theory: this led to an explanation of the Brownian movement of molecules." (Biographical, paragraph 5) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-21 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0019 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein's observations on the thermal properties of light with a low radiation density laid the foundation of the photon theory of light.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He investigated the thermal properties of light with a low radiation density and his observations laid the foundation of the photon theory of light." (Biographical, paragraph 5) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-22 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0020 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1916 Albert Einstein published his paper on the general theory of relativity.

**About:** category work, date 1916

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "in 1916 he published his paper on the general theory of relativity" (Biographical, paragraph 6) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "In 1916 he published his paper on the general theory of relativity." (paragraph 4) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin)

**Notes:** Contradicts the IHH page year 1915 for the general relativity paper: this page gives 1916. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-23 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0021 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In the 1920s, Albert Einstein embarked on the construction of unified field theories.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "In the 1920s, Einstein embarked on the construction of unified field theories" (Biographical, paragraph 7) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "In the 1920s, Einstein embarked on the construction of unified field theories" (paragraph 4) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin)

**Notes:** Gives a period for the IHH lead 'pursued the Unified Field Theory'. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-24 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0022 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein contributed to statistical mechanics by his development of the quantum theory of a monatomic gas.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He contributed to statistical mechanics by his development of the quantum theory of a monatomic gas" (Biographical, paragraph 7) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0023 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** After his retirement Albert Einstein continued to work towards the unification of the basic concepts of physics.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "After his retirement he continued to work towards the unification of the basic concepts of physics" (Biographical, paragraph 8) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-25 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0024 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein gained the Copley Medal of the Royal Society of London in 1925.

**About:** category award, date 1925

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He gained numerous awards in recognition of his work, including the Copley Medal of the Royal Society of London in 1925" (Biographical, paragraph 10) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Copley Medal of the Royal Society of London (1925)" (AWARDS & HONORS section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "AWARDS & HONORS" (AWARDS & HONORS section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0002 lacks word 'gained' not in its quotes

**Notes:** Confirms the IHH award line Copley Medal (1925). Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-29, tmp-baseline-F-23 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0025 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein gained the Franklin Medal of the Franklin Institute in 1935.

**About:** category award, date 1935

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "including the Copley Medal of the Royal Society of London in 1925, and the Franklin Medal of the Franklin Institute in 1935" (Biographical, paragraph 10) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "He gained numerous awards in recognition of his work" (Biographical, paragraph 10) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0007, Institute for Advanced Study (institutional): "1935 Franklin Inst Medal" (HONORS) <https://www.ias.edu/scholars/albert-einstein>
- EIN-S-0004, Nobel Prize Outreach (institutional): "He gained numerous awards in recognition of his work, including the Copley Medal of the Royal Society of London in 1925, and the Franklin Medal of the Franklin Institute in 1935." (Biographical, paragraph 10) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Franklin Medal of the Franklin Institute (1935)" (AWARDS & HONORS section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "AWARDS & HONORS" (AWARDS & HONORS section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-e37f, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0004 found (https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/); EIN-S-0007 found (https://www.ias.edu/scholars/albert-einstein); EIN-S-0002 found (https://immigranthallofhonor.org/inductees/inductee-albert-einstein/)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0007 lacks word 'gained' not in its quotes; name 'Institute' not in its quotes \| EIN-S-0002 lacks word 'gained' not in its quotes

**Notes:** Confirms the IHH award line Franklin Medal (1935); IAS page lists 1935 Franklin Inst Medal. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-30, tmp-baseline-F-26 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0026 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein came to the United States to take up his appointment at the Institute at the invitation of Abraham Flexner, the Institute's founding Director.

**About:** category immigration

**Evidence** (open the link and find the quote):

- EIN-S-0007, Institute for Advanced Study (institutional): "Einstein came to the United States to take up his appointment at the Institute at the invitation of Abraham Flexner, the Institute’s founding Director." (paragraph 2) <https://www.ias.edu/scholars/albert-einstein>
- EIN-S-0007, Institute for Advanced Study (institutional): "Physicist Albert Einstein (1879–1955)" (paragraph 1) <https://www.ias.edu/scholars/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Institute for Advanced Study scholar page. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-46 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0027 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** During his time as an Institute Faculty member, Albert Einstein pursued the goal of a unified field theory.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0007, Institute for Advanced Study (institutional): "During his time as an Institute Faculty member, Einstein pursued the goal of a unified field theory" (paragraph 2) <https://www.ias.edu/scholars/albert-einstein>
- EIN-S-0007, Institute for Advanced Study (institutional): "Physicist Albert Einstein (1879–1955)" (paragraph 1) <https://www.ias.edu/scholars/albert-einstein>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Pursued the Unified Field Theory" (ACHIEVEMENTS section) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0002 lacks name 'During' not in its quotes; word 'time' not in its quotes; name 'Institute' not in its quotes; name 'Faculty' not in its quotes ...

**Notes:** Gives a period (his IAS faculty years) for the IHH lead 'pursued the Unified Field Theory'. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-47, tmp-baseline-F-20 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0028 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein has the authority heading Einstein, Albert, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "recordType: authority" (recordType) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** NARA person authority record heading.

### EIN-F-0032 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Einshtein, Al'bert, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[0\].heading: Einshtein, Al'bert, 1879-1955" (variantPersonNames\[0\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0033 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ainshtain, Albert, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[1\].heading: Ainshtain, Albert, 1879-1955" (variantPersonNames\[1\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0034 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Inshtin, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[2\].heading: Inshtin, 1879-1955" (variantPersonNames\[2\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0035 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ajnstajn, Albert, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[3\].heading: Ajnstajn, Albert, 1879-1955" (variantPersonNames\[3\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0036 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ai-yin-ssu-tan, A-po-te, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[4\].heading: Ai-yin-ssu-tan, A-po-te, 1879-1955" (variantPersonNames\[4\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0037 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Aynishtayn, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[5\].heading: Aynishtayn, 1879-1955" (variantPersonNames\[5\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0038 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Aiyinsitan, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[6\].heading: Aiyinsitan, 1879-1955" (variantPersonNames\[6\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0039 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ai-yin-ssu-tan, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[7\].heading: Ai-yin-ssu-tan, 1879-1955" (variantPersonNames\[7\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0040 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ainshutain, A, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[8\].heading: Ainshutain, A, 1879-1955" (variantPersonNames\[8\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0041 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein, Albert, 1879-1955 has the variantPersonNames heading Ainstaina, Albarta, 1879-1955.

**About:** category identity

**Evidence** (open the link and find the quote):

- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "variantPersonNames\[9\].heading: Ainstaina, Albarta, 1879-1955" (variantPersonNames\[9\].heading) <https://catalog.archives.gov/id/10582637>
- EIN-S-0006, U.S. National Archives and Records Administration (institutional): "heading: Einstein, Albert, 1879-1955" (heading) <https://catalog.archives.gov/id/10582637>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0042 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1879, Albert Einstein was born to a middle-class German Jewish family.

**About:** category birth, date 1879

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "In 1879, Albert Einstein was born to a middle-class German Jewish family." (paragraph 1) <https://www.ias.edu/albert-einstein-brief>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Institute for Advanced Study pages.

### EIN-F-0043 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1932/33 Albert Einstein went to Princeton, never to return to Germany.

**About:** category immigration, place Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0010, Wüstenrot Stiftung (secondary): "In 1932/33 he went to Princeton, never to return to Germany." (Albert Einstein glossary note (inline, paragraph beginning 'Even before Albert Einstein')) <https://www.einsteinturm.com/en/einstein-donation>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): einsteinturm.com: Wüstenrot Stiftung, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim

**Notes:** Einstein Tower website (Wuestenrot Stiftung; secondary, unregistered).

### EIN-F-0044 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1936, German-born physicist Albert Einstein filed a Declaration of Intention to become an American citizen.

**About:** category citizenship, date 1936

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "In 1936, German-born physicist Albert Einstein filed this Declaration of Intention to become an American citizen." (summary\[0\]) <https://www.loc.gov/item/2021667583/>
- EIN-S-0060, DocsTeach (National Archives Foundation) (institutional): "In 1936, German-born physicist Albert Einstein filed this Declaration of Intention to become an American citizen." (document description) <https://docsteach.org/document/declaration-intention-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0012 found (https://www.loc.gov/item/2021667583/); EIN-S-0060 found (https://docsteach.org/document/declaration-intention-einstein/)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0012 and EIN-S-0060 are one holder (same text: their quotes are near-verbatim copies)

**Notes:** LoC summary of a WDL copy; original at NARA. created\_published gives 1936-01-15 (see EIN-F-0045). Corroborated 2026-10-10 (einstein-recover) by DocsTeach EIN-S-0060, whose caption is word for word the LoC caption (likely a shared NARA origin).

### EIN-F-0046 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The District Court for the Trenton Division of the District of New Jersey is the creator of the Declaration of Intention for Albert Einstein.

**About:** category citizenship, place Trenton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "Declaration of Intention for Albert Einstein." (title) <https://www.loc.gov/item/2021667583/>
- EIN-S-0012, Library of Congress (institutional): "District Court for the Trenton Division of the District of New Jersey, United States Creator." (contributor\_names\[0\]) <https://www.loc.gov/item/2021667583/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Creator as named in contributor\_names; subject heading gives Trenton, New Jersey.

### EIN-F-0047 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The original of the Declaration of Intention for Albert Einstein is at the U.S. National Archives and Records Administration.

**About:** category citizenship

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "Declaration of Intention for Albert Einstein." (title) <https://www.loc.gov/item/2021667583/>
- EIN-S-0012, Library of Congress (institutional): "Original resource at: U.S. National Archives and Records Administration." (notes\[2\]) <https://www.loc.gov/item/2021667583/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Custody statement from the LoC record (notes\[2\]); the WDL/LoC item is a digital copy.

### EIN-F-0049 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** With the rise of Adolf Hitler and Nazism, Einstein left Germany in 1932 to move to America.

**About:** category immigration, date 1932

**Evidence** (open the link and find the quote):

- EIN-S-0013, Library of Congress (institutional): "With the rise of Adolf Hitler and Nazism, Einstein left Germany in 1932 to move to America where he took part in the Institute for Advanced Studies of Princeton." (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "Herb Block pays tribute to scientist Albert Einstein" (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "Einstein left Germany in 1932 to move to America" (item.notes\[0\] (exhibit caption label)) <https://www.loc.gov/item/00652204/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** LoC exhibit caption (Herblock's History). Gives 1932 for leaving Germany, which conflicts with tmp-loc-F-6 (immigration after the 1933 Nazi takeover). Year only, no port or arrival date; does not confirm Princeton as a place of immigration. Merge 2026-10-09: combined with duplicate candidates tmp-media-F-4 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0052 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein left Germany in 1933 after the Nazis came to power.

**About:** category immigration, date 1933

**Evidence** (open the link and find the quote):

- EIN-S-0015, Library of Congress (institutional): "Einstein left Germany in 1933 after the Nazis came to power." (summary) <https://www.loc.gov/item/2016683178/>
- EIN-S-0015, Library of Congress (institutional): "Cartoon shows Albert Einstein" (summary) <https://www.loc.gov/item/2016683178/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** LoC catalog summary of a Brooklyn Eagle cartoon. Agrees with tmp-loc-F-6 (1933) and conflicts with the Herblock caption EIN-F-0049 (1932) and the IHH page's 1932 (tmp-baseline-F-5).

### EIN-F-0053 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** March 14 is Albert Einstein's birthday.

**About:** category birth

**Evidence** (open the link and find the quote):

- EIN-S-0016, Library of Congress (institutional): "March 14 is also Albert Einstein’s birthday" (post body, paragraph 1) <https://blogs.loc.gov/folklife/2014/07/celebrating-pi/>
- EIN-S-0061, National Park Service (institutional): "Albert Einstein was perhaps the most famous scientist of his time, doing work essential to the progress of physics. He signed a letter to President Roosevelt alerting him to the possibility of the development of atomic weapons. Place of Birth: Ulm, Germany Date of Birth: March 14, 1879" (Quick Facts: Significance, Place of Birth, Date of Birth (snapshot lines 41-50)) <https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130227-bb81, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0061 lacks word 'birthday' not in its quotes

**Notes:** LoC Folklife blog; month and day only, no year or place. Agrees with the IHH birth date lead (tmp-baseline-F-3) for month and day.

### EIN-F-0082 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Now it appears almost certain that this could be achieved in the immediate future.

**About:** category quote, date 1939-08-02, the inductee's own words

**Evidence** (open the link and find the quote):

- EIN-S-0068, Library of Congress (institutional): "Now it appears almost certain that this could be achieved in the immediate future." (post body, paragraph 3 (quoted from the letter)) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0068, Library of Congress (institutional): "Between July 18 and August 15, 1939, one of the most consequential letters in modern history was drafted by Albert Einstein and the Hungarian-born physicist Leo Szilard" (post body, paragraph 1) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "Now it appears almost certain that this could be achieved in the immediate future." (document text, paragraph 3) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>
- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "Letter from Albert Einstein to U.S. President Roosevelt on the Prospect of an Atomic Bomb (August 2, 1939)" (document title) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0068 found (https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/); EIN-S-0069 found (https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0068 and EIN-S-0069 are one holder (same text: their quotes are near-verbatim copies); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0068 lacks event\_date 1939-08-02 not in its quotes

**Notes:** Sentence from Einstein's letter of 2 August 1939 to President F. D. Roosevelt (the original is in the FDR Library, NARA; NAID 16608874 file unit 'Sachs, Alexander', scan only, no transcription in the catalog). The LoC post says the letter was drafted by Einstein and Leo Szilard; it was signed by Einstein. Context: 'this' refers to setting up a nuclear chain reaction in a large mass of uranium (previous sentence of the letter).

### EIN-F-0083 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** However, such bombs might very well prove to be too heavy for transportation by air.

**About:** category quote, date 1939-08-02, the inductee's own words

**Evidence** (open the link and find the quote):

- EIN-S-0068, Library of Congress (institutional): "However such bombs might very well prove to be too heavy for transportation by air." (post body, paragraph 4 (quoted from the letter)) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0068, Library of Congress (institutional): "Between July 18 and August 15, 1939, one of the most consequential letters in modern history was drafted by Albert Einstein and the Hungarian-born physicist Leo Szilard" (post body, paragraph 1) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "However, such bombs might very well prove to be too heavy for transportation by air." (document text, paragraph 4) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>
- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "Letter from Albert Einstein to U.S. President Roosevelt on the Prospect of an Atomic Bomb (August 2, 1939)" (document title) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0068 found (https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/); EIN-S-0069 found (https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939)

**Checker's reasoning:** The Library of Congress version omits the comma after “However,” but the claim exactly matches the German History in Documents and Images transcription.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0068 and EIN-S-0069 are one holder (same text: their quotes are near-verbatim copies); G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0068 lacks event\_date 1939-08-02 not in its quotes

**Notes:** Sentence from Einstein's letter of 2 August 1939 to President F. D. Roosevelt. The LoC post prints it without the comma after 'However'; the GHDI transcription has 'However, such bombs'. The claim follows the registry-institutional source (LoC). Drafted by Einstein and Leo Szilard per the LoC post. 2026-10-09 fix round 1 (task 10b review): claim switched from the LoC wording ('However such bombs might very well prove to be too heavy for transportation by air.', no comma) to the letter's wording as transcribed by GHDI (EIN-S-0069), which is the matching evidence quote; the LoC quote (EIN-S-0068) stays as institutional corroboration and covers every word of the claim. Edit lock (2026-10-09): claim changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T190133-9e8d, 2026-10-09) cleared for re-verification.

### EIN-F-0084 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** How I wish that somewhere there existed an island for those who are wise and of goodwill! In such a place even I would be an ardent patriot.

**About:** category quote, the inductee's own words

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "How I wish that somewhere there existed an island for those who are wise and of goodwill! In such a place even I would be an ardent patriot." (timeline entry 1939 (pull quote after it)) <https://www.ias.edu/albert-einstein-brief>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Pull quote in the Einstein life timeline of the IAS page and of the AIP exhibit it is based on; neither page names the document or date it comes from. Attribution to Einstein is by the pages' context (quotes of Einstein in an Einstein exhibit). The two pages share one origin text, so the corroboration is weaker than two independent holders. 2026-10-09 fix round 1 (task 10b review): removed the EIN-S-0070 (AIP) evidence item. The IAS page EIN-S-0008 reproduces the AIP exhibit text under AIP copyright, so AIP is not an independent holder; this fact now rests on IAS alone (expected single-source). Not searched further.

### EIN-F-0085 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** One thing I have learned in a long life: that all our science, measured against reality, is primitive and childlike—and yet it is the most precious thing we have.

**About:** category quote, the inductee's own words

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "One thing I have learned in a long life: that all our science, measured against reality, is primitive and childlike—and yet it is the most precious thing we have." (timeline entry 1955 (closing quote)) <https://www.ias.edu/albert-einstein-brief>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Closing pull quote of the IAS 'In Brief' timeline and of the AIP exhibit it is based on (AIP prints a spaced en dash where IAS has an em dash). Neither page names the source document or date. The two pages share one origin text. 2026-10-09 fix round 1 (task 10b review): removed the EIN-S-0070 (AIP) evidence item. The IAS page EIN-S-0008 reproduces the AIP exhibit text under AIP copyright, so AIP is not an independent holder; this fact now rests on IAS alone (expected single-source). Not searched further.

### EIN-F-0088 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein had an office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey.

**About:** category career, place Fuld Hall, Institute for Advanced Study, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0062, Institute for Advanced Study (institutional): "Albert Einstein's office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey." (Description) <https://albert.ias.edu/entities/archivalmaterial/63694399-870e-4161-8764-1d2d0a14d921>
- EIN-S-0063, Institute for Advanced Study (institutional): "Albert Einstein's office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey." (Description) <https://albert.ias.edu/entities/archivalmaterial/692f7570-c1c2-4794-b26d-e26737dc32d5>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0062 and EIN-S-0063 are one holder (same text: their quotes are near-verbatim copies)

**Notes:** From the IAS photograph records of his office (Alan Richards, 1955). Both records are one holder (IAS), so this may stay single-source.

### EIN-F-0089 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein signed a letter to President F. D. Roosevelt in August 1939.

**About:** category work, date 1939-08-02

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "1939 Einstein signed a letter that informed President F. D. Roosevelt of the possibility of nuclear bombs, warning that the Germans might try to build them." (timeline entry 1939) <https://www.ias.edu/albert-einstein-brief>
- EIN-S-0072, U.S. National Archives and Records Administration (institutional): "Because Albert Einstein had a previous personal relationship with the Roosevelts and was internationally well-known for his expertise, a letter informing the President about the dangers of a nuclear chain reaction bomb was drafted for Einstein’s signature." (post body, paragraph 2) <https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/>
- EIN-S-0072, U.S. National Archives and Records Administration (institutional): "This August 2, 1939 letter was personally delivered to the President on October 11, 1939" (post body, paragraph 3) <https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-fix1-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0008 lacks date 'August 1939' (1939-08) not in its quotes; event\_date 1939-08-02 not in its quotes \| EIN-S-0072 lacks word 'signed' not in its quotes; name 'F' not in its quotes; name 'D' not in its quotes

**Notes:** Attribution fact for the direct quotes EIN-F-0082 and EIN-F-0083 (sentences of this letter). IAS says Einstein signed the letter; the FDR Library (NARA) post says it was drafted for Einstein's signature and dates it August 2, 1939. Authorship of the text is shared (LoC EIN-S-0068: drafted by Einstein and Leo Szilard), so captions should say 'signed'.

### EIN-F-0090 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** On April 25, 1921, members of the National Academy went to the White House in Washington, D.C., and were received by the President; they were accompanied by Dr. Einstein.

**About:** category other, date 1921-04-25, place White House, Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0074, Library of Congress (primary): "Members of the National Academy went to the White H\<\*use at 1 o'clock today and were received by the President. They were accompanied by Dr. Einstein" (page OCR text, article 'Noted scientists at meeting here') <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>
- EIN-S-0073, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., April 25, 1921" (created\_published (page date and place)) <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2>
- EIN-S-0021, Library of Congress (primary): "item.title: \[Albert Einstein, Warren Harding and group at White House, Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885955/>
- EIN-S-0088, U.S. National Archives and Records Administration (institutional): "President Harding and the National Academy of Sciences at the White House, Washington, DC, April 1921" (exhibit caption of photograph 16-ES-485) <https://www.archives.gov/exhibits/panoramic_photography/images/president_harding_nas.html>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0074 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042501/0622.xml&format=alto\_xml&full\_text=1); EIN-S-0073 unreachable (https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&fo=json); EIN-S-0021 found (https://www.loc.gov/item/2016885955/); EIN-S-0088 found (https://www.archives.gov/exhibits/panoramic\_photography/images/president\_harding\_nas.html)

**Checker's reasoning:** No problem found; the newspaper’s live text and issue record could not be loaded.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0074 lacks date 'April 25, 1921' (1921-04-25) not in its quotes; name 'House' not in its quotes; name 'Washington' not in its quotes; name 'D' not in its quotes ... \| EIN-S-0073 lacks word 'members' not in its quotes; name 'National' not in its quotes; name 'Academy' not in its quotes; word 'went' not in its quotes ... \| EIN-S-0021 lacks date 'April 25, 1921' (1921-04-25) not in its quotes; word 'members' not in its quotes; name 'National' not in its quotes; name 'Academy' not in its quotes ... \| EIN-S-0088 lacks date 'April 25, 1921' (1921-04-25) not in its quotes; word 'members' not in its quotes; word 'went' not in its quotes; name 'D' not in its quotes ...

**Notes:** Journey pin fact for the Washington room. The Evening Star article says 'today'; the page record (EIN-S-0073) dates the page April 25, 1921. OCR reads 'White H\<\*use'; the Harris & Ewing record EIN-S-0021 names the White House. EIN-S-0021 is dated \[between 1921 and 1923\] by LoC, so it corroborates the place and the people, not the day. Round 2 (2026-10-10): added EIN-S-0088 (National Archives exhibit caption, a holder other than LoC) as independent corroboration that President Harding received the National Academy of Sciences at the White House in April 1921; it does not name Einstein.

### EIN-F-0094 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** On April 25, 1921, Prof. Albert Einstein, author of the theory of relativity, was a guest at luncheon at the Smithsonian Institution of the National Academy of Sciences in Washington, D.C.

**About:** category other, date 1921-04-25, place Smithsonian Institution, Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0074, Library of Congress (primary): "Prof. Albert Einstein, author of the theory of relativity, and the Prince \<\*f Monaco, renowned for his research work in oceanography arid paleontology, were the guests at luncheon today at the Smithsonian Institution of the National Academy of Sciences" (page OCR text, article 'Noted scientists at meeting here') <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>
- EIN-S-0073, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., April 25, 1921" (created\_published (page date and place)) <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0074 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042501/0622.xml&format=alto\_xml&full\_text=1); EIN-S-0073 unreachable (https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&fo=json)

**Checker's reasoning:** No problem found; the newspaper’s live text and issue record could not be loaded.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0074 lacks date 'April 25, 1921' (1921-04-25) not in its quotes; name 'Washington' not in its quotes; name 'D' not in its quotes; name 'C' not in its quotes ... \| EIN-S-0073 lacks name 'Prof' not in its quotes; name 'Albert' not in its quotes; name 'Einstein' not in its quotes; word 'author' not in its quotes ...

**Notes:** One holder (LoC newspaper page + its page record): expected single-source.

### EIN-F-0096 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1921, Einstein visited the United States to help raise funds for the Hebrew University in Jerusalem.

**About:** category work, date 1921, place United States

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "1921 Aided by his fame, Einstein championed the fledgling German republican government and other liberal causes. Partly as a result of this, he and his theory of relativity came under vicious attack from anti-Semites. He began traveling, attended an International Trade Union Congress in Amsterdam, and he visited the United States to help raise funds for the Hebrew University in Jerusalem." (timeline entry 1921) <https://www.ias.edu/albert-einstein-brief>
- EIN-S-0089, Library of Congress (primary): "Dr. Albert Einstein, propounder of the famous theory of relativity, landed In New York the other day. It Is his Hrst visit. lie comes to raise money for the Hebrew university on the Mount of Olives." (page OCR text, item 'Dr. Einstein and Relativity') <https://www.loc.gov/resource/sn87065645/1921-04-30/ed-1/?sp=6&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0008 found (https://www.ias.edu/albert-einstein-brief); EIN-S-0089 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/msar/batch\_msar\_emerald\_ver02/data/sn87065645/00383344359/1921043001/0393.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found; the Library of Congress OCR source could not be loaded for a live check.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0089 lacks year 1921 not in its quotes; name 'United' not in its quotes; name 'States' not in its quotes; word 'help' not in its quotes ...

**Notes:** The occasion of the 1921 visit. AIP's chronology corroborates the 1921 visit (not the fundraising purpose). Caution from PROPOSED.md: the IAS 'In Brief' page reproduces AIP exhibit text, so the two may be one text. Round 2 (2026-10-10): EIN-S-0059 (AIP chronology) removed from the evidence: EIN-S-0008 (IAS) reproduces the AIP exhibit 'Einstein: Image and Impact' and EIN-S-0059 is a page of the same AIP exhibit, so the two are one text, not two independent holders. Added EIN-S-0089 (Bolivar County Democrat, April 30, 1921, a contemporaneous syndicated report held by LoC) as the independent second source; its OCR reads 'Hrst' for 'first' and 'lie' for 'He'.

### EIN-F-0097 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein and Elsa Einstein were aboard the SS Belgenland upon their arrival in San Diego on December 31, 1930.

**About:** category immigration, date 1930-12-31, place San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0037, UCLA Library Digital Collections (institutional): "View of Albert Einstein and Elsa Einstein aboard the ship, the SS Belgenland, upon their arrival in San Diego." (Description) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>
- EIN-S-0037, UCLA Library Digital Collections (institutional): "Date created December 31, 1930" (Date created) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>
- EIN-S-0081, Library of Congress (primary): "item.title: \[Einstein & Mrs. Einstein with reception committee at San Diego, Calif., Dec. 31, 1930\]" (item.title) <https://www.loc.gov/item/2022886683/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6df4, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0037 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690); EIN-S-0081 found (https://www.loc.gov/item/2022886683/?fo=json)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0081 lacks name 'Albert' not in its quotes; name 'Elsa' not in its quotes; word 'aboard' not in its quotes; name 'SS' not in its quotes ...

**Notes:** Journey pin fact for the San Diego room. Date from the LoC record (caption-card data) and the United Press dateline; IAS dates its photograph 1930. Category immigration is the nearest schema category for an arrival by ship; this was a visit, not an immigration. Edited 2026-10-10 after the first adversary pass (adv-20261010T165246-4f40): the Imperial Valley Press OCR evidence (EIN-S-0082, manual snapshot) could not be confirmed live by Codex, so it was removed and the claim reworded to the remaining records' words ('arrival', 'debarks'). Needs a new adversary verdict. Edited again 2026-10-10 after adv-20261010T165845-1910 (refuted: the earlier wording said Elsa debarked, which no quote states). Now restates the UCLA record (Los Angeles Times photograph) and is corroborated by the LoC record (Einstein & Mrs. Einstein, San Diego, Dec. 31, 1930) and IAS EB 064. IAS EB 064 (browser snapshot) removed from the evidence after Codex could not load it live (adversary unclear); it stays the basis of EIN-F-0098 and EIN-M-0039.

### EIN-F-0098 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In San Diego, Einstein and his wife, Elsa, were greeted by San Diego's mayor, Harry C. Clark.

**About:** category other, place San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0083, Institute for Advanced Study (institutional): "Einstein and his wife, Elsa (second from left), are greeted by San Diego's mayor, Harry C. Clark" (Description) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0090, Library of Congress (primary): "SAN DIEGO. Cal.. Jan. I.—The eyes of Professor Albert Einstein" (page OCR text, dateline of 'Einstein moved by warmth of welcome') <https://www.loc.gov/resource/sn82015313/1931-01-01/ed-1/?sp=12&st=text>
- EIN-S-0090, Library of Congress (primary): "Before speaking. Dr. Einstein was greeted by Mayor Harry C. Clark" (page OCR text, same article) <https://www.loc.gov/resource/sn82015313/1931-01-01/ed-1/?sp=12&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0083 found (https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d); EIN-S-0090 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/in/batch\_in\_huxley\_ver01/data/sn82015313/0038334931A/1931010101/0012.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The Library of Congress OCR could not be loaded live; its snapshot and the live IAS record contain the cited passages.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0090 lacks word 'wife' not in its quotes; name 'Elsa' not in its quotes

**Notes:** The mayor is named only by IAS; the Imperial Valley Press headline says city officials greeted him. event\_date 1930 is IAS's Date field. Edited 2026-10-10 after the first adversary pass: the Imperial Valley Press headline evidence (EIN-S-0082, manual snapshot, not confirmable live) was removed; the claim rests on the IAS record alone. Round 2 (2026-10-10): added EIN-S-0090 (Indianapolis Times, January 1, 1931, United Press report datelined San Diego, held by LoC) as an independent second source naming Mayor Harry C. Clark; it does not mention Elsa, which EIN-S-0083 (IAS) states.

### EIN-F-0100 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In February 1931, Albert Einstein was photographed at The Athenaeum, California Institute of Technology, in Pasadena, California.

**About:** category career, date 1931-02, place The Athenaeum, California Institute of Technology, Pasadena, California

**Evidence** (open the link and find the quote):

- EIN-S-0085, Smithsonian Institution (institutional): "Dr. Albert Einstein (1879-1955), Berlin Academy of Sciences" (Summary) <https://siarchives.si.edu/collections/siris_arc_393240>
- EIN-S-0085, Smithsonian Institution (institutional): "One of a series of photographs taken at The Athenaeum, California Institute of Technology, February 1931." (Summary) <https://siarchives.si.edu/collections/siris_arc_393240>
- EIN-S-0084, Institute for Advanced Study (institutional): "Albert Einstein dines at The Athenaeum on the campus of Caltech (California Institute of Technology) in Pasadena, California." (Description) <https://albert.ias.edu/entities/archivalmaterial/7ca4dfb1-5c92-4d57-b3e8-071540aadce8>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0085 lacks name 'Pasadena' not in its quotes; place: name 'Pasadena' not in its quotes \| EIN-S-0084 lacks date 'February 1931' (1931-02) not in its quotes; word 'photographed' not in its quotes; event\_date 1931-02 not in its quotes

**Notes:** Smithsonian Institution Archives (Science Service photograph) gives February 1931; IAS gives circa 1930-1931 for its Athenaeum photograph.

### EIN-F-0101 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1930, Einstein had an extended visit to the United States, chiefly at the California Institute of Technology.

**About:** category career, date 1930, place California Institute of Technology

**Evidence** (open the link and find the quote):

- EIN-S-0059, American Institute of Physics (secondary): "1930 Extended visit to United States, chiefly at the California Institute of Technology." (chronology, 1930) <https://history.aip.org/exhibits/einstein/chron.htm>
- EIN-S-0084, Institute for Advanced Study (institutional): "Albert Einstein dines at The Athenaeum on the campus of Caltech (California Institute of Technology) in Pasadena, California." (Description) <https://albert.ias.edu/entities/archivalmaterial/7ca4dfb1-5c92-4d57-b3e8-071540aadce8>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0084 lacks year 1930 not in its quotes; word 'extended' not in its quotes; word 'visit' not in its quotes; name 'United' not in its quotes ...

**Notes:** The purpose of the trip that began with the San Diego arrival. AIP (secondary, unregistered) states it; the IAS record corroborates Einstein at Caltech, circa 1930-1931.

### EIN-F-0103 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At Balboa Park in San Diego, where 8,000 persons greeted the famous visitor, Dr. Albert Einstein made a brief talk in German.

**About:** category other, place Balboa Park, San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0086, Library of Congress (primary): "SAN DIEGO. Dec. 31. Uj.PJ— Speaking in German before a nuge crowd in Balboa Park, Dr. Albert Einstein today voiced" (page OCR text, United Press item) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=6&st=text>
- EIN-S-0086, Library of Congress (primary): "j included the brief talk" (same item) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=6&st=text>
- EIN-S-0087, Library of Congress (primary): "On the tour a stop was made at Balboa Park, where 8,000 persons greeted the famous visitor." (page OCR text, article 'Famous German scientist watches annual parade') <https://www.loc.gov/resource/sn92070146/1931-01-01/ed-1/?sp=1&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0086 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_paperflower\_ver01/data/sn92070146/0041418859A/1930123101/1208.xml&format=alto\_xml&full\_text=1); EIN-S-0087 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_paperflower\_ver01/data/sn92070146/0041418859A/1931010101/1209.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 0 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0086 lacks number 8000 not in its quotes; word 'where' not in its quotes; word 'persons' not in its quotes; word 'greeted' not in its quotes ... \| EIN-S-0087 lacks name 'San' not in its quotes; name 'Diego' not in its quotes; name 'Dr' not in its quotes; word 'brief' not in its quotes ...

**Notes:** One holder (LoC newspapers): expected single-source.

### EIN-F-0112 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Unable to find a teaching post, Albert Einstein accepted a position as technical assistant in the Swiss Patent Office.

**About:** category career

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "In 1901, the year he gained his diploma, he acquired Swiss citizenship and, as he was unable to find a teaching post, he accepted a position as technical assistant in the Swiss Patent Office." (biography, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0009, The Franklin Institute (secondary): "Unable to find a teaching post, he accepted a position as technical assistant in the Swiss Patent Office." (laureate biography, paragraph 1) <https://fi.edu/en/awards/laureates/albert-einstein>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): fi.edu: The Franklin Institute, institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: EIN-S-0004 and EIN-S-0009 are one holder (derived\_from: one reproduces or follows the other, or both a common origin)

**Notes:** Split from EIN-F-0011 without the year (the Franklin Institute sentence carries no year of its own). Caution for review: the Franklin Institute laureate text closely follows the Nobel biography; the registry counts them as two holders.

### EIN-F-0127 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein arrived in Princeton in October 1933.

**About:** category immigration, date 1933-10, place Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0093, Institute for Advanced Study (institutional): "112 Mercer Street in Princeton, New Jersey, served as the residence of the renowned physicist Albert Einstein" (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "Einstein purchased the home in 1935, having initially arrived in Princeton in October 1933 while fleeing Nazi persecution and assassination attempts." (paragraph 2) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0093 found (https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** IAS article. The NHL nomination (EIN-S-0091) and NPS (EIN-S-0057) give the year only ('first came to Princeton in 1933').

### EIN-F-0130 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein covered the walls of his study with pictures of Michael Faraday, James Clerk Maxwell, and Isaac Newton.

**About:** category other, place 112 Mercer Street, Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0093, Institute for Advanced Study (institutional): "served as the residence of the renowned physicist Albert Einstein" (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "Amidst the hustle and bustle of Princeton, 112 Mercer Street was a sanctuary for Einstein." (paragraph 7) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "he covered the walls of his study with pictures of Michael Faraday, a pivotal figure in the fields of electromagnetism and electrochemistry; James Clerk Maxwell, who was responsible for the classical theory of electromagnetic radiation; and Isaac Newton" (paragraph 7) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0093 found (https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Room-recreation detail for the Mercer Street study. Reconstructions may show these pictures only where a period photograph shows them.

### EIN-F-0131 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1986, 112 Mercer Street was acquired by the Institute for Advanced Study.

**About:** category legacy, date 1986, place 112 Mercer Street, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0093, Institute for Advanced Study (institutional): "112 Mercer Street in Princeton, New Jersey, served as the residence" (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "the house remained in the family until 1986, when it was acquired by the Institute for Advanced Study" (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0093 found (https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### EIN-F-0136 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The letter from Albert Einstein to U.S. President Roosevelt of August 2, 1939 is from Old Grove Rd., Nassau Point, Peconic, Long Island.

**About:** category work, date 1939-08-02, place Old Grove Rd., Nassau Point, Peconic, Long Island

**Evidence** (open the link and find the quote):

- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "Letter from Albert Einstein to U.S. President Roosevelt on the Prospect of an Atomic Bomb (August 2, 1939)" (title) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>
- EIN-S-0069, German History in Documents and Images (German Historical Institute Washington) (institutional): "Albert Einstein Old Grove Rd. Nassau Point Peconic, Long Island August 2, 1939" (transcription, letter heading) <https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0069 found (https://germanhistorydocs.org/en/nazi-germany-1933-1945/letter-from-albert-einstein-to-us-president-roosevelt-on-the-prospect-of-an-atomic-bomb-august-2-1939)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Place of the 1939 letter (Long Island stop). Only GHDI (unregistered, secondary) transcribes the heading in a saved snapshot; the original is NAID 16608874 (FDR Library, scan only, not transcribed in the catalog). Registered institutional corroboration not found in this run (searches of nps.gov, archives.gov, loc.gov, energy.gov for 'Long Island' / 'Nassau Point' / 'Peconic' returned none).

### EIN-F-0137 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The Letter from Albert Einstein to President Franklin D. Roosevelt of 8/2/1939 is in the Sachs, Alexander file of the President's Secretary's File at the Franklin D. Roosevelt Library, Hyde Park, NY.

**About:** category legacy, date 1939, place Franklin D. Roosevelt Library, Hyde Park, NY

**Evidence** (open the link and find the quote):

- EIN-S-0106, DocsTeach (National Archives Foundation) (institutional): "Letter from Albert Einstein to President Franklin D. Roosevelt; 8/2/1939; Sachs, Alexander; Safe Files, 1933–1945; Collection FDR-FDRPSF: President’s Secretary’s File (Franklin D. Roosevelt Administration),; Franklin D. Roosevelt Library, Hyde Park, NY." (Full Citation) <https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0106 found (https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Where the original letter is held (artifact for the 1939 stop). DocsTeach is secondary (unregistered); the NARA catalog record it cites (EIN-S-0105, file unit 'Sachs, Alexander', reference unit Franklin D. Roosevelt Library, Hyde Park) does not name Einstein in its description, so it cannot carry the claim. 2026-10-15: event\_date set to the year only before any verdict, since DocsTeach writes the date as 8/2/1939 (ambiguous numeric form; G2 reads it as supporting only that form or the year).

### EIN-F-0139 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1953 Einstein gave his brier pipe to a friend and admirer, Gina Plunguian.

**About:** category other, date 1953

**Evidence** (open the link and find the quote):

- EIN-S-0108, Smithsonian Institution (institutional): "Einstein's Brier Pipe" (page title) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "He was still in the habit of holding it when in 1953 he gave it to a friend and admirer, Gina Plunguian" (Description) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905?form=FUNPYRYGFFP)

**Checker's reasoning:** All quoted passages appear in the snapshot and the Smithsonian record returned by web search; direct page fetching failed. No problem found with the claim.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Object for the Princeton study constellation (recreation candidate; the museum's photographs are not usable).

### EIN-F-0140 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein's brier pipe gives evidence of Einstein's long usage in a hole he wore through its bit.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0108, Smithsonian Institution (institutional): "Einstein's Brier Pipe" (page title) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "This one, in fact, gives evidence of Einstein's long usage in a hole he wore through its bit." (Description) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905?form=FUNPYRYGFFP)

**Checker's reasoning:** All quoted passages appear in the snapshot and the Smithsonian record returned by web search; direct page fetching failed. No problem found with the claim.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Physical detail a recreation must show (hole worn through the bit).

### EIN-F-0142 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Gina Plunguian made the watercolor painting Einstein in His Study in 1953.

**About:** category legacy, date 1953

**Evidence** (open the link and find the quote):

- EIN-S-0109, Smithsonian Institution (institutional): "Einstein in His Study" (page title) <https://americanhistory.si.edu/collections/object/nmah_1000855>
- EIN-S-0109, Smithsonian Institution (institutional): "Painting, watercolor" (Object Name) <https://americanhistory.si.edu/collections/object/nmah_1000855>
- EIN-S-0109, Smithsonian Institution (institutional): "1953 (Date Made)" (Related Dates) <https://americanhistory.si.edu/collections/object/nmah_1000855>
- EIN-S-0109, Smithsonian Institution (institutional): "Plunguian, Gina (Maker)" (Related Names) <https://americanhistory.si.edu/collections/object/nmah_1000855>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0109 found (https://americanhistory.si.edu/fr/collections/object/nmah\_1000855)

**Checker's reasoning:** All four quotes appear in the snapshot and the search-readable Smithsonian page for the same catalog record; direct page fetching failed. No problem found with the attribution, medium, title, or date.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Reference only for the study recreation; image rights restricted.

### EIN-F-0143 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein is the subject of an 8c stamp of the Prominent Americans Issue.

**About:** category legacy

**Evidence** (open the link and find the quote):

- EIN-S-0110, Smithsonian Institution (institutional): "Denomination: 8c" (Description) <https://postalmuseum.si.edu/object/npm_0.305037.5>
- EIN-S-0110, Smithsonian Institution (institutional): "Subject: Albert Einstein, Prominent Americans Issue" (Description) <https://postalmuseum.si.edu/object/npm_0.305037.5>
- EIN-S-0110, Smithsonian Institution (institutional): "before printing the stamps" (Description) <https://postalmuseum.si.edu/object/npm_0.305037.5>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0110 found (https://postalmuseum.si.edu/object/npm\_0.305037.5)

**Checker's reasoning:** All three passages appear in the snapshot and the named source's full text returned by web search; together they identify Einstein as the subject of the 8c Prominent Americans stamp.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Legacy object; the proof is dated February 16, 1966 (not the stamp's issue date).

### EIN-F-0144 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The overall material of Einstein's brier pipe is wood.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0108, Smithsonian Institution (institutional): "Einstein's Brier Pipe" (page title) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "wood (overall material)" (Physical Description) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20b, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Atomic split of EIN-F-0141 (adversary: two attributes in one claim).

### EIN-F-0145 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Einstein's brier pipe has overall measurements of 15.8 cm x 3.6 cm.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0108, Smithsonian Institution (institutional): "Einstein's Brier Pipe" (page title) <https://americanhistory.si.edu/collections/object/nmah_334905>
- EIN-S-0108, Smithsonian Institution (institutional): "Measurements overall: 15.8 cm x 3.6 cm" (Physical Specifications) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20b, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Atomic split of EIN-F-0141.

### EIN-F-0149 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein's Nobel Lecture was delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923.

**About:** category award, date 1923-07-11, place Gothenburg

**Evidence** (open the link and find the quote):

- EIN-S-0117, Nobel Prize Outreach (institutional): "Albert Einstein – Nobel Lecture" (page title) <https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/>
- EIN-S-0117, Nobel Prize Outreach (institutional): "Lecture delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923" (lecture heading) <https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/>

**Extractor:** claude:claude-opus-5-5 (run einstein-euro-2026-10-22, 2026-10-22) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T010434-2745, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/)

**Checker's reasoning:** Both quotes appear in the snapshot and fully support the event, date and place. The named live page returned HTTP 403, and shell access failed.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Chapter 9 room fact: the place of the Nobel lecture (Kongresshallen, Gothenburg, per the Göteborgs stadsmuseum photograph GhmF:148).

### EIN-F-0155 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Albert Einstein delivered his Nobel Prize lecture to the Nordic Assembly of Naturalists at Gothenburg on July 11, 1923.

**About:** category award, date 1923-07-11, place Gothenburg

**Evidence** (open the link and find the quote):

- EIN-S-0117, Nobel Prize Outreach (institutional): "Albert Einstein Nobel Prize lecture Lecture delivered to the Nordic Assembly of Naturalists at Gothenburg, July 11, 1923" (lecture page, heading block) <https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/>
- EIN-S-0129, Göteborgs stadsmuseum (K-samsök) (secondary): "Albert Einstein håller sin Nobelföreläsning 11 juli 1923 vid Skandinaviska naturforskarkongressen i Kongresshallen på Liseberg." (K-samsök itemDescription (Beskrivning), GhmF:149) <https://kulturarvsdata.se/GSM/objekt/402049>

**Extractor:** claude:claude-opus-5-5 (run round7-2026-10-27, 2026-10-27) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/); EIN-S-0129 unreachable (https://kulturarvsdata.se/GSM/objekt/402049)

**Checker's reasoning:** Both evidence quotes appear in their snapshots and together fully support the single event, including its date and place. Neither named live source could be loaded through web or shell access.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): goteborgsstadsmuseum.se: Göteborgs stadsmuseum (records distributed through kulturarvsdata.se), primary and institutional

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): EIN-S-0129 lacks date 'July 11, 1923' (1923-07-11) not in its quotes; word 'delivered' not in its quotes; name 'Nobel' not in its quotes; name 'Prize' not in its quotes ...

**Notes:** Round 7 (staged as R7-F-001 in round7-research, 2026-10-26). Nobel Prize Outreach states the lecture, place and date; Göteborgs stadsmuseum's record (Swedish) states the Nobel lecture and the date at the Kongresshallen. The Swedish quote cannot cover the English claim words on its own, so G5 may count one holder.

## 4. Verified, awaiting your decision (71)

### EIN-F-0001 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance.

**About:** category immigration

**Evidence** (open the link and find the quote):

- EIN-S-0001, U.S. National Archives and Records Administration (primary): "This item is a record of naturalization for Albert Einstein which includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance." (scopeAndContentNote) <https://catalog.archives.gov/id/596270>
- EIN-S-0001, U.S. National Archives and Records Administration (primary): "National Archives at Philadelphia" (physicalOccurrences\[0\].referenceUnits\[0\].name) <https://catalog.archives.gov/id/596270>

**Extractor:** claude:claude-opus-5-5 (run einstein-legacy-2026-10-08, 2026-10-08) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261008T204701-b90c, 2026-10-08): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Migrated from data/provenance/facts.jsonl F-0001 (legacy status verified by one agent only). Claim reworded for G2: 'U.S.' dropped because no evidence quote states it. Citizenship date not yet extracted from the document. Reworded 2026-10-08 for the G2 content-word rule (a claim may contain no content word its quotes lack), using only words from its evidence quotes; meaning unchanged. Previous wording: "The National Archives holds Albert Einstein's naturalization record, which includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance."

### EIN-F-0005 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was born 14 March 1879 in Ulm, Germany.

**About:** category birth, date 1879-03-14, place Ulm, Germany

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "Born: 14 March 1879, Ulm, Germany" (Born field) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein grew up in Munich" (Life, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm, in Württemberg, Germany, on March 14, 1879." (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Born: March 14, 1879 in Ulm, Germany" (ALBERT EINSTEIN (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>
- EIN-S-0138, Library of Congress (primary): "Albert Einstein was born at Ulm in March, 1879," (page OCR (full\_text), article on Albert Einstein) <https://www.loc.gov/resource/sn92051392/1921-04-01/ed-1/?sp=19>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0003 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/facts/); EIN-S-0004 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/); EIN-S-0002 found (https://immigranthallofhonor.org/inductees/inductee-albert-einstein/); EIN-S-0138 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ct/batch\_ct\_hashbrown\_ver01/data/sn92051392/00516996390/1921040101/0297.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found; the Nobel Prize and Library of Congress live sources could not be loaded.

**Notes:** Confirms the IHH page birth date and place (two pages of one holder, Nobel Prize Outreach). Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-1, tmp-baseline-F-3 (same claim staged by several families); every supporting quote kept verbatim. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0138, the source of shipped tour record EIN-M-0086, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### EIN-F-0006 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein died on April 18, 1955 at Princeton, New Jersey.

**About:** category death, date 1955-04-18, place Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He died on April 18, 1955 at Princeton, New Jersey." (Biographical, paragraph 10) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Albert Einstein was born at Ulm" (Biographical, paragraph 1) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Died: 18 April 1955, Princeton, NJ, USA" (Died field) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Died: April 18, 1955 in Princeton, New Jersey" (ALBERT EINSTEIN (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Confirms the IHH page death date and place. Merge 2026-10-09: combined with duplicate candidates tmp-institutional-F-34, tmp-baseline-F-4 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0045 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Declaration of Intention for Albert Einstein is from 1936-01-15.

**About:** category citizenship, date 1936-01-15

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "Declaration of Intention for Albert Einstein." (title) <https://www.loc.gov/item/2021667583/>
- EIN-S-0012, Library of Congress (institutional): "\[place of publication not identified\] : \[publisher not identified\], 1936-01-15." (created\_published\[0\]) <https://www.loc.gov/item/2021667583/>
- EIN-S-0060, DocsTeach (National Archives Foundation) (institutional): "Declaration of Intention for Albert Einstein; 1/15/1936;" (Full Citation (snapshot line 98)) <https://docsteach.org/document/declaration-intention-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0012 found (https://www.loc.gov/item/2021667583/); EIN-S-0060 found (https://docsteach.org/document/declaration-intention-einstein/)

**Checker's reasoning:** no problem found

**Notes:** Date as given in the LoC item record field created\_published (place and publisher not identified there). Narrows EIN-F-0044's year.

### EIN-F-0050 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's death was on April 18, 1955.

**About:** category death, date 1955-04-18

**Evidence** (open the link and find the quote):

- EIN-S-0013, Library of Congress (institutional): "The cartoon appeared on news of Einstein's death on April 18, 1955." (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0013, Library of Congress (institutional): "Herb Block pays tribute to scientist Albert Einstein" (notes\[0\]) <https://www.loc.gov/item/00652204/>
- EIN-S-0057, National Park Service (institutional): "Einstein retired from the Institute for Advanced Studies in 1945 but continued to live and work in Princeton until his death on April 18, 1955." (article body, paragraph beginning "In 1921, the Nobel Prize in Physics" (snapshot line 42)) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T025822-2c28, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** LoC exhibit caption; place of death not given here. Merge 2026-10-09: combined with duplicate candidates tmp-media-F-8 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0051 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On 1940 Oct. 1, Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship.

**About:** category citizenship, date 1940-10-01

**Evidence** (open the link and find the quote):

- EIN-S-0019, Library of Congress (primary): "Photograph shows Albert Einstein receiving from Judge Phillip Forman his certificate of American citizenship." (summary) <https://www.loc.gov/item/2004672481/>
- EIN-S-0019, Library of Congress (primary): "1940 Oct. 1." (created\_published\[0\]) <https://www.loc.gov/item/2004672481/>
- EIN-S-0019, Library of Congress (primary): "Date stamped on verso: Oct 1 1940." (notes\[2\]) <https://www.loc.gov/item/2004672481/>
- EIN-S-0142, Library of Congress (primary): "American Citizen TRENTON, N. J„ Oct. 1. (UP)— Dr. Albert Einstein became a citizen of the United States today. With 87 other aliens, representing 12 nationalities, the famed mathe matician and author of the theory of relativity, took the oath admin istered by Benjamin J. Havens, clerk of the federal district court, in the presence of Judge Phillip Forman." (page OCR (full\_text), UP item headed Einstein, Serious Of Face, Becomes American Citizen) <https://www.loc.gov/resource/sn92070146/1940-10-01/ed-1/?sp=1>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0019 found (https://www.loc.gov/pictures/item/2004672481/); EIN-S-0142 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_roseheath\_ver01/data/sn92070146/00414188898/1940100101/0375.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found. The newspaper’s live OCR was unreachable; reachability is reported separately.

**Notes:** NYWT&S photograph record: summary plus created\_published and the date stamped on verso (date of the photograph). Narrows the IHH year-only citizenship date (tmp-baseline-F-10); court not named here. Corroborate with NARA EIN-S-0001. Merge 2026-10-09: combined with duplicate candidates tmp-media-F-1 (same claim staged by several families); every supporting quote kept verbatim. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0142, the source of shipped tour record EIN-M-0091, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### EIN-F-0054 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was working as a consultant to the United States Government during World War II.

**About:** category career

**Evidence** (open the link and find the quote):

- EIN-S-0039, U.S. National Archives and Records Administration (primary): "This is the timekeeping record for Albert Einstein when he was working as a consultant to the United States Government during World War II." (scopeAndContentNote) <https://catalog.archives.gov/id/597840>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Record coverage 1943-07-01 to 1944-06-30 (coverageStartDate, coverageEndDate). Merge 2026-10-09: combined with duplicate candidates tmp-nara-F-5 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0055 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Dr. Albert Einstein is doing research for the Bureau of Ordnance, in his study at Princeton, N.J.

**About:** category career, date 1943-07-24, place Princeton, N.J.

**Evidence** (open the link and find the quote):

- EIN-S-0028, U.S. National Archives and Records Administration (primary): "Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J." (scopeAndContentNote (original caption)) <https://catalog.archives.gov/id/276538325>
- EIN-S-0028, U.S. National Archives and Records Administration (primary): "DATE 24 July 1943" (scopeAndContentNote (original caption)) <https://catalog.archives.gov/id/276538325>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0056 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's Petition for Naturalization has petition number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton.

**About:** category citizenship, place Trenton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0001, U.S. National Archives and Records Administration (primary): "title: Declaration of Intention and Petition for Naturalization for Albert Einstein" (title) <https://catalog.archives.gov/id/596270>
- EIN-S-0001, U.S. National Archives and Records Administration (primary): "variantControlNumbers\[2\].note: Petition number assigned by the U.S. District Court for the District of New Jersey, Trenton." (variantControlNumbers\[2\].note) <https://catalog.archives.gov/id/596270>
- EIN-S-0001, U.S. National Archives and Records Administration (primary): "variantControlNumbers\[2\].number: 4009" (variantControlNumbers\[2\].number) <https://catalog.archives.gov/id/596270>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Petition number from NARA catalog metadata of NAID 596270. The naturalization date itself is not in the catalog text; scanned pages not transcribed.

### EIN-F-0057 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** A photograph of Albert Einstein is affixed to the Declaration of Intention.

**About:** category immigration

**Evidence** (open the link and find the quote):

- EIN-S-0001, U.S. National Archives and Records Administration (primary): "Photograph of Albert Einstein is affixed to the Declaration of Intention." (physicalOccurrences\[0\].mediaOccurrences\[0\].mediaOccurrenceNote) <https://catalog.archives.gov/id/596270>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0062 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer of the Research and Development Division.

**About:** category career

**Evidence** (open the link and find the quote):

- EIN-S-0040, U.S. National Archives and Records Administration (primary): "This series consists of nine letters written by Albert Einstein to Lieutenant Stephen Brunauer of the Research and Development Division." (scopeAndContentNote) <https://catalog.archives.gov/id/305246>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA series description (NAID 305246); the series record describes the letters rather than being one of them, so primary\_document is false.

### EIN-F-0063 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letters to Lieutenant Stephen Brunauer relate to Einstein's research with the Research and Development Division of the Navy, specifically underwater explosions and a proposed electromagnetic torpedo detonator.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0040, U.S. National Archives and Records Administration (primary): "This series consists of nine letters written by Albert Einstein to Lieutenant Stephen Brunauer" (scopeAndContentNote) <https://catalog.archives.gov/id/305246>
- EIN-S-0040, U.S. National Archives and Records Administration (primary): "These letters relate to Einstein's research with the Research and Development Division of the Navy, specifically underwater explosions and a proposed electromagnetic torpedo detonator." (scopeAndContentNote) <https://catalog.archives.gov/id/305246>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0064 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letter of May 17, 1943 to Lieutenant Stephen Brunauer is in regards to Albert Einstein participating in the Research and Development Division of the Navy to research Navy problems.

**About:** category career, date 1943-05-17

**Evidence** (open the link and find the quote):

- EIN-S-0041, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305247>
- EIN-S-0041, U.S. National Archives and Records Administration (primary): "This letter is in regards to Albert Einstein participating in the Research and Development Division of the Navy to research Navy problems." (scopeAndContentNote) <https://catalog.archives.gov/id/305247>
- EIN-S-0041, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-05-17" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305247>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0065 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letter of June 18, 1943 to Lieutenant Stephen Brunauer discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship.

**About:** category invention, date 1943-06-18

**Evidence** (open the link and find the quote):

- EIN-S-0042, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305248>
- EIN-S-0042, U.S. National Archives and Records Administration (primary): "This letter discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship." (scopeAndContentNote) <https://catalog.archives.gov/id/305248>
- EIN-S-0042, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-06-18" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305248>
- EIN-S-0042, U.S. National Archives and Records Administration (primary): "Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305248>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-media-F-15 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0066 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of June 29, 1943 to Lieutenant Stephen Brunauer, Albert Einstein says that he will not be able to come to Washington, DC for health reasons.

**About:** category career, date 1943-06-29

**Evidence** (open the link and find the quote):

- EIN-S-0043, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305249>
- EIN-S-0043, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein answers a letter from the same day, and says that he will not be able to come to Washington, DC for health reasons." (scopeAndContentNote) <https://catalog.archives.gov/id/305249>
- EIN-S-0043, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-06-29" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305249>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0067 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of July 30, 1943 to Lieutenant Stephen Brunauer, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship.

**About:** category work, date 1943-07-30

**Evidence** (open the link and find the quote):

- EIN-S-0044, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305250>
- EIN-S-0044, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship." (scopeAndContentNote) <https://catalog.archives.gov/id/305250>
- EIN-S-0044, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-07-30" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305250>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0068 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of August 13, 1943 to Lieutenant Stephen Brunauer, Albert Einstein mentions an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee.

**About:** category career, date 1943-08-13

**Evidence** (open the link and find the quote):

- EIN-S-0045, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305251>
- EIN-S-0045, U.S. National Archives and Records Administration (primary): "In this letter, Dr. Einstein mentions an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee." (scopeAndContentNote) <https://catalog.archives.gov/id/305251>
- EIN-S-0045, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-08-13" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305251>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Spelling 'Vannever' and committee name 'National Research Committee' kept exactly as in the NARA scope note; not corrected.

### EIN-F-0069 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Signed copies of a contract and naturalization papers were enclosed with Albert Einstein's letter of August 13, 1943 to Lieutenant Stephen Brunauer.

**About:** category citizenship, date 1943-08-13

**Evidence** (open the link and find the quote):

- EIN-S-0045, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305251>
- EIN-S-0045, U.S. National Archives and Records Administration (primary): "Signed copies of a contract and naturalization papers were also enclosed." (scopeAndContentNote) <https://catalog.archives.gov/id/305251>
- EIN-S-0045, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-08-13" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305251>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0070 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of August 22, 1943 to Lieutenant Stephen Brunauer, Albert Einstein gives his opinion on the best localization for installation of the torpedo explosion.

**About:** category work, date 1943-08-22

**Evidence** (open the link and find the quote):

- EIN-S-0046, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305252>
- EIN-S-0046, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein gives his opinion on the best localization for installation of the torpedo explosion." (scopeAndContentNote) <https://catalog.archives.gov/id/305252>
- EIN-S-0046, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-08-22" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305252>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0071 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of September 1, 1943 to Lieutenant Stephen Brunauer, Albert Einstein discusses the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation.

**About:** category work, date 1943-09-01

**Evidence** (open the link and find the quote):

- EIN-S-0047, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305253>
- EIN-S-0047, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein discusses the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation." (scopeAndContentNote) <https://catalog.archives.gov/id/305253>
- EIN-S-0047, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1943-09-01" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305253>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0072 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letter of January 4, 1944 to Lieutenant Stephen Brunauer discusses Albert Einstein's idea to have a torpedo positioned parallel to the wall of a ship before it exploded.

**About:** category work, date 1944-01-04

**Evidence** (open the link and find the quote):

- EIN-S-0048, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305254>
- EIN-S-0048, U.S. National Archives and Records Administration (primary): "This letter discusses Albert Einstein's idea to have a torpedo positioned parallel to the wall of a ship before it exploded." (scopeAndContentNote) <https://catalog.archives.gov/id/305254>
- EIN-S-0048, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1944-01-04" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305254>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0073 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In his letter of January 4, 1944 to Lieutenant Stephen Brunauer, Albert Einstein reveals that when he worked the problem out, the idea of a torpedo positioned parallel to the wall of a ship proved impossible.

**About:** category work, date 1944-01-04

**Evidence** (open the link and find the quote):

- EIN-S-0048, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305254>
- EIN-S-0048, U.S. National Archives and Records Administration (primary): "This letter discusses Albert Einstein's idea to have a torpedo positioned parallel to the wall of a ship before it exploded." (scopeAndContentNote) <https://catalog.archives.gov/id/305254>
- EIN-S-0048, U.S. National Archives and Records Administration (primary): "He reveals, however, that when he worked the problem out, the idea proved impossible." (scopeAndContentNote) <https://catalog.archives.gov/id/305254>
- EIN-S-0048, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1944-01-04" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305254>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0074 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letter of October 15, 1944 to Lieutenant Stephen Brunauer discusses quick compression in a metal container.

**About:** category work, date 1944-10-15

**Evidence** (open the link and find the quote):

- EIN-S-0049, U.S. National Archives and Records Administration (primary): "title: Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance" (title) <https://catalog.archives.gov/id/305255>
- EIN-S-0049, U.S. National Archives and Records Administration (primary): "This letter discusses quick compression in a metal container." (scopeAndContentNote) <https://catalog.archives.gov/id/305255>
- EIN-S-0049, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1944-10-15" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/305255>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0075 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of November 29, 1947, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control.

**About:** category career, date 1947-11-29

**Evidence** (open the link and find the quote):

- EIN-S-0050, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control." (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1947-11-29" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control." (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Merge 2026-10-09: combined with duplicate candidates tmp-media-F-16 (same claim staged by several families); every supporting quote kept verbatim.

### EIN-F-0076 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's letter of November 29, 1947 includes the article "Atomic War or Peace," authored by Albert Einstein.

**About:** category work, date 1947-11-29

**Evidence** (open the link and find the quote):

- EIN-S-0050, U.S. National Archives and Records Administration (primary): "title: Letter from Albert Einstein and the Emergency Committee of Atomic Scientists" (title) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "Einstein pushes for an effort in public education about atomic energy and includes the article "Atomic War or Peace," authored by Albert Einstein." (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1947-11-29" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7873451>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0077 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In "Atomic War or Peace," Albert Einstein discusses his opinion on the need of a supranational agreement for the regulation and use of nuclear weaponry.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0050, U.S. National Archives and Records Administration (primary): ""Atomic War or Peace" details Einstein's thoughts regarding international politics, especially between the United States and Russia." (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "Einstein discusses his opinion on the need of a supranational agreement for the regulation and use of nuclear weaponry." (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "authored by Albert Einstein" (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0078 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of November 29, 1947, Albert Einstein pushes for an effort in public education about atomic energy.

**About:** category career, date 1947-11-29

**Evidence** (open the link and find the quote):

- EIN-S-0050, U.S. National Archives and Records Administration (primary): "title: Letter from Albert Einstein and the Emergency Committee of Atomic Scientists" (title) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "Einstein pushes for an effort in public education about atomic energy" (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1947-11-29" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7873451>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0079 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In a letter of October 11, 1947, Albert Einstein wrote on behalf of the Emergency Committee of Atomic Scientists regarding questions, topics, and warnings concerning the use of nuclear or atomic resources as a means for diplomatic or military solutions.

**About:** category career, date 1947-10-11

**Evidence** (open the link and find the quote):

- EIN-S-0051, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein wrote on behalf of the Emergency Committee of Atomic Scientists regarding questions, topics, and warnings concerning the use of nuclear or atomic resources as a means for diplomatic or military solutions." (scopeAndContentNote) <https://catalog.archives.gov/id/7873452>
- EIN-S-0051, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1947-10-11" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7873452>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0080 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was Chairman of the Emergency Committee of Atomic Scientists.

**About:** category career

**Evidence** (open the link and find the quote):

- EIN-S-0051, U.S. National Archives and Records Administration (primary): "title: Letter from Albert Einstein, Chairman of the Emergency Committee of Atomic Scientists" (title) <https://catalog.archives.gov/id/7873452>
- EIN-S-0050, U.S. National Archives and Records Administration (primary): "In this letter, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists" (scopeAndContentNote) <https://catalog.archives.gov/id/7873451>

**Extractor:** claude:claude-opus-5-5 (run einstein-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

### EIN-F-0086 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein had a study at his Princeton, N.J. home.

**About:** category other, place Princeton, N.J.

**Evidence** (open the link and find the quote):

- EIN-S-0071, Library of Congress (primary): "Dr. Albert Einstein in his study at his Princeton, N.J. home with Capt. Geoffrey E. Sage, USN, commanding officer of the U.S. Naval Training School at Princeton, N.J., and Lt. Comdr. Frederick L. Douthit, USNR, executive officer of the school." (summary) <https://www.loc.gov/item/2002711237/>
- EIN-S-0029, U.S. National Archives and Records Administration (primary): "Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J." (scopeAndContentNote) <https://catalog.archives.gov/id/276538328>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T190133-9e8d, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Ties the 24 July 1943 Navy photographs (EIN-M-0013, EIN-M-0014) to the study in his home. LoC's record notes 'This record contains unverified data from caption card.'

### EIN-F-0087 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey.

**About:** category other, place 112 Mercer Street, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0065, Institute for Advanced Study (institutional): "Albert Einstein standing in his home study at 112 Mercer Street, Princeton, New Jersey." (Description) <https://albert.ias.edu/entities/archivalmaterial/08bd71e1-b97e-4140-af9c-3f452b361d7e>
- EIN-S-0067, Institute for Advanced Study (institutional): "Albert Einstein looking out the window of his home study at 112 Mercer Street, Princeton, New Jersey." (Description) <https://albert.ias.edu/entities/archivalmaterial/1053d45a-e966-4304-a5fa-69de8e0b6fc9>
- EIN-S-0057, National Park Service (institutional): "his study in Mercer Street was his natural habitat" (paragraph quoting Ronald Clark) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0091, National Park Service (primary): "The Albert Einstein House in Princeton, New Jersey, is a simple two story" (Section 7, Description, first paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "In 1936 he purchased 112 Mercer Street. The house remained his home until his death in 1955." (Section 7, Description, fourth paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "his room at the Institute (for Advanced Studies) or his study in Mercer Street was his natural habitat" (Section 7, Description, fourth paragraph (quoting a biographer)) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>

**Extractor:** claude:claude-opus-5-5 (run einstein-t10b-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** From the IAS photograph records (Alan Richards, 1954) and the NPS Albert Einstein House page. Corroborated 2026-10-10 (einstein-recover) by the NHL nomination form EIN-S-0091 (primary, NPS).

### EIN-F-0091 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Dr. Albert Einstein called on President Harding with a delegation from the National Academy of Sciences.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0075, Library of Congress (primary): "Its originator, Dr. Albert Einstein, called on Jlr. Harding to-day with a delegation from the National Academy of Sciences. As the group posed before a camera the President confessed that lie too failed to grasp the relativity Idea." (page OCR text, item '"Relativity" beats Harding', datelined Washington, April 25) <https://www.loc.gov/resource/sn83045774/1921-04-26/ed-1/?sp=6&st=text>
- EIN-S-0076, Library of Congress (primary): "has puzzled President Harding, who admits he fails to grasp the relativity problem." (page OCR text, item 'Puzzles President Harding') <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>
- EIN-S-0076, Library of Congress (primary): "Dr. Einstein, who spoke before the academy today, called on the President yesterday with a delegation from the National Academy of Sciences." (page OCR text, item 'Puzzles President Harding') <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>
- EIN-S-0077, Library of Congress (primary): "item.title: \[Harding, Prof. Einstein & wife\], 4/25/21" (item.title (National Photo Company negative dated 4/25/21)) <https://www.loc.gov/item/2016830269/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0075 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_bindweed\_ver02/data/sn83045774/00271744158/1921042601/0846.xml&format=alto\_xml&full\_text=1); EIN-S-0076 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042601/0646.xml&format=alto\_xml&full\_text=1); EIN-S-0077 found (https://www.loc.gov/item/2016830269/)

**Checker's reasoning:** The newspaper snapshots state the visit and delegation; the photograph record places Harding and Einstein together. Live newspaper OCR was unreachable.

**Notes:** New York Herald OCR reads 'Jlr. Harding' (Mr. Harding). The National Photo Company negative record corroborates that Harding and Einstein were photographed together on 4/25/21.

### EIN-F-0092 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** As the group posed before a camera, President Harding confessed that he too failed to grasp the relativity idea.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0075, Library of Congress (primary): "Its originator, Dr. Albert Einstein, called on Jlr. Harding to-day with a delegation from the National Academy of Sciences. As the group posed before a camera the President confessed that lie too failed to grasp the relativity Idea." (page OCR text, item '"Relativity" beats Harding') <https://www.loc.gov/resource/sn83045774/1921-04-26/ed-1/?sp=6&st=text>
- EIN-S-0076, Library of Congress (primary): "has puzzled President Harding, who admits he fails to grasp the relativity problem." (page OCR text, item 'Puzzles President Harding') <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>
- EIN-S-0076, Library of Congress (primary): "As the group posed before a camera the President told Dr. Kinstein that he failed to understand his theory." (page OCR text, item 'Puzzles President Harding') <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0075 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_bindweed\_ver02/data/sn83045774/00271744158/1921042601/0846.xml&format=alto\_xml&full\_text=1); EIN-S-0076 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042601/0646.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** Both newspaper snapshots state that Harding acknowledged his difficulty with relativity while the group posed for a camera. Live newspaper OCR was unreachable.

**Notes:** Two newspapers, both held by LoC (one holder for G5): expected single-source unless another holder is found. OCR reads 'lie too' (he too).

### EIN-F-0093 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was with his wife Elsa in Washington, D.C., with the State, War, and Navy building in the background.

**About:** category family, place State, War, and Navy building, Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0022, Library of Congress (primary): "item.title: \[Albert Einstein with wife Elsa; State, War, and Navy building in background. Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885960/>
- EIN-S-0080, Library of Congress (primary): "item.title: \[Albert Einstein with wife Elsa; State, War, and Navy building in background. Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885962/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** What the Harris & Ewing photographs EIN-M-0005 and the companion negative LC-DIG-hec-31013 show. LoC dates both \[between 1921 and 1923\] and notes the title was devised by Library staff.

### EIN-F-0095 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** When Dr. Einstein visited the annual meeting of the National Academy of Sciences, he spoke in German and did not touch on his now famous theory.

**About:** category other

**Evidence** (open the link and find the quote):

- EIN-S-0076, Library of Congress (primary): "received an enthusiastic welcome when he visited the annual meeting of the National Academy of" (page OCR text, article 'Einstein speaks' (headline OCR garbled)) <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>
- EIN-S-0076, Library of Congress (primary): "He spoke in German and did not touch on his now famous theory." (same article) <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>
- EIN-S-0076, Library of Congress (primary): "Dr. Einstein, who spoke before the academy today, called on the President yesterday with a delegation from the National Academy of Sciences." (page OCR text, item 'Puzzles President Harding') <https://www.loc.gov/resource/sn83045462/1921-04-26/ed-1/?sp=2&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0076 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042601/0646.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains all three quoted passages and supports the claim. The live page and OCR endpoint could not be loaded.

**Notes:** Evening Star, April 26, 1921 (published the day of the talk). One holder: expected single-source.

### EIN-F-0099 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On Dec. 31, 1930, Dr. Albert Einstein arrived in San Diego enroute to Pasadena.

**About:** category other, date 1930-12-31, place San Diego, California

**Evidence** (open the link and find the quote):

- EIN-S-0082, Library of Congress (primary): "SAN DIEGO. Cal., Dec. 31. (U.R\>— Dr. Albert Einstein, famed German physicist, arrived here today enroute to Pasadena" (page OCR text, article 'Einstein arrives on coast') <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=1&st=text>
- EIN-S-0082, Library of Congress (primary): "EL CENTRO, CALIFORNIA, WEDNESDAY, DECEMBER 31, 1930" (page masthead) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=1&st=text>
- EIN-S-0081, Library of Congress (primary): "item.title: \[Einstein & Mrs. Einstein with reception committee at San Diego, Calif., Dec. 31, 1930\]" (item.title) <https://www.loc.gov/item/2022886683/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0082 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_paperflower\_ver01/data/sn92070146/0041418859A/1930123101/1203.xml&format=alto\_xml&full\_text=1); EIN-S-0081 unreachable (https://www.loc.gov/item/2022886683/?fo=json)

**Checker's reasoning:** No problem found in the snapshots; both live sources were unreachable.

**Notes:** 'enroute' is the newspaper's spelling. Round 2 (2026-10-10): EIN-S-0084 (IAS Pasadena photograph) replaced by EIN-S-0081 (LoC Prints & Photographs record of the San Diego reception, Dec. 31, 1930), which corroborates the arrival in San Diego on that date directly; the IAS record only showed him later in Pasadena. The newspaper quote itself states 'enroute to Pasadena'. Note: EIN-S-0081 says it holds unverified data from an old caption card.

### EIN-F-0102 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** As the Belgenland came into dock at San Diego, A. H. Fleming, chairman of the board of the California Institute of Technology at Pasadena, led Dr. and Frau Einstein away from the questioners.

**About:** category other, place San Diego, California

**Evidence** (open the link and find the quote):

- EIN-S-0086, Library of Congress (primary): "As the Belgenland came into dock A. H. Fleming, chairman of the board of the California Institute of Technology at Pasadena, led Dr. and Frau Einstein away from the questioners." (page OCR text, continuation 'Einstein gets great welcome in San Diego') <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=6&st=text>
- EIN-S-0086, Library of Congress (primary): "Einstein Gets Great Welcome In San Diego" (headline of the same continued article) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=6&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0086 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_paperflower\_ver01/data/sn92070146/0041418859A/1930123101/1208.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** no problem found

**Notes:** One holder (LoC newspaper): expected single-source. 'San Diego' is from the continued article's own headline.

### EIN-F-0105 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Harding, Prof. Einstein and his wife were photographed in 1921, on April 25.

**About:** category other, date 1921

**Evidence** (open the link and find the quote):

- EIN-S-0077, Library of Congress (primary): "cite\_this.chicago: Harding, Prof. Einstein & wife, 4/25/21. , 1921. \[April 25\] Photograph." (cite\_this.chicago) <https://www.loc.gov/item/2016830269/>
- EIN-S-0078, Library of Congress (primary): "cite\_this.chicago: Harding, Prof. Einstein & wife, 4/25/21. , 1921. \[April 25\] Photograph." (cite\_this.chicago) <https://www.loc.gov/item/2016830270/>

**Extractor:** claude:claude-opus-5-5 (run einstein-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T170242-bdd8, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** What the National Photo Company negatives EIN-M-0034 and EIN-M-0035 show, dated by LoC 4/25/21 ('1921. \[April 25\]'). The record names no place; event\_date is 1921 because the gate cannot assemble the day from LoC's form.

### EIN-F-0107 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** 112 Mercer Street remained Albert Einstein's home until his death in 1955.

**About:** category other, place 112 Mercer Street, Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0091, National Park Service (primary): "The Albert Einstein House in Princeton, New Jersey, is a simple two story" (Section 7, Description, first paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "In 1936 he purchased 112 Mercer Street. The house remained his home until his death in 1955." (Section 7, Description, fourth paragraph) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0057, National Park Service (institutional): "The Albert Einstein House in Princeton, New Jersey" (paragraph describing the house) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0057, National Park Service (institutional): "In 1936 he purchased 112 Mercer Street. The house remained his home until his death in 1955." (paragraph describing the house) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Split from EIN-F-0087: the address as Einstein's home, from the NHL nomination form (primary, NPS) and the NPS article (same holder).

### EIN-F-0108 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein immigrated to the United States.

**About:** category immigration

**Evidence** (open the link and find the quote):

- EIN-S-0012, Library of Congress (institutional): "Following the Nazi takeover of political power in Germany in 1933 and the onset of persecution of the German Jews, Einstein renounced his German citizenship and immigrated to the United States to take the position of Professor of Theoretical Physics at Princeton." (item.summary) <https://www.loc.gov/item/2021667583/>
- EIN-S-0060, DocsTeach (National Archives Foundation) (institutional): "Worried about growing Nazi aggression, Einstein immigrated to the United States and accepted a faculty position at Princeton University." (document description) <https://docsteach.org/document/declaration-intention-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0012 found (https://www.loc.gov/item/2021667583/); EIN-S-0060 found (https://docsteach.org/document/declaration-intention-einstein/)

**Checker's reasoning:** no problem found

**Notes:** Split from EIN-F-0007 (the 'After the Nazis seized power' wording is Nobel Prize Outreach only). Two holders in different words: LoC item record and DocsTeach (NARA education site, unregistered, secondary).

### EIN-F-0109 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1933 Albert Einstein renounced his German citizenship.

**About:** category citizenship, date 1933

**Evidence** (open the link and find the quote):

- EIN-S-0004, Nobel Prize Outreach (institutional): "He became a German citizen in 1914 and remained in Berlin until 1933 when he renounced his citizenship for political reasons" (biography, paragraph 2) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>
- EIN-S-0012, Library of Congress (institutional): "Following the Nazi takeover of political power in Germany in 1933 and the onset of persecution of the German Jews, Einstein renounced his German citizenship and immigrated to the United States to take the position of Professor of Theoretical Physics at Princeton." (item.summary) <https://www.loc.gov/item/2021667583/>
- EIN-S-0128, Library of Congress (primary): "Einstein Is to Renounce Citizenship" (page OCR (full\_text), headline) <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>
- EIN-S-0128, Library of Congress (primary): "BERLIN, March 30.—Prof. Albert Einstein has taken steps to re nounce Prussian citizenship as the" (page OCR (full\_text), item headed Einstein Is to Renounce Citizenship) <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>
- EIN-S-0128, Library of Congress (primary): "title: The daily Alaska empire (Juneau, Alaska), March 30, 1933" (title field) <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>
- EIN-S-0139, Library of Congress (primary): "Will Renounce Citizenship. It was learned here last night that Prof. Albert Einstein, who has decided to remain out of Germany and who now is in Belgium, has taken steps to renour.cc his Prussian citizenship. Prof." (page OCR (full\_text), item headed Will Renounce Citizenship) <https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3>
- EIN-S-0139, Library of Congress (primary): "date: 1933-03-30" (date field) <https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0004 found (https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/); EIN-S-0012 found (https://www.loc.gov/item/2021667583/); EIN-S-0128 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ak/batch\_ak\_commonraven\_ver01/data/sn83045499/00514159658/1933033001/0598.xml&format=alto\_xml&full\_text=1); EIN-S-0139 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_1chagall\_ver01/data/sn83045462/00280601019/1933033001/0676.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The Nobel biography states that Einstein renounced his German citizenship in 1933. The two contemporary newspaper reports describe steps toward renunciation, while the Nobel biography and Library of Congress summary describe the completed event.

**Notes:** Split from EIN-F-0014 without 'for political reasons' (which only the Nobel text and the Franklin Institute text derived from it carry): Nobel Prize Outreach and the Library of Congress each state the 1933 renunciation. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0128, the source of shipped tour record EIN-M-0078, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0128, the source of shipped tour record EIN-M-0078, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0128, the source of shipped tour record EIN-M-0078, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0139, the source of shipped tour record EIN-M-0087, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0139, the source of shipped tour record EIN-M-0087, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### EIN-F-0110 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein signed a letter to President Roosevelt.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0008, Institute for Advanced Study (institutional): "Einstein signed a letter that informed President F. D. Roosevelt of the possibility of nuclear bombs, warning that the Germans might try to build them." (1939 entry) <https://www.ias.edu/albert-einstein-brief>
- EIN-S-0061, National Park Service (institutional): "He signed a letter to President Roosevelt alerting him to the possibility of the development of atomic weapons." (biography paragraph) <https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Split from EIN-F-0089 without the month (no second holder states 'August 1939' with 'signed'): IAS and NPS (Manhattan Project pioneers page) each state it.

### EIN-F-0111 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein pursued a unified field theory.

**About:** category work

**Evidence** (open the link and find the quote):

- EIN-S-0007, Institute for Advanced Study (institutional): "During his time as an Institute Faculty member, Einstein pursued the goal of a unified field theory" (Scholars page, paragraph 2) <https://www.ias.edu/scholars/albert-einstein>
- EIN-S-0057, National Park Service (institutional): "In 1921, the Nobel Prize in Physics was awarded to Einstein, who began pursuing his dream of a unified field theory" (biography paragraph) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0002, Immigrant Hall of Honor (secondary): "Pursued the Unified Field Theory" (Accomplishments list) <https://immigranthallofhonor.org/inductees/inductee-albert-einstein/>

**Extractor:** claude:claude-opus-5-5 (run einstein-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184412-e4cd, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Split from EIN-F-0027 without the IAS-only 'Institute Faculty member' framing: IAS, NPS and the IHH page each state it.

### EIN-F-0113 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On Dec. 31, 1930, Einstein and Mrs. Einstein were with a reception committee at San Diego, Calif.

**About:** category other, date 1930-12-31, place San Diego, Calif.

**Evidence** (open the link and find the quote):

- EIN-S-0081, Library of Congress (primary): "item.title: \[Einstein & Mrs. Einstein with reception committee at San Diego, Calif., Dec. 31, 1930\]" (item.title) <https://www.loc.gov/item/2022886683/>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184453-1531, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Atomic split from EIN-F-0097/EIN-F-0099 (San Diego arrival): the LoC Prints and Photographs record EIN-S-0081 alone states the people, the place and the date. LoC notes the caption-card data is unverified.

### EIN-F-0114 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1930, Albert Einstein arrived in San Diego on the Belgenland.

**About:** category other, date 1930, place San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0083, Institute for Advanced Study (institutional): "Albert Einstein arrives in San Diego, California" (title) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0083, Institute for Advanced Study (institutional): "Albert Einstein debarks the S.S. Belgenland in San Diego, California." (Description) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0083, Institute for Advanced Study (institutional): "Date 1930" (Date) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0082, Library of Congress (primary): "SAN DIEGO. Cal., Dec. 31. (U.R\>— Dr. Albert Einstein, famed German physicist, arrived here today enroute" (page 1, Einstein Arrives On Coast) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=1&st=text>
- EIN-S-0082, Library of Congress (primary): "came in on the Belgenland" (page 1, Einstein Arrives On Coast) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=1&st=text>
- EIN-S-0082, Library of Congress (primary): "created\_published\[0\]: El Centro, Calif., December 31, 1930" (created\_published) <https://www.loc.gov/resource/sn92070146/1930-12-31/ed-1/?sp=1&st=text>
- EIN-S-0037, UCLA Library Digital Collections (institutional): "Albert Einstein and Elsa Einstein arriving by ship, San Diego, 1930" (Title) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>
- EIN-S-0037, UCLA Library Digital Collections (institutional): "View of Albert Einstein and Elsa Einstein aboard the ship, the SS Belgenland, upon their arrival in San Diego." (Description) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0083 found (https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d); EIN-S-0082 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_paperflower\_ver01/data/sn92070146/0041418859A/1930123101/1203.xml&format=alto\_xml&full\_text=1); EIN-S-0037 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690)

**Checker's reasoning:** The Library of Congress OCR and UCLA catalog could not be loaded live; their snapshots and the live IAS record support the arrival, ship, place and year.

**Notes:** Atomic split from EIN-F-0097 and EIN-F-0099, worded so each of IAS (EIN-S-0083), the Imperial Valley Press page (EIN-S-0082, LoC) and UCLA (EIN-S-0037) covers the whole claim on its own.

### EIN-F-0115 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In San Diego, Einstein was greeted by Mayor Harry C. Clark.

**About:** category other, place San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0083, Institute for Advanced Study (institutional): "Einstein and his wife, Elsa (second from left), are greeted by San Diego's mayor, Harry C. Clark" (Description) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0090, Library of Congress (primary): "SAN DIEGO. Cal.. Jan. I.—The eyes of Professor Albert Einstein" (page 12, dateline) <https://www.loc.gov/resource/sn82015313/1931-01-01/ed-1/?sp=12&st=text>
- EIN-S-0090, Library of Congress (primary): "Before speaking. Dr. Einstein was greeted by Mayor Harry C. Clark" (page 12) <https://www.loc.gov/resource/sn82015313/1931-01-01/ed-1/?sp=12&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0083 found (https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d); EIN-S-0090 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/in/batch\_in\_huxley\_ver01/data/sn82015313/0038334931A/1931010101/0012.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The Library of Congress OCR could not be loaded live; its snapshot and the live IAS record contain the cited passages.

**Notes:** Atomic split from EIN-F-0098 (drops the wife, which the Indianapolis Times page does not name), so IAS (EIN-S-0083) and the Indianapolis Times (EIN-S-0090, LoC) each cover the whole claim.

### EIN-F-0116 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was at The Athenaeum, California Institute of Technology.

**About:** category career, place The Athenaeum, California Institute of Technology

**Evidence** (open the link and find the quote):

- EIN-S-0085, Smithsonian Institution (institutional): "Dr. Albert Einstein (1879-1955), Berlin Academy of Sciences" (Summary) <https://siarchives.si.edu/collections/siris_arc_393240>
- EIN-S-0085, Smithsonian Institution (institutional): "One of a series of photographs taken at The Athenaeum, California Institute of Technology, February 1931." (Summary) <https://siarchives.si.edu/collections/siris_arc_393240>
- EIN-S-0084, Institute for Advanced Study (institutional): "Albert Einstein dines at The Athenaeum on the campus of Caltech (California Institute of Technology) in Pasadena, California." (Description) <https://albert.ias.edu/entities/archivalmaterial/7ca4dfb1-5c92-4d57-b3e8-071540aadce8>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184453-1531, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Atomic split from EIN-F-0100: without the date (IAS gives only circa 1930-1931) and Pasadena (the Smithsonian record lacks it), so the Smithsonian (EIN-S-0085) and IAS (EIN-S-0084) each cover the whole claim.

### EIN-F-0117 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein and Warren Harding were with a group at the White House, Washington, D.C.

**About:** category other, place White House, Washington, D.C.

**Evidence** (open the link and find the quote):

- EIN-S-0021, Library of Congress (primary): "item.title: \[Albert Einstein, Warren Harding and group at White House, Washington, D.C.\]" (item.title) <https://www.loc.gov/item/2016885955/>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184453-1531, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Atomic split from EIN-F-0104 (refuted for joining this undated record with the 4/25/21 date of another photograph): the LoC record EIN-S-0021 alone, no date (LoC dates it between 1921 and 1923).

### EIN-F-0118 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Prof. Einstein and his wife were photographed in 1921.

**About:** category other, date 1921

**Evidence** (open the link and find the quote):

- EIN-S-0079, Library of Congress (primary): "cite\_this.chicago: Prof. Einstein & wife. , 1921. Photograph." (cite\_this.chicago) <https://www.loc.gov/item/2016830271/>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184453-1531, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** The LoC National Photo Company record EIN-S-0079 (LoC: date from negatives in same range). Washington, D.C. 1921 room.

### EIN-F-0120 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1930, Albert Einstein and Elsa Einstein arrived in San Diego on the Belgenland.

**About:** category other, date 1930, place San Diego

**Evidence** (open the link and find the quote):

- EIN-S-0083, Institute for Advanced Study (institutional): "Albert Einstein arrives in San Diego, California" (title) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0083, Institute for Advanced Study (institutional): "Albert Einstein debarks the S.S. Belgenland in San Diego, California. Einstein and his wife, Elsa (second from left), are greeted" (Description) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0083, Institute for Advanced Study (institutional): "Einstein, Elsa, 1876-1936" (Subject) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0083, Institute for Advanced Study (institutional): "Date 1930" (Date) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>
- EIN-S-0037, UCLA Library Digital Collections (institutional): "Albert Einstein and Elsa Einstein arriving by ship, San Diego, 1930" (Title) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>
- EIN-S-0037, UCLA Library Digital Collections (institutional): "View of Albert Einstein and Elsa Einstein aboard the ship, the SS Belgenland, upon their arrival in San Diego." (Description) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>

**Extractor:** claude:claude-opus-5-5 (run einstein-new-rooms-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6df4, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0083 found (https://albert.ias.edu/20.500.12111/1243); EIN-S-0037 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690)

**Checker's reasoning:** no problem found

**Notes:** Atomic split from EIN-F-0097, cited to IAS (EIN-S-0083, institutional, browser snapshot) and UCLA (EIN-S-0037, unregistered, http), each covering the whole claim. Same event as EIN-F-0114, whose Codex verdict recorded quote\_in\_live 'unreachable' because the LoC OCR service it also cites could not be reached.

### EIN-F-0121 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1921, Prof. Albert Einstein was at the meeting of the National Academy of Sciences at the Smithsonian Institution.

**About:** category other, date 1921, place Smithsonian Institution

**Evidence** (open the link and find the quote):

- EIN-S-0092, Nature, volume 107, page 539 (1921) (institutional): "THE annual meeting of the National Academy of Sciences was held at the Smithsonian Institution on April 25–27. Unusual interest was taken in the meetings owing to the presence of his Serene Highness Albert I., Prince of Monaco, Prof, and Mrs. Albert Einstein" (Abstract) <https://www.nature.com/articles/107539a0>
- EIN-S-0092, Nature, volume 107, page 539 (1921) (institutional): "Nature volume 107, pages 539–540 (1921)" (citation line) <https://www.nature.com/articles/107539a0>
- EIN-S-0074, Library of Congress (primary): "at meeting here Dr. Einstein and Prince ol Monaco Guests of National Academy of Sciences." (page OCR text, headline of the article 'Noted scientists at meeting here') <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>
- EIN-S-0074, Library of Congress (primary): "Prof. Albert Einstein, author of the theory of relativity" (page OCR text, article 'Noted scientists at meeting here') <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>
- EIN-S-0074, Library of Congress (primary): "were the guests at luncheon today at the Smithsonian Institution of the National Academy of Sciences" (page OCR text, article 'Noted scientists at meeting here') <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>
- EIN-S-0074, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., April 25, 1921" (created\_published (page date and place)) <https://www.loc.gov/resource/sn83045462/1921-04-25/ed-1/?sp=2&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-registry-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0092 found (https://www.nature.com/articles/107539a0.pdf); EIN-S-0074 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_babelfish\_ver01/data/sn83045462/00280656926/1921042501/0622.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** no problem found

**Notes:** Washington 1921 room, after the owner-approved Nature entry (2026-10-10). Two holders, each covering the whole claim: Nature 107:539 (registered single-record entry, institutional) and the Library of Congress Evening Star page of April 25, 1921 (secondary). Nature does not name Washington, D.C. or the White House and dates the meeting April 25-27 without a year in the same sentence, so the claim keeps the year and the Smithsonian Institution only; the White House reception stays in EIN-F-0090.

### EIN-F-0122 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On October 17, 1933, Einstein arrived in New York on the Red Star liner Westernland.

**About:** category immigration, date 1933-10-17, place New York

**Evidence** (open the link and find the quote):

- EIN-S-0101, Library of Congress (primary): "NEW YORK. Oct. 17." (page OCR text, article 'Einstein Arrives' (dateline)) <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "bert Einstein, scientist officially" (page OCR text, article 'Einstein Arrives') <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "mathematician arrived on the Red j Star liner. Westernland." (page OCR text, article 'Einstein Arrives') <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "created\_published\[0\]: Brownsville, Tex., October 17, 1933" (created\_published\[0\]) <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0101 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/txdn/batch\_txdn\_ferguson\_ver01/data/sn86063730/00340587741/1933101701/0286.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains every quoted passage and states the arrival, date, place, and ship. The live OCR source could not be loaded.

**Notes:** Travel leg into the New York stop (Associated Press report). Ship-name spelling differs across LoC pages: 'Westernland' in the AP (EIN-S-0101), UP (EIN-S-0102) and Washington Times (EIN-S-0103) texts; 'S. S. Westerland' in a photo caption on EIN-S-0104 and in the Henderson Daily Dispatch AP text of the same day (not staged). Wikipedia/Isaacson-derived web results say 'Westmoreland'; not used. All staged sources are LoC newspaper pages (one holder, secondary), so this stays single-source until an institutional or primary record (e.g. a passenger manifest) is found.

### EIN-F-0123 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On October 17, 1933, Prof. Albert Einstein was taken off the liner Westernland at Quarantine and sped ashore by tug.

**About:** category immigration, date 1933-10-17, place New York

**Evidence** (open the link and find the quote):

- EIN-S-0102, Library of Congress (primary): "as Einstein Lands at N. Y." (page OCR text, headline) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>
- EIN-S-0102, Library of Congress (primary): "NEW YORK—Prof. Albert Ein stein was secretly taken off the liner Westernland at Quarantine today and sped ashore by tug" (page OCR text, United Press report) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>
- EIN-S-0102, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., October 17, 1933" (created\_published\[0\]) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0102 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_drake\_ver01/data/sn82016181/00529046297/1933101701/1207.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found in the snapshot; the live source was unreachable.

**Notes:** Travel leg: ship to shore by tug (United Press). The Washington Times of the same day (EIN-S-0103) says he was 'whisked from their liner to a tug'; its photo caption the next day (EIN-S-0104) says 'by launch'. One holder (LoC).

### EIN-F-0124 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On October 17, 1933, the Einstein party landed at the Battery in New York.

**About:** category immigration, date 1933-10-17, place The Battery, New York

**Evidence** (open the link and find the quote):

- EIN-S-0102, Library of Congress (primary): "as Einstein Lands at N. Y." (page OCR text, headline) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>
- EIN-S-0102, Library of Congress (primary): "NEW YORK—Prof. Albert Ein" (page OCR text, United Press report (dateline)) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>
- EIN-S-0102, Library of Congress (primary): "But at the Battery, where the party landed" (page OCR text, United Press report) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>
- EIN-S-0102, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., October 17, 1933" (created\_published\[0\]) <https://www.loc.gov/resource/sn82016181/1933-10-17/ed-1/?sp=5&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0102 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_drake\_ver01/data/sn82016181/00529046297/1933101701/1207.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found in the snapshot; the live source was unreachable.

**Notes:** Landing place for the New York stop. The Washington Times (EIN-S-0103) also says 'landed at the bat\\ntery' (OCR split). One holder (LoC).

### EIN-F-0125 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Einstein arrived accompanied by Mrs. Einstein and Dr Walther Mayer, of Vienna, his assistant.

**About:** category immigration, date 1933-10-17, place New York

**Evidence** (open the link and find the quote):

- EIN-S-0101, Library of Congress (primary): "NEW YORK. Oct. 17." (page OCR text, article 'Einstein Arrives' (dateline)) <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "bert Einstein, scientist officially" (page OCR text) <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "Accompanied by Mrs. Einstein and Dr Walther Mayer, of Vienna, his assistant, the distinguished mathematician arrived" (page OCR text, article 'Einstein Arrives') <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>
- EIN-S-0101, Library of Congress (primary): "created\_published\[0\]: Brownsville, Tex., October 17, 1933" (created\_published\[0\]) <https://www.loc.gov/resource/sn86063730/1933-10-17/ed-1/?sp=1&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0101 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/txdn/batch\_txdn\_ferguson\_ver01/data/sn86063730/00340587741/1933101701/0286.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains every quoted passage and states that Mrs. Einstein and Dr Walther Mayer accompanied him on the dated New York arrival. The live OCR source could not be loaded.

**Notes:** Travelling party on the Westernland. The Washington Times (EIN-S-0103) adds 'Eileen Du\\nkas, Mrs. Einstein's secretary' (OCR of Helen Dukas's name is uncertain; not used).

### EIN-F-0126 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In October 1933, Prof. Einstein came to Princeton by automobile after he had debarked from the liner.

**About:** category immigration, date 1933-10, place Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0104, Library of Congress (primary): "PRINCETON, N. J„ Oct. 18" (page OCR text, article 'Einstein Shuns Limelight' (dateline)) <https://www.loc.gov/resource/sn84026749/1933-10-18/ed-1/?sp=1&st=text>
- EIN-S-0104, Library of Congress (primary): "Prof. Einstein came here last night after he had debarked from the liner Westemland and hur ried to Princeton by automobile" (page OCR text, article 'Einstein Shuns Limelight') <https://www.loc.gov/resource/sn84026749/1933-10-18/ed-1/?sp=1&st=text>
- EIN-S-0104, Library of Congress (primary): "NO. 16,294 WEDNESDAY, OCTOBER 18, 1933" (page OCR text, masthead) <https://www.loc.gov/resource/sn84026749/1933-10-18/ed-1/?sp=1&st=text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-einstein-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0104 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/dlc/batch\_dlc\_deanwood\_ver01/data/sn84026749/0020569657A/1933101801/1221.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** No problem found in the snapshot; the live OCR source was unreachable.

**Notes:** Travel leg New York -\> Princeton (INS report). 'last night' relative to the Oct. 18 dateline is Oct. 17; event\_date is kept to the month the page states.

### EIN-F-0128 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** When Albert Einstein first came to Princeton in 1933, he lived at 2 Library Place.

**About:** category other, date 1933, place 2 Library Place, Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0091, National Park Service (primary): "When Albert Einstein first came to Princeton in 1933, he lived at 2 Library Place." (Section 7, description, paragraph 3) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0057, National Park Service (institutional): "When Albert Einstein first came to Princeton in 1933, he lived at 2 Library Place." (Albert Einstein House paragraph) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0091 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297\_text); EIN-S-0057 found (https://www.nps.gov/articles/alberteinstein.htm)

**Checker's reasoning:** No problem found.

**Notes:** First Princeton residence (1933 stop). NHL nomination form (primary, NPS) and the NPS article (same holder, follows the nomination's wording).

### EIN-F-0132 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1976, the house at 112 Mercer Street in Princeton was designated a National Historic Landmark.

**About:** category legacy, date 1976, place 112 Mercer Street, Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0093, Institute for Advanced Study (institutional): "112 Mercer Street in Princeton, New Jersey, served as the residence" (paragraph 1) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0093, Institute for Advanced Study (institutional): "In 1976, the house was designated a U.S. National Historic Landmark" (paragraph 8) <https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton>
- EIN-S-0057, National Park Service (institutional): "The Albert Einstein House in Princeton, New Jersey" (Albert Einstein House paragraph) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0057, National Park Service (institutional): "In 1936 he purchased 112 Mercer Street." (Albert Einstein House paragraph) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0057, National Park Service (institutional): "The Albert Einstein House was designated a National Historic Landmark by the Secretary of Interior on January 7, 1976." (Albert Einstein House paragraph) <https://www.nps.gov/articles/alberteinstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0093 found (https://www.ias.edu/albert-einsteins-house-112-mercer-street-princeton); EIN-S-0057 found (https://www.nps.gov/articles/alberteinstein.htm)

**Checker's reasoning:** no problem found

### EIN-F-0133 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The Albert Einstein House underwent no interior or exterior alterations or changes since Einstein lived there.

**About:** category other, place Princeton, New Jersey

**Evidence** (open the link and find the quote):

- EIN-S-0091, National Park Service (primary): "The Albert Einstein House in Princeton, New Jersey, is a simple two story" (Section 7, description, paragraph 1) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "Albert Einstein House underwent no interior or exterior alterations or changes since Einstein lived there." (Section 7, description, paragraph 3) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0091 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297\_text)

**Checker's reasoning:** No problem found.

**Notes:** Statement of the NHL nomination form (prepared for the 1976 designation). Relevant to how far post-1955 interior photographs (Jack Burnett 1969, Gayle Kerley 1986) reflect the rooms as he left them; that inference is not itself a fact here.

### EIN-F-0134 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Since 1955 Einstein's stepdaughter Margot has owned the house.

**About:** category family, date 1955, place 112 Mercer Street, Princeton

**Evidence** (open the link and find the quote):

- EIN-S-0091, National Park Service (primary): "In 1936 he purchased 112 Mercer Street." (Section 7, paragraph 3) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "Princeton" (Section 7, paragraph 3) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>
- EIN-S-0091, National Park Service (primary): "Since 1955 Einstein's stepdaughter Margot has owned the house." (Section 7, paragraph 3) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0091 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297\_text)

**Checker's reasoning:** No problem found.

**Notes:** As stated in the NHL nomination form (1976).

### EIN-F-0135 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Alexander Sachs delivered Einstein's letter to President Roosevelt on October 11, 1939.

**About:** category work, date 1939-10-11

**Evidence** (open the link and find the quote):

- EIN-S-0072, U.S. National Archives and Records Administration (institutional): "inform President Roosevelt immediately" (paragraph 1) <https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/>
- EIN-S-0072, U.S. National Archives and Records Administration (institutional): "was drafted for Einstein’s signature." (paragraph 2) <https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/>
- EIN-S-0072, U.S. National Archives and Records Administration (institutional): "This August 2, 1939 letter was personally delivered to the President on October 11, 1939 (the outbreak of the war intervened) by Alexander Sachs" (paragraph 3) <https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/>
- EIN-S-0068, Library of Congress (institutional): "Szilard spoke to economist Alexander Sachs,who was a friend of Roosevelt’s, and suggested Einstein should warn the president" (paragraph 3) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0068, Library of Congress (institutional): "Einstein and Szilard began work on the letter for President Roosevelt" (paragraph 4) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0068, Library of Congress (institutional): "he waited until he could secure a meeting with Roosevelt on October 11, 1939, to deliver it." (paragraph 6) <https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/>
- EIN-S-0106, DocsTeach (National Archives Foundation) (institutional): "Sachs personally delivered the letter to Roosevelt on October 11, 1939." (description) <https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/>
- EIN-S-0106, DocsTeach (National Archives Foundation) (institutional): "This item is a letter to President Franklin D. Roosevelt from Albert Einstein" (description) <https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/>

**Extractor:** claude:claude-opus-5-5 (run einstein-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0072 found (https://fdr.blogs.archives.gov/2011/10/13/found-in-the-archives-15/); EIN-S-0068 found (https://blogs.loc.gov/law/2020/08/einsteins-fateful-letter/); EIN-S-0106 found (https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/)

**Checker's reasoning:** no problem found

**Notes:** 1939 letter stop. FDR Library blog (NARA) and Law Library of Congress blog, two registered holders. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0106, the source of shipped tour record EIN-M-0063, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from EIN-S-0106, the source of shipped tour record EIN-M-0063, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### EIN-F-0138 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** On 1 Sept. 1943, Dr. Albert Einstein at Princeton, N.J. is engaged in research work for the U.S. Navy.

**About:** category career, date 1943-09-01, place Princeton, N.J.

**Evidence** (open the link and find the quote):

- EIN-S-0107, U.S. National Archives and Records Administration (primary): "DATE 1 Sept. 1943" (scopeAndContentNote (original caption)) <https://catalog.archives.gov/id/276538322>
- EIN-S-0107, U.S. National Archives and Records Administration (primary): "Dr. Albert Einstein at Princeton, N.J. where he is engaged in research work for the U.S. Navy." (scopeAndContentNote (original caption)) <https://catalog.archives.gov/id/276538322>

**Extractor:** claude:claude-opus-5-5 (run einstein-docs-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0107 unreachable (https://catalog.archives.gov/proxy/records/search?naId=276538322)

**Checker's reasoning:** Both quoted passages appear in the snapshot and jointly state the research activity, date, and place. The live API and catalog page were unreachable, and a web search returned no results.

**Notes:** Navy photograph 80-G-42917; companion of the 24 July 1943 study photographs (EIN-F-0055). Princeton room / Stop 6.

### EIN-F-0146 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein was awarded the 1921 Nobel Prize for Physics.

**About:** category award

**Evidence** (open the link and find the quote):

- EIN-S-0057, National Park Service (institutional): "In 1921, the Nobel Prize in Physics was awarded to Einstein" (paragraph on 1921) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein Nobel Prize in Physics 1921" (laureate facts box) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Affiliation at the time of the award" (laureate facts box) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0091, National Park Service (primary): "Einstein was the recipient of almost every award and honor that society can bestow upon a scientist including the 1921 Nobel Prize for Physics" (NHL nomination, statement of significance) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_text>

**Extractor:** claude:claude-opus-5-5 (run einstein-euro-2026-10-22, 2026-10-22) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T010434-2745, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0057 found (https://www.nps.gov/articles/alberteinstein.htm); EIN-S-0003 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/facts/); EIN-S-0091 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297\_text)

**Checker's reasoning:** The claim identifies the 1921 prize, without asserting that Einstein received it in 1921; the Nobel snapshot specifies receipt in 1922. All snapshot quotes match, and both live NPS sources contain their quoted passages; the Nobel page was unreachable.

**Notes:** Chapter 9 (why the Hall honours him), lead ruling 2026-10-22. The NHL form (EIN-S-0091) words the prize motivation differently ('For his contributions to mathematical physics'); the motivation fact cites only the Nobel page and the NPS article, which agree.

### EIN-F-0147 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein received his Nobel Prize in 1922.

**About:** category award, date 1922

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein received his Nobel Prize one year later, in 1922." (laureate facts box) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0061, National Park Service (institutional): "In 1922 he received a Nobel Prize for Physics" (biography paragraph) <https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-euro-2026-10-22, 2026-10-22) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T010434-2745, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0003 found (https://www.nobelprize.org/prizes/physics/1921/einstein/facts/?trk=public\_post\_comment-text); EIN-S-0061 found (https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm)

**Checker's reasoning:** Both snapshots contain the quotes, and both sources explicitly state receipt in 1922. Nobel’s passage was readable through web search despite direct-fetch blocking.

**Notes:** Chapter 9. The 1921 prize was received in 1922 (Nobel page).

### EIN-F-0148 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein received a Nobel Prize for Physics for his services to theoretical physics, and especially for his discovery of the law of the photoelectric effect.

**About:** category award

**Evidence** (open the link and find the quote):

- EIN-S-0003, Nobel Prize Outreach (institutional): "Albert Einstein received his Nobel Prize one year later, in 1922." (laureate facts box) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0003, Nobel Prize Outreach (institutional): "Prize motivation: “for his services to Theoretical Physics, and especially for his discovery of the law of the photoelectric effect”" (laureate facts box) <https://www.nobelprize.org/prizes/physics/1921/einstein/facts/>
- EIN-S-0061, National Park Service (institutional): "In 1922 he received a Nobel Prize for Physics, for “his services to theoretical physics, and especially for his discovery of the law of the photoelectric effect.”" (biography paragraph) <https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm>

**Extractor:** claude:claude-opus-5-5 (run einstein-euro-2026-10-22, 2026-10-22) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T010434-2745, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0003 found (https://www.nobelprize.org/prizes/physics/1921/einstein/facts/?trk=public\_post\_comment-text); EIN-S-0061 found (https://www.nps.gov/people/manhattan-project-pioneers-albert-einstein.htm)

**Checker's reasoning:** All evidence quotes appear in the snapshots and live-source text, supporting one prize award with its stated motivation. Nobel’s passages were readable through web search despite direct-fetch blocking.

**Notes:** Chapter 9. Prize motivation as worded by the Nobel page and the NPS article.

### EIN-F-0150 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Einstein delivered an address at Gottenberg, Sweden, before a scientific body on his theory of relativity.

**About:** category career, place Gottenberg, Sweden

**Evidence** (open the link and find the quote):

- EIN-S-0125, Library of Congress (primary): "Gottenberg, Sweden (J. T. A.) —Pro- fessor Einstein delivered an address here before a scientific body on his theory of relativity." (page 4, item "Swedish King and Einstein Enjoy Chat" (OCR full text)) <https://www.loc.gov/resource/sn92051392/1923-08-03/ed-1/?sp=4>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-5f41, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0125 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ct/batch\_ct\_hashbrown\_ver01/data/sn92051392/00516996493/1923080301/1524.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains the quotation and explicitly supports the claim and place. Live verification was unavailable; reachability is reported separately as instructed.

**Notes:** Ratio-lift RL-F-001, first half (split per the task 14b ruling: one event per fact). "Gottenberg" is the paper's spelling of Gothenburg; the claim keeps it (G2). event\_date left empty: the item gives no date and the issue date (1923-08-03) is not the event's. Chapter einstein/honoured (Gothenburg lecture hall room; EIN-F-0149 names the hall's event).

### EIN-F-0151 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** King Gustaf was among those present at Einstein's address at Gottenberg, Sweden.

**About:** category award, place Gottenberg, Sweden

**Evidence** (open the link and find the quote):

- EIN-S-0125, Library of Congress (primary): "Gottenberg, Sweden (J. T. A.) —Pro- fessor Einstein delivered an address here" (page 4, item "Swedish King and Einstein Enjoy Chat" (OCR full text)) <https://www.loc.gov/resource/sn92051392/1923-08-03/ed-1/?sp=4>
- EIN-S-0125, Library of Congress (primary): "Among those present was King Gustaf." (page 4, same item) <https://www.loc.gov/resource/sn92051392/1923-08-03/ed-1/?sp=4>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-5f41, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0125 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ct/batch\_ct\_hashbrown\_ver01/data/sn92051392/00516996493/1923080301/1524.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** Both quotations appear in the snapshot; their continuous context identifies King Gustaf as present at Einstein's address in Gottenberg, Sweden. Live verification was unavailable; reachability is reported separately as instructed.

**Notes:** Ratio-lift RL-F-001, second half (split per the task 14b ruling). Chapter einstein/honoured.

### EIN-F-0153 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein informed the German Consulate in Brussels that he is renouncing his German citizenship.

**About:** category citizenship, place Brussels

**Evidence** (open the link and find the quote):

- EIN-S-0127, Library of Congress (primary): "Einstein Renounces German Citizenship." (page 4, headline (OCR full text)) <https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4>
- EIN-S-0127, Library of Congress (primary): "Professor Albert Einstein, world famous scientist, has informed the German Consulate in Brussels, that he Is renouncing his German citi zenship" (page 4, item datelined ANTWERP, Belgium, Mar. 30) <https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-5f41, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0127 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/iune/batch\_iune\_fluorite\_ver01/data/sn84020097/0033289741A/1933033101/0324.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** Both quotes appear in the snapshot and support the single notification event and Brussels consulate location. The live catalog and OCR endpoints could not be loaded; live reachability remains unverified.

**Notes:** Ratio-lift RL-F-003. OCR splits "citizenship" in the body; the headline carries the word. event\_date left empty: the dateline gives Mar. 30 without the year. Chapter einstein/leaving (no photograph of the place found).

### EIN-F-0154 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Prof. Einstein landed in Brussels from his trip to the United States.

**About:** category immigration, place Brussels

**Evidence** (open the link and find the quote):

- EIN-S-0128, Library of Congress (primary): "Prof. Einstein landed in Brussels yesterday from his trip to the United States." (page 1, item "Einstein Is to Renounce Citizenship" (OCR full text)) <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-5f41, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0128 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/ak/batch\_ak\_commonraven\_ver01/data/sn83045499/00514159658/1933033001/0598.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains the exact passage and supports the single arrival event in Brussels without added information. The live catalog and OCR endpoints could not be loaded.

**Notes:** Ratio-lift research (RL-S-004, cited under RL-F-003). The item is datelined BERLIN, March 30 and says "yesterday"; event\_date left empty. Chapter einstein/leaving.

### EIN-F-0156 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Albert Einstein's special theory of relativity is from 1905.

**About:** category work, date 1905

**Evidence** (open the link and find the quote):

- EIN-S-0057, National Park Service (institutional): "It was also in 1905 that Einstein introduced the concept of “special relativity,” which is a theory of space-time" (NPS article, paragraph on 1905) <https://www.nps.gov/articles/alberteinstein.htm>
- EIN-S-0004, Nobel Prize Outreach (institutional): "Special Theory of Relativity (1905)" (Biographical, list of his more important works) <https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/>

**Extractor:** claude:claude-opus-5-5 (run round7-2026-10-27, 2026-10-27) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0057 found (https://www.nps.gov/articles/alberteinstein.htm); EIN-S-0004 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/)

**Checker's reasoning:** Both snapshot quotes support the single claim and its date; the NPS live passage matches. The Nobel page returned HTTP 403, although its search excerpt contains the quoted passage.

**Notes:** Round 7. Reworded from the research candidate R7-F-002 ('first proposed the theory of relativity in 1905', LoC EIN-S-0012 + NobelPrize.org EIN-S-0004): the Nobel quote lacks 'first' and 'proposed', so only the LoC source covered that claim (one holder). This claim uses only words both holders' quotes contain (NPS, Nobel Prize Outreach). Supports showing the first page of 'Zur Elektrodynamik bewegter Körper' (1905).

### EIN-F-0157 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In October 1933, Prof. Albert Einstein sailed for New York from Southampton, England.

**About:** category immigration, date 1933-10, place Southampton, England

**Evidence** (open the link and find the quote):

- EIN-S-0135, Library of Congress (primary): "SOUTHAMPTON. England. October 7 (/?•).—Prof. Albert Einstein sailed for New York tonight" (full\_text, page 3, 'EINSTEIN SAILS FOR U. S.' (AP)) <https://www.loc.gov/resource/sn83045462/1933-10-08/ed-1/?sp=3>
- EIN-S-0135, Library of Congress (primary): "created\_published\[0\]: Washington, D.C., October 8, 1933" (record field created\_published\[0\]) <https://www.loc.gov/resource/sn83045462/1933-10-08/ed-1/?sp=3>

**Extractor:** claude:claude-opus-5-5 (run round9-2026-10-29, 2026-10-29) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-round9-einstein-2026-10-29b, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0135 unreachable (https://www.loc.gov/resource/sn83045462/1933-10-08/ed-1/?sp=3&fo=json)

**Checker's reasoning:** The snapshot contains both quoted passages, which together support the claim. The live source could not be loaded.

**Notes:** Round 9 (globe-to-map, 2026-10-29): the departure leg of the 1933 crossing that ends in EIN-F-0122 (arrived New York on the Westernland, October 17, 1933). The AP text spells the liner 'Western Land'; the claim leaves the ship out (EIN-F-0122 carries it). Same text: his wife 'had embarked at Antwerp' (the liner's earlier port; not claimed for him). A Springfield weekly Republican item (1933-10-19, p. 14) says the Westernland called at Halifax, N. S., on October 15 on the way; not staged. Washington Journal (German-language) 1933-10-13 p. 8 says the same in German; not used (G2 is English-only). Claim reworded before adversary review (2026-10-29): 'On October 7, 1933' failed G2 (the dateline's day and the paper's year are in separate quotes); the dateline gives October 7.

## 5. Pending: not checked yet, or a check failed (0)

None.

## 6. Verified and already approved or edited (0)

None.

## 7. Media (92)

### EIN-M-0001 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein on a 1966 stamp (image) <https://commons.wikimedia.org/wiki/File:Albert_Einstein_on_a_1966_stamp.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Albert_Einstein_on_a_1966_stamp.jpg>

**Credit:** USPS

**Alt text** (published as the image description): US stamp honoring Albert Einstein

**Sources:** EIN-S-0005

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The live Commons page/API shows “Public domain,” but the rights statement is from Wikimedia Commons metadata/templates rather than the item holder. The record's license\_class “unknown” is not entailed by “Public domain,” and the credit/title/alt text add holder-unsupported descriptive claims.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Holder check 2026-10-09 (Commons source link followed): the Commons Source field reads 'USPS (Originally uploaded on en.wikipedia)' with no link; no holder item page to fetch, so no holder rights statement; stays disputed. license\_class changed public-domain -\> unknown: the Commons 'Public domain' is an uploader claim (media rules), so the item is linked, not embedded.

### EIN-M-0002 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** America gains a famous citizen (image) <https://www.loc.gov/item/2004672481/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known copyright restriction. For information see "New York World-Telegram & ...," https://www.loc.gov/rr/print/res/076\_nyw.html" <https://www.loc.gov/rr/print/res/076_nyw.html>

**Credit:** Library of Congress, Prints & Photographs Division, NYWT&S Collection, LC-DIG-ppmsca-05649. Photo by Al. Aumuller.

**Alt text** (published as the image description): Photograph shows Albert Einstein receiving from Judge Phillip Forman his certificate of American citizenship.

**Sources:** EIN-S-0019

**Independent checker:** codex:gpt-5.5 (run adv-20261009T195820-991c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions' is not a statement that the item is in the public domain, so unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known copyright restriction. For information see "New York World-Telegram ...', with the staff photographer credited in the holder's record ('NYWT&S staff photograph.'). Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0003 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Washington, D.C. (image) <https://www.loc.gov/item/2016885961/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and Restrictions Information https://www.loc.gov/rr/print/res/140\_harr.html" <https://www.loc.gov/rr/print/res/140_harr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Harris & Ewing Collection, LC-DIG-hec-31012.

**Alt text** (published as the image description): Albert Einstein, Washington, D.C. Glass negative by Harris & Ewing, photographer, between 1921 and 1923.

**Sources:** EIN-S-0020

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions' is not a statement that the item is in the public domain, so unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see Harris & Ewin...'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0004 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Warren Harding and group at White House, Washington, D.C. (image) <https://www.loc.gov/item/2016885955/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and Restrictions Information https://www.loc.gov/rr/print/res/140\_harr.html" <https://www.loc.gov/rr/print/res/140_harr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Harris & Ewing Collection, LC-DIG-hec-31006.

**Alt text** (published as the image description): Albert Einstein, Warren Harding and group at White House, Washington, D.C. Glass negative by Harris & Ewing, photographer, between 1921 and 1923.

**Sources:** EIN-S-0021

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions' is not a statement that the item is in the public domain, so unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see Harris & Ewin...'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0005 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein with wife Elsa, Washington, D.C. (image) <https://www.loc.gov/item/2016885960/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and Restrictions Information https://www.loc.gov/rr/print/res/140\_harr.html" <https://www.loc.gov/rr/print/res/140_harr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Harris & Ewing Collection, LC-DIG-hec-31011.

**Alt text** (published as the image description): Albert Einstein with wife Elsa; State, War, and Navy building in background. Washington, D.C. Glass negative by Harris & Ewing, photographer, between 1921 and 1923.

**Sources:** EIN-S-0022

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions' is not a statement that the item is in the public domain, so unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see Harris & Ewin...'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0006 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, 1879-1955 (image) <https://www.loc.gov/item/2004671908/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)." <https://www.loc.gov/item/2004671908/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-60242. Photograph by Orren Jack Turner, Princeton, N.J.

**Alt text** (published as the image description): Photograph shows Albert Einstein, head-and-shoulders portrait, facing slightly right. Copyright by Orren Jack Turner, Princeton, N.J.

**Sources:** EIN-S-0023

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions' is not a statement that the item is in the public domain, so unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. No renewal in Copyright office (checked...'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0007 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein lived here (image) <https://www.loc.gov/item/00652204/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Publication may be restricted. For information see "Herbert Block ("Herblock") Rights and Restrictions," https://www.loc.gov/rr/print/res/271\_herb.html" <https://www.loc.gov/rr/print/res/271_herb.html>

**Credit:** Library of Congress, Prints & Photographs Division, Herbert L. Block (Herblock) collection, LC-USZ62-126902. Herblock, copyright 1955 by The Washington Post Co.

**Alt text** (published as the image description): Editorial cartoon showing Earth from outer space, with a sign proclaiming "Albert Einstein lived here". Herblock, published in the Washington Post, April 19, 1955.

**Sources:** EIN-S-0013

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** 'Publication may be restricted' states a possible restriction, not a licence or a definite restriction, so unknown; link only.

### EIN-M-0008 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, head-and-shoulders portrait, facing front (image) <https://www.loc.gov/item/2004672479/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions...," https://www.loc.gov/rr/print/195\_copr.html" <https://www.loc.gov/rr/print/195_copr.html>

**Credit:** Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-05640. Drawing by R. Kastor.

**Alt text** (published as the image description): Albert Einstein, head-and-shoulders portrait, facing front. Ink drawing by R. Kastor that includes holograph inscription and signature of sitter.

**Sources:** EIN-S-0024

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Rights status not evaluated by the holder.

### EIN-M-0009 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein at the meeting in aid of the refugee assistance fund at Royal Albert Hall, London (image) <https://www.loc.gov/item/2022886691/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions ...," https://hdl.loc.gov/loc.pnp/res.195.copr" <https://hdl.loc.gov/loc.pnp/res.195.copr>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-16650.

**Alt text** (published as the image description): Albert Einstein, full length, seated on stage with Oliver Stillingflett Locker Lampson, Ernest Ruterford, Sir Austen Chamberlain, and others; at the meeting in aid of the refugee assistance fund at Royal Albert Hall, London, 1933.

**Sources:** EIN-S-0025

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Rights status not evaluated by the holder.

### EIN-M-0010 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein at 72 presents awards (image) <https://www.loc.gov/item/2003688218/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Publication may be restricted. For information see "New York World-Telegram & ..." (http://lcweb.loc.gov/rr/print/res/076\_nyw.html)" <https://www.loc.gov/rr/print/res/076_nyw.html>

**Credit:** Library of Congress, Prints & Photographs Division, NYWT&S Collection, LC-USZ62-133518. Associated Press photograph.

**Alt text** (published as the image description): Albert Einstein (left) presents the first Albert Einstein award for achievement in the natural sciences to Kurt Godel (second from right) and Julian Schwinger (right) as Lewis L. Stauss looks on. 1951 March 14.

**Sources:** EIN-S-0026

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Associated Press photograph; 'Publication may be restricted' is a possible restriction, so unknown; link only. rights\_url given as https because the holder's link is http://lcweb.loc.gov.

### EIN-M-0011 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Time Card for Albert Einstein (document) <https://catalog.archives.gov/id/597840>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Restricted - Fully" <https://catalog.archives.gov/id/597840>

**Credit:** National Archives at St. Louis, Records of the U.S. Civil Service Commission, NAID 597840.

**Alt text** (published as the image description): Timekeeping record for Albert Einstein when he was working as a consultant to the United States Government during World War II.

**Sources:** EIN-S-0039

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA use restriction 'Restricted - Fully' with note 'The civilian personnel records are not open for public inspection.' A page image is nonetheless listed in digitalObjects; link only.

### EIN-M-0012 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein and Prime Minister Nehru (image) <https://catalog.archives.gov/id/348448945>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/348448945>

**Credit:** Harry S. Truman Library, National Archives and Records Administration, NAID 348448945. Credit: Department of State.

**Alt text** (published as the image description): Albert Einstein and Prime Minister Nehru enjoy a visit together. From left, Albert Einstein, Prime Minister Jawaharlal Nehru. Photographic print, 1949-11-05.

**Sources:** EIN-S-0027

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0013 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Dr. Albert Einstein With Lieutenant (jg) Clifford L. Comstock (image) <https://catalog.archives.gov/id/276538325>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/276538325>

**Credit:** National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42918 (NAID 276538325).

**Alt text** (published as the image description): Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J. Lieut (jg) Clifford L. Comstock; USNR, a student officer at NTS Princeton, at left. 24 July 1943.

**Sources:** EIN-S-0028

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification. 2026-10-09: Supersedes earlier rights note: the first note line ('license\_class is unknown until a person decides the policy') is out of date; the approved LoC/NARA rights rule applies and license\_class is public-domain from NARA useRestriction 'Unrestricted'.

### EIN-M-0014 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Dr. Albert Einstein With Captain Geoffrey E. Sage (image) <https://catalog.archives.gov/id/276538328>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/276538328>

**Credit:** National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42919 (NAID 276538328).

**Alt text** (published as the image description): Dr. Albert Einstein, who is doing research for the Bureau of Ordnance, in his study at Princeton, N.J. Capt. Geoffrey E. Sage, USN, Commanding Officer, NTS, Princeton, and Lieut. Comdr. Frederick L. Douthit, USNR, Executive Officer, at left. 24 July 1943.

**Sources:** EIN-S-0029

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification. 2026-10-09: Supersedes earlier rights note: the first note line ('license\_class is unknown until a person decides the policy') is out of date; the approved LoC/NARA rights rule applies and license\_class is public-domain from NARA useRestriction 'Unrestricted'.

### EIN-M-0015 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305248>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305248>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305248.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-06-18. It discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship.

**Sources:** EIN-S-0042

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0042 unreachable (https://catalog.archives.gov/id/305248)

**Checker's reasoning:** The snapshot confirms the use restriction, title, date, description, credit and Einstein's death year of 1955, satisfying the approved private-writings exception. The live API and catalog page were unreachable, and web search returned no results.

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). NARA lists several items with this title (NAIDs 305248 to 305255); only 305248 is staged. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification. Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09) cleared for re-verification.

### EIN-M-0016 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter from Albert Einstein and the Emergency Committee of Atomic Scientists (document) <https://catalog.archives.gov/id/7873451>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/7873451>

**Credit:** National Archives at College Park, NAID 7873451.

**Alt text** (published as the image description): Letter, 5 sheets, 1947-11-29, in which Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control.

**Sources:** EIN-S-0050

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T180931-f4ff, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0050 unreachable (https://catalog.archives.gov/id/7873451)

**Checker's reasoning:** The snapshot supports the rights wording, title, description, and credit; unknown is appropriate under the private-writings rule because Raymond Swing has no verified death year. The live API was inaccessible and the catalog page exposed no readable record text.

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification. Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): Einstein writing as Chairman of the Emergency Committee of Atomic Scientists (a private body). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09) cleared for re-verification. Authorship set on 2026-10-20: private (Albert Einstein, Raymond Swing) (private-writings rule, DECISIONS 2026-10-20): ECAS authorship research: the enclosed Atlantic article is credited as told to Raymond Swing and was published 1947 in a renewed issue. Applied the approved rights rule (DECISIONS 2026-10-20, private writings in public archives, private-writings rule) on 2026-10-20: license\_class set back to unknown (link-only): private writing; no sourced death year for Raymond Swing; the holder's statement 'Unrestricted' alone is not a rights grant for a private writing. Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20) cleared for re-verification.

### EIN-M-0017 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** New Jersey NHL Einstein, Albert, House (document) <https://catalog.archives.gov/id/135813661>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Some of the materials in this file may be subject to copyright or other intellectual property restrictions." <https://catalog.archives.gov/id/135813661>

**Credit:** National Archives at College Park - Electronic Records, Records of the National Park Service, NAID 135813661.

**Alt text** (published as the image description): New Jersey NHL Einstein, Albert, House file (76002297\_NHL.pdf). This resource is located in Mercer County, New Jersey.

**Sources:** EIN-S-0053

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Restricted - Possibly' (Copyright): a possible restriction, so unknown; link only.

### EIN-M-0018 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Untitled poem by Albert Einstein (document) <https://catalog.archives.gov/id/519767870>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Use of this document may be subject to copyright restrictions." <https://catalog.archives.gov/id/519767870>

**Credit:** Franklin D. Roosevelt Library, National Archives and Records Administration, NAID 519767870.

**Alt text** (published as the image description): Untitled poem by Albert Einstein, 1934-01-25. During his visit, Einstein wrote this poem and presented it to the President.

**Sources:** EIN-S-0052

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Restricted - Possibly' (Copyright): a possible restriction, so unknown; link only.

### EIN-M-0019 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Declaration of Intention and Petition for Naturalization for Albert Einstein (document) <https://catalog.archives.gov/id/596270>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/596270>

**Credit:** National Archives at Philadelphia, Records of District Courts of the United States, NAID 596270.

**Alt text** (published as the image description): Record of naturalization for Albert Einstein which includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance.

**Sources:** EIN-S-0001, EIN-S-0036

**Independent checker:** codex:gpt-5.5 (run adv-20261009T181758-9687, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA useRestriction.status 'Unrestricted' is not a statement that the item is in the public domain, so license\_class is unknown until a person decides the policy (see blockers). Commons copy of one page: File:Declaration of Intention for Albert Einstein, 10-01-1940 (596270 ).jpg (EIN-S-0036), whose description dates the Declaration of Intention 01/15/1936; that date is a lead only. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'Unrestricted'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09) cleared for re-verification.

### EIN-M-0020 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein 1921 by F Schmutzer - restoration (image) <https://commons.wikimedia.org/wiki/File:Einstein_1921_by_F_Schmutzer_-_restoration.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Einstein_1921_by_F_Schmutzer_-_restoration.jpg>

**Credit:** Ferdinand Schmutzer; restoration by Adam Cuerden (Wikimedia Commons).

**Alt text** (published as the image description): Albert Einstein during a lecture in Vienna in 1921. Ferdinand Schmutzer / Adam Cuerden.

**Sources:** EIN-S-0030

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The public-domain phrase appears, but the cited source is Wikimedia Commons, not the item's holder, so the rights statement is not holder-backed. The record also adds credit/description metadata beyond the rights statement, and license\_class "unknown" is not entailed by the words "Public domain."

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Commons says 'Public domain' (uploader's claim). Its Credit names an original holder page on bhm.ch that Commons marks as a dead link; the holder's own record was not found, so license\_class is unknown per the media rules. Holder check 2026-10-09 (Commons source link followed): the Source link http://www.bhm.ch/de/news\_04a.cfm?bid=4&jahr=2006 returns HTTP 404. Its Wayback copy (20070211064905) is a Historisches Museum Bern press-photo page that releases the Einstein photos only for reporting on the museum and credits 'Albert-Einstein-Archiv, Jerusalem, Ferdinand Schmutzer'; that is a press-use condition from a non-holder on a dead page, not a holder rights statement, so nothing was copied; stays disputed.

### EIN-M-0021 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein as a child (image) <https://commons.wikimedia.org/wiki/File:Albert_Einstein_as_a_child.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Albert_Einstein_as_a_child.jpg>

**Credit:** Unknown author, via Wikimedia Commons.

**Alt text** (published as the image description): Albert Einstein as a child, 1894.

**Sources:** EIN-S-0031

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The public-domain statement appears in the snapshot and live Commons page, but it is Wikimedia Commons metadata/template evidence rather than an item-holder rights statement. The record also adds unsupported classification/credit/date-description information from that non-holder source, so the media claim is not adequately supported.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Licence is the Commons uploader's claim (UsageTerms 'Public domain'; categories PD US, PD-anon-70-EU). Credit is a college faculty web page, not an original holder, so no holder record exists to check. Adversary and reviewer should weigh this. Holder check 2026-10-09 (Commons source link followed): the Source link http://faculty.randolphcollege.edu/tmichalik/einstein.htm returns HTTP 404 and is a faculty page, not a holder; no holder rights statement; stays disputed. license\_class changed public-domain -\> unknown: the Commons 'Public domain' is an uploader claim (media rules), so the item is linked, not embedded.

### EIN-M-0022 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein patentoffice (image) <https://commons.wikimedia.org/wiki/File:Einstein_patentoffice.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Einstein_patentoffice.jpg>

**Credit:** Lucien Chavan; The Albert Einstein Archives, The Hebrew University of Jerusalem (via Wikimedia Commons).

**Alt text** (published as the image description): German-born theoretical physicist Albert Einstein, 1904 or 1905. Artist: Lucien Chavan.

**Sources:** EIN-S-0032

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The live and snapshot metadata contain “Public domain,” but the rights evidence is Wikimedia Commons metadata/templates rather than a holder statement. The record also adds credit/description/date information beyond the rights statement, and license\_class “unknown” is not entailed by the words “Public domain.”

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Commons says 'Public domain' (uploader's claim). Credit names The Albert Einstein Archives, The Hebrew University of Jerusalem as holder; its own record was not found in this run, so license\_class is unknown. Holder check 2026-10-09 (Commons source link followed): the Source link http://www.alberteinstein.info redirects to the Albert Einstein Archives home page (https://albert-einstein.huji.ac.il/), not an item page; the only rights text is the site footer 'All Rights Reserved', not a statement about this photograph; stays disputed.

### EIN-M-0023 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's exam of maturity grades (document) <https://commons.wikimedia.org/wiki/File:Albert_Einstein's_exam_of_maturity_grades_(color2).jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Albert_Einstein's_exam_of_maturity_grades_(color2).jpg>

**Credit:** The authorities of the Canton of Aargau, Switzerland, via Wikimedia Commons.

**Alt text** (published as the image description): The certificate of maturity issued to Albert Einstein in 1896, at the age of 17, after attending the cantonal high school in Aarau, Switzerland.

**Sources:** EIN-S-0033

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The public-domain statement appears in the snapshot and live Wikimedia Commons page, but it is a Commons licensing assertion rather than a rights statement from the item's holder. The record's unknown license class is not strictly entailed by the words "Public domain," and the credit/description add facts beyond that rights statement.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Licence is the Commons uploader's claim (UsageTerms 'Public domain'; category PD Switzerland (Official documents)). Credit is a scan from a published book, not an original holder record. Adversary and reviewer should weigh this. Holder check 2026-10-09 (Commons source link followed): the Commons Source is a scan from a book (Rosenkranz, 'Albert Einstein - Derriere l'image', 2005) with no link to the holder (Canton of Aargau); no holder rights statement; stays disputed. license\_class changed public-domain -\> unknown: the Commons 'Public domain' is an uploader claim (media rules), so the item is linked, not embedded.

### EIN-M-0024 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein - Passport issued by the Swiss Embassy in Berlin, Germany, 1923 (document) <https://commons.wikimedia.org/wiki/File:Albert_Einstein_-_Passport_issued_by_the_Swiss_Embassy_in_Berlin,_Germany,_1923.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Public domain" <https://commons.wikimedia.org/wiki/File:Albert_Einstein_-_Passport_issued_by_the_Swiss_Embassy_in_Berlin,_Germany,_1923.jpg>

**Credit:** Unknown author, via Wikimedia Commons.

**Alt text** (published as the image description): Passport of Albert Einstein issued by the Swiss embassy in Berlin, 1923-06-23.

**Sources:** EIN-S-0034

**Independent checker:** codex:gpt-5.5 (run adv-20261009T130513-4410, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information yes; atomic yes; source type right no.

**Checker's reasoning:** The public-domain statement is from Wikimedia Commons metadata/templates, not from the item's holder, and the snapshot credits mymodernmet.com rather than establishing holder rights. The record also adds credit/licensing information beyond the rights statement itself.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Licence is the Commons uploader's claim (UsageTerms 'Public domain'; PD-old-70-expired). Credit is mymodernmet.com, a website, not an original holder. Adversary and reviewer should weigh this. Holder check 2026-10-09 (Commons source link followed): the Source link https://mymodernmet.com/passport-photos-of-past-famous-people/ returns HTTP 404 and is a blog, not the holder; no holder rights statement; stays disputed. license\_class changed public-domain -\> unknown: the Commons 'Public domain' is an uploader claim (media rules), so the item is linked, not embedded.

### EIN-M-0025 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein and Elsa Einstein arriving by ship, San Diego, 1930 (image) <https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "This work is licensed under a "Creative Commons BY Attribution 4.0 International" ." <https://creativecommons.org/licenses/by/4.0>

**Credit:** Los Angeles Times Photographic Collection, University of California, Los Angeles. Library. Department of Special Collections. CC BY 4.0.

**Alt text** (published as the image description): View of Albert Einstein and Elsa Einstein aboard the ship, the SS Belgenland, upon their arrival in San Diego. December 31, 1930.

**Sources:** EIN-S-0037, EIN-S-0035

**Independent checker:** codex:gpt-5.5 (run adv-20261010T215351-6df4, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0037 unreachable (https://digital.library.ucla.edu/catalog/ark:/21198/zz002dd690); EIN-S-0035 found (https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File:Albert\_Einstein\_and\_Elsa\_Einstein\_arriving\_by\_ship%2C\_San\_Diego%2C\_1930.jpg&format=json)

**Checker's reasoning:** no problem found

**Notes:** Rights taken from the holder's own record (UCLA Library Digital Collections, EIN-S-0037), which also lists Rights statement 'copyrighted' and the UCLA Special Collections as rights holder alongside the CC BY 4.0 licence. Commons copy: EIN-S-0035. rights\_url is the CC licence URL given on the Commons page (LicenseUrl).

### EIN-M-0026 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Harris & Ewing Studio, 1921, gelatin silver print (image) <https://npg.si.edu/object/npg_S_NPG.84.288>

**Licence:** cc0; can be shown on the site

**Rights statement:** "CC0" <https://npg.si.edu/object/npg_S_NPG.84.288>

**Credit:** National Portrait Gallery, Smithsonian Institution; gift of Aileen Conkey

**Alt text** (published as the image description): Photograph of Albert Einstein by Harris & Ewing Studio, 1921, gelatin silver print.

**Sources:** EIN-S-0054

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** rights\_statement is the 'Restrictions & Rights' field on the NPG object page; the Open Access API record npg\_S\_NPG.84.288 also carries metadata\_usage access CC0. url is the object page; the image file is resolved at build time.

### EIN-M-0027 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Max Liebermann, c. 1922, lithograph on paper (image) <https://npg.si.edu/object/npg_NPG.80.141>

**Licence:** cc0; can be shown on the site

**Rights statement:** "CC0" <https://npg.si.edu/object/npg_NPG.80.141>

**Credit:** National Portrait Gallery, Smithsonian Institution

**Alt text** (published as the image description): Lithograph on paper of Albert Einstein by Max Liebermann, c. 1922.

**Sources:** EIN-S-0055

**Independent checker:** codex:gpt-5.5 (run adv-20261009T024009-d5a8, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** rights\_statement is the 'Restrictions & Rights' field on the NPG object page; the Open Access API record npg\_NPG.80.141 also carries metadata\_usage access CC0. url is the object page; the image file is resolved at build time.

### EIN-M-0028 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's office and blackboard (image) <https://albert.ias.edu/entities/archivalmaterial/63694399-870e-4161-8764-1d2d0a14d921>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/63694399-870e-4161-8764-1d2d0a14d921>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 41). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein's office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey.

**Sources:** EIN-S-0062

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1955. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0029 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's office (image) <https://albert.ias.edu/entities/archivalmaterial/692f7570-c1c2-4794-b26d-e26737dc32d5>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/692f7570-c1c2-4794-b26d-e26737dc32d5>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 40). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein's office in Fuld Hall on the Institute for Advanced Study campus in Princeton, New Jersey.

**Sources:** EIN-S-0063

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1955. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0030 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein in study, seated (image) <https://albert.ias.edu/entities/archivalmaterial/41b4e02c-4c2d-40d9-a7dd-42c21d5a0916>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/41b4e02c-4c2d-40d9-a7dd-42c21d5a0916>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 30). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein seated in his home office at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0064

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1954. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0031 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein in study, standing (image) <https://albert.ias.edu/entities/archivalmaterial/08bd71e1-b97e-4140-af9c-3f452b361d7e>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/08bd71e1-b97e-4140-af9c-3f452b361d7e>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 03). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein standing in his home study at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0065

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1954. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0032 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein in study, seated (image) <https://albert.ias.edu/entities/archivalmaterial/c446682d-91a2-4db0-9f4f-f81ca92c79ac>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/c446682d-91a2-4db0-9f4f-f81ca92c79ac>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 04). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein seated in his home study at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0066

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1954. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0033 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein in study, looking out window (image) <https://albert.ias.edu/entities/archivalmaterial/1053d45a-e966-4304-a5fa-69de8e0b6fc9>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/1053d45a-e966-4304-a5fa-69de8e0b6fc9>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 11). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein looking out the window of his home study at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0067

**Independent checker:** codex:gpt-5.5 (run adv-20261009T192023-8f9e, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Photo date as stated by the holder (Date field): 1954. Interior photograph usable as basis media for a reconstructed-place room. Image file on the item page (JPEG, ORIGINAL bundle).

### EIN-M-0034 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Harding, Prof. Einstein & wife, 4/25/21 (image) <https://www.loc.gov/item/2016830269/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see National Photo Company Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/275\_npco.html" <https://www.loc.gov/rr/print/res/275_npco.html>

**Credit:** Library of Congress, Prints & Photographs Division, National Photo Company Collection, LC-DIG-npcc-04038.

**Alt text** (published as the image description): Harding, Prof. Einstein & wife, 4/25/21. Glass negative, National Photo Company Collection.

**Sources:** EIN-S-0077

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room A (Washington, 1921). license\_class left for the approved LoC rights rule (merge\_staging.py) to set. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-10: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see National Phot...'.

### EIN-M-0035 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Harding, Prof. Einstein & wife, 4/25/21 (image) <https://www.loc.gov/item/2016830270/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see National Photo Company Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/275\_npco.html" <https://www.loc.gov/rr/print/res/275_npco.html>

**Credit:** Library of Congress, Prints & Photographs Division, National Photo Company Collection, LC-DIG-npcc-04039.

**Alt text** (published as the image description): Harding, Prof. Einstein & wife, 4/25/21. Glass negative, National Photo Company Collection.

**Sources:** EIN-S-0078

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room A (Washington, 1921). Second negative of the same sitting. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-10: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see National Phot...'.

### EIN-M-0036 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Prof. Einstein & wife (image) <https://www.loc.gov/item/2016830271/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see National Photo Company Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/275\_npco.html" <https://www.loc.gov/rr/print/res/275_npco.html>

**Credit:** Library of Congress, Prints & Photographs Division, National Photo Company Collection, LC-DIG-npcc-04040.

**Alt text** (published as the image description): Prof. Einstein & wife, 1921. Glass negative, National Photo Company Collection.

**Sources:** EIN-S-0079

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room A (Washington, 1921). LoC: title from unverified data on the negative sleeves; date from negatives in same range. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-10: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see National Phot...'.

### EIN-M-0037 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein with wife Elsa; State, War, and Navy building in background. Washington, D.C. (image) <https://www.loc.gov/item/2016885962/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and Restrictions Information https://www.loc.gov/rr/print/res/140\_harr.html" <https://www.loc.gov/rr/print/res/140_harr.html>

**Credit:** Library of Congress, Prints & Photographs Division, Harris & Ewing Collection, LC-DIG-hec-31013.

**Alt text** (published as the image description): Albert Einstein with wife Elsa; State, War, and Navy building in background. Washington, D.C. Glass negative by Harris & Ewing, photographer, between 1921 and 1923.

**Sources:** EIN-S-0080

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room A. Companion negative of EIN-M-0005. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-10: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see Harris & Ewin...'.

### EIN-M-0038 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein & Mrs. Einstein with reception committee at San Diego, Calif., Dec. 31, 1930 (image) <https://www.loc.gov/item/2022886683/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions ...," https://hdl.loc.gov/loc.pnp/res.195.copr" <https://hdl.loc.gov/loc.pnp/res.195.copr>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-16639.

**Alt text** (published as the image description): Einstein & Mrs. Einstein with reception committee at San Diego, Calif., Dec. 31, 1930. Photo copyrighted 1931.

**Sources:** EIN-S-0081

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room B. Not usable for embedding: LoC 'Rights status not evaluated'; the record also says 'Photo copyrighted 1931'. Link only.

### EIN-M-0039 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein arrives in San Diego, California (image) <https://albert.ias.edu/entities/archivalmaterial/613b1c73-525b-450e-811c-b6c96a6a063d>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "This item is protected by copyright and/or related rights. However, for this item, either (a) no rights-holder(s) have been identified or (b) one or more rights-holder(s) have been identified but none have been located. Researchers are free to use this item in any way that is permitted by the copyright and related rights legislation that applies to their use. For more information, see https://rightsstatements.org/page/InC-RUU/1.0/?language=en" <https://rightsstatements.org/page/InC-RUU/1.0/?language=en>

**Credit:** Photographer unknown. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (EB 064).

**Alt text** (published as the image description): Albert Einstein debarks the S.S. Belgenland in San Diego, California. Einstein and his wife, Elsa, are greeted by San Diego's mayor, Harry C. Clark.

**Sources:** EIN-S-0083

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165845-1910, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Room B. In copyright, rights-holder unlocatable (InC-RUU): link only.

### EIN-M-0040 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein at Pasadena, California (image) <https://albert.ias.edu/entities/archivalmaterial/7ca4dfb1-5c92-4d57-b3e8-071540aadce8>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "This item is protected by copyright and/or related rights. However, for this item, either (a) no rights-holder(s) have been identified or (b) one or more rights-holder(s) have been identified but none have been located. Researchers are free to use this item in any way that is permitted by the copyright and related rights legislation that applies to their use. For more information, see https://rightsstatements.org/page/InC-RUU/1.0/?language=en" <https://rightsstatements.org/page/InC-RUU/1.0/?language=en>

**Credit:** Photographer unknown. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (EB 100).

**Alt text** (published as the image description): Albert Einstein dines at The Athenaeum on the campus of Caltech (California Institute of Technology) in Pasadena, California.

**Sources:** EIN-S-0084

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Pasadena follow-on to Room B. InC-RUU: link only.

### EIN-M-0041 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Abraham Michelson (left), Albert Einstein (center), and Robert Andrews Millikan (right) (image) <https://siarchives.si.edu/collections/siris_arc_393240>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Copyright Not Evaluated" <https://siarchives.si.edu/collections/siris_arc_393240>

**Credit:** Smithsonian Institution Archives, Accession 90-105, Science Service Records, Image No. SIA2008-6085.

**Alt text** (published as the image description): Albert Abraham Michelson (left), Albert Einstein (center), and Robert Andrews Millikan (right) at The Athenaeum, California Institute of Technology, February 1931.

**Sources:** EIN-S-0085

**Independent checker:** codex:gpt-5.5 (run adv-20261010T165246-4f40, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Pasadena follow-on to Room B. The page's Restrictions & Rights says 'Copyright Not Evaluated' (the Open Access API's CC0 is a metadata-usage flag and conflicts with it), so unknown: link only.

### EIN-M-0042 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein in study, standing (image) <https://albert.ias.edu/entities/archivalmaterial/e8cdc700-f62d-4bb7-962d-fdbc8f2b598e>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://albert.ias.edu/entities/archivalmaterial/e8cdc700-f62d-4bb7-962d-fdbc8f2b598e>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 12). CC BY 4.0.

**Alt text** (published as the image description): Albert Einstein standing in his home study at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0094

**Independent checker:** codex:gpt-6-sol (run adv-20261015T002002-e99e, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0094 found (https://albert.ias.edu/entities/archivalmaterial/e8cdc700-f62d-4bb7-962d-fdbc8f2b598e)

**Checker's reasoning:** no problem found

**Notes:** Mercer Street study, period photograph (undated). 1513 x 1212 px per IIIF manifest.

### EIN-M-0043 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's house, study (image) <https://albert.ias.edu/entities/archivalmaterial/b3abbc37-704b-46a7-912d-aa9bb6554fc3>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "This item is protected by copyright and/or related rights. However, for this item, either (a) no rights-holder(s) have been identified or (b) one or more rights-holder(s) have been identified but none have been located. Researchers are free to use this item in any way that is permitted by the copyright and related rights legislation that applies to their use. For more information, see https://rightsstatements.org/page/InC-RUU/1.0/?language=en" <https://rightsstatements.org/page/InC-RUU/1.0/?language=en>

**Credit:** Gayle Kerley, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 39).

**Alt text** (published as the image description): Albert Einstein's study in his house, which was located at 112 Mercer Street, Princeton, New Jersey.

**Sources:** EIN-S-0095

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0095 found (https://albert.ias.edu/entities/archivalmaterial/b3abbc37-704b-46a7-912d-aa9bb6554fc3)

**Checker's reasoning:** no problem found

**Notes:** 1986 photograph of the study (after his death). 3015 x 2408 px per IIIF manifest. InC-RUU: link only. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0044 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Office (image) <https://albert.ias.edu/entities/archivalmaterial/8bd84192-9c03-4c5a-8ab0-75bd68819b02>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Permission to use this image must be requested from the Institute's Archives. Please contact archives@ias.edu." <https://albert.ias.edu/entities/archivalmaterial/8bd84192-9c03-4c5a-8ab0-75bd68819b02>

**Credit:** Jack Burnett, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Office. Jack Burnett's photographs document the interior of Albert Einstein's former residence at 112 Mercer Street in Princeton, New Jersey. The photographs were taken in 1969.

**Sources:** EIN-S-0096

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0096 found (https://albert.ias.edu/entities/archivalmaterial/8bd84192-9c03-4c5a-8ab0-75bd68819b02)

**Checker's reasoning:** no problem found

**Notes:** Mercer Street room-recreation basis (1969, after Einstein's death). 3586 x 2386 px per IIIF manifest. Permission required: link only; ask IAS archives for reuse. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0045 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Office (image) <https://albert.ias.edu/entities/archivalmaterial/b9ccbff0-b65e-4d12-8ea2-93e9d9d4972a>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Permission to use this image must be requested from the Institute's Archives. Please contact archives@ias.edu." <https://albert.ias.edu/entities/archivalmaterial/b9ccbff0-b65e-4d12-8ea2-93e9d9d4972a>

**Credit:** Jack Burnett, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Office. Jack Burnett's photographs document the interior of Albert Einstein's former residence at 112 Mercer Street in Princeton, New Jersey. The photographs were taken in 1969.

**Sources:** EIN-S-0097

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict unclear; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0097 unreachable (https://albert.ias.edu/entities/archivalmaterial/b9ccbff0-b65e-4d12-8ea2-93e9d9d4972a)

**Checker's reasoning:** The snapshot supports the record, but the holder's item page could not be loaded for live confirmation.

**Why it is not verified:** G4: adversary verdict is unclear; G10: EIN-S-0097: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Mercer Street room-recreation basis (1969, after Einstein's death). 3586 x 2386 px per IIIF manifest. Permission required: link only; ask IAS archives for reuse. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0046 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Desk (image) <https://albert.ias.edu/entities/archivalmaterial/36730a3c-49c3-4c40-b64c-3fe4cf02f829>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Permission to use this image must be requested from the Institute's Archives. Please contact archives@ias.edu." <https://albert.ias.edu/entities/archivalmaterial/36730a3c-49c3-4c40-b64c-3fe4cf02f829>

**Credit:** Jack Burnett, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Desk. Jack Burnett's photographs document the interior of Albert Einstein's former residence at 112 Mercer Street in Princeton, New Jersey. The photographs were taken in 1969.

**Sources:** EIN-S-0098

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0098 unreachable (https://albert.ias.edu/entities/archivalmaterial/36730a3c-49c3-4c40-b64c-3fe4cf02f829)

**Checker's reasoning:** The snapshot identifies a desk in Einstein’s former residence at 112 Mercer Street, but does not establish that it was in his home study. The live item page could not be loaded.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G10: EIN-S-0098: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Mercer Street room-recreation basis (1969, after Einstein's death). 3586 x 2386 px per IIIF manifest. Permission required: link only; ask IAS archives for reuse. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0047 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Bookcases (image) <https://albert.ias.edu/entities/archivalmaterial/f85299a4-7b9a-431c-81d1-22360ba48d43>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Permission to use this image must be requested from the Institute's Archives. Please contact archives@ias.edu." <https://albert.ias.edu/entities/archivalmaterial/f85299a4-7b9a-431c-81d1-22360ba48d43>

**Credit:** Jack Burnett, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Bookcases. Jack Burnett's photographs document the interior of Albert Einstein's former residence at 112 Mercer Street in Princeton, New Jersey. The photographs were taken in 1969.

**Sources:** EIN-S-0099

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0099 found (https://albert.ias.edu/entities/archivalmaterial/f85299a4-7b9a-431c-81d1-22360ba48d43)

**Checker's reasoning:** The holder identifies the image as bookcases in Einstein’s former residence at 112 Mercer Street, but does not identify the room as his home study.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Mercer Street room-recreation basis (1969, after Einstein's death). 3586 x 2386 px per IIIF manifest. Permission required: link only; ask IAS archives for reuse. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0048 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Desk by door (image) <https://albert.ias.edu/entities/archivalmaterial/36d95e51-b670-44c7-baab-b894570b47d1>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Permission to use this image must be requested from the Institute's Archives. Please contact archives@ias.edu." <https://albert.ias.edu/entities/archivalmaterial/36d95e51-b670-44c7-baab-b894570b47d1>

**Credit:** Jack Burnett, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Desk by door. Jack Burnett's photographs document the interior of Albert Einstein's former residence at 112 Mercer Street in Princeton, New Jersey. The photographs were taken in 1969.

**Sources:** EIN-S-0100

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0087

**Independent checker:** codex:gpt-6-sol (run adv-einstein-basis-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0100 found (https://albert.ias.edu/entities/archivalmaterial/36d95e51-b670-44c7-baab-b894570b47d1)

**Checker's reasoning:** The holder identifies the photograph as an interior of Einstein’s former residence at 112 Mercer Street, but does not establish that the pictured desk is in his home study, the room named by the linked stop fact.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Mercer Street room-recreation basis (1969, after Einstein's death). 3586 x 2386 px per IIIF manifest. Permission required: link only; ask IAS archives for reuse. Withdrawn (run einstein-tour-2026-10-15, same run that staged it, on the lead's instruction of 2026-10-15): a place/interior photograph that does not depict the inductee is not a media record; it is listed in data/inductees/einstein/TOUR-RESEARCH.md as a reconstruction-basis candidate (holder, rights, resolution, URL, stop fact) until the owner decides a separate record kind. The adversary verdict is kept for audit. Re-opened 2026-10-16 as a basis photo (owner decision 2026-10-16: record kind for photos used only as the basis for rebuilding a room; the 2026-10-15 withdrawal was pending that decision). Linked to stop fact EIN-F-0087 (home study at 112 Mercer Street); taken after Einstein's death, so a reconstruction shows only what the photograph shows. Rights as stated by the holder: link only / reference only. The earlier item verdict is cleared; it is judged again as a basis photo.

### EIN-M-0050 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305247>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305247>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305247.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-05-17. It is in regards to Albert Einstein participating in the Research and Development Division of the Navy to research Navy problems.

**Sources:** EIN-S-0041

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0041 unreachable (https://catalog.archives.gov/id/305247)

**Checker's reasoning:** The snapshot supports the title, description, date, credit and sole author Einstein’s death year of 1955, satisfying the private-writing rule. The live API and catalog page could not be read, and web search returned no results.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0064. 2 page images in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0051 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305249>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305249>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305249.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-06-29. In it, Albert Einstein answers a letter from the same day, and says that he will not be able to come to Washington, DC for health reasons.

**Sources:** EIN-S-0043

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0043 unreachable (https://catalog.archives.gov/id/305249)

**Checker's reasoning:** The snapshot supports the title, description, credit, and private authorship, and confirms Einstein's death year as 1955, satisfying the approved private-writings rule. The live source could not be reached.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0066. 1 page image in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0052 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305250>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305250>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305250.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-07-30. In it, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship.

**Sources:** EIN-S-0044

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0044 unreachable (https://catalog.archives.gov/id/305250)

**Checker's reasoning:** The snapshot confirms the use restriction, title, date, description, credit and Einstein's 1955 death year, satisfying the private-writings rule. The live record could not be read through the API, catalog page, shell or web search.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0067. 1 page image in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0053 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305251>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305251>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305251.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-08-13. In it, Dr. Einstein mentions an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee.

**Sources:** EIN-S-0045

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0045 unreachable (https://catalog.archives.gov/id/305251)

**Checker's reasoning:** The snapshot supports the title, description, date, credit and Unrestricted use status; its Einstein authority heading confirms 1955, satisfying the private-writings exception. The live API and catalog page were unreachable.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0068, EIN-F-0069. 1 page image in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0054 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305252>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305252>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305252.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-08-22. In it, Albert Einstein gives his opinion on the best localization for installation of the torpedo explosion.

**Sources:** EIN-S-0046

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0046 unreachable (https://catalog.archives.gov/id/305252)

**Checker's reasoning:** The snapshot supports the title, date, description, credit and Unrestricted use status, and identifies Einstein as the correspondent with death year 1955, satisfying the private-writings exception. The live catalog and proxy were unreachable.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0070. 2 page images in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0055 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305253>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305253>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305253.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1943-09-01. In it, Albert Einstein discusses the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation.

**Sources:** EIN-S-0047

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0047 unreachable (https://catalog.archives.gov/id/305253)

**Checker's reasoning:** The snapshot supports the title, date, description, credit and sole author’s death year of 1955, satisfying the approved private-writings rule. The live National Archives record was unreachable.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0071. 1 page image in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0056 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305254>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305254>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305254.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1944-01-04. It discusses Albert Einstein's idea to have a torpedo positioned parallel to the wall of a ship before it exploded.

**Sources:** EIN-S-0048

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0048 unreachable (https://catalog.archives.gov/proxy/records/search?naId=305254)

**Checker's reasoning:** The snapshot supports the title, date, description, credit and use restriction; its named correspondent's death year matches the supplied 1955 basis, satisfying the approved private-writing rule. The live source could not be reached through either web or shell access.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0072, EIN-F-0073. 2 page images in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0057 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance (document) <https://catalog.archives.gov/id/305255>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/305255>

**Credit:** National Archives at College Park, Records of the Bureau of Ordnance, NAID 305255.

**Alt text** (published as the image description): Letter of Albert Einstein to the Lieutenant Stephen Brunauer, U.S. Navy Bureau of Ordnance, 1944-10-15. It discusses quick compression in a metal container.

**Sources:** EIN-S-0049

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0049 unreachable (https://catalog.archives.gov/id/305255)

**Checker's reasoning:** The snapshot supports the title, date, description, credit and private authorship, and records Einstein’s death year as 1955, satisfying the approved private-writings rule. The live API and catalog page were unreachable.

**Notes:** One of the nine Brunauer letters (series NAID 305246, EIN-S-0040; EIN-F-0062, EIN-F-0063); EIN-M-0015 is the 1943-06-18 letter. Supports EIN-F-0074. 1 page image in the catalog record. Princeton room / Stop 6 (Navy work); place of writing not stated by the record. NARA useRestriction.status 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): a letter Einstein wrote to Lt. Stephen Brunauer (NARA contributor heading: Einstein, Albert, 1879-1955, Correspondent). Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20) cleared for re-verification.

### EIN-M-0058 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter from Albert Einstein, Chairman of the Emergency Committee of Atomic Scientists (document) <https://catalog.archives.gov/id/7873452>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/7873452>

**Credit:** National Archives at College Park, Records of the Foreign Service Posts of the Department of State, NAID 7873452.

**Alt text** (published as the image description): Letter from Albert Einstein, Chairman of the Emergency Committee of Atomic Scientists, 1947-10-11. In it, Albert Einstein wrote on behalf of the Emergency Committee of Atomic Scientists regarding questions, topics, and warnings concerning the use of nuclear or atomic resources as a means for diplomatic or military solutions.

**Sources:** EIN-S-0051

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T180931-f4ff, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0051 unreachable (https://catalog.archives.gov/id/7873452)

**Checker's reasoning:** The snapshot supports the title, description, credit and private authorship; unknown is appropriate because the committee lacks death-year evidence and “Unrestricted” alone does not establish public domain for private writings. The live record could not be loaded through the API, catalog page, shell or web search.

**Notes:** Companion of EIN-M-0016 (1947-11-29). Supports EIN-F-0079, EIN-F-0080. Two page images (27281-2013-001/002-ac.jpg, about 9.3 and 7.6 MB). Conscience constellation, Princeton room. NARA 'Unrestricted' (approved rights rule). Authorship set on 2026-10-20: private (Albert Einstein) (private-writings rule, DECISIONS 2026-10-20): Einstein writing as Chairman of the Emergency Committee of Atomic Scientists (a private body). Authorship set on 2026-10-20: private (Albert Einstein, Emergency Committee of Atomic Scientists) (private-writings rule, DECISIONS 2026-10-20): ECAS authorship research: the enclosed statement is a committee text with co-signers who died after 1955. Applied the approved rights rule (DECISIONS 2026-10-20, private writings in public archives, private-writings rule) on 2026-10-20: license\_class set back to unknown (link-only): private writing; no sourced death year for Emergency Committee of Atomic Scientists; the holder's statement 'Unrestricted' alone is not a rights grant for a private writing. Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20) cleared for re-verification.

### EIN-M-0059 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Dr. Albert Einstein at Princeton, N.J. Where He is Engaged in Research Work for the U.S. Navy (image) <https://catalog.archives.gov/id/276538322>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/276538322>

**Credit:** National Archives at College Park - Still Pictures, General Records of the Department of the Navy, 80-G-42917 (NAID 276538322).

**Alt text** (published as the image description): Dr. Albert Einstein at Princeton, N.J. where he is engaged in research work for the U.S. Navy. 1 Sept. 1943.

**Sources:** EIN-S-0107

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0107 unreachable (https://catalog.archives.gov/id/276538322)

**Checker's reasoning:** The snapshot’s useRestriction.status is exactly "Unrestricted", and its federal Navy provenance satisfies the approved public-domain rule; the title, caption, date and credit are supported. Live API and catalog access failed, and web search returned no result.

**Notes:** Navy photograph 80-G-42917 (EIN-F-0138); companion of EIN-M-0013/-0014. Two image files listed (80-G-0042917\_001.jpg, \_002.jpg). Princeton room / Stop 6.

### EIN-M-0060 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein's Brier Pipe (image) <https://americanhistory.si.edu/collections/object/nmah_334905>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Usage Conditions Apply" <https://americanhistory.si.edu/collections/object/nmah_334905>

**Credit:** National Museum of American History, Smithsonian Institution, 1996.0006.01.

**Alt text** (published as the image description): Einstein's Brier Pipe; pipe, wood (overall material), Before 1948 (Date Made); ID Number 1996.0006.01.

**Sources:** EIN-S-0108

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0108 found (https://americanhistory.si.edu/collections/object/nmah\_334905)

**Checker's reasoning:** no problem found

**Notes:** Link-only object record (four museum photographs, 'Usage Conditions Apply'). Recreation candidate for the Princeton study constellation: facts EIN-F-0139, -F-3, -F-4.

### EIN-M-0061 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein in His Study (image) <https://americanhistory.si.edu/collections/object/nmah_1000855>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Usage Conditions Apply" <https://americanhistory.si.edu/collections/object/nmah_1000855>

**Credit:** National Museum of American History, Smithsonian Institution, 1996.0006.02.

**Alt text** (published as the image description): Einstein in His Study; Painting, watercolor; Plunguian, Gina (Maker); 1953 (Date Made).

**Sources:** EIN-S-0109

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0109 found (https://americanhistory.si.edu/collections/object/nmah\_1000855)

**Checker's reasoning:** The Smithsonian page was readable through web search and confirms the rights statement, reuse restrictions, title, maker, date, medium and catalog number; no problem found.

**Notes:** Link-only; private modelling reference for the study room under the 2026-10-16 owner decision (reference only, never shown). Fact EIN-F-0142.

### EIN-M-0062 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 8c Albert Einstein plate proof (image) <https://postalmuseum.si.edu/object/npm_0.305037.5>

**Licence:** cc0; can be shown on the site

**Rights statement:** "CC0" <https://postalmuseum.si.edu/object/npm_0.305037.5>

**Credit:** National Postal Museum, Smithsonian Institution, 0.305037.5.

**Alt text** (published as the image description): 8c Albert Einstein plate proof, Prominent Americans Issue, Plate No.28398, violet, February 16, 1966; Printer: Bureau of Engraving and Printing.

**Sources:** EIN-S-0110

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20b, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0110 found (https://postalmuseum.si.edu/object/npm\_0.305037.5)

**Checker's reasoning:** The holder’s page was readable through web search and confirms CC0 and every detail in the title, credit and alt text; the snapshot agrees.

**Notes:** Open object image (IIIF NPM-0\_305037\_5, 1916 x 2240 px). Legacy item (fact EIN-F-0143). fetch\_media.py has no Smithsonian file host yet (ids.si.edu): tool request in ARTIFACTS.md.

### EIN-M-0063 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Letter from Albert Einstein to President Franklin D. Roosevelt (document) <https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain, Free of Known Copyright Restrictions." <https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/>

**Credit:** Franklin D. Roosevelt Library, Hyde Park, NY; President's Secretary's File (Franklin D. Roosevelt Administration), Safe Files, Sachs, Alexander; National Archives Identifier 16608874 (DocsTeach, National Archives Foundation).

**Alt text** (published as the image description): Letter from Albert Einstein to President Franklin D. Roosevelt; 8/2/1939; Sachs, Alexander; Franklin D. Roosevelt Library, Hyde Park, NY.

**Sources:** EIN-S-0106, EIN-S-0105

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173405-1204, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0106 found (https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/); EIN-S-0105 unreachable (https://catalog.archives.gov/proxy/records/search?naId=16608874)

**Checker's reasoning:** no problem found

**Notes:** Resolves the open rights question on EIN-M-0049 with the National Archives' own item-level statement: the DocsTeach document page (registry entry docsteach, part\_of nara; snapshot EIN-S-0106) gives 'Rights: Public Domain, Free of Known Copyright Restrictions.' for this letter (National Archives Identifier 16608874). EIN-M-0049 recorded the catalog file unit's useRestriction 'Unrestricted' and was refuted for that mismatch; a person should reject EIN-M-0049 in favour of this record. The letter is pages 2-3 of the catalog PDF psfa0064.pdf (21 pages: Sachs letter pp. 4-6, FDR memo to General Watson 13 Oct 1939 p. 7, draft secretary reply p. 8, FDR reply p. 9). Stop 4 (Nassau Point, Peconic, 1939). Authorship set on 2026-10-20: private (Albert Einstein, Leo Szilard, Alexander Sachs) (private-writings rule, DECISIONS 2026-10-20): signed by Einstein; DocsTeach names Szilard and Sachs as collaborators. Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-einstein-docs-2026-10-20b, 2026-10-20) cleared for re-verification.

### EIN-M-0064 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's house (image) <https://albert.ias.edu/entities/archivalmaterial/8d8f540f-1dd3-498d-9fe9-424291757c3d>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://creativecommons.org/licenses/by/4.0/>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (E 42).

**Alt text** (published as the image description): Albert Einstein's house, which was located at 112 Mercer Street in Princeton, New Jersey.

**Sources:** EIN-S-0111

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0107, EIN-F-0132

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0111 found (https://albert.ias.edu/entities/archivalmaterial/8d8f540f-1dd3-498d-9fe9-424291757c3d)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (chapter 10, death and legacy: the house at 112 Mercer Street). Exterior, undated, 3000 x 2400 px (IIIF). CC BY 4.0: embeddable with credit once verified; the best open exterior view for a street-front room.

### EIN-M-0065 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Choir College singing in front of Einstein house at Christmas (image) <https://albert.ias.edu/entities/archivalmaterial/66fcd1d4-7884-4b3c-b53f-689ca143fa0f>

**Licence:** cc-by; can be shown on the site

**Rights statement:** "The Institute for Advanced Study owns the copyright for this image. This image is licensed with the "CC By" license to support research use with proper attribution. For more information, see https://creativecommons.org/licenses/by/4.0/" <https://creativecommons.org/licenses/by/4.0/>

**Credit:** Alan Richards, photographer. Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA.

**Alt text** (published as the image description): Westminster Choir College students Christmas caroling in front of Albert Einstein's home at 112 Mercer Street in Princeton, New Jersey.

**Sources:** EIN-S-0112

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0107

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20b, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0112 unreachable (https://albert.ias.edu/entities/archivalmaterial/66fcd1d4-7884-4b3c-b53f-689ca143fa0f)

**Checker's reasoning:** The snapshot contains the exact rights statement and supports the license, credit, title, and description identifying 112 Mercer Street. The live page could not be reached through either web access or shell, and searches returned no results.

**Why it is not verified:** G10: EIN-S-0112: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Rooms run 2026-10-20 (chapter 10). Exterior with the front walk and porch, undated, 1555 x 1240 px (IIIF). CC BY 4.0. Second angle on the house front.

### EIN-M-0066 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein's house (image) <https://albert.ias.edu/entities/archivalmaterial/439f370d-5766-472b-97cc-c463743db283>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "This item is protected by copyright and/or related rights. However, for this item, either (a) no rights-holder(s) have been identified or (b) one or more rights-holder(s) have been identified but none have been located. Researchers are free to use this item in any way that is permitted by the copyright and related rights legislation that applies to their use. For more information, see https://rightsstatements.org/page/InC-RUU/1.0/?language=en" <https://rightsstatements.org/page/InC-RUU/1.0/?language=en>

**Credit:** Photographer unknown. Einstein Family collection, Shelby White and Leon Levy Archives Center, Institute for Advanced Study, Princeton, NJ, USA (EB 081).

**Alt text** (published as the image description): Albert Einstein's house located at 112 Mercer Street.

**Sources:** EIN-S-0113

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0107

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0113 found (https://albert.ias.edu/entities/archivalmaterial/439f370d-5766-472b-97cc-c463743db283)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (chapter 10). Colour exterior, undated, 2086 x 1505 px (IIIF). InC-RUU: modelling reference only (owner rule 2026-10-16), never embedded; gives the house colours, which the black-and-white views lack.

### EIN-M-0067 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein Home, Princeton, New Jersey (image) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297_photos>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** National Park Service (NPS Photo 1975), NPGallery, National Register of Historic Places 76002297.

**Alt text** (published as the image description): Albert Einstein Home, Princeton, New Jersey. NPS Photo 1975.

**Sources:** EIN-S-0114

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0107, EIN-F-0132

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0114 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/76002297\_photos)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (chapter 10). Street view of the house front and side wing, 1975, scan 2226 x 1797 px inside the PDF. No item-level rights statement on NPGallery (site-wide notice only), so unknown and link/reference only until a person rules; the caption credits an NPS photograph.

### EIN-M-0068 (disputed)

- [ ] reject
- [ ] note: 

**Item:** U. S. Post Office and Courthouse: Third floor, ceremonial courtroom (image) <https://npgallery.nps.gov/NRHP/GetAsset/NRHP/12000309_text>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Carson Anderson and Caleb Harms for ICF Jones & Stokes; National Register of Historic Places registration form 12000309, NPGallery, National Park Service.

**Alt text** (published as the image description): Third floor, ceremonial courtroom.

**Sources:** EIN-S-0115

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0056

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20b, 2026-10-20): verdict unclear; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0115 unreachable (https://npgallery.nps.gov/NRHP/GetAsset/NRHP/12000309\_text)

**Checker's reasoning:** The snapshot identifies Photo 26 as the third-floor ceremonial courtroom in Trenton and credits the named photographers; unknown rights status is consistent with no rights statement. The live NPS document could not be read through either shell or web access, leaving the manually supplied snapshot unconfirmed.

**Why it is not verified:** G4: adversary verdict is unclear; G10: EIN-S-0115: snapshot supplied by manual; the adversary must find the quote live (result is 'unreachable')

**Notes:** Rooms run 2026-10-20 (chapter 6, citizenship). Photo #26 of the registration form (page 55 of the PDF), 2005 or 2009, grayscale scan about 1630 x 1257 px; the form's section 7 describes Courtroom 1 ('Ceremonial Courtroom') in detail (oak wainscot, judge's dais, ceiling), which with the photo is enough to model the room. The form says courtrooms 1, 2 and 3 are original to the 1932 building and the floors hold offices of the U.S. District Court. No source on file says the 1940 ceremony (EIN-F-0051) took place in this building or this room: a reconstruction must be labelled as the Trenton federal courthouse of the U.S. District Court, never as 'the room where'. Rights: no item-level statement; reference only.

### EIN-M-0069 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein 01 1870 Bahnhofstr 20 Wohnhaus Weil Erlanger (document) <https://commons.wikimedia.org/wiki/File:Albert_Einstein_01_1870_Bahnhofstr_20_Wohnhaus_Weil_Erlanger_S0605_2015.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Stadtarchiv Ulm, B 613 Bahnhofstr. 20 (file on Wikimedia Commons).

**Alt text** (published as the image description): Ansicht des Geburtshauses von Albert Einstein in der Bahnhofstraße 20.

**Sources:** EIN-S-0116

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0005

**Independent checker:** codex:gpt-6.1-sol (run adv-einstein-rooms-2026-10-20, 2026-10-20): verdict refuted; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right no.

**Live check per source:** EIN-S-0116 found (https://commons.wikimedia.org/wiki/File:Albert\_Einstein\_01\_1870\_Bahnhofstr\_20\_Wohnhaus\_Weil\_Erlanger\_S0605\_2015.jpg)

**Checker's reasoning:** The live page identifies the birthplace building and supports the title, description and credit. However, its description and licensing are uploader-supplied Commons fields; the archive-donation template does not independently confirm a holder-authored statement.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not accept the source type

**Notes:** Rooms run 2026-10-20 (chapter 1, birth in Ulm). The 1870 building plan of the birthplace (street elevations, ground plan and section), 4644 x 3125 px: enough for a full exterior model of the destroyed house. Holder's own rights statement not found (Commons PD-old-70 is the uploader's tag), so unknown and reference only; ask the Stadtarchiv Ulm for the statement and a master.

### EIN-M-0070 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Nobel Lecture to the Nordic Assembly of Naturalists, Kongresshallen, Gothenburg, July 11, 1923 (image) <https://samlingar.goteborgsstadsmuseum.se/object/402044>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://samlingar.goteborgsstadsmuseum.se/object/402044>

**Credit:** Göteborgs stadsmuseum, GhmF:148. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.

**Alt text** (published as the image description): Albert Einstein lectures in the Kongresshallen, Gothenburg, July 11, 1923.

**Sources:** EIN-S-0118, EIN-S-0117

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0118 unreachable (https://samlingar.goteborgsstadsmuseum.se/object/402044); EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/)

**Checker's reasoning:** The museum snapshot explicitly supplies Public Domain Mark, the photographer credit, and the depicted lecture’s identity, location and date. Both live pages were unreachable; reachability is reported separately as instructed.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): samlingar.goteborgsstadsmuseum.se: Göteborgs stadsmuseum, secondary

**Why it is not verified:** G10: EIN-S-0118: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Run einstein-euro-2026-10-22. Holder Göteborgs stadsmuseum (Carlotta record GhmF:148): LICENS / MEDIA 'Public Domain Mark', copyright holder field 'Upphovsrätt utslocknad' (copyright expired); photographer Karnell died 1934. Glass negative, 1923-07-11, keywords include 'nobelföreläsning', 'interiör'. Shows the hall (Kongresshallen, Jubileumsutställningen 1923) from the audience: chapter 9 room view as well as an item. Web image about 750 x 595 px; the record lists tif/jpg.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: Göteborgs stadsmuseum GhmF:147/148/149: the holder's own record states 'Public Domain Mark; Upphovsrätt utslocknad', so the rights are cleared and they may display. This supersedes the earlier reference-only status for these items only.

### EIN-M-0071 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Exterior, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey (image) <https://www.loc.gov/item/2010719739/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010719739/>

**Credit:** Carol M. Highsmith, Carol M. Highsmith Archive, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Exterior, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey, 2010; built in 1932; photograph by Carol M. Highsmith.

**Sources:** EIN-S-0119

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0056

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0119 found (https://www.loc.gov/item/2010719739/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 6 (citizenship; petition 4009 of the U.S. District Court for the District of New Jersey, Trenton, EIN-F-0056). The holder names the building Clarkson S. Fisher Federal Building & U.S. Courthouse, built in 1932 (the 402 East State Street building of the NRHP form, EIN-M-0068). No source says the 1940 ceremony took place in this building. jp2 5514x2881. Largest file listed: 5514x2881 https://tile.loc.gov/storage-services/service/pnp/highsm/10900/10904.jp2.

### EIN-M-0072 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Front entrance, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey (image) <https://www.loc.gov/item/2010719735/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010719735/>

**Credit:** Carol M. Highsmith, Carol M. Highsmith Archive, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Front entrance, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey, 2010; photograph by Carol M. Highsmith.

**Sources:** EIN-S-0120

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0056

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0120 found (https://www.loc.gov/item/2010719735/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 6 (EIN-F-0056). Front entrance. jp2 4908x2537. Largest file listed: 4908x2537 https://tile.loc.gov/storage-services/service/pnp/highsm/10900/10900.jp2.

### EIN-M-0073 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Interior corridors, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey (image) <https://www.loc.gov/item/2010719742/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010719742/>

**Credit:** Carol M. Highsmith, Carol M. Highsmith Archive, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Interior corridors, Clarkson S. Fisher Federal Building & U.S. Courthouse, Trenton, New Jersey, 2010; photograph by Carol M. Highsmith.

**Sources:** EIN-S-0121

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0056

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0121 unreachable (https://www.loc.gov/item/2010719742/)

**Checker's reasoning:** The holder's snapshot supports the Trenton location, 2010 date, photographer, credit, and public-domain classification under the approved rights rule. The live API and item page could not be read through web or shell access, and search did not recover the record.

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 6 (EIN-F-0056). Interior corridor (no courtroom view exists in the Highsmith set 2010719731-47). jp2 4614x3258. Largest file listed: 4614x3258 https://tile.loc.gov/storage-services/service/pnp/highsm/10900/10907.jp2.

### EIN-M-0074 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** World War veterans leaving the Battery in a drizzling rain this morning for dollar-a-day jobs at government's reforestation camp at Fort Slocum / by World-Telegram staff photographer. (image) <https://www.loc.gov/item/2002709322/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known copyright restriction. For information see "New York World-Telegram & ..." (http://lcweb.loc.gov/rr/print/res/076\_nyw.html)" <https://www.loc.gov/item/2002709322/>

**Credit:** New York World-Telegram & Sun staff photographer, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): World War veterans leaving the Battery in a drizzling rain for dollar-a-day jobs at government's reforestation camp at Fort Slocum; by World-Telegram staff photographer, 1933.

**Sources:** EIN-S-0122

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0124

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0122 found (https://www.loc.gov/item/2002709322/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 4 (landed at the Battery, 17 Oct 1933, EIN-F-0124). The Battery, New York, 1933 (another event: veterans boarding a bus). NYWT&S staff photograph, rights 'No known copyright restriction'. 1024x813 service JPEG. Largest file listed: 1024x813 https://tile.loc.gov/storage-services/service/pnp/cph/3c30000/3c30000/3c30900/3c30900v.jpg.

### EIN-M-0075 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** \[Ulm, Wurtemburg, Germany\] (image) <https://www.loc.gov/item/2002720824/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2002720824/>

**Credit:** Detroit Publishing Co., Photochrom print collection, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): \[Ulm, Wurtemburg, Germany\], photochrom print, between ca. 1890 and ca. 1900.

**Sources:** EIN-S-0123

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0005

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0123 found (https://www.loc.gov/item/2002720824/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 1 (born in Ulm, EIN-F-0005). City view of Ulm a decade after his birth; does not show Bahnhofstrasse 20. 1024x756 service JPEG. Largest file listed: 1024x756 https://tile.loc.gov/storage-services/service/pnp/ppmsca/01100/01198v.jpg.

### EIN-M-0076 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** \[Albert Einstein speaking\] (image) <https://www.loc.gov/item/2016877613/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see Harris & Ewing Photographs - Rights and Restrictions Information https://www.loc.gov/rr/print/res/140\_harr.html" <https://www.loc.gov/item/2016877613/>

**Credit:** Harris & Ewing, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): \[Albert Einstein speaking\], Harris & Ewing glass negative, \[ca. 1940\].

**Sources:** EIN-S-0124

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015234-29d2, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0124 unreachable (https://www.loc.gov/item/2016877613/)

**Checker's reasoning:** The snapshot’s exact rights advisory qualifies as public-domain under the approved LoC rule, and its metadata supports the title, credit, and description. The live endpoint and item page could not be read through shell or web access; search did not retrieve the item.

**Notes:** LoC pass einstein-loc-2026-10-22 (2026-10-22, polite JSON API). Portrait item (not a basis photo): no place or event named in the record. Harris & Ewing; the advisory begins 'No known restrictions on publication'. 817x1024 service JPEG. Largest file listed: 817x1024 https://tile.loc.gov/storage-services/service/pnp/hec/28600/28667v.jpg.

### EIN-M-0077 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein Renounces German Citizenship (The daily worker, March 31, 1933) (document) <https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4>

**Credit:** Library of Congress, Chronicling America; The daily worker, March 31, 1933

**Alt text** (published as the image description): Newspaper item in The daily worker, March 31, 1933: Albert Einstein informed the German Consulate in Brussels that he is renouncing his German citizenship (EIN-F-0153).

**Sources:** EIN-S-0127

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0127 unreachable (https://www.loc.gov/resource/sn84020097/1933-03-31/ed-1/?sp=4)

**Checker's reasoning:** The rights statement does not establish unconditional public-domain status for this 1933 newspaper: it expressly allows copyrighted third-party material in newspapers less than 95 years old, and no approved advisory applies. The snapshot OCR supports the title and description, but the public-domain classification exceeds the evidence; the live source could not be read.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 7 (research R7-M-EIN-001). Chronicling America page, the same page as EIN-S-0127 (the source of EIN-F-0153). Rights: the LoC Chronicling America statement, the holder's own words, as NAI-M-0049/-0050; owner ruling 2026-10-27: 1933-1939 Chronicling America pages may display under LoC's rights statement. Article crop (IIIF region 3850,5270,640,580 of page 5237 x 6685): https://tile.loc.gov/image-services/iiif/service:ndnp:iune:batch\_iune\_fluorite\_ver01:data:sn84020097:0033289741A:1933033101:0324/3850,5270,640,580/full/0/default.jpg . Chapter: einstein/leaving. Authorship set on 2026-10-27: private (The daily worker) (private-writings rule, DECISIONS 2026-10-20): newspaper page; the holder's Chronicling America statement says the newspapers are in the public domain (owner ruling 2026-10-27).

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: 1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (newspapers under 95 years old); the ruling covers exactly that question.

### EIN-M-0078 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein Is to Renounce Citizenship (The daily Alaska empire, March 30, 1933) (document) <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; The daily Alaska empire, March 30, 1933

**Alt text** (published as the image description): Item in The daily Alaska empire, March 30, 1933: Prof. Einstein landed in Brussels from his trip to the United States (EIN-F-0154).

**Sources:** EIN-S-0128

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0128 unreachable (https://www.loc.gov/resource/sn83045499/1933-03-30/ed-1/?sp=1)

**Checker's reasoning:** The rights statement gives a qualified belief, allowing copyrighted third-party material in newspapers less than 95 years old; it does not strictly establish public-domain status for this 1933 article. The snapshot supports the title and Brussels description, but the public-domain classification overstates the evidence; live rights and OCR endpoints were unreachable.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 7 (research R7-M-EIN-002). Same page as EIN-S-0128 (the source of EIN-F-0154). Rights as EIN-M-0077 (owner ruling 2026-10-27). Article crop region 620 x 1260 of page 5166 x 6619. Chapter: einstein/leaving. Authorship set on 2026-10-27: private (The daily Alaska empire) (private-writings rule, DECISIONS 2026-10-20): newspaper page; the holder's Chronicling America statement says the newspapers are in the public domain (owner ruling 2026-10-27).

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: 1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (newspapers under 95 years old); the ruling covers exactly that question.

### EIN-M-0079 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923 (GhmF:149) (image) <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402049>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402049>

**Credit:** Göteborgs stadsmuseum, GhmF:149. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.

**Alt text** (published as the image description): Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923; King Gustaf was among those present (EIN-F-0151).

**Sources:** EIN-S-0129, EIN-S-0117

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0129 unreachable (https://kulturarvsdata.se/GSM/objekt/402049); EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/)

**Checker's reasoning:** The museum snapshot identifies this Einstein photograph, explicitly marks its media Public Domain Mark, and supports the credit, title and description. Both live sources were unreachable; reachability is reported separately under the specified rule.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): goteborgsstadsmuseum.se: Göteborgs stadsmuseum (records distributed through kulturarvsdata.se), secondary.

**Notes:** Round 7 (research R7-M-EIN-003). Holder Göteborgs stadsmuseum, record GhmF:149, read from its K-samsök RDF (EIN-S-0129): Licens / media 'Public Domain Mark'; copyright field 'Upphovsrätt utslocknad' (copyright expired); photographer Karnell (1871-1934), 1923. Owner ruling 2026-10-27: GhmF:147/148/149 rights are cleared and they may display (supersedes the earlier reference-only status for these items only). Image (lowres, 1500 x 1190): https://samlingar.goteborgsstadsmuseum.se/carlotta/web/image/zoom/1755919/GhmF\_149.jpg . Chapter: einstein/honoured.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: Göteborgs stadsmuseum GhmF:147/148/149: the holder's own record states 'Public Domain Mark; Upphovsrätt utslocknad', so the rights are cleared and they may display. This supersedes the earlier reference-only status for these items only.

### EIN-M-0080 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923 (GhmF:147) (image) <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402035>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402035>

**Credit:** Göteborgs stadsmuseum, GhmF:147. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.

**Alt text** (published as the image description): Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923.

**Sources:** EIN-S-0130, EIN-S-0117

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0130 found (https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402035); EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/)

**Checker's reasoning:** The museum’s own item page confirms Public Domain Mark, the photographer and dates, and the lecture’s identity, date and location; its description supports the caption. The Nobel lecture page could not be loaded.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): kulturarvsdata.se/GSM: Göteborgs stadsmuseum via K-samsök, secondary.

**Notes:** Round 7 (research R7-M-EIN-004). As EIN-M-0079, record GhmF:147 (K-samsök EIN-S-0130). Image: https://samlingar.goteborgsstadsmuseum.se/carlotta/web/image/zoom/1755913/GhmF\_147.jpg . Owner ruling 2026-10-27. Chapter: einstein/honoured.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: Göteborgs stadsmuseum GhmF:147/148/149: the holder's own record states 'Public Domain Mark; Upphovsrätt utslocknad', so the rights are cleared and they may display. This supersedes the earlier reference-only status for these items only.

### EIN-M-0081 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Albert Einstein, Nobel Prize lecture, Kongresshallen, Gothenburg, July 11, 1923 (GhmF:148) (image) <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402044>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402044>

**Credit:** Göteborgs stadsmuseum, GhmF:148. Photo: Anders Wilhelm Karnell (1871-1934). Public Domain Mark.

**Alt text** (published as the image description): Albert Einstein lectures to the Nordic Assembly of Naturalists in the Kongresshallen, Gothenburg, July 11, 1923; King Gustaf was among those present (EIN-F-0151).

**Sources:** EIN-S-0131, EIN-S-0117

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0131 unreachable (https://samlingar.goteborgsstadsmuseum.se/carlotta/web/object/402044); EIN-S-0117 unreachable (https://www.nobelprize.org/prizes/physics/1921/einstein/lecture/)

**Checker's reasoning:** The museum snapshot explicitly supplies Public Domain Mark, the photographer credit, and the depicted lecture’s date, venue, Nobel designation and royal attendee. Neither live source could be read; reachability is reported separately as required.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): kulturarvsdata.se/GSM: Göteborgs stadsmuseum (K-samsök), secondary

**Notes:** Round 7 (research R7-M-EIN-005). The photograph of EIN-M-0070, here backed by the holder's machine-readable K-samsök record (EIN-S-0131) instead of a browser snapshot of the JavaScript page (EIN-S-0118). Owner ruling 2026-10-27. Image: https://samlingar.goteborgsstadsmuseum.se/carlotta/web/image/zoom/1225994/GhmF\_148.jpg . Chapter: einstein/honoured.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: Göteborgs stadsmuseum GhmF:147/148/149: the holder's own record states 'Public Domain Mark; Upphovsrätt utslocknad', so the rights are cleared and they may display. This supersedes the earlier reference-only status for these items only.

### EIN-M-0082 (disputed)

- [ ] reject
- [ ] note: 

**Item:** A. Einstein, Zur Elektrodynamik bewegter Körper (Annalen der Physik und Chemie 1905: Vol 17 Iss 5) (document) <https://archive.org/details/sim_annalen-der-physik_1905_17_5/page/890>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "rightsCode: pdus" <https://catalog.hathitrust.org/api/volumes/brief/htid/uc1.31822005489497.json>

**Credit:** Annalen der Physik, 4. Folge, Bd. 17 (1905), S. 891. Scan: Internet Archive (Serials in Microfilm). Rights: HathiTrust, pdus (public domain in the US), volume ser.4 v.17.

**Alt text** (published as the image description): Albert Einstein's special theory of relativity is from 1905 (EIN-F-0156): the first page of A. Einstein, Zur Elektrodynamik bewegter Körper, in Annalen der Physik und Chemie 1905, Vol 17.

**Sources:** EIN-S-0132, EIN-S-0134

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0132 unreachable (https://archive.org/details/sim\_annalen-der-physik\_1905\_17\_5/page/890); EIN-S-0134 unreachable (https://catalog.hathitrust.org/api/volumes/brief/htid/uc1.31822005489497.json)

**Checker's reasoning:** The HathiTrust snapshot assigns pdus to the specified volume, but neither supplied snapshot defines that code as public domain in the US; the approved rule does not cover HathiTrust. The public-domain classification and credit therefore exceed the rights statement's explicit words.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): hathitrust.org: HathiTrust, institutional; archive.org: Internet Archive, institutional.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 7 (research R7-M-EIN-006). Rights: the scan holder (Internet Archive) gives none; the library statement for the same volume is HathiTrust uc1.31822005489497 rightsCode 'pdus', usRightsString 'Full view' (EIN-S-0134). Owner ruling 2026-10-27: the 1905 Annalen der Physik first pages may display (public domain by date, US, and EU since 2026; HathiTrust 'pdus' is the library rights statement). Leaf 114 of the IA item (1002 x 1596): https://archive.org/download/sim\_annalen-der-physik\_1905\_17\_5/sim\_annalen-der-physik\_1905\_17\_5\_jp2.zip/sim\_annalen-der-physik\_1905\_17\_5\_jp2%2Fsim\_annalen-der-physik\_1905\_17\_5\_0114.jp2&ext=jpg . Chapter: einstein/honoured.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: the 1905 Annalen der Physik first pages may display: the publication is public domain by date (US, and EU since 2026); HathiTrust 'pdus' is the library rights statement. The adversary (adv-20261027T090657-5f90) refuted the licence class on the statement's wording alone; the ruling covers exactly that question.

### EIN-M-0083 (disputed)

- [ ] reject
- [ ] note: 

**Item:** A. Einstein, Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt (Annalen der Physik und Chemie 1905: Vol 17 Iss 1) (document) <https://archive.org/details/sim_annalen-der-physik_1905_17_1/page/132>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "rightsCode: pdus" <https://catalog.hathitrust.org/api/volumes/brief/htid/uc1.31822005489497.json>

**Credit:** Annalen der Physik, 4. Folge, Bd. 17 (1905), S. 132. Scan: Internet Archive (Serials in Microfilm). Rights: HathiTrust, pdus (public domain in the US), volume ser.4 v.17.

**Alt text** (published as the image description): The first page of A. Einstein, Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt, in Annalen der Physik und Chemie 1905, Vol 17.

**Sources:** EIN-S-0133, EIN-S-0134

**Independent checker:** codex:gpt-6.1-sol (run adv-20261027T090657-5f90, 2026-10-27): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0133 unreachable (https://archive.org/details/sim\_annalen-der-physik\_1905\_17\_1/page/132); EIN-S-0134 unreachable (https://catalog.hathitrust.org/api/volumes/brief/htid/uc1.31822005489497.json)

**Checker's reasoning:** The HathiTrust snapshot assigns rightsCode: pdus to ser.4 v.17 but supplies no definition establishing public-domain status; the approved rights rule does not cover HathiTrust. The license and credit therefore exceed the statement’s explicit wording.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): hathitrust.org: HathiTrust Digital Library, institutional

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 7 (research R7-M-EIN-007). Rights as EIN-M-0082 (owner ruling 2026-10-27). No verified fact links this paper to the photoelectric effect (research R7-F-003 has one holder only: NobelPrize.org; IAS EIN-S-0008 words it differently, so no claim is covered by both); the tour shows it only with its own title and date. Leaf 143 of the IA item (1034 x 1596). Chapter: einstein/honoured.

**Review so far:** pending; note: 2026-10-27 project owner: Owner ruling 2026-10-27: the 1905 Annalen der Physik first pages may display: the publication is public domain by date (US, and EU since 2026); HathiTrust 'pdus' is the library rights statement. The adversary (adv-20261027T090657-5f90) refuted the licence class on the statement's wording alone; the ruling covers exactly that question.

### EIN-M-0084 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** \[The pier, Southampton, England\] (image) <https://www.loc.gov/item/2002708110/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2002708110/>

**Credit:** Photochrom Print Collection, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): \[The pier, Southampton, England\], photochrom print, between ca. 1890 and ca. 1900.

**Sources:** EIN-S-0136

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): EIN-F-0157

**Independent checker:** codex:gpt-6-sol (run adv-round9-einstein-2026-10-29c, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0136 found (https://www.loc.gov/item/2002708110/)

**Checker's reasoning:** no problem found

**Notes:** Round 9 (globe-to-map resource, 2026-10-29): place photograph for the departure pin (Southampton). City view about 35-40 years before 1933; it does not show Einstein or the Westernland. Service JPEG https://tile.loc.gov/storage-services/service/pnp/ppmsc/08800/08849r.jpg. Credit repaired 2026-10-29 after the adversary refuted 'Detroit Publishing Co.' as the creator (LoC names the Detroit Publishing catalogue only as the title source).

### EIN-M-0085 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein, Albert (1879-1955), Winteler-Einstein, Maja (1881-1951) (image) <https://doi.org/10.3932/ethz-a-000045771>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://doi.org/10.3932/ethz-a-000045771>

**Credit:** ETH Library Zurich, Image Archive / Portr\_03143-A

**Alt text** (published as the image description): Einstein siblings as children, 1885: Einstein, Albert (1879-1955), Winteler-Einstein, Maja (1881-1951) (ETH Library Zurich, Image Archive / Portr\_03143-A).

**Sources:** EIN-S-0137

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0137 found (https://library.ethz.ch/en/sammlungen-und-archive/platforms/einstein-online/jugend-1879-1896.html)

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): library.ethz.ch: ETH Library Zurich, institutional

**Notes:** Round 9 records (research R9-M-EIN-001, 2026-10-29). Chapter: einstein/birth. Shows: Albert Einstein and his sister Maja as children, studio portrait (holder: "Einstein siblings as children", dated 1885). Holder date: 1885. Resolution: holder master Portr\_03143-A.tif 25.17 MB; preview 868 x 1200 (holder 'Screen' derivative). Preview previews/ein-birth-eth-Portr\_03143-A.jpg sha256 29e34a35119747932a676d15911bf3eb2d48bdf1d790e5684f7c025c1ac8e787. Supports facts: none. Rights basis: Holder license field 'Public Domain Mark', availability 'Free download and use'. ETH-Bibliothek is not in the authority registry: needs an owner ruling like the Göteborg PDM one. Terms-of-use field also reads 'Rechte: ETH-Bibliothek, ETH Zürich / Ullstein Bild / The Granger Collection' (agency copies of the same print); the holder's own licence is PDM. No chapter fact names Maja or the 1885 date; label must quote the holder only. Shows the person at the start of his life, not the birth itself. (url written https.)

### EIN-M-0086 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Einstein (Connecticut Hebrew record (Hartford, Conn.), 1921-04-01, p. 19) (image) <https://www.loc.gov/resource/sn92051392/1921-04-01/ed-1/?sp=19>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn92051392/1921-04-01/ed-1/?sp=19>

**Credit:** Library of Congress, Chronicling America; Connecticut Hebrew record (Hartford, Conn.), 1921-04-01

**Alt text** (published as the image description): Newspaper page, Connecticut Hebrew record, April 1, 1921, p. 19: an article on Albert Einstein stating that he was born at Ulm in March, 1879.

**Sources:** EIN-S-0138

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0138 unreachable (https://www.loc.gov/resource/sn92051392/1921-04-01/ed-1/?sp=19)

**Checker's reasoning:** No problem found in the snapshot; the live item page and its text service could not be loaded.

**Notes:** Round 9 records (research R9-M-EIN-002, 2026-10-29). Chapter: einstein/birth. Shows: The item headed "Einstein (biographical article)" in its column; OCR: "Albert Einstein was born at Ulm in March, 1879, of Jewish parents." Holder date: 1921-04-01. Resolution: crop region 0,0,3609,4813 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:ct:batch\_ct\_hashbrown\_ver01:data:sn92051392:00516996390:1921040101:0297/0,0,3609,4813/2000,/0/default.jpg). Preview previews/ein-birth-cthebrewrecord-1921-04-01-p19.jpg sha256 5bcf54ad86f59b693f4b588a804d506fb419f999a883e0dae9cb75b62b0d89d8. Supports facts: EIN-F-0005. Rights basis: Pre-1931 US newspaper: public domain by date (owner rule: pre-1931 US publications); LoC Chronicling America statement. Preview is the whole page (3609 x 4813); the pipeline should crop to the article. A 1921 account of the birth, not a record made at the birth. Page snapshot snapshots/loc-sn92051392\_1921-04-01\_ed-1\_sp\_19.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages). Edit lock (2026-10-30): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30, 2026-10-30) cleared for re-verification.

### EIN-M-0087 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Will Renounce Citizenship (Evening star (Washington, D.C.), 1933-03-30, p. 3) (image) <https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1933-03-30

**Alt text** (published as the image description): Newspaper item, Evening star, March 30, 1933, p. A-3: Prof. Albert Einstein, now in Belgium, has taken steps to renounce his citizenship.

**Sources:** EIN-S-0139

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0139 unreachable (https://www.loc.gov/resource/sn83045462/1933-03-30/ed-1/?sp=3)

**Checker's reasoning:** The 1933 newspaper falls within the Library of Congress statement's under-95-years category, which says it may contain copyrighted third-party material. That qualified statement does not establish the item's public-domain classification.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-EIN-003, 2026-10-29). Chapter: einstein/leaving. Shows: The item headed "Will Renounce Citizenship" in its column; OCR: "Prof. Albert Einstein, who has decided to remain out of Germany and who now is in Belgium, has taken steps to renounce his Prussian citizenship." Holder date: 1933-03-30. Resolution: crop region 900,2700,1900,2200 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_1chagall\_ver01:data:sn83045462:00280601019:1933033001:0676/900,2700,1900,2200/full/0/default.jpg). Preview previews/ein-leaving-evestar-1933-03-30-p3.jpg sha256 e187e6fa62805d9e7166c606e9aa186ec9bead342c3c922478aacc9772e2b72e. Supports facts: EIN-F-0109. Rights basis: Owner ruling 2026-10-27: LoC Chronicling America 1933-1939 pages may display under LoC's statement. Item says 'Prussian citizenship' (as EIN-M-0078): do not narrate the Prussian wording as a verified fact. Page snapshot snapshots/loc-sn83045462\_1933-03-30\_ed-1\_sp\_3.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-27 (1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement): the adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### EIN-M-0088 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein, Albert (1879-1955) in Laeken, Belgium (image) <https://doi.org/10.3932/ethz-a-000045733>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public Domain Mark" <https://doi.org/10.3932/ethz-a-000045733>

**Credit:** ETH Library Zurich, Image Archive / Portr\_03079

**Alt text** (published as the image description): Einstein, Albert (1879-1955) in Laeken, Belgium, 1933 (ETH Library Zurich, Image Archive / Portr\_03079).

**Sources:** EIN-S-0140

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict unclear; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** EIN-S-0140 unreachable (https://doi.org/10.3932/ethz-a-000045733)

**Checker's reasoning:** The browser-supplied snapshot contains the holder's Public Domain Mark and supports the credit and caption, but the live item record could not be read to verify that statement.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): ethz.ch: ETH-Bibliothek Zürich, institutional.

**Why it is not verified:** G4: adversary verdict is unclear; G10: EIN-S-0140: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Round 9 records (research R9-M-EIN-004, 2026-10-29). Chapter: einstein/leaving. Shows: Einstein in Laeken, Belgium, in 1933 (holder title and dating only). Holder date: 1933. Resolution: holder master Portr\_03079.tif 23.86 MB; preview 1293 x 1200. Preview previews/ein-leaving-eth-Portr\_03079.jpg sha256 2b89cae0cb0ad207376adc578a1388690c77b49098795af9343aa855fef2f69b. Supports facts: EIN-F-0109, EIN-F-0153. Rights basis: Holder license 'Public Domain Mark', terms 'Rechte: ETH-Bibliothek'. Needs owner ruling (ETH not registered). Places him in Belgium in 1933 (context for EIN-F-0153, the Brussels consulate); the holder gives no month. (url written https.)

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: ETH-Bibliothek items with the holder's Public Domain Mark may display. The snapshot is the holder record's fields read in the E-Pics app (a browser snapshot); the adversary found the Public Domain Mark in it but could not reach the live JavaScript page, so its verdict is unclear on that live check alone.

### EIN-M-0089 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein Is Hurried Through New York Without Reception (Evening star (Washington, D.C.), 1933-10-17, p. 2) (image) <https://www.loc.gov/resource/sn83045462/1933-10-17/ed-1/?sp=2>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1933-10-17/ed-1/?sp=2>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1933-10-17

**Alt text** (published as the image description): Newspaper item, Evening star, October 17, 1933, p. A-2: Einstein is hurried through New York without reception (EIN-F-0122, EIN-F-0125).

**Sources:** EIN-S-0141

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0141 unreachable (https://www.loc.gov/resource/sn83045462/1933-10-17/ed-1/?sp=2)

**Checker's reasoning:** The Library of Congress says this 1933 newspaper is believed to be in the public domain but warns that it may contain copyrighted third-party material. That wording does not establish the recorded public-domain classification under the approved rule.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-EIN-005, 2026-10-29). Chapter: einstein/arriving. Shows: The item headed "Einstein Is Hurried Through New York Without Reception" in its column; OCR: "When Prof. Albert Einstein arrived from Europe on the Westernland today he was hurried off the liner into a tug" Holder date: 1933-10-17. Resolution: crop region 1500,150,1900,2400 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_1duchamp\_ver01:data:sn83045462:00280601305:1933101701:0478/1500,150,1900,2400/full/0/default.jpg). Preview previews/ein-arriving-evestar-1933-10-17-p2.jpg sha256 0210488eb8f885f47a77866fbb158ba76c0ea6d7791e39a8962948498107529a. Supports facts: EIN-F-0122, EIN-F-0123, EIN-F-0125. Rights basis: Owner ruling 2026-10-27: LoC Chronicling America 1933-1939 pages may display under LoC's statement. Page snapshot snapshots/loc-sn83045462\_1933-10-17\_ed-1\_sp\_2.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-27 (1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement): the adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### EIN-M-0090 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Dr. Einstein Slips Into New York (The Washington times (Washington \[D.C.\]), 1933-10-17, p. 1) (image) <https://www.loc.gov/resource/sn84026749/1933-10-17/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn84026749/1933-10-17/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; The Washington times (Washington \[D.C.\]), 1933-10-17

**Alt text** (published as the image description): The Washington times, October 17, 1933, p. 1: Dr. Einstein slips into New York (EIN-F-0123, EIN-F-0124).

**Sources:** EIN-S-0103

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0103 unreachable (https://www.loc.gov/resource/sn84026749/1933-10-17/ed-1/?sp=1)

**Checker's reasoning:** The 1933 newspaper falls within the rights statement’s warning that newer issues may contain copyrighted third-party material; the statement does not establish that this page is wholly public domain. The live item page could not be loaded.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-EIN-006, 2026-10-29). Chapter: einstein/arriving. Shows: The item headed "Dr. Einstein Slips Into New York" in its column; OCR: "he and his crowd-fearing wife were whisked from their liner to a tug, landed at the battery" Holder date: 1933-10-17. Resolution: crop region 500,1900,1900,2400 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_deanwood\_ver01:data:sn84026749:0020569657A:1933101701:1195/500,1900,1900,2400/full/0/default.jpg). Preview previews/ein-arriving-washtimes-1933-10-17-p1.jpg sha256 89c9cd7964f1294e97560dad56fcb78f98b290dddfbda0dc342b2d62198223d6. Supports facts: EIN-F-0123, EIN-F-0124, EIN-F-0125. Rights basis: Owner ruling 2026-10-27: LoC Chronicling America 1933-1939 pages may display under LoC's statement. Page snapshot snapshots/loc-sn84026749\_1933-10-17\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-27 (1933-1939 Library of Congress Chronicling America newspaper pages may display under LoC's rights statement): the adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### EIN-M-0091 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein, Serious Of Face, Becomes American Citizen (Imperial Valley press (El Centro, Calif.), 1940-10-01, p. 1) (image) <https://www.loc.gov/resource/sn92070146/1940-10-01/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn92070146/1940-10-01/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; Imperial Valley press (El Centro, Calif.), 1940-10-01

**Alt text** (published as the image description): Front-page item, Imperial Valley press, October 1, 1940: Einstein becomes an American citizen at Trenton, in the presence of Judge Phillip Forman.

**Sources:** EIN-S-0142

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0142 unreachable (https://www.loc.gov/resource/sn92070146/1940-10-01/ed-1/?sp=1)

**Checker's reasoning:** The 1940 newspaper is less than 95 years old, and the Library of Congress statement warns that such issues may contain copyrighted third-party material. That statement does not establish a public-domain license for this page.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-EIN-009, 2026-10-29). Chapter: einstein/citizen. Shows: The item headed "Einstein, Serious Of Face, Becomes American Citizen" in its column; OCR: "Dr. Albert Einstein became a citizen of the United States today. With 87 other aliens" Holder date: 1940-10-01. Resolution: crop region 1000,5000,1900,1900 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:curiv:batch\_curiv\_roseheath\_ver01:data:sn92070146:00414188898:1940100101:0375/1000,5000,1900,1900/full/0/default.jpg). Preview previews/ein-citizen-ivpress-1940-10-01-p1.jpg sha256 58b430353dc7aa007bd74f2b74df23f70d6571f74813d846437294f8cfada978. Supports facts: EIN-F-0051. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. Page snapshot snapshots/loc-sn92070146\_1940-10-01\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### EIN-M-0092 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Einstein Dies At Princeton (Evening star (Washington, D.C.), 1955-04-18, p. 1) (image) <https://www.loc.gov/resource/sn83045462/1955-04-18/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn83045462/1955-04-18/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; Evening star (Washington, D.C.), 1955-04-18

**Alt text** (published as the image description): Evening star, April 18, 1955: Einstein Dies At Princeton (EIN-F-0006).

**Sources:** EIN-S-0143

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30b, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** EIN-S-0143 unreachable (https://www.loc.gov/resource/sn83045462/1955-04-18/ed-1/?sp=1)

**Checker's reasoning:** The Library of Congress says this 1955 newspaper is believed to be in the public domain but warns that it may contain copyrighted third-party material. That wording does not establish the recorded public-domain class under the approved rule.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-EIN-010, 2026-10-29). Chapter: einstein/legacy. Shows: The item headed "Einstein Dies At Princeton; Ill Four Days" in its column; OCR: "Einstein Dies At Princeton; Ill Four Days Only His Intimates Knew Scientist, 76, Was Stricken" Holder date: 1955-04-18. Resolution: crop region 2900,600,2182,3000 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:dlc:batch\_dlc\_idomeneo\_ver01:data:sn83045462:00280607058:1955041801:0257/2900,600,2182,3000/2000,/0/default.jpg). Preview previews/ein-legacy-evestar-1955-04-18-p1.jpg sha256 3787636557721f248c383b453b9af42903100a6012c98adb2cdccdc39c835b3a. Supports facts: EIN-F-0006. Rights basis: LoC Chronicling America page OUTSIDE the ruled 1933-1939 range: needs the owner to extend the 2026-10-27 ruling to this year (brief lists CA pages generally). Shown only after that. The page also carries a Wide World photo of Einstein; show the page/headline crop, and do not crop the agency photo out as a separate image. Page snapshot snapshots/loc-sn83045462\_1955-04-18\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: Library of Congress Chronicling America pages of 1940-1961 may display under LoC's rights statement. The adversary refuted the licence class on that statement's wording alone (a page under 95 years old); the ruling covers exactly that question.

### EIN-M-0093 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Sachs, Alexander (President's Secretary's File, Safe Files, Franklin D. Roosevelt Library) (image) <https://catalog.archives.gov/medialive/74/6088/16608874/content/arcmedia/presidential-libraries/roosevelt/psf/psfa0064.pdf>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/16608874>

**Credit:** Franklin D. Roosevelt Library, National Archives; President's Secretary's File, Safe Files, Sachs, Alexander

**Alt text** (published as the image description): Sachs, Alexander: a file of the President's Secretary's File, Safe Files, Franklin D. Roosevelt Library, psfa0064.pdf (EIN-F-0135, EIN-F-0110).

**Sources:** EIN-S-0105

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-einstein-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right no.

**Live check per source:** EIN-S-0105 unreachable (https://catalog.archives.gov/id/16608874)

**Checker's reasoning:** The snapshot describes an Alexander Sachs file but does not establish that its contents were written by Franklin D. Roosevelt or belong to Albert Einstein. Its “Unrestricted” status alone cannot establish public-domain rights for private writings, and the alt text adds identifiers absent from the holder’s record.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information; G4: adversary did not accept the source type

**Notes:** Round 9 records (research R9-M-EIN-007, 2026-10-29). Chapter: einstein/history. Shows: The typed White House memorandum with F. D. R.'s initials (page 7 of the Sachs file). Holder date: 1939-10-13. Resolution: PDF page 720 x 702 pt; preview rendered at 120 dpi. Preview previews/ein-history-fdr-memo-1939-10-13-07.jpg sha256 62b47b4b922f8008ba1da5a020a3c3c150f3d3b7efcfee117af08fd90134303a. Supports facts: EIN-F-0110, EIN-F-0135. Rights basis: NARA 'Unrestricted' + federal authorship (3.4.1). Page 7 only; the file also holds Sachs's and Einstein's private letters (Sachs d. 1973 -\> his letters link-only). Pages shown: 7 (memorandum for General Watson, 13 Oct 1939) and 9 (the President's reply to Einstein, 19 Oct 1939, carbon), research R9-M-EIN-008 folded into this record. url: the file unit's digital object psfa0064.pdf (catalog.archives.gov/id/16608874 is the url of the rejected EIN-M-0049, the Einstein letter, superseded by EIN-M-0063). Authorship set on 2026-10-30: federal (Franklin D. Roosevelt) (private-writings rule, DECISIONS 2026-10-20): round 9 records 2026-10-30.

## 8. Draft content (89 units)

Each line is one unit of drafts/profile.json or of the experience chapters (content:...) and the facts it cites. Included units are in wordpress.html; withheld ones are not, for the reason given. The final export also needs, for each sentence, title and caption, a current "supported" verdict from the sentence adversary (drafts/grounding.jsonl, G6).

- [ ] profile:summary:0: Albert Einstein was born 14 March 1879 in Ulm, Germany. (facts EIN-F-0005; included)
- [ ] profile:summary:1: Albert Einstein died on April 18, 1955 at Princeton, New Jersey. (facts EIN-F-0006, EIN-F-0050; included)
- [ ] profile:sections:citizenship:0: The Declaration of Intention for Albert Einstein is from January 15, 1936. (facts EIN-F-0045; included)
- [ ] profile:sections:citizenship:1: A photograph of Albert Einstein is affixed to the Declaration of Intention. (facts EIN-F-0057; included)
- [ ] profile:sections:citizenship:2: His Petition for Naturalization has petition number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton. (facts EIN-F-0056; included)
- [ ] profile:sections:citizenship:3: In 1940, Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship. (facts EIN-F-0051; included)
- [ ] profile:sections:citizenship:4: The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance. (facts EIN-F-0001; included)
- [ ] profile:sections:citizenship:title: Citizenship (facts EIN-F-0045, EIN-F-0057, EIN-F-0056, EIN-F-0051, EIN-F-0001; included)
- [ ] profile:sections:navy:0: Albert Einstein was working as a consultant to the United States Government during World War II. (facts EIN-F-0054; included)
- [ ] profile:sections:navy:1: Albert Einstein was doing research for the Bureau of Ordnance, in his study at Princeton, N.J. (facts EIN-F-0055; included)
- [ ] profile:sections:navy:2: Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer of the Research and Development Division. (facts EIN-F-0062; included)
- [ ] profile:sections:navy:3: The letters relate to his research with the Research and Development Division of the Navy, specifically underwater explosions and a proposed electromagnetic torpedo detonator. (facts EIN-F-0063; included)
- [ ] profile:sections:navy:4: His letter of May 17, 1943 is in regards to Albert Einstein participating in the Research and Development Division of the Navy to research Navy problems. (facts EIN-F-0064; included)
- [ ] profile:sections:navy:5: His letter of June 18, 1943 discusses his idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship. (facts EIN-F-0065; included)
- [ ] profile:sections:navy:6: In a letter of June 29, 1943, Albert Einstein says that he will not be able to come to Washington, DC for health reasons. (facts EIN-F-0066; included)
- [ ] profile:sections:navy:7: In a letter of July 30, 1943, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship. (facts EIN-F-0067; included)
- [ ] profile:sections:navy:8: In a letter of August 13, 1943, Albert Einstein mentions an offer from Dr. Vannever Bush to accept an appointment as a consultant to Division 8 of the National Research Committee. (facts EIN-F-0068; included)
- [ ] profile:sections:navy:9: Signed copies of a contract and naturalization papers were enclosed with that letter. (facts EIN-F-0069; included)
- [ ] profile:sections:navy:10: In a letter of August 22, 1943, Albert Einstein gives his opinion on the best localization for installation of the torpedo explosion. (facts EIN-F-0070; included)
- [ ] profile:sections:navy:11: In a letter of September 1, 1943, Albert Einstein discusses the need to carry out experiments, as he will not be able to progress any further in the problem through mathematical calculation. (facts EIN-F-0071; included)
- [ ] profile:sections:navy:12: His letter of January 4, 1944 discusses his idea to have a torpedo positioned parallel to the wall of a ship before it exploded. (facts EIN-F-0072; included)
- [ ] profile:sections:navy:13: When he worked the problem out, the idea of a torpedo positioned parallel to the wall of a ship proved impossible. (facts EIN-F-0073; included)
- [ ] profile:sections:navy:14: His letter of October 15, 1944 discusses quick compression in a metal container. (facts EIN-F-0074; included)
- [ ] profile:sections:navy:title: Research for the Navy (facts EIN-F-0054, EIN-F-0055, EIN-F-0062, EIN-F-0063, EIN-F-0064, EIN-F-0065, EIN-F-0066, EIN-F-0067, EIN-F-0068, EIN-F-0069, EIN-F-0070, EIN-F-0071, EIN-F-0072, EIN-F-0073, EIN-F-0074; included)
- [ ] profile:sections:atomic:0: Albert Einstein was Chairman of the Emergency Committee of Atomic Scientists. (facts EIN-F-0080; included)
- [ ] profile:sections:atomic:1: In a letter of October 11, 1947, Albert Einstein wrote on behalf of the Emergency Committee of Atomic Scientists regarding questions, topics, and warnings concerning the use of nuclear or atomic resources as a means for diplomatic or military solutions. (facts EIN-F-0079; included)
- [ ] profile:sections:atomic:2: In a letter of November 29, 1947, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control. (facts EIN-F-0075; included)
- [ ] profile:sections:atomic:3: In a letter of November 29, 1947, Albert Einstein pushes for an effort in public education about atomic energy. (facts EIN-F-0078; included)
- [ ] profile:sections:atomic:4: The letter includes the article Atomic War or Peace, authored by Albert Einstein. (facts EIN-F-0076; included)
- [ ] profile:sections:atomic:5: In Atomic War or Peace, Albert Einstein discusses his opinion on the need of a supranational agreement for the regulation and use of nuclear weaponry. (facts EIN-F-0077; included)
- [ ] profile:sections:atomic:title: Emergency Committee of Atomic Scientists (facts EIN-F-0080, EIN-F-0079, EIN-F-0075, EIN-F-0078, EIN-F-0076, EIN-F-0077; included)
- [ ] profile:timeline:0: Albert Einstein was born 14 March 1879 in Ulm, Germany. (facts EIN-F-0005; included)
- [ ] profile:timeline:1: The Declaration of Intention for Albert Einstein is from January 15, 1936. (facts EIN-F-0045; included)
- [ ] profile:timeline:2: In 1940, Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship. (facts EIN-F-0051; included)
- [ ] profile:timeline:3: In a letter of June 18, 1943 to Lieutenant Stephen Brunauer, Albert Einstein discusses his idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship. (facts EIN-F-0065; included)
- [ ] profile:timeline:4: In a letter of November 29, 1947, Albert Einstein writes as Chairman of the Emergency Committee of Atomic Scientists discussing the issue of international atomic energy control. (facts EIN-F-0075; included)
- [ ] profile:timeline:5: Albert Einstein died on April 18, 1955 at Princeton, New Jersey. (facts EIN-F-0006; included)
- [ ] content:einstein-1:title: American citizenship (facts EIN-F-0051; included)
- [ ] content:einstein-1:narration:c1: Albert Einstein immigrated to the United States. (facts EIN-F-0108; included)
- [ ] content:einstein-1:narration:c2: In 1933 Albert Einstein renounced his German citizenship. (facts EIN-F-0109; included)
- [ ] content:einstein-1:narration:c4: The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance. (facts EIN-F-0001; included)
- [ ] content:einstein-1:narration:c5: The Declaration of Intention for Albert Einstein is from 15 January 1936. (facts EIN-F-0045; included)
- [ ] content:einstein-1:narration:c6: A photograph of Albert Einstein is affixed to the Declaration of Intention. (facts EIN-F-0057; included)
- [ ] content:einstein-1:narration:c8: Albert Einstein's Petition for Naturalization has petition number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton. (facts EIN-F-0056; included)
- [ ] content:einstein-1:narration:c10: Albert Einstein was photographed receiving from Judge Phillip Forman his certificate of American citizenship. (facts EIN-F-0051; included)
- [ ] content:einstein-1:exhibit:ex1: Albert Einstein, 1879-1955 (facts EIN-F-0005, EIN-F-0006; included)
- [ ] content:einstein-1:exhibit:ex2: Certificate of Arrival (facts EIN-F-0001; included)
- [ ] content:einstein-1:exhibit:ex2:note:0: The record of naturalization for Albert Einstein at the National Archives at Philadelphia includes a Certificate of Arrival, Declaration of Intention, Petition for Naturalization, and Oath of Allegiance. (facts EIN-F-0001; included)
- [ ] content:einstein-1:exhibit:ex3: Declaration of Intention and Petition for Naturalization for Albert Einstein (facts EIN-F-0001; included)
- [ ] content:einstein-1:exhibit:ex3:note:0: A photograph of Albert Einstein is affixed to the Declaration of Intention. (facts EIN-F-0057; included)
- [ ] content:einstein-1:exhibit:ex4: Petition for Naturalization, petition number 4009 (facts EIN-F-0056; included)
- [ ] content:einstein-1:exhibit:ex4:note:0: Albert Einstein's Petition for Naturalization has petition number 4009, assigned by the U.S. District Court for the District of New Jersey, Trenton. (facts EIN-F-0056; included)
- [ ] content:einstein-2:title: The study at 112 Mercer Street (facts EIN-F-0087; included)
- [ ] content:einstein-2:narration:c1: Albert Einstein had a home study at 112 Mercer Street, Princeton, New Jersey. (facts EIN-F-0087; included)
- [ ] content:einstein-2:narration:c2: Albert Einstein was working as a consultant to the United States Government during World War II. (facts EIN-F-0054; included)
- [ ] content:einstein-2:narration:c3: Albert Einstein was doing research for the Bureau of Ordnance, in his study at Princeton, N.J. (facts EIN-F-0055; included)
- [ ] content:einstein-2:narration:c4: Nine letters were written by Albert Einstein to Lieutenant Stephen Brunauer of the Research and Development Division. (facts EIN-F-0062; included)
- [ ] content:einstein-2:narration:c5: The letters relate to Albert Einstein's research with the Research and Development Division of the Navy, specifically underwater explosions and a proposed electromagnetic torpedo detonator. (facts EIN-F-0063; included)
- [ ] content:einstein-2:narration:c6: Albert Einstein's letter of June 18, 1943 to Lieutenant Stephen Brunauer discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship. (facts EIN-F-0065; included)
- [ ] content:einstein-2:narration:c7: In a letter of July 30, 1943, Albert Einstein reveals that he has come up with a mathematical simplification to analyze the impact an underwater explosion would have on the hull of an armored ship. (facts EIN-F-0067; included)
- [ ] content:einstein-2:narration:c8: Signed copies of a contract and naturalization papers were enclosed with Albert Einstein's letter of August 13, 1943 to Lieutenant Stephen Brunauer. (facts EIN-F-0069; included)
- [ ] content:einstein-2:narration:c9: 112 Mercer Street remained Albert Einstein's home until his death in 1955. (facts EIN-F-0107; included)
- [ ] content:einstein-2:narration:c10: In this room, a corner recreates Einstein's study at Princeton, N.J., as two 1943 National Archives photographs show it. (facts EIN-F-0055; withheld: number 2 not in cited claims; year 1943 not in cited claims; word 'room' not in cited claims; word 'corner' not in cited claims; word 'recreates' not in cited claims; name 'National' not in cited claims; name 'Archives' not in cited claims; word 'photographs' not in cited claims; word 'show' not in cited claims)
- [ ] content:einstein-2:exhibit:ex1: Albert Einstein in his study at Princeton, N.J. (facts EIN-F-0055; included)
- [ ] content:einstein-2:exhibit:ex1:note:0: Dr. Albert Einstein is doing research for the Bureau of Ordnance, in his study at Princeton, N.J. (facts EIN-F-0055; included)
- [ ] content:einstein-2:exhibit:ex2: Albert Einstein had a study at his Princeton, N.J. home (facts EIN-F-0086; included)
- [ ] content:einstein-2:exhibit:ex2:note:0: Albert Einstein had a study at his Princeton, N.J. home. (facts EIN-F-0086; included)
- [ ] content:einstein-2:exhibit:ex3: Albert Einstein's letter of June 18, 1943 to Lieutenant Stephen Brunauer (facts EIN-F-0065; included)
- [ ] content:einstein-2:exhibit:ex3:note:0: Albert Einstein's letter of June 18, 1943 to Lieutenant Stephen Brunauer discusses Albert Einstein's idea of an electro-magnetic device that will automatically explode a torpedo as it passes underneath a ship. (facts EIN-F-0065; included)
- [ ] content:einstein-3:title: Smithsonian Institution, 1921 (facts EIN-F-0121; included)
- [ ] content:einstein-3:narration:c1: In 1921, Prof. Albert Einstein was at the meeting of the National Academy of Sciences at the Smithsonian Institution. (facts EIN-F-0121; included)
- [ ] content:einstein-3:narration:c2: Harding, Prof. Einstein and his wife were photographed in 1921, on April 25. (facts EIN-F-0105; included)
- [ ] content:einstein-3:narration:c3: Albert Einstein and Warren Harding were with a group at the White House, Washington, D.C. (facts EIN-F-0117; included)
- [ ] content:einstein-3:narration:c4: Albert Einstein was with his wife Elsa in Washington, D.C., with the State, War, and Navy building in the background. (facts EIN-F-0093; included)
- [ ] content:einstein-3:narration:c5: Prof. Einstein and his wife were photographed in 1921. (facts EIN-F-0118; included)
- [ ] content:einstein-3:exhibit:ex1: Harding, Prof. Einstein and his wife, 1921 (facts EIN-F-0105; included)
- [ ] content:einstein-3:exhibit:ex1:note:0: Harding, Prof. Einstein and his wife were photographed in 1921, on April 25. (facts EIN-F-0105; included)
- [ ] content:einstein-3:exhibit:ex2: Albert Einstein and Warren Harding with a group at the White House (facts EIN-F-0117; included)
- [ ] content:einstein-3:exhibit:ex2:note:0: Albert Einstein and Warren Harding were with a group at the White House, Washington, D.C. (facts EIN-F-0117; included)
- [ ] content:einstein-3:exhibit:ex3: Albert Einstein with his wife Elsa in Washington, D.C. (facts EIN-F-0093; included)
- [ ] content:einstein-3:exhibit:ex3:note:0: Albert Einstein was with his wife Elsa in Washington, D.C., with the State, War, and Navy building in the background. (facts EIN-F-0093; included)
- [ ] content:einstein-3:exhibit:ex4: Prof. Einstein and his wife, 1921 (facts EIN-F-0118; included)
- [ ] content:einstein-3:exhibit:ex4:note:0: Prof. Einstein and his wife were photographed in 1921. (facts EIN-F-0118; included)
- [ ] content:einstein-4:title: San Diego, 1930 (facts EIN-F-0114; included)
- [ ] content:einstein-4:narration:c1: In 1930, Albert Einstein and Elsa Einstein arrived in San Diego on the Belgenland. (facts EIN-F-0120; included)
- [ ] content:einstein-4:narration:c2: On Dec. 31, 1930, Einstein and Mrs. Einstein were with a reception committee at San Diego. (facts EIN-F-0113; included)
- [ ] content:einstein-4:narration:c3: In San Diego, Einstein was greeted by Mayor Harry C. Clark. (facts EIN-F-0115; included)
- [ ] content:einstein-4:exhibit:ex1: Albert Einstein and Elsa Einstein in San Diego, 1930 (facts EIN-F-0120; included)
- [ ] content:einstein-4:exhibit:ex1:note:0: In 1930, Albert Einstein and Elsa Einstein arrived in San Diego on the Belgenland. (facts EIN-F-0120; included)

## 9. Avatar lines (2)

Quote lines are the inductee's exact words. Narration in the inductee's voice is shown on the site labelled "AI recreation".

- [ ] profile:avatar_lines:0 (guide, narration): Albert Einstein was born 14 March 1879 in Ulm, Germany. (facts EIN-F-0005)
- [ ] profile:avatar_lines:1 (guide, narration): Albert Einstein was Chairman of the Emergency Committee of Atomic Scientists. (facts EIN-F-0080)

## 10. How to cite

Generated from inductee.json for the page; it states no fact about the inductee. A how_to_cite text in drafts/profile.json is not published.

Albert Einstein. Immigrant Hall of Honor. https://immigranthallofhonor.org/inductees/inductee-albert-einstein/

## 11. Gaps (15)

Parts of the life story with no verified source yet. These are not errors.

- Education: no verified source yet; no fact in facts.jsonl covers schooling, university study or doctorate (candidates from the Nobel Prize Outreach biography, ETH/UZH pages and the IHH page are deferred in staging, unconfirmed).
- Family: no verified source yet; EIN-F-0042 (family background) is single-source (EIN-S-0008, IAS); marriages, spouses and children have no fact (candidates deferred, unconfirmed).
- Arrival in the United States: no verified source yet for an arrival date, port or ship; EIN-F-0007 (verified) gives no date or place; EIN-F-0004 is single-source (IHH page only), EIN-F-0015 and EIN-F-0043 are disputed, EIN-F-0026, EIN-F-0049 and EIN-F-0052 are single-source; departure-year wording conflicts across these sources and is unresolved.
- Citizenship: EIN-F-0013 (German citizenship) and EIN-F-0014 (renunciation) are disputed (Franklin Institute source judged not an authority for the claim); EIN-F-0016 (US citizenship year) is disputed; EIN-F-0044, EIN-F-0046 and EIN-F-0047 (Declaration of Intention details) are single-source (EIN-S-0012, LoC).
- Career and main work: the scientific work before 1933 has no verified fact; EIN-F-0009, EIN-F-0017, EIN-F-0018, EIN-F-0019, EIN-F-0022 and EIN-F-0023 are single-source (Nobel Prize Outreach pages) and EIN-F-0011, EIN-F-0012, EIN-F-0020 and EIN-F-0021 are disputed; appointments in Zurich, Prague and Berlin have no fact (deferred, unconfirmed).
- Awards and honors: only the Copley Medal (EIN-F-0024) is verified; EIN-F-0025 (Franklin Medal) is disputed; the Nobel Prize in Physics has no fact in facts.jsonl (Nobel Prize Outreach candidates deferred, unconfirmed); other honors named on the IHH page (Royal Astronomical Society Gold Medal, Max Planck Medal, element name, US stamps, magazine title) have no independent source.
- Legacy: no verified fact; no fact carries a legacy category (Einstein House National Historic Landmark candidates from NARA are deferred and the NPS nomination text was image-only; EIN-M-0007 and EIN-M-0017 are media only).
- Birth: EIN-F-0042 (birth-year family background) is single-source and EIN-F-0053 (birthday) is disputed (LoC folklife blog and NPS page judged not authorities for the claim); EIN-F-0005 is verified.
- Identity: EIN-F-0028 and EIN-F-0032 to EIN-F-0041 (NARA authority heading and variant names) are single-source (EIN-S-0006); EIN-F-0048 (career) is single-source; the LoC name authority record could not be snapshotted (bot challenge). Catalogue metadata EIN-F-0002, EIN-F-0003, EIN-F-0029 to EIN-F-0031, EIN-F-0058 to EIN-F-0061 and EIN-F-0081 was withdrawn.
- IHH page claims with no independent source: EIN-F-0004 rests only on EIN-S-0002; 19 IHH page candidates (education, 1905 and 1915 papers, honors and namings, stamps) were deferred in staging/deferred-einstein-2026-10-09/baseline.jsonl and are unconfirmed.
- Pending review: every fact in facts.jsonl still has review state pending; no fact has been confirmed by a human reviewer.
- Media licences: EIN-M-0001 and EIN-M-0020 to EIN-M-0024 (Wikimedia Commons files) are disputed because the public-domain statement comes from Commons, not the holder; EIN-M-0011 is rights-restricted; EIN-M-0002 to EIN-M-0010 and EIN-M-0012 to EIN-M-0019 carry licence class unknown; only EIN-M-0025 (cc-by), EIN-M-0026 and EIN-M-0027 (cc0) have a usable licence class.
- Sections resting on one fact: the Copley Medal section rests only on EIN-F-0024; the Institute for Advanced Study section rests on two facts (EIN-F-0008, EIN-F-0027).
- Search families that found nothing: NARA found no passenger or crew list, visa, FBI file or catalog item for the 1939 letter to Roosevelt (EIN-Q-0075, EIN-Q-0077, EIN-Q-0078, EIN-Q-0081, EIN-Q-0091); LoC 'Einstein arrives' had no results (EIN-Q-0056); the Einstein Archives site had no biographical content (EIN-Q-0027); Smithsonian unit searches were rate-limited or bot-blocked (EIN-Q-0067, EIN-Q-0068, EIN-Q-0099, EIN-Q-0104 to EIN-Q-0106); National Postal Museum stamp searches returned nothing usable (EIN-Q-0014, EIN-Q-0015); the NPS NHL nomination was image-only (EIN-Q-0111); RAS Gold Medal and Princeton Einstein Papers volumes were a PDF or paywalled (EIN-Q-0032, EIN-Q-0033).
- Deferred over the fact cap: about 130 candidate facts are held in staging/deferred-einstein-2026-10-09 (baseline 19, domain 47, institutional 30, loc 24, nara 4, media 5, smithsonian 4); several cover the empty stages above (education, family, Nobel Prize, legacy) and none has been checked by the adversary.

## 12. Rejected (12)

Kept in the log for the record; no action needed.

- EIN-F-0002: Albert Einstein's U.S. Name is Albert Einstein.
- EIN-F-0003: Albert Einstein's Birth Name is Albert Einstein.
- EIN-F-0029: Albert Einstein's birthDate year is 1879.
- EIN-F-0030: Albert Einstein's deathDate year is 1955.
- EIN-F-0031: The importRecordControlNumber of the authority heading Einstein, Albert, 1879-1955 is n 79022889.
- EIN-F-0058: The Declaration of Intention and Petition for Naturalization for Albert Einstein has a coverageStartDate of 1936-01-03.
- EIN-F-0059: The Declaration of Intention and Petition for Naturalization for Albert Einstein has a coverageEndDate of 1940-10-01.
- EIN-F-0060: The Time Card for Albert Einstein has a coverageStartDate of 1943-07-01.
- EIN-F-0061: The Time Card for Albert Einstein has a coverageEndDate of 1944-06-30.
- EIN-F-0081: Albert Einstein, 14 Mar 1879 - 18 Apr 1955, is the Sitter in a National Portrait Gallery Photograph.
- EIN-F-0158: On October 19, 1939, President Roosevelt wrote to Albert Einstein that he had convened a Board to thoroughly investigate the possibilities of his suggestion regarding the element of uranium.
- EIN-M-0049: Letter from Albert Einstein to President Franklin D. Roosevelt
