# B4: Avatar recommendation (realistic AI vs living painted portrait vs real recordings)

Date: 2026-10-09. Deadline: 2026-11-01 (23 days). Synthesis of B4-A1 (realistic talking heads), B4-A2 (ethics and law), B4-A3 (living-portrait techniques), B4-A4 (Einstein prototypes P1-P3), with B2-R4, B3-S3 and B3-S5 as background. Research, not legal advice; items marked COUNSEL need a lawyer. Nothing committed.

Evidence tags as in the B4-A reports: [V] read on the primary page this session or in a cited B4-A report; [M] measured in B4-A4; [S] secondary/search summary; [J] judgement.

Extra checks this pass (5 web calls, 2026-10-09; one more fetch returned 403): AIP Einstein audio page fetched [V]; Naismith 1939 recording permission scope searched [S]; Albright audio sources searched [S].

## 1. Answer

**Ship the living painted portrait (Option B) for all five inductees, and add a genuine archival recording (Option D) only where it is cleared in writing before launch.** No photoreal AI face, no painted mouth movement. The "at most real" ceiling the user asked for is: a painted portrait from a verified public-domain photo, with subtle motion, plus the inductee's real voice where one exists and is cleared. That is more authentic than a photoreal synthetic face, because the voice is genuinely theirs and nothing on screen is invented.

Why not photoreal (Option A), in one line each:
- Build: the licence-clean models need 12-24 GB+ NVIDIA VRAM; this machine is an M1 8 GB with about 0.4 GB free disk (409 MB at `df`, 2026-10-09) [M].
- Free tools: free Colab bans "creating deepfakes"; commercial hosted tiers watermark or ban real-person likeness [V/S, B4-A1 sections 4-5]. One genuine free route exists: Meituan's official Hugging Face Space for LongCat-Video-Avatar 1.5 (MIT code and weights) runs on ZeroGPU A10G hardware (HF API: stage RUNNING, hardware zero-a10g, checked 2026-10-09) [V]. It would let us render test clips without owning a GPU, subject to ZeroGPU quotas and Hugging Face's content policy (neither read for real-person likeness [U]). It removes the "impossible to build" objection to photoreal, not the legal, ethical or labelling ones.
- Law/ethics: the enacted Cal. Civ. Code 3344.1 (AB 1836) defines a digital replica as "a computer-generated, highly realistic electronic representation that is readily identifiable as the voice or visual likeness of an individual" [S, enacted wording quoted by several law-firm summaries, 2026-10-09; leginfo/Justia blocked to our fetchers]. A photoreal talking head plainly meets "highly realistic"; a visibly painted portrait with a synthetic, non-cloned voice very probably does not, though that is COUNSEL's call. Under the EU AI Act Art. 3(60) a "deep fake" is content that "would falsely appear to a person to be authentic or truthful"; a photoreal head is the paradigm case, a labelled painted portrait is unlikely to be, but the test is contextual, so we disclose anyway [V, artificialintelligenceact.eu]. Museum-sector reaction in 2025-2026 (AAM survey: over 70% of 2,045 US adults oppose AI in exhibitions; Auschwitz Memorial: photographs "are evidence") punishes realistic invented faces of real people [V, B4-A2 section 6].
- The mouth-warp middle path (Option C) was prototyped and read as "a cut or a glitch rather than speech" [M/J, B4-A4 section 5].

## 2. Decision matrix

Equal weights, 1-5, higher is better on every criterion (so "credibility/ethics/legal risk" scores 5 = lowest risk). Maximum 25.

