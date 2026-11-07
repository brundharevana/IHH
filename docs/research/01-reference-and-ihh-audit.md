# 01 - Reference design and IHH audit

Research date: 2026-10-07. Rule: nothing below is invented; anything not checked is marked "not verified".

---

## Part A - Reference: Searchable Museum, "Point of Pines Slave Cabin"

URL: https://www.searchablemuseum.com/point-of-pines-slave-cabin/

### A0. Key finding: the "basic design" is a hub plus two linked page types, not one page

The URL IHH cited is a **"Constellation" page** (breadcrumb: Constellations / Point of Pines Slave Cabin). It is short and is a hub. The heavy media (3D, 360) is **not on this page**. It is on the linked exhibit page **"A Cabin Story"** (`/a-cabin-story/`, reached from the "Explore Related Exhibit" button). The user-research "constellation opened a flat image" complaint is explained by the satellite object pages and the central image modal (A3).

### A1. Page structure, top to bottom (constellation page, desktop, rendered in browser)

| # | Section | Purpose | Media type |
|---|---|---|---|
| 1 | Skip-link ("Skip to Content") + black top nav: Exhibits, Constellations (active, star icon), Stories, Resources, About, Search | Global nav | Text/SVG |
| 2 | Breadcrumb bar ("Constellations / Point of Pines Slave Cabin") + orange "Back to Top" pill | Wayfinding | Text |
| 3 | Eyebrow "Explore the Constellation", H1 "Point of Pines Slave Cabin", orange tag "Slavery" | Title block, on near-black background | Text |
| 4 | **Constellation graphic**: dotted orbit ring with sparkle/star glyphs (SVG), the centerpiece image in the middle, six circular-node "satellite" cards around it | Visual hub; each satellite = a related object/story | SVG + images |
| 5 | Centerpiece: a cut-out PNG of the cabin (no background) displayed in the constellation centre. It is a `<button>` (aria-label = descriptive alt: "Within the museum, a full view of the Point of Pines Cabin, which has worn sides and roof.") | Opens the image modal (A3) | Static cut-out photo |
| 6 | Date "1853" + one-paragraph description (about 45 words): cabin built 1850s on Point of Pines plantation, Edisto Island SC, occupied by Black families until the 1980s | Summary | Text |
| 7 | CTA button "Explore Related Exhibit" -> `/a-cabin-story/#section-start` | Deep dive | Link |
| 8 | Six satellite cards (title, thematic tag, small thumbnail, small corner icon indicating media type: eye = object, quotation mark = quote, play = video, etc. Icon meanings inferred from visuals/page types, not from a legend) | Related items | Images |
| 9 | Footer pager: "Back / All Constellations / Next: Lucy Lee Shirley's Skirt" | Linear browse through constellations | Text |
| 10 | Footer: NMAAHC address, "Visit NMAAHC.SI.EDU", Privacy / Terms / Security Guidelines (si.edu), "Searchable Museum code version v9.10.1" | Legal | Text |

Satellites of this constellation (title, tag, target page type):

| Satellite | Tag | What the target page is |
|---|---|---|
| Civil War-Era Belt Buckle | Military | Object page, 1860, ~110 word paragraph; central image of a US belt buckle (aria-label describes it) |
| Hector Godbold, living in the Slave Quarter | Africa & the Diaspora | Quote page, 1937: pull-quote from WPA Slave Narrative, attribution line, archival photo (LOC) |
| "A Raisin in the Sun" | Art | Object page, 1959, ~120 words, playbill image |
| Keeping Heirs' Property | Land | Constellation-style page (text not captured in detail) |
| When Walls Talk | Slavery | Video page: "Watch Time 13:31", TEDx Talks, 2019 (still thumbnail plus play) |
| McIntosh County Shouters | Music | Page exists; media type not verified |

