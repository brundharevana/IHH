# Tour-research step: progress report

Plan: `docs/superpowers/plans/2026-11-01-tour-research-step.md`, approved 2026-11-01. Controller rulings
of 2026-11-01: run Task 12 now; drive the CLI by hand, with no subagents and no workflow run; make the
dry-run copies of the lamarr folder plus `data/registry/` only; run the Codex review with at most 3 fix
rounds. Branch `revamp/facts`, base `5c000fdd`. Local commits only; nothing pushed.

## Status

| Part | Status |
|---|---|
| Tasks 1-11 (build) | done 2026-11-01 |
| ALB-M-0055 owner ruling logged | done 2026-11-01 |
| Task 12 dry run on Lamarr (fresh and enrich, CLI by hand) | done 2026-11-01 |
| Codex review (gpt-6-sol, read-only) | 10 reviews, 9 fix rounds; last review (round 10, of e5cbe254) **RED** with 2 major, 1 minor, not fixed (one owner-approved round only; no further loop) |
| Workflow `ihh-tour-research` | syntax-checked, and its script is now run under node with scripted agents in the tests; still needs one live run |
| Real store | ALB-M-0055 note; Lamarr citizenship year (LAM-F-0113); 15 record links; and, 2026-11-02, the Lamarr dry-run finds merged under new ids (below) |

## Commits

| Commit | Change |
|---|---|
| 6bc3d387 | T1 chapter kinds and core tour-map check |
| 6f9f5534 | T2 title, place and record rules |
| f8e777b2 | T3 journey rules and time-order assembly |
| 64656de8 | T4 first-draft proposal and research work order |
| 1ed609dc | T5 seed from the shipped tour and compare with it |
| 7492714f | T6 polite, privacy-guarded HTTP |
| cbf06991 | T7 catalog search adapters |
| fa5be192 | T8 tour-research sections and provenance export |
| 254005e6 | T9 `tour_research.py` commands |
| 91227d01 | T10 gate chain with deferral and resume |
| f71c1c3f | T11 workflow, SPEC section 12, skill section, STANDALONE section 7, `.dryrun/` ignored |
| 504cb12b | ALB-M-0055 owner ruling logged (`data(albright)`) |
| f3531af8 | this report, first version |
| 113c583f | dry-run fix: a cut-off search response is a logged failure, not a crash |
| 2d9f1c4f | dry-run fix: a repeated search is folded into one staged row |
| d4aad4d7 | Codex round 1 fixes |
| 8f9c9310, 148ed057 | Codex round 2 fixes, SPEC |
| c67ef723 | Codex round 3 fixes |
| 5a9fff5d | this report after round 4 |
| f45fcebc | Codex round 4 fixes |
| 335ef666 | Codex round 5 fixes |
| de10d05e | Codex round 6 fixes |
| 725d3bf7 | Codex round 7 fixes |
| 0b2193f6 | Codex round 8 fixes (reviewed in round 9) |
| e5cbe254 | Codex round 9 fixes (owner-approved round; reviewed in round 10) |

## Tests and validation

- `python3 -m pytest tools -q`: 1929 passed after round 9; 1917 passed after round 8 (1878 after round 7 ; 1792 after round 3; 1703 before the step). Each new test failed before its fix.
- `validate --all` at the build: 5 inductees valid, 0 errors. Both dry-run copies: validate exits 0.
- Offline `seed` + `check` on all five shipped tours (in a scratch copy of `data/`) passes after every fix round,
  including the stricter journey rules of round 5 (Einstein's and Muir's routed segments still pass).
- Workflow syntax check: SYNTAX-OK, also after the round-2 edit.

## Dry run on Lamarr (2026-11-01)

Copies: `.dryrun/fresh/data` and `.dryrun/enrich/data` (the lamarr folder plus `data/registry/`; 15 MB in
total). Run id `tour-2026-11-01`.

### Comparison with the shipped tour (7 chapters)

| Run | Chapters matched | Mean fact recall | Mean record recall | Journey endpoints | Routed flags |
|---|---|---|---|---|---|
| Baseline proposer (`propose`, no judgement) | 6 of 7 | 0.48 | 0.0 | not equal (no journey) | not equal |
| Round trip (`seed`, unchanged) | 7 of 7 | 1.0 | 1.0 | equal | equal |
| Fresh (judgement by hand, from verified facts) | 7 of 7 | 0.59 | 0.5 | equal (Vienna Q1741 to New York Q60) | equal (unrouted, route note) |
| Enrich (seed + bounded live research) | 7 of 7 | 1.0 | 1.0 | equal | equal |

