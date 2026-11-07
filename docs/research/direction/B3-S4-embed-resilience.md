# B3-S4: Embedding and resilience spike

Date: 2026-10-08. Throwaway prototype, built to measure. No recommendation is made; section 9 lists implications only. Illustrative content only: the scene is a labelled box ("illustrative reconstruction (spike)") with no historical claims and no real people's images.

## 0. Environment and the limits that shaped the results (read first)

| Item | Value |
|---|---|
| Browser used | The in-app browser = Claude desktop app (Electron), UA `Claude/2.19675.1 Chrome/152.0.7977.130`, Apple M1, ANGLE Metal, dpr 2, viewport 1024x768 |
| Pane state | Hidden for the whole run: `document.visibilityState` = "hidden", `hasFocus()` = false. Page and frame rendering only runs for a short window (at least about 3 s observed) after a screenshot call (the screenshot flips frames to "visible"; rAF, view transitions, resize events came alive only then). Every number below says whether it was taken awake or hidden |
| Servers | `python3 -m http.server 8704` (showcase) and `8705` (host), both started with `--bind 127.0.0.1`, serving `Challenge IHH/spikes`. Showcase URL host `127.0.0.1`, host-page URL host `localhost`, so the two are cross-origin AND cross-site. Both servers stopped at the end |
| Disk | Free space fell from 1.3 GB to ~200 MB during the run (other agents). Nothing installed; largest file written is 35 KB |
| Library lookups | Context7 queries: 3 (1 resolve-library-id + 2 query-docs, all `/mrdoob/three.js`). Web fetches for spec/source reads: 5 (oembed.com x2, WordPress `wp-embed.js` x2, `embed.php` x1). The WordPress and oEmbed reads went through a summarising fetcher, so treat exact strings as medium confidence; they agree with B1-R3 f3 |

Two environment facts that change what could be tested:

1. **The in-app browser blocks every request made by an opaque-origin frame to a loopback address.** A `sandbox="allow-scripts"` iframe (no `allow-same-origin`) whose `src` is `http://127.0.0.1:8704/...`, `http://localhost:8705/...`, `http://showcase.localhost:8704/...`, `http://[::1]:8704/...` never reaches the server: the network log shows `net::ERR_BLOCKED_BY_CLIENT` and the server log shows no request. The same frame fires its load event for `https://example.com/` (126 ms; content not inspected), and loads from loopback if `allow-same-origin` is added or the sandbox is removed. Sub-resource requests (img, fetch, module import) made by an opaque-origin `srcdoc` frame to loopback are blocked the same way. I did not find out whether this is Electron policy or Chromium behaviour; it is not a WordPress rule. I did try to bind the server to the LAN address to get around it; the permission system refused (Expose Local Services), so I did not pursue it. **Consequence:** the verbatim WordPress-markup frame ("A") cannot load here. Everything about the sandboxed tier was measured on a proxy frame ("P"): identical attributes (`class="wp-embedded-content" sandbox="allow-scripts" security="restricted" data-secret width height frameborder marginwidth marginheight title`, `#?secret=abc123` in the URL fragment) but the document is a `blob:` URL built by the host page from the showcase HTML (with `<base>` pointing at the real showcase URL and the poster inlined as a data URI). The origin is "null" exactly as in WordPress. What P cannot show: loading its own same-site sub-resources (blocked by the browser guard, so those probe rows fail for a reason that is not the sandbox rule), and any behaviour that depends on a real http(s) `src` (referrer shape, Safari quirks).
2. **Hidden pane.** Frame `requestAnimationFrame`, ResizeObserver, `resize` events, View Transitions, FCP/LCP are all suspended or aborted while hidden. I re-ran the ones that matter after a screenshot wake ("awake"), and mark which is which.

## 1. What I built

All under `Challenge IHH/spikes/s4-embed/`:

| File | Size | Role |
|---|---|---|
| `showcase/index.html` | 34,904 B (11,007 B gzip -9) | HTML-first page: `<h1>`, three `<h2>`, poster `<img fetchpriority="high" alt>`, six-item `<ol>` of faces, controls, probe table, "Open full page" link, `<noscript>`, oEmbed discovery `<link>`. One inline script: flags, probes, 3D, 2D fallback, messaging |
| `showcase/poster.webp` | 12,204 B | Placeholder poster drawn locally with PIL (no download) |
| `showcase/oembed.json` | 642 B | Static oEmbed `rich` response |
| `showcase/_headers` | 394 B | Cloudflare Pages header file (`Access-Control-Allow-Origin: *`, CORP). Written but NOT exercised |
| `showcase/ext-module.js`, `ext-classic.js`, `sw.js` | 130 / 110 / 133 B | Probe targets |
| `host/index.html` | 12,109 B | Fake WordPress host page (not WordPress): three frame tiers, wp-embed.js mimic, tier-2 listener, message log, `window.H` test API |
| `tools/validate_oembed.py` | 5,882 B | oEmbed discovery + shape + WordPress-kses validator (stdlib) |

**Showcase behaviour**
- Capability probe: `getContext('webgl2')` success (plus `failIfMajorPerformanceCaveat` variant), `matchMedia('(prefers-reduced-motion: reduce)')`, a manual **Lite mode** button (`aria-pressed`, persisted to `localStorage` when allowed, memory only otherwise). `navigator.connection` is not used.
- Probes shown on screen and posted to the parent: origin/referrer/ancestorOrigins/visibility, WebGL2, reduced motion, `localStorage`, `sessionStorage`, `document.cookie`, `indexedDB`, `CacheStorage`, service worker register, `fullscreenEnabled`, `startViewTransition`, blob Worker, external classic script, external ES module, same-URL `fetch`, CORS-mode image, WebGL texture upload with and without CORS, public CORS vs non-CORS fetch and image, CDN import.
- 3D: `three@0.186.1` loaded by dynamic `import()` from jsDelivr (so the page works if the import fails); `BoxGeometry` with six `MeshBasicMaterial` + `CanvasTexture` faces; spin loop only while spinning or tweening (renders on demand otherwise); reduced motion starts paused (snap-instead-of-tween on face change is coded but was not exercised).
- 2D fallback: a `<canvas role="img">` drawn by the same `drawFace()` function that makes the 3D textures; the accessible name and the HTML face list are mode-independent.
- Failure simulation flags (query or hash): `nowebgl=1` (every WebGL `getContext` returns null), `nowebgl=2` (probe passes, renderer canvas fails), `nocdn=1`, `lite=1`, `rm=1`, `hold=1` (poster only), `h=N` (force page height), `wpmsg=0`, `compact=1`, `dbg=1`, `minimap=1`. A `WEBGL_lose_context` command simulates context loss.
- Height reporting: posts `{type:'ihh-embed-height', height}` and, when a `#?secret=` is present, also the WordPress shape `{message:'height', value, secret}`. Triggers: boot, `load`, `resize`, ResizeObserver on the page wrapper, plus a 1 s poll (added after the hidden-pane run showed events missing). Height is the wrapper's `getBoundingClientRect().height`, not `documentElement.scrollHeight`.
- "Open full page": an `<a target="_blank" rel="noopener">`; inside a sandboxed frame the click is intercepted and a WordPress `link` message is posted instead.

**Host page behaviour** (`host/index.html`, `?frames=` picks tiers):

| Tier | Markup | Listener |
|---|---|---|
| A | verbatim WordPress shape, real `src` | wp-embed.js mimic (blocked by the browser here) |
| P | A's attributes, `blob:` document | same wp-embed.js mimic |
| B | registered provider: no sandbox, `allow="fullscreen" allowfullscreen` | IHH-message listener, checks `e.origin` and `e.source`, no clamp |
| C | control: no sandbox, no `allow` | same as B |

The wp-embed.js mimic follows the WordPress source as read: secret must be `[a-zA-Z0-9]`; matches `iframe[data-secret]`; requires `e.source === iframe.contentWindow`; ignores `e.origin`; clamps `height` to 200..1000 (`~~height < 200`); `link` navigates `window.top` only if the protocol is http(s), the host equals the iframe `src` host, and `document.activeElement === iframe`; on DOMContentLoaded posts `{message:'ready', secret}` to each `iframe.wp-embedded-content` (before the frame has loaded, so the frame misses it). Real secrets are 10 characters (`wp_generate_password(10,false)`); the brief's `abc123` is accepted by the same regex.