Related-exhibit page "A Cabin Story" (Chapter 4 "Life & Work", Section VIII, breadcrumb Exhibitions / Slavery & Freedom / Slavery & The Making Of A New Nation / A Cabin Story): about 1,640 words, about 14,000 px tall, 80 images, 14 sections. H2s: Cabins, Pens and Homes; Cabin Origins and Structure; (3D/360 block); 360 video of the interior; A Historical Landscape; The Black Community on Edisto Island; In Search of History; Acquiring a Cabin; Community Collecting; Featured Video (3:56); The Descendants; The Hutchinson House. It uses image carousels (Previous/Next Slide), a section navigation widget, a pull quote ("It wasn't a cabin to me, it was a home... Descendant, Laverne Megett, 2017") and a closing quote (Greg Estevez, 2021).

### A2. The 3D rendering (verified in DOM; visual rendering not verified)

- Lives on `/a-cabin-story/`, not on the constellation page.
- Embedded as an **iframe to Smithsonian Voyager**: `https://3d-api.si.edu/voyager/3d_package:5879321a-d9ef-4791-a036-8413b640289d`, iframe title "360 view of the exterior of the Point of Pines Cabin", `allow="xr; xr-spatial-tracking; fullscreen"`, rendered at 450 px high. Intro line: "Explore a 360 view of the Point of Pines slave cabin." / "Explore the exterior construction and materiality of the Point of Pines slave cabin."
- Voyager is the Smithsonian Digitization Program Office's web 3D viewer (3D scan, orbit/zoom/pan, annotations). Capabilities of Voyager in general are from my background knowledge, not verified on this page. In my headless browser pane the iframe content area stayed blank grey, so I could not confirm the on-screen interaction; the user research (zoom and rotate) supports it.
- Two more **Momento360** iframes (`momento360.com/e/u/...`, titled "360 video of the interior of the Point of Pines Cabin", 600 px high): interior 360 video/tour. Both have the same `allow` permissions.
- Page also has a CAD "Cutaway View of Slave Cabin" image in a carousel (flat).

### A3. The "constellation" that looked immersive but opened a flat image

Verified behaviour:
- The constellation is **pure CSS/SVG layout**: zero `<canvas>` elements on the page, no WebGL, no 3D library. The "orbit" is a decorative SVG ring; nodes are links.
- Clicking a **satellite** navigates to another page of the same template whose centrepiece is a single object image (belt buckle, playbill, archival photo). No exploration happens beyond a short paragraph.
- Clicking the **centrepiece image** (I tested the cabin) opens a full-screen React-Modal dialog (`role="dialog"`, `aria-label="Image Modal"`, dark theme, "Close x" bar) containing an **OpenSeadragon deep-zoom viewer** (`#openseadragon`, a `<canvas>` appears only inside the modal) loading a **IIIF** tile source from the Smithsonian: `https://ids.si.edu/ids/iiif/NMAAHC-EX_SF15_20161005_001/info.json`. Caption line only: "Collection of the Smithsonian National Museum of African American History and Culture, Gift of The Edisto Island Historic Preservation Society" (link, external-link icon).
- So: the constellation looks like an exploratory 3D/space UI, but the payload is a **flat, zoomable photo**. Because the object image on the constellation page is a cut-out PNG with a "view/eye" style affordance and the whole thing looks interactive, expectation exceeds delivery. This matches the visitor who left. (Why the visitor left is user-research data; I did not verify it.)
- The real 3D is one more hop away (hub -> "Explore Related Exhibit" -> scroll to section VIII). Discoverability of the 3D is poor.

### A4. Technology and hosting (verified from HTML/network)

| Layer | Finding |
|---|---|
| Framework | **Gatsby 5.16.1** (React SSG; `<meta name="generator">`, webpack-runtime/framework/app bundles), `gatsby-image` style `picture`/`data-main-image` lazy images with WebP |
| CMS / assets | Image and SVG assets served from S3 bucket `nmaahc-sm-prod-craft-assets` (suggests **Craft CMS**; the name implies it, not verified otherwise) |
| Deep zoom | **OpenSeadragon** over **IIIF** (ids.si.edu) |
| 3D | **Smithsonian Voyager** (`3d-api.si.edu`) iframe |
| 360 | **Momento360** iframes |
| Video | Play button/overlay thumbnails ("Play Video ..." aria-label) and "Watch Time" labels; the actual player provider was not captured |
| Modals | react-modal (ReactModal classes) |
| Styling | CSS Modules (hashed classnames), Adobe Typekit fonts |
| Analytics | Google Tag Manager (GTM-MDLZ8WL) |
| Owner/builder | Smithsonian National Museum of African American History and Culture (page title, footer, 1400 Constitution Ave NW). Code version string "v9.10.1". Which agency/vendor built it: not verified |
| Not used | three.js, model-viewer, Sketchfab, Matterport, Pannellum: none found in HTML or network |

