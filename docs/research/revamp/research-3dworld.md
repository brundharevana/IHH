# 3D world research for the IHH virtual museum (2026-10-14)

## 1. YouTube 6Ytluv_DiSo

- **Title:** "I Built a Whole Game Level Using Only FREE AI - My Full Workflow"
- **Channel:** Stefan 3D AI (193K subscribers). Published 2026-08-31, 31:23 long, about 116K views.
- **Description:** sponsored by Tripo 3.1 (500 free credits, promo code for the Pro plan). Promotes his paid course at learn3d.ai and the site top3d.ai. It says the workflow uses free AI tools and free software, from concept to a finished Unreal scene.
- **Chapters:** 00:00 Intro, 01:03 Concept splitting and 2D asset generation, 03:24 Creating 3D models, 05:30 Fixing and refining textures, 10:37 Colour correction, UV unwrapping and baking, 14:18 Setting up PBR materials, 15:20 Creating rocks and tiled textures, 20:15 Level assembly in Blender (pier and optimisation), 24:18 Level assembly in Blender (cave and details), 28:03 Unreal Engine setup and final result.
- **Transcript:** the full English ASR transcript (about 30K characters) was captured from the player's caption request.

**Important:** this is a game-level asset pipeline that ends in **Unreal Engine 5**. It does not cover web, R3F, scroll or camera work, or deployment. The part we can reuse is the asset pipeline. Swap the last step for a glTF export.

### The workflow, step by step (pirate-cave level)
1. **Concept image.** Make one concept image of the whole scene.
2. **Split the concept into building blocks.** Use Google AI Studio with the free Nano Banana model; Nano Banana Pro or GPT image are paid fallbacks. Cut the concept into chunks, circle the parts you want, and generate each prop as its own clean image. Generate similar small items (planks, stones) in groups. Seamless textures such as fishnet and paper are also made in Gemini. Expect to come back and generate missing pieces later.
3. **Image to 3D.** Use the Hunyuan 3D website (23 free generations a day).
   - High-poly mode for large, detailed objects such as rocks. These do not need a texture, because the detail is later baked into a normal map.
   - The "Smart Topology" lab mode gives low-poly meshes (tris or quads) for simple props.
   - Paid alternative: Tripo P2/3.1, which offers quads and better topology.
4. **Clean up in Blender.**
   - Textures with alpha (papers, fishnet) go on one plane split into parts, so all of them share one material.
5. **Fix textures.**
   - Export the bad props as GLB and fix them in **"Moondiff"**, a free AI texturing tool (name as heard in the auto-transcript, spelling unverified). Inpaint broken areas from a chosen view, or regenerate a whole side as a projected layer, then export the colour texture back to Blender.
   - For small fixes, use Blender's Texture Paint clone brush (Ctrl+click picks the source). Remember to save the edited image.
6. **Match colours and build an atlas.**
   - Correct colours with nodes between the colour texture and the BSDF (Hue/Sat, Gamma, Contrast, RGB Curves).
   - To merge several props into one material, join them and duplicate the result as "high" and "low". Repack the UVs with the free **UV-Packer** add-on, add a new image texture, then bake in Cycles: Diffuse, direct and indirect off, Selected to Active, cage on with a small extrusion. The result is one texture atlas and one material.
7. **PBR maps.** Add non-colour roughness and metallic images. Fill them, then paint values with the fill brush or a normal brush (black roughness gives a mirror finish).
8. **Large surfaces such as the cave.**
   - Build them from rock chunks rather than one tiled plane. Decimate each high-poly rock (about 1M polygons) down to about 1K.
   - Make manual UV seams, then bake a 4K normal map from the high-poly mesh (Selected to Active).
   - Generate a seamless colour and roughness texture in Gemini (the paid alternative is Patina on fal.ai). Scale it with Node Wrangler (Ctrl+T mapping node).
   - Re-bake the colour and roughness maps so the corrections are written into the textures.
   - Reuse cut rock pieces as stalactites, so they share the same texture.
9. **Assemble the level in Blender.**
   - Pin the reference image in the scene, organise objects into collections, and learn the transform hotkeys.
   - Start with pieces whose size is known (pier, ladders, hut). Use them as the scale reference, then build the large cave around them.
   - Use the knife tool to remove faces the player never sees, which saves polygons.
   - Place large objects first and small accessories last. Make simple items such as rope from Bezier curves (convert to mesh, then UV and a tiled texture) instead of generating them with AI.
10. **Engine setup (Unreal Engine 5).**
    - Import the assets, then recreate the PBR materials (the same textures are reused).
    - Use the Ultra Dynamic Sky and Ultra Dynamic Weather add-ons, plus water, point lights and VFX. Animate the floating boat and the rope with simple shader or physics animation.
    - About 2 hours of lighting, which he calls "selling" the scene. He mentions UE 5.8/5.9 MCP and Claude Code with Blender.
    - The video has **no deploy step**.

