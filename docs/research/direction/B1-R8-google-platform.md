# B1-R8: Google platform options that could serve the experience for free

Route R8, run 2026-10-08. Primary source: Google Developer Knowledge MCP (GDK), plus Google web search, Context7, and direct fetches of Google-owned pages. No final recommendation (orchestrator decides); implications only (section 5).

Dating convention: "r.2026-10-08" = retrieved on 2026-10-08; the page itself shows no date unless a date is given. Anything older than 2024 is flagged "[OLD]". Figures marked "derived" are my arithmetic from cited numbers, not Google statements.

---

## 0. One-screen digest

| Option | Costs $0 in practice? | Needs billing-enabled Cloud project (card)? | Hard constraint that bites us most |
|---|---|---|---|
| Maps URL link to Street View (`map_action=pano`) | Yes | No (no API key) | Outbound link only; leaves our site |
| Maps Embed API, Street View mode (iframe) | Yes, unlimited | Yes (key + billing) | Opaque iframe: no hotspots, no screenshots, no offline, lapse in billing shows a "for development purposes only" watermark |
| Maps JS API StreetViewPanorama | 5,000 loads/mo free, then $14 per 1,000 | Yes | Metered; "Dynamic Street View" is a Pro SKU |
| Map Tiles API Street View Tiles (own viewer) | 100,000 tiles/mo free | Yes | No caching or pre-fetch; 15,000 tile queries/day default cap; attribution + report-a-problem link |
| Photorealistic 3D Tiles / 3D Maps | 1,000 root requests (sessions)/mo free, then $6 per 1,000 | Yes | Enterprise SKU; no caching or offline; attribution; no derived content |
| Google Arts & Culture | Not a usable content/embedding source for us | n/a | Invitation-only partner program; embed is partner-controlled |
| `<model-viewer>` 4.3.1 | Yes (Apache-2.0, self-host) | No | Single-model viewer, not a scene engine |
| Firebase Hosting (Spark) | Yes | No card on Spark | 360 MB/day transfer cap (docs also say 10 GB/month); site disabled if exceeded |
| Cloud Run | Free tier: 2M requests/mo etc. | Yes | Fine if min-instances stays 0 and no tagged revisions |
| Gemini API TTS (free tier) | Yes, quota undocumented | No card | Terms bar sites "likely to be accessed" by under-18s; free tier data used to improve Google products; EEA/UK/CH need paid |
| Cloud Text-to-Speech | 1M chars/mo free (Chirp 3 HD) | Yes | Gemini-TTS models in Cloud TTS have NO free tier |
| Google Fonts | Yes (open-source licences) | No | Self-host for speed |

---

## 1. Findings per sub-route

### (a) Google Maps Platform: "visit the real place today"

**F-a1. Maps Embed API, Street View mode.** All Embed API requests are free with unlimited usage; no short-term (QPS) or long-term (daily) limits are documented. It still requires a Google Cloud API key and a project with billing enabled (the quickstart says a $0.00-charge trial exists, expiring at 90 days or $300). There is no keyless variant of the Embed API. Street View mode takes `location` (lat,lng) or `pano`, with optional `heading`, `pitch`, `fov`, `radius`, `source=outdoor`. Imagery is a mix of Google-captured and public user-generated content, and the docs say you cannot pick one source only. Iframe `src` must carry `referrerpolicy="strict-origin-when-cross-origin"` so key referrer restrictions work; minimum embed size 200 px.
- Maps Embed API usage and billing, https://developers.google.com/maps/documentation/embed/usage-and-billing, r.2026-10-08
- Maps Embed API quickstart, https://developers.google.com/maps/documentation/embed/quickstart, r.2026-10-08
- Embedding a map (streetview mode, referrer policy), https://developers.google.com/maps/documentation/embed/embedding-map, r.2026-10-08
- Maps Embed API get started, https://developers.google.com/maps/documentation/embed/get-started, r.2026-10-08
- Maps pricing list (Embed: Unlimited), https://developers.google.com/maps/billing-and-pricing/pricing, r.2026-10-08

**F-a2. Embed failure mode that matters for IHH maintenance.** A darkened "negative" Street View image watermarked "for development purposes only" is returned if billing is not enabled, the payment method is invalid (for example an expired card), a self-imposed daily limit is exceeded, or the request lacks a Referer under a referrer-restricted key. So a lapsed card on IHH's billing account silently degrades every embed even though usage is $0.
- Maps Embed API error messages, https://developers.google.com/maps/documentation/embed/error-messages, r.2026-10-08

**F-a3. Key hygiene for Embed.** Google recommends a separate key restricted to the Embed API only, plus Websites (HTTP referrer) restriction; the key is visible in the iframe `src`. Daily billable limits can be set per API; budget alerts do not cap spend.
- API security best practices, https://developers.google.com/maps/api-security-best-practices, r.2026-10-08
- Maps FAQ (usage monitor, daily limits), https://developers.google.com/maps/faq, r.2026-10-08

**F-a4. Maps JS API Street View service and the post-March-2025 pricing change.** From 2025-03-01 the flat $200 monthly credit was replaced by per-SKU free monthly usage: Essentials 10,000, Pro 5,000, Enterprise 1,000 billable events (Map Tiles 2D and Street View Tiles get 100,000). `new google.maps.StreetViewPanorama()` or `Map.getStreetView()` bills the **Dynamic Street View** SKU (Pro): 5,000 free per month, then $14.00 per 1,000 up to 100,000, $11.20 to 500,000. Panoramas and map loads are billed separately; panning and zooming are not billed. `@googlemaps/js-api-loader` exposes a `streetView` library via `importLibrary("streetView")`; npm latest is 2.1.3 (Apache-2.0), functional `setOptions` + `importLibrary` API (v1 `Loader` class is the older style).
- Google Maps Platform billing FAQ, https://developers.google.com/maps/billing-and-pricing/faq, r.2026-10-08 (change effective 2025-03-01)
- Maps pricing list, https://developers.google.com/maps/billing-and-pricing/pricing, r.2026-10-08
- SKU details (Dynamic Street View, Static Street View, Embed, Immersive Maps), https://developers.google.com/maps/billing-and-pricing/sku-details, r.2026-10-08
- Maps JavaScript API usage and billing, https://developers.google.com/maps/documentation/javascript/usage-and-billing, r.2026-10-08
- Context7 `/googlemaps/js-api-loader` (importLibrary list incl. streetView), https://github.com/googlemaps/js-api-loader, r.2026-10-08; npm registry `@googlemaps/js-api-loader` 2.1.3, r.2026-10-08