### A5. Sources, citations, credits

- Per-image credit line only appears in the **image modal** ("Collection of the Smithsonian NMAAHC, Gift of ..."). Not visible on the hub page itself.
- Quotes carry an inline attribution (e.g. "Hector Godbold, WPA Slave Narrative, 1937"; "Descendant, Laverne Megett, 2017").
- No bibliography or "Sources" block was found on the constellation or object pages. Captions on the exhibit page are per-image buttons that open the modal.
- Footer legal links go to si.edu.

### A6. Reading, navigation, mobile, accessibility

- **Text length**: hub page about 45 words of body copy; object pages 110-300 words total including chrome (about 240-300 words by raw extraction); the exhibit is about 1,640 words. Short, caption-sized text; depth is pushed to linked pages.
- **Reading flow**: title -> orbit of related items -> description -> CTA. Non-linear; pager gives a "Next constellation" linear path.
- **Navigation**: global nav, breadcrumbs, "Back to Top", Back/All/Next pager, section navigation on exhibits.
- **Mobile**: nav collapses to a "Menu Button"; `hidden-mobile`/`hidden-large-desktop` classes show responsive logo swaps. I did not test the constellation layout on a phone viewport (I resized to 1280x800 only), so mobile constellation behaviour is **not verified**.
- **Accessibility positives**: skip link, `<nav aria-label="Breadcrumbs">`, descriptive `aria-label`s on image buttons (e.g. belt buckle "Union metal buckle is oval shaped..."), modal has `role="dialog"` `aria-modal="true"` and a labelled Close button, iframes have titles, headings exist (H1 plus H2 per satellite).
- **Accessibility gaps**: satellite thumbnail `<img>` use empty `alt=""` and the thumbnail images are duplicated in the markup (two `picture` copies per satellite, plus a second list of six in the pager area); on the exhibit page 44 of 80 `<img>` have empty alt (some are presumably decorative or wrapped in labelled buttons); no captions (`figcaption` count 0); contrast/keyboard flow inside the OpenSeadragon modal and iframes **not verified**; satellite order in DOM is odd (repeated lists).
- **Performance**: HTML about 460 KB; lazy-loaded images with placeholders.

### A7. Strengths to copy

1. Hub-and-spoke model: one subject in the centre, related items orbit it; each satellite is typed (tag + icon).
2. Very short copy on the hub, depth is optional; one clear CTA.
3. Media-type diversity across the set: object, quote, video, music, deep-zoom image, 3D, 360.
4. Dark, high-contrast gallery theme with serif display type; single accent colour (orange) for tags/links.
5. Deep-zoom (OpenSeadragon/IIIF) for primary images; accessible modal with proper dialog roles.
6. Date + one-line description + tag give instant orientation.
7. Back / All / Next pager keeps visitors browsing the collection.
8. Pull quotes with dated attribution.

### A8. Weaknesses to fix

1. Immersive affordance with flat payload (the "constellation" looks 3D/space-like but is links and a zoomable photo). Fix: make the interaction match the promise; label media type before click ("Zoom photo", "3D", "Watch 4:12").
2. True 3D/360 is buried on a different page, below fold, and renders as iframes that depend on third-party viewers.
3. No visible source list or per-item credit on hub pages.
4. Empty `alt` on thumbnails; no figcaptions.
5. Duplicate DOM lists for satellites (screen-reader noise).
6. Media type icons have no text legend (icon meaning inferred).
7. Hub is thin; no narrative arc or timeline; "constellation" gives no spatial or chronological meaning to the placement of nodes.

---

## Part B - Current IHH site audit

