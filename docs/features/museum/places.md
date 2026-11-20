# Places: rooms, photo rooms, gallery cases

Each chapter's place is one of three kinds.

| Kind | What it is | Where |
|---|---|---|
| Room | A 3D room rebuilt from photographs (glb models) | `app/src/tour/room/`, models in `app/public/models/` |
| Photo room | The photograph projected on simple shapes | `app/src/tour/place/PhotoRoomStage.jsx`, `photoProjection.js` |
| Gallery case | Records shown as an IHH gallery case | `app/src/tour/place/GalleryCaseStage.jsx`, `galleryLayout.js` |

The guide walks to a spot in the room for each stop (`app/src/tour/room/RoomGuide.jsx`, spot solver in `guideFrame.js`).

Every texture and model is declared and traced to a cleared record (`app/scripts/check_textures.py`). Sources and licences: `app/CREDITS.md`.

Tests: `app/src/tour/place/place.test.js`, `app/src/tour/room/*.test.js`, `node e2e/camcheck.mjs <slug>`.

Related: [guided tour](guided-tour.md) · [record viewer](record-viewer.md)
