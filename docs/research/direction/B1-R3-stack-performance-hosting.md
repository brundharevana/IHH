# B1-R3: Technology stack, performance, hosting, WordPress integration

Route R3. Researched 2026-10-08 (all dates below are real page or registry dates unless marked "retrieved"). No final recommendation is given; section 5 lists implications only.

How evidence was gathered: Google web search, Google Developer Knowledge MCP, Context7, plus direct reads of primary sources (npm registry JSON, caniuse data JSON from GitHub, WordPress core source on GitHub, the three.js manual source on GitHub, vendor docs pages) and three small measurements I ran myself (framework hello-world builds, decoder file sizes, DNS/headers of the IHH site). The WebFetch summarizer is a small model; where it disagreed with a primary file I trusted the primary file and say so.

Local measurement setup: macOS, Node 22.23.3 (installed locally through the `node` npm package because the machine default is Node 20.9.0, which cannot run Astro 7 or SvelteKit 3), Vite 8.3.4, gzip sizes as reported by Vite or `gzip -9`. No on-device (phone or Chromebook) testing was done. Scratch builds were deleted afterwards.

---

## 1. Findings per sub-route

### (a) App framework, 3D wrappers, parallel-agent fit

**a1. Current versions (npm registry, retrieved 2026-10-08).**

| Package | Latest | Published | License | Engine / peers |
|---|---|---|---|---|
| next | 16.4.0 | 2026-10-06 | MIT | Node >=20.9 |
| astro | 7.3.8 (7.4.0-beta.1 on `beta` tag) | 2026-10-08 | MIT | Node >=22.12 |
| @sveltejs/kit | 3.0.1 | 2026-10-06 | MIT | Node >=22.17 |
| vite | 8.3.4 | 2026-10-08 | MIT | Node ^20.19 or >=22.12 |
| three | 0.186.1 (r186.0 was 2026-09-08) | 2026-09-24 | MIT | n/a |
| @react-three/fiber | 9.8.1 (10.0.0-alpha.5 on `alpha`) | 2026-09-24 | MIT | React >=19 <19.4, three >=0.156 |
| @react-three/drei | 10.7.9 | (retrieved) | MIT | n/a |
| @threlte/core | 8.6.1 | 2026-09-24 | MIT | three >=0.172, svelte >=5 |
| @tresjs/core | 5.9.3 | 2026-10-06 | MIT | vue >=3.4, three >=0.133 |
| react | 19.3.0 | (retrieved) | MIT | n/a |
| @gltf-transform/cli | 4.5.1 | 2026-09-28 | MIT | n/a |
| @google/model-viewer | 4.3.1 | 2026-06-04 | Apache-2.0 | peer three ^0.183.0 |
| @photo-sphere-viewer/core | 5.15.1 | 2026-08-02 | MIT | n/a |
| pannellum | 2.5.7 | 2026-02-19 | MIT | n/a |
| workbox-build | 7.4.1 | 2026-05-04 | MIT | n/a |

Sources: registry.npmjs.org package documents (`latest`, `time`, `dist-tags`, `engines`, `peerDependencies`).

**a2. Static-export support.**
- Next.js: `output: 'export'` writes HTML/CSS/JS to `out/` and can be hosted on any static server (Next 16.2.9 docs via Context7, `static-exports.mdx`). Unsupported with export: dynamic routes with `dynamicParams: true` or without `generateStaticParams()`, Route Handlers that depend on Request, cookies, rewrites, redirects, headers, proxy, ISR, default-loader Image Optimization, Draft Mode, Server Actions, intercepting routes. `next/dynamic` with `ssr: false` is the documented way to keep a client-only component (a WebGL canvas) out of server render.
- Astro: default output is static (`output: 'static'` prerenders all pages). Client directives `client:load`, `client:idle`, `client:visible` (IntersectionObserver; JS not sent until the island scrolls into view), `client:only="<framework>"` (no server HTML). Except `client:only`, every island first renders to static HTML (Astro docs via Context7).
- SvelteKit: `adapter-static` prerenders everything; `export const prerender = true` in the root layout; `ssr` cannot be `false`; SPA fallback mode "has large negative performance and SEO impacts" (svelte.dev adapter-static docs, retrieved).
- Plain Vite SPA: no prerendered HTML without extra plugins (inference from how Vite builds; not separately tested).

**a3. Measured hello-world and 3D baselines (my builds, 2026-10-08, gzip).**

| Build | Result |
|---|---|
| Astro 7.3.8 static page, no island | 1 file, 134 bytes HTML, 0 bytes JS |
| SvelteKit 3.0.1 + adapter-static 4.0.0 hello page | about 32 KB gz JS total (largest chunks 14.6 KB and 12.5 KB gz) |
| Next 16.4.0 `output: 'export'` hello page (App Router, React 19.3) | 6 JS chunks, 569 KB raw, about 172 KB gz total |
| Vite 8 + three 0.186.1 `WebGLRenderer` + GLTFLoader + KTX2Loader + Meshopt decoder import, one box | 184.5 KB gz main chunk (696 KB raw); Basis transcoder 249 KB gz wasm + 57 KB JS loaded only on demand |
| Same, `three/webgpu` `WebGPURenderer` | 263.8 KB gz main chunk (937 KB raw): +79 KB gz (+43%) |
| Vite 8 + React 19.3 + R3F 9.8.1 + drei (`OrbitControls`, `useGLTF`) one chunk | 335 KB gz (1,219 KB raw) |
| Vite 8 + Svelte 5.57 + Threlte 8.6.1 + `@threlte/extras` (`OrbitControls` only) | 218.5 KB gz main chunk, and the build emitted Draco (89.7 KB + 64.1 KB gz wasm) and Basis decoders because the extras import was not fully tree-shaken |

Caveat: these are first-load numbers for a trivial scene on one machine. The comparison is directionally reliable (framework baseline: Astro < SvelteKit < Next; 3D wrapper baseline: vanilla three < Threlte < R3F). They do not include per-scene assets.

**a4. Version-specific breakages found while building.**
- SvelteKit 3: `svelte.config.js` is no longer read. The build aborts with `config_file_unsupported: svelte.config.js is no longer used. Please pass configuration via the sveltekit(...) plugin in your Vite config` (observed). Any older tutorial or agent habit that writes `svelte.config.js` will fail.
- Astro 7 (upgrade guide, retrieved): Vite 8, Rust compiler that errors on unclosed tags and no longer auto-corrects invalid nesting, Sätteri replaces remark/rehype by default, `@astrojs/db` removed, `src/fetch.ts` reserved, `compressHTML` default changed.
- Node floor: Astro 7 needs Node >=22.12 and SvelteKit 3 needs >=22.17; the machine's Node 20.9.0 cannot run them. Anyone at IHH who rebuilds the site needs Node 22+.
- PWA tooling lag (peerDependencies only, not run): `@vite-pwa/astro` 1.2.0 (2025-11-27) lists astro ^1 to ^5; `@vite-pwa/sveltekit` 1.1.0 (2025-11-27) lists kit ^1 or ^2. `vite-plugin-pwa` 2.0.0 (2026-10-03) lists Vite up to ^8. `@serwist/next` 9.5.13 (2026-10-04) lists next >=14.