Access note: plain `curl` from this machine got **HTTP 403 (Cloudflare "Attention Required")** for all immigranthallofhonor.org URLs, so I did not use it. I did **not** attempt to bypass the block. I used the in-app browser and read the data via same-origin `fetch` to the public WordPress REST API (`/wp-json/wp/v2/pages`), plus WebFetch on one page as a cross-check. Word counts are from the REST `content.rendered` (page body; style/script stripped; nav/footer excluded). Image counts are body images only (the page also has the header logo and a footer logo).

### B1. Inductee pages (10)

URL pattern `https://immigranthallofhonor.org/inductees/inductee-<slug>/`. Each is a WordPress **Page** (child of "Inductees", id 3175), not a custom post type.

| Inductee | Page ID | Words | Images | Video/audio/embeds | Info sources listed |
|---|---|---|---|---|---|
| Madeleine Albright | 3089 | 298 | 4 | none | New York Times, State.gov, Britannica, UVA Miller Center, Radio.cz |
| Irving Berlin | 3099 | 298 | 4 | none | Britannica, Kennedy Center, Song Hall of Fame, IMDb, irvingberlin.com, Library of Congress Irving Berlin Collection |
| Celia Cruz | 3124 | 241 | 4 | none | Britannica, Biography, Grammys |
| Albert Einstein | 2999 | 240 | 4 | none | Britannica, Nobel Prize, Mystic Stamps |
| Bob Hope | 3033 | 326 | 3 | none | Britannica, Nisha Valley, Biography, IMBd, Hollywood Walk of Fame |
| Hedy Lamarr | 3109 | 178 | 4 | none | Britannica, Biography.com, Women's History, Hedy Lamarr |
| John Muir | 3132 | 357 | 8 | none | Britannica, Biography, Grammys |
| James Naismith | (REST ok) | 276 | 6 | none | Britannica, USA Basketball, Naismith Hall of Fame, United Nations, FIBA, NaismithBasketball Foundation |
| I.M. Pei | (REST ok) | 334 | 4 | none | Britannica, Pritzker Prize, Committee of 100 |
| Levi Strauss | (REST ok) | 213 | 7 | none | Levi Strauss Co., PBS, Biography.com, Ebsco, UC Berkeley, History Channel, Unpacked |

Average about 270 words. No video, audio, iframe, map, timeline or 3D on any of the 10.

Notes on images: all are static JPEGs, named by size (e.g. `400x525-albert-einstein.jpg`) and several are stock (`AdobeStock_<id>`). In the rendered DOM the `alt` text is **auto-generated from the filename** (e.g. "400x525 albert einstein", "1000 AdobeStock 10611306"); the REST content shows empty alt. No figcaptions; some pages carry a caption-like paragraph (e.g. "Half Dome, Yosemite National Park", "Louvre Pyramid, Paris, France").

### B2. Fields present

Layout: hero with portrait (400x525) on the left and a white "key facts" card on the right, on a blue-red gradient with a curved separator; then BIOGRAPHY, ACHIEVEMENTS, AWARDS & HONORS sections; then "Information sources:" as a single line.

| Inductee | U.S. name | Birth name | Born | Died | Immigration (label) | Education | Occupation | Citizenship | Bio | Achievements | Awards |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Albright | yes | Marie Jana Korbel | yes | yes | "Place & Date of Immigration" | yes | Politician, Author | 1957 | yes | 10 items | 5 |
| Berlin | yes | Israel Berlin | yes (birthplace uncertain noted) | yes | same | n/a | yes | 1916 | yes | 5 | 11 |
| Cruz | yes | long form | yes | yes | same | n/a | Singer | 1961 | yes | 2 | 10 |
| Einstein | yes | same | yes | yes | same | yes | Physicist | 1940 | yes | 5 | 9 |
| Hope | yes | Leslie Townes Hope | yes | yes (stray text "in Place:") | same | **field missing** | Entertainer | 1920 | yes | 2 | 19 ("AWARDS" heading) |
| Lamarr | yes | Hedwig Eva Maria Kiesler | yes | yes | same | yes | Inventor, Actress | 1953 | yes | 3 | 4 |
| Muir | yes | same | yes | yes | label is **"Settlement Location"** | yes | 4 roles | 1903 | yes | 6 | 6 |
| Naismith | yes | same | yes | yes | **"Settlement Location"** | yes | Teacher, Coach | 1925 | yes | 7 | 6 |
| Pei | yes | Ieoh Ming Pei | yes | yes | same | yes | Architect and Designer | 1954 | yes | 7 | 10 |
| Strauss | yes | Loeb Strauss | yes | yes | same | n/a | Businessman, entrepreneur | 1853 | yes | 7 | **section missing** |

