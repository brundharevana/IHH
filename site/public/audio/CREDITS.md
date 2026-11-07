# Audio credits

| File | What it is | Made by | Licence |
|---|---|---|---|
| room-tone.mp3 | Ambient room tone, 40 s loop, mono 22,050 Hz, 64 kbps | Synthesised by `site/scripts/room-tone.mjs` (seeded brown noise, low-passed, 2 s cross-fade at the loop point). No recording is involved. | Our own synthesised file; no third-party rights. Released under CC0 1.0. |

No CC0 room-tone recording was sourced: the free sound libraries we checked require an account to
download, so the tone is generated instead. Rebuild with `node scripts/room-tone.mjs` (needs ffmpeg).

Narration and quote audio (`/audio/<slug>/...`) are generated with Kokoro-82M (Apache-2.0) by
`tools/build_audio.py`; see the labels on each page.