**a5. Astro islands and navigation.** `<ClientRouter />` adds view transitions and automatically disables all transition animation (including the fallback) when `prefers-reduced-motion` is set. `transition:persist` on an island or element keeps its state across navigations (docs example uses a `<video>` and a counter island). Whether a WebGL canvas and its GL context survive a persisted island across client-side navigations was not verified.

**a6. R3F specifics (Context7, R3F docs).** `frameloop="demand"` plus `invalidate()` renders only on change; `PerformanceMonitor` with `onIncline/onDecline` adapts `dpr`; `performance={{ min: 0.5 }}` sets the regress floor. Canvas creates `WebGLRenderer` by default; `WebGPURenderer` is supported on 9.x through an async `gl` factory importing from `three/webgpu` plus `extend(THREE)`. v10 alpha (with drei v11 alpha) advertises first-class WebGPU and TSL hooks but is alpha (search snippets, Jan 2026 announcement; `10.0.0-alpha.5` on npm).

**a7. drei `useGLTF` default pulls a Draco decoder from Google's CDN.** Docs: "defaults to CDN loaded draco binaries (`https://www.gstatic.com/draco/v1/decoders/`)"; pass a local path or `useGLTF.setDecoderPath()` to self-host. Matters for offline use, CSP, and privacy.

**a8. File-per-scene mechanics for parallel agents.**
- Astro content collections: `glob()` loader maps one file to one entry (JSON, YAML, Markdown), Zod schema validates each entry, `getStaticPaths()` + `getCollection()` generates one page per entry (Astro docs via Context7). `file()` loader is the single-file alternative (a conflict magnet).
- Vite (used under Astro, SvelteKit, and plain Vite): `import.meta.glob('./scenes/*/index.ts')` is lazy by default and splits each matched file into its own chunk; `{ eager: true }` imports everything; negative globs supported (Vite 8.0.10 docs via Context7). This lets scene modules self-register with no central registry file.
- Next: `generateStaticParams` + `app/[inductee]/[scene]/page.tsx`. SvelteKit: `routes/[inductee]/[scene]/+page.svelte`.
- Likely conflict hot spots regardless of framework (reasoning, not tested): lockfile, barrel/registry files, shared type files, shared CSS. A scene contract (one module + one data file + assets folder per scene) with CI schema validation keeps edits disjoint.

**a9. i18n / a11y of frameworks.** Not evaluated beyond Astro's reduced-motion handling (a5) and its content-collection i18n recipe (folder-per-language with Zod schema). Route announcers in Next/SvelteKit were not verified this session.

### (b) Rendering: WebGPU status, WebGPURenderer, R3F

**b1. Browser support (caniuse data file from GitHub `Fyrd/caniuse` main, retrieved 2026-10-08).** Global: 85.72% full + 3.05% partial.
- Chrome/Edge: yes from 113 (Chrome 157 current). Chrome note: Linux support depends on hardware and drivers.
- Chrome Android: 154 listed as supported. web.dev (published 2025-11-25): Android support since Chrome 121 on Android 12+ with Qualcomm/ARM GPUs.
- Safari macOS: partial from 26.0 ("only enabled by default on macOS 26 Tahoe or later"). iOS Safari: supported from 26.0.
- Firefox: partial. caniuse flags it `a d` (partial, disabled by default) with the note "only enabled by default on Windows as well as macOS 26 Tahoe or later on Apple Silicon". Firefox Android: no.
- Samsung Internet: 24+.
- web.dev (François Beaufort, 2025-11-25): "officially supported across Chrome, Edge, Firefox, and Safari", Firefox 141 on Windows, Firefox 145 on macOS Tahoe ARM64, Safari 26 on macOS/iOS/iPadOS/visionOS, with "Support for Linux, Android, and Intel-based Macs is in progress" for Firefox.
- WebGL2 for comparison: 96.44% global, all current browsers (caniuse).

**b2. Chrome 146 WebGPU Compatibility Mode (Chrome blog, 2026-02-25, plus search snippet).** Opt in via `requestAdapter({ featureLevel: "compatibility" })` to run on OpenGL ES 3.1 devices. Stated rationale: 23% of Android users lack Vulkan 1.1 (15% lack Vulkan), ChromeOS Vulkan penetration is low while GLES 3.1 is ubiquitous. Whether three.js requests compatibility mode automatically was not verified.

**b3. iOS 26 adoption is disputed.** Apple's developer page (reported Feb 2026): 66% of all active iPhones on iOS 26, 74% of iPhones sold in the last four years. StatCounter (Jan 2026): about 15 to 16%. Reporting says the gap comes from iOS 26 browsers reporting frozen version numbers, so StatCounter undercounts. iOS Safari WebGPU requires iOS 26, so iOS 18 devices (20 to 24% by Apple's numbers) get WebGL2 only.

**b4. three.js `WebGPURenderer` (three.js manual source `manual/pages/webgpurenderer.html` on `dev`, retrieved 2026-10-08).**
- Auto fallback: "If a device/browser doesn't support WebGPU, the renderer can automatically fall back to using a WebGL 2 backend"; `forceWebGL: true` forces it (also confirmed in `WebGPURenderer.js` source: `getFallback` returns a `WebGLBackend` and logs a warning).
- Usage: `import * as THREE from 'three/webgpu'`; initialization is async: `setAnimationLoop()` handles it, otherwise `await renderer.init()`.
- Maturity statement, verbatim substance: "The renderer itself is still in an experimental state although its maturity level has been greatly improved in the last years. Still, depending on your application and scene setup, you will encounter missing features or a better performance with `WebGLRenderer`."
- Not supported: custom `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile` hacks (must be ported to node materials/TSL); `EffectComposer` (replaced by a node-based post stack).
- `WebGLRenderer` "is still maintained and the recommended choice for pure WebGL 2 applications"; "no plans to add larger new features to the renderer".
- Release cadence: r183 2026-02-18, r184 2026-04-16, r185 2026-06-25, r186 2026-09-08 (npm `time`). The WebFetch summary of the GitHub releases page printed 2024 dates and was wrong; the npm timestamps are authoritative.

**b5. Blog claims versus the manual.** Secondary blogs (utsubo.com, cinevva.com, others, 2026) say WebGPURenderer has been "production-ready since r171" with "zero-config" fallback and 30 to 50% gains on dense scenes. None of them is the three.js project; the project's own manual still says experimental (see section 3).

**b6. Chrome removed the software WebGL fallback.** Chrome 138 beta notes (developer.chrome.com): "Allowing automatic fallback to WebGL backed by the software renderer SwiftShader is deprecated and WebGL context creation will fail instead of falling back." Flag `--enable-unsafe-swiftshader` re-enables for developers. Consequence: on blocklisted GPUs (old school Chromebooks, locked-down VMs) `getContext('webgl2')` can return null where it used to return a slow software context, so a page must handle context-creation failure. (The exact Chrome version where removal completed was not confirmed.)

**b7. Adaptive-signal APIs are Chromium-only.** Network Information (`effectiveType`, `saveData`) and `navigator.deviceMemory`: Chrome and Edge only (web.dev adaptive loading and caniuse `netinfo`: Chrome partial, Safari and Firefox none). `hardwareConcurrency` is broad. `prefers-reduced-motion`: 96.45% (all current browsers).