The baseline matches the plan's numbers. The fresh run is not blind: I knew the shipped chapter list from
the plan text. Its outline has the same 7 chapter kinds and years: birth 1914, arriving 1937, first-work
1940, big-work 1941, history 1942, legacy 2000, honoured 2014. No unverified id appears in either
`drafts/tour.json`.

### Bounded live enrich research

| | Used / budget |
|---|---|
| Searches (tour-ca 8 tries in 7 rows, tour-loc 1, tour-wikidata 1) | 10 / 20 |
| Snapshots (Chronicling America page records with OCR) | 8 / 15 |
| Blocks / refusals | none / none |

- Gate: snapshot, merge, Codex adversary (gpt-6-sol), compute_status and validate all ran, exit 0.
- New in the enrich copy only:
  - LAM-F-0113, verified (big-work): Washington Daily News, 1941-10-01: "Hedy Lamarr has invented a remote control device for use in warfare".
  - LAM-F-0112, verified (citizenship): Atlanta Daily World, 1953-04-29.
  - LAM-M-0041 and LAM-M-0042, the two newspaper pages: disputed, because the adversary refuted the LoC rights wording for papers under 95 years old. This is the same question the owner ruled on for 1940-1961 Chronicling America pages. Each page needs its own owner ruling before it can show.
- Enrich outline:
  - Every shipped fact and record kept.
  - big-work gains LAM-F-0113 and the owner-ruled patent page LAM-M-0036 (big-work now has 2 usable records).
  - Verified places added: Vienna, New York, Los Angeles, Vienna Central Cemetery.
  - The journey stays unrouted: no verified fact names both Vienna and New York.
- Citizen chapter: the 1953 page says Lamarr received citizenship "recently", so its publication date does not date the event (Codex round 3). It was dropped from the enrich map. The fact is listed below for the owner.
- Gaps left (enrich):
  - Records: birth 2, big-work 2, honoured 1 usable (target 3).
  - No chapters of kind education, leaving or citizen.
  - Journey route not recorded.
  - first-work, history and honoured have no verified place.
  - 8 records have no recorded link to a chapter fact. They are listed for a reviewer and were placed by earlier rounds.
- Provenance: 10 tries, all logged.
  - One try crashed before the 113c583f fix and was logged by hand, with a note.
  - Merged rows: 9 for this run, because a repeated query folds into one row.
  - Exports and `searches.jsonl` hold no email address.

### Findings from the dry run (fixed)

1. A 1.9 MB loc.gov answer was cut off mid-read (`IncompleteRead`). The CLI crashed, and the search was neither counted nor logged. Fixed in 113c583f.
2. `merge_staging.py` treats searches with the same date, family, tool, query, agent and run as one search. A retried search lost its row at merge, and with it the link to the candidates it produced. Fixed in 2d9f1c4f by folding repeats.
3. `fetch_snapshot.py`'s message for a blocked page says to paste the page text from a browser. That contradicts the owner rule. The `snapshot` command now prints the owner rule instead (8f9c9310).

## Codex review (gpt-6-sol, read-only, nvm codex 0.162.1)

| Round | Verdict | Findings | Fixed in |
|---|---|---|---|
| 1 | RED | 2 blocker, 6 major, 1 minor | d4aad4d7 |
| 2 | RED | 3 blocker, 3 major, 1 minor | 8f9c9310, 148ed057 |
| 3 | RED | 1 blocker, 4 major | c67ef723 (finding 5, the citizen date, handled in the dry-run data) |
| 4 | RED | 2 major, 1 minor | f45fcebc |
| 5 | RED | 1 blocker, 5 major, 1 minor | 335ef666 (finding 6, LAM-F-0112, kept for the owner) |
| 6 | RED | 1 blocker, 2 major, 1 minor | de10d05e (finding 4 kept as a documented limit) |
| 7 | RED | 2 major, 1 minor | 725d3bf7 |
| 8 | RED | 2 major, 1 minor (r7 findings 1 and 2 partly fixed) | 0b2193f6 |
| 9 | RED | 1 major, 1 minor (r8 findings 1 and 3 fixed, 2 partly) | e5cbe254 (owner-approved round) |
| 10 (last) | RED | 2 major, 1 minor (r9 finding 2 fixed, 1 partly) | not fixed; see Residual |

