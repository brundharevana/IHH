# Tapestry (CyArk) design system extraction

Sources: computed styles via browser at 1024px viewport on `/` and `/content/petra`; raw CSS `homePageIndex.min.85a1db23.css` (204KB) and `index.min.5e9652ff.css` (187KB). Values are measured, not guessed. Caveat: viewport was 1024 wide, so desktop >=1440 sizes (H1) may be larger via clamp/media queries.

## 1. Fonts

One family only: **Poppins** (Google Fonts, SIL OFL, free; loaded via `fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`). No display serif, no mono. Hierarchy comes entirely from weight, size, letter-spacing and warm-tinted whites.

| Role | Size / weight | Line-height | Letter-spacing | Transform | Colour |
|---|---|---|---|---|---|
| Home hero H1 | 30.72px / 500 | 36.9px (1.2) | -0.6144px (-0.02em) | none | #fff |
| Story title H1 (`.sTitle`) | 46px / 500 | 51.5px (1.12) | normal | none | #fff |
| Stop title H2 (in-tour) | 32px / 400 | 34px | normal | none | #f0e8dd |
| Card title H2/H3 | 20px / 600 | 25px | -0.2px (home triptych) / normal | none | #fff |
| Body / tagline | 14px / 400 | 21px (1.5) | normal | none | rgba(255,255,255,.85) |
| Card desc | 13px / 400 | 19.5px (1.5) | normal | none | rgba(255,255,255,.85) |
| Broadcast / toast text | 14px / 400 | normal | 0.5px | none | #fef0d7 |
| Nav link (desktop) | 14px / 400, active 600 | normal | 0.28px (0.02em) | none | .85 white; active #ffb366 |
| Nav pill / search / donate | 12-13px / 400 | normal | normal | none | #fff / .95 |
| Button label (CTA) | 11px / 500 | normal | 0.7px | UPPERCASE | #1a1209 on cream, or .65 cream |
| Chip / link label | 12px / 600 | 15.6px | 0.48px (0.04em) | none | #fef0d7 |
| Eyebrow (site name above title) | ~11px, tracked uppercase (seen in screenshot, wide tracking) | - | ~0.15em est | UPPERCASE | white .85 |
| Language switch | 11px / 500 | 26px | normal | capitalize | #fef0d7 |
| Meta / version | 10.2px / 400 | - | 0.24px | none | rgba(255,255,255,.35) |
| Secondary link | 12px / 400 | - | 0.24px | none | rgba(255,255,255,.72) |
| Hint pill | 14-18px / 400 | - | - | none | #fef1d7 |

Size tokens: `--font-size-14/13/12/11/10/9/8`. Numerals: no special face; tabular figures not set. Free equivalent: none needed (Poppins is OFL). Close alternates if we want less geometric: Manrope, Plus Jakarta Sans. Fallback stack is just `Poppins, sans-serif`. Arabic (RTL) handled with `.rightToLeftText` class on same family.

## 2. Colour palette