## 2. Measurements and observations

### 2.1 Sandboxed opaque origin versus unsandboxed (probe rows, frame P versus B and C)

Method: each frame runs the probes on load and posts the results to the host; the host log was read through `window.H.log`. Run 2026-10-08, single run each, rows confirmed on two or more loads. P is `sandbox="allow-scripts"` (origin "null", secure context true); B and C are unsandboxed at `http://127.0.0.1:8704`.

| Probe | P (sandboxed) | B (no sandbox, allow=fullscreen) | C (no sandbox, no allow) |
|---|---|---|---|
| WebGL2 context | PASS (ANGLE Metal, Apple M1; hardware path) | PASS | PASS |
| three.js from jsDelivr via `import()` | PASS, 118 ms (single run; earlier P run 71 ms) | PASS, 36 ms | PASS, 61 ms |
| `localStorage` / `sessionStorage` | FAIL `SecurityError`: "Failed to read the 'localStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag." | PASS | PASS |
| `document.cookie` | FAIL `SecurityError` (same wording, 'cookie' on 'Document') | PASS (empty) | PASS |
| `indexedDB.open` | FAIL `SecurityError`: "access to the Indexed Database API is denied in this context." | PASS | PASS |
| `caches` (CacheStorage) | FAIL `SecurityError` on property read: "Cache storage is disabled because the context is sandboxed and lacks the 'allow-same-origin' flag." | PASS | PASS |
| `navigator.serviceWorker` | FAIL `SecurityError` on property read: "Service worker is disabled because the context is sandboxed and lacks the 'allow-same-origin' flag." Note `'serviceWorker' in navigator` is still true; only reading the property throws | register fails for an unrelated reason (see 2.1a) | same |
| `document.fullscreenEnabled` | false | true | false |
| `requestFullscreen()` on a real key activation (Enter on the focused button) | `TypeError: Disallowed by permissions policy` | allowed by policy, promise never settled (see 2.5) | `TypeError: Disallowed by permissions policy` |
| `document.startViewTransition` present | yes | yes | yes |
| blob: Worker | PASS | PASS | PASS |
| public CORS fetch (`cdn.jsdelivr.net/.../package.json`, ACAO `*`) | PASS | PASS | PASS |
| public non-CORS fetch (`example.com`) | FAIL `TypeError: Failed to fetch` | FAIL | FAIL |
| public CORS `<img crossorigin>` then `texImage2D` | PASS (1024x1024) | PASS | PASS |
| public `<img>` without `crossorigin` then `texImage2D` | FAIL `SecurityError` ("image element contains cross-origin data") | FAIL | FAIL |
| same-URL external classic script / ES module / `fetch('oembed.json')` / CORS image | FAIL, but caused by the browser guard on loopback (see section 0), not by the sandbox rule | PASS | PASS |
| `document.referrer` | full host URL (artefact of the `blob:` proxy; a real http frame would get the origin only, as B and C show: `http://localhost:8705/`) | `http://localhost:8705/` | same |
| `location.ancestorOrigins` | `http://localhost:8705` | `http://localhost:8705` | same |

**2.1a Service worker baseline.** At top level (no iframe) `navigator.serviceWorker.register('sw.js')` also fails in this browser with "An unknown error occurred when fetching the script." (`sw.js` is fetched fine with `fetch`, 200, `text/javascript`; `getRegistrations()` returns 0). So registration cannot be compared across tiers here; only the sandbox's earlier-stage `SecurityError` is observed. Unverified: whether registration works in stock Chrome.

**2.1b CORS from an opaque origin.** Directly confirmed with public hosts only: an opaque-origin document can import and fetch from a host that answers `Access-Control-Allow-Origin: *` (jsDelivr), and cannot read a host that sends no CORS header. Not confirmed with the showcase's own host (blocked, section 0). The rule from the specs, not measured here: every sub-resource the sandboxed page fetches in CORS mode (module scripts, JSON, `crossorigin` images used as textures, GLB/KTX2) carries `Origin: null` and needs `ACAO: *` (or an explicit `null`); a no-CORS `<img>` used as a WebGL texture is tainted (`SecurityError`, measured above). `showcase/_headers` is the Cloudflare Pages file that would send the header; it was not run.

