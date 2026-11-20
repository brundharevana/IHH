# Immigrant Hall of Honor: virtual museum

A virtual museum for the Immigrant Hall of Honor (IHH). A guide walks visitors through the turning points of five inductees: Albert Einstein, Hedy Lamarr, John Muir, Madeleine Albright and James Naismith. Each chapter is a place, either a 3D room rebuilt from photographs, a photo room or a gallery case. Every fact the tour states is meant to trace to a verified record with a saved source; the build gates check the record ids and the numbers (see [app/README.md](app/README.md) for what they prove and what they do not).

- Live preview (version 8): https://ihh-turning-points-duayridvf-ihh4.vercel.app
- WordPress embed for IHH's site: [docs/revamp/wordpress-embed.md](docs/revamp/wordpress-embed.md)
- Feature docs: [docs/README.md](docs/README.md)

## What is in this repository

| Path | What it holds |
|---|---|
| `app/` | The museum: landing (`index.html`), guided tour (`tour.html`) and WordPress embed (`embed.html`). Details: [app/README.md](app/README.md) |
| `data/inductees/<slug>/` | The verified facts store: facts, sources, media, searches and saved source snapshots for each inductee |
| `data/registry/` | The authority registry: which publishers may count as primary or institutional sources |
| `data/export/` | Generated exports, including the provenance package for IHH's chatbot (`site-provenance.jsonld`) |
| `tools/` | The fact pipeline in Python: snapshot fetching, deterministic gates, the cross-model adversary, review and export |
| `docs/pipeline/` | How the fact pipeline works ([SPEC.md](docs/pipeline/SPEC.md), plain-language [README](docs/pipeline/README.md)) |
| `docs/revamp/` | WordPress package, story notes and feedback rounds |
| `docs/research/` | Research behind the design decisions |
| `content/` | Room and scan manifests used by the earlier site |
| `site/` | The earlier Astro site (version before the 3D museum) |
| `spikes/` | Early technical experiments |
| `assets-src/audio/` | Guide narration scripts and their checks (the rest of `assets-src/`, source scans, stays local for size) |
| `.claude/` | Claude Code skills (`ihh-verified-facts`, `ihh-new-inductee`) and saved workflows that run the fact pipeline |

## How the facts are kept honest

1. A fact enters the store only as a restatement of a verbatim quote from a saved source snapshot.
2. Deterministic checks confirm the quote is in the snapshot and that the claim adds no content word the quote lacks (grammatical words such as articles are allowed).
3. An independent model (the adversary) tries to refute each fact. Disagreement goes to a person and never publishes on its own.
4. A fact is `verified` only when it is corroborated: a primary record, or two independent holders.
5. The museum's build fails if the tour or landing data names a fact or media record that is not verified (a few disputed link-only records are allowed by an owner ruling), or if a narration line or a displayed number says more than its cited facts. Other label wording is not checked automatically.

Full rules: [docs/pipeline/SPEC.md](docs/pipeline/SPEC.md).

## Tech stack

| Area | Tools |
|---|---|
| Museum front end | React 19, Vite 6, three.js (0.186) |
| 3D | React Three Fiber, drei, postprocessing, camera-controls, three-stdlib |
| Animation | GSAP |
| Fact pipeline | Python 3.12 scripts in `tools/`, pytest |
| Cross-model check | A second model (Codex) as the adversary that tries to refute each fact |
| Testing | Vitest (unit and data rules), Playwright (end-to-end, WordPress), axe-core (accessibility), ESLint |
| WordPress testing | WordPress Playground (WordPress run locally, no account) |
| Hosting | Vercel (static build) |
| Earlier site | Astro 5, model-viewer |

## Run the museum locally

Needs Node 20 or later.

```sh
cd app
npm ci
npm run dev
```

Then open http://localhost:5173 (landing), `/tour.html` and `/embed.html`. Useful links: `tour.html?inductee=muir`, `tour.html?inductee=einstein&chapter=big-work`.

Tests: `npm test` (Vitest) and `npm run lint`.

`npm run build` runs content gates before building. Some of them read the source scans in `assets-src/`, which are kept out of this repository because of their size, so a full build needs that folder. The dev server and `npm test` work from this repository alone.

## Run the fact pipeline checks

Needs Python 3.12 or later.

```sh
python3 tools/validate.py --all
python3 -m pytest tools -q
```

## Credits

Sources and licences of every image, model, sound and font the museum ships: [app/CREDITS.md](app/CREDITS.md).
