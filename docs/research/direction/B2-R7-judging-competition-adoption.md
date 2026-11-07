# B2-R7 - Judging, competition, and IHH adoption/maintenance

Date of research: 2026-10-08. Route R7 of direction research batch 2. Hypotheses and evidence only; no recommendation.

## 0. How to read this report

- Confidence scale: high = primary or official source read directly, or two independent sources; med = one decent source, or convergent practitioner sources, or a derived calculation from verified inputs; low = single blog, vendor page, search-result summary where I did not open the page, or my own inference.
- "Fetched 2026-10-08, undated" means the page carries no date; the retrieval date is the only stamp I can give.
- Search-result summaries (the WebSearch tool returns a model-written summary plus links) are marked "summary only" where I did not open the underlying page. Several publisher sites returned 403/404/429; those are listed in the query log.
- Batch 1 files are cited as B1-R1, B1-R2, B1-R3, B1-R8, INTERIM-1 (all in this folder, 2026-10-08) and 02-museum-best-practices.md / 01-reference-and-ihh-audit.md (../, 2026-10-07).
- IHH site facts below come from read-only GET requests to the site's public WordPress REST API and public pages through the in-app browser (same method as 01-reference-and-ihh-audit.md), plus public registries. Nothing was submitted, logged into, or modified.
- Quotes are avoided on purpose; everything is paraphrased.

---

## 1. Findings per sub-route

### 1a. IHH itself

