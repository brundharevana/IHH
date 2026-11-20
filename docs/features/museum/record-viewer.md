# Record viewer

Opens a record (photo, document, object) a stop shows: the image, its card, its rights words, and **View at the holder** to the archive's own page.

| Item | Where |
|---|---|
| Viewer | `app/src/tour/artifact/ArtifactViewer.jsx`, pan in `pan.js` |
| Records per inductee | `app/src/tour/data/<slug>-artifacts.js`, `artifacts.js` |
| Rights text | `app/src/shared/rightsText.js` |

Direct link: `tour.html?viewer=<record id>`.

Tests: `app/src/tour/artifact/pan.test.js`, `app/src/tour/data/records.test.js`, `node e2e/viewer-fit.mjs`.

Related: [places](places.md)