Root tokens (verbatim): `--title:#f0e8dd; --subTitle:hsla(35,39%,90%,.5); --text:hsla(35,39%,90%,.65); --UI-color-orange:#FF9B2D; --orange-to-white:#ff9b2d; --gd-media-strip-bg:#1c1b1acc; --gd-stop-nav-bg:#1c1b1a80; --gd-button-hover:#302e2ce6; --gd-light-button-background:#f0e8dd1a; --gd-accent-red-background:#ea324133;` plus black alpha ramp `--black-opacity-0..90` (#0000001a ... #000000e6), `--white-opacity-90:#ffffffe6`, `--white-opacity-6:#ffffff0f`.

| Hex / value | Where |
|---|---|
| #0a0e14 | Page background (body), card overlay gradient base, footer bg (near-black navy) |
| rgba(20,26,36,.6) | Card base fill (#141a24 at 60%) |
| #1c1b1a (cc / 80 alpha) | Media strip and stop nav bg (warm charcoal) |
| #302e2c (e6) | Button hover bg |
| #ff9b2d | Primary accent: logo, active states, focus glow, shadows (orange) |
| #ffb366 | Active nav item text (light orange) |
| #ffab4d / #f58857 / #f07847 | Orange gradient steps (CTA/hover) |
| #e92c42, rgba(234,50,65,.2) | Red accent (Donate heart, red background chip) |
| #f0e8dd | Warm cream: story titles, borders at alpha, `--title` |
| #fef0d7 / #fef1d7 | Warmer cream: UI text on glass, primary light button fill |
| #1a1209 | Dark brown text on cream button |
| #ffffff | Headings, nav text (.85-.95 alpha variants for body) |
| #4b4b4b | Neutral grey (secondary controls) |
| #1a1a1e | Dark panel (3 uses) |
| #f0d9a8 / #ff7c01 / #ff4646 | Rare: gold, deep orange, error red |
| Teal-blue gradient `linear-gradient(360deg,#2496b7 0%,#095985 100%)` | Broadcast/tutorial cards (the one cool colour; used as contrast notification) |

Overlay and text opacities: white text .95/.85/.72/.65/.5/.35; borders white .08/.12/.15/.18/.2/.25; cream borders rgba(240,232,221,.22) panels, .32 chips, .2 dismiss; scrims rgba(0,0,0,.15/.23/.38/.4/.5/.58). Card image overlay: `linear-gradient(0deg, rgba(10,14,20,.95) 0%, .7 30%, .3 60%, rgba(0,0,0,0))`. Footer: `radial-gradient(100% 70% at 50% 0%, rgba(255,155,45,.1) 0%, rgba(255,130,50,.04) 40%, transparent 65%)` over #0a0e14.

## 3. Glassmorphism (measured)

Blur values used across both CSS files: 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 28px; saturate 1.2 or 1.3 added on the heavier panels.

| Element | backdrop-filter | Background | Border | Radius | Shadow |
|---|---|---|---|---|---|
| Story splash panel (`.splash-top`) | blur(12px) | rgba(0,0,0,.38) | 1px solid rgba(240,232,221,.22) | 20px | none; padding 24px 48px 22px |
| Liquid-glass pill (loading bar, round buttons) | blur(12px) saturate(1.3) (round btn: blur(10px) saturate(1.3)) | `linear-gradient(135deg, rgba(255,255,255,.14) 0%, rgba(240,232,221,.08) 40%, ...)` | 1px solid rgba(240,232,221,.22) | 30px (round: 50%) | `0 0 30px 4px rgba(240,232,221,.10), 0 0 60px 8px rgba(240,232,221,.04), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.08)` |
| Small hint pill / tooltips | blur(5px) saturate(1.2) | rgba(255,255,255,.06) | 1px solid rgba(255,255,255,.08) | 30px | `0 2px 16px rgba(0,0,0,.15)`; text #fef1d7 14px, padding 6px 12px |
| Chip / action link | blur(12px) saturate(1.3) | rgba(0,0,0,.58) | 1px solid rgba(240,232,221,.32) | 24px | `0 1px 12px rgba(0,0,0,.4)`; 12px/600, padding 8px 16px |
| Tutorial/broadcast card (blue) | blur(28px) saturate(1.3) | teal gradient above | none | 20px | `0 16px 64px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04)`; padding 36px 28px 20px |
| Broadcast banner | blur(14px) saturate(1.3) | teal gradient | none | 20px | `0 0 20px 2px rgba(240,232,221,.1), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.08)` |
| Nav pills (search, donate) | none / blur(12px) | rgba(255,255,255,.15) | none | 30px | none; height 32px, padding 0 14-18px |
| Partner tooltip | blur(12px) | rgba(0,0,0,.23) | none | 30px | none |
| Voice overlay | blur(6px) | rgba(0,0,0,.15), full-bleed | none | 0 | none; opacity .6s cubic-bezier(.16,1,.3,1) |
| Home cards | none | rgba(20,26,36,.6) | none | 14px | `0 8px 32px rgba(0,0,0,.35)`; active: `0 16px 48px rgba(0,0,0,.5), 0 0 24px rgba(255,155,45,.2), 0 0 48px rgba(255,155,45,.1)` |

Recurring recipe: 1px cream hairline at ~.22 alpha + inset top highlight (white .15-.18) + inset bottom shade (black .08) + soft cream outer glow. The inset pair is what reads as "glass edge".

Radius scale (frequency): 14px (cards), 30px / 999px (pills), 20px (panels), 18px, 12px, 50%, 8px, 10px, 24px.
Shadow scale: `0 2px 8px/.3`, `0 4px 24px/.3 + inset 0 1px rgba(255,255,255,.06)`, `0 8px 32px/.35`, `0 16px 48px/.5`, `0 16px 64px/.5`. Orange button glows: `0 4px 16px rgba(255,155,45,.4)`, hover `0 6px 24px rgba(255,155,45,.5)`.

## 4. Layout and motion

- **Layout**: full-bleed, no page container. Nav `padding:24px 48px`, height 83px, transparent over media; logo left, pill cluster right (search 200x32, Donate, "Make a Tapestry", then a segmented Home/Map/Library/Education group at 12px). Horizontal gutter is 48px everywhere (`padding:0 48px` x5). Gap scale: 4, 6, 8, 10, 12 (most common), 14, 16, 20; inner card padding 20px; panel padding 24/48.
- **Home hero ("triptych")**: flex row, gap 16px, three cards 14px radius, base `flex:1`, hovered/active `flex:3` with `transition: flex .6s cubic-bezier(.25,.1,.25,1)`. Each card = webp still + muted looping `<video>` (opacity crossfade .4s) + bottom gradient overlay + text block that translates (.4s). Left column is tagline text (H1 + paragraph). Below: "portrait cards" rail of video-backed cards (~150 portrait videos in DOM), a "Featured Experiences" section with orange diamond bullet.
- **Story page**: a single full-viewport three.js `<canvas>` (2048x1536 at 1024x768 viewport, i.e. 2x DPR) is the page; every UI element is absolutely positioned glass on top. Splash: eyebrow (site name, tracked caps), 46px title, 32px-ish subtitle, 14px paragraph, meta line, segmented language toggle, then pill "LOADING..." bar that fills as an in-place liquid-glass progress. Background during load is a hero still, scrim and vignette (radial dark corners: top-left and right edges visibly darker in screenshot).
- **Transitions** (most used): `.3s ease` (55x), `.25s ease` (53x), `.2s ease` (36x), `.4s ease` opacity (fades), `.6s ease` opacity+transform (reveals), `.8s ease-in-out` opacity (section fades), `transform 5s ease-in-out` (slow Ken-Burns on card media). Custom easings: `cubic-bezier(0.16,1,0.3,1)` (expo-out; buttons, overlays, `.3s`/`.6s`), `cubic-bezier(0.22,1,0.36,1)` (420ms panel moves), `cubic-bezier(0.25,0.1,0.25,1)` (flex expand), `(0.33,1,0.68,1)`, `(0.25,0.46,0.45,0.94)`, overshoot `(0.34,1.56,0.64,1)` (pop-in). Pulses: `3.5s ease-in-out infinite`, `1.6s infinite`.
- **Hover**: buttons lift via transform + stronger orange shadow (`transform .2s, box-shadow .2s, filter .2s`); round glass buttons `transform .3s expo-out`, border-color and glow shift; nav items color `.15s`; cards grow flex and gain orange glow.
- **Scroll**: native, `scroll-behavior:smooth` (reduced to auto under `prefers-reduced-motion`, 3 media queries present). No Lenis/GSAP/snap found.
- **Cursor**: `pointer` on interactive elements (74/49 rules), `default` elsewhere; no custom cursor.
- **Libraries detected**: three.js (bundled, global `__THREE__`; `tjs_index.*.js` 587KB with GLTFLoader, DRACOLoader, KTX2Loader, MeshoptDecoder), Cesium (string hits in bundle, likely the Map page), video.js 8.10.0 (CDN), animate.css 4.1.1 (CDN), Google Tag Manager. Assets served from Azure Front Door (`*.azurefd.net`), webp stills at 1080x608 / 1280x720, video cards. Build via esbuild-style hashed chunks (`script.TIUVCZYU.js`, `chunk.*.js`). No GSAP, Lenis, Framer, Mapbox, Potree detected.

## 5. Five things that make it feel premium

1. **Warm-tinted neutrals on near-black navy**: titles #f0e8dd, UI text #fef0d7, body at hsla(35,39%,90%,.65), over #0a0e14. Never pure grey; cream hairlines (.22 alpha) rather than white.
2. **One accent, used sparingly as light, not paint**: #ff9b2d appears as glows (`0 0 24px/48px` at .2/.1), active text (#ffb366), and a faint radial in the footer, not as big fills.
3. **Liquid-glass edge detail**: 135deg gradient fill + saturate(1.3) with a pair of inset highlights (top white .18, bottom black .08) and a stacked cream outer glow. Reads as thick glass, not a flat translucent rectangle.
4. **The media is the page**: full-bleed 3D canvas / looping video behind everything; UI is small pills (12-14px type, 30px radius) so the content stays dominant. Hero cards accordion open (flex 1 -> 3, .6s) and crossfade still-to-video.
5. **Disciplined type and motion**: one family, tight scale (11/12/13/14/20/32/46), negative tracking on large titles (-0.02em), tracked uppercase 11px micro-labels, and expo-out easings (`.16,1,.3,1`) at short durations with long slow ambient motion (5s ken-burns, 3.5s pulses).

## Screenshots (described, for reference)
- Home (400x300 half-scale at 1024 wide): dark navy page, pill nav top (logo left in orange/red mark + "TAPESTRY" wordmark; search pill, Donate pill with red heart, "Make a Tapestry", segmented Home/Map/Library/Education with Home in orange). Left column H1 "Every Place Has a Story" + paragraph; three tall rounded photo cards (Petra, a brick colonial house, Mesa Verde cliffs) with white bottom-left titles over dark gradient; teal-blue rounded notification card bottom-right with cream "SIGN UP" pill; "Featured Experiences" row with orange diamond below.
- Story page splash (800x600): full-bleed warm sandstone photo of Ad-Deir with dark vignette; centred frosted dark-glass panel (20px radius, cream hairline) holding small tracked-caps location line, large white 46px two-line title, lighter subtitle, paragraph, meta line and a two-segment language pill (active segment cream-tinted); below a wide glass pill "LOADING..." with a lighter filled progress knob; bottom-right partner logos; teal tutorial card top-centre; logo top-left.
- Browser tab drifted to a YouTube link at the end of the session (unrelated; no state changed).