### (c) Asset pipeline, budgets, loading, caching

**c1. glTF-Transform 4.5.1 CLI commands (Context7, gltf-transform.dev).** `draco` (edgebreaker), `meshopt` (`--level medium`; also compresses morph targets and animation), `uastc` and `etc1s` (KTX2 + Basis Universal), `webp`, `resize`, and `optimize` (a bundle with `--compress` and `--texture-compress`). Docs: `optimize` defaults "may not be ideal for all scenes".

**c2. KTX2 saves GPU memory more than download bytes (gltf-transform docs, `KHRTextureBasisu` and `EXTTextureWebP`).** KTX2 GPU textures "remain compressed in GPU memory", giving faster upload and lower memory, but "do not always result in smaller file sizes compared to PNG or JPEG". WebP/PNG/JPEG "are fully decompressed when uploaded to the GPU". Android developer docs: a 2048 x 2048 RGBA8888 texture uses 16 MB; ASTC 4x4 or ETC2 formats use 8 bits per pixel, a quarter of that.

**c3. Decoder weights measured from the three.js `examples/jsm/libs` files in the installed package (r186.1).**

| File | Raw | gzip |
|---|---|---|
| meshopt_decoder.module.js | 29.3 KB | 7.7 KB |
| draco_decoder.wasm (full) | 285.7 KB | 88.1 KB |
| draco gltf subset decoder.wasm | 192.4 KB | 63.2 KB |
| draco_wasm_wrapper.js | 58.8 KB | 11.8 KB |
| basis_transcoder.wasm | 527.3 KB | 248.9 KB |
| basis_transcoder.js | 57.5 KB | (not measured) |

Meshopt is the cheap decoder (about 8 KB gz); KTX2 needs the heaviest one (about 249 KB gz wasm), loaded once and cacheable.

**c4. Reference budgets from Google sources.**
- Google Store 3D case study (web.dev): models exported low-poly GLB, "maximum file size with textures of 2 MB, to support older generation devices and weak internet connections", viewed with `<model-viewer>`.
- Google Maps 3D best practices: keep complex `.glb` "under 5MB (ideally less)", Draco "often over 50%" reduction.
- web.dev performance-budget article (old, 2018 era; flagged as pre-2024): critical-path budget about 170 KB compressed for slow 3G on a Moto G4 (JS 100 KB), about 345 KB for slow 4G, about 750 KB for desktop WiFi; Lighthouse performance >= 85 as a rule-based budget.
- Core Web Vitals (web.dev, updated 2025-05-07): LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at the 75th percentile. LCP candidates are `<img>`, SVG `<image>`, `<video>` poster, CSS `url()` background images, and block text; a `<canvas>` is not a candidate, so the LCP element on a 3D page has to be an HTML poster or text.
- HTTP Archive Web Almanac 2025: median mobile page about 2.2 to 2.6 MB (sources differ), images about 40%.

**c5. Memory, computed (arithmetic from width x height x bytes per pixel; mipmaps add one third).**

| Texture | Uncompressed RGBA8 | With mips | ASTC 4x4 / BC7 (8 bpp) | ETC2 RGB (4 bpp) |
|---|---|---|---|---|
| 2048 x 2048 (artifact) | 16 MiB | 21.3 MiB | 4 MiB | 2 MiB |
| 4096 x 2048 (panorama) | 32 MiB | 42.7 MiB | 8 MiB | 4 MiB |
| 8192 x 4096 (panorama) | 128 MiB | 170.7 MiB | 32 MiB | 16 MiB |

Which GPU format three.js ends up with depends on what the device supports; with none, it falls back to uncompressed (not tested).

**c6. iOS memory ceiling.** Apple engineer on the developer forum (thread 133449, undated, 2020 era): the WKWebView memory limit "is not a set number. It depends on things like total device RAM, current system load, etc." and "It is not possible to increase the limit." Secondary sources (Unity forums, a blog) put older-iPhone tab kills at roughly 256 to 400 MB; that number is unofficial.

**c7. Panorama delivery.** Photo Sphere Viewer 5.15.1 `equirectangular-tiles-adapter`: a low-resolution base image shows immediately and tiles stream in by viewport; practical tile limit 1024 x 1024, maximum panorama 65,536 x 32,768; tile generation via ImageMagick or PineSplit. A cubemap-tiles adapter also exists (same version). Pannellum multires was covered in the earlier doc 03 (not re-verified).

**c8. `<model-viewer>` 4.3.1 behaviors (modelviewer.dev docs via Context7).** `loading="eager"` plus `poster`; `reveal="manual"` delays model load until `dismissPoster()`; `alt`; an `a11y` attribute with per-view text and an interaction prompt; `ar-modes` default `webxr scene-viewer quick-look`, and quick-look "will generate a USDZ on the fly". Its npm peer is three ^0.183.0 while the project would run 0.186.1: a possible second copy of three on the same page (not tested).

**c9. Service worker caching (Workbox via Google DK; web.dev).**
- Strategies: precache, CacheFirst, StaleWhileRevalidate, NetworkFirst; Workbox does not cache opaque (no-cors cross-origin) responses by default.
- Audio/video from cache needs `RangeRequestsPlugin`, a `crossorigin` attribute on the media element even for same-origin, and explicit pre-caching, because runtime caching of streamed media stores only partial 206 content.
- Safari applies a seven-day cap on all script-writable storage (IndexedDB, service worker registration, Cache API) after seven days of Safari use without user interaction with the site; this "does not apply to installed PWAs that have been added to the home screen" (web.dev storage-for-the-web, based on Safari 13.1, 2020). Chromium evicts least-recently-used origins under disk pressure; `navigator.storage.persist()` is auto-granted by heuristics in Chromium and prompts in Firefox.
- Storage partitioning (Chrome 115+): a cross-site iframe cannot see the storage it has when navigated to directly. Chrome keys the HTTP cache by top-level `scheme://eTLD+1` plus frame `scheme://eTLD+1`, so a subdomain of the embedding site is treated as the same site for those keys (web.dev HTTP cache partitioning post; applied to our case by inference).

### (d) No-WebGL / low-power / reduced-motion / screen-reader fallback

**d1. Pattern with evidence.** A three.js forum thread (2025-09-19 to 2025-10-08) converges on a parallel semantic DOM kept in sync with the canvas, ARIA on the canvas, and "inclusively hidden" CSS (not `display: none`, which removes accessibility-tree semantics). One participant's project rendered the same content in 3D and plain HTML from one source with Eleventy, degrading gracefully when JavaScript or hardware 3D is unavailable. The W3C XR Accessibility User Requirements note (2021-08-25, exploratory) asks for assistive-technology-readable object identification, same-input-method access to all UI, avoidance of motion triggers with alternatives, captions, and text descriptions of important audio.

**d2. Libraries.** `@react-three/a11y` 3.0.0 was last published 2022-05-15 (stale; MIT). `a3model` exists for three.js models (search result, not evaluated).

**d3. WCAG 2.2 hooks.** SC 2.2.2 (Level A): moving content that starts automatically, lasts more than five seconds, and is presented in parallel with other content needs a pause/stop/hide mechanism. Others relevant here: 1.1.1, 2.1.1, 4.1.2, 2.5.8 (target size) (search summary and prior doc 03).

