---
name: ihh-verified-facts
description: Use when collecting, verifying, reviewing, or exporting facts and media about Immigrant Hall of Honor (IHH) inductees, or when running the verified-fact pipeline for a new or existing inductee. Covers the per-inductee data under data/inductees/<slug>/, the deterministic gates and the cross-model adversary, the Python tools in tools/, the saved workflow ihh-inductee-pipeline, the human review and export flow, and the rules that keep every published sentence traceable to a verbatim quote from a saved source. Use it before adding, editing, or citing any inductee fact, quote, image, or licence, and before writing site copy or avatar lines from those facts.
---

# IHH verified facts

The contract is `docs/pipeline/SPEC.md`; this skill is the operating guide. Decisions behind it:
`docs/handoff/DECISIONS.md` (2026-10-08 entries). Plain-language guide for IHH staff:
`docs/pipeline/README.md`.

Inductees (the interactive site covers all five; Einstein is the 3D showcase):

| Slug | Code | Name |
|---|---|---|
| einstein | EIN | Albert Einstein |
| lamarr | LAM | Hedy Lamarr |
| muir | MUI | John Muir |
| albright | ALB | Madeleine Albright |
| naismith | NAI | James Naismith |

A new inductee gets a new slug and an unused three-letter code.

## Principles

1. The AI states facts; it does not author them. Every claim restates a verbatim quote from a saved
   snapshot and adds nothing.
2. A fact is included only when the extractor AND an independent adversary both find it supported.
   Disagreement becomes `disputed` and goes to a person. It never auto-publishes.
3. Deterministic checks run before and after every model judgement. No model marks its own work
   verified; `tools/compute_status.py` derives status from recorded evidence.