**F-a1. IHH is a very new 501(c)(3) with no public financials.**
- IRS-derived record: Immigrant Hall Of Honor, Boerne TX, subsection 501(c)(3), NTEE A50 (museum activities), ruling date 2025-01, EIN 99-3884674, zero Form 990 filings on ProPublica, BMF fields for assets/income/revenue all 0 (ProPublica Nonprofit Explorer API, https://projects.propublica.org/nonprofits/api/v2/organizations/993884674.json, record updated 2026-09-16, fetched 2026-10-08). ProPublica's human page says the organization is too new to have filed returns (https://projects.propublica.org/nonprofits/organizations/993884674, fetched 2026-10-08, undated).
- Candid/GuideStar lists the same EIN, NTEE A50, ruling year 2025, a Boerne address, chair Philip Ochoa and co-principal officer Kenneth Koskay, three more board members, and an IRS filing requirement of Form 990-N; revenue, staff and assets sit behind a paywall (GuideStar profile, https://www.guidestar.org/Profile/99-3884674, fetched 2026-10-08, undated). Form 990-N is the e-postcard for organizations whose gross receipts are normally at or under the IRS small-organization threshold (IRS rule from my background knowledge; not re-verified this session), so the filing type hints at a very small budget but does not prove it.
- Austin Chamber directory lists an Austin street address and phone and no founding year, employee count or member-since date (https://www.austinchamber.com/directory/immigrant-hall-of-honor, fetched 2026-10-08, undated).
- Confidence: high on registration facts (two independent registries agree); low on organization size (no revenue figure anywhere public; BMF zeros are placeholders for new or 990-N filers).

**F-a2. Leadership is a five-person board plus one listed staff member; the founder died in 2026.**
- IHH states it was established in 2024 on the vision of Sara Puig Laas (1930-2026), co-founded with her son Philip Ochoa (IHH Mission and Vision page, https://immigranthallofhonor.org/mission-and-vision/, page modified 2026-09-27; Leadership pages for Laas and Ochoa modified 2026-10-07; fetched via REST 2026-10-08). An obituary result for "Sara Laas" exists on legacy.com (https://www.legacy.com/legacy/sara-laas, summary only).
- Board per the Leadership page (modified 2026-09-21): Ochoa (President; co-founder and president of a defense-logistics company), Ken Koskay (CPA/CFP; former head of global sales at Becker Professional Education, former Thomson Reuters learning-solutions executive), James Witte (retired founding director of George Mason University's Institute for Immigration Research; NSF-funded "AI and Peer Review" project among his work), Carmen Gray (retired educator, writer, communications), Sumrin Kalia (political sociologist). A 2026-10-04 newsroom post announces Kalia and Gray as new members (https://immigranthallofhonor.org/two-new-board-members/, fetched 2026-10-08).
- Staff: one person listed, Jennifer Ring, Director of Marketing and Communications; her bio centers on journalism, digital storytelling, graphic design and marketing; it says she leads community storytelling, marketing and public engagement and "helps build the systems and platforms" (https://immigranthallofhonor.org/leadership/jennifer-ring/, modified 2026-09-14, fetched 2026-10-08).
- Confidence: high that this is what IHH publishes (primary, self-reported); med that no other staff exist (the page lists none, absence is not proof).

**F-a3. Programs and plans.**
- Recognition program: annual inductee class; 10 inaugural inductees; nomination criteria are immigrated 1776-present, significant contribution, became a U.S. citizen, no disqualifying legal or character issues (https://immigranthallofhonor.org/nominate/, modified 2026-09-24).
- Community storytelling and digital archive: Tell Your Story with three guided paths (own story with a guided interview, family member, ancestor), a story form up to 7,000 characters, audio upload, and a free three-part guide with email capture (https://immigranthallofhonor.org/tell-your-story/, modified 2026-09-30). Founding Voices archive (launched around 2026-08-02; anyone who submits a story or donates through end of 2026 becomes a Founding Voice; https://immigranthallofhonor.org/donate/, modified 2026-09-17). Beyond the Stories (launched 2026-09-03). Monthly newsletter E Pluribus Unum (launched 2026-07-07). Newsroom (https://immigranthallofhonor.org/newsroom/, modified 2026-07-20, lists posts through 2026-10-04).
- Museum: described as a long-term vision of an interactive national museum in Texas (home page says Central Texas). I found no site, date, budget, architect, capital campaign or partner for it on the IHH site or in searches (IHH home https://immigranthallofhonor.org/ modified 2026-10-08; Mission and Vision page).
- Cadence: 18 blog posts between 2026-07-07 and 2026-10-04 (5 in July, 3 in August, 8 in September, 2 in October to the 4th), pages edited as recently as 2026-10-08; five social channels linked in the footer (Instagram, Facebook, X, YouTube, TikTok). I could not read YouTube channel metrics (the fetch returned only footer links).
- Confidence: high on programs and cadence (primary, dated by the CMS); med on "no museum specifics exist" (absence of evidence after targeted search).

**F-a4. The site is built and credited to an outside agency; who holds hosting and plugin rights is not public.**
- Footer credit on every page: website by Woody Creative (read from the homepage HTML, 2026-10-08). Woody Creative describes itself as a boutique Austin agency doing WordPress development, SEO, video and content, and states it provides hosting via WP Engine on dedicated private servers; its portfolio page does not list IHH (https://woodycreative.com, fetched 2026-10-08, undated).
- Stack facts re-checked from the REST root (2026-10-08): WordPress with Kadence theme and Kadence Blocks Pro, Rank Math, Google Site Kit 1.189.0 (meta generator), Code Snippets plugin, WP Engine cache and sign-on plugins, a Liquid Web "Harbor" plugin, and REST namespaces named mcp and wp-abilities (consistent with the WordPress Abilities API and an MCP endpoint; I did not call it). A script from googletagmanager.com is now present on the homepage, which differs from the B1-R3 note that no analytics tag was found (B1-R3 e3, 2026-10-08).
- Inference only: the agency credit plus its WP Engine hosting line suggest the WP Engine account may be agency-managed rather than IHH-held. B1-R3 recorded that DNS is at GoDaddy and the install name resembles "immigrationhal" on WP Engine's domain (B1-R3 e3). Nothing public says who owns the GoDaddy login.
- Confidence: high on footer credit and plugin list (direct observation); low on who owns hosting/DNS (inference).

**F-a5. "Challenge X" has no public footprint I could find; the only primary document is the local brief.**
- Five targeted searches (queries 1, 3, 4, 23, 36 in the log) returned nothing naming Challenge X, IHH, a sponsor program, a rubric, prior editions or prize pools. The IHH site search for hackathon, volunteer, chatbot and intern returns nothing relevant (REST /search, 2026-10-08).
- The brief (local file CHALLENGE X_IHH.pptx, read 2026-10-08; 7 slides): Use Case titled "Creating Engaging and Interactive Content for a Virtual Museum", Project Sponsor IHH; problem: a new non-profit needs to separate itself, existing site relevant but not engaging; focus on profile content for 10 named inductees; "choose at least four"; begin with existing IHH content and add public content; all content reliable and verifiable; deliver in a format easily integrated into the existing website; goal: engage visitors especially young people; proposed solution steps end with transferring resources to the IHH communications/website team; resource types include historical audio/video, images of artifacts with AI-generated annotation, AI-generated audio/video of or about inductees; impact: IHH growth, lead among virtual museums, "develop UE skills in a real world environment", work with IHH communications/website team and leadership; incentives: $200 honorarium per successful profile, introduction to and support from the IHH team, website presence and acknowledgement. There is no rubric, no judge list and no ranking language in the brief.
- Project context files suggest a university course: the folder holds a George Mason University SWE 632 (User Interface Design and Development) Fall 2026 HW2 report for a project called "Voices of Arrival" (HW2 individual report (.docx in the project root, gitignored), dated 2026-10-06), and an IHH board member (Witte) is a retired GMU professor (IHH Leadership page; also https://iir.gmu.edu/about, summary only). "UE" in the brief plausibly means user experience.
- Confidence: high on what the brief says; low that Challenge X is inside GMU SWE 632 (inference from the project's own files; no public page confirms it); high that no rubric is public.

**F-a6. The brief's incentives are accept/reject per profile, not a visible prize ladder.**
- The only stated money is a $200 honorarium per successful profile; recognition is website presence and acknowledgement (brief slide 7). "Successful" is undefined. That reads as an acceptance gate on each profile plus publication credit, not a winner-take-all prize, though the project may still be ranked in some other way (user states 10-15 teams; no source for the number was found).
- Confidence: med (primary text, but intent is interpretive).

**F-a7. IHH's capacity signals: content-strong, engineering-light, AI-curious.**
- Evidence for content strength: weekly-plus publishing, guided-interview storytelling program, a research professor and an educator on the board.
- Evidence for engineering-light: one listed staff member with a communications profile; an external agency built the site; no developer named anywhere; 990-N-class organization.
- Evidence for AI-curious: the brief asks for AI-generated annotation and media; B1 notes IHH plans an AI chatbot over the content (DECISIONS.md, IHH requirements entry); the site exposes mcp and wp-abilities REST namespaces; Rank Math exposes an ai-visibility namespace (REST root 2026-10-08).
- Not found: any statement about WP Engine plan tier. The plan can be bounded only by WP Engine's published tiers (see F-d5).
- Confidence: med for the pattern, low for any single inference.

**F-a8. The people most likely to judge or accept deliverables are non-technical (inference).**
- From the bios in F-a2: research (Witte), education and writing (Gray), finance/ed-tech sales (Koskay), sociology (Kalia), business (Ochoa), communications (Ring). None lists software or design engineering. If they evaluate directly, the vocabulary that lands is likely credibility, clarity, education value and story rather than engine architecture.
- Confidence: low-med (inferred from public bios; the actual evaluators are unknown).

---

### 1b. Hackathon and challenge judging norms

**F-b1. Typical rubric shape: 4-6 criteria, roughly equal weight on novelty, execution, impact.**
- A 2026 practitioner breakdown lists innovation/novelty 20-25%, technical implementation 20-25%, impact/usefulness 20-25%, demo/presentation 15-20%, completeness 10-15% (Reskilll, "What Hackathon Judges Look For", https://blogs.reskilll.com/what-hackathon-judges-look-for-complete-judging-criteria-breakdown-2026/, 2026-08-21).
- A hackathon playbook uses 4 criteria scored 1-5 (innovation and creativity, technical execution, impact and viability, presentation) and advises weighting viability and real-world relevance higher for impact-focused events; it also says to score what was built, not what was planned (BuilderBase Hackathon Playbook ch. 15, https://intercom.help/builderbase/en/articles/14831464-hackathon-playbook-ch-15-judging-rubrics, 2026-04-29).
- Confidence: med-low (SEO/vendor-style blogs, but two independent sources agree on shape).

**F-b2. Published rubrics from student and civic programs weight user need and real-world potential heavily and give accessibility a named but small slot.**
- Prompt to Prototype (University System of Maryland at Shady Grove, 2026): Challenge and User Need 25, Solution Quality 25, Innovation and Value 20, Impact and Future Potential 15, Presentation and Communication 10, Responsible Design 5 (ethical, privacy, accessibility or bias considerations); awards include Best Real-World Potential (https://sites.google.com/view/prompt-to-prototype/rules-rubrics-etc, last updated 2026-06-26).
- Google Solution Challenge 2026 (summary only; I could not open the official rubric page): 50 points split Impact 25 and Technology 25, with 5 points inside Impact for describing user feedback, testing and iteration (WebSearch result, query 45, 2026-10-08).
- AccessHack (Northeastern): four equal categories - accessibility against WCAG, realism, evaluation plan, presentation (https://accesshack.sites.northeastern.edu/the-challenge, undated, fetched 2026-10-08; year implied 2023 by a code-of-conduct link).
- GMU Honors College Challenge Day (spring 2026): five-hour event, six nonprofit partners with one team each, two prizes; judged by alumni and partner leaders on innovation and actionability; a winning team's prize was "most actionable recommendation" built within the partner's budget (https://business.gmu.edu/news/2026-04/when-students-compete-help-local-organizations-solve-problems-everybody-wins, 2026-04).
- Confidence: high for the Prompt to Prototype rubric (primary page), med for the others.

**F-b3. Cultural-heritage hackathons mix jury categories and seldom publish rubrics.**
- Coding da Vinci (German culture hackathon): 48-hour kick-off, 10-week sprint, public award ceremony, expert jury of six from computer science, design, archiving and creative coding, five prize categories including a funniest-hack prize and an audience prize; projects must use provided open data and release source code under an open licence (Wikimedia learning pattern, https://meta.wikimedia.org/wiki/Grants:Learning_patterns/Coding_da_Vinci_-_the_culture_hackathon, undated, fetched 2026-10-08; jury composition from a search summary of codingdavinci.de, query 10).
- Philadelphia Museum of Art hackathon announced its criteria only at kick-off (technical.ly, https://technical.ly/software-development/hackthemuseum-philadelphia-museum-art.md, 2017-03-20); the National Museum of American Diplomacy ImpactHack 2020 results page lists about 400 participants, two categories and winners but no criteria (https://diplomacy.state.gov/announcing-the-winners-of-impacthack2020, 2020-08); Walters ArtBytes awards by audience type (scholars, students and teachers, visitors, internet users) per a search summary (page returned 403).
- Confidence: med.

**F-b4. How judges weigh demos: video and a first working flow dominate (practitioner consensus).**
- Judges see many entries; the recorded video is often the entry point and sometimes all that is watched (Lessons from Winning Five Hackathons, https://sustained.substack.com/p/lessons-from-winning-five-hackathons, 2022-11-21).
- A working demo beats a more ambitious project shown as slides; opening with a one-line identity ("a tool that does X for Y"); appropriate scope ranks above multi-feature builds; UI polish beyond legibility and stack choice reportedly did not move scores (Kurbaitaev, "What Judges Actually Score", https://dev.to/kurbaitaev/what-judges-actually-score-notes-from-a-year-of-hackathon-judging-3p4l, 2026-07-27).
- Show something working within about 90 seconds; one complete flow beats multiple features; lead with the problem (JetBrains blog, "How to win a hackathon: notes from the judging table", https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/, 2026-06).
- Judges tend to reward projects that make the sponsor look good rather than the most technically superior one (Substack above).
- Confidence: med (four practitioner sources converge; none is empirical research).

**F-b5. Dissent: polish and pitch may dominate in some events.**
- One post-mortem of HackEurope 2026 argues front-end polish and pitch carried the judging, that roughly 90% of entries were generic "vibe coded" projects, and that hard technical problems were avoided (acheong08 via zeli.app, https://zeli.app/en/story/49327490, 2026-08-17). A search summary of two other 2026 pieces repeats the "AI slop" and "30-100 demos a day" claims (query 21; pages not opened).
- Confidence: low (single opinionated blog on one event; conflicts with F-b4 on polish).

**F-b6. Sponsor-judged nonprofit contests reward fit and actionability over technical sophistication.**
- Capital One Gift the Code (2018): winners included both a complex two-sided platform and a simple Google Sheets intake form; the judge credited analysis of needs and a solution that fit the data and the organization (BetaKit, https://betakit.com/capital-ones-gift-the-code-shows-that-both-simple-and-complex-tech-solutions-require-user-focus/, 2018-11-28).
- GMU Challenge Day winner was the "most actionable" proposal (F-b2). Prompt to Prototype has a dedicated Best Real-World Potential award (F-b2).
- Confidence: med.

**F-b7. Most hackathon work stops within days; what survives depends on team skills and intent to expand reach.**
- Peer-reviewed study of Devpost/GitHub data from 78 events (23 non-collegiate, 55 collegiate; about 21 projects per event on average, so roughly 1,600 projects): 35.30% of projects had at least one commit after the event, 17.06% by day 6, 3.55% at five months (the paper's introduction rounds this to about 5% beyond five months); about 65% discontinued. Short-term continuation was associated with prior technical preparation, number of technologies and winning; long-term continuation with skill diversity in the team (71% lower discontinuation hazard), matching skills (53% lower), and intent to expand the project's reach; intense short-term activity was associated with lower long-term continuation (Nolte, Chounta, Herbsleb, "What Happens to All These Hackathon Projects?", Proc. ACM HCI 4 CSCW2, Article 145, 2020-10, https://par.nsf.gov/servlets/purl/10284449; I read the full text locally with pdftotext).
- Caveat: only projects with a GitHub repository were measured; non-code continuation (a nonprofit quietly using an artifact) is invisible.
- Confidence: high on the numbers (primary paper, read in full); med on transfer to this case.

**F-b8. Civic-tech handovers succeed with off-the-shelf technology, stakeholder relationships and a planned handover.**
- Hou and Lampe studied 16 civic hacking projects in one Midwestern U.S. city and concluded sustainable projects leverage off-the-shelf technologies, build relationships with stakeholders, and plan handover and sustainability early (Sustainable Hacking, EUSSET digital library, https://dl.eusset.eu/items/839637aa-ab6c-4c17-8241-72403fb8519d/full, 2017; read through a fetch summary of the abstract page).
- University capstone guidance for sponsors lists handover items such as design notes, source and build/deploy instructions, and operations documentation, and notes sponsors often cannot support student-built systems once students leave (summary only: UA CS Capstone Sponsor Guide https://cs.ua.edu/2025/12/12/capstone-project-sponsor-guide/, 2025-12-12; query 14).
- Confidence: med-low (small n; one fetch summary; capstone page summary only).

---

### 1c. Likely competitor entries and the ceiling of easy tools

**F-c1. No public information exists about the other 10-15 teams.** Everything in this sub-route is inferred from tool ceilings and from what student teams typically ship. Confidence in any specific competitor claim: low.

**F-c2. The ceiling of free no-code storytelling tools (what a team gets in a day).**
- TimelineJS (MPL-2.0; repo pushed 2026-09-22; npm @knight-lab/timelinejs 3.9.13 published 2026-07-26) runs from a Google Sheet; guides suggest roughly 20 entries is the comfortable size (summary only). StoryMapJS (repo pushed 2026-09-13; 250 stars; licence not asserted by GitHub) and Juxtapose (branch pushed 2026-09-19, last default-branch commit 2026-08-27, a dependency bump; licence not asserted) are maintained at a low tempo (GitHub API and npm registry probes, 2026-10-08). All three are Northwestern Knight Lab tools.
- Momento360 free plan: 750 MB, 100 active shares and embeds, 4K max display, Momento360 watermark on shares and embeds, image/link/embed/navigation hotspots; audio, video and HTML hotspots are paid (help.momento360.com plans page, https://help.momento360.com/article/108-plans-pricing-and-features, prices current as of 2025-11-07). So an easy 360 embed carries a watermark and cannot host HTML hotspots on the free tier.
- Thinglink, Canva, Genially are commonly cited student tools for panoramic "virtual galleries" (query 19-20 summaries only; low).
- Google Arts and Culture partner program is invite-only (B1-R8 F-b2).
- Confidence: high for Momento360 limits and Knight Lab repo status (primary pages/APIs); low for the "20 entries" and Thinglink claims (summary only).

**F-c3. Free AI media tools put talking avatars, podcast-style audio and generated worlds within reach of every team.**
- HeyGen free: 3 videos per month, 720p, watermark; D-ID trial: 3 minutes per month (summary only, query 40). NotebookLM free: 100 notebooks, 50 sources per notebook, 3 audio overviews per day (Elephas blog, 2026, summary only, query 41). World Labs Marble free: about 4 generated worlds per month, but export requires a paid plan (summary only, query 39).
- These are volume-limited and watermarked or non-exportable, so a team using them must either pay, accept watermarks, or stitch results together; none gives verified-fact linkage.
- Confidence: low-med (search summaries from third-party pages; vendor terms change).

**F-c4. Several "differentiating" ideas are already commodity.**
- Historical-figure chatbots (Einstein and Washington are standard examples), museum AI personas (the Met's Natalie Potter), and 3D gallery plus AI chatbot builds appear in Devpost and museum-hackathon galleries (summaries of queries 48-49; Hackathon X Vol. 2, Badisches Landesmuseum / Allard Pierson, 2021-06, winners included an AI-personalized tour and an AR audio bot, https://datalab.landesmuseum.de/tools_experiments/04_Hackathon X - Vol. 2.html, summary only).
- Confidence: low-med.

**F-c5. Probable competitor profile if Challenge X sits in a graduate HCI course (premise unverified, F-a5).**
- GMU SWE 632 syllabi (Fall 2023/2024, Spring 2022; pages not retrievable, PDF links returned 404) are described in search summaries as covering needfinding, prototyping, heuristic evaluation and think-aloud studies. Pratt, ArtCenter and similar student museum redesigns tend to deliver Figma/InVision/Webflow prototypes with usability evidence (search summary, query 22).
- Under that premise, competing deliverables lean toward researched prototypes and WordPress-ready layouts rather than production 3D. Under the opposite premise (an open call across universities), the field could include engineers with polished builds. I cannot tell which.
- Confidence: low.

**F-c6. Accessibility is a base-rate gap.**
- WebAIM Million 2026: 95.9% of home pages had detectable WCAG 2 failures; 56.1 errors per page on average (up 10.1% year over year); most common: low-contrast text 83.9%, missing image alt text 53.1%, missing form labels 51%, empty links 46.3%; pages with ARIA averaged more errors than those without (https://webaim.org/projects/million/, 2026-02).
- B1-R1 found only 1 of 6 award-winning immersive sites offered captions, audio description and pause, and 3 of 6 blocked zoom (INTERIM-1 item 5).
- Confidence: high on the base rate; med that student entries follow it.

---

### 1d. Maintainability for a small non-profit

**F-d1. All five git-based CMS options are free, open and currently active (npm and GitHub probes, 2026-10-08).**

| CMS | Licence | Latest release (date) | Repo signal | Editor login / hosting need |
|---|---|---|---|---|
| Decap CMS | MIT | decap-cms-app 3.16.3 (2026-09-22); 3.17.0-beta.1 (2026-09-14) | 19.4k stars, 608 open issues, pushed 2026-10-08 | Static admin page plus config.yml; GitHub backend needs every editor to have push access to the repo and an OAuth proxy on a separate domain (edge worker or serverless) unless hosted on Netlify; Netlify Git Gateway is deprecated (not reversed); hosted Decap Turbo exists (pricing not checked) |
| Sveltia CMS | MIT | @sveltia/cms 0.233.0 (2026-10-08; 3 releases in 2 days) | 2.9k stars, 39 open issues; one maintainer (5,645 commits, next contributor 4) | Decap-compatible config; GitHub sign-in by fine-grained token, or OAuth via a deployed client (Cloudflare Worker authenticator); client-side PKCE listed as unimplemented, waiting on GitHub; Write role required |
| Keystatic | MIT | @keystatic/core 0.6.9 (2026-08-26); @keystatic/astro 6.0.0 (2026-08-18, peer astro 5, 6 or 7) | 2.4k stars, 196 open issues, last commit 2026-10-01; company-backed (Thinkmill) | GitHub mode needs a GitHub App, client id/secret and server routes (the Astro integration injects /keystatic and /api/keystatic routes with prerender off), so it needs a server runtime, not only static files; local mode is developer-only |
| TinaCMS | Apache-2.0 | tinacms 3.14.2 (2026-10-01); CLI 4.0.1 requires Node 22 or 24 | 13.8k stars, pushed 2026-10-08 | TinaCloud free tier: 2 users, 2 roles, 100 MB asset cap; Team $24 per project per month (10 users); editorial workflow starts at $41 |
| Pages CMS | MIT | no npm package; repo pushed 2026-10-07 | 4.1k stars; one maintainer (hunvreus / Ronan Berder) | Hosted instance app.pagescms.org is free; site says editors can be invited by email with no other account; self-hosting needs PostgreSQL plus a GitHub App; config is .pages.yml in the repo |

Sources: npm registry JSON for decap-cms-app, @keystatic/core, @keystatic/astro, tinacms, @tinacms/cli, @sveltia/cms (queried 2026-10-08); GitHub REST API repo, release, commit and contributor endpoints for decaporg/decap-cms, Thinkmill/keystatic, tinacms/tinacms, sveltia/sveltia-cms, hunvreus/pagescms (queried 2026-10-08); Decap docs via Context7 (https://decapcms.org/docs/github-backend and /backends-overview); Keystatic source docs via Context7 (https://github.com/thinkmill/keystatic, _autodocs/adapters/02-astro.md); Sveltia GitHub backend docs (https://sveltiacms.app/en/docs/backends/github, undated); Pages CMS README (https://raw.githubusercontent.com/hunvreus/pagescms/main/README.md) and site (https://pagescms.org/, undated); TinaCMS pricing (https://tina.io/pricing, undated).
- Confidence: high on versions, dates and licences (registry/API); med on auth and hosting details (docs read through fetch summaries or Context7 excerpts).

**F-d2. Every git-based option needs either a GitHub write-access account per editor or a third-party identity layer.**
- Exceptions: Pages CMS hosted (email invite per its site), DecapBridge (hosted auth for Decap: free tier 3 sites and 10 collaborators, $9 per month for unlimited, no GitHub account needed for editors; run by millisecond.studio; https://decapbridge.com, undated, fetched 2026-10-08).
- Netlify reversed its Identity deprecation on 2026-02-19 but Git Gateway, which Decap used for non-GitHub editors, stays deprecated with security fixes only (https://answers.netlify.com/t/netlify-identity-is-staying-feb-2026-reversal-what-changed-whos-affected-and-how-to-proceed/162733, 2026-02-19).
- Cloudflare Workers free plan (for a small OAuth proxy): 100,000 requests per day, 10 ms CPU per request, 50 subrequests (https://developers.cloudflare.com/workers/platform/limits/, undated).
- Confidence: med-high (primary vendor pages; some via fetch summaries).

**F-d3. Maintenance risk differs by project structure.**
- Sveltia and Pages CMS are single-maintainer projects; Sveltia's README calls Decap neglected, yet Decap's repo shows a release on 2026-09-22 and commits by several people on 2026-09-11 and 2026-09-22 (contradiction, section 3).
- Three of the five options (Decap, Keystatic, TinaCMS) show several active contributors or a company behind them (contributor API: Decap top contributors 822/465/317 commits; Keystatic 525/137/119 plus a release bot; Tina 2,402/2,062/1,611), while two (Sveltia, Pages CMS) depend on one person.
- Sveltia ships several releases a day at 0.x versions; version churn is high for a "set and forget" handoff.
- Confidence: med-high (API data).

**F-d4. Astro content collections give a validated content layer that a CMS can write into.**
- The glob() loader reads Markdown, MDX, Markdoc, JSON, YAML and TOML from any folder; a Zod schema validates every entry and surfaces an error when a file violates it (Astro docs via Context7, https://docs.astro.build/en/guides/content-collections/, undated).
- Astro 7.3.8 (2026-10-08) requires Node 22.12 or newer (npm registry); anyone who rebuilds the site locally needs that toolchain (B1-R3 notes the same).
- Derived (not tested): a schema violation committed through a CMS would fail the CI build and leave the previous deployed version live on hosts that keep the last good build. The CMS field config (Decap config.yml, Keystatic config.ts, .pages.yml) is a second copy of the schema that must be kept in sync by hand.
- Confidence: high on the Astro facts; low on the derived behavior.

**F-d5. $0 hosting paths and their ceilings.**
- Cloudflare Pages Free: 500 builds per month, 1 concurrent build, 20,000 files per site, 25 MiB per file, 100 custom domains per project (https://developers.cloudflare.com/pages/platform/limits/, last updated 2026-09-05). B1 already identified this as the best fit on bandwidth and terms grounds (INTERIM-1 item 8).
- WP Engine static route (no new accounts): static HTML can be placed by SFTP, SSH or Git as folders each containing index.html; WP Engine warns its support will not troubleshoot static sites, the page cache must be cleared by hand, search-replace and WP-CLI do not apply, and relative links are recommended (https://wpengine.com/support/static-html-website/, updated 2026-04-10).
- WP Engine published tiers: Essential from $28 per month for the first year, 1-30 sites, 25,000-400,000 visits per month, 10-50 GB storage, 75 GB bandwidth, shared resources; Core and Enterprise higher (https://wpengine.com/plans/, undated, fetched 2026-10-08). IHH's tier is unknown. Illustrative arithmetic from B1's scene budget of about 3 MB per scene: a visitor who opens all 15-20 scenes pulls roughly 45-60 MB, so 75 GB would cover on the order of 1,250-1,650 complete visits per month before the main site's own traffic (derived; ignores CDN offload and caching).
- GitHub for Nonprofits: verified 501(c)(3) organizations that are non-governmental, non-academic, non-commercial and non-political can get a free GitHub Team plan; application via nonprofits.github.com with review by GitHub support (https://docs.github.com/en/nonprofit/quickstart, undated). IHH's ruling letter makes it plausibly eligible; whether IHH has a GitHub organization is unknown.
- Confidence: high on listed limits (vendor docs); low on the bandwidth illustration and on IHH's tier.

**F-d6. WordPress-native handoff for the profile package does not need a developer.**
- WordPress block editor can export a pattern as JSON and import it on another site from the Patterns manager (Appearance > Editor > Patterns or Design > Patterns); synced patterns propagate edits sitewide (summary only: Pressable and Speckyboy guides, query 42; not verified against developer.wordpress.org).
- IHH already uses Kadence Blocks Pro, a Lottie post type and galleries (01-reference-and-ihh-audit.md B4/B6).
- Confidence: med-low (guides, not the official handbook).

**F-d7. Documentation and handoff patterns that show up in the sources.**
- Diataxis splits docs into tutorials, how-to guides, reference and explanation and warns against mixing them (Canonical's adoption post https://canonical.com/blog/diataxis-a-new-foundation-for-canonical-documentation, undated; summary).
- Nonprofit handover guides stress an account and ownership inventory (registrar, DNS, hosting, CMS, analytics, search console), recorded walkthroughs because live demos are forgotten, and a maintenance rhythm (weekly updates, monthly tests, quarterly review) (summary only: eseospace, Elementor and Elevation Web handover articles, query 43).
- Confidence: med-low (agency blogs, not research).

**F-d8. Digital projects tend to decay when funding or people change.**
- A study of 5,845 URLs cited in Digital Humanities conference abstracts (2006-2016) estimated a useful project lifespan of about five years and found decay tied to missing post-project plans (Meneses, Martin, Furuta, Siemens, "Part Deux: Exploring the Signs of Abandonment of Online Digital Humanities Projects", DH 2018, https://dh2018.adho.org/part-deux-exploring-the-signs-of-abandonment-of-online-digital-humanities-projects/, 2018).
- Summary-only: NEH-funded sites from 1996-2003 that moved into centers with preservation as routine operations mostly survived to 2022; Flash (end of life 2020) and QuickTime VR plugins stranded museum projects, and the Smithsonian is re-creating some (query 46-47; the Smithsonian Archives post returned 403).
- Confidence: med for the five-year figure (peer-reviewed abstract), low for the rest.

**F-d9. Google surfaces relevant to adoption (official docs via Google Developer Knowledge).**
- Google for Nonprofits (US): 501(c)(3) plus validation by Goodstack; schools, universities, governments, hospitals and fiscally sponsored groups without their own 501(c)(3) are excluded (https://support.google.com/nonprofits/answer/3215869, undated). Benefits relevant here: Google Workspace for Nonprofits at no charge with up to 2,000 users (300 for new accounts) and 100 TB shared storage (Workspace Admin help "Google Workspace for Nonprofits edition", via GDK, undated); extra Maps Platform credits from $250 per month, requiring authority to accept the Maps agreement and admin access to the billing account (https://developers.google.com/maps/billing-and-pricing/public-programs, undated). Ad Grants ($10,000 per month) could not be confirmed from official docs in GDK; the figure is from search summaries (queries 51-52).
- Implication for who can claim what: a GMU student cannot enroll for these programs; IHH can if it applies. IHH's current status is unknown.
- Search guidance: Google renders JavaScript but recommends server-side or pre-rendering, requires links to be real anchor elements with href (not URL fragments), advises the History API for client-side routing, and warns about soft 404s in single-page apps (https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics, undated). Organization structured data is recommended on the home page or an about page (https://developers.google.com/search/docs/appearance/structured-data/organization, undated; announcement 2023-11-29).
- Core Web Vitals "good" thresholds at the 75th percentile: LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1 (web.dev, "Defining the Core Web Vitals metrics thresholds", https://web.dev/articles/defining-core-web-vitals-thresholds, last updated 2025-05-07).
- Confidence: high (official docs).

---

### 1e. Demo and submission strategy; accessibility as differentiator

**F-e1. Recommended 3-minute structure (practitioner).** Hook with the problem 0:00-0:20; what you built 0:20-0:40; demo 0:40-2:30; stack and impact 2:30-2:50; close 2:50-3:00; record a backup video of the live demo and switch to it if the live run fails (Reskilll, "Hackathon Demo and Presentation Tips", https://blogs.reskilll.com/hackathon-demo-presentation-tips-pitch-3-minutes-win-2026/, 2026-08-21). Another guide says to start the video with the demo itself rather than a long introduction and cautions that content past three minutes may be ignored (Hackathon.com tips, https://tips.hackathon.com/article/creating-the-best-demo-video-for-a-hackathon-what-to-know, 2021-07-29; neither addresses captions). Confidence: med-low (blogs agree with each other and with F-b4).

**F-e2. Live-demo failure modes are well known (network, third-party service rate limits, battery); pre-recorded backup is the standard hedge** (AngelHack, Reskilll and other tips pages in query 29; summary). Confidence: med.

**F-e3. Google Maps constraints on demo media (verified this session).**
- Street View: no screenshots or removal from embedded sources for any purpose, no downloads, no stitching; use in television, film or online video is allowed only when filmed in the context of a person using the product as-is on a device, and a request must be submitted; the restrictions apply equally to academic, nonprofit and commercial projects (Google Geo Guidelines, https://about.google/brand-resource-center/products-and-services/geo-guidelines/, undated, fetched 2026-10-08).
- Google Maps and Google Earth footage for educational, instructional, recreational or entertainment videos needs no permission but needs attribution; commercial or promotional use of Earth is excluded (same page).
- Map Tiles API promotional videos must not include Street View imagery, must run 30 seconds or less, and must be marked for promotional purposes only (Map Tiles API policies via GDK, https://developers.google.com/maps/documentation/tile/policies, undated).
- Street View Static API policy page itself covers attribution and caching but not screenshots; the screenshot and video rules live in the Geo Guidelines (https://developers.google.com/maps/documentation/streetview/policies, undated).
- B1-R8 reached the same conclusions (F-a9, I2).
- Confidence: high.

**F-e4. Accessibility has explicit rubric slots in several challenges (small weight) and is a base-rate gap (F-c6).** Prompt to Prototype gives Responsible Design 5 of 100 points including accessibility (F-b2); AccessHack gives accessibility one of four equal categories; Bellingcat's hackathon grading sheet lists accessibility as one of four criteria (search summary; PDF unreadable by the fetch tool); the Google Solution Challenge variant includes responsible design. Confidence: med.

**F-e5. Legal context for educator adoption (unproven link).** The U.S. Department of Justice ADA Title II web rule requires state and local government entities (including public schools) to meet WCAG 2.1 Level AA; an April 2026 interim final rule moved compliance to 2027-04-26 for entities serving 50,000 or more people and 2028-04-26 for smaller ones; public entities stay responsible when work is outsourced, while content from truly unaffiliated third parties is excepted (https://www.ada.gov/resources/web-rule-first-steps/, April 2026). Whether a teacher linking out to an IHH site triggers any obligation is not established by these pages. Confidence: high on dates and standard; low on relevance to teacher behavior.

**F-e6. Unknown judge conditions.** No source states the judges' devices, the room's network, whether judging is live or from submitted links/video, or whether the Google Workspace/Zoom environment blocks WebGL or large downloads. Confidence: n/a (gap).

---

### 1f. Counter-route: does an elaborate 3D build lose to a simpler, content-rich solution?

**F-f1. Evidence that simplicity and fit win in sponsor-judged nonprofit contests (F-b4, F-b6).** Gift the Code (both a complex platform and a Google Sheets form won, judged on fit), GMU Challenge Day (actionable under budget), Prompt to Prototype (real-world potential award), practitioner consensus that a working end-to-end flow beats ambition. Confidence: med; all anecdotal or small.

**F-f2. Evidence that immersive and visual work can win or engage more.**
- A 2025 peer-reviewed study at a Thai house museum (84 visitors) found VR and mixed reality scored higher than 360-degree tours on presence (p = 0.026 and 0.005) and engagement (p < 0.001) (Ariya et al., Virtual Reality, Springer, 2025-07-22; summarized on the vendor site https://atopia.space/blog/why-virtual-exhibitions-outperform-360-tours-in-museums, 2025-08-14). It compares headset VR/MR against 360 tours, not web 3D on phones, and the summary comes from a vendor.
- Cultural hackathon prizes have gone to VR (Coding da Vinci's audience award for a snake-skeleton VR project, per search summary) and to interactive web maps (ImpactHack 2020). The HackEurope post-mortem (F-b5) says visual presentation dominated.
- 02-museum-best-practices.md records the 2026 Webby winner for cultural institutions as a guided 3D experience (National Gallery Imaginarium).
- Confidence: med-low.

**F-f3. Evidence that elaborate builds cost continuation.**
- Short-term burst effort predicted lower long-term continuation (Nolte 2020); more technologies predicted short-term continuation but long-term continuation tracked team skill diversity and intent to expand reach (F-b7). A solo entrant has no skill-diversity from team composition; continuation would have to come from IHH.
- Digital cultural projects with bespoke runtimes have decayed (F-d8).
- Confidence: med for the Nolte link, low for the rest.

**F-f4. No direct evidence found for the specific claim "a 3D build lost to a simpler nonprofit entry in a judged challenge."** Searches (queries 30-32) returned general advice and the cases above, not a documented head-to-head. Treat F-f1 and F-f2 as two unreconciled bodies of weak evidence, not as a measured effect size. Confidence: high that no direct head-to-head was found in these searches; med that none exists.

---

## 2. Confidence summary

| Finding | Confidence | Why |
|---|---|---|
| F-a1 IHH registration, no financials | high / low on size | ProPublica API + GuideStar agree; no revenue figure public |
| F-a2 leadership and staff | high | IHH pages (primary, self-reported) |
| F-a3 programs, cadence, museum vagueness | high / med | CMS-dated pages; absence-of-evidence for museum details |
| F-a4 agency-built site, plugin list | high / low | footer + REST namespaces direct; hosting ownership inferred |
| F-a5 Challenge X identity | low | only local brief and project files; no public page |
| F-a6 accept/reject incentive | med | brief text, interpretive |
| F-a7 capacity pattern | med / low | public pages, inference |
| F-a8 reviewers non-technical | low-med | bios only |
| F-b1 rubric shape | med-low | blogs, convergent |
| F-b2 published student/civic rubrics | high (P2P) / med | primary rubric page; others summaries |
| F-b3 cultural hackathons | med | wiki learning pattern, archived announcements |
| F-b4 demo weighting | med | 4 convergent practitioner sources |
| F-b5 polish-dominates dissent | low | single blog |
| F-b6 fit over sophistication | med | two events + rubric award |
| F-b7 continuation numbers | high | peer-reviewed paper read in full |
| F-b8 civic hacking sustainability | med-low | small study via summary |
| F-c1 competitors unknown | high (that it is unknown) | no public data |
| F-c2 easy-tool ceilings | high / low | primary pages and APIs / summaries |
| F-c3 free AI media | low-med | third-party summaries |
| F-c4 commodity ideas | low-med | search summaries |
| F-c5 competitor profile | low | premise unverified |
| F-c6 accessibility base rate | high / med | WebAIM 2026; transfer to student entries uncertain |
| F-d1 CMS table | high / med | registry and API; auth via docs excerpts |
| F-d2 editor auth | med-high | vendor pages |
| F-d3 bus factor | med-high | contributor API |
| F-d4 Astro collections | high / low | docs; derived build behavior untested |
| F-d5 hosting limits | high / low | vendor docs; bandwidth math illustrative |
| F-d6 WP pattern JSON | med-low | guides, not official handbook |
| F-d7 documentation patterns | med-low | agency blogs |
| F-d8 decay | med / low | peer-reviewed abstract; rest summaries |
| F-d9 Google programs and search guidance | high | official docs (Ad Grants amount is summary-only) |
| F-e1-e2 demo structure | med-low / med | blogs agree |
| F-e3 Maps constraints | high | Geo Guidelines read in full plus GDK policy text |
| F-e4 accessibility rubric slots | med | one primary rubric, others summaries |
| F-e5 ADA Title II | high / low | ada.gov; applicability to teachers unproven |
| F-f1-f4 counter-route | med-low | anecdotal, no head-to-head |

---

## 3. Contradictions

1. **Working demo versus polish.** Four practitioner sources say a working end-to-end demo beats ambition and that polish beyond legibility does not move scores (F-b4); the HackEurope post-mortem says front-end polish and pitch dominated and that there was no burden of proof that projects worked (F-b5). Unreconciled; event type (recruiting-oriented, large) probably explains the difference, not tested.
2. **Immersion helps versus simple wins.** A peer-reviewed study finds VR/MR beats 360 tours on presence and engagement (F-f2) while sponsor-judged nonprofit contests favor actionable, fitting solutions over technical sophistication (F-f1). They answer different questions (visitor engagement with headsets versus sponsor evaluation of deliverables).
3. **Decap maintenance.** Sveltia's README calls Decap neglected for years; Decap's repository shows a 3.16.3 release on 2026-09-22, a 3.17 beta, and merged work from several maintainers in September 2026, plus 608 open issues. Both can be true: active release train with a large backlog. Snyk's maintenance label in a search summary says "sustainable" (query 15).
4. **Sveltia "maintenance-free" versus single-maintainer churn.** Its README markets a small maintenance-free app; the repository shows one dominant maintainer and three releases in two days at version 0.x.
5. **Netlify Identity status.** Deprecated in 2025, reversed 2026-02-19; Git Gateway not reversed. Older articles and some community answers still say all of it is dead.
6. **IHH analytics.** B1-R3 found no analytics script on the homepage; on 2026-10-08 the homepage loads googletagmanager.com via Site Kit. Either the tag was added in between or the earlier pattern match missed it.
7. **Prize framing.** The brief offers a per-profile honorarium and publication credit; the project framing assumes 10-15 competing teams with ranked judging. No source shows whether there is a ranking, a shortlist or just acceptance.
8. **Founding date.** IHH says 2024; the IRS ruling is January 2025; Candid shows no founding year. Not a real conflict (incorporation versus recognition), noted for citation hygiene.
9. **Free-tier status of tools.** Several AI tool limits come from third-party summaries dated 2025-2026 that may already be stale (HeyGen, D-ID, Marble, NotebookLM).

---

## 4. Open questions and assumptions

**Assumptions I made (flagged):**
- A1. Challenge X may sit inside GMU SWE 632 Fall 2026 (from project files). If wrong, competitor profiles in F-c5 do not apply.
- A2. The "10-15 teams" figure is the user's; I found no corroboration.
- A3. IHH's reviewers are the people on its Leadership page (F-a8).
- A4. Woody Creative may manage IHH's WP Engine account (F-a4).

**Open questions (answerable by IHH, the course instructor, or the user):**
1. Who evaluates submissions, on what rubric, and is there a ranking, a shortlist or only per-profile acceptance? What does a "successful profile" require?
2. Is Challenge X part of a GMU course, and does the instructor grade process artifacts (needfinding, usability evidence) in addition to IHH acceptance?
3. Who owns the WP Engine account, the GoDaddy DNS login, and the Woody Creative relationship? Can IHH staff install plugins, run Code Snippets, or use SFTP, and would WP Engine's plan tolerate a static folder and its bandwidth?
4. Does IHH have a Google for Nonprofits account, a GitHub organization, a Cloudflare account, a password manager and a documented admin-account inventory?
5. Who at IHH will edit content after November 1 (Jennifer Ring alone? an agency?), and are they willing to create a GitHub or other account for editing?
6. Will IHH accept a showcase under its own domain (subdomain or folder) or only an off-domain link?
7. What device and network will judges use (laptop GPU, phone, locked-down browser, projector Wi-Fi)? Is judging live or from submitted material?
8. Is a teacher actually bound by Title II to prefer accessible third-party sites, or is that irrelevant to link-outs?
9. What did previous cohorts (if any) of this IHH program deliver, and what did IHH publish from them?
10. Pages CMS hosted instance: terms, data retention, and longevity guarantees are not documented in what I read; the operator is an individual.
11. Whether IHH wants any CMS at all, given its editors already work in WordPress.
12. Whether IHH intends to run Google Ad Grants or paid promotion (Ad Grants figure unverified from official docs).

---

## 5. Implications (no recommendation)

- **The delivery gate may be the WordPress package, not the showcase.** The brief's tests (verifiable, integrable into the existing site, engaging for young people) and the per-profile honorarium suggest acceptance is judged profile by profile. The showcase therefore competes on a different axis than the one the brief literally tests.
- **The likely IHH audience for a demo is non-technical and values credibility.** Board bios point to research, education and communications backgrounds. That raises the weight of visible sourcing, plain-language framing and accessibility, and lowers the weight of engine-level detail in a short demo.
- **Adoption is constrained by who can touch the hosting.** One listed staff member with a communications profile, an outside agency that built the site and perhaps hosts it, and a 990-N-scale organization imply the realistic edit and rebuild capacity is low. Options that need a GitHub account per editor, a Node 22 toolchain, a server runtime (Keystatic GitHub mode), or a third-party identity service each add a dependency IHH would have to own.
- **A prebuilt static folder is the lowest-dependency artifact; a CMS adds a second system.** All five CMS options write to a repository and need a build pipeline to publish. Pages CMS and DecapBridge remove the GitHub-account step but put identity or hosting in a third party run by a small team.
- **WP Engine can serve a static folder without new accounts, but with explicit support and bandwidth caveats.** Whether that beats a free external static host depends on IHH's plan tier and who holds the credentials, neither of which is public.
- **Fact-level provenance and accessibility are the hardest items for 10-15 teams to copy quickly**, based on the commodity status of timelines, 360 embeds, AI avatars and chatbots (F-c2 to F-c4) and the 95.9% accessibility failure base rate (F-c6). Competitor depth in either is unobserved.
- **Post-event survival evidence points away from solo-built bespoke systems.** Hackathon projects mostly stop within days; long-term survival tracked team skill diversity and an intent to expand reach; digital humanities projects average a five-year life. IHH ownership, off-the-shelf parts and documentation are the levers the sources name.
- **Demo constraints are tight and mostly known:** about three minutes, a first working flow inside roughly 90 seconds, a recorded backup, no Street View in screenshots or video, attribution on any Google Maps or Earth footage.
- **Evidence for "elaborate 3D loses" is thin and evidence for "immersion wins" is also thin; the decisive variable is who judges and whether adoption is scored.** If judges weigh real-world potential, the Prompt to Prototype and Gift the Code patterns apply; if they weigh wow, the Webby and cultural-hackathon patterns apply.
- **Google-for-Nonprofits benefits flow only to IHH**, so any plan relying on Workspace, Maps credits or Ad Grants carries an IHH dependency and timing risk (Goodstack validation reported at 2-14 business days in a search summary).

---

## 6. Query log (all dated 2026-10-08)

Quotas: required >=6 Google web, >=2 Google Developer Knowledge, >=2 Context7. Counts below are exact for this session.

### 6.1 Google web search (WebSearch tool, mode standard) - 53 queries

1. Immigrant Hall of Honor "Challenge X" hackathon
2. Immigrant Hall of Honor nonprofit founder mission virtual museum Texas
3. "Challenge X" George Mason University use case project sponsor honorarium students nonprofit
4. "Challenge X" university program industry sponsor use case "Creating Engaging and Interactive Content for a Virtual Museum"
5. SWE 632 George Mason University User Interface Design and Development course Fall 2026 real-world sponsor project
6. Woody Creative agency website design Immigrant Hall of Honor
7. Sara Puig Laas Immigrant Hall of Honor museum Central Texas Philip Ochoa announcement inductees class
8. hackathon judging criteria rubric nonprofit impact innovation technical execution feasibility presentation scoring sheet
9. Devpost judging criteria hackathon "technical execution" "impact" "creativity" "presentation" judges weigh demo
10. Coding da Vinci cultural heritage hackathon jury criteria winners projects museum data
11. how hackathon judges decide winners demo video first impression judges only spend minutes per project advice winning hackathon judge interview
12. Nolte "What happens to all these hackathon projects" continuation study CSCW 2020 findings percentage continued
13. civic hackathon outcomes sustainability projects abandoned nonprofit partner adoption handoff research
14. student team industry-sponsored capstone project sponsor handoff documentation maintainability evaluation criteria nonprofit client
15. Decap CMS 2026 maintenance status releases GitHub backend free open source MIT
16. Keystatic Thinkmill 2026 Astro integration GitHub mode local mode cloud pricing status
17. Knight Lab TimelineJS StoryMapJS 2026 status maintained free no code Google Sheets limitations
18. Momento360 free plan limits 2026 pricing 360 photo hosting hotspots embed
19. free tools build virtual museum exhibit online students Canva timeline Genially Google Arts Culture Thinglink Spatial.io virtual gallery
20. Thinglink 360 interactive hotspot free plan education limits 2026 museum virtual tour
21. hackathon 2026 AI-generated projects all look the same judges fatigue vibe coding what stands out
22. UX design course project virtual museum website redesign Figma prototype student case study nonprofit museum
23. George Mason University SWE 632 Fall 2026 syllabus project industry sponsor "Challenge X"
24. Immigrant Hall of Honor George Mason University students project Institute for Immigration Research Witte partnership
25. museum hackathon winners "virtual museum" student competition judges criteria engagement accuracy educational value rubric
26. WP Engine host static HTML files folder SFTP non-WordPress subdirectory plan storage bandwidth limits visits
27. GitHub nonprofit program free GitHub Team verified 501(c)(3) 2026 eligibility
28. ADA Title II web accessibility rule WCAG 2.1 AA compliance dates April 2026 April 2027 public schools third-party content
29. hackathon live demo failed recorded video backup wifi risk advice prerecord demo judges
30. nonprofit hackathon winning team chosen because partner could actually use it simple solution over complex prototype lessons organizers
31. virtual museum 3D tour usage analytics low engagement visitors bounce versus simple online exhibit study
32. "scope creep" hackathon ambitious project unfinished demo broken lost to simpler project judges "working" beats "ambitious"
33. Devpost how to make a great hackathon demo video under 3 minutes tips judges only watch first
34. hackathon accessibility prize category judging criteria accessibility WCAG inclusive design counted in rubric
35. virtual museum website accessibility screen reader 360 panorama inaccessible WCAG museums survey accessibility failures
36. "Challenge X" "Project Sponsor" use case students user experience course nonprofit sponsor "$200 honorarium"
37. Immigrant Hall of Honor inductees Einstein Lamarr Muir Pei Cruz Berlin Hope Strauss Naismith Albright first class announced
38. cs.gmu.edu syllabi Fall2025 SWE 632 User Interface Design and Development project grading usability study prototype
39. World Labs Marble 3D world generation free plan credits pricing export Gaussian splat 2026
40. students AI avatar video HeyGen D-ID free plan limits 2026 talking avatar historical figure museum education
41. Google NotebookLM video overviews audio overviews free students 2026 museum content generation limits
42. WordPress synced patterns import export JSON block editor Patterns manager download as JSON import patterns
43. nonprofit website handoff checklist documentation training credentials ownership domain static site maintainability small nonprofit staff
44. Diataxis documentation framework tutorials how-to reference explanation small team handoff documentation structure
45. Google Solution Challenge 2026 judging criteria rubric scoring weights impact tech implementation
46. digital humanities project sustainability websites decay abandoned after grant ends maintenance study percentage no longer online
47. museum 3D virtual tour project abandoned broken Flash end of life web 3D legacy maintenance cultural heritage digital preservation static site generators sustainable
48. devpost virtual museum project built with three.js A-Frame chatbot AI guide hackathon submission gallery
49. hackathon "AI chatbot" "virtual museum" OR "history" persona ChatGPT historical figure talk to avatar common idea judges seen many times
50. info.devpost.com blog hackathon judging criteria best practices organizers "judging criteria" Devpost guide
51. Google for Nonprofits eligibility verification Goodstack 2026 US 501(c)(3) requirements excluded organizations
52. Google Ad Grants eligibility requirements 2026 $10,000 per month website requirements HTTPS 501(c)(3) account management
53. Netlify Identity deprecated Git Gateway Decap CMS authentication alternative 2025 2026

### 6.2 Google web page fetches (WebFetch tool; page-level reads supporting the searches) - 52 calls

Succeeded: GuideStar profile; ProPublica org page; Reskilll judging criteria; Substack five hackathons; BuilderBase ch.15; Wikimedia Coding da Vinci pattern; EUSSET Sustainable Hacking; Sveltia GitHub backend doc; Pages CMS docs index; Pages CMS homepage; TinaCMS pricing; Decap backends overview; Momento360 plans; zeli.app HackEurope; ImpactHack winners; technical.ly hackthemuseum; WP Engine static HTML doc; GitHub for Nonprofits quickstart; ada.gov web rule; Austin Chamber directory; WP Engine plans; JetBrains judging blog; dev.to Kurbaitaev; BetaKit Gift the Code; Atopia (Ariya et al. summary); AccessHack; Prompt to Prototype rubric; GMU Challenge Day article; Honors College Connects; Google Geo Guidelines; Woody Creative; Hackathon.com demo tips; Reskilll 3-minute pitch; DH 2018 abandonment; Cloudflare Workers limits; Cloudflare Pages limits; WebAIM Million; Google for Nonprofits US eligibility; Netlify Identity 2026 post; DecapBridge.
Returned no usable content: brainbound.blog (403); tib.eu Coding da Vinci Niedersachsen (403); par.nsf.gov Nolte paper (binary PDF; text then extracted locally with pdftotext); pagescms.org getting-started (404); cs.gmu.edu SWE 632 syllabi Fall 2024 and Spring 2022 (404); rss.boorghani.com (429); thewalters.org ArtBytes (403); YouTube channel page (footer only); Bellingcat grading PDF (binary); developers.google.com Solution Challenge FAQ (landing page only); siarchives.si.edu Gone Flash (403).

### 6.3 Google Developer Knowledge MCP - 8 calls (7 search_documents, 1 get_documents)

1. search_documents: Google for Nonprofits eligibility requirements 501(c)(3) verification
2. search_documents: Google Maps Platform credits for nonprofit organizations Google for Nonprofits Workspace Ad Grants benefits
3. search_documents: Google Search JavaScript SEO basics crawlable content single page app rendering static HTML
4. search_documents: Google Search structured data Organization nonprofit donate markup site name
5. search_documents: Google Ad Grants nonprofit $10,000 per month requirements website policy (returned unrelated policy tables; no Ad Grants doc found)
6. search_documents: Google Maps Street View content use in video screenshots permission attribution Geo Guidelines
7. search_documents: Core Web Vitals thresholds LCP INP CLS good performance targets 2026
8. get_documents: documents/developers.google.com/maps/documentation/streetview/policies

### 6.4 Context7 - 8 calls (3 resolve-library-id, 5 query-docs)

1. resolve-library-id: Decap CMS -> /decaporg/decap-cms and /websites/decapcms (used the latter)
2. resolve-library-id: Keystatic -> /thinkmill/keystatic
3. resolve-library-id: Astro -> /withastro/docs and others (used /withastro/docs)
4. query-docs /websites/decapcms: GitHub backend authentication, OAuth app, base_url, write access, editorial workflow, open authoring
5. query-docs /thinkmill/keystatic: Astro setup github storage mode, GitHub App, env variables, who can edit
6. query-docs /withastro/docs: content collections glob loader, zod schema, Markdown and JSON, getCollection, static output
7. query-docs /thinkmill/keystatic: Astro integration output mode, adapter, /keystatic route with static output
8. query-docs /websites/decapcms: admin/index.html script tag, config.yml, collections for Markdown and JSON, media_folder

### 6.5 Direct primary probes (not search; each a read-only GET or local read)

- IHH public WordPress REST API and public pages through the in-app browser (own tab): page list, Mission and Vision, Leadership and six leader pages, Newsroom, Founding Voices, Beyond the Stories, Contact, Nominate, Tell Your Story, Donate, Privacy, posts list, two board/newsletter posts, kadence_element list, REST root namespaces, homepage HTML for generator tag, footer credit, script hosts and social links; REST /search for challenge, hackathon, university, students, partner, volunteer, intern, chatbot, AI.
- npm registry JSON: decap-cms-app, @keystatic/core, @keystatic/astro, tinacms, @tinacms/cli, @sveltia/cms, astro, @knight-lab/timelinejs.
- GitHub REST API: repos decaporg/decap-cms, Thinkmill/keystatic, tinacms/tinacms, sveltia/sveltia-cms, hunvreus/pagescms (via pages-cms redirect), NUKnightLab/TimelineJS3, StoryMapJS, juxtapose; releases, commits, tags and contributors endpoints for the CMS repos; raw README files for Sveltia CMS and Pages CMS.
- ProPublica Nonprofit Explorer API v2 for EIN 993884674.
- Local reads: CHALLENGE X_IHH.pptx (slide text), HW2 individual report (.docx in the project root, gitignored) (first pages), docs/handoff DECISIONS.md and STATE.md, INTERIM-1.md, 00-synthesis.md, grep of B1-R3, B1-R8, 01-reference-and-ihh-audit.md, 02-museum-best-practices.md.
- Local text extraction of the Nolte et al. PDF (pdftotext, scratchpad only).

Not done: no changes to any project file other than this report; no commits; no login, form submission or account creation on any site; no installs or downloads beyond a ~1 MB PDF and small JSON probes in the scratchpad.
