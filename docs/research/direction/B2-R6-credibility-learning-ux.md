# B2-R6 - Credibility and learning UX patterns (teacher, student, casual visitor)

Research date: 2026-10-08. Route R6, batch 2. Builds on `INTERIM-1.md`, `B1-R1-experience-learning.md` and `02-museum-best-practices.md`; it does not repeat their findings (story structure, segmenting, retrieval practice, pre-training, "no seductive details", avatar effect sizes, EU AI Act Art. 50, accessible DOM hotspots). No recommendation is made here; section 5 lists implications only.

## 0. How to read this report

Evidence tags used in section 1:

- [V] read on the page, or extracted as raw text/JSON by me (pdftotext, curl, GitHub/npm API, same-origin fetch on the IHH site, LoC `?fo=json` API).
- [S] known only from a search-result summary or from a fetch tool's summary of the page. WebFetch summaries were sometimes wrong in this session (for example it reported a non-APA-7 "Retrieved from" web format for the APA handout until I read the PDF text myself), so [S] means "not independently confirmed".
- [OLD] published before 2024. Kept only where nothing newer exists.
- "Page undated" is stated where no date was visible.

Tally: Google web 84 queries, Google Developer Knowledge MCP 7, Context7 4. Plus 84 page fetches, a handful of raw-file/API probes and a few dozen in-app browser actions (listed in section 6; they do not count toward quotas). The numbered lists in section 6 were rebuilt from the session's tool calls, so the counts are exact to that record.

Things I could not do, and did not try to bypass: loc.gov HTML pages and `apastyle.apa.org` returned a bot challenge or an empty body in the in-app browser or curl. I did not attempt to solve or evade either. For loc.gov the documented JSON API (`?fo=json`) worked through WebFetch and is used below.

---

## 1. Findings per sub-route

### 1a. Citation and evidence UI

**A1. Semantic footnote markup exists and is documented, but support evidence is thin.**
DPUB-ARIA defines `doc-noteref` (a reference link, typically an `a` inside `sup`) and `doc-footnote` (the note itself, typically `aside`); the role inherits link semantics, and `doc-endnote` is deprecated because of a clash with the core ARIA role module. A March 2026 vendor article recommends `aside` rather than list items for the note body, matching `id`s, and an explicit "back to text" link so keyboard and screen-reader users can return. It adds that screen readers may announce repeated references to one note vaguely, and that PDFs have no ARIA equivalent. [S] mostly.
- DAISY Knowledge Base, "doc-noteref", https://kb.daisy.org/publishing/docs/html/dpub-aria/doc-noteref.html (page undated, fetched 2026-10-08).
- DubBot, "Accessible footnotes: tags, roles and navigation", https://dubbot.com/dubblog/2026/accessible-footnotes-tags-roles-and-navigation.html (2026-03-10).
- Search-result summary for the `doc-endnote` deprecation, query 1 in section 6.

**A2. The incumbent pattern is hover preview on desktop and a bottom drawer on touch.**
Wikipedia's Reference Previews became default on most wikis on 2023-11-21, after beta from 2019-02. The pop-up shows the footnote body (text, images, tables) and labels the source type at the top (seven types: generic, web, journal, book, news, map, notes). The feature needs JavaScript (without it the marker is an ordinary jump link) and is "scoped to desktop only". Mobile web uses a separate reference drawer (bottom pop-up) in MobileFrontend. Reference Tooltips (a gadget) and Reference Previews are mutually exclusive. [V for desktop previews; S for the mobile drawer, from MediaWiki/Phabricator search results]. No quantitative research results are published on the page.
- Wikimedia, "Help:Reference Previews", https://www.mediawiki.org/wiki/Help:Reference_Previews (undated; deployment date 2023-11-21 on page).
- Wikimedia Meta, "WMDE Technical Wishes/ReferencePreviews", https://meta.wikimedia.org/wiki/WMDE_Technical_Wishes/ReferencePreviews (undated).

**A3. Hover-only patterns fail on touch; the accessible alternative is a button that reveals content.**
- Nielsen Norman Group: tooltips are normally unavailable on touchscreens and should hold only non-essential microcontent (2019-01-27) [V summary]. https://www.nngroup.com/articles/tooltip-guidelines/
- Heydon Pickering, "Tooltips and Toggletips" (2017-07-25) [OLD]: a toggletip is a button whose only job is to reveal an info balloon on click; markup is `button` plus an empty `role="status"` region that JavaScript fills so screen readers announce it; the `title` attribute is inaccessible to touch and keyboard-only users. https://inclusive-components.design/tooltips-toggletips/
- WCAG 2.2 SC 1.4.13 Content on Hover or Focus (AA): content that appears on hover or focus must be dismissible without moving pointer/focus, hoverable, and persistent; browser-native `title` tooltips are exempt; the criterion does not address touch. https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html (fetched 2026-10-08) [V summary].

**A4. Platform support for building these without a library (GDK, 2026-10-08).**

| Feature | Support (Chrome / Edge / Firefox / Safari) | Notes |
|---|---|---|
| Popover API (`popover`, `popovertarget`) | 114 / 114 / 125 / 17 | Top layer, light-dismiss, Esc closes and returns focus, default focus handling; "no inherent semantics" (not a dialog; page is not made inert). Source: Chrome blog "Introducing the Popover API" and web.dev "Popover API". |
| `popover="hint"` | Chrome 133 (blog dated 2025-02-26). A later Chrome I/O 2025 recap page shows a support table headed 151/151/153 with an empty Safari cell | Cross-browser status unconfirmed; web.dev lists it as an Interop 2026 focus. |
| `interestfor` / `interesttarget` (declarative hovercards) | not shipped as stable | Chrome says the touch/coarse-pointer interaction model "is yet to be resolved". |
| CSS anchor positioning | 125 / 125 / 147 / 26 | OddBird polyfill exists. |
| `<details>`/`<summary>` | all modern engines since Jan 2020 | web.dev notes find-in-page expands collapsed details in Chrome/Edge but (at its writing, date not shown) not Firefox/Safari. WebKit bug 249904 (an auto-generated summary was not focusable) was fixed in Sept 2023 [V], so that older web.dev warning is mostly stale. |

- https://developer.chrome.com/blog/introducing-popover-api ; https://web.dev/blog/popover-api ; https://developer.chrome.com/blog/popover-hint (2025-02-26) ; https://developer.chrome.com/blog/new-in-web-ui-io-2025-recap ; https://developer.chrome.com/blog/anchor-positioning-api ; https://web.dev/learn/html/details ; https://web.dev/blog/interop-2026 ; https://bugs.webkit.org/show_bug.cgi?id=249904 (fetched 2026-10-08). All via Google Developer Knowledge or direct fetch.

**A5. In the one large dataset, almost nobody clicks references.**
English Wikipedia client-side logging for one month: about 1 in 300 page views produced a reference click: 0.29% overall, 0.56% desktop, 0.13% mobile. Clicks were more frequent on shorter and lower-quality pages, on recent content, open-access sources and life-event references. [V abstract; 2020 data; text-heavy encyclopedia, not a museum.] Piccardi, Redi, Colavizza, West, "Quantifying Engagement with Citations on Wikipedia", The Web Conference 2020, https://arxiv.org/abs/2001.08614 (submitted 2020-01-23). [OLD]

**A6. Citations act as a credibility cue whether or not they are used, and that effect can be gamed.**
- Stanford Guidelines for Web Credibility, guideline 1 "make it easy to verify the accuracy of the information": providing references shows confidence "even if people don't follow" them (the page says this in substance; the "three-year study of 4,500+ people" background is from a search summary); page last updated June 2002. https://credibility.stanford.edu/guidelines/index.html [V summary] [OLD].
- Ding, Facciani et al., "Citations and Trust in LLM Generated Responses", AAAI-25 vol. 39 no. 22 (2025): in a live Q&A experiment (about 303 Prolific participants per a search summary), the presence of citations raised confidence even when the citations were random, and confidence fell when participants actually checked them. https://ojs.aaai.org/index.php/AAAI/article/view/34550 [V abstract].
- "Transparency box" research in news: Binford, Duncan, Wojdynski, "Designing for Trust: How Online News Consumers View and Interpret Informational Transparency Boxes" (mixed-factorial eye-tracking lab experiment, N = 90; Media and Communication, Dec 2023 per DOAJ listing): both high-contrast and no-box designs drew attention to the box, attention affected perceived reporting ethics situationally, but did not significantly change credibility. Separate field tests (USA Today and the Tennessean) found a more prominent box raised credibility while a less prominent one (McClatchy papers) did not [S]. https://grady.uga.edu/research/designing-for-trust-how-online-news-consumers-view-and-interpret-informational-transparency-boxes (page undated).

