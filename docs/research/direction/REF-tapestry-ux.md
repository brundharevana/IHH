# REF: CyArk Tapestry "George Wythe House", visitor walkthrough (UX)

- Reference page: https://tapestry.cyark.org/content/george-wythe-house (chosen by the user as THE design reference)
- Date of walkthrough: 2026-10-09
- Method: in-app browser, own tab, desktop viewport then mobile preset (reset afterwards); screenshots, accessibility tree, computed styles, and the inline content manifest read with page JS to enumerate every scene, voice and highlight. No login, no forms, no media downloaded. Images in `spikes/ref-tapestry-NN-*.webp` are internal analysis only.
- Companion: `REF-tapestry-tech.md` (engineering teardown). This file is the visitor view.
- Rights: CyArk content is "All rights reserved". Nothing here is to be copied into our product; titles are quoted only to identify items. Notes text is described by structure and length, not reproduced.
- Status: complete. Stops 0-1 were watched on screen; stops 2-9, the end page and the mobile layout were verified through the live DOM and stylesheet because the host hid the browser pane (see the note at the top of section 2). Anything not seen is marked.

## 0. Content inventory (from the inline manifest, then verified visually below)

Read with page JS from `<script id="tapestry-data">` on 2026-10-09. Durations from media metadata (`preload="metadata"`, nothing saved). Caption statistics from the WebVTT sidecars (cue counts and lengths only; text not copied).

