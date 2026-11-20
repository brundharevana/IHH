---
name: ihh-new-inductee
description: Use when someone asks to research a new inductee for the Immigrant Hall of Honor (IHH), says "research a new inductee", "add inductee <name>", "new IHH inductee <name>", or types "/ihh-new-inductee <name>". Takes a person's name and runs the whole verified-research pipeline end to end (identify, IHH baseline, six search families, merge, Codex adversary, corroborate, draft, ground, critic, package, tour research), fetching politely and only verified information, then builds the handoff package for IHH's review team with tools/handoff_bundle.py. Never publishes or pushes.
---

# New IHH inductee: from a name to a handoff package

Project root: the repository that holds this skill (IHH-facts). Run every command from it.

The contract is `docs/pipeline/SPEC.md` (records 3, gates 4, status 5, tools 6, workflow 9, tour step
12). The operating guide for every tool is `.claude/skills/ihh-verified-facts/SKILL.md`; read it first.
This skill only says what to run, in what order, under which rules. When they differ, SPEC wins.

## Hard rules (every step, no exceptions)

1. **Polite fetching.** At least 4 s between requests to one host. Every catalog search goes through
   `tools/tour_research.py search`, every page read through `tools/tour_research.py snapshot` (both pace,
   count and log; `fetch_snapshot.py --pace 4` inside). Never loop curl or urllib against a host.
2. **Never bypass a bot block.** HTTP 403, 429 or a challenge page closes that host for the run. Do not
   retry it, open it in a browser, change the User-Agent or use another fetcher or a cache copy. The
   tour CLI records it in `staging/tour/<run>/run.json`; a block met any other way gets one line in
   `staging/check-by-hand.jsonl`: `{"date", "run_id", "host", "url", "what", "reason"}`. A
   JavaScript-only page (exit 3) may be read in your own browser tab, where a browser is allowed;
   otherwise defer it the same way.
3. **Every search is logged**, including empty ones and discovery searches (Wikipedia, Wikidata, web
   search). Web search: `tour_research.py log ... --before` first (make the search only on exit 0),
   then `log ... --results N --notes "..."` right after.
4. **Codex adversary, pinned model.** Every `codex exec` runs with stdin closed (`</dev/null`) under
   `timeout`, with `-m gpt-6-sol`. `adversary.py` and `tour_research.py gate` do this when given
   `--model gpt-6-sol`; always pass it. A verdict recorded as `codex:default` or any other model is
   refused: judge that item again. Put the nvm Codex build (0.162.1 or later) first on PATH; the
   Homebrew 0.156.0 binary refuses the account's models.
5. **No personal data in requests.** Queries hold only the inductee's names, places, years and record
   titles; never a reviewer's or the owner's name or email. The tour CLI refuses such text; respect it.
6. **Nothing published or pushed.** No `git push`, no WordPress change, no email, no form, no sign-in, no
   download. `export.py --preview` only. Commits stay local, on the inductee's own branch.
7. **Human review before approval.** Never set `review.state`, never run `apply_review.py` with invented
   decisions, never run `export.py` without `--preview`. Only an IHH reviewer approves.
8. **Facts only from saved sources** (SPEC 1): quotes copied character for character from the snapshot
   file; Wikipedia and Wikidata are discovery only; statuses come only from `compute_status.py`; main
   record files change only through `tools/ihh/records.py`; nobody writes `data/registry/`.
9. **Gates are never weakened.** A failing gate means fix the record (or withdraw it), never the gate.

## Step 0: setup and identity

```bash
export PATH="$(dirname "$(ls $HOME/.nvm/versions/node/*/bin/codex | tail -1)"):$HOME/.pyenv/shims:$PATH"  # nvm codex, Python 3.12
codex --version </dev/null; timeout 30 codex login status </dev/null        # must say logged in
DATE=$(date +%F)
```

- **Slug**: the surname, lowercase ASCII, hyphens between words (SPEC 2): Irving Berlin -> `berlin`.
- **Code**: the first three letters of the surname, uppercase: `BER`.
- **Refuse** a slug or code already in use: `ls data/inductees/` and
  `grep -h '"code"' data/inductees/*/inductee.json`. If either is taken, stop and ask the person for
  another; never pick one silently. `new_inductee.py` refuses both as well.
