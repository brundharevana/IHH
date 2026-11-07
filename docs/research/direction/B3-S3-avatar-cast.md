# B3-S3: 2D avatar cast and speaking UI (spike, batch 3)

Run date: 2026-10-08. Throwaway spike; measures, does not recommend. Everything below is labelled "illustrative reconstruction (spike)". Evidence tags: [P] my own measurement or probe on 2026-10-08 (method stated), [V] read on the holder's page or API, [J] my judgement (not tested on users), [U] not tested.

## 1. What was built

Folder: `Challenge IHH/spikes/s3-avatar/` (server was `python3 -m http.server 8703`, stopped; no commits; nothing installed or downloaded; no CDN libraries were needed).

| File | Purpose | Bytes |
|---|---|---|
| `gen.py` | Python-stdlib generator: shared rig + palette tokens + per-person part kits, L1 and L2, writes `characters/*.svg` and `manifest.json` | 29,221 |
| `characters/{guide,einstein,muir,lamarr,albright,naismith}-L{1,2}.svg` | 12 self-contained SVG rigs (9 mouths A-H and X, open/closed eyes, idle) | 4.3-8.7 KB each |
| `sheet.py`, `cast-sheet.html` | Static cast sheet (both levels, all six, mouth strips at 160 px head height) | 136,854 |
| `make_timeline.py`, `data/lines.json`, `data/captions.vtt` | Rule-based, hand-authored viseme timeline in Rhubarb `mouthCues` shape plus the WebVTT track | 8,686 / 517 |
| `index.html`, `demo.css`, `demo.js` | Speaking demo page (vanilla JS, no libraries) | 4,155 / 5,795 / 13,681 |
| `measure.py`, `bench.html`, `ax.py`, `shots.py` | Measurement tooling over the Chrome DevTools pipe (stdlib only) | small |

Images (all WebP, under 0.5 MB each):
- `Challenge IHH/docs/research/direction/spikes/s3-cast-sheet.webp` (2700x2153; both levels, six characters, two mouth strips)
- `.../spikes/s3-demo-desktop.webp` (1280x1056, guide L2, line 2, transcript open)
- `.../spikes/s3-demo-mobile.webp` (390x1093 at 2x, guide L2, line 1)
- `.../spikes/s3-demo-reduced-motion.webp` (1280x1057, Einstein L2, `prefers-reduced-motion` forced: static portrait, captions only)

### Design in one paragraph
One rig for all twelve files: a face path built from four numbers (half-width, jaw, chin width, chin height), a shared eye kit (open/closed pair), nine mouth shapes keyed to the Rhubarb alphabet, body and head layer groups, ink colour and palette tokens in `PAL`. L1 "iconic" = head, hair/hat silhouette, facial hair, glasses, clothing, dot eyes, no nose or brows, thicker outline. L2 "characterful" adds nose, brows, lids and bags, wrinkles, hair strands, jewellery and clothing detail; still flat fills, no gradients, no photo tracing. The fictional guide is an original design (curly dark hair, teal blazer, ochre scarf, round teal glasses, lanyard badge); nothing in it is based on a real person.

## 2. Public-domain reference photos (one per inductee, used only as visual reference, never embedded or traced)

Photos were viewed in my own browser tab (image URL only) and the notes below are what I wrote down from them. LoC item pages sit behind a Cloudflare "Performing security verification / Verify you are human" challenge; I did not attempt it. Rights lines came from the LoC JSON API (`/item/<id>/?fo=json`) and image URLs from `tile.loc.gov`. The Commons API rate-limited me once (HTTP 429, retried after a pause).

