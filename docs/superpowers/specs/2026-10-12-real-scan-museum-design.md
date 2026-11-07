# Real-scan museum and Tapestry-style experience

Date: 2026-10-12. Extends `2026-10-10-museum-journey-flow-design.md` and `2026-10-09-voices-of-arrival-design.md`; where they differ, this file wins for room visuals, the camera, highlights and the home page.

Research: `docs/research/direction/REF-tapestry-v2.md` (teardown), `B8-photoreal-rooms.md`, `B9-zero-risk-scans.md`, `B10-shm-room-scans.md`.

## What the owner asked for (2026-10-12)
- Rooms that look as real as Tapestry, built only from real scans with no legal risk.
- A hallway with portraits of all five inductees. Choosing one leads into that inductee's rooms. Hallway and rooms follow the style of Skokloster Castle's King's Hall.
- Tapestry's "drag to look around" camera, glowing numbered hotspot rings, and the home-page style: glass panels, one section per inductee, an orange **Explore** button (the journey map) and an **Info** button (the timeline).
- The Einstein study becomes a recreated period corner inside the museum, at the best quality achievable.
- Phones about 5 MB per room, computers up to 10 MB, no hosting cost.

## Spaces
- **Sources:** room scans published under CC BY 4.0 by Sweden's National Historical Museums and the Swedish National Heritage Board on their own official Sketchfab accounts. The owner downloads the original files from those pages.
- **Labels:** every space shows its real name and source, for example "3D scan of the King's Hall, Skokloster Castle, Sweden (Swedish National Historical Museums, CC BY 4.0). Not connected to Einstein." The labels never suggest the institution endorses IHH.
- **Hallway:** the Skokloster King's Hall. The five inductees' painted portraits stand on easels down the hall. Each easel is a hotspot ring; choosing one opens that inductee's journey map.
- **Inductee rooms:** Hallwyl Museum rooms in the same stately style (Dining Room, Picture Gallery, Small Drawing Room, Great Drawing Room, Billiards Room).
  - Only about five such rooms exist, so inductees share them. Each inductee gets their own camera positions and easel layout, so a shared room still reads differently.
  - Einstein's four story rooms use four different Hallwyl rooms.
- **Study corner:** a recreated "Einstein's study, 1943" period corner inside one of those rooms. It is built from openly licensed photoscanned furniture (Poly Haven CC0) and arranged only as the archival photos show. It is labelled as a recreation, with the archival photographs beside it.
- **Our exhibits:** they stand on easels and stands. They never cover the scanned rooms' own paintings.
- **Copyright check:** before any room ships, every painting visible in it is checked artist by artist (artist died 70+ years ago). A room with an in-copyright work is either cropped so the work is out of view, or not used.

## Camera ("drag to look around")
- **Movement:** the camera turns in place at a viewing station; it does not orbit.
- **Field of view:** 75° vertical on 16:9 screens. Narrower screens keep the 16:9 horizontal view, capped at 95° vertical.
- **Feel:** damping 0.08 and no zoom. Pitch is limited so the floor and ceiling stay readable.
- **Moving between stations or to a hotspot:** a 1.6-2 s glide with an ease-out curve. Reduced motion gets a short fade instead.
- **Drag hint:** a "Drag to look around" glass pill appears after narration on stations where looking around is allowed. It hides on the first drag.

## Hotspots
- **Ring:** a glowing numbered ring drawn in 3D and always facing the viewer. It stays readable at any distance (44-120 px on screen).
- **Animation:**
  - rings appear in turn, 100 ms apart;
  - they breathe ±2% over 4 s;
  - on hover a ring turns warm amber and grows 8%;
  - an active ring is lit.
- **Thumbnail rail:** a numbered rail of thumbnails along the bottom, linked both ways with the rings.
- **Choosing a hotspot:** the camera glides to the exhibit and the side panel (desktop) or bottom sheet (phone) opens. The current panel content is kept: notes, credit, exact rights wording, "See the original".
- **Narration:** the line playing lights its ring and its thumbnail.
- Rings are hidden behind walls (unlike Tapestry) so they never point through architecture.

## Home page
- **Style:** dark background with glass panels (backdrop blur, about 12-15% white fill, thin light border), Poppins (SIL Open Font License), and an orange gradient for primary actions.
- **Layout:** a hero introduction, then one section per inductee: portrait, name, one verified line, an orange **Explore** button (journey map) and a glass **Info** button (timeline of the journey stops).
- **What we don't copy:** no CyArk code, text, images, icons, logo or brand. Only the general style is reproduced.

## Quality and size
- **Source files:** original Sketchfab files at the highest resolution they carry. Colour and exposure are corrected, compression uses gltfpack/meshopt with KTX2 textures, and seams are protected when meshes are simplified.
- **Size per room:** phones about 5 MB with half-resolution textures; computers up to 10 MB with full resolution.
- **Loading:** a sharp preview first, then full detail. The next room preloads during narration.
- **Budget check:** a written limit per room and per device class: download size, GPU memory counted at compressed size, triangles, frame time. The current phone limits (2.5 MB download, 150k triangles) are raised for scanned rooms only, with these new figures written into the budget gate.

## Unchanged
Truth and rights gates, journey map with aerial zoom, doors (now between scanned rooms, labelled museum doors), story mode, Lite mode (no 3D: the archival photos and text), accessibility rules, the WordPress package.

## Out of scope for this step
Rooms for the other four inductees beyond their hallway portraits. Each needs verified facts and media first.

## Amendment 2026-10-13 (owner): one room style per inductee
- After the artwork clearance, the usable scans are the King's Hall (hallway), the Hallwyl Dining Room and the Hallwyl Great Drawing Room.
- Each inductee has one room style. Every journey stop with a room is its own room built from that same scan, with its own exhibits and stations. Einstein's rooms (Smithsonian 1921, San Diego 1930, the study at 112 Mercer Street, American citizenship) all use the Great Drawing Room.
- Doors, the journey globe and story mode work as before. They move between rooms of the same style.
- The study corner sits inside the "study at 112 Mercer Street" room.
- Other inductees get their own room style when their content is built; each style needs its own clearance.