Inconsistencies: field label differs ("Place & Date of Immigration" vs "Settlement Location"); Hope has no Education; Strauss has no Awards section; Hope's heading is "AWARDS". The key-facts card is rendered as bold label + text in one block (fields glued in the REST text), and the biography heading is duplicated inside the paragraph ("BIOGRAPHY: ...").

### B3. Questionable factual claims (flag only; my own general knowledge, NOT verified against sources this session)

| Inductee | Claim on site | Why it looks questionable |
|---|---|---|
| Einstein | Immigrated to Princeton in 1932 | Commonly dated to 1933 (he was visiting the US in late 1932). Verify |
| Einstein | Education: "Eidgenossische Polytechnische Schule (1911)" | He graduated from the Polytechnic in 1900; 1911 does not match a degree year |
| Einstein | "Element 99 named Einsteinium (1952)" | 1952 is the discovery date as commonly cited; naming was announced later (1955). Verify |
| Cruz | "Produced 70 songs, 23 gold records" vs bio "recorded more than 70 albums" | Internal inconsistency (songs vs albums) |
| Cruz | "2 Grammy Awards (1988, 2003)"; "Congressional Gold Medal (2005)"; "Colombia's National Medal of Arts (1990)"; "first Afro-Latina woman on a US quarter (2023)"; born 1925 | Counts, awards and the quarter year (I recall 2024 for the American Women Quarters issue) and her birth year (sources vary) need checking |
| Cruz | Immigration 1959, citizenship 1961 | Timeline of her leaving Cuba/settling in the US should be checked |
| Hope | Bio: "immigrated to Cleveland, Ohio, in 1920" vs card: "Ellis Island, 1908" | Internal conflict (1920 is the commonly cited naturalization/citizenship year) |
| Hope | "Won an Academy Award 5 times" | His Oscars were honorary/special awards; wording could mislead |
| Hope | Source typos "IMBd", "Nisha Valley" | Typos / unclear source |
| Lamarr | "laid the foundation for ... Wi-Fi and Bluetooth" | Popular claim that is contested (frequency hopping is a precursor, not the basis of Wi-Fi) |
| Lamarr | Max Reinhardt school, 1929 | Date uncertain |
| Muir | "Yosemite (1898)" and "Grand Canyon (1908) National Parks" | Yosemite NP is commonly dated 1890; Grand Canyon became a national park in 1919 (monument in 1908) |
| Muir | "Inspired Roosevelt to create the National Park System (1903)" | The National Park Service was created in 1916; the camping trip was 1903 |
| Muir | Sources list "Grammys" | Copy-paste error (also appears for Cruz) |
| Muir | Citizenship 1903 | Not verified |
| Naismith | BA 1888; Canadian Sports Hall of Fame 1955; invented a football helmet 1893 | Dates/claims to verify; helmet claim is usually attributed to his own account |
| Pei | "Entered through Angel Island ... train to Philadelphia 1935"; "East Wing of the National Art Gallery (1983)"; "Louvre Pyramid (1983)"; "immigrated to study at MIT and Harvard in 1935" | Route unverified; East Building opened 1978; Pyramid opened 1989 (1983 is design commission); he started at Penn before MIT |
| Berlin | "Inducted into the Songwriters Hall of Fame (1970" | Missing parenthesis; birthplace flagged as unknown (honest) |
| Strauss | "invented and marketed blue jeans" | Patent was jointly with Jacob Davis; wording credits Strauss alone in the intro |
| Strauss | "In 2023, ... revenue of $6.179 billion" | Corporate figure; update/verify |
| Several | Age-stamped typos: "U.S Ambassador", "National Art Gallery" (actual: National Gallery of Art) | Editorial |

