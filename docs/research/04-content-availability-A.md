# 04 Content availability, inductees set A (Albright, Berlin, Cruz, Einstein, Hope)

Run date: 2026-10-07. Method is the same for the sister file (set B). No media was downloaded; URLs only. Every number below comes from a query listed in the Search log (end of file).

## 0. How to read the numbers (caveats first)

- LoC `search` counts (`pagination.of`) are full-text phrase matches. For Berlin and Hope they are dominated by digitized newspaper OCR (Chronicling America), so "online image" counts there (12,510 and 13,527) are NOT portraits. The reliable per-person counts are the LoC photo search (`/photos/`) and the `original-format` facet (Photo/Print/Drawing, Film/Video, Audio Recording), reported separately.
- Wikimedia Commons "template" counts are search hits on file pages that mention the name AND carry the license template. They are not category membership; a hit can be a file where the person is only mentioned. Category sizes (direct members only) are reported separately.
- Internet Archive license fields (`licenseurl`) are uploader-asserted and often wrong. A "public domain" tag is a lead, not a clearance.
- Smithsonian counts come from the si.edu search UI (the api.si.edu DEMO_KEY was rate limited, HTTP 429, so the API was not usable). "CC0" = the site's own "Free to Use (CC0)" filter (`media_usage:CC0`).
- NARA counts are catalog.archives.gov UI phrase searches (the NARA API needs a key; none was created). They include records where the name appears only inside a folder list.
- "Rights statement" text is quoted exactly as the source states it.

## 1. Summary table

| Inductee | (a) Facts | (b) PD/CC images | (c) Open A/V | (d) 3D/annotatable artifacts | (e) Rights risk (5 = low) | (f) Youth appeal (judgement) | Total /30 | Top risk |
|---|---|---|---|---|---|---|---|---|
| Madeleine Albright | 5 | 4 | 4 | 2 | 4 | 3 | 22 | Few physical artifacts; only 5 SI images, 0 CC0 |
| Irving Berlin | 4 | 3 | 4 | 3 | 3 | 2 | 19 | Later songs still copyrighted (e.g. White Christmas); estate/publisher |
| Celia Cruz | 4 | 2 | 2 | 5 | 2 | 4 | 19 | Almost no PD images/AV; music and estate copyright; CC-BY-SA photos |
| Albert Einstein | 5 | 5 | 4 | 3 | 2 | 5 | 24 | Name/likeness licensed by Hebrew University via an agent |
| Bob Hope | 5 | 4 | 4 | 2 | 3 | 2 | 20 | TV/film copyright; no digitized LoC Hope Collection; estate |

Scoring key (my rubric, applied identically to set B): 5 = abundant and clearly reusable; 3 = usable with effort or mixed rights; 1 = little or none. (f) is a judgement, not data.

## 2. Raw counts by source

### 2.1 Library of Congress (loc.gov JSON API, `?fo=json`)

| Inductee | q (phrase) total hits | Available Online (digitized facet) | Photo/Print/Drawing (facet) | `/photos/` search hits | Film/Video (facet) | Audio Recording (facet) | Manuscript/Mixed (facet) |
|---|---|---|---|---|---|---|---|
| Madeleine Albright | 265 | 86 | 23 | 23 | 22 | 2 | 109 |
| Irving Berlin | 12793 | 2485 | 61 | 61 | 70 | 13 | 57 |
| Celia Cruz | 141 | 280 | 6 | 6 | 16 | 3 | 1 |
| Albert Einstein | 5952 | 1001 | 57 | 57 | 91 | 4 | 97 |
| Bob Hope | 18986 | 910 | 170 | 170 | 169 | None | 197 |

Online-format facet (text-match, noisy): 

| Inductee | online Image | online Video | online Audio |
|---|---|---|---|
| Madeleine Albright | 80 | 22 | 2 |
| Irving Berlin | 12510 | 70 | 12 |
| Celia Cruz | 68 | 15 | 2 |
| Albert Einstein | 5021 | 91 | 1 |
| Bob Hope | 19205 | 164 | 9 |