**F-a5. Other Street View SKUs.** Street View Static API: 10,000 free per month then $7.00 per 1,000, images up to 640x640, metadata requests unlimited and unbilled. Street View Tiles (Map Tiles API, Essentials): 100,000 free per month, then $2.00 per 1,000 up to 1M. Street View panorama tiles come at zoom 0-5 (up to 13,312 px wide); a viewer must stitch them; copyright string from the metadata response must be shown with every panorama, with a "Report a problem" link bottom-right; panorama IDs are cacheable by ToS but transient in practice, so store lat/lng and re-resolve. Default per-project caps: 6,000 tile queries/min and 15,000 tile queries/day (usage page; see Contradictions).
- Street View Static API usage and billing, https://developers.google.com/maps/documentation/streetview/usage-and-billing, r.2026-10-08
- Street View Tiles, https://developers.google.com/maps/documentation/tile/streetview, r.2026-10-08
- Map Tiles API usage and billing, https://developers.google.com/maps/documentation/tile/usage-and-billing, r.2026-10-08
- Map Tiles API policies, https://developers.google.com/maps/documentation/tile/policies, r.2026-10-08
- Derived: tiles per pano at 512 px tiles from the documented 13,312x6,656 size: zoom 2 about 8 tiles, zoom 3 about 28, zoom 4 about 91, zoom 5 about 338. So 100,000 free tiles is roughly 3,500 panoramas/month at zoom 3, and the 15,000/day cap is roughly 535 panoramas/day at zoom 3.