**A7. An "evidence mode" toggle has no museum precedent that I could find; analogues exist in news tooling and data publishing.**
- NEWSSENSE (research prototype): underlines claims green or red for supporting or contradicting articles and opens an overlay with the source excerpts on hover or click [S, Hackernoon summary]. Highwire is a free start-up tool that splits coverage into claims and links each to evidence [S, product-listing pages; low quality].
- Our World in Data: charts carry a "Learn more about this data" panel with citation instructions; data credit lines read "[Source] - processed by Our World in Data"; all content is CC BY. https://ourworldindata.org/faqs [V summary] (undated).
- Digital Inquiry Group's Reading Like a Historian teaches sourcing, contextualizing, corroborating and close reading as the core document heuristics (234 free lessons). A claim-to-source layer could map onto vocabulary teachers already use. https://inquirygroup.org/history-lessons [V summary] (undated page; lists 53 new lessons).
- B1 doc 02's "evidence mode toggle" idea therefore remains an untested hypothesis.

**A8. Older web-footnote advice favours near-paragraph, small, skippable notes.**
Gedminas (2004) [OLD]: put notes right after the paragraph, indented and small, so readers can skip them; end-of-page notes make readers lose their place; tiny hyperlinked markers are hard to hit. DeStefano and LeFevre, "Cognitive load in hypertext reading: a review", Computers in Human Behavior 23(3), 2007 [OLD]: more links per page raised predicted cognitive load; restricted link access and visible link types helped. https://mg.pov.lt/blog/footnotes-on-the-web.html ; https://www.datalearner.com/academic/journal-papers/0747-5632/volumes-and-issues/100/paper-detail/71863 [S].

**A9. How institutions already expose citations (precedents to copy or avoid).**
- LoC item JSON returns a `cite_this` object with `apa`, `mla` and `chicago` strings (see E3). NARA Catalog/DocsTeach document pages show a "Citation Text" line in NARA's formula (see E3). YIVO's exhibit lists each artifact with a credit line and has an "Exhibition Credits" page naming curators, three scholar reviewers (Kassow, Polonsky, Zapruder), an educational consultant, translators, developer and funder. https://museum.yivo.org/exhibitions/yitskhok-rudashevski/exhibition-credits (fetched 2026-10-08) [V].
- NYT/ProPublica-style "source note" patterns: not retrieved (gap). One search summary says NYT and Washington Post data journalism rarely linked datasets and fewer than 2 in 10 articles had a methods section [S, low].

---

### 1b. Evidence tiers and transparency

**B1. The Smithsonian has a published AI-disclosure rule with a reusable formula.**
It identifies "substantive AI-generated content" (including text not significantly revised, and images, audio or video fully or partly made with generative AI) via a footnote, caption or other clearly visible means. The disclosure formula is Content format + Role of SI staff + Role of AI, with four worked examples (for example an image conceived by a curator, produced with AI, reviewed by the design team for accuracy). It also says staff review AI-drafted alt text before posting and that an internal process reviews AI use cases by impact. https://www.si.edu/about/ai-use-statement (page undated; fetched via in-app browser 2026-10-08; a TORCH post of July 2025 describes the policy, `torch.si.edu/2025/07/...`, not fetchable) [V].

**B2. Elsewhere there is little that is both published and specific.**

| Body | What exists | Evidence |
|---|---|---|
| American Alliance of Museums | Article (2025-05-30) says AAM has published no AI standards; a survey it cites found 21% of 48 museum professionals aware of an AI governance policy at their institution; it advises institution-specific frameworks | [V] https://www.aam-us.org/2025/05/30/beyond-it-solving-for-ethical-ai/ |
| Museums Association (UK) | Revised Code of Ethics approved by 91% of members, Oct 2025; three principles incl. "transparent and accountable"; no AI-specific clause verified | [S] Farrer summary (page 403) |
| Austrian Museums Association | AI labelling guidelines for museums, with a custom AI label icon, built with 14 museums and a lawyer to meet EU AI Act duties; published 2026-08-12; German original, English adaptation "under way"; label tiers/wording not on the news page | [V] https://www.ne-mo.org/news-events/article/austrian-museums-association-publishes-guidelines-for-ai-transparency-and-content-labelling/ |
| British Museum | Removed AI-generated images after backlash (Feb 2026) and said it is writing museum-wide guidelines | [S] artnet and PetaPixel snippets |
| Getty, Science Museum Group, V&A | No public policy found | negative result of one search |
| ICOM | 2025 General Assembly resolution recommending a Working Group on Digital Ethics and AI | [S] AVICOM newsletter snippet |
| Wikimedia Commons | AI-generated media guideline since June 2024: scope test, `{{PD-algorithm}}` tag, categorisation | [S] |

**B3. The London Charter is the nearest standard for "record vs reconstruction".**
Version 2.1 (Feb 2009) has six principles (implementation; aims and methods; research sources; documentation; sustainability; access). It requires visualisations to convey the status of the knowledge shown, "evidence" versus "hypothesis" and levels of probability, and principle 4.6 asks for documentation (paradata) of interpretive decisions so the path from sources to the model can be understood. https://londoncharter.org/introduction.html [V summary]. A survey of heritage uncertainty visualisation says no standard scale or vocabulary exists; methods in use are colour coding, transparency, wireframe, line sharpness and overlaying a schematic on a photorealistic render [S, search summary of several papers; e.g. https://isprs-archives.copernicus.org/articles/XLII-2-W9/409/2019/isprs-archives-XLII-2-W9-409-2019.pdf, 2019].

**B4. "Speaking historical figure" precedents differ in what they generate.**
USC Shoah Foundation's Dimensions in Testimony plays back pre-recorded answers chosen by language matching (not generative text); critics note decontextualised short answers [S]. Dali Lives (2019) was disclosed as AI [S]. Anne Frank House (2024) uses a consenting named person's AI avatar (doc 02, [V]). I found no literature on an illustrated avatar that speaks only pre-verified lines, which is the IHH design.

**B5. Legal context for a Texas non-profit (secondary sources only, not legal advice).**
Texas TRAIGA (HB 149, effective 2026-01-01): consumer-facing AI-disclosure duties fall only on government agencies and health-care providers; no disclosure duty for other private entities [S: HCH Lawyers 2026-02, natlawreview, Perkins Coie]. Texas SCOPE Act (HB 18, 2023) is partly enjoined; the Fifth Circuit upheld the injunction in July 2026 on a 2-1 vote; age-registration and several parental-rights provisions remain [S: Bloomberg Law, Hunton]. EU AI Act Art. 50 (applies from 2026-08-02) is covered in B1-R1.

**B6. C2PA / Content Credentials on a static site: technically small, trust-gated in practice.**
- Format and tooling: C2PA spec v2.3 (Dec 2025) [S]. c2pa-rs supports JPEG, PNG, WebP, AVIF, SVG, MP4, MOV, MP3, WAV; GIF/AVI use a `.c2pa` sidecar [S: docs search summary; the docs pages 404ed on fetch]. `c2patool` v0.27.22 (2026-09-10) has a macOS universal zip of 20.6 MB (Linux 11.3 MB, Windows 10.9 MB), crate licence MIT/Apache-2.0; `c2pa` crate v0.91.2 (2026-10-06) [V via GitHub API, not downloaded].
- Trust: self-signed certificates work for tests; production trust needs a certificate from a CA on the official C2PA Trust List, which in turn is tied to a product passing the C2PA Conformance Program; verifiers report `signingCredential.untrusted` otherwise. DigiCert post 2026-08-13 [V summary]; SSL.com and others [S].
- Delivery: Cloudflare's "Preserve Content Credentials" belongs to Cloudflare Images transformations of remote images (resized outputs get a new signed manifest); I found no equivalent for Pages static assets. Files served byte-identical would keep an embedded manifest. Social platforms, screenshots and optimisers commonly strip metadata [S]. https://developers.cloudflare.com/images/optimization/transformations/preserve-content-credentials/index.md [V summary].
- Generators: Adobe Firefly, OpenAI and Google Imagen embed C2PA in output; OpenAI added SynthID watermarking in May 2026 because metadata alone is not durable [S, aggregator articles; low].

---

### 1c. Teacher toolkit

**C1. IHH's Texas plan is confirmed by IHH itself.**
Home page: "A new museum coming to Central Texas" and "an interactive national museum in Central Texas". Mission page: "a large national museum in Texas where visitors learn, often in interactive fashion". Privacy policy (Last Updated 2026-09-17) refers to plans for a future museum in Central Texas. Leadership page lists the founder Sara Puig Laas as (1930-2026). The Austin Chamber directory lists IHH at 3820 Hermalinda St, Austin [S]. IHH's site is English-only (no `hreflang`, no translation widget); first-generation storytelling intake says stories in other languages will be translated into English for the archive. https://immigranthallofhonor.org/ , /mission-and-vision/ , /leadership/ , /privacy/ , /tell-your-story/first-gen-immigrants/ (read by same-origin fetch in the in-app browser, 2026-10-08) [V].

