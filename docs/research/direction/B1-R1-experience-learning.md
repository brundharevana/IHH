# B1-R1 - Experience architecture and learning evidence

Route R1 of the IHH Challenge X direction research. Date of research: 2026-10-08. No final recommendation is given here (orchestrator decides after cross-model critique); Section 5 lists implications only.

Source-quality conventions used below:
- [V] = read on the primary/official page or abstract this session.
- [S] = taken from a search-result summary or a secondary page; the primary was blocked (403/Anubis) or not opened.
- [P] = my own live probe of a site on 2026-10-08 (Section 1d.2). Single load, desktop 1024x768 in-app Chromium, entry state only. Not a conformance audit.
- "Pre-2024" is flagged on anything older than 2024 that touches fast-moving tech. Learning-science sources are older by nature; their age is stated but not treated as a defect.
- Prior research in docs/research (00, 02, 03) is cited as "doc 02" etc. and not repeated except where this route adds to it.

---

## 1. Findings per sub-route

### 1a. Navigation models for a web virtual museum (desktop + mobile)

#### 1a.1 Evidence on the models

| Model | What the evidence says | Source | Status |
|---|---|---|---|
| Free-roam / click-anywhere 360 tours | In a think-aloud study of 14 users on Google Arts & Culture (Bode Museum) and Matterport (European Museum of Modern Art), users showed a "significant disparity between users' mental models of virtual tours and the actual system behavior". They clicked statues expecting to walk to them and were moved elsewhere; looked down hunting for floor markers and lost orientation; 12 of 14 complained that some exhibits had no nearby navigation point; many never found the floor-plan map; 13 reported too little information on exhibits; 6 wanted an upfront list of rooms. Authors' fixes: denser navigation points, multiple points around key exhibits, gaze/zoom indicators, visit history, and a room list. Desktop mouse only; mobile and VR explicitly out of scope. | Shikhri, Poretski, Lanir, "Analyzing Behavior and User Experience in Online Museum Virtual Tours", arXiv 2310.11176, submitted 2023-10-17, https://arxiv.org/abs/2310.11176 and https://arxiv.org/html/2310.11176 | [V] (n=14, small) |
| Guided by an agent vs free exploration with a companion agent | Within-subjects HMD study in a virtual museum; outcome was a preference for combining both ("being guided" and "exploratory freedom"). Guide-led gives structure and avoids missed content but makes the visitor a passive listener. | Bonsch, Hashem, Ehret, Kuhlen, "Being Guided or Having Exploratory Freedom", ACM IVA 2021, https://vr.rwth-aachen.de/publication/02201/ | [V] abstract level; HMD, not web |
| Target-selection ("Go-To", tap a destination) vs joystick/position/stroke on touch screens | Best performance with Go-To; novices preferred Go-To, experts preferred joystick. 3DUI 2014 (pre-2024; touch UI conventions are stable but device sensors and screen sizes have changed). | Jankowski, Hulin, Hachet, "A Study of Street-level Navigation Techniques in 3D Digital Cities on Mobile Touch Devices", IEEE 3DUI 2014, https://hal-univ-tlse3.archives-ouvertes.fr/INRIA/hal-00931012 (full text blocked; results from search summary) | [S] |
| Guided camera rail with optional free look (hybrid) | The National Gallery Imaginarium (Webby winner, Cultural Institutions, 2026) lets visitors "explore independently or follow guided navigation", starts with a brief tutorial in a virtual room, has "few buttons", and works on desktop, older mobile devices and tablets. Landing page says it works solo or as a shared conversation for "families, friends, or teachers". | Q42 case study https://q42.nl/en/work/imaginarium-national-gallery (fetched 2026-10-08); National Gallery page https://www.nationalgallery.org.uk/visiting/virtual-gallery/national-gallery-imaginarium ; [P] read of the live landing page | [V] |
| Chaptered narrative (numbered chapters, each its own URL, plus artifact list and reflection prompts) | YIVO's Rudashevski exhibition (2025 Webby nominee) is organised as 7 chapters (Prologue to Epilogue), each at its own URL under /experiences/, with a table of contents, a list of 8 artifacts, a "Moral Choices" reflection section, a "Next Experience" link and a credits page. Press describes about two and a half hours end to end with 3D environments and video dramatisations inside chapters. | [P] https://museum.yivo.org/exhibitions/yitskhok-rudashevski ; Webby listing https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/cultural-institutions?years=0 ; JTA 2024-07-17 https://www.jta.org/2024/07/17/ny/yivo-exhibit-illuminates-a-diary-kept-by-a-13-year-old-boy-in-the-vilna-ghetto (via search summary) | [P]/[S] |
| Scroll-driven (scrollytelling) | CHI 2026 study (N=454, online) comparing a scrollytelling prototype with plain text, two nutrition-label variants and a standalone interactive visualisation for privacy policies: scrollytelling gave higher engagement, lower cognitive load, greater willingness to adopt and higher perceived clarity; comprehension accuracy and confidence matched the other formats. Topic is privacy policies, not history, so transfer is by analogy. | Mendez and Such, "Scrollytelling as an Alternative Format for Privacy Policies", arXiv 2603.04367, 2026-03-04, https://arxiv.org/abs/2603.04367 | [V] |
| Scroll-hijacking (custom smooth scroll that overrides native behaviour) | Usability and accessibility critiques: users lose control, keyboard and vestibular-sensitive users are blocked or disoriented, touch devices can "trap" the user; remedy is to respect prefers-reduced-motion and keep native scroll. Practitioner sources, not controlled studies. | https://www.sitepoint.com/scrolljacking-accessibility/ ; https://webdesignerdepot.com/how-scrolljacking-breaks-ux-fundamentals/ (search summaries) | [S], low |
| Hub-and-spoke / constellation | No usability study found on constellation hubs specifically. Closest evidence is Shikhri (node-based tours) and the Searchable Museum case in doc 02 (flat deep-zoom hub with real 3D/360 on a separate page). | gap | none |

Unguided exploration in general (not 3D-specific): Alfieri et al. 2011 (164 studies, J. Educational Psychology 103(1):1-18) found unassisted discovery worse than explicit instruction (d = -0.38) and assisted/enhanced discovery better than other instruction (d = +0.30); feedback, scaffolding, worked examples and elicited explanations were what helped. https://researchinnovation.kingston.ac.uk/en/publications/does-discovery-based-instruction-enhance-learning-a-meta-analysis-2/ [S, pre-2024 but a stable finding].

Dwell time and completion: I found no peer-reviewed data for web museum sites. Vendor blogs give benchmark claims (for example "session over 2 minutes" as interest, drop-off after 2-3 rooms as a navigation signal) with no methodology: https://travvir.com/blog/en/virtual-tour-analytics [S], low. The National Gallery Imaginarium case study explicitly does not disclose metrics. Treat completion and dwell as unmeasured in the literature.

#### 1a.2 Motion sickness and vestibular issues without a headset

