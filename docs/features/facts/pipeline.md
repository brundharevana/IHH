# Verified fact pipeline

How a fact gets into the museum. The contract is [docs/pipeline/SPEC.md](../../pipeline/SPEC.md); a plain-language guide for IHH staff is [docs/pipeline/README.md](../../pipeline/README.md).

| Step | Tool |
|---|---|
| Save the source page as a snapshot (sha256) | `tools/fetch_snapshot.py` |
| Add candidates with permanent ids | `tools/merge_staging.py` |
| Second model tries to refute each fact | `tools/adversary.py` |
| Derive status from the evidence | `tools/compute_status.py` |
| Check every record and gate | `tools/validate.py` |
| Human review | `tools/apply_review.py` |
| Export (review package, CSV, JSON-LD) | `tools/export.py` |

Statuses: verified, single-source, disputed, pending, rejected, conflicting. Only verified and approved facts reach the museum.

Data: `data/inductees/<slug>/` (facts, sources, media, searches, snapshots). Authority registry: `data/registry/institutions.json`.

Tests: `python3 -m pytest tools -q`, `python3 tools/validate.py --all`.

Related: [new inductee skill](new-inductee-skill.md) · [provenance for the chatbot](provenance.md)