**C2. Standards: Texas is in transition, so alignment must name which TEKS.**
- Texas SBOE adopted new social studies TEKS and a required literary-works list on 2026-06-26 (chronological framework). TEA's slide deck (published 2026-08-20) gives a staggered start: grades K-5 in 2030-31, grade 6 in 2031-32, grades 7-8 in 2032-33, grades 9-12 in 2033-34. The current TEKS stay in force until then. https://sboe.texas.gov/state-board-of-education/sboe-news/texas-state-board-of-education-adopts-new-social-studies-standards-and-required-literature-reading-list ; https://tea2.tea.texas.gov/educators/superintendents/literary-works-and-social-studies-teks-k-12-published-august-20-2026.pdf (text extracted with pdftotext) [V].
- Current high-school course "United States History Studies Since 1877" (19 TAC 113.41; implemented 2024-25, amended eff. 2024-08-01) contains hooks I read in the raw text: (c)(7)(A) Celebrate Freedom Week study of the Declaration includes "our people as a nation of immigrants"; (d)(6)(A) analyse immigration among 1920s events and issues; (d)(27) science, technology and society (communication and satellite/GPS-type innovations); (d)(28) analyse primary and secondary sources, apply historical inquiry, evaluate sources for validity, credibility, bias and accuracy, and communicate a claim supported by evidence and reasoning; (d)(29)(A) create presentations "including proper citations and avoiding plagiarism". https://www.law.cornell.edu/regulations/texas/19-Tex-Admin-Code-SS-113-41 (fetched 2026-10-08) [V].
- Grade 8 TEKS (113.20) cover the colonial period through Reconstruction [S, search summary of the 2011-12 text], so the five inductees' stories (1850s-2000s) fit the high-school course better than grade 8. Other courses (ELA, science, Texas history) not checked.
- C3 Framework (NCSS, 2013): Inquiry Arc with four dimensions; Dimension 3 covers evaluating sources and using evidence; for grades 6-8 it names origin, authority, structure, context and corroborative value [S].
- Google's structured-data docs list "Texas Essential Knowledge and Skills (TEKS)" among standards usable in `educationalAlignment`. Google's Education Q&A feature accepts only `Quiz` flashcards (`eduQuestionType: Flashcard`); Course Info, Claim Review, Learning Video (and others) were phased out of Search on 2025-09-08 and Practice Problem in Jan 2026. schema.org `LearningResource` and `Quiz` are in the "new" area; Quiz is on 1K-10K domains (Aug 2026). https://developers.google.com/search/docs/appearance/structured-data/education-qa ; https://developers.google.com/search/blog/2025/06/simplifying-search-results ; https://schema.org/LearningResource ; https://schema.org/Quiz (GDK/fetch 2026-10-08) [V].

**C3. LoC and NARA tools and their reuse terms.**
- LoC Primary Source Analysis Tool: a one-page PDF (about 56 KB) with Observe / Reflect / Question columns and a "further investigation" box; 12 teacher's guides (primary sources in general, books, charts and graphs, manuscripts, maps, motion pictures, newspapers, oral histories, photographs and prints, political cartoons, sheet music, sound recordings). LoC's teacher pages point to "Primary Source Sets" for educators and "Free to Use and Reuse" sets for general audiences. https://www.loc.gov/programs/teachers/getting-started-with-primary-sources/ (JSON API view) [V summary].
- LoC legal notice: materials on its sites are for reference use only; users must judge copyright status and obtain permission where needed; links are not endorsements. https://www.loc.gov/legal/ (JSON API view) [V summary]. Whether the PSAT PDF itself may be re-hosted is not stated there; I did not find a rights line (open question).
- NARA DocsTeach (a National Archives Foundation resource): 13,639 documents, 294 activities visible to visitors plus 427 more for members, 63,773 registered members, 12 activity-building tools (named in the creation guide: Making Connections, Finding a Sequence, Seeing the Big Picture, Analyzing a Document, Weighing the Evidence, Mapping History, Interpreting Data; others not listed there). Free registration is needed to create and save activities. Activities carry a CC0 dedication per the creation guide; document pages carry per-document rights lines such as "Public Domain, Free of Known Copyright Restrictions". https://docsteach.org/ (read in browser 2026-10-08); https://docsteach.org/resources/guide-creating-activities [V summary].

**C4. Educator-ready LoC, NARA and agency items per inductee (all fetched or searched 2026-10-08).**

