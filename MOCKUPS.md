# Revamp 3D mockups — working contract (branch revamp/mockups)

Owner brief and decisions: ../Challenge IHH/docs/handoff/DECISIONS.md (2026-10-14 revamp entries).
Research: docs/research/revamp/. Tokens: app/src/design/tokens.css (use only these).

## Ownership (agents edit only their paths; never stash/reset/checkout others' files)
| Path | Owner |
|---|---|
| app/src/landing/**, app/index.html, app/src/App.jsx, app/src/main.jsx | Landing agent |
| app/src/tour/**, app/src/shared/guide/**, app/tour.html | Tour agent |
| assets-src/study/**, app/public/models/study/**, docs/revamp/astra-prompts/** | Study-room agent |
| app/public/models/{guide,walkers}/** | Tour agent |

## Rules
- Real 3D (R3F). Mockup = representative look + flow, not production; but no AI slop: no lorem, no generic gradients, no emoji, no stock "AI" copy.
- Visitor-facing words about an inductee come ONLY from facts with status verified in data/inductees/<slug>/facts.jsonl (quote via their text). Where none exists, show a visibly labelled slot "Story point — pending verification". Never invent.
- Every third-party asset (model, animation, texture, font) logged in app/CREDITS.md with licence + URL. CC0 / CC-BY only (no NC/ND, no Mixamo raw files).
- Node 20: `export PATH=/usr/local/bin:$PATH`. Dev server: `npm run dev` in app/.
- Phone: 360 look + hotspots. Desktop: free roam with collision bounds. prefers-reduced-motion respected. Keyboard reachable controls with labels.
