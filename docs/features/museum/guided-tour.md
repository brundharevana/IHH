# Guided tour

Five inductees, each a sequence of chapters in time order. A chapter is a map leg (where a verified fact states the journey) and then a place.

| Item | Where |
|---|---|
| Page and entry | `app/tour.html`, `app/src/tour/main.jsx`, `index.jsx` |
| One chapter (map, then place) | `app/src/tour/ChapterPlayer.jsx` |
| Chapter data per inductee | `app/src/tour/data/<slug>.js`, `chapters.js` |
| Journey map | `app/src/tour/map/` |
| On-screen controls (next, mute, fullscreen, end tour) | `app/src/tour/hud/` |
| Tour state | `app/src/tour/store.js` |

Links: `tour.html?inductee=muir`, `tour.html?inductee=einstein&chapter=big-work`, `tour.html?viewer=EIN-M-0025`.

Data rules (checked in tests and at build): chapters run forward in time, every fact is verified, a map leg needs a verified fact for that journey. See `app/src/tour/data/chapters.test.js` and `validateTour` in `chapters.js`.

Related: [places](places.md) · [guide and narration](guide-narration.md) · [end of tour](end-of-tour.md)