| Criterion | A. Realistic AI talking head | B. Living painted portrait (no mouth) | C. Painted portrait + mouth warp | D. Real PD/cleared recording + painted portrait (B + real audio) |
|---|---|---|---|---|
| Visitor wow | **5**. Strongest first impression (Dali Lives precedent). | **3**. Depth parallax, breathing, light sweep, audio-reactive warmth; quiet, museum register. Prototype P1 works. | **2**. Prototype mouth is a flat dark slit under the moustache; reads as a glitch. | **4**. Hearing Einstein or Naismith in their own voice is the most memorable moment we can offer; old audio is noisy, so not 5. |
| Credibility / ethics / legal risk | **1**. Meets the "highly realistic" replica test and the EU deep-fake definition (exemptions for documentary/historical/biographical use may apply, but are lost if the work creates a false impression of an authentic recording, which is the very risk of a photoreal face [S]); Albright (d. 2022) and Lamarr (estate active via CMG) rated High ethical risk; Einstein claimant GreenLight active. | **4**. Visibly an interpretation; quote-only speech; not 5 because a real person's face still moves (Einstein licence line, Albright family). | **2**. Makes a real face appear to speak words in a voice that is not theirs; conflicts with the locked "own words only" rule in spirit. | **5 where cleared**. No simulation of voice or face; the strongest provenance story. Drops to 2 if used without clearance. |
| Free-tools and licence fit | **3**. Clean code+weights exist (LongCat-Video-Avatar 1.5 MIT/MIT; InfiniteTalk Apache; LivePortrait MIT but InsightFace NC), and LongCat's official HF Space runs free on ZeroGPU; not higher because quota and the Space's terms for real-person faces are unverified and Colab's deepfake ban rules out the other free route. | **5**. Depth Anything V2 Small Apache-2.0; Kokoro-82M Apache-2.0, kokoro-onnx MIT; raw WebGL2. GPL espeak-ng/phonemizer build-time only (licence-register item). | **5**. Same stack. | **3**. Tools free, but each recording needs a rights path: Einstein speech text may carry estate copyright (COUNSEL); Naismith clip needs our own permission; Albright only federal-work audio. |
| Buildability by 2026-11-01 on this machine | **2**. Cannot run locally (VRAM, disk); P3 gate failed before timing test. Clips could be rendered on the free LongCat Space, but output is non-deterministic per run, needs a photo (not painted) source to look photoreal, and would need per-clip QA for five people in 23 days. | **5**. P1 prototype built and measured on Einstein; 1-2 h per further portrait plus depth bake. | **3**. Built, but convincing quality needs 6-8 hand-painted visemes per inductee plus real phoneme timings (kokoro-onnx outputs no durations). | **3**. Engineering is trivial (audio + captions); clearance timing is outside our control; available for at most 3 of 5. |
| Accessibility / performance | **2**. Pre-rendered video per clip (MBs per inductee on phones); captions possible; reduced motion means hiding the video. | **5**. P1 payload 268,535 B incl. audio; 0.11-0.21 ms main-thread per frame; Pause control (WCAG 2.2.2) and `prefers-reduced-motion` static fallback implemented [M]. | **4**. Same cost class; more motion on the face to suppress. | **4**. Small audio files; needs careful transcript and captions because archival audio is hard to hear (WCAG 1.2.1/1.2.2). |
| **Total / 25** | **13** | **22** | **16** | **19** (as a layer on B) |

Reading the matrix: B wins on every criterion except wow. D is not a competitor to B but an upgrade of B's audio for the inductees where a recording exists. A loses on four of five criteria; its only win is wow. A free hosted route exists (section 1), so the case against A rests on legal/ethical risk and accessibility/performance, not on impossibility.

## 3. Per-inductee recommendation

Common to all five: painted portrait from the verified PD photo (B3-S5 filter); depth parallax, breath, light sweep, audio-reactive warmth (B4-A3 tiers 1, 2, 5); no mouth movement; blink only if it passes review on Einstein first; static image under reduced motion; quotes always verbatim and cited on screen.

**Voice rule (refines B4-A4):** where no cleared recording exists, the guide's synthetic voice reads the quote as a quotation ("In 1939 Einstein wrote: ..."), not a separate voice standing in for the inductee. This keeps the synthetic voice from being heard as the person's voice, matches the locked rule that the guide narrates, and means no voice ever impersonates an inductee. B4-A4 used a separate British voice (`bm_george`) for Einstein; replace it.

| Inductee | Recommendation | Real recording? | Motion level | Outreach / gate |
|---|---|---|---|---|
| **Einstein** | B, upgraded to D if cleared | Lead: VOA broadcast, 10 Dec 1945, credited on AIP's page as "Voice of America Broadcast ... National Archives Control Number NNSM(s)-306-EN-8554" [V, history.aip.org/exhibits/einstein/voice3.htm, 2026-10-09]. AIP's page carries its own 1996 copyright notice for the site; the NARA catalogue entry has not been found [U]. The speech text was later published in Einstein's essays, so the words may carry the estate's copyright [K/COUNSEL]. Use only a short excerpt (under 30 s) for commentary, from the NARA copy, not AIP's file | Full B set; blink trial here first | Courtesy notice to Hebrew University / GreenLight with label text. Gate: NARA record found and no donor restriction; COUNSEL on excerpt length. Fallback: guide reads the quote |
| **Muir** | B | None (d. 1914, no known recording) [K] | Full B set | Optional courtesy contact (Muir-Hanna Trust per B2-R4) |
| **Lamarr** | B, gated on photo rights | None cleared; 1990 Forbes tapes are privately held and used in a commercial film [S] | Quietest set: parallax and light only, no blink, no breath emphasis (avoid "glamour" animation, per B3-S3 risk) | Courtesy notice to CMG. Photo rights are the weakest of five (PD-US-no-notice Commons assertion, B3-S3); re-verify before painting |
| **Albright** | B, upgraded to D only from a confirmed federal source | Remarks she gave as Secretary of State (1997-2001) recorded by federal staff are federal works under 17 U.S.C. 105 [K]. Her 2016 National Archives naturalization speech was made as a private citizen, so the speech itself is not a federal work even if NARA recorded it [J, COUNSEL]. Network/C-SPAN copies are third-party | Quiet set; no blink | Courtesy notice to the family. She died 2022 (living memory): if any doubt about a clip, use the guide reading her words |
| **Naismith** | B, upgraded to D only on written permission | 31 Jan 1939 "We the People" (WOR) interview, about 3 min, in the Library of Congress WOR collection; KU obtained permission for its archives and educational use [S, news.ku.edu 2015-12-15, Kansas Public Radio, LoC blog 2016-03]. That permission is KU's, not ours | Full B set | Ask KU Spencer Library / LoC for terms this week; if no written yes by 2026-10-25, ship B with the guide reading his words and a link to KU's public page |