What the fix rounds changed:
- **Gate:**
  - No `--mark-done`.
  - Merged ids survive a crash.
  - Changed staging (candidates or searches) and `--rejudge` rerun the gate steps.
  - Deferral follows `derived_from`.
- **Requests:**
  - No search redirect is followed.
  - Snapshot URLs are checked (https, no personal data).
  - Snapshots are spaced 4 s from the previous one on any host.
  - A block closes the holder's whole domain.
  - A search row is written before the request leaves.
- **Rules:**
  - A route fact must state a journey; a mode fact must be a route fact that states travel by that mode.
  - `mode_facts` without a mode are refused.
  - Malformed ids are problems, not crashes.
  - Unlinked records are listed for review.
- **Docs and workflow:**
  - `docs` rebuilds the outline and states which gate steps ran.
  - The workflow stops when the gate fails after a corroboration attach.

Rounds 4 to 7 (this session, 2026-11-01):
- **Round 4** (f45fcebc):
  - `docs` refuses while any staged search or candidate is unmerged, and lists only `searches.jsonl` rows.
  - The workflow runs a closing gate after Assemble; Docs runs only when it exits 0.
  - `merge_staging.py` folds a repeated try of a logged search into the logged row: notes added, produced
    joined, a known count kept. It never refuses the try, and a re-run adds nothing twice.
  - `tour_search.parse` raises `ShapeError` for any unknown section; `search` logs "parse failed".
- **Round 5** (335ef666):
  - `log --before` checks, counts and logs a web search before it is made; a search logged only
    afterwards is counted and marked.
  - A 403 or 429 blocks the host from the status alone.
  - `fetch_snapshot.py --pace 4` spaces every request of one snapshot, followed redirects included.
  - A route fact must state the leg itself (destination after to, for, into, reached or arrived in;
    origin after from or left, or named first).
  - The workflow reports ok only when docs exit 0 with all five outputs.
  - The workflow script runs in the tests with scripted agents.
- **Round 6** (de10d05e):
  - A bot challenge page answered with HTTP 200 is a block and is never saved.
  - A search or snapshot is counted, spaced and marked in flight on disk before it leaves; an attempt
    left in flight is recorded as a failure of unknown outcome.
  - The docs give each record's status (verified, or disputed under an owner ruling).
- **Round 7** (725d3bf7, after the last review):
  - The privacy check reads every percent decoding of the text.
  - A non-JSON answer is searched whole for a challenge.
  - A malformed journey mode is a problem, not a crash.

- **Round 8** (0b2193f6):
  - The privacy check decodes to a fixed point. Text over 8192 characters, or still changing after 32
    decodings, is refused before any request and recorded in `run.json` `refused`.
  - A 200 JSON answer whose envelope (top-level keys; `error`, `errors`, `message`, `status`, `detail`,
    `reason`, `code`, one level into an object or list) names a captcha, challenge or bot blocks the host.
    Result text is not read.
  - A list field (`fact_ids`, `records`, `place_photos`, journey `places`, `segments`, `route_facts`,
    `mode_facts`) that is not a list is a map problem, not a crash.

- **Round 9** (e5cbe254, owner-approved single round):
  - The JSON envelope scan reads `error`/`status`-type fields at any depth (lists inside them included) and
    enters the objects that wrap them, at most 8 levels and 2000 values; an error field past the bound
    blocks the host. Lists outside an error field are results and are not read.
  - A `log --before` privacy refusal is recorded in `run.json` `refused`. A refused query that fails the
    privacy check is stored as "(withheld ...)", in `search` too. A run created by that refusal keeps its
    budget open for the first real command.

Residual (after round 10, `.dryrun/codex-r10.md`, not fixed: one round was approved and the brief said not
to loop on new edge cases):
1. Major, `polite.py:135`: the wrapper walk stops at 8 objects without blocking, and a list wrapper
   (`{"response": [{"error": {"captcha": "required"}}]}`) is not entered, so both pass as results. Fix:
   traverse non-result wrappers including lists, and fail closed at the bound. Open question for that fix:
   telling a wrapper list from a result list without flagging result text.
