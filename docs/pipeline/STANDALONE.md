# Standalone runner: design (future work, no code)

Status: design only, 2026-10-08. The pipeline today runs inside Claude Code as the saved workflow
`.claude/workflows/ihh-inductee-pipeline.js` (DECISIONS.md, 2026-10-08: "build for Claude Code now;
document a standalone API-key runner for later"). This document describes how the same pipeline
could run as a plain program with an Anthropic API key, so IHH could run it without Claude Code.

The contract does not change. `docs/pipeline/SPEC.md` (records, gates, status derivation, tools)
applies to both runners, and the Python tools in `tools/` are reused unchanged. Only the
orchestration layer is replaced.

## 1. What the runner is

A Python program (standard library plus the official `anthropic` SDK; the `openai` SDK only if the
OpenAI adversary is enabled) with one command per step:

```
run      <slug> --name ... --code ... [--ihh-url ...] [--adversary auto|openai|claude] [--max-facts 80]
resume   <slug> <run_id>
status   <slug>
```

It owns three things the Claude Code workflow gets for free:

1. **The phase driver.** The same ten phases as SPEC section 9 (Identify, Baseline, Search, Merge,
   Verify, Corroborate, Draft, Ground, Critic, Package), with the same fan-out (six search families
   in parallel, one adversary call per item or per batch) and the same barriers (Merge, the
   corroboration attach step).
2. **The agent loop.** Each "agent" in the workflow becomes a Messages API conversation with a
   fixed tool set, run until the model stops calling tools, ending in a structured result validated
   against the same JSON schemas the workflow uses.
3. **Run state.** A `staging/run-<run_id>.json` file records each phase's result, so `resume`
   skips finished phases. This replaces the workflow runtime's cached resume.

## 2. Model calls

- **Extractor and drafter agents**: the Messages API with tool use, adaptive thinking, and an explicit
  `effort` per phase (higher for extraction, Merge and Ground; lower for mechanical steps). The model
  id is pinned in a config file and recorded on every record (`extractor.model`), never chosen at
  run time. As of 2026-09-25 the default would be `claude-opus-5-5`; switching a phase to a cheaper
  model is an IHH budget decision (section 5), made after measuring quality on the pilot.
- **Structured results**: each agent ends with output constrained to the step's JSON schema
  (`output_config.format`), then the runner validates it again before using it.
- **Tools given to agents** (custom tools the runner executes, nothing else):

  | Tool | Backed by |
  |---|---|
  | `search_api(family, url)` | HTTPS GET to an allowlisted search endpoint (loc.gov `fo=json`, NARA proxy, Commons API, archive.org advancedsearch, collections.si.edu, id.loc.gov, IHH WordPress REST); returns the JSON or text and logs the search to `staging/<family>.searches.jsonl` automatically |
  | `stage_record(kind, record)` | Validates the candidate against SPEC section 3 and appends it to `staging/<family>.jsonl` |
  | `snapshot(source_temp_id)` | `tools/fetch_snapshot.py`; returns the snapshot path and text |
  | `read_snapshot(path, start, length)` | Reads a saved snapshot, so quotes are copied from the file |
  | `check_quote(snapshot, quote)` | G1 check before a quote is staged (`tools/ihh/normalize.py`) |
  | `run_tool(name, args)` | Fixed allowlist: merge_staging, validate, compute_status, check_grounding, export --preview |

  The server-side web search tool can be offered to the `institutional` and `domain` families for
  discovery. The server-side web fetch tool is not a substitute for `snapshot`: it only fetches URLs
  already present in the conversation, it does not run JavaScript, and its output is not a saved,
  hashed snapshot. Every source still goes through `fetch_snapshot.py`.

- **No shell tool and no file-write tool.** Agents act only through the tools above, which write only
  inside `data/inductees/<slug>/`. This is stricter than the Claude Code version, where agents have a
  shell and the person approves permissions.

## 3. The adversary

The adversary must stay independent: a separate conversation that sees only record fields (claim,
evidence quotes and locators, url, fetch_url, snapshot text, source type, aliases), never the
extractor's conversation. Three engines, chosen by `--adversary`:

| Engine | How | Notes |
|---|---|---|
| openai (cross-model, preferred) | OpenAI API with a JSON-schema response format and web access for the live check; same prompt and schema as `tools/adversary.py` | Needs an OpenAI API key. Keeps the cross-model rule from DECISIONS.md. The Claude Code version uses the Codex CLI with a ChatGPT login instead; on a server that login is not available, so this is a direct API call |
| codex | The existing `tools/adversary.py --engine codex` path | Only if the Codex CLI is installed and logged in on the runner machine |
| claude (fallback) | A fresh Anthropic conversation per item with the refute-by-default prompt; verdicts written with `adversary.py --ingest` | Same model family as the extractor; separate context only. Record `model` as `claude:<id>` so reviewers can see it |

Because the snapshot text can be placed in the adversary prompt directly, the standalone adversary
does not depend on reading files (the Codex smoke test showed the live NARA page is unreadable
without the snapshot). The live check (G10) still needs web access for `browser`/`manual` snapshots.

Adversary calls do not need an immediate answer, so they can go through the Message Batches API
(Anthropic) or the equivalent batch endpoint (OpenAI) at roughly half the per-token price, at the
cost of latency (results within hours, not minutes).

## 4. What changes compared with the Claude Code version

| Area | Claude Code workflow | Standalone runner |
|---|---|---|
| Orchestration | Workflow script; agents, fan-out and resume provided | Runner code; its own concurrency, retries, rate-limit backoff and resume file |
| Agent abilities | Shell, file tools, web tools, in-app browser | Only the custom tools in section 2 |
| Blocked pages (HTTP 403/429, JavaScript-only) | In-app browser, snapshot `--method browser` | No browser. Options: queue the source as "needs manual snapshot" for a person (default), or add a headless browser (Playwright), which is a new dependency and a new attack surface. The IHH site itself returns 403 to plain fetches, so Baseline needs one of these |
| Adversary | Codex CLI (ChatGPT login), Claude fallback agents | OpenAI API key, or Claude fallback |
| Permissions | The person approves tool use in Claude Code | Enforced in code: allowlisted hosts, writes confined to the inductee folder, no shell |
| Credentials | None stored; Codex and Claude logins live on the maintainer's machine | API keys in environment variables or a secret store; never in the repo (`.gitignore` already excludes `.env*` and `secrets*`) |
| Prompt injection | Agents are told page text is data | Same instruction, plus structural limits: tools cannot write outside the folder, cannot reach non-allowlisted hosts, cannot publish |
| Cost visibility | Claude Code session usage | The runner logs tokens and searches per phase to `staging/run-<run_id>.json`, with a budget ceiling that stops the run |
| Handoff and commits | The person running Claude Code updates `docs/handoff/` and commits | The runner never commits; a person reviews the package as today |

## 5. Cost drivers

No totals are estimated here; they must be measured on a pilot inductee. What drives cost, roughly
in order:

1. **Page text in context.** Snapshots are long (catalog JSON, finding aids, encyclopedia pages). Each
   extraction step reads them, and the adversary reads them again. Mitigations: pass only the snapshot
   window around the quote to the adversary, cache the stable system prompt and tool definitions, and
   cap snapshot length per read (logging what was cut).
2. **Number of candidate facts.** Every candidate costs one adversary judgement, and every
   corroboration round costs another search plus another judgement. `max_facts` bounds this per run.
3. **Adversary engine.** One Codex call in the 2026-10-08 smoke test used about 40k tokens and took one
   to two minutes. Batching several items from the same source per call (as `adversary.py` does,
   up to six) amortizes the source text.
4. **Search volume.** Six families, each running many API searches. Server-side web search is billed
   per search on top of tokens; direct API searches (loc.gov, NARA, Commons) cost only the tokens
   needed to read their results.
5. **Model and effort choice.** Published per-token prices (Anthropic, as of 2026-09-25, per million
   input / output tokens): Claude Opus 5.5 $4 / $20, Claude Sonnet 5.5 $2 / $10, Claude Haiku 4.5
   $1 / $5. Check current pricing before budgeting. Mechanical steps (selection, ingest, packaging)
   can run at low effort; extraction, merge, and grounding should not.
6. **Retries and repairs.** Repair-once loops (Merge, Ground) and failed calls add a bounded amount.

Suggested control: a per-run token and search budget in the config, logged per phase, with the run
stopping (and saying what it skipped) when the budget is reached.

## 6. Open questions for IHH

1. Who runs the pipeline at IHH, and on what machine (a staff laptop, an IHH server, a hosted job)?
2. Whose API accounts and billing: IHH's own Anthropic key, and an OpenAI key for the cross-model
   adversary? Is sending archive text to both providers acceptable under IHH's data policy?
3. What budget ceiling per inductee is acceptable?
4. Is a person available to supply manual snapshots for blocked pages, or should the runner include a
   headless browser?
5. Where does the review dashboard live, and should the runner write `review/decisions.jsonl` through
   it directly?
6. How long should snapshots (copies of third-party page text) be kept, and may they be stored on
   IHH's systems? They are needed for audit and for re-verification.
7. Will IHH's chatbot read `provenance.jsonld` directly, or should the runner push to it?
8. Should the runner refresh existing inductees on a schedule (sources change, links break), or only
   run on request?

## 7. The tour-research step in the runner (added 2026-11-01)

The runner calls `tools/tour_research.py` exactly as the workflow does: `plan` gives the work items, the
runner's research agents get `search`, `log` and `snapshot` as custom tools (in place of `search_api` and
`snapshot` in section 2), `gate` replaces the Merge and Verify phases for this step, and `check`,
`assemble`, `docs` and `compare` are run_tool entries. `gate` runs once more after `assemble` and before
`docs` (`docs` refuses unmerged staging). The run state already lives in
`staging/tour/<run>/run.json` (budgets, blocked hosts, steps done), so `resume` re-runs only unfinished
steps. The Assemble judgement (which facts and records belong to which chapter) is the one agent step
that needs a model with the tour-map rules in its prompt; `check` enforces them either way.