### 2.2 Height messages and clamping (P = sandboxed, B = tier 2)

Method: host `window.H` sets a forced page height (`h=N`) or width; the host log records requested value and applied value. Two initial reports per load (boot and `load`), more on change.

| Case | P (WordPress-style clamp) | B (no clamp) |
|---|---|---|
| `h=1500` | requested 1500, applied **1000** | 1500 |
| `h=150` | requested 150, applied **200** | 150 |
| `h=640` | 640 applied | not run |
| `compact=1` natural height | 631, then 650 after the 3D canvas mounts (+19 px layout shift) | same |
| full page natural height at 598 px width | 2233 px, applied **1000** (1233 px, 55 %, lies beyond the clamp) | 2200 to 2233 |
| `wpmsg=0` (only `{type:'ihh-embed-height'}` sent) | **no resize**: frame stays at the 480 px attribute | n/a (B uses that message) |
| message `origin` seen by the host | `"null"` | `http://127.0.0.1:8704` |

- The IHH-shaped message is ignored by wp-embed.js (no `secret`, `message` or `value`). The showcase must send the WordPress shape with the secret from `location.hash` to resize inside a discovered embed.
- A tier-2 listener that checks `e.origin` against the provider origin would reject every message from a sandboxed frame (`"null"`); logged as `ihh-rejected` when P was first routed to the tier-2 listener.
- Width changes, awake (host sets B's iframe width): 320 px gives 3195 px reported in +20 ms (`window-resize`), 600 px gives 2215 px (+17 ms), 450 px gives 2510 px (+14 ms). Shrinking works because the measure is the wrapper height. Naive `documentElement.scrollHeight` cannot shrink: observed `docH` 627 vs `scrollH` 648 (= frame viewport height) at 320 px.
- Hidden pane: no `resize`/ResizeObserver events fired for iframe width changes, so reports went stale (reported 650, true 627 and later 664). The 1 s poll caught up only sporadically (timers in hidden frames were throttled). Treat the resize path as verified only for the awake case.
- Scrolling: with the clamp at 1000 and `scrolling` omitted, the frame can scroll internally. With `scrolling="no"` (a permitted attribute that WordPress's own embeds use) the remaining content would be unreachable by HTML semantics. My wheel and PageDown test did not scroll the frame in this harness (wheel scrolled the host; `scrollY` stayed 0), so this is not measured.

### 2.3 "Open full page"

| Path | Result |
|---|---|
| Sandboxed frame, Enter on the link: script posts `{message:'link', value:<canonical URL>, secret}`, host mimic checks protocol ok, same host as the (real) `src` host ok, `document.activeElement === iframe` ok | host navigated its top window to the showcase page (verified: tab origin changed to `http://127.0.0.1:8704`; run once without `dry`) |
| Sandboxed frame, plain `<a target="_blank">` and `<a target="_top">` (debug links) | nothing happens: no new tab, host URL unchanged. No `allow-popups`, no `allow-top-navigation` |
| Unsandboxed frame C, Enter on `<a target="_blank" rel="noopener">` | this browser navigated the same tab to the link (embedder behaviour; unplanned, found when a mis-aimed click focused C) |

The link target is taken from the anchor's `href`, not `location.href`, because inside a `blob:`/`srcdoc` frame `location.href` is useless to the host.

### 2.4 Keyboard focus into and out of the frame (real Tab/Shift+Tab key events)

Order observed, host to P to B to host, no trap, no skipped frame: `before` -> P: Previous face, Next face, Pause rotation, Lite mode, Fullscreen, Open full page -> B: same six -> `after`. Shift+Tab reversed exactly (entering from `after` landed on B's last stop). While focus is inside a frame the host's `document.activeElement` is the `<iframe>`. The canvas is deliberately not a tab stop; all controls are real buttons/links. The frame reports `focusin`/`focusout` ids to the host through `postMessage`, which is how this was logged. By code, in 2D mode "Pause rotation" is `disabled`, so there would be one fewer stop (not exercised).

### 2.5 Fullscreen

P and C: `fullscreenEnabled` false and `requestFullscreen()` rejects with `TypeError: Disallowed by permissions policy`. The missing `allow="fullscreen"` alone blocks it (C is unsandboxed), so the attribute strip and the sandbox each independently remove fullscreen. B: policy allows (`fullscreenEnabled` true), but the request promise did not settle within 1.5 s and `fullscreenElement` stayed null. The identical click on the top-level page behaves the same, so this embedder does not complete fullscreen at all; the B result proves only the policy layer. Keyboard-triggered requests were allowed to run (Enter counts as user activation).

### 2.6 View Transitions (same-document)

Hidden: `InvalidStateError: Transition was aborted because of invalid state` in every frame and at top level. Awake (after screenshot): sandboxed P `ready` 29 ms, `finished` 282 ms, 10 `::view-transition*` animations present; unsandboxed B `ready` 18 ms, `finished` 29 ms, 10 animations. A transition requested in a frame that was off-screen stayed pending 6.6 s until the frame became visible. In 2D mode, a face change still applied when the transition was aborted (update callback ran; verified: face 3 "Top face" label and list updated). Reduced motion skips the transition. Cross-document transitions were not tested.

### 2.7 Fallback paths (frame P, sandboxed; each loaded fresh, then `a11y` command)

| Trigger | Final mode and reason | Accessible name | `aria-current` item | Face-list text (331 chars, checksum) |
|---|---|---|---|---|
| default | 3D | "Spike object, face 1 of 6: Right face." | item 1 | 1512417247 |
| `nowebgl=1` (probe fails) | 2D, "no WebGL2 context" | identical | identical | identical |
| `nowebgl=2` (probe passes, renderer fails) | 2D, "renderer init failed (THREE.WebGLRenderer: Error creating WebGL context.)" | identical | identical | identical |
| `lite=1` | 2D, "manual Lite mode" | identical | identical | identical |
| `nocdn=1` | 2D, "three.js did not load" | identical | identical | identical |
| 3D then `WEBGL_lose_context.loseContext()` | 3D then 2D, "WebGL context lost" | identical | identical | identical |
| `rm=1` | 3D, status line reports reduced motion and rotation starting paused (the snap-instead-of-tween path on face change was added in code but not exercised) | identical | identical | identical |

The 2D canvas draws the same face art through the same function; screenshots: `s4-03` (3D in sandbox) and `s4-04` (2D in sandbox, face 3). Face navigation works in 2D. Manual Lite persistence: top-level `localStorage` stores it and the 2D state survives; in the sandbox `localStorage` throws, so the toggle is memory only and resets on reload (row "lite persistence" in the probe table).

### 2.8 Performance and bytes (warm CDN edge, single runs, M1)

| Metric | Value | Method |
|---|---|---|
| showcase HTML | 34,904 B raw, 11,007 B gzip -9 | file size, `gzip.compress(level 9)` |
| poster | 12,204 B WebP; resource duration 21 ms (first), 2-4 ms (cached) | Resource Timing |
| three.js via the plain jsDelivr URL `build/three.module.min.js` | 90,124 B + `three.core.js` 266,288 B = **356,412 B encoded** (392,831 + 1,458,113 = 1.85 MB decoded). jsDelivr's auto-minified module imports the UNMINIFIED `three.core.js` | `encodedBodySize`/`decodedBodySize` (jsDelivr sends Timing-Allow-Origin) |
| same, with an import map remapping `.../three.core.js` to `.../three.core.min.js` (flag `minimap=1`) | 90,124 + 104,314 = **194,438 B encoded** (808,647 B decoded); 3D rendered normally | same; local `gzip -9` of both min files gave 89.8 + 104.2 KB |
| CDN `import()` time | 36 to 118 ms (n = 9 loads across top level, P, B, C) | `performance.now()` around `await import()` |
| DOMContentLoaded / load in frame | top level 81/82 ms; P 127/129; B 48/50; C 50/50 (hidden pane) | Navigation Timing in frame |
| First 3D frame (direct render, ms since frame navigation start) | top level 178 (first load) and 184; P 128 to 268; B 94; C 126 | `performance.now()` after first `renderer.render` |
| Frame rate awake | top level 60.5 fps (182 frames, 3 s); P 60.6 fps (122 frames, 2 s); B 60.9 fps | rAF count; display-locked, not a GPU measure |
| `renderer.render()` CPU submit time | 0.153 ms average (top level), 0.173 ms (P), 300-sample window | `performance.now()` around render; excludes GPU time |
| JS heap | 5.5 MB top level, 4.4 MB P | `performance.memory.usedJSHeapSize` (Chromium only) |
| Scene | 1 geometry, 6 textures (512x512 canvases), 6 draw calls per frame | `renderer.info` |
| 2D mode cost | no rAF loop (`S.raf` = 0); heap 5.6 MB (three already loaded) | state read |
| LCP | `?hold=1` (poster only): LCP element = `#poster`, 502,326 px² (about 100 % of the image's box). The time value (2428 ms) is not meaningful because the hidden pane painted only when the screenshot forced it | `PerformanceObserver('largest-contentful-paint')` |
| LCP when 3D takes over before the first paint | observed once: LCP element became a paragraph (the poster was hidden before it ever painted). The WebGL canvas is not an LCP candidate | first top-level run |

Unmeasured: real FCP/LCP timings, GPU time, mobile devices, iOS Safari, memory per context.

### 2.9 oEmbed discovery and JSON (static)

`showcase/index.html` head carries `<link rel="alternate" type="application/json+oembed" href="http://127.0.0.1:8704/s4-embed/showcase/oembed.json" title="...">`. `oembed.json` is type `rich`, version `"1.0"`, `width` 600, `height` 480, `html` = a single `<iframe>` using only the WordPress-allowed attributes (`src width height frameborder marginwidth marginheight title`; no `scrolling`, `allow`, `loading`, `class`, `style`), `cache_age` 3600, thumbnail trio, provider fields.

`tools/validate_oembed.py` (stdlib) fetches the page (first 150 KB, as WordPress does), finds the link with a regex like `WP_oEmbed::discover`, fetches the endpoint, and checks: HTTP 200 and `Content-Type: application/json`; type in {photo, video, link, rich}; `version` is the string "1.0"; `html`, `width`, `height` present with integer width/height for rich; optional field types; thumbnail trio together; no unknown keys; html is one iframe whose attributes survive the WordPress kses allow-list; title present; width/height match; no style. **29 of 29 checks passed.** Negative control: a deliberately broken copy (numeric version, string width, a thumbnail field removed, an extra key, `allow`/`loading`/`style` on the iframe) failed 6 checks, so the validator does catch these. It also prints the iframe WordPress would emit: the same attributes plus `class="wp-embedded-content" sandbox="allow-scripts" security="restricted" data-secret=...` and `#?secret=...` on `src`.

Spec read (oembed.com, fetched): rich responses require `type`, `version`, `html`, `width`, `height`; the thumbnail trio must appear together; `html` should have no padding or margins and be valid XHTML 1.0 Basic; **rich responses must obey `maxwidth`/`maxheight`**. A static JSON file cannot, so it is a spec deviation (WordPress passes both parameters; its CSS `max-width:100%` covers narrow themes). WordPress's server-side fetch of the page and endpoint was not exercised (no WordPress run; `wp_safe_remote_get` refuses loopback and private addresses, so this spike could not be pointed at a local WordPress even if one existed).

### 2.10 Accessibility observations (`read_page` tree and in-page checks)

- Top-level showcase tree: `banner`, `heading` (one h1, three h2), `main`, `region`s, `group "Viewer controls"` with five buttons and the link, `status "Mode: ..."`, `list`/`listitem` x6, `table`. The canvas appears as `img "Spike object, face 1 of 6: Right face."` in both 3D and 2D; only the ref id and the status text differ between modes.
- **The embedding page's tree does not contain the frame's content**: each iframe appears as one node, `generic "<iframe title>"`, with no children (cross-origin and sandboxed alike in this tool). The `title` attribute is therefore the only thing a tree-reading tool sees; WordPress copies the JSON `title` into it.
- The tool output omits `aria-pressed` and `aria-current`, and still lists the poster `<img>` after it was hidden with `display:none` (computed style confirmed `none`). So this tree is not a faithful accessibility-tree snapshot; real screen-reader behaviour was not tested.
- In-page `a11y` command (section 2.7) shows identical name, current item and list text across all seven paths.
- At 375 px emulated width the top-level page has no horizontal scroll (`scrollWidth` 375 = `clientWidth` 375) and reports a new height on resize (1988 to 3087). Viewport emulation was reset to desktop.

## 3. Screenshots (all in `Challenge IHH/docs/research/direction/spikes/`)

| File | Shows |
|---|---|
| `s4-01-toplevel-3d.webp` | Top-level showcase, 3D box (first frame; hidden pane did not advance rotation) |
| `s4-02-toplevel-2d-lite.webp` | Same page after pressing Lite mode: 2D view, face list with `aria-current` bold, status line |
| `s4-03-sandboxed-proxy-3d.webp` | Frame P on the fake host page: WebGL box rendering inside `sandbox="allow-scripts"` |
| `s4-04-sandboxed-2d-fallback-nowebgl.webp` | Frame P with `nowebgl=1`: 2D fallback, face 3 "Top face", status "Reason: no WebGL2 context" |
| `s4-05-wp-markup-frame-A-blocked.webp` | Frame A (verbatim WordPress markup, real http `src`): blank, blocked by the browser |

## 4. What failed or could not be done

1. Verbatim WordPress-markup frame A never loaded (`ERR_BLOCKED_BY_CLIENT`); P is a proxy (section 0).
2. LAN-bind workaround refused by the permission system; not pursued.
3. Service worker registration fails even at top level in this embedder; cross-tier comparison impossible.
4. `requestFullscreen()` never settles in this embedder (top level too); only policy-level results hold.
5. Pane hidden: rAF, resize events, ResizeObserver, View Transitions, FCP/LCP unusable until a screenshot wakes the frames; polling timers throttled. Awake re-runs cover rAF, VT, resize.
6. Inner-frame scrolling (wheel, PageDown) not reproducible; `scrolling="no"` consequence unmeasured.
7. `security="restricted"` has no effect I could observe (it is an Internet Explorer attribute); I did not isolate it. No iOS, Android, Safari or Firefox runs.
8. WordPress itself (discovery fetch, block editor preview, `wp-embed.js` loading on the real theme, WP Engine caching and security plugins) was not run; the host page is a mimic of source code read via a fetcher.
9. Bugs in my own spike found and fixed during the run: `[hidden]` overridden by author CSS; `gl.getError()` read after `loseContext()` returned 37442; the page's own IHH message ignored by wp-embed.js (added the WordPress-shaped message); `location.href` as the "full page" URL useless inside blob frames; reporting relied on events that did not fire while hidden (added a poll).
10. One harness mishap: a stale click coordinate focused frame C and Enter on its `_blank` link navigated my tab; no data affected.

## 5. Open questions

1. Does the sandboxed tier behave as measured with a real http(s) `src` on a non-loopback host, in stock Chrome, Safari (iOS) and Firefox? Needs a hosted showcase and a real WordPress.
2. Does `Access-Control-Allow-Origin: *` from Cloudflare Pages (`_headers`) make module scripts, JSON, textures and GLB load from the `null` origin? (Untested here.)
3. Does WordPress's own wp-embed.js get enqueued on IHH's theme, and do WP Engine caching or a security plugin block the server-side discovery fetch?
4. What does the block editor preview do with a sandboxed embed (separate iframe layer)?
5. Is a 1000 px cap workable for the intended embed (a teaser plus "Open full page") versus the 2233 px full page measured here?
6. Do users' browsers partition storage for the unsandboxed tier (B) when host and showcase are cross-site? Not tested (Chromium here does not show partitioning for loopback).
7. Real LCP of the poster on a phone-class device and network.
8. Does the import-map remap of the three.js core file keep working across jsDelivr releases?

## 6. Exact versions and URLs

- three.js `0.186.1` (npm latest on 2026-10-08), module `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.min.js` (jsDelivr auto-minified from `three.module.js`; sends `Access-Control-Allow-Origin: *`, `Timing-Allow-Origin: *`), which imports `./three.core.js`; optional remap target `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.core.min.js`.
- Public CORS test assets: `https://cdn.jsdelivr.net/npm/three@0.186.1/package.json`, `https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/uv_grid_opengl.jpg` (549,505 B, ACAO `*`); non-CORS control `https://example.com/`.
- Python 3.12.9 `http.server`; Pillow 10.4 and `cwebp` used locally for the poster and screenshots.
- Sources read for behaviour: WordPress `wp-includes/js/wp-embed.js` and `wp-includes/embed.php` (`wp_filter_oembed_result`, `wp_filter_oembed_iframe_title_attribute`) on GitHub master, 2026-10-08; oEmbed 1.0 spec at oembed.com.

## 7. Context7 and fetch tally

Context7: 3 calls (`resolve-library-id` Three.js; `query-docs` WebGLRenderer constructor, WebGL2 availability, CanvasTexture colour space; `query-docs` BoxGeometry material array, context-loss handling). Findings used: `WebGLRenderer` is WebGL 2 only; material arrays map to geometry groups; textures with colour data need `SRGBColorSpace`; `WebGL.isWebGL2Available()` exists (not used; I probe with `getContext`). Web fetches: 5 (listed in section 0).

## 8. Reproduction

Start two servers from `Challenge IHH/spikes` (`python3 -m http.server 8704 --bind 127.0.0.1` and `8705`), open `http://localhost:8705/s4-embed/host/index.html?frames=PBC` (add `&q=compact=1`, `&dry=1`, `&scroll=no` as needed). Test API: `H.proxy('nowebgl=1')`, `H.src('B','h=1500')`, `H.cmd('P','vt')`, `H.log`. Showcase alone: `http://127.0.0.1:8704/s4-embed/showcase/index.html?dbg=1`. Validator: `python3 spikes/s4-embed/tools/validate_oembed.py http://127.0.0.1:8704/s4-embed/showcase/index.html`.

## 9. Implications for the decision (no recommendation)

- **Discovered (paste-the-URL) tier is a different runtime from a normal page.** WebGL2, dynamic CDN `import()`, `postMessage`, View Transitions and keyboard traversal all work inside `sandbox="allow-scripts"`; storage, cookies, IndexedDB, CacheStorage and service workers throw; fullscreen and popups are off. Anything that must persist (Lite choice, quiz progress, completed scenes) cannot live in the frame; it would need the parent page, the URL, or a full-page visit.
- **Height contract:** WordPress honours only `{message:'height', value, secret}` with a secret read from `location.hash`, clamps to 200..1000 px, and ignores the IHH message shape. A 2233 px page is cut at 1000 px; the embed would have to be a compact teaser, with the "Open full page" path going through a `link` message to a URL on the same host as the embed `src`.
- **Fallback is cheap and verified:** a probe-gated 2D view driven by the same drawing code, with the content and accessible name unchanged, covered six failure paths (no WebGL2, renderer failure, CDN failure, context loss, manual Lite, reduced motion).
- **Hosting must send CORS headers** for any sub-resource the sandboxed page fetches in CORS mode; this is derived from specs plus the public-host tests, not yet confirmed on the real host.
- **Two-tier cost:** the discovered tier needs zero IHH code; the registered tier gives storage and fullscreen only if the HTML carries `allow="fullscreen"` and no sandbox, which needs plugin rights (B1-R3 f4). The same page already runs in both.
- **CDN payload:** the default jsDelivr URL costs about 356 KB over the wire; an import map halves it (about 194 KB). Self-hosting the library on the static host was not tested.
- **Offscreen frames idle:** rAF, view transitions and resize events do not run while a frame is hidden or off-screen, so the page should draw one frame, run a loop only while visible, and not depend on events alone for height.
- **Testing environment lesson:** an opaque-origin frame cannot be tested against a loopback server in this browser; a real WordPress plus a public (or LAN) showcase host is needed before the sandboxed tier can be called verified.