2. Major, `tour_research.py:276`: a privacy refusal in `search` (not `log`) creates the run without
   `budget_open`, so its `--budget` is fixed before any real search. Fix: mark every refusal-only run the
   same way and test refusal then first real search with a different budget.
3. Minor, `polite.py:121`: the 2000-value bound counts values inside error fields but not wrapper objects
   and their keys. Fix: one shared node budget for the whole envelope walk; test a wide wrapper.
4. Web searches (round 5 finding 1, round 6 finding 4): the web search tool is outside the CLI. The
   pre-check (`log --before`) is an instruction to the agents, not an interlock; a search logged late is
   counted and marked. Codex judged this acceptable as a documented limit for this plan. A stronger version
   needs one search gateway that makes and logs the request itself.
5. LAM-F-0112 (round 5 finding 6): an owner question, not a code fix. See "For the owner".

After round 9 (and round 8), offline `seed` + `check` on all five shipped tours (scratch copy of `data/`) passes with 0
problems, and `validate --all` reports 5 inductees valid, 0 errors. The real store is untouched.

Dry-run outputs after round 7: both copies pass `check` and `validate`. The docs in both copies were
regenerated with no unmerged staging left. The enrich copy lists 9 logged searches for the run, and
ARTIFACTS.md shows LAM-M-0041 and LAM-M-0042 as disputed. Nothing was applied to the real store.

## Lamarr naturalization year (2026-11-01, run lamarr-citizen-2026-11-01)

Result: **1953**, verified as **LAM-F-0113** (real store). No app change and no citizen chapter.

| Fact | Status | Claim | Evidence |
|---|---|---|---|
| LAM-F-0113 | verified | Evening star (Washington, D.C.), April 11, 1953, from Los Angeles: a court rite makes an American of actress Hedy Lamarr, who has taken the oath along with 40 other aliens. (event_date 1953, place Los Angeles) | LAM-S-0071, LoC Chronicling America page (primary): the AP item "Drama-Laden Rite Makes American Of Hedy Lamarr" |
| LAM-F-0112 | single-source | Hedy Lamarr was naturalized in 1953. | NARA Prologue caption "Naturalization card for Hedy Lamarr, April 10, 1953" (LAM-S-0044), The National WWII Museum (LAM-S-0013), LAM-S-0071. G5: only the museum's words cover "naturalized"; NARA says "Naturalization card". |
| LAM-F-0016 | disputed (unchanged) | Hedy Lamarr became a U.S. citizen in 1953. | Re-judged by Codex (supported); still blocked by G10 only: the Britannica browser snapshot (LAM-S-0010) is unreachable live. |

