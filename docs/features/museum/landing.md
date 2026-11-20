# Landing

The museum's front page: an entrance scene, the inductee hall, and links into each tour.

| Item | Where |
|---|---|
| Page | `app/index.html`, `app/src/landing/Landing.jsx` |
| 3D scenes (doors, harbor, hall, threads) | `app/src/landing/scenes/` |
| Scroll through the inductees | `app/src/landing/InducteeScroll.jsx` |
| Guide on the landing | `app/src/landing/GuideAvatar.jsx`, `GuidePanel.jsx` |
| Inductee data (portraits, turning points) | `app/src/landing/data/` (built by `build_inductees.py`) |

Portraits are verified records only; their rights words and credit show with them.

Tests: `app/src/landing/copy.test.js`, `node e2e/landing.mjs`.

Related: [guided tour](guided-tour.md) · [moments](moments.md)