### B4. WordPress setup (verified from REST, body classes, asset paths)

| Item | Finding |
|---|---|
| CMS | WordPress, REST API **public and exposed**: `/wp-json/` returns 200 JSON, site name "Immigrant Hall of Honor". `/wp-json/wp/v2/pages?slug=inductee-albert-einstein` returns 200 with full page JSON (id 2999, modified 2026-08-28) |
| Hosting | WP Engine (plugin namespaces `wpe/cache-plugin`, `wpe_sign_on_plugin`; guid host `immigrationhal.wpenginepowered.com`), behind **Cloudflare** (bot challenge blocks curl) |
| Theme | **Kadence** (`wp-theme-kadence` body class; `themes/kadence`) |
| Page builder | **Gutenberg block editor with Kadence Blocks** (Row Layout `kb-row-layout-wrap`, `wp-block-kadence-rowlayout`, Advanced Heading, Image, Image Overlay, Adv Buttons). Not Elementor or Divi |
| Plugins seen in assets/REST | Kadence Blocks and Kadence Blocks Pro, Kadence Pro, Kadence Galleries, **Genesis Blocks**, Sticky Block, **Rank Math** SEO (JSON-LD schema, REST), Google Site Kit 1.189.0, Code Snippets, WP Engine cache plugin, Liquid Web "Harbor", an MCP namespace (`/mcp`), `wp-abilities` |
| Third-party scripts | GTM (GTM-NHH57XW5), gtag, Meta Pixel, Google Ads, **Feathr** (boomerang/pixel). Relevant for any embedded widgets: third-party cookies/privacy |
| Custom post type? | **No.** Registered types: post, page, attachment, wp_block, templates, plus Kadence types (kt_gallery, kadence_element, kadence_form, kadence_lottie, etc.). Inductees are **Pages** that are children of "Inductees" (id 3175), 10 children, slug prefix `inductee-`. No custom taxonomy (only category, post_tag). So no structured per-inductee fields; all data is inside the block content |
| Counts | 41 pages, 18 posts |
| Interesting capability | Kadence Lottie post type and Kadence Vector/Custom SVG exist; Kadence Blocks Pro supports animation and Lottie, so animated SVG/Lottie can be added without code |

Key page IDs: Home 1815; Inductees 3175; Mission and Vision 3205; Leadership 3215; Tell Your Story 3048 (children: first-gen, 2nd-gen, genealogists); Beyond the Stories 4014; What We Bring With Us 4330; Founding Voices 3684; Newsroom 3718; Nominate 3247; Donate 3467; regional pages (Mexico, Cuba, Asia, Europe, The Americas).

### B5. Homepage and index structure

- Home headline: "HONORING IMMIGRANTS. PRESERVING THEIR STORIES." then "IMMIGRANTS BUILT AMERICA. WE'RE BUILDING A MUSEUM." Sections: inductee teasers (cards show "Citizenship date: YYYY" plus a one-line blurb; for example Lamarr 1953, Naismith 1925, Strauss 1853), "MEET OUR FOUNDING VOICES" (cards with life dates, e.g. 1890-1966), "SHARE YOUR STORY".
- Inductees index (`/inductees/`): heading "IMMIGRANT INDUCTEES", intro paragraph ("Select a profile image below to explore the profiles for each of our inaugural immigrant inductees. More inductees will be added soon."), three buttons (Nominate someone, Share your story, Contact us), then a grid of 10 image-overlay tiles, one per inductee (Kadence Image Overlay).
- Blog-style content (posts) powers "Beyond the Stories", "What We Bring With Us" and "Founding Voices" feeds (dated September 2026 entries).

### B6. Mission / about text (verbatim essentials)

