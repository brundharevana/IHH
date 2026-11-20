# Provenance for IHH's chatbot

Every fact, source and search is exported so IHH's chatbot can say where each statement comes from.

| File | What |
|---|---|
| `data/export/site-provenance.jsonld` | What the museum shows, with sources (written by `app/scripts/export_site_provenance.py`) |
| `data/export/facts.csv`, `sources.csv`, `media.csv`, `searches.csv`, `provenance.jsonld` | The whole store |
| `data/inductees/<slug>/export/` | Per inductee, including a review page |

Related: [fact pipeline](pipeline.md)
