# Review checklist: John Muir (muir)

Generated 2026-11-02 by tools/export.py (preview export).

This is a preview. Every block of wordpress.html is stamped "DRAFT — NOT REVIEWED"; do not publish it.

Facts: conflicting 1, disputed 12, rejected 10, single-source 79, verified 51. Media: disputed 21, verified 80.

How to use this checklist: for each item, open the source link and find the quote, then tick one box (for an edit, write the new wording). Return the file to the maintainer, who records the decisions in review/decisions.jsonl and runs tools/apply_review.py. Approval does not override the checks: only verified items can be approved and published. Disputed, conflicting and single-source items can be edited (then checked again), rejected, or given a note.

## 1. Disputed: the independent checker did not agree (12)

### MUI-F-0025 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1849, in February, the Muir family emigrated from Glasgow to New York, the trip taking six weeks by sailing ship, then via the Great Lakes and wagon to Fountain Lake, Buffalo Township, Marquette County, Wisconsin.

**About:** category immigration, date 1849, place Fountain Lake, Buffalo Township, Marquette County, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1849 April 21 : John Muir turns 11 years old February : The Muir family emigrates from Glasgow to New York, the trip taking six weeks by sailing ship, then via the Great Lakes and wagon to Fountain Lake , Buffalo Township, Marquette County, Wisconsin." (1849) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** The snapshot states the date, route, duration and destination of this migration. The live chronology could not be read through either shell or web access.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Gives a February 1849 departure, the ports and the route; the IHH page gives only an age and a farm near Portage. Sierra Club only so far.

### MUI-F-0029 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** After the 1867 accident, Muir decides to leave factory work to study nature.

**About:** category career, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1867 April 21 : John Muir turns 29 years old March 5 : Blinded in a factory accident. After weeks of agony, cared for by Catharine Merrill, his sight returns. Muir decides to leave factory work to study nature." (1867) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0023, Sierra Club (institutional): "1867 Temporarily blinded by eye injury. Once his sight is restored, decides to commit his life to nature study." (1867) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0019, National Park Service (institutional): "He then went to work in a factory in Indianapolis where he worked his way up until 1867 when he had an accident that left him temporarily blind. The shock and horror of the accident for Muir finally pushed him to leave industry work forever." (paragraph 3) <https://www.nps.gov/thri/johnmuir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0019 found (https://www.nps.gov/thri/johnmuir.htm)

**Checker's reasoning:** The snapshots and two readable live sources support the decision following the 1867 accident. The live chronology was unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-16; its supporting quotes are appended verbatim.

### MUI-F-0039 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir's first book, The Mountains of California, is published in 1894.

**About:** category work, date 1894

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1894 April 21 : John Muir turns 56 years old Muir's first book, The Mountains of California , is published" (1894) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0017, National Park Service (institutional): "1894: Published Mountains of California." (Middle Years and Major Achievements, 1894) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm)

**Checker's reasoning:** The chronology snapshot explicitly identifies the first book and its 1894 publication; the live NPS timeline confirms publication in 1894. The live chronology was unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

### MUI-F-0040 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1896 Muir receives an honorary A.M. degree from Harvard University.

**About:** category award, date 1896

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1896 April 21 : John Muir turns 58 years old Joins the U.S. Forestry Commission in July, chaired by Charles Sargent, on a survey of the forests of Yellowstone, the Black Hills in South Dakota, the Big Horn Mountains in Wyoming, and forests in Montana, Idaho, Oregon, and Washington. Visits Portland, Oregon, again in 1896, 1899, and 1908. Meets with L.L. Hawkins, William Steel, and other members of the Mazamas mountaineering club. By that time the Mazamas and the Sierra Club were working together on numerous conservation activities. Later surveys the Cascades, the Santa Lucia coast ranges, the mountains of southern California, the Grand Canyon and the southern Sierra Nevada. Fifth trip to Alaska, with Henry Fairfield Osborn Muir feels a strong premonition about the health of his mother; travels east to Wisconsin, whereupon on June 23 : Muir's mother, Ann Gilrye Muir, dies. Receives Honorary A.M degree from Harvard University, 1896." (1896) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** The snapshot explicitly states the honorary Harvard A.M. degree and 1896 date. The live chronology was unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

### MUI-F-0041 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1897 Muir was awarded an honorary L.L.D. degree from the University of Wisconsin.

**About:** category award, date 1897

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1897 April 21 : John Muir turns 59 years old Awarded honorary L.L.D. degree from the University of Wisconsin" (1897) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** The snapshot places the honorary University of Wisconsin L.L.D. award under 1897. The live chronology was unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

### MUI-F-0044 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1903, on April 28, John Muir becomes a naturalized citizen of the United States.

**About:** category citizenship, date 1903

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1903 April 21 : John Muir turns 65 years old April 28: John Muir becomes a naturalized citizen of the United States" (1903) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Citizenship Date: 1903" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/)

**Checker's reasoning:** The chronology snapshot explicitly states naturalization on April 28, 1903; the live IHH page gives citizenship in 1903. The live chronology was unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Sierra Club chronology only; no court or record named. Matches the IHH citizenship year 1903. Compare the 1896 voter registration claiming citizenship through his father's naturalization. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-14 ("John Muir's Citizenship Date is 1903."); its evidence is appended verbatim.

### MUI-F-0074 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir was born in Dunbar, Scotland.

**About:** category birth, place Dunbar, Scotland

**Evidence** (open the link and find the quote):