- Independent agreement on the year: the LoC page (AP, April 11, 1953), the April 10, 1953 AP page (LAM-S-0063, "gets her
  American [citi]zenship today"), the NARA caption (card dated April 10, 1953), The National WWII Museum, the National
  Women's History Museum ("April 1953") and Britannica.
- event_date is the year only. The April 11 item says the oath "has" been taken, so the publication day is not the event
  day. This avoids the LAM-F-0112 (dry-run) date question.
- The Atlanta Daily World item ("recently") is dated April 29, 1953 (p. 4; dry-run source LAM-S-0074). Its dated companion
  reports are the AP items of April 10 and 11, 1953 above.
- Searches (11, all logged; families `citizen`, `citizen2`):
  - Chronicling America: 5 searches.
  - Web search: 2, each logged before it was made.
  - UCLA Library Digital Collections JSON: 4 (no 1953 item).
  - Leads read: The daily record (Dunn, N.C.), May 18, 1953 is a gossip line; Hungry Horse news, May 22, 1953 is a
    film ad. Both staged sources were dropped before the merge.
- Ids: the real store's LAM-F-0112 and LAM-F-0113 are not the dry-run's LAM-F-0112 and LAM-F-0113. If the dry-run finds
  are brought in later, the merge gives them new ids.

## Record links (2026-11-01, run tour-links-2026-11-01)

Method:
- `seed` + `check` + `assemble` on the five shipped tours, in a scratch copy of `data/`, listed 31 of 83 records
  with no link to a chapter fact.
- A record links when its own source is in a chapter fact's evidence. Its alt text could also cite the fact, but
  that changes the media fingerprint and would void the owner rulings pinned to it, so no media record was edited.
- For each record, its own source snapshot was read for words that state a chapter fact. Where the record shows what
  the fact states, that quote was attached to the fact as evidence, the Corroborate way:
  - an audit copy `staging/facts.before-links-tour-links-2026-11-01.jsonl` in each inductee folder;
  - `records.py` under the lock;
  - quote checked in the snapshot;
  - verdict cleared, then Codex adversary (gpt-6-sol), `compute_status`, `validate`.
- Batches: Einstein; then Lamarr, Muir and Naismith; then Albright. `validate --all` and `pytest tools -q`
  (1929 passed) ran after each batch.
- After the run: 15 linked, 16 left (83 records, 16 unlinked). `check` passes for all five tours.

| Record | Chapter fact | Evidence attached from the record's source | Status after re-judging |
|---|---|---|---|
| EIN-M-0086 | EIN-F-0005 (born 14 March 1879 in Ulm) | EIN-S-0138: "born at Ulm in March, 1879" | verified |
| EIN-M-0078 | EIN-F-0109 (renounced German citizenship, 1933) | EIN-S-0128: "Einstein Is to Renounce Citizenship ... has taken steps to renounce Prussian citizenship", title date | verified |
| EIN-M-0087 | EIN-F-0109 | EIN-S-0139: "Will Renounce Citizenship ... has taken steps to renounce his Prussian citizenship", date | verified |
| EIN-M-0063 | EIN-F-0135 (Sachs delivered the letter, October 11, 1939) | EIN-S-0106 (DocsTeach): "Sachs personally delivered the letter to Roosevelt on October 11, 1939." | verified |
| EIN-M-0091 | EIN-F-0051 (citizenship certificate from Judge Forman, 1940 Oct. 1) | EIN-S-0142: UP item, "became a citizen ... in the presence of Judge Phillip Forman" | verified |
| LAM-M-0036 | LAM-F-0040 (Lamarr was an inventor) | LAM-S-0002: patent "Inventor ... Markey Hedy Kiesler" | verified |
| MUI-M-0062 | MUI-F-0001 (born April 21, 1838) | MUI-S-0072: "Name: John Muir; Age/Year of Birth: 1838" | verified |
| MUI-M-0034 | MUI-F-0091 (Muir was an inventor) | MUI-S-0066: "Sketch of John Muir's clock design.", subject "Inventions" | verified |
| MUI-M-0035 | MUI-F-0091 | MUI-S-0067: Muir's time-by-star illustration, subject "Inventions" | verified |
| MUI-M-0065 | MUI-F-0078 (Muir was a preservationist) | MUI-S-0028: "John Muir, the leading preservationist of his day ..." | verified |
| ALB-M-0092 | ALB-F-0168 (family fled Czechoslovakia) | ALB-S-0073: "forced to flee to Britain in 1939 ... flee again in 1948" | verified |
| ALB-M-0059 | ALB-F-0193 (sworn in, January 23, 1997) | ALB-S-0050: record title, production date 1997-01-23 | verified |
| ALB-M-0094 | ALB-F-0053 (Senate Foreign Relations hearing on NATO) | ALB-S-0157: "Hearing of October 7, 1997", Albright's statement | verified |
| ALB-M-0096 | ALB-F-0004 (died March 23, 2022) | ALB-S-0159: "Proclamation 10351 of March 23, 2022 / Death of Madeleine Korbel Albright" | verified |
| NAI-M-0070 | NAI-F-0035 (born Almonte, November 6, 1861) | NAI-S-0112: "I was born in Almonte,Canada, on November 6, 1861" | verified |

Each fact's notes record the attachment. Every re-judged fact stayed verified, except MUI-F-0006, whose attachment was
withdrawn (below).

### Records awaiting review

New research cannot link these. A link needs the record's own source in a chapter fact's evidence, and the chapter
facts are set by the shipped tour. Each record's own source was read in full; none states a chapter fact. Where a
verified or single-source fact on file describes the record, it is named, for a reviewer who may add it to the
chapter. That is a tour change, an owner step.

| Record | Chapter (facts) | Reason | Fact on file that describes it |
|---|---|---|---|
| EIN-M-0085 | birth (EIN-F-0005) | The 1885 photo of Einstein and his sister shows childhood, not the birth. | none |
| EIN-M-0083 | honoured (Nobel facts) | The 1905 photoelectric paper's first page. EIN-F-0148 names the prize for the photoelectric law, not the paper. | EIN-F-0009 (single-source, 1905 light quanta) |
| LAM-M-0023 | arriving (LAM-F-0100, LAM-F-0020) | A basis photo of the Normandie arriving in New York. No chapter fact names the ship. | LAM-F-0024 (single-source: Mayer and Lamarr on the SS Normandie) |
| LAM-M-0013 | first-work 1940 (Boom Town, Antheil) | A 1939 portrait about a contract row. | LAM-F-0027 (single-source, the MGM contract) |
| LAM-M-0014 | history 1942 (war bonds) | The 1942 "Tales of Manhattan" premiere. | none |
| LAM-M-0015 | legacy (LAM-F-0107, Mrs. Loder) | The 1946 courtroom photo with John Loder shows a robbery case, not the marriage. | none |
| LAM-M-0039 | legacy | The April 11, 1953 citizenship page. It fits a citizen chapter (owner step). | LAM-F-0113 (verified) |
| MUI-M-0063 | big-work (Yosemite 1868) | The Grand Register signature; the record gives no year of signing. | none |
| MUI-M-0064 | big-work | An 1875 fern specimen collected by Muir. | none |
| MUI-M-0020 | study (writer, Sierra Club) | An 1887 self-portrait in a letter. | none |
| MUI-M-0066 | study (MUI-F-0006, Sierra Club 1892) | The LoC record supports it ("first President", founding documents, 1892). On re-judging, MUI-S-0024 (a browser snapshot) was unreachable twice, so G10 would have made MUI-F-0006 disputed. The attachment was withdrawn and the record restored from the audit copy with its earlier verdict. Re-attach when MUI-S-0024 is reachable, or after it is refetched by API. | MUI-F-0006 |
| ALB-M-0076 | arriving (1948) | A 1940 basis photo of the S.S. America lounge. No chapter fact names the ship. | none |
| ALB-M-0088 | secretary (1997) | An April 20, 1993 photo of Albright as UN Ambassador. | ALB-F-0029 (verified, appointed UN Ambassador in 1993) |
| ALB-M-0055 | secretary | A memo to President Clinton; the record gives no date or subject. | none |
| ALB-M-0018 | legacy | Obama greets Albright, April 6, 2010. | none |
| NAI-M-0077 | honoured (NAI-F-0086, inducted 1959) | The 1961 Basketball stamp first day and Hall of Fame cornerstone. | none |

## Check by hand

| URL | What was wanted |
|---|---|
| https://catalog.archives.gov/proxy/records/search?q=einstein+naturalization&limit=3 | NARA catalog search JSON. The endpoint now returns the HTML app shell; every `tour-nara` search is logged as failed. No API key was requested. |
| https://catalog.archives.gov/id/335708097 (Lamarr naturalization file, LAM-S-0001) | The petition's oath or order date. It appears only on the 4 page images; the catalog text gives the file's span (1939-1953) and petition number 156727. Read the images by hand. |
| https://calisphere.org/item/234b691b6d50591c6ccf414c8a8c406e/ | A photo caption dated April 10, 1953 ("became citizens of the United States today in ceremony in federal court", per the web search summary). A plain fetch returned HTTP 202 with an empty body; not retried or bypassed. Find the holding library's own record. |
| https://www.britannica.com/biography/Hedy-Lamarr (LAM-S-0010) | Live confirmation of the browser snapshot. Codex could not reach it on 2026-11-01, which keeps LAM-F-0016 disputed (G10). |
| NARA INS naturalization card for Hedy Lamarr, April 10, 1953 (Prologue caption, LAM-S-0044) | Its catalog id. The NARA keyword search is down (HTML app shell); no NAID is given on the Prologue page. |

No archive answered 403, 429 or a bot challenge in this run.

## For the owner

- LAM-M-0041 (Atlanta Daily World, 1953-04-29, p. 4) and LAM-M-0042 (Washington Daily News, 1941-10-01, p. 32) are
  disputed on the LoC rights wording only.
  - Both fall under the existing owner ruling of 2026-10-29: LoC Chronicling America pages from 1940 to 1961
    may display (Challenge IHH `docs/handoff/DECISIONS.md`). No new ruling is needed.
  - To show, each still needs that ruling logged as a per-item "Owner ruling" note in
    `review/decisions.jsonl` (through `tools/apply_review.py`), pinned to its media_lock_sha256, the way
    ALB-M-0055 was logged.
  - Nothing has been applied: they exist only in `.dryrun/enrich`, and the owner must approve a separate
    run into the real store first.
  - The brief for this round gave the years the other way round (0041 as 1941, 0042 as 1953). The records
    say 0041 is the 1953 page and 0042 the 1941 page.
- LAM-F-0112 records the publication date as `event_date` for an event the page calls "recent".
  - Codex round 5 rated this major.
  - It follows the store's existing convention for newspaper-report facts (LAM-F-0100, verified in the real
    store). Changing that convention is a store-wide owner decision.
  - Keep it as a newspaper fact, or set the date aside until a record dates the naturalization.