**How we would adapt it:** steps 2–9 carry over directly for a period room such as Einstein's study. Export glTF from Blender, run it through glTF-Transform (meshopt or Draco plus KTX2), and load it with drei `useGLTF`. Bake lighting into a lightmap in Blender Cycles, because the web has no Lumen. AI-generated meshes must be labelled as recreations; this matches our existing museum note.

## 2. Repos (gh API, 2026-10-14)

| Repo | Stars | Last push | Licence | Fit |
|---|---|---|---|---|
| pmndrs/react-three-fiber | 32,975 | 2026-10-14 | MIT | Core renderer |
| pmndrs/drei | 9,955 | 2026-10-05 | MIT | ScrollControls, CameraControls, useGLTF/KTX2, Html, Detailed (LOD), Bvh, PerformanceMonitor/AdaptiveDpr |
| greensock/GSAP | 29,229 | 2026-04-13 | GSAP "no charge" licence (not OSI) | ScrollTrigger scrubbing a camera timeline; free since the Webflow change |
| theatre-js/theatre | 12,767 | **2024-08-14 (stale)** | Apache-2.0 | Visual camera keyframing studio; avoid as a core dependency |
| yomotsu/camera-controls | 2,436 | 2026-10-12 | MIT | `fitToBox`/`setLookAt` smooth focus on an artifact (drei `<CameraControls>` wraps it) |
| pmndrs/postprocessing | 2,882 | 2026-10-05 | Zlib | Effects engine |
| pmndrs/react-postprocessing | 1,413 | 2026-10-12 | MIT | Bloom, DOF on the focused artifact, vignette, N8AO |
| pmndrs/react-three-rapier | 1,449 | 2026-10-12 | MIT | Physics, only needed for walk mode |
| pmndrs/ecctrl | 806 | 2026-09-06 | MIT | Character controller, if visitors can walk |
| vasturiano/globe.gl / three-globe / react-globe.gl | 3,195 / 1,637 / 1,465 | 2026-08 / 2026-10 / 2026-05 | MIT | Arcs layer plus custom objects for a ship or plane on a great-circle route; three-globe drops straight into R3F |
| visgl/deck.gl | 14,670 | 2026-10-14 | MIT | TripsLayer for animated routes on a flat map; heavy |
| maplibre/maplibre-gl-js | 11,866 | 2026-10-14 | BSD-3 | Flat-map alternative, with a three.js custom layer |
| pixiv/three-vrm | 2,218 | 2026-10-02 | MIT | VRM avatars with expression presets aa/ih/ou/ee/oh for lip-sync, lookAt, spring bones |
| met4citizen/TalkingHead | 1,606 | 2026-10-11 | MIT | Full-body talking 3D head; lip-sync from audio plus word timestamps (ElevenLabs/Azure/Google), gestures, pointing; most complete option |
| wass08/wawa-lipsync | 211 | 2025-11-07 | MIT | Real-time audio-to-viseme in the browser; small; works with any ARKit/Oculus viseme rig |
| Mugen87/yuka | 1,382 | 2026-10-04 | MIT | Steering, wander, path following and navmesh for walking NPCs |
| donmccurdy/three-pathfinding | 1,375 | 2026-10-06 | MIT | Simple navmesh pathfinding |
| isaac-mason/recast-navigation-js | 432 | 2026-07-06 | MIT | Recast/Detour WASM, crowd simulation for many agents |
| donmccurdy/glTF-Transform | 1,987 | 2026-10-13 | MIT | CLI: `optimize` with meshopt, KTX2, resize, dedup |
| pmndrs/gltfjsx | 5,879 | 2024-11-04 | MIT | GLB to JSX plus `--transform`; old but still works |
| pmndrs/zustand | 58,819 | 2026-10-14 | MIT | Tour state machine (current stop and artifact) |

**Agent and Claude skills**

| Repo | Stars | Last push | Licence | Fit |
|---|---|---|---|---|
| greensock/gsap-skills | 16,398 | 2026-07-29 | MIT | **Official** GSAP agent skills (core, timeline, ScrollTrigger, plugins). Install this |
| CloudAI-X/threejs-skills | 3,572 | 2026-07-09 | none stated | Most-starred three.js skill set; check the licence before vendoring |
| mintdotgg/mint-threejs-skills | 114 | 2026-08-01 | MIT | three.js app and game guidance, tied to Mint MCP |
| Nice-Wolf-Studio/claude-skills-threejs-ecs-ts | 32 | 2026-07-29 | MIT | three.js, ECS, TypeScript |
| cesartevisual/threejs-skills | 5 | 2026-09-10 | MIT | 24 skills including R3F and WebGPU; small and unproven |

No dedicated official R3F or drei skill exists. SKILL.md files that mention R3F appear inside aggregator repos (freshtechbro/claudedesignskills, sickn33/agentic-awesome-skills, midudev/autoskills).

**Status checks**
- **Ready Player Me:** shut down. Netflix acquired it on 2025-12-19, and the hosted creator and public API went offline on **2026-01-31**. Do not depend on it.
- **Mixamo:** still free in 2026 but in maintenance mode, and royalty-free inside a finished product. Its licence forbids redistributing the raw files, and a public GLB on a static site is arguably exposed. Prefer CC0 animations.