| Inductee | Items (identifiers) | Notes |
|---|---|---|
| Einstein | DocsTeach "Declaration of Intention for Albert Einstein" (NAID 596270; filed 1936-01-15; Petitions for Naturalization, RG 21, National Archives at New York; Public Domain Mark) with activities "Guess Who?" (White Out/Black Out tool, printable worksheet), "Analyzing Einstein's Citizenship Application" (lesson) and "The Constitution in Action: Article I". DocsTeach "Letter from Albert Einstein to President Franklin D. Roosevelt" (NAID 16608874; dated 1939-08-02; FDR Library; CC0). NARA College Park highlight of Einstein's 1947 atomic-war letter (NAID 7873451). LoC Albert Einstein Papers (MSS19596, 40 items, 1916-1953) and LoC research guide "Annus Mirabilis of Albert Einstein" | Strongest teacher-ready set of the five. The DocsTeach page for the FDR letter says no activity currently uses it. https://docsteach.org/documents/document/declaration-intention-einstein ; https://docsteach.org/document/letter-from-albert-einstein-to-president-franklin-d-roosevelt/ ; https://www.archives.gov/college-park/highlights/einstein-letter ; https://hdl.loc.gov/loc.mss/eadmss.ms009078 ; https://guides.loc.gov/einstein-annus-mirabilis |
| Muir | LoC lesson plan "The Conservation Movement at a Crossroads: The Hetch Hetchy Controversy" (one to two weeks; uses Muir's *My First Summer in the Sierra* and *Our National Parks* plus Chronicling America; no standards field in the JSON). LoC item *Our National Parks* (call no. E160 .M95; rights statement "public domain and free to use and reuse"). DocsTeach photograph "Theodore Roosevelt, John Muir and Others at Yosemite National Park" and activity "Theodore Roosevelt: Conservationist President" (grades 3-8). LoC portraits (for example item 93505505) | https://www.loc.gov/classroom-materials/conservation-movement-at-a-crossroads-the-hetch-hetchy-controversy/ ; https://www.loc.gov/item/01026282/ ; https://docsteach.org/document/roosevelt-muir-yosemite/ ; https://docsteach.org/activities/teacher/theodore-roosevelt-conservationist-president. The lesson length is a poor fit for quick classroom use. |
| Lamarr | NARA Catalog patent case file no. 2,292,387 (NAID 167820368); NARA Prologue blog "The World War II-Era Actress Who Invented Wi-Fi: Hedy Lamarr" (2020-05-26); USPTO Inventor Trading Card page and USPTO Kids/educators hub | No LoC or DocsTeach item found. https://catalog.archives.gov/id/167820368 ; https://prologue.blogs.archives.gov/2020/05/26/the-world-war-ii-era-actress-that-invented-wi-fi-hedy-lamarr/ ; https://www.uspto.gov/learning-and-resources/kids-educators/inventor-cards/hedy-lamarr [S] |
| Albright | State Dept Office of the Historian biography (first woman Secretary of State; confirmed 1997-01-22; served to 2001-01-20); LoC Madeleine Korbel Albright papers (donated 2014; finding aid ms018034); LoC blog "Madeleine Albright: A Life of Courage and Commitment" (2022-03); Clinton Presidential Library online exhibits | No DocsTeach item found. https://history.state.gov/departmenthistory/people/albright-madeleine-korbel ; https://blogs.loc.gov/loc/2022/03/madeleine-albright-a-life-of-courage-and-commitment/ [S] |
| Naismith | LoC blog "A Voice from Hoops History" (2016-03): a 1939 "We the People" radio recording of Naismith, about 2.5 minutes, in the digitisation queue at that date; LoC research guides "Basketball: Topics in Chronicling America" and "Basketball - Sports Industry"; Springfield College and KU Libraries pages (outside LoC/NARA) | Public availability of the recording today is unconfirmed (B1 noted a KU voice restriction). https://blogs.loc.gov/loc/2016/03/a-voice-from-hoops-history/ ; https://guides.loc.gov/chronicling-america-basketball [V summary/S] |
| Immigration (all) | LoC primary source set "Immigration Challenges for New Americans" (21 items, grades 6-8 and 9-12, teacher's guide PDF); LoC lesson "The Immigrant Experience: Down the Rabbit Hole"; NARA education blog "Immigration Primary Sources & Teaching Activities" (2021-02-01); DocsTeach lesson "Immigration to America: Stories and Travels" | https://www.loc.gov/classroom-materials/immigration-challenges-for-new-americans/ ; https://education.blogs.archives.gov/2021/02/01/immigration-resources/ [V/S] |

**C5. Precedents for a teacher kit.**
- YIVO's Rudashevski exhibit: 7 chapters, 8 artifacts, a "Moral Choices" reflection section, a downloadable grades 9-12 teacher guide; a search snippet says the guides "have not yet been tested with classrooms" [S; the guide PDF 404ed]. https://museum.yivo.org/exhibitions/yitskhok-rudashevski [V for page structure].
- NPS Lewis Mountain (doc 02 [V]): five short videos with follow-up activities, standards-aligned, named advisor and funders.
- Reading Like a Historian (Digital Inquiry Group): 234 free lessons (151 U.S. history), 94 available in Spanish, each built on a central question and a document set "for a range of reading skills" with a Historical Thinking Chart. https://inquirygroup.org/history-lessons [V summary].

**C6. Evidence on why teachers adopt a supplemental resource is thin, mostly dated and mostly not social studies.**
Over 90% of teachers used Google to find lessons and over 70% used TeachersPayTeachers and Pinterest (American Teacher Panel, Education Next 2018-07-06) [V] [OLD]. A 2021 RAND study (2020 data, 1,748 middle and high school teachers) found over half curated varied materials from search engines, TpT, Pinterest and College Board sites [S via Fordham]. RAND's American Instructional Resources Survey covers ELA, math and science (RRA134-24; page 403 on fetch). Milman and Bondie (2012, CITE Journal) on digital primary-source lesson plans: main barriers were lack of training or relevant experience and perceived access; time was a likely obstacle [S] [OLD]. No post-2020 social-studies-specific adoption survey was found. https://www.educationnext.org/edstat-according-american-teacher-panel-data-90-percent-teachers-reported-using-google-find-lessons/ ; https://fordhaminstitute.org/national/commentary/unexamined-cost-teachers-time-spent-choosing-instructional-materials ; https://citejournal.org/volume-12/issue-4-12/social-studies/an-examination-of-teachers-ratings-of-lesson-plans-using-digital-primary-sources/

**C7. Google Classroom sharing needs no script.**
Google's current developer page offers a script-based "Share to Classroom" button, and says you can instead link to `https://classroom.google.com/share?url={url}` to control appearance and behaviour yourself. https://developers.google.com/workspace/classroom/guides/sharebutton (GDK, 2026-10-08) [V].

---

### 1d. Learning mechanics

**D1. Feedback content matters more than the presence of a quiz.**
Wisniewski, Zierer, Hattie, "The Power of Feedback Revisited", Frontiers in Psychology (2020-01-22): 435 studies, 994 effect sizes, over 61,000 participants; overall d = 0.48; reinforcement/punishment d = 0.24 (39 effects), corrective feedback 0.46 (238), high-information feedback 0.99 (42); 17% of effects were negative. https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full [V summary]. This refines B1's single "g 0.5-0.6 with feedback" figure for retrieval quizzes.

**D2. "Myth vs record" has a research-based structure, but history-specific evidence is thin.**
- The Debunking Handbook 2020 (Lewandowsky, Cook, Ecker, Albarracin and 18 co-authors; consensus document, Oct 2020): lead with the fact if it is short and sticky; warn that a myth is coming and state the myth once; explain how it misleads (why it seemed true, why it is wrong, why the alternative is right); end by restating the fact with an alternative causal account. It says backfire effects are rarer than once feared and should not stop anyone correcting. Read from the PDF text (sciencelearning.umd.edu mirror) [V]: https://sciencelearning.umd.edu/files/2020/10/DebunkingHandbook2020.pdf
- Refutation-text meta-analysis: Danielson et al., Educational Psychologist 60(1), 2025: 76 studies, 111 samples, 294 effects; consistent advantage over non-refutation text for scientific misconceptions; the 26 moderators neither strengthened nor weakened it [V abstract]. https://par.nsf.gov/biblio/10629626. An earlier meta-analysis (44 comparisons, n = 3,869, g = 0.41) [S]. Eighth-grade study: confident misconceptions were corrected more often after refutation text (hypercorrection), low-confidence ones were not (Frontiers in Psychology 2020) [S]. Evidence specific to historical myths: none found.

**D3. "What would you do" prompts exist as open reflection, not scored choices, in the best-documented precedent.**
YIVO's "Moral Choices" panel poses questions such as which one document or thing the learner would save and why, flagged as about two minutes, with no score or branching [V, in-app browser]. For branching historical narratives I found small studies (for example an Athens Agora study with 14 educators and 15 adolescents) and no meta-analysis [S].

**D4. Measuring use without tracking minors: what is in force and what IHH runs today.**
- IHH's privacy policy (Last Updated 2026-09-17) states the site is not directed to children under 13 and lists Google Analytics (`_ga` cookie), Google Tag Manager and Feathr (marketing). A separate origin for the showcase would not inherit them unless embedded in the WordPress page [V on policy; inheritance is my inference].
- FTC guidance: COPPA applies to child-directed sites and to general-audience sites with actual knowledge of under-13 users (actual knowledge can arise from age questions or grade-level questions) [V summary, https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites]. Amended rule published 2025-04-22, effective 2025-06-23, most substantive duties enforced from 2026-04-22; persistent identifiers are personal information, with an internal-operations exception that carries notice duties [S, law-firm summaries].
- Cookieless counters: Cloudflare Web Analytics works without proxying through Cloudflare and does not log query strings (FAQ; cookie/IP behaviour not stated on the page); GoatCounter and Plausible Community Edition advertise no cookies and no personal data (Plausible CE is AGPL) [S]. None of these vendors' own COPPA or FERPA position was found. https://developers.cloudflare.com/web-analytics/faq/ [V partial].
- Quiz answers can be scored in the browser without leaving the device (design observation, not a finding).

---

### 1e. Cite-this-page generators

**E1. Editions in force.**
APA 7: the official "common reference examples" handout is dated "Last updated March 3, 2026" (read from PDF text, [V]; https://apastyle.apa.org/instructional-aids/reference-examples.pdf). Chicago 18th edition (print 2024-09-19; online edition announced 2024-08-15): notes-bibliography no longer requires place of publication for books and lists up to six authors [S: CMOS Shop Talk, libguides]. MLA 9: the MLA Style Center describes the container model (author, title of page, website as container, publisher, date, URL) [V summary]. The CSL repository files confirm edition targets: `apa.csl` = "APA Style 7th edition" (updated 2026-02-07), `chicago-notes-bibliography.csl` = "Chicago Manual of Style 18th edition (notes and bibliography)" (2025-02-09), `modern-language-association.csl` = "MLA Handbook 9th edition (in-text citations)" (2026-02-03; the works-cited variant was not checked) [V via raw GitHub].

**E2. Web page formats (template form).**

| Style | Reference-list entry | Notes |
|---|---|---|
| APA 7 | Author. (Year, Month Day). Title of page. Site Name. URL | No date: write (n.d.) and add "Retrieved Month Day, Year, from URL" for pages that change. Official handout is the source [V]. |
| MLA 9 | Author. "Title of Page." Website Title, Publisher, Day Mon. Year, URL. | Omit "https://"; access date optional (useful if undated or likely to change) [V summary]. |
| Chicago 18 (notes) | Author, "Page Title," Site, Publisher, Month Day, Year, URL. (organisation as author when no person) | Use "accessed Month Day, Year" or "last modified ..." when no publication date; list under the site owner in the bibliography [V summary of the CMOS quick guide, 18th edition]. https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html |

**E3. Archival items: what LoC, NARA and DocsTeach actually emit.**
- NARA formula (General Information Leaflet 17, "Citing Records in the National Archives of the United States", revised 2010; leaflet text extracted [V]): item title; date; series; record group; repository; for digitized items add the Catalog URL and date accessed. DocsTeach prints a "Citation Text" in this style; for Einstein's 1936 declaration it reads: Declaration of Intention for Albert Einstein; 1/15/1936; Petitions for Naturalization, 1838 - 1988; Records of District Courts of the United States, Record Group 21; National Archives at New York, New York, NY [V summary of the DocsTeach page]. https://www.archives.gov/files/publications/general-info-leaflets/17-citing-records.pdf
- LoC `cite_this` (JSON API) for the book *Our National Parks* returns an APA string "Muir, J. (1901) Our National Parks. Boston, New York, Houghton Mifflin and company. [Pdf] Retrieved from the Library of Congress, https://www.loc.gov/item/01026282/." and parallel MLA and Chicago strings [V]. For a creator-less photograph (item 93505505) the strings are malformed (a stray ". ," after the title and "Retrieved from" with no retrieval date) [V]. These strings do not match APA 7 (which drops "Retrieved from" unless a date applies), so reusing them as-is would not meet a teacher's style requirement. Observation from the returned JSON on 2026-10-08.
- APA and MLA archival and photograph forms were found only in university library guides, not in the official manuals (APA site returned an empty page): APA photograph pattern "Title (date) [Photograph]. Collection (identifier). Repository, Location. URL"; MLA pattern "Creator. Title or description. Date. Collection. Identifier. Repository, Location. URL." [S]. Treat as unverified.

**E4. Tooling and licences (npm/GitHub APIs and Context7, 2026-10-08).**

| Component | Version / date | Licence | Notes |
|---|---|---|---|
| Citation.js (`citation-js`, `@citation-js/core`, `@citation-js/plugin-csl`) | 0.9.0; repo pushed 2026-10-02 | MIT | Built-in CSL styles are only `apa`, `vancouver`, `harvard1`; any other style (MLA, Chicago) must be registered from CSL XML via `config.styles.add`. Built-in locales: en-US, es-ES, de-DE, fr-FR, nl-NL [V, Context7 `/citation-js/citation-js`] |
| `citeproc` (citeproc-js) | npm 2.4.63 (npm record last modified 2023-04-17); GitHub `Juris-M/citeproc-js` pushed 2026-07-05 | CPAL-1.0 or AGPL (npm metadata "CPAL-1.0 OR AGPL-1.0"; LICENSE file says CPAL, or AGPL v3 or later) | Required by `@citation-js/plugin-csl`. Takes CSL-JSON items; type `webpage` with `accessed`; engine needs `retrieveLocale` and `retrieveItem` [V] |
| CSL style files | repo `citation-style-language/styles` pushed 2026-10-07 | CC BY-SA 3.0 | Share-alike applies to the style files themselves [V] |

**E5. A standards hook for the generator.** TEKS 113.41(d)(29)(A) asks students for "proper citations", and (d)(28) asks them to evaluate sources for validity, credibility and bias (C2).

---

### 1f. Language and reading level

**F1. Federal plain-language guidance gives process, not a grade target.**
The Federal Plain Language Guidelines moved to digital.gov (plainlanguage.gov returns a 301 to it). The guide covers principles, writing, design and testing for understanding, is aimed at web managers and content strategists, and its overview names no reading-grade target; the Plain Writing Act of 2010 requires content written for its specific audience. https://digital.gov/guides/plain-language (page undated, fetched 2026-10-08) [V summary]. Claims of a "grade 8-9" federal target appear in state-government pages and blogs [S] but I did not find it in the federal text. WCAG 2.2 SC 3.1.5 Reading Level is AAA: text needing more than lower-secondary reading ability (about nine years of schooling) needs supplemental content or a simpler version; the page notes readability formulas are contested and gives a 5%-of-content rule for multilingual pages. https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html [V summary]. Reviews summarised by the Center for Plain Language and Canada's Translation Bureau call readability formulas unreliable and recommend user testing [S].

**F2. Text over imagery and foreign phrases.**
WCAG 1.4.3 requires 4.5:1 (3:1 for large text); technique G83 names "background images that do not provide sufficient contrast" as a failure; the Understanding page does not discuss scrims by name. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html [V summary]. SC 3.1.2 Language of Parts (AA): quoted passages in another language need a `lang` attribute (for example a Spanish phrase or a German quotation); proper names and fully adopted terms are exempt. https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html [V summary]. Museum alt-text guidance: Cooper Hewitt's guidelines (built with Smithsonian museums) define alt text as a short sentence fragment of about fifteen words naming the most important content. https://cooperhewitt.org/cooper-hewitt-guidelines-for-image-description/ [S].

**F3. Spanish: demand is plausible, IHH practice is English-only.**
- IHH: all pages checked (home, mission, leadership, privacy, The Americas, Celia Cruz inductee page, tell-your-story) are English; the Cruz page carries only the Spanish catchphrase in the text; no translation plugin or language alternates. [V]
- Texas: 1,345,042 emergent bilingual students, 24.3% of all students in 2024-25; Spanish is the home language of 92% of them [S, TEA charter-application webinar PDF cited in a search summary; the PDF 404ed for me]. https://tea.texas.gov/texas-schools/texas-schools-charter-schools/charter-application-webinar-emergent-bilingual-2025-2026.pdf
- Precedents with Spanish: Reading Like a Historian (94 lessons in Spanish, [V summary]); Anne Frank House 3D tour avatar in English, Spanish, Dutch and German (doc 02). No Spanish source material for the five inductees was checked in this route.

**F4. Baseline reading level of IHH's own inductee bios (exploratory, low confidence).**
I computed a rough Flesch-Kincaid grade with a hand-written syllable heuristic on the biography paragraph of each live IHH inductee page: Muir 9.2 (111 words), Albright 8.0 (93), Lamarr 15.6 (68), Einstein 15.3 (195; the slice may include non-bio text), Naismith 17.0 (74). Samples are tiny and few sentences inflate the score, so this shows only that some bios are written in long sentences. The same pages list sources in one line (for example "Britannica, Nobel Prize, Mystic Stamps" for Einstein; Muir's list still shows "Grammys").

---

### 1g. Counter-route: do footnotes and evidence UI hurt casual engagement?

- I found **no study that measures engagement or learning loss from inline citation markers or evidence layers** on a biography or museum page. Eye-tracking searches returned general reading-distraction work only (static distractions did not harm university students' comprehension of expository text, per a search summary) [S].
- What exists is indirect and points two ways. Against heavy markup: Nielsen's progressive disclosure (show a few important options first; rarely more than two disclosure levels, users must know how to reach and what they will find; 2006-12-03) [V summary, https://www.nngroup.com/articles/progressive-disclosure/] [OLD]; NN/g on mobile accordions (hidden content may go undiscovered; disorientation; 2015-05-31) [V summary] [OLD]; hypertext load (A8). For a visible-but-quiet layer: citations function as a trust cue (A6), and almost no one clicks them (A5), so their cost to readers who ignore them is visual clutter and cognitive load rather than navigation.
- Teachers and students are the audiences who do verify. Texas standards require students to evaluate source credibility and cite (C2), and the teacher interview asked for linked primary sources and a bibliography with years.
- Progressive-disclosure evidence comes from interface tasks (menus, forms, settings), not from reading narrative text; transfer to museum storytelling is assumed, not shown.

---

## 2. Per-finding confidence

| ID | Finding | Confidence | Why |
|---|---|---|---|
| A1 | DPUB-ARIA roles and back-link practice for footnotes | Med | Role definitions are standard; real AT support not tested; sources are a KB page and a vendor blog |
| A2 | Wikipedia: hover previews desktop-only; mobile uses a drawer | High (previews); Med (drawer) | Official MediaWiki/Meta pages read; mobile drawer from Phabricator search snippets |
| A3 | Hover fails on touch; toggletip and WCAG 1.4.13 rules | High | NN/g, W3C and Pickering agree; Pickering is 2017 but the platform facts have not changed |
| A4 | Popover/anchor/details support table | Med-high | Vendor docs with support tables; `hint` and `interestfor` status ambiguous |
| A5 | Reference click-through 0.29% (0.13% mobile) | High for Wikipedia 2020; low for transfer | Abstract read; context differs from a museum |
| A6 | Citations raise credibility independent of checking; can mislead | Med | One 2025 conference paper (abstract), a 2002 guideline and one 2023 N = 90 study; field results mixed |
| A7 | No museum precedent for evidence-mode toggle | Low-med | Absence of evidence from search; analogues are research prototypes or start-ups |
| A8 | Old footnote/hypertext guidance | Low | 2004 blog and 2007 review, pre-2024, summaries only |
| A9 | LoC/NARA/YIVO citation and credit displays | High | JSON, raw PDF and page text read |
| B1 | Smithsonian AI disclosure formula | High | Official page read in full; undated |
| B2 | Other museum bodies: AAM none; Austria guidelines; BM backlash | Med | AAM and NEMO pages read; BM and MA from snippets; negative results for Getty/V&A come from one search |
| B3 | London Charter evidence vs hypothesis; no standard uncertainty scale | Med-high | Charter text read via summary; uncertainty survey from search summary |
| B4 | DiT is not generative; no illustrated-avatar literature | Low-med | Snippets only; absence claim |
| B5 | Texas TRAIGA/SCOPE | Low | Law-firm summaries; no legal review |
| B6 | C2PA: easy to sign, hard to be trusted; stripped in transit | Med | Tool releases verified by API; trust-list facts from vendor and aggregator pages; docs pages 404ed |
| C1 | IHH Texas plan, English-only, founder dates | High | Read directly on IHH site |
| C2 | TEKS transition (2030-31 to 2033-34) and 113.41 hooks | High | TEA PDF and statute text extracted raw; Grade 8 scope is secondary |
| C3 | LoC PSAT, LoC legal notice, DocsTeach scale and licences | Med-high | JSON API and browser reads; rights for PSAT PDF itself unknown |
| C4 | Per-inductee items and identifiers | Med | Einstein/Muir/immigration items read; Lamarr/Albright/Naismith items from search results; Naismith recording status as of 2016 |
| C5 | YIVO, NPS, Reading Like a Historian as kit precedents | Med | YIVO page read; teacher-guide test note is a snippet |
| C6 | Teacher-adoption evidence is thin and old | High (that it is thin) | Searches for social-studies surveys after 2020 found none |
| C7 | Classroom share link needs no script | High | Official developer doc |
| D1 | Feedback effect sizes by type | High | Full-text summary of a large meta-analysis (2020) |
| D2 | Debunking structure; refutation meta-analyses; no history evidence | High (structure, science); low (history) | Raw handbook text and abstracts read |
| D3 | Reflection vs scored choices; branching evidence weak | Med | YIVO page read; the rest from snippets |
| D4 | IHH analytics stack; COPPA outline; cookieless options | Med | IHH policy read; COPPA from FTC page plus law-firm summaries; vendor claims unverified |
| E1-E3 | Style editions and templates; LoC/NARA emitted strings | High (APA, NARA, LoC JSON); Med (MLA, Chicago); Low (APA/MLA archival) | APA PDF and NARA leaflet read raw; MLA/Chicago via summaries; archival forms from library guides |
| E4 | Tool licences and style coverage | High | npm/GitHub API and Context7 |
| F1 | No federal grade target in the guide overview; WCAG AAA 3.1.5 | Med | Overview page only; full guide pages not read |
| F2 | Contrast and language-of-parts rules | High | W3C pages |
| F3 | Spanish: IHH English-only; Texas 24.3% EB | High (IHH); Low-med (TEA number) | TEA PDF unreadable; figure from a search summary |
| F4 | Bio reading-level baseline | Low | Crude heuristic on tiny samples |
| G | No direct harm evidence; indirect signals only | Med (that none exists) | Several targeted searches returned nothing direct |

---

## 3. Contradictions and disputed points

1. **Citations as trust cue vs citations as accountability.** Stanford (2002) and the AAAI-25 study say the mere presence of citations raises credibility (random citations worked), while the same AAAI study found trust falls when people check them. For IHH this means a visible citation layer can raise perceived credibility more than verified support justifies, which only the sources' real support prevents.
2. **Low use vs teacher need.** Citation click-through is about 0.3% on Wikipedia, yet the teacher persona and TEKS (d)(28)-(29) treat source evaluation and citation as core tasks. Different audiences; not reconciled by any study I found.
3. **Transparency boxes.** One mock-site test found no credibility gain, field tests with a prominent box found a gain, a less prominent box did not; attention to the box was not tied to credibility. Results are not stable across designs.
4. **Disclosure frameworks disagree on form.** Smithsonian: sentence-level role statement; Austrian association: a standard AI icon plus guidance; Wikimedia Commons: licence tag and category; AAM: no standard. No shared tier vocabulary for "record / reconstruction / AI recreation" exists; the London Charter's evidence/hypothesis language is the closest.
5. **Hover patterns.** Wikipedia ships hover previews (desktop only) while Chrome's own interest-invoker work says the touch model is unresolved and NN/g says tooltips are not available on touch. The platform is converging, but not finished.
6. **Search-summary error on Einstein's NARA record.** An early search summary showed a NARA citation example "Declaration of Intention for Albert Einstein, 10/1/1940" for NAID 596270. The DocsTeach page for the same NAID gives 1/15/1936 and prints that date in its own citation text; the 1940 date matches his naturalisation, not the declaration. I treat 1936 as correct and flag the summary as unreliable.
7. **Fetch-summary reliability.** Two fetch summaries contradicted raw text (APA handout, NARA leaflet); raw extraction was used. Other [S] items may carry similar errors.
8. **Federal reading-level target.** Several secondary pages state a "grade 8-9" federal target, but the federal guide overview names none; WCAG AAA uses "lower secondary".
9. **Refutation evidence.** Strong in controlled science-misconception studies, thin for history; the Debunking Handbook generalises across domains but its history evidence is not shown.
10. **DocsTeach and LoC reuse.** DocsTeach activities are CC0 and many documents are marked public domain; LoC's legal notice calls its site materials "reference use only" and puts copyright diligence on the user. Linking is clearly allowed; re-hosting LoC teaching text or the PSAT PDF is not addressed.
11. **Popover support.** web.dev/Chrome pages list stable support (114/125/17) for `popover`, but the `hint` support table in the I/O 2025 recap shows version numbers (151/151/153) that I could not reconcile with the Feb 2025 "Chrome 133" announcement.

---

## 4. Open questions and assumptions

Assumptions: the audience is Texas middle and high school plus casual adults (from the brief); the deadline is 2026-11-01; "current TEKS" means the versions in force until 2030-31 (K-5) to 2033-34 (9-12).

Open questions:
- Which grade band and course does IHH want to serve? Fit with 113.41 is clear; other courses (ELA, physics, Texas history) were not checked.
- Can IHH re-host the LoC Primary Source Analysis Tool PDF, or must pages only link to it? No rights line was found.
- Does DocsTeach's CC0 dedication extend to embedding DocsTeach activity text, or only to teacher-authored activities? Documents carry their own rights lines.
- What are the official APA 7 and MLA 9 archival and photograph forms? Only library guides were reachable.
- Is a C2PA trust-list certificate attainable and affordable for a small non-profit, or would IHH publish self-signed (untrusted) credentials? Not found.
- Is any Texas or federal rule triggered by minors using a non-registering, non-collecting educational site? Needs counsel; TRAIGA and SCOPE appear not to impose AI-disclosure duties here, per secondary sources.
- Does IHH have analytics on audience age or language, and does it wish to measure learning at all? Unknown.
- Would IHH accept a Spanish layer (and who reviews it)? No demand data; IHH currently archives in English.
- What does the Naismith 1939 recording's availability look like in 2026? The 2016 post said it was not yet digitised.
- How would an evidence-mode toggle perform with real teens and teachers? Untested; no precedent.
- The TEA emergent-bilingual figures need a first-hand TEA source.

---

## 5. Implications (not a recommendation)

1. **Citation interface.** If every sentence carries fact ids, the evidence from A3-A5 implies touch needs a button-triggered reveal (toggletip or bottom sheet), not hover; most users will not open it (about 0.3% on Wikipedia), so its value is largely the visible, quiet signal plus the teacher/student minority who verify. The native `popover` attribute and `<details>` cover this on all current engines; hover declarations (`interestfor`) are not ready for touch. A plain linked bibliography with working anchors remains the baseline all other layers sit on.
2. **Layer depth.** Nielsen's two-level limit (peek at the source, then open the source page) is easy to satisfy with fact chip, then drawer, then source URL; adding "evidence mode", per-image credit panel, cite-this and archive links makes more than two levels unless grouped.
3. **Credibility depends on source integrity, not UI.** The AAAI-25 result (random citations still raised trust) means an unverified citation layer could mislead; IHH's verified-fact pipeline and cross-model adversary are what make the layer honest. Publishing the verification method is itself a transparency feature (YIVO credits pattern).
4. **Evidence tiers.** The London Charter wording (evidence, hypothesis, probability) and the Smithsonian formula (format + staff role + AI role) give two ready templates for a "how this was made" panel; no shared three-tier vocabulary exists, so IHH would define and explain its own once and apply it per scene, per prop and per avatar line. The AAM has no standard, the Austrian guidelines and the Smithsonian are the closest published practice.
5. **C2PA.** Signing images on a static build is a small task (CLI around 20 MB), but trusted verification needs a trust-list certificate; self-signed output shows as untrusted. The cheaper path is to avoid stripping credentials that AI generators already embed and to say the same thing in page text and JSON-LD.
6. **Teacher kit contents available now at no build cost.** Link-outs exist for Einstein (DocsTeach declaration, FDR letter, three activities), Muir (LoC Hetch Hetchy lesson, Roosevelt-Muir photograph activity), Lamarr (NARA patent file, USPTO), Albright (State Historian, LoC papers) and Naismith (LoC blog and research guides). The weakest coverage is Lamarr, Albright and Naismith in DocsTeach, where nothing was found. A one-page PSAT-style sheet keyed to each inductee's documents is the format teachers already use.
7. **Standards alignment.** The fit is HS US History Since 1877 (113.41(c)(7)(A), (d)(6)(A), (d)(27), (d)(28), (d)(29)). Naming current TEKS stays valid for years (new high-school TEKS take effect 2033-34), but naming the new ones would be early. Google's `educationalAlignment` can carry TEKS, though no rich result for this content type is available.
8. **Cite-this.** LoC and NARA strings cannot be reused unaltered: LoC's are not APA 7, MLA 9 or Chicago 18 conformant (stray punctuation, "Retrieved from" without date). Options are build-time formatting from CSL-JSON using Citation.js with CSL files registered for MLA and Chicago (MIT plus CC BY-SA styles; citeproc's CPAL/AGPL licence matters only if shipped to the browser), or hand-written templates for two item types (web page, archival item). IHH maintainability favours fewer moving parts.
9. **Quizzes and myth-vs-record.** In the feedback meta-analysis, high-information feedback (task, process and sometimes self-regulation information) averaged 0.99, corrective feedback 0.46 and reward/punishment-style feedback 0.24; a bare right/wrong mark is closer to the corrective category, so feedback that explains and points to a source is the higher band. A myth-vs-record card has a published template (fact, one mention of the myth, explanation of the fallacy, fact again) but no history-specific proof; reflection prompts such as YIVO's are unscored and cheap.
10. **Measurement.** The showcase can stay free of IHH's ad and analytics tags if hosted on its own origin; if a count is wanted, cookieless counters exist but their COPPA stance is vendor-claimed. Quiz results can be evaluated on-device. This keeps the minors question small, not zero.
11. **Language and reading level.** WCAG 3.1.5 (AAA) offers "lower-secondary" and a supplemental summary route; user testing outperforms formulas. A Spanish layer has demographic support (Texas about 24% emergent bilingual) but IHH is English-only today and the Nov 1 build window is short; `lang` attributes for German, Czech and Spanish quotes are an AA requirement regardless.
12. **Counter-route.** The risk of an evidence layer is clutter and load rather than lost clicks; no study isolates it. Keeping marks small, grouping sources per paragraph, and making the layer toggleable are the cheapest hedges the evidence supports, not proof that they work.

---

## 6. Query log (all dated 2026-10-08)

### 6.1 Google web (WebSearch, standard mode): 84 queries

1. DPUB-ARIA doc-noteref doc-footnote accessible footnotes popover pattern
2. Smithsonian generative AI policy museum public-facing AI disclosure 2025
3. Museums Association AI ethics guidance museums generative AI 2025
4. Library of Congress Primary Source Analysis Tool teachers observe reflect question rights
5. Immigrant Hall of Honor national museum Texas location plan Sara Puig Laas
6. C2PA Content Credentials static website images manifest embed sign open source c2patool 2026
7. Texas TEKS social studies Grade 8 United States history immigration standards 113.20 adopted 2022 revised social studies framework
8. C3 Framework for Social Studies State Standards inquiry arc Dimension 2 Dimension 3 evaluating sources NCSS
9. NARA DocsTeach tools primary source activities creating activities license reuse National Archives educators
10. Texas SBOE new social studies TEKS adopted 2025 implementation 2026-2027 school year Texas Education Agency
11. docsteach.org Einstein letter Roosevelt atomic bomb activity (domains: docsteach.org, archives.gov, catalog.archives.gov)
12. Library of Congress teachers primary source set John Muir Yosemite national parks classroom (loc.gov, blogs.loc.gov)
13. Library of Congress Hedy Lamarr patent frequency hopping 2,292,387 resources teachers (loc.gov, blogs.loc.gov, uspto.gov, archives.gov)
14. Library of Congress Albert Einstein collection finding aid Einstein Papers online exhibit (loc.gov)
15. Library of Congress "Teacher's Guides and Analysis Tool" loc.gov programs teachers classroom-materials primary source analysis tool PDF (loc.gov)
16. Chicago Manual of Style 18th edition published release date September 2024 changes notes-bibliography URLs
17. APA Style 7th edition reference webpage on a website format apastyle.apa.org examples archival document Library of Congress (apastyle.apa.org)
18. MLA Style Center how do I cite a web page MLA 9 container URL access date optional (style.mla.org)
19. National Archives how to cite records NAID citing archival documents National Archives Catalog cite as format (archives.gov, catalog.archives.gov, docsteach.org)
20. Debunking Handbook 2020 myth fact structure fact first warn explain fallacy backfire effect Lewandowsky Cook
21. refutation text meta-analysis misconceptions conceptual change learning effect size Schroeder Kucera 2022
22. Stanford Guidelines for Web Credibility Fogg make it easy to verify accuracy references sources
23. RAND teachers instructional materials survey supplemental materials how teachers find select resources Google Pinterest Teachers Pay Teachers 2024 2025
24. COPPA rule amendments 2025 final rule effective compliance date April 2026 persistent identifiers analytics children under 13 internal operations exception
25. plainlanguage.gov federal plain language guidelines reading level grade 8 average American reads writing for the web
26. social studies teachers criteria choosing online primary source resources survey time-saving standards-aligned ready to use Stanford History Education Group Reading Like a Historian adoption
27. Texas social studies TEKS 113.41 United States History Studies Since 1877 immigration skills primary sources social studies skills
28. "The Debunking Handbook 2020" pdf Lewandowsky Cook Ecker Albarracin Fact Myth Fallacy structure elements of an effective debunking
29. Wikipedia Reference Tooltips gadget mobile tap references popup Page Previews reference previews Wikimedia
30. Distill.pub hover citations footnotes interface design how to cite this article reference popover Tufte sidenotes mobile
31. Our World in Data "Cite this work" sources and processing chart data citation how to cite design
32. WCAG 2.2 1.4.13 Content on Hover or Focus dismissible hoverable persistent understanding tooltip touch mobile
33. Heydon Pickering Inclusive Components tooltips toggletips pattern accessible live region aria-describedby
34. ProPublica Sources "how we reported" source notes methodology box investigation transparency "show your work" newsroom evidence
35. interactive article toggle "show sources" highlights each claim with source link evidence overlay journalism design Washington Post New York Times annotated
36. study citations in AI answers increase user trust even when incorrect inline citation source links credibility experiment 2024 2025
37. hypertext links comprehension meta-analysis DeStefano LeFevre cognitive load reading hypertext inline links learning
38. progressive disclosure Nielsen Norman Group definition benefits mobile staged disclosure expandable content users miss hidden content
39. London Charter computer-based visualisation cultural heritage principle transparency paradata 2.1 interpretation reconstruction documentation
40. AI chatbot historical figures museum ethics Dimensions in Testimony pre-recorded answers versus generative AI avatar historical figure criticism historians
41. Getty Museum OR British Museum OR Science Museum Group OR V&A generative AI policy public content labelling statement
42. National Archives NARA AI use policy generative AI disclosure archives.gov AI strategy catalog description 2025
43. C2PA trust list signing certificate requirements conformance program self-signed certificate shows untrusted Content Credentials verify tool
44. Cloudflare Images "Preserve Content Credentials" CDN strips metadata C2PA manifest survive optimization WebP resize
45. c2pa-rs supported formats JPEG PNG WebP AVIF MP4 WAV MP3 SVG manifest sidecar .c2pa remote manifest URL
46. Madeleine Albright Secretary of State biography Office of the Historian primary sources Clinton Presidential Library National Archives teachers (history.state.gov, archives.gov, docsteach.org, clintonlibrary.gov, loc.gov, adst.org)
47. James Naismith basketball original rules 1891 Springfield primary source Library of Congress OR National Archives OR DocsTeach classroom
48. USPTO inventor cards Hedy Lamarr educators kids teachers resource (uspto.gov)
49. Library of Congress "Immigration" primary source set teachers classroom materials immigrant experience Ellis Island naturalization (loc.gov, blogs.loc.gov)
50. Wisniewski Zierer Hattie 2020 feedback meta-analysis effect size informational feedback elaborated feedback corrective
51. Google Classroom Share to Classroom button website developers add share button teachers assign link documentation
52. YIVO Yitskhok Rudashevski "Moral Choices" museum teacher guide grades 9-12 reflection questions standards aligned
53. Texas English learners emergent bilingual percent students Spanish home language TEA 2024-25 enrollment
54. Cooper Hewitt guidelines for image description museum alt text long description historical photographs documents best practice
55. readability formulas Flesch-Kincaid grade level limitations for history content proper nouns primary sources plain language testing research
56. survey teachers factors when selecting supplemental instructional materials alignment to standards ease of use free cost reliability percent EdWeek Research Center OR RAND OR Learning Policy Institute
57. social studies teachers use of digital primary sources barriers time reading level survey Library of Congress Teaching with Primary Sources evaluation study teachers adopt
58. Chicago Manual of Style Quick Guide 18th edition website citation example Accessed access date last modified note bibliography entry webpage format (chicagomanualofstyle.org, cmosshoptalk.com)
59. APA 7 reference archival document digital collection Library of Congress photograph example author date title [Photograph] collection repository URL format
60. MLA 9 cite archival material manuscript photograph digital archive Library of Congress example works cited repository collection
61. heritage 3D reconstruction uncertainty visualization level of certainty evidence-based colour coding transparency viewers misread reconstruction as fact study
62. Wikimedia Commons AI-generated images policy label AI-generated depicting historical events real people reconstruction caption guidance 2025
63. AI recreation of historical figure disclosed labeled "AI recreation" voice avatar museum exhibit Dali Lives lessons visitors reaction authenticity survey
64. Piccardi Redi Colavizza West "Quantifying Engagement with Citations on Wikipedia" reference click rate 1 in 300 page views
65. footnote markers superscript citations online reading flow eye tracking readers ignore citations study casual readers comprehension
66. Library of Congress Today in History basketball invented Naismith December 21 1891 loc.gov (loc.gov, blogs.loc.gov, archives.gov, springfield.edu, kuathletics.com, ku.edu)
67. Texas Responsible Artificial Intelligence Governance Act HB 149 effective January 1 2026 disclosure requirements who must disclose AI interaction nonprofit private entities
68. Texas SCOPE Act HB 18 digital service provider minors known to be under 18 applies scope court injunction 2025 2026 status educational websites
69. Wikipedia mobile web tap footnote reference drawer bottom sheet shows reference text instead of jumping Minerva MobileFrontend
70. digital exhibit biography each statement linked to archival source "see the evidence" OR "view sources" OR "annotated text" museum online exhibit claim-level citations precedent
71. Highwire claim-level news evidence tool traces claims to original evidence sources launched
72. Google Analytics terms children under 13 "directed to children" prohibited use Analytics policy COPPA requirement child-directed treatment
73. GoatCounter OR Plausible privacy cookieless analytics no personal data COPPA FERPA schools open source self-host free nonprofit
74. FTC amended COPPA rule 2025 Federal Register persistent identifier "support for the internal operations" analytics exception contextual advertising final rule text
75. "Declaration of Intention for Albert Einstein" "Petitions for Naturalization" "Record Group 21" National Archives at New York City catalog.archives.gov/id/596270
76. docsteach.org Hedy Lamarr patent secret communication system document (docsteach.org, archives.gov, catalog.archives.gov)
77. docsteach.org John Muir Theodore Roosevelt Yosemite national parks conservation document activity (same domains)
78. docsteach.org naturalization certificate immigration documents activity Albright OR Naismith OR Hedy Lamarr Petitions for Naturalization famous immigrants (same domains)
79. refutation text history misconceptions students historical myths correction study adolescents refutation social studies learning
80. "emergent bilingual" Texas 2024-25 "24.3" percent students TEA 1,345,042
81. NYT The Upshot OR ProPublica OR The Pudding methodology "how we did this" sources notes pattern reader trust transparency boxes research journalism transparency Nieman Lab
82. news transparency box "how we know" experiment effect on perceived credibility trust readers study 2022 2023 journalism transparency cues
83. branching narrative interactive storytelling history education learning outcomes meta-analysis digital game-based learning history choices effect size
84. AI image generators embed C2PA Content Credentials OpenAI DALL-E gpt-image Adobe Firefly Google Imagen SynthID metadata stripped by social platforms limitation

### 6.2 Google Developer Knowledge MCP (search_documents): 7 calls

G1. Popover API popover attribute accessibility light dismiss anchor positioning
G2. Google Search structured data Education Q&A Quiz flashcards learning resource markup
G3. Google Search simplifying search results phasing out structured data types 2025 LearningResource Course info practice problems deprecated
G4. web.dev accessible disclosure widget details summary expand collapse pattern ARIA tooltip toggletip
G5. interest invokers interestfor popover hint hover focus tooltip Chrome shipped
G6. CSS anchor positioning Baseline browser support Firefox Safari 2026 popover tooltip
G7. Share to Classroom button add to website developers.google.com/classroom share button

### 6.3 Context7: 4 calls

C1. resolve-library-id "Citation.js" (query: format citations MLA APA Chicago from CSL-JSON in the browser) -> `/citation-js/citation-js` (High reputation, 233 snippets)
C2. resolve-library-id "citeproc-js" (query: citation style language processor render bibliography in browser license) -> `/juris-m/citeproc-js` (High, 2,499 snippets)
C3. query-docs `/citation-js/citation-js`: format bibliography with APA, MLA, Chicago templates; register custom CSL template; built-in templates; browser use
C4. query-docs `/juris-m/citeproc-js`: licence, Processor setup with `retrieveLocale`/`retrieveItem`, `makeBibliography` for web page and archival item, CSL-JSON `webpage`/`manuscript`/`graphic` types

### 6.4 Page fetches (WebFetch; not counted toward quotas): 84

Outcomes: OK = content returned (summariser output unless noted); 403/404 = error; "raw" = I read the underlying file myself.
1 si.edu AI statement 403 (then read in browser, OK); 2 torch.si.edu 403; 3 ne-mo.org Austrian guidelines OK; 4 aam-us.org 2025/05/30 OK; 5 sboe.texas.gov news OK; 6 loc.gov Hetch Hetchy lesson ?fo=json OK; 7 loc.gov/item/01026282 ?fo=json OK; 8 loc.gov teachers guides page 403; 9 archives.gov leaflet 17 PDF (summariser failed; raw via pdftotext); 10 apastyle webpage page (empty); 11 apastyle archival page (empty); 12 style.mla.org online works OK; 13 apastyle reference-examples.pdf (summary unreliable; raw via pdftotext); 14 credibility.stanford.edu OK; 15 educationnext EdStat OK; 16 rand.org RRA134-24 403; 17 plainlanguage.gov (301); 18 digital.gov plain language OK; 19 RAND PDF 403; 20 sks.to/debunk (302); 21 skepticalscience download page OK; 22 inclusive-components tooltips OK; 23 W3C 1.4.13 OK; 24 mediawiki Reference Previews OK; 25 meta.wikimedia ReferencePreviews OK; 26 AAAI 34550 OK; 27 nngroup progressive disclosure OK; 28 londoncharter.org OK; 29 farrer.co.uk 403; 30 cultureelpersbureau OK; 31 artnet 403; 32 contentauthenticity signing-manifests 404; 33 contentauthenticity c2pa-c supported-formats 404; 34 Cloudflare preserve-content-credentials OK; 35 contentauthenticity c2pa-node-v2 supported-formats 404; 36 digicert blog OK; 37 loc immigration-challenges ?fo=json OK; 38 loc.gov/legal ?fo=json OK; 39 loc getting-started ?fo=json OK; 40 docsteach creation guide OK; 41 docsteach Einstein-FDR letter OK; 42 archives.gov Einstein letter OK; 43 tea.texas.gov charter webinar PDF 404; 44 museum.yivo.org teaching-resources 404; 45 frontiersin feedback OK; 46 tea.texas.gov/media/394316 404; 47 museum.yivo.org teacher guide PDF 404; 48 W3C 3.1.5 OK; 49 ftc.gov COPPA guidance OK; 50 Cloudflare Web Analytics FAQ OK (partial); 51 chicagomanualofstyle quick guide OK; 52-53 web.archive.org x2 blocked by tool; 54 rand.org RRA134-2 403; 55 fordhaminstitute OK; 56 arxiv 2001.08614 OK; 57 mg.pov.lt footnotes OK; 58 kb.daisy.org doc-noteref OK; 59 dubbot footnotes OK; 60 blogs.loc.gov voice from hoops OK; 61 docsteach declaration-intention-einstein OK; 62 docsteach guess-who OK; 63 par.nsf.gov 10629626 OK; 64 tea.texas.gov 26-05-113.pdf 404; 65 scttx.com TEKS OK; 66 tea2.tea.texas.gov TEKS PDF (raw via pdftotext); 67 govdelivery TEA bulletin OK; 68 ourworldindata.org/faqs OK; 69 doaj.org 403; 70 grady.uga.edu OK; 71 schema.org/LearningResource OK; 72 schema.org/Quiz OK; 73 nngroup mobile-accordions OK; 74 nngroup tooltip-guidelines OK; 75 bugs.webkit.org 249904 OK; 76 inquirygroup.org history-lessons OK; 77 loc.gov citing-primary-sources ?fo=json 404; 78 loc.gov/photos ?fo=json OK; 79 loc.gov/item/93505505 ?fo=json OK; 80 softwareseni 403; 81 W3C contrast-minimum OK; 82 W3C language-of-parts OK; 83 catalog.archives.gov/id/596270 (empty, JS app); 84 archives.gov Einstein naturalisation PDF (raw via pdftotext; scanned form with OCR text).

### 6.5 Raw probes (Bash; small, in the scratchpad, no installs)

- curl `law.cornell.edu` 19 TAC 113.41 (HTML, parsed with Python); curl Debunking Handbook (first URL returned a 526-byte error; second, the UMD mirror, returned the PDF; parsed with pdftotext); curl `apastyle.apa.org/.../archival` returned 212 bytes (bot page); curl TEA PDF 404.
- GitHub API: licences/push dates for `Juris-M/citeproc-js`, `citation-js/citation-js`, `citation-style-language/styles` and `locales`; raw CSL file headers for `apa`, `chicago-notes-bibliography`, `chicago-author-date`, `modern-language-association`; `contentauth/c2pa-rs` releases and licence.
- npm registry: `citeproc`, `@citation-js/plugin-csl`, `@citation-js/core`, `citation-js` (version, licence, dependencies); npm download stats for `citeproc` (417,850 in the month to 2026-10-04).

### 6.6 In-app browser actions (used when WebFetch returned 403 or the page needed JavaScript)

si.edu AI statement; immigranthallofhonor.org home, mission, leadership, privacy, children's-privacy and analytics text, Celia Cruz page, The Americas, tell-your-story pages and a heuristic readability pass (all same-origin fetches); docsteach.org home (a scripted DocsTeach search timed out); loc.gov (Cloudflare challenge shown; not bypassed); apastyle.apa.org (blank body); museum.yivo.org exhibit page and credits page.

Files created: only this report. Scratch files (parsed HTML/PDF text) were left in the session scratchpad.
