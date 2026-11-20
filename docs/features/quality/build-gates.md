# Build gates

`npm run build` (in `app/`) stops at the first failing check. Full table, and what each gate proves and does not: [app/README.md, Build and gates](../../../app/README.md#build-and-gates).

| When | Check | Script |
|---|---|---|
| prebuild | Fact index matches the store | `app/scripts/build_fact_index.py --check` |
| prebuild | Every fact and media id named is verified | `app/scripts/check_content.mjs` |
| prebuild | Every texture and model traces to a cleared record | `app/scripts/check_textures.py` |
| prebuild | Narration says no more than its facts | `assets-src/audio/check_narration.py` |
| prebuild | Audio clips match their lines | `assets-src/audio/build_guide_audio.py --check` |
| prebuild | Tour data rules, numbers on labels grounded | `vitest run src/tour/data` |
| postbuild | Size budgets (room glb, page JS) | `app/scripts/check_budgets.mjs` |
| postbuild | No dev-only page in the build | `app/scripts/check_dist.mjs` |

A full build also needs `assets-src/` source scans, kept out of the repository for size.

Related: [testing](testing.md)