Expected launch state [J]: Muir and Lamarr on B; Einstein, Albright, Naismith on B with D pending clearance. Even if no clearance arrives, all five ship on B with no rework, because D only swaps the audio file and the label.

## 4. Labelling text

Shown before or at first exposure (EU Art. 50(5) timing), visible text plus captions, following the Smithsonian formula (format + human role + AI role).

Portrait badge (on every portrait, always visible):
> AI-assisted painted portrait. Our software painted it from a photograph ([holder], [year]; [rights basis, e.g. "U.S. government work, public domain"]). Movement is added with an AI depth estimate; no face or expression is generated. [Name] did not pose for or approve this image.

The rights basis is filled per photo from the verified provenance record, never a blanket "public domain" claim. A portrait whose photo rights are not verified does not ship (gate applies to Lamarr in particular).

Voice line, synthetic guide reading a quote:
> Read by our guide, an AI-generated voice (Kokoro-82M). Not [Name]'s voice. Words: [Name], [source, date].

Voice line, archival recording:
> [Name]'s own voice: [programme/event], [date]. Recording: [archive, identifier], used with [permission / as a U.S. government work]. Excerpt, [mm:ss] of [mm:ss].

Methods page (one paragraph, linked from every badge):
> How these portraits were made, and where AI is used: each portrait starts from a photograph whose rights we have checked (the basis is stated under each portrait). Our own filter paints it; a depth estimate (Depth Anything V2 Small) and simple light effects add movement. No face is generated or invented, no mouth is animated, and no voice is copied. Quotations are word-for-word from the cited source. Where we play a real recording, we name the archive. Turn off movement with "Pause motion" or your device's reduced-motion setting.

Alt text pattern:
> Painted portrait of [Name], based on a [year] photograph from [holder].

## 5. What would change the answer

| If this happens | Then |
|---|---|
| Counsel clears AB 1836/EU questions, IHH approves in writing, and a free render route (LongCat Space on ZeroGPU, or a 24 GB+ GPU) is confirmed to permit real-person likeness | Photoreal could be considered for Muir and Naismith only (lowest rights exposure), labelled as AI-generated; still not for Albright or Lamarr |
| IHH says portraits may not move (or GreenLight objects for Einstein) | Static painted portrait + audio-reactive shimmer around the frame, not on the face; no rework of the pipeline |
| Naismith or Einstein clearance arrives | Swap in archival audio and the archival label (D); 1-2 h each |
| Clearance refused or slow past 2026-10-25 | Guide reads the quote; keep a link to the holding archive |
| Phone test (one mid-range Android, one iPhone) shows heat or below 30 fps | Drop parallax to hand-cut 3-layer CSS offsets (B4-A3 option C) or static image |
| Blink on Einstein fails the three-person review | Ship without blink; no other change |
| NO FAKES Act passes before launch | Re-check its nonprofit educational carve-out; B is unlikely to be affected, A would be |
| A genuine recording turns up for Lamarr or Muir | Same D path |

## 6. Open items before launch

1. Free disk space: about 0.4 GB free. Any further model work needs space first.
2. Phone test of P1 and the reduced-motion path with the OS setting (B4-A4 open items 3).
3. Replace the 1939 Einstein-Roosevelt letter quote (co-drafted with Szilard) through the fact pipeline.
4. Licence register: GPL phonemizer/espeak-ng as build-time tools; Depth Anything V2 Small Apache-2.0; Kokoro Apache-2.0.
5. Send courtesy notices (GreenLight/Hebrew University, CMG, Albright family) with the label text; COUNSEL decides whether replies are a precondition.

## 7. Critique (Codex adversarial review)