- 31 of the 83 records in the five shipped tours named no chapter fact by id, basis or a shared source. 15 are now linked (run tour-links-2026-11-01, below); 16 await review. They are listed for review, not refused. Making this a blocking rule is the owner's call.
- The enrich finds were merged into the real store on 2026-11-02 (see "Merge of the dry-run finds"). The `LAM-F-0112` event_date convention is still an open owner item (see "Known limits").

## Concerns

- Disk: about 12 GB free (the plan asked for 15 GB). The small copies were enough.
- The workflow path has not run live. One live run is needed before the standalone runner.
- Codex round 10 is RED (2 major, 1 minor, above). They need another owner-approved fix round and review before push.
- The owner's 2026-11-02 Task 4 (copy the Lamarr dry-run finds into the real store) was first held because round 10 was RED. The owner then
  approved the merge on 2026-11-02 and accepted the round 10 residuals as known limits (below). The merge ran.

## Merge of the dry-run finds (2026-11-02)

Through `tools/merge_staging.py lamarr --run-id tour-2026-11-01`; the original staged candidate files and snapshots from
the dry run (`staging/merged/tour-2026-11-01/`) were re-staged unchanged, so no JSONL line was hand-copied. Audit copy:
`data/inductees/lamarr/staging/merged/tour-2026-11-01/`. The adversary (gpt-6-sol) was run again on the new ids, and
`compute_status` and `validate` ran. Commit a6822c88.

