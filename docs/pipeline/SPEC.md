# Verified Inductee Pipeline — Specification v1 (2026-10-08)

Input: an inductee's name. Output: a review package of verified facts, licensed media,
grounded draft content, and a paste-ready WordPress export, all traceable to sources.
An IHH reviewer approves, edits, or rejects; only approved content is exported for publishing.

Authoritative decisions: `docs/handoff/DECISIONS.md` (2026-10-08 entries). This spec is the
contract every tool, the saved workflow, and the skill implement.

---

## 1. Principles

1. The AI states facts; it does not author them. Every claim is a close restatement of a
   verbatim quote from a saved source, and nothing in the claim goes beyond that quote.
2. A fact is included only when the extractor AND an independent adversary both find it
   supported (user directive). Disagreement never auto-publishes; it becomes `disputed`.
3. Deterministic checks run before and after every model judgement. Models never mark
   their own work verified; `tools/compute_status.py` derives status from recorded evidence.
4. Every search, fetch, verdict, and human edit is logged (IHH's chatbot will read the log).
5. Nothing is published by the pipeline. Output is a package for human review.

---

## 2. File layout (per inductee)

```
data/inductees/<slug>/
  inductee.json          identity, aliases, authority ids, pipeline run history
  facts.jsonl            one atomic claim per line
  sources.jsonl          one source per line
  media.jsonl            one media item per line
  searches.jsonl         one search per line
  snapshots/<SRC>.txt    normalized text of the source as fetched
  snapshots/<SRC>.meta.json  {url, fetch_url, method, fetched_at, sha256, bytes, http_status, final_url[, full_text_url, segment_id][, record_url]}
  staging/               pipeline intermediates, kept for audit (one file per search family)
  drafts/profile.json    grounded draft content (section 7)
  drafts/grounding.jsonl sentence-adversary verdicts on draft units (G6, section 7)
  review/decisions.jsonl human review log (section 8)
  export/                generated: wordpress.html, facts.csv, sources.csv, media.csv,
                         searches.csv, provenance.jsonld, REVIEW.md
data/export/             generated: aggregate CSV + JSON-LD across all inductees
data/registry/institutions.json   the authority registry (section 3.6); reviewed by people,
                         never written by a tool or a pipeline agent
```

`<slug>` is lowercase ASCII, hyphenated surname-first-free form, e.g. `einstein`, `lamarr`,
`muir`, `albright`, `naismith`. IDs are namespaced by a 3-letter inductee code stored in
`inductee.json` (`EIN`, `LAM`, `MUI`, `ALB`, `NAI`): `EIN-F-0001`, `EIN-S-0001`,
`EIN-M-0001`, `EIN-Q-0001`. IDs are never reused, even after rejection.

The legacy `data/provenance/` seed (3 facts) migrates into this layout; `data/provenance/`
is then removed and its README content moves to the skill.

---

## 3. Records

All files are JSON Lines, UTF-8, one object per line, keys in the order listed. Lines are
separated by "\n" only; U+2028, U+2029 and U+0085 inside strings are written escaped and are
never treated as line ends when reading.

**Write boundary.** Every record is schema-validated at the moment it is written, so a bad
record can never land. The schema is one module, `tools/ihh/schema.py`, which `validate.py`
reports as SCHEMA. `tools/ihh/records.py` (`write_jsonl`, `update_jsonl`, `write_json`) checks
each new or changed record of a main record file (inductee.json, facts, sources, media, searches,
`review/decisions.jsonl`, `drafts/grounding.jsonl`, `drafts/profile.json`) before writing and
raises `SchemaError`, writing nothing, with each record id and problem. A record already on file
with a problem may be rewritten only without a problem its version on file lacks (a tool updating
a derived field still can; validate keeps reporting the old problem until a person repairs it).
Tools that write several files check all of them first: `merge_staging.py` refuses the whole
merge and names the staged candidate (temporary id, staging file, record number);
`apply_review.py` checks facts, media and the decision log before writing any;
`fetch_snapshot.py` checks the updated source record before it writes the snapshot files.
Agents edit main files only through `records.py`.

### 3.1 inductee.json
```json
{"slug": "lamarr", "code": "LAM", "name": "Hedy Lamarr",
 "aliases": ["Hedwig Eva Maria Kiesler", "Hedwig Maria Stauffer", "Hedy Kiesler"],
 "authority": {"loc_naf": "https://id.loc.gov/authorities/names/...", "wikidata": "Q...(discovery only)"},
 "birth_year": 1914, "death_year": 2000,
 "ihh_url": "https://immigranthallofhonor.org/inductees/inductee-hedy-lamarr/",
 "runs": [{"run_id": "...", "date": "2026-10-08", "adversary": "codex", "notes": ""}]}
```
Aliases feed the name-matching in G2/G6. Each alias must be a name (`normalize.name_problem()`:
only words, no date, number, decade, age, code or symbol, every content word capitalized unless
it is a name particle such as `van` or `de`; validate reports anything else as an ALIASES error
and the alias is never used) and must be supported by an evidence quote somewhere in
facts.jsonl (category `identity`) before it is used. A name supplies only its own words, written
with the same capitalization; never a number, date or lower-case word.

### 3.2 sources.jsonl
| Field | Rule |
|---|---|
| id | `<CODE>-S-NNNN` |
| title | as the source titles itself |
| institution | publisher/holder. When the url resolves to an authority registry entry (section 3.6) it must be the entry's `name` exactly (`merge_staging.py` fills a blank one); otherwise the site's own name, which may not name a registered holder (G9) |
| type | `primary` (the original record; owner decision 2026-10-16: a Library of Congress Chronicling America newspaper page is the original record of what the newspaper printed, so it is `primary`), `institutional` (archive, museum, government, university, foundation, prize body), `secondary` (encyclopedias, news, aggregators, IHH's own current page). `primary` and `institutional` are allowed only when the url resolves to a registry entry whose `may_be` lists that type (G9); every other source is `secondary` |
| url | https, human-facing; this is the link shown on the website. The holder's own page, never an archive, cache, proxy or short-link wrapper of it (a wrapper is another site and is secondary at best; put the copy in `archive_url`). Canonical form only (`tools/ihh/urls.py`, the one URL reader): no userinfo, backslash, whitespace, IP-address host, percent-encoded or non-ASCII host (write an IDN in its `xn--` form) or trailing dot, so the host the registry reads is the host a browser reaches |
| fetch_url | optional https machine-readable endpoint. A snapshot must be fetched from the cited record itself, so fetch_url is either the same record as the url (`fetchplan.same_record()`: query parameter order, a leading `www.`, a trailing `/` and the format parameters `fo=json` and `format=json` may differ; the url's fragment may be dropped, never added or changed, since on a hash-routed catalog it names the record) or exactly the endpoint a reviewed adapter derives from the url (NARA proxy API, LoC `?fo=json`, Commons API; `fetchplan.adapter_endpoint()`), or one of the two alternate endpoints the owner approved on 2026-10-16 (`fetchplan.alternate_endpoint_problem()`): for a NARA catalog record `https://catalog.archives.gov/id/<N>`, its page-transcriptions endpoint `https://catalog.archives.gov/proxy/contributions/targetNaId/<N>`; for a USPTO Patent Public Search link `https://ppubs.uspto.gov/pubwebapp/external.html?q=<number>.pn.&db=<DB>`, the record endpoint `https://ppubs.uspto.gov/api/patents/highlight/US-<number>-<kind>?queryId=1&source=<DB>&includeSections=true` (same number and database; the kind code is not in the url). Another page, even on the same site, is a validate error (`fetchplan.fetch_url_problem()`) |
| catalog_id | optional (NAID, LoC id, patent number) |
| published | ISO date or partial (`1942`, `1942-08`) or null |
| accessed | YYYY-MM-DD |
| snapshot | `snapshots/<id>.txt` or null |
| snapshot_sha256 | hex or null |
| fetch_method | `http` / `api` (fetched by tools/fetch_snapshot.py) or `browser` / `manual` (text supplied by an agent or person) |
| archive_url | optional Wayback/permalink |
| derived_from | optional: the id of another source in this package whose text this source reproduces or follows (a page "based on" an exhibit, a laureate text that follows a prize biography, an article that copies a college page). Set it when the source or its notes say so, or when the two texts are visibly one; G5 then counts the two (and anything else derived from the same origin) as one holder. Checked at the write boundary: a source id, not the source itself, present in the package; `merge_staging.py` rewrites a staged temporary id to the permanent one |
| content_part | optional; only `transcription` (owner decision 2026-10-10). Required for a primary or institutional source whose registry entry lists `content_part` (the Einstein Papers Project): the source counts only for the word-for-word transcription of the original document. Its snapshot marks that text between lines `<<<TRANSCRIPTION>>>` and `<<<END TRANSCRIPTION>>>` (one or more spans), and every quote check (G1, G2, G5, media text) reads only the marked text (`gates.quotable_text()`, through `GateContext.snapshot_text()`); a quote from editors' notes, introductions, footnotes or commentary is not found. Unbalanced, nested, empty or missing markers fail G1. Checked at the write boundary (`schema.check_source`); the adversary prompt names the part and requires the quote to be document text |
| notes | free text |

Wikipedia, Wikidata, and quote websites may be used to discover leads but may never be a
source of a fact. The primary control is the authority registry: such sites are not in it, so
they can only be secondary, and a secondary source never satisfies G5 alone. As defence in
depth the validator also rejects sources whose url host is `*.wikipedia.org`,
`*.wikiquote.org`, `wikidata.org`, `goodreads.com`, `brainyquote.com`, `quotefancy.com`,
`azquotes.com` and the mirrors in `BANNED_DOMAINS` (G9). Wikimedia Commons is a registry entry
with `media_only`: it may back media items, never a fact.

### 3.3 facts.jsonl
| Field | Rule |
|---|---|
| id | `<CODE>-F-NNNN` |
| inductee | slug |
| claim | one atomic statement, plain English, no content word its evidence quotes lack (G2) |
| category | `identity` only for a fact that establishes a name the inductee was known by (G11: the claim contains an alias from inductee.json); `birth`, `family`, `education`, `immigration`, `citizenship`, `career`, `work`, `invention`, `award`, `quote`, `death`, `legacy`, `other` |
| event_date | ISO or partial date, or null |
| place | string or null |
| evidence | list of `{source_id, quote, locator}`; `quote` is verbatim from the snapshot; `locator` says where (field name, page, paragraph) |
| primary_document | derived, never authored: true exactly when an evidence item cites a source of type `primary` (the original record itself; G9 allows that type only on a registry entry's original-record pages, and G1 holds the quote to that record's snapshot). `merge_staging.py` sets it on every merged fact and `compute_status.py` keeps it current when a source's type changes (`gates.primary_document()`); it is not part of what the adversary judges |
| is_direct_quote | true when the claim reproduces the inductee's own words; then `claim` must equal one evidence quote exactly (after normalization) |
| extractor | `{model, run_id, date, verdict}`; verdict `supported` or `withdrawn` |
| adversary | `{model, run_id, date, verdict, quote_in_snapshot, quote_in_live, live_by_source, entailed, adds_information, atomic, source_type_ok, rationale, registry_suggestion, judged_sha256}` or null; `live_by_source` (required on every verdict written from 2026-10-10; absent on older verdicts) is a list with exactly one `{source_id, result, url}` per source shown to the adversary (each evidence source; for a reconstruction also each basis source): `result` is `found` (the live source loaded and every passage quoted from it is there), `not_found` (it loaded and a passage is missing) or `unreachable` (it could not be loaded or read), and `url` is the address checked; on such a verdict `quote_in_live` is not judged but derived by `tools/adversary.py` (`schema.live_summary()`: `no` if any source is `not_found`, else `unreachable` if any is `unreachable`, else `yes`), and the schema refuses a `quote_in_live` that differs from that summary; `registry_suggestion` (optional, text or null) names a publisher the adversary thinks could be added to the authority registry, as advice for a person (`data/registry/PROPOSED.md`), and never affects status; verdict `supported`/`refuted`/`unclear`; quote_in_live `yes`/`no`/`unreachable`; `judged_sha256` is the fingerprint (`tools/ihh/judged.py`) of what the adversary saw: the record fields shown to it and each source's snapshot hash. A verdict counts only while the record still has that fingerprint |
| status | derived by compute_status (section 5); never hand-set except `rejected` and `conflicting` |
| verified_claim_sha256 | sha256 of the normalized claim at the moment status became `verified`; null otherwise |
| used_in | list of draft locations, e.g. `profile:timeline:3` |
| review | `{state, reviewer, date, note}`; state `pending`/`approved`/`edited`/`rejected` |
| notes | free text; for `conflicting`, records each source's version |

### 3.4 media.jsonl
| Field | Rule |
|---|---|
| id | `<CODE>-M-NNNN` |
| title, media_type | `image`, `audio`, `video`, `document`, `3d`, `panorama` |
| source_ids | sources describing the item and its rights |
| url | where it lives (no downloads in v1; files are fetched at build time) |
| rights_statement | verbatim from the holder's page: the institution that holds the original item (a library, archive, museum or agency), snapshotted as one of `source_ids`. A Wikimedia Commons file page, its licence templates and an Internet Archive licence field are uploader claims and discovery sources only: follow the Commons file's source link to the holder's item page and take the statement from that page; if no holder statement can be found, `rights_statement` and `rights_url` are null and `license_class` is `unknown` (G1 allows a missing statement only while `license_class` is not embeddable; a usable item must carry the holder's words). When the holder's saved snapshot carries its rights field (section 3.4.1), the statement is that field's wording, copied verbatim |
| rights_url | link to that statement (the holder's page) |
| license_class | `public-domain`, `cc0`, `cc-by`, `cc-by-sa`, `rights-restricted`, `unknown`; for a Library of Congress or National Archives holder it follows the approved rights rule (section 3.4.1) |
| credit | the credit line to display |
| alt_text | factual description only; may reference fact ids. Published as the image description, so it passes G2 for media and the adversary judges it |
| reconstruction | true for anything we build (3D model, 360 scene, illustration); then `reconstruction_basis` lists the fact and source ids it depicts |
| adversary | same shape as facts, judging that rights_statement is verbatim and license_class follows from it, and that title and alt_text state nothing the holder's page does not. For a reconstruction it judges instead that title and alt_text state nothing the basis facts and sources do not |
| status, review | as facts |

Usable on the site only if `license_class` is `public-domain`, `cc0`, `cc-by`, or `cc-by-sa`
and status is `verified`. Everything else is shown as a link, never embedded. The media edit lock
(G7) covers url, rights_statement, rights_url, license_class, credit, source_ids, reconstruction,
reconstruction_basis, title and alt_text.

#### 3.4.2 Basis photos (record kind, owner decision 2026-10-16)

A photograph (or survey drawing) used only as the basis for rebuilding a room or place for a tour
stop is a media record with `record_kind: "basis-photo"` (absent or `"item"`: media about the
inductee) and `basis_for`: a non-empty list of the stop fact ids it serves.

| Field | Rule |
|---|---|
| record_kind | `item` (default) or `basis-photo` |
| basis_for | only on a basis photo: the stop facts (fact ids in facts.jsonl; validate REFS) whose place the photo shows |
| media_type | `image` or `document` (a survey drawing) |
| reconstruction | false: a basis photo is the holder's item; what we build from it is a separate reconstruction record whose `reconstruction_basis` may name it |
| rights | as every media item: `rights_statement` verbatim from the holder's snapshotted item page (3.4, 3.4.1); a rights-restricted or unknown item is recorded as such and is link-only / reference-only (never embedded) |

Gates and status are those of media (G1 rights, G2 title and alt text against the holder's page, G7,
G9, G10; section 5). The adversary judges a basis photo with its own checks (`adversary.BASIS_CHECKS`):
the rights statement and licence class as for any item, the title and alt text against the holder's
page, and that the holder's page shows the item depicts the place each linked stop fact names. It is
never judged on whether it shows the inductee. The fingerprint (`judged.media_payload`) and the edit
lock (`gates.media_lock_sha256`) cover `record_kind` and the linked stop facts only on basis photos, so
no other media verdict changes. Export: media.csv carries `record_kind` and `basis_for`; the JSON-LD
node carries `ihh:recordKind` and `ihh:basisFor`; wordpress.html never shows a basis photo as an
artifact about the inductee, and REVIEW.md labels it.

#### 3.4.1 Approved rights rule for Library of Congress and National Archives media

User decisions 2026-10-09 (`docs/handoff/DECISIONS.md`, "Rights mapping for LoC and NARA" and
"Extended LoC rights rule"). One implementation, `tools/ihh/rights.py`
(`rights_class(holder_registry_id, rights_statement, record_text)`), used
by `merge_staging.py` (staged media), `apply_rights_rule.py` (media on file), G1 for media (so
`compute_status.py`, `validate.py` and `adversary.py`'s selection), and the adversary's media prompt
(`rights.RULE_TEXT`, so the adversary judges that license_class follows from the holder's own words
under this rule).

| Holder (registry entry) | Holder's words (exact phrase, case-insensitive after G1 normalization) | license_class |
|---|---|---|
| `loc` (loc.gov) | rights advisory begins "No known restrictions on publication" or "No known restrictions on images made by the U.S. Government" (alone, or followed by further sentences that assert no restriction) | `public-domain` |
| `loc` | LoC's full wording "No known restrictions on images made by the U.S. Government; images copied from other sources may be restricted" (the second clause is part of the phrase, not a caveat), and the same record gives positive evidence of government creation (`part_of`, or a creator with the role creator, is Historic American Buildings Survey, Historic American Landscapes Survey, Historic American Engineering Record, or a "United States. <agency>" heading), no item field marks an outside entry ("challenge", "competition", "contest", "prize": a "HALS Challenge Entry" or a Peterson Prize entry is made by outside entrants), every named creator or contributor carries a government affiliation in its own heading (a federal survey or a "United States. <agency>" heading; a staff role such as photographer or historian alone is not evidence, and a name with no role, such as a family member, or a role such as owner or architect blocks it), and none of its item fields (title, notes, description, medium, credits, image file titles and captions; never the page's ordering prose) marks the image as a copy ("photocopy", "copied from", "copy of", "copy photograph", "recopy", "photograph of a photograph", "reproduction of") | `public-domain`; otherwise never usable |
| `loc` | "No known restrictions on work by staff photographers", and the same record's credit fields name a U.S. News & World Report staff photographer (Warren K. Leffler, Thomas J. O'Halloran, Marion S. Trikosko, John Bledsoe, Chick Harrity; "Leffler, Warren K." or "Warren K. Leffler": anywhere in a creator or contributor name heading, but in notes, the statement of responsibility or the rights text only in a credit form, "photograph by <name>", "Photographer: <name>" or "<name>, photographer", never a mention) and no wire service | `public-domain` |
| `loc` | "No known copyright restriction", and the record is in the New York World-Telegram & Sun collection (`part_of`, `source_collection` or notes) and credits a staff photographer ("NYWT&S staff photograph", "World-Telegram photo", "World-Telegram & Sun photo by ...", a creator or contributor with the role photographer, or "photo by <name>") and no wire service | `public-domain` |
| `loc` | either conditional wording without its staff credit, or with a wire-service or agency credit (Associated Press, AP Wirephoto, Acme, United Press, UPI, International News Photo, INP, Underwood, Harris & Ewing, Wide World, Keystone, Bain News, Pacific & Atlantic) in a credit field | never usable: `unknown` or `rights-restricted` |
| `loc` | an approved wording followed by a caveat that asserts a restriction: "may be restricted", "restrictions apply", "restrictions may apply", "copyright restrictions", "permission required", "permission is required", "not in the public domain", "may be protected", "privacy and publicity rights" (so the CQ Roll Call "Other material may be restricted by copyright" advisory is blocked; LoC's full government wording above is its own phrase, not a caveat) | never usable: `unknown` or `rights-restricted` |
| `nara` (archives.gov) | use restriction status "Unrestricted" (records created by the federal government) | `public-domain` |
| `loc` | "Publication may be restricted" or "Rights status not evaluated" anywhere in the advisory | never usable: `unknown` or `rights-restricted` |
| `nara` | use restriction "Restricted", "Restricted - Possibly", "Restricted - Partly", "Restricted - Fully", "Undetermined" | never usable: `unknown` or `rights-restricted` |
| anything else | not decided by this rule | strictly from the holder's statement, judged by the adversary |

- The rule applies only to a source whose url the authority registry resolves to the `loc` or
  `nara` entry. It reads the holder's own rights field in that source's saved snapshot, and only
  from a snapshot that passes G1: LoC `rights_advisory` / `rights_information`, NARA
  `useRestriction.status` (never `accessRestriction.status`, never LoC's `unrestricted` access flag).
  It never infers public domain from a Wikimedia Commons tag or any other host.
- Owner decision 2026-10-18 (HABS CA-1890, `docs/handoff/DECISIONS.md`): for the full government
  wording, a record made by a federal survey (part_of or creator HABS, HAER or HALS; not a "United
  States. <agency>" record) distinguishes makers from associated people. A creator or contributor
  heading with no role is an associated person (an owner's family) and does not block; when the record
  lists the survey's team roster (a project manager, field team or field team supervisor), its
  photographer and historian count as survey staff. Every other role (owner, architect, subject,
  transmitter ...) still blocks, as do the outside-entry and copy markers. The copy check is item-scoped
  (`rights_class(..., item={url, title})`): for a media item whose url is one image file of the record,
  the titles and captions of the record's other image files are not read, so a record that bundles
  recopied historic photographs bars only the recopy's own file; the record-page item and any item whose
  url is not a file of the record still read them all, and the item's own title is always read.
- A staff photographer credit is read only from the same snapshot's credit fields (`creators`,
  `contributors`, `contributor_names`, `stmt_of_responsibility`, `notes`; for U.S. News also the
  rights wording itself), never from a title, a subject heading, a Commons page or another source.
  The audit note `apply_rights_rule.py` and `merge_staging.py` write names the credit.
- A sentence after an approved wording that supports free status ("No renewal in Copyright office
  (checked 8/31/76)") or only points to more information ("For more information, see ...") does not
  block it. The caveat check reads the whole text after the wording, so a pointer whose own title
  contained a caveat phrase would block too (the safe side).
- `public-domain` needs the item's `rights_statement` to be that field's wording, so the site always
  shows the archive's exact words next to the item. A missing `rights_statement` is copied
  verbatim from the holder's field (`rights_url` the holder's page); with no holder field it stays
  null and the item stays `unknown`.
- G1 for media fails when `license_class` disagrees with the rule (the rule says public-domain and
  the record does not; or a barred item is marked embeddable), or when the statement is missing but
  the holder's snapshot carries one. `merge_staging.py` sets the derived fields on staged media and
  refuses a barred item staged as usable; `apply_rights_rule.py <slug>|--all [--dry-run]` brings media
  on file into line the same way (it refuses, writing nothing, rather than rewrite a barred item
  marked usable, unless the rule itself granted public-domain earlier: license_class is still
  public-domain, its last audit line in notes is a grant, and no person has approved, edited or
  rejected the item, so it sets license_class back to unknown with an audit line; a licence a person
  set later, such as cc-by, is never overwritten). Changed items fall under the edit lock (G7): compute_status clears the old verdict
  and the adversary judges them again (`adversary.py --ids <changed ids>`).

#### 3.4.3 Private writings in public files (owner decision 2026-10-20)

`docs/handoff/DECISIONS.md` "Private writings in public archives". A privately written item (a
letter, petition, application text or memo) held in NARA, LoC or other public files may be
embedded only if **(a)** every author died before 1956 (unpublished works: life + 70), or **(b)** the
holder itself states it is public domain, or **(c)** it was published before 1931. Otherwise it is
link-only. NARA "Unrestricted" (and LoC "No known restrictions ...") alone is not a rights grant for
such an item. Records created by the federal government keep the rule of 3.4.1. General guidance,
not legal advice; the cut-off years are the owner's and a person updates them each January
(`rights.DEATH_BEFORE`, `rights.PUBLISHED_BEFORE`).

A media record says who wrote it in `authorship` (optional; absent means the 3.4.1 rule alone, as before):

| Field | Rule |
|---|---|
| kind | `private` (written by a private person or body, whoever holds it now) or `federal` (created by the federal government) |
| authors | `[{name, death_year, death_basis}]`, every author or signer the holder's page names; `death_year` an integer or null (unknown); a year needs `death_basis`: `{fact_id}` (a fact on file) or `{source_id, quote}` (a quote copied from an intact source snapshot, such as a NARA contributor heading or a LoC name authority record "Einstein, Albert, 1879-1955") |
| published | optional `{year, basis}`, the same basis shapes |
| note | optional |

`tools/ihh/rights.py` (`item_ruling`, `private_grant`; the one implementation) decides, for `kind`
private, on top of the 3.4.1 rule (a barred LoC / NARA status still bars):

- (c) `published.year` < 1931 and its basis says the item was published that year (`published`,
  `publication`, `printed`) and gives the year;
- (b) the `rights_statement` says "public domain" (not negated: "not in the public domain" never
  counts) and is verbatim in the intact snapshot of one of the item's sources on a registered holder
  that may be primary or institutional and is not a media-only host (never a Commons page);
- (a) every author has `death_year` < 1956 and a basis that backs it: a fact basis is `verified` and
  its claim names the author's surname, gives the year (in the claim or its `event_date`) and says the
  author died (`died`, `dies`, `death`, `deceased`); a source basis quote is verbatim in an intact
  snapshot and gives the surname, the year and the death word or a life span `<birth>-<year>`.

Any condition met: `public-domain` (G1 fails until license_class follows; `apply_rights_rule.py`
sets it with an audit line). None met: never usable (`unknown` or `rights-restricted`); a
`public-domain` class that rested only on the holder's LoC / NARA wording goes back to `unknown` with
an audit line while no person has approved, edited or rejected the item (otherwise G1 fails and a
person decides). Facts are not affected: a fact quoting a transcription of a link-only item stays as
it is (facts are not copyright). `tools/set_authorship.py <slug> <ID> --json ...` records authorship
through the write boundary (`schema.check_authorship`). `authorship` is covered by the media edit lock
(G7) and the adversary fingerprint only when set, so no other record's verdict changes; the adversary
sees each author, death year and basis (fact claim or quote) and the rule text (`rights.PRIVATE_RULE_TEXT`,
part of `rights.RULE_TEXT`), and judges that the kind is right and every author the holder's page names
is listed. Basis sources are shown as `basis_source`, not as item sources, so G10 does not require them live.

### 3.5 searches.jsonl
`{id, date, family, tool, query, results, produced: [ids], agent, run_id, notes}`.
Every search an agent runs is logged, including ones that produced nothing. `results` is the
integer count of results the search returned (null only when the tool reports no count), never
text; commentary about the results (which hosts or record types appeared) goes in `notes`.

### 3.6 data/registry/institutions.json (authority registry)
Rule: a source is primary or institutional only if its publisher is in a curated authority
registry; independence is counted by registry entry; everything else is secondary.

`{"about": "...", "entries": [{id, name, kind, domains, hosts, may_be, primary_paths?, media_only?, verified_on, note}]}`

| Field | Rule |
|---|---|
| id | lowercase letters, digits, hyphens; unique; the G5 independence key |
| name | the publisher's name; a registered source's `institution` must equal it |
| kind | `government`, `archive`, `museum`, `university`, `prize`, `foundation`, `publisher-aggregator`, `public-university-archive` (owner policy 2026-10-10: a public university's archive, special-collections or digital-library host holding original items; the loader allows only `may_be: ["institutional"]` and exact `hosts`, never a whole university domain; entries are added one at a time after review) |
| domains | registered domains (the entry covers each and all its subdomains); a subdomain or a public suffix is refused |
| hosts | exact hosts (a leading `www.` or `m.` label, and an `m.` label after the first, are ignored in a url: `commons.m.wikimedia.org` is `commons.wikimedia.org`), for a publisher that shares its registered domain with others (`patents.google.com`, `commons.wikimedia.org`) |
| may_be | `["primary", "institutional"]` (either or both) or `["secondary"]` |
| primary_paths | optional, only with `primary` in may_be: `"host/path/"` prefixes (on the entry's own hosts or domains, ending in `/`) where the publisher's original records live, e.g. `catalog.archives.gov/id/`. When listed, `primary` is allowed only for pages under one of them; every other page may be institutional at most. Without it, `primary` covers the whole entry only for a records holder (kind `government` or `archive`); a museum, university, prize body, foundation or aggregator allows no `primary` until a person lists its record paths |
| media_only | optional; true: may back media items, never a fact (Wikimedia Commons) |
| urls | optional, instead of `domains` and `hosts`: a single-record entry covering only these canonical https records (`fetchplan.same_record`), never another page on their site, which stays unregistered (owner decision 2026-10-10: Nature 107:539 only). Not combined with `domains`, `hosts` or `primary_paths`; a record may not sit under another entry |
| content_part | optional, only `transcription`: the entry allows its types only for a source with the same `content_part` (section 3.2) |
| supporting_only | optional, true only with `may_be: ["secondary"]` (owner decision 2026-10-16: Wien Geschichte Wiki): the publisher may count as an independent second holder for G5, but is never primary or institutional and never the sole source of a fact (G9, `gates.g9_fact_use`) |
| part_of | optional: the id of another entry this publisher is part of (a presidential library of the National Archives, DocsTeach): G5 counts both as one holder (`Registry.holder_root`, `Standing.holder_ids`); the loader refuses an unknown id or a cycle |
| owner_approved_on | optional YYYY-MM-DD: the date the owner approved the entry |
| verified_on, note | when and how a person confirmed that the domain is that publisher's |

`tools/ihh/authority.py` loads it and refuses a malformed file (duplicate ids, a domain or host
listed twice, a host under another entry's domain). `Registry.resolve(url)` reads only the url's
own host, exact host first, then registered domain; nothing is unwrapped, so a Wayback,
archive.today, Google Translate or cache copy, a short link or a look-alike host
(`archives.example.org.evil.com`) resolves to nothing, and so does a url that is not in
canonical form (section 3.2 `url`). Authority comes only from the registry: a `.gov` or `.mil`
host no entry covers is an unregistered site like any other (secondary only). Registered domains use the public suffixes in `PUBLIC_SUFFIXES`
(`com`, `org`, `edu`, `gov`, `mil`, `net`, `info`, `gov.uk`, `ac.uk`, `org.uk`, `ac.il`, ...); a
host under an unlisted suffix falls back to its last two labels, which can only merge sites.

People maintain the registry. Tools and pipeline agents never write it: every write the tools
make goes through `ihh/records.py`, which refuses any path in a data folder's `registry/`
(`paths.refuse_registry_write`). How to propose an entry: the skill, "Proposing a registry entry".

---

## 4. Gates

| Gate | Kind | Implemented in | Rule |
|---|---|---|---|
| G1 Evidence | deterministic | `tools/gates.py` | Every evidence quote appears in its source snapshot after normalization (NFKC, casefold, unify quotes/dashes/apostrophes, collapse whitespace, drop soft hyphens). Snapshot sha256 must match the meta file, and the meta file must name the record's url and fetch_method and, for `http`/`api`, exactly the URL the record is fetched from (re-derived by `fetchplan.plan_fetch()`). Snapshot provenance (a snapshot must be fetched from the cited record itself): the record's `fetch_url`, and a `browser`/`manual` meta file's `fetch_url` if any, must be the same record as the url (`fetchplan.same_record()`; the fragment may be dropped, never changed) or the endpoint an adapter derives from it (`fetchplan.fetch_url_problem()`, the one check `fetch_snapshot.py`, `merge_staging.py` and `validate.py` all use). A meta file's `final_url` (where redirects ended; `fetch_snapshot.py` records it and refuses a redirect to another record) must be the same record as its `fetch_url`. A LoC page snapshot that holds the page's OCR text (meta `full_text_url`) must be that page's own text: the meta records the page record's `segment_id`, the full-text URL's `segment` must equal it, and the snapshot carries the `segment_id:` and `full_text_url:` lines the meta records. Any mismatch is an error. For media: the rights_statement is verbatim in a source snapshot (a missing statement passes only while license_class is not embeddable), and license_class agrees with the approved LoC / NARA rights rule (section 3.4.1). |
| G2 Nothing added | deterministic | `tools/gates.py` | A claim may contain no content word that its evidence quotes do not contain. One construct decides what a content word is (`content_tokens()` in `tools/ihh/normalize.py`) and one function applies the rule (`unsupported_tokens()` in `tools/ihh/gates.py`); there is no list of risky phrasings. Text is NFKC-normalized with quotes, apostrophes and dashes unified; dates parse to ISO (so `June 10, 1941` matches `1941-06-10`; an ambiguous numeric date (`10/6/1941`) needs every reading supported, and an ambiguous evidence date supports only the same form or the year); a month named alone (`in May`, not the first word of a sentence) is a month-only date, never a word, so a date's month never supports `may`, `marched` or `august`; number words and digits are one number (`thirteen` = `13`, `first` = `1st`, `a dozen` = `12`, `half a dozen` = `6`, `a score` = `20`), and a decade or century is a span of time that keeps its unit (`a decade` = `10` plus `years`, so a bare count of 10 does not support it). Each kind of token is supported only by the same kind: a number by a number written in the support (never a date's day; a year written alone also by a date's year; a number written with digit separators, `2,292,387`, also by a code's digit run, `US2292387A`, never a short count by a shelf mark like `B12`). Decades (`1950s`, `the fifties`), ages (`in his forties`, a decade word after a possessive, supported only by the same age), codes (`US2292387A`) and meaning-bearing symbols (`%`, `$`, the pound and euro signs, `<`, `>`, `~`, the approximately-equals sign, `+`, the dagger, and a minus sign before a digit; punctuation, a range dash and `&` state nothing) are tokens of their own. Every other word is casefolded, stripped of accents and a possessive `'s`, split at hyphens and lightly stemmed (regular `-s`, `-es`, `-ies`, `-ed`, `-ing` only, and `-ing` after a plural `-s`, so `arrived` matches `arriving` and `buildings` matches `building`; the plural of a counting unit such as `decades`, `hundreds` or `years` is never reduced to the singular); case never changes a word's key, so an all-caps record (`TEST PERSON HELD PATENTS`) supports a normally written claim. A closed-class word (`CLOSED_CLASS_WORDS`: negation, modals, quantifiers, degree, time, order, cause, contrast) never inflects and is matched only by the identical word, never by another word's stem (`noted` never supplies `not`, `willed` never `will`, `evening` never `even`). Only `FUNCTION_WORDS` (articles, plain prepositions, pronouns, forms of be/have/do, `and`, `than`; never a word that is also a content word, such as `mine` or `does`) are dropped; quantities, negation, temporal and ordering words, modals and evaluative words never are, and a test enforces it. Each uncovered token is a failure naming it. Names may match via `inductee.json` aliases that are names (section 3.1) backed by identity evidence; a name supplies only its words with the same capitalization; the acronym `US` needs `US`, never the pronoun `us`. No synonyms: a paraphrase (`became a citizen` for `citizenship`) fails until the claim reuses the quote's words or the extractor quotes more. `event_date` and `place` must also be supported by the claim or its quotes. For media, the title and alt_text are checked the same way against the item's source snapshots and the claims of the facts they name or the reconstruction basis.
| G3 Atomic | adversary | adversary verdict `atomic` | One event or attribute per claim. |
| G4 Adversary | model, cross-model | `tools/adversary.py` (Codex) or Claude fallback | Independent context, refute-by-default, sees claim + evidence + url + fetch_url + snapshot path, never the extractor's reasoning. It judges source type by the same registry rule the gates use: each source line shows its registry standing (`adversary.registry_line()`), a publisher not in the registry is secondary by rule, and `source_type_ok` is false only if a label claims a type the standing does not allow, a `primary` label is not on the original record, a `secondary` label understates an original record on a publisher listed for primary, the source is about a namesake, or it is a banned site. A publisher that could be registered is reported in `registry_suggestion`, never as a failed fact. The registry standing is shown, not judged: it is not in the fingerprint, so a prompt change leaves stored verdicts as they are until the item is judged again. |
| G5 Corroboration | deterministic | `tools/gates.py` + `tools/ihh/authority.py` | A source counts toward G5 only if its own quotes (every evidence item citing that source, read together) cover the whole fact on their own: every content token of the claim by the G2 rule (`unsupported_tokens()`, the same coverage test G2 and G6 use), plus the `event_date` and every token of the `place` when the fact has them (`gates.whole_claim_gaps()`). As in G2 the inductee's names supply their own name words, but for G5 only the name words the source's own snapshot contains: a record that never names the person does not vouch for a claim about them. Quotes from different sources are never pooled for G5: a primary record that supports one part of a claim and a newspaper that supports the rest corroborate nothing. Then G5 passes with one counting source that is a `primary` source whose type the registry allows, or with counting sources from 2+ independent holders of which at least one counting source is a `primary` or `institutional` source the registry allows. Holders are grouped over every cited source and a group counts when it holds a counting source, so a source that covers only part of the claim can still join two holders into one but never adds a holder. Independence (`authority.independent_groups()`, `Standing.same_holder()`): sources sharing a registry entry, or an institution text that names a registered holder (`X Library, Special Collections` claims `X Library`), count as one holder; so do sources on one registered domain when at least one of them is unregistered (sibling subdomains, and every page on a hosting platform such as archive.org, count once). Two different registry entries are two holders even when their exact hosts share a registered domain. The free-text institution never makes two holders. **Same text is one holder** (2026-10-10, `gates.g5_holders()`): two sources are also one holder when (a) one source's `derived_from` chain reaches the other, both chains reach a common origin, or a source in one chain is the same holder as a source in the other; or (b) their quotes for the fact are near-verbatim copies (`gates.copied_quotes()`): after normalisation (`normalize_text`, each word folded; punctuation and spacing ignored) some quote of one and some quote of the other, the shorter having at least `COPY_MIN_TOKENS` = 8 word tokens, are either contained one in the other as a contiguous token run or have `difflib.SequenceMatcher` ratio >= `COPY_SIMILARITY` = 0.85. A failure names each joined pair and the reason. A registry-allowed primary document that covers the whole claim still passes alone. |
| G6 Grounded writing | deterministic + adversary | `tools/check_grounding.py` + sentence adversary | Every draft sentence lists fact ids; all cited facts are `verified`; the sentence, title or caption contains no content word, date, number, decade or code that the cited claims or aliases lack (the G2 rule and construct; titles are short labels written in the claims' own words); quoted text in the sentence, in any quotation style (straight or curly, single or double, guillemets, CJK corner brackets; `normalize.quoted_spans()`, the one reader), matches a cited `is_direct_quote` fact verbatim; adversary confirms the sentence adds no information. The adversary's verdicts are stored in `drafts/grounding.jsonl` with the fingerprint of the text and cited claims judged; the final export publishes a sentence, title or caption only with a current `supported` verdict and `adds_information` false. |
| G7 Edit lock | deterministic | `tools/gates.py` | A `verified` fact whose current normalized claim hash differs from `verified_claim_sha256` fails until re-verified. |
| G8 Human | person | review dashboard (later) / `review/decisions.jsonl` | Only `review.state` in {`approved`, `edited`} is exported for publishing, and only when `review/decisions.jsonl` holds the decision that set it: the latest approve/edit/reject decision for the item is the matching action by the same reviewer on the same date and about the current content: for a fact, an approval's `before` or an edit's `after` equals the current claim; for a media item, an approval's `before` equals its current `media_lock_sha256`. A decision without that content backs nothing (`tools/ihh/review.py`). An `edited` fact must pass G1, G2, G7 again (re-verification) before export. |
| G9 Source authority | deterministic | `tools/gates.py` + `tools/ihh/authority.py` | `authority.source_problems()`: the url is in canonical form (`ihh/urls.py`); a `primary` or `institutional` source needs a url that resolves to a registry entry whose `may_be` lists that type, and `primary` also needs the page to be under the entry's `primary_paths` (or, with none listed, a records-holder entry); a registered source's `institution` is the registry name; an unregistered source's institution may not name a registered holder. A fact may not cite a `media_only` publisher on any of its hosts, nor any host under `authority.MEDIA_ONLY_SITES` (`wikimedia.org`) (`g9_fact_use`). Defence in depth: the section 3.2 host list and Wikipedia mirrors (`BANNED_DOMAINS`), looking through archive, cache and proxy wrappers, and archive short links that hide the original page, are banned for url, fetch_url and archive_url. `merge_staging.py` refuses a staged source that fails the authority check. |
| G10 Snapshot integrity | adversary + deterministic | adversary verdict `live_by_source` (per source), else `quote_in_live` (legacy); `gates.g10_snapshot_integrity()` | **Per-source rule** (owner-approved 2026-10-10; a verdict with `live_by_source`): the *required sources* are, for a fact, the sources G5 counts toward it (`gates.g5_counting_sources()`: each source whose own quotes cover the whole claim, event_date and place) or, when G5 counts none, every cited source; for a media item, every cited source. G10 passes only if (1) no cited source has result `not_found`, and (2) every required source has a result that is either `found`, or `unreachable` on a source whose snapshot was machine-fetched (`fetch_method` `http` or `api`, the same exemption as the per-fact rule). A required source with no result, or with `unreachable` on a `browser`/`manual` snapshot, fails. An `unreachable` source that is not required is ignored. This is never looser than the per-fact rule for a source G5 counts: such a source passes only on `found`, or on `unreachable` for an `http`/`api` snapshot, exactly what the per-fact rule accepts; the only relaxation is that an unreachable source G5 does not count (one whose quotes cover only part of the claim) no longer fails the fact. **Legacy rule** (a verdict without `live_by_source`, unchanged): `quote_in_live` `no` fails; with any `browser`/`manual` snapshot cited, only `yes` passes (`unreachable` is not enough); with only `http`/`api` snapshots, `yes` or `unreachable` passes. A legacy verdict keeps the legacy rule until the item is judged again (`adversary.py --ids`). |
| G11 Identity | deterministic | `tools/gates.py` (`g11_identity`) | A fact is a statement about the person's life, work or legacy that a museum visitor could read; catalogue metadata (record headings, control numbers, field names) is provenance, not a fact. A fact of category `identity` establishes a name the inductee was known by, so its claim must contain one of the aliases in inductee.json (the ones that are names). The rule names no words. Withdrawn and rejected facts are exempt. The workflow's extractor and merge prompts exclude metadata, and the Critic phase withdraws any that remain; this gate is the deterministic backstop for the identity category. |

---

## 5. Status derivation (`tools/compute_status.py`)

Applied to every fact and media item; deterministic; idempotent.
1. `rejected` and `conflicting` set by a person or the merge step are kept.
2. If extractor verdict is `withdrawn` -> `rejected`.
3. If any of G1, G2, G9, G11 fails -> `pending` (with the failure written to the validator report).
4. If adversary is null, or its `judged_sha256` is missing or no longer matches the record
   (the claim, evidence, sources, snapshots, rights fields, alt text or reconstruction basis
   changed after it was judged) -> `pending`.
5. If adversary verdict is not `supported`, or `entailed` is false, or `adds_information` is
   true, or `atomic` is false, or `source_type_ok` is false, or G10 fails -> `disputed`.
6. If G5 fails -> `single-source`.
7. Otherwise -> `verified`, and set `verified_claim_sha256` if null.
8. A `verified` fact failing G7 -> `pending` and `verified_claim_sha256` cleared.

compute_status also re-derives each fact's `primary_document` (section 3.3).

`tools/validate.py <slug|--all>` runs all deterministic gates, schema checks, id uniqueness,
reference integrity, and the export rules; exits 1 on any error; prints a per-gate summary.
The shipped data passes `validate.py --all` (`tools/tests/test_shipped_data.py` enforces it), so a
new or stricter rule lands together with the repair of every record on file that it flags: the
record is fixed, recategorized or withdrawn through `records.py`, never left failing.

---

## 6. Tools (Python 3.12 standard library only; pytest for tests)

| Tool | Contract |
|---|---|
| `tools/ihh/` | Package: `schema.py` (the record schema, section 3), `rights.py` (the approved LoC / NARA rights rule, section 3.4.1), `records.py` (load/save JSONL with an fcntl lock, atomic replace, the write boundary of section 3; refuses to write the authority registry), `normalize.py` (text normalization, date and number parsing, `content_tokens()` for G2/G6, `quoted_spans()`, `name_problem()`), `urls.py` (the one URL reader: canonical http(s) URLs only, used by authority, fetchplan, validate, export, new_inductee and fetch_snapshot), `authority.py` (the authority registry: `resolve()`, `source_problems()`, `independent_groups()`, registered domains), `fetchplan.py` (adapters, `plan_fetch()`, `same_record()`, `fetch_url_problem()`), `gates.py`, `ids.py` (next id per kind) |
| `tools/new_inductee.py <slug> --name --code [--ihh-url]` | Creates the folder and inductee.json |
| `tools/fetch_snapshot.py <slug> <SRC> [--from-file PATH --method browser|manual]` | Refuses a `fetch_url` that is not the cited record (section 3.2). Fetches `fetch_url` or `url` with a descriptive User-Agent, follows a redirect only to a canonical URL naming the same record (`fetchplan.same_record()`; any other redirect, including an open redirect, a link resolver or a merged record, exits 1 and saves nothing) and records where the request ended as meta `final_url`, converts JSON to `key: value` lines and HTML to text (scripts/styles removed, entities unescaped), writes snapshot + meta, updates the source record. Built-in adapters: NARA (`catalog.archives.gov/id/N` -> proxy API), LoC (`?fo=json`; a newspaper page record also has its own OCR text fetched from the LoC Text Services URL it names as `resource.fulltext_file` (`https://tile.loc.gov/text-services/word-coordinates-service?segment=<page>.xml&...&full_text=1`; the record must name its own `segment_id` and the URL's segment must be it, or nothing is saved), kept verbatim after the record's lines under `segment_id:`, `full_text_url:` and `full_text:`, with meta `full_text_url` and `segment_id`; G1 checks the URL is that endpoint (`fetchplan.loc_full_text_problem()`), that its segment is the meta's `segment_id`, and that the snapshot carries the same two lines (`gates.loc_full_text_header_failures()`)), Wikimedia Commons file pages (API extmetadata), Google Patents, and (owner approval 2026-10-16) NARA page transcriptions (fetch_url the record's contributions endpoint: the record's active Citizen Archivist page transcriptions, pages in the record's order, read with the record's own JSON for its title and page file names, meta `record_url`, which G1 holds to that record's endpoint; contributions for another record are refused) and USPTO Patent Public Search (fetch_url the record endpoint; the public site's session endpoint issues an anonymous token, sent and never saved; bibliographic fields then abstract, description and claims as text; an answer for another patent is refused). Both save method `api`, so G10 treats an unreachable live check like any machine-fetched snapshot. On HTTP 403/429/JS-only pages it exits 2 with a message telling the agent to supply text via `--from-file` with method `browser`. |
| `tools/merge_staging.py <slug>` | Reads `staging/*.jsonl` candidate records (temp ids), assigns permanent ids, rewrites evidence `source_id` references, appends to the main files, records the run in inductee.json. Refuses duplicates by normalized claim text; semantic dedup is done by the merge agent before this runs. Fills a blank `institution` from the registry entry the url resolves to, sets each fact's `primary_document` from its sources' types, applies the approved rights rule to staged media (section 3.4.1), and refuses the whole merge if a staged media item the rule bars is marked usable, if a staged source fails the authority check (G9) or names another record in fetch_url, or if any record it would write breaks the schema (section 3, write boundary). |
| `tools/adversary.py <slug> [--ids ...] [--all-pending] [--parallel N] [--engine auto|codex|claude-handoff]` | Groups pending facts/media by source, builds the adversary prompt from records only, runs `codex exec --skip-git-repo-check -s read-only -c 'web_search="live"' --output-schema <schema> -o <out>` with stdin closed and a timeout, writes verdicts with `model` = `codex:<model>`. `auto` uses Codex when `codex login status` succeeds, else writes `adversary_requests.jsonl` (each request with its prompt and `judged_sha256`) for the workflow's Claude fallback agents and exits 3. `--ingest FILE` records fallback verdicts and refuses a verdict whose `judged_sha256` is missing or differs from the record. `--all-pending` also selects items whose verdict is stale. Reconstructions are judged against their basis. Never writes `status`. |
| `tools/compute_status.py <slug|--all>` | Section 5 |
| `tools/apply_rights_rule.py <slug|--all> [--dry-run]` | Section 3.4.1: copies a missing rights_statement verbatim from the holder's snapshot field and sets license_class where the approved rule grants public-domain, with an audit line in notes; refuses (exit 1, nothing written) if a barred item is marked usable. Reconstructions and rejected items are left alone; idempotent |
| `tools/check_grounding.py <slug> [--json] [--record FILE] [--content-dir DIR]` | G6 deterministic part; report per sentence, covering drafts/profile.json and the experience content (`content:<chapter id>:...` units from `content/<slug>/chapters`, which tools/export.py publishes). `--json` prints each unit with its `unit_sha256`; `--record` stores sentence-adversary verdicts in `drafts/grounding.jsonl`, refusing any whose `unit_sha256` differs from the unit as it is now |
| `tools/validate.py <slug|--all>` | Section 5 last paragraph |
| `tools/export.py <slug|--all> [--preview]` | Writes section 2 `export/` files. Without `--preview`, only facts/media with status `verified` and review `approved`/`edited` backed by `review/decisions.jsonl` (G8), and draft sentences whose facts all qualify and that have a current `supported` sentence-adversary verdict (G6). The "How to cite" line is generated from inductee.json; `profile.how_to_cite` is never published. `--preview` includes unreviewed verified items and stamps every block "DRAFT — NOT REVIEWED". Refuses if validate fails. |
| `tools/apply_review.py <slug> <decisions.jsonl>` | Applies reviewer decisions (approve / edit claim / reject / note) with reviewer name and date; edited claims drop to re-verification per G8. |

Adversary prompt (both engines) must instruct: try to refute; default to `unclear` if the
source cannot be read; check the quote is in the snapshot and, if reachable, in the live
source; judge whether the claim is fully entailed by the quotes and adds nothing; judge
atomicity; judge the source type by the registry rule (G4 row of section 4) and put a publisher
that could be registered in `registry_suggestion`; for media, judge that license_class follows from
the holder's own words under the approved rights rule (section 3.4.1, `rights.RULE_TEXT` in the
prompt); return only the schema.

---

## 7. Draft content (`drafts/profile.json`)

```json
{"slug": "lamarr", "generated": "2026-10-09", "run_id": "...",
 "summary":   [{"text": "...", "fact_ids": ["LAM-F-0001"]}],
 "sections":  [{"id": "arrival", "title": "...", "sentences": [{"text": "...", "fact_ids": ["..."]}]}],
 "timeline":  [{"date": "1937", "title": "...", "text": "...", "fact_ids": ["..."], "media_ids": ["..."]}],
 "artifacts": [{"media_id": "LAM-M-0003", "caption": "...", "fact_ids": ["..."]}],
 "avatar_lines": [{"speaker": "inductee|guide", "kind": "quote|narration", "text": "...", "fact_ids": ["..."]}],
 "how_to_cite": null,
 "gaps": ["No verified source yet for ..."]}
```
`how_to_cite` is kept for compatibility and is never published: tools/export.py generates the
citation line from inductee.json (name and IHH page URL), so it states no biographical fact.

`drafts/grounding.jsonl` holds the sentence adversary's verdicts, one row per judged unit:
`{location, unit_sha256, model, run_id, date, verdict, adds_information, rationale}`.
`unit_sha256` (tools/check_grounding.py) covers the unit's kind and text and the cited facts'
claims; a verdict applies to the unit with that fingerprint, so any later edit to the text or a
cited claim needs a new verdict before the final export publishes it.
Avatar `quote` lines must equal a cited `is_direct_quote` fact verbatim. Avatar `narration`
lines in the inductee's voice are labeled "AI recreation" on the site and pass G6 like any
sentence. Titles are short labels and also pass G6.

---

## 8. Human review

`review/decisions.jsonl`: `{date, reviewer, item_id, action: approve|edit|reject|note, before, after, note}`.
`before` is the content the reviewer saw: a fact's claim, or a media item's `media_lock_sha256`
(G8 counts an approval only with it; `tools/apply_review.py` fills it in when it logs a decision).
The review dashboard (built in the website phase) writes this file; `tools/apply_review.py`
applies it. Until the dashboard exists, reviewers can edit `export/REVIEW.md` checklists and a
maintainer records decisions with `apply_review.py`.

---

## 9. Saved workflow (`.claude/workflows/ihh-inductee-pipeline.js`)

Args: `{name, slug, code, date, ihh_url?, adversary?: 'auto'|'codex'|'claude', max_facts?: 80, root?}`.
`date` (required, today as YYYY-MM-DD) is the run date: the workflow runtime cannot read the clock.
`root` (optional) is the project folder, defaulting to the maintainer's checkout.
Phases (pipeline() wherever items are independent; barriers only where noted):
1. **Identify** — resolve identity and aliases from authority records (LoC name authority,
   NARA, institutional bios); create inductee.json; disambiguate homonyms.
2. **Baseline** — read the current IHH page via the WordPress REST API
   (`/wp-json/wp/v2/pages?slug=inductee-<...>`), stage each of its claims for verification
   (IHH page is a `secondary` source), and flag suspected errors.
3. **Search** — one agent per family, in parallel, each writing only `staging/<family>.jsonl`
   and `staging/<family>.searches.jsonl`: `loc`, `nara`, `smithsonian`, `institutional`
   (official bodies, prize bodies, foundations, university archives, encyclopedias as
   secondary), `media` (images with the holder's own rights statement: LoC, NARA, museums and
   archives; Commons and Internet Archive only to discover items and their holders),
   `domain` (patents, Nobel, NPS, halls of fame, as fits the person). Each fetches snapshots
   with fetch_snapshot.py (browser fallback via the in-app browser tools when blocked).
4. **Merge** (barrier: needs all families) — one agent dedupes semantically, splits
   compound claims, removes catalogue metadata posing as facts, then runs merge_staging.py
   (which refuses a candidate that breaks the schema; the agent fixes the staging file) and
   validate.py; G1/G2/G11 failures go back to a repair agent once, then are withdrawn.
5. **Verify** — adversary.py (Codex). If it exits 3, Claude fallback agents judge each
   request in a fresh context with the same prompt and schema. Then compute_status.py.
6. **Corroborate** — for `single-source` facts in key categories (birth, immigration,
   citizenship, major work, award, death), one targeted search round for an independent
   second source, then Verify again for the new evidence.
7. **Draft** — write drafts/profile.json from `verified` facts only.
8. **Ground** — check_grounding.py, then adversary on draft sentences; failing sentences are
   repaired once from facts, then dropped. The verdicts are recorded with
   `check_grounding.py --record` (drafts/grounding.jsonl).
9. **Critic** — completeness critic lists missing life stages and weak spots into `gaps`, and
   withdraws any remaining fact that is catalogue metadata rather than a visitor fact
   (extractor verdict `withdrawn`, so compute_status rejects it; the reason goes in `notes`).
10. **Package** — validate.py, export.py --preview, REVIEW.md listing disputed and
    single-source items with both sides' reasoning; return a summary, including the
    adversary's registry suggestions for the person to review into `data/registry/PROPOSED.md`.

The workflow never commits, pushes, or publishes. Re-running on the same slug resumes:
existing ids are kept, new candidates are appended.

---

## 10. Skill (`.claude/skills/ihh-verified-facts/SKILL.md`)

Contains: when to use; principles; gate table; record schemas (or a pointer to this spec);
commands; how to run the pipeline for a new inductee
(`Workflow name: ihh-inductee-pipeline` with args); how review and export work; Codex
adversary setup and fallback; residual risks. A standalone API-key runner is documented
as future work in `docs/pipeline/STANDALONE.md` (design only).

---

## 11. Residual risks (documented, not solved)

- An agent could fabricate a `browser`/`manual` snapshot; G10 requires the adversary to find
  the quote live, and the human reviewer sees the link. Under the per-source rule (2026-10-10)
  this holds for every source G5 counts; a source G5 does not count (its quotes cover only part
  of the claim) may stay unconfirmed when unreachable, so it never carries the fact on its own.
  REVIEW.md lists each source's live result.
- Same-source errors (an archive's own catalog mistake) pass every gate; G5 corroboration and
  the conflicting status reduce this.
- G5's whole-claim test is the G2 token test applied per source, so it shares G2's limits: a
  source whose quotes contain every content word of the claim counts even if it relates them
  differently (word order, an omitted "not"); the adversary's `entailed` judgement covers this.
- G2/G6 detect added words, not omitted ones: a claim that drops a word the evidence has ("not",
  "against", "only") or swaps a function word ("he" for "she", "from" for "in") passes the
  deterministic check. Ordinals equal cardinals ("first" is covered by any "1" written in the
  evidence; a date's day no longer counts). Stemming can join two open-class words that share a
  stem ("news" and "new", "Reading" and "read", "building" and "build"); it can no longer supply a
  closed-class word ("not", "even", "will"). A bare number from 1000 to 2100 is read as a year, so
  a count in that range is covered by a date's year ("filed 1921 patents" against "in 1921").
  A decade word with no possessive and no century ("the fifties") is covered by a year in that
  decade of any century. A capitalized month name standing alone is a month, so a name such as
  "June" in the middle of a sentence is covered by a June date. The adversary's `entailed` and
  `adds_information` judgements cover these.
- G2/G6 strictness kept on purpose (the AI states facts; it does not author them), at the cost of
  false failures a writer fixes by reusing the source's form: symbols match only themselves ("50%"
  fails against "50 percent", "$5,000" against "5,000 dollars"); an age ("in his forties") needs the
  same age phrase, never a year or decade; "a decade" needs "a decade" or "10 years" (not "a
  ten-year term"); a code supports only its digits written with separators ("2,292,387"), so write
  the code or the grouped number; "the 14th" alone is not covered by a date's day; a closed-class
  word needs the identical word ("wills" does not cover "will"); a month that opens a sentence
  ("March was cold") stays a word and needs that word; a straight single quote around a word
  ("rock 'n' roll") is read as a quotation and must match a direct-quote fact; an alias that is
  not a name is refused and supplies nothing.
- No synonym table: a faithful paraphrase fails G2/G6 until it reuses the source's words, and
  irregular forms ("taught"/"teaching", "died"/"death") do not match. This is deliberate; the
  extractor quotes more or rewords with the quote's words, and the drafter writes with the cited
  claims' words.
- A verdict fingerprint shows what was judged, not who judged it: an agent able to write the
  record files could still forge a verdict. The adversary logs in staging/adversary/ and the
  human review (G8, backed by review/decisions.jsonl) are the checks on that.
- The authority registry is only as good as its review: a wrong entry (a domain that is not the
  publisher's, a `may_be` too generous) makes every source on it count as that publisher. Entries
  record `verified_on` and how they were checked; tools never write the file.
- A records-holder entry (kind `government` or `archive`) without `primary_paths` allows `primary`
  for every page on its domains, so a blog post on such a domain can be typed primary. The shipped
  registry lists no `primary_paths` yet: a person should add the record paths of each records
  holder (for example the NARA catalog's `/id/` records), after which only those pages can be
  primary. Other kinds (museums, universities, prize bodies, foundations) already allow no
  `primary` until their record paths are listed.
- An unregistered `.gov` or `.mil` site is secondary like any other (no review, no authority);
  a person adds it to the registry to make it institutional. Unregistered pages are keyed by
  registered domain (`ca.gov` covers every California agency, so they count once).
- URLs are accepted only in canonical form: an internationalized host must be written in its
  `xn--` form, and an IP-address host, userinfo, a backslash, whitespace or a trailing dot is a
  validate error (G9 and the schema), even where a browser would open the page.
- An unregistered page on a registered domain joins every registry entry on that domain for G5
  (conservative), so it can merge two otherwise independent entries that share a platform.
- `authority.MEDIA_ONLY_SITES` (`wikimedia.org`) is a code-level list (defence in depth, like the
  banned hosts): no host under it backs a fact, whatever the registry says.
- Two sites on different domains count as two holders when one paraphrases the other without
  saying so: G5 joins them only on a `derived_from` link or near-verbatim quotes (similarity
  >= 0.85 or containment). A rewording below that threshold, or a copied quote shorter than 8
  word tokens, is not detected; such pairs need `derived_from` set from the source's own
  statement or a reviewer's comparison. G5 still needs a registered primary or institutional
  source, and validate warns when two holders' names are near-identical. The copy test can also
  join two genuinely independent sources that quote one common text (for example the same
  letter); that under-counts independence, never over-counts it.
- A host under a public suffix not in `PUBLIC_SUFFIXES` falls back to its last two labels: this can
  merge unrelated sites (under-counting independence), never split one site.
- Snapshot provenance compares URLs, not content: an adapter endpoint or a `format=json` variant is
  trusted to return the same record as the url. A redirect counts as the same record when only the
  query order, a leading `www.`, a default port or a trailing `/` changes; a legitimate redirect to
  another path (a merged record) exits 1 until the record cites the new url. Meta files written
  before `final_url` existed carry none and are accepted; re-fetch with `--force` to record it.
- Likeness/publicity law is outside the pipeline; see DECISIONS.md.

---

## 12. Tour-research step (`tools/tour_research.py`, workflow `ihh-tour-research`; added 2026-11-01)

Codifies the manual tour research of October 2026 (DECISIONS 2026-10-16: "build the automated tour-research
step ... then codify that proven workflow"). Input: an inductee whose store exists (a new inductee runs
`ihh-inductee-pipeline` first). Output: verified facts, media and basis photos through the gates of sections
4-5, plus `drafts/tour-map.json` (the chapter assignment, a judgement), `drafts/tour.json` (derived),
generated blocks in TOUR-RESEARCH.md, ROOMS.md and ARTIFACTS.md, and `export/tour-research.jsonld` and
`export/tour.csv` for IHH's chatbot.

Rules (`tools/ihh/tour.py`, `check()`; `assemble()` refuses a map that breaks one):
- Chapter kinds: birth, education, leaving, arriving, first-work, citizen, big-work, history, honoured, legacy.
  A chapter holds only verified facts and at least one; its year comes from one of its own facts with a single
  event_date; chapters are ordered by year, then kind order.
- A title takes its words from one chapter fact; a place label from its place fact (a chapter fact); coords are
  `wikidata:Q<n>`, `osm:node/<n>`, `osm:way/<n>` or `holder:<id>`.
- records are verified items, verified basis photos with a usable licence, or disputed public-domain records
  under a current owner ruling (a review/decisions.jsonl note by the project owner starting "Owner ruling",
  whose `before` is the record's current media_lock_sha256); a reference-only basis photo is never a record.
  place_photos are verified basis photos linked to a chapter fact. Usable (licence class public-domain, cc0,
  cc-by, cc-by-sa) records count toward the target of 3.
- Journey: at least two places, each pinned on verified facts; one segment per pair; a segment is routed only
  when a verified fact names both places and states a journey (a travel word such as sailed, travelled,
  arrived; naming two places is not a journey), otherwise it carries "Route not recorded; the line joins the two
  places"; a mode needs a verified mode fact that is one of the segment's route facts and states travel by that
  mode (a travel phrase such as "sailed" or "by train"; a word such as "ship" alone is not travel); mode_facts
  without a mode are refused. A route fact states the leg itself: the destination right after to, for, into,
  reached or arrived in, and the origin right after from or left, or named first as where an earlier leg ended.
- Which records fit a chapter is a judgement: `assemble()` lists in `unlinked_records`, and as a gap, every record
  that names no chapter fact (by id in its alt text, in basis_for or reconstruction_basis, or by sharing a source
  with a chapter fact's evidence), so a reviewer confirms it.

Requests (`tools/ihh/polite.py`): https to loc.gov, catalog.archives.gov and www.wikidata.org only (no
redirect is followed; its target is reported for a search of its own), the fetch_snapshot User-Agent, 4 s between requests to a host, a
per-run budget, no personal data (checked on every percent decoding of the text, to a fixed point); HTTP 403, 429 or a bot challenge blocks the host for the run, and its sources
are deferred to `staging/deferred-<run>/` with a note (with every candidate that cites them, directly, through a
removed candidate or through `derived_from`). A search or snapshot is counted, spaced and marked in flight in `run.json` before it leaves (a later command
records an attempt left in flight as a failure of unknown outcome); a search row is written before its request
leaves and completed after it (a web search, made outside the CLI, is checked, counted and logged with `log --before` first, and
completed by a second `log`; one logged only afterwards is counted and marked); a repeated search (same merge key) is folded into one row, in staging and, after a merge, by
merge_staging into the logged row (notes added, produced joined; never refused). A response section the
adapter does not know (results, pagination, hits) is a logged parse failure with no result count. A snapshot's url and fetch_url must be https
and free of personal data before `fetch_snapshot.py` is called; a snapshot starts at least 4 s after the previous
one ended, on any host (one snapshot may request two hosts), every request inside a snapshot (a followed redirect, a LoC page's OCR text) is spaced by `fetch_snapshot.py --pace 4`, and a block (HTTP 403, 429, bot challenge; the status alone, even when the error body cannot be read) closes the whole holder domain (a bot challenge page answered with HTTP 200 counts: the challenge service's
markup, a challenge title, or a short page asking for a CAPTCHA) for the run (tile.loc.gov with
www.loc.gov), since the error names only the first URL of a snapshot that may request two hosts. The browser is used only for a JavaScript-only
page, never for a block.

Gate (`tour_research.py gate`): fetch_snapshot for unsnapshotted staged sources, merge_staging (dry run, then
real; the ids on file are saved before the real merge so a resumed run still judges what it merged),
adversary.py `--engine codex` on the new ids and any `--rejudge` ids, compute_status, validate (exit 0). No
step can be marked done by hand; new or changed staged candidates or staged searches rerun every step, and `--rejudge` reruns the
adversary, status and validate. The gate runs again after Assemble (the closing gate), so a search made
there is merged; `docs` refuses while any staged search or candidate is unmerged. The docs say which gate steps ran. Run state and resume: `staging/tour/<run>/run.json`. `docs` rebuilds
`drafts/tour.json` from the current map and store before writing. The step never commits, publishes or emails.
