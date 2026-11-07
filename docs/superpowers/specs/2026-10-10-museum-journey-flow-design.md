# Museum journey flow: globe, aerial zoom, rooms with doors

Date: 2026-10-10. Extends `2026-10-09-voices-of-arrival-design.md`; where they differ, this file wins for the journey and room-to-room flow.

## What the user asked for (2026-10-10 review of the live site)
1. Clicking a pin zooms from the globe to the state, city, street and the house, like Tapestry.
2. The globe is the whole museum; each landmark pin is a room; the visitor walks room to room through the story in time order. Rooms need doors.
3. Two more rooms to show the room-to-room path: Washington, D.C., 1921 and the arrival in San Diego, 1930.
4. Choosing a landmark takes the visitor to its room, then on to the next landmark, as one continuous story, until they close it. Transitions neat, not complicated.
5. Close-up imagery: aerial photos with street-name labels (user choice).

## The model
- **Globe = museum map.** Every stop that has a room is a room in the museum. Rooms are ordered by the journey order (time order) in `content/<slug>/journey.json`.
- **A pin = a room's location.** A room whose stop has a pin is reached by flying to that pin and zooming down to the building. A room whose stop has no pin (for example "American citizenship", no single fact names its place) is reached through the previous room's exit door, with no globe trip.
- **Two doors per room.** An entrance door (where you came from) and an exit door labelled with the next room ("Next: San Diego, 1930"). The last room's exit door leads back to the globe and the ending page (quiz or another inductee).

## The visitor's path
1. On the globe, the visitor picks a pin, a stop title, or "Start the story" (begins at the first room).
2. **Zoom in (about 4 s):** the camera flies to the pin; the globe cross-fades into a stack of present-day aerial images (city, neighbourhood, street, building) aligned on the pin, with street-name labels. It ends on the building, with the archival photo of that building beside it where one exists.
3. **Enter (about 1 s):** fade through the door into the room. The room opens at its establishing view with the entrance door behind.
4. **In the room:** narration, highlights and exhibit panels as now. In story mode the narration starts on arrival, because the visitor started the story; outside story mode it waits for Play.
5. **Continue:** when the narration ends, a small card reads "Continuing to San Diego, 1930 in 5 s" with **Stay** and **Close story**. The visitor can also click the exit door at any time. Leaving plays a short walk to the exit door and a fade.
6. **Between pinned rooms:** zoom out from the building to the globe, fly along the travel arc to the next pin, zoom in (steps 2-3). Between a room and an unpinned room: door fade only.
7. **Close story** stops the sequence anywhere and leaves the visitor where they are.

## Build approach (simple, static)
- Pages stay as they are: the globe on `/<slug>/`, each room on `/<slug>/<chapter>/`. The story state lives in the URL (`?story=1&from=<stop>`). Moving between pages uses a cross-document fade (View Transitions where supported, plain fade otherwise); no single-page app.
- The globe page plays the zoom-out and zoom-in sequences; a room page plays the door entry on load and the exit walk before navigating.
- Aerial images are fetched and labelled once at build time and committed as static WebP files (no map service at runtime). Sources and licences come from the research note `docs/research/direction/B7-aerial-zoom.md`, with the credit shown on the page.
- Doors are simple framed meshes from the existing museum kit, with a clickable hotspot and a matching on-screen "Next room" button.

## Honesty rules
- Aerial images and street names are **present-day**; the page labels them "Present-day aerial view" with credit. They make no claim about how the place looked in the inductee's time.
- The building zoom ends on the address the cited fact names; the archival photo is shown only if it is verified media for that place.
- New rooms use verified facts and rights-cleared media only. A room that lacks enough verified facts is not built.

## Accessibility
- Every motion has a button equivalent: "Start the story", "Next room", "Stay", "Close story", and Skip during any transition.
- Reduced motion: no flights or walks, fades only; the story still continues room to room.
- Focus moves to the room heading on arrival; a polite announcement names the room. Esc closes the story card.
- Story mode never starts audio without a visitor action. Pressing "Start the story" counts as that action.

## Budgets
- Phone: aerial stack at most 1.5 MB per pinned stop, loaded only when that pin is chosen. Room budgets unchanged (at most 80 draw calls, 150k triangles, 4 lights, 24 MB textures, 2.5 MB download).

## Out of scope for this step
- Rooms for Ulm and Bern (no usable images yet).
- Walking freely between rooms; movement stays on rails.
