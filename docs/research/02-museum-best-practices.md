# 02 - Museum and Virtual-Museum Best Practices (for IHH inductee profile pages)

Research date: 2026-10-07. Method: WebSearch plus WebFetch. Several sites (nobelprize.org, tenement.org, loc.gov item pages, si.edu, annefrank.org main site) returned HTTP 403/404 to the fetch tool, so claims for them rest on search-result snippets only and are labelled.

Confidence key: [V] = read on the page or in a primary/official source this session. [S] = from a search snippet or secondary article only. [U] = could not verify; treat as hypothesis.

---

## Part A. Case studies (12)

### 1. NMAAHC Searchable Museum (Smithsonian)
- URL: https://searchablemuseum.com [V, fetched 2026-10-07]
- Engaging because: stories are filed by type (Biography, Community Story, Historic Event); "Constellations" are deep dives into single objects; an interactive timeline ("Afrofuturist Flashpoints in Black Music, 1900-2023") sits on the homepage. [V]
- Patterns: object-centred "constellation" pages, interactive timeline, virtual exhibitions, separate Educator Resources and Exhibit Resources sections. [V]
- Sources and credits: sponsor credit shown prominently on the homepage (Bloomberg named). Per-object citation display: [U], not visible in the fetched excerpt.
- Accessibility: "Skip to Content" link seen. Captions, transcripts, alt text, reduced-motion behaviour: [U].
- Mobile: responsive image handling inferred by the fetch summary; real behaviour [U].
- Lesson for IHH: a dedicated educator tab, content typed by story kind, object-first deep dives.

### 2. Anne Frank House - 3D virtual tour (2024) and Secret Annex VR
- URLs: https://annefrank.org/en/about-us/news-and-press/news/2024/11/14/the-anne-frank-house-launches-a-3d-virtual-tour [V]; https://www.annefrank.org/en/about-us/what-we-do/publications/anne-frank-house-virtual-reality/ [S]
- Engaging because: you move room to room through the Annex with photos, video clips, sound bites, objects and documents attached to each room; framed explicitly as a school resource. [V]
- Patterns: 360 / 3D walkthrough hosted on EyeSpy360 (eyespy360-tours.com/annefrank) [V]; multilingual AI-cloned avatar guide using broadcaster Rachel Riley's image and voice, in English, Spanish, Dutch and German, with more planned [V]. Separate Secret Annex VR app: furnished 1942-44 per the museum, 3D modelled by Vertigo Games, about 25 minutes, 7 languages, free on Oculus/Quest, Gear VR, Steam and PICO [S].
- Sources and credits: the announcement credits Riley; per-asset sourcing inside the tour [U].
- Accessibility: screen-reader, caption and device requirements were NOT stated in the announcement [V that they are absent from it].
- Mobile: browser-based tour implies mobile access, behaviour [U].
- Lesson: the closest precedent for a named guide avatar attached to a biography. Note the consent model: the avatar is a real, consenting, named person, disclosed as AI. IHH cannot clone a real person's voice without rights; use a clearly fictional/illustrated guide.

### 3. Tenement Museum (NYC) - virtual tours and digital exhibits
- URLs: https://tenement.org/digital-exhibits [S, fetch 403]; https://www.tenement.org/virtual-experiences/ [U, 403]
- Engaging because: digital exhibits mix video, immersive 360 photos, oral histories and slideshows; "The Stories of 103 Orchard Street" overlays three eras (1900s Lower East Side, 1960s Loisaida, 1980s Chinatown). Live virtual tours use 360 images, video, audio and primary sources; some are educator-led or costumed-interpreter performances (e.g. 97 Orchard Street Rogarshevsky family, Victoria Confino). [S]
- Sources and credits, accessibility, mobile: [U].
- Lesson: immigrant stories told through one place and several families; live educator layer for teachers.

### 4. Statue of Liberty - Ellis Island Foundation
- URLs: https://statueofliberty.org/discover/passenger-ship-search/ [V]; oral history info via search [S]
- Engaging because: personal, searchable record of arrival. Database covers Ellis Island and other U.S. ports, 18th-20th centuries [V]; nearly 65 million passenger records, arrivals 1820-1957 [S, secondary]. Oral History project of nearly 2,000 interviews [S].
- Pattern: search by name with guidance to use original ethnic spellings (examples given: Giuseppe, Zsuzsanna) and the point that immigrants were not renamed on arrival [V]. Manifest-image display and citation format [U].
- Lesson: link each inductee to their real arrival record or document where one exists; correct the "name changed at Ellis Island" myth with a sourced note.

