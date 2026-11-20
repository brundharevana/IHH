# New inductee skill

A Claude Code skill that takes a person's name and runs the whole verified-research pipeline, ending in a handoff package for IHH's review team. It never publishes or pushes.

| Item | Where |
|---|---|
| Skill | `.claude/skills/ihh-new-inductee/SKILL.md` |
| Operating guide for every tool | `.claude/skills/ihh-verified-facts/SKILL.md` |
| Saved workflows | `.claude/workflows/ihh-inductee-pipeline.js`, `ihh-tour-research.js` |
| Handoff package builder | `tools/handoff_bundle.py` |

Run: in Claude Code, `/ihh-new-inductee <Full Name>`.

Steps: identify, IHH baseline, six search families (Library of Congress, National Archives, Smithsonian, institutional, media, domain), merge, adversary, corroborate, draft, ground, critic, package, tour research.

Rules: at least 4 s between requests to one host; a bot block closes that host for the run (never bypassed); every search is logged.

Tests: `tools/tests/test_handoff_bundle.py`.

Related: [fact pipeline](pipeline.md)