- MUI-S-0076, Smithsonian Institution (institutional): "Born Dunbar, Scotland" (Exhibition Label, line 1) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0076, Smithsonian Institution (institutional): "John Muir, 21 Apr 1838 - 24 Dec 1914" (Sitter) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Born: April 21, 1838, Dunbar, East Lothian, Scotland" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0009, Sierra Club (institutional): "1838 John Muir born April 21 \*, in Dunbar, Scotland." (timeline entry 1838) <https://www.sierraclub.org/arkansas/sierra-club>
- MUI-S-0016, U.S. National Archives and Records Administration (institutional): "b. 4-21-1838 in Dunbar, Scotland" (sourceNotes\[0\]) <https://catalog.archives.gov/id/10580990>
- MUI-S-0017, National Park Service (institutional): "1838: April 21, John Muir born in Dunbar, Scotland." (Early Years and Education, 1838) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0021, National Park Service (institutional): "John Muir was born in Dunbar, Scotland on April 21, 1838" (Early, self-taught education, paragraph 1) <https://www.nps.gov/articles/john-muir.htm>
- MUI-S-0023, Sierra Club (institutional): "1838 Born April 21 in Dunbar, Scotland." (timeline, 1838) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0024, Sierra Club (institutional): "April 21 : John Muir is born in Dunbar, Scotland, the son of Daniel and Ann Gilrye Muir." (1838) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004646-832d, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0076 found (https://npg.si.edu/object/npg\_NPG.65.79?destination=edan-search%2Fcatalog\_of\_america%3Fedan\_fq%255B0%255D%3Ddate%253A%25221920s%2522%26edan\_fq%255B1%255D%3Dobject\_type%253A%2522Paintings%2522%26edan\_q%3DSu); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0009 found (https://www.sierraclub.org/arkansas/sierra-club); MUI-S-0016 unreachable (https://catalog.archives.gov/proxy/records/search?naId=10580990); MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0021 found (https://www.nps.gov/articles/john-muir.htm); MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** All snapshot quotes are present and explicitly support the birthplace; the Smithsonian passages were also found through web search. The National Archives record and Sierra Club chronology were unreachable.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** NPG label. Agrees with the IHH page lead (Dunbar, East Lothian, Scotland); East Lothian is not in this source. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-4 ('John Muir was born in Dunbar, East Lothian, Scotland.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-44; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-identify-F-6; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-1; its supporting quotes are appended verbatim.

### MUI-F-0076 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir was a native Scotsman who relocated to California.

**About:** category immigration, place California

**Evidence** (open the link and find the quote):

- MUI-S-0082, Smithsonian Institution (institutional): "The event celebrated the 150th Anniversary of the birth of the native Scotsman, who relocated to California and became America’s most well known naturalist." (Description, sentence 2) <https://americanhistory.si.edu/collections/object/nmah_1285012>
- MUI-S-0082, Smithsonian Institution (institutional): "April 21, 1988 was designated John Muir day by president Ronald Reagan." (Description, sentence 1) <https://americanhistory.si.edu/collections/object/nmah_1285012>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict unclear; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic no; source type right yes.

**Live check per source:** MUI-S-0082 found (https://americanhistory.si.edu/collections/object/nmah\_1285012)

**Checker's reasoning:** Both quotations appear in the snapshot and live search retrieval, and they entail the claim. The claim is not atomic: Scottish origin and relocation to California are two independently checkable assertions.

**Why it is not verified:** G4: adversary verdict is unclear; G4: adversary did not find the claim atomic (G3)

**Notes:** NMAH description. No arrival date, port or settlement place in this source.

### MUI-F-0077 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir was a naturalist.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0076, Smithsonian Institution (institutional): "The influential naturalist John Muir helped establish the National Park System, believing that exposure to wilderness would encourage people to preserve it." (Exhibition Label, paragraph 1) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0083, Smithsonian Institution (institutional): "The organization was founded in 1892 by John Muir, a Scottish American naturalist and essayist." (Description, sentence 3) <https://americanhistory.si.edu/collections/object/nmah_600412>
- MUI-S-0084, Smithsonian Institution (institutional): "This John Muir Issue features a portrait of John Muir, Scottish-American naturalist and conservationist, and an image of a man standing in a forest of Redwood trees." (Description, sentence 1) <https://postalmuseum.si.edu/object/npm_1980.2493.5476>
- MUI-S-0085, Smithsonian Institution (institutional): "He was a Scottish-born American naturalist, author, and an advocate for the preservation of wilderness in the United States and the National Park Service." (Description, paragraph 4, sentence 2) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0085, Smithsonian Institution (institutional): "This Celebrate the Century Issue stamp depicts preservationist John Muir and Yosemite Valley, California." (Description, paragraph 4, sentence 1) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Occupation: Naturalist, preservationist, writer, inventor" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir (1838 –1914) was a Scottish-born American naturalist, author, and early advocate of preservation of wilderness in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0025, Online Archive of California (secondary): "A Scottish-born journalist and naturalist, John Muir (1838-1914) studied botany and geology at the University of Wisconsin (1861-1863)." (Biographical / historical, paragraph 1) <https://oac.cdlib.org/findaid/ark:/13030/kt709nf3b8/>
- MUI-S-0030, Library of Congress (institutional): "The Scottish-born naturalist, conservationist, and writer John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0047, Library of Congress (institutional): "Here Muir, naturalist, conservationist and rancher, produced most of his significant published works on the flora and fauna of the west." (item.notes\[1\]) <https://www.loc.gov/item/ca0124/>
- MUI-S-0048, Library of Congress (institutional): "the renowned Scottish-American naturalist and preservationist, John Muir" (item.notes\[2\]) <https://www.loc.gov/item/ca4264/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0076 found (https://npg.si.edu/object/npg\_NPG.65.79?destination=edan-search%2Fcatalog\_of\_america%3Fedan\_fq%255B0%255D%3Ddate%253A%25221920s%2522%26edan\_fq%255B1%255D%3Dobject\_type%253A%2522Paintings%2522%26edan\_q%3DSu); MUI-S-0083 unreachable (https://americanhistory.si.edu/collections/object/nmah\_600412); MUI-S-0084 found (https://postalmuseum.si.edu/object/npm\_1980.2493.5476); MUI-S-0085 found (https://postalmuseum.si.edu/object/npm\_1998.2010.874); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0074 found (https://www.archives.gov/nhprc/projects/catalog/john-muir); MUI-S-0025 found (https://oac.cdlib.org/findaid/ark:/13030/kt709nf3b8/); MUI-S-0030 found (https://www.loc.gov/item/17031765/); MUI-S-0047 found (https://www.loc.gov/item/ca0124/); MUI-S-0048 found (https://www.loc.gov/pictures/item/ca4264/)

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): oac.cdlib.org: Online Archive of California, institutional.

**Why it is not verified:** G10: MUI-S-0083: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Four Smithsonian records (NPG, NMAH, NPM x2) call him a naturalist. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-10 ("John Muir's Occupation: Naturalist."); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-nara-F-8 ('John Muir was an American naturalist.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-78; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-loc-F-24; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-media-F-5; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-media-F-6; its supporting quotes are appended verbatim.

### MUI-F-0083 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1849 John Muir emigrated with his family to Fountain Lake, Wisconsin.

**About:** category immigration, date 1849, place Fountain Lake, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0010, Wisconsin Historical Society (institutional): "Born in Scotland, John Muir emigrated with his family in 1849, settling at Fountain Lake, near Portage, Wisconsin." (article body) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0024, Sierra Club (institutional): "1849 April 21 : John Muir turns 11 years old February : The Muir family emigrates from Glasgow to New York, the trip taking six weeks by sailing ship, then via the Great Lakes and wagon to Fountain Lake , Buffalo Township, Marquette County, Wisconsin." (1849) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** The snapshot quotes support the claim; neither live page could be loaded.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Recovery 2026-10-10: split from MUI-F-0051 and MUI-F-0003 without 'settling' and 'near Portage', which only the Wisconsin Historical Society quote has.

### MUI-F-0150 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir lived in North Hall at the University of Wisconsin.

**About:** category education, place North Hall, University of Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "February : Enrolls at the University of Wisconsin and attends for almost 2 1/2 years (5 trimesters); teaches school in winter Learns about geology from Dr. Ezra S. Carr . Carr's wife, Jeanne, becomes his mentor Invents a study desk that retrieves a book, holds it in place for the prescribed period of time, and then automatically replaces it with another book Muir has his first informal lesson in botany from from Milton S. Griswold, a classmate, beneath a black locust near North Hall, the student residence hall where he was then living." (chronology entry 1861) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0133, Wisconsin Historical Society (institutional): "North Hall originally housed lecture rooms, a chapel, laboratories, a library, and dormitory rooms. Naturalist John Muir was its most famous student-resident, living here from 1861 to 1863" (property record, Additional Comments, first paragraph) <https://wisconsinhistory.org/record/property/HI100645>
- MUI-S-0133, Wisconsin Historical Society (institutional): "The first building erected by the University of Wisconsin was North Hall" (property record, Additional Comments, 1973 quotation) <https://wisconsinhistory.org/record/property/HI100645>

**Extractor:** claude:claude-opus-5-5 (run round9-2026-10-29, 2026-10-29) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-round9-muir-2026-10-29b, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0133 found (https://www.wisconsinhistory.org/record/property/HI100645/redirect)

**Checker's reasoning:** No problem found in the quoted evidence. The Sierra Club page was unreachable for a live check.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Round 9 (owner feedback item 6, 2026-10-29): corroborates MUI-F-0113 (single-source, Sierra Club only) with a second holder, the Wisconsin Historical Society property record for North Hall (HI100645). Worded with the words both holders share; no year is claimed (the WHS record says 1861 to 1863; the Sierra Club places it in its 1861 entry). The 1975 NHL nomination for North Hall (NPS 66000021) was read and does not name Muir. Place repaired before adversary review (2026-10-29): was 'North Hall, University of Wisconsin, Madison', which G2 flagged (a name not in the evidence).

### MUI-F-0151 (disputed)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At the University of Wisconsin, Muir invented a study desk.

**About:** category work, place University of Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "February : Enrolls at the University of Wisconsin and attends for almost 2 1/2 years (5 trimesters); teaches school in winter Learns about geology from Dr. Ezra S. Carr . Carr's wife, Jeanne, becomes his mentor Invents a study desk that retrieves a book, holds it in place for the prescribed period of time, and then automatically replaces it with another book Muir has his first informal lesson in botany from from Milton S. Griswold, a classmate, beneath a black locust near North Hall, the student residence hall where he was then living." (chronology entry 1861) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0010, Wisconsin Historical Society (institutional): "Clockwork study desk built by naturalist John Muir while at the University of Wisconsin, Madison, 1861-1863." (image caption (Museum object F1998.85.1)) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0010, Wisconsin Historical Society (institutional): "As a young man, however, Muir also invented and built numerous mechanical devices, including this magnificent clockwork desk, made between 1861 and 1863 while he was a student at the University of Wisconsin in Madison." (article, first paragraph) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>

**Extractor:** claude:claude-opus-5-5 (run round9-2026-10-29, 2026-10-29) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-round9-muir-2026-10-29b, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641)

**Checker's reasoning:** No problem found in the quoted evidence. Neither named source was reachable for a live check.

**Why it is not verified:** G10: MUI-S-0024: snapshot supplied by browser; the adversary must find the quote live (result is 'unreachable')

**Notes:** Round 9 (owner feedback item 6): the verified tie between his inventions and his years at the University of Wisconsin (Madison) for the first-work chapter. Two holders: Sierra Club (1861 entry) and Wisconsin Historical Society article CS2641. Place repaired before adversary review (2026-10-29): was 'University of Wisconsin, Madison', which G2 flagged (a name not in the evidence).

## 2. Conflicting: sources disagree (1)

### MUI-F-0110 (conflicting)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1849, in February, the Muir family emigrates from Glasgow to New York, the trip taking six weeks by sailing ship.

**About:** category immigration, date 1849, place Glasgow

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1849 April 21 : John Muir turns 11 years old February : The Muir family emigrates from Glasgow to New York, the trip taking six weeks by sailing ship" (chronology entry 1849) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** conflicting is kept (set by a person or the merge step)

**Notes:** Tour travel leg 1 to 2 (the crossing). The ship's name is not given by any source found. Month conflicts with University of the Pacific chronology ('1849 Spring Leaves Scotland'); kept as each source's own version. Ruling 2026-10-16 (owner rule: a primary record decides; CONFLICTS.md): departure month. February is contradicted by the primary records: the ship Warren sailed from Glasgow on March 4, 1849 (New York Herald, 11 April 1849, p. 4, Maritime Intelligence; New-York Daily Tribune, same day) and its manifest (NARA M237 roll 78, arrival 10 April 1849, image read by eye, needs a person's confirmation) lists Daniel, Sarah, John and David Muir. Set to conflicting so the February month is not shown; the six-week crossing is kept in the log.

## 3. Single-source: needs a second independent source (79)

### MUI-F-0002 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir died in Los Angeles, Calif.

**About:** category death, date 1914-12-24, place Los Angeles, Calif.

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Died: Dec. 24, 1914, Los Angeles, Calif." (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0016, U.S. National Archives and Records Administration (institutional): "d. 12-24-14 in Los Angeles, Calif." (sourceNotes\[0\]) <https://catalog.archives.gov/id/10580990>
- MUI-S-0023, Sierra Club (institutional): "1914 Dies December 24, in Los Angeles." (1914) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0024, Sierra Club (institutional): "1914 April 21 : John Muir turns 76 years old May: A young Japanese college student, Ryozo Azuma, learns about Muir when visiting Mt. Rainier from Tacoma Washington's College of the Pacific; he reads Muir's books and travels to Martinez where he meets Muir. Azuma later becomes a noted Japanese conservationist and mountaineer, known as "The John Muir of Japan." December 24 : John Muir dies in California Hospital, Los Angeles, from pneumonia on Christmas eve" (1914) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0020, National Park Service (institutional): "On Christmas Eve, 1914—just more than a year after Congress authorized the dam’s construction—Muir died. Even though he died in a Los Angeles hospital" (paragraph 11) <https://www.nps.gov/yose/learn/historyculture/muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0016 lacks word 'died' not in its quotes; event\_date 1914-12-24 not in its quotes \| MUI-S-0023 lacks word 'died' not in its quotes; name 'Calif' not in its quotes; event\_date 1914-12-24 not in its quotes; place: name 'Calif' not in its quotes \| MUI-S-0024 lacks word 'died' not in its quotes; name 'Calif' not in its quotes; event\_date 1914-12-24 not in its quotes; place: name 'Calif' not in its quotes \| MUI-S-0020 lacks name 'Calif' not in its quotes; event\_date 1914-12-24 not in its quotes; place: name 'Calif' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-identify-F-7; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-65; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-63; its supporting quotes are appended verbatim.

### MUI-F-0003 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir's Settlement Location was a farm near Portage, Wisc., in 1849.

**About:** category immigration, date 1849, place Portage, Wisc.

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Settlement Location: A farm near Portage, Wisc., in 1849" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0086, National Park Service (institutional): "In 1849, Muir's family immigrated to the United States, starting Fountain Lake Farm near Portage, Wisconsin." (News release body, paragraph beginning 'John Muir was a farmer, inventor' (snapshot line 74)) <https://www.nps.gov/jomu/learn/news/new-featured-exhibit-in-her-words-a-glimpse-into-the-lives-of-the-muir-strentzel-women.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T161433-d4f0, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** Both snapshot quotes are present and together state the settlement location, date, and place. Live fetching was unreachable from the available shell/web path, but both snapshots were fetched by http.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0086 lacks name 'Settlement' not in its quotes; name 'Location' not in its quotes; name 'Wisc' not in its quotes; place: name 'Wisc' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Suspected error on IHH page: vague where place and date matter: names a settlement farm 'near Portage' with year only; no port or date of arrival in the United States is given. Needs a primary or institutional record of the family's arrival and settlement.

### MUI-F-0004 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir's Occupation: inventor.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Occupation: Naturalist, preservationist, writer, inventor" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0032, Library of Congress (institutional): "He attended the University of Wisconsin and began working as a mechanical inventor." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0032 lacks name 'Occupation' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Authority records (LoC/NARA) carry no occupation field. Merge muir-2026-10-09: added supporting quotes already staged under tmp-loc-F-35.

### MUI-F-0005 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In his early career, John Muir worked on mechanical inventions.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "In his early career, he worked on mechanical inventions until an eye injury caused him to change course." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "He attended the University of Wisconsin and began working as a mechanical inventor." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0032 lacks word 'early' not in its quotes; word 'career' not in its quotes; word 'inventions' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-35 ('John Muir began working as a mechanical inventor.'); its evidence is appended verbatim.

### MUI-F-0007 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At 16, John Muir designed barometers in 1854.

**About:** category invention, date 1854

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "At 16, designed locks, water wheels, barometers, hydrometers, clocks and an automatic feeding machine for horses. (1854)" (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "1854 April 21 : John Muir turns 16 years old Becomes greatly interested in literature and poetry Muir constructs clocks, barometers, hydrometers, table-saws, and other such items" (1854) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'designed' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-9; its supporting quotes are appended verbatim.

### MUI-F-0008 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At 16, John Muir designed hydrometers in 1854.

**About:** category invention, date 1854

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "At 16, designed locks, water wheels, barometers, hydrometers, clocks and an automatic feeding machine for horses. (1854)" (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "1854 April 21 : John Muir turns 16 years old Becomes greatly interested in literature and poetry Muir constructs clocks, barometers, hydrometers, table-saws, and other such items" (1854) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'designed' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-9; its supporting quotes are appended verbatim.

### MUI-F-0009 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At 16, John Muir designed clocks in 1854.

**About:** category invention, date 1854

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "At 16, designed locks, water wheels, barometers, hydrometers, clocks and an automatic feeding machine for horses. (1854)" (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "1854 April 21 : John Muir turns 16 years old Becomes greatly interested in literature and poetry Muir constructs clocks, barometers, hydrometers, table-saws, and other such items" (1854) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'designed' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-9; its supporting quotes are appended verbatim.

### MUI-F-0010 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir invented an alarm clock bed that would tip the sleeper out of bed at a set time, early 1860s.

**About:** category invention

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Invented an alarm clock bed that would tip the sleeper out of bed at a set time." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "(Early 1860s)" (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "1935 Grace S. Lindsley writes Recollections of John Muir, (off-site link) recalling visiting John Muir in his room on the University of Wisconsin campus in Madison in the early 1860s. She describes how he had invented a combination bed/alarm clock that tipped him onto the floor each morning" (1935) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'would' not in its quotes; word 'sleeper' not in its quotes; word 'out' not in its quotes; word 'set' not in its quotes ...

**Notes:** Single-source secondary claim from IHH's current page. Suspected error on IHH page: vague date ('Early 1860s'). Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-73 ('Grace S. Lindsley recalled that Muir, in his room on the University of Wisconsin campus in Madison in the early 1860s, had invented a combination bed/alarm clock that tipped him onto the floor each morning.'); its evidence is appended verbatim.

### MUI-F-0011 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir helped establish Sequoia National Park in 1890.

**About:** category work, date 1890

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Helped establish, Sequoia (1890), Yosemite (1898), Mount Rainier (1899), and Grand Canyon (1908) National Parks." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Muir played a big role in establishing Sequoia National Park and Yosemite National Park in California." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "Muir's advocacy helped create several national parks, including Sequoia (1890), Mount Rainier (1899) and Grand Canyon (1908)." (Words into Action, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0011 lacks word 'establish' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-23 ('Muir played a big role in establishing Sequoia National Park in California.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-58; its supporting quotes are appended verbatim.

### MUI-F-0012 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir helped establish Mount Rainier National Park in 1899.

**About:** category work, date 1899

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Helped establish, Sequoia (1890), Yosemite (1898), Mount Rainier (1899), and Grand Canyon (1908) National Parks." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "Muir's advocacy helped create several national parks, including Sequoia (1890), Mount Rainier (1899) and Grand Canyon (1908)." (Words into Action, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0011 lacks word 'establish' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Suspected error on IHH page: spelled 'RANIER' in the page's park heading, 'Mount Rainier' in this list. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-58; its supporting quotes are appended verbatim.

### MUI-F-0013 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir helped establish Grand Canyon National Park in 1908.

**About:** category work, date 1908

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Helped establish, Sequoia (1890), Yosemite (1898), Mount Rainier (1899), and Grand Canyon (1908) National Parks." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "Muir's advocacy helped create several national parks, including Sequoia (1890), Mount Rainier (1899) and Grand Canyon (1908)." (Words into Action, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0011 lacks word 'establish' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Suspected error on IHH page: 1908 is suspected to be the date of a Grand Canyon national monument, not a national park (commonly dated 1919); search agents must establish the designation and date from an institutional source. Not corrected. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-58; its supporting quotes are appended verbatim.

### MUI-F-0015 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir wrote and published more than 300 magazine articles on conservation.

**About:** category work

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Wrote and published 12 books and more than 300 magazine articles on conservation." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "John wrote and had published over 300 magazine articles and 12 books." (Writing for a Cause) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0011 lacks word 'more' not in its quotes; word 'conservation' not in its quotes

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-59; its supporting quotes are appended verbatim.

### MUI-F-0016 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** President Theodore Roosevelt visited John Muir in Yosemite in May 1903.

**About:** category career, date 1903-05, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0004, National Park Service (institutional): "President Theodore Roosevelt visited John Muir in Yosemite in May 1903." (Frequently Asked Questions, question 1 answer) <https://www.nps.gov/jomu/learn/historyculture/john-muir-and-president-roosevelt.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0017 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir's first trip to Alaska, in 1879, took him to the Stikine River.

**About:** category career, date 1879, place Stikine River, Alaska

**Evidence** (open the link and find the quote):

- MUI-S-0007, National Park Service (institutional): "Muir's fascination with Alaska began in 1879 when he embarked on his first trip to the region." (Early Expeditions to Alaska, paragraph 1) <https://www.nps.gov/jomu/learn/historyculture/john-muir-and-alaska.htm>
- MUI-S-0007, National Park Service (institutional): "His initial journey took him to the Stikine River, where he marveled at the immense glaciers and the untouched beauty of the land." (Early Expeditions to Alaska, paragraph 1) <https://www.nps.gov/jomu/learn/historyculture/john-muir-and-alaska.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0018 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1892, John Muir and a number of prominent Californians incorporated the Sierra Club.

**About:** category career, date 1892

**Evidence** (open the link and find the quote):

- MUI-S-0009, Sierra Club (institutional): "Through his widely read magazine articles, naturalist John Muir became the nation's best-known advocate for the Sierra Nevada." (A Brief History of the Sierra Club, paragraph 1) <https://www.sierraclub.org/arkansas/sierra-club>
- MUI-S-0009, Sierra Club (institutional): "In 1892, he and a number of prominent Californians incorporated the Sierra Club whose purposes were: To explore, enjoy, and render accessible the mountain regions of the Pacific Coast; to publish authentic information concerning them; to enlist the support and cooperation of the people and government in preserving the forest and other natural features of the Sierra Nevada Mountains." (A Brief History of the Sierra Club, paragraph 1) <https://www.sierraclub.org/arkansas/sierra-club>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0009 found (https://www.sierraclub.org/arkansas/sierra-club)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Supports IHH co-founder lead (year only; this page gives no May 28 date).

### MUI-F-0019 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir was the Sierra Club's first president.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0009, Sierra Club (institutional): "As the Club’s first president, Muir reasoned that" (paragraph 2) <https://www.sierraclub.org/arkansas/sierra-club>
- MUI-S-0009, Sierra Club (institutional): "John Muir’s advice to “climb the mountains and get their good tidings” has been followed by Sierra Club members since the Club’s founding" (paragraph 2) <https://www.sierraclub.org/arkansas/sierra-club>
- MUI-S-0020, National Park Service (institutional): "oversight of the Sierra Club—for which he served as president from its creation in 1892" (paragraph 10) <https://www.nps.gov/yose/learn/historyculture/muir.htm>
- MUI-S-0015, Sierra Club (institutional): "John Muir was the Club's first president, an office he held until his death in 1914." (paragraph 4) <https://www.sierraclub.org/john-muir-exhibit/john-muir-biography>
- MUI-S-0032, Library of Congress (institutional): "In 1892, Muir co-founded the Sierra ClubExternal as an association explicitly dedicated to wilderness preservation" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "served until 1914 as its first president" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0029, Library of Congress (institutional): "John Muir was the Club's first President and guiding force until his death in 1914." (item.summary\[0\]) <https://www.loc.gov/item/03022601/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0009 found (https://www.sierraclub.org/arkansas/sierra-club); MUI-S-0020 found (https://www.nps.gov/yose/learn/historyculture/muir.htm); MUI-S-0015 found (https://www.sierraclub.org/john-muir-exhibit/john-muir-biography); MUI-S-0032 found (https://www.loc.gov/item/today-in-history/july-19/); MUI-S-0029 unreachable (https://www.loc.gov/item/03022601/)

**Checker's reasoning:** All snapshot quotes are present, and the readable live sources confirm the claim. MUI-S-0029 was unreachable through both shell and web access.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0020 lacks number 1 not in its quotes \| MUI-S-0015 lacks name 'Sierra' not in its quotes \| MUI-S-0032 lacks name "Club's" not in its quotes \| MUI-S-0029 lacks name 'Sierra' not in its quotes

**Notes:** Page does not say he served until his death (IHH lead). Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-36 ('Muir served as president of the Sierra Club from its creation in 1892.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-72; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-loc-F-20; its supporting quotes are appended verbatim. Repair muir-2026-10-09 (G1): MUI-S-0032 quote recopied verbatim from the snapshot, which reads "Sierra ClubExternal" (link-label text run into the name).

### MUI-F-0020 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1890, Muir's articles "The Treasures of Yosemite" and "Features of a Proposed Yosemite National Park" appeared in Century Magazine.

**About:** category work, date 1890

**Evidence** (open the link and find the quote):

- MUI-S-0011, National Park Service (institutional): "In 1890, unchecked grazing, logging and tourism were damaging Yosemite." (Sharing a Progressive Vision, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>
- MUI-S-0011, National Park Service (institutional): "Muir's articles "The Treasures of Yosemite" and "Features of a Proposed Yosemite National Park" appeared in Century Magazine, which boasted more than one million readers." (Sharing a Progressive Vision, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>
- MUI-S-0024, Sierra Club (institutional): "1890 April 21 : John Muir turns 52 years old. Fourth trip to Alaska ; 10 day solo-expedition by sled across Muir Glacier. Muir's articles on Yosemite, The Treasures of Yosemite and Features of the Proposed Yosemite National Park published in Century magazine , which greatly aid the campaign to establish Yosemite National Park." (1890) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0011 found (https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm); MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'appeared' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-30; its supporting quotes are appended verbatim.

### MUI-F-0021 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1909, John Muir urged the public to “ask Congress to reject this destructive bill,” a bill that would allow a dam to be built in Hetch Hetchy Valley.

**About:** category career, date 1909

**Evidence** (open the link and find the quote):

- MUI-S-0013, Library of Congress (institutional): "In 1909, many conservation writers showed opposition to a bill that would allow a dam to be built in Hetch Hetchy Valley, with Isaac Branson writing that “San Francisco has no urgent or even reasonable need at all of this Hetch-Hetchy region for her Water Supply,” and John Muir urging the public to “ask Congress to reject this destructive bill.”" (paragraph on 1909 debate) <https://blogs.loc.gov/law/2022/12/how-a-dam-paved-the-way-for-the-national-park-service/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0022 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In April 1903, John Muir needed father's naturalization papers in applying for a passport.

**About:** category citizenship, date 1903-04, place Martinez

**Evidence** (open the link and find the quote):

- MUI-S-0014, University of the Pacific (institutional): "Martinez, Apr 19, 1903." (Transcription, dateline) <https://scholarlycommons.pacific.edu/muir-correspondence/2609>
- MUI-S-0014, University of the Pacific (institutional): "Dear Mary, If you have father's naturalization papers will you please forward them to me as quickly as possible. I need them in applying for a passport." (Transcription) <https://scholarlycommons.pacific.edu/muir-correspondence/2609>
- MUI-S-0014, University of the Pacific (institutional): ""Letter from John Muir to Mary \[Muir Hand\], 1903 Apr 29." by John Muir" (record title) <https://scholarlycommons.pacific.edu/muir-correspondence/2609>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** From Muir letter to Mary \[Muir Hand\]. Record dates the letter 1903 Apr 29; transcription dateline reads Apr 19, 1903 (day left out). Bears on IHH citizenship 1903 (tmp-baseline-F-14): not a naturalization record, and does not say how or when Muir became a citizen.

### MUI-F-0023 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1849 Muir's family started a farm in Wisconsin.

**About:** category immigration, date 1849, place Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0011, National Park Service (institutional): "In 1849, when Muir turned 11, his family moved to Wisconsin and started a farm, where his nature lessons continued." (Life in the Wild, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-domain-F-60: 'In 1849, when Muir turned 11, his family moved to Wisconsin and started a farm.'; this part keeps only the quotes that support it.

### MUI-F-0024 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1849 Muir immigrated to Wisconsin at the age of 11.

**About:** category immigration, date 1849, place Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1849: Immigrated to Wisconsin at the age of 11." (Early Years and Education, 1849) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1849 Immigration to Wisconsin at the age of 11." (1849) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>
- MUI-S-0020, National Park Service (institutional): "Muir immigrated to Wisconsin with his family when he was 11 years old" (paragraph 3) <https://www.nps.gov/yose/learn/historyculture/muir.htm>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "John Muir came to the United States at age 11 with his family." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "In 1849, when Muir turned 11, his family moved to Wisconsin and started a farm, where his nature lessons continued." (Life in the Wild, paragraph 2) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** Live NPS pages were readable, but the Immigrant Hall of Honor live page could not be read; because that source was fetched by http, unreachable live status is acceptable. No problem found in the snapshot evidence.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: MUI-S-0017 and MUI-S-0018 are one holder (same text: their quotes are near-verbatim copies); G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'immigrated' not in its quotes \| MUI-S-0020 lacks year 1849 not in its quotes; word 'age' not in its quotes; event\_date 1849 not in its quotes \| MUI-S-0001 lacks year 1849 not in its quotes; word 'immigrated' not in its quotes; name 'Wisconsin' not in its quotes; event\_date 1849 not in its quotes ... \| MUI-S-0011 lacks word 'immigrated' not in its quotes; word 'age' not in its quotes

**Notes:** NPS John Muir NHS gives age 11 (also S-4). NPS Theodore Roosevelt Inaugural NHS page (S-3) says 'At the age of 10'; Sierra Club chronology (S-8) dates the emigration February 1849, before his April 21 birthday. Conflict on age at arrival. Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-3 ('Muir immigrated to Wisconsin with his family when he was 11 years old.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-8 ('John Muir came to the United States at age 11 with his family.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-60; its supporting quotes are appended verbatim.

### MUI-F-0026 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1860 Muir left home to exhibit his inventions at the State Agriculture Fair in Madison, Wisconsin.

**About:** category invention, date 1860, place Madison, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1860: Left home to exhibit his inventions at the State Agriculture Fair in Madison, Wisconsin" (Early Career and Adventures, 1860) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0024, Sierra Club (institutional): "September : Muir leaves home at age 22 to exhibit his inventions at the State Fair in Madison, Wisconsin." (1860) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0023, Sierra Club (institutional): "1860 Exhibits inventions at Wisconsin State Agriculture Fair." (1860) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0010, Wisconsin Historical Society (institutional): "Muir took several of his inventions to the 1860 Wisconsin State Fair in Madison." (paragraph 5) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0023 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641)

**Checker's reasoning:** No problem found in the snapshots or the reachable live source; three live sources could not be loaded.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks year 1860 not in its quotes; word 'left' not in its quotes; name 'Agriculture' not in its quotes; event\_date 1860 not in its quotes \| MUI-S-0023 lacks word 'left' not in its quotes; word 'home' not in its quotes; name 'Madison' not in its quotes; place: name 'Madison' not in its quotes \| MUI-S-0010 lacks word 'left' not in its quotes; word 'home' not in its quotes; word 'exhibit' not in its quotes; name 'Agriculture' not in its quotes

**Notes:** Merge muir-2026-10-09: added supporting quotes already staged under tmp-domain-F-47.

### MUI-F-0027 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1866 Muir moved to Indianapolis and worked for a manufacturer of carriage parts.

**About:** category career, date 1866, place Indianapolis

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1866: Moved to Indianapolis and worked for a manufacturer of carriage parts." (Early Career and Adventures, 1866) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1866 Indianapolis: worked for manufacturer of carriage parts." (1866) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'moved' not in its quotes

### MUI-F-0028 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1867 Muir suffered an eye injury.

**About:** category career, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1867: Suffered an eye injury and began a 1000-mile walk to Florida, then to Cuba." (Early Career and Adventures, 1867) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1867 Eye injury." (1867) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>
- MUI-S-0023, Sierra Club (institutional): "1867 Temporarily blinded by eye injury." (1867) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0018 found (https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm); MUI-S-0023 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'suffered' not in its quotes \| MUI-S-0023 lacks word 'suffered' not in its quotes

### MUI-F-0030 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1867 Muir began a 1000-mile walk to Florida, then to Cuba.

**About:** category career, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1867: Suffered an eye injury and began a 1000-mile walk to Florida, then to Cuba." (Early Career and Adventures, 1867) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1867 Eye injury. Begins 1000 mile walk to Florida and then to Cuba." (1867) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'began' not in its quotes

### MUI-F-0031 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1868, on March 28, Muir landed in San Francisco.

**About:** category career, date 1868, place San Francisco

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1868: Traveled to California; landed in San Francisco on March 28" (Early Career and Adventures, 1868) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0024, Sierra Club (institutional): "March 28 : Arrives in San Francisco, California." (1868) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks year 1868 not in its quotes; word 'landed' not in its quotes; event\_date 1868 not in its quotes

### MUI-F-0032 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir first visited Yosemite in 1868.

**About:** category career, date 1868, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0020, National Park Service (institutional): "Muir first visited Yosemite in 1868." (paragraph 5) <https://www.nps.gov/yose/learn/historyculture/muir.htm>
- MUI-S-0024, Sierra Club (institutional): "April - June : First visit to Yosemite" (1868) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0020 found (https://www.nps.gov/yose/learn/historyculture/muir.htm); MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks year 1868 not in its quotes; event\_date 1868 not in its quotes

### MUI-F-0033 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1869 Muir spent the summer as a sheepherder in the high Sierra.

**About:** category career, date 1869, place high Sierra

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1869: Spent the summer as a sheepherder in the high Sierra" (Early Career and Adventures, 1869) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1869 Summer sheepherder in high Sierra" (1869) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'spent' not in its quotes

### MUI-F-0034 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1871 Muir met Ralph Waldo Emerson in Yosemite.

**About:** category career, date 1871, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1871: Met Ralph Waldo Emerson in Yosemite." (Middle Years and Major Achievements) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0023, Sierra Club (institutional): "1871 Undertakes intensive study of glaciation in the Sierra. Ralph Waldo Emerson visits him in Yosemite." (1871) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0019, National Park Service (institutional): "In 1871, Muir was able to meet his idol, Ralph Waldo Emerson" (paragraph 7) <https://www.nps.gov/thri/johnmuir.htm>
- MUI-S-0005, National Park Service (institutional): "In 1871, Transcendentalist-thinker Ralph Waldo Emerson saw Yosemite, which reminded the New Englander of White Mountain Notch." (paragraph 3) <https://www.nps.gov/yose/learn/historyculture/muir-influences.htm>
- MUI-S-0005, National Park Service (institutional): "Upon meeting, Muir showed Emerson his hundreds of pencil sketches of peaks and valleys." (paragraph 3) <https://www.nps.gov/yose/learn/historyculture/muir-influences.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0023 lacks word 'met' not in its quotes \| MUI-S-0019 lacks word 'met' not in its quotes; name 'Yosemite' not in its quotes; place: name 'Yosemite' not in its quotes \| MUI-S-0005 lacks word 'met' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-19; its supporting quotes are appended verbatim.

### MUI-F-0035 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In September 1871 Muir wrote his first article for publication on glaciers, published in the New York Tribune.

**About:** category work, date 1871-09

**Evidence** (open the link and find the quote):

- MUI-S-0020, National Park Service (institutional): "In September 1871, two months after leaving the sawmill, Muir wrote his first article for publication on glaciers, published in the New York Tribune." (paragraph 6) <https://www.nps.gov/yose/learn/historyculture/muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0036 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1880 Muir moves to Martinez, California, to help manage the family orchard business.

**About:** category career, date 1880, place Martinez, California

**Evidence** (open the link and find the quote):

- MUI-S-0023, Sierra Club (institutional): "1880 Marries Louie Wanda Strentzel, April 14; moves to Martinez, California, to help manage family orchard business." (1880) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0038 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir was President of the Sierra Club until his death in 1914.

**About:** category career, date 1914

**Evidence** (open the link and find the quote):

- MUI-S-0023, Sierra Club (institutional): "1892 Helps found Sierra Club to ³do something for wilderness and make the mountains glad.² President until his death in 1914." (1892) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "He co-founded the Sierra Club in 1892, serving as its president until his death." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Co-Founder, the Sierra Club, (May 28, 1892) and served as president until his death." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "Muir co-founds the Sierra Club ; serves as its President for the rest of his life." (1892) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0015, Sierra Club (institutional): "John Muir was the Club's first president, an office he held until his death in 1914." (paragraph 4) <https://www.sierraclub.org/john-muir-exhibit/john-muir-biography>
- MUI-S-0032, Library of Congress (institutional): "In 1892, Muir co-founded the Sierra ClubExternal as an association explicitly dedicated to wilderness preservation" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "served until 1914 as its first president" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0029, Library of Congress (institutional): "John Muir was the Club's first President and guiding force until his death in 1914." (item.summary\[0\]) <https://www.loc.gov/item/03022601/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0015 found (https://www.sierraclub.org/john-muir-exhibit/john-muir-biography); MUI-S-0032 found (https://www.loc.gov/item/today-in-history/july-19/); MUI-S-0029 unreachable (https://www.loc.gov/item/03022601/)

**Checker's reasoning:** The quotes support the presidency through his death in 1914; no contradictory passage was found. MUI-S-0029 could not be read live through its JSON endpoint, webpage, shell, or search.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0001 lacks year 1914 not in its quotes; event\_date 1914 not in its quotes \| MUI-S-0024 lacks year 1914 not in its quotes; word 'until' not in its quotes; word 'death' not in its quotes; event\_date 1914 not in its quotes \| MUI-S-0015 lacks name 'Sierra' not in its quotes \| MUI-S-0032 lacks name 'Club' not in its quotes; word 'death' not in its quotes \| MUI-S-0029 lacks name 'Sierra' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-20 ('John Muir served as president of the Sierra Club until his death.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-37 ('Muir serves as President of the Sierra Club for the rest of his life.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-72; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-loc-F-20; its supporting quotes are appended verbatim. Repair muir-2026-10-09 (G1): MUI-S-0032 quote recopied verbatim from the snapshot, which reads "Sierra ClubExternal" (link-label text run into the name).

### MUI-F-0042 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1899 Muir participated in the Harriman Alaska Expedition.

**About:** category career, date 1899

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1899: Mt. Rainier National Park established; participated in the Harriman Alaska Expedition." (Later Years and Legacy, 1899) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1899 Mt. Rainier National Park established; member of Harriman Alaska Expedition." (1899) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>
- MUI-S-0080, Smithsonian Institution (institutional): "Scientific members of the expedition included:" (Description) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>
- MUI-S-0080, Smithsonian Institution (institutional): "C. Hart Merriam (Chief, US Biological Survey); John Muir; Charles Palache (mineralogist, Harvard University)" (Description, member list) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>
- MUI-S-0080, Smithsonian Institution (institutional): "Harriman Alaska Expedition (1899)" (title) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>
- MUI-S-0033, Library of Congress (institutional): "In 1899, Burroughs joined a host of luminaries, including fellow naturalist John Muir and painter Louis Agassiz Fuertes, on a scientific expedition along the Alaska coast." (articles\[0\] (John Burroughs article)) <https://www.loc.gov/item/today-in-history/april-03/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0018 lacks word 'participated' not in its quotes \| MUI-S-0080 lacks word 'participated' not in its quotes \| MUI-S-0033 lacks word 'participated' not in its quotes; name 'Harriman' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-smithsonian-F-16 ('The scientific members of the Harriman Alaska Expedition (1899) included John Muir.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-47 ('In 1899 naturalist John Muir joined a scientific expedition along the Alaska coast.'); its evidence is appended verbatim.

### MUI-F-0045 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1903 Muir hosted President Theodore Roosevelt in Yosemite.

**About:** category career, date 1903, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1903: Hosted President Theodore Roosevelt in Yosemite." (Later Years and Legacy, 1903) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0023, Sierra Club (institutional): "1903 Tours Yosemite with President Roosevelt." (1903) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0020, National Park Service (institutional): "when he toured President Theodore Roosevelt in the park in 1903" (paragraph 10) <https://www.nps.gov/yose/learn/historyculture/muir.htm>
- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "In 1903 Roosevelt and Muir visited the Yosemite region together." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "Teddy Roosevelt and John Muir at Yosemite. Courtesy Library of Congress." (image caption) <https://www.archives.gov/nhprc/projects/catalog/john-muir>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0023 lacks word 'hosted' not in its quotes; name 'Theodore' not in its quotes \| MUI-S-0020 lacks word 'hosted' not in its quotes; name 'Yosemite' not in its quotes; place: name 'Yosemite' not in its quotes \| MUI-S-0032 lacks word 'hosted' not in its quotes; name 'President' not in its quotes; name 'Theodore' not in its quotes \| MUI-S-0074 lacks year 1903 not in its quotes; word 'hosted' not in its quotes; name 'President' not in its quotes; name 'Theodore' not in its quotes ...

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-41 ('In 1903 Roosevelt and John Muir visited the Yosemite region together.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-nara-F-21 ('Teddy Roosevelt and John Muir were at Yosemite.'); its evidence is appended verbatim.

### MUI-F-0047 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1911, on June 21, Muir is awarded an honorary Litt. D. degree by Yale University.

**About:** category award, date 1911

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1911 April 21 : John Muir turns 73 years old Spring: Muir travels to New York, Washington, Garrison, Boston, and New Haven. May 13: Muir travels to Rochester to visit Harriman May 21: Muir is interviewed in the Boston Herald before speaking to the Appalachian Mountain Club. June: Muir's My First Summer in the Sierra is published Book Review by Marion Randall Parsons (January, 1912 Sierra Club Bulletin) June 17 : John Muir makes a speech to the American Alpine Club in New York, eventually published in Sierra Club Bulletin (Jan., 1924). June 21: Muir is awarded an honorary Litt. D. degree by Yale University" (1911) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0048 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1913 Muir is awarded an honorary Doctor of Laws degree by the University of California.

**About:** category award, date 1913

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1913 April 21 : John Muir turns 75 years old The battle for Hetch Hetchy is lost; Hetch Hetchy Valley is granted to San Francisco for a water reservoir Story of my Boyhood and Youth is published August: visits the Harriman family as their guest at Harriman's Idaho ranch retreat near Island Park, now a state park: Harriman State Park - Today, a trail at the park has been named for Muir, the John Muir ADA (American Disabilities Act) Compliant Interpretive Trail and fishing platform - -a three-quarter-mile loop trail inspired by John Muir's August 1913 "Island Park" journal. On the way to Island Park, Muir visited the Mormon Tabernacle in Salt Lake City where he heard "memorable organ music," especially "Nearer, my God to Thee," which he described as "so devout, so sweet, so whispering low." (John Muir's August 1913 "Island Park" Idaho journal.) Muir is awarded honorary Doctor of Laws degree by the University of California" (1913) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0049 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir is buried in the Strentzel family cemetery, Alhambra Valley, Martinez, California.

**About:** category death, date 1914, place Alhambra Valley, Martinez, California

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1914 April 21 : John Muir turns 76 years old May: A young Japanese college student, Ryozo Azuma, learns about Muir when visiting Mt. Rainier from Tacoma Washington's College of the Pacific; he reads Muir's books and travels to Martinez where he meets Muir. Azuma later becomes a noted Japanese conservationist and mountaineer, known as "The John Muir of Japan." December 24 : John Muir dies in California Hospital, Los Angeles, from pneumonia on Christmas eve Muir's grave is beside that of his beloved wife Louie at what is now known as the Muir/Strentzel Gravesite Muir is buried in the Strentzel family cemetery, (reported by San Francisco Chronicle, December 27,1914) Alhambra Valley, Martinez, California." (1914) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0050 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1913 Muir loses the campaign to save Hetch Hetchy Valley in Yosemite.

**About:** category career, date 1913, place Hetch Hetchy Valley

**Evidence** (open the link and find the quote):

- MUI-S-0023, Sierra Club (institutional): "1913 Loses campaign to save Hetch Hetchy Valley in Yosemite." (1913) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0051 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir emigrated with his family in 1849, settling at Fountain Lake, near Portage, Wisconsin.

**About:** category immigration, date 1849, place Fountain Lake, near Portage, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0010, Wisconsin Historical Society (institutional): "Born in Scotland, John Muir emigrated with his family in 1849, settling at Fountain Lake, near Portage, Wisconsin." (paragraph 4) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0024, Sierra Club (institutional): "1849 April 21 : John Muir turns 11 years old February : The Muir family emigrates from Glasgow to New York, the trip taking six weeks by sailing ship, then via the Great Lakes and wagon to Fountain Lake , Buffalo Township, Marquette County, Wisconsin." (1849) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** The snapshot quotes support the claim; neither live page could be loaded.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0024 lacks word 'settling' not in its quotes; word 'near' not in its quotes; name 'Portage' not in its quotes; place: word 'near' not in its quotes ...

**Notes:** Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-48; its supporting quotes are appended verbatim.

### MUI-F-0052 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir dies from pneumonia.

**About:** category death, date 1914

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1914 April 21 : John Muir turns 76 years old May: A young Japanese college student, Ryozo Azuma, learns about Muir when visiting Mt. Rainier from Tacoma Washington's College of the Pacific; he reads Muir's books and travels to Martinez where he meets Muir. Azuma later becomes a noted Japanese conservationist and mountaineer, known as "The John Muir of Japan." December 24 : John Muir dies in California Hospital, Los Angeles, from pneumonia on Christmas eve" (1914) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0019, National Park Service (institutional): "Shortly afterward on Christmas Eve, 1914, John Muir died of pneumonia." (paragraph 14) <https://www.nps.gov/thri/johnmuir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0019 lacks word 'dies' not in its quotes

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-63: 'Muir dies in California Hospital, Los Angeles, from pneumonia.'; this part keeps only the quotes that support it.

### MUI-F-0053 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1896, on August 5, Muir and his brother David registered to vote in Contra Costa County.

**About:** category citizenship, date 1896, place Contra Costa County

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1896 April 21 : John Muir turns 58 years old Joins the U.S. Forestry Commission in July, chaired by Charles Sargent, on a survey of the forests of Yellowstone, the Black Hills in South Dakota, the Big Horn Mountains in Wyoming, and forests in Montana, Idaho, Oregon, and Washington. Visits Portland, Oregon, again in 1896, 1899, and 1908. Meets with L.L. Hawkins, William Steel, and other members of the Mazamas mountaineering club. By that time the Mazamas and the Sierra Club were working together on numerous conservation activities. Later surveys the Cascades, the Santa Lucia coast ranges, the mountains of southern California, the Grand Canyon and the southern Sierra Nevada. Fifth trip to Alaska, with Henry Fairfield Osborn Muir feels a strong premonition about the health of his mother; travels east to Wisconsin, whereupon on June 23 : Muir's mother, Ann Gilrye Muir, dies. Receives Honorary A.M degree from Harvard University, 1896. June 26: John Muir visits John Burroughs at Hyde Park; their second meeting. The next day Burroughs writes a journal entry about John Muir and their meeting. Muir makes third attempt to buy land at Fountain Lake for preservation August 5: John, along with his brother David, register to vote in Contra Costa County, stating his occupation as "geologist" and his basis of citizenship "by virtue of father's naturalization."" (1896) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-41: 'In 1896, on August 5, Muir and his brother David registered to vote in Contra Costa County, stating his basis of citizenship "by virtue of father\\'s naturalization."'; this part keeps only the quotes that support it.

### MUI-F-0054 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1896 Muir stated his basis of citizenship "by virtue of father's naturalization."

**About:** category citizenship, date 1896

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1896 April 21 : John Muir turns 58 years old Joins the U.S. Forestry Commission in July, chaired by Charles Sargent, on a survey of the forests of Yellowstone, the Black Hills in South Dakota, the Big Horn Mountains in Wyoming, and forests in Montana, Idaho, Oregon, and Washington. Visits Portland, Oregon, again in 1896, 1899, and 1908. Meets with L.L. Hawkins, William Steel, and other members of the Mazamas mountaineering club. By that time the Mazamas and the Sierra Club were working together on numerous conservation activities. Later surveys the Cascades, the Santa Lucia coast ranges, the mountains of southern California, the Grand Canyon and the southern Sierra Nevada. Fifth trip to Alaska, with Henry Fairfield Osborn Muir feels a strong premonition about the health of his mother; travels east to Wisconsin, whereupon on June 23 : Muir's mother, Ann Gilrye Muir, dies. Receives Honorary A.M degree from Harvard University, 1896. June 26: John Muir visits John Burroughs at Hyde Park; their second meeting. The next day Burroughs writes a journal entry about John Muir and their meeting. Muir makes third attempt to buy land at Fountain Lake for preservation August 5: John, along with his brother David, register to vote in Contra Costa County, stating his occupation as "geologist" and his basis of citizenship "by virtue of father's naturalization."" (1896) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-41: 'In 1896, on August 5, Muir and his brother David registered to vote in Contra Costa County, stating his basis of citizenship "by virtue of father\\'s naturalization."'; this part keeps only the quotes that support it.

### MUI-F-0055 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir's family settled into farm life in Milwaukee, Wisconsin.

**About:** category immigration, date 1849, place Milwaukee, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0021, National Park Service (institutional): "His family immigrated to America in 1849 and settled into farm life in Milwaukee, Wisconsin." (Early, self-taught education, paragraph 1) <https://www.nps.gov/articles/john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-8: "Muir's family immigrated to America in 1849 and settled into farm life in Milwaukee, Wisconsin."; this part keeps only the quotes that support it. Conflicts with other sources (Fountain Lake near Portage: MUI-F-0051, MUI-F-0003); kept as this source states it.

### MUI-F-0056 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** At the age of 10, Muir's family moved to the United States.

**About:** category immigration, place United States

**Evidence** (open the link and find the quote):

- MUI-S-0019, National Park Service (institutional): "At the age of 10, the family moved to the United States where they purchased an 80-acre tract of land near Portage, Wisconsin" (paragraph 1) <https://www.nps.gov/thri/johnmuir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-6: "At the age of 10, Muir's family moved to the United States, where they purchased an 80-acre tract of land near Portage, Wisconsin."; this part keeps only the quotes that support it. Conflicts with other sources (age 11: MUI-F-0024, tmp-baseline-F-8); kept as this source states it.

### MUI-F-0057 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir's family purchased an 80-acre tract of land near Portage, Wisconsin.

**About:** category immigration, place Portage, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0019, National Park Service (institutional): "At the age of 10, the family moved to the United States where they purchased an 80-acre tract of land near Portage, Wisconsin" (paragraph 1) <https://www.nps.gov/thri/johnmuir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-6: "At the age of 10, Muir's family moved to the United States, where they purchased an 80-acre tract of land near Portage, Wisconsin."; this part keeps only the quotes that support it.

### MUI-F-0058 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1879 Muir made his first trip to Alaska.

**About:** category career, date 1879, place Alaska

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1879: Proposed to Louie Strentzel; made his first trip to Alaska with S. Hall Young and discovered Glacier Bay and Muir Glacier." (Middle Years and Major Achievements, 1879) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0023, Sierra Club (institutional): "1879 First of many visits to Alaska." (1879) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0023 lacks word 'made' not in its quotes; word 'trip' not in its quotes

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-institutional-F-26: 'In 1879 Muir made his first trip to Alaska and discovered Glacier Bay and Muir Glacier.'; this part keeps only the quotes that support it.

### MUI-F-0059 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir's immigration to America was in 1849.

**About:** category immigration, date 1849, place America

**Evidence** (open the link and find the quote):

- MUI-S-0026, Library of Congress (institutional): "John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/13005573/>
- MUI-S-0026, Library of Congress (institutional): "his immigration to America (1849)" (item.summary\[0\]) <https://www.loc.gov/item/13005573/>
- MUI-S-0021, National Park Service (institutional): "His family immigrated to America in 1849 and settled into farm life in Milwaukee, Wisconsin." (Early, self-taught education, paragraph 1) <https://www.nps.gov/articles/john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0021 lacks word 'immigration' not in its quotes

**Notes:** Year only; no arrival date or port in this source. Bears on the IHH lead 'came to the United States at age 11'. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-8; its supporting quotes are appended verbatim.

### MUI-F-0060 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir's adolescence was on a pioneer farmstead near Kingston, Wisconsin.

**About:** category immigration, place Kingston, Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0026, Library of Congress (institutional): "John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/13005573/>
- MUI-S-0026, Library of Congress (institutional): "his adolescence on a pioneer farmstead near Kingston, Wisconsin" (item.summary\[0\]) <https://www.loc.gov/item/13005573/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** The IHH page gives the settlement location as a farm near Portage, Wisc., in 1849; this LoC summary names Kingston, Wisconsin and gives no year for the farmstead. Not reconciled here.

### MUI-F-0061 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir led the fight against the damming of the Hetch Hetchy Valley as a reservoir for the city of San Francisco.

**About:** category career, place Hetch Hetchy Valley

**Evidence** (open the link and find the quote):

- MUI-S-0028, Library of Congress (institutional): "John Muir, the leading preservationist of his day and founder of the Sierra Club, led the fight against the damming of the Hetch Hetchy Valley as a reservoir for the city of San Francisco." (item.summary\[0\]) <https://www.loc.gov/item/tmp93000846/>
- MUI-S-0012, National Park Service (institutional): "Yesterday, December 19, was the centennial of the Raker Act, the bill that allowed the building of a dam in the Hetch Hetchy Valley." (paragraph 1) <https://www.nps.gov/yose/blogs/remember-hetch-hetchy-the-raker-act-and-the-evolution-of-the-national-park-idea.htm>
- MUI-S-0012, National Park Service (institutional): "John Muir, who led the opposition, wrote beautifully about the valley, calling it “one of Nature's rarest and most precious mountain temples.”" (paragraph 5) <https://www.nps.gov/yose/blogs/remember-hetch-hetchy-the-raker-act-and-the-evolution-of-the-national-park-idea.htm>
- MUI-S-0012, National Park Service (institutional): "In the end, the Raker Act became law on December 19, 1913 and San Francisco celebrated its new water security, a pristine watershed preserved in a national park." (paragraph 6) <https://www.nps.gov/yose/blogs/remember-hetch-hetchy-the-raker-act-and-the-evolution-of-the-national-park-idea.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0012 lacks word 'fight' not in its quotes; word 'against' not in its quotes; word 'reservoir' not in its quotes; word 'city' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-domain-F-64 ('John Muir led the opposition to the Raker Act, the bill that allowed the building of a dam in the Hetch Hetchy Valley.'); its evidence is appended verbatim.

### MUI-F-0063 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1881 John Muir joined the expedition of the revenue cutter Corwin to the Arctic Ocean.

**About:** category career, date 1881, place Arctic Ocean

**Evidence** (open the link and find the quote):

- MUI-S-0030, Library of Congress (institutional): "The Corwin was a revenue cutter in the service of the United States Department of the Treasury that in 1881 was sent on a mission to the Arctic Ocean" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0030, Library of Congress (institutional): "writer John Muir (1838-1914), already well-known for his exploration of the Sierra Nevada Mountains of California, joined the expedition together with two other scientists." (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0081, Smithsonian Institution (institutional): "For its June 1881 voyage it was charged with making inquiries into the fate of the three vessels and rendering appropriate aid." (Description, sentence 2) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0118>
- MUI-S-0081, Smithsonian Institution (institutional): "By Hooper’s invitation, John Muir accompanied the voyage." (Description, sentence 5) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0118>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0081 lacks word 'joined' not in its quotes; word 'expedition' not in its quotes; word 'revenue' not in its quotes; word 'cutter' not in its quotes ...

**Notes:** The same summary later says 'Harriman Expedition of 1889', which conflicts with the 1899 date in other LoC records; not used. Merge muir-2026-10-09: added supporting quotes already staged under tmp-smithsonian-F-13.

### MUI-F-0064 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The Cruise of the Corwin, John Muir's account of the voyage, was posthumously published in 1917.

**About:** category work, date 1917

**Evidence** (open the link and find the quote):

- MUI-S-0030, Library of Congress (institutional): "writer John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0030, Library of Congress (institutional): "The Cruise of the Corwin: Journal of the Arctic Expedition of 1881 in Search of De Long and the Jeannette, posthumously published in 1917, is Muir's account of the voyage" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0088, National Park Service (institutional): "The Cruise of the Corwin (1917) A posthumous publication documenting Muir's 1881 voyage to the Arctic aboard the USS Corwin" (snapshot lines 97-99 (entry 'The Cruise of the Corwin (1917)' and its description)) <https://www.nps.gov/jomu/learn/historyculture/john-muir-s-books-and-publications.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T161433-d4f0, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0088 lacks word 'account' not in its quotes; word 'posthumously' not in its quotes; word 'published' not in its quotes

### MUI-F-0065 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir immigrated from Scotland to Wisconsin as a child.

**About:** category immigration, place Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "Muir immigrated from Scotland to Wisconsin as a child." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0027, Library of Congress (institutional): "Famed naturalist John Muir (1838-1914) came to Wisconsin as a boy" (item.summary\[0\]) <https://www.loc.gov/item/rc01000874/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0027 lacks word 'immigrated' not in its quotes; name 'Scotland' not in its quotes; word 'child' not in its quotes

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-7 ('Famed naturalist John Muir came to Wisconsin as a boy.'); its evidence is appended verbatim.

### MUI-F-0066 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** An 1867 industrial accident nearly blinded John Muir.

**About:** category other, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "After an 1867 industrial accident nearly blinded him" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0010, Wisconsin Historical Society (institutional): "An accident with a metal file in 1867 nearly blinded him, and the resulting weeks of sightlessness made Muir fully realize how important the beauties of Nature were to him." (paragraph 7) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0032 found (https://www.loc.gov/item/today-in-history/july-19/); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641)

**Checker's reasoning:** The snapshots contain every quoted passage, and the Library of Congress page available through web search contains its quoted passages. The Wisconsin Historical Society live page was unreachable.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0010 lacks word 'industrial' not in its quotes

**Notes:** Bears on the vague IHH lead 'An eye injury caused John Muir to change course' (tmp-baseline-F-16): this LoC page dates the accident 1867 but gives no place. Merge muir-2026-10-09: combined with duplicate candidate tmp-domain-F-52 ('An accident with a metal file in 1867 nearly blinded Muir.'); its evidence is appended verbatim.

### MUI-F-0067 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** After an 1867 industrial accident, John Muir abandoned his career as an inventor to work as a naturalist.

**About:** category career, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "After an 1867 industrial accident nearly blinded him, he abandoned his career as an inventor to work as a naturalist." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "In his early career, he worked on mechanical inventions until an eye injury caused him to change course." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** The Immigrant Hall of Honor live page was unreachable, which is acceptable for this http-fetched source; no other problem found.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0001 lacks year 1867 not in its quotes; name 'After' not in its quotes; word 'industrial' not in its quotes; word 'accident' not in its quotes ...

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-16 ('An eye injury caused John Muir to change course from mechanical inventions.'); its evidence is appended verbatim.

### MUI-F-0068 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1876 John Muir advocated adoption of a federal forest conservation program.

**About:** category career, date 1876

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "An early defender of the environment, Muir in 1876 advocated adoption of a federal forest conservation program." (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

### MUI-F-0073 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir was an early advocate of preservation of wilderness in the United States.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir (1838 –1914) was a Scottish-born American naturalist, author, and early advocate of preservation of wilderness in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0085, Smithsonian Institution (institutional): "He was a Scottish-born American naturalist, author, and an advocate for the preservation of wilderness in the United States and the National Park Service." (Description, paragraph 4, sentence 2) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0085, Smithsonian Institution (institutional): "This Celebrate the Century Issue stamp depicts preservationist John Muir and Yosemite Valley, California." (Description, paragraph 4, sentence 1) <https://postalmuseum.si.edu/object/npm_1998.2010.874>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0074 found (https://www.archives.gov/nhprc/projects/catalog/john-muir); MUI-S-0085 found (https://postalmuseum.si.edu/object/npm\_1998.2010.874)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0085 lacks word 'early' not in its quotes

**Notes:** NARA-written NHPRC project page. Merge muir-2026-10-09: combined with duplicate candidate tmp-smithsonian-F-10 ('John Muir was an advocate for the preservation of wilderness in the United States.'); its evidence is appended verbatim.

### MUI-F-0075 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir died 24 Dec 1914.

**About:** category death, date 1914-12-24

**Evidence** (open the link and find the quote):

- MUI-S-0076, Smithsonian Institution (institutional): "John Muir, 21 Apr 1838 - 24 Dec 1914" (Sitter) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0082, Smithsonian Institution (institutional): "Muir died in 1914." (Description, last sentence) <https://americanhistory.si.edu/collections/object/nmah_1285012>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Died: Dec. 24, 1914, Los Angeles, Calif." (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0029, Library of Congress (institutional): "John Muir was the Club's first President and guiding force until his death in 1914." (item.summary\[0\]) <https://www.loc.gov/item/03022601/>
- MUI-S-0016, U.S. National Archives and Records Administration (institutional): "d. 12-24-14 in Los Angeles, Calif." (sourceNotes\[0\]) <https://catalog.archives.gov/id/10580990>
- MUI-S-0023, Sierra Club (institutional): "1914 Dies December 24, in Los Angeles." (1914) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0024, Sierra Club (institutional): "1914 April 21 : John Muir turns 76 years old May: A young Japanese college student, Ryozo Azuma, learns about Muir when visiting Mt. Rainier from Tacoma Washington's College of the Pacific; he reads Muir's books and travels to Martinez where he meets Muir. Azuma later becomes a noted Japanese conservationist and mountaineer, known as "The John Muir of Japan." December 24 : John Muir dies in California Hospital, Los Angeles, from pneumonia on Christmas eve" (1914) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T191354-7ceb, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0076 found (https://npg.si.edu/object/npg\_NPG.65.79); MUI-S-0082 found (https://americanhistory.si.edu/collections/object/nmah\_1285012); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0029 found (https://www.loc.gov/item/03022601/?fo=json); MUI-S-0016 found (https://catalog.archives.gov/proxy/records/search?naId=10580990); MUI-S-0023 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own; G5: no primary or institutional source in evidence whose publisher is in the authority registry and whose own quotes cover the whole claim; G5: sources that do not cover the whole claim on their own (never pooled for G5): MUI-S-0076 lacks word 'died' not in its quotes \| MUI-S-0082 lacks date '24 Dec 1914' (1914-12-24) not in its quotes; event\_date 1914-12-24 not in its quotes \| MUI-S-0029 lacks date '24 Dec 1914' (1914-12-24) not in its quotes; word 'died' not in its quotes; event\_date 1914-12-24 not in its quotes \| MUI-S-0016 lacks date '24 Dec 1914' (1914-12-24) not in its quotes; word 'died' not in its quotes; event\_date 1914-12-24 not in its quotes \| MUI-S-0023 lacks date '24 Dec 1914' (1914-12-24) not in its quotes; word 'died' not in its quotes; event\_date 1914-12-24 not in its quotes \| MUI-S-0024 lacks date '24 Dec 1914' (1914-12-24) not in its quotes; word 'died' not in its quotes; event\_date 1914-12-24 not in its quotes

**Notes:** NPG Sitter line gives the death date; NMAH gives the year. Place of death not in these sources. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-5 ('John Muir died Dec. 24, 1914.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-56 ("John Muir's death was in 1914."); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-identify-F-7; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-65; its supporting quotes are appended verbatim.

### MUI-F-0095 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1839 John Muir and his family move from Muir's birthplace at 126/128 High St., Dunbar, next door to 130 High St.

**About:** category family, date 1839, place Dunbar

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "1839 April 21 : John Muir turns 1 year old John and his family move from Muir's birthplace at 126/128 High St., Dunbar, next door to 130 High St., where the family remained until Muir was 11 years old." (chronology entry 1839) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 1 (Dunbar): street addresses. Only the Sierra Club chronology gives the street numbers.

### MUI-F-0096 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1841 John Muir begins school in Dunbar.

**About:** category education, date 1841, place Dunbar

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1841 Begins school in Dunbar." (chronology entry 1841) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 1 (Dunbar).

### MUI-F-0109 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1857 John Muir helps his family construct a house, barn and well at Hickory Hill.

**About:** category family, date 1857, place Hickory Hill

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1857 Helps family construct house, barn & well at Hickory Hill." (chronology entry 1857) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 2 (Hickory Hill).

### MUI-F-0113 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir lived in North Hall, the student residence hall, at the University of Wisconsin.

**About:** category education, place North Hall

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "February : Enrolls at the University of Wisconsin and attends for almost 2 1/2 years (5 trimesters); teaches school in winter Learns about geology from Dr. Ezra S. Carr . Carr's wife, Jeanne, becomes his mentor Invents a study desk that retrieves a book, holds it in place for the prescribed period of time, and then automatically replaces it with another book Muir has his first informal lesson in botany from from Milton S. Griswold, a classmate, beneath a black locust near North Hall, the student residence hall where he was then living." (chronology entry 1861) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 3: the building. Room within North Hall not stated by a registered source (gap). The NHL nomination dates the Griswold botany lesson to June 1862, not 1861, so no year is claimed.

### MUI-F-0118 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** James Hutchings hired John Muir to build and operate his sawmill.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0093, National Park Service (institutional): "James Hutchings hired the 31-year-old Scotsman named John Muir to build and operate his sawmill." (paragraph on the Hutchings House) <https://www.nps.gov/yose/learn/historyculture/hutchings.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0093 found (https://www.nps.gov/yose/learn/historyculture/hutchings.htm)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 4.

### MUI-F-0124 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir made the John Muir House in Martinez his home from 1890 until his death in 1914.

**About:** category other, date 1890, place Martinez

**Evidence** (open the link and find the quote):

- MUI-S-0047, Library of Congress (institutional): "John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA" (title) <https://www.loc.gov/item/ca0124/>
- MUI-S-0047, Library of Congress (institutional): "John Muir, who married Strentzel's daughter, made this his home from 1890 until his death in 1914." (notes\[1\] Significance) <https://www.loc.gov/item/ca0124/>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6: date range.

### MUI-F-0125 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In the John Muir House, Muir produced most of his significant published works on the flora and fauna of the west.

**About:** category work

**Evidence** (open the link and find the quote):

- MUI-S-0047, Library of Congress (institutional): "John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA" (title) <https://www.loc.gov/item/ca0124/>
- MUI-S-0047, Library of Congress (institutional): "Here Muir, naturalist, conservationist and rancher, produced most of his significant published works on the flora and fauna of the west." (notes\[1\] Significance) <https://www.loc.gov/item/ca0124/>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6: what he did there.

### MUI-F-0126 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** John Muir converted one large bedroom on the second floor into a study.

**About:** category work

**Evidence** (open the link and find the quote):

- MUI-S-0091, National Park Service (institutional): "The second floor has six bedrooms, one water closet and one bathroom. Three bedrooms have been restored: Muir's, the children's and the guestroom'. One large bedroom was converted to a study by John Muir and has been restored as such." (house description paragraph) <https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0091 found (https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6: the room. The NPS page captions Muir's desk in the 'Scribble Den' (MUI MUI-S-0090); HABS photo 13 (1960) is titled 'John Muir bedroom & study'.

### MUI-F-0128 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1899 John Muir was aboard the steamship George W. Elder with the Harriman Alaska Expedition.

**About:** category career, date 1899

**Evidence** (open the link and find the quote):

- MUI-S-0024, Sierra Club (institutional): "Muir's seventh trip to Alaska, with the Harriman Alaska Expedition to Wrangell, Glacier Bay, Sitka, Prince William Sound, and the Aleutian Islands and beyond. In 1899, railroad magnate Edward H. Harriman organized a summer voyage to the wilds of Alaska: He converted a steamship, the George W. Elder, into a luxury "floating university," populated by some of America's best and brightest scientists and writers, including John Muir. Those aboard encountered" (chronology entry 1899) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 5 (Alaska) travel leg. Smithsonian Institution Archives (MUI-S-0080) also says the expedition 'traveled to Alaska aboard the S.S. George W. Elder' but does not name Muir in that passage.

### MUI-F-0129 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1890 Muir traveled to Muir Glacier in Alaska.

**About:** category career, date 1890, place Muir Glacier

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1890: Traveled to Muir Glacier in Alaska" (timeline entry 1890) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 5 (Alaska).

### MUI-F-0131 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In the fall of 1869 John Muir began his fulltime life in Yosemite Valley.

**About:** category career, date 1869, place Yosemite Valley

**Evidence** (open the link and find the quote):

- MUI-S-0094, University of the Pacific (institutional): "In the fall of 1869 John Muir began his fulltime life in Yosemite Valley where he rebuilt and ran a sawmill for James Hutchings." (exhibit text) <https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0094 unreachable (https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/)

**Checker's reasoning:** The snapshot explicitly supports the claim, date and place. The live source was unreachable: web access returned HTTP 403 and shell access failed DNS resolution.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 4. Split from withdrawn MUI-F-0117.

### MUI-F-0132 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In Yosemite Valley John Muir ran a sawmill for James Hutchings.

**About:** category career, place Yosemite Valley

**Evidence** (open the link and find the quote):

- MUI-S-0094, University of the Pacific (institutional): "In the fall of 1869 John Muir began his fulltime life in Yosemite Valley where he rebuilt and ran a sawmill for James Hutchings." (exhibit text) <https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0094 unreachable (https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/)

**Checker's reasoning:** The snapshot explicitly states that Muir ran a sawmill for James Hutchings in Yosemite Valley. The live source was unreachable: web access returned HTTP 403 and shell access failed DNS resolution.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 4. Split from withdrawn MUI-F-0117.

### MUI-F-0133 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1880 Muir rents part of the Strentzel ranch.

**About:** category career, date 1880

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1880 Apr-Ju1 Rents part of Strentzel ranch; lives in Coleman house on ranch; works in orchards and vineyards to learn fruit business." (chronology entry 1880) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6. Split from withdrawn MUI-F-0121.

### MUI-F-0134 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1880 Muir lives in the Coleman house on the Strentzel ranch.

**About:** category family, date 1880

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1880 Apr-Ju1 Rents part of Strentzel ranch; lives in Coleman house on ranch; works in orchards and vineyards to learn fruit business." (chronology entry 1880) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6: residence before 1890. Split from withdrawn MUI-F-0121.

### MUI-F-0135 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** The large family parlor fireplace is in the mission style that Muir had built after the original fireplace was destroyed in the 1906 earthquake.

**About:** category other

**Evidence** (open the link and find the quote):

- MUI-S-0091, National Park Service (institutional): "The large family parlor fireplace is in the mission style that Muir had built after the original fireplace was destroyed in the 1906 earthquake." (fireplaces paragraph) <https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0091 found (https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 6: room detail. Replaces withdrawn MUI-F-0127 with event\_date null (the source dates the earthquake, not the building work).

### MUI-F-0136 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** On his first Alaska trip, Muir meets S. Hall Young at Ft. Wrangel.

**About:** category career, place Ft. Wrangel

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1879 Jun-Jan 1880 First Alaska trip; Bulletin correspondent; itinerary includes Portland, Seattle, Victoria. Meets S. Hall Young at Ft. Wrangel; travel together to Sitka, Stickeen River, Fairweather Mountains, Glacier Bay." (chronology entry 1879) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 5. Replaces withdrawn MUI-F-0130 without a year per destination.

### MUI-F-0137 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** On his first Alaska trip, Muir and S. Hall Young travel together to Glacier Bay.

**About:** category career, place Glacier Bay

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1879 Jun-Jan 1880 First Alaska trip; Bulletin correspondent; itinerary includes Portland, Seattle, Victoria. Meets S. Hall Young at Ft. Wrangel; travel together to Sitka, Stickeen River, Fairweather Mountains, Glacier Bay." (chronology entry 1879) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004431-f5b3, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 5. Replaces withdrawn MUI-F-0130 without a year per destination.

### MUI-F-0138 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir enrolls at the University of Wisconsin in 1861.

**About:** category education, date 1861, place University of Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1861 January Enrolls at University of Wisconsin, Madison." (chronology entry 1861) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair2-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004816-b80b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 3. Conflict: the NPS timeline (MUI-S-0017) puts enrolment under 1860; Pacific says January 1861, Sierra Club February 1861. Restaged from withdrawn MUI-F-0112 without the Sierra Club quote (unreachable live; that chronology says the same). Ruling 2026-10-16 (owner rule: a primary record decides; CONFLICTS.md): enrolment early 1861 (Ann Gilrye Muir to John Muir, 30 March 1861, Pacific jmcl/18422: 'back in at the university'; UW Catalogue 1861-62, First Year, 'John Muir'). The NPS 1860 date is not used.

### MUI-F-0139 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir leaves the University in 1863.

**About:** category education, date 1863

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1863 June Leaves University, intending to enter medical school" (chronology entry 1863) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair2-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004816-b80b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour stop 3: end date. The NPS timeline says '1863: Left the University'. Restaged from withdrawn MUI-F-0114 without the Sierra Club quote (unreachable live; that chronology says the same).

### MUI-F-0140 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir arrives in San Francisco via the Isthmus of Panama in 1868, in March.

**About:** category career, date 1868, place San Francisco

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1868 late March Arrives in San Francisco via Isthmus of Panama." (chronology entry 1868) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair2-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004816-b80b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Tour travel leg to stop 4 (Yosemite). No ship name found in a registered source. Restaged from withdrawn MUI-F-0115 without the Sierra Club quote (unreachable live; that chronology says the same).

### MUI-F-0147 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** In 1903, President Theodore Roosevelt posed with John Muir for pictures on Overhanging Rock at the top of Glacier Point.

**About:** category career, date 1903, place Overhanging Rock, Glacier Point

**Evidence** (open the link and find the quote):

- MUI-S-0124, National Park Service (institutional): "In 1903, President Theodore Roosevelt posed with John Muir for pictures on Overhanging Rock at the top of Glacier Point" (page text) <https://home.nps.gov/yose/learn/historyculture/muir-influences.htm>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0124 found (https://home.nps.gov/yose/learn/historyculture/muir-influences.htm)

**Checker's reasoning:** no problem found

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Ratio-lift RL-S-013 (named in RL-F-009's notes as independent corroboration). Chapter muir/history.

### MUI-F-0152 (single-source)

- [ ] edit, new wording: 
- [ ] reject
- [ ] note (for example a better source): 

**Claim:** Muir turned his North Hall dormitory room into a campus attraction by filling it with machines.

**About:** category work, place North Hall

**Evidence** (open the link and find the quote):

- MUI-S-0010, Wisconsin Historical Society (institutional): "Muir turned his North Hall dormitory room into a campus attraction by filling it with all manner of practical and semi-practical machines." (article, paragraph after the State Fair paragraph) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>

**Extractor:** claude:claude-opus-5-5 (run round9-2026-10-29, 2026-10-29) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-round9-muir-2026-10-29, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641)

**Checker's reasoning:** The snapshot contains the quoted passage, which states the claim. The live page could not be loaded.

**Why it is not verified:** G5: no primary document covering the whole claim, and sources covering the whole claim come from 1 independent holder(s); needs 2+ distinct institutions (counted by authority registry entry, else by registered domain; a name claiming a registered holder counts as that holder; two sources whose quotes are the same text, or one derived\_from the other, count once), each with quotes that cover the whole claim on their own

**Notes:** Round 9 (owner feedback item 6): ties his machines to his room in North Hall. Only the Wisconsin Historical Society states it (the Sierra Club chronology's 1935 entry recalls his inventions in 'his room on the University of Wisconsin campus' without naming North Hall); expected single-source. Place repaired before adversary review (2026-10-29): was 'North Hall, University of Wisconsin, Madison', which G2 flagged (a name not in the evidence).

## 4. Verified, awaiting your decision (51)

### MUI-F-0001 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was born April 21, 1838.

**About:** category birth, date 1838-04-21

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Born: April 21, 1838, Dunbar, East Lothian, Scotland" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0076, Smithsonian Institution (institutional): "John Muir, 21 Apr 1838 - 24 Dec 1914" (Sitter) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0076, Smithsonian Institution (institutional): "Born Dunbar, Scotland" (Exhibition Label, line 1) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0009, Sierra Club (institutional): "1838 John Muir born April 21 \*, in Dunbar, Scotland." (timeline entry 1838) <https://www.sierraclub.org/arkansas/sierra-club>
- MUI-S-0016, U.S. National Archives and Records Administration (institutional): "b. 4-21-1838 in Dunbar, Scotland" (sourceNotes\[0\]) <https://catalog.archives.gov/id/10580990>
- MUI-S-0017, National Park Service (institutional): "1838: April 21, John Muir born in Dunbar, Scotland." (Early Years and Education, 1838) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0021, National Park Service (institutional): "John Muir was born in Dunbar, Scotland on April 21, 1838" (Early, self-taught education, paragraph 1) <https://www.nps.gov/articles/john-muir.htm>
- MUI-S-0023, Sierra Club (institutional): "1838 Born April 21 in Dunbar, Scotland." (timeline, 1838) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0024, Sierra Club (institutional): "April 21 : John Muir is born in Dunbar, Scotland, the son of Daniel and Ann Gilrye Muir." (1838) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0072, U.S. National Archives and Records Administration (primary): "digitalObjects\[415\].objectDescription: Name: John Muir; Age/Year of Birth: 1838" (digitalObjects\[415\].objectDescription) <https://catalog.archives.gov/id/235846313>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0076 found (https://npg.si.edu/object/npg\_NPG.65.79); MUI-S-0009 unreachable (https://www.sierraclub.org/arkansas/sierra-club); MUI-S-0016 unreachable (https://catalog.archives.gov/proxy/records/search?naId=10580990); MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0021 found (https://www.nps.gov/articles/john-muir.htm); MUI-S-0023 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx); MUI-S-0024 unreachable (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx); MUI-S-0072 unreachable (https://catalog.archives.gov/proxy/records/search?naId=235846313)

**Checker's reasoning:** No problem found in the snapshots or accessible live sources; several live sources were unreachable.

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with duplicate candidate tmp-smithsonian-F-2 ('John Muir was born 21 Apr 1838.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-44; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-identify-F-6; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-1; its supporting quotes are appended verbatim. tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0072, the source of shipped tour record MUI-M-0062, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### MUI-F-0006 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir co-founded the Sierra Club in 1892.

**About:** category work, date 1892

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "He co-founded the Sierra Club in 1892, serving as its president until his death." (BIOGRAPHY paragraph) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Co-Founder, the Sierra Club, (May 28, 1892) and served as president until his death." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0024, Sierra Club (institutional): "1892 April 21 : John Muir turns 54 years old Muir co-founds the Sierra Club ; serves as its President for the rest of his life." (1892) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0025, Online Archive of California (secondary): "He also helped found the Sierra Club (1892)" (Biographical / historical, paragraph 2) <https://oac.cdlib.org/findaid/ark:/13030/kt709nf3b8/>
- MUI-S-0023, Sierra Club (institutional): "1892 Helps found Sierra Club" (1892) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>
- MUI-S-0032, Library of Congress (institutional): "naturalist John Muir set pen to paper" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0032, Library of Congress (institutional): "In 1892, Muir co-founded the Sierra ClubExternal as an association explicitly dedicated to wilderness preservation" (articles\[1\] (John Muir article)) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0015, Sierra Club (institutional): "In 1892, John Muir and other supporters formed the Sierra Club "to make the mountains glad."" (paragraph 4) <https://www.sierraclub.org/john-muir-exhibit/john-muir-biography>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): oac.cdlib.org: Online Archive of California, institutional

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-35 ('In 1892 Muir co-founds the Sierra Club.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-institutional-F-79 ('John Muir helped found the Sierra Club (1892).'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-loc-F-21; its supporting quotes are appended verbatim. Merge muir-2026-10-09: added supporting quotes already staged under tmp-domain-F-72. Repair muir-2026-10-09 (G1): MUI-S-0032 quote recopied verbatim from the snapshot, which reads "Sierra ClubExternal" (link-label text run into the name). tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0029 (record MUI-M-0066) was attached and re-judged twice; both verdicts were supported, but MUI-S-0024 (a browser snapshot) was unreachable live, so G10 made the fact disputed. The attachment was withdrawn and the record restored from staging/facts.before-links-tour-links-2026-11-01.jsonl, with its earlier verdict. MUI-M-0066 stays unlinked.

### MUI-F-0014 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir wrote and published 12 books.

**About:** category work

**Evidence** (open the link and find the quote):

- MUI-S-0001, Immigrant Hall of Honor (secondary): "Wrote and published 12 books and more than 300 magazine articles on conservation." (ACHIEVEMENTS list) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0011, National Park Service (institutional): "John wrote and had published over 300 magazine articles and 12 books." (Writing for a Cause) <https://www.nps.gov/jomu/learn/education/education-the-importance-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Single-source secondary claim from IHH's current page. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-59; its supporting quotes are appended verbatim.

### MUI-F-0037 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1892 Muir founded the Sierra Club.

**About:** category career, date 1892

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1892: Founded the Sierra Club, marking the end of his ranching career." (Middle Years and Major Achievements, 1892) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0019, National Park Service (institutional): "in 1892 he established the Sierra Club" (paragraph 11) <https://www.nps.gov/thri/johnmuir.htm>
- MUI-S-0021, National Park Service (institutional): "In 1892, Muir and other citizens banded together and established the Sierra Club." (Creation of Yosemite National Park) <https://www.nps.gov/articles/john-muir.htm>
- MUI-S-0083, Smithsonian Institution (institutional): "The Sierra Club, an American environmental organization headquartered in San Francisco, developed a reputation in the 1960s as an aggressive defender of wild lands." (Description, sentence 1) <https://americanhistory.si.edu/collections/object/nmah_600412>
- MUI-S-0083, Smithsonian Institution (institutional): "The organization was founded in 1892 by John Muir, a Scottish American naturalist and essayist." (Description, sentence 3) <https://americanhistory.si.edu/collections/object/nmah_600412>
- MUI-S-0076, Smithsonian Institution (institutional): "In recent years, the Sierra Club, an environmental organization that Muir helped found in 1892, has acknowledged Muir’s marginalization of Native Americans and his exclusion of people of color from conservation efforts." (Exhibition Label, paragraph 2) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0084, Smithsonian Institution (institutional): "He founded the Sierra Club, the oldest and largest environmental organizations in the United States." (Description, sentence 2) <https://postalmuseum.si.edu/object/npm_1980.2493.5476>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir (1838 –1914) was a Scottish-born American naturalist, author, and early advocate of preservation of wilderness in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "The Sierra Club, which he founded, is now one of the most important conservation organizations in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0028, Library of Congress (institutional): "John Muir, the leading preservationist of his day and founder of the Sierra Club" (item.summary\[0\]) <https://www.loc.gov/item/tmp93000846/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Sierra Club itself (S-7, S-8) says 'Helps found' / 'co-founds'; IHH says co-founded. Merge muir-2026-10-09: combined with duplicate candidate tmp-smithsonian-F-19 ('John Muir founded the Sierra Club in 1892.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-nara-F-15 ('John Muir founded the Sierra Club.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with duplicate candidate tmp-loc-F-16 ('John Muir was the founder of the Sierra Club.'); its evidence is appended verbatim.

### MUI-F-0043 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1901 Muir published Our National Parks.

**About:** category work, date 1901

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1901: Published Our National Parks." (Later Years and Legacy, 1901) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0018, National Park Service (institutional): "1901 Our National Parks published." (1901) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>
- MUI-S-0076, Smithsonian Institution (institutional): "He published numerous articles and books, notably Our National Parks (1901)." (Exhibition Label, paragraph 2) <https://npg.si.edu/object/npg_NPG.65.79>
- MUI-S-0076, Smithsonian Institution (institutional): "John Muir, 21 Apr 1838 - 24 Dec 1914" (Sitter) <https://npg.si.edu/object/npg_NPG.65.79>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-smithsonian-F-27 ('John Muir published Our National Parks in 1901.'); its evidence is appended verbatim.

### MUI-F-0046 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1911 Muir published My First Summer in the Sierra.

**About:** category work, date 1911

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1911: Published My First Summer in the Sierra." (Later Years and Legacy, 1911) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0024, Sierra Club (institutional): "1911 April 21 : John Muir turns 73 years old Spring: Muir travels to New York, Washington, Garrison, Boston, and New Haven. May 13: Muir travels to Rochester to visit Harriman May 21: Muir is interviewed in the Boston Herald before speaking to the Appalachian Mountain Club. June: Muir's My First Summer in the Sierra is published Book Review by Marion Randall Parsons (January, 1912 Sierra Club Bulletin) June 17 : John Muir makes a speech to the American Alpine Club in New York, eventually published in Sierra Club Bulletin (Jan., 1924). June 21: Muir is awarded an honorary Litt. D. degree by Yale University" (1911) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Merge muir-2026-10-09: added supporting quotes already staged under MUI-F-0047.

### MUI-F-0062 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was Scottish-born.

**About:** category birth

**Evidence** (open the link and find the quote):

- MUI-S-0030, Library of Congress (institutional): "The Scottish-born naturalist, conservationist, and writer John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir (1838 –1914) was a Scottish-born American naturalist, author, and early advocate of preservation of wilderness in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0010, Wisconsin Historical Society (institutional): "Born in Scotland, John Muir emigrated with his family in 1849, settling at Fountain Lake, near Portage, Wisconsin." (paragraph 3) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0025, Online Archive of California (secondary): "A Scottish-born journalist and naturalist, John Muir (1838-1914) studied botany and geology at the University of Wisconsin (1861-1863)." (Biographical / historical, paragraph 1) <https://oac.cdlib.org/findaid/ark:/13030/kt709nf3b8/>
- MUI-S-0085, Smithsonian Institution (institutional): "He was a Scottish-born American naturalist, author, and an advocate for the preservation of wilderness in the United States and the National Park Service." (Description, paragraph 4, sentence 2) <https://postalmuseum.si.edu/object/npm_1998.2010.874>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0030 found (https://www.loc.gov/item/17031765/); MUI-S-0074 found (https://www.archives.gov/nhprc/projects/catalog/john-muir); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641); MUI-S-0025 found (https://oac.cdlib.org/findaid/ark:/13030/kt709nf3b8/); MUI-S-0085 found (https://postalmuseum.si.edu/object/npm\_1998.2010.874)

**Checker's reasoning:** The Wisconsin Historical Society article could not be loaded live; the other live sources retain their quoted passages. No problem with the claim was found.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): oac.cdlib.org: Online Archive of California (UC Libraries), institutional

**Notes:** Merge muir-2026-10-09: combined with duplicate candidate tmp-nara-F-7 ('John Muir was Scottish-born.'); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-domain-F-48; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-institutional-F-78; its supporting quotes are appended verbatim. Merge muir-2026-10-09: added supporting quotes already staged under MUI-F-0077.

### MUI-F-0069 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was a writer.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0030, Library of Congress (institutional): "The Scottish-born naturalist, conservationist, and writer John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Occupation: Naturalist, preservationist, writer, inventor" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Split at merge (muir-2026-10-09) from compound candidate tmp-loc-F-24: 'John Muir was a naturalist, conservationist, and writer.'; this part keeps only the quotes that support it. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-12 ("John Muir's Occupation: writer."); its evidence is appended verbatim.

### MUI-F-0070 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir and other leading preservationists signed a petition that the Society for the Preservation of National Parks submitted to Congress.

**About:** category career, date 1913-06-27

**Evidence** (open the link and find the quote):

- MUI-S-0070, U.S. National Archives and Records Administration (primary): "The Society for the Preservation of National Parks submitted this petition to Congress" (scopeAndContentNote) <https://catalog.archives.gov/id/7268060>
- MUI-S-0070, U.S. National Archives and Records Administration (primary): "Signed by John Muir and other leading preservationists" (scopeAndContentNote) <https://catalog.archives.gov/id/7268060>
- MUI-S-0070, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1913-06-27" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7268060>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Original record: Senate Committee on Public Lands papers, 63rd Congress (SEN63A-F26). Identity anchor: Hetch Hetchy Valley within Yosemite National Park (generalNotes\[0\]). event\_date is the record's production date.

### MUI-F-0071 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The petition signed by John Muir urged Congress to defeat the Raker Bill, which called for a dam to be built across the Hetch Hetchy Valley.

**About:** category career, date 1913-06-27, place Hetch Hetchy Valley

**Evidence** (open the link and find the quote):

- MUI-S-0070, U.S. National Archives and Records Administration (primary): "The Society for the Preservation of National Parks submitted this petition to Congress, urging them to defeat the Raker Bill, which called for a dam to be built across the Hetch Hetchy Valley. Signed by John Muir and other leading preservationists" (scopeAndContentNote) <https://catalog.archives.gov/id/7268060>
- MUI-S-0070, U.S. National Archives and Records Administration (primary): "productionDates\[0\].logicalDate: 1913-06-27" (productionDates\[0\].logicalDate) <https://catalog.archives.gov/id/7268060>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Same record as the signing fact; states the petition's purpose.

### MUI-F-0072 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Frank Bond wrote to John Muir on December 28, 1906, regarding the location of certain Petrified Forest remains in Arizona that were outside the boundaries of the Petrified Forest National Monument.

**About:** category career, date 1906-12-28, place Arizona

**Evidence** (open the link and find the quote):

- MUI-S-0071, U.S. National Archives and Records Administration (primary): "Frank Bond served as Division Chief from 1903 to 1907." (scopeAndContentNote) <https://catalog.archives.gov/id/5708440>
- MUI-S-0071, U.S. National Archives and Records Administration (primary): "In his letter of December 28, 1906, he wrote to John Muir regarding the location of certain Petrified Forest remains in Arizona that were outside the boundaries of the Petrified Forest National Monument." (scopeAndContentNote) <https://catalog.archives.gov/id/5708440>
- MUI-S-0071, U.S. National Archives and Records Administration (primary): "subjects\[0\].heading: Muir, John, 1838-1914" (subjects\[0\].heading) <https://catalog.archives.gov/id/5708440>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Series description of GLO Division L letters (press copies); the subject heading ties the series to Muir, John, 1838-1914. The letter itself was not read.

### MUI-F-0078 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was a preservationist.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0085, Smithsonian Institution (institutional): "This Celebrate the Century Issue stamp depicts preservationist John Muir and Yosemite Valley, California." (Description, paragraph 4, sentence 1) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0085, Smithsonian Institution (institutional): "John Muir, preservationist" (Description, paragraph 2) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Occupation: Naturalist, preservationist, writer, inventor" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0048, Library of Congress (institutional): "the renowned Scottish-American naturalist and preservationist, John Muir" (item.notes\[2\]) <https://www.loc.gov/item/ca4264/>
- MUI-S-0028, Library of Congress (institutional): "John Muir, the leading preservationist of his day and founder of the Sierra Club, led the fight against the damming of the Hetch Hetchy Valley" (description\[0\]) <https://www.loc.gov/item/tmp93000846/>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0085 found (https://postalmuseum.si.edu/object/npm\_1998.2010.874); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0048 found (https://www.loc.gov/pictures/item/ca4264/); MUI-S-0028 found (https://www.loc.gov/resource/gdc.tmp93000846/?sp=9&st=image)

**Checker's reasoning:** no problem found

**Notes:** NPM stamp record. Agrees with the IHH occupation lead. Merge muir-2026-10-09: combined with duplicate candidate tmp-baseline-F-11 ("John Muir's Occupation: preservationist."); its evidence is appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-media-F-6; its supporting quotes are appended verbatim. tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0028, the source of shipped tour record MUI-M-0065, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### MUI-F-0079 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was an author.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0085, Smithsonian Institution (institutional): "He was a Scottish-born American naturalist, author, and an advocate for the preservation of wilderness in the United States and the National Park Service." (Description, paragraph 4, sentence 2) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0085, Smithsonian Institution (institutional): "This Celebrate the Century Issue stamp depicts preservationist John Muir and Yosemite Valley, California." (Description, paragraph 4, sentence 1) <https://postalmuseum.si.edu/object/npm_1998.2010.874>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir (1838 –1914) was a Scottish-born American naturalist, author, and early advocate of preservation of wilderness in the United States." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NPM stamp record. The IHH page says writer; this source says author. Merge muir-2026-10-09: combined with duplicate candidate tmp-nara-F-9 ('John Muir was an author.'); its evidence is appended verbatim.

### MUI-F-0080 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was a conservationist.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0084, Smithsonian Institution (institutional): "This John Muir Issue features a portrait of John Muir, Scottish-American naturalist and conservationist, and an image of a man standing in a forest of Redwood trees." (Description, sentence 1) <https://postalmuseum.si.edu/object/npm_1980.2493.5476>
- MUI-S-0030, Library of Congress (institutional): "The Scottish-born naturalist, conservationist, and writer John Muir (1838-1914)" (item.summary\[0\]) <https://www.loc.gov/item/17031765/>
- MUI-S-0047, Library of Congress (institutional): "Here Muir, naturalist, conservationist and rancher, produced most of his significant published works on the flora and fauna of the west." (item.notes\[1\]) <https://www.loc.gov/item/ca0124/>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "John Muir Papers, 1856–1942" (page heading) <https://www.archives.gov/nhprc/projects/catalog/john-muir>
- MUI-S-0074, U.S. National Archives and Records Administration (institutional): "Correspondence, journals, manuscripts, notes, drawings, and photographs of and by the conservationist, an intellectual precursor of the modern ecology movement and a proponent of the expansion of the national park system." (page text, project description paragraph) <https://www.archives.gov/nhprc/projects/catalog/john-muir>

**Extractor:** claude:claude-opus-5-5 (run muir-2026-10-09, 2026-10-09) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NPM 1964 stamp record. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-loc-F-24; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-media-F-5; its supporting quotes are appended verbatim. Merge muir-2026-10-09: combined with the matching part of compound candidate tmp-nara-F-17; its supporting quotes are appended verbatim.

### MUI-F-0081 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir died in Los Angeles.

**About:** category death, date 1914, place Los Angeles

**Evidence** (open the link and find the quote):

- MUI-S-0020, National Park Service (institutional): "On Christmas Eve, 1914—just more than a year after Congress authorized the dam’s construction—Muir died. Even though he died in a Los Angeles hospital" (paragraph on Hetch Hetchy and Muir's death) <https://www.nps.gov/yose/learn/historyculture/muir.htm>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Died: Dec. 24, 1914, Los Angeles, Calif." (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10 (G5 whole-claim rule): narrower form of MUI-F-0002 without 'Calif.' and with event\_date 1914, so the NPS quote and the IHH quote each cover the whole claim.

### MUI-F-0082 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir immigrated from Scotland to Wisconsin.

**About:** category immigration, place Wisconsin

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "Muir immigrated from Scotland to Wisconsin as a child." (John Muir paragraph) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0020, National Park Service (institutional): "Born in Scotland in 1838, Muir immigrated to Wisconsin with his family when he was 11 years old." (biography paragraph) <https://www.nps.gov/yose/learn/historyculture/muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: split from MUI-F-0024 and MUI-F-0059 without the year and age, which only NPS pages state (age at arrival is also in conflict across sources, see MUI-F-0024 notes).

### MUI-F-0084 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1871 Emerson visited Muir in Yosemite.

**About:** category career, date 1871, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1871 May Emerson visits Muir in Yosemite Valley." (chronology, 1871 May) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>
- MUI-S-0023, Sierra Club (institutional): "1871 Undertakes intensive study of glaciation in the Sierra. Ralph Waldo Emerson visits him in Yosemite." (timeline, 1871) <https://vault.sierraclub.org/john_muir_exhibit/john_muir_day_study_guide/biographical_timeline.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004142-f53b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology); MUI-S-0023 found (https://vault.sierraclub.org/john\_muir\_exhibit/john\_muir\_day\_study\_guide/biographical\_timeline.aspx)

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: reworded from MUI-F-0034 ('met' is only in NPS pages) to the wording of the University of the Pacific chronology and the Sierra Club timeline.

### MUI-F-0085 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1899 John Muir was a member of the Harriman Alaska Expedition.

**About:** category career, date 1899

**Evidence** (open the link and find the quote):

- MUI-S-0018, National Park Service (institutional): "1899 Mt. Rainier National Park established; member of Harriman Alaska Expedition." (1899) <https://www.nps.gov/jomu/learn/education/education-john-muir-chronology.htm>
- MUI-S-0080, Smithsonian Institution (institutional): "Scientific members of the expedition included:" (Description) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>
- MUI-S-0080, Smithsonian Institution (institutional): "C. Hart Merriam (Chief, US Biological Survey); John Muir; Charles Palache (mineralogist, Harvard University)" (Description, member list) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>
- MUI-S-0080, Smithsonian Institution (institutional): "Harriman Alaska Expedition (1899)" (title) <https://siarchives.si.edu/collections/auth_exp_fbr_eace0018>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: reworded from MUI-F-0042 ('participated' is only in one NPS page) to 'member', which NPS and the Smithsonian Institution Archives each state.

### MUI-F-0086 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1903 Muir and Roosevelt were in Yosemite.

**About:** category career, date 1903, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "In 1903 Roosevelt and Muir visited the Yosemite region together." (John Muir paragraph) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0017, National Park Service (institutional): "1903: Hosted President Theodore Roosevelt in Yosemite." (Later Years and Legacy, 1903) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0087, University of the Pacific (institutional): "1903 May Three day trip with Pres. Roosevelt in Yosemite Park." (chronology, 1903 May) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: narrower form of MUI-F-0045 ('hosted' and 'Theodore' are not in every holder's quote).

### MUI-F-0087 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir's first trip to Alaska was in 1879.

**About:** category career, date 1879, place Alaska

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1879: Proposed to Louie Strentzel; made his first trip to Alaska with S. Hall Young and discovered Glacier Bay and Muir Glacier." (Early Career and Adventures, 1879) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0087, University of the Pacific (institutional): "1879 Jun-Jan 1880 First Alaska trip; Bulletin correspondent; itinerary includes Portland, Seattle, Victoria." (chronology, 1879 Jun-Jan 1880) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: reworded from MUI-F-0058 without 'made', which the University of the Pacific chronology lacks.

### MUI-F-0088 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1881 John Muir joined the Arctic expedition of the Corwin.

**About:** category career, date 1881, place Arctic

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1881 May-Oct Third Alaska trip as Bulletin correspondent. Joins Arctic expedition aboard USS Corwin to search for lost steamer Jeannette" (chronology, 1881 May-Oct) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>
- MUI-S-0030, Library of Congress (institutional): "The Corwin was a revenue cutter in the service of the United States Department of the Treasury that in 1881 was sent on a mission to the Arctic Ocean" (summary) <https://www.loc.gov/item/17031765/>
- MUI-S-0030, Library of Congress (institutional): "writer John Muir (1838-1914), already well-known for his exploration of the Sierra Nevada Mountains of California, joined the expedition together with two other scientists." (summary) <https://www.loc.gov/item/17031765/>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: narrower form of MUI-F-0063 without 'revenue cutter' and 'Ocean', which the University of the Pacific chronology lacks.

### MUI-F-0089 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Muir's The Cruise of the Corwin was published in 1917.

**About:** category work, date 1917

**Evidence** (open the link and find the quote):

- MUI-S-0030, Library of Congress (institutional): "The Cruise of the Corwin: Journal of the Arctic Expedition of 1881 in Search of De Long and the Jeannette, posthumously published in 1917, is Muir's account of the voyage" (summary) <https://www.loc.gov/item/17031765/>
- MUI-S-0024, Sierra Club (institutional): "1917 The Cruise of the Corwin is published" (1917) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-5.5 (run adv-20261010T184312-f672, 2026-10-10): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Recovery 2026-10-10: split from MUI-F-0064 without 'posthumously' and 'account of the voyage', which only the LoC record states.

### MUI-F-0090 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** An accident in 1867 nearly blinded John Muir.

**About:** category other, date 1867

**Evidence** (open the link and find the quote):

- MUI-S-0032, Library of Congress (institutional): "After an 1867 industrial accident nearly blinded him" (John Muir paragraph) <https://www.loc.gov/item/today-in-history/july-19/>
- MUI-S-0010, Wisconsin Historical Society (institutional): "An accident with a metal file in 1867 nearly blinded him, and the resulting weeks of sightlessness made Muir fully realize how important the beauties of Nature were to him." (article body) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0032 found (https://www.loc.gov/item/today-in-history/july-19/); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641)

**Checker's reasoning:** Both snapshots contain the quoted passages, and the Library of Congress page available through web search contains its quoted passage. The Wisconsin Historical Society live page was unreachable.

**Notes:** Recovery 2026-10-10: narrower form of MUI-F-0066 without 'industrial', which the Wisconsin Historical Society quote lacks.

### MUI-F-0091 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir was an inventor.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0086, National Park Service (institutional): "John Muir was a farmer, inventor, botanist, geologist, explorer, mountaineer, writer and pioneer of nature conservation." (exhibit announcement, paragraph on John Muir) <https://www.nps.gov/jomu/learn/news/new-featured-exhibit-in-her-words-a-glimpse-into-the-lives-of-the-muir-strentzel-women.htm>
- MUI-S-0001, Immigrant Hall of Honor (secondary): "Occupation: Naturalist, preservationist, writer, inventor" (JOHN MUIR (fact list at top of page)) <https://immigranthallofhonor.org/inductees/inductee-john-muir/>
- MUI-S-0010, Wisconsin Historical Society (institutional): "This object demonstrates that one of America's greatest naturalists was also a mechanically gifted inventor." (article body) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0066, Wisconsin Historical Society (institutional): "Sketch of John Muir's clock design." (description) <https://www.wisconsinhistory.org/record/image/W0133MG/john-muirs-clock-design>
- MUI-S-0066, Wisconsin Historical Society (institutional): "Agricultural implements Agriculture Botany Clocks and watches Inventions Science Technology Trees" (subjects) <https://www.wisconsinhistory.org/record/image/W0133MG/john-muirs-clock-design>
- MUI-S-0067, Wisconsin Historical Society (institutional): "Muir's illustration of a means to record time by use of a star." (description) <https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock>
- MUI-S-0067, Wisconsin Historical Society (institutional): "Astronomical instruments Inventions Science Technology" (subjects) <https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock>

**Extractor:** claude:claude-opus-5-5 (run muir-recover-2026-10-10, 2026-10-10) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run tour-links-2026-11-01, 2026-11-01): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0086 found (https://www.nps.gov/jomu/learn/news/new-featured-exhibit-in-her-words-a-glimpse-into-the-lives-of-the-muir-strentzel-women.htm); MUI-S-0001 found (https://immigranthallofhonor.org/inductees/inductee-john-muir/); MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641); MUI-S-0066 found (https://www.wisconsinhistory.org/record/image/W0133MG); MUI-S-0067 unreachable (https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock)

**Checker's reasoning:** No problem found with the claim; the live reachability limits for two sources are reported above.

**Notes:** Recovery 2026-10-10: reworded from MUI-F-0004 ('Occupation' is only on the IHH page). tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0066, the source of shipped tour record MUI-M-0034, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0066, the source of shipped tour record MUI-M-0034, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0067, the source of shipped tour record MUI-M-0035, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl. tour-links-2026-11-01 (2026-11-01): evidence from MUI-S-0067, the source of shipped tour record MUI-M-0035, attached because that record shows what this chapter fact states; adversary verdict cleared for re-judging. Audit copy: staging/facts.before-links-tour-links-2026-11-01.jsonl.

### MUI-F-0092 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1838, on April 21, John Muir was born in Dunbar, Scotland.

**About:** category birth, date 1838, place Dunbar, Scotland

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1838: April 21, John Muir born in Dunbar, Scotland." (timeline entry 1838) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0087, University of the Pacific (institutional): "1838 April 21 Born in Dunbar, Scotland to Daniel Muir & Ann Gilrye Muir." (chronology entry 1838) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 1 (Dunbar). Combines the date and place that MUI-F-0001 and MUI-F-0074 state separately, from two holders fetched by http.

### MUI-F-0097 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1849, in the company of his father, sister, and brother, ten-year-old John Muir left Scotland for the United States.

**About:** category immigration, date 1849, place Scotland

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "In 1849, in the company of his father, sister, and brother, ten-year-old John Muir left Scotland for the United States." (Section 8, continuation sheet (significance narrative)) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour travel leg 1 to 2. NHL nomination (primary). The same page's footnote says John turned eleven during the trip; sources differ on his age (see MUI-F-0024 notes). Ruling 2026-10-16 (owner rule: a primary record decides; CONFLICTS.md): age ten stands: born 21 April 1838 (MUI-F-0092), the Warren sailed 4 March 1849 and arrived 10 April 1849; the manifest's 11 and the NPS 'eleven' are not used.

### MUI-F-0098 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1849 the Muirs landed in New York City and went by boat to Albany and then across the Erie Canal to Buffalo.

**About:** category immigration, date 1849, place New York City

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "In 1849, in the company of his father, sister, and brother, ten-year-old John Muir left Scotland for the United States." (Section 8, continuation sheet) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>
- MUI-S-0089, National Park Service (primary): "The Muirs landed in New York City and went by boat to Albany and then across the Erie Canal to Buffalo." (Section 8, continuation sheet, next page) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour travel leg 1 to 2 (arrival and inland route). The year comes from the same narrative's opening sentence on the preceding page.

### MUI-F-0099 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** From Buffalo, Daniel Muir and his three children traveled across the Great Lakes to Milwaukee and then overland to Kingston.

**About:** category immigration, place Kingston

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "In Buffalo, conversations with a Scotsman and a local grain dealer convinced Daniel Muir to look for a site in the Marquette County region of Wisconsin. With his three children he traveled across the Great Lakes to Milwaukee and then overland to Kingston." (Section 8, continuation sheet) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour travel leg 1 to 2 (last part). John Muir was one of the three children (same source: Sarah and David were with John and their father).

### MUI-F-0100 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir lived continually at the Fountain Lake farm from 1849-1856.

**About:** category immigration, date 1849, place Fountain Lake farm

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "John Muir (1838-1914), a leading figure in the origin of an environmental ethic in the United States, traced the development of his own interest in wilderness preservation to the Fountain Lake farm where he lived continually from 1849-1856" (Section 8, Statement of Significance) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2 (Fountain Lake farm): date range.

### MUI-F-0101 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir lived periodically at the Fountain Lake farm from 1862-1864.

**About:** category other, date 1862, place Fountain Lake farm

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "John Muir (1838-1914), a leading figure in the origin of an environmental ethic in the United States, traced the development of his own interest in wilderness preservation to the Fountain Lake farm where he lived continually from 1849-1856 and periodically from 1862-1864." (Section 8, Statement of Significance) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2 (Fountain Lake farm): later stays.

### MUI-F-0102 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Daniel Muir, John Muir's father, named the farm Fountain Lake.

**About:** category family, place Fountain Lake

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "Daniel Muir, John's father, named the farm Fountain Lake." (Section 7, continuation sheet page 1) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2.

### MUI-F-0103 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The farmhouse on the Muir farm, made of white pine, was completed in October 1849.

**About:** category immigration, date 1849-10

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "Muir farm buildings. These included a log shanty, farmhouse, barn," (Section 7, continuation sheet page 1) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>
- MUI-S-0089, National Park Service (primary): "A more substantial farmhouse, made of white pine from the northern forest, was completed in October 1849" (Section 7, continuation sheet page 1) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2: the building. Basis for any reconstruction: log shanty of bur oak and white oak, white pine farmhouse on high ground, hand-hewn log barn with piled-straw roof (same page).

### MUI-F-0104 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In early November 1849 the rest of John Muir's family arrived from Scotland.

**About:** category immigration, date 1849-11

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "In early November 1849, after the planting and the construction of the principal farmhouse, the rest of the family arrived from Scotland." (Section 8, continuation sheet) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2.

### MUI-F-0105 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** At the Fountain Lake farm, Muir tried, for the first time, to preserve from human development a piece of land in its wild state.

**About:** category legacy, place Fountain Lake farm

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "In Wisconsin, Muir demonstrated his preservation ethos at the Fountain Lake farm where he tried, for the first time, to preserve from human development a piece of land in its wild state." (Section 8, Statement of Significance) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2.

### MUI-F-0106 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir identified the Fountain Lake farm as the birthplace of his interest in preserving wilderness for its own sake.

**About:** category legacy, place Fountain Lake farm

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "John Muir, however, identified the Fountain Lake farm as the birthplace of his interest in preserving wilderness for its own sake." (Section 8, continuation sheet) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2.

### MUI-F-0107 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir and his family moved to their second Wisconsin farm, Hickory Hill.

**About:** category family, place Hickory Hill

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "John Muir's significant association with Fountain Lake continued after he and his family moved to their second Wisconsin farm, Hickory Hill" (Section 8, Statement of Significance) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2 (Hickory Hill). The NHL excludes Hickory Hill from the landmark for the compromised integrity of its historic structures.

### MUI-F-0108 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir assumed more and more of the work at the new farm, Hickory Hill.

**About:** category family, place Hickory Hill

**Evidence** (open the link and find the quote):

- MUI-S-0089, National Park Service (primary): "Responsible for much of the clearing, John Muir assumed more and more of the work at the new farm, Hickory Hill" (Section 8, continuation sheet) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_text>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0089 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_text)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 2 (Hickory Hill).

### MUI-F-0111 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1860 Muir exhibited inventions at the State Fair in Madison.

**About:** category invention, date 1860, place Madison

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1860: Left home to exhibit his inventions at the State Agriculture Fair in Madison, Wisconsin" (timeline entry 1860) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0087, University of the Pacific (institutional): "1860 September Leaves home; exhibits inventions at State Agr. Fair, Madison, Wise." (chronology entry 1860) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 3 (Madison). Narrower than MUI-F-0026 so that both holders cover the whole claim.

### MUI-F-0119 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir's cabin was by Yosemite Creek.

**About:** category career, place Yosemite Creek

**Evidence** (open the link and find the quote):

- MUI-S-0094, University of the Pacific (institutional): "He made his own cabin by Yosemite Creek and guided hotel guests on hikes." (exhibit text) <https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/>
- MUI-S-0092, National Park Service (institutional): "During his time there, he built a cabin by Yosemite Creek to fall asleep to the sound of rushing water." (Yosemite paragraph) <https://www.nps.gov/jomu/learn/historyculture/john-muir-and-yosemite.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0094 unreachable (https://scholarlycommons.pacific.edu/exhibit/john-muir/muir-archives/yosemite-national-park-historic-houses-etc-john-muirs-cabin-in-yosemite-valley-1869/); MUI-S-0092 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-and-yosemite.htm)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 4: the building. NPS records a plaque only at the 'supposed site' of the cabin (NPGallery RL\_01365), so no exact location is claimed.

### MUI-F-0120 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1880, on April 14, John Muir married Louie Wanda Strentzel.

**About:** category family, date 1880

**Evidence** (open the link and find the quote):

- MUI-S-0017, National Park Service (institutional): "1880: April 14, married Louie Wanda Strentzel" (timeline entry 1880) <https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm>
- MUI-S-0087, University of the Pacific (institutional): "1880 April Marries Louie Wanda Strentzel, April 14." (chronology entry 1880) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0017 found (https://www.nps.gov/jomu/learn/historyculture/john-muir-timeline.htm); MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 6 (Martinez): start of the Martinez years.

### MUI-F-0122 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The John Muir House was built in 1882 by Dr. John Strentzel.

**About:** category other, date 1882

**Evidence** (open the link and find the quote):

- MUI-S-0047, Library of Congress (institutional): "Significance: The house was built in 1882 by Dr. John Theophile Strentzel, outstanding early horticulturist and physician." (notes\[1\] Significance) <https://www.loc.gov/item/ca0124/>
- MUI-S-0047, Library of Congress (institutional): "John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA" (title) <https://www.loc.gov/item/ca0124/>
- MUI-S-0091, National Park Service (institutional): "Dr. John Strentzel, John Muir’s father-in-law, built the John Muir House in 1882." (The Strentzel and Muir Home paragraph) <https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/); MUI-S-0091 found (https://www.nps.gov/jomu/learn/education/education-the-strentzel-and-muir-home.htm)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 6: the building.

### MUI-F-0123 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In 1890 the Muir family moves into the big house.

**About:** category family, date 1890

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1890 October Dr. John Strentzel dies; Muir family moves in to "Big House."" (chronology entry 1890) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>
- MUI-S-0090, National Park Service (institutional): "When Dr. Strentzel passed away in 1890, Mrs. Strentzel invited the Muir family to move into the "big house" with her." (Visit paragraph) <https://www.nps.gov/jomu/planyourvisit/the-historic-home-of-john-muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology); MUI-S-0090 found (https://www.nps.gov/jomu/planyourvisit/the-historic-home-of-john-muir.htm)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 6: start date for the house.

### MUI-F-0141 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Muir's first visit to Yosemite was in 1868.

**About:** category career, date 1868, place Yosemite

**Evidence** (open the link and find the quote):

- MUI-S-0087, University of the Pacific (institutional): "1868 Apr-Jun First visit to Yosemite via Pacheco Pass, Snelling and Crane Flat." (chronology entry 1868) <https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology>
- MUI-S-0020, National Park Service (institutional): "Muir first visited Yosemite in 1868." (biography paragraph) <https://www.nps.gov/yose/learn/historyculture/muir.htm>

**Extractor:** claude:claude-opus-5-5 (run muir-tour-repair2-2026-10-15, 2026-10-15) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T004816-b80b, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0087 found (https://www.pacific.edu/university-libraries/find/holt-atherton-special-collections/john-muir-personal-life-chronology); MUI-S-0020 found (https://www.nps.gov/yose/learn/historyculture/muir.htm)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 4 (Yosemite). Same statement as MUI-F-0032 with the Pacific and NPS quotes that each cover it. Restaged from withdrawn MUI-F-0116 without the Sierra Club quote (unreachable live; that chronology says the same).

### MUI-F-0142 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Mr. John Muir of Martinez was President of the California Branch of the Society for the Preservation of National Parks.

**About:** category legacy, date 1913-06-27

**Evidence** (open the link and find the quote):

- MUI-S-0102, U.S. National Archives and Records Administration (primary): "SOCIETY FOR THE PRESERVATION OF NATIONAL PARKS CALIFORNIA BRANCH" (transcription of objectId 15887152 (Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg, letterhead and page 1)) <https://catalog.archives.gov/id/7268060>
- MUI-S-0102, U.S. National Archives and Records Administration (primary): "Mr. John Muir, President, Martinez" (transcription of objectId 15887152 (Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg, letterhead and page 1)) <https://catalog.archives.gov/id/7268060>
- MUI-S-0102, U.S. National Archives and Records Administration (primary): "San Francisco, June 27, 1913" (transcription of objectId 15887152 (Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg, letterhead and page 1)) <https://catalog.archives.gov/id/7268060>

**Extractor:** claude:claude-opus-5-5 (run muir-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T170152-278c, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0102 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/7268060)

**Checker's reasoning:** The dated letterhead identifies John Muir of Martinez as president of the California Branch. Live transcription and catalog endpoints were unreachable; web search returned no results.

**Notes:** Artifacts research 2026-10-20: letterhead of the Society's letter of June 27, 1913 (NAID 7268060).

### MUI-F-0143 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** In behalf of all of the people of the nation we ask your aid in putting an end to these assaults on our great national parks

**About:** category quote, date 1913-06-27, the inductee's own words

**Evidence** (open the link and find the quote):

- MUI-S-0102, U.S. National Archives and Records Administration (primary): "In behalf of all of the people of the nation we ask your aid in putting an end to these assaults on our great national parks" (transcription of objectId 15887153 (Society\_for\_the\_Preservation\_of\_National\_Parks\_002.jpg, page 2)) <https://catalog.archives.gov/id/7268060>
- MUI-S-0102, U.S. National Archives and Records Administration (primary): "San Francisco, June 27, 1913" (transcription of objectId 15887152 (Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg, letterhead and page 1)) <https://catalog.archives.gov/id/7268060>

**Extractor:** claude:claude-opus-5-5 (run muir-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T170152-278c, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0102 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/7268060)

**Checker's reasoning:** The quotation appears in the dated petition, which presents Muir as one of four signatories. Live transcription and catalog endpoints were unreachable; web search returned no results.

**Notes:** Artifacts research 2026-10-20: closing paragraph of the Society for the Preservation of National Parks letter of June 27, 1913 to Hon. George E. Chamberlain, signed John Muir, E. T. Parsons, Wm F. Bade and R. V. Colby (a joint letter, not Muir's words alone; the site must attribute it to the letter).

### MUI-F-0144 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** So important a bill should not be rushed through Congress without mature consideration and time allowed for its opponents to be heard.

**About:** category quote, date 1913-06-27, the inductee's own words

**Evidence** (open the link and find the quote):

- MUI-S-0102, U.S. National Archives and Records Administration (primary): "So important a bill should not be rushed through Congress without mature consideration and time allowed for its opponents to be heard." (transcription of objectId 15887153 (Society\_for\_the\_Preservation\_of\_National\_Parks\_002.jpg, page 2)) <https://catalog.archives.gov/id/7268060>
- MUI-S-0102, U.S. National Archives and Records Administration (primary): "San Francisco, June 27, 1913" (transcription of objectId 15887152 (Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg, letterhead and page 1)) <https://catalog.archives.gov/id/7268060>

**Extractor:** claude:claude-opus-5-5 (run muir-artifacts-2026-10-20, 2026-10-20) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T170152-278c, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0102 unreachable (https://catalog.archives.gov/proxy/contributions/targetNaId/7268060)

**Checker's reasoning:** The quotation appears in the dated petition, which presents Muir as one of four signatories. Live transcription and catalog endpoints were unreachable; web search returned no results.

**Notes:** Artifacts research 2026-10-20: same joint letter of June 27, 1913 (signed John Muir, E. T. Parsons, Wm F. Bade, R. V. Colby).

### MUI-F-0145 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** John Muir's birthplace is 126 and 128 High Street, Dunbar.

**About:** category birth, place 126 and 128 High Street, Dunbar

**Evidence** (open the link and find the quote):

- MUI-S-0122, Historic Environment Scotland (institutional): "126 AND 128 HIGH STREET (LB24825)" (record title) <https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB24825>
- MUI-S-0122, Historic Environment Scotland (institutional): "Burgh Dunbar" (Burgh field) <https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB24825>
- MUI-S-0122, Historic Environment Scotland (institutional): "Birthplace of naturalist John Muir (1838-1914)." (Statement of Special Interest) <https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB24825>
- MUI-S-0024, Sierra Club (institutional): "John and his family move from Muir's birthplace at 126/128 High St., Dunbar" (chronology, 1839 (snapshot on file)) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>
- MUI-S-0024, Sierra Club (institutional): "The John Muir Birthplace on High Street, Dunbar, Scotland" (chronology, August 9 entry (snapshot on file)) <https://vault.sierraclub.org/john_muir_exhibit/life/chronology.aspx>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T023301-6068, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0122 found (https://portal.historicenvironment.scot/apex/f?p=1505:300:::::VIEWTYPE,VIEWREF:designation,LB24825); MUI-S-0024 found (https://vault.sierraclub.org/john\_muir\_exhibit/life/chronology.aspx)

**Checker's reasoning:** no problem found

**Notes:** Ratio-lift RL-F-008. HES writes "126 AND 128 HIGH STREET", Sierra Club "126/128 High St." and "on High Street": each quoted verbatim (task 14b ruling); the claim uses only words both pages carry. Corroborates the address of MUI-F-0095. Chapter muir/birth (Dunbar).

### MUI-F-0146 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Theodore Roosevelt and John Muir were on Glacier Point, Yosemite Valley, California, in 1903.

**About:** category career, date 1903, place Glacier Point, Yosemite Valley, California

**Evidence** (open the link and find the quote):

- MUI-S-0132, Library of Congress (primary): "\[Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903\]" (item.title) <https://www.loc.gov/item/93503130/>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0132 found (https://www.loc.gov/item/93503130/)

**Checker's reasoning:** no problem found

**Notes:** Ratio-lift research (RL-S-LOC-93503130 record title; LoC record dates the photograph c1906 \[photo taken 1903\]). Chapter muir/history (Glacier Point room).

### MUI-F-0148 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** The President and Muir walked over to Glacier Point.

**About:** category career, place Glacier Point

**Evidence** (open the link and find the quote):

- MUI-S-0123, Library of Congress (primary): "then he and Muir walked over to Glacier Point." (page 2 (OCR full text)) <https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=2>
- MUI-S-0123, Library of Congress (primary): "From the supernal heights of Glacier Point, nearly a mile above the floor of Yosemite, the President saw the wonders" (page 2, same dispatch) <https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=2>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0123 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_etna\_ver01/data/00100480402/1903051801/0348.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot contains both passages and identifies the President as Muir's walking companion. The live source could not be reached.

**Notes:** Ratio-lift RL-F-009, first half (split into two atomic facts as the research note required). OCR breaks "remained" in the next sentence, so the hour is left out. event\_date left empty (the quoted text gives no date). Chapter muir/history.

### MUI-F-0149 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Four photographs were made of the President on the overhanging rock by his personal photographer; in two of these he is alone and in the others he is with Muir.

**About:** category career

**Evidence** (open the link and find the quote):

- MUI-S-0123, Library of Congress (primary): "Four photographs were made of the President on the overhanging rock by his personal photographer. In two of these he is alone and in the others he is stand ing with Muir." (page 2 (OCR full text)) <https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=2>

**Extractor:** claude:claude-opus-5-5 (run ratio-lift-2026-10-24, 2026-10-24) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0123 unreachable (https://tile.loc.gov/text-services/word-coordinates-service?segment=/service/ndnp/curiv/batch\_curiv\_etna\_ver01/data/00100480402/1903051801/0348.xml&format=alto\_xml&full\_text=1)

**Checker's reasoning:** The snapshot explicitly describes the single photography event, including the photographer, location, total count and grouping. The live source could not be reached.

**Notes:** Ratio-lift RL-F-009, second half. Chapter muir/history.

### MUI-F-0153 (verified)

- [ ] approve
- [ ] edit, new wording: 
- [ ] reject
- [ ] note: 

**Claim:** Muir had a dormitory room in North Hall.

**About:** category education, place North Hall

**Evidence** (open the link and find the quote):

- MUI-S-0010, Wisconsin Historical Society (institutional): "Muir turned his North Hall dormitory room into a campus attraction by filling it with all manner of practical and semi-practical machines." (article, paragraph after the State Fair paragraph) <https://legacy.wisconsinhistory.org/Records/Article/CS2641>
- MUI-S-0134, University of Wisconsin–Madison News (secondary): "a plaque will be dedicated on Thursday, June 20 within sight of Muir’s dormitory room in North Hall." (article, first paragraph) <https://news.wisc.edu/ceremony-to-honor-john-muir-legendary-preservationist/>

**Extractor:** claude:claude-opus-5-5 (run round9-2026-10-29, 2026-10-29) judged it supported, citing the quotes above.

**Independent checker:** codex:gpt-6-sol (run adv-round9-muir-2026-10-29c, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0010 unreachable (https://legacy.wisconsinhistory.org/Records/Article/CS2641); MUI-S-0134 found (https://news.wisc.edu/ceremony-to-honor-john-muir-legendary-preservationist/)

**Checker's reasoning:** No problem found; the Wisconsin Historical Society live page was unreachable.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): news.wisc.edu: University of Wisconsin–Madison News, institutional

**Notes:** Round 9 (owner feedback item 6, 2026-10-29): the North Hall tie in the words two holders share, each with an http snapshot: Wisconsin Historical Society article CS2641 (institutional) and UW–Madison News (secondary). Replaces MUI-F-0150 for the site, which stays disputed only because the Sierra Club vault (browser snapshot) was unreachable to the adversary (G10).

## 5. Pending: not checked yet, or a check failed (0)

None.

## 6. Verified and already approved or edited (0)

None.

## 7. Media (101)

### MUI-M-0001 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://www.loc.gov/item/2014686853/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication. For more information, see George Grantham Bain Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/274\_bain.html" <https://www.loc.gov/rr/print/res/274_bain.html>

**Credit:** Library of Congress, Prints & Photographs Division, LC-DIG-ggbain-06861

**Alt text** (published as the image description): John Muir. 1 negative : glass. Bain News Service, publisher. Title from unverified data provided by the Bain News Service on the negatives or caption cards.

**Sources:** MUI-S-0034

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication. For more information, see George Granth...'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0002 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, seated, reading a book (image) <https://www.loc.gov/item/2008679854/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2008679854/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-18943

**Alt text** (published as the image description): John Muir, seated, reading a book. 1 photographic print by Underwood & Underwood, photographer.

**Sources:** MUI-S-0035

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0003 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, 1838-1914 (image) <https://www.loc.gov/item/2004673176/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2004673176/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-55012

**Alt text** (published as the image description): John Muir, 1838-1914. Bust, facing right. 1 photographic print; photo copyrighted by Underwood & Underwood.

**Sources:** MUI-S-0036

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0004 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, 1838-1914 (image) <https://www.loc.gov/item/2003663747/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2003663747/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-72110

**Alt text** (published as the image description): John Muir, 1838-1914. 3/4 length, standing, facing left. 1 photographic print copyrighted by Underwood & Underwood.

**Sources:** MUI-S-0037

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0005 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, 1838-1914 (image) <https://www.loc.gov/item/2004672064/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2004672064/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-18938

**Alt text** (published as the image description): John Muir, 1838-1914. Portrait, one half figure, seated, facing right. 1 photographic print; copyright by Edward Hughes.

**Sources:** MUI-S-0038

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0006 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir and John Burroughs, full-length portrait, standing on snow (image) <https://www.loc.gov/item/95514642/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-36760

**Alt text** (published as the image description): John Muir and John Burroughs, full-length portrait, standing on snow. 1 photographic print; photo by Edward S. Curtis.

**Sources:** MUI-S-0039

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0039 unreachable (https://www.loc.gov/item/95514642/)

**Checker's reasoning:** No rights\_statement is supplied or quoted in the snapshot, so the required rights-quotation gate fails; unknown is an appropriate license\_class. The snapshot supports the title, description and credit, but the live record could not be loaded through web or shell.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot

**Notes:** The Library's item record carries no rights\_advisory or rights\_information field; no holder rights statement, so rights\_statement and rights\_url are null and license\_class unknown.

### MUI-M-0007 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir, three-quarter length portrait, seated, facing front (image) <https://www.loc.gov/item/93505505/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-107697

**Alt text** (published as the image description): John Muir, three-quarter length portrait, seated, facing front. 1 photographic print; copyright by B. Greene, Pasadena, California.

**Sources:** MUI-S-0040

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0040 unreachable (https://www.loc.gov/item/93505505/)

**Checker's reasoning:** No rights\_statement is supplied, so no rights quotation can be verified in the snapshot. The unknown license class is permissible, and the snapshot supports the title, description and credit; live access failed.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot

**Notes:** The Library's item record carries no rights\_advisory or rights\_information field; no holder rights statement, so rights\_statement and rights\_url are null and license\_class unknown.

### MUI-M-0008 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Burroughs, on his 75th birthday, and John Muir, half-length, standing (image) <https://www.loc.gov/item/91784654/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-103951

**Alt text** (published as the image description): John Burroughs, on his 75th birthday, and John Muir, half-length, standing. 1 photographic print; copyright by Underwood & Underwood, New York, N.Y.

**Sources:** MUI-S-0041

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0041 not found (https://www.loc.gov/item/91784654/)

**Checker's reasoning:** No rights\_statement is supplied, so no rights quotation can be verified in the snapshot or live record. The unknown license class is permissible, and the holder supports the title, description, credit, and John Muir identification.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G10: MUI-S-0041: adversary did not find the quote in the live source (not found)

**Notes:** The Library's item record carries no rights\_advisory or rights\_information field; no holder rights statement, so rights\_statement and rights\_url are null and license\_class unknown.

### MUI-M-0009 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir walking in the desert (image) <https://www.loc.gov/item/2022637958/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions ...," https://hdl.loc.gov/loc.pnp/res.195.copr" <https://hdl.loc.gov/loc.pnp/res.195.copr>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-25977

**Alt text** (published as the image description): John Muir walking in the desert. 1 photograph by Helen Lukens Jones.

**Sources:** MUI-S-0042

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: it does not state public domain or a licence, so unknown.

### MUI-M-0010 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir and John Burroughs, full-length portrait, possibly at the Grand Canyon (image) <https://www.loc.gov/item/95514643/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-25975

**Alt text** (published as the image description): John Muir and John Burroughs, full-length portrait, possibly at the Grand Canyon. 1 photographic print; copyright by Fred Harvey.

**Sources:** MUI-S-0043

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0043 not found (https://www.loc.gov/item/95514643/)

**Checker's reasoning:** No rights\_statement was supplied, so no rights quotation can be verified in the snapshot or live record. The unknown license classification is permissible, and the holder supports the title, description and credit, but the required quotation gate fails.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G10: MUI-S-0043: adversary did not find the quote in the live source (not found)

**Notes:** The Library's item record carries no rights\_advisory or rights\_information field; no holder rights statement, so rights\_statement and rights\_url are null and license\_class unknown.

### MUI-M-0011 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, half-length portrait, facing left (image) <https://www.loc.gov/item/2002719850/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2002719850/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZC4-1576

**Alt text** (published as the image description): John Muir, half-length portrait, facing left. 1 photographic print; photoprint by J. Edward Greene, Pasadena, California.

**Sources:** MUI-S-0044

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0012 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir, full-length portrait, facing left, lying on rock with trees in background (image) <https://www.loc.gov/item/95514641/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-72111

**Alt text** (published as the image description): John Muir, full-length portrait, facing left, lying on rock with trees in background. 1 photographic print; copyright 1902 by Helen Lukens Jones.

**Sources:** MUI-S-0045

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0045 unreachable (https://www.loc.gov/item/95514641/)

**Checker's reasoning:** No rights\_statement is supplied or quoted in the snapshot, so the required quote gate fails; unknown is an allowed classification without a rights statement. The snapshot supports the title, alt text and credit, but the live record could not be read.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot

**Notes:** The Library's item record carries no rights\_advisory or rights\_information field; no holder rights statement, so rights\_statement and rights\_url are null and license\_class unknown.

### MUI-M-0013 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903 (image) <https://www.loc.gov/item/93503130/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/93503130/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-DIG-ppmsca-36413

**Alt text** (published as the image description): Theodore Roosevelt and John Muir on Glacier Point, Yosemite Valley, California, in 1903. Stereograph copyright claimant Underwood & Underwood.

**Sources:** MUI-S-0031

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0014 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir, full-length portrait, facing right, seated on rock with lake and trees in background (image) <https://www.loc.gov/item/95514008/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/95514008/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZ62-52000

**Alt text** (published as the image description): John Muir, full-length portrait, facing right, seated on rock with lake and trees in background. 1 photographic print; copyright 1902 by Helen Lukens Jones.

**Sources:** MUI-S-0046

**Independent checker:** codex:gpt-5.5 (run adv-20261009T182142-2b7c, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: 'No known restrictions on publication' is not a statement that the item is in the public domain, so unknown until a person decides the policy. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on publication.'. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification.

### MUI-M-0015 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://www.loc.gov/item/ca0124/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/rr/print/res/114_habs.html>

**Credit:** Library of Congress, Prints & Photographs Division, HABS CAL,7-MART,1-

**Alt text** (published as the image description): John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA. Historic American Buildings Survey documentation.

**Sources:** MUI-S-0047

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: it does not state public domain or a licence, so unknown. Owner decision 2026-10-18 checked: this is the record-page item, whose record also bundles recopies (photos 1-2); it stays unknown. The government-made photos 3-14 and drawings are the separate items MUI-M-0047..0054.

**Review so far:** pending; note: 2026-10-29 project owner: This record-page item stays licence class unknown (it bundles the recopies); its government-made items are read per item. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0016 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir National Historic Site, 4202 Alhambra Avenue, Martinez, Contra Costa County, CA (image) <https://www.loc.gov/item/ca4264/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/rr/print/res/114_habs.html>

**Credit:** Library of Congress, Prints & Photographs Division, HALS CA-132

**Alt text** (published as the image description): John Muir National Historic Site, 4202 Alhambra Avenue, Martinez, Contra Costa County, CA. Historic American Landscapes Survey documentation.

**Sources:** MUI-S-0048

**Independent checker:** codex:gpt-5.5 (run adv-20261009T201503-4fd2, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: it does not state public domain or a licence, so unknown. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-09: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Landscapes Survey (Library of Congress)'). Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09) cleared for re-verification. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-09: license\_class set back to unknown: the rule now bars the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...' and withdraws its own earlier public-domain grant. Edit lock (2026-10-09): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-5.5 (run adv-20261009T200729-f9c7, 2026-10-09) cleared for re-verification.

### MUI-M-0017 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** For John Muir (image) <https://www.loc.gov/item/2004675125/>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Rights status not evaluated. For general information see "Copyright and Other Restrictions..." (http://lcweb.loc.gov/rr/print/195\_copr.html)" <https://www.loc.gov/item/2004675125/>

**Credit:** Library of Congress, Prints & Photographs Division, LC-USZC4-12267

**Alt text** (published as the image description): For John Muir, a print by Frank Moore. Print showing creatures forming a chain, including a bear, a man, a cheetah, a turtle, a bat, and a snake.

**Sources:** MUI-S-0049

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class strictly from the holder statement: it does not state public domain or a licence, so unknown.

### MUI-M-0018 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Muir and Redwood (image) <https://npgallery.nps.gov/AssetDetail/C27BB4C5-155D-4519-3EEA3C99AE8DC703>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain:Full Granting Rights" <https://npgallery.nps.gov/AssetDetail/C27BB4C5-155D-4519-3EEA3C99AE8DC703>

**Credit:** National Park Service

**Alt text** (published as the image description): John Muir at Muir Woods National Monument

**Sources:** MUI-S-0050

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class from the holder's NPGallery field Constraints Information 'Public domain:Full Granting Rights'.

### MUI-M-0019 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir Teaching (image) <https://npgallery.nps.gov/AssetDetail/90D45AFD-C6B9-A6D4-FB033CEB897299A5>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain:Full Granting Rights" <https://npgallery.nps.gov/AssetDetail/90D45AFD-C6B9-A6D4-FB033CEB897299A5>

**Credit:** National Park Service, GGNRA, Park Archives, GOGA 32470-0347

**Alt text** (published as the image description): John Muir in the front left, teaching a group in Muir Woods.

**Sources:** MUI-S-0051

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class from the holder's NPGallery field Constraints Information 'Public domain:Full Granting Rights'.

### MUI-M-0020 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Self Portrait of John Muir (image) <https://npgallery.nps.gov/AssetDetail/90D2F38E-E5CB-F9DD-9DAC6877E2337352>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain:Full Granting Rights" <https://npgallery.nps.gov/AssetDetail/90D2F38E-E5CB-F9DD-9DAC6877E2337352>

**Credit:** National Park Service, GGNRA, Park Archives, GOGA 32470.0345

**Alt text** (published as the image description): Self Portrait of John Muir in a letter to Miss Janet Douglass Moores, February 23, 1887

**Sources:** MUI-S-0052

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class from the holder's NPGallery field Constraints Information 'Public domain:Full Granting Rights'.

### MUI-M-0021 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://npgallery.nps.gov/AssetDetail/90CB7734-CFBC-89D6-0D2B98943D4C0C16>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain:Full Granting Rights" <https://npgallery.nps.gov/AssetDetail/90CB7734-CFBC-89D6-0D2B98943D4C0C16>

**Credit:** National Park Service, GGNRA, Park Archives, GOGA 32470-0292

**Alt text** (published as the image description): Photo of John Muir, date unknown

**Sources:** MUI-S-0053

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** license\_class from the holder's NPGallery field Constraints Information 'Public domain:Full Granting Rights'.

### MUI-M-0022 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir probably at Hetch Hetchy, California (image) <https://scholarlycommons.pacific.edu/jmp/121/>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "In Copyright. URI: http://rightsstatements.org/vocab/InC/1.0/" <https://scholarlycommons.pacific.edu/jmp/121/>

**Credit:** Holt-Atherton Special Collections, University of the Pacific Library

**Alt text** (published as the image description): John Muir probably at Hetch Hetchy, California. Photograph in the John Muir Papers MSS 048, Holt-Atherton Special Collections, University of the Pacific Library.

**Sources:** MUI-S-0054

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Holder page states In Copyright (rightsstatements.org InC 1.0): link, do not embed. Commons file page claims public domain (uploader claim, not used).

### MUI-M-0023 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir with Sierra Club group on trail to Hetch Hetchy, California (image) <https://scholarlycommons.pacific.edu/jmp/67/>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "In Copyright. URI: http://rightsstatements.org/vocab/InC/1.0/" <https://scholarlycommons.pacific.edu/jmp/67/>

**Credit:** Holt-Atherton Special Collections, University of the Pacific Library

**Alt text** (published as the image description): John Muir with Sierra Club group on trail to Hetch Hetchy, California. Photograph in the John Muir Papers MSS 048, Holt-Atherton Special Collections, University of the Pacific Library.

**Sources:** MUI-S-0055

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Holder page states In Copyright (rightsstatements.org InC 1.0): link, do not embed. Commons file page claims public domain (uploader claim, not used).

### MUI-M-0024 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://catalog.archives.gov/id/219777099>

**Licence:** unknown; link only, never embedded

**Rights statement:** "This image may be subject to copyright or other intellectual property restrictions." <https://catalog.archives.gov/id/219777099>

**Credit:** National Archives and Records Administration, Records of the National Park Service, The Stephen T. Mather Collection of Photographs, 79-SM-763-10

**Alt text** (published as the image description): John Muir. Original Caption: Muir, John, 1838-1914. Photograph in The Stephen T. Mather Collection of Photographs.

**Sources:** MUI-S-0056

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA use restriction status 'Restricted - Possibly' (Copyright); no digital object online; license\_class unknown.

### MUI-M-0025 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://catalog.archives.gov/id/219777100>

**Licence:** unknown; link only, never embedded

**Rights statement:** "This image may be subject to copyright or other intellectual property restrictions." <https://catalog.archives.gov/id/219777100>

**Credit:** National Archives and Records Administration, Records of the National Park Service, The Stephen T. Mather Collection of Photographs, 79-SM-763-9

**Alt text** (published as the image description): John Muir. Original Caption: Muir, John, 1838-1914. Photograph in The Stephen T. Mather Collection of Photographs.

**Sources:** MUI-S-0057

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA use restriction status 'Restricted - Possibly' (Copyright); no digital object online; license\_class unknown.

### MUI-M-0026 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://catalog.archives.gov/id/219777101>

**Licence:** unknown; link only, never embedded

**Rights statement:** "This image may be subject to copyright or other intellectual property restrictions." <https://catalog.archives.gov/id/219777101>

**Credit:** National Archives and Records Administration, Records of the National Park Service, The Stephen T. Mather Collection of Photographs, 79-SM-763-8

**Alt text** (published as the image description): John Muir. Original Caption: Muir, John, 1838-1914. Photograph in The Stephen T. Mather Collection of Photographs.

**Sources:** MUI-S-0058

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NARA use restriction status 'Restricted - Possibly' (Copyright); no digital object online; license\_class unknown.

### MUI-M-0027 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir and climbing party at summit of Mount Rainier, 1888 (image) <https://commons.wikimedia.org/wiki/File:John_Muir_and_climbing_party_at_summit_of_Mount_Rainier,_1888_(WARNER_595).jpeg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Arthur Churchill Warner Photographs Collection

**Alt text** (published as the image description): Taken during the 1888 Mt. Rainier climbing expedition led by John Muir.

**Sources:** MUI-S-0059

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information yes; atomic yes; source type right no.

**Live check per source:** MUI-S-0059 not found (https://commons.wikimedia.org/wiki/File:John\_Muir\_and\_climbing\_party\_at\_summit\_of\_Mount\_Rainier,\_1888\_(WARNER\_595).jpeg)

**Checker's reasoning:** No rights\_statement is supplied, so none is present to verify; unknown is permissible, but the collection credit adds information beyond the absent statement. The named source provides uploader-asserted Commons rights templates rather than the holder’s own rights statement.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G4: adversary found the claim adds information; G4: adversary did not accept the source type; G10: MUI-S-0059: adversary did not find the quote in the live source (not found)

**Notes:** Commons-only: its 'Public domain' licence is the uploader's claim; no holder item page snapshotted, so rights\_statement and rights\_url are null and license\_class unknown (link only).

### MUI-M-0028 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Burroughs and John Muir, probably on St. Matthew Island, Alaska, July 1899. (image) <https://commons.wikimedia.org/wiki/File:John_Burroughs_and_John_Muir,_probably_on_St_Matthew_Island,_Alaska,_July_1899_(HARRIMAN_218).jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Harriman Alaska Expedition Collection

**Alt text** (published as the image description): From album entitled: A Souvenir of the Harriman Alaska Expedition, May - August, 1899. Volume II, Cook Inlet to Bering Strait and the Return Voyage, leaf 186.

**Sources:** MUI-S-0060

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information yes; atomic yes; source type right no.

**Live check per source:** MUI-S-0060 not found (https://commons.wikimedia.org/wiki/File:John\_Burroughs\_and\_John\_Muir,\_probably\_on\_St\_Matthew\_Island,\_Alaska,\_July\_1899\_(HARRIMAN\_218).jpg)

**Checker's reasoning:** No rights\_statement is supplied, so no rights quotation can be verified; unknown is an allowed classification. The credit adds information beyond the absent statement, and Commons supplies unconfirmed rights templates rather than the holder’s own rights statement.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G4: adversary found the claim adds information; G4: adversary did not accept the source type; G10: MUI-S-0060: adversary did not find the quote in the live source (not found)

**Notes:** Commons-only: its 'Public domain' licence is the uploader's claim; no holder item page snapshotted, so rights\_statement and rights\_url are null and license\_class unknown (link only).

### MUI-M-0029 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir 1964 Issue-5c (image) <https://commons.wikimedia.org/wiki/File:John_Muir_1964_Issue-5c.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** US Post Office

**Alt text** (published as the image description): John Muir 1964 Issue-5c, US Post Office.

**Sources:** MUI-S-0061

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information yes; atomic yes; source type right no.

**Live check per source:** MUI-S-0061 not found (https://commons.wikimedia.org/wiki/File:John\_Muir\_1964\_Issue-5c.jpg)

**Checker's reasoning:** No rights\_statement is supplied, so no rights quotation can be verified; unknown is an allowed classification. The US Post Office credit exceeds the absent statement, and the live page supplies uploader-entered attribution and unconfirmed Commons rights templates rather than a holder's own statement.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G4: adversary found the claim adds information; G4: adversary did not accept the source type; G10: MUI-S-0061: adversary did not find the quote in the live source (not found)

**Notes:** Commons-only: its 'Public domain' licence is the uploader's claim; no holder item page snapshotted, so rights\_statement and rights\_url are null and license\_class unknown (link only).

### MUI-M-0030 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Muir & family c1888 (image) <https://commons.wikimedia.org/wiki/File:Muir_%26_family_c1888.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Holt-Atherton Special Collections, University of the Pacific Library

**Alt text** (published as the image description): John Muir with wife (Louisa Wanda Strentzel) and children Wanda & Helen

**Sources:** MUI-S-0062

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source no; entailed yes; adds information yes; atomic yes; source type right no.

**Live check per source:** MUI-S-0062 not found (https://commons.wikimedia.org/wiki/File:Muir\_%26\_family\_c1888.jpg)

**Checker's reasoning:** No rights\_statement was supplied, so no matching statement exists in the snapshot or live page; unknown is permissible. The Commons rights template and descriptive metadata are uploader assertions, leaving the institutional credit, date and family identifications unconfirmed by the holder.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G4: adversary found the claim adds information; G4: adversary did not accept the source type; G10: MUI-S-0062: adversary did not find the quote in the live source (not found)

**Notes:** Commons-only: its 'Public domain' licence is the uploader's claim; no holder item page snapshotted, so rights\_statement and rights\_url are null and license\_class unknown (link only).

### MUI-M-0031 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir at Merced River (image) <https://commons.wikimedia.org/wiki/File:John_Muir_at_Merced_River.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** Unknown author; via Wikimedia Commons

**Alt text** (published as the image description): John Muir at the Merced River

**Sources:** MUI-S-0063

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict refuted; quote in snapshot no; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right no.

**Live check per source:** MUI-S-0063 unreachable (https://commons.wikimedia.org/wiki/File:John\_Muir\_at\_Merced\_River.jpg)

**Checker's reasoning:** No rights\_statement is supplied, so no rights quotation appears in the snapshot; unknown is an allowed classification. The snapshot provides Commons metadata and an unconfirmed public-domain tag, not the underlying holder’s own rights statement, and the live item could not be read.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not confirm the quote is in the snapshot; G4: adversary did not accept the source type

**Notes:** Commons-only: its 'Public domain' licence is the uploader's claim; no holder item page snapshotted, so rights\_statement and rights\_url are null and license\_class unknown (link only).

### MUI-M-0032 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Alarm Clock & Study Desk (image) <https://www.wisconsinhistory.org/record/image/W011QE3/alarm-clock-study-desk>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "This image is © copyrighted property of Wisconsin State Journal and is provided by the Wisconsin Historical Society subject to contract. Use of the image requires written permission from the staff of the Collections Division. It may not be sold or redistributed, copied or distributed as a photograph, electronic file, or any other media. The image should not be significantly altered through conventional or electronic means. Images altered beyond standard cropping and resizing require further negotiation with a staff member. Please Credit: Wisconsin Historical Society" <https://www.wisconsinhistory.org/record/image/W011QE3/alarm-clock-study-desk>

**Credit:** Wisconsin Historical Society

**Alt text** (published as the image description): Photograph, January 10, 1945, by Arthur M. Vinje of the carved wooden combination alarm clock & study desk made by John Muir about 1862, on display in the Wisconsin Historical Society museum.

**Sources:** MUI-S-0064

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0064 found (https://www.wisconsinhistory.org/record/image/W011QE3/alarm-clock-study-desk)

**Checker's reasoning:** no problem found

**Notes:** Holder page Copyright Status IN COPYRIGHT; rights holder Wisconsin State Journal; Wisconsin Historical Society. Link only.

### MUI-M-0033 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir's Desk Clock (image) <https://www.wisconsinhistory.org/record/image/W013K4Q/john-muirs-desk-clock>

**Licence:** unknown; link only, never embedded

**Rights statement:** "COPYRIGHT NOT EVALUATED" <https://www.wisconsinhistory.org/record/image/W013K4Q/john-muirs-desk-clock>

**Credit:** Wisconsin Historical Society, Muir, John, 1838-1914, John Muir's Desk Clock, W013K4Q

**Alt text** (published as the image description): Drawing by John Muir of his invention, the student desk clock, scale 3 inches per foot.

**Sources:** MUI-S-0065

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0065 found (https://www.wisconsinhistory.org/record/image/W013K4Q/john-muirs-desk-clock)

**Checker's reasoning:** no problem found

**Notes:** Holder Copyright Status field. Credit follows the holder's credit-line pattern: Wisconsin Historical Society, Creator, Title, Unique Identifier.

### MUI-M-0034 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir's Clock Design (image) <https://www.wisconsinhistory.org/record/image/W0133MG/john-muirs-clock-design>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "NO COPYRIGHT - UNITED STATES" <https://www.wisconsinhistory.org/record/image/W0133MG/john-muirs-clock-design>

**Credit:** Wisconsin Historical Society, Muir, John, 1838-1914, John Muir's Clock Design, W0133MG

**Alt text** (published as the image description): Sketch of John Muir's clock design, 1863. The built clock was a combination of scythes, wheels and arrows.

**Sources:** MUI-S-0066

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0066 unreachable (https://www.wisconsinhistory.org/record/image/W0133MG/john-muirs-clock-design)

**Checker's reasoning:** No problem found in the snapshot. The live page returned 403, so its current wording could not be verified.

**Notes:** Holder Copyright Status NO COPYRIGHT - UNITED STATES (a United States-only no-copyright statement; adversary to confirm the public-domain class). Rights Holder: Wisconsin Historical Society.

### MUI-M-0035 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir Clock (image) <https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "NO COPYRIGHT - UNITED STATES" <https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock>

**Credit:** Wisconsin Historical Society, Muir, John, 1838-1914, John Muir Clock, W014DPN

**Alt text** (published as the image description): Muir's illustration of a means to record time by use of a star, 1863, titled "The star hand rising and setting with the sun all the year".

**Sources:** MUI-S-0067

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0067 found (https://www.wisconsinhistory.org/record/image/W014DPN/john-muir-clock)

**Checker's reasoning:** no problem found

**Notes:** Holder Copyright Status NO COPYRIGHT - UNITED STATES (United States-only statement; adversary to confirm the public-domain class).

### MUI-M-0036 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir Clock (image) <https://www.wisconsinhistory.org/record/image/W014DXT/john-muir-clock>

**Licence:** unknown; link only, never embedded

**Rights statement:** "COPYRIGHT NOT EVALUATED" <https://www.wisconsinhistory.org/record/image/W014DXT/john-muir-clock>

**Credit:** Wisconsin Historical Society, Granflaten, Robert L., John Muir Clock, W014DXT

**Alt text** (published as the image description): Photograph by Robert L. Granflaten of a clock on display at the Wisconsin Historical Society; the clock was made by John Muir while a student at the University of Wisconsin in 1860.

**Sources:** MUI-S-0068

**Independent checker:** codex:gpt-6-sol (run adv-muir-registry-2026-10-16, 2026-10-16): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0068 found (https://www.wisconsinhistory.org/record/image/W014DXT)

**Checker's reasoning:** no problem found

**Notes:** Holder Copyright Status field. Photograph date not given on the holder page.

### MUI-M-0037 (disputed)

- [ ] reject
- [ ] note: 

**Item:** John Muir (3d) <https://npg.si.edu/object/npg_NPG.65.73>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "There are restrictions for re-using this media. For more information, visit the Smithsonian's Terms of Use page." <https://npg.si.edu/object/npg_NPG.65.73>

**Credit:** National Portrait Gallery, Smithsonian Institution; transfer from the National Gallery of Art; gift of Ione Bellamy Harkness, 1947

**Alt text** (published as the image description): Bronze sculpture of John Muir by Edwin Keith Harkness, 1926.

**Sources:** MUI-S-0078

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information yes; atomic yes; source type right yes.

**Checker's reasoning:** The snapshot contains the quoted restrictions statement, but the same holder snapshot also lists “Restrictions & Rights” as CC0, which contradicts the rights-restricted classification. I could not load the live NPG page directly in this environment.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary found the claim adds information

**Notes:** Holder page conflict: the media panel says Usage Conditions Apply (restrictions for re-using this media) while the Restrictions & Rights field reads CC0; the media-level statement is used and the class kept restrictive until a person checks. media\_type 3d is the object (a sculpture); the page offers 2D photographs of it.

### MUI-M-0038 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** "The Two Johnnies" 1899 (image) <https://siarchives.si.edu/collections/siris_arc_308145>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Copyright Not Evaluated" <https://siarchives.si.edu/collections/siris_arc_308145>

**Credit:** Smithsonian Institution Archives, Record Unit 7243, Harriman Alaska Expedition, Image No. SIA2012-3819

**Alt text** (published as the image description): Photo of John Burroughs and John Muir standing on snow, 1899, by Edward S. Curtis, from a photo album documenting the Harriman Alaska Expedition.

**Sources:** MUI-S-0079

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Holder Restrictions & Rights: Copyright Not Evaluated; usage panel welcomes personal and educational use, commercial use by request. Credit is the holder's Cite as line.

### MUI-M-0039 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 5c John Muir single (image) <https://postalmuseum.si.edu/object/npm_1980.2493.5476>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Usage conditions apply" <https://postalmuseum.si.edu/object/npm_1980.2493.5476>

**Credit:** National Postal Museum

**Alt text** (published as the image description): 5c John Muir single postage stamp, April 29, 1964, featuring a portrait of John Muir and an image of a man standing in a forest of Redwood trees.

**Sources:** MUI-S-0084

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Holder Usage field. No credit line on the page; credit is the page's Data Source. Scott Catalogue USA 1245.

### MUI-M-0040 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 32c John Muir single (image) <https://postalmuseum.si.edu/object/npm_1998.2010.874>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "Copyright United States Postal Service. All rights reserved." <https://postalmuseum.si.edu/object/npm_1998.2010.874>

**Credit:** Copyright United States Postal Service. All rights reserved.

**Alt text** (published as the image description): 32c John Muir single postage stamp, February 3, 1998, from the Celebrate The Century: 1900s souvenir sheet; it depicts preservationist John Muir and Yosemite Valley, California.

**Sources:** MUI-S-0085

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Holder Credit line states USPS copyright; Usage field reads Not determined. Scott Catalogue USA 3182j.

### MUI-M-0041 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** July 1867-February 1868 \[Journal 01\]: The “thousand mile walk” from Kentucky to Florida and Cuba (document) <https://scholarlycommons.pacific.edu/jmj1/>

**Licence:** rights-restricted; link only, never embedded

**Rights statement:** "The unpublished works of John Muir are under copyright by the Muir-Hanna Trust. To purchase copies and/or obtain permission to publish or exhibit items from the John Muir Papers, visit our fees and forms page." <https://scholarlycommons.pacific.edu/jmj1/>

**Credit:** Holt-Atherton Special Collections of the University of the Pacific

**Alt text** (published as the image description): Images of John Muir's journal, July 1867 - February 1868: the "thousand mile walk" from Kentucky to Florida and Cuba.

**Sources:** MUI-S-0069

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** Gallery of page images (15 gallery pages) in the John Muir Papers. Holder states Muir-Hanna Trust copyright; link only. No explicit credit line on the page; credit names the holder as the page does.

### MUI-M-0042 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (image) <https://npg.si.edu/object/npg_NPG.65.79>

**Licence:** cc0; can be shown on the site

**Rights statement:** "CC0" <https://npg.si.edu/object/npg_NPG.65.79>

**Credit:** National Portrait Gallery, Smithsonian Institution; transfer from the Smithsonian American Art Museum; gift of Mary W. Harriman, 1920

**Alt text** (published as the image description): Oil on canvas painting of John Muir by Orlando Rouland, c. 1917 from a 1909 photograph.

**Sources:** MUI-S-0076

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NPG object page Restrictions & Rights field reads CC0; the live page's media panel also shows CCO - Creative Commons (CC0 1.0), which the browser page text did not capture. Image delivery id NPG-NPG\_65\_79MuirS\_d1 on ids.si.edu.

### MUI-M-0043 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Burroughs and John Muir (image) <https://npg.si.edu/object/npg_NPG.2013.62>

**Licence:** cc0; can be shown on the site

**Rights statement:** "This media is in the public domain (free of copyright restrictions). You can copy, modify, and distribute this work without contacting the Smithsonian." <https://npg.si.edu/object/npg_NPG.2013.62>

**Credit:** National Portrait Gallery, Smithsonian Institution; acquired through the generosity of Tracy Thompson and David C. Ward in recognition of NatureBridge

**Alt text** (published as the image description): Gelatin silver print photograph of John Burroughs and John Muir by Carl Everton Moon, 1909.

**Sources:** MUI-S-0077

**Independent checker:** codex:gpt-5.5 (run adv-20261009T154745-52cf, 2026-10-09): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Checker's reasoning:** no problem found

**Notes:** NPG media panel: CCO - Creative Commons (CC0 1.0); Restrictions & Rights: CC0.

### MUI-M-0044 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** June-September 1879 \[Journal 28\]: Expedition to Alaska (document) <https://scholarlycommons.pacific.edu/cs-jmj/28>

**Licence:** unknown; link only, never embedded

**Rights statement:** "To view additional information on copyright and related rights of this item, such as to purchase copies of images and/or obtain permission to publish them, see the Holt-Atherton Special Collections policies: http://www.pacific.edu/Library/Find/Holt-Atherton-Special-Collections/Fees-and-Forms-.html" <https://scholarlycommons.pacific.edu/cs-jmj/28>

**Credit:** Holt-Atherton Special Collections of the University of the Pacific

**Alt text** (published as the image description): John Muir's journal of June-September 1879, Expedition to Alaska.

**Sources:** MUI-S-0096

**Independent checker:** codex:gpt-6.1-sol (run adv-20261015T003839-09cf, 2026-10-15): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0096 found (https://scholarlycommons.pacific.edu/cs-jmj/28/)

**Checker's reasoning:** no problem found

**Notes:** Tour stop 5 (Alaska) artifact: Muir's own 1879 journal (John Muir Papers, MSS 048). The holder's page points to its policies and states no licence, so unknown: link only.

### MUI-M-0045 (disputed)

- [ ] reject
- [ ] note: 

**Item:** 1. Historic American Buildings Survey Photograph Original 1900 - Recopy 1960 GENERAL VIEW FROM SOUTH - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020419pv.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 1. Historic American Buildings Survey Photograph Original 1900 - Recopy 1960 GENERAL VIEW FROM SOUTH - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** The caption identifies this image as a recopy, so the approved rights rule makes it unusable despite the recorded unknown license class.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. The approved LoC rule bars embedding (recopy of an outside original), so reference only. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Owner decision 2026-10-18: photos 1-2 are recopies of 1900 / c.1920 originals and stay rights-unknown/restricted (not government-made).

**Review so far:** pending; note: 2026-10-29 project owner: This item (1900 original, recopy 1960) stays modelling-only. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0046 (disputed)

- [ ] reject
- [ ] note: 

**Item:** 2. Historic American Buildings Survey Photograph Original C 1920 - Recopy 1960 NORTHEAST CORNER ELEVATION - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020420pv.jpg>

**Licence:** unknown; link only, never embedded

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 2. Historic American Buildings Survey Photograph Original C 1920 - Recopy 1960 NORTHEAST CORNER ELEVATION - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** The caption identifies this image as a recopy, so the approved rights rule makes it unusable despite the recorded unknown license class.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. The approved LoC rule bars embedding (recopy of an outside original), so reference only. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Owner decision 2026-10-18: photos 1-2 are recopies of 1900 / c.1920 originals and stay rights-unknown/restricted (not government-made).

**Review so far:** pending; note: 2026-10-29 project owner: This item (c. 1920 original, recopy 1960) stays modelling-only. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0047 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 9. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 STAIR HALL FROM ENTRANCE - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020427pv.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 9. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 STAIR HALL FROM ENTRANCE - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 photograph (Jack E. Boucher, HABS, October 1960) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers.

### MUI-M-0048 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 10. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 WEST PARLOR - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020428pv.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 10. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 WEST PARLOR - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 photograph (Jack E. Boucher, HABS, October 1960) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers.

### MUI-M-0049 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 12. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 DETAIL OF LIBRARY - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020430pv.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 12. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 DETAIL OF LIBRARY - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 photograph (Jack E. Boucher, HABS, October 1960) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers.

### MUI-M-0050 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 13. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 JOHN MUIR BEDROOM & STUDY - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020431pv.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 13. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 JOHN MUIR BEDROOM & STUDY - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0126

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 photograph (Jack E. Boucher, HABS, October 1960) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers.

**Review so far:** pending; note: 2026-10-29 project owner: This item is Photo 13: public domain; used as the texture source of the Martinez study wallpaper. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0051 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 14. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 FIREPLACE, SECOND FLOOR BEDROOM - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (image) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/photos/020432pv.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 14. Historic American Buildings Survey, Jack E. Boucher, photographer, October 1960 FIREPLACE, SECOND FLOOR BEDROOM - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0126

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033720-028a, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890. 1960 interiors show the house after the 1955 purchase, not Muir's furnishings. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 photograph (Jack E. Boucher, HABS, October 1960) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers. Edit lock (2026-10-18): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17) cleared for re-verification.

### MUI-M-0052 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 2. Basement and first floor plans - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00002v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 2. Basement and first floor plans - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890 measured drawing. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 measured drawing (NPS/HABS title block, 1964) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers. Edit lock (2026-10-18): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17) cleared for re-verification.

### MUI-M-0053 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 3. Second floor and attic plans - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00003v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 3. Second floor and attic plans - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890 measured drawing. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 measured drawing (NPS/HABS title block, 1964) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers. Edit lock (2026-10-18): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17) cleared for re-verification.

**Review so far:** pending; note: 2026-10-29 project owner: This item is a survey sheet: public domain. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0054 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 13. John Muir study details - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00013v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 13. John Muir study details - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0126

**Independent checker:** codex:gpt-6-sol (run adv-20261018T033533-2eaf, 2026-10-18): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). HABS CA-1890 measured drawing. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-18: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)'). Owner decision 2026-10-18: HABS CA-1890 measured drawing (NPS/HABS title block, 1964) is public domain as a work of the U.S. Government. LoC rights advisory quoted: "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." John Muir, Louie Strentzel Muir and John Strentzel in the contributor list are associated people, not makers. Edit lock (2026-10-18): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17) cleared for re-verification.

**Review so far:** pending; note: 2026-10-29 project owner: This item is a survey sheet: public domain. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0055 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Dunbar, Scotland. John Muir's birthplace. (image) <https://npgallery.nps.gov/AssetDetail/3713468d99984dc6a8279bc03ec9c87c>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/3713468d99984dc6a8279bc03ec9c87c>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Dunbar, Scotland. John Muir's birthplace.

**Sources:** MUI-S-0097

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0092

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0097 found (https://npgallery.nps.gov/AssetDetail/3713468d99984dc6a8279bc03ec9c87c)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2).

### MUI-M-0056 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Lorne Hotel, Dunbar, Scotland: boyhood home (image) <https://npgallery.nps.gov/AssetDetail/a6c0080aa827482baf5dfd72adbab630>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/a6c0080aa827482baf5dfd72adbab630>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Lorne Hotel, Dunbar, Scotland: boyhood home.

**Sources:** MUI-S-0095

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0095

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0095 found (https://npgallery.nps.gov/AssetDetail/a6c0080aa827482baf5dfd72adbab630)

**Checker's reasoning:** The NPS record identifies the Lorne Hotel as a boyhood home in Dunbar, but does not establish that the pictured building is 130 High Street, the building named in the linked stop fact.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2). The holder's record says Muir was 'actually born in the building to the left', so the title names it his boyhood home only.

### MUI-M-0057 (disputed)

- [ ] reject
- [ ] note: 

**Item:** This, now the Thomas Kearn's home, is the second home of the Muir family. (image) <https://npgallery.nps.gov/AssetDetail/50c52c9209404f0cb5b30e6540e70c7b>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/50c52c9209404f0cb5b30e6540e70c7b>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): This, now the Thomas Kearn's home, is the second home of the Muir family.

**Sources:** MUI-S-0098

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0107

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0098 found (https://npgallery.nps.gov/AssetDetail/50c52c9209404f0cb5b30e6540e70c7b)

**Checker's reasoning:** The National Park Service describes the image as the Muir family's second home but does not identify it as Hickory Hill, the place named by the linked stop fact.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2).

### MUI-M-0058 (disputed)

- [ ] reject
- [ ] note: 

**Item:** The barn is original built by the elder Muir, John and his brothers. (image) <https://npgallery.nps.gov/AssetDetail/5c0efd915a7d452c9d878d81ac67acc6>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/5c0efd915a7d452c9d878d81ac67acc6>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): The barn is original built by the elder Muir, John and his brothers.

**Sources:** MUI-S-0099

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0109

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0099 found (https://npgallery.nps.gov/AssetDetail/5c0efd915a7d452c9d878d81ac67acc6)

**Checker's reasoning:** The NPS page associates the barn image with Fountain Lake Farm and does not establish that it depicts the barn at Hickory Hill named in the linked stop fact.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2).

### MUI-M-0059 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Plaque at supposed site of Muir's cabin (image) <https://npgallery.nps.gov/AssetDetail/1985f676912a4c198bb198ccb965d553>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/1985f676912a4c198bb198ccb965d553>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Plaque at supposed site of Muir's cabin.

**Sources:** MUI-S-0100

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0119

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict refuted; quote in snapshot yes; found in the live source yes; entailed no; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0100 found (https://npgallery.nps.gov/AssetDetail/1985f676912a4c198bb198ccb965d553)

**Checker's reasoning:** The NPS record identifies a plaque at the supposed site of Muir’s cabin, but does not place the cabin by Yosemite Creek as the linked stop fact requires.

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2).

### MUI-M-0060 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Old Muir homestead near Martinez \[Alhambra Valley\]. (image) <https://npgallery.nps.gov/AssetDetail/06fb82f2c28c45d79ecb173ab1f583b7>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/06fb82f2c28c45d79ecb173ab1f583b7>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Old Muir homestead near Martinez \[Alhambra Valley\].

**Sources:** MUI-S-0101

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0124

**Independent checker:** codex:gpt-6-sol (run adv-muir-2026-10-17, 2026-10-17): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0101 found (https://npgallery.nps.gov/AssetDetail/06fb82f2c28c45d79ecb173ab1f583b7)

**Checker's reasoning:** no problem found

**Notes:** Basis-photo migration 2026-10-16 (owner decision: record kind for photos used only as the basis for rebuilding a place; listed in TOUR-RESEARCH.md stop 6). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0018 to 0021); the record also carries NPGallery's generic copyright notice, an open owner question (TOUR-RESEARCH gap 2).

### MUI-M-0061 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Petition from the Society for the Preservation of National Parks against Granting San Francisco the Hetch Hetchy Valley (document) <https://catalog.archives.gov/id/7268060>

**Licence:** unknown; link only, never embedded

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/7268060>

**Credit:** National Archives, Records of the U.S. Senate, Committee Papers of the Committee on Public Lands from the 63rd Congress, NAID 7268060.

**Alt text** (published as the image description): Letter of June 27, 1913 from the Society for the Preservation of National Parks, California Branch, to Hon. George E. Chamberlain, Senate Chamber, signed by John Muir and other leading preservationists, urging Congress to defeat the Raker Bill, which called for a dam to be built across the Hetch Hetchy Valley.

**Sources:** MUI-S-0070, MUI-S-0102

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173631-b266, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0070 unreachable (https://catalog.archives.gov/id/7268060); MUI-S-0102 unreachable (https://catalog.archives.gov/id/7268060)

**Checker's reasoning:** The snapshots support the title, description, credit and all four signers; unknown is the required conservative classification for this private letter with incomplete author death evidence. Both live endpoints and the catalog page were unreachable.

**Notes:** Artifacts research 2026-10-20: 2 page images Society\_for\_the\_Preservation\_of\_National\_Parks\_001.jpg (2613x3347) and \_002.jpg (2612x3379), plus a PDF, at catalog.archives.gov/medialive/60/2680/7268060/content/arcmedia/legislative/gallery/. Rights from useRestriction.status in MUI-S-0070. Stop 6 (Martinez) / Hetch Hetchy. Authorship set on 2026-10-20: private (John Muir, E. T. Parsons, Wm F. Bade, R. V. Colby) (private-writings rule, DECISIONS 2026-10-20): petition signed by four directors of a private society. Applied the approved rights rule (DECISIONS 2026-10-20, private writings in public archives, private-writings rule) on 2026-10-20: license\_class set back to unknown (link-only): private writing; no sourced death year for E. T. Parsons; the holder's statement 'Unrestricted' alone is not a rights grant for a private writing.

### MUI-M-0062 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Passport application of John Muir, Volume 995: May 1 to 6, 1903 (document) <https://catalog.archives.gov/id/235846313>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Unrestricted" <https://catalog.archives.gov/id/235846313>

**Credit:** National Archives at College Park, General Records of the Department of State, Passport Applications, Volume 995: May 1 to 6, 1903, NAID 235846313 (images 0420 and 0421; image provided by Fold3).

**Alt text** (published as the image description): Images of the passport application of John Muir, Year of Birth: 1838, in Volume 995: May 1 to 6, 1903 of the Passport Applications, General Records of the Department of State.

**Sources:** MUI-S-0072

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T173631-b266, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0072 unreachable (https://catalog.archives.gov/id/235846313)

**Checker's reasoning:** The snapshot identifies John Muir, birth year 1838, on images 0420 and 0421 and gives useRestriction.status as Unrestricted; the supplied 1914 death basis satisfies the private-writings exception. Live API and catalog retrieval failed, and web search returned no result.

**Notes:** Artifacts research 2026-10-20: the two images named 'Name: John Muir; Age/Year of Birth: 1838' in this volume (objectIds 235846729 and 235846730; 0420.jpg 3308x6001, 0421.jpg 3360x5961). Rights from the volume's useRestriction.status in MUI-S-0072. Read by eye on 2026-10-20, NOT facts (no transcription exists): sworn at Martinez, County of Contra Costa, 28 April 1903, stamped Passport Bureau May 5 1903; born at Dunbar, Scotland, 21 April 1838; emigrated with his parents in March 1849, sailing from Glasgow in the ship 'Warren' on or about 2 March 1849; naturalized 28 April 1903 before the Superior Court of Contra Costa County; occupation botanist and geology. Needs a human transcription (or a Citizen Archivist transcription) to become facts; this is the Warren ship lead. Stops 1-2 (emigration) and 6 (Martinez). Authorship set on 2026-10-20: private (John Muir) (private-writings rule, DECISIONS 2026-10-20): John Muir's own passport application. Edit lock (2026-10-20): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-20261020T170152-278c, 2026-10-20) cleared for re-verification.

### MUI-M-0063 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Muir's signature in Grand Register (image) <https://npgallery.nps.gov/AssetDetail/161c5230636b4f6e956a3a57a9c41e77>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/161c5230636b4f6e956a3a57a9c41e77>

**Credit:** National Park Service, Yosemite National Park Archives, Yosemite Historic Photo Collection, RL\_01368. Photographer: Ralph H. Anderson.

**Alt text** (published as the image description): Muir's signature in Grand Register, Yosemite National Park, California, August 1938. Photographer: Ralph H. Anderson.

**Sources:** MUI-S-0103

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T170152-278c, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0103 found (https://npgallery.nps.gov/AssetDetail/161c5230636b4f6e956a3a57a9c41e77)

**Checker's reasoning:** no problem found

**Notes:** Artifacts research 2026-10-20: rights\_statement is the record's 'Constraints Information' field; the page also carries NPGallery's generic 'Permission must be secured from the individual copyright owners...' notice (owner decision pending, same as MUI-M-0018 to -0021). TIF 4171x2887. The register itself and the date of the signature are not described by the holder. Stop 4 (Yosemite).

### MUI-M-0064 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Pellaea ornithopus, John Muir, 1875, Sierra Nevada (BRIT461292) (image) <https://portal.torcherbaria.org/portal/collections/individual/index.php?occid=23990867>

**Licence:** cc0; can be shown on the site

**Rights statement:** "http://creativecommons.org/publicdomain/zero/1.0/" <https://portal.torcherbaria.org/portal/collections/individual/index.php?occid=23990867>

**Credit:** Botanical Research Institute of Texas (BRIT), BRIT461292, via the TORCH Portal.

**Alt text** (published as the image description): Pellaea ornithopus (Pteridaceae), BRIT461292, John Muir, 1875, Sierra Nevada, California, United States.

**Sources:** MUI-S-0104

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T170327-fe76, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0104 unreachable (https://portal.torcherbaria.org/portal/collections/individual/index.php?occid=23990867)

**Checker's reasoning:** The snapshot identifies BRIT as rights holder, states the CC0 URL, and supports the credit, title and description. The live page could not be loaded through either web access or shell, and web search returned no result.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): portal.torcherbaria.org: Botanical Research Institute of Texas (BRIT), secondary.

**Notes:** Artifacts research 2026-10-20: herbarium sheet image https://web.corral.tacc.utexas.edu/brit/BRIT/BRIT0461000/BRIT461292.jpg (BRIT's image server at TACC; not a host tools/fetch\_media.py accepts yet). The record names the collector only as 'John Muir'; that this is the naturalist is an inference (1875 Sierra Nevada fits his botanizing there) and is not stated. Stop 4 (Yosemite / Sierra). 2026-10-20: credit reworded to the record snapshot (adversary: Philecology Herbarium not in the api snapshot).

### MUI-M-0065 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Let everyone help to save the famous Hetch-Hetchy Valley and stop the commercial destruction which threatens our national parks (document) <https://www.loc.gov/item/tmp93000846/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The books in this collection are in the public domain and are free to use and reuse." <https://www.loc.gov/item/tmp93000846/>

**Credit:** Library of Congress

**Alt text** (published as the image description): Let everyone help to save the famous Hetch-Hetchy Valley and stop the commercial destruction which threatens our national parks, 1911.

**Sources:** MUI-S-0028

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30b, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0028 found (https://www.loc.gov/resource/gdc.tmp93000846/?sp=16)

**Checker's reasoning:** no problem found

**Notes:** Artifacts research 2026-10-20: LoC rights\[0\] says the books in this collection are in the public domain, but that wording is not in the approved LoC rights rule (rights\_advisory 'No known restrictions...'), so link only until the owner rules. IIIF image 1830x2778 (public:gdc:00018768896:0001). Stop 6 / Hetch Hetchy. License class corrected on 2026-10-30: unknown -\> public-domain, because the holder's own statement on file (Library of Congress: "The books in this collection are in the public domain and are free to use and reuse.") states public domain; the adversary had refuted the record for exactly that contradiction (2026-10-20). Instruction: round 9 part B brief (controller, 2026-10-30). Re-judged by the adversary after this change. credit corrected on 2026-10-30 (the holder's own credit line, Credit Line: Library of Congress; the adversary refuted the added words); was: Library of Congress, General Collections.

### MUI-M-0066 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Articles of association, articles of incorporation, by-laws, and list of charter members of the Sierra club (document) <https://www.loc.gov/item/03022601/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The books in this collection are in the public domain and are free to use and reuse." <https://www.loc.gov/item/03022601/>

**Credit:** Library of Congress

**Alt text** (published as the image description): Articles of association, articles of incorporation, by-laws, and list of charter members of the Sierra club, 1892.

**Sources:** MUI-S-0029

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30b, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0029 unreachable (https://www.loc.gov/item/03022601/)

**Checker's reasoning:** No problem found in the snapshot; the live item page could not be loaded.

**Notes:** Artifacts research 2026-10-20: same LoC rights wording as the 1911 Hetch-Hetchy broadside item (MUI-M-0065) (not the approved rule): link only until the owner rules. IIIF page images (public:gdc:03022601), 1120x1937. Stop 6 (Martinez) / Sierra Club 1892. License class corrected on 2026-10-30: unknown -\> public-domain, because the holder's own statement on file (Library of Congress: "The books in this collection are in the public domain and are free to use and reuse.") states public domain; the adversary had refuted the record for exactly that contradiction (2026-10-20). Instruction: round 9 part B brief (controller, 2026-10-30). Re-judged by the adversary after this change. credit corrected on 2026-10-30 (the holder's own credit line, Credit Line: Library of Congress; the adversary refuted the added words); was: Library of Congress, General Collections.

### MUI-M-0067 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hutching's Sawmill near Yos. Falls; John Muir worked here. copied by Phillips, copied 1930 (image) <https://npgallery.nps.gov/AssetDetail/f5e063d6d0b747df83a6d170a02b0a41>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/f5e063d6d0b747df83a6d170a02b0a41>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Hutching's Sawmill near Yos. Falls; John Muir worked here. copied by Phillips, copied 1930

**Sources:** MUI-S-0105

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0132, MUI-F-0118

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0105 unreachable (https://npgallery.nps.gov/AssetDetail/f5e063d6d0b747df83a6d170a02b0a41)

**Checker's reasoning:** The NPS snapshot explicitly states “Public domain” and identifies Hutchings’ sawmill where Muir worked; its title, description and collection support the supplied metadata. The live item page could not be loaded through either web access or shell.

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01643, undated original, copy 1930; tif 3768x2254. Chapter 7 (Yosemite).

### MUI-M-0068 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hutchings' sawmill near Yosemite Falls. Copied by: Phillips 11/36. From a George Fiske Photo. (image) <https://npgallery.nps.gov/AssetDetail/e49b04407f0340c3a3db3447da64be63>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/e49b04407f0340c3a3db3447da64be63>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Hutchings' sawmill near Yosemite Falls. Copied by: Phillips 11/36. From a George Fiske Photo.

**Sources:** MUI-S-0106

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0132, MUI-F-0118

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0106 unreachable (https://npgallery.nps.gov/AssetDetail/e49b04407f0340c3a3db3447da64be63)

**Checker's reasoning:** The NPS snapshot explicitly states public domain and identifies Hutchings' sawmill near Yosemite Falls, with matching title, description and collection credit. The live item page could not be read through either web access or shell fetch.

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01666, George Fiske original, copy 1936; tif 3522x2120. Chapter 7 (Yosemite).

### MUI-M-0069 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Site of John Muir's cabin. Where Muir had dug a ditch from Yosemite Creek to run a stream under a corner of his cabin, just below the sawmill site near company warehouses. (image) <https://npgallery.nps.gov/AssetDetail/5ddbb36b04e14ff4a8ce86aff5bae959>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/5ddbb36b04e14ff4a8ce86aff5bae959>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Site of John Muir's cabin. Where Muir had dug a ditch from Yosemite Creek to run a stream under a corner of his cabin, just below the sawmill site near company warehouses.

**Sources:** MUI-S-0107

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0119

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0107 found (https://npgallery.nps.gov/YOSE/AssetDetail/5ddbb36b04e14ff4a8ce86aff5bae959)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01521, September 1940; tif 4028x2845. Site only (cabin gone). Chapter 7.

### MUI-M-0070 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Old ditch that brought water from Yosemite Creek to run sawmill that John Muir worked at. (image) <https://npgallery.nps.gov/AssetDetail/6f73a954210a4718bc9a28a1db3c8a38>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/6f73a954210a4718bc9a28a1db3c8a38>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Old ditch that brought water from Yosemite Creek to run sawmill that John Muir worked at.

**Sources:** MUI-S-0108

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0132

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0108 unreachable (https://npgallery.nps.gov/AssetDetail/6f73a954210a4718bc9a28a1db3c8a38)

**Checker's reasoning:** The NPS snapshot explicitly states Public domain and supplies the matching description, publisher and collection credit for the ditch serving Muir’s sawmill. The live item page could not be loaded through either shell or web access.

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01644, September 1940; tif 4033x2834. Chapter 7.

### MUI-M-0071 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hetch Hetchy before dam. (image) <https://npgallery.nps.gov/AssetDetail/3e8e7c3449b24572827b6cfad637415b>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/3e8e7c3449b24572827b6cfad637415b>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Hetch Hetchy before dam.

**Sources:** MUI-S-0109

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0071

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0109 found (https://npgallery.nps.gov/AssetDetail/3e8e7c3449b24572827b6cfad637415b)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01125, undated (Carleton E. Watkins per web-search snippet, not on the page); tif 2659x3866. Chapter 8 (Hetch Hetchy).

### MUI-M-0072 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hetch Hetchy Valley prior to reservoir showing party of visitors viewing valley. (image) <https://npgallery.nps.gov/AssetDetail/d22c0aeaf2ca435b99a680a92a2153f6>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/d22c0aeaf2ca435b99a680a92a2153f6>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): Hetch Hetchy Valley prior to reservoir showing party of visitors viewing valley.

**Sources:** MUI-S-0110

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0071

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0110 found (https://npgallery.nps.gov/AssetDetail/d22c0aeaf2ca435b99a680a92a2153f6)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_01291, undated, 5x7 film; tif 3782x2595. Chapter 8.

### MUI-M-0073 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir and Teddy Roosevelt at Glacier Point. (image) <https://npgallery.nps.gov/AssetDetail/125dcef52b22418fa7bd533b1746270e>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Public domain" <https://npgallery.nps.gov/AssetDetail/125dcef52b22418fa7bd533b1746270e>

**Credit:** National Park Service, Yosemite Historic Photo Collection

**Alt text** (published as the image description): John Muir and Teddy Roosevelt at Glacier Point.

**Sources:** MUI-S-0111

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0086

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0111 found (https://npgallery.nps.gov/AssetDetail/125dcef52b22418fa7bd533b1746270e)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20 (owner decision 2026-10-20: one room per turning point; basis photo for the chapter's room, ROOMS.md). NPGallery Constraints Information 'Public domain' (precedent MUI-M-0055); the record also carries NPGallery's generic copyright notice (TOUR-RESEARCH gap 2). RL\_13238, undated (comment: no institution claims ownership; see also RL-4475); tif 1785x2316. Chapter 8 (1903 camp). The LoC 1903 stereograph MUI-M-0013 is the item; this is the place basis.

### MUI-M-0074 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** FOUNTAIN LAKE FARM, Marquette County, Wisconsin: Muir farmhouse with Sarah (Muir) Galloway, her children and John Muir (document) <https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471_photos>

**Licence:** unknown; link only, never embedded

**Rights statement:** "" 

**Credit:** National Park Service, National Register of Historic Places, NHL nomination photographs (NRHP 90000471)

**Alt text** (published as the image description): FOUNTAIN LAKE FARM, Marquette County, Wisconsin: Muir farmhouse with Sarah (Muir) Galloway, her children and John Muir.

**Sources:** MUI-S-0112

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0103

**Independent checker:** codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0112 found (https://npgallery.nps.gov/NRHP/GetAsset/NHLS/90000471\_photos)

**Checker's reasoning:** The live NPS photograph document identifies the Muir farmhouse and names Sarah (Muir) Galloway, her children and John Muir in its caption. No rights statement is claimed, and the unknown license class is appropriate.

**Notes:** Rooms run 2026-10-20. PDF page 3; caption 'Photographer unknown, c. 1863' (OCR reads '1B63'); embedded image 1522x1103 at 225 ppi. The only period photograph of the Fountain Lake farmhouse found. No rights statement on the PDF or on the NPGallery asset page (only 'NATIONAL REGISTER DIGITAL ASSETS'), so unknown: modelling reference only. The other six photographs (Donald L. Stevens, Jr., 1988) show the meadow, lilac bushes and fields: site context only. Chapter 4 (arrival at Fountain Lake).

### MUI-M-0075 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** North Hall (image) <https://search.library.wisc.edu/digital/AIAA7TV55XWDT68Q>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No copyright (U.S.)" <https://search.library.wisc.edu/digital/AIAA7TV55XWDT68Q>

**Credit:** University of Wisconsin-Madison Archives, UW-Madison Libraries Digital Collections (S05904)

**Alt text** (published as the image description): North Hall - first building on UW campus.

**Sources:** MUI-S-0113

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0153

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30c, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0113 found (https://search.library.wisc.edu/digital/AIAA7TV55XWDT68Q)

**Checker's reasoning:** no problem found

**Notes:** Rooms run 2026-10-20. Exterior, ca. 1885 (about 22 years after Muir left in 1863). Holder copyright statement 'No copyright (U.S.)'. No interior photograph of Muir's room found. Chapter 2/3 bridge (education in the US). basis\_for corrected on 2026-10-30 (owner feedback round 9 item 6: the photograph is the basis photo of North Hall for the verified fact MUI-F-0153 (dormitory room in North Hall); MUI-F-0113 is single-source); was: \['MUI-F-0113'\] Edit lock (2026-10-30): rights fields changed after verification; adversary verdict 'supported' by codex:gpt-6.1-sol (run adv-20261020T184320-16f4, 2026-10-20) cleared for re-verification.

### MUI-M-0076 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hutchings' Hotel (image) <https://www.loc.gov/item/2006679428/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2006679428/>

**Credit:** John P. Soule, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Hutchings' Hotel, Yosemite Valley, California; stereograph published by John P. Soule, c1870.

**Sources:** MUI-S-0114

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0131

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0114 unreachable (https://www.loc.gov/item/2006679428/)

**Checker's reasoning:** The holder's snapshot confirms the title, Yosemite Valley location, c1870 publication, Soule attribution and repository; its exact rights advisory qualifies under the approved rule. The live source could not be read through either shell or web access; reachability is reported separately as instructed.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 7a (Yosemite Valley, where he began his fulltime life in 1869, MUI-F-0131; he ran Hutchings' sawmill, MUI-F-0132). Hutchings' hotel, not the sawmill. Master TIFF 4841x2425. Largest file listed: 4841x2425 https://tile.loc.gov/storage-services/master/pnp/stereo/1s00000/1s01000/1s01100/1s01119u.tif.

### MUI-M-0077 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Huching's \[Hutchings'\] Hotel, and Sentinel Rock, Yo Semite Valley (image) <https://www.loc.gov/item/2006678855/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2006678855/>

**Credit:** John P. Soule, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Hutchings' Hotel and Sentinel Rock, Yosemite Valley; stereograph published by John P. Soule, c1870.

**Sources:** MUI-S-0115

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0131

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0115 unreachable (https://www.loc.gov/item/2006678855/)

**Checker's reasoning:** The LoC snapshot supports the title, Yosemite Valley location, c1870 publication, Soule credit, and exact rights statement under the approved rule. The live endpoint and item page could not be loaded; reachability is reported separately as instructed.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 7a (Yosemite Valley, MUI-F-0131). Hutchings' hotel with Sentinel Rock. Master TIFF 4845x2469 (front), back 2491x4832. Largest file listed: 4845x2469 https://tile.loc.gov/storage-services/master/pnp/stereo/1s00000/1s00000/1s00900/1s00996u.tif.

### MUI-M-0078 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Room in the old Hutchings House--first in the valley--built around an 8 foot cedar tree, Yosemite Valley, Cal. (image) <https://www.loc.gov/item/90715649/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/90715649/>

**Credit:** Underwood & Underwood, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Room in the old Hutchings House, built around an 8 foot cedar tree, Yosemite Valley, Cal.; man and woman sitting in room with large tree trunk in center; stereograph, Underwood & Underwood, c1902.

**Sources:** MUI-S-0116

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0131

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0116 found (https://www.loc.gov/resource/cph.3c00937/)

**Checker's reasoning:** The holder’s record retrieved through web search confirms the item and rights advisory; direct fetches were blocked. No problem found under the approved rights rule or basis-photo criteria.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 7a (Yosemite Valley, MUI-F-0131). Interior of the Hutchings House, 1902 (an interior of the hotel complex where Muir worked; no source on file ties Muir to this room). Master TIFF 4096x3281. Largest file listed: 4096x3281 https://tile.loc.gov/storage-services/master/pnp/cph/3c00000/3c00000/3c00900/3c00937u.tif.

### MUI-M-0079 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite (image) <https://www.loc.gov/item/2010647431/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010647431/>

**Credit:** Underwood & Underwood, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite, New York : Underwood & Underwood, publishers, c1903 July 18.

**Sources:** MUI-S-0117

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0086

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0117 unreachable (https://www.loc.gov/item/2010647431/)

**Checker's reasoning:** The holder's snapshot supports the Yosemite location, 1903 date, title, description, and credit; its exact rights advisory qualifies under the approved rule. The live endpoint and item page were unreadable, reported separately as unreachable.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 8a (Glacier Point 1903, MUI-F-0086). Roosevelt at Glacier Point (Muir not named in the record). Master TIFF 4957x2539. Largest file listed: 4957x2539 https://tile.loc.gov/storage-services/master/pnp/stereo/1s00000/1s02000/1s02000/1s02031u.tif.

### MUI-M-0080 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite (image) <https://www.loc.gov/item/2010647432/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010647432/>

**Credit:** Underwood & Underwood, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite, New York : Underwood & Underwood, publishers, c1903 July 18.

**Sources:** MUI-S-0118

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0086

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0118 found (https://www.loc.gov/item/2010647432/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 8a (Glacier Point 1903, MUI-F-0086). Second Underwood view (H33592). Master TIFF 4962x2533. Largest file listed: 4962x2533 https://tile.loc.gov/storage-services/master/pnp/stereo/1s00000/1s02000/1s02000/1s02032u.tif.

### MUI-M-0081 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite (image) <https://www.loc.gov/item/2010647433/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2010647433/>

**Credit:** Underwood & Underwood, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): President Roosevelt's choicest recreation - amid nature's rugged grandeur on Glacier Point, Yosemite, New York : Underwood & Underwood, publishers, c1903 July 18.

**Sources:** MUI-S-0119

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0086

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0119 found (https://www.loc.gov/item/2010647433/)

**Checker's reasoning:** no problem found

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 8a (Glacier Point 1903, MUI-F-0086). Third Underwood view (H33591). Master TIFF 4963x2555. Largest file listed: 4963x2555 https://tile.loc.gov/storage-services/master/pnp/stereo/1s00000/1s02000/1s02000/1s02033u.tif.

### MUI-M-0082 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hetch - Hetchy Valley, Sierra Nevada Mts., Calif. (image) <https://www.loc.gov/item/2007660474/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2007660474/>

**Credit:** Matt Ashby Wolfskill, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Hetch - Hetchy Valley, Sierra Nevada Mts., Calif.; photographic print, c1911, copyright deposit by Matt Ashby Wolfskill (Film No. 15, 1911).

**Sources:** MUI-S-0120

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0071

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0120 unreachable (https://www.loc.gov/item/2007660474/)

**Checker's reasoning:** The snapshot supports the title, location, date, copyright deposit, credit and exact rights wording; the approved LoC rule permits public-domain classification. The live record could not be read through shell or web access, and search did not retrieve it.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 8b (Hetch Hetchy Valley before the dam, MUI-F-0071). Largest listed JPEG 1082x420. Largest file listed: 1082x420 https://tile.loc.gov/storage-services/service/pnp/pan/6a19000/6a19500/6a19572r.jpg.

### MUI-M-0083 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Hetch - Hetchy Valley, Sierra Nevada Mts., Calif. (image) <https://www.loc.gov/item/2007660475/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2007660475/>

**Credit:** Matt Ashby Wolfskill, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Hetch - Hetchy Valley, Sierra Nevada Mts., Calif.; photographic print, c1911, copyright deposit by Matt Ashby Wolfskill (Film No. 16, 1911).

**Sources:** MUI-S-0121

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0071

**Independent checker:** codex:gpt-6.1-sol (run adv-20261022T015054-931e, 2026-10-22): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0121 unreachable (https://www.loc.gov/item/2007660475/)

**Checker's reasoning:** The snapshot supports the place, title, date, credit and description, and its exact rights advisory qualifies as public-domain under the approved rule. The live item record could not be read through web or shell retrieval.

**Notes:** LoC pass muir-loc-2026-10-22 (2026-10-22, polite JSON API). Chapter 8b (Hetch Hetchy Valley before the dam, MUI-F-0071). Largest listed JPEG 1077x420. Largest file listed: 1077x420 https://tile.loc.gov/storage-services/service/pnp/pan/6a19000/6a19500/6a19577r.jpg.

### MUI-M-0084 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Muir's Fountain Lake Home (image) <https://www.wisconsinhistory.org/record/image/W013TDB>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "NO COPYRIGHT - UNITED STATES" <https://www.wisconsinhistory.org/record/image/W013TDB>

**Credit:** Wisconsin Historical Society

**Alt text** (published as the image description): Muir's Fountain Lake Home, 1923.

**Sources:** MUI-S-0125

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0100

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0125 found (https://www.wisconsinhistory.org/record/image/W013TDB/muirs-fountain-lake-home)

**Checker's reasoning:** no problem found

**Notes:** Ratio-lift RL-M-MUI-IM40632. Wisconsin Historical Society Copyright Status "NO COPYRIGHT - UNITED STATES" (Rights Holder Wisconsin Historical Society): public-domain per the task 14b controller ruling; the LoC/NARA rule does not decide this holder, so the adversary judges the class. Landscape of the farm site in 1923; the farmhouse is gone. Chapter muir/arriving.

### MUI-M-0085 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Muir's Fountain Lake Home (image) <https://www.wisconsinhistory.org/record/image/W013TDZ>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "NO COPYRIGHT - UNITED STATES" <https://www.wisconsinhistory.org/record/image/W013TDZ>

**Credit:** Wisconsin Historical Society

**Alt text** (published as the image description): Muir's Fountain Lake Home, 1923.

**Sources:** MUI-S-0126

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0100

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0126 unreachable (https://www.wisconsinhistory.org/record/image/W013TDZ)

**Checker's reasoning:** The holder’s snapshot identifies Fountain Lake, dates the photograph to 1923, and states the recorded copyright status and credit. Live verification was blocked by HTTP 403 and shell DNS failure; reachability is reported separately under the supplied rule.

**Notes:** Ratio-lift RL-M-MUI-IM40633. Wisconsin Historical Society Copyright Status "NO COPYRIGHT - UNITED STATES" (Rights Holder Wisconsin Historical Society): public-domain per the task 14b controller ruling; the LoC/NARA rule does not decide this holder, so the adversary judges the class. Landscape of the farm site in 1923; the farmhouse is gone. Chapter muir/arriving.

### MUI-M-0086 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Muir's Fountain Lake Home (image) <https://www.wisconsinhistory.org/record/image/W013TCS>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "NO COPYRIGHT - UNITED STATES" <https://www.wisconsinhistory.org/record/image/W013TCS>

**Credit:** Wisconsin Historical Society

**Alt text** (published as the image description): Muir's Fountain Lake Home, 1923.

**Sources:** MUI-S-0127

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0100

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0127 found (https://www.wisconsinhistory.org/record/image/W013TCS)

**Checker's reasoning:** no problem found

**Notes:** Ratio-lift RL-M-MUI-IM40628. Wisconsin Historical Society Copyright Status "NO COPYRIGHT - UNITED STATES" (Rights Holder Wisconsin Historical Society): public-domain per the task 14b controller ruling; the LoC/NARA rule does not decide this holder, so the adversary judges the class. Landscape of the farm site in 1923; the farmhouse is gone. Chapter muir/arriving.

### MUI-M-0087 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Overhanging Rock, Glacier Point (image) <https://www.loc.gov/item/2004667768/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2004667768/>

**Credit:** Library of Congress, Prints and Photographs Division

**Alt text** (published as the image description): Overhanging Rock, Glacier Point.

**Sources:** MUI-S-0128

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0147

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0128 unreachable (https://www.loc.gov/item/2004667768/)

**Checker's reasoning:** The holder’s snapshot identifies Overhanging Rock, Glacier Point, confirms the repository credit, and gives the exact rights wording qualifying as public-domain under the approved rule. Live access failed through both web and shell; reachability is reported separately as required.

**Notes:** Ratio-lift RL-M-MUI-LOC-2004667768. LoC rights advisory, approved rule. Chapter muir/history.

### MUI-M-0088 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** On the overhanging rocks, Glacier Point, 3,300 ft. above valley - showing Yosemite Falls - photographing the wonderful Yosemite, Cal. (image) <https://www.loc.gov/item/2017645522/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2017645522/>

**Credit:** Library of Congress, Prints and Photographs Division

**Alt text** (published as the image description): On the overhanging rocks, Glacier Point, showing Yosemite Falls.

**Sources:** MUI-S-0129

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0147

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0129 unreachable (https://www.loc.gov/item/2017645522/)

**Checker's reasoning:** The holder’s snapshot identifies the overhanging rocks at Glacier Point, supports the title, description and repository credit, and supplies the exact rights wording qualifying under the approved rule. The live endpoint and item page could not be read; shell access and targeted web searches also failed.

**Notes:** Ratio-lift RL-M-MUI-LOC-2017645522. LoC rights advisory, approved rule. Chapter muir/history.

### MUI-M-0089 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Glacier Point, Yosemite Valley, California (image) <https://www.loc.gov/item/2002705615/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/2002705615/>

**Credit:** Library of Congress, Prints and Photographs Division

**Alt text** (published as the image description): Glacier Point, Yosemite Valley, California.

**Sources:** MUI-S-0130

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0146

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0130 unreachable (https://www.loc.gov/item/2002705615/)

**Checker's reasoning:** The holder’s snapshot identifies Glacier Point, supports the institutional credit, and gives the exact rights advisory qualifying under the approved rule. Live access failed through web and shell; reachability is reported separately as instructed.

**Notes:** Ratio-lift RL-M-MUI-LOC-2002705615. LoC rights advisory, approved rule. Chapter muir/history.

### MUI-M-0090 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Glacier Point, Yosemite Valley, Cal. (image) <https://www.loc.gov/item/89711581/>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/89711581/>

**Credit:** Library of Congress, Prints and Photographs Division

**Alt text** (published as the image description): Glacier Point, Yosemite Valley, Cal.

**Sources:** MUI-S-0131

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0146

**Independent checker:** codex:gpt-6.1-sol (run adv-20261024T022453-28d6, 2026-10-24): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0131 found (https://www.loc.gov/pictures/item/89711581/)

**Checker's reasoning:** no problem found

**Notes:** Ratio-lift RL-M-MUI-LOC-89711581. LoC rights advisory, approved rule. Chapter muir/history.

### MUI-M-0091 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 8. Longitudinal section - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00008v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 8. Longitudinal section - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261029T023538-4f92, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** HABS CA-1890 measured drawing (record MUI-M-0015), its own item record so that its rights are read per item (owner ruling 2026-10-26: within MUI-M-0015, Photo 13 and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs, MUI-M-0045 and MUI-M-0046, stay modelling-only). Used as a modelling basis for the Martinez study room (IHH-revamp assets-src/muir-martinez-study/SOURCES.md). Title, file url and rights words are read from the record snapshot of MUI-S-0047. Rights evidence: searches MUI-Q-0252 to MUI-Q-0256. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-29: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)').

**Review so far:** pending; note: 2026-10-29 project owner: This item is a survey sheet: public domain. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0092 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** 4. North elevation - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00004v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): 4. North elevation - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261029T023538-4f92, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** HABS CA-1890 measured drawing (record MUI-M-0015), its own item record so that its rights are read per item (owner ruling 2026-10-26: within MUI-M-0015, Photo 13 and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs, MUI-M-0045 and MUI-M-0046, stay modelling-only). Used as a modelling basis for the Martinez study room (IHH-revamp assets-src/muir-martinez-study/SOURCES.md). Title, file url and rights words are read from the record snapshot of MUI-S-0047. Rights evidence: searches MUI-Q-0252 to MUI-Q-0256. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-29: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)').

**Review so far:** pending; note: 2026-10-29 project owner: This item is a survey sheet: public domain. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0093 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Cover sheet - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA (document) <https://tile.loc.gov/storage-services/service/pnp/habshaer/ca/ca0100/ca0124/sheet/00000v.jpg>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted. https://www.loc.gov/rr/print/res/114\_habs.html" <https://www.loc.gov/item/ca0124/>

**Credit:** Historic American Buildings Survey, Library of Congress Prints and Photographs Division

**Alt text** (published as the image description): Cover sheet - John Muir House, Alhambra Boulevard, Martinez, Contra Costa County, CA.

**Sources:** MUI-S-0047

**Basis photo** (used only to rebuild the place; not judged as showing the inductee) for stop fact(s): MUI-F-0122

**Independent checker:** codex:gpt-6-sol (run adv-20261029T023538-4f92, 2026-10-29): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0047 found (https://www.loc.gov/item/ca0124/)

**Checker's reasoning:** no problem found

**Notes:** HABS CA-1890 measured drawing (record MUI-M-0015), its own item record so that its rights are read per item (owner ruling 2026-10-26: within MUI-M-0015, Photo 13 and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs, MUI-M-0045 and MUI-M-0046, stay modelling-only). Used as a modelling basis for the Martinez study room (IHH-revamp assets-src/muir-martinez-study/SOURCES.md). Title, file url and rights words are read from the record snapshot of MUI-S-0047. Rights evidence: searches MUI-Q-0252 to MUI-Q-0256. Applied the approved rights rule (DECISIONS 2026-10-09, LoC/NARA and extended LoC rule) on 2026-10-29: license\_class set to public-domain from the holder's statement 'No known restrictions on images made by the U.S. Government; images copied fr...', on the condition shown in the holder's record ('Historic American Buildings Survey (Library of Congress)').

**Review so far:** pending; note: 2026-10-29 project owner: This item is a survey sheet: public domain. Owner ruling 2026-10-26 (DECISIONS 2026-10-26, HABS MUI-M-0015): within HABS record MUI-M-0015 (LoC ca0124), Photo 13 (October 1960, Jack E. Boucher, National Park Service staff photographer) and the survey sheets are public domain as federal work; the bundled 1900 and c. 1920 photographs (MUI-M-0045, MUI-M-0046) stay modelling-only. Per-item rights are carried by the item records: Photo 13 MUI-M-0050; sheets 3, 13, 8, 4 and cover MUI-M-0053, MUI-M-0054, MUI-M-0091, MUI-M-0092, MUI-M-0093. LoC rights advisory (verbatim): "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted." Evidence (searches MUI-Q-0252 to MUI-Q-0256): ca0124 item JSON lists Boucher as photographer with Koue historian, Pope project manager and the field team (Q-0252); the Photo 13 segment names Jack E. Boucher, October 1960 (Q-0253); LoC HABS rights guide: drawings and most photographs were created for the U.S. Government (Q-0254); data pages prepared by NPS Western Office staff, no outside credit lines (Q-0255); Boucher worked for the National Park Service 1958 to 2006 (Q-0256, search summary, page not read in full).

### MUI-M-0094 (disputed)

- [ ] reject
- [ ] note: 

**Item:** The story of my boyhood and youth, by John Muir (1913) (image) <https://archive.org/details/storyofmyboyhood00muirrich/page/n14>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Possible copyright status NOT\_IN\_COPYRIGHT" <https://archive.org/details/storyofmyboyhood00muirrich>

**Credit:** John Muir, The Story of My Boyhood and Youth (Houghton Mifflin, 1913); scan: Internet Archive, University of California Libraries copy

**Alt text** (published as the image description): The story of my boyhood and youth, by John Muir, Boston, New York, Houghton Mifflin company, 1913: the opening of A Boyhood in Scotland, on his native town of Dunbar (MUI-F-0092).

**Sources:** MUI-S-0135, MUI-S-0140

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** MUI-S-0135 found (https://archive.org/details/storyofmyboyhood00muirrich); MUI-S-0140 unreachable (https://archive.org/stream/storyofmyboyhood00muirrich/storyofmyboyhood00muirrich\_djvu.txt)

**Checker's reasoning:** Internet Archive labels the copyright status as possible; that wording does not strictly establish the claimed public-domain class.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): archive.org: Internet Archive, secondary

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-MUI-001, 2026-10-29). Chapter: muir/birth. Shows: Page 1: 'Fortunately around my native town of Dunbar, by the stormy North Sea, there was no lack of wildness'. Holder date: 1913. Resolution: IA leaf n14 at 1500 px wide. Preview previews/mui-birth-boyhood-1913-p1.jpg sha256 dbae82ab51e210edf944c1b406680aa6f0ae54d77411e6696bfe9db8fff00975. Supports facts: MUI-F-0092, MUI-F-0062. Rights basis: Published in Boston in 1913: pre-1931 US publication rule (owner). No holder statement (IA scan). Rights: the Internet Archive item's own field (an uploader's claim, not a holder statement); published in Boston in 1913. Owner ruling 2026-10-29: publications before 1931 are public domain wherever published.

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: publications before 1931 are public domain wherever published. The record's rights words are the holder page's publication date or the Internet Archive's copyright-status field (no holder rights statement exists), and the adversary refuted the licence class on that ground; the ruling covers exactly that question.

### MUI-M-0095 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Our First Wisconsin Home (The story of my boyhood and youth, by John Muir, 1913) (image) <https://archive.org/details/storyofmyboyhood00muirrich/page/n116>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Possible copyright status NOT\_IN\_COPYRIGHT" <https://archive.org/details/storyofmyboyhood00muirrich>

**Credit:** John Muir, The Story of My Boyhood and Youth (1913), illustration from a sketch by the author; scan: Internet Archive

**Alt text** (published as the image description): Our First Wisconsin Home, from a sketch by the author, in The story of my boyhood and youth, by John Muir, 1913 (MUI-F-0103, MUI-F-0100).

**Sources:** MUI-S-0135, MUI-S-0140

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** MUI-S-0135 found (https://archive.org/details/storyofmyboyhood00muirrich); MUI-S-0140 unreachable (https://archive.org/stream/storyofmyboyhood00muirrich/storyofmyboyhood00muirrich\_djvu.txt)

**Checker's reasoning:** Internet Archive labels the copyright status as possible; that wording does not strictly establish the claimed public-domain class.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): archive.org: Internet Archive, secondary

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-MUI-002, 2026-10-29). Chapter: muir/arriving. Shows: Plate caption: 'OUR FIRST WISCONSIN HOME / On the hill near the shanty built in the summer of 1849'. Holder date: 1913. Resolution: IA leaf n116 at 1500 px wide. Preview previews/mui-arriving-boyhood-1913-first-wisconsin-home.jpg sha256 3cc7193ef92bb44a8ce23246e937b62725b380f38889593d5607f1732421e495. Supports facts: MUI-F-0103, MUI-F-0100. Rights basis: Published in Boston in 1913: pre-1931 US publication rule (owner). No holder statement (IA scan). Title page says 'With illustrations from sketches by the author'. Same book as the birth and first-work plates: if the viewer groups by book, these still sit in different chapters. Rights: the Internet Archive item's own field (an uploader's claim, not a holder statement); published in Boston in 1913. Owner ruling 2026-10-29: publications before 1931 are public domain wherever published.

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: publications before 1931 are public domain wherever published. The record's rights words are the holder page's publication date or the Internet Archive's copyright-status field (no holder rights statement exists), and the adversary refuted the licence class on that ground; the ruling covers exactly that question.

### MUI-M-0096 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Muir's Lake (Fountain Lake) and the Garden Meadow (The story of my boyhood and youth, by John Muir, 1913) (image) <https://archive.org/details/storyofmyboyhood00muirrich/page/n76>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Possible copyright status NOT\_IN\_COPYRIGHT" <https://archive.org/details/storyofmyboyhood00muirrich>

**Credit:** John Muir, The Story of My Boyhood and Youth (1913), illustration from a sketch by the author; scan: Internet Archive

**Alt text** (published as the image description): Muir's Lake (Fountain Lake) and the Garden Meadow, from a sketch by the author, in The story of my boyhood and youth, by John Muir, 1913 (MUI-F-0102).

**Sources:** MUI-S-0135, MUI-S-0140

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** MUI-S-0135 found (https://archive.org/details/storyofmyboyhood00muirrich); MUI-S-0140 unreachable (https://archive.org/stream/storyofmyboyhood00muirrich/storyofmyboyhood00muirrich\_djvu.txt)

**Checker's reasoning:** Internet Archive labels the copyright status as possible; that wording does not strictly establish the claimed public-domain class.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): archive.org: Internet Archive, secondary

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-MUI-003, 2026-10-29). Chapter: muir/arriving. Shows: Plate caption: 'MUIR'S LAKE (FOUNTAIN LAKE) AND THE GARDEN MEADOW / Sketched from the roof of the Bur-Oak Shanty'. Holder date: 1913. Resolution: IA leaf n76 at 1500 px wide. Preview previews/mui-arriving-boyhood-1913-fountain-lake.jpg sha256 8370708cfe45c2e54b28713e5d6d41a83f70c128688a22e85cf6f6af31efc617. Supports facts: MUI-F-0102. Rights basis: Published in Boston in 1913: pre-1931 US publication rule (owner). No holder statement (IA scan). Optional second plate for the same chapter. Rights: the Internet Archive item's own field (an uploader's claim, not a holder statement); published in Boston in 1913. Owner ruling 2026-10-29: publications before 1931 are public domain wherever published.

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: publications before 1931 are public domain wherever published. The record's rights words are the holder page's publication date or the Internet Archive's copyright-status field (no holder rights statement exists), and the adversary refuted the licence class on that ground; the ruling covers exactly that question.

### MUI-M-0097 (disputed)

- [ ] reject
- [ ] note: 

**Item:** Combined Thermometer, Hygrometer, Barometer, and Pyrometer (The story of my boyhood and youth, by John Muir, 1913) (image) <https://archive.org/details/storyofmyboyhood00muirrich/page/n218>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "Possible copyright status NOT\_IN\_COPYRIGHT" <https://archive.org/details/storyofmyboyhood00muirrich>

**Credit:** John Muir, The Story of My Boyhood and Youth (1913), illustration from a sketch by the author; scan: Internet Archive

**Alt text** (published as the image description): Combined Thermometer, Hygrometer, Barometer, and Pyrometer, invented by the author in his boyhood, in The story of my boyhood and youth, by John Muir, 1913 (MUI-F-0091).

**Sources:** MUI-S-0135, MUI-S-0140

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict refuted; quote in snapshot yes; found in the live source unreachable; entailed no; adds information yes; atomic yes; source type right yes.

**Live check per source:** MUI-S-0135 found (https://archive.org/details/storyofmyboyhood00muirrich); MUI-S-0140 unreachable (https://archive.org/stream/storyofmyboyhood00muirrich/storyofmyboyhood00muirrich\_djvu.txt)

**Checker's reasoning:** Internet Archive labels the copyright status as possible; that wording does not strictly establish the claimed public-domain class.

**Checker's registry suggestion** (for the registry maintainer, data/registry/PROPOSED.md; it does not affect the status): archive.org: Internet Archive, secondary

**Why it is not verified:** G4: adversary verdict is refuted; G4: adversary did not find the claim entailed by the quotes; G4: adversary found the claim adds information

**Notes:** Round 9 records (research R9-M-MUI-004, 2026-10-29). Chapter: muir/first-work. Shows: Drawing of the instrument with the plate caption. Holder date: 1913. Resolution: IA leaf n218 at 1500 px wide. Preview previews/mui-firstwork-boyhood-1913-combined-thermometer.jpg sha256 872f2d88a234ee0f229999f2432618cc5fe6193ecd5e70641a85a5ed5cb4695e. Supports facts: MUI-F-0091. Rights basis: Published in Boston in 1913: pre-1931 US publication rule (owner). No holder statement (IA scan). Chapter VIII of the same book narrates the State Fair in Madison (MUI-F-0111) at leaves ~289-295 if a text page is wanted instead. Rights: the Internet Archive item's own field (an uploader's claim, not a holder statement); published in Boston in 1913. Owner ruling 2026-10-29: publications before 1931 are public domain wherever published.

**Review so far:** pending; note: 2026-10-30 project owner: Owner ruling 2026-10-29: publications before 1931 are public domain wherever published. The record's rights words are the holder page's publication date or the Internet Archive's copyright-status field (no holder rights statement exists), and the adversary refuted the licence class on that ground; the ruling covers exactly that question.

### MUI-M-0098 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** My first summer in the Sierra, by John Muir (1911) (image) <https://www.loc.gov/resource/gdc.11014183/?sp=11>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "No known restrictions on publication." <https://www.loc.gov/item/11014183/>

**Credit:** Library of Congress, General Collections; John Muir, My First Summer in the Sierra (1911)

**Alt text** (published as the image description): My first summer in the Sierra, by John Muir, 1911 (MUI-F-0141).

**Sources:** MUI-S-0136

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0136 unreachable (https://www.loc.gov/item/11014183/)

**Checker's reasoning:** no problem found

**Notes:** Round 9 records (research R9-M-MUI-005, 2026-10-29). Chapter: muir/big-work. Shows: p. 3 chapter heading '1869' and p. 4 with 'whose treasures I had tasted last summer in the Yosemite region'. Holder date: 1911. Resolution: LoC image 1280 x 2336 per page. Preview previews/mui-bigwork-my-first-summer-1911-p1.jpg sha256 850a74b41f6dfd528aab6e09422d5d709d17e2c17d8bf351c7c2792f506e40b0. Supports facts: MUI-F-0141. Rights basis: LoC 'No known restrictions on publication.' -\> public-domain under 3.4.1; also pre-1931. Also supports legacy fact MUI-F-0046 (published 1911); placed in big-work because the text is about his first Yosemite seasons.

### MUI-M-0099 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** Our national parks, by John Muir (1901) (image) <https://www.loc.gov/resource/gdcmassbookdig.ournationalparks00mu/?sp=9>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The books in this collection are in the public domain and are free to use and reuse." <https://www.loc.gov/item/01026282/>

**Credit:** Library of Congress; John Muir, Our National Parks (Houghton, Mifflin, 1901)

**Alt text** (published as the image description): Our national parks, by John Muir, Boston and New York, Houghton, Mifflin and Company, 1901 (MUI-F-0043).

**Sources:** MUI-S-0137

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source yes; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0137 found (https://www.loc.gov/resource/gdcmassbookdig.ournationalparks00mu/?st=brief)

**Checker's reasoning:** no problem found

**Notes:** Round 9 records (research R9-M-MUI-006, 2026-10-29). Chapter: muir/study. Shows: Title page with the publisher's device. Holder date: 1901. Resolution: LoC image 2012 x 3560. Preview previews/mui-study-our-national-parks-1901-title.jpg sha256 5bf345a7a5527ff0d1dcbeb1122a6d25f6c467c3d50b13250db822ef5d5874d0. Supports facts: MUI-F-0043, MUI-F-0069. Rights basis: Holder: 'public domain and free to use and reuse' (the same wording the adversary read as PD on MUI-M-0065/0066).

### MUI-M-0100 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** President Roosevelt in Yosemite (The San Francisco call (San Francisco \[Calif.\]), 1903-05-18, p. 1) (image) <https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; The San Francisco call (San Francisco \[Calif.\]), 1903-05-18

**Alt text** (published as the image description): The San Francisco call, May 18, 1903, p. 1: President Roosevelt in Yosemite (MUI-F-0086, MUI-F-0146).

**Sources:** MUI-S-0138

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30b, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0138 unreachable (https://www.loc.gov/resource/sn85066387/1903-05-18/ed-1/?sp=1)

**Checker's reasoning:** The snapshot identifies a 1903 newspaper page and contains the stated rights wording, which explicitly places U.S. newspapers older than 95 years in the public domain. The live item page could not be loaded.

**Notes:** Round 9 records (research R9-M-MUI-007, 2026-10-29). Chapter: muir/history. Shows: The item headed "President Roosevelt in Yosemite" in its column; OCR: "YOSEMITE, May 17.- President Roosevelt, John Muir and Rangers Leidig and Leonard, are encamped in the Bridal Veil meadows to-night." Holder date: 1903-05-18. Resolution: crop region 3300,4900,2200,2600 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:curiv:batch\_curiv\_etna\_ver01:data:00100480402:1903051801:0347/3300,4900,2200,2600/2000,/0/default.jpg). Preview previews/mui-history-sfcall-1903-05-18-p1.jpg sha256 258ea36218929b4d27b34a79edf910f62f556846dbfb494db8d0443a61a6687b. Supports facts: MUI-F-0086, MUI-F-0146. Rights basis: Pre-1931 US newspaper: public domain by date (owner rule: pre-1931 US publications); LoC Chronicling America statement. Headline OCR incomplete; title is descriptive. The page's drawing of the President is part of the page. Page snapshot snapshots/loc-sn85066387\_1903-05-18\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

### MUI-M-0101 (verified)

- [ ] approve
- [ ] reject
- [ ] note: 

**Item:** John Muir (Imperial Valley press (El Centro, Calif.), 1914-12-24, p. 1) (image) <https://www.loc.gov/resource/sn92070146/1914-12-24/ed-1/?sp=1>

**Licence:** public-domain; can be shown on the site

**Rights statement:** "The Library of Congress believes that the newspapers in Chronicling America are in the public domain or have no known copyright restrictions. Newspapers published in the United States more than 95 years ago are in the public domain in their entirety. Any newspapers in Chronicling America that were published less than 95 years ago are also believed to be in the public domain, but may contain some copyrighted third party materials. Researchers using newspapers published less than 95 years ago should be alert for modern content (for example, registered and renewed for copyright and published with notice) that may be copyrighted. Responsibility for making an independent legal assessment of an item and securing any necessary permissions ultimately rests with persons desiring to use the item." <https://www.loc.gov/resource/sn92070146/1914-12-24/ed-1/?sp=1>

**Credit:** Library of Congress, Chronicling America; Imperial Valley press (El Centro, Calif.), 1914-12-24

**Alt text** (published as the image description): Imperial Valley press, December 24, 1914, p. 1: John Muir died in Los Angeles (MUI-F-0081).

**Sources:** MUI-S-0139

**Independent checker:** codex:gpt-6-sol (run adv-round9-records-muir-2026-10-30b, 2026-10-30): verdict supported; quote in snapshot yes; found in the live source unreachable; entailed yes; adds information no; atomic yes; source type right yes.

**Live check per source:** MUI-S-0139 unreachable (https://www.loc.gov/resource/sn92070146/1914-12-24/ed-1/?sp=1)

**Checker's reasoning:** No problem found in the snapshot; the Library of Congress page could not be loaded for a live check.

**Notes:** Round 9 records (research R9-M-MUI-008, 2026-10-29). Chapter: muir/legacy. Shows: The item headed "John Muir dies" in its column; OCR: "Los Angeles, Dec. 24.-John Muir, one of America's greatest naturalists, father of the Sequoia and Yosemite national parks' and discoverer of Muir's glacier in Alaska, died today in Los Angeles." Holder date: 1914-12-24. Resolution: crop region 1500,3900,1900,1900 of the page (IIIF https://tile.loc.gov/image-services/iiif/service:ndnp:curiv:batch\_curiv\_mesquite\_ver02:data:sn92070146:00414189453:1914122401:1021/1500,3900,1900,1900/full/0/default.jpg). Preview previews/mui-legacy-ivpress-1914-12-24-p1.jpg sha256 86d07ed55b71a0b14c7b38db47f0360511d0570a2b36d7e0cd6fa26a8c5a0a5c. Supports facts: MUI-F-0081. Rights basis: Pre-1931 US newspaper: public domain by date (owner rule: pre-1931 US publications); LoC Chronicling America statement. Do not narrate 'father of the Sequoia and Yosemite national parks' (newspaper wording, not a verified fact). Page snapshot snapshots/loc-sn92070146\_1914-12-24\_ed-1\_sp\_1.json. rights\_url set on 2026-10-30 to the page record itself (was https://www.loc.gov/homepage/legal.html, which does not carry the Chronicling America statement; the statement is on the page record, as on the round-7 pages).

## 8. Draft content (18 units)

Each line is one unit of drafts/profile.json or of the experience chapters (content:...) and the facts it cites. Included units are in wordpress.html; withheld ones are not, for the reason given. The final export also needs, for each sentence, title and caption, a current "supported" verdict from the sentence adversary (drafts/grounding.jsonl, G6).

- [ ] profile:summary:0: John Muir was a writer, a preservationist and a conservationist. (facts MUI-F-0069, MUI-F-0078, MUI-F-0080; included)
- [ ] profile:summary:1: John Muir co-founded the Sierra Club in 1892. (facts MUI-F-0006; included)
- [ ] profile:sections:hetch-hetchy:0: John Muir and other leading preservationists signed a petition that the Society for the Preservation of National Parks submitted to Congress. (facts MUI-F-0070; included)
- [ ] profile:sections:hetch-hetchy:1: The petition urged Congress to defeat the Raker Bill, which called for a dam to be built across the Hetch Hetchy Valley. (facts MUI-F-0071; included)
- [ ] profile:sections:hetch-hetchy:title: Hetch Hetchy Valley (facts MUI-F-0070, MUI-F-0071; included)
- [ ] profile:sections:writing:0: John Muir wrote and published 12 books. (facts MUI-F-0014; included)
- [ ] profile:sections:writing:1: In 1901 Muir published Our National Parks. (facts MUI-F-0043; included)
- [ ] profile:sections:writing:2: In 1911 Muir published My First Summer in the Sierra. (facts MUI-F-0046; included)
- [ ] profile:sections:writing:title: Wrote and Published (facts MUI-F-0014, MUI-F-0043, MUI-F-0046; included)
- [ ] profile:timeline:0: John Muir co-founded the Sierra Club in 1892. (facts MUI-F-0006; included)
- [ ] profile:timeline:1: In 1901 Muir published Our National Parks. (facts MUI-F-0043; included)
- [ ] profile:timeline:2: In 1911 Muir published My First Summer in the Sierra. (facts MUI-F-0046; included)
- [ ] profile:artifacts:0: John Muir was a conservationist. (facts MUI-F-0080; included)
- [ ] profile:artifacts:1: John Muir was a preservationist. (facts MUI-F-0078; included)
- [ ] profile:artifacts:2: John Muir was a writer. (facts MUI-F-0069; included)
- [ ] profile:artifacts:3: John Muir co-founded the Sierra Club in 1892. (facts MUI-F-0006; included)
- [ ] profile:artifacts:4: John Muir was an author. (facts MUI-F-0079; included)
- [ ] profile:artifacts:5: John Muir wrote and published 12 books. (facts MUI-F-0014; included)

## 9. Avatar lines (3)

Quote lines are the inductee's exact words. Narration in the inductee's voice is shown on the site labelled "AI recreation".

- [ ] profile:avatar_lines:0 (guide, narration): John Muir was a writer, a preservationist and a conservationist. (facts MUI-F-0069, MUI-F-0078, MUI-F-0080)
- [ ] profile:avatar_lines:1 (inductee, AI recreation): I co-founded the Sierra Club in 1892. (facts MUI-F-0006)
- [ ] profile:avatar_lines:2 (inductee, AI recreation): I wrote and published 12 books. (facts MUI-F-0014)

## 10. How to cite

Generated from inductee.json for the page; it states no fact about the inductee. A how_to_cite text in drafts/profile.json is not published.

John Muir. Immigrant Hall of Honor. https://immigranthallofhonor.org/inductees/inductee-john-muir/

## 11. Gaps (17)

Parts of the life story with no verified source yet. These are not errors.

- Birth: no verified fact yet; the birth date (MUI-F-0001), birthplace (MUI-F-0074) and Scottish birth (MUI-F-0062) are disputed because the adversary could not confirm the quotes on the live pages (browser-supplied snapshots).
- Family: no verified fact yet; parents, marriage, spouse and children have no staged fact (six family candidates were deferred over the fact cap).
- Education: no verified fact yet; eleven education candidates (university attendance and years) were deferred over the fact cap, and the IHH page's education years have no independent confirmation.
- Arrival in the United States: no verified source yet for the date, port of entry or route; the only account (MUI-F-0025) is disputed and rests on one Sierra Club chronology; no passenger list was found in NARA searches.
- Immigration age: single-source and inconsistent between sources (MUI-F-0056 versus MUI-F-0024); MUI-F-0055 (settlement in Milwaukee) is single-source and differs from the verified Portage-area settlement facts.
- Citizenship: no verified fact yet; the naturalization date (MUI-F-0044) is disputed, and the 1896 voter registration (MUI-F-0053, MUI-F-0054) and 1903 passport letter (MUI-F-0022) are single-source; NARA searches found no naturalization record.
- Awards and honors: no verified fact yet; the Harvard and University of Wisconsin honorary degrees (MUI-F-0040, MUI-F-0041) are disputed and single-institution, and the Yale and University of California degrees (MUI-F-0047, MUI-F-0048) are single-source after corroboration searches found nothing.
- Death: the date of death (MUI-F-0075) is disputed and the burial place (MUI-F-0049) is single-source; only place and cause of death are verified.
- Legacy: no fact of category legacy is staged; 82 legacy candidates (namesakes, memorials, stamps, the National Historic Site) were deferred over the fact cap, and MUI-F-0073 (early wilderness advocate) is disputed.
- Sierra Club role: founding in 1892 is verified, but the incorporation account (MUI-F-0018) and the presidency (MUI-F-0019, MUI-F-0038) are disputed.
- Early career: the 1866 Indianapolis work, the 1867 walk, the 1868 arrival in San Francisco and first Yosemite visit, and the 1869 summer in the Sierra (MUI-F-0027 to MUI-F-0033) are single-source or disputed.
- Writing: the first glacier article of 1871 (MUI-F-0035) is single-source after corroboration found nothing; the 1890 Century Magazine articles (MUI-F-0020) and the first book (MUI-F-0039) are disputed.
- IHH page claims with no independent confirmation: designs at age 16 of barometers, hydrometers and clocks (MUI-F-0007 to MUI-F-0009) and the alarm clock bed (MUI-F-0010) are disputed; deferred IHH claims on locks, water wheels and a horse-feeding machine, the Yosemite National Park year, the Sierra Club founding day, education years, the John Muir Trust's place of formation, and the camping trip leading to a national park system are unconfirmed.
- Other single-source facts: Roosevelt's 1903 visit date (MUI-F-0016), the first Alaska trip destination (MUI-F-0017), the 1909 Hetch Hetchy appeal (MUI-F-0021), the 1876 forest program (MUI-F-0068), the 1849 family farm (MUI-F-0023, MUI-F-0057), the Kingston farmstead (MUI-F-0060) and the Scotland-to-Wisconsin move (MUI-F-0065); the 1880 move to Martinez (MUI-F-0036) and the 1913 Hetch Hetchy loss (MUI-F-0050) are disputed.
- Media without a usable licence: MUI-M-0006, MUI-M-0007, MUI-M-0008, MUI-M-0010, MUI-M-0012, MUI-M-0027 to MUI-M-0031 have no rights statement; MUI-M-0035 and MUI-M-0037 are disputed; MUI-M-0022, MUI-M-0023, MUI-M-0032, MUI-M-0040 and MUI-M-0041 are in copyright or need permission; MUI-M-0009, MUI-M-0017, MUI-M-0024 to MUI-M-0026, MUI-M-0033, MUI-M-0036, MUI-M-0038 and MUI-M-0039 have rights not evaluated or usage conditions.
- Searches that found nothing: Smithsonian API and site searches were rate-limited or blocked by a bot check; NARA naturalization, passport and 1849 passenger searches found no record of Muir; the Yale honorary-degree list page did not list him; the Commons record 42328 holder and the stamp search were blocked.
- Alias 'Muir, John' has no identity-fact evidence in a snapshot, so it is not used for name matching.

## 12. Rejected (10)

Kept in the log for the record; no action needed.

- MUI-F-0093: The Lorne Hotel in Dunbar, Scotland, was formerly a residence where John Muir was born.
- MUI-F-0094: The residence in Dunbar where John Muir was born remained the Muir family home until 1849.
- MUI-F-0112: In 1861 Muir enrolls at the University of Wisconsin.
- MUI-F-0114: In 1863 Muir leaves the University.
- MUI-F-0115: In 1868, in March, Muir arrives in San Francisco via the Isthmus of Panama.
- MUI-F-0116: In 1868 Muir first visited Yosemite.
- MUI-F-0117: In the fall of 1869 John Muir began his fulltime life in Yosemite Valley, where he ran a sawmill for James Hutchings.
- MUI-F-0121: In 1880 Muir rents part of the Strentzel ranch and lives in the Coleman house on the ranch.
- MUI-F-0127: Muir had the large family parlor fireplace built in the mission style after the original fireplace was destroyed in the 1906 earthquake.
- MUI-F-0130: In 1879 Muir and S. Hall Young travel together to Sitka, Stickeen River, Fairweather Mountains and Glacier Bay.