### 5. Nobel Prize site - laureate biographical pages
- URL pattern: https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/ [page exists; fetch 403]
- Observed: stable per-laureate URL structure (prize / year / laureate / biographical, other-resources). A third-party (ComPADRE) records an MLA-style citation of this page as "Nobel Foundation. The Nobel Prize in Physics 1921 - Albert Einstein." with access date [S]. Whether Nobel prints its own "cite this page" block: [U].
- Lesson: permanent, human-readable URLs per person and per document type, and a "biographical / lecture / other resources" tab split.

### 6. Google Arts & Culture
- URLs: https://artsandculture.google.com (about page 404 to fetch) [U for current feature list]
- Verified in press coverage [S]: Art Camera robot producing gigapixel images (blog.google/topics/arts-culture/art-camera-cultural-institute/); Street View style walk-throughs of institutions (46 institutions at the time of the cited coverage); an AR "Art Projector" feature.
- Lesson: zoomable gigapixel detail is the one "immersive" element that is never flat; story pages are image-led. Do not copy the account-wall.

### 7. Smithsonian Open Access
- URLs: https://www.si.edu/openaccess (403 to fetch); https://www.si.edu/newsdesk/releases/smithsonian-releases-28-million-free-images-broader-public-use [S]
- Verified via multiple snippets [S]: launched 25 Feb 2020, about 2.8 million 2D and 3D images, CC0, metadata via API and GitHub, later over 3 million.
- Lesson: IHH can source portraits and objects from CC0 pools (Smithsonian, Library of Congress public-domain items, Wikimedia Commons with per-file licence check) and show the licence on every image.

### 8. Library of Congress - Story Maps and By the People
- URLs: https://www.esri.com/about/newsroom/blog/library-of-congress-story-maps [S]; By the People via https://www.CitizenScience.gov/catalog/503/ [S]; loc.gov item pages (403)
- Observed [S]: LOC launched three Esri Story Maps in 2018 combining text, images and multimedia anchored to geography. By the People invites volunteers to transcribe, review and tag digitized documents; transcriptions help search and people who are not fully sighted.
- LOC item-page "Cite This Item" and IIIF support: well known but NOT verified this session [U].
- Lesson: map-anchored narrative and transcription of primary documents (transcripts double as accessible text).

### 9. National Park Service - "Life at Lewis Mountain: Shenandoah in the Jim Crow Era" (Webby 2025 People's Voice, Cultural Institutions)
- URLs: https://www.nps.gov/shen/learn/news/shenandoah-national-park-announces-new-online-interactive.htm [V]; https://www.nps.gov/features/shen/lewisMT/index.htm [S]
- Engaging because: five short videos with follow-up activities built from oral histories, letters, newspaper articles and photographs; designed for upper-middle and high school; aligned to Virginia and national learning standards; launched 7 Mar 2024. [V/S]
- Sources and credits: named advisor Audrey Tutt Smith (1950s Lewis Mountain staff), decades of research, supplementary research by the National Archives Federal Research Division funded by the Appalachian Mountain Club; development by A&T Integrated, Inc.; FLREA funding. [V]
- Lesson: the best model for the teacher audience: lesson-ready, standards-aligned, with named human sources and funding disclosed. Webby listing: https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/cultural-institutions [V]

### 10. National Gallery Imaginarium (Webby Winner 2026, Cultural Institutions)
- URLs: https://www.nationalgallery.org.uk/visiting/virtual-gallery/national-gallery-imaginarium [V]; https://q42.nl/en/work/imaginarium-national-gallery [V]
- Engaging because: paintings float in a dreamlike 3D space; curator-written questions lead the visitor in ("slow looking"); gentle AI animation with soundscape; intro by Sir Ben Okri, soundscapes by Nick Ryan; shows how other visitors read the same work. [V]
- Tech [V]: Three.js with React Three Fiber, Micrio high-resolution image viewer, Sanity headless CMS, Firebase. Optimised for desktop and older phones and tablets; works in Chrome, Firefox, Safari including iOS and Android. Developers state they rejected AI animations that lacked narrative purpose. Awards: 2025 Lovie Silver, 2026 Webby, two 2026 Silver European Design Awards. [V]
- Accessibility: links to an accessibility statement only; specifics [U].
- Lesson: 3D used for atmosphere, but the substance is zoomable images and curated questions. Directly relevant stack for a WordPress-embedded scene.

