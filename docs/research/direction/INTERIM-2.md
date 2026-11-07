# Interim synthesis after batch 2 (2026-10-08)

Sources: B2-R4, B2-R5, B2-R6, B2-R7, B2-R9. Hypotheses, not decisions.

## Query tally (cumulative)
| Source | B1 | B2 | Total | Floor |
|---|---|---|---|---|
| Google web | 110 | 274 | 384 | 10 |
| Google Developer Knowledge | 62 | 31 | 93 | 10 |
| Context7 | 60 | 47 | 107 | 10 |

## New knowledge (confidence)
1. **The likely acceptance gate is the WordPress package, not the showcase** (med). Challenge X has no public rubric; the brief's incentive is $200 per "successful profile", which reads as per-profile acceptance. IHH reviewers are likely non-technical (research, education, communications). Visible sourcing, plain language, and accessibility weigh more than engine detail. Conflicts with the user's statement that teams are ranked; needs the user's first-hand knowledge.
2. **IHH capacity is very low** (high). 501(c)(3) ruled Jan 2025, 990-N scale, one listed staff member (communications), site built by an agency (Woody Creative) on WP Engine. Lowest-dependency handoff: a prebuilt static folder; every CMS needs accounts and a build pipeline.
3. **Differentiation lives in provenance and accessibility** (med/high). Timelines, 360 embeds, AI avatars, historical chatbots are commodity; 95.9% of home pages fail WCAG checks (WebAIM 2026).
4. **Avatar route** (med/high): code-authored SVG cast is the only agent-authorable, free route (six characters ~11 KB); Rive editing is now paid; Lottie authoring paid. Likeness from SVG parts reads generic. Voice: Kokoro (Apache-2.0) with phoneme timings (HeadTTS, MIT) gives lip-sync without Rhubarb; Piper is narrower than thought (personal/research use); pre-rendered audio ~17 min, ~4 MB.
5. **Ethics: first-person speech by real people is where guidance draws the line** (med). APA, ICOM 2026 code, EU labelling code, California AB 1836 all point to disclosure, consent/heirs, and not inventing speech. Accepted pattern: scripted, sourced, labelled; verbatim cited quotes; narration in third person. Albright died 2022 (family living). This qualifies the earlier "inductee speaks verified lines" decision.
6. **Visual honesty** (med): heritage literature: photoreal only for fully credible data; clay/schematic/NPR for uncertain; no audience study. A duotone/dither layer can unify constructed 3D with untouched archival photos. Colour cannot carry evidence tiers alone. IHH brand: Montserrat, red #ed1b24 (fails AA as body text on white).
7. **Credibility UX** (med/high): citations are rarely clicked (0.29%) but raise trust; touch needs button-triggered toggletips/bottom sheets, not hover; explanatory quiz feedback has the largest effect (d 0.99); TEKS US History Since 1877 has direct hooks (nation of immigrants; evaluate sources; citations); IHH's Texas museum plan confirmed; English-only site.
8. **Scene evidence is uneven** (high/med): of 21 baseline scenes, 8 have clean open archival bases (Einstein naturalization, 1919 eclipse, Solvay 1927; Muir Yosemite camp 1903, Muir Glacier; Lamarr patent file; Albright 1997 swearing-in; Naismith 1892 rules). Naismith is thinnest; Albright childhood is sensitive. Smithsonian 3D has nothing inductee-specific; free props work if baked into panoramas.

## Tension with locked decisions (for the user)
- 3-4 scenes per inductee (15-20) vs ~8 cleanly evidenced scenes: the rest would rest on text-only reconstruction or need permissions.
- "Inductee speaks" vs ethics guidance: verbatim quotes and third-person guide narration are the defensible form.
- Showcase-first vs WordPress-package-first acceptance.

## Batch 3 (spikes, in-browser, no installs)
- S1 scene engine: constructed room baked to 4096x2048 equirect, PSV viewer with DOM hotspot list; measure bake time, file size, handedness, accessibility tree.
- S2 style sheet: same room in clay/maquette, low-poly, toon+outline, duotone/dither, with an archival photo placed in 3D; comparison image for the user.
- S3 avatar sheet: SVG cast at two stylization levels with legible mouths; caption/pause/mute/reduced-motion demo; likeness review.
- S4 embedding: sandboxed-iframe (WordPress oEmbed attributes) behaviour of a 3D page, postMessage resize, Lite mode detection, View Transitions fallback.