### 0.1 Tour header
| Field | Value |
|---|---|
| Title / location / tagline | "George Wythe House" / "Colonial Williamsburg, Virginia" / a one-line tagline (about 60 characters) |
| Headline (SEO) | one line, "Walk Through the Historic Home of ..." pattern |
| Snippet on splash | about 350 characters, truncated with an ellipsis on the splash card |
| Stated duration | 15 (minutes) |
| Published | "2026" (v5 manifest) |
| Languages | English only |
| Ambient bed | one MP3, 156.8 s loop |
| Donate call-to-action (end page) | title "Did you enjoy this tour?", one sentence, "Donate" button |
| Classroom broadcast banner | "Using Tapestry in the classroom? Sign up for our free Educators newsletter!" with Sign Up / Dismiss |
| Partners | Colonial Williamsburg Foundation, CyArk (logos) |
| Extra link | "Learn more at cyark.org" |
| About text (resources) | about 1,300 characters (series framing: America's 250th, three places, three periods, three perspectives) |

### 0.2 Stops, narration, voices, highlights

| Stop | Title (as in data) | Narration | VTT cues (avg chars / avg s) | Camera entry | Interactive | Voice clips | Highlights |
|---|---|---|---|---|---|---|---|
| 0 | Welcome to The George Wythe House (overview) | 47.0 s | 16 (47 / 2.7) | fly-in | none | 3 intro clips (22.0, 12.9, 13.3 s), pulse cues at 25 / 31 / 37 s | 0 |
| 1 | Who was George Wythe? | 65.7 s | 18 (59 / 3.3) | instant cut | free explore, "Explore the Main Passage" | 3 | 3 |
| 2 | The Parlor | 40.5 s | 12 (55 / 3.2) | fly | standard | 3 | 4 |
| 3 | The Dining Room | 31.0 s | 10 (49 / 2.7) | fly | standard | 3 | 8 |
| 4 | The Back Chamber | 34.6 s | 12 (49 / 2.6) | fly | standard | 3 | 4 |
| 5 | Mr. Wythe's Office | 47.9 s | 13 (58 / 3.3) | fly | standard | 2 | 2 |
| 6 | The Kitchen Outbuilding | 79.0 s | 23 (52 / 2.9) | instant cut | standard | 3 | 1 |
| 7 | The Lumber Room | 49.6 s | 16 (49 / 2.7) | instant cut | standard | 2 | 5 |
| 8 | Mr. & Mrs. Wythe's Bed Chamber | 48.0 s | 15 (50 / 2.8) | instant cut | standard | 3 | 2 (+1 scene media item) |
| 9 | Labor of Many | 32.1 s | 9 (58 / 3.2) | instant cut | none | 3 | 0 |
| | **Totals** | **475 s (7.9 min)** | 144 cues, one line each, max 79 chars | | 8 | **25 clips, 1,395 s (23.2 min)** | **29** |

Every narration VTT is one line per cue, 68-79 characters maximum, 2.6-3.3 s per cue: a caption is a short phrase that changes roughly every 3 seconds.

### 0.3 The three voices
| Order | Name | Title as shown | Bio | Intro clip | Clips | Pulse delay field |
|---|---|---|---|---|---|---|
| 1 | Robert Weathers | George Wythe Nation Builder (a first-person interpreter in period dress) | about 460 chars | 22.0 s | 9 (one per stop 1-9) | 38 |
| 2 | Caitlin Simpson | Supervisor in Historic Interpretation | about 480 chars | 12.9 s | 7 (none in stops 5 and 7) | 39 |
| 3 | Grahame Long | Former Executive Director, Collections Operations and Historic Interiors | empty | 13.3 s | 9 | 40 |

Clip topics ("bubble text", shown on the voice button) per stop:
| Stop | Robert Weathers | Caitlin Simpson | Grahame Long |
|---|---|---|---|
| 1 | Who was George Wythe? (59.9 s) | Who lived in on the property? (33.6 s) [sic] | What is Colonial Williamsburg? (44.5 s) |
| 2 | Visitors of the George Wythe House (41.0 s) | A space for entertainment (57.0 s) | Decorating the George Wythe House (85.9 s) |
| 3 | Society for Promotion of Useful Knowledge (52.8 s) | Managing an 18th-century dinner (44.8 s) | A multipurpose space (73.2 s) |
| 4 | A changing perspective (38.7 s) | Elizabeth Wythe's responsibilities (77.1 s) | A room of importance (70.2 s) |
| 5 | Ways of becoming a lawyer (98.0 s) | (none) | A deeply curious individual (63.2 s) |
| 6 | George Wythe's murder (16.7 s) | Who was Lydia Broadnax? (72.2 s) | Importance of the outbuildings (31.3 s) |
| 7 | A legacy of students (53.7 s) | (none) | Storage room and classroom (38.1 s) |
| 8 | After moving to Richmond (46.6 s) | Mr. and Mrs. Wythe's relationship (37.8 s) | Headquarters for Colonial Williamsburg (61.2 s) |
| 9 | Many people made change possible (92.7 s) | Importance of 18th-century education (58.0 s) | Importance of preservation (46.4 s) |

All 25 clips are 1280x720 MP4 with an English VTT.

### 0.4 The 29 highlights (hotspots), by stop and order
Notes length = characters of the popup text with tags stripped; every note is a single paragraph. Image sizes are natural pixel sizes measured in the page (long edge 720-1080 px; single size, no responsive variants). Thumbnails are all 256x256.

| Stop | # | Title | Media | Notes (chars) | Credit line | Alt text in data |
|---|---|---|---|---|---|---|
| 1 | 1 | Wallpaper | image 1080x720 | 234 | none | yes (188 chars) |
| 1 | 2 | Mirror Coverings | image 1080x744 | 167 | none | no |
| 1 | 3 | Barriers | image 1080x786 | 132 | none | yes (202 chars) |
| 2 | 1 | Governor's Musik Group | **video 1280x720, 157.1 s**, no captions | 371 | none | no |
| 2 | 2 | Solar Microscope | image 1078x720 | 298 | none | no |
| 2 | 3 | Card Table | image 720x900 | 206 | none | no |
| 2 | 4 | Wallpaper | image 1080x720 | 264 | none | no |
| 3 | 1 | Solar System | image 1080x720 | 137 | none | no |
| 3 | 2 | Telescope Letter | image 689x1080 | 149 | yes (a special collections library) | no |
| 3 | 3 | Bowfat | image 720x900 | 153 | none | no |
| 3 | 4 | Wallpaper | image 576x720 | 257 | none | no |
| 3 | 5 | Floor Cloth | image 1080x1023 | 153 | none | no |
| 3 | 6 | Coal Grate | image 1080x806 | 194 | none | no |
| 3 | 7 | Map | image 1080x755 | 245 | none | no |
| 3 | 8 | Prints | image 1080x745 | 277 | none | no |
| 4 | 1 | Window View | image 720x900 | 135 | none | no |
| 4 | 2 | Desk | image 1080x720 | 207 | none | no |
| 4 | 3 | Wallpaper | image 576x720 | 162 | none | no |
| 4 | 4 | Mosquito Net | image 1080x1080 | 181 | none | no |
| 5 | 1 | Library | image 1080x720 | 188 | none | no |
| 5 | 2 | Scientific Specimens | image 1080x720 | 209 | none | no |
| 6 | 1 | Bed Chamber | image 1080x608 | 197 | none | no |
| 7 | 1 | Microscope | image 720x900 | 199 | none | no |
| 7 | 2 | Solar Microscope | image 720x900 | 298 | none | no |
| 7 | 3 | Declaration of Independence | image 1080x720 | 218 | none | no |
| 7 | 4 | Straw Pallet | image 1080x720 | 179 | none | no |
| 7 | 5 | Fry-Jefferson Map | image 1080x629 | 252 | none | no |
| 8 | 1 | Adjustable Shutters | image 720x900 | 210 | none | no |
| 8 | 2 | Wallpaper | image 805x1080 | 242 | none | no |

Extra scene media item (not a highlight): stop 8 "The Frenchman's Map", image with a one-sentence caption (about 170 chars), a library credit and full alt text.

Observations from the data alone: notes are short (132-371 characters, about 25-65 words, one paragraph); only 1 of 29 highlights carries a credit line; 2 of 29 have alt text; "Wallpaper" recurs in five rooms; the same "Solar Microscope" text (298 chars) appears in two rooms.

## 1. Entry: splash, Start, sound, onboarding

Images: `01-splash-desktop`, `01b-splash-narrow`, `02-overview-flyin`, `03-expert-intro-blur`, `04-overview-voices-row-hover`, `06-help-tour-step1`, `06b-help-tour-spotlight-transport`.

**What loads first (splash, URL `/content/george-wythe-house`).**
- Full-bleed photograph of the house from the garden (alt text present), with the brand wordmark top-left, an "Explore Tapestry Library" link with a stack of small tour thumbnails bottom-left (opens the library in a new tab), and the two partner logos bottom-right.
- A centred frosted card: location eyebrow in spaced capitals (9 px, 2 px tracking), the title as the page's only `h1` (Poppins 46 px / weight 500, white), a one-line tagline (16 px, 80% white), a 3-line clamped snippet (15 px, 82% white) ending in an ellipsis, and a meta line "Published: 2026 (v5) · Additional Resources" (the link opens an About page in a new tab).
- Below the card, a wide pill button. While the first 3D set streams it reads "LOADING..." and fills like a progress bar; when ready the label changes to "START" (12 px, weight 600, 2 px tracking, cream `#FEF0D7`). It is a `div role="button" tabindex="0" aria-label="Start Experience"`, the label is an `aria-live="polite"` region. Hover brightens the pill border.
- A dismissible classroom banner floats top-centre (teal glass card; "Sign Up" cream pill, "Dismiss" outline pill). It disappears on its own when Start is pressed.
- The transport bar and icon buttons already exist in the DOM under the splash.
- No cookie or consent banner appeared.

**Start interaction (timed on this run).**
- Click Start: URL changes to `/s0` immediately (history replace), the splash fades out over about 1-2 s and a thin loading bar runs along the top edge for about 1 s.
- The overview narration (47 s) starts by itself at full volume, and an ambient bed (157 s loop; its content was not listened to in this session) starts at volume 0.75 under it. Nothing is muted by default; Start is the user gesture that unlocks audio.
- The camera opens high above the property (aerial, trees and outbuildings visible) and descends continuously during the narration to finish on a frontal, slightly elevated view of the facade at the end of the narration (`02-overview-flyin` early frame; final frame in `04`). There is no separate cut; it is one slow, eased move timed to the audio.
- Title "Welcome to The George Wythe House" sits top-centre (no card, text on the scene with a thin rule under it) with a 2-line truncated description under it.
- Captions are on by default: one line in a dark rounded box at bottom-centre, changing about every 3 s.

**Voices reveal (overview).** At narration seconds 38, 39 and 40 the scene blurs (a full-screen blur overlay) and three large rounded-square headshots appear one at a time in the centre with names under them, each with a short "heartbeat" pulse (animate.css `heartBeat`) (`03-expert-intro-blur`). At about 42.5 s the blur lifts and the three headshots settle into a compact row just above the transport bar (about 65 px squares, rounded corners, thin light border), where they stay (`04`). Hovering a headshot enlarges it slightly and shows a dark label above the row with name (bold) and job title.

**End of the overview narration (47 s).** The caption box disappears; the soft "cinematic bars" (40 px black-50%-to-transparent gradients along the top and bottom edges, shown while narration plays) fade out over 0.5 s; skip-back/forward 15 and play buttons dim to 50%; the right-hand "skip" button turns into a solid white Next button with a pulsing ring (`ping`) inviting the visitor onward. The tour does not auto-advance.

**Onboarding.** No tutorial is forced on first visit. A "?" button (Tutorial) at the left end of the bottom bar opens a 6-step guided tour: a centred welcome card, then a spotlight cut-out over each UI zone with a card beside it, step dots, Previous / Next, close "x", and "Done" on the last step. Steps (paraphrased): 1 Welcome; 2 Navigation (spotlights the transport bar: arrows move between stops, centre button plays/pauses narration); 3 Title & Description (spotlights the top title block); 4 Scene Timeline (spotlights the left numbered rail; click any number to jump); 5 Stories & Media (spotlights the voice/thumbnail row above the bar); 6 Dive Deeper (spotlights a top-right button that appears when a stop has an interactive mode). Card: teal gradient, white Poppins, rounded corners.

**Sound defaults summary.** Narration on, ambient on (0.75), a short "whoosh" (volume 0.2) is wired to transitions, captions on. One Mute button in the bar mutes everything.

## 1b. Persistent chrome on every stop

| Zone | What is there |
|---|---|
| Top-centre | Stop title (`h1`-reset, Poppins 32 px / weight 400 / line-height 34 px, warm cream `#F0E8DD`), thin rule, 2-line clamped description (Poppins 12 px / weight 300 / 18 px). No card behind it. |
| Left edge | Vertical scene rail: home icon (overview), numbers 1-9, flag icon (end page). Current stop highlighted. Hover shows the stop name in a dark tab to the right of the number (`02b-rail-hover-label`). |
| Bottom-centre | Caption box (Poppins 13 px white, 25 px side padding, 10 px radius, dark translucent) above a 512 px wide, 1 px progress line (cream fill with a soft glow) with elapsed / total time labels that show on hover. |
| Bottom bar, left group | Tutorial "?", Resources (book), Share, Settings (gear): 32 px dark round buttons. |
| Bottom bar, centre group | Previous/Restart, back 15 s, Play/Pause, forward 15 s, Skip/Next: 40 px dark rounded-square buttons; prev/next have asymmetric corner radii so the group reads as one capsule. |
| Bottom bar, right group | Mute, Closed captions toggle, Fullscreen: 32 px round. |
| Above the bar | The voices row (headshots) and, in stops with highlights, the numbered thumbnail row. |
| Bottom-left corner | Small brand mark (link). |
| Top-right | "Dive Deeper"/interactive entry button in stops that have one (see scenes). |

**Side panels reachable from the bar (all overlays on a blurred, dimmed scene):**
- Resources (`07`, `07b`): a centred scrolling glass panel (about 680x720 px) titled "Resources" with the tour name, an in-panel tab row (About, Gallery, Additional Resources, Related Links, Partners, Credits) that jumps to anchors, then: About (a paragraph framing the series: three places, three periods, three perspectives); Gallery (large image, prev/next arrows, title, caption, then a two-row strip of 31 thumbnails: the one scene media item plus all 29 highlights, so every object in the tour can be browsed here without visiting the rooms); Additional Resources ("About this Experience" and "Transcripts" links, new tab); Related Links; Partners (logos); Credits (a thank-you paragraph naming the site staff, the three interviewees and the music ensemble). Observed bug: after choosing another gallery thumbnail the arrow-bar title stays "The Frenchman's Map" while the image and caption change, and the active-thumbnail outline stays on the first item.
- Settings (`08`): font size Standard / Larger; theme Default / High Contrast (preview cards show high contrast puts solid black boxes behind text and buttons); links to the Accessibility Statement and the Content Use & Embedding Policy. No motion, language or caption-style options here.
- Share: small dialog with the current stop's title, a read-only URL field and a COPY button. Deep links exist for every stop, voice clip and media item.

## 2. The stops, one by one

**Rendering limit hit mid-walkthrough.** After stop 1's voice clip opened, the host hid the browser pane; the page stopped compositing (`document.hidden = true`) and every further screenshot timed out, exactly as in the tech teardown. From that point on, observations come from the live DOM (what each click inserts, sizes, computed styles, timings of class changes) and the manifest, not from pixels. Camera flights cannot be seen while hidden; their parameters come from the teardown (GSAP tween, 2 s, `power1.out`). Items verified only through DOM are marked "(DOM)".

### Common stop pattern (observed on stops 0 and 1, and in the DOM for 2-9)
1. Click Next / a rail number: a soft "whoosh" plays, the title block fades, and either the camera flies within the same 3D set, or (different set, e.g. overview to stop 1) the screen goes black with a centred "LOADING" label and a thin cream progress bar (`09-set-swap-loading-black`); on a warm cache this took about 1.9 s.
2. Narration starts by itself; captions on; soft top/bottom gradient bars on; the camera drifts slowly along a scripted path for the whole narration (stop 1: a slow pan from the staircase across the blue-papered passage to the open parlour door, `10`, `11`).
3. While narration plays, the voices row and the highlight thumbnails are hidden (opacity 0). The "skip" button shows a tooltip "SKIP VOICEOVER".
4. At narration end, all at once: captions hide; the gradient bars fade; the three voice headshots appear in the row above the bar; Next becomes solid white with a ping ring; back/forward 15 s dim; a centred "Drag to Look Around" hint with a hand icon appears; and, in stops with an interactive, a glowing round button appears in the top-right corner with a label ("Explore in 3D" in stop 1) (`11`).
5. Nothing auto-advances; the visitor chooses a voice, the interactive, or Next.

### Stop 0, Welcome to The George Wythe House (overview)
- Set: exterior aerial capture. Camera: one continuous descent from high aerial to a frontal view of the facade, timed to the 47 s narration (`02`, `04`).
- Narration: 47 s, 16 caption cues.
- Voices: introduced here (blur + three large headshots popping in at 38/39/40 s, then settling into the row) (`03`, `04`). Each opens an intro clip (22.0 / 12.9 / 13.3 s), panel titled "Meet <name>" with job title in italics (see section 3).
- No highlights, no interactive.

### Stop 1, Who was George Wythe? (the Main Passage)
- Entry: different set (interior "downstairs"), so a black LOADING cut; `instant_move` (no fly-in).
- Camera: slow scripted pan across the passage (stair, wallpaper, parlour door) for 65.7 s of narration. Drag-to-look is enabled after narration (hint shown). One run saw the narration pause on its own at 18.6 s with the top loading bar flashing (likely buffering; not reproduced).
- Narration: 65.7 s, 18 cues.
- Voices: Robert Weathers "Who was George Wythe?", Caitlin Simpson "Who lived in on the property?", Grahame Long "What is Colonial Williamsburg?". Hover enlarges the headshot and shows the topic as a dark speech-bubble label above it (`12`).
- Interactive: **free explore**, entered from the top-right "Explore in 3D" corner button (round, glowing, with a lens icon, a light-ray glow PNG, a "shine" sweep and a footsteps motif; `aria-label` "Explore Area in 3D"). URL becomes `/s1/int`. On entry (DOM): the stop title, transport bar, scene rail, voices and media strip all hide; a frosted panel (320 px wide, full height, right edge, `backdrop-filter: blur(24px) saturate(1.4)`, rounded left edge) shows the title "Explore the Main Passage" (20 px / 500) and a one-sentence instruction naming the three things to find (14 px); a collapse button sits on its left edge; an exit button sits bottom-centre; a top-right "Exit 3D Mode" corner button (71 px) replaces the explore button. Movement is WASD + mouse on desktop and an on-screen joystick on touch (joystick tooltip markup present). An orb tracker (circles + "n/n" count + "ALL FOUND") sits in the UI.
- Highlights (3): Wallpaper, Mirror Coverings, Barriers. In this stop they are **not thumbnails**: they are three glowing orbs placed at 3D positions along the passage (`orb_position` set only for these three of the 29), found by walking up to them; each opens the same info panel (title, image, notes). Not triggered in this session (rendering paused), so the find/open animation was not seen. Notes 234 / 167 / 132 chars; images 1080x720, 1080x744, 1080x786; two of the three have alt text (the only highlights in the tour that do).

### The standard interactive ("Dive Deeper"), verified on stops 2-8 (DOM)
How the stops 2-8 data below was gathered: the pane stayed hidden, so a second tab was driven by page JS (narration played muted and was seeked to its last half-second to reach the end state, then the corner button and each numbered item were clicked in order and the panel DOM read 2-2.6 s later). Panel geometry is at a 1280x800 viewport.

**Entry.** At narration end the top-right corner button appears labelled "Dive Deeper" (stop 1 says "Explore in 3D"). Clicking it: URL gets `/int`; the stop title, scene rail, captions, voices row and the transport centre hide; the transport becomes two 42 px buttons, **Reset** (icon alt "Reposition the camera to the starting point") and **Exit** (icon alt "exit the playpen to go back to the tour"); the corner button becomes "Exit 3D Mode" (71 px round + 16 px/600 label); the right-hand info panel slides in titled "Explore" (no description); the numbered item row appears just above the bar.

**The numbered items (the highlight "buttons").** One row, centred above the bar, 4 px gaps, left/right scroll arrows only when the row overflows.
- Each item is a 50 px **circle**: the 256 px thumbnail photo cropped round, a 1 px cream border (`rgba(240,232,221,0.22)`), a glassy specular highlight (a blurred white ellipse at the top-left, rotated -15 deg) and a dark radial vignette behind a large centred number (Poppins 20 px / 600, cream `#F0E8DD`). The visible label is only the number; the full title is the `aria-label`.
- Hover (pointer devices): scale 1.15 and lift 4 px, brighter and more saturated, a cream glow ring, and a small dark label above with the title (10 px, black 60%, 8 px radius).
- Selected: `aria-pressed="true"`, scale 1.08, a 2 px near-opaque cream border with a glow.
- On a 768 px or narrower screen the hover enlargement and labels are switched off and the row scrolls sideways with faded edges instead of arrows.

**Click an item.** The camera flies to that object's stored viewpoint (2 s, `power1.out`, per the tech teardown; not seen here), the item turns selected, and the right panel fills:
- Panel: fixed to the right edge, full height, `width: 25vw` (300-420 px; 320 px at 1280), no fill colour, only a frosted backdrop (`blur(24px) saturate(1.4)`), with a large curved left edge (radius 12% / 50%). Content is centred vertically in a 236 px column; inner area scrolls when taller than the viewport minus 160 px (3 px cream scrollbar).
- Order inside: title (`h2`, Poppins 20 px / 500 / 28 px line, cream, soft drop shadow), then the media (image fitted to the 236 px column, height capped at 280 px; or a native `<video controls playsinline nodownload preload="metadata">` with a 16:9 box), then the notes (14 px / 20 px line, cream at 82%), then the credit line when present.
- Notes are clamped to 7 lines (`-webkit-line-clamp: 7`); **hovering the text unclamps it** (no Read more button on desktop; a "Tap to read more" variant exists for touch). The notes longer than about 7 lines at this width were cut until hover: Wallpaper (stop 3), Map, Prints, Desk, Solar Microscope (stop 7), Fry-Jefferson Map, Wallpaper (stop 8).
- Image hover dims it to 60% and shows an expand icon; clicking opens the full-size image in the shared full-screen popup.
- Credit line: "Credit: ..." under the notes (only Telescope Letter has one).
- Alt text: every image here rendered with `alt="null"` (the literal string), because the data field is empty.
- A collapse tab on the panel's left edge (40 px) slides the panel off-screen to a 36 px sliver (with a short "nudge" animation) so the visitor can see the object unobstructed.
- Reset: flies back to the interactive's start view and clears the selection (all `aria-pressed=false`) but keeps the last item's text in the panel. Exit: returns to the stop's end state (rail, voices, corner button back), URL back to `/s<N>`.
- Switching items does not close the panel; it just re-fills. There is no next/previous inside the panel; the numbered row is the navigation.

### Stop 2, The Parlor
- Same downstairs set as stop 1, so a camera flight (no black loading cut). Narration 40.5 s, 12 cues.
- Voices: "Visitors of the George Wythe House" (Robert), "A space for entertainment" (Caitlin), "Decorating the George Wythe House" (Grahame).
- Items (4), as observed: 1 Governor's Musik Group: the tour's only **video** highlight, native player in the panel (157 s, poster none, a captions track element present but with no cues), notes 371 chars, clamped; 2 Solar Microscope: image, notes 298 chars; 3 Card Table: portrait image (shown 236 px wide), 206 chars; 4 Wallpaper: image, 264 chars. No credits.

### Stop 3, The Dining Room
- Narration 31.0 s, 10 cues (the shortest narration but the most items).
- Voices: "Society for Promotion of Useful Knowledge", "Managing an 18th-century dinner", "A multipurpose space".
- Items (8): 1 Solar System (img 236x157, 6 lines); 2 Telescope Letter (portrait 236x280, 7 lines, **credit line to a special-collections library**); 3 Bowfat (236x280, 6); 4 Wallpaper (236x280, clamped); 5 Floor Cloth (236x224, 6); 6 Coal Grate (236x176, 7); 7 Map (236x165, clamped); 8 Prints (236x163, clamped). Eight circles fit in one row without arrows at 1280 px.

### Stop 4, The Back Chamber
- Narration 34.6 s, 12 cues. Voices: "A changing perspective", "Elizabeth Wythe's responsibilities", "A room of importance".
- Items (4): 1 Window View (portrait 236x280); 2 Desk (236x157, clamped); 3 Wallpaper (236x280); 4 Mosquito Net (square 236x236).

### Stop 5, Mr. Wythe's Office
- Narration 47.9 s, 13 cues. Voices: two only, "Ways of becoming a lawyer" (Robert) and "A deeply curious individual" (Grahame). Observed bug: the Grahame headshot button's `aria-label` names Caitlin Simpson (the slot logic shifts names when a voice is missing); the topic bubble truncates at 25 characters plus "...".
- Items (2): 1 Library (236x157); 2 Scientific Specimens (236x157).

### Stop 6, The Kitchen Outbuilding
- Different set (kitchen), so a black LOADING cut; `instant_move`. Narration 79.0 s, 23 cues (the longest).
- Voices: "George Wythe's murder" (Robert, the shortest clip, 16.7 s), "Who was Lydia Broadnax?" (Caitlin), "Importance of the outbuildings" (Grahame).
- Items (1): Bed Chamber (landscape 236x133). A one-item row still uses the full interactive mode.

### Stop 7, The Lumber Room
- Different set (upstairs): black LOADING cut. Narration 49.6 s, 16 cues.
- Voices: two, "A legacy of students" (Robert) and "Storage room and classroom" (Grahame headshot; `aria-label` again wrongly says Caitlin Simpson).
- Items (5): 1 Microscope (portrait); 2 Solar Microscope (portrait, same notes as the stop 2 item, clamped); 3 Declaration of Independence (236x157); 4 Straw Pallet (236x157); 5 Fry-Jefferson Map (236x137, clamped).

### Stop 8, Mr. & Mrs. Wythe's Bed Chamber
- Same upstairs set. Narration 48.0 s, 15 cues.
- Voices: "After moving to Richmond", "Mr. and Mrs. Wythe's relationship", "Headquarters for Colonial Williamsburg".
- **Scene media item**: a fourth round button after the three headshots in the row ("Open media item The Frenchman's Map"); opens a full-screen lightbox (URL `/s8/mm1`): the image about 1000x600 px centred, a credit line directly under it in tiny italic (8 px), then title (15 px / 500) and a one-sentence caption (14 px), centred.
- Items (2): 1 Adjustable Shutters (portrait); 2 Wallpaper (portrait, clamped).

### Stop 9, Labor of Many
- Exterior set again (black LOADING cut). Narration 32.1 s, 9 cues. No interactive and no items: the stop exists for the closing narration and the three voices' conclusions ("Many people made change possible" 92.7 s, "Importance of 18th-century education" 58.0 s, "Importance of preservation" 46.4 s).
- (Not rendered in this session: the hidden-pane tab could not complete the set swap.)

### End page (flag icon at the bottom of the rail; DOM only)
A "bento" grid of three cards: "Want to Explore More?" with four other tours as image cards (each opens in a new tab); "Did you enjoy this tour?" with one sentence and a Donate button; "Take our Survey!" with one line and a Take Survey button (the survey also exists as a dismissible bottom bar). Reduced-motion collapses the card reveal transitions.

## 3. The three voices (interview clips)

- **Where**: a row of up to three 50-65 px rounded-square headshot buttons centred above the transport bar, on every stop including the overview. Hidden while narration plays; appear when it ends (on the overview they are introduced earlier, at 38-40 s, with the blur-and-pop reveal).
- **Hover**: the headshot grows; on the overview a dark label shows name + job title; on stops 1-9 a dark speech-bubble label shows the clip topic (truncated at 25 characters + "..."). Accessible name: overview "Listen <name> talk about" (topic empty), stops "Open voice video from <name> titled <topic>".
- **Click**: URL becomes `/s<N>/v<M>`; a full-screen overlay blurs and darkens the scene (`blur(16px) saturate(1.2)` over black 55%); a 16:9 Video.js player (about 880x495 at 1280x800, 12 px radius) is centred near the top; Share and Close (x) round glass buttons sit top-right; focus moves to Close.
- **Under the video** (left-aligned to the video edge): overview intros show "Meet <name>" (15 px / 500) and the job title in italic (11 px); stop clips show the topic as the heading (16 px / 500) with name (12 px / 500) and italic job title (11 px).
- **Captions**: on by default, rendered by the page (not Video.js's own overlay) in a pill directly below the video (white 15 px on black 70%, 22 px radius, centred, overlapping the title area), one line at a time, changing about every 3 s (`05`).
- **Controls**: Video.js bar (play/pause, mute, progress, remaining time, picture-in-picture, fullscreen) that auto-hides while playing. (Whether the ambient bed ducks or pauses during a clip was not verified; narration had already ended.)
- **End of clip** (verified on the overview intro): the player stops on a black frame with a replay icon, the title text disappears, the overlay stays open; nothing auto-advances to the next voice. Escape or x closes and returns focus to the headshot that opened it (verified on the overview).
- **Bios**: two of the three people have a bio of about 460-480 characters in the data, but no bio was shown anywhere in the clip panel; identity is carried by name, job title and the intro clip.
- **Lengths**: intros 13-22 s; topic clips 17-98 s (median about 53 s); 25 clips, 23.2 min in total, three times the narration time. A visitor who plays every clip spends most of the tour with the voices, not the narrator.

## 4. Navigation

- **Linear spine with free jumps.** Next/Previous in the transport move one stop; the left rail (home icon = overview, 1-9, flag = end page) jumps anywhere. Hovering a rail number shows the stop name (truncated at 20 characters + "...") in a dark tab. The current stop is highlighted. Rail items are `div role="button"` with `tabindex="-1"`, each with a full `aria-label` ("Go to scene 2: The Parlor").
- **Inside a stop**: Restart (left button turns into "Replay Scene" once narration has started), -15 s, Play/Pause, +15 s, Skip/Next (tooltip "SKIP VOICEOVER" during narration; becomes a white Next with a ping ring at the end). Hovering the bar shows the 1 px progress line with elapsed/total time.
- **Transitions**: same 3D set = camera flight with a soft whoosh; different set = black screen with "LOADING" and a cream progress bar (about 2 s warm); stops 1, 6, 7, 8, 9 are flagged `instant_move` (cut, no flight).
- **Progress**: only the rail highlight and the per-stop time line; there is no "x of 9" counter, no completion ticks on the rail, and nothing records which highlights or voices were already seen (except the free-explore orb counter in stop 1).
- **Order**: suggested linear, never enforced; deep links exist for every stop, voice, media item and interactive (`/s<N>`, `/v<M>`, `/mm<M>`, `/int`).
- **End**: the flag opens the end page (explore more tours, donate, survey). Next from stop 9 leads there.

## 5. Narrative design

- **Three layers per room, always in the same order**: (1) a short narrated orientation with a slow camera move (31-79 s); (2) once it ends, three human voices offer different angles on the same room (a costumed first-person interpreter speaking as George Wythe, a historic-interpretation supervisor, and a former collections/interiors director): character, daily life, and objects/curation; (3) an optional "Dive Deeper" mode with 1-8 numbered objects, each with a photo and a 25-65 word note.
- **The house is the timeline.** Stops follow rooms, not years; dates appear inside narration and notes ("built about 1755", "by the mid-1780s ... 17 enslaved people", a 1782 map). There is no visual timeline or date scale.
- **People**: the Wythes, students and guests, and the enslaved household (Lydia Broadnax is a named voice topic in the kitchen; the last stop "Labor of Many" turns the frame to the people whose work made the house run). Hard material (the murder, enslavement) is carried by the voices and narration, not by highlight text.
- **Voices are framed as topics, not as people**: the bubble shows a question or theme ("Who was Lydia Broadnax?", "Ways of becoming a lawyer"), which works as a hook; the person's name and title appear only under the video.
- **The overview teaches the grammar**: narration first, then the voices are introduced with a deliberate full-screen reveal so the visitor learns what the faces are before stop 1.
- **Sources**: framed lightly. One highlight credit line, one gallery/media credit, a Credits paragraph and partner logos in Resources, an "About this Experience" page and a Transcripts page (new tabs). Notes never cite a source inline.

## 6. Visual design

| Element | Value (computed) |
|---|---|
| Typeface | Poppins only (Google Fonts), weights 300/400/500/600 |
| Splash title | 46 px / 500, white; location eyebrow 9 px, 2 px tracking, uppercase |
| Stop title | 32 px / 400 / 34 px line, `#F0E8DD` |
| Stop description | 12 px / 300 / 18 px line, 2 lines clamped |
| Panel title / notes | 20 px / 500 and 14 px / 400 / 20 px line, notes at 82% cream |
| Captions | 13 px white (narration), 15 px white on black 70% pill (voice clips) |
| Highlight number | 20 px / 600 cream on a dark radial vignette |
| Key colours | cream `#F0E8DD` (`--title`), cream text at 65% (`--text` `hsla(35,39%,90%,0.65)`), start/broadcast cream `#FEF0D7`, button dark `#1C1B1A` at 80% (`rgba(28,27,26,0.8)`), stop-nav `#1C1B1A80`, hover `#302E2CE6`, accent orange `#FF9B2D` (fails contrast, per their statement), accent red `#EA3241` at 20%, near-black `#0A0E14` (skip link) |
| Surfaces | no opaque panels in the tour view: frosted glass (`backdrop-filter: blur(10-24px) saturate(1.2-1.4)`) over the live 3D scene; overlays blur the scene behind |
| Shapes | round 32 px icon buttons, 40 px rounded-square transport buttons forming one capsule (outer corners 13 px, inner 9 px), 50 px circular highlight items, rounded-square headshots, 22 px pill captions |
| Iconography | thin white line icons from a shared icon set (book, share, gear, speaker, CC, fullscreen, arrows, home, flag), a lens icon for explore |
| Layout | stage = full-bleed 3D; title top-centre; rail left edge; controls bottom-centre (about 532 px wide group); info panel right edge (25 vw); everything else overlays |
| Motion | slow scripted camera drift during narration; 2 s eased camera flights; 0.5 s fades for gradient bars; heartbeat pop for voice intro; ping ring on Next; scale/lift on hover; shine sweep and glow rays on the Explore button |
| Sound | narration (1.0), ambient loop (0.75), transition whoosh (0.2); clips pause the beds |

## 7. Credits, sources, credibility

- On the splash: partner logos (Colonial Williamsburg, CyArk), "Published: 2026 (v5)", "Additional Resources" (About page).
- In Resources: About (series framing), Gallery (all objects, with captions), Additional Resources (About this Experience, **Transcripts**), Related Links, Partners (logos, linked), Credits (thanks to site staff, the three interviewees by name, and the music ensemble).
- Per item: a credit line only where an archive owns the image (1 of 29 highlights; the scene media item). No dates or source citations on notes.
- The voices carry the authority: each clip is a named person with a job title on screen; the first-person interpreter is labelled with a role title rather than "actor".
- Settings links to an Accessibility Statement and a Content Use & Embedding Policy.

## 8. Mobile

Observed only partly: the pane was hidden for most of the session, so the mobile preset could not be rendered beyond the earlier narrow splash (`01b-splash-narrow`): the classroom banner stacks under a centred wordmark, the title card fills the width (title 36 px / 40 px line under 768 px), the Start pill is full-width, partner logos sit at the bottom.
From the stylesheet (not rendered) at 768 px and below: the top-right Explore and Exit corner buttons are hidden and an Explore button takes the place of the play/seek buttons in the transport centre once a stop is ready; highlight hover enlargement and labels are off; the item row and voice row scroll sideways with edge fades instead of arrows; voice hover labels are off; at 645 px and below the info panel widens to 65 vw with smaller type (title 16 px). Free explore uses an on-screen joystick (markup present). A `renderProfile=low` halves the splat budget on phones (tech teardown).

## 9. Accessibility

- Skip link ("Skip to main content", appears at the top on focus); `:focus-visible` = 2 px white outline, 2 px offset, plus a 2 px near-black halo, so focus is visible on any background.
- Start is a focusable `div role="button"` with an accessible name; transport and icon buttons are real buttons with names; highlight items are buttons with full-title names and `aria-pressed`.
- Rail items are `div role="button"` with `tabindex="-1"` (not in the tab order as observed).
- Captions on by default for narration and clips; a CC toggle in the bar; full transcripts on a separate page.
- Dialogs move focus to Close and restore it on Escape (verified on a voice clip); a live region announces "Scene N: <title>".
- Settings offer larger text and a high-contrast theme.
- Gaps observed: images in the highlight panel render `alt="null"`; the stop 5 and 7 voice labels name the wrong person; long notes are clamped and revealed only by mouse hover; the voice topic text is truncated; reduced-motion only shortens CSS animations and does not stop the camera moves; no transcript inside the clip panel.

## 10. Delights and frictions (with timings)

Delights:
- Start to first narrated motion in about 2 s (after the initial load); the overview's single descending camera move sets place before any UI asks for anything.
- The voices reveal at 38-40 s of the overview teaches the visitor who the three people are, then the faces stay as a calm, consistent row on every stop.
- Topic bubbles turn a face into a question worth clicking.
- Content is gated by narration end: the screen stays clean while the narrator talks, then everything appears at once with a ping on Next.
- Numbered circles plus a camera flight to the object make "which thing is this" unambiguous; the panel collapse lets you look at the object itself.
- The Resources gallery gives a second, non-spatial way to browse every object.

Frictions:
- Initial load is heavy (about 104 MB of 3D data before Start, per the tech teardown); set changes show a black LOADING screen (about 2 s warm, longer cold).
- Nothing in a stop is clickable until narration ends (31-79 s); the only way to reach voices or objects early is Skip.
- Notes are clamped to 7 lines with no visible "more" control on desktop; reading the rest needs a hover.
- Interaction depth is hidden behind a top-right corner button that appears only after narration; first-time visitors may not notice it.
- No progress memory: the visitor cannot see which voices or objects they already opened.
- Labelling bugs: gallery title stuck on the first item; wrong names on two voice buttons; `alt="null"`.
- Clip dialogs end on a black frame and need a manual close (seen on the overview intro).

## 11. Interaction pattern catalogue (rebuild spec)

1. **Splash gate.** Full-bleed hero photo, frosted centred card (eyebrow location, H1 title, tagline, 3-line snippet, meta line with "Published" and a resources link), one wide pill button that shows load progress as its fill and becomes "START" when the first scene is ready; Start is the audio-unlock gesture and replaces the URL with the first stop's.
2. **Narrated stop.** On entry: title fades in top-centre with a 2-line description; narration autoplays; captions one line at a time in a dark pill at bottom-centre; 40 px soft top/bottom gradient bars while narrating; the camera eases along one scripted move for the narration's length.
3. **Narration-end reveal.** On `ended`: hide captions and bars, show the voices row, show the interactive entry button, turn Next into a solid button with a ping ring, dim seek buttons, show a one-time "Drag to look around" hint. Never auto-advance.
4. **Transport capsule.** Five buttons: Restart (becomes Replay), -15 s, Play/Pause, +15 s, Skip (becomes Next). Left group: Help, Resources, Share, Settings. Right group: Mute, CC, Fullscreen. Progress line with times on hover.
5. **Scene rail.** Vertical list on the left edge: home, 1..N, flag. Current item highlighted; hover shows the truncated stop name; click jumps.
6. **Set-change cut.** When the next stop needs a different 3D asset, cut to black with "LOADING" and a thin progress bar, then fade in; otherwise fly the camera with a soft whoosh.
7. **Voices introduction.** At three timed points in the overview narration, blur the scene and pop three large headshots in one by one (heartbeat animation, names under), then settle them into the persistent row.
8. **Voice button.** Rounded-square headshot; hover enlarges and shows a topic bubble (or name + title on the overview); click opens the clip dialog; accessible name "Open voice video from <name> titled <topic>".
9. **Clip dialog.** Full-screen blurred/darkened backdrop; centred 16:9 video; captions pill under the video; heading = topic, then name and italic job title; Share and Close top-right; focus to Close; Escape closes and returns focus; stays open at the end with a replay icon.
10. **Interactive entry ("Dive Deeper").** A glowing round corner button that appears at narration end; click hides tour chrome, shows Reset and Exit, the numbered item row and the right info panel; the corner turns into "Exit 3D Mode".
11. **Numbered object row.** 50 px circular thumbnails with a big centred number, glass highlight and vignette; hover scales 1.15 with a title label; selected scales 1.08 with a bright ring and `aria-pressed`; arrows only on overflow; swipe on small screens.
12. **Fly-to-object + side panel.** Item click: 2 s eased camera flight to that object's stored view, then fill the right frosted panel: title, image (or native video), notes clamped to 7 lines (expand on hover/tap), credit line. Image click opens full-size. Panel collapses to a thin edge tab. Reset returns the camera and clears selection; Exit returns to the stop.
13. **Free-explore room.** A walkable box (WASD/mouse, joystick on touch) with glowing orbs at object positions and a found-counter; walking to an orb opens the same panel.
14. **Scene media chip.** A round thumbnail after the voices that opens a full-screen lightbox: image, tiny credit line, title, one-sentence caption.
15. **Guided help tour.** "?" opens a 6-step coach-mark sequence with a spotlight cut-out over each UI zone, dots, Previous/Next, Done.
16. **Resources sheet.** One scrolling panel with in-panel anchor tabs: About, Gallery (every object, with thumbnail strip), Additional Resources (About page, Transcripts), Related Links, Partners, Credits.
17. **Settings sheet.** Text size Standard/Larger; theme Default/High Contrast (solid black behind text); links to accessibility statement and content policy.
18. **Share sheet.** Current stop title, URL field, Copy; every stop, clip, media item and interactive has its own deep link.
19. **End page.** Three cards: explore other tours, donate, survey.

For our build (keep it simple): patterns 2, 3, 4, 5, 8, 9, 11, 12 and 16 carry the experience and map onto plain HTML, `<dialog>`, `<audio>`/`<video>` + WebVTT and a 360 viewer's `animate()`. Patterns 6, 7, 10 and 13 are optional polish. Fix their gaps rather than copy them: real alt text, a visible "more" control, a visited state on voices and objects, correct accessible names, and no camera motion under reduced-motion.