Dedicated LoC collections found (not all verified by page fetch; loc.gov pages returned HTTP 403 to WebFetch):
- Bob Hope: the Bob Hope Collection at the Packard Campus. LoC blog post of 2018-07-05 by archivist David Jackson says the finding aid was a draft reachable only through staff of the Recorded Sound Research Center and "will not be published until the completion of this project": https://blogs.loc.gov/now-see-hear/2018/07/bob-hope-collection-update/ . A web-search summary quoted 770 linear feet text, 91 feet photographs and an estimated 10,000+ unidentified moving-image items (secondary, not verified on the LoC page). Net: huge but mostly NOT online.
- Irving Berlin: Irving Berlin Collection in the Music Division (named in web search results; not opened). "God Bless America" lyric sheet is in LoC "Songs of America" (named in search results; not opened). The Eisenhower Library holds Irving Berlin Papers (finding aid PDF: https://www.eisenhowerlibrary.gov/sites/default/files/finding-aids/pdf/berlin-irving-papers.pdf, not opened).
- Albright, Cruz, Einstein: no dedicated LoC collection found. LoC collections search (`/collections/?q=...`) returned 0 collections for Cruz and Albright, and only unrelated collections (National Press Club Speeches, Historic Sheet Music, Sigmund Freud Papers) for Hope, Berlin, Einstein. LoC has an authority-record biography page for Albright: http://www.loc.gov/item/n83125999/madeleine-albright/ .

### 2.2 National Archives catalog (UI phrase search, 2026-10-07)

| Inductee | Query | Results | Notable records |
|---|---|---|---|
| Albright | "Madeleine Albright" | 3,895 | NAID 445648827 Albright remarks at naturalization ceremony, National Archives, 2016-09-14 (photo); NAID 18471265 "Madeleine Albright Interview"; NAID 131043614 memo to President Clinton; NAID 40478374 Albright speeches (Clinton library files) |
| Berlin | "Irving Berlin" | 1,123 | NAID 641750 WWI Draft Registration Card (notes he was still a citizen or subject of Russia); NAID 491862564 photos of Eisenhower presenting gold medal; NAID 674694601 Eisenhower signing the gold-medal bill |
| Cruz | "Celia Cruz" | 184 | Clinton-library National Medal of Arts files (NAID 55031169, 40488624, 23902692, 20015051); no personal naturalization record surfaced |
| Einstein | "Albert Einstein" | 2,639 | NAID 596270 Declaration of Intention and Petition for Naturalization (Record Group 21, D.N.J.); NAID 305251/305254/305255 letters to Lt. Stephen Brunauer, Navy Bureau of Ordnance; NAID 597840 Civil Service time card |
| Hope | "Bob Hope" | 4,499 | NAID 305344 After Action Report OPERATION HOLLY (Bob Hope Christmas tours); NAID 194664 and 194433 Nixon/Hope photos; NAID 134757996 file "Bob Hope"; NAID 23903275 "Bob Hope Bosnia Video 12/20/95" |

Naturalization specifically: only Einstein's naturalization papers are surfaced as a named item (NAID 596270). Searches for `"<name>" naturalization` for Berlin, Hope, Cruz returned OR-style noise and no personal record. Albright's own naturalization (1957) is stated by the State Dept historian page, not by a NARA item found here. NARA item URLs follow `https://catalog.archives.gov/id/<NAID>` (pattern, not individually opened). US federal records are generally public domain; each item's own rights note was not read.

### 2.3 Smithsonian Open Access / 3D (si.edu search UI)

| Inductee | All results | Collection Images | CC0-filtered results (images tab) | 3D Objects | Notable |
|---|---|---|---|---|---|
| Albright | 31 | 5 | 0 | 0 | NPG.2017.17, NPG.2017.4, NMAH 1275791/2/4 |
| Berlin | 978 | 154 | 8 (4 images) | 0 | NPG.80.252, NPG.93.388.3/.4 are CC0; NMAH Weser Bros. Transposing Upright Piano (nmah_605967) |
| Cruz | 350 | 100 | 2 (1 image) | 4 | NMAAHC dress nmaahc_2013.8 is CC0; 3D: Lilac Guayabera Dress, Embroidered Fringed Poncho dress, Red Satin Cantilevered Shoes, Tree of Life |
| Einstein | 1,050 | 60 | 10 (5 images) | 0 | NPG.80.141, NPG.72.56, NPG.S.84.288 CC0 portraits; 8c Einstein stamp plate proofs (NPM) |
| Hope | 251 | 59 | 2 (1 image) | 1 (Phyllis Diller's Gag File, not Hope's) | NPG.93.376 CC0 is a mural study, not a portrait |

Cruz 3D page checked: https://www.si.edu/object/3d/lilac-guayabera-dress-worn-celia-cruz:be1b8923-8818-4d6f-a3a7-500a9776d6ae shows "Usage Conditions Apply" and "Metadata Usage: Usage conditions apply" (i.e. NOT stated CC0), credit "Gift of the Estate of Celia Cruz", record ID dpo_3d_250015, on the Smithsonian's page "Click to view download files" and "Click to view IIIF info". The other three Cruz 3D objects were found through the same listing; their usage line was not read (the fetch returned only the generic "Usage Conditions Apply" banner). Verify before relying on them.

### 2.4 Wikimedia Commons (MediaWiki API, 2026-10-07)

Direct category membership (prop=categoryinfo):

| Inductee | Category | size | files | subcats | pages |
|---|---|---|---|---|---|
| Madeleine Albright | Category:Madeleine Albright | 31 | 15 | 15 | 1 |
| Irving Berlin | Category:Irving Berlin | 91 | 86 | 4 | 1 |
| Celia Cruz | Category:Celia Cruz | 20 | 18 | 2 | 0 |
| Albert Einstein | Category:Albert Einstein | 29 | 17 | 10 | 2 |
| Bob Hope | Category:Bob Hope | 63 | 50 | 12 | 1 |

File-page search hits (namespace 6, name in quotes + filter):

| Inductee | any file | bitmap | video | audio | drawing | PD-US | PD-USGov | PD-old-70 | PD-US-expired | Cc-zero | Cc-by-sa-4.0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Madeleine Albright | 1192 | 933 | 9 | 0 | 2 | 273 | 256 | 0 | 1 | 4 | 39 |
| Irving Berlin | 694 | 397 | 5 | 69 | 0 | 259 | 35 | 2 | 247 | 7 | 7 |
| Celia Cruz | 203 | 197 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 2 | 13 |
| Albert Einstein | 3737 | 2652 | 20 | 23 | 49 | 48 | 342 | 77 | 137 | 199 | 909 |
| Bob Hope | 1520 | 1187 | 1 | 14 | 2 | 267 | 272 | 2 | 13 | 13 | 188 |

Observations: Cruz has zero PD-template hits and zero video/audio (only 2 Cc-zero and 13 CC-BY-SA mentions). Einstein dominates every column. Berlin's 69 audio hits are early (about 1910) recordings flagged Public domain; his 247 PD-US-expired hits include scans.

### 2.5 Internet Archive (advancedsearch, 2026-10-07)

| Inductee | all | movies | audio | title has name (movies) | title has name (audio) | movies tagged public-domain licenseurl | prelinger/news/classic_tv/moviesandfilms collections |
|---|---|---|---|---|---|---|---|
| Madeleine Albright | 1538 | 1319 | 96 | 169 | 20 | 3 | 82 |
| Irving Berlin | 2121 | 220 | 1578 | 16 | 59 | 9 | 72 |
| Celia Cruz | 431 | 153 | 234 | 16 | 28 | 4 | 29 |
| Albert Einstein | 6741 | 1908 | 2249 | 142 | 52 | 49 | 191 |
| Bob Hope | 4778 | 1173 | 433 | 152 | 91 | 105 | 191 |

The "movies tagged public-domain" counts are inflated by false matches (e.g. for Cruz and Albright the top hits are unrelated children's TV and a French radio clip). Only the title-matched items below are meaningful.

## 3. Per-inductee detail

### 3.1 Madeleine Albright

**Facts (authoritative).** U.S. Department of State, Office of the Historian: https://history.state.gov/departmenthistory/people/albright-madeleine-korbel : born Marie Jean "Madlenka" Korbel, 15 May 1937, Prague; family immigrated to Denver after the 1948 communist coup; "became a U.S. citizen in 1957"; B.A. Wellesley 1959; Ph.D. Columbia 1976; nominated first woman Secretary of State 5 Dec 1996, confirmed 22 Jan 1997, served to 20 Jan 2001; life 1937-2022. LoC also has an authority/biography page (link above). Federal-government sources are the richest fact base of the five.

**Best items**
- NARA: "Madeleine Albright Make Remarks During the Naturalization Ceremony at the National Archives in Washington, D.C." (NAID 445648827, 2016-09-14), https://catalog.archives.gov/id/445648827 , photo, US federal record (item rights note not read).
- LoC photos (CQ Roll Call collection): https://www.loc.gov/item/2019638152/ "[White House event on the chemical weapons convention treaty]" 1997-04-04, rights: "No known restrictions on work by staff photographers. Other material may be restricted by copyright. Privacy and publicity rights may also apply."
  - Madeleine Albright: Wanted for war crimes and crimes against humanity in... | 2000-01-01 | http://www.loc.gov/item/2022666416/ | photo | rights: "Publication may be restricted. See "Jos Sances -- Rights and Restrictions Information https://www.loc.gov/rr/print/res/779_sanc.html"
  - NATO enlargement costs | 1997-10-21 | http://www.loc.gov/item/2019640182/ | photo | rights: "No known restrictions on work by staff photographers. Other material may be restricted by copyright. Privacy and publicity rights may also apply. For information see: "CQ Roll Call Photograph Collecti"
  - [White House event on the chemical weapons convention treaty] | 1997-04-04 | http://www.loc.gov/item/2019638152/ | photo | rights: "No known restrictions on work by staff photographers. Other material may be restricted by copyright. Privacy and publicity rights may also apply. For information see: "CQ Roll Call Photograph Collecti"
- LoC video (event recordings): 
  - Madeleine Albright: 2018 National Book Festival | 2018 | http://www.loc.gov/item/2021692298/ | LoC | rights: not stated in search record
  - Madeleine Albright: National Book Festival 2020 | 2020 | http://www.loc.gov/item/2024697140/ | LoC | rights: not stated in search record
  - Madeleine Albright & Colin Powell: Finding Shared Values for U.S. Foreign Policy | 2015 | http://www.loc.gov/item/2021689839/ | LoC | rights: not stated in search record
- Commons PD (US gov): 
  - An expanded meeting before the press conference also took place in St. Catherine's Ha | Taken on 4 June 2000 | https://commons.wikimedia.org/wiki/File:An_expanded_meeting_before_the_press_conference_also_took_place_in_St._Catherine%27s_Hall.jpg | license shown: Public domain
  - Madeleine Albright, Summit on Race 2019.jpg | 2019-04-09 15:13:26 | https://commons.wikimedia.org/wiki/File:Madeleine_Albright,_Summit_on_Race_2019.jpg | license shown: Public domain
  - President Clinton makes remarks to the Embassy community, before he departs for Berli | Taken on 1 June 2000 | https://commons.wikimedia.org/wiki/File:President_Clinton_makes_remarks_to_the_Embassy_community,_before_he_departs_for_Berlin,_Germany.jpg | license shown: Public domain
- Commons video (Public domain, White House/State video): 
  - Denial of CIA's involvement in 1953 Iranian coup d'état by American government offici | 2019-08-20 | https://commons.wikimedia.org/wiki/File:Denial_of_CIA%27s_involvement_in_1953_Iranian_coup_d%27%C3%A9tat_by_American_government_official_Brian_Hook_in_2019.webm | license shown: Public domain
  - Photo-Op w President Clinton and President Moi (2000).webm | Taken on 17 February | https://commons.wikimedia.org/wiki/File:Photo-Op_w_President_Clinton_and_President_Moi_(2000).webm | license shown: Public domain
  - President Biden Addresses the Nation - Oct 20, 2023.webm | 2023-10-20 | https://commons.wikimedia.org/wiki/File:President_Biden_Addresses_the_Nation_-_Oct_20,_2023.webm | license shown: Public domain
- Internet Archive: 
  - Conversation with Madeleine Albright | 2008-01-01 | https://archive.org/details/ConversationWithMadeleineAlbright | licenseurl: http://creativecommons.org/licenses/by-nc-nd/3.0/us/
  - Madeleine Albright Read My Pins | n.d. | https://archive.org/details/WinCAM-MadeleineAlbrightReadMyPins204 | licenseurl: http://creativecommons.org/licenses/by/2.0/
  - National Book Festival - Madeleine Albright, "Hell and Other Destinations" : CSP | 2020-11-07 | https://archive.org/details/CSPAN2_20201107_210000_National_Book_Festival_-_Madeleine_Albright_Hell_and_Other_Destinations | licenseurl: None

**Artifacts.** Smithsonian has 5 collection images (NPG portraits, NMAH items) and no 3D; none CC0. Weak for 3D.
**Rights risks.** U.S. government works (State Dept, White House, Clinton library) are the safe core. Her books and press interviews are copyrighted. IA talks tagged CC BY-NC-ND (NC/ND = unusable in a derivative showcase). Right-of-publicity: none found; not verified for her estate.
**Score evidence.** (a)5 State Dept + NARA 3,895 + LoC bio. (b)4 Commons 256 PD-USGov hits, LoC CQ photos "no known restrictions on work by staff photographers"; SI CC0 = 0. (c)4 Commons 9 video hits with PD license (2000-era White House video), LoC 22 online videos (mostly events). (d)2 no 3D, 5 SI images. (e)4. (f)3 judgement: historic first, but mainly older audiences; strongest hook is the refugee-to-Secretary story and 2016 naturalization-ceremony speech at the Archives.

### 3.2 Irving Berlin

**Facts (authoritative).** Britannica (https://www.britannica.com/biography/Irving-Berlin , page dated 2026-09-18): born Israel Baline 11 May 1888, most likely Tyumen, Russia; died 22 Sep 1989, New York; family immigrated to NYC 1893; first published song "Marie from Sunny Italy" 1907, a printer's error produced the name Irving Berlin; "wrote more than 800 songs as well as scores for 19 Broadway shows and 18 movies"; could not read or write notation. NARA primary source: WWI draft card NAID 641750 noting he remained a citizen or subject of Russia in 1917-18 (so naturalization came later; not verified here). NARA also holds Eisenhower gold-medal photos (NAID 491862564, 674694601; gold medal authorized by Congress for "God Bless America" and other patriotic songs, per the NARA description).

**Best items**
- LoC photos: 
  - Irving Berlin | 1948-01-01 | http://www.loc.gov/item/2004671940/ | photo | rights: "No known restrictions on publication."
  - Irving Berlin's White Christmas | 1954-01-01 | http://www.loc.gov/item/2012649453/ | photo | rights: "Rights status not evaluated. For general information see "Copyright and Other Restrictions...," https://www.loc.gov/rr/print/195_copr.html"
  - Irving Berlin & wife (Ellen Mackay) | 1900-01-01 | http://www.loc.gov/item/2014719046/ | photo | rights: "No known restrictions on publication. For more information, see George Grantham Bain Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/274_bain.html"
  - Irving Berlin | 19?? | http://www.loc.gov/item/2025386333/ | photo | rights: ""
  - Irving Berlin and wife who died | 1920-01-01 | http://www.loc.gov/item/2014714189/ | photo | rights: "No known restrictions on publication. For more information, see George Grantham Bain Collection - Rights and Restrictions Information https://www.loc.gov/rr/print/res/274_bain.html"
- LoC audio (National Jukebox, pre-1923 recordings): 
  - Porcelain maid | 1922-12-06 | http://www.loc.gov/item/jukebox-669648/ | LoC | rights: "Inclusion of the recording in the National Jukebox, courtesy of Sony Music Entertainment or EMI Music"
  - Music of Irving Berlin, 1950 | n.d. | http://www.loc.gov/item/muskostelanetz.1005162/ | LoC | rights: "No known restrictions on use or reproduction."
  - Lady of the evening | 1922-12-06 | http://www.loc.gov/item/jukebox-669652/ | LoC | rights: "Inclusion of the recording in the National Jukebox, courtesy of Sony Music Entertainment or EMI Music"
- LoC video: 
  - Now It Can Be Told: The Unknown Irving Berlin | 2009 | http://www.loc.gov/item/2021688214/ | LoC | rights: not stated in search record
  - Haven to Home: An American Journey | 2004 | http://www.loc.gov/item/2021687700/ | LoC | rights: not stated in search record
- Commons audio (Public domain license shown): 
  - IrvingBerlin-FollowtheCrowd2.ogg | None | https://commons.wikimedia.org/wiki/File:IrvingBerlin-FollowtheCrowd2.ogg | license shown: Public domain
  - IrvingBerlin-OhHowThatGermanCouldLove.ogg | 1910 | https://commons.wikimedia.org/wiki/File:IrvingBerlin-OhHowThatGermanCouldLove.ogg | license shown: Public domain
  - Irving Berlin - Draggy Rag (1910).ogg | 2025-01-02 | https://commons.wikimedia.org/wiki/File:Irving_Berlin_-_Draggy_Rag_(1910).ogg | license shown: Public domain
- Commons video (Public domain): 
  - Always by Irving Berlin in Lonesome (1928).webm | 1928-09-30 | https://commons.wikimedia.org/wiki/File:Always_by_Irving_Berlin_in_Lonesome_(1928).webm | license shown: Public domain
  - Célèbre pas de l'ours (extrait, 1912).webm | 1912 | https://commons.wikimedia.org/wiki/File:C%C3%A9l%C3%A8bre_pas_de_l%27ours_(extrait,_1912).webm | license shown: Public domain
- Commons PD gov: 
  - Bob Hope and Irving Berlin Shakes Hands on Stage at a White House Dinner Held in Hono | 24 May 1974 | https://commons.wikimedia.org/wiki/File:Bob_Hope_and_Irving_Berlin_Shakes_Hands_on_Stage_at_a_White_House_Dinner_Held_in_Honor_of_Returning_Vietnam_Prisoners_of_War_-_DPLA_-_64d50ccef7c3c9f46a7c1cc6a280defe.jpg | license shown: Public domain
  - Irving Berlin aboard the USS Arkansas, 944.jpg | 1944 | https://commons.wikimedia.org/wiki/File:Irving_Berlin_aboard_the_USS_Arkansas,_944.jpg | license shown: Public domain
  - President Richard Nixon Sings "God Bless America" with Composer Irving Berlin during  | 24 May 1973 | https://commons.wikimedia.org/wiki/File:President_Richard_Nixon_Sings_%22God_Bless_America%22_with_Composer_Irving_Berlin_during_the_Vietnam_POW_Dinner_at_the_White_House_-_DPLA_-_5848837ece6db5c86bfe9024351eb0e5.jpg | license shown: Public domain
- Internet Archive: 
  - Truth About Taxes, The | 1940-01-01 | https://archive.org/details/TruthAbo1940 | licenseurl: http://creativecommons.org/licenses/publicdomain/
  - Liberty | n.d. | https://archive.org/details/Liberty_2 | licenseurl: http://creativecommons.org/licenses/publicdomain/
  - The Army-Navy Screen Magazine 31 | 1944-01-01 | https://archive.org/details/Army-NavyScreenMagazine31 | licenseurl: http://creativecommons.org/publicdomain/mark/1.0/
  - This Is The Army - 1943 Musical Comedy Film | n.d. | https://archive.org/details/this-is-the-army-1943-hd-restored-full-movie | licenseurl: http://creativecommons.org/publicdomain/mark/1.0/
- Smithsonian CC0 portraits: https://www.si.edu/object/irving-berlin:npg_NPG.80.252 ; https://www.si.edu/object/irving-berlin:npg_NPG.93.388.3 ; https://www.si.edu/object/irving-berlin:npg_NPG.93.388.4 . Artifact: Weser Bros. Transposing Upright Piano, https://www.si.edu/object/weser-bros-transposing-upright-piano:nmah_605967 (the listing returned the title only; the Berlin link to this piano is by title/search, and its rights and CC0 status were not confirmed).

**Rights risks.** Compositions first published before 1931 are public domain in the US as of 2026 (95-year term; that is my legal inference, confirm with counsel), so early works (ragtime, WWI-era) are safe; later songs are not. Web search summary: "The Irving Berlin Music Company" holds the licences, administered by Concord Music; "White Christmas" is still under copyright (search-result summary, secondary source). LoC National Jukebox recordings carry the statement "Inclusion of the recording in the National Jukebox, courtesy of Sony Music Entertainment or EMI Music" (listening/streaming use, not a CC0 grant). irvingberlin.com is the estate-run site.
**Score evidence.** (a)4 Britannica, NARA 1,123, LoC; fewer official bio pages than government figures. (b)3 LoC 61 photo records (some "No known restrictions on publication."), Commons 247 PD-US-expired hits, SI CC0 only 4. (c)4 Commons 69 audio and 5 video hits; PD period sound/film clips; note that "Always" 1928 clip is a film excerpt. (d)3 piano at NMAH, sheet music; no 3D confirmed. (e)3. (f)2 judgement: songs are everywhere (White Christmas, God Bless America) but the person is not.

### 3.3 Celia Cruz

**Facts (authoritative).** Britannica (https://www.britannica.com/biography/Celia-Cruz , page dated 2026-10-01): born 21 Oct 1925 Havana; died 16 Jul 2003 Fort Lee, New Jersey; replaced Myrta Silva as lead singer of La Sonora Matancera in 1950, the ensemble's first Black front person; left Cuba after the 1959 Revolution (to Mexico with the band; the page excerpt read here was cut off before the U.S. move, so the year of U.S. residency and naturalization were not verified from it). Official site: https://celiacruz.com/ (footer: "© 2026 Copyright Celia Cruz"; Centennial banner, sections Biography, Foundation, Legacy, Gallery). NARA shows her in Clinton-library National Medal of Arts files (1994; NAID 55032342 "National Medal of Arts, 1994 [binder 1] [4]" and others). Smithsonian NMAH organized the exhibition "¡Azúcar! The Life and Music of Celia Cruz" (confirmed by web-search summary and the Celia Cruz Foundation news post https://celiacruzfoundation.com/2012/05/01/smithsonians-national-museum-of-american-history-presents-azucar-the-live-and-music-of-celia-cruz/ ).

**Best items**
- LoC photo, 1962: 
  - [Celia Cruz, full-length portrait, facing front, on stage] | 1962-01-01 | http://www.loc.gov/item/97504385/ | photo | rights: "No known restrictions on publication. No copyright renewal found in U.S. Copyright Office, 2012. No information on creator or on reproduction rights found with the image, 1997."
  - "La Reina Celia" Celia Cruz mural, E. 103rd St. and Lexington Ave., East Harlem | 2023-04-07 | http://www.loc.gov/item/2024695113/ | photo | rights: "Publication may be restricted. For information see: "Camilo Vergara...," https://hdl.loc.gov/loc.pnp/res.619.verg"
  - Singer Celia Cruz, "Yo soy de Cuba la voz - Guantanamera," at Fairchild Tropical | 1994-01-01 | http://www.loc.gov/item/2021649713/ | photo | rights: "Publication may be restricted. For information see "Annenberg Space for Photography," https://www.loc.gov/rr/print/res/754_anne.html"
  - Portrait of Celia Cruz on the wall of Amor Cubano, E. 111th St. and Third Ave.,  | 2023-11-07 | http://www.loc.gov/item/2024696300/ | photo | rights: "Publication may be restricted. For information see: "Camilo Vergara...," https://hdl.loc.gov/loc.pnp/res.619.verg"
  - Fashion designer Narciso Rodríguez with Celia Cruz at his atelier on a Friday b | 2003-01-01 | http://www.loc.gov/item/2021643226/ | photo | rights: "Publication may be restricted. For information see "Annenberg Space for Photography," https://www.loc.gov/rr/print/res/754_anne.html"
  - Ritmo en el Corazón [album cover] | None | http://www.loc.gov/item/awhbib000034/ | photo | rights: ""
- Smithsonian 3D (Usage conditions apply, Gift of the Estate of Celia Cruz): https://www.si.edu/object/3d/lilac-guayabera-dress-worn-celia-cruz:be1b8923-8818-4d6f-a3a7-500a9776d6ae ; https://www.si.edu/object/3d/embroidered-fringed-poncho-dress-worn-celia-cruz:d0da63a8-bfa3-499a-8887-6637b3fdd71b ; https://www.si.edu/object/3d/red-satin-cantilevered-shoes-worn-celia-cruz:9e9c4045-03bc-4b18-a081-4548ff85225e
- Smithsonian CC0 artifact: Dress worn by Celia Cruz (NMAAHC, 1970s), https://www.si.edu/object/dress-worn-celia-cruz:nmaahc_2013.8 . Other NMAH Cruz objects (portrait nmah_1812297, shoes nmah_834815, "Cuban flag bata cubana" nmah_1982092, dress nmah_1936850) listed in search; rights not read.
- Internet Archive (titles name her; license not stated): 
  - CELIA CRUZ HECTOR LAVOE SHAKIRA Y OTROS MAS LES CANTAN A SATANAS ( The House Of  | n.d. | https://archive.org/details/CELIACRUZHECTORLAVOESHAKIRAYOTROSMASLESCANTANASATANASTheHouseOfJoseph | licenseurl: None
  - Celia Cruz All Stars | 2018-12-07 | https://archive.org/details/mirmfl-Celia_Cruz_All_Stars | licenseurl: None
  - Celia Cruz en Concierto | n.d. | https://archive.org/details/Celia_Cruz_en_Concierto | licenseurl: None
  - Celia Cruz Exhibition & Concert | 2019-10-01 | https://archive.org/details/bronxny-Celia_Cruz_Exhibition_Concert | licenseurl: None
- LoC video: no Cruz footage; the 15 "online video" hits are National Book Festival events (e.g. http://www.loc.gov/item/2021691333/ , Monica Brown & Rafael Lopez, 2013 National Book Festival) where her name appears in text, not her performances.

**Rights risks (highest of the five).** Her recordings (Sony/Fania etc.) are in copyright; the estate publishes under "© 2026 Copyright Celia Cruz". Photos on Commons are mostly CC-BY-SA (13 template hits) rather than PD. 3D scans are "Usage conditions apply", not CC0. The LoC 1962 photo says "No known restrictions on publication. No copyright renewal found in U.S. Copyright Office, 2012. No information on creator or on reproduction rights found with the image, 1997." which is a usable but uncertain status.
**Score evidence.** (a)4 Britannica, Smithsonian exhibition, NARA 184, official site; no government bio page. (b)2 Commons 197 bitmaps but 0 PD template hits; LoC 6 photos; SI 1 CC0 image. (c)2 Commons 0 video/audio; IA has 234 audio items but unlicensed; no open performance footage found. (d)5 four Smithsonian 3D objects plus NMAH/NMAAHC wardrobe: the best artifact set of the five. (e)2. (f)4 judgement: fashion, Latin music, and global-icon appeal ("¡Azúcar!"), 2025 centennial buzz, but audio cannot be used freely.

### 3.4 Albert Einstein

**Facts (authoritative).** Nobel Prize site https://www.nobelprize.org/prizes/physics/1921/einstein/facts/ : born 14 March 1879 Ulm, Germany; died 18 April 1955 Princeton, NJ; Physics 1921 "for his services to Theoretical Physics, and especially for his discovery of the law of the photoelectric effect"; received the prize in 1922; after the Nazis seized power he immigrated to the US (Institute for Advanced Study, Princeton). NARA naturalization record: NAID 596270 "Declaration of Intention and Petition for Naturalization for Albert Einstein" (includes a Certificate of Arrival, Declaration of Intention, Petition and Oath of Allegiance), https://catalog.archives.gov/id/596270 ; the Commons copy: https://commons.wikimedia.org/wiki/File:Declaration_of_Intention_for_Albert_Einstein,_10-01-1940_(596270_).jpg (license shown: Public domain). Einstein Archives Online (Hebrew University): per web-search summary, over 80,000 records online since 19 March 2012; the site itself was not opened.

**Best items**
- LoC photos: 
  - Albert Einstein, 1879-1955 | 1947-01-01 | http://www.loc.gov/item/2004671908/ | photo | rights: "No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)."
  - Albert Einstein | 1920-01-01 | http://www.loc.gov/item/92519646/ | photo | rights: ""
  - Albert Einstein | 1947 | http://www.loc.gov/item/2008677089/ | photo | rights: "Publication may be restricted. For information see "Philippe Halsman" https://www.loc.gov/rr/print/res/230_hal.html"
  - Albert Einstein lived here | 1955-04-19 | http://www.loc.gov/item/00652204/ | photo | rights: "Publication may be restricted. For information see "Herbert Block ("Herblock") Rights and Restrictions," https://www.loc.gov/rr/print/res/271_herb.html"
  - Albert Einstein #7 | 1940-01-01 | http://www.loc.gov/item/2005678118/ | photo | rights: "Rights status not evaluated. For general information see "Copyright and other Restrictions..." https://www.loc.gov/rr/print/195_copr.html"
- NARA: NAID 305251 (letter to Lt. Stephen Brunauer re consultant appointment and naturalization papers), NAID 597840 (Civil Service time card, WWII consultant).
- Commons PD (gov / old): 
  - A. Einstein USA Jan1936.jpg | 1936-01 | https://commons.wikimedia.org/wiki/File:A._Einstein_USA_Jan1936.jpg | license shown: Public domain
  - Declaration of Intention for Albert Einstein, 10-01-1940 (596270 ).jpg | 1936-01-15 | https://commons.wikimedia.org/wiki/File:Declaration_of_Intention_for_Albert_Einstein,_10-01-1940_(596270_).jpg | license shown: Public domain
  - Hans Albert Einstein (1904-1973) Declaration of Intention (1938).jpg | 1938 | https://commons.wikimedia.org/wiki/File:Hans_Albert_Einstein_(1904-1973)_Declaration_of_Intention_(1938).jpg | license shown: Public domain
  - Churchill and Einstein in 1933.jpg | 1933-05-31 | https://commons.wikimedia.org/wiki/File:Churchill_and_Einstein_in_1933.jpg | license shown: Public domain
  - ETH-BIB-Einstein, Albert (1879-1955)-Portrait-Portr 05936.tif | 1912<div style="disp | https://commons.wikimedia.org/wiki/File:ETH-BIB-Einstein,_Albert_(1879-1955)-Portrait-Portr_05936.tif | license shown: Public domain
  - ETH-BIB-Einstein, Albert (1879-1955) im Patentamt Bern-Portrait-Portr 05937.tif | circa 1905<div style | https://commons.wikimedia.org/wiki/File:ETH-BIB-Einstein,_Albert_(1879-1955)_im_Patentamt_Bern-Portrait-Portr_05937.tif | license shown: Public domain
- Commons video/audio (mostly CC BY-SA, about him, not by him): 
  - Albert Einstein childhood image collage slideshow.webm | 2018-11-08 | https://commons.wikimedia.org/wiki/File:Albert_Einstein_childhood_image_collage_slideshow.webm | license shown: CC BY-SA 4.0
  - Albert Einstein vis-a-vis Manhattern Project.webm | 2018-11-08 | https://commons.wikimedia.org/wiki/File:Albert_Einstein_vis-a-vis_Manhattern_Project.webm | license shown: CC BY-SA 4.0
- Internet Archive newsreel: 
  - Albert Einstein Comes To America | 1933-01-01 | https://archive.org/details/CEP_00_011 | licenseurl: http://creativecommons.org/licenses/publicdomain/
  (also "Albert Einstein as a child", https://archive.org/details/AlbertEinsteinAsAChild, licenseurl http://creativecommons.org/licenses/by/3.0/)
- Smithsonian CC0 portraits: https://www.si.edu/object/albert-einstein:npg_NPG.80.141 ; https://www.si.edu/object/albert-einstein:npg_NPG.72.56 ; plus 8c Einstein stamp plate proofs (NPM).

**Rights risks.** Web-search summaries (secondary): Einstein bequeathed his writings' rights to Hebrew University; GreenLight LLC licenses the name "Albert Einstein" and likenesses as agent for the Hebrew University; Hebrew University claims the right of publicity. (My search did not find Authentic Brands in connection with Einstein; the brief's mention was not confirmed.) Implication: historic photos can be PD but commercial use of name or likeness may draw a claim; for a non-commercial educational showcase, prefer documents (naturalization papers) over merchandising-style portraits, and add a disclaimer. His own voice: no clean open recording was verified in this run.
**Score evidence.** (a)5 Nobel + NARA + LoC + 80k-record archive. (b)5 Commons 3,737 file hits, 342 PD-USGov, 77 PD-old-70, 199 Cc-zero; SI 5 CC0 images; LoC 57 photos. (c)4 Commons 20 video/23 audio hits (CC BY-SA mostly), IA 1933 newsreel with PD licenseurl (uploader-asserted), LoC 91 video (mostly educational webinars). (d)3 no SI 3D (0), but annotatable primary documents (naturalization papers, letters) abound. (e)2. (f)5 judgement: most recognisable science figure; immigrant refugee story; very strong with students.

### 3.5 Bob Hope

**Facts (authoritative).** Britannica (https://www.britannica.com/biography/Bob-Hope , dated 2026-09-16): born Leslie Townes Hope 29 May 1903 Eltham near London; died 27 Jul 2003 Toluca Lake, California; family immigrated to the US when he was four (about 1908); grew up in Cleveland; Broadway debut Sidewalks of New York (1927); film debut The Big Broadcast of 1938 where he first sang "Thanks for the Memory"; radio show from 1938; decades of overseas USO tours. NARA: NAID 305344 After Action Report for OPERATION HOLLY (Bob Hope Christmas Tours); Nixon and Reagan White House photos. Kennedy Center Honors: a Commons PD photo shows Reagan and Hope at the Kennedy Center Honors, 8 Dec 1985 (file title below); the Kennedy Center Honors site itself was not queried.

**Best items**
- LoC photos (1985 USO building dedication, all "No known restrictions on publication."): 
  - Dedication on May 30, 1985 of the USO headquarters building as the "Bob Hope Bui | 1985-01-01 | http://www.loc.gov/item/2011632653/ | photo | rights: "No known restrictions on publication."
  - Dedication on May 30, 1985 of the USO headquarters building as the "Bob Hope Bui | 1985-01-01 | http://www.loc.gov/item/2011632654/ | photo | rights: "No known restrictions on publication."
  - Dedication on May 30, 1985 of the USO headquarters building as the "Bob Hope Bui | 1985-01-01 | http://www.loc.gov/item/2011632655/ | photo | rights: "No known restrictions on publication."
- LoC video / audio: 
  - Richard Zoglin: 2015 National Book Festival | 2015 | http://www.loc.gov/item/2021691181/ | LoC | rights: not stated in search record
  - Danny Kaye - golfing | n.d. | http://www.loc.gov/item/ihas.200198133/ | LoC | rights: "No known restrictions on use or reproduction."
  - The all-star bond rally | 1945 | http://www.loc.gov/item/2018601425/ | LoC | rights: not stated in search record
  - Bob Hope speech at the National Press Club, 1980-07-08 | 1980 | http://www.loc.gov/item/mbrsrsdig2282042/ | LoC | rights: "Restrictions apply. Refer to https://lccn.loc.gov/93842085"
- Commons PD (US government photos / DPLA presidential audio): 
  - Bob Hope and Irving Berlin Shakes Hands on Stage at a White House Dinner Held in Hono | 24 May 1974 | https://commons.wikimedia.org/wiki/File:Bob_Hope_and_Irving_Berlin_Shakes_Hands_on_Stage_at_a_White_House_Dinner_Held_in_Honor_of_Returning_Vietnam_Prisoners_of_War_-_DPLA_-_64d50ccef7c3c9f46a7c1cc6a280defe.jpg | license shown: Public domain
  - King Fahd International Airport - USO Show Bob Hope Betty White.JPG | 1990 | https://commons.wikimedia.org/wiki/File:King_Fahd_International_Airport_-_USO_Show_Bob_Hope_Betty_White.JPG | license shown: Public domain
  - President Ronald Reagan Gerald Ford and Bob Hope at The Dinner for The 40Th Anniversa | 17 October 1981 | https://commons.wikimedia.org/wiki/File:President_Ronald_Reagan_Gerald_Ford_and_Bob_Hope_at_The_Dinner_for_The_40Th_Anniversary_of_United_Service_Organizations_(USO)_at_The_Washington_Hilton_Hotel_-_DPLA_-_529428b16a23bdddb239563b8e0a5ceb.jpg | license shown: Public domain
  - Remarks by President Ronald Reagan at photo op session with Gerald Ford, Nancy Ronald | 17 October 1981 | https://commons.wikimedia.org/wiki/File:Remarks_by_President_Ronald_Reagan_at_photo_op_session_with_Gerald_Ford,_Nancy_Ronald_Reagan,_Bob_Hope,_Marie_Osmond,_Phyllis_George_Brown._Washington_Hilton_Hotel_in_Washington,_DC_-_DPLA_-_c12e59c60253535dad3a697e53c64939.mp3 | license shown: Public domain
  - Remarks by President Ronald Reagan during taping session for Bob Hope TV special. Lin | 19 May 1983 | https://commons.wikimedia.org/wiki/File:Remarks_by_President_Ronald_Reagan_during_taping_session_for_Bob_Hope_TV_special._Lincoln_Bedroom._-_DPLA_-_3a68823abfdd2bf0830c1f27740cc26d.mp3 | license shown: Public domain
- Internet Archive: 
  - Thanks For The Memories (Bob Hope Special) | 1964-01-01 | https://archive.org/details/Bob_Hope_Thanks_For_The_Memories | licenseurl: None
  - The Cat And The Canary 1939 (Bob Hope) | 1939-11-29 | https://archive.org/details/thecatandthecanary1939bobhopepaulettegoddardgalesondergaard | licenseurl: None
  - The Bob Hope Show, Christmas In Vietnam | 1964-01-01 | https://archive.org/details/ChristmasInVietnam | licenseurl: http://creativecommons.org/publicdomain/mark/1.0/
  - The Star Spangled Revue with Bob Hope | n.d. | https://archive.org/details/starspangledrevue | licenseurl: http://creativecommons.org/licenses/publicdomain/
  (also "My Favorite Brunette" 1947, https://archive.org/details/my_favorite_brunette, licenseurl http://creativecommons.org/licenses/publicdomain/ (uploader-asserted; do not rely on it))
- Smithsonian: https://www.si.edu/object/bob-hope:npg_S_NPG.87.2 (NPG portrait; not CC0).

**Rights risks.** Films and TV shows are copyrighted unless proven otherwise (IA tags are unverified). Bob Hope Enterprises is reported (secondary web results, low quality) to license name/likeness; I found no authoritative page. Bob & Dolores Hope Foundation site (bobhope.org) is a grant foundation, not an archive. The LoC Bob Hope Collection is the biggest asset but, as of the 2018 LoC post, the finding aid was unpublished and access was by staff.
**Score evidence.** (a)5 NARA 4,499, LoC 170 photos plus 169 film/video records, Britannica. (b)4 Commons 272 PD-USGov + 267 PD-US hits, LoC "No known restrictions" photos, SI CC0 1 (non-portrait). (c)4 IA has title-matched shows, 105 PD-tagged hits (noisy), Commons audio of Reagan remarks about Hope (PD), but Hope's own performances are rights-encumbered. (d)2 no confirmed 3D; collection is physical and mostly not digitized. (e)3. (f)2 judgement: USO and immigrant-comedian story is strong but the humour and name are dated for teens.

## 4. Cross-cutting conclusions (set A only)

1. Einstein (24) leads on volume, image and document availability, but carries the clearest licensing risk (Hebrew University via an agent).
2. Albright (22) is the safest: government sources everywhere, but thin on objects.
3. Hope (20) and Berlin (19) and Cruz (19) are close. Cruz is the only one with 3D-ready artifacts (Smithsonian), but her media is the least open.
4. Suggested handling for a showcase: build from federal records (NARA, LoC photos with "no known restrictions"), Commons files with PD templates verified individually, and Smithsonian CC0 items; treat IA license tags and all music as leads to verify.

## 5. Issues encountered

- api.si.edu DEMO_KEY returned HTTP 429 (retry-after 17281 s, shared quota with another process on this machine). Did not create an API key. Used the si.edu search UI instead.
- loc.gov returned HTTP 403 to a default curl; with a descriptive User-Agent it worked. WebFetch got HTTP 403 for loc.gov, nobelprize.org, britannica.com and collections.si.edu; used the Browser pane for those. The loc.gov `fa=original-format:...` facet filters returned a redirect/empty body via curl, so format counts come from the unfiltered query's facet block instead.
- catalog.archives.gov API requires a key; UI used. An attempt to open the Eisenhower Library finding-aid PDF in the browser triggered a download save-dialog (nothing was saved by me).
- albert-einstein.org navigation was denied by the browser tool; Einstein Archives Online, Kennedy Center Honors, Nobel pages for others, National Inventors Hall of Fame, Biography.com, and Albright's Britannica page were NOT queried.
- The working scratchpad was shared with the sister research agent: my first scripts were overwritten and I re-ran everything in a private subfolder; a `pkill -f "python3 loc.py"` I issued may have stopped a sister-agent process of the same name, so set B's LoC results should be re-checked for completeness.
- Net unverified: LoC dedicated-collection details (HTTP 403), Einstein Archives Online size and terms, Hope estate licensing, Berlin copyright administrator (secondary web summaries only).

## 6. Search log (all dated 2026-10-07)

### 6.1 LoC search API (curl, User-Agent "IHH-research/1.0 (hackathon)")

- Madeleine Albright / all -> total 265 : https://www.loc.gov/search/?q=%22Madeleine+Albright%22&fo=json&c=8
- Madeleine Albright / online_image -> total 80 : https://www.loc.gov/search/?q=%22Madeleine+Albright%22&fo=json&c=8&fa=online-format%3Aimage
- Madeleine Albright / online_video -> total 22 : https://www.loc.gov/search/?q=%22Madeleine+Albright%22&fo=json&c=8&fa=online-format%3Avideo
- Madeleine Albright / online_audio -> total 2 : https://www.loc.gov/search/?q=%22Madeleine+Albright%22&fo=json&c=8&fa=online-format%3Aaudio
- Irving Berlin / all -> total 12793 : https://www.loc.gov/search/?q=%22Irving+Berlin%22&fo=json&c=8
- Irving Berlin / online_image -> total 12510 : https://www.loc.gov/search/?q=%22Irving+Berlin%22&fo=json&c=8&fa=online-format%3Aimage
- Irving Berlin / online_video -> total 70 : https://www.loc.gov/search/?q=%22Irving+Berlin%22&fo=json&c=8&fa=online-format%3Avideo
- Irving Berlin / online_audio -> total 12 : https://www.loc.gov/search/?q=%22Irving+Berlin%22&fo=json&c=8&fa=online-format%3Aaudio
- Celia Cruz / all -> total 141 : https://www.loc.gov/search/?q=%22Celia+Cruz%22&fo=json&c=8
- Celia Cruz / online_image -> total 68 : https://www.loc.gov/search/?q=%22Celia+Cruz%22&fo=json&c=8&fa=online-format%3Aimage
- Celia Cruz / online_video -> total 15 : https://www.loc.gov/search/?q=%22Celia+Cruz%22&fo=json&c=8&fa=online-format%3Avideo
- Celia Cruz / online_audio -> total 2 : https://www.loc.gov/search/?q=%22Celia+Cruz%22&fo=json&c=8&fa=online-format%3Aaudio
- Albert Einstein / all -> total 5952 : https://www.loc.gov/search/?q=%22Albert+Einstein%22&fo=json&c=8
- Albert Einstein / online_image -> total 5021 : https://www.loc.gov/search/?q=%22Albert+Einstein%22&fo=json&c=8&fa=online-format%3Aimage
- Albert Einstein / online_video -> total 91 : https://www.loc.gov/search/?q=%22Albert+Einstein%22&fo=json&c=8&fa=online-format%3Avideo
- Albert Einstein / online_audio -> total 1 : https://www.loc.gov/search/?q=%22Albert+Einstein%22&fo=json&c=8&fa=online-format%3Aaudio
- Bob Hope / all -> total 18986 : https://www.loc.gov/search/?q=%22Bob+Hope%22&fo=json&c=8
- Bob Hope / online_image -> total 19205 : https://www.loc.gov/search/?q=%22Bob+Hope%22&fo=json&c=8&fa=online-format%3Aimage
- Bob Hope / online_video -> total 164 : https://www.loc.gov/search/?q=%22Bob+Hope%22&fo=json&c=8&fa=online-format%3Avideo
- Bob Hope / online_audio -> total 9 : https://www.loc.gov/search/?q=%22Bob+Hope%22&fo=json&c=8&fa=online-format%3Aaudio

### 6.2 LoC photos API

- Madeleine Albright -> 23 hits : https://www.loc.gov/photos/?q=%22Madeleine+Albright%22&fo=json&c=8
- Irving Berlin -> 61 hits : https://www.loc.gov/photos/?q=%22Irving+Berlin%22&fo=json&c=8
- Celia Cruz -> 6 hits : https://www.loc.gov/photos/?q=%22Celia+Cruz%22&fo=json&c=8
- Albert Einstein -> 57 hits : https://www.loc.gov/photos/?q=%22Albert+Einstein%22&fo=json&c=8
- Bob Hope -> 170 hits : https://www.loc.gov/photos/?q=%22Bob+Hope%22&fo=json&c=8

### 6.3 LoC collections lookup
- https://www.loc.gov/collections/?q=bob+hope&fo=json&c=5 -> 1 (National Press Club Speeches)
- https://www.loc.gov/collections/?q=irving+berlin&fo=json&c=5 -> 1 (Historic Sheet Music Collection)
- https://www.loc.gov/collections/?q=celia+cruz&fo=json&c=5 -> 0
- https://www.loc.gov/collections/?q=albert+einstein&fo=json&c=5 -> 1 (Sigmund Freud Papers)
- https://www.loc.gov/collections/?q=madeleine+albright&fo=json&c=5 -> 0
- Early probe: https://www.loc.gov/search/?q=Madeleine+Albright&fo=json&c=2 (unquoted; 6,600 hits, not used)
- Pages opened: https://blogs.loc.gov/now-see-hear/2018/07/bob-hope-collection-update/

### 6.4 NARA (browser UI)
- https://catalog.archives.gov/search?q=%22Albert%20Einstein%22 -> 2,639
- https://catalog.archives.gov/search?q=%22Madeleine%20Albright%22 -> 3,895
- https://catalog.archives.gov/search?q=%22Irving%20Berlin%22 -> 1,123
- https://catalog.archives.gov/search?q=%22Celia%20Cruz%22 -> 184
- https://catalog.archives.gov/search?q=%22Bob%20Hope%22 -> 4,499
- https://catalog.archives.gov/search?q=%22Irving%20Berlin%22%20naturalization -> 249 (noise)
- https://catalog.archives.gov/search?q=%22Bob%20Hope%22%20naturalization -> 858 (noise)
- https://catalog.archives.gov/search?q=%22Celia%20Cruz%22%20naturalization -> 49 (noise)
- Failed/unused: https://catalog.archives.gov/proxy/advanced-search, /api/v2/records/search, /api/v1/ (returned the SPA HTML shell, no key)

### 6.5 Smithsonian (si.edu search UI, fetched via browser)
- For each name N in {Albright, Berlin, Cruz, Einstein, Hope}: https://www.si.edu/search/images?edan_q=%22N%22 ; the same plus `&edan_fq%5Bmedia_usage%5D=media_usage%3ACC0` ; https://www.si.edu/search/3d_models?edan_q=%22N%22 (counts in 2.3; the 3d_models URL returned the same tab-count header, 3D count read from the "3D Objects (n)" tab)
- https://www.si.edu/search/images?edan_q=%22Irving%20Berlin%22%20piano -> 50 results
- Object pages read: the Cruz lilac 3D dress, nmaahc_2013.8, nmah_605967, Phyllis Diller gag file (listing only)
- Failed: https://api.si.edu/openaccess/api/v1.0/search?api_key=DEMO_KEY... -> 429 ; https://3d.si.edu/explore?edan_q=einstein -> 403 ; https://collections.si.edu/search/results.htm... -> 403 (WebFetch)

### 6.6 Wikimedia Commons (https://commons.wikimedia.org/w/api.php)

- Madeleine Albright category: https://commons.wikimedia.org/w/api.php?action=query&titles=Category%3AMadeleine+Albright&prop=categoryinfo&format=json
  - all_files -> 1192 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - bitmap -> 933 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+filetype%3Abitmap&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - video -> 9 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+filetype%3Avideo&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - audio -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+filetype%3Aaudio&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - drawing -> 2 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+filetype%3Adrawing&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US -> 273 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-US%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-USGov -> 256 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-USGov%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-old-70 -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-old-70%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US-expired -> 1 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-US-expired%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - Cc-zero -> 4 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22Cc-zero%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - CC-BY-SA-4 -> 39 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Madeleine+Albright%22+hastemplate%3A%22Cc-by-sa-4.0%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - examples video : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Madeleine+Albright%22+filetype%3Avideo&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples audio : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Madeleine+Albright%22+filetype%3Aaudio&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PD : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-USGov%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PDold : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Madeleine+Albright%22+hastemplate%3A%22PD-old-70%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
- Irving Berlin category: https://commons.wikimedia.org/w/api.php?action=query&titles=Category%3AIrving+Berlin&prop=categoryinfo&format=json
  - all_files -> 694 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - bitmap -> 397 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+filetype%3Abitmap&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - video -> 5 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+filetype%3Avideo&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - audio -> 69 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+filetype%3Aaudio&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - drawing -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+filetype%3Adrawing&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US -> 259 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-US%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-USGov -> 35 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-USGov%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-old-70 -> 2 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-old-70%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US-expired -> 247 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-US-expired%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - Cc-zero -> 7 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22Cc-zero%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - CC-BY-SA-4 -> 7 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Irving+Berlin%22+hastemplate%3A%22Cc-by-sa-4.0%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - examples video : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Irving+Berlin%22+filetype%3Avideo&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples audio : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Irving+Berlin%22+filetype%3Aaudio&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PD : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-USGov%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PDold : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Irving+Berlin%22+hastemplate%3A%22PD-old-70%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
- Celia Cruz category: https://commons.wikimedia.org/w/api.php?action=query&titles=Category%3ACelia+Cruz&prop=categoryinfo&format=json
  - all_files -> 203 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - bitmap -> 197 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+filetype%3Abitmap&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - video -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+filetype%3Avideo&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - audio -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+filetype%3Aaudio&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - drawing -> 1 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+filetype%3Adrawing&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-US%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-USGov -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-USGov%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-old-70 -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-old-70%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US-expired -> 0 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-US-expired%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - Cc-zero -> 2 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22Cc-zero%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - CC-BY-SA-4 -> 13 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Celia+Cruz%22+hastemplate%3A%22Cc-by-sa-4.0%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - examples video : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Celia+Cruz%22+filetype%3Avideo&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples audio : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Celia+Cruz%22+filetype%3Aaudio&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PD : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-USGov%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PDold : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Celia+Cruz%22+hastemplate%3A%22PD-old-70%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
- Albert Einstein category: https://commons.wikimedia.org/w/api.php?action=query&titles=Category%3AAlbert+Einstein&prop=categoryinfo&format=json
  - all_files -> 3737 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - bitmap -> 2652 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+filetype%3Abitmap&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - video -> 20 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+filetype%3Avideo&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - audio -> 23 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+filetype%3Aaudio&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - drawing -> 49 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+filetype%3Adrawing&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US -> 48 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-US%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-USGov -> 342 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-USGov%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-old-70 -> 77 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-old-70%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US-expired -> 137 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-US-expired%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - Cc-zero -> 199 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22Cc-zero%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - CC-BY-SA-4 -> 909 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Albert+Einstein%22+hastemplate%3A%22Cc-by-sa-4.0%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - examples video : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Albert+Einstein%22+filetype%3Avideo&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples audio : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Albert+Einstein%22+filetype%3Aaudio&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PD : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-USGov%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PDold : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Albert+Einstein%22+hastemplate%3A%22PD-old-70%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
- Bob Hope category: https://commons.wikimedia.org/w/api.php?action=query&titles=Category%3ABob+Hope&prop=categoryinfo&format=json
  - all_files -> 1520 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - bitmap -> 1187 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+filetype%3Abitmap&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - video -> 1 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+filetype%3Avideo&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - audio -> 14 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+filetype%3Aaudio&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - drawing -> 2 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+filetype%3Adrawing&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US -> 267 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22PD-US%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-USGov -> 272 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22PD-USGov%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-old-70 -> 2 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22PD-old-70%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - PD-US-expired -> 13 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22PD-US-expired%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - Cc-zero -> 13 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22Cc-zero%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - CC-BY-SA-4 -> 188 : https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=%22Bob+Hope%22+hastemplate%3A%22Cc-by-sa-4.0%22&srnamespace=6&srlimit=1&srinfo=totalhits&format=json
  - examples video : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Bob+Hope%22+filetype%3Avideo&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples audio : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Bob+Hope%22+filetype%3Aaudio&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PD : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Bob+Hope%22+hastemplate%3A%22PD-USGov%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json
  - examples PDold : https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=%22Bob+Hope%22+hastemplate%3A%22PD-old-70%22+filetype%3Abitmap&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize%7Cmime&iiextmetadatafilter=LicenseShortName%7CDateTimeOriginal%7CArtist%7CCredit&format=json

### 6.7 Internet Archive (advancedsearch.php)

- Madeleine Albright / all -> 1538 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Madeleine%20Albright%22
- Madeleine Albright / movies -> 1319 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Madeleine%20Albright%22%20AND%20mediatype%3Amovies
- Madeleine Albright / audio -> 96 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Madeleine%20Albright%22%20AND%20mediatype%3Aaudio
- Madeleine Albright / title_movies -> 169 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Madeleine%20Albright%22%20AND%20mediatype%3Amovies
- Madeleine Albright / title_audio -> 20 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Madeleine%20Albright%22%20AND%20mediatype%3Aaudio
- Madeleine Albright / pd_movies -> 3 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Madeleine%20Albright%22%20AND%20mediatype%3Amovies%20AND%20licenseurl%3A%2Apublicdomain%2A
- Madeleine Albright / prelinger -> 82 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Madeleine%20Albright%22%20AND%20collection%3A%28prelinger%20OR%20newsandpublicaffairs%20OR%20classic_tv%20OR%20moviesandfilms%29
- Irving Berlin / all -> 2121 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Irving%20Berlin%22
- Irving Berlin / movies -> 220 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Irving%20Berlin%22%20AND%20mediatype%3Amovies
- Irving Berlin / audio -> 1578 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Irving%20Berlin%22%20AND%20mediatype%3Aaudio
- Irving Berlin / title_movies -> 16 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Irving%20Berlin%22%20AND%20mediatype%3Amovies
- Irving Berlin / title_audio -> 59 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Irving%20Berlin%22%20AND%20mediatype%3Aaudio
- Irving Berlin / pd_movies -> 9 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Irving%20Berlin%22%20AND%20mediatype%3Amovies%20AND%20licenseurl%3A%2Apublicdomain%2A
- Irving Berlin / prelinger -> 72 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Irving%20Berlin%22%20AND%20collection%3A%28prelinger%20OR%20newsandpublicaffairs%20OR%20classic_tv%20OR%20moviesandfilms%29
- Celia Cruz / all -> 431 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Celia%20Cruz%22
- Celia Cruz / movies -> 153 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Celia%20Cruz%22%20AND%20mediatype%3Amovies
- Celia Cruz / audio -> 234 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Celia%20Cruz%22%20AND%20mediatype%3Aaudio
- Celia Cruz / title_movies -> 16 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Celia%20Cruz%22%20AND%20mediatype%3Amovies
- Celia Cruz / title_audio -> 28 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Celia%20Cruz%22%20AND%20mediatype%3Aaudio
- Celia Cruz / pd_movies -> 4 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Celia%20Cruz%22%20AND%20mediatype%3Amovies%20AND%20licenseurl%3A%2Apublicdomain%2A
- Celia Cruz / prelinger -> 29 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Celia%20Cruz%22%20AND%20collection%3A%28prelinger%20OR%20newsandpublicaffairs%20OR%20classic_tv%20OR%20moviesandfilms%29
- Albert Einstein / all -> 6741 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Albert%20Einstein%22
- Albert Einstein / movies -> 1908 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Albert%20Einstein%22%20AND%20mediatype%3Amovies
- Albert Einstein / audio -> 2249 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Albert%20Einstein%22%20AND%20mediatype%3Aaudio
- Albert Einstein / title_movies -> 142 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Albert%20Einstein%22%20AND%20mediatype%3Amovies
- Albert Einstein / title_audio -> 52 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Albert%20Einstein%22%20AND%20mediatype%3Aaudio
- Albert Einstein / pd_movies -> 49 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Albert%20Einstein%22%20AND%20mediatype%3Amovies%20AND%20licenseurl%3A%2Apublicdomain%2A
- Albert Einstein / prelinger -> 191 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Albert%20Einstein%22%20AND%20collection%3A%28prelinger%20OR%20newsandpublicaffairs%20OR%20classic_tv%20OR%20moviesandfilms%29
- Bob Hope / all -> 4778 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Bob%20Hope%22
- Bob Hope / movies -> 1173 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Bob%20Hope%22%20AND%20mediatype%3Amovies
- Bob Hope / audio -> 433 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Bob%20Hope%22%20AND%20mediatype%3Aaudio
- Bob Hope / title_movies -> 152 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Bob%20Hope%22%20AND%20mediatype%3Amovies
- Bob Hope / title_audio -> 91 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=title%3A%22Bob%20Hope%22%20AND%20mediatype%3Aaudio
- Bob Hope / pd_movies -> 105 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Bob%20Hope%22%20AND%20mediatype%3Amovies%20AND%20licenseurl%3A%2Apublicdomain%2A
- Bob Hope / prelinger -> 191 : https://archive.org/advancedsearch.php?rows=6&output=json&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=date&fl%5B%5D=licenseurl&fl%5B%5D=mediatype&fl%5B%5D=collection&sort%5B%5D=downloads+desc&q=%22Bob%20Hope%22%20AND%20collection%3A%28prelinger%20OR%20newsandpublicaffairs%20OR%20classic_tv%20OR%20moviesandfilms%29

### 6.8 Other web
- Browser pages read: https://history.state.gov/departmenthistory/people/albright-madeleine-korbel ; https://www.nobelprize.org/prizes/physics/1921/einstein/facts/ ; https://www.britannica.com/biography/Celia-Cruz ; https://www.britannica.com/biography/Bob-Hope ; https://www.britannica.com/biography/Irving-Berlin ; https://www.irvingberlin.com/ ; https://www.bobhope.com/ (redirected to https://bobhope.org/) ; https://celiacruz.com/
- WebSearch queries: "Library of Congress Bob Hope collection finding aid Irving Berlin collection digitized"; "Einstein Archives Online Hebrew University digitized documents Albert Einstein copyright licensing"; "Celia Cruz Foundation official site Celia Cruz Smithsonian National Museum of American History collection"; "Albert Einstein name and likeness licensing Hebrew University Authentic Brands Group right of publicity Einstein"; "Bob Hope estate Bob Hope Enterprises licensing likeness; Irving Berlin Music Company copyright "White Christmas" licensing"