- Official web guidance: some users get nausea and dizziness from parallax and zooming; the prefers-reduced-motion media query is the mechanism; browser support Chrome 74, Edge 79, Firefox 63, Safari 10.1. https://web.dev/articles/prefers-reduced-motion (Thomas Steiner) [V]. JavaScript animation (three.js camera moves) must listen to the media query itself; CSS rules do not stop it. [V]
- WCAG 2.3.3 Animation from Interactions is Level AAA ("Motion animation triggered by interaction can be disabled"); sufficient techniques are the CSS and JS prefers-reduced-motion techniques. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html (page read 2026-10-08) [V].
- Desktop-screen evidence is thin. A search surfaced a peer-reviewed study (University of Minnesota repository, https://conservancy.umn.edu/handle/11299/58646 , page blocked) reporting motion sickness in 42 to 56 percent of participants playing console games on ordinary monitors; I could not open it, and my authorship attribution (Stoffregen et al., Human Factors, 2008) is from memory [S]. Other results were gaming blogs (FOV 90-100, disable head bob/motion blur, 60 fps) that I rate low. Most cybersickness literature is HMD-based and does not transfer cleanly. Net: free-roam first-person camera motion on a flat screen is a plausible trigger; evidence is indirect.

#### 1a.3 Mobile touch controls

- three.js OrbitControls default touch mapping: one finger rotates, two fingers dolly and pan; arrow keys pan; mapping is configurable. https://github.com/mrdoob/three.js (docs/pages/OrbitControls via Context7) [V].
- drei CameraControls (wrapper over camera-controls) accepts separate `mouseButtons` and `touches` action maps (one, two, three fingers). [V via Context7]
- Page-vs-canvas gesture conflict: `touch-action` controls which gestures the browser keeps (`none` hands everything to JS; `pan-y pinch-zoom` keeps vertical scroll and pinch); web.dev warns that disabling touch actions can create accessibility problems such as blocking page zoom. https://web.dev/articles/add-touch-to-your-site and https://web.dev/learn/css/cursors-and-pointers [V]. Chrome's scrolling intervention doc: apply touch-action rather than relying on preventDefault in passive listeners. https://developer.chrome.com/blog/scrolling-intervention [V].
- Photo Sphere Viewer exposes `mousewheelCtrlKey` (require Ctrl to zoom so the page can scroll past the viewer) to avoid scroll trapping. [V via Context7, https://github.com/mistic100/photo-sphere-viewer docs/guide/config.md]
- Virtual joystick evidence: the Go-To result above favours destination taps for novices; no 2024-2026 study of joystick usability on phones for museum content found.

#### 1a.4 WCAG 2.2 implications for a camera-rail or 360 experience (read this session unless noted)

| Criterion | Level | What it requires (official text, page dates) | Consequence for a tour/360/hotspot design |
|---|---|---|---|
| 2.1.1 Keyboard | A | "All functionality ... operable through a keyboard interface ... except where the underlying function requires input that depends on the path of the user's movement and not just the endpoints." Page updated 2026-05-11. https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html | "Go to next stop", "open artifact", "turn left/right" are endpoint functions, so keyboard operation is required. Freehand look-around could claim the path exception, but a keyboard turn alternative is cheap. |
| 2.5.7 Dragging Movements | AA | Functionality using dragging must be achievable by a single pointer without dragging, unless essential. Map example: a draggable map also has up/down/left/right buttons. Page updated 2026-08-10. https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html | Drag-to-look in 360 and drag timelines need tap buttons or tap-to-turn alternatives. |
| 2.5.8 Target Size (Minimum) | AA | Pointer targets at least 24 by 24 CSS px, with exceptions for spacing, equivalent control, inline, user-agent, essential. Page updated 2026-05-11. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 360 hotspots and timeline ticks must be 24 px or spaced, or have an equivalent list control elsewhere on the page. |
| 2.2.2 Pause, Stop, Hide | A | Moving content that starts automatically, lasts more than 5 seconds and sits alongside other content needs a pause/stop/hide mechanism. Page updated 2026-08-10. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html | Auto-rotate of a panorama, ambient camera drift and autoplaying scene motion need a pause control. |
| 2.3.3 Animation from Interactions | AAA | See 1a.2. | Not required for AA, but prefers-reduced-motion handling is the stated technique and is cheap. |
| 2.4.11 Focus Not Obscured (Min), 1.2.2/1.2.5 captions and audio description | AA | Verified in doc 02 (WCAG 2.2 is a W3C Recommendation dated 12 Dec 2024). Not re-read this session. | Sticky guide avatar and caption bars must not cover focused controls; avatar narration needs captions. |

Implementation notes from vendor/official docs relevant to the above:
- Official Google guidance on canvas/WebGL accessibility is general: generic elements need `tabindex`, focus must be visible, custom controls need ARIA, standard HTML controls are preferred; it states no specific canvas fallback. https://web.dev/articles/how-to-review ; GDK answer_query summary (Section 6, G6). [V]
- three.js CSS2DRenderer docs state it "only supports 100% browser and display zoom" (Context7, https://github.com/mrdoob/three.js docs/pages/CSS2DRenderer). Using it for labels conflicts with browser zoom, which matters for low-vision users. [V]
- Photo Sphere Viewer keyboard controls are enabled only in fullscreen by default (`keyboard: 'fullscreen'`); `'always'` makes keys global to the page and "can be in conflict with other components"; default actions are arrows to rotate, PageUp/PageDown or +/- to zoom, customisable via `keyboardActions`. [V via Context7]. This corrects the doc 03 "[UNVERIFIED]" note on PSV keyboard handling: keyboard exists but is not on by default outside fullscreen.
- Chrome's HTML-in-Canvas API (origin trial in Chrome 148-150; three.js has experimental `THREE.HTMLTexture`) would put real DOM into WebGL scenes with accessibility-tree exposure, find-in-page and translation, but it is an early origin trial and "does not work with cross-origin iframe content". https://developer.chrome.com/blog/html-in-canvas-origin-trial [V]. Not adoptable for production on Nov 1, but shows the direction.

### 1b. Learning and retention evidence

Key quantities (all effect sizes are standardised mean differences; bigger is better for the treatment unless noted).

| Topic | Finding | Source | Status |
|---|---|---|---|
| Immersion paradox (HMD VR) | 52 university students, desktop vs head-mounted VR science lab simulation: more presence in VR (d = 1.30) but less learning (d = 0.80 in favour of desktop) and higher cognitive load on EEG (d = 0.59). Attributed to extraneous load. | Makransky et al. 2019 "Adding immersive virtual reality to a science lab simulation causes more presence but less learning", Learning and Instruction (journal/authors from memory; figures from the repository abstract), https://test01.ku.dk/:obvius/pureproxy/3974268/en/publications/adding-immersive-virtual-reality-to-a-science-lab-simulation-caus ; also https://imotions.com/blog/adding-immersive-virtual-reality-to-a-science-lab-simulation-causes-more-presence-but-less-learning | [V] abstract; pre-2024 |
| VR vs slideshow | Experiment 1: slideshow beat immersive VR on the post-test but VR scored higher on interest/motivation. Experiment 2: segmenting the VR lesson and having learners write a summary after each segment beat the continuous VR lesson, with no loss of interest. | Parong and Mayer 2018, J. Educational Psychology, Aug 2018, https://www.ovid.com/journals/jedup/pdf/10.1037/edu0000241~learning-science-in-immersive-virtual-reality | [V] abstract via search; pre-2024 |
| Pre-training in VR | 118 participants, VR vs video, with/without pre-training: pre-training helped in VR on knowledge (d = 0.81), transfer (d = 0.62), self-efficacy (d = 0.64); no effect in the video condition. | Meyer, Omdahl, Makransky 2019, Computers & Education, https://elsevier.forskningsportal.dk/display/pub-2-s2.0-85067602710 | [S]; pre-2024 |
| Meta-analysis of HMD VR | 35 RCT/quasi-experiments (2013-2019): small positive effect of HMD VR over non-immersive instruction (ES = 0.24), larger for K-12, science, simulations/virtual worlds, and versus lectures. | Wu, Yu, Gu 2020, British Journal of Educational Technology, 2020-09-08, DOI 10.1111/bjet.13023, https://gcris.artuklu.edu.tr/entities/publication/938a0d60-4ab6-4e76-99c5-3b4a1972092f | [S] |
| 2025 systematic review on load | BJET 2025 review of 36 studies: VR "often causing extraneous load, hinders learning, particularly among novices"; AR optimises load. | https://hal.umontpellier.fr/ENSTA_U2IS/hal-03906797v4 (page blocked; claim from search summary) | [S], low-medium |
| Newer single study | 92 college students, VR vs multimedia video x task difficulty: VR improved knowledge transfer and mental models (notably on hard tasks); video better for retention. | Shan et al., Frontiers in Psychology, 2026-02-17, https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1772894/full (I first mis-labelled this a meta-analysis; it is a single study) | [V] |
| Virtual museum technology comparison | 164 participants explored five online virtual museums (images, video, 3D reconstructions, and so on) and rated learning dimensions; the authors "question the potential educational advantage of incorporating complex 3D reconstructions in a VM". | Sylaiou et al., Int. J. Arts and Technology 10(1), 2017, https://www.inderscience.com/offer.php?id=83907 | [V]; pre-2024 |
| VR in history teaching | Systematic review (14 papers from 2,794 Scopus hits) lists technical, usability, economic, psychological, ethical challenges incl. cognitive overload; another review of 40 articles 2013-2023 reports gains in knowledge and attitudes but notes studies "tend to focus on students' attitudes towards VR rather than learning impact". | https://reunir.unir.net/items/379a2afb-615b-40c4-abb8-c62bedabe4e7/full (search summary) | [S], medium |
| Multimedia design principles (overview of reviews) | 29 reviews, 1,189 studies, 78,177 participants: 11 principles with significant positive effects on learning, 5 improving cognitive load management; strongest for captioning second-language video, temporal/spatial contiguity, signaling; robust evidence also for modality, coherence/removing seductive details, segmentation, personalisation, pedagogical agents. Good design mattered more for complex material and system-paced than self-paced settings (for example websites). | Noetel et al. 2022, Review of Educational Research, https://acuresearchbank.acu.edu.au/item/8zqy4/multimedia-design-for-learning-an-overview-of-reviews-with-meta-meta-analysis (403 on fetch; from search summary) | [S] |
| Mayer principles, median effect sizes | Coherence 0.86 (18 of 19 tests), signaling 0.69 (15 of 16), segmenting 0.67 (7 of 7). | Cambridge Handbook of Multimedia Learning chapter, https://cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning/F29A19FCD34C542806F736E0661C05F5 (search summary) | [S] |
| Narrative vs expository | 78 samples, 33,078 participants: stories better understood and recalled than essays; overall g = 0.55 (95% CI 0.31-0.79); comprehension g = 0.48, memory g = 0.72; no tested moderator (age, modality, delay) significant; small publication bias mainly in memory studies. | Mar, Li, Nguyen, Ta 2021, Psychonomic Bulletin and Review, https://pmc.ncbi.nlm.nih.gov/articles/PMC8219577/ | [V] |
| History as event models | History learning is acquiring causal-temporal event structures ("knowing history includes knowing stories"); early learning is event-driven (get the basic story, then fill in details); takes time. | Perfetti, Britt, Georgi 1995, Text-Based Learning and Reasoning: Studies in History (Erlbaum), via https://www.thenhier.ca/en/node/538.html | [S]; pre-2024; supports the student interview ("remembers history as events and conflicts") |
| Scroll-driven format | See 1a.1 (Mendez and Such 2026): engagement up, comprehension equal. | arXiv 2603.04367 | [V] |
| Retrieval practice | Practice tests beat other conditions (Adesope et al. 2017: 118 articles, 272 effect sizes, N = 15,427, g = 0.61); testing vs restudy g = 0.50 (Rowland 2014, 61 studies); classroom quizzing g = 0.499 across 222 studies and 48,478 students (Yang et al. 2021, Psychological Bulletin); feedback raises the effect. Exact feedback/no-feedback numbers appeared only on a secondary blog (g 0.73 vs 0.39) and are not relied on. | https://www.frontiersin.org/articles/10.3389/fpsyg.2018.02412/pdf (summary of Rowland and Adesope) ; https://scholars.hkbu.edu.hk/en/publications/testing-quizzing-boosts-classroom-learning-a-systematic-and-meta-/ | [S], medium-high |

Event/conflict framing: beyond Perfetti et al. and Mar et al., I found no study that isolates "conflict" framing as a retention driver; that part of the student interview is supported only indirectly (stories and causal-temporal structure aid recall). Flagged as a gap.

### 1c. Pedagogical agents and guide avatars

| Topic | Finding | Source | Status |
|---|---|---|---|
| Overall agent effect | Small positive effect on learning: 43 studies, 3,088 participants (Schroeder, Adesope, Gilbert 2013, J. Educational Computing Research 49(1):1-39); agents more beneficial for K-12 than post-secondary; agents communicating with on-screen text helped more than with narration. A later meta-analysis (Castro-Alonso, Wong, Adesope, Paas 2021, Educational Psychology Review 33(3)): 32 effect sizes, N = 2,104, g+ = 0.20. | https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/How-Effective-are-Pedagogical-Agents-for/99900601056901842 ; https://research.birmingham.ac.uk/en/publications/effectiveness-of-multimedia-pedagogical-agents-predicted-by-diver/ | [V] abstracts; effect size value for Schroeder not shown on page |
| Stylised 2D vs 3D | In Castro-Alonso 2021, 2D agents (g+ = 0.38) outperformed 3D agents (g+ = 0.11), as cognitive load theory and the coherence principle predict; voice, nonverbal communication and motion "appeared not to moderate" effectiveness; authors conclude learners "may be able to learn similarly from different types of agents". | same Birmingham page | [V] |
| Persona effect | A lifelike character, even an unexpressive one, can positively shape students' perception of the learning experience (affective, not necessarily performance). | Lester et al., "The Persona Effect", CHI '97, https://chi1997.acm.org/proceedings/paper/jl.html (pre-2024; foundational) | [S] |
| Image, voice, embodiment | Image principle: showing the speaker's image on screen does not reliably help (nine tests, median ES about 0.2). Voice principle: standard-accent human voice beat machine voice (four of four tests, median ES 0.8) but Mayer and DaPra 2012 with better synthetic voices found no significant difference. Embodiment: agents with eye gaze, facial expression and gesture improved agent perception and transfer in Mayer and DaPra 2012. | Cambridge Handbook chapters on social cues, e.g. https://www.cambridge.org/core/books/multimedia-learning/personalization-voice-and-image-principles/97F9B31362E6491806A4718FECCADE3D (search summary) | [S]; pre-2024 |
| Appearance and the uncanny valley | Zell et al. 2015 (ACM TOG 34(6), SIGGRAPH Asia): face shape is the main driver of perceived realism; mismatches between shape and material stylisation (for example abstract shape with realistic material) look unappealing and eerie; stylising a realistic texture can raise appeal without lowering realism. A recent study claiming cartoon agents gave better quiz grades than realistic ones comes from a low-visibility journal (hrmars) and I rate it low. | https://sa2015.siggraph.org/en/attendees/technical-papers/event/techpapers/252.html ; https://hrmars.com/ijarped/article/view/23446/The-Effect-of-Different-Realism-Designs-of-Virtual-Agents-on-Students-Grades-in-Quiz-App-The-Mediating-Role-of-Arousal-and-Valence | [S]; Zell is pre-2024, medium; hrmars low |
| Disclosure of AI characters (effect on users) | Mixed and thin. A Substack write-up of an RCT with 240 corporate learners claims trust and engagement fell when learners were told mid-session the presenter was AI, with no change in knowledge (unverified primary). An SSRN experiment ("Digital Lyrebirds", 2024) found no evidence that disclosing AI attenuates the trust-inducing effect of voice clones (page blocked; summary only). | https://drphilippahardman.substack.com/p/your-synthetic-educator-looks-perfect ; https://papers.ssrn.com/abstract=4839606 | [S], low |
| Disclosure (regulatory) | EU AI Act Article 50 transparency obligations apply from 2026-08-02: systems that interact with people must inform them they are interacting with AI unless obvious; deployers publishing deepfake-type audio/image/video must disclose; machine-readable marking of synthetic output "where technically feasible"; a grace period to 2026-12-02 for certain marking duties for systems already on the market; Commission guidelines adopted 2026-07-20. IHH jurisdiction and audience in the EU not established. | https://www.bsigroup.com/en-US/insights-and-media/media-center/press-releases/2026/august/eu-ai-act-article-50-transparency-obligations/ ; https://cadeproject.org/updates/eu-ai-act-transparency-obligations-take-effect-on-2-august/ | [S], medium |
| Precedent for a named guide avatar | Anne Frank House 2024 virtual tour: multilingual AI avatar guide based on a consenting named person; and National Gallery Imaginarium discloses AI use and had curators review AI animations. | doc 02 (verified 2026-10-07): https://annefrank.org/en/about-us/news-and-press/news/2024/11/14/the-anne-frank-house-launches-a-3d-virtual-tour ; Q42 page above | [V] |

### 1d. Award-winning immersive storytelling and virtual museum sites (2024-2026)

#### 1d.1 Examples (at least 6; all have URLs)

| # | Project | Award / year | URL | Structure | Onboarding | Mobile | Accessibility signals |
|---|---|---|---|---|---|---|---|
| 1 | National Gallery Imaginarium (Fabrique and Q42, Eidra) | Webby winner, Cultural Institutions, 2026; 2025 Lovie Silver; two 2026 Silver European Design Awards | https://imaginarium.nationalgallery.org.uk/ (landing: https://www.nationalgallery.org.uk/visiting/virtual-gallery/national-gallery-imaginarium) | Dream-like 3D space; curator question sequences; AI-animated paintings; hybrid of independent and guided exploration | Short tutorial in a virtual room; Start button; "Mute soundscape" and "Help me choose" at entry [P] | Chrome, Firefox, Safari incl. mobile Safari and Chromium on iOS/Android; desktop, older phones and tablets (Q42) | [P] entry state: 0 headings, 0 landmarks, 24 aria-labelled nodes (many in the cookie banner), viewport meta `maximum-scale=1, user-scalable=no` (blocks pinch zoom); main JS (1.6 MB raw) contains a prefers-reduced-motion check; 7.3 MB transferred at entry. Page links an accessibility statement (doc 02). |
| 2 | Mouthful of Dust (State Library Victoria) | Webby nominee 2026 (Cultural Institutions); site banner "9X award winner" | https://mouthfulofdust.slv.vic.gov.au/ | Cinematic web experience around photogrammetry 3D scans of Ned Kelly's armour, rifle, boot, death mask and the Jerilderie Letter; new writing by authors, voiced recordings; short films or interactive scans | Content warning, "use headphones", acknowledgement of country, ENTER, Skip | Not stated; viewport meta `maximum-scale=1.0` | [P] strongest explicit a11y affordances of the sample: 13 landmarks, 61 aria-labelled nodes, 2 live regions; controls named "Hide Subtitles", "Audio describe slideshow images", "Pause sequence", "Show settings", "Toggle sound", "Skip"; main JS (1.4 MB raw) has a reduced-motion check; only 566 KB at entry, meshes fetched progressively. |
| 3 | Tracing Art (Getty and Resn) | Webby nominee 2026; Awwwards page dated 2025-09-24 | https://www.getty.edu/tracingart/ | Scroll-driven data story turning provenance records into "interconnected constellations"; GSAP ScrollTrigger, Lenis, three.js, KTX2 textures per Awwwards credits | None needed beyond scroll | Viewport meta normal | [P] lang=en, 31 headings and 5 landmarks (semantic text exists), 0 aria-labels, 5 of 17 images with no alt attribute, no skip link found, no reduced-motion string in the first script or stylesheet, page height 69,504 px; about 4.1 MB over 250 requests at probe time. |
| 4 | Yitskhok Rudashevski: A Teenager's Account of Life and Death in the Vilna Ghetto (YIVO) | Webby nominee 2025; launched July 2024 | https://museum.yivo.org/exhibitions/yitskhok-rudashevski | 7 numbered chapters, 8 artifacts, "Moral Choices" reflection questions, next/back links; per-chapter URLs; video dramatisations, animations and explorable 3D environments inside chapters; teacher guides exist (https://museum.yivo.org/teacher-guides/YBFCSOM-YR-grades-9-12.pdf) | Table of contents; Next Experience links | Normal viewport meta; page weight light | [P] 10 headings, 10 landmarks, 20 aria-labelled nodes, 11 of 11 images with alt, 461 KB over 64 requests on the chapter landing. Most conventional DOM-first structure of the sample. |
| 5 | National Park Service, Life at Lewis Mountain: Shenandoah in the Jim Crow Era (Alexander and Tom) | Webby People's Voice winner, Cultural Institutions, 2025 | https://www.nps.gov/features/shen/lewisMT/index.htm | Five short videos with follow-up activities built from oral histories, letters, newspapers and photographs; aligned to learning standards; named advisor and funders (doc 02) | "Skip to content" present [P] | Not stated | [P] viewport meta `width = device-width, user-scalable = no`; no canvas; JS bundle of 1.7 MB with no reduced-motion string found in it; 1.6 MB at entry. |
| 6 | UNESCO Virtual Museum of Stolen Cultural Objects (makemepulse with DDB Paris and architect Diebedo Francis Kere) | Awwwards Site of the Day and Developer Award, 2026-01-14 per the Awwwards museum listing | https://museum.unesco.org/ | Spiral museum around a baobab tree; over 240 objects in 2D and 3D (AI-generated reconstructions from photographs) with community testimonies; "Return and Restitution" room; also available with a VR headset | Terms-of-use banner and loader before entry [P] | "Desktop, mobile, tablet and immersive VR headsets" via NanoGL WebGL engine (makemepulse case study) | [P] entry state: html lang empty, 2 canvases, 6 buttons several with no accessible name, 0 aria-labels, no skip link, 312 characters of text before the 3D loads. |
| 7 | Anne Frank House 3D virtual tour (2024) | no award data gathered | https://annefrank.org/en/about-us/news-and-press/news/2024/11/14/the-anne-frank-house-launches-a-3d-virtual-tour | Room-by-room walk through the Annex hosted on EyeSpy360 with photos, clips, sound, objects, documents; AI avatar guide in four languages | not examined | browser-based; behaviour not verified | doc 02: announcement states no screen-reader or caption support. |
| 8 | 20 Years of Xbox Museum (Active Theory) | Awwwards inspiration listing (award status and date not shown) | https://museum.xbox.com | Guided, non-linear WebGL timeline with horizontal scrolling and sound design | not examined | page gives no mobile information | not stated |
| 9 | Museums for the 21st Century (++hellohello, Uruguay) | Awwwards Site of the Day, 2024-03-03, score 7.53 (Developer Award 7.43; responsive design 7.60; web performance 7.80) | https://museos.arteyeducacion.org/ | Minimalist two-colour site with artist bios, audio player, video-enhanced artwork explanations | animated preloader | responsive mobile navigation | jury scores include "responsive design" and "web performance" sub-scores; no accessibility score reported |
| 10 | Searchable Museum, Smithsonian NMAAHC (IHH's own reference) | n/a | https://searchablemuseum.com | See doc 02 and doc 00: flat deep-zoom hub; real 3D/360 elsewhere | n/a | n/a | n/a |

Other Cultural Institutions Webby entries 2024-2026 (names only, not examined): Nordiska Museet (2025 winner, Bazooka AB), Becoming Visible (Smithsonian American Women's History Museum, 2025 nominee), The Book of HOV (2024 winner), Oculi Mundi (Q42 and Fabrique, 2026 honoree; an immersive map/globe collection per a search summary). Source: https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/cultural-institutions?years=0 [V]. GLAMi/MuseWeb 2025-2026 winners: not found again (search returned 2016-2021 material only), so omitted.

Awwwards museum category listing 2024-2026 (fetched 2026-10-08, https://www.awwwards.com/websites/museum/): UNESCO Stolen Objects Museum (Site of the Day and Developer Award, 2026-01-14), Royal Ontario Museum (Honorable Mention, 2026-03-02), Museum of Digital Influence (Honorable Mention, 2025-04-07), Payana Vintage Car Museum (HM, 2025-03-20), Abba The Museum webshop (SOTD, 2024-11-23), Milwaukee Art Museum (HM, 2024-11-28), Museums for the 21st Century (SOTD, 2024-03-03), Amsterdam Museum (HM, 2024-02-22). [S, summarised by a small model; dates not independently re-checked]

Disputed trend claim: one article asserts immersive 3D accounted for 61 percent of Awwwards Site of the Day winners in Q1 2026, up from 23 percent in Q1 2024. I checked the article: it is promotional content from a web agency, cites no Awwwards dataset or method, and I could not corroborate it. Disregard as evidence. https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/ (2026-03-12) [V that it is unsourced].

#### 1d.2 Patterns across the examples

1. Structure: sites that win on storytelling tend to use a guided linear or chaptered spine with optional depth (YIVO chapters, Imaginarium question sequences, Mouthful of Dust sequence plus menu, Tracing Art scroll). Pure free-roam is not the dominant structure in this sample. [P]/[V], n = 6 to 9, selection is by award, not by learning outcome.
2. Onboarding: brief, mostly in-world (Imaginarium tutorial room), plus preflight messages (headphones, content warning, loading estimate "about 5 seconds / Fetching meshes" at Mouthful of Dust).
3. Mobile: stated support exists for Imaginarium and UNESCO; others are silent. None of the sites' own pages publishes a mobile performance budget.
4. Accessibility is the weak spot: of the six sites I probed, only Mouthful of Dust exposes explicit subtitle, audio-description, pause and settings controls with landmarks and live regions; YIVO has the most semantic DOM; three of six restrict zoom in the viewport meta (Imaginarium, Mouthful of Dust, NPS) and Tracing Art and UNESCO show unnamed or unlabelled controls at the probed state. Automated checkers commonly flag zoom-blocking viewport settings; I did not verify the rule text this session. These are entry-state observations, not full audits.
5. Weight: entry-state transfer ranged 0.46 MB (YIVO chapter) to 7.3 MB (Imaginarium).

### 1e. Counter-route: where 3D and immersion hurt, and mitigations

| Risk | Evidence | Mitigation evidence |
|---|---|---|
| Cognitive overload and lower learning | Makransky 2019 and Parong and Mayer 2018 (HMD VR); BJET 2025 review of 36 studies (low-medium); Sylaiou 2017 doubting added value of 3D reconstructions in virtual museums. All 3D-learning studies found are HMD or desktop VR, not mobile web 3D museums: direct evidence for the IHH format is missing. | Segment and prompt a summary after each segment (Parong and Mayer 2018, Exp. 2); pre-training before the immersive part (Meyer et al. 2019); signaling and removing seductive details (Noetel 2022, Mayer medians above); retrieval prompts with feedback (Section 1b). |
| Disorientation and navigation friction | Shikhri 2023: mental-model mismatch, hidden controls, no node near some exhibits. | Denser nodes, room list, visit history, gaze indicators (same paper); Go-To style destination taps for novices on touch (Jankowski 2014). |
| Motion sickness and vestibular | Section 1a.2. | prefers-reduced-motion in both CSS and JS; discrete cuts instead of fly-throughs when reduced motion is set; no scroll-jacking. |
| Accessibility exclusion | Canvas content is opaque to assistive tech; the W3C XR Accessibility User Requirements note exists because immersive content lacks declarative semantics (https://www.w3.org/TR/xaur/ , Working Group Note; search summary [S]). Live probe: awarded sites still ship unlabelled controls and zoom-blocking viewports (1d.2). | DOM-first design: real headings, a list of stops and hotspots as buttons, captions, transcripts, visible focus; official guidance in 1a.4. HTML-in-Canvas may help later (origin trial only). |
| Institutional accessibility pressure | DOJ interim final rule of 2026-04-20 moved ADA Title II web accessibility deadlines (WCAG 2.1 AA for state and local government content, including public schools) to 2027-04-26 (population 50,000 or more) and 2028-04-26 (under 50,000). https://thejournal.com/articles/2026/04/27/deadline-extended-for-ada-title-ii-compliance.aspx (2026-04-27) [V]. The rule governs the public entity's own content; whether a teacher can assign or link a third-party non-WCAG resource is not established here. | WCAG 2.2 AA is the newer standard and adds the criteria listed in 1a.4; whether it fully contains 2.1 AA for every criterion was not checked here. |
| Performance on weak devices and networks | Core Web Vitals "good" thresholds at the 75th percentile: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less (web.dev, last updated 2025-05-07, https://web.dev/articles/defining-core-web-vitals-thresholds) [V]. Never lazy-load the LCP image (https://web.dev/articles/optimize-lcp) [V]. INP is reported for the whole page "including any slow interactions on the page or any iframes within that page" (https://web.dev/articles/optimize-inp) [V]: relevant if the showcase is iframed into WordPress. Older commerce-context evidence that small speed gains lift progression (Deloitte "Milliseconds Make Millions", 2020, https://web.dev/case-studies/milliseconds-make-millions) [V], pre-2024 and not about museums. No authoritative data on WebGL capability of school Chromebooks was found; the one result was a forum claim about integrated GPUs I rate unusable. | Adaptive loading: `navigator.connection.saveData`, `effectiveType`, `deviceMemory`, `hardwareConcurrency`; the Network Information API is Chromium-only (support table shows Firefox and Safari absent) (https://web.dev/articles/optimizing-content-efficiency-save-data and https://web.dev/articles/adaptive-loading-cds-2019, 2019, pre-2024) [V]; drei `PerformanceMonitor` plus `AdaptiveDpr` to drop DPR on regression and `frameloop="demand"` for render-on-demand [V via Context7]; poster-first and click-to-load for 3D; progressive mesh fetch as Mouthful of Dust does [P]. Web.dev advises a visible user toggle for data-saving mode. |
| Scroll and gesture traps | 1a.3. | `touch-action`, `mousewheelCtrlKey`, native scroll. |

### 1f. What is implementable in three.js / drei (Context7 and GDK, 2026-10-08)

- Guided camera rail with eased moves: camera-controls `setLookAt(px,py,pz,tx,ty,tz,enableTransition)` and `fitToBox` / `fitToSphere`; every method taking `enableTransition` returns a Promise, so a tour can be written as `await rotateTo(...); await dollyTo(...)`; smoothing via `smoothTime`, `maxSpeed`, `restThreshold` (https://github.com/yomotsu/camera-controls readme via Context7) [V]. drei `CameraControls` wraps it with `mouseButtons` and `touches` maps and `makeDefault`. drei `Bounds`/`useBounds` offers `refresh().clip().fit()`, `moveTo`, `lookAt`. drei `MotionPathControls` moves a camera or object along `CubicBezierCurve3` curves with `focus` and `damping`. [V]
- Scroll-driven camera: drei `ScrollControls` creates an HTML scroll container in front of the canvas (`pages`, `damping`, `horizontal`, `infinite` experimental) and `useScroll` exposes progress; `<Scroll html>` scrolls DOM content alongside. Note: it replaces native page scroll with a container, so it inherits the scroll-hijack concerns in 1a.1. [V]
- Free-roam keys: drei `KeyboardControls` maps named actions to keys (example WASD and arrows). Collision and walk meshes are not provided by these components. [V]
- DOM in 3D: drei `Html` renders real DOM at 3D positions with `occlude`, `transform`, `fullscreen`, `portal`; three.js `CSS2DRenderer` (zoom caveat above). [V]
- 360 scenes: Photo Sphere Viewer has Markers (tooltips with HTML), Virtual Tour (nodes, optional map, GPS or manual positioning), Gallery and Autorotate plugins; keyboard as in 1a.4. [V via Context7]. Doc 03 already covers size and licence.
- Everything above is React Three Fiber/drei or plain three.js and MIT-class per doc 03; no new licence checks done here.

---

## 2. Per-finding confidence

| # | Finding | Confidence | Why |
|---|---|---|---|
| 1 | Free-roam 360 tours produce mental-model mismatch, hidden controls and missing nodes (n = 14, desktop). | Medium | Primary paper read, small sample, mouse only, 2023 |
| 2 | A hybrid (guided plus exploratory freedom) is preferred over either pure mode. | Medium | One HMD study (abstract level) plus Imaginarium design; no web-museum experiment |
| 3 | On touch, destination-tap navigation beats joystick/position control for novices. | Low-medium | 2014 study, results from a search summary, pre-2024 |
| 4 | Unassisted discovery underperforms; scaffolded discovery helps. | High (general), Medium (transfer to 3D museums) | Large meta-analysis, not about 3D |
| 5 | Immersive HMD VR can reduce learning via extraneous load (d around 0.8 for desktop advantage in one study); meta-analytic HMD effect is small positive (0.24). | Medium | Both real; contexts differ; none test mobile web 3D |
| 6 | Segmenting with summaries and pre-training reduce the VR penalty. | Medium | Single experiments each, d 0.62-0.81 for pre-training |
| 7 | Story format improves comprehension (g = 0.48) and recall (g = 0.72). | High | Large meta-analysis read on PMC |
| 8 | Practice testing and quizzing yield g around 0.5-0.6, larger with feedback. | Medium-high | Multiple meta-analyses via summaries; exact feedback numbers unverified |
| 9 | Pedagogical agents help a little (g around 0.20), 2D beats 3D, voice/motion do not moderate, K-12 benefits more. | Medium-high | Abstracts read; two meta-analyses |
| 10 | Stylised agents avoid uncanny effects; shape/material mismatch looks eerie. | Medium | Zell 2015 (pre-2024), indirect to learning |
| 11 | Disclosure effects on trust/learning are unsettled; EU AI Act Article 50 applies from 2026-08-02. | Low (effects), Medium (law) | Effects from a blog and a blocked abstract; law from two secondary summaries |
| 12 | Award sites mostly use guided/chaptered structures; accessibility is inconsistent even among winners. | Medium | n = 6 probed at entry state only, selection bias |
| 13 | The "61 percent of SOTD are immersive 3D" claim is unsupported. | High (that it is unsupported) | Source article read; no data cited |
| 14 | CSS2DRenderer supports only 100% zoom; PSV keyboard is fullscreen-only by default. | High | Official docs via Context7 |
| 15 | INP is reported across iframes on the page; CWV thresholds. | High | web.dev official |
| 16 | ADA Title II deadlines moved to 2027-04-26 and 2028-04-26. | High | Dated article stating DOJ interim final rule; applies to public entities |

---

## 3. Contradictions and disputed points

1. Does immersion help or hurt? Makransky 2019 and Parong and Mayer 2018 find worse learning in HMD VR; Wu et al. 2020 finds a small positive HMD effect (0.24); Shan et al. 2026 finds VR better for transfer and mental models but worse for retention; the 2023 Ancient Rome study found VR engaging and as effective as 2D (from a search summary). Reconciliation: all are HMD or desktop VR, differ in task and design, and none is a mobile web museum.
2. Agent realism: Mayer and DaPra 2012 report embodiment (gaze, gesture) improves transfer, while Castro-Alonso 2021 finds nonverbal characteristics do not moderate effects and 2D beats 3D. Image principle shows mixed results (median about 0.2).
3. Voice: the voice principle favours human over machine voice (median ES 0.8, older tests), but Mayer and DaPra 2012 found no difference with better synthetic voices; Schroeder 2013 found on-screen text agents beat narrated agents.
4. Disclosure: a Substack RCT summary claims trust drops on reveal; an SSRN experiment reports disclosure does not weaken voice-clone trust effects. Neither primary was readable.
5. Scrollytelling: engagement gain with equal comprehension (Mendez and Such 2026) versus scroll-jacking criticisms. These can both be true: the studied format used native scroll with animated visuals; criticisms target hijacked scroll physics.
6. Guided versus "navigable 3D world with a surprise": the casual-visitor interview asks for a navigable world; the evidence above favours structure plus optional exploration, but the evidence on user delight from free-roam is absent.
7. 3D value: Sylaiou 2017 questions the added educational value of 3D reconstructions in virtual museums, while the Webby and Awwwards ecosystems reward 3D spectacle.
8. Awwwards trend claim (61 percent): unsupported; the verified museum listing shows a mix of SOTD and Honorable Mentions across styles.

---

## 4. Open questions and assumptions

Open questions:
- No peer-reviewed completion or dwell-time data for web museum sites; only vendor claims.
- No study compares a mobile-web 3D/360 museum with a flat page for history learning; the closest are HMD studies.
- Cannot confirm WebGL capability and GPU memory limits of typical school devices and district browser policies; no authoritative stat found.
- Whether an IHH iframe on WordPress affects the host page's INP field data in practice (web.dev says iframes count toward page INP; effect for cross-origin frames in CrUX not verified here).
- Whether teachers in public schools can use a resource that is below WCAG 2.1 AA; the DOJ rule applies to the entity's own content.
- Exact keyboard and screen-reader behaviour of Photo Sphere Viewer markers (are they focusable buttons?) not found in the docs I retrieved; test needed.
- Effect of disclosure labels on trust and learning for stylised, clearly illustrated characters (as opposed to photoreal clones) is unstudied in what I found.
- GLAMi/MuseWeb recent winners remain unknown.

Assumptions:
- The Webby, Awwwards and YIVO/NPS probes are one-off, desktop, entry-state; counts include cookie banners; "unnamed control" checks are crude; a missing reduced-motion string in a bundle does not prove absence of handling.
- Fetch summaries from a small model (Awwwards listing, YIVO/UNESCO pages) may omit detail; where blocked I used search summaries and say so.
- Learning-science effect sizes come from lab or classroom studies on adults and K-12 and may not carry to a 10-minute museum visit.

---

## 5. Implications for our decision (not a recommendation)

- Navigation: the evidence base (small but consistent) links unguided exploration to disorientation and weaker learning, links destination-tap navigation to better novice performance on touch, and shows the top-awarded comparators using guided or chaptered spines with optional depth. A guided default with optional exploration is therefore the lowest-risk reading of the evidence; pure free-roam carries both the highest evidence risk and the highest build cost (collision, joystick, vestibular handling).
- Wow versus learning: the same evidence says visual impact does not need free-roam; award winners deliver it with atmosphere, sound, scroll and 3D scans while keeping the narrative linear. The learning penalty from immersion is tied to extraneous load, so any 3D wow element has to justify itself against the coherence principle (the Imaginarium team's own stance in doc 02).
- Learning and credibility design levers with measurable effect: story/event structure (g 0.48-0.72), segmenting with short summaries or micro-quizzes with feedback (g around 0.5-0.6), pre-training before the immersive part, and removing seductive details. These are cheap and independent of the 3D engine.
- Guide avatar: expected learning value is small (g around 0.20); a 2D illustrated agent is at least as effective as 3D in the one meta-analysis that tested it; voice and gesture realism show little moderating effect. The strongest justification for an avatar is affect and wayfinding, not content learning. Disclosure is required by norm and, for EU audiences, by Article 50 from 2026-08-02.
- Adoptability: the DOM-first chaptered design (YIVO) is the lightest and most maintainable of the sample (461 KB, real landmarks, alt text); bespoke WebGL sites were built by agencies. IHH maintenance capacity argues for content in data files and a DOM spine with 3D as an enhancement layer.
- Accessibility is a differentiator, not just a constraint: five of six probed award sites have gaps at entry, zoom blocking is common, and only one exposes captions, audio description and pause controls. Meeting WCAG 2.2 AA with documented evidence would exceed most comparators. It also aligns with the ADA Title II deadlines that public-school adopters face.
- Buildability by Nov 1: the guided rail is a few lines with camera-controls promises and drei components; scroll-driven or free-roam adds risk; 15-20 PSV scenes with markers and a virtual-tour plugin are feasible, but keyboard focus, hotspot lists and scroll-trap handling need explicit work (PSV keyboard default is fullscreen-only; CSS2DRenderer is not zoom-safe).
- Performance and embedding: if embedded via iframe in WordPress, page INP in the field counts iframe interactions; entry weight must be budgeted (the sample ranges 0.46-7.3 MB); Network Information API adaptive loading will not work in Safari or Firefox, so detection should be capability-based with a user toggle.
- Evidence gaps that the project could close cheaply: add lightweight analytics (stop-level dwell, completion, hotspot taps) and a 5-item quiz to the showcase, since the literature offers no benchmarks for this format.

---

## 6. Query log (all dated 2026-10-08)

### Google web search (WebSearch, standard mode), 43 queries
1. virtual museum web navigation usability study guided tour versus free exploration disorientation
2. Makransky Lilleholt immersion paradox cognitive load VR learning outcomes meta-analysis head-mounted display vs desktop
3. pedagogical agent meta-analysis learning outcomes persona effect Schroeder Adesope Heidig
4. Awwwards Site of the Year 2025 winner immersive storytelling museum history
5. Wu Yu Chen 2020 meta-analysis virtual reality learning effects Computers & Education 35 studies effect size immersive vs non-immersive
6. Mayer multimedia learning segmenting principle signaling principle coherence seductive details meta-analysis effect sizes Mayer Fiorella 2021
7. retrieval practice testing effect meta-analysis classroom quizzing Adesope Trevors Nesbit 2017 Rowland 2014 effect size
8. Webby Awards 2026 winners cultural institutions museum website immersive
9. Parong Mayer 2018 immersive virtual reality science lesson less learning than slideshow generative activities journal of educational psychology
10. narrative versus expository text learning meta-analysis story format comprehension recall effect size Mar Oatley
11. pedagogical agent appearance realistic versus stylized cartoon uncanny valley learning study 2022 2023 2024
12. Noetel 2022 "Multimedia design for learning" overview of reviews meta-meta-analysis Review of Educational Research effect sizes principles
13. Awwwards Site of the Day museum exhibition interactive 3D WebGL 2025 2026 honorable mention history storytelling
14. virtual museum visit learning outcomes experimental study knowledge retention 3D vs 2D website vs immersive VR students
15. scrollytelling user study comprehension engagement compared to static article experiment cognitive load scroll-driven
16. mobile touch virtual joystick 3D navigation usability smartphone first-person virtual environment study errors time compared drag look
17. GLAMi Awards 2026 MuseWeb winners museum online exhibition immersive
18. cybersickness non-HMD desktop first-person 3D games motion sickness prevalence field of view head bobbing camera acceleration reduce
19. W3C XR Accessibility User Requirements note WebGL canvas screen reader alternative content immersive web
20. immersive virtual reality history education systematic review learning outcomes cultural heritage students retention
21. Castro-Alonso 2021 effectiveness of multimedia pedagogical agents predicted by diverse theories meta-analysis Educational Psychology Review effect size
22. Mayer image principle voice principle human voice vs machine voice on-screen agent presence does not improve learning Mayer DaPra embodiment effect
23. disclosure AI-generated synthetic voice avatar trust effect experiment transparency labeling learners 2024 2025
24. Tracing Art Getty Resn Webby 2026 nominee website interactive
25. Yitskhok Rudashevski YIVO interactive website Vilna Ghetto teenager diary Webby nominee design how it works
26. Mouthful of Dust State Library Victoria interactive website Webby 2026 how it works
27. Yang Luo Vadillo Yu Shanks 2021 Testing (quizzing) boosts classroom learning systematic and meta-analytic review Psychological Bulletin
28. students remember history as events and stories causal narrative interactive timeline learning study recall historical thinking research
29. WebGL performance low-end school Chromebooks integrated GPU 3D web experience students device capability 2025
30. UNESCO Stolen Objects Museum website makemepulse Awwwards Site of the Day 2026 virtual museum
31. ADA Title II web accessibility final rule WCAG 2.1 AA compliance deadline public schools 2026 2027 DOJ update
32. "Street-level Navigation Techniques in 3D Digital Cities on Mobile Touch Devices" authors Go-To joystick results novices
33. online virtual museum tour analytics average time spent drop-off completion rate visitors engagement data 360 tour
34. EU AI Act Article 50 transparency obligations AI-generated content chatbot disclosure application date August 2026 digital omnibus delay
35. Zell 2015 "To stylize or not to stylize" effect of shape and material stylization on perception of computer-generated faces appeal uncanny
36. Alfieri Brooks Aldrich Tenenbaum 2011 does discovery-based instruction enhance learning meta-analysis unassisted discovery guided effect size
37. Lester 1997 persona effect affective impact animated pedagogical agents Herman the Bug CHI findings
38. Meyer Omdahl Makransky 2019 pre-training immersive virtual reality video learning Computers & Education results cognitive load
39. meta-analysis cognitive load immersive virtual reality 36 studies extraneous load learning novices British Journal of Educational Technology 2025
40. scrolljacking scroll hijacking usability accessibility problems Nielsen Norman Group keyboard users reduced motion
41. visually induced motion sickness desktop monitor first-person video game study percentage participants symptoms peer-reviewed
42. Nordiska Museet website Bazooka Webby 2025 winner cultural institutions what is it
43. Oculi Mundi Q42 Fabrique Eidra immersive experience how it works Webby honoree

Page fetches (WebFetch, not counted as searches): arxiv.org/abs and /html/2310.11176 (the PDF was binary), Frontiers 10.3389/fpsyg.2026.1772894, W3C WCAG 2.2 Understanding pages (dragging-movements, animation-from-interactions, keyboard, target-size-minimum, pause-stop-hide), PMC8219577, WSU Schroeder 2013, vr.rwth-aachen.de/publication/02201, Awwwards (xbox museum, museum category, museums-for-the-21st-century, tracing-art), digitalstrategyforce.com article, Webby cultural-institutions winners, Tracing Art Webby page, inderscience 83907, arXiv 2603.04367, Birmingham Castro-Alonso page, Q42 Imaginarium, thenhier.ca 538, thejournal.com ADA, makemepulse UNESCO case study, museum.yivo.org, gwern Yang 2021 PDF (summary lacked numbers). Blocked or failed: psychnology.org Chittaro PDF (aborted), HAL Jankowski (Anubis), DOAJ (403), acuresearchbank Noetel (403), slv.vic.gov.au page (403), smithsonianmag.com (403), SSRN (403), hal.umontpellier.fr (Anubis), conservancy.umn.edu (403), PMC12328452 (404 after redirect).

Browser probes (2026-10-08, in-app browser, desktop 1024x768, JavaScript DOM inspection plus one script fetch each): museum.unesco.org; getty.edu/tracingart; nationalgallery.org.uk Imaginarium landing page and imaginarium.nationalgallery.org.uk; mouthfulofdust.slv.vic.gov.au; nps.gov/features/shen/lewisMT; museum.yivo.org and /exhibitions/yitskhok-rudashevski. No forms submitted; no cookie consent accepted.

### Google Developer Knowledge MCP, 9 calls (7 search_documents, 1 answer_query, 1 get_documents)
G1. search_documents: accessibility of canvas and WebGL content keyboard focus alternative DOM
G2. search_documents: prefers-reduced-motion animation accessibility vestibular
G3. search_documents: Interaction to Next Paint optimize heavy pages main thread long tasks
G4. search_documents: adaptive loading Save-Data header network information API effectiveType slow connections serve lighter experience
G5. search_documents: Largest Contentful Paint optimize hero image video poster media-heavy page Core Web Vitals thresholds
G6. answer_query: How do I make a WebGL or canvas based interactive experience accessible to keyboard and screen reader users, and what fallback should I provide?
G7. search_documents: touch-action CSS pan-y canvas pinch zoom scroll conflict embedded iframe touch gestures
G8. search_documents: page load time bounce probability increases mobile page speed study
G9. get_documents: documents/developer.chrome.com/blog/html-in-canvas-origin-trial

### Context7, 13 calls (4 resolve-library-id, 9 query-docs)
C1. resolve-library-id: drei (query: CameraControls ScrollControls camera tour keyboard) -> /pmndrs/drei
C2. resolve-library-id: three.js (query: camera controls OrbitControls CameraControls tour) -> /mrdoob/three.js
C3. query-docs /pmndrs/drei: CameraControls setLookAt smooth transition to a position and target, and ScrollControls scroll-driven camera path
C4. query-docs /mrdoob/three.js: CSS2DRenderer CSS3DRenderer HTML labels and hotspots over WebGL scene, accessible DOM overlay
C5. query-docs /mrdoob/three.js: OrbitControls keyboard controls listenToKeyEvents, touch gestures one-finger rotate two-finger pan dolly, enableDamping
C6. query-docs /pmndrs/drei: PerformanceMonitor AdaptiveDpr degrade quality on low-end devices, frameloop demand
C7. resolve-library-id: Photo Sphere Viewer -> /mistic100/photo-sphere-viewer
C8. query-docs /mistic100/photo-sphere-viewer: keyboard navigation, accessibility, markers with tooltips and content, virtual tour plugin nodes, gallery plugin
C9. query-docs /pmndrs/drei: CameraControls component smooth transitions setLookAt fitToBox, KeyboardControls, PointerLockControls
C10. query-docs /mistic100/photo-sphere-viewer: keyboard option values and default behaviour, keyboardActions, which keys control pan zoom, focus handling
C11. query-docs /pmndrs/drei: Html component render DOM elements in 3D scene with occlude, transform, fullscreen, portal
C12. resolve-library-id: camera-controls -> /yomotsu/camera-controls
C13. query-docs /yomotsu/camera-controls: setLookAt with enableTransition smooth transition, smoothTime, restThreshold, fitToBox, and how to detect transition end