**d4. Triggers the page can actually use.** WebGL2 absent (about 3.6% of users per caniuse); context creation failure (see b6); `prefers-reduced-motion` (96.45% support); `Save-Data`/`effectiveType`/`deviceMemory` (Chromium only); an explicit user toggle (needed because the signals are not universal).

**d5. Fullscreen.** The Fullscreen API on iOS Safari is partial: "supporting only iPad, not iPhone" (caniuse). An in-embed "fullscreen" button does nothing on iPhone, so the iframe case needs an "open full page" link.

### (e) Free hosting

**e1. Comparison (limits read from vendor pages on 2026-10-08).**

| Host | Relevant free limits | Terms that matter | Custom headers | Source (date) |
|---|---|---|---|---|
| Vercel Hobby | 100 GB Fast Data Transfer, 1M CDN requests, 100 deploys/day, 200 projects, 50 domains/project; exceeding limits means waiting 30 days | "Hobby teams are restricted to non-commercial personal use only." Commercial = financial gain of "anyone involved in any part of the production," including "a paid employee or consultant writing the code"; ads, payments, affiliate links count; "Asking for Donations does not fall under commercial usage." No nonprofit program found. | yes (vercel.json) | vercel.com/docs/limits/fair-use-guidelines and /docs/plans/hobby (both last_updated 2026-09-14) |
| Cloudflare Pages (Free) | 20,000 files per site, 25 MiB per file, 500 builds/month, 100 custom domains, 100 Pages projects; static asset requests free and unlimited | Pages remains supported but Cloudflare steers new projects to Workers static assets. CDN service-specific terms say "Paid Services (e.g., the Developer Platform, Images, and Stream)" must be used "to serve video and other large files via the CDN" (see section 3). | yes (`_headers`, 100 rules, 2,000 chars/line) | developers.cloudflare.com/pages/platform/limits (2026-09-05); /workers/static-assets/billing-and-limitations (2026-04-23); /workers/static-assets/headers |
| Cloudflare Workers static assets (Free) | 20,000 files, 25 MiB/file; Worker script invocations capped at 100,000/day (static asset requests are not Worker invocations) | Custom Domains need an active Cloudflare zone ("cannot create a Custom Domain on ... a zone you do not own") | yes (`_headers`) | developers.cloudflare.com/workers/platform/limits (2026-10-08) |
| Cloudflare R2 | 10 GB-month storage, 1M Class A + 10M Class B ops/month, egress free | `r2.dev` URLs "rate-limited and should only be used for development"; production needs a custom domain | n/a | developers.cloudflare.com/r2/pricing (2026-10-01); /r2/buckets/public-buckets |
| Netlify Free (credit plan) | 300 credits/month, hard limit; 20 credits per GB bandwidth, 15 credits per production deploy, 2 credits per 10,000 requests | "Once your credit balance is completely used up, all of your web projects ... are paused" with a "Site not available" page; Netlify Answers threads Jul to Aug 2026 report free-plan production deploys blocked despite remaining credits (credit-migration bug) | yes (`_headers`) | docs.netlify.com credit-based pricing and how-credits-work (undated); answers.netlify.com threads (2026-07/08) |
| GitHub Pages | Site <= 1 GB; soft limits 100 GB/month bandwidth and 10 builds/hour; deploy timeout 10 min | No e-commerce, SaaS, or sensitive transactions | no (search results; GitHub says "No ETA" on custom headers) | docs.github.com Pages limits (undated); community discussion 13309 |
| Firebase Hosting (Spark) | 10 GB storage; data transfer 10 GB/month in the quota doc and 360 MB/day on the pricing page; 2 GB max file | On Spark, past the limit "your sites will be disabled" after a grace period until next month; Blaze needs billing, $0.15 per extra GB, and "budget alerts do not cap your usage or charges" | yes (firebase.json) | firebase.google.com/docs/hosting/usage-quotas-pricing and /pricing (retrieved via Google DK 2026-10-08) |

