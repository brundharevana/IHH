# Testing

| Suite | Command | Covers |
|---|---|---|
| App unit and data tests | `cd app && npm test` | Tour data rules, quiz, ticket, loaders, gates |
| Lint | `cd app && npm run lint` | ESLint |
| End to end | `node e2e/<name>.mjs` (dev server running) | Chapters, cameras, landing, moments, accessibility, HUD contrast, viewer, end of tour |
| Embed | `npm run e2e:embed` | Sandboxed iframes |
| WordPress | `npm run e2e:wordpress`, `npm run e2e:wordpress-site` | Real WordPress (Playground), desktop and phone |
| Fact pipeline | `python3 -m pytest tools -q` | Every tool and gate |
| Fact store | `python3 tools/validate.py --all` | Every record |
| Narration | `python3 -m pytest assets-src/audio -q` | Narration lines |

Accessibility: axe on every page, keyboard walk, reduced motion, phone layout (`app/e2e/a11y.mjs`).

Details: [app/README.md, End-to-end checks](../../../app/README.md#end-to-end-checks).