- **Branch**: `git switch -c <current branch>-<slug>` so the main store stays unchanged until review.
- **Run id**: `R=<slug>-$DATE`; every staged row, search and gate call uses it.

```bash
python3 tools/new_inductee.py <slug> --name "<Full Name>" --code <CODE> [--ihh-url <url>]
python3 tools/validate.py <slug>     # an empty folder passes
```

## Route A: the saved workflows (when the session has the Workflow tool)

1. Workflow `ihh-inductee-pipeline`, args `{"name", "slug", "code", "date": "$DATE", "adversary": "codex"}`
   (add `ihh_url` when known). It runs the ten phases of SPEC 9 and returns counts and gaps.
2. Workflow `ihh-tour-research`, args `{"slug", "date", "mode": "fresh", "model": "gpt-6-sol"}`.
3. Then Step 12 (package) below. Review each workflow's summary before going on.

## Route B: the CLI, step by step (no Workflow tool, or no subagents)

Same phases, driven by hand. Define `TR() { python3 tools/tour_research.py "$@"; }` (a function: zsh does not
split a `TR` string) and write `RUN` below as `--run-id $R --date $DATE`.
Stage candidates with temporary ids (`tmp-<family>-S-1`, `-F-`, `-M-`) in `staging/<family>.jsonl`, in
the SPEC 3 shapes; `staging/merged/` of an earlier inductee has examples. A source on a registered host
leaves `institution` empty (the merge fills it); any other source names its site. Run
`merge_staging.py <slug> --dry-run` before the gate to catch schema problems early.

1. **Identify** (family `identify`). Search the LoC name authority and catalogs:
   `TR search <slug> --run-id $R --date $DATE --family tour-loc --query "<name>"` (also `tour-nara`, `tour-wikidata` for ids
   as discovery only). Stage the authority record (id.loc.gov page) as a source; snapshot it
   (`TR snapshot <slug> <tmp id> --run-id $R --date $DATE`). Stage one `identity` fact per variant name, quoted. After the
   first gate, write aliases (only names a merged identity quote shows), `authority.loc_naf`,
   `birth_year`, `death_year` into inductee.json with `records.write_json`. Check namesakes.
2. **Baseline** (family `baseline`). Find the IHH page (WordPress REST,
   `https://immigranthallofhonor.org/wp-json/wp/v2/pages?slug=inductee-<...>`) with one snapshot
   request. The site has answered plain fetches with HTTP 403: that is a block (rule 2). Record it in
   `staging/check-by-hand.jsonl` and go on without a baseline. If it answers, stage its claims as
   `secondary` and flag suspected errors in notes.
   Always set `ihh_url` to `https://immigranthallofhonor.org/inductees/inductee-<first>-<last>/`
   (the pattern every IHH inductee page uses). A web search that "finds no IHH page" is not proof
   there is none: the site blocks crawlers. When the page was not read, it goes on the check-by-hand
   list as "IHH profile: ask IHH for the page text", never silently skipped.
3. **Search**: six families, one staging file each (SPEC 9 phase 3, briefs in the workflow script):
   `loc`, `nara`, `smithsonian`, `institutional`, `media`, `domain`. Cover life stages first (birth,
   immigration and arrival, citizenship, main work, awards, death), then volume; at most 80 facts.
   Media: the holder's own rights statement from its snapshotted item page (SPEC 3.4, 3.4.1).
4. **Merge and Verify** (one command): `TR gate <slug> --run-id $R --date $DATE --model gpt-6-sol` snapshots unsnapshotted
   sources (blocked ones are deferred with their candidates), runs `merge_staging.py` (dry run, then
   real), `adversary.py --engine codex --model gpt-6-sol` on the new ids, `compute_status.py` and
   `validate.py`. Exit 1 at merge: fix the named staged candidate once, rerun with `--from-step merge`.
   G1/G2/G11 failures after merge: one repair through `records.py`, then withdraw
   (`extractor.verdict` = `withdrawn`, reason in notes). Never edit a snapshot or a quote.
5. **Corroborate**: for each `single-source` fact in birth, immigration, citizenship, work, invention,
   award, death: one focused search for a different registered holder whose own quote covers the whole
   claim (SPEC G5). Stage and snapshot the source, run the gate (it merges the source), then append
   `{source_id, quote, locator}` to the fact with `records.update_jsonl` (copy facts.jsonl to
   `staging/facts.before-corroborate-$R.jsonl` first) and run `TR gate <slug> --run-id $R --date $DATE --model gpt-6-sol
   --rejudge <ids>`.
