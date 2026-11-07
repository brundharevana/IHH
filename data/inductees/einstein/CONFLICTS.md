# Albert Einstein: date conflicts and rulings

Rule (owner decision 2026-10-16): a primary record decides. Where none is found after a hard search,
the detail is not shown on the site and the conflict stays in this log. Research 2026-10-16/17
(search log EIN-Q entries of run `einstein-conflicts-2026-10-16`).

| Detail | Versions | Ruling | Deciding record | Facts |
|---|---|---|---|---|
| Purchase of 112 Mercer Street | 1935 (IAS) vs 1936 (NHL nomination form, 1975, and the NPS article that repeats it) | **open: no primary found; year not to be shown** | None read. Lead: Mercer County Clerk, Deed 2663 (recorded 1 or 2 August 1935; buyer Elsa Einstein, seller Mary Clark Marden, 24 July 1935), cited by a Wikipedia article. The county's digitized land records require registration (not created); mercercounty.org answered 403; the Daily Princetonian archive is behind a bot check; Chronicling America 1935-1936 has no purchase report. | EIN-F-0129 (1935) conflicting; EIN-F-0106 (1936) still verified on the NHL form |

Action for a person: read Deed 2663 (or the Daily Princetonian / Princeton Herald for August to
October 1935 in a browser). Until then the site should not show a purchase year:
`content/einstein/journey.json` (stop `mercer-street`, date 1936 and the line "In 1936 Albert
Einstein purchased 112 Mercer Street.") and `content/einstein/quiz.json` (question `mercer`) cite
EIN-F-0106 and were not changed in this data pass. If the deed shows Elsa Einstein as buyer, the
claim "Albert Einstein purchased" needs rewording too.