### 11. Rijksmuseum - Rijksstudio
- URL: https://www.rijksmuseum.nl/en/rijksstudio [not fetched; search only]
- [S]: high-resolution downloads, CC0, 700,000+ items, personal collections after free sign-up. IIIF support: [U].
- Lesson: let users download, remix and "curate their own set" of inductee images; open licence.

### 12. Computer History Museum - "Revolution" online exhibition; National WWII Museum digital collections; USHMM
- CHM: https://computerhistory.org/press-releases/storage-exhibit/ and related [S]. Revolution has 18 mini-movies, 40+ oral histories, 4,500+ web pages [S]; a timeline of storage milestones is an online exhibit [S].
- National WWII Museum: https://www.ww2online.org/content/about-digital-collections-national-wwii-museum [S]: oral histories and documents digitised and transcribed; daily oral-history video spotlights from 10,000+ accounts [S].
- USHMM survivor page: https://www.ushmm.org/remember/holocaust-survivors [V]: survivor volunteers, first-person talks, a names database; interaction and citation details [U].
- Lesson: transcribed first-person testimony is the common credibility engine across history museums.

### Other award context
- Webby Cultural Institutions winners [V]: 2026 National Gallery Imaginarium (Webby), National Gallery of Art website (People's Voice); 2025 Nordiska Museet (Webby), NPS Lewis Mountain (People's Voice); 2024 The Book of HOV (Webby), Smithsonian National Museum of Asian Art redesign (People's Voice).
- MuseWeb GLAMi: 2025 winners NOT found (search returned only older material). Not verified; omitted rather than guessed.
- Nordiska Museet 2025 winner details not examined [U].

---

## Part B. Synthesis

### 1. Ranked best-practice patterns (biographical profile page)

Audiences: S = students, T = teachers, V = tech-savvy visitors.

| Rank | Pattern | Evidence | S | T | V |
|---|---|---|---|---|---|
| 1 | One strong narrative spine: short scroll story (6-8 beats) with a person-first hook, then depth on demand | NMAAHC story types; Imaginarium question flow | x | x | x |
| 2 | Zoomable high-res primary images / documents (passport, patent, record sleeve) with caption + licence | Google Art Camera; Rijksstudio; Micrio in Imaginarium | x | x | x |
| 3 | First-person audio/video with transcript | Tenement, WWII Museum, CHM, NPS | x | x |  |
| 4 | Guided exploration, curator-style questions rather than menus | Imaginarium | x |  | x |
| 5 | Timeline and map of the migration journey | NMAAHC timeline; LOC story maps | x | x | x |
| 6 | Educator layer: standards-aligned activity, discussion questions, printable sheet | NPS Lewis Mountain; NMAAHC Educator Resources | | x |  |
| 7 | Real 3D/360 only where there is a real place or object (a lab, a stage, a ship) | Anne Frank 3D tour; Tenement 360 | x |  | x |
| 8 | Named guide/avatar, clearly disclosed, skippable | Anne Frank House (Riley avatar) | x |  | x |
| 9 | Lookup of the real arrival record where one exists | Ellis Island passenger search | x | x |  |
| 10 | Short quiz or reflection prompt closing the story | NPS follow-up activities | x | x |  |
| 11 | Visitor-curated collection / share card | Rijksstudio | x |  | x |

Rule of thumb from the brief: every "immersive" element must deliver information the flat page cannot (spatial context, zoom, sound). Otherwise cut it.

### 2. Credibility patterns
- Visible "Sources" list per claim cluster, each entry with author, title, publisher, date published, date accessed, and a working link (archive.org snapshot as backup).
- "Cite this page" box with APA 7, MLA 9, Chicago and a copy button; include page last-reviewed date and a permanent URL (Nobel-style stable path pattern; their own cite block unverified).
- Separate primary from secondary sources with badges; place the primary-source viewer next to the claim it supports.
- Per-image credit line: creator, collection/institution, licence (CC0 / public domain / rights-cleared), source URL. Smithsonian and Rijksmuseum demonstrate CC0 practice.
- Named human contributors and funders (NPS credits advisor, research body, developer, funder).
- A visible corrections/changelog line ("Reviewed 2026-xx-xx by ...; changed ...").
- Mark contested or myth-prone facts explicitly (e.g. the name-change-at-Ellis-Island note on the Foundation site).
- Disclose any AI-generated element (animation, voice, imagery) and keep it out of the factual record; Anne Frank House and National Gallery both disclose, and the latter rejected animations without narrative purpose.
- Provide transcripts so quotes can be cited by timestamp.

### 3. Accessibility and performance standards to meet
- WCAG 2.2 is a W3C Recommendation dated 12 Dec 2024 [V]. Target Level AA. New AA criteria to build for: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum), 3.3.8 Accessible Authentication (Minimum); Level A additions 3.2.6 Consistent Help and 3.3.7 Redundant Entry [V]. Consequences: sticky headers/avatars must not cover focused elements; every drag/pan/rotate (3D, sliders, timeline) needs a click or keyboard alternative; targets at least 24 by 24 CSS px.
- AV: captions for prerecorded video (1.2.2, A) and audio description for prerecorded video (1.2.5, AA) [V]; transcripts for audio-only (1.2.1). Disclose that Anne Frank's announcement does not state captions, a gap to beat.
- Alt text on every image, with long descriptions for documents; transcribe scanned documents (LOC By the People shows transcripts help non-sighted users [S]).
- Reduced motion: honour `prefers-reduced-motion`; replace parallax/scroll-linked animation with static keyframes or stepped content [S, secondary guidance]; keep a visible pause for auto-moving media. Note 2.3.3 Animation from Interactions is AAA [V], so treat it as a stretch goal and still comply.
- Keyboard-operable 3D/360 with a text equivalent and a "skip scene" link; no scroll-hijack that breaks keyboard or screen-reader reading order.
- Low-bandwidth / no-WebGL fallback: poster image + description first, load 3D on explicit click, detect WebGL/Save-Data/slow connection, provide a flat gallery of the same assets. Imaginarium targets older phones and tablets as a stated goal [V]. Specific byte budgets: [U], propose own (e.g. initial page under 1 MB excluding media) and test.
- Do not rely on colour alone; contrast 4.5:1 text, 3:1 UI; language attributes; multilingual toggle (Anne Frank tour: 4 languages [V]).
- Test with a screen reader and on a real mid-range phone; publish an accessibility statement with a contact route.

