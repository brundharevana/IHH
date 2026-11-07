# Discovery synthesis (2026-10-07)

Sources: 01-05 in this folder. Each claim below traces to one of them; items marked (unverified) need a check before use.

## Inductee ranking (scores /30; two agents, same rubric, youth appeal is judgement)
| Rank | Inductee | Total | Strength | Top risk |
|---|---|---|---|---|
| 1 | Albert Einstein | 24 | Deep public-domain photo record (Commons), NARA naturalization petition NAID 596270 (spot-checked) | Name/likeness licensed via Hebrew University / GreenLight (secondary sources) |
| 2 | John Muir | 23 | Died 1914: nearly everything public domain; LoC Bain portraits "No known restrictions"; Smithsonian CC0 portraits; NPS sites | Unpublished papers copyrighted by Muir-Hanna Trust; lower youth appeal |
| 3 | Hedy Lamarr | 22 | Patent US 2,292,387 (filed 1941-06-10, granted 1942-08-11, spot-checked); Algiers (1938) public domain on IA; NARA petition NAID 335708097 (filed as Hedwig Maria Stauffer; confirm) | Estate publicity rights (CMG lists her; representation unconfirmed); no voice recording found |
| 3 | Madeleine Albright | 22 | State Dept historian facts; NARA 3,895 results; low rights risk | Few physical artifacts; less visual |
| 5 | Naismith / Strauss / Hope | 20 | Naismith 1892 rules scan (PD); Strauss 1873 rivet patent; Hope 1985 USO photos | KU voice restriction; Levi's trademarks; Hope film/TV copyright |
| 8 | Berlin / Cruz | 19 | Berlin early PD recordings; Cruz has 4 Smithsonian 3D objects | Song copyrights; Cruz almost no open media |
| 10 | I. M. Pei | 16 | LoC Pei Papers collection | "Publication may be restricted"; architecture copyright |

Count caveats: LoC and NARA counts are noisy (name collisions, loose phrase search); Smithsonian API was rate-limited; one agent may have killed the other's LoC process, so set B LoC counts may be incomplete.

## Reference page (Point of Pines)
Its "constellation" is CSS/SVG links around a flat OpenSeadragon deep-zoom image; the real 3D (Smithsonian Voyager) and 360 (Momento360) sit on a separate exhibit page behind a click and scroll. No bibliography. This is the exact failure user S reported.

## Current IHH site
WordPress, Kadence theme, Gutenberg + Kadence Blocks, WP Engine behind Cloudflare. REST API open. Inductees are plain Pages under parent id 3175, no custom fields. Pages run 178-357 words, 3-8 images, no AV, single-line sources, filename alt text, stock images, inconsistent fields, a copy-paste "Grammys" source on Muir. IHH mission includes "Tell Your Story", Founding Voices, Beyond the Stories; profiles do not link to them.

## Best-practice patterns (museum survey)
Guided 3D over free-roam (National Gallery Imaginarium, Webby winner); deep-zoom primary documents; named, dated sources and "how to cite"; captions and transcripts; WCAG 2.2 AA; low-bandwidth fallback. Anne Frank House uses an AI avatar guide (disclosed). Distinctive ideas: evidence-mode toggle, document-first 3D, arrival-record card, cite-it generator, myth-vs-record.

## Tech (all free)
three.js (guided camera path + DOM list of stops), Pannellum 360, model-viewer for artifacts, OpenSeadragon + LoC IIIF, Motion + Scrollama, Kokoro TTS -> Rhubarb lip sync -> original 2D SVG character with captions and "AI recreation" badge. Avoid XTTS, Wav2Lip, SadTalker, LivePortrait (licenses/photoreal). Reference repos have no license: ideas only. WordPress strips iframes for non-unfiltered_html users: ship a link card plus a small shortcode/embed plugin. Facts as CSV/JSONL source of truth, exported to JSON-LD (schema.org + PROV-O subset) for IHH's chatbot.

## Open gaps
- Real 3D scans exist for few artifacts (Cruz has some). Others would need labeled reconstructions.
- 360 imagery of each inductee's workplace not yet searched.
- Likeness rules for a stylized avatar unresolved; needs IHH sign-off.