## 3. Recommended free stack

| Capability | Pick |
|---|---|
| Scroll entrance and inductee reveal | GSAP ScrollTrigger (scrub) driving a camera path (CatmullRom curve + `lookAt`), or drei ScrollControls; Framer Motion for the DOM overlay only |
| Camera focus on an artifact | drei `<CameraControls>` (camera-controls) with `fitToBox(mesh, true, {padding})` and restricted azimuth/polar angles; DOF from react-postprocessing |
| Map journey | three-globe in R3F: arcs layer plus a GLB ship or plane following the slerped great-circle path; or a stylised flat SVG/MapLibre map for low-end devices |
| Room you can look around | Blender-baked lightmap with an unlit or Lambert material plus a few PBR hero pieces; drei Environment (Poly Haven HDRI) |
| Interactive artifacts (letter) | Separate GLB with a hinge animation (AnimationMixer) or a GSAP tween; rotate with PresentationControls; drei `<Html>` for the transcription |
| Guide avatar | VRoid Studio (free) to VRM, then three-vrm visemes plus wawa-lipsync from the pre-rendered narration MP3; or TalkingHead with word timestamps from our VTT files. Point at artifacts with a Quaternius "point" clip plus a head lookAt |
| Ambient visitors | 3–6 low-poly Quaternius CC0 characters using the Universal Animation Library (walk/idle); yuka wander + path follow on a hand-authored loop or navmesh; InstancedMesh or SkinnedMesh with a shared skeleton clone (`SkeletonUtils.clone`) |
| Assets | Poly Haven (CC0 HDRIs, textures, some furniture); Kenney (CC0, stylised); Quaternius (CC0 characters and animations); Sketchfab only CC0 or CC-BY with credit in the credits page, no NC/ND; Smithsonian Open Access 3D (CC0, real artifacts); AI-generated meshes (Hunyuan) as in the video, labelled as recreations |

**Performance budget**
- **Per scene:** at most about 100–150K triangles, at most about 100 draw calls, at most 8–15 MB of GLB+KTX2 on mobile, and textures of 2K or less (4K only for the lightmap).
- **Compression:** glTF-Transform `optimize --compress meshopt --texture-compress ktx2` (UASTC for normals, ETC1S for colour). Set up `useGLTF` with the meshopt decoder and the KTX2 transcoder (basis files self-hosted).
- **Loading:** lazy-load each scene with `React.lazy`, Suspense and `useGLTF.preload` for the next stop only. Dispose the previous scene and keep a single Canvas.
- **Rendering:** `frameloop="demand"` when the scene is idle; drei PerformanceMonitor and AdaptiveDpr (DPR at most 1.5 on mobile); Bvh for raycasts; LOD through `<Detailed>`; one shadow-casting light or baked shadows.
- **Fallbacks:** `prefers-reduced-motion` gives a cut-based tour with no scrubbing. Low-end GPUs and no WebGL2 (detect-gpu tier 0–1) get a 2D poster-and-video tour with the same captions and narration. Respect autoplay rules (start audio on a tap).

## 4. Reference sites (at most 5)

1. **Igloo Inc** (igloo.inc), Awwwards Site of the Year 2024. Shows a scroll-scrubbed camera flying through linked 3D scenes. Model for the grand entrance and the inductee reveals.
2. **Messenger by Abeto** (2025, three.js). Shows a tiny planet with live walking characters and cel shading at a small asset size. Model for the ambient visitors.
3. **The Museum of the World** (WEIR+WONG for the British Museum and Google Cultural Institute), Awwwards SOTD. Shows a WebGL timeline you browse to reach objects, each with an audio and text card. Model for artifact storytelling.
4. **Bruno Simon folio** (bruno-simon.com; from memory, not verified in this session). Shows an explorable physics world with diegetic signposts. Model for walk mode.
5. **SBS "The Boat"** (2015, FWA/Awwwards; from memory, not verified in this session). Shows a scroll-driven graphic-novel telling of a refugee sea journey with parallax and audio. The closest narrative match for the "journey" leg.

## Sources
- https://www.youtube.com/watch?v=6Ytluv_DiSo (metadata and caption track)
- https://avatarsdk.com/blog/2026/08/31/avatar-platforms-2026-whos-alive-whos-gone/
- https://genies.com/blog/ready-player-me-shutdown
- https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me
- https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775
- https://app.cinevva.com/guides/free-character-animations-rigging
- https://quaternius.com/packs/universalanimationlibrary.html
- https://licenseorg.com/guide/3d-assets/kenney-assets
- https://awwwards.com/igloo-inc-case-study.html
- https://80.lv/articles/deliver-mail-on-tiny-colorful-planet-in-this-relaxing-web-game
- https://creativepool.com/weirandwong/projects/the-museum-of-the-world-for-google-cultural-institute/who-liked
- https://digitalstrategyforce.com/journal/why-are-immersive-experiences-dominating-the-2026-awwwards/