### 4. Anti-patterns to avoid
- "Immersive" that is a flat slideshow in a 3D wrapper; the brief says tech-savvy visitors bounce at this.
- Unlabelled AI voice/face of a real person without rights or disclosure; AI-animated historical photos presented as authentic.
- Scroll-jacking and parallax with no reduced-motion path; long autoplay media.
- Walls: required login or email to see sources or download images (Rijksstudio requires sign-up for downloads [S]; avoid for core content).
- Quotes with no source, undated sources, or "Wikipedia says" as the only citation.
- Hero 3D scene that blocks the first contentful paint; mandatory WebGL.
- Hagiography: omitting hardship, contested facts or the immigrant's own words; stock imagery of "immigrants" in place of the person.
- Fake interactivity (hotspots that open the same paragraph).
- Dragging-only controls; tiny tap targets; focus hidden under sticky bars.
- Unverified quote attribution (famous immigrants attract apocryphal quotes; require a primary source or label "attributed").

### 5. Distinctive but credible ideas
1. **Evidence mode toggle**: a switch that overlays each paragraph with its source chips and confidence label (primary / secondary / disputed). Visible provenance as a feature, not a footer.
2. **"Document first" 3D**: instead of a room, a walkable table of real documents (passport, patent, contract), each zoomable and transcribed; flat fallback is a gallery. Cheaper than full 3D and honest.
3. **Arrival-record lookup card** for inductees who passed through U.S. ports, linking to the actual manifest (Ellis Island Foundation database) when a record is findable.
4. **Journey as a scroll-driven map** with dated stops, each stop tied to a source; reduced-motion version is a numbered list.
5. **Student "Cite it" generator** that outputs a ready citation for the page and for any single image, quote or timestamp in the AV (deep-link by anchor).
6. **Myth vs record strip**: 2-3 popular claims about the person, each rated with sources (modelled on the Foundation's name-change correction [V]).
7. **Guide that is a curator voice, not a face**: question-led exploration as in the Imaginarium [V], delivered with text + optional audio, no cloned voice.
8. **Low-bandwidth "postcard" mode**: the whole profile as a lightweight, printable, teacher-ready one-pager generated from the same content.
9. **Immigrant-in-their-own-words rail**: only direct, dated primary quotes, each with transcript timestamp.
10. **Teacher packet export** (standards alignment as in NPS Lewis Mountain [V], discussion questions, source list).

---

## Part C. Gaps and unverified items
- GLAMi / MuseWeb recent winners: not found. Webby data verified for 2024-2026 only.
- Nobel "cite" block, LOC "Cite This Item" and IIIF, Rijksstudio IIIF, Tenement accessibility, NMAAHC captions/alt text: not verified (sites blocked or not described).
- Google Arts & Culture current feature list and accessibility: not verified (about page 404; relied on 2016-18 era press).
- Mobile behaviour was verified only for the National Gallery Imaginarium (stated browser support). All others unverified; recommend hands-on testing in the next phase.
- No byte/performance budget figure was sourced; propose and measure.

---

## Search log (all 2026-10-07)

Searches:
1. Anne Frank House online Secret Annex 3D tour VR experience
2. Google Arts & Culture features Street View Art Camera gigapixel Pocket Gallery stories
3. Tenement Museum virtual tours online immigrant stories 360 oral history
4. MuseWeb GLAMi Awards 2025 winners
5. Webby Awards 2025 Websites and Mobile Sites Museums winner
6. Statue of Liberty Ellis Island Foundation passenger search immigrant stories online "Ellis Island" oral histories
7. Nobel Prize website biographical Albert Einstein "Cite this page" MLA style
8. Library of Congress exhibitions online interactive "Story Maps" LOC.gov IIIF crowdsourcing "By the People" cite item "Cite This Item"
9. National Gallery Imaginarium Webby 2026 Fabrique Q42 how it works
10. Life at Lewis Mountain Shenandoah Jim Crow Era National Park Service website scrollytelling Alexander & Tom
11. Rijksmuseum Rijksstudio IIIF downloads open access high resolution stories
12. Computer History Museum online exhibits oral histories "Revolution" online exhibition features
13. National WWII Museum digital collections oral histories virtual experiences online
14. Smithsonian Open Access CC0 million images API launched 2020 Learning Lab
15. prefers-reduced-motion scrollytelling accessibility web.dev guidance low-bandwidth 3D model-viewer poster loading

Fetches (OK = content returned):
- https://searchablemuseum.com - OK
- https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/ - 403
- https://www.nobelprize.org/prizes/physics/1921/einstein/other-resources/ - 403
- https://artsandculture.google.com/about - 404
- https://www.annefrank.org/en/museum/secret-annex/ - 404
- https://www.tenement.org/virtual-experiences/ - 403
- https://tenement.org/digital-exhibits - 403
- https://libmma.contentdm.oclc.org/ - redirect to Met Watson Digital Collections (not followed; irrelevant)
- https://annefrank.org/en/about-us/news-and-press/news/2024/11/14/the-anne-frank-house-launches-a-3d-virtual-tour - OK
- https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/cultural-institutions - OK
- https://statueofliberty.org/discover/passenger-ship-search/ - OK
- https://www.loc.gov/item/2018655078/ - 403
- https://www.ushmm.org/remember/holocaust-survivors - OK
- https://www.nationalgallery.org.uk/visiting/virtual-gallery/national-gallery-imaginarium - OK
- https://www.nps.gov/shen/learn/news/shenandoah-national-park-announces-new-online-interactive.htm - OK
- https://www.si.edu/openaccess - 403
- https://www.w3.org/TR/WCAG22/ - OK
- https://q42.nl/en/work/imaginarium-national-gallery - OK