| Dry run | Real store | What |
|---|---|---|
| LAM-F-0112 | LAM-F-0114 | Atlanta Daily World, 1953-04-29, "Hedy Becomes Citizen"; verified |
| LAM-F-0113 | LAM-F-0115 | Washington Daily News, 1941-10-01, remote control device; verified |
| LAM-S-0074 / LAM-S-0075 | same | the two Chronicling America page records (snapshots copied) |
| LAM-M-0041 / LAM-M-0042 | same | the two pages; disputed on the LoC rights wording; the 2026-10-29 owner ruling is logged per item |
| LAM-Q-0329..0337 | LAM-Q-0340..0348 | the nine searches; `produced` lists remapped |

The store's own LAM-F-0112 and LAM-F-0113 are unchanged. Media alt text now cites LAM-F-0114 and LAM-F-0115.

## Known limits (owner-accepted 2026-11-02)

Codex round 10 (`.dryrun/codex-r10.md`) stays RED. The owner accepted these residuals as known limits; they are not fixed.
Verbatim from "Residual" above:

1. Major, `polite.py:135`: the wrapper walk stops at 8 objects without blocking, and a list wrapper
   (`{"response": [{"error": {"captcha": "required"}}]}`) is not entered, so both pass as results. Fix:
   traverse non-result wrappers including lists, and fail closed at the bound. Open question for that fix:
   telling a wrapper list from a result list without flagging result text.
2. Major, `tour_research.py:276`: a privacy refusal in `search` (not `log`) creates the run without
   `budget_open`, so its `--budget` is fixed before any real search. Fix: mark every refusal-only run the
   same way and test refusal then first real search with a different budget.
3. Minor, `polite.py:121`: the 2000-value bound counts values inside error fields but not wrapper objects
   and their keys. Fix: one shared node budget for the whole envelope walk; test a wide wrapper.

Open owner item: LAM-F-0114 (dry-run LAM-F-0112) records the publication date as `event_date` for an event the page calls
"recent". This follows the store's convention for newspaper-report facts (LAM-F-0100). Changing the convention is a
store-wide owner decision.