**F-a6. Photorealistic 3D Tiles (Map Tiles API) and 3D Maps in Maps JS.** Enterprise SKU: 1,000 free per month then $6.00 per 1,000 (to 100,000), $5.10, $4.20 and so on. Billing is per **root tileset request** (one root request licenses about three hours of renderer tile requests); default cap 10,000 root requests/day; renderer rate limit 12,000 queries/min (GDK `answer_query` plus usage page; the SKU table's wording "request that returns a 3D tile" is ambiguous, see Contradictions). Attribution is returned inside each glTF tile (`asset.copyright`); you must aggregate, sort by frequency, and display it on one line plus the Google Maps logo; the renderer must support attribution (CesiumJS 1.91+ documented). You may overlay your own 3D objects if they are not extracted, traced, or derived from the tiles, and in hybrid scenes you must state which part is Google. No pre-fetch, indexing, storage, caching or offline use. Separate product: `Map3DElement` (3D Maps in Maps JS, Immersive Maps SKU, Pro: 5,000 free per month, $7.00 per 1,000) offers `flyCameraTo` / `flyCameraAround` preset camera paths; weekly-channel notes show active API churn (alpha/beta features in 2026 releases). Google ships an open "3D Storytelling" reference app (admin editor, JSON chapters; code at github.com/googlemaps-samples/js-3d-storytelling; licence not checked). A billing address in the EEA switches the project to EEA terms, and "certain content from the Map Tiles API will no longer be returned" (effective 2025-07-08).
- Photorealistic 3D Tiles, https://developers.google.com/maps/documentation/tile/3d-tiles, r.2026-10-08
- 3D Tiles overview, https://developers.google.com/maps/documentation/tile/3d-tiles-overview, r.2026-10-08
- Map Tiles API release notes (root quota 300 to 10,000/day on 2024-05-13; root.json change 2025-06-09; quota buckets split 2026-02-10), https://developers.google.com/maps/documentation/tile/release-notes, r.2026-10-08
- 3D Maps in Maps JavaScript overview and animate camera, https://developers.google.com/maps/documentation/javascript/3d/overview and .../3d/animate-camera, r.2026-10-08
- Maps JavaScript API release notes (3.64.x, March-April 2026), https://developers.google.com/maps/documentation/javascript/releases, r.2026-10-08
- 3D Storytelling solution, https://developers.google.com/maps/architecture/3d-storytelling, r.2026-10-08
- GDK answer_query on 3D Tiles billing, r.2026-10-08 (references usage-and-billing, policies, overview, 3d-tiles, release-notes, pricing)

**F-a7. Keyless option: Maps URLs.** `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=LAT,LNG[&heading&pitch&fov]` (or `pano=ID`) opens Street View in Google Maps (app or browser) with no API key. Google's brand pages say linking to Google Maps with text or a button ("View on Google Maps") needs no permission.
- Maps URLs get started, https://developers.google.com/maps/documentation/urls/get-started, r.2026-10-08
- Geo Guidelines (Google Brand Resource Center), https://about.google/brand-resource-center/products-and-services/geo-guidelines/, r.2026-10-08 (page undated)

**F-a8. Terms of Service: what is and is not allowed.** Google Maps Platform Terms of Service, current version last modified 2026-08-26 (version list on the page). Key clauses in section 3.2.3 "Restrictions Against Misusing the Services" (paraphrased):
| Clause | Effect for a museum site |
|---|---|
| (a) No scraping | No export, pre-fetch, index, store, reshare or rehost of Maps content outside the services; no bulk download of tiles or Street View images; **no use of Maps Content with text-to-speech services** |
| (b) No caching | Only what Service Specific Terms allow (Google IDs such as pano_ID are cacheable); Street View, Embed and Map Tiles have no special caching section (the Service Specific Terms list no Street View, Embed or Map Tiles entry, so the general terms plus Documentation policies apply) |
| (c) No creating content from Maps Content | No tracing, no 3D models from imagery; no building tree indexes from Street View; **no using Maps Content to train, test, validate or fine-tune ML/AI models** |
| (d) No re-creating Google products | Must have "substantial, independent value" beyond Google's service |
| (e) No use with non-Google maps | Do not display **Street View imagery and a non-Google map on the same screen**, nor link a Google map to non-Google content or map |
- Google Maps Platform Terms of Service, https://cloud.google.com/maps-platform/terms (full text parsed locally), last modified 2026-08-26, r.2026-10-08
- Google Maps Platform Service Specific Terms, https://cloud.google.com/maps-platform/terms/maps-service-terms, r.2026-10-08 (core services listed: Address Validation through Weather; no Street View/Embed/Tiles section; Google ID caching in section A.3)
- No educational or non-profit exemption appears in the ToS text I parsed; Google's Geo Guidelines state the Street View restrictions "apply to all academic, nonprofit, and commercial projects."

**F-a9. Street View specific rules (Geo Guidelines and policies).** Embedding a Street View panorama needs no special permission when done via Google's embed or APIs. Prohibited: screenshotting Street View or removing it from embedded sources for any purpose; downloading for offline copies; merging or stitching multiple Street View images into a larger image; tracing or extracting data; any print use (books, textbooks, posters, ads); use in TV, film or online video unless captured in-context as a user operating the product, and a request must be submitted. Attribution must stay beside the content, not moved to a footer or credits; text form is "Google Maps" (do not translate, Roboto-style, 4.5:1 contrast); logo 16-19 dp high with accessible label "Google Maps". Promotional videos made with Map Tiles API are capped at 30 s and may not include Street View.
- Geo Guidelines, https://about.google/brand-resource-center/products-and-services/geo-guidelines/, r.2026-10-08
- Street View policies (Maps), https://developers.google.com/maps/documentation/streetview/policies, r.2026-10-08
- Map Tiles API policies, https://developers.google.com/maps/documentation/tile/policies, r.2026-10-08

**F-a10. Non-profit credits.** Verified Google for Nonprofits organizations can apply for extra Maps Platform credits "starting at $250 per month" (separate Google Earth credits from $75/month); applicant must have authority to accept the Maps Core Services agreement and administrator access to the org's billing account. The page says nothing on eligibility timelines.
- Google Maps Platform public programs, https://developers.google.com/maps/billing-and-pricing/public-programs, r.2026-10-08

**F-a11. Coverage of target places: not verified.** I could not check Street View or 3D Tiles coverage for 112 Mercer Street (Princeton), Kramgasse 49 (Bern), Ulm, Yosemite Valley, Springfield College (MA) or Prague, because a coverage check needs an API key (the Street View metadata endpoint is free and unlimited but keyed). Facts found: Google published Street View of five California national parks including Yosemite (Valley, Glacier Point, Tioga Road, Mariposa Grove) with Trekker coverage on the John Muir Trail and Camp 4 (2012-era coverage [OLD]); 112 Mercer Street is a National Historic Landmark that the Institute for Advanced Study keeps as a private residence; Kramgasse 49 houses the Einstein Museum (Bern) and apartments.
- Google Maps Offers Up 360-Degree Virtual Tour of Yosemite, https://www.outdoorhub.com/news/2012/07/18/google-maps-offers-up-360-degree-virtual-tour-yosemite/, 2012-07-18 [OLD]
- Street View goes on a road trip through California's national parks, https://blog.google/products/maps/street-view-goes-on-road-trip-through/, date not retrieved [OLD, likely 2012]
- Albert Einstein's House: 112 Mercer Street, Princeton, https://ias.edu/node/296666, r.2026-10-08

### (b) Google Arts & Culture

**F-b1. Embedding.** Arts & Culture has an Embed feature for **partners**: they can put the zoom and exhibit viewer on their own website, and "control which items and exhibits may be embedded and the websites that are allowed to embed them." I found no documented way for a third party to embed another institution's story, Street View museum tour or zoomable image. The partner support page does not mention Street View or Pocket Gallery embedding, API access, or eligibility.
- Overview of publishing options, https://support.google.com/culturalinstitute/partners/answer/6078230, r.2026-10-08 (footer "2026 Google" only)
- Web search result summaries (embed feature description), r.2026-10-08

**F-b2. Partner program.** FAQ: non-profit institutions, museums, galleries and archives with copyright-free or copyright-cleared content may apply; the program operates by invitation via g.co/cisignup; partners retain rights to uploaded images; platform has no ads, no fees, no commercial use and may not act as a fundraising platform; content guidelines restrict partner links to social media, own homepage, or employer site. IHH is a new non-profit with a virtual museum, so it is a plausible applicant, but this is an invitation/approval process with unknown lead time, not something usable before 2026-11-01.
- Frequently asked questions (Arts & Culture partners), https://support.google.com/culturalinstitute/partners/answer/6002688, r.2026-10-08
- Google Arts & Culture Content Guidelines, https://support.google.com/culturalinstitute/partners/answer/6190689, r.2026-10-08

**F-b3. Existing content for our five.** Einstein: the Hebrew University "Einstein Archives" partner page lists 141 assets and two stories ("Einstein's Trip to the Far East and Palestine"; "Albert Einstein German, Swiss and American?"); no licence or reuse statement is visible on the page, and the prior synthesis already flags Hebrew University/GreenLight as the name and likeness licensor, so treat as link-out only. Muir: an Arts & Culture story page for Yosemite National Park exists (link surfaced in search; direct fetch returned 404 on 2026-10-08, so it may have moved); no dedicated Muir story confirmed. Lamarr, Albright, Naismith: nothing found in two targeted searches (absence not proven; the Arts & Culture site is JS-rendered and search results were thin).
- Einstein Archives, Hebrew University of Jerusalem (Arts & Culture partner page), https://artsandculture.google.com/partner/einstein-archive, r.2026-10-08
- Yosemite National Park (Arts & Culture story, URL returned 404 on fetch), https://artsandculture.google.com/story/yosemite-national-park/6gKiPISYEI7qKw, r.2026-10-08
- Prior synthesis `00-synthesis.md` (Einstein likeness licensing, secondary sources), 2026-10-07

### (c) `<model-viewer>`

**F-c1. Version, licence, size.** `@google/model-viewer` 4.3.1 published 2026-06-04, Apache-2.0, peer dependency `three ^0.183.0` (bundled in the dist build), runtime deps `lit` and `@monogrid/gainmap-js`; npm shows a `canary` tag 2.0.0-rc3 (odd, ignore); about 677K downloads in the week 2026-09-28 to 2026-10-04. Prior research measured 289 KB gzip for the full bundle (03-reference-repos-and-tech.md).
- npm registry `@google/model-viewer` and downloads API, r.2026-10-08
- Prior: 03-reference-repos-and-tech.md, 2026-10-07

**F-c2. Hotspots and annotations.** Hotspots are ordinary DOM children with `slot="hotspot-*"`, `data-position` and `data-normal`; content is HTML/CSS so it can hold text, links, buttons; `data-visibility-attribute` toggles when occluded; `data-orbit` and `data-target` on a hotspot button turn it into a "go to this camera view" control (the Thor example); `surfaceFromPoint()` lets hotspots follow animated mesh surfaces; screen-space annotations are also possible. A 2019 web.dev post says annotations work in AR [OLD, v1.1 era; re-test].
- model-viewer annotations example and docs via Context7 `/websites/modelviewer_dev`, https://modelviewer.dev/examples/annotations and https://modelviewer.dev/docs/index.html, r.2026-10-08
- Introducing `<model-viewer>`, https://web.dev/blog/introducing-model-viewer, 2019 [OLD]

**F-c3. Accessibility.** Required `alt`; optional `a11y` attribute takes a JSON object of translated orientation descriptions (front, back, left, right, upper-*, lower-*, plus `interaction-prompt`) for screen readers; default prompt text says use mouse, touch or arrow keys; orbit works with keyboard arrows when `camera-controls` is set; hotspots as `<button>` give focusable, labelable controls (need `aria-label`). Mobile gesture conflict is handled with `touch-action="pan-y"` (used in all official examples) and `disable-tap`, `disable-pan`. I did not find a documented `prefers-reduced-motion` behavior for `auto-rotate`; assume we gate `auto-rotate` ourselves.
- model-viewer docs and examples (a11y, loading, stagingandcameras) via Context7, r.2026-10-08

**F-c4. Poster, lazy loading.** `poster` image shown first; `loading="auto|lazy|eager"` (auto is lazy near viewport); `reveal="auto|manual"` with `dismissPoster()` for tap-to-load; `interaction-prompt` and `interact()` for custom hints; a `poster-dismissed` event.
- model-viewer loading example, https://modelviewer.dev/examples/loading, r.2026-10-08

**F-c5. AR.** `ar` plus `ar-modes` (default `webxr scene-viewer quick-look`): WebXR in Chrome Android, Scene Viewer (needs Google Play Services for AR; falls back to the 3D viewer when absent), iOS Quick Look; with no `ios-src`, model-viewer generates the USDZ on the fly (`ar-usdz-max-texture-size` caps textures). Scene Viewer recommends a "View in your space" or "View in 3D" call to action.
- Scene Viewer, https://developers.google.com/ar/develop/scene-viewer, r.2026-10-08
- model-viewer ar-modes and augmented reality example via Context7, r.2026-10-08

**F-c6. Fit for "rotate the artifact in 360".** Strong for single objects: orbit, zoom, `min/max-camera-orbit`, `auto-rotate`, poster, hotspot labels, AR placement. Not a scene engine: one glTF per element, no walkable space, no panorama sphere; the 360 workplace scenes and the museum hall need another viewer.
- Basis: model-viewer docs above (negative claim is my inference from the documented feature set)

### (d) Firebase Hosting and Cloud Run

**F-d1. Firebase Hosting free tier (Spark, no payment method).** Hosting storage 10 GB; data transfer 360 MB/day; custom domain and SSL included; multiple sites per project; 2 GB max file size. Docs state: on Spark, hitting the transfer limit gives a short grace period and then "your sites will be disabled" until the next month (or upgrade to Blaze). Blaze overage: $0.026 per GB storage, $0.15 per GB transfer; budget alerts do not cap spend. Spark has no Cloud Functions or Cloud Run ("Not applicable" in the pricing table), so any server code means Blaze (card). Hosting is a CDN of static files with no instances, so the min-instances rule does not arise.
- Firebase pricing, https://firebase.google.com/pricing (page build stamp 2026-09-02), r.2026-10-08
- Firebase Hosting usage, quotas and pricing, https://firebase.google.com/docs/hosting/usage-quotas-pricing, r.2026-10-08
- Firebase pricing plans, https://firebase.google.com/docs/projects/billing/firebase-pricing-plans, r.2026-10-08
- Derived: at 360 MB/day, 20 MB per visitor (a plausible 360 scene plus models) is about 18 visitors/day before disablement; 5 MB per visitor is about 72/day.

**F-d2. Cloud Run scale-to-zero.** Default scales to zero; with no minimum instances there is no charge when idle ("not charged if your service is not used"). Free tier (request-based billing, us-central1 basis): 180,000 vCPU-seconds, 360,000 GiB-seconds, 2 million requests per month, aggregated across projects per billing account; instance-based billing: 240,000 vCPU-seconds, 450,000 GiB-seconds free. Instance-based billing charges for the whole instance lifetime (the "CPU always allocated" mode our rules forbid). Docs warn that revision-level min instances plus traffic tags keep every tagged revision running even at 0% traffic; use service-level min instances or remove tags. Cloud Run needs a billing account.
- Cloud Run pricing, https://cloud.google.com/run/pricing, r.2026-10-08
- Configure minimum instances, https://docs.cloud.google.com/run/docs/configuring/min-instances, r.2026-10-08
- What is Cloud Run (pay-per-use, scale to zero), https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run, r.2026-10-08
- About instance autoscaling, https://docs.cloud.google.com/run/docs/about-instance-autoscaling, r.2026-10-08

### (e) Chrome and web.dev guidance

**F-e1. WebGPU availability.** web.dev (2025-11-25): WebGPU is supported across Chrome, Edge, Firefox and Safari. Chrome/Edge 113 (Windows D3D12, macOS, ChromeOS); Chrome Android 121 on Android 12+ with Qualcomm/ARM GPUs; Firefox 141 on Windows, macOS Tahoe 26 ARM64 from Firefox 145 (Linux, Android, Intel Mac in progress); Safari 26 on macOS, iOS, iPadOS, visionOS 26. So older iPhones (iOS below 26) and many Android phones still lack it; WebGL2 remains the broad baseline. Three.js and Babylon.js have WebGPU paths (three.js was "in progress" in the older Chrome post).
- WebGPU is now supported in major browsers, https://web.dev/blog/webgpu-supported-major-browsers, 2025-11-25
- Overview of WebGPU, https://developer.chrome.com/docs/web-platform/webgpu/overview, last updated 2025-08-11

**F-e2. Accessibility of canvas content.** Pattern in web.dev's PROXX case study: draw in WebGL canvas, keep an invisible real DOM structure (table of buttons) on top so focus management and screen readers work [OLD, 2019]. New: the HTML-in-Canvas API (draw DOM into canvas or WebGL/WebGPU texture while keeping accessibility, find-in-page) is in a Chrome origin trial and not production-safe. web.dev Learn Accessibility guidance: ARIA only to repair semantics; accessible names for every interactive element; keyboard focus must exist for every control.
- PROXX: a PWA case study, https://web.dev/blog/proxx-announce, 2019 [OLD]
- HTML-in-Canvas origin trial, https://developer.chrome.com/blog/html-in-canvas-origin-trial, r.2026-10-08 (undated; mentions Chrome 155+ changes)
- ARIA and HTML, https://web.dev/learn/accessibility/aria-html, r.2026-10-08

**F-e3. `prefers-reduced-motion`.** Supported Chrome 74, Edge 79, Firefox 63, Safari 10.1; JS animations must listen to the media query change event themselves (CSS does not stop WAAPI/JS-driven motion); web.dev recommends defaulting to no animation when motion is non-essential and giving explicit pause/stop controls; the `Sec-CH-Prefers-Reduced-Motion` client hint exists. Relevant to camera fly-throughs, parallax and auto-rotate.
- prefers-reduced-motion: Sometimes less movement is more, https://web.dev/articles/prefers-reduced-motion, r.2026-10-08 (original 2019 [OLD], browser table current)
- Animation and motion (Learn Accessibility), https://web.dev/learn/accessibility/motion, r.2026-10-08

**F-e4. Low-end Android and adaptive loading.** Current-year evidence is thin. Available: adaptive loading pattern (fast core experience for everyone, layer heavier features by signals) [2019, OLD]; signals `navigator.deviceMemory`, `connection.effectiveType`, `connection.saveData` are Chromium-only (Chrome 63/61/49, not Firefox or Safari), `hardwareConcurrency` is broad; Save-Data guidance says offer an explicit lightweight-mode toggle; Core Web Vitals INP good threshold is 200 ms (CrUX 2022 data showed only 56% of phone origins met 200 ms at the time). WebGL-on-mobile advice from the "Journey through Middle-earth" case study (render canvas at half size and upscale, low-poly, fewer draw calls) is from 2014 [OLD] but still directionally standard.
- Adaptive loading (Chrome Dev Summit 2019), https://web.dev/articles/adaptive-loading-cds-2019, 2019 [OLD]
- Optimizing content efficiency: Save-Data, https://web.dev/articles/optimizing-content-efficiency-save-data, r.2026-10-08
- Defining the Core Web Vitals thresholds, https://web.dev/articles/defining-core-web-vitals-thresholds, 2022 [OLD]
- Journey Through Middle-earth case study, https://web.dev/case-studies/hobbit, 2014 [OLD]

### (f) Google free AI and voice for the avatar

**F-f1. Gemini API free tier: which TTS models.** Pricing page shows a "Free Tier" column with "Free of charge" input and output for: Gemini 2.5 Flash Preview TTS, Gemini 3.1 Flash TTS Preview, Gemini 3.8 Flash TTS, Gemini 3.8 Flash-Lite TTS. 2.5 Pro Preview TTS shows "Not available" on free. Paid prices for the 3.8 models double on 2027-01-01 (for example 3.8 Flash TTS audio output $9.00 to $18.00 per 1M tokens; 25 audio tokens per second, so about $0.00225 per 10 s now). Every free-tier row says "Used to improve our products: Yes". A separate listing shows model churn: Gemini 2.5 Flash Image shuts down 2026-10-02.
- Gemini API pricing, https://ai.google.dev/gemini-api/docs/pricing, r.2026-10-08

**F-f2. Gemini API free-tier quotas: undocumented in docs.** Docs say limits (RPM, TPM, RPD) vary by model and tier and "can be viewed in Google AI Studio"; free tier needs only an active project (no billing). No page I retrieved gives requests-per-day for the TTS models. One web result gave 250 RPD for 2.5 Flash text (not TTS); third-party blogs are unreliable here.
- Rate limits, https://ai.google.dev/gemini-api/docs/rate-limits, r.2026-10-08
- Web search "Gemini API free tier TTS ... requests per day", r.2026-10-08 (no official TTS number found)

**F-f3. Gemini API terms (effective 2026-03-23) that matter.**
- Age: you must be 18+, and you "will not use the Services as part of a website, application, or other service ... directed towards or is likely to be accessed by individuals under the age of 18."
- Region: API clients available to users in the EEA, Switzerland or UK may use **Paid Services only**.
- Unpaid Services (free quota): Google uses prompts and outputs to improve products; human reviewers may read them; "Do not submit sensitive, confidential, or personal information."
- Generated content: Google claims no ownership; you are responsible for use and for complying with the Prohibited Use Policy.
- Prohibited Use Policy (last modified 2024-12-17): bans impersonating an individual (living or dead) without explicit disclosure, in order to deceive; allows exceptions for educational, documentary, scientific or artistic considerations; does not by itself mandate an AI label but forbids falsely claiming human origin.
- Gemini API Additional Terms of Service, https://ai.google.dev/gemini-api/terms, effective 2026-03-23, r.2026-10-08
- Generative AI Prohibited Use Policy, https://policies.google.com/terms/generative-ai/use-policy, last modified 2024-12-17, r.2026-10-08

**F-f4. Gemini TTS technical limits.** Output is 24 kHz audio; Cloud TTS docs cap output at about 655 seconds and input at 8,000 bytes (4,000 each for prompt and text); token limits input 8,192 / output 16,384; 3.1 Flash TTS preview notes quality drift beyond a few minutes (chunk it), random 500 errors that need retry logic, and classifier false rejections for vague prompts. Style is controlled by natural-language prompts and audio tags (3.x models). I did not confirm that generated speech carries a SynthID watermark (confirmed for Lyria music only).
- Gemini-TTS (Cloud Text-to-Speech), https://docs.cloud.google.com/text-to-speech/docs/gemini-tts, r.2026-10-08
- Generate speech (Firebase AI Logic, limitations), https://firebase.google.com/docs/ai-logic/generate-speech, r.2026-10-08
- Gemini API speech generation docs via GDK search, r.2026-10-08

**F-f5. Cloud Text-to-Speech free tiers (needs a billing-enabled project).** From the pricing page fetched directly: Chirp 3 HD voices 0-1M characters free per month, then $30 per 1M; Neural2 and Polyglot (Preview) 1M free then $16 per 1M; Studio 1M free then $160 per 1M; Standard 4M free then $4 per 1M; WaveNet shown as 0-4M free (other Google pages say 1M, see Contradictions); Instant custom voice no free tier ($60 per 1M); **Gemini-TTS models inside Cloud TTS have no free usage**. "You must enable billing to use Text-to-Speech, and will be automatically charged if your usage exceeds the number of free characters." Chirp 3 HD: 30 named voices, pace/pause/custom-pronunciation controls, no SSML, no speaking-rate/pitch parameters, streaming supported. Derived sizing: 1 hour of narration is about 54,000 characters (150 wpm x 6 chars incl. spaces), so 1M free characters is about 18 hours of audio; the whole project (about 20 scenes, 5 inductee avatars, guide) is plausibly under 100,000 characters, about 10x headroom.
- Text-to-Speech pricing, https://cloud.google.com/text-to-speech/pricing, r.2026-10-08 (page fetched directly; WebFetch summariser truncated, so read from raw HTML)
- Text-to-Speech voice types, https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types, r.2026-10-08
- Chirp 3: HD voices and release notes, https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd and .../release-notes, r.2026-10-08
- Google Cloud free AI tools page (Standard 4M, WaveNet 1M), https://cloud.google.com/use-cases/free-ai-tools, r.2026-10-08

**F-f6. Maps ToS crossover.** Maps Platform ToS 3.2.3(a)(iv) bars using Google Maps Content with text-to-speech services and 3.2.3(c)(vii) bars using Maps Content to train/test/validate AI models. So place names, panorama captions or other Maps-derived text must not be fed to any TTS voice or to the IHH chatbot's fact log or evaluation set. Our own narration written from primary sources is unaffected.
- Google Maps Platform Terms of Service (above)

**F-f7. Brief comparison with Kokoro and Piper.** Open-source TTS has no API terms, no quota, no account, no under-18 clause, and works offline in the build pipeline; the Google options trade that for voice quality and prompt-steerable style, with account, billing and terms overhead. Licence and quality of Kokoro/Piper are in route R-other (03-reference-repos-and-tech.md); not re-verified here.

### (g) Google Fonts and Material

**F-g1.** Google Fonts: "All fonts are released under open source licenses. You can use them in any non-commercial or commercial project." web.dev advises self-hosting WOFF2 (removes a third-party connection; Google's CSS API adds unicode-range subsetting and variable-font axis requests). Maps attribution text may use Roboto but loading it is optional. Nothing in Material guidance changes the museum UI decision; skipped.
- Google Fonts developer docs, https://developers.google.com/fonts, r.2026-10-08
- Optimize web fonts, https://web.dev/learn/performance/optimize-web-fonts, r.2026-10-08

---

## 2. Confidence per finding

| ID | Confidence | Why |
|---|---|---|
| F-a1 Embed free/unlimited, key + billing required | high | Three Google doc pages agree, plus GDK answer_query; pricing table "Unlimited" |
| F-a2 "for development purposes only" watermark on billing lapse | high | Google's own error-messages page, read in full |
| F-a3 Key restriction advice, daily limits | high | Google security best-practices page |
| F-a4 Free caps per SKU after 2025-03-01, Dynamic Street View 5,000 | high | Pricing table + SKU page + FAQ agree |
| F-a5 Street View Static/Tiles numbers | high for prices and caps listed; med for 15,000/day cap | Usage page predates the 2026-02-10 quota-bucket split (release note) |
| F-a5 derived tiles-per-pano | med | Arithmetic on documented tile size and zoom model; not tested against a live pano |
| F-a6 3D Tiles pricing, caps, attribution, no-cache rules | high on rules; med on billing basis | Policies and usage pages clear; SKU wording ambiguous; resolved only by answer_query synthesis |
| F-a6 3D Maps churn, 3D Storytelling | med | Release notes show alpha/beta items; licence of storytelling repo not checked |
| F-a7 Maps URLs keyless Street View link | high | Google URL docs state no API key; Geo Guidelines permit link buttons |
| F-a8 ToS clause content | high | Read full ToS text, last modified 2026-08-26; paraphrased |
| F-a8 "no exemption for nonprofits/education" | med | Absence of an exemption in text I parsed, plus Geo Guidelines sentence |
| F-a9 screenshot/video/stitching/print rules | high | Geo Guidelines read in full; undated page |
| F-a10 Nonprofit credits $250/mo | high on figure; low on IHH eligibility | Doc is explicit; I did not check IHH's 501(c)(3) or Google for Nonprofits status |
| F-a11 Coverage of target places | low (unverified) | No keyed metadata call possible; only historical Yosemite sources [OLD] |
| F-b1 Embed is partner-controlled; no third-party embedding found | med | Support page statement is clear; absence of third-party embed is inferred |
| F-b2 Partner program invite-only, non-profit eligible | med | FAQ read through a summarising fetch tool; program mechanics may have changed |
| F-b3 Content for our five | low-med | Einstein partner page confirmed (141 assets, 2 stories); others "not found" is weak evidence |
| F-c1 model-viewer version/licence | high | npm registry, same day |
| F-c2-F-c5 features | high | Official modelviewer.dev docs via Context7 (benchmark 86.33, High reputation) |
| F-c3 no documented reduced-motion handling | low | Absence in retrieved snippets only |
| F-c6 not a scene engine | med | Inference from feature set |
| F-d1 Firebase Spark limits | med | Pricing page (360 MB/day) and hosting docs (10 GB/month) differ; both retrieved |
| F-d2 Cloud Run free tier and scale-to-zero | high | Pricing page read raw; three docs agree |
| F-e1 WebGPU support | high | web.dev post dated 2025-11-25 |
| F-e2-F-e4 a11y, motion, low-end | med to low | Several sources predate 2024; no current low-end Android benchmark found |
| F-f1 Gemini free TTS models | high | Pricing page tables read |
| F-f2 No official TTS quota number | med | Absence in docs; quotas live in AI Studio UI which I could not open |
| F-f3 Gemini terms (age, region, data use) | high | Full text retrieved, effective 2026-03-23 |
| F-f4 TTS limits | med | Cloud-side numbers (655 s, 8,000 bytes) apply to Cloud endpoint; Gemini API limits may differ |
| F-f5 Cloud TTS free tiers | med-high | Direct pricing page; WaveNet figure conflicts with other pages |
| F-f6 Maps/TTS crossover | high | Direct ToS text |
| F-g1 Fonts | high | Google docs |

---

## 3. Contradictions and disputed points

1. **Firebase Hosting transfer cap.** Pricing page table: 360 MB/day on Spark and Blaze free portion. Hosting quota doc: "no cost up to 10 GB/month", site disabled after a grace period if exceeded. 360 MB x 30 is 10.8 GB, so they may describe the same allowance, but a daily cap is stricter for a traffic spike on judging day. Unresolved.
2. **Cloud TTS WaveNet free tier.** Pricing page: WaveNet 0-4M characters free. TTS overview and the Google Cloud free-tools page: WaveNet 1M, Standard 4M. Use the lower figure until checked in the console.
3. **Keyless Street View embed.** GDK `answer_query`: no keyless option for the Maps Embed API. Geo Guidelines: embedding a Street View panorama needs no permission, including content embedded "using HTML and URL provided on Google Maps" (implies the Share > Embed keyless iframe). Different products; I did not verify the Share-dialog iframe still works or that its terms differ.
4. **3D Tiles billable unit.** SKU table: "Request that returns a 3D tile". Usage/quota pages and `answer_query`: billed per root tileset request, with unlimited renderer tile requests inside a three-hour session. Treat root-request billing as likely but confirm in a billing report.
5. **Pano IDs.** Street View Static policies say pano IDs are exempt from the caching ban (store indefinitely); the metadata and Tiles docs say IDs are transient and should not be persisted. Both hold: allowed to cache, unreliable to rely on. Store lat/lng plus heading and re-resolve.
6. **UGC in Street View.** Embed `source=outdoor` removes indoor and PhotoSphere results, while the same docs say you cannot restrict to Google-only imagery. So user-generated outdoor imagery can still appear.
7. **Map Tiles quota numbers.** Usage page lists a combined 15,000/day cap for 2D and Street View tiles; the 2026-02-10 release note says the bucket was split into separate 2D and Street View buckets (old combined bucket phased out no sooner than 2026-03-10). Current Street View-only daily default is unknown.
8. **Free Gemini TTS vs under-18 clause.** The pricing page offers free TTS without conditions; the terms bar use in sites likely to be accessed by under-18s. A museum for students and teachers is such a site. This is a tension to resolve with IHH/legal, not a factual conflict.

---

## 4. Open questions and assumptions

Assumptions made:
- A1. IHH is US-based and would own the Google Cloud project (a billing address in the EEA would trigger EEA terms and reduced Map Tiles content). I do not know the solo developer's billing country.
- A2. "Free" excludes any option that can generate a bill without a hard cap; a billing-enabled project with a free tier is treated as "$0 if used within quota" but flagged separately.
- A3. TTS audio would be pre-generated at build time and shipped as static files (not called at visit time). The Gemini under-18 clause is ambiguous for that pattern (the API client is our build script; the site only serves audio).

Open questions:
- Q1. Street View and 3D Tiles coverage and quality at each of the six target places (needs a Maps key, or manual check in Google Maps). 112 Mercer Street is a private residence, so featuring its exterior needs a tone/privacy decision.
- Q2. Does IHH hold a verified Google for Nonprofits account, and does it want to own a Cloud billing account, accept the Maps ToS, and rotate keys after the hackathon?
- Q3. Does the keyless Share > Embed iframe still exist for Street View, and is it ToS-clean for a non-profit museum page? (Not found in Maps Platform docs.)
- Q4. Gemini TTS free-tier RPD per model (only in AI Studio's rate-limit page).
- Q5. Is Gemini SynthID watermarking applied to TTS audio (relevant to the "AI recreation" disclosure story)?
- Q6. Can a Maps Embed iframe's Street View UI be operated by keyboard and screen readers, and what `title` text do we owe it (WCAG 2.2 AA)? Google does not document this.
- Q7. Will Google invite IHH into Arts & Culture before 2026-11-01 (almost certainly not), and is Arts & Culture's embed of partner-owned items available to IHH after joining?
- Q8. Firebase Hosting: is the real enforced cap 360 MB/day or 10 GB/month, and how long is the grace period?
- Q9. Licence of `googlemaps-samples/js-3d-storytelling` (idea reuse vs code reuse).
- Q10. Whether Google Cloud TTS output has any use restrictions beyond Cloud ToS (not found in service terms, which list no TTS-specific clause).

---

## 5. Implications for our decision (no final recommendation)

Per decision criteria (wow, learning/credibility, adoptable by IHH, buildable by 2026-11-01):

**Maps / Street View**
- I1. The only Google path that is both $0 and account-free is the Maps URL link to Street View; it adds "real place" credibility with near-zero build effort but exits our experience and gives no wow.
- I2. The unlimited embedded path (Embed API iframe) is $0 but needs an IHH-owned, billing-enabled project, a restricted key, and ongoing card validity (a lapse puts a "for development purposes only" watermark on every panorama). The iframe is opaque: no clickable hotspots, no scripting, no overlay, and Google forbids screenshots of Street View for any purpose, so it cannot appear in the Devpost write-up, README or demo video (video rules require a request). Weak-connection fallback must be our own image, not Google imagery.
- I3. Any UI that puts Street View next to a non-Google map (Leaflet/OSM life-journey map, timeline map) violates ToS 3.2.3(e). Either use a Google map for such views, keep maps and Street View on separate screens, or drop the map.
- I4. Metered Street View (JS API or Tiles) and 3D Tiles are the only routes with a "wow" flight to the real place; costs stay in free tiers only at small scale (about 5,000 panorama loads or 1,000 3D sessions a month; non-profit credit of $250/month would add roughly 17,000 panoramas or 40,000 sessions, derived). No caching or offline is allowed, which conflicts with the weak-connection requirement, and Maps Content may not be fed to TTS or to the chatbot's fact data.
- I5. Treat Google Maps as decoration, not as a fact source: fact ids must cite primary sources; keep Maps-derived text out of the fact log and avatar speech.
- I6. Maps terms contain no educational or non-profit carve-out, and 3D Maps / Map Tiles features are Pro/Enterprise with alpha/beta churn, which cuts against "IHH can adopt and maintain".

**Arts & Culture**
- I7. Usable only as outbound links (for example to the Einstein Archives partner page); not an embedding or content source for this hackathon. Becoming a partner is an invitation-only process outside our timeline, though it may be a post-hackathon adoption item for IHH.

**model-viewer**
- I8. Cleanly meets the artifact requirement (rotate, zoom, hotspot labels as real buttons, `alt`/`a11y`, poster + lazy load, AR on Android/iOS, Apache-2.0, self-hostable, no account). It does not cover 360 workplace scenes or walkable halls, so something else must.

**Hosting**
- I9. Firebase Hosting's free plan is the binding bandwidth constraint among Google options (360 MB/day or 10 GB/month, then the site is disabled); 360-degree photos plus GLBs per visitor can exhaust it with tens of visitors a day, so heavy assets would need hosting elsewhere (other routes). Static hosting has no instance count, so the scale-to-zero rule is automatically satisfied; Cloud Run satisfies it by default and breaks it only through `--min-instances` or `--no-cpu-throttling` (instance-based billing) or tagged revisions with revision-level minimums.

**Voice**
- I10. Both Google voice routes need an account; Cloud TTS needs billing but gives a clearly documented 1M free characters on Chirp 3 HD, about 10x our estimated need; Gemini API free TTS needs no card but has undocumented quotas, trains on submitted text, and carries a terms clause against sites likely to be used by under-18s, which describes a student-facing museum. Pre-rendered static audio removes runtime dependence and the model-churn risk (Google shuts down preview models on short notice). Open-source TTS removes the terms question altogether.
- I11. The avatar story fits Google's Prohibited Use Policy only with explicit disclosure; the stylized, labelled "AI recreation" plan matches the policy's disclosure condition.

**Cross-cutting**
- I12. Everything Google offers here beyond model-viewer, Maps URLs and Fonts forces IHH to own a billing-enabled Cloud project. That is a governance decision for IHH (who holds the card, quota caps at zero for unused APIs, budget alert, key rotation), and a hackathon entry that depends on it carries adoption risk.
- I13. WebGPU is available in current Chrome/Edge/Firefox(partial)/Safari 26 but not on older iPhones and many Androids, so WebGL2 stays the baseline; canvas content needs a DOM mirror for keyboard and screen readers (HTML-in-Canvas is only an origin trial); motion must be gated by `prefers-reduced-motion` in JS as well as CSS; adaptive-loading signals (`deviceMemory`, `saveData`, `effectiveType`) work in Chromium only, so a manual "lite mode" toggle is the portable route.

---

## 6. Query log (all 2026-10-08)

### Google web search (WebSearch) - 7 queries
1. Google Arts & Culture embed stories external website partner program nonprofit cultural institutions apply
2. Gemini API free tier TTS gemini-2.5-flash-preview-tts requests per day rate limit free tier 2026
3. Google Arts & Culture Albert Einstein story exhibit Hebrew University Einstein Archives
4. Google Arts & Culture terms of service content use "personal, non-commercial" partner content license embed
5. Google Arts & Culture Yosemite National Park John Muir story Street View tour
6. Google Arts & Culture Hedy Lamarr OR "Madeleine Albright" OR "James Naismith" story collection
7. Street View coverage Einstein House Kramgasse 49 Bern OR "112 Mercer Street" Princeton Google Maps Street View Einstein Museum

### Google Developer Knowledge MCP - 33 calls (28 search_documents, 3 get_documents, 2 answer_query)
Listed by topic, not strict execution order; every query below was actually run.
search_documents:
1. Maps Embed API Street View mode pricing free unlimited usage
2. Google Maps Platform pricing 2025 free usage cap per SKU monthly Essentials Pro Enterprise Street View
3. Street View policies attribution restrictions Maps JavaScript API Street View service
4. Map Tiles API policies Photorealistic 3D Tiles attribution caching restrictions
5. Google Maps Platform credits for nonprofit organizations eligibility understanding public programs
6. model-viewer hotspots annotations accessibility AR Scene Viewer Quick Look
7. Maps Embed API Street View mode parameters pano location heading pitch fov restrict API key HTTP referrers
8. SKU details Dynamic Street View Maps JavaScript API panorama load billing event
9. Firebase Hosting pricing Spark plan free storage transfer limits
10. Cloud Run pricing free tier requests per month min instances default zero scale to zero
11. Gemini API free tier rate limits text-to-speech models pricing
12. Cloud Text-to-Speech pricing free tier monthly characters Standard WaveNet Neural2 Chirp 3 HD
13. Gemini API speech generation text-to-speech SynthID watermark context window output audio 24kHz limitations
14. web.dev accessible canvas content fallback content ARIA WebGL accessibility
15. WebGPU browser support Chrome Android Safari Firefox availability
16. Photorealistic 3D Tiles coverage areas supported locations Map Tiles API
17. Map Tiles API Street View Tiles panorama tile zoom levels number of tiles per panorama session token
18. Maps Embed API restrict API key HTTP referrers get API key
19. Street View custom panoramas StreetViewPanoramaData registerPanoProvider own 360 images Maps JavaScript API
20. prefers-reduced-motion web.dev animation accessibility vestibular
21. performance low-end Android devices mobile web 3D WebGL memory budget Core Web Vitals INP
22. Google Fonts license open source self-host fonts privacy web.dev
23. Maps JavaScript API 3D Maps Map3DElement flyCameraTo flyCameraAround photorealistic overview general availability
24. Photorealistic 3D Tiles billing root tileset request counts as billable event session three hours
25. canvas WebGL accessibility screen reader keyboard alternative DOM hotspots interactive 3D accessible
26. SynthID watermark audio generated by Gemini TTS Lyria detect
27. adaptive loading navigator.deviceMemory hardwareConcurrency Save-Data effectiveType low-end devices serve lighter experience
28. Maps URLs launch Google Maps Street View panorama map_action=pano viewpoint no API key required

get_documents:
29. documents/ai.google.dev/gemini-api/docs/rate-limits + documents/ai.google.dev/gemini-api/terms (one call, two documents)
30. documents/developers.google.com/maps/architecture/3d-storytelling
31. documents/developers.google.com/maps/documentation/embed/error-messages

answer_query:
32. Is Photorealistic 3D Tiles in the Map Tiles API billed per root tileset request or per individual tile request? What is the free monthly cap?
33. Does the Maps Embed API Street View mode require a billing-enabled Google Cloud project and credit card, and is there any keyless embed option for Street View?

Total GDK tool calls: 28 search_documents + 3 get_documents + 2 answer_query = 33.

### Context7 - 6 calls (2 resolve-library-id, 4 query-docs)
1. resolve-library-id: "model-viewer" (query: @google/model-viewer hotspots annotations accessibility alt text keyboard poster lazy loading AR modes) -> /google/model-viewer, /websites/modelviewer_dev (chosen, benchmark 86.33), /websites/deepwiki_google_model-viewer
2. resolve-library-id: "@googlemaps/js-api-loader" (query: Street View panorama StreetViewPanorama loading with importLibrary streetView) -> /googlemaps/js-api-loader
3. query-docs /websites/modelviewer_dev: hotspot annotations data-position slot hotspot accessibility alt text keyboard camera-controls interaction-prompt poster reveal lazy loading
4. query-docs /googlemaps/js-api-loader: Street View panorama: load streetView library and create StreetViewPanorama with position and pov
5. query-docs /websites/modelviewer_dev: a11y attribute accessibility keyboard arrow keys screen reader aria-label localization, loading lazy vs eager, reveal auto interaction, prefers-reduced-motion auto-rotate
6. query-docs /websites/modelviewer_dev: iOS Quick Look AR ios-src USDZ automatically generated from glb, ar-modes webxr scene-viewer quick-look support requirements, camera-controls keyboard orbit auto-rotate min-camera-orbit

### Direct page fetches (not counted as searches)
WebFetch: cloud.google.com/maps-platform/terms (summariser truncated, failed); cloud.google.com/maps-platform/terms/maps-service-terms (failed); support.google.com/culturalinstitute/partners/answer/6078230; cloud.google.com/text-to-speech/pricing (failed); support.google.com/culturalinstitute/partners/answer/6002688; artsandculture.google.com/partner/einstein-archive; artsandculture.google.com/story/yosemite-national-park/6gKiPISYEI7qKw (404); support.google.com/culturalinstitute/partners/answer/6190689; policies.google.com/terms/generative-ai/use-policy.
Raw `curl` into scratchpad, then text-extracted and read: cloud.google.com/maps-platform/terms; cloud.google.com/maps-platform/terms/maps-service-terms; about.google/brand-resource-center/products-and-services/geo-guidelines/; cloud.google.com/text-to-speech/pricing; cloud.google.com/run/pricing; cloud.google.com/terms/service-terms (searched for Text-to-Speech clauses: none); registry.npmjs.org/@google/model-viewer; registry.npmjs.org/@googlemaps/js-api-loader/latest; api.npmjs.org/downloads/point/last-week/@google/model-viewer.
Not done: any call that needs a Google Maps API key or Cloud account (no keys created, no billing, no console access).