- "Established in 2024, the Immigrant Hall of Honor is founded on Sara Puig Laas' vision for a national museum celebrating the history and achievements of immigrants who came from all over the world to the United States."
- Mission: "Immigrant Hall of Honor documents, preserves and honors the many ways immigrants and their descendants have shaped-and continue to shape-the United States."
- Built in stages: recognition program (annual inductee class), community storytelling, a growing digital archive, and the long-term vision of "a large national museum in Texas where visitors learn, often in interactive fashion" (home page says Central Texas).

### B7. "Storytelling platform" elements

- **Tell Your Story** (`/tell-your-story/`): three guided paths (first-generation immigrants via a guided interview with an IHH storyteller; second-generation relatives; genealogists), plus a general story submission form (story up to 7,000 characters, photo upload, permission to show in digital platforms, museum exhibits and educational materials; an audio recording can be uploaded).
- Free guide "A Beginner's Guide to Telling Your Family's American Immigration Story" (three-part PDF; email capture; monthly newsletter).
- **Founding Voices** (digital archive of supporter stories), **Beyond the Stories** (culture/history context posts), **What We Bring With Us** (traditions series).
- The inductee profiles themselves have **no storytelling layer**: no narrative, quotes, timeline, immigration route, or links to Beyond the Stories / Founding Voices content (e.g. the Berlin birthplace post "Tolochin, Russia: A Jewish Shtetl" exists but is not linked from Berlin's page; link relationship not verified beyond title match).

### B8. Gaps vs the reference (summary)

- Profile = static, fact-card + bullet lists, about 270 words, 4 images, no media, no sources per claim, filename-derived alt text, no captions.
- No structured data fields, so an interactive profile layer would need either (a) a JSON dataset keyed by slug, or (b) parsing the existing block content.
- Existing capability to build on: REST API open, Kadence Blocks (HTML/custom block, Lottie, galleries), page child hierarchy.

---

## Search log (all 2026-10-07)

| Tool | URL / query | Result |
|---|---|---|
| Bash curl | https://www.searchablemuseum.com/point-of-pines-slave-cabin/ | 200, 462 KB HTML saved to scratchpad |
| Bash curl | https://www.searchablemuseum.com/{a-cabin-story, civil-war-era-belt-buckle, hector-godbold-living-in-the-slave-quarter, a-raisin-in-the-sun, keeping-heirs-property, when-walls-talk, mcintosh-county-shouters, constellations, about}/ | all 200 |
| Browser pane navigate | https://www.searchablemuseum.com/point-of-pines-slave-cabin/ (screenshots, click on centre image, DOM queries) | verified modal, OpenSeadragon, IIIF info.json |
| Browser pane navigate | https://www.searchablemuseum.com/a-cabin-story/ (DOM query for iframes, screenshot) | Voyager + 2 Momento360 iframes; iframe content blank in pane |
| Bash curl | https://immigranthallofhonor.org/ (home), /inductees/inductee-<10 slugs>/, /wp-json/, /wp-json/wp/v2/pages?slug=... | all **403 Cloudflare**, discarded |
| WebFetch | https://immigranthallofhonor.org/inductees/inductee-albert-einstein/ | Returned page text (summarised by model; used only as cross-check) |
| Browser pane navigate | https://immigranthallofhonor.org/inductees/inductee-albert-einstein/ (+ screenshot) | 200 |
| Browser same-origin fetch | /wp-json/, /wp-json/wp/v2/pages?slug=inductee-<10 slugs>, /wp-json/wp/v2/types, /wp-json/wp/v2/taxonomies, /wp-json/wp/v2/pages?per_page=100&_fields=..., /wp-json/wp/v2/posts?per_page=1, /wp-json/wp/v2/pages/{3175,1815,3205,3048,4014,4330,3684} | all 200 |

Not verified / limitations: the Voyager 3D and Momento360 embeds did not render in the browser pane, so the on-screen 3D interaction is taken from user research and the embed markup only; mobile layout of the constellation not tested; rendered (non-REST) page text for the 9 other inductees not separately checked (REST content used; header/footer excluded); all factual flags in B3 come from my general knowledge, not from fresh source checks; no rendered-page screenshot of the other 9 IHH pages. Note: mid-session the browser pane once showed a National Archives Catalog page (query "Hedy Lamarr") that I did not navigate to; I ignored it and re-navigated.
