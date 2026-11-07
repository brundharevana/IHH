# Provenance log

Every fact, source, media item, and search behind the IHH profiles. This is the
source of truth; the site, the WordPress package, and IHH's chatbot all read from it.

## Files (JSON Lines, one record per line)

| File | One row per | Required fields |
|---|---|---|
| `facts.jsonl` | Claim | id, inductee, claim, category, event_date, source_ids, primary_document, status, verified_on, used_in, notes |
| `sources.jsonl` | Source | id, title, institution, type (primary / institutional / secondary), url (https), catalog_id, published, accessed (YYYY-MM-DD), archive_url, notes |
| `media.jsonl` | Image, audio, video, 3D model | id, title, source_ids, license (as the source states it), credit, rights_url, reconstruction (true/false), notes |
| `searches.jsonl` | Search performed | id, date, tool, query, results, produced (ids of facts/sources/media it led to), notes |

Discovery-phase searches (before this log existed) are recorded in the search-log
section of each report in `docs/research/`.

## Rules (enforced by `tools/validate_provenance.py`)

1. **Verified** means: the claim rests on its primary document, or on at least 2
   independent sources of which at least 1 is primary or institutional.
2. Status is one of `verified`, `single-source` (does not yet meet rule 1),
   `conflicting` (sources disagree; record both in notes), `rejected`.
3. Only verified facts may appear on the site or in an avatar's lines (`used_in`).
4. Every fact shown on the site links to its primary or institutional source.
5. Wikipedia and quote websites are discovery aids only, never cited sources.
6. Every media item records its license exactly as the source states it.
   Reconstructions are flagged and labeled on the site.

## Source types

- **primary**: the original record (naturalization petition, patent, letter, photograph, film).
- **institutional**: an archive, museum, government body, university, or foundation writing about the subject (LoC, NARA, Smithsonian, NPS, State Department historian, Nobel Prize).
- **secondary**: everything else (encyclopedias, news, aggregators).

## Commands

```bash
python3 tools/validate_provenance.py      # exit 1 on any rule violation
python3 tools/export_provenance.py        # CSV for IHH staff + JSON-LD for the chatbot
python3 -m pytest tools                   # validator tests
```