| Person | Reference (holder page) | Rights line as published | Features recorded and used | Caveat |
|---|---|---|---|---|
| Einstein | Library of Congress, https://www.loc.gov/item/2004671908/ (Orren Jack Turner, 1947, LC-USZ62-60242) [V] | "No known restrictions on publication. No renewal in Copyright office (checked 8/31/76)." Record note: "Copyright by Orren Jack Turner, Princeton, N.J." | Voluminous white-grey hair swept up and back and flaring at the sides; high forehead with horizontal furrows; heavy brows drooping at the outer ends; heavy-lidded deep-set eyes with bags; large nose; thick drooping grey moustache; tweed jacket with shawl-style collar over an open shirt | B2-R4 notes the estate/Hebrew University licensing history; PD photo does not remove name/likeness claims. A second candidate (Schmutzer 1921, Commons tag "Public domain", photographer d. 1928) was found but not used |
| Muir | LoC https://www.loc.gov/item/2002719850/ (photoprint J. Edward Greene, 1909) [V]; hat and clothing from Commons `File:John_Muir_Cane.JPG` (Francis M. Fritz, c.1907) | LoC: "No known restrictions on publication." Commons tag "Public domain", with Commons' note that it "might not be in the public domain outside of the United States" | Long full grey-white beard to mid-chest; thick wavy grey hair brushed back; high forehead; deep-set eyes; dark waistcoat over light shirt; soft brimmed felt hat with dented crown (Fritz photo) | LoC 2004672064 (Hughes c.1902, "No known restrictions") shows small round spectacles; not used |
| Lamarr | Commons `File:Hedy_Lamarr_in_The_Heavenly_Body_1944.jpg` (MGM employees, 1944) [V] | Commons template PD-US-no-notice: "published in the United States between 1931 and 1977, inclusive, without a copyright notice", with the standard warning it may still be copyrighted in other jurisdictions | Dark shoulder-length waved hair, centre-ish parting; high thin arched brows; large heavily lashed eyes; slim nose; defined dark lips; oval face, pointed chin; dark high-necked top with a leaf-shaped brooch | Weakest rights basis of the five: a Commons community assertion about a scan from a collector site, not an archive page. Alternative `Hedy_Lamarr_2.jpg` (US Army, Yank, 1943-11-12, PD-USGov-Military-Army) is only 157x216 px |
| Albright | Commons `File:Secretary_of_State_Madeleine_Albright.jpg`, source State Department Flickr (`statephotos/2379540743`) [V] | Commons PD-USGov-State: "work of a United States Department of State employee, taken or made as part of that person's official duties ... public domain per 17 U.S.C. 101 and 105". A second file (`Albrightmadeleine.jpg`) cites `history.state.gov/department/images/bios/albright-madeleine-korbel.jpg` | Chin-length warm brown bob, soft side-swept fringe; round full face; light blue eyes; muted red-brown lips; small gold earrings; thin gold chain; dark top with gold buttons at the shoulder; no glasses | The B2-R4 probe gave her glasses; the photo has none. Her widely reported brooch-pin habit is not visible in this photo, so it was not drawn |
| Naismith | Commons `File:JNAISMITH.jpg` (Harry A. Fisher, 1905, page 31 of Spalding's official collegiate basket ball guide; source Internet Archive Book Images on Flickr, "No known copyright restrictions") [V] | Commons tag `{{PD-1923}}` | Thick dark drooping moustache; dark hair parted off-centre and combed flat; square strong jaw; heavy straight brows; no glasses; high white collar, dark bow tie, dark suit | The B2-R4 probe gave him round glasses; the photo has none. The Springfield College c.1920 file that B2-R4 listed is tagged PD on Commons only via `{{PD-because}}` quoting a "personal, non-commercial, and educational use ... with credit" statement, which is a use licence, not public domain; I rejected it. That confirms conflict 9 in B2-R4 |

## 3. Speaking demo

Page: `index.html` served at `http://127.0.0.1:8703/s3-avatar/index.html` (server now stopped). Debug-only URL params: `?char=<name>&lvl=1|2&t=<seconds>&tr=1&rm=1`.

Architecture (nothing exotic):
- Clock: an in-memory 8 kHz 8-bit silent WAV (about 220 KB in memory, built in JS) on an `<audio>` element. Real audio later replaces that one line.
- Captions: `<track kind="captions">` on the audio element, `track.mode = 'hidden'`, text rendered by the page from `cuechange` and `activeCues`. Transcript is built from `track.cues`.
- Mouths: `data/lines.json` holds Rhubarb-style `mouthCues` (`start`, `end`, `value`), looked up by binary search against `audio.currentTime` in a `requestAnimationFrame` loop that runs only while playing and only when animation is allowed. The mouth is one `<use href>` swapped per change.
- The timeline is a rule-based letter-to-shape converter I wrote (about 5.0 syllables per second, pauses at commas), not audio analysis: 195 cues over 21.8 s of speech, 8.9 shape changes per second.
- Lines: three third-person narration lines that paraphrase the two facts already verified in the project data (F-0001, F-0002). Chips show placeholders `FACT-PH-001..003`; the ids are deliberately not live. The default speaker is the fictional guide. The avatar picker is a rig test only; an inductee avatar reading this narration would not be the production pattern (B2-R4 section b).

Requirement check (all verified by me; method in brackets):

| Requirement | Status |
|---|---|
| Visible "AI recreation — illustrated, words from cited sources" label in the DOM next to the avatar | Yes, a `<p id="ai-label">` inside the `<figcaption>` of the avatar `<figure>`; text confirmed in the AX tree [P: CDP `Accessibility.getFullAXTree`]; it sits 55 px below the SVG, inside the same figure |
| Captions from a WebVTT track via hidden track + `cuechange` | Yes. Chrome 152 (in-app) and 155 (headless) both fire `cuechange` on an `<audio>` element. At 1.5x speed the six edges fired at 0.51, 5.61, 6.52, 16.72, 17.61, 24.11 s against cue times 0.5, 5.6, 6.5, 16.71, 17.61, 24.11 [P: 18 s run via javascript tool]. A safety net compares `activeCues` with what is shown each 120 ms; it repaired 1 mismatch in that 1.5x run and 0 in the 1x runs |
| Play/pause, mute, speed, transcript toggle | Yes, plus Captions on/off, Avatar motion on/off, position slider, avatar and level pickers. Mute toggles `audio.muted` and `aria-pressed`, but the clip is silent, so no audible effect was tested [U] |
| Fact-id chip per line | Yes: one in the caption area (toggletip, `aria-expanded`, Escape closes) and one per transcript row |
| `prefers-reduced-motion` = no mouth or idle animation | Yes. With the real media feature emulated (CDP `Emulation.setEmulatedMedia`): `document.getAnimations()` returned 0, 0 rAF frames, 0 mouth swaps, 0 blinks, mouth stayed X, captions still advanced (cuechange fired), and a notice explains why. A `change` listener on the media query is implemented but was not exercised live. The in-app browser cannot emulate this feature, so that engine only ran the forced `?rm=1` path |
| Keyboard operable | Yes: Tab order is skip link, Play, Mute, Speed, Captions, Transcript, Avatar motion, Position, Avatar, level radio, notes summary [P: focusin log, 12 Tab presses]. Space on Play started playback; Enter on Mute, Captions, Transcript and Avatar motion toggled them. A native `<select>` on macOS opens on ArrowDown, so speed was changed programmatically for the 1.5x test |
| 24 px targets | After one fix: smallest interactive target 28 px (chips, summary, slider); buttons and selects are 40 px. First pass found the two level radios at 20 px (below 24); they are now 24 px [P: `getBoundingClientRect` over all controls] |
| Also (not requested) | The `Avatar motion` toggle exists because the idle bob and blink run longer than 5 s beside other content (WCAG 2.2.2), independent of the OS setting |

## 4. Measurements

### 4.1 Size
Method: file bytes of generator output; gzip level 9 per file [P].

| | L1 (6 files) | L2 (6 files) | Both |
|---|---|---|---|
| Raw | 26,376 B | 42,548 B | 68,924 B |
| gzip, summed per file | 7,937 B | 10,488 B | 18,425 B |
| Per character raw | 4.3-4.5 KB | 6.3-8.7 KB | |

L2 is 1.6x L1. Largest file: Einstein L2, 8,661 B (hair strands, moustache strands, tweed flecks). The nine mouth shapes plus eye pair sit in every file: about 2.4 KB of the 2.6-4.1 KB `<defs>` per file, 28,979 B across all twelve files (42% of the total). A single shared mouth set would remove most of that; not built. For comparison, B2-R4's probe was 11.2 KB raw for six characters at one level, with no eyes or mouth set inside each file. Page payload for the demo with one avatar: 42.1 KB raw, 12.7 KB gzip (HTML 4.2, CSS 5.8, JS 13.7, manifest 2.9, timeline 8.7, VTT 0.5, guide L2 SVG 6.3 KB); the heaviest avatar (Einstein L2) makes it 44.4 KB raw.

### 4.2 Animation CPU
Two methods; they agree on the order of magnitude and differ in what they can see.

Method A: headless Chrome 155.0.8059.40 driven over the DevTools pipe (`measure.py`). For each scenario: fresh tab at 1280x900, 1.5 s warm-up, then a 10.0 s window; `Performance.getMetrics` (main-thread task, script, layout, style durations) and `SystemInfo.getProcessInfo` (CPU time of every Chrome process) read before and after. 3 repetitions per scenario; figures are means with the range of the 3 total-CPU values. Hardware: Apple M1, 8 cores. CPU % is percent of one core, summed over browser, renderer, GPU and utility processes. The machine was loaded by other agents' spikes (load average 3.7-4.4), so ranges are wide.

| Scenario | Main-thread task, ms per s | of which script / layout / style | Total CPU, % of one core (range) |
|---|---|---|---|
| Blank page (noise floor) | 0.07 | 0 / 0 / 0 | 1.5 (0.3-3.7) |
| Static portrait (reduced motion, paused) | 0.26 | 0.05 / 0 / 0 | 2.2 (1.0-4.1) |
| Idle: paused, slow bob + blink | 1.82 | 0.13 / 0.11 / 0.16 | 7.7 (5.0-9.8) |
| Speaking, guide L2 | 34.8 | 3.95 / 2.93 / 5.97 | 12.4 (8.7-15.2) |
| Speaking, guide L1 | 28.5 | 3.34 / 2.42 / 4.94 | 10.4 (9.1-12.5) |
| Speaking, Einstein L2 (largest SVG) | 30.8 | 3.55 / 2.61 / 5.25 | 12.4 (11.2-13.1) |
| Speaking, guide L2, idle bob forced off | 23.5 | 3.78 / 2.77 / 1.53 | 10.9 (8.5-14.3) |
| Speaking with reduced motion (captions only) | 1.00 | 0.09 / 0.05 / 0.02 | 2.0 (1.9-2.3) |

Reading: speaking costs about 3% of one core of main-thread time (23-35 ms per second), 9-15% total across processes in this headless setup. The decorative idle bob is not free: paused idle costs about 5 points of total CPU more than static (mostly GPU/compositor) and speaking with the bob costs about 1.5 points and 11 ms/s of main-thread time more than speaking without it. Script time is small (about 4 ms/s). L1 versus L2 and guide versus Einstein differ by less than the run-to-run spread. JS heap 1.2 MB.

Method B: in the in-app browser (Chrome 152.0.7977.130, desktop 1024x768 at 2x), 10 s windows with a `requestAnimationFrame` probe plus `PerformanceObserver` for `longtask` and `long-animation-frame` (API confirmed in MDN via Context7):

| Window (10 s) | fps | frame interval p50 / p95 / max | long tasks | demo JS per frame (mean / max) | Counts |
|---|---|---|---|---|---|
| Speaking, guide L2, 1x | 60.0 | 16.7 / 18.4 / 18.7 ms | 0 | 0.041 / 0.3 ms (24.8 ms in total over 600 frames) | 76 mouth swaps, 2 cuechanges, 2 blinks |
| Idle paused, bob + blink | 60.0 | 16.7 / 18.6 / 18.8 ms | 0 | no rAF loop in the demo | 3 blinks |
| Static (motion off, paused) | probe fell to about 1 fps | 1000 ms (probe artefact) | 0 | none | none |

The static row is the browser not producing frames when nothing animates; the 10 `long-animation-frame` entries (about 1.0 s each) coincide with that and I did not explain them; the DevTools-pipe run shows 0.26 ms/s of main-thread work for the same state [U for the cause].

Method C, a finding worth keeping: my first version animated `.rig-head` and `.rig-body` (SVG groups) with CSS. While the mouth was changing, that forced one style recalculation and one layout per frame (601 each per 10 s) and 34-47 ms/s of main-thread task time. With both animations off the same page ran at about 20 ms/s with 142 layouts. Moving the bob to the outer `<svg>` element cut layouts to about 145 but left 601 style recalculations per 10 s, so it is still ticking on the main thread. Micro-benchmark (`bench.html`, same timeline, 3 x 10 s, headless): rAF loop with lookup only 8.6 ms/s; `<use href>` swap 12.6; visibility toggle on 9 live groups 11.3; display toggle 11.4; with the 120 ms time/slider readout +3 ms/s. How the mouth is swapped changes cost by about 1-2 ms/s; what runs every frame matters more.

### 4.3 Mouth legibility at 160 px head height
Scale: 160 px from crown to chin of the tallest head (0.678 px per rig unit); face is about 130 px tall; guide D is about 45 px wide including outline and the X line about 28 px; Einstein D about 36 px and X about 23 px. Mouth widths were raised against B2-R4's draft (D shape 56 units wide versus 40 units there, then scaled per character 0.86-1.1) and the open shapes were shortened so they stay inside the chin.

Objective proxy (not a user test): I rendered each character's nine mouths cropped to 64x56 px at that scale and counted pixels differing by more than 48/255 between every pair of shapes [P: `mdist.py`, scratchpad].
- Closest pairs, all characters: X vs A (2.3-5.5% of pixels differ; both are closed mouths, and Rhubarb itself defines them as near-identical), B vs G (5.8-9.1%), C vs E (6.3-11.7%), then A vs F and X vs F (7-13%).
- Next tier is above about 10-13% for every other pair; median pair about 11-17%.
- Einstein and Muir have the lowest medians (10.7% and 10.8%) because the moustache or beard hides the upper lip; Albright and Lamarr (lip colour, no facial hair) have the highest (17.4% and 16.7%); the guide is 16.0%.
- [J] From the strips by eye: A (bar), B (teeth block), D (large oval), F (small round) and the open-with-tongue shapes are distinct; C/E/H and B/G blur at small size, especially under the Einstein moustache.

### 4.4 Eyes and idle
Blink: two hrefs swapped on a 2.6-5.4 s random timer, 130 ms closed (4 blinks over about 18 s in the logs). Neutral idle = mouth X, eyes open, a 2 px bob over 4.2 s. The L1 blink is a line, the L2 blink a lid curve, with lashes for Lamarr.

## 5. Evaluation

### 5.1 Recognisability [J, no users tested]
My judgement as the builder, informed by the reference photos; the only real test is a short unlabelled-then-labelled recognition test with students. Cues carry a person only if the cue is both distinctive and in the photo.

| Person | L1 iconic | L2 characterful | What carries it, what hurts |
|---|---|---|---|
| Einstein | High | High | Wild white hair plus big grey moustache is the strongest silhouette in the cast. A student probably recognises the trope; whether they recognise the man or "mad scientist" is open. L2 adds heavy lids and furrows, which look more like the photo but also tired or stern |
| Lamarr | Low-medium | Medium | Dark waved hair with a centre part and red lips read "1940s film star", not Lamarr. Her identity as inventor is not in the face; the cues lean on the glamour framing that biographers criticise [J] |
| Muir | Low-medium | Medium | Long beard plus brimmed hat reads "old woodsman or hiker" (also wizard, Santa). Fine as a type, weak as an individual |
| Albright | Low | Low-medium | Chin-length bob, round face, gold earrings and buttons are generic. The one widely cited identifying accessory (brooch pins) is not in the chosen PD photo and was not drawn |
| Naismith | Low | Low-medium | Heavy moustache, flat parted hair, high collar and bow tie read "Edwardian man". A student would not know his face from a photo either, so a drawing is not the weak link |
| Guide | n/a | n/a | Original, deliberately distinct from all five (glasses, teal and ochre, different skin tone) |

Answers to the two questions in the brief: would a student recognise Einstein? Probably yes at a glance, by trope. Lamarr? Probably not from the face; she would be read as a classic Hollywood actress. Four of five inductees depend on the label and caption to be identified; this matches B2-R4's finding that SVG parts give type cues, not facial likeness, and moves it only modestly (the faces are now photo-informed instead of generic, and two wrong cues from the probe, glasses on Naismith and Albright, were removed).

### 5.2 Uncanny and disrespect risks [J]
- Uncanny risk is low in this style: flat colour, thick outline, schematic eyes, no photographic texture. The risk that does exist is motion: mouth shapes keyed to a real voice that does not match them would look worse than a still portrait. Only a silent clip was tested [U].
- Tone mismatch: the D shape at head height 200 px reads as a wide shout or surprise (visible on the guide). On solemn content (refugee stories, Albright, a death) a large mouth may read as comic; the cast sheet and demo show this at the stylization used here. A calmer, smaller shape set is a design option, not tested.
- Einstein L2 can read as sleepy or sad because of the heavy lids copied from the photo; the spiky hair edges toward caricature. Einstein's likeness has an active rights holder (B2-R4 b2), and Albright's family are living (died 2022-03-23).
- Lamarr's cues (lips, lashes, curls) risk reinforcing "actress first, inventor second".
- Every photo-informed face has light skin because every PD source photo shows light skin; only the fictional guide varies. That reflects the sources, not an intention.
- The label wording carries meaning for the guide too: "AI recreation" on a fictional character is imprecise; I showed the required label for all and added a role line ("Fictional guide, not a real person" versus "Stylized portrait, illustrative reconstruction (spike)").
- First-person speech was avoided on purpose: all three lines are third-person narration of paraphrased, already verified facts.

## 6. Accessibility observations

Computed tree from Chrome `Accessibility.getFullAXTree` (headless 155) and from the in-app `read_page` tree (1024x768 desktop). Mobile (375x812 emulation in the in-app browser) was checked with a script and a screenshot only: no horizontal scroll, avatar 245 px tall (head about 160 px), Einstein mouth open and legible under the moustache. Summary of the final structure: link "Skip to playback controls"; banner with h1; main with region "Avatar and captions" (h2 visually hidden), `figure` containing `image` "Museum guide: Fictional guide, not a real person (level L2)" and a `Figcaption` with the name, role and the AI label paragraph; caption `status` (live region, `aria-live="off"` so it does not talk over audio); region "Playback controls" with `button` Play, `button` Mute (`pressed`), `combobox` Speed, `button` Captions (`pressed`), `button` Transcript (`expanded`), `button` Avatar motion (`pressed`), `slider` Position (min, max, valuetext "m:ss of m:ss"), combobox Avatar, `group` "Stylization" with two `radio`s; region "Transcript" as a `list` with a per-line `button` "Fact id FACT-PH-00n, line n"; a `DisclosureTriangle` for notes.

Findings:
- Bug found and fixed: the elapsed-time readout was an `<output>`, which has an implicit `role="status"` and `aria-live="polite"`; the AX tree showed `live: polite`. It would have been announced about 8 times per second during playback. It is now an `aria-hidden` `<span>`; the slider already carries `aria-valuetext`.
- Bug found and fixed: level radios were 20 px (see section 3).
- The avatar SVG is exposed as one `image` with a static label; mouth and blink changes do not touch the tree, so there is no announcement noise from animation.
- The caption `status` is explicitly non-live. A screen-reader user relies on the audio (real, later) and the transcript; the transcript is a plain list reachable by heading.
- The AI label is plain text inside the avatar `figure`, so it is read with the avatar; it is not an image or a CSS pseudo-element.
- Focus ring: 3 px outline on `:focus-visible`; skip link present; no horizontal scroll at 375 px (document width 375).
- `read_page` shows the radios as names "1" and "2" (their values) and the slider as a textbox "8.2"; Chrome's own tree names them correctly ("L1 iconic", "Position"). Treat `read_page` as lossy for form controls.
- Colour: the label and chips are 13-14 px bold text on white/near-white; I did not run a contrast checker over the page [U].
- Not tested: a real screen reader (VoiceOver, NVDA), iOS Safari audio behaviour with the silent switch, Safari and Firefox `cuechange` behaviour on `<audio>` (B2-R4 open question 6 is answered for Chrome only).

## 7. What failed or did not work first time
1. Einstein's first hair was a crown of regular spikes, then a scalloped cloud with an outlined front cap; the cap read as a chef's hat. Fixed by making the front hair an unoutlined fill with only a hairline stroke and flaring a few long wisps. The same front-hair approach cleaned up the other five.
2. Probe features from B2-R4 that the photos contradict: round glasses (Naismith), rectangular glasses (Albright). Removed.
3. First open-mouth shapes (D) ran below the chin on the guide, Lamarr, Albright and Naismith; shortened and the mouth anchors raised.
4. Per-group SVG CSS animation doubled main-thread cost while speaking (section 4.2, method C).
5. `<output>` live region bug and 20 px radios (section 6).
6. Cast sheet first came out at 209 KB because the 18 mouth-strip cells each carried full defs; reduced to 137 KB by omitting defs in the strip cells.
7. LoC item pages and a Cloudflare challenge; Commons API 429 once. Neither blocked the work.
8. Arrow-down on a closed `<select>` opened the popup instead of changing speed on macOS (native behaviour); not a defect, but a keyboard tester should know.
9. Not built: audible mute test, real TTS, Rhubarb or HeadTTS timing comparison, Safari and Firefox, a phone, a recognition test with students, shared mouth sprite.

## 8. Open questions
1. Do students recognise Einstein by the trope or the man, and do they recognise any of the other four unlabelled? A 5-person, 2-minute test would answer it.
2. Does the Naismith 1905 PD-1923 basis, the Muir Fritz photo and the Lamarr no-notice basis hold up under a rights check by someone qualified (not me)?
3. How large a mouth range is acceptable on solemn content? Would a reduced shape set (merge X/A, B/G, C/E) look wrong to viewers or fix the tonal problem?
4. Is timing from HeadTTS phonemes or Rhubarb good enough on these shapes against real Kokoro audio? Not tested; still B2-R4 question 5.
5. Do `cuechange` and hidden text tracks behave on `<audio>` in Safari (desktop, iOS) and Firefox?
6. What does a low-end Android phone do with a 60 Hz main-thread style tick for a 2 px bob?
7. Who signs off the likenesses: IHH, Hebrew University/GreenLight, Lamarr estate, Albright family, Muir-Hanna Trust, Naismith heirs (B2-R4 questions 1-2)?

## 9. Implications for the decision (no recommendation)
1. If avatars are code-authored SVG, the whole 12-file cast is 69 KB raw (18 KB gzip) and about 42 KB of that is repeated mouth definitions; one mouth set per lip style would roughly halve it. Runtime cost is zero libraries; the demo page is 42-44 KB raw with one avatar.
2. If recognisability is a goal, SVG cues work for Einstein and, weakly, for Muir; for Lamarr, Albright and Naismith the label does the identifying. If the goal is only to mark "this is a stylized portrait of that person", L1 does it at 62% of L2's bytes with no loss of mouth legibility (guide L1 and L2 were equal within noise).
3. If the idle bob is kept, it is the largest standalone animation cost (about 5 points of total CPU while paused) and runs on the main thread when anything else changes; blink alone is cost-free. If it is dropped, the only animated element is the mouth, driven only while audio plays.
4. If captions come from a hidden WebVTT track, the transcript, caption area and fact chips can all be built from the same cues; Chrome fired every edge within about 20 ms at 1.5x, and the 1x runs fired the expected number of edges.
5. If mouth timing comes from Rhubarb-style JSON, the page needs one binary search and one attribute write per change; 195 cues is 8.7 KB uncompressed (1.8 KB gzip) for 22 s of speech, so 17 minutes is about 0.4 MB raw.
6. If inductee avatars must not speak invented words, the demo pattern (guide narrates in third person from fact-backed lines, inductee portrait is a still or an attributed-quote card) removes the first-person problem and leaves lip-sync only for the fictional guide; that also removes the main uncanny and consent risk for Einstein and Albright.
7. Reduced motion collapses the whole feature to captions plus a still portrait at roughly the noise floor of the browser (2% total CPU), which is also a valid mode for Lite fallback.
8. The two bugs found (live region on `<output>`, 20 px radios) were invisible visually; an automated AX-tree and target-size check like `ax.py` is cheap to carry into CI.

## 10. Query and tool tally
- Context7: 6 calls (2 `resolve-library-id`: MDN Web Docs, Chrome DevTools Protocol; 4 `query-docs`: TextTrack hidden mode and `cuechange`; `matchMedia` and `prefers-reduced-motion`; CDP `Performance.getMetrics`; `long-animation-frame` observer). All APIs used were confirmed there.
- Google web and Google Developer Knowledge: 0 (not needed for this spike).
- Direct fetches: about 20 Wikimedia Commons API calls, about 13 LoC API calls, 6 reference-photo views in my own browser tab (plus 1 LoC item page that returned a verification challenge and was not pursued).
- Browser: my tab `tab-7` only; viewport emulation (375x812) set once and reset to desktop.
- Not done: `docs/handoff` was not updated by this subagent; the orchestrator owns STATE.md.
