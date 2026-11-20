# Guide and narration

A pre-recorded guide voice narrates each stop. It says only lines checked against verified facts.

| Item | Where |
|---|---|
| Narration scripts per inductee | `assets-src/audio/narration/<slug>.json` |
| Narration gate (a line may not say more than its facts) | `assets-src/audio/check_narration.py` |
| Clips, captions and their check | `assets-src/audio/build_guide_audio.py`, clips in `app/public/audio/` |
| Guide voice and captions in the app | `app/src/shared/guide/` |

Sound starts only after the visitor taps **Begin the tour**; the mute button (or M) silences it.

Tests: `app/src/tour/data/narration.test.js`. The narration gate's own tests and the room inventories it reads stay with the source scans, outside this repository.

Related: [build gates](../quality/build-gates.md) · [fact pipeline](../facts/pipeline.md)