6. **Draft**: `drafts/profile.json` (SPEC 7) from `verified` facts only, in the claims' own words;
   `python3 tools/check_grounding.py <slug>` until it passes.
7. **Ground**: `check_grounding.py <slug> --json`; judge every sentence, title and caption with Codex
   (`timeout 900 codex exec --skip-git-repo-check -s read-only -m gpt-6-sol --output-schema S -o OUT
   "<prompt>" </dev/null`; refute by default; the prompt holds each unit and its cited claims). Record
   with `check_grounding.py <slug> --record FILE --model codex:gpt-6-sol --run-id $R`. Repair a failing
   unit once from facts, else drop it; set `used_in` to the locations that cite each fact.
8. **Critic**: write `gaps` (life stages with no verified fact, single-source key facts, unusable media,
   deferred candidates) without stating an unverified fact; withdraw catalogue metadata posing as a fact.
   Then `compute_status.py <slug>` and `validate.py <slug>`.
9. **Tour research** (SPEC 12): `TR propose <slug> --run-id $R --date $DATE --force`, `TR plan <slug> --run-id $R --date $DATE --max-items 12`;
   research each work item with `search`, `log` and `snapshot` only; `TR gate ... --model gpt-6-sol`;
   edit `drafts/tour-map.json` by judgement (verified facts and media only), `TR check <slug>` until it
   passes, `TR assemble <slug> --date $DATE`, the closing gate, then `TR docs <slug> --run-id $R --date $DATE`.
10. **Order of reads.** A block on any host of a holder closes the whole holder domain for the run
    (findingaids.loc.gov closes www.loc.gov and tile.loc.gov). Read a holder's item records and
    Chronicling America pages before its secondary hosts (finding aids, blogs), and never start a new run
    id to reopen a blocked host.
11. **Checkpoint rule.** If the run will take more than about 4 hours, stop at a clean checkpoint after
    Verify (gate exit 0, validate green), skip to Step 12, and say in the summary which phases did not run.

## Step 12: package and hand off

```bash
python3 tools/compute_status.py <slug>
python3 tools/validate.py <slug>            # must exit 0; else report each failing gate, change no gate
python3 tools/export.py <slug> --preview
python3 tools/handoff_bundle.py <slug> --zip   # handoff/<slug>-<date>/ and .zip (gitignored)
python3 tools/validate.py --all && python3 -m pytest tools -q
```

`handoff_bundle.py` copies only: README-FOR-IHH.md, REVIEW.md, the export files (tour files when
present), CHECK-BY-HAND.md and MANIFEST.json. It refuses an email address unless a snapshot quotes it
or a person names it with `--allow-email` (an institution's published address); a person's name or
email is never allowed. Check the bundle: unzip it and compare each file's sha256 with MANIFEST.json.

A new inductee makes `test_content_check.py::test_shipped_einstein_chapters_and_hall_pass` fail
("inductee <slug> has no easel") until `content/hall.json` places it in the museum hall. That is a site
decision for the owner: report it, never edit the test or the hall to pass it.

Commit the inductee's data on its branch (`data(<slug>): ...`, atomic: store after Verify, draft and
grounding, tour research, preview export). Never commit `handoff/`.

## Summary to print (short)

From the `handoff_bundle.py` JSON output:

```
<Name> (<slug>, <CODE>), run <R>, branch <branch>
Facts: verified N, single-source N, disputed N, rejected N (pending N)
Media by licence: public-domain N, cc0 N, cc-by N, cc-by-sa N, rights-restricted N, unknown N
Deferred hosts: <list or none>; check by hand: N items
Bundle: handoff/<slug>-<date>/ (+ .zip); phases not run: <list or none>
Next: IHH reviews REVIEW.md; decisions go to review/decisions.jsonl via apply_review.py
```

Also list the adversary's registry suggestions (for a person to review into
`data/registry/PROPOSED.md`) and every disputed item in one line each.

## Provenance for IHH's chatbot

Every search row, snapshot meta, verdict (with `model` and `judged_sha256`) and decision stays in the
store; `provenance.jsonld` and `tour-research.jsonld` carry them out. Never delete a staging log, an
adversary log (`staging/adversary/`) or a deferred folder: they are the audit trail.