Run 1 (Codex CLI, read-only, live web search, 2026-10-09): **RED**, 7 findings. Disposition:

| # | Codex finding (summary) | Disposition |
|---|---|---|
| 1 | No licence-clean realistic route runs on M1 8 GB or compliant free compute (LivePortrait not audio-driven, InsightFace NC; LongCat targets CUDA) | Agrees with the recommendation; no change |
| 2 | AB 1836 definition misstated: enacted text is "computer-generated, highly realistic ... readily identifiable", not the bill-analysis "layperson could not readily distinguish" test | **Fixed.** Confirmed by search (enacted wording quoted in agora.eto.tech, Manatt, CDAS summaries, 2026-10-09; Justia returned 403 to our fetch). Section 1 now uses the enacted wording. The conclusion holds and is if anything stronger: "highly realistic" excludes a visibly painted portrait more clearly than the old test did |
| 3 | Overconfident on domicile; 3344.1 reaches acts occurring directly in California | **Fixed by removing reliance on domicile.** The cleaner point is the term: the replica right lasts 70 years after death [S], which has already run for Einstein (d. 1955), Muir (d. 1914) and Naismith (d. 1939) regardless of domicile. Lamarr (d. 2000) and Albright (d. 2022) are within term, so for them the protection is style (not "highly realistic") plus the historical/biographical exemption, both COUNSEL. B4-A2 sections 1-3 lean on domicile; read this table as superseding them |
| 4 | Option A legal score sloppy: documentary/historical/biographical exemptions exist unless the work creates a false impression of an authentic recording | **Fixed.** Matrix cell now names the exemption and its false-impression limit. Score stays 1: the exemption is lost precisely where a photoreal face can be mistaken for real footage, and the ethics and EU parts of the criterion do not depend on it |
| 5 | EU claim "on its face outside Art. 3(60)" too categorical | **Fixed.** Reworded to "unlikely to be, but the test is contextual, so we disclose anyway". Labels already disclose at first exposure |
| 6 | Labels understate AI: "made by our software" is less clear than "AI-assisted" | **Fixed.** Badge now opens "AI-assisted painted portrait" and names the AI depth step; voice line says "AI-generated voice (Kokoro-82M)"; methods page title says "where AI is used". The painterly filter itself is deterministic image processing, not generative AI, so the badge does not say "AI-generated" |
| 7 | Badge claims every photo is public domain, but Lamarr's photo rights are weakest | **Fixed.** Badge carries a per-photo rights basis from the provenance record; Lamarr row gated on photo rights; unverified photo = no ship |

Run 2 (same settings, 2026-10-09): **RED**, 1 finding.

| # | Codex finding (summary) | Disposition |
|---|---|---|
| 1 | Compute blockade overstated: LongCat-Video-Avatar 1.5 has MIT weights and an official HF Space on free ZeroGPU | **Fixed.** Verified via the Hugging Face API (Space `meituan-longcat/LongCat-Video-Avatar-1.5-Demo`, RUNNING, hardware `zero-a10g`, last modified 2026-06-23). Section 1 now names it; option A rescored free-tools 2 to 3 and buildability 1 to 2, total 11 to 13. Recommendation unchanged: B 22, D 19 as a layer on B, C 16, A 13. The deciding gaps for A are legal/ethical risk and phone performance, which a free GPU does not change |

Per the brief, Codex ran twice (initial review plus one re-run after fixes). The run-2 fix has not been re-reviewed by Codex.

## Sources

B4-A1, B4-A2, B4-A3, B4-A4 in this folder (their source lists apply). Additional, accessed 2026-10-09:
- https://history.aip.org/exhibits/einstein/voice3.htm (Einstein 1945 VOA credit line) [V]
- https://news.ku.edu/2015/12/15/professor-discovers-only-known-audio-recording-james-naismith ; https://kansaspublicradio.org/local-news/2015-12-16/ku-professor-finds-rare-audio-of-basketball-inventor-naismith ; https://blogs.loc.gov/loc/2016/03/a-voice-from-hoops-history/ (Naismith 1939 permission scope) [S]
- https://www.archives.gov/about/speeches/2017/constitution-naturalization-ceremony (Albright 2016 naturalization ceremony, search listing) [S]
- https://agora.eto.tech/instrument/1544 ; https://www.manatt.com/insights/newsletters/client-alert/california-enacts-a-host-of-new-ai-and-digital-rep ; https://cdas.com/california-expands-its-post-mortem-right-of-publicity-law-to-cover-ai-digital-replicas/ (enacted 3344.1 digital-replica definition, exemptions, 70-year term) [S]
- https://artificialintelligenceact.eu/article/3/ ; https://artificialintelligenceact.eu/article/50/ [V via B4-A2]