4. Every search, fetch, verdict, and human edit is logged (IHH's chatbot reads the log).
5. The pipeline never publishes. It produces a package for human review.

## Data layout

```
data/inductees/<slug>/
  inductee.json      identity, aliases (each a name backed by an identity fact), authority ids, runs
  facts.jsonl  sources.jsonl  media.jsonl  searches.jsonl
  snapshots/<SRC>.txt + <SRC>.meta.json   source text as fetched, with sha256
  staging/           per-run intermediates, kept for audit
  drafts/profile.json   grounded draft content
  review/decisions.jsonl  human review log
  export/            generated: wordpress.html, facts/sources/media/searches.csv, provenance.jsonld, REVIEW.md
data/export/         generated aggregates across inductees
data/registry/institutions.json   authority registry: which publishers may be primary/institutional (people edit it; tools never write it)
```

IDs: `<CODE>-F-0001` (fact), `-S-` (source), `-M-` (media), `-Q-` (search). Never reused, even after
rejection.

## Records (full schemas: SPEC section 3)

| File | One line per | Key fields |
|---|---|---|
| sources.jsonl | source | title, institution (the registry name when the url is a registered publisher's), type, url (https, canonical, the holder's own page, shown on the site), fetch_url (null, the same record as the url, or the adapter endpoint), snapshot + sha256, fetch_method, derived_from (the source id whose text this one reproduces or follows; G5 counts the two once) |
| facts.jsonl | atomic claim | claim, category, event_date, evidence [{source_id, quote, locator}], primary_document, is_direct_quote, extractor, adversary, status, verified_claim_sha256, used_in, review |
| media.jsonl | image, audio, video, document, 3D, panorama | url, rights_statement (verbatim), rights_url, license_class, credit, alt_text, reconstruction + basis, adversary, status, review |
| searches.jsonl | search run | date, family, tool, query, results, produced, agent, run_id, notes |

Source types: **primary** is the original record (naturalization petition, manifest, patent, letter,
photograph). **institutional** is an archive, museum, government body, university, foundation, or prize
body writing about the subject. **secondary** is everything else (encyclopedias, news, aggregators,
IHH's own current page). primary and institutional are allowed only when the url's host is in the
authority registry with that type (next section); everything else is secondary, whatever it calls
itself. Wikipedia, Wikidata, and quote sites are discovery aids only, never sources of a fact; Wikimedia
Commons is a media-only registry entry (media items yes, facts no).

## Source authority registry

Rule: a source is primary or institutional only if its publisher is in a curated authority registry;
independence is counted by registry entry; everything else is secondary.

- `data/registry/institutions.json` lists publishers: `id`, `name`, `kind`, `domains` (registered domains,
  subdomains included), `hosts` (exact hosts; `www.` and `m.` labels ignored), `may_be`
  (`["primary", "institutional"]` or `["secondary"]`), optional `primary_paths` (`"host/path/"` prefixes of
  the publisher's original-record pages), optional `media_only`, `verified_on`, `note`. Full rules: SPEC 3.6.
- `primary` is allowed only on original-record pages: under one of the entry's `primary_paths`, or, when
  it lists none, anywhere on a records holder (kind `government` or `archive`). A museum, university,
  prize body or foundation page is institutional at most until a person lists its record paths. A
  biography page on a hall of fame site is never primary.
- `tools/ihh/authority.py` resolves a url by its own host only, read by `tools/ihh/urls.py` in canonical
  form (the host a browser reaches). A url with userinfo, a backslash, whitespace, an IP-address,
  percent-encoded or non-ASCII host (write an IDN as `xn--`), or a trailing dot is refused everywhere.
  A Wayback, archive.today, Translate, cache or short-link copy is another site: it resolves to nothing
  and can only be secondary. Cite the holder's own page as `url` and put the copy in `archive_url`.
- Authority comes only from the registry: an unregistered `.gov` or `.mil` site is secondary like any
  other until a person adds it.
- A registered source's `institution` is the registry `name` exactly; leave it empty in staging and
  `merge_staging.py` fills it. An unregistered site may not use a registered holder's name.
- G5 counts holders: one registry entry, or a name claiming a registered holder, is one holder, however
  the institution string is spelled; unregistered pages on one registered domain are one holder (and
  join a registry entry on that domain). Two registry entries are two holders, even on one platform.
- No page on a Wikimedia host (`wikimedia.org`: Commons, its mobile, upload and meta hosts) backs a fact.
- Narrow scopes (owner decisions 2026-10-10): `urls` makes a single-record entry (Nature 107:539
  only; any other nature.com page is secondary); `content_part: "transcription"` (Einstein Papers
  Project) counts only for a source with `content_part: "transcription"` whose snapshot marks the
  transcribed document text between `<<<TRANSCRIPTION>>>` and `<<<END TRANSCRIPTION>>>` lines;
  every quote check reads only that text, so editors' notes and commentary never count. Kind
  `public-university-archive` is institutional only, on exact hosts only (UCLA Library Digital
  Collections, Utah Digital Newspapers); add each new one as its own reviewed entry. NPS is primary
  only on NRHP/NHL nomination forms (`primary_paths`).

### Proposing a registry entry

Agents never edit the registry, inside or outside a pipeline run; the tools refuse to write it
(`PermissionError`). When a source's publisher should be primary or institutional but is not listed:

1. Keep the source `secondary` for now and note the proposal (in the workflow, in `blockers`; the
   adversary reports one as `registry_suggestion`, which the workflow's Package step returns).
2. Write the proposal for a person in `data/registry/PROPOSED.md` (proposals only; never
   `institutions.json`): name, kind, the registered domain or exact host, `may_be`, and the
   evidence that the domain is that publisher's (HTTP status and page title of the home page, a
   redirect target, or the TLS certificate's organization when the site blocks plain fetches). Never
   guess a domain; drop it if it cannot be confirmed.
3. A person reviews it, edits `data/registry/institutions.json` (with `verified_on` and a `note` saying
   how it was checked), and runs `python3 -m pytest tools -q` (the registry loader refuses malformed
   entries) and `python3 tools/validate.py --all`.
4. Then change the source's type, re-run `adversary.py --ids` for the facts that cite it, and
   `compute_status.py`.

Searches from the discovery phase, before any log existed, are recorded in the search-log section of
each report in `docs/research/`. The first seed log (`data/provenance/`, 3 facts) was migrated into
`data/inductees/einstein/` and `data/inductees/lamarr/` on 2026-10-08 (run ids
`einstein-legacy-2026-10-08`, `lamarr-legacy-2026-10-08`; each record's `notes` names its legacy id)
and removed, together with `tools/validate_provenance.py` and `tools/export_provenance.py`.

## Statuses

| Status | Meaning |
|---|---|
| verified | Passed every gate; extractor and adversary agree; corroborated (G5) |
| single-source | Supported, but no primary document and fewer than two independent institutions |
| disputed | The adversary refuted it, could not confirm it, or found added information; a person decides |
| pending | A deterministic gate fails, the adversary has not judged it yet, or it was edited after verification |
| rejected | Withdrawn by the extractor or rejected by a reviewer (set by a person or the merge step) |
| conflicting | Sources disagree; `notes` records each version (set by a person or the merge step) |

Only `verified` items with review state `approved` or `edited` reach the publishable export.

## Gates (SPEC section 4)

| Gate | Kind | Rule |
|---|---|---|
| G1 Evidence | deterministic | Every quote is in its snapshot after normalization; snapshot sha256 matches its meta, and the meta names the record's url, method and fetch URL. A snapshot must be fetched from the cited record itself: fetch_url is the same record as the url (query order, `www.`, a trailing `/` and fo=json/format=json aside; the fragment may be dropped, never changed) or the adapter's endpoint for it, never another page on the same site; a redirect to another record is refused and the meta's `final_url` must be the record fetched. For media: the rights statement is in a snapshot (missing only while the item is not embeddable) and license_class agrees with the approved LoC / NARA rights rule |
| G2 Nothing added | deterministic | The claim contains no content token its quotes lack (`content_tokens()` in `tools/ihh/normalize.py`: only audited function words such as articles, plain prepositions, pronouns and be/have/do are dropped; dates compared as ISO, a month alone is a date, number words equal digits, each token kind supported only by its own kind, symbols such as `%`, `$`, `<`, `~` and a minus sign are tokens, ages are not decades, regular inflections match whatever the case, closed-class words such as `not` match only themselves, names via aliases that are names; no synonyms); media titles and alt text likewise against their sources and cited facts |
| G3 Atomic | adversary | One event or attribute per claim |
| G4 Adversary | cross-model | Independent context, refute by default, sees records only, never the extractor's reasoning; a verdict counts only while the record matches its `judged_sha256` |
| G5 Corroboration | deterministic | Counting only sources whose own quotes cover the whole claim plus event_date and place (the G2 test per source, never pooled across sources; a name word only from a page that contains it): one registry-allowed primary document, or 2+ independent holders (one registry entry, one registered domain, or a name claiming a registered holder counts once; two sources whose quotes are near-verbatim copies, similarity >= 0.85 or one contained in the other at 8+ tokens, or linked by `derived_from`, count once) with at least one counting registry-allowed primary or institutional source |
| G6 Grounded writing | deterministic + adversary | Every draft sentence, title and caption cites verified facts and contains no content word its cited claims lack (the G2 rule); quoted text in any quotation style (straight or curly quotes, guillemets, CJK brackets) equals a direct-quote fact; the final export needs a current sentence-adversary verdict in `drafts/grounding.jsonl` |
| G7 Edit lock | deterministic | A verified claim changed after verification drops to pending |
| G8 Human | person | Only approved or edited items backed by `review/decisions.jsonl` are exported; edits are re-verified first |
| G9 Source authority | deterministic | canonical url; primary/institutional only for a registry publisher that allows it (primary only on its record pages), under its registry name; no registered holder's name on another site; no media-only publisher (Commons, any Wikimedia host) as fact evidence; banned hosts (Wikipedia and mirrors, Wikiquote, Wikidata, quote sites) as defence in depth |
| G10 Snapshot integrity | adversary + deterministic | Per source (`live_by_source`: found / not_found / unreachable + url checked): no cited source not_found, and every source G5 counts (all cited sources if it counts none; all for media) found, or unreachable only on an http/api snapshot; an unreachable source G5 does not count is ignored. Legacy verdicts (only `quote_in_live`) keep the per-fact rule: browser or manual snapshots need "yes" |
| G11 Identity | deterministic | A fact is a statement about the person's life, work or legacy that a museum visitor could read; catalogue metadata (headings, control numbers, field names) is provenance. An `identity` fact establishes a name, so its claim contains an alias from inductee.json; otherwise it stays pending (recategorize a real life fact, withdraw metadata) |

Write boundary: every record is schema-validated at the moment it is written (`tools/ihh/schema.py`,
the schema validate.py reports as SCHEMA). `tools/ihh/records.py` refuses to write a new or changed
record that breaks it (`SchemaError`, nothing written, each record and field named);
`merge_staging.py`, `apply_review.py` and `fetch_snapshot.py` check every file first, so a refusal
leaves all files as they were. Fix the record (for a candidate, its staging file); never bypass the
check with a plain file write. A search's `results` is an integer count (null when unknown);
commentary goes in `notes`. The shipped data must pass `validate.py --all`
(`tools/tests/test_shipped_data.py`): a new or stricter rule lands with the repair of every record on
file that it flags (fixed, recategorized or withdrawn through `records.py`).

`primary_document` is derived, never authored: true exactly when an evidence item cites a source of
type primary. `merge_staging.py` sets it and `compute_status.py` keeps it current.

## Commands

Run from the project root.

```bash
python3 tools/new_inductee.py <slug> --name "<Full Name>" --code <CODE> [--ihh-url <url>]
python3 tools/fetch_snapshot.py <slug> <SRC>                  # exit 2: blocked, use the browser fallback
python3 tools/fetch_snapshot.py <slug> <SRC> --from-file page.txt --method browser   # or --method manual
python3 tools/merge_staging.py <slug>                          # staging/*.jsonl -> permanent ids
python3 tools/apply_rights_rule.py <slug>|--all [--dry-run]    # approved LoC/NARA rights rule on media on file
python3 tools/adversary.py <slug> --all-pending --engine auto --parallel 4
python3 tools/adversary.py <slug> --ids <ID> [<ID> ...] --engine codex
python3 tools/adversary.py <slug> --all-pending --engine claude-handoff   # writes adversary_requests.jsonl, exit 3
python3 tools/adversary.py <slug> --ingest <verdicts.jsonl>    # record fallback Claude verdicts (each with the request's judged_sha256)
python3 tools/compute_status.py <slug>|--all
python3 tools/check_grounding.py <slug> [--json]              # --json adds each unit's unit_sha256
python3 tools/check_grounding.py <slug> --record <verdicts.jsonl>   # sentence-adversary verdicts -> drafts/grounding.jsonl
python3 tools/validate.py <slug>|--all                         # exit 1 on any error
python3 tools/export.py <slug>|--all --preview                 # review package, stamped DRAFT
python3 tools/export.py <slug>|--all                           # publishable: approved items only
python3 tools/apply_review.py <slug> data/inductees/<slug>/review/decisions.jsonl
python3 -m pytest tools -q
```

## Running the pipeline for an inductee

Ask Claude Code to run the saved workflow. Workflow name: `ihh-inductee-pipeline`.

```json
{"name": "John Muir", "slug": "muir", "code": "MUI", "date": "2026-10-09",
 "ihh_url": "https://immigranthallofhonor.org/inductees/inductee-john-muir/",
 "adversary": "auto", "max_facts": 80}
```

| Arg | Required | Meaning |
|---|---|---|
| name, slug, code | yes | Who, folder name, id prefix |
| date | yes | Today, YYYY-MM-DD (the workflow runtime cannot read the clock) |
| ihh_url | no | Current IHH page; looked up on the IHH site when omitted; none for a brand-new inductee |
| adversary | no | `auto` (Codex if logged in, else Claude fallback), `codex` (Codex only), `claude` (fallback only) |
| max_facts | no | Cap on new facts per run (default 80); the excess is deferred to `staging/deferred-<run>/` and logged |
| root | no | Project root if the repo is not at the default path |

Phases: Identify (authority records, aliases, namesake check) -> Baseline (stage the current IHH
page's claims as secondary, flag suspected errors) -> Search (six parallel families: loc, nara,
smithsonian, institutional, media, domain) -> Merge (dedup, split, merge, validate, repair once, then
withdraw) -> Verify (adversary) -> Corroborate (one targeted search per single-source key fact, then
verify again) -> Draft (verified facts only) -> Ground (check_grounding plus a sentence adversary;
repair once, then drop) -> Critic (gaps) -> Package (validate, export --preview, summary).

Re-running on the same slug resumes: existing ids are kept and new candidates are appended. The
workflow never commits, pushes, or publishes, and does not touch `docs/handoff/`; the session that
ran it reviews the summary, updates handoff, and commits. Its return value lists counts by status,
disputed and single-source items, gaps, export paths, and everything dropped (failed families,
deferred candidates, withdrawn facts, dropped sentences, failed adversary agents).

Pilot on one inductee before running the rest.

Editing the workflow script: plain JavaScript; `meta` stays a pure literal whose phase titles match
the `phase()` calls; no `Date.now()`, `Math.random()`, or argless `new Date()` (they throw in the
runtime; dates come in through args); filter `null` from agent results. The runtime runs the body
inside an async function, so the final top-level `return` is the result and plain `node --check`
rejects the file. Check syntax with the body wrapped:

```bash
f=.claude/workflows/ihh-inductee-pipeline.js; t=$(mktemp -d)/wf.mjs
awk 'NR==1,/^}$/{print; next} !w{print "export default async function body(args, agent, parallel, pipeline, phase, log) {"; w=1} {print} END{print "}"}' "$f" > "$t" && node --check "$t"
```

## Tour research for an inductee

Workflow name: `ihh-tour-research` (contract: SPEC section 12). Run it after `ihh-inductee-pipeline`.

```json
{"slug": "lamarr", "date": "2026-11-03", "mode": "enrich",
 "app_tour": "<IHH-revamp>/app/src/tour/data/tour-use.generated.json",
 "model": "gpt-6-sol", "max_items": 12, "search_budget": 60, "snapshot_budget": 80}
```

`fresh` builds the chapter map from verified facts (`propose`) without looking at the shipped tour;
`enrich` starts from the shipped tour (`seed`) and adds. Commands, also usable by hand or by a runner:

```bash
python3 tools/tour_research.py propose|seed|check|assemble <slug> [--app-tour FILE] [--force]
python3 tools/tour_research.py plan <slug> --run-id tour-<date> --date <date> [--max-items 25]
python3 tools/tour_research.py search <slug> --run-id R --family tour-ca --query "..." [--dates 1937/1937]
python3 tools/tour_research.py log <slug> --run-id R --family tour-web --tool "web search" --query "..." --before   # then again with --results N
python3 tools/tour_research.py snapshot <slug> <tmp-id> --run-id R      # exit 2 blocked (drop), 3 JavaScript page
python3 tools/tour_research.py gate <slug> --run-id R --model gpt-6-sol [--from-step merge] [--rejudge IDS]
python3 tools/tour_research.py docs|compare|status <slug> --run-id R [--app-tour FILE]
```

Order: plan, search/snapshot, gate, assemble, gate again (merges any search made while assembling),
docs. `docs` refuses while a staged search or candidate is unmerged.

Codex must be the nvm build (0.162.1 or later) first on PATH; the Homebrew 0.156.0 binary refuses the
account's models (LESSONS 2026-10-15).

## Adding or fixing a fact outside the workflow

Same path as the workflow, one step at a time: stage the source and candidate in
`staging/<name>.jsonl` -> `fetch_snapshot.py` -> copy the quote from the snapshot file -> `merge_staging.py`
-> `adversary.py --ids <new ids>` -> `compute_status.py` -> `validate.py`. Never write the main JSONL
files by hand, never edit a snapshot (re-fetch instead), never set `status` except `rejected` or
`conflicting` by a person.

## Wording claims and draft text

G2 and G6 apply one rule: no content word that the support does not contain. Only grammatical
glue is free (`FUNCTION_WORDS` in `tools/ihh/normalize.py`; never add a quantity, negation, time,
order, modal or evaluative word to it, a test fails if you do). In practice:

- Extractor: restate the quote in its own words. If the claim needs a word the quote lacks
  ("holds", "became", "first", "later that year"), quote more of the snapshot or drop the word.
  Paraphrases and synonyms fail ("became a citizen" against "citizenship"); regular inflections
  pass ("arrived" against "arriving", "buildings" against "building", and all-caps records such as
  "ARRIVED IN NEW YORK"); irregular forms do not ("taught" against "teaching").
- Write numbers, symbols and time spans in the source's own form. A date's day never supports a
  count and a code ("B12") never supports "12"; write a patent number from "US2292387A" as the
  code or as "2,292,387". "50%" needs "%" in the quote (not "percent"), "-5", "<5" and "~300" need
  their sign. "a decade" needs "a decade" or "10 years"; "in his forties" is an age and needs the
  same phrase, never a year. A month alone ("in May") is covered by a date in that month, but a
  date's month never supplies a word ("marched", "may", "august"). "not", "may", "will", "even"
  and the other closed-class words need the identical word in the quote ("noted" is not "not").
- Aliases in inductee.json are names only (no numbers, dates or lower-case content words); a
  name supplies its own capitalized words, nothing else.
- Drafter: write sentences, titles and captions with the cited claims' words. "Teaching career"
  fails against "taught at Example College"; "Taught at Example College" passes. An attribution
  verb ("wrote", "said") around a direct quote needs a cited fact that contains it.
- A failure names the token (`word 'holds' not in evidence quotes`); fix the wording, never the gate.

## Review and export

1. The pipeline ends with `export.py --preview`: every block is stamped "DRAFT — NOT REVIEWED".
2. The reviewer reads `export/REVIEW.md` (disputed and single-source items with the adversary's
   rationale and the evidence) and decides approve, edit, reject, or note per item.
3. Decisions go to `review/decisions.jsonl` as `{date, reviewer, item_id, action, before, after, note}`.
   `before` is what the reviewer saw (a fact's claim, a media item's `media_lock_sha256`); an approval
   without it does not count for G8.
   The review dashboard (website phase) will write this file; until then a maintainer records the
   reviewer's marked-up REVIEW.md.
4. `apply_review.py <slug> <decisions.jsonl>` applies them. Edited claims drop to re-verification
   (G1, G2, G7, adversary): run `adversary.py --ids <edited ids>`, `compute_status.py`, `validate.py`.
5. `export.py <slug>` without `--preview` writes the publishable package (verified + approved/edited
   items whose decision is in `review/decisions.jsonl`; draft sentences only when all their facts
   qualify and the sentence adversary's current verdict is supported). It refuses if validate fails.
   Never set `review.state` by hand: an approval counts only when `apply_review.py` recorded it.
6. IHH pastes `export/wordpress.html` into WordPress (steps in `docs/pipeline/README.md`).

## Codex adversary

- Setup: `codex --version` (codex-cli 0.156.0 verified 2026-10-08) and `codex login status` must print
  a logged-in state. If not, the person runs `codex login` themselves; never enter credentials for them.
- `adversary.py` batches pending items by source and runs
  `codex exec --skip-git-repo-check -s read-only -c 'web_search="live"' --output-schema <schema> -o <out>`
  from the project root with stdin closed (an open stdin hangs it). Verdicts record `model` as `codex:<model>`.
- Codex cannot read JavaScript-rendered pages such as catalog.archives.gov/id/N (smoke test,
  2026-10-08). That is why every source keeps a machine-readable `fetch_url` and a saved snapshot, and
  the prompt gives Codex both.
- Fallback: with `--engine auto` and no Codex login, or `--engine claude-handoff`, `adversary.py`
  writes `adversary_requests.jsonl` and exits 3. The workflow then runs one fresh Claude agent per
  request, following that request's own prompt (built only from record fields), and records the
  verdicts with `adversary.py --ingest <file>` (`model` = `claude:<model>`). Each verdict line carries
  the request's `judged_sha256` unchanged; `--ingest` refuses it if the record changed since the
  request was written. Outside the workflow, do the same: a fresh agent per item, never the context
  that extracted the fact.
- A failed or timed-out Codex call records `unclear`, never `supported`.
- The adversary judges source type by the registry rule the gates use: each source line in its prompt
  shows the registry standing, and an unlisted publisher is secondary by rule, so a secondary label on
  it never fails the fact. A publisher that could be registered goes in the verdict's optional
  `registry_suggestion` (advice for `data/registry/PROPOSED.md`, never a status input). The standing is
  not part of `judged_sha256`: verdicts given under the old prompt stay as they are until the item is
  judged again (`adversary.py --ids <ids>`).

## Media rules

- Embed only `verified` items with `license_class` public-domain, cc0, cc-by, or cc-by-sa; link
  everything else.
- The rights statement is the holder's: the institution holding the original item (LoC, NARA, ETH
  Library, USPS, a museum or archive). For a Wikimedia Commons file, follow its source link to the
  holder's item page, stage and snapshot that page as one of the item's sources, and copy
  `rights_statement`, `rights_url` and `credit` from it; Commons stays a discovery source only. No
  holder statement found: `rights_statement` null, `license_class` unknown (the site links to it).
  G1 allows a missing statement only while the item is not embeddable.
- Approved rights rule (user decisions 2026-10-09, "Rights mapping for LoC and NARA" and "Extended
  LoC rights rule"; SPEC section 3.4.1; `tools/ihh/rights.py`, the only implementation): for a source
  the registry resolves to `loc` (loc.gov), a rights advisory that begins "No known restrictions on
  publication" or "No known restrictions on images made by the U.S. Government" is `public-domain`;
  LoC's full HABS/HAER/HALS wording "...U.S. Government; images copied from other sources may be
  restricted" (one phrase, not a caveat) only with positive evidence of government creation in the
  record (part_of or a creator is HABS, HALS, HAER or "United States. <agency>"), no outside-entry
  marker ("HALS Challenge Entry", competition, contest, prize), every named creator heading carrying a
  government affiliation itself (a staff role such as photographer alone is not evidence; family
  members, owners, architects block it), and no item field marking the image as a copy ("photocopy",
  "copied from", "copy of", "recopy" ...); `apply_rights_rule.py` withdraws its own earlier
  public-domain grant (back to unknown) when the rule now bars an item no person has approved, edited
  or rejected, never a licence a person set;
  "No known restrictions on work by staff photographers" only when the same LoC record names a U.S.
  News & World Report staff photographer (Warren K. Leffler, Thomas J. O'Halloran, Marion S.
  Trikosko, John Bledsoe, Chick Harrity) in a creator or contributor heading, or in notes, the
  statement of responsibility or the rights text as a credit ("photograph by <name>", "Photographer:
  <name>", "<name>, photographer"; a mere mention is not a credit), and "No known copyright restriction" only when the record is in the New York
  World-Telegram & Sun collection and credits a staff photographer ("NYWT&S staff photograph",
  "World-Telegram photo", or a named photographer); otherwise, or with a wire-service credit (AP,
  Acme, UPI, INP, Underwood, Harris & Ewing ...), never usable. An approved wording followed by a
  caveat asserting a restriction ("may be restricted", "restrictions apply", "copyright
  restrictions", "permission required", "not in the public domain", "may be protected", "privacy and
  publicity rights") is never usable; "No renewal in Copyright office ..." and "For more information,
  see ..." do not block. For `nara` (archives.gov), use
  restriction status "Unrestricted" is `public-domain`. LoC "Publication may be restricted" or
  "Rights status not evaluated", and NARA "Restricted", "Restricted - Possibly"/"Partly"/"Fully" or
  "Undetermined", are never usable (unknown or rights-restricted). Exact phrases, case-insensitive,
  read from the holder's own rights field in a snapshot that passes G1 (LoC `rights_advisory` /
  `rights_information`, NARA `useRestriction.status`, never the access restriction). Never from a
  Commons tag or another host. Public domain needs `rights_statement` to be the holder's exact
  wording, which the site shows next to the item. Do not set these by hand: `merge_staging.py`
  applies the rule to staged media, `apply_rights_rule.py <slug>` to media on file; then
  `compute_status.py`, `adversary.py <slug> --ids <changed ids> --engine codex`, `compute_status.py`,
  `validate.py`. The adversary prompt carries the rule (`rights.RULE_TEXT`).
- Private writings (owner decision 2026-10-20; SPEC 3.4.3): a letter, petition, application text or
  memo written by a private person or body, even in NARA/LoC files, is embeddable only if every author
  died before 1956 (each death year backed by a verified fact or an authority-record quote), the holder
  states "public domain", or it was published before 1931; otherwise link-only. NARA "Unrestricted"
  alone never grants it. Record who wrote it with `tools/set_authorship.py <slug> <ID> --json
  '{"kind": "private", "authors": [{"name": ..., "death_year": ..., "death_basis": {"fact_id": ...}}]}'`
  (or kind `federal`), then `apply_rights_rule.py`, `compute_status.py`, `adversary.py --ids`,
  `compute_status.py`, `validate.py`. Facts quoting a link-only item's transcription are unaffected.
- `rights_statement` is copied verbatim from the holder's page. Commons templates and Internet Archive
  licence fields are uploader claims: leads only until the holder's own statement is found.
- Anything we build (3D model, 360 scene, illustration) has `reconstruction: true`, a
  `reconstruction_basis` of fact and source ids, and the label "Reconstruction based on [source]".
  The adversary judges a reconstruction against its basis (`adversary.py --ids <id>`).
- `alt_text` and `title` are published with the item: they pass G2 against the item's sources and
  cited facts, the adversary judges them, and changing them after verification needs re-verification.
- Avatar `quote` lines equal a direct-quote fact exactly; avatar `narration` in the inductee's voice is
  labeled "AI recreation" on the site.

## Residual risks (documented, not solved)

- An agent could fabricate a browser or manual snapshot. G10 requires the adversary to find the quote
  live, and the reviewer sees the link.
- Same-source errors (an archive's own catalog mistake) pass every gate. G5 and the `conflicting`
  status reduce this.
- G2/G6 catch added words, not omitted ones (a dropped "not", a swapped "he"/"she"), ordinals equal
  cardinals, stemming can join two open-class words that share a stem ("news"/"new"), a bare number
  from 1000 to 2100 is read as a year (so "1921 patents" is covered by "in 1921"), and "the fifties"
  is covered by a year in that decade of any century; the adversary's `entailed` and
  `adds_information` judgements cover these. The rule has no synonym table, so faithful paraphrases
  fail until reworded with the source's words, and symbols, ages, time spans, codes and closed-class
  words must appear in the source's own form (a deliberate cost: the AI states facts; it does not
  author them). SPEC section 11 lists each case.
- The Claude fallback adversary and the v1 sentence adversary (Ground phase) are the same model family
  as the extractor and drafter, in separate contexts. Cross-model checking applies only when Codex runs.
- The IHH site returns HTTP 403 to plain fetches, so its snapshots are browser snapshots and need live
  confirmation by the adversary.
- The registry is only as good as its review. A records-holder entry (government or archive) without
  `primary_paths` still allows primary on every page of its domain; the shipped registry lists none
  yet, so a person should add each records holder's record paths. Two unregistered mirrors on
  different domains count as two secondary holders (G5 still needs a registered primary or
  institutional source). A redirect to another path of the same record (a merged record) exits 1
  until the url is updated. SPEC section 11 lists these.
- Likeness and publicity law is outside the pipeline; see DECISIONS.md (Einstein risk mitigations).
- A standalone API-key runner is future work: `docs/pipeline/STANDALONE.md` (design only).