**e2. Capacity arithmetic (assumption: one visit loads about 12.5 MB, e.g. shared engine 0.5 MB + one inductee's 4 scenes at about 3 MB; real value unmeasured).**

| Host | Monthly allowance | Approx. visits per month | Failure mode |
|---|---|---|---|
| Firebase Spark | 360 MB/day (about 10.8 GB/month) | about 28 visits/day | site disabled |
| Netlify Free | 300 credits = 15 GB if no deploys; each production deploy costs 15 credits (20 deploys use the whole month) | about 1,200 visits/month before any deploys | all projects paused |
| Vercel Hobby | 100 GB | about 8,000 | 30-day wait; terms question |
| GitHub Pages | 100 GB soft | about 8,000 | soft limit contact |
| Cloudflare Pages / Workers assets | no bandwidth cap stated for static assets | not capped by plan | terms question on large files |

**e3. IHH's actual setup (read-only checks, 2026-10-08).** `immigranthallofhonor.org` DNS is at GoDaddy (nameservers `ns41/ns42.domaincontrol.com`); the A records `141.193.213.10/11` belong to WP Engine (whois NetName WPENG); response headers show `server: cloudflare`, `x-powered-by: WP Engine`, `cache-control: max-age=600`, `cf-cache-status: HIT`, no `Content-Security-Policy` header, `link: <.../wp-json/>; rel="https://api.w.org/"`. The homepage HTML contained no Google Analytics/gtag/Cloudflare-beacon script by pattern match. So Cloudflare in front of IHH appears to be WP Engine's edge, not an IHH-owned Cloudflare account (inference). Consequence: hosting the showcase on a subdomain only needs a CNAME at GoDaddy.

**e4. DNS compatibility by host.** Cloudflare Pages: a subdomain on external DNS works with a CNAME to `<project>.pages.dev` after adding it in the dashboard (apex needs Cloudflare nameservers) (Cloudflare docs). Cloudflare Workers Custom Domains do not work with external DNS (docs: "An active Cloudflare zone" prerequisite). Vercel, Netlify, GitHub Pages, Firebase each support a CNAME subdomain (standard; not re-verified this session).

**e5. Scale to zero.** All options above are static CDN hosting with no instance floor, so the "never min-instances >= 1" rule is satisfied by construction. The billing-surprise exposure is Firebase Blaze (budget alerts do not cap). The oEmbed endpoint can be a static JSON file (see f3), so no function is required.

### (f) WordPress integration

**f1. Who can paste an iframe (WordPress core source, `wordpress-develop` trunk, retrieved 2026-10-08).** `schema.php` grants `unfiltered_html` to the Administrator and Editor roles (not Author, Contributor, Subscriber). `capabilities.php` maps `unfiltered_html` to `do_not_allow` for every user when `DISALLOW_UNFILTERED_HTML` is defined, and for everyone except Super Admin when `is_multisite()`. Users without the capability have `<iframe>` stripped on save. (A search-engine summary claimed the capability is "enabled for all users" on single sites; the source contradicts it.)

**f2. oEmbed discovery is on by default.** `class-wp-embed.php`: `$attr['discover'] = apply_filters( 'embed_oembed_discover', true );` ("The default value changed to true" in 4.4). The Gutenberg Embed block calls the REST proxy `/oembed/1.0/proxy` (permission: `edit_posts`) with `discover` defaulting to true. `WP_oEmbed::discover()` fetches the page with `wp_safe_remote_get`, truncated to 150 KB, looks in `<head>` for `<link rel="alternate" type="application/json+oembed">`, and then `fetch()` appends `maxwidth`, `maxheight`, `url`, `dnt=1` to the endpoint URL. A static JSON file per page would satisfy this (query arguments are ignored by a static host). oEmbed 1.0 `rich` responses need `html`, `width`, `height`.

**f3. What WordPress does to a discovered (not registered) provider's HTML.** `wp_filter_oembed_result()` (embed.php): for `rich` and `video` responses from providers not in WordPress's list, it runs `wp_kses` allowing only `<a href>`, `<blockquote>`, and `<iframe>` with attributes `src, width, height, frameborder, marginwidth, marginheight, scrolling, title`; appends a random secret to the iframe `src` as `#?secret=...` and `data-secret`; then forces `class="wp-embedded-content" sandbox="allow-scripts" security="restricted"`. For trusted providers (`get_provider($url, ['discover' => false])` finds a match) the HTML passes unmodified. `wp-embed.js` accepts `postMessage({message:'height', value, secret})` from the iframe and clamps the height to 200 to 1000 px; a `link` message navigates the top window only to the same host and only when the iframe has focus.

Derived consequences for a discovered embed (reasoning from the sandbox flags; not tested in a browser): no `allow-same-origin` means an opaque origin, so `localStorage`, `IndexedDB`, `caches`/service worker registration, and cookies are unavailable inside the frame; `fetch` of GLB/textures from the showcase host needs CORS headers (`Access-Control-Allow-Origin`); no `allow="fullscreen"`/`loading="lazy"` because those attributes are stripped; height capped at 1000 px.

**f4. Registered/handled embeds give full control but need IHH-side PHP.** `wp_oembed_add_provider( $format, $provider, $regex )` registers a trusted provider (HTML then passes unmodified), but it expects an endpoint that honors `?url=`; a purely static host can serve only one fixed JSON per endpoint. `wp_embed_register_handler( $id, $regex, $callback, $priority )` maps a URL regex to a PHP callback that returns the iframe HTML directly (no remote endpoint); the REST proxy falls back to embed handlers when oEmbed returns nothing (class-wp-oembed-controller.php), so the editor preview works. Either requires adding code to IHH's site (mu-plugin, theme `functions.php`, or a snippets plugin); WP Engine plugin policy for IHH's plan was not checked.

**f5. Responsive height.** Chrome 154 (web.dev, 2026-09-16) adds `frame-sizing: content-height` on the iframe and `<meta name="responsive-embedded-sizing" content="allow-origins=...">` in the embedded document, with `window.requestResize()`; support shown is Chromium only (Firefox and Safari "x"). Other browsers need the `postMessage` pattern (WordPress's own secret-based protocol is one).

**f6. SEO of iframes (Google SEO office hours, Dec 2023, so older than 2024).** Google "would try to associate the sub-page's content as a part of the primary page for indexing, but it's not guaranteed"; `noindex` plus `indexifembedded` makes a sub-page index only when embedded; `X-Frame-Options` prevents embedding. Google's Event rich result requires events at a physical location, bookable by the public, with a unique URL; historic life events do not fit (Google Search docs via DK). The showcase's own URLs (statically rendered pages with real text and JSON-LD) are the reliable thing to index.

**f7. Existing REST surface.** IHH exposes `/wp-json/` and inductee pages as plain Pages (prior research). IHH's current homepage sets no CSP header, so a `frame-src` restriction on their side is not present today.

### (g) Privacy-friendly analytics

| Option | Cost / limit | Storage and consent claims | Self-host or hosted | Fit with static/scale-to-zero |
|---|---|---|---|---|
| Cloudflare Web Analytics | Free ("available on all plans"), no DNS change or proxy needed; 6 months of data, raw beacon data 7 days then aggregated to about 10%; soft limit 10 sites; no custom events yet | Cloudflare blog (2020-09-29): no cookies/localStorage "for the purposes of tracking users", no fingerprinting | hosted | script from Cloudflare; no server to run |
| Umami Cloud Hobby | $0, 100K events/month, 1 website, 6 months retention; Pro $20/month | MIT software; cookieless design (vendor/third-party claims) | hosted or self-host | self-host needs server + database |
| GoatCounter | hosted "currently offered for free for reasonable public usage"; personal and small-to-medium business sites OK; EUPL source | "doesn't need a GDPR consent notice" (project statement); non-identifiable hash visits | hosted or self-host | hosted needs nothing |
| Plausible | Cloud is paid (no free plan found); Community Edition AGPL-3.0, minimum 2 vCPU, 2 GB RAM, Postgres 12+ and ClickHouse 23.3+ | cookieless | self-host or paid cloud | self-host conflicts with static-only and scale-to-zero |
| Vercel Web Analytics (Hobby) | 50,000 events/month, 1 month of data | n/a | only if hosted on Vercel | tied to Vercel |

COPPA/GDPR notes (not legal advice): the amended COPPA Rule was finalized by the FTC in January 2025 and the compliance date is April 22, 2026 (law-firm summaries; FTC FAQ says amended 2025-04-22). Persistent identifiers collected solely for "support for the internal operations" can skip parental consent, but under the amended rule notice is still required and must name the internal operations and how identifiers are not used to profile or contact; analytics that profile behavior fall outside the exception. Child-directed sites must treat all visitors as children; general-audience sites with actual knowledge are covered. The FTC fetches did not return text on whether schools can consent for parents (this was not resolved). Vendor "no consent needed" statements are marketing-side claims; IHH should confirm with counsel for a student-facing audience.

---

## 2. Per-finding confidence

| ID | Confidence | Why |
|---|---|---|
| a1 versions | high | Read directly from the npm registry the same day. |
| a2 static export | high (Next, Astro, SvelteKit) / med (Vite SPA) | Official docs via Context7 and svelte.dev; Vite SPA claim is inference. |
| a3 measured sizes | med | Real builds, but one machine, trivial scene, and tree-shaking behavior varies (Threlte extras). Ordering is reliable, absolute numbers are not. |
| a4 breakages | high (observed errors, engines fields) / med (PWA peer ranges: not run) | SvelteKit config error observed; Node floors from registry; PWA lag is from peerDependencies only. |
| a5 Astro transitions | med | Docs verified; canvas persistence untested. |
| a6 R3F | high | R3F docs via Context7; v10 alpha status from npm tags plus search snippets (med). |
| a7 drei CDN default | high | drei docs state it explicitly. |
| a8 file-per-scene | med | Mechanisms are documented; merge-conflict behavior in practice is reasoning, not tested. |
| b1 WebGPU support | high | caniuse data file plus web.dev; Firefox state is genuinely contested (section 3). |
| b2 compat mode | med | Chrome blog and search snippets; three.js interplay unknown. |
| b3 iOS 26 share | low | Two sources disagree by 4x. |
| b4 WebGPURenderer | high | three.js manual source on `dev` and renderer source. |
| b5 blog claims | n/a | Listed to show the disagreement. |
| b6 SwiftShader | med | Chrome 138 beta note is official; final removal version unconfirmed. |
| b7 Chromium-only APIs | high | caniuse and web.dev agree. |
| c1/c2 gltf-transform | high | Project docs. |
| c3 decoder sizes | high | Measured files. |
| c4 reference budgets | med | Google sources are real but the web.dev budget article is old and device-class assumptions have drifted; Store and Maps figures are guidance, not hard limits. |
| c5 memory table | high for arithmetic, med for device behavior | Pure arithmetic; real GPU behavior (format availability, driver padding) untested. |
| c6 iOS ceiling | med (Apple statement) / low (numeric figures) | Apple statement is a forum post and about 2020; the 256 to 400 MB figures are unofficial. |
| c7 PSV tiles | high | PSV docs. |
| c8 model-viewer | high (attributes) / low (duplicate-three risk) | Attributes from docs; duplication is a peer-range inference. |
| c9 service worker | med | Workbox/web.dev are official but several pages date from 2020; Safari 7-day cap currently assumed unchanged. |
| d1 to d5 fallbacks | med | Pattern is consensus-based (forum, W3C note); no site measured. |
| e1 limits | high for Vercel, Cloudflare, Netlify, R2, GitHub (pages read in full) / med for Firebase (two pages disagree) | Dates 2026-04 to 2026-10 shown; Firebase docs versus pricing page differ in unit. |
| e2 capacity | low | Depends on an assumed 12.5 MB per visit. |
| e3 IHH setup | high for headers/DNS/whois facts, med for "no IHH Cloudflare account" | The inference about account ownership is unconfirmed. |
| e4 DNS compatibility | high (Cloudflare) / med (others) | Cloudflare docs read; others standard practice. |
| f1 unfiltered_html | high | Read from core source. |
| f2 to f4 oEmbed | high for code behavior, med for effects in a real browser | Source read; no WordPress instance was run. |
| f5 responsive iframes | high | Chrome blog 2026-09-16; Chromium-only. |
| f6 SEO | med | Google statement is from Dec 2023 and explicitly non-binding. |
| g analytics | med | Vendor pages and search summaries; Cloudflare privacy claim dates from 2020; legal conclusions unverified. |

---

## 3. Contradictions and disputed points

1. **WebGPURenderer maturity.** three.js manual (current `dev`): "still in an experimental state" and may show "missing features or a better performance with WebGLRenderer". Secondary blogs (2026): "production-ready" since r171. The project's own statement is the primary source; the blogs describe it as ready for the cases they tried.
2. **"Supported in all major browsers" versus caniuse.** web.dev (2025-11-25) says WebGPU is officially supported in Chrome, Edge, Firefox, and Safari. caniuse (2026-10-08) shows Safari macOS and Firefox as partial, Firefox flagged disabled by default in some builds, Firefox Android and Linux not enabled. Both describe the same facts at different granularity: the API ships, but not on every OS/CPU/browser combination.
3. **iOS 26 adoption.** Apple 66% (all active iPhones, Feb 2026) versus StatCounter about 15% (Jan 2026); reporting attributes the gap to frozen UA version strings. Unresolved.
4. **Vercel Hobby and nonprofits.** Official text: Hobby is "non-commercial personal use only" and "commercial" includes anyone paid to write or update the code; donations are allowed. A community post and several blog summaries say nonprofit projects are "the perfect use case". I could not retrieve an official nonprofit statement. Whether an IHH-owned project maintained by paid IHH staff, or a project built by a hackathon entrant who might win a prize, counts as commercial is not answerable from the text; Vercel says to contact support.
5. **Cloudflare large-file terms.** The self-serve agreement fetch did not contain the old "disproportionate percentage" clause, but the CDN service-specific terms say non-Enterprise customers must use "Paid Services (e.g., the Developer Platform, Images, and Stream)" to serve "video and other large files via the CDN". Pages and R2 free tiers belong to the Developer Platform, but whether "Paid Services" excludes the free tier of those products is ambiguous. The Workers static-asset page says requests are "free and unlimited" and R2 markets free egress.
6. **Firebase free quota unit.** Quota doc: 10 GB/month. Pricing page: 360 MB/day (about the same per month, but a daily cap blocks traffic spikes).
7. **`unfiltered_html` on single sites.** A search summary said it is enabled for all users; WordPress source grants it to Administrator and Editor only.
8. **Cloudflare Pages versus Workers.** Search summaries say Workers static assets is the successor to Pages; the Pages docs are still current (limits page updated 2026-09-05) and, unlike Workers Custom Domains, Pages accepts a CNAME subdomain on external DNS.
9. **Tool unreliability.** The WebFetch summary of the three.js GitHub releases page printed 2024 dates for r182 to r186; npm timestamps show 2025-12-10 to 2026-09-08. WebFetch summaries of the FTC pages omitted the analytics text that a law-firm source reports.

---

## 4. Open questions and assumptions

Assumptions made:
- Each inductee's visit loads about 4 scenes at about 3 MB each plus about 0.5 MB shared engine (used only for capacity arithmetic).
- "Mid-range phone" means a 4 to 6 GB Android or an iPhone 12 or newer; "school Chromebook" means 4 GB RAM and an entry-level MediaTek or Intel Celeron SoC at 1366 x 768. The Chromebook spec comes from retail listings (Lenovo 100e Gen 4 MediaTek 520/540, 4 GB, 32 to 64 GB, 11.6-inch 1366 x 768); no authoritative education spec sheet was retrieved.
- The A record plus whois evidence means IHH's Cloudflare layer is WP Engine's, not IHH's own account.

Open questions:
1. Does IHH's WP Engine plan allow IHH staff to add a must-use plugin or snippet (needed for registered providers or embed handlers), and which role do their editors have?
2. Does the oEmbed discovery path actually work end to end on IHH (WP Engine page cache, security plugins, Cloudflare bot rules blocking the server-to-server fetch of the showcase host)? Needs a test post or a local WordPress.
3. Does three.js `WebGPURenderer` request WebGPU compatibility mode, and does its WebGL2 fallback backend match `WebGLRenderer` performance on a low-end Android phone and a Celeron Chromebook? Needs on-device tests.
4. How many scenes can be held resident on an iPhone before WebContent is killed (needs a device test; Apple gives no number)?
5. Does an Astro island with a WebGL canvas survive `<ClientRouter />` navigation with `transition:persist` (guide avatar audio continuity)?
6. Are Cloudflare's CDN "Paid Services" terms satisfied by Pages Free or R2 Free for a site whose bytes are mostly GLB/JPEG (ask Cloudflare support, or choose a host with no such clause)?
7. Does Vercel treat a hackathon entry by an individual, later adopted by a nonprofit with paid staff, as "commercial"? (Vercel support.)
8. Which Chrome version completed the SwiftShader removal, and does it affect Chrome on ChromeOS equally?
9. Does Safari still apply the 7-day cap (2020 policy) in iOS 26 for service-worker caches of non-installed sites?
10. Who maintains the code after the hackathon? Node 22 toolchain and PWA-plugin gaps raise the maintenance bar for Astro 7 and SvelteKit 3 versus a prebuilt static folder.
11. Is Cloudflare Web Analytics's beacon allowed inside a `sandbox="allow-scripts"` iframe, and does it work without storage there?
12. Not covered: Next/SvelteKit route-announcer accessibility, Kadence-specific block options for embeds, PostHog or Matomo as analytics options, i18n beyond the Astro recipe.

---

## 5. Implications for the decision (no recommendation)

Framework and rendering
- A page that is real HTML first and a 3D canvas second is the shape every accessibility source above points to. Astro and SvelteKit/Next static export all produce that HTML; only Astro adds zero JS by default (134 bytes versus about 32 KB gz for SvelteKit and about 172 KB gz for Next in my builds). Plain Vite SPA gives no prerendered fallback.
- Choosing React/R3F brings a 335 KB gz first-load floor (versus 184 KB gz for vanilla three with loaders) and a React 19.x lockstep, plus drei's Google-CDN Draco default; Threlte and TresJS bring their own frameworks. A framework-agnostic scene contract (one module per scene mounted into a container) keeps the wrapper choice reversible.
- The WebGPU question is mostly a risk question: for panoramas and glTF artifacts the visual gain is small, `WebGPURenderer` adds about 79 KB gz, is labelled experimental by its maintainers, and drops `ShaderMaterial` and `EffectComposer`. WebGL2 is at 96.4% reach. A thin renderer adapter would let either be chosen later.
- Astro 7 and SvelteKit 3 require Node 22+, SvelteKit 3 changed its config location, and the Vite-PWA wrappers for both are behind; Next has an actively released service-worker plugin. Service-worker work on Astro 7 would likely be hand-written or use `vite-plugin-pwa` directly (unverified).
- Parallel agents work best when each scene is a folder with one module, one data file, and its assets, discovered by `import.meta.glob` or a content-collection glob, validated by schema in CI; lockfile and shared-type edits need a single owner.

Assets and budgets
- KTX2 is a memory play, not a download play (the glTF-Transform docs say so); WebP/JPEG panoramas are cheap to download but expand to 32 MiB (4096 x 2048) or 128 MiB (8192 x 4096) on the GPU. Tiled/multires panoramas with a low-res base cap both download and memory.
- Google's own 3D guidance sits at 2 MB (Store case study) to 5 MB (Maps) per model; the earlier 3 MB-per-scene assumption is in line with that if artifact models share a scene budget rather than each taking 2 to 5 MB.
- A canvas is not an LCP candidate, so the real LCP is whatever HTML poster or text appears first; INP is where heavy scenes hurt.
- Offline/weak-network caching via service worker is best-effort on Safari unless installed to the home screen, and media needs explicit pre-caching plus range handling.

Fallbacks
- A Lite/2D mode cannot rely on `Save-Data`, `effectiveType`, or `deviceMemory` (Chromium only). The probes that do work everywhere are WebGL2 availability and context-creation success, `prefers-reduced-motion`, and a visible user toggle. Chrome now fails context creation instead of falling back to software rendering, so the failure path has to be real.

Hosting
- All candidate hosts are static and satisfy scale-to-zero. Differences are the failure mode and the terms: Netlify's credit model can pause everything and had a billing-credit bug in Jul to Aug 2026; Firebase's daily 360 MB cap blocks spikes and its paid fallback cannot be capped by budget alerts; Vercel Hobby is "personal, non-commercial" with a definition that touches paid staff; GitHub Pages cannot set headers (no `frame-ancestors`, no immutable caching); Cloudflare Pages has the most generous limits (20,000 files, 25 MiB, unlimited static requests, `_headers`) and accepts a CNAME subdomain on GoDaddy DNS, with an unresolved wording question on large-file CDN terms.
- IHH's DNS is at GoDaddy and its site is on WP Engine, so any of these hosts needs only a CNAME on something like a subdomain of immigranthallofhonor.org; a same-site subdomain also avoids third-party storage/cache partitioning for the embed. A prebuilt static folder (zip) is the most portable artifact IHH could re-host anywhere.

WordPress
- Three tiers exist: a plain link card (any role); pasting the URL into the Embed block (works with zero IHH code through oEmbed discovery if the showcase page advertises a static JSON endpoint, but WordPress then forces `sandbox="allow-scripts"`, strips `allow`/`loading`, caps height at 1000 px, and gives the app an opaque origin, so storage, service workers, and fullscreen are out and assets need CORS); and a registered embed handler or provider in a small IHH-side plugin (full control, needs plugin rights).
- The 3D showcase and any WordPress embed should assume iPhones have no iframe fullscreen, and should always offer an "open full page" link. Chrome 154's content-sized iframes help only Chromium users; `postMessage` remains the portable resize path.
- For discoverability, the showcase's own pages need real text and JSON-LD; Google may or may not credit iframe content to the parent page.

Analytics
- No analytics script was found on IHH's homepage today, so any engagement measurement is new. Cloudflare Web Analytics, GoatCounter, and Umami Cloud Hobby are the no-server options; Plausible and self-hosted Umami need a server and database, which conflicts with a static-only deployment. Whatever is chosen, student audiences make the COPPA internal-operations notice requirement and counsel review relevant.

---

## 6. Query log (all 2026-10-08)

Counts: Google web search 28; Google Developer Knowledge 15 (`search_documents`; `answer_query` not used); Context7 21 calls (8 `resolve-library-id` + 13 `query-docs`). Direct page fetches and local measurements are listed after, separately, and are not counted toward the quotas above.

### Google web search (WebSearch, mode standard)
1. Vercel Hobby plan fair use policy non-commercial personal use only nonprofit organization
2. Cloudflare Pages limits 20000 files 25 MiB per file static assets Workers free plan
3. three.js latest release version r18x 2026 WebGPURenderer production ready
4. Vercel Hobby plan nonprofit organization allowed hosting non-profit website terms commercial "Hobby" community
5. Netlify free plan credits exhausted site paused 2026 pricing credit-based nonprofit
6. Cloudflare Pages vs Workers static assets 2026 Pages deprecated migrate recommended
7. react-three-fiber v10 alpha WebGPU support status drei compatibility 2026
8. Threlte 8 Svelte 5 WebGPU WebGPURenderer support docs
9. KTX2 Basis Universal GPU memory savings versus JPEG PNG textures decoded VRAM mobile web 3D three.js
10. iOS Safari WebGL texture memory limit crash canvas memory budget mobile 3D web 2025 2026
11. school Chromebook typical specs 4GB RAM Celeron MediaTek WebGL performance education 2025 2026 student devices
12. accessible WebGL three.js canvas screen reader DOM alternative WCAG 2.2 3D web experience keyboard
13. failIfMajorPerformanceCaveat WebGL detect software rendering SwiftShader fallback low-power devices
14. WordPress unfiltered_html capability Editor role iframe stripped kses Custom HTML block single site vs multisite
15. Cloudflare Web Analytics free privacy-first no cookies no client-side state GDPR how it works 2026
16. Umami Cloud free plan 100k events per month pricing 2026 self-host MIT license
17. GoatCounter free non-commercial hosted terms nonprofit EUPL license privacy-friendly analytics
18. COPPA amended rule 2025 persistent identifiers analytics under 13 compliance deadline April 2026 internal operations exception schools
19. WebKit Intelligent Tracking Prevention 7 day cap script-writable storage service worker Cache API IndexedDB deleted after seven days Safari home screen web app exempt
20. Plausible Analytics Community Edition self-host AGPL requirements ClickHouse Postgres cloud pricing no free plan nonprofit
21. Vercel for nonprofits program free Pro plan discount non-profit organizations
22. Cloudflare Project Galileo nonprofit free Pro plan Pages Workers non-profit organizations 2026
23. WebGPU compatibility mode Chrome OpenGL ES Android older devices Chromebook shipped
24. three.js WebGPURenderer WebGL2 fallback backend performance slower than WebGLRenderer mobile forum issue 2026
25. GitHub Pages cannot set custom HTTP headers Cache-Control max-age 600 Content-Security-Policy frame-ancestors not supported
26. WP Engine host static HTML files subdirectory alongside WordPress custom HTTP headers bandwidth overage limits plans
27. HTTP Archive Web Almanac 2025 page weight median mobile total bytes JavaScript images
28. iOS 26 adoption share percent of iPhones Apple developer page Statcounter 2026 iOS versions

### Google Developer Knowledge MCP (`search_documents`)
1. Firebase Hosting pricing quotas storage data transfer free Spark plan
2. web.dev performance budgets Core Web Vitals heavy pages JavaScript size
3. WebGPU browser support status Chrome Safari Firefox
4. Workbox runtime caching strategies cache first stale-while-revalidate large media range requests service worker
5. Network Information API saveData effectiveType adaptive loading slow connections
6. Core Web Vitals thresholds LCP INP CLS good needs improvement 75th percentile
7. deprecation of automatic WebGL fallback to SwiftShader software rendering Chrome --enable-unsafe-swiftshader
8. iframe embed responsive height postMessage resize cross-origin iframe lazy loading sandbox attribute
9. optimize 3D models for web glTF compression Draco meshopt KTX2 texture size budget mobile
10. service worker storage quota Cache API eviction persistent storage navigator.storage.persist origin quota
11. Google Search indexing content in iframes embedded content attributed to the iframe URL not the parent page
12. Google Search structured data Person Event schema.org JSON-LD museum exhibits guidelines
13. storage partitioning third-party iframe service workers Cache API partitioned by top-level site same-site subdomain
14. Largest Contentful Paint what elements are considered img video poster background image block-level text canvas not considered
15. workbox-range-requests serve cached audio video partial content service worker Range header

### Context7
Resolve (`resolve-library-id`):
1. Next.js (query: static export output export next.config static HTML) -> /vercel/next.js
2. Astro (islands architecture client:visible client:only static output) -> /withastro/docs
3. three.js (WebGPURenderer WebGL2 fallback TSL) -> /mrdoob/three.js
4. React Three Fiber (performance regress frameloop demand WebGPU renderer) -> /pmndrs/react-three-fiber
5. glTF-Transform (optimize CLI meshopt KTX2 texture compression) -> /donmccurdy/gltf-transform
6. Vite (import.meta.glob lazy dynamic import per-file modules code splitting) -> /vitejs/vite
7. model-viewer (lazy loading reveal poster loading attribute alt accessibility keyboard) -> /websites/modelviewer_dev
8. drei (useGLTF draco decoder path CDN gstatic meshopt) -> /pmndrs/drei

Docs (`query-docs`):
1. /vercel/next.js/v16.2.9: Static export output: 'export' supported and unsupported features, generateStaticParams, image optimization with export, dynamic routes
2. /withastro/docs: client:visible client:idle client:only client directives islands partial hydration static output
3. /mrdoob/three.js: WebGPURenderer automatic fallback to WebGL 2 backend forceWebGL async init
4. /pmndrs/react-three-fiber: performance pitfalls frameloop demand regress PerformanceMonitor invalidate WebGPU renderer gl prop async
5. /donmccurdy/gltf-transform: CLI optimize command meshopt draco KTX2 etc1s uastc texture compression, resize, weld simplify
6. /pmndrs/react-three-fiber: WebGPU renderer support in v10: Canvas gl prop with WebGPURenderer, three/webgpu import, TSL
7. /withastro/docs: content collections glob loader one file per entry getStaticPaths dynamic routes static build JSON entries zod schema
8. /withastro/docs: astro:transitions ClientRouter view transitions persist island transition:persist prefers-reduced-motion accessibility route announcer
9. /vercel/next.js/v16.2.9: static export bundle size client JavaScript React runtime, dynamic import next/dynamic ssr false for three.js canvas, output export deploy to any static host
10. /websites/gltf-transform_dev: optimize command options --compress meshopt draco --texture-compress ktx2 webp avif --texture-size, KTX2 vs WebP GPU memory tradeoff
11. /vitejs/vite/v8.0.10: import.meta.glob lazy dynamic import of per-file modules, eager option, code splitting per matched file
12. /websites/modelviewer_dev: loading lazy reveal interaction poster alt attribute keyboard accessibility with-credentials ar modes
13. /pmndrs/drei: useGLTF draco decoder default CDN path useGLTF.setDecoderPath meshopt local decoder

### Direct fetches and local checks (not counted toward quotas)
Page fetches (WebFetch): vercel.com/docs/limits/fair-use-guidelines; vercel.com/docs/plans/hobby; developers.cloudflare.com pages/platform/limits, workers/static-assets/billing-and-limitations, workers/platform/limits, r2/pricing, r2/buckets/public-buckets, workers/static-assets/headers, pages/configuration/custom-domains, workers/configuration/routing/custom-domains, web-analytics (overview and faq); cloudflare.com/terms and service-specific-terms-application-services (twice); blog.cloudflare.com free-privacy-first-analytics; docs.github.com Pages limits and Terms of Service; netlify.com/pricing; docs.netlify.com credit-based-pricing-plans and how-credits-work; github.com/mrdoob/three.js/releases; caniuse.com/webgpu; docs.astro.build upgrade-to/v7; threlte.xyz intro; svelte.dev adapter-static; gltf-transform.dev cli and concepts; developer.apple.com forums thread 133449; w3.org WCAG 2.2 pause-stop-hide; w3.org TR/xaur; discourse.threejs.org thread 87092; developer.wordpress.org wp_oembed_add_provider, wp_filter_oembed_result, wp_embed_register_handler; oembed.com; umami.is/pricing; goatcounter.com FAQ and terms; ftc.gov COPPA FAQ and January 2025 press release; photo-sphere-viewer.js.org (tiles adapter and guide); immigranthallofhonor.org. Failed or empty: threejs.org/manual/en/webgpurenderer (404, replaced by the raw GitHub source), a Federal Register URL on ftc.gov (404), and one accidental irrelevant URL fetch (nyc.gov PDF, 404, no data used).

Primary-source reads and measurements (shell): npm registry JSON for about 40 packages (versions, publish times, engines, peers); caniuse feature JSON (webgpu, netinfo, prefers-reduced-motion, webgl2, view-transitions, fullscreen); WordPress core files on GitHub (`embed.php`, `class-wp-embed.php`, `capabilities.php`, `class-wp-oembed.php`, `class-wp-oembed-controller.php`, `schema.php`, `embed.js`); three.js manual source `manual/pages/webgpurenderer.html`; `curl -I` and DNS (`dig`) and `whois` on immigranthallofhonor.org; local builds of Vite+three (WebGL and WebGPU), Vite+R3F, Vite+Threlte, Astro 7.3.8, Next 16.4.0 export, SvelteKit 3.0.1 with adapter-static 4.0.0.
