# Proposed authority registry entries (for human review)

These are proposals only. Nothing here is in force: the authority registry is
`data/registry/institutions.json`, and only a person edits it (SKILL: "Proposing a registry
entry"). Until an entry is added there, every source on these sites stays `secondary`, which is
the correct label under the registry rule; the adversary no longer fails a fact for it.

To accept a proposal: add the entry to `institutions.json` with `verified_on` and a `note` saying
how you checked it, run `python3 -m pytest tools -q` and `python3 tools/validate.py --all`, then
change the affected sources' type, re-run `python3 tools/adversary.py <slug> --ids <fact ids>` and
`python3 tools/compute_status.py <slug>`.

Evidence below was collected on 2026-10-09 with plain HTTPS requests (curl, following redirects)
and the TLS certificate of each host.

## 1. The Franklin Institute (fi.edu)

| Field | Proposed value |
|---|---|
| id | `franklin-institute` |
| name | `The Franklin Institute` |
| kind | `museum` |
| domains | `["fi.edu"]` |
| hosts | `[]` |
| may_be | `["primary", "institutional"]` (a museum with no `primary_paths` is institutional at most until a person lists its record paths) |

Evidence:
- `https://fi.edu/` and `https://www.fi.edu/` answered HTTP 200 after redirecting to
  `https://fi.edu/en`, page title "The Franklin Institute | Science Museum in Philadelphia".
- TLS certificate subject `CN=fi.edu` (issuer Let's Encrypt).
- The Franklin Institute awards the Franklin Medal (a prize body as well as a museum); the cited
  page is its laureate record `https://fi.edu/en/awards/laureates/albert-einstein` (EIN-S-0009).

Why it matters: in run `einstein-2026-10-09`, 8 facts citing EIN-S-0009 (EIN-F-0011, -0012,
-0013, -0014, -0015, -0016, -0020, -0021) were disputed only because the adversary judged the
unregistered publisher institutional while the record said secondary. With the registry rule in
the adversary prompt they will be judged again; whether they verify still depends on G5.

## 2. American Institute of Physics, Niels Bohr Library & Archives (history.aip.org)

| Field | Proposed value |
|---|---|
| id | `aip-niels-bohr-library` |
| name | `American Institute of Physics, Niels Bohr Library & Archives` |
| kind | `archive` |
| domains | `[]` |
| hosts | `["history.aip.org"]` |
| may_be | `["institutional"]` (proposed without `primary`: as an archive with no `primary_paths` it would allow primary on every page; add `primary` together with record paths if wanted) |

Evidence:
- `https://history.aip.org/` answered HTTP 200, page title "Niels Bohr Library & Archives".
- `https://www.aip.org/` answered HTTP 200, page title "Homepage aip.org - AIP.ORG".
- TLS certificate of history.aip.org: subject `CN=*.aip.org` (issuer GoDaddy).
- Cited by EIN-F-0010 through EIN-S-0059 (`https://history.aip.org/exhibits/einstein/chron.htm`).

Warning (added 2026-10-09, task 10b review): the Institute for Advanced Study "Albert Einstein: In
Brief" page (`https://www.ias.edu/albert-einstein-brief`, EIN-S-0008) reproduces the AIP exhibit text
("Einstein: Image and Impact", (c) American Institute of Physics). Registering AIP would let G5 count
IAS and AIP as two independent holders for facts and quotes that are really one text (for example
EIN-F-0084, EIN-F-0085). If AIP is registered, do not cite an AIP exhibit page as corroboration for a
claim whose other evidence is an IAS page copying it.

## 3. Wüstenrot Stiftung, "Einsteinturm Revisited" (www.einsteinturm.com)

| Field | Proposed value |
|---|---|
| id | `wuestenrot-stiftung-einsteinturm` |
| name | `Wüstenrot Stiftung` |
| kind | `foundation` |
| domains | `[]` |
| hosts | `["einsteinturm.com"]` |
| may_be | `["institutional"]` |

Evidence:
- `https://www.einsteinturm.com/` answered HTTP 200, page title "Einsteinturm Revisited".
- Its imprint page `https://www.einsteinturm.com/en/imprint` (HTTP 200) names the publisher:
  "Wüstenrot Stiftung Gemeinschaft der Freunde Deutscher Eigenheimverein e.V., Hohenzollernstraße 45,
  71638 Ludwigsburg", e-mail at wuestenrot-stiftung.de.
- TLS certificate subject `CN=einsteinturm.com` (issuer Let's Encrypt); it names no organization.
- Cited by EIN-F-0043 through EIN-S-0010; that fact was disputed only on source type.

Reviewer note: this is a foundation's digital exhibition about the Einstein Tower, not the
foundation's main site (wuestenrot-stiftung.de is not proposed here, as it was not checked).

## 4. German Historical Institute Washington, "German History in Documents and Images" (germanhistorydocs.org)

| Field | Proposed value |
|---|---|
| id | `ghi-ghdi` |
| name | `German History in Documents and Images (German Historical Institute Washington)` |
| kind | `foundation` (research institute; a person may prefer another kind) |
| domains | `["germanhistorydocs.org"]` |
| hosts | `[]` |
| may_be | `["institutional"]` (it publishes transcriptions of documents held elsewhere, not original records) |

Evidence (collected 2026-10-09, task 10b):
- `https://germanhistorydocs.org/` answered HTTP 200 with no redirect; the home page has an empty `<title>`.
- The document page cited by EIN-S-0069 ends with "GHDI is an initiative of the German Historical
  Institute, Washington DC" and "(c) German Historical Institute Wash[ington]" in its footer.
- TLS certificate subject `CN=dev.germanhistorydocs.org` (issuer Let's Encrypt); it names no organization.
- The Codex adversary suggested this entry (run adv-20261009T190133-9e8d) for EIN-F-0082 and EIN-F-0083.

Reviewer note: the site states it is the GHI's project, but no page on ghi-dc.org was checked to confirm
the domain from the institute's side. Both facts are already verified without this entry (LoC is the
registered holder).

## Not proposed (could not be confirmed)

- `docsteach.org` (DocsTeach, cited by EIN-F-0045 through EIN-S-0060): plain requests get HTTP 403
  with a "Checking your browser..." page, and the TLS certificate is `CN=tls.automattic.com`, which
  shows the hosting platform, not the publisher. DocsTeach is presented as a National Archives
  education site, but that was not confirmed from the site itself, so no entry is proposed. A person
  can confirm it in a browser (the site's about page or footer) and, if it is NARA's, consider adding
  `docsteach.org` to the existing `nara` entry's hosts.
